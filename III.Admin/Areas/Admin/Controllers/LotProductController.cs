using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Options;
using III.Admin.Controllers;
using System.IO;
using System.Collections.Generic;
using System.Globalization;
using III.Domain.Enums;

namespace ESEIM.Controllers
{
    [Area("Admin")]
    public class LotProductController : BaseController
    {

        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly EIMDBContext _context;
        private readonly ILogger _logger;
        private readonly IActionLogService _actionLog;
        private readonly AppSettings _appSettings;
        private readonly IUploadService _upload;


        public class JTableModelCustom : JTableModel
        {
            public string QrCode { get; set; }
            public string BarCode { get; set; }
            public string Title { get; set; }
            public string Supplier { get; set; }
            public string CreatedDate { get; set; }
            public string ExpiryDate { get; set; }
            public string Name { get; set; }
            public string ProductName { get; set; }
            public string FromTo { get; set; }
            public string DateTo { get; set; }
        }


        public class JTableProductCustom : JTableModel
        {
            public string LotProductCode { get; set; }
        }


        //d.QrCode = $scope.model.QrCode;
        //        d.BarCode = $scope.model.BarCode;
        //        d.Title = $scope.model.Title;
        //        d.Supplier = $scope.model.Supplier;
        //        d.CreatedDate = $scope.model.CreatedDate;
        //        d.ExpiryDate = $scope.model.ExpiryDate;
        public LotProductController(EIMDBContext context, IUploadService upload, IOptions<AppSettings> appSettings, IHostingEnvironment hostingEnvironment, IActionLogService actionLog)
        {

            _context = context;
            _hostingEnvironment = hostingEnvironment;
            _actionLog = actionLog;
            _appSettings = appSettings.Value;
            _upload = upload;
        }

        public IActionResult Index()
        {
            return View("Index");
        }

