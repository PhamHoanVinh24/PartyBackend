using ESEIM.Utils;
using FTU.Utils.HelperNet;
using Microsoft.AspNetCore.Mvc;
using System.Globalization;
using System;
using Microsoft.Extensions.Localization;
using ESEIM.Models;
using System.Linq;
using Microsoft.AspNetCore.Authorization;
using Syncfusion.XlsIO.Parser.Biff_Records.ObjRecords;
using Aspose.Pdf;
using Microsoft.EntityFrameworkCore;
using System.Dynamic;
using OpenXmlPowerTools;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class ProductSettingWarningController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IStringLocalizer<SharedResources> _sharedResources;

        public ProductSettingWarningController(
            IStringLocalizer<SharedResources> sharedResources,
            EIMDBContext context)
        {
            _sharedResources = sharedResources;
            _context = context;
        }

        public IActionResult Index()
        {
            return View();
        }
        [AllowAnonymous]
        [HttpPost]
        public object JTable([FromBody] JTableModel jTablePara)
        {
            //var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            //var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = /*from a in _context.ProductQrCodes*/
                        from a in _context.ProductSettingWarnings.Where(x => !x.IsDeleted)
                        join b in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "PRO_SET_WARNING_TYPE")
                        on a.WarningType equals b.CodeSet into b1
                        from b in b1.DefaultIfEmpty()
                        join c in _context.MaterialProducts.Where(x => !x.IsDeleted) on a.ProductCode equals c.ProductCode into c2
                        from c in c2.DefaultIfEmpty()
                        orderby a.Id descending
                        select new
                        {
                            Id = a.Id,
                            ProductCode = a.ProductCode,
                            ProductName = c != null ? c.ProductName : "",
                            CurrentQuantity = a.CurrentQuantity,
                            MinValue = a.MinValue,
                            MaxValue = a.MaxValue,
                            MinTime = a.MinTime,
                            MaxTime = a.MaxTime,
                            Flag = a.Flag,
                            WarningType = a.WarningType,
                            WarningTypeName = b != null ? b.ValueSet : "",
                        };

            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            //foreach (var item in data)
            //{
            //    item.QrCode = CommonUtil.GenerateQRCode(item.QrCode);
            //}
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "ProductCode", "ProductName", "CurrentQuantity",  "MinValue", "MaxValue", "MinTime", "MaxTime", "Flag", "WarningType", "WarningTypeName");
            return Json(jdata);
        }

        [AllowAnonymous]
        [HttpPost]
        public object Insert([FromBody] ProductSettingWarningModel model)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var fromDate = !string.IsNullOrEmpty(model.FromDate) ? DateTime.ParseExact(model.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var toDate = !string.IsNullOrEmpty(model.ToDate) ? DateTime.ParseExact(model.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var check = _context.ProductSettingWarnings
                    .FirstOrDefault(x => x.ProductCode == model.ProductCode
                    && x.WarningType == model.WarningType
                    && fromDate < x.MinTime && x.MaxTime < toDate);
                var checkDuplicate = _context.ProductSettingWarnings.Where(x => x.ProductCode == model.ProductCode && !x.IsDeleted).ToList();
                if (checkDuplicate.Count >= 2)
                {
                    msg.Title = "Mỗi sản phẩm chỉ được có tối đa 2 bản ghi";
                    msg.Error = true;
                }
                else
                {
                    if (check == null)
                    {
                        var newObj = new ProductSettingWarning()
                        {
                            ProductCode = model.ProductCode,
                            WarningType = model.WarningType,
                            MaxValue = model.MaxValue,
                            MinValue = model.MinValue,
                            MaxTime = toDate,
                            MinTime = fromDate,
                            Flag = model.Flag,
                            CurrentQuantity = 0,
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now,
                            IsDeleted = false
                        };
                        _context.ProductSettingWarnings.Add(newObj);
                        _context.SaveChanges();
                        msg.Title = "Thêm thành công";
                    }
                    else
                    {
                        msg.Title = "Đã tồn tại bản ghi";
                        msg.Error = true;
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                msg.Title = "Có lỗi xảy ra";
                msg.Error = true;
            }
            return Json(msg);
        }
        [AllowAnonymous]
        [HttpPut]
        public object Update([FromBody] ProductSettingWarningModel model)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var fromDate = !string.IsNullOrEmpty(model.FromDate) ? DateTime.ParseExact(model.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var toDate = !string.IsNullOrEmpty(model.ToDate) ? DateTime.ParseExact(model.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var data = _context.ProductSettingWarnings
                    .FirstOrDefault(x => x.Id == model.Id);
                if (data != null)
                {
                    data.WarningType = model.WarningType;
                    data.MinValue = model.MinValue;
                    data.MaxValue = model.MaxValue;
                    data.Flag = model.Flag;
                    data.MinTime = fromDate;
                    data.MaxTime = toDate;
                    data.UpdatedBy = ESEIM.AppContext.UserName;
                    data.UpdatedTime = DateTime.Now;
                    _context.SaveChanges();
                    msg.Title = "Cập nhật thành công";
                }
                else
                {
                    msg.Title = "Bản ghi không tồn tại";
                    msg.Error = true;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                msg.Title = "Có lỗi xảy ra";
                msg.Error = true;
            }
            return Json(msg);
        }
        [AllowAnonymous]
        [HttpGet]
        public object GetItem(int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = _context.ProductSettingWarnings
                    .FirstOrDefault(x => x.Id == id);
                if (data != null)
                {
                    msg.Object = data;
                }
                else
                {
                    msg.Title = "Bản ghi không tồn tại";
                    msg.Error = true;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                msg.Title = "Có lỗi xảy ra";
                msg.Error = true;
            }
            return Json(msg);
        }
        [AllowAnonymous]
        [HttpDelete]
        public object Delete(int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = _context.ProductSettingWarnings
                    .FirstOrDefault(x => x.Id == id);
                if (data != null)
                {
                    data.IsDeleted = true;
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    _context.SaveChanges();
                    msg.Title = "Xóa thành công";
                }
                else
                {
                    msg.Title = "Bản ghi không tồn tại";
                    msg.Error = true;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                msg.Title = "Có lỗi xảy ra";
                msg.Error = true;
            }
            return Json(msg);
        }
        [AllowAnonymous]
        [HttpGet]
        public object GetWarningType()
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = _context.CommonSettings
                    .Where(x => !x.IsDeleted && x.Group == "PRO_SET_WARNING_TYPE")
                    .Select(x => new { Code = x.CodeSet, Value = x.ValueSet})
                    .ToList();
                if (data != null)
                {
                    msg.Object = data;
                }
                else
                {
                    msg.Title = "Bản ghi không tồn tại";
                    msg.Error = true;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                msg.Title = "Có lỗi xảy ra";
                msg.Error = true;
            }
            return Json(msg);
        }
        [AllowAnonymous]
        [HttpPut]
        public object CalculateCurrentQuantity()
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                //var fromDate = !string.IsNullOrEmpty(model.FromDate) ? DateTime.ParseExact(model.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                //var toDate = !string.IsNullOrEmpty(model.ToDate) ? DateTime.ParseExact(model.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var data = _context.ProductSettingWarnings
                    .Where(x => !x.IsDeleted).ToList();
                var productInStocks = _context.ProductInStocks.Where(x => !x.IsDeleted).ToList();
                if (data != null)
                {
                    foreach (var item in data)
                    {
                        item.CurrentQuantity = productInStocks.Where(x => x.ProductCode == item.ProductCode)
                            .Sum(x => x.Quantity);
                        item.UpdatedBy = ESEIM.AppContext.UserName;
                        item.UpdatedTime = DateTime.Now;
                        _context.ProductSettingWarnings.Update(item);
                    }
                    _context.SaveChanges();
                    msg.Title = "Cập nhật thành công";
                }
                else
                {
                    msg.Title = "Bản ghi không tồn tại";
                    msg.Error = true;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                msg.Title = "Có lỗi xảy ra";
                msg.Error = true;
            }
            return Json(msg);
        }

        [AllowAnonymous]
        [HttpGet]
        public IActionResult GetCountWarningType()
        {
            try
            {
                var cSuper = _context.ProductSettingWarnings
                    .Where(x => !x.IsDeleted && x.WarningType == "PRO_SET_WARNING_TYPE_SUPERNUMERARY")
                    .Count();

                var cShort = _context.ProductSettingWarnings
                    .Where(x => !x.IsDeleted && x.WarningType == "PRO_SET_WARNING_TYPE_SHORT")
                    .Count();

                dynamic obj = new ExpandoObject();
                obj.Short = cShort;
                obj.Supernumerary = cSuper;

                return Json(obj);
            }
            catch (Exception ex)
            {
                return Json(null);
            }
        }

        [AllowAnonymous]
        [HttpPost]
        public object ListWarningShort()
        {
            var query = /*from a in _context.ProductQrCodes*/
                        from a in _context.ProductSettingWarnings.Where(x => !x.IsDeleted
                        && x.WarningType == "PRO_SET_WARNING_TYPE_SHORT")
                        join b in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "PRO_SET_WARNING_TYPE")
                        on a.WarningType equals b.CodeSet into b1
                        from b in b1.DefaultIfEmpty()
                        join c in _context.MaterialProducts.Where(x => !x.IsDeleted) on a.ProductCode equals c.ProductCode into c2
                        from c in c2.DefaultIfEmpty()
                        orderby a.Id descending
                        select new
                        {
                            Id = a.Id,
                            ProductCode = a.ProductCode,
                            ProductName = c != null ? c.ProductName : "",
                            CurrentQuantity = a.CurrentQuantity,
                            MinValue = a.MinValue,
                            MaxValue = a.MaxValue,
                            MinTime = a.MinTime,
                            MaxTime = a.MaxTime,
                            Flag = a.Flag,
                            WarningType = a.WarningType,
                            WarningTypeName = b != null ? b.ValueSet : "",
                        };

            return Json(query);
        }

        [AllowAnonymous]
        [HttpPost]
        public object ListWarningFull()
        {
            var query = /*from a in _context.ProductQrCodes*/
                        from a in _context.ProductSettingWarnings.Where(x => !x.IsDeleted
                        && x.WarningType == "PRO_SET_WARNING_TYPE_SUPERNUMERARY")
                        join b in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "PRO_SET_WARNING_TYPE")
                        on a.WarningType equals b.CodeSet into b1
                        from b in b1.DefaultIfEmpty()
                        join c in _context.MaterialProducts.Where(x => !x.IsDeleted) on a.ProductCode equals c.ProductCode into c2
                        from c in c2.DefaultIfEmpty()
                        orderby a.Id descending
                        select new
                        {
                            Id = a.Id,
                            ProductCode = a.ProductCode,
                            ProductName = c != null ? c.ProductName : "",
                            CurrentQuantity = a.CurrentQuantity,
                            MinValue = a.MinValue,
                            MaxValue = a.MaxValue,
                            MinTime = a.MinTime,
                            MaxTime = a.MaxTime,
                            Flag = a.Flag,
                            WarningType = a.WarningType,
                            WarningTypeName = b != null ? b.ValueSet : "",
                        };

            return Json(query);
        }
    }
}
