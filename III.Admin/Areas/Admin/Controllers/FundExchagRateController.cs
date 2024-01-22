using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using System.Net;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;
using System.Globalization;
using Microsoft.Extensions.Localization;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class FundExchagRateController : BaseController
    {
        public class FundExchagRatesJtableModel
        {
            public int Id { get; set; }
            public string Currency { get; set; }
            public decimal Rate { get; set; }
            public string CreatedBy { get; set; }
            public DateTime? CreatedTime { get; set; }
            public string UpdatedBy { get; set; }
            public DateTime? UpdatedTime { get; set; }
            public string DeletedBy { get; set; }
            public DateTime? DeletedTime { get; set; }
            public bool IsDeleted { get; set; }
        }
        private readonly EIMDBContext _context;
        private readonly IStringLocalizer<FundExchagRateController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;

        public FundExchagRateController(EIMDBContext context, IStringLocalizer<FundExchagRateController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }
        [Breadcrumb("ViewData.CrumbFundExChangeRate", AreaName = "Admin", FromAction = "Index", FromController = typeof(WarringFundsHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuFinance"] = _sharedResources["COM_CRUMB_MENU_FINANCE"];
            ViewData["CrumbWarningFundHome"] = _sharedResources["COM_CRUMB_WARNING_FUND_HOME"];
            ViewData["CrumbFundExChangeRate"] = _sharedResources["COM_CRUMB_EXCHANGE_RATE"];
            return View();
        }

        public class JTableModelAct : JTableModel
        {

            public int Id { get; set; }
            public string Currency { get; set; }
            public decimal Rate { get; set; }
        }

        #region action

        //[HttpPost]
        public async Task<object> JTable([FromBody]JTableModelAct jTablePara)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var urlChange = "https://api.exchangerate-api.com/v4/latest/USD";

                var obj = await CommonUtil.SendAPIRequest(urlChange);


                JObject jObject = JObject.Parse(obj.Object.ToString());
                JToken rate = jObject["rates"];

                var date = DateTime.ParseExact(jObject["date"].ToString(), "yyyy-MM-dd", CultureInfo.InvariantCulture);
                var listChangeRate = new List<ChangeRate>();
                foreach (var item in rate)
                {
                    var key = ((Newtonsoft.Json.Linq.JProperty)item).Name;
                    var value = ((Newtonsoft.Json.Linq.JProperty)item).Value.ToString();

                    var objRate = new ChangeRate
                    {
                        Key = key,
                        Value = value,

                    };
                    var dataex = _context.FundExchagRates.FirstOrDefault(x => x.Currency.Equals(objRate.Key) && x.IsDeleted == false);
                    if (dataex == null)
                    {
                        var objex = new FundExchagRate
                        {
                            Currency = objRate.Key,
                            Rate = decimal.Parse(objRate.Value),
                            CreatedTime = DateTime.Now,
                            CreatedBy = User.Identity.Name,
                        };
                        _context.FundExchagRates.Add(objex);
                        _context.SaveChanges();
                    }
                    else
                    {
                        dataex.UpdatedTime = DateTime.Now;
                        dataex.UpdatedBy = ESEIM.AppContext.UserName;
                        dataex.Rate = decimal.Parse(objRate.Value);
                        _context.FundExchagRates.Update(dataex);
                        _context.SaveChanges();
                    }
                    listChangeRate.Add(objRate);
                }
                int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
                var query = from a in listChangeRate
                            where (string.IsNullOrEmpty(jTablePara.Currency) || a.Key.ToLower().Equals(jTablePara.Currency.ToLower()))
                            select new FundExchagRatesJtableModel
                            {
                                Currency = a.Key,
                                Rate = Math.Round(decimal.Parse(a.Value), 5)
                            };
                int count = query.Count();
                var data = query.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length);
                var jdata = JTableHelper.JObjectTable(data.ToList(), jTablePara.Draw, count, "Id", "Currency", "Rate");
                return Json(jdata);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _stringLocalizer["FCC_MSG_ADD_ERROR"];//"Có lỗi xảy ra khi thêm?";
                return Json(msg);
            }

        }


        public class ChangeRate
        {
            public string Key { set; get; }
            public string Value { set; get; }
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