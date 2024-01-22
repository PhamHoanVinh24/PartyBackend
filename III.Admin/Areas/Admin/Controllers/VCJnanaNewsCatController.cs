using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using Microsoft.AspNetCore.Http;
using System.IO;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Options;
using System.Globalization;
using ESEIM;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class VCJnanaNewsCatController : BaseController
    {
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly EIMDBContext _context;
        private readonly IActionLogService _actionLog;
        private readonly AppSettings _appSettings;
        public class JTableModelCustom : JTableModel
        {
            public string Key { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
        }
        public VCJnanaNewsCatController(EIMDBContext context, IOptions<AppSettings> appSettings, IHostingEnvironment hostingEnvironment, IActionLogService actionLog)
        {
            _context = context;
            _hostingEnvironment = hostingEnvironment;
            _actionLog = actionLog;
            _appSettings = appSettings.Value;
        }
        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public object JTable([FromBody]JTableModelCustom jTablePara)
        {
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from b in _context.VCJnanaNewsCats
                        where b.cat_status == 1 && (jTablePara.Key == null || jTablePara.Key == "" || b.cat_title.ToLower().Contains(jTablePara.Key.ToLower()))
                        && (jTablePara.FromDate == null || jTablePara.FromDate == "" || (b.created_time.Value.Date >= fromDate.Value.Date))
                        && (jTablePara.ToDate == null || jTablePara.ToDate == "" || (b.created_time.Value.Date <= toDate.Value.Date))
                        select new
                        {
                            b.id,
                            b.cat_code,
                            b.cat_title,
                            b.cat_description,
                            b.cat_parent_code,
                            b.created_time,
                            b.cat_avarta
                        };
            var count = query.Count();
            var data = query
                .OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "id", "cat_code", "cat_title", "cat_description", "created_time", "cat_parent_code", "cat_avarta");
            return Json(jdata);
        }

        [HttpPost]
        public async Task<JsonResult> Insert(VCJnanaNewsCat obj, IFormFile cat_avarta)
        {
            var company_code = "";
            //var company_code = HttpContext.GetSessionUser()?.CompanyCode;
            var msg = new JMessage() { Error = false, ID = 1 };
            try
            {
                VCJnanaNewsCat rs = _context.VCJnanaNewsCats.FirstOrDefault(x => x.cat_code == obj.cat_code && x.cat_status != 0);
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
                        obj.cat_avarta = iccat_avarta;
                    }

                    obj.Company_Code = company_code;
                    obj.created_time = DateTime.Now;
                    obj.cat_status = 1;
                    _context.VCJnanaNewsCats.Add(obj);
                    _context.SaveChanges();

                    msg.Title = "Thêm mới danh mục thành công";
                    msg.Error = false;
                    //_actionLog.InsertActionLog("Jnana_news_cat", "Insert new category successfully", null, obj, "Insert");
                }
                else
                {
                    msg.Title = "Mã đã tồn tại";
                    msg.Error = true;
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = "Có lỗi khi thêm khoản mục";
                //_actionLog.InsertActionLog("news_category", "Insert new category fail", null, obj, "Insert");
            }
            return Json(msg);
        }

        [HttpPost]
        public async Task<JsonResult> Update(VCJnanaNewsCat obj, IFormFile cat_avarta)
        {
            var msg = new JMessage() { Error = false, ID = 1 };
            try
            {

                var rs = _context.VCJnanaNewsCats.FirstOrDefault(x => x.id == obj.id);
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
                        rs.cat_avarta = iccat_avarta;
                    }
                    var query = from a in _context.VCJnanaNewsArticles
                                join b in _context.VCJnanaNewsCats
                                on a.cat_code equals b.cat_code
                                where b.cat_code == rs.cat_code
                                select a;
                    foreach (var item in query)
                    {
                        item.cat_code = obj.cat_code;
                        item.update_time = DateTime.Now;
                        _context.VCJnanaNewsArticles.Update(item);
                    }
                    rs.cat_code = obj.cat_code;
                    rs.cat_title = obj.cat_title;
                    rs.cat_description = obj.cat_description;
                    rs.cat_parent_code = obj.cat_parent_code;
                    rs.update_time = DateTime.Now;
                    _context.VCJnanaNewsCats.Update(rs);
                    _context.SaveChanges();
                    msg.Title = "Sửa thông tin danh mục thành công";
                    msg.Error = false;
                    //_actionLog.InsertActionLog("Jnana_news_cat", "update category successfully", rs, obj, "Update");
                }
                else
                {
                    msg.Title = "Xảy ra lỗi, vui lòng thử lại.";
                    msg.Error = true;
                }


            }
            catch (Exception ex)
            {
                //msg.ID = 0;
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
            var a = _context.VCJnanaNewsCats.AsNoTracking().Single(m => m.id == id);
            return Json(a);
        }

        [HttpPost]
        public object Delete(int id)
        {
            var msg = new JMessage { Error = true };
            try
            {
                var data = _context.VCJnanaNewsCats.FirstOrDefault(x => x.id == id);
                data.cat_status = 0;
                _context.VCJnanaNewsCats.Update(data);
                _context.SaveChanges();
                msg.Error = false;
                msg.Title = "Xóa danh mục thành công!";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi xóa!";
            }
            return Json(msg);
        }

        [HttpPost]
        public object GettreedataCategory()
        {
            var msg = new JMessage { Error = true };

            try
            {
                var data = _context.VCJnanaNewsCats.OrderBy(x => x.id).Where(x => x.cat_status == 1);
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
                    VCJnanaNewsCat obj = _context.VCJnanaNewsCats.FirstOrDefault(x => x.id == id);
                    if (obj != null)
                    {
                        obj.cat_status = 0;
                        _context.VCJnanaNewsCats.Update(obj);
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
    }
}