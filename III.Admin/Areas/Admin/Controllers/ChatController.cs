using System;
using System.Collections.Generic;
using System.Data;
using System.Globalization;
using System.IO;
using System.Linq;
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
using OpenXmlPowerTools;
using Syncfusion.EJ2.DocumentEditor;
using Syncfusion.EJ2.Spreadsheet;
using Syncfusion.XlsIO;
using System.Net.Http;
using System.Text;
using Microsoft.AspNetCore.Http.Internal;
using ESEIM;
using System.Net;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class ChatController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IStringLocalizer<ExcelController> _stringLocalizer;
        public readonly string module_name = "CHAT";
        public string path_upload_file = "";
        public string repos_code = "";
        public string cat_code = "";
        public int host_type = 1;
        public ChatController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment, IStringLocalizer<ExcelController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _hostingEnvironment = hostingEnvironment;
            _context = context;
            _upload = upload;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
            //var obj = (EDMSCatRepoSetting)_upload.GetPathByModule(module_name).Object;
            //repos_code = obj.ReposCode;
            //cat_code = obj.CatCode;
            //if (obj.Path == "")
            //{
            //    host_type = 1;
            //    path_upload_file = obj.FolderId;
            //}
            //else
            //{
            //    host_type = 0;
            //    path_upload_file = obj.Path;
            //}
        }

        public IActionResult Index()
        {
            return View();
        }

        #region Function
        public IActionResult AddGroup()
        {
            return View();
        }

        [HttpGet]
        public IActionResult EditGroup(string groupID)
        {
            ViewData["GroupId"] = groupID;
            return View();
        }

        [HttpPost]
        public JsonResult GetListGroupChat()
        {
            JMessage msg = new JMessage { Error = false };
            try
            {
                msg.Object = _context.ChatGroups.Where(x => !x.IsDeleted).Select(p => new
                {
                    p.GroupCode,
                    p.GroupChanel,
                    p.GroupName,
                    p.JsonData,
                    p.ObjectRelative
                });
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi lấy dữ liệu!";
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetListObjectType()
        {
            var data = _context.JcObjectTypes.Where(x => !x.IsDeleted && x.ObjTypeCode != "CARD_JOB").Select(x => new { Code = x.ObjTypeCode, Name = x.ObjTypeName });
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetListObjectCode(string code)
        {
            List<ObjTemp> listTemp = new List<ObjTemp>();
            listTemp = GetListObjTemp(code);
            return Json(listTemp);
        }

        [NonAction]
        public List<ObjTemp> GetListObjTemp(string code)
        {
            List<ObjTemp> listTemp = new List<ObjTemp>();
            if (string.IsNullOrEmpty(code))
            {
                return listTemp;
            }
            var query = _context.JcObjectTypes.FirstOrDefault(x => x.ObjTypeCode.Equals(code) && !x.IsDeleted);

            using (var command = _context.Database.GetDbConnection().CreateCommand())
            {
                command.CommandText = query.ScriptSQL;
                _context.Database.OpenConnection();
                using (var result = command.ExecuteReader())
                {
                    while (result.Read())
                    {
                        if (result != null)
                        {
                            if (code == "CONTRACT_PO")
                            {
                                if (!result.IsDBNull(3) && !result.IsDBNull(4))
                                {
                                    var objTemp = new ObjTemp
                                    {
                                        Code = result.GetString(4),
                                        Name = result.GetString(3)
                                    };
                                    if (objTemp != null)
                                    {
                                        listTemp.Add(objTemp);
                                    }
                                }
                            }
                            else if (code == "NOT_WORK")
                            {
                                if (!result.IsDBNull(1) && !result.IsDBNull(8))
                                {
                                    var user = _context.Users.FirstOrDefault(x => x.Id.Equals(result.GetString(8)));
                                    var objTemp = new ObjTemp
                                    {
                                        Code = result.GetString(1),
                                        Name = user != null ? user.GivenName + " báo nghỉ" : ""
                                    };
                                    if (objTemp != null)
                                    {
                                        listTemp.Add(objTemp);
                                    }
                                }
                            }
                            else
                            {
                                if (!result.IsDBNull(1) && !result.IsDBNull(2))
                                {
                                    var objTemp = new ObjTemp
                                    {
                                        Code = result.GetString(1),
                                        Name = result.GetString(2)
                                    };
                                    if (objTemp != null)
                                    {
                                        listTemp.Add(objTemp);
                                    }
                                }
                            }
                        }

                    }
                }
                _context.Database.CloseConnection();
            }
            return listTemp;
        }
        public class ObjTemp
        {
            public string Code { get; set; }
            public string Name { get; set; }
        }

        #endregion

        #region Insert
        [HttpPost]
        public object InsertGroup([FromBody] ChatGroup obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var session = HttpContext.GetSessionUser();

                var check = _context.ChatGroups.Any(x => !x.IsDeleted && x.GroupName.Equals(obj.GroupName));
                if (check)
                {
                    msg.Error = true;
                    msg.Title = "Nhóm đã tồn tại";
                    return msg;
                }

                obj.GroupCode = string.Format("G_{0}", DateTime.Now.ToString("ddMMyyy_HHmmss"));
                obj.GroupChanel = obj.GroupCode;
                obj.CreatedBy = User.Identity.Name;
                obj.CreatedTime = DateTime.Now;

                _context.ChatGroups.Add(obj);
                _context.SaveChanges();

                msg.Title = "Tạo nhóm thành công";

                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Object = ex;
                return Json(msg);
            }
        }

        [HttpPost]
        public object UpdateGroup([FromBody] ChatGroup obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var session = HttpContext.GetSessionUser();

                var model = _context.ChatGroups.FirstOrDefault(x => !x.IsDeleted && x.GroupCode.Equals(obj.GroupCode));
                if (model == null)
                {
                    msg.Error = true;
                    msg.Title = "Nhóm không tồn tại";
                    return msg;
                }

                model.UpdatedBy = User.Identity.Name;
                model.UpdatedTime = DateTime.Now;

                _context.ChatGroups.Update(model);
                _context.SaveChanges();

                msg.Title = "Cập nhật nhóm thành công";

                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Object = ex;
                return Json(msg);
            }
        }

        #endregion

        #region Attach File
        [HttpPost]
        [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
        [RequestSizeLimit(long.MaxValue)]
        public JsonResult AttachFile(LogMessage obj, IFormFile fileUpload)
        {
            var msg = new JMessage() { Error = false, Title = "Thêm file thành công" };

            try
            {
                var session = HttpContext.GetSessionUser();

                string urlFile = "";
                string pathFTP = path_upload_file;
                var fileName = fileUpload.FileName;
                var fileId = "";

                var mimeType = fileUpload.ContentType;
                string extension = Path.GetExtension(fileUpload.FileName);
                var fileSize = fileUpload.Length;
                if ((fileSize / 1048576.0) > 1000)
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["EDMSR_MSG_FILE_SIZE_LIMIT_UPLOAD"];
                    return Json(msg);
                }

                var getRepository = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == repos_code);
                if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server))
                {
                    using (var ms = new MemoryStream())
                    {
                        fileUpload.CopyTo(ms);

                        var fileBytes = ms.ToArray();
                        urlFile = pathFTP + Path.Combine("/", fileName);
                        var urlFilePreventive = pathFTP + Path.Combine("/", Guid.NewGuid().ToString().Substring(0, 8) + fileName);
                        var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + getRepository.Server + urlFile);
                        var urlEndPreventive = System.Web.HttpUtility.UrlPathEncode("ftp://" + getRepository.Server + urlFilePreventive);
                        var result = FileExtensions.UploadFileToFtpServer(urlEnd, urlEndPreventive, fileBytes, getRepository.Account, getRepository.PassWord);
                        if (result.Status == WebExceptionStatus.ConnectFailure || result.Status == WebExceptionStatus.ProtocolError)
                        {
                            msg.Error = true;
                            msg.Title = _stringLocalizer["WBS_MSG_ERR_CONNECTION"];
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
                        }
                    }
                }
                else
                {
                    var apiTokenService = _context.TokenManagers.FirstOrDefault(x => x.AccountCode == getRepository.Token);
                    var json = apiTokenService.CredentialsJson;
                    var user = apiTokenService.Email;
                    var token = apiTokenService.RefreshToken;
                    fileId = FileExtensions.UploadFileToDrive(json, token, fileUpload.FileName, fileUpload.OpenReadStream(), fileUpload.ContentType, path_upload_file, user);
                }

                var edmsReposCatFile = new EDMSRepoCatFile
                {
                    FileCode = string.Concat("CHAT", Guid.NewGuid().ToString()),
                    ReposCode = repos_code,
                    CatCode = cat_code,
                    ObjectCode = null,
                    ObjectType = null,
                    Path = host_type == 0 ? path_upload_file : "",
                    FolderId = host_type == 1 ? path_upload_file : ""
                };

                var moduleObj = (EDMSCatRepoSetting)_upload.GetPathByModule("DB_LUCENE_INDEX").Object;
                var luceneCategory = _context.EDMSCategorys.FirstOrDefault(x => x.CatCode == moduleObj.CatCode);
                LuceneExtension.IndexFile(edmsReposCatFile.FileCode, fileUpload, luceneCategory.PathServerPhysic);

                var file = new EDMSFile
                {
                    FileCode = edmsReposCatFile.FileCode,
                    FileName = fileName,
                    Desc = "",
                    ReposCode = repos_code,
                    Tags = "",
                    FileSize = fileSize,
                    FileTypePhysic = extension,
                    NumberDocument = "",
                    CreatedBy = ESEIM.AppContext.UserName,
                    CreatedTime = DateTime.Now,
                    Url = urlFile,
                    MimeType = fileUpload.ContentType,
                    CloudFileId = fileId,
                };

                _context.EDMSFiles.Add(file);
                _context.EDMSRepoCatFiles.Add(edmsReposCatFile);
                _context.SaveChanges();

                if (edmsReposCatFile.Id > 0)
                {
                    var pathFtpRoot = "/uploads/repository";

                    var log = new LogMessage
                    {
                        Channel = obj.Channel,
                        GroupCode = obj.Channel,
                        TimeChat = DateTime.Now,
                        Content = fileName,
                        User = User.Identity.Name,
                        GivenName = session.FullName,
                        Image = session.Picture,
                        IsFile = true,
                        FileId = edmsReposCatFile.Id,
                        Url = pathFtpRoot + urlFile,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now
                    };

                    _context.LogMessages.Add(log);
                    _context.SaveChanges();

                    msg.Object = log;
                    msg.ID = edmsReposCatFile.Id;
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