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
    public class ProjectProgressController : Controller
    {
        private readonly EIMDBContext _context;
        private readonly IStringLocalizer<ProjectProgressController> _stringLocalizer;
        private readonly IStringLocalizer<CardJobController> _cardJobController;
        private readonly IStringLocalizer<SharedResources> _sharedResources;

        public ProjectProgressController(EIMDBContext context, IStringLocalizer<ProjectProgressController> stringLocalizer, IStringLocalizer<CardJobController> cardJobController, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _cardJobController = cardJobController;
            _sharedResources = sharedResources;
        }
        [Breadcrumb("ViewData.CrumbProjProgress", AreaName = "Admin", FromAction = "Index", FromController = typeof(ProjectHomeController))]
        public IActionResult Index(string projectCode)
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbProjectHome"] = _sharedResources["COM_CRUMB_PROJECT_HOME"];
            ViewData["CrumbProjProgress"] = _sharedResources["COM_CRUMB_PROGRESS"];
            ViewBag.projectCode = projectCode;
            return View();
        }

        [HttpPost]
        public object GetListProject()
        {
            var list = _context.Projects.Where(x => x.FlagDeleted == false).OrderByDescending(x => x.Id).Select(x => new { Code = x.ProjectCode, Name = x.ProjectTitle }).AsNoTracking();
            return list;
        }

        [HttpPost]
        public JsonResult SearchProject([FromBody]JTableModelProject searchModel)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var fromDate = !string.IsNullOrEmpty(searchModel.StartTime) ? DateTime.ParseExact(searchModel.StartTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var toDate = !string.IsNullOrEmpty(searchModel.EndTime) ? DateTime.ParseExact(searchModel.EndTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var query = (from a in _context.Projects
                             where (!a.FlagDeleted)
                             && (string.IsNullOrEmpty(searchModel.ProjectCode) || (a.ProjectCode.ToLower().Contains(searchModel.ProjectCode.ToLower())))
                             && (string.IsNullOrEmpty(searchModel.ProjectTitle) || (a.ProjectTitle.ToLower().Contains(searchModel.ProjectTitle.ToLower())))
                             && (string.IsNullOrEmpty(searchModel.ProjectType) || (a.PrjType.Equals(searchModel.ProjectType)))
                             && (fromDate == null || (a.StartTime >= fromDate))
                             && (toDate == null || (a.EndTime <= toDate))
                             && (searchModel.BudgetStart == null || (a.Budget >= searchModel.BudgetStart))
                             && (searchModel.BudgetEnd == null || (a.Budget <= searchModel.BudgetEnd))
                             select new
                             {
                                 Code = a.ProjectCode,
                                 Name = a.ProjectTitle
                             });
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


        [HttpGet]
        public JsonResult SearchProgress(string projectCode)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                projectCode = string.IsNullOrEmpty(projectCode) ? _context.JcObjectIdRelatives.FirstOrDefault(x => x.ObjTypeCode == "PROJECT" && !x.IsDeleted).ObjID : projectCode;
                var query = from a in _context.JcObjectIdRelatives.Where(x => !x.IsDeleted)
                            join b in _context.WORKOSCards.Where(x => !x.IsDeleted && x.Status != "TRASH" && x.Status != "CANCLED") on a.CardCode equals b.CardCode
                            where a.ObjID == projectCode
                            select new
                            {
                                b.CardID,
                                b.CardCode,
                                b.CardName,
                                BeginTime = b.BeginTime.ToString("dd/MM/yyyy"),
                                Duration = (int)((b.EndTime.HasValue ? b.EndTime.Value : DateTime.Now.Date) - b.BeginTime).TotalDays,
                                Completed = b.Completed / 100
                            };
                var projectCompleted = query.Any() ? (query.Where(x => x.Completed == 1).Count() / (query.Count())) : 0;
                msg.Object = new
                {
                    ListProgress = query,
                    DetailProject = _context.Projects.Where(x => x.ProjectCode == projectCode && x.FlagDeleted == false).Select(x => new
                    {
                        x.Id,
                        x.ProjectTitle,
                        StartTime = x.StartTime.ToString("dd/MM/yyyy"),
                        EndTime = x.EndTime.ToString("dd/MM/yyyy"),
                        Duration = (int)(x.EndTime - x.StartTime).TotalDays,
                        Completed = projectCompleted
                    }).FirstOrDefault()
                };
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