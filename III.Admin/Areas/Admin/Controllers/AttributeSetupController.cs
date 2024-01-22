using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using ESEIM;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using III.Domain.Enums;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using DocumentFormat.OpenXml.Packaging;
using System.Text.RegularExpressions;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class AttributeSetupController : BaseController
    {
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly EIMDBContext _context;
        private readonly ILogger _logger;
        private readonly IActionLogService _actionLog;
        private readonly AppSettings _appSettings;
        private readonly IUploadService _upload;
        private readonly IStringLocalizer<AttributeSetupController> _stringLocalizer;
        private readonly IStringLocalizer<ActivityController> _activityLocalizer;
        private readonly IStringLocalizer<HrEmployeeController> _hrLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;

        public AttributeSetupController(EIMDBContext context, IUploadService upload, ILogger<HrEmployeeController> logger, IOptions<AppSettings> appSettings,
            IHostingEnvironment hostingEnvironment, IActionLogService actionLog, IStringLocalizer<AttributeSetupController> stringLocalizer,
            IStringLocalizer<ActivityController> activityLocalizer,
            IStringLocalizer<SharedResources> sharedResources, IStringLocalizer<HrEmployeeController> hrLocalizer)
        {
            _context = context;
            _upload = upload;
            _logger = logger;
            _hostingEnvironment = hostingEnvironment;
            _actionLog = actionLog;
            _appSettings = appSettings.Value;
            _stringLocalizer = stringLocalizer;
            _activityLocalizer = activityLocalizer;
            _sharedResources = sharedResources;
            _hrLocalizer = hrLocalizer;
        }
        [Breadcrumb("ViewData.CrumbAttrSetUp", AreaName = "Admin", FromAction = "Index", FromController = typeof(CardWorkHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbCardWorkHome"] = _sharedResources["COM_CRUMB_CARD_WORK_HOME"];
            ViewData["CrumbAttrSetUp"] = _sharedResources["COM_CRUMB_ATTR_SETUP"];
            return View("Index");
        }
        #region Attribute

        [HttpPost]
        public JsonResult JTableTemplate([FromBody] TemplateModel jTablepara)
        {
            int intBeginFor = (jTablepara.CurrentPage - 1) * jTablepara.Length;
            var query = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals("CARD_DATA_LOGGER"))
                .Select(x => new
                {
                    Id = x.SettingID,
                    Code = x.CodeSet,
                    Name = x.ValueSet,
                    Group = x.Group,
                    GroupNote = x.GroupNote
                });
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablepara.QueryOrderBy).Skip(intBeginFor).Take(jTablepara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablepara.Draw, count, "Id", "Code", "Name", "Group", "GroupNote");
            return Json(jdata);
        }

        [HttpPost]
        public JsonResult JTableAttr([FromBody]JTableAttrModel jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.AttrSetups
                        join b in _context.CommonSettings on a.AttrDataType equals b.CodeSet into b1
                        from b2 in b1.DefaultIfEmpty()
                        join c in _context.CommonSettings on a.AttrUnit equals c.CodeSet into c1
                        from c2 in c1.DefaultIfEmpty()
                        join d in _context.CommonSettings on a.AttrGroup equals d.CodeSet into d1
                        from d2 in d1.DefaultIfEmpty()
                        where (!a.IsDeleted)
                        && jTablePara.AttrGroup.Equals(a.AttrGroup)
                        select new
                        {
                            a.ID,
                            a.AttrCode,
                            a.AttrName,
                            AttrType = b2 != null ? b2.ValueSet : a.AttrDataType,
                            AttrUnit = c2 != null ? c2.ValueSet : a.AttrUnit,
                            AttrGroup = d2 != null ? d2.ValueSet : a.AttrGroup,
                            a.Note
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "ID", "AttrCode", "AttrName", "AttrType", "AttrGroup", "AttrUnit", "Note");
            return Json(jdata);
        }

        public class JTableAttrModel : JTableModel
        {
            public int ID { get; set; }
            public string AttrCode { get; set; }
            public string AttrType { get; set; }
            public string AttrName { get; set; }

            public string AttrDataType { get; set; }

            public string AttrUnit { get; set; }

            public string AttrGroup { get; set; }

            public string Note { get; set; }
            public string WorkFlowCode { get; set; }
        }

        [HttpPost]
        public JsonResult GetListATTRUNIT()
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "ATTR_UNIT").Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                if (data != null)
                {
                    msg.Object = data;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_MSG_NOT_FOUND_DATA"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetListATTRTYPE()
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "ATTR_DATA_TYPE").Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                if (data != null)
                {
                    msg.Object = data;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_MSG_NOT_FOUND_DATA"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetGroupAttr()
        {
            var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "CARD_DATA_LOGGER")
                .Select(x => new { Code = x.CodeSet, Name = x.ValueSet }).DistinctBy(x => x.Code);
            return Json(data);
        }

        [HttpPost]
        public object InsertActAttrSetup([FromBody] AttrSetup obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var check = _context.AttrSetups.FirstOrDefault(x => x.AttrCode.Equals(obj.AttrCode) && x.AttrGroup.Equals(obj.AttrGroup) && !x.IsDeleted);
                if (check == null)
                {
                    var attr = new AttrSetup
                    {
                        AttrCode = obj.AttrCode,
                        AttrName = obj.AttrName,
                        AttrUnit = obj.AttrUnit,
                        Note = obj.Note,
                        AttrGroup = obj.AttrGroup,
                        AttrDataType = obj.AttrDataType,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now,
                    };
                    _context.AttrSetups.Add(attr);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizer["ATTR_SET_UP_MSG_ADD_ATTR_SUCCESS"];
                    msg.ID = attr.ID;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["ATRT_SET_UP_ATTR_EXISTS"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public object GetItem(int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var attr = _context.AttrSetups.FirstOrDefault(x => x.ID == id && !x.IsDeleted);
                if (attr == null)
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["ATTR_SET_UP_ATTR_NO_EXISTS"];
                }
                else
                {
                    msg.Object = attr;
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public object UpdateActAttrSetup([FromBody] AttrSetup obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var attr = _context.AttrSetups.FirstOrDefault(x => /*x.AttrCode.Equals(obj.AttrCode) && x.AttrGroup.Equals(obj.AttrGroup)*/ x.ID == obj.ID && !x.IsDeleted);
                if (attr == null)
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["ATTR_SET_UP_ATTR_NO_EXISTS"];
                }
                else
                {
                    attr.AttrCode = obj.AttrCode;
                    attr.AttrName = obj.AttrName;
                    attr.AttrUnit = obj.AttrUnit;
                    attr.Note = obj.Note;
                    attr.AttrGroup = obj.AttrGroup;
                    attr.AttrDataType = obj.AttrDataType;
                    attr.UpdatedBy = ESEIM.AppContext.UserName;
                    attr.UpdatedTime = DateTime.Now;
                    _context.AttrSetups.Update(attr);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizer["ATTR_SET_UP_UPDATE_ATTR_SUCCESS"];
                    msg.ID = attr.ID;
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public object DeleteActAttrSetup(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.AttrSetups.FirstOrDefault(x => !x.IsDeleted && x.ID == id);

                if (data != null)
                {
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    data.IsDeleted = true;
                    _context.AttrSetups.Update(data);
                    _context.SaveChanges();

                    msg.Title = _stringLocalizer["ATTR_SET_UP_DEL_ATTR_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["ATTR_SET_UP_ATTR_NO_EXISTS"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        public class TemplateModel : JTableModel
        {
            public string AttrGroup { get; set; }
        }
        #endregion

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new Newtonsoft.Json.Linq.JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_activityLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_hrLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }))
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
