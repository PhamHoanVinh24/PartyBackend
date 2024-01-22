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

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class AllowanceCategoryPriceController : BaseController
    {
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly EIMDBContext _context;
        private readonly ILogger _logger;
        private readonly IActionLogService _actionLog;
        private readonly AppSettings _appSettings;
        private readonly IUploadService _upload;
        private readonly IStringLocalizer<AllowanceCategoryPriceController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;

        public AllowanceCategoryPriceController(EIMDBContext context, IUploadService upload, IOptions<AppSettings> appSettings, IHostingEnvironment hostingEnvironment, IActionLogService actionLog, IStringLocalizer<AllowanceCategoryPriceController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {

            _context = context;
            _hostingEnvironment = hostingEnvironment;
            _actionLog = actionLog;
            _appSettings = appSettings.Value;
            _upload = upload;
            _sharedResources = sharedResources;
            _stringLocalizer = stringLocalizer;
        }

        public IActionResult Index()
        {
            return View("Index");
        }

        [HttpPost]
        public object JTable([FromBody]JTableDetailModel jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.AllowanceContraints
                        join b in _context.AllowanceCategorys on a.AllowanceCatCode equals b.Code
                        orderby a.Id descending
                        where !a.IsDeleted && !b.IsDeleted
                        select new
                        {
                            a.Id,
                            a.Price,
                            a.ObjFromValue,
                            a.ObjToValue,
                            ObjectCode = _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(a.ObjectCode) && !x.IsDeleted) != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(a.ObjectCode) && !x.IsDeleted).ValueSet : null,
                            Unit = _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(a.Unit) && !x.IsDeleted) != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(a.Unit) && !x.IsDeleted).ValueSet : null,
                            Currency = _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(a.Currency) && !x.IsDeleted) != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(a.Currency) && !x.IsDeleted).ValueSet : null,
                            a.AllowanceCatCode,
                            AllowanceName = b.Name,
                        };

            var count = query.Count();
            var data = query.Skip(intBeginFor).Take(jTablePara.Length).ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "Price", "ObjFromValue", "ObjToValue", "ObjectCode", "Unit", "Currency", "AllowanceName", "AllowanceCatCode");
            return Json(jdata);
        }


        //--------------------------------thêm mới---------------------------   
        [HttpPost]
        public object GetItem(int Id)
        {
            JMessage msg = new JMessage() { Error = false };
            try
            {
                var data = _context.AllowanceContraints.FirstOrDefault(x => x.Id == Id && x.IsDeleted == false);
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
        public JsonResult InsertCostCondition([FromBody]AllowanceContraint obj)
        {
            var msg = new JMessage { Error = false, Title = "" };

            if (string.IsNullOrEmpty(obj.ObjFromValue))
                obj.ObjFromValue = null;

            if (string.IsNullOrEmpty(obj.ObjToValue))
                obj.ObjToValue = null;

            try
            {
                var data = _context.AllowanceContraints.FirstOrDefault(x => x.AllowanceCatCode == obj.AllowanceCatCode && x.ObjectCode.Equals(obj.ObjectCode) && x.ObjFromValue.Equals(obj.ObjFromValue) && x.ObjToValue.Equals(obj.ObjToValue) && !x.IsDeleted);
                if (data == null)
                {
                    var objCostCondition = new AllowanceContraint
                    {
                        ObjectCode = obj.ObjectCode,
                        ObjFromValue = obj.ObjFromValue,
                        ObjToValue = obj.ObjToValue,
                        Price = obj.Price,
                        AllowanceCatCode = obj.AllowanceCatCode,
                        Unit = obj.Unit,
                        Currency = !string.IsNullOrEmpty(obj.Currency) ? obj.Currency : "VND",
                        CreatedBy = User.Identity.Name,
                        CreatedTime = DateTime.Now,
                        IsDeleted = false
                    };

                    _context.AllowanceContraints.Add(objCostCondition);
                    _context.SaveChanges();
                    msg.Error = false;
                    msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer[""]);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = string.Format(_sharedResources["COM_ERR_EXIST"], _stringLocalizer["ALCP_CURD_LBL_SERVICE"]);
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
        public JsonResult UpdateCostCondition([FromBody]AllowanceContraint obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.AllowanceContraints.FirstOrDefault(x => x.Id == obj.Id && x.IsDeleted == false);
                if (data != null)
                {
                    data.UpdatedBy = ESEIM.AppContext.UserName;
                    data.UpdatedTime = DateTime.Now;
                    data.IsDeleted = false;
                    data.Unit = obj.Unit;
                    data.ObjectCode = obj.ObjectCode;
                    data.ObjFromValue = obj.ObjFromValue;
                    data.ObjToValue = obj.ObjToValue;
                    data.Price = obj.Price;
                    data.Currency = !string.IsNullOrEmpty(obj.Currency) ? obj.Currency : "VND";

                    _context.AllowanceContraints.Update(data);
                    _context.SaveChanges();
                    msg.Error = false;
                    msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer[""]);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["ALCP_CURD_MAG_CONDITION_NOT_EXIST"];
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
        public object DeleteCostCondition(int Id)
        {
            JMessage msg = new JMessage() { Error = false };
            try
            {
                var data = _context.AllowanceContraints.FirstOrDefault(x => x.Id == Id && !x.IsDeleted);
                if (data == null)
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_MSG_ERR"];
                }
                else
                {
                    data.IsDeleted = true;
                    _context.AllowanceContraints.Update(data);
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer["ALCP_CURD_LBL_SERVICE"]);
                }
            }
            catch (Exception ex) { }
            return msg;
        }

        [HttpPost]
        public object GetAllowanceDefault(string headerCode, string serviceCatCode)
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
        public object GetUnitByAllowanceCode(string serviceCode)
        {
            var data = _context.ServiceCategorys.FirstOrDefault(x => x.ServiceCode.Equals(serviceCode) && !x.IsDeleted)?.Unit;
            return data;
        }

        [HttpPost]
        public object GetAllowanceConditionItem(int Id)
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
        public object GetAllowanceUnit()
        {
            var data = _context.CommonSettings.Where(x => x.Group == "ALLOWANCE_UNIT").Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return data;
        }

        [HttpPost]
        public object GetAllowanceUnitValue()
        {
            var data = _context.CommonSettings.Where(x => x.Group == "ALLOWANCE_UNIT_VALUE").Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return data;
        }

        [HttpPost]
        public object GetAllowanceCondition()
        {
            var data = _context.CommonSettings.Where(x => x.Group == "ALLOWANCE_CONDITION")
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
        public object GetListCurrency()
        {
            var rs = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.CurrencyType)).OrderBy(x => x.ValueSet).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return rs;
        }

        [HttpPost]
        public object GetListAllowanceCategory()
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


        public class JTableModelCustom : JTableModel
        {
            public string Title { get; set; }
            public string Status { get; set; }
        }
        public class JTableDetailModel : JTableModel
        {
            public string HeaderCode { get; set; }
        }
        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var a = _stringLocalizer["ALCP_COL_CREATED_BY"];
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