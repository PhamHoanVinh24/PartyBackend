using ESEIM.Models;
using ESEIM.Utils;
using III.Domain.Models;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using Lucene.Net.Analysis.Standard;
using Lucene.Net.Documents;
using Lucene.Net.Index;
using Lucene.Net.QueryParsers.Classic;
using Lucene.Net.Search;
using Lucene.Net.Search.Highlight;
using System.IO;
using Lucene.Net.Store;
using Lucene.Net.Util;
using FTU.Utils.HelperNet;
using Newtonsoft.Json.Linq;
using III.Domain.Enums;

using System.Diagnostics;
using System.Net;
using System.Net.Sockets;

namespace III.Admin.Areas.Admin.Controllers
{
    public class PythonCrawlerController : Controller
    {
        private readonly EIMDBContext _context;
        private readonly IRepositoryService _repositoryService;
        public PythonCrawlerController(EIMDBContext context, IRepositoryService repositoryService)
        {
            _context = context;
            _repositoryService = repositoryService;
        }

        public object GetCrawlerData(string BotCode)
        {
            var data = _context.BotManagements.FirstOrDefault(x => x.BotSessionCode == BotCode);
            return data;
        }

        [HttpPost]
        public object InsertCrawlerRunningLog( CrawlerRunningLog data)
        {
            var msg = new JMessage() { Error = false, ID = 0 };
            try
            {
                var model = _context.CrawlerRunningLogs.FirstOrDefault(x => x.Id == data.Id);
                if (model == null)
                {
                    data.CreatedTime = DateTime.Now;
                    _context.CrawlerRunningLogs.Add(data);
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
            catch (Exception ex )
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra khi thêm";
                //msg.Title = _sharedResources["Có lỗi khi thêm"];//COM_ERR_ADD
                return Json(msg);
            }
        }

        [HttpPost]
        public object InsertCrawlerCrawlerSessionContent(CrawlerSessionContentResult data)
        {
            var msg = new JMessage() { Error = false, ID = 0 };
            try
            {
                var model = _context.CrawlerSessionContentResults.FirstOrDefault(x => x.Id == data.Id);
                if (model == null)
                {
                    data.CreatedTime = DateTime.Now;
                    _context.CrawlerSessionContentResults.Add(data);
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
                msg.Title = "Có lỗi xảy ra khi thêm";
                //msg.Title = _sharedResources["Có lỗi khi thêm"];//COM_ERR_ADD
                return Json(msg);
            }
        }

        [HttpPost]
        public object InsertBotSocialLog(BotSocialSessionLog data)
        {
            var msg = new JMessage() { Error = false, ID = 0 };
            try
            {
                var model = _context.BotSocialSessionLog.FirstOrDefault(x => x.Id == data.Id);
                if (model == null)
                {
                    data.CreatedTime = DateTime.Now;
                    _context.BotSocialSessionLog.Add(data);
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
            catch (Exception)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra khi thêm";
                //msg.Title = _sharedResources["Có lỗi khi thêm"];//COM_ERR_ADD
                return Json(msg);
            }
        }

       

        [HttpPost]
        public object InsertLinkedInInfo(LinkedInInfoData data)
        {
            var msg = new JMessage() { Error = false, ID = 0 };
            try
            {

                var model = _context.LinkedInInfoDatas.FirstOrDefault(x => x.ProfileUrl == data.ProfileUrl);
                if (model == null)
                {
                    data.CreatedTime = DateTime.Now;
                    _context.LinkedInInfoDatas.Add(data);
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
            catch (Exception)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra khi thêm";
                //msg.Title = _sharedResources["Có lỗi khi thêm"];//COM_ERR_ADD
                return Json(msg);
            }
        }


        [HttpPost]
        public object ListWebrtcChannelBw()
        {
            var msg = new JMessage() { Error = false, ID = 0 };
            try
            {

                var data = from a in _context.BwWebrtcChannelControls
                           where a.Status != false
                           select new 
                           {
                               ID = a.Id,
                               Channel = a.ChannelId,
                               status = a.Status
                            };
                msg.Object = data;
                msg.Error = false;
                return Json(msg);
            }
            catch (Exception)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra khi thêm";
                //msg.Title = _sharedResources["Có lỗi khi thêm"];//COM_ERR_ADD
                return Json(msg);
            }
        }



        [HttpPost]
        public object InsertLinkedInUrl(LinkedInProfileUrl data)
        {
            var msg = new JMessage() { Error = false, ID = 0 };
            try
            {

                var model = _context.LinkedInProfileUrls.FirstOrDefault(x => x.LinkedInUrl == data.LinkedInUrl);
                if (model == null)
                {
                    data.CreatedTime = DateTime.Now;
                    _context.LinkedInProfileUrls.Add(data);
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
            catch (Exception)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra khi thêm";
                //msg.Title = _sharedResources["Có lỗi khi thêm"];//COM_ERR_ADD
                return Json(msg);
            }
        }
        //step 2 insert elemednt UID
        [HttpPost]
        public object InsertLinkedInLog(LinkedInDataProfile data)
        {
            var msg = new JMessage() { Error = false, ID = 0 };
            try
            {

                var model = _context.LinkedInDataProfiles.FirstOrDefault(x => x.ProfileUrl == data.ProfileUrl);
                if (model == null)
                {
                    data.CreatedTime = DateTime.Now;
                    _context.LinkedInDataProfiles.Add(data);
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
            catch (Exception)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra khi thêm";
                //msg.Title = _sharedResources["Có lỗi khi thêm"];//COM_ERR_ADD
                return Json(msg);
            }
        }
       
