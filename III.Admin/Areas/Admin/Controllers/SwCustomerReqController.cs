using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using III.Admin.Controllers;
using III.Domain.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;
using Syncfusion.XlsIO;
using System.ComponentModel.DataAnnotations;
using System.Globalization;
using System.IO;
using System;
using Microsoft.AspNetCore.Hosting;
using System.Linq;
using Syncfusion.EJ2.DocumentEditor;

namespace III.Admin.Areas.Admin.Controllers
{
    [Area("Admin")]
    public class SwCustomerReqController : BaseController
    {
        private readonly IUploadService _upload;
        private readonly EIMDBContext _context;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<CMSDocumentController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public static AseanDocument docmodel = new AseanDocument();
        public static string fileCode = string.Empty;
        public static string pathFile = string.Empty;
        public static string cardCode = string.Empty;
        public static string pathFileFTP = string.Empty;

        public SwCustomerReqController(EIMDBContext context, IStringLocalizer<CMSDocumentController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources, IUploadService upload, IHostingEnvironment hostingEnvironment)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
            _upload = upload;
            _hostingEnvironment = hostingEnvironment;
        }
        public IActionResult Index()
        {
            return View();
        }

        #region action
        [HttpPost]
        [AllowAnonymous]
        public object GetItem([FromBody] int id)
        {
            var msg = new JMessage() { Error = false };
            var item = _context.SwCustomerReqs.FirstOrDefault(x => x.Id == id);

            if (item != null)
            {
                msg.Object = item;
            }
            else
            {
                msg.Title = "Không tìm thấy";
                msg.Error = true;
            }
            //var data = _context.cms_items.FirstOrDefault(x => x.id == id);
            return msg;
        }

        public class SwCustomerReqModelView
        {
            [StringLength(255)]
            public string CompanyName { get; set; }

            [StringLength(10)]
            public string Tel { get; set; }

            [StringLength(255)]
            public string Email { get; set; }

            [StringLength(255)]
            public string Slogan { get; set; }

            [StringLength(255)]
            public string Noted { get; set; }

            [StringLength(255)]
            public string MonthTried { get; set; }

            [StringLength(500)]
            public string requestTitle { get; set; }

            [StringLength(255)]
            public string ReqCode { get; set; }

            [StringLength(255)]
            public string Domain { get; set; }

            public string CheckNode { get; set; }
        }

        [HttpPost]
        [AllowAnonymous]
        public JsonResult Insert(SwCustomerReqModelView formData, IFormFile Logo, IFormFile Background, IFormFile fileUpload)
        {
            var msg = new JMessage() { Error = false };
            var obj = formData;
            try
            {
                var data = new SwCustomerReq();
                data.ReqCode = "Req_" + DateTime.Now.Date.ToString("dd-MM-yyyy") + "_"
                    + _context.SwCustomerReqs.Where(x => x.CreatedTime.Value.Date.CompareTo(DateTime.Now.Date) == 0).Count();
                if (fileUpload != null)
                {
                    msg = UploadFile(fileUpload, data.ReqCode);
                    if (msg.Error == true)
                    {
                        return Json(msg);
                    }
                }
                if (Logo != null)
                {
                    var upload = _upload.UploadImage(Logo);
                    if (upload.Error)
                    {
                        msg.Error = true;
                        msg.Title = upload.Title;
                        return Json(msg);
                    }
                    else
                    {
                        data.Logo = "/uploads/Images/" + upload.Object.ToString();
                    }
                }

                if (Background != null)
                {
                    var upload = _upload.UploadImage(Background);
                    if (upload.Error)
                    {
                        msg.Error = true;
                        msg.Title = upload.Title;
                        return Json(msg);
                    }
                    else
                    {
                        data.Background = "/uploads/Images/" + upload.Object.ToString();
                    }
                }
                data.CompanyName = obj.CompanyName;
                data.Email = obj.Email;
                data.requestTitle = obj.requestTitle;
                data.MonthTried = obj.MonthTried;
                data.Noted = obj.Noted;
                data.Slogan = obj.Slogan;
                data.Tel = obj.Tel;
                data.Domain = obj.Domain;
                data.CreatedBy = ESEIM.AppContext.UserName;
                data.CreatedTime = DateTime.Now;

                if (!string.IsNullOrEmpty(obj.CheckNode))
                {
                    var list = JsonConvert.DeserializeObject<string[]>(obj.CheckNode);
                    for (int i = 0; i < list.Length; i++)
                    {
                        if (_context.SwModuleResources.FirstOrDefault(x => x.ModuleCode == list[i]) == null)
                        {
                            msg.Error = true;
                            msg.Title = "Không tìm thấy module";
                            return Json(msg);
                        }
                        var item = new CustomerModuleRequest();
                        item.ReqCode = data.ReqCode;
                        item.ModuleCode = list[i];
                        item.Status = "Chưa khích hoạt";
                        _context.CustomerModuleRequests.Add(item);
                    }
                }
                _context.SwCustomerReqs.Add(data);
                _context.SaveChanges();
                msg.Title = msg.Title = "Thêm yêu cầu thành công";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = msg.Title = "Thêm yêu cầu thất bại";
            }
            return Json(msg);
        }

