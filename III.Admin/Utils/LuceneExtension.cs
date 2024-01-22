using Lucene.Net.Analysis.Standard;
using Lucene.Net.Analysis.TokenAttributes;
using Lucene.Net.Documents;
using Lucene.Net.Index;
using Lucene.Net.QueryParsers.Classic;
using Lucene.Net.Search;
using Lucene.Net.Search.Highlight;
using Lucene.Net.Store;
using Lucene.Net.Util;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Reflection;
using ESEIM.Models;
using Lucene.Net.Analysis;
using Microsoft.AspNetCore.Hosting;
using Directory = Syncfusion.CompoundFile.XlsIO.Net.Directory;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http.Internal;
using Microsoft.AspNetCore.Mvc;

namespace ESEIM.Utils
{
    public static class LuceneExtension
    {
        public static string[] fileMimetypes = { "text/plain", "application/vnd.ms-powerpoint", "application/msword", "application/x-pdf", "application/pdf", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.openxmlformats-officedocument.presentationml.presentation", "image/png", "image/x-png", "image/jpeg", "image/gif", "image/pjpeg", "image/tiff", "image/svg+xml", "application/x-zip-compressed", "application/octet-stream", "image/*", "video/*", "audio/*", "application/epub+zip", "audio/mpeg" };
        public static string[] fileExt = { ".TXT", ".DOC", ".DOCX", ".PDF", ".PPS", ".PPT", ".PPTX", ".PNG", ".JPG", ".TIF", ".TIFF", ".XLSM", ".XLSX", ".XLSB", ".XLTX", ".XLTM", ".XLS", ".XLT", ".ZIP", ".RAR", ".JPEG", ".MP4", ".MP3", ".EPUB", ".SVG" };

        private static string[] fileLuceneMimetypes = { "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.openxmlformats-officedocument.presentationml.presentation", "application/msword",
            "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/pdf",
            "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "text/plain","image/*"};
        private static string[] fileLucene = { ".DOC", ".DOCX", ".TXT", ".PDF", ".XLSX", ".XLS", ".PPS", ".PPT", ".PPTX" };

        private static readonly log4net.ILog Log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod()?.DeclaringType);
        public static void IndexFile(string fileCode, IFormFile fileUpload, string pathIndex)
        {
            try
            {
                var fileType = fileUpload.ContentType;
                string extension = Path.GetExtension(fileUpload.FileName);
                if (Array.IndexOf(fileLuceneMimetypes, fileType) >= 0 && (Array.IndexOf(fileLucene, extension.ToUpper()) >= 0))
                {
                    const LuceneVersion matchVersion = LuceneVersion.LUCENE_48;
                    Lucene.Net.Store.Directory directory = FSDirectory.Open(new DirectoryInfo(pathIndex));
                    var oAnalyzer = new StandardAnalyzer(matchVersion);
                    if (IndexWriter.IsLocked(directory))
                    {
                        IndexWriter.Unlock(directory);
                    }
                    var oIndexWriterConfig = new IndexWriterConfig(matchVersion, oAnalyzer);
                    var oIndexWriter = new IndexWriter(directory, oIndexWriterConfig);
                    Document doc = new Document();
                    string[] txtMimetypes = { "text/plain" };
                    string[] wordMimetypes = { "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.openxmlformats-officedocument.presentationml.presentation", "application/msword" };
                    string[] excelMimetypes = { "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" };
                    string[] pdfMimetypes = { "application/pdf" };
                    string[] powerPointMimetypes = { "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation" };


                    string[] word = { ".DOC", ".DOCX" };
                    string[] pdf = { ".PDF" };
                    string[] txt = { ".TXT" };
                    string[] excel = { ".XLSX", ".XLS" };
                    string[] powerPoint = { ".PPS", ".PPT", ".PPTX" };

                    Log.Info("Begin job");
                    if (Array.IndexOf(txtMimetypes, fileType) >= 0 && (Array.IndexOf(txt, extension.ToUpper()) >= 0))
                    {
                        string content = FileExtensions.ExtractTextTxt(fileUpload);
                        doc.Add(new TextField("Content", content, Field.Store.YES));
                        Log.Info("Add success");
                    }
                    else if (Array.IndexOf(wordMimetypes, fileType) >= 0 && (Array.IndexOf(word, extension.ToUpper()) >= 0))
                    {
                        string content = FileExtensions.ExtractTextWord(fileUpload);
                        doc.Add(new TextField("Content", content, Field.Store.YES));
                        Log.Info("Add success");
                    }
                    else if (Array.IndexOf(pdfMimetypes, fileType) >= 0 && (Array.IndexOf(pdf, extension.ToUpper()) >= 0))
                    {
                        string content = FileExtensions.ExtractTextPdf(fileUpload);
                        doc.Add(new TextField("Content", content, Field.Store.YES));
                        Log.Info("Add success");
                    }
                    else if (Array.IndexOf(excelMimetypes, fileType) >= 0 && (Array.IndexOf(excel, extension.ToUpper()) >= 0))
                    {
                        string content = FileExtensions.ExtractTextExcel(fileUpload);
                        doc.Add(new TextField("Content", content, Field.Store.YES));
                        Log.Info("Add success");
                    }
                    else if (Array.IndexOf(powerPointMimetypes, fileType) >= 0 && (Array.IndexOf(powerPoint, extension.ToUpper()) >= 0))
                    {
                        string content = FileExtensions.ExtractTextPowerPoint(fileUpload);
                        doc.Add(new TextField("Content", content, Field.Store.YES));
                        Log.Info("Add success");
                    }
                    doc.Add(new Field("FileCode", fileCode, Field.Store.YES, Field.Index.NOT_ANALYZED));
                    Log.Info("Add success");
                    //doc.Add(field);
                    //doc.Add(new TextField("FileName", file.FileName, Field.Store.YES));
                    //doc.Add(new TextField("FileTypePhysic", file.FileTypePhysic, Field.Store.YES));
                    //doc.Add(new TextField("Url", file.Url, Field.Store.YES));
                    oIndexWriter.AddDocument(doc);
                    oIndexWriter.Flush(true, true);
                    oIndexWriter.DeleteUnusedFiles();
                    oIndexWriter.Dispose();
                    Log.Info("Index success");
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex.Message);
                Log.Error(ex.StackTrace);
            }
        }

        public static void DeleteIndexFile(string fileCode, string pathIndex)
        {
            LuceneVersion matchVersion = LuceneVersion.LUCENE_48;
            Lucene.Net.Store.Directory directory = FSDirectory.Open(new DirectoryInfo(pathIndex));
            var oAnalyzer = new StandardAnalyzer(matchVersion);
            if (IndexWriter.IsLocked(directory))
            {
                IndexWriter.Unlock(directory);
            }
            var oIndexWriterConfig = new IndexWriterConfig(matchVersion, oAnalyzer);
            var oIndexWriter = new IndexWriter(directory, oIndexWriterConfig);
            Query docFileCode = new TermQuery(new Term("FileCode", fileCode));
            oIndexWriter.DeleteDocuments(docFileCode);
            oIndexWriter.Flush(true, true);
            oIndexWriter.Dispose();
        }
        public static (IEnumerable<EDMSJtableFileModel>, int) SearchHighligh(string input, string pathIndex, int page, int length, string fieldName = "")
        {
            //var terms = input.Trim().Replace("-", " ").Split(' ')
            //    .Where(x => !string.IsNullOrEmpty(x)).Select(x => x.Trim() + "*");
            //input = string.Join(" ", terms);

            return _searchHighligh(input, pathIndex, page, length, fieldName);
        }
        private static string _getHighlight(Highlighter highlighter, StandardAnalyzer analyzer, string fieldContent)
        {
            Lucene.Net.Analysis.TokenStream stream = analyzer.GetTokenStream("Content", new StringReader(fieldContent));
            //TextFragment[]  list = highlighter.GetBestTextFragments(stream, fieldContent, true ,50);
            //var datameta = highlighter.GetBestFragments(stream, fieldContent, 50, "...");
            return highlighter.GetBestFragments(stream, fieldContent, 50, "...");
        }
        /*public static CollectionStats(CollectionStatistics stats)
        {
            int sumTotalTermFreq = stats.SumTotalTermFreq();
            return(sumTotalTermFreq);
        }*/
        private static (IEnumerable<EDMSJtableFileModel>, int) _searchHighligh(string searchQuery, string pathIndex, int page, int length, string searchField = "")
        {
            // validation
            //if (string.IsNullOrEmpty(searchQuery.Replace("*", "").Replace("?", ""))) return new List<EDMSJtableFileModel>();

            // set up lucene searcher
            Lucene.Net.Store.Directory directory = FSDirectory.Open(new DirectoryInfo(pathIndex));
            IndexReader indexReader = DirectoryReader.Open(directory);
            if (IndexWriter.IsLocked(directory))
            {
                IndexWriter.Unlock(directory);
            }

            LuceneVersion MatchVersion = LuceneVersion.LUCENE_48;
            var analyzer = new StandardAnalyzer(MatchVersion);

            IFormatter formatter = new SimpleHTMLFormatter("<span style=\"font-weight:bold; background-color: yellow;\">", "</span>");
            SimpleFragmenter fragmenter = new SimpleFragmenter(200);
            QueryScorer scorer = null;

            ScoreDoc[] hits;
            var hitLimit = 1000;
            // search by single field
            if (!string.IsNullOrEmpty(searchField))
            {
                var parser = new QueryParser(MatchVersion, searchField, analyzer);
                var query = parser.Parse(searchQuery);
                scorer = new QueryScorer(query);

                hits = new IndexSearcher(indexReader).Search(query, hitLimit).ScoreDocs;

                var highlighter = new Highlighter(formatter, scorer);
                highlighter.TextFragmenter = fragmenter;
                var results = _mapLuceneToDataListHighligh(hits, new IndexSearcher(indexReader), highlighter, analyzer, query);

                analyzer.Dispose();
                //Lucemne.Net.Search GetHitTerms(results.I, searcher, hits, hits, hitLimit);
                Console.WriteLine(results.Count());
                /*//String termText = term.utf8ToString();
                string termText = "";
                Term termInstance = new Term("Content", termText);
                long termFreq = indexReader.TotalTermFreq(termInstance);
                long docCount = indexReader.DocFreq(termInstance);
                var data = indexReader.GetTermVector(222, "Content");
                var data2 = indexReader.GetTermVectors(222);*/
                //test indexx 

                return (results, hits.Length);


            }
            //// search by multiple fields (ordered by RELEVANCE)
            else
            {
                var parser = new MultiFieldQueryParser
                    (MatchVersion, new[] { "Content" }, analyzer);
                var query = parser.Parse(searchQuery);

                scorer = new QueryScorer(query);
                hits = new IndexSearcher(indexReader).Search(query, null, hitLimit, Sort.INDEXORDER).ScoreDocs;

                var highlighter = new Highlighter(formatter, scorer);
                highlighter.TextFragmenter = fragmenter;
                //var pageHits = hits.Skip(page).Take(length);
                var results = _mapLuceneToDataListHighligh(hits, new IndexSearcher(indexReader), highlighter, analyzer, query);
                //var data2 = new IndexSearcher(indexReader);
                analyzer.Dispose();
                //GetHitTerms(results.I, searcher, hits, hits, hitLimit);
                Console.WriteLine(results.Count());

                return (results, hits.Length);
            }

        }




        private static IEnumerable<EDMSJtableFileModel> _mapLuceneToDataListHighligh(IEnumerable<ScoreDoc> hits, IndexSearcher searcher, Highlighter highlighter, StandardAnalyzer analyzer, Query query)
        {
            var data = hits.Select(hit => _mapLuceneDocumentToDataHighligh(searcher.Doc(hit.Doc), highlighter, analyzer, searcher, query, hit.Doc)).ToList();
            return data;

        }
        private static IEnumerable<EDMSJtableFileModel> _mapLuceneToDataListHighlighByFileCode(IEnumerable<ScoreDoc> hits, IndexSearcher searcher, string fileCode)
        {
            return hits.Select(hit => _mapLuceneDocumentToDataHighlighByFileCode(searcher.Doc(hit.Doc))).ToList();
        }
        private static EDMSJtableFileModel _mapLuceneDocumentToDataHighligh(Document doc, Highlighter highlighter, StandardAnalyzer analyzer, IndexSearcher searcher, Query query, int hit)
        {

            // check freq keyword hit.
            var data5 = searcher.Explain(query, hit);
            string freq = data5.ToString();

            //end
            var Content = _getHighlight(highlighter, analyzer, doc.Get("Content"));
            var check = Content;
            return new EDMSJtableFileModel
            {
                FileCode = doc.Get("FileCode"),
                Line = doc.Get("Line"),
                Page = doc.Get("Page"),
                IdentifierCode = doc.Get("IdentifierCode"),
                FreqCount = freq,
                Content = Content,

                //Content = _getHighlight(highlighter, analyzer, doc.Get("Content")) + " (<u>Dòng: " + doc.Get("Line") + (doc.Get("Page") != "-1" ? ", Trang: H" + doc.Get("Page") : "") + "Session: " + doc.Get("Session") + "Phara: " + doc.Get("Phara") + "</u>) ",
            };
        }

        private static EDMSJtableFileModel _mapLuceneDocumentToDataHighlighByFileCode(Document doc)
        {
            return new EDMSJtableFileModel
            {
                FileCode = doc.Get("FileCode"),
                Line = doc.Get("Line"),
                Page = doc.Get("Page"),
                Content = doc.Get("Content"),
            };
        }

        public static IEnumerable<EDMSJtableFileModel> SearchHighlighByFileCode(string fileCode, string content, string pathIndex, string searchField = "")
        {
            Lucene.Net.Store.Directory directory = FSDirectory.Open(new DirectoryInfo(pathIndex));
            IndexReader indexReader = DirectoryReader.Open(directory);
            if (IndexWriter.IsLocked(directory))
            {
                IndexWriter.Unlock(directory);
            }
            var searcher = new IndexSearcher(indexReader);
            LuceneVersion MatchVersion = LuceneVersion.LUCENE_48;
            var analyzer = new StandardAnalyzer(MatchVersion);

            IFormatter formatter = new SimpleHTMLFormatter("<span style=\"font-weight:bold;\">", "</span>");
            SimpleFragmenter fragmenter = new SimpleFragmenter(200);
            QueryScorer scorer = null;

            ScoreDoc[] hits;
            var hitLimit = 500;
            // search by single field
            if (!string.IsNullOrEmpty(searchField))
            {
                var parser = new QueryParser(MatchVersion, searchField, analyzer);
                var query = parser.Parse(content);
                scorer = new QueryScorer(query);
                hits = searcher.Search(query, hitLimit).ScoreDocs;
                //hits = searcher.Search(query, ICollector collector).ScoreDocs;


            }
            //// search by multiple fields (ordered by RELEVANCE)
            else
            {
                var parser = new MultiFieldQueryParser
                    (MatchVersion, new[] { "Content" }, analyzer);
                var query = parser.Parse(content);

                scorer = new QueryScorer(query);
                hits = searcher.Search(query, null, hitLimit, Sort.INDEXORDER).ScoreDocs;
            }
            var highlighter = new Highlighter(formatter, scorer);
            highlighter.TextFragmenter = fragmenter;
            //var pageHits = hits.Skip(page).Take(length);
            var results = _mapLuceneToDataListHighlighByFileCode(hits, searcher, fileCode);
            var results1 = results.Where(x => x.FileCode == fileCode).ToList();
            analyzer.Dispose();
            return results1;
        }
    }
    public class LineModel
    {
        public LineModel()
        {
            Page = "-1";
        }
        public string Content { get; set; }
        public string Line { get; set; }
        public string Page { get; set; }
        public string Phara { get; set; }
        public string Session { get; set; }
    }
    public interface ILuceneService
    {
        Task RebuildIndex();
        void StopIndex();
        void TestIndex();
        LuceneInfo GetLuceneInfo();
    }
    public class LuceneInfo
    {
        public bool IsLuceneWorking { get; set; }
        public bool IsLuceneRunning { get; set; }
        public int CurrentLuceneCount { get; set; }
        public int TotalLuceneCount { get; set; }
    }
    public class LuceneService : ILuceneService
    {
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly string _path;
        private static readonly log4net.ILog Log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod()?.DeclaringType);
        private static bool isLucenceWorking = false;
        private static bool isLucenceRunning = false;
        private static bool isLucenceInterupt = false;
        private static bool isLucenceRestarting = false;
        private static int currentLucenceCount = 0;
        private static int totalLucenceCount = 0;
        public LuceneService(IHostingEnvironment hostingEnvironment, EIMDBContext context, IUploadService upload)
        {
            _hostingEnvironment = hostingEnvironment;
            _context = context;
            _upload = upload;
            var moduleObj = (EDMSCatRepoSetting)_upload.GetPathByModule("DB_LUCENE_INDEX").Object;
            if (moduleObj != null)
            {
                var luceneCategory = _context.EDMSCategorys.FirstOrDefault(x => x.CatCode == moduleObj.CatCode);
                const LuceneVersion matchVersion = LuceneVersion.LUCENE_48;
                if (luceneCategory != null)
                {
                    _path = luceneCategory.PathServerPhysic;
                    Lucene.Net.Store.Directory directory = FSDirectory.Open(new DirectoryInfo(_path));
                    var oAnalyzer = new StandardAnalyzer(matchVersion);
                    if (IndexWriter.IsLocked(directory))
                    {
                        IndexWriter.Unlock(directory);
                    }
                }
                isLucenceWorking = true;
            }
            else
            {
                isLucenceWorking = false;
            }
        }