        public class GetLinkdInData
        {
            public string ProfileUrl { get; set; }
            public string ElementSite { get; set; }
        }
        [HttpPost]
        public List<GetLinkdInData> GetDataLinkedIn()
        {
            string[] param = new string[] { };
            object[] val = new object[] { };
            DataTable rs = _repositoryService.GetDataTableProcedureSql("[P_LINKED_IN_GET_DATA]", param, val);
            var query = CommonUtil.ConvertDataTable<GetLinkdInData>(rs);
            return query;
        }
        #region pythoncall
        public class JtableDirectoryModel : JTableModel
        {
            public string ReposCode { get; set; }
            public string Folder { get; set; }
            public string ParentId { get; set; }
            public string CatCode { get; set; }
        }
        [HttpPost]
        public object JtableFileWithRepository([FromBody] JtableDirectoryModel jTablePara)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
                var repos = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == jTablePara.ReposCode);
                if (repos != null)
                {
                    if (repos.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server))
                    {
                        var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + repos.Server + jTablePara.Folder);
                        var list = FileExtensions.GetFileFtpServer(urlEnd, repos.Account, repos.PassWord);
                        var count = list.Count();
                        var data = list.Skip(intBeginFor).Take(jTablePara.Length).ToList();
                        var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "FileName", "FileSize", "IsDirectory", "LastModifiedDate");
                        return Json(jdata);
                    }
                    else if (repos.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.GooglerDriver))
                    {
                        var apiTokenService = _context.TokenManagers.FirstOrDefault(x => x.AccountCode == repos.Token);
                        var jdata = new JObject();
                        if (apiTokenService != null && !String.IsNullOrEmpty(apiTokenService.RefreshToken))
                        {
                            var json = apiTokenService.CredentialsJson;
                            var user = apiTokenService.Email;
                            var token = apiTokenService.RefreshToken;
                            var list = FileExtensions.GetFileGoogleFile(json, token, jTablePara.ParentId, user);
                            var count = list.Count();
                            var data = list.Skip(intBeginFor).Take(jTablePara.Length).ToList();
                            jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "FileName", "FileSize", "IsDirectory", "LastModifiedDate", "MimeType");
                            return Json(jdata);
                        }
                        else
                        {
                            jdata = JTableHelper.JObjectTable(new List<FtpFileInfo>(), jTablePara.Draw, 0, "Id", "FileName", "FileSize", "IsDirectory", "LastModifiedDate");
                            return Json(jdata);
                        }
                    }
                    else
                    {
                        var jdata = JTableHelper.JObjectTable(new List<FtpFileInfo>(), jTablePara.Draw, 0, "Id", "FileName", "FileSize", "IsDirectory", "LastModifiedDate");
                        return Json(jdata);
                    }
                }
                else
                {
                    var jdata = JTableHelper.JObjectTable(new List<FtpFileInfo>(), jTablePara.Draw, 0, "Id", "FileName", "FileSize", "IsDirectory", "LastModifiedDate");
                    return Json(jdata);
                }
            }
            catch (Exception ex)
            {
                //msg.Error = true;
                //msg.Object = ex.Message;
                //msg.Title = _sharedResources["COM_MSG_ERR"];
                var jdata = JTableHelper.JObjectTable(new List<FtpFileInfo>(), jTablePara.Draw, 0, "Id", "FileName", "FileSize", "IsDirectory", "LastModifiedDate");
                return Json(jdata);
            }
        }
        #endregion
        public class JtableContentIndex : JTableModel
        {
            public string fileCode { get; set; }
            public string content { get; set; }
            public string pathIndex { get; set; }
        }
       
        [HttpPost]
        public object PythonJtableContentIndex (JtableContentIndex data)
        {
            var msg = new JMessage() { Error = false, ID = 0 };
            try
            {

                LuceneVersion MatchVersion = LuceneVersion.LUCENE_48;
                Lucene.Net.Store.Directory directory = FSDirectory.Open(new DirectoryInfo(data.pathIndex));
                var oAnalyzer = new StandardAnalyzer(MatchVersion);
                if (IndexWriter.IsLocked(directory))
                {
                    IndexWriter.Unlock(directory);
                }
                var oIndexWriterConfig = new IndexWriterConfig(MatchVersion, oAnalyzer);
                var oIndexWriter = new IndexWriter(directory, oIndexWriterConfig);
                Document doc = new Document();

                doc.Add(new TextField("Content", data.content, Field.Store.YES));

                doc.Add(new Field("FileCode", data.fileCode, Field.Store.YES, Field.Index.NOT_ANALYZED));

                oIndexWriter.AddDocument(doc);
                oIndexWriter.Flush(true, true);
                oIndexWriter.DeleteUnusedFiles();
                oIndexWriter.Dispose();
                msg.Error = false;
                msg.Title = "Thêm thành công!";
                return Json(msg);
            }
            catch (Exception)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra khi thêm";
                //msg.Title = _sharedResources["Có lỗi khi thêm"];//COM_ERR_ADD
                return Json(msg);
            }

        }
        [HttpPost]
        [Obsolete]
        public object PythonIndexContent (string fileCode, string content, string pathIndex, string UrlPost,string IdentifierCode)
        {
            var msg = new JMessage() { Error = false, ID = 0 };
            try
            {
                LuceneVersion MatchVersion = LuceneVersion.LUCENE_48;
                Lucene.Net.Store.Directory directory = FSDirectory.Open(new DirectoryInfo(pathIndex));
                var oAnalyzer = new StandardAnalyzer(MatchVersion);
                if (IndexWriter.IsLocked(directory))
                {
                    IndexWriter.Unlock(directory);
                }
                var oIndexWriterConfig = new IndexWriterConfig(MatchVersion, oAnalyzer);
                var oIndexWriter = new IndexWriter(directory, oIndexWriterConfig);
                Document doc = new Document();

                doc.Add(new TextField("Content", content, Field.Store.YES));

                doc.Add(new Field("FileCode", fileCode, Field.Store.YES, Field.Index.NOT_ANALYZED));
                doc.Add(new Field("UrlPost", UrlPost, Field.Store.YES, Field.Index.NOT_ANALYZED));
                doc.Add(new Field("IdentifierCode", IdentifierCode, Field.Store.YES, Field.Index.NOT_ANALYZED));

                oIndexWriter.AddDocument(doc);
                oIndexWriter.Flush(true, true);
                oIndexWriter.DeleteUnusedFiles();
                oIndexWriter.Dispose();

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
        
        [HttpPost]
        public object ActiveSocket(string Port)
        {
            var msg = new JMessage() { Error = false, ID = 0 };
            try
            {
                string command = "";
                if (Port.Contains("9094") == true)
                {

                    command = @"G:\NotePad\test.bat";
                }
                if (Port.Contains("9095") == true)
                {
                    command = @"G:\NotePad\test1.bat";
                }


                System.Diagnostics.Process proc = new System.Diagnostics.Process();
                proc.StartInfo.FileName = command;
                proc.StartInfo.WorkingDirectory = @"F:\PycharmProjects\Source\websocket";
                proc.Start();

                msg.Error = false;
                msg.Title = "Active Port " + Port;
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = ex.Message;
                return Json(msg);
            }

        }
        [HttpPost]
        public object StopSocket(string Port)
        {
            var msg = new JMessage() { Error = false, ID = 0 };
            try
            {
                string command = "";
                if (Port.Contains("9094") == true)
                {

                    command = @"G:\NotePad\Stop.bat";
                }
                if (Port.Contains("9095") == true)
                {
                    command = @"G:\NotePad\Stop1.bat";
                }


                System.Diagnostics.Process proc = new System.Diagnostics.Process();
                proc.StartInfo.FileName = command;
                proc.StartInfo.WorkingDirectory = @"F:\PycharmProjects\Source\websocket";
                proc.Start();

                msg.Error = false;
                msg.Title = "Stop Port " + Port;
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = ex.Message;
                return Json(msg);
            }

        }
        /*[HttpPost]
        public object SendData2Py(string UrlText)
        {
            var msg = new JMessage() { Error = false, ID = 0 };
            try
            {
               
                msg.Error = false;
                msg.Title = UrlText;
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = ex.Message;
                return Json(msg);
            }

        }*/
        public class DataRecivePy : JTableModel
        {
            public string Name { get; set; }
            public string Email { get; set; }
            public string Phone { get; set; }
            public string Pdf { get; set; }
        }
        [HttpPost]
        public object ReciveFromPy(CandidateCvStorage data)
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
        public class CardCommentList
        {
            public string Answer { get; set; }
            public int ID { get; set; }
        }

        [HttpPost]
        public object GPTInsertAnswer(CardCommentList data /*string Answer, int ID*/)
        {
            var msg = new JMessage() { Error = false, ID = 0 };
            try
            {
                var model = _context.CardCommentLists.FirstOrDefault(x => x.Id == data.ID);
                if (model != null)
                {
                    model.IsGptAnswered = true;
                    model.GptAnswer = data.Answer;
                    _context.CardCommentLists.Update(model);
                    _context.SaveChanges();
                    msg.Error = false;
                    msg.Title = "Hoàn thành!";
                }
                else
                {
                    msg.Error = false;
                    msg.Title = "Không tồn tại bản ghi!";
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

    }
}
