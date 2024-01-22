using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Http;
using System.IO;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Cors;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class RMDriverController : BaseController
    {
        private readonly UserManager<AspNetUser> _userManager;
        private readonly RoleManager<AspNetRole> _roleManager;
        private readonly EIMDBContext _context;
        private readonly ILogger _logger;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IActionLogService _actionLog;
        public class JTableModelCustom : JTableModel
        {
            public string Phone { get; set; }
            public string Title { get; set; }
            public string Group { get; set; }
            public string Is_online { get; set; }
        }

        public class JMessage2 : JMessage
        {
            public object Object2 { get; set; }
        }
        public RMDriverController(EIMDBContext context, UserManager<AspNetUser> userManager, RoleManager<AspNetRole> roleManager, ILogger<RMDriverController> logger, IActionLogService actionLog, IHostingEnvironment hostingEnvironment)
        {
            _userManager = userManager;
            _context = context;
            _roleManager = roleManager;
            _logger = logger;
            _actionLog = actionLog;
            _hostingEnvironment = hostingEnvironment;
        }

        public IActionResult Index()
        {
            ViewData["Message"] = "QUẢN LÝ LÁI XE";
            return View("Index");
        }

        [HttpPost]
        public object JTable([FromBody]JTableModelCustom jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var company_code = HttpContext.GetSessionUser()?.CompanyCode;
            //  var xx = HttpContext.GetSessionUser().UserName;
            var query = from a in _context.RmRomoocDrivers
                        where (((string.IsNullOrEmpty(jTablePara.Phone) || a.Phone.ToLower().Contains(jTablePara.Phone.ToLower()) || a.Name.ToLower().Contains(jTablePara.Phone.ToLower())))
                           
                        && a.CompanyCode == company_code
                        &&(string.IsNullOrEmpty(jTablePara.Group)||a.Group.ToLower().Contains(jTablePara.Group))
                        && (string.IsNullOrEmpty(jTablePara.Is_online) || a.IsOnline == Convert.ToInt32(jTablePara.Is_online)))
                        orderby a.Id descending
                        select new
                        {
                            Id = a.Id,
                            Phone = a.Phone,
                            Name = a.Name,
                            Email = a.Email,
                            Profile_Picture = a.ProfilePicture,
                            CompanyCode = a.CompanyCode,
                            Active = a.Active,
                            Group = a.Group,
                            Is_online = a.IsOnline
                        };
            var count = query.Count();
            var data = query
                .Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "Phone", "Name", "Email", "Profile_Picture", "Active", "Group", "Is_online");
            return Json(jdata);
        }
        //API Remooc


        [HttpPost]
        public object GetAllRemooc()
        {
            var a = _context.RmRemoocRemoocs.OrderBy(x => x.Id).AsNoTracking().ToList();
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
        public object Search_remooc(string code)
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
            var a = _context.RmRemoocTrackings.Where(x => x.EndPositionTime == null);
            return Json(a);
        }

        //API Packing
        [HttpPost]
        public object GetAllPacking()
        {
            var a = _context.RmRemoocPackings.OrderBy(x => x.Id).AsNoTracking().ToList();
            return Json(a);

        }

        [HttpPost]
        public object InsertParking(RmRemoocPacking obj)
        {
            var msg = new JMessage2() { Error = false };
            RmRemoocPacking rp = new RmRemoocPacking();
            rp.Title = obj.Title;
            rp.GisData = obj.GisData;
            rp.Image = obj.Image;
            rp.Description = obj.Description;
            rp.Owner = obj.Owner;
            _context.RmRemoocPackings.Add(obj);
            _context.SaveChanges();


            msg.Title = "insert parking success";

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

        public object Delete_tracking(int id)
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

        public object Update_tracking(RmRemoocTracking rm)
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
            var rm = _context.RmRemoocTrackings.SingleOrDefault(x => x.Id == id);
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
            var rm = _context.RmRemoocTrackings.Where(x => x.DriveId == id_driver);
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
        public object DeleteItems(int Id)
        {
            var msg = new JMessage() { Error = true };
            try
            {
              
                    var obj = _context.RmRomoocDrivers.FirstOrDefault(x => x.Id == Id);
                    if (obj.Active == 1)
                    {
                        obj.Active = 0;
                        obj.LicensePlate = "";
                        _context.RmRomoocDrivers.Update(obj);
                        _context.SaveChanges();
                        msg.Error = false;
                        msg.Title = "Khóa thành công!";
                    }
                    else
                    {
                        obj.Active = 1;
                        _context.RmRomoocDrivers.Update(obj);
                        _context.SaveChanges();
                        msg.Error = false;
                        msg.Title = "Mở khóa thành công!";
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
                obj.TripCode = obj.TractorCode + (DateTime.Now - DateTime.MinValue).TotalMilliseconds;
                _context.RmRemoocTrackings.Add(obj);
                msg.Object = obj;
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
                            msg.Title = "insert Current positon success";
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
                var check1 = _context.RmRemoocTrackings.SingleOrDefault(x => x.TripCode == obj.TripCode);
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
                    msg.Title = "Update end Current positon success";

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
                                msg.Title = "insert Current positon success";
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
            var check1 = _context.RmRemoocTrackings.SingleOrDefault(x => x.TripCode == obj.TripCode);
            if (check1 != null)
            {

                check1.EndPositionTime = obj.EndPositionTime;
                check1.EndPositionText = obj.EndPositionText;
                check1.EndPositionGPS = obj.EndPositionGPS;
                check1.EndPositionCode = obj.EndPositionCode;

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
        public object Search_tractor(string tractor_code)
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
        public object SearchTrackingTractor(RmRemoocTracking obj)
        {

            var query = from a in _context.RmRemoocTrackings
                        join b in _context.RmRemoocTractors on a.TractorCode equals b.Code
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

        public object SearchDriverTractor(RmRemoocTracking obj)
        {

            var query = from a in _context.RmRemoocTrackings
                        join b in _context.RmRomoocDrivers on a.DriveId equals b.Id
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
        public JsonResult GetRomoocByGroup(string group)
        {
            var group1 = group;
            var list = _context.RmRemoocTractors.Where(x => x.Group == group && x.Flag == 1).ToList();
            var list1 = (from a in _context.RmRomoocDrivers
                         where a.Group == group1
                         && a.Active ==1
                         select new
                         {
                             a.LicensePlate
                         }).ToList();
            var list2 = list.Where(x=> !list1.Any(y=>y.LicensePlate == x.Code)).ToList();
            return Json(list2);
        }
        [HttpPost]
        public JsonResult GetRomoocByGroupAll(string group,string tractor_code)
        {
            var group1 = group;
            var list = _context.RmRemoocTractors.Where(x => x.Group == group && x.Flag == 1).ToList();
            var list1 = (from a in _context.RmRomoocDrivers
                         where a.Group == group1
                         && a.Active == 1
                         select new
                         {
                             a.LicensePlate
                         }).ToList();
            var list2 = list.Where(x => !list1.Any(y => y.LicensePlate == x.Code)).ToList();
            var data = _context.RmRemoocTractors.FirstOrDefault(x=>x.Code== tractor_code);
            list2.Add(data);
            return Json(list2);
        }

        [HttpPost]
        public object GetAllTractor()
        {

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

            var rs = query.OrderBy(x => x.Id).AsNoTracking().ToList();
            return Json(rs);
        }

        [HttpPost]
        public JsonResult UpdateCurrentPosition(UpdateCurrentPosMode obj)
        {
            var msg = new JMessage();
            var data = _context.RmRomoocDrivers.FirstOrDefault(x => x.Username == obj.UserName);
            if (data != null)
            {
                data.CurrentChannel = obj.CurrentChannel;
                data.RemoocCode = obj.Remooccode;
                data.TractorCode = obj.Tractorcode;
                _context.RmRomoocDrivers.Update(data);
                msg.Error = false;
                msg.Title = "Cập nhật thành công";
            }
            else
            {
                msg.Error = true;
                msg.Title = "Không tìm thấy tài xế này";
            }

            return Json(msg);
        }

        public object GetHistoryTractor(string tractor_code)
        {
            var a = _context.RmRemoocTrackings.OrderBy(x => new { x.StartPositionTime, x.EndPositionTime }).Where(x => x.TractorCode == tractor_code);
            return Json(a);

        }
        // End API temp

        //FromBody
        [HttpPost]
        public async Task<JsonResult> Insert([FromBody]RmRemoocRemooc obj)
        {
            _logger.LogInformation(LoggingEvents.LogDb, "Insert user");

            var msg = new JMessage() { Error = false };

            try
            {
                var us = await _context.RmRemoocRemoocs.SingleOrDefaultAsync(x => x.Code == obj.Code);
                if (us == null)
                {
                    RmRemoocRemooc objtemp = new RmRemoocRemooc()
                    {
                        Code = obj.Code,
                        Title = obj.Title,
                        Extrafield = 10
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

        public async Task<JsonResult> InsertDriver(RmRomoocDriver obj, IFormFile Image_car, IFormFile License_car_image, IFormFile Profile_Picture)
        {
            var msg = new JMessage() { Error = false, ID = 1 };
            try
            {
                var dataByName = _context.RmRomoocDrivers.FirstOrDefault(x => x.Name == obj.Name);
                if(dataByName==null)
                {
                    if (_context.RmRomoocDrivers.FirstOrDefault(x => x.Phone == obj.Phone) == null)
                    {
                        var icImage_car = "";
                        var icLicense_car_image = "";
                       
                        var icProfile_Picture = "";
                        var company_code = HttpContext.GetSessionUser()?.CompanyCode;

                        if (Image_car != null && Image_car.Length > 0)
                        {
                            var pathUpload = Path.Combine(_hostingEnvironment.WebRootPath, "uploads\\images");
                            if (!Directory.Exists(pathUpload)) Directory.CreateDirectory(pathUpload);

                            var fileName = DateTimeOffset.Now.ToUnixTimeMilliseconds() + Image_car.FileName;
                            var filePath = Path.Combine(pathUpload, fileName);
                            using (var stream = new FileStream(filePath, FileMode.Create))
                            {
                                await Image_car.CopyToAsync(stream);
                            }
                            icImage_car = "/uploads/images/" + fileName;
                        }
                        if (License_car_image != null && License_car_image.Length > 0)
                        {
                            var pathUpload = Path.Combine(_hostingEnvironment.WebRootPath, "uploads\\images");
                            if (!Directory.Exists(pathUpload)) Directory.CreateDirectory(pathUpload);

                            var fileName = DateTimeOffset.Now.ToUnixTimeMilliseconds() + License_car_image.FileName;
                            var filePath = Path.Combine(pathUpload, fileName);
                            using (var stream = new FileStream(filePath, FileMode.Create))
                            {
                                await License_car_image.CopyToAsync(stream);
                            }
                            icLicense_car_image = "/uploads/images/" + fileName;
                        }
                        if (Profile_Picture != null && Profile_Picture.Length > 0)
                        {
                            var pathUpload = Path.Combine(_hostingEnvironment.WebRootPath, "uploads\\images");
                            if (!Directory.Exists(pathUpload)) Directory.CreateDirectory(pathUpload);

                            var fileName = DateTimeOffset.Now.ToUnixTimeMilliseconds() + Profile_Picture.FileName;
                            var filePath = Path.Combine(pathUpload, fileName);
                            using (var stream = new FileStream(filePath, FileMode.Create))
                            {
                                await Profile_Picture.CopyToAsync(stream);
                            }
                            icProfile_Picture = "/uploads/images/" + fileName;
                        }
                        if (icImage_car != "")
                        {
                            obj.ImageCar = icImage_car;
                        }
                       
                        if (icLicense_car_image != "")
                        {
                            obj.LicenseCarImage = icLicense_car_image;
                        }
                        if (icProfile_Picture != "")
                        {
                            obj.ProfilePicture = icProfile_Picture;
                        }

                        obj.CompanyCode = "TAMLONG";
                        obj.Username = obj.Phone+"U";
                        obj.Active = 1;
                        obj.CreatedDate = DateTime.Now;
                        obj.IsOnline = 0;
                        obj.Password = "123456";
                        obj.Emei = "";
                        _context.RmRomoocDrivers.Add(obj);
                        _context.SaveChanges();
                        msg.Title = "Thêm mới lái xe thành công";
                        msg.Error = false;
                    }
                    else
                    {
                        msg.ID = 0;
                        msg.Error = true;
                        msg.Title = "Số điện thoại này đã tồn tại!";

                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Tên tài xế đã tồn tại, vui lòng chọn tên khác";
                }

            }
            catch (Exception ex)
            {
                msg.ID = 0;
                msg.Error = true;
                msg.Object = ex;
                msg.Title = "Có lỗi khi sửa khoản mục";

            }
            return Json(msg);
        }

        [HttpGet]
        public object GetItem(int id)
        {
            try
            {
                var company_code = HttpContext.GetSessionUser()?.CompanyCode;
                //var user = _roleManager.Users.Single(x => x.Id == obj.Id /*&& x.ConcurrencyStamp == obj.ConcurrencyStamp*/);
                //user.AspNetUserRoles = _context.UserRoles.Where(x => x.UserId == user.Id).ToList();
                var user = _context.RmRomoocDrivers.Single(x => x.Id == id && x.CompanyCode == company_code);

                var temp = new
                {
                    user.Id,
                    user.Phone,
                    user.ProfilePicture,
                    user.Name,
                    user.Identification,
                    user.IsOnline,
                    user.Username,
                    user.ImageCar,
                    user.Email,
                    user.LicenseCarImage,
                    user.LicensePlate,
                    user.TypeDriver,
                    user.Group,
                    user.Emei,
                    user.TaxyType,
                    user.IdFb,
                    user.Brand,
                    user.CompanyCode,
                    user.Description,
                    user.VirualIntiary,
                    user.Polyline,
                    user.EndName,
                    user.StartName,
                    user.Password,
                    user.Active

                };

                return Json(temp);
            }
            catch (Exception ex)
            {
                return Json(new JMessage() { Error = true, Title = String.Format(CommonUtil.ResourceValue("MSG_LOAD_FAIL"), CommonUtil.ResourceValue("USER_USERNAME").ToLower()), Object = ex });
            }
        }

        public async Task<JsonResult> Update(RmRomoocDriver obj, IFormFile Image_car, IFormFile License_car_image, IFormFile Identification, IFormFile Profile_Picture)
        {
            var msg = new JMessage() { Error = false, ID = 1 };
            try
            {

                var rs = _context.RmRomoocDrivers.FirstOrDefault(x => x.Id == obj.Id);
                if (rs != null)
                {

                    var icImage_car = "";
                    var icLicense_car_image = "";
                   
                    var icProfile_Picture = "";

                    if (Image_car != null && Image_car.Length > 0)
                    {
                        var pathUpload = Path.Combine(_hostingEnvironment.WebRootPath, "uploads\\images");
                        if (!Directory.Exists(pathUpload)) Directory.CreateDirectory(pathUpload);

                        var fileName = DateTimeOffset.Now.ToUnixTimeMilliseconds() + Image_car.FileName;
                        var filePath = Path.Combine(pathUpload, fileName);
                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            await Image_car.CopyToAsync(stream);
                        }
                        icImage_car = "/uploads/images/" + fileName;
                    }
                    if (License_car_image != null && License_car_image.Length > 0)
                    {
                        var pathUpload = Path.Combine(_hostingEnvironment.WebRootPath, "uploads\\images");
                        if (!Directory.Exists(pathUpload)) Directory.CreateDirectory(pathUpload);

                        var fileName = DateTimeOffset.Now.ToUnixTimeMilliseconds() + License_car_image.FileName;
                        var filePath = Path.Combine(pathUpload, fileName);
                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            await License_car_image.CopyToAsync(stream);
                        }
                        icLicense_car_image = "/uploads/images/" + fileName;
                    }
                    if (Profile_Picture != null && Profile_Picture.Length > 0)
                    {
                        var pathUpload = Path.Combine(_hostingEnvironment.WebRootPath, "uploads\\images");
                        if (!Directory.Exists(pathUpload)) Directory.CreateDirectory(pathUpload);

                        var fileName = DateTimeOffset.Now.ToUnixTimeMilliseconds() + Profile_Picture.FileName;
                        var filePath = Path.Combine(pathUpload, fileName);
                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            await Profile_Picture.CopyToAsync(stream);
                        }
                        icProfile_Picture = "/uploads/images/" + fileName;
                    }
                    if (!string.IsNullOrEmpty(icImage_car))
                        rs.ImageCar = icImage_car;
                    
                    if (!string.IsNullOrEmpty(icLicense_car_image))
                        rs.LicenseCarImage = icLicense_car_image;
                    if (!string.IsNullOrEmpty(icProfile_Picture))
                        rs.ProfilePicture = icProfile_Picture;
                    rs.Identification = obj.Identification;
                    rs.IdFb = obj.IdFb;
                    rs.CompanyCode = obj.CompanyCode;
                    rs.Name = obj.Name;
                    rs.Email = obj.Email;
                    rs.Phone = obj.Phone;
                    rs.TypeDriver = obj.TypeDriver;
                    rs.LicensePlate = obj.LicensePlate;
                    rs.TaxyType = obj.TaxyType;
                    rs.Group = obj.Group;
                    rs.TypeCarYear = obj.TypeCarYear;
                    rs.Emei = obj.Emei;
                    rs.Description = obj.Description;
                    rs.Brand = obj.Brand;
                    rs.Password = obj.Password;
                    rs.Phone = obj.Phone;
                    rs.UpdatedDate = DateTime.Now;
                    rs.IsOnline = obj.IsOnline;

                    var tractor = _context.RmRemoocTractors.FirstOrDefault(x =>x.Flag == 1 && x.LicensePlate == rs.LicensePlate);
                    if (tractor!=null)
                    {
                        if (rs.Group != tractor.Group)
                        {
                            rs.LicensePlate = null;
                        }
                        
                    }
                    _context.RmRomoocDrivers.Update(rs);
                    _context.SaveChanges();
                    msg.Title = "Sửa thông tin lái xe thành công";
                    msg.Error = false;
                    //_actionLog.InsertActionLog("RmRomoocDrivers", "update RmRomoocDrivers successfully", rs, obj, "Update");
                }
                else
                {
                    msg.Title = "Xảy ra lỗi, vui lòng thử lại.";
                    msg.Error = true;
                }


            }
            catch (Exception ex)
            {
                msg.ID = 0;
                msg.Error = true;
                msg.Object = ex;
                msg.Title = "Có lỗi khi sửa khoản mục";
                _actionLog.InsertActionLog("RmRomoocDrivers", "update RmRomoocDrivers fail", null, obj, "Update");
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Update_Itinerary([FromBody]RmRomoocDriver obj)
        {
            var msg = new JMessage { Error = true };

            try
            {
                var data = _context.RmRomoocDrivers.FirstOrDefault(x => x.Id == obj.Id);
                RmDriverActivityLog obj1 = new RmDriverActivityLog();

                if (data != null)
                {
                    data.StartName = obj.StartName;
                    data.EndName = obj.EndName;
                    data.VirualIntiary = obj.VirualIntiary;
                    data.Polyline = obj.Polyline;
                    data.StartNameGPS = obj.StartNameGPS;
                    data.EndNameGPS = obj.EndNameGPS;
                    obj1.UserName = obj.Username;
                    obj1.CdataJson = obj.VirualIntiary;
                    _context.RmRomoocDrivers.Update(data);
                    _context.RmDriverActivityLogs.Add(obj1);
                    _context.SaveChanges();
                    msg.Error = false;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Có lỗi xảy ra!";
                }
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra!";
                return Json(msg);
            }
        }

        [HttpPost]
        public JsonResult Update_Driver_Acitve(RmDriverActivityLog obj)
        {
            var msg = new JMessage { Error = true };
            try
            {
                var user = _context.RmDriverActivityLogs.SingleOrDefault(x => x.UserName == obj.UserName);
                if (user != null)
                {
                    user.NodeGIS = obj.NodeGIS;
                    user.UserName = obj.UserName;
                    user.DriverId = obj.DriverId;
                    _context.RmDriverActivityLogs.Update(user);
                    _context.SaveChanges();
                    msg.Error = false;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Có lỗi xảy ra!";
                }
                return Json(user);
            }
            catch (Exception ex)
            {
                return Json(new JMessage() { Error = true, Title = String.Format(CommonUtil.ResourceValue("MSG_LOAD_FAIL"), CommonUtil.ResourceValue("USER_USERNAME").ToLower()), Object = ex });
            }
        }

        [HttpPost]
        public JsonResult InsertNV(int Id)
        {
            var msg = new JMessage { Error = true };
            try
            {
                var data = _context.RmRomoocDrivers.FirstOrDefault(x => x.Id == Id);
                var query = from a in _context.RmHrEmployees
                            where a.IdDriver == Id
                            select a;
                if (query.Count() == 0)
                {
                    var obj = new RmHrEmployee();
                    obj.FullName = data.Name;
                    obj.NickName = data.Name;
                    obj.Phone = data.Phone;
                    obj.EmailUser = data.Email;
                    obj.Createtime = DateTime.Now;
                    obj.IdDriver = data.Id;
                    obj.Flag = 1;
                    obj.EmployeeType = 1;
                    obj.Picture = data.ProfilePicture;
                    _context.RmHrEmployees.Add(obj);
                    _context.SaveChanges();
                    msg.Error = false;
                    msg.Title = "Đã thêm tài xế vào nhân viên!";
                    return Json(msg);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Tài xế này đã được thêm vào nhân viên!";
                    return Json(msg);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi thêm!";
                return Json(msg);
            }
        }

        [HttpGet]
        public object GetAllDriver()
        {
            var data = _context.RmRomoocDrivers.Where(x => x.Active == 1).Select(a => new { a.Id, a.Name, a.VirualIntiary }).AsNoTracking().ToList();
            return Json(data);

        }

        //[HttpGet]
        //public object getJsonTracking()
        //{
        //    var data = _context.RmDriverActivityLogs.Where(x => x.Active == 1).Select(a => new { a.Id, a.Name, a.virual_intiary }).AsNoTracking().ToList();
        //    return Json(data);

        //}

        [HttpPost]
        public object GetVitualDriverId(int userId)
        {
            var data = _context.RmRomoocDrivers.SingleOrDefault(x => x.Id == userId);

            var query = _context.RmDriverActivityLogs.Where(x => x.UserName == data.Phone).ToList();
            return Json(query);

        }

        [HttpPost]
        public async Task<JsonResult> GetVitualDriver(int userId)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var us = await _context.RmRomoocDrivers.SingleOrDefaultAsync(x => x.Id == userId);
                if (us != null)
                {
                    msg.Object = us;
                    msg.ID = 1;
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = ex.Message;
            }
            return Json(msg);
        }
    }
    public class UpdateCurrentPosMode
    {
        public string UserName { get; set; }
        public string CurrentChannel { get; set; }
        public string Remooccode { get; set; }
        public string Tractorcode { get; set; }
    }
}