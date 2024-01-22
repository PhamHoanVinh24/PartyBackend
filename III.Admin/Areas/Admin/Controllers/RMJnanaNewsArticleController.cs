using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Http;
using System.IO;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Options;
using System.Net.Http;
using System.Net.Http.Headers;
using Newtonsoft.Json;
using System.Text;
using System.Globalization;
using ESEIM;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class RMJnanaNewsArticleController : BaseController
    {
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly EIMDBContext _context;
        private readonly ILogger _logger;
        private readonly IActionLogService _actionLog;
        private readonly AppSettings _appSettings;
        private static int ma_art;
        private static string code_art;
        public class JTableModelCustom : JTableModel
        {
            public string Key { get; set; }
            public string Key1 { get; set; }
            public string Key4 { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string postDate { get; set; }
        }


        public RMJnanaNewsArticleController(EIMDBContext context,  IOptions<AppSettings> appSettings, IHostingEnvironment hostingEnvironment, IActionLogService actionLog)
        {
            _context = context;
            _hostingEnvironment = hostingEnvironment;
            _actionLog = actionLog;
            _appSettings = appSettings.Value;
        }
        public IActionResult Index()
        {
            ViewData["Message"] = String.Format(CommonUtil.ResourceValue("RMJNA_TITLE_RMJNA_INTERNAL"));
            return View("Index");
        }

        [HttpPost]
        public object JTable([FromBody]JTableModelCustom jTablePara)
        {
            var company_code = "";
            //var company_code = HttpContext.GetSessionUser()?.CompanyCode;
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.RmJnanaNewsArticles
                        join b in _context.RmJnanaNewsCats
                        on a.CatCode equals b.CatCode
                        where a.ArticleStatus == 1 && b.CatStatus==1 && (jTablePara.Key == null || jTablePara.Key == "" || a.ArticleTitle.ToLower().Contains(jTablePara.Key.ToLower())) 
                        && (jTablePara.Key4 == null || jTablePara.Key4 == "" || a.CatCode.ToLower().Contains(jTablePara.Key4.ToLower()))
                         && (fromDate == null|| (a.CreatedTime.Value.Date >= fromDate.Value.Date))
                        && (toDate == null || (a.CreatedTime.Value.Date <= toDate.Value.Date))
                        select new
                        {
                            id = a.Id,
                            article_code = a.ArticleCode,
                            article_title = a.ArticleTitle,
                            article_content = a.ArticleContent,
                            cat_code = a.CatCode,
                            artile_order = a.ArtileOrder,
                            created_time=a.CreatedTime
                        };

            var count = query.Count();
            var data = query
                .OrderUsingSortExpression("artile_order").Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "id", "article_code", "article_title", "article_content", "cat_code", "artile_order", "created_time");
            return Json(jdata);
        }
        [HttpPost]
        public async Task<JsonResult> Insert(RmJnanaNewsArticle obj, IFormFile article_avarta)
        {

            var msg = new JMessage() { Error = false, ID = 1 };
            try
            {
                RmJnanaNewsArticle rs = _context.RmJnanaNewsArticles.FirstOrDefault(x =>x.ArticleCode == obj.ArticleCode);
                if (rs == null)
                {

                    var iccat_avarta = "";

                    if (article_avarta != null && article_avarta.Length > 0)
                    {
                        var pathUpload = Path.Combine(_hostingEnvironment.WebRootPath, "uploads\\images");
                        if (!Directory.Exists(pathUpload)) Directory.CreateDirectory(pathUpload);

                        var fileName = DateTimeOffset.Now.ToUnixTimeMilliseconds() + article_avarta.FileName;
                        var filePath = Path.Combine(pathUpload, fileName);
                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            await article_avarta.CopyToAsync(stream);
                        }
                        iccat_avarta = "/uploads/images/" + fileName;
                    }
                    if (iccat_avarta != "")
                    {
                        obj.ArticleAvarta = iccat_avarta;
                    }
                    obj.CreatedTime = DateTime.Now;
                    obj.ArticleStatus = 1;
                    _context.RmJnanaNewsArticles.Add(obj);
                    _context.SaveChanges();

                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_ADD_SUCCESS"));
                    msg.Error = false;
                    _actionLog.InsertActionLog("Jnana_news_cat", "Insert new category successfully", null, obj, "Insert");
                }
                else
                {

                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_EXITS"), CommonUtil.ResourceValue("RMJNA_MSG_CODE"));
                    msg.Error = true;
                }
            }
            catch (Exception ex)
            {
                msg.ID = 0;
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_ADD"));
                _actionLog.InsertActionLog("news_category", "Insert new category fail", null, obj, "Insert");
            }
            return Json(msg);
        }
        [HttpPost]
        public async Task<JsonResult> Update(RmJnanaNewsArticle obj, IFormFile article_avarta)
        {
            var msg = new JMessage() { Error = false, ID = 1 };
            try
            {

                RmJnanaNewsArticle rs = _context.RmJnanaNewsArticles.FirstOrDefault(x => x.Id == obj.Id);
                var query = from a in _context.RmJnanaNewsArticles
                            where (a.ArticleCode == obj.ArticleCode && a.Id != obj.Id)
                            select a;
                var count = query.Count();
                // Jnana_news_article_file rs1 = _context.RmJnanaNewsArticleFiles.FirstOrDefault(x=> x.article_code == rs.article_code);
              
                if (rs != null && count == 0)
                {
                    var iccat_avarta = "";

                    if (article_avarta != null && article_avarta.Length > 0)
                    {
                        var pathUpload = Path.Combine(_hostingEnvironment.WebRootPath, "uploads\\images");
                        if (!Directory.Exists(pathUpload)) Directory.CreateDirectory(pathUpload);

                        var fileName = DateTimeOffset.Now.ToUnixTimeMilliseconds() + article_avarta.FileName;
                        var filePath = Path.Combine(pathUpload, fileName);
                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            await article_avarta.CopyToAsync(stream);
                        }
                        iccat_avarta = "/uploads/images/" + fileName;
                    }
                    if (iccat_avarta != "")
                    {
                        rs.ArticleAvarta = iccat_avarta;
                    }
                    rs.Id = obj.Id;
                    var query1 = from b in _context.RmJnanaNewsArticleFiles
                                 join c in _context.RmJnanaNewsArticles on b.ArticleCode equals c.ArticleCode
                                 where c.ArticleCode == rs.ArticleCode
                                 select b;
                    if (query1.Count() != 0)
                    {
                        foreach (var item in query1)
                        {
                            item.ArticleCode = obj.ArticleCode;
                            _context.RmJnanaNewsArticleFiles.Update(item);
                        }
                    }
                    
                    rs.ArticleCode = obj.ArticleCode;
                    rs.ArticleTitle = obj.ArticleTitle;
                    rs.ArticleContent = obj.ArticleContent;
                    rs.ArtileOrder = obj.ArtileOrder;
                    rs.CatCode = obj.CatCode;
                    rs.UpdateTime = DateTime.Now;
                    _context.RmJnanaNewsArticles.Update(rs);
                    _context.SaveChanges();
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_UPDATE_SUCCESS"), CommonUtil.ResourceValue("RMJNA_MSG_INFORMATION_CATEGORY"));
                    msg.Error = false;
                    _actionLog.InsertActionLog("Jnana_news_cat", "update category successfully", rs, obj, "Update");
                }
                else
                {
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_ERR_RETRY"));
                    msg.Error = true;
                }


            }
            catch (Exception ex)
            {
                msg.ID = 0;
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_UPDATE_FAIL"));
                _actionLog.InsertActionLog("Jnana_news_cat", "update category fail", null, obj, "Update");
            }
            return Json(msg);
        }
        [HttpGet]
        public object GetItem(int? id)
        {

            if (id == null || id < 0)
            {
                return Json("");
            }
            var a = _context.RmJnanaNewsArticles.AsNoTracking().Single(m => m.Id == id);
            ma_art = a.Id;
            code_art = a.ArticleCode;
            return Json(a);
        }
        [HttpPost]
        public object Delete(int id)
        {
            var msg = new JMessage { Error = true };
            try
            {
                var data = _context.RmJnanaNewsArticles.FirstOrDefault(x => x.Id == id);
                data.ArticleStatus = 0;
                _context.RmJnanaNewsArticles.Update(data);
                _context.SaveChanges();
                msg.Error = false;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_DELETE_SUCCESS"));
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_DELETE"));
                return Json(msg);
            }
        }

        [HttpPost]
        public async Task<JsonResult> SendPushNotification(int id)
        {
            var msg = new JMessage() { Error = true };
            var obj2 = _context.RmJnanaNewsArticles.SingleOrDefault(x => x.Id == id);
            var dataa = from a in _context.RmJnanaFiles
                        join b in _context.RmJnanaNewsArticleFiles on a.FileCode equals b.FileCode
                        join c in _context.RmJnanaNewsArticles on b.ArticleCode equals c.ArticleCode
                        where c.Id == id
                        select new
                        {
                            file_path = a.FilePath
                        };

            var stringData = string.Join(", ", dataa);
            if (obj2 != null)
            {
                try
                {
                    var applicationID = "AAAAQTp7NQ0:APA91bHsBv08eWtw-TsvFRteTcrd9KF8cH5rHKlWuQnvd7_a7UKMbGso4oxctp-Jes28fFmBvkIhUT8ehHw-gkDXH6PxhVbv-m4fvUdZRvpPur57psho9-37FTlrzqZQnf0vESUrj6bT";
                    var senderId = "280154027277";

                    var query = _context.RmJnanaFcms.OrderBy(x => x.Id).AsNoTracking().ToList();
                        using (var client = new HttpClient())
                        {
                            //do something with http client
                            client.BaseAddress = new Uri("https://fcm.googleapis.com");
                            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                            client.DefaultRequestHeaders.TryAddWithoutValidation("Authorization", $"key={applicationID}");
                            client.DefaultRequestHeaders.TryAddWithoutValidation("Sender", $"id={senderId}");
                            foreach (var i in query)
                            {
                            if (stringData!=null && stringData !="")
                            {
                                var data = new
                                {
                                    to = i.Token,
                                    notification = new
                                    {

                                        body = obj2.ArticleContent + " " +  String.Format(CommonUtil.ResourceValue("COM_ATTACHED_FILE")) + " " + stringData,
                                        title = obj2.ArticleTitle,
                                        icon = "myicon",
                                        sound = "beep.aiff"
                                    },
                                    priority = "high"
                                };
                                var json = JsonConvert.SerializeObject(data);
                                var httpContent = new StringContent(json, Encoding.UTF8, "application/json");
                                var result = await client.PostAsync("/fcm/send", httpContent);
                            }
                            else
                            {
                                var data = new
                                {
                                    to = i.Token,
                                    notification = new
                                    {

                                        body = obj2.ArticleContent ,
                                        title = obj2.ArticleTitle,
                                        icon = "myicon",
                                        sound = "beep.aiff"
                                    },
                                    priority = "high"
                                };
                                var json = JsonConvert.SerializeObject(data);
                                var httpContent = new StringContent(json, Encoding.UTF8, "application/json");
                                var result = await client.PostAsync("/fcm/send", httpContent);
                            }
                            }                        
                        }
                    RmJnanaFcmMessage data_msg = new RmJnanaFcmMessage();
                    data_msg.CreateTime = DateTime.Now;

                    data_msg.Message = obj2.ArticleContent + " " + String.Format(CommonUtil.ResourceValue("COM_ATTACHED_FILE")) + " " + stringData;
                    data_msg.Title = obj2.ArticleTitle;
                    _context.RmJnanaFcmMessages.Add(data_msg);
                    await _context.SaveChangesAsync();
                    msg.Error = false;
                        msg.Title = "Send Success!";
                }
                catch (Exception ex)
                {
                    msg.Error = true;
                    msg.Title = "Send Fail!" + ex.Message;
                }
            }

            return Json(msg);
        }

        [HttpPost]
        public object gettreedataCategory()
        {
            var msg = new JMessage { Error = true };
            try
            {
                var data = _context.RmJnanaNewsCats.OrderBy(x => x.id).Where(x=>x.CatStatus==1);
                msg.Object = data;
                msg.Error = false;
            }
            catch (Exception ex)
            {
                msg.Title = "Get Parent Group fail ";
            }

            return Json(msg);
        }
        [HttpPost]
        public object DeleteItems([FromBody]List<int> listIdI)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                foreach (var id in listIdI)
                {
                    RmJnanaNewsArticle obj = _context.RmJnanaNewsArticles.FirstOrDefault(x => x.Id == id);
                    if (obj != null)
                    {
                        obj.ArticleStatus = 0;
                        _context.RmJnanaNewsArticles.Update(obj);
                        _context.SaveChanges();
                    }
                }
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_DELETE_SUCCESS"));
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(CommonUtil.ResourceValue("MSG_DELETE_LIST_FAIL"), CommonUtil.ResourceValue("RESOURCE"));
            }
            return Json(msg);
        }



        string[] formats = { "dd/MM/yyyy", "d/MM/yyyy", "dd/M/yyyy", "dd/MM/yy", "d/MM/yy", "dd/M/yy" };
        [HttpPost]
        public object jTableFile([FromBody]JTableModelCustom jTablePara)
        {
            var fromDate = !string.IsNullOrEmpty(jTablePara.postDate) ? DateTime.ParseExact(jTablePara.postDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.RmJnanaFiles
                        join b in _context.RmJnanaNewsArticleFiles
                        on a.FileCode equals b.FileCode
                        join c in _context.RmJnanaNewsArticles
                        on b.ArticleCode equals c.ArticleCode
                        where c.Id == ma_art && a.FileStatus == 1 
                        && (jTablePara.Key1 == "" || jTablePara.Key1 == null || a.FileName.ToLower().Contains(jTablePara.Key1.ToLower()))
                         && (fromDate == null || a.CreatedTime.Value.Date == fromDate.Value.Date)
                        select new
                        {
                            id = a.id,
                            file_code = a.FileCode,
                            file_name = a.FileName,
                            file_note = a.FileNote,
                            file_path = a.FilePath,
                            created_time = a.CreatedTime
                        };
            var count = query.Count();

            var data = query
                .OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "id", "file_code", "file_name", "file_note", "file_path", "created_time");
            return Json(jdata);



        }
        public async Task<JsonResult> InsertFile(RmJnanaFile obj, IFormFile file_path)
        {
            var msg = new JMessage() { Error = false, ID = 1 };
            try
            {
                var query = from a in _context.RmJnanaNewsArticles
                            where a.Id == ma_art
                            select a;

                RmJnanaFile rs = _context.RmJnanaFiles.FirstOrDefault(x => x.FileCode == obj.FileCode);
                RmJnanaNewsArticleFile art_file = new RmJnanaNewsArticleFile();
                foreach (var item in query)
                {
                    art_file.ArticleCode = item.ArticleCode;
                }
                if (rs == null)
                {

                    var icfile_path = "";

                    if (file_path != null && file_path.Length > 0)
                    {
                        var pathUpload = Path.Combine(_hostingEnvironment.WebRootPath, "uploads\\images");
                        if (!Directory.Exists(pathUpload)) Directory.CreateDirectory(pathUpload);

                        var fileName = DateTimeOffset.Now.ToUnixTimeMilliseconds() + file_path.FileName;
                        var filePath = Path.Combine(pathUpload, fileName);
                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            await file_path.CopyToAsync(stream);
                        }
                        icfile_path = "/uploads/images/" + fileName;
                    }
                    if (icfile_path != "")
                    {
                        obj.FilePath = icfile_path;
                    }
                    obj.CreatedTime = DateTime.Now;
                    obj.FileStatus = 1;
                    _context.RmJnanaFiles.Add(obj);

                    art_file.FileCode = obj.FileCode;
                    art_file.CreatedTime = obj.CreatedTime;
                    _context.RmJnanaNewsArticleFiles.Add(art_file);


                    _context.SaveChanges();

                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_ADD_FILE_SUCCESS"));
                    msg.Error = false;
                    _actionLog.InsertActionLog("RmJnanaFiles", "Insert new file successfully", null, obj, "Insert");
                }
                else
                {

                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_EXITS"), CommonUtil.ResourceValue("RMJNA_MSG_CODE"));
                    msg.Error = true;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                msg.ID = 0;
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_ADD"));
                _actionLog.InsertActionLog("RmJnanaFiles", "Insert new  file fail", null, obj, "Insert");
            }
            return Json(msg);
        }
        public async Task<JsonResult> UpdateFile(RmJnanaFile obj, IFormFile file_path)
        {
            var msg = new JMessage() { Error = false, ID = 1 };
            try
            {

                RmJnanaFile rs = _context.RmJnanaFiles.FirstOrDefault(x => x.id == obj.id);

                var query = from a in _context.RmJnanaFiles
                            where (a.FileCode == obj.FileCode && a.id != obj.id)
                            select a;
                var count = query.Count();
                var query2 = from a in _context.RmJnanaNewsArticles
                             where a.Id == ma_art
                             select a;
                RmJnanaNewsArticleFile art_file = new RmJnanaNewsArticleFile();
                foreach (var item in query2)
                {
                    art_file.ArticleCode = item.ArticleCode;
                }

                RmJnanaNewsArticleFile rs1 = _context.RmJnanaNewsArticleFiles.FirstOrDefault(x => x.FileCode == rs.FileCode && x.ArticleCode == art_file.ArticleCode);

                if (rs != null && count == 0)
                {

                    var icfile_path = "";

                    if (file_path != null && file_path.Length > 0)
                    {
                        var pathUpload = Path.Combine(_hostingEnvironment.WebRootPath, "uploads\\images");
                        if (!Directory.Exists(pathUpload)) Directory.CreateDirectory(pathUpload);

                        var fileName = DateTimeOffset.Now.ToUnixTimeMilliseconds() + file_path.FileName;
                        var filePath = Path.Combine(pathUpload, fileName);
                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            await file_path.CopyToAsync(stream);
                        }
                        icfile_path = "/uploads/images/" + fileName;
                    }
                    if (icfile_path != "")
                    {
                        rs.FilePath = icfile_path;
                    }
                    rs.id = obj.id;
                    rs.FileCode = obj.FileCode;
                    rs.FileName = obj.FileName;
                    rs.FileTitle = obj.FileTitle;
                    rs.FileNote = obj.FileNote;
                    rs.FileCatCode = obj.FileCatCode;
                    rs.UpdatedTime = DateTime.Now;
                    _context.RmJnanaFiles.Update(rs);

                    rs1.FileCode = obj.FileCode;
                    _context.RmJnanaNewsArticleFiles.Update(rs1);
                    _context.SaveChanges();
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_EDIT_INFORMATION_SUCCESS"));
                    msg.Error = false;
                    _actionLog.InsertActionLog("RmJnanaFiles", "update file successfully", rs, obj, "Update");
                }
                else
                {
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_ERR_RETRY"));
                    msg.Error = true;
                }


            }
            catch (Exception ex)
            {
                msg.ID = 0;
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_UPDATE_FAIL"));
                _actionLog.InsertActionLog("RmJnanaFiles", "update file fail", null, obj, "Update");
            }
            return Json(msg);
        }
        [HttpGet]
        public object GetItemFile(int? id)
        {
            //var query =from a in _context.RmJnanaFiles
            //           join b in _context.Ja
            if (id == null || id < 0)
            {
                return Json("");
            }
            var a = _context.RmJnanaFiles.AsNoTracking().Single(m => m.id == id);
            //ma_cat = a.id;
           // art_codea = a.file_code;
            return Json(a);
        }
        [HttpPost]
        public object DeleteFile(int id)
        {
            var msg = new JMessage { Error = true };
            try
            {
                var data = _context.RmJnanaFiles.FirstOrDefault(x => x.id == id);
                data.FileStatus = 0;
                _context.RmJnanaFiles.Update(data);
                _context.SaveChanges();
                msg.Error = false;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_SUCCESS"), CommonUtil.ResourceValue("RMJNA_MSG_FILE"));
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_DELETE"));
                return Json(msg);
            }
        }
        [HttpPost]
        public object DeleteItemsFile([FromBody]List<int> listIdI)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                foreach (var id in listIdI)
                {
                    RmJnanaFile obj = _context.RmJnanaFiles.FirstOrDefault(x => x.id == id);
                    if (obj != null)
                    {
                        obj.FileStatus = 0;
                        _context.RmJnanaFiles.Update(obj);
                        _context.SaveChanges();
                    }
                }
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_SUCCESS"), CommonUtil.ResourceValue("RMJNA_MSG_FILE"));
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(CommonUtil.ResourceValue("MSG_DELETE_LIST_FAIL"), CommonUtil.ResourceValue("RESOURCE"));
            }
            return Json(msg);
        }
        
              [HttpPost]
        public JsonResult insertFileno([FromBody]RmJnanaNewsArticleFile obj)
        {
            var msg = new JMessage() { Error = false };
            RmJnanaNewsArticleFile js = new RmJnanaNewsArticleFile();
            try
            {
                var query = from a in _context.RmJnanaNewsArticleFiles
                            where a.FileCode == obj.FileCode && a.ArticleCode == code_art
                            select a;
                if(query.Count()==0)
                {
                    js.FileCode = obj.FileCode;
                    js.ArticleCode = code_art;
                    js.CreatedTime = DateTime.Now;
                    _context.RmJnanaNewsArticleFiles.Add(js);
                    _context.SaveChanges();
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_ADD_SUCCESS"));
                }
                else
                {
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_FILE_EXISTS"));
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_ADD"));
            }
            return Json(msg);
        }


        [HttpPost]
        public object gettreedataFile()
        {
            var msg = new JMessage { Error = true };

            try
            {
                var data = _context.RmJnanaFiles.OrderBy(x => x.id).Where(x=>x.FileStatus==1);
                msg.Object = data;
                msg.Error = false;
            }
            catch (Exception ex)
            {
                msg.Title = "Get Parent Group fail ";
            }

            return Json(msg);
        }
    }
}