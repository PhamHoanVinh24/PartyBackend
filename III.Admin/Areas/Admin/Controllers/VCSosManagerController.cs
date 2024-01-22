using ESEIM;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using III.Admin.Controllers;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class VcSosManagerController : Controller
    {
        private readonly UserManager<AspNetUser> _userManager;
        private readonly RoleManager<AspNetRole> _roleManager;
        private readonly EIMDBContext _context;
        private readonly AppSettings _appSettings;
        private readonly ILogger _logger;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly UploadService _uploadService;
        private readonly string[] imageExt = { ".gif", ".jpeg", ".jpg", ".png", ".svg", ".blob" };
        public VcSosManagerController(IOptions<AppSettings> appSettings, EIMDBContext context, UserManager<AspNetUser> userManager,
            RoleManager<AspNetRole> roleManager, ILogger<VcSosManagerController> logger, IHostingEnvironment hostingEnvironment
            //, UploadService uploadService
            )
        {
            _userManager = userManager;
            _context = context;
            _roleManager = roleManager;
            _appSettings = appSettings.Value;
            _logger = logger;
            _hostingEnvironment = hostingEnvironment;
            _uploadService = new UploadService(_hostingEnvironment, _context);
        }

        public IActionResult Index()
        {
            return View("Index");
        }
        [HttpPost]
        public object JTable([FromBody]SosSearch jTablePara)
        {
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = (from a in _context.VcSOSInfos
                         where (fromDate == null || (fromDate.Value.Date <= a.CreatedTime.Date))
                         && (toDate == null || (a.CreatedTime.Date <= toDate.Value.Date))
                         select a).AsNoTracking().OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).ToList();

            var count = (from a in _context.VcSOSInfos
                         where (fromDate == null || (fromDate.Value.Date <= a.CreatedTime.Date))
                         && (toDate == null || (a.CreatedTime.Date <= toDate.Value.Date))
                         select a).AsNoTracking().Count();
            var data = query.Select(x => new
            {
                x.Id,
                x.Code,
                x.Title,
                x.Data,
                x.Priority,
                x.Note,
                x.Address,
                //ImageCode = _context.VcSOSMedias.FirstOrDefault(y => y.SosCode == x.Code)?.Path,
                x.CreatedTime
            }).ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "Code", "Title", "Data", "Address", "Priority", "Note", "CreatedTime");
            return Json(jdata);
        }
        //[HttpPost]
        //public JsonResult Insert(VcSOSInfoInsert obj, List<IFormFile> pictureFile)
        //{
        //    var msg = new JMessage() { Error = false, ID = 1 };
        //    try
        //    {

        //        var data = new VcSOSInfo();
        //        data.Code = obj.Code;
        //        data.Note = obj.Note;
        //        data.Title = obj.Title;
        //        data.CreatedBy = obj.CreatedBy;
        //        data.CreatedTime = DateTime.Now;
        //        data.Data = obj.Data;
        //        data.Priority = obj.Priority;
        //        data.Address = obj.Address;
        //        _context.VcSOSInfos.Add(data);
        //        var list = new List<VcSOSMedia>();
        //        if (pictureFile.Count > 0)
        //        {
        //            foreach (var item in pictureFile)
        //            {
        //                if (item.Length > 0)
        //                {
        //                    var mes = _uploadService.UploadImage(item);
        //                    var fileName = Path.GetFileName(item.FileName);
        //                    var extend = Path.GetExtension(fileName);
        //                    fileName = Path.GetFileNameWithoutExtension(fileName);
        //                    var media = new VcSOSMedia();
        //                    media.Path = "/uploads/Files/" + mes.Object.ToString();
        //                    media.Size = item.Length;
        //                    media.Extension = extend;
        //                    media.Name = fileName;
        //                    media.Code = Guid.NewGuid().ToString();
        //                    media.SosCode = data.Code;
        //                    _context.VcSOSMedias.Add(media);
        //                    msg.Object = media;
        //                    list.Add(media);
        //                }
        //            }
        //            if (list.Count > 0)
        //                _context.VcSOSMedias.AddRange(list);
        //        }
        //        else
        //        {
        //            var ImageCode = obj.ImageCode.Replace("[\"", "").Replace("\"]", "").Replace("\",\"", ",").Split(',');

        //            foreach (var item in ImageCode)
        //            {
        //                var dt = _context.VcSOSMedias.FirstOrDefault(x => x.Code == item);
        //                if (dt != null)
        //                {
        //                    dt.SosCode = data.Code;
        //                    _context.VcSOSMedias.Update(dt);
        //                }
        //            }
        //        }
        //        _context.SaveChanges();
        //        msg.Error = false;
        //        msg.Title = "Thêm thành công";

        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Title = "Xảy ra lỗi khi thêm";
        //    }
        //    msg.Object = obj;
        //    return Json(msg);
        //}
        [HttpPost]
        public async Task<JsonResult> Insert(VcSOSInfoInsert obj, List<IFormFile> pictureFile)
        {
            var msg = new JMessage() { Error = false, ID = 1 };
            try
            {

                var data = new VcSOSInfo();
                data.Code = obj.Code;
                data.Note = obj.Note;
                data.Title = obj.Title;
                data.CreatedBy = obj.CreatedBy;
                data.CreatedTime = DateTime.Now;
                data.Data = obj.Data;
                data.Priority = obj.Priority;
                data.Address = obj.Address;
                _context.VcSOSInfos.Add(data);
                var list = new List<VcSOSMedia>();
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
                            var media = new VcSOSMedia();
                            media.Path = "/uploads/Files/" + mes.Object.ToString();
                            media.Size = item.Length;
                            media.Extension = extend;
                            media.Name = fileName;
                            media.Code = Guid.NewGuid().ToString();
                            media.SosCode = data.Code;
                            _context.VcSOSMedias.Add(media);
                            msg.Object = media;
                            list.Add(media);
                        }
                    }
                    if (list.Count > 0)
                        _context.VcSOSMedias.AddRange(list);
                }
                else
                {
                    var ImageCode = obj.ImageCode.Replace("[\"", "").Replace("\"]", "").Replace("\",\"", ",").Split(',');

                    foreach (var item in ImageCode)
                    {
                        var dt = _context.VcSOSMedias.FirstOrDefault(x => x.Code == item);
                        if (dt != null)
                        {
                            dt.SosCode = data.Code;
                            _context.VcSOSMedias.Update(dt);
                        }
                    }
                }
                _context.SaveChanges();
                msg.Error = false;
                //msg.Title = "Thêm thành công";
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ADD_SUCCESS"));
                await SendPushNotification(obj.Note);

            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Xảy ra lỗi khi thêm";
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ADD_SUCCESS"));
            }
            msg.Object = obj;
            return Json(msg);
        }

        [NonAction]
        public async Task<JsonResult> SendPushNotification(string message)
        {
            var msg = new JMessage() { Error = true };
            var obj2 = _context.VcFcms.ToList();
            if (obj2 != null)
            {
                foreach (var i in obj2)
                {
                    try
                    {
                        var applicationID = "AIzaSyDiDcnbqyk8GUYTd91ElHOENyafSKdhAm0";
                        var senderId = "495323113161";

                        using (var client = new HttpClient())
                        {
                            //do something with http client
                            client.BaseAddress = new Uri("https://fcm.googleapis.com");
                            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                            client.DefaultRequestHeaders.TryAddWithoutValidation("Authorization", $"key={applicationID}");
                            client.DefaultRequestHeaders.TryAddWithoutValidation("Sender", $"id={senderId}");

                            var data = new
                            {
                                to = i.Token,
                                notification = new
                                {
                                    body = message,
                                    Title = String.Format(CommonUtil.ResourceValue("COM_MSG_SOS")),
                                    icon = "myicon",
                                    sound = "beep.aiff"
                                },
                                priority = "high",
                            };

                            var json = JsonConvert.SerializeObject(data);
                            var httpContent = new StringContent(json, Encoding.UTF8, "application/json");

                            var result = await client.PostAsync("/fcm/send", httpContent);
                        }

                        VcFcmMessage data_msg = new VcFcmMessage();
                        data_msg.CreatedTime = DateTime.Now;
                        data_msg.Id = i.Id;
                        data_msg.Message = message;
                        //data_msg.Title = "Khẩn cấp";
                        data_msg.Title =String.Format(CommonUtil.ResourceValue("COM_MSG_SOS"));
                        _context.VcFcmMessages.Add(data_msg);
                        await _context.SaveChangesAsync();
                        _context.SaveChanges();


                        msg.Error = false;
                        //msg.Title = "Đã Notify thành công!";
                        data_msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_NOTIFY_SUCCES"));
                    }
                    catch (Exception ex)
                    {
                        msg.Error = true;
                        //msg.Title = "Send Fail!";
                        msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_SEND_FAIL"));
                    }
                }

            }
            else
            {
                msg.Error = true;
                //msg.Title = "Chưa có tài khoản nào đăng nhập!";
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_NOT_ACCOUNT"));
            }

            return Json(msg);
        }
        //[HttpPost]
        //public async Task<JsonResult> SendPushNotification(string Message)
        //{
        //    var msg = new JMessage() { Error = true };
        //    var obj2 = _context.VcFcms.ToList();
        //    if (obj2 != null)
        //    {
        //        foreach (var i in obj2)
        //        {
        //            try
        //            {

        //                var applicationID = "AIzaSyDiDcnbqyk8GUYTd91ElHOENyafSKdhAm0";
        //                var senderId = "495323113161";

        //                using (var client = new HttpClient())
        //                {
        //                    //do something with http client
        //                    client.BaseAddress = new Uri("https://fcm.googleapis.com");
        //                    client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        //                    client.DefaultRequestHeaders.TryAddWithoutValidation("Authorization", $"key={applicationID}");
        //                    client.DefaultRequestHeaders.TryAddWithoutValidation("Sender", $"id={senderId}");

        //                    var data = new
        //                    {
        //                        to = i.Token,
        //                        notification = new
        //                        {
        //                            body = Message,
        //                            icon = "myicon",
        //                            sound = "beep.aiff"
        //                        },
        //                        priority = "high",
        //                    };

        //                    var json = JsonConvert.SerializeObject(data);
        //                    var httpContent = new StringContent(json, Encoding.UTF8, "application/json");

        //                    var result = await client.PostAsync("/fcm/send", httpContent);
        //                }
        //                msg.Error = false;
        //                msg.Title = "Đã Notify thành công!";
        //            }
        //            catch (Exception ex)
        //            {
        //                msg.Error = true;
        //                msg.Title = "Send Fail!";
        //            }


        //        }

        //    }
        //    else
        //    {
        //        msg.Error = true;
        //        msg.Title = "Chưa có thiệt bị nào được đăng nhập ";
        //    }

        //    return Json(msg);
        //}
        [HttpPost]
        public JsonResult GetNextCode(string userName)
        {
            var msg = new JMessage() { Error = false, ID = 1 };
            var date = DateTime.Now;
            var count = _context.VcSOSInfos.Where(x => x.CreatedBy.ToLower() == userName.ToLower()).Count();
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
                    var media = new VcSOSMedia();
                    media.Path = "/uploads/Images/" + mes.Object.ToString();
                    media.Size = pictureFile.Length;
                    media.Extension = extend;
                    media.Name = fileName;
                    media.Code = Guid.NewGuid().ToString();
                    _context.VcSOSMedias.Add(media);
                    msg.Object = media;
                }
                _context.SaveChanges();
                msg.Error = false;
                //msg.Title = "Thêm thành công";
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ADD_SUCCESS"));

            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Xảy ra lỗi khi thêm";
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_ADD"));
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult GetMySos(MySosSearch obj)
        {
            JMessage msg = new JMessage();
            try
            {
                var query = from a in _context.VcSOSInfos
                            join b in _context.VcSOSMedias on a.Code equals b.SosCode into b2
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
                                imgPath.Add("http://s-work.vn" + item1.Path);
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
                //msg.Title = "Xảy ra lỗi khi lấy dữ liệu";
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DATA_FAIL"));
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult DeleteItem(string sosCode)
        {
            JMessage msg = new JMessage();
            try
            {
                var data = _context.VcSOSInfos.FirstOrDefault(x => x.Code == sosCode);
                if (data != null)
                {
                    _context.VcSOSInfos.Remove(data);
                    var media = _context.VcSOSMedias.Where(x => x.SosCode == data.Code).ToList();
                    if (media.Count > 0)
                    {
                        _context.VcSOSMedias.RemoveRange(media);
                    }
                    _context.SaveChanges();
                    msg.Error = false;
                    //msg.Title = "Xóa thành công";
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_DELETE_SUCCESS"));
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Không tìm thấy bản ghi này";
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_NOT_FOUND_RECORD"));
                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Xảy ra lỗi khi lấy dữ liệu";
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DATA_FAIL"));
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult DeleteItemById(int Id)
        {
            JMessage msg = new JMessage();
            try
            {
                var data = _context.VcSOSInfos.FirstOrDefault(x => x.Id == Id);
                if (data != null)
                {
                    _context.VcSOSInfos.Remove(data);
                    var media = _context.VcSOSMedias.Where(x => x.SosCode == data.Code).ToList();
                    if (media.Count > 0)
                    {
                        _context.VcSOSMedias.RemoveRange(media);
                    }
                    _context.SaveChanges();
                    msg.Error = false;
                    //msg.Title = "Xóa thành công";
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_DELETE_SUCCESS"));
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Không tìm thấy bản ghi này";
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_NOT_FOUND_RECORD"));
                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Xảy ra lỗi khi lấy dữ liệu";
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DATA_FAIL"));
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetSosInfo(int id)
        {
            JMessage msg = new JMessage();
            try
            {
                var sosInfoHeader = _context.VcSOSInfos.FirstOrDefault(x => x.Id == id);
                if (sosInfoHeader != null)
                {
                    var listImg = _context.VcSOSMedias.Where(x => x.SosCode == sosInfoHeader.Code).ToList();
                    msg.Error = false;
                    var obj = new
                    {
                        header = sosInfoHeader,
                        imgList = listImg
                    };
                    msg.Object = obj;
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Khonog tìm thấy thông tin, vui lòng làm mới trang";
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_REFRESH"));
                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Xảy ra lỗi khi lấy dữ liệu";
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_ADD"));
            }
            return Json(msg);
        }

        //[HttpPost]
        //public JsonResult DeleteItems(List<string> sosCodes)
        //{
        //    JMessage msg = new JMessage();
        //    try
        //    {
        //        var data = _context.VcSOSInfos.FirstOrDefault(x => x.Code == sosCode);
        //        if (data != null)
        //        {
        //            _context.VcSOSInfos.Remove(data);
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
                var list = new List<VcSOSMedia>();
                foreach (var item in pictureFile)
                {
                    if (item.Length > 0)
                    {
                        var mes = _uploadService.UploadImage(item);
                        var fileName = Path.GetFileName(item.FileName);
                        var extend = Path.GetExtension(fileName);
                        fileName = Path.GetFileNameWithoutExtension(fileName);
                        var media = new VcSOSMedia();
                        media.Path = "/uploads/Files/" + mes.Object.ToString();
                        media.Size = item.Length;
                        media.Extension = extend;
                        media.Name = fileName;
                        media.Code = Guid.NewGuid().ToString();
                        _context.VcSOSMedias.Add(media);
                        msg.Object = media;
                        list.Add(media);
                    }
                }
                _context.SaveChanges();
                msg.Error = false;
                //msg.Title = "Thêm thành công";
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ADD_SUCCESS"));
                msg.Object = list;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Xảy ra lỗi khi thêm";
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_ADD"));
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
    public class MySosSearch
    {
        public string UserName { get; set; }
        public int Page { get; set; }
        public int Length { get; set; }
    }
    public class SosSearch : JTableModel
    {
        public string FromDate { get; set; }
        public string ToDate { get; set; }
    }
    public class VcSOSInfoInsert
    {
        public int? Id { get; set; }
        public string Code { get; set; }
        public string Title { get; set; }
        public string Data { get; set; }
        public string Address { get; set; }
        public int Priority { get; set; }
        public string Note { get; set; }
        public string CreatedBy { get; set; }

        public string ImageCode { get; set; }
    }

    public class MySosRes
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public string Title { get; set; }
        public string Data { get; set; }
        public string Address { get; set; }
        public int Priority { get; set; }
        public string Note { get; set; }
        public string CreatedBy { get; set; }
        public string Name { get; set; }
        public string ImageCode { get; set; }
        public List<string> ImageCodes { get; set; }
    }
}