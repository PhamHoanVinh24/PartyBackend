using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using III.Domain.Enums;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{

    [Area("Admin")]
    public class OrderRequestRawController : BaseController
    {
        public class CustomerRequestJtable : JTableModel
        {
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string Title { get; set; }
            public string Content { get; set; }
        }
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<OrderRequestRawController> _stringLocalizer;
        private readonly IStringLocalizer<FilePluginController> _stringLocalizerFp;
        private readonly IStringLocalizer<EDMSRepositoryController> _stringLocalizerEdms;
        private readonly IStringLocalizer<CardJobController> _stringLocalizerCard;
        private readonly IStringLocalizer<SharedResources> _sharedResources;

        public OrderRequestRawController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment,
            IStringLocalizer<FilePluginController> stringLocalizerFp,
            IStringLocalizer<OrderRequestRawController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources,
            IStringLocalizer<EDMSRepositoryController> stringLocalizerEdms, IStringLocalizer<CardJobController> stringLocalizerCard)
        {
            _context = context;
            _upload = upload;
            _hostingEnvironment = hostingEnvironment;
            _stringLocalizer = stringLocalizer;
            _stringLocalizerFp = stringLocalizerFp;
            _sharedResources = sharedResources;
            _stringLocalizerEdms = stringLocalizerEdms;
            _stringLocalizerCard = stringLocalizerCard;
        }
        [Breadcrumb("ViewData.CrumbOrderRqRaw", AreaName = "Admin", FromAction = "Index", FromController = typeof(CustomerHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbCusHome"] = _sharedResources["COM_CRUMB_CUSTOMER"];
            ViewData["CrumbOrderRqRaw"] = _sharedResources["COM_CRUMB_ORDER_RQ_RAW"];
            return View();
        }

        [HttpPost]
        public object JTable([FromBody]CustomerRequestJtable jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var query = from a in _context.OrderRequestRaws
                        join b in _context.OrderRequestRawFiless on a.ReqCode equals b.ReqCode into b1
                        from b2 in b1.DefaultIfEmpty()
                        join c in _context.Users on a.CreatedBy equals c.UserName
                        where b2.IsMaster
                        && ((fromDate == null) || (a.RequestTime.HasValue && a.RequestTime.Value.Date >= fromDate.Value.Date))
                            && ((toDate == null) || (a.RequestTime.HasValue && a.RequestTime.Value.Date <= toDate.Value.Date))
                            && (string.IsNullOrEmpty(jTablePara.Title) || a.Title.ToLower().Contains(jTablePara.Title.ToLower()))
                            && (string.IsNullOrEmpty(jTablePara.Content) || a.Content.ToLower().Contains(jTablePara.Content.ToLower()))
                        select new
                        {
                            a.Id,
                            a.ReqCode,
                            a.Title,
                            a.Content,
                            a.Priority,
                            a.Email,
                            a.Phone,
                            a.RequestTime,
                            FilePath = b2.FilePath != null ? b2.FilePath : "/uploads/files/FileMasterDefault.xlsx",
                            FileType = b2.FileType != null ? b2.FileType : ".xlsx",
                            UserCreated = c.GivenName
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).Select(x => new
            {
                x.Id,
                x.Title,
                x.Content,
                x.Priority,
                x.Email,
                x.Phone,
                x.RequestTime,
                x.FilePath,
                x.FileType,
                x.UserCreated,
                IsFile = _context.OrderRequestRawFiless.FirstOrDefault(y => y.ReqCode == x.ReqCode) != null ? true : false,
            }).AsNoTracking().ToList();
            var data1 = data.OrderByDescending(x => x.Priority).ToList();
            var jdata = JTableHelper.JObjectTable(data1, jTablePara.Draw, count, "Id", 
                "Title", "Content", "Priority", "Email", "Phone", "RequestTime", 
                "IsFile", "FilePath", "FileType", "UserCreated");
            return Json(jdata);
        }

        [HttpPost]
        public JsonResult GetItem([FromBody]int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            var data = _context.OrderRequestRaws.FirstOrDefault(x => x.Id == id);
            if (data != null)
            {
                var model = new CustomerRequestModel
                {
                    Id = data.Id,
                    ReqCode = data.ReqCode,
                    Title = data.Title,
                    Content = data.Content,
                    Status = data.Status,
                    Phone = data.Phone,
                    Email = data.Email,
                    Priority = data.Priority,
                    RequestTime = data.RequestTime != null ? data.RequestTime.Value.ToString("dd/MM/yyyy") : "",
                    Keyword = data.Keyword,
                    ListFile = _context.OrderRequestRawFiless.Where(x => x.ReqCode == data.ReqCode.ToString()).ToList(),
                };
                msg.Object = model;
            }
            else
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public object GetItemLogChange(int path)
        {
            var data = _context.LogChangeDocuments.Where(x => x.FileCode.Equals(path));
            return data;
        }

        [HttpPost]
        public JsonResult Insert([FromBody]CustomerRequestModel obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var requestCode = Guid.NewGuid().ToString();
                var customerRequest = new OrderRequestRaw
                {
                    ReqCode = requestCode,
                    Title = obj.Title,
                    Content = obj.Content,
                    Phone = obj.Phone,
                    Email = obj.Email,
                    Keyword = obj.Keyword,
                    Priority = obj.Priority,
                    CreatedTime = DateTime.Now,
                    RequestTime = !string.IsNullOrEmpty(obj.RequestTime) ? DateTime.ParseExact(obj.RequestTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null,
                    CreatedBy = ESEIM.AppContext.UserName,
                };
                _context.OrderRequestRaws.Add(customerRequest);
                if (obj.ListFile.Count == 0)
                {
                    var file = new OrderRequestRawFiles
                    {
                        ReqCode = customerRequest.ReqCode,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now,
                        FileName = "FileMasterDefault.xlsx",
                        FilePath = "/uploads/files/FileMasterDefault.xlsx",
                        FileType = ".xlsx",
                        IsMaster = true
                    };
                    _context.OrderRequestRawFiless.Add(file);
                }
                else
                {
                    foreach (var item in obj.ListFile)
                    {
                        var file = new OrderRequestRawFiles
                        {
                            ReqCode = customerRequest.ReqCode,
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now,
                            FileName = item.FileName,
                            FilePath = item.FilePath,
                            FileType = "." + item.FileType,
                            IsMaster = item.IsMaster
                        };
                        _context.OrderRequestRawFiless.Add(file);
                    }
                }

                _context.SaveChanges();
                msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], "");

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Update([FromBody]CustomerRequestModel obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                //header
                var data = _context.OrderRequestRaws.FirstOrDefault(x => x.Id == obj.Id);
                data.Title = obj.Title;
                data.Content = obj.Content;
                data.Phone = obj.Phone;
                data.Email = obj.Email;
                data.Keyword = obj.Keyword;
                data.Priority = obj.Priority;
                data.RequestTime = !string.IsNullOrEmpty(obj.RequestTime) ? DateTime.ParseExact(obj.RequestTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                _context.OrderRequestRaws.Update(data);
                //file
                var listFileNew = obj.ListFile.Where(x => x.Id < 0);
                foreach (var item in listFileNew)
                {
                    var file = new OrderRequestRawFiles
                    {
                        ReqCode = data.ReqCode,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now,
                        FileName = item.FileName,
                        FilePath = item.FilePath,
                        FileType = "." + item.FileType,
                        IsMaster = item.IsMaster
                    };
                    _context.OrderRequestRawFiless.Add(file);
                    _context.SaveChanges();
                }

                var listFileOld = obj.ListFile.Where(x => x.Id > 0);
                foreach (var item in listFileOld)
                {
                    _context.OrderRequestRawFiless.Update(item);
                }



                if (obj.ListDeletedFile.Any())
                {
                    var listFileDelete = _context.OrderRequestRawFiless.Where(x => obj.ListDeletedFile.Any(y => x.Id == y));
                    if (listFileDelete.Any())
                    {
                        _context.OrderRequestRawFiless.RemoveRange(listFileDelete);
                    }
                }

                _context.SaveChanges();
                msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], "");
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Cập nhật yêu cầu lỗi";
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateStatus([FromBody]CustomerRequestModel obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                //header
                var data = _context.OrderRequestRaws.FirstOrDefault(x => x.Id == obj.Id);
                data.Status = obj.Status;
                _context.OrderRequestRaws.Update(data);
                _context.SaveChanges();
                msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], "");
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Delete([FromBody]int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = _context.OrderRequestRaws.FirstOrDefault(x => x.Id == id);
                if (data != null)
                {
                    _context.OrderRequestRaws.Remove(data);
                    _context.SaveChanges();
                    // msg.Title = "Xóa yêu cầu thành công!";
                    msg.Title = String.Format(_sharedResources["COM_DELETE_SUCCESS"], "");
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "yêu cầu không tồn tại!";
                    msg.Title = String.Format(_sharedResources["COM_MSG_NOT_EXITS"], _stringLocalizer["ORR_LBL_ORR_NAME"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi xảy ra khi xóa!";
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }


        [HttpPost]
        [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
        [RequestSizeLimit(long.MaxValue)]
        public JsonResult UploadFile(IFormFile file)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var userId = ESEIM.AppContext.UserId;
            var User = _context.Users.FirstOrDefault(x => x.Id == userId);
            var upload = _upload.UploadFile(file, Path.Combine(_hostingEnvironment.WebRootPath, "uploads\\files"));
            if (upload.Error)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_ERR_FAIL_DOWLOAD"], _sharedResources["COM_FILE"]) + upload.Title;
            }
            else
            {
                msg.Object = new
                {
                    Source = "/uploads/Files/" + upload.Object.ToString(),
                    User = User?.GivenName,
                };
                msg.Title = String.Format(_sharedResources["COM_ERR_SUCCESS_DOWLOAD"], _sharedResources["COM_FILE"]);
            }
            return Json(msg);
        }

        [HttpGet]
        public JsonResult GetListFile(int? id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.OrderRequestRaws.FirstOrDefault(x => x.Id == id);
                if (data != null)
                {
                    var listFile = _context.OrderRequestRawFiless.Where(x => x.ReqCode == data.ReqCode);
                    msg.Object = listFile;
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                //msg.Title = "Có lỗi khi lấy dữ liệu";
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpGet]
        public object GetPathFile(string filePath)
        {
            var extension = Path.GetExtension(filePath);
            var attachment = _context.OrderRequestRawFiless.FirstOrDefault(x => x.FilePath == filePath && !x.IsDeleted);
            var asean = new AseanDocument();
            //asean.File_Code = attachment.ReqCode;
            if (extension.ToUpper() == ".DOCX" || extension.ToUpper() == ".DOC")
            {
                SyncfusionController.pathFile = filePath;
                SyncfusionController.docmodel = asean;
            }
            if (extension.ToUpper() == ".XLSX" || extension.ToUpper() == ".XLS")
            {
                ExcelController.pathFile = filePath;
                ExcelController.docmodel = asean;
            }
            if (extension.ToUpper() == ".PDF")
            {
                PDFController.pathFile = filePath;
            }

            attachment.UpdatedTime = DateTime.Now;
            _context.SaveChanges();
            return attachment;
        }

        #region LogDocs
        [HttpPost]
        public object JTablLogchange([FromBody]LogChange jTablePara)
        {
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = (from a in _context.LogChangeDocuments
                         join b in _context.Users on a.UserID equals b.Id into b1
                         from b2 in b1.DefaultIfEmpty()
                         where (a.FileCode.Equals(jTablePara.FileCode) && !a.IsDeleted)
                         select new
                         {
                             a.ID,
                             a.LogContent,
                             a.CreatedTime,
                             //a.UserID,
                             UserID = b2.UserName,
                             a.FileName,
                             a.FileCode,
                             a.LogText
                         }).AsParallel();
            int count = query.Count();
            var data = query.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length);
            var jdata = JTableHelper.JObjectTable(data.ToList(), jTablePara.Draw, count, "ID", "LogContent", "CreatedTime", "UserID", "FileName", "FileCode", "LogText");
            return Json(jdata);
        }

        public class LogChange : JTableModel
        {
            public string FileCode { get; set; }
        }
        #endregion

        #region file
        [HttpPost]
        public object JTableFile([FromBody]JTableModelFile jTablePara)
        {
            if (string.IsNullOrEmpty(jTablePara.ReqCode))
            {
                return JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "Id", "FileName", "FileTypePhysic", "Desc", "Url", "CreatedTime", "UpdatedTime", "ReposName", "TypeFile", "FileID", "SizeOfFile");
            }
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            var listFileByUser = _context.FilesShareObjectUsers.Where(x => !x.IsDeleted && x.UserShares.Any(p => p.Code.Equals(User.Identity.Name)))
                                                           .Select(p => new
                                                           {
                                                               p.FileID,
                                                               p.ListUserShare,
                                                               p.UserShares
                                                           }).ToList();
            var session = HttpContext.GetSessionUser();

            var query = (from a in _context.EDMSRepoCatFiles.Where(x => x.ObjectCode == jTablePara.ReqCode && x.ObjectType == EnumHelper<OrderRequestRawEnum>.GetDisplayValue(OrderRequestRawEnum.RqRaw))
                         join b in _context.EDMSFiles on a.FileCode equals b.FileCode
                         join f in _context.EDMSRepositorys on a.ReposCode equals f.ReposCode into f1
                         from f in f1.DefaultIfEmpty()
                         where (listFileByUser.Any(x => x.FileID.Equals(b.FileCode)) || b.CreatedBy.Equals(User.Identity.Name) || session.IsAllData)
                         select new
                         {
                             Id = a.Id,
                             FileCode = b.FileCode,
                             FileName = b.FileName,
                             FileTypePhysic = b.FileTypePhysic,
                             Desc = b.Desc,
                             CreatedTime = b.CreatedTime.Value,
                             CloudFileId = b.CloudFileId,
                             ReposName = f != null ? f.ReposName : "",
                             FileID = b.FileID,
                             SizeOfFile = b.FileSize.HasValue ? b.FileSize.Value : 0,
                             Type = "NO_SHARE"
                         });
            int count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "FileCode", "FileName", "FileTypePhysic", "Desc", "CreatedTime", "CloudFileId", "ReposName", "TypeFile", "FileID", "SizeOfFile");
            return jdata;
        }

        [HttpPost]
        [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
        [RequestSizeLimit(long.MaxValue)]
        public JsonResult InsertCardJobFile(EDMSRepoCatFileModel obj, IFormFile fileUpload)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var mimeType = fileUpload.ContentType;
                string extension = Path.GetExtension(fileUpload.FileName);
                string urlFile = "";
                string fileId = "";
                if (Array.IndexOf(LuceneExtension.fileMimetypes, mimeType) >= 0 && (Array.IndexOf(LuceneExtension.fileExt, extension.ToUpper()) >= 0))
                {
                    string reposCode = "";
                    string catCode = "";
                    string path = "";
                    string folderId = "";
                    //Chọn file ngắn gọn
                    if (!obj.IsMore)
                    {
                        var repoDefault = _context.EDMSRepoDefaultObjects.FirstOrDefault(x => !x.IsDeleted
                                && x.ObjectCode.Equals(obj.ReqCode) && x.ObjectType.Equals(EnumHelper<ObjectType>.GetDisplayValue(ObjectType.OrderRqRaw)));
                        if (repoDefault != null)
                        {
                            reposCode = repoDefault.ReposCode;
                            path = repoDefault.Path;
                            folderId = repoDefault.FolderId;
                            catCode = repoDefault.CatCode;
                        }
                        else
                        {
                            msg.Error = true;
                            msg.Title = _sharedResources["COM_MSG_PLS_SETUP_FOLDER_DEFAULT"];
                            return Json(msg);
                        }
                    }
                    //Hiển file mở rộng
                    else
                    {
                        var setting = _context.EDMSCatRepoSettings.FirstOrDefault(x => x.Id == obj.CateRepoSettingId);
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
                            msg.Title = _stringLocalizer["Vui lòng chọn thư mục lưu trữ"];
                            return Json(msg);
                        }
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
                        FileCode = string.Concat("ReqRaw_", Guid.NewGuid().ToString()),
                        ReposCode = reposCode,
                        CatCode = catCode,
                        ObjectCode = obj.ReqCode,
                        ObjectType = EnumHelper<OrderRequestRawEnum>.GetDisplayValue(OrderRequestRawEnum.RqRaw),
                        Path = path,
                        FolderId = folderId
                    };
                    _context.EDMSRepoCatFiles.Add(edmsReposCatFile);

                    /// created Index lucene
                    LuceneExtension.IndexFile(edmsReposCatFile.FileCode, fileUpload, string.Concat(_hostingEnvironment.WebRootPath, "\\uploads\\luceneIndex"));

                    //add File
                    var file = new EDMSFile
                    {
                        FileCode = edmsReposCatFile.FileCode,
                        FileName = fileUpload.FileName,
                        Desc = obj.Desc,
                        ReposCode = reposCode,
                        Tags = obj.Tags,
                        FileSize = fileUpload.Length,
                        FileTypePhysic = Path.GetExtension(fileUpload.FileName),
                        NumberDocument = obj.NumberDocument,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now,
                        Url = urlFile,
                        MimeType = mimeType,
                        CloudFileId = fileId,
                    };
                    _context.EDMSFiles.Add(file);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizer["HR_HR_MSG_ADD_FILE_SUCCESS"];
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
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpGet]
        public EDMSRepoCatFile GetSuggestionsFile(string orderCode)
        {
            var query = _context.EDMSRepoCatFiles.Where(x => x.ObjectCode == orderCode
            && x.ObjectType == EnumHelper<OrderRequestRawEnum>.GetDisplayValue(OrderRequestRawEnum.RqRaw)).MaxBy(x => x.Id);
            return query;
        }

        [HttpPost]
        public JsonResult GetCardFile(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var model = new EDMSRepoCatFileModel();
            try
            {
                var data = _context.EDMSRepoCatFiles.FirstOrDefault(m => m.Id == id);
                if (data != null)
                {
                    var file = _context.EDMSFiles.FirstOrDefault(x => x.FileCode == data.FileCode);
                    //header file
                    model.FileCode = file.FileCode;
                    model.NumberDocument = file.NumberDocument;
                    model.Tags = file.Tags;
                    model.Desc = file.Desc;
                    //category file
                    model.CateRepoSettingCode = data.CatCode;
                    model.CateRepoSettingId = data.Id;
                    model.Path = data.Path;
                    model.FolderId = data.FolderId;
                    msg.Object = model;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["Tệp tin không tồn tại"]);//"Tệp tin không tồn tại!";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateCardFile(EDMSRepoCatFileModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                string path = "";
                string fileId = "";
                var oldSetting = _context.EDMSRepoCatFiles.FirstOrDefault(x => x.FileCode == obj.FileCode);
                if (oldSetting != null)
                {
                    var newSetting = _context.EDMSCatRepoSettings.FirstOrDefault(x => x.Id == obj.CateRepoSettingId);
                    if (newSetting != null)
                    {
                        var file = _context.EDMSFiles.FirstOrDefault(x => x.FileCode == oldSetting.FileCode);
                        //change folder
                        if ((string.IsNullOrEmpty(oldSetting.Path) && oldSetting.FolderId != newSetting.FolderId) || (string.IsNullOrEmpty(oldSetting.FolderId) && oldSetting.Path != newSetting.Path))
                        {
                            //dowload file old
                            var oldRepo = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == oldSetting.ReposCode);
                            byte[] fileData = null;
                            if (oldRepo.Type == "SERVER")
                            {
                                string ftphost = oldRepo.Server;
                                string ftpfilepath = file.Url;
                                var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + ftphost + ftpfilepath);
                                using (WebClient request = new WebClient())
                                {
                                    request.Credentials = new NetworkCredential(oldRepo.Account, oldRepo.PassWord);
                                    fileData = request.DownloadData(urlEnd);
                                }
                            }
                            else
                            {
                                fileData = FileExtensions.DownloadFileGoogle(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", file.CloudFileId);
                            }
                            //delete folder old
                            if (oldRepo.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server))
                            {
                                var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + oldRepo.Server + file.Url);
                                FileExtensions.DeleteFileFtpServer(urlEnd, oldRepo.Account, oldRepo.PassWord);
                            }
                            else if (oldRepo.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.GooglerDriver))
                            {
                                FileExtensions.DeleteFileGoogleServer(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", file.CloudFileId);
                            }

                            //insert folder new
                            var newRepo = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == newSetting.ReposCode);
                            if (newRepo.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server))
                            {
                                path = newSetting.Path + Path.Combine("/", file.FileName);
                                var pathPreventive = path + Path.Combine("/", Guid.NewGuid().ToString().Substring(0, 8) + file.FileName);
                                var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + newRepo.Server + path);
                                var urlEndPreventive = System.Web.HttpUtility.UrlPathEncode("ftp://" + newRepo.Server + pathPreventive);
                                var result = FileExtensions.UploadFileToFtpServer(urlEnd, urlEndPreventive, fileData, newRepo.Account, newRepo.PassWord);
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
                                        path = pathPreventive;
                                    }
                                }
                                else
                                {
                                    msg.Error = true;
                                    msg.Title = _sharedResources["COM_MSG_ERR"];
                                    return Json(msg);
                                }
                            }
                            else if (newRepo.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.GooglerDriver))
                            {
                                fileId = FileExtensions.UploadFileToDrive(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", file.FileName, new MemoryStream(fileData), file.MimeType, newSetting.FolderId);
                            }
                            file.CloudFileId = fileId;
                            file.Url = path;

                            //update setting new
                            oldSetting.CatCode = newSetting.CatCode;
                            oldSetting.ReposCode = newSetting.ReposCode;
                            oldSetting.Path = newSetting.Path;
                            oldSetting.FolderId = newSetting.FolderId;
                            _context.EDMSRepoCatFiles.Update(oldSetting);
                        }
                        //update header
                        file.Desc = obj.Desc;
                        file.Tags = obj.Tags;
                        file.NumberDocument = obj.NumberDocument;
                        _context.EDMSFiles.Update(file);
                        _context.SaveChanges();
                        msg.Title = _stringLocalizer["HR_HR_MSG_UPDATE_SUCCESS"];
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["HR_HR_MAN_MSG_SELECT_FORDER"];
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["HR_HR_MSG_FILE_NOT_EXIST"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_FAILED"], _stringLocalizer[""]);// "Có lỗi xảy ra khi cập nhật!";
                msg.Object = ex;
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult DeleteCardFile(int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.EDMSRepoCatFiles.FirstOrDefault(x => x.Id == id);
                _context.EDMSRepoCatFiles.Remove(data);

                var file = _context.EDMSFiles.FirstOrDefault(x => x.FileCode == data.FileCode);
                _context.EDMSFiles.Remove(file);

                LuceneExtension.DeleteIndexFile(file.FileCode, _hostingEnvironment.WebRootPath + "\\uploads\\luceneIndex");
                var getRepository = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == data.ReposCode);
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
                _context.SaveChanges();
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer[""]);// "Xóa thành công";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_FAIL"], _stringLocalizer[""]);//"Có lỗi xảy ra khi xóa!";
                msg.Object = ex;
            }
            return Json(msg);
        }

        [HttpPost]
        public object GetListUserShare()
        {
            var data = from a in _context.Users.Select(x => new { Code = x.UserName, Name = x.GivenName, x.DepartmentId, UserId = x.Id })
                       join b in _context.AdDepartments.Where(x => !x.IsDeleted && x.IsEnabled) on a.DepartmentId equals b.DepartmentCode into b1
                       from b in b1.DefaultIfEmpty()
                       select new
                       {
                           a.Code,
                           a.Name,
                           DepartmentName = b != null ? b.Title : ""
                       };
            return data;
        }

        [HttpPost]
        public JsonResult InsertFileShareCard([FromBody] CardFileShareModel obj)
        {
            var msg = new JMessage { Title = "", Error = false };
            try
            {
                var data = (from a in _context.EDMSRepoCatFiles.Where(x => x.Id == obj.Id)
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
                                FileId = (c != null ? c.CloudFileId : null),
                                FileTypePhysic = c.FileTypePhysic,
                                c.FileName,
                                c.MimeType,
                                b.Account,
                                b.PassWord,
                                c.FileCode,
                                c.IsEdit,
                                c.IsFileMaster,
                                c.FileParentId
                            }).FirstOrDefault();

                if (data != null)
                {
                    var check = _context.FilesShareObjectUsers.FirstOrDefault(x => !x.IsDeleted && x.FileID.Equals(data.FileCode));
                    if (check == null)
                    {
                        var rela = new
                        {
                            ObjectType = EnumHelper<OrderRequestRawEnum>.GetDisplayValue(OrderRequestRawEnum.RqRaw),
                            ObjectInstance = data.Id
                        };
                        var files = new FilesShareObjectUser
                        {
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now,
                            FileID = data.FileCode,
                            FileCreated = User.Identity.Name,
                            FileUrl = data.Url,
                            FileName = data.FileName,
                            ObjectRelative = JsonConvert.SerializeObject(rela),
                            ListUserShare = obj.ListUserShare
                        };
                        _context.FilesShareObjectUsers.Add(files);
                    }
                    else
                    {
                        check.ListUserShare = obj.ListUserShare;

                        _context.FilesShareObjectUsers.Update(check);
                    }
                    _context.SaveChanges();
                }

                msg.Title = "Chia sẻ thành công";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        public class JTableModelFile : JTableModel
        {
            public string ReqCode { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string CatCode { get; set; }
        }
        public class CardFileShareModel
        {
            public int? Id { get; set; }
            public string ListUserShare { get; set; }
        }
        #endregion

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_stringLocalizerEdms.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerFp.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerCard.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion
    }
}