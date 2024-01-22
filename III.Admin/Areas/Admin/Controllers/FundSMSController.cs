using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using System.Collections.Generic;
using System.Globalization;
using Microsoft.Extensions.Localization;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class FundSMSController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IStringLocalizer<FundSMSController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public FundSMSController(EIMDBContext context, IUploadService upload, IStringLocalizer<FundSMSController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _upload = upload;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }
        [Breadcrumb("ViewData.CrumbFundSMS", AreaName = "Admin", FromAction = "Index", FromController = typeof(WarringFundsHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuFinance"] = _sharedResources["COM_CRUMB_MENU_FINANCE"];
            ViewData["CrumbWarningFundHome"] = _sharedResources["COM_CRUMB_WARNING_FUND_HOME"];
            ViewData["CrumbFundSMS"] = _sharedResources["COM_CRUMB_FUND_SMS"];
            return View();
        }
        public class jJTableModelFundSMS : JTableModel
        {
            public string STK { get; set; }
            public string Status { get; set; }
            public string FromTime { get; set; }
            public string ToTime { get; set; }
            public string Bank { get; set; }
        }
        [HttpPost]
        public object JTable([FromBody]jJTableModelFundSMS jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var fromTime = !string.IsNullOrEmpty(jTablePara.FromTime) ? DateTime.ParseExact(jTablePara.FromTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toTime = !string.IsNullOrEmpty(jTablePara.ToTime) ? DateTime.ParseExact(jTablePara.ToTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            var query = from a in _context.FundLoaddingSMSBanks
                        where (string.IsNullOrEmpty(jTablePara.STK) || (a.ACC_Receiver.ToLower().Contains(jTablePara.STK.ToLower()) || a.ACC_Sender.ToLower().Contains(jTablePara.STK.ToLower())))
                        && ((string.IsNullOrEmpty(jTablePara.Status)) || (jTablePara.Status.Equals(a.SMS_Status)))
                        && ((fromTime == null || (fromTime <= a.Created_Date))) && (toTime == null || toTime >= a.Created_Date)
                        && (string.IsNullOrEmpty(jTablePara.Bank) || (jTablePara.Bank.Equals(a.Bank_Name)))
                        && a.IsDeleted == false
                        select new
                        {
                            id = a.Id,
                            stk = a.ACC_Sender == null ? a.ACC_Receiver : a.ACC_Sender,
                            money = a.MoneyTranfer,
                            balance = a.ACC_Balance,
                            status = a.SMS_Status,
                            created = a.Created_Date,
                            bank = a.Bank_Name,
                            raw = a.SMS_Raw,
                        };

            int count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).AsNoTracking().ToList();
            var data1 = data.Skip(intBeginFor).Take(jTablePara.Length).ToList();
            var jdata = JTableHelper.JObjectTable(data1, jTablePara.Draw, count, "raw", "id", "stk", "money", "balance", "status", "created", "bank");
            return Json(jdata);
        }
        public object GetListBank()
        {
            var data = _context.FundLoaddingSMSBanks.Where(x => x.IsDeleted == false).OrderBy(a => a.Bank_Name).Select(d => new { Code = d.Bank_Name, Name = d.Bank_Name }).DistinctBy(x => x.Code);
            return data;
        }

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new Newtonsoft.Json.Linq.JObject();
            var a = _stringLocalizer["FSMS_CURD_SEARCH_LBL_BANK"];
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