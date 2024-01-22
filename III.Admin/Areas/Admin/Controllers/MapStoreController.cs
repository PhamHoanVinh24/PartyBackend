using ESEIM.Models;
using ESEIM.Utils;
using III.Domain.Enums;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;
using System.Linq;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class MapStoreController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IStringLocalizer<MapStoreController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public MapStoreController(EIMDBContext context, IStringLocalizer<MapStoreController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }
        [Breadcrumb("ViewData.CrumbMapStore", AreaName = "Admin", FromAction = "Index", FromController = typeof(NomalListWareHouseHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuStore"] = _sharedResources["COM_CRUMB_MENU_STORE"];
            ViewData["CrumbNormalWHHome"] = _sharedResources["COM_BREAD_CRUMB_COMMON_CATE"];
            ViewData["CrumbMapStore"] = "Bản đồ kho";
            return View();
        }
        #region Store
        [HttpPost]
        public object SearchStore([FromBody]MapSearch search)
        {
            var wareHouseName = search.WareHouseName != null ? search.WareHouseName.ToLower() : "";
            var query = from a in _context.EDMSWareHouses
                        join f in _context.MapDataGpss.Where(x => !x.IsDeleted && x.ObjType == EnumHelper<WarehouseEnum>.GetDisplayValue(WarehouseEnum.Warehouse)) on a.WHS_Code equals f.ObjCode
                        where (string.IsNullOrEmpty(wareHouseName) || (!string.IsNullOrEmpty(a.WHS_Name) && a.WHS_Name.ToLower().Contains(wareHouseName.ToLower())))
                        //&& (areas.Count == 0 || areas.Contains(a.Area))
                        //&& (groups.Count == 0 || groups.Contains(a.CusGroup))
                        //&& (types.Count == 0 || types.Contains(a.CusType))
                        //&& (roles.Count == 0 || roles.Contains(a.Role))
                        && a.WHS_Flag == false/* && a.Type == "PR"*/
                        select new
                        {
                            Id = a.Id,
                            Code = a.WHS_Code,
                            Name = a.WHS_Name,
                            //Are = a.Area,
                            // a.CusGroup,
                            //a.Role,
                            //a.CusType,
                            a.WHS_ADDR_Gps,
                            a.WHS_ADDR_Text,
                            MapDataGis = new MapDataGps
                            {
                                Id = f.Id,
                                Image = f.Image,
                                CreatedBy = f.CreatedBy,
                                CreatedTime = f.CreatedTime,
                                DeletedBy = f.DeletedBy,
                                DeletedTime = f.DeletedTime,
                                Icon = f.Icon,
                                GisData = f.GisData,
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
                group = query.GroupBy(x => new { x.Code }).Select(y => new
                {
                    y.Key.Code,
                    list = y.Where(z => z.IsActive == true && z.IsDeleted == false).Count() > 0 ? y.Where(z => z.IsActive == true && z.IsDeleted == false) : Enumerable.Empty<object>()
                });
            }
            return Json(group);
        }
        [HttpPost]
        public JsonResult GetAllWareHouse()
        {
            var msg = new JMessage() { Error = false };

            var data = from a in _context.EDMSWareHouses
                       where a.WHS_Flag == false /*&& a.Type == "PR"*/
                       select new
                       {
                           Code = a.WHS_Code,
                           Name = a.WHS_Name,
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