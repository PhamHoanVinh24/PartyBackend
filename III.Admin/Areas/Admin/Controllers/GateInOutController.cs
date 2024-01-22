using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Utils;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using ESEIM.Models;
using Syncfusion.EJ2.Linq;
using System.Collections.Generic;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class GateInOutController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IStringLocalizer<DashBoardController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IRepositoryService _repositoryService;

        public GateInOutController(EIMDBContext context, IStringLocalizer<DashBoardController> stringLocalizer,
            IStringLocalizer<SharedResources> sharedResources, IRepositoryService repositoryService)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
            _repositoryService = repositoryService;
        }

        public IActionResult Index()
        {
            return View();
        }

        #region Get data Zone and device IOT
        [HttpPost]
        public JsonResult GetInfoZone()
        {
            var listInfoZone = new List<InfoZoneDevice>();
            var zoneSetup = _context.ZoneSetups.Where(x => !x.IsDeleted);
            foreach (var item in zoneSetup)
            {
                var devices = (from a in _context.ZoneDevicePlacements.Where(x => !x.IsDeleted && x.ZoneCode.Equals(item.ZoneCode))
                              join b in _context.IotDeviceInfos.Where(x => !x.IsDeleted) on a.DeviceCode equals b.DeviceCode
                              select new InfoDevice
                              {
                                  Id = b.ID,
                                  DeviceCode = b.DeviceCode,
                                  DeviceName = b.DeviceName,
                                  DeviceSvg = !string.IsNullOrEmpty(b.DeviceSvg) ? b.DeviceSvg : ""
                              }).ToList();

                var zoneDevice = new InfoZoneDevice
                {
                    Id = item.ID,
                    ZoneCode = item.ZoneCode,
                    ZoneName = item.ZoneName,
                    ListDevice = devices
                };
                listInfoZone.Add(zoneDevice);
            }
            return Json(listInfoZone);
        }

        [HttpPost]
        public JsonResult GetZone()
        {
            var zones = _context.ZoneSetups.Where(x => !x.IsDeleted).Select(x => new { x.ZoneCode, x.ZoneName});
            return Json(zones);
        }

        [HttpPost]
        public JsonResult GetDeviceInZone(string zoneCode)
        {
            var devices = (from a in _context.ZoneDevicePlacements.Where(x => !x.IsDeleted && x.ZoneCode.Equals(zoneCode))
                           join b in _context.IotDeviceInfos.Where(x => !x.IsDeleted) on a.DeviceCode equals b.DeviceCode
                           select new InfoDevice
                           {
                               Id = b.ID,
                               DeviceCode = b.DeviceCode,
                               DeviceName = b.DeviceName,
                               DeviceSvg = !string.IsNullOrEmpty(b.DeviceSvg) ? b.DeviceSvg : ""
                           });
            return Json(devices);
        }

        public class InfoDevice
        {
            public int Id { get; set; }
            public string DeviceCode { get; set; }
            public string DeviceName { get; set; }
            public string DeviceSvg { get; set; }
        }

        public class InfoZoneDevice
        {
            public InfoZoneDevice()
            {
                ListDevice = new List<InfoDevice>();
            }
            public int Id { get; set; }
            public string ZoneCode { get; set; }
            public string ZoneName { get; set; }
            public List<InfoDevice> ListDevice { get; set; }
        }
        #endregion

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion
    }
}