        public JMessage UploadFile(IFormFile fileUpload, String Name)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                if (fileUpload != null && fileUpload.Length > 0)
                {
                    // Tạo một thể hiện của ExcelEngine
                    ExcelEngine excelEngine = new ExcelEngine();

                    // Truy cập ứng dụng Excel
                    IApplication application = excelEngine.Excel;

                    // Tạo một workbook mới
                    IWorkbook workbook = application.Workbooks.Create();

                    // Mở một workbook hiện tại từ tệp đã tải lên
                    workbook = application.Workbooks.Open(fileUpload.OpenReadStream());

                    // Đường dẫn lưu trữ trong thư mục "/uploads/repository/"
                    string repositoryPath = _hostingEnvironment.WebRootPath + "/uploads/repository/";

                    // Kiểm tra và tạo thư mục nếu nó chưa tồn tại
                    if (!Directory.Exists(repositoryPath))
                    {
                        Directory.CreateDirectory(repositoryPath);
                    }
                    string fileName = $"{Name}.xlsx";
                    // Đường dẫn đầy đủ để lưu file Excel
                    string filePath = Path.Combine(repositoryPath, fileName);

                    // Tạo FileStream để lưu workbook
                    using (FileStream outputStream = new FileStream(filePath, FileMode.Create))
                    {
                        workbook.SaveAs(outputStream);
                    }

                    // Đóng workbook
                    workbook.Close();

                    msg.Title = _stringLocalizer["CRPT_MSG_READ_FILE_EXCEL_SUCCESS"];

                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["CRPT_MSG_FILE_EXCEL_NO_DATA"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return msg;
        }
        [HttpPost]
        public object Update(SwCustomerReqModelView data, IFormFile Logo, IFormFile Background)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var item = _context.SwCustomerReqs.Where(x => x.IsDeleted == false).FirstOrDefault(x => x.ReqCode == data.ReqCode);
                if (item != null)
                {
                    if (Logo != null)
                    {
                        var upload = _upload.UploadImage(Logo);
                        if (upload.Error)
                        {
                            msg.Error = true;
                            msg.Title = upload.Title;
                            return Json(msg);
                        }
                        else
                        {
                            item.Logo = "/uploads/Images/" + upload.Object.ToString();
                        }
                    }

                    if (Background != null)
                    {
                        var upload = _upload.UploadImage(Background);
                        if (upload.Error)
                        {
                            msg.Error = true;
                            msg.Title = upload.Title;
                            return Json(msg);
                        }
                        else
                        {
                            item.Background = "/uploads/Images/" + upload.Object.ToString();
                        }
                    }

                    item.CompanyName = data.CompanyName;
                    item.Email = data.Email;
                    item.Tel = data.Tel;
                    item.Slogan = data.Slogan;
                    item.Noted = data.Noted;
                    item.MonthTried = data.MonthTried; ;
                    item.requestTitle = data.requestTitle;
                    item.UpdatedTime = DateTime.Now;
                    item.UpdatedBy = ESEIM.AppContext.UserName;

                    _context.SwCustomerReqs.Update(item);

                    _context.SaveChanges();

                    msg.Title = msg.Title = "Cập nhật yêu cầu thành công";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = msg.Title = "Cập nhật yêu cầu thất bại";
            }
            return Json(msg);
        }


        [HttpPost]
        public object Delete(int id)
        {
            //var a = _context.cms_items.Where(x => x.id.ToString().Equals(id)).FirstOrDefault();
            //var a = _context.cms_items.Where(x => x.id == id).FirstOrDefault();
            var msg = new JMessage { Error = true };
            try
            {
                var data = _context.SwCustomerReqs.FirstOrDefault(x => x.Id == id);
                data.IsDeleted = true;
                data.DeletedBy = ESEIM.AppContext.UserName;
                data.DeletedTime = DateTime.Now;
                //data.trash = true;
                //_context.cms_items.Update(data);
                _context.SwCustomerReqs.Update(data);
                _context.SaveChanges();
                msg.Error = false;
                //msg.Title = String.Format(CommonUtil.ResourceValue("FCC_MSG_DELETE_DONE"));//"Xóa thành công";
                msg.Title = msg.Title = "Xóa yêu cầu thành công";
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = msg.Title = "Xóa yêu cầu thất bại";
                return Json(msg);
            }
        }

