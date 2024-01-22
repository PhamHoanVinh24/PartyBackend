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
    public class DashBoardAssetController : Controller
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

        public DashBoardAssetController(IOptions<AppSettings> appSettings, EIMDBContext context, UserManager<AspNetUser> userManager, RoleManager<AspNetRole> roleManager, IActionLogService actionLog, IHostingEnvironment hostingEnvironment, IUploadService uploadService, IFCMPushNotification notification, IGoogleApiService googleAPI)
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
        public JsonResult GetCountAsset()
        {
            var data = _context.AssetMains.Where(x => !x.IsDeleted).ToList();
            var active = data.Where(x => x.Status == "ACTIVE").ToList();
            var Mainten = data.Where(x => x.Status == "MAINTEN").ToList();
            var Delete = data.Where(x => x.Status == "DELETE").ToList();

            foreach (var item in data)
            {
                item.Cost = item.Cost!=null? item.Cost * (_context.FundExchagRates.FirstOrDefault(x => !x.IsDeleted && x.Currency == item.Currency)).Rate:0;
            }
            foreach (var item in active)
            {
                item.Cost = item.Cost != null ? item.Cost * (_context.FundExchagRates.FirstOrDefault(x => !x.IsDeleted && x.Currency == item.Currency)).Rate:0;
            }
            foreach (var item in Mainten)
            {
                item.Cost = item.Cost != null ? item.Cost * (_context.FundExchagRates.FirstOrDefault(x => !x.IsDeleted && x.Currency == item.Currency)).Rate:0;
            }
            foreach (var item in Delete)
            {
                item.Cost = item.Cost != null ? item.Cost * (_context.FundExchagRates.FirstOrDefault(x => !x.IsDeleted && x.Currency == item.Currency)).Rate:0;
            }
            var query = new
            {
                sumasset = data.Count(),
                assetActive = active.Count(),
                assetMainten = Mainten.Count(),
                assetDelete = Delete.Count(),

                SumValueAsset = data.Sum(x => x.Cost),
                ValueAssetActive = active.Sum(x => x.Cost),
                ValueAssetMainten = Mainten.Sum(x => x.Cost),
                ValueAssetDelete = Delete.Sum(x => x.Cost),
            };



            return Json(query);
        }

        [HttpGet]
        public object AmchartAsset()
        {
            var timeNowYear = DateTime.Now.Year;
            var data = _context.AssetMains.Where(a => !a.IsDeleted && a.CreatedTime.Value.Year == timeNowYear)
             .Select(p => new
             {
                 Month = p.CreatedTime.Value.Month,
                 //sum = _context.Projects.Where(x => !x.FlagDeleted && x.CreatedTime.Value.Month.Equals(p.CreatedTime.Value.Month)).Count()
             }).GroupBy(x => new { x.Month })
             .Select(p => new
             {
                 Month = p.First().Month,
                 sum = p.Count(),
                 active = _context.AssetMains.Where(x => !x.IsDeleted && x.Status == "ACTIVE" && x.CreatedTime.Value.Month.Equals(p.First().Month)).Count(),
                 mainten = _context.AssetMains.Where(x => !x.IsDeleted && x.Status == "MAINTEN" && x.CreatedTime.Value.Month.Equals(p.First().Month)).Count(),
                 cancel = _context.AssetMains.Where(x => !x.IsDeleted && x.Status == "CANCEL" && x.CreatedTime.Value.Month.Equals(p.First().Month)).Count(),
             }).OrderBy(p => p.Month).ToList();


            return data;
        }


    }
}
