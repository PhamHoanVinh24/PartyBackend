using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using System.Globalization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;
using System.IO;
using System.Collections.Generic;
using Syncfusion.XlsIO;
using Syncfusion.Drawing;
using ESEIM;
using III.Domain.Enums;
using Newtonsoft.Json;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class ParamForWarningController : Controller
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IStringLocalizer<ParamForWarningController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public ParamForWarningController(EIMDBContext context, IUploadService upload, IStringLocalizer<ParamForWarningController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _upload = upload;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }
        [Breadcrumb("ViewData.CrumbParamForWarning", AreaName = "Admin", FromAction = "Index", FromController = typeof(WarringFundsHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuFinance"] = _sharedResources["COM_CRUMB_MENU_FINANCE"];
            ViewData["CrumbWarningFundHome"] = _sharedResources["COM_CRUMB_WARNING_FUND_HOME"];
            ViewData["CrumbParamForWarning"] = _sharedResources["COM_CRUMB_PARAM_WARNING"];
            return View();
        }
        public class ParamForWarningJtableModel
        {
            public int Id { get; set; }
            public decimal? Total { get; set; }
            public string Curency { get; set; }
            public string FromTime { get; set; }
            public string ToTime { get; set; }
            public string Acttype { get; set; }
            public string CatCode { get; set; }
        }
        public class JTableModelParamForWarning : JTableModel
        {

            public decimal? Total { get; set; }
            public string Curency { get; set; }
            public string FromTime { get; set; }
            public string ToTime { get; set; }




        }
        public class ChangeRate
        {
            public string Key { set; get; }
            public string Value { set; get; }
        }
        public class JTableModelAct : JTableModel
        {

            public int Id { get; set; }
            public string Currency { get; set; }
            public decimal Rate { get; set; }
        }
        [HttpPost]
        public object GetItem([FromBody] int Id)
        {
            var data = _context.ParamForWarnings.FirstOrDefault(x => x.id == Id);

            var obj = new ParamForWarningModel
            {
                id = data.id,
                AETType = data.aetType,
                Total = data.total.ToString(),
                CatCode = data.catCode,
                Currency = data.currency,
                FromTime = data.fromTime.HasValue ? data.fromTime.Value.ToString("dd/MM/yyyy") : "",
                ToTime = data.toTime.HasValue ? data.toTime.Value.ToString("dd/MM/yyyy") : "",


            };
            return obj;
        }

        [HttpPost]
        public object JTable([FromBody]JTableModelParamForWarning jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var fromTime = !string.IsNullOrEmpty(jTablePara.FromTime) ? DateTime.ParseExact(jTablePara.FromTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toTime = !string.IsNullOrEmpty(jTablePara.ToTime) ? DateTime.ParseExact(jTablePara.ToTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            var query = from a in _context.ParamForWarnings
                        join b in _context.FundCatReptExpss.Where(x=> x.IsDeleted == false) on a.catCode equals b.CatCode
                        where (string.IsNullOrEmpty(jTablePara.Curency) || a.currency.ToLower().Equals(jTablePara.Curency.ToLower()))
                        && ((jTablePara.Total == null) || (jTablePara.Total <= a.total))
                        && ((fromTime == null || (fromTime <= a.fromTime))) && (toTime == null || toTime >= a.toTime)
                        && a.isDeleted == false
                        select new
                        {
                            id = a.id,
                            aettype = a.aetType,
                            catCode = a.catCode,
                            total = a.total,
                            currency = a.currency,
                            fromTime = a.fromTime,
                            toTime = a.toTime,
                            catName = b.CatName

                        };

            int count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).AsNoTracking().ToList();
            var data1 = data.Skip(intBeginFor).Take(jTablePara.Length).ToList();
            var jdata = JTableHelper.JObjectTable(data1, jTablePara.Draw, count, "id", "aettype", "catCode", "total", "currency", "fromTime", "toTime", "catName");
            return Json(jdata);
        }
        [HttpPost]

        public object GetCurrency()
        {
            var data = _context.FundCurrencys.Select(x => new { Currency = x.CurrencyCode }).AsNoTracking().ToList();
            return data;
        }
        //[HttpPost]
        //public object GetCatCode()
        //{
        //    var data = _context.FundCatReptExpss.Where(x => x.IsDeleted == false).Select(x => new { CatCode = x.CatCode, CatName = x.CatName }).AsNoTracking().ToList();
        //    return data;
        //}

        [HttpPost]
        public object Insert([FromBody]ParamForWarningModel data)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var fromDate = !string.IsNullOrEmpty(data.FromTime) ? DateTime.ParseExact(data.FromTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var toDate = !string.IsNullOrEmpty(data.ToTime) ? DateTime.ParseExact(data.ToTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var model = _context.ParamForWarnings.FirstOrDefault(x => x.aetType.ToLower() == data.AETType.ToLower() && x.catCode.ToLower() == data.CatCode.ToLower() && ((fromDate >= x.fromTime && fromDate < x.toTime) || (toDate <= x.toTime && toDate > x.fromTime)) && x.isDeleted == false);
                if (model == null)
                {

                    var obj = new ParamForWarning
                    {
                        aetType = data.AETType,
                        createdTime = DateTime.Now,
                        catCode = data.CatCode,
                        currency = data.Currency,
                        total = decimal.Parse(data.Total),
                        createdBy = ESEIM.AppContext.UserName,
                        fromTime = fromDate,
                        toTime = toDate


                    };

                    //data.CreatedBy = ESEIM.AppContext.UserName;
                    //data.CreatedTime = DateTime.Now;

                    _context.ParamForWarnings.Add(obj);
                    _context.SaveChanges();

                    msg.Title = _stringLocalizer["PFW_MSG_ADD_WARNING_SUCCESS"];// thêm canh bao thành công
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["PFW_MSG_WARNING_EXITS"];//"Cảnh báo đã tồn tại";
                }

                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Object = ex;
                return Json(msg);
            }
        }
        [HttpPost]
        public object Update([FromBody]ParamForWarningModel obj)
        {
            var msg = new JMessage() { Error = false };
            var fromTime = !string.IsNullOrEmpty(obj.FromTime) ? DateTime.ParseExact(obj.FromTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toTime = !string.IsNullOrEmpty(obj.ToTime) ? DateTime.ParseExact(obj.ToTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var model = _context.ParamForWarnings.
                        Where(x => (x.isDeleted == false) && (x.aetType.ToLower() == obj.AETType.ToLower()) && (x.catCode.ToLower() == obj.CatCode.ToLower()) && ((fromTime >= x.fromTime && fromTime < x.toTime) || (toTime > x.fromTime && toTime <= x.toTime)) && (x.id != obj.id)).
                        AsNoTracking().ToList();
            //var model1 = _context.ParamForWarnings.Where(x => (x.id == data.id) && (x.isDeleted == false)).AsNoTracking().ToList(); 

            try
            {

                var data = _context.ParamForWarnings.FirstOrDefault(x => x.id == obj.id && x.isDeleted == false);
                if (model.Count == 0)
                {
                    if (data != null)
                    {
                        data.updatedBy = ESEIM.AppContext.UserName;
                        data.updatedTime = DateTime.Now;
                        data.total = decimal.Parse(obj.Total);
                        data.currency = obj.Currency;
                        data.fromTime = Convert.ToDateTime(fromTime);
                        data.toTime = Convert.ToDateTime(toTime);
                        data.aetType = obj.AETType;
                        data.catCode = obj.CatCode;

                    }
                    _context.ParamForWarnings.Update(data);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizer["PFW_MSG_UPDATE_WARNING_SUCCESS"];//"Cập nhật cảnh báo thành công";

                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["PFW_MSG_WARNING_EXITS"];//"Cảnh báo đã tồn tại";
                }
                return Json(msg);

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _stringLocalizer["PFW_MSG_UPDATE_WARNING_FAIL"];//"Có lỗi xảy ra khi cập nhật!";
            }
            return Json(msg);
        }

        [HttpPost]
        public object Delete(int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.ParamForWarnings.FirstOrDefault(x => x.id == id);
                data.deletedBy = ESEIM.AppContext.UserName;
                data.deletedTime = DateTime.Now;
                data.isDeleted = true;

                _context.ParamForWarnings.Update(data);
                _context.SaveChanges();

                msg.Title = _stringLocalizer["PFW_MSG_DELETE_WARNING_SUCCESS"]; //"Xóa thành công";
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"]; //"Có lỗi xảy ra khi xóa!";
                msg.Object = ex;
                return Json(msg);
            }
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