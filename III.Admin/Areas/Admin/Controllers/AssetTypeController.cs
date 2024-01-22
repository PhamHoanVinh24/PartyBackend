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

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class AssetTypeController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IStringLocalizer<AssetTypeController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public AssetTypeController(EIMDBContext context, IStringLocalizer<AssetTypeController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }
        public IActionResult Index()
        {
            return View();
        }

        public class JTableModelAsset : JTableModel
        {
            public string CatCode { get; set; }
            public string CatName { get; set; }
            public int? CatParent { get; set; }
        }

        [HttpPost]
        public object JTable([FromBody]JTableModelAsset jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            string code = jTablePara.CatCode.ToLower();
            string name = jTablePara.CatName.ToLower();
            int? parent = jTablePara.CatParent;

            var query = from a in _context.AssetTypes
                        where (a.IsDeleted == false &&
                               a.CatCode.ToLower().Contains(code) &&
                               a.CatName.ToLower().Contains(name) &&
                               (parent == null || parent == a.CatParent))
                        select new
                        {
                            id = a.Id,
                            code = a.CatCode,
                            name = a.CatName,
                            description = a.Note
                        };
            int count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).AsNoTracking().ToList();
            var data1 = data.Skip(intBeginFor).Take(jTablePara.Length).ToList();
            var jdata = JTableHelper.JObjectTable(data1, jTablePara.Draw, count, "id", "code", "name", "description");
            return Json(jdata);
        }

        [HttpPost]
        public object Insert([FromBody]AssetType data)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var check = _context.AssetTypes.FirstOrDefault(x => x.CatCode == data.CatCode && !x.IsDeleted);
                if (check == null)
                {
                    data.CreatedBy = ESEIM.AppContext.UserName;
                    data.CreatedTime = DateTime.Now;

                    _context.AssetTypes.Add(data);
                    _context.SaveChanges();

                    msg.Title = String.Format(_sharedResources["COM_ADD_SUCCESS"], "");
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["MT_MSG_CODE_EXIST"], "");
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
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
                var data = _context.AssetTypes.FirstOrDefault(x => x.Id == id);
                data.IsDeleted = true;
                data.DeletedBy = ESEIM.AppContext.UserName;
                data.DeletedTime = DateTime.Now;

                _context.AssetTypes.Update(data);
                _context.SaveChanges();

                msg.Title = String.Format(_sharedResources["COM_DELETE_SUCCESS"], "");
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = String.Format(_stringLocalizer["COM_ERR_DELETE"));
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Object = ex;
                return Json(msg);
            }
        }
        [HttpPost]
        public object GetData(int id)
        {
            var data = _context.AssetTypes.FirstOrDefault(x => x.Id == id);
            return Json(data);
        }

        [HttpPost]
        public object Update([FromBody]AssetType data)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                data.UpdatedBy = ESEIM.AppContext.UserName;
                data.UpdatedTime = DateTime.Now;
                _context.AssetTypes.Update(data);
                _context.SaveChanges();

                msg.Title = String.Format(_sharedResources["COM_UPDATE_SUCCESS"], "");
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = String.Format(_stringLocalizer["COM_UPDATE_FAIL"));
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Object = ex;
                return Json(msg);
            }
        }

        [HttpPost]
        public object GetAllData()
        {
            var data = _context.AssetTypes.Where(x => !x.IsDeleted).Select(x => new { x.Id, Name = x.CatName }).AsNoTracking().ToList();
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