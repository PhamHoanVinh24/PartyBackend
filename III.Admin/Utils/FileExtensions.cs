using Dropbox.Api;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Auth.OAuth2.Flows;
using Google.Apis.Auth.OAuth2.Requests;
using Google.Apis.Auth.OAuth2.Responses;
using Google.Apis.Auth.OAuth2.Web;
using Google.Apis.Download;
using Google.Apis.Drive.v3;
using Google.Apis.Services;
using Google.Apis.Util.Store;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using Syncfusion.Presentation;
using Syncfusion.XlsIO;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using ESEIM.Models;
using Xfinium.Pdf;
using Xfinium.Pdf.Content;

namespace ESEIM.Utils
{
    public static class FileExtensions
    {
        private static Regex m_FtpListingRegex = new Regex(@"^([d-])((?:[rwxt-]{3}){3})\s+(\d{1,})\s+(\w+)?\s+(\w+)?\s+(\d{1,})\s+(\w+)\s+(\d{1,2})\s+(\d{4})?(\d{1,2}:\d{2})?\s+(.+?)\s?$",
          RegexOptions.Compiled | RegexOptions.Multiline | RegexOptions.IgnoreCase | RegexOptions.IgnorePatternWhitespace);
        private static readonly String Timeformat = "MMM dd yyyy HH:mm";
        private static readonly string[] DriveScopes = { DriveService.Scope.Drive };
        private static string ApplicationName = "Drive API .NET Quickstart";
        public static DropboxClient Client;
        private static readonly Uri RedirectUri = new Uri(LoopbackHost + "authorize");
        const string LoopbackHost = "http://127.0.0.1:52475/";
        // URL to receive access token from JS.
        private static readonly Uri JSRedirectUri = new Uri(LoopbackHost + "token");

        #region Extend file
        //public static string UserAccessToken;
        private readonly static string TestingPath = "/Testing/Dropbox.Api.Tests";
        //GetText Word()
        public static string ExtractTextWord(IFormFile fileUpload)
        {
            string text = "";
            try
            {
                using (var ms = new MemoryStream())
                {
                    fileUpload.CopyTo(ms);
                    Syncfusion.DocIO.DLS.WordDocument document = new Syncfusion.DocIO.DLS.WordDocument(ms, Syncfusion.DocIO.FormatType.Automatic);
                    text = document.GetText();
                }
            }
            catch (Exception ex)
            {
                return "";
            }
            return text;
        }

        //Get Text from Pdf (Library Xfinium. Pdf. NetCore (9.00))
        public static string ExtractTextPdf(IFormFile fileUpload)
        {
            StringBuilder sb = new StringBuilder();
            try
            {
                using (var ms = new MemoryStream())
                {
                    fileUpload.CopyTo(ms);
                    PdfFixedDocument doc = new PdfFixedDocument(ms);
                    PdfContentExtractionContext ctx = new PdfContentExtractionContext();
                    for (int i = 0; i < doc.Pages.Count; i++)
                    {
                        PdfContentExtractor ce = new PdfContentExtractor(doc.Pages[i]);
                        sb = sb.AppendLine(ce.ExtractText(ctx));
                    }
                }
            }
            catch (Exception ex)
            {
                return "";
            }
            return sb.ToString();
        }

