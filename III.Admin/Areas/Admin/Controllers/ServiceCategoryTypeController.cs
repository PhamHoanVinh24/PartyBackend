using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
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
    public class ServiceCategoryTypeController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IStringLocalizer<ServiceCategoryTypeController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;

        public ServiceCategoryTypeController(EIMDBContext context, IStringLocalizer<ServiceCategoryTypeController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _sharedResources = sharedResources;
            _stringLocalizer = stringLocalizer;
        }
        [Breadcrumb("ViewData.CrumbSvCatType", AreaName = "Admin", FromAction = "Index", FromController = typeof(ServiceHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuStore"] = _sharedResources["COM_CRUMB_MENU_STORE"];
            ViewData["CrumbServiceHome"] = _sharedResources["COM_CRUMB_SV_HOME"];
            ViewData["CrumbSvCatType"] = _sharedResources["COM_CRUMB_SERVICE_TYPE"];
            return View();
        }

        public class JTableModelMaterial : JTableModel
        {
            public string MaterialCode { get; set; }
            public string MaterialName { get; set; }
            public int? MaterialParent { get; set; }
        }

        [HttpPost]
        public object JTable([FromBody]JTableModelMaterial jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            string code = jTablePara.MaterialCode.ToLower();
            string name = jTablePara.MaterialName.ToLower();
            int? parent = jTablePara.MaterialParent;

            var query = from a in _context.ServiceCategoryTypes
                        where (a.IsDeleted == false &&
                               a.Code.ToLower().Contains(code) &&
                               a.Name.ToLower().Contains(name) &&
                               (parent == null || parent == a.ParentId))
                        select new
                        {
                            id = a.Id,
                            code = a.Code,
                            name = a.Name,
                            description = a.Description
                        };
            int count = query.Count();
            //var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length).AsNoTracking().ToList();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).AsNoTracking().ToList();
            var data1 = data.Skip(intBeginFor).Take(jTablePara.Length).ToList();
            var jdata = JTableHelper.JObjectTable(data1, jTablePara.Draw, count, "id", "code", "name", "description");
            return Json(jdata);
        }

        [HttpPost]
        public object Insert([FromBody]ServiceCategoryType data)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                if (_context.ServiceCategoryTypes.FirstOrDefault(x => x.Code == data.Code && !x.IsDeleted) == null)
                {
                    data.CreatedBy = ESEIM.AppContext.UserName;
                    data.CreatedTime = DateTime.Now;

                    _context.ServiceCategoryTypes.Add(data);
                    _context.SaveChanges();

                    msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["SCT_MSG_CODE_EXIST"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_ADD_FAILED"], _stringLocalizer["SCT_LBL_SCT"]);
                msg.Object = ex;
            }
            return Json(msg);
        }

        [HttpPost]
        public object Delete(int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.ServiceCategoryTypes.FirstOrDefault(x => x.Id == id);
                data.IsDeleted = true;
                data.DeletedBy = ESEIM.AppContext.UserName;
                data.DeletedTime = DateTime.Now;

                _context.ServiceCategoryTypes.Update(data);
                _context.SaveChanges();

                msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_ERR_DELETE"];
                msg.Object = ex;
                return Json(msg);
            }
        }
        [HttpPost]
        public object GetData(int id)
        {
            var data = _context.ServiceCategoryTypes.FirstOrDefault(x => x.Id == id);
            return Json(data);
        }

        [HttpPost]
        public object Update([FromBody]ServiceCategoryType data)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                data.UpdatedBy = ESEIM.AppContext.UserName;
                data.UpdatedTime = DateTime.Now;
                _context.ServiceCategoryTypes.Update(data);
                _context.SaveChanges();

                msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_UPDATE_FAIL"];
                msg.Object = ex;
                return Json(msg);
            }
        }

        [HttpPost]
        public object GetAllData()
        {
            var data = _context.ServiceCategoryTypes.Select(x => new { x.Id, x.Name }).AsNoTracking().ToList();
            return Json(data);
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