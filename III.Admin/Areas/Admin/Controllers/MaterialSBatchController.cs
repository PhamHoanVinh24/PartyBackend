using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using III.Domain.Enums;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace III.Admin.Controllers
{
    public class MaterialSBatchModel
    {
        public string Code { get; set; }
        public string Name { get; set; }
        public string ProductCode { get; set; }
        public int? StoreId { get; set; }
        public int? Quantity { get; set; }
        public string Unit { get; set; }
        public int? Vat { get; set; }
        public int? Sale { get; set; }
        public double? Cost { get; set; }
        public double? Total { get; set; }
        public string Currency { get; set; }
        public string Barcode { get; set; }
        public int? SupplierId { get; set; }
        public string Madein { get; set; }
        public string Packing { get; set; }
        public string DateProduce { get; set; }
        public string DateExpire { get; set; }
        public string DateReiceive { get; set; }
        public string Description { get; set; }
    }
    [Area("Admin")]
    public class MaterialSBatchController : BaseController
    {
        private readonly EIMDBContext _context;
        public MaterialSBatchController(EIMDBContext context)
        {
            _context = context;
        }
        public IActionResult Index()
        {
            return View();
        }
        public class JTableModelMaterial : JTableModel
        {
            public string Name { get; set; }
            public string ProductName { get; set; }
            public string FromTo { get; set; }
            public string DateTo { get; set; }
        }
        [HttpPost]
        public object JTable([FromBody]JTableModelMaterial jTablePara)
        {
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            DateTime? fromDate = !string.IsNullOrEmpty(jTablePara.FromTo) ? DateTime.ParseExact(jTablePara.FromTo, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            DateTime? toDate = !string.IsNullOrEmpty(jTablePara.DateTo) ? DateTime.ParseExact(jTablePara.DateTo, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var query = from a in _context.MaterialStoreBatchGoodss.Where(x => !x.IsDeleted)
                        join b in _context.MaterialProducts.Where(x => !x.IsDeleted) on a.ProductCode equals b.ProductCode into b1
                        from b in b1.DefaultIfEmpty()
                        join c in _context.EDMSWareHouses.Where(x => x.WHS_Flag != true && x.Type == "PR") on a.StoreId equals c.Id into c1
                        from c in c1.DefaultIfEmpty()
                            //join d in _context.CommonSettings on a.Unit equals d.CodeSet into d1
                            //from d in d1.DefaultIfEmpty()
                        join e in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.CurrencyType)) on a.Currency equals e.CodeSet into e1
                        from e in e1.DefaultIfEmpty()
                        where !a.IsDeleted
                            && ((fromDate == null || (a.CreatedTime >= fromDate)) && (toDate == null || (a.CreatedTime <= toDate)))
                            && (string.IsNullOrEmpty(jTablePara.Name) || a.Name.ToLower().Contains(jTablePara.Name.ToLower()))
                            && (string.IsNullOrEmpty(jTablePara.ProductName) || b.ProductName.ToLower().Contains(jTablePara.ProductName.ToLower()))
                        select new
                        {
                            a.Id,
                            a.Name,
                            ProductName = b != null ? b.ProductName : null,
                            StoreName = c != null ? c.WHS_Name : null,
                            a.Quantity,
                            //ValueSet = d != null ? d.ValueSet : null,
                            a.Total,
                            a.Unit,
                            Currency = e != null ? e.ValueSet : null,
                            a.DateReiceive
                        };
            int count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "Name", "ProductName", "StoreName", "Quantity", "Total", "Unit", "Currency", "DateReiceive");
            return Json(jdata);
        }
        [HttpPost]
        public object Getsupplier()
        {
            var supplier = _context.Suppliers.AsParallel().Where(x => !x.IsDeleted).Select(x => new { Id = x.SupID, Name = x.SupName });
            return supplier;
        }
        [HttpPost]
        public object GetProduct()
        {
            var product = _context.MaterialProducts.AsParallel().Where(x => !x.IsDeleted).Select(x => new { Code = x.ProductCode, Name = x.ProductName });
            return product;
        }
        [HttpPost]
        public object GetStore()
        {
            var store = _context.EDMSWareHouses.AsParallel().Where(x => x.WHS_Flag != true && x.Type == "PR").Select(x => new { Id = x.Id, Name = x.WHS_Name });
            return store;
        }
        [HttpPost]
        public object GetUnit()
        {
            var data = _context.CommonSettings.Where(x => x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)).Select(x => new { Code = x.ValueSet, Name = x.ValueSet });
            return data;
        }
        [HttpPost]
        public object GetCurrency()
        {
            return GetCurrencyBase();
        }
        [HttpPost]
        public object GetOrigin()
        {
            var data = _context.CommonSettings.Where(x => x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Origin)).Select(x => new { Code = x.ValueSet, Name = x.ValueSet });
            return data;
        }
        [HttpPost]
        public object GetItem([FromBody]int id)
        {
            var query = _context.MaterialStoreBatchGoodss.FirstOrDefault(x => x.Id == id);
            return query;
        }
        [HttpPost]
        public JsonResult Insert([FromBody]MaterialSBatchModel obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var query = from a in _context.MaterialStoreBatchGoodss
                            where a.Code == obj.Code
                            select a;
                if (query.Count() == 0)
                {
                    var temp = new MaterialStoreBatchGoods
                    {
                        Code = obj.Code,
                        Name = obj.Name,
                        ProductCode = obj.ProductCode,
                        StoreId = obj.StoreId,
                        Quantity = obj.Quantity,
                        Unit = obj.Unit,
                        Vat = obj.Vat,
                        Cost = obj.Cost,
                        Currency = obj.Currency,
                        Barcode = obj.Barcode,
                        SupplierId = obj.SupplierId,
                        Madein = obj.Madein,
                        Packing = obj.Packing,
                        Sale = obj.Sale,
                        DateProduce = !string.IsNullOrEmpty(obj.DateProduce) ? DateTime.ParseExact(obj.DateProduce, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null,
                        DateExpire = !string.IsNullOrEmpty(obj.DateExpire) ? DateTime.ParseExact(obj.DateExpire, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null,
                        DateReiceive = !string.IsNullOrEmpty(obj.DateReiceive) ? DateTime.ParseExact(obj.DateReiceive, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null,
                        Description = obj.Description,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now
                    };
                    //double? total = 0;
                    //if (obj.Quantity != null && obj.Cost != null)
                    //{
                    //    total = obj.Quantity * obj.Cost;
                    //    if (obj.Sale != null)
                    //    {
                    //        total = (total * obj.Sale) / 100;
                    //    }
                    //    if (obj.Vat != null)
                    //    {
                    //        total = (total * obj.Vat) / 100;
                    //    }
                    //}
                    temp.Total = obj.Total;
                    _context.MaterialStoreBatchGoodss.Add(temp);
                    _context.SaveChanges();
                    msg.Title = "Thêm lô hàng thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Mã lô hàng đã tồn tại";
                    //return msg;
                }
                return Json(msg);


                //var temp = new MaterialStoreBatchGoods
                //{
                //    Code = obj.Code,
                //    Name = obj.Name,
                //    ProductCode = obj.ProductCode,
                //    StoreId = obj.StoreId,
                //    Quantity = obj.Quantity,
                //    Unit = obj.Unit,
                //    Vat = obj.Vat,
                //    Cost = obj.Cost,
                //    Currency = obj.Currency,
                //    Barcode = obj.Barcode,
                //    SupplierId = obj.SupplierId,
                //    Madein = obj.Madein,
                //    Packing = obj.Packing,
                //    Sale = obj.Sale,
                //    DateProduce = !string.IsNullOrEmpty(obj.DateProduce) ? DateTime.ParseExact(obj.DateProduce, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null,
                //    DateExpire = !string.IsNullOrEmpty(obj.DateExpire) ? DateTime.ParseExact(obj.DateExpire, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null,
                //    DateReiceive = !string.IsNullOrEmpty(obj.DateReiceive) ? DateTime.ParseExact(obj.DateReiceive, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null,
                //    Description = obj.Description,
                //    CreatedBy = ESEIM.AppContext.UserName,
                //    CreatedTime = DateTime.Now
                //};
                //double? total = 0;
                //if (obj.Quantity != null && obj.Cost != null)
                //{
                //    total = obj.Quantity * obj.Cost;
                //    if (obj.Sale != null)
                //    {
                //        total = (total * obj.Sale) / 100;
                //    }
                //    if (obj.Vat != null)
                //    {
                //        total = (total * obj.Vat) / 100;
                //    }
                //}
                //temp.Total = total;
                //_context.MaterialStoreBatchGoodss.Add(temp);
                //_context.SaveChanges();
                //msg.Title = "Thêm lô hàng thành công";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Thêm lô hàng lỗi!";
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult Update([FromBody]MaterialSBatchModel obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var item = _context.MaterialStoreBatchGoodss.FirstOrDefault(x => x.Code == obj.Code);
                item.Name = obj.Name;
                item.ProductCode = obj.ProductCode;
                item.StoreId = obj.StoreId;
                item.Quantity = obj.Quantity;
                item.Unit = obj.Unit;
                item.Vat = obj.Vat;
                item.Cost = obj.Cost;
                item.Currency = obj.Currency;
                item.Barcode = obj.Barcode;
                item.SupplierId = obj.SupplierId;
                item.Madein = obj.Madein;
                item.Packing = obj.Packing;
                item.Sale = obj.Sale;
                item.Description = obj.Description;
                item.DateProduce = !string.IsNullOrEmpty(obj.DateProduce) ? DateTime.ParseExact(obj.DateProduce, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                item.DateExpire = !string.IsNullOrEmpty(obj.DateExpire) ? DateTime.ParseExact(obj.DateExpire, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                item.DateReiceive = !string.IsNullOrEmpty(obj.DateReiceive) ? DateTime.ParseExact(obj.DateReiceive, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                item.UpdatedBy = ESEIM.AppContext.UserName;
                item.UpdatedTime = DateTime.Now;
                //double? total = 0;
                //if (obj.Quantity != null && obj.Cost != null)
                //{
                //    total = obj.Quantity * obj.Cost;
                //    if (obj.Sale != null)
                //    {
                //        total = (total * obj.Sale) / 100;
                //    }
                //    if (obj.Vat != null)
                //    {
                //        total = (total * obj.Vat) / 100;
                //    }
                //}
                item.Total = obj.Total;
                _context.MaterialStoreBatchGoodss.Update(item);
                _context.SaveChanges();
                msg.Title = "Cập nhật lô hàng thành công";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Cập nhật lô hàng lỗi!";
                msg.Object = ex;
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult Delete([FromBody]int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = _context.MaterialStoreBatchGoodss.FirstOrDefault(x => x.Id == id);
                if (data == null)
                {
                    msg.Error = true;
                    msg.Title = "Không tồn tại lô hàng";
                }
                else
                {
                    data.IsDeleted = true;
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    _context.MaterialStoreBatchGoodss.Update(data);
                    _context.SaveChanges();
                    msg.Title = "Xóa lô hàng thành công";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Xóa lô hàng lỗi!";
                msg.Object = ex;
            }
            return Json(msg);
        }
    }
}