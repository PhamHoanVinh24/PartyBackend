using ESEIM.Models;
using ESEIM.Utils;

using FTU.Utils.HelperNet;
using III.Admin.Controllers;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class RMVayxeCatSevicesController : BaseController
    {
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly EIMDBContext _context;
        private readonly IActionLogService _actionLog;
        public RMVayxeCatSevicesController(EIMDBContext context, IHostingEnvironment hostingEnvironment, IActionLogService actionLog)
        {
            _context = context;
            _hostingEnvironment = hostingEnvironment;
            _actionLog = actionLog;
        }
        public class JTableModelCustom : JTableModel
        {
            public string Key { get; set; }
        }

        public IActionResult Index()
        {
            ViewData["Message"] = String.Format(CommonUtil.ResourceValue("RMVCS_MSG_TITLE_CATEGORY"));
            return View("Index");
        }

        [HttpPost]
        public object JTable([FromBody]JTableModelCustom jTablePara)
        {

            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.RmVayxeCatSevicess
                        where a.Flag == 1 && (jTablePara.Key == null || jTablePara.Key == "" || a.ServiceName.ToLower().Contains(jTablePara.Key.ToLower()) || a.ServiceCode.ToLower().Contains(jTablePara.Key.ToLower()))
                        select new
                        {
                            Id = a.Id,
                            service_code = a.ServiceCode,
                            service_name = a.ServiceName,
                            created_time = a.CreatedTime,
                            note = a.Note
                        };

            var count = query.Count();
            var data = query
                .OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "service_code", "service_name", "created_time", "note");
            return Json(jdata);
        }


        public async Task<JsonResult> Insert(RmVayxeCatSevices obj, IFormFile illustrator_img)
        {
            var msg = new JMessage() { Error = false, ID = 1 };
            try
            {
                var rs = _context.RmVayxeCatSevicess.FirstOrDefault(x => x.ServiceCode == obj.ServiceCode);
                if (rs == null)
                {

                    var icillustrator_img = "";

                    if (illustrator_img != null && illustrator_img.Length > 0)
                    {
                        var pathUpload = Path.Combine(_hostingEnvironment.WebRootPath, "uploads\\images");
                        if (!Directory.Exists(pathUpload)) Directory.CreateDirectory(pathUpload);

                        var fileName = DateTimeOffset.Now.ToUnixTimeMilliseconds() + illustrator_img.FileName;
                        var filePath = Path.Combine(pathUpload, fileName);
                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            await illustrator_img.CopyToAsync(stream);
                        }
                        icillustrator_img = "/uploads/images/" + fileName;
                    }
                    if (icillustrator_img != "")
                    {
                        obj.IllustratorImg = icillustrator_img;
                    }

                    obj.Status = 1;
                    obj.CreatedTime = DateTime.Now;
                    obj.Flag = 1;
                    _context.RmVayxeCatSevicess.Add(obj);
                    _context.SaveChanges();

                    msg.Title = String.Format(CommonUtil.ResourceValue("RMVCS_MSG_ADD_SERVICE_SUCCESS"));
                    msg.Error = false;
                    _actionLog.InsertActionLog("Vayxe_Cat_Sevices", "Insert new Sevices successfully", null, obj, "Insert");
                }
                else
                {

                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_EXITS"), CommonUtil.ResourceValue("COM_TITLE_CODE"));
                    msg.Error = true;
                }
            }
            catch (Exception ex)
            {
                msg.ID = 0;
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(CommonUtil.ResourceValue("RMVCS_MSG_ERR_ADD_CATEGORY"));
                _actionLog.InsertActionLog("Vayxe_Cat_Sevices", "Insert new Sevices fail", null, obj, "Insert");
            }
            return Json(msg);
        }

        [HttpGet]
        public object GetItem(int? id)
        {

            if (id == null || id < 0)
            {
                return Json("");
            }
            var a = _context.RmVayxeCatSevicess.AsNoTracking().Single(m => m.Id == id);

            return Json(a);
        }

        public async Task<JsonResult> Update(RmVayxeCatSevices obj, IFormFile illustrator_img)
        {
            var msg = new JMessage() { Error = false, ID = 1 };
            try
            {
                var rs = _context.RmVayxeCatSevicess.FirstOrDefault(x => x.Id == obj.Id);
                if (rs != null)
                {
                    if (_context.RmVayxeCatSevicess.FirstOrDefault(x => x.ServiceCode == obj.ServiceCode && x.Id != rs.Id) != null)
                    {

                        msg.Title = String.Format(CommonUtil.ResourceValue("RMVCS_MSG_EXITS"));
                        msg.Error = true;
                        return Json(msg);

                    }
                    var icillustrator_img = "";

                    if (illustrator_img != null && illustrator_img.Length > 0)
                    {
                        var pathUpload = Path.Combine(_hostingEnvironment.WebRootPath, "uploads\\images");
                        if (!Directory.Exists(pathUpload)) Directory.CreateDirectory(pathUpload);

                        var fileName = DateTimeOffset.Now.ToUnixTimeMilliseconds() + illustrator_img.FileName;
                        var filePath = Path.Combine(pathUpload, fileName);
                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            await illustrator_img.CopyToAsync(stream);
                        }
                        icillustrator_img = "/uploads/images/" + fileName;
                    }
                    if (icillustrator_img != "")
                    {
                        rs.IllustratorImg = icillustrator_img;
                    }

                    rs.ServiceCode = obj.ServiceCode;
                    rs.ServiceName = obj.ServiceName;
                    rs.ServiceGroup_id = obj.ServiceGroup_id;
                    rs.ServiceTypeId = obj.ServiceTypeId;
                    rs.Note = obj.Note;
                    rs.Status = 1;
                    rs.Flag = 1;
                    rs.UpdatedTime = DateTime.Now;
                    _context.RmVayxeCatSevicess.Update(rs);
                    _context.SaveChanges();
                    msg.Title = String.Format(CommonUtil.ResourceValue("RMVCS_MSG_EDIT_SERVICE_SUCCESS"));
                    msg.Error = false;
                    _actionLog.InsertActionLog("Vayxe_Cat_Sevices", "update Sevices successfully", rs, obj, "Update");
                }
                else
                {
                    msg.Title = String.Format(CommonUtil.ResourceValue("RMVCS_MSG_NOT_FIND_CATEGORY"));
                    msg.Error = true;
                }


            }
            catch (Exception ex)
            {
                msg.ID = 0;
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(CommonUtil.ResourceValue("RMVCS_MSG_ERR_EDIT_CATEGORY"));
                _actionLog.InsertActionLog("Vayxe_Cat_Sevices", "update Sevices fail", null, obj, "Update");
            }
            return Json(msg);
        }


        [HttpPost]
        public object Delete(int id)
        {
            var msg = new JMessage { Error = true };
            try
            {
                var data = _context.RmVayxeCatSevicess.FirstOrDefault(x => x.Id == id);
                data.Flag = 0;
                _context.RmVayxeCatSevicess.Update(data);
                _context.SaveChanges();
                msg.Error = false;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_DELETE_SUCCESS"));
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_DELETE"));
                return Json(msg);
            }
        }


        [HttpPost]
        public object DeleteItems([FromBody]List<int> listIdI)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                foreach (var id in listIdI)
                {
                    var obj = _context.RmVayxeCatSevicess.FirstOrDefault(x => x.Id == id);
                    if (obj != null)
                    {
                        obj.Flag = 0;
                        _context.RmVayxeCatSevicess.Update(obj);
                        _context.SaveChanges();
                    }
                }
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_DELETE_SUCCESS"));
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(CommonUtil.ResourceValue("MSG_DELETE_LIST_FAIL"), CommonUtil.ResourceValue("RESOURCE"));
            }
            return Json(msg);
        }
    }
}