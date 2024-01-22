using System;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using III.Domain.Enums;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;
using static III.Admin.Controllers.ContractController;

namespace III.Admin.Controllers
{

    [Area("Admin")]
    public class JcObjectTypeController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<JcObjectTypeController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        

        public JcObjectTypeController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment, IStringLocalizer<JcObjectTypeController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _upload = upload;
            _hostingEnvironment = hostingEnvironment;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }
        [Breadcrumb("ViewData.Title", AreaName = "Admin", FromAction = "Index", FromController = typeof(SysTemSettingHomeController))]
        [AdminAuthorize]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuSystemSett"] = _sharedResources["COM_CRUMB_SYSTEM"];
            ViewData["CrumbSystemSettHome"] = _sharedResources["COM_CRUMB_SYSTEM_SETTING"];
            ViewData["Title"] = _sharedResources["COM_CRUMB_JC_OBJECT_TYPE"];
            return View();
        }

        #region Job Card Object Type
        public class JTableModelJcObjectType : JTableModel
        {
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string ObjTypeCode { get; set; }
            public string ObjTypeName { get; set; }
        }
        [HttpPost]
        public object JTable([FromBody]JTableModelJcObjectType jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            DateTime? fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            DateTime? toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var query = from a in _context.JcObjectTypes
                        where ((a.IsDeleted == false) &&
                              ((fromDate == null) || (a.CreatedTime.Date >= fromDate)) &&
                              ((toDate == null) || (a.CreatedTime.Date <= toDate)) &&
                              (string.IsNullOrEmpty(jTablePara.ObjTypeCode) || a.ObjTypeCode.ToLower().Contains(jTablePara.ObjTypeCode.ToLower()))
                              && (string.IsNullOrEmpty(jTablePara.ObjTypeName) || a.ObjTypeName.ToLower().Contains(jTablePara.ObjTypeName.ToLower())))
                        select new
                        {
                            a.ID,
                            a.ObjTypeCode,
                            a.ObjTypeName,
                            a.Note,
                            a.TableName,
                            a.ScriptLINQ,
                            a.ScriptSQL,
                            a.CreatedTime
                        };

            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "ID", "ObjTypeCode", "ObjTypeName", "Note", "TableName", "ScriptLINQ", "ScriptSQL", "CreatedTime");
            return Json(jdata);
        }
        [HttpPost]
        public JsonResult Insert([FromBody]JcObjectType obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var checkExist = _context.JcObjectTypes.FirstOrDefault(x => x.ObjTypeCode.Equals(obj.ObjTypeCode) && !x.IsDeleted);
                if (checkExist == null)
                {
                    var jcObjType = new JcObjectType
                    {
                        ObjTypeCode = obj.ObjTypeCode,
                        ObjTypeName = obj.ObjTypeName,
                        Note = obj.Note,
                        ScriptLINQ = obj.ScriptLINQ,
                        ScriptSQL = obj.ScriptSQL,
                        TableName = obj.TableName,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now,
                        IsDeleted = false
                    };
                    _context.JcObjectTypes.Add(jcObjType);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizer["JCOBJTYPE_MSG_ADD_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Mã loại đối tượng đã tồn tại";
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
        public JsonResult Update([FromBody]JcObjectType obj)
        {
            JMessage msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.JcObjectTypes.FirstOrDefault(x => !x.IsDeleted && x.ID == obj.ID);
                if (data != null)
                {
                    var checkCode = _context.JcObjectTypes.FirstOrDefault(x => x.ObjTypeCode.Equals(obj.ObjTypeCode));
                    if (checkCode != null)
                    {
                        data.ObjTypeName = obj.ObjTypeName;
                        data.ScriptLINQ = obj.ScriptLINQ;
                        data.ScriptSQL = obj.ScriptSQL;
                        data.TableName = obj.TableName;
                        data.Note = obj.Note;
                        data.UpdatedBy = ESEIM.AppContext.UserName;
                        data.UpdatedTime = DateTime.Now;
                        _context.JcObjectTypes.Update(data);
                        _context.SaveChanges();
                        msg.Title = "Cập nhật loại đối tượng thành công";
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = "Mã loại đối tượng không tồn tại";
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Không tìm thấy loại đối tượng";
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
        public JsonResult Delete(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.JcObjectTypes.FirstOrDefault(x => !x.IsDeleted && x.ID == id);
                if (data != null)
                {
                    data.IsDeleted = true;
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    _context.JcObjectTypes.Update(data);
                    _context.SaveChanges();
                    msg.Title = "Xóa loại đối tượng thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Không tìm thấy loại đối tượng cần xóa";
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
        public JsonResult GetItem(int Id)
        {
            var msg = new JMessage();
            var data = _context.JcObjectTypes.FirstOrDefault(x => x.ID == Id && !x.IsDeleted);
            if(data != null)
            {
                msg.Object = data;
            }
            else
            {
                msg.Error = true;
                msg.Title = "Không tìm thấy loại đối tượng";
            }
            return Json(msg);
        }
        #endregion

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new Newtonsoft.Json.Linq.JObject();
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