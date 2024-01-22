using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using ESEIM;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class FundReportController : BaseController
    {
        private readonly RoleManager<AspNetRole> _roleManager;
        private readonly AppSettings _appSettings;
        private readonly EIMDBContext _context;
        private readonly IStringLocalizer<FundReportController> _stringLocalizer;
        private readonly IStringLocalizer<FundCurrencyController> _fundCurrencyStringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;

        public FundReportController(IOptions<AppSettings> appSettings, EIMDBContext context, UserManager<AspNetUser> userManager, RoleManager<AspNetRole> roleManager, IHostingEnvironment hostingEnvironment, IStringLocalizer<FundReportController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources, IStringLocalizer<FundCurrencyController> fundCurrencyStringLocalizer)
        {
            _roleManager = roleManager;
            _appSettings = appSettings.Value;
            _context = context;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
            _fundCurrencyStringLocalizer = fundCurrencyStringLocalizer;
        }
        [Breadcrumb("ViewData.CrumbFundReport", AreaName = "Admin", FromAction = "Index", FromController = typeof(WarringFundsHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuFinance"] = _sharedResources["COM_CRUMB_MENU_FINANCE"];
            ViewData["CrumbWarningFundHome"] = _sharedResources["COM_CRUMB_WARNING_FUND_HOME"];
            ViewData["CrumbFundReport"] = _sharedResources["COM_CRUMB_FUND_REPORT"];
            return View();
        }

        public class SearchChartModel
        {
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string AetType { get; set; }
            public string CatParent { get; set; }
            public string CatCodeExpense { get; set; }
            public string CatCodeReceipte { get; set; }
        }

        public class SearchChartResponse
        {
            public decimal Total { get; set; }
            public string Date { get; set; }

        }

        [HttpPost]
        public (object totalReceipt, object totalExpense, object totalReceiptPlan, object totalExpensePlan) SearchChart([FromBody]SearchChartModel obj)
        {
            var data = GetTreeData(obj);
            List<SearchChartResponse> totalReceipt = new List<SearchChartResponse>();
            List<SearchChartResponse> totalExpense = new List<SearchChartResponse>();
            List<SearchChartResponse> totalReceiptPlan = new List<SearchChartResponse>();
            List<SearchChartResponse> totalExpensePlan = new List<SearchChartResponse>();
            try
            {
                DateTime? fromDate = !string.IsNullOrEmpty(obj.FromDate) ? DateTime.ParseExact(obj.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                DateTime? toDate = !string.IsNullOrEmpty(obj.ToDate) ? DateTime.ParseExact(obj.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                if (string.IsNullOrEmpty(obj.CatCodeExpense))
                {
                    totalExpense = (from a in _context.FundAccEntrys.Where(x => x.IsDeleted == false && x.IsPlan == false /*&& x.IsCompleted == true*/)
                                    join b in data on a.CatCode equals b.CatCode
                                    let date = a.DeadLine.Value.Date
                                    where (fromDate == null || (a.DeadLine.Value.Date >= fromDate.Value.Date))
                                    && (toDate == null || (a.DeadLine.Value.Date <= toDate.Value.Date))
                                    && ((string.IsNullOrEmpty(obj.AetType) && a.AetType.Equals("Expense")) || (!string.IsNullOrEmpty(a.AetType) && a.AetType.Equals("Expense") && a.AetType == obj.AetType))
                                    //&& (string.IsNullOrEmpty(obj.CatParent) || (!string.IsNullOrEmpty(b.CatParent) && b.CatParent == obj.CatParent))
                                    group new { a } by new { date }
                                    into grp
                                    orderby grp.Key.date
                                    select new SearchChartResponse
                                    {
                                        Total = Math.Round(grp.Sum(x => x.a.Total * (1 / (_context.FundExchagRates.FirstOrDefault(z => z.IsDeleted == false && z.Currency.Equals(x.a.Currency)).Rate)) * (_context.FundExchagRates.FirstOrDefault(z => z.IsDeleted == false && z.Currency.Equals("VND")).Rate)), 2),
                                        Date = grp.Key.date.ToString("dd/MM/yyyy"),
                                    })
                                    .ToList();
                    totalExpensePlan = (from a in _context.FundAccEntrys.Where(x => x.IsDeleted == false && x.IsPlan == false)
                                        join b in data on a.CatCode equals b.CatCode
                                        let date = a.DeadLine.Value.Date
                                        where (fromDate == null || (a.DeadLine.Value.Date >= fromDate.Value.Date))
                                        && (toDate == null || (a.DeadLine.Value.Date <= toDate.Value.Date))
                                        && ((string.IsNullOrEmpty(obj.AetType) && a.AetType.Equals("Expense")) || (!string.IsNullOrEmpty(a.AetType) && a.AetType.Equals("Expense") && a.AetType == obj.AetType))
                                        //&& (string.IsNullOrEmpty(obj.CatParent) || (!string.IsNullOrEmpty(b.CatParent) && b.CatParent == obj.CatParent))
                                        group new { a } by new { date }
                                    into grp
                                        orderby grp.Key.date
                                        select new SearchChartResponse
                                        {
                                            Total = Math.Round(grp.Sum(x => x.a.Total * (1 / (_context.FundExchagRates.FirstOrDefault(z => z.IsDeleted == false && z.Currency.Equals(x.a.Currency)).Rate)) * (_context.FundExchagRates.FirstOrDefault(z => z.IsDeleted == false && z.Currency.Equals("VND")).Rate)), 2),
                                            Date = grp.Key.date.ToString("dd/MM/yyyy"),
                                        })
                                    .ToList();
                }
                else
                {
                    var dataExpense = GetTreeDataExpense(obj);
                    totalExpense = (from a in _context.FundAccEntrys.Where(x => x.IsDeleted == false && x.IsPlan == false && x.IsCompleted == true)
                                        //join b in _context.FundCatReptExpss.Where(x => x.IsDeleted == false) on a.CatCode equals b.CatCode
                                    join b in dataExpense on a.CatCode equals b.CatCode
                                    let date = a.DeadLine.Value.Date
                                    where (fromDate == null || (a.DeadLine.Value.Date >= fromDate.Value.Date))
                                    && (toDate == null || (a.DeadLine.Value.Date <= toDate.Value.Date))
                                    && ((string.IsNullOrEmpty(obj.AetType) && a.AetType == "Expense") || (!string.IsNullOrEmpty(a.AetType) && a.AetType == "Expense" && a.AetType == obj.AetType))
                                    //&& (!string.IsNullOrEmpty(a.CatCode) && a.CatCode == obj.CatCodeExpense)
                                    group new { a } by new { date }
                                     into grp
                                    orderby grp.Key.date
                                    select new SearchChartResponse
                                    {
                                        Total = Math.Round(grp.Sum(x => x.a.Total * (1 / (_context.FundExchagRates.FirstOrDefault(z => z.IsDeleted == false && z.Currency.Equals(x.a.Currency)).Rate)) * (_context.FundExchagRates.FirstOrDefault(z => z.IsDeleted == false && z.Currency.Equals("VND")).Rate)), 2),
                                        Date = grp.Key.date.ToString("dd/MM/yyyy"),
                                    })
                                .ToList();
                    totalExpensePlan = (from a in _context.FundAccEntrys.Where(x => x.IsDeleted == false && x.IsPlan == false)
                                            //join b in _context.FundCatReptExpss.Where(x => x.IsDeleted == false) on a.CatCode equals b.CatCode
                                        join b in dataExpense on a.CatCode equals b.CatCode
                                        let date = a.DeadLine.Value.Date
                                        where (fromDate == null || (a.DeadLine.Value.Date >= fromDate.Value.Date))
                                        && (toDate == null || (a.DeadLine.Value.Date <= toDate.Value.Date))
                                        && ((string.IsNullOrEmpty(obj.AetType) && a.AetType == "Expense") || (!string.IsNullOrEmpty(a.AetType) && a.AetType == "Expense" && a.AetType == obj.AetType))
                                        //&& (!string.IsNullOrEmpty(a.CatCode) && a.CatCode == obj.CatCodeExpense)
                                        group new { a } by new { date }
                                     into grp
                                        orderby grp.Key.date
                                        select new SearchChartResponse
                                        {
                                            Total = Math.Round(grp.Sum(x => x.a.Total * (1 / (_context.FundExchagRates.FirstOrDefault(z => z.IsDeleted == false && z.Currency.Equals(x.a.Currency)).Rate)) * (_context.FundExchagRates.FirstOrDefault(z => z.IsDeleted == false && z.Currency.Equals("VND")).Rate)), 2),
                                            Date = grp.Key.date.ToString("dd/MM/yyyy"),
                                        })
                                .ToList();
                }
                if (string.IsNullOrEmpty(obj.CatCodeReceipte))
                {
                    totalReceipt = (from a in _context.FundAccEntrys.Where(x => x.IsDeleted == false && x.IsPlan == false && x.IsCompleted == true)
                                    join b in data on a.CatCode equals b.CatCode
                                    let date = a.DeadLine.Value.Date
                                    where (fromDate == null || (a.DeadLine.Value.Date >= fromDate.Value.Date))
                                    && (toDate == null || (a.DeadLine.Value.Date <= toDate.Value.Date))
                                    && ((string.IsNullOrEmpty(obj.AetType) && a.AetType == "Receipt") || (!string.IsNullOrEmpty(a.AetType) && a.AetType == "Receipt" && a.AetType == obj.AetType))
                                    //&& (string.IsNullOrEmpty(obj.CatParent) || (!string.IsNullOrEmpty(b.CatParent) && b.CatParent == obj.CatParent))
                                    group new { a } by new { date }
                                into grp
                                    orderby grp.Key.date
                                    select new SearchChartResponse
                                    {
                                        Total = Math.Round(grp.Sum(x => x.a.Total * (1 / (_context.FundExchagRates.FirstOrDefault(z => z.IsDeleted == false && z.Currency.Equals(x.a.Currency)).Rate)) * (_context.FundExchagRates.FirstOrDefault(z => z.IsDeleted == false && z.Currency.Equals("VND")).Rate)), 2),
                                        Date = grp.Key.date.ToString("dd/MM/yyyy"),
                                    })
                                .ToList();
                    totalReceiptPlan = (from a in _context.FundAccEntrys.Where(x => x.IsDeleted == false && x.IsPlan == false)
                                        join b in data on a.CatCode equals b.CatCode
                                        let date = a.DeadLine.Value.Date
                                        where (fromDate == null || (a.DeadLine.Value.Date >= fromDate.Value.Date))
                                        && (toDate == null || (a.DeadLine.Value.Date <= toDate.Value.Date))
                                        && ((string.IsNullOrEmpty(obj.AetType) && a.AetType == "Receipt") || (!string.IsNullOrEmpty(a.AetType) && a.AetType == "Receipt" && a.AetType == obj.AetType))
                                        //&& (string.IsNullOrEmpty(obj.CatParent) || (!string.IsNullOrEmpty(b.CatParent) && b.CatParent == obj.CatParent))
                                        group new { a } by new { date }
                                into grp
                                        orderby grp.Key.date
                                        select new SearchChartResponse
                                        {
                                            Total = Math.Round(grp.Sum(x => x.a.Total * (1 / (_context.FundExchagRates.FirstOrDefault(z => z.IsDeleted == false && z.Currency.Equals(x.a.Currency)).Rate)) * (_context.FundExchagRates.FirstOrDefault(z => z.IsDeleted == false && z.Currency.Equals("VND")).Rate)), 2),
                                            Date = grp.Key.date.ToString("dd/MM/yyyy"),
                                        })
                                .ToList();
                }
                else
                {
                    var dataReceipt = GetTreeDataReceipte(obj);

                    totalReceipt = (from a in _context.FundAccEntrys.Where(x => x.IsDeleted == false && x.IsPlan == false && x.IsCompleted == true)
                                        //join b in _context.FundCatReptExpss.Where(x => x.IsDeleted == false) on a.CatCode equals b.CatCode
                                    join b in dataReceipt on a.CatCode equals b.CatCode
                                    let date = a.DeadLine.Value.Date
                                    where (fromDate == null || (a.DeadLine.Value.Date >= fromDate.Value.Date))
                                    && (toDate == null || (a.DeadLine.Value.Date <= toDate.Value.Date))
                                    && ((string.IsNullOrEmpty(obj.AetType) && a.AetType == "Receipt") || (!string.IsNullOrEmpty(a.AetType) && a.AetType == "Receipt" && a.AetType == obj.AetType))
                                    //&& (string.IsNullOrEmpty(obj.CatParent) || (!string.IsNullOrEmpty(a.CatCode) && a.CatCode == obj.CatCodeReceipte))
                                    group new { a } by new { date }
                                    into grp
                                    orderby grp.Key.date
                                    select new SearchChartResponse
                                    {
                                        Total = Math.Round(grp.Sum(x => x.a.Total * (1 / (_context.FundExchagRates.FirstOrDefault(z => z.IsDeleted == false && z.Currency.Equals(x.a.Currency)).Rate)) * (_context.FundExchagRates.FirstOrDefault(z => z.IsDeleted == false && z.Currency.Equals("VND")).Rate)), 2),
                                        Date = grp.Key.date.ToString("dd/MM/yyyy"),
                                    })
                                    .ToList();
                    totalReceiptPlan = (from a in _context.FundAccEntrys.Where(x => x.IsDeleted == false && x.IsPlan == false)
                                            //join b in _context.FundCatReptExpss.Where(x => x.IsDeleted == false) on a.CatCode equals b.CatCode
                                        join b in dataReceipt on a.CatCode equals b.CatCode
                                        let date = a.DeadLine.Value.Date
                                        where (fromDate == null || (a.DeadLine.Value.Date >= fromDate.Value.Date))
                                        && (toDate == null || (a.DeadLine.Value.Date <= toDate.Value.Date))
                                        && ((string.IsNullOrEmpty(obj.AetType) && a.AetType == "Receipt") || (!string.IsNullOrEmpty(a.AetType) && a.AetType == "Receipt" && a.AetType == obj.AetType))
                                        //&& (string.IsNullOrEmpty(obj.CatParent) || (!string.IsNullOrEmpty(a.CatCode) && a.CatCode == obj.CatCodeReceipte))
                                        group new { a } by new { date }
                                   into grp
                                        orderby grp.Key.date
                                        select new SearchChartResponse
                                        {
                                            Total = Math.Round(grp.Sum(x => x.a.Total * (1 / (_context.FundExchagRates.FirstOrDefault(z => z.IsDeleted == false && z.Currency.Equals(x.a.Currency)).Rate)) * (_context.FundExchagRates.FirstOrDefault(z => z.IsDeleted == false && z.Currency.Equals("VND")).Rate)), 2),
                                            Date = grp.Key.date.ToString("dd/MM/yyyy"),
                                        })
                                   .ToList();
                }
            }
            catch (Exception ex)
            {

            }
            return (totalReceipt, totalExpense, totalReceiptPlan, totalExpensePlan);
        }

        [HttpPost]
        public object GetCatParent()
        {
            var data = _context.FundCatReptExpss.Where(x => x.CatParent != null && x.IsDeleted == false).Select(x => new { x.CatParent }).DistinctBy(x => x.CatParent).ToList();
            var query = (from a in _context.FundCatReptExpss
                         join b in data on a.CatCode equals b.CatParent
                         select new
                         {
                             CatName = a.CatName,
                             CatCode = a.CatCode,
                         }).ToList();
            return query;
        }

        [HttpPost]
        public object GetCatChildrentExpense(string obj)
        {

            //var data = _context.FundCatReptExpss.Where(x => x.CatParent == obj && x.IsDeleted == false).Select(x => new { CatNameExpense = x.CatName, CatCodeExpense = x.CatCode }).ToList();
            var data = _context.FundCatReptExpss.OrderBy(x => x.CatName).AsNoTracking();
            var dataOrder = GetSubTreeData1(data.ToList(), obj, new List<TreeView>(), 0);
            return dataOrder;

        }

        [HttpPost]
        public object GetCatChildrentReceipte(string obj)
        {

            //var data = _context.FundCatReptExpss.Where(x => x.CatParent == obj && x.IsDeleted == false).Select(x => new { CatNameReceipte = x.CatName, CatCodeReceipte = x.CatCode }).ToList();
            var data = _context.FundCatReptExpss.OrderBy(x => x.CatName).AsNoTracking();
            var dataOrder = GetSubTreeData1(data.ToList(), obj, new List<TreeView>(), 0);
            return dataOrder;

        }

        public List<Tree> GetTreeData(SearchChartModel obj)
        {

            if (!string.IsNullOrEmpty(obj.CatParent))
            {
                var data = _context.FundCatReptExpss.OrderBy(x => x.CatName).AsNoTracking();
                var dataOrder = GetSubTreeData(data.ToList(), obj.CatParent, new List<Tree>(), 0);
                return dataOrder;
            }
            else
            {
                var data = _context.FundCatReptExpss.OrderBy(x => x.CatName).AsNoTracking();
                var dataOrder = GetSubTreeData(data.ToList(), null, new List<Tree>(), 0);
                var dataOrder1 = GetSubTreeData(data.ToList(), "", new List<Tree>(), 0);
                return dataOrder.Union(dataOrder1).ToList();
            }



        }

        public List<Tree> GetTreeDataReceipte(SearchChartModel obj)
        {

            if (!string.IsNullOrEmpty(obj.CatParent))
            {
                var data = _context.FundCatReptExpss.OrderBy(x => x.CatName).AsNoTracking();
                var dataOrder = GetSubTreeData(data.ToList(), obj.CatCodeReceipte, new List<Tree>(), 0);
                return dataOrder;
            }
            else
            {
                var data = _context.FundCatReptExpss.OrderBy(x => x.CatName).AsNoTracking();
                var dataOrder = GetSubTreeData(data.ToList(), "CAT_FUND", new List<Tree>(), 0);
                return dataOrder;
            }



        }

        public List<Tree> GetTreeDataExpense(SearchChartModel obj)
        {

            if (!string.IsNullOrEmpty(obj.CatParent))
            {
                var data = _context.FundCatReptExpss.OrderBy(x => x.CatName).AsNoTracking();
                var dataOrder = GetSubTreeData(data.ToList(), obj.CatCodeExpense, new List<Tree>(), 0);
                return dataOrder;
            }
            else
            {
                var data = _context.FundCatReptExpss.OrderBy(x => x.CatName).AsNoTracking();
                var dataOrder = GetSubTreeData(data.ToList(), "CAT_FUND", new List<Tree>(), 0);
                return dataOrder;
            }



        }

        private List<Tree> GetSubTreeData(List<FundCatReptExps> data, string catParent, List<Tree> lstCategories, int tab)
        {
            //tab += "- ";
            if (data.Any(x => x.CatParent == catParent))
            {
                var contents = data.Where(x => x.CatParent == catParent && x.IsDeleted == false).OrderBy(x => x.CatName).ToList();
                foreach (var item in contents)
                {
                    var category = new Tree
                    {
                        Id = item.Id,
                        Code = item.CatCode,
                        Title = item.CatName,
                        Level = tab,
                        HasChild = _context.FundCatReptExpss.Where(x => x.IsDeleted == false).Any(x => x.CatParent == item.CatCode),
                        CatCode = item.CatCode,
                        CatParent = item.CatParent,
                        CatName = item.CatName,
                        CatType = item.CatType,


                    };
                    if (!category.HasChild)
                    {
                        lstCategories.Add(category);
                    };
                    if (category.HasChild) { GetSubTreeData(data, item.CatCode, lstCategories, tab + 1); }
                }
            }
            else
            {
                var query = data.FirstOrDefault(x => x.CatCode == catParent && x.IsDeleted == false);
                if (query != null)
                {
                    var category = new Tree
                    {
                        Id = query.Id,
                        Code = query.CatCode,
                        Title = query.CatName,
                        Level = tab,
                        HasChild = false,
                        CatCode = query.CatCode,
                        CatParent = query.CatParent,
                        CatName = query.CatName,
                        CatType = query.CatType,

                    };
                    lstCategories.Add(category);
                }
            }

            return lstCategories;
        }

        public List<TreeView> GetTreeData1()
        {
            var data = _context.FundCatReptExpss.OrderBy(x => x.CatName).AsNoTracking();
            var dataOrder = GetSubTreeData1(data.ToList(), null, new List<TreeView>(), 0);
            return dataOrder;
        }

        private List<TreeView> GetSubTreeData1(List<FundCatReptExps> data, string catParent, List<TreeView> lstCategories, int tab)
        {
            //tab += "- ";
            var contents = (catParent == null)
                ? data.Where(x => string.IsNullOrEmpty(x.CatParent) && x.IsDeleted == false).OrderBy(x => x.CatName).ToList()
                : data.Where(x => x.CatParent == catParent && x.IsDeleted == false).OrderBy(x => x.CatName).ToList();
            foreach (var item in contents)
            {
                var category = new TreeView
                {
                    Id = item.Id,
                    Code = item.CatCode,
                    Title = item.CatName,
                    Level = tab,
                    HasChild = data.Any(x => x.CatParent == item.CatCode)
                };
                lstCategories.Add(category);
                if (category.HasChild) GetSubTreeData1(data, item.CatCode, lstCategories, tab + 1);
            }
            return lstCategories;
        }

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new Newtonsoft.Json.Linq.JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_fundCurrencyStringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion

        public class Tree
        {
            public int Id { get; set; }
            public string Code { get; set; }
            public string Title { get; set; }
            public int? ParentId { get; set; }
            public int? Order { get; set; }
            public bool HasChild { get; set; }
            public int Level { get; set; }
            public string CatCode { get; set; }

            public string CatName { get; set; }


            public string CatParent { get; set; }

            public string CatType { get; set; }

            public string Note { get; set; }

            public bool IsDeleted { get; set; }

        }
    }
}