        public async Task RebuildIndex()
        {
            isLucenceRunning = true;
            ClearIndex();
            var listFiles = GetAllFiles();
            totalLucenceCount = listFiles.Count;
            var countFailed = 0;
            currentLucenceCount = 0;
            foreach (var file in listFiles)
            {
                if (isLucenceInterupt)
                {
                    isLucenceInterupt = false;
                    break;
                }
                var fileCode = file.FileCode;
                var fileType = file.FileTypePhysic;
                var fileName = file.FileName;
                var fileUpload = Download(fileCode);
                if (fileUpload != null)
                {
                    IndexFile(fileCode, fileType, fileUpload, _path);
                }
                else
                {
                    Log.Error("File not exist");
                    Log.Error($"{fileCode} : {fileName}");
                    countFailed++;
                }
                currentLucenceCount++;
            }
            isLucenceRunning = false;
            totalLucenceCount = 0;
            currentLucenceCount = 0;
            Log.Info($"Total failed: {countFailed}");
        }
        public void StopIndex()
        {
            isLucenceInterupt = true;
        }
        public void TestIndex()
        {
            if (!isLucenceRunning)
            {
                var listFiles = GetAllFiles();
                totalLucenceCount = listFiles.Count;
                foreach (var file in listFiles)
                {
                    var fileCode = file.FileCode;
                    var fileType = file.FileTypePhysic;
                    var fileName = file.FileName;
                    var fileUpload = Download(fileCode);
                    if (fileUpload != null)
                    {
                        IndexFile(fileCode, fileType, fileUpload, _path);
                        break;
                    }
                    else
                    {
                        Log.Error("File not exist");
                        Log.Error($"{fileCode} : {fileName}");
                    }
                } 
            }
        }
        public void ClearIndex()
        {
            DirectoryInfo directoryInfo = new DirectoryInfo(_path);
            Parallel.ForEach(directoryInfo.GetFiles(), file =>
            {
                file.Delete();
            });
        }

