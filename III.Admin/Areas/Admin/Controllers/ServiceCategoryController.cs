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
using OpenXmlPowerTools;
using Microsoft.AspNetCore.Authorization;
using System.Linq.Expressions;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class ServiceCategoryController : BaseController
    {
        //private readonly IHostingEnvironment _hostingEnvironment;
        private readonly EIMDBContext _context;
        private readonly IStringLocalizer<ServiceCategoryController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        //private readonly ILogger _logger;
        //private readonly IActionLogService _actionLog;
        //private readonly AppSettings _appSettings;


        public class JTableModelCustom : JTableModel
        {
            public string servicecode { get; set; }
            public string servicename { get; set; }
            public string unit { get; set; }
            public string servicegroup { get; set; }
        }
        public ServiceCategoryController(EIMDBContext context, IStringLocalizer<ServiceCategoryController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {

            _context = context;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }
        [Breadcrumb("ViewData.CrumbServiceCat", AreaName = "Admin", FromAction = "Index", FromController = typeof(ServiceHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuStore"] = _sharedResources["COM_CRUMB_MENU_STORE"];
            ViewData["CrumbServiceHome"] = _sharedResources["COM_CRUMB_SV_HOME"];
            ViewData["CrumbServiceCat"] = _sharedResources["COM_CRUMB_SERVICE_CAT"];
            return View();
        }
        [HttpPost]
        public object JTable([FromBody] JTableModelCustom jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var listCommon = _context.CommonSettings.Select(x => new { x.CodeSet, x.ValueSet });
            var query = from a in _context.ServiceCategorys
                        join b in _context.CommonSettings on a.Unit equals b.CodeSet into b1
                        from b2 in b1.DefaultIfEmpty()
                        join c in _context.ServiceCategoryGroups on a.ServiceGroup equals c.Code into c1
                        from c2 in c1.DefaultIfEmpty()
                        where (string.IsNullOrEmpty(jTablePara.servicecode) || a.ServiceCode.ToLower().Contains(jTablePara.servicecode.ToLower()))
                        && (string.IsNullOrEmpty(jTablePara.servicename) || a.ServiceName.ToLower().Contains(jTablePara.servicename.ToLower()))
                        && (string.IsNullOrEmpty(jTablePara.unit) || a.Unit == jTablePara.unit)
                        && (string.IsNullOrEmpty(jTablePara.servicegroup) || a.ServiceGroup == jTablePara.servicegroup)
                        select new
                        {
                            a.ServiceCatID,
                            a.ServiceCode,
                            a.ServiceName,
                            Unit = b2.ValueSet,
                            ServiceGroup = c2.Name,
                            a.Visibility,
                            a.Note,
                        };
            var count = query.Count();

            var data = query
               .OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "ServiceCatID", "ServiceCode", "ServiceName", "Unit", "ServiceGroup", "Visibility", "Note");
            return Json(jdata);
        }
        [HttpPost]
        public JsonResult Insert([FromBody] ServiceCategory obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                if (obj.Visibility <= 0 && obj.Visibility >= 4)
                {
                    msg.Error = true;
                    msg.Title = "Chưa chọn mức hiển thị";
                    return Json(msg);
                }
                var checkExist = _context.ServiceCategorys.FirstOrDefault(x => x.ServiceCode.Equals(obj.ServiceCode));
                if (checkExist == null)
                {
                    obj.CreatedBy = ESEIM.AppContext.UserName;
                    obj.CreatedTime = DateTime.Now;
                    _context.ServiceCategorys.Add(obj);
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["SVC_TITLE_SERVICE"]);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_MSG_EXITS"], _stringLocalizer["SVC_CURE_LBL_CODE"]);
                }
            }
            catch
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_ADD_FAILED"], _stringLocalizer["SVC_TITLE_SERVICE"]);
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Update([FromBody] ServiceCategory obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                if (obj.Visibility <= 0 && obj.Visibility >= 4)
                {
                    msg.Error = true;
                    msg.Title = "Chưa chọn mức hiển thị";
                    return Json(msg);
                }
                var data = _context.ServiceCategorys.Where(x => x.ServiceCode.Equals(obj.ServiceCode)).FirstOrDefault();
                if (data != null)
                {
                    data.ServiceName = obj.ServiceName;
                    data.ServiceGroup = obj.ServiceGroup;
                    data.ServiceParent = obj.ServiceParent;
                    data.ServiceType = obj.ServiceType;
                    data.Unit = obj.Unit;
                    data.Note = obj.Note;
                    data.UpdatedBy = ESEIM.AppContext.UserName;
                    data.UpdatedTime = DateTime.Now;
                    data.Visibility = obj.Visibility;
                    _context.ServiceCategorys.Update(data);
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["SVC_TITLE_SERVICE"]);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["SVC_MSG_SERVICE_CODE_NO_EXIST"];
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
        public object Delete(int Id)
        {
            var msg = new JMessage { Error = true };
            try
            {
                var data = _context.ServiceCategorys.FirstOrDefault(x => x.ServiceCatID == Id);
                if (data != null)
                {
                    var chkExist = _context.ServiceCategoryCostConditions.Any(x => !x.IsDeleted && x.ServiceCatCode == data.ServiceCode);
                    if (chkExist)
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["SVC_MSG_NOT_DELETE_SERVICE"];//Không được xóa dịch vụ đã được khai báo trong bảng giá
                        return Json(msg);
                    }
                    else
                    {
                        _context.ServiceCategorys.Remove(data);
                        _context.SaveChanges();
                        msg.Error = false;
                        msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer["SVC_TITLE_SERVICE"]);
                        return Json(msg);
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["SVC_MSG_NOT_FIND_SERVICE"];//Không tìm thấy dịch vụ. Vui lòng làm mới lại trang
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

        public object GetItem(int id)
        {
            var a = _context.ServiceCategorys.Single(m => m.ServiceCatID == id);
            return Json(a);
        }
        [AllowAnonymous]
        public object GetService(string ServiceCode)
        {
            var mess = new JMessage();
            try
            {
                var codeheader = _context.ServiceCategoryCostHeaders.Where(x => x.IsDeleted == false)
                 .OrderByDescending(c => c.EffectiveDate)
                 .FirstOrDefault();
                if (codeheader == null || codeheader.ExpiryDate < DateTime.Now)
                {
                    mess.Error = true;
                    mess.Title = "Không tìm thấy bảng giá";
                    return mess;
                }
                var a = _context.ServiceCategorys.Where(x => x.IsDeleted == false).Where(m => m.ServiceCode.Equals(ServiceCode)).Select(x => new
                {
                    x.ServiceParent,
                    x.ServiceCatID,
                    x.ServiceName,
                    x.ServiceCode,
                    x.ServiceGroup,
                    x.ServiceType,
                    header = codeheader.HeaderCode,
                    ListPrice = _context.ServiceCategoryCostConditions
                         .Where(b => b.HeaderCode == codeheader.HeaderCode &&
                                 b.ServiceCatCode.Equals(x.ServiceCode) &&
                                 b.IsDeleted == false)
                         .Select(c => new
                         {
                             c.ObjectCode,
                             c.ObjFromValue,
                             c.ObjToValue,
                             c.ServiceCatCode,
                             c.Price,
                             c.Currency,
                             Title = _context.CommonSettings.Where(d => d.CodeSet.Equals(c.ObjectCode)).FirstOrDefault().ValueSet
                         })
                         .ToList()
                }).FirstOrDefault();

                if (a == null)
                {
                    mess.Error = true;
                    mess.Title = "Không tìm thấy dịch vụ này";
                    return mess;
                }
                mess.Error = false;
                mess.Object = a;
                return mess;
            }
            catch
            {
                mess.Error = true;
                mess.Title = "Có lỗi xảy ra";
                return mess;
            }
        }

        [AllowAnonymous]
        public object GetServiceMobile()
        {
            var mess = new JMessage();
            try
            {
                var codeheader = _context.ServiceCategoryCostHeaders.Where(x => x.IsDeleted == false)
                 .OrderByDescending(c => c.EffectiveDate)
                 .FirstOrDefault();
                if (codeheader == null || codeheader.ExpiryDate < DateTime.Now)
                {
                    mess.Error = true;
                    mess.Title = "Không tìm thấy bảng giá";
                    return mess;
                }
                var a = _context.ServiceCategorys.Where(x => x.IsDeleted == false
                && (x.Visibility == 2 || x.Visibility == 3)).Select(x => new
                {

                    x.ServiceParent,
                    x.ServiceCatID,
                    x.ServiceName,
                    x.ServiceCode,
                    x.ServiceGroup,
                    x.ServiceType,
                    header = codeheader.HeaderCode,
                    ListPrice = _context.ServiceCategoryCostConditions
                        .Where(b => b.HeaderCode == codeheader.HeaderCode &&
                                b.ServiceCatCode.Equals(x.ServiceCode) &&
                                b.IsDeleted == false)
                        .Select(c => new
                        {
                            c.ObjectCode,
                            c.ObjFromValue,
                            c.ObjToValue,
                            c.ServiceCatCode,
                            c.Price,
                            c.Currency,
                            Title = _context.CommonSettings.Where(d => d.CodeSet.Equals(c.ObjectCode)).FirstOrDefault().ValueSet
                        })
                        .ToList()
                }).ToList();
                if (a.Count == 0)
                {
                    mess.Error = true;
                    mess.Title = "Không tìm thấy dịch vụ nào";
                    return mess;
                }
                mess.Error = false;
                mess.Object = a;
                return mess;
            }
            catch
            {
                mess.Error = true;
                mess.Title = "Có lỗi xảy ra";
                return mess;
            }

        }


        [AllowAnonymous]
        public object GetServiceWeb()
        {
            var mess = new JMessage();
            try
            {
                var codeheader = _context.ServiceCategoryCostHeaders.Where(x => x.IsDeleted == false)
                 .OrderByDescending(c => c.EffectiveDate)
                 .FirstOrDefault();
                if (codeheader == null || codeheader.ExpiryDate < DateTime.Now)
                {
                    mess.Error = true;
                    mess.Title = "Không tìm thấy bảng giá";
                    return mess;
                }
                var a = _context.ServiceCategorys.Where(x => x.IsDeleted == false).Where(x => x.Visibility == 1 || x.Visibility == 3).Select(x => new
                {
                    x.ServiceParent,
                    x.ServiceCatID,
                    x.ServiceName,
                    x.ServiceCode,
                    x.ServiceGroup,
                    x.ServiceType,
                    header = codeheader.HeaderCode,
                    ListPrice = _context.ServiceCategoryCostConditions
                        .Where(b => b.HeaderCode == codeheader.HeaderCode &&
                                b.ServiceCatCode.Equals(x.ServiceCode) &&
                                b.IsDeleted == false)
                        .Select(c => new
                        {
                            c.ObjectCode,
                            c.ObjFromValue,
                            c.ObjToValue,
                            c.ServiceCatCode,
                            c.Price,
                            c.Currency,
                            Title = _context.CommonSettings.Where(d => d.CodeSet.Equals(c.ObjectCode)).FirstOrDefault().ValueSet
                        })
                        .ToList()
                }).ToList();
                if (a.Count == 0)
                {
                    mess.Error = true;
                    mess.Title = "Không tìm thấy dịch vụ nào";
                    return mess;
                }
                mess.Error = false;
                mess.Object = a;
                return mess;
            }
            catch
            {
                mess.Error = true;
                mess.Title = "Có lỗi xảy ra";
                return mess;
            }

        }

        public object GetItemDetail(int id)
        {
            var listCommon = _context.CommonSettings.Select(x => new { x.CodeSet, x.ValueSet });
            var query = from ad in _context.ServiceCategorys

                        join b in listCommon on ad.Unit equals b.CodeSet into b1
                        from b in b1.DefaultIfEmpty()
                        join c in listCommon on ad.ServiceGroup equals c.CodeSet into c1
                        from c in c1.DefaultIfEmpty()
                        where ad.ServiceCatID == id
                        select new
                        {
                            ServiceCode = ad.ServiceCode,
                            ServiceName = ad.ServiceName,
                            Note = ad.Note,
                            Unit = b != null ? b.ValueSet : "COM_MSG_NO _UNKNOWN",
                            ServiceGroup = c != null ? c.ValueSet : "COM_MSG_NO_CONFIRM",
                        };
            return Json(query);
        }

        [HttpPost]
        public object GetServiceGroup()
        {
            var data = _context.CommonSettings.Where(x => x.Group == "SERVICE_GROUP").Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return data;
        }
        [HttpPost]
        public object GetServiceUnit()
        {
            var data = _context.CommonSettings.Where(x => x.Group == "SERVICE_UNIT").Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return data;
        }

        [HttpPost]
        public object GetServiceCategoryParent()
        {
            var data = _context.ServiceCategorys.Where(x => !x.IsDeleted)
                .Select(x => new
                {
                    Id = x.ServiceCatID,
                    Code = x.ServiceCode,
                    Name = x.ServiceName,
                }).ToList();
            return data;
        }

        [HttpPost]
        public object GetServiceCategoryGroup()
        {
            var data = _context.ServiceCategoryGroups.Where(x => !x.IsDeleted)
                .Select(x => new
                {
                    x.Id,
                    x.Code,
                    x.Name,
                }).ToList();
            return data;
        }

        [HttpPost]
        public object GetServiceCategoryType()
        {
            var data = _context.ServiceCategoryTypes.Where(x => !x.IsDeleted)
                .Select(x => new
                {
                    x.Id,
                    x.Code,
                    x.Name,
                }).ToList();
            return data;
        }

        #region Tab Atribute
        [HttpPost]
        public object JTableAttributeMore([FromBody] JtableAttributeModel jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.ServiceCategoryAttributes
                        where a.ServiceCode == jTablePara.ServiceCode
                        && a.IsDeleted == false
                        orderby a.Id descending
                        select new
                        {
                            a.Id,
                            a.AttributeCode,
                            a.AttributeName,
                            a.AttributeValue,
                            a.FieldType,
                            a.Note,
                            a.CreatedTime,
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).AsNoTracking().Skip(intBeginFor).Take(jTablePara.Length).ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "AttributeCode", "AttributeName", "AttributeValue", "FieldType", "Note", "CreatedTime");

            return Json(jdata);
        }
        [HttpPost]
        public JsonResult InsertAttributeMore([FromBody] ServiceCategoryAttribute obj)
        {
            JMessage msg = new JMessage();
            try
            {
                var parent = _context.ServiceCategorys.FirstOrDefault(x => x.ServiceCode == obj.ServiceCode && x.IsDeleted == false);
                if (parent != null)
                {
                    var data = _context.ServiceCategoryAttributes.FirstOrDefault(x => !string.IsNullOrEmpty(x.ServiceCode) && !string.IsNullOrEmpty(obj.ServiceCode) && x.ServiceCode.ToLower().Equals(obj.ServiceCode.ToLower()) && !string.IsNullOrEmpty(x.AttributeCode) && !string.IsNullOrEmpty(obj.AttributeCode) && x.AttributeCode.ToLower().Equals(obj.AttributeCode.ToLower()) && x.IsDeleted == false);
                    if (data != null)
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["SVC_MSG_ALREADY_EXISTS_ATTRIBUTE_MORE"];// "Đã tồn tại thuộc tính mở rộng của dịch vụ này, không thể thêm tiếp";
                    }
                    else
                    {
                        ServiceCategoryAttribute objNew = new ServiceCategoryAttribute();

                        objNew.ServiceCode = obj.ServiceCode;
                        objNew.AttributeCode = obj.AttributeCode;
                        objNew.AttributeName = obj.AttributeName;
                        objNew.AttributeValue = obj.AttributeValue;
                        objNew.FieldType = obj.FieldType;
                        objNew.Note = obj.Note;

                        objNew.CreatedTime = DateTime.Now;
                        objNew.CreatedBy = ESEIM.AppContext.UserName;
                        objNew.IsDeleted = false;

                        _context.ServiceCategoryAttributes.Add(objNew);
                        _context.SaveChanges();
                        msg.Error = false;
                        msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], "");
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_MSG_ERR"];//"Danh mục dịch vụ không tồn tại, vui lòng làm mới trang";
                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];//"Có lỗi khi thêm";
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult UpdateAttributeMore([FromBody] ServiceCategoryAttribute obj)
        {
            JMessage msg = new JMessage();
            try
            {
                var parent = _context.ServiceCategorys.FirstOrDefault(x => x.ServiceCode == obj.ServiceCode && x.IsDeleted == false);
                if (parent != null)
                {
                    var objNew = _context.ServiceCategoryAttributes.FirstOrDefault(x => !string.IsNullOrEmpty(x.ServiceCode) && !string.IsNullOrEmpty(obj.ServiceCode) && x.ServiceCode.ToLower().Equals(obj.ServiceCode.ToLower()) && !string.IsNullOrEmpty(x.AttributeCode) && !string.IsNullOrEmpty(obj.AttributeCode) && x.AttributeCode.ToLower().Equals(obj.AttributeCode.ToLower()) && x.IsDeleted == false);
                    if (objNew == null)
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["SVC_MSG_REFRESH_MORE_ATTRIBUTE"];//"Thuộc tính mở rộng không tồn tại, vui lòng làm mới trang";
                    }
                    else
                    {
                        objNew.ServiceCode = obj.ServiceCode;
                        objNew.AttributeCode = obj.AttributeCode;
                        objNew.AttributeName = obj.AttributeName;
                        objNew.AttributeValue = obj.AttributeValue;
                        objNew.FieldType = obj.FieldType;
                        objNew.Note = obj.Note;

                        objNew.UpdatedTime = DateTime.Now;
                        objNew.UpdatedBy = ESEIM.AppContext.UserName;
                        objNew.IsDeleted = false;

                        _context.ServiceCategoryAttributes.Update(objNew);
                        _context.SaveChanges();
                        msg.Error = false;
                        msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], "");
                    }
                }
                else
                {
                    msg.Error = false;
                    msg.Title = _sharedResources["COM_MSG_ERR"];//"Danh mục dịch vụ không tồn tại, vui lòng làm mới trang";
                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];//"Có lỗi khi chỉnh sửa";
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult DeleteAttributeMore(int Id)
        {
            JMessage msg = new JMessage();
            try
            {
                //var parent = _context.MaterialProducts.FirstOrDefault(x => x.ServiceCode == obj.ServiceCode && x.IsDeleted == false);
                //if (parent != null)
                //{
                var objNew = _context.ServiceCategoryAttributes.FirstOrDefault(x => x.Id == Id);
                if (objNew == null)
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["SVC_MSG_REFRESH_MORE_ATTRIBUTE"];//"Thuộc tính mở rộng không tồn tại, vui lòng làm mới trang";
                }
                else
                {
                    objNew.DeletedTime = DateTime.Now;
                    objNew.DeletedBy = ESEIM.AppContext.UserName;
                    objNew.IsDeleted = true;

                    _context.ServiceCategoryAttributes.Update(objNew);
                    _context.SaveChanges();
                    msg.Error = false;
                    msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], "");
                }
                //}
                //else
                //{
                //    msg.Error = false;
                //    msg.Title = "Danh mục dịch vụ không tồn tại, vui lòng làm mới trang";
                //}

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];//"Có lỗi khi chỉnh sửa";
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetDetailAttributeMore(int Id)
        {
            JMessage msg = new JMessage();
            try
            {
                var objNew = _context.ServiceCategoryAttributes.FirstOrDefault(x => x.Id == Id);
                if (objNew == null)
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["SVC_MSG_REFRESH_MORE_ATTRIBUTE"];//"Thuộc tính mở rộng không tồn tại, vui lòng làm mới trang";
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
                msg.Title = _stringLocalizer["SVC_MSG_DELETE_ERROR"];//"Có lỗi khi xóa";
            }
            return Json(msg);
        }
        #endregion

        public class JtableAttributeModel : JTableModel
        {
            public string ServiceCode { get; set; }
        }

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