        [HttpPost]
        public object JTable([FromBody]JTableModelCustom jTablePara)
        {
            var CreatedDate = !string.IsNullOrEmpty(jTablePara.CreatedDate) ? DateTime.ParseExact(jTablePara.CreatedDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var ExpiryDate = !string.IsNullOrEmpty(jTablePara.ExpiryDate) ? DateTime.ParseExact(jTablePara.ExpiryDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            DateTime? fromDate = !string.IsNullOrEmpty(jTablePara.FromTo) ? DateTime.ParseExact(jTablePara.FromTo, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            DateTime? toDate = !string.IsNullOrEmpty(jTablePara.DateTo) ? DateTime.ParseExact(jTablePara.DateTo, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.LotProducts.Where(x => !x.IsDeleted)
                        join b in _context.Suppliers.Where(x => !x.IsDeleted) on a.Supplier equals b.SupCode into b2
                        from b1 in b2.DefaultIfEmpty()
                        join c in _context.Users.Where(x => x.Active) on a.CreatedBy equals c.UserName into c2
                        from c1 in c2.DefaultIfEmpty()
                        join d in _context.EDMSWareHouses.Where(x => x.WHS_Flag != true && x.Type == "PR") on a.Store equals d.Id into d2
                        from d1 in d2.DefaultIfEmpty()
                        where a.IsDeleted == false
                         && (string.IsNullOrEmpty(jTablePara.Name) || a.LotProductName.ToLower().Contains(jTablePara.Name.ToLower()))
                        && ((fromDate == null) || (a.CreatedTime != null && a.CreatedTime.Date >= fromDate))
                        && ((toDate == null) || (a.CreatedTime != null && a.CreatedTime.Date <= toDate))
                        && (string.IsNullOrEmpty(jTablePara.Supplier) || (b1 != null && b1.SupCode == jTablePara.Supplier))
                        select new JTableLotProductRes
                        {
                            Id = a.Id,
                            QrCode = a.QrCode,
                            BarCode = a.BarCode,
                            Title = a.Title,
                            Supplier = a.Supplier,
                            SupplierName = (b1 != null ? b1.SupName : ""),
                            Cost = a.Cost,
                            ExpiryDate = a.ExpiryDate,
                            CreatedTime = a.CreatedTime,
                            CreatedBy = a.CreatedBy,
                            CreatedByName = (c1 != null ? c1.GivenName : ""),
                            PathImg = a.PathImg,
                            Packing = a.Packing,
                            Store = (d1 != null ? d1.WHS_Name : ""),
                            LotProductName = a.LotProductName,
                            sQrCode = a.QrCode,
                            sBarCode = a.BarCode
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).AsNoTracking().ToList();
            var data1 = data.Skip(intBeginFor).Take(jTablePara.Length).ToList();
            foreach (var item in data1)
            {
                item.sQrCode = CommonUtil.GenerateQRCode(item.sBarCode);
                item.sBarCode = CommonUtil.GenerateBarCode(item.sBarCode);
            }
            var jdata = JTableHelper.JObjectTable(data1, jTablePara.Draw, count, "id", "QrCode", "BarCode", "Title", "Supplier", "SupplierName", "Cost", "ExpiryDate", "CreatedTime", "CreatedBy", "CreatedByName", "PathImg", "Packing", "Store", "LotProductName", "sQrCode", "sBarCode");
            return Json(jdata);
        }

        //--------------------------------thêm mới---------------------------   
        [HttpPost]
        public object Insert([FromBody]LotProduct obj)
        {
            var expiryDate = !string.IsNullOrEmpty(obj.sExpiryDate) ? DateTime.ParseExact(obj.sExpiryDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var manufactureDate = !string.IsNullOrEmpty(obj.sManufactureDate) ? DateTime.ParseExact(obj.sManufactureDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            var msg = new JMessage();
            try
            {
                obj.CreatedBy = AppContext.UserName;
                obj.CreatedTime = DateTime.Now;
                obj.IsDeleted = false;
                obj.ExpiryDate = expiryDate;
                obj.ManufactureDate = manufactureDate;
                obj.QrCode = "LOT_" + obj.LotProductCode;
                obj.BarCode = "LOT_" + obj.LotProductCode;
                foreach (var item in obj.LotFile)
                {
                    EDMSFile file = new EDMSFile();
                    file.Url = item.FilePath;
                    file.FileName = item.FileName;
                    file.FileTypePhysic = item.FileType;
                    file.CreatedBy = AppContext.UserName;
                    file.CreatedTime = DateTime.Now;
                    file.IsDeleted = false;
                    file.FileCode = Guid.NewGuid().ToString();
                    file.MimeType = item.ContentType;
                    _context.EDMSFiles.Add(file);
                    _context.SaveChanges();

                    var productLotFile = new ProductLotFile();

                    productLotFile.ProductCode = obj.LotProductCode;
                    productLotFile.FileCode = file.FileCode;
                    productLotFile.Type = "LOT_PRODUCT";
                    _context.ProductLotFiles.Add(productLotFile);
                    //productLotFile.FileCode 
                }
                //obj.LotProductCode = Guid.NewGuid().ToString();
                _context.LotProducts.Add(obj);
                _context.SaveChanges();
                msg.Error = false;
                msg.Title = "Thêm lô sản phẩm thành công";
                msg.Object = obj;

            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Object = ex;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_ADD"));
            }
            return msg;
        }

        [HttpPost]
        public object Update([FromBody]LotProduct obj)
        {
            var msg = new JMessage();
            try
            {
                var expiryDate = !string.IsNullOrEmpty(obj.sExpiryDate) ? DateTime.ParseExact(obj.sExpiryDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var manufactureDate = !string.IsNullOrEmpty(obj.sManufactureDate) ? DateTime.ParseExact(obj.sManufactureDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

                var product = _context.LotProducts.FirstOrDefault(x => x.Id == obj.Id && x.IsDeleted == false);
                if (product != null)
                {
                    product.QrCode = obj.QrCode;
                    product.LotProductName = obj.LotProductName;
                    product.Store = obj.Store;
                    product.Origin = obj.Origin;
                    product.BarCode = obj.BarCode;
                    product.Title = obj.Title;
                    product.Supplier = obj.Supplier;
                    product.Cost = obj.Cost;
                    product.ExpiryDate = expiryDate;
                    product.Unit = obj.Unit;
                    product.PathImg = obj.PathImg;
                    product.UpdatedTime = DateTime.Now;
                    product.UpdatedBy = AppContext.UserName;
                    product.ManufactureDate = manufactureDate;
                    product.Tax = obj.Tax;
                    product.CustomFee = obj.CustomFee;
                    product.PoundAge = obj.PoundAge;
                    product.TransferCost = obj.TransferCost;
                    product.Discount = obj.Discount;
                    product.Note = obj.Note;
                    product.Packing = obj.Packing;


                    foreach (var item in obj.LotFile)
                    {
                        if (item.Status == "ADD")
                        {
                            EDMSFile file = new EDMSFile();
                            file.Url = item.FilePath;
                            file.FileName = item.FileName;
                            file.FileTypePhysic = item.FileType;
                            file.CreatedBy = AppContext.UserName;
                            file.CreatedTime = DateTime.Now;
                            file.IsDeleted = false;
                            file.FileCode = Guid.NewGuid().ToString();
                            file.MimeType = item.ContentType;
                            _context.EDMSFiles.Add(file);
                            _context.SaveChanges();

                            var productLotFile = new ProductLotFile();
                            productLotFile.ProductCode = obj.LotProductCode;
                            productLotFile.FileCode = file.FileCode;
                            productLotFile.Type = "LOT_PRODUCT";
                            _context.ProductLotFiles.Add(productLotFile);
                        }
                        else if (item.Status == "DELETE")
                        {
                            var file = _context.EDMSFiles.FirstOrDefault(x => x.FileCode == item.FileCode);
                            if (file != null)
                                _context.Remove(file);
                            var productLotFile = _context.ProductLotFiles.FirstOrDefault(x => x.FileCode == item.FileCode);
                            if (productLotFile != null)
                                _context.Remove(productLotFile);
                        }

                        //productLotFile.FileCode 
                    }

                    _context.SaveChanges();
                    msg.Error = false;
                    msg.Title = "Cập nhật lô sản phẩm thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Lô sản phẩm không tồn tại hoặc đã bị xóa, vui lòng kiểm tra lại";
                }


                return msg;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_UPDATE_FAILED"), CommonUtil.ResourceValue("Lô sản phẩm"));
                return msg;
            }

        }


        //----------------------------------------------Xóa-------------------------------
        [HttpPost]
        public object Delete(int Id)
        {
            var msg = new JMessage { Error = true };
            try
            {
                var data = _context.LotProducts.FirstOrDefault(x => x.Id == Id);
                if (data != null)
                {
                    var chkUsing = _context.MaterialStoreImpGoodsHeaders.Any(x => !x.IsDeleted && x.LotProductCode == data.LotProductCode);
                    if (chkUsing)
                    {
                        msg.Error = true;
                        msg.Title = "Không thể xóa lô sản phẩm đã được nhập kho.";
                    }
                    else
                    {
                        data.IsDeleted = true;
                        data.DeletedTime = DateTime.Now;
                        data.DeletedBy = AppContext.UserName;
                        _context.LotProducts.Update(data);

                        //Xóa list chi tiết
                        var listLotDetail = _context.LotProductDetails.Where(x => !x.IsDeleted && x.LotProductCode == data.LotProductCode).ToList();
                        listLotDetail.ForEach(x => { x.IsDeleted = true; x.DeletedBy = AppContext.UserName; x.DeletedTime = DateTime.Now; });
                        _context.LotProductDetails.UpdateRange(listLotDetail);

                        //Xóa list file
                        var listLotFile = _context.ProductLotFiles.Where(x => x.ProductCode == data.LotProductCode && x.Type == "LOT_PRODUCT").ToList();
                        _context.ProductLotFiles.RemoveRange(listLotFile);

                        _context.SaveChanges();
                        msg.Error = false;
                        msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_SUCCESS"), CommonUtil.ResourceValue("Lô sản phẩm"));
                    }
                }

                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi xóa lô sản phẩm";
                return Json(msg);
            }
        }


        public object GetItemDetail(int id)
        {
            var listCommon = _context.CommonSettings.Select(x => new { x.CodeSet, x.ValueSet });
            //ProductCat query=new ProductCat();
            var query = from ad in _context.MaterialProducts

                        join b in listCommon on ad.Unit equals b.CodeSet into b1
                        from b in b1.DefaultIfEmpty()
                        join c in listCommon on ad.GroupCode equals c.CodeSet into c1
                        from c in c1.DefaultIfEmpty()
                        where ad.Id == id
                        select new
                        {
                            ProductCode = ad.ProductCode,
                            ProductName = ad.ProductName,
                            PathImg = ad.Image,
                            Note = ad.Note,
                            Unit = b != null ? b.ValueSet : "Không xác định",
                            ProductGroup = c != null ? c.ValueSet : "Không xác định",
                        };
            return Json(query);
        }
        [HttpPost]
        public object GetItem(int id)
        {
            var a = _context.LotProducts.AsNoTracking().Single(m => m.Id == id);
            return Json(a);
        }

        [HttpPost]
        public object GetProductUnit()
        {
            var data = _context.CommonSettings.Where(x => x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return data;
        }

        [HttpPost]
        public object GetListProduct()
        {
            //var rs = (from b in _context.SubProducts.Where(x => !x.IsDeleted)
            //          join c in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on b.Unit equals c.CodeSet into c1
            //          from c2 in c1.DefaultIfEmpty()
            //          orderby b.ProductCode
            //          select new ListProductRes
            //          {
            //              Code = string.Format("{0}_{1}", b.ProductCode, b.AttributeCode),
            //              Name = string.Format("{0}-{1}_{2}", _context.MaterialProducts.FirstOrDefault(p => p.ProductCode.Equals(b.ProductCode)) != null ? _context.MaterialProducts.FirstOrDefault(p => p.ProductCode.Equals(b.ProductCode)).ProductName : null, b.ProductCode, b.AttributeCode),
            //              Unit = b.Unit,
            //              ProductCode = b.ProductCode,
            //              UnitName = c2.ValueSet,
            //              AttributeCode = b.AttributeCode,
            //              AttributeName = b.AttributeName,
            //              PriceM = b.Value
            //          }).ToList();
            //foreach(var item in rs)
            //{
            //    string s = item.PriceM;
            //    if(!string.IsNullOrEmpty(s))
            //    {
            //        var arr = s.Split("*");
            //        item.PriceM = arr[4];
            //        item.PriceM2 = arr[3];
            //    }
            //}
            //return rs;
            var rs = from b in _context.SubProducts.Where(x => !x.IsDeleted)
                     join c in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on b.Unit equals c.CodeSet into c1
                     from c2 in c1.DefaultIfEmpty()
                     orderby b.ProductCode
                     select new
                     {
                         //Code = string.Format("{0}_{1}", b.ProductCode, b.AttributeCode),
                         Code = b.ProductQrCode,
                         Name = string.Format("{0}-{1}_{2}", _context.MaterialProducts.FirstOrDefault(p => p.ProductCode.Equals(b.ProductCode)) != null ? _context.MaterialProducts.FirstOrDefault(p => p.ProductCode.Equals(b.ProductCode)).ProductName : null, b.ProductCode, b.AttributeCode),
                         Unit = b.Unit,
                         ProductCode = b.ProductCode,
                         UnitName = c2.ValueSet,
                         b.AttributeCode,
                         b.AttributeName,
                         ProductType = "SUB_PRODUCT",
                         PriceM = b.Value
                     };

            var rs1 = from b in _context.MaterialProducts.Where(x => !x.IsDeleted && x.TypeCode == "FINISHED_PRODUCT")
                      join c in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on b.Unit equals c.CodeSet into c1
                      from c2 in c1.DefaultIfEmpty()
                      orderby b.ProductCode
                      select new
                      {
                          //Code = string.Format("{0}_{1}", b.ProductCode, b.AttributeCode),
                          Code = b.ProductCode,
                          Name = string.Format("Thành phẩm_{0}-{1}", b.ProductName, b.ProductCode),
                          Unit = b.Unit,
                          ProductCode = b.ProductCode,
                          UnitName = c2.ValueSet,
                          AttributeCode = "",
                          AttributeName = "",
                          ProductType = "FINISHED_PRODUCT",
                          PriceM = ""
                      };

            return rs1.Concat(rs);
        }

        public class ListProductRes
        {
            public string Code { get; set; }
            public string Name { get; set; }
            public string Unit { get; set; }
            public string ProductCode { get; set; }
            public string UnitName { get; set; }
            public string AttributeCode { get; set; }
            public string AttributeName { get; set; }
            public string PriceM { get; set; }
            public string PriceM2 { get; set; }
        }
        [HttpPost]
        public object UpdateTaxCodeMedium(decimal taxMedium, decimal costMedium, string lotProductCode)
        {
            var msg = new JMessage();
            var lotProduct = _context.LotProducts.FirstOrDefault(x => x.LotProductCode.Equals(lotProductCode));
            if (lotProduct != null)
            {
                lotProduct.TaxMedium = taxMedium;
                lotProduct.CostMedium = costMedium;

                _context.LotProducts.Update(lotProduct);
                _context.SaveChanges();
            }
            return Json(msg);
        }

        [HttpPost]
        public object InsertProduct([FromBody] LotProductDetail obj)
        {
            JMessage msg = new JMessage();
            var data = _context.LotProductDetails.FirstOrDefault(x => x.LotProductCode == obj.LotProductCode && x.ProductCode == obj.ProductCode && x.IsDeleted == false);
            if (data == null)
            {
                var today = DateTime.Now.ToString("ddMMyyyy-HHmm");

                obj.BarCode = "LO." + obj.LotProductCode + "_SP." + obj.ProductCode + "_SL." + obj.Quantity + "_GIA." + obj.Cost + "_VAT." + obj.Tax + "_T." + today;
                obj.QrCode = "LO." + obj.LotProductCode + "_SP." + obj.ProductCode + "_SL." + obj.Quantity + "_GIA." + obj.Cost + "_VAT." + obj.Tax + "_T." + today;
                obj.CreatedBy = AppContext.UserName;
                obj.CreatedTime = DateTime.Now;
                obj.IsDeleted = false;
                obj.Price = obj.Cost;
                _context.LotProductDetails.Add(obj);
                _context.SaveChanges();
                msg.Object = obj;
                msg.Title = "Thêm thành công";
            }
            else
            {
                msg.Error = true;
                msg.Title = "Đã thêm sản phẩm này vào lô hàng, không thể thêm tiếp";
            }
            return Json(msg);
        }
        [HttpPost]
        public object UpdateProduct([FromBody] LotProductDetail obj)
        {
            JMessage msg = new JMessage();
            var data = _context.LotProductDetails.FirstOrDefault(x => x.Id == obj.Id && x.IsDeleted == false);
            if (data != null)
            {
                var today = DateTime.Now.ToString("ddMMyyyy-HHmm");

                data.BarCode = "LO." + obj.LotProductCode + "_SP." + obj.ProductCode + "_SL." + obj.Quantity + "_GIA." + obj.Cost + "_VAT." + obj.Tax + "_T." + today;
                data.QrCode = "LO." + obj.LotProductCode + "_SP." + obj.ProductCode + "_SL." + obj.Quantity + "_GIA." + obj.Cost + "_VAT." + obj.Tax + "_T." + today;
                data.UpdatedBy = AppContext.UserName;
                data.UpdatedTime = DateTime.Now;
                data.ProductCode = obj.ProductCode;
                data.ProductType = obj.ProductType;
                data.Cost = obj.Cost;
                data.Note = obj.Note;
                data.Tax = obj.Tax;
                data.Quantity = obj.Quantity;
                data.Unit = obj.Unit;
                data.Price = obj.Cost;
                data.Discount = obj.Discount;
                data.Commission = obj.Commission;
                _context.LotProductDetails.Update(data);
                _context.SaveChanges();
                msg.Title = "Cập nhật thành công";
            }
            else
            {
                msg.Error = true;
                msg.Title = "Không tồn tại bản ghi";
            }
            return Json(msg);
        }

        [HttpPost]
        public object GetProductGroup()
        {

            var data = _context.CommonSettings.Where(x => x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.ProductGroup)).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return data;


        }

        [HttpPost]

        public object GetInheritances(string productCode)
        {
            var data = (from a in _context.MaterialProducts
                        where a.IsDeleted == false
                        && a.ProductCode != productCode
                        select new
                        {
                            Code = a.ProductCode,
                            Name = a.ProductName
                        }).ToList();
            return data;
        }

        [HttpPost]
        public object getProductCategoryTypes()
        {
            var data = _context.CommonSettings.Where(x => x.Group == "PRODUCT_CATEGORY_TYPE").Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return data;
        }
        [HttpPost]
        public object GetProductTypes()
        {
            var data = _context.CommonSettings.Where(x => x.Group == "PRODUCT_TYPE").Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return data;
        }

        [HttpPost]
        public JsonResult InsertProductAttribute([FromBody]SubProduct obj)
        {
            JMessage msg = new JMessage();
            try
            {
                var data = _context.SubProducts.FirstOrDefault(x => x.ProductCode.ToLower().Equals(obj.ProductCode.ToLower()) && x.AttributeCode.ToLower().Equals(obj.AttributeCode.ToLower()) && x.IsDeleted == false);
                if (data != null)
                {
                    msg.Error = true;
                    msg.Title = "Đã tồn tại thuộc tính mở rộng của sản phẩm này, không thể thêm tiếp";
                }
                else
                {
                    obj.CreatedTime = DateTime.Now;
                    obj.CreatedBy = AppContext.UserName;
                    obj.IsDeleted = false;
                    _context.SubProducts.Add(obj);
                    _context.SaveChanges();
                    msg.Error = false;
                    msg.Title = "Thêm thành công";
                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi thêm";
            }
            return Json(msg);
        }
        [HttpPost]
        public object JTableExtend([FromBody]JtableExtendModel jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.SubProducts

                        where a.ProductCode == jTablePara.ProductCode
                        && a.IsDeleted == false
                        select new
                        {
                            a.Id,
                            a.AttributeCode,
                            a.AttributeName,
                            a.Value,
                            a.Note,
                            a.CreatedTime,
                            a.Unit
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).AsNoTracking().ToList();
            var data1 = data.Skip(intBeginFor).Take(jTablePara.Length).ToList();
            var jdata = JTableHelper.JObjectTable(data1, jTablePara.Draw, count, "id", "AttributeCode", "AttributeName", "Value", "Note", "CreatedTime", "Unit");

            return Json(jdata);
        }

        [HttpPost]
        public object DeleteAttribute(int Id)
        {
            JMessage msg = new JMessage();
            var data = _context.SubProducts.FirstOrDefault(x => x.Id == Id && x.IsDeleted == false);
            if (data != null)
            {
                data.IsDeleted = true;
                _context.SubProducts.Update(data);
                _context.SaveChanges();
                msg.Error = false;
                msg.Title = "Xóa thành công";
            }
            else
            {
                msg.Error = true;
                msg.Title = "Thuộc tính không tồn tại hoặc đã bị xóa";
            }
            return Json(msg);
        }

        [HttpPost]
        public object UpdateAttribute([FromBody]SubProduct obj)
        {
            JMessage msg = new JMessage();
            var data = _context.SubProducts.FirstOrDefault(x => x.Id == obj.Id && x.IsDeleted == false);
            if (data != null)
            {
                data.AttributeCode = obj.AttributeCode;
                data.AttributeName = obj.AttributeName;
                data.Value = obj.Value;
                data.Note = obj.Note;
                data.UpdatedTime = DateTime.Now;
                data.UpdatedBy = AppContext.UserName;
                _context.SubProducts.Update(data);
                _context.SaveChanges();
                msg.Error = false;
                msg.Title = "Cập nhật thành công";
            }
            else
            {
                msg.Error = true;
                msg.Title = "Thuộc tính không tồn tại hoặc đã bị xóa";
            }
            return Json(msg);
        }
        [HttpPost]
        public object GetAttributeItem(int id)
        {
            JMessage msg = new JMessage();
            var data = _context.SubProducts.FirstOrDefault(x => x.Id == id && x.IsDeleted == false);
            if (data != null)
            {
                msg.Object = data;
            }
            else
            {
                msg.Error = true;
                msg.Title = "Thuộc tính không tồn tại hoặc đã bị xóa";
            }
            return Json(msg);
        }

        [HttpPost]
        public object UploadImage(IFormFile fileUpload)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var upload = _upload.UploadImage(fileUpload);
                msg.Object = upload.Object;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("CATEGORY_MSG_UPLOAD_FILE"));
            }
            return Json(msg);
        }


        [HttpPost]
        public JsonResult InsertFile(ProductLotFile obj, IFormFile fileUpload)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var getRepository = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == obj.RepoCode);
                if (getRepository != null)
                {
                    //add custemp file
                    var productLotFile = new ProductLotFile
                    {
                        ProductCode = obj.ProductCode,
                        FileCode = string.Concat("PRODUCT", Guid.NewGuid().ToString()),
                        Type = "PRODUCT"
                    };
                    _context.ProductLotFiles.Add(productLotFile);
                    _context.SaveChanges();
                    var upload = _upload.UploadFile(fileUpload, Path.Combine(_hostingEnvironment.WebRootPath, getRepository.PathPhysic));
                    //add File
                    var file = new EDMSFile
                    {
                        FileCode = productLotFile.FileCode,
                        FileName = obj.FileName,
                        Desc = obj.Desc,
                        ReposCode = obj.RepoCode,
                        FileSize = fileUpload.Length,
                        FileTypePhysic = Path.GetExtension(fileUpload.FileName),
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now,
                        Url = Path.Combine(getRepository.PathPhysic, upload.Object.ToString()),
                        MimeType = fileUpload.ContentType
                    };
                    _context.EDMSFiles.Add(file);
                    _context.SaveChanges();
                    msg.Title = "Thêm tệp tin thành công!";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Kho dữ liệu không tồn tại!";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra!";
                msg.Object = ex;
            }
            return Json(msg);
        }
        [HttpPost]
        public object JTableFile([FromBody]JTableProductFile jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            if (jTablePara.ProductCode == null)
            {
                return JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "ContractNoteId", "Title", "ContractCode", "Note", "Tags", "CreatedBy", "CreatedTime");
            }
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var query = from a in _context.ProductLotFiles
                        join b in _context.EDMSFiles on a.FileCode equals b.FileCode
                        where a.ProductCode == jTablePara.ProductCode && b.IsDeleted == false
                        && ((fromDate == null) || (b.CreatedTime.HasValue && b.CreatedTime.Value.Date >= fromDate))
                        && ((toDate == null) || (b.CreatedTime.HasValue && b.CreatedTime.Value.Date <= toDate))
                        && a.Type == "PRODUCT"
                        select new
                        {
                            a.Id,
                            b.FileName,
                            b.FileTypePhysic,
                            b.Desc,
                            b.Url,
                            b.CreatedTime,
                            b.UpdatedTime,
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "FileName", "FileTypePhysic", "Desc", "Url", "CreatedTime", "UpdatedTime");
            return Json(jdata);
        }
        [HttpPost]
        public JsonResult DeleteFile(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.ProductLotFiles.FirstOrDefault(x => x.Id == id);
                _context.ProductLotFiles.Remove(data);

                var file = _context.EDMSFiles.FirstOrDefault(x => x.FileCode == data.FileCode);
                _context.EDMSFiles.Remove(file);

                _context.SaveChanges();
                msg.Title = "Xóa tệp tin thành công";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = "Có lỗi khi xóa tệp tin!";
            }
            return Json(msg);
        }
        [HttpGet]
        public JsonResult GetFile(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.ProductLotFiles.Single(m => m.Id == id);
                if (data != null)
                {
                    var file = _context.EDMSFiles.FirstOrDefault(x => x.FileCode == data.FileCode);
                    var model = new ProductLotFile
                    {
                        RepoCode = file.ReposCode,
                        FileName = file.FileName,
                        Desc = file.Desc,
                        Id = data.Id,
                    };
                    msg.Object = model;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Tệp tin không tồn tại!";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = "Có lỗi khi lấy tệp tin!";
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult UpdateFile(SupplierFile obj, IFormFile fileUpload)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var getRepository = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == obj.RepoCode);
                if (getRepository != null)
                {
                    var data = _context.ProductLotFiles.FirstOrDefault(x => x.Id == obj.Id);
                    var file = _context.EDMSFiles.FirstOrDefault(x => x.FileCode == data.FileCode);
                    file.FileName = obj.FileName;
                    file.Desc = obj.Desc;
                    file.ReposCode = obj.RepoCode;
                    if (fileUpload != null && fileUpload.Length != 0)
                    {
                        var upload = _upload.UploadFile(fileUpload, Path.Combine(_hostingEnvironment.WebRootPath, getRepository.PathPhysic));
                        file.FileSize = fileUpload.Length;
                        file.FileTypePhysic = Path.GetExtension(fileUpload.FileName);
                        file.Url = Path.Combine(getRepository.PathPhysic, upload.Object.ToString());
                        file.MimeType = fileUpload.ContentType;
                    }
                    file.UpdatedBy = ESEIM.AppContext.UserName;
                    file.UpdatedTime = DateTime.Now;

                    _context.EDMSFiles.Update(file);
                    _context.SaveChanges();
                    msg.Title = "Chỉnh sửa tệp tin thành công!";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Kho dữ liệu không tồn tại!";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = "Có lỗi xảy ra!";
            }
            return Json(msg);
        }

        #region Lot Product
        [HttpPost]
        public JsonResult GetSupplier()
        {
            var query = from a in _context.Suppliers
                        where a.IsDeleted == false
                        && !string.IsNullOrEmpty(a.SupCode)
                        select new
                        {
                            Code = a.SupCode,
                            Name = a.SupName
                        };
            var list = query.ToList();
            return Json(list);
        }

        [HttpPost]
        public object JTableProduct([FromBody]JTableProductCustom jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query2 = from a in _context.LotProductDetails.Where(x => !x.IsDeleted && x.ProductType == "FINISHED_PRODUCT")
                         join b in _context.MaterialProducts on a.ProductCode equals b.ProductCode into b2
                         from b1 in b2.DefaultIfEmpty()
                         join c in _context.Users.Where(x => x.Active) on a.CreatedBy equals c.UserName into c2
                         from c1 in c2.DefaultIfEmpty()
                         where a.IsDeleted == false
                         && a.LotProductCode == jTablePara.LotProductCode
                         select new JTableProductRes
                         {
                             Id = a.Id,
                             ProductCode = a.ProductCode,
                             ProductName = b1.ProductName,
                             ProductType = "FINISHED_PRODUCT",
                             Quantity = a.Quantity,
                             CreatedTime = a.CreatedTime,
                             CreatedBy = (c1 != null ? c1.GivenName : ""),
                             LotProductCode = a.LotProductCode,
                             Cost = a.Cost,
                             Tax = a.Tax,
                             Discount = a.Discount,
                             Commission = a.Commission,
                             Note = a.Note,
                             sQrCode = a.QrCode,
                             sBarCode = a.BarCode
                         };
            var query1 = from a in _context.LotProductDetails.Where(x => !x.IsDeleted && x.ProductType == "SUB_PRODUCT")
                         join b in _context.SubProducts on a.ProductCode equals b.ProductQrCode into b2
                         from b1 in b2.DefaultIfEmpty()
                         join c in _context.Users.Where(x => x.Active) on a.CreatedBy equals c.UserName into c2
                         from c1 in c2.DefaultIfEmpty()
                         where a.IsDeleted == false
                         && a.LotProductCode == jTablePara.LotProductCode
                         select new JTableProductRes
                         {
                             Id = a.Id,
                             ProductCode = a.ProductCode,
                             ProductName = (b1 != null ? b1.AttributeName : ""),
                             ProductType = "SUB_PRODUCT",
                             Quantity = a.Quantity,
                             CreatedTime = a.CreatedTime,
                             CreatedBy = (c1 != null ? c1.GivenName : ""),
                             LotProductCode = a.LotProductCode,
                             Cost = a.Cost,
                             Tax = a.Tax,
                             Discount = a.Discount,
                             Commission = a.Commission,
                             Note = a.Note,
                             sQrCode = a.QrCode,
                             sBarCode = a.BarCode
                         };
            var query = query2.Concat(query1);
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).AsNoTracking().ToList();
            var data1 = data.Skip(intBeginFor).Take(jTablePara.Length).ToList();
            foreach (var item in data1)
            {
                item.sQrCode = CommonUtil.GenerateQRCode(item.sQrCode);
                item.sBarCode = CommonUtil.GenerateBarCode(item.sBarCode);
            }
            var jdata = JTableHelper.JObjectTable(data1, jTablePara.Draw, count, "id", "ProductCode", "ProductName", "ProductType", "Quantity", "CreatedTime", "CreatedBy", "LotProductCode", "Cost", "Tax", "Discount", "Commission", "Note", "sQrCode", "sBarCode");
            return Json(jdata);
        }