        public class FileMetaInfo
        {
            public string FileCode { get; set; }
            public string FileTypePhysic { get; set; }
            public string FileName { get; set; }
        }

        public List<FileMetaInfo> GetAllFiles()
        {
            return (from a in _context.EDMSFiles.Where(x => !x.IsDeleted)
                    select new FileMetaInfo
                    {
                        FileCode = a.FileCode,
                        FileName = a.FileName,
                        FileTypePhysic = a.MimeType
                    }).ToList();
        }

        public IFormFile Download(string fileCode)
        {
            try
            {
                var data = (from a in _context.EDMSRepoCatFiles.Where(x => x.FileCode.Equals(fileCode))
                            join b in _context.EDMSRepositorys on a.ReposCode equals b.ReposCode into b2
                            from b in b2.DefaultIfEmpty()
                            join c in _context.EDMSFiles on a.FileCode equals c.FileCode into c2
                            from c in c2.DefaultIfEmpty()
                            select new
                            {
                                a.Id,
                                Server = (b != null ? b.Server : null),
                                Type = (b != null ? b.Type : null),
                                Url = (c != null ? c.Url : null),
                                Token = (b != null ? b.Token : null),
                                FileId = (c != null ? c.CloudFileId : null),
                                FileTypePhysic = c.FileTypePhysic,
                                c.FileName,
                                c.MimeType,
                                b.Account,
                                b.PassWord,
                                c.FileCode,
                                c.IsEdit,
                                c.IsFileMaster,
                                c.FileParentId,
                                c.FileID,
                                c.ListUserView
                            }).FirstOrDefault();
                if (data != null)
                {
                    if (data.Type == "SERVER")
                    {
                        if (!string.IsNullOrEmpty(data.Server))
                        {
                            string ftphost = data.Server;
                            string ftpfilepath = data.Url;
                            var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + ftphost + ftpfilepath);
                            using (WebClient request = new WebClient())
                            {
                                request.Credentials = new NetworkCredential(data.Account, data.PassWord);
                                byte[] fileData = request.DownloadData(urlEnd);
                                var ms = new MemoryStream(fileData);
                                IFormFile file = new FormFile(ms, 0, fileData.Length, data.FileName, data.FileName);
                                return file;
                            }
                        }
                    }
                    else
                    {
                        var apiTokenService = _context.TokenManagers.FirstOrDefault(x => x.AccountCode == data.Token);
                        if (apiTokenService != null)
                        {
                            var json = apiTokenService.CredentialsJson;
                            var user = apiTokenService.Email;
                            var token = apiTokenService.RefreshToken;
                            var fileData = FileExtensions.DownloadFileGoogle(json, token, data.FileId, user);
                            var ms = new MemoryStream(fileData);
                            IFormFile file = new FormFile(ms, 0, fileData.Length, data.FileName, data.FileName);
                            return file;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Log.Error("Download file failed");
                Log.Error(ex.Message);
                Log.Error(ex.StackTrace);
            }
            return null;
        }
        public static string[] FileMimetypes = { "text/plain", "application/vnd.ms-powerpoint", "application/msword", "application/x-pdf", "application/pdf", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.openxmlformats-officedocument.presentationml.presentation", "image/png", "image/x-png", "image/jpeg", "image/gif", "image/pjpeg", "image/tiff", "image/svg+xml", "application/x-zip-compressed", "application/octet-stream", "image/*", "video/*", "audio/*", "application/epub+zip", "audio/mpeg" };
        public static string[] FileExt = { ".TXT", ".DOC", ".DOCX", ".PDF", ".PPS", ".PPT", ".PPTX", ".PNG", ".JPG", ".TIF", ".TIFF", ".XLSM", ".XLSX", ".XLSB", ".XLTX", ".XLTM", ".XLS", ".XLT", ".ZIP", ".RAR", ".JPEG", ".MP4", ".MP3", ".EPUB", ".SVG" };

        private static readonly string[] FileLuceneMimetypes = { "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.openxmlformats-officedocument.presentationml.presentation", "application/msword",
            "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/pdf",
            "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "text/plain","image/*"};
        private static string[] fileLucene = { ".DOC", ".DOCX", ".TXT", ".PDF", ".XLSX", ".XLS", ".PPS", ".PPT", ".PPTX" };
        public void IndexFile(string fileCode, string fileType, IFormFile fileUpload, string pathIndex)
        {
            try
            {
                //var fileType = fileUpload.ContentType;
                if (currentLucenceCount == 0)
                {
                    isLucenceRunning = true;
                }
                string extension = Path.GetExtension(fileUpload.FileName);
                if (Array.IndexOf(FileLuceneMimetypes, fileType) >= 0 && (Array.IndexOf(fileLucene, extension.ToUpper()) >= 0))
                {
                    const LuceneVersion matchVersion = LuceneVersion.LUCENE_48;
                    Lucene.Net.Store.Directory directory = FSDirectory.Open(new DirectoryInfo(pathIndex));
                    var oAnalyzer = new StandardAnalyzer(matchVersion);
                    if (IndexWriter.IsLocked(directory))
                    {
                        IndexWriter.Unlock(directory);
                    }
                    var oIndexWriterConfig = new IndexWriterConfig(matchVersion, oAnalyzer);
                    var oIndexWriter = new IndexWriter(directory, oIndexWriterConfig);
                    Document doc = new Document();
                    string[] txtMimetypes = { "text/plain" };
                    string[] wordMimetypes = { "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.openxmlformats-officedocument.presentationml.presentation", "application/msword" };
                    string[] excelMimetypes = { "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" };
                    string[] pdfMimetypes = { "application/pdf" };
                    string[] powerPointMimetypes = { "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation" };


                    string[] word = { ".DOC", ".DOCX" };
                    string[] pdf = { ".PDF" };
                    string[] txt = { ".TXT" };
                    string[] excel = { ".XLSX", ".XLS" };
                    string[] powerPoint = { ".PPS", ".PPT", ".PPTX" };

                    Log.Info("Begin job");
                    if (Array.IndexOf(txtMimetypes, fileType) >= 0 && (Array.IndexOf(txt, extension.ToUpper()) >= 0))
                    {
                        string content = FileExtensions.ExtractTextTxt(fileUpload);
                        doc.Add(new TextField("Content", content, Field.Store.YES));
                        Log.Info("Add success");
                    }
                    else if (Array.IndexOf(wordMimetypes, fileType) >= 0 && (Array.IndexOf(word, extension.ToUpper()) >= 0))
                    {
                        string content = FileExtensions.ExtractTextWord(fileUpload);
                        doc.Add(new TextField("Content", content, Field.Store.YES));
                        Log.Info("Add success");
                    }
                    else if (Array.IndexOf(pdfMimetypes, fileType) >= 0 && (Array.IndexOf(pdf, extension.ToUpper()) >= 0))
                    {
                        string content = FileExtensions.ExtractTextPdf(fileUpload);
                        doc.Add(new TextField("Content", content, Field.Store.YES));
                        Log.Info("Add success");
                    }
                    else if (Array.IndexOf(excelMimetypes, fileType) >= 0 && (Array.IndexOf(excel, extension.ToUpper()) >= 0))
                    {
                        string content = FileExtensions.ExtractTextExcel(fileUpload);
                        doc.Add(new TextField("Content", content, Field.Store.YES));
                        Log.Info("Add success");
                    }
                    else if (Array.IndexOf(powerPointMimetypes, fileType) >= 0 && (Array.IndexOf(powerPoint, extension.ToUpper()) >= 0))
                    {
                        string content = FileExtensions.ExtractTextPowerPoint(fileUpload);
                        doc.Add(new TextField("Content", content, Field.Store.YES));
                        Log.Info("Add success");
                    }
                    doc.Add(new Field("FileCode", fileCode, Field.Store.YES, Field.Index.NOT_ANALYZED));
                    Log.Info("Add success");
                    //doc.Add(field);
                    //doc.Add(new TextField("FileName", file.FileName, Field.Store.YES));
                    //doc.Add(new TextField("FileTypePhysic", file.FileTypePhysic, Field.Store.YES));
                    //doc.Add(new TextField("Url", file.Url, Field.Store.YES));
                    oIndexWriter.AddDocument(doc);
                    oIndexWriter.Flush(true, true);
                    oIndexWriter.DeleteUnusedFiles();
                    oIndexWriter.Dispose();
                    Log.Info("Index success");
                    isLucenceWorking = true;
                }
                if (currentLucenceCount == 0)
                {
                    isLucenceRunning = false;
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex.Message);
                Log.Error(ex.StackTrace);
                if (currentLucenceCount == 0)
                {
                    isLucenceRunning = false;
                }
            }
        }
        public LuceneInfo GetLuceneInfo()
        {
            return new LuceneInfo()
            {
                IsLuceneWorking = isLucenceWorking,
                IsLuceneRunning = isLucenceRunning,
                CurrentLuceneCount = currentLucenceCount,
                TotalLuceneCount = totalLucenceCount
            };
        }
    }
}
