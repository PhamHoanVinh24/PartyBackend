using System;
using System.Globalization;
using System.Linq;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class MaterialPaymentTicketController : BaseController
    {
        public class JTableModelTicket : JTableModel
        {
            public string PayTitle { get; set; }
            public string ContractName { get; set; }
            public bool? PayType { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
        }

        private readonly EIMDBContext _context;
        public MaterialPaymentTicketController(EIMDBContext context)
        {
            _context = context;
        }
        public IActionResult Index()
        {
            return View();
        }
        [HttpPost]
        public object JTable([FromBody]JTableModelTicket jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var listCommon = _context.CommonSettings.Select(x => new { x.CodeSet, x.ValueSet });
            DateTime? fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            DateTime? toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var query = from a in _context.MaterialPaymentTickets
                        join b in _context.PoSaleHeaders on a.PayObjId equals b.ContractCode into b1
                        from b in b1.DefaultIfEmpty()
                        join c in listCommon on a.Currency equals c.CodeSet into c1
                        from c in c1.DefaultIfEmpty()
                        where (string.IsNullOrEmpty(jTablePara.ContractName) || b.Title.ToLower().Contains(jTablePara.ContractName.ToLower()))
                           && (string.IsNullOrEmpty(jTablePara.PayTitle) || a.PayTitle.ToLower().Contains(jTablePara.PayTitle.ToLower()))
                           && ((fromDate == null || (a.CreatedTime >= fromDate)) && (toDate == null || (a.CreatedTime <= toDate)))
                           && (jTablePara.PayType == null || a.PayType == jTablePara.PayType)
                        select new
                        {
                            Id = a.PaymentTickitId,
                            Title = a.PayTitle,
                            ContractName = b != null ? b.Title : "",
                            Type = a.PayType == true ? "Phiếu thu" : "Phiếu chi",
                            TotalPay = a.MoneyTotal,
                            Unit = c != null ? c.ValueSet : "",
                            a.CreatedTime,
                        };
            int count = query.Count();
            //var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length).AsNoTracking().ToList();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).AsNoTracking().ToList();
            var data1 = data.Skip(intBeginFor).Take(jTablePara.Length).ToList();
            var jdata = JTableHelper.JObjectTable(data1, jTablePara.Draw, count, "Id", "Title", "ContractName", "TotalPay", "Unit", "Type", "CreatedTime");
            return Json(jdata);
        }
        [HttpGet]
        public JsonResult GetItem(int id)
        {
            var mess = new JMessage { Error = false, Title = "" };
            try
            {
                var query = _context.MaterialPaymentTickets.AsParallel().Where(x => x.PaymentTickitId.Equals(id)).FirstOrDefault();                
                if (query == null)
                {
                    mess.Error = true;
                    mess.Title = String.Format(CommonUtil.ResourceValue("MPT_MSG_NOT_EXIST"));//"Không tồn tại lô hàng";
                }
                else
                {
                    var obj = new MaterialPaymentTicketModel
                    {
                        MoneyTotal = query.MoneyTotal,
                        PayRemain = query.PayRemain,
                        PayNextTime = query.PayNextTime.HasValue ? query.PayNextTime.Value.ToString("dd/MM/yyyy") : "",
                        Currency = query.Currency,
                        PayCode = query.PayCode,
                        PayNextMoney = query.PayNextMoney,
                        PaymentTickitId = query.PaymentTickitId,
                        PayerId = query.PayerId,
                        PayNote = query.PayNote,
                        PayObjId = query.PayObjId,
                        PayObjType = query.PayObjType,
                        PayOfWay = query.PayOfWay,
                        ReceiperId = query.ReceiperId,
                        PayTimeCnt = query.PayTimeCnt.HasValue ? query.PayTimeCnt.Value.ToString("dd/MM/yyyy") : "",
                        PayTitle = query.PayTitle,
                        PayType = query.PayType

                    };
                    mess.Object = obj;
                }
            }
            catch (Exception ex)
            {
                mess.Error = true;
                mess.Title = String.Format(CommonUtil.ResourceValue("MPT_MSG_NOT_EXIST"));//"Không tồn tại lô hàng";
            }
            return Json(mess);
        }
        [HttpPost]
        public JsonResult Insert([FromBody]MaterialPaymentTicketModel data)
        {
            var PayNextTime = !string.IsNullOrEmpty(data.PayNextTime) ? DateTime.ParseExact(data.PayNextTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var PayTimeCnt = !string.IsNullOrEmpty(data.PayTimeCnt) ? DateTime.ParseExact(data.PayTimeCnt, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var query = _context.MaterialPaymentTickets.Where(x => x.PayCode.Equals(data.PayCode) && x.PayObjId.Equals(data.PayObjId)).FirstOrDefault();
                if (query == null)
                {
                    var obj = new MaterialPaymentTicket
                    {
                        CreatedTime = DateTime.Now,
                        CreatedBy = ESEIM.AppContext.UserName,
                        PayNextTime = PayNextTime,
                        PayNextMoney = data.PayNextMoney,
                        PayCode = data.PayCode,
                        PayNote = data.PayNote,
                        PayObjId = data.PayObjId,
                        PayOfWay = data.PayOfWay,
                        PayerId = data.PayerId,
                        PayRemain = data.PayRemain,
                        PaymentTickitId = data.PaymentTickitId,
                        PayObjType = data.PayObjType,
                        PayTimeCnt = PayTimeCnt,
                        PayTitle = data.PayTitle,
                        PayType = data.PayType,
                        ReceiperId = data.ReceiperId,
                        MoneyTotal = data.MoneyTotal,
                        Currency = data.Currency
                        
                    };
                    
                    _context.MaterialPaymentTickets.Add(obj);
                    _context.SaveChanges();
                    msg.Title = String.Format(CommonUtil.ResourceValue("MPT_MSG_ADD_MPT_SUCCESS"));//"Thêm phiếu thu - chi thành công";
                    return Json(msg);
                }
                else
                { 
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("MPT_MSG_CODE_MPT_ALREADY_EXIST"));//"Mã phiếu thu - chi đã tồn tại";
                }
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("MPT_MSG_ADD_MPT_ERROR"));//"Thêm phiếu thu - chi lỗi!";
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult Delete([FromBody]int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = _context.MaterialPaymentTickets.FirstOrDefault(x => x.PaymentTickitId == id);
                if (data == null)
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("MPT_MSG_NOT_EXIST_MPT"));//"Không tồn tại phiếu thu chi";
                }
                else
                {
                    _context.MaterialPaymentTickets.Remove(data);
                    _context.SaveChanges();
                    msg.Title = String.Format(CommonUtil.ResourceValue("MPT_MSG_DELETE_MPT_SUCCESS"));//"Xóa phiếu thu chi thành công";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("MPT_MSG_DELETE_MPT_ERROR"));//"Xóa phiếu thu chi lỗi!";
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult Update([FromBody]MaterialPaymentTicketModel data)
        {
            var PayNextTime = !string.IsNullOrEmpty(data.PayNextTime) ? DateTime.ParseExact(data.PayNextTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var PayTimeCnt = !string.IsNullOrEmpty(data.PayTimeCnt) ? DateTime.ParseExact(data.PayTimeCnt, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var query = _context.MaterialPaymentTickets.Where(x => x.PaymentTickitId.Equals(data.PaymentTickitId)).FirstOrDefault();
                if(query != null)
                {
                    if(_context.MaterialPaymentTickets.Where(x => x.PayCode.Equals(data.PayCode) && x.PayObjId.Equals(data.PayObjId) && x.PaymentTickitId != data.PaymentTickitId).FirstOrDefault() == null)
                    {
                        query.PayNextTime = PayNextTime;
                        query.PayNextMoney = data.PayNextMoney;
                        query.PayCode = data.PayCode;
                        query.PayNote = data.PayNote;
                        query.PayObjId = data.PayObjId;
                        query.PayOfWay = data.PayOfWay;
                        query.PayerId = data.PayerId;
                        query.PayRemain = data.PayRemain;
                        query.PaymentTickitId = data.PaymentTickitId;
                        query.PayObjType = data.PayObjType;
                        query.PayTimeCnt = PayTimeCnt;
                        query.PayTitle = data.PayTitle;
                        query.PayType = data.PayType;
                        query.ReceiperId = data.ReceiperId;
                        query.MoneyTotal = data.MoneyTotal;
                        query.Currency = data.Currency;
                        query.UpdatedTime = DateTime.Now.Date;
                        _context.MaterialPaymentTickets.Update(query);
                        _context.SaveChanges();
                        msg.Title = String.Format(CommonUtil.ResourceValue("MPT_MSG_UPDATE_MPT_SUCCESS"));//"Sửa phiếu thu - chi thành công";
                        return Json(msg);
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = String.Format(CommonUtil.ResourceValue("MPT_MSG_CODE_MPT_ALREADY_EXIST"));//"Mã phiếu thu - chi đã tồn tại";
                    }

                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("MPT_MSG_UPDATE_MPT_ERROR"));//"Sửa phiếu thu - chi lỗi!";
                }
                
               
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("MPT_MSG_UPDATE_MPT_ERROR"));//"Sửa phiếu thu - chi lỗi!";
            }
            return Json(msg);
        }
        //[HttpPost]
        //public JsonResult Update([FromBody]MaterialSBatchModel obj)
        //{
        //    var msg = new JMessage() { Error = false };
        //    try
        //    {
        //        var item = _context.MaterialStoreBatchGoodss.FirstOrDefault(x => x.Code == obj.Code);
        //        item.Name = obj.Name;
        //        item.ProductCode = obj.ProductCode;
        //        item.StoreId = obj.StoreId;
        //        item.Quantity = obj.Quantity;
        //        item.Unit = obj.Unit;
        //        item.Vat = obj.Vat;
        //        item.Cost = obj.Cost;
        //        item.Currency = obj.Currency;
        //        item.Barcode = obj.Barcode;
        //        item.SupplierId = obj.SupplierId;
        //        item.Madein = obj.Madein;
        //        item.Packing = obj.Packing;
        //        item.Sale = obj.Sale;
        //        item.Description = obj.Description;
        //        item.DateProduce = !string.IsNullOrEmpty(obj.DateProduce) ? DateTime.ParseExact(obj.DateProduce, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
        //        item.DateExpire = !string.IsNullOrEmpty(obj.DateExpire) ? DateTime.ParseExact(obj.DateExpire, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
        //        item.DateReiceive = !string.IsNullOrEmpty(obj.DateReiceive) ? DateTime.ParseExact(obj.DateReiceive, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
        //        item.UpdatedBy = ESEIM.AppContext.UserName;
        //        item.UpdatedTime = DateTime.Now;
        //        _context.MaterialStoreBatchGoodss.Update(item);
        //        _context.SaveChanges();
        //        msg.Title = "Cập nhật lô hàng thành công";
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Title = "Cập nhật lô hàng lỗi!";
        //        msg.Object = ex;
        //    }
        //    return Json(msg);
        //}


        #region comboxbox
        [HttpPost]
        public object GetPaymentObjType()
        {
            var query = _context.CommonSettings.AsParallel().Where(x => x.CodeSet == "PAYMENT_CONTRACT").Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return query;
        }
        [HttpPost]
        public object GetPaymentObjTypeProject()
        {
            var query = _context.CommonSettings.AsParallel().Where(x => x.CodeSet == "PAYMENT_PROJECT").Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return query;
        }
        [HttpPost]
        public object GetUnit()
        {
            return GetCurrencyBase();
        }

        [HttpPost]
        public object GetContract()
        {
            var query = _context.PoSaleHeaders.AsParallel().Where(x => !x.IsDeleted).Select(x => new { Code = x.ContractCode, Name = x.Title });
            return query;
        }
        [HttpPost]
        public object GetProject()
        {
            var query = _context.Projects.AsParallel().Where(x => !x.FlagDeleted).Select(x => new { Code = x.ProjectCode, Name = x.ProjectTitle });
            return query;
        }
        #endregion

        #region Kiểm tra hợp đồng đã thanh toán hết hay chưa
        //Kiểm tra hợp đồng đã thanh toán hết hay chưa
        [HttpGet]
        public JsonResult CheckContract(string contractCode)
        {
            var msg = new JMessage { Error = false, Title = "" };
            decimal? total = 0;
            var query = _context.PoSaleHeaders.FirstOrDefault(x => !x.IsDeleted && x.ContractCode == contractCode);
            if (query == null)
            {
                msg.Title = String.Format(CommonUtil.ResourceValue("MPT_MSG_NOT_EXIST_CONTRACT"));//"Không tồn tại hợp đồng";
                msg.Error = true;
            }
            else
            {
                var getSumRecipt = _context.MaterialPaymentTickets.Where(x => x.PayObjId == contractCode && x.PayType).Sum(x => x.MoneyTotal);
                //var getListPayment = _context.MaterialPaymentTickets.Where(x => x.PayObjId == contractCode).Sum(x => x.MoneyTotal);
                total = (query.Budget - getSumRecipt);
            }
            msg.Object = total;
            return Json(msg);
        }
        [HttpGet]
        public JsonResult CheckProject(string contractCode)
        {
            var msg = new JMessage { Error = false, Title = "" };
            //var da = _context.Projects.FirstOrDefault(x => x.ProjectCode == contractCode);
            decimal? total = 0;
            var query = _context.Projects.FirstOrDefault(x => !x.FlagDeleted && x.ProjectCode == contractCode);
            if (query == null)
            {
                msg.Title = String.Format(CommonUtil.ResourceValue("MPT_MSG_NOT_EXIST_PROJECT"));//"Không tồn tại dự án";
                msg.Error = true;
            }
            else
            {
                //var getListPayment = _context.MaterialPaymentTickets.Where(x => x.PayObjId == contractCode).Sum(x => x.MoneyTotal);
                var getSumRecipt = _context.MaterialPaymentTickets.Where(x => x.PayObjId == contractCode && x.PayType).Sum(x => x.MoneyTotal);
                total = (Convert.ToDecimal(query.Budget) - getSumRecipt);
            }
            msg.Object = total;
            return Json(msg);
        }
        
       
        #endregion
    }
}