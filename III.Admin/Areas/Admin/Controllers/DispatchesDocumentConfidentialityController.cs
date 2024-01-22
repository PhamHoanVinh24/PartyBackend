using System;
using System.Collections.Generic;
using System.Linq;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using III.Domain.Enums;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class DispatchesDocumentConfidentialityController : BaseController
    {
        private readonly EIMDBContext _context;

        public DispatchesDocumentConfidentialityController(EIMDBContext context)
        {
            _context = context;
        }

        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public object JTable([FromBody]DocumentConfidentialityJtable jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.DispatchesCategorys
                        where a.IsDeleted == false
                        && (string.IsNullOrEmpty(jTablePara.Code) || a.Code.ToLower().Contains(jTablePara.Code.ToLower()))
                        && (string.IsNullOrEmpty(jTablePara.Name) || a.Name.ToLower().Contains(jTablePara.Name.ToLower()))
                        && a.Type == EnumHelper<DocumentTypeEnum>.GetDisplayValue(DocumentTypeEnum.DM)
                        select new
                        {
                            a.Id,
                            a.Code,
                            a.Name,
                            a.CreatedTime
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count,  "Id", "Code", "Name", "CreatedTime");
            return Json(jdata);
        }

        [HttpPost]
        public object GetItem([FromBody]int id)
        {
            JMessage msg = new JMessage() { Error = false };
            var item = _context.DispatchesCategorys.FirstOrDefault(x => x.Id == id && x.IsDeleted == false);
            msg.Object = item;
            if (item == null)
            {
                msg.Title = String.Format(CommonUtil.ResourceValue("DDC_ERR_COCUMENT_REFESH"));
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Insert([FromBody]CategoryModel obj)
        {
            var msg = new JMessage { Title = "", Error = false };
            try
            {
                var data = _context.DispatchesCategorys.FirstOrDefault(x => x.Code == obj.Code && x.Type == EnumHelper<DocumentTypeEnum>.GetDisplayValue(DocumentTypeEnum.DM) && x.IsDeleted == false);
                if (data == null)
                {
                    var dt = new DispatchesCategory();
                    dt.Code = obj.Code;
                    dt.Name = obj.Name;
                    dt.CreatedBy = ESEIM.AppContext.UserName;
                    dt.CreatedTime = DateTime.Now;
                    dt.IsDeleted = false;
                    dt.Type = EnumHelper<DocumentTypeEnum>.GetDisplayValue(DocumentTypeEnum.DM);
                    _context.DispatchesCategorys.Add(dt);
                    _context.SaveChanges();
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_ADD_SUCCESS"), CommonUtil.ResourceValue("DDC_MSG_TITLE_DDC"));
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("DDC_ERR_DOCUMENT_CODE"));
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_ADD_FAILED"), CommonUtil.ResourceValue("DDC_MSG_TITLE_DDC"));
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Update([FromBody]CategoryModel obj)
        {
            var msg = new JMessage { Title = "", Error = false };
            try
            {
                var item = _context.DispatchesCategorys.FirstOrDefault(x => x.Id == obj.Id && x.IsDeleted == false);
                if (item != null)
                {
                    var data = _context.DispatchesCategorys.FirstOrDefault(x => x.Code == obj.Code && x.IsDeleted == false && x.Type == EnumHelper<DocumentTypeEnum>.GetDisplayValue(DocumentTypeEnum.DM));
                    if (data == null || (data != null && data.Id == item.Id))
                    {
                        item.Code = obj.Code;
                        item.Name = obj.Name;
                        item.UpdatedTime = DateTime.Now;
                        item.UpdatedBy = ESEIM.AppContext.UserName;
                        _context.Update(item);
                        _context.SaveChanges();
                        msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_UPDATE_SUCCESS"), CommonUtil.ResourceValue("DDC_MSG_TITLE_DDC"));
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = String.Format(CommonUtil.ResourceValue("DDC_ERR_CODE_NOT_DDC"));
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("DDC_ERR_COCUMENT_REFESH"));
                }

            }
            catch
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_UPDATE_FAILED"), CommonUtil.ResourceValue("DDC_MSG_TITLE_DDC"));
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Delete([FromBody]List<Int32> ids)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                int success = 0;
                foreach (var item in ids)
                {
                    var data = _context.DispatchesCategorys.FirstOrDefault(x => x.Id == item);
                    var checkExistDispatches = _context.DispatchesHeaders.FirstOrDefault(x => x.Confidentiality == data.Code);
                    if (checkExistDispatches != null)
                    {
                        msg.Title = String.Format(CommonUtil.ResourceValue("DCD_ERR_DOCUMENT_EXIST"));
                    }
                    else
                    {
                        data.IsDeleted = true;
                        _context.Update(data);
                        _context.SaveChanges();
                        success++;
                    }
                }
                if (success != 0)
                {
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_SUCCESS"), CommonUtil.ResourceValue("DDC_MSG_TITLE_DDC"));
                }
                else
                {
                    msg.Error = true;
                }
            }
            catch (Exception ex)
            {
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_FAIL"), CommonUtil.ResourceValue("DDC_MSG_TITLE_DDC"));
                msg.Error = true;
            }
            return Json(msg);
        }
    }
    public class DocumentConfidentialityJtable : JTableModel
    {
        public string Code { get; set; }
        public string Name { get; set; }
        public string Type { get; set; }
        public string DateTo { get; set; }
    }
    public class CategoryModel
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
    }
}