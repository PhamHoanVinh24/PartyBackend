using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using Microsoft.Extensions.Options;
using ESEIM;
using Newtonsoft.Json.Linq;
using Microsoft.Extensions.Localization;
using System.Globalization;
using Microsoft.AspNetCore.Http;
using System.IO;
using Microsoft.AspNetCore.Hosting;
using SmartBreadcrumbs.Attributes;
using III.Domain.Enums;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class ZoneSetupController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly AppSettings _appSettings;
        private readonly IUploadService _upload;
        private readonly IStringLocalizer<CameraListController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;

        public ZoneSetupController(EIMDBContext context, IUploadService upload, IOptions<AppSettings> appSettings, IStringLocalizer<CameraListController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _upload = upload;
            _appSettings = appSettings.Value;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }
        [Breadcrumb("Khu vực", AreaName = "Admin", FromAction = "Index", FromController = typeof(DashBoardController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            return View("Index");
        }

        #region Combo box
        [HttpPost]
        public JsonResult GetZoneStatus()
        {
            var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals(EnumHelper<IotEnum>.GetDisplayValue(IotEnum.ZoneStatus)))
                        .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return Json(data);
        }
        #endregion

        #region Index

        [HttpPost]
        public object JTable([FromBody]ZoneSetupModel jtablePara)
        {
            int intBeginFor = (jtablePara.CurrentPage - 1) * jtablePara.Length;

            var query = from a in _context.ZoneSetups.Where(x => !x.IsDeleted)
                        where (string.IsNullOrEmpty(jtablePara.ZoneAddress) || a.ZoneAddressTxt.Contains(jtablePara.ZoneAddress))
                        && (string.IsNullOrEmpty(jtablePara.ZoneStatus) || a.ZoneStatus.Equals(jtablePara.ZoneStatus))
                        && (string.IsNullOrEmpty(jtablePara.ZoneName) || (a.ZoneName.Contains(jtablePara.ZoneName) || a.ZoneCode.Contains(jtablePara.ZoneName)))
                        select new
                        {
                            Id = a.ID,
                            a.ZoneCode,
                            a.ZoneName,
                            ZoneStatus = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(a.ZoneStatus)).ValueSet ?? "",
                            ZoneDesc = !string.IsNullOrEmpty(a.ZoneDesc) ? a.ZoneDesc : "",
                            ZoneImage = !string.IsNullOrEmpty(a.ZoneImage) ? a.ZoneImage : "",
                            ZoneAddressTxt = !string.IsNullOrEmpty(a.ZoneAddressTxt) ? a.ZoneAddressTxt : ""
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jtablePara.QueryOrderBy).Skip(intBeginFor).Take(jtablePara.Length).ToList();
            var jdata = JTableHelper.JObjectTable(data, jtablePara.Draw, count, "Id", "ZoneCode", "ZoneName", "ZoneStatus", "ZoneDesc",
                    "ZoneImage", "ZoneAddressTxt");
            return Json(jdata);
        }

        [HttpPost]
        public object GetDepartment()
        {
            var data = _context.AdDepartments.Where(x => !x.IsDeleted && x.IsEnabled).Select(x => new { Code = x.DepartmentCode, Name = x.Title }).ToList();
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetItem(int id)
        {
            var getItem = _context.ZoneSetups.FirstOrDefault(x => x.ID == id);
            return Json(getItem);
        }

        public JsonResult Insert(ZoneSetup data, IFormFile images)
        {
            var msg = new JMessage { Title = "", Error = false };
            try
            {
                var checkZone = _context.ZoneSetups.FirstOrDefault(x => !x.IsDeleted && x.ZoneCode.Equals(data.ZoneCode));
                if (checkZone != null)
                {
                    msg.Title = "Mã khu vực đã tồn tại";
                    msg.Error = true;
                    return Json(msg);
                }

                if (images != null)
                {
                    var upload = _upload.UploadImage(images);
                    if (upload.Error)
                    {
                        msg.Error = true;
                        msg.Title = upload.Title;
                        return Json(msg);
                    }
                    else
                    {
                        data.ZoneImage = "/uploads/Images/" + upload.Object.ToString();
                    }
                }
                data.CreatedTime = DateTime.Now;
                data.CreatedBy = ESEIM.AppContext.UserName;

                _context.ZoneSetups.Add(data);
                _context.SaveChanges();
                msg.Title = _sharedResources["COM_ADD_SUCCESS"];
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Update(ZoneSetup data, IFormFile images)
        {
            var msg = new JMessage { Title = "", Error = false };
            try
            {
                var model = _context.ZoneSetups.FirstOrDefault(x => x.ZoneCode.Equals(data.ZoneCode) && !x.IsDeleted);
                if (model == null)
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["Khu vực không tồn tại"];
                }
                else
                {
                    if (images != null)
                    {
                        var upload = _upload.UploadImage(images);
                        if (upload.Error)
                        {
                            msg.Error = true;
                            msg.Title = upload.Title;
                            return Json(msg);
                        }
                        else
                        {
                            data.ZoneImage = "/uploads/Images/" + upload.Object.ToString();
                        }
                    }
                    else
                    {
                        data.ZoneImage = model.ZoneImage;
                    }

                    model.ZoneName = data.ZoneName;
                    model.ZoneImage = data.ZoneImage;
                    model.UpdatedBy = ESEIM.AppContext.UserName;
                    model.UpdatedTime = DateTime.Now;
                    model.ZoneStatus = data.ZoneStatus;
                    model.ZoneDesc = data.ZoneDesc;
                    model.ZoneAddressGps = data.ZoneAddressGps;
                    model.ZoneAddressTxt = !string.IsNullOrEmpty(data.ZoneAddressTxt) ? data.ZoneAddressTxt : "";

                    _context.ZoneSetups.Update(model);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_ERR_ADD"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Delete(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.ZoneSetups.FirstOrDefault(x => x.ID == id);
                if(data != null)
                {
                    data.IsDeleted = true;
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;

                    _context.ZoneSetups.Update(data);
                    _context.SaveChanges();

                    msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Khu vực không tồn tại";
                }
            }
            catch (Exception ex)
            {
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Error = true;
            }
            return Json(msg);
        }

        public class ZoneSetupModel : JTableModel
        {
            public string ZoneName { get; set; }
            public string ZoneAddress { get; set; }
            public string ZoneStatus { get; set; }
        }

        #endregion

        #region Device
        [HttpPost]
        public JsonResult GetDeviceIOT()
        {
            var data = _context.IotDeviceInfos.Where(x => !x.IsDeleted).Select(x => new { Code = x.DeviceCode, Name = x.DeviceName });
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetDeviceInZone(string zoneCode)
        {
            var query = from a in _context.IotDeviceInfos.Where(x => !x.IsDeleted)
                        join b in _context.ZoneDevicePlacements.Where(x => !x.IsDeleted && x.ZoneCode.Equals(zoneCode)) on a.DeviceCode equals b.DeviceCode
                        join c in _context.Users on b.ManagerId equals c.UserName into c1
                        from c in c1.DefaultIfEmpty()
                        select new
                        {
                            Id = b.ID,
                            DeviceName = a.DeviceName,
                            BeginTime = b.BeginTime.HasValue ? b.BeginTime.Value.ToString("dd/MM/yyyy") : "",
                            EndTime = b.EndTime.HasValue ? b.EndTime.Value.ToString("dd/MM/yyyy") : "",
                            Status = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(b.Status)).ValueSet ?? "",
                            Manager = c != null ? c.GivenName : "",
                            Position = b.Position
                        };
            return Json(query);
        }

        [HttpPost]
        public JsonResult AssignDeviceToZone([FromBody] ZoneDevice obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var checkOutZone = _context.ZoneDevicePlacements.FirstOrDefault(x => !x.IsDeleted 
                    && x.DeviceCode.Equals(obj.DeviceCode) && !x.ZoneCode.Equals(obj.ZoneCode));
                if(checkOutZone != null)
                {
                    msg.Error = true;
                    msg.Title = "Thiết bị đã được thêm vào khu vực khác";
                    return Json(msg);
                }
                var checkInZone = _context.ZoneDevicePlacements.FirstOrDefault(x => !x.IsDeleted
                    && x.DeviceCode.Equals(obj.DeviceCode) && x.ZoneCode.Equals(obj.ZoneCode));
                if (checkInZone != null)
                {
                    msg.Error = true;
                    msg.Title = "Thiết bị đã được thêm vào khu vực";
                    return Json(msg);
                }

                var fromDate = !string.IsNullOrEmpty(obj.BeginTime) ? DateTime.ParseExact(obj.BeginTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var toDate = !string.IsNullOrEmpty(obj.EndTime) ? DateTime.ParseExact(obj.EndTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

                var zoneDevice = new ZoneDevicePlacement
                {
                    ZoneCode = obj.ZoneCode,
                    DeviceCode = obj.DeviceCode,
                    ManagerId = obj.ManagerId,
                    Position = obj.Position,
                    Status = obj.Status,
                    BeginTime = fromDate,
                    EndTime = toDate,
                    CreatedBy = ESEIM.AppContext.UserName,
                    CreatedTime = DateTime.Now
                };
                _context.ZoneDevicePlacements.Add(zoneDevice);
                _context.SaveChanges();
                msg.Title = _sharedResources["COM_ADD_SUCCESS"];
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult DeleteDeviceInZone(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.ZoneDevicePlacements.FirstOrDefault(x => x.ID == id);
                if(data != null)
                {
                    data.IsDeleted = true;
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    _context.ZoneDevicePlacements.Update(data);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Thiết bị không tồn tại";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        public class ZoneDevice
        {
            public string ZoneCode { get; set; }
            public string DeviceCode { get; set; }
            public string Position { get; set; }
            public string Status { get; set; }
            public string ManagerId { get; set; }
            public string BeginTime { get; set; }
            public string EndTime { get; set; }
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
    }
}
