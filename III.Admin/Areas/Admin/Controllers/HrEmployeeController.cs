using System;
using System.Collections.Generic;
using System.Data;
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
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using SmartBreadcrumbs.Attributes;
using Syncfusion.XlsIO;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    //[Route("Admin/HrEmployee")]
    public class HrEmployeeController : BaseController
    {
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly EIMDBContext _context;
        private readonly ILogger _logger;
        private readonly IActionLogService _actionLog;
        private readonly AppSettings _appSettings;
        private readonly IUploadService _upload;
        private static int? id_emp;
        private readonly IStringLocalizer<HrEmployeeController> _stringLocalizer;
        private readonly IStringLocalizer<FilePluginController> _stringLocalizerFp;
        private readonly IStringLocalizer<EDMSRepositoryController> _edmsRepositoryController;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IRepositoryService _repositoryService;
        private static AsyncLocker<string> objLock = new AsyncLocker<string>();

        public HrEmployeeController(EIMDBContext context, IUploadService upload, ILogger<HrEmployeeController> logger, IOptions<AppSettings> appSettings, IHostingEnvironment hostingEnvironment, IActionLogService actionLog, IStringLocalizer<HrEmployeeController> stringLocalizer,
            IStringLocalizer<FilePluginController> stringLocalizerFp,
            IStringLocalizer<EDMSRepositoryController> edmsRepositoryController, IStringLocalizer<SharedResources> sharedResources, IRepositoryService repositoryService)
        {
            _context = context;
            _upload = upload;
            _logger = logger;
            _hostingEnvironment = hostingEnvironment;
            _actionLog = actionLog;
            _appSettings = appSettings.Value;
            _stringLocalizer = stringLocalizer;
            _stringLocalizerFp = stringLocalizerFp;
            _sharedResources = sharedResources;
            _edmsRepositoryController = edmsRepositoryController;
            _repositoryService = repositoryService;
        }
        [Breadcrumb("ViewData.CrumbHrEployee", AreaName = "Admin", FromAction = "Index", FromController = typeof(EmployeeHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbEmployeeHome"] = _sharedResources["COM_CRUMB_EMPLOYEE_HOME"];
            ViewData["CrumbHrEployee"] = _sharedResources["COM_CRUMB_HR_EMPLOYEE"];
            return View("Index");
        }

        #region Index
        [HttpPost]
        public object JTable([FromBody]JTableModelCustom jTablePara)
        {
            var query = new List<HrEmployeeModelProceduce>();

            try
            {
                var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
                var fromDatePara = fromDate.HasValue ? fromDate.Value.ToString("yyyy-MM-dd") : "";
                var toDatePara = toDate.HasValue ? toDate.Value.ToString("yyyy-MM-dd") : "";
                string[] param = new string[] { "@pageNo", "@pageSize", "@Full_Name", "@Phone", "@Permanentresidence", "@Employee_Type", "@Unit", "@Position", "@Branch_Id", "@Gender", "@Employee_Id", "@Number_Of_Years", "@from_Date", "@to_Date", "@Years_Of_Work", "@Educational_Level", "@Wage", "@Status", "@Is_Working", "@CountDayEndContract" };
                object[] val = new object[] { jTablePara.CurrentPage, jTablePara.Length, jTablePara.FullName, jTablePara.Phone, jTablePara.Permanentresidence, jTablePara.EmployeeType, jTablePara.Unit, jTablePara.Position, jTablePara.BranchId, jTablePara.Gender != null ? jTablePara.Gender.ToString() : "", "", jTablePara.NumberOfYears != null ? jTablePara.NumberOfYears.ToString() : "", fromDatePara, toDatePara, jTablePara.YearsOfWork, jTablePara.EducationalLevel, jTablePara.Wage, jTablePara.Status, "", jTablePara.CountDayEndContract != null ? jTablePara.CountDayEndContract.ToString() : "" };
                DataTable rs = _repositoryService.GetDataTableProcedureSql("P_GET_LIST_HR_EMPLOYEE", param, val);
                query = CommonUtil.ConvertDataTable<HrEmployeeModelProceduce>(rs);
                var count = query.FirstOrDefault().TotalRow;
                var jdata = JTableHelper.JObjectTable(query, jTablePara.Draw, count, "Id", "NewDepartment", "StatusCode", "FullName", "Gender", "PermanenTresidence", "EmployeeType", "Status", "Picture", "BirthOfPlace", "Unit", "UnitName", "Position", "UnitName", "PositionName", "EndTimeContract", "EndTime", "EmployeeCode", "PayTitle", "CountNotWorking", "CountWorking", "TotalRow", "Ord", "Color");
                return Json(jdata);
            }
            catch (Exception ex)
            {
                var jdata = JTableHelper.JObjectTable(query, jTablePara.Draw, 0, "Id", "NewDepartment", "FullName", "StatusCode", "Gender", "PermanenTresidence", "EmployeeType", "Status", "Picture", "BirthOfPlace", "Unit", "UnitName", "Position", "UnitName", "PositionName", "EndTimeContract", "EndTime", "EmployeeCode", "PayTitle", "CountNotWorking", "CountWorking", "TotalRow", "Ord", "Color");
                return Json(jdata);
            }
        }

        [HttpGet]
        public JsonResult GetCountEmployee()
        {
            var data = _context.HREmployees.Where(x => x.flag == 1).Count();
            return Json(data);
        }

        [HttpPost]
        public object Gettreedataunit()
        {
            var msg = new JMessage { Error = true };

            try
            {
                var data = _context.AdDepartments.Where(x => !x.IsDeleted && x.IsEnabled).OrderBy(x => x.DepartmentId);
                msg.Object = data;
                msg.Error = false;
            }
            catch (Exception ex)
            {
                msg.Object = ex.Message;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }

            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetDepartment()
        {
            var msg = new JMessage { Error = false };
            try
            {
                var data = _context.AdDepartments.Where(x => !x.IsDeleted && x.IsEnabled).OrderBy(x => x.DepartmentCode);
                msg.Object = data;
            }
            catch (Exception ex)
            {
                msg.Error = true;
            }
            return Json(msg);
        }

        [HttpPost]
        public object GetEmployeeType()
        {
            return _context.CommonSettings.Where(x => x.IsDeleted == false && x.Group == EnumHelper<EmployeeEnum>.GetDisplayValue(EmployeeEnum.EmployeeType)).Select(x => new { Code = x.CodeSet, Name = x.ValueSet }).AsNoTracking();
        }

        [HttpPost]
        public object GetEmployeeGroup()
        {
            return _context.CommonSettings.Where(x => x.IsDeleted == false && x.Group == EnumHelper<EmployeeEnum>.GetDisplayValue(EmployeeEnum.EmployeeGroup)).Select(x => new { Code = x.CodeSet, Name = x.ValueSet }).AsNoTracking();
        }

        [HttpPost]
        public object GetEmployeeStyle()
        {
            return _context.CommonSettings.Where(x => x.IsDeleted == false && x.Group == EnumHelper<EmployeeEnum>.GetDisplayValue(EmployeeEnum.EmployeeStyle)).Select(x => new { Code = x.CodeSet, Name = x.ValueSet }).AsNoTracking();
        }

        [HttpGet]
        public JsonResult GetItem(int? id)
        {
            var session = HttpContext.Session;
            if (id == null || id < 0)
            {
                return Json("");
            }
            session.SetInt32("IdObject", id.Value);
            var data = _context.HREmployees.AsNoTracking().Single(m => m.Id == id);
            data.identitycarddateView = data.identitycarddate != null ? data.identitycarddate.Value.ToString("dd/MM/yyyy") : "";
            data.birthdayView = data.birthday != null ? data.birthday.Value.ToString("dd/MM/yyyy") : "";
            data.socialinsurancedateText = data.socialinsurancedate != null ? data.socialinsurancedate.Value.ToString("dd/MM/yyyy") : "";

            if (!string.IsNullOrEmpty(data.payRange))
            {
                var lastContract = _context.HRContracts.LastOrDefault(x => x.flag == 1 && x.Employee_Id == data.Id) != null ? _context.HRContracts.LastOrDefault(x => x.flag == 1 && x.Employee_Id == data.Id).Salary : 0;
                data.payRange = lastContract.ToString();
            }
            if (!string.IsNullOrEmpty(data.payScale))
            {
                var payScale = _context.HRContracts.LastOrDefault(x => x.flag == 1 && x.Employee_Id == data.Id) != null ? _context.HRContracts.LastOrDefault(x => x.flag == 1 && x.Employee_Id == data.Id).PayScale : "";
                data.payScale = payScale;
            }

            id_emp = id;
            return Json(data);
        }

        [HttpPost]
        public object GetPosition()
        {
            var query = _context.Roles.Where(x => x.Status == true).Select(x => new { x.Title, Code = x.Id }).AsParallel();
            return query;
        }

        [HttpGet]
        public object SetEmployeeId(int id)
        {
            id_emp = id;
            return null;
        }

        [HttpPost]
        public object UploadImage(IFormFile fileUpload)
        {
            var msg = new JMessage { Error = false };
            try
            {
                var upload = _upload.UploadImage(fileUpload);
                msg.Title = "";
                msg.Object = upload.Object;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = String.Format(_sharedResources["COM_ERR_UPLOAD_FILE"]);
            }
            return Json(msg);
        }

        [HttpPost]
        [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
        [RequestSizeLimit(long.MaxValue)]
        public object UploadFile(IFormFile fileUpload)
        {
            var msg = new JMessage();
            try
            {
                var upload = _upload.UploadFile(fileUpload, Path.Combine(_hostingEnvironment.WebRootPath, "uploads\\files"));
                msg.Error = false;
                msg.Title = "";
                msg.Object = upload.Object;
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_ERR_UPLOAD_FILE"]);
                msg.Object = ex;
                return Json(msg);
            }
        }
        [HttpPost]
        public async Task<object> Insert([FromBody]HREmployee obj1)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            using (await objLock.LockAsync(obj1.identitycard))
            {
                try
                {
                    var employeeCode = _context.HREmployees.Any() ? (_context.HREmployees.Max(x => x.Id) + 1).ToString() : "1";
                    var check = _context.HREmployees.FirstOrDefault(x => x.identitycard.Equals(obj1.identitycard) && x.flag == 1);
                    if (check == null)
                    {
                        var lstStatus = new List<JsonStatus>();
                        obj1.create_by = User.Identity.Name;
                        obj1.createtime = DateTime.Now;
                        obj1.employee_code = employeeCode;
                        obj1.flag = 1;
                        obj1.socialinsurancedate = !string.IsNullOrEmpty(obj1.socialinsurancedateText) ? DateTime.ParseExact(obj1.socialinsurancedateText, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                        obj1.birthday = !string.IsNullOrEmpty(obj1.birthdayView) ? DateTime.ParseExact(obj1.birthdayView, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                        obj1.identitycarddate = !string.IsNullOrEmpty(obj1.identitycarddateView) ? DateTime.ParseExact(obj1.identitycarddateView, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                        if (!string.IsNullOrEmpty(obj1.status))
                        {
                            var logStatus = new JsonLog
                            {
                                CreatedBy = ESEIM.AppContext.UserName,
                                CreatedTime = DateTime.Now,
                                Code = obj1.status,
                                Name = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(obj1.status)).ValueSet ?? ""
                            };
                            obj1.ListStatus.Add(logStatus);
                        }

                        _context.HREmployees.Add(obj1);
                        _context.SaveChanges();
                        msg.Object = obj1.Id;
                        id_emp = obj1.Id;
                        msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["HR_HR_MAN_MSG_EMPLOYEE"]);
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = String.Format(_sharedResources["COM_MSG_EXITS"], _stringLocalizer["HR_HR_MAN_CURD_LBL_HR_MAN_PASSPORT"]);
                    }
                }
                catch (Exception ex)
                {
                    msg.Object = ex.Message;
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_ERR_ADD"]);
                }
            }
            return Json(msg);
        }

        [HttpPost]
        public object Update([FromBody]HREmployee obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var rs = _context.HREmployees.FirstOrDefault(x => x.Id == obj.Id);

                if (rs != null)
                {
                    if (obj.identitycard != rs.identitycard)
                    {
                        var checkExist = _context.HREmployees.FirstOrDefault(x => x.identification == obj.identitycard && x.flag == 1);
                        if (checkExist != null)
                        {
                            msg.Error = true;
                            msg.Title = String.Format(_sharedResources["COM_MSG_EXITS"], _stringLocalizer["HR_HR_MAN_CURD_LBL_HR_MAN_PASSPORT"]);
                            return Json(msg);
                        }
                    }
                    rs.Id = obj.Id;
                    rs.fullname = obj.fullname;
                    rs.nickname = obj.nickname;
                    rs.years_of_exp = obj.years_of_exp;
                    rs.gender = obj.gender;
                    rs.nation = obj.nation;
                    rs.religion = obj.religion;
                    rs.birthday = !string.IsNullOrEmpty(obj.birthdayView) ? DateTime.ParseExact(obj.birthdayView, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

                    rs.birthofplace = obj.birthofplace;
                    rs.permanentresidence = obj.permanentresidence;
                    rs.phone = obj.phone;
                    rs.factiondate = obj.factiondate;
                    rs.educationallevel = obj.educationallevel;

                    rs.languagelevel = obj.languagelevel;
                    rs.health = obj.health;
                    rs.identitycard = obj.identitycard;
                    rs.identitycarddate = !string.IsNullOrEmpty(obj.identitycarddateView) ? DateTime.ParseExact(obj.identitycarddateView, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                    rs.identitycardplace = obj.identitycardplace;


                    rs.socialinsurance = obj.socialinsurance;
                    rs.socialinsurancedate = !string.IsNullOrEmpty(obj.socialinsurancedateText) ? DateTime.ParseExact(obj.socialinsurancedateText, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                    rs.socialinsuranceplace = obj.socialinsuranceplace;
                    rs.identification = obj.identification;
                    rs.unit = obj.unit;

                    rs.wage = obj.wage;
                    rs.salarytype = obj.salarytype;
                    rs.salarygroup = obj.salarygroup;
                    rs.salaryfactor = obj.salaryfactor;
                    rs.trainingschool = obj.trainingschool;

                    rs.trainingtime = obj.trainingtime;
                    rs.trainingtype = obj.trainingtype;
                    rs.disciplines = obj.disciplines;
                    rs.specialized = obj.specialized;
                    rs.taxcode = obj.taxcode;


                    rs.position = obj.position;
                    rs.employeekind = obj.employeekind;
                    rs.emailuser = obj.emailuser;
                    rs.emailpassword = obj.emailpassword;
                    rs.nationlaty = obj.nationlaty;

                    rs.employeetype = obj.employeetype;
                    rs.bank = obj.bank;
                    rs.accountholder = obj.accountholder;
                    rs.accountopenplace = obj.accountopenplace;
                    rs.accountnumber = obj.accountnumber;

                    rs.maritalstatus = obj.maritalstatus;
                    rs.computerskill = obj.computerskill;
                    rs.employeegroup = obj.employeegroup;
                    rs.language = obj.language;
                    rs.picture = obj.picture;
                    rs.updatetime = DateTime.Now;
                    rs.updated_by = User.Identity.Name;
                    rs.ShiftList = obj.ShiftList;

                    //New design from KTV
                    rs.payCareer = obj.payCareer;
                    rs.payCertificate = obj.payCertificate;
                    rs.payCoef = obj.payCoef;
                    rs.payMajor = obj.payMajor;
                    rs.payRange = obj.payRange;
                    rs.payScale = obj.payScale;
                    rs.payTitle = obj.payTitle;
                    rs.insuranceBookNumber = obj.insuranceBookNumber;
                    rs.salaryBookNumber = obj.salaryBookNumber;

                    //Payment Qr Code
                    rs.QrCodePayment = obj.QrCodePayment;

                    //order
                    rs.order = obj.order;
                    //Log status
                    if (rs.ListStatus.Count > 0)
                    {
                        var lastStatus = rs.ListStatus[rs.ListStatus.Count - 1];
                        if (lastStatus.Code != obj.status)
                        {
                            var logStatus = new JsonLog
                            {
                                CreatedBy = ESEIM.AppContext.UserName,
                                CreatedTime = DateTime.Now,
                                Code = obj.status,
                                Name = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(obj.status)).ValueSet ?? ""
                            };
                            rs.ListStatus.Add(logStatus);
                        }
                    }
                    else
                    {
                        var logStatus = new JsonLog
                        {
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now,
                            Code = obj.status,
                            Name = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(obj.status)).ValueSet ?? ""
                        };
                        rs.ListStatus.Add(logStatus);
                    }

                    //Update shift of user
                    var user = _context.Users.FirstOrDefault(x => x.Active && x.EmployeeCode == rs.Id.ToString());
                    if (user != null)
                    {
                        user.ShiftList = obj.ShiftList;
                        _context.Users.Update(user);
                    }

                    _context.HREmployees.Update(rs);
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_UPDATE_SUCCESS"]);
                }
                else
                {
                    msg.Title = String.Format(_sharedResources["COM_MSG_ERR_RETRY"]);
                    msg.Error = true;
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = String.Format(_sharedResources["COM_UPDATE_FAIL"]);
            }
            return Json(msg);
        }

        [HttpPost]
        public object Delete(int id)
        {
            var msg = new JMessage { Error = false };
            try
            {
                var data = _context.HREmployees.FirstOrDefault(x => x.Id == id);
                data.flag = 0;
                _context.HREmployees.Update(data);
                _context.SaveChanges();
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer["HR_HR_MAN_MSG_EMPLOYEE"]);
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(_sharedResources["COM_ERR_DELETE"]);
                return Json(msg);
            }
        }
        [HttpPost]
        public object DeleteItems([FromBody]List<int> listIdI)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                foreach (var id in listIdI)
                {
                    HREmployee obj = _context.HREmployees.FirstOrDefault(x => x.Id == id);
                    if (obj != null)
                    {
                        obj.flag = 0;
                        _context.HREmployees.Update(obj);
                        _context.SaveChanges();
                    }
                }
                msg.Title = String.Format(_stringLocalizer["MSG_DELETE_LIST_FAIL"], _stringLocalizer["HR_HR_MAN_MSG_CATEGORY"]);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(_sharedResources["COM_ERR_DELETE"]);
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetStatusEmployee()
        {
            var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals("EMPLOYEE_STATUS"))
                        .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });

            //var listGroupStatus = _context.CommonSettings.Where(x => !x.IsDeleted &&
            //    x.Group == EnumHelper<EmployeeEnum>.GetDisplayValue(EmployeeEnum.EmployeeGroupNotWork))
            //    .Select(x => new { Code = x.CodeSet, Name = x.ValueSet }).ToList();

            //var statusNotWork = _context.CommonSettings.Where(x => !x.IsDeleted && listGroupStatus.Any(p => p.Code.Equals(x.Group)))
            //            .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            //var rs = data.Union(statusNotWork);

            return Json(data);
        }

        [HttpGet]
        public JsonResult GetLogStatusEmployee(int id)
        {
            var data = _context.HREmployees.FirstOrDefault(x => x.Id == id);
            var lstView = new List<ViewStatus>();
            if (data != null)
            {
                if (!string.IsNullOrEmpty(data.status))
                {
                    var lstStatus = data.ListStatus;
                    foreach (var item in lstStatus)
                    {
                        var user = _context.Users.FirstOrDefault(x => x.UserName.Equals(item.CreatedBy));
                        var viewStatus = new ViewStatus
                        {
                            Status = item.Name,
                            UpdatedBy = user != null ? user.GivenName : "",
                            UpdatedTime = item.CreatedTime.ToString("HH:mm dd/MM/yyyy")
                        };
                        lstView.Add(viewStatus);
                    }
                }
            }
            return Json(lstView);
        }

        public class JsonStatus
        {
            public string StatusCode { get; set; }
            public string StatusValue { get; set; }
            public string UpdatedBy { get; set; }
            public DateTime UpdatedTime { get; set; }
        }
        public class ViewStatus
        {
            public string Status { get; set; }
            public string UpdatedBy { get; set; }
            public string UpdatedTime { get; set; }
        }
        #endregion

        #region Nghề nghiệp, Chức danh, Chuyên môn, Bằng cấp
        [HttpPost]
        public JsonResult GetListPayCareer()
        {
            var data = _context.CategoryCareers.Where(x => !x.IsDeleted)
                                              .Select(x => new { Code = x.CareerCode, Name = x.CareerName }).DistinctBy(x => x.Code);
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetListPayTitle()
        {
            var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.PayTitle))
                                              .Select(x => new { Code = x.CodeSet, Name = x.ValueSet }).DistinctBy(x => x.Code);
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetListPayCertificate()
        {
            var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.PayCertificate))
                                              .Select(x => new { Code = x.CodeSet, Name = x.ValueSet }).DistinctBy(x => x.Code);
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetListPayMajor()
        {
            var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.PayMajor))
                                              .Select(x => new { Code = x.CodeSet, Name = x.ValueSet }).DistinctBy(x => x.Code);
            return Json(data);
        }
        #endregion

        #region Address
        public class Address
        {

            public int id { get; set; }
            public string Permanent_Address { get; set; }


            public string Now_Address { get; set; }


            public string Phone { get; set; }
            public string Start_Time { get; set; }
            public string End_Time { get; set; }
            public int Employee_Id { get; set; }
            public DateTime? Created_Time { get; set; }
            public DateTime? Updated_Time { get; set; }

            public int? flag { get; set; }


            public string Created_By { get; set; }


            public string Updated_By { get; set; }
        }
        [HttpPost]
        public object JTableAddress([FromBody]JTableModelCustom jTablePara)
        {

            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.HRAddress
                        where a.flag == 1 && a.Employee_Id == jTablePara.EmployeeId
                        select new
                        {
                            id_dc = a.id,
                            Permanent_Address = a.Permanent_Address,
                            Now_Address = a.Now_Address,
                            Start_Time = a.Start_Time,
                            End_Time = a.End_Time,
                            Phone = a.Phone

                        };
            var count = query.Count();
            var data = query
                .OrderUsingSortExpression("id_dc").Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "id_dc", "Phone", "Permanent_Address", "Now_Address", "Start_Time", "End_Time");
            return Json(jdata);
        }

        [HttpGet]
        public object GetitemAddress(int id)
        {
            try
            {
                var data = _context.HRAddress.SingleOrDefault(x => x.id == id);
                return data;
            }
            catch (Exception ex)
            {
                return Json(new JMessage() { Error = true, Title = String.Format(_sharedResources["MSG_LOAD_FAIL"], _sharedResources["USER_USERNAME"].Value.ToLower()), Object = ex });
            }
        }

        [HttpPost]
        public JsonResult InsertAddress([FromBody]Address obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var obj1 = new HRAddress();
                obj1.Permanent_Address = obj.Permanent_Address;
                obj1.Now_Address = obj.Now_Address;
                obj1.End_Time = string.IsNullOrEmpty(obj.End_Time) ? (DateTime?)null : DateTime.ParseExact(obj.End_Time, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                obj1.Start_Time = string.IsNullOrEmpty(obj.Start_Time) ? (DateTime?)null : DateTime.ParseExact(obj.Start_Time, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                obj1.Phone = obj.Phone;
                obj1.flag = 1;
                obj1.Created_Time = DateTime.Now;
                obj1.Employee_Id = id_emp;
                _context.HRAddress.Add(obj1);
                _context.SaveChanges();
                msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["HR_HR_MAN_MSG_ADDRESS"]);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = String.Format(_sharedResources["COM_ERR_ADD"]);
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateAddress([FromBody]Address obj)
        {

            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var rs = _context.HRAddress.FirstOrDefault(x => x.id == obj.id);
                if (rs != null)
                {
                    rs.Now_Address = obj.Now_Address;
                    rs.Phone = obj.Phone;
                    rs.End_Time = string.IsNullOrEmpty(obj.End_Time) ? (DateTime?)null : DateTime.ParseExact(obj.End_Time, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                    rs.Start_Time = string.IsNullOrEmpty(obj.Start_Time) ? (DateTime?)null : DateTime.ParseExact(obj.Start_Time, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                    obj.Updated_Time = DateTime.Now;
                    _context.HRAddress.Update(rs);
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["HR_HR_MAN_MSG_ADDRESS"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = String.Format(_sharedResources["COM_UPDATE_FAIL"]);
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult DeleteAddress(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.HRAddress.FirstOrDefault(x => x.id == id);
                data.flag = 0;
                _context.HRAddress.Remove(data);
                _context.SaveChanges();
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer["HR_HR_MAN_MSG_ADDRESS"]);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = String.Format(_sharedResources["COM_ERR_DELETE"]);
            }
            return Json(msg);

        }
        #endregion

        #region Contact
        public class Contact
        {
            public int? id { get; set; }
            public string Name { get; set; }

            public string Relationship { get; set; }


            public string Address { get; set; }


            public string Phone { get; set; }


            public string Job_Name { get; set; }


            public string Fax { get; set; }

            public string Email { get; set; }


            public string Note { get; set; }

            public string Birthday { get; set; }
        }
        [HttpPost]
        public object JTableLH([FromBody]JTableModelCustom jTablePara)
        {

            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.HRContacts
                        where a.flag == 1 && a.Employee_Id == jTablePara.EmployeeId
                        select new
                        {
                            id_lh = a.id,
                            Name = a.Name,
                            Relationship = a.Relationship,
                            Address = a.Address,
                            Phone1 = a.Phone

                        };
            var count = query.Count();
            var data = query
                .OrderUsingSortExpression("id_lh").Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "id_lh", "Name", "Relationship", "Address", "Phone1");
            return Json(jdata);
        }

        [HttpGet]
        public object GetitemLH(int id)
        {
            try
            {
                var data = _context.HRContacts.FirstOrDefault(x => x.id == id);
                return Json(data);
            }
            catch (Exception ex)
            {
                return Json(new JMessage() { Error = true, Title = String.Format(_stringLocalizer["MSG_LOAD_FAIL"], _stringLocalizer["USER_USERNAME"].Value.ToLower()), Object = ex });
            }
        }
        [HttpPost]
        public JsonResult InsertLH([FromBody]Contact obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var obj1 = new HRContact();
                obj1.Name = obj.Name;
                obj1.Relationship = obj.Relationship;
                obj1.Address = obj.Address;
                obj1.Birthday = string.IsNullOrEmpty(obj.Birthday) ? (DateTime?)null : DateTime.ParseExact(obj.Birthday, "dd/MM/yyyy", CultureInfo.InvariantCulture);

                obj1.Phone = obj.Phone;
                obj1.Job_Name = obj.Job_Name;
                obj1.Fax = obj.Fax;
                obj1.Email = obj.Email;
                obj1.Note = obj.Note;
                obj1.flag = 1;
                obj1.Created_Time = DateTime.Now;
                obj1.Employee_Id = id_emp;
                _context.HRContacts.Add(obj1);
                _context.SaveChanges();
                msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["HR_HR_MAN_MSG_CONTACT"]);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = String.Format(_sharedResources["COM_ERR_ADD"]);
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult UpdateLH([FromBody]Contact obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var rs = _context.HRContacts.SingleOrDefault(x => x.id == obj.id);
                if (rs != null)
                {
                    rs.Name = obj.Name;
                    rs.Phone = obj.Phone;
                    rs.Relationship = obj.Relationship;
                    rs.Updated_Time = DateTime.Now;
                    rs.Address = obj.Address;
                    rs.Job_Name = obj.Job_Name;
                    rs.Fax = obj.Fax;
                    rs.Email = obj.Email;
                    rs.Note = obj.Note;
                    rs.Birthday = string.IsNullOrEmpty(obj.Birthday) ? (DateTime?)null : DateTime.ParseExact(obj.Birthday, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                    _context.HRContacts.Update(rs);
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["HR_HR_MAN_MSG_CONTACT"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"]);
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult DeleteLH(int id)
        {
            var msg = new JMessage { Error = false };
            try
            {
                var data = _context.HRContacts.FirstOrDefault(x => x.id == id);
                _context.HRContacts.Remove(data);
                _context.SaveChanges();
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer["HR_HR_MAN_MSG_CONTACT"]);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = String.Format(_sharedResources["COM_ERR_DELETE"]);
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult DeleteItemsLH([FromBody]List<int> listIdI)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                foreach (var id in listIdI)
                {
                    var obj = _context.HRContacts.FirstOrDefault(x => x.id == id);
                    if (obj != null)
                    {
                        _context.HRContacts.Remove(obj);
                        _context.SaveChanges();
                    }
                }
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer["HR_HR_MAN_MSG_CONTACT"]);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = String.Format(_sharedResources["COM_ERR_DELETE"]);
            }
            return Json(msg);
        }
        #endregion

        #region Work progress
        public class working_process
        {
            public int id_qt { get; set; }
            //public int Employee_Id { get; set; }
            public string Start_Time1 { get; set; }
            public string End_Date1 { get; set; }
            public string Description1 { get; set; }
            public string Wage_Level { get; set; }
            public double? Salary_Ratio { get; set; }
            //public DateTime? Created_Time { get; set; }
            //public DateTime? Updated_Time { get; set; }
            public int? flag { get; set; }
        }
        [HttpPost]
        public object JTableQTLV([FromBody]JTableModelCustom jTablePara)
        {

            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.HRWorkingProcesss
                        where a.flag == 1 && a.Employee_Id == jTablePara.EmployeeId
                        select new
                        {
                            id_qt = a.id,
                            Start_Time1 = a.Start_Time,
                            End_Date1 = a.End_Date.HasValue ? a.End_Date.Value.ToString("dd/MM/yyyy") : "Đến nay",
                            Wage_Level = a.Wage_Level,
                            Salary_Ratio = a.Salary_Ratio

                        };
            var count = query.Count();
            var data = query
                .OrderUsingSortExpression("id_qt").Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "id_qt", "Start_Time1", "End_Date1", "Wage_Level", "Salary_Ratio");
            return Json(jdata);
        }
        [HttpPost]
        public JsonResult InsertQTLV([FromBody]working_process obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                HRWorkingProcess obj1 = new HRWorkingProcess();
                obj1.Start_Time = string.IsNullOrEmpty(obj.Start_Time1) ? (DateTime?)null : DateTime.ParseExact(obj.Start_Time1, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                obj1.End_Date = string.IsNullOrEmpty(obj.End_Date1) ? (DateTime?)null : DateTime.ParseExact(obj.End_Date1, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                obj1.Description = obj.Description1;
                //   obj1.Birthday = Convert.ToDateTime(obj.Birthday);
                obj1.Wage_Level = obj.Wage_Level;
                obj1.Salary_Ratio = obj.Salary_Ratio;
                obj1.flag = 1;
                obj1.Created_Time = DateTime.Now;
                obj1.Employee_Id = id_emp;
                _context.HRWorkingProcesss.Add(obj1);
                _context.SaveChanges();
                msg.Title = String.Format(_sharedResources["COM_ADD_SUCCESS"]);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = String.Format(_sharedResources["COM_ERR_ADD"]);
            }
            return Json(msg);
        }
        [HttpPost]
        public object DeleteQTLV(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.HRWorkingProcesss.FirstOrDefault(x => x.id == id);
                data.flag = 0;
                _context.HRWorkingProcesss.Update(data);
                _context.SaveChanges();
                msg.Title = String.Format(_sharedResources["COM_DELETE_SUCCESS"]);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = String.Format(_sharedResources["COM_ERR_DELETE"]);
            }
            return Json(msg);
        }
        [HttpPost]
        public object DeleteItemsQTLV([FromBody]List<int> listIdI)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                foreach (var id in listIdI)
                {
                    HRWorkingProcess obj = _context.HRWorkingProcesss.FirstOrDefault(x => x.id == id);
                    if (obj != null)
                    {
                        obj.flag = 0;
                        _context.HRWorkingProcesss.Update(obj);
                        _context.SaveChanges();
                    }
                }
                msg.Title = String.Format(_sharedResources["COM_DELETE_SUCCESS"]);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(_stringLocalizer["MSG_DELETE_LIST_FAIL"], _stringLocalizer["RESOURCE"]);
                //_logger.LogError(LoggingEvents.LogDb, "Delete list Resource fail");
                //_actionLog.InsertActionLogDeleteItem("AdResource", "An error occurred while Delete list Resource", null, null, "Error");

            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateQTLV([FromBody]working_process obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var rs = _context.HRWorkingProcesss.SingleOrDefault(x => x.id == obj.id_qt);
                if (rs != null)
                {
                    rs.id = obj.id_qt;
                    rs.Start_Time = string.IsNullOrEmpty(obj.Start_Time1) ? (DateTime?)null : DateTime.ParseExact(obj.Start_Time1, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                    rs.End_Date = string.IsNullOrEmpty(obj.End_Date1) ? (DateTime?)null : DateTime.ParseExact(obj.End_Date1, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                    rs.Description = obj.Description1;
                    rs.Updated_Time = DateTime.Now;
                    rs.Wage_Level = obj.Wage_Level;
                    rs.Salary_Ratio = obj.Salary_Ratio;
                    _context.HRWorkingProcesss.Update(rs);
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_UPDATE_SUCCESS"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(_sharedResources["COM_UPDATE_FAIL"]);
            }
            return Json(msg);
        }

        [HttpGet]
        public object GetitemQTLV(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.HRWorkingProcesss.FirstOrDefault(x => x.id == id);
                if (data != null)
                {
                    var model = new working_process
                    {
                        id_qt = data.id,
                        Start_Time1 = data.Start_Time.HasValue ? data.Start_Time.Value.ToString("dd/MM/yyyy") : null,
                        End_Date1 = data.End_Date.HasValue ? data.End_Date.Value.ToString("dd/MM/yyyy") : null,
                        Wage_Level = data.Wage_Level,
                        Salary_Ratio = data.Salary_Ratio,
                        Description1 = data.Description,
                    };
                    msg.Object = model;
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = String.Format(_sharedResources["COM_UPDATE_FAIL"]);
            }
            return Json(msg);
        }
        #endregion

        #region Workflow
        public class workflows
        {
            public int id_cv { get; set; }
            public string Working_Process { get; set; }
            public int Employee_Id { get; set; }

            public string Description2 { get; set; }

            public string Name_Job { get; set; }

            public string Info_Details { get; set; }

            public string Created_By { get; set; }

            public string Updated_By { get; set; }
            public DateTime? Created_Time { get; set; }
            public DateTime? Updated_Time { get; set; }

            public int? flag { get; set; }
        }
        [HttpPost]
        public object JTableQTCV([FromBody]JTableModelCustom jTablePara)
        {

            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.HRWorkFlows
                        where a.flag == 1 && a.Employee_Id == jTablePara.EmployeeId
                        select new
                        {
                            id_cv = a.id,
                            Name_Job = a.Name_Job,
                            Working_Process = a.Working_Process,

                        };
            var count = query.Count();
            var data = query
                .OrderUsingSortExpression("id_cv").Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "id_cv", "Name_Job", "Working_Process");
            return Json(jdata);
        }
        [HttpPost]
        public JsonResult InsertQTCV([FromBody]workflows obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                HRWorkFlows obj1 = new HRWorkFlows();
                obj1.Working_Process = obj.Working_Process;
                obj1.Name_Job = obj.Name_Job;
                obj1.Description = obj.Description2;
                //   obj1.Birthday = Convert.ToDateTime(obj.Birthday);
                obj1.Info_Details = obj.Info_Details;

                obj1.flag = 1;
                obj1.Created_Time = DateTime.Now;
                obj1.Employee_Id = id_emp;
                _context.HRWorkFlows.Add(obj1);
                _context.SaveChanges();
                msg.Title = String.Format(_sharedResources["COM_ADD_SUCCESS"]);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(_sharedResources["COM_ERR_ADD"]);
            }
            return Json(msg);
        }
        [HttpPost]
        public object DeleteQTCV(int id)
        {
            var msg = new JMessage { Error = false };
            try
            {
                var data = _context.HRWorkFlows.FirstOrDefault(x => x.id == id);
                data.flag = 0;
                _context.HRWorkFlows.Update(data);
                _context.SaveChanges();
                msg.Title = String.Format(_sharedResources["COM_DELETE_SUCCESS"]);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = String.Format(_sharedResources["COM_ERR_DELETE"]);
            }
            return Json(msg);
        }
        [HttpPost]
        public object DeleteItemsQTCV([FromBody]List<int> listIdI)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                foreach (var id in listIdI)
                {
                    HRWorkFlows obj = _context.HRWorkFlows.FirstOrDefault(x => x.id == id);
                    if (obj != null)
                    {
                        obj.flag = 0;
                        _context.HRWorkFlows.Update(obj);
                        _context.SaveChanges();
                    }
                }
                msg.Title = String.Format(_sharedResources["COM_DELETE_SUCCESS"]);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(_stringLocalizer["MSG_DELETE_LIST_FAIL"], _stringLocalizer["RESOURCE"]);
                //_logger.LogError(LoggingEvents.LogDb, "Delete list Resource fail");
                //_actionLog.InsertActionLogDeleteItem("AdResource", "An error occurred while Delete list Resource", null, null, "Error");

            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult UpdateQTCV([FromBody]workflows obj)
        {
            var msg = new JMessage() { Error = true };
            try
            {
                var rs = _context.HRWorkFlows.SingleOrDefault(x => x.id == obj.id_cv);
                if (rs != null)
                {
                    rs.id = obj.id_cv;
                    rs.Working_Process = obj.Working_Process;
                    rs.Name_Job = obj.Name_Job;
                    rs.Description = obj.Description2;
                    rs.Updated_Time = DateTime.Now;
                    rs.Info_Details = obj.Info_Details;

                    _context.HRWorkFlows.Update(rs);

                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_UPDATE_SUCCESS"]);
                    msg.Error = false;

                }
            }
            catch (Exception ex)
            {
                msg.Object = ex;
                msg.Title = String.Format(_sharedResources["COM_UPDATE_FAIL"]);

            }
            return Json(msg);
        }
        [HttpGet]
        public object GetitemQTCV(int id)
        {
            try
            {
                var booking = _context.HRWorkFlows.SingleOrDefault(x => x.id == id);
                var query = from a in _context.HRWorkFlows
                            join b in _context.HREmployees.Where(x => x.flag != 0)
                          on a.Employee_Id equals b.Id
                            where b.Id == id_emp
                            select new
                            {
                                id_cv = a.id,
                                Working_Process = a.Working_Process,

                                Name_Job = a.Name_Job,
                                Description2 = a.Description,
                                Info_Details = a.Info_Details,
                                Id = b.Id,
                                fullname = b.fullname,
                                nickname = b.nickname,
                                gender = b.gender,
                                nation = b.nation,
                                religion = b.religion,
                                birthday = b.birthday,
                                birthofplace = b.birthofplace,
                                permanentresidence = b.permanentresidence,
                                phone = b.phone,
                                factiondate = b.factiondate,
                                educationallevel = b.educationallevel,
                                languagelevel = b.languagelevel,
                                health = b.health,
                                identitycard = b.identitycard,

                                identitycarddate = b.identitycarddate,
                                identitycardplace = b.identitycardplace,
                                socialinsurance = b.socialinsurance,
                                socialinsurancedate = b.socialinsurancedate,
                                socialinsuranceplace = b.socialinsuranceplace,
                                identification = b.identification,
                                unit = b.unit,
                                wage = b.wage,
                                salarytype = b.salarytype,
                                salarygroup = b.salarygroup,
                                salaryfactor = b.salaryfactor,
                                trainingschool = b.trainingschool,
                                trainingtime = b.trainingtime,
                                trainingtype = b.trainingtype,

                                disciplines = b.disciplines,
                                picture = b.picture,
                                taxcode = b.taxcode,
                                position = b.position,
                                employeekind = b.employeekind,
                                emailuser = b.emailuser,
                                emailpassword = b.emailpassword,
                                nationlaty = b.nationlaty,
                                status = b.status,
                                employeetype = b.employeetype,
                                bank = b.bank,
                                accountholder = b.accountholder,
                                accountopenplace = b.accountopenplace,
                                accountnumber = b.accountnumber,

                                maritalstatus = b.maritalstatus,
                                computerskill = b.computerskill,
                                employeegroup = b.employeegroup,
                                language = b.language,

                            };
                var data = query.Where(x => x.id_cv == id);

                return Json(data);
            }
            catch (Exception ex)
            {
                return Json(new JMessage() { Error = true, Title = String.Format(_stringLocalizer["MSG_LOAD_FAIL"], _stringLocalizer["USER_USERNAME"].Value.ToLower()), Object = ex });
            }
        }
        #endregion

        #region Degree
        public class training_course
        {
            public int id_bccc { get; set; }
            public string Result { get; set; }
            //public int Employee_Id { get; set; }
            public string Start_Time3 { get; set; }
            public string End_Time3 { get; set; }
            public string Received_Place { get; set; }
            public string Traing_Place { get; set; }
            public string Certificate_Name { get; set; }
            public string Education_Name { get; set; }
            public string Info_Details1 { get; set; }

            public string Created_By { get; set; }
            public string Updated_By { get; set; }
            public DateTime? Created_Time { get; set; }
            public DateTime? Updated_Time { get; set; }
            public int? flag { get; set; }
            public string File { get; set; }

        }
        [HttpPost]
        public object JTableBCCC([FromBody]JTableModelCustom jTablePara)
        {

            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.HRTrainingCourses
                        where a.flag == 1 && a.Employee_Id == jTablePara.EmployeeId
                        select new
                        {
                            id_bccc = a.id,
                            Education_Name = a.Education_Name,
                            Result = a.Result
                        };
            var count = query.Count();
            var data = query
                .OrderUsingSortExpression("id_bccc").Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "id_bccc", "Education_Name", "Result");
            return Json(jdata);
        }
        [HttpPost]
        public JsonResult InsertBCCC([FromBody]training_course obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                HRTrainingCourse obj1 = new HRTrainingCourse();
                obj1.Result = obj.Result;
                obj1.Start_Time = string.IsNullOrEmpty(obj.Start_Time3) ? (DateTime?)null : DateTime.ParseExact(obj.Start_Time3, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                obj1.End_Time = string.IsNullOrEmpty(obj.End_Time3) ? (DateTime?)null : DateTime.ParseExact(obj.End_Time3, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                //   obj1.Birthday = Convert.ToDateTime(obj.Birthday);
                obj1.Received_Place = obj.Received_Place;

                obj1.Traing_Place = obj.Traing_Place;
                obj1.Certificate_Name = obj.Certificate_Name;
                obj1.Education_Name = obj.Education_Name;
                //   obj1.Birthday = Convert.ToDateTime(obj.Birthday);
                obj1.Info_Details = obj.Info_Details1;

                obj1.flag = 1;
                obj1.Created_Time = DateTime.Now;
                obj1.Employee_Id = id_emp;

                if (obj.File != null)
                {
                    var file = new HrTranningCourseFile()
                    {
                        IdTranningCourse = _context.HRTrainingCourses.OrderByDescending(u => u.id).FirstOrDefault().id + 1,
                        FilePath = obj.File
                    };
                    _context.HrTranningCourseFiles.Add(file);
                }

                _context.HRTrainingCourses.Add(obj1);
                _context.SaveChanges();
                msg.Title = String.Format(_sharedResources["COM_ADD_SUCCESS"]);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(_sharedResources["COM_ERR_ADD"]);
            }
            return Json(msg);
        }
        [HttpPost]
        public object DeleteBCCC(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.HRTrainingCourses.FirstOrDefault(x => x.id == id);
                data.flag = 0;
                _context.HRTrainingCourses.Update(data);
                _context.SaveChanges();
                msg.Title = String.Format(_sharedResources["COM_DELETE_SUCCESS"]);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = String.Format(_sharedResources["COM_ERR_DELETE"]);
            }
            return Json(msg);
        }
        [HttpPost]
        public object DeleteItemsBCCC([FromBody]List<int> listIdI)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                foreach (var id in listIdI)
                {
                    HRTrainingCourse obj = _context.HRTrainingCourses.FirstOrDefault(x => x.id == id);
                    if (obj != null)
                    {
                        obj.flag = 0;
                        _context.HRTrainingCourses.Update(obj);
                        _context.SaveChanges();
                    }
                }
                msg.Title = String.Format(_sharedResources["COM_DELETE_SUCCESS"]);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(_stringLocalizer["MSG_DELETE_LIST_FAIL"], _stringLocalizer["RESOURCE"]);
                //_logger.LogError(LoggingEvents.LogDb, "Delete list Resource fail");
                //_actionLog.InsertActionLogDeleteItem("AdResource", "An error occurred while Delete list Resource", null, null, "Error");

            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult UpdateBCCC([FromBody]training_course obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var rs = _context.HRTrainingCourses.SingleOrDefault(x => x.id == obj.id_bccc);
                if (rs != null)
                {
                    rs.id = obj.id_bccc;
                    rs.Result = obj.Result;
                    rs.Start_Time = string.IsNullOrEmpty(obj.Start_Time3) ? (DateTime?)null : DateTime.ParseExact(obj.Start_Time3, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                    rs.End_Time = string.IsNullOrEmpty(obj.End_Time3) ? (DateTime?)null : DateTime.ParseExact(obj.End_Time3, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                    rs.Updated_Time = DateTime.Now;
                    rs.Info_Details = obj.Info_Details1;

                    rs.Received_Place = obj.Received_Place;
                    rs.Traing_Place = obj.Traing_Place;
                    rs.Certificate_Name = obj.Certificate_Name;
                    rs.Education_Name = obj.Education_Name;
                    _context.HRTrainingCourses.Update(rs);
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_UPDATE_SUCCESS"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(_sharedResources["COM_UPDATE_FAIL"]);
            }
            return Json(msg);
        }
        [HttpGet]
        public object GetitemBCCC(int id)
        {
            try
            {
                var booking = _context.HRTrainingCourses.SingleOrDefault(x => x.id == id);
                var query = from a in _context.HRTrainingCourses
                            join b in _context.HREmployees.Where(x => x.flag != 0)
                           on a.Employee_Id equals b.Id
                            where b.Id == id_emp
                            select new
                            {
                                id_bccc = a.id,
                                Result = a.Result,

                                Start_Time3 = a.Start_Time != null ? a.Start_Time.Value.ToString("dd/MM/yyyy") : null,
                                End_Time3 = a.End_Time != null ? a.End_Time.Value.ToString("dd/MM/yyyy") : null,
                                Received_Place = a.Received_Place,
                                Traing_Place = a.Traing_Place,
                                Certificate_Name = a.Certificate_Name,

                                Education_Name = a.Education_Name,
                                Info_Details1 = a.Info_Details,


                                Id = b.Id,
                                fullname = b.fullname,
                                nickname = b.nickname,
                                gender = b.gender,
                                nation = b.nation,
                                religion = b.religion,
                                birthday = b.birthday,
                                birthofplace = b.birthofplace,
                                permanentresidence = b.permanentresidence,
                                phone = b.phone,
                                factiondate = b.factiondate,
                                educationallevel = b.educationallevel,
                                languagelevel = b.languagelevel,
                                health = b.health,
                                identitycard = b.identitycard,

                                identitycarddate = b.identitycarddate,
                                identitycardplace = b.identitycardplace,
                                socialinsurance = b.socialinsurance,
                                socialinsurancedate = b.socialinsurancedate,
                                socialinsuranceplace = b.socialinsuranceplace,
                                identification = b.identification,
                                unit = b.unit,
                                wage = b.wage,
                                salarytype = b.salarytype,
                                salarygroup = b.salarygroup,
                                salaryfactor = b.salaryfactor,
                                trainingschool = b.trainingschool,
                                trainingtime = b.trainingtime,
                                trainingtype = b.trainingtype,

                                disciplines = b.disciplines,
                                picture = b.picture,
                                taxcode = b.taxcode,
                                position = b.position,
                                employeekind = b.employeekind,
                                emailuser = b.emailuser,
                                emailpassword = b.emailpassword,
                                nationlaty = b.nationlaty,
                                status = b.status,
                                employeetype = b.employeetype,
                                bank = b.bank,
                                accountholder = b.accountholder,
                                accountopenplace = b.accountopenplace,
                                accountnumber = b.accountnumber,

                                maritalstatus = b.maritalstatus,
                                computerskill = b.computerskill,
                                employeegroup = b.employeegroup,
                                language = b.language,
                            };
                var data = query.Where(x => x.id_bccc == id);

                return Json(data);
            }
            catch (Exception ex)
            {
                return Json(new JMessage() { Error = true, Title = String.Format(_stringLocalizer["MSG_LOAD_FAIL"], _stringLocalizer["USER_USERNAME"].Value.ToLower()), Object = ex });
            }
        }
        #endregion

        #region Contract

        public class Contract
        {
            public int? id { get; set; }
            public double? Insuarance { get; set; }
            public string Dates_of_pay { get; set; }

            public string Place_Work { get; set; }

            public string Exp_time_work { get; set; }

            public string Salary_Ratio { get; set; }

            public string Payment { get; set; }

            public string Contract_Type { get; set; }

            public string Signer { get; set; }

            public int? Employee_Id { get; set; }
            public double? Salary { get; set; }
            public string Start_Time { get; set; }
            public string End_Time { get; set; }
            public string DateOf_LaborBook { get; set; }

            public string Place_LaborBook { get; set; }


            public string Work_Content { get; set; }

            public string Allowance { get; set; }


            public string Contract_Code { get; set; }

            public string LaborBook_Code { get; set; }

            public string File { get; set; }

            public string Other_Agree { get; set; }


            public string Info_Insuarance { get; set; }


            public string Info_Contract { get; set; }


            public double? Bonus { get; set; }

            public string Tools_Work { get; set; }

            public int? Active { get; set; }


            public string Type_Money { get; set; }
            //public int? Value_time_work { get; set; }

            public int? flag { get; set; }
            public string PayScale { get; set; }
        }

        [HttpPost]
        public object JTableHD([FromBody]JTableModelCustom jTablePara)
        {

            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.HRContracts
                        where a.flag == 1 && a.Employee_Id == jTablePara.EmployeeId
                        select new
                        {
                            a.id,
                            a.Contract_Code,
                            a.Start_Time,
                            a.End_Time,
                            a.Salary,
                            a.Insuarance,
                            a.Type_Money,
                            a.Active,
                            a.File
                        };
            var count = query.Count();
            var data = query
                .OrderUsingSortExpression("id").Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "id", "Contract_Code", "Start_Time", "End_Time", "Salary", "Insuarance", "Type_Money", "Active", "File");
            return Json(jdata);
        }

        [HttpPost]
        [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
        [RequestSizeLimit(long.MaxValue)]
        public object InsertHD(Contract obj, IFormFile File)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var rs = _context.HRContracts.FirstOrDefault(x => x.Contract_Code == obj.Contract_Code);
                if (rs == null)
                {
                    var rs1 = new HRContract();
                    rs1.File = obj.File;

                    rs1.Insuarance = obj.Insuarance;
                    rs1.Dates_of_pay = string.IsNullOrEmpty(obj.Dates_of_pay) ? (DateTime?)null : DateTime.ParseExact(obj.Dates_of_pay, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                    rs1.Place_Work = obj.Place_Work;
                    rs1.Exp_time_work = obj.Exp_time_work;
                    rs1.Salary_Ratio = obj.Salary_Ratio;
                    rs1.Payment = obj.Payment;
                    rs1.Contract_Type = obj.Contract_Type;
                    rs1.Signer = obj.Signer;

                    rs1.Salary = obj.Salary;
                    rs1.Start_Time = string.IsNullOrEmpty(obj.Start_Time) ? (DateTime?)null : DateTime.ParseExact(obj.Start_Time, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                    rs1.End_Time = string.IsNullOrEmpty(obj.End_Time) ? (DateTime?)null : DateTime.ParseExact(obj.End_Time, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                    //rs1.DateOf_LaborBook = obj.DateOf_LaborBook;
                    rs1.Place_LaborBook = obj.Place_LaborBook;
                    rs1.Work_Content = obj.Work_Content;
                    rs1.Allowance = obj.Allowance;
                    rs1.Contract_Code = obj.Contract_Code;

                    rs1.LaborBook_Code = obj.LaborBook_Code;
                    rs1.Other_Agree = obj.Other_Agree;
                    rs1.Info_Insuarance = obj.Info_Insuarance;
                    rs1.Info_Contract = obj.Info_Contract;
                    rs1.Bonus = obj.Bonus;
                    rs1.Tools_Work = obj.Tools_Work;

                    rs1.Type_Money = obj.Type_Money;

                    rs1.Employee_Id = id_emp;
                    rs1.Created_Time = DateTime.Now;
                    rs1.flag = 1;
                    rs1.PayScale = obj.PayScale;
                    if (rs1.End_Time > DateTime.Now)
                    {
                        rs1.Active = 1;
                        var emp = _context.HREmployees.FirstOrDefault(x => x.flag == 1 && x.Id == rs1.Employee_Id);
                        if (emp != null)
                        {
                            emp.payScale = rs1.PayScale;
                            emp.payRange = rs1.Salary.ToString();
                            var logPayScale = new JsonLog
                            {
                                Code = rs1.PayScale,
                                CreatedBy = _context.Users.FirstOrDefault(x => x.UserName.Equals(ESEIM.AppContext.UserName)).GivenName,
                                ObjectRelative = rs1.Contract_Code,
                                ObjectType = "NEW_CONTRACT",
                                CreatedTime = DateTime.Now,
                            };
                            emp.ListPayScale.Add(logPayScale);
                            var logPayRange = new JsonLog
                            {
                                Code = rs1.Salary.ToString(),
                                CreatedBy = _context.Users.FirstOrDefault(x => x.UserName.Equals(ESEIM.AppContext.UserName)).GivenName,
                                ObjectRelative = rs1.Contract_Code,
                                ObjectType = "NEW_CONTRACT",
                                CreatedTime = DateTime.Now,
                            };
                            emp.ListPayRange.Add(logPayRange);
                            _context.HREmployees.Update(emp);
                        }
                    }
                    else
                    {
                        rs1.Active = 0;
                    }
                    _context.HRContracts.Add(rs1);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizer["HR_HR_MAN_MSG_ADD_CONTRACT_SUCCESS"];
                }
                else
                {
                    msg.Title = _stringLocalizer["HR_HR_MSG_NUM_CONTRACT_EXIST"];
                    msg.Error = true;
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = String.Format(_sharedResources["COM_ERR_ADD"]);
            }
            return Json(msg);
        }

        [HttpPost]
        [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
        [RequestSizeLimit(long.MaxValue)]
        public object UpdateHD(Contract obj, IFormFile File)
        {
            var msg = new JMessage() { Error = false, ID = 1 };
            try
            {
                var rs = _context.HRContracts.FirstOrDefault(x => x.id == obj.id);
                if (rs != null)
                {
                    rs.File = obj.File;

                    rs.Insuarance = obj.Insuarance;
                    rs.Dates_of_pay = string.IsNullOrEmpty(obj.Dates_of_pay) ? (DateTime?)null : DateTime.ParseExact(obj.Dates_of_pay, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                    rs.Place_Work = obj.Place_Work;
                    rs.Exp_time_work = obj.Exp_time_work;
                    rs.Salary_Ratio = obj.Salary_Ratio;

                    rs.Payment = obj.Payment;
                    rs.Contract_Type = obj.Contract_Type;
                    rs.Signer = obj.Signer;
                    rs.Salary = obj.Salary;
                    rs.Start_Time = string.IsNullOrEmpty(obj.Start_Time) ? (DateTime?)null : DateTime.ParseExact(obj.Start_Time, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                    rs.End_Time = string.IsNullOrEmpty(obj.End_Time) ? (DateTime?)null : DateTime.ParseExact(obj.End_Time, "dd/MM/yyyy", CultureInfo.InvariantCulture);

                    //rs.DateOf_LaborBook = string.IsNullOrEmpty(obj.DateOf_LaborBook) ? (DateTime?)null : DateTime.ParseExact(obj.DateOf_LaborBook, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                    rs.Place_LaborBook = obj.Place_LaborBook;
                    rs.Work_Content = obj.Work_Content;
                    rs.Allowance = obj.Allowance;
                    rs.Contract_Code = obj.Contract_Code;
                    rs.LaborBook_Code = obj.LaborBook_Code;

                    rs.Other_Agree = obj.Other_Agree;
                    rs.Info_Insuarance = obj.Info_Insuarance;
                    rs.Info_Contract = obj.Info_Contract;
                    rs.Bonus = obj.Bonus;
                    rs.Tools_Work = obj.Tools_Work;


                    rs.Type_Money = obj.Type_Money;
                    rs.Employee_Id = id_emp;
                    rs.Updated_Time = DateTime.Now;
                    rs.PayScale = obj.PayScale;
                    if (rs.End_Time > DateTime.Now)
                    {
                        rs.Active = 1;
                        var contract = _context.HRContracts.LastOrDefault(x => x.Employee_Id == rs.Employee_Id && x.Active.Value == 1);
                        if (contract != null && contract.id == rs.id)
                        {
                            var emp = _context.HREmployees.FirstOrDefault(x => x.flag == 1 && x.Id == contract.Employee_Id);
                            if (emp != null)
                            {
                                emp.payScale = contract.PayScale;
                                emp.payRange = contract.Salary.ToString();
                                var logPayScale = new JsonLog
                                {
                                    Code = rs.PayScale,
                                    CreatedBy = _context.Users.FirstOrDefault(x => x.UserName.Equals(ESEIM.AppContext.UserName)).GivenName,
                                    ObjectRelative = rs.Contract_Code,
                                    ObjectType = "UPDATE_CONTRACT",
                                    CreatedTime = DateTime.Now,
                                };
                                emp.ListPayScale.Add(logPayScale);
                                var logPayRange = new JsonLog
                                {
                                    Code = rs.Salary.ToString(),
                                    CreatedBy = _context.Users.FirstOrDefault(x => x.UserName.Equals(ESEIM.AppContext.UserName)).GivenName,
                                    ObjectRelative = rs.Contract_Code,
                                    ObjectType = "UPDATE_CONTRACT",
                                    CreatedTime = DateTime.Now,
                                };
                                emp.ListPayRange.Add(logPayRange);
                                _context.HREmployees.Update(emp);
                            }
                        }
                    }
                    else
                    {
                        rs.Active = 0;
                    }
                    _context.HRContracts.Update(rs);
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_UPDATE_SUCCESS"]);
                    msg.Error = false;
                }
                else
                {
                    msg.Title = String.Format(_sharedResources["COM_MSG_ERR_RETRY"]);
                    msg.Error = true;
                }
            }
            catch (Exception ex)
            {
                msg.ID = 0;
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(_sharedResources["COM_UPDATE_FAIL"]);
            }
            return Json(msg);
        }

        [HttpGet]
        public object GetItemHD(int? id)
        {
            if (id == null || id < 0)
            {
                return Json("");
            }
            var a = _context.HRContracts.AsNoTracking().Where(x => x.id == id).Select(x => new
            {
                Id = x.id,
                x.Contract_Code,
                x.LaborBook_Code,
                x.DateOf_LaborBook,
                x.Value_time_work,
                x.Insuarance,
                Dates_of_pay = x.Dates_of_pay.HasValue ? x.Dates_of_pay.Value.ToString("dd/MM/yyyy") : null,
                x.Place_Work,
                x.Exp_time_work,
                x.Salary_Ratio,
                x.Payment,
                x.Contract_Type,
                x.Work_Content,
                x.Other_Agree,
                x.Signer,
                x.Salary,
                Start_Time = x.Start_Time.HasValue ? x.Start_Time.Value.ToString("dd/MM/yyyy") : null,
                End_Time = x.End_Time.HasValue ? x.End_Time.Value.ToString("dd/MM/yyyy") : null,
                x.Allowance,
                x.Bonus,
                x.Tools_Work,
                x.Type_Money,
                File = !string.IsNullOrEmpty(x.File) ? x.File : "",
                x.Info_Insuarance,
                x.Info_Contract,
                x.PayScale,
            }).FirstOrDefault();
            return Json(a);
        }

        [HttpPost]
        public object GetCurrencyHD()
        {
            return GetCurrencyBase();
        }

        [HttpPost]
        public JsonResult DeleteHD([FromBody]int id)
        {
            var msg = new JMessage { Error = false };
            try
            {
                var data = _context.HRContracts.FirstOrDefault(x => x.id == id);
                _context.HRContracts.Remove(data);
                _context.SaveChanges();
                msg.Title = String.Format(_sharedResources["COM_DELETE_SUCCESS"]);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = String.Format(_sharedResources["COM_ERR_DELETE"]);
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult DeleteItemsHD([FromBody]List<int> listIdI)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                foreach (var id in listIdI)
                {
                    HRContract obj = _context.HRContracts.FirstOrDefault(x => x.id == id);
                    if (obj != null)
                    {
                        obj.flag = 0;
                        _context.HRContracts.Update(obj);
                        _context.SaveChanges();
                    }
                }
                msg.Title = String.Format(_sharedResources["COM_DELETE_SUCCESS"]);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(_stringLocalizer["MSG_DELETE_LIST_FAIL"], _stringLocalizer["RESOURCE"]);
            }
            return Json(msg);
        }

        [HttpPost]
        public void ViewFileHD(int mode, string url)
        {
            var asean = new AseanDocument();
            var extension = Path.GetExtension(url);
            asean.File_Code = "";
            asean.Mode = 1;
            asean.File_Path = "";
            asean.FirstPage = "/Admin/DashBoard";
            if (extension.ToUpper() == ".DOCX" || extension.ToUpper() == ".DOC")
            {
                DocmanController.pathFile = url;
                DocmanController.cardCode = "";
                DocmanController.docmodel = asean;
            }
            if (extension.ToUpper() == ".XLSX" || extension.ToUpper() == ".XLS")
            {
                ExcelController.pathFile = url;
                ExcelController.cardCode = "";
                ExcelController.docmodel = asean;
            }
            if (extension.ToUpper() == ".PDF")
            {
                PDFController.pathFile = url;
            }
        }

        [HttpPost]
        public JsonResult GetPayScaleCat()
        {
            var data = _context.PayScales.Where(x => !x.IsDeleted).Select(x => new { Code = x.PayScaleCode, Name = x.CreatedBy });
            return Json(data);
        }
        [HttpPost]
        public JsonResult GetRangeOfPayScaleCat(string payCode)
        {
            var data = _context.PayScaleDetails.Where(x => !x.IsDeleted && x.ScaleCode.Equals(payCode))
                        .Select(x => new { Code = x.Ranges.ToString(), Money = x.Salary });
            return Json(data);
        }
        #endregion

        #region File
        [HttpPost]
        public object JTableFile([FromBody]JTableModelFile jTablePara)
        {
            if (string.IsNullOrEmpty(jTablePara.EmployeeCode))
            {
                return JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "Id", "FileName", "FileTypePhysic", "Desc", "Url", "CreatedTime", "UpdatedTime", "ReposName", "TypeFile", "FileID", "SizeOfFile");
            }
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var query = ((from a in _context.EDMSRepoCatFiles.Where(x => x.ObjectCode == jTablePara.EmployeeCode && x.ObjectType == EnumHelper<HrEmployeeEnum>.GetDisplayValue(HrEmployeeEnum.HrEmployeeEnum))
                          join b in _context.EDMSFiles on a.FileCode equals b.FileCode
                          join f in _context.EDMSRepositorys on a.ReposCode equals f.ReposCode into f1
                          from f in f1.DefaultIfEmpty()
                          select new
                          {
                              a.Id,
                              b.FileCode,
                              b.FileName,
                              b.FileTypePhysic,
                              b.Desc,
                              b.CreatedTime,
                              b.CloudFileId,
                              TypeFile = "NO_SHARE",
                              ReposName = f != null ? f.ReposName : "",
                              b.FileID,
                              SizeOfFile = b.FileSize.HasValue ? b.FileSize.Value : 0,
                          }).Union(
                  from a in _context.EDMSObjectShareFiles.Where(x => x.ObjectCode == jTablePara.EmployeeCode && x.ObjectType == EnumHelper<HrEmployeeEnum>.GetDisplayValue(HrEmployeeEnum.HrEmployeeEnum))
                  join b in _context.EDMSFiles on a.FileCode equals b.FileCode
                  join f in _context.EDMSRepositorys on b.ReposCode equals f.ReposCode into f1
                  from f in f1.DefaultIfEmpty()
                  select new
                  {
                      Id = b.FileID,
                      b.FileCode,
                      b.FileName,
                      b.FileTypePhysic,
                      b.Desc,
                      b.CreatedTime,
                      b.CloudFileId,
                      TypeFile = "SHARE",
                      ReposName = f != null ? f.ReposName : "",
                      b.FileID,
                      SizeOfFile = b.FileSize.HasValue ? b.FileSize.Value : 0,
                  })).AsNoTracking();
            int count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "FileCode", "FileName", "FileTypePhysic", "Desc", "CreatedTime", "CloudFileId", "ReposName", "TypeFile", "FileID", "SizeOfFile");
            return jdata;
        }

        [HttpPost]
        [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
        [RequestSizeLimit(long.MaxValue)]
        public JsonResult InsertHrEmployeeFile(EDMSRepoCatFileModel obj, IFormFile fileUpload)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var mimeType = fileUpload.ContentType;
                string extension = Path.GetExtension(fileUpload.FileName);
                string urlFile = "";
                string fileId = "";
                if (Array.IndexOf(LuceneExtension.fileMimetypes, mimeType) >= 0 && (Array.IndexOf(LuceneExtension.fileExt, extension.ToUpper()) >= 0))
                {
                    string reposCode = "";
                    string catCode = "";
                    string path = "";
                    string folderId = "";
                    //Chọn file ngắn gọn
                    if (!obj.IsMore)
                    {
                        //var suggesstion = GetSuggestionsHrEmployeeFile(obj.EmployeeCode);
                        //if (suggesstion != null)
                        //{
                        //    reposCode = suggesstion.ReposCode;
                        //    path = suggesstion.Path;
                        //    folderId = suggesstion.FolderId;
                        //    catCode = suggesstion.CatCode;
                        //}
                        //else
                        //{
                        //    msg.Error = true;
                        //    msg.Title = _stringLocalizer["HR_HR_MSG_SELECT_ATTR_EXP"];
                        //    return Json(msg);
                        //}
                        var repoDefault = _context.EDMSRepoDefaultObjects.FirstOrDefault(x => !x.IsDeleted
                               && x.ObjectCode.Equals(obj.EmployeeCode) && x.ObjectType.Equals(EnumHelper<ObjectType>.GetDisplayValue(ObjectType.Employee)));
                        if (repoDefault != null)
                        {
                            reposCode = repoDefault.ReposCode;
                            path = repoDefault.Path;
                            folderId = repoDefault.FolderId;
                            catCode = repoDefault.CatCode;
                        }
                        else
                        {
                            msg.Error = true;
                            msg.Title = _sharedResources["COM_MSG_PLS_SETUP_FOLDER_DEFAULT"];
                            return Json(msg);
                        }
                    }
                    //Hiển file mở rộng
                    else
                    {
                        var setting = _context.EDMSCatRepoSettings.FirstOrDefault(x => x.Id == obj.CateRepoSettingId);
                        if (setting != null)
                        {
                            reposCode = setting.ReposCode;
                            path = setting.Path;
                            folderId = setting.FolderId;
                            catCode = setting.CatCode;
                        }
                        else
                        {
                            msg.Error = true;
                            msg.Title = _stringLocalizer["HR_HR_MAN_MSG_SELECT_FORDER"];
                            return Json(msg);
                        }
                    }
                    var getRepository = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == reposCode);
                    if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server))
                    {
                        using (var ms = new MemoryStream())
                        {
                            fileUpload.CopyTo(ms);
                            var fileBytes = ms.ToArray();
                            urlFile = path + Path.Combine("/", fileUpload.FileName);
                            var urlFilePreventive = path + Path.Combine("/", Guid.NewGuid().ToString().Substring(0, 8) + fileUpload.FileName);
                            var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + getRepository.Server + urlFile);
                            var urlEndPreventive = System.Web.HttpUtility.UrlPathEncode("ftp://" + getRepository.Server + urlFilePreventive);
                            var result = FileExtensions.UploadFileToFtpServer(urlEnd, urlEndPreventive, fileBytes, getRepository.Account, getRepository.PassWord);
                            if (result.Status == WebExceptionStatus.ConnectFailure || result.Status == WebExceptionStatus.ProtocolError)
                            {
                                msg.Error = true;
                                msg.Title = _sharedResources["COM_CONNECT_FAILURE"];
                                return Json(msg);
                            }
                            else if (result.Status == WebExceptionStatus.Success)
                            {
                                if (result.IsSaveUrlPreventive)
                                {
                                    urlFile = urlFilePreventive;
                                }
                            }
                            else
                            {
                                msg.Error = true;
                                msg.Title = _sharedResources["COM_MSG_ERR"];
                                return Json(msg);
                            }
                        }
                    }
                    else if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.GooglerDriver))
                    {
                        fileId = FileExtensions.UploadFileToDrive(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", fileUpload.FileName, fileUpload.OpenReadStream(), fileUpload.ContentType, folderId);
                    }
                    var edmsReposCatFile = new EDMSRepoCatFile
                    {
                        FileCode = string.Concat("HREMP", Guid.NewGuid().ToString()),
                        ReposCode = reposCode,
                        CatCode = catCode,
                        ObjectCode = obj.EmployeeCode,
                        ObjectType = EnumHelper<HrEmployeeEnum>.GetDisplayValue(HrEmployeeEnum.HrEmployeeEnum),
                        Path = path,
                        FolderId = folderId
                    };
                    _context.EDMSRepoCatFiles.Add(edmsReposCatFile);

                    /// created Index lucene
                    LuceneExtension.IndexFile(edmsReposCatFile.FileCode, fileUpload, string.Concat(_hostingEnvironment.WebRootPath, "\\uploads\\luceneIndex"));

                    //add File
                    var file = new EDMSFile
                    {
                        FileCode = edmsReposCatFile.FileCode,
                        FileName = fileUpload.FileName,
                        Desc = obj.Desc,
                        ReposCode = reposCode,
                        Tags = obj.Tags,
                        FileSize = fileUpload.Length,
                        FileTypePhysic = Path.GetExtension(fileUpload.FileName),
                        NumberDocument = obj.NumberDocument,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now,
                        Url = urlFile,
                        MimeType = mimeType,
                        CloudFileId = fileId,
                    };
                    _context.EDMSFiles.Add(file);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizer["HR_HR_MSG_ADD_FILE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_MSG_INVALID_FORMAT"];
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
        public JsonResult GetHrEmployeeFile(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var model = new EDMSRepoCatFileModel();
            try
            {
                var data = _context.EDMSRepoCatFiles.FirstOrDefault(m => m.Id == id);
                if (data != null)
                {
                    var file = _context.EDMSFiles.FirstOrDefault(x => x.FileCode == data.FileCode);
                    //header file
                    model.FileCode = file.FileCode;
                    model.NumberDocument = file.NumberDocument;
                    model.Tags = file.Tags;
                    model.Desc = file.Desc;
                    //category file
                    model.CateRepoSettingCode = data.CatCode;
                    model.CateRepoSettingId = data.Id;
                    model.Path = data.Path;
                    model.FolderId = data.FolderId;
                    msg.Object = model;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["CONTRACT_MSG_FILE_DOES_NOT_EXIST"]);//"Tệp tin không tồn tại!";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateHrEmployeeFile(EDMSRepoCatFileModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                string path = "";
                string fileId = "";
                var oldSetting = _context.EDMSRepoCatFiles.FirstOrDefault(x => x.FileCode == obj.FileCode);
                if (oldSetting != null)
                {
                    var newSetting = _context.EDMSCatRepoSettings.FirstOrDefault(x => x.Id == obj.CateRepoSettingId);
                    if (newSetting != null)
                    {
                        var file = _context.EDMSFiles.FirstOrDefault(x => x.FileCode == oldSetting.FileCode);
                        //change folder
                        if ((string.IsNullOrEmpty(oldSetting.Path) && oldSetting.FolderId != newSetting.FolderId) || (string.IsNullOrEmpty(oldSetting.FolderId) && oldSetting.Path != newSetting.Path))
                        {
                            //dowload file old
                            var oldRepo = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == oldSetting.ReposCode);
                            byte[] fileData = null;
                            if (oldRepo.Type == "SERVER")
                            {
                                string ftphost = oldRepo.Server;
                                string ftpfilepath = file.Url;
                                var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + ftphost + ftpfilepath);
                                using (WebClient request = new WebClient())
                                {
                                    request.Credentials = new NetworkCredential(oldRepo.Account, oldRepo.PassWord);
                                    fileData = request.DownloadData(urlEnd);
                                }
                            }
                            else
                            {
                                fileData = FileExtensions.DownloadFileGoogle(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", file.CloudFileId);
                            }
                            //delete folder old
                            if (oldRepo.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server))
                            {
                                var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + oldRepo.Server + file.Url);
                                FileExtensions.DeleteFileFtpServer(urlEnd, oldRepo.Account, oldRepo.PassWord);
                            }
                            else if (oldRepo.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.GooglerDriver))
                            {
                                FileExtensions.DeleteFileGoogleServer(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", file.CloudFileId);
                            }

                            //insert folder new
                            var newRepo = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == newSetting.ReposCode);
                            if (newRepo.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server))
                            {
                                path = newSetting.Path + Path.Combine("/", file.FileName);
                                var pathPreventive = path + Path.Combine("/", Guid.NewGuid().ToString().Substring(0, 8) + file.FileName);
                                var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + newRepo.Server + path);
                                var urlEndPreventive = System.Web.HttpUtility.UrlPathEncode("ftp://" + newRepo.Server + pathPreventive);
                                var result = FileExtensions.UploadFileToFtpServer(urlEnd, urlEndPreventive, fileData, newRepo.Account, newRepo.PassWord);
                                if (result.Status == WebExceptionStatus.ConnectFailure || result.Status == WebExceptionStatus.ProtocolError)
                                {
                                    msg.Error = true;
                                    msg.Title = _sharedResources["COM_CONNECT_FAILURE"];
                                    return Json(msg);
                                }
                                else if (result.Status == WebExceptionStatus.Success)
                                {
                                    if (result.IsSaveUrlPreventive)
                                    {
                                        path = pathPreventive;
                                    }
                                }
                                else
                                {
                                    msg.Error = true;
                                    msg.Title = _sharedResources["COM_MSG_ERR"];
                                    return Json(msg);
                                }
                            }
                            else if (newRepo.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.GooglerDriver))
                            {
                                fileId = FileExtensions.UploadFileToDrive(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", file.FileName, new MemoryStream(fileData), file.MimeType, newSetting.FolderId);
                            }
                            file.CloudFileId = fileId;
                            file.Url = path;

                            //update setting new
                            oldSetting.CatCode = newSetting.CatCode;
                            oldSetting.ReposCode = newSetting.ReposCode;
                            oldSetting.Path = newSetting.Path;
                            oldSetting.FolderId = newSetting.FolderId;
                            _context.EDMSRepoCatFiles.Update(oldSetting);
                        }
                        //update header
                        file.Desc = obj.Desc;
                        file.Tags = obj.Tags;
                        file.NumberDocument = obj.NumberDocument;
                        _context.EDMSFiles.Update(file);
                        _context.SaveChanges();
                        msg.Title = _stringLocalizer["HR_HR_MSG_UPDATE_SUCCESS"];
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["HR_HR_MAN_MSG_SELECT_FORDER"];
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["HR_HR_MSG_FILE_NOT_EXIST"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_FAILED"], _stringLocalizer[""]);// "Có lỗi xảy ra khi cập nhật!";
                msg.Object = ex;
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult DeleteHrEmployeeFile(int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.EDMSRepoCatFiles.FirstOrDefault(x => x.Id == id);
                _context.EDMSRepoCatFiles.Remove(data);

                var file = _context.EDMSFiles.FirstOrDefault(x => x.FileCode == data.FileCode);
                _context.EDMSFiles.Remove(file);

                LuceneExtension.DeleteIndexFile(file.FileCode, _hostingEnvironment.WebRootPath + "\\uploads\\luceneIndex");
                var getRepository = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == data.ReposCode);
                if (getRepository != null)
                {
                    if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server))
                    {
                        var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + getRepository.Server + file.Url);
                        FileExtensions.DeleteFileFtpServer(urlEnd, getRepository.Account, getRepository.PassWord);
                    }
                    else if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.GooglerDriver))
                    {
                        FileExtensions.DeleteFileGoogleServer(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", file.CloudFileId);
                    }
                }
                _context.SaveChanges();
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer[""]);// "Xóa thành công";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_FAIL"], _stringLocalizer[""]);//"Có lỗi xảy ra khi xóa!";
                msg.Object = ex;
            }
            return Json(msg);
        }
        [HttpGet]
        public EDMSRepoCatFile GetSuggestionsHrEmployeeFile(string employeeCode)
        {
            var query = _context.EDMSRepoCatFiles.Where(x => x.ObjectCode == employeeCode && x.ObjectType == EnumHelper<HrEmployeeEnum>.GetDisplayValue(HrEmployeeEnum.HrEmployeeEnum)).MaxBy(x => x.Id);
            return query;
        }

        public class JTableModelFile : JTableModel
        {
            public string EmployeeCode { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string CatCode { get; set; }
        }

        #endregion

        #region Department and group
        [HttpPost]
        public JsonResult JTableDepartment([FromBody] JTableDepartmentGroup jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var user = (from a in _context.HREmployees.Where(x => x.flag == 1)
                        join b in _context.Users on a.Id.ToString() equals b.EmployeeCode
                        where a.Id == jTablePara.Id
                        select new
                        {
                            b.Id
                        }).FirstOrDefault();
            var query = from a in _context.AdUserDepartments.Where(x => !x.IsDeleted && user != null && x.UserId == user.Id)
                        join b in _context.AdDepartments on a.DepartmentCode equals b.DepartmentCode
                        join c in _context.Roles on a.RoleId equals c.Id
                        select new
                        {
                            DepartmentTitle = _context.AdDepartments.FirstOrDefault(x => x.DepartmentCode == a.DepartmentCode) != null ? _context.AdDepartments.FirstOrDefault(x => x.DepartmentCode == a.DepartmentCode).Title : "",
                            Role = _context.Roles.FirstOrDefault(x => x.Id == a.RoleId) != null ? _context.Roles.FirstOrDefault(x => x.Id == a.RoleId).Title : ""
                        };
            int count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "DepartmentTitle", "Role");
            return Json(jdata);
        }

        [HttpPost]
        public JsonResult JTableGroup([FromBody] JTableDepartmentGroup jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var user = (from a in _context.HREmployees.Where(x => x.flag == 1)
                        join b in _context.Users on a.Id.ToString() equals b.EmployeeCode
                        where a.Id == jTablePara.Id
                        select new
                        {
                            b.Id
                        }).FirstOrDefault();
            var query = from a in _context.AdUserInGroups.Where(x => !x.IsDeleted && user != null && x.UserId == user.Id)
                        join b in _context.AdGroupUsers on a.GroupUserCode equals b.GroupUserCode
                        join c in _context.Roles on a.RoleId equals c.Id
                        select new
                        {
                            GroupTitle = _context.AdGroupUsers.FirstOrDefault(x => x.GroupUserCode == a.GroupUserCode) != null ? _context.AdGroupUsers.FirstOrDefault(x => x.GroupUserCode == a.GroupUserCode).Title : "",
                            Role = _context.Roles.FirstOrDefault(x => x.Id == a.RoleId) != null ? _context.Roles.FirstOrDefault(x => x.Id == a.RoleId).Title : ""
                        };
            int count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "GroupTitle", "Role");
            return Json(jdata);
        }
        public class JTableDepartmentGroup : JTableModel
        {
            public int Id { get; set; }
        }
        #endregion

        #region NotWork
        [HttpPost]
        public object UpdateNotWork([FromBody]HREmployee data)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var item = _context.HREmployees.FirstOrDefault(x => x.Id == data.Id);
                if (item != null)
                {
                    item.notWorkDay = data.notWorkDay;
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_UPDATE_SUCCESS"]);
                    return Json(msg);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_UPDATE_FAIL"]);
                    return Json(msg);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_UPDATE_FAIL"]);
                msg.Object = ex;
                return Json(msg);
            }
        } 
        #endregion

        #region ExportExcel
        [HttpPost]
        public object ExportExcel([FromBody]JTableModelCustom jTablePara)
        {
            var query = new List<HrEmployeeExportModelProceduce>();
            var length = 1000000;

            try
            {
                var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
                var fromDatePara = fromDate.HasValue ? fromDate.Value.ToString("yyyy-MM-dd") : "";
                var toDatePara = toDate.HasValue ? toDate.Value.ToString("yyyy-MM-dd") : "";
                string[] param = new string[] { "@pageNo", "@pageSize", "@Full_Name", "@Phone", "@Permanentresidence", "@Employee_Type", "@Unit", "@Position", "@Branch_Id", "@Gender", "@Employee_Id", "@Number_Of_Years", "@from_Date", "@to_Date", "@Years_Of_Work", "@Educational_Level", "@Wage", "@Status", "@Is_Working", "@CountDayEndContract" };
                object[] val = new object[] { 1, length, jTablePara.FullName, jTablePara.Phone, jTablePara.Permanentresidence, jTablePara.EmployeeType, jTablePara.Unit, jTablePara.Position, jTablePara.BranchId, jTablePara.Gender != null ? jTablePara.Gender.ToString() : "", "", jTablePara.NumberOfYears != null ? jTablePara.NumberOfYears.ToString() : "", fromDatePara, toDatePara, jTablePara.YearsOfWork, jTablePara.EducationalLevel, jTablePara.Wage, jTablePara.Status, "", jTablePara.CountDayEndContract != null ? jTablePara.CountDayEndContract.ToString() : "" };
                DataTable rs = _repositoryService.GetDataTableProcedureSql("P_GET_LIST_HR_EMPLOYEE", param, val);
                query = CommonUtil.ConvertDataTable<HrEmployeeExportModelProceduce>(rs);

                var listExport = new List<HrEmployeeExportModel>();
                var no = 1;
                foreach (var item in query)
                {
                    var itemExport = new HrEmployeeExportModel();

                    itemExport.No = no;
                    itemExport.EmployeeCode = item.EmployeeCode;
                    itemExport.FullName = item.FullName;
                    itemExport.Gender = item.Gender == 1 ? "Nam" : item.Gender == 2 ? "Nữ" : "Không xác định";
                    itemExport.Birthdate = item.Birthday.HasValue ? item.Birthday.Value.ToString("dd/MM/yyyy") : "";
                    itemExport.IdentityCard = item.IdentityCard;
                    itemExport.SocialInsurance = item.SocialInsurance;
                    itemExport.OldDepartment = item.OldDepartment;
                    itemExport.OldRole = item.OldPosition;
                    itemExport.OldSalary = "";
                    itemExport.OldPayScale = item.OldPayScale;
                    itemExport.OldPayRange = item.OldPayRange;
                    itemExport.NewDepartment = string.IsNullOrEmpty(item.NewDepartment) ? item.UnitName : item.NewDepartment;
                    itemExport.NewRole = string.IsNullOrEmpty(item.NewPosition) ? item.PositionName : item.NewPosition;
                    itemExport.NewSalary = item.Salary.HasValue ? item.Salary.ToString() : "";
                    itemExport.NewPayScale = string.IsNullOrEmpty(item.NewPayScale) ? item.PayScale : item.NewPayScale;
                    itemExport.NewPayRange = string.IsNullOrEmpty(item.NewPayRange) ? item.PayRange : item.NewPayRange;
                    var EndDate = DateTime.Now;
                    itemExport.WorkDay = item.CreatedTime.HasValue ? Math.Truncate((EndDate - item.CreatedTime.Value).TotalDays).ToString() : "";
                    itemExport.WorkYear = item.CreatedTime.HasValue ? ((item.CreatedTime.Value > EndDate.AddYears(item.CreatedTime.Value.Year - EndDate.Year)) ? (EndDate.Year - item.CreatedTime.Value.Year - 1).ToString() : (EndDate.Year - item.CreatedTime.Value.Year).ToString()) : "";
                    itemExport.PayCertificate = item.PayCertificate;
                    itemExport.Specialized = item.Specialized;
                    itemExport.PermanentResidence = item.PermanentResidence;
                    no = no + 1;
                    listExport.Add(itemExport);
                }

                ExcelEngine excelEngine = new ExcelEngine();
                IApplication application = excelEngine.Excel;
                application.DefaultVersion = ExcelVersion.Excel2016;
                IWorkbook workbook = application.Workbooks.Create(1);
                workbook.Version = ExcelVersion.Excel2016;
                IWorksheet sheetRequest = workbook.Worksheets.Create("Danhsachnhanvien");
                workbook.Worksheets[0].Remove();
                IMigrantRange migrantRange = workbook.Worksheets[0].MigrantRange;
                sheetRequest.Range["A1"].ColumnWidth = 24;
                sheetRequest.Range["B1"].ColumnWidth = 24;
                sheetRequest.Range["C1"].ColumnWidth = 24;
                sheetRequest.Range["D1"].ColumnWidth = 45;
                sheetRequest.Range["E1"].ColumnWidth = 24;
                sheetRequest.Range["F1"].ColumnWidth = 24;
                sheetRequest.Range["G1"].ColumnWidth = 24;
                sheetRequest.Range["H1"].ColumnWidth = 24;
                sheetRequest.Range["I1"].ColumnWidth = 24;
                sheetRequest.Range["J1"].ColumnWidth = 24;
                sheetRequest.Range["K1"].ColumnWidth = 24;
                sheetRequest.Range["L1"].ColumnWidth = 24;
                sheetRequest.Range["M1"].ColumnWidth = 24;
                sheetRequest.Range["N1"].ColumnWidth = 24;
                sheetRequest.Range["O1"].ColumnWidth = 24;
                sheetRequest.Range["P1"].ColumnWidth = 24;
                sheetRequest.Range["Q1"].ColumnWidth = 24;
                sheetRequest.Range["R1"].ColumnWidth = 24;
                sheetRequest.Range["S1"].ColumnWidth = 24;
                sheetRequest.Range["T1"].ColumnWidth = 24;
                sheetRequest.Range["U1"].ColumnWidth = 24;
                sheetRequest.Range["V1"].ColumnWidth = 24;

                sheetRequest.Range["A1:A3"].Merge(true);
                sheetRequest.Range["B1:B3"].Merge(true);
                sheetRequest.Range["C1:C3"].Merge(true);
                sheetRequest.Range["D1:D3"].Merge(true);
                sheetRequest.Range["E1:E3"].Merge(true);
                sheetRequest.Range["F1:F3"].Merge(true);
                sheetRequest.Range["G1:G3"].Merge(true);
                sheetRequest.Range["H1:Q1"].Merge(true);
                sheetRequest.Range["H2:L2"].Merge(true);
                sheetRequest.Range["M2:Q2"].Merge(true);
                sheetRequest.Range["R1:R3"].Merge(true);
                sheetRequest.Range["S1:S3"].Merge(true);
                sheetRequest.Range["T1:T3"].Merge(true);
                sheetRequest.Range["U1:U3"].Merge(true);
                sheetRequest.Range["V1:V3"].Merge(true);

                sheetRequest.ImportData(listExport, 3, 1, true);

                sheetRequest["A1"].Text = "STT";
                sheetRequest["B1"].Text = "Mã nhân viên";
                sheetRequest["C1"].Text = "Họ và tên";
                sheetRequest["D1"].Text = "Giới tính";
                sheetRequest["E1"].Text = "Ngày sinh";
                sheetRequest["F1"].Text = "Số CMND";
                sheetRequest["G1"].Text = "Số sổ BHXH";
                sheetRequest["H1"].Text = "Quá trình công việc";
                sheetRequest["H2"].Text = "Công việc cũ";
                sheetRequest["H3"].Text = "Đơn vị";
                sheetRequest["I3"].Text = "Công việc";
                sheetRequest["J3"].Text = "Mức lương";
                sheetRequest["K3"].Text = "Thang lương";
                sheetRequest["L3"].Text = "Bậc";
                sheetRequest["M2"].Text = "Công việc mới";
                sheetRequest["M3"].Text = "Đơn vị";
                sheetRequest["N3"].Text = "Công việc";
                sheetRequest["O3"].Text = "Mức lương";
                sheetRequest["P3"].Text = "Thang lương";
                sheetRequest["Q3"].Text = "Bậc";
                sheetRequest["R1"].Text = "Ngày đi làm";
                sheetRequest["S1"].Text = "Số năm đi làm";
                sheetRequest["T1"].Text = "Trình độ";
                sheetRequest["U1"].Text = "Chuyên ngành";
                sheetRequest["V1"].Text = "Quê quán";

                IStyle tableHeader = workbook.Styles.Add("TableHeaderStyle");
                tableHeader.Font.Bold = true;
                tableHeader.Font.Size = 11;
                tableHeader.Font.FontName = "Calibri";
                tableHeader.HorizontalAlignment = ExcelHAlign.HAlignCenter;
                tableHeader.VerticalAlignment = ExcelVAlign.VAlignCenter;
                tableHeader.Borders[ExcelBordersIndex.EdgeLeft].LineStyle = ExcelLineStyle.None;
                tableHeader.Borders[ExcelBordersIndex.EdgeRight].LineStyle = ExcelLineStyle.None;
                tableHeader.Borders[ExcelBordersIndex.EdgeTop].LineStyle = ExcelLineStyle.None;
                tableHeader.Borders[ExcelBordersIndex.EdgeBottom].LineStyle = ExcelLineStyle.None;
                tableHeader.Borders[ExcelBordersIndex.EdgeBottom].LineStyle = ExcelLineStyle.None;
                sheetRequest["A1:V3"].CellStyle = tableHeader;
                sheetRequest["A1:V3"].RowHeight = 20;
                sheetRequest.UsedRange.AutofitColumns();

                var fileName = "Danhsachnhanvien" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".xls";
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
            catch (Exception ex)
            {
                var obj = new JMessage() { Error = true, Title = "Lỗi: " + ex };
                return obj;
            }
        }
        #endregion

        #region Model
        public class HrEmployeeExportModel
        {
            public int No { get; set; }
            public string EmployeeCode { get; set; }
            public string FullName { get; set; }
            public string Gender { get; set; }
            public string Birthdate { get; set; }
            public string IdentityCard { get; set; }
            public string SocialInsurance { get; set; }
            public string OldDepartment { get; set; }
            public string OldRole { get; set; }
            public string OldSalary { get; set; }
            public string OldPayScale { get; set; }
            public string OldPayRange { get; set; }
            public string NewDepartment { get; set; }
            public string NewRole { get; set; }
            public string NewSalary { get; set; }
            public string NewPayScale { get; set; }
            public string NewPayRange { get; set; }
            public string WorkDay { get; set; }
            public string WorkYear { get; set; }
            public string PayCertificate { get; set; }
            public string Specialized { get; set; }
            public string PermanentResidence { get; set; }
        }
        public class HrEmployeeExportModelProceduce
        {
            public int Id { get; set; }
            public string EmployeeCode { get; set; }
            public string FullName { get; set; }
            public int? Gender { get; set; }
            public DateTime? Birthday { get; set; }
            public string IdentityCard { get; set; }
            public string SocialInsurance { get; set; }
            public DateTime? CreatedTime { get; set; }
            public string PermanentResidence { get; set; }
            public string PositionName { get; set; }
            public string UnitName { get; set; }
            public string PayScale { get; set; }
            public string PayRange { get; set; }
            public decimal? Salary { get; set; }
            public string PayCertificate { get; set; }
            public string Specialized { get; set; }
            public Int64 RowNumber { get; set; }
            public int TotalRow { get; set; }
            public List<JsonLog> ListDepartment { get; set; }
            public string LogDepartment
            {
                get
                {
                    return JsonConvert.SerializeObject(ListDepartment);
                }
                set
                {
                    ListDepartment = string.IsNullOrEmpty(value)
                ? new List<JsonLog>()
                : JsonConvert.DeserializeObject<List<JsonLog>>(value);
                    NewDepartment = !string.IsNullOrEmpty(value) && ListDepartment.Count > 0
                   ? ListDepartment.LastOrDefault().Name
                   : "";
                    OldDepartment = !string.IsNullOrEmpty(value) && ListDepartment.Count > 1
                        ? ListDepartment[ListDepartment.Count - 2].Name
                        : "";
                }
            }
            public string NewDepartment { get; set; }
            public string OldDepartment { get; set; }
            public List<JsonLog> ListPosition { get; set; }
            public string LogPosition
            {
                get
                {
                    return JsonConvert.SerializeObject(ListPosition);
                }
                set
                {
                    ListPosition = string.IsNullOrEmpty(value)
                        ? new List<JsonLog>()
                        : JsonConvert.DeserializeObject<List<JsonLog>>(value);
                    NewPosition = !string.IsNullOrEmpty(value) && ListPosition.Count > 0
                        ? ListPosition.LastOrDefault().Name
                        : "";
                    OldPosition = !string.IsNullOrEmpty(value) && ListPosition.Count > 1
                        ? ListPosition[ListPosition.Count - 2].Name
                        : "";
                }
            }
            public string NewPosition { get; set; }
            public string OldPosition { get; set; }
            public List<JsonLog> ListPayScale { get; set; }
            public string LogPayScale
            {
                get
                {
                    return JsonConvert.SerializeObject(ListPayScale);
                }
                set
                {
                    ListPayScale = string.IsNullOrEmpty(value)
                        ? new List<JsonLog>()
                        : JsonConvert.DeserializeObject<List<JsonLog>>(value);
                    NewPayScale = !string.IsNullOrEmpty(value) && ListPayScale.Count > 0
                        ? ListPayScale.LastOrDefault().Code
                        : "";
                    OldPayScale = !string.IsNullOrEmpty(value) && ListPayScale.Count > 1
                        ? ListPayScale[ListPayScale.Count - 2].Code
                        : "";
                }
            }
            public string NewPayScale { get; set; }
            public string OldPayScale { get; set; }
            public List<JsonLog> ListPayRange { get; set; }
            public string LogPayRange
            {
                get
                {
                    return JsonConvert.SerializeObject(ListPayRange);
                }
                set
                {
                    ListPayRange = string.IsNullOrEmpty(value)
                        ? new List<JsonLog>()
                        : JsonConvert.DeserializeObject<List<JsonLog>>(value);
                    NewPayRange = !string.IsNullOrEmpty(value) && ListPayRange.Count > 0
                        ? ListPayRange.LastOrDefault().Code
                        : "";
                    OldPayRange = !string.IsNullOrEmpty(value) && ListPayRange.Count > 1
                        ? ListPayRange[ListPayRange.Count - 2].Code
                        : "";
                }
            }
            public string NewPayRange { get; set; }
            public string OldPayRange { get; set; }
        }
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
            public int? Gender { get; set; }
            public string NumberOfYears { get; set; }
            public string YearsOfWork { get; set; }
            public string Wage { get; set; }
            public string EducationalLevel { get; set; }
            public string Status { get; set; }
            public bool? IsWorking { get; set; }
            public int? CountDayEndContract { get; set; }
        }
        public class HrEmployeeModelProceduce
        {
            public int Id { get; set; }
            public string FullName { get; set; }
            public int? Gender { get; set; }
            public string PermanentResidence { get; set; }
            public string EmployeeType { get; set; }
            public string Status { get; set; }
            public string StatusCode { get; set; }
            public string Picture { get; set; }
            public string PirthOfPlace { get; set; }
            public string Unit { get; set; }
            public string Position { get; set; }
            public string UnitName { get; set; }
            public string PositionName { get; set; }
            public string EndTimeContract { get; set; }
            public DateTime? EndTime { get; set; }
            public string EmployeeCode { get; set; }
            public int? CountWorking { get; set; }
            public int? CountNotWorking { get; set; }
            public Int64 RowNumber { get; set; }
            public int TotalRow { get; set; }
            public List<JsonLog> ListDepartment { get; set; }
            public string LogDepartment
            {
                get
                {
                    return JsonConvert.SerializeObject(ListDepartment);
                }
                set
                {
                    ListDepartment = string.IsNullOrEmpty(value)
                ? new List<JsonLog>()
                : JsonConvert.DeserializeObject<List<JsonLog>>(value);
                    NewDepartment = !string.IsNullOrEmpty(value) && ListDepartment.Count > 0
                   ? JsonConvert.DeserializeObject<List<JsonLog>>(value).LastOrDefault().Name
                   : "";

                }
            }
            public string NewDepartment { get; set; }
            public string GetDepartment
            {
                get
                {
                    return JsonConvert.SerializeObject(ListDepartment);
                }
                set
                {
                    NewDepartment = string.IsNullOrEmpty(value)
                    ? JsonConvert.DeserializeObject<List<JsonLog>>(value).LastOrDefault().Name
                    : "";
                }
            }
            public string PayTitle { get; set; }
            public int? Ord { get; set; }
            public string Color { get; set; }
        }
        #endregion

        #region Log Data
        [HttpGet]
        public object GetJsonData(int id)
        {
            var msg = new JMessage { Title = "", Error = false };

            var user = _context.HREmployees.FirstOrDefault(x => x.flag == 1 && x.Id.Equals(id));
            if (user != null)
            {
                var listLog = new List<object>();
                var logStatus = new
                {
                    Type = "Theo dõi thay trạng thái nhân viên",
                    Data = !string.IsNullOrEmpty(user.logStatus) ? JsonConvert.DeserializeObject<List<object>>(user.logStatus) : new List<object>()
                };

                var logPayScale = new
                {
                    Type = "Theo dõi thay đổi thang lương",
                    Data = !string.IsNullOrEmpty(user.logPayScale) ? JsonConvert.DeserializeObject<List<object>>(user.logPayScale) : new List<object>()
                };
                var logPayRange = new
                {
                    Type = "Theo dõi thay đổi bậc lương",
                    Data = !string.IsNullOrEmpty(user.logPayRange) ? JsonConvert.DeserializeObject<List<object>>(user.logPayRange) : new List<object>()

                };
                var logDepartment = new
                {
                    Type = "Theo dõi thay đổi phòng ban",
                    Data = !string.IsNullOrEmpty(user.logDepartment) ? JsonConvert.DeserializeObject<List<object>>(user.logDepartment) : new List<object>()
                };
                var logPosition = new
                {
                    Type = "Theo dõi thay đổi chức vụ",
                    Data = !string.IsNullOrEmpty(user.logPosition) ? JsonConvert.DeserializeObject<List<object>>(user.logPosition) : new List<object>()
                };

                listLog.Add(logPayScale);
                listLog.Add(logPayRange);
                listLog.Add(logStatus);
                listLog.Add(logDepartment);
                listLog.Add(logPosition);

                msg.Object = JsonConvert.SerializeObject(listLog);
            }
            else
            {
                msg.Error = true;
                msg.Title = "Không lấy được thông tin nhân viên";
            }

            return msg;
        }
        #endregion

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new Newtonsoft.Json.Linq.JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_edmsRepositoryController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerFp.GetAllStrings().Select(x => new { x.Name, x.Value }))
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
