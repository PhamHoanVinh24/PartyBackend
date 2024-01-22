using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using ESEIM;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using III.Domain.Enums;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class VCMapDistributorController : BaseController
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

        public VCMapDistributorController(EIMDBContext context, IUploadService upload)
        {
            _context = context;
            _upload = upload;
        }

        public IActionResult Index()
        {
            return View();
        }


        [HttpPost]
        public object GetAll()
        {
            var a = _context.MapDataGpss.Where(x => !x.IsDeleted).OrderBy(x => x.Id).AsNoTracking().ToList();
            return Json(a);
        }

        [HttpPost]
        public JsonResult Insert(PackingModel obj, IFormFile pictureFile)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                if (pictureFile != null && pictureFile.Length > 0)
                {
                    var upload = _upload.UploadImage(pictureFile);

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
                        //Icon = obj.Icon.Contains("SHOP") ? SHOP_ICON : obj.Icon.Contains("PAGODA") ? PAGODA_ICON : obj.Icon.Contains("PARK") ? PARK_ICON : obj.Icon.Contains("COMPANY") ? COMPANY_ICON : null,
                        PolygonGPS = obj.Gis_data,
                        ObjCode = obj.ObjCode,
                        Image = "/uploads/images/" + upload.Object,
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
                else
                {
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
                        //Icon = obj.Icon.Contains("SHOP") ? SHOP_ICON : obj.Icon.Contains("PAGODA") ? PAGODA_ICON : obj.Icon.Contains("PARK") ? PARK_ICON : obj.Icon.Contains("COMPANY") ? COMPANY_ICON : null,
                        PolygonGPS = obj.Gis_data,
                        ObjCode = obj.ObjCode,
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

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Thêm mới địa điểm lỗi";
            }
            return Json(msg);
        }

        #region Customer
        [HttpPost]
        public object searchCustomer([FromBody]MapSearch search)
        {
            var customerCode = search.CustomerCode != null ? search.CustomerCode.ToLower() : "";
            var areas = search.Areas;
            var groups = search.Groups;
            var types = search.Types;
            var roles = search.Roles;
            var query = (from a in _context.Customerss
                         join b1 in _context.CommonSettings on a.Area equals b1.CodeSet into b2
                         from b in b2.DefaultIfEmpty()
                         join c1 in _context.CommonSettings on a.CusGroup equals c1.CodeSet into c2
                         from c in c2.DefaultIfEmpty()
                         join d1 in _context.CommonSettings on a.CusType equals d1.CodeSet into d2
                         from d in d2.DefaultIfEmpty()
                         join e1 in _context.CommonSettings on a.Role equals e1.CodeSet into e2
                         from e in e2.DefaultIfEmpty()
                         where (string.IsNullOrEmpty(search.CustomerCode) || a.CusCode.ToLower().Contains(customerCode))
                         && (areas.Count == 0 || areas.Contains(a.Area))
                         && (groups.Count == 0 || groups.Contains(a.CusGroup))
                         && (types.Count == 0 || types.Contains(a.CusType))
                         && (roles.Count == 0 || roles.Contains(a.Role))
                         && (!string.IsNullOrEmpty(a.GoogleMap))
                         && a.IsDeleted == false
                         select new
                         {
                             a.CusID,
                             a.CusCode,
                             a.CusName,
                             a.Area,
                             a.CusGroup,
                             a.Role,
                             a.CusType,
                             a.ActivityStatus,
                             AreaTxt = b != null ? b.ValueSet : "",
                             CusGroupTxt = c != null ? c.ValueSet : "",
                             CusTypeTxt = d != null ? d.ValueSet : "",
                             RoleTxt = e != null ? e.ValueSet : "",
                             a.GoogleMap,
                             a.Address
                         }).ToList();
            var group = query.GroupBy(x => x.CusID).ToList();
            var list = new List<Object>();
            foreach (var item in group)
            {
                foreach (var item1 in item)
                {
                    var dt = new
                    {
                        item1.CusID,
                        item1.CusCode,
                        item1.CusName,
                        item1.Area,
                        item1.CusGroup,
                        item1.Role,
                        item1.CusType,
                        item1.ActivityStatus,
                        item1.AreaTxt,
                        item1.CusGroupTxt,
                        item1.CusTypeTxt,
                        item1.RoleTxt,
                        item1.GoogleMap,
                        item1.Address
                    };
                    list.Add(dt);
                    break;
                }
            }
            return Json(list);
        }
        ////hàm cũ - join thêm VcSupplierTradeRelations bị exception
        //[HttpPost]
        //public object SearchCustomerWithBranch([FromBody]MapSearch search)
        //{
        //    var customerName = search.CustomerCode != null ? search.CustomerCode.ToLower() : "";
        //    var areas = search.areas;
        //    var groups = search.groups;
        //    var types = search.types;
        //    var roles = search.roles;

        //    IQueryable<Response1> query = null;
        //    var session = HttpContext.GetSessionUser();

        //    if (session.UserType == 10)
        //    {
        //        query = from a in _context.Customerss
        //                    //join g1 in _context.VcSupplierTradeRelations.Where(x => !x.IsDeleted && x.Brand == "BUTSON") on a.CusCode equals g1.Buyer into g2
        //                    //from g in g2.DefaultIfEmpty()
        //                join b in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<CommonEnum>.GetDisplayValue(CommonEnum.Area)) on a.Area equals b.CodeSet
        //                join c in _context.CommonSettings on a.CusGroup equals c.CodeSet
        //                join d in _context.CommonSettings on a.CusType equals d.CodeSet
        //                join e in _context.CommonSettings on a.Role equals e.CodeSet
        //                join f in _context.MapDataGpss.Where(x => !x.IsDeleted) on a.CusCode equals f.ObjCode
        //                where (string.IsNullOrEmpty(customerName) || (!string.IsNullOrEmpty(a.CusName) && a.CusName.ToLower().Contains(customerName.ToLower())))
        //                && (areas.Count == 0 || areas.Contains(a.Area))
        //                && (groups.Count == 0 || groups.Contains(a.CusGroup))
        //                && (types.Count == 0 || types.Contains(a.CusType))
        //                && (roles.Count == 0 || roles.Contains(a.Role))
        //                && a.IsDeleted == false
        //                select new Response1
        //                {
        //                    CusID = a.CusID,
        //                    CusCode = a.CusCode,
        //                    CusName = a.CusName,
        //                    Area = a.Area,
        //                    CusGroup = a.CusGroup,
        //                    Role = a.Role,
        //                    CusType = a.CusType,
        //                    ActivityStatus = a.ActivityStatus,
        //                    AreaTxt = b != null ? b.ValueSet : "",
        //                    CusGroupTxt = c != null ? c.ValueSet : "",
        //                    CusTypeTxt = d != null ? d.ValueSet : "",
        //                    RoleTxt = e != null ? e.ValueSet : "",
        //                    GoogleMap = a.GoogleMap,
        //                    Address = a.Address,
        //                    MapDataGis = new MapDataGps
        //                    {
        //                        Id = f.Id,
        //                        Image = f.Image,
        //                        CreatedBy = f.CreatedBy,
        //                        CreatedTime = f.CreatedTime,
        //                        DeletedBy = f.DeletedBy,
        //                        DeletedTime = f.DeletedTime,
        //                        GisData = f.GisData,
        //                        //Icon = g != null ? "/images/map/map_logo_but_son.png" : f.Icon,
        //                        Icon = _context.VcSupplierTradeRelations.Any(x => !x.IsDeleted && x.Brand == "BUTSON" && x.Buyer == a.CusCode) ? "/images/map/map_logo_but_son.png" : f.Icon,
        //                        IsActive = f.IsActive,
        //                        IsDefault = f.IsDefault,
        //                        IsDeleted = f.IsDeleted,
        //                        MakerGPS = f.MakerGPS,
        //                        MapCode = f.MapCode,
        //                        ObjCode = f.ObjCode,
        //                        ObjType = f.ObjType,
        //                        PolygonGPS = f.PolygonGPS,
        //                        Title = f.Title,
        //                        UpdatedBy = f.UpdatedBy,
        //                        UpdatedTime = f.UpdatedTime
        //                    },
        //                    IsActive = (f != null ? f.IsActive : false),
        //                    IsDefault = (f != null ? f.IsDefault : false),
        //                    IsDeleted = (f != null ? f.IsDeleted : true),
        //                };
        //    }
        //    else
        //    {
        //        if (session.TypeStaff == 10 || session.TypeStaff == 0)
        //        {
        //            var listArea = GetListAreaFunc(session).Select(x => x.Code).ToList();

        //            query = from a in _context.Customerss.Where(x => listArea.Any(y => y == x.Area))
        //                        //join g1 in _context.VcSupplierTradeRelations.Where(x => !x.IsDeleted && x.Brand == "BUTSON") on a.CusCode equals g1.Buyer into g2
        //                        //from g in g2.DefaultIfEmpty()
        //                    //join b in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<CommonEnum>.GetDisplayValue(CommonEnum.Area)) on a.Area equals b.CodeSet
        //                    //join c1 in _context.CommonSettings on a.CusGroup equals c1.CodeSet into c2
        //                    //from c in c2.DefaultIfEmpty()
        //                    //join d1 in _context.CommonSettings on a.CusType equals d1.CodeSet into d2
        //                    //from d in d2.DefaultIfEmpty()
        //                    //join e1 in _context.CommonSettings on a.Role equals e1.CodeSet into e2
        //                    //from e in e2.DefaultIfEmpty()
        //                    //join f1 in _context.MapDataGpss.Where(x => !x.IsDeleted) on a.CusCode equals f1.ObjCode into f2
        //                    //from f in f2.DefaultIfEmpty()
        //                    join b in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<CommonEnum>.GetDisplayValue(CommonEnum.Area)) on a.Area equals b.CodeSet
        //                    join c in _context.CommonSettings on a.CusGroup equals c.CodeSet
        //                    join d in _context.CommonSettings on a.CusType equals d.CodeSet
        //                    join e in _context.CommonSettings on a.Role equals e.CodeSet
        //                    join f in _context.MapDataGpss.Where(x => !x.IsDeleted) on a.CusCode equals f.ObjCode
        //                    where (string.IsNullOrEmpty(customerName) || (!string.IsNullOrEmpty(a.CusName) && a.CusName.ToLower().Contains(customerName.ToLower())))
        //                    && (areas.Count == 0 || areas.Contains(a.Area))
        //                    && (groups.Count == 0 || groups.Contains(a.CusGroup))
        //                    && (types.Count == 0 || types.Contains(a.CusType))
        //                    && (roles.Count == 0 || roles.Contains(a.Role))
        //                    && a.IsDeleted == false
        //                    select new Response1
        //                    {
        //                        CusID = a.CusID,
        //                        CusCode = a.CusCode,
        //                        CusName = a.CusName,
        //                        Area = a.Area,
        //                        CusGroup = a.CusGroup,
        //                        Role = a.Role,
        //                        CusType = a.CusType,
        //                        ActivityStatus = a.ActivityStatus,
        //                        AreaTxt = b != null ? b.ValueSet : "",
        //                        CusGroupTxt = c != null ? c.ValueSet : "",
        //                        CusTypeTxt = d != null ? d.ValueSet : "",
        //                        RoleTxt = e != null ? e.ValueSet : "",
        //                        GoogleMap = a.GoogleMap,
        //                        Address = a.Address,
        //                        MapDataGis = new MapDataGps
        //                        {
        //                            Id = f.Id,
        //                            Image = f.Image,
        //                            CreatedBy = f.CreatedBy,
        //                            CreatedTime = f.CreatedTime,
        //                            DeletedBy = f.DeletedBy,
        //                            DeletedTime = f.DeletedTime,
        //                            GisData = f.GisData,
        //                            Icon = _context.VcSupplierTradeRelations.Any(x => !x.IsDeleted && x.Brand == "BUTSON" && x.Buyer == a.CusCode) ? "/images/map/map_logo_but_son.png" : f.Icon,
        //                            IsActive = f.IsActive,
        //                            IsDefault = f.IsDefault,
        //                            IsDeleted = f.IsDeleted,
        //                            MakerGPS = f.MakerGPS,
        //                            MapCode = f.MapCode,
        //                            ObjCode = f.ObjCode,
        //                            ObjType = f.ObjType,
        //                            PolygonGPS = f.PolygonGPS,
        //                            Title = f.Title,
        //                            UpdatedBy = f.UpdatedBy,
        //                            UpdatedTime = f.UpdatedTime
        //                        },
        //                        IsDefault = (f != null ? f.IsDefault : false),
        //                        IsDeleted = (f != null ? f.IsDeleted : true),
        //                    };
        //        }
        //    }

        //    List<Response2> group = new List<Response2>();
        //    var query1 = query.ToList();
        //    if (query1.Any())
        //    {
        //        group = query1.GroupBy(x => new { x.CusCode }).Select(y => new Response2
        //        {
        //            CusCode = y.Key.CusCode,
        //            list = y.Where(z => z.IsActive == true && z.IsDeleted == false).Count() > 0 ? y.Where(z => z.IsActive == true && z.IsDeleted == false).ToList() : new List<Response1>()
        //        }).ToList();
        //    }

        //    return Json(group);
        //}


        [HttpPost]
        public object SearchCustomerWithBranch([FromBody]MapSearch search)
        {
            var customerName = search.CustomerCode != null ? search.CustomerCode.ToLower() : "";
            var areas = search.Areas;
            var groups = search.Groups;
            var types = search.Types;
            var roles = search.Roles;

            IQueryable<Response1> query = null;
            var session = HttpContext.GetSessionUser();

            if (session.UserType == 10)
            {
                query = from a in _context.Customerss
                        join f in _context.MapDataGpss.Where(x => !x.IsDeleted) on a.CusCode equals f.ObjCode
                        where (string.IsNullOrEmpty(customerName) || (!string.IsNullOrEmpty(a.CusName) && a.CusName.ToLower().Contains(customerName.ToLower())))
                        && (areas.Count == 0 || areas.Contains(a.Area))
                        && (groups.Count == 0 || groups.Contains(a.CusGroup))
                        && (types.Count == 0 || types.Contains(a.CusType))
                        && (roles.Count == 0 || roles.Contains(a.Role))
                        && a.IsDeleted == false
                        select new Response1
                        {
                            CusID = a.CusID,
                            CusCode = a.CusCode,
                            CusName = a.CusName,
                            Area = a.Area,
                            CusGroup = a.CusGroup,
                            Role = a.Role,
                            CusType = a.CusType,
                            ActivityStatus = a.ActivityStatus,
                            AreaTxt = _context.CommonSettings.Any(x => !x.IsDeleted && x.Group == EnumHelper<CommonEnum>.GetDisplayValue(CommonEnum.Area) && x.CodeSet == a.Area) ? _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.Group == EnumHelper<CommonEnum>.GetDisplayValue(CommonEnum.Area) && x.CodeSet == a.Area).ValueSet : "",
                            CusGroupTxt = _context.CommonSettings.Any(x => !x.IsDeleted && x.CodeSet == a.CusGroup) ? _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.CusGroup).ValueSet : "",
                            CusTypeTxt = _context.CommonSettings.Any(x => !x.IsDeleted && x.CodeSet == a.CusType) ? _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.CusType).ValueSet : "",
                            RoleTxt = _context.CommonSettings.Any(x => !x.IsDeleted && x.CodeSet == a.Role) ? _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.Role).ValueSet : "",
                            GoogleMap = a.GoogleMap,
                            Address = a.Address,
                            MapDataGis = new MapDataGps
                            {
                                Id = f.Id,
                                Image = f.Image,
                                CreatedBy = f.CreatedBy,
                                CreatedTime = f.CreatedTime,
                                DeletedBy = f.DeletedBy,
                                DeletedTime = f.DeletedTime,
                                GisData = f.GisData,
                                Icon = _context.VcSupplierTradeRelations.Any(x => !x.IsDeleted && x.Brand == "BUTSON" && x.Buyer == a.CusCode) ? "/images/map/map_logo_but_son.png" : f.Icon,
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
            }
            else
            {
                if (session.TypeStaff == 10 || session.TypeStaff == 0)
                {
                    var listArea = GetListAreaFunc(session).Select(x => x.Code).ToList();

                    query = from a in _context.Customerss.Where(x => listArea.Any(y => y == x.Area))
                            join f in _context.MapDataGpss.Where(x => !x.IsDeleted) on a.CusCode equals f.ObjCode
                            where (string.IsNullOrEmpty(customerName) || (!string.IsNullOrEmpty(a.CusName) && a.CusName.ToLower().Contains(customerName.ToLower())))
                            && (areas.Count == 0 || areas.Contains(a.Area))
                            && (groups.Count == 0 || groups.Contains(a.CusGroup))
                            && (types.Count == 0 || types.Contains(a.CusType))
                            && (roles.Count == 0 || roles.Contains(a.Role))
                            && a.IsDeleted == false
                            select new Response1
                            {
                                CusID = a.CusID,
                                CusCode = a.CusCode,
                                CusName = a.CusName,
                                Area = a.Area,
                                CusGroup = a.CusGroup,
                                Role = a.Role,
                                CusType = a.CusType,
                                ActivityStatus = a.ActivityStatus,
                                AreaTxt = _context.CommonSettings.Any(x => !x.IsDeleted && x.Group == EnumHelper<CommonEnum>.GetDisplayValue(CommonEnum.Area) && x.CodeSet == a.Area) ? _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.Group == EnumHelper<CommonEnum>.GetDisplayValue(CommonEnum.Area) && x.CodeSet == a.Area).ValueSet : "",
                                CusGroupTxt = _context.CommonSettings.Any(x => !x.IsDeleted && x.CodeSet == a.CusGroup) ? _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.CusGroup).ValueSet : "",
                                CusTypeTxt = _context.CommonSettings.Any(x => !x.IsDeleted && x.CodeSet == a.CusType) ? _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.CusType).ValueSet : "",
                                RoleTxt = _context.CommonSettings.Any(x => !x.IsDeleted && x.CodeSet == a.Role) ? _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.Role).ValueSet : "",
                                GoogleMap = a.GoogleMap,
                                Address = a.Address,
                                MapDataGis = new MapDataGps
                                {
                                    Id = f.Id,
                                    Image = f.Image,
                                    CreatedBy = f.CreatedBy,
                                    CreatedTime = f.CreatedTime,
                                    DeletedBy = f.DeletedBy,
                                    DeletedTime = f.DeletedTime,
                                    GisData = f.GisData,
                                    Icon = _context.VcSupplierTradeRelations.Any(x => !x.IsDeleted && x.Brand == "BUTSON" && x.Buyer == a.CusCode) ? "/images/map/map_logo_but_son.png" : f.Icon,
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
                                IsDefault = (f != null ? f.IsDefault : false),
                                IsDeleted = (f != null ? f.IsDeleted : true),
                            };
                }
            }

            List<Response2> group = new List<Response2>();
            var query1 = query.ToList();
            if (query1.Any())
            {
                group = query1.GroupBy(x => new { x.CusCode }).Select(y => new Response2
                {
                    CusCode = y.Key.CusCode,
                    list = y.Where(z => z.IsActive == true && z.IsDeleted == false).Count() > 0 ? y.Where(z => z.IsActive == true && z.IsDeleted == false).ToList() : new List<Response1>()
                }).ToList();
            }

            return Json(group);
        }

        [HttpPost]
        public object SearchCustomerWithBranch1([FromBody]MapSearch search)
        {
            var customerName = search.CustomerCode != null ? search.CustomerCode.ToLower() : "";
            var areas = search.Areas;
            var groups = search.Groups;
            var types = search.Types;
            var roles = search.Roles;
            var query = from a in _context.Customerss
                        join b1 in _context.CommonSettings on a.Area equals b1.CodeSet into b2
                        from b in b2.DefaultIfEmpty()
                        join c1 in _context.CommonSettings on a.CusGroup equals c1.CodeSet into c2
                        from c in c2.DefaultIfEmpty()
                        join d1 in _context.CommonSettings on a.CusType equals d1.CodeSet into d2
                        from d in d2.DefaultIfEmpty()
                        join e1 in _context.CommonSettings on a.Role equals e1.CodeSet into e2
                        from e in e2.DefaultIfEmpty()
                        join f1 in _context.MapDataGpss.Where(x => !x.IsDeleted) on a.CusCode equals f1.ObjCode into f2
                        from f in f2.DefaultIfEmpty()
                        where (string.IsNullOrEmpty(customerName) || a.CusName.ToLower().Contains(customerName))
                        && (areas.Count == 0 || areas.Contains(a.Area))
                        && (groups.Count == 0 || groups.Contains(a.CusGroup))
                        && (types.Count == 0 || types.Contains(a.CusType))
                        && (roles.Count == 0 || roles.Contains(a.Role))
                        && a.IsDeleted == false
                        && (f != null && f.IsActive == true)
                        select new Response1
                        {
                            CusID = a.CusID,
                            CusCode = a.CusCode,
                            CusName = a.CusName,
                            Area = a.Area,
                            CusGroup = a.CusGroup,
                            Role = a.Role,
                            CusType = a.CusType,
                            ActivityStatus = a.ActivityStatus,
                            AreaTxt = b != null ? b.ValueSet : "",
                            CusGroupTxt = c != null ? c.ValueSet : "",
                            CusTypeTxt = d != null ? d.ValueSet : "",
                            RoleTxt = e != null ? e.ValueSet : "",
                            GoogleMap = a.GoogleMap,
                            Address = a.Address,
                            MapDataGis = f,
                            IsActive = (f != null ? f.IsActive : false),
                            IsDefault = (f != null ? f.IsDefault : false)
                        };
            var list = query.ToList();

            return Json(list);
        }

        [HttpPost]
        public object GetCustomerGroup()
        {
            var data = _context.CommonSettings.Where(x => x.Group == EnumHelper<CustomerEnum>.GetDisplayValue(CustomerEnum.CustomerGroup)).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return data;
        }

        [HttpPost]
        public object GetCustomerStatus()
        {
            var data = _context.CommonSettings.Where(x => x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Status)).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return data;
        }

        [HttpPost]
        public JsonResult GetListArea()
        {
            var msg = new JMessage() { Error = false };
            var session = HttpContext.GetSessionUser();
            var listArea = GetListAreaFunc(session);

            msg.Object = listArea;

            return Json(msg);
        }
        [HttpPost]
        public JsonResult GetListCutomerType()
        {
            var msg = new JMessage() { Error = false };

            var data = from a in _context.CommonSettings
                       where a.Group == "TYPE" && a.IsDeleted == false
                       select new
                       {
                           Code = a.CodeSet,
                           Name = a.ValueSet,
                       };
            msg.Object = data;

            return Json(msg);
        }
        [HttpPost]
        public JsonResult GetListCutomerRole()
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
        [HttpPost]
        public JsonResult GetAllCustomer()
        {
            var msg = new JMessage() { Error = false };

            var session = HttpContext.GetSessionUser();
            var listArea = !string.IsNullOrEmpty(session.Area) ? session.Area.Split(';') : new string[1000];

            IQueryable<BaseObject> query = null;
            if (session.UserType == 10)
            {
                query = from a in DbContext.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<CommonEnum>.GetDisplayValue(CommonEnum.Area)).Select(x => new { x.CodeSet, x.ValueSet })
                        join b in DbContext.Customerss.Where(x => !x.IsDeleted && x.Role == "VC_SHOP").Select(x => new { Code = x.CusCode, Name = x.CusName, x.Area }).AsNoTracking()
                                    on a.CodeSet equals b.Area
                        group new { a, b } by new { b.Code }
                          into grp
                        //orderby a.ValueSet
                        select new BaseObject
                        {
                            Code = grp.Key.Code,
                            Name = grp.FirstOrDefault().b.Name
                        };
            }
            else
            {
                query = from a in DbContext.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<CommonEnum>.GetDisplayValue(CommonEnum.Area)).Select(x => new { x.CodeSet, x.ValueSet })
                        join b in DbContext.Customerss.Where(x => !x.IsDeleted && x.Role == "VC_SHOP").Select(x => new { Code = x.CusCode, Name = x.CusName, x.Area }).AsNoTracking()
                                    on a.CodeSet equals b.Area
                        where
                            (listArea.Any(y => !string.IsNullOrEmpty(y) && y == a.CodeSet))
                        group new { a, b } by new { b.Code }
                              into grp
                        //orderby a.ValueSet
                        select new BaseObject
                        {
                            Code = grp.Key.Code,
                            Name = grp.FirstOrDefault().b.Name
                        };
            }

            msg.Object = query;
            return Json(msg);
        }
        #endregion

        #region Supplier 
        [HttpPost]
        public object searchSupplier([FromBody]MapSearch search)
        {
            var customerCode = search.CustomerCode != null ? search.CustomerCode.ToLower() : "";
            var areas = search.Areas;
            var groups = search.Groups;
            var types = search.Types;
            var roles = search.Roles;
            var query = (from a in _context.Customerss
                         join b1 in _context.CommonSettings on a.Area equals b1.CodeSet into b2
                         from b in b2.DefaultIfEmpty()
                         join c1 in _context.CommonSettings on a.CusGroup equals c1.CodeSet into c2
                         from c in c2.DefaultIfEmpty()
                         join d1 in _context.CommonSettings on a.CusType equals d1.CodeSet into d2
                         from d in d2.DefaultIfEmpty()
                         join e1 in _context.CommonSettings on a.Role equals e1.CodeSet into e2
                         from e in e2.DefaultIfEmpty()
                         where (string.IsNullOrEmpty(search.CustomerCode) || a.CusCode.ToLower().Contains(customerCode))
                         && (areas.Count == 0 || areas.Contains(a.Area))
                         && (groups.Count == 0 || groups.Contains(a.CusGroup))
                         && (types.Count == 0 || types.Contains(a.CusType))
                         && (roles.Count == 0 || roles.Contains(a.Role))
                         && (!string.IsNullOrEmpty(a.GoogleMap))
                         select new
                         {
                             a.CusID,
                             a.CusCode,
                             a.CusName,
                             a.Area,
                             a.CusGroup,
                             a.Role,
                             a.CusType,
                             a.ActivityStatus,
                             AreaTxt = b != null ? b.ValueSet : "",
                             CusGroupTxt = c != null ? c.ValueSet : "",
                             CusTypeTxt = d != null ? d.ValueSet : "",
                             RoleTxt = e != null ? e.ValueSet : "",
                             a.GoogleMap,
                             a.Address
                         }).ToList();
            var group = query.GroupBy(x => x.CusID).ToList();
            var list = new List<Object>();
            foreach (var item in group)
            {
                foreach (var item1 in item)
                {
                    var dt = new
                    {
                        item1.CusID,
                        item1.CusCode,
                        item1.CusName,
                        item1.Area,
                        item1.CusGroup,
                        item1.Role,
                        item1.CusType,
                        item1.ActivityStatus,
                        item1.AreaTxt,
                        item1.CusGroupTxt,
                        item1.CusTypeTxt,
                        item1.RoleTxt,
                        item1.GoogleMap,
                        item1.Address
                    };
                    list.Add(dt);
                    break;
                }
            }
            return Json(list);
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
                       where a.Group == "TYPE" && a.IsDeleted == false
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
                       where a.Group == EnumHelper<SupplierEnum>.GetDisplayValue(SupplierEnum.SupplierRole) && a.IsDeleted == false
                       select new
                       {
                           Code = a.CodeSet,
                           Name = a.ValueSet,
                       };
            msg.Object = data;

            return Json(msg);
        }
        [HttpPost]
        public JsonResult GetCustomerInfoExtend(string CusCode)
        {
            JMessage msg = new JMessage() { Error = false };
            CustomerInfoExtendRes res = new CustomerInfoExtendRes();
            var customer = _context.Customerss.FirstOrDefault(x => x.CusCode == CusCode && x.IsDeleted == false);
            res.Customer = customer;
            if (customer != null)
            {
                var item = _context.VcSettingRoutes.Where(x => x.Node == customer.CusCode && x.CurrentStatus == "ROUTE_DONE").MaxBy(x => x.CreatedTime);
                if (item != null)
                {
                    var routeCode = item.RouteCode;
                    var listCare = (from a in _context.VcCustomerCares
                                    join b1 in _context.MaterialProducts on a.ProductCode equals b1.ProductCode into b2
                                    from b in b2.DefaultIfEmpty()
                                    join c1 in _context.CommonSettings on a.BrandCode equals c1.CodeSet into c2
                                    from c in c2.DefaultIfEmpty()
                                    where a.RouteCode == routeCode
                                    && a.IsDeleted == false
                                    && c.Group == "VC_BRAND"
                                    select new VcCustomerCareExtend
                                    {
                                        Id = a.Id,
                                        BrandCode = a.BrandCode,
                                        ProductCode = a.ProductCode,
                                        BuyCost = a.BuyCost,
                                        SaleCost = a.SaleCost,
                                        Instock = a.Instock,
                                        ProductName = (b != null ? b.ProductName : ""),
                                        ProductIcon = (b != null ? b.Image : ""),
                                        Brand = (c != null ? c.ValueSet : ""),
                                        BrandLogo = (c != null ? c.Logo : "")

                                    }).ToList();
                    res.listCare = listCare;
                }
            }

            msg.Object = res;
            return Json(msg);
        }

        #endregion
        public class CustomerInfoExtendRes
        {
            public CustomerInfoExtendRes()
            {
                listCare = new List<VcCustomerCareExtend>();
            }
            public Customers Customer { get; set; }
            public List<VcCustomerCareExtend> listCare { get; set; }
        }
        public class VcCustomerCareExtend : VcCustomerCare
        {
            public string ProductName { get; set; }
            public string ProductIcon { get; set; }
            public string Brand { get; set; }
            public string BrandLogo { get; set; }
        }
    }
    public class Response1
    {
        public int CusID { get; set; }
        public string CusCode { get; set; }
        public string CusName { get; set; }
        public string Area { get; set; }
        public string CusGroup { get; set; }
        public string Role { get; set; }
        public string CusType { get; set; }
        public string ActivityStatus { get; set; }
        public string AreaTxt { get; set; }
        public string CusGroupTxt { get; set; }
        public string CusTypeTxt { get; set; }
        public string RoleTxt { get; set; }
        public string GoogleMap { get; set; }
        public string Address { get; set; }
        public MapDataGps MapDataGis { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public bool IsDefault { get; set; }
        public string PolygonGPS { get; set; }

    }
    public class Response2
    {
        public string CusCode { get; set; }

        public List<Response1> list { get; set; }
    }
    public class PackingModel
    {
        public int Id { get; set; }
        public string ObjCode { get; set; }
        public string ObjType { get; set; }

        public string title { get; set; }
        public string Gis_data { get; set; }
        public string MarkerGps { get; set; }
        public string GisData2 { get; set; }
        public List<Gps> Gis_data1 { get; set; }
        public string Image { get; set; }
        public string Description { get; set; }
        public string Owner { get; set; }
        //public DateTime? CreateDate { get; set; }
        //public int? CreateBy { get; set; }
        //public DateTime? UpdateDate { get; set; }
        //public int? UpdateBy { get; set; }
        //public int Flag { get; set; }
        //public string vendor_code { get; set; }
        public string Icon { get; set; }
        public string CreatedBy { get; set; }
        public string Address { get; set; }
    }
    public class Gps
    {
        public double Lat { get; set; }
        public double Lng { get; set; }
    }
    public class MapSearch
    {
        public MapSearch()
        {
            Areas = new List<string>();
            Groups = new List<string>();
            Types = new List<string>();
            Roles = new List<string>();
        }
        public string SupplierName { get; set; }
        public string CustomerCode { get; set; }
        public string SupCode { get; set; }
        public string WarehouseCode { get; set; }
        public string WareHouseName { get; set; }
        public string ProductKey { get; set; }
        public List<string> Areas { get; set; }
        public List<string> Groups { get; set; }
        public List<string> Types { get; set; }
        public List<string> Roles { get; set; }

    }
}