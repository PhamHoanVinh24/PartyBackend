using System;
using System.Collections.Generic;
using System.Data;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using III.Domain.Enums;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Internal;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class WorkflowPluginController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<ActivityController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IStringLocalizer<CustomerController> _stringLocalizerCus;
        private readonly IStringLocalizer<EDMSRepositoryController> _stringLocalizerEdms;
        public WorkflowPluginController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment,
            IStringLocalizer<ActivityController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources,
            IStringLocalizer<CustomerController> stringLocalizerCus, IStringLocalizer<EDMSRepositoryController> stringLocalizerEdms)
        {
            _context = context;
            _upload = upload;
            _hostingEnvironment = hostingEnvironment;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
            _stringLocalizerCus = stringLocalizerCus;
            _stringLocalizerEdms = stringLocalizerEdms;
        }

        [Breadcrumb("ViewData.CrumbActivity", AreaName = "Admin", FromAction = "Index", FromController = typeof(MenuWfSystemController))]
        [AdminAuthorize]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuWfSystem"] = _sharedResources["COM_CRUMB_MENU_ACTIVITY"];
            ViewData["CrumbActivity"] = "Workflow Plugin";
            return View();
        }

        #region Diagram work flow
        [HttpPost]
        public JsonResult GetActivityArranged(string wfCode)
        {
            var activities = (_context.Activitys.Where(x => !x.IsDeleted && x.WorkflowCode.Equals(wfCode))
                .Select(x => new ActGrid
                {
                    ActivityInstCode = x.ActivityCode,
                    ActName = x.Title,
                    ActStatus = x.Status,
                    ActType = x.Type,
                    Id = x.ID,
                    IsLock = false,
                    Level = 0,
                    IsInstance = false
                })).ToList();

            var actInit = activities.FirstOrDefault(x => x.ActType.Equals(EnumHelper<TypeActivity>.GetDisplayValue(TypeActivity.Initial)));

            var actArranged = ArrangeActCat(activities, 1, actInit).GroupBy(x => x.Level);

            return Json(actArranged);
        }

        [HttpPost]
        public JsonResult GetActInstArranged(int id, string objType)
        {
            var wfInstance = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value
                                                                          && x.Id.Equals(id)
                                                                          && x.ObjectType.Equals(objType));
            var wfInstCode = "";
            if (wfInstance != null)
            {
                wfInstCode = wfInstance.WfInstCode;
            }
            var activities = (from a in _context.ActivityInstances.Where(x => !x.IsDeleted && x.WorkflowCode.Equals(wfInstCode))
                              join c in _context.WorkflowInstances.Where(x => !x.IsDeleted.Value) on a.WorkflowCode equals c.WfInstCode
                              join b in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Status equals b.CodeSet into b1
                              from b in b1.DefaultIfEmpty()
                              select new ActGrid
                              {
                                  ActivityInstCode = a.ActivityInstCode,
                                  ActName = a.Title,
                                  ActStatus = b != null ? b.ValueSet : "",
                                  ActType = a.Type,
                                  Id = a.ID,
                                  //IsLock = a.IsLock,
                                  Level = 0,
                                  IsInstance = true,
                                  ObjectCode = c.ObjectInst
                              }).ToList();

            var actInit = activities.FirstOrDefault(x => x.ActType.Equals(EnumHelper<TypeActivity>.GetDisplayValue(TypeActivity.Initial)));

            var actArranged = ArrangeActInst(activities, 1, actInit).GroupBy(x => x.Level);

            return Json(actArranged);
        }

        [HttpPost]
        public JsonResult GetActInstArrangedRelaCurrentUser(int id, string objType)
        {
            var session = HttpContext.GetSessionUser();
            var wfInstance = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value
                                                                          && x.Id.Equals(id)
                                                                          && x.ObjectType.Equals(objType));
            var wfInstCode = "";
            if (wfInstance != null)
            {
                wfInstCode = wfInstance.WfInstCode;
            }
            var activities = (from a in _context.ActivityInstances.Where(x => !x.IsDeleted && x.WorkflowCode.Equals(wfInstCode))
                              join d in _context.ExcuterControlRoleInsts.Where(x => !x.IsDeleted) on a.ActivityInstCode equals d.ActivityCodeInst into d1
                              from d in d1.DefaultIfEmpty()
                              join c in _context.WorkflowInstances.Where(x => !x.IsDeleted.Value) on a.WorkflowCode equals c.WfInstCode
                              join b in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Status equals b.CodeSet into b1
                              from b in b1.DefaultIfEmpty()
                              where session.IsAllData || c.CreatedBy.Equals(session.UserName) || d.UserId.Equals(ESEIM.AppContext.UserId)
                              select new ActGrid
                              {
                                  ActivityInstCode = a.ActivityInstCode,
                                  ActName = a.Title,
                                  ActStatus = b != null ? b.ValueSet : "",
                                  ActType = a.Type,
                                  Id = a.ID,
                                  //IsLock = a.IsLock,
                                  Level = 0,
                                  IsInstance = true,
                                  ObjectCode = c.ObjectInst
                              }).ToList();

            var actInit = activities.FirstOrDefault(x => x.ActType.Equals(EnumHelper<TypeActivity>.GetDisplayValue(TypeActivity.Initial)));

            var actArranged = ArrangeActInst(activities, 1, actInit).GroupBy(x => x.Level);

            return Json(actArranged);
        }

        [NonAction]
        private List<ActGrid> ArrangeActCat(List<ActGrid> listInst, int level, ActGrid instInitial)
        {
            try
            {
                if (instInitial != null)
                {
                    instInitial.Level = level;
                    var runnings = _context.WorkflowSettings.Where(x => !x.IsDeleted && x.ActivityInitial.Equals(instInitial.ActivityInstCode));
                    foreach (var item in runnings)
                    {
                        var actRunning = listInst.FirstOrDefault(x => x.ActivityInstCode.Equals(item.ActivityDestination));
                        if (actRunning != null)
                        {
                            actRunning.Level = instInitial.Level + 1;
                            listInst = ArrangeActCat(listInst, actRunning.Level, actRunning);
                        }
                    }
                }
            }
            catch (Exception ex)
            {

            }

            return listInst.OrderBy(x => x.Level).ToList();
        }

        [NonAction]
        private List<ActGrid> ArrangeActInst(List<ActGrid> listInst, int level, ActGrid instInitial)
        {
            try
            {
                if (instInitial != null)
                {
                    instInitial.Level = level;
                    var runnings = _context.WorkflowInstanceRunnings.Where(x => !x.IsDeleted && x.ActivityInitial.Equals(instInitial.ActivityInstCode));
                    foreach (var item in runnings)
                    {
                        var actRunning = listInst.FirstOrDefault(x => x.ActivityInstCode.Equals(item.ActivityDestination));
                        if (actRunning != null)
                        {
                            actRunning.Level = instInitial.Level + 1;
                            listInst = ArrangeActInst(listInst, actRunning.Level, actRunning);
                        }
                    }
                }
            }
            catch (Exception ex)
            {

            }

            return listInst.OrderBy(x => x.Level).ToList();
        }

        public class ActGrid
        {
            public string ActName { get; set; }
            public string ActStatus { get; set; }
            public int Id { get; set; }
            public bool IsLock { get; set; }
            public int Level { get; set; }
            public string ActivityInstCode { get; set; }
            public string ActType { get; set; }
            public bool IsInstance { get; set; }
            public string ObjectCode { get; set; }
        }
        #endregion

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_stringLocalizerCus.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerEdms.GetAllStrings().Select(x => new { x.Name, x.Value }))
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