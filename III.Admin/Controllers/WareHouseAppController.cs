using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Caching.Memory;
using System.IO;
using Syncfusion.EJ2.PdfViewer;
using Newtonsoft.Json;
using System.Drawing;
//using SautinSoft;
using Syncfusion.EJ2.Spreadsheet;
using Syncfusion.XlsIO;
using Microsoft.AspNetCore.Http.Internal;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Cors;
using ESEIM.Models;
using ESEIM.Utils;
using ESEIM;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;

namespace III.Admin.Controllers
{
    public class WareHouseAppController : Controller
    {
        private readonly UserManager<AspNetUser> _userManager;
        private readonly RoleManager<AspNetRole> _roleManager;
        private readonly EIMDBContext _context;
        //private readonly PackageDbContext _packageContext;
        private readonly AppSettings _appSettings;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IUploadService _uploadService;
        private readonly IActionLogService _actionLog;
        private readonly IFCMPushNotification _notification;
        private readonly IGoogleApiService _googleAPI;

        //var session = HttpContext.GetSessionUser();

        public WareHouseAppController(IOptions<AppSettings> appSettings, EIMDBContext context, UserManager<AspNetUser> userManager, RoleManager<AspNetRole> roleManager, IActionLogService actionLog, IHostingEnvironment hostingEnvironment, IUploadService uploadService, IFCMPushNotification notification, IGoogleApiService googleAPI)
        {
            _userManager = userManager;
            _context = context;
            _roleManager = roleManager;
            _appSettings = appSettings.Value;
            _actionLog = actionLog;
            _hostingEnvironment = hostingEnvironment;
            _uploadService = uploadService;
            _notification = notification;
            _googleAPI = googleAPI;
        }

        public IActionResult Index()
        {
            return View();
        }
        [HttpGet]
        public object GetListWareHouse()
        {
            try
            {
                var rs = _context.ZoneStructs.Where(x => !x.IsDeleted && x.ZoneLevel != null && x.ZoneLevel == 0)
                                                        .Select(p => new
                                                        {
                                                            Code = p.ZoneCode,
                                                            Name = p.ZoneName
                                                        }).ToList();
                return Json(rs);
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }

        [HttpGet]
        public object GetListFloorByWareHouseCode(string wareHouseCode)
        {
            try
            {
                var rs = _context.ZoneStructs.Where(x => !x.IsDeleted && x.ZoneLevel != null && x.ZoneLevel == 1 && x.ZoneParent.Equals(wareHouseCode))
                                                        .Select(p => new
                                                        {
                                                            Code = p.ZoneCode,
                                                            Name = p.ZoneName,
                                                            Active = false
                                                        }).ToList();
                return Json(rs);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        [HttpGet]
        public object GetListLineByFloorCode(string floorCode)
        {
            try
            {
                var rs = _context.ZoneStructs.Where(x => !x.IsDeleted && x.ZoneType.Equals("LINE") && x.ZoneParent.Equals(floorCode))
                                                        .Select(p => new
                                                        {
                                                            Code = p.ZoneCode,
                                                            Name = p.ZoneName
                                                        }).ToList();
                return Json(rs);
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }
        [HttpGet]
        public object GetListChildByFloorCode(string floorCode)
        {
            try
            {
                var listFile = from a in _context.RecordsPackFiles.Where(x => !x.IsDeleted)
                               join b in _context.RecordsPacks.Where(x => !x.IsDeleted) on a.PackCode equals b.PackCode
                               select b;

                var rs = from a in _context.ZoneStructs.ToList().Where(x => !x.IsDeleted && (x.ZoneType.Equals("RACK") || x.ZoneType.Equals("LINE") || x.ZoneType.Equals("CABINET")) && x.ZoneHierachy.Split("/", StringSplitOptions.None).Any(p => p.Equals(floorCode)))
                         let fileCount = listFile.Count(x => !x.IsDeleted && x.PackZoneLocation.Equals(a.ZoneCode))
                         select new
                         {
                             a.ZoneCode,
                             a.ZoneName,
                             a.ID,
                             a.ZoneType,
                             a.ZoneGroup,
                             a.ZoneLabel,
                             a.ShapeData,
                             FileCount = fileCount
                         };
                return Json(rs);
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }

        [HttpGet]
        public object GetListCabinet(string floorCode)
        {
            try
            {
                var rs = from a in _context.EDMSRackDocuments
                         join b in _context.EDMSLineDocuments on a.LineCode equals b.LineCode
                         join c in _context.EDMSFloorDocuments on b.FloorCode equals c.FloorCode
                         join d in _context.ObjectiverPackCovers.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.Located)) on a.RackCode equals d.Located
                         where c.FloorCode.Equals(floorCode)
                         select d;

                return Json(rs);
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }

    }
}
