using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;
using III.Domain.Enums;
using Microsoft.AspNetCore.Http;
using System.IO;
using Microsoft.AspNetCore.Hosting;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class ZoneManagerController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IStringLocalizer<ZoneManagerController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IHostingEnvironment _hostingEnvironment;
        public ZoneManagerController(EIMDBContext context, IStringLocalizer<ZoneManagerController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources, IHostingEnvironment hostingEnvironment)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
            _hostingEnvironment = hostingEnvironment;
        }
        [Breadcrumb("ViewData.CrumbZoneManager", AreaName = "Admin", FromAction = "Index", FromController = typeof(WarehouseDigitalHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbWHDHome"] = _sharedResources["COM_CRUMB_WH_DIGITAL_HOME"];
            ViewData["CrumbZoneManager"] = _sharedResources["COM_ZONE_STORAGE"];
            return View();
        }

        #region ComboBox
        [HttpPost]
        public JsonResult GetZoneLevel()
        {
            var data = _context.ZoneStructs.Where(x => !x.IsDeleted && x.ZoneLevel != null).OrderBy(x => x.ZoneLevel).GroupBy(x => x.ZoneLevel).Select(x => new { Code = x.FirstOrDefault().ZoneLevel, Name = x.FirstOrDefault().ZoneLevel });
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetZoneParent(string zoneCode)
        {
            var data = _context.ZoneStructs.Where(x => (string.IsNullOrEmpty(zoneCode) || !x.ZoneCode.Equals(zoneCode)) && !x.IsDeleted).Select(x => new { Id = x.ID, Code = x.ZoneCode, Name = x.ZoneName });
            return Json(data);
        }

        [HttpPost]
        public List<TreeView> GetTreeZone()
        {
            var data = _context.ZoneStructs.Where(x => !x.IsDeleted);
            var dataOrder = GetSubTreeZone(data.ToList(), null, new List<TreeView>(), 0);
            return dataOrder;
        }

        private List<TreeView> GetSubTreeZone(List<ZoneStruct> data, string catParent, List<TreeView> lstCategories, int tab)
        {
            var contents = (catParent == null)
                ? data.Where(x => string.IsNullOrEmpty(x.ZoneParent) && !x.IsDeleted).OrderBy(x => x.ZoneName).ToList()
                : data.Where(x => x.ZoneParent == catParent && !x.IsDeleted).OrderBy(x => x.ZoneName).ToList();
            foreach (var item in contents)
            {
                var category = new TreeView
                {
                    Id = item.ID,
                    Code = item.ZoneCode,
                    Title = item.ZoneName,
                    Level = tab,
                    HasChild = data.Any(x => !string.IsNullOrEmpty(x.ZoneParent) && x.ZoneParent.Equals(item.ZoneCode))
                };
                lstCategories.Add(category);
                if (category.HasChild) GetSubTreeZone(data, item.ZoneCode, lstCategories, tab + 1);
            }
            return lstCategories;
        }


        [HttpPost]
        public JsonResult GetZoneGroup()
        {
            var data = _context.CommonSettings.Where(x => !x.IsDeleted
            && x.Group == EnumHelper<ZoneManagerEnum>.GetDisplayValue(ZoneManagerEnum.ZoneGroup))
            .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetZoneType()
        {
            var data = _context.CommonSettings.Where(x => !x.IsDeleted
            && x.Group == EnumHelper<ZoneManagerEnum>.GetDisplayValue(ZoneManagerEnum.ZoneType))
            .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetAttrUnit()
        {
            var data = _context.CommonSettings.Where(x => !x.IsDeleted
                && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)))
                .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetAttrDataType()
        {
            var data = _context.CommonSettings.Where(x => !x.IsDeleted
                && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.AttrDataType)))
                .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return Json(data);
        }
        #endregion

        #region Header
        [HttpPost]
        public object GetTreeData(string zoneType, string zoneCode, int? zoneLevel)
        {
            var query = (from a in _context.ZoneStructs.Where(x => !x.IsDeleted)
                         join b in _context.CommonSettings.Where(p => !p.IsDeleted) on a.ZoneGroup equals b.CodeSet into b1
                         from b in b1.DefaultIfEmpty()
                         join c in _context.CommonSettings.Where(p => !p.IsDeleted) on a.ZoneType equals c.CodeSet into c1
                         from c in c1.DefaultIfEmpty()
                         let attr = _context.ZoneAttrs.FirstOrDefault(x => !x.IsDeleted && x.ZoneAttrCode.Equals("QUANTITY") && x.ZoneGroup.Equals(a.ZoneGroup) && x.ZoneType.Equals(a.ZoneType))
                         let parent = _context.ZoneStructs.FirstOrDefault(x => !x.IsDeleted && x.ZoneCode.Equals(a.ZoneParent))
                         where (string.IsNullOrEmpty(zoneType) || a.ZoneType.Equals(zoneType))
                            && (string.IsNullOrEmpty(zoneCode) || a.ZoneCode.Equals(zoneCode))
                            && (zoneLevel == null || a.ZoneLevel.Equals(zoneLevel))
                         select new ZoneStructModel
                         {
                             Id = a.ID,
                             ZoneParent = a.ZoneParent,
                             ZoneParentId = parent != null ? parent.ID : 0,
                             ZoneCode = a.ZoneCode,
                             ZoneLabel = a.ZoneLabel,
                             ZoneName = a.ZoneName,
                             ZoneLevel = a.ZoneLevel,
                             ZoneGroup = b != null ? b.ValueSet : "",
                             ZoneType = c != null ? c.ValueSet : "",
                             Status = a.IsDeleted ? "Không hoạt động" : "Hoạt động",
                             Quantity = attr != null ? attr.ZoneAttrValue : ""
                         }).ToList();

            foreach (var item in query)
            {
                if (item.ZoneParentId != null)
                {
                    if (item.ZoneParentId == 0)
                        item.ZoneParentId = null;

                    var check = query.Any(x => x.Id.Equals(item.ZoneParentId));
                    if (!check)
                        item.ZoneParentId = null;
                }
            }

            return Json(query);
        }

        [HttpPost]
        public object GetTreeDataEx()
        {
            var query = from x in _context.ZoneStructs.Where(x => !x.IsDeleted)
                        select new ZoneModel
                        {
                            Id = x.ID,
                            ZoneParent = x.ZoneParent,
                            ZoneCode = x.ZoneCode,
                            ZoneLabel = x.ZoneLabel,
                            ZoneName = x.ZoneName,
                            ZoneLevel = x.ZoneLevel,
                            ZoneGroup = x.ZoneGroup,
                            ZoneType = x.ZoneType,
                            ZoneHierachy = x.ZoneHierachy
                        };
            var data = query.OrderBy(x => x.ZoneName).AsNoTracking();
            var listZone = data as IList<ZoneModel> ?? data.ToList();

            var result = new List<ZoneModel>();
            foreach (var func in listZone.Where(x => string.IsNullOrEmpty(x.ZoneCode)))
            {
                var function = new ZoneModel();
                function.Id = func.Id;
                function.ZoneParent = func.ZoneParent;
                function.ZoneCode = func.ZoneCode;
                function.ZoneLabel = func.ZoneLabel;
                function.ZoneName = func.ZoneName;
                function.ZoneLevel = func.ZoneLevel;
                var child = GetTreeZoneChild(listZone, func.ZoneCode, 1);
                if (child.Count() > 0)
                {
                    function.HasChild = true;
                }
                else
                {
                    function.HasChild = false;
                }
                result.Add(function);
                result = result.Concat(child).ToList();
            }
            var res = result.ToList();
            return Json(res);
        }


        [HttpPost]
        public JsonResult GetInfoZone(string zoneCode)
        {
            var data = _context.ZoneStructs.FirstOrDefault(x => !x.IsDeleted && x.ZoneCode.Equals(zoneCode));
            if (data != null)
            {
                var listRecordsPack = _context.ZoneStructs.Where(x => !x.IsDeleted).ToList();
                var hierarchy = GetHierarchy(listRecordsPack, data, "");
                data.ZoneHierachy = hierarchy;
            }
            return Json(data);
        }

        private string GetHierarchy(List<ZoneStruct> listData, ZoneStruct obj, string hierarchy)
        {
            if (obj.ZoneParent != null)
            {
                hierarchy = obj.ZoneCode + (!string.IsNullOrEmpty(hierarchy) ? ("/" + hierarchy) : "");
                var zoneParent = listData.FirstOrDefault(x => !x.IsDeleted && x.ZoneCode.Equals(obj.ZoneParent));
                if (zoneParent != null)
                {
                    hierarchy = zoneParent.ZoneCode + "/" + hierarchy;
                    if (zoneParent.ZoneParent != null)
                    {
                        var child = listData.FirstOrDefault(x => !x.IsDeleted && x.ZoneCode.Equals(zoneParent.ZoneParent));
                        hierarchy = GetHierarchy(listData, child, hierarchy);
                    }
                }
            }
            else
            {
                hierarchy = obj.ZoneCode + (!string.IsNullOrEmpty(hierarchy) ? ("/" + hierarchy) : "");
            }

            return hierarchy;
        }

        private static List<ZoneModel> GetTreeZoneChild(IList<ZoneModel> listZone, string parentCode, int tab)
        {
            var result = new List<ZoneModel>();
            var query = from func in listZone
                        where func.ZoneParent == parentCode
                        orderby func.ZoneName
                        select new ZoneModel
                        {
                            Id = func.Id,
                            ZoneCode = func.ZoneCode,
                            ZoneName = func.ZoneName,
                            ZoneParent = func.ZoneParent,
                            ZoneLabel = func.ZoneLabel,
                            ZoneLevel = tab,
                            ZoneGroup = func.ZoneGroup,
                            ZoneType = func.ZoneType,
                        };

            var listData = query as IList<ZoneModel> ?? query.ToList();
            foreach (var func in listData)
            {
                result.Add(func);
                var destination = GetTreeZoneChild(listZone, func.ZoneCode, tab + 1);
                result = result.Concat(destination).ToList();
            }
            return result;
        }

        [NonAction]
        private List<TreeView> GetChildZone(string zoneCode)
        {
            var childRecordsPack = new List<TreeView>();

            var data = _context.ZoneStructs.OrderBy(x => x.ZoneName).Where(x => !x.IsDeleted && x.ZoneCode != zoneCode).AsNoTracking();
            childRecordsPack = GetSubZone(data.ToList(), zoneCode, new List<TreeView>(), 0);
            return childRecordsPack;
        }

        [NonAction]
        private List<TreeView> GetSubZone(List<ZoneStruct> data, string catParent, List<TreeView> lstCategories, int tab)
        {
            //tab += "- ";
            var contents = (catParent == null)
                ? data.Where(x => string.IsNullOrEmpty(x.ZoneParent) && x.IsDeleted == false).OrderBy(x => x.ZoneName).ToList()
                : data.Where(x => x.ZoneParent == catParent && x.IsDeleted == false).OrderBy(x => x.ZoneName).ToList();
            foreach (var item in contents)
            {
                var category = new TreeView
                {
                    Id = item.ID,
                    Code = item.ZoneCode,
                    Title = item.ZoneName,
                    Level = tab,
                    HasChild = data.Any(x => x.ZoneParent == item.ZoneCode)
                };
                lstCategories.Add(category);
                if (category.HasChild)
                    GetSubZone(data, item.ZoneCode, lstCategories, tab + 1);
            }
            return lstCategories;
        }

        [HttpPost]
        public JsonResult Insert(ZoneStruct obj, IFormFile image)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var listZone = new List<string>();
                var countZoneSuccess = 0;
                var countZoneFail = 0;
                if (obj.ZoneQuantity != null)
                {
                    for (int i = 1; i <= obj.ZoneQuantity; i++)
                    {
                        var zoneCode = string.Format("{0}_{1}", obj.ZoneCode, i);
                        listZone.Add(zoneCode);
                    }
                }

                if (obj.ZoneLevel == null)
                {
                    obj.ZoneLevel = 0;
                }

                //Thêm ảnh
                if (image != null && image.Length > 0)
                {
                    var url = string.Empty;
                    var pathUpload = Path.Combine(_hostingEnvironment.WebRootPath, "uploads\\images");
                    if (!Directory.Exists(pathUpload)) Directory.CreateDirectory(pathUpload);
                    var fileName = Path.GetFileName(image.FileName);
                    fileName = Path.GetFileNameWithoutExtension(fileName)
                     + "_"
                     + Guid.NewGuid().ToString().Substring(0, 8)
                     + Path.GetExtension(fileName);
                    var filePath = Path.Combine(pathUpload, fileName);
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        image.CopyTo(stream);
                    }
                    url = "/uploads/images/" + fileName;
                    obj.Image = url;
                }

                if (listZone.Count > 1)
                {
                    foreach (var item in listZone)
                    {
                        var checkExist = _context.ZoneStructs.FirstOrDefault(x => !x.IsDeleted && x.ZoneCode.Equals(item));
                        if (checkExist == null)
                        {
                            obj.CreatedBy = ESEIM.AppContext.UserName;
                            obj.CreatedTime = DateTime.Now;
                            _context.ZoneStructs.Add(obj);
                            countZoneSuccess++;
                        }
                        else
                        {
                            countZoneFail++;
                        }
                    }

                    if (countZoneFail > 0)
                    {
                        msg.Error = true;
                        msg.Title = String.Format(_sharedResources["COM_MSG_EXITS"], _stringLocalizer["Vùng"]);
                    }
                    else
                    {
                        _context.SaveChanges();
                        msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["Vùng"]);
                    }
                }
                else
                {
                    var checkExist = _context.ZoneStructs.FirstOrDefault(x => !x.IsDeleted && x.ZoneCode.Equals(obj.ZoneCode));
                    if (checkExist == null)
                    {
                        obj.CreatedBy = ESEIM.AppContext.UserName;
                        obj.CreatedTime = DateTime.Now;
                        _context.ZoneStructs.Add(obj);
                        _context.SaveChanges();
                        msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["Vùng"]);
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = String.Format(_sharedResources["COM_MSG_EXITS"], _stringLocalizer["Vùng"]);
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_ADD_FAILED"], _stringLocalizer["Vùng"]);
            }
            return Json(msg);
        }

        [HttpPost]
        public object GetItem(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.ZoneStructs.FirstOrDefault(x => x.ID == id);
                if (data != null)
                {
                    msg.Object = data;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["Vùng không tồn tại"];
                }
            }
            catch (Exception ex)
            {
                throw;
            }

            return Json(msg);
        }

        [HttpPost]
        public JsonResult Update(ZoneStruct obj, IFormFile image)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.ZoneStructs.Where(x => !x.IsDeleted && x.ZoneCode.Equals(obj.ZoneCode)).FirstOrDefault();
                if (data != null)
                {
                    if (obj.ZoneLevel == null)
                    {
                        obj.ZoneLevel = 0;
                    }

                    //Thêm ảnh
                    if (image != null && image.Length > 0)
                    {
                        var url = string.Empty;
                        var pathUpload = Path.Combine(_hostingEnvironment.WebRootPath, "uploads\\images");
                        if (!Directory.Exists(pathUpload)) Directory.CreateDirectory(pathUpload);
                        var fileName = Path.GetFileName(image.FileName);
                        fileName = Path.GetFileNameWithoutExtension(fileName)
                         + "_"
                         + Guid.NewGuid().ToString().Substring(0, 8)
                         + Path.GetExtension(fileName);
                        var filePath = Path.Combine(pathUpload, fileName);
                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            image.CopyTo(stream);
                        }
                        url = "/uploads/images/" + fileName;
                        obj.Image = url;
                    }

                    data.ZoneName = obj.ZoneName;
                    data.ZoneLabel = obj.ZoneLabel;
                    data.ZoneGroup = obj.ZoneGroup;
                    data.ZoneType = obj.ZoneType;
                    data.ZoneLevel = obj.ZoneLevel;
                    data.ZoneHierachy = obj.ZoneHierachy;
                    data.Image = obj.Image;
                    data.SvgIconData = obj.SvgIconData;
                    data.UpdatedBy = ESEIM.AppContext.UserName;
                    data.UpdatedTime = DateTime.Now;
                    _context.ZoneStructs.Update(data);

                    var listChild = GetChildZone(data.ZoneCode);
                    foreach (var item in listChild)
                    {
                        var child = _context.ZoneStructs.FirstOrDefault(x => !x.IsDeleted && x.ZoneCode.Equals(item.Code));
                        if (child != null)
                        {
                            child.ZoneLevel = item.Level + 1 + data.ZoneLevel;
                            child.ZoneHierachy = data.ZoneHierachy;
                            _context.ZoneStructs.Update(child);
                        }
                    }

                    AutoUpdateHierarchy();

                    msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["Vùng"]);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["Vùng không tồn tại"];
                }
            }
            catch
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_ERR_ADD"];
            }
            return Json(msg);
        }

        [HttpPost]
        public void AutoUpdateHierarchy()
        {
            var zones = _context.ZoneStructs.ToList();
            foreach (var item in zones)
            {
                item.ZoneHierachy = GetHierarchy(zones, item, "");
                item.UpdatedBy = ESEIM.AppContext.UserName;
                item.UpdatedTime = DateTime.Now;
            }
            _context.ZoneStructs.UpdateRange(zones);
            _context.SaveChanges();
        }

        [HttpPost]
        public object Delete(int Id)
        {
            var msg = new JMessage { Error = false };
            try
            {
                var data = _context.ZoneStructs.FirstOrDefault(x => !x.IsDeleted && x.ID == Id);
                if (data != null)
                {
                    if (data.IsDeleted)
                    {
                        msg.Error = true;
                        msg.Title = "Vùng đã bị xóa";
                        return Json(msg);
                    }

                    var listChild = _context.ZoneStructs.ToList().Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.ZoneHierachy) && x.ZoneHierachy.Split("/", StringSplitOptions.None).Any(p => p.Equals(data.ZoneCode)));
                    var checkArrange = _context.RecordsPacks.Any(x => !x.IsDeleted && listChild.Any(p => p.ZoneCode.Equals(x.PackZoneLocation)));
                    if (checkArrange)
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["Vùng đã xếp tài liệu không được phép xóa"];
                        return Json(msg);
                    }

                    foreach (var item in listChild)
                    {
                        item.DeletedBy = ESEIM.AppContext.UserName;
                        item.DeletedTime = DateTime.Now;
                        item.IsDeleted = true;
                        _context.ZoneStructs.Update(item);
                    }

                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    data.IsDeleted = true;
                    _context.ZoneStructs.Update(data);
                    _context.SaveChanges();

                    msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer["Vùng"]);
                    return Json(msg);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["Không tìm thấy vùng"];
                    return Json(msg);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_ERR_ADD"];
                return Json(msg);
            }
        }
        #endregion

        #region Attribute
        [HttpPost]
        public object JTableAttributeEx([FromBody]JTableModelCustom jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var listCommon = _context.CommonSettings.Where(x => !x.IsDeleted).Select(x => new { x.CodeSet, x.ValueSet });

            var query = from a in _context.ZoneAttrs.Where(x => !x.IsDeleted)
                        join b in listCommon on a.ZoneGroup equals b.CodeSet into b1
                        from b in b1.DefaultIfEmpty()
                        join c in listCommon on a.ZoneType equals c.CodeSet into c1
                        from c in c1.DefaultIfEmpty()
                        join d in listCommon on a.ZoneAttrUnit equals d.CodeSet into d1
                        from d in d1.DefaultIfEmpty()
                        join e in listCommon on a.ZoneAttrType equals e.CodeSet into e1
                        from e in d1.DefaultIfEmpty()
                        where (a.ZoneType.Equals(jTablePara.ZoneType) && a.ZoneGroup.Equals(jTablePara.ZoneGroup))
                        select new
                        {
                            Id = a.ID,
                            a.ZoneAttrCode,
                            a.ZoneAttrName,
                            a.ZoneAttrValue,
                            a.ZoneAttrUnit,
                            a.ZoneAttrType,
                            a.ZoneType,
                            a.ZoneGroup,
                            ZoneAttrUnitName = d != null ? d.ValueSet : "",
                            ZoneAttrTypeName = e != null ? e.ValueSet : "",
                            ZoneGroupName = b != null ? b.ValueSet : "",
                            ZoneTypeName = c != null ? c.ValueSet : "",
                        };

            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, query.Count(), "Id", "ZoneAttrCode", "ZoneAttrName", "ZoneAttrValue", "ZoneAttrUnit", "ZoneAttrType", "ZoneType", "ZoneGroup", "ZoneAttrUnitName", "ZoneAttrTypeName", "ZoneGroupName", "ZoneTypeName");
            return Json(jdata);
        }

        [HttpPost]
        public object JTableAttribute([FromBody]JTableModelCustom jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var listCommon = _context.CommonSettings.Where(x => !x.IsDeleted).Select(x => new { x.CodeSet, x.ValueSet });

            var query = from a in _context.ZoneAttrs.Where(x => !x.IsDeleted)
                        join b in listCommon on a.ZoneGroup equals b.CodeSet into b1
                        from b in b1.DefaultIfEmpty()
                        join c in listCommon on a.ZoneType equals c.CodeSet into c1
                        from c in c1.DefaultIfEmpty()
                        join d in listCommon on a.ZoneAttrUnit equals d.CodeSet into d1
                        from d in d1.DefaultIfEmpty()
                        join e in listCommon on a.ZoneAttrType equals e.CodeSet into e1
                        from e in d1.DefaultIfEmpty()
                        select new
                        {
                            Id = a.ID,
                            a.ZoneAttrCode,
                            a.ZoneAttrName,
                            a.ZoneAttrValue,
                            a.ZoneAttrUnit,
                            a.ZoneAttrType,
                            a.ZoneType,
                            a.ZoneGroup,
                            ZoneAttrUnitName = d != null ? d.ValueSet : "",
                            ZoneAttrTypeName = e != null ? e.ValueSet : "",
                            ZoneGroupName = b != null ? b.ValueSet : "",
                            ZoneTypeName = c != null ? c.ValueSet : "",
                        };

            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, query.Count(), "Id", "ZoneAttrCode", "ZoneAttrName", "ZoneAttrValue", "ZoneAttrUnit", "ZoneAttrType", "ZoneType", "ZoneGroup", "ZoneAttrUnitName", "ZoneAttrTypeName", "ZoneGroupName", "ZoneTypeName");
            return Json(jdata);
        }

        [HttpPost]
        public JsonResult InsertAttribute([FromBody]ZoneAttr obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var checkExist = _context.ZoneAttrs.FirstOrDefault(x => !x.IsDeleted && x.ZoneAttrCode.Equals(obj.ZoneAttrCode));
                if (checkExist == null)
                {
                    obj.CreatedBy = ESEIM.AppContext.UserName;
                    obj.CreatedTime = DateTime.Now;
                    _context.ZoneAttrs.Add(obj);
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["Thuộc tính"]);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_MSG_EXITS"], _stringLocalizer["Thuộc tính"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_ADD_FAILED"], _stringLocalizer["Thuộc tính"]);
            }
            return Json(msg);
        }

        [HttpPost]
        public object GetDetailAttribute(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.ZoneAttrs.FirstOrDefault(x => !x.IsDeleted && x.ID == id);
                if (data != null)
                {
                    msg.Object = data;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["Thuộc tính không tồn tại"];
                }
            }
            catch (Exception ex)
            {
                throw;
            }

            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateAttribute([FromBody]ZoneAttr obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.ZoneAttrs.Where(x => !x.IsDeleted && x.ZoneAttrCode.Equals(obj.ZoneAttrCode)).FirstOrDefault();
                if (data != null)
                {
                    data.ZoneAttrName = obj.ZoneAttrName;
                    data.ZoneAttrSize = obj.ZoneAttrSize;
                    data.ZoneAttrType = obj.ZoneAttrType;
                    data.ZoneAttrUnit = obj.ZoneAttrUnit;
                    data.ZoneAttrValue = obj.ZoneAttrValue;
                    data.ZoneGroup = obj.ZoneGroup;
                    data.ZoneType = obj.ZoneType;
                    data.UpdatedBy = ESEIM.AppContext.UserName;
                    data.UpdatedTime = DateTime.Now;
                    _context.ZoneAttrs.Update(data);
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["Thuộc tính"]);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["Thuộc tính không tồn tại"];
                }
            }
            catch
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_ERR_ADD"];
            }
            return Json(msg);
        }

        [HttpPost]
        public object DeleteAttribute(int Id)
        {
            var msg = new JMessage { Error = false };
            try
            {
                var data = _context.ZoneAttrs.FirstOrDefault(x => !x.IsDeleted && x.ID == Id);
                if (data != null)
                {
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    data.IsDeleted = true;
                    _context.ZoneAttrs.Update(data);
                    _context.SaveChanges();

                    msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer["Thuộc tính"]);
                    return Json(msg);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["Không tìm thấy thuộc tính"];
                    return Json(msg);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_ERR_ADD"];
                return Json(msg);
            }
        }

        #endregion

        #region Model
        public class JTableModelCustom : JTableModel
        {
            public string ZoneGroup { set; get; }
            public string ZoneType { set; get; }
        }

        public class ZoneModel
        {
            public int Id { get; set; }

            public string ZoneCode { get; set; }

            public string ZoneName { get; set; }

            public string ZoneLabel { get; set; }

            public int? ZoneLevel { get; set; }

            public string ZoneParent { get; set; }

            public string ZoneHierachy { get; set; }

            public string ZoneType { get; set; }

            public string ZoneGroup { get; set; }
            public bool HasChild { get; set; }
        }

        #endregion

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .DistinctBy(x => x.Name);
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion
    }
}