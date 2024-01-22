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

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class CMSExtraFieldGroupController : BaseController
    {
        public class CMSExtraFieldGroupsJtableModel : JTableModel
        {
            public int id { get; set; }
            public string name { get; set; }
        }
        private readonly EIMDBContext _context;
        private readonly IStringLocalizer<CMSExtraFieldGroupController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public CMSExtraFieldGroupController(EIMDBContext context, IStringLocalizer<CMSExtraFieldGroupController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }
        public IActionResult Index()
        {
            return View();
        }

        public class JTableModelCMSExtraFieldGroup : JTableModel
        {
            //public int id { get; set; }
            public string name { get; set; }
        }

        #region combobox
        //[HttpPost]
        //public object GetActivityType()
        //{
        //    var data = _context.CommonSettings.Where(x => x.Group == EnumHelper<AssetEnum>.GetDisplayValue(AssetEnum.CMSManagementSlideType)).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
        //     return data;
        // }


        //[HttpPost]
        //public object GetUser()
        //{
        //    var query = _context.Users.Where(x => x.Active == true && x.UserType != 10).Select(x => new { x.Id, x.GivenName }).AsNoTracking().ToList();
        //    return query;
        //}

        //[HttpPost]
        //public object GetAsset()
        //{
        //    var data = _context.Assets.Select(x => new { Code = x.AssetCode, Name = x.AssetName }).AsNoTracking().ToList();
        //    return data;
        //}
        #endregion

        #region action

        [HttpPost]
        public object JTable([FromBody]JTableModelCMSExtraFieldGroup jTablePara)
        {
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.cms_extra_fields_groups
                        where ((string.IsNullOrEmpty(jTablePara.name) || (a.name.ToLower().Contains(jTablePara.name.ToLower()))))
                        select new CMSExtraFieldGroupsJtableModel
                        {
                            id = a.id,
                            name = a.name
                        };
            int count = query.Count();
            var data = query.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length);
            var jdata = JTableHelper.JObjectTable(data.ToList(), jTablePara.Draw, count, "id", "name");
            return Json(jdata);
        }

        [HttpPost]
        public object GetItem([FromBody] int id)
        {
            var data = _context.cms_extra_fields_groups.FirstOrDefault(x => x.id == id);
            return data;
        }

        [HttpPost]
        public JsonResult Insert([FromBody]cms_extra_fields_groups data)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var checkExist = _context.cms_extra_fields_groups.FirstOrDefault(x => x.name.ToLower() == data.name.ToLower());
                if (checkExist != null)
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_MSG_EXITS"], _stringLocalizer["CMS_EFG_MSG_EFG_NAME"]);   //Đã tồn tại tên Extra Group!
                }
                else
                {               
                    _context.cms_extra_fields_groups.Add(data);
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["CMS_EFG_MSG_EFG"]);   //Thêm Extra Group thành công

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
        public object Update([FromBody]cms_extra_fields_groups data)
        {
            var msg = new JMessage() { Error = false };
            try
            { 
                _context.cms_extra_fields_groups.Update(data);
                _context.SaveChanges();
                msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["CMS_EFG_MSG_EFG"]); //Cập nhật Extra Field Group thành công
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];

            }
            return Json(msg);
        }

        [HttpPost]
        public object Delete(int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.cms_extra_fields_groups.FirstOrDefault(x => x.id == id);            
                _context.cms_extra_fields_groups.Remove(data);
                _context.SaveChanges();
               // msg.Title = "Xóa thành công";
                msg.Title = String.Format(_sharedResources["COM_DELETE_SUCCESS"]);   //Có lỗi xảy ra khi cập nhật!

                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                // msg.Title = "Có lỗi xảy ra khi xóa!";
                msg.Title = _sharedResources["COM_MSG_ERR"];

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
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
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