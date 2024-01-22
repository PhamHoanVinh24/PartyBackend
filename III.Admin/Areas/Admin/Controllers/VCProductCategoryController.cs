using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
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
using ESEIM;
using System.IO;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class VCProductCategoryController : BaseController
    {
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly EIMDBContext _context;
        private readonly AppSettings _appSettings;
        private readonly IUploadService _upload;


        public class JTableModelCustom : JTableModel
        {
            public string ProductCode { get; set; }
            public string ProductName { get; set; }
        }
        public VCProductCategoryController(EIMDBContext context, IUploadService upload, IOptions<AppSettings> appSettings, IHostingEnvironment hostingEnvironment)
        {
            _context = context;
            _hostingEnvironment = hostingEnvironment;
            _appSettings = appSettings.Value;
            _upload = upload;
        }

        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public object JTable([FromBody]JTableModelCustom jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            try
            {
                var query = from a in _context.VcProductCats.Where(x => x.IsDeleted != true)
                            join b in _context.CommonSettings.Where(x => x.Group == "VC_PRODUCT_GROUP") on a.ProductGroup equals b.CodeSet into b1
                            from b2 in b1.DefaultIfEmpty()
                            where (string.IsNullOrEmpty(jTablePara.ProductCode) || a.ProductCode.ToLower().Contains(jTablePara.ProductCode.ToLower()))
                            && (string.IsNullOrEmpty(jTablePara.ProductName)
                            || (!string.IsNullOrEmpty(a.ProductName) && a.ProductName.ToString().ToLower().Contains(jTablePara.ProductName.ToLower()))
                            )
                            select new
                            {
                                a.Id,
                                a.ProductCode,
                                a.ProductName,
                                a.PathImg,
                                a.Note,
                                a.ProductGroup,
                                a.Unit,
                                ProductGroupName = b2.ValueSet,
                            };
                var count = query.Count();
                var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "ProductCode", "ProductName", "PathImg", "Note", "Unit", "ProductGroupName");
                return Json(jdata);
            }
            catch (Exception ex)
            {
                return Json(ex.Message);
            }

        }

        [HttpPost]
        public JsonResult Insert([FromBody]VcProductCat obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var checkExist = _context.VcProductCats.FirstOrDefault(x => x.ProductCode == obj.ProductCode && x.IsDeleted == false);
                if (checkExist == null)
                {
                    obj.CreatedBy = ESEIM.AppContext.UserName;
                    obj.CreatedTime = DateTime.Now;

                    _context.VcProductCats.Add(obj);
                    _context.SaveChanges();
                    msg.Title = "Thêm sản phẩm thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Mã sản phẩm đã tồn tại";
                }
            }
            catch
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi thêm ";
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Update([FromBody]VcProductCat obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                obj.UpdatedBy = ESEIM.AppContext.UserName;
                obj.UpdatedTime = DateTime.Now;

                if (obj.PathImg != null)
                    obj.PathImg = obj.PathImg;
                _context.VcProductCats.Update(obj);
                _context.SaveChanges();
                msg.Title = "Cập nhập sản phẩm thành công";
            }
            catch
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi cập nhập!";
            }
            return Json(msg);
        }


        [HttpPost]
        public JsonResult Delete(int Id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.VcProductCats.FirstOrDefault(x => x.Id == Id);

                var isHasCustomerCare = _context.VcCustomerCares.Any(x => !x.IsDeleted && x.ProductCode == data.ProductCode);
                if (isHasCustomerCare)
                {
                    msg.Error = true;
                    msg.Title = "Không thể xóa sản phẩm đã được sử dụng trong kế hoạch!";
                }
                else
                {
                    data.IsDeleted = true;
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;

                    _context.VcProductCats.Update(data);
                    _context.SaveChanges();
                    msg.Title = "Xóa sản phẩm thành công!";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi xóa sản phẩm!";
            }
            return Json(msg);
        }

        [HttpGet]
        public object GetItem(int id)
        {

            var a = _context.VcProductCats.AsNoTracking().Single(m => m.Id == id);
            return Json(a);
        }


        [HttpPost]
        public object GetProductUnit()
        {

            var data = _context.CommonSettings.Where(x => x.Group == "VC_UNIT" && x.IsDeleted != true).Select(x => new { Code = x.CodeSet, Value = x.ValueSet });
            return data;
        }

        [HttpPost]

        public object GetProductGroup()
        {
            var data = _context.CommonSettings.Where(x => x.Group == "VC_PRODUCT_GROUP" && x.IsDeleted != true).Select(x => new { Code = x.CodeSet, Value = x.ValueSet });
            return data;
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
                msg.Title = "Có lỗi xảy ra khi upload file ảnh!";
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult UploadFile(IFormFile file)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var upload = _upload.UploadFile(file, Path.Combine(_hostingEnvironment.WebRootPath, "uploads\\files"));
                msg.Object = upload.Object;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra khi upload file hướng dẫn sử dụng!";
            }
            return Json(msg);
        }
    }
}