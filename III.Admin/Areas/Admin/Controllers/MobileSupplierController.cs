using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System;
using System.Linq;
using DocumentFormat.OpenXml.Spreadsheet;
using Quartz;
using OpenXmlPowerTools;
using System.Globalization;

namespace III.Admin.Areas.Admin.Controllers
{
    public class MobileSupplierController : Controller
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IRepositoryService _repositoryService;
        public MobileSupplierController(EIMDBContext context)
        {
            _context = context;
        }
        public IActionResult OrderSupplierReview()
        {
            try {
                return View(_context.OrderSupplierReviews.ToList());
            }
            catch (Exception ex)
            {
                return NotFound();
            }
        }
        public IActionResult OrderSupplierReviewDetail()
        {
            try
            {
                return View(_context.OrderSupplierReviewDetails.ToList());
            }
            catch (Exception ex)
            {
                return NotFound();
            }
        }
        public class OrderSupplierReviewModel
        {
            public int Id { get; set; }
            public string ReviewCode { get; set; }
            public string TitleReview { get; set; }
            public string CreatorTicket { get; set; }

            public string DateReviewTicket { get; set; }
            public string Status { get; set; }
            public string Noted { get; set; }
            public string SupplierResultReview { get; set; }
            public string CreatedBy { get; set; }

            public DateTime? CreatedTime { get; set; }
            public string Flag { get; set; }
        }

        public class JTableModel : OrderSupplierReviewModel
        {
            public string ReviewCode { get; set; }
            public int CurrentPageView { get; set; }
            public int Length { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string KeyWork { get; set; }
        }

        [HttpPost] 
        public object GetListOrderSupplier(JTableModel obj)
        {
            JMessage msg = new JMessage { Error = false };
            try
            {
                var fromDate = !string.IsNullOrEmpty(obj.FromDate)
                   ? DateTime.ParseExact(obj.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture)
                   : (DateTime?)null;
                var toDate = !string.IsNullOrEmpty(obj.ToDate)
                    ? DateTime.ParseExact(obj.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture)
                    : (DateTime?)null;
                int intBeginFor = (obj.CurrentPageView - 1) * obj.Length;
                var query = from a in _context.OrderSupplierReviews
                            join b in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "ORDER_SUPPLIER")
                                on a.Status equals b.CodeSet into b1
                            from c2 in b1.DefaultIfEmpty()
                            where (string.IsNullOrEmpty(obj.ReviewCode) || obj.ReviewCode == a.ReviewCode) &&
                                     ((fromDate == null) || (a.CreatedTime.HasValue && a.CreatedTime.Value.Date >= fromDate)) &&
                                     ((toDate == null) || (a.CreatedTime.HasValue && a.CreatedTime.Value.Date <= toDate)) &&
                                     (string.IsNullOrEmpty(obj.KeyWork) || a.TitleReview.ToLower().Contains(obj.KeyWork.ToLower())) &&
                                     (string.IsNullOrEmpty(obj.Status) || a.Status.Equals(obj.Status))
                            select new
                            {
                                a.Id,
                                a.DateReviewTicket,
                                a.CreatorTicket,
                                a.TitleReview,
                                a.ReviewCode,
                                a.SupplierResultReview,
                                a.Status,
                                a.CreatedBy,
                                a.CreatedTime,
                                a.Noted,
                                status = c2 != null ? c2.ValueSet : "",
                                statusName = a.Status != null ? _context.CommonSettings.FirstOrDefault(y => y.CodeSet == a.Status).ValueSet : "",
                                supplierName = a.CreatorTicket != null ? _context.HREmployees.FirstOrDefault(y => y.employee_code == a.CreatorTicket).fullname : ""
                            };
                var count = query.Count();
                var data = query.OrderByDescending(x => x.Id).Skip(intBeginFor).Take(obj.Length).AsNoTracking().ToList();
                msg.Object = new
                {
                    count = count,
                    data = data
                };
            }
            catch(Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi lấy dữ liệu!";
            }
            return Json(msg);
        }
        public class JTableDetailModel : OrderSupplierReviewDetail
        {
            public string ReviewCode { get; set; }
            public int CurrentPageView { get; set; }
            public int Length { get; set; }
        }
        [HttpPost]
        public object GetListOrderSupplierDetail(JTableDetailModel obj)
        {
            JMessage msg = new JMessage { Error = false };
            try
            {
                int intBeginFor = (obj.CurrentPageView - 1) * obj.Length;
                var query = from a in _context.OrderSupplierReviewDetails.Where(x => x.ReviewCode == obj.ReviewCode)
                            join b in _context.OrderSupplierReviews on a.ReviewCode equals b.ReviewCode
                            join c in _context.MaterialProducts.Where(x => !x.IsDeleted) on a.ProductCode equals c.ProductCode
                            join d in _context.Suppliers on a.SupplierCode equals d.SupCode
                            select new
                            {
                                a.Id,
                                a.ReviewCode,
                                c.ProductCode,
                                c.ProductName,
                                a.SupplierCode,
                                d.SupName,
                                a.QcSystem,
                                a.Pricing,
                                a.Unit,
                                a.PaymentMethod,
                                a.DeliveryTime,
                                a.Reputation,
                                a.ResultReview,
                                unitName = a.Unit != null ? _context.CommonSettings.FirstOrDefault(y => y.CodeSet == a.Unit).ValueSet : "",
                                paymentName = a.PaymentMethod != null ? _context.CommonSettings.FirstOrDefault(y => y.CodeSet == a.PaymentMethod).ValueSet : "",
                                a.Noted

                            };
                var count = query.Count();
                var data = query.OrderByDescending(x => x.Id).Skip(intBeginFor).Take(obj.Length).AsNoTracking().ToList();
                msg.Object = new
                {
                    count = count,
                    data = data
                };
            }
            catch
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi lấy dữ liệu!";
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult InsertOrderSupplier([FromBody] OrderSupplierReviewModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var checkExist = _context.OrderSupplierReviews.FirstOrDefault(x => x.ReviewCode == obj.ReviewCode);
                if (checkExist == null)
                {
                    var data = new OrderSupplierReview()
                    {
                        ReviewCode = Guid.NewGuid().ToString(),
                        TitleReview = obj.TitleReview,
                        CreatorTicket = obj.CreatorTicket,
                        DateReviewTicket = obj.DateReviewTicket,
                        Status = obj.Status,
                        Noted = obj.Noted,
                        SupplierResultReview = obj.SupplierResultReview,
                        CreatedBy = obj.CreatedBy,
                        CreatedTime = DateTime.Now,
                        Flag = obj.Flag,
                    };
                    _context.OrderSupplierReviews.Add(data);
                    _context.SaveChanges();
                    msg.Title = "Thêm đánh giá nhà cung cấp thành công";
                    msg.Code = data.ReviewCode;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Mã đánh giá nhà cung cấp đã tồn tại";
                }
            }
            catch(Exception ex)
            {
                msg.Error = true;
                //msg.Object = ex;
                msg.Title = "Có lỗi xảy ra khi thêm đánh giá nhà cung cấp";
            }

            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateOrderSupplier([FromBody] OrderSupplierReviewModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.OrderSupplierReviews.FirstOrDefault(x => x.ReviewCode == obj.ReviewCode);
                if (data != null)
                {
                    data.TitleReview = obj.TitleReview;
                    data.CreatorTicket = obj.CreatorTicket;
                    data.DateReviewTicket = obj.DateReviewTicket;
                    data.Status = obj.Status;
                    data.Noted = obj.Noted;
                    data.SupplierResultReview = obj.SupplierResultReview;
                    data.UpdatedBy = obj.CreatedBy;
                    data.UpdateTime = DateTime.Now;
                    data.Flag = obj.Flag;
                    _context.OrderSupplierReviews.Update(data);
                    _context.SaveChanges();
                    msg.Title = "Sửa đánh giá nhà cung cấp thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Mã đánh giá nhà cung cấp không tồn tại";
                }
            }
            catch
            {
                msg.Error = true;
                //msg.Object = ex;
                msg.Title = "Có lỗi xảy ra khi sửa đánh giá nhà cung cấp";
            }

