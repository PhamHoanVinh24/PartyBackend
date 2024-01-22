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
using Newtonsoft.Json.Linq;
using Microsoft.Extensions.Localization;
using SmartBreadcrumbs.Attributes;
using Microsoft.AspNetCore.Authorization;
using III.Domain.Common;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class MaterialProductGroupController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly AppSettings _appSettings;
        private readonly IStringLocalizer<MaterialProductGroupController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public class JTableModelCustom : JTableModel
        {
            public string Code { get; set; }
            public string Name { get; set; }
            public string ParentId { get; set; }
        }
        public MaterialProductGroupController(EIMDBContext context, IOptions<AppSettings> appSettings, IStringLocalizer<MaterialProductGroupController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _appSettings = appSettings.Value;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }
        [Breadcrumb("ViewData.CrumbProdGrp", AreaName = "Admin", FromAction = "Index", FromController = typeof(NomalListWareHouseHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuStore"] = _sharedResources["COM_CRUMB_MENU_STORE"];
            ViewData["CrumbNormalWHHome"] = _sharedResources["COM_BREAD_CRUMB_COMMON_CATE"];
            ViewData["CrumbProdGrp"] = _sharedResources["COM_CRUMB_PROD_GROUP"];
            return View("Index");
        }
        [HttpPost]
        public object JTable([FromBody]JTableModelCustom jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.MaterialProductGroups.Where(x => x.IsDeleted == false)
                            //join b in _context.cms_extra_fields_groups on a.Group equals b.Id
                            //orderby b.Name
                        join b in _context.MaterialProductGroups.Where(x => x.IsDeleted == false) on a.ParentID equals b.Id into b2
                        from b in b2.DefaultIfEmpty()
                        where (jTablePara.Code == null || jTablePara.Code == "" || a.Code.ToLower().Contains(jTablePara.Code.ToLower()))
                        && (jTablePara.Name == null || jTablePara.Name == "" || a.Name.ToString().ToLower().Contains(jTablePara.Name.ToLower()))
                        && (string.IsNullOrEmpty(jTablePara.ParentId) || (a.ParentID != null && a.ParentID == Int32.Parse(jTablePara.ParentId)))
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
        public JsonResult Insert([FromBody]MaterialProductGroup obj)
        {
            var msg = new JMessage { Title = "", Error = false };
            try
            {
                var exist = _context.MaterialProductGroups.FirstOrDefault(x => x.Code == obj.Code);
                if (exist != null)
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["MPG_MSG_MPG_CODE_ALREADY_EXIST"]);//"Mã nhóm vật tư đã tồn tại";
                }
                else
                {
                    obj.CreatedBy = ESEIM.AppContext.UserName;
                    obj.CreatedTime = DateTime.Now;
                    _context.MaterialProductGroups.Add(obj);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizer["MPG_LBL_MGP"];//"Thêm nhóm vật tư thành công";
                }
            }
            catch
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["MPG_MSG_ADD_ERROR"]); //"Thêm nhóm vật tư lỗi";
            }
            return Json(msg);
        }
        [HttpPost]
        public object Update([FromBody]MaterialProductGroup obj)
        {
            var msg = new JMessage();
            try
            {
                if (obj.ParentID == obj.Id)
                {
                    msg.Error = false;
                    msg.Title = String.Format("Cha nhóm sp không được trùng với nhóm sp"); //"Đã lưu thay đổi";

                    return msg;
                }
                obj.UpdatedTime = DateTime.Now.Date;
                _context.MaterialProductGroups.Update(obj);
                _context.SaveChanges();

                msg.Error = false;
                msg.Title = String.Format(_stringLocalizer["MPG_MSG_SAVE_SUCCESS"]); //"Đã lưu thay đổi";

                return msg;
            }
            catch
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["MPG_MSG_ERROR"]); //"Có lỗi xảy ra!";
                return msg;
            }
        }
        [HttpPost]
        public object Delete(int id)
        {
            var msg = new JMessage { Error = true };
            try
            {
                var data = _context.MaterialProductGroups.FirstOrDefault(x => x.Id == id);
                _context.MaterialProductGroups.Remove(data);
                _context.SaveChanges();
                msg.Error = false;
                msg.Title = String.Format(_stringLocalizer["MPG_MSG_DELETE_SUCCESS"]); //"Xóa thành công!";
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["MPG_MSG_DELETE_ERROR"]); //"Có lỗi khi xóa!";
                return Json(msg);
            }
        }
        public object GetItem(int id)
        {

            //if (id == null || id < 0)
            //{
            //    return Json("");
            //}
            var a = _context.MaterialProductGroups.AsNoTracking().Single(m => m.Id == id);
            return Json(a);
        }

        [AllowAnonymous]
        [HttpPost]
        public object GetProductGroupTypes()
        {
            return ListProdStrNoHelper.GetProductGroupTypes();
        }

        [AllowAnonymous]
        [HttpPost]
        public object GetTreeDataParent()
        {
            var msg = new JMessage { Error = true };

            try
            {
                var data = _context.MaterialProductGroups.Where(x => x.IsDeleted == false).OrderBy(x => x.Id).AsNoTracking();
                var dataOrder = GetSubTreeCategoryData(data.ToList(), null, new List<TreeViewResource>(), 0, 1);
                //return dataOrder;
                //var data = _context.MaterialProductGroups.GroupBy(x => x.Name).Select(x => x.First()).Where(d => d.ParentID == null);
                //var dataa = data.Distinct();
                msg.Object = dataOrder;

                msg.Error = false;
            }
            catch (Exception ex)
            {
                //msg.Title = "Get Parent Group fail ";
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }

            return Json(msg);
        }

        [AllowAnonymous]
        [HttpPost]
        public List<TreeViewResource> GetTreeInNode(string parentId)
        {
            var data = _context.MaterialProductGroups.Where(x => x.IsDeleted == false).OrderByDescending(x => x.Id).AsNoTracking();
            var tree = GetSubTreeCategoryData(data.ToList(), parentId, new List<TreeViewResource>(), 0, 2);
            return tree;
        }

        [NonAction]
        private List<TreeViewResource> GetSubTreeCategoryData(List<MaterialProductGroup> data, string parentId, List<TreeViewResource> lstCategories, int tab, int typeOrder)
        {
            //tab += "- ";
            var contents = string.IsNullOrEmpty(parentId)
                ? (typeOrder == 1 ? data.Where(x => x.ParentID == null).OrderBy(x => x.Id).AsParallel() : data.Where(x => x.ParentID == null).OrderByDescending(x => x.Id).AsParallel())
                : data.Where(x => x.ParentID?.ToString() == parentId).OrderByDescending(x => x.Id).AsParallel();
            foreach (var item in contents)
            {
                var category = new TreeViewResource
                {
                    Id = item.Id,
                    Code = item.Code,
                    Title = item.Name,
                    Level = tab,
                    HasChild = data.Any(x => x.ParentID == item.Id),
                    ParentCode = item.ParentID?.ToString(),
                };
                lstCategories.Add(category);
                if (category.HasChild) GetSubTreeCategoryData(data, item.Id.ToString(), lstCategories, tab + 1, 1);
            }
            return lstCategories;
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
