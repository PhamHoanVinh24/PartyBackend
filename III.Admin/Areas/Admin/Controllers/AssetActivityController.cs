using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using III.Domain.Enums;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class AssetActivityController : BaseController
    {
        public class AssetAtivitysJtableModel
        {
            public int ActivityId { get; set; }
            public string ActCode { get; set; }
            public string ActTitle { get; set; }
            public string ActType { get; set; }
            public string ActNote { get; set; }
            public string ActMember { get; set; }
        }

        private readonly EIMDBContext _context;
        private readonly IStringLocalizer<AssetActivityController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;

        public AssetActivityController(EIMDBContext context, IStringLocalizer<AssetActivityController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }
        [Breadcrumb("ViewData.CrumbAssetAct", AreaName = "Admin", FromAction = "Index", FromController = typeof(NomalListAssetHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuAsset"] = _sharedResources["COM_CRUMB_ASSET_OPERATION"];
            ViewData["CrumbNormalAssetHome"] = _sharedResources["COM_BREAD_CRUMB_COMMON_CATE"];
            ViewData["CrumbAssetAct"] = _sharedResources["COM_CRUMB_ASSET_ACTIVITY"];
            return View();
        }

        public class JTableModelAct : JTableModel
        {
            public string ActCode { get; set; }
            public string ActTitle { get; set; }
            public string ActType { get; set; }
            public string ActNote { get; set; }
        }

        #region combobox
        [HttpPost]
        public JsonResult GenReqCode()
        {
            var monthNow = DateTime.Now.Month;
            var yearNow = DateTime.Now.Year;
            var reqCode = string.Empty;
            var no = 1;
            var noText = "01";
            var data = _context.AssetAtivitys.Where(x => x.CreatedTime.Value.Year == yearNow && x.CreatedTime.Value.Month == monthNow).ToList();
            if (data.Count > 0)
            {
                no = data.Count + 1;
                if (no < 10)
                {
                    noText = "0" + no;
                }
                else
                {
                    noText = no.ToString();
                }
            }

            reqCode = string.Format("{0}{1}{2}{3}", "ACT_", "T" + monthNow + ".", yearNow + "_", noText);

            return Json(reqCode);
        }
        [HttpPost]
        public object GetActivityType()
        {
            var data = _context.CatWorkFlows.Where(x => !x.IsDeleted).Select(x => new { Code = x.WorkFlowCode, Name = x.Name }).ToList();
            return data;
        }
        //[HttpPost]
        //public object GetItem([FromBody] int id)
        //{
        //    var data = _context.AssetAtivitys.FirstOrDefault(x => x.ActivityId == id);
        //    return data;
        //}
        [HttpPost]
        public object GetItem(int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            var data = _context.AssetAtivitys.FirstOrDefault(x => x.ActivityId == id);
            if (data != null)
            {
                msg.Object = data;
            }
            return Json(msg);
        }

        [HttpPost]
        public object GetUser()
        {
            var query = _context.Users.Where(x => x.Active == true && x.UserType != 10).Select(x => new { x.Id, x.GivenName }).AsNoTracking().ToList();
            return query;
        }

        [HttpPost]
        public object GetAsset()
        {
            var data = _context.AssetMains.Select(x => new { Code = x.AssetCode, Name = x.AssetName}).ToList();            return data;
        }
        #endregion

        #region action
        [HttpPost]
        public object JTable([FromBody]JTableModelAct jTablePara)
        {
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = (from a in _context.AssetAtivitys
                         join b in _context.CatWorkFlows on a.ActType equals b.WorkFlowCode into b1
                         from b2 in b1.DefaultIfEmpty()
                         join c in _context.AssetMains on a.AssetCode equals c.AssetCode into c1
                         from c2 in c1.DefaultIfEmpty()
                             //join c in _context.AssetMains on a.TicketCode equals c.AssetCode into c1
                             //from c2 in c1.DefaultIfEmpty()
                         where (!a.IsDeleted) 
                            && (string.IsNullOrEmpty(jTablePara.ActCode) || a.ActCode.ToLower().Contains(jTablePara.ActCode.ToLower()))
                            && (string.IsNullOrEmpty(jTablePara.ActTitle) || a.ActTitle.ToLower().Contains(jTablePara.ActTitle.ToLower()))
                            && (string.IsNullOrEmpty(jTablePara.ActType) || a.ActType.ToLower().Equals(jTablePara.ActType.ToLower()))
                            && (string.IsNullOrEmpty(jTablePara.ActNote) || a.ActNote.ToLower().Contains(jTablePara.ActNote.ToLower()))
                         select new
                         {
                             a.ActivityId,
                             a.ActCode,
                             a.ActTitle,
                             Asset = c2.AssetName,
                             ActType = b2.Name,
                             a.ActNote,
                             a.ActMember,
                             
                         }).AsParallel();
            int count = query.Count();
            var data = query.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length);
            var jdata = JTableHelper.JObjectTable(data.ToList(), jTablePara.Draw, count, "ActivityId", "ActCode", "ActTitle", "Asset", "ActType", "ActNote", "ActMember");
            return Json(jdata);
        }
        
        

        [HttpPost]
        public JsonResult Insert([FromBody]AssetActivity data)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var checkExist = _context.AssetAtivitys.FirstOrDefault(x => x.ActCode.ToLower().Equals(data.ActCode.ToLower()));
                if (checkExist!=null)
                {
                    msg.Error = true;
                    //msg.Title = "Đã tồn tại mã hoạt động!";
                    msg.Title = _stringLocalizer["ASSETACTIVITY_MSG_CHECK_TICKET_ACTIVITY"];
                }
                else
                {
                    data.ActCode = data.ActCode;
                    data.ActTitle = data.ActTitle;
                    data.AssetCode = data.AssetCode;
                    data.ActMember = data.ActMember;
                    data.ActNote = data.ActNote;
                    data.CreatedBy = ESEIM.AppContext.UserName;
                    data.CreatedTime = DateTime.Now;
                    _context.AssetAtivitys.Add(data);
                    _context.SaveChanges();
                    //msg.Title = "Thêm hoạt động thành công";
                    msg.Title = _stringLocalizer["ASSETACTIVITY_MSG_ADD_ACTIVITY_SUCCESS"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi xảy ra khi thêm?";
                msg.Title = _sharedResources["COM_ERR_ADD"];
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult Update([FromBody]AssetActivity obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.AssetAtivitys.FirstOrDefault(x => x.ActivityId == obj.ActivityId);

                data.ActCode = obj.ActCode;
                data.ActTitle = obj.ActTitle;
                data.AssetCode = obj.AssetCode;
                data.ActMember = obj.ActMember;
                data.ActNote = obj.ActNote;
                
                data.UpdatedTime = DateTime.Now;
                data.UpdatedBy = ESEIM.AppContext.UserName;
               
                _context.AssetAtivitys.Update(data);
                _context.SaveChanges();
                //msg.Title = "Cập nhật hoạt động thành công";
                msg.Title = _stringLocalizer["ASSETACTIVITY_MSG_UPDATE_ACTIVITY_SUCCESS"];
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _stringLocalizer["ASSETACTIVITY_MSG_UPDATE_ACTIVITY_ERROR"];
                //msg.Title = "Có lỗi khi cập nhật hoạt động";
            }

            return Json(msg);
        }
        
        [HttpPost]
        public object Delete(int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.AssetAtivitys.FirstOrDefault(x => x.ActivityId == id);
                data.DeletedBy = ESEIM.AppContext.UserName;
                data.DeletedTime = DateTime.Now;
                data.IsDeleted = true;

                _context.AssetAtivitys.Update(data);
                _context.SaveChanges();
                //msg.Title = "Xóa thành công";
                msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_ERR_DELETE"];
                //msg.Title = "Có lỗi xảy ra khi xóa!";
                msg.Object = ex;
                return Json(msg);
            }
        }
        #endregion

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