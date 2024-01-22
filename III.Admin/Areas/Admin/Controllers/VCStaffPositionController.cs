using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using Microsoft.AspNetCore.Hosting;
using System.Globalization;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class VCStaffPositionController : BaseController
    {

        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly EIMDBContext _context;
        private readonly IActionLogService _actionLog;
        public VCStaffPositionController(EIMDBContext context, IHostingEnvironment hostingEnvironment, IActionLogService actionLog)
        {
            _context = context;
            _hostingEnvironment = hostingEnvironment;
            _actionLog = actionLog;
        }
        public IActionResult Index()
        {
            return View();
        }
        [HttpPost]
        public JsonResult GetStaffCheckIn([FromBody] VCStaffPositionSearch jTablePara)
        {
            var session = HttpContext.GetSessionUser();
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;
            // tạm ẩn vì chưa tìm kiếm đến ngày
            //var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            //var currentTime = DateTime.Now;
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            if (!string.IsNullOrEmpty(jTablePara.UserName))
            {
                IQueryable<object> query = null;
                // chỗ này search theo tên vì form đang có input search theo tên , DMM
                if (session.UserType == 10)
                {
                    query = (from a in _context.VcWorkChecks
                             join b in _context.Users.Where(x => x.Active) on a.UserName equals b.UserName
                             join c in _context.VcSettingRoutes.Where(x => !x.IsDeleted) on a.CareCode equals c.RouteCode
                             join d in _context.Customerss.Where(x => !x.IsDeleted) on c.Node equals d.CusCode
                             where
                             (string.IsNullOrEmpty(jTablePara.UserName) || b.UserName == jTablePara.UserName)
                             //(string.IsNullOrEmpty(jTablePara.StaffName) || (b.Name.ToLower().Contains(jTablePara.StaffName.ToLower()) || b.Username.ToLower().Contains(jTablePara.StaffName.ToLower())))
                             && ((fromDate.Date == a.CheckinTime.Value.Date))
                              && c.IsDeleted == false
                             //&& (string.IsNullOrEmpty(jTablePara.ToDate) || (a.CheckinTime.Value.Date <= toDate.Value.Date))
                             select new
                             {
                                 IdUser = b.Id,
                                 Id = a.Id,
                                 Name = b.GivenName,
                                 Phone = b.PhoneNumber,
                                 ProfilePicture = b.Picture,
                                 CheckInGps = a.Checkin_gps,
                                 CheckInTime1 = a.CheckinTime,
                                 CheckInTime = a.CheckinTime.Value.ToString("Lúc HH:mm:ss dd/MM/yyyy"),
                                 CompanyCode = d.CusCode,
                                 CompanyName = d.CusName,
                                 CompanyAddress = d.Address

                             }).OrderByDescending(x => x.CheckInTime1);
                }
                else
                {
                    if (session.TypeStaff == 10)
                    {
                        var listArea = GetListAreaFunc(session).Select(x => x.Code).ToList();

                        query = (from a in _context.VcWorkChecks
                                 join b in _context.Users.Where(x => x.Active) on a.UserName equals b.UserName
                                 join c in _context.VcSettingRoutes.Where(x => !x.IsDeleted) on a.CareCode equals c.RouteCode
                                 join d in _context.Customerss.Where(x => !x.IsDeleted && listArea.Any(y => y == x.Area)) on c.Node equals d.CusCode
                                 where
                                 (string.IsNullOrEmpty(jTablePara.UserName) || b.UserName == jTablePara.UserName)
                                 //(string.IsNullOrEmpty(jTablePara.StaffName) || (b.Name.ToLower().Contains(jTablePara.StaffName.ToLower()) || b.Username.ToLower().Contains(jTablePara.StaffName.ToLower())))
                                 && ((fromDate.Date == a.CheckinTime.Value.Date))
                                  && c.IsDeleted == false
                                 //&& (string.IsNullOrEmpty(jTablePara.ToDate) || (a.CheckinTime.Value.Date <= toDate.Value.Date))
                                 select new
                                 {
                                     IdUser = b.Id,
                                     Id = a.Id,
                                     Name = b.GivenName,
                                     Phone = b.PhoneNumber,
                                     ProfilePicture = b.Picture,
                                     CheckInGps = a.Checkin_gps,
                                     CheckInTime1 = a.CheckinTime,
                                     CheckInTime = a.CheckinTime.Value.ToString("Lúc HH:mm:ss dd/MM/yyyy"),
                                     CompanyCode = d.CusCode,
                                     CompanyName = d.CusName,
                                     CompanyAddress = d.Address

                                 }).OrderByDescending(x => x.CheckInTime1);
                    }
                    else if (session.TypeStaff == 0)
                    {
                        query = (from a in _context.VcWorkChecks.Where(x => x.UserName == session.UserName)
                                 join b in _context.Users.Where(x => x.Active) on a.UserName equals b.UserName
                                 join c in _context.VcSettingRoutes.Where(x => !x.IsDeleted) on a.CareCode equals c.RouteCode
                                 join d in _context.Customerss.Where(x => !x.IsDeleted) on c.Node equals d.CusCode
                                 where
                                 (string.IsNullOrEmpty(jTablePara.UserName) || b.UserName == jTablePara.UserName)
                                 //(string.IsNullOrEmpty(jTablePara.StaffName) || (b.Name.ToLower().Contains(jTablePara.StaffName.ToLower()) || b.Username.ToLower().Contains(jTablePara.StaffName.ToLower())))
                                 && ((fromDate.Date == a.CheckinTime.Value.Date))
                                 && c.IsDeleted == false
                                 //&& (string.IsNullOrEmpty(jTablePara.ToDate) || (a.CheckinTime.Value.Date <= toDate.Value.Date))
                                 select new
                                 {
                                     IdUser = b.Id,
                                     Id = a.Id,
                                     Name = b.GivenName,
                                     Phone = b.PhoneNumber,
                                     ProfilePicture = b.Picture,
                                     CheckInGps = a.Checkin_gps,
                                     CheckInTime1 = a.CheckinTime,
                                     CheckInTime = a.CheckinTime.Value.ToString("Lúc HH:mm:ss dd/MM/yyyy"),
                                     CompanyCode = d.CusCode,
                                     CompanyName = d.CusName,
                                     CompanyAddress = d.Address
                                 }).OrderByDescending(x => x.CheckInTime1);
                    }
                }

                var count = query.Count();
                var list2 = query.Skip(intBeginFor).Take(jTablePara.Length).ToList();
                var jdata = JTableHelper.JObjectTable(list2, jTablePara.Draw, count, "IdUser", "Name", "Phone", "ProfilePicture", "CheckInGps", "CheckInTime", "CompanyCode", "CompanyName", "CompanyAddress");
                return Json(jdata);
            }
            else
            {
                var data = GetStaffCheckInNotPagingRaw(session, jTablePara);
                var list = new List<Content>();
                foreach (var item in data)
                {
                    if (item.Data != null && item.Data.Count > 0)
                    {
                        list.Add(item.Data.ElementAt(item.Data.Count - 1));
                    }
                }
                var count = list.Count();
                var list2 = list.OrderByDescending(x => x.CheckInTime1).Skip(intBeginFor).Take(jTablePara.Length).ToList();
                var jdata = JTableHelper.JObjectTable(list2, jTablePara.Draw, count, "IdUser", "Name", "Phone", "ProfilePicture", "CheckInGps", "CheckInTime", "CompanyCode", "CompanyName", "CompanyAddress");
                return Json(jdata);
            }
        }

        [HttpPost]
        public JsonResult GetStaffCheckInNotPaging([FromBody] VCStaffPositionSearch jTablePara)
        {
            var session = HttpContext.GetSessionUser();
            var rs = GetStaffCheckInNotPagingRaw(session, jTablePara);
            return Json(rs);
        }

        [HttpPost]
        public JsonResult GetListStaff()
        {
            var session = HttpContext.GetSessionUser();
            var list = GetListStaffFunc(session).ToList();

            return Json(list);
        }

        [NonAction]
        private List<Response> GetStaffCheckInNotPagingRaw(SessionUserLogin session, VCStaffPositionSearch jTablePara)
        {
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;

            IQueryable<Content> query = null;
            if (session.UserType == 10)
            {
                query = (from a in _context.VcWorkChecks
                         join b in _context.Users.Where(x => x.Active) on a.UserName equals b.UserName
                         join c in _context.VcSettingRoutes.Where(x => !x.IsDeleted) on a.CareCode equals c.RouteCode
                         join d in _context.Customerss.Where(x => !x.IsDeleted) on c.Node equals d.CusCode
                         where
                         (string.IsNullOrEmpty(jTablePara.UserName) || b.UserName == jTablePara.UserName)
                         && ((fromDate.Date == a.CheckinTime.Value.Date))
                         && c.IsDeleted == false
                         select new Content
                         {
                             IdUser = b.Id,
                             Id = a.Id,
                             Name = b.GivenName,
                             Phone = b.PhoneNumber,
                             ProfilePicture = b.Picture,
                             CheckInGps = a.Checkin_gps,
                             CheckInTime1 = a.CheckinTime,
                             CheckInTime = a.CheckinTime.Value.ToString("Lúc HH:mm:ss dd/MM/yyyy"),
                             CheckOutTime = a.CheckoutTime != null ? a.CheckoutTime.Value.ToString("Lúc HH:mm:ss dd/MM/yyyy") : "",
                             CompanyCode = d.CusCode,
                             CompanyName = d.CusName,
                             CompanyAddress = d.Address,
                             CheckInDate = a.CheckinTime.Value.Date.ToString("dd/MM/yyyy")
                         });
            }
            else
            {
                if (session.TypeStaff == 10)
                {
                    var listArea = GetListAreaFunc(session).Select(x => x.Code).ToList();

                    query = (from a in _context.VcWorkChecks
                             join b in _context.Users.Where(x => x.Active) on a.UserName equals b.UserName
                             join c in _context.VcSettingRoutes.Where(x => !x.IsDeleted) on a.CareCode equals c.RouteCode
                             join d in _context.Customerss.Where(x => !x.IsDeleted && listArea.Any(y => y == x.Area)) on c.Node equals d.CusCode
                             where
                             (string.IsNullOrEmpty(jTablePara.UserName) || b.UserName == jTablePara.UserName)
                             && ((fromDate.Date == a.CheckinTime.Value.Date))
                             && c.IsDeleted == false
                             select new Content
                             {
                                 IdUser = b.Id,
                                 Id = a.Id,
                                 Name = b.GivenName,
                                 Phone = b.PhoneNumber,
                                 ProfilePicture = b.Picture,
                                 CheckInGps = a.Checkin_gps,
                                 CheckInTime1 = a.CheckinTime,
                                 CheckInTime = a.CheckinTime.Value.ToString("Lúc HH:mm:ss dd/MM/yyyy"),
                                 CheckOutTime = a.CheckoutTime != null ? a.CheckoutTime.Value.ToString("Lúc HH:mm:ss dd/MM/yyyy") : "",
                                 CompanyCode = d.CusCode,
                                 CompanyName = d.CusName,
                                 CompanyAddress = d.Address,
                                 CheckInDate = a.CheckinTime.Value.Date.ToString("dd/MM/yyyy")
                             });
                }
                else if (session.TypeStaff == 0)
                {
                    query = (from a in _context.VcWorkChecks.Where(x => x.UserName == session.UserName)
                             join b in _context.Users.Where(x => x.Active) on a.UserName equals b.UserName
                             join c in _context.VcSettingRoutes.Where(x => !x.IsDeleted) on a.CareCode equals c.RouteCode
                             join d in _context.Customerss.Where(x => !x.IsDeleted) on c.Node equals d.CusCode
                             where
                             (string.IsNullOrEmpty(jTablePara.UserName) || b.UserName == jTablePara.UserName)
                             && ((fromDate.Date == a.CheckinTime.Value.Date))
                             && c.IsDeleted == false
                             select new Content
                             {
                                 IdUser = b.Id,
                                 Id = a.Id,
                                 Name = b.GivenName,
                                 Phone = b.PhoneNumber,
                                 ProfilePicture = b.Picture,
                                 CheckInGps = a.Checkin_gps,
                                 CheckInTime1 = a.CheckinTime,
                                 CheckInTime = a.CheckinTime.Value.ToString("Lúc HH:mm:ss dd/MM/yyyy"),
                                 CheckOutTime = a.CheckoutTime != null ? a.CheckoutTime.Value.ToString("Lúc HH:mm:ss dd/MM/yyyy") : "",
                                 CompanyCode = d.CusCode,
                                 CompanyName = d.CusName,
                                 CompanyAddress = d.Address,
                                 CheckInDate = a.CheckinTime.Value.Date.ToString("dd/MM/yyyy")
                             });
                }
            }


            var list = query.GroupBy(x => new { x.IdUser, x.CheckInDate }).OrderByDescending(x => x.Key.CheckInDate).Select(y => new Response
            {
                IdUser = y.Key.IdUser,
                CheckInDate = y.Key.CheckInDate,
                Data = y.OrderBy(x => x.CheckInTime1).ToList()

            }).ToList();
            return list;
        }
    }
    public class VCStaffPositionSearch : JTableModel
    {
        public string StaffCode { get; set; }

        public string UserName { get; set; }
        public string StaffName { get; set; }
        public string CheckInTime { get; set; }
        public string CheckOutTime { get; set; }
        public string Address { get; set; }
        public string FromDate { get; set; }
        public string ToDate { get; set; }
    }
    public class Response
    {
        public string IdUser { get; set; }
        public string CheckInDate { get; set; }
        public List<Content> Data { get; set; }
    }

    public class Content
    {
        public string IdUser { get; set; }
        public int Id { get; set; }
        public string Name { get; set; }
        public string Phone { get; set; }
        public string ProfilePicture { get; set; }
        public string CheckInGps { get; set; }
        public string CheckInTime { get; set; }
        public DateTime? CheckInTime1 { get; set; }
        public string CheckOutTime { get; set; }
        public string CompanyCode { get; set; }
        public string CompanyName { get; set; }
        public string CompanyAddress { get; set; }
        public string CheckInDate { get; set; }
    }
}