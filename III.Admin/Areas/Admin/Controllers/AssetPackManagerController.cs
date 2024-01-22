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

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class AssetPackManagerController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IStringLocalizer<ZoneManagerController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public AssetPackManagerController(EIMDBContext context, IStringLocalizer<ZoneManagerController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }
        [Breadcrumb("ViewData.CrumbPackManager", AreaName = "Admin", FromAction = "Index", FromController = typeof(WarehouseDigitalHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbWHDHome"] = _sharedResources["COM_CRUMB_WH_DIGITAL_HOME"];
            ViewData["CrumbPackManager"] = _sharedResources["Đóng gói tài sản"];
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
            var data = _context.AssetRecordsPacks.Where(x => !x.IsDeleted);
            var dataOrder = GetSubTreeRecordsPack(data.ToList(), null, new List<TreeView>(), 0);
            return dataOrder;
        }

        private List<TreeView> GetSubTreeRecordsPack(List<AssetRecordsPack> data, string catParent, List<TreeView> lstCategories, int tab)
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
                    HasChild = data.Any(x => x.PackParent.Equals(item.PackCode)),
                    ParentCode = item.PackParent
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
            var query = (from a in _context.AssetRecordsPacks
                         join b in _context.CommonSettings.Where(p => !p.IsDeleted) on a.PackGroup equals b.CodeSet into b1
                         from b in b1.DefaultIfEmpty()
                         join c in _context.CommonSettings.Where(p => !p.IsDeleted) on a.PackType equals c.CodeSet into c1
                         from c in c1.DefaultIfEmpty()
                             //let attr = _context.ZoneAttrs.FirstOrDefault(x => !x.IsDeleted && x.ZoneAttrCode.Equals("QUANTITY") && x.ZoneGroup.Equals(a.ZoneGroup) && x.ZoneType.Equals(a.ZoneType))
                         let parent = _context.AssetRecordsPacks.FirstOrDefault(x => x.PackCode.Equals(a.PackParent))
                         select new ZoneStructModel
                         {
                             Id = a.ID,
                             ZoneParent = a.PackParent,
                             ZoneParentId = parent != null ? parent.ID : 0,
                             ZoneCode = a.PackCode,
                             ZoneLabel = a.PackLabel,
                             ZoneName = a.PackName,
                             ZoneLevel = Int32.Parse(a.PackLevel),
                             ZoneGroup = b != null ? b.ValueSet : "",
                             ZoneType = c != null ? c.ValueSet : "",
                             Status = a.IsDeleted ? "Không hoạt động" : "Hoạt động",
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
                var data = _context.AssetRecordsPacks.FirstOrDefault(x => x.ID == id);
                if (data != null)
                {
                    data.IsDeleted = true;
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    _context.AssetRecordsPacks.Update(data);

                    var listChild = GetChildRecordsPack(data.PackCode);
                    foreach (var item in listChild)
                    {
                        var child = _context.AssetRecordsPacks.FirstOrDefault(x => item.Code == x.PackCode);
                        if (child != null)
                        {
                            child.IsDeleted = true;
                            child.DeletedBy = ESEIM.AppContext.UserName;
                            child.DeletedTime = DateTime.Now;
                            _context.AssetRecordsPacks.Update(child);
                        }
                    }

                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Đối tượng hồ sơ không tồn tại";
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

            var query = from a in _context.AssetRecordsPackAttrs.Where(x => !x.IsDeleted)
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
        public JsonResult InsertPackAttribute([FromBody]AssetRecordsPackAttr obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var checkExist = _context.AssetRecordsPackAttrs.FirstOrDefault(x => x.PackAttrCode.Equals(obj.PackAttrCode) && !x.IsDeleted);
                if (checkExist == null)
                {
                    obj.CreatedBy = ESEIM.AppContext.UserName;
                    obj.CreatedTime = DateTime.Now;

                    var recordsPackAttr = new AssetRecordsPackAttr
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

                    _context.AssetRecordsPackAttrs.Add(recordsPackAttr);
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["Thuộc tính"]);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_MSG_EXITS"], _stringLocalizer["Thuộc tính"]);
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
        public JsonResult UpdatePackAttribute([FromBody]AssetRecordsPackAttr obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.AssetRecordsPackAttrs.Where(x => x.PackAttrCode.Equals(obj.PackAttrCode) && !x.IsDeleted).FirstOrDefault();
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
                    _context.AssetRecordsPackAttrs.Update(data);
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
        public object DeletePackAttribute(int Id)
        {
            var msg = new JMessage { Title = "", Error = false };
            try
            {
                var data = _context.AssetRecordsPackAttrs.FirstOrDefault(x => x.ID == Id);
                if (data != null)
                {
                    data.IsDeleted = true;
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    _context.AssetRecordsPackAttrs.Update(data);
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

        [HttpPost]
        public JsonResult GetItemPackAttr(int id)
        {
            var msg = new JMessage();
            var data = _context.AssetRecordsPackAttrs.FirstOrDefault(x => x.ID == id);
            if (data != null)
            {
                msg.Object = data;
                return Json(msg);
            }
            else
            {
                msg.Error = true;
                msg.Title = "Không tìm thấy thuộc tính";
                return Json(msg);
            }

        }
        #endregion

        #region Records Pack

        [HttpPost]
        public JsonResult InsertRecordsPack([FromBody] AssetRecordsPack obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var check = _context.AssetRecordsPacks.FirstOrDefault(x => !x.IsDeleted && x.PackCode.ToLower().Equals(obj.PackCode.ToLower()));
                if (check != null)
                {
                    msg.Error = true;
                    msg.Title = "Đã tồn tại đối tượng hồ sơ";
                    return Json(msg);
                }
                var record = new AssetRecordsPack
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
                _context.AssetRecordsPacks.Add(record);
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
        public JsonResult UpdateRecordsPack([FromBody] AssetRecordsPack obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var check = _context.AssetRecordsPacks.FirstOrDefault(x => !x.IsDeleted && x.PackCode.Equals(obj.PackCode));
                if (check != null)
                {
                    if (check.PackCode.Equals(obj.PackParent))
                    {
                        msg.Error = true;
                        msg.Title = "Vui lòng chọn \"Đóng gói trong\" khác với đối tượng hồ sơ";
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
                        _context.AssetRecordsPacks.Update(check);

                        var listChild = GetChildRecordsPack(check.PackCode);
                        foreach (var item in listChild)
                        {
                            var child = _context.AssetRecordsPacks.FirstOrDefault(x => !x.IsDeleted && x.PackCode.Equals(item.Code));
                            if (child != null)
                            {
                                child.PackLevel = (item.Level + 1 + Int32.Parse(check.PackLevel)).ToString();
                                child.PackZoneLocation = check.PackZoneLocation;
                                _context.AssetRecordsPacks.Update(child);
                            }
                        }

                        _context.SaveChanges();
                        msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Không tìm thấy đối tượng hồ sơ";
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
            var data = _context.AssetRecordsPacks.FirstOrDefault(x => !x.IsDeleted && x.ID == id);
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetInfoRecordsPack(string packCode)
        {
            var data = _context.AssetRecordsPacks.FirstOrDefault(x => !x.IsDeleted && x.PackCode.Equals(packCode));
            if (data != null)
            {
                var listRecordsPack = _context.AssetRecordsPacks.Where(x => !x.IsDeleted).ToList();
                var hierarchy = GetHierarchy(listRecordsPack, data, "");
                data.PackHierarchyPath = hierarchy;
            }
            return Json(data);
        }

        [NonAction]
        private string GetHierarchy(List<AssetRecordsPack> recordsPacks, AssetRecordsPack obj, string hierarchy)
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

            var query = from a in _context.AssetRecordsPackAttrs.Where(x => !x.IsDeleted)
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
            var query = _context.AssetRecordsPacks.Where(x => !x.IsDeleted && (string.IsNullOrEmpty(packType) || x.PackType.Equals(packType))
                        && (string.IsNullOrEmpty(level) || x.PackLevel.Equals(level)))
                        .Select(x => new { x.PackCode, x.PackName, x.PackLevel, x.PackParent });
            return Json(query);
        }

        [HttpGet]
        public JsonResult GetInfoRecordsPackParent(string packCode)
        {
            var data = _context.AssetRecordsPacks.FirstOrDefault(x => !x.IsDeleted && x.PackCode.Equals(packCode));
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
                var listRecordsPack = _context.AssetRecordsPacks.Where(x => !x.IsDeleted).ToList();
                var packDes = _context.AssetRecordsPacks.FirstOrDefault(x => !x.IsDeleted && x.PackCode.Equals(obj.RecordsPack));

                var isSameBranch = CheckSameBranch(obj.ListRecordsPack, obj.RecordsPack);
                if (isSameBranch)
                {
                    var recordPack = _context.AssetRecordsPacks.FirstOrDefault(x => !x.IsDeleted && x.PackCode.Equals(obj.ListRecordsPack));
                    if (recordPack != null)
                    {
                        if (recordPack.PackParent.Equals(packDes.PackCode))
                        {
                            var packDesLevel = packDes.PackLevel;
                            var packDesParent = packDes.PackParent;

                            packDes.PackParent = recordPack.PackCode;
                            packDes.PackLevel = recordPack.PackLevel;

                            recordPack.PackLevel = packDesLevel;
                            recordPack.PackParent = packDesParent;

                            var childRecordPack = _context.AssetRecordsPacks.Where(x => !x.IsDeleted && x.PackParent.Equals(recordPack.PackCode));
                            foreach (var chidlPack in childRecordPack)
                            {
                                chidlPack.PackParent = packDes.PackCode;
                            }
                            _context.AssetRecordsPacks.UpdateRange(childRecordPack);
                        }
                        else if (packDes.PackParent.Equals(recordPack.PackCode))
                        {
                            var packDesLevel = recordPack.PackLevel;
                            var packDesParent = recordPack.PackParent;

                            recordPack.PackParent = packDes.PackCode;
                            recordPack.PackLevel = packDes.PackLevel;

                            packDes.PackLevel = packDesLevel;
                            packDes.PackParent = packDesParent;

                            var childRecordDes = _context.AssetRecordsPacks.Where(x => !x.IsDeleted && x.PackParent.Equals(packDes.PackCode));
                            foreach (var chidlPack in childRecordDes)
                            {
                                chidlPack.PackParent = recordPack.PackCode;
                            }
                            _context.AssetRecordsPacks.UpdateRange(childRecordDes);
                        }
                        else
                        {
                            var recordParent = recordPack.PackParent;
                            var recordLevel = recordPack.PackLevel;

                            recordPack.PackParent = packDes.PackParent;
                            recordPack.PackLevel = packDes.PackLevel;

                            packDes.PackParent = recordParent;
                            packDes.PackLevel = recordLevel;

                            var childRecordPack = _context.AssetRecordsPacks.Where(x => !x.IsDeleted && x.PackParent.Equals(recordPack.PackCode));
                            foreach (var chidlPack in childRecordPack)
                            {
                                chidlPack.PackParent = packDes.PackCode;
                            }
                            _context.AssetRecordsPacks.UpdateRange(childRecordPack);

                            var childPackDes = _context.AssetRecordsPacks.Where(x => !x.IsDeleted && x.PackParent.Equals(packDes.PackCode));
                            foreach (var chidlPackDes in childPackDes)
                            {
                                chidlPackDes.PackParent = recordPack.PackCode;
                            }
                            _context.AssetRecordsPacks.UpdateRange(childPackDes);
                        }

                        _context.AssetRecordsPacks.Update(recordPack);
                        _context.AssetRecordsPacks.Update(packDes);
                    }
                }
                else
                {
                    var recordsPack = _context.AssetRecordsPacks.FirstOrDefault(x => !x.IsDeleted && x.PackCode.Equals(obj.ListRecordsPack));

                    if (recordsPack != null)
                    {
                        recordsPack.PackParent = obj.RecordsPack;
                        recordsPack.PackLevel = (Int32.Parse(packDes.PackLevel) + 1).ToString();

                        recordsPack.UpdatedBy = ESEIM.AppContext.UserName;
                        recordsPack.UpdatedTime = DateTime.Now;
                        _context.AssetRecordsPacks.Update(recordsPack);
                    }
                }
                _context.SaveChanges();

                msg.Title = "Đóng gói thành công";
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
            var data = _context.AssetRecordsPacks.FirstOrDefault(x => !x.IsDeleted && x.PackCode.Equals(packSrc));
            if (data != null)
            {
                var listRecordsPack = _context.AssetRecordsPacks.Where(x => !x.IsDeleted).ToList();
                isSame = CheckIsSameBranch(listRecordsPack, isSame, data, packDes);
            }
            return isSame;
        }

        [NonAction]
        private bool CheckIsSameBranch(List<AssetRecordsPack> listRecordsPack, bool isSame, AssetRecordsPack obj, string packDes)
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
            var childRecordsPack = new List<TreeView>();

            var data = _context.AssetRecordsPacks.OrderBy(x => x.PackName).Where(x => x.PackCode != packCode).AsNoTracking();
            childRecordsPack = GetSubRecordsPack(data.ToList(), packCode, new List<TreeView>(), 0);
            return childRecordsPack;
        }

        [NonAction]
        private List<TreeView> GetSubRecordsPack(List<AssetRecordsPack> data, string catParent, List<TreeView> lstCategories, int tab)
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
            var recordsPacks = _context.AssetRecordsPacks.Where(x => !x.IsDeleted).ToList();
            foreach (var item in recordsPacks)
            {
                item.PackHierarchyPath = GetHierarchy(recordsPacks, item, "");
                item.UpdatedBy = ESEIM.AppContext.UserName;
                item.UpdatedTime = DateTime.Now;
            }
            _context.AssetRecordsPacks.UpdateRange(recordsPacks);
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
                bool isSparate = CheckArrangeRecordPack(obj.ListRecordsPack);
                if (!isSparate)
                {
                    var recordsPack = _context.AssetRecordsPacks.FirstOrDefault(x => !x.IsDeleted && x.PackCode.Equals(obj.ListRecordsPack));
                    if (recordsPack != null)
                    {
                        recordsPack.PackZoneLocation = obj.ZoneCode;
                        recordsPack.UpdatedBy = ESEIM.AppContext.UserName;
                        recordsPack.UpdatedTime = DateTime.Now;
                        _context.AssetRecordsPacks.Update(recordsPack);
                    }
                    _context.SaveChanges();
                    msg.Title = "Xếp thành công";
                }
                else
                {
                    SeparatePack(obj.ListRecordsPack, obj.ZoneCode);
                    _context.SaveChanges();
                    msg.Title = "Xếp thành công";
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
            var recordsPack = _context.AssetRecordsPacks.FirstOrDefault(x => !x.IsDeleted && x.PackCode.Equals(packCode));
            if (recordsPack != null)
            {
                if (recordsPack.PackHierarchyPath.Contains("/"))
                {
                    var arrPack = recordsPack.PackHierarchyPath.Split("/", StringSplitOptions.None);
                    foreach (var item in arrPack.Where(x => x != packCode))
                    {
                        var packParent = _context.AssetRecordsPacks.FirstOrDefault(x => !x.IsDeleted && x.PackCode.Equals(item));
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
            var recordsPack = _context.AssetRecordsPacks.FirstOrDefault(x => !x.IsDeleted && x.PackCode.Equals(packCode));
            if (recordsPack != null)
            {
                recordsPack.PackParent = "";
                recordsPack.PackZoneLocation = zoneCode;
                recordsPack.PackLevel = "0";
                recordsPack.UpdatedBy = ESEIM.AppContext.UserName;
                recordsPack.UpdatedTime = DateTime.Now;
                _context.AssetRecordsPacks.Update(recordsPack);

                var listChild = GetChildRecordsPack(packCode);
                foreach (var item in listChild)
                {
                    var childPack = _context.AssetRecordsPacks.FirstOrDefault(x => !x.IsDeleted && x.PackCode.Equals(item.Code));
                    if (childPack != null)
                    {
                        childPack.UpdatedBy = ESEIM.AppContext.UserName;
                        childPack.UpdatedTime = DateTime.Now;
                        childPack.PackZoneLocation = zoneCode;
                        childPack.PackLevel = (item.Level + 1).ToString();

                        _context.AssetRecordsPacks.Update(childPack);
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
                var check = _context.AssetRecordsPackFiles.FirstOrDefault(x => !x.IsDeleted && x.FileCode.Equals(obj.FileCode));
                if (check == null)
                {
                    var file = new AssetRecordsPackFile
                    {
                        FileCode = obj.FileCode,
                        PackCode = obj.PackCode,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now
                    };
                    _context.AssetRecordsPackFiles.Add(file);
                    _context.SaveChanges();
                    msg.Title = "Đóng gói tệp tin thành công";
                }
                else
                {
                    var checkPack = _context.AssetRecordsPackFiles.FirstOrDefault(x => !x.IsDeleted && x.FileCode.Equals(obj.FileCode) 
                                && x.PackCode.Equals(obj.PackCode));
                    if(checkPack != null)
                    {
                        msg.Error = true;
                        msg.Title = msg.Title = "Tệp tin đã được đóng gói vào hồ sơ";
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = "Tệp tin đã được đóng gói vào hồ sơ khác";
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
            var data = _context.AssetRecordsPackFiles.FirstOrDefault(x => !x.IsDeleted && x.ID == id);
            if(data != null)
            {
                data.IsDeleted = true;
                data.DeletedBy = ESEIM.AppContext.UserName;
                data.DeletedTime = DateTime.Now;

                _context.AssetRecordsPackFiles.Update(data);
                _context.SaveChanges();
                msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
            }
            else
            {
                msg.Error = true;
                msg.Title = "Không tìm thấy bản ghi";
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult JTableFileRecordPack([FromBody] JTableFilePack jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.AssetRecordsPackFiles.Where(x => !x.IsDeleted && x.PackCode.Equals(jTablePara.PackCode))
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