        [HttpPost]
        public object GetTaxCostMedium(string lotProductCode)
        {
            var data = new DataTaxCostMedium();

            var query = (from a in _context.LotProductDetails
                         join b in _context.SubProducts on a.ProductCode equals b.ProductQrCode into b2
                         from b1 in b2.DefaultIfEmpty()
                         where a.IsDeleted == false
                         && a.LotProductCode == lotProductCode
                         select new JTableProductRes
                         {
                             Id = a.Id,
                             ProductCode = a.ProductCode,
                             ProductName = (b1 != null ? b1.AttributeName : ""),
                             Quantity = a.Quantity,
                             CreatedTime = a.CreatedTime,
                             CreatedBy = a.CreatedBy,
                             LotProductCode = a.LotProductCode,
                             Cost = a.Cost,
                             Tax = a.Tax,
                             Note = a.Note,
                             sQrCode = a.QrCode,
                             sBarCode = a.BarCode
                         }).ToList();

            if (query.Count > 0)
            {
                var taxMedium = query.Sum(x => x.Tax * x.Quantity) / query.Sum(x => x.Quantity);
                var CostMedium = query.Sum(x => x.Cost * x.Quantity) / query.Sum(x => x.Quantity);

                data.TaxMedium = Math.Round(taxMedium, 1);
                data.CostMedium = Math.Round(CostMedium, 1);

                UpdateTaxCodeMedium(data.TaxMedium, data.CostMedium, lotProductCode);
            }

