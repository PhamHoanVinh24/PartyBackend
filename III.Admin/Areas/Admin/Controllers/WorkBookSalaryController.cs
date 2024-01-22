using System;
using System.Collections.Generic;
using System.Data;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using III.Domain.Enums;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using OpenXmlPowerTools;
using Syncfusion.EJ2.DocumentEditor;
using Syncfusion.EJ2.Spreadsheet;
using Syncfusion.XlsIO;
using System.Net.Http;
using System.Text;
using Microsoft.AspNetCore.Http.Internal;
using ESEIM;
using Syncfusion.Drawing;
using System.Net;
using SmartBreadcrumbs.Attributes;
using static Dropbox.Api.Paper.ListPaperDocsSortBy;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class WorkBookSalaryController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IStringLocalizer<WorkBookSalaryController> _stringLocalizer;
        public static AseanDocument docmodel = new AseanDocument();
        public static string _month = new string("");
        public readonly string module_name = "SALARY";
        public string path_upload_file = "";
        public string repos_code = "";
        public string cat_code = "";
        public int host_type = 1;
        public static string pathFile = new string("");
        public WorkBookSalaryController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment,
            IStringLocalizer<WorkBookSalaryController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _hostingEnvironment = hostingEnvironment;
            _context = context;
            _upload = upload;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
            var obj = (EDMSCatRepoSetting)_upload.GetPathByModule(module_name).Object;
            repos_code = obj.ReposCode;
            cat_code = obj.CatCode;
            if (obj.Path == "")
            {
                host_type = 1;
                path_upload_file = obj.FolderId;
            }
            else
            {
                host_type = 0;
                path_upload_file = obj.Path;
            }
        }
        [Breadcrumb("ViewData.WBSalary", AreaName = "Admin", FromAction = "Index", FromController = typeof(EmployeeHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbEmployeeHome"] = _sharedResources["COM_CRUMB_EMPLOYEE_HOME"];
            ViewData["WBSalary"] = _sharedResources["COM_CRUMB_WB_SALARY"];
            return View();
        }

        #region Open, export and Save Excel
        public IActionResult OpenFromLocal(IFormCollection openRequest)
        {
            OpenRequest open = new OpenRequest();
            open.File = openRequest.Files[0];
            return Content(Workbook.Open(open));
        }
        public object Save(SaveSettings saveSettings)
        {
            DateTime? monthTime = !string.IsNullOrEmpty(_month) ? DateTime.ParseExact(_month, "MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDay = DateTime.Now;
            var msg = new JMessage();
            ExcelEngine excelEngine = new ExcelEngine();
            IApplication application = excelEngine.Excel;
            Stream fileStream = Workbook.Save<Stream>(saveSettings);
            IWorkbook workbook = application.Workbooks.Open(fileStream);
            string urlFile = "";
            string pathFTP = path_upload_file;
            var fileName = string.Format("Salary_{0}{1}{2}.xlsx", (monthTime.HasValue ? monthTime.Value.Month : toDay.Month), (monthTime.HasValue ? monthTime.Value.Year : toDay.Year), toDay.ToString("HHmmss"));
            var fileId = "";

            using (FileStream outputFileStream = new FileStream(string.Concat(_hostingEnvironment.WebRootPath, pathFile), FileMode.Create))
            {
                fileStream.CopyTo(outputFileStream);
                workbook.SaveAs(outputFileStream);
                outputFileStream.Close();
            }

            SaveDataDB(_month);

            var getRepository = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == repos_code);
            if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server))
            {
                using (var ms = new MemoryStream())
                {
                    using (FileStream outputFileStream = new FileStream(string.Concat(_hostingEnvironment.WebRootPath, pathFile), FileMode.Open))
                    {
                        fileStream.CopyTo(outputFileStream);
                        outputFileStream.CopyTo(ms);
                        outputFileStream.Close();
                    }

                    var fileBytes = ms.ToArray();
                    urlFile = pathFTP + Path.Combine("/", fileName);
                    var urlFilePreventive = pathFTP + Path.Combine("/", Guid.NewGuid().ToString().Substring(0, 8) + fileName);
                    var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + getRepository.Server + urlFile);
                    var urlEndPreventive = System.Web.HttpUtility.UrlPathEncode("ftp://" + getRepository.Server + urlFilePreventive);
                    var result = FileExtensions.UploadFileToFtpServer(urlEnd, urlEndPreventive, fileBytes, getRepository.Account, getRepository.PassWord);
                    if (result.Status == WebExceptionStatus.ConnectFailure || result.Status == WebExceptionStatus.ProtocolError)
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["WBS_MSG_ERR_CONNECTION"];
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
                    }
                }
            }
            else
            {
                var apiTokenService = _context.TokenManagers.FirstOrDefault(x => x.AccountCode == getRepository.Token);
                var json = apiTokenService.CredentialsJson;
                var user = apiTokenService.Email;
                var token = apiTokenService.RefreshToken;
                fileId = FileExtensions.UploadFileToDrive(json, token, fileName, fileStream, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", path_upload_file, user);
            }

            //var file = new EDMSFile
            //{
            //    FileCode = edmsReposCatFile.FileCode,
            //    FileName = fileName,
            //    Desc = "",
            //    ReposCode = repos_code,
            //    Tags = "",
            //    FileSize = fileUpload.Length,
            //    FileTypePhysic = extension,
            //    NumberDocument = "",
            //    CreatedBy = ESEIM.AppContext.UserName,
            //    CreatedTime = DateTime.Now,
            //    Url = urlFile,
            //    MimeType = fileUpload.ContentType,
            //    CloudFileId = fileId,
            //};

            var edmsReposCatFile = new EDMSRepoCatFile
            {
                FileCode = string.Concat("REPOSITORY", Guid.NewGuid().ToString()),
                ReposCode = repos_code,
                CatCode = cat_code,
                ObjectCode = null,
                ObjectType = null,
                Path = host_type == 0 ? path_upload_file : "",
                FolderId = host_type == 1 ? path_upload_file : ""
            };

            var moduleObj = (EDMSCatRepoSetting)_upload.GetPathByModule("DB_LUCENE_INDEX").Object;
            var luceneCategory = _context.EDMSCategorys.FirstOrDefault(x => x.CatCode == moduleObj.CatCode);
            //LuceneExtension.IndexFile(edmsReposCatFile.FileCode, new FormFile(fileStream, 0, fileStream.Length), luceneCategory.PathServerPhysic);

            var file = new EDMSFile
            {
                FileCode = edmsReposCatFile.FileCode,
                FileName = fileName,
                Desc = "",
                ReposCode = repos_code,
                Tags = "",
                FileSize = fileStream.Length,
                FileTypePhysic = ".xlsx",
                NumberDocument = "",
                CreatedBy = ESEIM.AppContext.UserName,
                CreatedTime = DateTime.Now,
                Url = urlFile,
                MimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                CloudFileId = "",
            };

            _context.EDMSFiles.Add(file);
            _context.EDMSRepoCatFiles.Add(edmsReposCatFile);
            _context.SaveChanges();

            return Response.WriteAsync("<script>location.href = '/Admin/WorkBookSalary'</script>"); ;
        }
        #endregion

        #region Calculate Salary
        [HttpPost]
        public JsonResult GetEmployee()
        {
            var data = from a in _context.HREmployees.Where(x => x.flag == 1)
                       select new
                       {
                           Code = a.Id,
                           Name = a.fullname,
                           DepartmentId = a.unit
                       };
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetBasicInfo()
        {
            var objBasicSalary = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == "BASIC_SALARY");
            var objCostLunch = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == "BASIC_COST_LUNCH");
            var objBusinessSalary = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == "BASIC_BUSINESS_SALARY");
            return Json(new
            {
                BasicSalary = objBasicSalary?.ValueSet ?? "1400000",
                CostLunch = objCostLunch?.ValueSet ?? "3000000",
                BasicBusinessSalary = objBasicSalary?.ValueSet ?? "10000",
            });
        }

        [HttpPost]
        public JsonResult GetEmployeeDetail(string month, string user, decimal? totalDay)
        {
            DateTime time = !string.IsNullOrEmpty(month) ? DateTime.ParseExact(month, "MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;
            var listSalaryEmployee = _context.SalaryEmployeeMonths.OrderBy(x => x.DepartmentCode).Where(x => !x.IsDeleted && x.Month.Month.Equals(time.Month) && x.Month.Year.Equals(time.Year)).ToList();
            var year = 0;
            var monthRecei = 0;
            var countDayOff = 0;
            var listDayOff = GetHoliday();
            countDayOff = listDayOff.Any(x => x.Month.Equals(time.Month)) ? listDayOff.FirstOrDefault(x => x.Month.Equals(time.Month)).DayOff : 0;
            var _listDayOff = listDayOff.Where(x => x.Month.Equals(time.Month)).ToList();

            if (string.IsNullOrEmpty(month))
            {
                var currentTime = DateTime.Now;
                year = currentTime.Year;
                monthRecei = currentTime.Month;
            }
            else
            {
                year = time.Year;
                monthRecei = time.Month;
            }

            var userName = "";
            var userId = "";
            if (!string.IsNullOrEmpty(user))
            {
                var aspNetUser = _context.Users.FirstOrDefault(x => x.Active && x.EmployeeCode == user);
                userName = aspNetUser != null ? aspNetUser.UserName : "";
                userId = aspNetUser != null ? aspNetUser.Id : "";
            }

            var timeWorking = TimeWorking(monthRecei, year, userName);

            var notWork = _context.WorkShiftCheckInOuts.Where(x => !x.IsDeleted && (string.IsNullOrEmpty(userId) || x.UserId.Equals(userId)) && (x.ActionTime.Month.Equals(time.Month) || (x.ActionTo != null && x.ActionTo.Value.Month.Equals(time.Month))) && !string.IsNullOrEmpty(x.NotWorkType) && x.Approve).ToList();

            //Báo phép
            var countP = notWork.Where(x => x.NotWorkType.Equals("NOT_WORK_TYPE_01")).GroupBy(x => x.UserId).Select(y => new DayWorkingSheet
            {
                UserId = y.First().UserId,
                Day = CountDayByUser(y.Where(x => x.UserId.Equals(y.First().UserId)).ToList(), time.Month, _listDayOff, true).Count,
                ListDay = CountDayByUser(y.Where(x => x.UserId.Equals(y.First().UserId)).ToList(), time.Month, _listDayOff, true).ListDay,
            });

            //Nghỉ con ốm
            var countCO = notWork.Where(x => x.NotWorkType.Equals("NOT_WORK_TYPE_02")).GroupBy(x => x.UserId).Select(y => new DayWorkingSheet
            {
                UserId = y.First().UserId,
                Day = CountDayByUser(y.Where(x => x.UserId.Equals(y.First().UserId)).ToList(), time.Month, _listDayOff, true).Count,
                ListDay = CountDayByUser(y.Where(x => x.UserId.Equals(y.First().UserId)).ToList(), time.Month, _listDayOff, true).ListDay,
            });
            //Nghỉ không lương
            var countKL = notWork.Where(x => x.NotWorkType.Equals("NOT_WORK_TYPE_03")).GroupBy(x => x.UserId).Select(y => new DayWorkingSheet
            {
                UserId = y.First().UserId,
                Day = CountDayByUser(y.Where(x => x.UserId.Equals(y.First().UserId)).ToList(), time.Month, _listDayOff, true).Count,
                ListDay = CountDayByUser(y.Where(x => x.UserId.Equals(y.First().UserId)).ToList(), time.Month, _listDayOff, true).ListDay,
            });
            //Nghỉ ốm
            var countO = notWork.Where(x => x.NotWorkType.Equals("NOT_WORK_TYPE_04")).GroupBy(x => x.UserId).Select(y => new DayWorkingSheet
            {
                UserId = y.First().UserId,
                Day = CountDayByUser(y.Where(x => x.UserId.Equals(y.First().UserId)).ToList(), time.Month, _listDayOff, true).Count,
                ListDay = CountDayByUser(y.Where(x => x.UserId.Equals(y.First().UserId)).ToList(), time.Month, _listDayOff, true).ListDay,
            });
            //Việc riêng
            var countVR = notWork.Where(x => x.NotWorkType.Equals("NOT_WORK_TYPE_05")).GroupBy(x => x.UserId).Select(y => new DayWorkingSheet
            {
                UserId = y.First().UserId,
                Day = CountDayByUser(y.Where(x => x.UserId.Equals(y.First().UserId)).ToList(), time.Month, _listDayOff, true).Count,
                ListDay = CountDayByUser(y.Where(x => x.UserId.Equals(y.First().UserId)).ToList(), time.Month, _listDayOff, true).ListDay,
            });

            var planSchedule = _context.WorkShiftCheckInOuts.Where(x => !x.IsDeleted && (string.IsNullOrEmpty(userId) || x.UserId.Equals(userId)) && (x.ActionTime.Month.Equals(time.Month) || (x.ActionTo != null && x.ActionTo.Value.Month.Equals(time.Month))) && string.IsNullOrEmpty(x.NotWorkType) && x.Approve && x.Action.Equals(EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule))).ToList();
            //Lịch công tác
            var countCT = planSchedule.GroupBy(x => x.UserId).Select(y => new DayWorkingSheet
            {
                UserId = y.First().UserId,
                Day = CountDayByUser(y.Where(x => x.UserId.Equals(y.First().UserId)).ToList(), time.Month, _listDayOff, true).Count,
                ListDay = CountDayByUser(y.Where(x => x.UserId.Equals(y.First().UserId)).ToList(), time.Month, _listDayOff, true).ListDay,
            });

            var data = (from a in _context.HREmployees.Where(x => x.flag == 1)
                        join b in _context.Users.Where(x => x.Active) on a.Id.ToString() equals b.EmployeeCode
                        join c in timeWorking on b.UserName equals c.UserName into c1
                        from c2 in c1.DefaultIfEmpty()
                        join d in _context.AdDepartments.Where(x => !x.IsDeleted) on a.unit equals d.DepartmentCode into d1
                        from d2 in d1.DefaultIfEmpty()
                            //Nghỉ
                        join e in countP on b.Id equals e.UserId into e1
                        from e2 in e1.DefaultIfEmpty()
                        join f in countCO on b.Id equals f.UserId into f1
                        from f2 in f1.DefaultIfEmpty()
                        join g in countKL on b.Id equals g.UserId into g1
                        from g2 in g1.DefaultIfEmpty()
                        join h in countO on b.Id equals h.UserId into h1
                        from h2 in h1.DefaultIfEmpty()
                        join i in countVR on b.Id equals i.UserId into i1
                        from i2 in i1.DefaultIfEmpty()
                            //Công tác
                        join k in countCT on b.Id equals k.UserId into k1
                        from k2 in k1.DefaultIfEmpty()

                        join m in listSalaryEmployee on a.Id.ToString() equals m.EmployeeId into m1
                        from m2 in m1.DefaultIfEmpty()

                        let WorkingProcess = _context.HRWorkingProcesss.Where(x => x.flag == 1 && x.Employee_Id.Value.Equals(a.Id)).OrderByDescending(y => y.End_Date)
                        let obj = WorkingProcess.Where(x => x.End_Date.HasValue).Count() > 0 ? WorkingProcess.Where(x => x.End_Date.HasValue).First() : WorkingProcess.Count() > 0 ? WorkingProcess.Where(x => !x.End_Date.HasValue).First() : null
                        let salary = _context.HRContracts.Where(x => x.flag == 1 && x.Employee_Id.Value.Equals(a.Id)).OrderByDescending(x => x.End_Time).FirstOrDefault()
                        where (string.IsNullOrEmpty(user) || b.EmployeeCode.Equals(user))
                        select new StaffTimeKeepingDetail(
                            a.Id,
                            a.fullname,
                            (m2 != null && !string.IsNullOrEmpty(m2.SalaryLevel)) ? m2.SalaryLevel : (obj != null ? obj.Wage_Level : ""),
                            (m2 != null && !string.IsNullOrEmpty(m2.SalaryRatio)) ? double.Parse(m2.SalaryRatio) : (obj != null ? obj.Salary_Ratio : 0),
                            d2 != null ? d2.DepartmentCode : "",
                            d2 != null ? d2.Title : "",
                            //month,
                            (m2 != null && !string.IsNullOrEmpty(m2.SalaryRatio)) ? double.Parse(m2.SalaryRatio) : (obj != null ? obj.Salary_Ratio : 0),//HS Lương
                            (m2 != null && m2.E != null) ? double.Parse(m2.E.ToString()) : (double)(c2.TimeWorking.HasValue ? c2.TimeWorking : 0),//Ngày làm việc tại VP
                            new List<TimeWorkingShift>(),
                            (m2 != null && m2.F != null) ? (double)m2.F : (double)((f2 != null ? f2.Day : 0) + (h2 != null ? h2.Day : 0)),// Con Ốm + Nghỉ ốm
                            (m2 != null && m2.G != null) ? (double)m2.G : (double)(e2 != null ? e2.Day : 0),//Phép
                            (m2 != null && m2.H != null) ? (int)m2.H : 0,
                            (m2 != null && m2.I != null) ? (int)m2.I : 0,
                            (m2 != null && m2.J != null) ? (int)m2.J : 0,
                            (m2 != null && m2.K != null) ? (int)m2.K : 0,//K=I+J
                            (m2 != null && m2.L != null) ? (int)m2.L : 0,
                            (m2 != null && m2.M != null) ? (int)m2.M : 0,
                            (m2 != null && m2.N != null) ? (int)m2.N : 0,
                            (m2 != null && m2.O != null) ? (int)m2.O : 0,//O=M*N
                            (m2 != null && m2.P != null) ? (int)m2.P : 0,
                            (m2 != null && m2.Q != null) ? (int)m2.Q : 0,
                            (m2 != null && m2.R != null) ? (int)m2.R : 0,//R=K+O+P+Q
                            (m2 != null && m2.S != null) ? (int)m2.S : 0,
                            (m2 != null && m2.AT != null) ? (int)m2.AT : 0,//Ăn trưa
                            (m2 != null && m2.T != null) ? (int)m2.T : 0,//T=R-S
                            (m2 != null && m2.U != null) ? (int)m2.U : 0,
                            (m2 != null && m2.V != null) ? (double)m2.V : (double)(k2 != null ? k2.Day : 0),//Công tác
                            0,
                            (m2 != null && m2.VR != null) ? (double)m2.VR : (double)(i2 != null ? i2.Day : 0),//Việc riêng
                            countDayOff,//Nghỉ lễ
                            (m2 != null && m2.Y != null) ? (double)m2.Y : (double)(g2 != null ? g2.Day : 0),//Nghỉ không lương,
                            0,
                            new List<Data>(),
                            //totalDay != null ? totalDay : 0
                            time.Month,
                            time.Year
                        )).OrderBy(x => x.DepartmentCode).ToList();

            var objRs = new
            {
                data,
            };
            return Json(objRs);
        }

        [HttpPost]
        public JsonResult SaveEmployeeDetail(string month, List<StaffTimeKeepingDetail> details)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                DateTime time = !string.IsNullOrEmpty(month) ? DateTime.ParseExact(month, "MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;
                foreach (var item in details)
                {
                    var check = _context.StaffTimeKeepings.Any(x => x.EmployeeId == item.Code.ToString() && x.DepartmentCode == item.DepartmentCode && x.Month == month && !x.IsDeleted);
                    if (check)
                    {
                        var obj = _context.StaffTimeKeepings.FirstOrDefault(x => x.EmployeeId == item.Code.ToString() && x.DepartmentCode == item.DepartmentCode && x.Month == month && !x.IsDeleted);
                        obj.JsonMonth = JsonConvert.SerializeObject(item);
                        obj.UpdatedBy = ESEIM.AppContext.UserName;
                        obj.UpdatedTime = DateTime.Now;
                    }
                    else
                    {
                        _context.StaffTimeKeepings.Add(new StaffTimeKeeping()
                        {
                            EmployeeId = item.Code.ToString(),
                            DepartmentCode = item.DepartmentCode,
                            Name = item.Name,
                            Month = month,
                            JsonMonth = JsonConvert.SerializeObject(item),
                            TotalDay = decimal.Parse(item.E.ToString()),
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now,
                            IsDeleted = false,
                            DeletionToken = "NA"
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra";
            }
            return Json(msg);
        }

        [NonAction]
        private List<DayOffMonth> GetHoliday()
        {
            var listDayOff = new List<DayOffMonth>();
            var lstHoliday = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals(EnumHelper<EmployeeEnum>.GetDisplayValue(EmployeeEnum.EmployeeHoliday)));
            if (lstHoliday.Any())
            {
                foreach (var item in lstHoliday)
                {
                    if (item.ValueSet.Contains("/"))
                    {
                        var arr = item.ValueSet.Split("/", StringSplitOptions.None);
                        var monthHoliday = Convert.ToInt32(arr[1]);

                        var dayOff = listDayOff.FirstOrDefault(x => x.Month == monthHoliday);
                        if (dayOff != null)
                        {
                            dayOff.ListDateOff.Add(item.ValueSet);
                            dayOff.DayOff++;
                        }
                        else
                        {
                            var dayOffMonth = new DayOffMonth
                            {
                                Month = monthHoliday,
                                DayOff = 1,
                                ListDateOff = new List<string>
                           {
                               item.ValueSet
                           }
                            };
                            listDayOff.Add(dayOffMonth);
                        }
                    }
                }
            }
            return listDayOff;
        }

        [HttpPost]
        public JsonResult GetEmployeeDetailTimeSheet(string month, string departmentId)
        {
            DateTime time = !string.IsNullOrEmpty(month) ? DateTime.ParseExact(month, "MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;
            var year = 0;
            var monthRecei = 0;
            var countDayOff = 0;
            var listDayOff = GetHoliday();

            var arrDay = new List<Data>();
            var listDateInMonth = GetDates(time.Year, time.Month);
            for (int i = 1; i <= 31; i++)
            {
                var holiDay = listDateInMonth.Any(x => (x.Day.Equals(i) && x.DayOfWeek.ToString().Equals("Sunday")) || (x.Day.Equals(i) && x.DayOfWeek.ToString().Equals("Saturday")));
                var dayOff = listDateInMonth.Any(x => x.Day.Equals(i) && listDayOff.Where(m => m.Month.Equals(time.Month)).Any(p => p.ListDateOff.Any(k => k.Equals(x.Date.ToString("dd/MM")))));
                var d = new Data
                {
                    Key = i.ToString(),
                    Value = dayOff ? "nl" : "",
                    HoliDay = holiDay
                };
                arrDay.Add(d);
            }

            countDayOff = listDayOff.Any(x => x.Month.Equals(time.Month)) ? listDayOff.FirstOrDefault(x => x.Month.Equals(time.Month)).DayOff : 0;
            var _listDayOff = listDayOff.Where(x => x.Month.Equals(time.Month)).ToList();

            if (string.IsNullOrEmpty(month))
            {
                var currentTime = DateTime.Now;
                year = currentTime.Year;
                monthRecei = currentTime.Month;
            }
            else
            {
                year = time.Year;
                monthRecei = time.Month;
            }

            var listUser = new List<string>();
            if (!string.IsNullOrEmpty(departmentId))
            {
                listUser = (from a in
                    _context.Users.Where(x => x.Active && x.DepartmentId == departmentId)
                            join b in _context.HREmployees.Where(x => x.flag == 1) on a.EmployeeCode equals b.Id.ToString()
                            select a
                    ).Select(x => x.Id).ToList();
            }

            var timeWorking = TimeWorking(monthRecei, year, "");

            var workShiftCheckInOut = _context.WorkShiftCheckInOuts.Where(x => !x.IsDeleted && (listUser.Count == 0 || listUser.Any(p => p.Equals(x.UserId))) && (x.ActionTime.Month.Equals(time.Month) || (x.ActionTo != null && x.ActionTo.Value.Month.Equals(time.Month))) && x.Approve).ToList();

            var notWork = _context.WorkShiftCheckInOuts.Where(x => !x.IsDeleted && (listUser.Count == 0 || listUser.Any(p => p.Equals(x.UserId))) && (x.ActionTime.Month.Equals(time.Month) || (x.ActionTo != null && x.ActionTo.Value.Month.Equals(time.Month))) && !string.IsNullOrEmpty(x.NotWorkType) && x.Approve).ToList();

            //Chi tiết
            var listData = listUser.Select(y => new DayWorkingSheet
            {
                UserId = y,
                Day = CountDayByUserTimeSheet(workShiftCheckInOut.Where(x => x.UserId == y).ToList(), time.Month, _listDayOff, true, arrDay).Count,
                ListDay = CountDayByUserTimeSheet(workShiftCheckInOut.Where(x => x.UserId == y).ToList(), time.Month, _listDayOff, true, arrDay, timeWorking.Where(x => x.UserId == y).FirstOrDefault()).ListDay,
            });

            //Báo phép
            var countP = notWork.Where(x => x.NotWorkType.Equals("NOT_WORK_TYPE_01")).GroupBy(x => x.UserId).Select(y => new DayWorkingSheet
            {
                UserId = y.First().UserId,
                Day = CountDayByUserTimeSheet(y.Where(x => x.UserId.Equals(y.First().UserId)).ToList(), time.Month, _listDayOff, true, arrDay).Count,
                ListDay = CountDayByUserTimeSheet(y.Where(x => x.UserId.Equals(y.First().UserId)).ToList(), time.Month, _listDayOff, true, arrDay).ListDay,
            });

            //Nghỉ con ốm
            var countCO = notWork.Where(x => x.NotWorkType.Equals("NOT_WORK_TYPE_02")).GroupBy(x => x.UserId).Select(y => new DayWorkingSheet
            {
                UserId = y.First().UserId,
                Day = CountDayByUserTimeSheet(y.Where(x => x.UserId.Equals(y.First().UserId)).ToList(), time.Month, _listDayOff, true, arrDay).Count,
                ListDay = CountDayByUserTimeSheet(y.Where(x => x.UserId.Equals(y.First().UserId)).ToList(), time.Month, _listDayOff, true, arrDay).ListDay,
            });
            //Nghỉ không lương
            var countKL = notWork.Where(x => x.NotWorkType.Equals("NOT_WORK_TYPE_03")).GroupBy(x => x.UserId).Select(y => new DayWorkingSheet
            {
                UserId = y.First().UserId,
                Day = CountDayByUserTimeSheet(y.Where(x => x.UserId.Equals(y.First().UserId)).ToList(), time.Month, _listDayOff, true, arrDay).Count,
                ListDay = CountDayByUserTimeSheet(y.Where(x => x.UserId.Equals(y.First().UserId)).ToList(), time.Month, _listDayOff, true, arrDay).ListDay,
            });
            //Nghỉ ốm
            var countO = notWork.Where(x => x.NotWorkType.Equals("NOT_WORK_TYPE_04")).GroupBy(x => x.UserId).Select(y => new DayWorkingSheet
            {
                UserId = y.First().UserId,
                Day = CountDayByUserTimeSheet(y.Where(x => x.UserId.Equals(y.First().UserId)).ToList(), time.Month, _listDayOff, true, arrDay).Count,
                ListDay = CountDayByUserTimeSheet(y.Where(x => x.UserId.Equals(y.First().UserId)).ToList(), time.Month, _listDayOff, true, arrDay).ListDay,
            });
            //Việc riêng
            var countVR = notWork.Where(x => x.NotWorkType.Equals("NOT_WORK_TYPE_05")).GroupBy(x => x.UserId).Select(y => new DayWorkingSheet
            {
                UserId = y.First().UserId,
                Day = CountDayByUserTimeSheet(y.Where(x => x.UserId.Equals(y.First().UserId)).ToList(), time.Month, _listDayOff, true, arrDay).Count,
                ListDay = CountDayByUserTimeSheet(y.Where(x => x.UserId.Equals(y.First().UserId)).ToList(), time.Month, _listDayOff, true, arrDay).ListDay,
            });

            var planSchedule = _context.WorkShiftCheckInOuts.Where(x => !x.IsDeleted && (listUser.Count == 0 || listUser.Any(p => p.Equals(x.UserId))) && (x.ActionTime.Month.Equals(time.Month) || (x.ActionTo != null && x.ActionTo.Value.Month.Equals(time.Month))) && string.IsNullOrEmpty(x.NotWorkType) && x.Approve && x.Action.Equals(EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule))).ToList();
            //Lịch công tác && Công tác ngày nghỉ
            var countCT = planSchedule.GroupBy(x => x.UserId).Select(y => new DayWorkingSheet
            {
                UserId = y.First().UserId,
                Day = CountDayByUserTimeSheet(y.Where(x => x.UserId.Equals(y.First().UserId)).ToList(), time.Month, _listDayOff, false, arrDay).Count,
                WorkHoliday = CountDayByUserTimeSheet(y.Where(x => x.UserId.Equals(y.First().UserId)).ToList(), time.Month, _listDayOff, false, arrDay).CountWorkHoliday,
                ListDay = CountDayByUserTimeSheet(y.Where(x => x.UserId.Equals(y.First().UserId)).ToList(), time.Month, _listDayOff, false, arrDay).ListDay,
            });
            // staff time keeping save in db
            var listDataKeeping = _context.StaffTimeKeepings.Where(x => !x.IsDeleted && x.DepartmentCode == departmentId && x.Month == month)
                .Select(x => JsonConvert.DeserializeObject<StaffTimeKeepingDetail>(x.JsonMonth)).ToList();

            var data = (from a in _context.HREmployees.Where(x => x.flag == 1)
                        join b in _context.Users.Where(x => x.Active) on a.Id.ToString() equals b.EmployeeCode
                        join c in timeWorking on b.UserName equals c.UserName into c1
                        from c2 in c1.DefaultIfEmpty()
                        join d in _context.AdDepartments.Where(x => !x.IsDeleted && x.DepartmentCode == departmentId) on a.unit equals d.DepartmentCode into d1
                        from d2 in d1.DefaultIfEmpty()
                            //Nghỉ
                        join e in countP on b.Id equals e.UserId into e1
                        from e2 in e1.DefaultIfEmpty()
                        join f in countCO on b.Id equals f.UserId into f1
                        from f2 in f1.DefaultIfEmpty()
                        join g in countKL on b.Id equals g.UserId into g1
                        from g2 in g1.DefaultIfEmpty()
                        join h in countO on b.Id equals h.UserId into h1
                        from h2 in h1.DefaultIfEmpty()
                        join i in countVR on b.Id equals i.UserId into i1
                        from i2 in i1.DefaultIfEmpty()
                            //Công tác
                        join k in countCT on b.Id equals k.UserId into k1
                        from k2 in k1.DefaultIfEmpty()
                            //Chi tiết
                        join l in listData on b.Id equals l.UserId into l1
                        from l2 in l1.DefaultIfEmpty()
                            //Hr custom
                        join m in listDataKeeping on a.Id equals m.Code into m1
                        from m in m1.DefaultIfEmpty()

                        let WorkingProcess = _context.HRWorkingProcesss.Where(x => x.flag == 1 && x.Employee_Id.Equals(a.Id)).OrderByDescending(y => y.End_Date)
                        let obj = WorkingProcess.Where(x => x.End_Date.HasValue).Count() > 0 ? WorkingProcess.Where(x => x.End_Date.HasValue).First() : WorkingProcess.Count() > 0 ? WorkingProcess.Where(x => !x.End_Date.HasValue).First() : null
                        let salary = _context.HRContracts.Where(x => x.flag == 1 && x.Employee_Id.Equals(a.Id)).OrderByDescending(x => x.End_Time).FirstOrDefault()
                        where (listUser.Count == 0 || listUser.Any(p => p.Equals(b.Id)))
                        select new StaffTimeKeepingDetail()
                        {
                            Code = a.Id,
                            Name = a.fullname,
                            SalaryLevel = obj != null ? obj.Wage_Level : "",
                            SalaryRatio = obj != null ? obj.Salary_Ratio : 0,
                            DepartmentCode = d2 != null ? d2.DepartmentCode : "",
                            DepartmentName = d2 != null ? d2.Title : "",
                            D = obj != null ? obj.Salary_Ratio : 0,//HS Lương
                            E = m != null ? m.E : (c2.TimeWorking.HasValue ? c2.TimeWorking : 0),//Ngày làm việc tại VP
                            E1 = m != null ? m.E1 : (c2.HourWorking.HasValue ? c2.HourWorking : 0), // Giờ làm việc bt
                            E2 = m != null ? m.E2 : (c2.HourOvertime.HasValue ? c2.HourOvertime : 0), // Giờ làm thêm
                            E3 = m != null ? m.E3 : (c2.HourWorkingBussiness.HasValue ? c2.HourWorkingBussiness : 0), // Giờ công tác
                            E4 = m != null ? m.E4 : (c2.HourOvertimeBussiness.HasValue ? c2.HourOvertimeBussiness : 0), // Giờ công tác làm thêm
                            Z = m != null ? m.Z : (c2.ListShift),
                            F = m != null ? m.F : (h2 != null ? h2.Day : 0),// Nghỉ ốm
                            G = m != null ? m.G : (e2 != null ? e2.Day : 0),//Phép
                            H = 0,
                            I = 0,
                            J = 0,
                            K = 0,//K=I+J
                            L = 0,
                            M = 0,
                            N = 0,
                            O = 0,//O=M*N
                            P = 0,
                            Q = 0,
                            R = 0,//R=K+O+P+Q
                            S = 0,
                            AT = 0,//Ăn trưa
                            T = 0,//T=R-S
                            U = 0,
                            V = m != null ? m.V : (k2 != null ? k2.Day : 0),//Công tác
                            CTNN = m != null ? m.CTNN : (k2 != null ? k2.WorkHoliday : 0),//Công tác ngày nghỉ
                            VR = m != null ? m.VR : (i2 != null ? i2.Day : 0),//Việc riêng
                            X = m != null ? m.X : (l2 != null ? (countDayOff - (l2.ListDay.Any(x => x.CountWorkNL > 0) ? l2.ListDay.First(x => x.CountWorkNL > 0).CountWorkNL : 0)) : countDayOff),//Nghỉ lễ
                            Y = m != null ? m.Y : (g2 != null ? g2.Day : 0),//Nghỉ không lương
                            CO = m != null ? m.CO : (f2 != null ? f2.Day : 0),// Con Ốm
                            ListData = m != null ? m.ListData : (l2 != null ? l2.ListDay : arrDay),
                            Month = time.Month,
                            Year = time.Year
                        }).OrderBy(x => x.DepartmentCode).ToList();

            var groupDepartment = data.GroupBy(x => new { x.DepartmentCode, x.DepartmentName }).Select(x => new { x.Key.DepartmentCode, x.Key.DepartmentName }).ToList();
            var objRs = new
            {
                data,
                totalP = countP.Sum(x => x.Day),
                totalCT = countCT.Sum(x => x.Day),
                totalCTNN = countCT.Sum(x => x.WorkHoliday),
                totalNL = data.Sum(x => x.X),
                totalVR = countVR.Sum(x => x.Day),
                totalO = countO.Sum(x => x.Day),
                totalCO = countCO.Sum(x => x.Day),
                totalKL = countKL.Sum(x => x.Day),
                totalVP = data.Sum(x => x.E),
                totalVP1 = data.Sum(x => x.E1),
                totalVP2 = data.Sum(x => x.E2),
                totalVP3 = data.Sum(x => x.E3),
                totalVP4 = data.Sum(x => x.E4),
                timeWorking,
                groupDepartment
            };
            return Json(objRs);
        }

        [NonAction]
        public static List<DateTime> GetDates(int year, int month)
        {
            return Enumerable.Range(1, DateTime.DaysInMonth(year, month))  // Days: 1, 2 ... 31 etc.
                             .Select(day => new DateTime(year, month, day)) // Map each day to a date
                             .ToList(); // Load dates into a list
        }

        [NonAction]
        public Day CountDayByUser(List<WorkShiftCheckInOut> listData, int month, List<DayOffMonth> listDayOff, bool subTract)
        {
            double countDay = 0;
            var selectedDates = new List<DateTime>();
            var arrDay = new List<Data>();
            var obj = new Day();
            var type = string.Empty;
            var odd = false;//true: 0.5 , false:1

            for (int i = 0; i < 31; i++)
            {
                var data = new Data
                {
                    Key = i.ToString(),
                    Value = ""
                };
                arrDay.Add(data);
            }

            foreach (var item in listData)
            {
                odd = false;//true: 0.5 , false:1

                for (var date = item.ActionTime; date <= item.ActionTo; date = date.AddDays(1))
                {
                    var index = date.Day;

                    if (date.Month == month && date.DayOfWeek.ToString() != "Sunday" && date.DayOfWeek.ToString() != "Saturday")
                    {
                        if (item.ActionTime.DayOfYear == item.ActionTo.Value.DayOfYear)//Trường hợp trong 1 ngày
                        {
                            if ((item.ActionTime.Hour >= 0 && item.ActionTo.Value.Hour <= 14) || (item.ActionTime.Hour >= 12))
                            {
                                countDay = countDay + 0.5;
                                odd = true;
                            }
                            else
                            {
                                countDay = countDay + 1;
                                odd = false;
                            }
                        }
                        else //Khác ngày
                        {
                            if (item.ActionTime.DayOfYear == date.DayOfYear && item.ActionTo.Value.DayOfYear != date.DayOfYear)//Tính ngày bắt đầu nghỉ
                            {
                                if ((item.ActionTime.Hour >= 0 && item.ActionTime.Hour <= 9))// Nếu giờ bắt đầu từ 8h thì coi như nghỉ cả 1 ngày
                                {
                                    countDay = countDay + 1;
                                    odd = false;
                                }
                                else
                                {
                                    countDay = countDay + 0.5;
                                    odd = true;
                                }
                            }
                            else if (item.ActionTime.DayOfYear != date.DayOfYear && item.ActionTo.Value.DayOfYear == date.DayOfYear)//Tính ngày kết thúc nghỉ
                            {
                                if ((item.ActionTo.Value.Hour >= 16))// Nếu giờ bắt đầu từ 8h thì coi như nghỉ cả 1 ngày
                                {
                                    countDay = countDay + 1;
                                    odd = false;
                                }
                                else if ((item.ActionTo.Value.Hour >= 12 && item.ActionTo.Value.Hour <= 14))
                                {
                                    countDay = countDay + 0.5;
                                    odd = true;
                                }
                            }
                            else
                            {
                                countDay = countDay + 1;
                                odd = false;
                            }
                        }

                        //if (subTract)
                        //{
                        foreach (var dayOff in listDayOff)//Trừ ngày nghỉ lễ
                        {
                            if (dayOff.ListDateOff.Any(x => x.Equals(date.ToString("dd/MM"))))
                            {
                                countDay--;
                                type = "nl";//Nghỉ lễ
                            }
                        }
                        //}

                        if (item.Action.Equals("PLAN_SCHEDULE"))
                        {
                            type = odd ? "1/2 ct" : "ct";//Công tác
                        }
                        else
                        {
                            switch (item.NotWorkType)
                            {
                                case "NOT_WORK_TYPE_01":
                                    type = odd ? "1/2 p" : "p";//Phép
                                    break;
                                case "NOT_WORK_TYPE_02":
                                    type = odd ? "1/2 cô" : "cô";//Nghỉ con ốm
                                    break;
                                case "NOT_WORK_TYPE_03":
                                    type = odd ? "1/2 o" : "o";//Nghỉ không lương
                                    break;
                                case "NOT_WORK_TYPE_04":
                                    type = odd ? "1/2 ô" : "ô";//Nghỉ ốm
                                    break;
                                case "NOT_WORK_TYPE_05":
                                    type = odd ? "1/2 vr" : "vr";//Việc riêng
                                    break;
                            }
                        }

                        arrDay[index - 1].Value = type;
                    }
                    else if (date.Month == month && (date.DayOfWeek.ToString() == "Sunday" || date.DayOfWeek.ToString() == "Saturday"))
                    {
                        arrDay[index - 1].HoliDay = true;
                    }
                }
            }

            obj.Count = countDay;
            obj.ListDay = arrDay;

            return obj;
        }

        [NonAction]
        public Day CountDayByUserTimeSheet(List<WorkShiftCheckInOut> listData, int month, List<DayOffMonth> listDayOff, bool subTract, List<Data> arrDayDefault, TimeWorkingSheet timeWorking = null)
        {
            double countDay = 0;
            double countWorkHoliday = 0;
            double countWorkNL = 0;
            var selectedDates = new List<DateTime>();
            var arrDay = new List<Data>();
            var obj = new Day();
            var type = string.Empty;
            var noCount = false;
            var odd = false;//true: 0.5 , false:1

            for (int i = 1; i <= 31; i++)
            {
                var holiDay = arrDayDefault.First(x => x.Key.Equals(i.ToString())).HoliDay;
                var value = arrDayDefault.First(x => x.Key.Equals(i.ToString())).Value;
                var shift = new TimeWorkingShift();
                if (timeWorking != null)
                {
                    shift = timeWorking?.ListShift.FirstOrDefault(x => x.Key == i);
                }

                var data = new Data
                {
                    Key = i.ToString(),
                    Value = value,
                    HoliDay = holiDay,
                    Shift = shift
                };

                arrDay.Add(data);
            }

            foreach (var item in listData)
            {
                odd = false;//true: 0.5 , false:1

                for (var date = item.ActionTime; date <= item.ActionTo; date = date.AddDays(1))
                {
                    var index = date.Day;

                    if (date.Month == month && date.DayOfWeek.ToString() != "Sunday" && date.DayOfWeek.ToString() != "Saturday")
                    {
                        if (item.ActionTime.DayOfYear == item.ActionTo.Value.DayOfYear)//Trường hợp trong 1 ngày
                        {
                            if ((item.ActionTime.Hour >= 0 && item.ActionTo.Value.Hour <= 14) || (item.ActionTime.Hour >= 12))
                            {
                                countDay = countDay + 0.5;
                                odd = true;
                            }
                            else
                            {
                                countDay = countDay + 1;
                                odd = false;
                            }
                        }
                        else //Khác ngày
                        {
                            if (item.ActionTime.DayOfYear == date.DayOfYear && item.ActionTo.Value.DayOfYear != date.DayOfYear)//Tính ngày bắt đầu nghỉ
                            {
                                if ((item.ActionTime.Hour >= 0 && item.ActionTime.Hour <= 9))// Nếu giờ bắt đầu từ 8h thì coi như nghỉ cả 1 ngày
                                {
                                    countDay = countDay + 1;
                                    odd = false;
                                }
                                else
                                {
                                    countDay = countDay + 0.5;
                                    odd = true;
                                }
                            }
                            else if (item.ActionTime.DayOfYear != date.DayOfYear && item.ActionTo.Value.DayOfYear == date.DayOfYear)//Tính ngày kết thúc nghỉ
                            {
                                if ((item.ActionTo.Value.Hour >= 16))// Nếu giờ bắt đầu từ 8h thì coi như nghỉ cả 1 ngày
                                {
                                    countDay = countDay + 1;
                                    odd = false;
                                }
                                else if ((item.ActionTo.Value.Hour >= 9 && item.ActionTo.Value.Hour <= 14))
                                {
                                    countDay = countDay + 0.5;
                                    odd = true;
                                }
                                else
                                {
                                    noCount = true;
                                }
                            }
                            else
                            {
                                countDay = countDay + 1;
                                odd = false;
                            }
                        }

                        if (!noCount)
                        {
                            if (item.Action.Equals("PLAN_SCHEDULE"))
                            {
                                type = odd ? "1/2 ct" : "ct";//Công tác
                            }
                            else
                            {

                                switch (item.NotWorkType)
                                {
                                    case "NOT_WORK_TYPE_01":
                                        type = odd ? "1/2 p" : "p";//Phép
                                        break;
                                    case "NOT_WORK_TYPE_02":
                                        type = odd ? "1/2 cô" : "cô";//Nghỉ con ốm
                                        break;
                                    case "NOT_WORK_TYPE_03":
                                        type = odd ? "1/2 o" : "o";//Nghỉ không lương
                                        break;
                                    case "NOT_WORK_TYPE_04":
                                        type = odd ? "1/2 ô" : "ô";//Nghỉ ốm
                                        break;
                                    case "NOT_WORK_TYPE_05":
                                        type = odd ? "1/2 vr" : "vr";//Việc riêng
                                        break;
                                }
                            }
                        }
                        else
                        {
                            type = "";
                        }

                        foreach (var dayOff in listDayOff)//Trừ ngày nghỉ lễ
                        {
                            if (dayOff.ListDateOff.Any(x => x.Equals(date.ToString("dd/MM"))))
                            {
                                countDay--;
                                type = "nl";//Nghỉ lễ

                                if (!noCount)
                                {
                                    if (item.Action.Equals("PLAN_SCHEDULE"))
                                    {
                                        type = odd ? "1/2 ctn" : "ctn";//Công tác
                                        countWorkHoliday = odd ? countWorkHoliday + 0.5 : countWorkHoliday + 1;
                                        countWorkNL = odd ? countWorkNL + 0.5 : countWorkNL + 1;
                                    }
                                }
                            }
                        }

                        arrDay[index - 1].Value = type;
                        arrDay[index - 1].CountWorkNL = countWorkNL;
                    }
                    else if (date.Month == month && (date.DayOfWeek.ToString() == "Sunday" || date.DayOfWeek.ToString() == "Saturday"))
                    {
                        if (/*item.WorkHoliday != null && item.WorkHoliday == true*/true)
                        {
                            if (item.ActionTime.DayOfYear == item.ActionTo.Value.DayOfYear)//Trường hợp trong 1 ngày
                            {
                                if ((item.ActionTime.Hour >= 0 && item.ActionTo.Value.Hour <= 14) || (item.ActionTime.Hour >= 12))
                                {
                                    countWorkHoliday = countWorkHoliday + 0.5;
                                    odd = true;
                                }
                                else
                                {
                                    countWorkHoliday = countWorkHoliday + 1;
                                    odd = false;
                                }
                            }
                            else //Khác ngày
                            {
                                if (item.ActionTime.DayOfYear == date.DayOfYear && item.ActionTo.Value.DayOfYear != date.DayOfYear)//Tính ngày bắt đầu nghỉ
                                {
                                    if ((item.ActionTime.Hour >= 0 && item.ActionTime.Hour <= 9))// Nếu giờ bắt đầu từ 8h thì coi như nghỉ cả 1 ngày
                                    {
                                        countWorkHoliday = countWorkHoliday + 1;
                                        odd = false;
                                    }
                                    else
                                    {
                                        countWorkHoliday = countWorkHoliday + 0.5;
                                        odd = true;
                                    }
                                }
                                else if (item.ActionTime.DayOfYear != date.DayOfYear && item.ActionTo.Value.DayOfYear == date.DayOfYear)//Tính ngày kết thúc nghỉ
                                {
                                    if ((item.ActionTo.Value.Hour >= 16))// Nếu giờ bắt đầu từ 8h thì coi như nghỉ cả 1 ngày
                                    {
                                        countWorkHoliday = countWorkHoliday + 1;
                                        odd = false;
                                    }
                                    else if ((item.ActionTo.Value.Hour >= 12 && item.ActionTo.Value.Hour <= 14))
                                    {
                                        countWorkHoliday = countWorkHoliday + 0.5;
                                        odd = true;
                                    }
                                    else
                                    {
                                        noCount = true;
                                    }
                                }
                                else
                                {
                                    countWorkHoliday = countWorkHoliday + 1;
                                    odd = false;
                                }
                            }

                            foreach (var dayOff in listDayOff)//Trừ ngày nghỉ lễ
                            {
                                if (dayOff.ListDateOff.Any(x => x.Equals(date.ToString("dd/MM"))))
                                {
                                    countWorkHoliday--;
                                    type = "nl";//Nghỉ lễ
                                }
                            }
                            if (!noCount)
                            {
                                if (item.Action.Equals("PLAN_SCHEDULE"))
                                {
                                    type = odd ? "1/2 ctn" : "ctn";//Công tác
                                }
                            }
                            else
                            {
                                type = "";
                            }

                            arrDay[index - 1].Value = type;
                            arrDay[index - 1].CountWorkNL = countWorkNL;
                        }
                    }
                }
            }

            obj.Count = countDay;
            obj.CountWorkHoliday = countWorkHoliday;
            obj.ListDay = arrDay;

            return obj;
        }

        [HttpPost]
        public JsonResult CalSalary(string month, string user, string file)
        {
            _month = month;
            DateTime? time = !string.IsNullOrEmpty(month) ? DateTime.ParseExact(month, "MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var year = 0;
            var monthRecei = 0;
            if (string.IsNullOrEmpty(month))
            {
                var currentTime = DateTime.Now;
                year = currentTime.Year;
                monthRecei = currentTime.Month;
            }
            else
            {
                year = time.Value.Year;
                monthRecei = time.Value.Month;
            }

            var userName = "";
            if (!string.IsNullOrEmpty(user))
            {
                var aspNetUser = _context.Users.FirstOrDefault(x => x.Active && x.EmployeeCode == user);
                userName = aspNetUser != null ? aspNetUser.UserName : "";
            }

            var timeWorking = TimeWorking(monthRecei, year, userName);

            var query = from a in _context.HREmployees.Where(x => x.flag == 1)
                        join b in _context.Roles.Where(x => x.Status == true) on a.position equals b.Id into b1
                        from b2 in b1.DefaultIfEmpty()
                        join c in _context.HRContracts.Where(x => x.flag == 1) on a.Id equals c.Employee_Id into c1
                        from c2 in c1.DefaultIfEmpty()
                        join d in _context.Users.Where(x => x.Active) on a.Id.ToString() equals d.EmployeeCode into d1
                        from d2 in d1.DefaultIfEmpty()
                        where (string.IsNullOrEmpty(user) || a.Id.ToString() == user)
                        select new
                        {
                            a.Id,
                            FullName = a.fullname,
                            Position = b2 != null ? b2.Title : "",
                            Salary = c2 != null ? c2.Salary : 0,
                            UserName = d2 != null ? d2.UserName : "",
                            SalaryRatio = (c2 != null && !string.IsNullOrEmpty(c2.Salary_Ratio)) ? c2.Salary_Ratio : "1",
                            c2.Created_Time
                        };

            var query1 = query.OrderByDescending(x => x.Created_Time).GroupBy(x => x.Id).Select(x => x.FirstOrDefault());
            if (timeWorking.Count() > 0)
            {
                var data = (from a in query1
                            join b in timeWorking on a.UserName equals b.UserName into b1
                            from b2 in b1.DefaultIfEmpty()
                            select new ExcelSalary
                            {
                                FullName = a.FullName,
                                Position = a.Position,
                                Salary = a.Salary,
                                TimeWorking = b2.TimeWorking.HasValue ? b2.TimeWorking : 0,
                                SalaryRatio = a.SalaryRatio
                            }).ToList();
                var path = "\\" + CreateFileNew(data, monthRecei, year, file);
                pathFile = path;
                return Json(path);
            }
            else
            {
                var data = (from a in query1
                            select new ExcelSalary
                            {
                                FullName = a.FullName,
                                Position = a.Position,
                                Salary = a.Salary,
                            }).ToList();
                var path = "\\" + CreateFileNew(data, monthRecei, year, file);
                pathFile = path;
                return Json(path);
            }
        }

        [HttpPost]
        public JsonResult InsertExcelDataDB(string monthSalary)
        {
            var list = new List<ExcelSalaryModel>();
            try
            {
                var pathUpload = string.Concat(_hostingEnvironment.WebRootPath, pathFile);
                Stream fileStreamPath = new FileStream(pathUpload, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
                var fileUpload = new FormFile(fileStreamPath, 0, fileStreamPath.Length, "Test", "Test.xlsx");

                if (fileUpload != null && fileUpload.Length > 0)
                {
                    // Read content from file
                    ExcelEngine excelEngine = new ExcelEngine();
                    IApplication application = excelEngine.Excel;
                    IWorkbook workbook = application.Workbooks.Create();
                    workbook = application.Workbooks.Open(fileUpload.OpenReadStream());
                    IWorksheet worksheet = workbook.Worksheets[0];

                    if (worksheet.Rows.Length > 1)
                    {
                        DateTime? monthTime = !string.IsNullOrEmpty(monthSalary) ? DateTime.ParseExact(monthSalary, "MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                        var month = monthSalary.Split("/");
                        var codeSalary = string.Format("SALARY_T{0}_{1}", month[0], month[1]);
                        string[] excelColums = { "V", "W", "X", "Y", "Z", "AA", "AB", "AC", "AD", "AE" };//Các cột phụ cấp
                        var alphas = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".ToArray();
                        var listAllowance = _context.AttributeManagers.Where(x => !x.IsDeleted && x.Group.Equals("ATTR_GROUP_ALLOWANCE")).ToList();//Lấy danh sách phụ cấp
                        var listUser = _context.Users.Where(x => x.Active).Select(x => new { x.GivenName, x.UserName }).ToList();//Lấy danh sách người dùng
                        var listAllowanceExcelData = new List<SalaryTableAllowance>();
                        //Phần Header Bảng lương
                        var salaryHeader = new SalaryTableHeader
                        {
                            CodeTblSalary = codeSalary,
                            MonthSalary = monthTime,
                            Title = string.Format("Bảng lương tháng {0}", monthSalary),
                            Total = 0,
                            CreatedBy = User.Identity.Name,
                            CreatedTime = DateTime.Now
                        };

                        var length = worksheet.Rows.Length;
                        for (int i = 4; i <= length; i++)
                        {

                            var a = worksheet.Range[i, 4].DisplayText;

                            for (int j = 0; j < alphas.Length; j++)
                            {
                                var col = alphas[j].ToString() + i;

                            }

                            //Đọc dữ liệu từng dòng
                            var EmployeeCode = worksheet.GetText(i, 2).ToString().Trim();
                            if (!string.IsNullOrEmpty(EmployeeCode))
                                EmployeeCode = listUser.FirstOrDefault(x => x.GivenName.Equals(EmployeeCode)) != null ? listUser.FirstOrDefault(x => x.GivenName.Equals(EmployeeCode)).UserName : EmployeeCode;

                            var EmployeeName = worksheet.GetText(i, 2).ToString().Trim();
                            var EmployeeRole = worksheet.GetText(i, 3).ToString().Trim();
                            var CodeTblSalary = codeSalary;
                            var SalaryPrimary = worksheet.Range[i, 4].DisplayText.ToString().Trim();//Lương chính
                            var SalaryTotal = worksheet.Range[i, 4].DisplayText.ToString().Trim();//Tổng thu nhập
                            var WorkDay = worksheet.Range[i, 6].DisplayText.ToString().Trim();//Ngày công
                            var SalaryGross = worksheet.Range[i, 7].DisplayText.ToString().Trim();//Tổng lương thực tế
                            var SalaryPayInsurance = worksheet.Range[i, 8].DisplayText.ToString().Trim();//Lương đóng bảo hiểm

                            var UnionFunds = worksheet.Range[i, 9].DisplayText.ToString().Trim();//CPCĐ
                            var SocialInsuranceComp = worksheet.Range[i, 10].DisplayText.ToString().Trim();//BHXH (Công ty chi trả)
                            var HealthInsuranceComp = worksheet.Range[i, 11].DisplayText.ToString().Trim();//BHYT (Công ty chi trả)
                            var UnemploymentInsuranceComp = worksheet.Range[i, 12].DisplayText.ToString().Trim();//BHTN (Công ty chi trả)

                            var SocialInsuranceEmp = worksheet.Range[i, 14].DisplayText.ToString().Trim();//BHXH (Nhân viên chi trả)
                            var HealthInsuranceEmp = worksheet.Range[i, 15].DisplayText.ToString().Trim();//BHYT (Nhân viên chi trả)
                            var UnemploymentInsuranceEmp = worksheet.Range[i, 16].DisplayText.ToString().Trim();//BHTN (Nhân viên chi trả)

                            var PersonalIncomeTax = worksheet.Range[i, 18].DisplayText.ToString().Trim();//TNCN
                            var SalaryBefore = worksheet.Range[i, 19].DisplayText.ToString().Trim();//Tạm ứng
                            var SalaryReceived = worksheet.Range[i, 20].DisplayText.ToString().Trim();//Lương thực lĩnh
                            var Note = worksheet.Range[i, 21].DisplayText.ToString().Trim();//Ghi chú

                            //Phần Detail Bảng lương
                            var salaryTableDetail = new SalaryTableDetail
                            {
                                EmployeeCode = EmployeeCode,
                                EmployeeName = EmployeeName,
                                EmployeeRole = EmployeeRole,
                                CodeTblSalary = CodeTblSalary,
                                SalaryPrimary = Decimal.Parse(SalaryPrimary),
                                SalaryTotal = Decimal.Parse(SalaryTotal),
                                WorkDay = Decimal.Parse(WorkDay),
                                SalaryGross = Decimal.Parse(SalaryGross),
                                SalaryPayInsurance = Decimal.Parse(SalaryPayInsurance),
                                UnionFunds = Decimal.Parse(UnionFunds),
                                SocialInsuranceComp = Decimal.Parse(SocialInsuranceComp),
                                UnemploymentInsuranceComp = Decimal.Parse(UnemploymentInsuranceComp),
                                SocialInsuranceEmp = Decimal.Parse(SocialInsuranceEmp),
                                UnemploymentInsuranceEmp = Decimal.Parse(UnemploymentInsuranceEmp),
                                PersonalIncomeTax = Decimal.Parse(PersonalIncomeTax),
                                SalaryBefore = Decimal.Parse(SalaryBefore),
                                SalaryReceived = Decimal.Parse(SalaryReceived),
                                Note = Note,
                                CreatedBy = User.Identity.Name,
                                CreatedTime = DateTime.Now
                            };

                            //Đọc phần phụ cấp
                            for (int j = 1; j <= listAllowance.Count; j++)
                            {
                                var AllownaceCode = listAllowance[j].Code;
                                var colum = 21 + j;
                                var salaryAllownace = new SalaryTableAllowance
                                {
                                    AllowanceCode = AllownaceCode,
                                    CodeTblSalary = CodeTblSalary,
                                    Value = Decimal.Parse(worksheet.Range[i, colum].DisplayText.ToString().Trim()),
                                    Month = monthTime,
                                    CreatedBy = User.Identity.Name,
                                    CreatedTime = DateTime.Now,
                                    EmployeeCode = EmployeeCode,
                                };

                                listAllowanceExcelData.Add(salaryAllownace);
                            }

                            var excelData = new ExcelSalaryModel
                            {
                                ListSalaryAllowance = listAllowanceExcelData,
                                SalaryTableDetail = salaryTableDetail
                            };

                            list.Add(excelData);
                        }
                    }
                }
            }
            catch (Exception e)
            {
            }
            return Json(list);
        }

        [NonAction]
        public JsonResult SaveDataDB(string monthSalary)
        {
            var list = new List<ExcelSalaryModel>();
            try
            {
                var pathUpload = string.Concat(_hostingEnvironment.WebRootPath, pathFile);
                Stream fileStreamPath = new FileStream(pathUpload, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
                var fileUpload = new FormFile(fileStreamPath, 0, fileStreamPath.Length, "Test", "Test.xlsx");
                if (fileUpload != null && fileUpload.Length > 0)
                {
                    // Read content from file
                    ExcelEngine excelEngine = new ExcelEngine();
                    IApplication application = excelEngine.Excel;
                    IWorkbook workbook = application.Workbooks.Create();
                    workbook = application.Workbooks.Open(fileUpload.OpenReadStream());
                    IWorksheet worksheet = workbook.Worksheets[0];

                    if (worksheet.Rows.Length > 1)
                    {
                        DateTime? monthTime = !string.IsNullOrEmpty(monthSalary) ? DateTime.ParseExact(monthSalary, "MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                        var month = monthSalary.Split("/");
                        var codeSalary = string.Format("SALARY_T{0}_{1}", month[0], month[1]);
                        string[] excelColums = { "V", "W", "X", "Y", "Z", "AA", "AB", "AC", "AD", "AE" };//Các cột phụ cấp
                        var alphas = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".ToArray();
                        var listAllowance = _context.AttributeManagers.Where(x => !x.IsDeleted && x.Group.Equals("ATTR_GROUP_ALLOWANCE")).ToList();//Lấy danh sách phụ cấp
                        var listUser = _context.Users.Where(x => x.Active).Select(x => new { x.GivenName, x.UserName }).ToList();//Lấy danh sách người dùng
                        var listAllowanceExcelData = new List<SalaryTableAllowance>();
                        var listDetailData = new List<SalaryTableDetail>();
                        //Phần Header Bảng lương
                        var salaryHeader = new SalaryTableHeader
                        {
                            CodeTblSalary = codeSalary,
                            MonthSalary = monthTime,
                            Title = string.Format("Bảng lương tháng {0}", monthSalary),
                            Total = 0,
                            CreatedBy = User.Identity.Name,
                            CreatedTime = DateTime.Now
                        };

                        //Hàm tính toán công thức
                        worksheet.EnableSheetCalculations();

                        var length = worksheet.Rows.Length;
                        for (int i = 4; i < length; i++)
                        {
                            //Đọc dữ liệu từng dòng
                            var EmployeeCode = worksheet.GetText(i, 2).ToString().Replace(",", "").Trim();
                            if (!string.IsNullOrEmpty(EmployeeCode))
                                EmployeeCode = listUser.FirstOrDefault(x => x.GivenName.Equals(EmployeeCode)) != null ? listUser.FirstOrDefault(x => x.GivenName.Equals(EmployeeCode)).UserName : EmployeeCode;

                            var EmployeeName = worksheet.GetText(i, 2).ToString().Replace(",", "").Trim();
                            var EmployeeRole = worksheet.GetText(i, 3).ToString().Replace(",", "").Trim();
                            var CodeTblSalary = codeSalary;
                            var SalaryPrimary = worksheet.Range[i, 4].DisplayText.ToString().Replace(",", "").Replace(",", "").Trim();//Lương chính
                            var SalaryTotal = worksheet.Range[i, 5].DisplayText.ToString().Replace(",", "").Trim();//Tổng thu nhập
                            var WorkDay = worksheet.Range[i, 6].DisplayText.ToString().Replace(",", "").Trim();//Ngày công
                            var SalaryGross = worksheet.Range[i, 7].DisplayText.ToString().Replace(",", "").Trim();//Tổng lương thực tế
                            var SalaryPayInsurance = worksheet.Range[i, 8].DisplayText.ToString().Replace(",", "").Trim();//Lương đóng bảo hiểm

                            var UnionFunds = worksheet.Range[i, 9].DisplayText.ToString().Replace(",", "").Trim();//CPCĐ
                            var SocialInsuranceComp = worksheet.Range[i, 10].DisplayText.ToString().Replace(",", "").Trim();//BHXH (Công ty chi trả)
                            var HealthInsuranceComp = worksheet.Range[i, 11].DisplayText.ToString().Replace(",", "").Trim();//BHYT (Công ty chi trả)
                            var UnemploymentInsuranceComp = worksheet.Range[i, 12].DisplayText.ToString().Replace(",", "").Trim();//BHTN (Công ty chi trả)

                            var SocialInsuranceEmp = worksheet.Range[i, 14].DisplayText.ToString().Replace(",", "").Trim();//BHXH (Nhân viên chi trả)
                            var HealthInsuranceEmp = worksheet.Range[i, 15].DisplayText.ToString().Replace(",", "").Trim();//BHYT (Nhân viên chi trả)
                            var UnemploymentInsuranceEmp = worksheet.Range[i, 16].DisplayText.ToString().Replace(",", "").Trim();//BHTN (Nhân viên chi trả)

                            var PersonalIncomeTax = worksheet.Range[i, 18].DisplayText.ToString().Replace(",", "").Trim();//TNCN
                            var SalaryBefore = worksheet.Range[i, 19].DisplayText.ToString().Replace(",", "").Trim();//Tạm ứng
                            var SalaryReceived = worksheet.Range[i, 20].DisplayText.ToString().Replace(",", "").Trim();//Lương thực lĩnh
                            //var Note = worksheet.Range[i, 21].DisplayText.ToString().Replace(",", "").Trim();//Ghi chú
                            var SalaryRatio = worksheet.Range[i, 21].DisplayText.ToString().Replace(",", "").Trim();//Hệ số lương

                            //Phần Detail Bảng lương
                            var salaryTableDetail = new SalaryTableDetail
                            {
                                EmployeeCode = EmployeeCode,
                                EmployeeName = EmployeeName,
                                EmployeeRole = EmployeeRole,
                                CodeTblSalary = CodeTblSalary,
                                SalaryPrimary = !string.IsNullOrEmpty(SalaryPrimary) ? Decimal.Parse(SalaryPrimary) : 0,
                                SalaryTotal = !string.IsNullOrEmpty(SalaryTotal) ? Decimal.Parse(SalaryTotal) : 0,
                                WorkDay = !string.IsNullOrEmpty(WorkDay) ? Decimal.Parse(WorkDay) : 0,
                                SalaryGross = !string.IsNullOrEmpty(SalaryGross) ? Decimal.Parse(SalaryGross) : 0,
                                SalaryPayInsurance = !string.IsNullOrEmpty(SalaryPayInsurance) ? Decimal.Parse(SalaryPayInsurance) : 0,
                                UnionFunds = !string.IsNullOrEmpty(UnionFunds) ? Decimal.Parse(UnionFunds) : 0,
                                SocialInsuranceComp = !string.IsNullOrEmpty(SocialInsuranceComp) ? Decimal.Parse(SocialInsuranceComp) : 0,
                                UnemploymentInsuranceComp = !string.IsNullOrEmpty(UnemploymentInsuranceComp) ? Decimal.Parse(UnemploymentInsuranceComp) : 0,
                                SocialInsuranceEmp = !string.IsNullOrEmpty(SocialInsuranceEmp) ? Decimal.Parse(SocialInsuranceEmp) : 0,
                                UnemploymentInsuranceEmp = !string.IsNullOrEmpty(UnemploymentInsuranceEmp) ? Decimal.Parse(UnemploymentInsuranceEmp) : 0,
                                HealthInsuranceComp = !string.IsNullOrEmpty(HealthInsuranceComp) ? Decimal.Parse(HealthInsuranceComp) : 0,
                                HealthInsuranceEmp = !string.IsNullOrEmpty(HealthInsuranceEmp) ? Decimal.Parse(HealthInsuranceEmp) : 0,
                                PersonalIncomeTax = !string.IsNullOrEmpty(PersonalIncomeTax) ? Decimal.Parse(PersonalIncomeTax) : 0,
                                SalaryBefore = !string.IsNullOrEmpty(SalaryBefore) ? Decimal.Parse(SalaryBefore) : 0,
                                SalaryReceived = !string.IsNullOrEmpty(SalaryReceived) ? Decimal.Parse(SalaryReceived) : 0,
                                //Note = Note,
                                SalaryRatio = !string.IsNullOrEmpty(SalaryRatio) ? Decimal.Parse(SalaryRatio) : 1,
                                CreatedBy = User.Identity.Name,
                                CreatedTime = DateTime.Now,
                            };

                            listDetailData.Add(salaryTableDetail);

                            //Đọc phần phụ cấp
                            for (int j = 0; j < listAllowance.Count; j++)
                            {
                                var AllownaceCode = listAllowance[j].Code;
                                var colum = 22 + j;
                                var value = worksheet.Range[i, colum].DisplayText.ToString().Trim();
                                var salaryAllownace = new SalaryTableAllowance
                                {
                                    AllowanceCode = AllownaceCode,
                                    CodeTblSalary = CodeTblSalary,
                                    Value = !string.IsNullOrEmpty(value) ? Decimal.Parse(value) : 0,
                                    Month = monthTime,
                                    CreatedBy = User.Identity.Name,
                                    CreatedTime = DateTime.Now,
                                    EmployeeCode = EmployeeCode,
                                };

                                listAllowanceExcelData.Add(salaryAllownace);
                            }

                            var excelData = new ExcelSalaryModel
                            {
                                ListSalaryAllowance = listAllowanceExcelData,
                                SalaryTableDetail = salaryTableDetail
                            };

                            list.Add(excelData);
                        }

                        if (list.Count > 0)
                        {
                            var header = _context.SalaryTableHeaders.FirstOrDefault(x => !x.IsDeleted && x.CodeTblSalary.Equals(salaryHeader.CodeTblSalary));
                            if (header == null)
                            {
                                _context.SalaryTableHeaders.Add(salaryHeader);
                            }

                            var listDetailBefore = _context.SalaryTableDetails.Where(x => !x.IsDeleted && listDetailData.Any(p => p.CodeTblSalary.Equals(x.CodeTblSalary) && p.EmployeeCode.Equals(x.EmployeeCode)));
                            if (listDetailBefore.Count() > 0)
                                _context.SalaryTableDetails.RemoveRange(listDetailBefore);

                            _context.SalaryTableDetails.Load();

                            var listDetail = listDetailData.Where(x => !x.IsDeleted && !_context.SalaryTableDetails.Local.Any(p => p.CodeTblSalary.Equals(x.CodeTblSalary) && p.EmployeeCode.Equals(x.EmployeeCode)));
                            if (listDetail.Count() > 0)
                                _context.SalaryTableDetails.AddRange(listDetail);

                            var listAllowanceDataBefore = _context.SalaryTableAllowances.Where(x => !x.IsDeleted && listAllowanceExcelData.Any(p => p.CodeTblSalary.Equals(x.CodeTblSalary) && p.AllowanceCode.Equals(x.AllowanceCode) && p.EmployeeCode.Equals(x.EmployeeCode)));
                            if (listAllowanceDataBefore.Count() > 0)
                                _context.SalaryTableAllowances.RemoveRange(listAllowanceDataBefore);

                            _context.SalaryTableAllowances.Load();
                            var listAllowanceData = listAllowanceExcelData.Where(x => !x.IsDeleted && !_context.SalaryTableAllowances.Local.Any(p => p.CodeTblSalary.Equals(x.CodeTblSalary) && p.AllowanceCode.Equals(x.AllowanceCode) && p.EmployeeCode.Equals(x.EmployeeCode)));
                            if (listAllowanceData.Count() > 0)
                                _context.SalaryTableAllowances.AddRange(listAllowanceData);

                            _context.SaveChanges();
                        }
                    }
                }
            }
            catch (Exception e)
            {
            }
            return Json(list);
        }

        [NonAction]
        public string CreateFileOld(List<ExcelSalary> list, int month, int year)
        {
            ExcelEngine excelEngine = new ExcelEngine();
            IApplication application = excelEngine.Excel;
            application.DefaultVersion = ExcelVersion.Excel2016;
            IWorkbook workbook = application.Workbooks.Create(1);
            workbook.Version = ExcelVersion.Excel2010;
            IWorksheet sheetRequest = workbook.Worksheets.Create("Bảng lương");
            workbook.Worksheets[0].Remove();
            IMigrantRange migrantRange = workbook.Worksheets[0].MigrantRange;

            workbook.SetSeparators(';', ';');

            sheetRequest.Range["A1:A2"].Merge(true);
            sheetRequest.Range["A1"].Text = "STT";

            sheetRequest.Range["B1:B2"].Merge(true);
            sheetRequest.Range["B1"].Text = "Họ tên";
            sheetRequest.Range["B1"].HorizontalAlignment = ExcelHAlign.HAlignCenter;
            sheetRequest.Range["B1"].CellStyle.Font.Bold = true;
            sheetRequest.Range["B1"].ColumnWidth = 200;

            sheetRequest.Range["C1:C2"].Merge(true);
            sheetRequest.Range["C1"].Text = "Chức vụ";
            sheetRequest.Range["C1"].HorizontalAlignment = ExcelHAlign.HAlignCenter;
            sheetRequest.Range["C1"].CellStyle.Font.Bold = true;

            sheetRequest.Range["D1:D2"].Merge(true);
            sheetRequest.Range["D1"].Text = "Lương chính";
            sheetRequest.Range["D1"].HorizontalAlignment = ExcelHAlign.HAlignCenter;
            sheetRequest.Range["D1"].CellStyle.Font.Bold = true;

            sheetRequest.Range["E1:H1"].Merge(true);
            sheetRequest.Range["E1"].Text = "Phụ cấp";
            sheetRequest.Range["E1"].HorizontalAlignment = ExcelHAlign.HAlignCenter;
            sheetRequest.Range["E1"].CellStyle.Font.Bold = true;

            sheetRequest.Range["E2"].Text = "Trách nhiệm";
            sheetRequest.Range["F2"].Text = "Ăn trưa";
            sheetRequest.Range["G2"].Text = "Điện thoại";
            sheetRequest.Range["H2"].Text = "Xăng xe";

            sheetRequest.Range["I1:I2"].Merge(true);
            sheetRequest.Range["I1"].Text = "Tổng thu nhập";
            sheetRequest.Range["I1"].CellStyle.Font.Bold = true;

            sheetRequest.Range["J1:J2"].Merge(true);
            sheetRequest.Range["J1"].Text = "Ngày công";
            sheetRequest.Range["J1"].CellStyle.Font.Bold = true;

            sheetRequest.Range["K1:K2"].Merge(true);
            sheetRequest.Range["K1"].Text = "Tổng lương thực tế";
            sheetRequest.Range["K1"].CellStyle.Font.Bold = true;

            sheetRequest.Range["L1:L2"].Merge(true);
            sheetRequest.Range["L1"].Text = "Lương đóng BH";
            sheetRequest.Range["L1"].CellStyle.Font.Bold = true;

            sheetRequest.Range["M1:Q1"].Merge(true);
            sheetRequest.Range["M1"].Text = "Trích vào Chi phí Doanh nghiệp";
            sheetRequest.Range["M1"].HorizontalAlignment = ExcelHAlign.HAlignCenter;
            sheetRequest.Range["M1"].CellStyle.Font.Bold = true;

            sheetRequest.Range["M2"].Text = "KPCĐ(2%)";
            sheetRequest.Range["N2"].Text = "BHXH(17,5%)";
            sheetRequest.Range["O2"].Text = "BHYT(3%)";
            sheetRequest.Range["P2"].Text = "BHTN(1%)";
            sheetRequest.Range["Q2"].Text = "Cộng(23,5%)";
            sheetRequest.Range["Q2"].CellStyle.Font.Bold = true;

            sheetRequest.Range["R1:U1"].Merge(true);
            sheetRequest.Range["R1"].Text = "Trích vào Lương nhân viên";
            sheetRequest.Range["R1"].HorizontalAlignment = ExcelHAlign.HAlignCenter;
            sheetRequest.Range["R1"].CellStyle.Font.Bold = true;

            sheetRequest.Range["R2"].Text = "BHXH(8%)";
            sheetRequest.Range["S2"].Text = "BHYT(1,5%)";
            sheetRequest.Range["T2"].Text = "BHTN(1%)";
            sheetRequest.Range["U2"].Text = "Cộng(10,5%)";
            sheetRequest.Range["U2"].CellStyle.Font.Bold = true;

            sheetRequest.Range["V1:V2"].Merge(true);
            sheetRequest.Range["V1"].Text = "Thuế TNCN";
            sheetRequest.Range["V1"].CellStyle.Font.Bold = true;

            sheetRequest.Range["W1:W2"].Merge(true);
            sheetRequest.Range["W1"].Text = "Tạm ứng";
            sheetRequest.Range["W1"].CellStyle.Font.Bold = true;

            sheetRequest.Range["X1:X2"].Merge(true);
            sheetRequest.Range["X1"].Text = "Thực lĩnh";
            sheetRequest.Range["X1"].CellStyle.Font.Bold = true;

            sheetRequest.Range["Y1:Y2"].Merge(true);
            sheetRequest.Range["Y1"].Text = "Ghi chú";
            sheetRequest.Range["Y1"].CellStyle.Font.Bold = true;

            sheetRequest.Range["C3"].Text = "1";
            sheetRequest.Range["C3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["D3"].Text = "2";
            sheetRequest.Range["D3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["E3"].Text = "3";
            sheetRequest.Range["E3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["F3"].Text = "4";
            sheetRequest.Range["F3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["G3"].Text = "5";
            sheetRequest.Range["G3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["H3"].Text = "6";
            sheetRequest.Range["H3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["I3"].Text = "7";
            sheetRequest.Range["I3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["J3"].Text = "8";
            sheetRequest.Range["J3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["K3"].Text = "9";
            sheetRequest.Range["K3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["L3"].Text = "10";
            sheetRequest.Range["L3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["M3"].Text = "11";
            sheetRequest.Range["M3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["N3"].Text = "12";
            sheetRequest.Range["N3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["O3"].Text = "13";
            sheetRequest.Range["O3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["P3"].Text = "14";
            sheetRequest.Range["P3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["Q3"].Text = "15";
            sheetRequest.Range["Q3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["R3"].Text = "16";
            sheetRequest.Range["R3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["S3"].Text = "17";
            sheetRequest.Range["S3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["T3"].Text = "18";
            sheetRequest.Range["T3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["U3"].Text = "19";
            sheetRequest.Range["U3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["V3"].Text = "20";
            sheetRequest.Range["V3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["W3"].Text = "21";
            sheetRequest.Range["W3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["X3"].Text = "22";
            sheetRequest.Range["X3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            IStyle tableHeader = workbook.Styles.Add("TableHeaderStyle");
            tableHeader.Font.Color = ExcelKnownColors.Black;
            tableHeader.Font.Size = 11;
            tableHeader.Font.FontName = "Calibri";
            tableHeader.HorizontalAlignment = ExcelHAlign.HAlignCenter;
            tableHeader.VerticalAlignment = ExcelVAlign.VAlignCenter;
            tableHeader.Color = Color.FromArgb(0, 165, 215, 213);
            tableHeader.Borders[ExcelBordersIndex.EdgeLeft].LineStyle = ExcelLineStyle.Thin;
            tableHeader.Borders[ExcelBordersIndex.EdgeRight].LineStyle = ExcelLineStyle.Thin;
            tableHeader.Borders[ExcelBordersIndex.EdgeTop].LineStyle = ExcelLineStyle.Thin;
            tableHeader.Borders[ExcelBordersIndex.EdgeBottom].LineStyle = ExcelLineStyle.Thin;
            sheetRequest.UsedRange.AutofitColumns();
            sheetRequest["A1:Y3"].CellStyle = tableHeader;

            var row = 4;
            var index = 1;
            foreach (var item in list)
            {
                sheetRequest.Range["A" + row].Text = index < 10 ? "0" + index : index.ToString();
                sheetRequest.Range["A" + row].HorizontalAlignment = ExcelHAlign.HAlignCenter;

                sheetRequest.Range["B" + row].Text = item.FullName;
                sheetRequest.Range["B" + row].HorizontalAlignment = ExcelHAlign.HAlignLeft;

                sheetRequest.Range["C" + row].Text = item.Position;
                sheetRequest.Range["C" + row].HorizontalAlignment = ExcelHAlign.HAlignLeft;

                sheetRequest.Range["D" + row].Text = item.Salary.ToString();
                sheetRequest.Range["D" + row].HorizontalAlignment = ExcelHAlign.HAlignRight;

                sheetRequest.Range["J" + row].Text = item.TimeWorking.ToString();
                sheetRequest.Range["J" + row].HorizontalAlignment = ExcelHAlign.HAlignRight;

                sheetRequest.Range["I" + row].Formula = "=SUBTOTAl(9,D" + row + ":H" + row + ")";//Tổng thu nhập (E)
                sheetRequest.Range["K" + row].Formula = string.Format("=I{0}/26*J{1}", row, row);//Tổng thu nhập thực tế (G)
                sheetRequest.Range["L" + row].Formula = string.Format("=D{0}+E{1}", row, row);//Lương đóng bảo hiểm (H)
                sheetRequest.Range["M" + row].Formula = string.Format("=$L{0}*2/100", row);//KPCĐ (Doanh nghiệp)(I)
                sheetRequest.Range["N" + row].Formula = string.Format("=$L{0}*17;5/100", row);//BHXH (Doanh nghiệp)(J)
                sheetRequest.Range["O" + row].Formula = string.Format("=$L{0}*3/100", row);//BHYT (Doanh nghiệp)(K)
                sheetRequest.Range["P" + row].Formula = string.Format("=$L{0}*1/100", row);//BHTN (Doanh nghiệp)(L)
                sheetRequest.Range["Q" + row].Formula = string.Format("=SUBTOTAL(9, M{0}:P{1})", row, row);//Cộng 23.5% (Doanh nghiệp)(M)
                sheetRequest.Range["R" + row].Formula = string.Format("=$L{0}*8/100", row);//BHXH (Nhân viên)(N)
                sheetRequest.Range["S" + row].Formula = string.Format("=$L{0}*1;5/100", row);//BHYT (Nhân viên)(O)
                sheetRequest.Range["T" + row].Formula = string.Format("=$L{0}*1/100", row);//BHTN (Nhân viên)(P)
                sheetRequest.Range["U" + row].Formula = string.Format("=SUBTOTAL(9, R{0}:T{1})", row, row);//Cộng 10,5% (Nhân viên)(Q)

                sheetRequest.Range["X" + row].Formula = string.Format("=K{0}-U{1}-V{2}-W{3})", row, row, row, row);//Thực lĩnh(T)
                row++;
                index++;
            }
            //string ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            var fileName = "Bảng lương tháng " + month + " năm " + year + ".xlsx";
            MemoryStream ms = new MemoryStream();
            workbook.SaveAs(ms);
            workbook.Close();
            excelEngine.Dispose();
            ms.Position = 0;
            JMessage msg1 = _upload.UploadFileByBytes(ms.GetBuffer(), fileName, _hostingEnvironment.WebRootPath, "uploads\\tempFile");
            string path = msg1.Object.ToString();
            return path;
        }

        [NonAction]
        public string CreateFile(List<ExcelSalary> list, int month, int year)
        {
            ExcelEngine excelEngine = new ExcelEngine();
            IApplication application = excelEngine.Excel;
            application.DefaultVersion = ExcelVersion.Excel2016;
            IWorkbook workbook = application.Workbooks.Create(1);
            workbook.Version = ExcelVersion.Excel2010;
            IWorksheet sheetRequest = workbook.Worksheets.Create("Bảng lương");
            workbook.Worksheets[0].Remove();
            IMigrantRange migrantRange = workbook.Worksheets[0].MigrantRange;

            workbook.SetSeparators(';', ',');

            sheetRequest.Range["A1:A2"].Merge(true);
            sheetRequest.Range["A1"].Text = "STT";

            sheetRequest.Range["B1:B2"].Merge(true);
            sheetRequest.Range["B1"].Text = "Họ tên";
            sheetRequest.Range["B1"].HorizontalAlignment = ExcelHAlign.HAlignCenter;
            sheetRequest.Range["B1"].CellStyle.Font.Bold = true;


            sheetRequest.Range["C1:C2"].Merge(true);
            sheetRequest.Range["C1"].Text = "Chức vụ";
            sheetRequest.Range["C1"].HorizontalAlignment = ExcelHAlign.HAlignCenter;
            sheetRequest.Range["C1"].CellStyle.Font.Bold = true;

            sheetRequest.Range["D1:D2"].Merge(true);
            sheetRequest.Range["D1"].Text = "Lương chính";
            sheetRequest.Range["D1"].HorizontalAlignment = ExcelHAlign.HAlignCenter;
            sheetRequest.Range["D1"].CellStyle.Font.Bold = true;

            sheetRequest.Range["E1:E2"].Merge(true);
            sheetRequest.Range["E1"].Text = "Tổng thu nhập";
            sheetRequest.Range["E1"].CellStyle.Font.Bold = true;

            sheetRequest.Range["F1:F2"].Merge(true);
            sheetRequest.Range["F1"].Text = "Ngày công";
            sheetRequest.Range["F1"].CellStyle.Font.Bold = true;

            sheetRequest.Range["G1:G2"].Merge(true);
            sheetRequest.Range["G1"].Text = "Tổng lương thực tế";
            sheetRequest.Range["G1"].CellStyle.Font.Bold = true;

            sheetRequest.Range["H1:H2"].Merge(true);
            sheetRequest.Range["H1"].Text = "Lương đóng BH";
            sheetRequest.Range["H1"].CellStyle.Font.Bold = true;

            sheetRequest.Range["I1:M1"].Merge(true);
            sheetRequest.Range["I1"].Text = "Trích vào Chi phí Doanh nghiệp";
            sheetRequest.Range["I1"].HorizontalAlignment = ExcelHAlign.HAlignCenter;
            sheetRequest.Range["I1"].CellStyle.Font.Bold = true;

            sheetRequest.Range["I2"].Text = "KPCĐ(2%)";
            sheetRequest.Range["J2"].Text = "BHXH(17,5%)";
            sheetRequest.Range["K2"].Text = "BHYT(3%)";
            sheetRequest.Range["L2"].Text = "BHTN(1%)";
            sheetRequest.Range["M2"].Text = "Cộng(23,5%)";
            sheetRequest.Range["N2"].CellStyle.Font.Bold = true;

            sheetRequest.Range["N1:Q1"].Merge(true);
            sheetRequest.Range["N1"].Text = "Trích vào Lương nhân viên";
            sheetRequest.Range["N1"].HorizontalAlignment = ExcelHAlign.HAlignCenter;
            sheetRequest.Range["N1"].CellStyle.Font.Bold = true;

            sheetRequest.Range["N2"].Text = "BHXH(8%)";
            sheetRequest.Range["O2"].Text = "BHYT(1,5%)";
            sheetRequest.Range["P2"].Text = "BHTN(1%)";
            sheetRequest.Range["Q2"].Text = "Cộng(10,5%)";
            sheetRequest.Range["R2"].CellStyle.Font.Bold = true;

            sheetRequest.Range["R1:R2"].Merge(true);
            sheetRequest.Range["R1"].Text = "Thuế TNCN";
            sheetRequest.Range["R1"].CellStyle.Font.Bold = true;

            sheetRequest.Range["S1:S2"].Merge(true);
            sheetRequest.Range["S1"].Text = "Tạm ứng";
            sheetRequest.Range["S1"].CellStyle.Font.Bold = true;

            sheetRequest.Range["T1:T2"].Merge(true);
            sheetRequest.Range["T1"].Text = "Thực lĩnh";
            sheetRequest.Range["T1"].CellStyle.Font.Bold = true;

            sheetRequest.Range["U1:U2"].Merge(true);
            sheetRequest.Range["U1"].Text = "Hệ số lương";
            sheetRequest.Range["U1"].CellStyle.Font.Bold = true;

            sheetRequest.Range["C3"].Text = "1";
            sheetRequest.Range["C3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["D3"].Text = "2";
            sheetRequest.Range["D3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["E3"].Text = "3";
            sheetRequest.Range["E3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["F3"].Text = "4";
            sheetRequest.Range["F3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["G3"].Text = "5";
            sheetRequest.Range["G3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["H3"].Text = "6";
            sheetRequest.Range["H3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["I3"].Text = "7";
            sheetRequest.Range["I3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["J3"].Text = "8";
            sheetRequest.Range["J3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["K3"].Text = "9";
            sheetRequest.Range["K3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["L3"].Text = "10";
            sheetRequest.Range["L3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["M3"].Text = "11";
            sheetRequest.Range["M3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["N3"].Text = "12";
            sheetRequest.Range["N3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["O3"].Text = "13";
            sheetRequest.Range["O3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["P3"].Text = "14";
            sheetRequest.Range["P3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["Q3"].Text = "15";
            sheetRequest.Range["Q3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["R3"].Text = "16";
            sheetRequest.Range["R3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["S3"].Text = "17";
            sheetRequest.Range["S3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["T3"].Text = "18";
            sheetRequest.Range["T3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["U3"].Text = "19";
            sheetRequest.Range["U3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            string[] excelColums = { "V", "W", "X", "Y", "Z", "AA", "AB", "AC", "AD", "AE" };//Các cột phụ cấp
            var listAllowance = _context.AttributeManagers.Where(x => !x.IsDeleted && x.Group.Equals("ATTR_GROUP_ALLOWANCE")).ToList();//Lấy danh sách phụ cấp
            var columRangeTo = "Y3";
            var columRangeEnd = "Y3";
            var columRangeFromTo = "";
            if (listAllowance.Count > 0)
            {
                var columFrom = excelColums[0] + 1;
                var columTo = excelColums[listAllowance.Count - 1] + 1;
                var columRange = string.Format("{0}:{1}", columFrom, columTo);
                columRangeTo = excelColums[listAllowance.Count - 1] + 3;
                columRangeEnd = excelColums[listAllowance.Count - 1] + (list.Count + 3);
                sheetRequest.Range[columRange].Merge(true);
                sheetRequest.Range[columFrom].Text = "Phụ cấp";
                sheetRequest.Range[columFrom].HorizontalAlignment = ExcelHAlign.HAlignCenter;
                sheetRequest.Range[columFrom].CellStyle.Font.Bold = true;
            }

            for (int i = 0; i < listAllowance.Count; i++)
            {
                var columFrom = excelColums[i] + 2;
                sheetRequest.Range[columFrom].Text = listAllowance[i].Name;

                var columNumber = excelColums[i] + 3;
                sheetRequest.Range[columNumber].Text = (20 + i).ToString();
                sheetRequest.Range[columNumber].HorizontalAlignment = ExcelHAlign.HAlignCenter;
            }

            IStyle tableHeader = workbook.Styles.Add("TableHeaderStyle");
            tableHeader.Font.Color = ExcelKnownColors.Black;
            tableHeader.Font.Size = 11;
            tableHeader.Font.FontName = "Calibri";
            tableHeader.Font.Bold = true;
            tableHeader.HorizontalAlignment = ExcelHAlign.HAlignCenter;
            tableHeader.VerticalAlignment = ExcelVAlign.VAlignCenter;
            tableHeader.Color = Color.FromArgb(0, 165, 215, 213);
            tableHeader.Borders[ExcelBordersIndex.EdgeLeft].LineStyle = ExcelLineStyle.Thin;
            tableHeader.Borders[ExcelBordersIndex.EdgeRight].LineStyle = ExcelLineStyle.Thin;
            tableHeader.Borders[ExcelBordersIndex.EdgeTop].LineStyle = ExcelLineStyle.Thin;
            tableHeader.Borders[ExcelBordersIndex.EdgeBottom].LineStyle = ExcelLineStyle.Thin;
            sheetRequest.UsedRange.AutofitColumns();
            sheetRequest["A1:" + columRangeTo].CellStyle = tableHeader;

            sheetRequest["A4:" + columRangeEnd].CellStyle.Borders[ExcelBordersIndex.EdgeLeft].LineStyle = ExcelLineStyle.Thin;
            sheetRequest["A4:" + columRangeEnd].CellStyle.Borders[ExcelBordersIndex.EdgeRight].LineStyle = ExcelLineStyle.Thin;
            sheetRequest["A4:" + columRangeEnd].CellStyle.Borders[ExcelBordersIndex.EdgeTop].LineStyle = ExcelLineStyle.Thin;
            sheetRequest["A4:" + columRangeEnd].CellStyle.Borders[ExcelBordersIndex.EdgeBottom].LineStyle = ExcelLineStyle.Thin;

            sheetRequest.Range["B1"].ColumnWidth = 25;
            sheetRequest.Range["C1"].ColumnWidth = 25;

            sheetRequest.Range["I4:Q" + (list.Count + 3)].CellStyle.Color = Color.FromArgb(0, 242, 229, 109);

            var row = 4;
            var index = 1;
            foreach (var item in list)
            {
                columRangeFromTo = string.Empty;
                sheetRequest.Range["A" + row].Text = index < 10 ? "0" + index : index.ToString();
                sheetRequest.Range["A" + row].HorizontalAlignment = ExcelHAlign.HAlignCenter;

                sheetRequest.Range["B" + row].Text = item.FullName;
                sheetRequest.Range["B" + row].HorizontalAlignment = ExcelHAlign.HAlignLeft;

                sheetRequest.Range["C" + row].Text = item.Position;
                sheetRequest.Range["C" + row].HorizontalAlignment = ExcelHAlign.HAlignLeft;

                sheetRequest.Range["D" + row].Text = item.Salary.ToString();
                sheetRequest.Range["D" + row].HorizontalAlignment = ExcelHAlign.HAlignRight;


                sheetRequest.Range["F" + row].Text = item.TimeWorking.ToString();
                sheetRequest.Range["F" + row].HorizontalAlignment = ExcelHAlign.HAlignRight;

                sheetRequest.Range["R" + row].Text = "0";
                sheetRequest.Range["R" + row].HorizontalAlignment = ExcelHAlign.HAlignRight;

                sheetRequest.Range["S" + row].Text = "0";
                sheetRequest.Range["S" + row].HorizontalAlignment = ExcelHAlign.HAlignRight;

                sheetRequest.Range["U" + row].Text = item.SalaryRatio;
                sheetRequest.Range["U" + row].HorizontalAlignment = ExcelHAlign.HAlignRight;

                //Format chữ in đậm
                sheetRequest.Range["G" + row].CellStyle.Font.Bold = true;
                sheetRequest.Range["H" + row].CellStyle.Font.Bold = true;
                sheetRequest.Range["T" + row].CellStyle.Font.Bold = true;

                //Format Currency
                sheetRequest.Range["D" + row].NumberFormat = "#,#";
                sheetRequest.Range["E" + row].NumberFormat = "#,#";
                sheetRequest.Range["G" + row].NumberFormat = "#,#";
                sheetRequest.Range["H" + row].NumberFormat = "#,#";
                sheetRequest.Range[string.Format("I{0}:T{1}", row, row)].NumberFormat = "#,#";
                sheetRequest.Range[string.Format("V{0}:AE{1}", row, row)].NumberFormat = "#,#";

                for (int i = 0; i < listAllowance.Count; i++)
                {
                    columRangeFromTo += string.Format("+{0}{1}", excelColums[i], row);
                }
                //Lắp các công thức tính
                //sheetRequest.Range["E" + row].Formula = "=SUBTOTAl(9,D" + row + "," + columRangeFromTo + ")";//Tổng thu nhập (E)
                sheetRequest.Range["E" + row].Formula = "=D" + row + "*U" + row + columRangeFromTo + ")";//Tổng thu nhập (E)
                sheetRequest.Range["G" + row].Formula = string.Format("=E{0}/26*F{1}", row, row);//Tổng thu nhập thực tế (G)
                sheetRequest.Range["H" + row].Formula = string.Format("=D{0}*U{1}+V{2}", row, row, row);//Lương đóng bảo hiểm (H) = Lương chính + Phụ cấp trách nhiệm (Cột V)
                sheetRequest.Range["I" + row].Formula = string.Format("=H{0}*2/100", row);//KPCĐ (Doanh nghiệp)(I)
                sheetRequest.Range["J" + row].Formula = string.Format("=H{0}*(175/1000)", row);//BHXH (Doanh nghiệp)(J)
                sheetRequest.Range["K" + row].Formula = string.Format("=H{0}*3/100", row);//BHYT (Doanh nghiệp)(K)
                sheetRequest.Range["L" + row].Formula = string.Format("=H{0}*1/100", row);//BHTN (Doanh nghiệp)(L)
                sheetRequest.Range["M" + row].Formula = string.Format("=H{0}*(235/1000)", row);//Cộng 23.5% (Doanh nghiệp)(M)
                sheetRequest.Range["N" + row].Formula = string.Format("=H{0}*8/100", row);//BHXH (Nhân viên)(N)
                sheetRequest.Range["O" + row].Formula = string.Format("=H{0}*(15/1000)", row);//BHYT (Nhân viên)(O)
                sheetRequest.Range["P" + row].Formula = string.Format("=H{0}*1/100", row);//BHTN (Nhân viên)(P)
                sheetRequest.Range["Q" + row].Formula = string.Format("=H{0}*(105/1000)", row, row);//Cộng 10,5% (Nhân viên)(Q)

                sheetRequest.Range["T" + row].Formula = string.Format("=G{0}-Q{1}-R{2}-S{3})", row, row, row, row);//Thực lĩnh(T)

                row++;
                index++;
            }
            //string ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            var fileName = "Bảng lương tháng " + month + " năm " + year + ".xlsx";
            MemoryStream ms = new MemoryStream();
            workbook.SaveAs(ms);
            workbook.Close();
            excelEngine.Dispose();
            ms.Position = 0;
            JMessage msg1 = _upload.UploadFileByBytes(ms.GetBuffer(), fileName, _hostingEnvironment.WebRootPath, "uploads\\tempFile");
            string path = msg1.Object.ToString();
            return path;
        }

        [NonAction]
        public string CreateFileNew(List<ExcelSalary> list, int month, int year, string file)
        {
            var msg = new JMessage();
            var filePath = "/files/Template/Bang_luong.xlsx";
            if (!string.IsNullOrEmpty(file))
                filePath = file;

            string path = filePath;
            var pathUpload = string.Concat(_hostingEnvironment.WebRootPath, path);
            Stream fileStreamPath = new FileStream(pathUpload, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
            FormFile fileUpload = new FormFile(fileStreamPath, 0, fileStreamPath.Length, "Test", "Test.xlsx");

            // Read content from file
            ExcelEngine excelEngine = new ExcelEngine();
            IApplication application = excelEngine.Excel;
            IWorkbook workbook = application.Workbooks.Open(fileUpload.OpenReadStream());
            IWorksheet sheetRequest = workbook.Worksheets[0];

            workbook.SetSeparators(';', ',');

            for (int i = 8; i <= 48; i++)
            {
                var listColum = _context.ExcelExpressions.Where(x => !x.IsDeleted).ToList();
                foreach (var item in listColum)
                {
                    var colum = string.Format(item.ColumName, i);
                    var formula = string.Format(item.Calculation, i);
                    sheetRequest.Range[colum].Formula = formula;
                }
            }

            //Hàm tính toán công thức
            sheetRequest.EnableSheetCalculations();

            //Loop through worksheets
            foreach (var item in workbook.Worksheets)
            {
                //Loop through cells
                foreach (var cell in item.Range)
                {
                    //If the cell contain formula, get the formula value, clear cell content, and then fill the formula value into the cell 
                    if (cell.HasFormula)
                    {
                        if (!cell.AddressLocal.Contains("F"))
                        {
                            var value = !string.IsNullOrEmpty(cell.DisplayText) ? cell.DisplayText.Trim().Replace(",", "") : "";
                            if (!value.Contains("-"))
                            {
                                cell.Clear(ExcelClearOptions.ClearContent);
                                cell.Value2 = value;
                            }
                            else
                            {
                                cell.Clear(ExcelClearOptions.ClearContent);
                                cell.Value2 = 0;
                            }
                        }
                    }
                }
            }

            //string ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            var fileName = "Temp_" + month + "_" + year + ".xlsx";
            MemoryStream ms = new MemoryStream();
            workbook.SaveAs(ms);
            workbook.Close();
            excelEngine.Dispose();
            ms.Position = 0;
            JMessage msg1 = _upload.UploadFileByBytes(ms.GetBuffer(), fileName, _hostingEnvironment.WebRootPath, "uploads\\tempFile");
            string _path = msg1.Object.ToString();
            return _path;
        }

        [HttpPost]
        public object ExportExcel([FromBody] List<ExcelExportSalary> listData)
        {
            var msg = new JMessage();
            var filePath = "/files/Template/Bang_luong.xlsx";

            string path = filePath;
            var pathUpload = string.Concat(_hostingEnvironment.WebRootPath, path);
            Stream fileStreamPath = new FileStream(pathUpload, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
            FormFile fileUpload = new FormFile(fileStreamPath, 0, fileStreamPath.Length, "Test", "Test.xlsx");

            // Read content from file
            ExcelEngine excelEngine = new ExcelEngine();
            IApplication application = excelEngine.Excel;
            IWorkbook workbook = application.Workbooks.Open(fileUpload.OpenReadStream());
            IWorksheet sheetRequest = workbook.Worksheets[0];

            workbook.SetSeparators(';', ',');

            var listDepartment = listData.GroupBy(x => x.DepartmentCode).Select(p => new { p.First().DepartmentCode, p.First().DepartmentName }).ToList();

            var countDelete = 60 - listData.Count - listDepartment.Count;
            if (countDelete > 0)
            {
                sheetRequest.DeleteRow(11, countDelete);
            }

            IStyle style = workbook.Styles.Add("NewStyle");
            style.Color = Color.Gray;
            style.Font.Bold = true;
            style.Font.Size = 12;
            style.Borders[ExcelBordersIndex.EdgeLeft].LineStyle = ExcelLineStyle.Thin;
            style.Borders[ExcelBordersIndex.EdgeRight].LineStyle = ExcelLineStyle.Thin;
            style.Borders[ExcelBordersIndex.EdgeTop].LineStyle = ExcelLineStyle.Thin;
            style.Borders[ExcelBordersIndex.EdgeBottom].LineStyle = ExcelLineStyle.Thin;

            var row = 11;
            var stt = 0;

            DateTime time = DateTime.Now;

            if (listData.Count() > 0)
            {
                if (!string.IsNullOrEmpty(listData.FirstOrDefault().Month))
                    time = DateTime.ParseExact(listData.First().Month, "MM/yyyy", CultureInfo.InvariantCulture);
            }

            sheetRequest.Range["A6"].Value2 = string.Format("BẢNG LƯƠNG THÁNG {0} NĂM {1}", time.Month, time.Year);
            sheetRequest.Range["A6"].RowHeight = 50;
            sheetRequest.Range["A6"].VerticalAlignment = ExcelVAlign.VAlignCenter;

            sheetRequest.Name = "Tháng " + time.Month;

            for (int k = 0; k < listDepartment.Count; k++)
            {
                var listDataByDepartment = listData.Where(x => x.DepartmentCode.Equals(listDepartment[k].DepartmentCode)).ToList();
                sheetRequest.Range["B" + row].Value2 = listDepartment[k].DepartmentName;

                sheetRequest.Range["A" + row + ":Y" + row].CellStyle = style;
                sheetRequest.Range["A" + row + ":Z" + (row + listData.Count + listDepartment.Count)].RowHeight = 50;

                sheetRequest.Range["B" + row].VerticalAlignment = ExcelVAlign.VAlignCenter;
                for (int i = 0; i < listDataByDepartment.Count; i++)
                {
                    row++;
                    stt++;

                    sheetRequest.Range["A" + row].Value2 = stt;
                    sheetRequest.Range["B" + row].Value2 = listDataByDepartment[i].Name.ToString();
                    sheetRequest.Range["C" + row].Value2 = listDataByDepartment[i].SalaryLevel;
                    sheetRequest.Range["D" + row].Value2 = (listDataByDepartment[i].D != null && listDataByDepartment[i].D != 0) ? listDataByDepartment[i].D.ToString().Replace(".", ",") : "";
                    sheetRequest.Range["E" + row].Value2 = (listDataByDepartment[i].E != null && listDataByDepartment[i].E != 0) ? listDataByDepartment[i].E.ToString().Replace(".", ",") : "";
                    sheetRequest.Range["F" + row].Value2 = (listDataByDepartment[i].F != null && listDataByDepartment[i].F != 0) ? listDataByDepartment[i].F.ToString().Replace(".", ",") : "";
                    sheetRequest.Range["G" + row].Value2 = (listDataByDepartment[i].G != null && listDataByDepartment[i].G != 0) ? listDataByDepartment[i].G.ToString().Replace(".", ",") : "";
                    sheetRequest.Range["H" + row].Value2 = (listDataByDepartment[i].H != null && listDataByDepartment[i].H != 0) ? listDataByDepartment[i].H.ToString().Replace(".", ",") : "";
                    sheetRequest.Range["I" + row].Value2 = (listDataByDepartment[i].I != null && listDataByDepartment[i].I != 0) ? listDataByDepartment[i].I.ToString() : "";
                    sheetRequest.Range["J" + row].Value2 = (listDataByDepartment[i].J != null && listDataByDepartment[i].J != 0) ? listDataByDepartment[i].J.ToString() : "";
                    sheetRequest.Range["K" + row].Value2 = (listDataByDepartment[i].K != null && listDataByDepartment[i].K != 0) ? listDataByDepartment[i].K.ToString() : "";
                    sheetRequest.Range["L" + row].Value2 = (listDataByDepartment[i].L != null && listDataByDepartment[i].L != 0) ? listDataByDepartment[i].L.ToString() : "";
                    sheetRequest.Range["M" + row].Value2 = (listDataByDepartment[i].M != null && listDataByDepartment[i].M != 0) ? listDataByDepartment[i].M.ToString() : "";
                    sheetRequest.Range["N" + row].Value2 = (listDataByDepartment[i].N != null && listDataByDepartment[i].N != 0) ? listDataByDepartment[i].N.ToString().Replace(".", ",") : "";
                    sheetRequest.Range["O" + row].Value2 = (listDataByDepartment[i].O != null && listDataByDepartment[i].O != 0) ? listDataByDepartment[i].O.ToString() : "";
                    sheetRequest.Range["P" + row].Value2 = (listDataByDepartment[i].P != null && listDataByDepartment[i].P != 0) ? listDataByDepartment[i].P.ToString() : "";
                    sheetRequest.Range["Q" + row].Value2 = (listDataByDepartment[i].Q != null && listDataByDepartment[i].Q != 0) ? listDataByDepartment[i].Q.ToString() : "";
                    sheetRequest.Range["R" + row].Value2 = (listDataByDepartment[i].R != null && listDataByDepartment[i].R != 0) ? listDataByDepartment[i].R.ToString() : "";
                    sheetRequest.Range["S" + row].Value2 = (listDataByDepartment[i].S != null && listDataByDepartment[i].S != 0) ? listDataByDepartment[i].S.ToString() : "";
                    sheetRequest.Range["T" + row].Value2 = (listDataByDepartment[i].T != null && listDataByDepartment[i].T != 0) ? listDataByDepartment[i].T.ToString() : "";
                    sheetRequest.Range["U" + row].Value2 = (listDataByDepartment[i].U != null && listDataByDepartment[i].U != 0) ? listDataByDepartment[i].U.ToString() : "";
                    sheetRequest.Range["V" + row].Value2 = (listDataByDepartment[i].V != null && listDataByDepartment[i].V != 0) ? listDataByDepartment[i].V.ToString().Replace(".", ",") : "";
                    sheetRequest.Range["W" + row].Value2 = (listDataByDepartment[i].VR != null && listDataByDepartment[i].VR != 0) ? listDataByDepartment[i].VR.ToString().Replace(".", ",") : "";
                    sheetRequest.Range["X" + row].Value2 = (listDataByDepartment[i].X != null && listDataByDepartment[i].X != 0) ? listDataByDepartment[i].X.ToString().Replace(".", ",") : "";
                    sheetRequest.Range["Y" + row].Value2 = (listDataByDepartment[i].Y != null && listDataByDepartment[i].Y != 0) ? listDataByDepartment[i].Y.ToString().Replace(".", ",") : "";
                }

                row++;
            }

            workbook.SetSeparators('.', '.');

            var fileName = "Luong_" + DateTime.Now.ToString("ddMMyyy_hhmm") + ".xlsx";
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

        [HttpPost]
        public object SaveExcel([FromBody] List<ExcelExportSalary> listData)
        {
            var msg = new JMessage();
            var filePath = "/files/Template/Bang_luong.xlsx";

            string path = filePath;
            var pathUpload = string.Concat(_hostingEnvironment.WebRootPath, path);
            Stream fileStreamPath = new FileStream(pathUpload, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
            FormFile fileUpload = new FormFile(fileStreamPath, 0, fileStreamPath.Length, "Test", "Test.xlsx");

            // Read content from file
            ExcelEngine excelEngine = new ExcelEngine();
            IApplication application = excelEngine.Excel;
            IWorkbook workbook = application.Workbooks.Open(fileUpload.OpenReadStream());
            IWorksheet sheetRequest = workbook.Worksheets[0];

            workbook.SetSeparators(';', ',');

            var listDepartment = listData.GroupBy(x => x.DepartmentCode).Select(p => new { p.First().DepartmentCode, p.First().DepartmentName }).ToList();

            var countDelete = 60 - listData.Count - listDepartment.Count;
            sheetRequest.DeleteRow(11, countDelete);

            IStyle style = workbook.Styles.Add("NewStyle");
            style.Color = Color.Gray;
            style.Font.Bold = true;
            style.Font.Size = 12;
            style.Borders[ExcelBordersIndex.EdgeLeft].LineStyle = ExcelLineStyle.Thin;
            style.Borders[ExcelBordersIndex.EdgeRight].LineStyle = ExcelLineStyle.Thin;
            style.Borders[ExcelBordersIndex.EdgeTop].LineStyle = ExcelLineStyle.Thin;
            style.Borders[ExcelBordersIndex.EdgeBottom].LineStyle = ExcelLineStyle.Thin;

            var row = 11;
            var stt = 0;

            DateTime time = DateTime.Now;

            if (listData.Count() > 0)
            {
                if (!string.IsNullOrEmpty(listData.FirstOrDefault().Month))
                    time = DateTime.ParseExact(listData.First().Month, "MM/yyyy", CultureInfo.InvariantCulture);
            }

            sheetRequest.Range["A6"].Value2 = string.Format("BẢNG LƯƠNG THÁNG {0} NĂM {1}", time.Month, time.Year);
            sheetRequest.Range["A6"].RowHeight = 50;
            sheetRequest.Range["A6"].VerticalAlignment = ExcelVAlign.VAlignCenter;

            sheetRequest.Name = "Tháng " + time.Month;

            for (int k = 0; k < listDepartment.Count; k++)
            {
                var listDataByDepartment = listData.Where(x => x.DepartmentCode.Equals(listDepartment[k].DepartmentCode)).ToList();
                sheetRequest.Range["B" + row].Value2 = listDepartment[k].DepartmentName;

                sheetRequest.Range["A" + row + ":Y" + row].CellStyle = style;
                sheetRequest.Range["A" + row + ":Z" + (row + listData.Count + listDepartment.Count)].RowHeight = 50;
                sheetRequest.Range["B" + row].VerticalAlignment = ExcelVAlign.VAlignCenter;

                for (int i = 0; i < listDataByDepartment.Count; i++)
                {
                    row++;
                    stt++;

                    sheetRequest.Range["A" + row].Value2 = stt;
                    sheetRequest.Range["B" + row].Value2 = listDataByDepartment[i].Name.ToString();
                    sheetRequest.Range["C" + row].Value2 = listDataByDepartment[i].SalaryLevel;
                    sheetRequest.Range["D" + row].Value2 = (listDataByDepartment[i].D != null && listDataByDepartment[i].D != 0) ? listDataByDepartment[i].D.ToString().Replace(".", ",") : "";
                    sheetRequest.Range["E" + row].Value2 = (listDataByDepartment[i].E != null && listDataByDepartment[i].E != 0) ? listDataByDepartment[i].E.ToString().Replace(".", ",") : "";
                    sheetRequest.Range["F" + row].Value2 = (listDataByDepartment[i].F != null && listDataByDepartment[i].F != 0) ? listDataByDepartment[i].F.ToString().Replace(".", ",") : "";
                    sheetRequest.Range["G" + row].Value2 = (listDataByDepartment[i].G != null && listDataByDepartment[i].G != 0) ? listDataByDepartment[i].G.ToString().Replace(".", ",") : "";
                    sheetRequest.Range["H" + row].Value2 = (listDataByDepartment[i].H != null && listDataByDepartment[i].H != 0) ? listDataByDepartment[i].H.ToString().Replace(".", ",") : "";
                    sheetRequest.Range["I" + row].Value2 = (listDataByDepartment[i].I != null && listDataByDepartment[i].I != 0) ? listDataByDepartment[i].I.ToString() : "";
                    sheetRequest.Range["J" + row].Value2 = (listDataByDepartment[i].J != null && listDataByDepartment[i].J != 0) ? listDataByDepartment[i].J.ToString() : "";
                    sheetRequest.Range["K" + row].Value2 = (listDataByDepartment[i].K != null && listDataByDepartment[i].K != 0) ? listDataByDepartment[i].K.ToString() : "";
                    sheetRequest.Range["L" + row].Value2 = (listDataByDepartment[i].L != null && listDataByDepartment[i].L != 0) ? listDataByDepartment[i].L.ToString() : "";
                    sheetRequest.Range["M" + row].Value2 = (listDataByDepartment[i].M != null && listDataByDepartment[i].M != 0) ? listDataByDepartment[i].M.ToString() : "";
                    sheetRequest.Range["N" + row].Value2 = (listDataByDepartment[i].N != null && listDataByDepartment[i].N != 0) ? listDataByDepartment[i].N.ToString().Replace(".", ",") : "";
                    sheetRequest.Range["O" + row].Value2 = (listDataByDepartment[i].O != null && listDataByDepartment[i].O != 0) ? listDataByDepartment[i].O.ToString() : "";
                    sheetRequest.Range["P" + row].Value2 = (listDataByDepartment[i].P != null && listDataByDepartment[i].P != 0) ? listDataByDepartment[i].P.ToString() : "";
                    sheetRequest.Range["Q" + row].Value2 = (listDataByDepartment[i].Q != null && listDataByDepartment[i].Q != 0) ? listDataByDepartment[i].Q.ToString() : "";
                    sheetRequest.Range["R" + row].Value2 = (listDataByDepartment[i].R != null && listDataByDepartment[i].R != 0) ? listDataByDepartment[i].R.ToString() : "";
                    sheetRequest.Range["S" + row].Value2 = (listDataByDepartment[i].S != null && listDataByDepartment[i].S != 0) ? listDataByDepartment[i].S.ToString() : "";
                    sheetRequest.Range["T" + row].Value2 = (listDataByDepartment[i].T != null && listDataByDepartment[i].T != 0) ? listDataByDepartment[i].T.ToString() : "";
                    sheetRequest.Range["U" + row].Value2 = (listDataByDepartment[i].U != null && listDataByDepartment[i].U != 0) ? listDataByDepartment[i].U.ToString() : "";
                    sheetRequest.Range["V" + row].Value2 = (listDataByDepartment[i].V != null && listDataByDepartment[i].V != 0) ? listDataByDepartment[i].V.ToString().Replace(".", ",") : "";
                    sheetRequest.Range["W" + row].Value2 = (listDataByDepartment[i].VR != null && listDataByDepartment[i].VR != 0) ? listDataByDepartment[i].VR.ToString().Replace(".", ",") : "";
                    sheetRequest.Range["X" + row].Value2 = (listDataByDepartment[i].X != null && listDataByDepartment[i].X != 0) ? listDataByDepartment[i].X.ToString().Replace(".", ",") : "";
                    sheetRequest.Range["Y" + row].Value2 = (listDataByDepartment[i].Y != null && listDataByDepartment[i].Y != 0) ? listDataByDepartment[i].Y.ToString().Replace(".", ",") : "";
                }

                row++;
            }

            workbook.SetSeparators('.', '.');

            var listDB = _context.SalaryEmployeeMonths.Where(x => !x.IsDeleted && x.Month.Month.Equals(time.Month) && x.Month.Year.Equals(time.Year));
            var listInsert = listData.Where(x => !listDB.Any(p => p.EmployeeId.Equals(x.EmployeeId)))
                .Select(k => new SalaryEmployeeMonth
                {
                    Month = time,
                    EmployeeId = k.EmployeeId,
                    Name = k.Name,
                    DepartmentCode = k.DepartmentCode,
                    DepartmentName = k.DepartmentName,
                    SalaryLevel = k.SalaryLevel,
                    SalaryRatio = k.SalaryRatio,
                    CreatedBy = User.Identity.Name,
                    CreatedTime = DateTime.Now,
                    D = k.D,//HS Lương
                    E = k.E,//Ngày làm việc tại VP
                    F = k.F,// Con Ốm + Nghỉ ốm
                    G = k.G,//Phép
                    H = k.H,
                    I = k.I,
                    J = k.J,
                    K = k.K,//K=I+J
                    L = k.L,
                    M = k.M,
                    N = k.N,
                    O = k.O,//O=M*N
                    P = k.P,
                    Q = k.Q,
                    R = k.R,//R=K+O+P+Q
                    S = k.S,
                    AT = k.AT,//Ăn trưa
                    T = k.T,//T=R-S
                    U = k.U,
                    V = k.V,//Công tác
                    VR = k.VR,//Việc riêng
                    X = k.X,//Nghỉ lễ
                    Y = k.Y,
                    TotalDay = k.TotalDay,
                });

            _context.SalaryEmployeeMonths.AddRange(listInsert);

            var listUpdate = (from a in listDB
                              join b in listData on a.EmployeeId equals b.EmployeeId
                              select new SalaryEmployeeMonth
                              {
                                  ID = a.ID,
                                  EmployeeId = b.EmployeeId,
                                  Name = b.Name,
                                  DepartmentCode = b.DepartmentCode,
                                  DepartmentName = b.DepartmentName,
                                  SalaryLevel = b.SalaryLevel,
                                  SalaryRatio = b.SalaryRatio,
                                  CreatedBy = a.CreatedBy,
                                  CreatedTime = a.CreatedTime,
                                  Month = a.Month,
                                  UpdatedBy = User.Identity.Name,
                                  UpdatedTime = DateTime.Now,
                                  D = b.D,//HS Lương
                                  E = b.E,//Ngày làm việc tại VP
                                  F = b.F,// Con Ốm + Nghỉ ốm
                                  G = b.G,//Phép
                                  H = b.H,
                                  I = b.I,
                                  J = b.J,
                                  K = b.K,//K=I+J
                                  L = b.L,
                                  M = b.M,
                                  N = b.N,
                                  O = b.O,//O=M*N
                                  P = b.P,
                                  Q = b.Q,
                                  R = b.R,//R=K+O+P+Q
                                  S = b.S,
                                  AT = b.AT,//Ăn trưa
                                  T = b.T,//T=R-S
                                  U = b.U,
                                  V = b.V,//Công tác
                                  VR = b.VR,//Việc riêng
                                  X = b.X,//Nghỉ lễ
                                  Y = b.Y,
                                  TotalDay = b.TotalDay,
                              });

            _context.SalaryEmployeeMonths.UpdateRange(listUpdate);

            _context.SaveChanges();

            var fileName = "Luong_" + DateTime.Now.ToString("ddMMyyy_hhmm") + ".xlsx";
            MemoryStream ms = new MemoryStream();
            workbook.SaveAs(ms);
            workbook.Close();
            excelEngine.Dispose();
            ms.Position = 0;

            string urlFile = "";
            string pathFTP = "/7. BẢNG LƯƠNG";

            var getRepository = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == "02");
            if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server))
            {
                var fileBytes = ms.ToArray();
                urlFile = pathFTP + Path.Combine("/", fileName);
                var urlFilePreventive = pathFTP + Path.Combine("/", Guid.NewGuid().ToString().Substring(0, 8) + fileName);
                var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + getRepository.Server + urlFile);
                var urlEndPreventive = System.Web.HttpUtility.UrlPathEncode("ftp://" + getRepository.Server + urlFilePreventive);
                var result = FileExtensions.UploadFileToFtpServer(urlEnd, urlEndPreventive, fileBytes, getRepository.Account, getRepository.PassWord);
                if (result.Status == WebExceptionStatus.ConnectFailure || result.Status == WebExceptionStatus.ProtocolError)
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["WBS_MSG_ERR_CONNECTION"];
                }
                else if (result.Status == WebExceptionStatus.Success)
                {
                    msg.Title = _sharedResources["COM_MSG_EDITED_FILE_SUCCESS"];

                    if (result.IsSaveUrlPreventive)
                    {
                        urlFile = urlFilePreventive;
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_MSG_ERR"];
                }

                var edmsReposCatFile = new EDMSRepoCatFile
                {
                    FileCode = string.Concat("REPOSITORY", Guid.NewGuid().ToString()),
                    ReposCode = "02",
                    CatCode = "SALARY",
                    ObjectCode = null,
                    ObjectType = null,
                    Path = pathFTP,
                    FolderId = ""
                };

                //LuceneExtension.IndexFile(edmsReposCatFile.FileCode, new FormFile(fileStream, 0, fileStream.Length), string.Concat(_hostingEnvironment.WebRootPath, "\\uploads\\luceneIndex"));

                var file = new EDMSFile
                {
                    FileCode = edmsReposCatFile.FileCode,
                    FileName = fileName,
                    Desc = "",
                    ReposCode = "02",
                    Tags = "",
                    FileSize = ms.Length,
                    FileTypePhysic = ".xlsx",
                    NumberDocument = "",
                    CreatedBy = ESEIM.AppContext.UserName,
                    CreatedTime = DateTime.Now,
                    Url = urlFile,
                    MimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    CloudFileId = "",
                };

                _context.EDMSFiles.Add(file);
                _context.EDMSRepoCatFiles.Add(edmsReposCatFile);
                _context.SaveChanges();
            }

            return msg;
        }

        public class ShiftSpan
        {
            public DateTime BeginTime { get; set; }
            public DateTime EndTime { get; set; }
            public string ShiftCode { get; set; }
        }

        [NonAction]
        public List<TimeWorkingSheet> TimeWorking(int month, int year, string userName)
        {
            try
            {
                var listDateInMonth = DateTimeExtensions.GetDates(year, month);
                var query = (from a in _context.VShiftLogs
                             join b in _context.Users on a.CreatedBy equals b.UserName
                             where (string.IsNullOrEmpty(userName) || a.CreatedBy.Equals(userName))
                              && (a.ChkinTime.Value.Date >= listDateInMonth[0].Date)
                             && (a.ChkoutTime.HasValue ? a.ChkoutTime.Value.Date : DateTime.Now.Date) <= listDateInMonth[listDateInMonth.Count() - 1].Date
                             select new
                             {
                                 a.Id,
                                 a.ShiftCode,
                                 a.CreatedBy,
                                 a.ChkinTime,
                                 a.ChkoutTime,
                                 UserId = b.Id,
                                 a.WorkingShiftCode,
                                 a.IsBussiness
                             }).GroupBy(x => x.CreatedBy).ToList();
                var listTimeWorking = new List<TimeWorkingSheet>();
                // get condition
                var shiftSettings = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "DAY_SHIFT").Select(x => new ShiftSetting(
                    x.ValueSet,
                    x.CodeSet
                 )
                );
                var shifts = new List<ShiftItem>();
                foreach (var item in shiftSettings)
                {
                    var shift = item.ValueSet.Split('-');
                    shifts.Add(new ShiftItem(
                        shift,
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
                // 
                if (query.Any())
                {
                    foreach (var itemQ in query)
                    {
                        double timeWorking = 0;
                        double hourWorking = 0;
                        double hourOvertime = 0;
                        double hourWorkingBussiness = 0;
                        double hourOvertimeBussiness = 0;
                        var timeSheet = new TimeWorkingSheet();
                        timeSheet.ListShift = new List<TimeWorkingShift>();
                        foreach (var item in listDateInMonth)
                        {
                            var sessionUser = itemQ.Where(a => (a.ChkinTime.Value.Date >= item.Date) && a.ChkoutTime.HasValue
                                 && a.ChkoutTime.Value.Date <= item.Date);
                            foreach (var shift in shiftSpans)
                            {
                                //var sessionUser = sessionUser.DistinctBy(x => x.ShiftCode).ToList();
                                // Vatco special
                                if (sessionUser.Any(session => session.ChkinTime.Value.DayOfWeek != DayOfWeek.Saturday && session.ChkinTime.Value.DayOfWeek != DayOfWeek.Sunday
                                     && session.ChkinTime.Value.TimeOfDay <= shift.BeginTime.TimeOfDay && session.ChkoutTime.HasValue && session.ChkoutTime.Value.TimeOfDay >= shift.EndTime.TimeOfDay))
                                {
                                    var session = sessionUser.FirstOrDefault(x => x.ChkinTime.Value.DayOfWeek != DayOfWeek.Saturday && x.ChkinTime.Value.DayOfWeek != DayOfWeek.Sunday
                                     && x.ChkinTime.Value.TimeOfDay <= shift.BeginTime.TimeOfDay && x.ChkoutTime.HasValue && x.ChkoutTime.Value.TimeOfDay >= shift.EndTime.TimeOfDay);
                                    timeWorking += 1;  //session.ChkoutTime.Value.Subtract(session.ChkinTime.Value).TotalSeconds;
                                    timeSheet.ListShift.Add(new TimeWorkingShift { ShiftCode = session?.WorkingShiftCode ?? "", IsWorking = true, Key = item.Date.Day });
                                }
                                var sessionUserWorking = sessionUser.Where(x => x.ChkinTime.Value.DayOfWeek != DayOfWeek.Saturday && x.ChkinTime.Value.DayOfWeek != DayOfWeek.Sunday
                                && x.ChkinTime.Value.TimeOfDay < shift.EndTime.TimeOfDay && x.IsBussiness != true)
                                    .Select(x => new Interval { Start = x.ChkinTime.Value, End = MinTimeOfDay(x.ChkoutTime.Value, shift.EndTime, x.ChkoutTime.Value) });
                                var timeSpanUserWorking = sessionUserWorking.Count() > 0 ? MergeOverlappingIntervals(sessionUserWorking).Select(x => x.End - x.Start) : new List<TimeSpan>();
                                hourWorking += timeSpanUserWorking.Count() > 0 ? (new TimeSpan(timeSpanUserWorking.Sum(r => r.Ticks)).TotalHours) : 0;

                                var sessionUserOverTime = sessionUser.Where(x => x.ChkinTime.Value.DayOfWeek != DayOfWeek.Saturday && x.ChkinTime.Value.DayOfWeek != DayOfWeek.Sunday
                                && x.ChkoutTime.Value.TimeOfDay > shift.EndTime.TimeOfDay && x.IsBussiness != true)
                                    .Select(x => new Interval { Start = MaxTimeOfDay(x.ChkinTime.Value, shift.EndTime, x.ChkinTime.Value), End = x.ChkoutTime.Value });
                                var timeSpanUserOvertime = sessionUserOverTime.Count() > 0 ? MergeOverlappingIntervals(sessionUserOverTime).Select(x => x.End - x.Start) : new List<TimeSpan>();
                                hourOvertime += timeSpanUserOvertime.Count() > 0 ? (new TimeSpan(timeSpanUserOvertime.Sum(r => r.Ticks)).TotalHours) : 0;

                                var sessionUserWorkingBussiness = sessionUser.Where(x => x.ChkinTime.Value.TimeOfDay < shift.EndTime.TimeOfDay && x.IsBussiness == true)
                                    .Select(x => new Interval { Start = x.ChkinTime.Value, End = MinTimeOfDay(x.ChkoutTime.Value, shift.EndTime, x.ChkoutTime.Value) });
                                var timeSpanUserWorkingBussiness = sessionUserWorkingBussiness.Count() > 0 ? MergeOverlappingIntervals(sessionUserWorkingBussiness).Select(x => x.End - x.Start) : new List<TimeSpan>();
                                hourWorkingBussiness += timeSpanUserWorkingBussiness.Count() > 0 ? (new TimeSpan(timeSpanUserWorkingBussiness.Sum(r => r.Ticks)).TotalHours) : 0;

                                var sessionUserOvertimeBussiness = sessionUser.Where(x => x.ChkoutTime.Value.TimeOfDay > shift.EndTime.TimeOfDay && x.IsBussiness == true)
                                    .Select(x => new Interval { Start = MaxTimeOfDay(x.ChkinTime.Value, shift.EndTime, x.ChkinTime.Value), End = x.ChkoutTime.Value });
                                var timeSpanUserOvertimeBussiness = sessionUserOvertimeBussiness.Count() > 0 ? MergeOverlappingIntervals(sessionUserOvertimeBussiness).Select(x => x.End - x.Start) : new List<TimeSpan>();
                                hourOvertimeBussiness += timeSpanUserOvertimeBussiness.Count() > 0 ? (new TimeSpan(timeSpanUserOvertimeBussiness.Sum(r => r.Ticks)).TotalHours) : 0;
                            }
                        }

                        double days = timeWorking; // (8 * 3600);
                                                   //                           // days = Math.Round(days * 2, MidpointRounding.AwayFromZero) / 2;
                                                   //timeSheet.ID = item.First().Id;
                        timeSheet.UserName = itemQ.Key;
                        timeSheet.UserId = itemQ.FirstOrDefault()?.UserId;
                        timeSheet.TimeWorking = days;
                        timeSheet.HourWorking = hourWorking;
                        timeSheet.HourOvertime = hourOvertime;
                        timeSheet.HourWorkingBussiness = hourWorkingBussiness;
                        timeSheet.HourOvertimeBussiness = hourOvertimeBussiness;
                        listTimeWorking.Add(timeSheet);
                    }
                }
                return listTimeWorking;
            }
            catch (Exception ex)
            {
                return new List<TimeWorkingSheet>();
            }
        }

        IEnumerable<Interval> MergeOverlappingIntervals(IEnumerable<Interval> intervals)
        {
            var accumulator = intervals.First();
            intervals = intervals.Skip(1);

            foreach (var interval in intervals)
            {
                if (interval.Start <= accumulator.End)
                {
                    accumulator = Combine(accumulator, interval);
                }
                else
                {
                    yield return accumulator;
                    accumulator = interval;
                }
            }

            yield return accumulator;
        }

        Interval Combine(Interval start, Interval end)
        {
            return new Interval
            {
                Start = start.Start,
                End = Max(start.End, end.End),
            };
        }

        private static DateTime Max(DateTime left, DateTime right)
        {
            return (left > right) ? left : right;
        }
        private static DateTime MinTimeOfDay(DateTime left, DateTime right, DateTime baseDay)
        {
            var time = (left.TimeOfDay < right.TimeOfDay) ? left : right;
            return baseDay.Date.Add(time.TimeOfDay);
        }
        private static DateTime MaxTimeOfDay(DateTime left, DateTime right, DateTime baseDay)
        {
            var time = (left.TimeOfDay > right.TimeOfDay) ? left : right;
            return baseDay.Date.Add(time.TimeOfDay);
        }
        public class ExcelSalary
        {
            public string FullName { get; set; }
            public double? Salary { get; set; }
            public string Position { get; set; }
            public double? TimeWorking { get; set; }
            public string SalaryRatio { get; set; }
        }
        public class TimeWorkingSheet
        {
            public int ID { get; set; }
            public string UserName { get; set; }
            public double? TimeWorking { get; set; }
            public List<TimeWorkingShift> ListShift { get; set; }
            public string UserId { get; set; }
            public double? HourWorking { get; internal set; }
            public double? HourOvertime { get; internal set; }
            public double? HourWorkingBussiness { get; internal set; }
            public double? HourOvertimeBussiness { get; internal set; }
        }
        public class TimeWorkingShift
        {
            public string ShiftCode { get; set; }
            public bool IsWorking { get; set; }
            public int Key { get; set; }
        }

        public class DayWorkingSheet
        {
            public string UserId { get; set; }
            public double Day { get; set; }
            public double WorkHoliday { get; set; }
            public List<Data> ListDay { get; set; }
        }

        public class Day
        {
            public List<Data> ListDay { get; set; }
            public double Count { get; set; }
            public double CountWorkHoliday { get; set; }
        }

        public class Data
        {
            public string Key { get; set; }
            public string Value { get; set; }
            public bool HoliDay { get; set; }
            public double CountWorkNL { get; set; }
            public TimeWorkingShift Shift { get; set; }
        }

        public class DayOffMonth
        {
            public DayOffMonth()
            {
                ListDateOff = new List<string>();
            }
            public int Month { get; set; }
            public int DayOff { get; set; }
            public List<string> ListDateOff { get; set; }
        }

        public class ExcelExportSalary
        {
            public string Month { get; set; }
            public string EmployeeId { get; set; }
            public string Name { get; set; }
            public string SalaryLevel { get; set; }
            public string SalaryRatio { get; set; }
            public string DepartmentCode { get; set; }
            public string DepartmentName { get; set; }
            public decimal? D { get; set; }
            public decimal? E { get; set; }
            public decimal? F { get; set; }
            public decimal? G { get; set; }
            public decimal? H { get; set; }
            public decimal? I { get; set; }
            public decimal? J { get; set; }
            public decimal? K { get; set; }
            public decimal? L { get; set; }
            public decimal? M { get; set; }
            public decimal? N { get; set; }
            public decimal? O { get; set; }
            public decimal? P { get; set; }
            public decimal? Q { get; set; }
            public decimal? R { get; set; }
            public decimal? S { get; set; }
            public decimal? AT { get; set; }
            public decimal? T { get; set; }
            public decimal? U { get; set; }
            public decimal? V { get; set; }
            public decimal? VR { get; set; }
            public decimal? X { get; set; }
            public decimal? Y { get; set; }
            public decimal? TotalDay { get; set; }
        }
        public class Interval
        {
            public DateTime Start { get; set; }
            public DateTime End { get; set; }
        }
        #endregion

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

        #region Object Read Excel

        public class ExcelSalaryModel
        {
            public List<SalaryTableAllowance> ListSalaryAllowance { get; set; }
            public SalaryTableDetail SalaryTableDetail { get; set; }
        }

        #endregion
    }

    internal class ShiftSetting
    {
        public string ValueSet { get; }
        public string ShiftCode { get; }

        public ShiftSetting(string valueSet, string shiftCode)
        {
            ValueSet = valueSet;
            ShiftCode = shiftCode;
        }

        public override bool Equals(object obj)
        {
            return obj is ShiftSetting other &&
                   ValueSet == other.ValueSet &&
                   ShiftCode == other.ShiftCode;
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(ValueSet, ShiftCode);
        }
    }

    internal class ShiftItem
    {
        public string[] ShiftArray { get; }
        public string ShiftCode { get; }

        public ShiftItem(string[] shiftArray, string shiftCode)
        {
            ShiftArray = shiftArray;
            ShiftCode = shiftCode;
        }

        public override bool Equals(object obj)
        {
            return obj is ShiftItem other &&
                   EqualityComparer<string[]>.Default.Equals(ShiftArray, other.ShiftArray) &&
                   ShiftCode == other.ShiftCode;
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(ShiftArray, ShiftCode);
        }
    }

    public class StaffTimeKeepingDetail
    {
        public int Code { get; set; }
        public string Name { get; set; }
        public string SalaryLevel { get; set; }
        public double? SalaryRatio { get; set; }
        public string DepartmentCode { get; set; }
        public string DepartmentName { get; set; }
        public double? D { get; set; }
        public double? E { get; set; }
        public double? E1 { get; set; }
        public double? E2 { get; set; }
        public double? E3 { get; set; }
        public double? E4 { get; set; }
        public List<WorkBookSalaryController.TimeWorkingShift> Z { get; set; }
        public double F { get; set; }
        public double G { get; set; }
        public int H { get; set; }
        public int I { get; set; }
        public int J { get; set; }
        public int K { get; set; }
        public int L { get; set; }
        public int M { get; set; }
        public int N { get; set; }
        public int O { get; set; }
        public int P { get; set; }
        public int Q { get; set; }
        public int R { get; set; }
        public int S { get; set; }
        public int AT { get; set; }
        public int T { get; set; }
        public int U { get; set; }
        public double V { get; set; }
        public double CTNN { get; set; }
        public double VR { get; set; }
        public double X { get; set; }
        public double Y { get; set; }
        public double CO { get; set; }
        public List<WorkBookSalaryController.Data> ListData { get; set; }
        public int Month { get; set; }
        public int Year { get; set; }

        public StaffTimeKeepingDetail()
        {

        }

        public StaffTimeKeepingDetail(int code, string name, string salaryLevel, double? salaryRatio, string departmentCode, string departmentName, double? d, double? e, List<WorkBookSalaryController.TimeWorkingShift> z, double f, double g, int h, int i, int j, int k, int l, int m, int n, int o, int p, int q, int r, int s, int aT, int t, int u, double v, double cTNN, double vR, double x, double y, double cO, List<WorkBookSalaryController.Data> listData, int month, int year)
        {
            Code = code;
            Name = name;
            SalaryLevel = salaryLevel;
            SalaryRatio = salaryRatio;
            DepartmentCode = departmentCode;
            DepartmentName = departmentName;
            D = d;
            E = e;
            Z = z;
            F = f;
            G = g;
            H = h;
            I = i;
            J = j;
            K = k;
            L = l;
            M = m;
            N = n;
            O = o;
            P = p;
            Q = q;
            R = r;
            S = s;
            AT = aT;
            T = t;
            U = u;
            V = v;
            CTNN = cTNN;
            VR = vR;
            X = x;
            Y = y;
            CO = cO;
            ListData = listData;
            Month = month;
            Year = year;
        }

        public override bool Equals(object obj)
        {
            return obj is StaffTimeKeepingDetail other &&
                   Code == other.Code &&
                   Name == other.Name &&
                   SalaryLevel == other.SalaryLevel &&
                   SalaryRatio == other.SalaryRatio &&
                   DepartmentCode == other.DepartmentCode &&
                   DepartmentName == other.DepartmentName &&
                   D == other.D &&
                   E == other.E &&
                   EqualityComparer<List<WorkBookSalaryController.TimeWorkingShift>>.Default.Equals(Z, other.Z) &&
                   F == other.F &&
                   G == other.G &&
                   H == other.H &&
                   I == other.I &&
                   J == other.J &&
                   K == other.K &&
                   L == other.L &&
                   M == other.M &&
                   N == other.N &&
                   O == other.O &&
                   P == other.P &&
                   Q == other.Q &&
                   R == other.R &&
                   S == other.S &&
                   AT == other.AT &&
                   T == other.T &&
                   U == other.U &&
                   V == other.V &&
                   CTNN == other.CTNN &&
                   VR == other.VR &&
                   X == other.X &&
                   Y == other.Y &&
                   CO == other.CO &&
                   EqualityComparer<List<WorkBookSalaryController.Data>>.Default.Equals(ListData, other.ListData) &&
                   Month == other.Month &&
                   Year == other.Year;
        }

        public override int GetHashCode()
        {
            HashCode hash = new HashCode();
            hash.Add(Code);
            hash.Add(Name);
            hash.Add(SalaryLevel);
            hash.Add(SalaryRatio);
            hash.Add(DepartmentCode);
            hash.Add(DepartmentName);
            hash.Add(D);
            hash.Add(E);
            hash.Add(Z);
            hash.Add(F);
            hash.Add(G);
            hash.Add(H);
            hash.Add(I);
            hash.Add(J);
            hash.Add(K);
            hash.Add(L);
            hash.Add(M);
            hash.Add(N);
            hash.Add(O);
            hash.Add(P);
            hash.Add(Q);
            hash.Add(R);
            hash.Add(S);
            hash.Add(AT);
            hash.Add(T);
            hash.Add(U);
            hash.Add(V);
            hash.Add(CTNN);
            hash.Add(VR);
            hash.Add(X);
            hash.Add(Y);
            hash.Add(CO);
            hash.Add(ListData);
            hash.Add(Month);
            hash.Add(Year);
            return hash.ToHashCode();
        }
    }
}