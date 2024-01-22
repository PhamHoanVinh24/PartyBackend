using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class EDMSSOSController : BaseController
    {
        private readonly EIMDBContext _context;

        public EDMSSOSController(EIMDBContext context)
        {
            _context = context;
        }

        public IActionResult Index()
        {
            return View();
        }

        #region Thùng hồ sơ hủy
        [HttpPost]
        public JsonResult JTableBoxRemove([FromBody]JTableModel jTablePara)
        {
            try
            {
                int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
                var dtNow = DateTime.Now;
                var query = from a in _context.EDMSRemoveBoxs.Where(x => !x.IsDeleted)
                            join g in _context.EDMSRemoves.Where(x => !x.IsDeleted && x.Status == "REMOVE_PENDING") on a.RemoveId equals g.Id
                            join b in _context.EDMSBoxs on a.BoxId equals b.Id
                            select new EDMSSOSModel
                            {
                                Id = a.BoxId,
                                BoxCode = b.BoxCode,
                                NumBoxth = b.NumBoxth,
                                FromDate = g.FromDate.HasValue ? g.FromDate.Value.ToString("dd/MM/yyyy") : "",
                                ToDate = g.ToDate.HasValue ? g.ToDate.Value.ToString("dd/MM/yyyy") : "",
                                LevelWarning = (g.FromDate.HasValue && g.ToDate.HasValue)
                                                    ? g.FromDate.Value < dtNow
                                                        ? 2
                                                        : g.FromDate.Value < dtNow.AddDays(3)
                                                            ? 3
                                                            : g.FromDate.Value < dtNow.AddDays(7)
                                                                ? 4
                                                                : 5
                                                    : 1
                            };

                var count = query.Count();
                var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).ToList();
                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "BoxCode", "NumBoxth", "FromDate", "ToDate", "LevelWarning");
                return Json(jdata);
            }
            catch (Exception ex)
            {
                var jdata = JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "Id", "BoxCode", "NumBoxth", "FromDate", "ToDate", "LevelWarning");
                return Json(jdata);
            }
        }

        [HttpPost]
        public JsonResult GetCountBoxRemove()
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var count = (from a in _context.EDMSRemoveBoxs.Where(x => !x.IsDeleted)
                             join g in _context.EDMSRemoves.Where(x => !x.IsDeleted && x.Status == "REMOVE_PENDING") on a.RemoveId equals g.Id
                             join b in _context.EDMSBoxs on a.BoxId equals b.Id
                             select new
                             {
                                 Id = a.Id,
                             })
                            .Count();

                msg.Object = count;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("Có lỗi khi lấy dữ liệu"));
            }
            return Json(msg);
        }
        #endregion

        #region Thùng hồ sơ xử lý mối mọt
        [HttpPost]
        public JsonResult JTableBoxTermite([FromBody]JTableModel jTablePara)
        {
            try
            {
                int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
                var dtNow = DateTime.Now;
                var query = from a in _context.EDMSTermiteBoxs.Where(x => !x.IsDeleted)
                            join g in _context.EDMSTermites.Where(x => !x.IsDeleted && x.Status == "TERMITE_PENDING") on a.TermiteId equals g.Id
                            join b in _context.EDMSBoxs on a.BoxId equals b.Id
                            select new EDMSSOSModel
                            {
                                Id = a.BoxId,
                                BoxCode = b.BoxCode,
                                NumBoxth = b.NumBoxth,
                                FromDate = g.FromDate.HasValue ? g.FromDate.Value.ToString("dd/MM/yyyy") : "",
                                ToDate = g.ToDate.HasValue ? g.ToDate.Value.ToString("dd/MM/yyyy") : "",
                                LevelWarning = (g.FromDate.HasValue && g.ToDate.HasValue)
                                                    ? g.FromDate.Value < dtNow
                                                        ? 2
                                                        : g.FromDate.Value < dtNow.AddDays(3)
                                                            ? 3
                                                            : g.FromDate.Value < dtNow.AddDays(7)
                                                                ? 4
                                                                : 5
                                                    : 1
                            };

                var count = query.Count();
                var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).ToList();
                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "BoxCode", "NumBoxth", "FromDate", "ToDate", "LevelWarning");
                return Json(jdata);
            }
            catch (Exception ex)
            {
                var jdata = JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "Id", "BoxCode", "NumBoxth", "FromDate", "ToDate", "LevelWarning");
                return Json(jdata);
            }
        }
        [HttpPost]
        public JsonResult GetCountBoxTermite()
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var count = (from a in _context.EDMSTermiteBoxs.Where(x => !x.IsDeleted)
                             join g in _context.EDMSTermites.Where(x => !x.IsDeleted && x.Status == "TERMITE_PENDING") on a.TermiteId equals g.Id
                             join b in _context.EDMSBoxs on a.BoxId equals b.Id
                             select new
                             {
                                 Id = a.Id,
                             })
                            .Count();

                msg.Object = count;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("Có lỗi khi lấy dữ liệu"));
            }
            return Json(msg);
        }
        #endregion


        #region Nhiệt độ, độ ẩm
        [HttpPost]
        public JsonResult JTableFloorTempHum([FromBody]JTableModel jTablePara)
        {
            try
            {
                int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
                var temp = 35;
                var hum = 79;
                var query = from a in _context.EDMSFloors
                            where (!string.IsNullOrEmpty(a.Humidity) && !string.IsNullOrEmpty(a.Temperature) && (decimal.Parse(a.Humidity) > hum || decimal.Parse(a.Temperature) > temp))
                            select new
                            {
                                Id = a.Id,
                                FloorCode = a.FloorCode,
                                FloorName = a.FloorName,
                                Temperature = a.Temperature,
                                Humidity = a.Humidity,
                                LevelWarningTemp = LevelWarningTemp(a.Temperature),
                                LevelWarningHum = LevelWarningHum(a.Humidity)
                            };

                var count = query.Count();
                var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).ToList();
                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "FloorCode", "FloorName", "Temperature", "Humidity", "LevelWarningTemp", "LevelWarningHum");
                return Json(jdata);
            }
            catch (Exception ex)
            {
                var jdata = JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "Id", "FloorCode", "FloorName", "Temperature", "Humidity", "LevelWarningTemp", "LevelWarningHum");
                return Json(jdata);
            }
        }

        [HttpPost]
        public JsonResult GetCountFloorTempHum()
        {
            try
            {
                var temp = 35;
                var hum = 79;
                var query = from a in _context.EDMSFloors
                            where (!string.IsNullOrEmpty(a.Humidity) && !string.IsNullOrEmpty(a.Temperature) && (decimal.Parse(a.Humidity) > hum || decimal.Parse(a.Temperature) > temp))
                            select new
                            {
                                Id = a.Id,
                                FloorCode = a.FloorCode,
                                FloorName = a.FloorName
                            };

                var count = query.Count();
                return Json(count);
            }
            catch (Exception ex)
            {
                return Json(0);
            }
        }
        #endregion

        [HttpPost]
        public JsonResult GetItem(int Id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = (from b in _context.EDMSBoxs.Where(x => x.Id == Id)
                            join c1 in _context.EDMSRacks on b.RackCode equals c1.RackCode into c2
                            from c in c2.DefaultIfEmpty()
                            join d1 in _context.EDMSLines on b.LineCode equals d1.LineCode into d2
                            from d in d2.DefaultIfEmpty()
                            join e1 in _context.EDMSFloors on b.FloorCode equals e1.FloorCode into e2
                            from e in e2.DefaultIfEmpty()
                            join f1 in _context.EDMSWareHouses.Where(x => x.WHS_Flag != true && x.Type == "RV") on b.WHS_Code equals f1.WHS_Code into f2
                            from f in f2.DefaultIfEmpty()
                            select new
                            {
                                WHS_Name = f.WHS_Name,
                                WHS_ADDR_Text = f.WHS_ADDR_Text,
                                FloorName = e.FloorName,
                                L_Text = d.L_Text,
                                RackName = c.RackName,
                                BoxCode = b.BoxCode,
                                NumBoxth = b.NumBoxth,
                                TypeProfile = b.TypeProfile != null
                                                ? _context.CommonSettings.Any(x => x.SettingID == int.Parse(b.TypeProfile))
                                                    ? _context.CommonSettings.FirstOrDefault(x => x.SettingID == int.Parse(b.TypeProfile)).ValueSet
                                                    : null
                                                : null,
                                StorageTime = b.StorageTime.HasValue ? (b.StorageTime.Value).ToString("dd/MM/yyyy") : null,
                                BranchName = string.IsNullOrEmpty(b.DepartCode)
                                                    ? _context.AdOrganizations.Any(x => (x.OrgAddonCode.Equals(b.DepartCode)) && x.IsEnabled)
                                                        ? _context.AdOrganizations.FirstOrDefault(x => (x.OrgAddonCode.Equals(b.DepartCode)) && x.IsEnabled).OrgName
                                                        : "Chưa khai báo"
                                                    : "Chưa khai báo",
                                Date = b.StartTime.HasValue && b.EndTime.HasValue ? (b.StartTime.Value).ToString("dd/MM/yyyy") + " - " + (b.EndTime.Value).ToString("dd/MM/yyyy") : null,
                                RackPosition = b.RackPosition,
                            })
                            .FirstOrDefault();
                if (data != null)
                {
                    msg.Object = data;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("Bản ghi không tồn tại hoặc đã bị xóa")); //"Không tồn tại dữ liệu!";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("Có lỗi khi lấy dữ liệu")); //"Có lỗi khi lấy dữ liệu!"; 
            }
            return Json(msg);
        }

        //Tạo mã QR_Code
        [HttpPost]
        public byte[] GeneratorQRCode(string code)
        {
            return CommonUtil.GeneratorQRCode(code);
        }

        public string LevelWarningTemp(string data)
        {
            var temp = decimal.Parse(data);
            var sosLevel = "5";
            if (temp > 40 && temp <= 45)
                sosLevel = "1";

            if (temp > 45 && temp <= 55)
                sosLevel = "2";

            if (temp > 55 && temp <= 85)
                sosLevel = "3";

            if (temp > 85)
                sosLevel = "4";

            return sosLevel;
        }

        public string LevelWarningHum(string data)
        {
            var temp = decimal.Parse(data);
            var sosLevel = "1";
            if (temp >= 80 && temp <= 85)
                sosLevel = "1";

            if (temp > 85 && temp <= 90)
                sosLevel = "2";

            if (temp > 90 && temp <= 95)
                sosLevel = "3";

            if (temp > 95)
                sosLevel = "4";

            return sosLevel;
        }

    }
    public class EDMSSOSModel
    {
        public int Id { get; set; }
        public string BoxCode { get; set; }
        public string NumBoxth { get; set; }
        public string FromDate { get; set; }
        public string ToDate { get; set; }
        public int LevelWarning { get; set; }
    }
}