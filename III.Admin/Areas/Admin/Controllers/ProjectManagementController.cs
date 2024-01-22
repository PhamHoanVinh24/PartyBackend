using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using Microsoft.AspNetCore.Http;
using System.Globalization;
using System.IO;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore.Internal;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class ProjectManagementController : Controller
    {
        public class ProjectManagementJtable : JTableModel
        {
            public string UserId { get; set; }
            public string Code { get; set; }
            public string Name { get; set; }
            public string Status { get; set; }
            public string DueDate { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
        }
        private readonly EIMDBContext _context;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<ProjectManagementController> _stringLocalizer;
        private readonly IStringLocalizer<CardJobController> _cardJobController;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public ProjectManagementController(EIMDBContext context, IHostingEnvironment hostingEnvironment, IStringLocalizer<ProjectManagementController> stringLocalizer, IStringLocalizer<CardJobController> cardJobController, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _hostingEnvironment = hostingEnvironment;
            _stringLocalizer = stringLocalizer;
            _cardJobController = cardJobController;
            _sharedResources = sharedResources;
        }
        [Breadcrumb("ViewData.CrumbProjManage", AreaName = "Admin", FromAction = "Index", FromController = typeof(ProjectHomeController))]
        public IActionResult Index(string userId)
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbProjectHome"] = _sharedResources["COM_CRUMB_PROJECT_HOME"];
            ViewData["CrumbProjManage"] = _sharedResources["COM_CRUMB_PROJECT_MANAGEMENT"];
            ViewBag.userId = userId;
            return View();
        }

        #region Index
        [HttpPost]
        public object JTable([FromBody]ProjectManagementJtable jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var query = (from a in _context.WORKOSCards
                         let listUser = !string.IsNullOrEmpty(a.LstUser) ? a.LstUser.Split(",", StringSplitOptions.None) : new string[0]
                         from c in listUser
                         where a.IsDeleted == false && (string.IsNullOrEmpty(jTablePara.UserId) || c == jTablePara.UserId)
                          && ((string.IsNullOrEmpty(jTablePara.Code)) || (a.CardCode.ToLower().Contains(jTablePara.Code.ToString())))
                          && ((string.IsNullOrEmpty(jTablePara.Name)) || (a.CardName.ToLower().Contains(jTablePara.Name.ToLower())))
                          && ((string.IsNullOrEmpty(jTablePara.Status)) || (a.Status == jTablePara.Status))
                          && ((string.IsNullOrEmpty(jTablePara.FromDate)) || (a.CreatedDate.Date >= fromDate.Value.Date))
                          && ((string.IsNullOrEmpty(jTablePara.ToDate)) || (a.CreatedDate.Date <= toDate.Value.Date))
                         select a)
                         .OrderByDescending(x => x.CardID);
            var data = (from x in query
                        let contractCode = _context.CardMappings.Any(y => !string.IsNullOrEmpty(y.ContractCode) && y.CardCode == x.CardCode)
                                                    ? _context.CardMappings.FirstOrDefault(y => !string.IsNullOrEmpty(y.ContractCode) && y.CardCode == x.CardCode).ContractCode
                                                    : ""
                        let projectCode = _context.CardMappings.Any(y => !string.IsNullOrEmpty(y.ProjectCode) && y.CardCode == x.CardCode)
                                                    ? _context.CardMappings.FirstOrDefault(y => !string.IsNullOrEmpty(y.ProjectCode) && y.CardCode == x.CardCode).ProjectCode
                                                    : ""
                        select new
                        {
                            x.CardID,
                            x.CardCode,
                            x.CardName,
                            Status = _context.CommonSettings.FirstOrDefault(y => y.CodeSet.Equals(x.Status)).ValueSet ?? "",
                            x.BeginTime,
                            x.EndTime,
                            x.Cost,
                            Currency = _context.CommonSettings.FirstOrDefault(y => y.CodeSet == x.Currency).ValueSet ?? "",
                            ListName = _context.WORKOSLists.FirstOrDefault(y => y.ListCode == x.ListCode && y.IsDeleted == false).ListName ?? "",
                            BoardName = _context.WORKOSBoards.FirstOrDefault(y => y.BoardCode == (_context.WORKOSLists.FirstOrDefault(z => z.ListCode == x.ListCode && z.IsDeleted == false).BoardCode ?? "")).BoardName ?? "",
                            ProjectCode = projectCode,
                            ProjectName = !string.IsNullOrEmpty(projectCode)
                                                ? _context.Projects.Any(y => !y.FlagDeleted && y.ProjectCode == projectCode)
                                                    ? _context.Projects.FirstOrDefault(y => !y.FlagDeleted && y.ProjectCode == projectCode).ProjectTitle
                                                    : ""
                                                : "",
                            ContractCode = contractCode,
                            ContractName = !string.IsNullOrEmpty(contractCode)
                                                ? _context.PoBuyerHeaders.Any(y => !y.IsDeleted && y.ContractCode == contractCode)
                                                    ? _context.PoBuyerHeaders.FirstOrDefault(y => !y.IsDeleted && y.ContractCode == contractCode).PoTitle
                                                    : ""
                                                : "",
                        }).DistinctBy(x => x.CardCode).Skip(intBeginFor).Take(jTablePara.Length).ToList();
            var count = (from a in _context.WORKOSCards
                         let listUser = !string.IsNullOrEmpty(a.LstUser) ? a.LstUser.Split(",", StringSplitOptions.None) : new string[0]
                         from c in listUser
                         where a.IsDeleted == false && (string.IsNullOrEmpty(jTablePara.UserId) || c == jTablePara.UserId)
                          && ((string.IsNullOrEmpty(jTablePara.Code)) || (a.CardCode.ToLower().Contains(jTablePara.Code.ToString())))
                          && ((string.IsNullOrEmpty(jTablePara.Name)) || (a.CardName.ToLower().Contains(jTablePara.Name.ToLower())))
                          && ((string.IsNullOrEmpty(jTablePara.Status)) || (a.Status == jTablePara.Status))
                          && ((string.IsNullOrEmpty(jTablePara.FromDate)) || (a.CreatedDate.Date >= fromDate.Value.Date))
                          && ((string.IsNullOrEmpty(jTablePara.ToDate)) || (a.CreatedDate.Date <= toDate.Value.Date))
                         select a).AsNoTracking().DistinctBy(x => x.CardCode).Count();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "CardID", "CardCode", "CardName", "Status", "BeginTime", "EndTime", "Cost", "Currency", "ListName", "BoardName", "ProjectCode", "ContractCode", "ProjectName", "ContractName");
            return Json(jdata);
        }

        [HttpPost]
        public JsonResult Delete([FromBody]int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.WORKOSCards.FirstOrDefault(x => x.CardID == id);
                if (data != null)
                {
                    _context.WORKOSCards.Remove(data);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["PROJECT_MANAGEMENT_MSG_NO_DATA"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title =_sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }
        #endregion

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_cardJobController.GetAllStrings().Select(x => new { x.Name, x.Value }))
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