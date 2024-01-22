using ESEIM.Models;
using ESEIM.Utils;
using ESEIM;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Options;
using Newtonsoft.Json.Linq;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System;
using System.Globalization;
using FTU.Utils.HelperNet;
using System.Collections.Generic;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class CheckProductQualityController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IActionLogService _actionLog;
        private readonly AppSettings _appSettings;
        private readonly IUploadService _upload;
        private readonly IStringLocalizer<CheckProductQualityController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;

        public CheckProductQualityController(EIMDBContext context, IUploadService upload, IOptions<AppSettings> appSettings, IActionLogService actionLog, IStringLocalizer<CheckProductQualityController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {

            _context = context;
            _actionLog = actionLog;
            _appSettings = appSettings.Value;
            _upload = upload;
            _sharedResources = sharedResources;
            _stringLocalizer = stringLocalizer;
        }

        public IActionResult Index()
        {
            return View("Index");
        }

        public class JTableModelHeader : JTableModel
        {
            public string Keyword { get; set; }
            public string Status { get; set; }
            public string TicketCreator { get; set; }
        }

        public JsonResult JTableHeader([FromBody] JTableModelHeader jTablePara)
        {
            try
            {
                int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;

                var query = from a in _context.ProductQualityInspectionImps
                            join b in _context.HREmployees on a.TicketCreator equals b.employee_code into ab
                            from creator in ab.DefaultIfEmpty()
                            join c in _context.CommonSettings on a.Status equals c.CodeSet into ac
                            from status in ac.DefaultIfEmpty()
                            join d in _context.HREmployees on a.Excuter equals d.employee_code into ad
                            from excuter in ab.DefaultIfEmpty()
                            join e in _context.HREmployees on a.Checker equals e.employee_code into ae
                            from checker in ab.DefaultIfEmpty()
                            where (string.IsNullOrEmpty(jTablePara.Keyword)
                            || (!string.IsNullOrEmpty(a.TicketTitle) && a.TicketTitle.Contains(jTablePara.Keyword))
                            || (string.IsNullOrEmpty(jTablePara.Status) || a.Status == jTablePara.Status)
                            || (string.IsNullOrEmpty(jTablePara.TicketCreator) || a.TicketCreator == jTablePara.TicketCreator))
                            orderby a.Id descending
                            select new
                            {
                                a.Id,
                                a.TicketTitle,
                                TicketCreator = creator.fullname,
                                a.TicketCreateTime,
                                Status = status.ValueSet,
                                Excuter = excuter.fullname,
                                Checker = checker.fullname,
                                a.Noted
                            };

                var count = query.Count();
                var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "TicketTitle", "TicketCreator", "TicketCreateTime", "Status", "Excuter", "Checker", "Noted");
                return Json(jdata);
            }
            catch (Exception ex)
            {
                var jdata = JTableHelper.JObjectTable(null, jTablePara.Draw, 0, "Id", "TicketTitle", "TicketCreator", "TicketCreateTime", "Status", "Excuter", "Checker", "Noted");
                return Json(jdata);
            }
        }

        public class JTableModelDetail : JTableModel
        {
            public string QcTicketCode { get; set; }
        }

        public JsonResult JTable([FromBody] JTableModelDetail jTablePara)
        {
            try
            {
                int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;

                var query = from a in _context.ProductQualityInspectionImpDetails
                            join b in _context.CommonSettings on a.Unit equals b.CodeSet into ab
                            from QcComU in ab.DefaultIfEmpty()
                            join c in _context.CommonSettings on a.FacilitySpect equals c.CodeSet into ac
                            from QcComSpect in ac.DefaultIfEmpty()
                            where a.QcTicketCode == jTablePara.QcTicketCode
                            orderby a.Id descending
                            select new
                            {
                                a.Id,
                                a.ProdCodeLst,
                                a.ReceivedDate,
                                a.CheckingDate,
                                a.DeliveryNo,
                                FacilitySpect = QcComSpect.ValueSet ?? string.Empty,
                                a.Quantity,
                                Unit = QcComU.ValueSet ?? string.Empty,
                                Results = QcComSpect.ValueSet ?? string.Empty,
                                a.Content,
                            };

                var count = query.Count();
                var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "ProdCodeLst", "ReceivedDate", "CheckingDate", "DeliveryNo", "FacilitySpect", "Quantity", "Unit", "Results", "Content");
                return Json(jdata);
            }
            catch (Exception ex)
            {
                var jdata = JTableHelper.JObjectTable(null, jTablePara.Draw, 0, "Id", "ProdCodeLst", "ReceivedDate", "CheckingDate", "DeliveryNo", "FacilitySpect", "Quantity", "Unit", "Results", "Content");
                return Json(jdata);
            }
        }

        public JsonResult JTable2([FromBody] JTableModelAttr jTablePara)
        {
            try
            {
                int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;

                var query = from d in _context.AttrSetups
                            join e in _context.CommonSettings on d.AttrUnit equals e.CodeSet into de
                            from AtCom in de.DefaultIfEmpty()
                            where (d.AttrGroup.Contains("CARD_DATA_LOGGER20231009095503")) && (jTablePara.Attr.Contains(d.AttrCode))
                            orderby d.ID descending
                            select new
                            {
                                d.ID,
                                d.AttrCode,
                                AttrUnit = AtCom.ValueSet ?? string.Empty,
                            };

                var count = query.Count();
                var data = query.Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "AttrCode", "AttrUnit");
                return Json(jdata);
            }
            catch (Exception ex)
            {
                var jdata = JTableHelper.JObjectTable(null, jTablePara.Draw, 0, "Id", "AttrCode", "AttrUnit");
                return Json(jdata);
            }
        }

        public class ModelAttr : JTableModel
        {
            public int Id { get; set; }
        }

        public JsonResult JTableAttr([FromBody] ModelAttr jTablePara)
        {
            try
            {
                int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;

                var query = from a in _context.ProductQualityInspectionAttrs
                             join b in _context.AttrSetups on a.AttrCode equals b.AttrCode into ab
                             from attr in ab.DefaultIfEmpty()
                             join c in _context.CommonSettings on a.Unit equals c.CodeSet into ac
                             from unit in ac.DefaultIfEmpty()
                             where a.ProductQualityInspectionId == jTablePara.Id && a.IsDeleted != true
                             orderby a.Id descending
                             select new
                             {
                                 a.Id,
                                 a.AttrCode,
                                 Name = attr.AttrName,
                                 a.Value,
                                 AttrUnit = unit.ValueSet ?? string.Empty
                             };

                var count = query.Count();
                var data = query.Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "AttrCode", "Name", "Value", "AttrUnit");
                return Json(jdata);
            }
            catch (Exception ex)
            {
                var jdata = JTableHelper.JObjectTable(null, jTablePara.Draw, 0, "Id", "AttrCode", "Name", "Value", "AttrUnit");
                return Json(jdata);
            }
        }

        public class ModelRequestPQII
        {
            public string QcTicketCode { get; set; }
            public string TicketTitle { get; set; }
            public string TicketCreator { get; set; }
            public string TicketCreateTime { get; set; }
            public string Status { get; set; }
            public string Excuter { get; set; }
            public string Checker { get; set; }
            public string Noted { get; set; }
        }

        [HttpPost]
        public async Task<IActionResult> CreateTicket([FromBody] ModelRequestPQII request)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var ticketCreateTime = !string.IsNullOrEmpty(request.TicketCreateTime) ?
                    DateTime.ParseExact(request.TicketCreateTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                if ((string.IsNullOrWhiteSpace(request.TicketTitle) || request.TicketTitle == "") 
                    || ( string.IsNullOrWhiteSpace(request.Status) || request.Status == "")
                    || ( string.IsNullOrWhiteSpace(request.TicketCreator) || request.TicketCreator == "")
                    || ( string.IsNullOrWhiteSpace(request.TicketCreateTime) || request.TicketCreateTime == ""))
                {
                    msg.Error = true;
                    msg.Title = "Thiếu một số trường dữ liệu quang trọng!!!";
                    return Ok(msg);
                }
                var _ticket = new ProductQualityInspectionImp()
                {
                    QcTicketCode = "QC_TK_" + request.QcTicketCode,
                    TicketTitle = request.TicketTitle,
                    TicketCreator = request.TicketCreator,
                    TicketCreateTime = ticketCreateTime,
                    Status = request.Status,
                    Excuter = request.Excuter,
                    Checker = request.Checker,
                    Noted = request.Noted,
                };

                _context.ProductQualityInspectionImps.Add(_ticket);
                await _context.SaveChangesAsync();
                msg.Title = "Tạo phiếu thành công";
                return Ok(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = ex.ToString();
                return Ok(msg);
            }
        }

        [HttpPost]
        public async Task<object> GetTicket(int id)
        {
            var data = await _context.ProductQualityInspectionImps.FirstOrDefaultAsync(pq => pq.Id == id);

            return data;
        }

        [HttpPost]
        public async Task<IActionResult> UpdateTicket(int id, [FromBody] ModelRequestPQII request)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var ticketCreateTime = !string.IsNullOrEmpty(request.TicketCreateTime) ?
                    DateTime.ParseExact(request.TicketCreateTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                if ((string.IsNullOrWhiteSpace(request.TicketTitle) || request.TicketTitle == "")
                    || (string.IsNullOrWhiteSpace(request.Status) || request.Status == "")
                    || (string.IsNullOrWhiteSpace(request.TicketCreator) || request.TicketCreator == "")
                    || (string.IsNullOrWhiteSpace(request.TicketCreateTime) || request.TicketCreateTime == ""))
                {
                    msg.Error = true;
                    msg.Title = "Thiếu một số trường dữ liệu quang trọng!!!";
                    return Ok(msg);
                }
                var _ticket = _context.ProductQualityInspectionImps.FirstOrDefault(pq => pq.Id == id);
                _ticket.TicketTitle = request.TicketTitle;
                _ticket.TicketCreator = request.TicketCreator;
                _ticket.TicketCreateTime = ticketCreateTime;
                _ticket.Status = request.Status;
                _ticket.Excuter = request.Excuter;
                _ticket.Checker = request.Checker;
                _ticket.Noted = request.Noted;

                _context.ProductQualityInspectionImps.Update(_ticket);
                await _context.SaveChangesAsync();
                msg.Title = "Cập nhật phiếu thành công";
                return Ok(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = ex.ToString();
                return Ok(msg);
            }
        }

        [HttpPost]
        public async Task<IActionResult> DeleteTicket(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var _ticket = _context.ProductQualityInspectionImps.FirstOrDefault(pq => pq.Id == id);

                _context.ProductQualityInspectionImps.Remove(_ticket);
                await _context.SaveChangesAsync();
                msg.Title = "Xoá phiếu thành công";
                return Ok(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = ex.ToString();
                return Ok(msg);
            }
        }

        public class ModelRequestPQIID
        {
            public int Id { get; set; }
            public string QcTicketCode { get; set; }
            public string ProdCodeLst { get; set; }
            public string ReceivedDate { get; set; }
            public string CheckingDate { get; set; }
            public string SupplierCode { get; set; }
            public string DeliveryNo { get; set; }
            public string FacilitySpect { get; set; }
            public string Quantity { get; set; }
            public string Unit { get; set; }
            public string Results { get; set; }
            public string Content { get; set; }
            public List<Attr> ListAttr { get; set; }
        }

        public class Attr
        {
            public string Code { get; set; }
            public string Value { get; set; }
        }

        public class ModelRequestPQIIAD
        {
            public int IdQcDetails { get; set; }
            public string AttrCode { get; set; }
            public string AttrGroup { get; set; }
            public string SessionCode { get; set; }
            public string CreatedBy { get; set; }
            public DateTime CreatedTime { get; set; }
            public string UpdatedBy { get; set; }
            public DateTime UpdatedTime { get; set; }
            public string DeletedBy { get; set; }
            public DateTime DeletedTime { get; set; }
            public bool IsDeleted { get; set; }
            public string Unit { get; set; }
            public string Type { get; set; }
            public string Value { get; set; }
        }

        [HttpPost]
        public async Task<IActionResult> CreateDetailTicket([FromBody] ModelRequestPQIID request)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                if ((string.IsNullOrWhiteSpace(request.ProdCodeLst) || request.ProdCodeLst == "")
                    || (string.IsNullOrWhiteSpace(request.SupplierCode) || request.SupplierCode == "")
                    || (string.IsNullOrWhiteSpace(request.FacilitySpect) || request.FacilitySpect == "")
                    || (string.IsNullOrWhiteSpace(request.Results) || request.Results == "")
                    )
                {
                    msg.Error = true;
                    msg.Title = "Thiếu một số trường dữ liệu quang trọng!!!";
                    return Ok(msg);
                }
                var id = await CreateImpDetails(request);
                if(request.ListAttr.Count() > 0)
                {
                    foreach(var attr in request.ListAttr)
                    {
                        var _data = _context.AttrSetups.FirstOrDefault(a => a.AttrCode == attr.Code);
                        var _attrNew = new ProductQualityInspectionAttr()
                        {
                            ProductQualityInspectionId = id,
                            AttrCode = attr.Code,
                            AttrGroup = _data.AttrGroup,
                            Unit = _data.AttrUnit,
                            Value = attr.Value,
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now,
                        };
                        _context.ProductQualityInspectionAttrs.Add(_attrNew);
                        _context.SaveChanges();
                    }
                }

                msg.Title = "Thêm thành công";
                return Ok(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = ex.ToString();
                return Ok(msg);
            }
        }

        public async Task<int> CreateImpDetails(ModelRequestPQIID request)
        {
            var _ticketDetail = new ProductQualityInspectionImpDetails()
            {
                QcTicketCode = request.QcTicketCode,
                ProdCodeLst = request.ProdCodeLst,
                ReceivedDate = DateTime.ParseExact(request.ReceivedDate, "dd/MM/yyyy", CultureInfo.InvariantCulture),
                CheckingDate = DateTime.ParseExact(request.CheckingDate, "dd/MM/yyyy", CultureInfo.InvariantCulture),
                SupplierCode = request.SupplierCode,
                DeliveryNo = request.DeliveryNo,
                FacilitySpect = request.FacilitySpect,
                Quantity = request.Quantity,
                Unit = request.Unit,
                Results = request.Results,
                Content = request.Content
            };
            _context.ProductQualityInspectionImpDetails.Add(_ticketDetail);
            await _context.SaveChangesAsync();
            return _ticketDetail.Id;
        }

        //public async Task<IActionResult> CreateAttrDetail([FromBody] ModelRequestPQIIAD request)
        //{
        //    var msg = new JMessage { Error = false, Title = "" };
        //    try
        //    {
        //        var _attrDetail = new ProdQcDatasetResults()
        //        {
        //            IdQcDetails = request.IdQcDetails,
        //            AttrCode = request.AttrCode,
        //            AttrGroup = request.AttrGroup,
        //            Unit = request.Unit,
        //            Value= request.Value,
        //        };

        //        _context.ProdQcDatasetResults.Add(_attrDetail);
        //        await _context.SaveChangesAsync();
        //        return Ok(msg);;
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Title = ex.ToString();
        //        return Ok(msg);
        //    }
        //}

        [HttpPost]
        public object GetStatusOrder()
        {
            var data = _context.CommonSettings
                    .Where(x => x.Group == "ORDER_SUPPLIER")
                    .OrderBy(x => x.SettingID).Select(x => new { Code = x.CodeSet, Name = x.ValueSet, Icon = x.Logo });

            return data;
        }

        [HttpPost]
        public object GetListEmployess()
        {
            var data = _context.HREmployees.Where(h => h.flag == 1).OrderBy(h => h.Id)
                        .Select(h => new { Id = h.employee_code, Name = h.fullname });

            return data;
        }

        [HttpPost]
        public object GetListUnit()
        {
            var data = _context.CommonSettings
                    .Where(x => x.Group == "UNIT" && x.IsDeleted == false)
                    .OrderBy(x => x.SettingID).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });

            return data;
        }

        [HttpPost]
        public object GetListStandard()
        {
            var data = _context.CommonSettings
                    .Where(x => x.Group == "PROD_STAT")
                    .OrderBy(x => x.SettingID).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });

            return data;
        }

        [HttpPost]
        public async Task<object> GetDetailTicket(int id)
        {
            var data = await _context.ProductQualityInspectionImpDetails.FirstOrDefaultAsync(pq => pq.Id == id);

            return data;
        }

        [HttpPost]
        public IActionResult GetDetailTicketByID(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var obj = _context.ProductQualityInspectionImpDetails.FirstOrDefaultAsync(pq => pq.Id == id);

                msg.Object = obj;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = ex.Message;
            }
            return Ok(msg);
        }

        [HttpPost]
        public object GetListAttr()
        {
            var data = _context.AttrSetups
                    .Where(x => x.AttrGroup == "CARD_DATA_LOGGER20231009095503" && x.IsDeleted == false)
                    .OrderBy(x => x.ID).Select(x => new { Code = x.AttrCode, Name = x.AttrName });

            return data;
        }

        [HttpPost]
        public async Task<object> UpdateDetailTicket(int id, [FromBody] ModelRequestPQIID request)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var receivedDate = !string.IsNullOrEmpty(request.ReceivedDate) ?
                    DateTime.ParseExact(request.ReceivedDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var checkingDate = !string.IsNullOrEmpty(request.CheckingDate) ?
                    DateTime.ParseExact(request.CheckingDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var _ticket = await _context.ProductQualityInspectionImpDetails.FirstOrDefaultAsync(pq => pq.Id == id);
                if (_ticket == null)
                {
                    msg.Error = true;
                    msg.Title = "Không tìm thấy ticket";
                }
                else
                {
                    _ticket.ProdCodeLst = request.ProdCodeLst;
                    _ticket.ReceivedDate = DateTime.ParseExact(request.ReceivedDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                    _ticket.CheckingDate = DateTime.ParseExact(request.CheckingDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                    _ticket.SupplierCode = request.SupplierCode;
                    _ticket.DeliveryNo = request.DeliveryNo;
                    _ticket.FacilitySpect = request.FacilitySpect;
                    _ticket.Quantity = request.Quantity;
                    _ticket.Unit = request.Unit;
                    _ticket.Results = request.Results;
                    _ticket.Content = request.Content;
                    _context.ProductQualityInspectionImpDetails.Update(_ticket);
                    await _context.SaveChangesAsync();
                    msg.Title = "Cập nhật thông tin phiếu thành công";
                }

                return msg;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = ex.ToString();
                return msg;
            }

        }

        [HttpPost]
        public async Task<object> DeleteDetailTicket(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var _ticket = _context.ProductQualityInspectionImpDetails.FirstOrDefault(pq => pq.Id == id);
                if (_ticket == null)
                {
                    msg.Error = true;
                    msg.Title = "Không tìm thấy ticket";
                }
                else
                {
                    var _listAttr = await _context.ProductQualityInspectionAttrs.Where(pq => pq.ProductQualityInspectionId == _ticket.Id).ToListAsync();
                    _context.ProductQualityInspectionAttrs.RemoveRange(_listAttr);

                    _context.ProductQualityInspectionImpDetails.Remove(_ticket);
                    _context.SaveChanges();
                    msg.Title = "Xoá phiếu thành công";
                }

                return msg;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = ex.ToString();
                return msg;
            }

        }

        public class JTableModelAttr : JTableModel
        {
            public List<String> Attr { get; set; }
        }

        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var a = _stringLocalizer["SCP_COL_CREATED_BY"];
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }).Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
    }
}
