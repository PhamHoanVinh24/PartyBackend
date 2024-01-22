using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using III.Domain.Enums;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;
using Lucene.Net.Analysis.Standard;
using Lucene.Net.Documents;
using Lucene.Net.Index;
using Lucene.Net.QueryParsers.Classic;
using Lucene.Net.Search;
using Lucene.Net.Search.Highlight;
using Lucene.Net.Store;
using Microsoft.AspNetCore.Hosting;
using System.Collections.Generic;
using System.IO;
using Lucene.Net.Util;
using System.Text.RegularExpressions;
using Syncfusion.XlsIO;
using Syncfusion.Drawing;
using Microsoft.AspNetCore.Http.Internal;
using Microsoft.AspNetCore.Http;
using System.Net;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class SearchContentFileController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IStringLocalizer<EDMSRepositoryController> _stringLocalizer;
        private readonly IStringLocalizer<SearchContentFileController> _stringLocalizerCTF;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IStringLocalizer<HrEmployeeController> _hrLocalizer;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<EDMSRepositoryController> _stringLocalizerEdms;

        #region Index
        public SearchContentFileController(EIMDBContext context, IStringLocalizer<EDMSRepositoryController> stringLocalizer,
            IStringLocalizer<SearchContentFileController> stringLocalizerCTF,
        IStringLocalizer<SharedResources> sharedResources, IHostingEnvironment hostingEnvironment,
            IStringLocalizer<HrEmployeeController> hrLocalizer, IStringLocalizer<EDMSRepositoryController> stringLocalizerEdms)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _stringLocalizerCTF = stringLocalizerCTF;
            _sharedResources = sharedResources;
            _hostingEnvironment = hostingEnvironment;
            _hrLocalizer = hrLocalizer;
            _stringLocalizerEdms = stringLocalizerEdms;
        }
        [Breadcrumb("ViewData.CrumbSearchFile", AreaName = "Admin", FromAction = "Index", FromController = typeof(WarehouseDigitalHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbWHDHome"] = _sharedResources["COM_CRUMB_WH_DIGITAL_HOME"];
            ViewData["CrumbSearchFile"] = _sharedResources["COM_CT_FILE_CONVERT_OCR"];
            return View();
        }

        [HttpGet]
        public JsonResult GetDataType()
        {
            var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals("DATA_TYPE_CONTENT_FILE"))
                        .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return Json(data);
        }

        [HttpPost]
        public JsonResult CleanData()
        {
            var msg = new JMessage();
            var data = _context.TempKeyWordSearchs;
            _context.TempKeyWordSearchs.RemoveRange(data);
            _context.SaveChanges();
            msg.Title = "Xóa dữ liệu thành công";
            return Json(msg);
        }

        [NonAction]
        private (IEnumerable<EDMSJtableFileModel> listLucene, int total) SearchLuceneFile(string content, int page, int length)
        {
            try
            {
                return SearchHighligh(content, _hostingEnvironment.WebRootPath + "\\uploads\\luceneIndex", page, length, "Content");
            }
            catch (Exception ex)
            {
                return (new List<EDMSJtableFileModel>(), 0);
            }
        }

        [NonAction]
        public (IEnumerable<EDMSJtableFileModel>, int) SearchHighligh(string input, string pathIndex, int page, int length, string fieldName = "")
        {
            return _searchHighligh(input, pathIndex, page, length, fieldName);
        }

        [NonAction]
        private (IEnumerable<EDMSJtableFileModel>, int) _searchHighligh(string searchQuery, string pathIndex, int page, int length, string searchField = "")
        {
            // set up lucene searcher
            Lucene.Net.Store.Directory directory = FSDirectory.Open(new DirectoryInfo(pathIndex));
            IndexReader indexReader = DirectoryReader.Open(directory);
            if (IndexWriter.IsLocked(directory))
            {
                IndexWriter.Unlock(directory);
            }
            var searcher = new IndexSearcher(indexReader);
            LuceneVersion MatchVersion = LuceneVersion.LUCENE_48;
            var analyzer = new StandardAnalyzer(MatchVersion);

            IFormatter formatter = new SimpleHTMLFormatter("", "");
            SimpleFragmenter fragmenter = new SimpleFragmenter(350);
            QueryScorer scorer = null;

            ScoreDoc[] hits;
            var hitLimit = 1000;
            // search by single field
            if (!string.IsNullOrEmpty(searchField))
            {
                var parser = new QueryParser(MatchVersion, searchField, analyzer);
                var query = parser.Parse(searchQuery);
                scorer = new QueryScorer(query);
                hits = searcher.Search(query, hitLimit).ScoreDocs;
            }
            //// search by multiple fields (ordered by RELEVANCE)
            else
            {
                var parser = new MultiFieldQueryParser
                    (MatchVersion, new[] { "Content" }, analyzer);
                var query = parser.Parse(searchQuery);

                scorer = new QueryScorer(query);
                hits = searcher.Search(query, null, hitLimit, Sort.INDEXORDER).ScoreDocs;
            }
            var highlighter = new Highlighter(formatter, scorer);
            highlighter.TextFragmenter = fragmenter;
            //var pageHits = hits.Skip(page).Take(length);
            var results = _mapLuceneToDataListHighligh(hits, searcher, highlighter, analyzer, searchQuery);
            analyzer.Dispose();
            return (results, hits.Length);
        }

        [NonAction]
        private IEnumerable<EDMSJtableFileModel> _mapLuceneToDataListHighligh(IEnumerable<ScoreDoc> hits, IndexSearcher searcher, Highlighter highlighter, StandardAnalyzer analyzer, string keySearch)
        {
            return hits.Select(hit => _mapLuceneDocumentToDataHighligh(searcher.Doc(hit.Doc), highlighter, analyzer, keySearch)).ToList();
        }
        [NonAction]
        private EDMSJtableFileModel _mapLuceneDocumentToDataHighligh(Document doc, Highlighter highlighter, StandardAnalyzer analyzer, string keySearch)
        {
            var data = new TempKeyWordSearch
            {
                Value = _getHighlight(highlighter, analyzer, doc.Get("Content")),
                DocumentId = doc.Get("FileCode"),
                KeySearch = keySearch
            };
            _context.TempKeyWordSearchs.Add(data);
            //_context.SaveChanges();

            return new EDMSJtableFileModel
            {
                FileCode = doc.Get("FileCode"),
                Line = doc.Get("Line"),
                Page = doc.Get("Page"),
                Content = _getHighlight(highlighter, analyzer, doc.Get("Content")),
            };
        }
        [NonAction]
        public string _getHighlight(Highlighter highlighter, StandardAnalyzer analyzer, string fieldContent)
        {
            Lucene.Net.Analysis.TokenStream stream = analyzer.GetTokenStream("", new StringReader(fieldContent));
            return highlighter.GetBestFragments(stream, fieldContent, 10, ",");
        }

        public class JTableModelSearch : JTableModel
        {
            public string CatCode { get; set; }
            public string DataType { get; set; }
            public string KeyWord { get; set; }
        }

        #endregion

        #region Key word setup
        [HttpPost]
        public JsonResult JTableKeyWord([FromBody] ModelKeyWord jTablepara)
        {
            int intBeginFor = (jTablepara.CurrentPage - 1) * jTablepara.Length;
            var query = from a in _context.UsrKeyWordSetups.Where(x => !x.IsDeleted && x.UserId.Equals(ESEIM.AppContext.UserId))
                        join b in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Unit equals b.CodeSet into b1
                        from b in b1.DefaultIfEmpty()
                        join c in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Type equals c.CodeSet into c1
                        from c in c1.DefaultIfEmpty()
                        join d in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Group equals d.CodeSet into d1
                        from d in d1.DefaultIfEmpty()
                        where a.UserId.Equals(ESEIM.AppContext.UserId)
                        && (string.IsNullOrEmpty(jTablepara.Group) || jTablepara.Group.Equals(a.Group))
                        select new
                        {
                            a.ID,
                            a.KeyWord,
                            Unit = b != null ? b.ValueSet : "",
                            Group = d != null ? d.ValueSet : "",
                            Type = c != null ? c.ValueSet : ""
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablepara.QueryOrderBy).Skip(intBeginFor).Take(jTablepara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablepara.Draw, count, "ID", "KeyWord", "Unit", "Group", "Type");
            return Json(jdata);
        }

        [HttpPost]
        public JsonResult InsertKeyWord([FromBody] UsrKeyWordSetup obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var checkKeyWord = _context.UsrKeyWordSetups.FirstOrDefault(x => !x.IsDeleted
                    && x.KeyWord.ToLower().Trim().Equals(obj.KeyWord.ToLower().Trim()) && x.Group.Equals(obj.Group)
                    && x.UserId.Equals(ESEIM.AppContext.UserId));
                if (checkKeyWord == null)
                {
                    var usrKey = new UsrKeyWordSetup
                    {
                        UserId = ESEIM.AppContext.UserId,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now,
                        Group = obj.Group,
                        KeyWord = obj.KeyWord,
                        Type = obj.Type,
                        Unit = obj.Unit
                    };
                    _context.UsrKeyWordSetups.Add(usrKey);
                    var checkPool = _context.KeyWordDataPools.FirstOrDefault(x => !x.IsDeleted && x.Group.Equals(obj.Group)
                                    && x.KeyWord.ToLower().Trim().Equals(obj.KeyWord.ToLower().Trim()));
                    if (checkPool == null)
                    {
                        var pool = new KeyWordDataPool
                        {
                            KeyWord = obj.KeyWord,
                            Group = obj.Group,
                            Describe = "",
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now
                        };
                        _context.KeyWordDataPools.Add(pool);
                    }

                    _context.SaveChanges();
                    msg.Title = "Thêm mới từ khóa thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Từ khóa đã tồn tại";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult DeleteKeyWord(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var keyWord = _context.UsrKeyWordSetups.FirstOrDefault(x => x.ID == id);
                if (keyWord != null)
                {
                    keyWord.IsDeleted = true;
                    keyWord.DeletedBy = ESEIM.AppContext.UserName;
                    keyWord.DeletedTime = DateTime.Now;
                    _context.UsrKeyWordSetups.Update(keyWord);
                    _context.SaveChanges();
                    msg.Title = "Xóa từ khóa thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Từ khóa không tồn tại";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetItemKeyWord(int id)
        {
            var keyWord = _context.UsrKeyWordSetups.FirstOrDefault(x => x.ID == id);
            return Json(keyWord);
        }

        [HttpPost]
        public JsonResult UpdateKeyWord([FromBody] UsrKeyWordSetup obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var check = _context.UsrKeyWordSetups.FirstOrDefault(x => !x.IsDeleted && obj.ID == x.ID);
                if (check != null)
                {
                    check.KeyWord = obj.KeyWord;
                    check.Unit = obj.Unit;
                    check.Type = obj.Type;
                    _context.UsrKeyWordSetups.Update(check);
                    _context.SaveChanges();
                    msg.Title = "Cập nhật từ khóa thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Từ khóa không tồn tại";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetUnitKeyWord()
        {
            var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals("KEY_WORD_UNIT"))
                        .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetTypeKeyWord()
        {
            var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals("KEY_WORD_TYPE"))
                        .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetGroupKeySearch()
        {
            var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals("TEMP_GROUP_KEY_SEARCH"))
                        .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetPoolKeyWord()
        {
            var data = _context.KeyWordDataPools.Where(x => !x.IsDeleted)
                .Select(x => new { Value = x.KeyWord, Group = x.Group }).DistinctBy(x => x.Value);
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetUser()
        {
            var data = _context.Users.Select(x => new { UserId = x.Id, Name = x.GivenName });
            return Json(data);
        }

        public class ModelKeyWord : JTableModel
        {
            public string Group { get; set; }
        }
        #endregion

        #region File
        [HttpPost]
        public JsonResult DeleteFileOCR([FromBody]List<int> ids)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.EDMSRepoCatFiles.Where(x => ids.Any(k => k == x.Id));
                _context.EDMSRepoCatFiles.RemoveRange(data);

                foreach (var item in data)
                {
                    var file = _context.EDMSFiles.FirstOrDefault(x => x.FileCode == item.FileCode);
                    _context.EDMSFiles.Remove(file);
                    LuceneExtension.DeleteIndexFile(file.FileCode, _hostingEnvironment.WebRootPath + "\\uploads\\luceneIndex");
                    var getRepository = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == item.ReposCode);
                    if (getRepository != null)
                    {
                        if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server))
                        {
                            var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + getRepository.Server + file.Url);
                            FileExtensions.DeleteFileFtpServer(urlEnd, getRepository.Account, getRepository.PassWord);
                        }
                        else if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.GooglerDriver))
                        {
                            FileExtensions.DeleteFileGoogleServer(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", file.CloudFileId);
                        }
                    }
                }
                _context.SaveChanges();
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer[""]);// "Xóa thành công";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = _sharedResources["COM_MSG_ERR"];//"Xóa file lỗi";
            }
            return Json(msg);
        }

        [HttpPost]
        [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
        [RequestSizeLimit(long.MaxValue)]
        public JsonResult InsertFile(FileRepoModel obj, IFormFile fileUpload)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var listType = new string[] { "jpg", "png", "tif", "tiff", "pdf" };
                if (!listType.Any(x => x == obj.FileType))
                {
                    msg.Error = true;
                    msg.Title = "Vui lòng chọn ảnh hoặc PDF";
                    return Json(msg);
                }

                var mimeType = fileUpload.ContentType;
                string extension = Path.GetExtension(fileUpload.FileName);
                string urlFile = "";
                string fileId = "";
                var fileSize = fileUpload.Length;
                if ((fileSize / 1048576.0) > 1000)
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["EDMSR_MSG_FILE_SIZE_LIMIT_UPLOAD"];
                    return Json(msg);
                }
                if (Array.IndexOf(LuceneExtension.fileMimetypes, mimeType) >= 0 && (Array.IndexOf(LuceneExtension.fileExt, extension.ToUpper()) >= 0))
                {
                    string reposCode = "";
                    string catCode = "";
                    string path = "";
                    string folderId = "";

                    var setting = _context.EDMSCatRepoSettings.FirstOrDefault(x => x.CatCode == obj.CatCode);
                    if (setting != null)
                    {
                        reposCode = setting.ReposCode;
                        path = setting.Path;
                        folderId = setting.FolderId;
                        catCode = setting.CatCode;
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["EDMSR_MSG_CHOOSE_DOC_SAVE"];
                        return Json(msg);
                    }

                    var getRepository = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == reposCode);
                    if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server))
                    {
                        using (var ms = new MemoryStream())
                        {
                            fileUpload.CopyTo(ms);
                            var fileBytes = ms.ToArray();
                            urlFile = path + Path.Combine("/", fileUpload.FileName);
                            var urlFilePreventive = path + Path.Combine("/", Guid.NewGuid().ToString().Substring(0, 8) + fileUpload.FileName);
                            var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + getRepository.Server + urlFile);
                            var urlEndPreventive = System.Web.HttpUtility.UrlPathEncode("ftp://" + getRepository.Server + urlFilePreventive);
                            var result = FileExtensions.UploadFileToFtpServer(urlEnd, urlEndPreventive, fileBytes, getRepository.Account, getRepository.PassWord);
                            if (result.Status == WebExceptionStatus.ConnectFailure || result.Status == WebExceptionStatus.ProtocolError)
                            {
                                msg.Error = true;
                                msg.Title = _sharedResources["COM_CONNECT_FAILURE"];
                                return Json(msg);
                            }
                            else if (result.Status == WebExceptionStatus.Success)
                            {
                                if (result.IsSaveUrlPreventive)
                                {
                                    urlFile = urlFilePreventive;
                                }
                            }
                            else
                            {
                                msg.Error = true;
                                msg.Title = _sharedResources["COM_MSG_ERR"];
                                return Json(msg);
                            }
                        }
                    }
                    else if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.GooglerDriver))
                    {
                        fileId = FileExtensions.UploadFileToDrive(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", fileUpload.FileName, fileUpload.OpenReadStream(), fileUpload.ContentType, folderId);
                    }
                    var edmsReposCatFile = new EDMSRepoCatFile
                    {
                        FileCode = string.Concat("REPOSITORY", Guid.NewGuid().ToString()),
                        ReposCode = reposCode,
                        CatCode = catCode,
                        ObjectCode = "",
                        ObjectType = "",
                        Path = path,
                        FolderId = folderId
                    };
                    _context.EDMSRepoCatFiles.Add(edmsReposCatFile);

                    /// created Index lucene
                    if (!extension.ToUpper().Equals(".ZIP") && !extension.ToUpper().Equals(".RAR"))
                    {
                        LuceneExtension.IndexFile(edmsReposCatFile.FileCode, fileUpload, string.Concat(_hostingEnvironment.WebRootPath, "\\uploads\\luceneIndex"));
                    }
                    //add File
                    var file = new EDMSFile
                    {
                        FileCode = edmsReposCatFile.FileCode,
                        FileName = fileUpload.FileName,
                        Desc = "",
                        ReposCode = reposCode,
                        Tags = "",
                        FileSize = fileUpload.Length,
                        FileTypePhysic = Path.GetExtension(fileUpload.FileName),
                        NumberDocument = "",
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now,
                        Url = urlFile,
                        MimeType = mimeType,
                        CloudFileId = fileId,
                        IsScan = false,
                        MetaDataExt = "",
                    };
                    _context.EDMSFiles.Add(file);

                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_ADD_FILE_SUCCESS"];
                    msg.Object = edmsReposCatFile.Id;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_MSG_INVALID_FORMAT"];
                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }
        public class FileRepoModel
        {
            public string CatCode { get; set; }
            public string FileName { get; set; }
            public string FileType { get; set; }
        }
        #endregion

        #region Result OCR

        [HttpPost]
        public JsonResult JTableResult([FromBody] ResultOCRModel jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;

            var query = (from a in _context.ResultFindOCRs.Where(x => !x.IsDeleted && x.UserId.Equals(ESEIM.AppContext.UserId))
                         join b in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Group equals b.CodeSet into b1
                         from b in b1.DefaultIfEmpty()
                         join c in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Unit equals c.CodeSet into c1
                         from c in c1.DefaultIfEmpty()
                         join d in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Type equals d.CodeSet into d1
                         from d in d1.DefaultIfEmpty()
                         where string.IsNullOrEmpty(jTablePara.Group) || a.Group.Equals(jTablePara.Group)
                         select new
                         {
                             a.ID,
                             a.KeyWord,
                             a.Value,
                             Group = b != null ? b.ValueSet : "",
                             Unit = c != null ? c.ValueSet : "",
                             Type = d != null ? d.ValueSet : ""
                         }).DistinctBy(x => new { x.Value, x.KeyWord });
            var count = query.Count();
            var data = query.Skip(intBeginFor).Take(jTablePara.Length).ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "ID", "KeyWord", "Value", "Group", "Unit", "Type");
            return Json(jdata);
        }

        [HttpPost]
        public JsonResult DeleteResultOCR(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var result = _context.ResultFindOCRs.FirstOrDefault(x => x.ID == id);
                if (result != null)
                {
                    result.IsDeleted = true;
                    result.DeletedBy = ESEIM.AppContext.UserName;
                    result.DeletedTime = DateTime.Now;
                    _context.ResultFindOCRs.Update(result);
                    _context.SaveChanges();
                    msg.Title = "Xóa thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Bản ghi không tồn tại";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpGet]
        public object GetInfoGroup(string group)
        {
            var groupName = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(group)).ValueSet ?? "";
            var session = HttpContext.GetSessionUser();
            var resultOCR = _context.ResultFindOCRs.FirstOrDefault(x => !x.IsDeleted && x.Group.Equals(group)
                            && x.UserId.Equals(session.UserId));
            var strTime = "";
            if (resultOCR != null)
            {
                strTime = resultOCR.CreatedTime.Value.ToString("HH:mm dd/MM/yyyy");
            }
            return new
            {
                Group = groupName,
                FullName = session.FullName,
                Time = strTime
            };
        }
        public class ResultOCRModel : JTableModel
        {
            public string Group { get; set; }
        }
        #endregion

        #region Export excel
        [HttpPost]
        public object ExportExcel()
        {
            var msg = new JMessage();
            var listData = (from a in _context.ResultFindOCRs.Where(x => !x.IsDeleted && x.UserId.Equals(ESEIM.AppContext.UserId))
                            join b in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Group equals b.CodeSet into b1
                            from b in b1.DefaultIfEmpty()
                            join c in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Unit equals c.CodeSet into c1
                            from c in c1.DefaultIfEmpty()
                            join d in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Type equals d.CodeSet into d1
                            from d in d1.DefaultIfEmpty()
                            select new ResultOCRExcel
                            {
                                ID = a.ID,
                                KeyWord = a.KeyWord,
                                Value = a.Value,
                                Group = b != null ? b.ValueSet : "",
                                Unit = c != null ? c.ValueSet : "",
                                Type = d != null ? d.ValueSet : ""
                            }).ToList();
            var filePath = "/files/Template/temp-search-content.xlsx";

            string path = filePath;
            var pathUpload = string.Concat(_hostingEnvironment.WebRootPath, path);
            Stream fileStreamPath = new FileStream(pathUpload, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
            FormFile fileUpload = new FormFile(fileStreamPath, 0, fileStreamPath.Length, "Test", "Test.xlsx");

            // Read content from file
            using (ExcelEngine excelEngine = new ExcelEngine())
            {
                IApplication application = excelEngine.Excel;
                IWorkbook workbook = application.Workbooks.Open(fileUpload.OpenReadStream());
                IWorksheet sheetRequest = workbook.Worksheets[0];
                application.DefaultVersion = ExcelVersion.Excel2013;
                IStyle style = workbook.Styles.Add("NewStyle");
                style.Borders[ExcelBordersIndex.EdgeLeft].LineStyle = ExcelLineStyle.Thin;
                style.Borders[ExcelBordersIndex.EdgeRight].LineStyle = ExcelLineStyle.Thin;
                style.Borders[ExcelBordersIndex.EdgeTop].LineStyle = ExcelLineStyle.Dotted;
                style.Borders[ExcelBordersIndex.EdgeBottom].LineStyle = ExcelLineStyle.Thin;
                style.Font.FontName = "Times New Roman";
                var countAdd = listData.Count;
                if (countAdd > 0)
                    sheetRequest.InsertRow(4, countAdd);
                var row = 3;

                var countAddComponent = listData.Count;
                if (countAddComponent > 0)
                    sheetRequest.InsertRow(row, countAddComponent);

                var id = 1;
                for (int j = 0; j < listData.Count; j++)
                {
                    //sheetRequest.Range["A1"].Value2 = string.Format("{0} {1}", "TỔNG HỢP CHẤM DỨT NĂM", string.IsNullOrEmpty(listData.FirstOrDefault().Year) ? DateTime.Now.Year.ToString() : listData.FirstOrDefault().Year);
                    sheetRequest.Range["A" + row].Value2 = id;
                    sheetRequest.Range["B" + row].Value2 = listData[j].KeyWord;
                    sheetRequest.Range["C" + row].Value2 = listData[j].Value;
                    sheetRequest.Range["D" + row].Value2 = listData[j].Unit;
                    sheetRequest.Range["E" + row].Value2 = listData[j].Group;
                    sheetRequest.Range["F" + row].Value2 = listData[j].Type;
                    sheetRequest.Range["A" + row + ":V" + row].CellStyle.HorizontalAlignment = ExcelHAlign.HAlignCenter;
                    sheetRequest.Range["B" + row].CellStyle.HorizontalAlignment = ExcelHAlign.HAlignLeft;
                    row++;
                    id++;
                }
                workbook.SetSeparators('.', '.');

                var fileName = "result-search-" + DateTime.Now.ToString("ddMMyyy-hhmm") + ".xlsx";
                var pathFile = _hostingEnvironment.WebRootPath + "\\uploads\\tempFile\\" + fileName;
                var pathFileDownLoad = "uploads\\tempFile\\" + fileName;
                FileStream stream = new FileStream(pathFile, FileMode.Create, FileAccess.ReadWrite);
                workbook.SaveAs(stream);
                stream.Dispose();

                var obj = new
                {
                    fileName,
                    pathFile = pathFileDownLoad
                };
                return obj;
            }
        }
        public class ResultOCRExcel
        {
            public int ID { get; set; }
            public string KeyWord { get; set; }
            public string Value { get; set; }
            public string Group { get; set; }
            public string Unit { get; set; }
            public string Type { get; set; }
        }
        public class ContentSearch
        {
            public int Id { get; set; }
            public string KeyWord { get; set; }
            public string Value { get; set; }
            public string FileName { get; set; }
        }
        #endregion

        #region Excute file
        [HttpPost]
        public JsonResult OCRFileOld([FromBody] ModelOCRFile jTablePara)
        {
            var msg = new JMessage { Error = false, Title = "" };
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            try
            {
                var keyWords = _context.UsrKeyWordSetups.Where(x => !x.IsDeleted && x.Group.Equals(jTablePara.Group)
                                && x.UserId.Equals(ESEIM.AppContext.UserId));
                var oldResult = _context.TempKeyWordSearchs.ToList();
                _context.TempKeyWordSearchs.RemoveRange(oldResult);
                var ocrOldResult = _context.ResultFindOCRs.Where(x => !x.IsDeleted && x.UserId.Equals(ESEIM.AppContext.UserId)
                                    && x.Group.Equals(jTablePara.Group));
                _context.ResultFindOCRs.RemoveRange(ocrOldResult);

                foreach (var item in keyWords)
                {
                    //var queryLucene = SearchLuceneFile(item.KeyWord, 0, 10);
                    var queryLucene = SearchLuceneFile(item.KeyWord, intBeginFor, jTablePara.Length);
                }
                _context.SaveChanges();
                var tempResult = from a in _context.TempKeyWordSearchs
                                 join b in _context.EDMSFiles.Where(x => !x.IsDeleted) on a.DocumentId equals b.FileCode
                                 join c in _context.EDMSRepoCatFiles on b.FileCode equals c.FileCode
                                 where (string.IsNullOrEmpty(jTablePara.CatCode) || c.CatCode.Equals(jTablePara.CatCode))
                                 select new
                                 {
                                     a.Value,
                                     b.FileName,
                                     a.KeySearch
                                 };
                foreach (var item in keyWords)
                {
                    if (item.KeyWord.Equals("VND") || item.KeyWord.Equals("USD"))
                    {
                        Regex regex = new Regex(@"([.\d,]+\sVND)", RegexOptions.Compiled | RegexOptions.IgnoreCase);
                        foreach (var result in tempResult)
                        {
                            var strArr = result.Value.Split("\r\n");
                            var idx = 1;
                            foreach (var str in strArr)
                            {
                                if (str.Contains("VND"))
                                {
                                    var keyWord = "";
                                    MatchCollection matches = regex.Matches(str);
                                    if (matches.Count > 0)
                                    {
                                        keyWord = str.Split(matches[0].Value)[0];
                                    }
                                    var resultOcr = new ResultFindOCR
                                    {
                                        CreatedBy = ESEIM.AppContext.UserName,
                                        CreatedTime = DateTime.Now,
                                        Group = item.Group,
                                        KeyWord = keyWord,
                                        Type = item.Type,
                                        Unit = item.Unit,
                                        UserId = ESEIM.AppContext.UserId,
                                        Value = matches[0].Value,
                                    };
                                    _context.ResultFindOCRs.Add(resultOcr);
                                }
                            }
                        }
                    }
                    else
                    {
                        Regex regx = new Regex(@"^(" + item.KeyWord + ")", RegexOptions.Compiled | RegexOptions.IgnoreCase);
                        foreach (var result in tempResult)
                        {
                            var strArr = result.Value.Split("\r\n");
                            foreach (var str in strArr)
                            {
                                MatchCollection matches = regx.Matches(str);
                                if (regx.IsMatch(str))
                                {
                                    var arrContent = str.Split(":");

                                    if (arrContent.Length > 0)
                                    {
                                        var resultOcr = new ResultFindOCR
                                        {
                                            CreatedBy = ESEIM.AppContext.UserName,
                                            CreatedTime = DateTime.Now,
                                            Group = item.Group,
                                            KeyWord = item.KeyWord,
                                            Type = item.Type,
                                            Unit = item.Unit,
                                            UserId = ESEIM.AppContext.UserId,
                                            Value = arrContent.Length == 2 ? arrContent[1] : str
                                        };
                                        _context.ResultFindOCRs.Add(resultOcr);
                                    }
                                }
                            }
                        }
                    }
                }
                _context.SaveChanges();
                msg.Title = "Xử lý thành công";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult SearchInFile([FromBody] ModelOCRFile jTablePara)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var keyWords = _context.UsrKeyWordSetups.Where(x => !x.IsDeleted && x.Group.Equals(jTablePara.Group)
                                && x.UserId.Equals(ESEIM.AppContext.UserId));
                //Clear old result
                var ocrOldResult = _context.ResultFindOCRs.Where(x => !x.IsDeleted && x.UserId.Equals(ESEIM.AppContext.UserId)
                                    && x.Group.Equals(jTablePara.Group));
                _context.ResultFindOCRs.RemoveRange(ocrOldResult);

                if (keyWords.Any())
                {
                    var lines = from a in _context.TempKeyWordSearchs.Where(x => !x.IsDeleted)
                                join b in _context.EDMSFiles.Where(x => !x.IsDeleted && (x.IsFileMaster == null || x.IsFileMaster == true)) on a.DocumentId equals b.FileCode
                                join c in _context.EDMSRepoCatFiles on b.FileCode equals c.FileCode
                                where (string.IsNullOrEmpty(jTablePara.CatCode) || c.CatCode.Equals(jTablePara.CatCode))
                                select new
                                {
                                    a.Value,
                                    b.FileName
                                };
                    Regex regex = new Regex(@"([.\d,]+\sVND)", RegexOptions.Compiled | RegexOptions.IgnoreCase);
                    foreach (var line in lines)
                    {
                        foreach (var keyWord in keyWords)
                        {
                            if (keyWord.Equals("VND") || keyWord.Equals("USD"))
                            {
                                MatchCollection matches = regex.Matches(line.Value);
                                var keyMoney = "";
                                if (matches.Count > 0)
                                {
                                    keyMoney = line.Value.Split(matches[0].Value)[0];
                                }
                                var resultOcr = new ResultFindOCR
                                {
                                    CreatedBy = ESEIM.AppContext.UserName,
                                    CreatedTime = DateTime.Now,
                                    Group = keyWord.Group,
                                    KeyWord = keyMoney,
                                    Type = keyWord.Type,
                                    Unit = keyWord.Unit,
                                    UserId = ESEIM.AppContext.UserId,
                                    Value = matches[0].Value,
                                };
                                _context.ResultFindOCRs.Add(resultOcr);
                            }
                            else
                            {
                                Regex regx = new Regex(@"^(" + keyWord.KeyWord + ")", RegexOptions.Compiled | RegexOptions.IgnoreCase);
                                if (regx.IsMatch(line.Value))
                                {
                                    var arrContent = line.Value.Split(":");

                                    if (arrContent.Length > 0)
                                    {
                                        var resultOcr = new ResultFindOCR
                                        {
                                            CreatedBy = ESEIM.AppContext.UserName,
                                            CreatedTime = DateTime.Now,
                                            Group = keyWord.Group,
                                            KeyWord = keyWord.KeyWord,
                                            Type = keyWord.Type,
                                            Unit = keyWord.Unit,
                                            UserId = ESEIM.AppContext.UserId,
                                            Value = arrContent.Length == 2 ? arrContent[1] : line.Value
                                        };
                                        _context.ResultFindOCRs.Add(resultOcr);
                                    }
                                }
                            }
                        }
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Bộ từ khóa chưa có từ khóa. Vui lòng thêm từ khóa";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult JTableFile([FromBody]JTableModelSearch jTablePara)
        {
            var contents = new List<ContentSearch>();

            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;

            //remove old result
            //var oldResult = _context.TempKeyWordSearchs.ToList();
            //_context.TempKeyWordSearchs.RemoveRange(oldResult);
            //Begin search
            if (!string.IsNullOrEmpty(jTablePara.KeyWord))
            {
                if (jTablePara.KeyWord.ToLower().Equals("vnd") || jTablePara.KeyWord.ToLower().Equals("vnđ"))
                {
                    var keySearch = "VND";
                    var queryLucene = SearchLuceneFile(keySearch, intBeginFor, jTablePara.Length);
                }
                if (jTablePara.KeyWord.ToLower().Equals("bên a") || jTablePara.KeyWord.ToLower().Equals("bên b") || jTablePara.KeyWord.ToLower().Contains("các bên"))
                {
                    var keySearch = "";
                    if (jTablePara.KeyWord.ToLower().Equals("bên a"))
                    {
                        keySearch = "BÊN A";
                    }
                    else if (jTablePara.KeyWord.ToLower().Equals("bên b"))
                    {
                        keySearch = "Bên B";
                    }
                    else
                    {
                        keySearch = "BÊN A";
                    }
                    var queryLucene = SearchLuceneFile(keySearch, intBeginFor, jTablePara.Length);
                }
                else
                {
                    var queryLucene = SearchLuceneFile(jTablePara.KeyWord, intBeginFor, jTablePara.Length);
                }
            }

            var tempResult = from a in _context.TempKeyWordSearchs
                             join b in _context.EDMSFiles.Where(x => !x.IsDeleted) on a.DocumentId equals b.FileCode
                             join c in _context.EDMSRepoCatFiles on b.FileCode equals c.FileCode
                             where (string.IsNullOrEmpty(jTablePara.CatCode) || c.CatCode.Equals(jTablePara.CatCode))
                             select new
                             {
                                 a.Value,
                                 b.FileName,
                                 a.KeySearch
                             };
            if (string.IsNullOrEmpty(jTablePara.KeyWord))
            {
                if (tempResult.Any())
                {
                    jTablePara.KeyWord = tempResult.FirstOrDefault().KeySearch;
                }
                else
                {
                    jTablePara.KeyWord = "";
                }
            }
            if (jTablePara.KeyWord.ToLower().Equals("bên a"))
            {
                Regex rxPartner = new Regex(@"^(BÊN A)", RegexOptions.Compiled | RegexOptions.IgnoreCase);
                Regex rxName = new Regex(@"^(Ông|Bà)", RegexOptions.Compiled | RegexOptions.IgnoreCase);
                Regex rxIdentity = new Regex(@"^(CMND)", RegexOptions.Compiled | RegexOptions.IgnoreCase);
                Regex rxAddress = new Regex(@"^(Địa chỉ)", RegexOptions.Compiled | RegexOptions.IgnoreCase);
                Regex rxPhone = new Regex(@"^(Điện thoại)", RegexOptions.Compiled | RegexOptions.IgnoreCase);
                Regex rxBank = new Regex(@"^(Tài khoản)", RegexOptions.Compiled | RegexOptions.IgnoreCase);
                foreach (var item in tempResult)
                {
                    var strArr = item.Value.Split("\r\n");
                    var idx = 1;
                    foreach (var str in strArr)
                    {
                        MatchCollection matches = rxPartner.Matches(str);
                        if (rxPartner.IsMatch(str) || rxName.IsMatch(str) || rxIdentity.IsMatch(str)
                            || rxAddress.IsMatch(str) || rxPhone.IsMatch(str) || rxBank.IsMatch(str))
                        {
                            var arrContent = str.Split(":");
                            if (arrContent.Length > 0)
                            {
                                var content = new ContentSearch
                                {
                                    Id = idx++,
                                    Value = arrContent.Length == 2 ? arrContent[1] : str,
                                    KeyWord = arrContent[0],
                                    FileName = item.FileName
                                };
                                contents.Add(content);
                            }
                            if (rxBank.IsMatch(str))
                            {
                                break;
                            }
                        }
                    }
                }
            }
            else if (jTablePara.KeyWord.ToLower().Equals("bên b"))
            {
                Regex rxPartner = new Regex(@"^(BÊN B|BỂN B)", RegexOptions.Compiled | RegexOptions.IgnoreCase);
                Regex rxAddress = new Regex(@"^(Địa chỉ)", RegexOptions.Compiled | RegexOptions.IgnoreCase);
                Regex rxTax = new Regex(@"^(Mã số thuế)", RegexOptions.Compiled | RegexOptions.IgnoreCase);
                Regex rxBank = new Regex(@"^(Tài khoản số)", RegexOptions.Compiled | RegexOptions.IgnoreCase);
                Regex rxRespresent = new Regex(@"^(Đại diện)", RegexOptions.Compiled | RegexOptions.IgnoreCase);
                foreach (var item in tempResult)
                {
                    var strArr = item.Value.Split("\r\n");
                    var idx = 1;
                    var isBeginB = false;
                    foreach (var str in strArr)
                    {
                        MatchCollection matches = rxPartner.Matches(str);
                        if (matches.Count > 0)
                            isBeginB = true;
                        if (isBeginB)
                        {
                            if (rxPartner.IsMatch(str) || rxAddress.IsMatch(str) || rxAddress.IsMatch(str) || rxBank.IsMatch(str))
                            {
                                var arrContent = str.Split(":");
                                if (arrContent.Length > 0)
                                {
                                    var content = new ContentSearch
                                    {
                                        Id = idx++,
                                        Value = arrContent[1],
                                        KeyWord = arrContent[0],
                                        FileName = item.FileName
                                    };
                                    contents.Add(content);
                                }
                                if (rxRespresent.IsMatch(str))
                                {
                                    break;
                                }
                            }
                            else if (rxBank.IsMatch(str))
                            {
                                var arrContent = str.Split("số");
                                if (arrContent.Length > 0)
                                {
                                    var content = new ContentSearch
                                    {
                                        Id = idx++,
                                        Value = arrContent[1],
                                        KeyWord = arrContent[0],
                                        FileName = item.FileName
                                    };
                                    contents.Add(content);
                                }
                            }
                        }
                    }
                }
            }
            else if (jTablePara.KeyWord.ToLower().Equals("vnd"))
            {
                Regex rx = new Regex(@"([.\d,]+\sVND)",
                 RegexOptions.Compiled | RegexOptions.IgnoreCase);
                foreach (var item in tempResult)
                {
                    var strArr = item.Value.Split("\r\n");
                    var idx = 1;
                    foreach (var str in strArr)
                    {
                        if (str.Contains("VND"))
                        {
                            var keyWord = "";
                            MatchCollection matches = rx.Matches(str);
                            if (matches.Count > 0)
                            {
                                keyWord = str.Split(matches[0].Value)[0];
                            }

                            var content = new ContentSearch
                            {
                                Id = idx++,
                                Value = matches[0].Value,
                                KeyWord = keyWord,
                                FileName = item.FileName
                            };
                            contents.Add(content);
                        }
                    }
                }
            }
            else
            {

            }
            var count = contents.Count();
            var data = contents.Skip(intBeginFor).Take(jTablePara.Length).ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "KeyWord", "Value", "FileName");
            return Json(jdata);
        }

        public class ModelOCRFile : JTableModel
        {
            public string CatCode { get; set; }
            public string Group { get; set; }
            public string UserId { get; set; }
        }
        #endregion

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerCTF.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerEdms.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_hrLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion
    }
}