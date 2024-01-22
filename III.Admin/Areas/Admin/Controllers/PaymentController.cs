using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Formatting;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using III.Domain.Enums;
using log4net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Microsoft.VisualStudio.Services.OAuth;
using SmartBreadcrumbs.Attributes;
using Stripe;
using Stripe.Checkout;
using ESEIM;
using Microsoft.TeamFoundation.Common;
using static III.Admin.Controllers.PurchaseCostController;
using Syncfusion.XlsIO;
using Microsoft.EntityFrameworkCore;
using System.Transactions;
using Syncfusion.EJ2.Navigations;
using static Dropbox.Api.Paper.ListPaperDocsSortBy;
using OpenXmlPowerTools;
using Syncfusion.Drawing;
using Microsoft.SqlServer.Management.Smo;
using static III.Admin.Controllers.MobileLoginController;
using Syncfusion.EJ2.Linq;
using static III.Admin.Controllers.ServiceRegistController;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class PaymentController : BaseController
    {

        public string CreateOrderUrl = "https://api-m.sandbox.paypal.com/v2/checkout/orders";
        public string AccessTokenUrl = "https://api-m.sandbox.paypal.com/v1/oauth2/token";
        public string CaptureOrderUrlFormat = "https://api-m.sandbox.paypal.com/v2/checkout/orders/{0}/capture";
        private static string _accessToken;
        private readonly EIMDBContext _context;
        private readonly CheckoutConfig _config;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IPaymentService _paymentService;
        private PayPalV2Config _palV2Config;
        private VnPayConfig _vnPayConfig;
        private MomoV2Config _momoV2Config;
        private StripeConfig _stripeConfig;
        private readonly AppSettings _appSettings;
        public PaymentController(EIMDBContext context, IPaymentService paymentService,
            IOptions<CheckoutConfig> config,IOptions<AppSettings> appSettings,
            IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _config = config.Value;
            _sharedResources = sharedResources;
            _paymentService = paymentService;
            _appSettings = appSettings.Value;
            _palV2Config = _paymentService.GetPayPalV2Config();
            _vnPayConfig = _paymentService.GetVnPayConfig();
            _momoV2Config = _paymentService.GetMomoV2Config();
            _stripeConfig = _paymentService.GetStripeConfig();
        }
        [Breadcrumb("ViewData.CrumbPaymentHome", AreaName = "Admin", FromAction = "Index", FromController = typeof(MenuCenterController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbPaymentMenu"] = "Menu thanh toán";
            ViewData["CrumbPaymentHome"] = "Thanh toán";
            return View();
        }
        
        [AllowAnonymous]
        [HttpPost]
        public object GetPrice(int points, string currency = "VND")
        {
            var value = EnumHelper<PaymentEnum>.GetDisplayValue(PaymentEnum.PayRate);
            var check = _context.CommonSettings.Any(x => x.Group == EnumHelper<PaymentEnum>.GetDisplayValue(PaymentEnum.PayRate));
            var rate = _paymentService.GetRateFromCurrency(currency) ?? (decimal)1.0;
            var price = rate * points;
            //if (check)
            //{
            //    var valueSet = _context.CommonSettings.FirstOrDefault(x =>
            //        x.Group == EnumHelper<PaymentEnum>.GetDisplayValue(PaymentEnum.PayRate))?.ValueSet;
            //    if (valueSet !=
            //        null)
            //        rate = double.Parse(valueSet);
            //    price = rate * points;
            //}
            var cart = new
            {
                Type = points.ToString() + " Points",
                Price = price,
                Rate = rate
            };
            return cart;
        }
        
        [AllowAnonymous]
        [HttpPost]
        public object AddPoints(decimal points)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var id = ESEIM.AppContext.UserId;
                var user = _context.Users.FirstOrDefault(x => x.Id == id);
                if (user == null)
                {
                    msg.Error = true;
                    msg.Title = "Không tìm thấy người dùng!";
                    return Json(msg);
                }

                if (user.Balance.HasValue)
                {
                    user.Balance += points;
                }
                else
                {
                    user.Balance = points;
                }
                _context.Users.Update(user);
                _context.SaveChanges();
                msg.Title = "Thêm điểm thành công!";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = "Có lỗi khi thêm điểm!";
            }
            return Json(msg);
        }
        private async Task<string> GenerateAccessToken()
        {
            AccessTokenResponse token;
            try
            {
                var accessTokenUrl = _palV2Config?.AccessTokenUrl ?? AccessTokenUrl;
                HttpClient client = HeadersForAccessTokenGenerate();
                List<KeyValuePair<string, string>> postData = new List<KeyValuePair<string, string>>();
                postData.Add(new KeyValuePair<string, string>("grant_type", "client_credentials"));
                HttpResponseMessage tokenResponse = client.PostAsync(accessTokenUrl, new FormUrlEncodedContent(postData)).Result;
                token = await tokenResponse.Content.ReadAsAsync<AccessTokenResponse>(new[] { new JsonMediaTypeFormatter() });
            }
            catch (HttpRequestException ex)
            {
                throw ex;
            }
            return token?.AccessToken;
        }
        private HttpClient HeadersForAccessTokenGenerate()
        {
            HttpClientHandler handler = new HttpClientHandler() { UseDefaultCredentials = false };
            HttpClient client = new HttpClient(handler);
            try
            {
                var accessTokenUrl = _palV2Config?.AccessTokenUrl ?? AccessTokenUrl;
                client.BaseAddress = new Uri(accessTokenUrl);
                client.DefaultRequestHeaders.Accept.Clear();
                client.DefaultRequestHeaders.Add("Authorization", "Basic " + Convert.ToBase64String(
                         Encoding.ASCII.GetBytes(
                            $"{_palV2Config?.ClientId}:{_palV2Config?.ClientSecret}")));
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return client;
        }
        [AllowAnonymous]
        [HttpPost]
        public async Task<object> CreateOrder([FromBody] ModelOrder order)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            if (!string.IsNullOrEmpty(order.Target))
            {
                _palV2Config = _paymentService.GetPayPalV2Config(email: order.Target);
            }
            if (_palV2Config == null || string.IsNullOrEmpty(_palV2Config.ClientId) || string.IsNullOrEmpty(_palV2Config.ClientSecret))
            {
                msg.Title = "Cổng thanh toán Paypal chưa được cài đặt trong hệ thống, vui lòng liên hệ quản trị viên";
                msg.Error = true;
                return Json(msg);
            }
            _accessToken = await GenerateAccessToken();
            HttpClientHandler handler = new HttpClientHandler() { UseDefaultCredentials = false };
            HttpClient client = new HttpClient(handler);
            var contents = "";
            try
            {
                var createOrderUrl = _palV2Config?.CreateOrderUrl ?? CreateOrderUrl;
                client.DefaultRequestHeaders.Accept.Clear();
                client.DefaultRequestHeaders.Add("Authorization", "Bearer " + _accessToken);
                var rawData = new
                {
                    intent = "CAPTURE",
                    purchase_units = order.Units
                };
                var postData = JsonConvert.SerializeObject(rawData);
                var content = new StringContent(postData, Encoding.UTF8, "application/json");
                HttpResponseMessage responseMessage = client.PostAsync(createOrderUrl, content).Result;
                contents = await responseMessage.Content.ReadAsStringAsync();
            }
            catch (Exception ex)
            {
                msg.Title = "Có lỗi xảy ra";
                msg.Error = true;
                return Json(msg);
            }
            msg.Object = contents;
            return Json(msg);
        }
        [AllowAnonymous]
        [HttpPost]
        public async Task<object> CaptureOrder(string orderId)
        {
            HttpClientHandler handler = new HttpClientHandler() { UseDefaultCredentials = false };
            HttpClient client = new HttpClient(handler);
            var contents = "";
            var captureOrderUrlFormat = _palV2Config?.CaptureOrderUrlFormat ?? CaptureOrderUrlFormat;
            var captureOrderUrl = string.Format(captureOrderUrlFormat, orderId);
            try
            {
                client.DefaultRequestHeaders.Accept.Clear();
                client.DefaultRequestHeaders.Add("Authorization", "Bearer " + _accessToken);
                var postData = "";
                var content = new StringContent(postData, Encoding.UTF8, "application/json");
                HttpResponseMessage responseMessage = client.PostAsync(captureOrderUrl, content).Result;
                contents = await responseMessage.Content.ReadAsStringAsync();
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return contents;
        }
        [AllowAnonymous]
        [HttpPost]
        public object SaveTransactionHistory([FromBody] PaypalTransactionHistory data)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                data.PaymentDate = DateTime.Now;
                //data.AspUserId = ESEIM.AppContext.UserId;
                var depositTransaction = new WalletDepositTransaction
                {
                    TransactionCode = data.TxnId,
                    TransactionType = "PAYPAL",
                    Type = data.PaymentType,
                    Amount = data.PaymentAmount,
                    Currency = data.PaymentCurrency,
                    TransactionLog = data.PaymentLog,
                    Status = data.PaymentStatus,
                    Coin = /*vnpAmount % 100 % 22000*/data.PaymentQuantity,
                    IsDeleted = false,
                    CreatedTime = DateTime.Now,
                    CreatedBy = ESEIM.AppContext.UserName,
                };
                _context.WalletDepositTransactions.Add(depositTransaction);
                _context.SaveChanges();
                msg.Title = "Lưu lại lịch sử thành công!";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = "Có lỗi xảy ra!";
            }
            return Json(msg);
        }
        // 
        //
        //  VNPAY
        //
        //
        [AllowAnonymous]
        [HttpPost]
        public object VnPayInPut(ModelPay obj, EventArgs e, int points, string target = "", string currency = "VND")
        {
            var msg = new JMessage() { Error = false, Title = "" };
            if (!string.IsNullOrEmpty(target))
            {
                _vnPayConfig = _paymentService.GetVnPayConfig(email: target);
            }
            if (_vnPayConfig == null || string.IsNullOrEmpty(_vnPayConfig.VnpTmnCode) || string.IsNullOrEmpty(_vnPayConfig.VnpHashSecret))
            {
                msg.Title = "Cổng thanh toán VnPay chưa được cài đặt trong hệ thống, vui lòng liên hệ quản trị viên";
                msg.Error = true;
                return Json(msg);
            }
            string vnpReturnUrl = _config.VnpReturnUrl; //URL nhan ket qua tra ve 
            string vnpUrl = _config.VnpUrl; //URL thanh toan cua VNPAY 
            string vnpTmnCode = _vnPayConfig.VnpTmnCode;                                      // ConfigurationManager.AppSettings["vnp_TmnCode"]; //Ma website
            string vnpHashSecret = _vnPayConfig.VnpHashSecret;           //ConfigurationManager.AppSettings["vnp_HashSecret"]; //Chuoi bi mat
            try
            {
                //Get payment input
                var order = new OrderInfo
                {
                    //Save order to db
                    OrderId = DateTime.Now.Ticks, // Giả lập mã giao dịch hệ thống merchant gửi sang VNPAY
                    Amount = points, // Giả lập số tiền thanh toán hệ thống merchant gửi sang VNPAY 100,000 VND
                    Status = "0", //0: Trạng thái thanh toán "chờ thanh toán" hoặc "Pending"
                    OrderDesc = "190002", //txtOrderDesc;
                    CreatedDate = DateTime.Now
                };
                var rate = _paymentService.GetRateFromCurrency(currency) ?? (decimal)1.0;
                var price = decimal.Truncate(points * rate);
                //Build URL for VNPAY
                VnPayLibrary vnpay = new VnPayLibrary();
                vnpay.AddRequestData("vnp_Version", VnPayLibrary.VERSION);
                vnpay.AddRequestData("vnp_Command", "pay");
                vnpay.AddRequestData("vnp_TmnCode", vnpTmnCode);
                vnpay.AddRequestData("vnp_Amount", (price * 100).ToString(CultureInfo.InvariantCulture)); //Số tiền thanh toán. Số tiền không mang các ký tự phân tách thập phân, phần nghìn, ký tự tiền tệ. Để gửi số tiền thanh toán là 100,000 VND (một trăm nghìn VNĐ) thì merchant cần nhân thêm 100 lần (khử phần thập phân), sau đó gửi sang VNPAY là: 10000000

                vnpay.AddRequestData("vnp_CreateDate", order.CreatedDate.ToString("yyyyMMddHHmmss"));
                vnpay.AddRequestData("vnp_CurrCode", currency);
                var ipAddress = HttpContext.Connection.RemoteIpAddress.ToString();
                vnpay.AddRequestData("vnp_IpAddr", ipAddress);

                vnpay.AddRequestData("vnp_Locale", "vn");
                vnpay.AddRequestData("vnp_OrderInfo", "Thanh toan don hang:" + order.OrderId);

                vnpay.AddRequestData("vnp_ReturnUrl", vnpReturnUrl);
                vnpay.AddRequestData("vnp_TxnRef", order.OrderId.ToString()); // Mã tham chiếu của giao dịch tại hệ thống của merchant. Mã này là duy nhất dùng để phân biệt các đơn hàng gửi sang VNPAY. Không được trùng lặp trong ngày
                order.PaymentUrl = vnpay.CreateRequestUrl(vnpUrl, vnpHashSecret);
                msg.Object = order;
                return Json(msg);
            }
            catch (Exception)
            {
                msg.Title = "Có lỗi xảy ra";
                msg.Error = true;
                return Json(msg);
            }
        }
        [AllowAnonymous]
        [HttpGet]
        public object VnPayOutPut(
            [FromQuery(Name = "vnp_amount")]
            decimal vnpAmount,
            [FromQuery(Name = "vnp_TransactionNo")]
            string vnpTransactionNo,
            [FromQuery(Name = "vnp_TransactionStatus")]
            string vnpTransactionStatus,
            [FromQuery(Name = "vnp_TxnRef")]
            string vnpTxnRef,
            [FromQuery(Name = "vnp_CardType")]
            string vnpCardType
            )
        {
            var rate = _paymentService.GetRateFromCurrency("VND") ?? (decimal)1.0;
            var depositTransaction = new WalletDepositTransaction
            {
                TransactionCode = vnpTransactionNo,
                TransactionType = "VNPAY",
                Type = vnpCardType,
                Amount = vnpAmount / 100,
                Currency = "VND",
                TransactionLog = vnpTxnRef,
                Status = vnpTransactionStatus,
                Coin = vnpAmount / (100 * rate),
                IsDeleted = false,
                CreatedTime = DateTime.Now,
                CreatedBy = ESEIM.AppContext.UserName,
            };

            _context.WalletDepositTransactions.Add(depositTransaction);
            _context.SaveChanges();

            AddPoints(depositTransaction.Coin);
            return Redirect("/Admin/Payment#history");
        }


        private static readonly ILog Log = LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod()?.DeclaringType);

        public class ModelPay
        {
            public long TotalAmount { get; set; }
        }

        public class ModelOrder
        {
            [JsonProperty(PropertyName = "purchase_units")]
            public List<ModelUnit> Units { get; set; }
            [JsonProperty(PropertyName = "target")]
            public string Target { get; set; }
        }
        public class ModelUnit
        {
            [JsonProperty(PropertyName = "amount")]
            public ModelAmount Amount { get; set; }
            [JsonProperty(PropertyName = "items")]
            public List<ModelItem> Items { get; set; }
        }
        public class ModelAmount
        {
            [JsonProperty(PropertyName = "currency_code")]
            public string CurrencyCode { get; set; }
            [JsonProperty(PropertyName = "value")]
            public string Value { get; set; }
            [JsonProperty(PropertyName = "breakdown")]
            public ModelAmountBreakdown Breakdown { get; set; }
        }
        public class ModelAmountBreakdown
        {
            [JsonProperty(PropertyName = "item_total")]
            public ModelItemTotal ItemTotal { get; set; }
        }
        public class ModelItemTotal
        {
            [JsonProperty(PropertyName = "currency_code")]
            public string CurrencyCode { get; set; }
            [JsonProperty(PropertyName = "value")]
            public string Value { get; set; }
        }
        public class ModelUnitAmount
        {
            [JsonProperty(PropertyName = "currency_code")]
            public string CurrencyCode { get; set; }
            [JsonProperty(PropertyName = "value")]
            public string Value { get; set; }
        }
        public class ModelItem
        {
            [JsonProperty(PropertyName = "name")]
            public string Name { get; set; }
            [JsonProperty(PropertyName = "unit_amount")]
            public ModelItemTotal UnitAmount { get; set; }
            [JsonProperty(PropertyName = "quantity")]
            public string Quantity { get; set; }
        }

        public class OrderInfo
        {
            public long OrderId { get; set; }
            public long Amount { get; set; }
            public string OrderDesc { get; set; }

            public DateTime CreatedDate { get; set; }
            public string Status { get; set; }

            public long PaymentTranId { get; set; }
            public string BankCode { get; set; }
            public string PayStatus { get; set; }
            public string PaymentUrl { get; set; }
        }
        public class ReturnInfo
        {
            public decimal Amount { get; set; }
            public DateTime CreateTime { get; set; }
            public string CreateBy { get; set; }
            public string Status { get; set; }
            public string Currency { get; set; }
            public string TransactionType { get; set; }
            public decimal Coin { get; set; }
            public string TransactionCode { get; set; }
        }
        //
        // MOMO
        //
        public class MoMoSecurity
        {
            private static RNGCryptoServiceProvider _rngCsp = new RNGCryptoServiceProvider();
            private static readonly log4net.ILog Log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod()?.DeclaringType);
            public MoMoSecurity()
            {
                //encrypt and decrypt password using secure
            }
            public string GetHash(string partnerCode, string merchantRefId,
                string amount, string paymentCode, string storeId, string storeName, string publicKeyXml)
            {
                string json = "{\"partnerCode\":\"" +
                    partnerCode + "\",\"partnerRefId\":\"" +
                    merchantRefId + "\",\"amount\":" +
                    amount + ",\"paymentCode\":\"" +
                    paymentCode + "\",\"storeId\":\"" +
                    storeId + "\",\"storeName\":\"" +
                    storeName + "\"}";
                Log.Debug("Raw hash: " + json);
                byte[] data = Encoding.UTF8.GetBytes(json);
                string result = null;
                using (var rsa = new RSACryptoServiceProvider(4096)) //KeySize
                {
                    try
                    {
                        // MoMo's public key has format PEM.
                        // You must convert it to XML format. Recommend tool: https://superdry.apphb.com/tools/online-rsa-key-converter
                        rsa.FromXmlString(publicKeyXml);
                        var encryptedData = rsa.Encrypt(data, false);
                        var base64Encrypted = Convert.ToBase64String(encryptedData);
                        result = base64Encrypted;
                    }
                    finally
                    {
                        rsa.PersistKeyInCsp = false;
                    }

                }

                return result;

            }
            public string BuildQueryHash(string partnerCode, string merchantRefId,
                string requestId, string publicKey)
            {
                string json = "{\"partnerCode\":\"" +
                    partnerCode + "\",\"partnerRefId\":\"" +
                    merchantRefId + "\",\"requestId\":\"" +
                    requestId + "\"}";
                Log.Debug("Raw hash: " + json);
                byte[] data = Encoding.UTF8.GetBytes(json);
                string result = null;
                using (var rsa = new RSACryptoServiceProvider(2048))
                {
                    try
                    {
                        // client encrypting data with public key issued by server
                        rsa.FromXmlString(publicKey);
                        var encryptedData = rsa.Encrypt(data, false);
                        var base64Encrypted = Convert.ToBase64String(encryptedData);
                        result = base64Encrypted;
                    }
                    finally
                    {
                        rsa.PersistKeyInCsp = false;
                    }

                }

                return result;

            }

            public string BuildRefundHash(string partnerCode, string merchantRefId,
                string momoTranId, long amount, string description, string publicKey)
            {
                string json = "{\"partnerCode\":\"" +
                    partnerCode + "\",\"partnerRefId\":\"" +
                    merchantRefId + "\",\"momoTransId\":\"" +
                    momoTranId + "\",\"amount\":" +
                    amount + ",\"description\":\"" +
                    description + "\"}";
                Log.Debug("Raw hash: " + json);
                byte[] data = Encoding.UTF8.GetBytes(json);
                string result = null;
                using (var rsa = new RSACryptoServiceProvider(2048))
                {
                    try
                    {
                        // client encrypting data with public key issued by server
                        rsa.FromXmlString(publicKey);
                        var encryptedData = rsa.Encrypt(data, false);
                        var base64Encrypted = Convert.ToBase64String(encryptedData);
                        result = base64Encrypted;
                    }
                    finally
                    {
                        rsa.PersistKeyInCsp = false;
                    }

                }

                return result;

            }
            public string SignSha256(string message, string key)
            {
                byte[] keyByte = Encoding.UTF8.GetBytes(key);
                byte[] messageBytes = Encoding.UTF8.GetBytes(message);
                using (var hmac256 = new HMACSHA256(keyByte))
                {
                    byte[] hashMessage = hmac256.ComputeHash(messageBytes);
                    string hex = BitConverter.ToString(hashMessage);
                    hex = hex.Replace("-", "").ToLower();
                    return hex;

                }
            }
        }

        class PaymentRequest
        {
            public PaymentRequest()
            {
            }
            public static string SendPaymentRequest(string endpoint, string postJsonString)
            {

                try
                {
                    HttpWebRequest httpWReq = (HttpWebRequest)WebRequest.Create(endpoint);

                    var postData = postJsonString;

                    var data = Encoding.UTF8.GetBytes(postData);

                    httpWReq.ProtocolVersion = HttpVersion.Version11;
                    httpWReq.Method = "POST";
                    httpWReq.ContentType = "application/json";

                    httpWReq.ContentLength = data.Length;
                    httpWReq.ReadWriteTimeout = 30000;
                    httpWReq.Timeout = 15000;
                    Stream stream = httpWReq.GetRequestStream();
                    stream.Write(data, 0, data.Length);
                    stream.Close();

                    HttpWebResponse response = (HttpWebResponse)httpWReq.GetResponse();

                    string jsonResponse = "";

                    using (var reader = new StreamReader(response.GetResponseStream() ?? throw new InvalidOperationException()))
                    {

                        string temp = null;
                        while ((temp = reader.ReadLine()) != null)
                        {
                            jsonResponse += temp;
                        }
                    }


                    //todo parse it
                    return jsonResponse;
                    //return new MomoResponse(mtid, jsonresponse);

                }
                catch (WebException e)
                {
                    return e.Message;
                }
            }
        }
        
        [AllowAnonymous]
        [HttpPost]
        public object MomoPay(object sender, EventArgs e, int points, string target = "", string currency = "VND")
        {
            var msg = new JMessage() { Error = false, Title = "" };
            //request params need to request to MoMo system
            // string endpoint = textEndpoint.Text.Equals("") ? "https://test-payment.momo.vn/v2/gateway/api/create" : textEndpoint.Text;
            if (!string.IsNullOrEmpty(target))
            {
                _momoV2Config = _paymentService.GetMomoV2Config(email: target);
            }
            if (_momoV2Config == null || string.IsNullOrEmpty(_momoV2Config.PartnerCode)
                                      || string.IsNullOrEmpty(_momoV2Config.AccessKey)
                                      || string.IsNullOrEmpty(_momoV2Config.SecretKey))
            {
                msg.Title = "Cổng thanh toán Momo chưa được cài đặt trong hệ thống, vui lòng liên hệ quản trị viên";
                msg.Error = true;
                return Json(msg);
            }
            try
            {
                var rate = _paymentService.GetRateFromCurrency(currency) ?? (decimal)1.0;
                var price = decimal.Truncate(points * rate);
                string endpoint = _config.MomoUrl; //URL nhan ket qua tra ve 
                string partnerCode = _momoV2Config.PartnerCode; // textPartnerCode.Text;
                string accessKey = _momoV2Config.AccessKey; //textAccessKey.Text;
                string secretKey = _momoV2Config.SecretKey;
                string orderInfo = "test";  //textOrderInfo.Text;
                string redirectUrl = _config.MomoReturnUrl; //textReturn.Text;
                string ipnUrl = _config.MomoReturnUrl; //textNotify.Text;
                string requestType = "captureWallet";

                //long amountLong = price;
                string str = price.ToString(CultureInfo.InvariantCulture);
                string amount = str;  //textAmount.Text; // Gía trị tiền 
                string orderId = Guid.NewGuid().ToString();
                string requestId = Guid.NewGuid().ToString();
                string extraData = "";

                //Before sign HMAC SHA256 signature
                string rawHash = "accessKey=" + accessKey +
                    "&amount=" + amount +
                    "&extraData=" + extraData +
                    "&ipnUrl=" + ipnUrl +
                    "&orderId=" + orderId +
                    "&orderInfo=" + orderInfo +
                    "&partnerCode=" + partnerCode +
                    "&redirectUrl=" + redirectUrl +
                    "&requestId=" + requestId +
                    "&requestType=" + requestType
                    ;

                Log.Debug("rawHash = " + rawHash);

                MoMoSecurity crypto = new MoMoSecurity();
                //sign signature SHA256
                string signature = crypto.SignSha256(rawHash, secretKey);
                Log.Debug("Signature = " + signature);

                //build body json request
                JObject message = new JObject
                {
                    { "partnerCode", partnerCode },
                    { "partnerName", "Test" },
                    { "storeId", "MomoTestStore" },
                    { "requestId", requestId },
                    { "amount", amount },
                    { "orderId", orderId },
                    { "orderInfo", orderInfo },
                    { "redirectUrl", redirectUrl },
                    { "ipnUrl", ipnUrl },
                    { "lang", "en" },
                    { "extraData", extraData },
                    { "requestType", requestType },
                    { "signature", signature }
                };
                Log.Debug("Json request to MoMo: " + message.ToString());
                string responseFromMomo = PaymentRequest.SendPaymentRequest(endpoint, message.ToString());
                // JObject jmessage = JObject.Parse(responseFromMomo);
                // System.Diagnostics.Process.Start(jmessage.GetValue("payUrl").ToString());

                /* log.Debug("Return from MoMo: " + jmessage.ToString());
                 DialogResult result = MessageBox.Show(responseFromMomo, "Open in browser", MessageBoxButtons.OKCancel);
                 if (result == DialogResult.OK)
                 {
                     //yes...

                 }
                 else if (result == DialogResult.Cancel)
                 {
                     //no...
                 }*/
                msg.Object = responseFromMomo;
                return Json(msg);
            }
            catch (Exception)
            {
                msg.Title = "Có lỗi xảy ra";
                msg.Error = true;
                return Json(msg);
            }
        }
        
        [AllowAnonymous]
        [HttpGet]
        public object MomoOutPut(string orderId, decimal amount, string message, string orderType, string transId)
        {
            var rate = _paymentService.GetRateFromCurrency("VND") ?? (decimal)1.0;
            var depositTransaction = new WalletDepositTransaction
            {
                TransactionCode = orderId,
                TransactionType = "MOMOPAY",
                Type = orderType,
                Amount = amount,
                Currency = "VND",
                TransactionLog = transId,
                Status = message,
                Coin = amount / rate,
                IsDeleted = false,
                CreatedTime = DateTime.Now,
                CreatedBy = ESEIM.AppContext.UserName,
            };

            _context.WalletDepositTransactions.Add(depositTransaction);
            _context.SaveChanges();

            AddPoints(depositTransaction.Coin);
            return Redirect("/Admin/Payment#history");
        }
        #region newpaymennt metalearn

        /// Add Point
        [AllowAnonymous]
        [HttpPost]
        public object NewAddPoints(decimal points, string username)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var id = ESEIM.AppContext.UserId;
                var user = _context.Users.FirstOrDefault(x => x.UserName == username);
                if (user == null)
                {
                    msg.Error = true;
                    msg.Title = "Không tìm thấy người dùng!";
                    return Json(msg);
                }

                if (user.Balance.HasValue)
                {
                    user.Balance += points;
                }
                else
                {
                    user.Balance = points;
                }
                _context.Users.Update(user);
                _context.SaveChanges();
                msg.Title = "Thêm điểm thành công!";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = "Có lỗi khi thêm điểm!";
            }
            return Json(msg);
        }

        ///// MOMO //////
        [AllowAnonymous]
        [HttpPost]
        public object NewMomoPay(object sender, EventArgs e, string username, int points, string target = "", string currency = "VND")
        {
            var msg = new JMessage() { Error = false, Title = "" };
            //request params need to request to MoMo system
            // string endpoint = textEndpoint.Text.Equals("") ? "https://test-payment.momo.vn/v2/gateway/api/create" : textEndpoint.Text;
            if (!string.IsNullOrEmpty(target))
            {
                _momoV2Config = _paymentService.GetMomoV2Config(email: target);
            }
            if (_momoV2Config == null || string.IsNullOrEmpty(_momoV2Config.PartnerCode)
                                      || string.IsNullOrEmpty(_momoV2Config.AccessKey)
                                      || string.IsNullOrEmpty(_momoV2Config.SecretKey))
            {
                msg.Title = "Cổng thanh toán Momo chưa được cài đặt trong hệ thống, vui lòng liên hệ quản trị viên";
                msg.Error = true;
                return Json(msg);
            }
            try
            {
                var rate = _paymentService.GetRateFromCurrency(currency) ?? (decimal)1.0;
                var price = decimal.Truncate(points * rate);
                string endpoint = _config.MomoUrl; //URL nhan ket qua tra ve
                string partnerCode = _momoV2Config.PartnerCode; // textPartnerCode.Text;
                string accessKey = _momoV2Config.AccessKey; //textAccessKey.Text;
                string secretKey = _momoV2Config.SecretKey;
                string orderInfo = username;  //textOrderInfo.Text;
                string redirectUrl = $"{_appSettings.UrlProd}/Admin/Payment/NewMomoOutPut";//_config.MomoReturnUrl; //textReturn.Text;
                string ipnUrl = $"{_appSettings.UrlProd}/Admin/Payment/NewMomoOutPut";//_config.MomoReturnUrl; //textNotify.Text;
                string requestType = "captureWallet";

                //long amountLong = price;
                string str = price.ToString(CultureInfo.InvariantCulture);
                string amount = str;  //textAmount.Text; // Gía trị tiền
                string orderId = Guid.NewGuid().ToString();
                string requestId = Guid.NewGuid().ToString();
                string extraData = "";

                //Before sign HMAC SHA256 signature
                string rawHash = "accessKey=" + accessKey +
                    "&amount=" + amount +
                    "&extraData=" + extraData +
                    "&ipnUrl=" + ipnUrl +
                    "&orderId=" + orderId +
                    "&orderInfo=" + orderInfo +
                    "&partnerCode=" + partnerCode +
                    "&redirectUrl=" + redirectUrl +
                    "&requestId=" + requestId +
                    "&requestType=" + requestType
                    ;

                Log.Debug("rawHash = " + rawHash);

                MoMoSecurity crypto = new MoMoSecurity();
                //sign signature SHA256
                string signature = crypto.SignSha256(rawHash, secretKey);
                Log.Debug("Signature = " + signature);

                //build body json request
                JObject message = new JObject
                {
                    { "partnerCode", partnerCode },
                    { "partnerName", "Test" },
                    { "storeId", "MomoTestStore" },
                    { "requestId", requestId },
                    { "amount", amount },
                    { "orderId", orderId },
                    { "orderInfo", orderInfo },
                    { "redirectUrl", redirectUrl },
                    { "ipnUrl", ipnUrl },
                    { "lang", "en" },
                    { "extraData", extraData },
                    { "requestType", requestType },
                    { "signature", signature }
                };
                Log.Debug("Json request to MoMo: " + message.ToString());
                string responseFromMomo = PaymentRequest.SendPaymentRequest(endpoint, message.ToString());
                msg.Object = responseFromMomo;
                return Json(msg);
            }
            catch (Exception)
            {
                msg.Title = "Có lỗi xảy ra";
                msg.Error = true;
                return Json(msg);
            }
        }

        [AllowAnonymous]
        [HttpGet]
        public object NewMomoOutPut(string orderId, decimal amount, string message, string orderType, string transId, string orderInfo)
        {
            var rate = _paymentService.GetRateFromCurrency("VND") ?? (decimal)1.0;
            var depositTransaction = new WalletDepositTransaction
            {
                TransactionCode = orderId,
                TransactionType = "MOMOPAY",
                Type = orderType,
                Amount = amount,
                Currency = "VND",
                TransactionLog = transId,
                Status = message,
                Coin = amount / rate,
                IsDeleted = false,
                CreatedTime = DateTime.Now,
                CreatedBy = ESEIM.AppContext.UserName,
            };
            var username = orderInfo;
            _context.WalletDepositTransactions.Add(depositTransaction);
            _context.SaveChanges();

            NewAddPoints(depositTransaction.Coin, username);
            return Redirect("/Admin/Payment#history");
        }

        ///// VnPay //////
        [AllowAnonymous]
        [HttpPost]
        public object NewVnPayInPut(ModelPay obj, EventArgs e, string username, int points, string target = "", string currency = "VND")
        {
            var msg = new JMessage() { Error = false, Title = "" };
            if (!string.IsNullOrEmpty(target))
            {
                _vnPayConfig = _paymentService.GetVnPayConfig(email: target);
            }
            if (_vnPayConfig == null || string.IsNullOrEmpty(_vnPayConfig.VnpTmnCode) || string.IsNullOrEmpty(_vnPayConfig.VnpHashSecret))
            {
                msg.Title = "Cổng thanh toán VnPay chưa được cài đặt trong hệ thống, vui lòng liên hệ quản trị viên";
                msg.Error = true;
                return Json(msg);
            }
            string vnpReturnUrl = $"{_appSettings.UrlProd}/Admin/Payment/NewVNPayOutPut";//_config.VnpReturnUrl; //URL nhan ket qua tra ve
            string vnpUrl = _config.VnpUrl; //URL thanh toan cua VNPAY
            string vnpTmnCode = _vnPayConfig.VnpTmnCode;                                      // ConfigurationManager.AppSettings["vnp_TmnCode"]; //Ma website
            string vnpHashSecret = _vnPayConfig.VnpHashSecret;           //ConfigurationManager.AppSettings["vnp_HashSecret"]; //Chuoi bi mat
            try
            {
                //Get payment input
                var order = new OrderInfo
                {
                    //Save order to db
                    OrderId = DateTime.Now.Ticks, // Giả lập mã giao dịch hệ thống merchant gửi sang VNPAY
                    Amount = points, // Giả lập số tiền thanh toán hệ thống merchant gửi sang VNPAY 100,000 VND
                    Status = "0", //0: Trạng thái thanh toán "chờ thanh toán" hoặc "Pending"
                    OrderDesc = "190002", //txtOrderDesc;
                    CreatedDate = DateTime.Now
                };
                var rate = _paymentService.GetRateFromCurrency(currency) ?? (decimal)1.0;
                var price = decimal.Truncate(points * rate);
                //Build URL for VNPAY
                VnPayLibrary vnpay = new VnPayLibrary();
                vnpay.AddRequestData("vnp_Version", VnPayLibrary.VERSION);
                vnpay.AddRequestData("vnp_Command", "pay");
                vnpay.AddRequestData("vnp_TmnCode", vnpTmnCode);
                vnpay.AddRequestData("vnp_Amount", (price * 100).ToString(CultureInfo.InvariantCulture)); //Số tiền thanh toán. Số tiền không mang các ký tự phân tách thập phân, phần nghìn, ký tự tiền tệ. Để gửi số tiền thanh toán là 100,000 VND (một trăm nghìn VNĐ) thì merchant cần nhân thêm 100 lần (khử phần thập phân), sau đó gửi sang VNPAY là: 10000000

                vnpay.AddRequestData("vnp_CreateDate", order.CreatedDate.ToString("yyyyMMddHHmmss"));
                vnpay.AddRequestData("vnp_CurrCode", currency);
                var ipAddress = HttpContext.Connection.RemoteIpAddress.ToString();
                vnpay.AddRequestData("vnp_IpAddr", ipAddress);

                vnpay.AddRequestData("vnp_Locale", "vn");
                vnpay.AddRequestData("vnp_OrderInfo", username);

                vnpay.AddRequestData("vnp_ReturnUrl", vnpReturnUrl);
                vnpay.AddRequestData("vnp_TxnRef", order.OrderId.ToString()); // Mã tham chiếu của giao dịch tại hệ thống của merchant. Mã này là duy nhất dùng để phân biệt các đơn hàng gửi sang VNPAY. Không được trùng lặp trong ngày
                order.PaymentUrl = vnpay.CreateRequestUrl(vnpUrl, vnpHashSecret);
                msg.Object = order;
                return Json(msg);
            }
            catch (Exception)
            {
                msg.Title = "Có lỗi xảy ra";
                msg.Error = true;
                return Json(msg);
            }
        }

        [AllowAnonymous]
        [HttpGet]
        public object NewVnPayOutPut(
            [FromQuery(Name = "vnp_amount")]
            decimal vnpAmount,
            [FromQuery(Name = "vnp_TransactionNo")]
            string vnpTransactionNo,
            [FromQuery(Name = "vnp_TransactionStatus")]
            string vnpTransactionStatus,
            [FromQuery(Name = "vnp_TxnRef")]
            string vnpTxnRef,
            [FromQuery(Name = "vnp_CardType")]
            string vnpCardType,
            [FromQuery(Name = "vnp_OrderInfo")]
            string username
            )
        {
            var rate = _paymentService.GetRateFromCurrency("VND") ?? (decimal)1.0;
            var depositTransaction = new WalletDepositTransaction
            {
                TransactionCode = vnpTransactionNo,
                TransactionType = "VNPAY",
                Type = vnpCardType,
                Amount = vnpAmount / 100,
                Currency = "VND",
                TransactionLog = vnpTxnRef,
                Status = vnpTransactionStatus,
                Coin = vnpAmount / (100 * rate),
                IsDeleted = false,
                CreatedTime = DateTime.Now,
                CreatedBy = ESEIM.AppContext.UserName,
            };

            _context.WalletDepositTransactions.Add(depositTransaction);
            _context.SaveChanges();

            NewAddPoints(depositTransaction.Coin, username);
            return Redirect("/Admin/Payment#history");
        }

        //////// Paypal ///////////
        [AllowAnonymous]
        [HttpPost]
        public async Task<object> NewCreateOrder([FromBody] ModelOrder order)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            if (!string.IsNullOrEmpty(order.Target))
            {
                _palV2Config = _paymentService.GetPayPalV2Config(email: order.Target);
            }
            if (_palV2Config == null || string.IsNullOrEmpty(_palV2Config.ClientId) || string.IsNullOrEmpty(_palV2Config.ClientSecret))
            {
                msg.Title = "Cổng thanh toán Paypal chưa được cài đặt trong hệ thống, vui lòng liên hệ quản trị viên";
                msg.Error = true;
                return Json(msg);
            }
            _accessToken = await GenerateAccessToken();
            HttpClientHandler handler = new HttpClientHandler() { UseDefaultCredentials = false };
            HttpClient client = new HttpClient(handler);
            var contents = "";
            try
            {
                var createOrderUrl = _palV2Config?.CreateOrderUrl ?? CreateOrderUrl;
                client.DefaultRequestHeaders.Accept.Clear();
                client.DefaultRequestHeaders.Add("Authorization", "Bearer " + _accessToken);
                var rawData = new
                {
                    intent = "CAPTURE",
                    purchase_units = order.Units
                };
                var postData = JsonConvert.SerializeObject(rawData);
                var content = new StringContent(postData, Encoding.UTF8, "application/json");
                HttpResponseMessage responseMessage = client.PostAsync(createOrderUrl, content).Result;
                contents = await responseMessage.Content.ReadAsStringAsync();
            }
            catch (Exception ex)
            {
                msg.Title = "Có lỗi xảy ra";
                msg.Error = true;
                return Json(msg);
            }
            msg.Object = contents;
            return Json(msg);
        }

        [AllowAnonymous]
        [HttpPost]
        public async Task<object> NewCaptureOrder(string orderId)
        {
            HttpClientHandler handler = new HttpClientHandler() { UseDefaultCredentials = false };
            HttpClient client = new HttpClient(handler);
            var contents = "";
            var captureOrderUrlFormat = _palV2Config?.CaptureOrderUrlFormat ?? CaptureOrderUrlFormat;
            var captureOrderUrl = string.Format(captureOrderUrlFormat, orderId);
            try
            {
                client.DefaultRequestHeaders.Accept.Clear();
                client.DefaultRequestHeaders.Add("Authorization", "Bearer " + _accessToken);
                var postData = "";
                var content = new StringContent(postData, Encoding.UTF8, "application/json");
                HttpResponseMessage responseMessage = client.PostAsync(captureOrderUrl, content).Result;
                contents = await responseMessage.Content.ReadAsStringAsync();
                // var data = JsonConvert.DeserializeObject<List<PaymentPaypal>>(contents["payer"]);
                //JObject objJson = JObject.Parse(contents);
                //var emails = objJson["payment_source"]["paypal"]["email_address"].ToString();
                //Console.WriteLine(emails);
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return contents;
        }
        public class PaypalTransaction
        {
            public string TransactionCode { get; set; }
            public string TransactionType { get; set; }
            public string Type { get; set; }
            public decimal Amount { get; set; }
            public string TransactionLog { get; set; }
            public string Status { get; set; }
            public decimal Coin { get; set; }
            public string CreatedBy { get; set; }
        }

        [AllowAnonymous]
        [HttpPost]
        public object NewSaveTransactionHistory([FromBody] PaypalTransaction obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                //data.PaymentDate = DateTime.Now;
                //data.AspUserId = ESEIM.AppContext.UserId;
                var depositTransaction = new WalletDepositTransaction
                {
                    TransactionCode = obj.TransactionCode,
                    TransactionType = obj.TransactionType,
                    Type = obj.Type,
                    Amount = obj.Amount,
                    Currency = "USD",
                    TransactionLog = obj.TransactionLog,
                    Status = obj.Status,
                    Coin = obj.Coin,
                    IsDeleted = false,
                    CreatedTime = DateTime.Now,
                    CreatedBy = obj.CreatedBy,
                };
                _context.WalletDepositTransactions.Add(depositTransaction);
                _context.SaveChanges();
                msg.Title = "Lưu lại lịch sử thành công!";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = "Có lỗi xảy ra!";
            }
            return Json(msg);
        }

        public static string StripeProductId = "";
        public static string StripePriceId = "";
        [HttpPost]
        public object StripeInput(ModelPay obj, EventArgs e, int points, string target = "")
        {
            var msg = new JMessage() { Error = false, Title = "" };
            if (!string.IsNullOrEmpty(target))
            {
                _stripeConfig = _paymentService.GetStripeConfig(email: target);
            }
            if (_stripeConfig == null || string.IsNullOrEmpty(_stripeConfig.ApiKey))
            {
                msg.Title = "Cổng thanh toán Zalo chưa được cài đặt trong hệ thống, vui lòng liên hệ quản trị viên";
                msg.Error = true;
                return Json(msg);
            }
            try
            {
                StripeConfiguration.ApiKey = _stripeConfig.ApiKey;
                var product = new Product();
                var price = new Price();
                if (string.IsNullOrEmpty(StripeProductId))
                {
                    var productCreateOptions = new ProductCreateOptions
                    {
                        Name = "Points",
                    };
                    var productService = new ProductService();
                    product = productService.Create(productCreateOptions);
                    StripeProductId = product.Id;
                }
                //else
                //{
                //    var productService = new ProductService();
                //    product = productService.Get(StripeProductId);
                //}
                if (string.IsNullOrEmpty(StripePriceId))
                {
                    var priceCreateOptions = new PriceCreateOptions
                    {
                        UnitAmount = 100,
                        Currency = "usd",
                        //Recurring = new PriceRecurringOptions
                        //{
                        //    Interval = "month",
                        //},
                        Product = StripeProductId,
                    };
                    var priceService = new PriceService();
                    price = priceService.Create(priceCreateOptions);
                    StripePriceId = price.Id;
                }
                var options = new SessionCreateOptions
                {
                    SuccessUrl = "https://example.com/success",
                    CancelUrl = "https://example.com/cancel",
                    LineItems = new List<SessionLineItemOptions>
                {
                    new SessionLineItemOptions
                    {
                        Price = StripePriceId,
                        Quantity = points,
                    },
                },
                    Mode = "payment",
                };
                var service = new SessionService();
                var result = service.Create(options);
                msg.Object = result;
                return Json(msg);
            }
            catch (Exception)
            {
                msg.Title = "Có lỗi xảy ra";
                msg.Error = true;
                return Json(msg);
            }
        }
        #endregion newpaymennt metalearn
        #region History
        
        public class JtableDepositHistory : JTableModel
        {
            public string TransactionType { get; set; }
            public string MoneyFrom { get; set; }
            public string MoneyTo { get; set; }
            public string Currency { get; set; }
            public string Status { get; set; }
            public string Customer { get; set; }

        }
        // JTable WalletDepositTransaction
        [AllowAnonymous]
        [HttpPost]
        public object JTableHistory([FromBody] JtableDepositHistory jTablePara)
        {
            try
            {
                var session = HttpContext.GetSessionUser();
                var user = _context.Users.FirstOrDefault(x => x.Active && x.UserName == ESEIM.AppContext.UserName);
                int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
                var fromDate = string.IsNullOrEmpty(jTablePara.StartTime) ? (DateTime?)null : DateTime.ParseExact(jTablePara.StartTime, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                var toDate = string.IsNullOrEmpty(jTablePara.EndTime) ? (DateTime?)null : DateTime.ParseExact(jTablePara.EndTime, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                // Way 1 using Where
                //&& (string.IsNullOrEmpty(jTablePara.TransactionCode) || x.TransactionCode.Contains(jTablePara.TransactionCode))
                var data = _context.WalletDepositTransactions
                    .Where(x => x.IsDeleted == false
                    && (string.IsNullOrEmpty(jTablePara.TransactionType) || x.TransactionType == jTablePara.TransactionType)
                    && (fromDate == null || x.CreatedTime >= fromDate) && (toDate == null || x.CreatedTime <= toDate)
                    && x.CreatedBy == session.UserName
                    )
                    .Select(
                        x => new
                        {
                            x.ID,
                            x.TransactionCode,
                            x.TransactionType,
                            x.Type,
                            x.Amount,
                            x.Currency,
                            x.TransactionLog,
                            x.Coin,
                            x.CreatedTime,
                        });
                var count = data.Count();
                var result = data.OrderByDescending(x => x.ID).Skip(intBeginFor).Take(jTablePara.Length).ToList();
                var jObject = JTableHelper.JObjectTable(result, jTablePara.Draw, count, "ID", "TransactionCode", "TransactionType", "Type", "Coin", "Amount", "Currency", "TransactionLog", "CreatedTime");
                return Json(jObject);
            }
            catch (Exception ex)
            {
                var jdata = JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "ID", "TransactionCode", "TransactionType", "Type", "Coin", "Amount", "Currency", "TransactionLog", "CreatedTime");
                return Json(jdata);
            }
        }
        #endregion

        [HttpPost]
        public object JTable([FromBody] JtableDepositHistory jTablePara)
        {
            try
            {
                int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
                
                var data = FuncTransactionJTable(jTablePara);

                var count = data.Count();
                var result = data.OrderByDescending(x => x.Id).Skip(intBeginFor).Take(jTablePara.Length).ToList();
                var jObject = JTableHelper.JObjectTable(result, jTablePara.Draw, count, "Id", "TransactionCode", "TransactionType", "ItemCode",
                   "ItemType", "Type", "Coin", "GivenName", "CreatedBy", "Amount", "Currency", "TransactionCoinLog", "Status", "CreatedTime");
                return Json(jObject);
            }
            catch (Exception ex)
            {
                var jdata = JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "Id", "TransactionCode", "TransactionType", "ItemCode",
                   "ItemType", "Type", "Coin", "GivenName", "CreatedBy", "Amount", "Currency", "TransactionCoinLog", "Status", "CreatedTime"); 
                return Json(jdata);
            }
        }

        [NonAction]
        public IQueryable<ModelHistoryPayment> FuncTransactionJTable(JtableDepositHistory jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var fromDate = string.IsNullOrEmpty(jTablePara.StartTime) ? (DateTime?)null : DateTime.ParseExact(jTablePara.StartTime, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var toDate = string.IsNullOrEmpty(jTablePara.EndTime) ? (DateTime?)null : DateTime.ParseExact(jTablePara.EndTime, "dd/MM/yyyy", CultureInfo.InvariantCulture);

            var data = (from a in _context.WalletCoinTransactions
                            .Where(x => x.IsDeleted == false
                            && (string.IsNullOrEmpty(jTablePara.TransactionType) || x.TransactionType == jTablePara.TransactionType)
                             && (string.IsNullOrEmpty(jTablePara.MoneyFrom) || x.Amount >= Decimal.Parse(jTablePara.MoneyFrom))
                             && (string.IsNullOrEmpty(jTablePara.MoneyTo) || x.Amount <= Decimal.Parse(jTablePara.MoneyTo))
                              && (string.IsNullOrEmpty(jTablePara.Currency) || x.Currency == jTablePara.Currency)
                              && (string.IsNullOrEmpty(jTablePara.Status) || x.Status == jTablePara.Status)
                               && (fromDate == null || x.CreatedTime >= fromDate) && (toDate == null || x.CreatedTime <= toDate)
                            )
                        join b in _context.Users on a.CreatedBy equals b.UserName into b1
                        join d in _context.CommonSettings.Where(x => x.Group.Equals("PAYMENT_TYPE") &&
                            x.IsDeleted == false) on a.TransactionType equals d.CodeSet
                        join e in _context.CommonSettings.Where(x => x.Group.Equals("CURRENCY_TYPE") &&
                            x.IsDeleted == false) on a.Currency equals e.CodeSet
                        from b in b1.DefaultIfEmpty()
                        where string.IsNullOrEmpty(jTablePara.Customer) || b.GivenName.Contains(jTablePara.Customer)
                        select new ModelHistoryPayment
                        {
                            Id = a.Id,
                            TransactionCode = a.TransactionCode,
                            TransactionType = d.ValueSet,
                            ItemCode = a.ItemCode,
                            ItemType = a.ItemType,
                            Type = a.Type,
                            Amount = a.Amount,
                            Currency = e.ValueSet,
                            TransactionCoinLo = a.TransactionCoinLog,
                            Coin = a.Coin,
                            CreatedTime = a.CreatedTime,
                            CreatedBy = a.CreatedBy,
                            Status = a.Status,
                            GivenName = b != null ? b.GivenName : "",
                        });
                       
            return data;
        }
        
        [HttpGet]
        public ActionResult ExportExcel(string TransactionType, string MoneyFrom, string MoneyTo, string Currency, 
            string Status, string StartTime, string EndTime, string Customer)
        {
            var jTablePara = new JtableDepositHistory();
            jTablePara.TransactionType = TransactionType;
            jTablePara.MoneyFrom = MoneyFrom;
            jTablePara.MoneyTo = MoneyTo;
            jTablePara.Currency = Currency;
            jTablePara.Status = Status;
            jTablePara.StartTime = StartTime;
            jTablePara.EndTime = EndTime;
            jTablePara.Customer = Customer;

            var data = FuncTransactionJTable(jTablePara);

            var listData =(from a in data
                           join c in _context.CommonSettings.Where(x => x.Group.Equals("HISTORY_PAYMENT_STATUS") &&
                               x.IsDeleted == false) on a.Status equals c.CodeSet
                           select new TransactionModelExcel
            {
                GivenName = a.GivenName,
                Amount = a.Amount,
                Currency = a.Currency,
                Coin = a.Coin,
                TransactionType = a.TransactionType,
                Type = a.Type,
                CreatedTime = a.CreatedTime.ToString(),
                Status = c.ValueSet
            }).ToList();

            var listExport = new List<TransactionModelExcel>();
            var no = 1;
            foreach (var item in listData)
            {
                var itemExport = new TransactionModelExcel();

                itemExport.No = no;
                itemExport.GivenName = item.GivenName;
                itemExport.Amount = item.Amount;
                itemExport.Currency = item.Currency;
                itemExport.Coin = item.Coin;
                itemExport.TransactionType = item.TransactionType;
                itemExport.Type = item.Type;
                itemExport.CreatedTime = item.CreatedTime;
                itemExport.Status = item.Status;

                no = no + 1;
                listExport.Add(itemExport);
            }
            ExcelEngine excelEngine = new ExcelEngine();
            IApplication application = excelEngine.Excel;
            application.DefaultVersion = ExcelVersion.Excel2016;
            IWorkbook workbook = application.Workbooks.Create(1);
            workbook.Version = ExcelVersion.Excel2016;
            IWorksheet sheetRequest = workbook.Worksheets.Create("Lich-su-thanh-toan");
            workbook.Worksheets[0].Remove();
            IMigrantRange migrantRange = workbook.Worksheets[0].MigrantRange;

            sheetRequest.Range["A1"].ColumnWidth = 24;
            sheetRequest.Range["B1"].ColumnWidth = 24;
            sheetRequest.Range["C1"].ColumnWidth = 24;
            sheetRequest.Range["D1"].ColumnWidth = 24;
            sheetRequest.Range["E1"].ColumnWidth = 24;
            sheetRequest.Range["F1"].ColumnWidth = 24;
            sheetRequest.Range["G1"].ColumnWidth = 24;
            sheetRequest.Range["H1"].ColumnWidth = 24;
            sheetRequest.Range["I1"].ColumnWidth = 24;

            sheetRequest.Range["A1:I1"].Merge(true);

            sheetRequest.Range["A1"].Text = "Lịch sử thanh toán";
            sheetRequest.Range["A1"].CellStyle.Font.FontName = "Calibri";
            sheetRequest.Range["A1"].CellStyle.Font.Bold = true;
            sheetRequest.Range["A1"].CellStyle.Font.Size = 24;
            sheetRequest.Range["A1"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.ImportData(listExport, 2, 1, true);

            sheetRequest["A2"].Text = "TT";
            sheetRequest["B2"].Text = "NGƯỜI THANH TOÁN";
            sheetRequest["C2"].Text = "GIÁ TIỀN";
            sheetRequest["D2"].Text = "ĐƠN VỊ";
            sheetRequest["E2"].Text = "COIN";
            sheetRequest["F2"].Text = "KIỂU THANH TOÁN";
            sheetRequest["G2"].Text = "HÌNH THỨC THANH TOÁN";
            sheetRequest["H2"].Text ="THỜI GIAN THANH TOÁN";
            sheetRequest["I2"].Text = "TRẠNG THÁI";

            IStyle tableHeader = workbook.Styles.Add("TableHeaderStyle");
            tableHeader.Font.Color = ExcelKnownColors.White;
            tableHeader.Font.Bold = true;
            tableHeader.Font.Size = 11;
            tableHeader.Font.FontName = "Calibri";
            tableHeader.HorizontalAlignment = ExcelHAlign.HAlignCenter;
            tableHeader.VerticalAlignment = ExcelVAlign.VAlignCenter;
            tableHeader.Color = Color.FromArgb(0, 0, 122, 192);
            tableHeader.Borders[ExcelBordersIndex.EdgeLeft].LineStyle = ExcelLineStyle.None;
            tableHeader.Borders[ExcelBordersIndex.EdgeRight].LineStyle = ExcelLineStyle.None;
            tableHeader.Borders[ExcelBordersIndex.EdgeTop].LineStyle = ExcelLineStyle.None;
            tableHeader.Borders[ExcelBordersIndex.EdgeBottom].LineStyle = ExcelLineStyle.None;
            tableHeader.Borders[ExcelBordersIndex.EdgeBottom].LineStyle = ExcelLineStyle.None;
            sheetRequest["A2:I2"].CellStyle = tableHeader;
            sheetRequest.Range["A2:I2"].RowHeight = 20;
            sheetRequest.UsedRange.AutofitColumns();

            string ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            var fileName = "Lich-su-thanh-toan" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".xls";
            MemoryStream ms = new MemoryStream();
            workbook.SaveAs(ms);
            workbook.Close();
            excelEngine.Dispose();
            ms.Position = 0;
            return File(ms, ContentType, fileName);
        }

        [HttpGet]
        public IActionResult ExportPdf(string TransactionType, string MoneyFrom, string MoneyTo, string Currency,
            string Status, string StartTime, string EndTime, string Customer)
        {
            var jTablePara = new JtableDepositHistory();
            jTablePara.TransactionType = TransactionType;
            jTablePara.MoneyFrom = MoneyFrom;
            jTablePara.MoneyTo = MoneyTo;
            jTablePara.Currency = Currency;
            jTablePara.Status = Status;
            jTablePara.StartTime = StartTime;
            jTablePara.EndTime = EndTime;
            jTablePara.Customer = Customer;

            var data = FuncTransactionJTable(jTablePara);

            var listData = (from a in data
                            join c in _context.CommonSettings.Where(x => x.Group.Equals("HISTORY_PAYMENT_STATUS") &&
                                x.IsDeleted == false) on a.Status equals c.CodeSet
                            select new TransactionModelExcel
                            {
                                No=a.Id,
                                GivenName = a.GivenName,
                                Amount = a.Amount,
                                Currency = a.Currency,
                                Coin = a.Coin,
                                TransactionType = a.TransactionType,
                                Type = a.Type,
                                CreatedTime = a.CreatedTime.GetValueOrDefault().ToShortDateString(),
                                Status = c.ValueSet,
                            }).ToList();

            // Sắp xếp kết quả
            var sortedQuery = listData.OrderByDescending(a => a.No);
            var results = sortedQuery.ToList();

            // Gọi hàm GeneratePdf để tạo tệp PDF
            byte[] pdfData = GeneratePdf(results);

            // Trả về tệp PDF
            string ContentType = "application/pdf";
            var fileName = "LichSuThanhToan" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".pdf";
            return File(pdfData, ContentType, fileName);
        }

        public byte[] GeneratePdf(List<TransactionModelExcel> data)
        {
            PdfSharp.Pdf.PdfDocument document = new PdfSharp.Pdf.PdfDocument();

            // Tạo một trang mới
            PdfSharp.Pdf.PdfPage page = document.AddPage();

            // Tạo đối tượng XGraphics để vẽ trên trang
            PdfSharp.Drawing.XGraphics gfx = PdfSharp.Drawing.XGraphics.FromPdfPage(page)
        ;

            // Tạo một font Unicode cho văn bản
            PdfSharp.Drawing.XFont font = new PdfSharp.Drawing.XFont("Arial Unicode MS", 10, PdfSharp.Drawing.XFontStyle.Regular);

            // Kích thước bảng và số hàng cột
            int rowCount = data.Count;
            int columnCount = 9;
            double tableX = 40;
            double tableY = 50;
            double tableWidth = page.Width - 80;
            double cellMargin = 3;
            double rowHeight = 30;

            // Số lượng dòng cần xuống dòng
            int linesPerPage = (int)((page.Height - tableY) / rowHeight);

            // Vẽ label
            string[] label = { "TT", "Name", "Amount", "Currency", "Coin", "PType", "Type", "Ptime", "Status" };
            for (int col = 0; col < label.Length; col++)
            {
                PdfSharp.Drawing.XRect cellRect = new PdfSharp.Drawing.XRect(tableX + col * (tableWidth / columnCount), tableY, tableWidth / columnCount, rowHeight);
                gfx.DrawRectangle(PdfSharp.Drawing.XPens.Black, cellRect);
                gfx.DrawString(label[col], font, PdfSharp.Drawing.XBrushes.Black, cellRect, PdfSharp.Drawing.XStringFormats.Center);
            }

            // Thêm dòng trắng giữa dòng đề mục và bảng dữ liệu
            tableY += rowHeight;

            // Vẽ các ô và định dạng nội dung
            int row = 0;
            double h = tableY;
            foreach (var item in data)
            {
                if (row >= linesPerPage -2)
                {
                    // Nếu đã vượt quá số lượng dòng trên trang, thêm trang mới
                    page = document.AddPage();
                    gfx = PdfSharp.Drawing.XGraphics.FromPdfPage(page)
        ;
                    h = tableY; // Đặt lại giá trị h
                    row = 0;
                }

                int col = 0;
                row++;

                // Chạy qua các thuộc tính của TransactionModelExcel
                foreach (var field in typeof(TransactionModelExcel).GetProperties())
                {
                    var fieldValue = field.GetValue(item)?.ToString();
                    PdfSharp.Drawing.XRect cellRect = new PdfSharp.Drawing.XRect(tableX + col * (tableWidth / columnCount), h, tableWidth / columnCount, rowHeight);
                    gfx.DrawRectangle(PdfSharp.Drawing.XPens.Black, cellRect);

                    // Tính toán số lượng dòng cần xuống dòng
                    var textSize = gfx.MeasureString(fieldValue, font);
                    double maxWidth = (tableWidth / columnCount) - (2 * cellMargin);
                    int maxCharacters = (int)(maxWidth / (textSize.Width / fieldValue.Length));
                    string cellText = fieldValue;

                    // Tách dữ liệu thành các dòng
                    var lines = new List<string>();
                    while (cellText.Length > maxCharacters)
                    {
                        lines.Add(cellText.Substring(0, maxCharacters));
                        cellText = cellText.Substring(maxCharacters);
                    }
                    lines.Add(cellText);

                    // Vẽ từng dòng
                    double yOffset = h;
                    foreach (var line in lines)
                    {
                        gfx.DrawString(line, font, PdfSharp.Drawing.XBrushes.Black, cellRect.Left + cellMargin, yOffset, PdfSharp.Drawing.XStringFormats.TopLeft);
                        yOffset += gfx.MeasureString(line, font).Height; // Dòng tiếp theo bắt đầu từ cuối dòng trước đó
                    }

                    col++;
                }
                h += rowHeight;
            }

            // Chuyển tệp PDF thành mảng byte
            using (MemoryStream stream = new MemoryStream())
            {
                document.Save(stream);
                document.Close();
                return stream.ToArray();
            }
        }

        [HttpGet]
        public object GetCommonSetingByGroup(string Group)
        {
            ////CommonSetting where GROUP = 'GATE_STATUS'
            var obj = _context.CommonSettings.Where(x => x.Group.Equals(Group)
                && x.IsDeleted == false)
                    .Select(x => new
                    {
                        x.CodeSet,
                        x.ValueSet
                    }).ToList();
            return obj;
        }

        #region Cost

        public class JtableCostModel : JTableModel
        {
            public string ItemCode { get; set; }
            public string ItemType { get; set; }
        }
        // JTable WalletDepositTransaction
        [AllowAnonymous]
        [HttpPost]
        public object JTableCost([FromBody] JtableCostModel jTablePara)
        {
            try
            {
                var session = HttpContext.GetSessionUser();
                var user = _context.Users.FirstOrDefault(x => x.Active && x.UserName == ESEIM.AppContext.UserName);
                int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
                var fromDate = string.IsNullOrEmpty(jTablePara.StartTime) ? (DateTime?)null : DateTime.ParseExact(jTablePara.StartTime, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                var toDate = string.IsNullOrEmpty(jTablePara.EndTime) ? (DateTime?)null : DateTime.ParseExact(jTablePara.EndTime, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                // Way 1 using Where
                //&& (string.IsNullOrEmpty(jTablePara.TransactionCode) || x.TransactionCode.Contains(jTablePara.TransactionCode))
                var data = _context.WalletTableCostItems
                    .Where(x => x.IsDeleted == false
                    && (string.IsNullOrEmpty(jTablePara.ItemType) || x.ItemType == jTablePara.ItemType)
                    && (string.IsNullOrEmpty(jTablePara.ItemCode) || (!string.IsNullOrEmpty(x.ItemCode) && x.ItemCode.Contains(jTablePara.ItemCode)))
                    && (fromDate == null || x.CreatedTime >= fromDate) && (toDate == null || x.CreatedTime <= toDate)
                    && x.CreatedBy == session.UserName
                    )
                    .Select(
                        x => new
                        {
                            x.Id,
                            x.ItemCode,
                            x.ItemType,
                            x.LogCostHistory,
                            x.Coin,
                            x.CreatedBy,
                            x.CreatedTime,
                        });
                var count = data.Count();
                var result = data.OrderByDescending(x => x.Id).Skip(intBeginFor).Take(jTablePara.Length).ToList();
                var jObject = JTableHelper.JObjectTable(result, jTablePara.Draw, count, "Id", "ItemCode", "ItemType", "LogCostHistory", "Coin", "CreatedBy", "CreatedTime");
                return Json(jObject);
            }
            catch (Exception ex)
            {
                var jdata = JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "Id", "ItemCode", "ItemType", "LogCostHistory", "Coin", "CreatedBy", "CreatedTime");
                return Json(jdata);
            }
        }
        #endregion
    }

    public class ModelHistoryPayment
    {
        public int Id { get; set; }
        public string TransactionCode { get; set; }
        public string TransactionType { get; set; }
        public string ItemCode { get; set; }
        public string ItemType { get; set; }
        public string Type { get; set; }
        public decimal? Amount { get; set; }
        public string Currency { get; set; }
        public string TransactionCoinLo { get; set; }
        public decimal Coin { get; set; }
        public DateTime? CreatedTime { get; set; }
        public string CreatedBy { get; set; }
        public string Status { get; set; }
        public string GivenName { get; set; }
    }

    public class TransactionModelExcel
    {
        public int No { get; set; }
        public string GivenName { get; set; }
        public decimal? Amount { get; set; }
        public string Currency { get; set; }
        public decimal? Coin { get; set; }
        public string TransactionType { get; set; }
        public string Type { get; set; }
        public string CreatedTime { get; set; }
        public string Status { get; set; }
    }

    public class JTableCoinHistoryCustom: JTableModel
    {
        public string Status { get; set; }
        public string TransactionType { get; set; }
        public string StartTime { get; set; }
        public string EndTime { get; set; }
    }
}