        //Get Text from Excel (Library Xfinium. Pdf. NetCore (9.00))
        public static string ExtractTextExcel(IFormFile fileUpload)
        {
            StringBuilder texttext = new StringBuilder();
            try
            {
                StringBuilder text = new StringBuilder();
                using (var ms = new MemoryStream())
                {
                    fileUpload.CopyTo(ms);
                    ms.Position = 0;
                    ExcelEngine excelEngine = new ExcelEngine();
                    IApplication application = excelEngine.Excel;
                    IWorkbook workbook = application.Workbooks.Create();
                    workbook = application.Workbooks.Open(ms);
                    foreach (IWorksheet worksheet in workbook.Worksheets)
                    {
                        var colum = worksheet.Columns.Length;
                        var row = worksheet.Rows.Length;
                        for (int i = 1; i <= row; i++)
                        {
                            for (var j = 1; j <= colum + 1; j++)
                            {
                                var a = worksheet.GetText(i, j + 1);
                                if (!string.IsNullOrEmpty(worksheet.GetText(i, j)))
                                {
                                    text.AppendLine(worksheet.GetText(i, j));
                                    //var c = text.ToString();
                                }
                            }
                        }

                        var rows = worksheet.Rows;
                        foreach (var item in rows)
                        {
                            var columm = item.Cells;
                            foreach (var item1 in columm)
                            {
                                texttext.Append(item1.DisplayText);
                                texttext.Append(" ");
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                return "";
            }
            return texttext.ToString();
        }

        public static string ExtractTextPowerPoint(IFormFile fileUpload)
        {
            StringBuilder text = new StringBuilder();
            try
            {
                using (var ms = new MemoryStream())
                {
                    fileUpload.CopyTo(ms);
                    IPresentation presentation = Presentation.Open(ms);
                    foreach (ISlide slide in presentation.Slides)
                    {
                        //Iterate all the shapes in the slide to get the text
                        foreach (Syncfusion.Presentation.IShape shape in slide.Shapes)
                        {
                            //Check the shape is table 
                            if (shape is ITable)
                            {
                                ITable table = shape as ITable;
                                //Iterate all the cells in the table and gets the text 
                                foreach (IRow row in table.Rows)
                                {
                                    foreach (ICell cell in row.Cells)
                                    {
                                        //Get the text from the cell body 
                                        text.Append(cell.TextBody.Text);
                                        //Add the extracted text into string collection. 
                                    }
                                }
                            }
                            else
                            {
                                //Iterate all the paragraphs in the shape and gets the text 
                                foreach (IParagraph paragraph in shape.TextBody.Paragraphs)
                                {
                                    foreach (ITextPart textpart in paragraph.TextParts)
                                    {
                                        //Get the text from the paragraph 
                                        text.Append(textpart.Text);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                return "";
            }
            return text.ToString();
        }

        //Get Text from txt 
        public static string ExtractTextTxt(IFormFile fileUpload)
        {
            string content = String.Empty; ;
            using (var ms = new MemoryStream())
            {
                fileUpload.CopyTo(ms);
                using (StreamReader reader = new StreamReader(ms))
                {
                    ms.Position = 0;
                    content = reader.ReadToEnd();
                }
            }
            return content;
        }

        public static List<FileInfo> GetListFile(string dr, string fomart)
        {
            try
            {
                var dirInfo = new DirectoryInfo(dr);
                var file = (from f in dirInfo.GetFiles(fomart) select f).ToList();
                return file;
            }
            catch
            {
                return null;
            }
        }

        //Remove illegal characters from path and filenames? 
        public static string CleanFileName(string fileName)
        {
            try
            {
                //remove char fileName invalid
                fileName = string.Join("_", fileName.Split(System.IO.Path.GetInvalidFileNameChars()));

                //remove fileName error 
                var charsToRemove = new string[] { "+", "%", "#" };
                foreach (var c in charsToRemove)
                {
                    fileName = fileName.Replace(c, "_");
                }
            }
            catch (Exception ex)
            {
                return fileName;
            }
            return fileName;
        }
        #endregion

        #region FTP Server
        public static List<FtpFileInfo> GetFileFtpServer(string address, string username, string password)
        {
            FtpWebRequest request = (FtpWebRequest)WebRequest.Create(address);
            request.Method = WebRequestMethods.Ftp.ListDirectoryDetails;
            request.Credentials = new NetworkCredential(username, password);
            request.UsePassive = true;
            request.UseBinary = true;
            request.KeepAlive = false;

            List<FtpFileInfo> returnValue = new List<FtpFileInfo>();
            using (FtpWebResponse listResponse = (FtpWebResponse)request.GetResponse())
            using (Stream listStream = listResponse.GetResponseStream())
            using (StreamReader listReader = new StreamReader(listStream))
            {
                var result = listReader.ReadToEnd();
                returnValue = GetFilesListFromFtpListingUnix(result);
            }
            return returnValue;
        }
        public static string DeleteFileFtpServer(string address, string username, string password)
        {
            try
            {
                FtpWebRequest request = (FtpWebRequest)WebRequest.Create(address);
                request.Method = WebRequestMethods.Ftp.DeleteFile;
                request.Credentials = new NetworkCredential(username, password);
                request.UsePassive = true;
                request.UseBinary = true;
                request.KeepAlive = false;
                FtpWebResponse response = (FtpWebResponse)request.GetResponse();
                return response.StatusCode.ToString();
            }
            catch (Exception ex)
            {

            }
            return null;
        }
        public static (WebExceptionStatus Status, bool IsSaveUrlPreventive) UploadFileToFtpServer(string address, string addressPreventive, byte[] data, string username, string password)
        {
            WebExceptionStatus result = new WebExceptionStatus();
            bool saveUrlPreventive = false;
            try
            {
                using (WebClient client = new WebClient())
                {
                    client.Credentials = new NetworkCredential(username, password);
                    client.UploadData(address, data);
                }
            }
            catch (WebException ex)
            {
                result = ex.Status;
                FtpWebResponse response = (FtpWebResponse)ex.Response;
                if (response.StatusCode == FtpStatusCode.ActionNotTakenFileUnavailable)
                {
                    var resultPreventive = UploadFileToFtpServerPreventive(addressPreventive, data, username, password);
                    result = resultPreventive.Item1;
                    saveUrlPreventive = resultPreventive.Item2;
                }
            }
            return (result, saveUrlPreventive);
        }
        public static (WebExceptionStatus Status, bool IsSaveUrlPreventive) UploadStreamToFtpServer(string address, string addressPreventive, Stream stream, string username, string password)
        {
            WebExceptionStatus result = new WebExceptionStatus();
            bool saveUrlPreventive = false;
            try
            {
                WebRequest ftpRequest = WebRequest.Create(address);
                ftpRequest.Method = WebRequestMethods.Ftp.UploadFile;
                ftpRequest.Credentials = new NetworkCredential(username, password);

                using (Stream requestStream = ftpRequest.GetRequestStream())
                {
                    stream.CopyTo(requestStream);
                    using (FtpWebResponse response = (FtpWebResponse)ftpRequest.GetResponse())
                    {
                        //Console.WriteLine($"Upload File Complete, status {response.StatusDescription}");
                    }
                }
            }
            catch (WebException ex)
            {
                result = ex.Status;
                FtpWebResponse response = (FtpWebResponse)ex.Response;
                if (response.StatusCode == FtpStatusCode.ActionNotTakenFileUnavailable)
                {
                    var resultPreventive = UploadStreamToFtpServerPreventive(addressPreventive, stream, username, password);
                    result = resultPreventive.Item1;
                    saveUrlPreventive = resultPreventive.Item2;
                }
            }
            return (result, saveUrlPreventive);
        }
        private static (WebExceptionStatus, bool) UploadFileToFtpServerPreventive(string addressPreventive, byte[] data, string username, string password)
        {
            WebExceptionStatus result = new WebExceptionStatus();
            bool isUpload = false;
            try
            {
                using (WebClient client = new WebClient())
                {
                    client.Credentials = new NetworkCredential(username, password);
                    client.UploadData(addressPreventive, data);
                    isUpload = true;
                }
            }
            catch (WebException ex)
            {
                result = ex.Status;
            }
            return (result, isUpload);
        }
        private static (WebExceptionStatus, bool) UploadStreamToFtpServerPreventive(string addressPreventive, Stream stream, string username, string password)
        {
            WebExceptionStatus result = new WebExceptionStatus();
            bool isUpload = false;
            try
            {
                WebRequest ftpRequest = WebRequest.Create(addressPreventive);
                ftpRequest.Method = WebRequestMethods.Ftp.UploadFile;
                ftpRequest.Credentials = new NetworkCredential(username, password);

                Stream requestStream = ftpRequest.GetRequestStream();
                stream.CopyTo(requestStream);
                requestStream.Close();
                isUpload = true;
                using (var response = (FtpWebResponse)ftpRequest.GetResponse()) { }
            }
            catch (WebException ex)
            {
                result = ex.Status;
            }
            return (result, isUpload);
        }

        private static List<FtpFileInfo> GetFilesListFromFtpListingUnix(String filesListing)
        {
            List<FtpFileInfo> files = new List<FtpFileInfo>();
            MatchCollection matches = m_FtpListingRegex.Matches(filesListing);
            if (matches.Count == 0 && filesListing.Trim('\r', '\n', '\t', ' ').Length != 0)
                return null; // parse error. Could throw some kind of exception here too.
            foreach (Match match in matches)
            {
                FtpFileInfo fileInfo = new FtpFileInfo();
                Char dirchar = match.Groups[1].Value.ToLowerInvariant()[0];
                fileInfo.IsDirectory = dirchar == 'd';
                fileInfo.Permissions = match.Groups[2].Value.ToCharArray();
                // No clue what "inodes" actually means...
                Int32 inodes;
                fileInfo.NrOfInodes = Int32.TryParse(match.Groups[3].Value, out inodes) ? inodes : 1;
                fileInfo.User = match.Groups[4].Success ? match.Groups[4].Value : null;
                fileInfo.Group = match.Groups[5].Success ? match.Groups[5].Value : null;
                Int64 fileSize;
                Int64.TryParse(match.Groups[6].Value, out fileSize);
                fileInfo.FileSize = fileSize;
                String month = match.Groups[7].Value;
                String day = match.Groups[8].Value.PadLeft(2, '0');
                String year = match.Groups[9].Success ? match.Groups[9].Value : DateTime.Now.Year.ToString(CultureInfo.InvariantCulture);
                String time = match.Groups[10].Success ? match.Groups[10].Value.PadLeft(5, '0') : "00:00";
                String timeString = month + " " + day + " " + year + " " + time;
                DateTime lastModifiedDate;
                if (!DateTime.TryParseExact(timeString, Timeformat, CultureInfo.InvariantCulture, DateTimeStyles.None, out lastModifiedDate))
                    lastModifiedDate = DateTime.MinValue;
                fileInfo.LastModifiedDate = lastModifiedDate;
                fileInfo.FileName = match.Groups[11].Value;
                files.Add(fileInfo);
            }
            return files;
        }
        #endregion

        #region Google driver
        public static IEnumerable<FtpFileInfo> GetFileGoogleFile(string stringCredential, string refreshToken, string parentId, string user)
        {
            UserCredential credential;
            try
            {
                // Sử dụng refreshToken để sinh ra Access Token mới
                //string credPath = pathToken;
                var json = stringCredential;
                byte[] byteArray = Encoding.ASCII.GetBytes(json);
                MemoryStream stream = new MemoryStream(byteArray);
                var secret = GoogleClientSecrets.Load(stream).Secrets;
                var token = new TokenResponse { RefreshToken = refreshToken };
                credential = new UserCredential(new GoogleAuthorizationCodeFlow(
                    new GoogleAuthorizationCodeFlow.Initializer
                    {
                        ClientSecrets = secret
                    }), user, token);
            }
            catch (Exception ex)
            {

                throw ex;
            }
            /*using (var stream =
                new FileStream(pathCredential, FileMode.Open, FileAccess.Read))
            {
                // The file token.json stores the user's access and refresh tokens, and is created
                // automatically when the authorization flow completes for the first time.
                string credPath = pathToken;

                credential = GoogleWebAuthorizationBroker.AuthorizeAsync(
                    GoogleClientSecrets.Load(stream).Secrets,
                    Scopes,
                    "user",
                    CancellationToken.None,
                    new FileDataStore(credPath, true)).Result;
            }*/

            // Create Drive API service.
            var service = new DriveService(new BaseClientService.Initializer()
            {
                HttpClientInitializer = credential,
                ApplicationName = ApplicationName,
            });

            // Define parameters of request.
            FilesResource.ListRequest listRequest = service.Files.List();
            listRequest.Fields = "nextPageToken, files(id, name, size, mimeType, capabilities, modifiedTime)";
            listRequest.Q = !string.IsNullOrEmpty(parentId) ? "'" + parentId + "' in parents" : "'root' in parents";
            listRequest.PageSize = 1000;
            // List files.
            IList<Google.Apis.Drive.v3.Data.File> files = listRequest.Execute()
                .Files;
            var listFile = files.Select(x => new FtpFileInfo
            {
                Id = x.Id,
                FileName = x.Name,
                LastModifiedDate = x.ModifiedTime,
                MimeType = x.MimeType,
                FileSize = x.Size,
                IsDirectory = x.Capabilities.CanListChildren == true ? true : false
            });
            return listFile;
        }
        public static IEnumerable<FtpFileInfo> GetFolderGoogleFile(string stringCredential, string refreshToken, string parentId, string user)
        {
            UserCredential credential;
            try
            {
                // Sử dụng refreshToken để sinh ra Access Token mới
                //string credPath = pathToken;
                var json = stringCredential;
                byte[] byteArray = Encoding.ASCII.GetBytes(json);
                MemoryStream stream = new MemoryStream(byteArray);
                var secret = GoogleClientSecrets.Load(stream).Secrets;
                var token = new TokenResponse { RefreshToken = refreshToken };
                credential = new UserCredential(new GoogleAuthorizationCodeFlow(
                    new GoogleAuthorizationCodeFlow.Initializer
                    {
                        ClientSecrets = secret
                    }), user, token);
                /*credential = GoogleWebAuthorizationBroker.AuthorizeAsync(
                    secret,
                    Scopes,
                    user,
                    CancellationToken.None,
                    new FileDataStore(credPath, true)).Result;*/
            }
            catch (Exception ex)
            {

                throw ex;
            }
            /*using (var stream =
                new FileStream(pathCredential, FileMode.Open, FileAccess.Read))
            {
                // The file token.json stores the user's access and refresh tokens, and is created
                // automatically when the authorization flow completes for the first time.
                string credPath = pathToken;

                credential = GoogleWebAuthorizationBroker.AuthorizeAsync(
                    GoogleClientSecrets.Load(stream).Secrets,
                    Scopes,
                    "user",
                    CancellationToken.None,
                    new FileDataStore(credPath, true)).Result;
            }*/

            // Create Drive API service.
            var service = new DriveService(new BaseClientService.Initializer()
            {
                HttpClientInitializer = credential,
                ApplicationName = ApplicationName,
            });

            // Define parameters of request.
            FilesResource.ListRequest listRequest = service.Files.List();
            listRequest.Fields = "nextPageToken, files(id, name, size, mimeType, capabilities, modifiedTime)";
            listRequest.Q = !string.IsNullOrEmpty(parentId) ? "'" + parentId + "' in parents and mimeType='application/vnd.google-apps.folder'" : "'root' in parents and mimeType='application/vnd.google-apps.folder'";
            listRequest.PageSize = 1000;
            // List files.
            IList<Google.Apis.Drive.v3.Data.File> files = listRequest.Execute()
                .Files;
            var listFile = files.Select(x => new FtpFileInfo
            {
                Id = x.Id,
                FileName = x.Name,
                LastModifiedDate = x.ModifiedTime,
                MimeType = x.MimeType,
                FileSize = x.Size,
                IsDirectory = x.Capabilities.CanListChildren == true ? true : false
            });
            return listFile;
        }
        public static string UploadFileToDrive(string stringCredential, string refreshToken, string fileName, Stream fileSteam, string conentType, string folderId, string user = "user")
        {
            UserCredential credential;
            try
            {
                // Sử dụng refreshToken để sinh ra Access Token mới
                //string credPath = pathToken;
                var json = stringCredential;
                byte[] byteArray = Encoding.ASCII.GetBytes(json);
                MemoryStream stream = new MemoryStream(byteArray);
                var secret = GoogleClientSecrets.Load(stream).Secrets;
                var token = new TokenResponse { RefreshToken = refreshToken };
                credential = new UserCredential(new GoogleAuthorizationCodeFlow(
                    new GoogleAuthorizationCodeFlow.Initializer
                    {
                        ClientSecrets = secret
                    }), user, token);
                /*credential = GoogleWebAuthorizationBroker.AuthorizeAsync(
                    secret,
                    Scopes,
                    user,
                    CancellationToken.None,
                    new FileDataStore(credPath, true)).Result;

                Console.WriteLine("Credential file saved to: " + credPath);*/
            }
            catch (Exception ex)
            {

                throw ex;
            }
            /*using (var stream =
                new FileStream(pathCredential, FileMode.Open, FileAccess.Read))
            {
                // The file token.json stores the user's access and refresh tokens, and is created
                // automatically when the authorization flow completes for the first time.
                string credPath = pathToken;

                credential = GoogleWebAuthorizationBroker.AuthorizeAsync(
                    GoogleClientSecrets.Load(stream).Secrets,
                    Scopes,
                    "user",
                    CancellationToken.None,
                    new FileDataStore(credPath, true)).Result;
            }*/

            // Create Drive API service.
            var service = new DriveService(new BaseClientService.Initializer()
            {
                HttpClientInitializer = credential,
                ApplicationName = ApplicationName,
            });
            var fileMatadata = new Google.Apis.Drive.v3.Data.File();
            fileMatadata.Name = fileName;
            fileMatadata.Parents = new List<string> { folderId };

            FilesResource.CreateMediaUpload request;

            request = service.Files.Create(fileMatadata, fileSteam, conentType);
            request.Upload();

            var file = request.ResponseBody;

            return file.Id;
        }
        public static byte[] DownloadFileGoogle(string stringCredential, string refreshToken, string fileId, string user = "user")
        {
            UserCredential credential;
            try
            {
                // Sử dụng refreshToken để sinh ra Access Token mới
                //string credPath = pathToken;
                var json = stringCredential;
                byte[] byteArray = Encoding.ASCII.GetBytes(json);
                MemoryStream stream = new MemoryStream(byteArray);
                var secret = GoogleClientSecrets.Load(stream).Secrets;
                var token = new TokenResponse { RefreshToken = refreshToken };
                credential = new UserCredential(new GoogleAuthorizationCodeFlow(
                    new GoogleAuthorizationCodeFlow.Initializer
                    {
                        ClientSecrets = secret
                    }), user, token);
            }
            catch (Exception ex)
            {

                throw ex;
            }
            /*using (var stream =
                new FileStream(pathCredential, FileMode.Open, FileAccess.Read))
            {
                // The file token.json stores the user's access and refresh tokens, and is created
                // automatically when the authorization flow completes for the first time.
                string credPath = pathToken;

                credential = GoogleWebAuthorizationBroker.AuthorizeAsync(
                    GoogleClientSecrets.Load(stream).Secrets,
                    Scopes,
                    "user",
                    CancellationToken.None,
                    new FileDataStore(credPath, true)).Result;
            }*/

            // Create Drive API service.
            var service = new DriveService(new BaseClientService.Initializer()
            {
                HttpClientInitializer = credential,
                ApplicationName = ApplicationName,
            });

            var request = service.Files.Get(fileId);
            var streamFile = new MemoryStream();

            // Add a handler which will be notified on progress changes.
            // It will notify on each chunk download and when the
            // download is completed or failed.
            request.MediaDownloader.ProgressChanged +=
                (IDownloadProgress progress) =>
                {
                    switch (progress.Status)
                    {
                        case DownloadStatus.Downloading:
                            {
                                Console.WriteLine(progress.BytesDownloaded);
                                break;
                            }
                        case DownloadStatus.Completed:
                            {
                                Console.WriteLine("Download complete.");
                                break;
                            }
                        case DownloadStatus.Failed:
                            {
                                Console.WriteLine("Download failed.");
                                break;
                            }
                    }
                };
            request.Download(streamFile);
            return streamFile.ToArray();
        }
        public static string OpenFileGoogle(string stringCredential, string refreshToken, string fileId, string user)
        {
            UserCredential credential;
            try
            {
                // Sử dụng refreshToken để sinh ra Access Token mới
                //string credPath = pathToken;
                var json = stringCredential;
                byte[] byteArray = Encoding.ASCII.GetBytes(json);
                MemoryStream stream = new MemoryStream(byteArray);
                var secret = GoogleClientSecrets.Load(stream).Secrets;
                var token = new TokenResponse { RefreshToken = refreshToken };
                credential = new UserCredential(new GoogleAuthorizationCodeFlow(
                    new GoogleAuthorizationCodeFlow.Initializer
                    {
                        ClientSecrets = secret
                    }), user, token);
                //credential = GoogleWebAuthorizationBroker.AuthorizeAsync(
                //    secret,
                //    Scopes,
                //    user,
                //    CancellationToken.None,
                //    new FileDataStore(credPath, true)).Result;

                //Console.WriteLine("Credential file saved to: " + credPath);
            }
            catch (Exception ex)
            {
                throw ex;
            }

            // Create Drive API service.
            var service = new DriveService(new BaseClientService.Initializer()
            {
                HttpClientInitializer = credential,
                ApplicationName = ApplicationName,
            });

            var file = service.Files.Get(fileId);
            file.Fields = "*";
            var link = file.Execute().WebViewLink;
            return link;
        }
        public static string GetVideoGoogle(string stringCredential, string refreshToken, string fileId, string user)
        {
            UserCredential credential;
            try
            {
                // Sử dụng refreshToken để sinh ra Access Token mới
                //string credPath = pathToken;
                var json = stringCredential;
                byte[] byteArray = Encoding.ASCII.GetBytes(json);
                MemoryStream stream = new MemoryStream(byteArray);
                var secret = GoogleClientSecrets.Load(stream).Secrets;
                var token = new TokenResponse { RefreshToken = refreshToken };
                credential = new UserCredential(new GoogleAuthorizationCodeFlow(
                    new GoogleAuthorizationCodeFlow.Initializer
                    {
                        ClientSecrets = secret
                    }), user, token);
                //credential = GoogleWebAuthorizationBroker.AuthorizeAsync(
                //    secret,
                //    Scopes,
                //    user,
                //    CancellationToken.None,
                //    new FileDataStore(credPath, true)).Result;

                //Console.WriteLine("Credential file saved to: " + credPath);
            }
            catch (Exception ex)
            {
                throw ex;
            }

            // Create Drive API service.
            var service = new DriveService(new BaseClientService.Initializer()
            {
                HttpClientInitializer = credential,
                ApplicationName = ApplicationName,
            });

            var file = service.Files.Get(fileId);
            file.Fields = "*";
            var fileExc = file.Execute();
            //var videoFile = (VideoFile)fileExc;
            return "";
        }
        public static JMessage GetGoogleCredentialUserId(string stringCredential, string pathToken, /*string uri,*/ string user)
        {
            //UserCredential credential;
            JMessage msg = new JMessage { Error = false, Title = "" };
            try
            {
                // Yêu cầu người dùng xác thực lần đầu và thông tin sẽ được lưu vào thư mục token.json
                var credentialJson = JsonConvert.DeserializeObject<WebCredential>((string)stringCredential);
                UserCredential credential;

                byte[] byteArray = Encoding.ASCII.GetBytes((string)stringCredential);
                MemoryStream stream = new MemoryStream(byteArray);
                var secret = GoogleClientSecrets.Load(stream).Secrets;
                credential = GoogleWebAuthorizationBroker.AuthorizeAsync(
                    secret,
                    DriveScopes,
                    user,
                    CancellationToken.None,
                    new FileDataStore(pathToken, true)).Result;
                msg.Object = new GoogleCredentialObject
                {
                    ClientId = credentialJson.web.client_id,
                    RefreshToken = credential.Token.RefreshToken,
                };
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Error while trying to get credential";
            }

            return msg;
        }
        public static JMessage GetGoogleCredentialServer(string stringCredential, string pathToken, string user, string uri)
        {
            //UserCredential credential;
            JMessage msg = new JMessage { Error = false, Title = "" };
            try
            {
                // Yêu cầu người dùng xác thực lần đầu và thông tin sẽ được lưu vào thư mục token.json
                byte[] byteArray = Encoding.ASCII.GetBytes((string)stringCredential);
                MemoryStream stream = new MemoryStream(byteArray);
                var secret = GoogleClientSecrets.Load(stream).Secrets;
                IAuthorizationCodeFlow flow = new ForceOfflineGoogleAuthorizationCodeFlow(new GoogleAuthorizationCodeFlow.Initializer
                {
                    ClientSecrets = secret,
                    DataStore = new FileDataStore(pathToken, true),
                    Scopes = DriveScopes,
                });
                var key = DateTime.Now.ToString("ddMMyyyy");
                FileDataStore fileStore = new FileDataStore(pathToken, true);
                fileStore.DeleteAsync<TokenResponse>(user).Wait();
                var result = new AuthorizationCodeWebApp(flow, uri, key).AuthorizeAsync(user, CancellationToken.None).Result;

                Uri myUri = new Uri(result.RedirectUri);
                string state = HttpUtility.ParseQueryString(myUri.Query).Get("state");
                msg.Object = new GoogleAuthorizationCodeWebAppResult
                {
                    RedirectUri = result.RedirectUri,
                    State = state
                };
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = "CREDENTIAL_ERROR";
                msg.Title = "Error while trying to get credential";
            }

            return msg;
        }
        public async static Task<JMessage> ExchangeCodeForGoogleToken(string stringCredential, string pathToken, string user, string uri, string code)
        {
            //UserCredential credential;
            JMessage msg = new JMessage { Error = false, Title = "" };
            try
            {
                // Trao đổi code lấy refresh token
                byte[] byteArray = Encoding.ASCII.GetBytes((string)stringCredential);
                MemoryStream stream = new MemoryStream(byteArray);
                var secret = GoogleClientSecrets.Load(stream).Secrets;
                IAuthorizationCodeFlow flow = new ForceOfflineGoogleAuthorizationCodeFlow(new GoogleAuthorizationCodeFlow.Initializer
                {
                    ClientSecrets = secret,
                    DataStore = new FileDataStore(pathToken, true),
                    Scopes = DriveScopes,
                });
                FileDataStore fileStore = new FileDataStore(pathToken, true);
                fileStore.DeleteAsync<TokenResponse>(user).Wait();
                TokenResponse tokenResponse = await fileStore.GetAsync<TokenResponse>(user);

                if (tokenResponse == null)
                {
                    // token data does not exist for this user
                    tokenResponse = await flow.ExchangeCodeForTokenAsync(
                      user, // user for tracking the userId on our backend system
                      code,
                      uri, // redirect_uri can not be empty. Must be one of the redirects url listed in your project in the api console
                      CancellationToken.None);
                }
                msg.Object = tokenResponse.RefreshToken;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Error while trying to get credential";
            }

            return msg;
        }

        public async static Task<JMessage> ExchangeCodeForIdentity(string stringCredential, string pathToken,
            string user, string uri, string code)
        {
            JMessage msg = new JMessage { Error = false, Title = "" };
            try
            {
                // Trao đổi code lấy refresh token
                byte[] byteArray = Encoding.ASCII.GetBytes((string)stringCredential);
                MemoryStream stream = new MemoryStream(byteArray);
                var secret = GoogleClientSecrets.Load(stream).Secrets;
                IAuthorizationCodeFlow flow = new ForceOfflineGoogleAuthorizationCodeFlow(new GoogleAuthorizationCodeFlow.Initializer
                {
                    ClientSecrets = secret,
                    DataStore = new FileDataStore(pathToken, true),
                    Scopes = DriveScopes,
                });
                FileDataStore fileStore = new FileDataStore(pathToken, true);
                fileStore.DeleteAsync<TokenResponse>(user).Wait();
                TokenResponse tokenResponse = await fileStore.GetAsync<TokenResponse>(user);

                if (tokenResponse == null)
                {
                    // token data does not exist for this user
                    tokenResponse = await flow.ExchangeCodeForTokenAsync(
                        user, // user for tracking the userId on our backend system
                        code,
                        uri, // redirect_uri can not be empty. Must be one of the redirects url listed in your project in the api console
                        CancellationToken.None);
                }
                msg.Object = tokenResponse.RefreshToken;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Error while trying to get credential";
            }

            return msg;
        }
        public static string DeleteFileGoogleServer(string stringCredential, string refreshToken, string fileId, string user = "user")
        {
            UserCredential credential;
            try
            {
                // Sử dụng refreshToken để sinh ra Access Token mới
                //string credPath = pathToken;
                var json = stringCredential;
                byte[] byteArray = Encoding.ASCII.GetBytes(json);
                MemoryStream stream = new MemoryStream(byteArray);
                var secret = GoogleClientSecrets.Load(stream).Secrets;
                var token = new TokenResponse { RefreshToken = refreshToken };
                credential = new UserCredential(new GoogleAuthorizationCodeFlow(
                    new GoogleAuthorizationCodeFlow.Initializer
                    {
                        ClientSecrets = secret
                    }), user, token);
                //credential = GoogleWebAuthorizationBroker.AuthorizeAsync(
                //    secret,
                //    Scopes,
                //    user,
                //    CancellationToken.None,
                //    new FileDataStore(credPath, true)).Result;

                //Console.WriteLine("Credential file saved to: " + credPath);
            }
            catch (Exception ex)
            {
                throw ex;
            }

            // Create Drive API service.
            var service = new DriveService(new BaseClientService.Initializer()
            {
                HttpClientInitializer = credential,
                ApplicationName = ApplicationName,
            });
            string status = service.Files.Delete(fileId).Execute();
            return status;
        }

        public static object GetGoogleVideoDuration(string stringCredential, string refreshToken, string fileId,
            string user)
        {
            UserCredential credential;
            try
            {
                // Sử dụng refreshToken để sinh ra Access Token mới
                //string credPath = pathToken;
                var json = stringCredential;
                byte[] byteArray = Encoding.ASCII.GetBytes(json);
                MemoryStream stream = new MemoryStream(byteArray);
                var secret = GoogleClientSecrets.Load(stream).Secrets;
                var token = new TokenResponse { RefreshToken = refreshToken };
                credential = new UserCredential(new GoogleAuthorizationCodeFlow(
                    new GoogleAuthorizationCodeFlow.Initializer
                    {
                        ClientSecrets = secret
                    }), user, token);
                //credential = GoogleWebAuthorizationBroker.AuthorizeAsync(
                //    secret,
                //    Scopes,
                //    user,
                //    CancellationToken.None,
                //    new FileDataStore(credPath, true)).Result;

                //Console.WriteLine("Credential file saved to: " + credPath);
            }
            catch (Exception ex)
            {
                throw ex;
            }

            // Create Drive API service.
            var service = new DriveService(new BaseClientService.Initializer()
            {
                HttpClientInitializer = credential,
                ApplicationName = ApplicationName,
            });

            var file = service.Files.Get(fileId);
            file.Fields = "*";
            var duration = file.Execute().VideoMediaMetadata.DurationMillis;
            return duration;
        }
        #endregion
        #region Dropbox
        //public static async Task<string> GetDropBoxFile()
        //{
        //    var token = "Li4fg8X5_gAAAAAAAAAANNvPatBn4Kslbq9ljeeCWVW9DNbXtq-2hTTshMFbK-y-";
        //    //string AccessToken;
        //    const string AppKey = "dxgio2jimc45bmk";
        //    const string redirectUrl = "https://www.dropbox.com/1/oauth2/redirect_receiver";
        //    string oauthUrl =
        //        $@"https://www.dropbox.com/1/oauth2/authorize?response_type=token&redirect_uri={redirectUrl}&client_id={AppKey}";
        //    //var uriBuilder = new UriBuilder();
        //    var oauth2State = Guid.NewGuid().ToString("N");
        //    Uri authorizeUri = DropboxOAuth2Helper.GetAuthorizeUri(OAuthResponseType.Token, AppKey, redirectUrl, state: oauth2State);

        //    //http.Start();

        //    //UserAccessToken = response.AccessToken;
        //    //using(var dropbox = new DropboxClient(token))
        //    //{
        //    //    var a = await dropbox.Users.GetCurrentAccountAsync();
        //    //    var id = await dropbox.Files.ListFolderAsync(path: "");
        //    //}
        //    Client = new DropboxClient("Li4fg8X5_gAAAAAAAAAAMEyqatZxc-fVJ1r0vktocyQ");
        //    //UserAccessToken = context.Properties["userAccessToken"].ToString();
        //    // Get the OAuth Request Url
        //    return "";
        //}
        #endregion

        #region TraverseTree

        //public static string GetPosition(PAreaCategory lastChild, List<PAreaCategory> categories)
        //{
        //    var lookup= categories.ToDictionary(n => n.Code);
        //}
        //public static List<THaveParent> FindParents<THaveParent>(THaveParent node, IDictionary<string, THaveParent> lookup)
        //    where THaveParent : class, IHaveParent
        //{
        //    var result = new List<THaveParent>();
        //    while (node != null) {
        //        if (node.Parent == null || !lookup.TryGetValue(node.Parent, out var parent))
        //        {
        //            result.Add(node);
        //            return result;
        //        }
        //        node = parent;
        //    }
        //    return result;
        //}
        public static IEnumerable<T> TraverseBack<T>(this IEnumerable<T> items,
            Func<T, IEnumerable<T>> childSelector, T startChild)
        {
            var stack = new Stack<T>(items);
            while (stack.Any())
            {
                var next = stack.Pop();
                yield return next;
                foreach (var child in childSelector(next))
                    stack.Push(child);
            }
        }
        #endregion
    }
    public class ForceOfflineGoogleAuthorizationCodeFlow : GoogleAuthorizationCodeFlow
    {
        public ForceOfflineGoogleAuthorizationCodeFlow(GoogleAuthorizationCodeFlow.Initializer initializer) : base(initializer) { }

        public override AuthorizationCodeRequestUrl CreateAuthorizationCodeRequest(string redirectUri)
        {
            return new GoogleAuthorizationCodeRequestUrl(new Uri(AuthorizationServerUrl))
            {
                ClientId = ClientSecrets.ClientId,
                Scope = string.Join(" ", Scopes),
                RedirectUri = redirectUri,
                AccessType = "offline",
            };
        }
        /*private static readonly IAuthorizationCodeFlow flow =
            new GoogleAuthorizationCodeFlow(new GoogleAuthorizationCodeFlow.Initializer
                {
                    ClientSecrets = new ClientSecrets
                    {
                        ClientId = "PUT_CLIENT_ID_HERE",
                        ClientSecret = "PUT_CLIENT_SECRET_HERE"
                    },
                    Scopes = new[] { DriveService.Scope.Drive },
                    DataStore = new FileDataStore("Drive.Api.Auth.Store")
                });

        public override string GetUserId(Controller controller)
        {
            // In this sample we use the session to store the user identifiers.
            // That's not the best practice, because you should have a logic to identify
            // a user. You might want to use "OpenID Connect".
            // You can read more about the protocol in the following link:
            // https://developers.google.com/accounts/docs/OAuth2Login.
            var user = controller.Session["user"];
            if (user == null)
            {
                user = Guid.NewGuid();
                controller.Session["user"] = user;
            }
            return user.ToString();

        }

        public override IAuthorizationCodeFlow Flow
        {
            get { return flow; }
        }
         */
    };
}

public class FtpFileInfo
{
    public string Id { get; set; }
    public Boolean IsDirectory { get; set; }
    public Char[] Permissions { get; set; }
    public Int32 NrOfInodes { get; set; }
    public String User { get; set; }
    public String Group { get; set; }
    public Int64? FileSize { get; set; }
    public DateTime? LastModifiedDate { get; set; }
    public string FileName { get; set; }
    public string MimeType { get; set; }
}

public class WebCredential
{
    public GoogleCredentialCustom web { get; set; }
}

public class GoogleCredentialCustom
{
    public string client_id { get; set; }
    public string project_id { get; set; }
    public string auth_uri { get; set; }
    public string token_uri { get; set; }
    public string auth_provider_x509_cert_url { get; set; }
    public string client_secret { get; set; }
    public List<string> redirect_uris { get; set; }
}

public class GoogleAuthorizationCodeWebAppResult
{
    public string RedirectUri { get; set; }
    public string State { get; set; }
}

public class GoogleCredentialObject
{
    public string ClientId { get; set; }
    public string RefreshToken { get; set; }
}

public class VideoFile : Google.Apis.Drive.v3.Data.File
{
    public string EmbedLink { get; set; }
}
