using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using System;
using System.Linq;
using FTU.Utils.HelperNet;
using System.ComponentModel.DataAnnotations;
using Quartz;
using III.Domain.Enums;
//using ESEIM.Utils;
//using Microsoft.EntityFrameworkCore;
//using System.ComponentModel.DataAnnotations.Schema;
//using System.ComponentModel.DataAnnotations;
//using System;
//using DocumentFormat.OpenXml.Spreadsheet;
//using Quartz;
//using OpenXmlPowerTools;
//using System.Globalization;
namespace III.Admin.Areas.Admin.Controllers
{
    public class MobileAttributeSetupController : Controller
    {
        private readonly EIMDBContext _context;

        public MobileAttributeSetupController(EIMDBContext context)
        {
            _context = context;
        }

        public IActionResult Index()
        {
            return View();
        }

        public class PaginationModel {
            public int PageLength { get; set; } = 10;
            public int CurrentPage { get; set; } = 1;
        };

        ///////////// DATASETS ATTRIBUTE
        public class AttrModel
        {
            public int ID { get; set; }
            public string AttrCode { get; set; }
            public string AttrType { get; set; }
            public string AttrName { get; set; }

            public string AttrDataType { get; set; }

            public string AttrUnit { get; set; }

            public string AttrGroup { get; set; }

            public string Note { get; set; }
            public string WorkFlowCode { get; set; }
            public int CurrentPage { get; set; } = 1;
            public int Length { get; set; } = 10;
    }

    [HttpGet]
        public JsonResult JTableAttr(AttrModel attr)
        {
            var msg = new JMessage { Error = false, Title = "" };
            int intBeginFor = (attr.CurrentPage - 1) * attr.Length;
            var query = from a in _context.AttrSetups
                        join b in _context.CommonSettings on a.AttrDataType equals b.CodeSet into b1
                        from b2 in b1.DefaultIfEmpty()
                        join c in _context.CommonSettings on a.AttrUnit equals c.CodeSet into c1
                        from c2 in c1.DefaultIfEmpty()
                        join d in _context.CommonSettings on a.AttrGroup equals d.CodeSet into d1
                        from d2 in d1.DefaultIfEmpty()
                        where (!a.IsDeleted)
                        && attr.AttrGroup.Equals(a.AttrGroup)
                        select new
                        {
                            a.ID,
                            a.AttrCode,
                            a.AttrName,
                            AttrType = ((b2 != null) ? b2.CodeSet : a.AttrDataType),
                            AttrTypeName = ((b2 != null) ? b2.ValueSet : a.AttrDataType),
                            AttrUnit = ((c2 != null) ? c2.CodeSet : a.AttrUnit),
                            AttrUnitName = ((c2 != null) ? c2.ValueSet: a.AttrUnit),
                            AttrGroup = ((d2 != null) ? d2.CodeSet : a.AttrGroup),
                            AttrGroupName = ((d2 != null) ? d2.ValueSet : a.AttrGroup),
                            a.Note
                        };
            var count = query.Count();
            var data = query.Skip(intBeginFor).Take(attr.Length).ToList();
            msg.Object = new
            {
                count,
                data
            };
            return Json(msg);
        }
        public class AttrSetupModel
        {
            public int ID { get; set; }

            public string ActCode { get; set; }

            public string AttrCode { get; set; }

            public string AttrName { get; set; }

            public string AttrDataType { get; set; }

            public string AttrUnit { get; set; }

            public string AttrGroup { get; set; }

            public string Note { get; set; }
        }
        [HttpPost]
        public object UpdateActAttrSetup([FromBody] AttrSetupModel obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var attr = _context.AttrSetups.FirstOrDefault(x => /*x.AttrCode.Equals(obj.AttrCode) && x.AttrGroup.Equals(obj.AttrGroup)*/ x.ID == obj.ID && !x.IsDeleted);
                if (attr == null)
                {
                    msg.Error = true;
                    msg.Title = "ATTR_SET_UP_ATTR_NO_EXISTS";
                }
                else
                {
                    attr.AttrCode = obj.AttrCode;
                    attr.AttrName = obj.AttrName;
                    attr.AttrUnit = obj.AttrUnit;
                    attr.Note = obj.Note;
                    attr.AttrGroup = obj.AttrGroup;
                    attr.AttrDataType = obj.AttrDataType;
                    attr.UpdatedBy = ESEIM.AppContext.UserName;
                    attr.UpdatedTime = DateTime.Now;
                    _context.AttrSetups.Update(attr);
                    _context.SaveChanges();
                    msg.Title = "ATTR_SET_UP_UPDATE_ATTR_SUCCESS";
                    msg.ID = attr.ID;
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "COM_MSG_ERR";
            }
            return Json(msg);
        }

