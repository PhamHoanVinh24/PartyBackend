using System;
using System.IO;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Http;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Collections.Generic;
using Microsoft.Extensions.Options;
using System.Net;
using System.Data;
using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore.Internal;
using Newtonsoft.Json.Linq;
using III.Admin.Controllers;

namespace III.Admin.Areas.Admin.Controllers
{
    public class MobileInvoiceController : Controller
    {
        private readonly UserManager<AspNetUser> _userManager;
        private const string AuthenticatorUriFormat = "otpauth://totp/{0}:{1}?secret={2}&issuer={0}&digits=6";
        private readonly EIMDBContext _context;
        private readonly IPaymentService _paymentService;
        private PayPalV2Config _palV2Config;
        private VnPayConfig _vnPayConfig;
        private MomoV2Config _momoV2Config;
        private ZaloConfig _zaloConfig;
        private StripeConfig _stripeConfig;
        private readonly CheckoutConfig _checkoutConfig;
        private readonly IUserLoginService _loginService;
        public MobileInvoiceController(UserManager<AspNetUser> userManager,
                                       EIMDBContext context,
                                       IPaymentService paymentService,
                                        IOptions<CheckoutConfig> checkoutConfig,
                                        IUserLoginService loginService)
        {
            _userManager = userManager;
            _context = context;
            _paymentService = paymentService;
            _palV2Config = _paymentService.GetPayPalV2Config();
            _vnPayConfig = _paymentService.GetVnPayConfig();
            _momoV2Config = _paymentService.GetMomoV2Config();
            _stripeConfig = _paymentService.GetStripeConfig();
            _zaloConfig = _paymentService.GetZaloConfig();
            _checkoutConfig = checkoutConfig.Value;
            _loginService = loginService;
        }
        #region Gate CRUD
        [HttpPost]
        public object InsertGate([FromBody] ModelGate model)
        {
            var msg = new JMessage();
            try
            {
                var exist = _context.InvoiceCustomerGates
                    .FirstOrDefault(x => x.ServiceCode == model.ServiceCode && x.TaxNumber == model.TaxNumber);
                if (exist != null)
                {
                    msg.Error = true;
                    msg.Title = "Đã nhập invoice với mã số thuế";
                    return Json(msg);
                }

                //else
                //{
                var obj = new InvoiceCustomerGate();
                obj.UserId = model.UserId;
                obj.TaxNumber = model.TaxNumber;
                obj.PassWord = model.PassWord;
                obj.Status = model.Status;
                obj.ServiceCode = model.ServiceCode;
                obj.CreatedBy = model.CreatedBy;
                obj.CreatedTime = DateTime.Now;
                _context.InvoiceCustomerGates.Add(obj);
                _context.SaveChanges();
                msg.Title = "Thêm thành công";
                //}
            }
            catch
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra";
            }
            return Json(msg);
        }
        [HttpPut]
        public object UpdateGate([FromBody] ModelGate obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.InvoiceCustomerGates
                    .Where(x => x.IsDeleted == false && x.Id == obj.Id)
                    .FirstOrDefault();
                if (data != null)
                {
                    data.TaxNumber = obj.TaxNumber;
                    data.Status = obj.Status;
                    data.UserId = obj.UserId;
                    data.PassWord = obj.PassWord;
                    data.UpdatedBy = obj.CreatedBy;
                    data.UpdatedTime = DateTime.Now;
                    _context.InvoiceCustomerGates.Update(data);
                    _context.SaveChanges();
                    msg.Title = "Cập nhật thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Không tồn tại";
                }
            }
            catch
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra";
            }
            return Json(msg);
        }
        [HttpGet]
        public object GetListGate(string serviceCode)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = (from a in _context.InvoiceCustomerGates
                    .Where(x => x.IsDeleted == false && x.ServiceCode == serviceCode)
                            join b in _context.CommonSettings.Where(x => x.IsDeleted == false) on a.Status equals b.CodeSet
                            join c in _context.ServiceCategorys.Where(x => x.IsDeleted == false) on a.ServiceCode equals c.ServiceCode
                            join d in _context.ServiceCategoryCostConditions
                            .Where(b => b.IsDeleted == false && b.ObjectCode == "SERVICE_CONDITION_000")
                            on c.ServiceCode equals d.ServiceCatCode
                            select new
                            {
                                Id = a.Id,
                                ServiceCode = a.ServiceCode,
                                ServiceName = c.ServiceName,
                                StatusCode = b.CodeSet,
                                StatusName = b.ValueSet,
                                TaxNumber = a.TaxNumber,
                                CreatedBy = a.CreatedBy,
                                CreatedTime = a.CreatedTime,
                                Price = d.Price
                            }).ToList();
                if (data.Count != 0)
                {
                    msg.Object = data;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Không tìm thấy";
                }
            }
            catch
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra";
            }
            return Json(msg);
        }
        [HttpGet]
        public object GetItemGate(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.InvoiceCustomerGates
                    .Where(x => x.IsDeleted == false)
                    .Where(x => x.Id == id)
                    .FirstOrDefault();
                if (data != null)
                {
                    msg.Object = data;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Không tìm thấy";
                }
            }
            catch
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra";
            }
            return Json(msg);
        }
        [HttpDelete]
        public object DeleteGate(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.InvoiceCustomerGates
                    .Where(x => x.IsDeleted == false && x.Id == id)
                    .FirstOrDefault();
                if (data != null)
                {
                    data.DeletedTime = DateTime.Now;
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.IsDeleted = true;
                    _context.InvoiceCustomerGates.Update(data);
                    _context.SaveChanges();
                    msg.Title = "Xóa thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Không tìm thấy";
                }
            }
            catch
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra";
            }
            return Json(msg);
        }

        [HttpGet]
        public object GetGateStatus()
        {
            ////CommonSetting where GROUP = 'GATE_STATUS'
            var obj = _context.CommonSettings.Where(x => x.Group.Equals("GATE_STATUS"))
                    .Where(x => x.IsDeleted == false)
                    .Select(x => new
                    {
                        x.CodeSet,
                        x.ValueSet
                    }).ToList();
            return obj;
        }

        [HttpGet]
        public object GetUserAccounting()
        {
            var result = (from a in _context.Users
                          join b in _context.AdUserInGroups on a.Id equals b.UserId
                          where b.GroupUserCode.Equals("CLIENT_ACCOUTANT")
                          select new { UserId = a.Id, UserName = a.UserName, GivenName = a.GivenName })
            .ToList();
            return result;
        }
        [HttpGet]
        public object GetServiceMobile()
        {
            var mess = new JMessage();
            try
            {
                var codeheader = _context.ServiceCategoryCostHeaders.Where(x => x.IsDeleted == false)
                 .OrderByDescending(c => c.EffectiveDate)
                 .FirstOrDefault();
                if (codeheader == null || codeheader.ExpiryDate < DateTime.Now)
                {
                    mess.Error = true;
                    mess.Title = "Không tìm thấy bảng giá";
                    return mess;
                }
                var a = _context.ServiceCategorys.Where(x => x.IsDeleted == false
                && (x.Visibility == 2 || x.Visibility == 3)).Select(x => new
                {

                    x.ServiceParent,
                    x.ServiceCatID,
                    x.ServiceName,
                    x.ServiceCode,
                    x.ServiceGroup,
                    x.ServiceType,
                    header = codeheader.HeaderCode,
                    ListPrice = _context.ServiceCategoryCostConditions
                        .Where(b => b.HeaderCode == codeheader.HeaderCode &&
                                b.ServiceCatCode.Equals(x.ServiceCode) &&
                                b.IsDeleted == false)
                        .Select(c => new
                        {
                            c.ObjectCode,
                            c.ObjFromValue,
                            c.ObjToValue,
                            c.ServiceCatCode,
                            c.Price,
                            c.Currency,
                            Title = _context.CommonSettings.Where(d => d.CodeSet.Equals(c.ObjectCode)).FirstOrDefault().ValueSet
                        })
                        .ToList()
                }).ToList();
                if (a.Count == 0)
                {
                    mess.Error = true;
                    mess.Title = "Không tìm thấy dịch vụ nào";
                    return mess;
                }
                mess.Error = false;
                mess.Object = a;
                return mess;
            }
            catch
            {
                mess.Error = true;
                mess.Title = "Có lỗi xảy ra";
                return mess;
            }

        }
        [HttpPost]
        public object UpdateGateStatus(int id, string updatedBy = "admin")
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.InvoiceCustomerGates
                    .Where(x => x.IsDeleted == false && x.Id == id)
                    .FirstOrDefault();
                if (data != null)
                {
                    //data.TaxNumber = obj.TaxNumber;
                    data.Status = "GATE_STATUS_COMPLETED";
                    //data.UserId = obj.UserId;
                    //data.PassWord = obj.PassWord;
                    data.UpdatedBy = updatedBy;
                    data.UpdatedTime = DateTime.Now;
                    _context.InvoiceCustomerGates.Update(data);
                    _context.SaveChanges();
                    msg.Title = "Cập nhật thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Không tồn tại";
                }
            }
            catch
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra";
            }
            return Json(msg);
        }
        #endregion

        #region Transaction
        [HttpPost]
        public object VNPayInPut(int price, string itemCode, string userName, string target = "", string currency = "VND")
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
            string vnp_Returnurl = _checkoutConfig.VnpMobileReturnUrl; //URL nhan ket qua tra ve 
            string vnp_Url = _checkoutConfig.VnpUrl; //URL thanh toan cua VNPAY 
            string vnp_TmnCode = _vnPayConfig.VnpTmnCode;                  // ConfigurationManager.AppSettings["vnp_TmnCode"]; //Ma website
            string vnp_HashSecret = _vnPayConfig.VnpHashSecret;                          //ConfigurationManager.AppSettings["vnp_HashSecret"]; //Chuoi bi mat
            try
            {
                //var rate = _paymentService.GetRateFromCurrency(currency) ?? (decimal)1.0;
                //var price = decimal.Truncate(points * rate);
                //Get payment input
                OrderInfo order = new OrderInfo();
                //Save order to db
                order.OrderId = DateTime.Now.Ticks; // Giả lập mã giao dịch hệ thống merchant gửi sang VNPAY
                order.Amount = price; // Giả lập số tiền thanh toán hệ thống merchant gửi sang VNPAY 100,000 VND
                order.Status = "0"; //0: Trạng thái thanh toán "chờ thanh toán" hoặc "Pending"
                order.OrderDesc = "190002";  //txtOrderDesc;
                order.CreatedDate = DateTime.Now;
                order.TmnCode = _vnPayConfig.VnpTmnCode;
                // string locale = cboLanguage.SelectedItem.Value;
                //Build URL for VNPAY
                VnPayLibrary vnpay = new VnPayLibrary();
                vnpay.AddRequestData("vnp_Version", VnPayLibrary.VERSION);
                vnpay.AddRequestData("vnp_Command", "pay");
                vnpay.AddRequestData("vnp_TmnCode", vnp_TmnCode);
                vnpay.AddRequestData("vnp_Amount", (price * 100).ToString(CultureInfo.InvariantCulture));
                //Số tiền thanh toán. Số tiền không mang các ký tự phân tách thập phân, phần nghìn, ký tự tiền tệ. Để gửi số tiền thanh toán là 100,000 VND (một trăm nghìn VNĐ) thì merchant cần nhân thêm 100 lần (khử phần thập phân), sau đó gửi sang VNPAY là: 10000000
                /*if (cboBankCode.SelectedItem != null && !string.IsNullOrEmpty(cboBankCode.SelectedItem.Value))
                {
                    vnpay.AddRequestData("vnp_BankCode", cboBankCode.SelectedItem.Value);
                }*/
                vnpay.AddRequestData("vnp_CreateDate", order.CreatedDate.ToString("yyyyMMddHHmmss"));
                var expireDate = order.CreatedDate.AddMinutes(15);
                vnpay.AddRequestData("vnp_CurrCode", "VND");
                vnpay.AddRequestData("vnp_OrderType", "190000");
                vnpay.AddRequestData("vnp_ExpireDate", expireDate.ToString("yyyyMMddHHmmss"));
                var ipAddress = HttpContext.Connection.RemoteIpAddress.ToString();
                vnpay.AddRequestData("vnp_IpAddr", ipAddress);
                /*if (!string.IsNullOrEmpty(locale))
                {
                    vnpay.AddRequestData("vnp_Locale", locale);
                }
                else
                {*/
                vnpay.AddRequestData("vnp_Locale", "vn");
                vnpay.AddRequestData("vnp_OrderInfo", "Thanh toan don hang:" + order.OrderId);
                // vnpay.AddRequestData("vnp_OrderType", orderCategory.SelectedItem.Value); //default value: other
                vnpay.AddRequestData("vnp_ReturnUrl", vnp_Returnurl);
                vnpay.AddRequestData("vnp_TxnRef", itemCode); // Mã tham chiếu của giao dịch tại hệ thống của merchant. Mã này là duy nhất dùng để phân biệt các đơn hàng gửi sang VNPAY. Không được trùng lặp trong ngày
                order.paymentUrl = vnpay.CreateRequestUrl(vnp_Url, vnp_HashSecret);
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


        [HttpPost]
        public object VnPayOutPut([FromBody] VnPayModel vnPayModel)
        {
            var rate = _paymentService.GetRateFromCurrency("VND") ?? (decimal)1.0;
            var walletTransaction = new WalletCoinTransaction
            {
                TransactionCode = vnPayModel.vnp_TransactionNo,
                TransactionType = "VNPAY",
                ItemCode = vnPayModel.vnp_TxnRef,
                ItemType = vnPayModel.ItemType,
                Type = vnPayModel.vnp_CardType,
                Amount = Convert.ToDecimal(vnPayModel.vnp_Amount) / 100,
                Currency = "VND",
                TransactionCoinLog = vnPayModel.vnp_TxnRef,
                Status = vnPayModel.vnp_ResponseCode == "00" ? "COMPLETED" : vnPayModel.vnp_TransactionStatus,
                Coin = Convert.ToDecimal(vnPayModel.vnp_Amount) / (100 * rate),
                IsDeleted = false,
                Buyer = vnPayModel.CreatedBy,
                Seller = "admin",
                CreatedTime = DateTime.Now,
                CreatedBy = vnPayModel.CreatedBy,
            };

            _context.WalletCoinTransactions.Add(walletTransaction);
            _context.SaveChanges();
            if (vnPayModel.vnp_ResponseCode == "00")
            {
                return new JMessage() { Error = false, Title = "Giao dịch thành công" };
            }
            else
            {
                return new JMessage() { Error = true, Title = "Thao tác bị gián đoạn" };
            }
        }
        //
        // MOMO
        //
        public class MoMoSecurity
        {
            private static RNGCryptoServiceProvider rngCsp = new RNGCryptoServiceProvider();
            private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
            public MoMoSecurity()
            {
                //encrypt and decrypt password using secure
            }
            public string getHash(string partnerCode, string merchantRefId,
                string amount, string paymentCode, string storeId, string storeName, string publicKeyXML)
            {
                string json = "{\"partnerCode\":\"" +
                    partnerCode + "\",\"partnerRefId\":\"" +
                    merchantRefId + "\",\"amount\":" +
                    amount + ",\"paymentCode\":\"" +
                    paymentCode + "\",\"storeId\":\"" +
                    storeId + "\",\"storeName\":\"" +
                    storeName + "\"}";
                log.Debug("Raw hash: " + json);
                byte[] data = Encoding.UTF8.GetBytes(json);
                string result = null;
                using (var rsa = new RSACryptoServiceProvider(4096)) //KeySize
                {
                    try
                    {
                        // MoMo's public key has format PEM.
                        // You must convert it to XML format. Recommend tool: https://superdry.apphb.com/tools/online-rsa-key-converter
                        rsa.FromXmlString(publicKeyXML);
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
            public string buildQueryHash(string partnerCode, string merchantRefId,
                string requestid, string publicKey)
            {
                string json = "{\"partnerCode\":\"" +
                    partnerCode + "\",\"partnerRefId\":\"" +
                    merchantRefId + "\",\"requestId\":\"" +
                    requestid + "\"}";
                log.Debug("Raw hash: " + json);
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

            public string buildRefundHash(string partnerCode, string merchantRefId,
                string momoTranId, long amount, string description, string publicKey)
            {
                string json = "{\"partnerCode\":\"" +
                    partnerCode + "\",\"partnerRefId\":\"" +
                    merchantRefId + "\",\"momoTransId\":\"" +
                    momoTranId + "\",\"amount\":" +
                    amount + ",\"description\":\"" +
                    description + "\"}";
                log.Debug("Raw hash: " + json);
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
            public string signSHA256(string message, string key)
            {
                byte[] keyByte = Encoding.UTF8.GetBytes(key);
                byte[] messageBytes = Encoding.UTF8.GetBytes(message);
                using (var hmacsha256 = new HMACSHA256(keyByte))
                {
                    byte[] hashmessage = hmacsha256.ComputeHash(messageBytes);
                    string hex = BitConverter.ToString(hashmessage);
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
            public static string sendPaymentRequest(string endpoint, string postJsonString)
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

                    string jsonresponse = "";

                    using (var reader = new StreamReader(response.GetResponseStream()))
                    {

                        string temp = null;
                        while ((temp = reader.ReadLine()) != null)
                        {
                            jsonresponse += temp;
                        }
                    }


                    //todo parse it
                    return jsonresponse;
                    //return new MomoResponse(mtid, jsonresponse);

                }
                catch (WebException e)
                {
                    return e.Message;
                }
            }
        }
        [HttpPost]
        public object MomoPay(object sender, EventArgs e, int price, string itemCode, string userName, string target = "", string platform = "ios", string currency = "VND")
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
                //var rate = _paymentService.GetRateFromCurrency(currency) ?? (decimal)1.0;
                //var price = decimal.Truncate(price * rate);
                string endpoint = _checkoutConfig.MomoUrl; //URL nhan ket qua tra ve 
                string partnerCode = _momoV2Config.PartnerCode; // textPartnerCode.Text;
                string accessKey = _momoV2Config.AccessKey; //textAccessKey.Text;
                string secretKey = _momoV2Config.SecretKey;
                string orderInfo = "test";  //textOrderInfo.Text;
                string redirectUrl = _checkoutConfig.MomoMobileReturnUrl; //textReturn.Text;
                //if (platform?.ToLower() == "android")
                //{
                //    redirectUrl = _checkoutConfig.MomoAndroidReturnUrl;
                //}
                string ipnUrl = _checkoutConfig.MomoReturnUrl; //textNotify.Text;
                string requestType = "captureWallet";

                string str = price.ToString(CultureInfo.InvariantCulture);
                string amount = str;  //textAmount.Text; // Gía trị tiền 
                string orderId = itemCode;
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

                //log.Debug("rawHash = " + rawHash);

                MoMoSecurity crypto = new MoMoSecurity();
                //sign signature SHA256
                string signature = crypto.signSHA256(rawHash, secretKey);
                //log.Debug("Signature = " + signature);

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
                //log.Debug("Json request to MoMo: " + message.ToString());
                string responseFromMomo = PaymentRequest.sendPaymentRequest(endpoint, message.ToString());
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

        [HttpPost]
        public object MomoOutPut([FromBody] MomoPayModel momoPayModel)
        {
            var rate = _paymentService.GetRateFromCurrency("VND") ?? (decimal)1.0;
            var walletTransaction = new WalletCoinTransaction
            {
                TransactionCode = momoPayModel.requestId,
                TransactionType = "MOMOPAY",
                ItemCode = momoPayModel.orderId,
                ItemType = momoPayModel.ItemType,
                Type = momoPayModel.orderType,
                Amount = Convert.ToDecimal(momoPayModel.amount),
                Currency = "VND",
                TransactionCoinLog = momoPayModel.message,
                Status = momoPayModel.resultCode == "0" ? "COMPLETED" : "FAILED",
                Coin = Convert.ToDecimal(momoPayModel.amount) / rate,
                Buyer = momoPayModel.CreatedBy,
                Seller = "admin",
                IsDeleted = false,
                CreatedTime = DateTime.Now,
                CreatedBy = momoPayModel.CreatedBy,
            };

            _context.WalletCoinTransactions.Add(walletTransaction);
            _context.SaveChanges();

            if (momoPayModel.resultCode == "0")
            {
                return new JMessage() { Error = false, Title = "Giao dịch thành công" };
            }
            else
            {
                return new JMessage() { Error = true, Title = "Thao tác bị gián đoạn" };
            }
        }


        [HttpGet]
        public object JTableHistoryPayment(JtableDepositHistory jTablePara)
        {
            try
            {
                var session = _loginService.GetSessionUser(jTablePara.UserId);
                var user = _context.Users.FirstOrDefault(x => x.Active && x.UserName == jTablePara.UserName);
                int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
                var fromDate = string.IsNullOrEmpty(jTablePara.StartTime) ? (DateTime?)null : DateTime.ParseExact(jTablePara.StartTime, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                var toDate = string.IsNullOrEmpty(jTablePara.EndTime) ? (DateTime?)null : DateTime.ParseExact(jTablePara.EndTime, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                // Way 1 using Where
                //&& (string.IsNullOrEmpty(jTablePara.TransactionCode) || x.TransactionCode.Contains(jTablePara.TransactionCode))
                var data = (from a in _context.WalletCoinTransactions
                            .Where(x => x.IsDeleted == false
                            && (string.IsNullOrEmpty(jTablePara.TransactionType) || x.TransactionType == jTablePara.TransactionType)
                            && (fromDate == null || x.CreatedTime >= fromDate) && (toDate == null || x.CreatedTime <= toDate)
                            && x.CreatedBy == session.UserName && x.Status == "COMPLETED"
                            )
                            join b in _context.Users on a.CreatedBy equals b.UserName into b1
                            from b in b1.DefaultIfEmpty()
                           select new
                           {
                               a.Id,
                               a.TransactionCode,
                               a.TransactionType,
                               a.ItemCode,
                               a.ItemType,
                               a.Type,
                               a.Amount,
                               a.Currency,
                               a.TransactionCoinLog,
                               a.Coin,
                               a.CreatedTime,
                               a.CreatedBy,
                               GivenName = b != null ? b.GivenName : "",
                           });
                var count = data.Count();
                return new
                {
                    count = count,
                    data = data.OrderByDescending(x => x.Id).Skip(intBeginFor).Take(jTablePara.Length).ToList()
                };
            }
            catch (Exception ex)
            {
                return new
                {
                    count = 0,
                    data = new List<object>()
                };
            }
        }
        [HttpPost]
        public object SaveTransactionHistory([FromBody] PaypalTransactionHistory data)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                data.PaymentDate = DateTime.Now;
                //data.AspUserId = ESEIM.AppContext.UserId;
                var walletTransaction = new WalletCoinTransaction
                {
                    TransactionCode = data.TxnId,
                    TransactionType = "PAYPAL",
                    ItemCode = data.ItemCode,
                    ItemType = data.ItemType,
                    Type = data.PaymentType,
                    Amount = data.PaymentAmount,
                    Currency = data.PaymentCurrency,
                    TransactionCoinLog = data.PaymentLog,
                    Status = "COMPLETED",
                    Coin = /*vnpAmount % 100 % 22000*/data.PaymentQuantity,
                    IsDeleted = false,
                    Buyer = data.CreatedBy,
                    Seller = "admin",
                    CreatedTime = DateTime.Now,
                    CreatedBy = data.CreatedBy,
                };
                _context.WalletCoinTransactions.Add(walletTransaction);
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
        #endregion

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
            public string paymentUrl { get; set; }
            public string TmnCode { get; set; }
        }
        public class ModelGate
        {
            public int? Id { get; set; }
            public string UserId { get; set; }
            public string TaxNumber { get; set; }
            public string ServiceCode { get; set; }
            public string PassWord { get; set; }
            public string Status { get; set; }
            public string CreatedBy { get; set; }
        }

        public class JtableDepositHistory
        {
            public string UserName { get; set; }
            public string UserId { get; set; }
            public int CurrentPage { get; set; }
            public int Length { get; set; }
            public string StartTime { get; set; }
            public string EndTime { get; set; }
            public string TransactionType { get; set; }
        }
    }
}
