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
using III.Domain.Enums;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class AttributeManagerController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly AppSettings _appSettings;
        private readonly IStringLocalizer<AttributeManagerController> _stringLocalizer;
        private readonly IStringLocalizer<CommonSettingController> _commonsettingLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public class JTableModelCustom : JTableModel
        {
            public string parentCode { get; set; }
            public string code { get; set; }
            public string name { get; set; }
            public string type { get; set; }
            public string key1 { get; set; }
        }
        public AttributeManagerController(EIMDBContext context, IOptions<AppSettings> appSettings, IStringLocalizer<AttributeManagerController> stringLocalizer, IStringLocalizer<CommonSettingController> commonsettingLocalizer,
           IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _appSettings = appSettings.Value;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
            _commonsettingLocalizer = commonsettingLocalizer;
        }
        public IActionResult Index()
        {
            return View("Index");
        }

        #region Combobox
        [HttpPost]
        public object GetAttrUnit()
        {
            var data = _context.CommonSettings.Where(x => x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.AttrUnit)).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return data;
        }

        [HttpPost]
        public object GetAttrGroup()
        {
            var data = _context.CommonSettings.Where(x => x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.AttrGroup)).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return data;
        }

        [HttpPost]
        public object GetAttrDataType()
        {
            var data = _context.CommonSettings.Where(x => x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.AttrDataType)).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return data;
        }

        #endregion

        #region AttributeMain

        [HttpPost]
        public object JTable([FromBody]JTableModelCustom jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.AttributeManagers.Where(x => !x.IsDeleted)
                        let chilrens = _context.AttributeManagers.Where(x => !x.IsDeleted && x.Parent.Equals(a.Code)).Select(x => x.Name)
                        where (string.IsNullOrEmpty(jTablePara.code) || a.Code.ToLower().Contains(jTablePara.code.ToLower()))
                        && (string.IsNullOrEmpty(jTablePara.name) || a.Name.ToString().ToLower().Contains(jTablePara.name.ToLower()))
                        && (string.IsNullOrEmpty(jTablePara.type) || (a.DataType != null && a.DataType.Equals(jTablePara.type)))
                        select new
                        {
                            Id = a.Id,
                            Code = a.Code,
                            Name = a.Name,
                            Childrens = string.Join(',', chilrens),
                            Note = a.Note
                        };
            var count = query.Count();

            var data = query
                .OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "Code", "Name", "Childrens", "Note");

            return Json(jdata);
        }

        [HttpPost]
        public JsonResult Insert([FromBody]AttributeManager obj)
        {
            var msg = new JMessage { Title = "", Error = false };
            try
            {
                var exist = _context.AttributeManagers.FirstOrDefault(x => x.Code == obj.Code);
                if (exist != null)
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["ATTRM_MSG_MPA_CODE_ALREADY_EXIST"]);//"Mã thuộc tính sản phẩm đã tồn tại";
                }
                else
                {
                    obj.CreatedBy = ESEIM.AppContext.UserName;
                    obj.CreatedTime = DateTime.Now;
                    _context.AttributeManagers.Add(obj);
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["ATTRM_LBL_MGP"]);//"Thêm thuôc tính sản phẩm thành công";
                }
            }
            catch
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["ATTRM_MSG_ADD_ERROR"]); //"Thêm thuôc tính sản phẩm lỗi";
            }
            return Json(msg);
        }
        [HttpPost]
        public object Update([FromBody]AttributeManager obj)
        {
            var msg = new JMessage();
            try
            {
                var item = _context.AttributeManagers.FirstOrDefault(x => x.Id.Equals(obj.Id));
                if (item != null)
                {
                    item.UpdatedBy = User.Identity.Name;
                    item.UpdatedTime = DateTime.Now.Date;
                    item.Unit = obj.Unit;
                    item.Group = obj.Group;
                    item.Parent = obj.Parent;
                    item.DataType = obj.DataType;
                    item.Name = obj.Name;
                    item.Note = obj.Note;

                    _context.AttributeManagers.Update(item);
                    _context.SaveChanges();

                    msg.Error = false;
                    msg.Title = String.Format(_stringLocalizer["ATTRM_MSG_SAVE_SUCCESS"]); //"Đã lưu thay đổi";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["ATTRM_MSG_ERROR"]); //"Có lỗi xảy ra!";
                }

                return msg;
            }
            catch
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["ATTRM_MSG_ERROR"]); //"Có lỗi xảy ra!";
                return msg;
            }
        }
        [HttpPost]
        public object Delete(int id)
        {
            var msg = new JMessage { Error = true };
            try
            {
                var data = _context.AttributeManagers.FirstOrDefault(x => x.Id == id);
                data.IsDeleted = true;
                data.DeletedBy = User.Identity.Name;
                data.DeletedTime = DateTime.Now.Date;
                _context.AttributeManagers.Update(data);
                _context.SaveChanges();
                msg.Error = false;
                msg.Title = String.Format(_stringLocalizer["ATTRM_MSG_DELETE_SUCCESS"]); //"Xóa thành công!";
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["ATTRM_MSG_DELETE_ERROR"]); //"Có lỗi khi xóa!";
                return Json(msg);
            }
        }
        public object GetItem(int id)
        {
            var item = _context.AttributeManagers.AsNoTracking().Where(m => m.Id == id).Select(x => new { x.Id, x.Code, x.Name, x.Unit, x.DataType, x.Group, x.Note, x.Parent }).FirstOrDefault();
            return Json(item);
        }

        [HttpPost]
        public object GetListParent()
        {
            var item = _context.AttributeManagers.AsNoTracking().Where(m => string.IsNullOrEmpty(m.Parent)).Select(x => new { x.Id, x.Code, x.Name, x.Unit, x.DataType, x.Note, x.Parent });
            return Json(item);
        }

        #endregion

        #region AttributeChildren
        [HttpPost]
        public object JTableChildren([FromBody]JTableModelCustom jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.AttributeManagers.Where(x => !x.IsDeleted && x.Parent.Equals(jTablePara.parentCode))
                        select new
                        {
                            Id = a.Id,
                            Code = a.Code,
                            Name = a.Name,
                            Note = a.Note
                        };
            var count = query.Count();

            var data = query
                .OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "Code", "Name", "Note");

            return Json(jdata);
        }

        [HttpPost]
        public JsonResult InsertChildren([FromBody]MaterialProductAttributeChildren obj)
        {
            var msg = new JMessage { Title = "", Error = false };
            try
            {
                var exist = _context.MaterialProductAttributeChildrens.FirstOrDefault(x => x.Code == obj.Code);
                if (exist != null)
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["ATTRM_MSG_MPA_CODE_ALREADY_EXIST"]);//"Mã thuộc tính sản phẩm đã tồn tại";
                }
                else
                {
                    obj.Id = 0;
                    obj.CreatedBy = ESEIM.AppContext.UserName;
                    obj.CreatedTime = DateTime.Now;
                    _context.MaterialProductAttributeChildrens.Add(obj);
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["ATTRM_LBL_MGP"]);//"Thêm thuôc tính sản phẩm thành công";
                }
            }
            catch
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["ATTRM_MSG_ADD_ERROR"]); //"Thêm thuôc tính sản phẩm lỗi";
            }
            return Json(msg);
        }
        [HttpPost]
        public object UpdateChildren([FromBody]MaterialProductAttributeChildren obj)
        {
            var msg = new JMessage();
            try
            {
                var item = _context.MaterialProductAttributeChildrens.FirstOrDefault(x => x.Id.Equals(obj.Id));
                if (item != null)
                {
                    item.UpdatedBy = User.Identity.Name;
                    item.UpdatedTime = DateTime.Now.Date;
                    item.Name = obj.Name;
                    item.Description = obj.Description;

                    _context.MaterialProductAttributeChildrens.Update(item);
                    _context.SaveChanges();

                    msg.Error = false;
                    msg.Title = String.Format(_stringLocalizer["ATTRM_MSG_SAVE_SUCCESS"]); //"Đã lưu thay đổi";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["ATTRM_MSG_ERROR"]); //"Có lỗi xảy ra!";
                }

                return msg;
            }
            catch
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["ATTRM_MSG_ERROR"]); //"Có lỗi xảy ra!";
                return msg;
            }
        }
        [HttpPost]
        public object DeleteChildren(int id)
        {
            var msg = new JMessage { Error = true };
            try
            {
                var data = _context.MaterialProductAttributeChildrens.FirstOrDefault(x => x.Id == id);
                data.IsDeleted = true;
                data.DeletedBy = User.Identity.Name;
                data.DeletedTime = DateTime.Now.Date;
                _context.MaterialProductAttributeChildrens.Update(data);
                _context.SaveChanges();
                msg.Error = false;
                msg.Title = String.Format(_stringLocalizer["ATTRM_MSG_DELETE_SUCCESS"]); //"Xóa thành công!";
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["ATTRM_MSG_DELETE_ERROR"]); //"Có lỗi khi xóa!";
                return Json(msg);
            }
        }
        public object GetItemChildren(int id)
        {
            var item = _context.MaterialProductAttributeChildrens.AsNoTracking().Where(m => m.Id == id).Select(x => new { x.Id, x.Code, x.Name, x.Description, x.ParentCode }).FirstOrDefault();
            return Json(item);
        }
        #endregion

        #region AttributeManager
        [HttpPost]
        public JsonResult GetListAttributeManager()
        {
            JMessage msg = new JMessage();
            try
            {
                var data = _context.AttributeManagers.Where(x => !x.IsDeleted).Select(x => new { x.Code, x.Name, x.DataType, x.Unit });
                if (data == null)
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["ATTRM_MSG_NOT_FIND_OBJ"];
                }
                else
                {
                    msg.Error = false;
                    msg.Object = data;
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_ERR_DELETE"];
            }
            return Json(msg);
        }

        public class JtableAttributeModel : JTableModel
        {
            public string ObjCode { get; set; }
            public string ObjCodeTemp { get; set; }
        }

        [HttpPost]
        public object JTableAttribute([FromBody]JtableAttributeModel jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.AttributeManagerGalaxys
                        join b in _context.AttributeManagers on a.AttrCode equals b.Code into b1
                        from b2 in b1.DefaultIfEmpty()
                        where (a.ObjCode == jTablePara.ObjCode)
                        && a.IsDeleted == false
                        orderby a.Id descending
                        select new
                        {
                            a.Id,
                            a.AttrCode,
                            AttrName = b2 != null ? b2.Name : "",
                            a.AttrValue,
                            a.CreatedTime,
                            Unit = b2 != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b2.Unit)) != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b2.Unit)).ValueSet : "" : "",
                            Group = b2 != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b2.Group)) != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b2.Group)).ValueSet : "" : "",
                            DataType = b2 != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b2.DataType)) != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b2.DataType)).ValueSet : "" : "",
                            Parent = b2 != null ? _context.AttributeManagers.FirstOrDefault(x => x.Code.Equals(b2.Parent)) != null ? _context.AttributeManagers.FirstOrDefault(x => x.Parent.Equals(b2.Parent)).Name : "" : ""
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).AsNoTracking().Skip(intBeginFor).Take(jTablePara.Length).ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "AttrCode", "AttrName", "AttrValue", "CreatedTime", "Unit", "Group", "DataType", "Parent");

            return Json(jdata);
        }

        [HttpPost]
        public JsonResult InsertAttributeMore([FromBody]AttributeManagerGalaxy obj)
        {
            JMessage msg = new JMessage();
            try
            {
                var data = _context.AttributeManagerGalaxys.FirstOrDefault(x => x.ObjCode.Equals(obj.ObjCode) && x.AttrCode.Equals(obj.AttrCode) && x.AttrValue.Equals(obj.AttrValue) && !x.IsDeleted);
                if (data != null)
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["ATTRM_MSG_ATTRM_ALREADY_EXIST"];
                }
                else
                {
                    AttributeManagerGalaxy objNew = new AttributeManagerGalaxy();

                    objNew.ObjCode = obj.ObjCode;
                    objNew.AttrCode = obj.AttrCode;
                    objNew.AttrValue = obj.AttrValue;
                    objNew.CreatedTime = DateTime.Now;
                    objNew.CreatedBy = ESEIM.AppContext.UserName;
                    objNew.IsDeleted = false;

                    _context.AttributeManagerGalaxys.Add(objNew);
                    _context.SaveChanges();
                    msg.Error = false;
                    msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_ERR_ADD"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetDetailAttributeMore(int Id)
        {
            JMessage msg = new JMessage();
            try
            {
                var objNew = _context.AttributeManagerGalaxys.FirstOrDefault(x => x.Id == Id);
                if (objNew == null)
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["ATTRM_MSG_NOT_FIND_OBJ"];
                }
                else
                {
                    msg.Error = false;
                    msg.Object = objNew;
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_ERR_DELETE"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateAttributeMore([FromBody]AttributeManagerGalaxy obj)
        {
            JMessage msg = new JMessage();
            try
            {
                var objNew = _context.AttributeManagerGalaxys.FirstOrDefault(x => x.ObjCode.Equals(obj.ObjCode) && x.AttrCode.Equals(obj.AttrCode) && !x.IsDeleted);
                if (objNew == null)
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["ATTRM_MSG_ATTR_NOT_FOUND_ATTR"];
                }
                else
                {
                    objNew.AttrValue = obj.AttrValue;

                    objNew.UpdatedTime = DateTime.Now;
                    objNew.UpdatedBy = ESEIM.AppContext.UserName;
                    objNew.IsDeleted = false;

                    _context.AttributeManagerGalaxys.Update(objNew);
                    _context.SaveChanges();
                    msg.Error = false;
                    msg.Title = _stringLocalizer["ATTRM_MSG_UPDATE_PROPERTY_SUCCESS"];
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
        public object DeleteAttributeMore(int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.AttributeManagerGalaxys.FirstOrDefault(x => x.Id == id);
                data.DeletedBy = ESEIM.AppContext.UserName;
                data.DeletedTime = DateTime.Now;
                data.IsDeleted = true;
                _context.AttributeManagerGalaxys.Update(data);
                _context.SaveChanges();
                msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
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
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_commonsettingLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion
    }
}
