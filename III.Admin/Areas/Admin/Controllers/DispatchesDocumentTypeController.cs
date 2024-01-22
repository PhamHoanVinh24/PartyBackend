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
    public class DispatchesDocumentTypeController : BaseController
    {
        private readonly EIMDBContext _context;

        public DispatchesDocumentTypeController(EIMDBContext context)
        {
            _context = context;
        }
        public IActionResult Index()
        {
            return View();
        }
        [HttpPost]
        public object JTable([FromBody]DocumentTypeModel jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.DispatchesCategorys
                        where a.IsDeleted == false
                         && (string.IsNullOrEmpty(jTablePara.Code) || a.Code.ToLower().Contains(jTablePara.Code.ToLower()))
                        && (string.IsNullOrEmpty(jTablePara.Name) || a.Name.ToLower().Contains(jTablePara.Name.ToLower()))
                        && a.Type == EnumHelper<DocumentTypeEnum>.GetDisplayValue(DocumentTypeEnum.LVB)
                        select new
                        {
                            a.Id,
                            a.Code,
                            a.Name,
                            a.ExpriedProcess,
                            a.CreatedTime
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "Code", "Name", "ExpriedProcess", "CreatedTime");
            return Json(jdata);
        }
        [HttpPost]
        public object GetItem([FromBody]int id)
        {
            JMessage msg = new JMessage() { Error = false };
            var item = _context.DispatchesCategorys.FirstOrDefault(x => x.Id == id && x.IsDeleted == false);
            msg.Object = item;
            return Json(msg);
        }
        [HttpPost]
        public JsonResult Insert([FromBody]DocumentTypeModel obj)
        {
            var msg = new JMessage { Title = "", Error = false };
            try
            {
                var data = _context.DispatchesCategorys.FirstOrDefault(x => x.Code == obj.Code && x.Type == EnumHelper<DocumentTypeEnum>.GetDisplayValue(DocumentTypeEnum.LVB) && x.IsDeleted == false);
                if (data == null)
                {
                    var dt = new DispatchesCategory();
                    dt.Code = obj.Code;
                    dt.Name = obj.Name;
                    dt.CreatedBy = ESEIM.AppContext.UserName;
                    dt.CreatedTime = DateTime.Now;
                    dt.IsDeleted = false;
                    dt.Type = EnumHelper<DocumentTypeEnum>.GetDisplayValue(DocumentTypeEnum.LVB);
                    dt.ExpriedProcess = obj.ExpriedProcess;
                    _context.DispatchesCategorys.Add(dt);
                    _context.SaveChanges();
                    msg.Title = String.Format(CommonUtil.ResourceValue("DDT_MSG_ADD_DOCUMENT_TYPE_SUCCESS"));//"Thêm loại văn bản thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("DDT_MSG_ID_ALREADY_EXIST"));//"Loại văn bản này đã tồn tại, vui lòng nhập mã khác!";
                }
            }
            catch
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("DDT_MSG_ADD_DOCUMENT_TYPE_ERROR"));//"Thêm loại văn bản bị lỗi!";
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult Update([FromBody]DocumentTypeModel obj)
        {
            var msg = new JMessage { Title = "", Error = false };
            try
            {
                var item = _context.DispatchesCategorys.FirstOrDefault(x => x.Id == obj.Id && x.IsDeleted == false);
                if (item != null)
                {
                    var data = _context.DispatchesCategorys.FirstOrDefault(x => x.Code == obj.Code && x.IsDeleted == false && x.Type == EnumHelper<DocumentTypeEnum>.GetDisplayValue(DocumentTypeEnum.LVB));
                    if (data == null || (data != null && data.Id == item.Id))
                    {
                        item.Code = obj.Code;
                        item.Name = obj.Name;
                        item.ExpriedProcess = obj.ExpriedProcess;
                        item.UpdatedTime = DateTime.Now;
                        item.UpdatedBy = ESEIM.AppContext.UserName;
                        _context.Update(item);
                        _context.SaveChanges();
                        msg.Title = String.Format(CommonUtil.ResourceValue("DDT_MSG_UPDATE_SUCCESS"));//"Cập nhập loại văn bản thành công";
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = String.Format(CommonUtil.ResourceValue("DDT_MSG_ID_HAS_BEEN_USED"));//"Mã loại văn bản đã dùng cho loại văn bản trọng khác, vui lòng thử lại!";
                    }

                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("DDT_MSG_DOCUMENT_TYPE_NOT_EXIST"));//"Loại văn bản không tồn tại, vui lòng làm mới trang";
                }

            }
            catch
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("DDT_MSG_UPDATE_DOCUMENT_TYPE_ERROR"));//"Cập nhập loại văn bản bị lỗi!";
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
                    var checkExistDispatches = _context.DispatchesCategorys.FirstOrDefault(x => x.Type == EnumHelper<DocumentTypeEnum>.GetDisplayValue(DocumentTypeEnum.SVB) && x.TypeM == data.Code && !x.IsDeleted);
                    if (checkExistDispatches != null)
                    {
                        msg.Title = String.Format(CommonUtil.ResourceValue("DDT_MSG_DT_ALREADY_EXIST_IN_DT"));//"Loại văn bản đã tồn tại trong sổ văn bản!";
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
                    msg.Title = String.Format(CommonUtil.ResourceValue("DDT_MSG_DELETE_SUCCESS")) + success + "/" + ids.Count + CommonUtil.ResourceValue("DDT_MSG_DOCUMENT_TYPE");
                }
                else
                {
                    msg.Error = true;
                }
            }
            catch (Exception ex)
            {
                msg.Title = String.Format(CommonUtil.ResourceValue("DDT_MSG_DELETE_ERROR"));//"Xóa loại văn bản lỗi";
                msg.Error = true;
            }
            return Json(msg);
        }
    }
    public class DocumentTypeModel : JTableModel
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public int ExpriedProcess { get; set; }
    }
}