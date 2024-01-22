using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using ESEIM.Models;
using ESEIM.Utils;
using III.Domain.Enums;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class MapController : BaseController
    {
        public class JTableModelCustomer : JTableModel
        {
            public string CustomerCode { get; set; }
            public string CustomerName { get; set; }
            public string CustomerPhone { get; set; }
            public string CustomerEmail { get; set; }
            public string CustomerGroup { get; set; }
            public string CustomerActivityStatus { get; set; }
            public string Address { get; set; }
        }
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IStringLocalizer<MapController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;

        public MapController(EIMDBContext context, IUploadService upload, IStringLocalizer<MapController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _upload = upload;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }

        public IActionResult Index()
        {
            return View();
        }

        //[HttpGet]
        //public object GetAll(string objType)
        //{
        //    var a = _context.MapDataGpss.Where(x => x.ObjType == objType&&x.IsDeleted==false).OrderBy(x => x.Id).AsNoTracking().ToList();
        //    return Json(a);
        //}

        [HttpPost]
        public JsonResult Insert(PackingModel obj, IFormFile pictureFile)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                if (pictureFile != null && pictureFile.Length > 0)
                {
                    var upload = _upload.UploadImage(pictureFile);
                    if (!upload.Error)
                    {
                        obj.Image = Path.Combine("/uploads/images", upload.Object.ToString());
                    }
                }
                //Check Title đã có chưa
                var modelCheck = _context.MapDataGpss.Where(x => x.ObjCode == obj.ObjCode && !string.IsNullOrEmpty(x.Title) && !string.IsNullOrEmpty(obj.title) && x.Title == obj.title && !x.IsDeleted).Count();
                if (modelCheck > 0)
                {
                    var countCheck = _context.MapDataGpss.Where(x => x.ObjCode == obj.ObjCode && !string.IsNullOrEmpty(x.Title) && !string.IsNullOrEmpty(obj.title) && x.Title.ToLower().Contains(obj.title.ToLower()) && !x.IsDeleted).Count() + 1;
                    obj.title = obj.title + " " + countCheck;
                }
                var model = new MapDataGps
                {
                    Title = obj.title,
                    Icon = obj.Icon,
                    PolygonGPS = obj.Gis_data,
                    ObjCode = obj.ObjCode,
                    ObjType = obj.ObjType,
                    Image = obj.Image,
                    IsActive = true,
                    IsDefault = false,
                    CreatedBy = ESEIM.AppContext.UserName,
                    CreatedTime = DateTime.Now,
                    MakerGPS = obj.MarkerGps,
                    GisData = obj.GisData2
                };
                _context.MapDataGpss.Add(model);
                _context.SaveChanges();
                msg.Title = "Thêm mới địa điểm thành công";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Thêm mới địa điểm lỗi";
            }
            return Json(msg);
        }

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var a = _stringLocalizer["MS_CURD_TAB_CUSTOMER_LBL_CUSTOMER_CODE"];
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