using System;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Microsoft.Extensions.Localization;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{

    [Area("Admin")]
    public class ReportStaticsPoSupPaymentController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private static AsyncLocker<string> userLock = new AsyncLocker<string>();

        private readonly IStringLocalizer<ReportStaticsPoSupPaymentController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public ReportStaticsPoSupPaymentController(EIMDBContext context, IStringLocalizer<ReportStaticsPoSupPaymentController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }
        [Breadcrumb("ViewData.CrumbPoSupPayment", AreaName = "Admin", FromAction = "Index", FromController = typeof(ReportWareHouseHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuStore"] = _sharedResources["COM_CRUMB_MENU_STORE"];
            ViewData["CrumbRptWHHome"] = _sharedResources["COM_CRUMB_RPT_WARE_HOUSE"];
            ViewData["CrumbPoSupPayment"] = _sharedResources["COM_CRUMB_PO_SUP_PAYMENT"];
            return View();
        }

        #region ComboboxValue
        [HttpPost]
        public JsonResult GetListCommon()
        {
            var list = _context.CommonSettings.OrderBy(x => x.SettingID).Where(x => x.IsDeleted == false).Select(x => new { Code = x.CodeSet, Name = x.ValueSet, x.Group, Icon = x.Logo }).AsNoTracking();
            return Json(list);
        }
        #endregion

        #region Report Statics Po Sup Payment
        public class JTableModelContract : JTableModel
        {
            public string Key { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string ContractCode { get; set; }
            public string PoSupCode { get; set; }
            public string SupCode { get; set; }
            public string Status { get; set; }
            public string BudgetF { get; set; }
            public string BudgetT { get; set; }
            public string Signer { get; set; }
            public string Currency { get; set; }
        }

        [HttpPost]
        public object JTable([FromBody]JTableModelContract jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            DateTime? fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            DateTime? toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            string poSupCode = jTablePara.PoSupCode;
            string supCode = jTablePara.SupCode;
            string status = jTablePara.Status;

            var query = from a in _context.PoBuyerHeaderPayments.Where(x => !x.IsDeleted && ((fromDate == null) || (x.CreatedTime.HasValue && x.CreatedTime.Value.Date >= fromDate.Value.Date)) &&
                              ((toDate == null) || (x.CreatedTime.HasValue && x.CreatedTime.Value.Date <= toDate.Value.Date)) &&
                              (string.IsNullOrEmpty(jTablePara.PoSupCode) || x.PoSupCode.Equals(poSupCode)) &&
                              (string.IsNullOrEmpty(jTablePara.SupCode) || x.SupCode.Equals(supCode)) &&
                              (string.IsNullOrEmpty(jTablePara.Status) || x.Status.Equals(status)))
                        join b in _context.Customerss.Where(x => !x.IsDeleted) on a.BuyerCode equals b.CusCode
                        join c in _context.Suppliers.Where(x => !x.IsDeleted) on a.SupCode equals c.SupCode
                        join d in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Status equals d.CodeSet into d1
                        from d2 in d1.DefaultIfEmpty()
                        select new
                        {
                            a.Id,
                            a.PoSupCode,
                            a.PoTitle,
                            a.OrderBy,
                            a.Consigner,
                            a.Mobile,
                            a.Buyer,
                            //a.BuyerCode,
                            BuyerCode = a.BuyerCode + " - " + b.CusName,
                            a.SupCode,
                            c.SupName,
                            a.CreatedBy,
                            a.CreatedTime,
                            Status = d2.ValueSet,
                            Icon = d2.Logo,
                            a.Type,
                            a.TotalAmount,
                            a.TotalPayment,
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "PoSupCode", "PoTitle", "OrderBy", "Consigner", "Mobile", "BuyerCode", "SupCode", "SupName", "CreatedTime", "Status", "Icon", "Type", "TotalAmount", "TotalPayment");
            return Json(jdata);
        }

        [HttpPost]
        public object GetTotal([FromBody]JTableModelContract jTablePara)
        {
            try
            {
                DateTime? fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                DateTime? toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                string poSupCode = jTablePara.PoSupCode;
                string supCode = jTablePara.SupCode;
                string status = jTablePara.Status;

                var query = (from a in _context.PoBuyerHeaderPayments.Where(x => !x.IsDeleted && ((fromDate == null) || (x.CreatedTime.HasValue && x.CreatedTime.Value.Date >= fromDate.Value.Date)) &&
                                  ((toDate == null) || (x.CreatedTime.HasValue && x.CreatedTime.Value.Date <= toDate.Value.Date)) &&
                                  (string.IsNullOrEmpty(jTablePara.PoSupCode) || x.PoSupCode.Equals(poSupCode)) &&
                                  (string.IsNullOrEmpty(jTablePara.SupCode) || x.SupCode.Equals(supCode)) &&
                                  (string.IsNullOrEmpty(jTablePara.Status) || x.Status.Equals(status)))
                             join b in _context.Customerss.Where(x => !x.IsDeleted) on a.BuyerCode equals b.CusCode
                             join c in _context.Suppliers.Where(x => !x.IsDeleted) on a.SupCode equals c.SupCode
                             join d in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Status equals d.CodeSet into d1
                             from d2 in d1.DefaultIfEmpty()
                             select new
                             {
                                 a.Id,
                                 a.PoSupCode,
                                 a.PoTitle,
                                 a.OrderBy,
                                 a.Consigner,
                                 a.Mobile,
                                 a.Buyer,
                                 //a.BuyerCode,
                                 BuyerCode = a.BuyerCode + " - " + b.CusName,
                                 a.SupCode,
                                 c.SupName,
                                 a.CreatedBy,
                                 a.CreatedTime,
                                 Status = d2.ValueSet,
                                 Icon = d2.Logo,
                                 a.Type,
                                 a.TotalAmount,
                                 a.TotalPayment,
                             }).ToList();

                var total = new
                {
                    TotalAmount = query.Sum(x => x.TotalAmount),
                    TotalPayment = query.Sum(x => x.TotalPayment),
                    TotalNotPayment = query.Sum(x => x.TotalAmount) - query.Sum(x => x.TotalPayment)
                };

                return Json(total);
            }
            catch (Exception ex)
            {

                throw;
            }

        }

        [HttpPost]
        public object JtreeSigner()
        {
            var data = _context.PoSaleHeaders.DistinctBy(a => a.Signer).Select(x => x.Signer).ToList();
            return data;
        }

        [HttpPost]
        public object GetCustomers()
        {
            var data = from a in _context.Customerss.Where(x => x.IsDeleted == false)
                       select new
                       {
                           Id = a.CusID,
                           Code = a.CusCode,
                           Name = a.CusName,
                           Address = a.Address,
                           ZipCode = a.ZipCode,
                           MobilePhone = a.MobilePhone,
                           PersonInCharge = a.PersonInCharge,
                           Email = a.Email
                       };
            return Json(data.ToList());
        }
        [HttpPost]
        public object GetSuppliers()
        {
            var data = from a in _context.Suppliers.Where(x => x.IsDeleted == false)
                           //join b in _context.SupplierExtends.Where(x=>x.isdeleted==false&&(x.ext_code.ToLower()=="zip_code"|| x.ext_code.ToLower() == "person_in_charge")) on a.SupID equals b.supplier_code 
                       select new
                       {
                           Id = a.SupID,
                           Code = a.SupCode,
                           Name = a.SupName,
                           Group = a.SupGroup,
                           Address = a.Address,
                           MobilePhone = a.Mobile,
                           Email = a.Email,
                           ListExtend = _context.SupplierExtends.Where(x => x.isdeleted == false && (x.ext_code.ToLower() == "zip_code" || x.ext_code.ToLower() == "person_in_charge") && x.supplier_code == a.SupID).ToList()
                       };

            return Json(data.ToList());
        }
        #endregion

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion
    }
}