        public class SwCustomerRequest
        {
            public int Id { get; set; }
            [StringLength(255)]
            public string CompanyName { get; set; }

            [StringLength(10)]
            public string Tel { get; set; }

            [StringLength(255)]
            public string Email { get; set; }

            [StringLength(255)]
            public string Logo { get; set; }

            [StringLength(255)]
            public string Slogan { get; set; }

            [StringLength(255)]
            public string Domain { get; set; }

            [StringLength(255)]
            public string Noted { get; set; }

            [StringLength(255)]
            public string MonthTried { get; set; }

            [StringLength(255)]
            public string Background { get; set; }

            [StringLength(255)]
            public string ReqCode { get; set; }

            [StringLength(500)]
            public string reqTitle { get; set; }

            public DateTime? CreatedTime { get; set; }

            [StringLength(255)]
            public string CreatedBy { get; set; }

            public DateTime? UpdatedTime { get; set; }

            [StringLength(255)]
            public string UpdatedBy { get; set; }

            [StringLength(255)]
            public string DeletedBy { get; set; }

            public DateTime? DeletedTime { get; set; }

            public bool IsDeleted { get; set; }
        }
        #endregion

        #region CRUD CUSMODULE_REQ
        [HttpPost]
        public object InssertCusModule(string ReqCode, string ModuleCode)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var Module = _context.SwModuleResources.FirstOrDefault(x => x.ModuleCode == ModuleCode);
                if (Module == null)
                {
                    msg.Error = true;
                    msg.Title = "Không tìm thấy module";
                    return Json(msg);
                }
                var CusReq = _context.SwCustomerReqs.Where(x => x.IsDeleted == false).FirstOrDefault(x => x.ReqCode == ReqCode);
                if (CusReq == null)
                {
                    msg.Error = true;
                    msg.Title = "Không tìm thấy module";
                    return Json(msg);
                }

