using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class AssetQRCodeManagerController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IStringLocalizer<AssetQRCodeManagerController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;

        public AssetQRCodeManagerController(EIMDBContext context, IStringLocalizer<AssetQRCodeManagerController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }
        [Breadcrumb("ViewData.CrumbAssetQrCodeManage", AreaName = "Admin", FromAction = "Index", FromController = typeof(NomalListAssetHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuAsset"] = _sharedResources["COM_CRUMB_ASSET_OPERATION"];
            ViewData["CrumbNormalAssetHome"] = _sharedResources["COM_BREAD_CRUMB_COMMON_CATE"];
            ViewData["CrumbAssetQrCodeManage"] = _sharedResources["COM_CRUMB_ASSET_QRCODE_MANAGER"];
            return View();
        }

        [HttpPost]
        public object SearchAsset([FromBody] AssetSearchModel assetSearch)
        {
            var msg = new JMessage();
            try
            {
                var fromDate = string.IsNullOrEmpty(assetSearch.FromDate) ? (DateTime?)null : DateTime.ParseExact(assetSearch.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                var toDate = string.IsNullOrEmpty(assetSearch.ToDate) ? (DateTime?)null : DateTime.ParseExact(assetSearch.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                var rs = _context.AssetMains.Where(x => !x.IsDeleted
                && (fromDate == null || x.CreatedTime >= fromDate)
                && (toDate == null || x.CreatedTime <= toDate)
                && (string.IsNullOrEmpty(assetSearch.Position) || x.LocationText.Contains(assetSearch.Position)))
                .Select(x => new
                {
                    Code = x.AssetCode,
                    Name = x.AssetName,
                    TypeName = "Tài sản",
                    Type = "ASSET",
                    Position = x.LocationText,
                    x.CreatedBy,
                    x.CreatedTime,
                    Parent = "#",
                }).ToList();

                msg.Object = rs;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }

            return Json(msg);
        }

        [HttpGet]
        public object LoadAsset(string position)
        {
            try
            {
                var rs = _context.AssetMains.Where(x => !x.IsDeleted && (string.IsNullOrEmpty(position) || (!string.IsNullOrEmpty(position) && x.LocationText.Contains(position)))).Select(x => new
                {
                    Code = x.AssetCode,
                    Name = x.AssetName,
                    TypeName = "Tài sản",
                    Type = "ASSET",
                    Position = x.LocationText,
                    x.CreatedBy,
                    x.CreatedTime,
                    Parent = "#",
                });
                return Json(rs);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        [HttpGet]
        public object GetListPosition()
        {
            try
            {
                var rs = _context.AssetMains.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.LocationText)).Select(x => new
                {
                    Code = x.AssetCode,
                    Name = x.AssetName,
                    TypeName = "Tài sản",
                    Type = "ASSET",
                    Position = x.LocationText,
                    x.CreatedBy,
                    x.CreatedTime,
                    Parent = "#",
                });
                return Json(rs);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

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
    }

    public class DataObject
    {
        public string OBJ_Code { get; set; }
        public string OBJ_Name { get; set; }
    }

    public class AssetSearchModel
    {
        public string Position { get; set; }
        public string FromDate { get; set; }
        public string ToDate { get; set; }
    }
}