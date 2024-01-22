using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using Microsoft.Extensions.Options;
using ESEIM;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class ServiceCategoryGroupController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly AppSettings _appSettings;
        private readonly IStringLocalizer<ServiceCategoryGroupController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;

        public class JTableModelCustom : JTableModel
        {
            public string code { get; set; }
            public string name { get; set; }
            public string parenid { get; set; }
            public string key1 { get; set; }
        }
        public ServiceCategoryGroupController(EIMDBContext context, IOptions<AppSettings> appSettings,
            IStringLocalizer<ServiceCategoryGroupController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _appSettings = appSettings.Value;
            _sharedResources = sharedResources;
            _stringLocalizer = stringLocalizer;
        }
        [Breadcrumb("ViewData.CrumbSvCatGrp", AreaName = "Admin", FromAction = "Index", FromController = typeof(ServiceHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuStore"] = _sharedResources["COM_CRUMB_MENU_STORE"];
            ViewData["CrumbServiceHome"] = _sharedResources["COM_CRUMB_SV_HOME"];
            ViewData["CrumbSvCatGrp"] = _stringLocalizer["SCG_LINK_SCG"];
            return View();
        }
        [HttpPost]
        public object JTable([FromBody]JTableModelCustom jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.ServiceCategoryGroups.Where(x => x.IsDeleted == false)
                            //join b in _context.cms_extra_fields_groups on a.Group equals b.Id
                            //orderby b.Name
                        join b in _context.ServiceCategoryGroups.Where(x => x.IsDeleted == false) on a.ParentID equals b.Id into b2
                        from b in b2.DefaultIfEmpty()
                        where (jTablePara.code == null || jTablePara.code == "" || a.Code.ToLower().Contains(jTablePara.code.ToLower()))
                        && (jTablePara.name == null || jTablePara.name == "" || a.Name.ToString().ToLower().Contains(jTablePara.name.ToLower()))
                        && (string.IsNullOrEmpty(jTablePara.parenid) || (a.ParentID != null && a.ParentID == Int32.Parse(jTablePara.parenid)))
                        select new
                        {
                            Id = a.Id,
                            Code = a.Code,
                            Name = a.Name,
                            ParenID = a.ParentID,
                            Description = a.Description,
                            ParentName = (b != null ? b.Name : "")
                        };
            var count = query.Count();

            var data = query
                .OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "Code", "Name", "ParenID", "Description");

            return Json(jdata);
        }
        [HttpPost]
        public JsonResult Insert([FromBody]ServiceCategoryGroup obj)
        {
            var msg = new JMessage { Title = "", Error = false };
            try
            {
                var exist = _context.ServiceCategoryGroups.FirstOrDefault(x => x.Code == obj.Code && !x.IsDeleted);
                if (exist != null)
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["SCG_MSG_CODE_EXIST"];//"Mã nhóm dịch vụ đã tồn tại";
                }
                else
                {
                    obj.CreatedBy = ESEIM.AppContext.UserName;
                    obj.CreatedTime = DateTime.Now;
                    _context.ServiceCategoryGroups.Add(obj);
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["SCG_LBL_SCG"]);//"Thêm Nhóm dịch vụ thành công";
                }
            }
            catch
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_ADD_FAILED"], _stringLocalizer["SCG_LBL_SCG"]); //"Thêm Nhóm dịch vụ lỗi";
            }
            return Json(msg);
        }
        [HttpPost]
        public object Update([FromBody]ServiceCategoryGroup obj)
        {
            var msg = new JMessage();
            try
            {
                obj.UpdatedTime = DateTime.Now.Date;
                _context.ServiceCategoryGroups.Update(obj);
                _context.SaveChanges();
                msg.Error = false;
                msg.Title = string.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], ""); //"Đã lưu thay đổi";
                return msg;
            }
            catch
            {
                msg.Error = true;
                msg.Title = _stringLocalizer["COM_MSG_ERR"];
                return msg;
            }
        }
        [HttpPost]
        public object Delete(int id)
        {
            var msg = new JMessage { Error = true };
            try
            {
                var data = _context.ServiceCategoryGroups.FirstOrDefault(x => x.Id == id);
                _context.ServiceCategoryGroups.Remove(data);
                _context.SaveChanges();
                msg.Error = false;
                msg.Title = string.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], "");
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _stringLocalizer["COM_MSG_ERR"];
                return Json(msg);
            }
        }
        public object GetItem(int id)
        {

            //if (id == null || id < 0)
            //{
            //    return Json("");
            //}
            var a = _context.ServiceCategoryGroups.AsNoTracking().Single(m => m.Id == id);
            return Json(a);
        }
        //[HttpPost]
        //public object gettreedataCategory()
        //{
        //    var msg = new JMessage { Error = true };

        //    try
        //    {
        //        var data = _context.MaterialProducts.OrderBy(x => x.Id);
        //        msg.Object = data;
        //        msg.Error = false;
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Title =_stringLocalizer["MGP_MSG_ADD_PARENT_GROUP_ERROR"]; //"Get Parent Group fail ";
        //    }

        //    return Json(msg);
        //}
        //[HttpPost]
        //public object gettreedataCoursetype()
        //{
        //    var msg = new JMessage { Error = true };

        //    try
        //    {
        //        var data = _context.ServiceCategoryGroups.GroupBy(x => x.Name).Select(x => x.First()).Where(d => d.ParentID == null);
        //        var dataa = data.Distinct();
        //        msg.Object = dataa;

        //        msg.Error = false;
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Title = _stringLocalizer["MGP_MSG_ADD_PARENT_GROUP_ERROR"]; //"Get Parent Group fail ";
        //    }

        //    return Json(msg);
        //}
        //[HttpPost]
        //public object gettreedataLevel()
        //{
        //    var msg = new JMessage { Error = true };

        //    try
        //    {
        //        var data = _context.ServiceCategoryGroups.GroupBy(x => x.Name).Select(x => x.First()).Where(d => d.ParentID == null).ToList();
        //        var dataa = data.Distinct();
        //        msg.Object = dataa;

        //        msg.Error = false;
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Title = _stringLocalizer["MGP_MSG_ADD_PARENT_GROUP_ERROR"]; //"Get Parent Group fail ";
        //    }

        //    return Json(msg);
        //}

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
