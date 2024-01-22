using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using Newtonsoft.Json;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Identity;
using MimeKit;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.AspNetCore.Hosting;
using System.IO;
using Microsoft.AspNetCore.Http;
using System.Globalization;
using ESEIM;
using Microsoft.Extensions.Options;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class RMRemoocController : BaseController
    {
        private readonly UserManager<AspNetUser> _userManager;
        private readonly RoleManager<AspNetRole> _roleManager;
        private readonly EIMDBContext _context;
        private readonly ILogger _logger;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly AppSettings _appSettings;

        private readonly string[] imageExt = { ".gif", ".jpeg", ".jpg", ".png", ".svg", ".blob" };
        string[] formats = { "dd/MM/yyyy", "d/MM/yyyy", "dd/M/yyyy", "dd/MM/yy", "d/MM/yy", "dd/M/yy" };
        public class JTableModelCustom : JTableModel
        {

            public string Code { get; set; }
            public string Title { get; set; }

        }

        public class JMessage2 : JMessage
        {
            public object Object2 { get; set; }
        }

        public RMRemoocController(EIMDBContext context, IOptions<AppSettings> appSettings, UserManager<AspNetUser> userManager, RoleManager<AspNetRole> roleManager, ILogger<RMRemoocController> logger, IHostingEnvironment hostingEnvironment)
        {
            _userManager = userManager;
            _context = context;
            _roleManager = roleManager;
            _logger = logger;
            _hostingEnvironment = hostingEnvironment;
            _appSettings = appSettings.Value;
        }

        public IActionResult Index()
        {
            ViewData["Message"] = "QUẢN LÝ BÃI ";
            return View("Index");
        }
        public IActionResult Bookinglast()
        {
            return View("Bookinglast");
        }
        public IActionResult Bookingall()
        {
            return View("Bookingall");
        }
        //API Remooc

        [HttpPost]
        public object GetAllRemooc()
        {
            var a = _context.RmRemoocRemoocs.OrderBy(x => x.LisencePlate).AsNoTracking().ToList();
            return Json(a);
        }

        [HttpPost]
        public object CheckStatusRemooc(string remooc_code)
        {
            var query = from a in _context.RmRemoocRemoocs
                        join b in _context.RmRemoocCurrentPositions on a.Code equals b.RemoocCode
                        select new
                        {
                            a.Id,
                            a.Code,
                            a.Origin,
                            a.Title,
                            b.PositionParking,
                            b.Status,
                            b.TractorCode,
                            b.TripCode,
                            b.PositionTime,
                            b.PositionText
                        };
            var result = query.OrderBy(x => x.PositionTime).Where(x => x.Code == remooc_code).ToList();
            return Json(result[0]);
        }

        [HttpPost]
        public object GetIdRemooc(int id)
        {
            var msg = new JMessage() { Error = false };
            var rm = _context.RmRemoocRemoocs.SingleOrDefault(x => x.Id == id);
            if (rm == null)
            {
                msg.ID = 0;
                msg.Title = "Product is not exists";
            }
            else
            {
                msg.Title = "Get product success";
                msg.Object = rm;
                msg.ID = 1;
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult InsertRemooc(RmRemoocRemooc obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                RmRemoocRemooc rm = new RmRemoocRemooc();
                rm.BarCode = obj.BarCode;

                rm.Code = obj.Code;
                rm.DateOfEntry = obj.DateOfEntry;
                rm.DateOfUse = obj.DateOfUse;
                rm.Extrafield = obj.Extrafield;
                rm.FlagDelete = obj.FlagDelete;
                rm.Generic = obj.Generic;

                rm.Origin = obj.Origin;
                rm.Title = obj.Title;
                _context.RmRemoocRemoocs.Add(rm);
                var a = _context.SaveChanges();
                msg.Title = "Thêm remooc thành công";
                msg.Object = rm;
                msg.ID = 1;

            }
            catch (Exception ex)
            {
                msg.ID = 0;
                msg.Error = true;
                msg.Object = ex;
                msg.Title = "Có lỗi khi thêm khoản mục";
            }
            return Json(msg);
        }

        [HttpPost]
        public object search_remooc(string code)
        {
            var msg = new JMessage() { Error = false };
            var rm = _context.RmRemoocRemoocs.Where(x => x.Code.Contains(code));
            if (rm == null)
            {
                msg.ID = 0;
                msg.Title = "Tractor is not exists";
            }
            else
            {
                msg.ID = 1;
                msg.Title = "Get tractor success";
                msg.Object = rm;
            }
            return Json(msg);
        }
        [HttpPost]
        public object GetAllParking()
        {
            var a = _context.RmRemoocPackings.OrderBy(x => x.Id).AsNoTracking().ToList();
            return Json(a);
        }
        [HttpPost]
        public object GetAllTractorActive()
        {
            var query = from a in  _context.RmRemoocTrackings
                        join b in _context.RmRemoocTractors on a.TractorCode equals b.Code
                        where b.Flag == 1
                        select new
                        {
                            Id = a.Id,
                            Trip_code = a.TripCode,
                            Tractor_code = a.TractorCode,
                            Remooc_code = a.RemoocCode,

                            Start_position_time = a.StartPositionTime,
                            Start_position_text = a.StartPositionText,
                            End_position_time = a.EndPositionTime,
                            End_position_text = a.EndPositionText,

                            Start_position_gps = a.StartPositionGPS,
                            End_position_gps = a.EndPositionGPS,
                            Driver_Id = a.DriveId,
                            Name = b.Name

                        };
            var result = query.OrderBy(x => x.Id).ToList();
            return Json(result);
        }
        //API Packing
        [HttpPost]
        public object GetAllPacking()
        {
            var company_code = HttpContext.GetSessionUser()?.CompanyCode;
            var a = _context.RmRemoocPackings.Where(x => x.CompanyCode == company_code).AsNoTracking().ToList();
            return Json(a);
        }
        [HttpPost]
        public object GetAllPacking_app()
        {
            var a = _context.RmRemoocPackings.OrderBy(x => x.Id).AsNoTracking().ToList();
            return Json(a);

        }
        [HttpPost]
        public async Task<JsonResult> InsertParking([FromBody]RmRemoocPacking obj)
        {
            var msg = new JMessage() { Error = false, ID = 1 };
            var company_code = HttpContext.GetSessionUser()?.CompanyCode;
            if (company_code != null && obj != null)
            {
                try
                {
                    var remoocParking = _context.RmRemoocPackings.Where(x => x.Title.Equals(obj.Title) && x.CompanyCode.Equals(obj.CompanyCode)).FirstOrDefault();
                    if (remoocParking == null)
                    {
                        obj.CreateDate = DateTime.Now;
                        obj.Flag = 1;

                        _context.RmRemoocPackings.Add(obj);
                        await _context.SaveChangesAsync();

                        msg.Title = "Thêm mới bãi xe thành công";
                        msg.Error = false;
                    }
                    else
                    {
                        msg.Title = "Bãi xe đã tồn tại";
                        msg.Error = true;
                    }

                }
                catch (Exception ex)
                {
                    msg.ID = 0;
                    msg.Error = true;
                    msg.Object = ex;
                    msg.Title = "Có lỗi khi thêm bãi xe";
                }
            }
            return Json(msg);
        }
        [HttpPost]
        public object GetParkingById(string title)
        {
            var msg = new JMessage() { Error = false };
            var rm = _context.RmRemoocPackings.FirstOrDefault(x => x.Title.ToLower().Trim().Contains(title.ToLower().Trim()));
            if (rm == null)
            {
                msg.ID = 0;
                msg.Title = "Không tồn tại bãi xe nào";
                msg.Error = true;
            }
            else
            {
                msg.ID = 1;
                msg.Title = "Get packing success";
                msg.Object = rm;
            }
            return Json(msg);
        }


        [HttpPost]
        public object GetIdPacking(int id)
        {
            var msg = new JMessage() { Error = false };
            var rm = _context.RmRemoocPackings.SingleOrDefault(x => x.Id == id);
            if (rm == null)
            {
                msg.ID = 0;
                msg.Title = "Không tồn tại bãi xe nào";
                msg.Error = true;
            }
            else
            {
                msg.ID = 1;
                msg.Title = "Get packing success";
                msg.Object = rm;
            }
            return Json(msg);
        }


        //API Tracking
        [HttpPost]
        public object GetAllTracking()
        {
            var a =  _context.RmRemoocTrackings.OrderBy(x => x.Id).AsNoTracking().ToList();
            return Json(a);

        }
        [HttpPost]
        public object GetAllDriver()
        {
            var a =  _context.RmRomoocDrivers.OrderBy(x => x.Id).Where(x => x.Active == 1).AsNoTracking().ToList();
            return Json(a);

        }

        [HttpPost]
        public object GetAllCustomer()
        {
            var a = _context.RmECompanys.OrderBy(x => x.Id).Where(x => x.Flag == 1).AsNoTracking().ToList();
            return Json(a);

        }
        [HttpPost]
        public object GetAllCurrentTractor()
        {
            var a = _context.RmRemoocTractors.OrderBy(x => x.LicensePlate).Where(x => x.Flag == 1).AsNoTracking().ToList();
            return Json(a);

        }
        public object GetAllTracking_app(string company_code)
        {
            var a =  _context.RmRemoocTrackings.Where(x => x.CompanyCode == company_code).OrderBy(x => x.Id).AsNoTracking().ToList();
            return Json(a);
        }
        public object GetTrackingActiveById(RmRemoocTracking obj)
        {
            var a =  _context.RmRemoocTrackings.Where(x => x.TripCode == obj.TripCode).OrderBy(x => x.Id).AsNoTracking().ToList();
            return Json(a);
        }
        public object GetTrackingById(TrackingResponse obj)

        {
            RomoocTrackingResponseNew result = new RomoocTrackingResponseNew();
            var romooc = (from b in _context.RmRemoocRemoocs
                            where b.Code == obj.Remooc_code
                            select new
                            {
                                License_Plate = b.LisencePlate != null ? b.LisencePlate : "",
                                Generic = b.Generic != null ? b.Generic : "",
                                Image = b.Image,
                                Group = b.Group == "NHOM_1" ? "Nhóm 1" : b.Group == "NHOM_2" ? "Nhóm 2" : b.Group == "NHOM_3" ? "Nhóm 3" : b.Group == "NHOM_4" ? "Nhóm 4" : b.Group == "NHOM_5" ? "Nhóm 5" : "",
                                Origin = b.Origin != null ? b.Origin : ""
                            }).FirstOrDefault();

            var query = from a in _context.RmRemoocRemoocs
                        join b in  _context.RmRemoocTrackings on a.LisencePlate.Trim() equals b.RemoocCode.Trim()
                        join c in  _context.RmRomoocDrivers on b.DriveId equals c.Id
                        where (string.IsNullOrEmpty(obj.Remooc_code) || a.LisencePlate.ToLower().Contains(obj.Remooc_code.Trim().ToLower()))
                        && (string.IsNullOrEmpty(obj.Start_position_time) || b.StartPositionTime.Value.Date >= DateTime.ParseExact(obj.Start_position_time, formats, new CultureInfo("en-US"), DateTimeStyles.None).Date)
                        && (string.IsNullOrEmpty(obj.End_position_time) || b.StartPositionTime.Value.Date <= DateTime.ParseExact(obj.End_position_time, formats, new CultureInfo("en-US"), DateTimeStyles.None).Date)
                        select new
                        {
                            Id = b.Id,
                            LisencePlate = a.LisencePlate,
                            Trip_code = b.TripCode != null ? b.TripCode : "",
                            Tractor_code = b.TractorCode != null ? b.TractorCode : "",
                            Start_position_text = b.StartPositionText != null ? b.StartPositionText : "__",
                            End_position_text = b.EndPositionText != null ? b.EndPositionText : "__",
                            Start_position_time = b.StartPositionTime != null ? b.StartPositionTime.Value.ToString("dd/MM/yyyy HH:mm") : "__",
                            End_position_time = b.EndPositionTime != null ? b.EndPositionTime.Value.ToString("dd/MM/yyyy HH:mm") : "__",
                            Driver_Id = b.DriveId.ToString() != null ? b.DriveId.ToString() : "",
                            Name = c.Name
                        };
            result.Romooc = romooc;
            result.TrackingRomooc = query.OrderByDescending(x=>x.Id);
            return Json(result);
        }

        public object searchDriverTractor(RmRemoocTracking obj)
        {
            var query = from a in  _context.RmRemoocTrackings
                        join b in  _context.RmRomoocDrivers on a.DriveId equals b.Id
                        select new
                        {

                            a.Id,
                            a.TripCode,
                            a.TractorCode,
                            a.RemoocCode,

                            a.StartPositionTime,
                            a.StartPositionText,
                            a.EndPositionTime,
                            a.EndPositionText,

                            a.DriveId,
                            b.Name,
                            b.Phone,
                            b.ProfilePicture,
                            b.CreatedDate

                        };
            if (obj.StartPositionTime == null && obj.EndPositionTime == null)
            {
                var result = query.Where(x => x.DriveId == obj.DriveId);
                return Json(result);
            }
            else if (obj.StartPositionTime != null && obj.EndPositionTime == null)
            {
                var result = query.Where(x => x.DriveId == obj.DriveId && obj.StartPositionTime <= x.StartPositionTime);
                return Json(result);
            }
            else if (obj.StartPositionTime == null && obj.EndPositionTime != null)
            {
                var result = query.Where(x => x.DriveId == obj.DriveId && obj.EndPositionTime >= x.EndPositionTime);
                return Json(result);
            }
            else
            {
                var result = query.Where(x => x.DriveId == obj.DriveId && obj.StartPositionTime <= x.StartPositionTime && obj.EndPositionTime >= x.EndPositionTime);
                return Json(result);
            }
        }
        public object searchDriverTractorNew(DriverTrackingSearch obj)
        {
            var user = (from a in  _context.RmRomoocDrivers
                        where a.Id == obj.Driver_Id
                        select new
                        {
                            a.Id,
                            a.Name,
                            a.Phone,
                            a.ProfilePicture,
                            Exp = ""
                        }).FirstOrDefault();
            //var d = DateTime.ParseExact(obj.Start_position_time, formats, new CultureInfo("vi-VN"), DateTimeStyles.None);
            var query = from a in  _context.RmRemoocTrackings
                        join b in  _context.RmRomoocDrivers on a.DriveId equals b.Id
                        where a.DriveId == obj.Driver_Id && (string.IsNullOrEmpty(obj.Start_position_time) || a.StartPositionTime.Value.Date >= DateTime.ParseExact(obj.Start_position_time, formats, new CultureInfo("vi-VN"), DateTimeStyles.None).Date)
                        && (string.IsNullOrEmpty(obj.End_position_time) || a.StartPositionTime.Value.Date <= DateTime.ParseExact(obj.End_position_time, formats, new CultureInfo("vi-VN"), DateTimeStyles.None).Date )
                        select new TrackingResponse
                        {
                            Id = a.Id,
                            Trip_code = a.TripCode,
                            Tractor_code = a.TractorCode != null ? a.TractorCode : "",
                            Remooc_code = a.RemoocCode != null ? a.RemoocCode : "",
                            Start_position_time = a.StartPositionTime != null ? a.StartPositionTime.Value.ToString("dd/MM/yyyy HH:mm") : "__",
                            Start_position_text = a.StartPositionText != null ? a.StartPositionText : "__",
                            End_position_time = a.EndPositionTime != null ? a.EndPositionTime.Value.ToString("dd/MM/yyyy HH:mm") : "__",
                            End_position_text = a.EndPositionText != null ? a.EndPositionText : "__",
                            CreatedDate = b.CreatedDate != null ? b.CreatedDate.Value.ToString("dd/MM/yyyy HH:mm") : "__",
                            Driver_Id = b.Id
                        };
            //if (obj.Start_position_time == null && obj.End_position_time == null)
            //{
            var result = query.Where(x => x.Driver_Id == obj.Driver_Id).OrderByDescending(x=>x.Id).ToList();
            DriverTrackingResponseNew data = new DriverTrackingResponseNew();
            data.User = user;
            data.DriverTracktor = result;
            return Json(data);
            //}
            //else if (obj.Start_position_time != null && obj.End_position_time == null)
            //{
            //    var result = query.Where(x => x.Driver_Id == obj.Driver_Id && obj.Start_position_time <= x.Start_position_time);
            //    return Json(result);
            //}
            //else if (obj.Start_position_time == null && obj.End_position_time != null)
            //{
            //    var result = query.Where(x => x.Driver_Id == obj.Driver_Id && obj.End_position_time >= x.End_position_time);
            //    return Json(result);
            //}
            //else
            //{
            //    var result = query.Where(x => x.Driver_Id == obj.Driver_Id && obj.Start_position_time <= x.Start_position_time && obj.End_position_time >= x.End_position_time);
            //    return Json(result);
            //}
        }
       
        public object GetPackingById(TrackingTractorResponse obj)
        {
            if (obj.Start_position_time == null && obj.End_position_time == null)
            {
                var a =  _context.RmRemoocTrackings.Where(x => x.EndPositionCode == obj.End_position_code || x.StartPositionCode == obj.End_position_code);
                List<TrackingTractorResponse> lst = new List<TrackingTractorResponse>(); 
                foreach (var item in a)
                {
                    TrackingTractorResponse dto = new TrackingTractorResponse();
                    dto.End_position_time = item.EndPositionTime != null ? item.EndPositionTime.Value.ToString("dd/MM/yyyy HH:mm") : "";
                    dto.Start_position_time = item.StartPositionTime != null ? item.StartPositionTime.Value.ToString("dd/MM/yyyy HH:mm") : "";
                    dto.Trip_code = item.TripCode != null ? item.TripCode : "";
                    dto.Tractor_code = item.TractorCode != null ? item.TractorCode : "";
                    dto.Start_position_text = item.StartPositionText != null ? item.StartPositionText : "__";
                    dto.End_position_text = item.EndPositionText != null ? item.EndPositionText : "__";
                    dto.Name =  _context.RmRomoocDrivers.FirstOrDefault(x=>x.Id == item.DriveId).Name;
                    dto.Remooc_code = item.RemoocCode;
                    lst.Add(dto);
                }
                return Json(lst);
            }
            else if (obj.Start_position_time != null && obj.End_position_time == null)
            {

                var a =  _context.RmRemoocTrackings.Where(x => x.StartPositionTime.Value.Date >= DateTime.ParseExact(obj.Start_position_time, formats, new CultureInfo("vi-VN"), DateTimeStyles.None).Date && (x.EndPositionCode == obj.End_position_code || x.StartPositionCode == obj.End_position_code));
                List<TrackingTractorResponse> lst = new List<TrackingTractorResponse>();
                foreach (var item in a)
                {
                    TrackingTractorResponse dto = new TrackingTractorResponse();
                    dto.End_position_time = item.EndPositionTime != null ? item.EndPositionTime.Value.ToString("dd/MM/yyyy HH:mm") : "__";
                    dto.Start_position_time = item.StartPositionTime != null ? item.StartPositionTime.Value.ToString("dd/MM/yyyy HH:mm") : "__";
                    dto.Trip_code = item.TripCode != null ? item.TripCode : "";
                    dto.Tractor_code = item.TractorCode != null ? item.TractorCode : "";
                    dto.Start_position_text = item.StartPositionText != null ? item.StartPositionText : "__";
                    dto.End_position_text = item.EndPositionText != null ? item.EndPositionText : "__";
                    dto.Driver_Id = item.DriveId; dto.Remooc_code = item.RemoocCode;
                    lst.Add(dto);
                }
                return Json(lst);
            }
            else if (obj.Start_position_time == null && obj.End_position_time != null)
            {
                var a =  _context.RmRemoocTrackings.Where(x => x.StartPositionTime.Value.Date <= DateTime.ParseExact(obj.End_position_time, formats, new CultureInfo("vi-VN"), DateTimeStyles.None).Date && (x.EndPositionCode == obj.End_position_code || x.StartPositionCode == obj.End_position_code));
                List<TrackingTractorResponse> lst = new List<TrackingTractorResponse>();
                foreach (var item in a)
                {
                    TrackingTractorResponse dto = new TrackingTractorResponse();
                    dto.End_position_time = item.EndPositionTime != null ? item.EndPositionTime.Value.ToString("dd/MM/yyyy HH:mm") : "__";
                    dto.Start_position_time = item.StartPositionTime != null ? item.StartPositionTime.Value.ToString("dd/MM/yyyy HH:mm") : "__";
                    dto.Trip_code = item.TripCode != null ? item.TripCode : "";
                    dto.Tractor_code = item.TractorCode != null ? item.TractorCode : "";
                    dto.Start_position_text = item.StartPositionText != null ? item.StartPositionText : "__";
                    dto.End_position_text = item.EndPositionText != null ? item.EndPositionText : "__";
                    dto.Driver_Id = item.DriveId; dto.Remooc_code = item.RemoocCode;
                    lst.Add(dto);
                }
                return Json(lst);
            }
            else
            {
                var a =  _context.RmRemoocTrackings.Where(x => x.StartPositionTime.Value.Date >= DateTime.ParseExact(obj.Start_position_time, formats, new CultureInfo("vi-VN"), DateTimeStyles.None).Date && DateTime.ParseExact(obj.End_position_time, formats, new CultureInfo("vi-VN"), DateTimeStyles.None).Date >= x.StartPositionTime.Value.Date && (x.EndPositionCode == obj.End_position_code || x.StartPositionCode == obj.End_position_code));
                List<TrackingTractorResponse> lst = new List<TrackingTractorResponse>();
                foreach (var item in a)
                {
                    TrackingTractorResponse dto = new TrackingTractorResponse();
                    dto.End_position_time = item.EndPositionTime != null ? item.EndPositionTime.Value.ToString("dd/MM/yyyy HH:mm") : "__";
                    dto.Start_position_time = item.StartPositionTime != null ? item.StartPositionTime.Value.ToString("dd/MM/yyyy HH:mm") : "__";
                    dto.Trip_code = item.TripCode != null ? item.TripCode : "";
                    dto.Tractor_code = item.TractorCode != null ? item.TractorCode : "";
                    dto.Start_position_text = item.StartPositionText != null ? item.StartPositionText : "__";
                    dto.End_position_text = item.EndPositionText != null ? item.EndPositionText : "__";
                    dto.Driver_Id = item.DriveId; dto.Remooc_code = item.RemoocCode;
                    lst.Add(dto);
                }
                return Json(lst);
            }
        }
        public object GetAllRomoocCurent()
        {
            var a = _context.RmRemoocCurrentPositions.OrderBy(x => x.Id).AsNoTracking().ToList();
            return Json(a);

        }

        public object delete_tracking(int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var a =  _context.RmRemoocTrackings.SingleOrDefault(x => x.Id == id);
                if (a != null)
                {
                     _context.RmRemoocTrackings.Remove(a);
                    _context.SaveChanges();
                    msg.ID = 1;
                    msg.Title = "Delete tracking success";
                    msg.Object = a;
                }
                else
                {
                    msg.ID = 0;
                    msg.Title = "Delete tracking ERROR";
                }
            }
            catch (Exception ex)
            {
                msg.Object = ex;
            }
            return Json(msg);
        }

        public object update_tracking(RmRemoocTracking rm)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var a =  _context.RmRemoocTrackings.SingleOrDefault(x => x.Id == rm.Id);
                if (a != null)
                {
                    //RmRemoocTracking rt = new RmRemoocTracking();
                    a.RemoocCode = rm.RemoocCode;
                    a.StartPositionText = rm.StartPositionText;
                    a.Note = rm.Note;
                     _context.RmRemoocTrackings.Update(a);
                    _context.SaveChanges();
                    msg.ID = 1;
                    msg.Title = "Update tracking success";
                    msg.Object = a;
                }
                else
                {
                    msg.ID = 0;
                    msg.Title = "update tracking ERROR";
                }
            }
            catch (Exception ex)
            {
                msg.Object = ex;
            }
            return Json(msg);
        }


        [HttpPost]
        public object GetIdTracking(int id)
        {
            var msg = new JMessage() { Error = false };
            var rm =  _context.RmRemoocTrackings.SingleOrDefault(x => x.Id == id);
            if (rm == null)
            {
                msg.Title = "Packing is not exists";
            }
            else
            {
                msg.Title = "Get packing success";
                msg.Object = rm;
            }
            return Json(msg);
        }

        [HttpPost]
        public object GetDriverTracking(int id_driver)
        {
            var msg = new JMessage() { Error = false };
            var rm =  _context.RmRemoocTrackings.Where(x => x.DriveId == id_driver);
            if (rm == null)
            {
                msg.ID = 0;
                msg.Title = "Tracking is not exists";
            }
            else
            {
                msg.Title = "Get packing success";
                msg.Object = rm;
                msg.ID = 1;
            }
            return Json(msg);
        }

        [HttpPost]
        public object GetAllRemoocCurrent()
        {
            //var msg = new JMessage() { Error = false };
            var query = from a in _context.RmRemoocCurrentPositions
                        join b in _context.RmRemoocRemoocs on a.RemoocCode equals b.Code
                        join c in _context.RmRomoocExtrafields on b.Extrafield equals c.Id

                        // where (jTablePara.UserName == "" || a.UserName.ToLower().Contains(jTablePara.UserName.ToLower()))
                        select new
                        {
                            c.FieldValue,
                            b.Image,
                            a.Id,
                            a.PositionGPS,
                            a.PositionParking,
                            a.PositionText,
                            a.PositionTime,
                            a.RemoocCode,
                            a.TractorCode,
                            a.TripCode,
                            a.Status
                        };
            var result = query.OrderBy(x => x.Id);
            return Json(result);
        }

        [HttpPost]
        public object JTable([FromBody]JTableModelCustom jTablePara)
        {

            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            //var company_code = HttpContext.GetSessionUser()?.CompanyCode;
            var query = from a in _context.RmRemoocRemoocs
                        where ((jTablePara.Code == "" || a.Code.ToLower().Contains(jTablePara.Code.ToLower())))
                        select new
                        {
                            Id = a.Id,
                            Code = a.Code,
                            Title = a.Title,
                            Barcode = a.BarCode,
                            Extrafield = a.Extrafield,
                            Image = a.Image,
                            LisencePlate = a.LisencePlate,
                            InternalCode = a.InternalCode

                        };

            var count = query.Count();
            var data = query
                .OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();


            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "Code", "Barcode", "Title", "Extrafield", "Image");
            return Json(jdata);
        }

        [HttpPost]
        public object InsertTracking(RmRemoocTracking obj)
        {
            var msg = new JMessage2() { Error = false };



            var remooc_codes = obj.RemoocCode.Split(',');
            var checkRight = 0;
            for (int i = 0; i < remooc_codes.Length; i++)
            {
                var check = _context.RmRemoocRemoocs.Where(x => x.Code == remooc_codes[i]);
                if (check == null)
                {
                    checkRight++;
                }

            }
            if (checkRight == 0)
            {
                RmRemoocTracking obj2 = obj;
                 _context.RmRemoocTrackings.Add(obj2);
                msg.Object = obj;
                _context.SaveChanges();
                obj2.TripCode = "TRC" + obj2.Id.ToString();
                 _context.RmRemoocTrackings.Update(obj2);
                _context.SaveChanges();
                for (int i = 0; i < remooc_codes.Length; i++)
                {
                    // kiem tra ma remooc
                    var check = _context.RmRemoocRemoocs.Where(x => x.Code == remooc_codes[i]);

                    if (check != null)
                    {

                        var current_pos = _context.RmRemoocCurrentPositions.FirstOrDefault(x => x.RemoocCode == remooc_codes[i]);

                        if (current_pos == null)
                        {
                            RmRemoocCurrentPosition cus = new RmRemoocCurrentPosition();
                            cus.RemoocCode = remooc_codes[i];
                            cus.TractorCode = obj.TractorCode;
                            cus.PositionTime = obj.StartPositionTime;
                            cus.PositionText = obj.StartPositionText;
                            cus.PositionGPS = obj.StartPositionGPS;
                            cus.PositionParking = obj.StartPositionCode;
                            cus.TripCode = obj.TripCode;
                            cus.Status = false;
                            msg.Title = "Thêm mới chuyến đi thành công";
                            msg.Object2 = cus;
                            msg.ID = 1;
                            _context.RmRemoocCurrentPositions.Add(cus);
                            _context.SaveChanges();


                        }
                        else
                        {

                            current_pos.TractorCode = obj.TractorCode;
                            current_pos.PositionTime = obj.StartPositionTime;
                            current_pos.PositionText = obj.StartPositionText;
                            current_pos.PositionGPS = obj.StartPositionGPS;
                            current_pos.PositionParking = obj.StartPositionCode;
                            current_pos.Status = false;
                            msg.ID = 1;
                            msg.Title = "Thêm mới chuyến đi thành công";
                            msg.Object2 = current_pos;
                            _context.RmRemoocCurrentPositions.Update(current_pos);
                            _context.SaveChanges();
                        }

                    }
                    else
                    {

                        msg.ID = 0;
                        msg.Title = "Mã Remooc " + remooc_codes[i] + " không tồn tại";
                    }

                }
            }
            else
            {
                msg.Title = "Mã Remooc không tồn tại";
            }
            return Json(msg);
        }

        public object UpdateTracking(RmRemoocTracking obj)
        {
            var msg = new JMessage2() { Error = false };
            var remooc_codes = obj.RemoocCode.Split(',');
            var checkRight = 0;
            for (int i = 0; i < remooc_codes.Length; i++)
            {
                var check = _context.RmRemoocRemoocs.Where(x => x.Code == remooc_codes[i]);
                if (check == null)
                {
                    checkRight++;
                }

            }
            if (checkRight == 0)
            {
                var check1 =  _context.RmRemoocTrackings.SingleOrDefault(x => x.TripCode == obj.TripCode);
                if (check1 != null)
                {
                    check1.DriveId = obj.DriveId;
                    check1.RemoocCode = obj.RemoocCode;
                    check1.TractorCode = obj.TractorCode;
                    check1.StartPositionTime = obj.StartPositionTime;

                    check1.Note = obj.Note;
                    check1.StartPositionText = obj.StartPositionText;
                    check1.StartPositionGPS = obj.StartPositionGPS;
                    check1.StartPositionCode = obj.StartPositionCode;

                    msg.Object2 = check1;
                    msg.ID = 1;
                    msg.Title = "Nhả chuyến đi thành công";

                     _context.RmRemoocTrackings.Update(check1);
                    _context.SaveChanges();


                    for (int i = 0; i < remooc_codes.Length; i++)
                    {
                        // kiem tra ma remooc
                        var check = _context.RmRemoocRemoocs.Where(x => x.Code == remooc_codes[i]);

                        if (check != null)
                        {

                            var current_pos = _context.RmRemoocCurrentPositions.FirstOrDefault(x => x.RemoocCode == remooc_codes[i]);

                            if (current_pos == null)
                            {
                                RmRemoocCurrentPosition cus = new RmRemoocCurrentPosition();
                                cus.RemoocCode = remooc_codes[i];
                                cus.TractorCode = obj.TractorCode;
                                cus.PositionTime = obj.StartPositionTime;
                                cus.PositionText = obj.StartPositionText;
                                cus.PositionGPS = obj.StartPositionGPS;
                                cus.PositionParking = obj.StartPositionCode;
                                cus.Status = false;
                                msg.Title = "Nhả chuyến đi thành công";
                                msg.Object2 = cus;
                                msg.ID = 1;
                                _context.RmRemoocCurrentPositions.Add(cus);
                                _context.SaveChanges();
                            }
                            else
                            {

                                current_pos.TractorCode = obj.TractorCode;
                                current_pos.PositionTime = obj.StartPositionTime;
                                current_pos.PositionText = obj.StartPositionText;
                                current_pos.PositionGPS = obj.StartPositionGPS;
                                current_pos.PositionParking = obj.StartPositionCode;
                                current_pos.Status = false;
                                msg.ID = 1;
                                msg.Title = "Update Current positon success";
                                msg.Object2 = current_pos;
                                _context.RmRemoocCurrentPositions.Update(current_pos);
                                _context.SaveChanges();
                            }

                        }
                        else
                        {

                            msg.ID = 0;
                            msg.Title = "Mã Remooc " + remooc_codes[i] + " không tồn tại";
                        }

                    }

                }

            }
            else
            {
                msg.Title = "Mã Remooc không tồn tại";
            }
            return Json(msg);
        }


        [HttpPost]
        public object InsertEndTracking(RmRemoocTracking obj)
        {
            var msg = new JMessage2() { Error = false };
            var check1 =  _context.RmRemoocTrackings.SingleOrDefault(x => x.TripCode == obj.TripCode);
            if (check1 != null)
            {
                check1.EndPositionTime = obj.EndPositionTime;
                check1.EndPositionText = obj.EndPositionText;
                check1.EndPositionGPS = obj.EndPositionGPS;
                check1.EndPositionCode = obj.EndPositionCode;
                check1.Note = obj.Note;

                msg.ID = 1;
                msg.Title = "Update end Current positon success";

                 _context.RmRemoocTrackings.Update(check1);
                _context.SaveChanges();




                var remooc_codes = obj.RemoocCode.Split(',');
                for (int i = 0; i < remooc_codes.Length; i++)
                {
                    var check = _context.RmRemoocRemoocs.SingleOrDefault(x => x.Code == remooc_codes[i]);
                    if (check != null)
                    {
                        var current_pos = _context.RmRemoocCurrentPositions.SingleOrDefault(x => x.RemoocCode == remooc_codes[i]);
                        if (current_pos == null)
                        {
                            RmRemoocCurrentPosition cus = new RmRemoocCurrentPosition();
                            cus.RemoocCode = remooc_codes[i];
                            cus.TractorCode = obj.TractorCode;
                            cus.PositionTime = obj.EndPositionTime;
                            cus.PositionText = obj.EndPositionText;
                            cus.PositionGPS = obj.EndPositionGPS;
                            cus.PositionParking = obj.EndPositionCode;
                            msg.ID = 1;
                            msg.Title = "insert end Current positon success";
                            msg.Object2 = cus;
                            _context.RmRemoocCurrentPositions.Add(cus);
                            _context.SaveChanges();
                        }
                        else
                        {
                            current_pos.TractorCode = obj.TractorCode;
                            current_pos.PositionTime = obj.EndPositionTime;
                            current_pos.PositionText = obj.EndPositionText;
                            current_pos.PositionGPS = obj.EndPositionGPS;
                            current_pos.PositionParking = obj.EndPositionCode;
                            current_pos.Status = true;
                            msg.ID = 1;
                            msg.Title = "Update end Current positon success";
                            msg.Object2 = current_pos;
                            _context.RmRemoocCurrentPositions.Update(current_pos);
                            _context.SaveChanges();
                        }
                    }
                    else
                    {
                        msg.ID = 0;
                        msg.Title = "Mã Remooc " + remooc_codes[i] + " không tồn tại";
                    }


                }

            }


            return Json(msg);
        }


        // API Tractor
        [HttpPost]
        public object search_tractor(string tractor_code)
        {
            var msg = new JMessage() { Error = false };
            var rm = _context.RmRemoocTractors.Where(x => x.Code.Contains(tractor_code));
            if (rm == null)
            {
                msg.ID = 0;
                msg.Title = "Tractor is not exists";
            }
            else
            {
                msg.ID = 1;
                msg.Title = "Get tractor success";
                msg.Object = rm;
            }
            return Json(msg);
        }


        [HttpPost]
        public object searchTrackingTractor(RmRemoocTracking obj)
        {

            var query = from a in  _context.RmRemoocTrackings
                        join b in _context.RmRemoocTractors on a.TractorCode equals b.Code
                        where a.TractorCode == obj.TractorCode
                        select new TrackingTractorResponse
                        {
                            Id=a.Id,
                            Trip_code=a.TripCode,
                            Tractor_code=a.TractorCode,
                            Remooc_code=a.RemoocCode,
                            Start_position_code=a.StartPositionCode,
                            Start_position_time=a.StartPositionTime!= null?a.StartPositionTime.Value.ToString("dd/MM/yyyy HH:mm"): "__",
                            Start_position_text= a.StartPositionText!=null? a.StartPositionText : "__",
                            End_position_time=a.EndPositionTime!=null? a.EndPositionTime.Value.ToString("dd/MM/yyyy HH:mm") : "__",
                            End_position_text =a.EndPositionText != null ? a.EndPositionText : "__",
                            End_position_code=a.EndPositionCode,
                            Driver_Id=a.DriveId,
                            Generic=b.Generic,
                            Image=b.Image,
                            Group=b.Group,
                            Name=b.Name,
                            Origin=b.Origin
                        };
            //if (obj.Start_position_time == null && obj.End_position_time == null)
            //{
                var result = query.Where(x => x.Tractor_code == obj.TractorCode).ToList();
                return Json(result);
           // }
            //else if (obj.Start_position_time != null && obj.End_position_time == null)
            //{
            //    var result = query.Where(x => x.Tractor_code == obj.Tractor_code && obj.Start_position_time <= x.Start_position_time);
            //    return Json(result);
            //}
            //else if (obj.Start_position_time == null && obj.End_position_time != null)
            //{
            //    var result = query.Where(x => x.Tractor_code == obj.Tractor_code && obj.End_position_time >= x.End_position_time);
            //    return Json(result);
            //}
            //else
            //{
            //    var result = query.Where(x => x.Tractor_code == obj.Tractor_code && obj.Start_position_time <= x.Start_position_time && obj.End_position_time >= x.End_position_time);
            //    return Json(result);
            //}
        }

        [HttpPost]
        public object searchTrackingTractorNew(TrackingTractorSearch obj)
        {
            TracktorTrackingResponseNew data = new TracktorTrackingResponseNew();
            var tracktor = (from b in _context.RmRemoocTractors
                            where b.Code == obj.TracktorCode
                            select new
                            {
                                License_Plate = b.LicensePlate != null ? b.LicensePlate : "",
                                Generic = b.Generic != null ? b.Generic : "",
                                Image = b.Image,
                                Group = b.Group == "NHOM_1" ? "Nhóm 1" : b.Group == "NHOM_2" ? "Nhóm 2" : b.Group == "NHOM_3" ? "Nhóm 3" : b.Group == "NHOM_4" ? "Nhóm 4": b.Group == "NHOM_5" ? "Nhóm 5":"",
                                Name = b.Name !=null ? b.Name : "",
                                Origin = b.Origin != null ? b.Origin : ""
                            }).FirstOrDefault();
          
            var query = from a in  _context.RmRemoocTrackings
                        join b in _context.RmRemoocTractors on a.TractorCode.Trim() equals b.Code.Trim()
                        join c in  _context.RmRomoocDrivers on a.DriveId equals c.Id
                        where a.TractorCode.Trim() == obj.TracktorCode.Trim()
                        && (string.IsNullOrEmpty(obj.Start_position_time) || a.StartPositionTime.Value.Date >= DateTime.ParseExact(obj.Start_position_time, formats, new CultureInfo("vi-VN"), DateTimeStyles.None).Date)
                        && (string.IsNullOrEmpty(obj.End_position_time) || a.StartPositionTime.Value.Date <= DateTime.ParseExact(obj.End_position_time, formats, new CultureInfo("vi-VN"), DateTimeStyles.None).Date)
                        select new TrackingTractorResponse
                        {
                            Id = a.Id,
                            Trip_code = a.TripCode,
                            Tractor_code = a.TractorCode,
                            Remooc_code = a.RemoocCode,
                            Start_position_code = a.StartPositionCode!= null?a.StartPositionCode : "",
                            Start_position_time = a.StartPositionTime != null ? a.StartPositionTime.Value.ToString("dd/MM/yyyy HH:mm") : "__",
                            Start_position_text = a.StartPositionText != null ? a.StartPositionText : "__",
                            End_position_time = a.EndPositionTime != null ? a.EndPositionTime.Value.ToString("dd/MM/yyyy HH:mm") : "__",
                            End_position_text = a.EndPositionText!=null? a.EndPositionText : "__",
                            End_position_code = a.EndPositionCode != null ? a.EndPositionCode : "",
                            Driver_Id = a.DriveId,
                            Name = c.Name,
                            Generic = b.Generic,
                            Image = b.Image,
                            Group = b.Group,
                          
                            Origin = b.Origin
                        };
            //if (obj.Start_position_time == null && obj.End_position_time == null)
            //{
            var result = query.OrderByDescending(x=>x.Id).ToList();
            data.Tracktor = tracktor;
            data.TrackingTracktor = result;
            return Json(data);
           
        }


        [HttpPost]
        public object GetTractorId(int id)
        {
            var msg = new JMessage() { Error = false };

            var query = from a in _context.RmRemoocTractors
                        join b in  _context.RmRomoocDrivers on a.DriverId equals b.Id
                        select new
                        {
                            a.Id,
                            Id_Driver = b.Id,
                            UserName = b.Name,
                            Phone = b.Phone,
                            Email = b.Email,
                            a.Name,
                            a.Code,
                            a.Origin,
                            a.Flag,
                            a.CreateDate
                        };


            var rm = query.Where(x => x.Id == id);
            if (rm == null)
            {
                msg.ID = 0;
                msg.Title = "Tractor is not exists";
            }
            else
            {
                msg.ID = 1;
                msg.Title = "Get tractor success";
                msg.Object = rm;
            }
            return Json(msg);
        }

        [HttpPost]
        public object GetAllTractor()
        {
            var company_code = HttpContext.GetSessionUser()?.CompanyCode;
            var query = from a in _context.RmRemoocTractors
                        where (a.CompanyCode == company_code)
                        // join b in _context.Remooc_Drivers on a.Driver_Id equals b.Id
                        select new
                        {
                            a.Id,
                            a.Name,
                            a.Code,
                            a.Origin,
                            a.Flag,
                            a.CreateDate
                        };

            var rs = query.OrderBy(x => x.Id).AsNoTracking().ToList();
            return Json(rs);
        }

        [HttpPost]
        public object GetAllTractorx(string company_code)
        {

            var query = from a in _context.RmRemoocTractors
                        select new
                        {
                            a.Id,
                            a.Name,
                            a.CompanyCode,
                            a.Code,
                            a.Origin,
                            a.Flag,
                            a.CreateDate
                        };

            var rs = query.Where(x => x.CompanyCode == company_code).OrderBy(x => x.Id).AsNoTracking().ToList();
            return Json(rs);
        }


        //[HttpPost]
        //public object GetAllTractorx()
        //{

        //    var query = from a in _context..RmRemoocTractors
        //                select new
        //                {
        //                    a.Id,
        //                    a.Name,
        //                    a.Company_Code,
        //                    a.Code,
        //                    a.Origin,
        //                    a.Flag,
        //                    a.CreateDate
        //                };

        //    var rs = query.OrderBy(x => x.Id).AsNoTracking().ToList();
        //    return Json(rs);
        //}


        [HttpPost]
        public object GetHistoryTractor(string tractor_code)
        {
            var a =  _context.RmRemoocTrackings.OrderBy(x => new { x.StartPositionTime, x.EndPositionTime }).Where(x => x.TractorCode == tractor_code);
            return Json(a);

        }


        // End API temp

        [HttpPost]
        public object GetUser()
        {
            var a =  _context.RmRomoocDrivers.OrderBy(x => x.Name).AsNoTracking().ToList();
            return Json(a);

        }


        //FromBody
        [HttpPost]
        public async Task<JsonResult> Insert([FromBody]RmRemoocRemooc obj)
        {
            _logger.LogInformation(LoggingEvents.LogDb, "Insert romooc");

            var msg = new JMessage() { Error = false };

            try
            {
                var company_code = HttpContext.GetSessionUser()?.CompanyCode;
                var us = await _context.RmRemoocRemoocs.SingleOrDefaultAsync(x => x.Code == obj.Code);
                if (us == null)
                {
                    RmRemoocRemooc objtemp = new RmRemoocRemooc()
                    {
                        Code = obj.Code,
                        Title = obj.Title,
                        Extrafield = obj.Extrafield,
                        BarCode = obj.BarCode,
                        DateOfEntry = obj.DateOfEntry,
                        DateOfUse = obj.DateOfUse,
                        Generic = obj.Generic,
                        Image = obj.Image,
                        Origin = obj.Origin,
                        CreateDate = DateTime.Now,
                        CompanyCode = company_code

                    };

                    _context.RmRemoocRemoocs.Add(objtemp);
                    //var x = await _userManager.CreateAsync(objtemp, obj.Password);
                    var a = _context.SaveChanges();
                    msg.Title = String.Format(CommonUtil.ResourceValue("MSG_ADD_SUCCESS"), CommonUtil.ResourceValue("USER").ToLower());
                    _logger.LogInformation(LoggingEvents.LogDb, "Insert remooc successfully");
                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(CommonUtil.ResourceValue("MSG_ADD_FAIL"), CommonUtil.ResourceValue("USER_USERNAME").ToLower());
                _logger.LogError(LoggingEvents.LogDb, "Insert user fail");
            }
            return Json(msg);
        }


        [HttpPost]
        public List<RmRomoocExtrafield> GetAllType()
        {


            var data = _context.RmRomoocExtrafields.AsNoTracking().OrderBy(x => x.Id).Where(x => x.FieldType == "Romooc");
            var dataOrder = data.ToList();
            return dataOrder;
        }


        [HttpGet]
        public object GetItem(int id)
        {
            try
            {
                //var user = _roleManager.Users.Single(x => x.Id == obj.Id /*&& x.ConcurrencyStamp == obj.ConcurrencyStamp*/);
                //user.AspNetUserRoles = _context.UserRoles.Where(x => x.UserId == user.Id).ToList();
                var company_code = HttpContext.GetSessionUser()?.CompanyCode;
                var user = _context.RmRemoocRemoocs.Single(x => x.Id == id && x.CompanyCode == company_code);

                var temp = new
                {
                    user.Id,
                    user.Code,
                    user.Title,
                    user.Image
                };

                return Json(temp);
            }
            catch (Exception ex)
            {
                return Json(new JMessage() { Error = true, Title = String.Format(CommonUtil.ResourceValue("MSG_LOAD_FAIL"), CommonUtil.ResourceValue("USER_USERNAME").ToLower()), Object = ex });
            }
        }

        [HttpGet]
        public object GetItemDetail(int id)
        {
            try
            {
                //var user = _roleManager.Users.Single(x => x.Id == obj.Id /*&& x.ConcurrencyStamp == obj.ConcurrencyStamp*/);
                //user.AspNetUserRoles = _context.UserRoles.Where(x => x.UserId == user.Id).ToList();
                var company_code = HttpContext.GetSessionUser()?.CompanyCode;
                var user = _context.RmRemoocRemoocs.Single(x => x.Id == id && x.CompanyCode == company_code);
                var exf = _context.RmRomoocExtrafields.Single(x => x.Id == user.Extrafield);
                if (exf != null)
                {
                    string jsons = JsonConvert.SerializeObject(exf);
                }
                var temp = new
                {
                    user.Id,
                    user.Code,
                    user.Title,
                    user.Image,
                    user.BarCode,
                    user.DateOfEntry,
                    user.DateOfUse,
                    user.Origin,
                    user.Generic,
                    user.CreateDate,
                    exf.FieldValue
                };
                return Json(temp);
            }
            catch (Exception ex)
            {
                return Json(new JMessage() { Error = true, Title = String.Format(CommonUtil.ResourceValue("MSG_LOAD_FAIL"), CommonUtil.ResourceValue("USER_USERNAME").ToLower()), Object = ex });
            }
        }

        [HttpPost]
        public async Task<JsonResult> Update([FromBody]RmRemoocRemooc obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var company_code = HttpContext.GetSessionUser()?.CompanyCode;
                _logger.LogInformation(LoggingEvents.LogDb, "Update user");
                var us = await _context.RmRemoocRemoocs.FirstOrDefaultAsync(x => x.Id == obj.Id);
                if (us != null)
                {
                    us.Title = obj.Title;
                    us.Code = obj.Code;
                    us.Extrafield = obj.Extrafield;
                    us.BarCode = obj.BarCode;
                    us.DateOfEntry = obj.DateOfEntry;
                    us.Origin = obj.Origin;
                    us.DateOfUse = obj.DateOfUse;
                    us.Generic = obj.Generic;
                    us.Image = obj.Image;
                    us.CompanyCode = company_code;

                    _context.RmRemoocRemoocs.Update(us);
                    _context.Entry(us).State = EntityState.Modified;
                    var a = _context.SaveChanges();
                    msg.Title = String.Format(CommonUtil.ResourceValue("MSG_UPDATE_SUCCESS"), CommonUtil.ResourceValue("USER").ToLower());
                    _logger.LogInformation(LoggingEvents.LogDb, "Update remooc successfully");
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("NOT_EXIST_ITEM"), CommonUtil.ResourceValue("USER").ToLower());
                    _logger.LogError(LoggingEvents.LogDb, "Update remooc fail");
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(CommonUtil.ResourceValue("MSG_UPDATE_FAIL"), CommonUtil.ResourceValue("USER").ToLower());
                _logger.LogError(LoggingEvents.LogDb, "Update remooc fail");
            }
            return Json(msg);
        }



        //Driver API
        // Register
        [HttpPost]
        public async Task<JsonResult> Register(RmRomoocDriver obj)
        {
            _logger.LogInformation(LoggingEvents.LogDb, "register user");
            var msg = new JMessage() { Error = false };
            try
            {
                var us = await  _context.RmRomoocDrivers.SingleOrDefaultAsync(x => x.Phone == obj.Phone || x.Email == obj.Email);
                if (us != null)
                {
                    msg.Title = "Login exists";
                    msg.ID = 0;
                    //msg.Object = us;
                    //_logger.LogInformation(LoggingEvents.LogDb, "login user successfully");
                }
                else
                {
                    var us2 = await _context.RmECompanys.SingleOrDefaultAsync(x => x.CompanyCode == obj.CompanyCode);
                    if (us2 == null)
                    {
                        msg.Title = "Company already exists";
                        msg.ID = 10;
                    }
                    else
                    {
                        var cus = new RmRomoocDriver();
                        cus.Name = obj.Name;
                        cus.Username = obj.Username;
                        cus.Password = obj.Password;
                        cus.ProfilePicture = obj.ProfilePicture;
                        cus.Email = obj.Email;
                        cus.Phone = obj.Phone;
                        cus.IdFb = obj.IdFb;
                        cus.CompanyCode = obj.CompanyCode;
                        cus.Active = 1;
                        cus.Emei = obj.Emei;
                        cus.CreatedDate = DateTime.Now;
                         _context.RmRomoocDrivers.Add(cus);
                        _context.SaveChanges();
                        msg.Object = cus;
                        msg.Title = "Register Success";
                        msg.ID = 1;
                    }

                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = "Login error";
                _logger.LogError(LoggingEvents.LogDb, "login user fail");
            }
            return Json(msg);
        }


        // Login
        [HttpPost]
        public async Task<JsonResult> login(string phone, string password, string company_code)
        {
            //  _logger.LogInformation(LoggingEvents.LogDb, "login user");

            var msg = new JMessage() { Error = false };

            try
            {
                var us = await  _context.RmRomoocDrivers.SingleOrDefaultAsync(x => x.Phone == phone && x.Password == password);
                if (us != null)
                {
                    if (us.CompanyCode == company_code)
                    {
                        msg.Title = "Login Success";
                        msg.Object = us;
                        msg.ID = 1;
                        _logger.LogInformation(LoggingEvents.LogDb, "login user successfully");
                    }
                    else
                    {
                        msg.ID = 2;
                        msg.Title = "Mã Công ty không đúng";
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Object = ex;
                //msg.Title = "Login error";
                _logger.LogError(LoggingEvents.LogDb, "login user fail");
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult check_fb(string id_fb)
        {
            //  _logger.LogInformation(LoggingEvents.LogDb, "register user social");
            var msg = new JMessage() { Error = false };
            try
            {
                var us =  _context.RmRomoocDrivers.SingleOrDefault(x => x.IdFb == id_fb);
                if (us == null)
                {
                    msg.ID = 1;
                    msg.Title = "FB chua login";
                }
                else
                {
                    if (us.Phone == "")
                    {
                        msg.Title = "Phone is not exists";
                        msg.ID = 3;
                    }
                    else
                    {
                        msg.ID = 2;
                        msg.Title = "Login sucess";
                        msg.Object = us;
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.ID = 0;
                msg.Title = "Login error";
                //_logger.LogError(LoggingEvents.LogDb, "login user fail");
            }
            return Json(msg);
        }




        //FromBody -- insert new booking
        [HttpPost]
        public JsonResult InsertToken(RmRemoocFcm obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var fcm = _context.RmRemoocFcms.SingleOrDefault(x => x.Token == obj.Token && x.UserId == obj.UserId);
                if (fcm == null)
                {
                    RmRemoocFcm cus = new RmRemoocFcm();
                    cus.UserId = obj.UserId;
                    cus.Token = obj.Token;
                    _context.RmRemoocFcms.Add(cus);
                    _context.SaveChanges();
                    msg.Title = "Add new Token success";
                    msg.Object = obj;
                }
                else
                {
                    msg.Title = "Error";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = "Có lỗi khi thêm khoản mục";
            }
            return Json(msg);
        }


        //update social
        [HttpPost]
        public async Task<JsonResult> update_profile(RmRomoocDriver obj)
        {
            _logger.LogInformation(LoggingEvents.LogDb, "update profile user ");

            var msg = new JMessage() { Error = false };
            try
            {
                var us = await  _context.RmRomoocDrivers.SingleOrDefaultAsync(x => x.Id == obj.Id);
                if (us == null)
                {
                    msg.Title = "User is not exists";
                    msg.Object = us;
                }
                else
                {
                    us.Name = obj.Name;
                    us.UpdatedDate = DateTime.Now;
                     _context.RmRomoocDrivers.Update(us);
                    _context.SaveChanges();
                    msg.Title = "update profile success";
                    msg.Object = us;
                    _logger.LogInformation(LoggingEvents.LogDb, "Update user  successfully");
                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = "Login error";
                //_logger.LogError(LoggingEvents.LogDb, "login user fail");
            }
            return Json(msg);
        }
        // API change password
        [HttpPost]
        public async Task<JsonResult> changePass(RmRomoocDriver obj)
        {
            _logger.LogInformation(LoggingEvents.LogDb, "update profile user ");

            var msg = new JMessage() { Error = false };
            try
            {
                var us = await  _context.RmRomoocDrivers.SingleOrDefaultAsync(x => x.Id == obj.Id);
                if (us == null)
                {
                    msg.Title = "User is not exists";
                    msg.Object = us;
                }
                else
                {
                    us.Password = obj.Password;
                    us.UpdatedDate = DateTime.Now;
                     _context.RmRomoocDrivers.Update(us);
                    _context.SaveChanges();
                    msg.Title = "update password success";
                    msg.Object = us;
                    _logger.LogInformation(LoggingEvents.LogDb, "Update user  successfully");
                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
            }
            return Json(msg);
        }
        // API kiem tra so dien thoai
        [HttpPost]
        public object isCheckPhone(string phone)
        {
            var msg = new JMessage() { Error = false };

            var a =  _context.RmRomoocDrivers.SingleOrDefault(x => x.Phone == phone);
            msg.ID = 0;
            if (a == null)
            {
                msg.Title = "Phone is not exists";
                msg.ID = 1;
            }
            else
            {
                msg.Title = "Phone is exists";
                msg.ID = 0;
            }
            return Json(msg);
        }

        // API check staus romooc
        [HttpPost]
        public async Task<object> isCheckRemooc2(string remooc_code)
        {
            var msg = new JMessage() { Error = false };

            var query1 = await _context.RmRemoocRemoocs.SingleOrDefaultAsync(x => x.Code == remooc_code);
            if (query1 != null)
            {
                var query = from a in _context.RmRemoocRemoocs
                            join b in _context.RmRemoocCurrentPositions on a.Code equals b.RemoocCode
                            select new
                            {
                                b.Status,
                                b.TractorCode,
                                b.RemoocCode,
                            };
                var result = query.SingleOrDefault(x => x.RemoocCode == remooc_code && x.Status == false);
                if (result != null)
                {
                    msg.Object = result;
                    msg.ID = 1;
                }
                else
                {
                    msg.ID = 2;
                    msg.Title = "Remooc chưa bị kéo";
                    msg.Object = query1.Container;
                }
            }
            else
            {
                msg.Object = null;
                msg.ID = 3;
                msg.Title = "Remooc " + remooc_code + " không tồn tại";
            }

            return Json(msg);
        }
        [HttpPost]
        public JsonResult isOnline(int id_user, int type)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var obj1 =  _context.RmRomoocDrivers.SingleOrDefault(x => x.Id == id_user);
                if (obj1 == null)
                {
                    msg.Error = true;
                    msg.ID = 0;
                    msg.Title = "user khong ton tai ";
                }
                else
                {
                    obj1.IsOnline = type;
                     _context.RmRomoocDrivers.Update(obj1);

                    //_context.Entry(obj1).State = EntityState.Modified;

                    _context.SaveChanges();
                    msg.Title = "update thanh cong";
                    msg.Object = obj1;
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = "update that bai";
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult ForgotPassWord(string email)
        {
            JMessage message = new JMessage { Error = false };
            try
            {
                var user =  _context.RmRomoocDrivers.FirstOrDefault(x => x.Email == email);
                if (user != null)
                {
                    string FromAddress = "vayxe@3i.com.vn";
                    string FromAdressTitle = "Remooc system";
                    //To Address 
                    string ToAddress = email;
                    string ToAdressTitle = email;
                    string Subject = "Forgot password";
                    //Smtp Server 
                    string SmtpServer = "mail.3i.com.vn";
                    //Smtp Port Number 
                    int SmtpPortNumber = 587;
                    var mimeMessage = new MimeMessage();
                    mimeMessage.From.Add(new MailboxAddress(FromAdressTitle, FromAddress));
                    mimeMessage.To.Add(new MailboxAddress(ToAdressTitle, ToAddress));
                    mimeMessage.Subject = Subject;
                    //mimeMessage.Body = new TextPart("plain");
                    BodyBuilder bodyBuilder = new BodyBuilder();
                    string link = _appSettings.Host + "Remooc/ChangePassword/?Email=" + email;
                    bodyBuilder.HtmlBody = "<a href='" + link + "'>Đổi mật khẩu</a>";
                    mimeMessage.Body = bodyBuilder.ToMessageBody();
                    using (var client = new SmtpClient())
                    {
                        client.ServerCertificateValidationCallback = (s, c, h, e) => true;
                        client.Connect(SmtpServer, SmtpPortNumber, SecureSocketOptions.Auto);
                        // Note: only needed if the SMTP server requires authentication 
                        // Error 5.5.1 Authentication  
                        client.Authenticate("vayxe@3i.com.vn", "Giacngo79");
                        client.Send(mimeMessage);
                        client.Disconnect(true);
                        message.Error = false;
                        message.ID = 1;
                        message.Title = "SENDED";
                    }
                }
                else
                {
                    message.ID = 0;
                    message.Error = true;
                    message.Title = "EMAIL_NOT_EXIT";
                    //1 la email khong ton tai
                }
            }
            catch (Exception ex)
            {
                message.ID = 0;
                message.Error = true;
                message.Title = "";
                message.Object = ex.Message;
            }
            return Json(message);
        }
        [HttpPost]
        public async Task<JsonResult> CheckOnline(int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var query = await  _context.RmRomoocDrivers.SingleOrDefaultAsync(x => x.Id == id);
                if (query != null)
                {
                    if (query.IsOnline == 1)
                    {
                        msg.Title = "Online";
                        msg.ID = 1;
                    }
                    else
                    {
                        msg.ID = 0;
                        msg.Title = "offline";
                        query.IsOnline = 1;
                         _context.RmRomoocDrivers.Update(query);
                        _context.SaveChanges();
                    }
                }
                else
                {
                    msg.Title = "ID ko ton tai";
                    msg.ID = 10000;
                }
            }
            catch
            {
                msg.Title = "error";
                msg.ID = 10;
            }
            return Json(msg);
        }
        [HttpPost]
        public object GetParkingByRomoocCode(string romooc_code)
        {
            var a = _context.RmRemoocCurrentPositions.SingleOrDefaultAsync(x => x.RemoocCode == romooc_code);
            return Json(a);

        }
        [HttpPost]
        public object orderTruck(int idUser)
        {
            //var msg = new JMessage() { Error = false };

            var query = from a in _context.RmCommandOrderTrucks
                        join b in  _context.RmRomoocDrivers on a.TenTaiXe equals b.Name
                        where (b.Id == idUser)

                        // where (jTablePara.UserName == "" || a.UserName.ToLower().Contains(jTablePara.UserName.ToLower()))
                        select new
                        {
                            id = a.Id,
                            matheodoi = a.MaTheoDoi,
                            ngaydieuxe = a.NgayDieuXe,
                            tentaixe = a.TenTaiXe,
                            sodaukeo = a.SoXe,
                            somooc = a.SoMooc,
                            tenkh = a.KhachHang,
                            diachikh = a.DiaChi,
                            noixuatphat = a.NoiXuatPhat,
                            noilay = a.NoiLay,
                            noiha = a.NoiHa,
                            macont = a.SoCont,
                            payment = a.Payment,
                            solenh = a.SoLenh,
                            hang = a.Hang,
                            ghichu = a.GhiChu,
                            ngaygiodi = a.NgayGioDi,
                            ngaygioden = a.NgayGioDen,
                            neomoc = a.NeoMooc,

                        };
            var result = query.OrderBy(x => x.id);
            return Json(result);
        }
        [HttpPost]
        public async Task<string> Upload(IFormFile file)
        {
            try
            {

                // Upload avatar
                if (file != null)
                {
                    if (file.Length > 0)
                    {
                        string extension = Path.GetExtension(file.FileName);
                        if (Array.IndexOf(imageExt, extension) >= 0)
                        {
                            var rootPath = $"{_hostingEnvironment.WebRootPath}\\uploads\\images";
                            string imageName = string.Format("{0}", file.FileName, DateTime.Now, Path.GetExtension(file.FileName));
                            string imgPath = Path.Combine(rootPath, imageName);
                            try
                            {
                                using (var fileStream = new FileStream(imgPath, FileMode.Create))
                                {
                                    await file.CopyToAsync(fileStream);
                                    return $"/uploads/images/{imageName}";
                                }
                            }
                            catch (Exception e)
                            {

                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {

            }
            return "";
        }
        [HttpPost]
        public async Task<JsonResult> updateAvatar(RmRomoocDriver obj)
        {
            _logger.LogInformation(LoggingEvents.LogDb, "update profile user ");

            var msg = new JMessage() { Error = false };
            try
            {
                var us = await  _context.RmRomoocDrivers.SingleOrDefaultAsync(x => x.Id == obj.Id);
                if (us == null)
                {
                    msg.Title = "User is not exists";
                    msg.Object = us;
                }
                else
                {
                    us.ProfilePicture = obj.ProfilePicture;
                    us.UpdatedDate = DateTime.Now;
                     _context.RmRomoocDrivers.Update(us);
                    _context.SaveChanges();
                    msg.Title = "update avatar success";
                    msg.Object = us;
                    _logger.LogInformation(LoggingEvents.LogDb, "Update user successfully");
                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
            }
            return Json(msg);
        }
        [HttpGet]
        public void ChangePassword(string email)
        {
            try
            {
                string new_pass = CommonUtil.GenerateOTP(6, true);
                var user =  _context.RmRomoocDrivers.FirstOrDefault(x => x.Email == email);
                if (user != null)
                {
                    user.Password = new_pass;
                     _context.RmRomoocDrivers.Update(user);
                    _context.SaveChanges();
                    string FromAddress = "vayxe@3i.com.vn";
                    string FromAdressTitle = "Remooc system";
                    string ToAddress = email;
                    string ToAdressTitle = email;
                    string Subject = "Forgot password";
                    string SmtpServer = "mail.3i.com.vn";
                    int SmtpPortNumber = 587;
                    var mimeMessage = new MimeMessage();
                    mimeMessage.From.Add(new MailboxAddress(FromAdressTitle, FromAddress));
                    mimeMessage.To.Add(new MailboxAddress(ToAdressTitle, ToAddress));
                    mimeMessage.Subject = Subject;
                    BodyBuilder bodyBuilder = new BodyBuilder();
                    string text = "Đổi mật khẩu thành công. Mật khẩu mới của bạn là: " + new_pass;
                    bodyBuilder.TextBody = text;
                    mimeMessage.Body = bodyBuilder.ToMessageBody();
                    using (var client = new SmtpClient())
                    {
                        client.ServerCertificateValidationCallback = (s, c, h, e) => true;
                        client.Connect(SmtpServer, SmtpPortNumber, SecureSocketOptions.Auto);
                        client.Authenticate("vayxe@3i.com.vn", "Giacngo79");
                        client.Send(mimeMessage);
                        client.Disconnect(true);
                    }
                }
            }
            catch (Exception)
            {

            }
        }
        public class DriverTrackingSearch
        {
            public int Driver_Id { get; set; }
            public string Start_position_time { get; set; }
            public string End_position_time { get; set; }
        }
        public class DriverTrackingResponseNew
        {
            public object User { get; set; }
            public object DriverTracktor { get; set; }
        }
        public class TracktorTrackingResponseNew
        {
            public object Tracktor { get; set; }
            public object TrackingTracktor { get; set; }
        }
        public class RomoocTrackingResponseNew
        {
            public object Romooc { get; set; }
            public object TrackingRomooc { get; set; }
        }
        public class TrackingResponse
        {
            public int Id { get; set; }
            public string Trip_code { get; set; }
            public string Tractor_code { get; set; }
            public string Remooc_code { get; set; }
            public string Start_position_time { get; set; }
            public string Start_position_text { get; set; }
            public string End_position_time { get; set; }
            public string End_position_text { get; set; }
            public string CreatedDate { get; set; }
            public int Driver_Id { get; set; }

        }
        public class TrackingTractorSearch
        {
            public string TracktorCode { get; set; }
            public string Start_position_time { get; set; }
            public string End_position_time { get; set; }
        }
        public class TrackingTractorResponse
        {
            public int Id { get; set; }
            public string Trip_code { get; set; }
            public string Tractor_code { get; set; }
            public string Remooc_code { get; set; }
            public string Start_position_code { get; set; }
            public string Start_position_time { get; set; }
            public string Start_position_text { get; set; }
            public string End_position_code { get; set; }
            public string End_position_time { get; set; }
            public string End_position_text { get; set; }
            public string CreatedDate { get; set; }
            public int Driver_Id { get; set; }
            public string Generic { get; set; }
            public string Image { get; set; }
            public string Group { get; set; }
            public string Name { get; set; }
            public string Origin { get; set; }

        }
    }
}