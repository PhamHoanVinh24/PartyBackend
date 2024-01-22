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

namespace ESEIM.Controllers
{
    [Area("Admin")]
    public class ImpTicketHeaderController : BaseController
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
        public ImpTicketHeaderController(EIMDBContext context, IUploadService upload, ILogger<CategoryController> logger, IOptions<AppSettings> appSettings, IHostingEnvironment hostingEnvironment, IActionLogService actionLog)
        {

            _context = context;
            _logger = logger;
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

            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.LotProducts
                        join b in _context.Suppliers on a.Supplier equals b.SupCode into b2
                        from b1 in b2.DefaultIfEmpty()
                        join c in _context.Users on a.CreatedBy equals c.UserName into c2
                        from c1 in c2.DefaultIfEmpty()
                        where a.IsDeleted == false
                        && (CreatedDate==null||(a.CreatedTime.Date== CreatedDate.Value.Date))
                        && (ExpiryDate == null || (a.ExpiryDate!=null&&a.ExpiryDate.Value.Date == ExpiryDate.Value.Date))
                        && (string.IsNullOrEmpty(jTablePara.QrCode)||a.QrCode.ToLower().Contains(jTablePara.QrCode.ToLower()))
                        && (string.IsNullOrEmpty(jTablePara.BarCode) || a.BarCode.ToLower().Contains(jTablePara.BarCode.ToLower()))
                        && (string.IsNullOrEmpty(jTablePara.Title) || a.Title.ToLower().Contains(jTablePara.Title.ToLower()))
                        && (string.IsNullOrEmpty(jTablePara.Supplier) || (b1!=null&&b1.SupCode== jTablePara.Supplier))
                        select new
                        {
                            a.Id,
                            a.QrCode,
                            a.BarCode,
                            a.Title,
                            a.Supplier,
                            SupplierName = (b1 != null ? b1.SupName : ""),
                            a.Cost,
                            a.ExpiryDate,
                            a.CreatedTime,
                            a.CreatedBy,
                            CreatedByName = (c1 != null ? c1.GivenName : ""),
                            a.PathImg,
                            a.Packing
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).AsNoTracking().ToList();
            var data1 = data.Skip(intBeginFor).Take(jTablePara.Length).ToList();
            var jdata = JTableHelper.JObjectTable(data1, jTablePara.Draw, count, "id", "QrCode", "BarCode", "Title", "Supplier", "SupplierName", "Cost", "ExpiryDate", "CreatedTime", "CreatedBy", "CreatedByName", "PathImg", "Packing");
            return Json(jdata);
        }

        //--------------------------------thêm mới---------------------------   
        [HttpPost]
        public object Insert([FromBody]LotProduct obj)
        {
            var expiryDate = !string.IsNullOrEmpty(obj.sExpiryDate) ? DateTime.ParseExact(obj.sExpiryDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var msg = new JMessage();
            try
            {
                obj.CreatedBy = AppContext.UserName;
                obj.CreatedTime = DateTime.Now;
                obj.IsDeleted = false;
                obj.ExpiryDate = expiryDate;
                obj.LotProductCode = Guid.NewGuid().ToString();
                _context.LotProducts.Add(obj);
                _context.SaveChanges();
                msg.Error = false;
                msg.Title = "thêm thành công";
                msg.Object = obj;

            }
            catch(Exception ex)
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
                var product = _context.LotProducts.FirstOrDefault(x=>x.Id==obj.Id&&x.IsDeleted==false);
                if(product!=null)
                {
                    product.QrCode = obj.QrCode;
                    product.BarCode = obj.BarCode;
                    product.Title = obj.Title;
                    product.Supplier = obj.Supplier;
                    product.Cost = obj.Cost;
                    product.ExpiryDate = expiryDate;
                    product.Unit = obj.Unit;
                    product.PathImg = obj.PathImg;
                    product.UpdatedTime = DateTime.Now;
                    product.UpdatedBy = AppContext.UserName;

                    product.Tax = obj.Tax;
                    product.CustomFee = obj.CustomFee;
                    product.PoundAge = obj.PoundAge;
                    product.TransferCost = obj.TransferCost;
                    product.Discount = obj.Discount;
                    product.Note = obj.Note;

                    _context.SaveChanges();
                    msg.Error = false;
                    msg.Title = "Cập nhật thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Lô sản phẩm không tồn tại hoặc đã bị xóa, vui lòng kiểm tra lại";
                }
                

                return msg;
            }
            catch(Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_UPDATE_FAILED"), CommonUtil.ResourceValue("CATEGORY_MSG_PRODUCT"));
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
                if(data!=null)
                {
                    data.IsDeleted = true;
                    _context.LotProducts.Update(data);
                    _context.SaveChanges();
                    msg.Error = false;
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_SUCCESS"), CommonUtil.ResourceValue("CATEGORY_MSG_PRODUCT"));
                }
                
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_FAIL"), CommonUtil.ResourceValue("CATEGORY_MSG_PRODUCT"));
                return Json(msg);
            }
        }


        public object GetItemDetail(int id)
        {
            var listCommon = _context.CommonSettings.Select(x => new { x.CodeSet, x.ValueSet });
            //ProductCat query=new ProductCat();
            var query = from ad in _context.ProductCats

