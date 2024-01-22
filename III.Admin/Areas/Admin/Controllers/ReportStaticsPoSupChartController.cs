using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Identity;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using ESEIM;
using System;
using System.Globalization;
using ESEIM.Utils;
using System.Collections.Generic;
using System.Data;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]

    public class ReportStaticsPoSupChartController : BaseController
    {
        private readonly UserManager<AspNetUser> _userManager;
        private readonly RoleManager<AspNetRole> _roleManager;
        private readonly EIMDBContext _context;
        private readonly AppSettings _appSettings;
        private readonly IStringLocalizer<ReportStaticsPoSupChartController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IRepositoryService _repositoryService;

        public ReportStaticsPoSupChartController(IOptions<AppSettings> appSettings, EIMDBContext context, UserManager<AspNetUser> userManager, RoleManager<AspNetRole> roleManager, EIMDBContext swContext, IStringLocalizer<ReportStaticsPoSupChartController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources,
            IRepositoryService repositoryService)
        {
            _userManager = userManager;
            _context = context;
            _roleManager = roleManager;
            _appSettings = appSettings.Value;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
            _repositoryService = repositoryService;
        }
        [Breadcrumb("ViewData.CrumbPoSupChart", AreaName = "Admin", FromAction = "Index", FromController = typeof(ReportWareHouseHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuStore"] = _sharedResources["COM_CRUMB_MENU_STORE"];
            ViewData["CrumbRptWHHome"] = _sharedResources["COM_CRUMB_RPT_WARE_HOUSE"];
            ViewData["CrumbPoSupChart"] = _sharedResources["COM_CRUMB_PO_SUP_CHART"];
            return View();
        }
        //Lấy tổng mua hàng đặt hàng NCC
        [HttpGet]
        public JsonResult GetPoSupTotal(string fromDate, string toDate, string productCode)
        {
            var msg = new JMessage { Error = false, Title = "" };
            DateTime? sFromDate = !string.IsNullOrEmpty(fromDate) ? DateTime.ParseExact(fromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            DateTime? sToDate = !string.IsNullOrEmpty(toDate) ? DateTime.ParseExact(toDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            try
            {
                var query = (from a in _context.VReportStaticsPoSups
                             where (string.IsNullOrEmpty(productCode) || a.ProductCode.Equals(productCode))
                                && ((fromDate == null) || (a.CreatedTime.Value.Date >= sFromDate.Value.Date))
                                && ((toDate == null) || (a.CreatedTime.Value.Date <= sToDate.Value.Date))
                             select new
                             {
                                 a.ProductCode,
                                 a.ProductName,
                                 a.ProductType,
                                 Cost = a.Cost != null ? a.Cost : 0,
                                 a.Quantity,
                                 a.QuantityNeedImpExp,
                                 a.SupCode,
                                 a.SupName,
                                 Total = a.Cost != null ? a.Cost * a.Quantity : 0,
                                 sCreatedTime = a.CreatedTime,
                                 CreatedTime = a.CreatedTime != null ? a.CreatedTime.Value.ToString("dd/MM/yyyy") : null,
                             }).ToList();

                if (!string.IsNullOrEmpty(productCode))
                {
                    var queryRs = query.OrderBy(x => x.sCreatedTime).GroupBy(x => new { x.ProductCode, x.CreatedTime }).Select(p => new
                    {
                        p.First().ProductCode,
                        p.First().ProductName,
                        p.First().ProductType,
                        Cost = p.Sum(k => k.Cost),
                        Quantity = p.Sum(k => k.Quantity),
                        Total = p.Sum(k => k.Total),
                        p.First().SupCode,
                        p.First().SupName,
                        p.First().CreatedTime,
                    });

                    return Json(queryRs);
                }
                else
                {
                    var queryRs = query.OrderBy(x => x.sCreatedTime).GroupBy(x => new { x.CreatedTime }).Select(p => new
                    {
                        Cost = p.Sum(k => k.Cost),
                        Quantity = p.Sum(k => k.Quantity),
                        Total = p.Sum(k => k.Total),
                        p.First().CreatedTime,
                    });

                    return Json(queryRs);
                }
            }
            catch (Exception ex)
            {
                throw ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
        }

        //Lấy tổng mua hàng đặt hàng NCC
        [HttpGet]
        public JsonResult GetPoSupPayment(string fromDate, string toDate, string supCode)
        {
            var msg = new JMessage { Error = false, Title = "" };
            DateTime? sFromDate = !string.IsNullOrEmpty(fromDate) ? DateTime.ParseExact(fromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            DateTime? sToDate = !string.IsNullOrEmpty(toDate) ? DateTime.ParseExact(toDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            try
            {
                var query = (from a in _context.PoBuyerHeaderPayments.Where(x => !x.IsDeleted && ((fromDate == null) || (x.CreatedTime.HasValue && x.CreatedTime.Value.Date >= sFromDate.Value.Date)) &&
                              ((toDate == null) || (x.CreatedTime.HasValue && x.CreatedTime.Value.Date <= sToDate.Value.Date)))
                             join b in _context.Customerss.Where(x => !x.IsDeleted) on a.BuyerCode equals b.CusCode
                             join c in _context.Suppliers.Where(x => !x.IsDeleted) on a.SupCode equals c.SupCode
                             join d in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Status equals d.CodeSet into d1
                             from d2 in d1.DefaultIfEmpty()
                             where (string.IsNullOrEmpty(supCode) || c.SupCode.Equals(supCode))
                             select new
                             {
                                 a.Id,
                                 a.PoSupCode,
                                 a.SupCode,
                                 c.SupName,
                                 a.CreatedTime,
                                 TotalAmount = a.TotalAmount != null ? a.TotalAmount : 0,
                                 TotalPayment = a.TotalPayment != null ? a.TotalPayment : 0,
                             }).ToList();

                return Json(query);
            }
            catch (Exception ex)
            {
                throw ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
        }

        //Lấy tổng doanh số
        [HttpGet]
        public JsonResult GetPoCusTotal(string fromDate, string toDate, string productCode, string productType)
        {
            var msg = new JMessage { Error = false, Title = "" };
            DateTime? sFromDate = !string.IsNullOrEmpty(fromDate) ? DateTime.ParseExact(fromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            DateTime? sToDate = !string.IsNullOrEmpty(toDate) ? DateTime.ParseExact(toDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            try
            {
                var query = new List<ReportStaticsPoCusGrid>();

                string[] param = new string[] { "@fromDate", "@toDate", "@contractCode", "@cusCode", "@productCode", "@productType", "@startRecord", "@endRecord" };
                object[] val = new object[] { sFromDate, sToDate, null, null, productCode, productType, 1, 100 };
                DataTable rs = _repositoryService.GetDataTableProcedureSql("P_TRADE_REVENUE_PO_CUS_DETAIL_JOIN_PAGING_4_ADMIN", param, val);
                query = CommonUtil.ConvertDataTable<ReportStaticsPoCusGrid>(rs);

                var queryRs = query.OrderBy(x => x.EffectiveDate).GroupBy(x => x.EffectiveDate).Select(p => new
                {
                    p.First().EffectiveDate,
                    RevenueAfterTaxVnd = p.Sum(k => k.RevenueAfterTaxVnd)
                });

                return Json(queryRs);
            }
            catch (Exception ex)
            {
                throw ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
        }

        //Lấy tổng hợp đồng/đơn hàng
        [HttpGet]
        public JsonResult GetPoCusPayment(string fromDate, string toDate, string cusCode)
        {
            var msg = new JMessage { Error = false, Title = "" };
            DateTime? sFromDate = !string.IsNullOrEmpty(fromDate) ? DateTime.ParseExact(fromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            DateTime? sToDate = !string.IsNullOrEmpty(toDate) ? DateTime.ParseExact(toDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            try
            {
                var query = new List<ReportStaticsPoCusPaymentGrid>();

                string[] param = new string[] { "@fromDate", "@toDate", "@contractCode", "@cusCode", "@startRecord", "@endRecord" };
                object[] val = new object[] { sFromDate, sToDate, null, cusCode, 1, 100 };
                DataTable rs = _repositoryService.GetDataTableProcedureSql("P_TRADE_REVENUE_PO_CUS_PAYMENT_JOIN_PAGING_4_ADMIN", param, val);
                query = CommonUtil.ConvertDataTable<ReportStaticsPoCusPaymentGrid>(rs);

                var queryRs = query.OrderBy(x => x.EffectiveDate).GroupBy(x => new { x.ContractCode }).Select(p => new
                {
                    p.First().EffectiveDate,
                    p.First().ContractCode,
                    TotalAmount = p.Sum(k => k.RevenueAfterTaxVnd),
                    TotalPayment = p.Sum(k => k.PaymentVnd),
                    TotalNotPayment = p.Sum(k => k.DebtVnd),
                });

                return Json(queryRs);
            }
            catch (Exception ex)
            {
                throw ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
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