using System;
using System.Globalization;
using System.Linq;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class HolidayDateController : Controller
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        public HolidayDateController(EIMDBContext context, IUploadService upload)
        {
            _context = context;
            _upload = upload;
        }
        public IActionResult Index()
        {
            return View();
        }
        [HttpPost]
        public object JTable([FromBody]JTableModel jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            //var date = !string.IsNullOrEmpty(jTablePara.Date) ? DateTime.ParseExact(jTablePara.Date, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var query = from a in _context.HolidayDates
                            //where ((date == null) || (a.AppDate.HasValue && a.AppDate.Value.Date == date.Value.Date))
                            //    && (string.IsNullOrEmpty(jTablePara.Code) || a.AppCode.ToLower().Contains(jTablePara.Code.ToLower()))
                            //    && (string.IsNullOrEmpty(jTablePara.Title) || a.AppTitle.ToLower().Contains(jTablePara.Title.ToLower()))
                        select new
                        {
                            a.Id,
                            a.CalendarDay,
                            a.LunarDay,
                            a.DayOfWeek,
                            a.Note,
                            a.CreatedBy,
                            a.CreatedTime
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "CalendarDay", "LunarDay", "DayOfWeek", "Note", "CreatedBy", "CreatedTime");
            return Json(jdata);
        }

        [HttpGet]
        public object GetLunar(string day)
        {
            var date = DateTime.ParseExact(day, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var dayLunar = LunarYearTools.SolarToLunar(date);
            var result = dayLunar.Day + "/" + dayLunar.Month + "/" + dayLunar.Year;
            return result;
        }

        [HttpGet]
        public object GetDayOfWeek(string day)
        {
            var date = DateTime.ParseExact(day, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var dayOfWeek = date.DayOfWeek;
            return dayOfWeek;
        }

        [HttpGet]
        public JsonResult GetItem(int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            var data = _context.HolidayDates.FirstOrDefault(x => x.Id == id);
            if (data != null)
            {
                var model = new HolidayModel
                {
                    Id = data.Id,
                    CalendarDay = data.CalendarDay.ToString("dd/MM/yyyy"),
                    LunarDay = data.LunarDay.ToString("dd/MM/yyyy"),
                    DayOfWeek = data.DayOfWeek,
                    Note = data.Note,
                };
                msg.Object = model;
            }
            else
            {
                msg.Error = true;
                msg.Title = "Không tồn tại dữ liệu";
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Insert([FromBody]HolidayModel obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var holiday = new HolidayDate
                {
                    CalendarDay = DateTime.ParseExact(obj.CalendarDay, "dd/MM/yyyy", CultureInfo.InvariantCulture),
                    LunarDay = DateTime.ParseExact(obj.LunarDay, "dd/MM/yyyy", CultureInfo.InvariantCulture),
                    DayOfWeek = obj.DayOfWeek,
                    Note = obj.Note,
                    CreatedTime = DateTime.Now
                };
                _context.HolidayDates.Add(holiday);
                _context.SaveChanges();
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_ADD_SUCCESS"), CommonUtil.ResourceValue("ADM_DAYOFF_TITLE_INFORMATION_DAYOFF"));
         
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_ADD_FAILED"), CommonUtil.ResourceValue("ADM_DAYOFF_TITLE_INFORMATION_DAYOFF"));
          
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Update([FromBody]HolidayModel obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = _context.HolidayDates.FirstOrDefault(x => x.Id == obj.Id);
                if (data != null)
                {
                    data.CalendarDay = DateTime.ParseExact(obj.CalendarDay, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                    data.LunarDay =  DateTime.ParseExact(obj.LunarDay, "dd/MM/yyyy", CultureInfo.InvariantCulture) ;
                    data.DayOfWeek = obj.DayOfWeek;
                    data.Note = obj.Note;
                    _context.SaveChanges();
                    // msg.Title = "Cập nhập ngày nghỉ thành công!";
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_UPDATE_SUCCESS"), CommonUtil.ResourceValue("ADM_DAYOFF_TITLE_INFORMATION_DAYOFF"));
                }
                else
                {
                    msg.Error = true;
                    // msg.Title = "Không tồn tại ngày nghỉ!";
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_NOT_EXITS"), CommonUtil.ResourceValue("ADM_DAYOFF_TITLE_INFORMATION_DAYOFF"));
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                // msg.Title = "Cập nhập ngày nghỉ lỗi";
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_UPDATE_FAILED"), CommonUtil.ResourceValue("ADM_DAYOFF_TITLE_INFORMATION_DAYOFF"));
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Delete([FromBody]int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = _context.HolidayDates.FirstOrDefault(x => x.Id == id);
                if (data != null)
                {
                    _context.HolidayDates.Remove(data);
                    _context.SaveChanges();
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_SUCCESS"), CommonUtil.ResourceValue("ADM_DAYOFF_TITLE_INFORMATION_DAYOFF"));
                    //msg.Title = "Xóa ngày nghỉ thành công!";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_NOT_EXITS"), CommonUtil.ResourceValue("ADM_DAYOFF_TITLE_INFORMATION_DAYOFF"));
                   // msg.Title = "Ngày nghỉ không tồn tại!";

                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_FAIL"), CommonUtil.ResourceValue("ADM_DAYOFF_TITLE_INFORMATION_DAYOFF"));
               // msg.Title = "Có lỗi xảy ra khi xóa!";
            }
            return Json(msg);
        }
    }
    public class HolidayModel
    {
        public int Id { get; set; }
        public string CalendarDay { get; set; }

        public string LunarDay { get; set; }

        public int DayOfWeek { get; set; }

        public string Note { get; set; }
    }
}