            return Json(data);
        }

        [HttpPost]
        public JsonResult DeleteProduct(int id)
        {
            JMessage msg = new JMessage();
            var data = _context.LotProductDetails.FirstOrDefault(x => x.Id == id && x.IsDeleted == false);
            if (data != null)
            {
                data.IsDeleted = true;
                data.DeletedBy = AppContext.UserName;
                data.DeletedTime = DateTime.Now;
                _context.LotProductDetails.Update(data);
                _context.SaveChanges();
                msg.Error = false;
                msg.Title = "Xóa thành công";
            }
            else
            {
                msg.Error = true;
                msg.Title = "Sản phẩm đã bị xóa, vui lòng kiểm tra lại";
            }
            return Json(msg);
        }

        [HttpPost]
        public object GetOrigin()
        {
            var data = _context.CommonSettings.Where(x => x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Origin)).Select(x => new { Code = x.ValueSet, Name = x.ValueSet });
            return data;
        }
        [HttpPost]
        public object GetStore()
        {
            var store = _context.EDMSWareHouses.AsParallel().Where(x => x.WHS_Flag != true && x.Type == "PR").Select(x => new { Id = x.Id, Name = x.WHS_Name });
            return store;
        }

        [HttpPost]
        public object GetFiles(string lotProductCode)
        {
            var query = from a in _context.ProductLotFiles
                        join b in _context.EDMSFiles on a.FileCode equals b.FileCode into b2
                        from b1 in b2.DefaultIfEmpty()
                        where a.ProductCode.ToLower().Equals(lotProductCode.ToLower())
                        orderby a.Id descending
                        select new
                        {
                            FileCode = a.FileCode,
                            FileName = (b1 != null ? b1.FileName : ""),
                            FilePath = (b1 != null ? b1.Url : ""),
                            FileType = (a.Type)
                        };
            return query.ToList();
        }

