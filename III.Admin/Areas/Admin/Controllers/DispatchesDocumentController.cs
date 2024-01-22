using System;
using System.Collections.Generic;
using System.Data;
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
    public class DispatchesDocumentController : BaseController
    {
        private readonly EIMDBContext _context;

        public DispatchesDocumentController(EIMDBContext context)
        {
            _context = context;
        }
        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public object JTable([FromBody]DocumentModel jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.DispatchesCategorys
                        join b in _context.DispatchesCategorys on a.TypeM equals b.Code into b2
                        from b1 in b2.DefaultIfEmpty()
                        where a.IsDeleted == false
                        && (string.IsNullOrEmpty(jTablePara.Code) || a.Code.ToLower().Contains(jTablePara.Code.ToLower()))
                        && (string.IsNullOrEmpty(jTablePara.Name) || a.Name.ToLower().Contains(jTablePara.Name.ToLower()))
                        && ((jTablePara.Year == null) || (a.Year.Equals(jTablePara.Year)))
                        && (a.Type == EnumHelper<DocumentTypeEnum>.GetDisplayValue(DocumentTypeEnum.SVB))
                        select new DocumentRes
                        {
                            Id = a.Id,
                            Code = a.Code,
                            Name = a.Name,
                            DocumentType = a.DocumentType,
                            NumberCreator = a.NumberCreator,
                            DocumentSymbol = a.DocumentSymbol,
                            CreatedTime = a.CreatedTime,
                            Type = b1 != null ? b1.Name : ""
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "Code", "Name", "DocumentType", "NumberCreator", "DocumentSymbol", "CreatedTime", "Type");
            return Json(jdata);
        }


        [HttpPost]
        public object GetItem([FromBody]int id)
        {
            var msg = new JMessage() { Error = false };



            var query = (from a in _context.DispatchesCategorys
                         join b in _context.DispatchesCategorys on a.TypeM equals b.Code into b2
                         from b1 in b2.DefaultIfEmpty()
                         where a.Id == id
                         select new CategoryRes
                         {
                             Id = a.Id,
                             Code = a.Code,
                             Name = a.Name,
                             NumberCreator = a.NumberCreator,
                             Type = a.Type,
                             TypeM = a.TypeM,
                             DocumentSymbol = a.DocumentSymbol,
                             TypeMS = (b1 != null ? b1.Name : "")
                         }).FirstOrDefault();
            msg.Object = query;
            return Json(msg);
        }

        [HttpPost]
        public object GetLoaiVanBan()
        {
            JMessage msg = new JMessage() { Error = false };
            var item = _context.DispatchesCategorys.Where(x => x.IsDeleted == false && x.Type == "LVB").ToList();
            msg.Object = item;
            return Json(msg);
        }
        [HttpPost]
        public JsonResult Insert([FromBody]DocumentModel obj)
        {
            var msg = new JMessage { Title = "", Error = false };
            try
            {
                var data = _context.DispatchesCategorys.FirstOrDefault(x => x.Code == obj.Code && x.Type == EnumHelper<DocumentTypeEnum>.GetDisplayValue(DocumentTypeEnum.SVB) && x.IsDeleted == false);
                if (data == null)
                {
                    var dt = new DispatchesCategory();
                    dt.Code = obj.Code;
                    dt.Name = obj.Name;
                    dt.CreatedBy = ESEIM.AppContext.UserName;
                    dt.CreatedTime = DateTime.Now;
                    dt.IsDeleted = false;
                    dt.Type = EnumHelper<DocumentTypeEnum>.GetDisplayValue(DocumentTypeEnum.SVB);
                    dt.DocumentType = obj.DocumentType;
                    dt.NumberCreator = obj.NumberCreator;
                    dt.DocumentSymbol = obj.DocumentSymbol;
                    dt.IsYearBefore = obj.IsYearBefore;
                    dt.Year = DateTime.Now.Year;
                    dt.TypeM = obj.TypeM;
                    _context.DispatchesCategorys.Add(dt);
                    _context.SaveChanges();
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_ADD_SUCCESS"), CommonUtil.ResourceValue("DCD_MSG_TITLE_DCD"));
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("DCD_MSG_DOCUMENT_NOT"));
                }
            }
            catch
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_ADD_FAILED"), CommonUtil.ResourceValue("DCD_MSG_TITLE_DCD"));
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult Update([FromBody]DocumentModel obj)
        {
            var msg = new JMessage { Title = "", Error = false };
            try
            {
                var dt = _context.DispatchesCategorys.FirstOrDefault(x => x.Id == obj.Id && x.IsDeleted == false);
                if (dt != null)
                {
                    var data = _context.DispatchesCategorys.FirstOrDefault(x => x.Code == obj.Code && x.IsDeleted == false && x.Type == EnumHelper<DocumentTypeEnum>.GetDisplayValue(DocumentTypeEnum.SVB));
                    if (data == null || (data != null && data.Id == dt.Id))
                    {
                        dt.Code = obj.Code;
                        dt.Name = obj.Name;
                        dt.CreatedBy = ESEIM.AppContext.UserName;
                        dt.CreatedTime = DateTime.Now;
                        dt.IsDeleted = false;
                        dt.DocumentType = obj.DocumentType;
                        dt.NumberCreator = obj.NumberCreator;
                        dt.DocumentSymbol = obj.DocumentSymbol;
                        dt.IsYearBefore = obj.IsYearBefore;
                        dt.TypeM = obj.TypeM;
                        _context.DispatchesCategorys.Update(dt);
                        _context.SaveChanges();
                        msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_UPDATE_SUCCESS"), CommonUtil.ResourceValue("DCD_MSG_TITLE_DCD"));
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = String.Format(CommonUtil.ResourceValue("DCD_ERR_CODE_NOT_DC"));
                    }

                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("DCD_ERR_COCUMENT_NOT"));
                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_UPDATE_FAILED"), CommonUtil.ResourceValue("DCD_MSG_TITLE_DCD"));
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult Delete([FromBody]List<int> ids)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                int success = 0;
                foreach (var item in ids)
                {
                    var data = _context.DispatchesCategorys.FirstOrDefault(x => x.Id == item);
                    var checkExistDispatches = _context.DispatchesHeaders.FirstOrDefault(x => x.DocumentCode == data.Code);
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
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_SUCCESS"), CommonUtil.ResourceValue("DCD_MSG_TITLE_DCD"));
                }
                else
                {
                    msg.Error = true;
                }
            }
            catch (Exception ex)
            {
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_FAIL"), CommonUtil.ResourceValue("DCD_MSG_TITLE_DCD"));
                msg.Error = true;
            }
            return Json(msg);
        }

        [HttpPost]
        public object GetYear()
        {
            var query = _context.DispatchesCategorys.Where(x => x.Type == EnumHelper<DocumentTypeEnum>.GetDisplayValue(DocumentTypeEnum.SVB)).Select(x => x.Year).Distinct();
            return query;
        }
    }
    public class DocumentModel : JTableModel
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public int? Year { get; set; }
        public string DocumentType { get; set; }
        public int NumberCreator { get; set; }
        public bool IsYearBefore { get; set; }
        public string DocumentSymbol { get; set; }
        public string TypeM { get; set; }
    }
    public class CategoryRes
    {
        public int Id { get; set; }

        public string Code { get; set; }
        public string Name { get; set; }

        public string Type { get; set; }
        public string DocumentType { get; set; }

        public int NumberCreator { get; set; }


        public string DocumentSymbol { get; set; }


        public string TypeM { get; set; }
        public string TypeMS { get; set; }
    }
    public class DocumentRes
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public string DocumentType { get; set; }
        public int NumberCreator { get; set; }
        public string DocumentSymbol { get; set; }
        public DateTime CreatedTime { get; set; }
        public string Type { get; set; }
    }
}