using System;
using System.Globalization;
using System.Linq;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class CustomerProgressController : Controller
    {
        private readonly EIMDBContext _context;
        private readonly IStringLocalizer<CustomerProgressController> _stringLocalizer;
        private readonly IStringLocalizer<CardJobController> _stringLocalizerCardJob;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public CustomerProgressController(EIMDBContext context, IStringLocalizer<CustomerProgressController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources, IStringLocalizer<CardJobController> stringLocalizerCardJob)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
            _stringLocalizerCardJob = stringLocalizerCardJob;
        }
        [Breadcrumb("ViewData.CrumbCusProgress", AreaName = "Admin", FromAction = "Index", FromController = typeof(CustomerHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbCusHome"] = _sharedResources["COM_CRUMB_CUSTOMER"];
            ViewData["CrumbCusProgress"] = _sharedResources["COM_CRUMB_PROGRESS"];
            return View();
        }

        [HttpPost]
        public object GetListCustomer()
        {
            var list = _context.Customerss.Where(x => x.IsDeleted == false).Select(x => new { Code = x.CusCode, Name = x.CusName }).AsNoTracking().ToList();
            return list;
        }

        [HttpPost]
        public JsonResult SearchCustomer([FromBody]JTableModelCustomer searchModel)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var query = from a in _context.Customerss
                            where (a.IsDeleted == false)
                                && (string.IsNullOrEmpty(searchModel.CustomerCode) || a.CusCode.ToLower().Contains(searchModel.CustomerCode.ToLower()))
                                && (string.IsNullOrEmpty(searchModel.CustomerName) || a.CusName.ToLower().Contains(searchModel.CustomerName.ToLower()))
                                && (string.IsNullOrEmpty(searchModel.CustomerEmail) || a.Email.ToLower().Contains(searchModel.CustomerEmail.ToLower()))
                                && (string.IsNullOrEmpty(searchModel.CustomerPhone) || a.MobilePhone.ToLower().Contains(searchModel.CustomerPhone.ToLower()))
                                && (string.IsNullOrEmpty(searchModel.CustomerActivityStatus) || a.ActivityStatus == searchModel.CustomerActivityStatus)
                                && (string.IsNullOrEmpty(searchModel.CustomerGroup) || a.CusGroup.ToLower() == searchModel.CustomerGroup.ToLower())
                                && (string.IsNullOrEmpty(searchModel.Address) || a.Address.ToLower().Contains(searchModel.Address.ToLower()))
                            select a;
                msg.Object = query;
            }
            catch (Exception ex)
            {
                msg.Object = ex.Message;
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_ERR_RETRY"]);
            }
            return Json(msg);
        }

        [HttpGet]
        public JsonResult SearchProgress(string customerCode)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                customerCode = string.IsNullOrEmpty(customerCode) ? _context.CardMappings.FirstOrDefault(x => !string.IsNullOrEmpty(x.CustomerCode))?.CustomerCode : customerCode;
                if (!string.IsNullOrEmpty(customerCode))
                {
                    var query = from a in _context.CardMappings
                                join b in _context.WORKOSCards on a.CardCode equals b.CardCode
                                where a.CustomerCode == customerCode
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
                        DetailCustomer = _context.Customerss.Where(x => x.CusCode == customerCode && x.IsDeleted == false).Select(x => new
                        {
                            x.CusID,
                            x.CusName,
                            x.Address,
                            x.MobilePhone
                        }).FirstOrDefault()
                    };
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = String.Format(_sharedResources["COM_MSG_DATA_FAIL"]);
            }
            return Json(msg);
        }

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }).Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value })).Union(_stringLocalizerCardJob.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion
    }
}