
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
using MimeKit;
using MailKit.Net.Smtp;
using MailKit.Security;
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
    public class VCJnanaNewsArticleController : BaseController
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


        public VCJnanaNewsArticleController(EIMDBContext context, ILogger<VCJnanaNewsArticleController> logger, IOptions<AppSettings> appSettings, IHostingEnvironment hostingEnvironment, IActionLogService actionLog)
        {
            _context = context;
            _logger = logger;
            _hostingEnvironment = hostingEnvironment;
            _actionLog = actionLog;
            _appSettings = appSettings.Value;
        }
        public IActionResult Index()
        {
            ViewData["Message"] = "TIN TỨC NỘI BỘ  - TIN TỨC";
            return View("Index");
        }

        [HttpPost]
        public object JTable([FromBody]JTableModelCustom jTablePara)
        {
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.VCJnanaNewsArticles
                        join b in _context.VCJnanaNewsCats on a.cat_code equals b.cat_code into b1
                        where a.article_status == 1 && (jTablePara.Key == null || jTablePara.Key == "" || a.article_title.ToLower().Contains(jTablePara.Key.ToLower()))
                        && (jTablePara.Key4 == null || jTablePara.Key4 == "" || a.cat_code.ToLower().Equals(jTablePara.Key4.ToLower()))
                        && (fromDate == null || (a.created_time.Value.Date >= fromDate.Value.Date))
                        && (toDate == null || (a.created_time.Value.Date <= toDate.Value.Date))
                        select new
                        {
                            a.id,
                            a.article_code,
                            a.article_title,
                            a.article_content,
                            a.article_avarta,
                            a.artile_order,
                            a.created_time
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "id", "article_code", "article_title", "article_content", "article_avarta", "cat_code", "artile_order", "created_time");
            return Json(jdata);
        }

        [HttpPost]
        public async Task<JsonResult> Insert(VCJnanaNewsArticle obj, IFormFile article_avarta)
        {

            var msg = new JMessage() { Error = false, ID = 1 };
            try
            {
                var rs = _context.VCJnanaNewsArticles.FirstOrDefault(x => x.article_code == obj.article_code && x.article_status != 0);
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
                        obj.article_avarta = iccat_avarta;
                    }
                    obj.created_time = DateTime.Now;
                    obj.article_status = 1;
                    _context.VCJnanaNewsArticles.Add(obj);
                    _context.SaveChanges();

                    msg.Title = "Thêm mới tin tức thành công";
                    msg.Error = false;
                    //_actionLog.InsertActionLog("Jnana_news_cat", "Insert new category successfully", null, obj, "Insert");
                }
                else
                {

                    msg.Title = "Mã tin tức đã tồn tại";
                    msg.Error = true;
                }
            }
            catch (Exception ex)
            {
                //msg.ID = 0;
                msg.Error = true;
                msg.Object = ex;
                msg.Title = "Có lỗi khi thêm khoản mục";
                //_actionLog.InsertActionLog("news_category", "Insert new category fail", null, obj, "Insert");
            }
            return Json(msg);
        }

        [HttpPost]
        public async Task<JsonResult> Update(VCJnanaNewsArticle obj, IFormFile article_avarta)
        {
            var msg = new JMessage() { Error = false, ID = 1 };
            try
            {
                var rs = _context.VCJnanaNewsArticles.FirstOrDefault(x => x.id.Equals(obj.id));

                if (rs != null)
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
                        rs.article_avarta = iccat_avarta;
                    }
                    rs.id = obj.id;
                    var query = from b in _context.VCJnanaNewsArticleFiles
                                join c in _context.VCJnanaNewsArticles on b.article_code equals c.article_code
                                where c.article_code == rs.article_code
                                select b;
                    if (query.Count() != 0)
                    {
                        foreach (var item in query)
                        {
                            item.article_code = obj.article_code;
                            _context.VCJnanaNewsArticleFiles.Update(item);
                        }
                    }

                    rs.article_code = obj.article_code;
                    rs.article_title = obj.article_title;
                    rs.article_content = obj.article_content;
                    rs.artile_order = obj.artile_order;
                    rs.cat_code = obj.cat_code;
                    rs.update_time = DateTime.Now;
                    _context.VCJnanaNewsArticles.Update(rs);
                    _context.SaveChanges();
                    msg.Title = "Sửa tin tức thành công";
                    msg.Error = false;
                    //_actionLog.InsertActionLog("Jnana_news_cat", "update category successfully", rs, obj, "Update");
                }
                else
                {
                    msg.Title = "Không tồn tại dữ liệu.";
                    msg.Error = true;
                }
            }
            catch (Exception ex)
            {
                msg.ID = 0;
                msg.Error = true;
                msg.Object = ex;
                msg.Title = "Có lỗi khi sửa khoản mục";
                //_actionLog.InsertActionLog("Jnana_news_cat", "update category fail", null, obj, "Update");
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
            var a = _context.VCJnanaNewsArticles.AsNoTracking().Single(m => m.id == id);
            ma_art = a.id;
            code_art = a.article_code;
            return Json(a);
        }

        [HttpPost]
        public object Delete(int id)
        {
            var msg = new JMessage { Error = true };
            try
            {
                var data = _context.VCJnanaNewsArticles.FirstOrDefault(x => x.id == id);
                //data.article_status = 0;
                _context.VCJnanaNewsArticles.Remove(data);
                _context.SaveChanges();
                msg.Error = false;
                msg.Title = "Xóa tin tức thành công!";
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi xóa!";
                return Json(msg);
            }
        }

        [HttpPost]
        public async Task<JsonResult> SendPushNotification(int id)
        {
            var msg = new JMessage() { Error = true };
            var obj2 = _context.VCJnanaNewsArticles.SingleOrDefault(x => x.id == id);
            var dataa = from a in _context.VCJnanaFiles
                        join b in _context.VCJnanaNewsArticleFiles on a.file_code equals b.file_code
                        join c in _context.VCJnanaNewsArticles on b.article_code equals c.article_code
                        where c.id == id
                        select new
                        {
                            file_path = a.file_path
                        };

            var stringData = string.Join(", ", dataa);
            if (obj2 != null)
            {
                try
                {
                    var applicationID = "AAAAQTp7NQ0:APA91bHsBv08eWtw-TsvFRteTcrd9KF8cH5rHKlWuQnvd7_a7UKMbGso4oxctp-Jes28fFmBvkIhUT8ehHw-gkDXH6PxhVbv-m4fvUdZRvpPur57psho9-37FTlrzqZQnf0vESUrj6bT";
                    var senderId = "280154027277";

                    var query = _context.VCJnanaFcms.OrderBy(x => x.Id).AsNoTracking().ToList();
                    using (var client = new HttpClient())
                    {
                        //do something with http client
                        client.BaseAddress = new Uri("https://fcm.googleapis.com");
                        client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                        client.DefaultRequestHeaders.TryAddWithoutValidation("Authorization", $"key={applicationID}");
                        client.DefaultRequestHeaders.TryAddWithoutValidation("Sender", $"id={senderId}");
                        foreach (var i in query)
                        {
                            if (stringData != null && stringData != "")
                            {
                                var data = new
                                {
                                    to = i.Token,
                                    notification = new
                                    {

                                        body = obj2.article_content + " File đính kèm: " + stringData,
                                        title = obj2.article_title,
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

                                        body = obj2.article_content,
                                        title = obj2.article_title,
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
                    VCJnanaFcmMessage data_msg = new VCJnanaFcmMessage();
                    data_msg.Create_time = DateTime.Now;

                    data_msg.Message = obj2.article_content + " File đính kèm: " + stringData;
                    data_msg.Title = obj2.article_title;
                    _context.VCJnanaFcmMessages.Add(data_msg);
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
        public object GettreedataCategory()
        {
            var data = _context.VCJnanaNewsCats.Where(x => x.cat_status == 1).Select(x => new { Code = x.cat_code, Name = x.cat_title });
            return data;
        }

        [HttpPost]
        public object DeleteItems([FromBody]List<int> listIdI)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                foreach (var id in listIdI)
                {
                    VCJnanaNewsArticle obj = _context.VCJnanaNewsArticles.FirstOrDefault(x => x.id == id);
                    if (obj != null)
                    {
                        //obj.article_status = 0;
                        _context.VCJnanaNewsArticles.Remove(obj);
                        _context.SaveChanges();
                    }
                }
                msg.Title = "Xóa danh mục thành công!";
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
        public object JTableFile([FromBody]JTableModelCustom jTablePara)
        {
            var fromDate = !string.IsNullOrEmpty(jTablePara.postDate) ? DateTime.ParseExact(jTablePara.postDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.VCJnanaFiles
                        join b in _context.VCJnanaNewsArticleFiles on a.file_code equals b.file_code
                        join c in _context.VCJnanaNewsArticles on b.article_code equals c.article_code
                        where c.id == ma_art && a.file_status == 1 && c.article_status == 1
                        && (jTablePara.Key1 == "" || jTablePara.Key1 == null || a.file_name.ToLower().Contains(jTablePara.Key1.ToLower()))
                        && (fromDate == null || a.created_time.Value.Date == fromDate.Value.Date)
                        select new
                        {
                            id = a.id,
                            file_code = a.file_code,
                            file_name = a.file_name,
                            file_note = a.file_note,
                            file_path = a.file_path,
                            created_time = a.created_time
                        };
            var count = query.Count();

            var data = query
                .OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "id", "file_code", "file_name", "file_note", "file_path", "created_time");
            return Json(jdata);
        }

        [HttpPost]
        public async Task<JsonResult> InsertFile(VCJnanaFile obj, IFormFile file_path)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var query = _context.VCJnanaNewsArticles.FirstOrDefault(x => x.id.Equals(ma_art));

                var rs = _context.VCJnanaNewsArticleFiles.FirstOrDefault(x => x.file_code.Equals(obj.file_code));
                var art_file = new VCJnanaNewsArticleFile();
                art_file.article_code = query.article_code;
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
                        obj.file_path = icfile_path;
                    }
                    obj.created_time = DateTime.Now;
                    obj.file_status = 1;
                    _context.VCJnanaFiles.Add(obj);

                    art_file.file_code = obj.file_code;
                    art_file.created_time = obj.created_time;
                    _context.VCJnanaNewsArticleFiles.Add(art_file);
                    _context.SaveChanges();
                    msg.Title = "Thêm mới tệp tin thành công";
                }
                else
                {
                    msg.Title = "Mã tệp tin đã tồn tại";
                    msg.Error = true;
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi thêm khoản mục";
            }
            return Json(msg);
        }

        [HttpPost]
        public async Task<JsonResult> UpdateFile(VCJnanaFile obj, IFormFile file_path)
        {
            var msg = new JMessage() { Error = false, ID = 1 };
            try
            {

                VCJnanaFile rs = _context.VCJnanaFiles.FirstOrDefault(x => x.id == obj.id);

                var query = from a in _context.VCJnanaFiles
                            where (a.file_code == obj.file_code && a.id != obj.id)
                            select a;
                var count = query.Count();
                var query2 = from a in _context.VCJnanaNewsArticles
                             where a.id == ma_art
                             select a;
                VCJnanaNewsArticleFile art_file = new VCJnanaNewsArticleFile();
                foreach (var item in query2)
                {
                    art_file.article_code = item.article_code;
                }

                VCJnanaNewsArticleFile rs1 = _context.VCJnanaNewsArticleFiles.FirstOrDefault(x => x.file_code == rs.file_code && x.article_code == art_file.article_code);

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
                        rs.file_path = icfile_path;
                    }
                    rs.id = obj.id;
                    rs.file_code = obj.file_code;
                    rs.file_name = obj.file_name;
                    rs.file_title = obj.file_title;
                    rs.file_note = obj.file_note;
                    rs.file_cat_code = obj.file_cat_code;
                    rs.updated_time = DateTime.Now;
                    _context.VCJnanaFiles.Update(rs);

                    rs1.file_code = obj.file_code;
                    _context.VCJnanaNewsArticleFiles.Update(rs1);
                    _context.SaveChanges();
                    msg.Title = "Sửa thông tin tệp tin thành công";
                    msg.Error = false;
                    _actionLog.InsertActionLog("VCJnanaFiles", "update file successfully", rs, obj, "Update");
                }
                else
                {
                    msg.Title = "Xảy ra lỗi, vui lòng thử lại.";
                    msg.Error = true;
                }


            }
            catch (Exception ex)
            {
                msg.ID = 0;
                msg.Error = true;
                msg.Object = ex;
                msg.Title = "Có lỗi khi sửa khoản mục";
                _actionLog.InsertActionLog("VCJnanaFiles", "update file fail", null, obj, "Update");
            }
            return Json(msg);
        }

        [HttpGet]
        public object GetItemFile(int? id)
        {
            if (id == null || id < 0)
            {
                return Json("");
            }
            var a = _context.VCJnanaFiles.AsNoTracking().Single(m => m.id == id);
            return Json(a);
        }

        [HttpPost]
        public object DeleteFile(int id)
        {
            var msg = new JMessage { Error = true };
            try
            {
                var data = _context.VCJnanaFiles.FirstOrDefault(x => x.id == id);
                var data2 = _context.VCJnanaNewsArticleFiles.FirstOrDefault(x => x.file_code.Equals(data.file_code));
                //data.file_status = 0;
                _context.VCJnanaFiles.Remove(data);
                _context.VCJnanaNewsArticleFiles.Remove(data2);
                _context.SaveChanges();
                msg.Error = false;
                msg.Title = "Xóa tệp tin thành công!";
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi xóa!";
                return Json(msg);
            }
        }

        //[HttpPost]
        //public object DeleteItemsFile([FromBody]List<int> listIdI)
        //{
        //    var msg = new JMessage() { Error = false };
        //    try
        //    {
        //        foreach (var id in listIdI)
        //        {
        //            VCJnanaFile obj = _context.VCJnanaFiles.FirstOrDefault(x => x.id == id);
        //            if (obj != null)
        //            {
        //                obj.file_status = 0;
        //                _context.VCJnanaFiles.Update(obj);
        //                _context.SaveChanges();
        //            }
        //        }
        //        msg.Title = "Xóa file thành công!";
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Object = ex;
        //        msg.Title = String.Format(CommonUtil.ResourceValue("MSG_DELETE_LIST_FAIL"), CommonUtil.ResourceValue("RESOURCE"));
        //    }
        //    return Json(msg);
        //}

        //[HttpPost]
        //public JsonResult InsertFileno([FromBody]VCJnanaNewsArticleFile obj)
        //{
        //    var msg = new JMessage() { Error = false };
        //    VCJnanaNewsArticleFile js = new VCJnanaNewsArticleFile();
        //    try
        //    {
        //        var query = from a in _context.VCJnanaNewsArticleFiles
        //                    where a.file_code == obj.file_code && a.article_code == code_art
        //                    select a;
        //        if (query.Count() == 0)
        //        {
        //            js.file_code = obj.file_code;
        //            js.article_code = code_art;
        //            js.created_time = DateTime.Now;
        //            _context.VCJnanaNewsArticleFiles.Add(js);
        //            _context.SaveChanges();
        //            msg.Title = "Thêm thành công";
        //        }
        //        else
        //        {
        //            msg.Title = "Tệp tin đã tồn tại";
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Object = ex;
        //        msg.Title = "Có lỗi khi thêm ";
        //    }
        //    return Json(msg);
        //}

        [HttpPost]
        public object GettreedataFile()
        {
            var msg = new JMessage { Error = true };

            try
            {
                var data = _context.VCJnanaFiles.OrderBy(x => x.id).Where(x => x.file_status == 1);
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