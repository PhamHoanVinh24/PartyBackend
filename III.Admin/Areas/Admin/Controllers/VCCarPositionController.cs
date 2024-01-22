using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using Microsoft.AspNetCore.Hosting;
using System.Globalization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class VCCarPositionController : BaseController
    {

        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly EIMDBContext _context;
        private readonly IActionLogService _actionLog;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public VCCarPositionController(
            EIMDBContext context,
            IHostingEnvironment hostingEnvironment,
            IActionLogService actionLog,
            IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _hostingEnvironment = hostingEnvironment;
            _actionLog = actionLog;
            _sharedResources = sharedResources;
        }
        [Breadcrumb("ViewData.CrumbCarOnline", AreaName = "Admin", FromAction = "Index", FromController = typeof(SupplierHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbSuppHome"] = _sharedResources["COM_CRUMB_SUPP_HOME"];
            ViewData["CrumbCarOnline"] = "Bản đồ xe online";
            return View("Index");
        }

        public class modeCardDemo
        {
            public string driverName { get; set; }
            public string idCar { get; set; }
            public double latitude { get; set; }
            public double longitude { get; set; }
            public string googleGPS { get; set; }
            public string licensePlate { get; set; }
            public string room { get; set; }
            public string soCode { get; set; }
            public string storeName { get; set; }
        }


        #region Sẽ xóa đi khi xong demo (Lưu ý)
        [HttpPost]
        public object GetListCarDemo()
        {
            Random rng = new Random();
            var cardInAreaHN = (from a in _context.VcTransporters
                                where !string.IsNullOrEmpty(a.LocationGps)
                                select new modeCardDemo
                                {
                                    driverName = _context.Users.FirstOrDefault(x => x.UserName == a.UserNameDriver).GivenName ?? "",
                                    idCar = a.Id.ToString(),
                                    latitude = 0,
                                    longitude = 0,
                                    licensePlate = a.LicensePlate,
                                    room = "/VCDRIVER1",
                                    soCode = "586250",
                                    storeName = "CH Trần Thu Trang",
                                    googleGPS = a.LocationGps
                                }).AsNoTracking().DistinctBy(x => x.licensePlate).ToList();
            for (var i = 0; i < cardInAreaHN.Count(); i++)
            {
                cardInAreaHN[i].storeName = cardInAreaHN[i].storeName + (i + 1);
                cardInAreaHN[i].latitude = double.Parse(cardInAreaHN[i].googleGPS.Split(",")[0]);
                cardInAreaHN[i].longitude = double.Parse(cardInAreaHN[i].googleGPS.Split(",")[1]);
            }
            return cardInAreaHN;
        }

        [HttpGet]
        public object GetInfoCarDemo(string vehicleCode)
        {
            var data = (from a in _context.SalesOrdersBackups
                        join b in _context.Customerss on a.CustomerId equals b.CusCode into b1
                        from b in b1.DefaultIfEmpty()
                        where a.VehicleCode == vehicleCode
                        select new
                        {
                            soCode = a.DeliveryCode,
                            storeName = b != null ? b.CusName : "",
                        }).FirstOrDefault();
            return data;
        }
        #endregion


        [HttpPost]
        public object GetAllLogtisTracking()
        {
            var query = from a in _context.LogisticTrackings
                        where a.ActivityCode == "FINISH"
                        select new
                        {
                            a.Id,
                            PoB2bCode = a.PoB2bCode,
                            ShipmentCode = a.ShipmentCode,
                            ListSo = a.ShipmentCode,
                            a.LicensePlate,
                            ActivityCode = a.ActivityCode,
                            ActivityName = _context.UrencoCatActivitys.FirstOrDefault(y => y.ActCode == a.ActivityCode).ActName,
                            TimeActivity = a.TimeActivity.ToString("HH:mm dd/MM/yyyy"),
                            //Cuscode = _context.PoB2BHeaders.FirstOrDefault(y => y.Pob2bCode == a.PoB2bCode).CusTomsId,
                            //CusName = _context.Customerss.FirstOrDefault(y => y.CusCode == (_context.PoB2BHeaders.FirstOrDefault(z => z.Pob2bCode == a.PoB2bCode).CusTomsId)).CusName,
                        };

            var rs = query.OrderByDescending(x => x.Id).AsNoTracking().ToList();
            return Json(rs);

        }
    }
}

//[HttpPost]
//public JsonResult GetCarCheckIn([FromBody] VCCarPositionSearch jTablePara)
//{
//    var session = HttpContext.GetSessionUser();
//    var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;
//    // tạm ẩn vì chưa tìm kiếm đến ngày
//    //var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
//    //var currentTime = DateTime.Now;
//    int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
//    if (!string.IsNullOrEmpty(jTablePara.UserName))
//    {
//        var query = (from a in _context.VcWorkChecks
//                 join b in _context.Users.Where(x => x.Active) on a.UserName equals b.UserName
//                 join c in _context.VcSettingRoutes.Where(x => !x.IsDeleted) on a.CareCode equals c.RouteCode
//                 join d in _context.Customers.Where(x => !x.IsDeleted) on c.Node equals d.CusCode
//                 where
//                 (string.IsNullOrEmpty(jTablePara.UserName) || b.UserName == jTablePara.UserName)
//                 //(string.IsNullOrEmpty(jTablePara.StaffName) || (b.Name.ToLower().Contains(jTablePara.StaffName.ToLower()) || b.Username.ToLower().Contains(jTablePara.StaffName.ToLower())))
//                 && ((fromDate.Date == a.CheckinTime.Value.Date))
//                  && c.IsDeleted == false
//                 //&& (string.IsNullOrEmpty(jTablePara.ToDate) || (a.CheckinTime.Value.Date <= toDate.Value.Date))
//                 select new
//                 {
//                     IdUser = b.Id,
//                     Id = a.Id,
//                     Name = b.GivenName,
//                     Phone = b.PhoneNumber,
//                     ProfilePicture = b.Picture,
//                     CheckInGps = a.Checkin_gps,
//                     CheckInTime1 = a.CheckinTime,
//                     CheckInTime = a.CheckinTime.Value.ToString("Lúc HH:mm:ss dd/MM/yyyy"),
//                     CompanyCode = d.CusCode,
//                     CompanyName = d.CusName,
//                     CompanyAddress = d.Address

//                 }).OrderByDescending(x => x.CheckInTime1);

//        //IQueryable<object> query = null;
//        //// chỗ này search theo tên vì form đang có input search theo tên , DMM
//        //if (session.UserType == 10)
//        //{
//        //    query = (from a in _context.VcWorkChecks
//        //             join b in _context.Users.Where(x => x.Active) on a.UserName equals b.UserName
//        //             join c in _context.VcSettingRoutes.Where(x => !x.IsDeleted) on a.CareCode equals c.RouteCode
//        //             join d in _context.Customers.Where(x => !x.IsDeleted) on c.Node equals d.CusCode
//        //             where
//        //             (string.IsNullOrEmpty(jTablePara.UserName) || b.UserName == jTablePara.UserName)
//        //             //(string.IsNullOrEmpty(jTablePara.StaffName) || (b.Name.ToLower().Contains(jTablePara.StaffName.ToLower()) || b.Username.ToLower().Contains(jTablePara.StaffName.ToLower())))
//        //             && ((fromDate.Date == a.CheckinTime.Value.Date))
//        //              && c.IsDeleted == false
//        //             //&& (string.IsNullOrEmpty(jTablePara.ToDate) || (a.CheckinTime.Value.Date <= toDate.Value.Date))
//        //             select new
//        //             {
//        //                 IdUser = b.Id,
//        //                 Id = a.Id,
//        //                 Name = b.GivenName,
//        //                 Phone = b.PhoneNumber,
//        //                 ProfilePicture = b.Picture,
//        //                 CheckInGps = a.Checkin_gps,
//        //                 CheckInTime1 = a.CheckinTime,
//        //                 CheckInTime = a.CheckinTime.Value.ToString("Lúc HH:mm:ss dd/MM/yyyy"),
//        //                 CompanyCode = d.CusCode,
//        //                 CompanyName = d.CusName,
//        //                 CompanyAddress = d.Address

//        //             }).OrderByDescending(x => x.CheckInTime1);
//        //}
//        //else
//        //{
//        //    if (session.TypeStaff == 10)
//        //    {
//        //        var listArea = GetListAreaFunc(session).Select(x => x.Code).ToList();

//        //        query = (from a in _context.VcWorkChecks
//        //                 join b in _context.Users.Where(x => x.Active) on a.UserName equals b.UserName
//        //                 join c in _context.VcSettingRoutes.Where(x => !x.IsDeleted) on a.CareCode equals c.RouteCode
//        //                 join d in _context.Customers.Where(x => !x.IsDeleted && listArea.Any(y => y == x.Area)) on c.Node equals d.CusCode
//        //                 where
//        //                 (string.IsNullOrEmpty(jTablePara.UserName) || b.UserName == jTablePara.UserName)
//        //                 //(string.IsNullOrEmpty(jTablePara.StaffName) || (b.Name.ToLower().Contains(jTablePara.StaffName.ToLower()) || b.Username.ToLower().Contains(jTablePara.StaffName.ToLower())))
//        //                 && ((fromDate.Date == a.CheckinTime.Value.Date))
//        //                  && c.IsDeleted == false
//        //                 //&& (string.IsNullOrEmpty(jTablePara.ToDate) || (a.CheckinTime.Value.Date <= toDate.Value.Date))
//        //                 select new
//        //                 {
//        //                     IdUser = b.Id,
//        //                     Id = a.Id,
//        //                     Name = b.GivenName,
//        //                     Phone = b.PhoneNumber,
//        //                     ProfilePicture = b.Picture,
//        //                     CheckInGps = a.Checkin_gps,
//        //                     CheckInTime1 = a.CheckinTime,
//        //                     CheckInTime = a.CheckinTime.Value.ToString("Lúc HH:mm:ss dd/MM/yyyy"),
//        //                     CompanyCode = d.CusCode,
//        //                     CompanyName = d.CusName,
//        //                     CompanyAddress = d.Address

//        //                 }).OrderByDescending(x => x.CheckInTime1);
//        //    }
//        //    else if (session.TypeStaff == 0)
//        //    {
//        //        query = (from a in _context.VcWorkChecks.Where(x => x.UserName == session.UserName)
//        //                 join b in _context.Users.Where(x => x.Active) on a.UserName equals b.UserName
//        //                 join c in _context.VcSettingRoutes.Where(x => !x.IsDeleted) on a.CareCode equals c.RouteCode
//        //                 join d in _context.Customers.Where(x => !x.IsDeleted) on c.Node equals d.CusCode
//        //                 where
//        //                 (string.IsNullOrEmpty(jTablePara.UserName) || b.UserName == jTablePara.UserName)
//        //                 //(string.IsNullOrEmpty(jTablePara.StaffName) || (b.Name.ToLower().Contains(jTablePara.StaffName.ToLower()) || b.Username.ToLower().Contains(jTablePara.StaffName.ToLower())))
//        //                 && ((fromDate.Date == a.CheckinTime.Value.Date))
//        //                 && c.IsDeleted == false
//        //                 //&& (string.IsNullOrEmpty(jTablePara.ToDate) || (a.CheckinTime.Value.Date <= toDate.Value.Date))
//        //                 select new
//        //                 {
//        //                     IdUser = b.Id,
//        //                     Id = a.Id,
//        //                     Name = b.GivenName,
//        //                     Phone = b.PhoneNumber,
//        //                     ProfilePicture = b.Picture,
//        //                     CheckInGps = a.Checkin_gps,
//        //                     CheckInTime1 = a.CheckinTime,
//        //                     CheckInTime = a.CheckinTime.Value.ToString("Lúc HH:mm:ss dd/MM/yyyy"),
//        //                     CompanyCode = d.CusCode,
//        //                     CompanyName = d.CusName,
//        //                     CompanyAddress = d.Address
//        //                 }).OrderByDescending(x => x.CheckInTime1);
//        //    }
//        //}

//        var count = query.Count();
//        var list2 = query.Skip(intBeginFor).Take(jTablePara.Length).ToList();
//        var jdata = JTableHelper.JObjectTable(list2, jTablePara.Draw, count, "IdUser", "Name", "Phone", "ProfilePicture", "CheckInGps", "CheckInTime", "CompanyCode", "CompanyName", "CompanyAddress");
//        return Json(jdata);
//    }
//    else
//    {
//        var data = GetCarCheckInNotPagingRaw(session, jTablePara);
//        var list = new List<Content>();
//        foreach (var item in data)
//        {
//            if (item.Data != null && item.Data.Count > 0)
//            {
//                list.Add(item.Data.ElementAt(item.Data.Count - 1));
//            }
//        }
//        var count = list.Count();
//        var list2 = list.OrderByDescending(x => x.CheckInTime1).Skip(intBeginFor).Take(jTablePara.Length).ToList();
//        var jdata = JTableHelper.JObjectTable(list2, jTablePara.Draw, count, "IdUser", "Name", "Phone", "ProfilePicture", "CheckInGps", "CheckInTime", "CompanyCode", "CompanyName", "CompanyAddress");
//        return Json(jdata);
//    }
//}

//[HttpPost]
//public JsonResult GetCarCheckInNotPaging([FromBody] VCCarPositionSearch jTablePara)
//{
//    var session = HttpContext.GetSessionUser();
//    var rs = GetCarCheckInNotPagingRaw(session, jTablePara);
//    return Json(rs);
//}

//[HttpPost]
//public JsonResult GetListCar()
//{
//    var session = HttpContext.GetSessionUser();
//    var list = GetListCarFunc(session).ToList();

//    return Json(list);
//}

//[NonAction]
//private List<Response> GetCarCheckInNotPagingRaw(SessionUserLogin session, VCCarPositionSearch jTablePara)
//{
//    var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;

//    IQueryable<Content> query = null;
//    if (session.UserType == 10)
//    {
//        query = (from a in _context.VcWorkChecks
//                 join b in _context.Users.Where(x => x.Active) on a.UserName equals b.UserName
//                 join c in _context.VcSettingRoutes.Where(x => !x.IsDeleted) on a.CareCode equals c.RouteCode
//                 join d in _context.Customers.Where(x => !x.IsDeleted) on c.Node equals d.CusCode
//                 where
//                 (string.IsNullOrEmpty(jTablePara.UserName) || b.UserName == jTablePara.UserName)
//                 && ((fromDate.Date == a.CheckinTime.Value.Date))
//                 && c.IsDeleted == false
//                 select new Content
//                 {
//                     IdUser = b.Id,
//                     Id = a.Id,
//                     Name = b.GivenName,
//                     Phone = b.PhoneNumber,
//                     ProfilePicture = b.Picture,
//                     CheckInGps = a.Checkin_gps,
//                     CheckInTime1 = a.CheckinTime,
//                     CheckInTime = a.CheckinTime.Value.ToString("Lúc HH:mm:ss dd/MM/yyyy"),
//                     CheckOutTime = a.CheckoutTime != null ? a.CheckoutTime.Value.ToString("Lúc HH:mm:ss dd/MM/yyyy") : "",
//                     CompanyCode = d.CusCode,
//                     CompanyName = d.CusName,
//                     CompanyAddress = d.Address,
//                     CheckInDate = a.CheckinTime.Value.Date.ToString("dd/MM/yyyy")
//                 });
//    }
//    else
//    {
//        if (session.TypeStaff == 10)
//        {
//            var listArea = GetListAreaFunc(session).Select(x => x.Code).ToList();

//            query = (from a in _context.VcWorkChecks
//                     join b in _context.Users.Where(x => x.Active) on a.UserName equals b.UserName
//                     join c in _context.VcSettingRoutes.Where(x => !x.IsDeleted) on a.CareCode equals c.RouteCode
//                     join d in _context.Customers.Where(x => !x.IsDeleted && listArea.Any(y => y == x.Area)) on c.Node equals d.CusCode
//                     where
//                     (string.IsNullOrEmpty(jTablePara.UserName) || b.UserName == jTablePara.UserName)
//                     && ((fromDate.Date == a.CheckinTime.Value.Date))
//                     && c.IsDeleted == false
//                     select new Content
//                     {
//                         IdUser = b.Id,
//                         Id = a.Id,
//                         Name = b.GivenName,
//                         Phone = b.PhoneNumber,
//                         ProfilePicture = b.Picture,
//                         CheckInGps = a.Checkin_gps,
//                         CheckInTime1 = a.CheckinTime,
//                         CheckInTime = a.CheckinTime.Value.ToString("Lúc HH:mm:ss dd/MM/yyyy"),
//                         CheckOutTime = a.CheckoutTime != null ? a.CheckoutTime.Value.ToString("Lúc HH:mm:ss dd/MM/yyyy") : "",
//                         CompanyCode = d.CusCode,
//                         CompanyName = d.CusName,
//                         CompanyAddress = d.Address,
//                         CheckInDate = a.CheckinTime.Value.Date.ToString("dd/MM/yyyy")
//                     });
//        }
//        else if (session.TypeStaff == 0)
//        {
//            query = (from a in _context.VcWorkChecks.Where(x => x.UserName == session.UserName)
//                     join b in _context.Users.Where(x => x.Active) on a.UserName equals b.UserName
//                     join c in _context.VcSettingRoutes.Where(x => !x.IsDeleted) on a.CareCode equals c.RouteCode
//                     join d in _context.Customers.Where(x => !x.IsDeleted) on c.Node equals d.CusCode
//                     where
//                     (string.IsNullOrEmpty(jTablePara.UserName) || b.UserName == jTablePara.UserName)
//                     && ((fromDate.Date == a.CheckinTime.Value.Date))
//                     && c.IsDeleted == false
//                     select new Content
//                     {
//                         IdUser = b.Id,
//                         Id = a.Id,
//                         Name = b.GivenName,
//                         Phone = b.PhoneNumber,
//                         ProfilePicture = b.Picture,
//                         CheckInGps = a.Checkin_gps,
//                         CheckInTime1 = a.CheckinTime,
//                         CheckInTime = a.CheckinTime.Value.ToString("Lúc HH:mm:ss dd/MM/yyyy"),
//                         CheckOutTime = a.CheckoutTime != null ? a.CheckoutTime.Value.ToString("Lúc HH:mm:ss dd/MM/yyyy") : "",
//                         CompanyCode = d.CusCode,
//                         CompanyName = d.CusName,
//                         CompanyAddress = d.Address,
//                         CheckInDate = a.CheckinTime.Value.Date.ToString("dd/MM/yyyy")
//                     });
//        }
//    }


//    var list = query.GroupBy(x => new { x.IdUser, x.CheckInDate }).OrderByDescending(x => x.Key.CheckInDate).Select(y => new Response
//    {
//        IdUser = y.Key.IdUser,
//        CheckInDate = y.Key.CheckInDate,
//        Data = y.OrderBy(x => x.CheckInTime1).ToList()

//    }).ToList();
//    return list;
//}
