using ESEIM.Models;
using ESEIM.Utils;
using III.Domain.Enums;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;
using System.Linq;
namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class MapSupplierController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IStringLocalizer<MapSupplierController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public MapSupplierController(EIMDBContext context, IStringLocalizer<MapSupplierController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }
        public IActionResult Index()
        {
            return View();
        }
        #region Supplier 
        [HttpPost]
        public JsonResult GetAllSupplier()
        {
            var msg = new JMessage() { Error = false };

            var data = from a in _context.Suppliers
                       where a.IsDeleted == false
                       select new
                       {
                           Code = a.SupCode,
                           Name = a.SupName,
                       };
            msg.Object = data;
            return Json(msg);
        }
        [HttpPost]
        public object SearchSupplier([FromBody]MapSearch search)
        {
            var areas = search.Areas;
            var groups = search.Groups;
            var types = search.Types;
            var roles = search.Roles;
            var query = from a in _context.Suppliers
                        join f in _context.MapDataGpss.Where(x => !x.IsDeleted && x.ObjType == EnumHelper<SupplierEnum>.GetDisplayValue(SupplierEnum.Supplier)) on a.SupCode equals f.ObjCode
                        where (string.IsNullOrEmpty(search.SupplierName) || (!string.IsNullOrEmpty(a.SupName) && a.SupName.ToLower().Contains(search.SupplierName.ToLower())))
                        && (areas.Count == 0 || areas.Contains(a.Area))
                        && (groups.Count == 0 || groups.Contains(a.SupGroup))
                        && (types.Count == 0 || types.Contains(a.CusType))
                        && (roles.Count == 0 || roles.Contains(a.Role))
                        && a.IsDeleted == false
                        select new
                        {
                            Id = a.SupID,
                            Code = a.SupCode,
                            Name = a.SupName,
                            //a.Area,
                            //a.SupGroup,
                            //a.Role,
                            //a.CusType,
                            Status = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.Status).ValueSet ?? "",
                            AreaTxt = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.Area).ValueSet ?? "",
                            GroupTxt = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.SupGroup).ValueSet ?? "",
                            TypeTxt = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.CusType).ValueSet ?? "",
                            RoleTxt = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.Role).ValueSet ?? "",
                            a.GoogleMap,
                            a.Address,
                            MapDataGis = new MapDataGps
                            {
                                Id = f.Id,
                                Image = f.Image,
                                CreatedBy = f.CreatedBy,
                                CreatedTime = f.CreatedTime,
                                DeletedBy = f.DeletedBy,
                                DeletedTime = f.DeletedTime,
                                GisData = f.GisData,
                                Icon = _context.IconManagers.FirstOrDefault(x => x.IconCode == a.IconLevel).IconPath ?? f.Icon,
                                IsActive = f.IsActive,
                                IsDefault = f.IsDefault,
                                IsDeleted = f.IsDeleted,
                                MakerGPS = f.MakerGPS,
                                MapCode = f.MapCode,
                                ObjCode = f.ObjCode,
                                ObjType = f.ObjType,
                                PolygonGPS = f.PolygonGPS,
                                Title = f.Title,
                                UpdatedBy = f.UpdatedBy,
                                UpdatedTime = f.UpdatedTime
                            },
                            IsActive = (f != null ? f.IsActive : false),
                            IsDefault = (f != null ? f.IsDefault : false),
                            IsDeleted = (f != null ? f.IsDeleted : true),
                        };
            IQueryable group = Enumerable.Empty<object>().AsQueryable();
            if (query.Any())
            {
                group = query.GroupBy(x => new
                {
                    x.Code
                }).Select(y => new
                {
                    y.Key.Code,
                    list = y.Where(z => z.IsActive == true && z.IsDeleted == false).Count() > 0 ? y.Where(z => z.IsActive == true && z.IsDeleted == false) : Enumerable.Empty<object>(),
                });
            }
            return Json(group);
        }
        [HttpPost]
        public object GetSupplierGroup()
        {
            var data = _context.CommonSettings.Where(x => x.Group == EnumHelper<CustomerEnum>.GetDisplayValue(CustomerEnum.CustomerGroup)).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return data;
        }
        [HttpPost]
        public object GetSupplierStatus()
        {
            var data = _context.CommonSettings.Where(x => x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Status)).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return data;
        }
        [HttpPost]
        public JsonResult GetListAreaSupplier()
        {
            var msg = new JMessage() { Error = false };

            var data = from a in _context.CommonSettings
                       where a.Group == EnumHelper<CommonEnum>.GetDisplayValue(CommonEnum.Area) && a.IsDeleted == false
                       select new
                       {
                           Code = a.CodeSet,
                           Name = a.ValueSet,
                       };
            msg.Object = data;

            return Json(msg);
        }
        [HttpPost]
        public JsonResult GetListSupplierType()
        {
            var msg = new JMessage() { Error = false };

            var data = from a in _context.CommonSettings
                       where a.Group == EnumHelper<CustomerEnum>.GetDisplayValue(CustomerEnum.CustomerType) && a.IsDeleted == false
                       select new
                       {
                           Code = a.CodeSet,
                           Name = a.ValueSet,
                       };
            msg.Object = data;

            return Json(msg);
        }
        [HttpPost]
        public JsonResult GetListSupplierRole()
        {
            var msg = new JMessage() { Error = false };

            var data = from a in _context.CommonSettings
                       where a.Group == EnumHelper<CustomerEnum>.GetDisplayValue(CustomerEnum.CustomerRole) && a.IsDeleted == false
                       select new
                       {
                           Code = a.CodeSet,
                           Name = a.ValueSet,
                       };
            msg.Object = data;

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