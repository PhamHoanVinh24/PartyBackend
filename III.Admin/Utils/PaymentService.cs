using ESEIM.Models;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using III.Domain.Common;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;

namespace ESEIM.Utils
{
    public interface IPaymentService
    {
        PayPalV2Config GetPayPalV2Config(string userName = "", string email = "", string gatewayCode = "");
        VnPayConfig GetVnPayConfig(string userName = "", string email = "", string gatewayCode = "");
        MomoV2Config GetMomoV2Config(string userName = "", string email = "", string gatewayCode = "");
        ZaloConfig GetZaloConfig(string userName = "", string email = "", string gatewayCode = "");
        StripeConfig GetStripeConfig(string userName = "", string email = "", string gatewayCode = "");
        decimal? GetRateFromCurrency(string currency = "");
        void SetObjectPrice(string className, int key, decimal value, string idName = "id");
        PackItem GetObjectPurchaseStatus(string code, string type, string userName);
    }
    public class PaymentService : IPaymentService
    {
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly EIMDBContext _context;

        public PaymentService(IHostingEnvironment hostingEnvironment, EIMDBContext context)
        {
            _hostingEnvironment = hostingEnvironment;
            _context = context;
        }

        public PayPalV2Config GetPayPalV2Config(string userName = "", string email = "", string gatewayCode = "")
        {
            var paymentGateway =
                _context.PaymentGateways
                    .FirstOrDefault(x => x.ServiceType == "PAYMENT_TYPE_PAYPAL"
                                         && (string.IsNullOrEmpty(userName) || x.CreatedBy == userName)
                                         && (string.IsNullOrEmpty(email) || x.Email == email)
                                         && (string.IsNullOrEmpty(gatewayCode) || x.GatewayCode == gatewayCode));
            if (paymentGateway != null)
            {
                var payConfigSet = new PaymentConfigSet(paymentGateway.ConfigJson);
                return new PayPalV2Config
                {
                    CreateOrderUrl = payConfigSet.GetConfigValue("CreateOrderUrl"),
                    AccessTokenUrl = payConfigSet.GetConfigValue("AccessTokenUrl"),
                    CaptureOrderUrlFormat = payConfigSet.GetConfigValue("CaptureOrderUrlFormat"),
                    ClientId = payConfigSet.GetConfigValue("ClientId"),
                    ClientSecret = payConfigSet.GetConfigValue("ClientSecret")
                };
            }
            else
            {
                return null;
            }
        }
        public VnPayConfig GetVnPayConfig(string userName = "", string email = "", string gatewayCode = "")
        {
            var paymentGateway =
                _context.PaymentGateways
                    .FirstOrDefault(x => x.ServiceType == "PAYMENT_TYPE_VNPAY"
                                         && (string.IsNullOrEmpty(userName) || x.CreatedBy == userName)
                                         && (string.IsNullOrEmpty(email) || x.Email == email)
                                         && (string.IsNullOrEmpty(gatewayCode) || x.GatewayCode == gatewayCode));
            if (paymentGateway != null)
            {
                var payConfigSet = new PaymentConfigSet(paymentGateway.ConfigJson);
                return new VnPayConfig
                {
                    VnpTmnCode = payConfigSet.GetConfigValue("VnpTmnCode"),
                    VnpHashSecret = payConfigSet.GetConfigValue("VnpHashSecret")
                };
            }
            else
            {
                return null;
            }
        }
        public MomoV2Config GetMomoV2Config(string userName = "", string email = "", string gatewayCode = "")
        {
            var paymentGateway =
                _context.PaymentGateways
                    .FirstOrDefault(x => x.ServiceType == "PAYMENT_TYPE_MOMO"
                                         && (string.IsNullOrEmpty(userName) || x.CreatedBy == userName)
                                         && (string.IsNullOrEmpty(email) || x.Email == email)
                                         && (string.IsNullOrEmpty(gatewayCode) || x.GatewayCode == gatewayCode));
            if (paymentGateway != null)
            {
                var payConfigSet = new PaymentConfigSet(paymentGateway.ConfigJson);
                return new MomoV2Config
                {
                    PartnerCode = payConfigSet.GetConfigValue("PartnerCode"),
                    AccessKey = payConfigSet.GetConfigValue("AccessKey"),
                    SecretKey = payConfigSet.GetConfigValue("SecretKey")
                };
            }
            else
            {
                return null;
            }
        }
        public ZaloConfig GetZaloConfig(string userName = "", string email = "", string gatewayCode = "")
        {
            var paymentGateway =
                _context.PaymentGateways
                    .FirstOrDefault(x => x.ServiceType == "PAYMENT_TYPE_ZALO"
                                         && (string.IsNullOrEmpty(userName) || x.CreatedBy == userName)
                                         && (string.IsNullOrEmpty(email) || x.Email == email)
                                         && (string.IsNullOrEmpty(gatewayCode) || x.GatewayCode == gatewayCode));
            if (paymentGateway != null)
            {
                var payConfigSet = new PaymentConfigSet(paymentGateway.ConfigJson);
                return new ZaloConfig
                {
                    Appid = payConfigSet.GetConfigValue("Appid"),
                    Appuser = payConfigSet.GetConfigValue("Appuser"),
                    Key1 = payConfigSet.GetConfigValue("Key1"),
                    MerchantInfo = payConfigSet.GetConfigValue("MerchantInfo")
                };
            }
            else
            {
                return null;
            }
        }
        public StripeConfig GetStripeConfig(string userName = "", string email = "", string gatewayCode = "")
        {
            var paymentGateway =
                _context.PaymentGateways
                    .FirstOrDefault(x => x.ServiceType == "PAYMENT_TYPE_STRIPE"
                                         && (string.IsNullOrEmpty(userName) || x.CreatedBy == userName)
                                         && (string.IsNullOrEmpty(email) || x.Email == email)
                                         && (string.IsNullOrEmpty(gatewayCode) || x.GatewayCode == gatewayCode));
            if (paymentGateway != null)
            {
                var payConfigSet = new PaymentConfigSet(paymentGateway.ConfigJson);
                return new StripeConfig
                {
                    ApiKey = payConfigSet.GetConfigValue("ApiKey")
                };
            }
            else
            {
                return null;
            }
        }

