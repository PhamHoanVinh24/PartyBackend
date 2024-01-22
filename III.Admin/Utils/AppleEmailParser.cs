using Google.Apis.Auth.OAuth2;
using MailKit.Net.Imap;
using MailKit.Search;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace III.Admin.Utils
{
    public class AppleEmailParser
    {
        public async Task<bool> CheckIfVersionIsLive(string versionToCheck)
        {
            var activeVersions = await GetActiveAppVersion();

            if (activeVersions.Contains(versionToCheck))
            {
                Console.WriteLine("Version is live!");
                return true;
            }
            else
            {
                Console.WriteLine("Version is not live.");
                return false;
            }
        }
        public Task<List<string>> GetActiveAppVersion()
        {
            var listVersion = new List<string>();
            using (var client = new ImapClient())
            {
                // Connect to Gmail's IMAP server
                client.Connect("imap.gmail.com", 993, true);

                // Authenticate to the server
                client.Authenticate("Quarkbase3i@gmail.com", "yjsbknobkqrmbcls");

                // Open the inbox folder
                var inbox = client.Inbox;
                inbox.Open(MailKit.FolderAccess.ReadOnly);

                // Find messages that arrived within the last day
                var query = SearchQuery.DeliveredAfter(DateTime.Now.AddDays(-10));
                var uids = inbox.Search(query);

                foreach (var uid in uids)
                {
                    var message = inbox.GetMessage(uid);

                    // If it's an email from Apple containing approval details, parse it
                    if (message.From.Any(f => f.ToString().Contains("apple.com")) &&
                        message.Subject.Contains("Your submission was accepted") &&
                        message.TextBody.Contains("Smart Work"))
                    {
                        //ParseAppleApprovalEmail(message.TextBody);
                        var version = ParseAppleApprovalEmail(message.HtmlBody);
                        listVersion.Add(version);
                    }
                }

                // Disconnect
                client.Disconnect(true);
            }
            return Task.FromResult(listVersion);
        }
        private static string ParseAppleApprovalEmail(string htmlBody)
        {
            Console.WriteLine("Parsing Apple Approval Email...");
            string version = "";
            // Ensure the HTML body is not null
            if (htmlBody == null) throw new ArgumentNullException(nameof(htmlBody));

            // Define a regular expression pattern to extract the version number
            var doc = new HtmlAgilityPack.HtmlDocument();
            doc.LoadHtml(htmlBody);

            var pAfterH3 = doc.DocumentNode.SelectSingleNode("//h3[contains(., 'App Version')]/following-sibling::p");
            if (pAfterH3 != null)
            {// Getting the clean version number using Regex to ensure no whitespace or other characters
                var versionRegex = new Regex(@"\d+\.\d+");
                var match = versionRegex.Match(pAfterH3.InnerText);

                if (match.Success)
                {
                    version = match.Value;
                    Console.WriteLine($"Extracted Version: {version}");
                }
                else
                {
                    Console.WriteLine("Version not found");
                }
            }
            else
            {
                Console.WriteLine("Version not found");
            }

            return version;
        }
    }
}