            return Json(msg);
        }

        [HttpPost]
        public JsonResult DeleteOrderSupplier(string reviewCode)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.OrderSupplierReviews.FirstOrDefault(x => x.ReviewCode == reviewCode);
                if (data != null)
                {
                    _context.OrderSupplierReviews.Remove(data);
                    _context.SaveChanges();
                    msg.Title = "Xóa thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Mã đánh giá nhà cung cấp không tồn tại";
                }
            }
            catch
            {
                msg.Error = true;
                //msg.Object = ex;
                msg.Title = "Có lỗi xảy ra khi xóa đánh giá nhà cung cấp";
            }

            return Json(msg);
        }

        public class OrderSupplierDetailModel
        {
            public string ProductCode { get; set; }
            public string SupplierCode { get; set; }
            public string QcSystem { get; set; }
            public string Pricing { get; set; }
            public string Unit { get; set; }
            public string PaymentMethod { get; set; }
            public string DeliveryTime { get; set; }
            public string ReviewCode { get; set; }
            public string Reputation { get; set; }
            public string ResultReview { get; set; }
            public string Noted { get; set; }
        }

        [HttpPost]
        public JsonResult InsertOrderSupplierDetail([FromBody] OrderSupplierDetailModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var checkExist = _context.OrderSupplierReviewDetails.FirstOrDefault(x => x.ReviewCode == obj.ReviewCode);
                //var checkExist1 = (from a in _context.OrderSupplierReviews.Where(x => x.ReviewCode == obj.ReviewCode)
                //                   join b in _context.OrderSupplierReviewDetails on a.ReviewCode equals obj.ReviewCode
                //                   select a);
                //if (checkExist == null)
                //{
                    var data = new OrderSupplierReviewDetail()
                    {
                        ProductCode = obj.ProductCode,
                        SupplierCode = obj.SupplierCode,
                        QcSystem = obj.QcSystem,
                        Pricing = obj.Pricing,
                        Unit = obj.Unit,
                        PaymentMethod = obj.PaymentMethod,
                        DeliveryTime = obj.DeliveryTime,
                        ReviewCode = obj.ReviewCode,
                        Reputation = obj.Reputation,
                        ResultReview = obj.ResultReview,
                        Noted = obj.Noted,
                    };
                    _context.OrderSupplierReviewDetails.Add(data);
                    _context.SaveChanges();
                    msg.Title = "Thêm chi tiết đánh giá nhà cung cấp thành công";
                //}
                //else
                //{
                //    msg.Error = true;
                //    msg.Title = "Mã đánh giá nhà cung cấp đã tồn tại";
                //}
            }
            catch
            {
                msg.Error = true;
                //msg.Object = ex;
                msg.Title = "Có lỗi xảy ra khi thêm đánh giá nhà cung cấp";
            }

            return Json(msg);
        }
        [HttpPost]
        public JsonResult UpdateOrderSupplierDetail([FromBody] OrderSupplierDetailModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.OrderSupplierReviewDetails.FirstOrDefault(x => x.ProductCode == obj.ProductCode && x.ReviewCode == obj.ReviewCode);
                if (data != null)
                {
                    data.ProductCode = obj.ProductCode;
                    data.SupplierCode = obj.SupplierCode;
                    data.QcSystem = obj.QcSystem;
                    data.Pricing = obj.Pricing;
                    data.Unit = obj.Unit;
                    data.PaymentMethod = obj.PaymentMethod;
                    data.DeliveryTime = obj.DeliveryTime;
                    data.ReviewCode = obj.ReviewCode;
                    data.Reputation = obj.Reputation;
                    data.ResultReview = obj.ResultReview;
                    data.Noted = obj.Noted;
                    _context.OrderSupplierReviewDetails.Update(data);
                    _context.SaveChanges();
                    msg.Title = "Sửa chi tiết đánh giá nhà cung cấp thành công";
                }
                else
                {
                    var dataAdd = new OrderSupplierReviewDetail()
                    {
                        ProductCode = obj.ProductCode,
                        SupplierCode = obj.SupplierCode,
                        QcSystem = obj.QcSystem,
                        Pricing = obj.Pricing,
                        Unit = obj.Unit,
                        PaymentMethod = obj.PaymentMethod,
                        DeliveryTime = obj.DeliveryTime,
                        ReviewCode = obj.ReviewCode,
                        Reputation = obj.Reputation,
                        ResultReview = obj.ResultReview,
                        Noted = obj.Noted,
                    };
                    _context.OrderSupplierReviewDetails.Add(dataAdd);
                    _context.SaveChanges();
                    msg.Title = "Thêm chi tiết đánh giá nhà cung cấp thành công";

                }
            }
            catch(Exception ex)
            {
                msg.Error = true;
                //msg.Object = ex;
                msg.Title = "Có lỗi xảy ra khi thêm đánh giá nhà cung cấp";
            }

            return Json(msg);
        }
        [HttpPost]
        public JsonResult DeleteOrderSupplierDetail(string reviewCode)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.OrderSupplierReviewDetails.FirstOrDefault(x => x.ReviewCode == reviewCode);
                if (data != null)
                {
                    _context.OrderSupplierReviewDetails.Remove(data);
                    _context.SaveChanges();
                    msg.Title = "Xóa thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Mã đánh giá nhà cung cấp không tồn tại";
                }
            }
            catch
            {
                msg.Error = true;
                //msg.Object = ex;
                msg.Title = "Có lỗi xảy ra khi xóa đánh giá nhà cung cấp";
            }

            return Json(msg);
        }
        [HttpPost]
        public object GetStatusOrder()
        {
            JMessage msg = new JMessage { Error = false };
            try
            {
                var data = _context.CommonSettings
                    .Where(x => x.Group == "ORDER_SUPPLIER")
                    .OrderBy(x => x.SettingID).Select(x => new { Code = x.CodeSet, Name = x.ValueSet, Icon = x.Logo });
                msg.Object = data;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi lấy dữ liệu!";
            }

            return Json(msg);
        }
        
        [HttpPost]
        public object GetPaymentOrder()
        {
            JMessage msg = new JMessage { Error = false };
            try
            {
                var data = _context.CommonSettings
                    .Where(x => x.Group == "ORDER_PAYMENT")
                    .OrderBy(x => x.SettingID).Select(x => new { Code = x.CodeSet, Name = x.ValueSet, Icon = x.Logo });
                msg.Object = data;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi lấy dữ liệu!";
            }

            return Json(msg);
        }
    }
}
