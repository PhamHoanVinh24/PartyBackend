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
using Microsoft.AspNetCore.Authorization;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class WarehousePackManagerController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IStringLocalizer<WarehousePackManagerController> _stringLocalizer;
        private readonly IStringLocalizer<ZoneManagerController> _stringLocalizerZm;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public WarehousePackManagerController(EIMDBContext context, IStringLocalizer<WarehousePackManagerController> stringLocalizer, IStringLocalizer<ZoneManagerController> stringLocalizerZm, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _stringLocalizerZm = stringLocalizerZm;
            _sharedResources = sharedResources;
        }
        [Breadcrumb("ViewData.CrumbPackManager", AreaName = "Admin", FromAction = "Index", FromController = typeof(NomalListWareHouseHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuStore"] = _sharedResources["COM_CRUMB_MENU_STORE"];
            ViewData["CrumbNormalWHHome"] = _sharedResources["COM_BREAD_CRUMB_COMMON_CATE"];
            ViewData["CrumbPackManager"] = _sharedResources["WPM_PACK"];
            return View();
        }

        #region Combo box

        [HttpPost]
        public JsonResult GetPackGroup()
        {
            var data = _context.CommonSettings.Where(x => !x.IsDeleted
            && x.Group == EnumHelper<RecordsPackEnum>.GetDisplayValue(RecordsPackEnum.PackGroup))
            .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetPackType()
        {
            var data = _context.CommonSettings.Where(x => !x.IsDeleted
            && x.Group == EnumHelper<RecordsPackEnum>.GetDisplayValue(RecordsPackEnum.PackType))
            .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetUnitPack()
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

        [HttpPost]
        public List<TreeView> GetTreeRecordsPack()
        {
            var data = _context.WarehouseRecordsPacks.Where(x => !x.IsDeleted);
            var dataOrder = GetSubTreeRecordsPack(data.ToList(), null, new List<TreeView>(), 0);
            return dataOrder;
        }
        
        [AllowAnonymous]
        [HttpPost]
        public List<TreeView> GetTreePack(string packType, string packLevel)
        {
            var data = _context.WarehouseRecordsPacks.Where(x => !x.IsDeleted);
            var dataOrder = GetSubTreeRecordsPack(data.ToList(), null, new List<TreeView>(), 0);
            return dataOrder;
        }

        private List<TreeView> GetSubTreeRecordsPack(List<WarehouseRecordsPack> data, string catParent, List<TreeView> lstCategories, int tab)
        {
            //tab += "- ";
            var contents = (catParent == null)
                ? data.Where(x => string.IsNullOrEmpty(x.PackParent) && x.IsDeleted == false).OrderBy(x => x.PackName).ToList()
                : data.Where(x => x.PackParent == catParent && x.IsDeleted == false).OrderBy(x => x.PackName).ToList();
            foreach (var item in contents)
            {
                var category = new TreeView
                {
                    Id = item.ID,
                    Code = item.PackCode,
                    Title = item.PackName,
                    ParentCode = item.PackParent,
                    Level = tab,
                    HasChild = data.Any(x => !string.IsNullOrEmpty(x.PackParent) && x.PackParent.Equals(item.PackCode))
                };
                lstCategories.Add(category);
                if (category.HasChild) GetSubTreeRecordsPack(data, item.PackCode, lstCategories, tab + 1);
            }
            return lstCategories;
        }

        #endregion

        #region Grid Records Pack
        [HttpPost]
        public object GetTreeData()
        {
            var query = (from a in _context.WarehouseRecordsPacks
                         join b in _context.CommonSettings.Where(p => !p.IsDeleted) on a.PackGroup equals b.CodeSet into b1
                         from b in b1.DefaultIfEmpty()
                         join c in _context.CommonSettings.Where(p => !p.IsDeleted) on a.PackType equals c.CodeSet into c1
                         from c in c1.DefaultIfEmpty()
                             //let attr = _context.ZoneAttrs.FirstOrDefault(x => !x.IsDeleted && x.ZoneAttrCode.Equals("QUANTITY") && x.ZoneGroup.Equals(a.ZoneGroup) && x.ZoneType.Equals(a.ZoneType))
                         let parent = _context.WarehouseRecordsPacks.FirstOrDefault(x => x.PackCode.Equals(a.PackParent))
                         select new ZoneStructModel
                         {
                             Id = a.ID,
                             ZoneParent = a.PackParent,
                             ZoneParentId = parent != null ? parent.ID : 0,
                             ZoneCode = a.PackCode,
                             ZoneLabel = a.PackLabel,
                             ZoneName = a.PackName,
                             ZoneLevel = int.Parse(a.PackLevel),
                             ZoneGroup = b != null ? b.ValueSet : "",
                             ZoneType = c != null ? c.ValueSet : "",
                             Status = a.IsDeleted ? _stringLocalizer["WPM_NOT_ACTIVE"] : _stringLocalizer["WPM_ACTIVE"],
                             Quantity = a.PackQuantity.ToString()
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
        public JsonResult DeleteRecordsPack(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.WarehouseRecordsPacks.FirstOrDefault(x => x.ID == id);
                if (data != null)
                {
                    data.IsDeleted = true;
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    _context.WarehouseRecordsPacks.Update(data);

                    var listChild = GetChildRecordsPack(data.PackCode);
                    foreach (var item in listChild)
                    {
                        var child = _context.WarehouseRecordsPacks.FirstOrDefault(x => item.Code == x.PackCode);
                        if (child != null)
                        {
                            child.IsDeleted = true;
                            child.DeletedBy = ESEIM.AppContext.UserName;
                            child.DeletedTime = DateTime.Now;
                            _context.WarehouseRecordsPacks.Update(child);

                            var lstFileChild = _context.WarehouseRecordsPackFiles.Where(x => !x.IsDeleted && x.PackCode.Equals(data.PackCode));

                            foreach (var fileChild in lstFileChild)
                            {
                                fileChild.IsDeleted = true;
                                fileChild.DeletedBy = ESEIM.AppContext.UserName;
                                fileChild.DeletedTime = DateTime.Now;
                                _context.WarehouseRecordsPackFiles.Update(fileChild);
                            }
                        }
                    }

                    var lstFileParent = _context.WarehouseRecordsPackFiles.Where(x => !x.IsDeleted && x.PackCode.Equals(data.PackCode));
                    foreach (var item in lstFileParent)
                    {
                        item.IsDeleted = true;
                        item.DeletedBy = ESEIM.AppContext.UserName;
                        item.DeletedTime = DateTime.Now;
                        _context.WarehouseRecordsPackFiles.Update(item);
                    }

                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["WPM_RECORD_PACK_NOT_EXIST"];
                }
            }
            catch (Exception)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }
        #endregion

        #region Records Pack Attribute
        [HttpPost]
        public object JTablePackAttribute([FromBody]ModelRecordsPackAttr jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var listCommon = _context.CommonSettings.Where(x => !x.IsDeleted).Select(x => new { x.CodeSet, x.ValueSet });

            var query = from a in _context.WarehouseRecordsPackAttrs.Where(x => !x.IsDeleted)
                        join b in listCommon on a.PackAttrGroup equals b.CodeSet into b1
                        from b in b1.DefaultIfEmpty()
                        join c in listCommon on a.PackAttrType equals c.CodeSet into c1
                        from c in c1.DefaultIfEmpty()
                        join d in listCommon on a.PackAttrUnit equals d.CodeSet into d1
                        from d in d1.DefaultIfEmpty()
                        join e in listCommon on a.PackAttrDataType equals e.CodeSet into e1
                        from e in d1.DefaultIfEmpty()
                        select new
                        {
                            a.ID,
                            a.PackAttrCode,
                            a.PackAttrName,
                            a.PackAttrValue,
                            a.PackAttrSize,
                            PackAttrType = c != null ? c.ValueSet : "",
                            PackAttrGroup = b != null ? b.ValueSet : "",
                            PackAttrUnit = d != null ? d.ValueSet : "",
                            PackAttrDataType = e != null ? e.ValueSet : ""
                        };

            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, query.Count(), "ID", "PackAttrCode",
                    "PackAttrName", "PackAttrValue", "PackAttrUnit", "PackAttrSize", "PackAttrType", "PackAttrGroup",
                    "PackAttrDataType");
            return Json(jdata);
        }

        [HttpPost]
        public JsonResult InsertPackAttribute([FromBody]WarehouseRecordsPackAttr obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var checkExist = _context.WarehouseRecordsPackAttrs.FirstOrDefault(x => x.PackAttrCode.Equals(obj.PackAttrCode) && !x.IsDeleted);
                if (checkExist == null)
                {
                    obj.CreatedBy = ESEIM.AppContext.UserName;
                    obj.CreatedTime = DateTime.Now;

                    var recordsPackAttr = new WarehouseRecordsPackAttr
                    {
                        Zone = obj.Zone,
                        PackAttrCode = obj.PackAttrCode,
                        PackAttrName = obj.PackAttrName,
                        PackAttrValue = obj.PackAttrValue,
                        PackAttrUnit = obj.PackAttrUnit,
                        PackAttrSize = obj.PackAttrSize,
                        PackAttrType = obj.PackAttrType,
                        PackAttrGroup = obj.PackAttrGroup,
                        PackAttrDataType = obj.PackAttrDataType,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now
                    };

                    _context.WarehouseRecordsPackAttrs.Add(recordsPackAttr);
                    _context.SaveChanges();
                    msg.Title = string.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["WPM_ATTR"]);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = string.Format(_sharedResources["COM_MSG_EXITS"], _stringLocalizer["WPM_ATTR"]);
                }
            }
            catch
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdatePackAttribute([FromBody]WarehouseRecordsPackAttr obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.WarehouseRecordsPackAttrs.Where(x => x.PackAttrCode.Equals(obj.PackAttrCode) && !x.IsDeleted).FirstOrDefault();
                if (data != null)
                {
                    data.PackAttrName = obj.PackAttrName;
                    data.PackAttrValue = obj.PackAttrValue;
                    data.PackAttrUnit = obj.PackAttrUnit;
                    data.PackAttrType = obj.PackAttrType;
                    data.PackAttrGroup = obj.PackAttrGroup;
                    data.PackAttrSize = obj.PackAttrSize;
                    data.PackAttrDataType = obj.PackAttrDataType;

                    data.UpdatedBy = ESEIM.AppContext.UserName;
                    data.UpdatedTime = DateTime.Now;
                    _context.WarehouseRecordsPackAttrs.Update(data);
                    _context.SaveChanges();
                    msg.Title = string.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["WPM_ATTR"]);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = string.Format(_sharedResources["COM_MSG_NOT_EXITS"], _stringLocalizer["WPM_ATTR"]);
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
        public object DeletePackAttribute(int Id)
        {
            var msg = new JMessage { Title = "", Error = false };
            try
            {
                var data = _context.WarehouseRecordsPackAttrs.FirstOrDefault(x => x.ID == Id);
                if (data != null)
                {
                    data.IsDeleted = true;
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    _context.WarehouseRecordsPackAttrs.Update(data);
                    _context.SaveChanges();
                    msg.Title = string.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer["WPM_ATTR"]);
                    return Json(msg);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = string.Format(_sharedResources["COM_MSG_NOT_EXITS"], _stringLocalizer["WPM_ATTR"]);
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

        [HttpPost]
        public JsonResult GetItemPackAttr(int id)
        {
            var msg = new JMessage();
            var data = _context.WarehouseRecordsPackAttrs.FirstOrDefault(x => x.ID == id);
            if (data != null)
            {
                msg.Object = data;
                return Json(msg);
            }
            else
            {
                msg.Error = true;
                msg.Title = string.Format(_sharedResources["COM_MSG_NOT_EXITS"], _stringLocalizer["WPM_ATTR"]);
                return Json(msg);
            }

        }
        #endregion

        #region Records Pack

        [HttpPost]
        public JsonResult InsertRecordsPack([FromBody] WarehouseRecordsPack obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var check = _context.WarehouseRecordsPacks.FirstOrDefault(x => !x.IsDeleted && x.PackCode.ToLower().Equals(obj.PackCode.ToLower()));
                if (check != null)
                {
                    msg.Error = true;
                    msg.Title = "Đã tồn tại đối tượng hồ sơ";
                    return Json(msg);
                }
                var record = new WarehouseRecordsPack
                {
                    PackCode = obj.PackCode,
                    PackName = obj.PackName,
                    PackGroup = obj.PackGroup,
                    PackType = obj.PackType,
                    PackHierarchyPath = obj.PackHierarchyPath,
                    PackZoneLocation = obj.PackZoneLocation,
                    PackLevel = obj.PackLevel,
                    PackParent = obj.PackParent,
                    PackQuantity = obj.PackQuantity,
                    QrCode = obj.PackCode,
                    PackLabel = obj.PackLabel,
                    PackStatus = "",
                    CreatedBy = ESEIM.AppContext.UserName,
                    CreatedTime = DateTime.Now
                };
                _context.WarehouseRecordsPacks.Add(record);
                _context.SaveChanges();
                msg.Title = _sharedResources["COM_ADD_SUCCESS"];
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateRecordsPack([FromBody] WarehouseRecordsPack obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var check = _context.WarehouseRecordsPacks.FirstOrDefault(x => !x.IsDeleted && x.PackCode.Equals(obj.PackCode));
                if (check != null)
                {
                    if (check.PackCode.Equals(obj.PackParent))
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["WPM_PACK_CODE_MATCH_PARENT"];
                    }
                    else
                    {
                        check.UpdatedBy = ESEIM.AppContext.UserName;
                        check.UpdatedTime = DateTime.Now;
                        check.PackGroup = obj.PackGroup;
                        check.PackType = obj.PackType;
                        check.PackHierarchyPath = obj.PackHierarchyPath;
                        check.PackLabel = obj.PackLabel;
                        check.PackLevel = obj.PackLevel;
                        check.PackName = obj.PackName;
                        check.PackParent = obj.PackParent;
                        check.PackQuantity = obj.PackQuantity;
                        check.PackStatus = "";
                        check.PackZoneLocation = obj.PackZoneLocation;
                        _context.WarehouseRecordsPacks.Update(check);

                        var listChild = GetChildRecordsPack(check.PackCode);
                        foreach (var item in listChild)
                        {
                            var child = _context.WarehouseRecordsPacks.FirstOrDefault(x => !x.IsDeleted && x.PackCode.Equals(item.Code));
                            if (child != null)
                            {
                                child.PackLevel = (item.Level + 1 + int.Parse(check.PackLevel)).ToString();
                                child.PackZoneLocation = check.PackZoneLocation;
                                _context.WarehouseRecordsPacks.Update(child);
                            }
                        }

                        _context.SaveChanges();
                        msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["WPM_RECORD_PACK_NOT_EXIST"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetItemRecordsPack(int id)
        {
            var data = _context.WarehouseRecordsPacks.FirstOrDefault(x => !x.IsDeleted && x.ID == id);
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetInfoRecordsPack(string packCode)
        {
            var data = _context.WarehouseRecordsPacks.FirstOrDefault(x => !x.IsDeleted && x.PackCode.Equals(packCode));
            if (data != null)
            {
                var listRecordsPack = _context.WarehouseRecordsPacks.Where(x => !x.IsDeleted).ToList();
                var hierarchy = GetHierarchy(listRecordsPack, data, "");
                data.PackHierarchyPath = hierarchy;
            }
            return Json(data);
        }

        [NonAction]
        private string GetHierarchy(List<WarehouseRecordsPack> recordsPacks, WarehouseRecordsPack obj, string hierarchy)
        {
            if (!string.IsNullOrEmpty(obj.PackParent))
            {
                hierarchy = obj.PackCode + (!string.IsNullOrEmpty(hierarchy) ? ("/" + hierarchy) : "");
                var packParent = recordsPacks.FirstOrDefault(x => !x.IsDeleted && x.PackCode.Equals(obj.PackParent));
                if (packParent != null)
                {
                    hierarchy = packParent.PackCode + "/" + hierarchy;
                    if (!string.IsNullOrEmpty(packParent.PackParent))
                    {
                        var record = recordsPacks.FirstOrDefault(x => !x.IsDeleted && x.PackCode.Equals(packParent.PackParent));
                        hierarchy = GetHierarchy(recordsPacks, record, hierarchy);
                    }
                }
            }
            else
            {
                hierarchy = obj.PackCode + (!string.IsNullOrEmpty(hierarchy) ? ("/" + hierarchy) : "");
            }

            return hierarchy;
        }

        [HttpPost]
        public object JTableRecordsPack([FromBody]ModelRecordsPackAttr jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var listCommon = _context.CommonSettings.Where(x => !x.IsDeleted).Select(x => new { x.CodeSet, x.ValueSet });

            var query = from a in _context.WarehouseRecordsPackAttrs.Where(x => !x.IsDeleted)
                        join b in listCommon on a.PackAttrGroup equals b.CodeSet into b1
                        from b in b1.DefaultIfEmpty()
                        join c in listCommon on a.PackAttrType equals c.CodeSet into c1
                        from c in c1.DefaultIfEmpty()
                        join d in listCommon on a.PackAttrUnit equals d.CodeSet into d1
                        from d in d1.DefaultIfEmpty()
                        join e in listCommon on a.PackAttrDataType equals e.CodeSet into e1
                        from e in d1.DefaultIfEmpty()
                        where a.PackAttrType.Equals(jTablePara.PackType)
                        select new
                        {
                            a.ID,
                            a.PackAttrCode,
                            a.PackAttrName,
                            a.PackAttrValue,
                            a.PackAttrSize,
                            PackAttrType = c != null ? c.ValueSet : "",
                            PackAttrGroup = b != null ? b.ValueSet : "",
                            PackAttrUnit = d != null ? d.ValueSet : "",
                            PackAttrDataType = e != null ? e.ValueSet : ""
                        };

            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, query.Count(), "ID", "PackAttrCode",
                    "PackAttrName", "PackAttrValue", "PackAttrUnit", "PackAttrSize", "PackAttrType", "PackAttrGroup",
                    "PackAttrDataType");
            return Json(jdata);
        }

        #endregion

        #region Records Pack Arrange
        [HttpGet]
        public JsonResult GetRecordsPack(string packType, string level)
        {
            var query = _context.WarehouseRecordsPacks.Where(x => !x.IsDeleted && (string.IsNullOrEmpty(packType) || x.PackType.Equals(packType))
                        && (string.IsNullOrEmpty(level) || x.PackLevel.Equals(level)))
                        .Select(x => new { x.PackCode, x.PackName, x.PackLevel, x.PackParent });
            return Json(query);
        }

        [HttpGet]
        public JsonResult GetInfoRecordsPackParent(string packCode)
        {
            var data = _context.WarehouseRecordsPacks.FirstOrDefault(x => !x.IsDeleted && x.PackCode.Equals(packCode));
            return Json(data);
        }

        #endregion

        #region Encapsulate
        [HttpPost]
        public JsonResult EncapsulateRecordsPack([FromBody]Encapsulate obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var listRecordsPack = _context.WarehouseRecordsPacks.Where(x => !x.IsDeleted).ToList();
                var packDes = _context.WarehouseRecordsPacks.FirstOrDefault(x => !x.IsDeleted && x.PackCode.Equals(obj.RecordsPack));

                var isSameBranch = CheckSameBranch(obj.ListRecordsPack, obj.RecordsPack);
                if (isSameBranch)
                {
                    var recordPack = _context.WarehouseRecordsPacks.FirstOrDefault(x => !x.IsDeleted && x.PackCode.Equals(obj.ListRecordsPack));
                    if (recordPack != null)
                    {
                        if (packDes != null && recordPack.PackParent.Equals(packDes.PackCode))
                        {
                            var packDesLevel = packDes.PackLevel;
                            var packDesParent = packDes.PackParent;

                            packDes.PackParent = recordPack.PackCode;
                            packDes.PackLevel = recordPack.PackLevel;

                            recordPack.PackLevel = packDesLevel;
                            recordPack.PackParent = packDesParent;

                            var childRecordPack = _context.WarehouseRecordsPacks.Where(x => !x.IsDeleted && x.PackParent.Equals(recordPack.PackCode));
                            foreach (var childPack in childRecordPack)
                            {
                                childPack.PackParent = packDes.PackCode;
                            }
                            _context.WarehouseRecordsPacks.UpdateRange(childRecordPack);
                        }
                        else if (packDes != null && packDes.PackParent.Equals(recordPack.PackCode))
                        {
                            var packDesLevel = recordPack.PackLevel;
                            var packDesParent = recordPack.PackParent;

                            recordPack.PackParent = packDes.PackCode;
                            recordPack.PackLevel = packDes.PackLevel;

                            packDes.PackLevel = packDesLevel;
                            packDes.PackParent = packDesParent;

                            var childRecordDes = _context.WarehouseRecordsPacks.Where(x => !x.IsDeleted && x.PackParent.Equals(packDes.PackCode));
                            foreach (var childPack in childRecordDes)
                            {
                                childPack.PackParent = recordPack.PackCode;
                            }
                            _context.WarehouseRecordsPacks.UpdateRange(childRecordDes);
                        }
                        else
                        {
                            var recordParent = recordPack.PackParent;
                            var recordLevel = recordPack.PackLevel;

                            if (packDes != null)
                            {
                                recordPack.PackParent = packDes.PackParent;
                                recordPack.PackLevel = packDes.PackLevel;

                                packDes.PackParent = recordParent;
                                packDes.PackLevel = recordLevel;

                                var childRecordPack = _context.WarehouseRecordsPacks.Where(x =>
                                    !x.IsDeleted && x.PackParent.Equals(recordPack.PackCode));
                                foreach (var childPack in childRecordPack)
                                {
                                    childPack.PackParent = packDes.PackCode;
                                }

                                _context.WarehouseRecordsPacks.UpdateRange(childRecordPack);

                                var childPackDes = _context.WarehouseRecordsPacks.Where(x =>
                                    !x.IsDeleted && x.PackParent.Equals(packDes.PackCode));
                                foreach (var childPackDesItem in childPackDes)
                                {
                                    childPackDesItem.PackParent = recordPack.PackCode;
                                }

                                _context.WarehouseRecordsPacks.UpdateRange(childPackDes);
                            }
                        }

                        _context.WarehouseRecordsPacks.Update(recordPack);
                        if (packDes != null) _context.WarehouseRecordsPacks.Update(packDes);
                    }
                }
                else
                {
                    var recordsPack = _context.WarehouseRecordsPacks.FirstOrDefault(x => !x.IsDeleted && x.PackCode.Equals(obj.ListRecordsPack));

                    if (recordsPack != null)
                    {
                        recordsPack.PackParent = obj.RecordsPack;
                        if (packDes != null) recordsPack.PackLevel = (int.Parse(packDes.PackLevel) + 1).ToString();

                        recordsPack.UpdatedBy = ESEIM.AppContext.UserName;
                        recordsPack.UpdatedTime = DateTime.Now;
                        _context.WarehouseRecordsPacks.Update(recordsPack);
                    }
                }
                _context.SaveChanges();

                msg.Title = _stringLocalizer["WPM_ENCAPSULATE_SUCCESS"];
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [NonAction]
        private bool CheckSameBranch(string packSrc, string packDes)
        {
            bool isSame = false;
            var data = _context.WarehouseRecordsPacks.FirstOrDefault(x => !x.IsDeleted && x.PackCode.Equals(packSrc));
            if (data != null)
            {
                var listRecordsPack = _context.WarehouseRecordsPacks.Where(x => !x.IsDeleted).ToList();
                isSame = CheckIsSameBranch(listRecordsPack, false, data, packDes);
            }
            return isSame;
        }

        [NonAction]
        private bool CheckIsSameBranch(List<WarehouseRecordsPack> listRecordsPack, bool isSame, WarehouseRecordsPack obj, string packDes)
        {
            if (obj.PackCode.Equals(packDes))
            {
                isSame = true;
            }
            else if (!string.IsNullOrEmpty(obj.PackParent))
            {
                if (obj.PackParent.Equals(packDes))
                {
                    isSame = true;
                }
                else
                {
                    var packParent = listRecordsPack.FirstOrDefault(x => !x.IsDeleted && x.PackCode.Equals(obj.PackParent));
                    if (packParent != null)
                    {
                        isSame = CheckIsSameBranch(listRecordsPack, isSame, packParent, packDes);
                    }
                }
            }

            var getChildPack = GetChildRecordsPack(obj.PackCode);
            if (getChildPack.Any(x => x.Code.Equals(packDes)))
            {
                isSame = true;
            }
            return isSame;
        }

        [NonAction]
        private List<TreeView> GetChildRecordsPack(string packCode)
        {
            var data = _context.WarehouseRecordsPacks.OrderBy(x => x.PackName).Where(x => x.PackCode != packCode).AsNoTracking();
            var childRecordsPack = GetSubRecordsPack(data.ToList(), packCode, new List<TreeView>(), 0);
            return childRecordsPack;
        }

        [NonAction]
        private List<TreeView> GetSubRecordsPack(List<WarehouseRecordsPack> data, string catParent, List<TreeView> lstCategories, int tab)
        {
            //tab += "- ";
            var contents = (catParent == null)
                ? data.Where(x => string.IsNullOrEmpty(x.PackParent) && x.IsDeleted == false).OrderBy(x => x.PackName).ToList()
                : data.Where(x => x.PackParent == catParent && x.IsDeleted == false).OrderBy(x => x.PackName).ToList();
            foreach (var item in contents)
            {
                var category = new TreeView
                {
                    Id = item.ID,
                    Code = item.PackCode,
                    Title = item.PackName,
                    Level = tab,
                    HasChild = data.Any(x => x.PackParent == item.PackCode)
                };
                lstCategories.Add(category);
                if (category.HasChild)
                    GetSubRecordsPack(data, item.PackCode, lstCategories, tab + 1);
            }
            return lstCategories;
        }

        [HttpPost]
        public void AutoUpdateHierarchy()
        {
            var recordsPacks = _context.WarehouseRecordsPacks.Where(x => !x.IsDeleted).ToList();
            foreach (var item in recordsPacks)
            {
                item.PackHierarchyPath = GetHierarchy(recordsPacks, item, "");
                item.UpdatedBy = ESEIM.AppContext.UserName;
                item.UpdatedTime = DateTime.Now;
            }
            _context.WarehouseRecordsPacks.UpdateRange(recordsPacks);
            _context.SaveChanges();
        }
        #endregion

        #region Arrange Records Pack
        [HttpPost]
        public JsonResult ArrangeRecordsPack([FromBody]PackArrange obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                bool isSeparate = CheckArrangeRecordPack(obj.ListRecordsPack);
                if (!isSeparate)
                {
                    var recordsPack = _context.WarehouseRecordsPacks.FirstOrDefault(x => !x.IsDeleted && x.PackCode.Equals(obj.ListRecordsPack));
                    if (recordsPack != null)
                    {
                        recordsPack.PackZoneLocation = obj.ZoneCode;
                        recordsPack.UpdatedBy = ESEIM.AppContext.UserName;
                        recordsPack.UpdatedTime = DateTime.Now;
                        _context.WarehouseRecordsPacks.Update(recordsPack);
                    }
                    _context.SaveChanges();
                    msg.Title = _stringLocalizer["WPM_ARRANGE_SUCCESS"];
                }
                else
                {
                    SeparatePack(obj.ListRecordsPack, obj.ZoneCode);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizer["WPM_ARRANGE_SUCCESS"];
                }
            }
            catch (Exception ex)
            {
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Error = true;
            }
            return Json(msg);
        }

        [HttpPost]
        public bool CheckArrangeRecordPack(string packCode)
        {
            bool isArranged = false;
            var recordsPack = _context.WarehouseRecordsPacks.FirstOrDefault(x => !x.IsDeleted && x.PackCode.Equals(packCode));
            if (recordsPack != null)
            {
                if (recordsPack.PackHierarchyPath.Contains("/"))
                {
                    var arrPack = recordsPack.PackHierarchyPath.Split("/", StringSplitOptions.None);
                    foreach (var item in arrPack.Where(x => x != packCode))
                    {
                        var packParent = _context.WarehouseRecordsPacks.FirstOrDefault(x => !x.IsDeleted && x.PackCode.Equals(item));
                        if (packParent != null)
                        {
                            if (!string.IsNullOrEmpty(packParent.PackZoneLocation))
                            {
                                isArranged = true;
                                break;
                            }
                        }
                    }
                }
            }
            return isArranged;
        }

        [NonAction]
        private void SeparatePack(string packCode, string zoneCode)
        {
            var recordsPack = _context.WarehouseRecordsPacks.FirstOrDefault(x => !x.IsDeleted && x.PackCode.Equals(packCode));
            if (recordsPack != null)
            {
                recordsPack.PackParent = "";
                recordsPack.PackZoneLocation = zoneCode;
                recordsPack.PackLevel = "0";
                recordsPack.UpdatedBy = ESEIM.AppContext.UserName;
                recordsPack.UpdatedTime = DateTime.Now;
                _context.WarehouseRecordsPacks.Update(recordsPack);

                var listChild = GetChildRecordsPack(packCode);
                foreach (var item in listChild)
                {
                    var childPack = _context.WarehouseRecordsPacks.FirstOrDefault(x => !x.IsDeleted && x.PackCode.Equals(item.Code));
                    if (childPack != null)
                    {
                        childPack.UpdatedBy = ESEIM.AppContext.UserName;
                        childPack.UpdatedTime = DateTime.Now;
                        childPack.PackZoneLocation = zoneCode;
                        childPack.PackLevel = (item.Level + 1).ToString();

                        _context.WarehouseRecordsPacks.Update(childPack);
                    }
                }
            }
        }

        #endregion

        #region File Record Pack
        [HttpPost]
        public JsonResult InsertRecordsFilePack([FromBody] FilePack obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var check = _context.WarehouseRecordsPackFiles.FirstOrDefault(x => !x.IsDeleted && x.FileCode.Equals(obj.FileCode));
                if (check == null)
                {
                    var file = new WarehouseRecordsPackFile
                    {
                        FileCode = obj.FileCode,
                        PackCode = obj.PackCode,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now
                    };
                    _context.WarehouseRecordsPackFiles.Add(file);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizer["WPM_ADD_FILE_SUCCESS"];
                }
                else
                {
                    var checkPack = _context.WarehouseRecordsPackFiles.FirstOrDefault(x => !x.IsDeleted && x.FileCode.Equals(obj.FileCode)
                                && x.PackCode.Equals(obj.PackCode));
                    if (checkPack != null)
                    {
                        msg.Error = true;
                        msg.Title = msg.Title = _stringLocalizer["WPM_FILE_ALREADY_PACKED"];
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["WPM_FILE_ALREADY_PACK_ANOTHER"];
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult DeleteRecordFile(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var data = _context.WarehouseRecordsPackFiles.FirstOrDefault(x => !x.IsDeleted && x.ID == id);
            if (data != null)
            {
                data.IsDeleted = true;
                data.DeletedBy = ESEIM.AppContext.UserName;
                data.DeletedTime = DateTime.Now;

                _context.WarehouseRecordsPackFiles.Update(data);
                _context.SaveChanges();
                msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
            }
            else
            {
                msg.Error = true;
                msg.Title = _stringLocalizer["WPM_FILE_NOT_EXIST"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetFileEdms()
        {
            var query = from a in _context.EDMSRepoCatFiles
                        join b in _context.EDMSFiles.Where(x => !x.IsDeleted && (x.IsFileMaster == null || x.IsFileMaster == true)) on a.FileCode equals b.FileCode
                        join f in _context.EDMSRepositorys on a.ReposCode equals f.ReposCode into f1
                        from f in f1.DefaultIfEmpty()
                        select new
                        {
                            a.Id,
                            Code = b.FileCode,
                            b.FileName,
                            b.FileTypePhysic,
                            TypeFile = "NO_SHARE",
                            ReposName = f != null ? f.ReposName : "",
                            b.IsFileMaster,
                            b.Url
                        };
            return Json(query);
        }

        [HttpPost]
        public JsonResult JTableFileRecordPack([FromBody] JTableFilePack jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.WarehouseRecordsPackFiles.Where(x => !x.IsDeleted && x.PackCode.Equals(jTablePara.PackCode))
                        join b in _context.EDMSFiles.Where(x => !x.IsDeleted && (x.IsFileMaster == null || x.IsFileMaster == true)) on a.FileCode equals b.FileCode
                        select new
                        {
                            Id = a.ID,
                            a.FileCode,
                            b.FileName,
                            b.Url
                        };

            int count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "FileCode", "FileName", "Url");
            return Json(jdata);
        }

        #endregion

        #region Records Pack Arrange File EDMS

        [HttpPost]
        public JsonResult GetPackOfFile(string fileCode)
        {
            var data = _context.WarehouseRecordsPackFiles.FirstOrDefault(x => !x.IsDeleted && x.FileCode.Equals(fileCode));
            return Json(data);
        }

        [HttpPost]
        public JsonResult FileToPack([FromBody] FilePack obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.WarehouseRecordsPackFiles.FirstOrDefault(x => !x.IsDeleted && x.FileCode.Equals(obj.FileCode));
                if (data != null)
                {
                    data.PackCode = obj.PackCode;
                    data.UpdatedBy = ESEIM.AppContext.UserName;
                    data.UpdatedTime = DateTime.Now;
                    _context.WarehouseRecordsPackFiles.Update(data);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizer["WPM_PACKAGE_UPDATE_SUCCESS"];
                }
                else
                {
                    var file = new WarehouseRecordsPackFile
                    {
                        PackCode = obj.PackCode,
                        FileCode = obj.FileCode,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now
                    };
                    _context.WarehouseRecordsPackFiles.Add(file);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizer["WPM_ENCAPSULATE_SUCCESS"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetZoneFileInPack(string packCode)
        {
            var data = _context.WarehouseRecordsPacks.FirstOrDefault(x => !x.IsDeleted && x.PackCode.Equals(packCode));
            return Json(data);
        }
        #endregion

        #region Model custom

        public class JTableFilePack : JTableModel
        {
            public string PackCode { get; set; }
        }

        public class FilePack
        {
            public string FileCode { get; set; }
            public string PackCode { get; set; }
        }

        public class ModelRecordsPackAttr : JTableModel
        {
            public string PackType { get; set; }
        }

        public class Encapsulate
        {
            public string RecordsPack { get; set; }
            public string ListRecordsPack { get; set; }
        }

        public class PackArrange
        {
            public string ZoneCode { get; set; }
            public string ListRecordsPack { get; set; }
        }

        public class RecordsPackInfo
        {
            public string PackName { get; set; }
            public string PackCode { get; set; }
            public string PackParent { get; set; }
            public string PackParentName { get; set; }
        }
        #endregion

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_stringLocalizerZm.GetAllStrings().Select(x => new { x.Name, x.Value }))
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