        [HttpPost]
        public string GetQrCodeFromString(string content)
        {
            var qr = CommonUtil.GenerateQRCode(content);
            if (string.IsNullOrEmpty(qr))
                return "";
            return qr;
        }
        [HttpPost]
        public string GetBarCodeFromString(string content)
        {
            var qr = CommonUtil.GenerateBarCode(content);
            if (string.IsNullOrEmpty(qr))
                return "";
            return qr;
        }
        //public string FileName { get; set; }
        //public string FilePath { get; set; }
        //public string FileType { get; set; }

        #endregion
        public class JtableExtendModel : JTableModel
        {
            public string ProductCode { get; set; }
        }

        public class JTableProductFile : JTableModel
        {
            public string ProductCode { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
        }
        public class JTableProductRes
        {
            public int Id { get; set; }
            public string ProductCode { get; set; }
            public string ProductName { get; set; }
            public string ProductType { get; set; }
            public decimal Quantity { get; set; }
            public DateTime? CreatedTime { get; set; }
            public string CreatedBy { get; set; }
            public string LotProductCode { get; set; }
            public decimal Cost { get; set; }
            public int Tax { get; set; }
            public int? Discount { get; set; }
            public int? Commission { get; set; }
            public string Note { get; set; }
            public string sQrCode { get; set; }
            public string sBarCode { get; set; }
        }

        public class JTableLotProductRes
        {
            public int Id { get; set; }
            public string QrCode { get; set; }
            public string BarCode { get; set; }
            public string Title { get; set; }
            public string Supplier { get; set; }
            public string SupplierName { get; set; }
            public decimal Cost { get; set; }
            public DateTime? ExpiryDate { get; set; }
            public DateTime CreatedTime { get; set; }
            public string CreatedBy { get; set; }
            public string CreatedByName { get; set; }
            public string PathImg { get; set; }
            public string Packing { get; set; }
            public string Store { get; set; }
            public string LotProductName { get; set; }
            public string sQrCode { get; set; }
            public string sBarCode { get; set; }

        }

        public class DataTaxCostMedium
        {
            public decimal TaxMedium { get; set; }
            public decimal CostMedium { get; set; }
        }

    }
}