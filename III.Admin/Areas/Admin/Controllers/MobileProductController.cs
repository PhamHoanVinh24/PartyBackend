using ESEIM;
using ESEIM.Models;
using ESEIM.Utils;
using III.Domain.Common;
using III.Domain.Enums;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Syncfusion.OCRProcessor;
using Syncfusion.XlsIO;
using System;
using System.Collections.Generic;
using System.Data;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using static III.Admin.Controllers.CardJobController;
using static III.Admin.Controllers.MobileLoginController;
using AdvanceSearchObj = III.Admin.Controllers.CardJobController.AdvanceSearchObj;
using DataAttrWf = III.Admin.Controllers.MobileLoginController.DataAttrWf;
using JsonCommand = III.Admin.Controllers.MobileLoginController.JsonCommand;
using Syncfusion.Pdf;
using System.Text;
using OpenXmlPowerTools;

namespace III.Admin.Controllers
{
    public class MobileProductController : Controller
    {
        private readonly EIMDBContext _context;
        private readonly UserManager<AspNetUser> _userManager;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IUploadService _upload;
        private TimeSpan _timeWorkingMorning;
        private TimeSpan _timeWorkingAfternoon;
        private TimeSpan _timeWorkingEvening;
        private readonly AppSettings _appSettings;
        private readonly IGoogleApiService _googleAPI;
        private readonly IFCMPushNotification _notification;
        private readonly ICardJobService _cardService;
        private TimeSpan _timeWorking;
        private readonly IRepositoryService _repositoryService;
        private readonly IGoogleApiService _googleAPIService;
        private readonly IWorkflowService _workflowService;
        private readonly IParameterService _iParameterService;
        private readonly IUserLoginService _loginService;
        //private readonly IGanttExportService _ganttExportService;
        private readonly CheckoutConfig _checkoutConfig;
        private readonly IMailService _mailService;
        private readonly IPaymentService _paymentService;
        private PayPalV2Config _palV2Config;
        private VnPayConfig _vnPayConfig;
        private MomoV2Config _momoV2Config;
        private ZaloConfig _zaloConfig;
        private StripeConfig _stripeConfig;
        public string module_name = "";
        public string path_upload_file = "";
        public string repos_code = "";
        public string cat_code = "";
        public int host_type = 1;
        private static AsyncLocker<string> objLock = new AsyncLocker<string>();

        public MobileProductController(
            EIMDBContext context,
            IHostingEnvironment hostingEnvironment,
            IUploadService upload,
            //AppSettings appSettings,
            IGoogleApiService googleAPI,
            IFCMPushNotification notification,
            ICardJobService cardService,
            IRepositoryService repositoryService,
            IGoogleApiService googleAPIService,
            IWorkflowService workflowService,
            IParameterService iParameterService,
            IUserLoginService loginService,
            IMailService mailService)
        {
            _context = context;
            _hostingEnvironment = hostingEnvironment;
            _upload = upload;
            //_appSettings = appSettings;
            _googleAPI = googleAPI;
            _notification = notification;
            _cardService = cardService;
            _repositoryService = repositoryService;
            _googleAPIService = googleAPIService;
            _workflowService = workflowService;
            _iParameterService = iParameterService;
            _loginService = loginService;
            _mailService = mailService;
        }

        #region Phiếu nạp nhiên liệu vào bình
        public IActionResult CylinkerFuelLoadingHd()
        {
            try
            {
                return Ok(_context.CylinkerFuelLoadingHds.ToList());
            }
            catch (Exception ex)
            {
                return NotFound();
            }
        }
        public IActionResult CylinkerFuelLoadingDt()
        {
            try
            {
                return Ok(_context.CylinkerFuelLoadingDts.ToList());
            }
            catch (Exception ex)
            {
                return NotFound();
            }
        }
        public class CylinkerFuelloadingModel : JTableModel
        {
            public string TicketCode { get; set; }
            public string TicketTitle { get; set; }
            public string TicketCreator { get; set; }
            public DateTime? TicketCreatedTime { get; set; }
            public string Loader { get; set; }
            public DateTime? LoaderTime { get; set; }
            public string Status { get; set; }
            public string Note { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string KeyWork { get; set; }
        }

        [HttpPost]
        public object GetListCylinkerFuelloading(CylinkerFuelloadingModel obj)
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
                int intBeginFor = (obj.CurrentPage - 1) * obj.Length;
                var query = from a in _context.CylinkerFuelLoadingHds
                            join c in _context.CylinkerFuelLoadingDts on a.TicketCode equals c.TicketCode into c1
                            from c2 in c1.DefaultIfEmpty()
                            join b in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "ORDER_SUPPLIER")
                                on a.Status equals b.CodeSet into b1
                            from b2 in b1.DefaultIfEmpty()
                            where (string.IsNullOrEmpty(obj.TicketCode) || obj.TicketCode == a.TicketCode) &&
                                    ((fromDate == null) || (a.TicketCreatedTime.HasValue && a.TicketCreatedTime.Value.Date >= fromDate)) &&
                                    ((toDate == null) || (a.LoaderTime.HasValue && a.LoaderTime.Value.Date <= toDate)) &&
                                    (string.IsNullOrEmpty(obj.KeyWork) || a.TicketTitle.ToLower().Contains(obj.KeyWork.ToLower())) &&
                                    (string.IsNullOrEmpty(obj.Status) || a.Status.Contains(obj.Status))
                            select new
                            {
                                a.Id,
                                a.TicketCode,
                                TankCode = string.Join(", ", _context.CylinkerFuelLoadingDts.Where(y => y.TicketCode == a.TicketCode).Select(y => y.TankCode).Distinct()),
                                //TankCode = c2 != null ? c2.TankCode : "",
                                a.TicketTitle,
                                a.TicketCreator,
                                a.TicketCreatedTime,
                                a.LoaderTime,
                                CreatorName = a.Loader != null ? _context.HREmployees.FirstOrDefault(y => y.employee_code == a.TicketCreator).fullname : "",
                                a.Loader,
                                LoaderName = a.Loader != null ? _context.HREmployees.FirstOrDefault(y => y.employee_code == a.Loader).fullname : "",
                                a.Status,
                                statusName = a.Status != null ? _context.CommonSettings.FirstOrDefault(y => y.CodeSet == a.Status).ValueSet : "",
                                a.Note,
                            };
                var data = query.OrderByDescending(x => x.Id).Skip(intBeginFor).Take(obj.Length).AsNoTracking().Distinct().ToList();
                var count = data.Count();
                msg.Object = new
                {
                    count = count,
                    data = data
                };
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi lấy dữ liệu!";
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult InsertCylinkerFuelloading([FromBody] CylinkerFuelloadingModel obj)
        {
            JMessage msg = new JMessage { Error = false };
            Random random = new Random();
            int randomNumber = random.Next(1000000, 9999999);
            string ticketCode = $"FL_TK_{randomNumber}";
            try
            {
                var checkExist = _context.CylinkerFuelLoadingHds.FirstOrDefault(x => x.TicketCode == obj.TicketCode);
                if (checkExist == null)
                {
                    var data = new CylinkerFuelLoadingHd
                    {
                        TicketCode = ticketCode,
                        TicketTitle = obj.TicketTitle,
                        TicketCreator = obj.TicketCreator,
                        TicketCreatedTime = obj.TicketCreatedTime,
                        Loader = obj.Loader,
                        LoaderTime = obj.LoaderTime,
                        Status = obj.Status,
                        Note = obj.Note,
                    };
                    _context.CylinkerFuelLoadingHds.Add(data);
                    _context.SaveChanges();
                    msg.Title = "Thêm phiếu nạp nguyên liệu thành công";
                    msg.Code = data.TicketCode;
                    msg.ID = data.Id;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Mã phiếu đã tồn tại";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Object = ex;
                msg.Title = "Có lỗi xảy ra khi thêm";
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateCylinkerFuelloading([FromBody] CylinkerFuelloadingModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.CylinkerFuelLoadingHds.FirstOrDefault(x => x.TicketCode == obj.TicketCode);
                if (data != null)
                {
                    data.TicketTitle = obj.TicketTitle;
                    data.TicketCreator = obj.TicketCreator;
                    data.TicketCreatedTime = obj.TicketCreatedTime;
                    data.Loader = obj.Loader;
                    data.LoaderTime = obj.LoaderTime;
                    data.Status = obj.Status;
                    data.Note = obj.Note;
                    _context.CylinkerFuelLoadingHds.Update(data);
                    _context.SaveChanges();
                    msg.Title = "Sửa phiếu nạp nguyên liệu thành công";
                    msg.Code = data.TicketCode;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Mã phiếu không tồn tồn tại";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Object = ex;
                msg.Title = "Có lỗi xảy ra khi Sửa";
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult DeleteCylinkerFuelloading(string ticketCode)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.CylinkerFuelLoadingHds.FirstOrDefault(x => x.TicketCode == ticketCode);
                var dataItems = _context.CylinkerFuelLoadingDts.Where(x => x.TicketCode == ticketCode).ToList();
                if (data != null)
                {
                    _context.CylinkerFuelLoadingHds.Remove(data);
                    _context.CylinkerFuelLoadingDts.RemoveRange(dataItems);
                    _context.SaveChanges();
                    msg.Title = "Xóa thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Mã phiếu không tồn tại";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Object = ex;
                msg.Title = "Có lỗi xảy ra khi xóa";
            }

            return Json(msg);
        }

        public class CylinkerFuelloadingDetailModel : JTableModel
        {
            public int Id { get; set; }
            public string TicketCode { get; set; }
            public string TankCode { get; set; }
            public string CylinkerCode { get; set; }
            public decimal? Volume { get; set; }
            public string Unit { get; set; }
        }

        [HttpPost]
        public object GetListCylinkerFuelloadingDetail(CylinkerFuelloadingDetailModel obj)
        {
            JMessage msg = new JMessage { Error = false };
            try
            {
                int intBeginFor = (obj.CurrentPage - 1) * obj.Length;
                var query = from a in _context.CylinkerFuelLoadingDts
                            join b in _context.CylinkerFuelLoadingHds on a.TicketCode equals b.TicketCode
                            join c in _context.MaterialProducts on a.TankCode equals c.ProductCode
                            where (string.IsNullOrEmpty(obj.TicketCode) || obj.TicketCode == a.TicketCode)
                            select new
                            {
                                a.Id,
                                a.TicketCode,
                                a.TankCode,
                                TankName = a.TankCode != null ? _context.MaterialProducts.FirstOrDefault(y => y.ProductCode == a.TankCode).ProductName : "",
                                a.CylinkerCode,
                                CylinkerName = a.CylinkerCode != null ? _context.MaterialProducts.FirstOrDefault(y => y.ProductCode == a.CylinkerCode).ProductName : "",
                                a.Volume,
                                a.Unit,
                                c.Weight,
                                c.ProductName,
                                UnitName = a.Unit != null ? _context.CommonSettings.FirstOrDefault(y => y.CodeSet == a.Unit).ValueSet : "",
                            };
                var count = query.Count();
                var data = query.OrderByDescending(x => x.Id).Skip(intBeginFor).Take(obj.Length).AsNoTracking().ToList();
                msg.Object = new
                {
                    count = count,
                    data = data
                };
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi lấy dữ liệu!";
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult InsertCylinkerFuelloadingDetail([FromBody] CylinkerFuelloadingDetailModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var cylinker = _context.MaterialProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == obj.CylinkerCode);
                var cylinkerInStock = _context.ProductInStocks.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == obj.CylinkerCode);
                var cylinkerLocatedMapping = _context.ProductLocatedMappings.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == obj.CylinkerCode);
                var tankInStock = _context.ProductInStocks.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == obj.TankCode);
                var tankLocatedMapping = _context.ProductLocatedMappings.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == obj.TankCode);
                if (cylinker == null || cylinkerInStock == null)
                {
                    msg.Error = true;
                    //msg.Object = ex;
                    msg.Title = "Bình chưa được nhập";
                    return Json(msg);
                }
                if (cylinkerLocatedMapping == null)
                {
                    msg.Error = true;
                    //msg.Object = ex;
                    msg.Title = "Bình chưa được xếp";
                    return Json(msg);
                }
                if (tankInStock == null || tankLocatedMapping == null)
                {
                    msg.Error = true;
                    //msg.Object = ex;
                    msg.Title = "Bồn chưa được nhập";
                    return Json(msg);
                }
                var sumVolume = (cylinkerInStock.Weight ?? 0) + obj.Volume;
                if (cylinker != null && sumVolume > cylinker.Weight)
                {
                    msg.Error = true;
                    //msg.Object = ex;
                    msg.Title = "Lượng nhập vượt quá dung tích bình";
                    return Json(msg);
                }
                var checkExist = _context.CylinkerFuelLoadingDts.FirstOrDefault(x => x.TicketCode == obj.TicketCode);
                var data = new CylinkerFuelLoadingDt
                {
                    TicketCode = obj.TicketCode,
                    TankCode = obj.TankCode,
                    CylinkerCode = obj.CylinkerCode,
                    Volume = obj.Volume,
                    Unit = obj.Unit,
                };
                _context.CylinkerFuelLoadingDts.Add(data);
                cylinkerInStock.Weight = sumVolume;
                cylinkerLocatedMapping.Weight = sumVolume;
                tankInStock.Weight -= obj.Volume;
                tankLocatedMapping.Weight -= obj.Volume;
                _context.SaveChanges();
                msg.Title = "Thêm chi tiết đánh giá nhà cung cấp thành công";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Object = ex;
                msg.Title = "Có lỗi xảy ra khi thêm";
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateCylinkerFuelloadingDetail([FromBody] CylinkerFuelloadingDetailModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var cylinker = _context.MaterialProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == obj.CylinkerCode);
                var cylinkerInStock = _context.ProductInStocks.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == obj.CylinkerCode);
                var cylinkerLocatedMapping = _context.ProductLocatedMappings.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == obj.CylinkerCode);
                var tankInStock = _context.ProductInStocks.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == obj.TankCode);
                var tankLocatedMapping = _context.ProductLocatedMappings.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == obj.TankCode);
                if (cylinker == null || cylinkerInStock == null)
                {
                    msg.Error = true;
                    //msg.Object = ex;
                    msg.Title = "Bình chưa được nhập";
                    return Json(msg);
                }
                if (tankInStock == null || tankLocatedMapping == null)
                {
                    msg.Error = true;
                    //msg.Object = ex;
                    msg.Title = "Bồn chưa được nhập";
                    return Json(msg);
                }
                var data = _context.CylinkerFuelLoadingDts.FirstOrDefault(x => x.TicketCode == obj.TicketCode && x.Id == obj.Id);
                if (data != null)
                {
                    var sumVolume = (cylinkerInStock.Weight ?? 0) - data.Volume + obj.Volume;
                    if (cylinker != null && sumVolume > cylinker.Weight)
                    {
                        msg.Error = true;
                        //msg.Object = ex;
                        msg.Title = "Lượng nhập vượt quá dung tích bình";
                        return Json(msg);
                    }
                    if (sumVolume < 0)
                    {
                        msg.Error = true;
                        //msg.Object = ex;
                        msg.Title = "Không thể cập nhật vì dung tích bình bị giảm nhỏ hơn 0";
                        return Json(msg);
                    }
                    tankInStock.Weight = (tankInStock.Weight ?? 0) + obj.Volume - data.Volume;
                    tankLocatedMapping.Weight = (tankLocatedMapping.Weight ?? 0) + obj.Volume - data.Volume;
                    data.TankCode = obj.TankCode;
                    data.TankCode = obj.TankCode;
                    data.CylinkerCode = obj.CylinkerCode;
                    data.Volume = obj.Volume;
                    data.Unit = obj.Unit;
                    _context.CylinkerFuelLoadingDts.Update(data);
                    cylinkerInStock.Weight = sumVolume;
                    cylinkerLocatedMapping.Weight = sumVolume;
                    _context.SaveChanges();
                    msg.Title = "Sửa phiếu chi tiết thành công";
                    msg.Code = data.TicketCode;
                }
                else
                {
                    msg.Error = true;
                    //msg.Object = ex;
                    msg.Title = "Không tìm thấy chi tiết sửa";
                    //var sumVolume = (cylinkerInStock.Weight ?? 0) + obj.Volume;
                    //if (cylinker != null && sumVolume > cylinker.Weight)
                    //{
                    //    msg.Error = true;
                    //    //msg.Object = ex;
                    //    msg.Title = "Lượng nhập vượt quá dung tích bình";
                    //    return Json(msg);
                    //}
                    //var dataNew = new CylinkerFuelLoadingDt
                    //{
                    //    TicketCode = obj.TicketCode,
                    //    TankCode = obj.TankCode,
                    //    CylinkerCode = obj.CylinkerCode,
                    //    Volume = obj.Volume,
                    //    Unit = obj.Unit,
                    //};
                    //_context.CylinkerFuelLoadingDts.Add(dataNew);
                    //cylinkerInStock.Weight = sumVolume;
                    //cylinkerLocatedMapping.Weight = sumVolume;
                    //tankInStock.Weight -= obj.Volume;
                    //tankLocatedMapping.Weight -= obj.Volume;
                    //_context.SaveChanges();
                    //msg.Title = "Thêm chi tiết đánh giá nhà cung cấp thành công";
                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Object = ex;
                msg.Title = "Có lỗi xảy ra khi Sửa";
            }
            return Json(msg);
        }


        [HttpPost]
        public JsonResult DeleteCylinkerFuelloadingDetail(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.CylinkerFuelLoadingDts.FirstOrDefault(x => x.Id == id);
                if (data != null)
                {
                    var cylinkerInStock = _context.ProductInStocks.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == data.CylinkerCode);
                    var cylinkerLocatedMapping = _context.ProductLocatedMappings.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == data.CylinkerCode);
                    var tankInStock = _context.ProductInStocks.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == data.TankCode);
                    var tankLocatedMapping = _context.ProductLocatedMappings.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == data.TankCode);
                    var sumVolume = (cylinkerInStock.Weight ?? 0) - data.Volume;
                    if (sumVolume < 0)
                    {
                        msg.Error = true;
                        //msg.Object = ex;
                        msg.Title = "Không thể xóa vì dung tích bình bị giảm nhỏ hơn 0";
                        return Json(msg);
                    }
                    cylinkerInStock.Weight = sumVolume;
                    cylinkerLocatedMapping.Weight = sumVolume;
                    tankInStock.Weight += data.Volume;
                    tankLocatedMapping.Weight += data.Volume;
                    _context.CylinkerFuelLoadingDts.Remove(data);
                    _context.SaveChanges();
                    msg.Title = "Xóa thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Phiếu chi tiết không tồn tại";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Object = ex;
                msg.Title = "Có lỗi xảy ra khi xóa";
            }

            return Json(msg);
        }

        #endregion

        #region Xếp dỡ hàng hóa
        public IActionResult PackageTicketHd()
        {
            try
            {
                return Ok(_context.PackageTicketHds.ToList());
            }
            catch (Exception ex)
            {
                return NotFound();
            }
        }
        public IActionResult PackageTicketDt()
        {
            try
            {
                return Ok(_context.PackageTicketDts.ToList());
            }
            catch (Exception ex)
            {
                return NotFound();
            }
        }

        [HttpGet]
        public IActionResult GetListPackagePaging(int pageNo = 1, int pageSize = 10, string content = "", string statusReady = "")
        {
            JMessage msg = new JMessage { Error = false };
            try
            {
                int intBeginFor = (pageNo - 1) * pageSize;
                var rs = _context.PackageObjects
                    .Where(x => /*x.StatusReady == statusReady &&*/ (string.IsNullOrEmpty(content)
                    || (x.PackCode != null && x.PackCode.Contains(content))
                    || (x.PackName != null && x.PackName.Contains(content))))
                    .OrderBy(x => x.Id)
                    .Select(x => new { Code = x.PackCode, Name = (x.PackName + " - " + x.PackCode) })
                    .ToList().Skip(intBeginFor).Take(pageSize);
                msg.Object = rs;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi lấy dữ liệu!";
            }

            return Json(msg);
        }

        [HttpPost]
        public async Task<IActionResult> ImportFromPackage(string packCode, string ticketCode, string createdBy, string mappingCode)
        {
            JMessage msg = new JMessage { Error = false };
            try
            {
                var package = _context.PackageObjects
                    .FirstOrDefault(x => x.PackCode == packCode);
                if (package == null)
                {
                    msg.Error = true;
                    msg.Title = "Không tìm thấy pallet!";
                    return Ok(msg);
                }
                if (package.StatusReady != "IMP_READY")
                {
                    msg.Error = true;
                    msg.Title = "Palet không sẵn sàng!";
                    return Ok(msg);
                }
                var packageDetails = _context.ProductInPallets
                    .Where(x => x.PackCode == packCode && x.IsDeleted == false).ToList();
                if (packageDetails.Count == 0)
                {
                    msg.Error = true;
                    msg.Title = "Không có sp trong pallet để nhập!";
                    return Ok(msg);
                }
                foreach (var item in packageDetails)
                {
                    var productInStock = _context.ProductInStocks.FirstOrDefault(x => !x.IsDeleted && x.IdImpProduct == item.IdImpProduct);
                    if (productInStock != null && item.IdImpProduct != null && item.IdImpProduct > 0)
                    {
                        msg.Error = true;
                        msg.Title = "Palet đã được được nhập!";
                        return Ok(msg);
                    }
                }
                foreach (var item in packageDetails)
                {
                    var quantity = item.ListProdStrNo.SumQuantity();
                    var today = DateTime.Now.ToString("ddMMyyyy-HHmm"); //format('DDMMYYYY-HHmm')
                    var materialProduct = _context.MaterialProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == item.ProductCode);
                    var newDetail = new ProductImportDetail()
                    {
                        Currency = "VND",
                        PackType = "",
                        ProductCode = item.ProductCode,
                        //AttrCustom = "",
                        ProductQrCode = $"{item.ProductCode}_SL.{quantity}_T.{today}",
                        ProductType = materialProduct?.TypeCode,
                        ProductNo = item.ProductNo,
                        Quantity = quantity,
                        SalePrice = 0,
                        TicketCode = ticketCode,
                        Unit = materialProduct.Unit,
                        CreatedBy = createdBy,
                        ImpType = "DEFAULT",
                        ParentMappingId = -1,
                        ParentProductNumber = -1,
                        Weight = item.Measure,
                        IsMultiple = false,
                        PackCode = packCode,
                        PackLot = package?.PackLot,
                        MappingCode = mappingCode
                    };
                    msg = await InsertDetailImp(newDetail);
                    if (msg.Error)
                    {
                        return Ok(msg);
                    }
                    item.IdImpProduct = msg.ID;
                }
                if (package != null)
                {
                    //package.StatusReady = "NON_READY";
                    package.CurrentPos = mappingCode;
                    await _context.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi nhập!";
            }

            return Ok(msg);
        }

        [HttpPost]
        public async Task<IActionResult> DeletePackageImport(string ticketCode, string packCode, string deletedBy)
        {
            JMessage msg = new JMessage { Error = false };
            try
            {
                var listDeleteDetail = _context.ProductImportDetails
                        .Where(x => !x.IsDeleted && x.TicketCode == ticketCode && x.PackCode == packCode).ToList();
                if (listDeleteDetail.Count == 0)
                {
                    msg.Error = true;
                    msg.Title = "Không có sp trong pallet để xóa!";
                    return Ok(msg);
                }
                foreach (var item in listDeleteDetail)
                {
                    msg = await DeleteDetailImp(item.Id, deletedBy);
                    if (msg.Error)
                    {
                        return Ok(msg);
                    }
                }
            }
            catch (Exception)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi lấy dữ liệu!";
            }
            return Ok(msg);
        }

        [HttpPost]
        public IActionResult GetPackageFromImport(string ticketCode)
        {
            JMessage msg = new JMessage { Error = false };
            try
            {
                var common = _context.CommonSettings;
                var query = (from a in _context.ProductImportDetails.Where(x => !x.IsDeleted)
                             join b in _context.PackageObjects on a.PackCode equals b.PackCode
                             where a.TicketCode == ticketCode
                             select b).DistinctBy(x => x.Id);
                var package = query.OrderByDescending(x => x.Id).Select(x => new
                {
                    x.Id,
                    x.PackCode,
                    x.PackName,
                    x.PackType,
                    //PackTypeName = (x.PackType != null) ? common.FirstOrDefault(y => y.CodeSet == x.PackType).ValueSet : "",
                    x.Specs,
                    x.Noted,
                    x.CurrentPos,
                    CurrentPosName = x.CurrentPos,
                    StatusName = !string.IsNullOrEmpty(x.Status) ? common.FirstOrDefault(y => y.CodeSet == x.Status).ValueSet : "",
                    x.PackCodeParent,
                    PackCodeParentName = !string.IsNullOrEmpty(x.PackCodeParent) ? _context.PackageObjects.FirstOrDefault(y => y.PackCode == x.PackCodeParent).PackName : "",
                    AttrPack = ValidateAttrPack(x.AttrPack),
                    x.Level,
                    x.NumPosition,
                    x.StatusReady,
                    StatusReadyName = (x.StatusReady != null) ? common.FirstOrDefault(y => y.CodeSet == x.StatusReady).ValueSet : "",
                }).ToList();

                msg.Object = package;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra khi lấy dữ liệu";
            }
            return Ok(msg);
        }

        [HttpPost]
        public IActionResult GetListPackage()
        {
            JMessage msg = new JMessage { Error = false };
            try
            {
                var rs = _context.PackageObjects.OrderBy(x => x.Id).Select(x => new { Code = x.PackCode, Name = (x.PackName + " - " + x.PackCode) });
                msg.Object = rs;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi xóa!";
            }

            return Json(msg);
        }
        public class PackageTicketHdModel
        {
            public string TicketCode { get; set; }
            public string TicketTitle { get; set; }
            public string TicketCreator { get; set; }
            public DateTime? TicketTimeCreator { get; set; }
            public string Packager { get; set; }
            public DateTime? PackagerTime { get; set; }
            public string Status { get; set; }
            public string Noted { get; set; }
        }
        public IActionResult InsertTicketCodePackage()
        {
            var count = _context.PackageObjects.Count();
            var maxId = count > 0 ? _context.PackageObjects.Max(x => x.Id) + 1 : 1;
            return Ok($"PACK_CODE_{maxId}");
        }
        [HttpPost]
        public IActionResult GetItemPackage(int id)
        {
            JMessage msg = new JMessage { Error = false };
            try
            {
                var rs = _context.PackageTicketHds.Where(x => x.Id == id).Select(x => new
                {
                    x.Id,
                    x.TicketCode,
                    x.TicketTitle,
                    x.TicketCreator,
                    CreatorName = x.TicketCreator != null ? _context.HREmployees.FirstOrDefault(y => y.employee_code == x.TicketCreator).fullname : "",
                    x.TicketTimeCreator,
                    x.Packager,
                    PackagerName = x.Packager != null ? _context.HREmployees.FirstOrDefault(y => y.employee_code == x.Packager).fullname : "",
                    x.PackagerTime,
                    x.Noted,
                    x.Status,
                    StatusName = (x.Status != null) ? _context.CommonSettings.FirstOrDefault(y => y.CodeSet == x.Status).ValueSet : "",
                });
                msg.Object = rs;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi lấy dữ liệu!";
            }

            return Json(msg);
        }
        public IActionResult GetListPackageHeader(int currentPage = 1, int lenght = 10, string keyword = "")
        {
            int intBeginFor = (currentPage - 1) * lenght;
            //var common = _context.CommonSettings.ToList();
            var query = _context.PackageTicketHds
                .Where(x =>
                (string.IsNullOrEmpty(keyword)
                || (!string.IsNullOrEmpty(x.TicketTitle) && x.TicketTitle.Contains(keyword))
                || (!string.IsNullOrEmpty(x.TicketCode) && x.TicketCode.Contains(keyword)))
            //&& (string.IsNullOrEmpty(jTablePara.Status) || x.Status == jTablePara.Status)
            //&& (string.IsNullOrEmpty(jTablePara.MappingCode) || x.CurrentPos == jTablePara.MappingCode)
            );
            var count = query.Count();
            var headers = query.OrderByDescending(x => x.Id).Skip(intBeginFor).Take(lenght).Select(x => new
            {
                x.Id,
                x.TicketCode,
                x.TicketTitle,
                x.TicketCreator,
                CreatorName = x.TicketCreator != null ? _context.HREmployees.FirstOrDefault(y => y.employee_code == x.TicketCreator).fullname : "",
                x.TicketTimeCreator,
                x.Packager,
                PackagerName = x.Packager != null ? _context.HREmployees.FirstOrDefault(y => y.employee_code == x.Packager).fullname : "",
                x.PackagerTime,
                x.Noted,
                x.Status,
                StatusName = (x.Status != null) ? _context.CommonSettings.FirstOrDefault(y => y.CodeSet == x.Status).ValueSet : "",
                PackCodes = string.Join(", ", _context.PackageTicketDts.Where(y => y.TicketCode == x.TicketCode).Select(y => y.PackCode).Distinct()),
            }).ToList();
            return Ok(new { List = headers, Count = count });
        }

        public IActionResult GetListPackageHeaderNew(int currentPage = 1, int length = 10, string keyword = "")
        {
            try
            {
                int intBeginFor = (currentPage - 1) * length;

                var query = from a in _context.PackageTicketHds
                            join b in _context.PackageTicketDts on a.TicketCode equals b.TicketCode into b1
                            from b2 in b1.DefaultIfEmpty()
                            join c in _context.PackageObjects on b2.PackCode equals c.PackCode into c1
                            from c2 in c1.DefaultIfEmpty()
                            where (string.IsNullOrEmpty(keyword)
                                   || (!string.IsNullOrEmpty(a.TicketTitle) && a.TicketTitle.Contains(keyword))
                                   || (!string.IsNullOrEmpty(a.TicketCode) && a.TicketCode.Contains(keyword)))
                            select new
                            {
                                a.Id,
                                a.TicketCode,
                                a.TicketTitle,
                                a.TicketCreator,
                                CreatorName = a.TicketCreator != null ? _context.HREmployees.FirstOrDefault(y => y.employee_code == a.TicketCreator).fullname : "",
                                a.TicketTimeCreator,
                                a.Packager,
                                PackagerName = a.Packager != null ? _context.HREmployees.FirstOrDefault(y => y.employee_code == a.Packager).fullname : "",
                                a.PackagerTime,
                                a.Noted,
                                a.Status,
                                StatusName = a.Status != null ? _context.CommonSettings.FirstOrDefault(y => y.CodeSet == a.Status).ValueSet : "",
                                b2.PackCode,
                            };

                var headers = query
                    .OrderByDescending(x => x.Id)
                    .Skip(intBeginFor)
                    .Take(length)
                    .ToList()
                    .Select(x => new
                    {
                        x.Id,
                        x.TicketCode,
                        x.TicketTitle,
                        x.TicketCreator,
                        x.CreatorName,
                        x.TicketTimeCreator,
                        x.Packager,
                        x.PackagerName,
                        x.PackagerTime,
                        x.Noted,
                        x.Status,
                        x.StatusName,
                        PackCodes = string.Join(", ", query.Where(y => y.TicketCode == x.TicketCode).Select(y => y.PackCode)),
                    }).ToList();

                var count = query.Count();

                return Ok(new { List = headers, Count = count });
            }
            catch (Exception ex)
            {
                return BadRequest();
            }
        }

        public class SearchPackageHeaderModel
        {
            public int CurrentPage { get; set; } = 1;
            public int Length { get; set; } = 10;
            public string TicketTitle { get; set; } = ""; //Search title + code
            public string TicketCode { get; set; } = "";
            public string Status { get; set; } = "";
            public string FromDate { get; set; }
            public string ToDate { get; set; }
        }
        [HttpPost]
        public IActionResult SearchPackageHeader([FromBody] SearchPackageHeaderModel items)
        {
            int intBeginFor = (items.CurrentPage - 1) * items.Length;
            var fromDate = (!string.IsNullOrEmpty(items.FromDate) ? DateTime.ParseExact(items.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null);
            var toDate = (!string.IsNullOrEmpty(items.ToDate) ? DateTime.ParseExact(items.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null);
            var query = _context.PackageTicketHds
                .Where(x =>
                (string.IsNullOrEmpty(x.TicketTitle) || string.IsNullOrEmpty(items.TicketTitle) || x.TicketTitle.Contains(items.TicketTitle))
                && (string.IsNullOrEmpty(x.TicketCode) || string.IsNullOrEmpty(items.TicketCode) || x.TicketCode.Contains(items.TicketCode))
                && (string.IsNullOrEmpty(x.Status) || string.IsNullOrEmpty(items.Status) || (x.Status == items.Status))
                && ((x.TicketTimeCreator == null) || (fromDate == null) || (fromDate <= x.TicketTimeCreator.Value.Date))
                && ((x.TicketTimeCreator == null) || (toDate == null) || (x.TicketTimeCreator.Value.Date <= toDate)));
            var count = query.Count();
            var headers = query.OrderByDescending(x => x.Id).Skip(intBeginFor).Take(items.Length).Select(x => new
            {
                x.Id,
                x.TicketCode,
                x.TicketTitle,
                x.TicketCreator,
                CreatorName = x.TicketCreator != null ? _context.HREmployees.FirstOrDefault(y => y.employee_code == x.TicketCreator).fullname : "",
                x.TicketTimeCreator,
                x.Packager,
                PackagerName = x.Packager != null ? _context.HREmployees.FirstOrDefault(y => y.employee_code == x.Packager).fullname : "",
                x.PackagerTime,
                x.Noted,
                x.Status,
                StatusName = (x.Status != null) ? _context.CommonSettings.FirstOrDefault(y => y.CodeSet == x.Status).ValueSet : "",
            }).ToList();
            return Ok(new { List = headers, Count = count });
        }


        public JsonResult InsertPacketTicketHd([FromBody] PackageTicketHd obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var checkExit = _context.PackageTicketHds.FirstOrDefault(x => x.TicketCode == obj.TicketCode);
                if (checkExit == null)
                {
                    var data = new PackageTicketHd
                    {
                        TicketCode = Guid.NewGuid().ToString(),
                        TicketTitle = obj.TicketTitle,
                        TicketCreator = obj.TicketCreator,
                        TicketTimeCreator = obj.TicketTimeCreator,
                        Packager = obj.Packager,
                        PackagerTime = obj.PackagerTime,
                        Status = obj.Status,
                        Noted = obj.Noted,
                    };
                    _context.PackageTicketHds.Add(data);
                    _context.SaveChanges();
                    msg.Title = "Thêm phiếu xếp dỡ Pallet/kiện hàng thành công";
                    msg.Code = data.TicketCode;
                }
                else
                {
                    msg.Title = "Mã phiếu đã tồn tại";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra khi thêm";
            }
            return Json(msg);
        }
        public JsonResult UpdatePackageTicketHd([FromBody] PackageTicketHd obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.PackageTicketHds.FirstOrDefault(x => x.TicketCode == obj.TicketCode);
                if (data != null)
                {
                    data.TicketTitle = obj.TicketTitle;
                    data.TicketCreator = obj.TicketCreator;
                    data.TicketTimeCreator = obj.TicketTimeCreator;
                    data.Packager = obj.Packager;
                    data.PackagerTime = obj.PackagerTime;
                    data.Status = obj.Status;
                    data.Noted = obj.Noted;
                    _context.PackageTicketHds.Update(data);
                    _context.SaveChanges();
                    msg.Title = "Sửa thành công";
                }
                else
                {
                    msg.Title = "Mã phiếu không tồn tại";
                }
            }
            catch (Exception ex)
            {

                msg.Error = true;
                msg.Title = "Có lỗi xảy ra khi sửa";
            }
            return Json(msg);
        }

        [HttpDelete]
        public JsonResult DeletePackageTicketHd(string ticketCode)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.PackageTicketHds.FirstOrDefault(x => x.TicketCode == ticketCode);
                if (data != null)
                {
                    var detail = _context.PackageTicketDts.Where(x => x.TicketCode == ticketCode).ToList();
                    _context.PackageTicketHds.Remove(data);
                    _context.PackageTicketDts.RemoveRange(detail);
                    _context.SaveChanges();
                    msg.Title = "Xóa thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Phiếu không tồn tại";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Object = ex;
                msg.Title = "Có lỗi xảy ra khi xóa";
            }

            return Json(msg);
        }


        public class PackageTicketDtModel : JTableModel
        {
            public int? Id { get; set; }
            public string TicketCode { get; set; }
            public string ProductCode { get; set; }
            public int IdImpProduct { get; set; }
            public string ProductNumRange { get; set; }
            public string GattrCode { get; set; }
            public string PackCode { get; set; }
            public string StoreCode { get; set; }
            public string CreatedBy { get; set; }
            public bool IsInStock { get; set; }
            public decimal? Measure { get; set; }
        }
        [HttpPost]
        public JsonResult GetListPackagePallet(PackageTicketDtModel obj)
        {
            JMessage msg = new JMessage { Error = false };
            try
            {
                int intBeginFor = (obj.CurrentPage - 1) * obj.Length;
                var query = from a in _context.PackageTicketDts
                            join b in _context.PackageTicketHds on a.TicketCode equals b.TicketCode
                            join c in _context.MaterialProducts.Where(x => !x.IsDeleted) on a.ProductCode equals c.ProductCode
                            join d in _context.ProductInPallets.Where(x => !x.IsDeleted) on a.Id equals d.IdLoadingTicket
                            where (string.IsNullOrEmpty(obj.TicketCode) || obj.TicketCode == a.TicketCode)
                                    && (string.IsNullOrEmpty(obj.PackCode) || obj.PackCode == a.PackCode)
                            select new
                            {
                                a.Id,
                                a.TicketCode,
                                a.ProductCode,
                                ProductName = c.ProductName + "-" + a.ProductCode,
                                a.IdImpProduct,
                                a.ProductNumRange,
                                a.GattrCode,
                                a.PackCode,
                                PackName = a.PackCode != null ? _context.PackageObjects.FirstOrDefault(y => y.PackCode == a.PackCode).PackName : "",
                                d.IdLoadingTicket,
                                d.Measure,
                                a.StatusProductPallet,
                                StatusProductName = a.StatusProductPallet != null ? _context.CommonSettings.FirstOrDefault(y => y.CodeSet == a.StatusProductPallet).ValueSet : "",
                                IdProdcutPallet = d.Id,
                            };
                var count = query.Count();
                var data = query.OrderByDescending(x => x.Id)/*.Skip(intBeginFor).Take(obj.Length)*/.AsNoTracking().ToList();
                msg.Object = new
                {
                    count = count,
                    data = data
                };
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi lấy dữ liệu!";
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetListPackageDetail(PackageTicketDtModel obj)
        {
            JMessage msg = new JMessage { Error = false };
            try
            {
                int intBeginFor = (obj.CurrentPage - 1) * obj.Length;
                var query = from a in _context.PackageTicketDts
                            join b in _context.PackageTicketHds on a.TicketCode equals b.TicketCode
                            join c in _context.MaterialProducts.Where(x => !x.IsDeleted) on a.ProductCode equals c.ProductCode
                            join d in _context.ProductInPallets on a.Id equals d.IdLoadingTicket into d1
                            from d2 in d1.DefaultIfEmpty()
                            where (string.IsNullOrEmpty(obj.TicketCode) || obj.TicketCode == a.TicketCode)
                                    && (string.IsNullOrEmpty(obj.PackCode) || obj.PackCode == a.PackCode)
                            select new
                            {
                                a.Id,
                                a.TicketCode,
                                a.ProductCode,
                                ProductName = c.ProductName + "-" + a.ProductCode,
                                a.IdImpProduct,
                                a.ProductNumRange,
                                a.GattrCode,
                                a.PackCode,
                                PackName = a.PackCode != null ? _context.PackageObjects.FirstOrDefault(y => y.PackCode == a.PackCode).PackName : "",
                                a.StatusProductPallet,
                                StatusProductName = a.StatusProductPallet != null ? _context.CommonSettings.FirstOrDefault(y => y.CodeSet == a.StatusProductPallet).ValueSet : "",
                                d2.Measure,

                            };
                var count = query.Count();
                var data = query.OrderByDescending(x => x.Id)/*.Skip(intBeginFor).Take(obj.Length)*/.AsNoTracking().ToList();
                msg.Object = new
                {
                    count = count,
                    data = data
                };
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi lấy dữ liệu!";
            }
            return Json(msg);
        }

        [HttpPost]
        public IActionResult InsertDetail([FromBody] PackageTicketDtModel obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var listProdNo = new List<ProdStrNo>();
                try
                {
                    listProdNo = ListProdStrNoHelper.GetListProdStrNo(obj.ProductNumRange);
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.Message);
                }
                if (listProdNo.Count == 0)
                {
                    msg.Error = true;
                    msg.Title = "Thứ tự không hợp lệ!";
                    return Ok(msg);
                }
                var checkDetails = _context.PackageTicketDts.Where(x => x.ProductCode == obj.ProductCode
                && x.TicketCode == obj.TicketCode).ToList();
                var checkDetailpallet = _context.ProductInPallets.Where(x => x.ProductCode == obj.ProductCode
                && x.PackCode == obj.PackCode).ToList();

                //Sửa tiêu đề cho kiện, pallet
                var packName = _context.PackageObjects.FirstOrDefault(x => x.PackCode == obj.PackCode);
                if (packName != null)
                {
                    packName.PackName = _context.PackageTicketHds.FirstOrDefault(x => x.TicketCode == obj.TicketCode)?.TicketTitle;
                    _context.PackageObjects.Update(packName);
                }
                if (checkDetails.Count == 0 || obj.IsInStock)
                {
                    var data = new PackageTicketDt()
                    {
                        TicketCode = obj.TicketCode,
                        ProductCode = obj.ProductCode,
                        IdImpProduct = obj.IdImpProduct,
                        ProductNumRange = obj.ProductNumRange,
                        GattrCode = obj.GattrCode,
                        PackCode = obj.PackCode,
                        StatusProductPallet = "PRODUCT_PALLET_ADD",
                    };
                    _context.PackageTicketDts.Add(data);
                    _context.SaveChanges();
                    msg.ID = data.Id;

                }
                if (checkDetailpallet.Count == 0 || obj.IsInStock)
                {
                    _context.ProductInPallets.Add(new ProductInPallet()
                    {
                        IdLoadingTicket = msg.ID,
                        ProductCode = obj.ProductCode,
                        IdImpProduct = obj.IdImpProduct,
                        ProductNo = obj.ProductNumRange,
                        GattrCode = obj.GattrCode,
                        StoreCode = obj.StoreCode,
                        PackCode = obj.PackCode,
                        Measure = obj.Measure,
                        CreatedBy = obj.CreatedBy,
                        CreatedTime = DateTime.Now,
                    });
                }
                else
                {
                    var checkProductNum = checkDetails.Any(x => x.ListProdStrNo.IsIntersect(listProdNo));
                    var checkPalletNum = checkDetailpallet.Any(x => x.ListProdStrNo.IsIntersect(listProdNo));
                    if (checkProductNum || checkPalletNum)
                    {
                        msg.Error = true;
                        msg.Title = "Thứ tự đã được sử dụng!";
                        return Ok(msg);
                    }
                    var detail = checkDetails.FirstOrDefault();
                    var detailPallet = checkDetailpallet.FirstOrDefault();
                    detail.ListProdStrNo.AddRange(listProdNo);
                    detailPallet.ListProdStrNo.AddRange(listProdNo);
                    var dataNew = _context.PackageTicketDts.FirstOrDefault(x => x.TicketCode == obj.TicketCode && x.ProductCode == obj.ProductCode && x.PackCode == obj.PackCode);
                    dataNew.StatusProductPallet = "Thay đổi";
                    _context.PackageTicketDts.Update(dataNew);
                    //var checkProductNum = checkDetails.Any(x => x.Pro);
                }
                _context.SaveChanges();
                msg.Title = "Thêm chi tiết xếp dỡ Pallet/kiện hàng thành công";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra khi sửa";
            }
            return Ok(msg);
        }
        public JsonResult InsertPacketTicketDt([FromBody] PackageTicketDtModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var checkExit = _context.PackageTicketDts.FirstOrDefault(x => x.TicketCode == obj.TicketCode && x.ProductCode == obj.ProductCode);
                if (checkExit == null)
                {
                    var data = new PackageTicketDt
                    {
                        TicketCode = obj.TicketCode,
                        ProductCode = obj.ProductCode,
                        IdImpProduct = obj.IdImpProduct,
                        ProductNumRange = obj.ProductNumRange,
                        GattrCode = obj.GattrCode,
                    };
                    _context.PackageTicketDts.Add(data);
                    _context.SaveChanges();
                    msg.Title = "Thêm chi tiết xếp dỡ Pallet/kiện hàng thành công";
                }
                else
                {
                    var dataUpdate = _context.PackageTicketDts.FirstOrDefault(x => x.TicketCode == obj.TicketCode && x.ProductCode == obj.ProductCode);
                    dataUpdate.ProductCode = obj.ProductCode;
                    dataUpdate.IdImpProduct = obj.IdImpProduct;
                    dataUpdate.ProductNumRange = obj.ProductNumRange;
                    dataUpdate.GattrCode = obj.GattrCode;
                    _context.PackageTicketDts.Update(dataUpdate);
                    _context.SaveChanges();
                    msg.Title = "Sửa chi tiết xếp dỡ Pallet/kiện hàng thành công";

                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra khi thêm";
            }
            return Json(msg);
        }
        public JsonResult UpdatePackageTicketDt([FromBody] PackageTicketDtModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.PackageTicketDts.FirstOrDefault(x => x.TicketCode == obj.TicketCode && x.ProductCode == obj.ProductCode && x.PackCode == obj.PackCode);
                var dataPallet = _context.ProductInPallets.FirstOrDefault(x => x.IdLoadingTicket == data.Id);
                if (data != null)
                {
                    data.ProductCode = obj.ProductCode;
                    data.IdImpProduct = obj.IdImpProduct;
                    data.ProductNumRange = obj.ProductNumRange;
                    data.GattrCode = obj.GattrCode;
                    data.PackCode = obj.PackCode;
                    data.StatusProductPallet = "PRODUCT_PALLET_EDIT";
                    _context.PackageTicketDts.Update(data);

                    dataPallet.ProductCode = obj.ProductCode;
                    dataPallet.ProductNo = obj.ProductNumRange;
                    dataPallet.GattrCode = obj.GattrCode;
                    dataPallet.UpdatedBy = obj.CreatedBy;
                    dataPallet.Measure = obj.Measure;
                    dataPallet.UpdatedTime = DateTime.Now;
                    _context.ProductInPallets.Update(dataPallet);
                    _context.SaveChanges();
                    msg.Title = "Sửa chi tiết xếp dỡ Pallet/kiện hàng thành công";
                }
                else
                {
                    //var dataAdd = new PackageTicketDt
                    //{
                    //    TicketCode = obj.TicketCode,
                    //    ProductCode = obj.ProductCode,
                    //    IdImpProduct = obj.IdImpProduct,
                    //    ProductNumRange = obj.ProductNumRange,
                    //    GattrCode = obj.GattrCode,
                    //};
                    //_context.PackageTicketDts.Add(dataAdd);
                    //_context.SaveChanges();
                    msg.Title = "Bạn chưa thêm mới sản phẩm trong chi tiết";
                }
            }
            catch (Exception ex)
            {

                msg.Error = true;
                msg.Title = "Có lỗi xảy ra khi sửa";
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult DeletePackageTicketPallet(int id, string userName)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.PackageTicketDts.FirstOrDefault(x => x.Id == id);
                var dataPallet = _context.ProductInPallets.FirstOrDefault(x => x.IdLoadingTicket == id);
                if (dataPallet != null)
                {
                    dataPallet.IsDeleted = true;
                    dataPallet.DeletedBy = userName;
                    dataPallet.DeletedTime = DateTime.Now;
                    _context.ProductInPallets.Update(dataPallet);
                    data.StatusProductPallet = "PRODUCT_PALLET_DELETE";
                    _context.PackageTicketDts.Update(data);
                    _context.SaveChanges();
                    msg.Code = dataPallet.PackCode;
                    msg.Title = "Xóa thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "chi tiết xếp dỡ Pallet/kiện hàng không tồn tại";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Object = ex;
                msg.Title = "Có lỗi xảy ra khi xóa";
            }

            return Json(msg);
        }

        [HttpPost]
        public JsonResult DeletePackageTicketDt(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var dataPallet = _context.ProductInPallets.FirstOrDefault(x => x.IdLoadingTicket == id);
                var data = _context.PackageTicketDts.FirstOrDefault(x => x.Id == id);
                if (data != null)
                {
                    _context.ProductInPallets.Remove(dataPallet);
                    _context.PackageTicketDts.Remove(data);
                    _context.SaveChanges();
                    msg.Title = "Xóa thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "chi tiết xếp dỡ Pallet/kiện hàng không tồn tại";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Object = ex;
                msg.Title = "Có lỗi xảy ra khi xóa";
            }

            return Json(msg);
        }

        [HttpGet]
        public JsonResult GetListProductInPallet(int currentPage = 1, int pageLength = 10, string palletCode = "")
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                int intBeginFor = (currentPage - 1) * pageLength;
                var query = from a in _context.ProductInPallets.Where(x => !x.IsDeleted && x.PackCode == palletCode)
                            join b in _context.MaterialProducts on a.ProductCode equals b.ProductCode
                            select new
                            {
                                Id = a.Id,
                                IdImpProduct = a.IdImpProduct,
                                ProductNo = a.ProductNo,
                                ProductCode = a.ProductCode,
                                ProductName = b.ProductName,
                                Sum = a.ListProdStrNo.SumQuantity(),
                                GattrCode = a.GattrCode,
                                StoreCode = a.StoreCode,
                                PackCode = a.PackCode,
                                CreatedTime = a.CreatedTime
                            };

                var count = query.Count();
                var data = query.OrderByDescending(x => x.Id).Skip(intBeginFor).Take(pageLength).ToList();
                var result = new
                {
                    count,
                    data
                };
                msg.Object = result;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi lấy dữ liệu";
            }
            return Json(msg);
        }


        [HttpPost]
        public object GetListProperties()
        {
            JMessage msg = new JMessage { Error = false };
            try
            {
                var data = _context.ProductGattrExts
                    .Where(x => !x.IsDeleted)
                    .OrderBy(x => x.GattrCode).Select(x => new { Code = x.GattrCode, Name = x.GattrFlatCode });
                msg.Object = data;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi lấy dữ liệu!";
            }

            return Json(msg);
        }
        #endregion

        #region Kiểm tra product
        public IActionResult ProductInspectionDemo()
        {
            try
            {
                return Ok(_context.ProductQualityInspectionImps.ToList());
            }
            catch (Exception ex)
            {
                return NotFound();
            }
        }
        public IActionResult ProductInspectionDetailsDemo()
        {
            try
            {
                return Ok(_context.ProductQualityInspectionImpDetails.ToList());
            }
            catch (Exception ex)
            {
                return NotFound();
            }
        }
        public class ProductInspectionModel : JTableModel
        {
            public string QcTicketCode { get; set; }
            public string TicketTitle { get; set; }
            public string TicketCreator { get; set; }
            public DateTime TicketCreateTime { get; set; }
            public string Status { get; set; }
            public string Excuter { get; set; }
            public string Checker { get; set; }
            public string Noted { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string KeyWork { get; set; }
        }
        [HttpPost]
        public object GetListProductInspection(ProductInspectionModel obj)
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
                int intBeginFor = (obj.CurrentPage - 1) * obj.Length;
                var query = from a in _context.ProductQualityInspectionImps
                            join b in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "ORDER_SUPPLIER")
                                on a.Status equals b.CodeSet into b1
                            from c2 in b1.DefaultIfEmpty()
                            where (string.IsNullOrEmpty(obj.QcTicketCode) || obj.QcTicketCode == a.QcTicketCode) &&
                                    ((fromDate == null) || (a.TicketCreateTime.HasValue && a.TicketCreateTime.Value.Date >= fromDate)) &&
                                    ((toDate == null) || (a.TicketCreateTime.HasValue && a.TicketCreateTime.Value.Date <= toDate)) &&
                                    (string.IsNullOrEmpty(obj.KeyWork) || a.TicketTitle.ToLower().Contains(obj.KeyWork.ToLower())) &&
                                    (string.IsNullOrEmpty(obj.Status) || a.Status.Contains(obj.Status)) &&
                                    (string.IsNullOrEmpty(obj.TicketCreator) || a.TicketCreator.Contains(obj.TicketCreator)) &&
                                    (string.IsNullOrEmpty(obj.Excuter) || a.Excuter.Contains(obj.Excuter)) &&
                                    (string.IsNullOrEmpty(obj.Checker) || a.Checker.Contains(obj.Checker))

                            select new
                            {
                                a.Id,
                                a.QcTicketCode,
                                a.TicketTitle,
                                a.TicketCreateTime,
                                a.TicketCreator,
                                a.Excuter,
                                a.Checker,
                                a.Status,
                                a.Noted,
                                status = c2 != null ? c2.ValueSet : "",
                                statusName = a.Status != null ? _context.CommonSettings.FirstOrDefault(y => y.CodeSet == a.Status).ValueSet : "",
                                TicketCreatorName = _context.HREmployees.FirstOrDefault(y => y.employee_code == a.TicketCreator).fullname,
                                ExcuterName = _context.HREmployees.FirstOrDefault(y => y.employee_code == a.Excuter).fullname,
                                CheckerName = _context.HREmployees.FirstOrDefault(y => y.employee_code == a.Checker).fullname
                            };
                var count = query.Count();
                var data = query.OrderByDescending(x => x.Id).Skip(intBeginFor).Take(obj.Length).AsNoTracking().ToList();
                msg.Object = new
                {
                    count = count,
                    data = data
                };
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi lấy dữ liệu!";
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult InsertProductInspection([FromBody] ProductInspectionModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var checkExist = _context.ProductQualityInspectionImps.FirstOrDefault(x => x.QcTicketCode == obj.QcTicketCode);
                if (checkExist == null)
                {
                    var data = new ProductQualityInspectionImp
                    {
                        QcTicketCode = Guid.NewGuid().ToString(),
                        TicketTitle = obj.TicketTitle,
                        TicketCreator = obj.TicketCreator,
                        TicketCreateTime = obj.TicketCreateTime,
                        Status = obj.Status,
                        Excuter = obj.Excuter,
                        Checker = obj.Checker,
                        Noted = obj.Noted,
                    };
                    _context.ProductQualityInspectionImps.Add(data);
                    _context.SaveChanges();
                    msg.Title = "Thêm phiếu kiểm tra sản phẩm thành công";
                    msg.Code = data.QcTicketCode;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Mã phiếu đã tồn tại";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Object = ex;
                msg.Title = "Có lỗi xảy ra khi thêm";
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateProductInspection([FromBody] ProductInspectionModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.ProductQualityInspectionImps.FirstOrDefault(x => x.QcTicketCode == obj.QcTicketCode);
                if (data != null)
                {
                    data.TicketTitle = obj.TicketTitle;
                    data.TicketCreator = obj.TicketCreator;
                    data.TicketCreateTime = obj.TicketCreateTime;
                    data.Status = obj.Status;
                    data.Excuter = obj.Excuter;
                    data.Checker = obj.Checker;
                    data.Noted = obj.Noted;
                    _context.ProductQualityInspectionImps.Update(data);
                    _context.SaveChanges();
                    msg.Title = "Sửa phiếu kiểm tra sản phẩm thành công";
                    msg.Code = data.QcTicketCode;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Mã phiếu không tồn tồn tại";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Object = ex;
                msg.Title = "Có lỗi xảy ra khi Sửa";
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult DeleteProductInspection(string qcTicketCode)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.ProductQualityInspectionImps.FirstOrDefault(x => x.QcTicketCode == qcTicketCode);
                var dataItem = _context.ProductQualityInspectionImpDetails.Where(x => x.QcTicketCode == qcTicketCode).ToList();
                if (data != null)
                {
                    _context.ProductQualityInspectionImps.Remove(data);
                    _context.ProductQualityInspectionImpDetails.RemoveRange(dataItem);
                    _context.SaveChanges();
                    msg.Title = "Xóa thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Mã phiếu không tồn tại";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Object = ex;
                msg.Title = "Có lỗi xảy ra khi xóa";
            }

            return Json(msg);
        }

        public class ProductInspectionDetailModel : JTableModel
        {
            public int Id { get; set; }
            public string QcTicketCode { get; set; }
            public string ProdCodeLst { get; set; }
            public DateTime? ReceivedDate { get; set; }
            public DateTime? CheckingDate { get; set; }
            public string SupplierCode { get; set; }
            public string DeliveryNo { get; set; }
            public string FacilitySpect { get; set; }
            public string Quantity { get; set; }
            public string Unit { get; set; }
            public string Results { get; set; }
            public List<ProductItem> ProdCodeLstNew { get; set; }
            public string SupName { get; set; }
            public string UnitName { get; set; }
            //public string ProductName { get; set; }
        }
        public class ProductItem
        {
            public string Code { get; set; }
            public string Name { get; set; }
        }
        private List<ProductItem> ValidateData(string data)
        {
            if (data == null)
            {
                return new List<ProductItem>();
            }
            else
            {
                List<ProductItem> jsonData = JsonConvert.DeserializeObject<List<ProductItem>>(data);
                return jsonData;
            }

        }

        [HttpPost]
        public object GetListProductInspectionDetail(ProductInspectionDetailModel obj)
        {
            JMessage msg = new JMessage { Error = false };
            try
            {
                int intBeginFor = (obj.CurrentPage - 1) * obj.Length;
                var query = from a in _context.ProductQualityInspectionImpDetails.Where(x => x.QcTicketCode == obj.QcTicketCode)
                            join c in _context.ProductQualityInspectionImps on a.QcTicketCode equals c.QcTicketCode into c1
                            join d in _context.Suppliers on a.SupplierCode equals d.SupCode
                            select new ProductInspectionDetailModel
                            {
                                Id = a.Id,
                                QcTicketCode = a.QcTicketCode,
                                ProdCodeLstNew = ValidateData(a.ProdCodeLst),
                                SupplierCode = a.SupplierCode,
                                SupName = d.SupName,
                                ReceivedDate = a.ReceivedDate,
                                CheckingDate = a.CheckingDate,
                                DeliveryNo = a.DeliveryNo,
                                FacilitySpect = a.FacilitySpect,
                                Quantity = a.Quantity,
                                Unit = a.Unit,
                                Results = a.Results,
                                UnitName = a.Unit != null ? _context.CommonSettings.FirstOrDefault(y => y.CodeSet == a.Unit).ValueSet : "",
                            };
                var count = query.Count();
                var data = query.OrderByDescending(x => x.Id).Skip(intBeginFor).Take(obj.Length).AsNoTracking().ToList();
                //foreach (var item in data)
                //{
                //    item.ProdCodeLst = JsonConvert.DeserializeObject<List<ProductItem>>(item.ProdCodeLst);
                //}

                msg.Object = new
                {
                    count = count,
                    data = data
                };
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi lấy dữ liệu!";
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult InsertProductInspectionDetail([FromBody] ProductInspectionDetailModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            //var arr = new ProductItem
            //{
            //    Code = obj.ProductCode,
            //    Name = obj.ProductName,
            //};
            //List<ProductItem> listProduct = new List<ProductItem> { arr };
            //string jsonData = JsonConvert.SerializeObject(listProduct);

            var productItems = new List<ProductItem>();
            foreach (var code in obj.ProdCodeLstNew)
            {
                var productItem = new ProductItem()
                {
                    Code = code.Code,
                    Name = code.Name,
                };
                productItems.Add(productItem);
            }
            string jsonData = JsonConvert.SerializeObject(productItems);
            try
            {
                var checkExist = _context.ProductQualityInspectionImpDetails.FirstOrDefault(x => x.QcTicketCode == obj.QcTicketCode);
                var data = new ProductQualityInspectionImpDetails()
                {
                    QcTicketCode = obj.QcTicketCode,
                    ProdCodeLst = jsonData,
                    ReceivedDate = obj.ReceivedDate,
                    CheckingDate = obj.CheckingDate,
                    SupplierCode = obj.SupplierCode,
                    DeliveryNo = obj.DeliveryNo,
                    FacilitySpect = obj.FacilitySpect,
                    Quantity = obj.Quantity,
                    Unit = obj.Unit,
                    Results = obj.Results,
                };
                _context.ProductQualityInspectionImpDetails.Add(data);
                _context.SaveChanges();
                msg.Title = "Thêm chi tiết đánh giá nhà cung cấp thành công";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Object = ex;
                msg.Title = "Có lỗi xảy ra khi thêm";
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateProductInspectionDetail([FromBody] ProductInspectionDetailModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var productItems = new List<ProductItem>();
                foreach (var code in obj.ProdCodeLstNew)
                {
                    var productItem = new ProductItem
                    {
                        Code = code.Code,
                        Name = code.Name,
                    };
                    productItems.Add(productItem);
                }
                string jsonData = JsonConvert.SerializeObject(productItems);
                var data = _context.ProductQualityInspectionImpDetails.FirstOrDefault(x => x.QcTicketCode == obj.QcTicketCode && x.Id == obj.Id);
                if (data != null)
                {
                    data.QcTicketCode = obj.QcTicketCode;
                    data.ProdCodeLst = obj.ProdCodeLst;
                    data.ReceivedDate = obj.ReceivedDate;
                    data.CheckingDate = obj.CheckingDate;
                    data.SupplierCode = obj.SupplierCode;
                    data.DeliveryNo = obj.DeliveryNo;
                    data.FacilitySpect = obj.FacilitySpect;
                    data.Quantity = obj.Quantity;
                    data.Unit = obj.Unit;
                    data.Results = obj.Results;
                    _context.ProductQualityInspectionImpDetails.Update(data);
                    _context.SaveChanges();
                    msg.Title = "Sửa chi tiết kiểm tra sản phẩm thành công";
                }
                else
                {
                    var dataNew = new ProductQualityInspectionImpDetails()
                    {
                        QcTicketCode = obj.QcTicketCode,
                        ProdCodeLst = jsonData,
                        ReceivedDate = obj.ReceivedDate,
                        CheckingDate = obj.CheckingDate,
                        SupplierCode = obj.SupplierCode,
                        DeliveryNo = obj.DeliveryNo,
                        FacilitySpect = obj.FacilitySpect,
                        Quantity = obj.Quantity,
                        Unit = obj.Unit,
                        Results = obj.Results,
                    };
                    _context.ProductQualityInspectionImpDetails.Add(dataNew);
                    _context.SaveChanges();
                    msg.Title = "Thêm chi tiết kiểm tra sản phẩm thành công";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Object = ex;
                msg.Title = "Có lỗi xảy ra khi Sửa chi tiết kiểm tra sản phẩm";
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult DeleteProductInspectionDetail(int Id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.ProductQualityInspectionImpDetails.FirstOrDefault(x => x.Id == Id);
                if (data != null)
                {
                    _context.ProductQualityInspectionImpDetails.Remove(data);
                    _context.SaveChanges();
                    msg.Title = "Xóa thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Mã phiếu không tồn tại";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Object = ex;
                msg.Title = "Có lỗi xảy ra khi xóa";
            }

            return Json(msg);
        }

        public class PackingData
        {
            public string ValueSet { get; set; }
            public string CodeSet { get; set; }
        }

        [HttpGet]
        public JsonResult GetListPacking()
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var packingList = _context.CommonSettings.Where(group => (!group.IsDeleted && (group.Group == "TYPE_PACKING")))
                    .Select(group => new PackingData
                    {

                        ValueSet = group.ValueSet,
                        CodeSet = group.CodeSet
                    }).ToList();

                msg.Object = packingList;

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra khi xóa";
            };
            return Json(msg);
        }

        public class StatusPackage
        {
            public string ValueSet { get; set; }
            public string CodeSet { get; set; }
        }

        [HttpGet]
        public JsonResult GetListStatusPackage()
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var status = _context.CommonSettings.Where(filter => (!filter.IsDeleted && (filter.Group == "STATUS_PACKAGE")))
                        .Select(stt => new StatusPackage
                        {
                            ValueSet = stt.ValueSet,
                            CodeSet = stt.CodeSet
                        }).ToList();
                msg.Object = status;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra khi lấy dữ liệu";
            };
            return Json(msg);
        }

        [HttpGet]
        public JsonResult GetListStatusReady()
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var options = _context.CommonSettings.Where(item => (item.IsDeleted == false) && (item.Group == "STATUS_READY"))
                    .Select(format => new
                    {
                        Name = format.ValueSet,
                        Code = format.CodeSet
                    }).ToList();
                msg.Object = options;
            }
            catch
            {
                msg.Error = true;
                msg.Title = "Lỗi khi lấy dữ liệu";
            }
            return Json(msg);
        }

        private List<AttrPackModel> ValidateAttrPack(string data)
        {
            if (data == null)
            {
                return new List<AttrPackModel>();
            }
            else
            {
                List<AttrPackModel> jsonData = JsonConvert.DeserializeObject<List<AttrPackModel>>(data);
                return jsonData;
            }
        }

        [HttpGet]
        public JsonResult GetPackage(int? id, int currentPage = 1, int pageLength = 10, string packCode = "", string status = "", string currentPos = "")
        {
            int intBeginFor = (currentPage - 1) * pageLength;
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var common = _context.CommonSettings;
                var query = _context.PackageObjects.Where(item => (id == null || item.Id == id)
                                                            && (string.IsNullOrEmpty(packCode) || item.PackCode == packCode)
                                                            && (string.IsNullOrEmpty(status) || item.Status == status)
                                                            && (string.IsNullOrEmpty(currentPos) || item.CurrentPos == currentPos));
                var package = query.OrderByDescending(x => x.Id).Skip(intBeginFor).Take(pageLength).Select(x => new
                {
                    x.Id,
                    x.PackCode,
                    x.PackName,
                    x.PackType,
                    PackTypeName = (x.PackType != null) ? common.FirstOrDefault(y => y.CodeSet == x.PackType).ValueSet : "",
                    x.Specs,
                    x.Noted,
                    x.CurrentPos,
                    CurrentPosName = x.CurrentPos,
                    StatusName = (x.Status != null) ? common.FirstOrDefault(y => y.CodeSet == x.Status).ValueSet : "",
                    x.PackCodeParent,
                    PackCodeParentName = (x.PackCodeParent != null) ? _context.PackageObjects.FirstOrDefault(y => y.PackCode == x.PackCodeParent).PackName : "",
                    AttrPack = ValidateAttrPack(x.AttrPack),
                    x.Level,
                    x.NumPosition,
                    x.StatusReady,
                    StatusReadyName = (x.StatusReady != null) ? common.FirstOrDefault(y => y.CodeSet == x.StatusReady).ValueSet : "",
                }).ToList();

                msg.Object = package;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra khi lấy dữ liệu";
            }
            return Json(msg);
        }

        [HttpGet]
        public JsonResult GetItemPackageCrud(int id)
        {
            //int intBeginFor = (currentPage - 1) * pageLength;
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var common = _context.CommonSettings;
                var query = _context.PackageObjects.Where(item => item.Id == id);
                var package = query.Select(x => new
                {
                    x.Id,
                    x.PackCode,
                    x.PackName,
                    x.PackType,
                    PackTypeName = (x.PackType != null) ? common.FirstOrDefault(y => y.CodeSet == x.PackType).ValueSet : "",
                    x.Specs,
                    x.Noted,
                    x.CurrentPos,
                    CurrentPosName = x.CurrentPos,
                    Status = x.Status,
                    StatusName = (x.Status != null) ? common.FirstOrDefault(y => y.CodeSet == x.Status).ValueSet : "",
                    x.PackCodeParent,
                    PackCodeParentName = (x.PackCodeParent != null) ? _context.PackageObjects.FirstOrDefault(y => y.PackCode == x.PackCodeParent).PackName : "",
                    AttrPack = ValidateAttrPack(x.AttrPack),
                    x.Level,
                    x.NumPosition,
                    x.StatusReady,
                    StatusReadyName = (x.StatusReady != null) ? common.FirstOrDefault(y => y.CodeSet == x.StatusReady).ValueSet : "",
                }).FirstOrDefault();

                msg.Object = package;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra khi lấy dữ liệu";
            }
            return Json(msg);
        }

        [HttpGet]
        public JsonResult GetListPackageCode(int currentPage = 1, int pageLength = 10)
        {
            int intBeginFor = (currentPage - 1) * pageLength;
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var common = _context.CommonSettings;
                var query = _context.PackageObjects;
                var package = query.OrderBy(x => x.Id).Skip(intBeginFor).Take(pageLength).Select(x => new
                {
                    x.PackCode,
                    x.PackName,
                })
                    .ToList();
                msg.Object = package;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra khi lấy dữ liệu";
            }
            return Json(msg);
        }
        [HttpGet]
        public IActionResult GetTicketCode()
        {
            var count = _context.PackageObjects.Count();
            var maxId = count > 0 ? _context.PackageObjects.Max(x => x.Id) + 1 : 1;
            return Ok($"PACK_CODE_{maxId}");
        }

        public class PackageObjectModel
        {
            public int Id { get; set; }
            public string PackCode { get; set; }
            public string PackName { get; set; }
            public string PackType { get; set; }
            public string Specs { get; set; }
            public string Noted { get; set; }
            public string CurrentPos { get; set; }
            public string Status { get; set; }
            public string PackCodeParent { get; set; }
            public List<AttrPackModel> AttrPack { get; set; }
            public string Level { get; set; }
            public string NumPosition { get; set; }
            public string StatusReady { get; set; }
        }

        public class AttrPackModel
        {
            public string Code { get; set; }
            public string Name { get; set; }
            public string Value { get; set; }
            public string Unit { get; set; }
            public string UnitName { get; set; }
        }

        [HttpPost]
        public JsonResult InsertPackageObject([FromBody] PackageObjectModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var checkExist = _context.PackageObjects.FirstOrDefault(x => x.PackCode == obj.PackCode);
                if (checkExist == null)
                {
                    var newPackage = new PackageObject
                    {
                        PackCode = obj.PackCode,
                        PackName = obj.PackName,
                        PackType = obj.PackType,
                        Specs = obj.Specs,
                        Noted = obj.Noted,
                        CurrentPos = obj.CurrentPos,
                        Status = obj.Status,
                        PackCodeParent = obj.PackCodeParent,
                        AttrPack = JsonConvert.SerializeObject(obj.AttrPack),
                        Level = obj.Level,
                        NumPosition = obj.NumPosition,
                        StatusReady = obj.StatusReady
                    };
                    _context.PackageObjects.Add(newPackage);
                    _context.SaveChanges();
                    msg.Title = "Thêm Kiện/Hàng/Pallet thành công";
                    msg.ID = newPackage.Id;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "exist";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra khi thêm";
            }
            return Json(msg);
        }


        [HttpPost]
        public JsonResult UpdatePackageObject([FromBody] PackageObjectModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };

            try
            {
                var data = _context.PackageObjects.FirstOrDefault(x => x.PackCode == obj.PackCode);
                if (data != null)
                {
                    data.PackCode = obj.PackCode;
                    data.PackName = obj.PackName;
                    data.PackType = obj.PackType;
                    data.Specs = obj.Specs;
                    data.Noted = obj.Noted;
                    data.CurrentPos = obj.CurrentPos;
                    data.Status = obj.Status;
                    data.PackCodeParent = obj.PackCodeParent;
                    data.AttrPack = JsonConvert.SerializeObject(obj.AttrPack);
                    data.Level = obj.Level;
                    data.NumPosition = obj.NumPosition;
                    data.StatusReady = obj.StatusReady;
                    _context.PackageObjects.Update(data);
                    _context.SaveChanges();
                    msg.Title = "Sửa Kiện/Hàng/Pallet thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Mã phiếu không tồn tại";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra khi thêm";
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateStatusReady([FromBody] PackageObjectModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };

            try
            {
                var data = _context.PackageObjects.FirstOrDefault(x => x.PackCode == obj.PackCode);
                if (data != null)
                {
                    data.StatusReady = obj.StatusReady;
                    _context.PackageObjects.Update(data);
                    _context.SaveChanges();
                    msg.Title = "Sửa Kiện/Hàng/Pallet thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Mã phiếu không tồn tại";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra khi thêm";
            }
            return Json(msg);
        }


        [HttpPost]
        public JsonResult DeletePackageObject(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var packge = _context.PackageObjects.FirstOrDefault(x => x.Id == id);
                _context.PackageObjects.Remove(packge);
                _context.SaveChanges();
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra khi lấy dữ liệu";
            };
            return Json(msg);
        }
        #endregion

        #region phiếu nhập kho

        // ma phieu
        [HttpPost]
        public JsonResult CreateTicketCode(string type)
        {
            var mess = new JMessage { Error = false, Title = "" };
            try
            {
                var ticketCode = string.Empty;
                var monthNow = DateTime.Now.Month;
                var yearNow = DateTime.Now.Year;

                switch (type)
                {
                    case "ODD":
                        {
                            var impODD = _context.ProductImportHeaders.Where(x => string.IsNullOrEmpty(x.LotProductCode)).ToList();
                            var noODD = 1;
                            if (impODD.Count > 0)
                                noODD = noODD + impODD.Count;
                            var isExist = true;
                            while (isExist)
                            {
                                ticketCode = string.Format("IMP_ODD_T{0}.{1}_{2}", monthNow, yearNow, noODD);
                                isExist = _context.ProductImportHeaders.Any(x => !x.IsDeleted && x.TicketCode.Equals(ticketCode));
                                noODD++;
                            }
                            break;
                        }
                    case "PO":
                        {
                            var impPO = _context.ProductImportHeaders.Where(x => !string.IsNullOrEmpty(x.LotProductCode)).ToList();
                            var noPO = 1;
                            if (impPO.Count > 0)
                                noPO = noPO + impPO.Count;
                            var isExist = true;
                            while (isExist)
                            {
                                ticketCode = string.Format("IMP_PO_T{0}.{1}_{2}", monthNow, yearNow, noPO);
                                isExist = _context.ProductImportHeaders.Any(x => !x.IsDeleted && x.TicketCode.Equals(ticketCode));
                                noPO++;
                            }
                            break;
                        }
                }

                mess.Object = ticketCode;
            }
            catch (Exception ex)
            {
                mess.Error = true;
                //mess.Title = String.Format(CommonUtil.ResourceValue("MIS_MSG_IMPORT_WARE_HOURE_EXITS"));
                mess.Title = "Không tồn tại phiếu nhập kho!";
            }

            return Json(mess);
        }

        //luong
        [HttpPost]
        public JsonResult GetListWorkFlow()
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                msg.Object = _context.WorkFlows.Where(x => !x.IsDeleted.Value)
                    .Select(x => new { Code = x.WfCode, Name = x.WfName });
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //mess.Title = String.Format(CommonUtil.ResourceValue("MIS_MSG_IMPORT_WARE_HOURE_EXITS"));
                msg.Title = "Có lỗi xảy ra!";
            }

            return Json(msg);
        }

        // po
        [HttpPost]
        public object GetListLotProduct()
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                //Giờ lấy theo lô hàng mua về để nhập kho (phiếu đặt hàng Supplier)
                msg.Object = (from a in _context.PoBuyerHeaderNotDones
                              orderby a.Id descending
                              select new
                              {
                                  Code = a.PoSupCode,
                                  Name = a.PoTitle, //Vì bỏ Title nên lấy mã Code hiển thị
                              }).ToList();
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //mess.Title = String.Format(CommonUtil.ResourceValue("MIS_MSG_IMPORT_WARE_HOURE_EXITS"));
                msg.Title = "Có lỗi xảy ra!";
            }

            return Json(msg);
        }

        // kho
        [HttpPost]
        public object GetListStore()
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                msg.Object = _context.EDMSWareHouses.Where(x => x.WHS_Flag != true)
                    .OrderBy(x => x.WHS_Name).Select(x => new { Code = x.WHS_Code, Name = x.WHS_Name });
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //mess.Title = String.Format(CommonUtil.ResourceValue("MIS_MSG_IMPORT_WARE_HOURE_EXITS"));
                msg.Title = "Có lỗi xảy ra!";
            }

            return Json(msg);
        }

        // kho
        [HttpPost]
        public object GetListStoreNew(string type = "")
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var rs = (from a in _context.PAreaMappingsStore
                        .Where(x => x.IsDeleted == false && x.ObjectType.Equals(type))
                          join b in _context.PAreaCategoriesStore
                              on new { a.CategoryCode, a.ObjectType } equals new
                              { CategoryCode = b.Code, ObjectType = b.PAreaType }
                          select new MappingInfo
                          {
                              Code = b.PAreaCode,
                              Name = b.PAreaDescription,
                              Type = a.ObjectType,
                              Id = b.Id,
                              Mapping = a.ObjectCode,
                          }).ToList();
                string[] map = new[] { "AREA", "FLOOR", "LINE", "RACK", "POSITION" };
                var orderedList = from a in rs
                                  join b in map.Select((x, i) => new { Index = i, Value = x }) on a.Type equals b.Value
                                  orderby b.Index
                                  select a;
                msg.Object = orderedList;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //mess.Title = String.Format(CommonUtil.ResourceValue("MIS_MSG_IMPORT_WARE_HOURE_EXITS"));
                msg.Title = "Có lỗi xảy ra!";
            }

            return Json(msg);
        }

        //Đối với phiếu nhập kho thì khách hàng chuyển thành Nhà cung cấp (hiện vẫn giữ tên field & API theo khách hàng, chỉ thay đổi Bảng gọi ra)
        [HttpPost]
        public object GetListSupplierTicket()
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                msg.Object = _context.Suppliers.Where(x => !x.IsDeleted).OrderBy(x => x.SupName)
                    .Select(x => new { Code = x.SupCode, Name = x.SupName });
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //mess.Title = String.Format(CommonUtil.ResourceValue("MIS_MSG_IMPORT_WARE_HOURE_EXITS"));
                msg.Title = "Có lỗi xảy ra!";
            }

            return Json(msg);
        }

        // ng nhap kho
        [HttpPost]
        public object GetListUserImport()
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                //var rs = _context.Users.Where(x => x.Active && x.UserName != "admin").OrderBy(x => x.GivenName).Select(x => new { Code = x.UserName, Name = x.GivenName });
                msg.Object = from a in _context.Users.Where(x => x.Active && x.UserName != "admin")
                        .Select(x => new { Code = x.UserName, Name = x.GivenName, Id = x.Id })
                                 //join b in _context.AdUserInGroups.Where(x => x.IsMain) on a.Id equals b.UserId
                                 //orderby a.Name
                             select a;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //mess.Title = String.Format(CommonUtil.ResourceValue("MIS_MSG_IMPORT_WARE_HOURE_EXITS"));
                msg.Title = "Có lỗi xảy ra!";
            }

            return Json(msg);
        }

        // ly do
        [HttpPost]
        public object GetListReason()
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                msg.Object = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "IMP_REASON")
                    .OrderBy(x => x.ValueSet).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //mess.Title = String.Format(CommonUtil.ResourceValue("MIS_MSG_IMPORT_WARE_HOURE_EXITS"));
                msg.Title = "Có lỗi xảy ra!";
            }

            return Json(msg);
        }

        //trang thai
        [HttpPost]
        public JsonResult GetStatusAct()
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                msg.Object = _context.CommonSettings.Where(x =>
                        !x.IsDeleted &&
                        x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.StatusActWF)))
                    .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //mess.Title = String.Format(CommonUtil.ResourceValue("MIS_MSG_IMPORT_WARE_HOURE_EXITS"));
                msg.Title = "Có lỗi xảy ra!";
            }

            return Json(msg);
        }

        //insert phieu

        [HttpPost]
        public async Task<JsonResult> InsertImp([FromBody] MaterialStoreImpModelInsert obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                //var isChangePoSup = false;
                var poOldTime = DateTime.Now;
                var chk = _context.ProductImportHeaders.Any(x => x.TicketCode.Equals(obj.TicketCode));
                if (!chk)
                {
                    //Insert bảng header
                    var objNew = new ProductImportHeader
                    {
                        LotProductCode = obj.LotProductCode,
                        TicketCode = obj.TicketCode,
                        Title = obj.Title,
                        StoreCode = obj.StoreCode,
                        SupCode = obj.SupCode,
                        CusCode = obj.CusCode,
                        Reason = obj.Reason,
                        StoreCodeSend = obj.Reason == "IMP_FROM_MOVE_STORE" ? obj.StoreCodeSend : "",
                        UserImport = obj.UserImport,
                        Note = obj.Note,
                        UserSend = obj.UserSend,
                        InsurantTime = !string.IsNullOrEmpty(obj.InsurantTime)
                            ? DateTime.ParseExact(obj.InsurantTime, "dd/MM/yyyy", CultureInfo.InvariantCulture)
                            : (DateTime?)null,
                        TimeTicketCreate = !string.IsNullOrEmpty(obj.TimeTicketCreate)
                            ? DateTime.ParseExact(obj.TimeTicketCreate, "dd/MM/yyyy", CultureInfo.InvariantCulture)
                            : (DateTime?)null,
                        GroupType = obj.GroupType,
                        CreatedBy = obj.UserName,
                        CreatedTime = DateTime.Now,
                        DeletionToken = "NA"
                    };
                    _context.ProductImportHeaders.Add(objNew);
                    await _context.SaveChangesAsync();
                    msg.Title = "Thêm thành công phiếu nhập kho";
                    var header =
                        _context.ProductImportHeaders.FirstOrDefault(x =>
                            !x.IsDeleted && x.TicketCode.Equals(obj.TicketCode));
                    //var listDetail = _context.ProductImportDetails
                    //    .Where(x => !x.IsDeleted && x.TicketCode.Equals(obj.TicketCode)).ToList();
                    //listDetail.ForEach(x =>
                    //{
                    //    x.IsDeleted = true;
                    //    x.DeletedBy = ESEIM.AppContext.UserName;
                    //    x.DeletedTime = DateTime.Now;
                    //});
                    //_context.ProductImportDetails.UpdateRange(listDetail);
                    if (header != null)
                    {
                        var logData = new
                        {
                            Header = header,
                            Detail = new List<ProductImportDetail>()
                        };

                        var listLogData = new List<object>();
                        listLogData.Add(logData);

                        header.LogData = JsonConvert.SerializeObject(listLogData);

                        _context.ProductImportHeaders.Update(header);
                        await _context.SaveChangesAsync();
                    }

                    msg.ID = header.Id;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Phiếu nhập kho đã tồn tại";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi thêm phiếu nhập kho";
            }

            return Json(msg);
        }

        //Hướng mới - nhập kho từ lô sản phẩm được đặt hàng mua về (PO_Supplier)
        [HttpPost]
        public object GetLotProduct(string lotProductCode)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var today = DateTime.Now.ToString("ddMMyyyy-HHmm");

                var ListProduct =
                    (from a1 in _context.PoBuyerHeaders.Where(x => !x.IsDeleted && x.PoSupCode == lotProductCode)
                     join a in _context.PoBuyerDetails.Where(x => !x.IsDeleted) on a1.PoSupCode equals a.PoSupCode
                     join b1 in _context.MaterialProducts.Where(x => !x.IsDeleted) on a.ProductCode equals b1
                         .ProductCode
                     join c1 in _context.CommonSettings.Where(x => !x.IsDeleted) on b1.Unit equals c1.CodeSet into c2
                     from c1 in c2.DefaultIfEmpty()
                     join d in _context.CommonSettings.Where(x => !x.IsDeleted) on b1.ImpType equals d.CodeSet into
                         d1
                     from d2 in d1.DefaultIfEmpty()
                     let productQrCode = a.ProductCode + "_0_" + a.PoSupCode + "_T." + today
                     orderby b1.ProductName
                     select new
                     {
                         ProductCode = a.ProductCode,
                         ProductName = b1.ProductName,
                         ProductType = "FINISHED_PRODUCT",
                         ProductQrCode = productQrCode,
                         sProductQrCode = CommonUtil.GeneratorQRCode(productQrCode),
                         Unit = b1.Unit,
                         UnitName = (c1 != null ? c1.ValueSet : ""),
                         QuantityOrder = 0,
                         Quantity = int.Parse(a.Quantity),
                         QuantityPoCount = int.Parse(a.Quantity, 0),
                         SalePrice = a.UnitPrice != null ? a.UnitPrice : 0,
                         //QuantityIsSet = decimal.Parse(a.Quantity) - a.QuantityNeedImport,
                         QuantityIsSet = 0,
                         QuantityNeedSet = a.QuantityNeedImport,
                         QuantityNeedOrder = 0,
                         sQuantityCoil = 0,
                         ImpType = d2.ValueSet,
                         ListCoil = _context.ProdPackageReceiveds
                             .Where(x => !x.IsDeleted && x.ProductQrCode.Equals(productQrCode)).Select(k => new
                             {
                                 k.Id,
                                 k.ProductQrCode,
                                 ProductCoil = k.CoilCode,
                                 ProductCoilRelative = k.CoilRelative,
                                 k.Remain,
                                 k.Size,
                                 k.TicketCode,
                                 k.PackType,
                                 k.PositionInStore,
                                 k.RackCode,
                                 k.RackPosition,
                                 k.CreatedBy,
                                 k.CreatedTime,
                                 k.UpdatedBy,
                                 k.UpdatedTime,
                                 IsOrder = !string.IsNullOrEmpty(k.RackCode) ? true : false
                             })
                     });


                var SupCode = _context.PoBuyerHeaders.FirstOrDefault(x => !x.IsDeleted && x.PoSupCode == lotProductCode)
                    ?.SupCode;

                msg.Object = new { ListProduct, SupCode = SupCode };
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi thêm phiếu nhập kho";
            }

            return Json(msg);
        }

        [HttpGet]
        public JsonResult GetProductDetailTicket(string ticketCode)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                msg.Object =
                    (from a in _context.ProductImportDetails.Where(x => !x.IsDeleted && x.TicketCode.Equals(ticketCode))
                     join b in _context.MaterialProducts.Where(x => !x.IsDeleted) on a.ProductCode equals b
                         .ProductCode
                     select new
                     {
                         a.Id,
                         a.TicketCode,
                         b.ProductName,
                         b.ProductCode,
                         a.Quantity,
                         a.QuantityIsSet,
                         Unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.Unit)
                             .ValueSet,
                         a.SalePrice,
                         Currency = _context.CommonSettings
                             .FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.Currency).ValueSet,
                         QrCode = CommonUtil.GeneratorQRCode(a.ProductCode),
                         ProductQRCode = a.ProductQrCode,
                         Remain = a.Quantity - a.QuantityIsSet,
                         PackType = !string.IsNullOrEmpty(a.PackType) ? a.PackType : "",
                         sProductQrCode = CommonUtil.GenerateQRCode(a.ProductQrCode),
                         UnitCode = a.Unit
                     });
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi thêm phiếu nhập kho";
            }

            return Json(msg);
        }

        [NonAction]
        private List<DataAtt> GetAttrSetup(IQueryable<Activity> activities)
        {
            var listData = new List<DataAtt>();

            foreach (var item in activities)
            {
                if (!string.IsNullOrEmpty(item.ListGroupData))
                {
                    var listGroupData = item.ListGroupData.Split(',');

                    var data = (from a in _context.CommonSettings.Where(x =>
                            !x.IsDeleted && x.Group == "CARD_DATA_LOGGER")
                                join b in _context.AttrSetups.Where(x =>
                                        !x.IsDeleted && listGroupData.Any(p => p.Equals(x.AttrGroup)))
                                    on a.CodeSet equals b.AttrGroup
                                select new DataAttrWf
                                {
                                    AttrCode = b != null ? b.AttrCode : "",
                                    AttrName = b != null ? b.AttrName : "",
                                    AttrGroup = a.CodeSet,
                                    AttrDataType = b != null ? b.AttrDataType : "",
                                    AttrNote = b != null ? b.Note : "",
                                    AttrUnit = b != null ? b.AttrUnit : "",
                                    SessionId = "",
                                    Value = "",
                                    ActCode = item.ActivityCode
                                }).GroupBy(x => new { x.AttrGroup, x.ActCode }).ToList();

                    var rs = data.Select(x => new DataAtt
                    {
                        AttrGroup = x.Key.AttrGroup,
                        ActCode = x.Key.ActCode,
                        DataAttrWf = x.ToList()
                    }).ToList();

                    if (rs.Count > 0)
                        listData.AddRange(rs);
                }
            }

            return listData;
        }

        [HttpPost]
        public async Task<JsonResult> CreateWfInstance([FromBody] WorkflowInstance obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var wfInstCode = string.Empty;
            try
            {
                var user = _context.Users.FirstOrDefault(x => x.UserName == obj.CreatedBy);
                using (await objLock.LockAsync(string.Concat(obj.ObjectInst, obj.ObjectType)))
                {
                    if (!string.IsNullOrEmpty(obj.ActInstInitial))
                    {
                        var isActInitWf = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value &&
                            x.WorkflowCode.Equals(obj.WorkflowCode) && x.ActInstInitial.Equals(obj.ActInstInitial));
                        if (isActInitWf != null)
                        {
                            msg.Error = true;
                            msg.Title = "Hoạt động đã khởi tạo luồng này";
                            return Json(msg);
                        }
                    }

                    var userId = !string.IsNullOrEmpty(obj.UserId) ? obj.UserId : user.Id;
                    var check = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value &&
                                                                               !string.IsNullOrEmpty(x.ObjectInst) &&
                                                                               !string.IsNullOrEmpty(x.ObjectType) &&
                                                                               x.ObjectInst == obj.ObjectInst &&
                                                                               x.ObjectType == obj.ObjectType);

                    var processing = _context.WfActivityObjectProccessings.Where(x => !x.IsDeleted &&
                        x.ObjectType.Equals(obj.ObjectType)
                        && x.ObjectInst.Equals(obj.ObjectInst));

                    if (check == null && !processing.Any())
                    {
                        var wf = _context.WorkFlows.FirstOrDefault(x =>
                            !x.IsDeleted.Value && x.WfCode.Equals(obj.WorkflowCode));

                        if (string.IsNullOrEmpty(obj.WfInstName))
                        {
                            obj.WfInstName = obj.ObjectName + " - " + (wf != null ? wf.WfName : "");
                        }

                        var activities =
                            _context.Activitys.Where(x => !x.IsDeleted && x.WorkflowCode.Equals(obj.WorkflowCode));
                        //Get attr 
                        var dataAttrs = GetAttrSetup(activities);
                        var wfInstance = new WorkflowInstance
                        {
                            ObjectType = obj.ObjectType,
                            ObjectInst = obj.ObjectInst,
                            WorkflowCode = obj.WorkflowCode,
                            WfInstName = obj.WfInstName,
                            WfGroup = wf != null ? wf.WfGroup : obj.WfGroup,
                            WfInstCode = "" + (_context.WorkflowInstances.Count() > 0
                                ? _context.WorkflowInstances.Max(x => x.Id) + 1
                                : 1),
                            CreatedBy = user.UserName,
                            CreatedTime = DateTime.Now,
                            IsDeleted = false,
                            StartTime = DateTime.Now,
                            ActInstInitial = obj.ActInstInitial,
                            Status = "STATUS_WF_PENDING",
                            DataAttr = JsonConvert.SerializeObject(dataAttrs),
                        };
                        _context.WorkflowInstances.Add(wfInstance);
                        _context.SaveChanges();

                        if (!wfInstance.WfInstCode.Equals(wfInstance.Id.ToString()))
                        {
                            wfInstance.WfInstCode = wfInstance.Id.ToString();
                            _context.WorkflowInstances.Update(wfInstance);
                            _context.SaveChanges();
                        }

                        wfInstCode = wfInstance.WfInstCode;

                        //Update ActInstInitial
                        if (!string.IsNullOrEmpty(obj.ActInstInitial))
                        {
                            var actInitial = _context.ActivityInstances.FirstOrDefault(x =>
                                !x.IsDeleted && x.ActivityInstCode.Equals(obj.ActInstInitial));
                            if (actInitial != null)
                            {
                                var listWfRela = new List<WfRelative>();
                                if (!string.IsNullOrEmpty(actInitial.WfInstRelative))
                                {
                                    listWfRela =
                                        JsonConvert.DeserializeObject<List<WfRelative>>(actInitial.WfInstRelative);
                                }

                                var wfRela = new WfRelative
                                {
                                    WfInstCode = wfInstance.WfInstCode
                                };

                                listWfRela.Add(wfRela);

                                actInitial.WfInstRelative = JsonConvert.SerializeObject(listWfRela);
                                _context.ActivityInstances.Update(actInitial);
                            }
                        }

                        //Instance Activity
                        var countAct = _context.ActivityInstances.Count();

                        if (activities.Any())
                        {
                            var session = HttpContext.GetSessionUser();
                            var listUserNotify = new List<UserNotify>();

                            if (obj.ObjectType == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.TypeInstCard))
                            {
                                var card = _context.WORKOSCards.FirstOrDefault(x =>
                                    x.CardCode == obj.ObjectInst && !x.IsDeleted);
                                var list = _context.WORKOSLists.FirstOrDefault(x =>
                                    x.ListCode.Equals(card.ListCode) && !x.IsDeleted);
                                var board = _context.WORKOSBoards.FirstOrDefault(x =>
                                    x.BoardCode.Equals(list.BoardCode) && !x.IsDeleted);
                                var lstAssign = _context.JobCardAssignees.Where(x =>
                                    x.CardCode.Equals(obj.ObjectInst) && !string.IsNullOrEmpty(x.UserId) &&
                                    !x.IsDeleted).ToList();
                                if (card != null)
                                {
                                    card.WorkflowCode = obj.WorkflowCode;

                                    //Rollback
                                    var itemStaff = _context.WorkItemAssignStaffs.Where(x =>
                                        !x.IsDeleted && x.CardCode.Equals(card.CardCode));
                                    var attachments = _context.CardAttachments.Where(x =>
                                        !x.Flag && x.CardCode.Equals(obj.ObjectInst));
                                    if (itemStaff.Any())
                                    {
                                        foreach (var item in itemStaff)
                                        {
                                            item.IsDeleted = true;
                                            item.DeletedBy = user.UserName;
                                            item.DeletedTime = DateTime.Now;
                                            _context.WorkItemAssignStaffs.Update(item);
                                        }
                                    }
                                }

                                foreach (var item in activities)
                                {
                                    countAct++;
                                    var actInst = new ActivityInstance
                                    {
                                        WorkflowCode = wfInstance.WfInstCode,
                                        ActivityCode = item.ActivityCode,
                                        ActivityInstCode = item.ActivityCode + "_A_" + countAct,
                                        CreatedBy = user.UserName,
                                        CreatedTime = DateTime.Now,
                                        Desc = item.Desc,
                                        Duration = item.Duration,
                                        Group = item.Group,
                                        Located = item.Located,
                                        ShapeJson = item.ShapeJson,
                                        Status = item.Type == "TYPE_ACTIVITY_INITIAL"
                                            ? "STATUS_ACTIVITY_ACTIVE"
                                            : "STATUS_ACTIVITY_NOT_DOING",
                                        Title = item.Title,
                                        Type = item.Type,
                                        Unit = item.Unit,
                                        IsDeleted = false,
                                        //IsLock = item.Type == "TYPE_ACTIVITY_INITIAL" ? false : true,
                                        StartTime = item.Type == "TYPE_ACTIVITY_INITIAL"
                                            ? DateTime.Now
                                            : (DateTime?)null
                                    };

                                    if (item.Type == "TYPE_ACTIVITY_INITIAL")
                                    {
                                        //Object processing
                                        if (!string.IsNullOrEmpty(obj.ObjectType) &&
                                            !string.IsNullOrEmpty(obj.ObjectInst))
                                        {
                                            var process = new WfActivityObjectProccessing
                                            {
                                                ObjectType = obj.ObjectType,
                                                ObjectInst = obj.ObjectInst,
                                                ObjEntry = true,
                                                WfInstCode = wfInstance.WfInstCode,
                                                ActInstCode = actInst.ActivityInstCode,
                                                CreatedBy = user.UserName,
                                                CreatedTime = DateTime.Now
                                            };
                                            _context.WfActivityObjectProccessings.Add(process);
                                        }
                                    }

                                    _context.ActivityInstances.Add(actInst);

                                    //Add user assign

                                    var assigns = _context.ExcuterControlRoles.Where(x =>
                                        !x.IsDeleted && x.ActivityCode == item.ActivityCode);
                                    var listManager = new List<CreatorManager>(); //AddCreatorManager(userId);
                                    var listManagerUserName = !String.IsNullOrEmpty(user.LeadersOfUser)
                                        ? user.LeadersOfUser.Split(",", StringSplitOptions.None).ToList()
                                        : new List<string>();
                                    foreach (var managerUserName in listManagerUserName)
                                    {
                                        var manager = _context.Users.FirstOrDefault(x => x.UserName == managerUserName);
                                        if (manager != null)
                                        {
                                            var creatorManager = new CreatorManager()
                                            {
                                                BranchId = manager.BranchId,
                                                DepartmentId = manager.DepartmentId,
                                                UserId = manager.Id
                                            };
                                            listManager.Add(creatorManager);
                                        }
                                    }

                                    if (assigns.Any())
                                    {
                                        //var listManager = AddCreatorManager(userId);
                                        foreach (var assign in assigns)
                                        {
                                            if ((assign.UserId.Equals(
                                                     EnumHelper<CreatorAssign>.GetDisplayValue(CreatorAssign.Creator))
                                                 || assign.UserId.Equals(
                                                     EnumHelper<CreatorAssign>.GetDisplayValue(CreatorAssign
                                                         .CreatorManager))))
                                            {
                                                if (assign.UserId.Equals(
                                                        EnumHelper<CreatorAssign>.GetDisplayValue(CreatorAssign
                                                            .CreatorManager)))
                                                {
                                                    foreach (var manager in listManager)
                                                    {
                                                        if (!assigns.Any(x => x.UserId.Equals(manager.UserId)))
                                                        {
                                                            var assignInst = new ExcuterControlRoleInst
                                                            {
                                                                UserId = manager.UserId,
                                                                ActivityCodeInst = actInst.ActivityInstCode,
                                                                Approve = false,
                                                                ApproveTime = (DateTime?)null,
                                                                Branch = manager.BranchId,
                                                                DepartmentCode = "",
                                                                GroupCode = "",
                                                                CreatedTime = DateTime.Now,
                                                                CreatedBy = user.UserName,
                                                                Status = "ASSIGN_STATUS_WORK",
                                                                Role = assign.Role
                                                            };
                                                            _context.ExcuterControlRoleInsts.Add(assignInst);
                                                            var userNotify = new UserNotify
                                                            {
                                                                UserId = assign.UserId
                                                            };

                                                            if (!listUserNotify.Any(p =>
                                                                    p.UserId.Equals(userNotify.UserId)) &&
                                                                !userNotify.UserId.Equals(user.Id))
                                                                listUserNotify.Add(userNotify);
                                                        }
                                                    }
                                                }
                                                else
                                                {
                                                    if (!listManager.Any(x => x.UserId.Equals(userId)) &&
                                                        !assigns.Any(x => x.UserId.Equals(userId)))
                                                    {
                                                        var assignInst = new ExcuterControlRoleInst
                                                        {
                                                            UserId = userId,
                                                            ActivityCodeInst = actInst.ActivityInstCode,
                                                            Approve = false,
                                                            ApproveTime = (DateTime?)null,
                                                            Branch = "",
                                                            DepartmentCode = "",
                                                            GroupCode = "",
                                                            CreatedTime = DateTime.Now,
                                                            CreatedBy = user.UserName,
                                                            Status = "ASSIGN_STATUS_WORK",
                                                            Role = assign.Role
                                                        };
                                                        _context.ExcuterControlRoleInsts.Add(assignInst);
                                                        var userNotify = new UserNotify
                                                        {
                                                            UserId = assign.UserId
                                                        };

                                                        if (!listUserNotify.Any(p =>
                                                                p.UserId.Equals(userNotify.UserId)) &&
                                                            !userNotify.UserId.Equals(user.Id))
                                                            listUserNotify.Add(userNotify);
                                                    }
                                                }
                                            }
                                            else
                                            {
                                                var assignInst = new ExcuterControlRoleInst
                                                {
                                                    UserId = assign.UserId,
                                                    ActivityCodeInst = actInst.ActivityInstCode,
                                                    Approve = assign.Approve,
                                                    ApproveTime = assign.ApproveTime,
                                                    Branch = assign.Branch,
                                                    DepartmentCode = assign.DepartmentCode,
                                                    GroupCode = assign.GroupCode,
                                                    CreatedTime = DateTime.Now,
                                                    CreatedBy = user.UserName,
                                                    Status = assign.Status,
                                                    Role = assign.Role
                                                };
                                                _context.ExcuterControlRoleInsts.Add(assignInst);
                                                //Add user to Notification
                                                var userNotify = new UserNotify
                                                {
                                                    UserId = assign.UserId
                                                };

                                                if (!listUserNotify.Any(p => p.UserId.Equals(userNotify.UserId)) &&
                                                    !userNotify.UserId.Equals(user.Id))
                                                    listUserNotify.Add(userNotify);
                                            }
                                        }
                                    }

                                    //Add attachment
                                    var fileRepos = _context.EDMSRepoCatFiles.Where(x =>
                                        x.ObjectType.Equals(
                                            EnumHelper<ActivityCat>.GetDisplayValue(ActivityCat.ActivityCat))
                                        && x.ObjectCode.Equals(item.ActivityCode));
                                    foreach (var fileRepo in fileRepos)
                                    {
                                        var edmsReposCatFile = new EDMSRepoCatFile
                                        {
                                            FileCode = string.Concat("ActInst_", Guid.NewGuid().ToString()),
                                            ReposCode = fileRepo.ReposCode,
                                            CatCode = fileRepo.CatCode,
                                            ObjectCode = actInst.ActivityInstCode,
                                            ObjectType =
                                                EnumHelper<ActivityInst>.GetDisplayValue(ActivityInst.ActivityInst),
                                            Path = fileRepo.Path,
                                            FolderId = fileRepo.FolderId
                                        };
                                        _context.EDMSRepoCatFiles.Add(edmsReposCatFile);

                                        var edmsReposCard = new EDMSRepoCatFile
                                        {
                                            FileCode = string.Concat("CARDJOB_", Guid.NewGuid().ToString()),
                                            ReposCode = fileRepo.ReposCode,
                                            CatCode = fileRepo.CatCode,
                                            ObjectCode = card.CardCode,
                                            ObjectType = EnumHelper<CardEnum>.GetDisplayValue(CardEnum.CardJob),
                                            Path = fileRepo.Path,
                                            FolderId = fileRepo.FolderId
                                        };
                                        _context.EDMSRepoCatFiles.Add(edmsReposCard);

                                        var edmsFile = _context.EDMSFiles.FirstOrDefault(x =>
                                            !x.IsDeleted && x.FileCode.Equals(fileRepo.FileCode) &&
                                            (x.IsFileMaster == true || x.IsFileMaster == null));
                                        if (edmsFile != null)
                                        {
                                            var fileNew = string.Concat(
                                                Path.GetFileNameWithoutExtension(edmsFile.FileName), "_",
                                                Guid.NewGuid().ToString().Substring(0, 8),
                                                Path.GetExtension(edmsFile.FileName));
                                            //var byteData = DownloadFileFromServer(fileRepo.Id);
                                            //var urlUpload = UploadFileToServer(byteData, fileRepo.ReposCode, fileRepo.CatCode, fileNew, edmsFile.FileTypePhysic);

                                            var edms = new EDMSFile
                                            {
                                                FileCode = edmsReposCatFile.FileCode,
                                                FileName = edmsFile.FileName,
                                                Desc = edmsFile.Desc,
                                                ReposCode = fileRepo.ReposCode,
                                                Tags = edmsFile.Tags,
                                                FileSize = edmsFile.FileSize,
                                                FileTypePhysic = edmsFile.FileTypePhysic,
                                                NumberDocument = edmsFile.NumberDocument,
                                                CreatedBy = user.UserName,
                                                CreatedTime = DateTime.Now,
                                                IsFileOrigin = false,
                                                FileParentId = edmsFile.FileID,
                                                MimeType = edmsFile.MimeType,
                                                CloudFileId = edmsFile.CloudFileId,
                                            };
                                            _context.EDMSFiles.Add(edms);

                                            var edmsCard = new EDMSFile
                                            {
                                                FileCode = edmsReposCard.FileCode,
                                                FileName = edmsFile.FileName,
                                                Desc = edmsFile.Desc,
                                                ReposCode = fileRepo.ReposCode,
                                                Tags = edmsFile.Tags,
                                                FileSize = edmsFile.FileSize,
                                                FileTypePhysic = edmsFile.FileTypePhysic,
                                                NumberDocument = edmsFile.NumberDocument,
                                                CreatedBy = user.UserName,
                                                CreatedTime = DateTime.Now,
                                                IsFileOrigin = false,
                                                FileParentId = edmsFile.FileID,
                                                MimeType = edmsFile.MimeType,
                                                CloudFileId = edmsFile.CloudFileId,
                                            };
                                            _context.EDMSFiles.Add(edmsCard);

                                            var actInstFile = new ActivityInstFile
                                            {
                                                FileID = edmsReposCatFile.FileCode,
                                                ActivityInstCode = actInst.ActivityInstCode,
                                                CreatedBy = user.UserName,
                                                CreatedTime = DateTime.Now,
                                                IsSign = false,
                                                SignatureRequire = false,
                                            };
                                            _context.ActivityInstFiles.Add(actInstFile);

                                            //File share by default

                                            var listUserShare = from a in assigns
                                                                join b in _context.Users on a.UserId equals b.Id
                                                                join c in _context.AdDepartments.Where(x => !x.IsDeleted && x.IsEnabled)
                                                                    on b.DepartmentId equals c.DepartmentCode into c1
                                                                from c in c1.DefaultIfEmpty()
                                                                select new
                                                                {
                                                                    Code = b.UserName,
                                                                    Name = b.GivenName,
                                                                    DepartmentName = c != null ? c.Title : "",
                                                                    Permission = new PermissionFile()
                                                                };

                                            var rela = new
                                            {
                                                ObjectType =
                                                    EnumHelper<ActivityInst>.GetDisplayValue(ActivityInst.ActivityInst),
                                                ObjectInstance = actInst.ActivityInstCode
                                            };
                                            var files = new FilesShareObjectUser
                                            {
                                                CreatedBy = user.UserName,
                                                CreatedTime = DateTime.Now,
                                                FileID = edms.FileCode,
                                                FileCreated = user.UserName,
                                                FileUrl = edms.Url,
                                                FileName = edmsFile.FileName,
                                                ObjectRelative = JsonConvert.SerializeObject(rela),
                                                ListUserShare = JsonConvert.SerializeObject(listUserShare)
                                            };
                                            _context.FilesShareObjectUsers.Add(files);
                                        }
                                    }
                                }
                            }
                            else
                            {
                                foreach (var item in activities)
                                {
                                    countAct++;
                                    var actInst = new ActivityInstance
                                    {
                                        WorkflowCode = wfInstance.WfInstCode,
                                        ActivityCode = item.ActivityCode,
                                        ActivityInstCode = item.ActivityCode + "_A_" + countAct,
                                        CreatedBy = user.UserName,
                                        CreatedTime = DateTime.Now,
                                        Desc = item.Desc,
                                        Duration = item.Duration,
                                        Group = item.Group,
                                        Located = item.Located,
                                        ShapeJson = item.ShapeJson,
                                        Status = item.Type == "TYPE_ACTIVITY_INITIAL"
                                            ? "STATUS_ACTIVITY_ACTIVE"
                                            : "STATUS_ACTIVITY_NOT_DOING",
                                        Title = item.Title,
                                        Type = item.Type,
                                        Unit = item.Unit,
                                        IsDeleted = false,
                                        //IsLock = item.Type == "TYPE_ACTIVITY_INITIAL" ? false : true,
                                        StartTime = item.Type == "TYPE_ACTIVITY_INITIAL"
                                            ? DateTime.Now
                                            : (DateTime?)null
                                    };
                                    _context.ActivityInstances.Add(actInst);

                                    if (item.Type == "TYPE_ACTIVITY_INITIAL")
                                    {
                                        //Object processing
                                        if (!string.IsNullOrEmpty(obj.ObjectType) &&
                                            !string.IsNullOrEmpty(obj.ObjectInst))
                                        {
                                            var process = new WfActivityObjectProccessing
                                            {
                                                ObjectType = obj.ObjectType,
                                                ObjectInst = obj.ObjectInst,
                                                ObjEntry = true,
                                                WfInstCode = wfInstance.WfInstCode,
                                                ActInstCode = actInst.ActivityInstCode,
                                                CreatedBy = user.UserName,
                                                CreatedTime = DateTime.Now
                                            };
                                            _context.WfActivityObjectProccessings.Add(process);
                                        }

                                        wfInstance.MarkActCurrent = actInst.ActivityInstCode;
                                    }

                                    var assigns = _context.ExcuterControlRoles.Where(x =>
                                        !x.IsDeleted && x.ActivityCode == item.ActivityCode);
                                    var listManager = new List<CreatorManager>(); //AddCreatorManager(userId);
                                    var listManagerUserName = !String.IsNullOrEmpty(user.LeadersOfUser)
                                        ? user.LeadersOfUser.Split(",", StringSplitOptions.None).ToList()
                                        : new List<string>();
                                    foreach (var managerUserName in listManagerUserName)
                                    {
                                        var manager = _context.Users.FirstOrDefault(x => x.UserName == managerUserName);
                                        if (manager != null)
                                        {
                                            var creatorManager = new CreatorManager()
                                            {
                                                BranchId = manager.BranchId,
                                                DepartmentId = manager.DepartmentId,
                                                UserId = manager.Id
                                            };
                                            listManager.Add(creatorManager);
                                        }
                                    }

                                    if (assigns.Any())
                                    {
                                        //var listManager = AddCreatorManager(userId);
                                        foreach (var assign in assigns)
                                        {
                                            if ((assign.UserId.Equals(
                                                     EnumHelper<CreatorAssign>.GetDisplayValue(CreatorAssign.Creator))
                                                 || assign.UserId.Equals(
                                                     EnumHelper<CreatorAssign>.GetDisplayValue(CreatorAssign
                                                         .CreatorManager))))
                                            {
                                                if (assign.UserId.Equals(
                                                        EnumHelper<CreatorAssign>.GetDisplayValue(CreatorAssign
                                                            .CreatorManager)))
                                                {
                                                    foreach (var manager in listManager)
                                                    {
                                                        if (!assigns.Any(x => x.UserId.Equals(manager.UserId)))
                                                        {
                                                            var assignInst = new ExcuterControlRoleInst
                                                            {
                                                                UserId = manager.UserId,
                                                                ActivityCodeInst = actInst.ActivityInstCode,
                                                                Approve = false,
                                                                ApproveTime = (DateTime?)null,
                                                                Branch = manager.BranchId,
                                                                DepartmentCode = "",
                                                                GroupCode = "",
                                                                CreatedTime = DateTime.Now,
                                                                CreatedBy = user.UserName,
                                                                Status = "ASSIGN_STATUS_WORK",
                                                                Role = assign.Role
                                                            };
                                                            _context.ExcuterControlRoleInsts.Add(assignInst);
                                                            var userNotify = new UserNotify
                                                            {
                                                                UserId = assign.UserId
                                                            };

                                                            if (!listUserNotify.Any(p =>
                                                                    p.UserId.Equals(userNotify.UserId)) &&
                                                                !userNotify.UserId.Equals(user.Id))
                                                                listUserNotify.Add(userNotify);
                                                        }
                                                    }
                                                }
                                                else
                                                {
                                                    if (!listManager.Any(x => x.UserId.Equals(userId)) &&
                                                        !assigns.Any(x => x.UserId.Equals(userId)))
                                                    {
                                                        var assignInst = new ExcuterControlRoleInst
                                                        {
                                                            UserId = userId,
                                                            ActivityCodeInst = actInst.ActivityInstCode,
                                                            Approve = false,
                                                            ApproveTime = (DateTime?)null,
                                                            Branch = "",
                                                            DepartmentCode = "",
                                                            GroupCode = "",
                                                            CreatedTime = DateTime.Now,
                                                            CreatedBy = user.UserName,
                                                            Status = "ASSIGN_STATUS_WORK",
                                                            Role = assign.Role
                                                        };
                                                        _context.ExcuterControlRoleInsts.Add(assignInst);
                                                        var userNotify = new UserNotify
                                                        {
                                                            UserId = assign.UserId
                                                        };

                                                        if (!listUserNotify.Any(p =>
                                                                p.UserId.Equals(userNotify.UserId)) &&
                                                            !userNotify.UserId.Equals(user.Id))
                                                            listUserNotify.Add(userNotify);
                                                    }
                                                }
                                            }
                                            else
                                            {
                                                var assignInst = new ExcuterControlRoleInst
                                                {
                                                    UserId = assign.UserId,
                                                    ActivityCodeInst = actInst.ActivityInstCode,
                                                    Approve = assign.Approve,
                                                    ApproveTime = assign.ApproveTime,
                                                    Branch = assign.Branch,
                                                    DepartmentCode = assign.DepartmentCode,
                                                    GroupCode = assign.GroupCode,
                                                    CreatedTime = DateTime.Now,
                                                    CreatedBy = user.UserName,
                                                    Status = assign.Status,
                                                    Role = assign.Role
                                                };
                                                _context.ExcuterControlRoleInsts.Add(assignInst);
                                                //Add user to Notification
                                                var userNotify = new UserNotify
                                                {
                                                    UserId = assign.UserId
                                                };

                                                if (!listUserNotify.Any(p => p.UserId.Equals(userNotify.UserId)) &&
                                                    !userNotify.UserId.Equals(user.Id))
                                                    listUserNotify.Add(userNotify);
                                            }
                                        }
                                    }

                                    //Add attachment
                                    var fileRepos = _context.EDMSRepoCatFiles.Where(x =>
                                        x.ObjectType.Equals(
                                            EnumHelper<ActivityCat>.GetDisplayValue(ActivityCat.ActivityCat))
                                        && x.ObjectCode.Equals(item.ActivityCode));
                                    foreach (var fileRepo in fileRepos)
                                    {
                                        var edmsReposCatFile = new EDMSRepoCatFile
                                        {
                                            FileCode = string.Concat("ActInst_", Guid.NewGuid().ToString()),
                                            ReposCode = fileRepo.ReposCode,
                                            CatCode = fileRepo.CatCode,
                                            ObjectCode = actInst.ActivityInstCode,
                                            ObjectType =
                                                EnumHelper<ActivityInst>.GetDisplayValue(ActivityInst.ActivityInst),
                                            Path = fileRepo.Path,
                                            FolderId = fileRepo.FolderId
                                        };
                                        _context.EDMSRepoCatFiles.Add(edmsReposCatFile);

                                        var edmsFile = _context.EDMSFiles.FirstOrDefault(x =>
                                            !x.IsDeleted && x.FileCode.Equals(fileRepo.FileCode) &&
                                            (x.IsFileMaster == true || x.IsFileMaster == null));
                                        if (edmsFile != null)
                                        {
                                            var fileNew = string.Concat(
                                                Path.GetFileNameWithoutExtension(edmsFile.FileName), "_",
                                                Guid.NewGuid().ToString().Substring(0, 8),
                                                Path.GetExtension(edmsFile.FileName));
                                            //var byteData = DownloadFileFromServer(fileRepo.Id);
                                            //var urlUpload = UploadFileToServer(byteData, fileRepo.ReposCode, fileRepo.CatCode, fileNew, edmsFile.FileTypePhysic);

                                            var edms = new EDMSFile
                                            {
                                                FileCode = edmsReposCatFile.FileCode,
                                                FileName = edmsFile.FileName,
                                                Desc = edmsFile.Desc,
                                                ReposCode = fileRepo.ReposCode,
                                                Tags = edmsFile.Tags,
                                                FileSize = edmsFile.FileSize,
                                                FileTypePhysic = edmsFile.FileTypePhysic,
                                                NumberDocument = edmsFile.NumberDocument,
                                                CreatedBy = user.UserName,
                                                CreatedTime = DateTime.Now,
                                                IsFileOrigin = false,
                                                FileParentId = edmsFile.FileID,
                                                MimeType = edmsFile.MimeType,
                                                CloudFileId = edmsFile.CloudFileId,
                                            };
                                            _context.EDMSFiles.Add(edms);

                                            var actInstFile = new ActivityInstFile
                                            {
                                                FileID = edmsReposCatFile.FileCode,
                                                ActivityInstCode = actInst.ActivityInstCode,
                                                CreatedBy = user.UserName,
                                                CreatedTime = DateTime.Now,
                                                IsSign = false,
                                                SignatureRequire = false,
                                            };
                                            _context.ActivityInstFiles.Add(actInstFile);

                                            //File share by default
                                            var permission = new PermissionFile();
                                            var listUserShare = from a in assigns
                                                                join b in _context.Users on a.UserId equals b.Id
                                                                join c in _context.AdDepartments.Where(x => !x.IsDeleted && x.IsEnabled)
                                                                    on b.DepartmentId equals c.DepartmentCode into c1
                                                                from c in c1.DefaultIfEmpty()
                                                                select new
                                                                {
                                                                    Code = b.UserName,
                                                                    Name = b.GivenName,
                                                                    DepartmentName = c != null ? c.Title : "",
                                                                    Permission = permission
                                                                };

                                            var rela = new
                                            {
                                                ObjectType =
                                                    EnumHelper<ActivityInst>.GetDisplayValue(ActivityInst.ActivityInst),
                                                ObjectInstance = actInst.ActivityInstCode
                                            };
                                            var files = new FilesShareObjectUser
                                            {
                                                CreatedBy = user.UserName,
                                                CreatedTime = DateTime.Now,
                                                FileID = edms.FileCode,
                                                FileCreated = user.UserName,
                                                FileUrl = edms.Url,
                                                FileName = edmsFile.FileName,
                                                ObjectRelative = JsonConvert.SerializeObject(rela),
                                                ListUserShare = JsonConvert.SerializeObject(listUserShare)
                                            };
                                            _context.FilesShareObjectUsers.Add(files);
                                        }
                                    }
                                }
                            }

                            if (listUserNotify.Count > 0)
                            {
                                var notification = new NotificationManager
                                {
                                    ListUser = listUserNotify,
                                    Title = string.Format("{0} đã tạo 1 luồng việc mới: {1}", user.GivenName,
                                        wfInstance.WfInstName),
                                    ObjCode = wfInstance.WfInstCode,
                                    ObjType = EnumHelper<NotificationType>.GetDisplayValue(NotificationType.WorkFlow),
                                    CreatedBy = user.CreatedBy,
                                };

                                InsertNotification(notification);
                            }

                            var userList = listUserNotify.Select(x => x.UserId);
                            wfInstance.UserList = JsonConvert.SerializeObject(userList);
                            _context.WorkflowInstances.Update(wfInstance);
                        }

                        msg.Object = wfInstance;
                        _context.SaveChanges();
                        msg.Title = "Thêm luồng thành công";
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = "Đối tượng đã được tạo luồng";
                    }
                }
            }
            catch (Exception ex)
            {
                //Rollback wfInstace
                if (!string.IsNullOrEmpty(wfInstCode))
                    DeleteWfInstance(wfInstCode, obj.CreatedBy);

                msg.Error = true;
                msg.Title = "Có lỗi xảy ra";
            }

            return Json(msg);
        }

        [HttpPost]
        public async Task<JsonResult> CreateWfInstanceStaff([FromBody] ModelWfPlusCommand obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var wfInstCode = string.Empty;
            try
            {
                var user = _context.Users.FirstOrDefault(x => x.UserName == obj.CreatedBy);
                using (await objLock.LockAsync(string.Concat(obj.ObjectInst, obj.ObjectType)))
                {
                    if (!string.IsNullOrEmpty(obj.ActInstInitial))
                    {
                        var isActInitWf = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value &&
                            x.WorkflowCode.Equals(obj.WorkflowCode) && x.ActInstInitial.Equals(obj.ActInstInitial));
                        if (isActInitWf != null)
                        {
                            msg.Error = true;
                            msg.Title = "Hoạt động đã khởi tạo luồng này";
                            return Json(msg);
                        }
                    }

                    var userId = !string.IsNullOrEmpty(obj.UserId) ? obj.UserId : user.Id;
                    var check = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value &&
                                                                               !string.IsNullOrEmpty(x.ObjectInst) &&
                                                                               !string.IsNullOrEmpty(x.ObjectType) &&
                                                                               x.ObjectInst == obj.ObjectInst &&
                                                                               x.ObjectType == obj.ObjectType);

                    var processing = _context.WfActivityObjectProccessings.Where(x => !x.IsDeleted &&
                        x.ObjectType.Equals(obj.ObjectType)
                        && x.ObjectInst.Equals(obj.ObjectInst));

                    if (check == null && !processing.Any())
                    {
                        var wf = _context.WorkFlows.FirstOrDefault(x =>
                            !x.IsDeleted.Value && x.WfCode.Equals(obj.WorkflowCode));

                        if (string.IsNullOrEmpty(obj.WfInstName))
                        {
                            obj.WfInstName = obj.ObjectName + " - " + (wf != null ? wf.WfName : "");
                        }

                        var activities =
                            _context.Activitys.Where(x => !x.IsDeleted && x.WorkflowCode.Equals(obj.WorkflowCode));
                        //Get attr 
                        var dataAttrs = GetAttrSetup(activities);
                        var wfInstance = new WorkflowInstance
                        {
                            ObjectType = obj.ObjectType,
                            ObjectInst = obj.ObjectInst,
                            WorkflowCode = obj.WorkflowCode,
                            WfInstName = (user != null ? user.GivenName : "") + " - " + obj.wfInstName,
                            WfGroup = wf != null ? wf.WfGroup : obj.WfGroup,
                            WfInstCode = "" + (_context.WorkflowInstances.Count() > 0
                                ? _context.WorkflowInstances.Max(x => x.Id) + 1
                                : 1),
                            CreatedBy = user.UserName,
                            CreatedTime = DateTime.Now,
                            IsDeleted = false,
                            StartTime = DateTime.Now,
                            ActInstInitial = obj.ActInstInitial,
                            Status = "STATUS_WF_PENDING",
                            DataAttr = JsonConvert.SerializeObject(dataAttrs),
                        };
                        _context.WorkflowInstances.Add(wfInstance);
                        _context.SaveChanges();

                        if (!wfInstance.WfInstCode.Equals(wfInstance.Id.ToString()))
                        {
                            wfInstance.WfInstCode = wfInstance.Id.ToString();
                            _context.WorkflowInstances.Update(wfInstance);
                            _context.SaveChanges();
                        }

                        wfInstCode = wfInstance.WfInstCode;

                        //Update ActInstInitial
                        if (!string.IsNullOrEmpty(obj.ActInstInitial))
                        {
                            var actInitial = _context.ActivityInstances.FirstOrDefault(x =>
                                !x.IsDeleted && x.ActivityInstCode.Equals(obj.ActInstInitial));
                            if (actInitial != null)
                            {
                                var listWfRela = new List<WfRelative>();
                                if (!string.IsNullOrEmpty(actInitial.WfInstRelative))
                                {
                                    listWfRela =
                                        JsonConvert.DeserializeObject<List<WfRelative>>(actInitial.WfInstRelative);
                                }

                                var wfRela = new WfRelative
                                {
                                    WfInstCode = wfInstance.WfInstCode
                                };

                                listWfRela.Add(wfRela);

                                actInitial.WfInstRelative = JsonConvert.SerializeObject(listWfRela);
                                _context.ActivityInstances.Update(actInitial);
                            }
                        }

                        //Instance Activity
                        var countAct = _context.ActivityInstances.Count();

                        if (activities.Any())
                        {
                            //var session = HttpContext.GetSessionUser();
                            var listUserNotify = new List<UserNotify>();

                            if (obj.ObjectType == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.TypeInstCard))
                            {
                                var card = _context.WORKOSCards.FirstOrDefault(x =>
                                    x.CardCode == obj.ObjectInst && !x.IsDeleted);
                                var list = _context.WORKOSLists.FirstOrDefault(x =>
                                    x.ListCode.Equals(card.ListCode) && !x.IsDeleted);
                                var board = _context.WORKOSBoards.FirstOrDefault(x =>
                                    x.BoardCode.Equals(list.BoardCode) && !x.IsDeleted);
                                var lstAssign = _context.JobCardAssignees.Where(x =>
                                    x.CardCode.Equals(obj.ObjectInst) && !string.IsNullOrEmpty(x.UserId) &&
                                    !x.IsDeleted).ToList();
                                if (card != null)
                                {
                                    card.WorkflowCode = obj.WorkflowCode;

                                    //Rollback
                                    var itemStaff = _context.WorkItemAssignStaffs.Where(x =>
                                        !x.IsDeleted && x.CardCode.Equals(card.CardCode));
                                    var attachments = _context.CardAttachments.Where(x =>
                                        !x.Flag && x.CardCode.Equals(obj.ObjectInst));
                                    if (itemStaff.Any())
                                    {
                                        foreach (var item in itemStaff)
                                        {
                                            item.IsDeleted = true;
                                            item.DeletedBy = user.UserName;
                                            item.DeletedTime = DateTime.Now;
                                            _context.WorkItemAssignStaffs.Update(item);
                                        }
                                    }
                                }

                                foreach (var item in activities)
                                {
                                    countAct++;
                                    var actInst = new ActivityInstance
                                    {
                                        WorkflowCode = wfInstance.WfInstCode,
                                        ActivityCode = item.ActivityCode,
                                        ActivityInstCode = item.ActivityCode + "_A_" + countAct,
                                        CreatedBy = user.UserName,
                                        CreatedTime = DateTime.Now,
                                        Desc = item.Desc,
                                        Duration = item.Duration,
                                        Group = item.Group,
                                        Located = item.Located,
                                        ShapeJson = item.ShapeJson,
                                        Status = item.Type == "TYPE_ACTIVITY_INITIAL"
                                            ? "STATUS_ACTIVITY_ACTIVE"
                                            : "STATUS_ACTIVITY_NOT_DOING",
                                        Title = item.Title,
                                        Type = item.Type,
                                        Unit = item.Unit,
                                        IsDeleted = false,
                                        //IsLock = item.Type == "TYPE_ACTIVITY_INITIAL" ? false : true,
                                        StartTime = item.Type == "TYPE_ACTIVITY_INITIAL"
                                            ? DateTime.Now
                                            : (DateTime?)null
                                    };

                                    if (item.Type == "TYPE_ACTIVITY_INITIAL")
                                    {
                                        //Object processing
                                        if (!string.IsNullOrEmpty(obj.ObjectType) &&
                                            !string.IsNullOrEmpty(obj.ObjectInst))
                                        {
                                            var process = new WfActivityObjectProccessing
                                            {
                                                ObjectType = obj.ObjectType,
                                                ObjectInst = obj.ObjectInst,
                                                ObjEntry = true,
                                                WfInstCode = wfInstance.WfInstCode,
                                                ActInstCode = actInst.ActivityInstCode,
                                                CreatedBy = user.UserName,
                                                CreatedTime = DateTime.Now
                                            };
                                            _context.WfActivityObjectProccessings.Add(process);
                                        }
                                    }

                                    _context.ActivityInstances.Add(actInst);

                                    //Add user assign

                                    var assigns = _context.ExcuterControlRoles.Where(x =>
                                        !x.IsDeleted && x.ActivityCode == item.ActivityCode);
                                    var listManager = new List<CreatorManager>(); //AddCreatorManager(userId);
                                    var listManagerUserName = !String.IsNullOrEmpty(user.LeadersOfUser)
                                        ? user.LeadersOfUser.Split(",", StringSplitOptions.None).ToList()
                                        : new List<string>();
                                    foreach (var managerUserName in listManagerUserName)
                                    {
                                        var manager = _context.Users.FirstOrDefault(x => x.UserName == managerUserName);
                                        if (manager != null)
                                        {
                                            var creatorManager = new CreatorManager()
                                            {
                                                BranchId = manager.BranchId,
                                                DepartmentId = manager.DepartmentId,
                                                UserId = manager.Id
                                            };
                                            listManager.Add(creatorManager);
                                        }
                                    }

                                    if (assigns.Any())
                                    {
                                        //var listManager = AddCreatorManager(userId);
                                        foreach (var assign in assigns)
                                        {
                                            if ((assign.UserId.Equals(
                                                     EnumHelper<CreatorAssign>.GetDisplayValue(CreatorAssign.Creator))
                                                 || assign.UserId.Equals(
                                                     EnumHelper<CreatorAssign>.GetDisplayValue(CreatorAssign
                                                         .CreatorManager))))
                                            {
                                                if (assign.UserId.Equals(
                                                        EnumHelper<CreatorAssign>.GetDisplayValue(CreatorAssign
                                                            .CreatorManager)))
                                                {
                                                    foreach (var manager in listManager)
                                                    {
                                                        if (!assigns.Any(x => x.UserId.Equals(manager.UserId)))
                                                        {
                                                            var assignInst = new ExcuterControlRoleInst
                                                            {
                                                                UserId = manager.UserId,
                                                                ActivityCodeInst = actInst.ActivityInstCode,
                                                                Approve = false,
                                                                ApproveTime = (DateTime?)null,
                                                                Branch = manager.BranchId,
                                                                DepartmentCode = "",
                                                                GroupCode = "",
                                                                CreatedTime = DateTime.Now,
                                                                CreatedBy = user.UserName,
                                                                Status = "ASSIGN_STATUS_WORK",
                                                                Role = assign.Role
                                                            };
                                                            _context.ExcuterControlRoleInsts.Add(assignInst);
                                                            var userNotify = new UserNotify
                                                            {
                                                                UserId = assignInst.UserId
                                                            };

                                                            if (!listUserNotify.Any(p =>
                                                                    p.UserId.Equals(userNotify.UserId)) &&
                                                                !userNotify.UserId.Equals(user.Id))
                                                                listUserNotify.Add(userNotify);
                                                        }
                                                    }
                                                }
                                                else
                                                {
                                                    if (!listManager.Any(x => x.UserId.Equals(userId)) &&
                                                        !assigns.Any(x => x.UserId.Equals(userId)))
                                                    {
                                                        var assignInst = new ExcuterControlRoleInst
                                                        {
                                                            UserId = userId,
                                                            ActivityCodeInst = actInst.ActivityInstCode,
                                                            Approve = false,
                                                            ApproveTime = (DateTime?)null,
                                                            Branch = "",
                                                            DepartmentCode = "",
                                                            GroupCode = "",
                                                            CreatedTime = DateTime.Now,
                                                            CreatedBy = user.UserName,
                                                            Status = "ASSIGN_STATUS_WORK",
                                                            Role = assign.Role
                                                        };
                                                        _context.ExcuterControlRoleInsts.Add(assignInst);
                                                        var userNotify = new UserNotify
                                                        {
                                                            UserId = assignInst.UserId
                                                        };

                                                        if (!listUserNotify.Any(p =>
                                                                p.UserId.Equals(userNotify.UserId)) &&
                                                            !userNotify.UserId.Equals(user.Id))
                                                            listUserNotify.Add(userNotify);
                                                    }
                                                }
                                            }
                                            else
                                            {
                                                var assignInst = new ExcuterControlRoleInst
                                                {
                                                    UserId = assign.UserId,
                                                    ActivityCodeInst = actInst.ActivityInstCode,
                                                    Approve = assign.Approve,
                                                    ApproveTime = assign.ApproveTime,
                                                    Branch = assign.Branch,
                                                    DepartmentCode = assign.DepartmentCode,
                                                    GroupCode = assign.GroupCode,
                                                    CreatedTime = DateTime.Now,
                                                    CreatedBy = user.UserName,
                                                    Status = assign.Status,
                                                    Role = assign.Role
                                                };
                                                _context.ExcuterControlRoleInsts.Add(assignInst);
                                                //Add user to Notification
                                                var userNotify = new UserNotify
                                                {
                                                    UserId = assign.UserId
                                                };

                                                if (!listUserNotify.Any(p => p.UserId.Equals(userNotify.UserId)) &&
                                                    !userNotify.UserId.Equals(user.Id))
                                                    listUserNotify.Add(userNotify);
                                            }
                                        }
                                    }

                                    //Add attachment
                                    var fileRepos = _context.EDMSRepoCatFiles.Where(x =>
                                        x.ObjectType.Equals(
                                            EnumHelper<ActivityCat>.GetDisplayValue(ActivityCat.ActivityCat))
                                        && x.ObjectCode.Equals(item.ActivityCode));
                                    foreach (var fileRepo in fileRepos)
                                    {
                                        var edmsReposCatFile = new EDMSRepoCatFile
                                        {
                                            FileCode = string.Concat("ActInst_", Guid.NewGuid().ToString()),
                                            ReposCode = fileRepo.ReposCode,
                                            CatCode = fileRepo.CatCode,
                                            ObjectCode = actInst.ActivityInstCode,
                                            ObjectType =
                                                EnumHelper<ActivityInst>.GetDisplayValue(ActivityInst.ActivityInst),
                                            Path = fileRepo.Path,
                                            FolderId = fileRepo.FolderId
                                        };
                                        _context.EDMSRepoCatFiles.Add(edmsReposCatFile);

                                        var edmsReposCard = new EDMSRepoCatFile
                                        {
                                            FileCode = string.Concat("CARDJOB_", Guid.NewGuid().ToString()),
                                            ReposCode = fileRepo.ReposCode,
                                            CatCode = fileRepo.CatCode,
                                            ObjectCode = card.CardCode,
                                            ObjectType = EnumHelper<CardEnum>.GetDisplayValue(CardEnum.CardJob),
                                            Path = fileRepo.Path,
                                            FolderId = fileRepo.FolderId
                                        };
                                        _context.EDMSRepoCatFiles.Add(edmsReposCard);

                                        var edmsFile = _context.EDMSFiles.FirstOrDefault(x =>
                                            !x.IsDeleted && x.FileCode.Equals(fileRepo.FileCode) &&
                                            (x.IsFileMaster == true || x.IsFileMaster == null));
                                        if (edmsFile != null)
                                        {
                                            var fileNew = string.Concat(
                                                Path.GetFileNameWithoutExtension(edmsFile.FileName), "_",
                                                Guid.NewGuid().ToString().Substring(0, 8),
                                                Path.GetExtension(edmsFile.FileName));
                                            //var byteData = DownloadFileFromServer(fileRepo.Id);
                                            //var urlUpload = UploadFileToServer(byteData, fileRepo.ReposCode, fileRepo.CatCode, fileNew, edmsFile.FileTypePhysic);

                                            var edms = new EDMSFile
                                            {
                                                FileCode = edmsReposCatFile.FileCode,
                                                FileName = edmsFile.FileName,
                                                Desc = edmsFile.Desc,
                                                ReposCode = fileRepo.ReposCode,
                                                Tags = edmsFile.Tags,
                                                FileSize = edmsFile.FileSize,
                                                FileTypePhysic = edmsFile.FileTypePhysic,
                                                NumberDocument = edmsFile.NumberDocument,
                                                CreatedBy = user.UserName,
                                                CreatedTime = DateTime.Now,
                                                IsFileOrigin = false,
                                                FileParentId = edmsFile.FileID,
                                                MimeType = edmsFile.MimeType,
                                                CloudFileId = edmsFile.CloudFileId,
                                            };
                                            _context.EDMSFiles.Add(edms);

                                            var edmsCard = new EDMSFile
                                            {
                                                FileCode = edmsReposCard.FileCode,
                                                FileName = edmsFile.FileName,
                                                Desc = edmsFile.Desc,
                                                ReposCode = fileRepo.ReposCode,
                                                Tags = edmsFile.Tags,
                                                FileSize = edmsFile.FileSize,
                                                FileTypePhysic = edmsFile.FileTypePhysic,
                                                NumberDocument = edmsFile.NumberDocument,
                                                CreatedBy = user.UserName,
                                                CreatedTime = DateTime.Now,
                                                IsFileOrigin = false,
                                                FileParentId = edmsFile.FileID,
                                                MimeType = edmsFile.MimeType,
                                                CloudFileId = edmsFile.CloudFileId,
                                            };
                                            _context.EDMSFiles.Add(edmsCard);

                                            var actInstFile = new ActivityInstFile
                                            {
                                                FileID = edmsReposCatFile.FileCode,
                                                ActivityInstCode = actInst.ActivityInstCode,
                                                CreatedBy = user.UserName,
                                                CreatedTime = DateTime.Now,
                                                IsSign = false,
                                                SignatureRequire = false,
                                            };
                                            _context.ActivityInstFiles.Add(actInstFile);

                                            //File share by default

                                            var listUserShare = from a in assigns
                                                                join b in _context.Users on a.UserId equals b.Id
                                                                join c in _context.AdDepartments.Where(x => !x.IsDeleted && x.IsEnabled)
                                                                    on b.DepartmentId equals c.DepartmentCode into c1
                                                                from c in c1.DefaultIfEmpty()
                                                                select new
                                                                {
                                                                    Code = b.UserName,
                                                                    Name = b.GivenName,
                                                                    DepartmentName = c != null ? c.Title : "",
                                                                    Permission = new PermissionFile()
                                                                };

                                            var rela = new
                                            {
                                                ObjectType =
                                                    EnumHelper<ActivityInst>.GetDisplayValue(ActivityInst.ActivityInst),
                                                ObjectInstance = actInst.ActivityInstCode
                                            };
                                            var files = new FilesShareObjectUser
                                            {
                                                CreatedBy = user.UserName,
                                                CreatedTime = DateTime.Now,
                                                FileID = edms.FileCode,
                                                FileCreated = user.UserName,
                                                FileUrl = edms.Url,
                                                FileName = edmsFile.FileName,
                                                ObjectRelative = JsonConvert.SerializeObject(rela),
                                                ListUserShare = JsonConvert.SerializeObject(listUserShare)
                                            };
                                            _context.FilesShareObjectUsers.Add(files);
                                        }
                                    }
                                }
                            }
                            else
                            {
                                foreach (var item in activities)
                                {
                                    countAct++;
                                    var actInst = new ActivityInstance
                                    {
                                        WorkflowCode = wfInstance.WfInstCode,
                                        ActivityCode = item.ActivityCode,
                                        ActivityInstCode = item.ActivityCode + "_A_" + countAct,
                                        CreatedBy = user.UserName,
                                        CreatedTime = DateTime.Now,
                                        Desc = item.Desc,
                                        Duration = item.Duration,
                                        Group = item.Group,
                                        Located = item.Located,
                                        ShapeJson = item.ShapeJson,
                                        Status = item.Type == "TYPE_ACTIVITY_INITIAL"
                                            ? "STATUS_ACTIVITY_ACTIVE"
                                            : "STATUS_ACTIVITY_NOT_DOING",
                                        Title = item.Title,
                                        Type = item.Type,
                                        Unit = item.Unit,
                                        IsDeleted = false,
                                        //IsLock = item.Type == "TYPE_ACTIVITY_INITIAL" ? false : true,
                                        StartTime = item.Type == "TYPE_ACTIVITY_INITIAL"
                                            ? DateTime.Now
                                            : (DateTime?)null
                                    };
                                    _context.ActivityInstances.Add(actInst);

                                    if (item.Type == "TYPE_ACTIVITY_INITIAL")
                                    {
                                        //Object processing
                                        if (!string.IsNullOrEmpty(obj.ObjectType) &&
                                            !string.IsNullOrEmpty(obj.ObjectInst))
                                        {
                                            var process = new WfActivityObjectProccessing
                                            {
                                                ObjectType = obj.ObjectType,
                                                ObjectInst = obj.ObjectInst,
                                                ObjEntry = true,
                                                WfInstCode = wfInstance.WfInstCode,
                                                ActInstCode = actInst.ActivityInstCode,
                                                CreatedBy = user.UserName,
                                                CreatedTime = DateTime.Now
                                            };
                                            _context.WfActivityObjectProccessings.Add(process);
                                        }

                                        wfInstance.MarkActCurrent = actInst.ActivityInstCode;
                                    }

                                    var assigns = _context.ExcuterControlRoles.Where(x =>
                                        !x.IsDeleted && x.ActivityCode == item.ActivityCode);
                                    var listManager = new List<CreatorManager>(); //AddCreatorManager(userId);
                                    var listManagerUserName = !String.IsNullOrEmpty(user.LeadersOfUser)
                                        ? user.LeadersOfUser.Split(",", StringSplitOptions.None).ToList()
                                        : new List<string>();
                                    foreach (var managerUserName in listManagerUserName)
                                    {
                                        var manager = _context.Users.FirstOrDefault(x => x.UserName == managerUserName);
                                        if (manager != null)
                                        {
                                            var creatorManager = new CreatorManager()
                                            {
                                                BranchId = manager.BranchId,
                                                DepartmentId = manager.DepartmentId,
                                                UserId = manager.Id
                                            };
                                            listManager.Add(creatorManager);
                                        }
                                    }

                                    if (assigns.Any())
                                    {
                                        //var listManager = AddCreatorManager(userId);
                                        foreach (var assign in assigns)
                                        {
                                            if ((assign.UserId.Equals(
                                                     EnumHelper<CreatorAssign>.GetDisplayValue(CreatorAssign.Creator))
                                                 || assign.UserId.Equals(
                                                     EnumHelper<CreatorAssign>.GetDisplayValue(CreatorAssign
                                                         .CreatorManager))))
                                            {
                                                if (assign.UserId.Equals(
                                                        EnumHelper<CreatorAssign>.GetDisplayValue(CreatorAssign
                                                            .CreatorManager)))
                                                {
                                                    foreach (var manager in listManager)
                                                    {
                                                        if (!assigns.Any(x => x.UserId.Equals(manager.UserId)))
                                                        {
                                                            var assignInst = new ExcuterControlRoleInst
                                                            {
                                                                UserId = manager.UserId,
                                                                ActivityCodeInst = actInst.ActivityInstCode,
                                                                Approve = false,
                                                                ApproveTime = (DateTime?)null,
                                                                Branch = manager.BranchId,
                                                                DepartmentCode = "",
                                                                GroupCode = "",
                                                                CreatedTime = DateTime.Now,
                                                                CreatedBy = user.UserName,
                                                                Status = "ASSIGN_STATUS_WORK",
                                                                Role = assign.Role
                                                            };
                                                            _context.ExcuterControlRoleInsts.Add(assignInst);
                                                            var userNotify = new UserNotify
                                                            {
                                                                UserId = assignInst.UserId
                                                            };

                                                            if (!listUserNotify.Any(p =>
                                                                    p.UserId.Equals(userNotify.UserId)) &&
                                                                !userNotify.UserId.Equals(user.Id))
                                                                listUserNotify.Add(userNotify);
                                                        }
                                                    }
                                                }
                                                else
                                                {
                                                    if (!listManager.Any(x => x.UserId.Equals(userId)) &&
                                                        !assigns.Any(x => x.UserId.Equals(userId)))
                                                    {
                                                        var assignInst = new ExcuterControlRoleInst
                                                        {
                                                            UserId = userId,
                                                            ActivityCodeInst = actInst.ActivityInstCode,
                                                            Approve = false,
                                                            ApproveTime = (DateTime?)null,
                                                            Branch = "",
                                                            DepartmentCode = "",
                                                            GroupCode = "",
                                                            CreatedTime = DateTime.Now,
                                                            CreatedBy = user.UserName,
                                                            Status = "ASSIGN_STATUS_WORK",
                                                            Role = assign.Role
                                                        };
                                                        _context.ExcuterControlRoleInsts.Add(assignInst);
                                                        var userNotify = new UserNotify
                                                        {
                                                            UserId = assignInst.UserId
                                                        };

                                                        if (!listUserNotify.Any(p =>
                                                                p.UserId.Equals(userNotify.UserId)) &&
                                                            !userNotify.UserId.Equals(user.Id))
                                                            listUserNotify.Add(userNotify);
                                                    }
                                                }
                                            }
                                            else
                                            {
                                                var assignInst = new ExcuterControlRoleInst
                                                {
                                                    UserId = assign.UserId,
                                                    ActivityCodeInst = actInst.ActivityInstCode,
                                                    Approve = assign.Approve,
                                                    ApproveTime = assign.ApproveTime,
                                                    Branch = assign.Branch,
                                                    DepartmentCode = assign.DepartmentCode,
                                                    GroupCode = assign.GroupCode,
                                                    CreatedTime = DateTime.Now,
                                                    CreatedBy = user.UserName,
                                                    Status = assign.Status,
                                                    Role = assign.Role
                                                };
                                                _context.ExcuterControlRoleInsts.Add(assignInst);
                                                //Add user to Notification
                                                var userNotify = new UserNotify
                                                {
                                                    UserId = assign.UserId
                                                };

                                                if (!listUserNotify.Any(p => p.UserId.Equals(userNotify.UserId)) &&
                                                    !userNotify.UserId.Equals(user.Id))
                                                    listUserNotify.Add(userNotify);
                                            }
                                        }
                                    }

                                    //Add attachment
                                    var fileRepos = _context.EDMSRepoCatFiles.Where(x =>
                                        x.ObjectType.Equals(
                                            EnumHelper<ActivityCat>.GetDisplayValue(ActivityCat.ActivityCat))
                                        && x.ObjectCode.Equals(item.ActivityCode));
                                    foreach (var fileRepo in fileRepos)
                                    {
                                        var edmsReposCatFile = new EDMSRepoCatFile
                                        {
                                            FileCode = string.Concat("ActInst_", Guid.NewGuid().ToString()),
                                            ReposCode = fileRepo.ReposCode,
                                            CatCode = fileRepo.CatCode,
                                            ObjectCode = actInst.ActivityInstCode,
                                            ObjectType =
                                                EnumHelper<ActivityInst>.GetDisplayValue(ActivityInst.ActivityInst),
                                            Path = fileRepo.Path,
                                            FolderId = fileRepo.FolderId
                                        };
                                        _context.EDMSRepoCatFiles.Add(edmsReposCatFile);

                                        var edmsFile = _context.EDMSFiles.FirstOrDefault(x =>
                                            !x.IsDeleted && x.FileCode.Equals(fileRepo.FileCode) &&
                                            (x.IsFileMaster == true || x.IsFileMaster == null));
                                        if (edmsFile != null)
                                        {
                                            var fileNew = string.Concat(
                                                Path.GetFileNameWithoutExtension(edmsFile.FileName), "_",
                                                Guid.NewGuid().ToString().Substring(0, 8),
                                                Path.GetExtension(edmsFile.FileName));
                                            //var byteData = DownloadFileFromServer(fileRepo.Id);
                                            //var urlUpload = UploadFileToServer(byteData, fileRepo.ReposCode, fileRepo.CatCode, fileNew, edmsFile.FileTypePhysic);

                                            var edms = new EDMSFile
                                            {
                                                FileCode = edmsReposCatFile.FileCode,
                                                FileName = edmsFile.FileName,
                                                Desc = edmsFile.Desc,
                                                ReposCode = fileRepo.ReposCode,
                                                Tags = edmsFile.Tags,
                                                FileSize = edmsFile.FileSize,
                                                FileTypePhysic = edmsFile.FileTypePhysic,
                                                NumberDocument = edmsFile.NumberDocument,
                                                CreatedBy = user.UserName,
                                                CreatedTime = DateTime.Now,
                                                IsFileOrigin = false,
                                                FileParentId = edmsFile.FileID,
                                                MimeType = edmsFile.MimeType,
                                                CloudFileId = edmsFile.CloudFileId,
                                            };
                                            _context.EDMSFiles.Add(edms);

                                            var actInstFile = new ActivityInstFile
                                            {
                                                FileID = edmsReposCatFile.FileCode,
                                                ActivityInstCode = actInst.ActivityInstCode,
                                                CreatedBy = user.UserName,
                                                CreatedTime = DateTime.Now,
                                                IsSign = false,
                                                SignatureRequire = false,
                                            };
                                            _context.ActivityInstFiles.Add(actInstFile);

                                            //File share by default
                                            var permission = new PermissionFile();
                                            var listUserShare = from a in assigns
                                                                join b in _context.Users on a.UserId equals b.Id
                                                                join c in _context.AdDepartments.Where(x => !x.IsDeleted && x.IsEnabled)
                                                                    on b.DepartmentId equals c.DepartmentCode into c1
                                                                from c in c1.DefaultIfEmpty()
                                                                select new
                                                                {
                                                                    Code = b.UserName,
                                                                    Name = b.GivenName,
                                                                    DepartmentName = c != null ? c.Title : "",
                                                                    Permission = permission
                                                                };

                                            var rela = new
                                            {
                                                ObjectType =
                                                    EnumHelper<ActivityInst>.GetDisplayValue(ActivityInst.ActivityInst),
                                                ObjectInstance = actInst.ActivityInstCode
                                            };
                                            var files = new FilesShareObjectUser
                                            {
                                                CreatedBy = user.UserName,
                                                CreatedTime = DateTime.Now,
                                                FileID = edms.FileCode,
                                                FileCreated = user.UserName,
                                                FileUrl = edms.Url,
                                                FileName = edmsFile.FileName,
                                                ObjectRelative = JsonConvert.SerializeObject(rela),
                                                ListUserShare = JsonConvert.SerializeObject(listUserShare)
                                            };
                                            _context.FilesShareObjectUsers.Add(files);
                                        }
                                    }
                                }
                            }

                            if (listUserNotify.Count > 0)
                            {
                                var notification = new NotificationManager
                                {
                                    ListUser = listUserNotify,
                                    Title = string.Format("{0} đã tạo 1 luồng việc mới: {1}", user.GivenName,
                                        wfInstance.WfInstName),
                                    ObjCode = wfInstance.WfInstCode,
                                    ObjType = EnumHelper<NotificationType>.GetDisplayValue(NotificationType.WorkFlow),
                                    CreatedBy = user.CreatedBy,
                                };

                                InsertNotification(notification);
                            }

                            var userList = listUserNotify.Select(x => x.UserId);
                            wfInstance.UserList = JsonConvert.SerializeObject(userList);
                            _context.WorkflowInstances.Update(wfInstance);
                        }

                        msg.Object = wfInstance;
                        _context.SaveChanges();
                        msg.Title = "Thêm luồng thành công";
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = "Đối tượng đã được tạo luồng";
                    }
                }
            }
            catch (Exception ex)
            {
                //Rollback wfInstace
                if (!string.IsNullOrEmpty(wfInstCode))
                    DeleteWfInstance(wfInstCode, obj.CreatedBy);

                msg.Error = true;
                msg.Title = "Có lỗi xảy ra";
            }

            return Json(msg);
        }

        [HttpGet]
        public JsonResult DeleteWfInstance(string wfInstCode, string userName)
        {
            var msg = new JMessage { Error = false, Title = "" };

            var user = _context.Users.FirstOrDefault(x => x.UserName.Equals(userName));

            var session = new SessionUserLogin
            {
                UserName = userName,
                IsAllData = user != null && user.UserType.Equals(10) ? true : false
            };

            var data = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value && x.WfInstCode == wfInstCode);
            if (data != null)
            {
                if (data.CreatedBy == session.UserName || session.IsAllData)
                {
                    data.IsDeleted = true;
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    _context.WorkflowInstances.Update(data);

                    var actInst = _context.ActivityInstances.Where(x => !x.IsDeleted && x.WorkflowCode == wfInstCode);
                    if (actInst.Any())
                    {
                        foreach (var item in actInst)
                        {
                            item.IsDeleted = true;
                            item.DeletedBy = ESEIM.AppContext.UserName;
                            item.DeletedTime = DateTime.Now;
                            _context.ActivityInstances.Update(item);
                        }
                    }

                    var runnings =
                        _context.WorkflowInstanceRunnings.Where(x => !x.IsDeleted && x.WfInstCode == wfInstCode);
                    if (runnings.Any())
                    {
                        foreach (var item in runnings)
                        {
                            item.IsDeleted = true;
                            item.DeletedBy = ESEIM.AppContext.UserName;
                            item.DeletedTime = DateTime.Now;
                            _context.WorkflowInstanceRunnings.Update(item);
                        }
                    }

                    _context.SaveChanges();
                    msg.Title = "Xóa thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Bạn không có quyền xóa";
                }
            }
            else
            {
                msg.Error = true;
                msg.Title = "Bản ghi không tồn tại";
            }

            return Json(msg);
        }

        [NonAction]
        public JsonResult InsertNotification([FromBody] NotificationManager obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var check = _context.NotificationManagers.Any(x =>
                    !x.IsDeleted && x.ObjCode.Equals(obj.ObjCode) && x.ObjType.Equals(obj.ObjType));
                if (!check)
                {
                    obj.NotifyCode = string.Format("NOTIFI_{0}", DateTime.Now.ToString("ddMMyyyyHHmmss"));
                    obj.CreatedBy = obj.CreatedBy;
                    obj.CreatedTime = DateTime.Now;
                    _context.NotificationManagers.Add(obj);
                    _context.SaveChanges();
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Thông báo đã tồn tại";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra";
            }

            return Json(msg);
        }

        [NonAction]
        private List<CreatorManager> AddCreatorManager(string userId)
        {
            var user = _context.Users.FirstOrDefault(x => x.Id.Equals(userId));
            var lstUser = new List<CreatorManager>();
            if (user != null)
            {
                if (!string.IsNullOrEmpty(user.DepartmentId))
                {
                    lstUser = (from a in _context.AdUserDepartments.Where(x =>
                            !x.IsDeleted && x.DepartmentCode.Equals(user.DepartmentId))
                               where a.RoleId.Equals("49b018ad-68af-4625-91fd-2273bb5cf749") ||
                                     a.RoleId.Equals("4fdd7913-cb36-4621-bf4b-c9359138881c")
                               select new CreatorManager
                               {
                                   UserId = a.UserId,
                                   BranchId = user.BranchId,
                                   DepartmentId = user.DepartmentId
                               }).DistinctBy(x => x.UserId).ToList();
                }
            }

            return lstUser;
        }

        [NonAction]
        public byte[] DownloadFileFromServer(int idRepoCatFile)
        {
            byte[] fileStream = new byte[0];

            var data = (from a in _context.EDMSRepoCatFiles.Where(x => x.Id == idRepoCatFile)
                        join b in _context.EDMSRepositorys on a.ReposCode equals b.ReposCode into b2
                        from b in b2.DefaultIfEmpty()
                        join c in _context.EDMSFiles on a.FileCode equals c.FileCode into c2
                        from c in c2.DefaultIfEmpty()
                        select new
                        {
                            a.Id,
                            Server = (b != null ? b.Server : null),
                            Type = (b != null ? b.Type : null),
                            ReposCode = (b != null ? b.ReposCode : null),
                            Url = (c != null ? c.Url : null),
                            FileId = (c != null ? c.CloudFileId : null),
                            FileTypePhysic = c.FileTypePhysic,
                            c.FileName,
                            c.MimeType,
                            b.Account,
                            b.PassWord,
                            c.FileCode,
                            c.IsEdit,
                            c.IsFileMaster,
                            c.FileParentId
                        }).FirstOrDefault();

            var getRepository = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == data.ReposCode);
            if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server))
            {
                using (var ms = new MemoryStream())
                {
                    string ftphost = data.Server;
                    string ftpfilepath = data.Url;
                    var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + ftphost + ftpfilepath);
                    using (WebClient request = new WebClient())
                    {
                        request.Credentials = new NetworkCredential(data.Account, data.PassWord);
                        fileStream = request.DownloadData(urlEnd);
                    }
                }
            }
            else if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.GooglerDriver))
            {
                var apiTokenService = _context.TokenManagers.FirstOrDefault(x => x.AccountCode == getRepository.Token);
                var json = apiTokenService.CredentialsJson;
                var user = apiTokenService.Email;
                var token = apiTokenService.RefreshToken;
                fileStream = FileExtensions.DownloadFileGoogle(json, token, data.FileId, user);
            }

            return fileStream;
        }

        [NonAction]
        public JMessage UploadFileToServer(byte[] fileByteArr, string repoCode, string catCode, string fileName,
            string contentType)
        {
            var msg = new JMessage() { Error = false, Title = "Tải tệp thành công" };
            try
            {
                var data = (from a in _context.EDMSCatRepoSettings.Where(x =>
                        x.ReposCode.Equals(repoCode) && x.CatCode.Equals(catCode))
                            join b in _context.EDMSRepositorys on a.ReposCode equals b.ReposCode into b2
                            from b in b2.DefaultIfEmpty()
                            select new
                            {
                                Server = (b != null ? b.Server : null),
                                Type = (b != null ? b.Type : null),
                                a.Path,
                                a.FolderId,
                                b.Account,
                                b.PassWord,
                            }).FirstOrDefault();

                var getRepository = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == repoCode);
                if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server))
                {
                    var fileBytes = fileByteArr;
                    var urlFile = string.Concat(data.Path, "/", fileName);
                    var urlFileServer = System.Web.HttpUtility.UrlPathEncode("ftp://" + data.Server + urlFile);
                    var result = FileExtensions.UploadFileToFtpServer(urlFileServer, urlFileServer, fileBytes,
                        data.Account, data.PassWord);
                    if (result.Status == WebExceptionStatus.ConnectFailure ||
                        result.Status == WebExceptionStatus.ProtocolError)
                    {
                        msg.Error = true;
                        //msg.Title = "Kết nối thất bại!";

                        return msg;
                    }
                    else if (result.Status == WebExceptionStatus.Success)
                    {
                        msg.Object = urlFile;
                        if (result.IsSaveUrlPreventive)
                        {
                            //urlFile = urlFilePreventive;
                        }
                    }
                    else
                    {
                        msg.Error = true;
                        //msg.Title = "Có lỗi xảy ra!";
                        return msg;
                    }
                }
                else if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.GooglerDriver))
                {
                    Stream stream = new MemoryStream(fileByteArr);
                    var apiTokenService =
                        _context.TokenManagers.FirstOrDefault(x => x.AccountCode == getRepository.Token);
                    var json = apiTokenService.CredentialsJson;
                    var user = apiTokenService.Email;
                    var token = apiTokenService.RefreshToken;
                    msg.Object = FileExtensions.UploadFileToDrive(json, token, fileName, stream, contentType,
                        data.FolderId, user);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                //msg.Title = "Có lỗi xảy ra!";
            }

            return msg;
        }

        [HttpPost]
        public object GetStepWorkFlow(string code)
        {
            List<ComboxModel> list = new List<ComboxModel>();
            var value = _context.Activitys.Where(x => !x.IsDeleted && x.WorkflowCode.Equals(code));
            var initial = value.FirstOrDefault(x => !x.IsDeleted && x.Type.Equals("TYPE_ACTIVITY_INITIAL"));
            var name = new ComboxModel
            {
                Code = initial.ActivityCode,
                Name = initial.Title,
                Status = initial.Status,
                StatusValue =
                    _context.CommonSettings.FirstOrDefault(z => !z.IsDeleted && z.CodeSet == initial.Status) != null
                        ? _context.CommonSettings.FirstOrDefault(z => !z.IsDeleted && z.CodeSet == initial.Status)
                            .ValueSet
                        : "",
            };
            list.Add(name);
            var location =
                _context.WorkflowSettings.FirstOrDefault(x =>
                    !x.IsDeleted && x.ActivityInitial.Equals(initial.ActivityCode));
            if (location != null)
            {
                var next = location.ActivityDestination;
                var count = 1;
                foreach (var item in value)
                {
                    var inti = value.FirstOrDefault(x => !x.IsDeleted && x.ActivityCode.Equals(next));
                    if (inti != null && count < value.Count())
                    {
                        var name2 = new ComboxModel
                        {
                            Code = inti.ActivityCode,
                            Name = inti.Title,
                            Status = inti.Status,
                        };
                        list.Add(name2);
                        var location2 = _context.WorkflowSettings.FirstOrDefault(x =>
                            !x.IsDeleted && x.ActivityInitial.Equals(inti.ActivityCode));
                        if (location2 != null)
                        {
                            next = location2.ActivityDestination;
                        }
                    }

                    count++;
                }

                return new { list };
            }
            else
            {
                return new { list };
            }
        }

        // nhap kho
        [HttpPost]
        public object GetListProductInStock()
        {
            JMessage msg = new JMessage();
            try
            {
                msg.Object = from a in _context.ProductInStocks.Where(x => !x.IsDeleted)
                             join b in _context.MaterialProducts.Where(x => !x.IsDeleted) on a.ProductCode equals b.ProductCode
                             join c in _context.CommonSettings.Where(x => !x.IsDeleted) on b.Unit equals c.CodeSet into c1
                             from c2 in c1.DefaultIfEmpty()
                             join d in _context.CommonSettings.Where(y => !y.IsDeleted) on b.ImpType equals d.CodeSet into d1
                             from d2 in d1.DefaultIfEmpty()
                             orderby b.ProductCode
                             select new
                             {
                                 //Code = string.Format("{0}_{1}", b.ProductCode, b.AttributeCode),
                                 Code = a.ProductQrCode,
                                 Name = $"{b.ProductName}-{b.ProductCode} [{a.StoreCode}]",
                                 Unit = b.Unit,
                                 ProductCode = b.ProductCode,
                                 UnitName = c2.ValueSet,
                                 AttributeCode = "",
                                 AttributeName = "",
                                 ProductType = b.TypeCode,
                                 ImpType = d2.ValueSet
                             };
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi xóa !";
            }

            return Json(msg);
        }

        // nhap kho
        [HttpPost]
        public object GetListProductInStockNew(int pageNo = 1, int pageSize = 10, string content = "", string storeCode = "", string group = "")
        {
            //var data = _context.QuizPools.Where(x => !x.IsDeleted).Select(x => new { Code = x.Code, Content = x.Content }).ToList();
            var search = !string.IsNullOrEmpty(content) ? content : "";
            var searchStore = !string.IsNullOrEmpty(storeCode) ? storeCode : "";
            var searchGroup = !string.IsNullOrEmpty(group) ? group : "";
            string[] param = new string[] { "@pageNo", "@pageSize", "@content", "@storeCode", "@group" };
            object[] val = new object[] { pageNo, pageSize, search, searchStore, searchGroup };
            DataTable rs = _repositoryService.GetDataTableProcedureSql("[P_GET_LIST_PRODUCT_IN_STOCK]", param, val);
            var data = CommonUtil.ConvertDataTable<MaterialProductInStock>(rs)
                .Select(x => new
                {
                    Id = x.StockId,
                    IdImpProduct = x.IdImpProduct,
                    Quantity = x.Quantity,
                    Unit = x.StockUnit,
                    Code = x.ProductCode,
                    Name = x.ProductName,
                    Title = x.Title,
                    Type = x.TypeCode,
                    //GattrCode = x.GattrCode,
                    StoreCode = x.StoreCode,
                    ProductQrCode = x.ProductQrCode,
                    Max = x.Max,
                    //IsMapped = x.IsMapped,
                    //Quantity = x.Quantity,
                    //MappingCode = x.MappingCode,
                    //ProductNo = x.ProductNo,
                }).ToList();
            //return query;
            return data;
        }

        // nhap kho
        [HttpPost]
        public object GetListProductInStockCylinker(int pageNo = 1, int pageSize = 10, string content = "", string storeCode = "", string group = "")
        {
            //var data = _context.QuizPools.Where(x => !x.IsDeleted).Select(x => new { Code = x.Code, Content = x.Content }).ToList();
            var search = !string.IsNullOrEmpty(content) ? content : "";
            var searchStore = !string.IsNullOrEmpty(storeCode) ? storeCode : "";
            var searchGroup = !string.IsNullOrEmpty(group) ? group : "";
            string[] param = new string[] { "@pageNo", "@pageSize", "@content", "@storeCode", "@group" };
            object[] val = new object[] { pageNo, pageSize, search, searchStore, searchGroup };
            DataTable rs = _repositoryService.GetDataTableProcedureSql("[P_GET_LIST_PRODUCT_IN_STOCK]", param, val);
            var data = CommonUtil.ConvertDataTable<MaterialProductInStock>(rs)
                .Select(x => new
                {
                    Id = x.StockId,
                    IdImpProduct = x.IdImpProduct,
                    Quantity = x.Quantity,
                    Unit = x.StockUnit,
                    Code = x.ProductCode,
                    Name = x.ProductName,
                    Title = $"{x.Title} [ {x.FuelName ?? ""} {x.WeightInStock ?? 0} / {x.Weight ?? 0} ]",
                    Type = x.TypeCode,
                    //GattrCode = x.GattrCode,
                    StoreCode = x.StoreCode,
                    ProductQrCode = x.ProductQrCode,
                    Max = x.Max,
                    FuelCode = x.FuelCode,
                    FuelName = x.FuelName,
                    MaxWeight = x.Weight,
                    CurrentWeight = x.WeightInStock
                    //IsMapped = x.IsMapped,
                    //Quantity = x.Quantity,
                    //MappingCode = x.MappingCode,
                    //ProductNo = x.ProductNo,
                }).ToList();
            //return query;
            return data;
        }

        // phieu nhap kho
        [HttpPost]
        public object GetListProductImpStore()
        {
            JMessage msg = new JMessage();
            try
            {
                msg.Object =
                    from b in _context.MaterialProducts.Where(x => !x.IsDeleted && x.TypeCode == "FINISHED_PRODUCT")
                    join c in _context.CommonSettings.Where(x => !x.IsDeleted) on b.Unit equals c.CodeSet into c1
                    from c2 in c1.DefaultIfEmpty()
                    join d in _context.CommonSettings.Where(y => !y.IsDeleted) on b.ImpType equals d.CodeSet into d1
                    from d2 in d1.DefaultIfEmpty()
                    orderby b.ProductCode
                    select new
                    {
                        //Code = string.Format("{0}_{1}", b.ProductCode, b.AttributeCode),
                        Code = b.ProductCode,
                        Name = string.Format("{0}-{1}", b.ProductName, b.ProductCode),
                        Unit = b.Unit,
                        ProductCode = b.ProductCode,
                        UnitName = c2.ValueSet,
                        AttributeCode = "",
                        AttributeName = "",
                        ProductType = b.TypeCode,
                        ImpType = d2.ValueSet
                    };
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi xóa !";
            }

            return Json(msg);
        }
        private static readonly log4net.ILog logProduct = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);

        //them san phan kho
        [HttpPost]
        public async Task<JMessage> InsertDetailImp([FromBody] ProductImportDetail obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {

                if (obj.ImpType == "CUSTOM")
                {
                    var groupAttribute = _context.ProductGattrExts.FirstOrDefault(x => !x.IsDeleted && x.GattrFlatCode == obj.GattrFlatCode);
                    if (groupAttribute == null)
                    {
                        var maxGroupId = _context.ProductGattrExts.MaxBy(x => x.Id) != null ? _context.ProductGattrExts.MaxBy(x => x.Id).Id : 1;
                        var newGroupAttribute = new ProductGattrExt
                        {
                            //GattrCode = maxGroupId.ToString(),
                            GattrFlatCode = obj.GattrFlatCode,
                            GattrJson = obj.ProdCustomJson,
                            IsDeleted = false,
                            CreatedBy = obj.CreatedBy,
                            CreatedTime = DateTime.Now,
                            Type = "IMPORT_CUSTOM",
                            IdSource = _context.ProductImportDetails.Where(x => !x.IsDeleted).ToList().Count
                        };
                        _context.ProductGattrExts.Add(newGroupAttribute);
                        await _context.SaveChangesAsync();
                        maxGroupId = newGroupAttribute.Id;
                        newGroupAttribute.GattrCode = newGroupAttribute.Id.ToString();
                        obj.GattrCode = newGroupAttribute.GattrCode;
                        _context.ProductGattrExts.Update(newGroupAttribute);
                        logProduct.Info(newGroupAttribute.Id);
                    }
                    else
                    {
                        obj.GattrCode = groupAttribute.GattrCode;
                    }
                    await _context.SaveChangesAsync();
                }
                if (obj.IsMultiple == true)
                {
                    var digits = new[] { '0', '1', '2', '3', '4', '5', '6', '7', '8', '9' };
                    var startCode = obj.ProductCode.TrimEnd(digits);
                    var listProduct = _context.MaterialProducts.Where(x => !x.IsDeleted && x.ProductCode.StartsWith(startCode))
                        .Select(delegate (MaterialProduct product)
                        {
                            var number = GetNumberInEndOfString(product.ProductCode);
                            return new
                            {
                                ProductCode = product.ProductCode,
                                Number = !string.IsNullOrEmpty(number) ? int.Parse(number) : -1,
                                Weight = product.Weight
                            };
                        })
                        .ToList();
                    var stringStart = GetNumberInEndOfString(obj.ProductCode);
                    var numberStart = !string.IsNullOrEmpty(stringStart) ? int.Parse(stringStart) : -1;
                    var listProductFilter = listProduct.Where(x => x.Number >= numberStart && x.Number < (numberStart + obj.Quantity))
                        .ToList();
                    var remainWeight = obj.Weight ?? 0;
                    if (listProductFilter.Count < obj.Quantity)
                    {
                        msg.Title = "Không đủ danh mục sản phẩm để tự sinh";
                        msg.Error = true;
                        return msg;
                    }
                    foreach (var item in listProductFilter)
                    {
                        obj.ProductCode = item.ProductCode;
                        obj.Quantity = 1;
                        //obj.Weight = remainWeight >= item.Weight ? item.Weight : remainWeight;
                        //remainWeight -= (item.Weight ?? 0);
                        msg = await InsertDetailSingle(obj);
                        if (msg.Error)
                        {
                            return msg;
                        }
                    }
                }
                else
                {
                    msg = await InsertDetailSingle(obj);
                    if (msg.Error)
                    {
                        return msg;
                    }
                }

                msg.Title = "Thêm thành công";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra!";
                logProduct.Info(ex.Message);
                await CleanGattr();
            }

            return msg;
        }
        private async Task CleanGattr()
        {
            try
            {
                var gAttrNulls = _context.ProductGattrExts.Where(x => x.GattrCode == null).ToList();
                _context.ProductGattrExts.RemoveRange(gAttrNulls);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
            return;
        }


        private async Task<JMessage> InsertDetailSingle(ProductImportDetail obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var returnId = -1;
            var maxId = _context.ProductImportDetails.AsNoTracking().MaxBy(x => x.Id) != null ?
                _context.ProductImportDetails.AsNoTracking().MaxBy(x => x.Id).Id : 1;
            var check = _context.ProductImportDetails.AsNoTracking().FirstOrDefault(x => !x.IsDeleted && x.TicketCode.Equals(obj.TicketCode)
            && x.ProductCode.Equals(obj.ProductCode));
            var materialProduct = _context.MaterialProducts.Include(x => x.Group)
                .FirstOrDefault(x => !x.IsDeleted && x.ProductCode == obj.ProductCode);

            var productQrCode = "";
            var listProdStrNo = new List<ProdStrNo>();
            if (!string.IsNullOrEmpty(obj.ProductNo))
            {
                listProdStrNo = ListProdStrNoHelper.GetListProdStrNo(obj.ProductNo);
            }
            else if (obj.Quantity > 0)
            {
                listProdStrNo = new List<ProdStrNo>() { new ProdStrNo(1, decimal.ToInt32(obj.Quantity)) };
            }
            var packCode = "";
            var checkSumWeight = _context.ProductInStocks.AsNoTracking().Where(x => !x.IsDeleted
            && x.ProductCode.Equals(obj.ProductCode)).Sum(x => x.Weight);
            var sumWeight = checkSumWeight + obj.Weight;
            if (sumWeight > materialProduct.Weight && (materialProduct?.Group?.GroupType == "STATIC_TANK"
                || materialProduct?.Group?.GroupType == "BOTTLE"))
            {
                msg.Title = "Khối lượng nhập vượt quá dung tích bồn chứa, bình";
                msg.Error = true;
                return msg;
            }
            if (materialProduct?.Group?.GroupType == "BOTTLE")
            {
                var checkBottle = _context.ProductInStocks.AsNoTracking().FirstOrDefault(x => !x.IsDeleted && x.ProductCode.Equals(obj.ProductCode));
                if (checkBottle != null)
                {
                    msg.Title = "Vỏ đã được nhập trước đó";
                    msg.Error = true;
                    return msg;
                }
            }

            if (check == null || materialProduct?.Group?.GroupType != "STATIC_TANK")
            {
                var receiveDetail = new ProductImportDetail
                {
                    TicketCode = obj.TicketCode,
                    ProductCode = obj.ProductCode,
                    ProductQrCode = productQrCode,
                    //ListProductNo = listProductNo,
                    ListProdStrNo = listProdStrNo,
                    ProductType = obj.ProductType,
                    Quantity = obj.Quantity,
                    Unit = obj.Unit,
                    SalePrice = obj.SalePrice,
                    Currency = obj.Currency,
                    CreatedBy = obj.CreatedBy,
                    CreatedTime = DateTime.Now,
                    QuantityIsSet = 0,
                    PackType = obj.PackType,
                    //MarkWholeProduct = mark.Any() ? true : false,
                    ImpType = obj.ImpType,
                    PackCode = obj.PackCode ?? $"PACK_{obj.ProductCode + "_" + maxId}",
                    PackLot = obj.PackLot,
                    GattrCode = obj.GattrCode,
                    Status = obj.Status,
                    DeletionToken = "NA"
                };

                //var listPack = new List<WarehouseRecordsPack>();

                //for (int i = 1; i <= obj.Quantity; i++)
                //{
                //    packCode = receiveDetail.PackCode;

                //    if (obj.Quantity > 1)
                //        packCode = $"{receiveDetail.PackCode}_{i}";

                //    var pack = new WarehouseRecordsPack
                //    {
                //        PackCode = packCode,
                //        QrCode = packCode,
                //        PackName = packCode,
                //        PackLevel = "0",
                //        PackHierarchyPath = packCode,
                //        PackType = "PACK_TYPE_BOX",
                //        PackQuantity = 1,
                //        CreatedBy = User.Identity.Name,
                //        CreatedTime = DateTime.Now,
                //        ImportHeaderCode = obj.TicketCode,
                //        //PackParent = GetParent(obj.ProductCode, obj.PackType, obj.TicketCode)
                //    };

                //    listPack.Add(pack);
                //}

                //foreach (var item in listPack)
                //{
                //    var exitPack = _context.WarehouseRecordsPacks.Any(x => !x.IsDeleted && x.PackCode.Equals(item.PackCode));
                //    if (!exitPack)
                //        _context.WarehouseRecordsPacks.Add(item);
                //}

                //receiveDetail.PackCode = listPack.FirstOrDefault()?.PackCode;
                _context.ProductImportDetails.Add(receiveDetail);
                await _context.SaveChangesAsync();
                maxId = receiveDetail.Id;
                receiveDetail.ProductQrCode = obj.ProductCode + "_" + obj.TicketCode + "_" + maxId;
                productQrCode = receiveDetail.ProductQrCode;
                if (materialProduct?.Group?.GroupType == "STATIC_TANK")
                {
                    receiveDetail.QuantityIsSet = obj.Quantity;
                }
                if (!string.IsNullOrEmpty(obj.MappingCode))
                {
                    receiveDetail.QuantityIsSet = obj.Quantity;
                }
                _context.ProductImportDetails.Update(receiveDetail);
                returnId = receiveDetail.Id;
            }
            else if (materialProduct?.Group?.GroupType == "STATIC_TANK")
            {
                check.Quantity += obj.Quantity;
                check.SalePrice = (check.SalePrice ?? 0) + (obj.SalePrice ?? 0);
                check.QuantityIsSet = check.Quantity;
                check.Status = obj.Status;
                check.Weight += obj.Weight;
                _context.ProductImportDetails.Update(check);
                returnId = check.Id;
            }
            var listProdNo = new List<ProdStrNo> { new ProdStrNo(1) };
            var tankInStock = _context.ProductInStocks.Include(x => x.Product).ThenInclude(x => x.Group).FirstOrDefault(x => !x.IsDeleted
            && x.ProductCode == obj.ProductCode && x.Product != null && x.Product.Group != null
            && x.Product.Group.GroupType == "STATIC_TANK");
            if (tankInStock != null)
            {
                tankInStock.Quantity += obj.Quantity;
                //tankInStock.IdImpProduct = maxId;
                tankInStock.ParentId = obj.ParentId;
                tankInStock.ListProdStrNo = listProdNo;
                _context.ProductInStocks.Update(tankInStock);
            }
            else
            {
                var storeInventoryObj = new ProductInStock
                {
                    IdImpProduct = maxId,
                    LotProductCode = obj.LotProductCode,
                    //ListProductNo = listProductNo,
                    ListProdStrNo = listProdStrNo,
                    StoreCode = obj.StoreCode,
                    IsCustomized = obj.IsCustomized,
                    ProductCode = obj.ProductCode,
                    ProductType = obj.ProductType,
                    ProductQrCode = obj.ProductCode + "_" + obj.TicketCode + "_" + maxId,
                    Quantity = obj.Quantity,
                    Weight = obj.Weight,
                    Unit = obj.Unit,
                    CreatedBy = obj.CreatedBy,
                    CreatedTime = DateTime.Now,
                    IsDeleted = false,
                    //MarkWholeProduct = mark.Any() ? true : false,
                    PackCode = packCode,
                    GattrCode = obj.GattrCode,
                    DeletionToken = "NA"
                };
                if (materialProduct?.Group?.GroupType == "STATIC_TANK")
                {
                    storeInventoryObj.ListProdStrNo = listProdNo;
                }
                _context.ProductInStocks.Add(storeInventoryObj);
            }

            var tankMapping = _context.ProductLocatedMappings.Include(x => x.Product).ThenInclude(x => x.Group).FirstOrDefault(x => !x.IsDeleted
            && x.ProductCode == obj.ProductCode && x.Product != null && x.Product.Group != null
            && x.Product.Group.GroupType == "STATIC_TANK");
            if (tankMapping != null && tankInStock != null)
            {
                tankMapping.Quantity = tankInStock.Quantity;
                tankMapping.ListProdStrNo = listProdNo;
                _context.ProductLocatedMappings.Update(tankMapping);
            }
            else if (materialProduct?.Group?.GroupType == "STATIC_TANK")
            {
                var mapping = new ProductLocatedMapping
                {
                    IdImpProduct = maxId,
                    //ListProductNo = listProductNo,
                    ListProdStrNo = listProdNo,
                    //WHS_Code = data.WHS_Code,
                    WHS_Code = obj.StoreCode,
                    //FloorCode = data.FloorCode,
                    //LineCode = data.LineCode,
                    //RackCode = data.RackCode,
                    //RackPosition = data.RackPosition,
                    MappingCode = obj.MappingCode ?? "",
                    ProductQrCode = obj.ProductCode + "_" + obj.TicketCode + "_" + maxId,
                    ProductCode = obj.ProductCode,
                    Quantity = obj.Quantity,
                    Unit = obj.Unit,
                    //Ordering = data.Ordering,
                    CreatedBy = obj.CreatedBy,
                    CreatedTime = DateTime.Now,
                    TicketImpCode = obj.TicketCode,
                    GattrCode = obj.GattrCode,
                    DeletionToken = "NA"
                };
                _context.ProductLocatedMappings.Add(mapping);
            }
            else if (!string.IsNullOrEmpty(obj.MappingCode))
            {
                var mapping = new ProductLocatedMapping
                {
                    IdImpProduct = maxId,
                    //ListProductNo = listProductNo,
                    ListProdStrNo = listProdStrNo,
                    //WHS_Code = data.WHS_Code,
                    WHS_Code = obj.StoreCode,
                    //FloorCode = data.FloorCode,
                    //LineCode = data.LineCode,
                    //RackCode = data.RackCode,
                    //RackPosition = data.RackPosition,
                    MappingCode = obj.MappingCode,
                    ProductQrCode = obj.ProductCode + "_" + obj.TicketCode + "_" + maxId,
                    ProductCode = obj.ProductCode,
                    Quantity = obj.Quantity,
                    Unit = obj.Unit,
                    //Ordering = data.Ordering,
                    CreatedBy = obj.CreatedBy,
                    CreatedTime = DateTime.Now,
                    TicketImpCode = obj.TicketCode,
                    GattrCode = obj.GattrCode,
                    DeletionToken = "NA"
                };
                _context.ProductLocatedMappings.Add(mapping);
                await _context.SaveChangesAsync();
                var mappingLog = new ProductLocatedMappingLog
                {
                    IdImpProduct = maxId,
                    IdLocMapOld = -1,
                    IdLocatedMapping = mapping.Id,
                    MappingCode = mapping.MappingCode,
                    MappingCodeOld = "",
                    StoreCode = obj.StoreCode,
                    //GattrCode = gattrCode,
                    ProductCode = obj.ProductCode,
                    ProductNo = listProdStrNo.ToFlatString(),
                    ProductQrCode = obj.ProductCode + "_" + obj.TicketCode + "_" + maxId,
                    Quantity = 1,
                    Unit = obj.Unit,
                    TicketCode = obj.TicketCode,
                    Type = "ARRANGE_IMP",
                    CreatedBy = obj.CreatedBy,
                    CreatedTime = DateTime.Now,
                    IsDeleted = false,
                    //MarkWholeProduct = mark.Any() ? true : false,
                    DeletionToken = "NA"
                };

                _context.ProductLocatedMappingLogs.Add(mappingLog);
            }
            var header = _context.ProductImportHeaders.FirstOrDefault(x => !x.IsDeleted && x.TicketCode == obj.TicketCode);
            var mpStatus = new MpStatus()
            {
                ActStatus = "IMPORT",
                ActTime = DateTime.Now,
                ActBy = obj.CreatedBy,
                ProductNo = listProdStrNo.ToFlatString(),
                //MappingCode = tankMapping?.MappingCode,
                SupCode = header?.SupCode,
                CusCode = header?.CusCode,
            };
            materialProduct.MpStatuses = materialProduct.MpStatuses != null ? materialProduct.MpStatuses : new List<MpStatus>();
            materialProduct.MpStatuses.Add(mpStatus);

            await _context.SaveChangesAsync();
            if (obj.ImpType == "RETURN")
            {
                var gattrCode = "";
                var groupAttribute = _context.ProductGattrExts.FirstOrDefault(x => !x.IsDeleted && x.GattrFlatCode == obj.ParentFlatCode);
                if (groupAttribute == null)
                {
                    var maxGroupId = _context.ProductGattrExts.MaxBy(x => x.Id) != null ? _context.ProductGattrExts.MaxBy(x => x.Id).Id : 1;
                    var newGroupAttribute = new ProductGattrExt
                    {
                        //GattrCode = (maxGroupId + 1).ToString(),
                        GattrFlatCode = obj.ParentFlatCode,
                        GattrJson = obj.ParentCustomJson,
                        IsDeleted = false,
                        CreatedBy = obj.CreatedBy,
                        CreatedTime = DateTime.Now,
                        Type = "IMPORT_RETURN",
                        IdSource = obj.ParentMappingId
                    };
                    _context.ProductGattrExts.Add(newGroupAttribute);
                    await _context.SaveChangesAsync();
                    maxGroupId = newGroupAttribute.Id;
                    newGroupAttribute.GattrCode = newGroupAttribute.Id.ToString();
                    gattrCode = newGroupAttribute.GattrCode;
                    _context.ProductGattrExts.Update(newGroupAttribute);
                }
                else
                {
                    gattrCode = groupAttribute.GattrCode;
                }
                var parentMapping = _context.ProductLocatedMappings.FirstOrDefault(x => !x.IsDeleted && x.Id == obj.ParentMappingId);
                if (parentMapping != null /*&& obj.ParentProductNumber.HasValue*/ && parentMapping.ListProdStrNo.Count > 0)
                {
                    //obj.ParentProductNumber = parentMapping.ListProductNo.FirstOrDefault();
                    //parentMapping.ListProductNo.Remove(obj.ParentProductNumber.Value);
                    parentMapping.ListProdStrNo.Extract(obj.ParentProductNumber.Value);
                    parentMapping.Quantity -= 1;
                    _context.ProductLocatedMappings.Update(parentMapping);
                    var newId = -1;
                    var checkLocated = _context.ProductLocatedMappings.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == parentMapping.ProductCode
                    && x.IdImpProduct == parentMapping.IdImpProduct && x.GattrCode == gattrCode && x.MappingCode == parentMapping.MappingCode);
                    if (checkLocated == null)
                    {
                        var newParentMapping = new ProductLocatedMapping
                        {
                            IdImpProduct = parentMapping.IdImpProduct,
                            MappingCode = parentMapping.MappingCode,
                            WHS_Code = parentMapping.WHS_Code,
                            ProductCode = parentMapping.ProductCode,
                            ProductType = parentMapping.ProductType,
                            ProductQrCode = parentMapping.ProductQrCode,
                            Quantity = 1,
                            ListProdStrNo = new List<ProdStrNo> { new ProdStrNo(obj.ParentProductNumber.Value) },
                            Unit = parentMapping.Unit,
                            CreatedBy = obj.CreatedBy,
                            CreatedTime = DateTime.Now,
                            IsDeleted = false,
                            //MarkWholeProduct = mark.Any() ? true : false,
                            GattrCode = gattrCode,
                            DeletionToken = "NA"
                        };
                        _context.ProductLocatedMappings.Add(newParentMapping);
                        await _context.SaveChangesAsync();
                        newId = newParentMapping.Id;
                    }
                    else
                    {
                        checkLocated.ListProdStrNo.Add(new ProdStrNo(obj.ParentProductNumber.Value));
                        checkLocated.Quantity++;
                        _context.ProductLocatedMappings.Update(checkLocated);
                        newId = checkLocated.Id;
                    }
                    var mappingLog = new ProductLocatedMappingLog
                    {
                        IdImpProduct = parentMapping.IdImpProduct,
                        IdLocMapOld = parentMapping.Id,
                        IdLocatedMapping = newId,
                        MappingCode = parentMapping.MappingCode,
                        MappingCodeOld = parentMapping.MappingCode,
                        StoreCode = parentMapping.WHS_Code,
                        GattrCode = gattrCode,
                        ProductCode = parentMapping.ProductCode,
                        ProductNo = obj.ParentProductNumber.Value.ToString(),
                        ProductQrCode = parentMapping.ProductQrCode,
                        Quantity = 1,
                        Unit = parentMapping.Unit,
                        TicketCode = obj.TicketCode,
                        Type = "IMPORT_RETURN",
                        CreatedBy = obj.CreatedBy,
                        CreatedTime = DateTime.Now,
                        IsDeleted = false,
                        //MarkWholeProduct = mark.Any() ? true : false,
                        DeletionToken = "NA"
                    };

                    _context.ProductLocatedMappingLogs.Add(mappingLog);
                    var parentInStock = _context.ProductInStocks.Where(x => !x.IsDeleted && x.IdImpProduct == parentMapping.IdImpProduct/* && x.GattrCode == obj.GattrCode*/
                    /*&& x.ListProductNo.ContainsRange(parentMapping.ListProductNo)*/).ToList().FirstOrDefault(x => x.ListProdStrNo.ContainsRange(parentMapping.ListProdStrNo));
                    if (parentInStock != null)
                    {
                        //parentInStock.ListProductNo.Remove(obj.ParentProductNumber.Value);
                        parentInStock.ListProdStrNo.Extract(obj.ParentProductNumber.Value);
                        parentInStock.Quantity -= 1;
                        _context.ProductInStocks.Update(parentInStock);
                        var newParentInStock = new ProductInStock
                        {
                            IdImpProduct = parentInStock.IdImpProduct,
                            LotProductCode = parentInStock.LotProductCode,
                            StoreCode = parentInStock.StoreCode,
                            ProductCode = parentInStock.ProductCode,
                            ProductType = parentInStock.ProductType,
                            ProductQrCode = parentInStock.ProductQrCode,
                            Quantity = 1,
                            //ListProductNo = new List<int> { obj.ParentProductNumber.Value },
                            ListProdStrNo = new List<ProdStrNo> { new ProdStrNo(obj.ParentProductNumber.Value) },
                            Unit = parentInStock.Unit,
                            CreatedBy = obj.CreatedBy,
                            CreatedTime = DateTime.Now,
                            IsDeleted = false,
                            //MarkWholeProduct = mark.Any() ? true : false,
                            PackCode = packCode,
                            GattrCode = gattrCode,
                            DeletionToken = "NA"
                        };
                        _context.ProductInStocks.Add(newParentInStock);
                    }
                    var impParent = new ProductImpParent
                    {
                        IdImpProduct = maxId,
                        IdProductParent = obj.ParentMappingId,
                        Number = obj.ParentProductNumber,
                        IsDeleted = false,
                        CreatedBy = obj.CreatedBy,
                        CreatedTime = DateTime.Now,
                    };
                    _context.ProductImpParents.Add(impParent);
                }
                await _context.SaveChangesAsync();
            }
            msg.ID = returnId;
            return msg;
        }


        [HttpPost]
        public async Task<JsonResult> InsertDetailImpMulti([FromBody] List<ProductImportDetail> listObj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                //Check product is exist in Receive with conditions: ticket, product, unit, packing
                //foreach (var obj in listObj)
                //{
                //    var mark = _context.ProdReceivedAttrValues.Where(x =>
                //                !x.IsDeleted && x.TicketImpCode.Equals(obj.TicketCode));
                //    var idMapping = -1;

                //    var check = _context.ProductImportDetails.FirstOrDefault(x => !x.IsDeleted &&
                //                                                                 x.TicketCode.Equals(obj.TicketCode)
                //                                                                 && x.ProductCode.Equals(obj.ProductCode) &&
                //                                                                 x.Unit.Equals(obj.Unit) &&
                //                                                                 x.PackType.Equals(obj.PackType));

                //    var maxId = _context.ProductImportDetails.MaxBy(x => x.Id) != null
                //        ? _context.ProductImportDetails.MaxBy(x => x.Id).Id
                //        : 1;

                //    if (!string.IsNullOrEmpty(obj.MappingCode))
                //    {
                //        //Thêm vào bảng Product_Entity_Mapping
                //        var mapping = new ProductLocatedMapping
                //        {
                //            WHS_Code = obj.StoreCode,
                //            MappingCode = obj.MappingCode,
                //            ProductQrCode = obj.ProductCode + "_" + maxId,
                //            ProductCode = obj.ProductCode,
                //            Quantity = obj.Quantity,
                //            Unit = obj.Unit,
                //            //Ordering = obj.Ordering,
                //            CreatedBy = obj.CreatedBy,
                //            CreatedTime = DateTime.Now,
                //            TicketImpCode = obj.TicketCode
                //        };
                //        _context.ProductLocatedMappings.Add(mapping);

                //        ////Thêm dữ liệu bảng bút toán xếp kho
                //        //var mark = _context.ProdReceivedAttrValues.Where(x =>
                //        //    !x.IsDeleted && x.TicketImpCode.Equals(obj.TicketCode));

                //        var mapId = _context.ProductLocatedMappings.MaxBy(x => x.Id);
                //        idMapping = mapId != null ? (mapId.Id + 1) : 1;
                //        var stockArrangePut = new StockArrangePutEntry
                //        {
                //            MapId = idMapping,
                //            ProdCode = obj.ProductCode + "_" + maxId,
                //            Quantity = obj.Quantity,
                //            MarkWholeProduct = mark.Any() ? true : false
                //        };
                //        _context.StockArrangePutEntrys.Add(stockArrangePut);

                //        //Map vị trí trong kho
                //        var mapStock = new MapStockProdIn
                //        {
                //            MapId = idMapping,
                //            ProdCode = obj.ProductCode + "_" + maxId,
                //            Quantity = obj.Quantity,
                //            Unit = obj.Unit
                //        };
                //        _context.MapStockProdIns.Add(mapStock);
                //    }

                //    var receiveDetail = new ProductImportDetail
                //    {
                //        TicketCode = obj.TicketCode,
                //        ProductCode = obj.ProductCode,
                //        ProductQrCode = obj.ProductCode + "_" + maxId,
                //        ProductType = obj.ProductType,
                //        Quantity = obj.Quantity,
                //        QuantityIsSet = idMapping == -1 ? 0 : obj.Quantity,
                //        Unit = obj.Unit,
                //        SalePrice = obj.SalePrice,
                //        Currency = obj.Currency,
                //        CreatedBy = obj.CreatedBy,
                //        CreatedTime = DateTime.Now,
                //        PackType = obj.PackType,
                //        MarkWholeProduct = mark.Any() ? true : false
                //    };
                //    _context.ProductImportDetails.Add(receiveDetail);

                //    var storeInventoryObj = new ProductInStock
                //    {
                //        LotProductCode = obj.LotProductCode,
                //        StoreCode = obj.StoreCode,

                //        ProductCode = obj.ProductCode,
                //        ProductType = obj.ProductType,
                //        ProductQrCode = obj.ProductCode + "_" + maxId,
                //        Quantity = obj.Quantity,
                //        Unit = obj.Unit,
                //        CreatedBy = obj.CreatedBy,
                //        CreatedTime = DateTime.Now,
                //        IsDeleted = false,
                //        MarkWholeProduct = mark.Any() ? true : false
                //    };
                //    _context.ProductInStocks.Add(storeInventoryObj);

                //    await _context.SaveChangesAsync();
                //}

                msg.Title = "Thêm thành công";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra!";
            }
            return Json(msg);
        }

        [HttpPost]
        public object UpdateProductReceivedDetail(string json, int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var product = _context.ProductImportDetails.FirstOrDefault(x => x.Id == id);
                if (product != null)
                {
                    product.ProdCustomJson = json;
                    product.IsCustomized = true;
                    _context.ProductImportDetails.Update(product);
                    _context.SaveChanges();
                    msg.Title = "Cập nhật sản phẩm thành công!";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Cập nhật sản phẩm thất bại!";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = "Có lỗi khi cập nhật";
            }

            return Json(msg);
        }

        [HttpPost]
        public JsonResult InsertDetailByLot([FromBody] MaterialStoreImpModelInsert obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                //Remove old product
                var oldProd = _context.ProductImportDetails.Where(x => !x.IsDeleted &&
                                                                      x.TicketCode.Equals(obj.TicketCode)
                                                                      && !string.IsNullOrEmpty(x.LotProductCode));
                foreach (var item in oldProd)
                {
                    var prodInStock = _context.ProductInStocks.FirstOrDefault(x =>
                        x.ProductQrCode.Equals(item.ProductQrCode) && !x.IsDeleted);
                    prodInStock.Quantity = prodInStock.Quantity - item.Quantity;
                    _context.ProductInStocks.Update(prodInStock);

                    var mapping = _context.ProductLocatedMappings.Where(x => !x.IsDeleted &&
                                                                            x.ProductQrCode.Equals(item.ProductQrCode)
                                                                            && x.TicketImpCode.Equals(item.TicketCode));
                    if (mapping.Any())
                    {
                        foreach (var map in mapping)
                        {
                            map.IsDeleted = true;
                            var stockArrangePut = _context.StockArrangePutEntrys.FirstOrDefault(x => x.MapId == map.Id);
                            if (stockArrangePut != null)
                                _context.StockArrangePutEntrys.Remove(stockArrangePut);
                        }
                    }
                }

                _context.ProductImportDetails.RemoveRange(oldProd);

                if (obj.ListProduct.Any())
                {
                    var maxId = _context.ProductImportDetails.MaxBy(x => x.Id) != null
                        ? _context.ProductImportDetails.MaxBy(x => x.Id).Id
                        : 1;
                    foreach (var item in obj.ListProduct)
                    {
                        var receiveDetail = new ProductImportDetail
                        {
                            TicketCode = obj.TicketCode,
                            LotProductCode = obj.LotProductCode,
                            ProductCode = item.ProductCode,
                            ProductQrCode = item.ProductCode + "_" + maxId,
                            Quantity = item.Quantity,
                            Unit = item.Unit,
                            SalePrice = item.SalePrice,
                            Currency = obj.Currency,
                            CreatedBy = obj.CreatedBy,
                            CreatedTime = DateTime.Now,
                            QuantityIsSet = 0,
                            PackType = item.PackType,
                            Status = obj.Status,
                            MarkWholeProduct = true
                        };
                        _context.ProductImportDetails.Add(receiveDetail);
                        var storeInventory = _context.ProductInStocks.FirstOrDefault(x =>
                            !x.IsDeleted && x.ProductQrCode.Equals(receiveDetail.ProductQrCode));
                        if (storeInventory != null)
                        {
                            storeInventory.Quantity = storeInventory.Quantity + item.Quantity;
                            _context.ProductInStocks.Update(storeInventory);
                        }
                        else
                        {
                            var storeInventoryObj = new ProductInStock
                            {
                                LotProductCode = obj.LotProductCode,
                                StoreCode = obj.StoreCode,

                                ProductCode = item.ProductCode,
                                ProductType = item.ProductType,
                                ProductQrCode = item.ProductCode + "_" + maxId,
                                Quantity = item.Quantity,
                                Unit = item.Unit,
                                CreatedBy = obj.CreatedBy,
                                CreatedTime = DateTime.Now,
                                IsDeleted = false,
                                MarkWholeProduct = true
                            };
                            _context.ProductInStocks.Add(storeInventoryObj);
                        }

                        maxId++;
                    }
                }

                _context.SaveChanges();
            }
            catch (Exception ex)
            {
                msg.Title = "Có lỗi xảy ra!";
                msg.Error = true;
            }

            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetProductDetailImp(string ticketCode)
        {
            var listProdStatus = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "PROD_STAT").OrderBy(x => x.ValueSet)
                .Select(x => new { Code = x.CodeSet, Name = x.ValueSet }).ToList();
            var data = (from a in _context.ProductImportDetails.Where(x => !x.IsDeleted && (string.IsNullOrEmpty(ticketCode) || x.TicketCode.Equals(ticketCode)))
                        join b in _context.MaterialProducts.Where(x => !x.IsDeleted) on a.ProductCode equals b.ProductCode
                        join c in _context.WarehouseRecordsPacks.Where(x => !x.IsDeleted) on a.PackCode equals c.PackCode into c1
                        from c in c1.DefaultIfEmpty()
                        join d in _context.ProductInStocks.Where(x => !x.IsDeleted && x.IdImpProduct.HasValue) on
                         new { IdImpProduct = a.Id, a.GattrCode } equals new { IdImpProduct = d.IdImpProduct.Value, d.GattrCode } into d1
                        from d in d1.DefaultIfEmpty()
                        join e in _context.PackageObjects on a.PackCode equals e.PackCode into e1
                        from e in e1.DefaultIfEmpty()
                            //join e in _context.MaterialProducts.Where(x => !x.IsDeleted) on a.ProductCode equals e.ProductCode
                        select new ProductImpDetail
                        {
                            Id = a.Id,
                            TicketCode = a.TicketCode,
                            ProductName = b.ProductName,
                            ProductCode = b.ProductCode,
                            Quantity = a.Quantity,
                            QuantityIsSet = a.QuantityIsSet,
                            Unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.Unit).ValueSet,
                            SalePrice = a.SalePrice,
                            CurrencyCode = a.Currency,
                            Currency = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.Currency).ValueSet,
                            QrCode = CommonUtil.GeneratorQRCode(a.ProductCode),
                            ProductQRCode = a.ProductQrCode,
                            ProductNo = d != null ? d.ProductNo : /*a.ProductNo*/"",
                            Remain = a.Quantity - a.QuantityIsSet,
                            PackType = !string.IsNullOrEmpty(a.PackType) ? a.PackType : "",
                            PackName = e != null ? e.PackName : "Chưa đóng gói",
                            PackCode = e != null ? e.PackCode : "",
                            PackLot = a.PackLot,
                            SProductQrCode = CommonUtil.GenerateQRCode("SP:" + a.ProductQrCode + "_P:" + a.TicketCode + "_SL:" + a.Quantity),
                            UnitCode = a.Unit,
                            IsCustomized = a.IsCustomized,
                            ProdCustomJson = a.ProdCustomJson,
                            ImpType = a.ImpType,
                            Status = a.Status,
                            Serial = b.Serial,
                            Weight = a.Weight
                            //IdProduct = e.Id
                        }).ToList().OrderByDescending(x => x.Id);
            foreach (var item in data)
            {
                if (!string.IsNullOrEmpty(item.Status))
                {
                    var listItemStatus = (from a in item.Status.Split(",")
                                          join b in listProdStatus on a.Trim() equals b.Code
                                          select b.Name);
                    item.ProductStatus = string.Join(", ", listItemStatus);
                }
                else
                {
                    item.ProductStatus = "";
                }
            }
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetProductDetailPackage(string ticketCode)
        {
            //var listProdStatus = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "PROD_STAT").OrderBy(x => x.ValueSet)
            //    .Select(x => new { Code = x.CodeSet, Name = x.ValueSet }).ToList();
            var data = (from a in _context.ProductImportDetails.Where(x => !x.IsDeleted && (string.IsNullOrEmpty(ticketCode) || x.TicketCode.Equals(ticketCode)))
                        join b in _context.MaterialProducts.Where(x => !x.IsDeleted) on a.ProductCode equals b.ProductCode
                        join c in _context.PackageObjects on a.PackCode equals c.PackCode
                        select new
                        {
                            Id = a.Id,
                            TicketCode = a.TicketCode,
                            ProductName = b.ProductName,
                            ProductCode = b.ProductCode,
                            //Quantity = a.Quantity,
                            //QuantityIsSet = a.QuantityIsSet,
                            //Unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.Unit).ValueSet,
                            //SalePrice = a.SalePrice,
                            //CurrencyCode = a.Currency,
                            //Currency = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.Currency).ValueSet,
                            //QrCode = CommonUtil.GeneratorQRCode(a.ProductCode),
                            //ProductQRCode = a.ProductQrCode,
                            //ProductNo = d != null ? d.ProductNo : /*a.ProductNo*/"",
                            //Remain = a.Quantity - a.QuantityIsSet,
                            //PackType = !string.IsNullOrEmpty(a.PackType) ? a.PackType : "",
                            //PackName = c != null ? c.PackName : "Chưa đóng gói",
                            PackCode = a.PackCode,
                            PackLot = a.PackLot,
                            PackName = c.PackName,
                            //SProductQrCode = CommonUtil.GenerateQRCode("SP:" + a.ProductQrCode + "_P:" + a.TicketCode + "_SL:" + a.Quantity),
                            //UnitCode = a.Unit,
                            //IsCustomized = a.IsCustomized,
                            //ProdCustomJson = a.ProdCustomJson,
                            //ImpType = a.ImpType,
                            //Status = a.Status,
                            //Serial = b.Serial,
                            //Weight = a.Weight
                            //IdProduct = e.Id
                        }).ToList().OrderByDescending(x => x.Id).GroupBy(x => new { x.PackCode, x.PackLot })
                        .Select(x => new { Code = x.Key.PackCode, Name = x.FirstOrDefault().PackName });
            return Json(data);
            //foreach (var item in data)
            //{
            //    if (!string.IsNullOrEmpty(item.Status))
            //    {
            //        var listItemStatus = (from a in item.Status.Split(",")
            //                              join b in listProdStatus on a.Trim() equals b.Code
            //                              select b.Name);
            //        item.ProductStatus = string.Join(", ", listItemStatus);
            //    }
            //    else
            //    {
            //        item.ProductStatus = "";
            //    }
            //}
            //return Json(data);
        }

        [HttpPost]
        public JsonResult GetProductDetailNew(string ticketCode)
        {
            var listProdStatus = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "PROD_STAT").OrderBy(x => x.ValueSet)
                .Select(x => new { Code = x.CodeSet, Name = x.ValueSet }).ToList();
            //var listTest = _context.BottleInStocks.Where(x => x.Id == 3).Include(x => x.Product).ToList();
            //var data = _context.ProductImportDetails.Where(x => !x.IsDeleted && x.TicketCode.Equals(ticketCode) && x.ImpType == "DEFAULT")
            //.Include(x => x.Product)
            //.Include(x => x.BottleDetails).ThenInclude(y => y.Product)
            //.Include(x => x.BottleInStocks).ThenInclude(y => y.Detail)
            //.Include(x => x.ProductInStocks).ThenInclude(y => y.Product)
            //.ToList();

            var data1 = (from a in _context.ProductImportDetails.Where(x => !x.IsDeleted && x.TicketCode.Equals(ticketCode))
                         join b in _context.MaterialProducts.Where(x => !x.IsDeleted) on a.ProductCode equals b.ProductCode
                         join b1 in _context.MaterialProductGroups.Where(x => !x.IsDeleted) on b.GroupCode equals b1.Code into b11
                         from b1 in b11.DefaultIfEmpty()
                         join c in _context.WarehouseRecordsPacks.Where(x => !x.IsDeleted) on a.PackCode equals c.PackCode into c1
                         from c in c1.DefaultIfEmpty()
                         join d in _context.ProductInStocks.Where(x => !x.IsDeleted && x.IdImpProduct.HasValue) on
                          new { IdImpProduct = a.Id, a.GattrCode } equals new { IdImpProduct = d.IdImpProduct.Value, d.GattrCode } into d1
                         from d in d1.DefaultIfEmpty()
                             //from e in _context.ProductInStocks.Where(x => !x.IsDeleted)
                             //where a.ProductCode == e.ProductCode && b1 != null && (b1.GroupType == "STATIC_TANK" || b1.GroupType == "BOTTLE")
                             //join e in _context.ProductInStocks.Where(x => !x.IsDeleted) on
                             // a.ProductCode equals e.ProductCode into e1
                             //from e in e1.DefaultIfEmpty()
                             //join f in _context.ProductLocatedMappings.Where(x => !x.IsDeleted) on
                             // a.ProductCode equals f.ProductCode into f1
                             //from f in f1.DefaultIfEmpty()
                             //join e in _context.MaterialProducts.Where(x => !x.IsDeleted) on a.ProductCode equals e.ProductCode
                         select new ProductImpDetail
                         {
                             Id = a.Id,
                             TicketCode = a.TicketCode,
                             ProductName = b.ProductName,
                             ProductCode = b.ProductCode,
                             Quantity = a.Quantity,
                             QuantityIsSet = a.QuantityIsSet,
                             Unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.Unit).ValueSet,
                             SalePrice = a.SalePrice,
                             CurrencyCode = a.Currency,
                             Currency = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.Currency).ValueSet,
                             QrCode = CommonUtil.GeneratorQRCode(a.ProductQrCode),
                             ProductQRCode = a.ProductQrCode,
                             ProductNo = d != null ? d.ProductNo : /*a.ProductNo*/"",
                             ProductNoImp = a.ProductNo,
                             GroupType = b1 != null ? b1.GroupType : "",
                             Remain = a.Quantity - a.QuantityIsSet,
                             PackType = !string.IsNullOrEmpty(a.PackType) ? a.PackType : "",
                             PackName = c != null ? c.PackName : "Chưa đóng gói",
                             PackCode = a.PackCode,
                             SProductQrCode = CommonUtil.GenerateQRCode("SP:" + a.ProductQrCode + "_P:" + a.TicketCode + "_SL:" + a.Quantity),
                             UnitCode = a.Unit,
                             IsCustomized = a.IsCustomized,
                             ProdCustomJson = a.ProdCustomJson,
                             ImpType = a.ImpType,
                             Status = a.Status,
                             Serial = b.Serial,
                             Weight = a.Weight,
                             IsSelected = false
                             //BottleWeight = e != null ? e.Weight : 0
                             //IdProduct = e.Id
                         }).ToList().DistinctBy(x => x.Id).OrderByDescending(x => x.Id);
            foreach (var item in data1)
            {
                if (!string.IsNullOrEmpty(item.Status))
                {
                    var listItemStatus = (from a in item.Status.Split(",")
                                          join b in listProdStatus on a.Trim() equals b.Code
                                          select b.Name);
                    item.ProductStatus = string.Join(", ", listItemStatus);
                }
                else
                {
                    item.ProductStatus = "";
                }
                item.ListPosition = GetDetailPostion(item.Id, item.GroupType, item.ProductCode);
                item.IsTankStatic = item.GroupType == "STATIC_TANK";
                if (item.GroupType == "STATIC_TANK")
                {
                    item.ProductNoInput = "1";
                }
                //item.SumSalePrice = item.ListBottleDetails.Sum(x => x.SalePrice ?? 0);
            }
            //var resultData = new List<ProductImpDetail>();
            //var result = data.GroupBy(x => x.Id);
            //foreach (var item in result)
            //{
            //    var itemDetail = item.FirstOrDefault();
            //    var listAllProductNo = item.SelectMany(x => ListProdStrNoHelper.GetListProdStrNo(x.ProductNo)).ToList();
            //    itemDetail.ProductNo = listAllProductNo.ToString();
            //    resultData.Add(itemDetail);
            //}
            return Json(data1);
        }

        private List<DetailPosition> GetDetailPostion(int idImportProduct, string groupType, string productCode)
        {
            if (groupType == "STATIC_TANK")
            {
                return _context.ProductLocatedMappings.Where(x => !x.IsDeleted && x.ProductCode == productCode)
                    .Select(x => new DetailPosition
                    {
                        ProductNo = x.ProductNo,
                        PositionInStore = !string.IsNullOrEmpty(x.MappingCode) ? x.MappingCode : "Không xác định"
                    }).ToList();
            }
            return _context.ProductLocatedMappings.Where(x => !x.IsDeleted && x.IdImpProduct == idImportProduct)
                    .Select(x => new DetailPosition
                    {
                        ProductNo = x.ProductNo,
                        PositionInStore = !string.IsNullOrEmpty(x.MappingCode) ? x.MappingCode : "Không xác định"
                    }).ToList();
        }

        [HttpPost]
        public object GetListCustomerImp()
        {
            var mess = new JMessage { Error = false, Title = "" };
            try
            {
                mess.Object = _context.Customerss.Where(x => !x.IsDeleted && x.ActivityStatus == "CUSTOMER_ACTIVE")
                    .OrderBy(x => x.CusName).Select(x => new { Code = x.CusCode, Name = x.CusName });
            }
            catch (Exception ex)
            {
                mess.Error = true;
            }

            return Json(mess);
        }

        [HttpPost]
        public object GetListReasonImp()
        {
            var msg = new JMessage();
            try
            {
                msg.Object = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "IMP_REASON")
                    .OrderBy(x => x.ValueSet).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra";
            }

            return Json(msg);

        }

        [HttpPost]
        public object GetListProductImp(int pageNo = 1, int pageSize = 10, string content = "", string productCode = "")
        {
            var msg = new JMessage();
            //var data = _context.QuizPools.Where(x => !x.IsDeleted).Select(x => new { Code = x.Code, Content = x.Content }).ToList();
            try
            {
                var search = !string.IsNullOrEmpty(content) ? content : "";
                var productcode = !string.IsNullOrEmpty(productCode) ? productCode : "";
                var groupCode = "";
                //var searchStore = !string.IsNullOrEmpty(storeCode) ? storeCode : "";
                string[] param = new string[] { "@pageNo", "@pageSize", "@content", "@productCode", "@group" };
                object[] val = new object[] { pageNo, pageSize, search, productcode, groupCode };
                DataTable rs = _repositoryService.GetDataTableProcedureSql("[P_GET_LIST_PRODUCT_CAT_NOT_FUEL]", param, val);
                msg.Object = CommonUtil.ConvertDataTable<MaterialProductInStock>(rs)
                    .Select(b => new
                    {
                        Id = b.Id,
                        Code = b.ProductCode,
                        Name = $"{b.ProductName} - {b.ProductCode}",
                        Unit = b.Unit,
                        ProductCode = b.ProductCode,
                        UnitName = b.UnitName,
                        AttributeCode = "",
                        AttributeName = "",
                        ProductType = b.TypeCode,
                        ImpType = b.ImpType,
                        Serial = b.Serial,
                        Image = b.Image
                    }).ToList();
                //return query;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra";
            }
            return Json(msg);
        }


        public class ProductDetailModel
        {
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string ProductCode { get; set; }
            public string ReasonName { get; set; }
            public string ProdStatus { get; set; }
            public string Supplier { get; set; }
            public string UserImport { get; set; }
            public int CurrentPageView { get; set; }
            public int Length { get; set; }
        }
        [HttpPost]
        public JsonResult GetProductDetailImpNew(ProductDetailModel obj)
        {
            int intBeginFor = (obj.CurrentPageView - 1) * obj.Length;
            var fromDate = !string.IsNullOrEmpty(obj.FromDate)
              ? DateTime.ParseExact(obj.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture)
              : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(obj.ToDate)
                ? DateTime.ParseExact(obj.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture)
                : (DateTime?)null;
            var listProdStatus = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "PROD_STAT").OrderBy(x => x.ValueSet)
                .Select(x => new { Code = x.CodeSet, Name = x.ValueSet }).ToList();
            var query = (from a in _context.ProductImportDetails.Where(x => !x.IsDeleted)
                         join h in _context.ProductImportHeaders.Where(x => !x.IsDeleted) on a.TicketCode equals h.TicketCode
                         join b in _context.MaterialProducts.Where(x => !x.IsDeleted) on a.ProductCode equals b.ProductCode
                         join c in _context.WarehouseRecordsPacks.Where(x => !x.IsDeleted) on a.PackCode equals c.PackCode into c1
                         from c in c1.DefaultIfEmpty()
                         join d in _context.ProductInStocks.Where(x => !x.IsDeleted && x.IdImpProduct.HasValue) on
                          new { IdImpProduct = a.Id, a.GattrCode } equals new { IdImpProduct = d.IdImpProduct.Value, d.GattrCode } into d1
                         from d in d1.DefaultIfEmpty()
                         where (string.IsNullOrEmpty(obj.ProductCode) || (a.ProductCode == obj.ProductCode))
                                && (string.IsNullOrEmpty(obj.Supplier) || (h.SupCode == obj.Supplier))
                                && (string.IsNullOrEmpty(obj.ReasonName) || (h.Reason == obj.ReasonName))
                                && (string.IsNullOrEmpty(obj.FromDate) || (h.TimeTicketCreate >= fromDate))
                                && (string.IsNullOrEmpty(obj.ToDate) || (h.TimeTicketCreate <= toDate))
                         select new ProductImpDetail
                         {
                             Id = a.Id,
                             TicketCode = a.TicketCode,
                             ProductName = b.ProductName,
                             ProductCode = b.ProductCode,
                             Quantity = a.Quantity,
                             QuantityIsSet = a.QuantityIsSet,
                             Unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.Unit).ValueSet,
                             SalePrice = a.SalePrice,
                             CurrencyCode = a.Currency,
                             Currency = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.Currency).ValueSet,
                             QrCode = CommonUtil.GeneratorQRCode(a.ProductCode),
                             ProductQRCode = a.ProductQrCode,
                             ProductNo = d != null ? d.ProductNo : /*a.ProductNo*/"",
                             Remain = a.Quantity - a.QuantityIsSet,
                             PackType = !string.IsNullOrEmpty(a.PackType) ? a.PackType : "",
                             PackName = c != null ? c.PackName : "Chưa đóng gói",
                             PackCode = a.PackCode,
                             SProductQrCode = CommonUtil.GenerateQRCode("SP:" + a.ProductQrCode + "_P:" + a.TicketCode + "_SL:" + a.Quantity),
                             UnitCode = a.Unit,
                             IsCustomized = a.IsCustomized,
                             ProdCustomJson = a.ProdCustomJson,
                             ImpType = a.ImpType,
                             Status = a.Status,
                         });

            query = query.Skip(intBeginFor).Take(obj.Length).AsNoTracking();

            var data = query.ToList();
            foreach (var item in data)
            {
                if (!string.IsNullOrEmpty(item.Status))
                {
                    var listItemStatus = (from a in item.Status.Split(",")
                                          join b in listProdStatus on a.Trim() equals b.Code
                                          select b.Name);
                    item.ProductStatus = string.Join(", ", listItemStatus);
                }
                else
                {
                    item.ProductStatus = "";
                }
            }
            return Json(data);
        }

        [HttpPost]
        public JsonResult UpdateDetailImp(ProductImportDetail obj)
        {
            var msg = new JMessage();
            try
            {
                var data = _context.ProductImportDetails.FirstOrDefault(x => !x.IsDeleted && x.Id == obj.Id);
                if (data != null)
                {
                    var checkExport = _context.ProductExportDetails.Where(x =>
                        !x.IsDeleted && x.ProductQrCode.Equals(data.ProductQrCode));
                    if (checkExport.Any())
                    {
                        msg.Error = true;
                        msg.Title = "Sản phẩm đã được xếp kho hoặc có trong phiếu xuất kho không được phép sửa!";
                        return Json(msg);
                    }

                    var addQuantity = obj.Quantity - data.Quantity;
                    data.Quantity = obj.Quantity;
                    data.UpdatedBy = obj.UpdatedBy;
                    data.DeletedTime = DateTime.Now;
                    _context.ProductImportDetails.Update(data);

                    var prodInStock = _context.ProductInStocks.FirstOrDefault(x =>
                        x.ProductQrCode.Equals(data.ProductQrCode) && !x.IsDeleted);
                    prodInStock.Quantity = prodInStock.Quantity + addQuantity;
                    _context.ProductInStocks.Update(prodInStock);

                    //Delete mapping
                    //var mapping = _context.ProductLocatedMappings.Where(x => !x.IsDeleted &&
                    //                                                        x.ProductQrCode.Equals(data.ProductQrCode)
                    //                                                        && x.TicketImpCode.Equals(data.TicketCode));
                    //if (mapping.Any())
                    //{
                    //    foreach (var item in mapping)
                    //    {
                    //        item.IsDeleted = true;
                    //        var stockArrangePut =
                    //            _context.StockArrangePutEntrys.FirstOrDefault(x => x.MapId == item.Id);
                    //        if (stockArrangePut != null)
                    //            _context.StockArrangePutEntrys.Remove(stockArrangePut);
                    //    }
                    //}

                    _context.SaveChanges();
                    msg.Title = "Cập nhật thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Không tìm thấy dữ liệu";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra";
            }

            return Json(msg);
        }

        [HttpPost]
        public async Task<JMessage> DeleteDetailImp(int id, string userName)
        {
            var msg = new JMessage();
            try
            {
                var data = _context.ProductImportDetails.FirstOrDefault(x => !x.IsDeleted && x.Id == id);
                if (data != null)
                {
                    var checkExport = _context.ProductExportDetails.Where(x =>
                        !x.IsDeleted && x.ProductQrCode.Equals(data.ProductQrCode));
                    if (checkExport.Any())
                    {
                        msg.Error = true;
                        msg.Title = "Sản phẩm đã được xếp kho hoặc có trong phiếu xuất kho không được phép xóa !";
                        return msg;
                    }

                    data.IsDeleted = true;
                    data.DeletedBy = userName;
                    data.DeletedTime = DateTime.Now;
                    _context.ProductImportDetails.Update(data);

                    //Delete stock
                    var stocking = _context.ProductInStocks.Include(x => x.Product).ThenInclude(x => x.Group)
                        .Where(x => !x.IsDeleted && x.IdImpProduct.Equals(data.Id));
                    if (stocking.Any(x => x.Product != null && x.Product.Group != null && x.Product.Group.GroupType != "STATIC_TANK"))
                    {
                        foreach (var item in stocking)
                        {
                            item.IsDeleted = true;
                            item.DeletionToken = Guid.NewGuid().ToString();
                            //var stockArrangePut = _context.StockArrangePutEntrys.FirstOrDefault(x => x.MapId == item.Id);
                            //if (stockArrangePut != null)
                            //    _context.StockArrangePutEntrys.Remove(stockArrangePut);
                        }
                    }

                    //Delete mapping
                    var mapping = _context.ProductLocatedMappings.Include(x => x.Product).ThenInclude(x => x.Group)
                        .Where(x => !x.IsDeleted && x.IdImpProduct.Equals(data.Id));
                    if (mapping.Any(x => x.Product != null && x.Product.Group != null && x.Product.Group.GroupType != "STATIC_TANK"))
                    {
                        foreach (var item in mapping)
                        {
                            item.IsDeleted = true;
                            item.DeletionToken = Guid.NewGuid().ToString();
                            //var stockArrangePut = _context.StockArrangePutEntrys.FirstOrDefault(x => x.MapId == item.Id);
                            //if (stockArrangePut != null)
                            //    _context.StockArrangePutEntrys.Remove(stockArrangePut);
                        }
                    }

                    await _context.SaveChangesAsync();
                    msg.Title = "Xóa thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Không tìm thấy dữ liệu";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra";
            }

            return msg;
        }

        [HttpPost]
        public JsonResult GetInfoProduct(string product, string ticket)
        {
            var attrValue = _context.ProdReceivedAttrValues.Where(x =>
                x.ProdCode.Equals(product) && !x.IsDeleted && x.TicketImpCode.Equals(ticket));
            var data = (from a in _context.MaterialProducts.Where(x => !x.IsDeleted && x.ProductCode.Equals(product))
                        join b in _context.MaterialProductGroups.Where(x => !x.IsDeleted) on a.GroupCode equals b.Code into b1
                        from b in b1.DefaultIfEmpty()
                        join c in _context.CommonSettings.Where(x => !x.IsDeleted) on a.UnitWeight equals c.CodeSet into c1
                        from c2 in c1.DefaultIfEmpty()
                        select new InfoProduct
                        {
                            Packing = attrValue.Any()
                                ? attrValue.FirstOrDefault(x => x.Code == "PACK_ATTR") != null
                                    ?
                                    attrValue.FirstOrDefault(x => x.Code == "PACK_ATTR").Value
                                    : a.Packing
                                : a.Packing,
                            High = a.High,
                            Wide = a.Wide,
                            Long = a.Long,
                            Weight = a.Weight,
                            UnitWeight = c2 != null ? c2.ValueSet : "",
                            GroupType = b != null ? b.GroupType : "",
                            GroupCode = a.GroupCode
                        }).FirstOrDefault();
            var digits = new[] { '0', '1', '2', '3', '4', '5', '6', '7', '8', '9' };
            var startCode = product.TrimEnd(digits);
            var listNumberString = _context.MaterialProducts.Where(x => !x.IsDeleted && x.ProductCode.StartsWith(startCode))
                .ToList().Select(x => GetNumberInEndOfString(x.ProductCode));
            var listNumber = listNumberString.Select(delegate (string input)
            {
                if (string.IsNullOrEmpty(input))
                {
                    return -1;
                }
                else
                {
                    return int.Parse(input);
                }
            });
            var minNumber = listNumber.Min() != -1 ? listNumber.Min() : 1;
            data.MinNumber = minNumber;
            //var objUsed = (from a in _context.ProductInStocks.Where(x => !x.IsDeleted && x.ProductCode == product)
            //join b in _context.ProductImportDetails
            //.Include(x => x.Product)
            //.ThenInclude(x => x.Group)
            //.Where(x => !x.IsDeleted) on a.ParentId equals b.Id
            //select b).ToList().FirstOrDefault(x => x.Product.GroupCode != fuelCode);
            //data.IsUsed = objUsed != null;
            //data.FuelName = objUsed?.Product?.Group?.Name;
            return Json(data);
        }

        private string GetNumberInEndOfString(string input)
        {
            return string.Concat(input.ToArray().Reverse().TakeWhile(char.IsNumber).Reverse());
        }

        [HttpGet]
        public JsonResult UnitFromPack(string json)
        {
            var msg = new JMessage();
            try
            {
                var data = JsonConvert.DeserializeObject<JsonPackValue>(json);
                if (data != null)
                {
                    InsertUnitFromPack(json);
                    _context.SaveChanges();
                    var lstJson = new List<string>();
                    if (!string.IsNullOrEmpty(data.A.Key))
                    {
                        lstJson.Add(data.A.Key);
                        if (!string.IsNullOrEmpty(data.B.Key))
                            lstJson.Add(data.B.Key);
                        if (!string.IsNullOrEmpty(data.C.Key))
                            lstJson.Add(data.C.Key);
                        if (!string.IsNullOrEmpty(data.D.Key))
                            lstJson.Add(data.D.Key);
                    }

                    var units = (from a in _context.CommonSettings.Where(x =>
                            !x.IsDeleted && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)))
                                 join b in lstJson on a.ValueSet.ToLower() equals b.ToLower()
                                 select new
                                 {
                                     Code = a.CodeSet,
                                     Name = a.ValueSet
                                 }).DistinctBy(x => x.Name);
                    msg.Object = units;
                }
            }
            catch (Exception ex)
            {

            }

            return Json(msg);
        }

        [NonAction]
        public void InsertUnitFromPack(string json)
        {
            try
            {
                var data = JsonConvert.DeserializeObject<JsonPackValue>(json);
                if (data != null)
                {
                    var units = _context.CommonSettings
                        .Where(x => x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit))
                        .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                    if (!string.IsNullOrEmpty(data.A.Key))
                    {
                        var check = units.Any(x => x.Name.ToLower().Equals(data.A.Key.ToLower()));
                        if (!check)
                        {
                            InsertUnit(data.A.Key);
                        }
                    }

                    if (!string.IsNullOrEmpty(data.B.Key))
                    {
                        var check = units.Any(x => x.Name.ToLower().Equals(data.B.Key.ToLower()));
                        if (!check)
                        {
                            InsertUnit(data.B.Key);
                        }
                    }

                    if (!string.IsNullOrEmpty(data.C.Key))
                    {
                        var check = units.Any(x => x.Name.ToLower().Equals(data.C.Key.ToLower()));
                        if (!check)
                        {
                            InsertUnit(data.C.Key);
                        }
                    }

                    if (!string.IsNullOrEmpty(data.D.Key))
                    {
                        var check = units.Any(x => x.Name.ToLower().Equals(data.D.Key.ToLower()));
                        if (!check)
                        {
                            InsertUnit(data.D.Key);
                        }
                    }
                }
            }
            catch (Exception ex)
            {

            }
        }

        [NonAction]
        public void InsertUnit(string value)
        {
            var unit = new CommonSetting
            {
                CodeSet = EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit) +
                          DateTime.Now.ToString("yyyyMMddHHmmss"),
                ValueSet = value,
                CreatedBy = ESEIM.AppContext.UserName,
                CreatedTime = DateTime.Now,
                Group = EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)
            };
            _context.CommonSettings.Add(unit);
        }

        [HttpPost]
        public JsonResult JTableImp(JTableModelMaterialStoreImpGoodsHeaders jTablePara, int userType = 0)
        {
            var msg = new JMessage();
            try
            {
                int intBeginFor = (jTablePara.CurrentPageView - 1) * jTablePara.Length;

                var query = FuncJTableImp(userType, jTablePara.Title, jTablePara.SupCode, jTablePara.StoreCode,
                    jTablePara.UserImport, jTablePara.FromDate, jTablePara.ToDate, jTablePara.ReasonName, jTablePara.SupplierName);

                var count = query.Count();
                var data = query.OrderByDescending(x => x.Id).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking()
                    .ToList();
                msg.Object = new
                {
                    data = data,
                    count = count,
                };
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra";
            }

            return Json(msg);
        }

        [NonAction]
        public IQueryable<MaterialStoreImpModel> FuncJTableImp(int userType, string Title, string SupCode,
            string StoreCode, string UserImport, string FromDate, string ToDate, string ReasonName, string SupplierName)
        {
            //var session = HttpContext.GetSessionUser();

            var fromDate = !string.IsNullOrEmpty(FromDate)
                ? DateTime.ParseExact(FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture)
                : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(ToDate)
                ? DateTime.ParseExact(ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture)
                : (DateTime?)null;

            var query = (from a in _context.ProductImportHeaders.Where(x => x.IsDeleted != true).AsNoTracking()
                             //join c in _context.PAreaMappingsStore.Where(x => !x.IsDeleted && x.ObjectType == "AREA") on a.StoreCode equals c.ObjectCode
                             //into c1
                             //from c in c1.DefaultIfEmpty()
                             //join f in _context.PAreaCategoriesStore.Where(x => x.IsDeleted == false && x.PAreaType == "AREA") on c.CategoryCode equals f.Code
                             //into f1
                             //from f in f1.DefaultIfEmpty()
                         join f in _context.EDMSWareHouses.Where(x => !x.WHS_Flag) on a.StoreCode equals f.WHS_Code into f1
                         from f in f1.DefaultIfEmpty()
                         join d in _context.Users.Where(x => x.Active) on a.UserImport equals d.UserName
                         join e in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "IMP_REASON") on a.Reason equals
                             e.CodeSet into e1
                         from e in e1.DefaultIfEmpty()
                             //field khách hàng trong phiếu nhập chính là nhà cung cấp (hiện tại chưa sửa)
                         join b in _context.Suppliers.Where(x => x.IsDeleted != true) on a.SupCode equals b.SupCode into b1
                         from b2 in b1.DefaultIfEmpty()
                         where
                             (string.IsNullOrEmpty(Title) ||
                              (!string.IsNullOrEmpty(a.Title) && a.Title.ToLower().Contains(Title.ToLower())))
                             && (string.IsNullOrEmpty(SupCode) || (a.SupCode == SupCode))
                             && (string.IsNullOrEmpty(StoreCode) || (a.StoreCode == StoreCode))
                             && (string.IsNullOrEmpty(UserImport) || (a.UserImport == UserImport))
                             && (string.IsNullOrEmpty(FromDate) || (a.TimeTicketCreate >= fromDate))
                             && (string.IsNullOrEmpty(ToDate) || (a.TimeTicketCreate <= toDate))
                             && (string.IsNullOrEmpty(ReasonName) || (a.Reason == ReasonName))
                             && (string.IsNullOrEmpty(SupplierName) || (b2.SupName == SupplierName))
                         //Điều kiện phân quyền dữ liệu
                         //&& (userType == 10
                         //       || (userType == 2 && session.ListUserOfBranch.Any(x => x == a.CreatedBy))
                         //       || (userType == 0 && session.UserName == a.CreatedBy)
                         //   )
                         select new MaterialStoreImpModel
                         {
                             Id = a.Id,
                             TicketCode = a.TicketCode,
                             CusCode = a.SupCode,
                             CusName = b2 != null ? b2.SupName : "",
                             StoreCode = a.StoreCode,
                             StoreName = f != null ? f.WHS_Name : "",
                             Title = a.Title,
                             UserImport = a.UserImport,
                             UserImportName = d.GivenName,
                             UserSend = a.UserSend,
                             Note = a.Note,
                             PositionGps = a.PositionGps,
                             PositionText = a.PositionText,
                             FromDevice = a.FromDevice,
                             TotalPayed = a.TotalPayed,
                             TotalMustPayment = a.TotalMustPayment,
                             InsurantTime = a.InsurantTime,
                             TimeTicketCreate = a.TimeTicketCreate,
                             NextTimePayment = a.NextTimePayment,
                             Reason = a.Reason,
                             ReasonName = e.ValueSet,
                             StoreCodeSend = a.StoreCodeSend,
                             CreatedBy = a.CreatedBy,
                             CreatedTime = a.CreatedTime
                         });
            return query;
        }

        // category
        [HttpPost]
        public object GetListProductCategory(int pageNo = 1, int pageSize = 10, string content = "", string productCode = "", string group = "")
        {
            //var data = _context.QuizPools.Where(x => !x.IsDeleted).Select(x => new { Code = x.Code, Content = x.Content }).ToList();
            var search = !string.IsNullOrEmpty(content) ? content : "";
            var productcode = !string.IsNullOrEmpty(productCode) ? productCode : "";
            var groupCode = !string.IsNullOrEmpty(group) ? group : "";
            //var searchStore = !string.IsNullOrEmpty(storeCode) ? storeCode : "";
            string[] param = new string[] { "@pageNo", "@pageSize", "@content", "@productCode", "@group" };
            object[] val = new object[] { pageNo, pageSize, search, productcode, groupCode };
            DataTable rs = _repositoryService.GetDataTableProcedureSql("[P_GET_LIST_PRODUCT_CAT_NOT_FUEL]", param, val);
            var data = CommonUtil.ConvertDataTable<MaterialProductInStock>(rs)
                .Select(b => new
                {
                    Id = b.Id,
                    Code = b.ProductCode,
                    Name = $"{b.ProductName} - {b.ProductCode}",
                    Unit = b.Unit,
                    ProductCode = b.ProductCode,
                    UnitName = b.UnitName,
                    AttributeCode = "",
                    AttributeName = "",
                    ProductType = b.TypeCode,
                    ImpType = b.ImpType,
                    Serial = b.Serial,
                    Image = b.Image
                }).ToList();
            //return query;
            return data;
        }

        // mapping
        [HttpPost]
        public object GetListProductMapping(int pageNo = 1, int pageSize = 10, string content = "", int id = -1)
        {
            //var data = _context.QuizPools.Where(x => !x.IsDeleted).Select(x => new { Code = x.Code, Content = x.Content }).ToList();
            var search = !string.IsNullOrEmpty(content) ? content : "";
            //var searchStore = !string.IsNullOrEmpty(storeCode) ? storeCode : "";
            string[] param = new string[] { "@pageNo", "@pageSize", "@content", "@productCode", "@group", "@store", "@id" };
            object[] val = new object[] { pageNo, pageSize, search, "", "", "", id };
            DataTable rs = _repositoryService.GetDataTableProcedureSql("[P_GET_LIST_PRODUCT_MAPPING]", param, val);
            var data = CommonUtil.ConvertDataTable<MaterialProductInStock>(rs)
                .Select(b => new
                {
                    IdImpProduct = b.IdImpProduct,
                    Id = b.IdMapping,
                    Code = b.ProductCode,
                    Name = $"{b.ProductName} - {b.ProductCode} [ {b.IdImpProduct} - {(b.CreatedTimeMapping.HasValue ? b.CreatedTimeMapping.Value.ToString("dd/MM/yyyy HH:mm") : "")} - {b.MappingCode} ]",
                    Unit = b.Unit,
                    ProductCode = b.ProductCode,
                    ProductNo = b.ProductNo,
                    UnitName = b.UnitName,
                    AttributeCode = "",
                    AttributeName = "",
                    ProductType = b.TypeCode,
                    ImpType = b.ImpType
                }).ToList();
            //return query;
            return data;
        }

        // Thanh phan
        [HttpPost]
        public object GetListComponentProduct(string productCode)
        {
            JMessage msg = new JMessage();
            try
            {
                msg.Object = from a in _context.ProductComponents
                             where a.ProductCode == productCode
                                   && a.IsDeleted == false
                             orderby a.Id descending
                             select new
                             {
                                 a.Id,
                                 a.Code,
                                 Name = _context.MaterialProducts.FirstOrDefault(x => x.IsDeleted == false && a.Code == x.ProductCode).ProductName,
                                 a.Quantity,
                                 UnitName = _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(a.Unit)) != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(a.Unit)).ValueSet : "",
                                 UnitCode = a.Unit,
                                 a.CreatedTime,
                             };
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi xóa !";
            }

            return Json(msg);
        }
        // Thanh phan
        [HttpPost]
        public object GetAttributeMoreProduct(string productCode)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                msg.Object = from a in _context.ProductAttrGalaxys
                             join b in _context.AttrGalaxys on a.AttrCode equals b.Code into b1
                             from b2 in b1.DefaultIfEmpty()
                             where a.ProductCode == productCode
                                   && a.IsDeleted == false
                             orderby a.Id descending
                             select new
                             {
                                 a.Id,
                                 a.AttrCode,
                                 AttrName = b2 != null ? b2.Name : "",
                                 a.AttrValue,
                                 a.CreatedTime,
                                 UnitCode = b2.Unit,
                                 UnitName = _context.CommonSettings.FirstOrDefault(y => y.CodeSet.Equals(b2.Unit)) != null
                                 ? _context.CommonSettings.FirstOrDefault(y => y.CodeSet.Equals(b2.Unit)).ValueSet
                                 : "",
                                 Group = b2 != null
                                     ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b2.Group)) != null
                                         ?
                                         _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b2.Group)).ValueSet
                                         : ""
                                     : "",
                                 DataType = b2 != null
                                     ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b2.DataType)) != null
                                         ?
                                         _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b2.DataType)).ValueSet
                                         : ""
                                     : "",
                                 Parent = b2 != null
                                     ? _context.AttrGalaxys.FirstOrDefault(x => x.Code.Equals(b2.Parent)) != null
                                         ?
                                         _context.AttrGalaxys.FirstOrDefault(x => x.Code.Equals(b2.Parent)).Name
                                         : ""
                                     : ""
                             };

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra khi xóa!";
                msg.Object = ex;
            }

            return Json(msg);
        }
        [HttpPost]
        public JsonResult GetListProductAttributeMain()
        {
            JMessage msg = new JMessage();
            try
            {
                var data = _context.AttrGalaxys.Where(x => !x.IsDeleted).Select(x => new
                {
                    x.Code,
                    x.Name,
                    UnitCode = x.Unit,
                    UnitName = _context.CommonSettings.FirstOrDefault(y => y.CodeSet.Equals(x.Unit)) != null
                        ?
                        _context.CommonSettings.FirstOrDefault(y => y.CodeSet.Equals(x.Unit)).ValueSet
                        : "",
                    GroupCode = x.Group,
                    Group = _context.CommonSettings.FirstOrDefault(y => y.CodeSet.Equals(x.Group)) != null
                        ?
                        _context.CommonSettings.FirstOrDefault(y => y.CodeSet.Equals(x.Group)).ValueSet
                        : "",
                    DataTypeCode = x.DataType,
                    DataType = _context.CommonSettings.FirstOrDefault(y => y.CodeSet.Equals(x.DataType)) != null
                        ?
                        _context.CommonSettings.FirstOrDefault(y => y.CodeSet.Equals(x.DataType)).ValueSet
                        : "",
                    ParentCode = x.Parent,
                    Parent = _context.AttrGalaxys.FirstOrDefault(y => y.Code.Equals(x.Parent)) != null
                        ?
                        _context.AttrGalaxys.FirstOrDefault(y => y.Code.Equals(x.Parent)).Name
                        : ""
                });
                if (data == null)
                {
                    msg.Error = true;
                }
                else
                {
                    msg.Error = false;
                    msg.Object = data;
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
            }

            return Json(msg);
        }
        //json
        [HttpPost]
        public object GetMappingJson(int parentMappingId)
        {
            var parentMapping = _context.ProductLocatedMappings.FirstOrDefault(x => !x.IsDeleted && x.Id == parentMappingId);
            if (parentMapping != null)
            {
                var groupAttribute = _context.ProductGattrExts.FirstOrDefault(x => !x.IsDeleted && x.GattrCode == parentMapping.GattrCode);
                return groupAttribute?.GattrJson;
            }
            return null;
        }
        // xep kho
        [HttpPost]
        private decimal getProductInRack(string RackCode)
        {
            decimal count = 0;
            var query = from a in _context.EDMSRacks.Where(x => x.RackCode == RackCode)
                        join d in _context.ProductLocatedMappings.Where(x => x.IsDeleted == false) on a.RackCode equals d
                            .RackCode
                        select new
                        {
                            a.RackCode,
                            d.Quantity
                        };
            count = query.Sum(x => x.Quantity).Value;
            return count;
        }

        [HttpPost]
        public object GetListLine(string storeCode)
        {
            var msg = new JMessage();
            try
            {
                var rs = (from a in _context.EDMSFloors.Where(x => x.WHS_Code == storeCode && x.Status == "1")
                          join b in _context.EDMSLines on a.FloorCode equals b.FloorCode
                          select b).ToList();

                for (int i = 0; i < rs.Count; i++)
                {
                    var listRack = _context.EDMSRacks.Where(x => x.LineCode.Equals(rs[i].LineCode)).ToList();
                    if (listRack.Count > 0)
                    {
                        foreach (var rack in listRack)
                        {
                            var checkCount = GetQuantityEmptyInRack(rack.RackCode);
                            if (checkCount.Equals("..."))
                            {
                                rs.RemoveAt(i);
                                i--;
                            }
                        }

                        var temp = new List<EDMSFile>();
                    }
                    else
                    {
                        rs.RemoveAt(i);
                        i--;
                    }
                }

                ;

                msg.Object = rs;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra!";
            }

            return Json(msg);
        }

        [HttpPost]
        public object GetListRackByLineCode(string lineCode)
        {
            var msg = new JMessage();
            try
            {
                var listRack = _context.EDMSRacks.Where(x => x.LineCode.Equals(lineCode) && x.R_Status == "1").ToList();

                for (int i = 0; i < listRack.Count; i++)
                {
                    var checkCount = GetQuantityEmptyInRack(listRack[i].RackCode);
                    if (checkCount.Equals("..."))
                    {
                        listRack.RemoveAt(i);
                    }
                }

                msg.Object = listRack;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra!";
            }

            return Json(msg);
        }

        [HttpPost]
        public object GetListLineImp(string storeCode)
        {
            var msg = new JMessage();
            try
            {
                var rs = (from a in _context.EDMSFloors.Where(x => x.WHS_Code == storeCode && x.Status == "1")
                          join b in _context.EDMSLines on a.FloorCode equals b.FloorCode
                          select b).ToList();

                for (int i = 0; i < rs.Count; i++)
                {
                    var listRack = _context.EDMSRacks.Where(x => x.LineCode.Equals(rs[i].LineCode)).ToList();
                    if (listRack.Count > 0)
                    {
                        foreach (var rack in listRack)
                        {
                            var checkCount = GetQuantityEmptyInRack(rack.RackCode);
                            if (checkCount.Equals("..."))
                            {
                                rs.RemoveAt(i);
                                i--;
                            }
                        }

                        var temp = new List<EDMSFile>();
                    }
                    else
                    {
                        rs.RemoveAt(i);
                        i--;
                    }
                }

                ;
                msg.Object = rs;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra!";
            }

            return Json(msg);
        }

        [HttpPost]
        public async Task<JMessage> OrderMultiProduct([FromBody] List<ProductCrudMapping> data)
        {
            var msg = new JMessage();
            foreach (var item in data)
            {
                msg = await OrderProductVatco(item);
                if (msg.Error)
                {
                    return msg;
                }
            }
            return msg;
        }

        [HttpPost]
        public async Task<JMessage> OrderProductVatco(ProductCrudMapping data)
        {
            var msg = new JMessage();
            try
            {
                var prodDetail = _context.ProductImportDetails.Include(x => x.Product).ThenInclude(x => x.Group)
                    .AsNoTracking().FirstOrDefault(x => !x.IsDeleted && x.Id.Equals(data.IdImpProduct));
                if (prodDetail?.Product?.Group?.GroupType == "STATIC_TANK")
                {
                    return await OrderProductStaticTank(data);
                }
                else
                {
                    var prodInStock = prodDetail != null ? _context.ProductInStocks.FirstOrDefault(x => !x.IsDeleted && x.IdImpProduct == data.IdImpProduct
                     && x.GattrCode == prodDetail.GattrCode) : null;
                    //var listAllProductNo = _context.ProductInStocks.Where(x => !x.IsDeleted
                    //&& x.Id.Equals(data.IdImpProduct)).ToList()
                    //.SelectMany(x => ListProdStrNoHelper.GetListProdStrNo(x.ProductNo)).ToList();
                    var listProdNo = new List<ProdStrNo>();
                    try
                    {
                        listProdNo = ListProdStrNoHelper.GetListProdStrNo(data.ProductNo);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.Message);
                    }
                    if (listProdNo.Count == 0)
                    {
                        msg.Error = true;
                        msg.Title = "Thứ tự không hợp lệ!";
                        return msg;
                    }
                    //var testMapping = _context.ProductLocatedMappings.FirstOrDefault(x => !x.IsDeleted && x.Id == obj.ParentMappingId);
                    var checkMapping = prodInStock != null ? prodInStock.ListProdStrNo.ContainsRange(listProdNo) : false;
                    if (checkMapping == false)
                    {
                        msg.Error = true;
                        msg.Title = "Thứ tự không tồn tại trong dãy!";
                        return msg;
                    }
                    var checkProdDetailIntersect = _context.ProductLocatedMappings.Where(x => !x.IsDeleted && x.IdImpProduct == data.IdImpProduct)
                        .ToList().Any(x => x.ListProdStrNo.IsIntersect(listProdNo));
                    if (checkProdDetailIntersect == true)
                    {
                        msg.Error = true;
                        msg.Title = "Thứ tự đã được xếp!";
                        return msg;
                    }

                    //var rack = _context.EDMSRacks.FirstOrDefault(x => x.RackCode == data.RackCode);
                    //var productInRackCount = getProductInRack(data.RackCode);

                    if (prodDetail != null || true)
                    {
                        var quantity = listProdNo.SumQuantity();
                        //if (((prodDetail.QuantityIsSet ?? 0) + quantity) > prodDetail.Quantity)
                        //{
                        //    msg.Error = true;
                        //    msg.Title = "Số lượng nhập không hợp lệ";
                        //    return Json(msg);
                        //}
                        //var listProductNo = Enumerable.Range(decimal.ToInt32(prodDetail.QuantityIsSet ?? 0) + 1, decimal.ToInt32(data.Quantity ?? 1)).ToList();
                        //Thêm vào bảng Product_Entity_Mapping
                        var newId = -1;
                        var checkLocated = _context.ProductLocatedMappings.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == data.ProductCode
                        && x.IdImpProduct == data.IdImpProduct && x.GattrCode == prodDetail.GattrCode && x.MappingCode == data.MappingCode);
                        if (checkLocated == null)
                        {
                            var mapping = new ProductLocatedMapping
                            {
                                IdImpProduct = data.IdImpProduct,
                                //ListProductNo = listProductNo,
                                ListProdStrNo = listProdNo,
                                //WHS_Code = data.WHS_Code,
                                WHS_Code = data.WHS_Code,
                                //FloorCode = data.FloorCode,
                                //LineCode = data.LineCode,
                                //RackCode = data.RackCode,
                                //RackPosition = data.RackPosition,
                                MappingCode = data.MappingCode,
                                ProductQrCode = data.ProductQrCode,
                                ProductCode = data.ProductCode,
                                Quantity = quantity,
                                Unit = data.UnitCode,
                                Ordering = data.Ordering,
                                CreatedBy = data.CreatedBy,
                                CreatedTime = DateTime.Now,
                                TicketImpCode = data.TicketCode,
                                GattrCode = prodDetail.GattrCode,
                                Weight = prodDetail.Weight,
                                DeletionToken = "NA"
                            };
                            _context.ProductLocatedMappings.Add(mapping);
                            await _context.SaveChangesAsync();
                            newId = mapping.Id;
                        }
                        else
                        {
                            checkLocated.ListProdStrNo.AddRange(listProdNo);
                            checkLocated.Quantity = checkLocated.ListProdStrNo.SumQuantity();
                            _context.ProductLocatedMappings.Update(checkLocated);
                            newId = checkLocated.Id;
                        }

                        var mappingLog = new ProductLocatedMappingLog
                        {
                            IdImpProduct = data.IdImpProduct,
                            IdLocMapOld = -1,
                            IdLocatedMapping = newId,
                            MappingCode = data.MappingCode,
                            MappingCodeOld = "",
                            StoreCode = data.WHS_Code,
                            GattrCode = data.GattrCode,
                            ProductCode = data.ProductCode,
                            ProductNo = data.ProductNo,
                            ProductQrCode = data.ProductQrCode,
                            Quantity = quantity,
                            Unit = data.UnitCode,
                            TicketCode = prodDetail.TicketCode,
                            Type = "ARRANGE_IMP",
                            CreatedBy = data.CreatedBy,
                            CreatedTime = DateTime.Now,
                            IsDeleted = false,
                            //MarkWholeProduct = mark.Any() ? true : false,
                            DeletionToken = "NA"
                        };

                        _context.ProductLocatedMappingLogs.Add(mappingLog);
                        var materialProduct = _context.MaterialProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductCode.Equals(data.ProductCode));
                        //var header = _context.ProductImportHeaders.FirstOrDefault(x => !x.IsDeleted && x.TicketCode == obj.TicketCode);
                        var mpStatus = new MpStatus()
                        {
                            ActStatus = "ARRANGE",
                            ActTime = DateTime.Now,
                            ActBy = data.CreatedBy,
                            ProductNo = data.ProductNo,
                            MappingCode = data.MappingCode,
                            //SupCode = header?.SupCode,
                            //CusCode = header?.CusCode,
                        };
                        materialProduct.MpStatuses = materialProduct.MpStatuses != null ? materialProduct.MpStatuses : new List<MpStatus>();
                        materialProduct.MpStatuses.Add(mpStatus);

                        //Thêm vào bảng Product_Entity_Mapping
                        //var checkInStock = _context.ProductInStocks.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == prodDetail.ProductCode
                        //    && x.IdImpProduct == data.IdImpProduct && x.GattrCode == prodDetail.GattrCode && x.StoreCode == data.WHS_Code);
                        //if (checkInStock == null)
                        //{
                        //    var newParentInStock = new ProductInStock
                        //    {
                        //        IdImpProduct = data.IdImpProduct,
                        //        LotProductCode = prodDetail.LotProductCode,
                        //        StoreCode = data.WHS_Code,
                        //        ProductCode = prodDetail.ProductCode,
                        //        ProductType = prodDetail.ProductType,
                        //        ProductQrCode = prodDetail.ProductQrCode,
                        //        Quantity = quantity,
                        //        ListProdStrNo = listProdNo,
                        //        Unit = prodDetail.Unit,
                        //        CreatedBy = data.CreatedBy,
                        //        CreatedTime = DateTime.Now,
                        //        IsDeleted = false,
                        //        //MarkWholeProduct = mark.Any() ? true : false,
                        //        PackCode = prodDetail.PackCode,
                        //        GattrCode = prodDetail.GattrCode,
                        //        DeletionToken = "NA"
                        //    };
                        //    _context.ProductInStocks.Add(newParentInStock);
                        //}
                        //else
                        //{
                        //    checkInStock.ListProdStrNo.AddRange(listProdNo);
                        //    checkInStock.Quantity = checkInStock.ListProdStrNo.SumQuantity();
                        //    _context.ProductInStocks.Update(checkInStock);
                        //}
                        await _context.SaveChangesAsync();

                        //Update quantity is set in detail
                        if (prodDetail.Quantity != null) prodDetail.QuantityIsSet += quantity;
                        else prodDetail.QuantityIsSet = quantity;
                        _context.ProductImportDetails.Update(prodDetail);

                        _context.SaveChanges();
                        msg.Title = "Xếp kho thành công !";
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = "Phiếu nhập không tồn tại";
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra!";
            }

            return msg;
        }

        private async Task<JMessage> OrderProductStaticTank([FromBody] ProductCrudMapping data)
        {
            var msg = new JMessage();
            try
            {
                var oldMapping = _context.ProductLocatedMappings.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == data.ProductCode);
                oldMapping.MappingCode = data.MappingCode;
                oldMapping.WHS_Code = data.WHS_Code;
                _context.ProductLocatedMappings.Update(oldMapping);

                var mappingLog = new ProductLocatedMappingLog
                {
                    IdImpProduct = oldMapping.IdImpProduct,
                    IdLocMapOld = oldMapping.Id,
                    IdLocatedMapping = oldMapping.Id,
                    MappingCode = data.MappingCode,
                    MappingCodeOld = oldMapping.MappingCode,
                    StoreCode = oldMapping.WHS_Code,
                    GattrCode = oldMapping.GattrCode,
                    ProductCode = oldMapping.ProductCode,
                    ProductNo = data.ProductNo,
                    ProductQrCode = oldMapping.ProductQrCode,
                    Quantity = oldMapping.Quantity,
                    Unit = oldMapping.Unit,
                    TicketCode = "",
                    Type = "REARRANGE",
                    CreatedBy = data.CreatedBy,
                    CreatedTime = DateTime.Now,
                    IsDeleted = false,
                    //MarkWholeProduct = mark.Any() ? true : false,
                    DeletionToken = "NA"
                };

                _context.ProductLocatedMappingLogs.Add(mappingLog);
                var materialProduct = _context.MaterialProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductCode.Equals(oldMapping.ProductCode));
                //var header = _context.ProductImportHeaders.FirstOrDefault(x => !x.IsDeleted && x.TicketCode == obj.TicketCode);
                var mpStatus = new MpStatus()
                {
                    ActStatus = "ARRANGE",
                    ActTime = DateTime.Now,
                    ActBy = data.CreatedBy,
                    ProductNo = data.ProductNo,
                    MappingCode = data.MappingCode,
                    //SupCode = header?.SupCode,
                    //CusCode = header?.CusCode,
                };
                materialProduct.MpStatuses = materialProduct.MpStatuses != null ? materialProduct.MpStatuses : new List<MpStatus>();
                materialProduct.MpStatuses.Add(mpStatus);
                await _context.SaveChangesAsync();
                msg.Title = "Xếp kho thành công !";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra!";
            }
            return msg;
        }

        [HttpPost]
        public async Task<object> OrderProductComponent([FromBody] ProductCrudMapping data)
        {
            var msg = new JMessage();
            try
            {
                //if (obj.ImpType == "RETURN")
                //{
                var prodDetail = _context.ProductImportDetails.AsParallel().FirstOrDefault(x => !x.IsDeleted
                && x.Id.Equals(data.IdImpProduct));
                if (prodDetail == null)
                {
                    msg.Error = true;
                    msg.Title = "Chi tiết phiếu nhập không tồn tại";
                    return Json(msg);
                }
                if (prodDetail.QuantityIsSet == prodDetail.Quantity)
                {
                    msg.Error = true;
                    msg.Title = "Chi tiết phiếu nhập đã được xếp";
                    return Json(msg);
                }
                var gattrCode = "";
                var groupAttribute = _context.ProductGattrExts.FirstOrDefault(x => !x.IsDeleted && x.GattrFlatCode == data.ParentFlatCode);
                if (groupAttribute == null)
                {
                    var maxGroupId = _context.ProductGattrExts.MaxBy(x => x.Id) != null ? _context.ProductGattrExts.MaxBy(x => x.Id).Id : 1;
                    var newGroupAttribute = new ProductGattrExt
                    {
                        //GattrCode = (maxGroupId + 1).ToString(),
                        GattrFlatCode = data.ParentFlatCode,
                        GattrJson = data.ParentCustomJson,
                        IsDeleted = false,
                        CreatedBy = data.CreatedBy,
                        CreatedTime = DateTime.Now,
                        Type = "IMPORT_RETURN",
                        IdSource = data.ParentMappingId
                    };
                    _context.ProductGattrExts.Add(newGroupAttribute);
                    await _context.SaveChangesAsync();
                    maxGroupId = newGroupAttribute.Id;
                    newGroupAttribute.GattrCode = newGroupAttribute.Id.ToString();
                    gattrCode = newGroupAttribute.GattrCode;
                    _context.ProductGattrExts.Update(newGroupAttribute);
                    logProduct.Info(newGroupAttribute.Id);
                }
                else
                {
                    gattrCode = groupAttribute.GattrCode;
                }
                var parentMapping = _context.ProductLocatedMappings.FirstOrDefault(x => !x.IsDeleted && x.Id == data.ParentMappingId);
                if (parentMapping != null /*&& obj.ParentProductNumber.HasValue*/ && parentMapping.ListProdStrNo.Count > 0)
                {
                    //obj.ParentProductNumber = parentMapping.ListProductNo.FirstOrDefault();
                    //parentMapping.ListProductNo.Remove(obj.ParentProductNumber.Value);
                    var newId = -1;
                    if (parentMapping.ListProdStrNo.SumQuantity() > 1)
                    {
                        parentMapping.ListProdStrNo.Extract(data.ParentProductNumber.Value);
                        parentMapping.Quantity -= 1;
                        _context.ProductLocatedMappings.Update(parentMapping);
                        var checkLocated = _context.ProductLocatedMappings.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == parentMapping.ProductCode
                            && x.IdImpProduct == parentMapping.IdImpProduct && x.GattrCode == gattrCode && x.MappingCode == parentMapping.MappingCode);
                        if (checkLocated == null)
                        {
                            var newParentMapping = new ProductLocatedMapping
                            {
                                IdImpProduct = parentMapping.IdImpProduct,
                                MappingCode = parentMapping.MappingCode,
                                WHS_Code = parentMapping.WHS_Code,
                                ProductCode = parentMapping.ProductCode,
                                ProductType = parentMapping.ProductType,
                                ProductQrCode = parentMapping.ProductQrCode,
                                Quantity = 1,
                                ListProdStrNo = new List<ProdStrNo> { new ProdStrNo(data.ParentProductNumber.Value) },
                                Unit = parentMapping.Unit,
                                CreatedBy = data.CreatedBy,
                                CreatedTime = DateTime.Now,
                                IsDeleted = false,
                                //MarkWholeProduct = mark.Any() ? true : false,
                                GattrCode = gattrCode,
                                DeletionToken = "NA"
                            };
                            _context.ProductLocatedMappings.Add(newParentMapping);
                            await _context.SaveChangesAsync();
                            newId = newParentMapping.Id;
                        }
                        else
                        {
                            checkLocated.ListProdStrNo.Add(new ProdStrNo(data.ParentProductNumber.Value));
                            checkLocated.Quantity++;
                            _context.ProductLocatedMappings.Update(checkLocated);
                            newId = checkLocated.Id;
                        }
                    }
                    else
                    {
                        parentMapping.GattrCode = gattrCode;
                        parentMapping.UpdatedBy = User.Identity.Name;
                        parentMapping.UpdatedTime = DateTime.Now;
                        newId = parentMapping.Id;
                    }
                    var mappingLog = new ProductLocatedMappingLog
                    {
                        IdImpProduct = parentMapping.IdImpProduct,
                        IdLocMapOld = parentMapping.Id,
                        IdLocatedMapping = newId,
                        MappingCode = parentMapping.MappingCode,
                        MappingCodeOld = parentMapping.MappingCode,
                        StoreCode = parentMapping.WHS_Code,
                        GattrCode = gattrCode,
                        ProductCode = parentMapping.ProductCode,
                        ProductNo = data.ParentProductNumber.Value.ToString(),
                        ProductQrCode = parentMapping.ProductQrCode,
                        Quantity = 1,
                        Unit = parentMapping.Unit,
                        TicketCode = data.TicketCode,
                        Type = "IMPORT_RETURN",
                        CreatedBy = data.CreatedBy,
                        CreatedTime = DateTime.Now,
                        IsDeleted = false,
                        //MarkWholeProduct = mark.Any() ? true : false,
                        DeletionToken = "NA"
                    };

                    _context.ProductLocatedMappingLogs.Add(mappingLog);
                    var materialProduct = _context.MaterialProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductCode.Equals(parentMapping.ProductCode));
                    //var header = _context.ProductImportHeaders.FirstOrDefault(x => !x.IsDeleted && x.TicketCode == obj.TicketCode);
                    var mpStatus = new MpStatus()
                    {
                        ActStatus = "ARRANGE",
                        ActTime = DateTime.Now,
                        ActBy = data.CreatedBy,
                        ProductNo = data.ProductNo,
                        MappingCode = data.MappingCode,
                        //SupCode = header?.SupCode,
                        //CusCode = header?.CusCode,
                    };
                    materialProduct.MpStatuses = materialProduct.MpStatuses != null ? materialProduct.MpStatuses : new List<MpStatus>();
                    materialProduct.MpStatuses.Add(mpStatus);
                    var parentInStock = _context.ProductInStocks.Where(x => !x.IsDeleted && x.IdImpProduct == parentMapping.IdImpProduct/* && x.GattrCode == obj.GattrCode*/
                    /*&& x.ListProductNo.ContainsRange(parentMapping.ListProductNo)*/).ToList().FirstOrDefault(x => x.ListProdStrNo.ContainsRange(parentMapping.ListProdStrNo));
                    if (parentInStock != null)
                    {
                        //parentInStock.ListProductNo.Remove(obj.ParentProductNumber.Value);
                        if (parentInStock.ListProdStrNo.SumQuantity() > 1)
                        {
                            parentInStock.ListProdStrNo.Extract(data.ParentProductNumber.Value);
                            parentInStock.Quantity -= 1;
                            _context.ProductInStocks.Update(parentInStock);
                            var newParentInStock = new ProductInStock
                            {
                                IdImpProduct = parentInStock.IdImpProduct,
                                LotProductCode = parentInStock.LotProductCode,
                                StoreCode = parentInStock.StoreCode,
                                ProductCode = parentInStock.ProductCode,
                                ProductType = parentInStock.ProductType,
                                ProductQrCode = parentInStock.ProductQrCode,
                                Quantity = 1,
                                //ListProductNo = new List<int> { obj.ParentProductNumber.Value },
                                ListProdStrNo = new List<ProdStrNo> { new ProdStrNo(data.ParentProductNumber.Value) },
                                Unit = parentInStock.Unit,
                                CreatedBy = data.CreatedBy,
                                CreatedTime = DateTime.Now,
                                IsDeleted = false,
                                //MarkWholeProduct = mark.Any() ? true : false,
                                //PackCode = packCode,
                                GattrCode = gattrCode,
                                DeletionToken = "NA"
                            };
                            _context.ProductInStocks.Add(newParentInStock);
                        }
                        else
                        {
                            parentInStock.GattrCode = gattrCode;
                            parentInStock.UpdatedBy = User.Identity.Name;
                            parentInStock.UpdatedTime = DateTime.Now;
                        }
                    }
                    var impParent = new ProductImpParent
                    {
                        IdImpProduct = data.IdImpProduct,
                        IdProductParent = parentMapping.Id,
                        Number = data.ParentProductNumber,
                        IsDeleted = false,
                        CreatedBy = data.CreatedBy,
                        CreatedTime = DateTime.Now,
                    };
                    _context.ProductImpParents.Add(impParent);
                    prodDetail.QuantityIsSet = prodDetail.Quantity;
                    _context.ProductImportDetails.Update(prodDetail);
                    await _context.SaveChangesAsync();
                    msg.Title = "Xếp kho thành công !";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Thiết bị cha không tồn tại";
                }
                //}
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra";
                logProduct.Info(ex.Message);
                await CleanGattr();
            }
            return Json(msg);
        }
        [HttpPost]
        public object OrderProductVatcoQrCode(ProductLocatedMapping data)
        {
            var msg = new JMessage();
            try
            {
                //var prodMapping = _context.ProductLocatedMappings.AsParallel().FirstOrDefault(x => !x.IsDeleted
                //    && x.ProductQrCode.Equals(data.ProductQrCode) && x.MappingCode.Equals(data.MappingCode));
                //var proReceivedDetail =
                //    _context.ProductImportDetails.FirstOrDefault(x =>
                //        !x.IsDeleted && x.ProductQrCode == data.ProductQrCode);

                //if (prodMapping == null)
                //{
                //    //Thêm vào bảng Product_Entity_Mapping
                //    var mapping = new ProductLocatedMapping
                //    {
                //        WHS_Code = data.WHS_Code,
                //        //FloorCode = data.FloorCode,
                //        //LineCode = data.LineCode,
                //        //RackCode = data.RackCode,
                //        MappingCode = data.MappingCode,
                //        RackPosition = data.RackPosition,
                //        ProductQrCode = data.ProductQrCode,
                //        ProductCode = data.ProductCode,
                //        Quantity = data.Quantity,
                //        Unit = data.Unit,
                //        Ordering = data.Ordering,
                //        CreatedBy = data.CreatedBy,
                //        CreatedTime = DateTime.Now,
                //        TicketImpCode = data.TicketCode
                //    };
                //    _context.ProductLocatedMappings.Add(mapping);

                //    //Thêm dữ liệu bảng bút toán xếp kho
                //    var mark = _context.ProdReceivedAttrValues.Where(x =>
                //        !x.IsDeleted && x.TicketImpCode.Equals(data.TicketCode));

                //    var mapId = _context.ProductLocatedMappings.MaxBy(x => x.Id);
                //    var idMapping = mapId != null ? (mapId.Id + 1) : 1;
                //    var stockArrangePut = new StockArrangePutEntry
                //    {
                //        MapId = idMapping,
                //        ProdCode = data.ProductQrCode,
                //        Quantity = data.Quantity,
                //        MarkWholeProduct = mark.Any() ? true : false
                //    };
                //    _context.StockArrangePutEntrys.Add(stockArrangePut);

                //    //Map vị trí trong kho
                //    var mapStock = new MapStockProdIn
                //    {
                //        MapId = idMapping,
                //        ProdCode = data.ProductQrCode,
                //        Quantity = data.Quantity,
                //        Unit = data.Unit,
                //    };
                //    _context.MapStockProdIns.Add(mapStock);

                //    //Update quantity is set in detail
                //    var prodDetail = _context.ProductImportDetails.FirstOrDefault(x =>
                //        x.ProductQrCode.Equals(data.ProductQrCode)
                //        && x.TicketCode.Equals(data.TicketCode) && !x.IsDeleted);
                //    if (prodDetail != null)
                //    {
                //        prodDetail.QuantityIsSet += data.Quantity.Value;
                //        _context.ProductImportDetails.Update(prodDetail);
                //    }
                //    else
                //    {
                //        AddPackAndStock(data);
                //    }

                //    _context.SaveChanges();
                //    msg.Title = "Xếp kho thành công !";
                //}
                //else
                //{
                //    prodMapping.Quantity = prodMapping.Quantity + data.Quantity;
                //    prodMapping.UpdatedBy = data.CreatedBy;
                //    prodMapping.UpdatedTime = DateTime.Now;

                //    var stockArrangePut = new StockArrangePutEntry
                //    {
                //        MapId = prodMapping.Id,
                //        ProdCode = data.ProductQrCode,
                //        Quantity = data.Quantity
                //    };
                //    _context.StockArrangePutEntrys.Add(stockArrangePut);

                //    var mapStock = _context.MapStockProdIns.FirstOrDefault(x => x.MapId == prodMapping.Id);
                //    mapStock.Quantity += data.Quantity;

                //    _context.ProductLocatedMappings.Update(prodMapping);
                //    _context.MapStockProdIns.Update(mapStock);

                //    //Update quantity is set in detail
                //    var prodDetail = _context.ProductImportDetails.FirstOrDefault(x =>
                //        x.ProductCode.Equals(data.ProductCode)
                //        && x.TicketCode.Equals(data.TicketCode) && !x.IsDeleted);
                //    if (prodDetail != null)
                //    {
                //        prodDetail.QuantityIsSet += data.Quantity.Value;
                //        _context.ProductImportDetails.Update(prodDetail);
                //    }
                //    else
                //    {
                //        AddPackAndStock(data);
                //    }

                //    _context.SaveChanges();
                //    msg.Title = "Xếp kho thành công !";
                //}
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra!";
            }

            return Json(msg);
        }

        [HttpPost]
        public object OrderProductVatcoMultiQrCode([FromBody] List<ProductLocatedMapping> listData)
        {
            var msg = new JMessage();
            try
            {
                //var firstObj = listData.FirstOrDefault();
                //var prodMappings = _context.ProductLocatedMappings.Where(x => !x.IsDeleted
                //    && x.ProductQrCode.Equals(firstObj.ProductQrCode)).ToList();
                //foreach (var data in listData)
                //{
                //    var proReceivedDetail =
                //        _context.ProductImportDetails.FirstOrDefault(x =>
                //            !x.IsDeleted && x.ProductQrCode == data.ProductQrCode);
                //    //var listProductNo = Enumerable.Range(data.StartNo.Value, data.EndNo.Value);
                //    var listProductNo = ListProdStrNoHelper.GetListProdStrNo(data.ProductNo);
                //    //data.Quantity = listProductNo.ToList().Count;
                //    data.Quantity = listProductNo.SumQuantity();
                //    var checkExist = prodMappings.Any(x =>
                //        x.ProductNo != null && x.ListProdStrNo.IsIntersect(listProductNo));
                //    if (checkExist)
                //    {
                //        msg.Error = true;
                //        msg.Title = "Khoảng từ đến đã được sử dụng";
                //        return Json(msg);
                //    }
                //    else
                //    {
                //        //var productInStock = _context.ProductInStockNews.FirstOrDefault(x =>
                //        //    x.IsDeleted == false && x.ProductQrCode == data.ProductQrCode);
                //        //if (productInStock != null)
                //        //{
                //        //    if (productInStock.ProductNo == "")
                //        //    {
                //        //        productInStock.ListProductNo = new List<int>();
                //        //    }

                //        //    productInStock.ListProductNo.AddRange(listProductNo);
                //        //    _context.ProductInStockNews.Update(productInStock);
                //        //}
                //        //else
                //        //{

                //        //    var storeInventoryObj = new ProductInStockNew
                //        //    {
                //        //        StoreCode = data.WHS_Code,

                //        //        ProductCode = data.ProductCode,
                //        //        ProductType = data.ProductType,
                //        //        ProductQrCode = data.ProductQrCode,
                //        //        Quantity = data.Quantity.Value,
                //        //        Unit = data.Unit,
                //        //        CreatedBy = data.CreatedBy,
                //        //        CreatedTime = DateTime.Now,
                //        //        IsDeleted = false,
                //        //        MarkWholeProduct = /*mark.Any() ? true :*/ false
                //        //    };
                //        //    _context.ProductInStockNews.Add(storeInventoryObj);
                //        //}
                //        ////Thêm vào bảng Product_Entity_Mapping
                //        //var mapping = new ProductLocatedMapping
                //        //{
                //        //    WHS_Code = data.WHS_Code,
                //        //    ProductNo = string.Join(", ", listProductNo),
                //        //    //FloorCode = data.FloorCode,
                //        //    //LineCode = data.LineCode,
                //        //    //RackCode = data.RackCode,
                //        //    MappingCode = data.MappingCode,
                //        //    RackPosition = data.RackPosition,
                //        //    ProductQrCode = data.ProductQrCode,
                //        //    ProductCode = data.ProductCode,
                //        //    Quantity = data.Quantity,
                //        //    Unit = data.Unit,
                //        //    Ordering = data.Ordering,
                //        //    CreatedBy = data.CreatedBy,
                //        //    CreatedTime = DateTime.Now,
                //        //    TicketImpCode = data.TicketCode
                //        //};
                //        //_context.ProductLocatedMappings.Add(mapping);
                //        //prodMappings.Add(mapping);

                //        ////Thêm dữ liệu bảng bút toán xếp kho
                //        //var mark = _context.ProdReceivedAttrValues.Where(x =>
                //        //    !x.IsDeleted && x.TicketImpCode.Equals(data.TicketCode));

                //        //var mapId = _context.ProductLocatedMappings.MaxBy(x => x.Id);
                //        //var idMapping = mapId != null ? (mapId.Id + 1) : 1;
                //        //var stockArrangePut = new StockArrangePutEntry
                //        //{
                //        //    MapId = idMapping,
                //        //    ProdCode = data.ProductQrCode,
                //        //    Quantity = data.Quantity,
                //        //    MarkWholeProduct = mark.Any() ? true : false
                //        //};
                //        //_context.StockArrangePutEntrys.Add(stockArrangePut);

                //        ////Map vị trí trong kho
                //        //var mapStock = new MapStockProdIn
                //        //{
                //        //    MapId = idMapping,
                //        //    ProdCode = data.ProductQrCode,
                //        //    Quantity = data.Quantity,
                //        //    Unit = data.Unit,
                //        //};
                //        //_context.MapStockProdIns.Add(mapStock);

                //        ////Update quantity is set in detail
                //        //var prodDetail = _context.ProductImportDetails.FirstOrDefault(x =>
                //        //    x.ProductQrCode.Equals(data.ProductQrCode)
                //        //    && x.TicketCode.Equals(data.TicketCode) && !x.IsDeleted);
                //        //if (prodDetail != null)
                //        //{
                //        //    prodDetail.QuantityIsSet += data.Quantity.Value;
                //        //    _context.ProductImportDetails.Update(prodDetail);
                //        //}
                //        //else
                //        //{
                //        //    AddPackAndStock(data);
                //        //}
                //    }
                //}

                //_context.SaveChanges();
                msg.Title = "Xếp kho thành công !";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra!";
            }

            return Json(msg);
        }

        [HttpPost]
        public object UpdateProductMapping([FromBody] ProductLocatedMapping data)
        {
            var msg = new JMessage();
            try
            {
                //var count = data.EndNo.Value - data.StartNo.Value - 1;
                //var listProductNo = Enumerable.Range(data.StartNo.Value, count).ToList();
                //data.Quantity = data.Quantity ?? listProductNo.ToList().Count;
                //var prodMappings = _context.ProductLocatedMappings.Where(x => !x.IsDeleted
                //    //&& x.ProductCode.Equals(data.ProductCode) && data.WHS_Code == x.WHS_Code
                //    //&& data.ProdAtrGroup == x.ProdAtrGroup // used to compare json custom
                //    && data.ProductQrCode == x.ProductQrCode // used to check with product in stock
                //    ).ToList();
                //var oldMappings = prodMappings.Where(x =>
                //    x.ListProductNo.Intersect(listProductNo).ToList().Count > 0).ToList();
                //if (oldMappings.Count > 0)
                //{
                //    //Bớt phần tử Product_Entity_Mapping cũ
                //    foreach (var oldMapping in oldMappings)
                //    {
                //        var reducedQuantity = oldMapping.ListProductNo.Intersect(listProductNo).ToList().Count;
                //        oldMapping.Quantity -= reducedQuantity;
                //        oldMapping.ListProductNo = oldMapping.ListProductNo.Except(listProductNo).ToList();
                //        _context.ProductLocatedMappings.Update(oldMapping);
                //    }
                //    var newMapping = prodMappings.FirstOrDefault(x =>
                //    x.MappingCode == data.MappingCode);
                //    if (newMapping == null)
                //    {
                //        //Thêm vào bảng Product_Entity_Mapping
                //        var mapping = new ProductLocatedMapping
                //        {
                //            WHS_Code = data.WHS_Code,
                //            ProductNo = string.Join(", ", listProductNo),
                //            //FloorCode = data.FloorCode,
                //            //LineCode = data.LineCode,
                //            //RackCode = data.RackCode,
                //            MappingCode = data.MappingCode,
                //            RackPosition = data.RackPosition,
                //            ProductQrCode = data.ProductQrCode,
                //            GattrCode = data.GattrCode,
                //            ProductCode = data.ProductCode,
                //            Quantity = data.Quantity,
                //            Unit = data.Unit,
                //            Ordering = data.Ordering,
                //            CreatedBy = data.CreatedBy,
                //            CreatedTime = DateTime.Now,
                //            TicketImpCode = data.TicketCode
                //        };
                //        _context.ProductLocatedMappings.Add(mapping);
                //    }
                //    else
                //    {
                //        newMapping.Quantity += data.Quantity;
                //        newMapping.ListProductNo.AddRange(listProductNo);
                //        _context.ProductLocatedMappings.Update(newMapping);
                //    }

                //    _context.SaveChanges();
                //    msg.Title = "Xếp kho thành công !";
                //}
                //else
                //{
                //    msg.Error = true;
                //    msg.Title = "Không tìm thấy bản ghi cũ để xếp lại sản phẩm!";
                //}
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.StackTrace;
                msg.Title = "Có lỗi xảy ra!";
            }

            return Json(msg);
        }
        [HttpPost]
        public async Task<JMessage> InsertProductMapping([FromBody] ProductCrudMapping data)
        {
            var msg = new JMessage();
            try
            {
                var prodDetail = _context.ProductImportDetails.Include(x => x.Product).ThenInclude(x => x.Group)
                    .AsNoTracking().FirstOrDefault(x => !x.IsDeleted && x.Id.Equals(data.IdImpProduct));
                if (prodDetail?.Product?.Group?.GroupType == "STATIC_TANK")
                {
                    return await OrderProductStaticTank(data);
                }
                var listProdNo = new List<ProdStrNo>();
                var prodInStock = _context.ProductInStocks.FirstOrDefault(x => !x.IsDeleted && x.Id == data.IdProdInStock);
                if (prodInStock == null)
                {
                    msg.Error = true;
                    msg.Title = "Bản ghi tồn kho không tồn tại!";
                    return msg;
                }
                //if (prodInStock.StoreCode != data.WHS_Code)
                //{
                //    msg.Error = true;
                //    msg.Title = "Không thể xếp sp vào vị trí này!";
                //    return Json(msg);
                //}
                if (!string.IsNullOrEmpty(data.ProductNo))
                {
                    try
                    {
                        listProdNo = ListProdStrNoHelper.GetListProdStrNo(data.ProductNo);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.Message);
                    }
                    if (listProdNo.Count == 0)
                    {
                        msg.Error = true;
                        msg.Title = "Thứ tự không hợp lệ!";
                        return msg;
                    }
                    //var testMapping = _context.ProductLocatedMappings.FirstOrDefault(x => !x.IsDeleted && x.Id == obj.ParentMappingId);
                    var checkMapping = prodInStock.ListProdStrNo.ContainsRange(listProdNo);
                    if (checkMapping == false)
                    {
                        msg.Error = true;
                        msg.Title = "Thứ tự không tồn tại trong dãy!";
                        return msg;
                    }
                }
                else
                {
                    var allPosition = _context.ProductLocatedMappings.Where(x => !x.IsDeleted && x.IdImpProduct == data.IdImpProduct)
                    .ToList();
                    var sumPosition = allPosition.Sum(x => x.ListProdStrNo.SumQuantity());
                    var listFilter = allPosition.SelectMany(x => x.ListProdStrNo).ToList();
                    var sumMapping = prodInStock.ListProdStrNo.SumQuantity();
                    if (!data.Quantity.HasValue || sumMapping < data.Quantity + sumPosition)
                    {
                        msg.Error = true;
                        msg.Title = "Số lượng nhập vào không hợp lệ!";
                        return msg;
                    }
                    listProdNo = prodInStock.ListProdStrNo.ExtractQuantity(listFilter, (int)data.Quantity.Value);
                }
                var checkProdDetailIntersect = _context.ProductLocatedMappings.Where(x => !x.IsDeleted && x.IdImpProduct == data.IdImpProduct)
                    .ToList().Any(x => x.ListProdStrNo.IsIntersect(listProdNo));
                if (checkProdDetailIntersect == true)
                {
                    msg.Error = true;
                    msg.Title = "Thứ tự đã được xếp!";
                    return msg;
                }
                if (prodDetail != null || true)
                {
                    var quantity = listProdNo.SumQuantity();
                    //if (((prodDetail.QuantityIsSet ?? 0) + quantity) > prodDetail.Quantity)
                    //{
                    //    msg.Error = true;
                    //    msg.Title = "Số lượng nhập không hợp lệ";
                    //    return Json(msg);
                    //}
                    //var listProductNo = Enumerable.Range(decimal.ToInt32(prodDetail.QuantityIsSet ?? 0) + 1, decimal.ToInt32(data.Quantity ?? 1)).ToList();
                    //Thêm vào bảng Product_Entity_Mapping
                    var newId = -1;
                    var checkLocated = _context.ProductLocatedMappings.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == data.ProductCode
                    && x.IdImpProduct == data.IdImpProduct && x.GattrCode == prodDetail.GattrCode && x.MappingCode == data.MappingCode);
                    if (checkLocated == null)
                    {
                        var mapping = new ProductLocatedMapping
                        {
                            IdImpProduct = data.IdImpProduct,
                            //ListProductNo = listProductNo,
                            ListProdStrNo = listProdNo,
                            //WHS_Code = data.WHS_Code,
                            WHS_Code = data.WHS_Code,
                            //FloorCode = data.FloorCode,
                            //LineCode = data.LineCode,
                            //RackCode = data.RackCode,
                            //RackPosition = data.RackPosition,
                            MappingCode = data.MappingCode,
                            ProductQrCode = data.ProductQrCode,
                            ProductCode = data.ProductCode,
                            Quantity = quantity,
                            Unit = data.UnitCode,
                            Ordering = data.Ordering,
                            CreatedBy = data.CreatedBy,
                            CreatedTime = DateTime.Now,
                            TicketImpCode = prodDetail.TicketCode,
                            GattrCode = prodDetail.GattrCode,
                            DeletionToken = "NA"
                        };
                        _context.ProductLocatedMappings.Add(mapping);
                        await _context.SaveChangesAsync();
                        newId = mapping.Id;
                    }
                    else
                    {
                        checkLocated.ListProdStrNo.AddRange(listProdNo);
                        checkLocated.Quantity = checkLocated.ListProdStrNo.SumQuantity();
                        _context.ProductLocatedMappings.Update(checkLocated);
                        newId = checkLocated.Id;
                    }

                    var mappingLog = new ProductLocatedMappingLog
                    {
                        IdImpProduct = data.IdImpProduct,
                        IdLocMapOld = -1,
                        IdLocatedMapping = newId,
                        MappingCode = data.MappingCode,
                        MappingCodeOld = "",
                        StoreCode = data.WHS_Code,
                        GattrCode = data.GattrCode,
                        ProductCode = data.ProductCode,
                        ProductNo = data.ProductNo,
                        ProductQrCode = data.ProductQrCode,
                        Quantity = quantity,
                        Unit = data.UnitCode,
                        TicketCode = prodDetail.TicketCode,
                        Type = "ARRANGE_IMP",
                        CreatedBy = data.CreatedBy,
                        CreatedTime = DateTime.Now,
                        IsDeleted = false,
                        //MarkWholeProduct = mark.Any() ? true : false,
                        DeletionToken = "NA"
                    };

                    _context.ProductLocatedMappingLogs.Add(mappingLog);
                    var materialProduct = _context.MaterialProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductCode.Equals(data.ProductCode));
                    //var header = _context.ProductImportHeaders.FirstOrDefault(x => !x.IsDeleted && x.TicketCode == obj.TicketCode);
                    var mpStatus = new MpStatus()
                    {
                        ActStatus = "ARRANGE",
                        ActTime = DateTime.Now,
                        ActBy = data.CreatedBy,
                        ProductNo = data.ProductNo,
                        MappingCode = data.MappingCode,
                        //SupCode = header?.SupCode,
                        //CusCode = header?.CusCode,
                    };
                    materialProduct.MpStatuses = materialProduct.MpStatuses != null ? materialProduct.MpStatuses : new List<MpStatus>();
                    materialProduct.MpStatuses.Add(mpStatus);

                    //Thêm vào bảng Product_Entity_Mapping
                    //var checkInStock = _context.ProductInStocks.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == prodDetail.ProductCode
                    //    && x.IdImpProduct == data.IdImpProduct && x.GattrCode == prodDetail.GattrCode && x.StoreCode == data.WHS_Code);
                    //if (checkInStock == null)
                    //{
                    //    var newParentInStock = new ProductInStock
                    //    {
                    //        IdImpProduct = data.IdImpProduct,
                    //        LotProductCode = prodDetail.LotProductCode,
                    //        StoreCode = data.WHS_Code,
                    //        ProductCode = prodDetail.ProductCode,
                    //        ProductType = prodDetail.ProductType,
                    //        ProductQrCode = prodDetail.ProductQrCode,
                    //        Quantity = quantity,
                    //        ListProdStrNo = listProdNo,
                    //        Unit = prodDetail.Unit,
                    //        CreatedBy = data.CreatedBy,
                    //        CreatedTime = DateTime.Now,
                    //        IsDeleted = false,
                    //        //MarkWholeProduct = mark.Any() ? true : false,
                    //        PackCode = prodDetail.PackCode,
                    //        GattrCode = prodDetail.GattrCode,
                    //        DeletionToken = "NA"
                    //    };
                    //    _context.ProductInStocks.Add(newParentInStock);
                    //}
                    //else
                    //{
                    //    checkInStock.ListProdStrNo.AddRange(listProdNo);
                    //    checkInStock.Quantity = checkInStock.ListProdStrNo.SumQuantity();
                    //    _context.ProductInStocks.Update(checkInStock);
                    //}
                    await _context.SaveChangesAsync();

                    //Update quantity is set in detail
                    if (prodDetail.Quantity != null) prodDetail.QuantityIsSet += quantity;
                    else prodDetail.QuantityIsSet = quantity;
                    _context.ProductImportDetails.Update(prodDetail);

                    _context.SaveChanges();
                    msg.Title = "Xếp kho thành công !";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Phiếu nhập không tồn tại";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.StackTrace;
                msg.Title = "Có lỗi xảy ra!";
            }

            return msg;
        }

        private void UpdateProductInStock(ProductLocatedMapping obj)
        {
            var productQrCode = obj.ProductQrCode;
            var listProductMapping = _context.ProductLocatedMappings
                .Where(x => !x.IsDeleted && x.ProductQrCode == productQrCode).ToList();
            var totalInStock = listProductMapping.Count > 0 ? listProductMapping.Sum(x => x.Quantity ?? 0) : 0;
            var prodInStock = _context.ProductInStocks.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode == productQrCode);
            if (prodInStock != null)
            {
                prodInStock.Quantity += totalInStock;
                _context.ProductInStocks.Update(prodInStock);
            }
            else
            {
                var storeInventoryObj = new ProductInStock
                {
                    //LotProductCode = obj.LotProductCode,
                    StoreCode = obj.WHS_Code,
                    GattrCode = obj.GattrCode,
                    //ListProductNo = listProductNo,
                    ProductCode = obj.ProductCode,
                    ProductType = obj.ProductType,
                    ProductQrCode = productQrCode,
                    Quantity = obj.Quantity.Value,
                    Unit = obj.Unit,
                    CreatedBy = obj.CreatedBy,
                    CreatedTime = DateTime.Now,
                    IsDeleted = false,
                    //MarkWholeProduct = mark.Any() ? true : false
                };
                _context.ProductInStocks.Add(storeInventoryObj);
            }
        }

        private void AddPackAndStock(ProductLocatedMapping data)
        {
            var packCode = $"PACK_{data.ProductQrCode}";
            var listPack = new List<WarehouseRecordsPack>();//Thêm dữ liệu bảng bút toán xếp kho
            var mark = _context.ProdReceivedAttrValues.Where(x => !x.IsDeleted && x.TicketImpCode.Equals(data.TicketCode));

            for (int i = 1; i <= data.Quantity; i++)
            {
                var detailPackCode = $"PACK_{data.ProductQrCode}";
                if (data.Quantity > 1)
                    packCode = $"{detailPackCode}_{i}";

                var pack = new WarehouseRecordsPack
                {
                    PackCode = packCode,
                    QrCode = packCode,
                    PackName = packCode,
                    PackLevel = "0",
                    PackHierarchyPath = packCode,
                    PackType = "PACK_TYPE_BOX",
                    PackQuantity = 1,
                    CreatedBy = User.Identity.Name,
                    CreatedTime = DateTime.Now,
                    ImportHeaderCode = data.TicketCode,
                    PackParent = GetParent(data.ProductCode, data.PackType, data.TicketCode)
                };

                listPack.Add(pack);
            }

            foreach (var item in listPack)
            {
                var exitPack = _context.WarehouseRecordsPacks.Any(x => !x.IsDeleted && x.PackCode.Equals(item.PackCode));
                if (!exitPack)
                    _context.WarehouseRecordsPacks.Add(item);
            }

            packCode = listPack.FirstOrDefault()?.PackCode;

            var storeInventory = _context.ProductInStocks.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(data.ProductQrCode));
            if (storeInventory != null)
            {
                storeInventory.Quantity = storeInventory.Quantity + data.Quantity.Value;
                storeInventory.PackCode = packCode;
                _context.ProductInStocks.Update(storeInventory);
            }
            else
            {
                var storeInventoryObj = new ProductInStock
                {
                    //LotProductCode = obj.LotProductCode,
                    StoreCode = data.WHS_Code,

                    ProductCode = data.ProductCode,
                    ProductType = data.ProductType,
                    ProductQrCode = data.ProductQrCode,
                    Quantity = data.Quantity.Value,
                    Unit = data.Unit,
                    CreatedBy = data.CreatedBy,
                    CreatedTime = DateTime.Now,
                    IsDeleted = false,
                    MarkWholeProduct = mark.Any() ? true : false,
                    PackCode = packCode
                };
                _context.ProductInStocks.Add(storeInventoryObj);
            }
        }

        public string GetParent(string productCode, string packing, string ticketCode)
        {
            var parentCode = string.Empty;
            try
            {
                var listDetail = (from a in _context.ProductImportDetails.Where(x => !x.IsDeleted && x.TicketCode.Equals(ticketCode) && x.ProductCode.Equals(productCode))
                                  select new Packing
                                  {
                                      PackType = a.PackType,
                                      PackCode = a.PackCode
                                  }).ToList();

                listDetail.ForEach(x => x.CountUnit = x.PackType.Split("x").Count());
                var materialProduct = _context.MaterialProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductCode.Equals(productCode));
                var packingDefault = materialProduct != null ? materialProduct.Packing : "";
                var listUnitDefault = packingDefault.Split("x");
                var listUnitNew = packing.Split("x");
                if (listUnitNew.Count() < listUnitDefault.Count())
                {
                    var detail = listDetail.FirstOrDefault(x => x.CountUnit == listUnitNew.Count() + 1);
                    parentCode = detail != null ? detail.PackCode : "";
                }
            }
            catch (Exception ex)
            {
                return "";
            }

            return parentCode;
        }


        [HttpPost]
        public JsonResult GetListProductInStore()
        {
            var data = from a in _context.ProductInStocks
                       join b in _context.MaterialProducts on a.ProductCode equals b.ProductCode
                       //join b in _context.EDMSRacks on a.RackCode equals b.RackCode into b1
                       //from b in b1.DefaultIfEmpty()
                       //join c in _context.PAreaMappingsStore.Where(x => !x.IsDeleted) on a.MappingCode equals c.ObjectCode
                       //join e in _context.PAreaCategoriesStore.Where(x => x.IsDeleted == false)
                       //    on new { c.CategoryCode, c.ObjectType } equals new
                       //    { CategoryCode = e.Code, ObjectType = e.PAreaType }
                       where a.IsDeleted == false && b.IsDeleted == false
                       select new
                       {
                           a.Id,
                           a.ProductQrCode,
                           a.Quantity,
                           a.Unit,
                           a.IdImpProduct,
                           Title = $"{b.ProductName} [ {a.ProductQrCode} - {a.Id} ]"
                           //Name = e.PAreaDescription,
                           //Title = a.ProductQrCode + " " + e.PAreaDescription
                       };
            return Json(data);
        }
        [HttpPost]
        public JsonResult GetListProductForSearching()
        {
            var data = from a in _context.MaterialProducts
                       join b in _context.ProductInStocks on a.ProductCode equals b.ProductCode
                       //join b in _context.EDMSRacks on a.RackCode equals b.RackCode into b1
                       //from b in b1.DefaultIfEmpty()
                       //join c in _context.PAreaMappingsStore.Where(x => !x.IsDeleted) on a.MappingCode equals c.ObjectCode
                       //join e in _context.PAreaCategoriesStore.Where(x => x.IsDeleted == false)
                       //    on new { c.CategoryCode, c.ObjectType } equals new
                       //    { CategoryCode = e.Code, ObjectType = e.PAreaType }
                       where a.IsDeleted == false && b.IsDeleted == false
                       select new
                       {
                           a.Id,
                           a.ProductCode,
                           Title = a.ProductCode + " " + a.ProductName
                       };
            return Json(data);
        }
        public class ProductInfo : IProductWithPosition
        {
            public int Id { get; set; }
            public string ProductQrCode { get; set; }
            public string ProductCode { get; set; }
            public decimal? Quantity { get; set; }
            public decimal? QuantityInStock { get; set; }
            public string ProductNo { get; set; }
            public object GattrCode { get; set; }
            public string GattrFlatCode { get; set; }
            public string GattrJson { get; set; }
            public string Unit { get; set; }
            public MaterialProduct Category { get; set; }
            public string QrCode { get; set; }
            public string BarCode { get; set; }
            public string ProductType { get; set; }
            public string LotProductCode { get; set; }
            public string StoreCode { get; set; }
            public string TicketImpCode { get; set; }
            public string TicketExpCode { get; set; }
            public string ProductName { get; set; }
            public string Position { get; set; }
            public string MappingCode { get; set; }
            public string Serial { get; set; }
            public int IdMap { get; set; }
        }
        [HttpPost]
        public JsonResult GetInfoProductInStore(int id)
        {
            var data = (from a1 in _context.ProductInStocks.Where(x => !x.IsDeleted)
                        join a in _context.ProductLocatedMappings on a1.ProductQrCode equals a.ProductQrCode into a2
                        from a in a2.DefaultIfEmpty()
                        join b in _context.ProductGattrExts.Where(x => !x.IsDeleted)
                        on a.GattrCode equals b.GattrCode into b1
                        from b in b1.DefaultIfEmpty()
                            //join b in _context.ProductInStocks on a.ProductQrCode equals b.ProductQrCode
                        join c in _context.ProductImportDetails on a1.IdImpProduct equals c.Id into c1
                        from c in c1.DefaultIfEmpty()
                        join d in _context.ProductExportDetails on a.Id equals d.MapId into d1
                        from d in d1.DefaultIfEmpty()
                        join e in _context.MaterialProducts on a1.ProductCode equals e.ProductCode into e1
                        from e in e1.DefaultIfEmpty()
                        join f in _context.PAreaMappingsStore.Where(x => !x.IsDeleted) on a.MappingCode equals f.ObjectCode into f1
                        from f in f1.DefaultIfEmpty()
                        join g in _context.PAreaCategoriesStore.Where(x => x.IsDeleted == false)
                            on new { f.CategoryCode, f.ObjectType } equals new
                            { CategoryCode = g.Code, ObjectType = g.PAreaType } into g1
                        from g in g1.DefaultIfEmpty()
                            //from f in f1.DefaultIfEmpty()
                            //join g in _context.EDMSFloors on a.FloorCode equals g.FloorCode into g1
                            //from g in g1.DefaultIfEmpty()
                            //join h in _context.EDMSLines on a.LineCode equals h.LineCode into h1
                            //from h in h1.DefaultIfEmpty()
                            //join i in _context.EDMSRacks on a.RackCode equals i.RackCode into i1
                            //from i in i1.DefaultIfEmpty()
                        where a.IsDeleted == false && a1.Id.Equals(id)
                        select new ProductInfo
                        {
                            Id = a1.Id,
                            ProductQrCode = a1.ProductQrCode,
                            ProductCode = a1.ProductCode,
                            Quantity = a != null ? a.Quantity : 0,
                            QuantityInStock = a1.Quantity,
                            ProductNo = a != null ? a.ProductNo : "",
                            GattrCode = a != null ? a.GattrCode : "",
                            GattrFlatCode = b != null ? b.GattrFlatCode : "Cơ bản",
                            GattrJson = b != null ? b.GattrJson : "{}",
                            Unit = a1.Unit,
                            Category = e,
                            QrCode = CommonUtil.GenerateQRCode(a1.ProductQrCode),
                            BarCode = CommonUtil.GenerateBarCode(a1.ProductQrCode),
                            ProductType = !string.IsNullOrEmpty(a1.LotProductCode) ? "Sản phẩm theo lô" : "Sản phẩm lẻ",
                            LotProductCode = !string.IsNullOrEmpty(a1.LotProductCode) ? a1.LotProductCode : "Sản phẩm không theo lô",
                            StoreCode = a1.StoreCode,
                            TicketImpCode = c != null ? c.TicketCode : "",
                            TicketExpCode = d.TicketCode != null ? d.TicketCode : "Sản phẩm chưa được xuất kho",
                            ProductName = e != null ? e.ProductName : "",
                            Position = f != null ? f.ObjectCode : ""
                        }).ToList().GroupBy(x => x.Id).Select(g => new
                        {
                            ObjInStock = g.FirstOrDefault(),
                            Category = g.FirstOrDefault().Category,
                            ListMapping = g.Where(x => !string.IsNullOrEmpty(x.Position)).ToList()
                        });
            return Json(data);
        }


        [HttpPost]
        public JsonResult GetInfoProductInStoreNew(int id, string serial)
        {
            var data = (from a1 in _context.ProductInStocks.Where(x => !x.IsDeleted)
                        join a in _context.ProductLocatedMappings on a1.ProductQrCode equals a.ProductQrCode into a2
                        from a in a2.DefaultIfEmpty()
                        join b in _context.ProductGattrExts.Where(x => !x.IsDeleted)
                        on a.GattrCode equals b.GattrCode into b1
                        from b in b1.DefaultIfEmpty()
                            //join b in _context.ProductInStocks on a.ProductQrCode equals b.ProductQrCode
                        join c in _context.ProductImportDetails on a1.IdImpProduct equals c.Id into c1
                        from c in c1.DefaultIfEmpty()
                        join d in _context.ProductExportDetails on a.Id equals d.MapId into d1
                        from d in d1.DefaultIfEmpty()
                        join e in _context.MaterialProducts on a1.ProductCode equals e.ProductCode into e1
                        from e in e1.DefaultIfEmpty()
                        join f in _context.PAreaMappingsStore.Where(x => !x.IsDeleted) on a.MappingCode equals f.ObjectCode into f1
                        from f in f1.DefaultIfEmpty()
                        join g in _context.PAreaCategoriesStore.Where(x => x.IsDeleted == false)
                            on new { f.CategoryCode, f.ObjectType } equals new
                            { CategoryCode = g.Code, ObjectType = g.PAreaType } into g1
                        from g in g1.DefaultIfEmpty()
                            //from f in f1.DefaultIfEmpty()
                            //join g in _context.EDMSFloors on a.FloorCode equals g.FloorCode into g1
                            //from g in g1.DefaultIfEmpty()
                            //join h in _context.EDMSLines on a.LineCode equals h.LineCode into h1
                            //from h in h1.DefaultIfEmpty()
                            //join i in _context.EDMSRacks on a.RackCode equals i.RackCode into i1
                            //from i in i1.DefaultIfEmpty()
                        where a.IsDeleted == false && a1.Id.Equals(id) && (string.IsNullOrEmpty(serial) || e.Serial.Equals(serial))
                        select new ProductInfo
                        {
                            Id = a1.Id,
                            ProductQrCode = a1.ProductQrCode,
                            ProductCode = a1.ProductCode,
                            IdMap = a != null ? a.Id : -1,
                            Quantity = a != null ? a.Quantity : 0,
                            QuantityInStock = a1.Quantity,
                            ProductNo = a != null ? a.ProductNo : "",
                            GattrCode = a != null ? a.GattrCode : "",
                            GattrFlatCode = b != null ? b.GattrFlatCode : "Cơ bản",
                            GattrJson = b != null ? b.GattrJson : "{}",
                            Unit = a1.Unit,
                            Category = e,
                            QrCode = CommonUtil.GenerateQRCode(a1.ProductQrCode),
                            BarCode = CommonUtil.GenerateBarCode(a1.ProductQrCode),
                            ProductType = !string.IsNullOrEmpty(a1.LotProductCode) ? "Sản phẩm theo lô" : "Sản phẩm lẻ",
                            LotProductCode = !string.IsNullOrEmpty(a1.LotProductCode) ? a1.LotProductCode : "Sản phẩm không theo lô",
                            StoreCode = a1.StoreCode,
                            TicketImpCode = c != null ? c.TicketCode : "",
                            TicketExpCode = d.TicketCode != null ? d.TicketCode : "Sản phẩm chưa được xuất kho",
                            ProductName = e != null ? e.ProductName : "",
                            Position = f != null ? f.ObjectCode : "",
                            Serial = e != null ? e.Serial : ""
                        }).ToList().GroupBy(x => x.Id).Select(g => new
                        {
                            ObjInStock = g.FirstOrDefault(),
                            Category = g.FirstOrDefault().Category,
                            ListMapping = g.Where(x => !string.IsNullOrEmpty(x.Position))
                            .DistinctBy(x => new { x.IdMap, x.Position }).ToList()
                        });
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetHistoryProductInStore(int id)
        {
            var data = (from a in _context.ProductLocatedMappingLogs
                        join a1 in _context.ProductInStocks.Where(x => !x.IsDeleted) on a.ProductQrCode equals a1.ProductQrCode into a2
                        from a1 in a2.DefaultIfEmpty()
                        join b in _context.ProductGattrExts.Where(x => !x.IsDeleted)
                        on a.GattrCode equals b.GattrCode into b1
                        from b in b1.DefaultIfEmpty()
                            //join b in _context.ProductInStocks on a.ProductQrCode equals b.ProductQrCode
                        join c in _context.ProductImportHeaders.Where(x => !x.IsDeleted) on new { a.TicketCode, a.Type } equals new { c.TicketCode, Type = "IMPORT_RETURN" } into c1
                        from c in c1.DefaultIfEmpty() // Return components to product
                        join d in _context.ProductExportHeaders.Where(x => !x.IsDeleted) on new { a.TicketCode, a.Type } equals new { d.TicketCode, Type = "EXPORT_PARTIAL" } into d1
                        from d in d1.DefaultIfEmpty() // Export components of product
                        join e in _context.ProductImportHeaders.Where(x => !x.IsDeleted) on new { a.TicketCode, a.Type } equals new { e.TicketCode, Type = "ARRANGE_IMP" } into e1
                        from e in e1.DefaultIfEmpty() // Arrange product in stock
                        join f in _context.ProductExportHeaders.Where(x => !x.IsDeleted) on new { a.TicketCode, a.Type } equals new { f.TicketCode, Type = "EXPORT_FULL" } into f1
                        from f in f1.DefaultIfEmpty() // Export full product from position
                                                      // type == "REARRANGE" mean move position from old position to another position
                        where a.IsDeleted == false && a1.Id.Equals(id)
                        select new
                        {
                            Quantity = a.Quantity,
                            ProductNo = a.ProductNo,
                            GattrCode = a.GattrCode,
                            GattrFlatCode = b != null ? b.GattrFlatCode : "Cơ bản",
                            GattrJson = b != null ? b.GattrJson : "{}",
                            Unit = a1 != null ? a1.Unit : "",
                            Type = a.Type,
                            TicketCodeImpReturn = c != null ? c.TicketCode : "",
                            TicketNameImpReturn = c != null ? c.Title : "",
                            TicketCodeExportPartial = d != null ? d.TicketCode : "",
                            TicketNameExportPartial = d != null ? d.Title : "",
                            TicketCodeImpArrange = e != null ? e.TicketCode : "",
                            TicketNameImpArrange = e != null ? e.Title : "",
                            TicketCodeExportFull = f != null ? f.TicketCode : "",
                            TicketNameExportFull = f != null ? f.Title : "",
                            MappingCode = a.MappingCode,
                            MappingCodeOld = a.MappingCodeOld,
                            CreatedTime = a.CreatedTime,
                            IsTicketExist = (new List<object> { c, d, e, f }).Any(x => x != null)
                        }).Where(x => x.IsTicketExist);
            return Json(data);
        }

        public class JTableModelCustomhistory
        {
            public string Code { get; set; }
            public string Name { get; set; }
            public string FromTo { get; set; }
            public string DateTo { get; set; }
            public string Category { get; set; }
            public string Group { get; set; }
            public string Type { get; set; }
            public string Status { get; set; }
            public string ContractCode { get; set; }
            public string CusCode { get; set; }
            public string SupCode { get; set; }
            public string MappingCode { get; set; }
        }
        [HttpPost]
        public JsonResult GetHistoryProductCategory(JTableModelCustomhistory jTablePara)
        {
            JMessage msg = new JMessage();
            try
            {
                DateTime? fromDate = !string.IsNullOrEmpty(jTablePara.FromTo) ? DateTime.ParseExact(jTablePara.FromTo, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                DateTime? toDate = !string.IsNullOrEmpty(jTablePara.DateTo) ? DateTime.ParseExact(jTablePara.DateTo, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

                msg.Object = (from a in _context.ProductLocatedMappingLogs
                              join a1 in _context.ProductInStocks.Where(x => !x.IsDeleted) on a.ProductQrCode equals a1.ProductQrCode into a2
                              from a1 in a2.DefaultIfEmpty()
                              join b in _context.ProductGattrExts.Where(x => !x.IsDeleted)
                              on a.GattrCode equals b.GattrCode into b1
                              from b in b1.DefaultIfEmpty()
                                  //join b in _context.ProductInStocks on a.ProductQrCode equals b.ProductQrCode
                              join c in _context.ProductImportHeaders on new { a.TicketCode, a.Type } equals new { c.TicketCode, Type = "IMPORT_RETURN" } into c1
                              from c in c1.DefaultIfEmpty() // Return components to product
                              join d in _context.ProductExportHeaders on new { a.TicketCode, a.Type } equals new { d.TicketCode, Type = "EXPORT_PARTIAL" } into d1
                              from d in d1.DefaultIfEmpty() // Export components of product
                              join e in _context.ProductImportHeaders on new { a.TicketCode, a.Type } equals new { e.TicketCode, Type = "ARRANGE_IMP" } into e1
                              from e in e1.DefaultIfEmpty() // Arrange product in stock
                              join f in _context.ProductExportHeaders on new { a.TicketCode, a.Type } equals new { f.TicketCode, Type = "EXPORT_FULL" } into f1
                              from f in f1.DefaultIfEmpty() // Export full product from position
                                                            // type == "REARRANGE" mean move position from old position to another position
                              where a.IsDeleted == false && a.ProductCode.Equals(jTablePara.Code)
                              && (string.IsNullOrEmpty(jTablePara.Type) || a.Type.Contains(jTablePara.Type))
                              && (string.IsNullOrEmpty(jTablePara.Name)
                              || (c != null && (c.Title.Contains(jTablePara.Name) || c.TicketCode.Contains(jTablePara.Name)))
                              || (d != null && (d.Title.Contains(jTablePara.Name) || d.TicketCode.Contains(jTablePara.Name)))
                              || (e != null && (e.Title.Contains(jTablePara.Name) || e.TicketCode.Contains(jTablePara.Name)))
                              || (f != null && (f.Title.Contains(jTablePara.Name) || f.TicketCode.Contains(jTablePara.Name)))
                              )
                              && (string.IsNullOrEmpty(jTablePara.MappingCode)
                              || a.MappingCode.Contains(jTablePara.MappingCode)
                              || (a.Type == "REARRANGE" && a.MappingCodeOld.Contains(jTablePara.MappingCode))
                              )
                              select new
                              {
                                  Quantity = a.Quantity,
                                  ProductNo = a.ProductNo,
                                  GattrCode = a.GattrCode,
                                  GattrFlatCode = b != null ? b.GattrFlatCode : "Cơ bản",
                                  GattrJson = b != null ? b.GattrJson : "{}",
                                  Unit = a1 != null ? a1.Unit : "",
                                  Type = a.Type,
                                  TicketCodeImpReturn = c != null ? c.TicketCode : "",
                                  TicketNameImpReturn = c != null ? c.Title : "",
                                  TicketCodeExportPartial = d != null ? d.TicketCode : "",
                                  TicketNameExportPartial = d != null ? d.Title : "",
                                  TicketCodeImpArrange = e != null ? e.TicketCode : "",
                                  TicketNameImpArrange = e != null ? e.Title : "",
                                  TicketCodeExportFull = f != null ? f.TicketCode : "",
                                  TicketNameExportFull = f != null ? f.Title : "",
                                  MappingCode = a.MappingCode,
                                  MappingCodeOld = a.MappingCodeOld,
                                  CreatedTime = a.CreatedTime,
                                  IsTicketExist = (new List<object> { c, d, e, f }).Any(x => x != null)
                              }).Where(x => x.IsTicketExist).ToList().OrderByDescending(x => x.CreatedTime);
            }
            catch (Exception ex)
            {
                msg.Object = new List<object>();
                msg.Error = true;
                msg.Title = "Có lỗi khi xóa !";
            }

            return Json(msg);
        }

        [HttpPost]
        public object JTableFileProductInStock(string productQrCode)
        {
            var msg = new JMessage();
            try
            {
                msg.Object = ((from a in _context.EDMSRepoCatFiles.Where(x =>
                        x.ObjectCode == productQrCode && x.ObjectType ==
                        EnumHelper<EnumMaterialProduct>.GetDisplayValue(EnumMaterialProduct.ProductInStock))
                               join b in _context.EDMSFiles on a.FileCode equals b.FileCode
                               join f in _context.EDMSRepositorys on a.ReposCode equals f.ReposCode into f1
                               from f in f1.DefaultIfEmpty()
                               select new
                               {
                                   a.Id,
                                   b.FileCode,
                                   b.FileName,
                                   b.FileTypePhysic,
                                   b.Desc,
                                   b.CreatedTime,
                                   b.CloudFileId,
                                   TypeFile = "NO_SHARE",
                                   ReposName = f != null ? f.ReposName : "",
                               }).Union(
                    from a in _context.EDMSObjectShareFiles.Where(x =>
                        x.ObjectCode == productQrCode && x.ObjectType ==
                        EnumHelper<EnumMaterialProduct>.GetDisplayValue(EnumMaterialProduct.ProductInStock))
                    join b in _context.EDMSFiles on a.FileCode equals b.FileCode
                    join f in _context.EDMSRepositorys on b.ReposCode equals f.ReposCode into f1
                    from f in f1.DefaultIfEmpty()
                    select new
                    {
                        Id = b.FileID,
                        b.FileCode,
                        b.FileName,
                        b.FileTypePhysic,
                        b.Desc,
                        b.CreatedTime,
                        b.CloudFileId,
                        TypeFile = "SHARE",
                        ReposName = f != null ? f.ReposName : "",
                    })).AsNoTracking();
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi lấy dữ liệu!";
                msg.Object = ex.Message;
            }

            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetInfoRack(string rackCode)
        {
            var msg = new JMessage();
            try
            {
                var LineName = "";
                var FloorName = "";
                var WHSName = "";
                var rack = _context.EDMSRacks.FirstOrDefault(x => x.RackCode == rackCode);
                if (rack != null)
                {
                    var line = _context.EDMSLines.FirstOrDefault(x => x.LineCode.Equals(rack.LineCode));
                    if (line != null)
                    {
                        LineName = line.L_Text;

                        var floor = _context.EDMSFloors.FirstOrDefault(x => x.FloorCode.Equals(line.FloorCode));
                        if (floor != null)
                        {
                            FloorName = floor.FloorName;

                            var wareHouse = _context.EDMSWareHouses.Where(x => x.WHS_Flag != true && x.Type == "PR")
                                .FirstOrDefault(x => x.WHS_Flag != true && x.WHS_Code.Equals(floor.WHS_Code));
                            if (wareHouse != null)
                                WHSName = wareHouse.WHS_Name;
                        }
                    }
                }

                msg.Object = new
                {
                    RackName = rack != null ? rack.RackName : "",
                    LineName = LineName,
                    FloorName = FloorName,
                    WHSName = WHSName,
                };
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra!";
            }

            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetInfoProductMap(string ProductCode)
        {
            var msg = new JMessage();
            try
            {

                var maxId = _context.ProductLocatedMappings.MaxBy(x => x.Id) != null ? _context.ProductLocatedMappings.MaxBy(x => x.Id).Id : 1;
                var product = _context.MaterialProducts.FirstOrDefault(x => x.ProductCode == ProductCode);

                msg.Object = new
                {
                    ProductCode = product != null ? product.ProductCode : "",
                    ProductType = product != null ? product.TypeCode : "",
                    PackType = product != null ? product.Packing : "",
                    ProductQrCode = product != null ? product.ProductCode + "_M_" + maxId : "",
                    ProductName = product != null ? product.ProductName : "",
                    Unit = product != null ? product.Unit : "",
                };
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra!";
            }

            return Json(msg);
        }
        [HttpPost]
        public JsonResult GetInfoProductInStock(string productQrCode = "", string productCode = "", string storeCode = "", string qrCode = "")
        {
            var msg = new JMessage();
            try
            {
                if (!string.IsNullOrEmpty(productQrCode))
                {
                    var data = (from a in _context.ProductImportDetails.Where(x => !x.IsDeleted && x.ProductQrCode == productQrCode)
                                join b in _context.MaterialProducts.Where(x => !x.IsDeleted) on a.ProductCode equals b.ProductCode
                                join c in _context.CommonSettings.Where(x => !x.IsDeleted) on b.UnitWeight equals c.CodeSet into c1
                                from c2 in c1.DefaultIfEmpty()
                                join d in _context.ProductInStocks.Where(x => !x.IsDeleted && x.IdImpProduct.HasValue) on
                                 new { IdImpProduct = a.Id, a.GattrCode } equals new { IdImpProduct = d.IdImpProduct.Value, d.GattrCode } into d1
                                from d in d1.DefaultIfEmpty()
                                join e in _context.MaterialProductGroups.Where(x => !x.IsDeleted) on b.GroupCode equals e.Code into e1
                                from e in e1.DefaultIfEmpty()
                                    //join e in _context.ProductLocatedMappings.Where(x => !x.IsDeleted) on a.Id equals e.IdImpProduct into e1
                                    //from e in e1.DefaultIfEmpty()
                                select new
                                {
                                    Id = a.Id,
                                    ProductCode = b != null ? b.ProductCode : "",
                                    ProductType = b != null ? b.TypeCode : "",
                                    PackType = b != null ? b.Packing : "",
                                    ProductQrCode = a.ProductQrCode,
                                    ProductName = b != null ? b.ProductName : "",
                                    Unit = b != null ? b.Unit : "",
                                    ProductNo = d != null ? d.ProductNo : "",
                                    GroupCode = b.GroupCode,
                                    //ListProductNo = a.ProductNo != null ? a.ListProductNo : new List<int>(),
                                    StockId = d != null ? d.Id : -1,
                                    Max = d != null ? d.Quantity : 0,
                                    GroupType = e != null ? e.GroupType : "",
                                    //IsMapped = e != null
                                }).FirstOrDefault();

                    msg.Object = data;
                }
                if (!string.IsNullOrEmpty(qrCode))
                {
                    var data = (from a in _context.ProductQrCodes.Where(x => x.QrCode == qrCode)
                                join b in _context.MaterialProducts.Where(x => !x.IsDeleted) on a.ProductCode equals b.ProductCode
                                join c in _context.CommonSettings.Where(x => !x.IsDeleted) on b.UnitWeight equals c.CodeSet into c1
                                from c2 in c1.DefaultIfEmpty()
                                join d in _context.ProductInStocks.Where(x => !x.IsDeleted && x.IdImpProduct.HasValue) on
                                 a.ProductCode equals d.ProductCode into d1
                                from d in d1.DefaultIfEmpty()
                                join e in _context.MaterialProductGroups.Where(x => !x.IsDeleted) on b.GroupCode equals e.Code into e1
                                from e in e1.DefaultIfEmpty()
                                    //join e in _context.ProductLocatedMappings.Where(x => !x.IsDeleted) on a.Id equals e.IdImpProduct into e1
                                    //from e in e1.DefaultIfEmpty()
                                select new
                                {
                                    Id = d != null ? d.IdImpProduct : -1,
                                    ProductCode = b != null ? b.ProductCode : "",
                                    ProductType = b != null ? b.TypeCode : "",
                                    PackType = b != null ? b.Packing : "",
                                    ProductQrCode = d != null ? d.ProductQrCode : "",
                                    ProductName = b != null ? b.ProductName : "",
                                    Unit = b != null ? b.Unit : "",
                                    ProductNo = d != null ? d.ProductNo : "",
                                    GroupCode = b.GroupCode,
                                    //ListProductNo = a.ProductNo != null ? a.ListProductNo : new List<int>(),
                                    StockId = d != null ? d.Id : -1,
                                    Max = d != null ? d.Quantity : 0,
                                    GroupType = e != null ? e.GroupType : "",
                                    //IsMapped = e != null
                                }).FirstOrDefault();

                    msg.Object = data;
                }
                if (msg.Object == null)
                {
                    var objProduct = _context.MaterialProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == productCode);
                    var objStore = _context.EDMSWareHouses.FirstOrDefault(x => x.WHS_Flag == false && x.WHS_Code == storeCode);
                    msg.Error = true;
                    msg.Title = $"Sản phẩm {objProduct?.ProductName ?? "quét"} không nằm trong kho {objStore?.WHS_Name ?? ""}";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra!";
            }

            return Json(msg);
        }
        [HttpPost]
        public JsonResult GetListPositionInStock(string productQrCode = "", string productCode = "", string storeCode = "")
        {
            var msg = new JMessage();
            try
            {
                if (!string.IsNullOrEmpty(productQrCode))
                {
                    var data = (from a in _context.ProductImportDetails.Where(x => !x.IsDeleted && x.ProductQrCode == productQrCode)
                                join b in _context.MaterialProducts.Where(x => !x.IsDeleted) on a.ProductCode equals b.ProductCode
                                join c in _context.CommonSettings.Where(x => !x.IsDeleted) on b.UnitWeight equals c.CodeSet into c1
                                from c2 in c1.DefaultIfEmpty()
                                    //join d in _context.ProductInStocks.Where(x => !x.IsDeleted && x.IdImpProduct.HasValue) on
                                    // new { IdImpProduct = a.Id, a.GattrCode } equals new { IdImpProduct = d.IdImpProduct.Value, d.GattrCode } into d1
                                    //from d in d1.DefaultIfEmpty()
                                join e in _context.ProductLocatedMappings.Where(x => !x.IsDeleted) on a.Id equals e.IdImpProduct into e1
                                from e in e1.DefaultIfEmpty()
                                select new
                                {
                                    Id = a.Id,
                                    ProductCode = b != null ? b.ProductCode : "",
                                    ProductType = b != null ? b.TypeCode : "",
                                    PackType = b != null ? b.Packing : "",
                                    ProductQrCode = a.ProductQrCode,
                                    ProductName = b != null ? b.ProductName : "",
                                    Unit = b != null ? b.Unit : "",
                                    ProductNo = e != null ? e.ProductNo : "",
                                    MapId = e != null ? e.Id : -1,
                                    //ListProductNo = a.ProductNo != null ? a.ListProductNo : new List<int>(),
                                    Max = e != null ? e.Quantity : 0,
                                    //IsMapped = e != null
                                });

                    msg.Object = data.ToList();
                }
                //if (msg.Object == null)
                //{
                //    var objProduct = _context.MaterialProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == productCode);
                //    var objStore = _context.PAreaCategoriesStore.FirstOrDefault(x => x.IsDeleted == false && x.PAreaCode == storeCode && x.PAreaType == "AREA");
                //    msg.Error = true;
                //    msg.Title = $"Sản phẩm {objProduct?.ProductName ?? "quét"} không nằm trong kho ${objStore?.PAreaDescription ?? ""}";
                //}
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra!";
            }

            return Json(msg);
        }
        [HttpPost]
        public JsonResult GetInfoProductInCategory(string productQrCode = "", string productCode = "", string storeCode = "")
        {
            var msg = new JMessage();
            try
            {
                if (!string.IsNullOrEmpty(productQrCode))
                {
                    var data = (from a in _context.ProductImportDetails.Where(x => !x.IsDeleted && x.ProductQrCode == productQrCode)
                                join b in _context.MaterialProducts.Where(x => !x.IsDeleted) on a.ProductCode equals b.ProductCode
                                join c in _context.CommonSettings.Where(x => !x.IsDeleted) on b.UnitWeight equals c.CodeSet into c1
                                from c2 in c1.DefaultIfEmpty()
                                join d in _context.ProductLocatedMappings.Where(x => !x.IsDeleted) on a.ProductQrCode equals d.ProductQrCode into d1
                                from d in d1.DefaultIfEmpty()
                                select new
                                {
                                    Id = a.Id,
                                    ProductCode = b != null ? b.ProductCode : "",
                                    ProductType = b != null ? b.TypeCode : "",
                                    PackType = b != null ? b.Packing : "",
                                    ProductQrCode = a.ProductQrCode,
                                    ProductName = b != null ? b.ProductName : "",
                                    Unit = b != null ? b.Unit : "",
                                    a.ProductNo,
                                    //ListProductNo = a.ProductNo != null ? a.ListProductNo : new List<int>(),
                                    Max = a.Quantity,
                                    IsMapped = d != null
                                }).FirstOrDefault();

                    msg.Object = data;
                }
                //if (!string.IsNullOrEmpty(productCode) && msg.Object == null)
                //{
                //    var data = (from b in _context.MaterialProducts.Where(x => !x.IsDeleted) /*on a.ProductCode equals b.ProductCode*/
                //                join c in _context.CommonSettings.Where(x => !x.IsDeleted) on b.UnitWeight equals c.CodeSet into c1
                //                from c2 in c1.DefaultIfEmpty()
                //                    //join d in _context.ProductLocatedMappings.Where(x => !x.IsDeleted) on a.ProductQrCode equals d.ProductQrCode into d1
                //                    //from d in d1.DefaultIfEmpty()
                //                select new
                //                {
                //                    ProductCode = b != null ? b.ProductCode : "",
                //                    ProductType = b != null ? b.TypeCode : "",
                //                    PackType = b != null ? b.Packing : "",
                //                    ProductQrCode = b.ProductCode + "_" + storeCode + "_0",
                //                    ProductName = b != null ? b.ProductName : "",
                //                    Unit = b != null ? b.Unit : "",
                //                    //ListProductNo = a.ProductNo != null ? a.ListProductNo : new List<int>(),
                //                    //Max = a.Quantity,
                //                    //IsMapped = d != null
                //                }).FirstOrDefault();

                //    msg.Object = data;
                //}
                if (msg.Object == null)
                {
                    var objProduct = _context.MaterialProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == productCode);
                    var objStore = _context.EDMSWareHouses.FirstOrDefault(x => x.WHS_Flag == false && x.WHS_Code == storeCode);
                    msg.Error = true;
                    msg.Title = $"Sản phẩm {objProduct?.ProductName ?? "quét"} không nằm trong kho ${objStore?.WHS_Name ?? "đã quét"}";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra!";
            }

            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetPositionProductVatco(int id, string mappingCode)
        {
            var prodDetail = _context.ProductImportDetails.Include(x => x.Product).ThenInclude(x => x.Group)
                .FirstOrDefault(x => !x.IsDeleted && x.Id.Equals(id));
            if (prodDetail?.Product?.Group?.GroupType == "STATIC_TANK")
            {
                var data = (from a in _context.ProductLocatedMappings.Where(x => !x.IsDeleted).Include(x => x.Product)
                            join b in _context.ProductGattrExts.Where(x => !x.IsDeleted)
                            on a.GattrCode equals b.GattrCode into b1
                            from b in b1.DefaultIfEmpty()
                                //join b in _context.EDMSLines on a.LineCode equals b.LineCode
                                //join c in _context.EDMSRacks on a.RackCode equals c.RackCode
                            where a.ProductCode == prodDetail.ProductCode
                        && (string.IsNullOrEmpty(mappingCode) || a.MappingCode.Equals(mappingCode))
                            select new
                            {
                                a.Id,
                                ProductCode = a.Product != null ? a.Product.ProductCode : a.ProductCode,
                                ProductName = a.Product != null ? a.Product.ProductName : "",
                                a.ProductQrCode,
                                a.ProductNo,
                                a.Remain,
                                a.Size,
                                Ordered = a.Size,
                                a.TicketImpCode,
                                PositionInStore = a.MappingCode,
                                a.Quantity,
                                GattrFlatCode = b != null ? b.GattrFlatCode : "Cơ bản",
                                GattrJson = b != null ? b.GattrJson : "{}",
                                //a.RackCode,
                                //a.RackPosition,
                                a.CreatedBy,
                                a.CreatedTime,
                                a.UpdatedBy,
                                a.UpdatedTime
                            }).OrderBy(x => x.CreatedTime).ThenBy(p => p.PositionInStore);
                return Json(data);
            }
            else
            {
                var data = (from a in _context.ProductLocatedMappings.Where(x => !x.IsDeleted).Include(x => x.Product)
                            join b in _context.ProductGattrExts.Where(x => !x.IsDeleted)
                            on a.GattrCode equals b.GattrCode into b1
                            from b in b1.DefaultIfEmpty()
                                //join b in _context.EDMSLines on a.LineCode equals b.LineCode
                                //join c in _context.EDMSRacks on a.RackCode equals c.RackCode
                            where a.IdImpProduct.Equals(id) /*&& a.TicketImpCode.Equals(ticketCode)*/
                            && (string.IsNullOrEmpty(mappingCode) || a.MappingCode.Equals(mappingCode))
                            select new
                            {
                                a.Id,
                                a.ProductQrCode,
                                a.ProductNo,
                                ProductCode = a.Product != null ? a.Product.ProductCode : a.ProductCode,
                                ProductName = a.Product != null ? a.Product.ProductName : "",
                                a.Remain,
                                a.Size,
                                Ordered = a.Size,
                                a.TicketImpCode,
                                PositionInStore = a.MappingCode,
                                a.Quantity,
                                GattrFlatCode = b != null ? b.GattrFlatCode : "Cơ bản",
                                GattrJson = b != null ? b.GattrJson : "{}",
                                //a.RackCode,
                                //a.RackPosition,
                                a.CreatedBy,
                                a.CreatedTime,
                                a.UpdatedBy,
                                a.UpdatedTime
                            }).OrderBy(x => x.CreatedTime).ThenBy(p => p.PositionInStore);
                return Json(data);
            }
        }
        [HttpGet]
        public object CheckProductInStore(string idImportProduct)
        {
            try
            {
                var inStore = true;
                var obj = _context.ProductInStocks.AsParallel().FirstOrDefault(x => !x.IsDeleted && x.IdImpProduct?.ToString() == idImportProduct);
                if (obj != null)
                    inStore = true;

                var prodDetail = _context.ProductImportDetails.Include(x => x.Product).ThenInclude(x => x.Group)
                    .FirstOrDefault(x => !x.IsDeleted && x.Id.ToString() == idImportProduct);
                if (prodDetail?.Product?.Group?.GroupType == "STATIC_TANK")
                {
                    inStore = false;
                }
                return Json(inStore);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }


        [HttpPost]
        public JsonResult DeleteOrderProduct(int id)
        {
            var msg = new JMessage();
            var data = _context.ProductLocatedMappings.Include(x => x.Product).ThenInclude(x => x.Group)
                .FirstOrDefault(x => !x.IsDeleted && x.Id == id);
            if (data != null)
            {
                if (data?.Product?.Group?.GroupType == "STATIC_TANK")
                {
                    data.MappingCode = "";
                    _context.ProductLocatedMappings.Update(data);
                }
                else
                {
                    var checkExport =
                        from a in _context.ProductExportDetails.Where(x =>
                            !x.IsDeleted && x.ProductQrCode.Equals(data.ProductQrCode))
                            //join b in _context.MapStockProdIns.Where(x => !x.IsDeleted) on a.MapId equals b.MapId
                        select new
                        {
                            a.ProductQrCode,
                            //b.MapId
                        };
                    if (checkExport.Any())
                    {
                        msg.Error = true;
                        msg.Title = "Không được xóa do sản phẩm đã xuất kho tại vị trí này";
                        return Json(msg);
                    }

                    var prodDetail = _context.ProductImportDetails.FirstOrDefault(x => !x.IsDeleted && x.Id == data.IdImpProduct);
                    if (prodDetail != null)
                    {
                        prodDetail.QuantityIsSet = Convert.ToInt32(prodDetail.QuantityIsSet - data.Quantity);
                        _context.ProductImportDetails.Update(prodDetail);

                        //var stockArrangPut = _context.StockArrangePutEntrys.FirstOrDefault(x => x.MapId == id);
                        //if (stockArrangPut != null)
                        //{
                        //    _context.StockArrangePutEntrys.Remove(stockArrangPut);
                        //}

                        //var mapStockIn = _context.MapStockProdIns.FirstOrDefault(x => x.MapId == id);
                        //if (mapStockIn != null)
                        //    _context.MapStockProdIns.Remove(mapStockIn);
                        //Delete
                        data.IsDeleted = true;
                        _context.ProductLocatedMappings.Update(data);
                        msg.Object = data.Quantity;
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = "Không tìm thấy kho dữ liệu";
                        return Json(msg);
                    }
                }
                _context.SaveChanges();
                msg.Title = "Xóa thành công!";
            }

            return Json(msg);
        }

        [HttpPost]
        public object GetItemHeaderImp(int id, string userId)
        {
            List<ComboxModel> list = new List<ComboxModel>();
            var data = _context.ProductImportHeaders.FirstOrDefault(x => x.Id == id && !x.IsDeleted);
            var check = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value &&
                                                                       x.ObjectInst.Equals(data.TicketCode)
                                                                       && x.ObjectType.Equals("IMPORT_STORE"));
            if (check != null)
            {
                var value = _context.ActivityInstances.Where(x =>
                    !x.IsDeleted && x.WorkflowCode.Equals(check.WfInstCode));
                var current = check.MarkActCurrent;
                data.WorkflowCat = check.WorkflowCode;
                var initial = value.FirstOrDefault(x => !x.IsDeleted && x.Type.Equals("TYPE_ACTIVITY_INITIAL"));
                if (initial != null)
                {
                    var name = new ComboxModel
                    {
                        IntsCode = initial.ActivityInstCode,
                        Code = initial.ActivityCode,
                        Name = initial.Title,
                        Status = initial.Status,
                        UpdateBy =
                            _context.ActivityInstances.FirstOrDefault(a =>
                                !a.IsDeleted && a.WorkflowCode.Equals(check.WfInstCode) &&
                                a.ActivityInstCode.Equals(initial.ActivityInstCode)).UpdatedBy != null
                                ? _context.Users.FirstOrDefault(x =>
                                    x.UserName.Equals(_context.ActivityInstances.FirstOrDefault(a =>
                                        !a.IsDeleted && a.WorkflowCode.Equals(check.WfInstCode) &&
                                        a.ActivityInstCode.Equals(initial.ActivityInstCode)).UpdatedBy)).GivenName
                                : null,
                        UpdateTime = _context.ActivityInstances.FirstOrDefault(x =>
                            !x.IsDeleted && x.WorkflowCode.Equals(check.WfInstCode) &&
                            x.ActivityInstCode.Equals(initial.ActivityInstCode)).UpdatedTime.ToString()
                    };
                    list.Add(name);
                }

                var location = _context.WorkflowSettings.FirstOrDefault(x =>
                    initial != null && !x.IsDeleted && x.ActivityInitial.Equals(initial.ActivityCode));
                if (location != null)
                {
                    var next = location.ActivityDestination;
                    var count = 1;
                    foreach (var item in value)
                    {
                        var inti = value.FirstOrDefault(x => !x.IsDeleted && x.ActivityCode.Equals(next));
                        if (inti != null && count < value.Count())
                        {
                            var name2 = new ComboxModel
                            {
                                IntsCode = inti.ActivityInstCode,
                                Code = inti.ActivityCode,
                                Name = inti.Title,
                                Status = inti.Status,
                                UpdateBy =
                                    _context.ActivityInstances.FirstOrDefault(a =>
                                        !a.IsDeleted && a.WorkflowCode.Equals(check.WfInstCode) &&
                                        a.ActivityInstCode.Equals(inti.ActivityInstCode)).UpdatedBy != null
                                        ? _context.Users.FirstOrDefault(x =>
                                            x.UserName.Equals(_context.ActivityInstances.FirstOrDefault(a =>
                                                !a.IsDeleted && a.WorkflowCode.Equals(check.WfInstCode) &&
                                                a.ActivityInstCode.Equals(inti.ActivityInstCode)).UpdatedBy)).GivenName
                                        : null,
                                UpdateTime = _context.ActivityInstances.FirstOrDefault(x =>
                                    !x.IsDeleted && x.WorkflowCode.Equals(check.WfInstCode) &&
                                    x.ActivityInstCode.Equals(inti.ActivityInstCode)).UpdatedTime.ToString()
                            };
                            list.Add(name2);
                            var location2 = _context.WorkflowSettings.FirstOrDefault(x =>
                                !x.IsDeleted && x.ActivityInitial.Equals(inti.ActivityCode));
                            if (location2 != null)
                            {
                                next = location2.ActivityDestination;
                            }
                        }

                        count++;
                    }
                }

                var role = value.FirstOrDefault(x => x.ActivityInstCode.Equals(check.MarkActCurrent))?.ActivityCode;
                var user = _context.ExcuterControlRoles.FirstOrDefault(x =>
                    !x.IsDeleted && x.ActivityCode.Equals(role) && x.UserId.Equals(userId));
                var hh = "";
                if (value.FirstOrDefault(x =>
                        !x.Status.Equals("STATUS_ACTIVITY_APPROVED") && x.Type.Equals("TYPE_ACTIVITY_INITIAL")) != null)
                {
                    hh = "TYPE_ACTIVITY_INITIAL";
                }
                else if (value.FirstOrDefault(x =>
                             !x.Status.Equals("STATUS_ACTIVITY_APPROVED") && x.Type.Equals("TYPE_ACTIVITY_REPEAT")) !=
                         null)
                {
                    hh = "TYPE_ACTIVITY_REPEAT";
                }
                else if (value.FirstOrDefault(x =>
                             !x.Status.Equals("STATUS_ACTIVITY_APPROVED") && x.Type.Equals("TYPE_ACTIVITY_END")) !=
                         null)
                {
                    hh = "TYPE_ACTIVITY_END";
                }

                if (user != null)
                {
                    if (hh.Equals("TYPE_ACTIVITY_INITIAL"))
                    {
                        var com = _context.CommonSettings.Where(x =>
                                !x.IsDeleted &&
                                x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.StatusActWF)))
                            .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                        return new { data, com, editrole = true, list, current };

                    }

                    if (hh.Equals("TYPE_ACTIVITY_REPEAT"))
                    {
                        var com = _context.CommonSettings.Where(x =>
                                !x.IsDeleted &&
                                x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.StatusActWFREPEAT)))
                            .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                        return new { data, com, editrole = true, list, current };
                    }

                    if (hh.Equals("TYPE_ACTIVITY_END"))
                    {
                        var com = _context.CommonSettings.Where(x =>
                                !x.IsDeleted &&
                                x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.StatusActWFFINAL)))
                            .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                        return new { data, com, editrole = true, list, current };
                    }
                    else
                    {
                        return data;
                    }
                }
                else
                {
                    if (hh.Equals("TYPE_ACTIVITY_INITIAL"))
                    {
                        var com = _context.CommonSettings.Where(x =>
                                !x.IsDeleted &&
                                x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.StatusActWF)))
                            .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                        return new { data, com, editrole = false, list, current };
                    }

                    if (hh.Equals("TYPE_ACTIVITY_REPEAT"))
                    {
                        var com = _context.CommonSettings.Where(x =>
                                !x.IsDeleted &&
                                x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.StatusActWFREPEAT)))
                            .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                        return new { data, com, editrole = false, list, current };
                    }

                    if (hh.Equals("TYPE_ACTIVITY_END"))
                    {
                        var com = _context.CommonSettings.Where(x =>
                                !x.IsDeleted &&
                                x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.StatusActWFFINAL)))
                            .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                        return new { data, com, editrole = false, list, current };
                    }
                    else
                    {
                        return data;
                    }
                }
            }
            else
            {
                return data;
            }
        }


        [HttpPost]
        public JsonResult UpdateImp([FromBody] MaterialStoreImpModelInsert obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var poOldTime = DateTime.Now;
                var objUpdate = _context.ProductImportHeaders.FirstOrDefault(x => x.TicketCode.Equals(obj.TicketCode));
                if (objUpdate != null)
                {
                    var lstStatus = new List<JsonStatus>();

                    //Check xem sản phẩm đã được đưa vào phiếu xuất kho chưa
                    var chkUsing =
                        (from a in _context.ProductImportDetails.Where(x =>
                                !x.IsDeleted && x.TicketCode == obj.TicketCode)
                         join b in _context.ProductExportDetails.Where(x => !x.IsDeleted) on a.ProductQrCode equals b
                             .ProductQrCode
                         select a.Id).Any();

                    //Check xem sản phẩm đã được xếp kho thì không cho sửa kho nhập
                    var chkOrdering =
                        (from a in _context.ProductImportDetails.Where(x =>
                                !x.IsDeleted && x.TicketCode == obj.TicketCode)
                         join b in _context.ProductLocatedMappings.Where(x => !x.IsDeleted) on a.ProductQrCode equals
                             b.ProductQrCode
                         select a.Id).Any();
                    if (chkUsing)
                    {
                        msg.Error = true;
                        msg.Title =
                            "Không được sửa do sản phẩm trong phiếu nhập kho này đã được đưa vào phiếu xuất kho";
                    }
                    else if (chkOrdering && !objUpdate.StoreCode.Equals(obj.StoreCode))
                    {
                        msg.Error = true;
                        msg.Title = "Sản phẩm đã được xếp kho không được phép chỉnh sửa";
                    }
                    else
                    {
                        var oldTimeTicketCreate = objUpdate.TimeTicketCreate;

                        //Update bảng header
                        objUpdate.LotProductCode = obj.LotProductCode;
                        objUpdate.TicketCode = obj.TicketCode;
                        objUpdate.Title = obj.Title;
                        objUpdate.StoreCode = obj.StoreCode;
                        objUpdate.SupCode = obj.SupCode;
                        objUpdate.CusCode = obj.CusCode;
                        objUpdate.Reason = obj.Reason;
                        objUpdate.StoreCodeSend = obj.Reason == "IMP_FROM_MOVE_STORE" ? obj.StoreCodeSend : "";
                        objUpdate.UserImport = obj.UserImport;
                        objUpdate.Note = obj.Note;
                        objUpdate.UserSend = obj.UserSend;
                        objUpdate.InsurantTime = !string.IsNullOrEmpty(obj.InsurantTime)
                            ? DateTime.ParseExact(obj.InsurantTime, "dd/MM/yyyy", CultureInfo.InvariantCulture)
                            : (DateTime?)null;
                        objUpdate.TimeTicketCreate = !string.IsNullOrEmpty(obj.TimeTicketCreate)
                            ? DateTime.ParseExact(obj.TimeTicketCreate, "dd/MM/yyyy", CultureInfo.InvariantCulture)
                            : (DateTime?)null;
                        objUpdate.GroupType = obj.GroupType;
                        objUpdate.UpdatedBy = obj.UserName;
                        objUpdate.UpdatedTime = DateTime.Now;
                        msg.Title = "Cập nhập thành công!";
                        var header = _context.ProductImportHeaders.FirstOrDefault(x =>
                            !x.IsDeleted && x.TicketCode.Equals(obj.TicketCode));
                        var detail = _context.ProductImportDetails
                            .Where(x => !x.IsDeleted && x.TicketCode.Equals(obj.TicketCode)).ToList();
                        if (header != null)
                        {
                            var logData = new
                            {
                                Header = header,
                                Detail = detail
                            };

                            var listLogData = new List<object>();

                            if (!string.IsNullOrEmpty(header.LogData))
                            {
                                listLogData = JsonConvert.DeserializeObject<List<object>>(header.LogData);
                                logData.Header.LogData = null;
                                listLogData.Add(logData);
                                header.LogData = JsonConvert.SerializeObject(listLogData);

                                _context.ProductImportHeaders.Update(header);
                                _context.SaveChanges();
                            }
                            else
                            {
                                listLogData.Add(logData);

                                header.LogData = JsonConvert.SerializeObject(listLogData);

                                _context.ProductImportHeaders.Update(header);

                            }
                        }


                        //Work flow update status
                        var user = _context.Users.FirstOrDefault(x => x.UserName == obj.UserName);
                        var session = _loginService.GetSessionUser(user.Id);
                        if (!string.IsNullOrEmpty(objUpdate.Status))
                        {
                            lstStatus = JsonConvert.DeserializeObject<List<JsonStatus>>(objUpdate.Status);
                        }

                        if (obj.Status != "INITIAL_BEGIN")
                        {
                            var status = new JsonStatus
                            {
                                StatusCode = obj.Status,
                                CreatedBy = _context.Users.FirstOrDefault(x => x.UserName.Equals(obj.UserName))
                                    .GivenName,
                                StatusName = _context.CommonSettings
                                    .FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(obj.Status))?.ValueSet,
                                CreatedTime = DateTime.Now,
                            };

                            lstStatus.Add(status);
                            objUpdate.Status = JsonConvert.SerializeObject(lstStatus);

                        }

                        objUpdate.JsonData = CommonUtil.JsonData(objUpdate, obj, objUpdate.JsonData, session.FullName);

                        if (obj.Status != null && (obj.Status.Equals("INITIAL_DONE") || obj.Status.Equals("INITIAL_WORKING")))
                        {
                            var des = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value &&
                                x.ObjectInst.Equals(objUpdate.TicketCode)
                                && x.ObjectType.Equals("IMPORT_STORE"));
                            var acts = _context.ActivityInstances.Where(x =>
                                !x.IsDeleted && x.WorkflowCode.Equals(des.WfInstCode));
                            var current_act = _context.ActivityInstances.FirstOrDefault(x =>
                                !x.IsDeleted && x.ActivityInstCode.Equals(des.MarkActCurrent));
                            var check = _context.WorkflowSettings.FirstOrDefault(x =>
                                !x.IsDeleted && x.ActivityInitial.Equals(current_act.ActivityCode));
                            var next = acts
                                .FirstOrDefault(x => !x.IsDeleted && x.ActivityCode.Equals(check.ActivityDestination))
                                .ActivityInstCode;

                            var assigns = _context.ExcuterControlRoleInsts.Where(x =>
                                !x.IsDeleted && x.ActivityCodeInst.Equals(current_act.ActivityInstCode));
                            if (assigns.Any(x => x.UserId.Equals(obj.UserId)) || session.IsAllData ||
                                current_act.CreatedBy.Equals(session.UserName))
                            {
                                if (obj.Status.Equals("INITIAL_DONE"))
                                {
                                    if (current_act.Type.Equals("TYPE_ACTIVITY_INITIAL"))
                                    {
                                        current_act.Status = "STATUS_ACTIVITY_APPROVED";
                                        current_act.UpdatedBy = obj.UserName;
                                        current_act.UpdatedTime = DateTime.Now;
                                        des.MarkActCurrent = next;
                                        var runnings = _context.WorkflowInstanceRunnings.Where(x =>
                                            !x.IsDeleted && x.ActivityInitial == current_act.ActivityInstCode);
                                        var lstActInst = new List<ActivityInstance>();
                                        if (runnings.Any())
                                        {
                                            var files = _context.ActivityInstFiles.Where(x =>
                                                !x.IsDeleted && x.ActivityInstCode == current_act.ActivityInstCode);
                                            foreach (var item in runnings)
                                            {
                                                var lstCommand = new List<JsonCommand>();
                                                if (!string.IsNullOrEmpty(item.Command))
                                                {
                                                    lstCommand =
                                                        JsonConvert.DeserializeObject<List<JsonCommand>>(item.Command);
                                                }

                                                lstCommand[lstCommand.Count - 1].Approved = "APPROVE_COMMAND_Y";
                                                lstCommand[lstCommand.Count - 1].ApprovedBy = obj.UserName;
                                                lstCommand[lstCommand.Count - 1].ApprovedTime =
                                                    DateTime.Now.ToString("HH:mm dd/MM/yyyy");

                                                item.Command = JsonConvert.SerializeObject(lstCommand);
                                                _context.WorkflowInstanceRunnings.Update(item);

                                                var actDes = _context.ActivityInstances.FirstOrDefault(x =>
                                                    !x.IsDeleted && x.ActivityInstCode == item.ActivityDestination);
                                                if (actDes != null)
                                                {
                                                    //actDes.IsLock = false;
                                                    actDes.Status =
                                                        EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.DoActInst);
                                                    actDes.StartTime = DateTime.Now;
                                                    _context.ActivityInstances.Update(actDes);
                                                    lstActInst.Add(actDes);
                                                }
                                            }

                                            var confirms = _context.WorkflowInstanceRunnings.Where(x =>
                                                !x.IsDeleted && x.ActivityDestination == current_act.ActivityInstCode);
                                            if (confirms.Any())
                                            {
                                                foreach (var item in confirms)
                                                {
                                                    var lstCommand = new List<JsonCommand>();

                                                    lstCommand =
                                                        JsonConvert.DeserializeObject<List<JsonCommand>>(item.Command);
                                                    lstCommand[lstCommand.Count - 1].Confirmed = "CONFIRM_COMMAND_Y";
                                                    lstCommand[lstCommand.Count - 1].ConfirmedBy = obj.UserName;
                                                    lstCommand[lstCommand.Count - 1].ConfirmedTime =
                                                        DateTime.Now.ToString("HH:mm dd/MM/yyyy");

                                                    item.Command = JsonConvert.SerializeObject(lstCommand);
                                                    _context.WorkflowInstanceRunnings.Update(item);
                                                }
                                            }

                                        }
                                    }
                                }
                                else if (obj.Status.Equals("INITIAL_WORKING"))
                                {
                                    current_act.Status = "STATUS_ACTIVITY_DO";
                                }

                                _context.ActivityInstances.Update(current_act);
                            }
                        }

                        if (obj.Status != null && (obj.Status.Equals("REPEAT_DONE") || obj.Status.Equals("REPEAT_WORKING")))
                        {
                            var des = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value &&
                                x.ObjectInst.Equals(objUpdate.TicketCode)
                                && x.ObjectType.Equals("IMPORT_STORE"));
                            var acts = _context.ActivityInstances.Where(x =>
                                !x.IsDeleted && x.WorkflowCode.Equals(des.WfInstCode));
                            var current_act = _context.ActivityInstances.FirstOrDefault(x =>
                                !x.IsDeleted && x.ActivityInstCode.Equals(des.MarkActCurrent));
                            var check = _context.WorkflowSettings.FirstOrDefault(x =>
                                !x.IsDeleted && x.ActivityInitial.Equals(current_act.ActivityCode));
                            var next = acts
                                .FirstOrDefault(x => !x.IsDeleted && x.ActivityCode.Equals(check.ActivityDestination))
                                .ActivityInstCode;
                            var assigns = _context.ExcuterControlRoleInsts.Where(x =>
                                !x.IsDeleted && x.ActivityCodeInst.Equals(current_act.ActivityInstCode));
                            if (assigns.Any(x => x.UserId.Equals(obj.UserId)) || session.IsAllData ||
                                current_act.CreatedBy.Equals(session.UserName))
                            {
                                if (obj.Status.Equals("REPEAT_DONE"))
                                {
                                    if (current_act.Type.Equals("TYPE_ACTIVITY_REPEAT"))
                                    {
                                        current_act.Status = "STATUS_ACTIVITY_APPROVED";
                                        current_act.UpdatedBy = obj.UserName;
                                        current_act.UpdatedTime = DateTime.Now;
                                        des.MarkActCurrent = next;
                                        var runnings = _context.WorkflowInstanceRunnings.Where(x =>
                                            !x.IsDeleted && x.ActivityInitial == current_act.ActivityInstCode);
                                        var lstActInst = new List<ActivityInstance>();
                                        if (runnings.Any())
                                        {
                                            var files = _context.ActivityInstFiles.Where(x =>
                                                !x.IsDeleted && x.ActivityInstCode == current_act.ActivityInstCode);
                                            foreach (var item in runnings)
                                            {
                                                var lstCommand = new List<JsonCommand>();
                                                if (!string.IsNullOrEmpty(item.Command))
                                                {
                                                    lstCommand =
                                                        JsonConvert.DeserializeObject<List<JsonCommand>>(item.Command);
                                                }

                                                lstCommand[lstCommand.Count - 1].Approved = "APPROVE_COMMAND_Y";
                                                lstCommand[lstCommand.Count - 1].ApprovedBy = obj.UserName;
                                                lstCommand[lstCommand.Count - 1].ApprovedTime =
                                                    DateTime.Now.ToString("HH:mm dd/MM/yyyy");

                                                item.Command = JsonConvert.SerializeObject(lstCommand);
                                                _context.WorkflowInstanceRunnings.Update(item);

                                                var actDes = _context.ActivityInstances.FirstOrDefault(x =>
                                                    !x.IsDeleted && x.ActivityInstCode == item.ActivityDestination);
                                                if (actDes != null)
                                                {
                                                    //actDes.IsLock = false;
                                                    actDes.Status =
                                                        EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.DoActInst);
                                                    actDes.StartTime = DateTime.Now;
                                                    _context.ActivityInstances.Update(actDes);
                                                    lstActInst.Add(actDes);
                                                }
                                            }

                                            var confirms = _context.WorkflowInstanceRunnings.Where(x =>
                                                !x.IsDeleted && x.ActivityDestination == current_act.ActivityInstCode);
                                            if (confirms.Any())
                                            {
                                                foreach (var item in confirms)
                                                {
                                                    var lstCommand = new List<JsonCommand>();

                                                    lstCommand =
                                                        JsonConvert.DeserializeObject<List<JsonCommand>>(item.Command);
                                                    lstCommand[lstCommand.Count - 1].Confirmed = "CONFIRM_COMMAND_Y";
                                                    lstCommand[lstCommand.Count - 1].ConfirmedBy = obj.UserName;
                                                    lstCommand[lstCommand.Count - 1].ConfirmedTime =
                                                        DateTime.Now.ToString("HH:mm dd/MM/yyyy");

                                                    item.Command = JsonConvert.SerializeObject(lstCommand);
                                                    _context.WorkflowInstanceRunnings.Update(item);
                                                }
                                            }
                                        }
                                        else
                                        {
                                        }
                                    }
                                }
                                else if (obj.Status.Equals("REPEAT_WORKING"))
                                {
                                    current_act.Status = "STATUS_ACTIVITY_DO";
                                }

                                _context.ActivityInstances.Update(current_act);
                            }

                        }

                        if (obj.Status != null && (obj.Status.Equals("FINAL_DONE") || obj.Status.Equals("FINAL_WORKING")))
                        {
                            var des = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value &&
                                x.ObjectInst.Equals(objUpdate.TicketCode)
                                && x.ObjectType.Equals("IMPORT_STORE"));
                            var acts = _context.ActivityInstances.Where(x =>
                                !x.IsDeleted && x.WorkflowCode.Equals(des.WfInstCode));
                            var current_act = _context.ActivityInstances.FirstOrDefault(x =>
                                !x.IsDeleted && x.ActivityInstCode.Equals(des.MarkActCurrent));

                            var assigns = _context.ExcuterControlRoleInsts.Where(x =>
                                !x.IsDeleted && x.ActivityCodeInst.Equals(current_act.ActivityInstCode));
                            if (assigns.Any(x => x.UserId.Equals(obj.UserId)) || session.IsAllData ||
                                current_act.CreatedBy.Equals(session.UserName))
                            {
                                if (obj.Status.Equals("FINAL_DONE"))
                                {
                                    if (current_act.Type.Equals("TYPE_ACTIVITY_END"))
                                    {
                                        current_act.Status = "STATUS_ACTIVITY_APPROVE_END";
                                        current_act.UpdatedBy = obj.UserName;
                                        current_act.UpdatedTime = DateTime.Now;
                                        var wf = _context.WorkflowInstances.FirstOrDefault(x =>
                                            !x.IsDeleted.Value && x.WfInstCode.Equals(current_act.WorkflowCode));
                                        if (wf != null)
                                        {
                                            wf.EndTime = DateTime.Now;
                                            wf.Status = "Hoàn thành";
                                            _context.WorkflowInstances.Update(wf);
                                        }
                                    }
                                }
                                else if (obj.Status.Equals("FINAL_WORKING"))
                                {
                                    current_act.Status = "STATUS_ACTIVITY_DO";
                                }

                                _context.ActivityInstances.Update(current_act);
                            }

                        }

                        if (obj.Status != null && (obj.Status.Equals("REPEAT_REQUIRE_REWORK") || obj.Status.Equals("FINAL_REQUIRE_REWORK")))
                        {
                            var des = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value &&
                                x.ObjectInst.Equals(objUpdate.TicketCode)
                                && x.ObjectType.Equals("IMPORT_STORE"));

                            var repeat = _context.ActivityInstances.FirstOrDefault(x =>
                                !x.IsDeleted && x.ActivityInstCode.Equals(obj.ActRepeat));
                            repeat.Status = "STATUS_ACTIVITY_DO";
                            des.MarkActCurrent = repeat.ActivityInstCode;
                            _context.ActivityInstances.Update(repeat);
                            _context.WorkflowInstances.Update(des);
                        }

                        _context.ProductImportHeaders.Update(objUpdate);
                        _context.SaveChanges();
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Mã phiếu không tồn tại";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi chỉnh sửa phiếu nhập kho";
            }

            return Json(msg);
        }
        [HttpPost]
        public object GetListProdStatus()
        {
            var rs = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "PROD_STAT").OrderBy(x => x.ValueSet).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return rs;
        }
        [HttpPost]
        public IActionResult GetListProductImpHeader(int pageNo = 1, int pageSize = 10, string content = "")
        {
            int intBeginFor = (pageNo - 1) * pageSize;
            return Ok(_context.ProductImportHeaders.Where(x => !x.IsDeleted).OrderByDescending(x => x.Id).ToList().Skip(intBeginFor).Take(pageSize).Select(x => new
            {
                Code = x.TicketCode,
                Name = x.Title
            }));
        }
        [HttpPost]
        public JsonResult GetLocationMappingProduct(string mappingCode)
        {
            var data = (from a in _context.ProductLocatedMappings.Where(x => !x.IsDeleted).Include(x => x.Product)
                        join b in _context.ProductGattrExts.Where(x => !x.IsDeleted)
                        on a.GattrCode equals b.GattrCode into b1
                        from b in b1.DefaultIfEmpty()
                            //join b in _context.EDMSLines on a.LineCode equals b.LineCode
                            //join c in _context.EDMSRacks on a.RackCode equals c.RackCode
                        where a.MappingCode.Equals(mappingCode)
                        select new
                        {
                            a.Id,
                            a.ProductQrCode,
                            a.ProductNo,
                            ProductCode = a.Product != null ? a.Product.ProductCode : a.ProductCode,
                            ProductName = a.Product != null ? a.Product.ProductName : "",
                            a.Remain,
                            a.Size,
                            Ordered = a.Size,
                            a.TicketImpCode,
                            PositionInStore = a.MappingCode,
                            a.Quantity,
                            GattrFlatCode = b != null ? b.GattrFlatCode : "Cơ bản",
                            GattrJson = b != null ? b.GattrJson : "{}",
                            //a.RackCode,
                            //a.RackPosition,
                            a.CreatedBy,
                            a.CreatedTime,
                            a.UpdatedBy,
                            a.UpdatedTime
                        }).OrderBy(x => x.CreatedTime).ThenBy(p => p.PositionInStore);
            return Json(data);
        }
        [HttpPost]
        public async Task<IActionResult> InsertProductMappingFromHeader(string ticketCode, string createdBy, string mappingCode)
        {
            var msg = new JMessage();
            try
            {
                var details = _context.ProductImportDetails.Where(x => !x.IsDeleted && x.TicketCode.Equals(ticketCode)).AsNoTracking().ToList();
                var countSkip = 0;
                foreach (var item in details)
                {
                    var mapping = _context.ProductLocatedMappings.FirstOrDefault(x => !x.IsDeleted && x.IdImpProduct == item.Id);
                    var inStock = _context.ProductInStocks.FirstOrDefault(x => !x.IsDeleted && x.IdImpProduct == item.Id && x.GattrCode == item.GattrCode);
                    if (mapping == null)
                    {
                        var itemCrudMap = new ProductCrudMapping()
                        {
                            IdImpProduct = item.Id,
                            IdProdInStock = inStock?.Id,
                            ProductNo = item.ProductNo,
                            Quantity = item.Quantity,
                            MappingCode = mappingCode,
                            WHS_Code = inStock.StoreCode,
                            ProductQrCode = item.ProductQrCode,
                            ProductCode = item.ProductCode,
                            UnitCode = item.Unit,
                            //Ordering,
                            CreatedBy = createdBy,
                            GattrCode = item.GattrCode
                        };
                        msg = await InsertProductMapping(itemCrudMap);
                        if (msg.Error)
                        {
                            return Ok(msg);
                        }
                    }
                    else
                    {
                        countSkip++;
                    }
                }
                if (countSkip == details.Count)
                {
                    msg.Error = true;
                    msg.Title = "Phiếu đã xếp sản phẩm";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra";
            }
            return Ok(msg);
        }

        [HttpPost]
        public object GetListProdStatusImp()
        {
            var msg = new JMessage();
            try
            {
                msg.Object = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "PROD_STAT").OrderBy(x => x.ValueSet).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra";
            }

            return Json(msg);
        }

        #endregion

        #region Phieu xuat kho

        [HttpPost]
        public object GetListUserExport()
        {
            var msg = new JMessage();
            try
            {
                msg.Object = from a in _context.Users.Where(x => x.Active && x.UserName != "admin")
                        .Select(x => new { Code = x.UserName, Name = x.GivenName, Id = x.Id })
                             orderby a.Name
                             select a;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra";
            }

            return Json(msg);
        }

        [HttpPost]
        public object GetListReasonExport()
        {
            var msg = new JMessage();
            try
            {
                msg.Object = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "EXP_REASON")
                    .OrderBy(x => x.ValueSet).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra";
            }

            return Json(msg);

        }

        [HttpPost]
        public object GetListSupplier()
        {
            var msg = new JMessage();
            try
            {
                msg.Object = _context.Suppliers.Where(x => !x.IsDeleted).OrderByDescending(x => x.SupID).Select(x => new
                {
                    Code = x.SupCode,
                    Name = x.SupName
                });
            }
            catch
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra";
            }
            return Json(msg);
        }


        [HttpPost]
        public JsonResult JTableExport(JTableModelMaterialStoreExpGoodsHeaders jTablePara, int userType = 0)
        {
            var msg = new JMessage();
            try
            {
                int intBeginFor = (jTablePara.CurrentPageView - 1) * jTablePara.Length;
                var query = FuncJTable(userType, jTablePara.Title, jTablePara.CusCode, jTablePara.StoreCode,
                    jTablePara.UserExport, jTablePara.FromDate, jTablePara.ToDate, jTablePara.Reason);
                var count = query.Count();
                var data = query.OrderByDescending(x => x.Id).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking()
                    .ToList();
                msg.Object = new
                {
                    data = data,
                    count = count,
                };
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra";
            }

            return Json(msg);
        }

        [NonAction]
        public IQueryable<MaterialStoreExpModel> FuncJTable(int userType, string Title, string CusCode,
            string StoreCode, string UserExport, string FromDate, string ToDate, string Reason)
        {
            //var session = HttpContext.GetSessionUser();

            var fromDate = !string.IsNullOrEmpty(FromDate)
                ? DateTime.ParseExact(FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture)
                : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(ToDate)
                ? DateTime.ParseExact(ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture)
                : (DateTime?)null;

            var query = (from a in _context.ProductExportHeaders.Where(x => x.IsDeleted != true).AsNoTracking()
                             //join c in _context.PAreaMappingsStore.Where(x => !x.IsDeleted && x.ObjectType == "AREA") on a.StoreCode equals c.ObjectCode
                             //join g in _context.PAreaCategoriesStore.Where(x => x.IsDeleted == false && x.PAreaType == "AREA") on c.CategoryCode equals g.Code
                         join c in _context.EDMSWareHouses.Where(x => x.WHS_Flag != true) on a.StoreCode equals
                             c.WHS_Code
                         join d in _context.Users.Where(x => x.Active) on a.UserExport equals d.UserName
                         join e in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "EXP_REASON") on a.Reason equals
                             e.CodeSet into e1
                         from e in e1.DefaultIfEmpty()
                         join f in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "EXP_PAYMENT_STATUS") on
                             a.PaymentStatus equals f.CodeSet into f1
                         from f in f1.DefaultIfEmpty()
                             //join g in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.CurrencyType)) on a.Currency equals g.CodeSet
                         join b in _context.Customerss.Where(x => x.IsDeleted != true) on a.CusCode equals b.CusCode into b1
                         from b2 in b1.DefaultIfEmpty()
                         where
                             (string.IsNullOrEmpty(Title) ||
                              (!string.IsNullOrEmpty(a.Title) && a.Title.ToLower().Contains(Title.ToLower())))
                             && (string.IsNullOrEmpty(CusCode) || (a.CusCode == CusCode))
                             && (string.IsNullOrEmpty(StoreCode) || (a.StoreCode == StoreCode))
                             && (string.IsNullOrEmpty(UserExport) || (a.UserExport == UserExport))
                             && (string.IsNullOrEmpty(FromDate) || (a.TimeTicketCreate >= fromDate))
                             && (string.IsNullOrEmpty(ToDate) || (a.TimeTicketCreate <= toDate))
                             && (string.IsNullOrEmpty(Reason) || (a.Reason == Reason))

                         //Điều kiện phân quyền dữ liệu
                         //&& (userType == 10
                         //       || (userType == 2 && session.ListUserOfBranch.Any(x => x == a.CreatedBy))
                         //       || (userType == 0 && session.UserName == a.CreatedBy)
                         //   )
                         select new MaterialStoreExpModel
                         {
                             Id = a.Id,
                             TicketCode = a.TicketCode,
                             //QrTicketCode = CommonUtil.GeneratorQRCode(a.TicketCode),
                             ContractCode = a.ContractCode,
                             CusCode = a.CusCode,
                             CusName = b2 != null ? b2.CusName : "",
                             StoreCode = a.StoreCode,
                             StoreName = c.WHS_Name,
                             Title = a.Title,
                             UserExport = a.UserExport,
                             UserExportName = d.GivenName,
                             UserReceipt = a.UserReceipt,
                             CostTotal = a.CostTotal,
                             Currency = a.Currency,
                             //CurrencyName = g.ValueSet,
                             CurrencyName = "",
                             Discount = a.Discount,
                             Commission = a.Commission,
                             TaxTotal = a.TaxTotal,
                             Note = a.Note,
                             PositionGps = a.PositionGps,
                             PositionText = a.PositionText,
                             FromDevice = a.FromDevice,
                             TotalPayed = a.TotalPayed,
                             TotalMustPayment = a.TotalMustPayment,
                             InsurantTime = a.InsurantTime,
                             TimeTicketCreate = a.TimeTicketCreate,
                             NextTimePayment = a.NextTimePayment,
                             Reason = a.Reason,
                             ReasonName = e != null ? e.ValueSet : "",
                             StoreCodeReceipt = a.StoreCodeReceipt,
                             PaymentStatus = a.PaymentStatus,
                             PaymentStatusName = f != null ? f.ValueSet : "",
                             CreatedBy = a.CreatedBy,
                         });
            return query;
        }

        //them moi
        [HttpPost]
        public JsonResult CreateTicketCodeExp(string type)
        {
            var mess = new JMessage { Error = false, Title = "" };
            try
            {
                var ticketCode = string.Empty;
                var monthNow = DateTime.Now.Month;
                var yearNow = DateTime.Now.Year;

                switch (type)
                {
                    case "ODD":
                        {
                            var expODD = _context.ProductExportHeaders.Where(x => string.IsNullOrEmpty(x.LotProductCode)).ToList();
                            var noODD = 1;
                            if (expODD != null)
                            {
                                noODD = noODD + expODD.Count;
                            }
                            var isExist = true;
                            while (isExist)
                            {
                                ticketCode = string.Format("EXP_ODD_T{0}.{1}_{2}", monthNow, yearNow, noODD);
                                isExist = _context.ProductExportHeaders.Any(x => !x.IsDeleted && x.TicketCode.Equals(ticketCode));
                                noODD++;
                            }
                            break;
                        }
                    case "PO":
                        {
                            var expPO = _context.ProductExportHeaders.Where(x => !string.IsNullOrEmpty(x.LotProductCode)).ToList();
                            var noPO = 1;
                            if (expPO != null)
                            {
                                noPO = noPO + expPO.Count;
                            }
                            var isExist = true;
                            while (isExist)
                            {
                                ticketCode = string.Format("EXP_PO_T{0}.{1}_{2}", monthNow, yearNow, noPO);
                                isExist = _context.ProductExportHeaders.Any(x => !x.IsDeleted && x.TicketCode.Equals(ticketCode));
                                noPO++;
                            }
                            break;
                        }
                }

                mess.Object = ticketCode;
            }
            catch (Exception ex)
            {
                mess.Error = true;
            }

            return Json(mess);
        }

        [HttpPost]
        public object GetListLotProductExp()
        {
            var mess = new JMessage { Error = false, Title = "" };
            try
            {
                //Giờ lấy theo lô hàng bán ra để xuất kho (phiếu đặt hàng Customer)
                mess.Object = (from a in _context.PoSaleHeaderNotDones
                               orderby a.ContractHeaderID descending
                               select new
                               {
                                   Code = a.ContractCode,
                                   Name = a.Title,

                               });
            }
            catch (Exception ex)
            {
                mess.Error = true;
            }

            return Json(mess);
        }

        [HttpPost]
        public object GetListUnitExp()
        {
            var mess = new JMessage { Error = false, Title = "" };
            try
            {
                mess.Object = _context.CommonSettings
                    .Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit))
                    .OrderBy(x => x.ValueSet).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            }
            catch (Exception ex)
            {
                mess.Error = true;
            }

            return Json(mess);
        }

        [HttpPost]
        public object GetListContractExp()
        {
            var mess = new JMessage { Error = false, Title = "" };
            try
            {
                var rs = _context.PoSaleHeaders.Where(x => !x.IsDeleted).OrderBy(x => x.Title)
                    .Select(x => new { Code = x.ContractCode, Name = x.Title, Version = x.Version });
            }
            catch (Exception ex)
            {
                mess.Error = true;
            }

            return Json(mess);
        }

        [HttpPost]
        public object GetListCustomerExp()
        {
            var mess = new JMessage { Error = false, Title = "" };
            try
            {
                mess.Object = _context.Customerss.Where(x => !x.IsDeleted && x.ActivityStatus == "CUSTOMER_ACTIVE")
                    .OrderBy(x => x.CusName).Select(x => new { Code = x.CusCode, Name = x.CusName });
            }
            catch (Exception ex)
            {
                mess.Error = true;
            }

            return Json(mess);
        }

        [HttpPost]
        public object GetListPaymentStatusExp()
        {
            var mess = new JMessage { Error = false, Title = "" };
            try
            {
                mess.Object = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "EXP_PAYMENT_STATUS")
                    .OrderBy(x => x.ValueSet).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            }
            catch (Exception ex)
            {
                mess.Error = true;
            }

            return Json(mess);
        }

        [HttpPost]
        public object GetListProductCodeVatco(string storeCode, string lotCode)
        {
            try
            {
                var listSupplier = (from a in _context.PoBuyerDetails.Where(x => !x.IsDeleted)
                                    join b in _context.PoBuyerHeaders.Where(x => !x.IsDeleted) on a.PoSupCode equals b.PoSupCode
                                    join c in _context.Suppliers.Where(x => !x.IsDeleted) on b.SupCode equals c.SupCode into c1
                                    from c2 in c1.DefaultIfEmpty()
                                    select new
                                    {
                                        a.ProductCode,
                                        a.ProductType,
                                        b.SupCode,
                                        c2.SupName
                                    }).ToList();

                var listSupplierGroup = listSupplier.GroupBy(x => x.ProductCode).Select(p => new
                {
                    p.First().ProductCode,
                    p.First().ProductType,
                    SupCode = string.Join(",", p.GroupBy(x => x.SupCode).Select(k => k.First().SupCode)),
                    SupName = string.Join(",", p.GroupBy(x => x.SupCode).Select(k => k.First().SupName)),
                }).ToList();

                if (string.IsNullOrEmpty(lotCode))
                {
                    var rs = (from a in _context.ProductInStocks.Where(x => !x.IsDeleted && x.StoreCode == storeCode)
                              join f in _context.ProductImportDetails.Where(x => !x.IsDeleted) on a.ProductQrCode equals f.ProductQrCode into f1
                              from f in f1.DefaultIfEmpty()
                              join d in _context.ProductImportHeaders.Where(x => !x.IsDeleted) on
                                  f.TicketCode equals d.TicketCode into d1
                              from d in d1.DefaultIfEmpty()
                              join b in _context.MaterialProducts on a.ProductCode equals b.ProductCode
                              join c in _context.CommonSettings.Where(x =>
                                      !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on b
                                      .Unit
                                  equals c.CodeSet into c1
                              from c2 in c1.DefaultIfEmpty()
                              join e in listSupplierGroup on a.ProductCode equals e.ProductCode into e1
                              from e2 in e1.DefaultIfEmpty()
                              select new
                              {
                                  Code = a.ProductCode,
                                  Name = string.Format("{0} - {1}", b.ProductName, b.ProductCode),
                                  a.Unit,
                                  a.ProductCode,
                                  a.ProductQrCode,
                                  UnitName = c2.ValueSet,
                                  a.Quantity,
                                  AttributeCode = "",
                                  AttributeName = "",
                                  ProductType = b.TypeCode,
                                  e2.SupCode,
                                  e2.SupName,
                                  Lot = f != null ? f.ProductLot : "",
                                  Packing = f != null ? f.PackType : "",
                                  b.Weight,
                                  UnitWeight = _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b.UnitWeight))
                                      .ValueSet,
                                  b.High,
                                  b.Wide,
                                  b.Long
                              }).ToList();

                    var dataRs = rs.GroupBy(x => x.ProductQrCode).Select(x => new
                    {
                        x.First().Code,
                        x.First().Name,
                        x.First().ProductCode,
                        x.First().Unit,
                        x.First().UnitName,
                        x.First().Quantity,
                        x.First().AttributeCode,
                        x.First().AttributeName,
                        x.First().ProductType,
                        x.First().SupCode,
                        x.First().SupName,
                        x.First().ProductQrCode,
                        x.First().Lot,
                        x.First().Packing,
                        x.First().Weight,
                        x.First().UnitWeight,
                        x.First().Wide,
                        x.First().Long,
                        x.First().High
                    });

                    var listB = (from d in dataRs
                                 join b in _context.ProductLocatedMappings.Where(x => !x.IsDeleted) on d.ProductQrCode equals b.ProductQrCode into b1
                                 from b in b1.DefaultIfEmpty()
                                     //join e in _context.EDMSRacks on b.RackCode equals e.RackCode
                                 join c in _context.PAreaMappingsStore.Where(x => !x.IsDeleted) on b.MappingCode equals c.ObjectCode into c1
                                 from c in c1.DefaultIfEmpty()
                                 join e in _context.PAreaCategoriesStore.Where(x => x.IsDeleted == false)
                                 on new { c.CategoryCode, c.ObjectType } equals new
                                 { CategoryCode = e.Code, ObjectType = e.PAreaType } into e1
                                 from e in e1.DefaultIfEmpty()
                                 join f in _context.MapStockProdIns.Where(x => !x.IsDeleted) on b.Id equals f.MapId into f1
                                 from f in f1.DefaultIfEmpty()
                                 join g in _context.CommonSettings.Where(x => !x.IsDeleted) on f.Unit equals g.CodeSet into g1
                                 from g2 in g1.DefaultIfEmpty()
                                 select new
                                 {
                                     d.Code,
                                     d.Name,
                                     d.ProductCode,
                                     Unit = f != null ? f.Unit : "",
                                     UnitName = g2 != null ? g2.ValueSet : "",
                                     Quantity = f != null ? f.Quantity.Value : d.Quantity,
                                     d.AttributeCode,
                                     d.AttributeName,
                                     d.ProductType,
                                     d.SupCode,
                                     d.SupName,
                                     d.ProductQrCode,
                                     Position = b != null ? string.Format("{0} - {1}", e.PAreaDescription, b.MappingCode) : "",
                                     MapId = b != null ? b.Id : -1,
                                     MarkWholeProduct = false,
                                     d.Lot,
                                     d.Packing,
                                     d.Weight,
                                     d.UnitWeight,
                                     d.Wide,
                                     d.Long,
                                     d.High,
                                     MappingCode = b != null ? b.MappingCode : "Chưa xếp"
                                 });

                    return listB;
                }
                else
                {
                    var rs = (from a in _context.ProductInStocks.Where(x => !x.IsDeleted && x.StoreCode == storeCode)
                              join f in _context.ProductImportDetails.Where(x => !x.IsDeleted) on a.ProductQrCode equals f.ProductQrCode into f1
                              from f in f1.DefaultIfEmpty()
                              join d in _context.ProductImportHeaders.Where(x => !x.IsDeleted) on
                                  f.TicketCode equals d.TicketCode into d1
                              from d in d1.DefaultIfEmpty()
                              join b in _context.MaterialProducts on a.ProductCode equals b.ProductCode
                              join c in _context.CommonSettings.Where(x =>
                                      !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on b
                                      .Unit
                                  equals c.CodeSet into c1
                              from c2 in c1.DefaultIfEmpty()
                              join e in listSupplierGroup on a.ProductCode equals e.ProductCode into e1
                              from e2 in e1.DefaultIfEmpty()
                              where string.IsNullOrEmpty(storeCode) || d.StoreCode.Equals(storeCode)
                              select new
                              {
                                  Code = a.ProductCode,
                                  Name = string.Format("{0} - {1}", b.ProductName, b.ProductCode),
                                  a.Unit,
                                  a.ProductCode,
                                  a.ProductQrCode,
                                  UnitName = c2.ValueSet,
                                  a.Quantity,
                                  AttributeCode = "",
                                  AttributeName = "",
                                  ProductType = b.TypeCode,
                                  e2.SupCode,
                                  e2.SupName,
                                  Lot = f != null ? f.ProductLot : "",
                                  Packing = f != null ? f.PackType : "",
                                  b.Weight,
                                  UnitWeight = _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b.UnitWeight))
                                      .ValueSet,
                                  b.High,
                                  b.Wide,
                                  b.Long
                              }).ToList();

                    var dataRs = rs.GroupBy(x => x.ProductQrCode).Select(x => new
                    {
                        x.First().Code,
                        x.First().Name,
                        x.First().ProductCode,
                        x.First().Unit,
                        x.First().UnitName,
                        x.First().Quantity,
                        x.First().AttributeCode,
                        x.First().AttributeName,
                        x.First().ProductType,
                        x.First().SupCode,
                        x.First().SupName,
                        x.First().ProductQrCode,
                        x.First().Lot,
                        x.First().Packing,
                        x.First().Weight,
                        x.First().UnitWeight,
                        x.First().Wide,
                        x.First().Long,
                        x.First().High
                    });

                    var listB = (from a1 in _context.PoSaleHeaders.Where(x => !x.IsDeleted && x.ContractCode == lotCode)
                                 join a in _context.PoSaleProductDetails.Where(x => !x.IsDeleted) on a1.ContractCode equals a.ContractCode
                                 join d in dataRs on a.ProductCode equals d.ProductCode
                                 join c in _context.ProductLocatedMappings.Where(x => !x.IsDeleted) on d.ProductQrCode equals c.ProductQrCode into c1
                                 from c in c1.DefaultIfEmpty()
                                     //join e in _context.EDMSRacks on c.RackCode equals e.RackCode
                                 join b in _context.PAreaMappingsStore.Where(x => !x.IsDeleted) on c.MappingCode equals b.ObjectCode into b1
                                 from b in b1.DefaultIfEmpty()
                                 join e in _context.PAreaCategoriesStore.Where(x => x.IsDeleted == false)
                                     on new { b.CategoryCode, b.ObjectType } equals new
                                     { CategoryCode = e.Code, ObjectType = e.PAreaType } into e1
                                 from e in e1.DefaultIfEmpty()
                                 join f in _context.MapStockProdIns.Where(x => !x.IsDeleted) on c.Id equals f.MapId into f1
                                 from f in f1.DefaultIfEmpty()
                                 join g in _context.CommonSettings.Where(x => !x.IsDeleted) on f.Unit equals g.CodeSet into g1
                                 from g2 in g1.DefaultIfEmpty()
                                 select new
                                 {
                                     d.Code,
                                     d.Name,
                                     d.ProductCode,
                                     Unit = f != null ? f.Unit : "",
                                     UnitName = g2 != null ? g2.ValueSet : "",
                                     Quantity = f != null ? f.Quantity.Value : d.Quantity,
                                     d.AttributeCode,
                                     d.AttributeName,
                                     d.ProductType,
                                     d.SupCode,
                                     d.SupName,
                                     d.ProductQrCode,
                                     Position = c != null ? string.Format("{0} - {1}", e.PAreaDescription, c.MappingCode) : "",
                                     MapId = c != null ? c.Id : -1,
                                     MarkWholeProduct = false,
                                     d.Lot,
                                     d.Packing,
                                     d.Weight,
                                     d.UnitWeight,
                                     d.Wide,
                                     d.Long,
                                     d.High,
                                     MappingCode = c != null ? c.MappingCode : "Chưa xếp"
                                 });

                    return listB;
                }

            }
            catch (Exception ex)
            {
                return new List<object>();
            }
        }

        [HttpPost]
        public object GetListProductCodeVatcoNew(string storeCode, string lotCode)
        {
            try
            {
                var listSupplier = (from a in _context.PoBuyerDetails.Where(x => !x.IsDeleted)
                                    join b in _context.PoBuyerHeaders.Where(x => !x.IsDeleted) on a.PoSupCode equals b.PoSupCode
                                    join c in _context.Suppliers.Where(x => !x.IsDeleted) on b.SupCode equals c.SupCode into c1
                                    from c2 in c1.DefaultIfEmpty()
                                    select new
                                    {
                                        a.ProductCode,
                                        a.ProductType,
                                        b.SupCode,
                                        c2.SupName
                                    }).ToList();

                var listSupplierGroup = listSupplier.GroupBy(x => x.ProductCode).Select(p => new
                {
                    p.First().ProductCode,
                    p.First().ProductType,
                    SupCode = string.Join(",", p.GroupBy(x => x.SupCode).Select(k => k.First().SupCode)),
                    SupName = string.Join(",", p.GroupBy(x => x.SupCode).Select(k => k.First().SupName)),
                }).ToList();

                if (string.IsNullOrEmpty(lotCode))
                {
                    var rs = (from a in _context.ProductInStocks.Where(x => !x.IsDeleted && x.StoreCode == storeCode)
                              join f in _context.ProductImportDetails.Where(x => !x.IsDeleted) on a.ProductQrCode equals f.ProductQrCode into f1
                              from f in f1.DefaultIfEmpty()
                              join d in _context.ProductImportHeaders.Where(x => !x.IsDeleted) on
                                  f.TicketCode equals d.TicketCode into d1
                              from d in d1.DefaultIfEmpty()
                              join b in _context.MaterialProducts on a.ProductCode equals b.ProductCode
                              join c in _context.CommonSettings.Where(x =>
                                      !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on b
                                      .Unit
                                  equals c.CodeSet into c1
                              from c2 in c1.DefaultIfEmpty()
                              join e in listSupplierGroup on a.ProductCode equals e.ProductCode into e1
                              from e2 in e1.DefaultIfEmpty()
                              select new
                              {
                                  Code = a.ProductCode,
                                  Name = string.Format("{0} - {1}", b.ProductName, b.ProductCode),
                                  a.Unit,
                                  a.ProductCode,
                                  a.ProductQrCode,
                                  UnitName = c2.ValueSet,
                                  a.Quantity,
                                  AttributeCode = "",
                                  AttributeName = "",
                                  ProductType = b.TypeCode,
                                  e2.SupCode,
                                  e2.SupName,
                                  Lot = f != null ? f.ProductLot : "",
                                  Packing = f != null ? f.PackType : "",
                                  b.Weight,
                                  UnitWeight = _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b.UnitWeight))
                                      .ValueSet,
                                  b.High,
                                  b.Wide,
                                  b.Long
                              }).ToList();

                    var dataRs = rs.GroupBy(x => x.ProductQrCode).Select(x => new
                    {
                        x.First().Code,
                        x.First().Name,
                        x.First().ProductCode,
                        x.First().Unit,
                        x.First().UnitName,
                        x.First().Quantity,
                        x.First().AttributeCode,
                        x.First().AttributeName,
                        x.First().ProductType,
                        x.First().SupCode,
                        x.First().SupName,
                        x.First().ProductQrCode,
                        x.First().Lot,
                        x.First().Packing,
                        x.First().Weight,
                        x.First().UnitWeight,
                        x.First().Wide,
                        x.First().Long,
                        x.First().High
                    });

                    var listB = (from d in dataRs
                                     //join b in _context.ProductLocatedMappings.Where(x => !x.IsDeleted) on d.ProductQrCode equals b.ProductQrCode into b1
                                     //from b in b1.DefaultIfEmpty()
                                     //join e in _context.EDMSRacks on b.RackCode equals e.RackCode
                                     //join c in _context.PAreaMappingsStore.Where(x => !x.IsDeleted) on b.MappingCode equals c.ObjectCode into c1
                                     //from c in c1.DefaultIfEmpty()
                                     //join e in _context.PAreaCategoriesStore.Where(x => x.IsDeleted == false)
                                     //on new { c.CategoryCode, c.ObjectType } equals new
                                     //{ CategoryCode = e.Code, ObjectType = e.PAreaType } into e1
                                     //from e in e1.DefaultIfEmpty()
                                     //join f in _context.MapStockProdIns.Where(x => !x.IsDeleted) on b.Id equals f.MapId into f1
                                     //from f in f1.DefaultIfEmpty()
                                 join g in _context.CommonSettings.Where(x => !x.IsDeleted) on d.Unit equals g.CodeSet into g1
                                 from g2 in g1.DefaultIfEmpty()
                                 select new
                                 {
                                     d.Code,
                                     d.Name,
                                     d.ProductCode,
                                     Unit = d.Unit,
                                     UnitName = g2 != null ? g2.ValueSet : "",
                                     Quantity = d.Quantity,
                                     d.AttributeCode,
                                     d.AttributeName,
                                     d.ProductType,
                                     d.SupCode,
                                     d.SupName,
                                     d.ProductQrCode,
                                     //Position = b != null ? string.Format("{0} - {1}", e.PAreaDescription, b.MappingCode) : "",
                                     //MapId = b != null ? b.Id : -1,
                                     MarkWholeProduct = false,
                                     d.Lot,
                                     d.Packing,
                                     d.Weight,
                                     d.UnitWeight,
                                     d.Wide,
                                     d.Long,
                                     d.High,
                                     //MappingCode = b != null ? b.MappingCode : "Chưa xếp"
                                 });

                    return listB;
                }
                else
                {
                    var rs = (from a in _context.ProductInStocks.Where(x => !x.IsDeleted && x.StoreCode == storeCode)
                              join f in _context.ProductImportDetails.Where(x => !x.IsDeleted) on a.ProductQrCode equals f.ProductQrCode into f1
                              from f in f1.DefaultIfEmpty()
                              join d in _context.ProductImportHeaders.Where(x => !x.IsDeleted) on
                                  f.TicketCode equals d.TicketCode into d1
                              from d in d1.DefaultIfEmpty()
                              join b in _context.MaterialProducts on a.ProductCode equals b.ProductCode
                              join c in _context.CommonSettings.Where(x =>
                                      !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on b
                                      .Unit
                                  equals c.CodeSet into c1
                              from c2 in c1.DefaultIfEmpty()
                              join e in listSupplierGroup on a.ProductCode equals e.ProductCode into e1
                              from e2 in e1.DefaultIfEmpty()
                              where string.IsNullOrEmpty(storeCode) || d.StoreCode.Equals(storeCode)
                              select new
                              {
                                  Code = a.ProductCode,
                                  Name = string.Format("{0} - {1}", b.ProductName, b.ProductCode),
                                  a.Unit,
                                  a.ProductCode,
                                  a.ProductQrCode,
                                  UnitName = c2.ValueSet,
                                  a.Quantity,
                                  AttributeCode = "",
                                  AttributeName = "",
                                  ProductType = b.TypeCode,
                                  e2.SupCode,
                                  e2.SupName,
                                  Lot = f != null ? f.ProductLot : "",
                                  Packing = f != null ? f.PackType : "",
                                  b.Weight,
                                  UnitWeight = _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b.UnitWeight))
                                      .ValueSet,
                                  b.High,
                                  b.Wide,
                                  b.Long
                              }).ToList();

                    var dataRs = rs.GroupBy(x => x.ProductQrCode).Select(x => new
                    {
                        x.First().Code,
                        x.First().Name,
                        x.First().ProductCode,
                        x.First().Unit,
                        x.First().UnitName,
                        x.First().Quantity,
                        x.First().AttributeCode,
                        x.First().AttributeName,
                        x.First().ProductType,
                        x.First().SupCode,
                        x.First().SupName,
                        x.First().ProductQrCode,
                        x.First().Lot,
                        x.First().Packing,
                        x.First().Weight,
                        x.First().UnitWeight,
                        x.First().Wide,
                        x.First().Long,
                        x.First().High
                    });

                    var listB = (from a1 in _context.PoSaleHeaders.Where(x => !x.IsDeleted && x.ContractCode == lotCode)
                                 join a in _context.PoSaleProductDetails.Where(x => !x.IsDeleted) on a1.ContractCode equals a.ContractCode
                                 join d in dataRs on a.ProductCode equals d.ProductCode
                                 //join c in _context.ProductLocatedMappings.Where(x => !x.IsDeleted) on d.ProductQrCode equals c.ProductQrCode into c1
                                 //from c in c1.DefaultIfEmpty()
                                 //join e in _context.EDMSRacks on c.RackCode equals e.RackCode
                                 //join b in _context.PAreaMappingsStore.Where(x => !x.IsDeleted) on c.MappingCode equals b.ObjectCode into b1
                                 //from b in b1.DefaultIfEmpty()
                                 //join e in _context.PAreaCategoriesStore.Where(x => x.IsDeleted == false)
                                 //    on new { b.CategoryCode, b.ObjectType } equals new
                                 //    { CategoryCode = e.Code, ObjectType = e.PAreaType } into e1
                                 //from e in e1.DefaultIfEmpty()
                                 //join f in _context.MapStockProdIns.Where(x => !x.IsDeleted) on c.Id equals f.MapId into f1
                                 //from f in f1.DefaultIfEmpty()
                                 join g in _context.CommonSettings.Where(x => !x.IsDeleted) on d.Unit equals g.CodeSet into g1
                                 from g2 in g1.DefaultIfEmpty()
                                 select new
                                 {
                                     d.Code,
                                     d.Name,
                                     d.ProductCode,
                                     Unit = d.Unit,
                                     UnitName = g2 != null ? g2.ValueSet : "",
                                     Quantity = d.Quantity,
                                     d.AttributeCode,
                                     d.AttributeName,
                                     d.ProductType,
                                     d.SupCode,
                                     d.SupName,
                                     d.ProductQrCode,
                                     //Position = c != null ? string.Format("{0} - {1}", e.PAreaDescription, c.MappingCode) : "",
                                     //MapId = c != null ? c.Id : -1,
                                     MarkWholeProduct = false,
                                     d.Lot,
                                     d.Packing,
                                     d.Weight,
                                     d.UnitWeight,
                                     d.Wide,
                                     d.Long,
                                     d.High,
                                     //MappingCode = c != null ? c.MappingCode : "Chưa xếp"
                                 });

                    return listB;
                }

            }
            catch (Exception ex)
            {
                return new List<object>();
            }
        }
        [HttpPost]
        public object GetProductGroupTypes()
        {
            return ListProdStrNoHelper.GetProductGroupImpExp();
        }

        [HttpPost]
        public object GetListProductForExport(string storeCode, string lotCode, int pageNo = 1, int pageSize = 500, string content = "", string group = "", int id = -1)
        {
            try
            {
                var listSupplier = (from a in _context.PoBuyerDetails.Where(x => !x.IsDeleted)
                                    join b in _context.PoBuyerHeaders.Where(x => !x.IsDeleted) on a.PoSupCode equals b.PoSupCode
                                    join c in _context.Suppliers.Where(x => !x.IsDeleted) on b.SupCode equals c.SupCode into c1
                                    from c2 in c1.DefaultIfEmpty()
                                    select new
                                    {
                                        a.ProductCode,
                                        a.ProductType,
                                        b.SupCode,
                                        c2.SupName
                                    }).ToList();

                var listSupplierGroup = listSupplier.GroupBy(x => x.ProductCode).Select(p => new
                {
                    p.First().ProductCode,
                    p.First().ProductType,
                    SupCode = string.Join(",", p.GroupBy(x => x.SupCode).Select(k => k.First().SupCode)),
                    SupName = string.Join(",", p.GroupBy(x => x.SupCode).Select(k => k.First().SupName)),
                }).ToList();

                if (string.IsNullOrEmpty(lotCode))
                {
                    var search = !string.IsNullOrEmpty(content) ? content : "";
                    var store = !string.IsNullOrEmpty(storeCode) ? storeCode : "";
                    var groupCode = !string.IsNullOrEmpty(group) ? group : "";
                    //var searchStore = !string.IsNullOrEmpty(storeCode) ? storeCode : "";
                    string[] param = new string[] { "@pageNo", "@pageSize", "@content", "@productCode", "@group", "@store", "@id" };
                    object[] val = new object[] { pageNo, pageSize, search, "", groupCode, "", id };
                    DataTable rs = _repositoryService.GetDataTableProcedureSql("[P_GET_LIST_PRODUCT_MAPPING]", param, val);
                    var data = CommonUtil.ConvertDataTable<MaterialProductInStock>(rs)
                        .Select(b => new
                        {
                            Id = b.Id,
                            IdImpProduct = b.IdImpProduct,
                            MapId = b.IdMapping,
                            Code = b.ProductCode,
                            Name = $"{b.ProductName} - {b.ProductCode} [ {b.IdImpProduct} - {b.MappingCode} - {b.StatusName} ]",
                            Quantity = b.Quantity,
                            MappingCode = b.MappingCode,
                            Unit = b.Unit,
                            UnitName = b.UnitName,
                            ProductCode = b.ProductCode,
                            ProductNo = b.ProductNo,
                            AttributeCode = "",
                            AttributeName = "",
                            ProductType = b.TypeCode,
                            ImpType = b.ImpType
                        }).ToList();
                    //return query;
                    return data;
                }
                else
                {
                    var rs = (from a in _context.ProductInStocks.Where(x => !x.IsDeleted && x.StoreCode == storeCode)
                              join f in _context.ProductImportDetails.Where(x => !x.IsDeleted) on a.ProductQrCode equals f.ProductQrCode into f1
                              from f in f1.DefaultIfEmpty()
                              join d in _context.ProductImportHeaders.Where(x => !x.IsDeleted) on
                                  f.TicketCode equals d.TicketCode into d1
                              from d in d1.DefaultIfEmpty()
                              join b in _context.MaterialProducts on a.ProductCode equals b.ProductCode
                              join c in _context.CommonSettings.Where(x =>
                                      !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on b
                                      .Unit
                                  equals c.CodeSet into c1
                              from c2 in c1.DefaultIfEmpty()
                              join e in listSupplierGroup on a.ProductCode equals e.ProductCode into e1
                              from e2 in e1.DefaultIfEmpty()
                              where string.IsNullOrEmpty(storeCode) || d.StoreCode.Equals(storeCode)
                              select new
                              {
                                  Id = a.Id,
                                  Code = a.ProductCode,
                                  Name = $"{b.ProductName} - {b.ProductCode}",
                                  a.Unit,
                                  a.ProductCode,
                                  a.ProductQrCode,
                                  UnitName = c2.ValueSet,
                                  a.Quantity,
                                  AttributeCode = "",
                                  AttributeName = "",
                                  ProductType = b.TypeCode,
                                  e2.SupCode,
                                  e2.SupName,
                                  Lot = f != null ? f.ProductLot : "",
                                  Packing = f != null ? f.PackType : "",
                                  b.Weight,
                                  UnitWeight = _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b.UnitWeight))
                                      .ValueSet,
                                  b.High,
                                  b.Wide,
                                  b.Long
                              }).ToList();

                    var dataRs = rs.GroupBy(x => x.ProductQrCode).Select(x => new
                    {
                        x.First().Id,
                        x.First().Code,
                        x.First().Name,
                        x.First().ProductCode,
                        x.First().Unit,
                        x.First().UnitName,
                        x.First().Quantity,
                        x.First().AttributeCode,
                        x.First().AttributeName,
                        x.First().ProductType,
                        x.First().SupCode,
                        x.First().SupName,
                        x.First().ProductQrCode,
                        x.First().Lot,
                        x.First().Packing,
                        x.First().Weight,
                        x.First().UnitWeight,
                        x.First().Wide,
                        x.First().Long,
                        x.First().High
                    });

                    var listB = (from a1 in _context.PoSaleHeaders.Where(x => !x.IsDeleted && x.ContractCode == lotCode)
                                 join a in _context.PoSaleProductDetails.Where(x => !x.IsDeleted) on a1.ContractCode equals a.ContractCode
                                 join d in dataRs on a.ProductCode equals d.ProductCode
                                 //join c in _context.ProductLocatedMappings.Where(x => !x.IsDeleted) on d.ProductQrCode equals c.ProductQrCode into c1
                                 //from c in c1.DefaultIfEmpty()
                                 //join e in _context.EDMSRacks on c.RackCode equals e.RackCode
                                 //join b in _context.PAreaMappingsStore.Where(x => !x.IsDeleted) on c.MappingCode equals b.ObjectCode into b1
                                 //from b in b1.DefaultIfEmpty()
                                 //join e in _context.PAreaCategoriesStore.Where(x => x.IsDeleted == false)
                                 //    on new { b.CategoryCode, b.ObjectType } equals new
                                 //    { CategoryCode = e.Code, ObjectType = e.PAreaType } into e1
                                 //from e in e1.DefaultIfEmpty()
                                 //join f in _context.MapStockProdIns.Where(x => !x.IsDeleted) on c.Id equals f.MapId into f1
                                 //from f in f1.DefaultIfEmpty()
                                 join g in _context.CommonSettings.Where(x => !x.IsDeleted) on d.Unit equals g.CodeSet into g1
                                 from g2 in g1.DefaultIfEmpty()
                                 select new
                                 {
                                     IdProductInStock = d.Id,
                                     d.Code,
                                     d.Name,
                                     d.ProductCode,
                                     Unit = d.Unit,
                                     UnitName = g2 != null ? g2.ValueSet : "",
                                     Quantity = d.Quantity,
                                     d.AttributeCode,
                                     d.AttributeName,
                                     d.ProductType,
                                     d.SupCode,
                                     d.SupName,
                                     d.ProductQrCode,
                                     //Position = c != null ? string.Format("{0} - {1}", e.PAreaDescription, c.MappingCode) : "",
                                     //MapId = c != null ? c.Id : -1,
                                     MarkWholeProduct = false,
                                     d.Lot,
                                     d.Packing,
                                     d.Weight,
                                     d.UnitWeight,
                                     d.Wide,
                                     d.Long,
                                     d.High,
                                     //MappingCode = c != null ? c.MappingCode : "Chưa xếp"
                                 }).DistinctBy(x => x.ProductCode);

                    return listB;
                }

            }
            catch (Exception ex)
            {
                return new List<object>();
            }
        }
        [HttpPost]
        public object GetListProductMappingInStore(string productCode, string storeCode)
        {
            var data = (from a in _context.ProductLocatedMappings.Where(x => x.IsDeleted == false && x.WHS_Code == storeCode && x.ProductCode == productCode)
                        join b in _context.ProductInStocks.Where(x => !x.IsDeleted) on a.ProductQrCode equals b.ProductQrCode
                        //join b in _context.EDMSRacks on a.RackCode equals b.RackCode into b1
                        //from b in b1.DefaultIfEmpty()
                        join c in _context.PAreaMappingsStore.Where(x => !x.IsDeleted) on a.MappingCode equals c.ObjectCode
                        join e in _context.PAreaCategoriesStore.Where(x => x.IsDeleted == false)
                     on new { c.CategoryCode, c.ObjectType } equals new
                     { CategoryCode = e.Code, ObjectType = e.PAreaType }
                        select new
                        {
                            a.Id,
                            a.ProductQrCode,
                            a.ProductCode,
                            a.Quantity,
                            a.Unit,
                            Name = e.PAreaDescription,
                            MappingCode = c.ObjectCode,
                            Title = a.ProductQrCode + " " + e.PAreaDescription,
                            ProuctNo = a.ProductNo,
                            IdProductInStock = b.Id
                        }).ToList().Where(x => x.Quantity > 0);
            return data;
        }

        [HttpPost]
        public JsonResult InsertExp([FromBody] MaterialStoreExpModelInsert obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                //var isChangeContract = false;
                var poOldTime = DateTime.Now;
                var chk = _context.ProductExportHeaders.Any(x => !x.IsDeleted && x.TicketCode.Equals(obj.TicketCode));
                if (!chk)
                {
                    //Insert bảng header
                    var lstStatus = new List<JsonStatus>();
                    var status = new JsonStatus
                    {
                        StatusCode = obj.Status,
                        CreatedBy = _context.Users.FirstOrDefault(x => x.UserName.Equals(obj.UserName)).GivenName,
                        StatusName = _context.CommonSettings
                            .FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(obj.Status)).ValueSet,
                        CreatedTime = DateTime.Now,
                    };
                    lstStatus.Add(status);
                    var objNew = new ProductExportHeader
                    {
                        LotProductCode = obj.LotProductCode,
                        TicketCode = obj.TicketCode,
                        Title = obj.Title,
                        StoreCode = obj.StoreCode,
                        ContractCode = obj.ContractCode,
                        CusCode = obj.CusCode,
                        SupCode = obj.SupCode,
                        Reason = obj.Reason,
                        StoreCodeReceipt = obj.Reason == "EXP_TO_MOVE_STORE" ? obj.StoreCodeReceipt : "",
                        CostTotal = obj.CostTotal,
                        Currency = obj.Currency,
                        Discount = obj.Discount,
                        TaxTotal = obj.TaxTotal,
                        Commission = obj.Commission,
                        GroupType = obj.GroupType,
                        TotalMustPayment = obj.TotalMustPayment,
                        TotalPayed = obj.TotalPayed,
                        PaymentStatus = obj.Currency == "VND"
                            ? (obj.TotalMustPayment / 1000) > ((obj.TotalPayed / 1000) + 1)
                                ?
                                "EXP_PAYMENT_STATUS_DEBIT"
                                : "EXP_PAYMENT_STATUS_DONE"
                            : obj.TotalMustPayment > (obj.TotalPayed + 1)
                                ? "EXP_PAYMENT_STATUS_DEBIT"
                                : "EXP_PAYMENT_STATUS_DONE",
                        NextTimePayment = !string.IsNullOrEmpty(obj.NextTimePayment)
                            ? DateTime.ParseExact(obj.NextTimePayment, "dd/MM/yyyy", CultureInfo.InvariantCulture)
                            : (DateTime?)null,
                        UserExport = obj.UserExport,
                        Note = obj.Note,
                        UserReceipt = obj.UserReceipt,
                        InsurantTime = !string.IsNullOrEmpty(obj.InsurantTime)
                            ? DateTime.ParseExact(obj.InsurantTime, "dd/MM/yyyy", CultureInfo.InvariantCulture)
                            : (DateTime?)null,
                        TimeTicketCreate = !string.IsNullOrEmpty(obj.TimeTicketCreate)
                            ? DateTime.ParseExact(obj.TimeTicketCreate, "dd/MM/yyyy", CultureInfo.InvariantCulture)
                            : (DateTime?)null,

                        CreatedBy = obj.UserName,
                        CreatedTime = DateTime.Now,
                        Status = JsonConvert.SerializeObject(lstStatus),
                        WorkflowCat = obj.WorkflowCat
                    };
                    _context.ProductExportHeaders.Add(objNew);

                    //Xử lý khi xuất lẻ
                    if (obj.ListPoProduct.Count == 0)
                    {

                    }
                    //Xử lý khi xuất theo PO  ==> Chú ý: Phần chi tiết của xuất kho theo PO xử lý trực tiếp trên DB khi thêm theo Cuộn/Thùng - Chỉ thêm list Detail ở ngoài với Quantity = 0
                    else
                    {
                        foreach (var item in obj.ListPoProduct)
                        {
                            //Insert bảng detail - mỗi sản phẩm chỉ 1 bản ghi (Ko nhập QrCode nữa)
                            var objNewDetail = new ProductExportDetail
                            {
                                LotProductCode = obj.LotProductCode,
                                TicketCode = obj.TicketCode,
                                Currency = obj.Currency,

                                ProductCode = item.ProductCode,
                                ProductType = item.ProductType,
                                Quantity = 0,
                                Unit = item.Unit,

                                ProductCoil = item.ProductCoil,
                                CreatedBy = obj.UserName,
                                CreatedTime = DateTime.Now,
                            };
                            _context.ProductExportDetails.Add(objNewDetail);
                        }
                    }

                    _context.SaveChanges();

                    if (obj.ListPoProduct.Count == 0)
                    {
                    }
                    else
                    {
                        //export PO CUS
                        foreach (var item in obj.ListPoProduct)
                        {
                            string[] param = new string[]
                                {"@ProductCode", "@Quantity", "@ProductType", "@LotProductCode", "@CreatedDate"};
                            object[] val = new object[]
                                {item.ProductCode, 0, item.ProductType, obj.LotProductCode, objNew.TimeTicketCreate};
                            _repositoryService.CallProc("PR_INSERT_STORE_EXP_DETAIL", param, val);
                        }
                    }

                    //Thêm log dữ liệu
                    var header =
                        _context.ProductExportHeaders.FirstOrDefault(x =>
                            !x.IsDeleted && x.TicketCode.Equals(obj.TicketCode));
                    var detail = _context.ProductExportDetails
                        .Where(x => !x.IsDeleted && x.TicketCode.Equals(obj.TicketCode)).ToList();
                    //Trường hợp xuất PO thì có thêm thông tin lưu các ProdPackageInfoHistorys
                    var detailInfoHistory = _context.ProdPackageDeliverys
                        .Where(x => x.TicketCode.Equals(obj.TicketCode)).ToList();
                    if (header != null)
                    {
                        var logData = new
                        {
                            Header = header,
                            Detail = detail,
                            DetailInfoHistory = detailInfoHistory
                        };

                        var listLogData = new List<object>();
                        listLogData.Add(logData);

                        header.LogData = JsonConvert.SerializeObject(listLogData);

                        _context.ProductExportHeaders.Update(header);
                        _context.SaveChanges();
                    }

                    msg.ID = header.Id;
                    msg.Title = "Thêm thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Mã phiếu đã tồn tại!";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi thêm phiếu xuất kho!";
            }

            return Json(msg);
        }

        [HttpGet]
        public object GetActionStatusExp(string code)
        {
            var data = _context.ProductExportHeaders.Where(x => !x.IsDeleted && x.TicketCode.Equals(code)).Select(x =>
                new
                {
                    x.Status
                });
            return data;
        }

        [HttpPost]
        public object GetItemMaterialExp(int id, string userId)
        {
            List<ComboxModel> list = new List<ComboxModel>();
            var data = _context.ProductExportHeaders.FirstOrDefault(x => x.Id == id && !x.IsDeleted);
            var check = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value &&
                                                                       x.ObjectInst.Equals(data.TicketCode)
                                                                       && x.ObjectType.Equals("EXPORT_STORE"));
            if (check != null)
            {
                var value = _context.ActivityInstances.Where(x =>
                    !x.IsDeleted && x.WorkflowCode.Equals(check.WfInstCode));
                var current = check.MarkActCurrent;
                var initial = value.FirstOrDefault(x => !x.IsDeleted && x.Type.Equals("TYPE_ACTIVITY_INITIAL"));
                var name = new ComboxModel
                {
                    IntsCode = initial.ActivityInstCode,
                    Code = initial.ActivityCode,
                    Name = initial.Title,
                    Status = initial.Status,
                    UpdateBy =
                        _context.ActivityInstances.FirstOrDefault(a =>
                            !a.IsDeleted && a.WorkflowCode.Equals(check.WfInstCode) &&
                            a.ActivityInstCode.Equals(initial.ActivityInstCode)).UpdatedBy != null
                            ? _context.Users.FirstOrDefault(x =>
                                x.UserName.Equals(_context.ActivityInstances.FirstOrDefault(a =>
                                    !a.IsDeleted && a.WorkflowCode.Equals(check.WfInstCode) &&
                                    a.ActivityInstCode.Equals(initial.ActivityInstCode)).UpdatedBy)).GivenName
                            : null,
                    UpdateTime = _context.ActivityInstances.FirstOrDefault(x =>
                        !x.IsDeleted && x.WorkflowCode.Equals(check.WfInstCode) &&
                        x.ActivityInstCode.Equals(initial.ActivityInstCode)).UpdatedTime.ToString()
                };
                list.Add(name);
                var location = _context.WorkflowSettings.FirstOrDefault(x =>
                    !x.IsDeleted && x.ActivityInitial.Equals(initial.ActivityCode));
                var next = location.ActivityDestination;
                var count = 1;
                foreach (var item in value)
                {
                    var inti = value.FirstOrDefault(x => !x.IsDeleted && x.ActivityCode.Equals(next));
                    if (inti != null && count < value.Count())
                    {
                        var name2 = new ComboxModel
                        {
                            IntsCode = inti.ActivityInstCode,
                            Code = inti.ActivityCode,
                            Name = inti.Title,
                            Status = inti.Status,
                            UpdateBy =
                                _context.ActivityInstances.FirstOrDefault(a =>
                                    !a.IsDeleted && a.WorkflowCode.Equals(check.WfInstCode) &&
                                    a.ActivityInstCode.Equals(inti.ActivityInstCode)).UpdatedBy != null
                                    ? _context.Users.FirstOrDefault(x =>
                                        x.UserName.Equals(_context.ActivityInstances.FirstOrDefault(a =>
                                            !a.IsDeleted && a.WorkflowCode.Equals(check.WfInstCode) &&
                                            a.ActivityInstCode.Equals(inti.ActivityInstCode)).UpdatedBy)).GivenName
                                    : null,
                            UpdateTime = _context.ActivityInstances.FirstOrDefault(x =>
                                !x.IsDeleted && x.WorkflowCode.Equals(check.WfInstCode) &&
                                x.ActivityInstCode.Equals(inti.ActivityInstCode)).UpdatedTime.ToString()
                        };
                        list.Add(name2);
                        var location2 = _context.WorkflowSettings.FirstOrDefault(x =>
                            !x.IsDeleted && x.ActivityInitial.Equals(inti.ActivityCode));
                        if (location2 != null)
                        {
                            next = location2.ActivityDestination;
                        }
                    }

                    count++;
                }

                var role = value.FirstOrDefault(x => x.ActivityInstCode.Equals(check.MarkActCurrent)).ActivityCode;
                var user = _context.ExcuterControlRoles.FirstOrDefault(x =>
                    !x.IsDeleted && x.ActivityCode.Equals(role) && x.UserId.Equals(userId));
                var hh = "";
                if (value.FirstOrDefault(x =>
                        !x.Status.Equals("STATUS_ACTIVITY_APPROVED") && x.Type.Equals("TYPE_ACTIVITY_INITIAL")) != null)
                {
                    hh = "TYPE_ACTIVITY_INITIAL";
                }
                else if (value.FirstOrDefault(x =>
                             !x.Status.Equals("STATUS_ACTIVITY_APPROVED") && x.Type.Equals("TYPE_ACTIVITY_REPEAT")) !=
                         null)
                {
                    hh = "TYPE_ACTIVITY_REPEAT";
                }
                else if (value.FirstOrDefault(x =>
                             !x.Status.Equals("STATUS_ACTIVITY_APPROVED") && x.Type.Equals("TYPE_ACTIVITY_END")) !=
                         null)
                {
                    hh = "TYPE_ACTIVITY_END";
                }

                if (user != null)
                {
                    if (hh.Equals("TYPE_ACTIVITY_INITIAL"))
                    {
                        var com = _context.CommonSettings.Where(x =>
                                !x.IsDeleted &&
                                x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.StatusActWF)))
                            .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                        return new { data, com, editrole = true, list, current };

                    }

                    if (hh.Equals("TYPE_ACTIVITY_REPEAT"))
                    {
                        var com = _context.CommonSettings.Where(x =>
                                !x.IsDeleted &&
                                x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.StatusActWFREPEAT)))
                            .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                        return new { data, com, editrole = true, list, current };
                    }

                    if (hh.Equals("TYPE_ACTIVITY_END"))
                    {
                        var com = _context.CommonSettings.Where(x =>
                                !x.IsDeleted &&
                                x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.StatusActWFFINAL)))
                            .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                        return new { data, com, editrole = true, list, current };
                    }
                    else
                    {
                        return data;
                    }
                }
                else
                {
                    if (hh.Equals("TYPE_ACTIVITY_INITIAL"))
                    {
                        var com = _context.CommonSettings.Where(x =>
                                !x.IsDeleted &&
                                x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.StatusActWF)))
                            .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                        return new { data, com, editrole = false, list, current };
                    }

                    if (hh.Equals("TYPE_ACTIVITY_REPEAT"))
                    {
                        var com = _context.CommonSettings.Where(x =>
                                !x.IsDeleted &&
                                x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.StatusActWFREPEAT)))
                            .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                        return new { data, com, editrole = false, list, current };
                    }

                    if (hh.Equals("TYPE_ACTIVITY_END"))
                    {
                        var com = _context.CommonSettings.Where(x =>
                                !x.IsDeleted &&
                                x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.StatusActWFFINAL)))
                            .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                        return new { data, com, editrole = false, list, current };
                    }
                    else
                    {
                        return data;
                    }
                }
            }
            else
            {
                return data;
            }
        }

        [HttpPost]
        public JsonResult UpdateExp([FromBody] MaterialStoreExpModelInsert obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var poOldTime = DateTime.Now;

                var objUpdate =
                    _context.ProductExportHeaders.FirstOrDefault(
                        x => !x.IsDeleted && x.TicketCode.Equals(obj.TicketCode));
                if (objUpdate != null)
                {
                    var lstStatus = new List<JsonStatus>();
                    var oldTimeTicketCreate = objUpdate.TimeTicketCreate;
                    var oldLotProductCode = objUpdate.LotProductCode;
                    //Update bảng header
                    objUpdate.LotProductCode = obj.LotProductCode;
                    objUpdate.TicketCode = obj.TicketCode;
                    objUpdate.TicketStatus = obj.Status;
                    objUpdate.Title = obj.Title;
                    objUpdate.StoreCode = obj.StoreCode;
                    objUpdate.ContractCode = obj.ContractCode;
                    objUpdate.CusCode = obj.CusCode;
                    objUpdate.SupCode = obj.SupCode;
                    objUpdate.Reason = obj.Reason;
                    objUpdate.StoreCodeReceipt = obj.Reason == "EXP_TO_MOVE_STORE" ? obj.StoreCodeReceipt : "";
                    objUpdate.CostTotal = obj.CostTotal;
                    objUpdate.Currency = obj.Currency;
                    objUpdate.Discount = obj.Discount;
                    objUpdate.TaxTotal = obj.TaxTotal;
                    objUpdate.Commission = obj.Commission;
                    objUpdate.GroupType = obj.GroupType;
                    objUpdate.TotalMustPayment = obj.TotalMustPayment;
                    objUpdate.TotalPayed = obj.TotalPayed;
                    objUpdate.PaymentStatus = obj.Currency == "VND"
                        ? (obj.TotalMustPayment / 1000) > ((obj.TotalPayed / 1000) + 1) ? "EXP_PAYMENT_STATUS_DEBIT" :
                        "EXP_PAYMENT_STATUS_DONE"
                        : obj.TotalMustPayment > (obj.TotalPayed + 1)
                            ? "EXP_PAYMENT_STATUS_DEBIT"
                            : "EXP_PAYMENT_STATUS_DONE";
                    objUpdate.NextTimePayment = !string.IsNullOrEmpty(obj.NextTimePayment)
                        ? DateTime.ParseExact(obj.NextTimePayment, "dd/MM/yyyy", CultureInfo.InvariantCulture)
                        : (DateTime?)null;
                    objUpdate.UserExport = obj.UserExport;
                    objUpdate.Note = obj.Note;
                    objUpdate.UserReceipt = obj.UserReceipt;
                    objUpdate.InsurantTime = !string.IsNullOrEmpty(obj.InsurantTime)
                        ? DateTime.ParseExact(obj.InsurantTime, "dd/MM/yyyy", CultureInfo.InvariantCulture)
                        : (DateTime?)null;
                    objUpdate.TimeTicketCreate = !string.IsNullOrEmpty(obj.TimeTicketCreate)
                        ? DateTime.ParseExact(obj.TimeTicketCreate, "dd/MM/yyyy", CultureInfo.InvariantCulture)
                        : (DateTime?)null;

                    objUpdate.UpdatedBy = obj.UserName;
                    objUpdate.UpdatedTime = DateTime.Now;

                    //Work flow update status
                    //var session = HttpContext.GetSessionUser();
                    //if (!string.IsNullOrEmpty(objUpdate.Status))
                    //{
                    //    lstStatus = JsonConvert.DeserializeObject<List<JsonStatus>>(objUpdate.Status);
                    //}

                    //if (obj.Status != "INITIAL_BEGIN")
                    //{
                    //    var status = new JsonStatus
                    //    {
                    //        StatusCode = obj.Status,
                    //        CreatedBy = _context.Users.FirstOrDefault(x => x.UserName.Equals(obj.UserName)).GivenName,
                    //        StatusName = _context.CommonSettings
                    //            .FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(obj.Status)).ValueSet,
                    //        CreatedTime = DateTime.Now,
                    //    };

                    //    lstStatus.Add(status);
                    //    objUpdate.Status = JsonConvert.SerializeObject(lstStatus);

                    //}

                    //objUpdate.JsonData = CommonUtil.JsonData(objUpdate, obj, objUpdate.JsonData, session.FullName);

                    //if (obj.Status.Equals("INITIAL_DONE") || obj.Status.Equals("INITIAL_WORKING"))
                    //{
                    //    var secsion = HttpContext.GetSessionUser();
                    //    var des = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value &&
                    //        x.ObjectInst.Equals(objUpdate.TicketCode)
                    //        && x.ObjectType.Equals("EXPORT_STORE"));
                    //    var acts = _context.ActivityInstances.Where(x =>
                    //        !x.IsDeleted && x.WorkflowCode.Equals(des.WfInstCode));
                    //    var current_act = _context.ActivityInstances.FirstOrDefault(x =>
                    //        !x.IsDeleted && x.ActivityInstCode.Equals(des.MarkActCurrent));
                    //    var check = _context.WorkflowSettings.FirstOrDefault(x =>
                    //        !x.IsDeleted && x.ActivityInitial.Equals(current_act.ActivityCode));
                    //    var next = acts
                    //        .FirstOrDefault(x => !x.IsDeleted && x.ActivityCode.Equals(check.ActivityDestination))
                    //        .ActivityInstCode;

                    //    var assigns = _context.ExcuterControlRoleInsts.Where(x =>
                    //        !x.IsDeleted && x.ActivityCodeInst.Equals(current_act.ActivityInstCode));
                    //    if (assigns.Any(x => x.UserId.Equals(obj.UserId)) || secsion.IsAllData ||
                    //        current_act.CreatedBy.Equals(secsion.UserName))
                    //    {
                    //        if (obj.Status.Equals("INITIAL_DONE"))
                    //        {
                    //            if (current_act.Type.Equals("TYPE_ACTIVITY_INITIAL"))
                    //            {
                    //                current_act.Status = "STATUS_ACTIVITY_APPROVED";
                    //                current_act.UpdatedBy = obj.UserName;
                    //                current_act.UpdatedTime = DateTime.Now;
                    //                des.MarkActCurrent = next;
                    //                var runnings = _context.WorkflowInstanceRunnings.Where(x =>
                    //                    !x.IsDeleted && x.ActivityInitial == current_act.ActivityInstCode);
                    //                var lstActInst = new List<ActivityInstance>();
                    //                if (runnings.Any())
                    //                {
                    //                    var files = _context.ActivityInstFiles.Where(x =>
                    //                        !x.IsDeleted && x.ActivityInstCode == current_act.ActivityInstCode);
                    //                    foreach (var item in runnings)
                    //                    {
                    //                        var lstCommand = new List<JsonCommand>();
                    //                        if (!string.IsNullOrEmpty(item.Command))
                    //                        {
                    //                            lstCommand =
                    //                                JsonConvert.DeserializeObject<List<JsonCommand>>(item.Command);
                    //                        }

                    //                        lstCommand[lstCommand.Count - 1].Approved = "APPROVE_COMMAND_Y";
                    //                        lstCommand[lstCommand.Count - 1].ApprovedBy = obj.UserName;
                    //                        lstCommand[lstCommand.Count - 1].ApprovedTime =
                    //                            DateTime.Now.ToString("HH:mm dd/MM/yyyy");

                    //                        item.Command = JsonConvert.SerializeObject(lstCommand);
                    //                        _context.WorkflowInstanceRunnings.Update(item);

                    //                        var actDes = _context.ActivityInstances.FirstOrDefault(x =>
                    //                            !x.IsDeleted && x.ActivityInstCode == item.ActivityDestination);
                    //                        if (actDes != null)
                    //                        {
                    //                            //actDes.IsLock = false;
                    //                            actDes.Status =
                    //                                EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.DoActInst);
                    //                            actDes.StartTime = DateTime.Now;
                    //                            _context.ActivityInstances.Update(actDes);
                    //                            lstActInst.Add(actDes);
                    //                        }
                    //                    }

                    //                    var confirms = _context.WorkflowInstanceRunnings.Where(x =>
                    //                        !x.IsDeleted && x.ActivityDestination == current_act.ActivityInstCode);
                    //                    if (confirms.Any())
                    //                    {
                    //                        foreach (var item in confirms)
                    //                        {
                    //                            var lstCommand = new List<JsonCommand>();

                    //                            lstCommand =
                    //                                JsonConvert.DeserializeObject<List<JsonCommand>>(item.Command);
                    //                            lstCommand[lstCommand.Count - 1].Confirmed = "CONFIRM_COMMAND_Y";
                    //                            lstCommand[lstCommand.Count - 1].ConfirmedBy = obj.UserName;
                    //                            lstCommand[lstCommand.Count - 1].ConfirmedTime =
                    //                                DateTime.Now.ToString("HH:mm dd/MM/yyyy");

                    //                            item.Command = JsonConvert.SerializeObject(lstCommand);
                    //                            _context.WorkflowInstanceRunnings.Update(item);
                    //                        }
                    //                    }

                    //                }
                    //            }
                    //        }
                    //        else if (obj.Status.Equals("INITIAL_WORKING"))
                    //        {
                    //            current_act.Status = "STATUS_ACTIVITY_DO";
                    //        }

                    //        _context.ActivityInstances.Update(current_act);
                    //    }
                    //}

                    //if (obj.Status.Equals("REPEAT_DONE") || obj.Status.Equals("REPEAT_WORKING"))
                    //{
                    //    var secsion = HttpContext.GetSessionUser();
                    //    var des = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value &&
                    //        x.ObjectInst.Equals(objUpdate.TicketCode)
                    //        && x.ObjectType.Equals("EXPORT_STORE"));
                    //    var acts = _context.ActivityInstances.Where(x =>
                    //        !x.IsDeleted && x.WorkflowCode.Equals(des.WfInstCode));
                    //    var current_act = _context.ActivityInstances.FirstOrDefault(x =>
                    //        !x.IsDeleted && x.ActivityInstCode.Equals(des.MarkActCurrent));
                    //    var check = _context.WorkflowSettings.FirstOrDefault(x =>
                    //        !x.IsDeleted && x.ActivityInitial.Equals(current_act.ActivityCode));
                    //    var next = acts
                    //        .FirstOrDefault(x => !x.IsDeleted && x.ActivityCode.Equals(check.ActivityDestination))
                    //        .ActivityInstCode;
                    //    var assigns = _context.ExcuterControlRoleInsts.Where(x =>
                    //        !x.IsDeleted && x.ActivityCodeInst.Equals(current_act.ActivityInstCode));
                    //    if (assigns.Any(x => x.UserId.Equals(obj.UserId)) || secsion.IsAllData ||
                    //        current_act.CreatedBy.Equals(secsion.UserName))
                    //    {
                    //        if (obj.Status.Equals("REPEAT_DONE"))
                    //        {
                    //            if (current_act.Type.Equals("TYPE_ACTIVITY_REPEAT"))
                    //            {
                    //                current_act.Status = "STATUS_ACTIVITY_APPROVED";
                    //                current_act.UpdatedBy = obj.UserName;
                    //                current_act.UpdatedTime = DateTime.Now;
                    //                des.MarkActCurrent = next;
                    //                var runnings = _context.WorkflowInstanceRunnings.Where(x =>
                    //                    !x.IsDeleted && x.ActivityInitial == current_act.ActivityInstCode);
                    //                var lstActInst = new List<ActivityInstance>();
                    //                if (runnings.Any())
                    //                {
                    //                    var files = _context.ActivityInstFiles.Where(x =>
                    //                        !x.IsDeleted && x.ActivityInstCode == current_act.ActivityInstCode);
                    //                    foreach (var item in runnings)
                    //                    {
                    //                        var lstCommand = new List<JsonCommand>();
                    //                        if (!string.IsNullOrEmpty(item.Command))
                    //                        {
                    //                            lstCommand =
                    //                                JsonConvert.DeserializeObject<List<JsonCommand>>(item.Command);
                    //                        }

                    //                        lstCommand[lstCommand.Count - 1].Approved = "APPROVE_COMMAND_Y";
                    //                        lstCommand[lstCommand.Count - 1].ApprovedBy = obj.UserName;
                    //                        lstCommand[lstCommand.Count - 1].ApprovedTime =
                    //                            DateTime.Now.ToString("HH:mm dd/MM/yyyy");

                    //                        item.Command = JsonConvert.SerializeObject(lstCommand);
                    //                        _context.WorkflowInstanceRunnings.Update(item);

                    //                        var actDes = _context.ActivityInstances.FirstOrDefault(x =>
                    //                            !x.IsDeleted && x.ActivityInstCode == item.ActivityDestination);
                    //                        if (actDes != null)
                    //                        {
                    //                            //actDes.IsLock = false;
                    //                            actDes.Status =
                    //                                EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.DoActInst);
                    //                            actDes.StartTime = DateTime.Now;
                    //                            _context.ActivityInstances.Update(actDes);
                    //                            lstActInst.Add(actDes);
                    //                        }
                    //                    }

                    //                    var confirms = _context.WorkflowInstanceRunnings.Where(x =>
                    //                        !x.IsDeleted && x.ActivityDestination == current_act.ActivityInstCode);
                    //                    if (confirms.Any())
                    //                    {
                    //                        foreach (var item in confirms)
                    //                        {
                    //                            var lstCommand = new List<JsonCommand>();

                    //                            lstCommand =
                    //                                JsonConvert.DeserializeObject<List<JsonCommand>>(item.Command);
                    //                            lstCommand[lstCommand.Count - 1].Confirmed = "CONFIRM_COMMAND_Y";
                    //                            lstCommand[lstCommand.Count - 1].ConfirmedBy = obj.UserName;
                    //                            lstCommand[lstCommand.Count - 1].ConfirmedTime =
                    //                                DateTime.Now.ToString("HH:mm dd/MM/yyyy");

                    //                            item.Command = JsonConvert.SerializeObject(lstCommand);
                    //                            _context.WorkflowInstanceRunnings.Update(item);
                    //                        }
                    //                    }
                    //                }
                    //                else
                    //                {
                    //                }
                    //            }
                    //        }
                    //        else if (obj.Status.Equals("REPEAT_WORKING"))
                    //        {
                    //            current_act.Status = "STATUS_ACTIVITY_DO";
                    //        }

                    //        _context.ActivityInstances.Update(current_act);
                    //    }

                    //}

                    //if (obj.Status.Equals("FINAL_DONE") || obj.Status.Equals("FINAL_WORKING"))
                    //{
                    //    var secsion = HttpContext.GetSessionUser();
                    //    var des = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value &&
                    //        x.ObjectInst.Equals(objUpdate.TicketCode)
                    //        && x.ObjectType.Equals("EXPORT_STORE"));
                    //    var acts = _context.ActivityInstances.Where(x =>
                    //        !x.IsDeleted && x.WorkflowCode.Equals(des.WfInstCode));
                    //    var current_act = _context.ActivityInstances.FirstOrDefault(x =>
                    //        !x.IsDeleted && x.ActivityInstCode.Equals(des.MarkActCurrent));

                    //    var assigns = _context.ExcuterControlRoleInsts.Where(x =>
                    //        !x.IsDeleted && x.ActivityCodeInst.Equals(current_act.ActivityInstCode));
                    //    if (assigns.Any(x => x.UserId.Equals(obj.UserId)) || secsion.IsAllData ||
                    //        current_act.CreatedBy.Equals(secsion.UserName))
                    //    {
                    //        if (obj.Status.Equals("FINAL_DONE"))
                    //        {
                    //            if (current_act.Type.Equals("TYPE_ACTIVITY_END"))
                    //            {
                    //                current_act.Status = "STATUS_ACTIVITY_APPROVE_END";
                    //                current_act.UpdatedBy = obj.UserName;
                    //                current_act.UpdatedTime = DateTime.Now;
                    //                var wf = _context.WorkflowInstances.FirstOrDefault(x =>
                    //                    !x.IsDeleted.Value && x.WfInstCode.Equals(current_act.WorkflowCode));
                    //                if (wf != null)
                    //                {
                    //                    wf.EndTime = DateTime.Now;
                    //                    wf.Status = "Hoàn thành";
                    //                    _context.WorkflowInstances.Update(wf);
                    //                }
                    //            }
                    //        }
                    //        else if (obj.Status.Equals("FINAL_WORKING"))
                    //        {
                    //            current_act.Status = "STATUS_ACTIVITY_DO";
                    //        }

                    //        _context.ActivityInstances.Update(current_act);
                    //    }

                    //}

                    //if (obj.Status.Equals("REPEAT_REQUIRE_REWORK") || obj.Status.Equals("FINAL_REQUIRE_REWORK"))
                    //{
                    //    var secsion = HttpContext.GetSessionUser();
                    //    var des = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value &&
                    //        x.ObjectInst.Equals(objUpdate.TicketCode)
                    //        && x.ObjectType.Equals("EXPORT_STORE"));

                    //    var repeat = _context.ActivityInstances.FirstOrDefault(x =>
                    //        !x.IsDeleted && x.ActivityInstCode.Equals(obj.ActRepeat));
                    //    repeat.Status = "STATUS_ACTIVITY_DO";
                    //    des.MarkActCurrent = repeat.ActivityInstCode;
                    //    _context.ActivityInstances.Update(repeat);
                    //    _context.WorkflowInstances.Update(des);
                    //}

                    _context.ProductExportHeaders.Update(objUpdate);
                    _context.SaveChanges();
                    msg.Title = "cập nhật thành công";

                    //Update dữ liệu bảng dự báo - chỉ sửa thời gian
                    var listDetail = _context.ProductExportDetails
                        .Where(x => !x.IsDeleted && x.TicketCode == obj.TicketCode).ToList();
                    foreach (var item in listDetail)
                    {
                        string[] param = new string[]
                        {
                            "@ProductCode", "@OldQuantity", "@NewQuantity", "@ProductType", "@LotProductCode",
                            "@CreatedDate"
                        };
                        object[] val = new object[]
                            {item.ProductCode, 0, 0, item.ProductType, obj.LotProductCode, objUpdate.TimeTicketCreate};
                        _repositoryService.CallProc("PR_UPDATE_STORE_EXP_DETAIL", param, val);
                    }

                    //Thêm log dữ liệu
                    var header =
                        _context.ProductExportHeaders.FirstOrDefault(x =>
                            !x.IsDeleted && x.TicketCode.Equals(obj.TicketCode));
                    var detail = _context.ProductExportDetails
                        .Where(x => !x.IsDeleted && x.TicketCode.Equals(obj.TicketCode)).ToList();
                    //Trường hợp xuất PO thì có thêm thông tin lưu các ProdPackageInfoHistorys
                    var detailInfoHistory = _context.ProdPackageDeliverys
                        .Where(x => x.TicketCode.Equals(obj.TicketCode)).ToList();
                    if (header != null)
                    {
                        var logData = new
                        {
                            Header = header,
                            Detail = detail,
                            DetailInfoHistory = detailInfoHistory
                        };
                        var listLogData = new List<object>();

                        if (!string.IsNullOrEmpty(header.LogData))
                        {
                            listLogData = JsonConvert.DeserializeObject<List<object>>(header.LogData);
                            logData.Header.LogData = null;
                            listLogData.Add(logData);
                            header.LogData = JsonConvert.SerializeObject(listLogData);

                            _context.ProductExportHeaders.Update(header);
                            _context.SaveChanges();
                        }
                        else
                        {
                            listLogData.Add(logData);

                            header.LogData = JsonConvert.SerializeObject(listLogData);

                            _context.ProductExportHeaders.Update(header);
                            _context.SaveChanges();
                        }
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Mã phiếu không tồn tại";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra";
            }

            return Json(msg);
        }

        [HttpPost]
        public object GetCurrency()
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                msg.Object = _context.CommonSettings.Where(x =>
                        !x.IsDeleted && x.Group == EnumHelper<CommonEnum>.GetDisplayValue(CommonEnum.Currency))
                    .OrderBy(x => x.SettingID).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra!";
            }

            return Json(msg);
        }

        #endregion

        #region Chi tiết sản phẩm theo xuất lẻ Vatco

        [HttpPost]
        public async Task<IActionResult> ExportFromPackage(string packCode, string ticketCode, string createdBy)
        {
            JMessage msg = new JMessage { Error = false };
            try
            {
                var package = _context.PackageObjects
                    .FirstOrDefault(x => x.PackCode == packCode);
                if (package == null)
                {
                    msg.Error = true;
                    msg.Title = "Không tìm thấy pallet!";
                    return Ok(msg);
                }
                if (package.StatusReady != "EXP_READY")
                {
                    msg.Error = true;
                    msg.Title = "Palet không sẵn sàng!";
                    return Ok(msg);
                }
                var packageDetails = _context.ProductInPallets
                    .Where(x => x.PackCode == packCode && x.IsDeleted == false).ToList();
                if (packageDetails.Count == 0)
                {
                    msg.Error = true;
                    msg.Title = "Không có sp trong pallet để xuất!";
                    return Ok(msg);
                }
                foreach (var item in packageDetails)
                {
                    var productInStock = _context.ProductInStocks.FirstOrDefault(x => !x.IsDeleted && x.IdImpProduct == item.IdImpProduct);
                    if (productInStock == null || item.IdImpProduct == null || item.IdImpProduct == -1)
                    {
                        msg.Error = true;
                        msg.Title = "Palet chưa được nhập!";
                        return Ok(msg);
                    }
                    var productLocatedMapping = _context.ProductLocatedMappings.FirstOrDefault(x => !x.IsDeleted && x.IdImpProduct == item.IdImpProduct);
                    if (productLocatedMapping == null)
                    {
                        msg.Error = true;
                        msg.Title = "Palet chưa được xếp!";
                        return Ok(msg);
                    }
                }
                foreach (var item in packageDetails)
                {
                    var quantity = item.ListProdStrNo.SumQuantity();
                    var today = DateTime.Now.ToString("ddMMyyyy-HHmm"); //format('DDMMYYYY-HHmm')
                    var materialProduct = _context.MaterialProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == item.ProductCode);
                    var productLocatedMapping = _context.ProductLocatedMappings.FirstOrDefault(x => !x.IsDeleted && x.IdImpProduct == item.IdImpProduct);
                    var newDetail = new ExportDetail()
                    {
                        Currency = "VND",
                        //PackType = "",
                        ProductCode = item.ProductCode,
                        //AttrCustom = "",
                        ProductQrCode = $"{item.ProductCode}_SL.{quantity}_T.{today}",
                        ProductType = materialProduct?.TypeCode,
                        ProductNo = item.ProductNo,
                        Quantity = quantity,
                        SalePrice = 0,
                        TicketCode = ticketCode,
                        SrcUnit = materialProduct.Unit,
                        UserName = createdBy,
                        ExpType = "FULL",
                        //ParentMappingId = -1,
                        //ParentProductNumber = -1,
                        MapId = productLocatedMapping.Id,
                        Weight = item.Measure,
                        IsMultiple = false,
                        PackCode = packCode,
                        PackLot = package?.PackLot
                    };
                    item.IdImpProduct = -1;
                    msg = await InsertDetailExp(newDetail);
                    if (msg.Error)
                    {
                        return Ok(msg);
                    }
                }
                if (package != null)
                {
                    //package.StatusReady = "NON_READY";
                    await _context.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi nhập!";
            }

            return Ok(msg);
        }

        [HttpPost]
        public async Task<IActionResult> DeletePackageExport(string ticketCode, string packCode, string deletedBy)
        {
            JMessage msg = new JMessage { Error = false };
            try
            {
                var ticket = _context.ProductExportHeaders.FirstOrDefault(x => !x.IsDeleted && x.TicketCode == ticketCode);
                if (ticket?.TicketStatus == "INITIAL_DONE")
                {
                    msg.Error = true;
                    msg.Title = "Phiếu xuất đã xử lý xong không được xóa chi tiết";
                    return Ok(msg);
                }
                var listDeleteDetail = _context.ProductExportDetails
                        .Where(x => !x.IsDeleted && x.TicketCode == ticketCode && x.PackCode == packCode).ToList();
                if (listDeleteDetail.Count == 0)
                {
                    msg.Error = true;
                    msg.Title = "Không có sp trong pallet để xóa!";
                    return Ok(msg);
                }
                foreach (var item in listDeleteDetail)
                {
                    msg = await DelDeliveryDetail(item.Id, deletedBy);
                    if (msg.Error)
                    {
                        return Ok(msg);
                    }
                }
            }
            catch (Exception)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi lấy dữ liệu!";
            }
            return Ok(msg);
        }

        [HttpPost]
        public IActionResult GetPackageFromExport(string ticketCode)
        {
            JMessage msg = new JMessage { Error = false };
            try
            {
                var common = _context.CommonSettings;
                var query = (from a in _context.ProductExportDetails.Where(x => !x.IsDeleted)
                             join b in _context.PackageObjects on a.PackCode equals b.PackCode
                             where a.TicketCode == ticketCode
                             select b).DistinctBy(x => x.Id);
                var package = query.OrderByDescending(x => x.Id).Select(x => new
                {
                    x.Id,
                    x.PackCode,
                    x.PackName,
                    x.PackType,
                    //PackTypeName = (x.PackType != null) ? common.FirstOrDefault(y => y.CodeSet == x.PackType).ValueSet : "",
                    x.Specs,
                    x.Noted,
                    x.CurrentPos,
                    CurrentPosName = x.CurrentPos,
                    StatusName = !string.IsNullOrEmpty(x.Status) ? common.FirstOrDefault(y => y.CodeSet == x.Status).ValueSet : "",
                    x.PackCodeParent,
                    PackCodeParentName = !string.IsNullOrEmpty(x.PackCodeParent) ? _context.PackageObjects.FirstOrDefault(y => y.PackCode == x.PackCodeParent).PackName : "",
                    AttrPack = ValidateAttrPack(x.AttrPack),
                    x.Level,
                    x.NumPosition,
                    x.StatusReady,
                    StatusReadyName = (x.StatusReady != null) ? common.FirstOrDefault(y => y.CodeSet == x.StatusReady).ValueSet : "",
                }).ToList();

                msg.Object = package;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra khi lấy dữ liệu";
            }
            return Ok(msg);
        }

        [HttpPost]
        public async Task<JMessage> InsertDetailProductOddVatco(ExportDetail obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                if (obj.IsMultiple == true)
                {
                    var digits = new[] { '0', '1', '2', '3', '4', '5', '6', '7', '8', '9' };
                    var startCode = obj.ProductCode.TrimEnd(digits);
                    var listProduct = _context.ProductLocatedMappings
                        .Where(x => !x.IsDeleted && x.ProductCode.StartsWith(startCode))
                        .Select(delegate (ProductLocatedMapping product)
                        {
                            var number = GetNumberInEndOfString(product.ProductCode);
                            return new
                            {
                                ProductCode = product.ProductCode,
                                MapId = product.Id,
                                Number = !string.IsNullOrEmpty(number) ? int.Parse(number) : -1,
                                Quantity = product.Quantity,
                                Weight = product.Weight
                            };
                        })
                        .ToList();
                    var stringStart = GetNumberInEndOfString(obj.ProductCode);
                    var numberStart = !string.IsNullOrEmpty(stringStart) ? int.Parse(stringStart) : -1;
                    var listProductFilter = listProduct.Where(x => x.Number >= numberStart && x.Number < (numberStart + obj.Quantity) && x.Quantity > 0)
                        .ToList();
                    var remainWeight = obj.Weight ?? 0;
                    if (listProductFilter.Count < obj.Quantity)
                    {
                        msg.Title = "Không đủ sản phẩm tồn kho để tự sinh";
                        msg.Error = true;
                        return msg;
                    }
                    foreach (var item in listProductFilter)
                    {
                        obj.ProductCode = item.ProductCode;
                        obj.ProductNo = "1";
                        //obj.Weight = remainWeight >= item.Weight ? item.Weight : remainWeight;
                        obj.MapId = item.MapId;
                        //remainWeight -= (item.Weight ?? 0);
                        await InsertDetailSingle(obj);
                    }
                    msg.Title = "Thêm thành công";
                }
                else
                {
                    return await InsertDetailSingle(obj);
                }

                _context.SaveChanges();
                msg.Title = "Thêm thành công";
                //CleanUpStock(obj.ProductQrCode, obj.WHS_Code, obj.ProductCode, obj.UserName);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra";
            }

            return msg;
        }

        private async Task<JMessage> InsertDetailSingle(ExportDetail obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var parentMapping = _context.ProductLocatedMappings.FirstOrDefault(x => !x.IsDeleted && x.Id == obj.MapId);
            var materialProduct = _context.MaterialProducts.Include(x => x.Group)
                .FirstOrDefault(x => !x.IsDeleted && x.ProductCode == obj.ProductCode);
            var listProdStrNo = new List<ProdStrNo>();
            try
            {
                listProdStrNo = ListProdStrNoHelper.GetListProdStrNo(obj.ProductNo);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
            if (listProdStrNo.Count == 0)
            {
                msg.Error = true;
                msg.Title = "Thứ tự không hợp lệ!";
                return msg;
            }
            if (parentMapping != null && parentMapping.ListProdStrNo.Count > 0 && parentMapping.ListProdStrNo.ContainsRange(listProdStrNo))
            {
                var quantity = listProdStrNo.SumQuantity();
                if (quantity > parentMapping.Quantity)
                {
                    msg.Error = true;
                    msg.Title = "Số lượng xuất không hợp lệ";
                    return msg;
                }
                //var listProductNo = Enumerable.Range(parentMapping.ListProductNo.FirstOrDefault(), int.Parse(obj.Quantity.ToString())).ToList();
                //parentMapping.ListProductNo.RemoveRange(0, int.Parse(obj.Quantity.ToString()));
                //not ready yet
                parentMapping.ListProdStrNo.Extract(listProdStrNo);
                parentMapping.Quantity -= quantity;
                if ((parentMapping.Weight ?? 0) >= (obj.Weight ?? 0))
                {
                    parentMapping.Weight -= obj.Weight;
                }
                else if (materialProduct?.Group?.GroupType == "STATIC_TANK"
                || materialProduct?.Group?.GroupType == "BOTTLE")
                {
                    msg.Error = true;
                    msg.Title = "Khối lượng xuất vượt quá khối lượng hiện tại của bồn chứa, bình";
                    return msg;
                }
                if (parentMapping.Quantity == 0)
                {
                    parentMapping.IsDeleted = true;
                    parentMapping.DeletionToken = Guid.NewGuid().ToString();
                }
                _context.ProductLocatedMappings.Update(parentMapping);
                var mappingLog = new ProductLocatedMappingLog
                {
                    IdImpProduct = parentMapping.IdImpProduct,
                    IdLocMapOld = parentMapping.Id,
                    IdLocatedMapping = -1,
                    MappingCode = "",
                    MappingCodeOld = parentMapping.MappingCode,
                    StoreCode = parentMapping.WHS_Code,
                    GattrCode = parentMapping.GattrCode,
                    ProductCode = parentMapping.ProductCode,
                    ProductNo = obj.ProductNo,
                    ProductQrCode = parentMapping.ProductQrCode,
                    Quantity = quantity,
                    Unit = parentMapping.Unit,
                    TicketCode = obj.TicketCode,
                    Type = "EXPORT_FULL",
                    CreatedBy = obj.UserName,
                    CreatedTime = DateTime.Now,
                    IsDeleted = false,
                    //MarkWholeProduct = mark.Any() ? true : false,
                    DeletionToken = "NA"
                };

                _context.ProductLocatedMappingLogs.Add(mappingLog);

                var parentInStock = _context.ProductInStocks.Where(x => !x.IsDeleted && x.IdImpProduct == parentMapping.IdImpProduct/* && x.GattrCode == obj.GattrCode*/
                /*&& x.ListProductNo.ContainsRange(parentMapping.ListProductNo)*/).ToList().FirstOrDefault(x => x.ListProdStrNo.ContainsRange(parentMapping.ListProdStrNo));
                if (parentInStock != null)
                {
                    //parentInStock.ListProductNo.RemoveRange(0, int.Parse(obj.Quantity.ToString()));
                    //not ready yet
                    parentInStock.ListProdStrNo.Extract(listProdStrNo);
                    parentInStock.Quantity -= quantity;
                    if (parentInStock.Weight >= obj.Weight)
                    {
                        parentInStock.Weight -= obj.Weight;
                    }
                    if (parentInStock.Quantity == 0)
                    {
                        parentInStock.IsDeleted = true;
                        parentInStock.DeletionToken = Guid.NewGuid().ToString();
                        parentInStock.DeletedBy = obj.UserName;
                    }
                    _context.ProductInStocks.Update(parentInStock);
                    //var newParentInStock = new ProductInStock
                    //{
                    //    IdImpProduct = parentInStock.IdImpProduct,
                    //    LotProductCode = parentInStock.LotProductCode,
                    //    StoreCode = parentInStock.StoreCode,
                    //    ProductCode = parentInStock.ProductCode,
                    //    ProductType = parentInStock.ProductType,
                    //    ProductQrCode = parentInStock.ProductQrCode,
                    //    Quantity = quantity,
                    //    //ListProductNo = listProductNo,
                    //    ListProdStrNo = listProdStrNo,
                    //    Unit = parentInStock.Unit,
                    //    CreatedBy = User.Identity.Name,
                    //    CreatedTime = DateTime.Now,
                    //    IsDeleted = false,
                    //    //MarkWholeProduct = mark.Any() ? true : false,
                    //    PackCode = parentInStock.PackCode,
                    //    GattrCode = parentMapping.GattrCode,
                    //    DeletionToken = "NA"
                    //};
                    //_context.ProductInStocks.Add(newParentInStock);
                }
                var detail = new ProductExportDetail
                {
                    TicketCode = obj.TicketCode,
                    GattrCode = parentMapping.GattrCode,
                    //ListProductNo = listProductNo,
                    ListProdStrNo = listProdStrNo,
                    LotProductCode = obj.LotProductCode,
                    ProductQrCode = obj.ProductQrCode,
                    ProductCode = obj.ProductCode,
                    ProdCustomJson = obj.ProdCustomJson,
                    IsCustomized = obj.IsCustomized,
                    Quantity = quantity,
                    Weight = obj.Weight,
                    Unit = obj.Unit,
                    SalePrice = obj.SalePrice,
                    Currency = obj.Currency,
                    CreatedBy = obj.UserName,
                    CreatedTime = DateTime.Now,
                    Status = obj.Status,
                    MapId = obj.MapId,
                    ExpType = obj.ExpType,
                    PackCode = obj.PackCode,
                    PackLot = obj.PackLot,
                    DeletionToken = "NA"
                };
                _context.ProductExportDetails.Add(detail);
                var header = _context.ProductExportHeaders.FirstOrDefault(x => !x.IsDeleted && x.TicketCode == obj.TicketCode);
                var mpStatus = new MpStatus()
                {
                    ActStatus = "EXPORT",
                    ActTime = DateTime.Now,
                    ActBy = obj.UserName,
                    ProductNo = listProdStrNo.ToFlatString(),
                    //MappingCode = parentMapping.MappingCode,
                    SupCode = header?.SupCode,
                    CusCode = header?.CusCode,
                };
                materialProduct.MpStatuses = materialProduct.MpStatuses != null ? materialProduct.MpStatuses : new List<MpStatus>();
                materialProduct.MpStatuses.Add(mpStatus);
                await _context.SaveChangesAsync();
                msg.Title = "Thêm thành công";
            }
            else
            {
                msg.Error = true;
                msg.Title = "Sản phẩm không tồn tại ở vị trí";
            }
            return msg;
        }

        private async Task<JMessage> InsertDetailQuantity(ExportDetail obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var parentMapping = _context.ProductLocatedMappings.FirstOrDefault(x => !x.IsDeleted && x.Id == obj.MapId);
            var materialProduct = _context.MaterialProducts.Include(x => x.Group)
                .FirstOrDefault(x => !x.IsDeleted && x.ProductCode == obj.ProductCode);
            var listProdStrNo = new List<ProdStrNo>() { new ProdStrNo(1) };
            if (parentMapping != null && parentMapping.ListProdStrNo.Count > 0 && parentMapping.Quantity >= obj.Quantity)
            {
                //parentMapping.ListProdStrNo.Extract(listProdStrNo);
                parentMapping.Quantity -= obj.Quantity;
                if ((parentMapping.Weight ?? 0) >= (obj.Weight ?? 0))
                {
                    parentMapping.Weight -= obj.Weight;
                }
                else if (materialProduct?.Group?.GroupType == "STATIC_TANK"
                || materialProduct?.Group?.GroupType == "BOTTLE")
                {
                    msg.Error = true;
                    msg.Title = "Khối lượng xuất vượt quá khối lượng hiện tại của bồn chứa, bình";
                    return msg;
                }
                _context.ProductLocatedMappings.Update(parentMapping);
                var mappingLog = new ProductLocatedMappingLog
                {
                    IdImpProduct = parentMapping.IdImpProduct,
                    IdLocMapOld = parentMapping.Id,
                    IdLocatedMapping = -1,
                    MappingCode = "",
                    MappingCodeOld = parentMapping.MappingCode,
                    StoreCode = parentMapping.WHS_Code,
                    GattrCode = parentMapping.GattrCode,
                    ProductCode = parentMapping.ProductCode,
                    ProductNo = "1",
                    ProductQrCode = parentMapping.ProductQrCode,
                    Quantity = obj.Quantity,
                    Unit = parentMapping.Unit,
                    TicketCode = obj.TicketCode,
                    Type = "EXPORT_FULL",
                    CreatedBy = obj.UserName,
                    CreatedTime = DateTime.Now,
                    IsDeleted = false,
                    //MarkWholeProduct = mark.Any() ? true : false,
                    DeletionToken = "NA"
                };

                _context.ProductLocatedMappingLogs.Add(mappingLog);
                var parentInStock = _context.ProductInStocks.Where(x => !x.IsDeleted && x.ProductCode == obj.ProductCode)
                    .ToList().FirstOrDefault(x => x.Quantity >= obj.Quantity);
                if (parentInStock != null)
                {
                    //parentInStock.ListProductNo.RemoveRange(0, int.Parse(obj.Quantity.ToString()));
                    //not ready yet
                    //parentInStock.ListProdStrNo.Extract(listProdStrNo);
                    parentInStock.Quantity -= obj.Quantity;
                    if (parentInStock.Weight >= obj.Weight)
                    {
                        parentInStock.Weight -= obj.Weight;
                    }
                    _context.ProductInStocks.Update(parentInStock);
                }
                var detail = new ProductExportDetail
                {
                    TicketCode = obj.TicketCode,
                    GattrCode = parentMapping.GattrCode,
                    //ListProductNo = listProductNo,
                    ListProdStrNo = listProdStrNo,
                    LotProductCode = obj.LotProductCode,
                    ProductQrCode = obj.ProductQrCode,
                    ProductCode = obj.ProductCode,
                    ProdCustomJson = obj.ProdCustomJson,
                    IsCustomized = obj.IsCustomized,
                    Quantity = obj.Quantity,
                    Weight = obj.Weight,
                    Unit = obj.Unit,
                    SalePrice = obj.SalePrice,
                    Currency = obj.Currency,
                    CreatedBy = obj.UserName,
                    CreatedTime = DateTime.Now,
                    Status = obj.Status,
                    MapId = obj.MapId,
                    ExpType = obj.ExpType,
                    PackCode = obj.PackCode,
                    PackLot = obj.PackLot,
                    DeletionToken = "NA"
                };
                _context.ProductExportDetails.Add(detail);
                var header = _context.ProductExportHeaders.FirstOrDefault(x => !x.IsDeleted && x.TicketCode == obj.TicketCode);
                var mpStatus = new MpStatus()
                {
                    ActStatus = "EXPORT",
                    ActTime = DateTime.Now,
                    ActBy = obj.UserName,
                    ProductNo = listProdStrNo.ToFlatString(),
                    //MappingCode = parentMapping.MappingCode,
                    SupCode = header?.SupCode,
                    CusCode = header?.CusCode,
                };
                materialProduct.MpStatuses = materialProduct.MpStatuses != null ? materialProduct.MpStatuses : new List<MpStatus>();
                materialProduct.MpStatuses.Add(mpStatus);
                await _context.SaveChangesAsync();
                msg.Title = "Thêm thành công";
            }
            else if (parentMapping.Quantity < obj.Quantity)
            {
                msg.Error = true;
                msg.Title = "Khối lượng xuất không hợp lệ";
            }
            else
            {
                msg.Error = true;
                msg.Title = "Sản phẩm không tồn tại ở vị trí";
            }
            return msg;
        }

        [HttpPost]
        public JsonResult InsertDetailProductExport(ExportDetail obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                //var prodInStock = _context.ProductInStockNews.FirstOrDefault(x => x.Id == obj.IdProductInStock);
                //if (prodInStock == null)
                //{
                //    msg.Error = true;
                //    msg.Title = "Sản phẩm không tồn tại trong kho";
                //    return Json(msg);
                //}
                //else if (obj.Quantity > prodInStock.Quantity)
                //{
                //    msg.Error = true;
                //    msg.Title = "Kho không còn đủ sản phẩm để xuất theo yêu cầu";
                //    return Json(msg);
                //}

                //var mappingEntities = _context.ProductLocatedMappings
                //    .Where(x => x.ProductQrCode == prodInStock.ProductQrCode).ToList();
                //if (mappingEntities.Count <= 1)
                //{
                //    prodInStock.Quantity -= obj.Quantity;
                //    _context.ProductInStockNews.Update(prodInStock);
                //    var mapId = -1;
                //    var mapping = mappingEntities.FirstOrDefault();
                //    if (mapping != null)
                //    {
                //        if (obj.Quantity > mapping.Quantity)
                //        {
                //            msg.Error = true;
                //            msg.Title = "Vị trí không còn đủ sản phẩm để xuất";
                //            return Json(msg);
                //        }
                //        else
                //        {
                //            mapping.Quantity -= obj.Quantity;
                //            _context.ProductLocatedMappings.Update(mapping);
                //            mapId = mapping.Id;
                //        }
                //    }
                //    var detail = new ProductExportDetail
                //    {
                //        TicketCode = obj.TicketCode,
                //        LotProductCode = obj.LotProductCode,
                //        ProductQrCode = obj.ProductQrCode,
                //        ProductCode = obj.ProductCode,
                //        Quantity = obj.Quantity,
                //        Unit = obj.Unit,
                //        SalePrice = obj.SalePrice,
                //        Currency = obj.Currency,
                //        CreatedBy = obj.UserName,
                //        CreatedTime = DateTime.Now,
                //        IsCustomized = prodInStock.IsCustomized,
                //        ProdCustomJson = prodInStock.ProdCustomJson,
                //        MapId = mapId
                //    };
                //    _context.ProductExportDetails.Add(detail);

                //    var stockPopEntry = new StockArrangePopEntry
                //    {
                //        MapId = obj.MapId,
                //        ProdCode = obj.ProductQrCode,
                //        Quantity = obj.Quantity,
                //        UnitExp = obj.Unit
                //    };
                //    _context.StockArrangePopEntrys.Add(stockPopEntry);

                //    SeparatePack(obj.JsonPack, obj.MaxQuantity, obj.Quantity, obj.Unit, obj.ProductCode,
                //        obj.ProductQrCode, obj.WHS_Code, obj.LotProductCode, obj.SrcUnit, mapId);
                //    msg.Object = new
                //    {
                //        Origin = obj,
                //        Data = new List<object>()
                //    };

                //    _context.SaveChanges();
                //    msg.Title = "Thêm thành công";
                //    if (prodInStock.Quantity == 0)
                //    {
                //        CleanUpStock(obj.ProductQrCode, obj.WHS_Code, obj.ProductCode, obj.UserName);
                //    }
                //}
                //else
                //{
                //    var data = from a in _context.ProductLocatedMappings
                //                   //join b in _context.EDMSRacks on a.RackCode equals b.RackCode into b1
                //                   //from b in b1.DefaultIfEmpty()
                //               join c in _context.PAreaMappingsStore.Where(x => !x.IsDeleted) on a.MappingCode equals c.ObjectCode
                //               join e in _context.PAreaCategoriesStore.Where(x => x.IsDeleted == false)
                //                   on new { c.CategoryCode, c.ObjectType } equals new
                //                   { CategoryCode = e.Code, ObjectType = e.PAreaType }
                //               where a.IsDeleted == false && a.ProductQrCode == prodInStock.ProductQrCode
                //               select new
                //               {
                //                   a.Id,
                //                   a.ProductQrCode,
                //                   a.Quantity,
                //                   a.Unit,
                //                   Name = e.PAreaDescription,
                //                   MappingCode = c.ObjectCode,
                //                   Title = a.ProductQrCode + " " + e.PAreaDescription
                //               };
                //    msg.Object = new
                //    {
                //        Origin = obj,
                //        Data = data.ToList()
                //    };
                //}
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra";
            }

            return Json(msg);
        }
        [HttpPost]
        public async Task<JMessage> InsertDetailExp([FromBody] ExportDetail obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var parentMapping = _context.ProductLocatedMappings.Include(x => x.Product).ThenInclude(x => x.Group)
                    .FirstOrDefault(x => !x.IsDeleted && x.Id == obj.MapId);
                if (obj.IsMultiple == true)
                {
                    var digits = new[] { '0', '1', '2', '3', '4', '5', '6', '7', '8', '9' };
                    var startCode = obj.ProductCode.TrimEnd(digits);
                    var listProduct = _context.ProductLocatedMappings
                        .Where(x => !x.IsDeleted && x.ProductCode.StartsWith(startCode))
                        .Select(delegate (ProductLocatedMapping product)
                {
                    var number = GetNumberInEndOfString(product.ProductCode);
                    return new
                    {
                        ProductCode = product.ProductCode,
                        MapId = product.Id,
                        Number = !string.IsNullOrEmpty(number) ? int.Parse(number) : -1,
                        Quantity = product.Quantity,
                        Weight = product.Weight
                    };
                })
                        .ToList();
                    var stringStart = GetNumberInEndOfString(obj.ProductCode);
                    var numberStart = !string.IsNullOrEmpty(stringStart) ? int.Parse(stringStart) : -1;
                    var listProductFilter = listProduct.Where(x => x.Number >= numberStart /*&& x.Number < (numberStart + obj.Quantity)*/ && x.Quantity > 0)
                        .Take(int.Parse(obj.Quantity.ToString()))
                        .ToList();
                    var remainWeight = obj.Weight ?? 0;
                    if (listProductFilter.Count < obj.Quantity)
                    {
                        msg.Title = "Không đủ sản phẩm tồn kho để tự sinh";
                        msg.Error = true;
                        return msg;
                    }
                    foreach (var item in listProductFilter)
                    {
                        obj.ProductCode = item.ProductCode;
                        obj.ProductNo = "1";
                        obj.Weight = remainWeight >= item.Weight ? item.Weight : remainWeight;
                        obj.MapId = item.MapId;
                        remainWeight -= (item.Weight ?? 0);
                        await InsertDetailSingle(obj);
                    }
                    msg.Title = "Thêm thành công";
                }
                else if (parentMapping?.Product?.Group?.GroupType == "STATIC_TANK")
                {
                    return await InsertDetailQuantity(obj);
                }
                else
                {
                    return await InsertDetailSingle(obj);
                }

                _context.SaveChanges();
                msg.Title = "Thêm thành công";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra";
            }
            return msg;
        }

        [HttpPost]
        public async Task<JsonResult> InsertDetailProductDetails([FromBody] ExportPartialDetails data)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var obj = data.ExportDetailParent;
                var testMapping = _context.ProductLocatedMappings.FirstOrDefault(x => !x.IsDeleted && x.Id == obj.ParentMappingId);
                var checkMapping = testMapping?.ListProdStrNo.Include(obj.ParentProductNumber.Value) ?? false;
                if (checkMapping == false)
                {
                    msg.Error = true;
                    msg.Title = "Thứ tự không tồn tại trong dãy!";
                    return Json(msg);
                }
                var sumQuantityExp = data.ListExportDetails.Count > 0 ? data.ListExportDetails.Sum(x => x.Quantity) : 0;
                if (data.ListExportDetails.Count == 0 && sumQuantityExp == 0)
                {
                    msg.Error = true;
                    msg.Title = "Không có linh kiện, phụ kiện nào xuất!";
                    return Json(msg);
                }
                var gattrCode = "";
                var groupAttribute = _context.ProductGattrExts.FirstOrDefault(x => !x.IsDeleted && x.GattrFlatCode == obj.ParentFlatCode);
                if (groupAttribute == null)
                {
                    var maxGroupId = _context.ProductGattrExts.MaxBy(x => x.Id) != null ? _context.ProductGattrExts.MaxBy(x => x.Id).Id : 1;
                    var newGroupAttribute = new ProductGattrExt
                    {
                        //GattrCode = (maxGroupId + 1).ToString(),
                        GattrFlatCode = obj.ParentFlatCode,
                        GattrJson = obj.ParentCustomJson,
                        IsDeleted = false,
                        CreatedBy = obj.UserName,
                        CreatedTime = DateTime.Now,
                        Type = "EXPORT",
                        IdSource = obj.ParentMappingId
                    };
                    _context.ProductGattrExts.Add(newGroupAttribute);
                    await _context.SaveChangesAsync();
                    maxGroupId = newGroupAttribute.Id;
                    newGroupAttribute.GattrCode = newGroupAttribute.Id.ToString();
                    gattrCode = newGroupAttribute.GattrCode;
                    _context.ProductGattrExts.Update(newGroupAttribute);
                    logProduct.Info(newGroupAttribute.Id);
                    await _context.SaveChangesAsync();
                }
                else
                {
                    gattrCode = groupAttribute.GattrCode;
                }
                var parentMapping = _context.ProductLocatedMappings.FirstOrDefault(x => !x.IsDeleted && x.Id == obj.ParentMappingId);
                if (parentMapping != null /*&& obj.ParentProductNumber.HasValue*/ && parentMapping.ListProdStrNo.Count > 0)
                {
                    //obj.ParentProductNumber = parentMapping.ListProductNo.FirstOrDefault();
                    //parentMapping.ListProductNo.Remove(obj.ParentProductNumber.Value);
                    parentMapping.ListProdStrNo.Extract(obj.ParentProductNumber.Value);
                    parentMapping.Quantity -= 1;
                    _context.ProductLocatedMappings.Update(parentMapping);
                    var newId = -1;
                    var checkLocated = _context.ProductLocatedMappings.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == parentMapping.ProductCode
                    && x.IdImpProduct == parentMapping.IdImpProduct && x.GattrCode == gattrCode && x.MappingCode == parentMapping.MappingCode);
                    if (checkLocated == null)
                    {
                        var newParentMapping = new ProductLocatedMapping
                        {
                            IdImpProduct = parentMapping.IdImpProduct,
                            MappingCode = parentMapping.MappingCode,
                            WHS_Code = parentMapping.WHS_Code,
                            ProductCode = parentMapping.ProductCode,
                            ProductType = parentMapping.ProductType,
                            ProductQrCode = parentMapping.ProductQrCode,
                            Quantity = 1,
                            ListProdStrNo = new List<ProdStrNo> { new ProdStrNo(obj.ParentProductNumber.Value) },
                            //ListProductNo = new List<int> { obj.ParentProductNumber.Value },
                            Unit = parentMapping.Unit,
                            CreatedBy = obj.UserName,
                            CreatedTime = DateTime.Now,
                            IsDeleted = false,
                            //MarkWholeProduct = mark.Any() ? true : false,
                            GattrCode = gattrCode,
                            DeletionToken = "NA"
                        };
                        _context.ProductLocatedMappings.Add(newParentMapping);
                        await _context.SaveChangesAsync();
                        newId = newParentMapping.Id;
                    }
                    else
                    {
                        checkLocated.ListProdStrNo.Add(new ProdStrNo(obj.ParentProductNumber.Value));
                        checkLocated.Quantity++;
                        _context.ProductLocatedMappings.Update(checkLocated);
                        newId = checkLocated.Id;
                    }
                    var mappingLog = new ProductLocatedMappingLog
                    {
                        IdImpProduct = parentMapping.IdImpProduct,
                        IdLocMapOld = parentMapping.Id,
                        IdLocatedMapping = newId,
                        MappingCode = parentMapping.MappingCode,
                        MappingCodeOld = parentMapping.MappingCode,
                        StoreCode = parentMapping.WHS_Code,
                        GattrCode = gattrCode,
                        ProductCode = parentMapping.ProductCode,
                        ProductNo = obj.ParentProductNumber.Value.ToString(),
                        ProductQrCode = parentMapping.ProductQrCode,
                        Quantity = 1,
                        Unit = parentMapping.Unit,
                        TicketCode = obj.TicketCode,
                        Type = "EXPORT_PARTIAL",
                        CreatedBy = obj.UserName,
                        CreatedTime = DateTime.Now,
                        IsDeleted = false,
                        //MarkWholeProduct = mark.Any() ? true : false,
                        DeletionToken = "NA"
                    };

                    _context.ProductLocatedMappingLogs.Add(mappingLog);
                    var parentInStock = _context.ProductInStocks.Where(x => !x.IsDeleted && x.IdImpProduct == parentMapping.IdImpProduct/* && x.GattrCode == obj.GattrCode*/
                    /*&& x.ListProductNo.ContainsRange(parentMapping.ListProductNo)*/).ToList().FirstOrDefault(x => x.ListProdStrNo.ContainsRange(parentMapping.ListProdStrNo));
                    if (parentInStock != null)
                    {
                        //parentInStock.ListProductNo.Remove(obj.ParentProductNumber.Value);
                        parentInStock.ListProdStrNo.Extract(obj.ParentProductNumber.Value);
                        parentInStock.Quantity -= 1;
                        _context.ProductInStocks.Update(parentInStock);
                        var newParentInStock = new ProductInStock
                        {
                            IdImpProduct = parentInStock.IdImpProduct,
                            LotProductCode = parentInStock.LotProductCode,
                            StoreCode = parentInStock.StoreCode,
                            ProductCode = parentInStock.ProductCode,
                            ProductType = parentInStock.ProductType,
                            ProductQrCode = parentInStock.ProductQrCode,
                            Quantity = 1,
                            ListProdStrNo = new List<ProdStrNo> { new ProdStrNo(obj.ParentProductNumber.Value) },
                            Unit = parentInStock.Unit,
                            CreatedBy = obj.UserName,
                            CreatedTime = DateTime.Now,
                            IsDeleted = false,
                            //MarkWholeProduct = mark.Any() ? true : false,
                            PackCode = parentInStock.PackCode,
                            GattrCode = gattrCode,
                            DeletionToken = "NA"
                        };
                        _context.ProductInStocks.Add(newParentInStock);
                    }
                    await _context.SaveChangesAsync();
                    foreach (var item in data.ListExportDetails)
                    {
                        await InsertDetailProductPartial(item, parentMapping.IdImpProduct.Value, obj.ParentProductNumber.Value, obj.UserName);
                    }
                    msg.Title = "Xuất thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Sản phẩm không tồn tại ở vị trí";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra";
                logProduct.Info(ex.Message);
                await CleanGattr();
            }
            return Json(msg);
        }

        private async Task<JsonResult> InsertDetailProductPartial(ExportDetail obj, int idImpProduct, int parentProductNumber, string userName)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var listProductNo = new List<ProdStrNo> { new ProdStrNo(int.Parse(obj.Quantity.ToString())) };
                var detail = new ProductExportDetail
                {
                    TicketCode = obj.TicketCode,
                    //ListProductNo = listProductNo,
                    ListProdStrNo = listProductNo,
                    LotProductCode = obj.LotProductCode,
                    ProductQrCode = obj.ProductQrCode,
                    ProductCode = obj.ProductCode,
                    ProdCustomJson = obj.ProdCustomJson,
                    IsCustomized = obj.IsCustomized,
                    Quantity = obj.Quantity,
                    Unit = obj.Unit,
                    SalePrice = obj.SalePrice,
                    Currency = obj.Currency,
                    CreatedBy = userName,
                    CreatedTime = DateTime.Now,
                    MapId = obj.MapId,
                    Status = obj.Status,
                    ExpType = obj.ExpType,
                    DeletionToken = "NA"
                };
                _context.ProductExportDetails.Add(detail);
                await _context.SaveChangesAsync();
                var impParent = new ProductExpParent
                {
                    IdImpProduct = idImpProduct,
                    IdExpProduct = detail.Id,
                    IdProductParent = obj.MapId,
                    Number = parentProductNumber,
                    IsDeleted = false,
                    CreatedBy = userName,
                    CreatedTime = DateTime.Now,
                };
                _context.ProductExpParents.Add(impParent);
                var header = _context.ProductExportHeaders.FirstOrDefault(x => !x.IsDeleted && x.TicketCode == obj.TicketCode);
                var materialProduct = _context.MaterialProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == obj.ProductCode);
                var mapping = _context.ProductLocatedMappings.FirstOrDefault(x => !x.IsDeleted && x.Id == obj.MapId);
                var mpStatus = new MpStatus()
                {
                    ActStatus = "EXPORT",
                    ActTime = DateTime.Now,
                    ActBy = obj.UserName,
                    ProductNo = listProductNo.ToFlatString(),
                    //MappingCode = mapping?.MappingCode,
                    SupCode = header?.SupCode,
                    CusCode = header?.CusCode,
                };
                materialProduct.MpStatuses = materialProduct.MpStatuses != null ? materialProduct.MpStatuses : new List<MpStatus>();
                materialProduct.MpStatuses.Add(mpStatus);
                await _context.SaveChangesAsync();
                msg.Title = "Có lỗi xảy ra";
                //CleanUpStock(obj.ProductQrCode, obj.WHS_Code, obj.ProductCode);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra";
            }
            return Json(msg);
        }

        private List<int> GetListProductNo(string value)
        {
            var listItem = string.IsNullOrEmpty(value)
                ? new List<string>()
                : value.Split(", ").ToList();
            var listProductNo = new List<int>();
            foreach (var item in listItem)
            {
                if (item.Contains(".."))
                {
                    var startNo = int.Parse(item.Split("..")[0].Trim());
                    var endNo = int.Parse(item.Split("..")[1].Trim());
                    var count = endNo - startNo - 1;
                    var listItemNo = Enumerable.Range(startNo, count).ToList();
                    listProductNo.AddRange(listItemNo);
                }
                else
                {
                    listProductNo.Add(int.Parse(item));
                }
            }
            return listProductNo;
        }
        [HttpPost]
        public JsonResult InsertDetailProductExportMulti([FromBody] List<ExportDetail> listObj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                //foreach (var obj in listObj)
                //{
                //    var prodInStock = _context.ProductInStockNews.FirstOrDefault(x => x.Id == obj.IdProductInStock);
                //    if (prodInStock == null)
                //    {
                //        msg.Error = true;
                //        msg.Title = "Sản phẩm không tồn tại trong kho";
                //        return Json(msg);
                //    }
                //    prodInStock.Quantity -= obj.Quantity;
                //    _context.ProductInStockNews.Update(prodInStock);
                //    var mapId = -1;
                //    var mapping = _context.ProductLocatedMappings.FirstOrDefault(x => x.Id == obj.MapId);
                //    if (mapping != null)
                //    {
                //        if (obj.Quantity > mapping.Quantity)
                //        {
                //            msg.Error = true;
                //            msg.Title = "Vị trí không còn đủ sản phẩm để xuất";
                //            return Json(msg);
                //        }
                //        else
                //        {
                //            mapping.Quantity -= obj.Quantity;
                //            _context.ProductLocatedMappings.Update(mapping);
                //            mapId = mapping.Id;
                //        }
                //    }
                //    var detail = new ProductExportDetail
                //    {
                //        TicketCode = obj.TicketCode,
                //        LotProductCode = obj.LotProductCode,
                //        ProductQrCode = obj.ProductQrCode,
                //        ProductCode = obj.ProductCode,
                //        Quantity = obj.Quantity,
                //        Unit = obj.Unit,
                //        SalePrice = obj.SalePrice,
                //        Currency = obj.Currency,
                //        CreatedBy = obj.UserName,
                //        CreatedTime = DateTime.Now,
                //        IsCustomized = prodInStock.IsCustomized,
                //        ProdCustomJson = prodInStock.ProdCustomJson,
                //        MapId = mapId,
                //        //IsInside = false,
                //        //ExportDetailGroup = obj.ExportDetailGroup
                //    };
                //    _context.ProductExportDetails.Add(detail);

                //    if (mapId != -1)
                //    {
                //        var stockPopEntry = new StockArrangePopEntry
                //        {
                //            MapId = obj.MapId,
                //            ProdCode = obj.ProductQrCode,
                //            Quantity = obj.Quantity,
                //            UnitExp = obj.Unit
                //        };
                //        _context.StockArrangePopEntrys.Add(stockPopEntry);

                //        SeparatePack(obj.JsonPack, obj.MaxQuantity, obj.Quantity, obj.Unit, obj.ProductCode,
                //            obj.ProductQrCode, obj.WHS_Code, obj.LotProductCode, obj.SrcUnit, mapId);
                //    }
                //    msg.Object = new List<object>();
                //    //if (prodInStock.Quantity == 0)
                //    //{
                //    //    CleanUpStock(obj.ProductQrCode, obj.WHS_Code, obj.ProductCode, obj.UserName);
                //    //}
                //}

                //_context.SaveChanges();
                msg.Title = "Thêm thành công";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra";
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateProductDeliveryDetailMulti([FromBody] List<ExportDetail> listObj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                //foreach (var obj in listObj)
                //{
                //    var product = _context.ProductExportDetails.FirstOrDefault(x => x.Id == obj.IdDetail);
                //    if (product != null)
                //    {
                //        var prodInStock = _context.ProductInStockNews.FirstOrDefault(x => x.Id == obj.IdProductInStock);
                //        if (prodInStock == null)
                //        {
                //            msg.Error = true;
                //            msg.Title = "Sản phẩm không tồn tại trong kho";
                //            return Json(msg);
                //        }
                //        var addQuantity = obj.Quantity - product.Quantity;
                //        prodInStock.Quantity -= addQuantity;
                //        _context.ProductInStockNews.Update(prodInStock);
                //        var mapId = -1;
                //        var mapping = _context.ProductLocatedMappings.FirstOrDefault(x => x.Id == obj.MapId);
                //        if (mapping != null)
                //        {
                //            if (addQuantity > mapping.Quantity)
                //            {
                //                msg.Error = true;
                //                msg.Title = "Vị trí không còn đủ sản phẩm để xuất";
                //                return Json(msg);
                //            }
                //            else
                //            {
                //                mapping.Quantity -= addQuantity;
                //                _context.ProductLocatedMappings.Update(mapping);
                //                mapId = mapping.Id;
                //            }
                //        }

                //        product.Quantity = obj.Quantity;
                //        _context.ProductExportDetails.Update(product);
                //        msg.Object = new List<object>();
                //        //if (prodInStock.Quantity == 0)
                //        //{
                //        //    CleanUpStock(obj.ProductQrCode, obj.WHS_Code, obj.ProductCode, obj.UserName);
                //        //}
                //    }
                //    else
                //    {
                //        msg.Error = true;
                //        msg.Title = "Cập nhật sản phẩm thất bại!";
                //        return Json(msg);
                //    }
                //}

                //_context.SaveChanges();
                msg.Title = "Cập nhật thành công";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra";
            }
            return Json(msg);
        }

        [HttpPost]
        public object UpdateProductDeliveryDetail([FromBody] ExportDetail obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                //var product = _context.ProductExportDetails.FirstOrDefault(x => x.Id == obj.IdDetail);
                //if (product != null)
                //{
                //    var prodInStock = _context.ProductInStockNews.FirstOrDefault(x => x.Id == obj.IdProductInStock);
                //    if (prodInStock == null)
                //    {
                //        msg.Error = true;
                //        msg.Title = "Sản phẩm không tồn tại trong kho";
                //        return Json(msg);
                //    }
                //    var addQuantity = obj.Quantity - product.Quantity;
                //    prodInStock.Quantity -= addQuantity;
                //    _context.ProductInStockNews.Update(prodInStock);
                //    var mapId = -1;
                //    var mapping = _context.ProductLocatedMappings.FirstOrDefault(x => x.Id == obj.MapId);
                //    if (mapping != null)
                //    {
                //        if (addQuantity > mapping.Quantity)
                //        {
                //            msg.Error = true;
                //            msg.Title = "Vị trí không còn đủ sản phẩm để xuất";
                //            return Json(msg);
                //        }
                //        else
                //        {
                //            mapping.Quantity -= addQuantity;
                //            _context.ProductLocatedMappings.Update(mapping);
                //            mapId = mapping.Id;
                //        }
                //    }

                //    product.Quantity = obj.Quantity;
                //    _context.ProductExportDetails.Update(product);
                //    _context.SaveChanges();
                //    msg.Title = "Cập nhật sản phẩm thành công!";
                //}
                //else
                //{
                //    msg.Error = true;
                //    msg.Title = "Cập nhật sản phẩm thất bại!";
                //}
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = "Có lỗi khi cập nhật";
            }

            return Json(msg);
        }
        [NonAction]
        private string GetPositionInStore(string line, string rack)
        {
            var position = "";
            var poLine = _context.EDMSLines.FirstOrDefault(x => x.LineCode.Equals(line));
            var poRack = _context.EDMSRacks.FirstOrDefault(x => x.RackCode.Equals(rack));
            position = poLine.L_Text + ", " + poRack.RackName;
            return position;
        }

        [NonAction]
        public void CleanUpStock(string prodQrCode, string store, string productCode, string UserName)
        {
            var data = _context.MapStockProdIns.Where(x => !x.IsDeleted && x.ProdCode.Equals(prodQrCode))
                .GroupBy(x => x.Unit);
            var jsonPack = JsonPacking(prodQrCode);

            var lstSumByUnit = new List<CleanUp>();
            foreach (var item in data)
            {
                var sumByUnit = item.Sum(x => x.Quantity);
                var unitName = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(item.Key)
                    && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit))).ValueSet;
                var cleanUp = new CleanUp();
                cleanUp.SumByUnit = sumByUnit;
                cleanUp.Unit = item.Key;
                cleanUp.UnitName = unitName;
                if (unitName.ToLower().Equals(jsonPack.A.Key.ToLower()))
                {
                    cleanUp.PriorityUnit = 0;
                }

                if (unitName.ToLower().Equals(jsonPack.B.Key.ToLower()))
                {
                    cleanUp.PriorityUnit = 1;
                }

                if (unitName.ToLower().Equals(jsonPack.C.Key.ToLower()))
                {
                    cleanUp.PriorityUnit = 2;
                }

                if (unitName.ToLower().Equals(jsonPack.D.Key.ToLower()))
                {
                    cleanUp.PriorityUnit = 3;
                }

                lstSumByUnit.Add(cleanUp);
            }

            var lstProdSorting = lstSumByUnit.OrderByDescending(x => x.PriorityUnit);
            var remainA = 0;
            var remainB = 0;
            var remainC = 0;
            var remainD = 0;
            foreach (var item in lstProdSorting)
            {
                if (item.UnitName.ToLower().Equals(jsonPack.D.Key.ToLower()))
                {
                    remainD += Convert.ToInt32(item.SumByUnit.Value) % Convert.ToInt32(jsonPack.D.Value);
                    remainC += Convert.ToInt32(item.SumByUnit.Value) / Convert.ToInt32(jsonPack.D.Value);
                }

                if (item.UnitName.ToLower().Equals(jsonPack.C.Key.ToLower()))
                {
                    remainC += Convert.ToInt32(item.SumByUnit.Value) % Convert.ToInt32(jsonPack.C.Value);
                    remainB += Convert.ToInt32(item.SumByUnit.Value) / Convert.ToInt32(jsonPack.C.Value);
                }

                if (item.UnitName.ToLower().Equals(jsonPack.B.Key.ToLower()))
                {
                    remainB += Convert.ToInt32(item.SumByUnit.Value) % Convert.ToInt32(jsonPack.B.Value);
                    remainA += Convert.ToInt32(item.SumByUnit.Value) / Convert.ToInt32(jsonPack.B.Value);
                }

                if (item.UnitName.ToLower().Equals(jsonPack.A.Key.ToLower()))
                {
                    remainA += Convert.ToInt32(item.SumByUnit.Value);
                }
            }

            if (!string.IsNullOrEmpty(jsonPack.D.Value))
            {
                var D = remainD % Convert.ToInt32(jsonPack.D.Value);

                if (D > 0)
                {
                    var stockInventory = new ProductInStock
                    {
                        ProductQrCode = prodQrCode,
                        Unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted &&
                                                                           x.ValueSet.ToLower()
                                                                               .Equals(jsonPack.D.Key.ToLower())
                                                                           && x.Group.Equals(
                                                                               EnumHelper<PublishEnum>.GetDisplayValue(
                                                                                   PublishEnum.Unit))).CodeSet,
                        ProductCode = productCode,
                        Quantity = D,
                        StoreCode = store,
                        CreatedBy = UserName,
                        CreatedTime = DateTime.Now
                    };
                    _context.ProductInStocks.Add(stockInventory);
                }

                remainC = remainD / Convert.ToInt32(jsonPack.D.Value);
            }

            if (!string.IsNullOrEmpty(jsonPack.C.Value))
            {
                var C = remainC % Convert.ToInt32(jsonPack.C.Value);
                if (C > 0)
                {
                    var stockInventory = new ProductInStock
                    {
                        ProductQrCode = prodQrCode,
                        Unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted &&
                                                                           x.ValueSet.ToLower()
                                                                               .Equals(jsonPack.C.Key.ToLower())
                                                                           && x.Group.Equals(
                                                                               EnumHelper<PublishEnum>.GetDisplayValue(
                                                                                   PublishEnum.Unit))).CodeSet,
                        ProductCode = productCode,
                        Quantity = C,
                        StoreCode = store,
                        CreatedBy = UserName,
                        CreatedTime = DateTime.Now
                    };
                    _context.ProductInStocks.Add(stockInventory);
                }

                remainB += remainC / Convert.ToInt32(jsonPack.C.Value);
            }

            if (!string.IsNullOrEmpty(jsonPack.B.Value))
            {
                var B = remainB % Convert.ToInt32(jsonPack.B.Value);
                if (B > 0)
                {
                    var stockInventory = new ProductInStock
                    {
                        ProductQrCode = prodQrCode,
                        Unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted &&
                                                                           x.ValueSet.ToLower()
                                                                               .Equals(jsonPack.B.Key.ToLower())
                                                                           && x.Group.Equals(
                                                                               EnumHelper<PublishEnum>.GetDisplayValue(
                                                                                   PublishEnum.Unit))).CodeSet,
                        ProductCode = productCode,
                        Quantity = B,
                        StoreCode = store,
                        CreatedBy = UserName,
                        CreatedTime = DateTime.Now
                    };
                    _context.ProductInStocks.Add(stockInventory);
                }

                remainA += remainB / Convert.ToInt32(jsonPack.B.Value);
            }

            var A = remainA;
            if (A > 0)
            {
                var stockInventory = new ProductInStock
                {
                    ProductQrCode = prodQrCode,
                    Unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted &&
                                                                       x.ValueSet.ToLower()
                                                                           .Equals(jsonPack.A.Key.ToLower())
                                                                       && x.Group.Equals(
                                                                           EnumHelper<PublishEnum>.GetDisplayValue(
                                                                               PublishEnum.Unit))).CodeSet,
                    ProductCode = productCode,
                    Quantity = A,
                    StoreCode = store,
                    CreatedBy = UserName,
                    CreatedTime = DateTime.Now
                };
                _context.ProductInStocks.Add(stockInventory);
            }

            var products = _context.ProductInStocks.Where(x => !x.IsDeleted && x.ProductQrCode.Equals(prodQrCode));
            _context.ProductInStocks.RemoveRange(products);
            _context.SaveChanges();
        }

        [NonAction]
        private JsonPackValue JsonPacking(string prodQrCode)
        {
            var json = new JsonPackValue();
            var data = _context.ProductImportDetails.FirstOrDefault(x =>
                x.ProductQrCode.Equals(prodQrCode) && !x.IsDeleted);
            if (data != null)
            {
                var pack = data.PackType;
                if (!string.IsNullOrEmpty(pack))
                {
                    var arr = pack.Split("x", StringSplitOptions.None);
                    for (var i = 0; i < arr.Length; i++)
                    {
                        arr[i] = arr[i].Trim();
                    }

                    if (!string.IsNullOrEmpty(arr[0].Split(' ')[0]))
                    {
                        json.A.Key = arr[0].Split(' ')[0];
                    }

                    if (arr.Length >= 2)
                        if (!string.IsNullOrEmpty(arr[1].Split(' ')[1]))
                        {
                            json.B.Key = arr[1].Split(' ')[1];
                            json.B.Value = arr[1].Split(' ')[0];
                        }

                    if (arr.Length >= 3)
                        if (!string.IsNullOrEmpty(arr[2].Split(' ')[1]))
                        {
                            json.C.Key = arr[2].Split(' ')[1];
                            json.C.Value = arr[2].Split(' ')[0];
                        }

                    if (arr.Length >= 4)
                        if (!string.IsNullOrEmpty(arr[3].Split(' ')[1]))
                        {
                            json.D.Key = arr[3].Split(' ')[1];
                            json.D.Value = arr[3].Split(' ')[0];
                        }
                }
            }

            return json;
        }


        [HttpPost]
        public JsonResult GetListDetailDelivery(string ticketCode)
        {
            var msg = new JMessage();
            try
            {
                var listProdStatus = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "PROD_STAT").OrderBy(x => x.ValueSet)
                    .Select(x => new { Code = x.CodeSet, Name = x.ValueSet }).ToList();
                var data = (from a in _context.ProductExportDetails.Where(x => !x.IsDeleted && x.TicketCode.Equals(ticketCode))
                            join b in _context.MaterialProducts.Where(x => !x.IsDeleted) on a.ProductCode equals b.ProductCode
                            join c in _context.ProductLocatedMappings.Where(x => !x.IsDeleted) on a.MapId equals c.Id into c1
                            from c in c1.DefaultIfEmpty()
                                //join d in _context.EDMSLines on c.LineCode equals d.LineCode
                                //join e in _context.EDMSRacks on c.RackCode equals e.RackCode
                                //join f in _context.EDMSFloors on c.FloorCode equals f.FloorCode
                            join d in _context.PAreaMappingsStore.Where(x => !x.IsDeleted) on c.MappingCode equals d.ObjectCode
                            into d1
                            from d in d1.DefaultIfEmpty()
                            join e in _context.PAreaCategoriesStore.Where(x => x.IsDeleted == false)
                                on new { d.CategoryCode, d.ObjectType } equals new
                                { CategoryCode = e.Code, ObjectType = e.PAreaType }
                            into e1
                            from e in e1.DefaultIfEmpty()
                            select new ProductExpDetail
                            {
                                Id = a.Id,
                                ProductName = b.ProductName,
                                ProductCode = b.ProductCode,
                                Quantity = a.Quantity,
                                Unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(a.Unit)).ValueSet,
                                SalePrice = a.SalePrice,
                                Status = a.Status,
                                UnitMoney = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(a.Currency)).ValueSet,
                                Position = d != null ? d.ObjectCode : "Đã thay đổi",
                                IsCustomized = a.IsCustomized,
                                ProdCustomJson = a.ProdCustomJson,
                                IdProduct = b.Id,
                                Serial = b.Serial,
                                PackCode = a.PackCode,
                                PackLot = a.PackLot
                            }).ToList().OrderByDescending(x => x.Id);
                foreach (var item in data)
                {
                    if (!string.IsNullOrEmpty(item.Status))
                    {
                        var listItemStatus = (from a in item.Status.Split(",")
                                              join b in listProdStatus on a.Trim() equals b.Code
                                              select b.Name);
                        item.ProductStatus = string.Join(", ", listItemStatus);
                    }
                    else
                    {
                        item.ProductStatus = "";
                    }
                }
                msg.Object = data;
            }
            catch (Exception ex)
            {

            }

            return Json(msg);
        }


        [HttpPost]
        public JsonResult GetListDetailDeliveryNew(ProductDetailModel obj)
        {
            var msg = new JMessage();
            try
            {
                int intBeginFor = (obj.CurrentPageView - 1) * obj.Length;
                var fromDate = !string.IsNullOrEmpty(obj.FromDate)
                  ? DateTime.ParseExact(obj.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture)
                  : (DateTime?)null;
                var toDate = !string.IsNullOrEmpty(obj.ToDate)
                    ? DateTime.ParseExact(obj.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture)
                    : (DateTime?)null;
                var listProdStatus = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "PROD_STAT").OrderBy(x => x.ValueSet)
                    .Select(x => new { Code = x.CodeSet, Name = x.ValueSet }).ToList();
                var query = (from a in _context.ProductExportDetails.Where(x => !x.IsDeleted)
                             join h in _context.ProductExportHeaders.Where(x => !x.IsDeleted) on a.TicketCode equals h.TicketCode
                             join b in _context.MaterialProducts.Where(x => !x.IsDeleted) on a.ProductCode equals b.ProductCode
                             join c in _context.ProductLocatedMappings.Where(x => !x.IsDeleted) on a.MapId equals c.Id
                             join d in _context.PAreaMappingsStore.Where(x => !x.IsDeleted) on c.MappingCode equals d.ObjectCode
                             into d1
                             from d in d1.DefaultIfEmpty()
                             join e in _context.PAreaCategoriesStore.Where(x => x.IsDeleted == false)
                                 on new { d.CategoryCode, d.ObjectType } equals new
                                 { CategoryCode = e.Code, ObjectType = e.PAreaType }
                             into e1
                             from e in e1.DefaultIfEmpty()
                             where (string.IsNullOrEmpty(obj.ProductCode) || (a.ProductCode == obj.ProductCode))
                                 && (string.IsNullOrEmpty(obj.Supplier) || (h.CusCode == obj.Supplier))
                                 && (string.IsNullOrEmpty(obj.ReasonName) || (h.Reason == obj.ReasonName))
                                 && (string.IsNullOrEmpty(obj.UserImport) || (a.CreatedBy == obj.UserImport))
                                 && (string.IsNullOrEmpty(obj.FromDate) || (h.TimeTicketCreate >= fromDate))
                                 && (string.IsNullOrEmpty(obj.ToDate) || (h.TimeTicketCreate <= toDate))
                             select new ProductExpDetail
                             {
                                 Id = a.Id,
                                 ProductName = b.ProductName,
                                 ProductCode = b.ProductCode,
                                 Quantity = a.Quantity,
                                 Unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(a.Unit)).ValueSet,
                                 SalePrice = a.SalePrice,
                                 Status = a.Status,
                                 UnitMoney = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(a.Currency)).ValueSet,
                                 Position = d != null ? d.ObjectCode : "Đã thay đổi",
                                 IsCustomized = a.IsCustomized,
                                 ProdCustomJson = a.ProdCustomJson,
                                 IdProduct = b.Id
                             });
                query = query.Skip(intBeginFor).Take(obj.Length).AsNoTracking();

                var data = query.ToList();
                foreach (var item in data)
                {
                    if (!string.IsNullOrEmpty(item.Status))
                    {
                        var listItemStatus = (from a in item.Status.Split(",")
                                              join b in listProdStatus on a.Trim() equals b.Code
                                              select b.Name);
                        item.ProductStatus = string.Join(", ", listItemStatus);
                    }
                    else
                    {
                        item.ProductStatus = "";
                    }
                }
                msg.Object = data;
            }
            catch (Exception ex)
            {

            }

            return Json(msg);
        }

        [HttpPost]
        public object GetDetailDeliveryWithId(int id)
        {
            var data = (from b in _context.ProductExportDetails.Where(x => x.Id == id && x.IsDeleted == false)
                        join a in _context.ProductLocatedMappings.Where(x => x.IsDeleted == false) on b.ProductQrCode equals a.ProductQrCode into a1
                        from a in a1.DefaultIfEmpty()
                        join d in _context.ProductInStocks.Where(x => !x.IsDeleted) on a.ProductQrCode equals d.ProductQrCode
                        //join b in _context.EDMSRacks on a.RackCode equals b.RackCode into b1
                        //from b in b1.DefaultIfEmpty()
                        join c in _context.PAreaMappingsStore.Where(x => !x.IsDeleted) on a.MappingCode equals c.ObjectCode into c1
                        from c in c1.DefaultIfEmpty()
                        join e in _context.PAreaCategoriesStore.Where(x => x.IsDeleted == false)
                            on new { c.CategoryCode, c.ObjectType } equals new
                            { CategoryCode = e.Code, ObjectType = e.PAreaType } into e1
                        from e in e1.DefaultIfEmpty()
                        select new
                        {
                            b.Id,
                            IdMapping = a != null ? a.Id : -1,
                            b.ProductQrCode,
                            b.ProductCode,
                            Quantity = a != null ? b.Quantity + a.Quantity : b.Quantity,
                            QuantityInput = b.Quantity,
                            b.Unit,
                            Name = e != null ? e.PAreaDescription : "",
                            MappingCode = c != null ? c.ObjectCode : "",
                            IdProductInStock = d.Id,
                            Title = a != null && e != null ? a.ProductQrCode + " " + e.PAreaDescription : ""
                        }).ToList().Where(x => x.Quantity > 0);
            return data;
        }

        [HttpPost]
        public object GetListDetailInSession(string exportDetailGroup)
        {
            //var data = (from b in _context.ProductExportDetails.Where(x => x.ExportDetailGroup == exportDetailGroup && x.IsDeleted == false)
            //            join a in _context.ProductLocatedMappings.Where(x => x.IsDeleted == false) on b.ProductQrCode equals a.ProductQrCode into a1
            //            from a in a1.DefaultIfEmpty()
            //                //join b in _context.EDMSRacks on a.RackCode equals b.RackCode into b1
            //                //from b in b1.DefaultIfEmpty()
            //            join c in _context.PAreaMappingsStore.Where(x => !x.IsDeleted) on a.MappingCode equals c.ObjectCode into c1
            //            from c in c1.DefaultIfEmpty()
            //            join e in _context.PAreaCategoriesStore.Where(x => x.IsDeleted == false)
            //                on new { c.CategoryCode, c.ObjectType } equals new
            //                { CategoryCode = e.Code, ObjectType = e.PAreaType } into e1
            //            from e in e1.DefaultIfEmpty()
            //            select new
            //            {
            //                b.Id,
            //                IdMapping = a != null ? a.Id : -1,
            //                b.ProductQrCode,
            //                Quantity = a != null ? b.Quantity + a.Quantity : b.Quantity,
            //                QuantityInput = b.Quantity,
            //                b.Unit,
            //                Name = e != null ? e.PAreaDescription : "",
            //                MappingCode = c != null ? c.ObjectCode : "",
            //                Title = a != null && e != null ? a.ProductQrCode + " " + e.PAreaDescription : ""
            //            }).ToList().Where(x => x.Quantity > 0);
            return null;
        }


        [NonAction]
        public void SeparatePack(string pack, decimal maxQuantity, decimal quantityExp, string unit,
            string prodCode, string prodQrCode, string storeCode, string lotCode, string srcUnit, int mapId)
        {
            int remainQuantity = 0;
            int remainA = 0;
            int remainB = 0;
            int remainC = 0;
            int remainD = 0;

            var unitName = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(unit)
                && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit))).ValueSet;
            try
            {
                var stockProd = _context.MapStockProdIns.FirstOrDefault(x =>
                    x.ProdCode.Equals(prodQrCode) && x.Unit.Equals(srcUnit) && x.MapId == mapId && !x.IsDeleted);
                var unitNameStock = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted &&
                    x.CodeSet.Equals(stockProd.Unit)
                    && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit))).ValueSet;

                var data = JsonConvert.DeserializeObject<JsonPackValue>(pack);
                if (data != null)
                {
                    if (unitName.ToLower().Equals(data.A.Key.ToLower()))
                    {
                        remainA = Convert.ToInt32(maxQuantity - quantityExp);
                        if (remainA == 0)
                        {
                            stockProd.IsDeleted = true;
                            _context.MapStockProdIns.Update(stockProd);
                        }
                        else
                        {
                            stockProd.IsDeleted = true;
                            _context.MapStockProdIns.Update(stockProd);

                            //Save parent id for rollback
                            var storeInventoryObj = new MapStockProdIn
                            {
                                MapId = mapId,
                                ProdCode = prodQrCode,
                                Quantity = remainA,
                                Unit = stockProd.Unit,
                                ParentId = stockProd.ID
                            };
                            _context.MapStockProdIns.Add(storeInventoryObj);
                        }
                    }

                    if (unitName.ToLower().Equals(data.B.Key.ToLower()))
                    {
                        //Calculate quantity by unit export
                        if (unitNameStock.ToLower().Equals(data.A.Key.ToLower())) //Unit in store is A
                        {
                            remainQuantity = Convert.ToInt32(maxQuantity) * Convert.ToInt32(data.B.Value) -
                                             Convert.ToInt32(quantityExp);

                            remainB = remainQuantity % (Convert.ToInt32(data.B.Value));
                            remainA = remainQuantity / (Convert.ToInt32(data.B.Value));

                            if (remainA == 0)
                            {
                                stockProd.IsDeleted = true;
                                _context.MapStockProdIns.Update(stockProd);
                            }
                            else
                            {
                                stockProd.IsDeleted = true;
                                _context.MapStockProdIns.Update(stockProd);

                                var storeInventoryObj = new MapStockProdIn
                                {
                                    MapId = mapId,
                                    ProdCode = prodQrCode,
                                    Quantity = remainA,
                                    Unit = stockProd.Unit,
                                    ParentId = stockProd.ID
                                };
                                _context.MapStockProdIns.Add(storeInventoryObj);
                            }

                            if (remainB > 0)
                            {
                                var storeInventoryObj = new MapStockProdIn
                                {
                                    MapId = mapId,
                                    ProdCode = prodQrCode,
                                    Quantity = remainB,
                                    Unit = unit,
                                    ParentId = stockProd.ID
                                };
                                _context.MapStockProdIns.Add(storeInventoryObj);
                            }
                        }
                        else
                        {
                            remainQuantity = Convert.ToInt32(maxQuantity - quantityExp);
                            remainB = remainQuantity % (Convert.ToInt32(data.B.Value));
                            remainA = remainQuantity / (Convert.ToInt32(data.B.Value));
                            if (remainB == 0)
                            {
                                stockProd.IsDeleted = true;
                                _context.MapStockProdIns.Update(stockProd);
                            }
                            else
                            {
                                stockProd.IsDeleted = true;
                                _context.MapStockProdIns.Update(stockProd);

                                var storeInventoryObj = new MapStockProdIn
                                {
                                    MapId = mapId,
                                    ProdCode = prodQrCode,
                                    Quantity = remainB,
                                    Unit = stockProd.Unit,
                                    ParentId = stockProd.ID
                                };
                                _context.MapStockProdIns.Add(storeInventoryObj);

                            }

                            if (remainA > 0)
                            {
                                var storeInventoryObj = new MapStockProdIn
                                {
                                    MapId = mapId,
                                    ProdCode = prodQrCode,
                                    Quantity = remainA,
                                    Unit = unit,
                                    ParentId = stockProd.ID
                                };
                                _context.MapStockProdIns.Add(storeInventoryObj);
                            }
                        }
                    }

                    if (unitName.ToLower().Equals(data.C.Key.ToLower()))
                    {
                        if (unitNameStock.ToLower().Equals(data.A.Key.ToLower())) //Unit in store is A
                        {
                            remainQuantity =
                                (Convert.ToInt32(maxQuantity) * Convert.ToInt32(data.B.Value) *
                                 Convert.ToInt32(data.C.Value)) - Convert.ToInt32(quantityExp);

                            remainC = remainQuantity % (Convert.ToInt32(data.C.Value));
                            if (remainC > 0)
                            {
                                var storeInventoryObj = new MapStockProdIn
                                {
                                    MapId = mapId,
                                    ProdCode = prodQrCode,
                                    Quantity = remainC,
                                    Unit = unit,
                                    ParentId = stockProd.ID
                                };
                                _context.MapStockProdIns.Add(storeInventoryObj);
                            }

                            remainB = remainQuantity / (Convert.ToInt32(data.C.Value));

                            remainA = remainB / (Convert.ToInt32(data.B.Value));
                            if (remainA > 0)
                            {
                                stockProd.IsDeleted = true;
                                _context.MapStockProdIns.Update(stockProd);

                                var storeInventoryObj = new MapStockProdIn
                                {
                                    MapId = mapId,
                                    ProdCode = prodQrCode,
                                    Quantity = remainA,
                                    Unit = stockProd.Unit,
                                    ParentId = stockProd.ID
                                };
                                _context.MapStockProdIns.Add(storeInventoryObj);

                            }
                            else
                            {
                                stockProd.IsDeleted = true;
                                _context.MapStockProdIns.Update(stockProd);
                            }

                            remainB = remainB % (Convert.ToInt32(data.B.Value));
                            if (remainB > 0)
                            {
                                var storeInventoryObj = new MapStockProdIn
                                {
                                    MapId = mapId,
                                    ProdCode = prodQrCode,
                                    Quantity = remainB,
                                    Unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted &&
                                            x.ValueSet.ToLower().Equals(data.B.Key.ToLower())
                                            && x.Group.Equals(
                                                EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)))
                                        .CodeSet,
                                    ParentId = stockProd.ID
                                };
                                _context.MapStockProdIns.Add(storeInventoryObj);
                            }
                        }
                        else if (unitNameStock.ToLower().Equals(data.B.Key.ToLower())) //Unit in store is B
                        {
                            remainQuantity = (Convert.ToInt32(maxQuantity) * Convert.ToInt32(data.C.Value)) -
                                             Convert.ToInt32(quantityExp);
                            remainC = remainQuantity % (Convert.ToInt32(data.C.Value));
                            if (remainC > 0)
                            {
                                var storeInventoryObj = new MapStockProdIn
                                {
                                    MapId = mapId,
                                    ProdCode = prodQrCode,
                                    Quantity = remainC,
                                    Unit = unit,
                                    ParentId = stockProd.ID
                                };
                                _context.MapStockProdIns.Add(storeInventoryObj);
                            }

                            remainB = remainQuantity / (Convert.ToInt32(data.C.Value));

                            remainA = remainB / (Convert.ToInt32(data.B.Value));
                            if (remainA > 0)
                            {
                                var storeInventoryObj = new MapStockProdIn
                                {
                                    MapId = mapId,
                                    ProdCode = prodQrCode,
                                    Quantity = remainA,
                                    Unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted &&
                                            x.ValueSet.ToLower().Equals(data.A.Key.ToLower())
                                            && x.Group.Equals(
                                                EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)))
                                        .CodeSet,
                                    ParentId = stockProd.ID
                                };
                                _context.MapStockProdIns.Add(storeInventoryObj);
                            }

                            remainB = remainB % (Convert.ToInt32(data.B.Value));
                            if (remainB == 0)
                            {
                                stockProd.IsDeleted = true;
                                _context.MapStockProdIns.Update(stockProd);
                            }
                            else
                            {
                                stockProd.IsDeleted = true;
                                _context.MapStockProdIns.Update(stockProd);

                                var storeInventoryObj = new MapStockProdIn
                                {
                                    MapId = mapId,
                                    ProdCode = prodQrCode,
                                    Quantity = remainB,
                                    Unit = stockProd.Unit,
                                    ParentId = stockProd.ID
                                };
                                _context.MapStockProdIns.Add(storeInventoryObj);
                            }
                        }
                        else //Unit in store is C
                        {
                            remainQuantity = Convert.ToInt32(maxQuantity - quantityExp);
                            remainC = remainQuantity % Convert.ToInt32(data.C.Value);
                            if (remainC == 0)
                            {
                                stockProd.IsDeleted = true;
                                _context.MapStockProdIns.Update(stockProd);
                            }
                            else
                            {
                                stockProd.IsDeleted = true;
                                _context.MapStockProdIns.Update(stockProd);
                                var storeInventoryObj = new MapStockProdIn
                                {
                                    MapId = mapId,
                                    ProdCode = prodQrCode,
                                    Quantity = remainC,
                                    Unit = unit,
                                    ParentId = stockProd.ID
                                };
                                _context.MapStockProdIns.Add(storeInventoryObj);
                            }

                            remainB = remainQuantity / (Convert.ToInt32(data.C.Value));

                            remainA = remainB / (Convert.ToInt32(data.B.Value));
                            if (remainA > 0)
                            {
                                var storeInventoryObj = new MapStockProdIn
                                {
                                    MapId = mapId,
                                    ProdCode = prodQrCode,
                                    Quantity = remainA,
                                    Unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted &&
                                            x.ValueSet.ToLower().Equals(data.A.Key.ToLower())
                                            && x.Group.Equals(
                                                EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)))
                                        .CodeSet,
                                    ParentId = stockProd.ID
                                };
                                _context.MapStockProdIns.Add(storeInventoryObj);
                            }

                            remainB = remainB % (Convert.ToInt32(data.B.Value));
                            if (remainB > 0)
                            {
                                var storeInventoryObj = new MapStockProdIn
                                {
                                    MapId = mapId,
                                    ProdCode = prodQrCode,
                                    Quantity = remainB,
                                    Unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted &&
                                            x.ValueSet.ToLower().Equals(data.B.Key.ToLower())
                                            && x.Group.Equals(
                                                EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)))
                                        .CodeSet,
                                    ParentId = stockProd.ID
                                };
                                _context.MapStockProdIns.Add(storeInventoryObj);
                            }
                        }
                    }

                    if (unitName.ToLower().Equals(data.D.Key.ToLower()))
                    {
                        if (unitNameStock.ToLower().Equals(data.A.Key.ToLower())) //Unit in store is A
                        {
                            remainQuantity =
                                (Convert.ToInt32(maxQuantity) * Convert.ToInt32(data.B.Value) *
                                 Convert.ToInt32(data.C.Value) * Convert.ToInt32(data.D.Value)) -
                                Convert.ToInt32(quantityExp);
                            remainD = remainQuantity % (Convert.ToInt32(data.D.Value));
                            if (remainD > 0)
                            {
                                var storeInventoryObj = new MapStockProdIn
                                {
                                    MapId = mapId,
                                    ProdCode = prodQrCode,
                                    Quantity = remainD,
                                    Unit = unit,
                                    ParentId = stockProd.ID
                                };
                                _context.MapStockProdIns.Add(storeInventoryObj);
                            }

                            remainC = remainQuantity / (Convert.ToInt32(data.D.Value));
                            remainB = remainC / (Convert.ToInt32(data.C.Value));
                            remainA = remainB / (Convert.ToInt32(data.B.Value));

                            if (remainA == 0)
                            {
                                stockProd.IsDeleted = true;
                                _context.MapStockProdIns.Update(stockProd);
                            }
                            else
                            {
                                stockProd.IsDeleted = true;
                                _context.MapStockProdIns.Update(stockProd);

                                var storeInventoryObj = new MapStockProdIn
                                {
                                    MapId = mapId,
                                    ProdCode = prodQrCode,
                                    Quantity = remainA,
                                    Unit = srcUnit,
                                    ParentId = stockProd.ID
                                };
                                _context.MapStockProdIns.Add(storeInventoryObj);
                            }

                            remainB = remainC % (Convert.ToInt32(data.C.Value));
                            if (remainB > 0)
                            {
                                var storeInventoryObj = new MapStockProdIn
                                {
                                    MapId = mapId,
                                    ProdCode = prodQrCode,
                                    Quantity = remainB,
                                    Unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted &&
                                            x.ValueSet.ToLower().Equals(data.B.Key.ToLower())
                                            && x.Group.Equals(
                                                EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)))
                                        .CodeSet,
                                    ParentId = stockProd.ID
                                };
                                _context.MapStockProdIns.Add(storeInventoryObj);
                            }

                            remainC = remainQuantity % (Convert.ToInt32(data.D.Value));
                            if (remainC > 0)
                            {
                                var storeInventoryObj = new MapStockProdIn
                                {
                                    MapId = mapId,
                                    ProdCode = prodQrCode,
                                    Quantity = remainC,
                                    Unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted &&
                                            x.ValueSet.ToLower().Equals(data.C.Key.ToLower())
                                            && x.Group.Equals(
                                                EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)))
                                        .CodeSet,
                                    ParentId = stockProd.ID
                                };
                                _context.MapStockProdIns.Add(storeInventoryObj);
                            }
                        }
                        else if (unitNameStock.ToLower().Equals(data.B.Key.ToLower())) //Unit in store is B
                        {
                            remainQuantity =
                                (Convert.ToInt32(maxQuantity) * Convert.ToInt32(data.C.Value) *
                                 Convert.ToInt32(data.D.Value)) - Convert.ToInt32(quantityExp);
                            remainD = remainQuantity % (Convert.ToInt32(data.D.Value));
                            if (remainD > 0)
                            {
                                var storeInventoryObj = new MapStockProdIn
                                {
                                    MapId = mapId,
                                    ProdCode = prodQrCode,
                                    Quantity = remainD,
                                    Unit = unit,
                                    ParentId = stockProd.ID
                                };
                                _context.MapStockProdIns.Add(storeInventoryObj);
                            }

                            remainC = remainQuantity / (Convert.ToInt32(data.D.Value));
                            remainB = remainC / (Convert.ToInt32(data.C.Value));
                            remainA = remainB / (Convert.ToInt32(data.B.Value));
                            if (remainA > 0)
                            {
                                var storeInventoryObj = new MapStockProdIn
                                {
                                    MapId = mapId,
                                    ProdCode = prodQrCode,
                                    Quantity = remainA,
                                    Unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted &&
                                            x.ValueSet.ToLower().Equals(data.A.Key.ToLower())
                                            && x.Group.Equals(
                                                EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)))
                                        .CodeSet,
                                    ParentId = stockProd.ID
                                };
                                _context.MapStockProdIns.Add(storeInventoryObj);
                            }

                            remainB = remainC % (Convert.ToInt32(data.C.Value));
                            if (remainB == 0)
                            {
                                stockProd.IsDeleted = true;
                                _context.MapStockProdIns.Update(stockProd);
                            }
                            else
                            {
                                stockProd.IsDeleted = true;
                                _context.MapStockProdIns.Update(stockProd);
                                var storeInventoryObj = new MapStockProdIn
                                {
                                    MapId = mapId,
                                    ProdCode = prodQrCode,
                                    Quantity = remainB,
                                    Unit = srcUnit,
                                    ParentId = stockProd.ID
                                };
                                _context.MapStockProdIns.Add(storeInventoryObj);
                            }

                            remainC = remainQuantity % (Convert.ToInt32(data.D.Value));
                            if (remainC > 0)
                            {
                                var storeInventoryObj = new MapStockProdIn
                                {
                                    MapId = mapId,
                                    ProdCode = prodQrCode,
                                    Quantity = remainC,
                                    Unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted &&
                                            x.ValueSet.ToLower().Equals(data.C.Key.ToLower())
                                            && x.Group.Equals(
                                                EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)))
                                        .CodeSet,
                                    ParentId = stockProd.ID
                                };
                                _context.MapStockProdIns.Add(storeInventoryObj);
                            }
                        }
                        else if (unitNameStock.ToLower().Equals(data.C.Key.ToLower())) // Unit in store is C
                        {
                            remainQuantity = (Convert.ToInt32(maxQuantity) * Convert.ToInt32(data.D.Value)) -
                                             Convert.ToInt32(quantityExp);

                            remainD = remainQuantity % (Convert.ToInt32(data.D.Value));
                            if (remainD > 0)
                            {
                                var storeInventoryObj = new MapStockProdIn
                                {
                                    MapId = mapId,
                                    ProdCode = prodQrCode,
                                    Quantity = remainD,
                                    Unit = unit,
                                    ParentId = stockProd.ID
                                };
                                _context.MapStockProdIns.Add(storeInventoryObj);
                            }

                            remainC = remainQuantity / (Convert.ToInt32(data.D.Value));
                            remainB = remainC / (Convert.ToInt32(data.C.Value));
                            remainA = remainB / (Convert.ToInt32(data.B.Value));
                            if (remainA > 0)
                            {
                                var storeInventoryObj = new MapStockProdIn
                                {
                                    MapId = mapId,
                                    ProdCode = prodQrCode,
                                    Quantity = remainA,
                                    Unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted &&
                                            x.ValueSet.ToLower().Equals(data.A.Key.ToLower())
                                            && x.Group.Equals(
                                                EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)))
                                        .CodeSet,
                                    ParentId = stockProd.ID
                                };
                                _context.MapStockProdIns.Add(storeInventoryObj);
                            }

                            remainB = remainC % (Convert.ToInt32(data.C.Value));
                            if (remainB > 0)
                            {
                                var storeInventoryObj = new MapStockProdIn
                                {
                                    MapId = mapId,
                                    ProdCode = prodQrCode,
                                    Quantity = remainB,
                                    Unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted &&
                                            x.ValueSet.ToLower().Equals(data.B.Key.ToLower())
                                            && x.Group.Equals(
                                                EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)))
                                        .CodeSet,
                                    ParentId = stockProd.ID
                                };
                                _context.MapStockProdIns.Add(storeInventoryObj);
                            }

                            remainC = remainQuantity % (Convert.ToInt32(data.D.Value));
                            if (remainC == 0)
                            {
                                stockProd.IsDeleted = true;
                                _context.MapStockProdIns.Update(stockProd);
                            }
                            else
                            {
                                stockProd.IsDeleted = true;
                                _context.MapStockProdIns.Update(stockProd);

                                var storeInventoryObj = new MapStockProdIn
                                {
                                    MapId = mapId,
                                    ProdCode = prodQrCode,
                                    Quantity = remainC,
                                    Unit = srcUnit,
                                    ParentId = stockProd.ID
                                };
                                _context.MapStockProdIns.Add(storeInventoryObj);
                            }
                        }
                        else // Unit in store is D
                        {
                            remainQuantity = Convert.ToInt32(maxQuantity - quantityExp);

                            remainD = remainQuantity % (Convert.ToInt32(data.D.Value));
                            if (remainD == 0)
                            {
                                stockProd.IsDeleted = true;
                                _context.MapStockProdIns.Update(stockProd);
                            }
                            else
                            {
                                stockProd.IsDeleted = true;
                                _context.MapStockProdIns.Update(stockProd);

                                var storeInventoryObj = new MapStockProdIn
                                {
                                    MapId = mapId,
                                    ProdCode = prodQrCode,
                                    Quantity = remainD,
                                    Unit = unit,
                                    ParentId = stockProd.ID
                                };
                                _context.MapStockProdIns.Add(storeInventoryObj);
                            }

                            remainC = remainQuantity / (Convert.ToInt32(data.D.Value));
                            remainB = remainC / (Convert.ToInt32(data.C.Value));
                            remainA = remainB / (Convert.ToInt32(data.B.Value));
                            if (remainA > 0)
                            {
                                var storeInventoryObj = new MapStockProdIn
                                {
                                    MapId = mapId,
                                    ProdCode = prodQrCode,
                                    Quantity = remainA,
                                    Unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted &&
                                            x.ValueSet.ToLower().Equals(data.A.Key.ToLower())
                                            && x.Group.Equals(
                                                EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)))
                                        .CodeSet,
                                    ParentId = stockProd.ID
                                };
                                _context.MapStockProdIns.Add(storeInventoryObj);
                            }

                            remainB = remainC % (Convert.ToInt32(data.C.Value));
                            if (remainB > 0)
                            {
                                var storeInventoryObj = new MapStockProdIn
                                {
                                    MapId = mapId,
                                    ProdCode = prodQrCode,
                                    Quantity = remainB,
                                    Unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted &&
                                            x.ValueSet.ToLower().Equals(data.B.Key.ToLower())
                                            && x.Group.Equals(
                                                EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)))
                                        .CodeSet,
                                    ParentId = stockProd.ID
                                };
                                _context.MapStockProdIns.Add(storeInventoryObj);
                            }

                            remainC = remainQuantity % (Convert.ToInt32(data.D.Value));
                            if (remainC > 0)
                            {
                                var storeInventoryObj = new MapStockProdIn
                                {
                                    MapId = mapId,
                                    ProdCode = prodQrCode,
                                    Quantity = remainC,
                                    Unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted &&
                                            x.ValueSet.ToLower().Equals(data.C.Key.ToLower())
                                            && x.Group.Equals(
                                                EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)))
                                        .CodeSet,
                                    ParentId = stockProd.ID
                                };
                                _context.MapStockProdIns.Add(storeInventoryObj);
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {

            }
        }

        [HttpPost]
        public void CleanUpMapStock(int mappId, string prodQrCode, string store, string lot, string productCode)
        {
            //Clean ProductInStockNew
            var prodInStock = _context.ProductInStocks.Where(x => !x.IsDeleted && x.ProductQrCode.Equals(prodQrCode));
            _context.RemoveRange(prodInStock);

            var data = _context.MapStockProdIns
                .Where(x => !x.IsDeleted && x.MapId == mappId && x.ProdCode.Equals(prodQrCode)).GroupBy(x => x.Unit);
            var jsonPack = JsonPacking(prodQrCode);

            var lstSumByUnit = new List<CleanUp>();
            foreach (var item in data)
            {
                var sumByUnit = item.Sum(x => x.Quantity);
                var unitName = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(item.Key)
                    && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit))).ValueSet;
                var cleanUp = new CleanUp();
                cleanUp.SumByUnit = sumByUnit;
                cleanUp.Unit = item.Key;
                cleanUp.UnitName = unitName;
                if (unitName.ToLower().Equals(jsonPack.A.Key.ToLower()))
                {
                    cleanUp.PriorityUnit = 0;
                }

                if (unitName.ToLower().Equals(jsonPack.B.Key.ToLower()))
                {
                    cleanUp.PriorityUnit = 1;
                }

                if (unitName.ToLower().Equals(jsonPack.C.Key.ToLower()))
                {
                    cleanUp.PriorityUnit = 2;
                }

                if (unitName.ToLower().Equals(jsonPack.D.Key.ToLower()))
                {
                    cleanUp.PriorityUnit = 3;
                }

                lstSumByUnit.Add(cleanUp);
            }

            var lstProdSorting = lstSumByUnit.OrderByDescending(x => x.PriorityUnit);
            var remainA = 0;
            var remainB = 0;
            var remainC = 0;
            var remainD = 0;
            foreach (var item in lstProdSorting)
            {
                if (item.UnitName.ToLower().Equals(jsonPack.D.Key.ToLower()))
                {
                    remainD += Convert.ToInt32(item.SumByUnit.Value) % Convert.ToInt32(jsonPack.D.Value);
                    remainC += Convert.ToInt32(item.SumByUnit.Value) / Convert.ToInt32(jsonPack.D.Value);
                }

                if (item.UnitName.ToLower().Equals(jsonPack.C.Key.ToLower()))
                {
                    remainC += Convert.ToInt32(item.SumByUnit.Value) % Convert.ToInt32(jsonPack.C.Value);
                    remainB += Convert.ToInt32(item.SumByUnit.Value) / Convert.ToInt32(jsonPack.C.Value);
                }

                if (item.UnitName.ToLower().Equals(jsonPack.B.Key.ToLower()))
                {
                    remainB += Convert.ToInt32(item.SumByUnit.Value) % Convert.ToInt32(jsonPack.B.Value);
                    remainA += Convert.ToInt32(item.SumByUnit.Value) / Convert.ToInt32(jsonPack.B.Value);
                }

                if (item.UnitName.ToLower().Equals(jsonPack.A.Key.ToLower()))
                {
                    remainA += Convert.ToInt32(item.SumByUnit.Value);
                }
            }

            if (!string.IsNullOrEmpty(jsonPack.D.Value))
            {
                var D = remainD % Convert.ToInt32(jsonPack.D.Value);

                if (D > 0)
                {
                    var mapStock = new MapStockProdIn
                    {
                        MapId = mappId,
                        ProdCode = prodQrCode,
                        Unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted &&
                                                                           x.ValueSet.ToLower()
                                                                               .Equals(jsonPack.D.Key.ToLower())
                                                                           && x.Group.Equals(
                                                                               EnumHelper<PublishEnum>.GetDisplayValue(
                                                                                   PublishEnum.Unit))).CodeSet,
                        Quantity = D
                    };
                    _context.MapStockProdIns.Add(mapStock);
                }

                remainC = remainD / Convert.ToInt32(jsonPack.D.Value);
            }

            if (!string.IsNullOrEmpty(jsonPack.C.Value))
            {
                var C = remainC % Convert.ToInt32(jsonPack.C.Value);
                if (C > 0)
                {
                    var mapStock = new MapStockProdIn
                    {
                        MapId = mappId,
                        ProdCode = prodQrCode,
                        Unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted &&
                                                                           x.ValueSet.ToLower()
                                                                               .Equals(jsonPack.C.Key.ToLower())
                                                                           && x.Group.Equals(
                                                                               EnumHelper<PublishEnum>.GetDisplayValue(
                                                                                   PublishEnum.Unit))).CodeSet,
                        Quantity = C
                    };
                    _context.MapStockProdIns.Add(mapStock);
                }

                remainB += remainC / Convert.ToInt32(jsonPack.C.Value);
            }

            if (!string.IsNullOrEmpty(jsonPack.B.Value))
            {
                var B = remainB % Convert.ToInt32(jsonPack.B.Value);
                if (B > 0)
                {
                    var mapStock = new MapStockProdIn
                    {
                        MapId = mappId,
                        ProdCode = prodQrCode,
                        Unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted &&
                                                                           x.ValueSet.ToLower()
                                                                               .Equals(jsonPack.B.Key.ToLower())
                                                                           && x.Group.Equals(
                                                                               EnumHelper<PublishEnum>.GetDisplayValue(
                                                                                   PublishEnum.Unit))).CodeSet,
                        Quantity = B
                    };
                    _context.MapStockProdIns.Add(mapStock);
                }

                remainA += remainB / Convert.ToInt32(jsonPack.B.Value);
            }

            var A = remainA;
            if (A > 0)
            {
                var mapStock = new MapStockProdIn
                {
                    MapId = mappId,
                    ProdCode = prodQrCode,
                    Unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted &&
                                                                       x.ValueSet.ToLower()
                                                                           .Equals(jsonPack.A.Key.ToLower())
                                                                       && x.Group.Equals(
                                                                           EnumHelper<PublishEnum>.GetDisplayValue(
                                                                               PublishEnum.Unit))).CodeSet,
                    Quantity = A
                };
                _context.MapStockProdIns.Add(mapStock);
            }

            var mapping =
                _context.MapStockProdIns.Where(x => !x.IsDeleted && x.MapId == mappId && x.ProdCode.Equals(prodQrCode));
            _context.MapStockProdIns.RemoveRange(mapping);
            _context.SaveChanges();
        }

        [HttpPost]
        public async Task<JMessage> DelDeliveryDetail(int id, string userName)
        {
            var msg = new JMessage();
            try
            {
                var data = _context.ProductExportDetails.FirstOrDefault(x => x.Id == id && !x.IsDeleted);

                if (data != null)
                {
                    var ticket = _context.ProductExportHeaders.FirstOrDefault(x => !x.IsDeleted && x.TicketCode == data.TicketCode);
                    if (ticket?.TicketStatus == "INITIAL_DONE")
                    {
                        msg.Error = true;
                        msg.Title = "Phiếu xuất đã xử lý xong không được xóa chi tiết";
                        return msg;
                    }
                    var mapping = _context.ProductLocatedMappings.FirstOrDefault(x => x.Id == data.MapId);
                    var idImpProduct = mapping?.IdImpProduct;
                    var inStock = _context.ProductInStocks.FirstOrDefault(x => x.IdImpProduct == idImpProduct);
                    if (mapping == null || inStock == null)
                    {
                        msg.Error = true;
                        msg.Title = "Không tìm thấy bản ghi tồn kho để trả ngược sản phẩm";
                        return msg;
                    }
                    mapping.Quantity = (mapping.Quantity ?? 0) + data.Quantity;
                    mapping.Weight = (mapping.Weight ?? 0) + (data.Weight ?? 0);
                    inStock.Quantity = inStock.Quantity + inStock.Quantity;
                    inStock.Weight = (inStock.Weight ?? 0) + (inStock.Weight ?? 0);
                    mapping.IsDeleted = false;
                    inStock.IsDeleted = false;
                    mapping.DeletionToken = "NA";
                    inStock.DeletionToken = "NA";

                    data.IsDeleted = true;
                    data.DeletedBy = userName;
                    data.DeletedTime = DateTime.Now;
                    _context.ProductExportDetails.Update(data);
                    await _context.SaveChangesAsync();

                    //CleanUpMapStock(data.MapId, data.ProductQrCode, store,
                    //    !string.IsNullOrEmpty(data.LotProductCode) ? data.LotProductCode : "", data.ProductCode);
                    //CleanUpStock(data.ProductQrCode, store, data.ProductCode, userName);
                    msg.Title = "Xóa thành công!";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra";
            }

            return msg;
        }

        [HttpPost]
        public JsonResult DelDeliveryDetailMulti(string exportDetailGroup, string userName)
        {
            var msg = new JMessage();
            try
            {
                //var listData = _context.ProductExportDetails.Where(x => x.ExportDetailGroup == exportDetailGroup && !x.IsDeleted).ToList();

                //if (listData.Count > 0)
                //{
                //    foreach (var data in listData)
                //    {
                //        var mapping = _context.ProductLocatedMappings.FirstOrDefault(x => !x.IsDeleted && x.Id == data.MapId);
                //        if (mapping != null)
                //        {
                //            mapping.Quantity += data.Quantity;
                //            _context.ProductLocatedMappings.Update(mapping);
                //            var prodInStock = _context.ProductInStockNews.FirstOrDefault(x => x.ProductQrCode == mapping.ProductQrCode);
                //            if (prodInStock != null)
                //            {
                //                prodInStock.Quantity += data.Quantity;
                //                _context.ProductInStockNews.Update(prodInStock);
                //            }
                //        }

                //        data.IsDeleted = true;
                //        data.DeletedBy = userName;
                //        data.DeletedTime = DateTime.Now;
                //        _context.ProductExportDetails.Update(data);
                //    }

                //    //CleanUpMapStock(data.MapId, data.ProductQrCode, store,
                //    //    !string.IsNullOrEmpty(data.LotProductCode) ? data.LotProductCode : "", data.ProductCode);
                //    //CleanUpStock(data.ProductQrCode, store, data.ProductCode, userName);
                //}
                //_context.SaveChanges();
                msg.Title = "Xóa thành công!";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra";
            }

            return Json(msg);
        }

        [HttpPost]
        public object GetProductUnit()
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                msg.Object = _context.CommonSettings
                    .Where(x => x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit))
                    .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi lấy dữ liệu!";
                msg.Object = ex.Message;
            }

            return Json(msg);
        }
        #endregion

        #region Xếp lại sản phẩm

        [HttpPost]
        public JsonResult GetFreeStorage(JTableFreeStorageModel model)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                int intBeginFor = (model.CurrentPage - 1) * model.Length;
                //var query = from a in _context.ProductLocatedMappings.Where(x => x.IsDeleted == false)
                //            join b in _context.EDMSWareHouses.Where(x => x.WHS_Flag != true && x.Type == "PR") on a.WHS_Code
                //                equals b.WHS_Code into b2
                //            from b in b2.DefaultIfEmpty()
                //            join c in _context.EDMSFloors on a.FloorCode equals c.FloorCode into c2
                //            from c in c2.DefaultIfEmpty()
                //            join d in _context.EDMSLines on a.LineCode equals d.LineCode into d2
                //            from d in d2.DefaultIfEmpty()
                //            join e in _context.EDMSRacks on a.RackCode equals e.RackCode into e2
                //            from e in e2.DefaultIfEmpty()
                //            select new FreeStorageRes
                //            {
                //                Id = a.Id,
                //                ProductQrCode = a.ProductQrCode,
                //                WHS_Name = (b != null ? b.WHS_Name : ""),
                //                FloorName = (c != null ? c.FloorName : ""),
                //                L_Text = (d != null ? d.L_Text : ""),
                //                RackName = (e != null ? e.RackName : ""),
                //                RackPosition = a.RackPosition,
                //                Position = (c != null ? c.FloorName : "") + "_" + (d != null ? d.L_Text : "") + "_" +
                //                           (e != null ? e.RackName : ""),
                //                //CreatedBy = (f!=null?f.GivenName:""),
                //                //CreatedTime = a.CreatedTime
                //            };

                var query = (from e in _context.ProductLocatedMappings.Where(x => !x.IsDeleted)
                             join a in _context.ProductImportDetails.Where(x => !x.IsDeleted) on e.ProductQrCode equals a.ProductQrCode into a1
                             from a in a1.DefaultIfEmpty()
                             join c in _context.ProductImportHeaders.Where(x => !x.IsDeleted) on a.TicketCode equals c.TicketCode into c1
                             from c in c1.DefaultIfEmpty()
                             join b in _context.MaterialProducts.Where(x => !x.IsDeleted) on e.ProductCode equals b.ProductCode
                             join d in _context.Users.Where(x => x.Active) on e.CreatedBy equals d.UserName into d1
                             from d in d1.DefaultIfEmpty()
                             join f in _context.EDMSWareHouses.Where(x => !x.WHS_Flag) on e.WHS_Code equals f.WHS_Code
                             //join g in _context.PAreaMappingsStore.Where(x => !x.IsDeleted && x.ObjectType == "AREA") on e.WHS_Code equals g.ObjectCode
                             //join f in _context.PAreaCategoriesStore.Where(x => x.IsDeleted == false && x.PAreaType == "AREA") on g.CategoryCode equals f.Code
                             join h in _context.PAreaMappingsStore.Where(x => !x.IsDeleted) on e.MappingCode equals h.ObjectCode
                             join i in _context.PAreaCategoriesStore.Where(x => x.IsDeleted == false)
                                 on new { h.CategoryCode, h.ObjectType } equals new
                                 { CategoryCode = i.Code, ObjectType = i.PAreaType }
                                 //where (string.IsNullOrEmpty(obj.TicketCode) || a.TicketCode.Equals(obj.TicketCode))
                                 //&& (string.IsNullOrEmpty(obj.UserImport) || e.CreatedBy.Equals(obj.UserImport))
                                 //&& (fromDate == null || e.CreatedTime >= fromDate)
                                 //&& (toDate == null || e.CreatedTime <= toDate)
                             select new
                             {
                                 MapId = e.Id,
                                 Id = a != null ? a.Id : -1,
                                 TicketCode = a != null ? a.TicketCode : "",
                                 TicketName = c != null ? c.Title : "",
                                 UserImport = d != null ? d.GivenName : "",
                                 TimeTicketCreate = e.CreatedTime,
                                 ProductName = b.ProductName,
                                 ProductCode = b.ProductCode,
                                 Quantity = a != null ? a.Quantity : 0,
                                 QuantityIsSet = a != null ? a.QuantityIsSet : 0,
                                 QuantityMap = e.Quantity,
                                 Unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == e.Unit).ValueSet,
                                 SalePrice = a != null ? a.SalePrice : 0,
                                 Currency = a != null ? _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.Currency).ValueSet : "",
                                 QrCode = a != null ? CommonUtil.GeneratorQRCode(e.ProductCode) : null,
                                 ProductQRCode = e.ProductQrCode,
                                 Remain = a != null ? a.Quantity - a.QuantityIsSet : 0,
                                 PackType = !string.IsNullOrEmpty(a.PackType) ? a.PackType : "",
                                 sProductQrCode = CommonUtil.GenerateQRCode("SP:" + e.ProductQrCode + "_P:" + e.TicketCode + "_SL:" + e.Quantity),
                                 UnitCode = e.Unit,
                                 StoreName = f.WHS_Name,
                                 IdTicket = c != null ? c.Id : -1,
                                 StoreCode = e.WHS_Code,
                                 Position = h.ObjectCode,
                                 //OldPosition = e.ListLogs != null && e.ListLogs.Any() ? e.ListLogs.FirstOrDefault().OldMappingCode : ""
                             });
                var count = query.Count();
                var data = query.OrderByDescending(x => x.Id).AsNoTracking().Skip(intBeginFor).Take(model.Length)
                    .ToList();
                //foreach (var item in data)
                //{
                //    item.PositionOld = getOldPos(item.Id);
                //}

                msg.Object = new { count, data };
            }
            catch (Exception ex)
            {
                throw;
            }

            return Json(msg);
        }
        [HttpPost]
        public object GetListMapping(string start)
        {
            try
            {
                var rs = (from a in _context.PAreaMappingsStore
                        .Where(x => x.IsDeleted == false /*&& x.ObjectCode.StartsWith(start)*/)
                          join b in _context.PAreaCategoriesStore.Where(x => x.IsDeleted == false)
                              on new { a.CategoryCode, a.ObjectType } equals new
                              { CategoryCode = b.Code, ObjectType = b.PAreaType }
                          select new MappingInfo
                          {
                              Code = b.PAreaCode,
                              Name = b.PAreaDescription,
                              Type = a.ObjectType,
                              Id = b.Id,
                              Mapping = a.ObjectCode,
                          }).ToList();
                string[] map = new[] { "AREA", "FLOOR", "LINE", "RACK", "POSITION" };
                var orderedList = from a in rs
                                  join b in map.Select((x, i) => new { Index = i, Value = x }) on a.Type equals b.Value
                                  orderby b.Index
                                  select a;
                return Json(orderedList);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        [HttpPost]
        public object GetListMappingFilter(string start)
        {
            try
            {
                var rs = (from a in _context.PAreaMappingsStore
                        .Where(x => x.IsDeleted == false && x.ObjectCode.StartsWith(start))
                          join b in _context.PAreaCategoriesStore.Where(x => x.IsDeleted == false)
                              on new { a.CategoryCode, a.ObjectType } equals new
                              { CategoryCode = b.Code, ObjectType = b.PAreaType }
                          select new MappingInfo
                          {
                              Code = b.PAreaCode,
                              Name = b.PAreaDescription,
                              Type = a.ObjectType,
                              Id = b.Id,
                              Mapping = a.ObjectCode,
                          }).ToList();
                string[] map = new[] { "AREA", "FLOOR", "LINE", "RACK", "POSITION" };
                var orderedList = from a in rs
                                  join b in map.Select((x, i) => new { Index = i, Value = x }) on a.Type equals b.Value
                                  orderby b.Index
                                  select a;
                return Json(orderedList);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        [HttpPost]
        public object GetItemStorage(int id)
        {
            var obj = (from e in _context.ProductLocatedMappings.Where(x => !x.IsDeleted && x.Id == id)
                       join a in _context.ProductImportDetails.Where(x => !x.IsDeleted) on e.ProductQrCode equals a.ProductQrCode into a1
                       from a in a1.DefaultIfEmpty()
                       join c in _context.ProductImportHeaders.Where(x => !x.IsDeleted) on a.TicketCode equals c.TicketCode into c1
                       from c in c1.DefaultIfEmpty()
                       join b in _context.MaterialProducts.Where(x => !x.IsDeleted) on e.ProductCode equals b.ProductCode
                       join d in _context.Users.Where(x => x.Active) on e.CreatedBy equals d.UserName into d1
                       from d in d1.DefaultIfEmpty()
                       join f in _context.EDMSWareHouses.Where(x => !x.WHS_Flag) on e.WHS_Code equals f.WHS_Code
                       //join g in _context.PAreaMappingsStore.Where(x => !x.IsDeleted && x.ObjectType == "AREA") on e.WHS_Code equals g.ObjectCode
                       //join f in _context.PAreaCategoriesStore.Where(x => x.IsDeleted == false && x.PAreaType == "AREA") on g.CategoryCode equals f.Code
                       join h in _context.PAreaMappingsStore.Where(x => !x.IsDeleted) on e.MappingCode equals h.ObjectCode
                       join i in _context.PAreaCategoriesStore.Where(x => x.IsDeleted == false)
                           on new { h.CategoryCode, h.ObjectType } equals new
                           { CategoryCode = i.Code, ObjectType = i.PAreaType }
                           //where (string.IsNullOrEmpty(obj.TicketCode) || a.TicketCode.Equals(obj.TicketCode))
                           //&& (string.IsNullOrEmpty(obj.UserImport) || e.CreatedBy.Equals(obj.UserImport))
                           //&& (fromDate == null || e.CreatedTime >= fromDate)
                           //&& (toDate == null || e.CreatedTime <= toDate)
                       select new
                       {
                           MapId = e.Id,
                           Id = a != null ? a.Id : -1,
                           TicketCode = a != null ? a.TicketCode : "",
                           TicketName = c != null ? c.Title : "",
                           UserImport = d != null ? d.GivenName : "",
                           TimeTicketCreate = e.CreatedTime,
                           ProductName = b.ProductName,
                           ProductCode = b.ProductCode,
                           Quantity = a != null ? a.Quantity : 0,
                           QuantityIsSet = a != null ? a.QuantityIsSet : 0,
                           QuantityMap = e.Quantity,
                           Unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == e.Unit).ValueSet,
                           SalePrice = a != null ? a.SalePrice : 0,
                           Currency = a != null ? _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.Currency).ValueSet : "",
                           QrCode = a != null ? CommonUtil.GeneratorQRCode(e.ProductCode) : null,
                           ProductQRCode = e.ProductQrCode,
                           Remain = a != null ? a.Quantity - a.QuantityIsSet : 0,
                           PackType = !string.IsNullOrEmpty(a.PackType) ? a.PackType : "",
                           sProductQrCode = CommonUtil.GenerateQRCode("SP:" + e.ProductQrCode + "_P:" + e.TicketCode + "_SL:" + e.Quantity),
                           UnitCode = e.Unit,
                           StoreName = f.WHS_Name,
                           IdTicket = c != null ? c.Id : -1,
                           StoreCode = e.WHS_Code,
                           Position = h.ObjectCode,
                           //OldPosition = e.ListLogs != null && e.ListLogs.Any() ? e.ListLogs.FirstOrDefault().OldMappingCode : ""
                       }).FirstOrDefault();
            return obj;
        }

        [HttpPost]
        public async Task<object> MoveProductVatco([FromBody] ProductCrudMapping data)
        {
            var msg = new JMessage();
            try
            {
                var prodDetail = _context.ProductImportDetails.Include(x => x.Product).ThenInclude(x => x.Group)
                    .AsNoTracking().FirstOrDefault(x => !x.IsDeleted && x.Id.Equals(data.IdImpProduct));
                if (prodDetail?.Product?.Group?.GroupType == "STATIC_TANK")
                {
                    return await OrderProductStaticTank(data);
                }
                var maxId = _context.ProductLocatedMappings.MaxBy(x => x.Id) != null ? _context.ProductLocatedMappings.MaxBy(x => x.Id).Id : 1;
                var listProdStrNo = new List<ProdStrNo>();
                var oldMapping = _context.ProductLocatedMappings.FirstOrDefault(x => !x.IsDeleted && x.Id == data.Id);
                //var rack = _context.EDMSRacks.FirstOrDefault(x => x.RackCode == data.RackCode);
                //var productInRackCount = getProductInRack(data.RackCode);
                decimal quantity = 0;
                //if (oldMapping.WHS_Code != data.WHS_Code)
                //{
                //    msg.Error = true;
                //    msg.Title = "Không thể xếp sp vào vị trí này!";
                //    return Json(msg);
                //}
                if (oldMapping != null)
                {
                    if (!string.IsNullOrEmpty(data.ProductNo))
                    {
                        try
                        {
                            listProdStrNo = ListProdStrNoHelper.GetListProdStrNo(data.ProductNo);
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.Message);
                        }
                        if (listProdStrNo.Count == 0)
                        {
                            msg.Error = true;
                            msg.Title = "Thứ tự không hợp lệ!";
                            return Json(msg);
                        }
                        if (!oldMapping.ListProdStrNo.ContainsRange(listProdStrNo))
                        {
                            msg.Error = true;
                            msg.Title = "Thứ tự không hợp lệ";
                            return Json(msg);
                        }
                        quantity = listProdStrNo.SumQuantity();
                    }
                    else
                    {
                        if (!data.Quantity.HasValue || data.Quantity > (oldMapping.Quantity ?? 0))
                        {
                            msg.Error = true;
                            msg.Title = "Số lượng nhập vào không hợp lệ!";
                            return Json(msg);
                        }
                        listProdStrNo = oldMapping.ListProdStrNo.ExtractQuantity((int)data.Quantity.Value);
                        quantity = data.Quantity.Value;
                    }
                    if (data.MappingCode == oldMapping.MappingCode)
                    {
                        msg.Error = true;
                        msg.Title = "Vị trí không thay đổi";
                        return Json(msg);
                    }
                    var newId = -1;

                    if (quantity < oldMapping.Quantity)
                    {
                        oldMapping.ListProdStrNo.Extract(listProdStrNo);
                        oldMapping.Quantity -= quantity;
                        _context.ProductLocatedMappings.Update(oldMapping);

                        //Thêm vào bảng Product_Entity_Mapping
                        var checkLocated = _context.ProductLocatedMappings.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == oldMapping.ProductCode
                            && x.IdImpProduct == oldMapping.IdImpProduct && x.GattrCode == oldMapping.GattrCode && x.MappingCode == data.MappingCode);
                        if (checkLocated == null)
                        {
                            var mapping = new ProductLocatedMapping
                            {
                                IdImpProduct = oldMapping.IdImpProduct,
                                MappingCode = data.MappingCode,
                                WHS_Code = oldMapping.WHS_Code,
                                ProductCode = oldMapping.ProductCode,
                                ProductType = oldMapping.ProductType,
                                ProductQrCode = oldMapping.ProductQrCode,
                                Quantity = quantity,
                                ListProdStrNo = listProdStrNo,
                                //ListProductNo = listProductNo,
                                Unit = oldMapping.Unit,
                                CreatedBy = data.CreatedBy,
                                CreatedTime = DateTime.Now,
                                IsDeleted = false,
                                //MarkWholeProduct = mark.Any() ? true : false,
                                GattrCode = oldMapping.GattrCode,
                                DeletionToken = "NA"
                            };

                            _context.ProductLocatedMappings.Add(mapping);
                            await _context.SaveChangesAsync();
                            newId = mapping.Id;
                        }
                        else
                        {
                            checkLocated.ListProdStrNo.AddRange(listProdStrNo);
                            checkLocated.Quantity = checkLocated.ListProdStrNo.SumQuantity();
                            _context.ProductLocatedMappings.Update(checkLocated);
                            newId = checkLocated.Id;
                        }
                    }
                    else
                    {
                        oldMapping.MappingCode = data.MappingCode;
                        _context.ProductLocatedMappings.Update(oldMapping);
                    }

                    var mappingLog = new ProductLocatedMappingLog
                    {
                        IdImpProduct = oldMapping.IdImpProduct,
                        IdLocMapOld = oldMapping.Id,
                        IdLocatedMapping = newId,
                        MappingCode = data.MappingCode,
                        MappingCodeOld = oldMapping.MappingCode,
                        StoreCode = oldMapping.WHS_Code,
                        GattrCode = oldMapping.GattrCode,
                        ProductCode = oldMapping.ProductCode,
                        ProductNo = data.ProductNo,
                        ProductQrCode = oldMapping.ProductQrCode,
                        Quantity = quantity,
                        Unit = oldMapping.Unit,
                        TicketCode = "",
                        Type = "REARRANGE",
                        CreatedBy = data.CreatedBy,
                        CreatedTime = DateTime.Now,
                        IsDeleted = false,
                        //MarkWholeProduct = mark.Any() ? true : false,
                        DeletionToken = "NA"
                    };

                    _context.ProductLocatedMappingLogs.Add(mappingLog);
                    var materialProduct = _context.MaterialProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductCode.Equals(oldMapping.ProductCode));
                    //var header = _context.ProductImportHeaders.FirstOrDefault(x => !x.IsDeleted && x.TicketCode == obj.TicketCode);
                    var mpStatus = new MpStatus()
                    {
                        ActStatus = "ARRANGE",
                        ActTime = DateTime.Now,
                        ActBy = data.CreatedBy,
                        ProductNo = data.ProductNo,
                        MappingCode = data.MappingCode,
                        //SupCode = header?.SupCode,
                        //CusCode = header?.CusCode,
                    };
                    materialProduct.MpStatuses = materialProduct.MpStatuses != null ? materialProduct.MpStatuses : new List<MpStatus>();
                    materialProduct.MpStatuses.Add(mpStatus);
                    //var oldProdInStock = _context.ProductInStocks.Where(x => !x.IsDeleted && x.IdImpProduct == oldMapping.IdImpProduct)
                    //    .ToList().FirstOrDefault(x => x.ListProdStrNo.ContainsRange(listProdStrNo));
                    //if (oldProdInStock != null && oldProdInStock.StoreCode != data.WHS_Code)
                    //{
                    //    if (quantity < oldProdInStock.Quantity)
                    //    {
                    //        //parentInStock.ListProductNo.Remove(obj.ParentProductNumber.Value);
                    //        oldProdInStock.ListProdStrNo.Extract(listProdStrNo);
                    //        oldProdInStock.Quantity -= quantity;
                    //        _context.ProductInStocks.Update(oldProdInStock);

                    //        //Thêm vào bảng Product_Entity_Mapping
                    //        var checkInStock = _context.ProductInStocks.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == oldMapping.ProductCode
                    //            && x.IdImpProduct == oldMapping.IdImpProduct && x.GattrCode == oldMapping.GattrCode && x.StoreCode == data.WHS_Code);
                    //        if (checkInStock == null)
                    //        {
                    //            var newParentInStock = new ProductInStock
                    //            {
                    //                IdImpProduct = oldProdInStock.IdImpProduct,
                    //                LotProductCode = oldProdInStock.LotProductCode,
                    //                StoreCode = oldProdInStock.StoreCode,
                    //                ProductCode = oldProdInStock.ProductCode,
                    //                ProductType = oldProdInStock.ProductType,
                    //                ProductQrCode = oldProdInStock.ProductQrCode,
                    //                Quantity = quantity,
                    //                ListProdStrNo = listProdStrNo,
                    //                Unit = oldProdInStock.Unit,
                    //                CreatedBy = data.CreatedBy,
                    //                CreatedTime = DateTime.Now,
                    //                IsDeleted = false,
                    //                //MarkWholeProduct = mark.Any() ? true : false,
                    //                PackCode = oldProdInStock.PackCode,
                    //                GattrCode = oldProdInStock.GattrCode,
                    //                DeletionToken = "NA"
                    //            };
                    //            _context.ProductInStocks.Add(newParentInStock);
                    //        }
                    //        else
                    //        {
                    //            checkInStock.ListProdStrNo.AddRange(listProdStrNo);
                    //            checkInStock.Quantity = checkInStock.ListProdStrNo.SumQuantity();
                    //            _context.ProductInStocks.Update(checkInStock);
                    //        }
                    //    }
                    //    else
                    //    {
                    //        oldProdInStock.StoreCode = data.WHS_Code;
                    //        _context.ProductInStocks.Update(oldProdInStock);
                    //    }
                    //}

                    _context.SaveChanges();
                    msg.Title = /*_stringLocalizer["MIS_MSG_SORT_WARE_HOURE_SUCCESS"]*/"Xếp lại sản phẩm thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = /*_stringLocalizer["Sản phẩm không còn ở vị trí"]*/"Sản phẩm không còn ở vị trí";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = /*_sharedResources["COM_MSG_ERR"]*/"Có lỗi xảy ra";
            }
            return Json(msg);
        }
        [NonAction]
        public string getOldPos(int Id)
        {
            string s = "";
            var dt = _context.EDMSMoveProductLogs.OrderByDescending(x => x.Id).FirstOrDefault(x => x.MappingId == Id);
            if (dt != null)
            {
                var data = from a in _context.EDMSMoveProductLogs
                           join b in _context.EDMSFloors on a.FloorCodeOld equals b.FloorCode into b2
                           from b in b2.DefaultIfEmpty()
                           join c in _context.EDMSLines on a.LineCodeOld equals c.LineCode into c2
                           from c in c2.DefaultIfEmpty()
                           join d in _context.EDMSRacks on a.RackCodeOld equals d.RackCode into d2
                           from d in d2.DefaultIfEmpty()
                           where a.MappingId == Id
                           orderby a.Id descending
                           select new
                           {
                               Position = (b != null ? b.FloorName : "") + "_" + (c != null ? c.L_Text : "") + "_" +
                                          (d != null ? d.RackName : "")
                           };
                var list = data.ToList();
                if (list.Count > 0)
                {
                    s = list[0].Position;
                }
            }

            return s;
        }

        [HttpPost]
        public JsonResult GetListProductFreeStorage()
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = from a in _context.ProductLocatedMappings
                               //join b in _context.EDMSRacks on a.RackCode equals b.RackCode into b2
                               //from b in b2.DefaultIfEmpty()
                           where a.IsDeleted == false

                           select new
                           {
                               Code = a.Id,
                               Mapping = a.MappingCode,
                               WhsCode = a.WHS_Code,
                               Name = a.ProductQrCode /*+ " _ " + (b != null ? b.RackName : "")*/,
                           };
                msg.Object = data;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = "Có lỗi khi lấy thông tin!";

            }

            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetFloorInStoreByProductId(int Id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.ProductLocatedMappings.FirstOrDefault(x => x.Id == Id);
                if (data != null && !string.IsNullOrEmpty(data.WHS_Code))
                {
                    var listFloor = _context.EDMSFloors.Where(x => x.WHS_Code == data.WHS_Code);
                    msg.Object = listFloor;
                }
                else
                {
                    msg.Object = data;
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = "Có lỗi khi lấy thông tin!";

            }

            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetLineByFloor(string floorCode)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var listFloor = _context.EDMSLines.Where(x => x.FloorCode == floorCode);
                msg.Object = listFloor;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = "Có lỗi khi lấy thông tin!";

            }

            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetRackByLine(string lineCode)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var listFloor = _context.EDMSRacks.Where(x => x.LineCode == lineCode);
                msg.Object = listFloor;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = "Có lỗi khi lấy thông tin!";

            }

            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetQuantityEmptyInRack(string rackCode)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var rs = _context.EDMSRacks.AsParallel().FirstOrDefault(x => x.RackCode.Equals(rackCode));
                if (rs != null)
                {
                    var prodMapping =
                        _context.ProductLocatedMappings.Where(x => !x.IsDeleted && x.RackCode.Equals(rackCode));
                    var instock = Convert.ToInt32(prodMapping.Sum(x => x.Quantity));
                    var result = rs.CNT_Box - instock;
                    msg.Object = result.ToString();
                }
                else
                {
                    msg.Object = "";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = "Có lỗi khi lấy thông tin!";

            }

            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetItemFreeStorage(int Id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var query = from a in _context.ProductLocatedMappings.Where(x => x.IsDeleted == false && x.Id == Id)
                            join b in _context.EDMSWareHouses.Where(x => x.Type == "PR") on a.WHS_Code equals b.WHS_Code into b2
                            from b in b2.DefaultIfEmpty()
                            join c in _context.EDMSFloors on a.FloorCode equals c.FloorCode into c2
                            from c in c2.DefaultIfEmpty()
                            join d in _context.EDMSLines on a.LineCode equals d.LineCode into d2
                            from d in d2.DefaultIfEmpty()
                            join e in _context.EDMSRacks on a.RackCode equals e.RackCode into e2
                            from e in e2.DefaultIfEmpty()

                            select new
                            {
                                a.Id,
                                a.ProductQrCode,
                                WHS_Name = (b != null ? b.WHS_Name : ""),
                                FloorName = (c != null ? c.FloorName : ""),
                                L_Text = (d != null ? d.L_Text : ""),
                                RackName = (e != null ? e.RackName : ""),
                                a.RackPosition,
                                a.Quantity
                            };
                msg.Object = query.FirstOrDefault();
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = "Có lỗi khi lấy thông tin!";

            }

            return Json(msg);
        }

        [HttpPost]
        public JsonResult SortFreeStorage(MoveProductModel obj)
        {
            JMessage msg = new JMessage();
            try
            {
                var data = _context.ProductLocatedMappings.FirstOrDefault(x => x.Id == obj.Id);
                if (data != null)
                {
                    if (data.FloorCode == obj.Floor && data.LineCode == obj.Line && data.RackCode == obj.Rack)
                    {
                        msg.Error = true;
                        msg.Title = "HTML_FreeStorage_ERR_Location";
                    }
                    else if (obj.QuantityEmpty < obj.Quantity)
                    {
                        msg.Error = true;
                        msg.Title = "HTML_FreeStorage_RACK_FULL";
                    }
                    else
                    {
                        EDMSMoveProductLog productLog = new EDMSMoveProductLog();
                        productLog.ProductCode = data.ProductQrCode;
                        productLog.RackCodeOld = data.RackCode;
                        productLog.RackCodeNew = obj.Rack;
                        productLog.LineCodeOld = data.LineCode;
                        productLog.FloorCodeOld = data.FloorCode;
                        productLog.MappingId = data.Id;
                        productLog.CreatedBy = ESEIM.AppContext.UserName;
                        productLog.CreatedTime = DateTime.Now;
                        _context.EDMSMoveProductLogs.Add(productLog);

                        data.FloorCode = obj.Floor;
                        data.LineCode = obj.Line;
                        data.RackCode = obj.Rack;

                        data.UpdatedBy = User.Identity.Name;
                        data.UpdatedTime = DateTime.Now;
                        _context.ProductLocatedMappings.Update(data);

                        var listExp = _context.ProductImportDetails
                            .Where(x => x.ProductQrCode == data.ProductQrCode && x.IsDeleted == false).ToList();
                        foreach (var item in listExp)
                        {
                            item.RackCode = data.RackCode;
                        }

                        _context.ProductImportDetails.UpdateRange(listExp);
                        _context.SaveChanges();
                        msg.Error = false;
                        msg.Title = "Xếp lại vị trí sản phẩm thành công";
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "HTML_FreeStorage_ERR_EMTRY";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "HTML_FreeStorage_ERR";
            }

            return Json(msg);
        }

        #endregion

        #region Xuất thẻ kho
        [HttpPost]
        public object ExportExcelStockCard(JTableReportStaticsStockCardModel model)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                DateTime? fromDate = !string.IsNullOrEmpty(model.FromTo)
                    ? DateTime.ParseExact(model.FromTo, "dd/MM/yyyy", CultureInfo.InvariantCulture)
                    : (DateTime?)null;
                DateTime? toDate = !string.IsNullOrEmpty(model.DateTo)
                    ? DateTime.ParseExact(model.DateTo, "dd/MM/yyyy", CultureInfo.InvariantCulture)
                    : (DateTime?)null;
                var user = _context.Users.FirstOrDefault(x => x.UserName == model.UserName);
                var pathFile = "";
                var fileNameOutput = "";
                var queryRs = (from a in _context.VImpExpProducts
                               where (string.IsNullOrEmpty(model.Category) || a.Category.Equals(model.Category))
                                     && (string.IsNullOrEmpty(model.ContractCode) || a.PoCode.Equals(model.ContractCode) ||
                                         a.HeaderCode.Equals(model.ContractCode))
                                     && (string.IsNullOrEmpty(model.CusCode) || a.CusCode.Equals(model.CusCode))
                                     && (string.IsNullOrEmpty(model.SupCode) || a.SupCode.Equals(model.SupCode))
                                     && (string.IsNullOrEmpty(model.StoreCode) || a.StoreCode.Equals(model.StoreCode))
                                     && (string.IsNullOrEmpty(model.Type) || a.Type.Contains(model.Type))
                                     && (string.IsNullOrEmpty(model.ProductCode) || a.ProductCode.Equals(model.ProductCode))
                                     && (string.IsNullOrEmpty(model.ProductType) || a.ProductType.Equals(model.ProductType))
                                     && ((fromDate == null) || (a.CreatedTime.Value.Date >= fromDate.Value.Date))
                                     && ((toDate == null) || (a.CreatedTime.Value.Date <= toDate.Value.Date))
                               select new
                               {
                                   a.Id,
                                   a.ProductCode,
                                   a.ProductName,
                                   a.ProductType,
                                   a.Cost,
                                   a.Quantity,
                                   //a.QuantityNeedImpExp,
                                   //a.CusCode,
                                   //a.CusName,
                                   //a.SupCode,
                                   //a.SupName,
                                   a.CreatedTime,
                                   //a.Category,
                                   //a.CategoryName,
                                   a.Type,
                                   a.Unit,
                                   a.UnitName,
                                   a.HeaderCode,
                                   a.HeaderName,
                                   //a.PoCode,
                                   //a.PoName,
                                   a.StoreCode,
                                   a.StoreName,
                                   a.QuantityInStore,
                                   a.TotalQuantityByStore,
                                   a.TotalQuantityInStore,
                                   //CreatedTimeSale = a.Type.Equals("SALE_EXP") ? a.CreatedTime : (DateTime?)null,
                                   //CreatedTimeBuy = a.Type.Equals("BUY_IMP") ? a.CreatedTime : (DateTime?)null
                               }).ToList();
                var pageLength = model.PageLength ?? 5;
                //var departmentName = _context.AdDepartments.FirstOrDefault(x => !x.IsDeleted && x.IsEnabled && x.DepartmentCode.Equals(user.DepartmentId))?.Title;
                var listProduct = queryRs.GroupBy(x => x.ProductCode)
                    .Select(g => new
                    {
                        ProductCode = g.Key,
                        ProductName = g.FirstOrDefault().ProductName,
                        Unit = g.FirstOrDefault().Unit,
                        CountPage = g.Count() > 0 ? ((g.Count() - 1) / pageLength + 1) : 0,
                        ListInfo = g.ToList()
                    })
                    .ToList();
                //var count = queryRs.Count();
                var total = listProduct.Count > 0 ? listProduct.Sum(x => x.CountPage) : 0;
                string fileName = string.Concat(_hostingEnvironment.WebRootPath, "/files/Template/Kho/TheKhoTemplate.xlsx");
                byte[] byteArray = System.IO.File.ReadAllBytes(fileName);
                using (MemoryStream stream = new MemoryStream())
                {
                    stream.Write(byteArray, 0, byteArray.Length);
                    using (ExcelEngine excelEngine = new ExcelEngine())
                    {
                        IApplication application = excelEngine.Excel;
                        stream.Position = 0;
                        IWorkbook workbook = application.Workbooks.Open(stream);
                        var page = 0;
                        foreach (var item in listProduct)
                        {
                            for (int i = 0; i < item.CountPage; i++)
                            {
                                var intBegin = i * pageLength;
                                if (page != 0)
                                {
                                    workbook.Worksheets.AddCopy(workbook.Worksheets[0]);
                                }
                                IWorksheet sheet = workbook.Worksheets[page];

                                //Replaces the given string with another string
                                sheet.Replace("{{don_vi}}", "...");
                                sheet.Replace("{{dia_chi}}", "...");
                                sheet.Replace("{{mau_so}}", "...");
                                sheet.Replace("{{date_now}}", DateTime.Now.ToString("dd/MM/yyyy"));
                                sheet.Replace("{{page}}", page);
                                sheet.Replace("{{product}}", item.ProductName ?? "");
                                sheet.Replace("{{unit}}", item.Unit ?? "");
                                sheet.Replace("{{code}}", item.ProductCode ?? "");
                                sheet.Replace("{{total}}", total);
                                sheet.Replace("{{i}}", total);

                                var listInsert = item.ListInfo.Skip(intBegin).Take(pageLength).ToList();
                                var row = 12;
                                for (int j = 0; j < listInsert.Count; j++)
                                {
                                    //sheetRequest.Range["A1"].Value2 = string.Format("{0} {1}", "TỔNG HỢP CHẤM DỨT NĂM", string.IsNullOrEmpty(listData.FirstOrDefault().Year) ? DateTime.Now.Year.ToString() : listData.FirstOrDefault().Year);
                                    sheet.Range["A" + row].Value2 = j + 1;
                                    var createdTime = listInsert[j].CreatedTime.HasValue ?
                                        listInsert[j].CreatedTime.Value.ToString("dd/MM/yyyy") : "";
                                    sheet.Range["B" + row].Value2 = "";
                                    sheet.Range["C" + row].Value2 = listInsert[j].Type == "BUY_IMP" ? "Nhập" : "";
                                    sheet.Range["D" + row].Value2 = listInsert[j].Type == "SALE_EXP" ? "Xuất" : "";
                                    sheet.Range["E" + row].Value2 = $"{listInsert[j].HeaderName} [ {listInsert[j].HeaderCode} ]";
                                    sheet.Range["F" + row].Value2 = createdTime;
                                    var quantity = listInsert[j].TotalQuantityByStore.HasValue ?
                                        listInsert[j].TotalQuantityByStore.Value.ToString() : "0";
                                    sheet.Range["G" + row].Value2 = listInsert[j].Type == "BUY_IMP" ? quantity : "";
                                    sheet.Range["H" + row].Value2 = listInsert[j].Type == "SALE_EXP" ? quantity : "";
                                    sheet.Range["I" + row].Value2 = listInsert[j].TotalQuantityInStore;
                                    //sheetRequest.Range["E" + row].Value2 = listData[j].Group;
                                    //sheetRequest.Range["F" + row].Value2 = listData[j].Type;
                                    //sheetRequest.Range["A" + row + ":V" + row].CellStyle.HorizontalAlignment = ExcelHAlign.HAlignCenter;
                                    //sheetRequest.Range["B" + row].CellStyle.HorizontalAlignment = ExcelHAlign.HAlignLeft;
                                    row++;
                                    //id++;
                                }
                                page++;
                            }
                        }

                        workbook.Version = ExcelVersion.Xlsx;
                        fileNameOutput =
                        $"Thẻ kho {DateTime.Now.ToString("ddMMyyy-hhmm")}.xlsx";
                        pathFile = _hostingEnvironment.WebRootPath + "\\uploads\\tempFile\\" + fileNameOutput;
                        FileStream outputStream = new FileStream(pathFile, FileMode.Create, FileAccess.ReadWrite);
                        workbook.SaveAs(outputStream);
                        outputStream.Dispose();
                    }
                }
                //loadedDocument.Close(true);
                msg.Title = "Xuất file thành công";
                msg.Object = new
                {
                    FullPath = pathFile,
                    FileName = fileNameOutput,
                    Directory = "uploads\\tempFile\\"
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                msg.Error = true;
                msg.Object = ex;
            }
            return Json(msg);
        }
        #endregion

        #region SP tại vị trí

        [HttpPost]
        public object GetObjectDetail(string objectCode)
        {
            try
            {
                var products =
                    _context.ProductLocatedMappings.Where(x => !x.IsDeleted && x.MappingCode.Equals(objectCode)).ToList();
                var obj = new
                {
                    //Zone = zone,
                    TotalProduct = products.Count,
                    TotalQuanity = products.Sum(x => x.Quantity)
                };
                return Json(obj);
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }
        [HttpPost]
        public object GetListMaterialProduct(JTableModelMaterialProducts jTablePara)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                DateTime? fromDate = !string.IsNullOrEmpty(jTablePara.FromTo)
                    ? DateTime.ParseExact(jTablePara.FromTo, "dd/MM/yyyy", CultureInfo.InvariantCulture)
                    : (DateTime?)null;
                DateTime? toDate = !string.IsNullOrEmpty(jTablePara.DateTo)
                    ? DateTime.ParseExact(jTablePara.DateTo, "dd/MM/yyyy", CultureInfo.InvariantCulture)
                    : (DateTime?)null;
                int intBeginFor = (jTablePara.CurrentPageView - 1) * jTablePara.Length;
                var listCommon = _context.CommonSettings.Select(x => new { x.CodeSet, x.ValueSet });
                // Create a StringBuilder to construct SQL condition
                var sqlStringBuilder = new StringBuilder("SELECT Id FROM MATERIAL_PRODUCT CROSS APPLY OPENJSON(JSON_STATUS) WITH (SupCode NVARCHAR(50) '$.SupCode', CusCode NVARCHAR(50) '$.CusCode') AS JsonData WHERE JSON_STATUS IS NOT NULL");

                List<object> parameters = new List<object>();

                // Check and append condition for CusCode
                if (!string.IsNullOrEmpty(jTablePara.CusCode))
                {
                    parameters.Add(jTablePara.CusCode);
                    sqlStringBuilder.Append($" AND JsonData.CusCode = {{{parameters.Count - 1}}}");
                }

                // Check and append condition for SupCode
                if (!string.IsNullOrEmpty(jTablePara.SupCode))
                {
                    parameters.Add(jTablePara.SupCode);
                    sqlStringBuilder.Append($" AND JsonData.SupCode = {{{parameters.Count - 1}}}");
                }


                // Finalize the SQL query string
                var sqlQuery = sqlStringBuilder.ToString();

                //var directQueryTest = _context.MaterialProducts
                //.FromSql("SELECT * FROM MATERIAL_PRODUCT WHERE JSON_STATUS IS NOT NULL AND JSON_STATUS LIKE '%ABCXYZ%'")
                //.ToList();

                var queryJson = _context.MaterialProducts
                                     .FromSql(sqlQuery, parameters.ToArray())
                                     .Select(mp => mp.Id);

                var query = from a in _context.MaterialProducts.AsNoTracking()
                            join b in _context.MaterialProductGroups on a.GroupCode equals b.Code into b1
                            from b in b1.DefaultIfEmpty()
                            join c in _context.MaterialTypes on a.TypeCode equals c.Code into c1
                            from c in c1.DefaultIfEmpty()
                            join d in _context.CommonSettings on a.Unit equals d.CodeSet into d2
                            from d1 in d2.DefaultIfEmpty()
                            join e in _context.ProductImportDetails.Where(x => !x.IsDeleted) on a.ProductCode equals e.ProductCode into e1
                            from e in e1.DefaultIfEmpty()
                            join f in _context.ProductLocatedMappings.Where(x => !x.IsDeleted) on a.ProductCode equals f.ProductCode into f1
                            from f in f1.DefaultIfEmpty()
                            where !a.IsDeleted
                                  && (string.IsNullOrEmpty(jTablePara.Code) ||
                                      a.ProductCode.ToLower().Contains(jTablePara.Code.ToLower()))
                                  && (string.IsNullOrEmpty(jTablePara.Name) ||
                                      a.ProductName.ToLower().Contains(jTablePara.Name.ToLower()))
                                  && ((fromDate == null) || (a.CreatedTime.Date >= fromDate))
                                  && ((toDate == null) || (a.CreatedTime.Date <= toDate))
                                  && (string.IsNullOrEmpty(jTablePara.Group) ||
                                      (a.GroupCode != null && a.GroupCode == jTablePara.Group))
                                  && (string.IsNullOrEmpty(jTablePara.Type) ||
                                      (a.TypeCode != null && a.TypeCode == jTablePara.Type))
                                  && (string.IsNullOrEmpty(jTablePara.Status) || (a.Status == jTablePara.Status))
                                  && (string.IsNullOrEmpty(jTablePara.Catalogue) || (a.ProductCode == jTablePara.Catalogue))
                                  && (string.IsNullOrEmpty(jTablePara.MappingCode) || (f != null && f.MappingCode == jTablePara.MappingCode))
                                 && ((string.IsNullOrEmpty(jTablePara.CusCode) && string.IsNullOrEmpty(jTablePara.SupCode)) ||
                                     (!string.IsNullOrEmpty(a.JsonStatus) && queryJson.Contains(a.Id)))
                            select new MaterialProductRes
                            {
                                //idd=test(),
                                id = a.Id,
                                productcode = a.ProductCode,
                                productname = a.ProductName,
                                unit = d1 != null ? d1.ValueSet : "",
                                productgroup = b != null ? b.Name : "",
                                producttype = c != null ? c.Name : "",
                                pathimg = a.Image,
                                material = a.Material,
                                pattern = a.Pattern,
                                note = a.Note,
                                sQrCode = a.QrCode,
                                sBarCode = a.Barcode,
                                Packing = a.Packing, //quy cách
                                Weight = a.Weight, //khoi luonh
                                High = a.High, // cao
                                Wide = a.Wide, //rong
                                Long = a.Long, //dai
                                unitWeight = _context.CommonSettings.FirstOrDefault(z => z.CodeSet == a.UnitWeight) != null
                                    ? _context.CommonSettings.FirstOrDefault(z => z.CodeSet == a.UnitWeight).ValueSet
                                    : "",
                                status = _context.CommonSettings.FirstOrDefault(z => z.CodeSet == a.Status) != null
                                    ? _context.CommonSettings.FirstOrDefault(z => z.CodeSet == a.Status).ValueSet
                                    : "",
                                mpStatus = a.MpStatuses != null ? a.MpStatuses.LastOrDefault() : null,
                                mappingCode = f != null ? f.MappingCode : ""
                            };
                var count = query.Count();
                var data = query.OrderByDescending(x => x.id).AsNoTracking().Skip(intBeginFor).Take(jTablePara.Length)
                    .ToList();
                //var data1 = data.Skip(intBeginFor).Take(jTablePara.Length).ToList();
                foreach (var item in data)
                {
                    //item.sQrCode = CommonUtil.GenerateQRCode(item.sQrCode);
                    item.sBarCode = CommonUtil.GenerateBarCode(item.sBarCode);
                }

                msg.Object = new { count, data };
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi lấy dữ liệu!";
                msg.Object = ex.Message;
            }

            return Json(msg);
        }
        #endregion

        #region QrCode
        [HttpPost]
        public JMessage GetQrCodeInfo(string qrCode)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var check = _context.ProductQrCodes.FirstOrDefault(x => x.QrCode == qrCode);
            if (check != null)
            {
                msg.Object = check;
                var product = _context.MaterialProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == check.ProductCode);
                msg.Code = product?.Serial;
            }
            else
            {
                msg.Error = true;
                msg.Title = "Không tìm thấy mã Qr!";
                return msg;
            }
            return msg;
        }
        [HttpPost]
        public JMessage UpdateQRCode([FromBody] ProductQrCodeUpdate data)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var check = _context.ProductQrCodes.FirstOrDefault(x => x.Id == data.Id);
            var checkProduct = _context.MaterialProducts.FirstOrDefault(x => x.ProductCode == data.ProductCode && !x.IsDeleted);
            var checkExist = _context.ProductQrCodes.FirstOrDefault(x => x.ProductCode == data.ProductCode);
            //if (checkProduct == null)
            //{
            //    msg.Error = true;
            //    msg.Title = "Không tìm thấy sản phẩm!";
            //    return msg;
            //}
            //if (checkExist != null)
            //{
            //    msg.Error = true;
            //    msg.Title = "Sản phẩm đã được gán mã!";
            //    return msg;
            //}
            if (checkProduct != null)
            {
                //check.ProductCode = data.ProductCode;
                checkProduct.Serial = data.Serial;
                msg.Title = "Cập nhật thành công";
                _context.SaveChanges();
            }
            else
            {
                msg.Error = true;
                msg.Title = "Không tìm thấy sản phẩm!";
                return msg;
            }
            return msg;
        }
        #endregion

        #region Models

        public class MaterialStoreExpModelInsert
        {
            public string LotProductCode { get; set; }
            public string TicketCode { get; set; }
            public string Title { get; set; }
            public string StoreCode { get; set; }
            public string ContractCode { get; set; }
            public string CusCode { get; set; }
            public string Reason { get; set; }
            public string StoreCodeReceipt { get; set; }
            public decimal CostTotal { get; set; }
            public string Currency { get; set; }
            public decimal Discount { get; set; }
            public decimal TaxTotal { get; set; }
            public decimal Commission { get; set; }
            public decimal TotalMustPayment { get; set; }
            public decimal TotalPayed { get; set; }
            public string PaymentStatus { get; set; }
            public string NextTimePayment { get; set; }
            public string UserExport { get; set; }
            public string Note { get; set; }
            public string UserReceipt { get; set; }
            public string InsurantTime { get; set; }
            public string TimeTicketCreate { get; set; }
            public string Status { get; set; }
            public string WorkflowCat { get; set; }
            public string ActRepeat { get; set; }
            public string UserName { get; set; }
            public string UserId { get; set; }
            public List<MaterialStoreExpModelDetailInsert> ListProduct { get; set; }
            public List<MaterialStoreExpModelDetailInsertPo> ListPoProduct { get; set; }
            public string GroupType { get; set; }
            public string SupCode { get; set; }
        }

        public class MaterialStoreExpModelDetailInsertPo : MaterialStoreExpModelDetailInsert
        {
            public List<MaterialStoreExpModelDetailInsert> ListProductInRack { get; set; }
        }

        public class MaterialStoreExpModelDetailInsert
        {
            public int? Id { get; set; }
            public string TicketCode { get; set; }
            public string ProductCoil { get; set; }
            public string ProductCode { get; set; }
            public string ProductName { get; set; }
            public string ProductType { get; set; }
            public string ProductQrCode { get; set; }
            public string sProductQrCode { get; set; }
            public string RackCode { get; set; }
            public string RackName { get; set; }
            public decimal Quantity { get; set; }
            public decimal QuantityOrder { get; set; }
            public decimal QuantityInStockTotal { get; set; }
            public decimal QuantityInStock { get; set; }
            public decimal QuantityMax { get; set; }
            public string Unit { get; set; }
            public string UnitName { get; set; }
            public decimal? SalePrice { get; set; }
            public int? TaxRate { get; set; }
            public int? Discount { get; set; }
            public int? Commission { get; set; }
            public decimal Total { get; set; }
            public decimal TaxTotal { get; set; }
            public decimal DiscountTotal { get; set; }
            public decimal CommissionTotal { get; set; }
            public int MapId { get; set; }
        }
        public class JTableModelMaterialStoreExpGoodsHeaders : JTableModel
        {
            public string Title { get; set; }
            public string CusCode { get; set; }
            public string StoreCode { get; set; }
            public string UserExport { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string Reason { get; set; }
            public int CurrentPageView { get; set; }

        }

        public class MaterialStoreExpModel
        {
            public int Id { get; set; }
            public string TicketCode { get; set; }
            public string QrTicketCode { get; set; }
            public string LotProductCode { get; set; }
            public string ContractCode { get; set; }
            public string CusCode { get; set; }
            public string CusName { get; set; }
            public string StoreCode { get; set; }
            public string StoreName { get; set; }
            public string Title { get; set; }
            public string UserExport { get; set; }
            public string UserExportName { get; set; }
            public string UserReceipt { get; set; }
            public decimal? CostTotal { get; set; }
            public string Currency { get; set; }
            public string CurrencyName { get; set; }
            public decimal? Discount { get; set; }
            public decimal? Commission { get; set; }
            public decimal? TaxTotal { get; set; }
            public string Note { get; set; }
            public string PositionGps { get; set; }
            public string PositionText { get; set; }
            public string FromDevice { get; set; }
            public decimal? TotalPayed { get; set; }
            public decimal? TotalMustPayment { get; set; }
            public DateTime? InsurantTime { get; set; }
            public DateTime? TimeTicketCreate { get; set; }
            public DateTime? NextTimePayment { get; set; }
            public string Reason { get; set; }
            public string ReasonName { get; set; }
            public string StoreCodeReceipt { get; set; }
            public string PaymentStatus { get; set; }
            public string PaymentStatusName { get; set; }
            public string CreatedBy { get; set; }
            public DateTime CreatedTime { get; set; }
            public string UpdatedBy { get; set; }
            public DateTime? UpdatedTime { get; set; }
            public string DeletedBy { get; set; }
            public DateTime? DeletedTime { get; set; }
            public bool IsDeleted { get; set; }
        }
        public class Packing
        {
            public string PackType { get; set; }
            public string PackCode { get; set; }
            public int CountUnit { get; set; }
        }
        public class ModelWfPlusCommand : WorkflowInstance
        {
            public string wfInstName { get; set; }
        }

        private class PackValue
        {
            public string Key { get; set; }
            public string Value { get; set; }
        }

        private class JsonPackValue
        {

            public PackValue A { get; set; }
            public PackValue B { get; set; }
            public PackValue C { get; set; }
            public PackValue D { get; set; }

            public JsonPackValue()
            {
                A = new PackValue
                {
                    Key = "",
                    Value = ""
                };
                B = new PackValue
                {
                    Key = "",
                    Value = ""
                };
                C = new PackValue
                {
                    Key = "",
                    Value = ""
                };
                D = new PackValue
                {
                    Key = "",
                    Value = ""
                };
            }
        }

        public class JTableModelMaterialStoreImpGoodsHeaders : JTableModel
        {
            public string Title { get; set; }
            public string SupCode { get; set; }
            public string StoreCode { get; set; }
            public string UserImport { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string ReasonName { get; set; }
            public string SupplierName { get; set; }
            public int CurrentPageView { get; set; }

        }

        public class MaterialStoreImpModel
        {
            public int Id { get; set; }
            public string TicketCode { get; set; }
            public string QrTicketCode { get; set; }
            public string LotProductCode { get; set; }
            public string CusCode { get; set; }
            public string CusName { get; set; }
            public string StoreCode { get; set; }
            public string StoreName { get; set; }
            public string Title { get; set; }
            public string UserImport { get; set; }
            public string UserImportName { get; set; }
            public string UserSend { get; set; }
            public decimal? CostTotal { get; set; }
            public string Currency { get; set; }
            public string CurrencyName { get; set; }
            public decimal? Discount { get; set; }
            public decimal? Commission { get; set; }
            public decimal? TaxTotal { get; set; }
            public string Note { get; set; }
            public string PositionGps { get; set; }
            public string PositionText { get; set; }
            public string FromDevice { get; set; }
            public decimal? TotalPayed { get; set; }
            public decimal? TotalMustPayment { get; set; }
            public DateTime? InsurantTime { get; set; }
            public DateTime? TimeTicketCreate { get; set; }
            public DateTime? NextTimePayment { get; set; }
            public string Reason { get; set; }
            public string ReasonName { get; set; }
            public string StoreCodeSend { get; set; }
            public string PaymentStatus { get; set; }
            public string PaymentStatusName { get; set; }
            public string CreatedBy { get; set; }
            public DateTime CreatedTime { get; set; }
            public string UpdatedBy { get; set; }
            public DateTime? UpdatedTime { get; set; }
            public string DeletedBy { get; set; }
            public DateTime? DeletedTime { get; set; }
            public bool IsDeleted { get; set; }
        }
        public class MaterialStoreImpModelInsert
        {
            public MaterialStoreImpModelInsert()
            {
                ListProduct = new List<MaterialStoreImpModelDetailInsert>();
            }

            public string LotProductCode { get; set; }
            public string TicketCode { get; set; }
            public string Title { get; set; }
            public string StoreCode { get; set; }
            public string CusCode { get; set; }
            public string Reason { get; set; }
            public string StoreCodeSend { get; set; }
            public decimal CostTotal { get; set; }
            public string Currency { get; set; }
            public decimal Discount { get; set; }
            public decimal TaxTotal { get; set; }
            public decimal Commission { get; set; }
            public decimal TotalMustPayment { get; set; }
            public decimal TotalPayed { get; set; }
            public string PaymentStatus { get; set; }
            public string NextTimePayment { get; set; }
            public string UserImport { get; set; }
            public string Note { get; set; }
            public string UserSend { get; set; }
            public string InsurantTime { get; set; }
            public string TimeTicketCreate { get; set; }
            public List<MaterialStoreImpModelDetailInsert> ListProduct { get; set; }
            public string PoSupCode { get; set; }
            public string Section { get; set; }
            public int QuantityImp { get; set; }
            public string Status { get; set; }
            public string WorkflowCat { get; set; }
            public string ActRepeat { get; set; }
            public string CreatedBy { get; set; }
            public string UserId { get; set; }
            public string UserName { get; set; }
            public string GroupType { get; set; }
            public string SupCode { get; set; }
        }

        public class MaterialStoreImpModelDetailInsert
        {
            public MaterialStoreImpModelDetailInsert()
            {
                ListCoil = new List<MaterialStoreImpModelDetailInsert>();
            }

            public string ProductCode { get; set; }
            public string ProductName { get; set; }
            public string ProductType { get; set; }
            public string ProductQrCode { get; set; }
            public string sProductQrCode { get; set; }
            public string RackCode { get; set; }
            public string RackName { get; set; }
            public decimal Quantity { get; set; }
            public decimal QuantityIsSet { get; set; }
            public string Unit { get; set; }
            public string UnitName { get; set; }
            public decimal? SalePrice { get; set; }
            public int? TaxRate { get; set; }
            public int? Discount { get; set; }
            public int? Commission { get; set; }
            public decimal Total { get; set; }
            public decimal TaxTotal { get; set; }
            public decimal DiscountTotal { get; set; }
            public decimal CommissionTotal { get; set; }
            public string ProductCoil { get; set; }
            public string sProductCoil { get; set; }
            public string ProductLot { get; set; }
            public string ProductCoilRelative { get; set; }
            public string PackType { get; set; }
            public string QuantityCoil { get; set; }
            public string ValueCoil { get; set; }
            public string UnitCoil { get; set; }
            public string ProductImpType { get; set; }
            public string RuleCoil { get; set; }
            public string RackPosition { get; set; }
            public string PositionInStore { get; set; }
            public List<MaterialStoreImpModelDetailInsert> ListCoil { get; set; }
        }
        public class CleanUp
        {
            public decimal? SumByUnit { get; set; }
            public string Unit { get; set; }
            public string UnitName { get; set; }
            public int PriorityUnit { get; set; }
        }
        public class FreeStorageRes
        {
            public int Id { get; set; }
            public string ProductQrCode { get; set; }
            public string WHS_Name { get; set; }
            public string FloorName { get; set; }
            public string L_Text { get; set; }
            public string RackName { get; set; }
            public string RackPosition { get; set; }
            public string Position { get; set; }
            public string PositionOld { get; set; }
            public string CreatedBy { get; set; }
            public DateTime CreatedTime { get; set; }
        }

        public class MoveProductModel
        {
            public int Id { get; set; }
            public string Floor { get; set; }
            public string Line { get; set; }
            public string Rack { get; set; }
            public int QuantityEmpty { get; set; }
            public int Quantity { get; set; }
        }

        public class JTableFreeStorageModel : JTableModel
        {
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public decimal? RealBugetFrom { get; set; }
            public decimal? RealBugetTo { get; set; }
            public decimal? BudgetExcludeTaxFrom { get; set; }
            public decimal? BudgetExcludeTaxTo { get; set; }
            public decimal? TaxTotalFrom { get; set; }
            public decimal? TaxTotalTo { get; set; }
        }

        public class MappingInfo
        {
            public string Code { get; set; }
            public string Name { get; set; }
            public string Title { get; set; }
            public string Parent { get; set; }
            public string Type { get; set; }
            public int Id { get; set; }
            public string Mapping { get; set; }
        }

        public class MappingInfoMisc
        {
            public string Code { get; set; }
            public string Name { get; set; }
            public string Type { get; set; }
            public bool Active { get; set; }
            public int Id { get; set; }
            public string Mapping { get; set; }
            public string JsonAttr { get; set; }
            public string Image { get; set; }
            public string ShapeData { get; set; }
            public string SvgIconData { get; set; }
            public int IdMapping { get; set; }
            public int? Deep { get; set; }
        }
        public class DataAtt
        {
            public string ActCode { get; set; }
            public string AttrGroup { get; set; }
            public List<DataAttrWf> DataAttrWf { get; set; }
        }
        public class WfRelative
        {
            public string WfInstCode { get; set; }
        }
        public class ExportPartialDetails
        {
            public ProductImportDetail ExportDetailParent { get; set; }
            public List<ExportDetail> ListExportDetails { get; set; }
        }
        public class ExportDetail
        {
            public string TicketCode { get; set; }
            public string LotProductCode { get; set; }
            public string ProductCode { get; set; }
            public string ProductQrCode { get; set; }
            public decimal Quantity { get; set; }
            public string Unit { get; set; }
            public string SrcUnit { get; set; }
            public string ProductType { get; set; }
            public string WHS_Code { get; set; }
            public decimal? SalePrice { get; set; }
            public string Currency { get; set; }
            public int MapId { get; set; }
            public bool MarkWholeProduct { get; set; }
            public string JsonPack { get; set; }
            public decimal MaxQuantity { get; set; }
            public string ProdCustomJson { get; set; }
            public bool? IsCustomized { get; set; }
            public string ExpType { get; set; }
            public string UserName { get; set; }
            public string ProductNo { get; set; }
            public string Status { get; set; }
            public bool? IsMultiple { get; set; }
            public decimal? Weight { get; set; }
            public string PackCode { get; internal set; }
            public string PackLot { get; internal set; }
        }
        public class ComboxModel
        {
            public string IntsCode { get; set; }
            public string Code { get; set; }
            public string Name { get; set; }
            public string Status { get; set; }
            public string StatusValue { get; set; }
            public string UpdateTime { get; set; }
            public string UpdateBy { get; set; }
        }
        #endregion

        #region Product Warning

        [HttpPost]
        public object GetProductWarnings([FromBody] JTableModel jTablePara)
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
            var data = query.Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            //foreach (var item in data)
            //{
            //    item.QrCode = CommonUtil.GenerateQRCode(item.QrCode);
            //}
            return new
            {
                Count = count,
                Data = data
            };
        }

        public class ProductWarningModel : JTableModel
        {
            public string ProductCode { get; set; }
            public string ProductName { get; set; }

        }

        [HttpPost]
        public object GetProductWarningsNews([FromBody] ProductWarningModel jTablePara)
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
                        where (string.IsNullOrEmpty(jTablePara.ProductCode) || a.ProductCode.Equals(jTablePara.ProductCode))
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
            var data = query.Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            //foreach (var item in data)
            //{
            //    item.QrCode = CommonUtil.GenerateQRCode(item.QrCode);
            //}
            return new
            {
                Count = count,
                Data = data
            };
        }

        [HttpPost]
        public object InsertProductWarning([FromBody] ProductSettingWarningModel model)
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
                        CreatedBy = model.UserName,
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
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                msg.Title = "Có lỗi xảy ra";
                msg.Error = true;
            }
            return Json(msg);
        }

        [HttpPost]
        public object UpdateProductWarning([FromBody] ProductSettingWarningModel model)
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
                    data.UpdatedBy = model.UserName;
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

        [HttpGet]
        public object GetItemProductWarning(int id)
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

        [HttpPost]
        public object DeleteProductWarning(int id, string userName)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = _context.ProductSettingWarnings
                    .FirstOrDefault(x => x.Id == id);
                if (data != null)
                {
                    data.IsDeleted = true;
                    data.DeletedBy = userName;
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

        [HttpGet]
        public object GetProductWarningType()
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = _context.CommonSettings
                    .Where(x => !x.IsDeleted && x.Group == "PRO_SET_WARNING_TYPE")
                    .Select(x => new { Code = x.CodeSet, Value = x.ValueSet }).ToList();
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

        [HttpPut]
        public object CalculateProductWarningCurrentQuantity()
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
        #endregion

        #region Product File CardJob

        public class FileCardJob
        {
            public int Id { get; set; }
            public string FileCode { get; set; }
            public string FileName { get; set; }
            public string FileTypePhysic { get; set; }
            public string Desc { get; set; }
            public DateTime CreatedTime { get; set; }
            public string CloudFileId { get; set; }
            public string ReposName { get; set; }
            public int FileID { get; set; }
            public decimal SizeOfFile { get; set; }
            public string TypeFile { get; set; }
            public string ListUserShare { get; set; }
            public string MimeType { get; set; }
            public string Type { get; set; }
            public string ObjectCode { get; set; }
            public string ObjectName { get; set; }
            public string CreatedBy { get; set; }
        }

        public class ModelEditImpDetail
        {
            public int Id { get; set; }
            public string Status { get; set; }
            public string UserName { get; set; }
        }

        public class JTableModelFile : JTableModel
        {
            public string ItemCode { get; set; }
            public string CardCode { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string CatCode { get; set; }
            public string UserId { get; set; }
        }
        public class ModelImportWord
        {
            public string ProductCode { get; set; }
            public string ProductName { get; set; }
            public string LotProductCode { get; set; }
            public string UnitName { get; set; }
            public decimal Quantity { get; set; }
            public decimal? Cost { get; set; }
            public string TicketCode { get; set; }
            public string Status { get; set; }
        }
        [HttpPost]
        public object JTableFile([FromBody] JTableModelFile jTablePara)
        {
            //if (string.IsNullOrEmpty(jTablePara.CardCode))
            //{
            //    return JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "Id", "FileName", "FileTypePhysic", "Desc", "Url", "CreatedTime", "UpdatedTime", "ReposName", "TypeFile", "FileID", "SizeOfFile");
            //}
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var cardObjects = GetGirdCardBoard(new AdvanceSearchObj() { UserId = jTablePara.UserId });
            //var listFileByUser = _context.FilesShareObjectUsers.Where(x => !x.IsDeleted && x.UserShares.Any(p => p.Code.Equals(User.Identity.Name)))
            //                                               .Select(p => new
            //                                               {
            //                                                   p.FileID,
            //                                                   p.ListUserShare,
            //                                                   p.UserShares
            //                                               }).ToList();
            var session = _loginService.GetSessionUser(jTablePara.UserId);

            //string[] param = new string[] { "@CardCode" };
            //object[] val = new object[] { jTablePara.CardCode };
            //DataTable rs = _repositoryService.GetDataTableProcedureSql("P_GET_FILE_CARD_JOB", param, val);
            //var query = CommonUtil.ConvertDataTable<FileCardJob>(rs);

            var query1 = (from a in _context.EDMSRepoCatFiles.Where(x =>
                                     //x.ObjectCode == objectCode &&
                                     x.ObjectType == "CARDJOB")
                          join b in _context.EDMSFiles on a.FileCode equals b.FileCode
                          //join c in cardObjects on a.ObjectCode equals c.CardCode
                          //join c in _context.FilesShareObjectUsers
                          //.Where(x => !x.IsDeleted && x.UserShares.Any(p => p.Code.Equals(userName)))
                          //on b.FileCode equals c.FileID into c1
                          //from c in c1.DefaultIfEmpty()
                          join f in _context.EDMSRepositorys on a.ReposCode equals f.ReposCode into f1
                          from f in f1.DefaultIfEmpty()
                              //where (session.UserType == 10 || b.CreatedBy == ESEIM.AppContext.UserName)
                              //where (listFileByUser.Any(x => x.FileID.Equals(b.FileCode)) ||
                              //       b.CreatedBy.Equals(userName) || session.UserType == 10)
                          select new FileCardJob
                          {
                              Id = a.Id,
                              FileCode = b.FileCode,
                              FileName = b.FileName,
                              FileTypePhysic = b.FileTypePhysic,
                              MimeType = b.MimeType,
                              Desc = b.Desc,
                              CreatedTime = b.CreatedTime.Value,
                              CloudFileId = b.CloudFileId,
                              ReposName = f != null ? f.ReposName : "",
                              FileID = b.FileID,
                              SizeOfFile = b.FileSize.HasValue ? b.FileSize.Value : 0,
                              Type = "NO_SHARE",
                              ObjectCode = a.ObjectCode,
                          }).ToList();
            var query2 = (
                                 from a in _context.FilesShareObjectUsers.Where(x => !x.IsDeleted
                                 && !string.IsNullOrEmpty(x.ObjectRelative)
                                 //&& x.ObjectRelative.Contains(objectCode)
                                  && x.ObjectRelative.Contains("JOBCARD"))
                                 join c in _context.EDMSRepoCatFiles on a.FileID equals c.FileCode
                                 join b in _context.EDMSFiles on c.FileCode equals b.FileCode
                                 //from d in cardObjects
                                 join f in _context.EDMSRepositorys on c.ReposCode equals f.ReposCode into f1
                                 from f in f1.DefaultIfEmpty()
                                 let rela = JsonConvert.DeserializeObject<ObjRelative>(a.ObjectRelative)
                                 where /*rela.ObjectInstance.Equals(d.CardCode) &&*/ rela.ObjectType.Equals("JOBCARD")
                                 select new FileCardJob
                                 {
                                     Id = c.Id,
                                     FileCode = b.FileCode,
                                     FileName = b.FileName,
                                     FileTypePhysic = b.FileTypePhysic,
                                     MimeType = b.MimeType,
                                     Desc = b.Desc,
                                     CreatedTime = b.CreatedTime.Value,
                                     CloudFileId = b.CloudFileId,
                                     ReposName = f != null ? f.ReposName : "",
                                     FileID = b.FileID,
                                     SizeOfFile = b.FileSize.HasValue ? b.FileSize.Value : 0,
                                     Type = "SHARE",
                                     ObjectCode = rela.ObjectInstance,
                                 }).ToList();
            var query = query1.Union(query2).ToList();
            var queryFilter = (from a in query
                               where cardObjects.Any(x => x.CardCode == a.ObjectCode)
                               select a).Select(delegate (FileCardJob x)
                               {
                                   x.ObjectName = cardObjects.
                                   FirstOrDefault(y => y.CardCode == x.ObjectCode).CardName;
                                   return x;
                               }).ToList();

            int count = queryFilter.Count();
            var data = queryFilter/*.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy)*/
                .Skip(intBeginFor).Take(jTablePara.Length)/*.AsNoTracking()*/.ToList();
            return new
            {
                Count = count,
                Data = data
            };
            //var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "FileCode", "FileName", "FileTypePhysic", "Desc",
            //    "CreatedTime", "CloudFileId", "ReposName", "TypeFile", "FileID", "SizeOfFile", "ListUserShare", "ObjectCode", "ObjectName", "CreatedBy");
            //return jdata;
        }
        private List<GridCardJtable> GetGirdCardBoard(AdvanceSearchObj dataSearch)
        {
            var session = _loginService.GetSessionUser(dataSearch.UserId);
            var user = _context.Users.FirstOrDefault(x => x.Active && x.UserName == session.UserName);
            //var fromDate = string.IsNullOrEmpty(dataSearch.FromDate) ? (DateTime?)null : DateTime.ParseExact(dataSearch.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            //var toDate = string.IsNullOrEmpty(dataSearch.ToDate) ? (DateTime?)null : DateTime.ParseExact(dataSearch.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var fromDateNew = DateTime.Now.AddDays(-30);
            var fromDatePara = fromDateNew.ToString("yyyy-MM-dd");
            var toDatePara = DateTime.Now.ToString("yyyy-MM-dd");
            var listUserOfBranch = "";
            if (session.IsBranch)
            {
                if (session.ListUserOfBranch.Any())
                {
                    listUserOfBranch = string.Join(",", session.ListUserOfBranch);
                }
            }
            string[] param = new string[] { "@PageNo", "@PageSize", "@fromDate", "@toDate", "@IsAllData", "@IsUser", "@IsBranch", "@UserName",
                        "@ListUserOfBranch", "@DepartmentId", "@BoardSearch", "@UserId", "@BranchId", "@Status", "@CardName", "@ListCode", "@Group",
                        "@Project", "@Customer", "@Supplier", "@Contract", "@UserIdSearch", "@UserNameSearch", "@DepartmentSearch", "@WorkflowInstCode",
                        "@TimeTypeCreated", "@TimeTypeStart", "@TimeTypeEnd", "@TimeTypeCompleted"};

            object[] val = new object[] { 1, 100 ,fromDatePara, toDatePara, session.IsAllData, session.IsUser,
                        session.IsBranch, session.UserName, listUserOfBranch, !string.IsNullOrEmpty(user.DepartmentId) ? user.DepartmentId : "",
                        !string.IsNullOrEmpty(dataSearch.BoardSearch) ? dataSearch.BoardSearch : "", session.UserId, !string.IsNullOrEmpty(dataSearch.BranchId) ? dataSearch.BranchId : "",
                        !string.IsNullOrEmpty(dataSearch.Status) ? dataSearch.Status : "", dataSearch.CardName ?? "", !string.IsNullOrEmpty(dataSearch.ListCode) ? dataSearch.ListCode : "",
                        !string.IsNullOrEmpty(dataSearch.Group) ? dataSearch.Group : "", !string.IsNullOrEmpty(dataSearch.Project) ? dataSearch.Project : "",
                        !string.IsNullOrEmpty(dataSearch.Customer) ? dataSearch.Customer : "", !string.IsNullOrEmpty(dataSearch.Supplier) ? dataSearch.Supplier: "",
                        !string.IsNullOrEmpty(dataSearch.Contract) ? dataSearch.Contract: "", !string.IsNullOrEmpty(dataSearch.UserId) ? dataSearch.UserId : "",
                        !string.IsNullOrEmpty(dataSearch.UserName) ? dataSearch.UserName : "", !string.IsNullOrEmpty(dataSearch.Department) ? dataSearch.Department: "",
                        !string.IsNullOrEmpty(dataSearch.WorkflowInstCode) ? dataSearch.WorkflowInstCode : "",
                        false, true, true, false };
            DataTable rs = _repositoryService.GetDataTableProcedureSql("P_GET_ALL_BOARD_CARD_WITH_CONDITION", param, val);
            var query = CommonUtil.ConvertDataTable<GridCardJtable>(rs);
            return query;
        }
        [HttpPost]
        public string ImportFromServerWord(int idRepoCatFile)
        {
            var obj = DownloadFileFromServerCj(idRepoCatFile);
            Stream stream = new MemoryStream(obj.stream);
            stream.Position = 0;
            var type = obj.type;

            Syncfusion.EJ2.DocumentEditor.WordDocument document = Syncfusion.EJ2.DocumentEditor.WordDocument.Load(stream, GetFormatType(type.ToLower()));
            //document.Save(streamSave);

            string sfdt = JsonConvert.SerializeObject(document);

            document.Dispose();
            var formatHtml = Syncfusion.EJ2.DocumentEditor.FormatType.Html;
            var outputStream = Syncfusion.EJ2.DocumentEditor.WordDocument.Save(sfdt, formatHtml);
            outputStream.Position = 0;
            StreamReader reader = new StreamReader(outputStream);
            string value = reader.ReadToEnd().ToString();
            return value;
        }
        [NonAction]
        public (byte[] stream, string type) DownloadFileFromServerCj(int idRepoCatFile)
        {
            byte[] fileStream = new byte[0];

            var data = (from a in _context.EDMSRepoCatFiles.Where(x => x.Id == idRepoCatFile)
                        join b in _context.EDMSRepositorys on a.ReposCode equals b.ReposCode into b2
                        from b in b2.DefaultIfEmpty()
                        join c in _context.EDMSFiles on a.FileCode equals c.FileCode into c2
                        from c in c2.DefaultIfEmpty()
                        select new
                        {
                            a.Id,
                            Server = (b != null ? b.Server : null),
                            Token = (b != null ? b.Token : null),
                            Type = (b != null ? b.Type : null),
                            ReposCode = (b != null ? b.ReposCode : null),
                            Url = (c != null ? c.Url : null),
                            FileId = (c != null ? c.CloudFileId : null),
                            FileTypePhysic = c.FileTypePhysic,
                            c.FileName,
                            c.MimeType,
                            b.Account,
                            b.PassWord,
                            c.FileCode,
                            c.IsEdit,
                            c.IsFileMaster,
                            c.FileParentId
                        }).FirstOrDefault();

            var getRepository = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == data.ReposCode);
            if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server))
            {
                using (var ms = new MemoryStream())
                {
                    string ftphost = data.Server;
                    string ftpfilepath = data.Url;
                    var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + ftphost + ftpfilepath);
                    using (WebClient request = new WebClient())
                    {
                        request.Credentials = new NetworkCredential(data.Account, data.PassWord);
                        fileStream = request.DownloadData(urlEnd);
                    }
                }
            }
            else if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.GooglerDriver))
            {
                var apiTokenService = _context.TokenManagers.FirstOrDefault(x => x.AccountCode == data.Token);
                var json = apiTokenService.CredentialsJson;
                var user = apiTokenService.Email;
                var token = apiTokenService.RefreshToken;
                fileStream = FileExtensions.DownloadFileGoogle(json, token, data.FileId, user);
            }
            int index = data.FileName.LastIndexOf('.');
            string type = index > -1 && index < data.FileName.Length - 1 ?
                data.FileName.Substring(index) : ".docx";

            return (fileStream, type);
        }

        [HttpGet]
        public string GetImportFormat(string code)
        {
            return _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == code)?.ValueSet ?? "";
        }

        [HttpPost]
        public JsonResult InsertImpDetailFromWord([FromBody] List<ModelImportWord> data)
        {
            var msg = new JMessage() { Error = false, Title = "", Object = "" };
            try
            {
                var firstItem = data.FirstOrDefault();
                if (firstItem != null)
                {
                    var impHeader = _context.ProductImportHeaders.FirstOrDefault(x => !x.IsDeleted && x.TicketCode == firstItem.TicketCode);
                    if (impHeader != null)
                    {
                        msg.Error = true;
                        msg.Title = "Mã phiếu nhập " + impHeader.TicketCode + " đã được sử dụng!";
                        return Json(msg);
                    }
                }
                foreach (var item in data)
                {
                    var materialProduct = _context.MaterialProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductCode.Equals(item.ProductCode));
                    //var checkDetail = _context.StopContractDetails.FirstOrDefault(x => !x.IsDeleted && x.EmployeeCode.Equals(item.EmployeeCode) && x.DecisionNum.Equals(item.DecisionNum));
                    if (materialProduct != null /*&& checkDetail == null*/)
                    {
                        var unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && !string.IsNullOrEmpty(x.ValueSet) && !string.IsNullOrEmpty(item.UnitName)
                        && x.ValueSet.ToLower() == item.UnitName.ToLower() && x.Group == "UNIT")?.CodeSet ?? "";
                        var receiveDetail = new ProductImportDetail
                        {
                            TicketCode = item.TicketCode,
                            ProductCode = item.ProductCode,
                            LotProductCode = item.LotProductCode,
                            Quantity = item.Quantity,
                            Unit = unit,
                            Status = item.Status,
                            SalePrice = item.Cost
                        };
                        msg = InsertDetailImp(receiveDetail).Result;
                        if (msg.Error)
                        {
                            return Json(msg);
                        }
                    }
                    else if (materialProduct == null)
                    {
                        msg.Error = true;
                        msg.Title = "Sản phẩm " + item.ProductCode + " không tồn tại  !";
                        return Json(msg);
                    }
                    //else
                    //{
                    //    msg.Error = true;
                    //    msg.Title = "Mã nhân viên " + item.EmployeeCode + " đã ở trong quyết định  !";
                    //    return Json(msg);
                    //}
                    msg.Title = "Thêm thành công";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Lỗi thêm file" + ex.Message;
            }
            return Json(msg);
        }

        [HttpPost]
        public string SaveInputFile(IFormCollection data)
        {
            if (data.Files.Count == 0)
                return null;
            System.IO.Stream stream = new System.IO.MemoryStream();
            Microsoft.AspNetCore.Http.IFormFile file = data.Files[0];
            int index = file.FileName.LastIndexOf('.');
            string type = index > -1 && index < file.FileName.Length - 1 ?
                file.FileName.Substring(index) : ".docx";
            file.CopyTo(stream);
            stream.Position = 0;
            var fileName = $"Phiếu nhập {DateTime.Now.ToString("ddMMyyy-hhmm")}{type.ToLower()}";
            var pathFile = _hostingEnvironment.WebRootPath + "\\uploads\\tempFile\\" + fileName;
            var pathFileDownLoad = "uploads\\tempFile\\" + fileName;
            FileStream streamSave = new FileStream(pathFile, FileMode.Create, FileAccess.ReadWrite);
            stream.Seek(0, SeekOrigin.Begin);
            stream.CopyTo(streamSave);
            streamSave.Close();
            return pathFileDownLoad;
        }

        [HttpPut]
        public JsonResult UpdateImpDetail([FromBody] ModelEditImpDetail model)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var product = _context.ProductImportDetails.FirstOrDefault(x => x.Id == model.Id);
                if (product != null)
                {
                    product.Status = model.Status;
                    product.UpdatedBy = model.UserName;
                    product.UpdatedTime = DateTime.Now;
                    _context.ProductImportDetails.Update(product);
                    _context.SaveChanges();
                    msg.Title = "Cập nhật sản phẩm thành công!";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Cập nhật sản phẩm thất bại!";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = "Có lỗi khi cập nhật";
            }

            return Json(msg);
        }
        #endregion

        #region OCR
        public IActionResult PerformOCR(IFormFile file)
        {
            var text = "";
            using (OCRProcessor processor = new OCRProcessor())
            {
                //Load the input image. 
                Stream imageStream = file.OpenReadStream();
                //Set OCR language.
                processor.Settings.Language = Languages.English;
                //Perform OCR with input document, tessdata (Language packs) and enabling isMemoryOptimized property.
                var pdf = processor.PerformOCR(imageStream);
                PdfPageBase page = pdf.Pages[0];
                text = page.ExtractText();
            }
            return Ok(text);
        }
        #endregion

        #region Mapping
        [HttpPost]
        public object GetListMappingFilterMisc(string start)
        {
            try
            {
                var rs = (from a in _context.PAreaMappingsStore
                        .Where(x => x.IsDeleted == false && x.ObjectCode.StartsWith(start))
                          join b in _context.PAreaCategoriesStore.Where(x => x.IsDeleted == false)
                              on new { a.CategoryCode, a.ObjectType } equals new
                              { CategoryCode = b.Code, ObjectType = b.PAreaType } into b1
                          from b in b1.DefaultIfEmpty()
                          select new MappingInfoMisc
                          {
                              Code = b != null ? b.PAreaCode : a.ObjectCode,
                              Name = b != null ? b.PAreaDescription : "",
                              Type = a.ObjectType,
                              Active = false,
                              Id = b != null ? b.Id : a.Id,
                              Mapping = a.ObjectCode,
                              JsonAttr = a.JsonAttr,
                              Image = a.Image,
                              ShapeData = a.ShapeData,
                              Deep = a.Deep,
                              SvgIconData = a.SvgIconData
                          }).ToList();
                //string[] map = new[] { "AREA", "FLOOR", "LINE", "RACK", "POSITION" };
                //var orderedList = from a in rs
                //                  join b in map.Select((x, i) => new { Index = i, Value = x }) on a.Type equals b.Value
                //                  orderby b.Index
                //                  select a;
                return Json(rs);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion

        #region MapProduct
        [HttpPost]
        public object GetMapProduct([FromBody] MapSearch search)
        {
            var productKey = search.ProductKey != null ? search.ProductKey.ToLower() : "";
            var supCode = search.SupCode != null ? search.SupCode.ToLower() : "";
            var cusCode = search.CustomerCode != null ? search.CustomerCode.ToLower() : "";
            var warehouseCode = search.WarehouseCode != null ? search.WarehouseCode.ToLower() : "";
            var result = new List<ProductGps>();
            var query = (from a in _context.MaterialProducts
                         join b in _context.MaterialProductGroups on a.GroupCode equals b.Code into b1
                         from b in b1.DefaultIfEmpty()
                         join c in _context.MaterialTypes on a.TypeCode equals c.Code into c1
                         from c in c1.DefaultIfEmpty()
                         join d in _context.CommonSettings on a.Unit equals d.CodeSet into d2
                         from d1 in d2.DefaultIfEmpty()
                         join f in _context.ProductLocatedMappings.Where(x => !x.IsDeleted) on a.ProductCode equals f.ProductCode
                         into f1
                         from f in f1.DefaultIfEmpty()
                         join g in _context.EDMSWareHouses.Where(x => x.WHS_Flag == false) on f.WHS_Code equals g.WHS_Code
                         into g1
                         from g in g1.DefaultIfEmpty()
                         where a.IsDeleted == false
                             && (string.IsNullOrEmpty(productKey) || a.ProductCode == productKey)
                         select new
                         {
                             ProductCode = a.ProductCode,
                             ProductName = a.ProductName,
                             MpStatus = a.MpStatuses != null ? a.MpStatuses.LastOrDefault() : null,
                             MappingCode = f != null ? f.MappingCode : "",
                             WhsCode = g != null ? g.WHS_Code : null,
                         }).ToList();
            var filterQuery = query.Where(x => (string.IsNullOrEmpty(supCode) || x.MpStatus != null && x.MpStatus.SupCode == supCode)
                && (string.IsNullOrEmpty(cusCode) || x.MpStatus != null && x.MpStatus.CusCode == cusCode)
                && (string.IsNullOrEmpty(warehouseCode) || x.MpStatus != null && x.WhsCode == warehouseCode)).ToList();
            foreach (var item in query)
            {
                if (item.WhsCode != null)
                {
                    var wareHouse = _context.EDMSWareHouses.FirstOrDefault(x => x.WHS_Flag == false && x.WHS_Code == item.WhsCode);
                    var mapGps = _context.MapDataGpss
                        .FirstOrDefault(x => !x.IsDeleted && x.ObjType == EnumHelper<WarehouseEnum>.GetDisplayValue(WarehouseEnum.Warehouse)
                        && x.ObjCode == item.WhsCode);
                    if (mapGps != null && wareHouse != null)
                    {
                        result.Add(new ProductGps(mapGps.Id, item.ProductCode, item.ProductName, wareHouse.WHS_Code, wareHouse.WHS_Name,
                            new MapDataGps
                            {
                                Id = mapGps.Id,
                                Image = mapGps.Image,
                                CreatedBy = mapGps.CreatedBy,
                                CreatedTime = mapGps.CreatedTime,
                                DeletedBy = mapGps.DeletedBy,
                                DeletedTime = mapGps.DeletedTime,
                                Icon = mapGps.Icon,
                                GisData = mapGps.GisData,
                                IsActive = mapGps.IsActive,
                                IsDefault = mapGps.IsDefault,
                                IsDeleted = mapGps.IsDeleted,
                                MakerGPS = mapGps.MakerGPS,
                                MapCode = mapGps.MapCode,
                                ObjCode = mapGps.ObjCode,
                                ObjType = mapGps.ObjType,
                                PolygonGPS = mapGps.PolygonGPS,
                                Title = mapGps.Title,
                                UpdatedBy = mapGps.UpdatedBy,
                                UpdatedTime = mapGps.UpdatedTime
                            }, mapGps.IsActive, mapGps.IsDefault, mapGps.IsDeleted, "WAREHOUSE"
                        ));
                    }
                }
                else if (item.MpStatus != null && !string.IsNullOrEmpty(item.MpStatus.CusCode))
                {
                    var customer = _context.Customerss.FirstOrDefault(x => !x.IsDeleted && x.CusCode == item.MpStatus.CusCode);
                    var mapGps = _context.MapDataGpss
                        .FirstOrDefault(x => !x.IsDeleted && x.ObjType == EnumHelper<CustomerEnum>.GetDisplayValue(CustomerEnum.Customer)
                        && x.ObjCode == item.WhsCode);
                    if (mapGps != null && customer != null)
                    {
                        result.Add(new ProductGps(mapGps.Id, item.ProductCode, item.ProductName, customer.CusCode, customer.CusName,
                            new MapDataGps
                            {
                                Id = mapGps.Id,
                                Image = mapGps.Image,
                                CreatedBy = mapGps.CreatedBy,
                                CreatedTime = mapGps.CreatedTime,
                                DeletedBy = mapGps.DeletedBy,
                                DeletedTime = mapGps.DeletedTime,
                                Icon = mapGps.Icon,
                                GisData = mapGps.GisData,
                                IsActive = mapGps.IsActive,
                                IsDefault = mapGps.IsDefault,
                                IsDeleted = mapGps.IsDeleted,
                                MakerGPS = mapGps.MakerGPS,
                                MapCode = mapGps.MapCode,
                                ObjCode = mapGps.ObjCode,
                                ObjType = mapGps.ObjType,
                                PolygonGPS = mapGps.PolygonGPS,
                                Title = mapGps.Title,
                                UpdatedBy = mapGps.UpdatedBy,
                                UpdatedTime = mapGps.UpdatedTime
                            }, mapGps.IsActive, mapGps.IsDefault, mapGps.IsDeleted, "CUSTOMER"
                        ));
                    }
                }
                else if (item.MpStatus != null && !string.IsNullOrEmpty(item.MpStatus.SupCode))
                {
                    var supplier = _context.Suppliers.FirstOrDefault(x => !x.IsDeleted && x.SupCode == item.MpStatus.SupCode);
                    var mapGps = _context.MapDataGpss
                        .FirstOrDefault(x => !x.IsDeleted && x.ObjType == EnumHelper<CustomerEnum>.GetDisplayValue(CustomerEnum.Customer)
                        && x.ObjCode == item.WhsCode);
                    if (mapGps != null && supplier != null)
                    {
                        result.Add(new ProductGps(mapGps.Id, item.ProductCode, item.ProductName, supplier.SupCode, supplier.SupName,
                            new MapDataGps
                            {
                                Id = mapGps.Id,
                                Image = mapGps.Image,
                                CreatedBy = mapGps.CreatedBy,
                                CreatedTime = mapGps.CreatedTime,
                                DeletedBy = mapGps.DeletedBy,
                                DeletedTime = mapGps.DeletedTime,
                                Icon = mapGps.Icon,
                                GisData = mapGps.GisData,
                                IsActive = mapGps.IsActive,
                                IsDefault = mapGps.IsDefault,
                                IsDeleted = mapGps.IsDeleted,
                                MakerGPS = mapGps.MakerGPS,
                                MapCode = mapGps.MapCode,
                                ObjCode = mapGps.ObjCode,
                                ObjType = mapGps.ObjType,
                                PolygonGPS = mapGps.PolygonGPS,
                                Title = mapGps.Title,
                                UpdatedBy = mapGps.UpdatedBy,
                                UpdatedTime = mapGps.UpdatedTime
                            }, mapGps.IsActive, mapGps.IsDefault, mapGps.IsDeleted, "SUPPLIER"
                        ));
                    }
                }
            }
            return Json(result);
        }

        [HttpPost]
        public object SearchCustomer([FromBody] MapSearch search)
        {
            var areas = search.Areas;
            var groups = search.Groups;
            var types = search.Types;
            var roles = search.Roles;
            //var customerName = search.CustomerCode != null ? search.CustomerCode.ToLower() : "";
            var cusCode = search.CustomerCode != null ? search.CustomerCode.ToLower() : "";
            var query = from a in _context.Customerss
                        join f in _context.MapDataGpss.Where(x => !x.IsDeleted && x.ObjType == EnumHelper<CustomerEnum>.GetDisplayValue(CustomerEnum.Customer)) on a.CusCode equals f.ObjCode
                        where (string.IsNullOrEmpty(cusCode) || (!string.IsNullOrEmpty(a.CusCode) && a.CusCode == cusCode))
                        //&& (areas.Count == 0 || areas.Contains(a.Area))
                        //&& (groups.Count == 0 || groups.Contains(a.CusGroup))
                        //&& (types.Count == 0 || types.Contains(a.CusType))
                        //&& (roles.Count == 0 || roles.Contains(a.Role))
                        && a.IsDeleted == false
                        select new
                        {
                            Id = a.CusID,
                            Code = a.CusCode,
                            Name = a.CusName,
                            //Are = a.Area,
                            // a.CusGroup,
                            //a.Role,
                            //a.CusType,
                            Status = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.ActivityStatus).ValueSet ?? "",
                            AreaTxt = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.Area).ValueSet ?? "",
                            GroupTxt = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.CusGroup).ValueSet ?? "",
                            TypeTxt = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.CusType).ValueSet ?? "",
                            RoleTxt = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.Role).ValueSet ?? "",
                            a.GoogleMap,
                            a.Address,
                            MapDataGis = new MapDataGps
                            {
                                Id = f.Id,
                                Image = f.Image,
                                CreatedBy = f.CreatedBy,
                                CreatedTime = f.CreatedTime,
                                DeletedBy = f.DeletedBy,
                                DeletedTime = f.DeletedTime,
                                GisData = f.GisData,
                                Icon = _context.IconManagers.FirstOrDefault(x => x.IconCode == a.IconLevel).IconPath ?? f.Icon,
                                IsActive = f.IsActive,
                                IsDefault = f.IsDefault,
                                IsDeleted = f.IsDeleted,
                                MakerGPS = f.MakerGPS,
                                MapCode = f.MapCode,
                                ObjCode = f.ObjCode,
                                ObjType = f.ObjType,
                                PolygonGPS = f.PolygonGPS,
                                Title = f.Title,
                                UpdatedBy = f.UpdatedBy,
                                UpdatedTime = f.UpdatedTime
                            },
                            IsActive = (f != null ? f.IsActive : false),
                            IsDefault = (f != null ? f.IsDefault : false),
                            IsDeleted = (f != null ? f.IsDeleted : true),
                        };
            IQueryable group = Enumerable.Empty<object>().AsQueryable();
            if (query.Any())
            {
                group = query.GroupBy(x => new { x.Code }).Select(y => new
                {
                    y.Key.Code,
                    list = y.Where(z => z.IsActive == true && z.IsDeleted == false).Count() > 0 ? y.Where(z => z.IsActive == true && z.IsDeleted == false) : Enumerable.Empty<object>()
                });
            }
            return Json(group);
        }


        [HttpPost]
        public object SearchSupplier([FromBody] MapSearch search)
        {
            var areas = search.Areas;
            var groups = search.Groups;
            var types = search.Types;
            var roles = search.Roles;
            var supCode = search.SupCode != null ? search.SupCode.ToLower() : "";
            var query = from a in _context.Suppliers
                        join f in _context.MapDataGpss.Where(x => !x.IsDeleted && x.ObjType == EnumHelper<SupplierEnum>.GetDisplayValue(SupplierEnum.Supplier)) on a.SupCode equals f.ObjCode
                        where (string.IsNullOrEmpty(supCode) || (!string.IsNullOrEmpty(a.SupCode) && a.SupCode == supCode))
                        //&& (areas.Count == 0 || areas.Contains(a.Area))
                        //&& (groups.Count == 0 || groups.Contains(a.SupGroup))
                        //&& (types.Count == 0 || types.Contains(a.CusType))
                        //&& (roles.Count == 0 || roles.Contains(a.Role))
                        && a.IsDeleted == false
                        select new
                        {
                            Id = a.SupID,
                            Code = a.SupCode,
                            Name = a.SupName,
                            //a.Area,
                            //a.SupGroup,
                            //a.Role,
                            //a.CusType,
                            Status = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.Status).ValueSet ?? "",
                            AreaTxt = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.Area).ValueSet ?? "",
                            GroupTxt = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.SupGroup).ValueSet ?? "",
                            TypeTxt = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.CusType).ValueSet ?? "",
                            RoleTxt = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.Role).ValueSet ?? "",
                            a.GoogleMap,
                            a.Address,
                            MapDataGis = new MapDataGps
                            {
                                Id = f.Id,
                                Image = f.Image,
                                CreatedBy = f.CreatedBy,
                                CreatedTime = f.CreatedTime,
                                DeletedBy = f.DeletedBy,
                                DeletedTime = f.DeletedTime,
                                GisData = f.GisData,
                                Icon = _context.IconManagers.FirstOrDefault(x => x.IconCode == a.IconLevel).IconPath ?? f.Icon,
                                IsActive = f.IsActive,
                                IsDefault = f.IsDefault,
                                IsDeleted = f.IsDeleted,
                                MakerGPS = f.MakerGPS,
                                MapCode = f.MapCode,
                                ObjCode = f.ObjCode,
                                ObjType = f.ObjType,
                                PolygonGPS = f.PolygonGPS,
                                Title = f.Title,
                                UpdatedBy = f.UpdatedBy,
                                UpdatedTime = f.UpdatedTime
                            },
                            IsActive = (f != null ? f.IsActive : false),
                            IsDefault = (f != null ? f.IsDefault : false),
                            IsDeleted = (f != null ? f.IsDeleted : true),
                        };
            IQueryable group = Enumerable.Empty<object>().AsQueryable();
            if (query.Any())
            {
                group = query.GroupBy(x => new
                {
                    x.Code
                }).Select(y => new
                {
                    y.Key.Code,
                    list = y.Where(z => z.IsActive == true && z.IsDeleted == false).Count() > 0 ? y.Where(z => z.IsActive == true && z.IsDeleted == false) : Enumerable.Empty<object>(),
                });
            }
            return Json(group);
        }
        #endregion

        #region Product Attribute
        [HttpPost]
        public object GetSyncProductAttribute(string productCode)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                string[] parts = productCode.Split('.');
                string productCodeOrg = string.Join(".", parts.Take(parts.Length - 1));
                msg.Object = (from a in _context.ProductAttrGalaxys
                              join b in _context.AttrGalaxys on a.AttrCode equals b.Code into b1
                              from b2 in b1.DefaultIfEmpty()
                              where a.ProductCode != null && a.ProductCode.Contains(productCodeOrg)
                                && a.ProductCode != productCode && a.IsDeleted == false
                              orderby a.Id descending
                              select new
                              {
                                  a.Id,
                                  a.AttrCode,
                                  AttrName = b2 != null ? b2.Name : "",
                                  a.AttrValue,
                                  a.CreatedTime,
                                  Unit = b2 != null
                                       ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b2.Unit)) != null
                                           ?
                                           _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b2.Unit)).ValueSet
                                           : ""
                                       : "",
                                  Group = b2 != null
                                       ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b2.Group)) != null
                                           ?
                                           _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b2.Group)).ValueSet
                                           : ""
                                       : "",
                                  DataType = b2 != null
                                       ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b2.DataType)) != null
                                           ?
                                           _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b2.DataType)).ValueSet
                                           : ""
                                       : "",
                                  Parent = b2 != null
                                       ? _context.AttrGalaxys.FirstOrDefault(x => x.Code.Equals(b2.Parent)) != null
                                           ?
                                           _context.AttrGalaxys.FirstOrDefault(x => x.Code.Equals(b2.Parent)).Name
                                           : ""
                                       : "",
                                  a.ProductCode
                              }).ToList().GroupBy(x => x.ProductCode).Where(g => g.Count() > 0)
                            .OrderByDescending(x => x.FirstOrDefault().Id).FirstOrDefault();
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi đồng bộ !";
            }
            return Json(msg);
        }
        [HttpPost]
        public object SetSyncProductAttribute([FromBody] ProductAttributeSync obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var dataOld = _context.ProductAttrGalaxys.Where(x =>
                        x.ProductCode.Equals(obj.ProductCode) && !x.IsDeleted);
                foreach (var item in dataOld)
                {
                    item.IsDeleted = true;
                }
                foreach (var item in obj.Galaxy)
                {
                    ProductAttrGalaxy objNew = new ProductAttrGalaxy();

                    objNew.ProductCode = obj.ProductCode;
                    objNew.AttrCode = item.AttrCode;
                    objNew.AttrValue = item.AttrValue;
                    objNew.CreatedTime = DateTime.Now;
                    objNew.CreatedBy = obj.CreatedBy;
                    objNew.IsDeleted = false;

                    _context.ProductAttrGalaxys.Add(objNew);
                    _context.SaveChanges();
                }
                msg.Error = false;
                msg.Title = "Đồng bộ thành công";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi đồng bộ !";
            }
            return Json(msg);
        }
        public class ProductAttributeSync
        {
            public string ProductCode { get; set; }
            public string CreatedBy { get; set; }

            public List<ProductAttrGalaxy> Galaxy { get; set; }
        }
        #endregion
    }
}
