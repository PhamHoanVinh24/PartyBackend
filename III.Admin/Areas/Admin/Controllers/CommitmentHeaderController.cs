using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;
using System.IO;
using ESEIM;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Options;
/*using File = ESEIM.Models.File;*/
// Declare namespace that class will build into
namespace III.Admin.Controllers
{
    // Declare class
    [Area("Admin")]
    public class CommitmentHeaderController : BaseController // Inherit from class BaseController (Permission, ...)
    {
        // Fields of class
        private readonly EIMDBContext _context;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<CommitmentHeaderController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly AppSettings _appSettings;

        // Constructor of class
        public CommitmentHeaderController(EIMDBContext context,
            IStringLocalizer<CommitmentHeaderController> stringLocalizer, IHostingEnvironment hostingEnvironment,
            IStringLocalizer<SharedResources> sharedResources, IOptions<AppSettings> appSettings)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
            _hostingEnvironment = hostingEnvironment;
            _appSettings = appSettings.Value;
        }
        // Get view for index action
        [Breadcrumb("ViewData.CrumbCommitmentHeader", AreaName = "Admin", FromAction = "Index", FromController = typeof(EmployeeHomeController))]
        public IActionResult Index() // Line điều hướng
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbEmployeeHome"] = _sharedResources["COM_CRUMB_EMPLOYEE_HOME"];
            ViewData["CrumbCommitmentHeader"] = _sharedResources["COM_CRUMB_COMMITMENT_HEADER"];
            return View();
        }

        #region CommitmentHeaderCRUD
        // Table API include search
        [HttpPost]
        public object JTable([FromBody] JTableModelCommitment jTablePara)
        {
            try
            {
                var session = HttpContext.GetSessionUser();
                int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
                var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                // Way 1 using Where
                var query = from a in _context.CommitmentHeaders.Where(x => x.Flag == true)
                           join b in _context.Users on a.UserID equals b.Id
                           join c in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals("STATUS_CMH"))
                           on a.Status equals c.CodeSet into c1
                           from c in c1.DefaultIfEmpty()
                           join d in _context.Users on a.Surrogate equals d.Id
                           where a.Flag == true
                                 && (string.IsNullOrEmpty(jTablePara.Title) || a.Title.ToLower().Contains(jTablePara.Title.ToLower()))
                                 && (string.IsNullOrEmpty(jTablePara.CommitmentCode) || a.CommitmentCode.ToLower().Contains(jTablePara.CommitmentCode.ToLower()))
                                 && (string.IsNullOrEmpty(jTablePara.UserId) || a.UserID.ToLower().Equals(jTablePara.UserId.ToLower()))
                                 && (string.IsNullOrEmpty(jTablePara.Surrogate) || a.Surrogate.ToLower().Contains(jTablePara.Surrogate.ToLower()))
                                 && (string.IsNullOrEmpty(jTablePara.Status) || a.Status.ToLower().Equals(jTablePara.Status.ToLower()))
                                 && (fromDate == null || a.EndTime <= toDate)
                                 && (toDate == null || a.StartTime >= fromDate)
                                 && (a.UserID == session.UserId || a.Surrogate == session.UserId || session.IsAllData)
                           select new
                           {
                               a.Id,
                               a.CommitmentCode,
                               a.Title,
                               StatusCode = a.Status,
                               StatusName = c != null ? c.ValueSet : "",
                               a.UserID,
                               b.UserName,
                               b.GivenName,
                               a.Flag,
                               a.Noted,
                               SurrogateName = d.GivenName,
                               a.StartTime,
                               a.EndTime,
                           };
                var count = query.Count();
                var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length).ToList();
                var jdata = JTableHelper.JObjectTable(data.ToList(), jTablePara.Draw, count, "Id", "CommitmentCode", "Title", "UserID", "UserName", "GivenName", "Flag", "Noted", "SurrogateName", "StatusCode", "StatusName", "StartTime", "EndTime");
                return Json(jdata);
            }
            catch (Exception ex)
            {
                var jdata = JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "Id", "CommitmentCode", "Title", "UserID", "UserName", "GivenName", "Flag", "Noted", "SurrogateName", "StatusCode", "StatusName", "StartTime", "EndTime");
                return Json(jdata);
            }
        }
        // Create
        [HttpPost]
        public JsonResult Insert([FromBody] CommitmentHeaderObject data)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var startTime = string.IsNullOrEmpty(data.StartTime)
                    ? (DateTime?)null
                    : DateTime.ParseExact(data.StartTime, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                var endTime = string.IsNullOrEmpty(data.EndTime)
                    ? (DateTime?)null
                    : DateTime.ParseExact(data.EndTime, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                var checkExist = _context.CommitmentHeaders.FirstOrDefault(x => x.CommitmentCode == data.CommitmentCode); // assign variable and condition of this
                if (checkExist == null) // check exist of CommimentCode
                {
                    var obj = new CommitmentHeader
                    {
                        CommitmentCode = data.CommitmentCode,
                        Noted = data.Noted,
                        UserID = data.UserID,
                        Surrogate = data.Surrogate,
                        Status = data.Status,
                        Signature = data.Signature,
                        FileReference = data.FileReference,
                        Title = data.Title,
                        StartTime = startTime,
                        EndTime = endTime
                    };
                    obj.CreateTime = DateTime.Now; // Save Creatime to database with real time
                    obj.CreateBy = ESEIM.AppContext.UserName; // Save person add in to database
                    obj.Flag = true; // Set flag of cell = true 

                    _context.CommitmentHeaders.Add(obj); // add to obj
                    _context.SaveChanges(); // save
                    msg.Object = obj.Id;
                    msg.Title = _stringLocalizer["CMH_ADD_SUCCESS"]; // print notice on screen " Thêm thành công" if proviso true
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["CMH_EXIST"];// if exist print notice on the screen
                }
            }
            catch
            {
                msg.Error = true;
                msg.Title = _stringLocalizer["CMH_ERROR"]; // have error
            }
            return Json(msg);
        }

        // Update
        [HttpPost]
        public object Update([FromBody] CommitmentHeaderObject obj)
        {
            var msg = new JMessage();
            try
            {
                var startTime = string.IsNullOrEmpty(obj.StartTime)
                    ? (DateTime?)null
                    : DateTime.ParseExact(obj.StartTime, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                var endTime = string.IsNullOrEmpty(obj.EndTime)
                    ? (DateTime?)null
                    : DateTime.ParseExact(obj.EndTime, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                var item = _context.CommitmentHeaders.FirstOrDefault(x => x.Id.Equals(obj.Id));
                if (item != null)
                {
                    item.UpdateBy = User.Identity.Name;
                    item.UpdateTime = DateTime.Now.Date;
                    item.CommitmentCode = obj.CommitmentCode;
                    item.Title = obj.Title;
                    item.Status = obj.Status;
                    item.Noted = obj.Noted;
                    item.StartTime = startTime;
                    item.EndTime = endTime;
                    item.Surrogate = obj.Surrogate;
                    item.Signature = obj.Signature;
                    item.UserID = obj.UserID;
                    item.FileReference = obj.FileReference;

                    _context.CommitmentHeaders.Update(item);
                    _context.SaveChanges();

                    msg.Error = false;
                    msg.Title = _stringLocalizer["CMH_CHANGE_SUCCESS"]; //"Đã lưu thay đổi";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["CMH_ERROR"]; //"Có lỗi xảy ra!";
                }

                return msg;
            }
            catch
            {
                msg.Error = true;
                msg.Title = _stringLocalizer["CMH_ERROR"]; //"Có lỗi xảy ra!";
                return msg;
            }
        }

        // Remove
        [HttpPost]
        public object Delete(int Id)
        {
            var msg = new JMessage { Error = true };
            try
            {
                var data = _context.CommitmentHeaders.FirstOrDefault(x => x.Id == Id);

                _context.CommitmentHeaders.Remove(data);
                _context.SaveChanges();
                msg.Error = false;
                msg.Title = _stringLocalizer["CMH_REMOVE"];
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _stringLocalizer["CMH_NOT_FOUND"];//Không tìm thấy dịch vụ. Vui lòng làm mới lại trang
                return Json(msg);
            }
        }

        // Read
        public JsonResult GetItem(int Id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var obj = _context.CommitmentHeaders.FirstOrDefault(x => x.Id.Equals(Id));
                if (obj != null)
                {
                    msg.Object = new CommitmentHeader
                    {
                        Id = obj.Id,
                        CommitmentCode = obj.CommitmentCode,
                        UserID = obj.UserID,
                        Status = obj.Status,
                        Title = obj.Title,
                        Noted = obj.Noted,
                        Surrogate = obj.Surrogate,
                        Signature = obj.Signature,
                        StartTime = obj.StartTime,
                        EndTime = obj.EndTime,
                        FileReference = obj.FileReference,

                    };
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Không tìm thấy thông tin ";
                    msg.Title = _stringLocalizer["CMH_NOT_FOUND"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = _stringLocalizer["CMH_ERROR"];
            }
            return Json(msg);
        }
        #endregion

        #region CommitmentDetailCRUD
        // Table API include search
        [HttpPost]
        public object GetCompanyRule()
        {
            return _context.CompanyRuleItems.Where(x => x.Flag == true).Select(x => new
            {
                Code = x.ItemCode,
                Name = x.Item,
                Note = x.Note
            });
        }
        [HttpPost]
        public object GetCommitmentDetail(string commitmentCode) // getConmitmentDetail truyền biến Code 
        {
            return _context.CommitmentDetails.Where(x => x.Flag == true && x.CommitmentCode == commitmentCode).Select(x => new
            {
                Code = x.ItemCode,
            });
        }
        // Create
        [HttpPost]
        public JsonResult InsertDetail([FromBody] CommitmentDetail obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var checkExist = _context.CommitmentDetails.FirstOrDefault(x => x.CommitmentCode == obj.CommitmentCode && x.ItemCode == obj.ItemCode); // 
                if (checkExist == null)
                {
                    obj.Flag = true;

                    _context.CommitmentDetails.Add(obj);
                    _context.SaveChanges();
                    msg.Object = obj.Id;
                    msg.Title = _stringLocalizer["CMH_ADD_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["CMH_EXIST"];
                }
            }
            catch
            {
                msg.Error = true;
                msg.Title = _stringLocalizer["CMH_ERROR"];
            }
            return Json(msg);
        }

        // Remove
        [HttpPost]
        public object DeleteDetail([FromBody] CommitmentDetail obj)
        {
            var msg = new JMessage { Error = true };

            try
            {
                var data = _context.CommitmentDetails.FirstOrDefault(x => x.CommitmentCode == obj.CommitmentCode);
                _context.CommitmentDetails.Remove(data);
                _context.SaveChanges();
                msg.Error = false;
                msg.Title = String.Format(_stringLocalizer["CMH_REMOVE"]);
                return Json(msg);


            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _stringLocalizer["CMH_NOT_FOUND"];
                return Json(msg);
            }
        }
        #endregion

        #region File
        [HttpPost]
        public JsonResult UploadFileSignature(IFormFile file)
        {

            var msg = new JMessage();
            try
            {
                if (file != null)
                {
                    if (file != null && file.Length > 0)
                    {
                        var pathUpload = Path.Combine(_hostingEnvironment.WebRootPath, "uploads\\files\\signature");
                        if (!Directory.Exists(pathUpload)) Directory.CreateDirectory(pathUpload);
                        var fileName = Path.GetFileName(file.FileName);
                        fileName = Path.GetFileNameWithoutExtension(fileName)
                        + "_"
                        + Guid.NewGuid().ToString().Substring(0, 8)
                        + Path.GetExtension(fileName);
                        var filePath = Path.Combine(pathUpload, fileName);
                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            file.CopyTo(stream);
                        }
                        var url = "/uploads/files/signature/" + fileName;
                        var fileUpload = new FileInfoCommitment
                        {
                            FileName = fileName,
                            FilePath = _appSettings.UrlMain + url,
                            ShortPath = url
                        };
                        msg.Object = fileUpload;
                        /*msg.Object = url;*/
                    }
                    msg.Error = false;
                    msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["CMH_FILE"]);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_MSG_EXITS"], _stringLocalizer["CMH_FILE"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }            //Uploadfile
        [HttpPost]
        public JsonResult UploadFileCommitment(IFormFile file)
        {

            var msg = new JMessage();
            try
            {
                if (file != null)
                {
                    if (file != null && file.Length > 0)
                    {
                        var pathUpload = Path.Combine(_hostingEnvironment.WebRootPath, "uploads\\files\\signature");
                        if (!Directory.Exists(pathUpload)) Directory.CreateDirectory(pathUpload);
                        var fileName = Path.GetFileName(file.FileName);
                        fileName = Path.GetFileNameWithoutExtension(fileName)
                        + "_"
                        + Guid.NewGuid().ToString().Substring(0, 8)
                        + Path.GetExtension(fileName);
                        var filePath = Path.Combine(pathUpload, fileName);
                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            file.CopyTo(stream);
                        }
                        var url = "/uploads/files/signature/" + fileName;
                        var fileUpload = new FileInfoCommitment
                        {
                            FileName = fileName,
                            FilePath = _appSettings.UrlMain + url,
                            ShortPath = url
                        };
                        msg.Object = fileUpload;
                        /*msg.Object = url;*/
                    }
                    msg.Error = false;
                    msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["CMH_FILE"]);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_MSG_EXITS"], _stringLocalizer["CMH_FILE"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }            //Uploadfile

        [HttpPost]
        public JMessage DeleteFile(string filePath)
        {
            var msg = new JMessage { Title = _sharedResources["COM_DELETE_FILE_SUCCESS"], Error = false };
            try
            {
                var path = _hostingEnvironment.WebRootPath + "/" + filePath;
                if (System.IO.File.Exists(path))
                {
                    System.IO.File.Delete(path);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }

            return msg;
        }
        #endregion

        #region Combobox
        [HttpPost]

        public JsonResult GetStatusCommitmentHeader()
        {
            var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals("STATUS_CMH")) //Trạng Thái
                        .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            var rs = data;

            return Json(rs);
        }
        public JsonResult GetSurrogateCommitmentHeader()
        {
            var data = _context.Users.Where(x => x.Active == true && x.UserName != "admin") //Nhóm Hạng Mục
                        .Select(x => new { Code = x.Id, Name = x.GivenName });
            var rs = data;

            return Json(rs);
        }

        #endregion

        #region Model
        // Child class for search API
        public class JTableModelCommitment : JTableModel
        {
            public string CommitmentCode { get; set; }
            public string Title { get; set; }
            public string UserId { get; set; }
            public string Surrogate { get; set; }
            public string Status { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
        }
        public class CommitmentHeaderObject
        {
            public int? Id { get; set; }
            public string CommitmentCode { get; set; }
            public string Title { get; set; }
            public string Status { get; set; }
            public string UserID { get; set; }
            public string Noted { get; set; }
            public string EndTime { get; set; }
            public string StartTime { get; set; }
            public string Surrogate { get; set; }
            public string Signature { get; set; }
            public string FileReference { get; set; }
        }
        public class FileInfoCommitment
        {
            public string FileName { get; set; }
            public string FilePath { get; set; }
            public string ShortPath { get; set; }
        }
        #endregion

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }).Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion
    }
}