using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using System.Collections.Generic;
using Microsoft.Extensions.Localization;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class FundWarningController : BaseController
    {

        private readonly EIMDBContext _context;
        private readonly IStringLocalizer<FundWarningController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        [Breadcrumb("ViewData.CrumdFundWarning", AreaName = "Admin", FromAction = "Index", FromController = typeof(WarringFundsHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuFinance"] = _sharedResources["COM_CRUMB_MENU_FINANCE"];
            ViewData["CrumbWarningFundHome"] = _sharedResources["COM_CRUMB_WARNING_FUND_HOME"];
            ViewData["CrumdFundWarning"] = _sharedResources["COM_CRUMB_FUND_WARNING"];
            return View();
        }
        public FundWarningController(EIMDBContext context, IStringLocalizer<FundWarningController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }
        public class JTableModelWarning : JTableModel
        {
            public string CatCode { get; set; }
        }

        [HttpPost]
        public object JTableExpense(JTableModelWarning jTablePara)
        {
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var data = (from a in _context.FundAccEntrys.Where(x => x.IsDeleted == false && x.IsPlan == false && x.AetType == "Expense")
                        join b in _context.FundAccEntryTrackings.Where(x => x.IsDeleted == false) //&& x.Action == "FUND_APPROVED")
                        on a.AetCode equals b.AetCode
                        select new
                        {
                            a.CatCode,
                            a.AetType,
                            a.AetCode,
                            a.DeadLine,
                            a.Payer,
                            a.Receiptter,
                            a.Total,
                            a.Currency,
                        });

            var data1 = (from a in _context.FundCatReptExpss.Where(x => x.IsDeleted == false)
                         join b in data on a.CatCode equals b.CatCode
                         select new
                         {
                             CatName = a.CatName,
                             CatCode = b.CatCode,
                             AetType = b.AetType,
                             AetCode = b.AetCode,
                             DeadLine = b.DeadLine.Value,
                             Payer = b.Payer,
                             Receiptter = b.Receiptter,
                             Currency = b.Currency,
                             Total = (b.Currency == "VND" || b.Currency == "VNĐ") ? b.Total : (b.Total * ((1 / _context.FundExchagRates.FirstOrDefault(x => x.Currency == b.Currency).Rate) * _context.FundExchagRates.FirstOrDefault(x => x.Currency == "VND").Rate)),

                         }).ToList();
            var data2 = (from a in data1
                         join b in _context.ParamForWarnings.Where(x => x.isDeleted == false && x.aetType == "Expense")
                         on a.CatCode equals b.catCode
                         where a.DeadLine >= b.fromTime && a.DeadLine <= b.toTime
                         group a by new { a.CatCode, a.AetType }
                        into list
                         orderby list.Key.CatCode
                         select new
                         {
                             list,
                             catName = list.Select(x => x.CatName).FirstOrDefault(),
                             total = list.Sum(x => x.Total),
                             catCode = list.Key.CatCode,
                             aetType = list.Key.AetType,
                             maxDate = list.Max(x => x.DeadLine),
                             minDate = list.Min(x => x.DeadLine),

                         }).ToList();
            var query = (from a in data2.Where(x => x.aetType == "Expense")
                         join b in _context.ParamForWarnings.Where(x => x.isDeleted == false && x.aetType == "Expense")
                         on a.catCode equals b.catCode
                         where a.maxDate <= b.toTime && a.minDate >= b.fromTime && a.total >= b.total
                         select new
                         {
                             id = b.id,
                             maxTotal = b.total,
                             fromDate = b.fromTime,
                             toDate = b.toTime,
                             aetType = b.aetType,
                             catCode = b.catCode,
                             currency = b.currency,
                             total = a.total,
                             catName = a.catName,
                         }).ToList();
            int count = query.Count();
            var jdata = JTableHelper.JObjectTable(query, jTablePara.Draw, count, "id", "maxTotal", "fromDate", "toDate", "currency", "aetType", "catCode", "total", "catName");
            return Json(jdata);
        }

        [HttpPost]
        public int CountExpense()
        {
            var data = (from a in _context.FundAccEntrys.Where(x => x.IsDeleted == false && x.IsPlan == false && x.AetType == "Expense")
                        join b in _context.FundAccEntryTrackings.Where(x => x.IsDeleted == false )//&& x.Action == "FUND_APPROVED")
                        on a.AetCode equals b.AetCode
                        select new
                        {
                            a.CatCode,
                            a.AetType,
                            a.AetCode,
                            a.DeadLine,
                            a.Payer,
                            a.Receiptter,
                            a.Total,
                            a.Currency,
                        });

            var data1 = (from a in _context.FundCatReptExpss.Where(x => x.IsDeleted == false)
                         join b in data on a.CatCode equals b.CatCode
                         select new
                         {
                             CatName = a.CatName,
                             CatCode = b.CatCode,
                             AetType = b.AetType,
                             AetCode = b.AetCode,
                             DeadLine = b.DeadLine.Value,
                             Payer = b.Payer,
                             Receiptter = b.Receiptter,
                             Currency = b.Currency,
                             Total = (b.Currency == "VND" || b.Currency == "VNĐ") ? b.Total : (b.Total * ((1 / _context.FundExchagRates.FirstOrDefault(x => x.Currency == b.Currency).Rate) * _context.FundExchagRates.FirstOrDefault(x => x.Currency == "VND").Rate)),

                         }).ToList();
            var data2 = (from a in data1
                         join b in _context.ParamForWarnings.Where(x => x.isDeleted == false && x.aetType == "Expense")
                         on a.CatCode equals b.catCode
                         where a.DeadLine >= b.fromTime && a.DeadLine <= b.toTime
                         group a by new { a.CatCode, a.AetType }
                        into list
                         orderby list.Key.CatCode
                         select new
                         {
                             list,
                             catName = list.Select(x => x.CatName).FirstOrDefault(),
                             total = list.Sum(x => x.Total),
                             catCode = list.Key.CatCode,
                             aetType = list.Key.AetType,
                             maxDate = list.Max(x => x.DeadLine),
                             minDate = list.Min(x => x.DeadLine),

                         }).ToList();
            var query = (from a in data2.Where(x => x.aetType == "Expense")
                         join b in _context.ParamForWarnings.Where(x => x.isDeleted == false && x.aetType == "Expense")
                         on a.catCode equals b.catCode
                         where a.maxDate <= b.toTime && a.minDate >= b.fromTime && a.total >= b.total
                         select new
                         {
                             id = b.id,
                             maxTotal = b.total,
                             fromDate = b.fromTime,
                             toDate = b.toTime,
                             aetType = b.aetType,
                             catCode = b.catCode,
                             currency = b.currency,
                             total = a.total,
                             catName = a.catName,
                         }).ToList();
            int count = query.Count();
            return count;
        }

        [HttpPost]
        public int CountReceipt()
        {
            var data = (from a in _context.FundAccEntrys.Where(x => x.IsDeleted == false && x.IsPlan == false && x.AetType == "Receipt")
                        join b in _context.FundAccEntryTrackings.Where(x => x.IsDeleted == false )//&& x.Action == "FUND_APPROVED")
                        on a.AetCode equals b.AetCode
                        select new
                        {
                            a.CatCode,
                            a.AetType,
                            a.AetCode,
                            a.DeadLine,
                            a.Payer,
                            a.Receiptter,
                            a.Total,
                            a.Currency,
                        });
            var data1 = (from a in _context.FundCatReptExpss.Where(x => x.IsDeleted == false)
                         join b in data on a.CatCode equals b.CatCode
                         select new
                         {
                             CatName = a.CatName,
                             CatCode = b.CatCode,
                             AetType = b.AetType,
                             AetCode = b.AetCode,
                             DeadLine = b.DeadLine.Value,
                             Payer = b.Payer,
                             Receiptter = b.Receiptter,
                             Currency = b.Currency,
                             Total = (b.Currency == "VND" || b.Currency == "VNĐ") ? b.Total : (b.Total * ((1 / _context.FundExchagRates.FirstOrDefault(x => x.Currency == b.Currency).Rate) * _context.FundExchagRates.FirstOrDefault(x => x.Currency == "VND").Rate)),
                         }).DistinctBy(x => x.AetCode);
            var data2 = (from a in data1
                         join b in _context.ParamForWarnings.Where(x => x.isDeleted == false && x.aetType == "Receipt")
                         on a.CatCode equals b.catCode
                         where a.DeadLine >= b.fromTime && a.DeadLine <= b.toTime
                         group a by new { a.CatCode, a.AetType }
                        into list
                         orderby list.Key.CatCode
                         select new
                         {
                             list,
                             catName = list.Select(x => x.CatName).FirstOrDefault(),
                             total = list.Sum(x => x.Total),
                             catCode = list.Key.CatCode,
                             aetType = list.Key.AetType,
                             maxDate = list.Max(x => x.DeadLine),
                             minDate = list.Min(x => x.DeadLine),

                         }).ToList();
            var query = (from a in data2.Where(x => x.aetType == "Receipt")
                         join b in _context.ParamForWarnings.Where(x => x.isDeleted == false && x.aetType == "Receipt")
                         on a.catCode equals b.catCode
                         where a.maxDate <= b.toTime && a.minDate >= b.fromTime && a.total >= b.total
                         select new
                         {
                             id = b.id,
                             maxTotal = b.total,
                             fromDate = b.fromTime,
                             toDate = b.toTime,
                             aetType = b.aetType,
                             catCode = b.catCode,
                             currency = b.currency,
                             total = a.total,
                             catName = a.catName
                         }).ToList();
            int count = query.Count();
            return count;

        }

        [HttpPost]
        public int GetCountWarning()
        {
            var dataExpense = (from a in _context.FundAccEntrys.Where(x => x.IsDeleted == false && x.IsPlan == false && x.AetType == "Expense" && x.StatusObject == "FUND_APPROVED")
                               join b in _context.FundAccEntryTrackings.Where(x => x.IsDeleted == false )//&& x.Action == "FUND_APPROVED")
                               on a.AetCode equals b.AetCode
                               select new
                               {
                                   a.CatCode,
                                   a.AetType,
                                   a.AetCode,
                                   a.DeadLine,
                                   a.Payer,
                                   a.Receiptter,
                                   Total = (a.Currency == "VND" || a.Currency == "VNĐ") ? a.Total : (a.Total * ((1 / _context.FundExchagRates.FirstOrDefault(x => x.Currency == a.Currency).Rate) * _context.FundExchagRates.FirstOrDefault(x => x.Currency == "VND").Rate)),


                               }).ToList();
            var dataExpense1 = (from a in dataExpense
                                join b in _context.ParamForWarnings.Where(x => x.isDeleted == false && x.aetType == "Expense")
                          on a.CatCode equals b.catCode
                                where a.DeadLine >= b.fromTime && a.DeadLine <= b.toTime
                                group a by new { a.CatCode, a.AetType }
                        into list
                                orderby list.Key.CatCode
                                select new
                                {
                                    list,
                                    total = list.Sum(x => x.Total),
                                    catCode = list.Key.CatCode,
                                    aetType = list.Key.AetType,
                                    maxDate = list.Max(x => x.DeadLine),
                                    minDate = list.Min(x => x.DeadLine),

                                }).ToList();
            var queryExpense = (from a in dataExpense1.Where(x => x.aetType == "Expense")
                                join b in _context.ParamForWarnings.Where(x => x.isDeleted == false && x.aetType == "Expense")
                                on a.catCode equals b.catCode
                                where a.maxDate <= b.toTime && a.minDate >= b.fromTime && a.total >= b.total
                                select new
                                {
                                    id = b.id,
                                    maxTotal = b.total,
                                    fromDate = b.fromTime,
                                    toDate = b.toTime,
                                    aetType = b.aetType,
                                    catCode = b.catCode,
                                    currency = b.currency,
                                    total = a.total,
                                }).ToList();
            var dataReceipt = (from a in _context.FundAccEntrys.Where(x => x.IsDeleted == false && x.IsPlan == false && x.AetType == "Receipt")
                               join b in _context.FundAccEntryTrackings.Where(x => x.IsDeleted == false )//&& x.Action == "FUND_APPROVED")
                               on a.AetCode equals b.AetCode
                               select new
                               {
                                   a.CatCode,
                                   a.AetType,
                                   a.AetCode,
                                   a.DeadLine,
                                   a.Payer,
                                   a.Receiptter,
                                   Total = (a.Currency == "VND" || a.Currency == "VNĐ") ? a.Total : (a.Total * ((1 / _context.FundExchagRates.FirstOrDefault(x => x.Currency == a.Currency).Rate) * _context.FundExchagRates.FirstOrDefault(x => x.Currency == "VND").Rate)),


                               }).ToList();
            var dataReceipt1 = (from a in dataReceipt
                                join b in _context.ParamForWarnings.Where(x => x.isDeleted == false && x.aetType == "Receipt")
                         on a.CatCode equals b.catCode
                                where a.DeadLine >= b.fromTime && a.DeadLine <= b.toTime
                                group a by new { a.CatCode, a.AetType }
                        into list
                                orderby list.Key.CatCode
                                select new
                                {
                                    list,

                                    total = list.Sum(x => x.Total),
                                    catCode = list.Key.CatCode,
                                    aetType = list.Key.AetType,
                                    maxDate = list.Max(x => x.DeadLine),
                                    minDate = list.Min(x => x.DeadLine),

                                }).ToList();
            var queryReceipt = (from a in dataReceipt1.Where(x => x.aetType == "Receipt")
                                join b in _context.ParamForWarnings.Where(x => x.isDeleted == false && x.aetType == "Receipt")
                                on a.catCode equals b.catCode
                                where a.maxDate <= b.toTime && a.minDate >= b.fromTime && a.total >= b.total
                                select new
                                {
                                    id = b.id,
                                    maxTotal = b.total,
                                    fromDate = b.fromTime,
                                    toDate = b.toTime,
                                    aetType = b.aetType,
                                    catCode = b.catCode,
                                    currency = b.currency,
                                    total = a.total,

                                }).ToList();

            return queryReceipt.Count() + queryExpense.Count();


        }

        [HttpPost]
        public object JTableReceipt(JTableModelWarning jTablePara)
        {
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var data = (from a in _context.FundAccEntrys.Where(x => x.IsDeleted == false && x.IsPlan == false && x.AetType == "Receipt")
                        join b in _context.FundAccEntryTrackings.Where(x => x.IsDeleted == false )//&& x.Action == "FUND_APPROVED")
                        on a.AetCode equals b.AetCode
                        select new
                        {
                            a.CatCode,
                            a.AetType,
                            a.AetCode,
                            a.DeadLine,
                            a.Payer,
                            a.Receiptter,
                            a.Total,
                            a.Currency,
                        });
            var data1 = (from a in _context.FundCatReptExpss.Where(x => x.IsDeleted == false)
                         join b in data on a.CatCode equals b.CatCode
                         select new
                         {
                             CatName = a.CatName,
                             CatCode = b.CatCode,
                             AetType = b.AetType,
                             AetCode = b.AetCode,
                             DeadLine = b.DeadLine.Value,
                             Payer = b.Payer,
                             Receiptter = b.Receiptter,
                             Currency = b.Currency,
                             Total = (b.Currency == "VND" || b.Currency == "VNĐ") ? b.Total : (b.Total * ((1 / _context.FundExchagRates.FirstOrDefault(x => x.Currency == b.Currency).Rate) * _context.FundExchagRates.FirstOrDefault(x => x.Currency == "VND").Rate)),
                         }).DistinctBy(x => x.AetCode);
            var data2 = (from a in data1
                         join b in _context.ParamForWarnings.Where(x => x.isDeleted == false && x.aetType == "Receipt")
                         on a.CatCode equals b.catCode
                         where a.DeadLine >= b.fromTime && a.DeadLine <= b.toTime
                         group a by new { a.CatCode, a.AetType }
                        into list
                         orderby list.Key.CatCode
                         select new
                         {
                             list,
                             catName = list.Select(x => x.CatName).FirstOrDefault(),
                             total = list.Sum(x => x.Total),
                             catCode = list.Key.CatCode,
                             aetType = list.Key.AetType,
                             maxDate = list.Max(x => x.DeadLine),
                             minDate = list.Min(x => x.DeadLine),

                         }).ToList();
            var query = (from a in data2.Where(x => x.aetType == "Receipt")
                         join b in _context.ParamForWarnings.Where(x => x.isDeleted == false && x.aetType == "Receipt")
                         on a.catCode equals b.catCode
                         where a.maxDate <= b.toTime && a.minDate >= b.fromTime && a.total >= b.total
                         select new
                         {
                             id = b.id,
                             maxTotal = b.total,
                             fromDate = b.fromTime,
                             toDate = b.toTime,
                             aetType = b.aetType,
                             catCode = b.catCode,
                             currency = b.currency,
                             total = a.total,
                             catName = a.catName
                         }).ToList();
            int count = query.Count();
            //var data1 = query.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length);
            var jdata = JTableHelper.JObjectTable(query, jTablePara.Draw, count, "id", "maxTotal", "fromDate", "toDate", "currency", "aetType", "catCode", "total", "catName");
            return Json(jdata);

        }

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new Newtonsoft.Json.Linq.JObject();
            var a = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value });
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