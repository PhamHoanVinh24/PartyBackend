using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class AddonAppServerController : BaseController
    {
        public class JtableAddonAppServerModel : JTableModel
        {
            public string ServerCode { get; set; }
            public string ServerAddress { get; set; }
            public string Note { get; set; }
        }
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IStringLocalizer<AddonAppServerController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;

        public AddonAppServerController(EIMDBContext context, IUploadService upload, IStringLocalizer<AddonAppServerController> stringLocalizer,
            IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _upload = upload;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }
        [Breadcrumb("ViewData.CrumbAddonAppServer", AreaName = "Admin", FromAction = "Index", FromController = typeof(MenuSystemSettingController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuSystemSett"] = _sharedResources["COM_CRUMB_SYSTEM"];
            ViewData["CrumbAddonAppServer"] = "Quản lý hệ thống con";
            return View();
        }
        [HttpPost]
        public object JTable([FromBody]JtableAddonAppServerModel jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = (from a in _context.AddonAppServers
                         where (string.IsNullOrEmpty(jTablePara.ServerCode) || a.ServerCode.ToLower().Contains(jTablePara.ServerCode.ToLower()))
                         && (string.IsNullOrEmpty(jTablePara.ServerAddress) || a.ServerAddress.ToLower().Contains(jTablePara.ServerAddress.ToLower()))
                         && (string.IsNullOrEmpty(jTablePara.Note) || a.Note.ToLower().Contains(jTablePara.Note.ToLower()))
                         select new
                         {
                             a.Id,
                             a.ServerCode,
                             a.AppCode,
                             a.AppVendorCode,
                             a.ServerAddress,
                             a.Status,
                             //a.QrCode,
                             a.Note,
                         }).OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();

            var count = (from a in _context.AddonAppServers
                         select a).AsNoTracking().Count();
            var data = query.Select(x => new
            {
                x.Id,
                x.ServerCode,
                AppName = _context.AddonApps.FirstOrDefault(y => y.AppCode == x.AppCode)?.AppTitle,
                VendorName = _context.AppVendors.FirstOrDefault(y => y.VendorCode == x.AppVendorCode)?.Name,
                x.ServerAddress,
                x.Status,
                x.Note
            }).ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "ServerCode", "AppName", "VendorName", "ServerAddress", "Status"/*, "QrCode"*/, "Note");
            return Json(jdata);
        }

        [HttpPost]
        public object GetApp()
        {
            var data = _context.AddonApps.Select(x => new { Code = x.AppCode, Name = x.AppTitle });
            return data;
        }

        [HttpPost]
        public object GetVendor()
        {
            var data = _context.AppVendors.Select(x => new { Code = x.VendorCode, Name = x.Name });
            return data;
        }

        [HttpGet]
        public JsonResult GetItem(int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            var data = _context.AddonAppServers.FirstOrDefault(x => x.Id == id);
            if (data != null)
            {
                msg.Object = data;
            }
            else
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_NOT_EXITS_FILE"));
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Insert([FromBody]List<AddonAppServer> listObj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                foreach (var item in listObj)
                {
                    _context.AddonAppServers.Add(item);
                    //item.QrCode = Encrypt(item.ServerAddress);
                    item.CreatedBy = ESEIM.AppContext.UserName;
                    item.CreatedTime = DateTime.Now;
                }
                _context.SaveChanges();
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_ADD_SUCCESS"), CommonUtil.ResourceValue("AAS_TITLE_APP_ADDON"));
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_FAIL_ADD"), CommonUtil.ResourceValue("AAS_TITLE_APP_ADDON"));
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Update([FromBody]AddonAppServer obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = _context.AddonAppServers.FirstOrDefault(x => x.Id == obj.Id);
                if (data != null)
                {
                    data.ServerCode = obj.ServerCode;
                    data.ServerAddress = obj.ServerAddress;
                    //data.QrCode = Encrypt(obj.ServerAddress);
                    data.AppCode = obj.AppCode;
                    data.AppVendorCode = obj.AppVendorCode;
                    data.Note = obj.Note;
                    data.Logo = obj.Logo;
                    data.Background = obj.Background;
                    data.Color = obj.Color;
                    data.FontSize = obj.FontSize;
                    data.FontFamily = obj.FontFamily;
                    data.BackgroundColor = obj.BackgroundColor;
                    data.ButtonColor = obj.ButtonColor;
                    data.QrcodeColor = obj.QrcodeColor;
                    data.TextloginColor = obj.TextloginColor;
                    data.PinColor = obj.PinColor;
                    data.UpdatedBy = ESEIM.AppContext.UserName;
                    data.UpdatedTime = DateTime.Now;
                    _context.SaveChanges();
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_UPDATE_SUCCESS"), CommonUtil.ResourceValue("AAS_TITLE_APP_ADDON"));
                }
                else
                {
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_NOT_EXITS"), CommonUtil.ResourceValue("AAS_TITLE_APP_AAS_ADDON"));
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_UPDATE_FAIL"));
            }
            return Json(msg); 
        }

        [HttpPost]
        public JsonResult Delete([FromBody]int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = _context.AddonAppServers.FirstOrDefault(x => x.Id == id);
                if (data != null)
                {
                    _context.AddonAppServers.Remove(data);
                    _context.SaveChanges();
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_SUCCESS"), CommonUtil.ResourceValue("AAS_TITLE_APP_ADDON"));
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_NOT_EXITS"), CommonUtil.ResourceValue("AAS_TITLE_APP_AAS_ADDON"));
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_DELETE"));
            }
            return Json(msg);
        }
        //static readonly string PasswordHash = "P@@Sw0rd";
        //static readonly string SaltKey = "S@LT&KEY";
        //static readonly string VIKey = "@1B2c3D4e5F6g7H8";
        //public static string Encrypt(string plainText)
        //{
        //    byte[] plainTextBytes = Encoding.UTF8.GetBytes(plainText);

        //    byte[] keyBytes = new Rfc2898DeriveBytes(PasswordHash, Encoding.ASCII.GetBytes(SaltKey)).GetBytes(256 / 8);
        //    var symmetricKey = new RijndaelManaged() { Mode = CipherMode.CBC, Padding = PaddingMode.Zeros };
        //    var encryptor = symmetricKey.CreateEncryptor(keyBytes, Encoding.ASCII.GetBytes(VIKey));
			
        //    byte[] cipherTextBytes;

        //    using (var memoryStream = new MemoryStream())
        //    {
        //        using (var cryptoStream = new CryptoStream(memoryStream, encryptor, CryptoStreamMode.Write))
        //        {
        //            cryptoStream.Write(plainTextBytes, 0, plainTextBytes.Length);
        //            cryptoStream.FlushFinalBlock();
        //            cipherTextBytes = memoryStream.ToArray();
        //            cryptoStream.Close();
        //        }
        //        memoryStream.Close();
        //    }
        //    return Convert.ToBase64String(cipherTextBytes);
        //}
        //public static string Decrypt(string encryptedText)
        //{
        //    byte[] cipherTextBytes = Convert.FromBase64String(encryptedText);
        //    byte[] keyBytes = new Rfc2898DeriveBytes(PasswordHash, Encoding.ASCII.GetBytes(SaltKey)).GetBytes(256 / 8);
        //    var symmetricKey = new RijndaelManaged() { Mode = CipherMode.CBC, Padding = PaddingMode.None };

        //    var decryptor = symmetricKey.CreateDecryptor(keyBytes, Encoding.ASCII.GetBytes(VIKey));
        //    var memoryStream = new MemoryStream(cipherTextBytes);
        //    var cryptoStream = new CryptoStream(memoryStream, decryptor, CryptoStreamMode.Read);
        //    byte[] plainTextBytes = new byte[cipherTextBytes.Length];

        //    int decryptedByteCount = cryptoStream.Read(plainTextBytes, 0, plainTextBytes.Length);
        //    memoryStream.Close();
        //    cryptoStream.Close();
        //    return Encoding.UTF8.GetString(plainTextBytes, 0, decryptedByteCount).TrimEnd("\0".ToCharArray());
        //}

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion
    }
}