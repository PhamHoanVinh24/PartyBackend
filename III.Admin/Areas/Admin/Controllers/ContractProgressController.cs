using System;
using System.Globalization;
using System.Linq;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class ContractProgressController : Controller
    {
        private readonly EIMDBContext _context;
        private readonly IStringLocalizer<ContractProgressController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IStringLocalizer<CardJobController> _sharedResourcesCardJob;
        public ContractProgressController(EIMDBContext context, IStringLocalizer<ContractProgressController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources, IStringLocalizer<CardJobController> sharedResourcesCardJob)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
            _sharedResourcesCardJob = sharedResourcesCardJob;
        }
        [Breadcrumb("ViewData.CrumbContractProgress", AreaName = "Admin", FromAction = "Index", FromController = typeof(ContractHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbContractHome"] = _sharedResources["COM_CRUMB_CONTRACT_HOME"];
            ViewData["CrumbContractProgress"] = _sharedResources["COM_CRUMB_PROGRESS"];
            return View();
        }

        [HttpPost]
        public object GetListContract()
        {
            var list = _context.PoSaleHeaders.Where(x => x.IsDeleted == false).Select(x => new { Code = x.ContractCode, Name = x.Title }).AsNoTracking().ToList();
            return list;
        }

        [HttpPost]
        public JsonResult SearchContract([FromBody]JTableModelContract searchModel)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var fromDate = !string.IsNullOrEmpty(searchModel.FromDate) ? DateTime.ParseExact(searchModel.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var toDate = !string.IsNullOrEmpty(searchModel.ToDate) ? DateTime.ParseExact(searchModel.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var query = from a in _context.PoSaleHeaders
                            join d in _context.Customerss.Where(x => !x.IsDeleted) on a.CusCode equals d.CusCode
                            join b in _context.CommonSettings on a.Status equals b.CodeSet into b1
                            from b2 in b1.DefaultIfEmpty()
                            join c in _context.CommonSettings on a.Currency equals c.CodeSet into c1
                            from c2 in c1.DefaultIfEmpty()
                            where ((a.IsDeleted == false) &&
                                   ((fromDate == null) || (a.CreatedTime.HasValue && a.CreatedTime.Value.Date >= fromDate)) &&
                                   ((toDate == null) || (a.CreatedTime.HasValue && a.CreatedTime.Value.Date <= toDate)) &&
                                   (string.IsNullOrEmpty(searchModel.CusCode) || a.CusCode.Equals(searchModel.CusCode)) &&
                                   (string.IsNullOrEmpty(searchModel.Status) || a.Status.Contains(searchModel.Status)) &&
                                   (string.IsNullOrEmpty(searchModel.BudgetF) || a.Budget >= Convert.ToDecimal(searchModel.BudgetF)) &&
                                   (string.IsNullOrEmpty(searchModel.BudgetT) || a.Budget <= Convert.ToDecimal(searchModel.BudgetT)) &&
                                   (string.IsNullOrEmpty(searchModel.Currency) || a.Currency.Contains(searchModel.Currency)))
                            select new
                            {
                                Code = a.ContractCode,
                                Name = a.Title,
                            };
                msg.Object = query;
            }
            catch (Exception ex)
            {
                msg.Object = ex.Message;
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult SearchProgress(string contractCode)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                contractCode = string.IsNullOrEmpty(contractCode) ? _context.CardMappings.Where(x => !string.IsNullOrEmpty(x.ContractCode)).Last().ContractCode : contractCode;
                if (!string.IsNullOrEmpty(contractCode))
                {
                    var query = from a in _context.CardMappings
                                join b in _context.WORKOSCards on a.CardCode equals b.CardCode
                                where a.ContractCode == contractCode && !string.IsNullOrEmpty(a.ContractCode)
                                select new
                                {
                                    b.CardID,
                                    b.CardCode,
                                    b.CardName,
                                    BeginTime = b.BeginTime.ToString("dd/MM/yyyy"),
                                    Duration = (int)(b.EndTime.Value - b.BeginTime).TotalDays,
                                    Completed = b.Completed / 100
                                };
                    var projectCompleted = query.Any() ? (query.Where(x => x.Completed == 1).Count() / (query.Count())) : 0;
                    msg.Object = new
                    {
                        ListProgress = query,
                        DetailContract = _context.PoSaleHeaders.Where(x => x.ContractCode == contractCode && x.IsDeleted == false).Select(x => new
                        {
                            x.ContractHeaderID,
                            x.Title,
                            StartTime = x.ContractDate.HasValue ? x.ContractDate.Value.ToString("dd/MM/yyyy") : DateTime.Now.ToString("dd/MM/yyyy"),
                            EndTime = x.EndDate.HasValue ? x.EndDate.Value.ToString("dd/MM/yyyy") : DateTime.Now.ToString("dd/MM/yyyy"),
                            Duration = x.ContractDate.HasValue && x.EndDate.HasValue ? (int)(x.EndDate - x.ContractDate).Value.TotalDays : 1,
                            Completed = projectCompleted
                        }).FirstOrDefault()
                    };
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }).Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value })).Union(_sharedResourcesCardJob.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion
    }
}