        [HttpDelete]
        public object DeleteActAttrSetup(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.AttrSetups.FirstOrDefault(x => !x.IsDeleted && x.ID == id);

                if (data != null)
                {
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    data.IsDeleted = true;
                    _context.AttrSetups.Update(data);
                    _context.SaveChanges();

                    msg.Title = "ATTR_SET_UP_DEL_ATTR_SUCCESS";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "ATTR_SET_UP_ATTR_NO_EXISTS";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "COM_MSG_ERR";
            }
            return Json(msg);
        }
        [HttpPut]
        public object UpdateActAttrSetup([FromBody] AttrSetup obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var attr = _context.AttrSetups.FirstOrDefault(x => /*x.AttrCode.Equals(obj.AttrCode) && x.AttrGroup.Equals(obj.AttrGroup)*/ x.ID == obj.ID && !x.IsDeleted);
                if (attr == null)
                {
                    msg.Error = true;
                    msg.Title = "NOT_EXIST";
                }
                else
                {
                    attr.AttrCode = obj.AttrCode;
                    attr.AttrName = obj.AttrName;
                    attr.AttrUnit = obj.AttrUnit;
                    attr.Note = obj.Note;
                    attr.AttrGroup = obj.AttrGroup;
                    attr.AttrDataType = obj.AttrDataType;
                    attr.UpdatedBy = ESEIM.AppContext.UserName;
                    attr.UpdatedTime = DateTime.Now;
                    _context.AttrSetups.Update(attr);
                    _context.SaveChanges();
                    msg.Title = "SUCCESS";
                    msg.ID = attr.ID;
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "COM_MSG_ERR";
            }
            return Json(msg);
        }
        [HttpGet]
        public JsonResult GetGroupAttr()
        {
            var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "CARD_DATA_LOGGER")
                .Select(x => new { Code = x.CodeSet, Name = x.ValueSet }).DistinctBy(x => x.Code);
            return Json(data);
        }

        [HttpPost]
        public object InsertActAttrSetup([FromBody] AttrSetup obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var check = _context.AttrSetups.FirstOrDefault(x => x.AttrCode.Equals(obj.AttrCode) && x.AttrGroup.Equals(obj.AttrGroup) && !x.IsDeleted);
                if (check == null)
                {
                    var attr = new AttrSetup
                    {
                        AttrCode = obj.AttrCode,
                        AttrName = obj.AttrName,
                        AttrUnit = obj.AttrUnit,
                        Note = obj.Note,
                        AttrGroup = obj.AttrGroup,
                        AttrDataType = obj.AttrDataType,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now,
                    };
                    _context.AttrSetups.Add(attr);
                    _context.SaveChanges();
                    msg.Title = "ATTR_SET_UP_MSG_ADD_ATTR_SUCCESS";
                    msg.ID = attr.ID;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "EXIST";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "COM_MSG_ERR";
            }
            return Json(msg);
        }

        [HttpGet]
        public JsonResult GetListATTRUNIT()
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "ATTR_UNIT").Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                if (data != null)
                {
                    msg.Object = data;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "COM_MSG_NOT_FOUND_DATA";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "COM_MSG_ERR";
            }
            return Json(msg);
        }



        [HttpGet]
        public JsonResult GetListATTRTYPE()
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "ATTR_DATA_TYPE").Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                if (data != null)
                {
                    msg.Object = data;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "COM_MSG_NOT_FOUND_DATA";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "COM_MSG_ERR";
            }
            return Json(msg);
        }

        ///////////// DATASETS
        [HttpGet]
        public JsonResult GetAttrGroup()
        {
            JMessage msg = new JMessage { Error = false };
            try
            {
                msg.Object = _context.CommonSettings.Where(x =>
                        !x.IsDeleted &&
                        x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.CardDataLogger)))
                    .Select(x => new
                    {   
                        Id = x.SettingID,
                        Code = x.CodeSet,
                        Name = x.ValueSet
                    });
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi lấy dữ liệu!";
            }

            return Json(msg);
        }
        [HttpPost]
        public object InsertAttrGroup([FromBody] CommonSetting data)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                if (data.ValueSet.Length > 255)
                {
                    msg.Error = true;
                    msg.Title = "COM_MSG_VALUE_SET_TOO_BIG";
                    return Json(msg);
                }
                data.CodeSet = data.Group + DateTime.Now.ToString("yyyyMMddHHmmss");
                data.CreatedBy = ESEIM.AppContext.UserName;
                data.CreatedTime = DateTime.Now;
                _context.CommonSettings.Add(data);
                _context.SaveChanges();
                msg.Code = data.CodeSet.ToString();
                msg.Title = ("COM_ADD_SUCCESS");
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "COM_ERR_ADD";
            }
            return Json(msg);
        }
        [HttpDelete]
        public JsonResult DeleteDatasets(int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.CommonSettings.FirstOrDefault(x => x.SettingID == id);
                if (data.CodeSet == "STATUS_ACTIVITY_APPROVED")
                {
                    msg.Error = true;
                    msg.Title = "Trạng thái duyệt không được phép xóa";
                    return Json(msg);
                }
                if (data.CodeSet == EnumHelper<CardEnum>.GetDisplayValue(CardEnum.NotificationCard))
                {
                    msg.Error = true;
                    msg.Title = "Không được phép xóa thuộc tính này";
                }
                else
                {
                    var customer = _context.Customerss.FirstOrDefault(x => x.ActivityStatus.Equals(data.CodeSet) || x.CusType.Equals(data.CodeSet) || x.CusGroup.Equals(data.CodeSet) || x.Area.Equals(data.CodeSet));
                    if (customer == null)
                    {
                        if (data.CodeSet != "NUM_PER_PAGE")
                        {
                            _context.CommonSettings.Remove(data);
                            _context.SaveChanges();
                            msg.Title = String.Format("COM_DELETE_SUCCESS");
                        }
                        else
                        {
                            msg.Error = true;
                            msg.Title = "Thuộc tính đã được sử dụng. Không được xóa thuộc tính này!";
                        }
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = "Thuộc tính đã được sử dụng, không được xóa";
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format("COM_ERR_DELETE");
            }
            return Json(msg);
        }
    }
}
