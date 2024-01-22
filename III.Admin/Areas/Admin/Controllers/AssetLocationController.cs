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
    public class AssetLocationController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly AppSettings _appSettings;
        private readonly IUploadService _upload;
        private readonly IStringLocalizer<AssetLocationController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;

        public AssetLocationController(EIMDBContext context, IUploadService upload, IOptions<AppSettings> appSettings,
            IStringLocalizer<AssetLocationController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _upload = upload;
            _appSettings = appSettings.Value;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }
        [Breadcrumb("ViewData.CrumbAssetLocation", AreaName = "Admin", FromAction = "Index", FromController = typeof(DashBoardController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuAsset"] = _sharedResources["COM_CRUMB_ASSET_OPERATION"];
            ViewData["CrumbAssetLocation"] = _stringLocalizer["ALC_CRUMB_ASSET_LOCATION"];
            return View();
        }

        #region Index
        [HttpPost]
        public JsonResult JTable([FromBody]ModelAssetLocation jTablepara)
        {
            int intBeginFor = (jTablepara.CurrentPage - 1) * jTablepara.Length;
            var query = from a in _context.AssetMains.Where(x => !x.IsDeleted)
                        join b in _context.AssetEntityMappings.Where(x => !x.IsDeleted) on a.AssetCode equals b.AssetCode into b1
                        from b in b1.DefaultIfEmpty()
                        join c in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Status equals c.CodeSet into c1
                        from c in c1.DefaultIfEmpty()
                        join d in _context.EDMSWareHouseAssets.Where(x => !x.WHS_Flag) on b.WHS_Code equals d.WHS_Code into d1
                        from d in d1.DefaultIfEmpty()
                        join e in _context.EDMSFloorAssets on b.FloorCode equals e.FloorCode into e1
                        from e in e1.DefaultIfEmpty()
                        join f in _context.EDMSLineAssets on b.LineCode equals f.LineCode into f1
                        from f in f1.DefaultIfEmpty()
                        join g in _context.EDMSRackAssets on b.RackCode equals g.RackCode into g1
                        from g in g1.DefaultIfEmpty()
                        where (string.IsNullOrEmpty(jTablepara.WHS_Code) || b.WHS_Code.Equals(jTablepara.WHS_Code))
                        && (string.IsNullOrEmpty(jTablepara.FloorCode) || b.FloorCode.Equals(jTablepara.FloorCode))
                        && (string.IsNullOrEmpty(jTablepara.LineCode) || b.LineCode.Equals(jTablepara.LineCode))
                        && (string.IsNullOrEmpty(jTablepara.RackCode) || b.RackCode.Equals(jTablepara.RackCode))
                        && (string.IsNullOrEmpty(jTablepara.RackPosition) || b.RackPosition.Contains(jTablepara.RackPosition))
                        select new
                        {
                            a.AssetID,
                            IdMapping = b != null ? b.Id : 0,
                            Asset = a.AssetCode + " - " + a.AssetName,
                            a.AssetCode,
                            Status = c != null ? c.ValueSet : "",
                            Postion = b != null ? (d.WHS_Name + ", " + e.FloorName + ", " + f.L_Text + ", " + (g != null ? g.RackName : "") + ", Vị trí: " +b.RackPosition) : ""
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablepara.QueryOrderBy).Skip(intBeginFor).Take(jTablepara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablepara.Draw, count, "AssetID", "AssetCode", "IdMapping", "Asset", "Status", "Postion");
            return Json(jdata);
        }

        public class ModelAssetLocation : JTableModel
        {
            public string AssetCode { get; set; }
            public string WHS_Code { get; set; }
            public string FloorCode { get; set; }
            public string LineCode { get; set; }
            public string RackCode { get; set; }
            public string RackPosition { get; set; }
        }

        [HttpPost]
        public JsonResult GetAsset()
        {
            var data = _context.AssetMains.Where(x => !x.IsDeleted)
                    .Select(x => new { Code = x.AssetCode, Name = x.AssetName });
            return Json(data);
        }
        #endregion

        #region Order Asset
        [HttpPost]
        public JsonResult GetPosition([FromBody]ModelAssetLocation data)
        {
            var position = "";
            var wareHouse = _context.EDMSWareHouseAssets.FirstOrDefault(x => !x.WHS_Flag && x.WHS_Code.Equals(data.WHS_Code));
            if(wareHouse != null)
            {
                position = wareHouse.WHS_Name;
            }
            var floor = _context.EDMSFloorAssets.FirstOrDefault(x => x.FloorCode.Equals(data.FloorCode));
            if(floor != null)
            {
                position += ", " + floor.FloorName;
            }

            var line = _context.EDMSLineAssets.FirstOrDefault(x => x.LineCode.Equals(data.LineCode));
            if(line != null)
            {
                position += ", " + line.L_Text;
            }
            if (!string.IsNullOrEmpty(data.RackCode))
            {
                var rack = _context.EDMSRackAssets.FirstOrDefault(x => x.RackCode.Equals(data.RackCode));
                position += ", " + rack.RackName;
            }
            return Json(position);
        }

        [HttpPost]
        public JsonResult DeleteArrange(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.AssetEntityMappings.FirstOrDefault(x => x.Id == id);
                if(data != null)
                {
                    data.IsDeleted = true;
                    _context.AssetEntityMappings.Update(data);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizer["ALC_MSG_DEL_POSITION_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["ALC_MSG_ASSET_NO_ARRANGE"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
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
