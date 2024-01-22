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
using Microsoft.AspNetCore.Http;
using System.IO;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Options;
using ESEIM;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class RMParkingController : BaseController
    {
        //public class TaxiBookingCustom : RmRemoocTractor
        //{
        //    public string TimeStart { get; set; }
        //}
        public class JMessage2
        {
            public object Object { get; set; }
            public Array array { get; set; }
        }
        public class JTableModelCustom : JTableModel
        {
            public string Group { get; set; }
            public string Flag_Delete { get; set; }
            public string Tractor_Name { get; set; }
            public string Code { get; set; }
        }
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly EIMDBContext _context;
        private readonly ILogger _logger;
        private readonly IActionLogService _actionLog;
        private readonly AppSettings _appSettings;
        public RMParkingController(EIMDBContext context, ILogger<RMParkingController> logger, IOptions<AppSettings> appSettings, IHostingEnvironment hostingEnvironment, IActionLogService actionLog)
        {
            _context = context;
            _logger = logger;
            _hostingEnvironment = hostingEnvironment;
            _actionLog = actionLog;
            _appSettings = appSettings.Value;
        }

        public IActionResult Index()
        {
            ViewData["Message"] = "QUẢN LÝ ĐẦU KÉO";
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



        [HttpPost]
        public object JTable([FromBody]JTableModelCustom jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var company_code = HttpContext.GetSessionUser()?.CompanyCode;
            var query1 = (from a in _context.RmRemoocTrackings
                          group a by a.TractorCode into g
                          select new
                          {
                              Code = g.Key,
                              Id = g.Max(s => s.Id)
                          });

            var query11 = from a in _context.RmRemoocTrackings
                          join b in query1 on a.Id equals b.Id
                          select new
                          {
                              Flag_Delete = a != null ? ((a.Status == "CREATE" || a.Status == "START") ? false : true) : true,
                              Trip_code = a.TripCode,
                              Romooc_code = a.RemoocCode,
                              Status = a.Status,
                              Tractor_code = a.TractorCode,
                              Id = b.Id,
                              Current_position_text = a.CurrentPositionText,
                              Current_position_gps = a.CurrentPositionGPS,

                              Position_time = a != null ? (a.UpdateTime.Value != null ? a.UpdateTime.Value.ToString("dd/MM/yyyy HH:mm:ss") : "") : "",
                          };
            var k = query11.ToList();
            var query22 = from a in _context.RmRemoocTractors
                          join b in query11 on a.Code equals b.Tractor_code into b2
                          from b1 in b2.DefaultIfEmpty()
                          select new
                          {
                              Flag_Delete = b1 != null ? b1.Flag_Delete : true,
                              Company_Code = a.CompanyCode,
                              Id = a.Id,
                              Origin = a.Origin,
                              License_Plate = a.LicensePlate,
                              Generic = a.Generic,
                              Group = a.Group,
                              Position_text = b1 != null ? b1.Current_position_text : "",
                              Position_gps = b1 != null ? b1.Current_position_gps : "",

                              SumDistance = a.SumDistance,
                              Position_time = b1 != null ? b1.Position_time : "",
                              Flag = a.Flag
                          };
            var query33 = from a in query22
                          where (jTablePara.Code == "" || a.License_Plate.ToLower().Contains(jTablePara.Code.ToLower())) && a.Company_Code == company_code
                             && (string.IsNullOrEmpty(jTablePara.Group.Trim()) || a.Group.ToLower().Contains(jTablePara.Group.Trim().ToLower()))
                             && (string.IsNullOrEmpty(jTablePara.Flag_Delete.Trim())
                             || (a.Flag_Delete == (Convert.ToBoolean(jTablePara.Flag_Delete))))
                             orderby a.Id descending
                            select new
                        {
                            Flag_Delete = a != null ? a.Flag_Delete : true,
                            Id = a.Id,
                            Origin = a.Origin,
                            License_Plate = a.License_Plate,
                            Generic = a.Generic,
                            Group = a.Group,
                            Position_text = a != null ? a.Position_text : "",
                            Position_gps = a != null ? a.Position_gps : "",
                            SumDistance = a.SumDistance,
                            Position_time = a != null ? a.Position_time : "",
                            Flag = a.Flag
                        };


            var k22 = query22.ToList();

            ///----------------CHO NAY TOI ANH VOI QUYNH XU LY-----------------------
            //var k33 = "";
            //var query = from a in _context.RmRemoocTractors
            //            join b in _context.Remooc_current_positions on a.Romooc_Code equals b.Remooc_code into b2
            //            from b1 in b2.DefaultIfEmpty()
            //            join c in _context.RmRemoocTrackings on b1.Trip_code equals c.Trip_code  into c2
            //            from c1 in c2.DefaultIfEmpty()

            //            where (jTablePara.Code == "" || a.License_Plate.ToLower().Contains(jTablePara.Code.ToLower())) && a.Company_Code == company_code
            //             && (string.IsNullOrEmpty(jTablePara.Group.Trim()) || a.Group.ToLower().Contains(jTablePara.Group.Trim().ToLower()))
            //             && (string.IsNullOrEmpty(jTablePara.Flag_Delete.Trim())
            //            || (b1.Status == (Convert.ToBoolean(jTablePara.Flag_Delete)))
            //            || (Convert.ToBoolean(jTablePara.Flag_Delete) == true && (b1 == null || b1.Status == true))
            //            )

            //            orderby a.Id descending
            //            select new
            //            {
            //                Id = a.Id,
            //                Origin = a.Origin,
            //                License_Plate = a.License_Plate,
            //                Generic = a.Generic,
            //                Group = a.Group,
            //                Position_text = b1 != null ? b1.Position_text : "",
            //                Position_gps = b1 != null ? b1.Position_gps : "",
            //                Flag_Delete = c1 != null ? ((c1.Status == "CREATE" || c1.Status == "START") ? false : true) : true,
            //                SumDistance = a.SumDistance,
            //                Position_time = b1 != null ? b1.Position_time.Value.ToString("dd/MM/yyyy HH:mm:ss") : "",
            //                Flag = a.Flag,

            //            };


            var count = query33.Count();
            var data = query33
                .Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();



            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "Origin", "Generic", "Group", "Position_text", "License_Plate", "Position_gps", "Flag_Delete", "SumDistance", "Position_time", "Flag");
            return Json(jdata);
        }
        [HttpPost]
        public JsonResult GetSumDistance()
        {
            JMessage msg = new JMessage();
            var sum = _context.RmRemoocTractors.Sum(x => x.SumDistance);
            msg.Object = sum;
            return Json(msg);
        }
        [HttpPost]
        public JsonResult gettreedataDrive([FromBody]RmRemoocTractor obj)
        {
            var msg = new JMessage { Error = true };

            try
            {
                var session = HttpContext.GetSessionUser();
                var data = _context.RmRomoocDrivers.Where(x => x.Active == 1 && x.Group.Equals(obj.Group)).OrderBy(x => x.Id);
                msg.Object = data;
                msg.Error = false;
            }
            catch (Exception ex)
            {
                msg.Title = "Get Parent Group fail ";
            }

            return Json(msg);
        }

        ////FromBody
        //[HttpPost]
        //public JsonResult Insert([FromBody]RmRemoocTractor obj)
        //{
        //    var msg = new JMessage() { Error = false };
        //    try
        //    {
        //        var company_code = HttpContext.GetSessionUser()?.CompanyCode;
        //        RmRemoocTractor objtr = obj;
        //        objtr.Company_Code = company_code;
        //        _context.RmRemoocTractors.Add(objtr);
        //        var a = _context.SaveChanges();
        //        msg.Title = "Thêm Bãi Xe thành công";
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Object = ex;
        //        msg.Title = "Có lỗi khi thêm Bãi Xe";
        //    }
        //    return Json(msg);
        //}

        [HttpPost]
        public JsonResult gettreedataRomooc([FromBody]RmRemoocTractor obj)
        {

            var msg = new JMessage { Error = true };

            try
            {

                var data = _context.RmRemoocRemoocs.Where(x => x.FlagDelete == 1 && x.Group.Equals(obj.Group)).OrderBy(x => x.Id);

                msg.Object = data;
                msg.Error = false;
            }
            catch (Exception ex)
            {
                msg.Title = "Get Parent Group fail ";
            }

            return Json(msg);
        }

        [HttpPost]
        public async Task<JsonResult> Insert(RmRemoocTractor obj, IFormFile image)
        {

            var msg = new JMessage() { Error = false, ID = 1 };
            try
            {
                var company_code = HttpContext.GetSessionUser()?.CompanyCode;
                RmRemoocTractor rs = _context.RmRemoocTractors.FirstOrDefault(x => x.LicensePlate == obj.LicensePlate);
                if (rs == null)
                {
                    //if (_context.RmRemoocTractors.FirstOrDefault(x => x.Driver_Id == obj.Driver_Id && x.Flag == 1) != null)
                    //{

                    //    msg.Title = "Tài xế này đang quản lý 1 đầu kéo khác. Mời kiểm tra lại";
                    //    msg.Error = true;
                    //    return Json(msg);
                    //}

                    Array listRemooc;
                    //if (obj.Romooc_Code.LastIndexOf(",") != -1)
                    //{
                    //    listRemooc = obj.Romooc_Code.Substring(0, obj.Romooc_Code.LastIndexOf(",")).Split(',');
                    //}
                    //else
                    //{
                    listRemooc = obj.RomoocCode.Split(',');
                    //}

                    foreach (var item in listRemooc)
                    {
                        var a = _context.RmRemoocTractors.FirstOrDefault(x => x.RomoocCode.ToLower().Contains(item.ToString().ToLower()) && x.Flag == 1);
                        if (a != null)
                        {
                            msg.Title = "Mooc " + item + " đang được quản lý 1 đầu kéo khác là " + a.LicensePlate + ". Mời kiểm tra lại";
                            msg.Error = true;
                            return Json(msg);
                        }
                    }
                    var icimage = "";

                    if (image != null && image.Length > 0)
                    {
                        var pathUpload = Path.Combine(_hostingEnvironment.WebRootPath, "uploads\\images");
                        if (!Directory.Exists(pathUpload)) Directory.CreateDirectory(pathUpload);

                        var fileName = DateTimeOffset.Now.ToUnixTimeMilliseconds() + image.FileName;
                        var filePath = Path.Combine(pathUpload, fileName);
                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            await image.CopyToAsync(stream);
                        }
                        icimage = "/uploads/images/" + fileName;
                    }
                    if (icimage != "")
                    {
                        obj.Image = icimage;
                    }
                    else
                        obj.Image = null;

                    obj.Code = obj.LicensePlate;
                    // obj.Romooc_Code = string.Join(",", listRemooc);
                    obj.CreateDate = DateTime.Now;
                    obj.Flag = 1;
                    obj.CompanyCode = company_code;
                    obj.CreateBy = HttpContext.GetSessionUser().UserName;
                    _context.RmRemoocTractors.Add(obj);

                    var driver = _context.RmRomoocDrivers.FirstOrDefault(x => x.Id == obj.Id);

                    if (driver != null)
                    {
                        driver.LicensePlate = obj.LicensePlate;
                        driver.LicenseCarImage = obj.Image;
                        driver.Brand = obj.Generic;
                        _context.RmRomoocDrivers.Update(driver);
                    }
                    _context.SaveChanges();

                    msg.Title = "Thêm mới đầu kéo thành công";
                    msg.Error = false;
                    _actionLog.InsertActionLog("RmRemoocTractors", "Insert new Sevices successfully", null, obj, "Insert");
                }
                else
                {

                    msg.Title = "Biển số này đã tồn tại";
                    msg.Error = true;
                }
            }
            catch (Exception ex)
            {
                msg.ID = 0;
                msg.Error = true;
                msg.Object = ex;
                msg.Title = "Có lỗi khi thêm khoản mục";
                _actionLog.InsertActionLog("RmRemoocTractors", "Insert new Sevices fail", null, obj, "Insert");
            }
            return Json(msg);
        }


        [HttpPost]
        public async Task<JsonResult> Update(RmRemoocTractor obj, IFormFile Image)
        {
            var msg = new JMessage() { Error = false, ID = 1 };
            try
            {
                var company_code = HttpContext.GetSessionUser()?.CompanyCode;
                RmRemoocTractor rs = _context.RmRemoocTractors.FirstOrDefault(x => x.Id == obj.Id);
                if (rs != null)
                {

                    if (_context.RmRemoocTractors.FirstOrDefault(x => x.LicensePlate == obj.LicensePlate && x.Id != rs.Id) !=null)
                    {
                       
                            msg.Title = "Đã tồn tại biển số này!";
                            msg.Error = true;
                            return Json(msg);
                        
                    }
                    var d = obj.RomoocCode.Replace("\",\"", ",").Replace("[\"", "").Replace("\"]", "").Replace("[", "").Replace("]", "").Replace("\"", "").Replace("\"", "");
                    if (d != null && d != "")
                    {

                        var listRemooc = d.Split(',');
                        foreach (var item in listRemooc)
                        {

                            var a = _context.RmRemoocTractors.FirstOrDefault(x => x.RomoocCode.ToLower().Contains(item.ToLower()) && x.Flag == 1 && x.LicensePlate != obj.LicensePlate);
                            if (a != null)
                            {
                                msg.Title = "Mooc " + item + " đang được quản lý 1 đầu kéo khác là " + a.LicensePlate + ". Mời kiểm tra lại";
                                msg.Error = true;
                                return Json(msg);
                            }
                            //var remooc = _context.RemooRemoocs.FirstOrDefault(x => x.LisencePlate.ToLower().Contains(item.ToLower()));

                            //if (remooc.Group == obj.Group)
                            //{
                            //    rs.Romooc_Code += item + ",";
                            //}
                            //else
                            //{
                            //    rs.Romooc_Code = "";
                            //}
                        }
                        //if (rs.Romooc_Code != "" && rs.Romooc_Code != null)
                        //{
                        //    if (rs.Romooc_Code.LastIndexOf(",") != -1)
                        //    {
                        //        rs.Romooc_Code = rs.Romooc_Code.Substring(0, rs.Romooc_Code.LastIndexOf(","));
                        //    }
                        //    else
                        //    {
                        //        rs.Romooc_Code = rs.Romooc_Code;

                        //    }

                        //}


                    }
                    else
                    {
                        msg.Title = "Vui lòng chọn biển số romooc";
                        msg.Error = true;
                        return Json(msg);
                    }


                    var icImage = "";

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
                        icImage = "/uploads/images/" + fileName;
                    }
                    rs.Code = obj.Code;
                    rs.LicensePlate = obj.Code;
                    if (!string.IsNullOrEmpty(icImage))
                        rs.Image = icImage;
                    rs.DriverId = obj.DriverId;
                    rs.Name = obj.Name;
                    rs.Group = obj.Group;
                    rs.RomoocCode = d;
                    rs.Origin = obj.Origin;
                    rs.Generic = obj.Generic;
                    rs.CompanyCode = company_code;
                    rs.Number = obj.Number;
                    rs.YearManufacture = obj.YearManufacture;


                    rs.OwnerCode = obj.OwnerCode;
                    rs.Category = obj.Category;
                    rs.WeightItself = obj.WeightItself;

                    rs.DesignPayload = obj.DesignPayload;
                    rs.PayloadPulled = obj.PayloadPulled;
                    rs.PayloadTotal = obj.PayloadTotal;


                    rs.SizeRegistry = obj.SizeRegistry;
                    rs.SizeUse = obj.SizeUse;

                    rs.RegistryDuration = obj.RegistryDuration;
                    rs.InsurranceDuration = obj.InsurranceDuration;
                    rs.Note = obj.Note;


                    rs.UpdateDate = DateTime.Now;
                    rs.UpdateBy = HttpContext.GetSessionUser().UserName;
                    _context.RmRemoocTractors.Update(rs);
                    RmRomoocDriver driver = _context.RmRomoocDrivers.FirstOrDefault(x => x.LicensePlate == rs.LicensePlate);

                    if (driver != null)
                    {
                        if (driver.Group != rs.Group)
                        {
                            driver.LicenseCarImage = null;
                            driver.LicensePlate = null;
                            driver.Brand = "";
                        }
                        else
                        {
                            driver.LicensePlate = obj.LicensePlate;
                            driver.LicenseCarImage = obj.Image;
                            driver.Brand = obj.Generic;
                        }


                        _context.RmRomoocDrivers.Update(driver);
                    }


                    _context.SaveChanges();
                    msg.Title = "Sửa thông tin đầu kéo thành công";
                    msg.Error = false;
                    _actionLog.InsertActionLog("RmRemoocTractor", "update tractors successfully", rs, obj, "Update");
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
                _actionLog.InsertActionLog("RmRemoocTractor", "update Rtractor fail", null, obj, "Update");
            }
            return Json(msg);
        }
 
        [HttpGet]
        public JsonResult GetItem(int Id)
        {
            var msg = new JMessage2();
            var a = _context.RmRemoocTractors.FirstOrDefault(m => m.Id == Id);
            msg.Object = a;
            if (a.RomoocCode != null && a.RomoocCode != "")
            {
                msg.array = a.RomoocCode.Split(',');
                //if (a.Romooc_Code.LastIndexOf(",") != -1)
                //{
                //    msg.array = a.Romooc_Code.Substring(0, a.Romooc_Code.LastIndexOf(",")).Split(',');
                //}
                //else
                //{
                //    msg.array = a.Romooc_Code.Split(',');

                //}
            }

            return Json(msg);
        }


        //[HttpPost]
        //public JsonResult Update([FromBody]RmRemoocTractor obj)
        //{

        //    var msg = new JMessage() { Error = false };
        //    try
        //    {

        //        _context.RmRemoocTractors.Update(obj);
        //        _context.Entry(obj).State = EntityState.Modified;
        //        var a = _context.SaveChanges();
        //        msg.Title = "Sửa khoản mục thành công";
        //    }
        //    catch (Exception)
        //    {
        //        msg.Error = true;
        //        msg.Title = "Có lỗi khi sửa khoản mục";
        //    }
        //    return Json(msg);
        //}     
        //[HttpGet]
        //public JsonResult GetItem(int? id)
        //{

        //    if (id == null || id < 0)
        //    {
        //        return Json("");
        //    }
        //    var a = _context.RmRemoocTractors.AsNoTracking().Single(m => m.Id == id);
        //    return Json(a);
        //}

        [HttpGet]
        public object GetItemDetail(int? id)
        {

            if (id == null || id < 0)
            {
                return Json("");
            }
            try
            {
                //var user = _roleManager.Users.Single(x => x.Id == obj.Id /*&& x.ConcurrencyStamp == obj.ConcurrencyStamp*/);
                //user.AspNetUserRoles = _context.UserRoles.Where(x => x.UserId == user.Id).ToList();
                var user = _context.RmRemoocTractors.Single(x => x.Id == id && x.CompanyCode == "COM001");
                var exf = _context.RmRomoocDrivers.Single(x => x.Id == user.DriverId);
                var temp = new
                {
                    user.Id,
                    user.Code,
                    user.CreateDate,
                    user.DriverId,
                    user.Generic,
                    user.Group,
                    user.Image,
                    user.Origin,
                    user.Name,
                    exf.Username,
                    exf.LicenseCarImage
                };
                return Json(temp);
            }
            catch (Exception ex)
            {
                return Json(new JMessage() { Error = true, Title = String.Format(CommonUtil.ResourceValue("MSG_LOAD_FAIL"), CommonUtil.ResourceValue("USER_USERNAME").ToLower()), Object = ex });
            }
        }


        [HttpPost]
        public object Delete(int id)
        {
            var msg = new JMessage { Error = true };
            try
            {
                var data = _context.RmRemoocTractors.FirstOrDefault(x => x.Id == id);
                var data1 = _context.RmRemoocCurrentPositions.FirstOrDefault(x => x.TractorCode == data.LicensePlate && x.Status == false);
                if (data1 == null)
                {
                    if (data.Flag == 1)
                    {
                        data.Flag = 0;
                        msg.Error = false;
                        msg.Title = "Kích hoạt trạng thái thành công!";
                    }
                    else
                    {
                        data.Flag = 1;
                        msg.Error = false;
                        msg.Title = "Kích hoạt trạng thái thành công!";

                    }
                    var driver = _context.RmRomoocDrivers.FirstOrDefault(x => x.LicensePlate == data.Code);
                    if (driver != null)
                    {
                        driver.LicensePlate = "";
                        _context.RmRomoocDrivers.Update(driver);

                    }

                    data.RomoocCode = "";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Mã romooc này hiện đang thực hiện chuyến đi!";
                }
                _context.RmRemoocTractors.Update(data);
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
        public object DeleteItems([FromBody]List<int> listIdI)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                foreach (var id in listIdI)
                {
                    RmRemoocTractor obj = _context.RmRemoocTractors.FirstOrDefault(x => x.Id == id);
                    if (obj != null)
                    {
                        obj.Flag = 0;
                        _context.RmRemoocTractors.Update(obj);
                        _context.SaveChanges();
                    }
                }
                msg.Title = "Xóa đầu kéo thành công!";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(CommonUtil.ResourceValue("MSG_DELETE_LIST_FAIL"), CommonUtil.ResourceValue("RESOURCE"));
            }
            return Json(msg);
        }

        //[HttpPost]
        //public object GetTracktorByGroup(int idUser)
        //{
        //    var msg = new JMessage() { Error = false };
        //    var drive = _context.Romooc_Driver.FirstOrDefault(x => x.Id == idUser);
        //    if (drive != null)
        //    {
        //        var data = (from a in _context.RmRemoocTractors
        //                    where a.Flag == 1
        //                    && a.Group == drive.Group
        //                    select new
        //                    {
        //                        a.Code
        //                    }).ToList();
        //        var trackings = (from a in _context.RmRemoocTractors
        //                         join b1 in _context.RmRemoocTrackings on a.Code equals b1.Tractor_code into b2
        //                         from b in b2.DefaultIfEmpty()
        //                         where a.Group == drive.Group
        //                         && (b.Status == "CREATE" || b.Status == "START")
        //                         select new
        //                         {
        //                             a.Code
        //                         }
        //                         ).ToList();
        //        var list2 = data.Where(x => !trackings.Any(y => y.Code == x.Code)).ToList();
        //        msg.Object = list2;
        //    }
        //    return (msg);
        //}

    }

}