                var item = new CustomerModuleRequest();
                item.ReqCode = CusReq.ReqCode;
                item.ModuleCode = Module.ModuleCode;
                item.Status = "Chưa khích hoạt";
                _context.CustomerModuleRequests.Add(item);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = msg.Title = "Thêm danh mục module thất bại";
            }
            return msg;
        }

        [HttpPost]
        public object UpdateCusModule(int id, string Status)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var item = _context.CustomerModuleRequests.Find(id);
                if (item == null)
                {
                    msg.Error = true;
                    msg.Title = "Không tìm thấy module trong danh sach đăng ký";
                    return Json(msg);
                }
                item.Status = Status;
                _context.CustomerModuleRequests.Update(item);
                _context.SaveChanges();
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = msg.Title = "Cập nhật danh mục module thất bại";
            }
            return msg;
        }

        [HttpPost]
        public object DeleteCusModule(int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var item = _context.CustomerModuleRequests.Find(id);
                if (item == null)
                {
                    msg.Error = true;
                    msg.Title = "Không tìm thấy module trong danh sach đăng ký";
                    return Json(msg);
                }
                _context.CustomerModuleRequests.Remove(item);
                _context.SaveChanges();

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = msg.Title = "Xóa danh mục module thất bại";
            }
            return msg;
        }

        #endregion

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion

        #region File
        public class JTableModelFile : JTableModel
        {
            public string CompanyName { get; set; }
            public string ReqCode { get; set; }
            public string Title { get; set; }
            public string ModuleCode { get; set; }
            public string Status { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
        }

        [HttpPost]
        public object GetListModule()
        {
            var msg = new JMessage() { Error = false };
            var item = _context.SwModuleResources.Select(x => new
            {
                Code = x.ModuleCode,
                Name = x.ModuleTitle
            }).ToList();

            if (item != null)
            {
                msg.Object = item;
            }
            else
            {
                msg.Title = "Không tìm thấy";
                msg.Error = true;
            }
            //var data = _context.cms_items.FirstOrDefault(x => x.id == id);
            return msg;
        }
        [HttpPost]
        public object JTable([FromBody] JTableModelFile jTablePara)
        {
            try
            {
                int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
                var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var query = from b in _context.SwCustomerReqs.Where(x => x.IsDeleted == false)
                            join a in _context.CustomerModuleRequests on b.ReqCode equals a.ReqCode into moduleRequests
                            from a in moduleRequests.DefaultIfEmpty()  // Left join with CustomerModuleRequests

                            join f in _context.SwModuleResources on (a != null ? a.ModuleCode : null) equals f.ModuleCode into moduleResources
                            from f in moduleResources.DefaultIfEmpty()  // Left join with SwModuleResources

                            where (fromDate == null || (fromDate <= b.CreatedTime))
                                   && (toDate == null || (toDate >= (f != null ? f.CreatedTime : b.CreatedTime)))
                                   && (string.IsNullOrEmpty(jTablePara.CompanyName) || b.CompanyName.ToLower().Contains(jTablePara.CompanyName.ToLower()))
                                   && ((string.IsNullOrEmpty(jTablePara.Title) || b.CompanyName.ToLower().Contains(jTablePara.Title.ToLower()))
                                   || (string.IsNullOrEmpty(jTablePara.Title) || b.requestTitle.ToLower().Contains(jTablePara.Title.ToLower()))
                                   || (string.IsNullOrEmpty(jTablePara.Title) || (f != null && f.ModuleTitle.ToLower().Contains(jTablePara.Title.ToLower()))))
                                   && (string.IsNullOrEmpty(jTablePara.Status) || (a != null && a.Status == jTablePara.Status))
                                   && (string.IsNullOrEmpty(jTablePara.ModuleCode) || (f != null && f.ModuleCode.Equals(jTablePara.ModuleCode)))
                            select new
                            {
                                b.Id,
                                b.CompanyName,
                                b.Background,
                                b.Logo,
                                b.Noted,
                                b.Domain,
                                b.requestTitle,
                                b.MonthTried,
                                b.ReqCode,
                                b.Email,
                                b.Tel,
                                b.Slogan,
                                ModuleCount = (a != null) ? _context.CustomerModuleRequests.Count(x => x.ReqCode == b.ReqCode) : 0
                            };

                int total = _context.SwModuleResources.Count();
                var query_row_number = query.AsEnumerable().DistinctBy(x => x.ReqCode).Select((x, index) => new
                {
                    stt = index + 1,
                    x.Id,
                    x.CompanyName,
                    x.Background,
                    x.Logo,
                    x.Noted,
                    x.Domain,
                    x.requestTitle,
                    x.MonthTried,
                    x.ReqCode,
                    x.Email,
                    x.Tel,
                    x.Slogan,
                    ModuleCount = x.ModuleCount + ',' + total,
                }).ToList();
                int count = query_row_number.Count();
                var data = query_row_number.AsQueryable().OrderBy(x => x.stt).Skip(intBegin).Take(jTablePara.Length);
                var jdata = JTableHelper.JObjectTable(data.ToList(), jTablePara.Draw, count, "stt", "Id", "CompanyName", "Background", "Logo", "Noted", "Domain", "requestTitle",
                                                                                    "MonthTried", "ReqCode", "Email", "Tel", "Slogan", "ModuleCount");
                return Json(jdata);
            }
            catch (Exception err)
            {
                var jdata = JTableHelper.JObjectTable(null, jTablePara.Draw, 0, "stt", "Id", "CompanyName", "Background", "Logo", "Noted", "Domain", "requestTitle",
                                                                                    "MonthTried", "ReqCode", "Email", "Tel", "ModuleCount");
                return Json(jdata);
            }
        }
        [HttpPost]
        public object GetListModuleByReqCode(string reqcode)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var listModule = _context.CustomerModuleRequests.Where(x => x.ReqCode == reqcode);

                if (listModule != null)
                {
                    msg.Object = listModule;
                }
                else
                {
                    msg.Title = "Không tìm thấy";
                    msg.Error = true;
                }
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = msg.Title = "Loi";
                return Json(msg);
            }

        }
        #endregion

        public string Import(IFormCollection data)
        {
            if (data.Files.Count == 0)
                return null;
            Stream stream = new MemoryStream();
            IFormFile file = data.Files[0];
            int index = file.FileName.LastIndexOf('.');
            string type = index > -1 && index < file.FileName.Length - 1 ?
                file.FileName.Substring(index) : ".docx";
            file.CopyTo(stream);
            stream.Position = 0;

            WordDocument document = WordDocument.Load(stream, GetFormatType(type.ToLower()));
            //document.Save(streamSave);

            string sfdt = JsonConvert.SerializeObject(document);

            var outputStream = WordDocument.Save(sfdt, FormatType.Html);
            outputStream.Position = 0;
            StreamReader reader = new StreamReader(outputStream);
            string value = reader.ReadToEnd().ToString();
            return value;
        }

        internal static FormatType GetFormatType(string format)
        {
            if (string.IsNullOrEmpty(format))
                throw new System.NotSupportedException("EJ2 DocumentEditor does not support this file format.");
            switch (format.ToLower())
            {
                case ".dotx":
                case ".docx":
                case ".docm":
                case ".dotm":
                    return FormatType.Docx;
                case ".dot":
                case ".doc":
                    return FormatType.Doc;
                case ".rtf":
                    return FormatType.Rtf;
                case ".txt":
                    return FormatType.Txt;
                case ".xml":
                    return FormatType.WordML;
                default:
                    throw new System.NotSupportedException("EJ2 DocumentEditor does not support this file format.");
            }
        }
    }
}
