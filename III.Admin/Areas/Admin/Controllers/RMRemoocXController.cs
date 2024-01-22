using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using System.Globalization;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Identity;
using MimeKit;
using MailKit.Net.Smtp;
using MailKit.Security;
using Newtonsoft.Json;
using System.IO;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Cors;
using Microsoft.EntityFrameworkCore.Internal;
using Syncfusion.XlsIO;
using Syncfusion.Drawing;
using ESEIM;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class RMRemoocXController : BaseController
    {
        public static string SHOP_ICON = "/images/icon_Shop.png";
        public static string PAGODA_ICON = "/images/icon_ChuaChien.png";
        public static string PARK_ICON = "/images/Icon_BaiXe.png";
        public static string COMPANY_ICON = "/images/Icon_CongTy.png";
        private readonly UserManager<AspNetUser> _userManager;
        private readonly RoleManager<AspNetRole> _roleManager;
        private readonly EIMDBContext _context;
        private readonly AppSettings _appSettings;
        private readonly IHostingEnvironment _hostingEnvironment;

        CultureInfo culture = new CultureInfo("en-US");
        string[] formats = {"d/M/yyyy",
                         "dd/MM/yyyy"
                                  , "dd/MM/yy", "d/MM/yy", "dd/M/yy",
                         "d/MM/yyyy", "dd/M/yyyy"
                         };
        public class JTableModelCustom : JTableModel
        {

            public string Code { get; set; }
            public string Group { get; set; }
            public string Flag_Delete { get; set; }
        }
        public class Point
        {
            public float? X { get; set; }
            public float? Y { get; set; }
        }
        public class JMessage2 : JMessage
        {
            public object Object2 { get; set; }
        }

        public class Parking
        {
            public string point { get; set; }
            public string polygon { get; set; }
        }

        public RMRemoocXController(IOptions<AppSettings> appSettings, EIMDBContext context, UserManager<AspNetUser> userManager, RoleManager<AspNetRole> roleManager, IHostingEnvironment hostingEnvironment)
        {
            _userManager = userManager;
            _context = context;
            _roleManager = roleManager;
            _appSettings = appSettings.Value;
            _hostingEnvironment = hostingEnvironment;
        }

        public IActionResult Index()
        {
            ViewData["Message"] = "QUẢN LÝ ROMOOC";
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
            var a = _context.RmRemoocRemoocs.OrderBy(x => x.Id).AsNoTracking().ToList();
            return Json(a);

        }

        [HttpPost]
        public object GetAllRemooc_app(string company_code)
        {
            var a = _context.RmRemoocRemoocs.Where(x => x.CompanyCode == company_code).OrderBy(x => x.Id).AsNoTracking().ToList();
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

        // API Tractor
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
        public object GetAllTractorActive()
        {
            //var a = _context.RmRemoocTrackings.Where(x => x.End_position_time == null) ;
            //return Json(a);
            //var company_code = HttpContext.GetSessionUser()?.CompanyCode;
            var query = from a in _context.RmRemoocTrackings /*where(a.End_position_time == null)*/

                        join c in _context.RmRomoocDrivers on a.DriveId equals c.Id
                        where a.Status == "START" || a.Status == "CREATE"
                        select new
                        {
                            //a.Id,                          
                            //a.Driver_Id,
                            //a.Start_position_code,
                            //a.Start_position_text,
                            //a.Start_position_time,
                            //a.Start_position_gps,
                            //a.Remooc_code,
                            //a.Tractor_code,
                            //a.Note,
                            //a.Trip_code,
                            //b.Company_Code
                            Id = a.Id,
                            Trip_code = a.TripCode,
                            Tractor_code = a.TractorCode,
                            Remooc_code = a.RemoocCode,
                            Start_position_code = a.StartPositionCode,

                            Start_position_gps = a.StartPositionGPS,
                            End_position_gps = a.EndPositionGPS,
                            Start_position_time = a.StartPositionTime != null ? a.StartPositionTime.Value.ToString("dd/MM/yyyy HH:mm") : "__",
                            Start_position_text = a.StartPositionText != null ? a.StartPositionText : "__",
                            End_position_time = a.EndPositionTime != null ? a.StartPositionTime.Value.ToString("dd/MM/yyyy HH:mm") : "__",
                            End_position_text = a.EndPositionText != null ? a.StartPositionText : "__",
                            End_position_code = a.EndPositionCode,
                            Driver_id = a.DriveId,
                            Name = c.Name

                        };

            var rs = query.OrderByDescending(x => x.Id).AsNoTracking().ToList();
            return Json(rs);

        }
        //API Packing
        [HttpPost]
        public object GetAllPacking()
        {

            //var a = _context.RmRemoocPackings.OrderBy(x => x.Id).AsNoTracking().ToList();
            //return Json(a);
            var company_code = HttpContext.GetSessionUser()?.CompanyCode;
            var a = _context.RmRemoocPackings.Where(x => x.CompanyCode == company_code).AsNoTracking().ToList();
            return Json(a);
        }

        //API Packing
        [HttpPost]
        public object GetAllPacking_app(string company_Code)
        {
            var a = _context.RmRemoocPackings.Where(x => x.CompanyCode == company_Code).OrderBy(x => x.Id).AsNoTracking().ToList();
            return Json(a);

        }

        // API kiem tra so dien thoai
        [HttpPost]
        public object isCheckPhone(string phone)
        {
            var msg = new JMessage() { Error = false };

            var a = _context.RmRomoocDrivers.SingleOrDefault(x => x.Phone == phone);
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
        //API Packing
        [HttpPost]
        public object GetAllPacking_app2()
        {
            var a = _context.RmRemoocPackings.Where(x => x.Flag == 9).OrderBy(x => x.Id).AsNoTracking().ToList();
            return Json(a);
        }


        [HttpPost]
        public async Task<object> InsertParkingWithImage(Remooc_packing_insert obj, IFormFile pictureFile)
        {
            var icImage_car = "";
            var company_code = HttpContext.GetSessionUser()?.CompanyCode;

            if (pictureFile != null && pictureFile.Length > 0)
            {

                var pathUpload = Path.Combine(_hostingEnvironment.WebRootPath, "uploads\\images");
                if (!Directory.Exists(pathUpload)) Directory.CreateDirectory(pathUpload);

                var fileName = DateTimeOffset.Now.ToUnixTimeMilliseconds() + pictureFile.FileName;
                var filePath = Path.Combine(pathUpload, fileName);
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await pictureFile.CopyToAsync(stream);
                }
                icImage_car = "/uploads/images/" + fileName;
            }


            var msg = new JMessage2() { Error = false };
            RmRemoocPacking rp = new RmRemoocPacking();
            rp.Title = obj.title;
            rp.GisData = obj.Gis_data;
            rp.Image = icImage_car;
            rp.Description = obj.Description;
            rp.Address = obj.Address;
            rp.Owner = obj.Owner;
            rp.CompanyCode = company_code;
            if (obj.Icon.Contains("SHOP"))
                rp.Icon = SHOP_ICON;
            else
            if (obj.Icon.Contains("PAGODA"))
                rp.Icon = PAGODA_ICON;
            else
            if (obj.Icon.Contains("PARK"))
                rp.Icon = PARK_ICON;
            else
            if (obj.Icon.Contains("COMPANY"))
                rp.Icon = COMPANY_ICON;
            _context.RmRemoocPackings.Add(rp);
            _context.SaveChanges();


            msg.Title = "Thêm mới bãi xe thành công";

            return Json(msg);
        }

        [HttpPost]
        public JsonResult check_fb(string id_fb)
        {
            //  _logger.LogInformation(LoggingEvents.LogDb, "register user social");
            var msg = new JMessage() { Error = false };
            try
            {
                var us = _context.RmRomoocDrivers.SingleOrDefault(x => x.IdFb == id_fb);
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

        [HttpPost]
        public object GetIdPacking(int id)
        {
            var msg = new JMessage() { Error = false };
            var rm = _context.RmRemoocPackings.SingleOrDefault(x => x.Id == id);
            if (rm == null)
            {
                msg.ID = 0;
                msg.Title = "Packing is not exists";
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
            var a = _context.RmRemoocTrackings.OrderBy(x => x.Id).AsNoTracking().ToList();
            return Json(a);

        }
        public object GetTrackingById(RmRemoocTracking obj)
        {
            if (obj.StartPositionTime == null && obj.EndPositionTime == null)
            {
                var a = _context.RmRemoocTrackings.Where(x => x.RemoocCode.Contains(obj.RemoocCode));
                return Json(a);
            }
            else if (obj.StartPositionTime != null && obj.EndPositionTime == null)
            {
                var a = _context.RmRemoocTrackings.Where(x => x.RemoocCode.Contains(obj.RemoocCode) && obj.StartPositionTime <= x.StartPositionTime);
                return Json(a);
            }
            else if (obj.StartPositionTime == null && obj.EndPositionTime != null)
            {
                var a = _context.RmRemoocTrackings.Where(x => x.RemoocCode.Contains(obj.RemoocCode) && obj.EndPositionTime >= x.EndPositionTime);
                return Json(a);
            }
            else
            {
                var a = _context.RmRemoocTrackings.Where(x => x.RemoocCode.Contains(obj.RemoocCode) && obj.StartPositionTime <= x.StartPositionTime && obj.EndPositionTime >= x.EndPositionTime);
                return Json(a);
            }
        }

        public object GetPackingById(RmRemoocTracking obj)
        {

            if (obj.StartPositionTime == null && obj.EndPositionTime == null)
            {
                var a = _context.RmRemoocTrackings.Where(x => x.EndPositionCode == obj.EndPositionCode || x.StartPositionCode == obj.EndPositionCode);
                return Json(a);
            }
            else if (obj.StartPositionTime != null && obj.EndPositionTime == null)
            {
                var a = _context.RmRemoocTrackings.Where(x => x.StartPositionTime >= obj.StartPositionTime && (x.EndPositionCode == obj.EndPositionCode || x.StartPositionCode == obj.EndPositionCode));
                return Json(a);
            }
            else if (obj.StartPositionTime == null && obj.EndPositionTime != null)
            {
                var a = _context.RmRemoocTrackings.Where(x => x.EndPositionTime <= obj.EndPositionTime && (x.EndPositionCode == obj.EndPositionCode || x.StartPositionCode == obj.EndPositionCode));
                return Json(a);
            }
            else
            {
                var a = _context.RmRemoocTrackings.Where(x => x.StartPositionTime >= obj.StartPositionTime && obj.EndPositionTime >= x.EndPositionTime && (x.EndPositionCode == obj.EndPositionCode || x.StartPositionCode == obj.EndPositionCode));
                return Json(a);
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
                var a = _context.RmRemoocTrackings.SingleOrDefault(x => x.Id == id);
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
                var a = _context.RmRemoocTrackings.SingleOrDefault(x => x.Id == rm.Id);
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
            var data = _context.RmRemoocTrackings.FirstOrDefault(x => x.Id == id);


            if (data == null)
            {
                msg.Title = "Packing is not exists";
            }
            else
            {
                msg.Title = "Get packing success";
                msg.Object = data;
            }
            return Json(msg);
        }

        [HttpPost]
        public object GetDriverTracking(int id_driver)
        {
            var msg = new JMessage() { Error = false };

            //var data= _context.RmRemoocTrackings.Where(x => x.Driver_Id == id_driver).OrderByDescending(x => x.Trip_code);
            var data = (from a in _context.RmRemoocTrackings
                            //join b in _context.RmCommandOrderTrucks on a.Ma_Theo_Doi equals b.Ma_Theo_Doi
                        where a.DriveId == id_driver
                        select new
                        {
                            Id = a.Id,
                            Init_position_code = a.InitPositionCode,
                            Init_position_gps = a.InitPositionGPS,
                            Init_position_text = a.InitPositionText,
                            Init_position_time = a.InitPositionTime,
                            Start_position_code = a.StartPositionCode,
                            Start_position_gps = a.StartPositionGPS,
                            Start_position_text = a.StartPositionText,
                            Start_position_time = a.StartPositionTime,
                            End_position_code = a.EndPositionCode,
                            End_position_gps = a.EndPositionGPS,
                            End_position_text = a.EndPositionText,
                            End_position_time = a.EndPositionTime,
                            Driver_Id = a.DriveId,
                            container_code = a.ContainerCode,
                            Note = a.Note,
                            Remooc_code = a.RemoocCode,
                            Tractor_code = a.TractorCode,
                            Trip_code = a.TripCode,
                            Status = a.Status,
                            Ma_Theo_Doi = a.MaTheoDoi


                        }).OrderByDescending(x => x.Trip_code);
            if (data == null)
            {
                msg.ID = 0;
                msg.Title = "Tracking is not exists";
            }
            else
            {

                msg.Title = "Get packing success";
                msg.Object = data;
                msg.ID = 1;
            }
            return Json(msg);
        }

        [HttpPost]
        public object JTable([FromBody]JTableModelCustom jTablePara)
        {

            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var company_code = HttpContext.GetSessionUser()?.CompanyCode;
            var query = from a in _context.RmRemoocRemoocs
                        join b in _context.RmRemoocCurrentPositions on a.Code equals b.RemoocCode into b2
                        from b1 in b2.DefaultIfEmpty()


                        join c in _context.RmRemoocTrackings on b1.TripCode equals c.TripCode into c2
                        from c1 in c2.DefaultIfEmpty()
                        where (string.IsNullOrEmpty(jTablePara.Code) || a.LisencePlate.ToLower().Contains(jTablePara.Code.Trim().ToLower()))
                        && (string.IsNullOrEmpty(jTablePara.Group.Trim()) || a.Group.ToLower().Contains(jTablePara.Group.Trim().ToLower()))
                        && (string.IsNullOrEmpty(jTablePara.Flag_Delete.Trim())
                        || ((Convert.ToBoolean(jTablePara.Flag_Delete) == false && c1 != null && (c1.Status == "CREATE" || c1.Status == "START"))
                        || (Convert.ToBoolean(jTablePara.Flag_Delete) == true && (c1 == null || c1.Status == "FINISH" || c1.Status == "CANCEL")))
                        )
                        && a.CompanyCode == company_code

                        orderby a.Id descending
                        select new
                        {
                            Id = a.Id,
                            LisencePlate = a.LisencePlate,
                            Image = a.Image,
                            Current_position_text = c1 != null ? c1.CurrentPositionText : "",
                            Current_position_gps = c1 != null ? c1.CurrentPositionGPS : "",
                            Flag_Delete = c1 != null ? (c1.Status == "START" || c1.Status == "CREATE" ? false : true) : true,
                            SumDistance = a.SumDistance,
                            Position_time = b1 != null ? b1.PositionTime.Value.ToString("dd/MM/yyyy HH:mm:ss") : "",
                            Group = a.Group,
                            Flag = a.FlagDelete


                        };
            var count = query.Count();
            var data = query
                .Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "LisencePlate", "Image", "Current_position_text", "Current_position_gps", "Flag_Delete", "SumDistance", "Position_time", "Group", "Flag");
            return Json(jdata);
        }

        [HttpPost]
        public object GetAllRemoocCurrent(string company_code)
        {
            //var msg = new JMessage() { Error = false };

            var query = from a in _context.RmRemoocCurrentPositions
                        join b in _context.RmRemoocRemoocs on a.RemoocCode equals b.Code
                        where (b.CompanyCode == company_code)
                        join d in _context.RmRemoocTractors on a.TractorCode equals d.Code
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
                            a.Status,
                            d.DriverId
                        };
            var result = query.OrderBy(x => x.Id);
            return Json(result);
        }
        [HttpPost]
        public JsonResult GetSumDistance()
        {
            JMessage msg = new JMessage();
            var sum = _context.RmRemoocRemoocs.Sum(x => x.SumDistance);
            msg.Object = sum;
            return Json(msg);
        }
        [HttpPost]
        public object GetAllRemoocCurrentx()
        {
            //var msg = new JMessage() { Error = false };
            var company_code = HttpContext.GetSessionUser()?.CompanyCode;
            var query = from a in _context.RmRemoocCurrentPositions
                        join b in _context.RmRemoocRemoocs on a.RemoocCode equals b.Code
                        where (b.CompanyCode == company_code)
                        join d in _context.RmRemoocTractors on a.TractorCode equals d.Code
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
                            a.Status,
                            d.DriverId
                        };
            var result = query.OrderBy(x => x.Id);
            return Json(result);
        }

        [HttpPost]
        public object CreateTripCode(RmRemoocTracking obj)
        {
            var msg = new JMessage() { Error = false };

            try
            {


                if (obj.DriveId != 0)
                {
                    obj.CreateTime = DateTime.Now;
                    obj.CreateBy = obj.DriveId.ToString();
                    obj.InitPositionCode = obj.InitPositionCode;
                    obj.DriveId = obj.DriveId;
                    obj.UpdateTime = DateTime.Now;
                    obj.InitPositionTime = DateTime.Now;
                    obj.CurrentPositionText = obj.InitPositionText;
                    obj.CurrentPositionGPS = obj.InitPositionGPS;
                    obj.Status = "CREATE";
                    _context.RmRemoocTrackings.Add(obj);
                    _context.SaveChanges();
                    msg.Title = "Khởi tạo thành công!";
                    obj.TripCode = "TRC" + obj.Id.ToString();
                    msg.Object = obj;
                    if (obj.MaTheoDoi != null && obj.MaTheoDoi != "" && obj.MaTheoDoi != "undefined")
                    {
                        var command = _context.RmCommandOrderTrucks.FirstOrDefault(x => x.MaTheoDoi == obj.MaTheoDoi);
                        command.Active = "ON_WAY";
                        _context.RmCommandOrderTrucks.Update(command);
                    }
                    _context.RmRemoocTrackings.Update(obj);
                    _context.SaveChanges();
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Không lấy được thông tin tài xế !";
                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = ex.Message;
            }

            return Json(msg);
        }

        public object UpdateTracking(RmRemoocTracking obj)
        {
            var msg = new JMessage2() { Error = false };
            try
            {

                if (obj.StartPositionText == "null" || obj.StartPositionText == "undefined")
                {
                    obj.StartPositionText = "";
                }
                if (obj.StartPositionCode == "null" || obj.StartPositionCode == "undefined")
                {
                    obj.StartPositionCode = "";
                }
                if (obj.StartPositionGPS == "null" || obj.StartPositionGPS == "undefined")
                {
                    obj.StartPositionGPS = "";
                }
                if (obj.Note == "null" || obj.Note == "undefined")
                {
                    obj.Note = "";
                }
                var check1 = _context.RmRemoocTrackings.FirstOrDefault(x => x.TripCode == obj.TripCode);
                if (check1 != null)
                {
                    check1.RemoocCode = obj.RemoocCode;
                    check1.TractorCode = obj.TractorCode;
                    check1.CompanyCode = obj.CompanyCode;
                    check1.ContainerCode = obj.ContainerCode;
                    check1.StartPositionTime = DateTime.Now;
                    check1.Note = obj.Note;
                    check1.StartPositionText = obj.StartPositionText;
                    check1.StartPositionGPS = obj.StartPositionGPS;
                    check1.StartPositionCode = obj.StartPositionCode;
                    check1.MaTheoDoi = obj.MaTheoDoi;
                    check1.TypeTrip = obj.TypeTrip;
                    check1.Band = obj.Band;

                    //them current  possition
                    check1.CurrentPositionText = obj.StartPositionText;
                    check1.CurrentPositionGPS = obj.StartPositionGPS;

                    check1.UpdateBy = obj.DriveId.ToString();
                    check1.UpdateTime = DateTime.Now;
                    check1.Status = "START";

                    _context.RmRemoocTrackings.Update(check1);

                    var current_pos = _context.RmRemoocCurrentPositions.FirstOrDefault(x => x.RemoocCode == check1.RemoocCode);

                    if (current_pos == null)
                    {
                        RmRemoocCurrentPosition cus = new RmRemoocCurrentPosition();
                        cus.RemoocCode = obj.RemoocCode;
                        cus.TractorCode = obj.TractorCode;
                        cus.TripCode = obj.TripCode;
                        cus.PositionTime = DateTime.Now;
                        cus.PositionText = obj.StartPositionText;
                        cus.PositionGPS = obj.StartPositionGPS;
                        cus.PositionParking = obj.StartPositionCode;
                        cus.Status = false;
                        _context.RmRemoocCurrentPositions.Add(cus);
                    }
                    else
                    {
                        current_pos.TractorCode = obj.TractorCode;
                        current_pos.TripCode = obj.TripCode;
                        current_pos.PositionTime = DateTime.Now;
                        current_pos.PositionText = obj.StartPositionText;
                        current_pos.PositionGPS = obj.StartPositionGPS;
                        current_pos.PositionParking = obj.StartPositionCode;
                        current_pos.Status = false;
                        _context.RmRemoocCurrentPositions.Update(current_pos);
                    }
                    _context.SaveChanges();

                    msg.Object2 = check1;
                    msg.ID = 1;
                    msg.Title = "Bắt đầu vận chuyển!";
                }
            }
            catch (Exception ex)
            {
                msg.ID = 0;
                msg.Title = ex.ToString();
            }
            return Json(msg);
        }

        public object CancelTracking(RmRemoocCurrentPosition obj)
        {
            var msg = new JMessage2() { Error = false };
            try
            {
                if (obj.PositionText == "null" || obj.PositionText == "undefined")
                {
                    obj.PositionText = "";
                }
                if (obj.PositionParking == "null" || obj.PositionParking == "undefined")
                {
                    obj.PositionParking = "";
                }
                if (obj.PositionGPS == "null" || obj.PositionGPS == "undefined")
                {
                    obj.PositionGPS = "";
                }
                var check1 = _context.RmRemoocTrackings.FirstOrDefault(x => x.TripCode.Trim() == obj.TripCode.Trim());

                if (check1 != null)
                {

                    check1.EndPositionGPS = obj.PositionGPS;
                    check1.EndPositionText = obj.PositionText;

                    check1.CurrentPositionText = obj.PositionText;
                    check1.CurrentPositionGPS = obj.PositionGPS;

                    check1.EndPositionTime = DateTime.Now;
                    check1.EndPositionCode = obj.PositionParking;

                    check1.UpdateTime = DateTime.Now;

                    check1.Status = "CANCEL";
                    var command_data = _context.RmCommandOrderTrucks.FirstOrDefault(x => x.MaTheoDoi.Trim() == check1.MaTheoDoi.Trim());
                    if (command_data != null)
                    {
                        command_data.Active = "CANCEL";
                        _context.RmCommandOrderTrucks.Update(command_data);
                    }
                    _context.RmRemoocTrackings.Update(check1);

                    _context.SaveChanges();

                    msg.Object2 = check1;
                    msg.ID = 1;
                    msg.Title = "Hủy chuyến thành công!";
                }
                else
                {
                    msg.ID = 0;
                    msg.Title = "Chưa có chuyến!";
                }
            }
            catch (Exception ex)
            {

                msg.Error = true;
                msg.Title = ex.Message;
            }

            return Json(msg);
        }

        [HttpPost]
        public object InsertEndTracking(RmRemoocTracking obj)
        {

            var msg = new JMessage2() { Error = false };
            try
            {
                if (obj.EndPositionText == "null" || obj.EndPositionText == "undefined")
                {
                    obj.EndPositionText = "";
                }
                if (obj.EndPositionCode == "null" || obj.EndPositionCode == "undefined")
                {
                    obj.EndPositionCode = "";
                }
                if (obj.EndPositionGPS == "null" || obj.EndPositionGPS == "undefined")
                {
                    obj.EndPositionGPS = "";
                }
                var check1 = _context.RmRemoocTrackings.FirstOrDefault(x => x.TripCode == obj.TripCode);
                if (check1 != null)
                {
                    check1.EndPositionTime = DateTime.Now;
                    check1.EndPositionText = obj.EndPositionText;
                    check1.EndPositionCode = obj.EndPositionCode;
                    check1.EndPositionGPS = obj.EndPositionGPS;

                    check1.CurrentPositionText = obj.EndPositionText;
                    check1.CurrentPositionGPS = obj.EndPositionGPS;

                    check1.Status = "FINISH";
                    check1.UpdateTime = DateTime.Now;


                    _context.RmRemoocTrackings.Update(check1);


                    var current_pos = _context.RmRemoocCurrentPositions.FirstOrDefault(x => x.RemoocCode.Trim().Equals(check1.RemoocCode.Trim()));
                    if (current_pos == null)
                    {
                        RmRemoocCurrentPosition cus = new RmRemoocCurrentPosition();
                        cus.RemoocCode = obj.RemoocCode;
                        cus.TripCode = obj.TripCode;
                        cus.TractorCode = obj.TractorCode;
                        cus.PositionTime = DateTime.Now;
                        cus.PositionText = obj.EndPositionText;
                        cus.PositionGPS = obj.EndPositionGPS;
                        cus.PositionParking = obj.EndPositionCode;
                        cus.Status = true;

                        _context.RmRemoocCurrentPositions.Add(cus);

                    }
                    else
                    {
                        current_pos.TractorCode = obj.TractorCode;
                        current_pos.TripCode = obj.TripCode;
                        current_pos.PositionTime = DateTime.Now;
                        current_pos.PositionText = obj.EndPositionText;
                        current_pos.PositionGPS = obj.EndPositionGPS;
                        current_pos.PositionParking = obj.EndPositionCode;
                        current_pos.Status = true;

                        _context.RmRemoocCurrentPositions.Update(current_pos);
                    }
                    if (check1.MaTheoDoi != null && check1.MaTheoDoi != "")
                    {
                        var data = _context.RmCommandOrderTrucks.FirstOrDefault(x => x.MaTheoDoi.Trim().Equals(check1.MaTheoDoi.Trim()));
                        if (data != null)
                        {
                            data.Active = "COMPLETED";
                            _context.RmCommandOrderTrucks.Update(data);
                        }
                    }

                    _context.SaveChanges();
                    msg.ID = 1;
                    msg.Title = "Vận chuyển thành công";
                    msg.Object2 = check1;
                }
                else
                {
                    msg.ID = 0;
                    msg.Title = "Chuyến vận chuyển đang có vấn đề";
                }
            }
            catch (Exception ex)
            {
                msg.ID = 0;
                msg.Title = ex.ToString();
            }
            return Json(msg);
        }



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
            var company_code = HttpContext.GetSessionUser()?.CompanyCode;
            var query = from a in _context.RmRemoocTrackings
                        join b in _context.RmRemoocTractors on a.TractorCode equals b.Code
                        where (b.CompanyCode == company_code)
                        select new
                        {

                            a.Id,
                            a.TripCode,
                            a.TractorCode,
                            a.RemoocCode,
                            a.StartPositionCode,
                            a.StartPositionTime,
                            a.StartPositionText,
                            a.EndPositionTime,
                            a.EndPositionText,
                            a.EndPositionCode,
                            a.DriveId,
                            b.Generic,
                            b.Image,
                            b.Group,
                            b.Name,
                            b.Origin
                        };
            if (obj.StartPositionTime == null && obj.EndPositionTime == null)
            {
                var result = query.Where(x => x.TractorCode == obj.TractorCode);
                return Json(result);
            }
            else if (obj.StartPositionTime != null && obj.EndPositionTime == null)
            {
                var result = query.Where(x => x.TractorCode == obj.TractorCode && obj.StartPositionTime <= x.StartPositionTime);
                return Json(result);
            }
            else if (obj.StartPositionTime == null && obj.EndPositionTime != null)
            {
                var result = query.Where(x => x.TractorCode == obj.TractorCode && obj.EndPositionTime >= x.EndPositionTime);
                return Json(result);
            }
            else
            {
                var result = query.Where(x => x.TractorCode == obj.TractorCode && obj.StartPositionTime <= x.StartPositionTime && obj.EndPositionTime >= x.EndPositionTime);
                return Json(result);
            }
        }

        public object searchDriverTractor(RmRemoocTracking obj)
        {
            var company_code = HttpContext.GetSessionUser()?.CompanyCode;
            var query = from a in _context.RmRemoocTrackings
                        join b in _context.RmRomoocDrivers on a.DriveId equals b.Id
                        where (b.CompanyCode == company_code)
                        select new
                        {

                            a.Id,
                            a.TripCode,
                            a.TractorCode,
                            a.RemoocCode,
                            a.StartPositionCode,
                            a.StartPositionTime,
                            a.StartPositionText,
                            a.EndPositionTime,
                            a.EndPositionText,
                            a.EndPositionCode,
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

        [HttpPost]
        public object GetTractorId(int id)
        {
            var msg = new JMessage() { Error = false };

            var query = from a in _context.RmRemoocTractors
                        join b in _context.RmRomoocDrivers on a.DriverId equals b.Id
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
                        join b in _context.RmRomoocDrivers on a.DriverId equals b.Id
                        select new
                        {
                            a.Id,
                            Id_Driver = b.Id,
                            UserName = b.Name,
                            Phone = b.Phone,
                            Email = b.Email,

                            a.Code,
                            a.Origin,
                            a.Flag,
                            a.CreateDate
                        };

            var rs = query.OrderBy(x => x.Id).AsNoTracking().ToList();
            return Json(rs);
        }
        public object GetHistoryTractor(string tractor_code)
        {

            var a = _context.RmRemoocTrackings.OrderBy(x => new { x.StartPositionTime, x.EndPositionTime }).Where(x => x.TractorCode == tractor_code);
            return Json(a);
        }
        public object GetParkingByRomoocCode(string romooc_code)
        {
            var a = _context.RmRemoocCurrentPositions.SingleOrDefaultAsync(x => x.RemoocCode == romooc_code);
            return Json(a);
        }
        // End API temp
        //FromBody
        [HttpPost]
        public async Task<JsonResult> Insert(RmRemoocRemooc obj, IFormFile Image)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var company_code = HttpContext.GetSessionUser()?.CompanyCode;
                var data = _context.RmRemoocRemoocs.FirstOrDefault(x => x.LisencePlate == obj.Code && x.CompanyCode == company_code);
                if (data == null)
                {
                    var icAvatar = "";
                    if (Image != null && Image.Length > 0)
                    {
                        var pathUpload = Path.Combine(_hostingEnvironment.WebRootPath, "uploads\\images");
                        if (!Directory.Exists(pathUpload)) Directory.CreateDirectory(pathUpload);
                        var fileName = DateTimeOffset.Now.ToUnixTimeMilliseconds() + Image.FileName;
                        var filePath = Path.Combine(pathUpload, fileName);
                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            await Image.CopyToAsync(stream);
                        }
                        icAvatar = "/uploads/images/" + fileName;
                    }

                    if (!string.IsNullOrEmpty(icAvatar))
                    {
                        obj.Image = icAvatar;
                    }
                    obj.CompanyCode = company_code;
                    obj.LisencePlate = obj.Code;
                    obj.CreateDate = DateTime.Now;
                    obj.FlagDelete = 1;
                    _context.RmRemoocRemoocs.Add(obj);
                    _context.SaveChanges();

                    msg.Title = "Thêm mới romooc thành công!";
                    msg.Error = false;
                }
                else
                {
                    msg.Title = "Romooc này đã tồn tại!";
                    msg.Error = true;
                }


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
        public object jtablehistory([FromBody]JTableModelCustom jTablePara)
        {

            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.RmRemoocRemoocs
                        join b in _context.RmRemoocTrackings on a.Code equals b.RemoocCode
                        where jTablePara.Code == a.Code
                        select new
                        {
                            Id = b.Id,
                            Trip_code = b.TripCode != null ? b.TripCode : "",
                            Code = a.Code != null ? a.Code : "",
                            Start_position_text = b.StartPositionText != null ? b.StartPositionText : "",
                            End_position_text = b.EndPositionText != null ? b.EndPositionText : "",
                            Start_position_time = b.StartPositionTime,
                            End_position_time = b.EndPositionTime != null ? b.EndPositionText : ""
                        };
            var count = query.Count();
            var data = query
                .OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "Code", "Trip_code", "Start_position_text", "End_position_text", "Start_position_time", "End_position_time");
            return Json(jdata);
        }

        [HttpGet]
        public object getItem(int id)
        {
            try
            {
                var user = _context.RmRemoocRemoocs.Single(x => x.Id == id);
                var query = from a in _context.RmRemoocRemoocs
                            select new
                            {
                                Id = a.Id,
                                Code = a.Code,
                                Barcode = a.BarCode,
                                Title = a.Title,
                                Image = a.Image,
                                CreateDate = a.CreateDate,
                                Date_of_entry = a.DateOfEntry,
                                Date_of_use = a.DateOfUse,
                                Extrafield = a.Extrafield,
                                Generic = a.Generic,
                                Origin = a.Origin,
                                LisencePlate = a.LisencePlate,
                                Group = a.Group,
                                Note = a.Note
                            };
                var data = query.Where(x => x.Id == id);
                return Json(data);
            }
            catch (Exception ex)
            {
                return Json(new JMessage() { Error = true, Title = "Get Item fail!" });
            }
        }
        [HttpPost]
        public object DeleteItems([FromBody]List<int> listId)
        {
            var msg = new JMessage() { Error = true };
            try
            {
                foreach (int id in listId)
                {

                    var obj = _context.RmRemoocRemoocs.FirstOrDefault(x => x.Id == id);
                    if (obj != null)
                    {


                        if (obj.FlagDelete == 1)
                        {
                            obj.FlagDelete = 0;
                            _context.RmRemoocRemoocs.Update(obj);
                            _context.SaveChanges();
                            msg.Error = false;
                            msg.Title = "Khóa thành công!";
                        }
                        else
                        {
                            obj.FlagDelete = 1;
                            _context.RmRemoocRemoocs.Update(obj);
                            _context.SaveChanges();
                            msg.Error = false;
                            msg.Title = "Mở khóa thành công!";
                        }
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = "Romooc không tồn tại, vui lòng làm mới trang";
                    }


                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi xóa!";

            }
            return (msg);
        }

        [HttpPost]
        public List<RmRomoocExtrafield> GetAllType()
        {


            var data = _context.RmRomoocExtrafields.AsNoTracking().OrderBy(x => x.Id).Where(x => x.FieldType == "Romooc");
            var dataOrder = data.ToList();
            return dataOrder;
        }
        [HttpGet]
        public object GetItemDetail(int id)
        {
            try
            {
                //var user = _roleManager.Users.Single(x => x.Id == obj.Id /*&& x.ConcurrencyStamp == obj.ConcurrencyStamp*/);
                //user.AspNetUserRoles = _context.UserRoles.Where(x => x.UserId == user.Id).ToList();

                var user = _context.RmRemoocRemoocs.Single(x => x.Id == id);
                var exf = _context.RmRomoocExtrafields.Single(x => x.Id == user.Extrafield);
                if (exf != null)
                {
                    string jsons = JsonConvert.SerializeObject(exf);
                }
                var temp = new
                {
                    Id = user.Id,
                    Code = user.Code,
                    Title = user.Title,
                    Image = user.Image,
                    Barcode = user.BarCode,
                    Date_of_entry = user.DateOfEntry,
                    Date_of_use = user.DateOfUse,
                    Origin = user.Origin,
                    Generic = user.Generic,
                    CreateDate = user.CreateDate,
                    FieldValue = exf.FieldValue
                };
                return Json(temp);
            }
            catch (Exception ex)
            {
                return Json(new JMessage() { Error = true, Title = String.Format(CommonUtil.ResourceValue("MSG_LOAD_FAIL"), CommonUtil.ResourceValue("USER_USERNAME").ToLower()), Object = ex });
            }
        }
        [HttpPost]
        public async Task<JsonResult> Update(RmRemoocRemooc obj, IFormFile Image)
        {
            var msg = new JMessage() { Error = false };

            var data = _context.RmRemoocRemoocs.FirstOrDefault(x => x.Id == obj.Id);
            if (data != null)
            {
                if (_context.RmRemoocRemoocs.FirstOrDefault(x => x.LisencePlate == obj.LisencePlate && x.Id != data.Id) != null)
                {

                    msg.Title = "Đã tồn tại số mooc này!";
                    msg.Error = true;
                    return Json(msg);

                }
                try
                {
                    var icAvatar = "";
                    if (Image != null && Image.Length > 0)
                    {
                        var pathUpload = Path.Combine(_hostingEnvironment.WebRootPath, "uploads\\images");
                        if (!Directory.Exists(pathUpload)) Directory.CreateDirectory(pathUpload);
                        var fileName = DateTimeOffset.Now.ToUnixTimeMilliseconds() + Image.FileName;
                        var filePath = Path.Combine(pathUpload, fileName);
                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            await Image.CopyToAsync(stream);
                        }
                        icAvatar = "/uploads/images/" + fileName;
                    }
                    if (icAvatar != "")
                    {
                        obj.Image = icAvatar;
                        obj.UpdateDate = DateTime.Now;
                        data.UpdateDate = obj.UpdateDate;
                        data.BarCode = obj.BarCode;
                        data.Title = obj.Title;
                        data.Generic = obj.Generic;
                        data.Extrafield = obj.Extrafield;
                        data.DateOfEntry = obj.DateOfEntry;
                        data.Image = obj.Image;
                        data.DateOfUse = obj.DateOfUse;
                        data.Origin = obj.Origin;
                        data.LisencePlate = data.Code = obj.LisencePlate;
                        data.Group = obj.Group;
                        data.Note = obj.Note;
                    }
                    else
                    {
                        obj.UpdateDate = DateTime.Now;
                        data.UpdateDate = obj.UpdateDate;
                        data.BarCode = obj.BarCode;
                        data.Title = obj.Title;
                        data.Generic = obj.Generic;
                        data.Extrafield = obj.Extrafield;
                        data.DateOfEntry = obj.DateOfEntry;
                        data.DateOfUse = obj.DateOfUse;
                        data.Origin = obj.Origin;
                        data.LisencePlate = data.Code = obj.LisencePlate;
                        data.Group = obj.Group;
                        data.Note = obj.Note;
                    }

                    _context.RmRemoocRemoocs.Update(data);

                    var tractor = _context.RmRemoocTractors.FirstOrDefault(x => x.Flag == 1 && x.RomoocCode.ToLower().Contains(data.LisencePlate.ToLower()));
                    if (tractor != null)
                    {
                        if (data.Group != tractor.Group)
                        {
                            if (tractor.RomoocCode != null && tractor.RomoocCode != "")
                            {
                                // var listRemooc = tractor.Romooc_Code.Substring(0, tractor.Romooc_Code.LastIndexOf(",")).Split(',');
                                var listRemooc = tractor.RomoocCode.Split(',');
                                var listMoocUpdate = "";

                                foreach (var item in listRemooc)
                                {
                                    if (!item.Equals(data.LisencePlate))
                                    {
                                        listMoocUpdate += item + ",";
                                    }

                                }

                                if (listMoocUpdate != "" && listMoocUpdate != null)
                                {
                                    listMoocUpdate = listMoocUpdate.Substring(0, listMoocUpdate.LastIndexOf(","));

                                }

                                tractor.RomoocCode = listMoocUpdate;
                                _context.RmRemoocTractors.Update(tractor);
                            }

                        }

                    }

                    _context.Entry(data).State = EntityState.Modified;
                    var b = _context.SaveChanges();
                    msg.Title = "Sửa thông tin romooc thành công!";
                    msg.Error = false;
                }
                catch (Exception ex)
                {
                    msg.ID = 0;
                    msg.Error = true;
                    msg.Object = ex;
                    msg.Title = "Có lỗi khi sửa thông tin";
                }
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult isOnline(int id_user, int type)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var obj1 = _context.RmRomoocDrivers.SingleOrDefault(x => x.Id == id_user);
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
        public async Task<JsonResult> CheckOnline(int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var query = await _context.RmRomoocDrivers.SingleOrDefaultAsync(x => x.Id == id);
                if (query != null)
                {
                    if (query.IsOnline == 1)
                    {
                        msg.Title = "Online";
                        msg.ID = 0;
                    }
                    else
                    {

                        query.IsOnline = 1;
                        _context.RmRomoocDrivers.Update(query);
                        _context.SaveChanges();
                        msg.ID = 1;
                        msg.Title = "Online";
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
        public JsonResult RomoocBand(int id_user)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var obj1 = _context.RmRomoocDrivers.FirstOrDefault(x => x.Id == id_user);
                if (obj1 == null)
                {
                    msg.Error = true;
                    msg.ID = 0;
                    msg.Title = "user khong ton tai ";
                }
                else
                {
                    var obj = _context.RmRemoocRemoocs.Where(x => x.Group == obj1.Group).ToList();
                    if (obj != null)
                    {
                        msg.Error = false;
                        msg.Object = obj;

                    }



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
        public JsonResult GetInfoContinueTracking(string Ma_dd)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var obj1 = _context.RmCommandOrderTrucks.Where(x => x.MaTheoDoi == Ma_dd).Select(x => new
                {
                    x.MaTheoDoi,
                    x.SoXe,
                    x.SoMooc,
                    x.NoiLay,
                    x.NoiHa,
                    x.KhachHang,
                    x.PhuongAn,
                    x.GhiChu,
                    x.SoCont

                }).FirstOrDefault();
                if (obj1 == null)
                {
                    msg.Error = true;
                    msg.ID = 0;
                    msg.Title = "Mã điều độ không tồn tại";
                }
                else
                {

                    msg.Error = false;
                    msg.Title = "Lấy thông tin thành công";
                    msg.Object = obj1;
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = "Lấy thông tin thất bại";
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult ForgotPassWord(string email)
        {
            JMessage message = new JMessage { Error = false };
            try
            {
                var user = _context.RmRomoocDrivers.FirstOrDefault(x => x.Email == email);
                if (user != null)
                {
                    string FromAddress = "vayxe@3i.com.vn";
                    string FromAdressTitle = "Romooc system";
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

        public static string GenerateOTP(int length = 4, bool onlyNumber = true)
        {
            string alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            string small_alphabets = "abcdefghijklmnopqrstuvwxyz";
            string numbers = "1234567890";

            string characters = numbers;
            if (!onlyNumber)
            {
                characters += alphabets + small_alphabets + numbers;
            }
            string otp = string.Empty;
            for (int i = 0; i < length; i++)
            {
                string character;
                do
                {
                    int index = new Random().Next(0, characters.Length);
                    character = characters.ToCharArray()[index].ToString();
                } while (otp.IndexOf(character, StringComparison.Ordinal) != -1);
                otp += character;
            }

            return otp;
        }

        [HttpGet]
        public void ChangePassword(string email)
        {
            try
            {
                string new_pass = GenerateOTP(6, true);
                var user = _context.RmRomoocDrivers.FirstOrDefault(x => x.Email == email);
                if (user != null)
                {
                    user.Password = new_pass;
                    _context.RmRomoocDrivers.Update(user);
                    _context.SaveChanges();
                    string FromAddress = "vayxe@3i.com.vn";
                    string FromAdressTitle = "Romooc";
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
            catch (Exception ex)
            {

            }
        }
        [HttpPost]
        public object orderTruck(int idUser)
        {
            var query = from a in _context.RmCommandOrderTrucks
                        join b in _context.RmRomoocDrivers on a.TenTaiXe.Trim() equals b.Name.Trim()
                        where b.Id == idUser
                        // && (a.Active == "NOTIFY" || a.Active == "BOOK")
                        && DateTime.ParseExact(a.NgayDieuXe, formats, new CultureInfo("fr-FR"), DateTimeStyles.None).Date >= DateTime.Now.Date
                        // where (jTablePara.UserName == "" || a.UserName.ToLower().Contains(jTablePara.UserName.ToLower()))
                        where (a.Active == "BOOK" || a.Active == "NOTIFY" || a.Active == "CANCEL")
                        orderby a.Id descending
                        select new orderTruckResponse
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
                            Active = a.Active,
                            containercode = a.SoCont,
                            Created_Time = a.CreatedTime,
                            Confirm_Time = a.ConfirmTime,
                            Confirm_Type = a.ConfirmType
                        };
            var list = query.ToList();
            foreach (var item in list)
            {
                var date = item.Created_Time;
                var time = date != null ? date.Value.ToString("HH:mm:ss") : "";
                item.ngaydieuxe = item.ngaydieuxe + " " + time;
                if (item.Active == "BOOK")
                    item.Active1 = "Đã nhận";
                else if (item.Active == "NOTIFY")
                    item.Active1 = "Mới tạo";
                else if (item.Active == "CANCEL")
                    item.Active1 = "Đã từ chối";


            }
            return Json(list);
        }
        // Register
        [HttpPost]
        public JsonResult Register(RmRomoocDriver obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var us = _context.RmRomoocDrivers.Where(x => x.Phone == obj.Phone || x.Email == obj.Email).ToList();
                if (us != null && us.Count > 0)
                {
                    msg.Title = "Login exists";
                    msg.ID = 0;
                    //msg.Object = us;
                    //_logger.LogInformation(LoggingEvents.LogDb, "login user successfully");
                }
                else
                {
                    var us2 = _context.RmECompanys.Where(x => x.CompanyCode == obj.CompanyCode).ToList();
                    if (us2 == null && us2.Count > 0)
                    {
                        msg.Title = "Company isnot exists";
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
                        cus.IsOnline = 1;
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
            }
            return Json(msg);
        }
        // Login
        [HttpPost]
        [EnableCors("AllowSpecificOrigin")]
        public async Task<JsonResult> login(string phone, string password/*, string company_code*/)
        {
            //  _logger.LogInformation(LoggingEvents.LogDb, "login user");

            var msg = new JMessage() { Error = false };
            try
            {
                //var us = await _context.RmRomoocDrivers.SingleOrDefaultAsync(x => x.Phone == phone && x.Password == password);
                var us = await _context.RmRomoocDrivers.Where(x => x.Phone.Equals(phone) && x.Password.Equals(password)).FirstOrDefaultAsync();
                if (us != null)
                {
                    if (us.IsOnline == 1)
                    {
                        msg.ID = 0;
                        msg.Title = "Bạn đang đăng nhập tài khoản này trên thiết bị khác";
                    }
                    else
                    {
                        msg.Title = "Login Success";
                        msg.Object = us;
                        msg.ID = 1;
                    }
                }
                else
                {
                    msg.Title = "Tài khoản và mật khẩu không đúng !";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Object = ex;
                //msg.Title = "Login error";
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
                    var cus = new RmRemoocFcm();
                    cus.UserId = obj.UserId;
                    cus.Token = obj.Token;
                    _context.RmRemoocFcms.Add(cus);
                    _context.SaveChanges();
                    msg.Title = "Add new Token success";
                    msg.Object = obj;
                }
                else
                {
                    fcm.Token = obj.Token;
                    _context.RmRemoocFcms.Update(fcm);
                    _context.SaveChanges();
                    msg.Title = "Update Token success";
                    msg.Object = obj;
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
        [HttpPost]
        public JsonResult GetTimeInterval()
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.RmCommentSettings.FirstOrDefault(x => x.Name == "time_interval");
                msg.Object = data;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = "Có lỗi khi lấy dữ liệu";
            }
            return Json(msg);
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
        public async Task<JsonResult> update_profile(RmRomoocDriver obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var us = await _context.RmRomoocDrivers.SingleOrDefaultAsync(x => x.Id == obj.Id);
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

        [HttpPost]
        public async Task<JsonResult> changePass(RmRomoocDriver obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var us = await _context.RmRomoocDrivers.SingleOrDefaultAsync(x => x.Id == obj.Id);
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
                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
            }
            return Json(msg);
        }

        [HttpPost]
        public async Task<JsonResult> Logout(int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var query = await _context.RmRomoocDrivers.SingleOrDefaultAsync(x => x.Id == id);
                if (query != null)
                {
                    if (query.IsOnline == 1)
                    {
                        query.IsOnline = 0;
                        _context.RmRomoocDrivers.Update(query);
                        _context.SaveChanges();
                        msg.ID = 1;
                        msg.Object = query;
                        msg.Title = "Offline";
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
        public object DeleteItem(int id)
        {
            var msg = new JMessage { Error = true };
            try
            {
                var data = _context.RmRemoocRemoocs.FirstOrDefault(x => x.Id == id);
                var data1 = _context.RmRemoocCurrentPositions.FirstOrDefault(x => x.RemoocCode == data.LisencePlate && x.Status == false);
                if (data1 == null)
                {


                    if (data.FlagDelete == 1)
                    {
                        data.FlagDelete = 0;
                        msg.Error = false;
                        msg.Title = "Kích hoạt trạng thái thành công!";
                        var tracktor = _context.RmRemoocTractors.FirstOrDefault(x => x.RomoocCode.Contains(data.Code));
                        if (tracktor != null)
                        {
                            var arr = tracktor.RomoocCode.Split(',');
                            var update = "";
                            foreach (var item in arr)
                            {
                                if (item != data.Code)
                                    update += item + ",";
                            }
                            if (update.Length > 1)
                                update = update.Substring(0, update.Length - 1);
                            tracktor.RomoocCode = update;
                            _context.RmRemoocTractors.Update(tracktor);
                        }


                    }
                    else
                    {
                        data.FlagDelete = 1;
                        msg.Error = false;
                        msg.Title = "Kích hoạt trạng thái thành công!";

                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Mã romooc này hiện đang thực hiện chuyến đi!";
                }
                _context.RmRemoocRemoocs.Update(data);
                _context.SaveChanges();

                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi thay đổi trạng thái!";
                return Json(msg);
            }
        }

        [HttpPost]
        public object UpdatePosition(RmRemoocCurrentPosition obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                if (obj.PositionGPS == "null" || obj.PositionGPS == "undefined")
                {
                    obj.PositionGPS = "";
                }
                if (obj.PositionText == "null" || obj.PositionText == "undefined")
                {
                    obj.PositionText = "";
                }
                if (obj.PositionParking == "null" || obj.PositionParking == "undefined")
                {
                    obj.PositionParking = "";
                }
                var query = _context.RmRomoocDrivers.FirstOrDefault(x => x.Id == obj.DriverId);
                if (query != null)
                {

                    query.PositionGPS = obj.PositionGPS;
                    query.PositionText = obj.PositionText;
                    query.PositionTime = DateTime.Now;
                    _context.RmRomoocDrivers.Update(query);
                    _context.SaveChanges();
                    if (obj.TripCode != "a")
                    {

                        var current_pos = _context.RmRemoocCurrentPositions.LastOrDefault(x => x.RemoocCode == obj.RemoocCode);
                        if (current_pos == null)
                        {
                            RmRemoocCurrentPosition cus = new RmRemoocCurrentPosition();
                            cus.RemoocCode = obj.RemoocCode;
                            cus.TripCode = obj.TripCode;
                            cus.TractorCode = obj.TractorCode;
                            cus.PositionTime = DateTime.Now;
                            cus.PositionText = obj.PositionText;
                            cus.PositionGPS = obj.PositionGPS;
                            cus.PositionParking = obj.PositionParking;

                            _context.RmRemoocCurrentPositions.Add(cus);

                        }
                        else
                        {
                            current_pos.TractorCode = obj.TractorCode;
                            current_pos.TripCode = obj.TripCode;
                            current_pos.PositionTime = DateTime.Now;
                            current_pos.PositionText = obj.PositionText;
                            current_pos.PositionGPS = obj.PositionGPS;
                            current_pos.PositionParking = obj.PositionParking;
                            _context.RmRemoocCurrentPositions.Update(current_pos);
                        }

                        _context.SaveChanges();
                        msg.ID = 1;
                        msg.Object = current_pos;
                        msg.Title = "Update Tripcode into Remooc_current_position success";
                    }
                    else
                    {
                        msg.ID = 0;
                        msg.Title = "Update position into Remooc_Driver success";
                    }

                }
            }
            catch (Exception ex)
            {
                msg.Title = ex.Message;
                msg.ID = 2;
            }
            return Json(msg);
        }

        [HttpPost]
        public object IsInPolygon(string point, string lst_polygon)
        {
            var msg = new JMessage() { Error = false };
            try
            {

                lst_polygon = lst_polygon.Replace("[\"", "").Replace("\"]", "").Replace("\",\"", "a");
                var lstPolygon = lst_polygon.Split('a');
                //point = "[105.8096319437027,20.990909563014448]";
                //polygon = "[[[105.80894261598587,20.991352807581404],[105.8089479804039,20.991262656250637],[105.80914109945296,20.991320252940465],[105.80894261598587,20.991352807581404]]]";
                foreach (var key in lstPolygon)
                {
                    var point1 = JsonConvert.DeserializeObject<List<string>>(point);
                    var _polygon = new List<Point>();

                    var polygons = JsonConvert.DeserializeObject<List<List<List<string>>>>(key);
                    if (polygons.Count > 0)
                    {
                        foreach (var item in polygons.FirstOrDefault())
                        {
                            var p = new Point
                            {
                                X = float.Parse(item[0]),
                                Y = float.Parse(item[1])
                            };

                            _polygon.Add(p);
                        }
                    }

                    var _point = new Point
                    {
                        X = float.Parse(point1[0]),
                        Y = float.Parse(point1[1])
                    };

                    var coef = _polygon.Skip(1).Select((p, i) =>
                                                    (_point.Y - _polygon[i].Y) * (p.X - _polygon[i].X)
                                                  - (_point.X - _polygon[i].X) * (p.Y - _polygon[i].Y))
                                            .ToList();

                    if (coef.Any(p => p == 0))
                    {
                        msg.Error = false;
                        msg.Title = key;
                        return (msg);
                    }


                    for (int i = 1; i < coef.Count(); i++)
                    {
                        if (coef[i] * coef[i - 1] < 0)
                        {
                            msg.Error = true;

                            return (msg);
                        }
                    }
                }


            }
            catch (Exception ex)
            {
                msg.Error = true;
                return (msg);
            }

            return (msg);
        }
        [HttpPost]
        public object GetRomoocByGroup(int idUser)
        {
            var msg = new JMessage() { Error = false };
            var drive = _context.RmRomoocDrivers.FirstOrDefault(x => x.Id == idUser);
            if (drive != null)
            {
                var data = (from a in _context.RmRemoocRemoocs
                            where a.FlagDelete == 1
                            && a.Group == drive.Group
                            select new
                            {
                                a.Code
                            }).ToList();
                var trackings = (from a in _context.RmRemoocRemoocs
                                 join b1 in _context.RmRemoocTrackings on a.Code equals b1.RemoocCode into b2
                                 from b in b2.DefaultIfEmpty()
                                 where a.Group == drive.Group
                                 && (b.Status == "CREATE" || b.Status == "START")
                                 select new
                                 {
                                     a.Code
                                 }
                                 ).ToList();
                var list2 = data.Where(x => !trackings.Any(y => y.Code == x.Code)).ToList();
                msg.Object = list2;
            }
            return (msg);
        }

        [HttpGet]
        public ActionResult ExportRomooc(string startTime, string endTime, string remoocCode)
        {
            DateTime LastUpdateFrom, LastUpdateTo;
            var start = "";
            var end = "";
            if (!string.IsNullOrEmpty(startTime))
                start = startTime;
            if (!string.IsNullOrEmpty(endTime))
                end = endTime;

            var hasDateFrom = DateTime.TryParseExact(start.Replace("-", "/"), "dd/MM/yyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out LastUpdateFrom);
            var hasDateTo = DateTime.TryParseExact(end.Replace("-", "/"), "dd/MM/yyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out LastUpdateTo);
            try
            {
                var query = from a in _context.RmRemoocTrackings
                            join b in _context.RmRemoocCurrentPositions on a.TripCode equals b.TripCode into b2
                            from b1 in b2.DefaultIfEmpty()
                            where
                            a.RemoocCode == remoocCode
                            && (hasDateFrom == false || (a.StartPositionTime != null && a.StartPositionTime.Value.Date >= LastUpdateFrom.Date))
                            && (hasDateTo == false || (a.EndPositionTime != null && a.EndPositionTime.Value.Date <= LastUpdateTo.Date))
                            join c in _context.RmRomoocDrivers on a.DriveId equals c.Id into c2
                            from c1 in c2.DefaultIfEmpty()
                            where
                            b1 != null
                            select new
                            {
                                Remooc_Code = a.RemoocCode,
                                Trip_Code = a.TripCode,
                                Tractor_Code = a.TractorCode,
                                Driver_Name = c1 != null ? c1.Name : "",
                                Start_position_text = a.StartPositionText,
                                End_position_text = a.EndPositionText,
                                Position_gps = b1 != null ? b1.PositionGPS : "",
                                Position_text = b1 != null ? b1.PositionText : "",
                                Position_time = b1 != null ? b1.PositionTime.Value.ToString("dd/MM/yyyy HH:mm:ss") : "",
                                Type_Trip = a.TypeTrip,
                                Ma_Theo_Doi = a.MaTheoDoi
                            };
                var list = query.ToList();
                #region Create Worksheet
                ExcelEngine excelEngine = new ExcelEngine();
                IApplication application = excelEngine.Excel;
                application.DefaultVersion = ExcelVersion.Excel2010;
                IWorkbook workbook = application.Workbooks.Create(1);
                workbook.Version = ExcelVersion.Excel97to2003;
                IWorksheet sheetRequest = workbook.Worksheets.Create("Romooc_Report");
                workbook.Worksheets[0].Remove();
                sheetRequest.Range["A1"].ColumnWidth = 24;
                sheetRequest.Range["B1"].ColumnWidth = 24;
                sheetRequest.Range["C1"].ColumnWidth = 24;
                sheetRequest.Range["D1"].ColumnWidth = 24;
                sheetRequest.Range["E1"].ColumnWidth = 24;
                sheetRequest.Range["F1"].ColumnWidth = 24;
                sheetRequest.Range["G1"].ColumnWidth = 24;
                sheetRequest.Range["H1"].ColumnWidth = 24;
                sheetRequest.Range["I1"].ColumnWidth = 24;
                sheetRequest.Range["J1"].ColumnWidth = 24;
                sheetRequest.Range["K1"].ColumnWidth = 24;
                sheetRequest.Range["A1:K1"].Merge(true);

                //Inserting sample text into the first cell of the first sheet.
                sheetRequest.Range["A1"].Text = "LỊCH SỬ HOẠT ĐỘNG CỦA ROMOOC";
                sheetRequest.Range["A1"].CellStyle.Font.FontName = "Calibri";
                sheetRequest.Range["A1"].CellStyle.Font.Bold = true;
                sheetRequest.Range["A1"].CellStyle.Font.Size = 24;
                sheetRequest.Range["A1"].CellStyle.Font.RGBColor = Color.FromArgb(0, 0, 122, 192);
                sheetRequest.Range["A1"].HorizontalAlignment = ExcelHAlign.HAlignCenter;
                #endregion
                #region Define Styles
                IStyle tableHeader = workbook.Styles.Add("TableHeaderStyle");
                tableHeader.Font.Color = ExcelKnownColors.Black;
                tableHeader.Font.Bold = true;
                tableHeader.Font.Size = 11;
                tableHeader.Font.FontName = "Calibri";
                tableHeader.HorizontalAlignment = ExcelHAlign.HAlignCenter;
                tableHeader.VerticalAlignment = ExcelVAlign.VAlignCenter;
                //tableHeader.Color = ExcelT;
                tableHeader.Borders[ExcelBordersIndex.EdgeLeft].LineStyle = ExcelLineStyle.None;
                tableHeader.Borders[ExcelBordersIndex.EdgeRight].LineStyle = ExcelLineStyle.None;
                tableHeader.Borders[ExcelBordersIndex.EdgeTop].LineStyle = ExcelLineStyle.None;
                tableHeader.Borders[ExcelBordersIndex.EdgeBottom].LineStyle = ExcelLineStyle.None;
                tableHeader.Borders[ExcelBordersIndex.EdgeBottom].LineStyle = ExcelLineStyle.None;
                #endregion
                #region Create file name
                var fileName = "Romooc_" + DateTime.Now.ToString("dd-MM-yyyy_HH-mm-ss") + ".xls";
                #endregion
                //Start_position_text = a.Start_position_text,
                //                End_position_text = a.End_position_text,
                //                Position_gps = b1.Position_gps != null ? b1.Position_gps : "",
                //                Position_text = b1.Position_text != null ? b1.Position_text : "",
                //                Position_time = b1.Position_time != null ? b1.Position_time.Value.ToString("dd/MM/yyyy HH:mm:ss") : ""

                //Import Data
                sheetRequest.ImportData(list, 2, 1, true);
                #region Apply Styles
                sheetRequest["A2"].Text = "Số romooc";
                sheetRequest["B2"].Text = "Mã chuyến";
                sheetRequest["C2"].Text = "Biển số đầu kéo";
                sheetRequest["D2"].Text = "Tên tài xế";
                sheetRequest["E2"].Text = "Điểm bắt đầu";
                sheetRequest["F2"].Text = "Điểm kết thúc";
                sheetRequest["G2"].Text = "GPS hiện tại";
                sheetRequest["H2"].Text = "Vị trí hiện tại";
                sheetRequest["I2"].Text = "Thời gian hiện tại";
                sheetRequest["J2"].Text = "Kiểu chuyến";
                sheetRequest["K2"].Text = "Mã lệnh điều độ";
                sheetRequest["A2:K2"].CellStyle = tableHeader;
                #endregion
                #region Remove Error Warning
                //if (list.Count() > 0)
                //{
                //    sheetRequest.Range["A3:A" + listdataExport.Count() + 1].IgnoreErrorOptions = ExcelIgnoreError.All;
                //    sheetRequest.Range["B3:B" + listdataExport.Count() + 1].IgnoreErrorOptions = ExcelIgnoreError.All;
                //    sheetRequest.Range["C3:C" + listdataExport.Count() + 1].IgnoreErrorOptions = ExcelIgnoreError.All;
                //    #endregion
                //    #region Text alignment
                //    sheetRequest.Range["A3:A" + listdataExport.Count() + 1].HorizontalAlignment = ExcelHAlign.HAlignCenter;
                //    sheetRequest.Range["B3:B" + listdataExport.Count() + 1].HorizontalAlignment = ExcelHAlign.HAlignCenter;
                //    sheetRequest.Range["C3:C" + listdataExport.Count() + 1].HorizontalAlignment = ExcelHAlign.HAlignCenter;
                //    sheetRequest.Range["D3:D" + listdataExport.Count() + 1].HorizontalAlignment = ExcelHAlign.HAlignCenter;
                //    sheetRequest.Range["E3:E" + listdataExport.Count() + 1].HorizontalAlignment = ExcelHAlign.HAlignCenter;
                //    #endregion
                //    //#endregion
                //}
                #endregion
                #region Cell merging
                sheetRequest.Range["A2:E2"].RowHeight = 20;
                sheetRequest.UsedRange.AutofitColumns();
                string ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                #endregion
                MemoryStream ms = new MemoryStream();
                workbook.SaveAs(ms);
                workbook.Close();
                excelEngine.Dispose();
                ms.Position = 0;
                return File(ms, ContentType, fileName);
            }
            catch (Exception e)
            {
                return null;
            }
        }

    }
    public class Remooc_packing_insert
    {
        public int Id { get; set; }
        public string Company_Code { get; set; }
        public string title { get; set; }

        public string Gis_data { get; set; }

        public string Image { get; set; }
        public string Description { get; set; }

        public string Owner { get; set; }

        public DateTime? CreateDate { get; set; }
        public int? CreateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public int? UpdateBy { get; set; }
        public int Flag { get; set; }
        public string vendor_code { get; set; }
        public string Icon { get; set; }
        public string Address { get; set; }
    }
    public class orderTruckResponse
    {
        public int id { get; set; }
        public String matheodoi { get; set; }
        public String ngaydieuxe { get; set; }
        public String tentaixe { get; set; }
        public String sodaukeo { get; set; }
        public String somooc { get; set; }
        public String tenkh { get; set; }
        public String diachikh { get; set; }
        public String noixuatphat { get; set; }
        public String noilay { get; set; }
        public String noiha { get; set; }
        public String Active { get; set; }
        public String Active1 { get; set; }
        public int? Muc_Do_Uu_Tien { get; set; }
        public String containercode { get; set; }
        public DateTime? Created_Time { get; set; }
        public DateTime? Confirm_Time { get; set; }
        public String Confirm_Type { get; set; }

    }

}