        public decimal? GetRateFromCurrency(string currency = "")
        {
            var exchangeRate = _context.CoinRateExchanges.FirstOrDefault(x =>
                (string.IsNullOrEmpty(currency) && x.Money == "USD") ||
                (!string.IsNullOrEmpty(currency) && x.Money == currency));
            return exchangeRate?.Rate;
        }
        public virtual TEntity Get<TEntity, TId>(TId id) 
            where TEntity : class, StringExtensions.IEntity<TId>
            where TId: IEquatable<TId>
        {
            return _context.Set<TEntity>().FirstOrDefault(e => e.Id.Equals(id));
        }
        public void SetObjectPrice(string className, int key, decimal value, string idName = "id")
        {
            var assemblies = AppDomain.CurrentDomain.GetAssemblies();
            Type type = null;
            var types = typeof(EIMDBContext)
                .GetProperties()
                .Where(prop => prop.PropertyType.IsGenericType)
                .Where(prop => prop.PropertyType.GetGenericTypeDefinition() == typeof(DbSet<>))
                .Select(prop => prop.PropertyType.GenericTypeArguments.First())
                .Distinct();
            type = types.FirstOrDefault(x => x.Name == className);
            if (type != null)
            {
                PropertyInfo idProp 
                    = type.GetProperties(BindingFlags.Instance | BindingFlags.Public)
                        .FirstOrDefault(x => x.Name.Equals(idName, StringComparison.OrdinalIgnoreCase));
                
                PropertyInfo priceProp 
                    = type.GetProperties(BindingFlags.Instance | BindingFlags.Public)
                        .FirstOrDefault(x => x.Name.Equals("price", StringComparison.OrdinalIgnoreCase));
// get value
                if(idProp != null && priceProp != null)
                {
                    var query = _context.Set(type);
                    var obj = query.FirstOrDefault(e => e.Id.Equals(key));
                    if (obj is IPurchasableObject purchasableObject)
                    {
                        purchasableObject.Price = value;
                    }
                    _context.SaveChanges();
                }
            }
            //var entity = _context
        }

        public PackItem GetObjectPurchaseStatus(string code, string type, string userName)
        {
            return _context.ItemPackUsers.FirstOrDefault(x => !x.IsDeleted && x.UserName == userName)?
                .ListItemPack.FirstOrDefault(y => y.ItemCode == code && y.ItemType == type && y.Status == "PURCHASED");
        }
    }

    public static class ListPurchaseableExtend
    {
        public static List<TPurchasableObject> GetListPurchaseStatus<TPurchasableObject>(this List<TPurchasableObject> source, List<PackItem> packItems, string codeName, string type)
        where TPurchasableObject : class, IPurchasableObject
        {
            foreach (var item in source)
            {
                PropertyInfo codeProp 
                    = item.GetType().GetProperties(BindingFlags.Instance | BindingFlags.Public)
                        .FirstOrDefault(x => x.Name.Equals(codeName, StringComparison.OrdinalIgnoreCase));
                var code = codeProp?.GetValue(item);
                item.IsPurchased = packItems?.Any(y => code != null && y.ItemCode == code.ToString() && y.ItemType == type && y.Status == "PURCHASED") ?? false; 
            }
            return source;
        }
    }

    public class PayPalV2Config
    {
        public string CreateOrderUrl { get; set; }
        public string AccessTokenUrl { get; set; }
        public string CaptureOrderUrlFormat { get; set; }
        public string ClientId { get; set; }
        public string ClientSecret { get; set; }
    }
    public class VnPayConfig
    {
        public string VnpTmnCode { get; set; }
        public string VnpHashSecret { get; set; }
    }
    public class MomoV2Config
    {
        public string PartnerCode { get; set; }
        public string AccessKey { get; set; }
        public string SecretKey { get; set; }
    }
    public class ZaloConfig
    {
        public string Appid { get; set; }
        public string Appuser { get; set; }
        public string Key1 { get; set; }
        public string MerchantInfo { get; set; }
    }
    public class StripeConfig
    {
        public string ApiKey { get; set; }
    }

    public class PaymentConfigSet
    {
        public List<PaymentConfig> ListPaymentConfigs { get; set; }

        public PaymentConfigSet(string configJson)
        {
            ListPaymentConfigs = JsonConvert.DeserializeObject<List<PaymentConfig>>(configJson);
        }

        public string GetConfigValue(string key)
        {
            return ListPaymentConfigs.FirstOrDefault(x => x.AttrName == key)?.Value;
        }
    }

    public class PaymentConfig
    {
        public int Id { get; set; }
        public string AttrName { get; set; }
        public string Value { get; set; }
    }
}
