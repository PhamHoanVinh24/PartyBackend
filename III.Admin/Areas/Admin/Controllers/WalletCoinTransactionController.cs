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
using System.Drawing;
using Microsoft.Extensions.Localization;
using Microsoft.AspNetCore.Authorization;

namespace III.Admin.Areas.Admin.Controllers
{
    public class WalletCoinTransactionController : Controller
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
        private readonly IStringLocalizer<GroupUserController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public WalletCoinTransactionController(UserManager<AspNetUser> userManager,
                                       EIMDBContext context,
                                       IPaymentService paymentService,
                                        IOptions<CheckoutConfig> checkoutConfig,
                                        IUserLoginService loginService, 
                                        IStringLocalizer<GroupUserController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
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
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
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

        /*[HttpPut]
        public object UpdateWalletCoinTransaction([FromBody] WalletCoinTransaction obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.WalletCoinTransactions
                    .Where(x => x.IsDeleted == false && x.Id == obj.Id)
                    .FirstOrDefault();
                if (data != null)
                {
                    data.TransactionCode = obj.TaxNumber;
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
        }*/
        [HttpPost]
        public object UpdateWalletCoinTransactionStatus(int id, string updatedBy = "admin")
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.WalletCoinTransactions
                    .Where(x => x.IsDeleted == false && x.Id == id)
                    .FirstOrDefault();
                if (data != null)
                {
                    //data.TaxNumber = obj.TaxNumber;
                    data.Status = "WALLET_COIN_TRANSACTION_STATUS_COMPLETED";
                    //data.UserId = obj.UserId;
                    //data.PassWord = obj.PassWord;
                    data.UpdatedBy = updatedBy;
                    data.UpdatedTime = DateTime.Now;
                    _context.WalletCoinTransactions.Update(data);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_MSG_UPDATE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_MSG_NOT_EXITS"];
                }
            }
            catch
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra";
            }
            return Json(msg);
        }

        [AllowAnonymous]
        [HttpDelete]
        public object DeleteWalletCoinTransaction(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.WalletCoinTransactions
                    .Where(x => x.IsDeleted == false && x.Id == id)
                    .FirstOrDefault();
                if (data != null)
                {
                    data.DeletedTime = DateTime.Now;
                    //data.DeletedBy = ESEIM.AppContext.UserName;
                    data.IsDeleted = true;
                    _context.WalletCoinTransactions.Update(data);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_MSG_DELETE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_MSG_NOT_EXITS"];
                }
            }
            catch
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_DELETE_FAIL"];
            }
            return Json(msg);
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