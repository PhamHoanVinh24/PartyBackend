using ESEIM;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class RMSosManagerController : BaseController
    {
        private readonly UserManager<AspNetUser> _userManager;
        private readonly RoleManager<AspNetRole> _roleManager;
        private readonly EIMDBContext _context;
        private readonly AppSettings _appSettings;
        private readonly ILogger _logger;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly UploadService _uploadService;
        private readonly string[] imageExt = { ".gif", ".jpeg", ".jpg", ".png", ".svg", ".blob" };
        //private readonly EIMDBContext _context;
        //private readonly ILogger _logger;
        public RMSosManagerController(IOptions<AppSettings> appSettings, EIMDBContext context, UserManager<AspNetUser> userManager,
            RoleManager<AspNetRole> roleManager, IHostingEnvironment hostingEnvironment
            //, UploadService uploadService
            )
        {
            _userManager = userManager;
            _context = context;
            _roleManager = roleManager;
            _appSettings = appSettings.Value;
            _hostingEnvironment = hostingEnvironment;
            _uploadService = new UploadService(_hostingEnvironment, _context);
        }
        string[] formats = { "dd/MM/yyyy", "d/MM/yyyy", "dd/M/yyyy", "dd/MM/yy", "d/MM/yy", "dd/M/yy" };

        public IActionResult Index()
        {
            ViewData["Message"] = "KHẨN CẤP (SOS)";
            return View("Index");
        }
        [HttpPost]
        public object JTable([FromBody]SosSearch jTablePara)
        {
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, formats, new CultureInfo("vi-VN"), DateTimeStyles.None) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, formats, new CultureInfo("vi-VN"), DateTimeStyles.None) : (DateTime?)null;

            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            
            var query = from a in _context.RmSOSInfos
                        join b in _context.RmSOSMedias on a.Code equals b.SosCode into b2
                        from b1 in b2.DefaultIfEmpty()
                        where (fromDate == null || a.CreatedTime.Date >= fromDate.Value.Date) && (toDate == null || a.CreatedTime.Date <= toDate.Value.Date)
                        select new
                        {
                            a.Id,
                            a.Code,
                            a.Title,
                            a.Data,
                            a.Priority,
                            a.Note,
                            a.Address,
                            Path = b1 != null ? b1.Path : "",
                            ImageId = b1 != null ? b1.Id : -1,
                            a.CreatedBy
                        };
            
            var list = query.OrderByDescending(x => x.Id).GroupBy(x => x.Id);
            var count = list.Count();
            
            List<MySosRes> list1 = new List<MySosRes>();
            foreach (var item in list)
            {
                MySosRes dt = new MySosRes();
                string imgPath="";
                foreach (var item1 in item)
                {
                    if (dt.Code == null)
                        imgPath = item1.Path;
                    //imgPath.Add(item1.Path);
                    dt.Id = item1.Id;
                    dt.Code = item1.Code;
                    dt.Title = item1.Title;
                    dt.Data = item1.Data;
                    dt.Priority = item1.Priority;
                    dt.Note = item1.Note;
                    dt.Address = item1.Address;
                    dt.CreatedBy = item1.CreatedBy;
                }
                dt.ImageCode = imgPath;
                list1.Add(dt);
            }
            var list2  = list1.Skip(intBeginFor).Take(jTablePara.Length).ToList();
            var jdata = JTableHelper.JObjectTable(list2, jTablePara.Draw, count, "Id", "Code", "Title", "Data", "Address", "Priority", "Note", "Created_by", "ImageCode");
            return Json(jdata);
        }
        [HttpPost]
        public JsonResult Insert(SOSInfoInsert obj, List<IFormFile> pictureFile)
        {
            var msg = new JMessage() { Error = false, ID = 1 };
            try
            {

                var data = new RmSOSInfo();
                data.Code = obj.Code;
                data.Note = obj.Note;
                data.Title = obj.Title;
                data.CreatedBy = obj.Created_by;
                data.CreatedTime = DateTime.Now;
                data.Data = obj.Data;
                data.Priority = obj.Priority;
                data.Address = obj.Address;
                _context.RmSOSInfos.Add(data);
                var list = new List<RmSOSMedia>();
                if (pictureFile.Count > 0)
                {
                    foreach (var item in pictureFile)
                    {
                        if (item.Length > 0)
                        {
                            var mes = _uploadService.UploadImage(item);
                            var fileName = Path.GetFileName(item.FileName);
                            var extend = Path.GetExtension(fileName);
                            fileName = Path.GetFileNameWithoutExtension(fileName);
                            var media = new RmSOSMedia();
                            media.Path = "/uploads/Files/" + mes.Object.ToString();
                            media.Size = item.Length;
                            media.Extension = extend;
                            media.Name = fileName;
                            media.Code = Guid.NewGuid().ToString();
                            media.SosCode = data.Code;
                            _context.RmSOSMedias.Add(media);
                            msg.Object = media;
                            list.Add(media);
                        }
                    }
                    if (list.Count > 0)
                        _context.RmSOSMedias.AddRange(list);
                }
                else
                {
                    var ImageCode = obj.ImageCode.Replace("[\"", "").Replace("\"]", "").Replace("\",\"", ",").Split(',');

                    foreach (var item in ImageCode)
                    {
                        var dt = _context.RmSOSMedias.FirstOrDefault(x => x.Code == item);
                        if (dt != null)
                        {
                            dt.SosCode = data.Code;
                            _context.RmSOSMedias.Update(dt);
                        }
                    }
                }
                _context.SaveChanges();
                msg.Error = false;
                msg.Title = "Thêm thành công";

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Xảy ra lỗi khi thêm";
            }
            msg.Object = obj;
            return Json(msg);
        }
        [HttpPost]
        public JsonResult GetNextCode(string userName)
        {
            var msg = new JMessage() { Error = false, ID = 1 };
            var date = DateTime.Now;
            var count = _context.RmSOSInfos.Where(x => x.CreatedBy.ToLower() == userName.ToLower()).Count();
            var sosCode = "SOS_" + userName + "_" + date.ToString("dd-MM-yyyy-HH-mm-ss.ffffff") + "_" + (count + 1);
            msg.Object = sosCode;
            return Json(msg);
        }


        [HttpPost]
        public JsonResult UploadImage(IFormFile pictureFile)
        {
            var msg = new JMessage() { Error = false, ID = 1 };
            try
            {
                if (pictureFile.Length > 0)
                {
                    var mes = _uploadService.UploadImage(pictureFile);
                    var fileName = Path.GetFileName(pictureFile.FileName);
                    var extend = Path.GetExtension(fileName);
                    fileName = Path.GetFileNameWithoutExtension(fileName);
                    var media = new RmSOSMedia();
                    media.Path = "/uploads/images/" + mes.Object.ToString();
                    media.Size = pictureFile.Length;
                    media.Extension = extend;
                    media.Name = fileName;
                    media.Code = Guid.NewGuid().ToString();
                    _context.RmSOSMedias.Add(media);
                    msg.Object = media;
                }
                _context.SaveChanges();
                msg.Error = false;
                msg.Title = "Thêm thành công";

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Xảy ra lỗi khi thêm";
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult GetMySos(MySosSearch obj)
        {
            JMessage msg = new JMessage();
            try
            {
                var query = from a in _context.RmSOSInfos
                            join b in _context.RmSOSMedias on a.Code equals b.SosCode into b2
                            from b1 in b2.DefaultIfEmpty()
                            where a.CreatedBy == obj.UserName
                            select new
                            {
                                a.Id,
                                a.Code,
                                a.Title,
                                a.Data,
                                a.Priority,
                                a.Note,
                                a.Address,
                                Path = b1 != null ? b1.Path : "",
                                ImageId = b1 != null ? b1.Id : -1
                            };
                if (obj.Length == 0)
                {
                    var list = query.OrderByDescending(x => x.Id).GroupBy(x => x.Id).ToList();

                    List<MySosRes> list1 = new List<MySosRes>();
                    foreach (var item in list)
                    {
                        MySosRes dt = new MySosRes();
                        List<string> imgPath = new List<string>();
                        foreach (var item1 in item)
                        {
                            if (!string.IsNullOrEmpty(item1.Path))
                                imgPath.Add(item1.Path);
                            dt.Id = item1.Id;
                            dt.Code = item1.Code;
                            dt.Title = item1.Title;
                            dt.Data = item1.Data;
                            dt.Priority = item1.Priority;
                            dt.Note = item1.Note;
                            dt.Address = item1.Address;
                        }
                        dt.ImageCodes = imgPath;
                        list1.Add(dt);
                    }

                    msg.Object = list1;
                }
                else
                {
                    var list = query.OrderByDescending(x => x.Id).GroupBy(x => x.Id).Skip(obj.Length * obj.Page).Take(obj.Length).ToList();
                    List<string> imgPath = new List<string>();
                    List<MySosRes> list1 = new List<MySosRes>();
                    foreach (var item in list)
                    {
                        MySosRes dt = new MySosRes();
                        foreach (var item1 in item)
                        {
                            imgPath.Add(item1.Path);
                            dt.Id = item1.Id;
                            dt.Code = item1.Code;
                            dt.Title = item1.Title;
                            dt.Data = item1.Data;
                            dt.Priority = item1.Priority;
                            dt.Note = item1.Note;
                            dt.Address = item1.Address;
                        }
                        dt.ImageCodes = imgPath;
                        list1.Add(dt);
                    }
                    msg.Object = list1;
                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Xảy ra lỗi khi lấy dữ liệu";
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult DeleteItem(string sosCode)
        {
            JMessage msg = new JMessage();
            try
            {
                var data = _context.RmSOSInfos.FirstOrDefault(x => x.Code == sosCode);
                if (data != null)
                {
                    _context.RmSOSInfos.Remove(data);
                    var media = _context.RmSOSMedias.Where(x => x.SosCode == data.Code).ToList();
                    if (media.Count > 0)
                    {
                        _context.RmSOSMedias.RemoveRange(media);
                    }
                    _context.SaveChanges();
                    msg.Error = false;
                    msg.Title = "Xóa thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Không tìm thấy bản ghi này";
                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Xảy ra lỗi khi lấy dữ liệu";
            }
            return Json(msg);
        }
        //[HttpPost]
        //public JsonResult DeleteItems(List<string> sosCodes)
        //{
        //    JMessage msg = new JMessage();
        //    try
        //    {
        //        var data = _context.SOSInfos.FirstOrDefault(x => x.Code == sosCode);
        //        if (data != null)
        //        {
        //            _context.SOSInfos.Remove(data);
        //            msg.Error = false;
        //            msg.Title = "Xóa thành công";
        //        }
        //        else
        //        {
        //            msg.Error = true;
        //            msg.Title = "Không tìm thấy bản ghi này";
        //        }

        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Title = "Xảy ra lỗi khi lấy dữ liệu";
        //    }
        //    return Json(msg);
        //}
        [HttpPost]
        public JsonResult UploadImageList(List<IFormFile> pictureFile)
        {
            var msg = new JMessage() { Error = false, ID = 1 };
            try
            {
                var list = new List<RmSOSMedia>();
                foreach (var item in pictureFile)
                {
                    if (item.Length > 0)
                    {
                        var mes = _uploadService.UploadImage(item);
                        var fileName = Path.GetFileName(item.FileName);
                        var extend = Path.GetExtension(fileName);
                        fileName = Path.GetFileNameWithoutExtension(fileName);
                        var media = new RmSOSMedia();
                        media.Path = "/uploads/Files/" + mes.Object.ToString();
                        media.Size = item.Length;
                        media.Extension = extend;
                        media.Name = fileName;
                        media.Code = Guid.NewGuid().ToString();
                        _context.RmSOSMedias.Add(media);
                        msg.Object = media;
                        list.Add(media);
                    }
                }
                _context.SaveChanges();
                msg.Error = false;
                msg.Title = "Thêm thành công";
                msg.Object = list;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Xảy ra lỗi khi thêm";
            }
            return Json(msg);
        }

        [HttpPost]
        public async Task<string> Upload(IFormFile file)
        {
            try
            {

                // Upload avatar
                if (file != null)
                {
                    if (file.Length > 0)
                    {
                        string extension = Path.GetExtension(file.FileName);
                        if (Array.IndexOf(imageExt, extension) >= 0)
                        {
                            var rootPath = $"{_hostingEnvironment.WebRootPath}\\uploads\\images";
                            string imageName = string.Format("{0}", file.FileName, DateTime.Now, Path.GetExtension(file.FileName));
                            string imgPath = Path.Combine(rootPath, imageName);
                            try
                            {
                                using (var fileStream = new FileStream(imgPath, FileMode.Create))
                                {
                                    await file.CopyToAsync(fileStream);
                                    return $"/uploads/images/{imageName}";
                                }
                            }
                            catch (Exception e)
                            {

                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {

            }
            return "";
        }

    }
    public class SOSInfoInsert
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public string Title { get; set; }
        public string Data { get; set; }
        public string Address { get; set; }
        public int Priority { get; set; }
        public string Note { get; set; }
        public string Created_by { get; set; }

        public string ImageCode { get; set; }
    }
}