using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Options;
using III.Admin.Controllers;
using System.IO;
using System.Collections.Generic;
using System.Globalization;
using III.Domain.Enums;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using ESEIM;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class ServiceCategoryPriceController : BaseController
    {

        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly EIMDBContext _context;
        private readonly ILogger _logger;
        private readonly IActionLogService _actionLog;
        private readonly AppSettings _appSettings;
        private readonly IUploadService _upload;
        private readonly IStringLocalizer<ServiceCategoryPriceController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;

        public ServiceCategoryPriceController(EIMDBContext context, IUploadService upload, IOptions<AppSettings> appSettings, IHostingEnvironment hostingEnvironment, IActionLogService actionLog, IStringLocalizer<ServiceCategoryPriceController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {

            _context = context;
            _hostingEnvironment = hostingEnvironment;
            _actionLog = actionLog;
            _appSettings = appSettings.Value;
            _upload = upload;
            _sharedResources = sharedResources;
            _stringLocalizer = stringLocalizer;
        }
        [Breadcrumb("ViewData.CrumbSerCatPrice", AreaName = "Admin", FromAction = "Index", FromController = typeof(ServiceHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuStore"] = _sharedResources["COM_CRUMB_MENU_STORE"];
            ViewData["CrumbServiceHome"] = _sharedResources["COM_CRUMB_SV_HOME"];
            ViewData["CrumbSerCatPrice"] = _sharedResources["COM_CRUMB_SV_CAT_PRICE"];
            return View("Index");
        }

        [HttpPost]
        public object JTable([FromBody]JTableModelCustom jTablePara)
        {
            DateTime now = DateTime.Now;
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.ServiceCategoryCostHeaders
                        join b in _context.Users.Where(x => x.Active) on a.CreatedBy equals b.UserName
                        where a.IsDeleted == false
                        && (string.IsNullOrEmpty(jTablePara.Title) || (a.Title.ToLower().Contains(jTablePara.Title.ToLower())))
                        && (string.IsNullOrEmpty(jTablePara.Status) || (
                            (jTablePara.Status == "EFFETIVE" && (a.ExpiryDate == null || (a.ExpiryDate != null && a.ExpiryDate >= now)))
                            ||
                            (jTablePara.Status == "EXPIRE" && ((a.ExpiryDate != null && a.ExpiryDate < now))
                            )))
                        select new
                        {
                            Id = a.Id,
                            Title = a.Title,
                            Note = a.Note,
                            EffectiveDate = a.EffectiveDate,
                            ExpiryDate = a.ExpiryDate,
                            Status = a.Status,
                            CreatedTime = a.CreatedTime,
                            a.ResponsibleUser,
                            CreatedBy = b.GivenName,
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).AsNoTracking().ToList();

            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "id", "Title", "Note", "EffectiveDate", "ExpiryDate", "QrCode", "CreatedTime", "CreatedBy");
            return Json(jdata);
        }

        //--------------------------------thêm mới---------------------------   
        [HttpPost]
        public object Insert([FromBody]ServiceCategoryCostHeader obj)
        {
            var expiryDate = !string.IsNullOrEmpty(obj.sExpiryDate) ? DateTime.ParseExact(obj.sExpiryDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;
            var effectiveDate = !string.IsNullOrEmpty(obj.sEffectiveDate) ? DateTime.ParseExact(obj.sEffectiveDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;
            var msg = new JMessage();
            try
            {
                var check = ValidateDate(effectiveDate, expiryDate, obj.Id);
                if (!check.Error)
                {
                    obj.CreatedBy = User.Identity.Name;
                    obj.CreatedTime = DateTime.Now;
                    obj.IsDeleted = false;
                    obj.ExpiryDate = expiryDate;
                    obj.EffectiveDate = effectiveDate;
                    obj.HeaderCode = Guid.NewGuid().ToString();
                    obj.GivenName = _context.Users.FirstOrDefault(x => x.UserName.Equals(obj.CreatedBy))?.GivenName;
                    _context.ServiceCategoryCostHeaders.Add(obj);
                    _context.SaveChanges();
                    msg.Error = false;
                    msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer[""]);
                    msg.Object = obj;
                }
                else
                {
                    msg = check;
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return msg;

        }
        [HttpPost]
        public object Delete(int Id)
        {
            var msg = new JMessage();
            try
            {
                var data = _context.ServiceCategoryCostHeaders.FirstOrDefault(x => x.Id == Id && x.IsDeleted == false);
                if (data != null)
                {
                    //Xóa header
                    data.IsDeleted = true;
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    _context.ServiceCategoryCostHeaders.Update(data);

                    //Xóa detail
                    var listDetail = _context.ServiceCategoryCostConditions.Where(x => !x.IsDeleted && x.HeaderCode == data.HeaderCode).ToList();
                    listDetail.ForEach(x => { x.IsDeleted = true; x.DeletedBy = ESEIM.AppContext.UserName; x.DeletedTime = DateTime.Now; });
                    _context.ServiceCategoryCostConditions.UpdateRange(listDetail);

                    _context.SaveChanges();
                    msg.Error = false;
                    msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer[""]);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_MSG_ERR"];
                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return msg;

        }

        [HttpPost]
        public object GetItem(int Id)
        {
            JMessage msg = new JMessage() { Error = false };
            try
            {
                var data = _context.ServiceCategoryCostHeaders.FirstOrDefault(x => x.Id == Id && x.IsDeleted == false);
                data.GivenName = _context.Users.FirstOrDefault(x => x.UserName.Equals(data.CreatedBy))?.GivenName;
                msg.Object = data;
                if (data == null)
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_MSG_ERR"];
                }
            }
            catch (Exception ex) { }
            return msg;
        }

        [HttpPost]
        public object Update([FromBody]ServiceCategoryCostHeader obj)
        {
            var expiryDate = !string.IsNullOrEmpty(obj.sExpiryDate) ? DateTime.ParseExact(obj.sExpiryDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;
            var effectiveDate = !string.IsNullOrEmpty(obj.sEffectiveDate) ? DateTime.ParseExact(obj.sEffectiveDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;
            var msg = new JMessage();
            try
            {
                var data = _context.ServiceCategoryCostHeaders.FirstOrDefault(x => x.Id == obj.Id && x.IsDeleted == false);
                if (data != null)
                {
                    var check = ValidateDate(effectiveDate, expiryDate, obj.Id);
                    if (!check.Error)
                    {
                        obj.UpdatedBy = ESEIM.AppContext.UserName;
                        obj.UpdatedTime = DateTime.Now;
                        data.Title = obj.Title;
                        data.Note = obj.Note;
                        data.ExpiryDate = expiryDate;
                        data.EffectiveDate = effectiveDate;
                        data.ResponsibleUser = obj.ResponsibleUser;
                        data.Status = obj.Status;
                        _context.ServiceCategoryCostHeaders.Update(data);
                        _context.SaveChanges();
                        msg.Error = false;
                        msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer[""]);
                        msg.Object = obj;
                    }
                    else
                    {
                        msg = check;
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_MSG_ERR"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return msg;

        }

        [HttpPost]
        public JsonResult InsertCostCondition([FromBody]ServiceCategoryCostCondition obj)
        {
            var msg = new JMessage { Error = false, Title = "" };

            var insert = false;

            if (string.IsNullOrEmpty(obj.ObjFromValue))
                obj.ObjFromValue = null;

            if (string.IsNullOrEmpty(obj.ObjToValue))
                obj.ObjToValue = null;

            try
            {
                if (obj.ServiceCatCode.Equals("DV_000"))
                {
                    var data = _context.ServiceCategoryCostConditions.FirstOrDefault(x => x.HeaderCode == obj.HeaderCode && x.ServiceCatCode == obj.ServiceCatCode && x.ObjFromValue.Equals(obj.ObjFromValue) && x.ObjToValue.Equals(obj.ObjToValue) && !x.IsDeleted);
                    if (data == null)
                    {
                        var objCostCondition = new ServiceCategoryCostCondition
                        {
                            ObjectCode = obj.ObjectCode,
                            ObjFromValue = obj.ObjFromValue,
                            ObjToValue = obj.ObjToValue,
                            Price = obj.Price,
                            Rate = obj.Rate,
                            ServiceCatCode = obj.ServiceCatCode,
                            HeaderCode = obj.HeaderCode,
                            Unit = obj.Unit,
                            ServiceUnit = obj.ServiceUnit,
                            Currency = !string.IsNullOrEmpty(obj.Currency) ? obj.Currency : "CURRENCY_VND",
                            CreatedBy = User.Identity.Name,
                            CreatedTime = DateTime.Now,
                            IsDeleted = false
                        };

                        _context.ServiceCategoryCostConditions.Add(objCostCondition);
                        _context.SaveChanges();
                        msg.Error = false;
                        msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer[""]);
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = string.Format(_sharedResources["COM_ERR_EXIST"], _stringLocalizer["SCP_CURD_LBL_SERVICE"]);
                    }
                }
                else
                {
                    var query = _context.ServiceCategoryCostConditions.Where(x => x.HeaderCode == obj.HeaderCode && x.ObjectCode.Equals("SERVICE_CONDITION_000") && !x.IsDeleted && x.ServiceCatCode.Equals(obj.ServiceCatCode)).ToList();
                    if (query.Count == 0)
                    {
                        if (obj.ObjectCode.Equals("SERVICE_CONDITION_000"))
                        {
                            var data = _context.ServiceCategoryCostConditions.FirstOrDefault(x => x.HeaderCode == obj.HeaderCode && x.ObjectCode == obj.ObjectCode && !x.IsDeleted && x.ServiceCatCode.Equals(obj.ServiceCatCode));
                            if (data == null)
                            {
                                var objCostCondition = new ServiceCategoryCostCondition
                                {
                                    ObjectCode = obj.ObjectCode,
                                    ObjFromValue = obj.ObjFromValue,
                                    ObjToValue = obj.ObjToValue,
                                    Price = obj.Price,
                                    Rate = obj.Rate,
                                    ServiceCatCode = obj.ServiceCatCode,
                                    HeaderCode = obj.HeaderCode,
                                    Unit = obj.Unit,
                                    ServiceUnit = obj.ServiceUnit,
                                    Currency = !string.IsNullOrEmpty(obj.Currency) ? obj.Currency : "CURRENCY_VND",
                                    CreatedBy = User.Identity.Name,
                                    CreatedTime = DateTime.Now,
                                    IsDeleted = false
                                };

                                _context.ServiceCategoryCostConditions.Add(objCostCondition);
                                _context.SaveChanges();
                                msg.Error = false;
                                msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer[""]);
                            }
                            else
                            {
                                msg.Error = true;
                                msg.Title = _stringLocalizer["SCP_CURD_MSG_CONDITION"];
                            }
                        }
                        else
                        {
                            msg.Error = true;
                            msg.Title = _stringLocalizer["SCP_CURD_MSG_STANDARD_CONDITIONS"]; //"";
                        }
                    }
                    else
                    {
                        if (obj.Priority == 2 || obj.Priority == 3 || obj.Priority == 4)
                        {
                            insert = true;
                        }
                        else if (obj.Priority == 1)
                        {
                            insert = false;
                            msg.Title = _stringLocalizer["SCP_CURD_MSG_CONDITION"];
                        }
                        else
                        {
                            var listCondition = (from a in _context.ServiceCategoryCostConditions.Where(x => !x.IsDeleted)
                                                 join b in _context.CommonSettings on a.ObjectCode equals b.CodeSet into b1
                                                 from b2 in b1.DefaultIfEmpty()
                                                 where a.HeaderCode.Equals(obj.HeaderCode) && a.ServiceCatCode.Equals(obj.ServiceCatCode)
                                                 select new
                                                 {
                                                     ServiceCatName = b2.ValueSet,
                                                     a.ServiceCatCode,
                                                     a.ObjectCode,
                                                     a.ObjFromValue,
                                                     a.ObjToValue,
                                                     Priority = b2.Priority != null ? b2.Priority : 0,
                                                     b2.Type
                                                 }).ToList();

                            var count = listCondition.Count();
                            if (count >= 4)
                            {
                                insert = true;
                            }
                            else
                            {
                                var listConditionReqText = new List<string>();
                                listConditionReqText.Add(_stringLocalizer["SCP_TXT_COMPUSORY"]);
                                var listConditionReq = _context.CommonSettings.Where(x => x.Group.Equals("SERVICE_CONDITION") && (x.Priority == 2 || x.Priority == 3 || x.Priority == 4)).ToList();
                                foreach (var item in listConditionReq)
                                {
                                    var check = listCondition.FirstOrDefault(x => x.ObjectCode.Equals(item.CodeSet));
                                    if (check == null)
                                        listConditionReqText.Add("- " + item.ValueSet);
                                }

                                msg.Error = true;
                                msg.Title = string.Join("<br/>", listConditionReqText);
                            }
                        }

                        if (insert)
                        {
                            var data = _context.ServiceCategoryCostConditions.FirstOrDefault(x => x.HeaderCode == obj.HeaderCode && x.ServiceCatCode.Equals(obj.ServiceCatCode) && x.ObjectCode == obj.ObjectCode && x.ObjFromValue.Equals(obj.ObjFromValue) && x.ObjToValue.Equals(obj.ObjToValue) && !x.IsDeleted);
                            if (data == null)
                            {
                                var objCostCondition = new ServiceCategoryCostCondition
                                {
                                    ObjectCode = obj.ObjectCode,
                                    ObjFromValue = obj.ObjFromValue,
                                    ObjToValue = obj.ObjToValue,
                                    Price = obj.Price,
                                    Rate = obj.Rate,
                                    ServiceCatCode = obj.ServiceCatCode,
                                    HeaderCode = obj.HeaderCode,
                                    Unit = obj.Unit,
                                    ServiceUnit = obj.ServiceUnit,
                                    Currency = !string.IsNullOrEmpty(obj.Currency) ? obj.Currency : "CURRENCY_VND",
                                    CreatedBy = User.Identity.Name,
                                    CreatedTime = DateTime.Now,
                                    IsDeleted = false
                                };

                                _context.ServiceCategoryCostConditions.Add(objCostCondition);
                                _context.SaveChanges();
                                msg.Error = false;
                                msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer[""]);
                            }
                            else
                            {
                                msg.Error = true;
                                msg.Title = _stringLocalizer["SCP_CURD_MSG_CONDITION"];
                            }
                        }
                        else
                        {
                            msg.Error = true;
                            return Json(msg);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Object = ex;
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateCostCondition([FromBody]ServiceCategoryCostCondition obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.ServiceCategoryCostConditions.FirstOrDefault(x => x.Id == obj.Id && x.IsDeleted == false);
                if (data != null)
                {
                    data.UpdatedBy = ESEIM.AppContext.UserName;
                    data.UpdatedTime = DateTime.Now;
                    data.IsDeleted = false;
                    data.Unit = obj.Unit;
                    data.ServiceUnit = obj.ServiceUnit;
                    data.ObjectCode = obj.ObjectCode;
                    data.ObjFromValue = obj.ObjFromValue;
                    data.ObjToValue = obj.ObjToValue;
                    data.Price = obj.Price;
                    data.Rate = obj.Rate;
                    data.Currency = !string.IsNullOrEmpty(obj.Currency) ? obj.Currency : "CURRENCY_VND";

                    _context.ServiceCategoryCostConditions.Update(data);
                    _context.SaveChanges();
                    msg.Error = false;
                    msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer[""]);

                    if (obj.ObjectCode.Equals("SERVICE_CONDITION_000"))
                    {
                        var listObjChange = _context.ServiceCategoryCostConditions.Where(x => x.HeaderCode.Equals(obj.HeaderCode) && x.ServiceCatCode.Equals(obj.ServiceCatCode) && !x.ObjectCode.Equals("SERVICE_CONDITION_000") && !x.IsDeleted).ToList();
                        foreach (var item in listObjChange)
                        {
                            item.Price = obj.Price * item.Rate;
                            item.Currency = !string.IsNullOrEmpty(obj.Currency) ? obj.Currency : "CURRENCY_VND";
                            _context.ServiceCategoryCostConditions.Update(item);
                            _context.SaveChanges();
                        }
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["SCP_CURD_MAG_CONDITION_NOT_EXIST"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Object = ex;
            }
            return Json(msg);
        }

        [HttpPost]
        public object JTableDetail([FromBody]JTableDetailModel jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.ServiceCategoryCostConditions
                        join b in _context.ServiceCategorys on a.ServiceCatCode equals b.ServiceCode
                        join c in _context.ServiceCategoryGroups.Where(x => !x.IsDeleted) on b.ServiceGroup equals c.Code into c1
                        from c2 in c1.DefaultIfEmpty()
                        orderby a.Id descending
                        where !a.IsDeleted && !b.IsDeleted
                        && a.HeaderCode == jTablePara.HeaderCode
                        select new
                        {
                            a.Id,
                            a.Price,
                            a.ObjFromValue,
                            a.ObjToValue,
                            ObjectCode = _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(a.ObjectCode) && !x.IsDeleted) != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(a.ObjectCode) && !x.IsDeleted).ValueSet : null,
                            Unit = _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(a.Unit) && !x.IsDeleted) != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(a.Unit) && !x.IsDeleted).ValueSet : null,
                            ServiceUnit = _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(a.ServiceUnit) && !x.IsDeleted) != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(a.ServiceUnit) && !x.IsDeleted).ValueSet : null,
                            Currency = _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(a.Currency) && !x.IsDeleted) != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(a.Currency) && !x.IsDeleted).ValueSet : null,
                            a.ServiceCatCode,
                            ServiceName = c2 != null ? string.Concat(b.ServiceName, "(" + c2.Name + ")") : b.ServiceName,
                            a.Rate,
                            sRate = a.Rate.ToString(),
                            Type = _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(a.ObjectCode) && !x.IsDeleted) != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(a.ObjectCode) && !x.IsDeleted).Type : null,
                        };

            var count = query.Count();
            var data = query.Skip(intBeginFor).Take(jTablePara.Length).ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "Price", "ObjFromValue", "ObjToValue", "ObjectCode", "Rate", "Unit", "ServiceUnit", "Currency", "ServiceName", "ServiceCatCode", "Type");
            return Json(jdata);
        }

        public JsonResult DeleteProduct(int Id)
        {
            JMessage msg = new JMessage();
            var data = _context.ServiceCategoryCostConditions.FirstOrDefault(x => x.Id == Id && x.IsDeleted == false);
            if (data != null)
            {
                data.IsDeleted = true;
                data.DeletedBy = ESEIM.AppContext.UserName;
                data.DeletedTime = DateTime.Now;
                _context.ServiceCategoryCostConditions.Update(data);
                _context.SaveChanges();
                msg.Error = false;
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer[""]);
            }
            else
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }

            return Json(msg);
        }

        [HttpPost]
        public object GetServiceDefault(string headerCode, string serviceCatCode)
        {
            var data = _context.ServiceCategoryCostConditions.Where(x => x.HeaderCode.Equals(headerCode) && x.ObjectCode == "SERVICE_CONDITION_000" && (x.ServiceCatCode.Equals(serviceCatCode) && !serviceCatCode.Equals("DV_000")) && !x.IsDeleted)
                .Select(x => new
                {
                    x.Unit,
                    x.Currency,
                    x.Price,
                    x.Rate
                });
            return data;
        }

        [HttpPost]
        public object GetUnitByServiceCode(string serviceCode)
        {
            var data = _context.ServiceCategorys.FirstOrDefault(x => x.ServiceCode.Equals(serviceCode) && !x.IsDeleted)?.Unit;
            return data;
        }

        [HttpPost]
        public object GetServiceConditionItem(int Id)
        {
            var data = (from a in _context.ServiceCategoryCostConditions.Where(x => !x.IsDeleted && x.Id.Equals(Id))
                        join b in _context.CommonSettings on a.ObjectCode equals b.CodeSet into b1
                        from b2 in b1.DefaultIfEmpty()
                        select new
                        {
                            a.HeaderCode,
                            a.Id,
                            a.ObjectCode,
                            a.ObjFromValue,
                            a.ObjToValue,
                            a.Price,
                            a.Rate,
                            a.Unit,
                            a.ServiceUnit,
                            a.ServiceCatCode,
                            b2.Type,
                            Priority = b2.Priority != null ? b2.Priority : 0
                        }).ToList();
            return data.FirstOrDefault();
        }

        [HttpPost]
        public object GetServiceResponsibleUser()
        {
            var data = _context.HREmployees.Where(x => x.flag == 1).Select(x => new { Code = x.Id, Name = x.fullname });
            return data;
        }

        [HttpPost]
        public object GetServiceUnit()
        {
            var data = _context.CommonSettings.Where(x => x.Group == "SERVICE_UNIT").Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return data;
        }

        [HttpPost]
        public object GetServiceUnitValue()
        {
            var data = _context.CommonSettings.Where(x => x.Group == "SERVICE_UNIT_VALUE").Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return data;
        }

        [HttpPost]
        public object GetServiceCondition()
        {
            var data = _context.CommonSettings.Where(x => x.Group == "SERVICE_CONDITION")
                                .Select(x => new
                                {
                                    Code = x.CodeSet,
                                    Name = x.ValueSet,
                                    x.Priority,
                                    x.Type
                                });
            return data;
        }

        [HttpPost]
        public object GetServiceStatus()
        {
            var data = _context.CommonSettings.Where(x => x.Group == "SERVICE_STATUS").Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return data;
        }

        [HttpPost]
        public object GetListCurrency()
        {
            var rs = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.CurrencyType)).OrderBy(x => x.ValueSet).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return rs;
        }

        [HttpPost]
        public object GetListServiceCategory()
        {
            JMessage msg = new JMessage() { Error = false };
            try
            {
                var data = from a in _context.ServiceCategorys.Where(x => !x.IsDeleted)
                           join b in _context.ServiceCategoryGroups.Where(x => !x.IsDeleted) on a.ServiceGroup equals b.Code into b1
                           from b2 in b1.DefaultIfEmpty()
                           orderby a.ServiceCode
                           select new
                           {
                               a.ServiceCatID,
                               Code = a.ServiceCode,
                               Name = b2 != null ? string.Concat(a.ServiceName, "(" + b2.Name + ")") : a.ServiceName,
                               Group = a.ServiceGroup
                           };
                msg.Object = data;
            }
            catch (Exception ex) { }
            return msg;
        }

        [HttpPost]
        public JMessage ValidateDate(DateTime effectiveDate, DateTime expiryDate, int id)
        {
            JMessage msg = new JMessage() { Error = false };
            try
            {
                var listDates = (_context.ServiceCategoryCostHeaders.Where(x => !x.IsDeleted && x.Id != id)
                    .OrderBy(x => x.EffectiveDate)
                    .Select(x => new
                    {
                        x.EffectiveDate,
                        x.ExpiryDate
                    })).ToList();

                foreach (var item in listDates)
                {
                    if ((item.EffectiveDate <= effectiveDate && item.ExpiryDate >= effectiveDate))
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["SCP_CURD_MSG_EFFECTIVE_DATE_FROM_ALREADY_EXIST"]; //"Ngày hiệu lực từ đã tồn tại trong bảng giá khác";
                        break;
                    }
                    else if ((item.EffectiveDate <= expiryDate && item.ExpiryDate >= expiryDate))
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["SCP_CURD_MSG_EFFECTIVE_DATE_TO_ALREADY_EXIST"]; //"Ngày hiệu lực đến đã tồn tại trong bảng giá khác";
                        break;
                    }
                    else if ((item.EffectiveDate <= effectiveDate && item.ExpiryDate >= effectiveDate) && (item.EffectiveDate <= expiryDate && item.ExpiryDate >= expiryDate))
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["SCP_CURD_MSG_EFFECTIVE_DATE_FROM_TO_ALREADY_EXIST"];//"Ngày hiệu lực từ và đến đã tồn tại trong bảng giá khác";
                        break;
                    }
                }
            }
            catch (Exception ex) { }
            return msg;
        }

        public class JtableExtendModel : JTableModel
        {
            public string ProductCode { get; set; }
        }

        public class JTableProductFile : JTableModel
        {
            public string ProductCode { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
        }
        public class JTableProductRes
        {
            public int Id { get; set; }
            public string ProductCode { get; set; }
            public string ProductName { get; set; }
            public string Quantity { get; set; }
            public DateTime? CreatedTime { get; set; }
            public string CreatedBy { get; set; }
            public string LotProductCode { get; set; }
            public double Cost { get; set; }
            public double Tax { get; set; }
            public string Note { get; set; }
            public string sQrCode { get; set; }
            public string sBarCode { get; set; }
        }
        public class JTableLotProductRes
        {
            public int Id { get; set; }
            public string QrCode { get; set; }
            public string BarCode { get; set; }
            public string Title { get; set; }
            public string Supplier { get; set; }
            public string SupplierName { get; set; }
            public decimal Cost { get; set; }
            public DateTime? ExpiryDate { get; set; }
            public DateTime CreatedTime { get; set; }
            public string CreatedBy { get; set; }
            public string CreatedByName { get; set; }
            public string PathImg { get; set; }
            public string Packing { get; set; }
            public string Store { get; set; }
            public string LotProductName { get; set; }
            public string sQrCode { get; set; }
            public string sBarCode { get; set; }

        }

        public class JTableModelCustom : JTableModel
        {
            public string Title { get; set; }
            public string Status { get; set; }
        }
        public class JTableDetailModel : JTableModel
        {
            public string HeaderCode { get; set; }
        }

        public class JTableProductCustom : JTableModel
        {
            public string LotProductCode { get; set; }
        }
        public class JTableHeaderRes
        {
            public int Id { get; set; }
            public string Title { get; set; }
            public string Note { get; set; }
            public DateTime? EffectiveDate { get; set; }
            public DateTime? ExpiryDate { get; set; }
            public DateTime? CreatedTime { get; set; }
            public string CreatedBy { get; set; }
            public string QrCode { get; set; }
        }

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var a = _stringLocalizer["SCP_COL_CREATED_BY"];
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