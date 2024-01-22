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
using System.Globalization;
using ESEIM;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class RMJnanaNewsCatController : BaseController
    {
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly EIMDBContext _context;
        private readonly ILogger _logger;
        private readonly IActionLogService _actionLog;
        private readonly AppSettings _appSettings;
        public class JTableModelCustom : JTableModel
        {
            public string Key { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
        }
        public RMJnanaNewsCatController(EIMDBContext context, IOptions<AppSettings> appSettings, IHostingEnvironment hostingEnvironment, IActionLogService actionLog)
        {
            _context = context;
            _hostingEnvironment = hostingEnvironment;
            _actionLog = actionLog;
            _appSettings = appSettings.Value;
        }
        public IActionResult Index()
        {
            ViewData["Message"] = String.Format(CommonUtil.ResourceValue("RMJNC_MSG_INTERNAL_NEWS_CATEGORY"));
            return View("Index");
        }

        [HttpPost]
        public object JTable([FromBody]JTableModelCustom jTablePara)
        {
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            var company_code = "";
            // var company_code = HttpContext.GetSessionUser()?.CompanyCode;
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from b in _context.RmJnanaNewsCats
                        where b.CatStatus == 1 && (jTablePara.Key == null || jTablePara.Key == "" || b.CatTitle.ToLower().Contains(jTablePara.Key.ToLower()))
                        && (jTablePara.FromDate == null || jTablePara.FromDate == "" || (b.CreatedTime.Value.Date >= fromDate.Value.Date))
                        && (jTablePara.ToDate == null || jTablePara.ToDate == "" || (b.CreatedTime.Value.Date <= toDate.Value.Date))
                        select new
                        {
                            id = b.id,
                            cat_code = b.CatCode,
                            cat_title = b.CatTitle,
                            cat_description = b.CatDescription,
                            cat_parent_code = b.CatParentCode,
                            created_time = b.CreatedTime,
                            cat_avarta = b.CatAvarta
                        };
            //var f = DateTime.Parse(jTablePara.Key1);
            var count = query.Count();
            var data = query
                .OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "id", "cat_code", "cat_title", "cat_description", "created_time", "cat_parent_code", "cat_avarta");
            return Json(jdata);
        }

        public async Task<JsonResult> Insert(RmJnanaNewsCat obj, IFormFile cat_avarta)
        {
            var company_code = "";
            //var company_code = HttpContext.GetSessionUser()?.CompanyCode;
            var msg = new JMessage() { Error = false, ID = 1 };
            try
            {
                RmJnanaNewsCat rs = _context.RmJnanaNewsCats.FirstOrDefault(x => x.CatCode == obj.CatCode);
                if (rs == null)
                {

                    var iccat_avarta = "";

                    if (cat_avarta != null && cat_avarta.Length > 0)
                    {
                        var pathUpload = Path.Combine(_hostingEnvironment.WebRootPath, "uploads\\images");
                        if (!Directory.Exists(pathUpload)) Directory.CreateDirectory(pathUpload);

                        var fileName = DateTimeOffset.Now.ToUnixTimeMilliseconds() + cat_avarta.FileName;
                        var filePath = Path.Combine(pathUpload, fileName);
                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            await cat_avarta.CopyToAsync(stream);
                        }
                        iccat_avarta = "/uploads/images/" + fileName;
                    }
                    if (iccat_avarta != "")
                    {
                        obj.CatAvarta = iccat_avarta;
                    }

                    obj.CompanyCode = company_code;
                    obj.CreatedTime = DateTime.Now;
                    obj.CatStatus = 1;
                    _context.RmJnanaNewsCats.Add(obj);
                    _context.SaveChanges();

                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_ADD_SUCCESS"), CommonUtil.ResourceValue("RMJNC_MSG_CATEGORY"));
                    msg.Error = false;
                    _actionLog.InsertActionLog("Jnana_news_cat", "Insert new category successfully", null, obj, "Insert");
                }
                else
                {

                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_EXITS"), CommonUtil.ResourceValue("RMJNC_CURD_LBL_CODE"));
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
        public async Task<JsonResult> Update(RmJnanaNewsCat obj, IFormFile cat_avarta)
        {
            var msg = new JMessage() { Error = false, ID = 1 };
            try
            {

                RmJnanaNewsCat rs = _context.RmJnanaNewsCats.FirstOrDefault(x => x.id == obj.id);
                if (rs != null)
                {

                    var iccat_avarta = "";

                    if (cat_avarta != null && cat_avarta.Length > 0)
                    {
                        var pathUpload = Path.Combine(_hostingEnvironment.WebRootPath, "uploads\\images");
                        if (!Directory.Exists(pathUpload)) Directory.CreateDirectory(pathUpload);

                        var fileName = DateTimeOffset.Now.ToUnixTimeMilliseconds() + cat_avarta.FileName;
                        var filePath = Path.Combine(pathUpload, fileName);
                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            await cat_avarta.CopyToAsync(stream);
                        }
                        iccat_avarta = "/uploads/images/" + fileName;
                    }
                    if (iccat_avarta != "")
                    {
                        rs.CatAvarta = iccat_avarta;
                    }
                    var query = from a in _context.RmJnanaNewsArticles
                                join b in _context.RmJnanaNewsCats
                                on a.CatCode equals b.CatCode
                                where b.CatCode == rs.CatCode
                                select a;
                    foreach (var item in query)
                    {
                        item.CatCode = obj.CatCode;
                        item.UpdateTime = DateTime.Now;
                        _context.RmJnanaNewsArticles.Update(item);
                    }
                    rs.CatCode = obj.CatCode;
                    rs.CatTitle = obj.CatTitle;
                    rs.CatDescription = obj.CatDescription;
                    rs.CatParentCode = obj.CatParentCode;
                    rs.UpdateTime = DateTime.Now;
                    _context.RmJnanaNewsCats.Update(rs);
                    _context.SaveChanges();
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_UPDATE_SUCCESS"));
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
            var a = _context.RmJnanaNewsCats.AsNoTracking().Single(m => m.id == id);
            return Json(a);
        }
        [HttpPost]
        public object Delete(int id)
        {
            var msg = new JMessage { Error = true };
            try
            {
                var data = _context.RmJnanaNewsCats.FirstOrDefault(x => x.id == id);
                data.CatStatus = 0;
                _context.RmJnanaNewsCats.Update(data);
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
        public object gettreedataCategory()
        {
            var msg = new JMessage { Error = true };

            try
            {
                var data = _context.RmJnanaNewsCats.OrderBy(x => x.id).Where(x => x.CatStatus == 1);
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
                    RmJnanaNewsCat obj = _context.RmJnanaNewsCats.FirstOrDefault(x => x.id == id);
                    if (obj != null)
                    {
                        obj.CatStatus = 0;
                        _context.RmJnanaNewsCats.Update(obj);
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



    }
}