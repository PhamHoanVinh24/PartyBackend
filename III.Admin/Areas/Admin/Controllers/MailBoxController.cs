using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using MimeKit;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit.Text;
using MailKit.Net;
using FTU.Utils.HelperNet;
using Newtonsoft.Json;
using Microsoft.AspNetCore.Http;
using III.Domain.Enums;
using System.IO;
using System.Net;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class MailBoxController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IMailKitService _mailKitService;
        private readonly IStringLocalizer<EDMSRepositoryController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IEmailConfiguration _emailConfiguration;

        public MailBoxController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment,
            IStringLocalizer<SharedResources> sharedResources, IMailKitService mailKitService, IStringLocalizer<EDMSRepositoryController> stringLocalizer,
            IEmailConfiguration emailConfiguration)
        {
            _mailKitService = mailKitService;
            _context = context;
            _hostingEnvironment = hostingEnvironment;
            _upload = upload;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
            _emailConfiguration = emailConfiguration;
        }
        [Breadcrumb("ViewData.CrumbMailBox", AreaName = "Admin", FromAction = "Index", FromController = typeof(AssetBuyerHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuAsset"] = _sharedResources["COM_CRUMB_ASSET_OPERATION"];
            ViewData["TitleAssetBuyerHome"] = _sharedResources["COM_CRUMB_ASSET_BUYER_HOME"];
            ViewData["CrumbMailBox"] = _sharedResources["COM_APPROVE_EMAIL_BOX"];
            return View();
        }

        #region Mail box
        [HttpPost]
        public object JTableMail(int page, int length, string type, string user, string pass, string IP,int Port)
        {
            int intBegin = (page - 1) * length;
            var dataMail = new List<EmailMessage>();

            if (type.Equals("INBOX"))
                dataMail = _mailKitService.ReceiveEmail1(user, pass, IP, Port).Where(x => x.FromAddresses.Any(k => k.Address != user)).ToList();
            else if (type.Equals("SENT"))
                dataMail = _mailKitService.ReceiveEmail1(user, pass, IP, Port).Where(x => x.FromAddresses.Any(k => k.Address.Equals(user))).ToList();
            var count = dataMail.Count() / length;

            var listEmail = dataMail.Skip(intBegin).Take(length);

            return new
            {
                SumPage = count,
                Emails = listEmail,
                TotalMail = dataMail.Count()
            };
        }

        [HttpPost]
        public object SendMail(string From, string To, string header, string content, string attachment, string password, string smtpip, int smtpport)
        {
            var msg = new JMessage() { Error = false, ID = 0 };
            try
            {
                /*foreach (var Value in emailMessage)
                {

                }*/
                Send1(From, To, header, content, attachment, password, smtpip, smtpport);

                msg.Error = false;
                msg.Title = "Thêm thành công!";
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra khi thêm";
                return Json(msg);
            }

        }
        public void Send1(string From, string To, string header, string content, string attachment, string password, string smtpip, int smtpport )
        {
            var email = new MimeMessage();
            email.From.Add(MailboxAddress.Parse(From));
            email.To.Add(MailboxAddress.Parse(To));
            email.Subject = header;
            var builder = new BodyBuilder();
            builder.TextBody = content;
            builder.Attachments.Add(attachment);
            email.Body = builder.ToMessageBody();
            //email.Body = new TextPart(TextFormat.Html) { Text = content };

            // send email
            try
            {
                Console.WriteLine("Start");
                var smtp = new MailKit.Net.Smtp.SmtpClient();
                smtp.ServerCertificateValidationCallback = (s, c, h, e) => true;
                smtp.Connect(smtpip, smtpport, SecureSocketOptions.Auto);
                //smtp.Connect(_appSettings.SmtpHost, _appSettings.SmtpPort, SecureSocketOptions.StartTls);
                smtp.Authenticate(From, password);
                smtp.Send(email);
                Console.WriteLine("End");
                smtp.Disconnect(true);
            }

            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        }
        public class JTableMailModel : JTableModel
        {
            public int SettingId { get; set; }
            public string Title { get; set; }
            public string Group { get; set; }
            public string CodeSet { get; set; }
            public string Email { get; set; }
            public string Password { get; set; }
            public string SMTPServer { get; set; }

            public int SMTPPort { get; set; }

            public string POP3Server { get; set; }

            public int POP3Port { get; set; }
        }
        [HttpPost]
        public JsonResult JTable1([FromBody] JTableMailModel jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = (from a in _context.CommonSettings

                         where (a.Group.Equals("EMAIL_SETTING"))
                         select new
                         {
                             a.SettingID,
                             ValueSet = JsonConvert.DeserializeObject<ProductionCompany>(a.ValueSet),
                             a.Group,
                             a.CodeSet,
                             a.Title
                         }).ToList();
            var data2 = (from b in query
                       select
                           new
                           {
                               b.SettingID,
                               b.Group,
                               b.CodeSet,
                               b.Title,
                               Email = b.ValueSet.Email,
                               Password = b.ValueSet.Password,
                               POP3Port = b.ValueSet.POP3Port,
                               POP3Server = b.ValueSet.POP3Server,
                               SMTPPort = b.ValueSet.SMTPPort,
                               SMTPServer = b.ValueSet.SMTPServer,
                           }).ToList();


            var count = query.Count();
            var jdata = JTableHelper.JObjectTable(data2.ToList(), jTablePara.Draw, count, "SettingID", "Group", "CodeSet", "Title", "Email", "Password", "POP3Port", "POP3Server", "SMTPPort", "SMTPServer");
             return Json(jdata);
        }

        public class ProductionCompany
        {
            public string Email { get; set; }
            public string Password { get; set; }
            public string SMTPServer { get; set; }
            public int SMTPPort { get; set; }
            public string POP3Server { get; set; }
            public int POP3Port { get; set; }
        };

        
        [HttpPost]
        public object Insert([FromBody] CommonSetting data)
        {

            var msg = new JMessage() { Error = false, ID = 0 };
            try
            {
                var model = _context.CommonSettings.FirstOrDefault(x => x.SettingID == data.SettingID);
                if (model == null)
                {
                    data.CreatedBy = User.Identity.Name;
                    data.CreatedTime = DateTime.Now;
                    data.IsDeleted = false;
                    _context.CommonSettings.Add(data);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["Thêm mới thành công"];//LMS_EXAM_MSG_ADD_SUCCESS
                    msg.ID = data.SettingID;
                }
                else
                {
                    msg.Title = _sharedResources["Lỗi xảy ra"];//LMS_COURSE_LBL_COURSE_EXIST
                    msg.Error = true;
                }
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi xảy ra khi thêm";
                msg.Title = _sharedResources["Có lỗi khi thêm"];//COM_ERR_ADD
                return Json(msg);
            }
        }
        public JsonResult GetItem(int settingid)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var query = (from a in _context.CommonSettings

                             where (a.Group.Equals("EMAIL_SETTING") && a.SettingID == settingid)
                             select new
                             {
                                 a.SettingID,
                                 ValueSet = JsonConvert.DeserializeObject<ProductionCompany>(a.ValueSet),
                                 a.Group,
                                 a.CodeSet,
                                 a.Title
                             }).ToList();
                msg.Object = (from b in query
                              select
                                  new
                                  {
                                      b.SettingID,
                                      b.Group,
                                      b.CodeSet,
                                      b.Title,
                                      Email = b.ValueSet.Email,
                                      Password = b.ValueSet.Password,
                                      POP3Port = b.ValueSet.POP3Port,
                                      POP3Server = b.ValueSet.POP3Server,
                                      SMTPPort = b.ValueSet.SMTPPort,
                                      SMTPServer = b.ValueSet.SMTPServer,
                                  }).ToList();

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];

            }
            return Json(msg);
        }
        [HttpPost]
        public object InsertText(CandidateCvStorage data)
        {
            var msg = new JMessage() { Error = false, ID = 0 };
            try
            {
                var model = _context.CandidateCvStorages.FirstOrDefault(x => x.Id == data.Id);
                if (model == null)
                {
                    data.CreatedTime = DateTime.Now;
                    _context.CandidateCvStorages.Add(data);
                    _context.SaveChanges();
                    msg.ID = data.Id;
                    msg.Title = "Thêm mới thành công";//LMS_EXAM_MSG_ADD_SUCCESS
                }
                else
                {
                    msg.Title = "Có lỗi xảy ra khi thêm";
                    msg.Error = true;
                }
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = ex.Message;
                return Json(msg);
            }

        }
        public class JTableMailSend : JTableModel
        {
            public int SettingId { get; set; }
            public string Title { get; set; }
            public string Group { get; set; }
            public string CodeSet { get; set; }
            public string Email { get; set; }
            public string Password { get; set; }
            public string SMTPServer { get; set; }

            public int SMTPPort { get; set; }

            public string POP3Server { get; set; }

            public int POP3Port { get; set; }
        }
        public class JsonDataMail
        {
            public string Name { get; set; }
            public string Email { get; set; }
            public string Phone { get; set; }
            public string Pdf { get; set; }
        }
        [HttpPost]
        public JsonResult JTableSend([FromBody] JTableMailSend jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = (from a in _context.CandidateCvStorages

                         where (a.Status.Equals(false))
                         select new
                         {
                             a.Id,
                             a.QrCode,
                             ValueSet = JsonConvert.DeserializeObject<JsonDataMail>(a.JsonData),
                         }).ToList();
            var data2 = (from b in query
                         select
                             new
                             {
                                 b.Id,
                                 b.QrCode,
                                 Name = b.ValueSet.Name,
                                 Email = b.ValueSet.Email,
                                 Phone = b.ValueSet.Phone,
                                 Pdf = b.ValueSet.Pdf,
                             }).ToList();


            var count = query.Count();

            var jdata = JTableHelper.JObjectTable(data2.ToList(), jTablePara.Draw, count, "Id", "QrCode", "Name", "Email", "Phone", "Pdf");
            return Json(jdata);

        }
        public JsonResult GetSendItem(int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var query = (from a in _context.CandidateCvStorages

                             where (a.Id == id)
                             select new
                             {
                                 a.Id,
                                 ValueSet = JsonConvert.DeserializeObject<JsonDataMail>(a.JsonData),
                                 a.QrCode,
                             }).ToList();
                msg.Object = (from b in query
                              select
                                  new
                                  {
                                      b.Id,
                                      b.QrCode,
                                      Name = b.ValueSet.Name,
                                      Email = b.ValueSet.Email,
                                      Phone = b.ValueSet.Phone,
                                      Pdf = b.ValueSet.Pdf,
                                  }).ToList();

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];

            }
            return Json(msg);
        }
        [HttpPost]
        [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
        [RequestSizeLimit(long.MaxValue)]
        public object UploadFile(IFormFile fileUpload)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var upload = _upload.UploadFile(fileUpload, Path.Combine(_hostingEnvironment.WebRootPath, "uploads\\files"));
                if (upload.Error)
                {
                    msg.Error = true;
                    msg.Title = upload.Title;
                }
                else
                {
                    var mimeType = fileUpload.ContentType;
                    var extension = Path.GetExtension(fileUpload.FileName);
                    var pathfile = Path.Combine(_hostingEnvironment.WebRootPath, "uploads\\files");
                    msg.Object = pathfile + '\\'+upload.Object;
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }
        #endregion

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value });
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion
    }
}