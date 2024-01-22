using ESEIM.Models;
using III.Domain.Enums;
using Lucene.Net.Support;
using MailKit;
using MailKit.Net.Pop3;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.AspNetCore.Http;
using MimeKit;
using MimeKit.Text;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace ESEIM.Utils
{
    public interface IEmailConfiguration
    {
        string SmtpServer { get; }
        int SmtpPort { get; }
        string SmtpUsername { get; set; }
        string SmtpPassword { get; set; }
        string DisplayName { get; set; }

        string PopServer { get; }
        int PopPort { get; }
        string PopUsername { get; }
        string PopPassword { get; }
    }

    public class EmailConfiguration : IEmailConfiguration
    {
        public string SmtpServer { get; set; }
        public int SmtpPort { get; set; }
        public string SmtpUsername { get; set; }
        public string SmtpPassword { get; set; }
        public string DisplayName { get; set; }

        public string PopServer { get; set; }
        public int PopPort { get; set; }
        public string PopUsername { get; set; }
        public string PopPassword { get; set; }

    }

    public interface IMailKitService
    {
        void Send(EmailMessage emailMessage);
        List<EmailMessage> ReceiveEmail1(string user, string pass, string IP, int Port);
        List<EmailMessage> ReceiveEmail(int maxCount = 100);
    }

    public class MailKitService : IMailKitService
    {
        private readonly IEmailConfiguration _emailConfiguration;

        public MailKitService(IEmailConfiguration emailConfiguration)
        {
            _emailConfiguration = emailConfiguration;
        }

        public void Send(EmailMessage emailMessage)
        {
            var message = new MimeMessage();
            message.To.AddRange(emailMessage.ToAddresses.Select(x => new MailboxAddress(x.Name, x.Address)));
            message.From.AddRange(emailMessage.FromAddresses.Select(x => new MailboxAddress(x.Name, x.Address)));

            message.Subject = emailMessage.Subject;
            //We will say we are sending HTML. But there are options for plaintext etc. 
            message.Body = new TextPart(TextFormat.Html)
            {
                Text = emailMessage.Content
            };

            //Be careful that the SmtpClient class is the one from Mailkit not the framework!
            using (var emailClient = new SmtpClient())
            {
                //The last parameter here is to use SSL (Which you should!)
                emailClient.Connect(_emailConfiguration.SmtpServer, _emailConfiguration.SmtpPort, SecureSocketOptions.Auto);

                //Remove any OAuth functionality as we won't be using it. 
                emailClient.AuthenticationMechanisms.Remove("XOAUTH2");

                emailClient.Authenticate(_emailConfiguration.SmtpUsername, _emailConfiguration.SmtpPassword);

                emailClient.Send(message);

                emailClient.Disconnect(true);
            }
        }
        

        public List<EmailMessage> ReceiveEmail1(string user, string pass, string IP, int Port)
        {
            try
            {
                using (var emailClient = new Pop3Client())
                {

                    emailClient.ServerCertificateValidationCallback = (s, c, h, e) => true;
                    emailClient.SslProtocols = System.Security.Authentication.SslProtocols.Tls12;
                    emailClient.Connect(IP, Port, SecureSocketOptions.Auto);
                    //emailClient.Connect("smtp.office365.com", 587, SecureSocketOptions.StartTls);
                    emailClient.AuthenticationMechanisms.Remove("XOAUTH2");

                    emailClient.Authenticate(user, pass);  // chỗ này đang bị sai

                    List<EmailMessage> emails = new List<EmailMessage>();
                    var emailAttachs = new List<EmailAttachment>();
                    //for (int i = 0; i < emailClient.Count && i < maxCount; i++)
                    for (int i = 0; i < emailClient.Count; i++)
                    {
                        var message = emailClient.GetMessage(i);
                        
                        var emailMessage = new EmailMessage
                        {
                            Content = !string.IsNullOrEmpty(message.HtmlBody) ? message.HtmlBody : message.TextBody,
                            Subject = message.Subject,
                            Attachments = emailAttachs,
                            MailId = message.MessageId,
                            IsAttach = message.Attachments.Count() > 0 ? true : false,
                            Date = message.Date.UtcDateTime,
                            
                        };
                        
                        try
                        {
                            var data = message.To.Select(x => (MailboxAddress)x).Select(x => new EmailAddress { Address = x.Address, Name = x.Name });
                            emailMessage.ToAddresses.AddRange(data);
                            var data2 = message.From.Select(x => (MailboxAddress)x).Select(x => new EmailAddress { Address = x.Address, Name = x.Name });
                            emailMessage.FromAddresses.AddRange(data2);
                            emails.Add(emailMessage);
                        }
                        catch (Exception ex) {
                            Console.WriteLine(ex.Message);
                            Console.WriteLine(ex.Message);
                            continue;
                        }
                        
                    }
                        return emails;
                }
            }
            catch (Exception ex)
            {
                return Problem(ex.Message);
            }
        }
        public List<EmailMessage> ReceiveEmail(int maxCount = 100)
        {
            try
            {
                using (var emailClient = new Pop3Client())
                {

                    emailClient.ServerCertificateValidationCallback = (s, c, h, e) => true;
                    emailClient.SslProtocols = System.Security.Authentication.SslProtocols.Tls12;
                    emailClient.Connect(_emailConfiguration.PopServer, _emailConfiguration.PopPort, SecureSocketOptions.Auto);
                    //emailClient.Connect("smtp.office365.com", 587, SecureSocketOptions.StartTls);
                    emailClient.AuthenticationMechanisms.Remove("XOAUTH2");

                    emailClient.Authenticate(_emailConfiguration.PopUsername, _emailConfiguration.PopPassword);  // chỗ này đang bị sai

                    List<EmailMessage> emails = new List<EmailMessage>();
                    var emailAttachs = new List<EmailAttachment>();
                    //for (int i = 0; i < emailClient.Count && i < maxCount; i++)
                    for (int i = 0; i < emailClient.Count; i++)
                    {
                        var message = emailClient.GetMessage(i);

                        var emailMessage = new EmailMessage
                        {
                            Content = !string.IsNullOrEmpty(message.HtmlBody) ? message.HtmlBody : message.TextBody,
                            Subject = message.Subject,
                            Attachments = emailAttachs,
                            MailId = message.MessageId,
                            IsAttach = message.Attachments.Count() > 0 ? true : false,
                            Date = message.Date.UtcDateTime,

                        };

                        try
                        {
                            var data = message.To.Select(x => (MailboxAddress)x).Select(x => new EmailAddress { Address = x.Address, Name = x.Name });
                            emailMessage.ToAddresses.AddRange(data);
                            var data2 = message.From.Select(x => (MailboxAddress)x).Select(x => new EmailAddress { Address = x.Address, Name = x.Name });
                            emailMessage.FromAddresses.AddRange(data2);
                            emails.Add(emailMessage);
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.Message);
                            Console.WriteLine(ex.Message);
                            continue;
                        }

                    }
                    return emails;
                }
            }
            catch (Exception ex)
            {
                return Problem(ex.Message);
            }
        }

        private List<EmailMessage> Problem(string message)
        {
            throw new NotImplementedException();
        }

    }

    #region Model
    public class EmailAddress
    {
        public string Name { get; set; }
        public string Address { get; set; }
    }
    public class EmailMessage
    {
        public EmailMessage()
        {
            ToAddresses = new List<EmailAddress>();
            FromAddresses = new List<EmailAddress>();
            Attachments = new List<EmailAttachment>();
        }
        public List<EmailAddress> ToAddresses { get; set; }
        public List<EmailAddress> FromAddresses { get; set; }
        public string Subject { get; set; }
        public string Content { get; set; }
        public string MailId { get; set; }
        public bool IsAttach { get; set; }
        public DateTime Date { get; set; }
        public List<EmailAttachment> Attachments { get; set; }
        public List<IFormFile> ListFileSend { get; set; }
    }

    public class EmailAttachment
    {
        public string FileName { get; set; }
        public string Content { get; set; }
    }
    #endregion
}
