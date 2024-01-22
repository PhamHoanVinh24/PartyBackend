using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Caching.Memory;
using System.IO;
using Syncfusion.EJ2.PdfViewer;
using Newtonsoft.Json.Linq;
using System.Drawing;
//using SautinSoft;
using Syncfusion.EJ2.Spreadsheet;
using Syncfusion.XlsIO;
using Microsoft.AspNetCore.Http.Internal;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Cors;
using ESEIM.Models;
using ESEIM.Utils;
using ESEIM;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using SmartBreadcrumbs.Attributes;
using Microsoft.Extensions.Localization;
using FTU.Utils.HelperNet;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using System.Text.Json;


namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class OrderSupplierReviewController : BaseController
    {

        private readonly UserManager<AspNetUser> _userManager;
        private readonly RoleManager<AspNetRole> _roleManager;
        private readonly EIMDBContext _context;
        //private readonly PackageDbContext _packageContext;
        private readonly AppSettings _appSettings;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IUploadService _uploadService;
        private readonly IActionLogService _actionLog;
        private readonly IFCMPushNotification _notification;
        private readonly IGoogleApiService _googleAPI;
        private readonly IStringLocalizer<ServiceCategoryGroupController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        //var session = HttpContext.GetSessionUser();

        public OrderSupplierReviewController(IOptions<AppSettings> appSettings, EIMDBContext context, 
            UserManager<AspNetUser> userManager, RoleManager<AspNetRole> roleManager, 
            IActionLogService actionLog, IHostingEnvironment hostingEnvironment, 
            IUploadService uploadService, IFCMPushNotification notification, 
            IGoogleApiService googleAPI,
            IStringLocalizer<ServiceCategoryGroupController> stringLocalizer,
            IStringLocalizer<SharedResources> sharedResources
           )
        {
            _userManager = userManager;
            _context = context;
            _roleManager = roleManager;
            _appSettings = appSettings.Value;
            _actionLog = actionLog;
            _hostingEnvironment = hostingEnvironment;
            _uploadService = uploadService;
            _notification = notification;
            _googleAPI = googleAPI;
            _sharedResources = sharedResources;
            _stringLocalizer = stringLocalizer;
            
        }

        public IActionResult Index()
        {
            return View("Index");
        }

        public class ModelSearch : JTableModel
        {
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string TitleReview { get; set; }
            public string CreatorTicket { get; set; }
            public string Status { get; set; }
        }
        public class ModelSearchDetail : JTableModel
        {
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string SuppliersName { get; set; }
            public string ProductName { get; set; }
            public string Review { get; set; }
            public string ReviewCode { get; set; }
        }
        [HttpPost]
        public JsonResult GetListProduct()
        {
            var data = _context.MaterialProducts.Where(p => p.IsDeleted == false).Select(p => new {
                Name = p.ProductName,
                Code = p.ProductCode
            });
            return Json(data);
        }
        [HttpPost]
        public JsonResult GetListStatus()
        {
            var data = _context.CommonSettings.Where(x => x.Group == "ORDER_SUPPLIER").Select(p => new {
                Name = p.ValueSet,
                Code = p.CodeSet
            });
            return Json(data);
        }
        [HttpPost]
        public object GetListUnit()
        {
            var data = _context.CommonSettings
                    .Where(x => x.Group == "CURRENCY_TYPE")
                    .OrderBy(x => x.SettingID).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });

            return data;
        }
        [HttpPost]
        public JsonResult GetListCreator()
        {
            var data = _context.HREmployees.Select(p => new {
                Name = p.fullname,
                Code = p.employee_code
            });
            return Json(data);
        }
        [HttpPost]
        public JsonResult GetPaymentOrder()
        {
            var data = _context.CommonSettings
                .Where(x => x.Group == "ORDER_PAYMENT")
                .OrderBy(x => x.SettingID).Select(x => new { Code = x.CodeSet, Name = x.ValueSet});

            return Json(data);
        }
        [HttpPost]
        public JsonResult GetUnit()
        {
            var data = _context.CommonSettings
                .Where(x => x.Group == "CURRENCY_TYPE")
                .OrderBy(x => x.SettingID).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });

            return Json(data);
        }
        [HttpPost]
        public JsonResult GetListSuppliers()
        {
            var data = _context.Suppliers.Where(p => p.IsDeleted == false).Select(p => new {
                Name=p.SupName,
                Code=p.SupCode
            });
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetOrderSupplierReviewByCode(string ReviewCode)
        {
            JMessage msg = new JMessage();
            try
            {
                var obj = _context.OrderSupplierReviews.Select(
                    x=>new
                    {
                        x.ReviewCode,
                        x.CreatorTicket,
                        x.TitleReview,
                        x.DateReviewTicket,
                        x.Noted,
                        Status = _context.CommonSettings
                      .Where(c => c.Group == "ORDER_SUPPLIER" && c.CodeSet == x.Status).FirstOrDefault().ValueSet
                    }
                ).FirstOrDefault(x => x.ReviewCode == ReviewCode);
                
                msg.Error = obj==null;
                if (msg.Error)
                {
                    msg.Title = _stringLocalizer["SCG_BE_NOT_FOUND"];
                }
                else
                {
                    msg.Object = obj;
                }
            }
            catch(Exception err)
            {
                msg.Error = true;
                msg.Title = err.Message;
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Update([FromBody] ModelViewOderSR obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            if (obj == null || string.IsNullOrWhiteSpace(obj.CreatorTicket)
                || string.IsNullOrWhiteSpace(obj.DateReviewTicket)
                || string.IsNullOrWhiteSpace(obj.Status)
                || string.IsNullOrWhiteSpace(obj.TitleReview))
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_INVALID_FORMAT"];
                return Json(msg);
            }
            try
            {
                var checkExist = _context.OrderSupplierReviews.FirstOrDefault(x => x.ReviewCode == obj.ReviewCode);
                if (checkExist != null)
                {

                    var date = DateTime.ParseExact(obj.DateReviewTicket, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                    checkExist.TitleReview = obj.TitleReview;
                    checkExist.CreatorTicket = obj.CreatorTicket;
                    checkExist.DateReviewTicket = date.ToShortDateString();
                    checkExist.Status = obj.Status;
                    checkExist.Noted = obj.Noted;
                    checkExist.SupplierResultReview = obj.SupplierResultReview;
                    checkExist.UpdateTime = DateTime.Now;
                    checkExist.UpdatedBy= ESEIM.AppContext.UserName;
                    _context.OrderSupplierReviews.Update(checkExist);
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["SCG_BE_SE"]);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["SCG_BE_NO_REVIEWS"];
                }
            }
            catch
            {
                msg.Error = true;
                //msg.Object = ex;
                msg.Title = String.Format(_sharedResources["COM_MSG_ADD_FAILED"], _stringLocalizer["SCG_BE_SE"]);
            }

            return Json(msg);
        }
       

        [HttpPost]
        public JsonResult UpdateDetail([FromBody] ModelViewOderSRDetail obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            if (obj == null || string.IsNullOrWhiteSpace(obj.DeliveryTime)
                || string.IsNullOrWhiteSpace(obj.ReviewCode)
                || string.IsNullOrWhiteSpace(obj.Pricing)
                || string.IsNullOrWhiteSpace(obj.Unit)
                || string.IsNullOrWhiteSpace(obj.ProductCode)
                || string.IsNullOrWhiteSpace(obj.SupplierCode)
                || string.IsNullOrWhiteSpace(obj.QcSystem)
                || string.IsNullOrWhiteSpace(obj.Reputation)
                || string.IsNullOrWhiteSpace(obj.PaymentMethod)
                )
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_INVALID_FORMAT"]; 
                return Json(msg);
            }
            try
            {
                var data = _context.OrderSupplierReviewDetails.FirstOrDefault(x => x.Id.ToString() == obj.Id);
                if (data != null)
                {
                    var date = DateTime.ParseExact(obj.DeliveryTime, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                    data.DeliveryTime = date.ToShortDateString();
                    data.Noted = obj.Noted;
                    data.PaymentMethod = obj.PaymentMethod;
                    data.ResultReview = obj.ResultReview;
                    data.Pricing = obj.Pricing;
                    data.ProductCode = obj.ProductCode;
                    data.QcSystem = obj.QcSystem;
                    data.Reputation = obj.Reputation;
                    data.SupplierCode = obj.SupplierCode;
                    data.Unit = obj.Unit;
                    data.ReviewCode = obj.ReviewCode;
                    _context.OrderSupplierReviewDetails.Update(data);
                    _context.SaveChanges();
                    msg.Title = string.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], ""); ;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_MSG_NOT_FOUND"];
                }
            }
            catch
            {
                msg.Error = true;
                //msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }

            return Json(msg);
        }

        [HttpPost]
        public JsonResult JTable([FromBody] ModelSearch jTablePara)
        {
            try
            {
                var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

                int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;;
                var query = from a in _context.OrderSupplierReviews
                            where
                            (string.IsNullOrEmpty(jTablePara.TitleReview) || a.TitleReview == jTablePara.TitleReview) &&
                            (string.IsNullOrEmpty(jTablePara.CreatorTicket) || a.CreatorTicket == jTablePara.CreatorTicket) &&
                            (string.IsNullOrEmpty(jTablePara.Status) || a.Status == jTablePara.Status) &&
                            (string.IsNullOrEmpty(jTablePara.FromDate) || (DateTime.Parse(a.DateReviewTicket)>= fromDate))
                           && (string.IsNullOrEmpty(jTablePara.ToDate) || (DateTime.Parse(a.DateReviewTicket) <= toDate))
                            select new
                            {
                                a.Id,
                                a.TitleReview,
                                a.CreatorTicket,
                                a.Noted,
                                a.ReviewCode,
                                a.DateReviewTicket,
                                Count=_context.OrderSupplierReviewDetails.Where(x=>x.ReviewCode==a.ReviewCode).Count(),
                                Status= _context.CommonSettings.Where(x => x.CodeSet==a.Status).FirstOrDefault().ValueSet
                            };
                var count = query.Count();
                var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "TitleReview", "CreatorTicket", "Noted", "ReviewCode", "DateReviewTicket", "Count","Status");
                return Json(jdata);
            }
            catch (Exception ex)
            {
                var jdata = JTableHelper.JObjectTable(null, jTablePara.Draw, 0, "Id", "TitleReview", "CreatorTicket", "Noted", "ReviewCode", "DateReviewTicket", "Count","Status");
                return Json(jdata);
            }
        }
        [HttpPost]
        public JsonResult ChangeResultReview(int id,string ResultReview)
        {
            var msg = new JMessage { Error = false, Title = "" };
            if (String.IsNullOrWhiteSpace(ResultReview))
            {
                msg.Error = true;
                msg.Title = "Invalid data";
                return Json(msg);
            }
            try
            {
                var checkExist = _context.OrderSupplierReviewDetails.FirstOrDefault(x => x.Id == id);

                if (checkExist != null)
                {
                    checkExist.ResultReview = ResultReview;
                    _context.OrderSupplierReviewDetails.Update(checkExist);
                    _context.SaveChanges();
                    
                    msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["SCG_RESULT_REVIEW_SUP"]);
                }
                else
                {
                    msg.Error = true;
                   
                    msg.Title = String.Format(_sharedResources["COM_MSG_NOT_FOUND"], _stringLocalizer["SCG_BE_SE"]);
                }
            }
            catch
            {
                msg.Error = true;
                //msg.Object = ex;
                
                msg.Title = String.Format(_sharedResources["COM_MSG_ERR_ADD_IMG"], _stringLocalizer["SCG_BE_SE"]);
            }

            return Json(msg);

        }
        [HttpPost]
        public JsonResult JTableDetail([FromBody] ModelSearchDetail jTablePara)
        {
            try
            {
                var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

                int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;

                var query = from a in _context.OrderSupplierReviewDetails.Where(x=> string.IsNullOrEmpty(jTablePara.ReviewCode) || x.ReviewCode==jTablePara.ReviewCode)
                            join c in _context.MaterialProducts.Where(x => !x.IsDeleted) on a.ProductCode equals c.ProductCode
                            join d in _context.Suppliers on a.SupplierCode equals d.SupCode
                            where
                           (string.IsNullOrEmpty(jTablePara.SuppliersName) || (!string.IsNullOrEmpty(d.SupName) && d.SupName.ToLower().Contains(jTablePara.SuppliersName.ToLower())))
                           && (string.IsNullOrEmpty(jTablePara.ProductName) || (!string.IsNullOrEmpty(c.ProductName) && c.ProductName.ToLower().Contains(jTablePara.ProductName.ToLower())))
                           && (string.IsNullOrEmpty(jTablePara.Review) || (!string.IsNullOrEmpty(a.Reputation) && a.Reputation.ToLower().Contains(jTablePara.Review.ToLower())))
                           && (string.IsNullOrEmpty(jTablePara.FromDate) || (DateTime.Parse(a.DeliveryTime) >= fromDate))
                           && (string.IsNullOrEmpty(jTablePara.ToDate) || (DateTime.Parse(a.DeliveryTime) <= toDate))
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
                                Unit=_context.CommonSettings.Where(x=>x.CodeSet==a.Unit).FirstOrDefault().ValueSet,
                                PaymentMethod=_context.CommonSettings.Where(x => x.CodeSet == a.PaymentMethod).FirstOrDefault().ValueSet,
                                a.DeliveryTime,
                                a.Reputation,
                                a.ResultReview,
                                a.Noted,
                            };
                var count = query.Count();
                var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "TitleReview", "ReviewCode", "ProductCode", "ProductName",
                    "SupplierCode", "SupName", "QcSystem", "Pricing", "Unit", "PaymentMethod", "DeliveryTime", "Reputation", "ResultReview", "Noted");
                return Json(jdata);
            }
            catch (Exception ex)
            {
                var jdata = JTableHelper.JObjectTable(null, jTablePara.Draw, 0, "Id","TitleReview", "ReviewCode", "ProductCode", "ProductName",
                    "SupplierCode", "SupName", "QcSystem", "Pricing", "Unit", "PaymentMethod", "DeliveryTime", "Reputation", "ResultReview", "Noted");
                return Json(jdata);
            }
        }

        public class ModelViewOderSR
        {
            public string Id { get; set; }
            public string CreatorTicket { get; set; }
            public string DateReviewTicket { get; set; }
            public string Noted { get; set; }
            public string TitleReview { get; set; }
            public string ReviewCode { get; set; }
            public string Status { get; set; }
            public string SupplierResultReview { get; set; }
        }
        public class ModelViewOderSRDetail
        {
            public string Id { get; set; }
            public string DeliveryTime { get; set; }
            public string Noted { get; set; }
            public string PaymentMethod { get; set; }
            public string ResultReview { get; set; }
            public string Pricing { get; set; }
            public string ProductCode { get; set; }
            public string QcSystem { get; set; }
            public string Reputation { get; set; }
            public string SupplierCode { get; set; }
            public string Unit { get; set; }
            public string ReviewCode { get; set; }
        }

        [HttpPost]
        public JsonResult Insert([FromBody] ModelViewOderSR obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            if (obj == null || string.IsNullOrWhiteSpace(obj.CreatorTicket)
                || string.IsNullOrWhiteSpace(obj.DateReviewTicket)
                || string.IsNullOrWhiteSpace(obj.Status)
                || string.IsNullOrWhiteSpace(obj.TitleReview))
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_INVALID_FORMAT"];
                return Json(msg);
            }
                try
                {
                OrderSupplierReview data = new OrderSupplierReview();
                data.TitleReview = obj.TitleReview;
                data.Noted = obj.Noted;
                var date = DateTime.ParseExact(obj.DateReviewTicket, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                data.DateReviewTicket = date.ToShortDateString();
                data.CreatorTicket = obj.CreatorTicket;
                data.ReviewCode = Guid.NewGuid().ToString();
                data.Status = obj.Status;
                var checkExist = _context.OrderSupplierReviews.FirstOrDefault(x => x.TitleReview == data.TitleReview &&
                    x.CreatorTicket == data.CreatorTicket && x.Noted == data.Noted && x.DateReviewTicket == data.DateReviewTicket);
                if (checkExist == null)
                {
                    data.ReviewCode = Guid.NewGuid().ToString();
                    data.CreatedTime = DateTime.Now;
                    data.CreatedBy = ESEIM.AppContext.UserName;
                    data.Flag = "true";
                    _context.OrderSupplierReviews.Add(data);
                    _context.SaveChanges();
                    msg.Object = data.Id;
                    msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["SCG_OSR_ADDED"]);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_MSG_EXITS"], _stringLocalizer["SCG_OSR_EXIST"]);
                }
            }
            catch
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                
            }
            return Json(msg);
        }


        [HttpPost]
        public JsonResult GetListOrderSupplier(JTableModel obj)
        {
            JMessage msg = new JMessage { Error = false };
            try
            {
                int intBeginFor = (obj.CurrentPage - 1) * obj.Length;
                var query = from a in _context.OrderSupplierReviews
                            join b in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Status equals b.CodeSet
                            select new
                            {
                                a.Id,
                                a.DateReviewTicket,
                                a.CreatorTicket,
                                a.TitleReview,
                                a.ReviewCode,
                                a.SupplierResultReview,
                                b.ValueSet
                            };
                var count = query.Count();
                var data = query.OrderUsingSortExpression(obj.QueryOrderBy).Skip(intBeginFor).Take(obj.Length).AsNoTracking().ToList();
                var jdata = JTableHelper.JObjectTable(data, obj.Draw, count, "Id", "DateReviewTicket", "CreatorTicket", "TitleReview",
                    "ReviewCode", "SupplierResultReview");
                msg.Object = new
                {
                    count = count,
                    data = data
                };
            }
            catch
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_DATA_FAIL"];
                
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult InsertDetail([FromBody] ModelViewOderSRDetail obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            if (obj == null || string.IsNullOrWhiteSpace(obj.DeliveryTime)
                || string.IsNullOrWhiteSpace(obj.ReviewCode)
                || string.IsNullOrWhiteSpace(obj.Pricing)
                || string.IsNullOrWhiteSpace(obj.Unit)
                || string.IsNullOrWhiteSpace(obj.ProductCode)
                || string.IsNullOrWhiteSpace(obj.SupplierCode)
                || string.IsNullOrWhiteSpace(obj.QcSystem)
                || string.IsNullOrWhiteSpace(obj.Reputation)
                || string.IsNullOrWhiteSpace(obj.PaymentMethod)
                )
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_INVALID_FORMAT"];
                return Json(msg);
            }
            try
            {
                OrderSupplierReviewDetail data = new OrderSupplierReviewDetail();

                var date = DateTime.ParseExact(obj.DeliveryTime, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                data.DeliveryTime = date.ToShortDateString();
                data.Noted = obj.Noted;
                data.PaymentMethod = obj.PaymentMethod;
                data.ResultReview = obj.ResultReview;
                data.Pricing = obj.Pricing;
                data.ProductCode = obj.ProductCode;
                data.QcSystem = obj.QcSystem;
                data.Reputation = obj.Reputation;
                data.SupplierCode = obj.SupplierCode;
                data.Unit = obj.Unit;
                data.ReviewCode = obj.ReviewCode;

                var checkExist = _context.OrderSupplierReviewDetails.FirstOrDefault(x =>
                    data.ReviewCode==x.ReviewCode &&
                    data.DeliveryTime == x.DeliveryTime &&
                    data.Noted == x.Noted &&
                    data.PaymentMethod == x.PaymentMethod &&
                    data.ResultReview == x.ResultReview &&
                    data.Pricing == x.Pricing &&
                    data.ProductCode == x.ProductCode &&
                    data.QcSystem == x.QcSystem &&
                    data.Reputation == x.Reputation &&
                    data.SupplierCode == x.SupplierCode &&
                    data.Unit == x.Unit
                    );
                if (checkExist == null)
                {
                    _context.OrderSupplierReviewDetails.Add(data);
                    _context.SaveChanges();
                    msg.Object = data.Id;
                    msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["OSR_DETAIL_LBL_SCG"]);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["OSR_DETAIL_MSG_CODE_EXIST"];
                }
            }
            catch(Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_ERR_ADD"], _stringLocalizer["OSR_DETAIL_LBL_SCG"]);
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult GetOrderSupplierReviewDetail(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                OrderSupplierReviewDetail data = _context.OrderSupplierReviewDetails.Where(x => x.Id==id ).FirstOrDefault();
                var parent = _context.OrderSupplierReviews.Select(x => new
                {
                    x.ReviewCode,
                    x.CreatorTicket,
                    x.TitleReview,
                    x.DateReviewTicket,
                    x.Noted,
                    Status = _context.CommonSettings
                      .Where(c => c.Group == "ORDER_SUPPLIER" && c.CodeSet == x.Status).FirstOrDefault().ValueSet
                }).Where(x => x.ReviewCode == data.ReviewCode).FirstOrDefault();
                msg.Error = data == null; 
                if (msg.Error)
                {
                    msg.Title = _sharedResources["OSR_DETAIL_MSG_CODE_EXIST"];
                }
                else
                {
                    msg.Error = parent == null;
                    if (msg.Error)
                    {
                        msg.Title = _sharedResources["OSR_DETAIL_MSG_CODE_EXIST"];
                    }
                    else
                    {
                        msg.Object = new { data, parent };
                    }
                }
            }
            catch
            {
                msg.Error = true;
                //msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
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
                    var data2 = _context.OrderSupplierReviewDetails.Where(x => x.ReviewCode == reviewCode).ToArray();
                    if (data2.Length > 0)
                    {
                        int count = data2.Count();
                        for(int  i=0; i <count; i++)
                        {
                            _context.OrderSupplierReviewDetails.Remove(data2[i]);
                        }
                    }
                    _context.OrderSupplierReviews.Remove(data);
                    _context.SaveChanges();
                    msg.Error = false;
                    msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                
                    msg.Title = String.Format(_sharedResources["COM_MSG_NOT_EXITS"], _stringLocalizer["SCG_OSR_EXIST"]);
                }
            }
            catch
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_ERR_DELETE"], _stringLocalizer["SCG_BE_SE"]);
            }

            return Json(msg);
        }

        [HttpPost]
        public JsonResult DeleteOrderSupplierDetail(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.OrderSupplierReviewDetails.FirstOrDefault(x => x.Id == id);
                if (data != null)
                {
                    _context.OrderSupplierReviewDetails.Remove(data);
                    _context.SaveChanges();
                    msg.Error = false;
                    msg.Title = string.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"],_stringLocalizer["OSR_DETAIL_LBL_SCG"]);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["OSR_DETAIL_MSG_CODE_EXIST"];
                }
            }
            catch
            {
                msg.Error = true;
                //msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }

            return Json(msg);
        }
    }
}