                        join b in listCommon on ad.Unit equals b.CodeSet into b1
                        from b in b1.DefaultIfEmpty()
                        join c in listCommon on ad.ProductGroup equals c.CodeSet into c1
                        from c in c1.DefaultIfEmpty()
                        where ad.ProductID == id
                        select new
                        {
                            ProductCode = ad.ProductCode,
                            ProductName = ad.ProductName,
                            PathImg = ad.PathImg,
                            Note = ad.Note,
                            Unit = b != null ? b.ValueSet : "Không xác định",
                            ProductGroup = c != null ? c.ValueSet : "Không xác định",
                        };
            ProductCat query1 = new ProductCat();

            //var a = _context.ProductCats.AsNoTracking().Single(m => m.ProductID == id);
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

            var data = _context.CommonSettings.Where(x => x.Group == "UNIT").Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return data;


        }

        [HttpPost]
        public object GetProduct()
        {

            var data = _context.ProductCats.Where(x => x.IsDeleted==false).Select(x => new { Code = x.ProductCode, Name = x.ProductName });
            return data;
        }
        [HttpPost]
        public object InsertProduct([FromBody] LotProductDetail obj)
        {
            JMessage msg = new JMessage();
            var data = _context.LotProductDetails.FirstOrDefault(x=>x.LotProductCode==obj.LotProductCode&&x.ProductCode==obj.ProductCode&&x.IsDeleted==false);
            if (data == null)
            {
                obj.CreatedBy = AppContext.UserName;
                obj.CreatedTime = DateTime.Now;
                obj.IsDeleted = false;
                _context.LotProductDetails.Add(obj);
                _context.SaveChanges();
                msg.Title = "Thêm thành công";
            }
            else {
                msg.Error = true;
                msg.Title = "Đã thêm sản phẩm này vào lô hàng, không thể thêm tiếp";
            }
            return Json(msg);
        }
        [HttpPost]
        public object UpdateProduct([FromBody] LotProductDetail obj)
        {
            JMessage msg = new JMessage();
            var data = _context.LotProductDetails.FirstOrDefault(x => x.Id==obj.Id && x.IsDeleted == false);
            if (data != null)
            {
                data.UpdatedBy = AppContext.UserName;
                data.UpdatedTime = DateTime.Now;
                data.ProductCode = obj.ProductCode;
                data.Quantity = obj.Quantity;
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

            var data = _context.CommonSettings.Where(x => x.Group == "PRODUCT_GROUP").Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return data;


        }

        [HttpPost]

        public object GetInheritances(string productCode)
        {
            var data = (from a in _context.ProductCats
                        where a.IsDeleted == false
                        && a.ProductCode!= productCode
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
        public JsonResult InsertProductAttribute([FromBody]ProductAttribute obj)
        {
            JMessage msg = new JMessage();
            try
            {
                var data = _context.ProductAttributes.FirstOrDefault(x => x.ProductCode.ToLower().Equals(obj.ProductCode.ToLower()) && x.AttributeCode.ToLower().Equals(obj.AttributeCode.ToLower()) && x.IsDeleted == false);
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
                    _context.ProductAttributes.Add(obj);
                    _context.SaveChanges();
                    msg.Error = false;
                    msg.Title = "Thêm thành công";
                }

            }
            catch (Exception ex) {
                msg.Error = true;
                msg.Title = "Có lỗi khi thêm";
            }
            return Json(msg);
        }
        [HttpPost]
        public object JTableExtend([FromBody]JtableExtendModel jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.ProductAttributes
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
            var data = _context.ProductAttributes.FirstOrDefault(x=>x.Id==Id&&x.IsDeleted==false);
            if(data!=null)
            {
                data.IsDeleted = true;
                _context.ProductAttributes.Update(data);
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
        public object UpdateAttribute([FromBody]ProductAttribute obj)
        {
            JMessage msg = new JMessage();
            var data = _context.ProductAttributes.FirstOrDefault(x => x.Id == obj.Id && x.IsDeleted == false);
            if (data != null)
            {
                data.AttributeCode = obj.AttributeCode;
                data.AttributeName = obj.AttributeName;
                data.Value = obj.Value;
                data.Note = obj.Note;
                data.UpdatedTime = DateTime.Now;
                data.UpdatedBy = AppContext.UserName;
                _context.ProductAttributes.Update(data);
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
            var data = _context.ProductAttributes.FirstOrDefault(x => x.Id == id && x.IsDeleted == false);
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
                        && a.Type=="PRODUCT"
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
            var query = from a in _context.LotProductDetails
                        join b in _context.ProductCats on a.ProductCode equals b.ProductCode into b2
                        from b1 in b2.DefaultIfEmpty()
                        where a.IsDeleted == false
                        && a.LotProductCode == jTablePara.LotProductCode
                        select new
                        {
                            a.Id,
                            a.ProductCode,
                            ProductName = (b1 != null ? b1.ProductName : ""),
                            a.Quantity,
                            a.CreatedTime,
                            a.CreatedBy,
                            a.LotProductCode
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).AsNoTracking().ToList();
            var data1 = data.Skip(intBeginFor).Take(jTablePara.Length).ToList();
            var jdata = JTableHelper.JObjectTable(data1, jTablePara.Draw, count, "id", "ProductCode", "ProductName", "Quantity", "CreatedTime", "CreatedBy", "LotProductCode");
            return Json(jdata);
        }

        [HttpPost] 
        public JsonResult DeleteProduct(int id)
        {
            JMessage msg = new JMessage();
            var data = _context.LotProductDetails.FirstOrDefault(x=>x.Id==id&&x.IsDeleted==false);
            if(data!=null)
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

        
    }
}