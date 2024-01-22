using System;
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
    public class SupplierProgressController : Controller
    {
        private readonly EIMDBContext _context;
        private readonly IStringLocalizer<SupplierProgressController> _stringLocalizer;
        private readonly IStringLocalizer<CardJobController> _stringLocalizerCardJob;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public SupplierProgressController(EIMDBContext context, IStringLocalizer<SupplierProgressController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources, IStringLocalizer<CardJobController> stringLocalizerCardJob)
        {
            _context = context;
            _sharedResources = sharedResources;
            _stringLocalizer = stringLocalizer;
            _stringLocalizerCardJob = stringLocalizerCardJob;
        }
        [Breadcrumb("ViewData.CrumbSuppProgress", AreaName = "Admin", FromAction = "Index", FromController = typeof(SupplierHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbSuppHome"] = _sharedResources["COM_CRUMB_SUPP_HOME"];
            ViewData["CrumbSuppProgress"] = _sharedResources["COM_CRUMB_PROGRESS"];
            return View();
        }

        [HttpPost]
        public object GetListSupplier()
        {
            var list = _context.Suppliers.Where(x => x.IsDeleted == false).Select(x => new { Code = x.SupCode, Name = x.SupName }).AsNoTracking().ToList();
            return list;
        }

        [HttpPost]
        public JsonResult SearchSupplier([FromBody]JTableModelSupplier searchModel)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var query = from a in _context.Suppliers
                            where (a.IsDeleted == false)
                            && (string.IsNullOrEmpty(searchModel.SupplierCode) || (a.SupCode.ToLower().Contains(searchModel.SupplierCode.ToLower())))
                            && (string.IsNullOrEmpty(searchModel.SupplierName) || (a.SupName.ToLower().Contains(searchModel.SupplierName.ToLower())))
                            && (string.IsNullOrEmpty(searchModel.SupplierEmail) || (a.Email.ToLower().Contains(searchModel.SupplierEmail.ToLower())))
                            && (string.IsNullOrEmpty(searchModel.Address) || (a.Address.ToLower().Contains(searchModel.Address.ToLower())))
                            && (string.IsNullOrEmpty(searchModel.Phone) || (a.Mobile.ToLower().Contains(searchModel.Phone.ToLower())))
                            && (string.IsNullOrEmpty(searchModel.SupplierGroup) || (a.SupGroup.Equals(searchModel.SupplierGroup)))
                            && (string.IsNullOrEmpty(searchModel.Status) || (a.Status.Equals(searchModel.Status)))
                            select new
                            {
                                Code = a.SupCode,
                                Name = a.SupName
                            };
                msg.Object = query;
            }
            catch (Exception ex)
            {
                msg.Object = ex.Message;
                msg.Error = true;
                msg.Title = string.Format(_stringLocalizer["SP_MSG_ERR_RETRY"]);/*có lỗi xin thử lại*/
            }
            return Json(msg);
        }

        [HttpGet]
        public JsonResult SearchProgress(string supplierCode)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                supplierCode = string.IsNullOrEmpty(supplierCode) ? _context.CardMappings.FirstOrDefault(x => !string.IsNullOrEmpty(x.SupplierCode))?.SupplierCode : supplierCode;
                if (!string.IsNullOrEmpty(supplierCode))
                {
                    var query = from a in _context.CardMappings
                                join b in _context.WORKOSCards on a.CardCode equals b.CardCode
                                where a.SupplierCode == supplierCode
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
                        DetailSupplier = _context.Suppliers.Where(x => x.SupCode == supplierCode && x.IsDeleted == false).Select(x => new
                        {
                            x.SupID,
                            x.SupName,
                            x.Address,
                            x.Mobile
                        }).FirstOrDefault()
                    };
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = string.Format(_sharedResources["COM_MSG_DATA_FAIL"]); 
            }
            return Json(msg);
        }

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }).Union(_stringLocalizerCardJob.GetAllStrings().Select(x => new { x.Name, x.Value }))
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