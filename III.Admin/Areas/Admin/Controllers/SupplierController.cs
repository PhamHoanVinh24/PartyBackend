using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ESEIM;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using Microsoft.AspNetCore.Http;
using System.Globalization;
using System.IO;
using Microsoft.AspNetCore.Hosting;
using III.Domain.Enums;
using System.Net;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using SmartBreadcrumbs.Attributes;
using AppContext = ESEIM.AppContext;

namespace III.Admin.Controllers
{
    public class JTableModelSupplier : JTableModel
    {
        public string SupplierCode { set; get; }
        public string SupplierName { set; get; }
        public string SupplierEmail { set; get; }
        public string Address { set; get; }
        public string Phone { get; set; }
        public string SupplierGroup { set; get; }
        public string Status { set; get; }

    }
    [Area("Admin")]
    public class SupplierController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IGoogleApiService _googleAPIService;
        private readonly IStringLocalizer<FilePluginController> _stringLocalizerFp;
        private readonly IStringLocalizer<CustomerController> _stringLocalizerCus;
        private readonly IStringLocalizer<SupplierController> _stringLocalizer;
        private static AsyncLocker<string> userLock = new AsyncLocker<string>();
        private readonly IStringLocalizer<CardJobController> _cardJobController;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IStringLocalizer<EDMSRepositoryController> _edmsRepositoryController;
        private readonly IStringLocalizer<FileObjectShareController> _stringLocalizerFile;
        private readonly IStringLocalizer<ProjectController> _stringLocalizerPj;

        public SupplierController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment, IGoogleApiService googleAPIService,
            IStringLocalizer<SupplierController> stringLocalizer, IStringLocalizer<CardJobController> cardJobController,
            IStringLocalizer<FilePluginController> stringLocalizerFp, IStringLocalizer<ProjectController> stringLocalizerPj, 
            IStringLocalizer<SharedResources> sharedResources, IStringLocalizer<FileObjectShareController> stringLocalizerFile,
             IStringLocalizer<EDMSRepositoryController> edmsRepositoryController, IStringLocalizer<CustomerController> stringLocalizerCus)
        {
            _context = context;
            _upload = upload;
            _hostingEnvironment = hostingEnvironment;
            _googleAPIService = googleAPIService;
            _sharedResources = sharedResources;
            _stringLocalizerFp = stringLocalizerFp;
            _cardJobController = cardJobController;
            _stringLocalizer = stringLocalizer;
            _stringLocalizerCus = stringLocalizerCus;
            _stringLocalizerPj = stringLocalizerPj;
            _stringLocalizerFile = stringLocalizerFile;
            _edmsRepositoryController = edmsRepositoryController;
        }
        [Breadcrumb("ViewData.CrumbSupp", AreaName = "Admin", FromAction = "Index", FromController = typeof(SupplierHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbSuppHome"] = _sharedResources["COM_CRUMB_SUPP_HOME"];
            ViewData["CrumbSupp"] = _sharedResources["COM_CRUMB_SUPP"];
            return View();
        }

        #region GetComboboxValue
        [HttpPost]
        public JsonResult GetSupplierGroup()
        {
            var data = _context.CommonSettings.Where(x => x.Group == EnumHelper<SupplierEnum>.GetDisplayValue(SupplierEnum.SupplierGroup)).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return Json(data);
        }
        [HttpPost]
        public JsonResult GetSupplierStatus()
        {
            var data = _context.CommonSettings.Where(x => x.Group == EnumHelper<SupplierEnum>.GetDisplayValue(SupplierEnum.SupplierStatus)).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetListSupplierArea()
        {
            var msg = new JMessage() { Error = false };

            var data = from a in _context.CommonSettings
                       where a.Group == EnumHelper<CommonEnum>.GetDisplayValue(CommonEnum.Area) && a.IsDeleted == false
                       select new
                       {
                           Code = a.CodeSet,
                           Name = a.ValueSet,
                       };
            msg.Object = data;

            return Json(msg);
        }
        [HttpPost]
        public JsonResult GetListSupplierType()
        {
            var msg = new JMessage() { Error = false };

            var data = from a in _context.CommonSettings
                       where a.Group == EnumHelper<SupplierEnum>.GetDisplayValue(SupplierEnum.SupplierType) && a.IsDeleted == false
                       select new
                       {
                           Code = a.CodeSet,
                           Name = a.ValueSet,
                       };
            msg.Object = data;

            return Json(msg);
        }
        [HttpPost]
        public JsonResult GetListSupplierRole()
        {
            var msg = new JMessage() { Error = false };

            var data = from a in _context.CommonSettings
                       where a.Group == EnumHelper<SupplierEnum>.GetDisplayValue(SupplierEnum.SupplierRole) && a.IsDeleted == false
                       select new
                       {
                           Code = a.CodeSet,
                           Name = a.ValueSet,
                       };
            msg.Object = data;

            return Json(msg);
        }
        #endregion

        #region index
        [HttpPost]
        public object JTable([FromBody] JTableModelSupplier jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.Suppliers
                        where (a.IsDeleted == false)
                        && (string.IsNullOrEmpty(jTablePara.SupplierCode) || (a.SupCode.ToLower().Contains(jTablePara.SupplierCode.ToLower())))
                        && (string.IsNullOrEmpty(jTablePara.SupplierName) || (a.SupName.ToLower().Contains(jTablePara.SupplierName.ToLower())))
                        && (string.IsNullOrEmpty(jTablePara.SupplierEmail) || (a.Email.ToLower().Contains(jTablePara.SupplierEmail.ToLower())))
                        && (string.IsNullOrEmpty(jTablePara.Address) || (a.Address.ToLower().Contains(jTablePara.Address.ToLower())))
                        && (string.IsNullOrEmpty(jTablePara.Phone) || (a.Mobile.ToLower().Contains(jTablePara.Phone.ToLower())))
                        && (string.IsNullOrEmpty(jTablePara.SupplierGroup) || (a.SupGroup.Equals(jTablePara.SupplierGroup)))
                        && (string.IsNullOrEmpty(jTablePara.Status) || (a.Status.Equals(jTablePara.Status)))
                        select a;
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy)
                .Skip(intBeginFor)
                .Take(jTablePara.Length)
                .Select(x => new
                {
                    x.SupID,
                    Code = x.SupCode,
                    Name = x.SupName,
                    x.Email,
                    x.Address,
                    x.Telephone,
                    x.Mobile,
                    SupGroup = _context.CommonSettings.FirstOrDefault(y => y.CodeSet == x.SupGroup).ValueSet ?? "Không xác định",
                    Status = _context.CommonSettings.FirstOrDefault(y => y.CodeSet == x.Status).ValueSet ?? "Không xác định",
                }).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "SupID", "Code", "Name", "Email", "Address", "Telephone", "Mobile", "SupGroup", "Status");
            return Json(jdata);
        }
        [HttpPost]
        public async Task<JsonResult> Insert([FromBody] Supplier obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                using (await userLock.LockAsync(obj.SupCode.ToLower()))
                {
                    var checkExist = await _context.Suppliers.FirstOrDefaultAsync(x => !x.IsDeleted && x.SupCode.ToLower() == obj.SupCode.ToLower());
                    if (checkExist == null)
                    {
                        obj.CreatedBy = ESEIM.AppContext.UserName;
                        obj.CreatedTime = DateTime.Now;
                        obj.ListUserView = ESEIM.AppContext.UserId;
                        _context.Suppliers.Add(obj);
                        if (!string.IsNullOrEmpty(obj.GoogleMap))
                        {
                            var gps = new MapDataGps
                            {
                                Title = obj.SupName,
                                PolygonGPS = _googleAPIService.ConvertLatLnToMap(obj.GoogleMap),
                                ObjType = EnumHelper<SupplierEnum>.GetDisplayValue(SupplierEnum.Supplier),
                                ObjCode = obj.SupCode,
                                Icon = !string.IsNullOrEmpty(obj.IconLevel) ? _context.IconManagers.FirstOrDefault(x => x.IconCode == obj.IconLevel)?.IconPath : "/images/map/pinmap_start.png",
                                IsActive = true,
                                IsDefault = true,
                                MakerGPS = obj.GoogleMap,
                                GisData = obj.GoogleMap,
                                CreatedTime = DateTime.Now,
                                CreatedBy = ESEIM.AppContext.UserName,
                            };
                            _context.MapDataGpss.Add(gps);
                        }
                        _context.SaveChanges();
                        msg.ID = obj.SupID;
                        msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["SUP_TITLE_SUP"].Value.ToLower());// thêm nhà cung cấp
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = String.Format(_sharedResources["COM_MSG_EXITS"], _stringLocalizer["SUP_CURD_LBL_CODE"]);//Mã nhà cung cấp đã tồn tại
                    }
                }
            }
            catch
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult Update([FromBody] Supplier obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var supplier = _context.Suppliers.FirstOrDefault(x => x.SupCode == obj.SupCode && x.IsDeleted == false);
                if (supplier != null)
                {
                    var mapData = _context.MapDataGpss.FirstOrDefault(x => x.ObjCode == obj.SupCode && x.IsDefault == true && x.ObjType == EnumHelper<SupplierEnum>.GetDisplayValue(SupplierEnum.Supplier));
                    if (mapData != null)
                    {
                        mapData.MakerGPS = obj.GoogleMap;
                        mapData.PolygonGPS = mapData.PolygonGPS != obj.GoogleMap ? _googleAPIService.ConvertLatLnToMap(obj.GoogleMap) : mapData.PolygonGPS;
                        mapData.Title = obj.SupName;
                        mapData.Icon = !string.IsNullOrEmpty(obj.IconLevel) ? _context.IconManagers.FirstOrDefault(x => x.IconCode == obj.IconLevel)?.IconPath : "/images/map/pinmap_start.png";
                        mapData.UpdatedBy = ESEIM.AppContext.UserName;
                        mapData.UpdatedTime = DateTime.Now;
                        mapData.GisData = obj.GoogleMap;
                        _context.MapDataGpss.Update(mapData);
                    }
                    else
                    {
                        if (!string.IsNullOrEmpty(obj.GoogleMap))
                        {
                            var gps = new MapDataGps
                            {
                                Title = obj.SupName,
                                PolygonGPS = _googleAPIService.ConvertLatLnToMap(obj.GoogleMap),
                                ObjType = EnumHelper<SupplierEnum>.GetDisplayValue(SupplierEnum.Supplier),
                                ObjCode = obj.SupCode,
                                Icon = !string.IsNullOrEmpty(obj.IconLevel) ? _context.IconManagers.FirstOrDefault(x => x.IconCode == obj.IconLevel)?.IconPath : "/images/map/pinmap_start.png",
                                IsActive = true,
                                IsDefault = true,
                                MakerGPS = obj.GoogleMap,
                                GisData = obj.GoogleMap,
                                CreatedTime = DateTime.Now,
                                CreatedBy = ESEIM.AppContext.UserName,
                            };
                            _context.MapDataGpss.Add(gps);
                        }
                    }
                    //update supplier
                    supplier.SupName = obj.SupName;
                    supplier.GoogleMap = obj.GoogleMap;
                    supplier.Address = obj.Address;
                    supplier.TaxCode = obj.TaxCode;
                    supplier.Identification = obj.Identification;
                    supplier.AccountBank = obj.AccountBank;
                    supplier.Area = obj.Area;
                    supplier.SupGroup = obj.SupGroup;
                    supplier.Role = obj.Role;
                    supplier.CusType = obj.CusType;
                    supplier.Status = obj.Status;
                    supplier.Email = obj.Email;
                    supplier.Mobile = obj.Mobile;
                    supplier.Fax = obj.Fax;
                    supplier.Website = obj.Website;
                    supplier.UpdatedBy = ESEIM.AppContext.UserName;
                    supplier.UpdatedTime = DateTime.Now;
                    supplier.Description = obj.Description;
                    supplier.AddressBank = obj.AddressBank;
                    supplier.ListUserView = ESEIM.AppContext.UserId;
                    _context.Suppliers.Update(supplier);
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["SUP_TITLE_SUP"].Value.ToLower());//Cập nhật thành công
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult Delete(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.Suppliers.FirstOrDefault(x => x.SupID == id);
                if (data != null)
                {
                    //Check nhà cung cấp đã được sử dụng trong PO_SUP
                    var chkUsing = _context.PoBuyerHeaders.Any(x => !x.IsDeleted && x.SupCode == data.SupCode);
                    if (chkUsing)
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["SUP_MSG_CAN_NOT_DEL"];
                        return Json(msg);
                    }
                    //Check nhà cung cấp đã được sử dụng trong bảng giữa với dự án
                    var chkUsingSupplier = _context.ProjectCusSups.Any(x => !x.IsDeleted && x.ObjType == "SUPPLIER" && x.ObjCode == data.SupCode);
                    if (chkUsingSupplier)
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["SUP_MSG_CANNOT_DEL_SUPP_IN_PROJ"];
                        return Json(msg);
                    }
                    var chkUsingRequestImpProduct = _context.RequestImpProductDetails.Any(x => !x.IsDeleted && x.SupCode == data.SupCode);
                    if (chkUsingRequestImpProduct)
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["SUP_MSG_CANNOT_DEL_SUP_IN_IMP_RQ"];
                        return Json(msg);
                    }
                    var mapData = _context.MapDataGpss.FirstOrDefault(x => x.ObjCode == data.SupCode && x.MakerGPS == data.GoogleMap && x.ObjType == EnumHelper<SupplierEnum>.GetDisplayValue(SupplierEnum.Supplier));
                    if (mapData != null)
                    {
                        _context.MapDataGpss.Remove(mapData);
                    }
                    data.IsDeleted = true;
                    _context.Suppliers.Update(data);
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer["SUP_TITLE_SUP"].Value.ToLower());
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpGet]
        public object GetItem(int id)
        {
            var supplier = _context.Suppliers.FirstOrDefault(m => m.SupID == id);
            var session = HttpContext.Session;
            session.SetInt32("IdObject", id);
            if (supplier != null)
            {
                supplier.ListUserView += ";" + ESEIM.AppContext.UserId;
                _context.SaveChanges();
            }

            return Json(supplier);
        }

        [HttpGet]
        public object GetItemAdd(string code)
        {
            var a = _context.Suppliers.FirstOrDefault(m => m.SupCode == code);
            return Json(a);
        }

        [HttpGet]
        public object GetCountSuppHome()
        {
            var data = _context.Suppliers.Where(x => !x.IsDeleted);
            return new
            {
                All = data.Count(),
                Pending = data.Where(x => x.Status.Equals("SUPPLIER_ACTIVE")).Count()
            };
        }
        #endregion

        #region File
        public class JTableModelFile : JTableModel
        {
            public string SupplierCode { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string CatCode { get; set; }
        }

        [HttpPost]
        public object JTableFile([FromBody] JTableModelFile jTablePara)
        {
            if (string.IsNullOrEmpty(jTablePara.SupplierCode))
            {
                return JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "Id", "FileName", "FileTypePhysic", "Desc", "Url", "CreatedTime", "UpdatedTime", "ReposName", "TypeFile", "SizeOfFile", "FileID");
            }
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var query = ((from a in _context.EDMSRepoCatFiles.Where(x => x.ObjectCode == jTablePara.SupplierCode && x.ObjectType == EnumHelper<SupplierEnum>.GetDisplayValue(SupplierEnum.Supplier))
                          join b in _context.EDMSFiles on a.FileCode equals b.FileCode
                          join f in _context.EDMSRepositorys on a.ReposCode equals f.ReposCode into f1
                          from f in f1.DefaultIfEmpty()
                          select new
                          {
                              a.Id,
                              b.FileCode,
                              b.FileName,
                              b.FileTypePhysic,
                              b.Desc,
                              b.CreatedTime,
                              b.CloudFileId,
                              TypeFile = "NO_SHARE",
                              ReposName = f != null ? f.ReposName : "",
                              b.FileID,
                              SizeOfFile = b.FileSize.HasValue ? b.FileSize.Value : 0,
                          }).Union(
                  from a in _context.EDMSObjectShareFiles.Where(x => x.ObjectCode == jTablePara.SupplierCode && x.ObjectType == EnumHelper<SupplierEnum>.GetDisplayValue(SupplierEnum.Supplier))
                  join b in _context.EDMSFiles on a.FileCode equals b.FileCode
                  join f in _context.EDMSRepositorys on b.ReposCode equals f.ReposCode into f1
                  from f in f1.DefaultIfEmpty()
                  select new
                  {
                      Id = b.FileID,
                      b.FileCode,
                      b.FileName,
                      b.FileTypePhysic,
                      b.Desc,
                      b.CreatedTime,
                      b.CloudFileId,
                      TypeFile = "SHARE",
                      ReposName = f != null ? f.ReposName : "",
                      b.FileID,
                      SizeOfFile = b.FileSize.HasValue ? b.FileSize.Value : 0,
                  })).AsNoTracking();
            int count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "FileCode", "FileName", "FileTypePhysic", "Desc", "CreatedTime", "CloudFileId", "ReposName", "ReposCode", "TypeFile", "FileID", "SizeOfFile");
            return jdata;
        }

        [HttpPost]
        [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
        [RequestSizeLimit(long.MaxValue)]
        public JsonResult InsertSupplierFile(EDMSRepoCatFileModel obj, IFormFile fileUpload)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var mimeType = fileUpload.ContentType;
                string extension = Path.GetExtension(fileUpload.FileName);
                string urlFile = "";
                string fileId = "";
                string reposCode = "";
                string catCode = "";
                string path = "";
                string folderId = "";
                //Chọn file ngắn gọn
                if (!obj.IsMore)
                {
                    //var suggesstion = GetSuggestionsSupplierFile(obj.SupplierCode);
                    var repoDefault = _context.EDMSRepoDefaultObjects.FirstOrDefault(x => !x.IsDeleted
                            && x.ObjectCode.Equals(obj.SupplierCode) && x.ObjectType.Equals(EnumHelper<ObjectType>.GetDisplayValue(ObjectType.Supplier)));
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
                        msg.Title = "Vui lòng chọn thư mục lưu trữ!";
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
                    var apiTokenService = _context.TokenManagers.FirstOrDefault(x => x.AccountCode == getRepository.Token);
                    var json = apiTokenService.CredentialsJson;
                    var user = apiTokenService.Email;
                    var token = apiTokenService.RefreshToken;
                    fileId = FileExtensions.UploadFileToDrive(json, token, fileUpload.FileName, fileUpload.OpenReadStream(), fileUpload.ContentType, folderId, user);
                }
                var edmsReposCatFile = new EDMSRepoCatFile
                {
                    FileCode = string.Concat("SUPPLIER", Guid.NewGuid().ToString()),
                    ReposCode = reposCode,
                    CatCode = catCode,
                    ObjectCode = obj.SupplierCode,
                    ObjectType = EnumHelper<SupplierEnum>.GetDisplayValue(SupplierEnum.Supplier),
                    Path = path,
                    FolderId = folderId
                };
                _context.EDMSRepoCatFiles.Add(edmsReposCatFile);

                /// created Index lucene
                if (Array.IndexOf(LuceneExtension.fileMimetypes, mimeType) >= 0 && (Array.IndexOf(LuceneExtension.fileExt, extension.ToUpper()) >= 0))
                {
                    if (!extension.ToUpper().Equals(".ZIP") && !extension.ToUpper().Equals(".RAR"))
                    {
                        var moduleObj = (EDMSCatRepoSetting)_upload.GetPathByModule("DB_LUCENE_INDEX").Object;
                        var luceneCategory = _context.EDMSCategorys.FirstOrDefault(x => x.CatCode == moduleObj.CatCode);
                        LuceneExtension.IndexFile(edmsReposCatFile.FileCode, fileUpload, luceneCategory.PathServerPhysic);
                    }
                }

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
                msg.Title = _stringLocalizer["SUP_MSG_ADD_FILE_SUCCESS"];
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateSupplierFile(EDMSRepoCatFileModel obj)
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
                        msg.Title = "Cập nhật thông tin thành công !";
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = "Vui lòng chọn thư mục lưu trữ !";
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Tệp tin không tồn tại hoặc đã bị xóa !";
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
        public JsonResult DeleteSupplierFile(int id)
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
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer[""]);// "Xóa thành công";
                }
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
        public JsonResult GetSupplierFile(int id)
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
                    msg.Title = String.Format(_stringLocalizer["CONTRACT_MSG_FILE_DOES_NOT_EXIST"]);//"Tệp tin không tồn tại!";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = "Có lỗi xảy ra. Xin thử lại!";
            }
            return Json(msg);
        }

        [HttpGet]
        public EDMSRepoCatFile GetSuggestionsSupplierFile(string supplierCode)
        {
            var query = _context.EDMSRepoCatFiles.Where(x => x.ObjectCode == supplierCode && x.ObjectType == EnumHelper<SupplierEnum>.GetDisplayValue(SupplierEnum.Supplier)).MaxBy(x => x.Id);
            return query;
        }

        #endregion

        #region Contract
        public class JTableModelContract : JTableModel
        {
            public int SupplierID { get; set; }
            public string ContractCode { get; set; }
            public string ContractNo { get; set; }
            public string Title { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
        }

        [HttpPost]
        public object JTableContract([FromBody] JTableModelContract jTablePara)
        {
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            decimal? totalContract = 0;

            var supCode = _context.Suppliers.FirstOrDefault(x => x.SupID.Equals(jTablePara.SupplierID))?.SupCode;

            var query = from a in _context.PoBuyerHeaders
                            //join b in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Currency equals b.CodeSet into b1
                            //from b2 in b1.DefaultIfEmpty()
                        where a.IsDeleted == false
                        && a.SupCode.Equals(supCode)
                        && (string.IsNullOrEmpty(jTablePara.ContractCode) || (a.PoSupCode.ToLower().Contains(jTablePara.ContractCode.ToLower())))
                        && (string.IsNullOrEmpty(jTablePara.Title) || (a.PoTitle.ToLower().Contains(jTablePara.Title.ToLower())))
                        && ((((fromDate == null) || (a.CreatedTime.HasValue && a.CreatedTime.Value.Date >= fromDate))
                                && ((toDate == null) || (a.CreatedTime.HasValue && a.CreatedTime.Value.Date <= toDate)))
                            || (((fromDate == null) || (a.DateOfOrder.HasValue && a.DateOfOrder.Value.Date >= fromDate))
                                && ((toDate == null) || (a.DateOfOrder.HasValue && a.DateOfOrder.Value.Date <= toDate))))
                        select new
                        {
                            id = a.Id,
                            code = a.PoSupCode,
                            title = a.PoTitle,
                            dateOfOrder = a.DateOfOrder,
                            createdTime = a.CreatedTime,
                            budget = _context.PoBuyerDetails.Where(x => !x.IsDeleted && x.PoSupCode == a.PoSupCode).Sum(x => x.TotalAmount),
                            currency = (from c in _context.PoBuyerDetails.Where(x => !x.IsDeleted && x.PoSupCode == a.PoSupCode)
                                        join b in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "CURRENCY_TYPE") on c.Currency equals b.CodeSet
                                        select b.ValueSet).FirstOrDefault(),
                        };

            if (query.Any())
                totalContract = query.Sum(x => x.budget);

            var queryRs = from a in query
                          select new
                          {
                              a.id,
                              a.code,
                              a.title,
                              a.dateOfOrder,
                              a.budget,
                              a.createdTime,
                              a.currency,
                              totalContract
                          };

            int count = queryRs.Count();
            var data = queryRs.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "id", "code", "createdTime", "title", "dateOfOrder", "budget", "currency", "totalContract");
            return Json(jdata);
        }
        #endregion

        #region contact
        public class JtableModelContact : JTableModel
        {
            public int? SupplierId { get; set; }
            public string ContactName { get; set; }
            public string ContactEmail { get; set; }
            public string ContactTelephone { get; set; }
            public string ContactMobilePhone { get; set; }
        }

        [HttpPost]
        public object JTableContact([FromBody] JtableModelContact jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            if (jTablePara.SupplierId == null)
            {
                return JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "ContractNoteId", "Title", "ContractCode", "Note", "Tags", "CreatedBy", "CreatedTime");
            }
            var supplierCode = _context.Suppliers.FirstOrDefault(x => x.SupID == jTablePara.SupplierId).SupCode;
            var query = from a in _context.Contacts
                        where a.SuppCode == supplierCode
                        && (string.IsNullOrEmpty(jTablePara.ContactEmail) || (a.Email.ToLower().Contains(jTablePara.ContactEmail)))
                        && (string.IsNullOrEmpty(jTablePara.ContactName) || (a.ContactName.ToLower().Contains(jTablePara.ContactName)))
                        && (string.IsNullOrEmpty(jTablePara.ContactTelephone) || (a.Telephone.ToLower().Contains(jTablePara.ContactTelephone)))
                        && (string.IsNullOrEmpty(jTablePara.ContactMobilePhone) || (a.MobilePhone.ToLower().Contains(jTablePara.ContactMobilePhone)))
                        && a.IsDeleted == false
                        select new
                        {
                            id = a.Id,
                            contactName = a.ContactName,
                            contactEmail = a.Email,
                            contactAddress = a.Address,
                            contactTelephone = a.Telephone,
                            contactMobilePhone = a.MobilePhone,
                        };

            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "id", "contactId", "contactName", "contactEmail", "contactAddress", "contactTelephone", "contactMobilePhone");
            return Json(jdata);
        }

        [HttpPost]
        public object InsertContact([FromBody] Contact obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                if (obj.SuppId == null)
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["SUP_CURD_VALIDATE_COMBO_SUPPLIER"];//Bạn chưa chọn nhà cung cấp
                }
                else
                {
                    var suppCode = _context.Suppliers.FirstOrDefault(x => x.SupID == obj.SuppId)?.SupCode;
                    obj.SuppCode = suppCode;
                    obj.CreateTime = DateTime.Now.Date;
                    _context.Contacts.Add(obj);
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["SUP_CURD_TAB_CONTACT"].Value.ToLower()); //"Thêm thành công";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Object = ex;
            }
            return Json(msg);
        }
        [HttpPost]
        public object UploadImage(IFormFile fileUpload)
        {
            var msg = new JMessage();
            try
            {
                var upload = _upload.UploadImage(fileUpload);
                msg.Error = false;
                msg.Title = "";
                msg.Object = upload.Object;
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_FILE_FAIL"]; //"Có lỗi xảy ra khi upload file!";
                msg.Object = ex;
                return Json(msg);
            }
        }

        [HttpPost]
        public object DeleteContact(int id)
        {
            var msg = new JMessage();
            try
            {
                var data = _context.Contacts.FirstOrDefault(x => x.Id == id);
                data.IsDeleted = true;
                _context.Contacts.Update(data);
                _context.SaveChanges();
                msg.Error = false;
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer["SUP_CURD_TAB_CONTACT"].Value.ToLower());//"Xóa thành công";
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

        [HttpGet]
        public object GetContact(int id)
        {
            var data = _context.Contacts.FirstOrDefault(x => x.Id == id);
            return Json(data);
        }
        [HttpPost]
        public object UpdateContact([FromBody] Contact obj)
        {
            var msg = new JMessage();
            try
            {
                obj.UpdateTime = DateTime.Now.Date;
                _context.Contacts.Update(obj);
                _context.SaveChanges();
                msg.Error = false;
                msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["SUP_CURD_TAB_CONTACT"]);
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

        #region extend
        public class JTableModelExtend : JTableModel
        {
            public int? SupplierId { get; set; }
            public string ExtCode { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
        }

        [HttpPost]
        public object JTableExtend([FromBody] JTableModelExtend jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            int? customerId = jTablePara.SupplierId;
            DateTime? fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            DateTime? toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            var query = from a in _context.SupplierExtends
                        where (a.isdeleted == false && a.supplier_code == customerId)
                         && (string.IsNullOrEmpty(jTablePara.ExtCode) || a.ext_code.ToLower().Contains(jTablePara.ExtCode.ToLower()))
                        && ((fromDate == null) || (a.created_time >= fromDate))
                        && ((toDate == null) || (a.created_time <= toDate))
                        select new
                        {
                            id = a.id,
                            code = a.ext_code,
                            value = a.ext_value,
                            createdTime = a.created_time.Value.ToString("dd/MM/yyyy")
                        };
            int count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "id", "code", "value", "createdTime");

            return Json(jdata);
        }

        [HttpPost]
        public object DeleteExtend(int id)
        {
            var msg = new JMessage();
            try
            {
                var data = _context.SupplierExtends.FirstOrDefault(x => x.id == id);
                data.isdeleted = true;
                _context.SupplierExtends.Update(data);
                _context.SaveChanges();
                msg.Error = false;
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer["SUP_CURD_TAB_MORE"].Value.ToLower());//"Xóa thành công";
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
        public object InsertExtend([FromBody] SupplierExtend obj)
        {
            var msg = new JMessage();
            try
            {
                //var query = from a in _context.SupplierExtends
                //            where a.ext_code == obj.ext_code && 
                //            select a;
                var checkExist = _context.SupplierExtends.FirstOrDefault(x => x.supplier_code == obj.supplier_code && x.ext_code == obj.ext_code && x.isdeleted == false);
                if (checkExist == null)
                {
                    obj.created_time = DateTime.Now.Date;
                    _context.SupplierExtends.Add(obj);
                    _context.SaveChanges();
                    msg.Error = false;
                    msg.Title = string.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["SUP_CURD_TAB_MORE"].Value.ToLower());//"Thêm trường mở rộng thành công!";

                }
                else
                {
                    msg.Error = true;
                    msg.Title = string.Format(_sharedResources["COM_MSG_EXITS"], _stringLocalizer["SUP_CURD_TAB_MORE_CURD_LBL_CODE"]);//"Mã trường mở rộng đã tồn tại!";

                }
                return Json(msg);
            }
            catch
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];

                return Json(msg);
            }

            //try
            //{               
            //    obj.created_time = DateTime.Now.Date;
            //    _context.SupplierExtends.Add(obj);
            //    _context.SaveChanges();
            //    msg.Error = false;
            //    msg.Title = "Thêm thành công";
            //    return Json(msg);
            //}
            //catch (Exception ex)
            //{
            //    msg.Error = true;
            //    msg.Title = "Có lỗi xảy ra!";
            //    msg.Object = ex;
            //    return Json(msg);
            //}
        }

        [HttpGet]
        public object GetExtend(int id)
        {
            var data = _context.SupplierExtends.FirstOrDefault(x => x.id == id);
            return Json(data);
        }

        [HttpPost]
        public object UpdateExtend([FromBody] SupplierExtend obj)
        {
            var msg = new JMessage();
            try
            {
                obj.updated_time = DateTime.Now.Date;
                _context.SupplierExtends.Update(obj);
                _context.SaveChanges();
                msg.Error = false;
                msg.Title = string.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["SUP_CURD_TAB_MORE"].Value.ToLower());// "Cập nhật thành công";
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

        #region CardJob
        public class JTableModelCardJob : JTableModel
        {
            public int? SupplierId { get; set; }
        }
        [HttpPost]
        public object JTableCardJob([FromBody] JTableModelCardJob jtablePara)
        {
            int intBegin = (jtablePara.CurrentPage - 1) * jtablePara.Length;
            if (jtablePara.SupplierId == null)
            {
                var list = new List<object>();
                return JTableHelper.JObjectTable(list, jtablePara.Draw, 0, "Id", "CardCode", "Supplier", "CardName");
            }
            var supplier = _context.Suppliers.FirstOrDefault(x => x.SupID == jtablePara.SupplierId);
            var query = from a in _context.CardMappings
                        join b in _context.WORKOSCards on a.CardCode equals b.CardCode
                        where b.IsDeleted == false && a.SupplierCode.Equals(supplier.SupCode)
                        select b;
            int count = query.Count();
            var data = query.OrderUsingSortExpression(jtablePara.QueryOrderBy).Skip(intBegin).Take(jtablePara.Length).Select(x => new
            {
                x.CardID,
                x.CardCode,
                x.CardName,
                x.BeginTime,
                x.EndTime,
                Status = _context.CommonSettings.FirstOrDefault(y => y.CodeSet == x.Status).ValueSet ?? "",
                x.Completed,
                x.Cost,
                Quantitative = string.Concat(x.Quantitative, _context.CommonSettings.FirstOrDefault(y => y.CodeSet == x.Unit).ValueSet ?? ""),
                ListName = _context.WORKOSLists.FirstOrDefault(y => y.ListCode == x.ListCode && y.IsDeleted == false).ListName ?? "",
                BoardName = _context.WORKOSBoards.FirstOrDefault(y => y.BoardCode == (_context.WORKOSLists.FirstOrDefault(z => z.ListCode == x.ListCode && z.IsDeleted == false).BoardCode ?? "")).BoardName ?? ""
            }).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jtablePara.Draw, count, "CardID", "CardCode", "CardName", "BeginTime", "EndTime", "Status", "Completed", "Cost", "Quantitative", "ListName", "BoardName");
            return Json(jdata);
        }


        //[HttpPost]
        //public JsonResult AddCardRelative([FromBody] dynamic data)
        //{
        //    var msg = new JMessage() { Error = false, Title = "" };
        //    try
        //    {
        //        int supplierId = data.SupplierId.Value != null ? Convert.ToInt32(data.SupplierId.Value) : 0;
        //        string cardCode = data.CardCode.Value;
        //        string supplierCode = _context.Suppliers.FirstOrDefault(x => x.SupID == supplierId).SupCode;
        //        if (_context.CardForWObjs.Where(x => x.ObjCode.Equals(supplierCode) && x.CatObjCode.Equals("SUPPLIER") && x.CardCode.Equals(cardCode) && x.IsDeleted == false).Count() > 0)
        //        {
        //            msg.Title = "Nhà cung cấp đã tồn tại";
        //            msg.Error = true;
        //            return Json(msg);
        //        }
        //        var card = _context.WORKOSCards.FirstOrDefault(x => x.CardCode == cardCode);
        //        var list = _context.WORKOSLists.FirstOrDefault(x => x.ListCode == card.ListCode);
        //        var board = _context.WORKOSBoards.FirstOrDefault(x => x.BoardCode == list.BoardCode);
        //        var obj = new CardMapping
        //        {
        //            BoardCode = board.BoardCode,
        //            ListCode = card.ListCode,
        //            CardCode = cardCode,
        //            SupplierCode = supplierCode,
        //            Relative = _context.CommonSettings.FirstOrDefault(x => x.Group == EnumHelper<CardEnum>.GetDisplayValue(CardEnum.ObjRelative))?.CodeSet,
        //            CreatedBy = ESEIM.AppContext.UserName,
        //            CreatedTime = DateTime.Now
        //        };
        //        _context.CardMappings.Add(obj);
        //        _context.SaveChanges();
        //        msg.Title = "Thêm thành công";
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Object = ex.Message;
        //        msg.Title = "Có lỗi xảy ra!";
        //    }
        //    return Json(msg);
        //}
        #endregion

        #region Setup defaut file
        [HttpPost]
        public JsonResult SetupDefaultRepoObject(string objectCode, string objectType, int? cateRepoSettingId)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var setting = _context.EDMSCatRepoSettings.FirstOrDefault(x => x.Id == cateRepoSettingId);
                var repoDefault = _context.EDMSRepoDefaultObjects.FirstOrDefault(x => !x.IsDeleted && x.ObjectCode.Equals(objectCode) && x.ObjectType.Equals(objectType));
                if (repoDefault != null)
                {
                    if (setting != null)
                    {
                        repoDefault.ReposCode = setting.ReposCode;
                        repoDefault.CatRepoSettingId = cateRepoSettingId;
                        repoDefault.CatCode = setting.CatCode;
                        repoDefault.Path = setting.Path;
                        repoDefault.FolderId = setting.FolderId;
                        repoDefault.UpdatedBy = ESEIM.AppContext.UserName;
                        repoDefault.UpdatedTime = DateTime.Now;
                        _context.EDMSRepoDefaultObjects.Update(repoDefault);
                        msg.Title = _stringLocalizer["SUP_MSG_UPDATE_FOLDER_DEFAULT_SUCCESS"];
                        _context.SaveChanges();
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["SUP_MSG_PLS_SELECT_FOLDER"];
                        return Json(msg);
                    }
                }
                else
                {
                    if (setting != null)
                    {
                        var setUp = new EDMSRepoDefaultObject
                        {
                            CatCode = setting.CatCode,
                            ReposCode = setting.ReposCode,
                            FolderId = setting.FolderId,
                            Path = setting.Path,
                            ObjectCode = objectCode,
                            ObjectType = objectType,
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now,
                            CatRepoSettingId = cateRepoSettingId
                        };
                        _context.EDMSRepoDefaultObjects.Add(setUp);
                        msg.Title = _stringLocalizer["SUP_MSG_SETUP_DEFAULT_FOLDER_SUCCESS"];
                        _context.SaveChanges();
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["SUP_PLS_SELECT_FORDER_SAVE"];
                        return Json(msg);
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetDefaultRepo(string objectCode, string objectType)
        {
            var data = _context.EDMSRepoDefaultObjects.FirstOrDefault(x => !x.IsDeleted && x.ObjectCode.Equals(objectCode) && x.ObjectType.Equals(objectType));
            return Json(data);
        }

        #endregion
        
        #region Appointment
        public class EdmsSupplierTabAppointment
        {
            public int? Id { get; set; }
            public string SupplierCode { get; set; }
            public string Title { get; set; }
            public string ToDate { get; set; }
            public string FromDate { get; set; }
            public string Location { get; set; }
            public string RepeatType { get; set; }
            public string Note { get; set; }
        }
        [AllowAnonymous]
        [HttpPost]
        public object JTableSupplierAppointment([FromBody] JTableModelAppointmentSupp jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            if (jTablePara.SupplierCode == null)
            {
                var list = new List<object>();
                return JTableHelper.JObjectTable(list, jTablePara.Draw, 0, "Id", "Title", "ToDate", "FromDate", "Location", "RepeatType", "Note");
            }
            var query = from a in _context.SupplierAppointments
                        join b in _context.Users on a.CreatedBy equals b.UserName into b1
                        from b in b1.DefaultIfEmpty()
                        where !a.IsDeleted
                        && (string.IsNullOrEmpty(jTablePara.Tags) || (a.Tags.ToLower().Contains(jTablePara.Tags.ToLower())))
                        && (string.IsNullOrEmpty(jTablePara.Title) || a.Title.ToLower().Contains(jTablePara.Title.ToLower()))
                        && (a.SupplierCode == jTablePara.SupplierCode)
                        select new
                        {
                            a.Id,
                            a.Title,
                            a.Note,
                            a.FromDate,
                            a.ToDate,
                            a.Location,
                            a.RepeatType,
                            Name = b != null ? string.Join(" ", b.GivenName) : null,
                            a.CreatedBy,
                            a.CreatedTime
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "Title", "ToDate", "FromDate", "Location", "RepeatType", "Note");
            return Json(jdata);
        }

        [AllowAnonymous]
        [HttpPost]
        public JsonResult InsertSupplierTabAppointment([FromBody] EdmsSupplierTabAppointment obj)
        {
            var msg = new JMessage { Error = false };
            try
            {
                var project = _context.Suppliers.FirstOrDefault(x => x.SupCode == obj.SupplierCode);
                var fromDate = !string.IsNullOrEmpty(obj.FromDate) ? DateTime.ParseExact(obj.FromDate, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture) : (DateTime?)null;
                var toDate = !string.IsNullOrEmpty(obj.ToDate) ? DateTime.ParseExact(obj.ToDate, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture) : (DateTime?)null;
                var data = new SupplierAppointment
                {
                    SupplierCode = project.SupCode,
                    Title = obj.Title,
                    //Tags = obj.Tags,
                    FromDate = fromDate,
                    ToDate = toDate,
                    Location = obj.Location,
                    RepeatType = obj.RepeatType,
                    Note = obj.Note,
                    //SupplierVersion = project.Version,
                    CreatedBy = AppContext.UserName,
                    CreatedTime = DateTime.Now,
                    IsDeleted = false
                };
                _context.SupplierAppointments.Add(data);
                _context.SaveChanges();
                msg.Title = String.Format(_stringLocalizerPj["Thêm sự kiện thành công"]);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizerPj["Lỗi khi thêm sự kiện"]);
                msg.Object = ex;
            }
            return Json(msg);
        }

        [AllowAnonymous]
        [HttpPost]
        public JsonResult UpdateSupplierTabAppointment([FromBody] EdmsSupplierTabAppointment obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.SupplierAppointments.FirstOrDefault(x => x.Id == obj.Id);
                var fromDate = !string.IsNullOrEmpty(obj.FromDate) ? DateTime.ParseExact(obj.FromDate, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture) : (DateTime?)null;
                var toDate = !string.IsNullOrEmpty(obj.ToDate) ? DateTime.ParseExact(obj.ToDate, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture) : (DateTime?)null;
                if (data != null)
                {
                    data.Title = obj.Title;
                    data.ToDate = toDate;
                    data.FromDate = fromDate;
                    data.Location = obj.Location;
                    data.RepeatType = obj.RepeatType;
                    data.Note = obj.Note;
                    data.UpdatedBy = AppContext.UserName;
                    data.UpdatedTime = DateTime.Now;
                    _context.SupplierAppointments.Update(data);
                }
                _context.SaveChanges();
                msg.Title = String.Format(_stringLocalizerPj["Cập nhật sự kiện thành công"]);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizerPj["Lỗi khi cập nhật sự kiện"]);
                msg.Object = ex;
            }
            return Json(msg);
        }

        [AllowAnonymous]
        [HttpPost]
        public JsonResult DeleteSupplierTabAppointment(int id)
        {
            var msg = new JMessage();
            try
            {
                var data = _context.SupplierAppointments.FirstOrDefault(x => x.Id == id);
                if (data != null)
                {
                    data.IsDeleted = true;
                    data.DeletedBy = AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    _context.SupplierAppointments.Update(data);
                }
                _context.SaveChanges();
                msg.Error = false;
                msg.Title = String.Format(_stringLocalizerPj["Xóa sự kiện thành công"]);
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizerPj["Lỗi khi xóa sự kiện"]);
                msg.Object = ex;
                return Json(msg);
            }

        }

        [AllowAnonymous]
        [HttpGet]
        public JsonResult GetAppointment(int id)
        {
            var data = _context.SupplierAppointments.FirstOrDefault(x => x.Id == id);
            return Json(data);
        }
        [AllowAnonymous]
        [HttpGet]
        public JsonResult GetAllEvent(string supplierCode)
        {
            var session = HttpContext.GetSessionUser();
            var listData = new List<Object>();
            var today = DateTime.Now.Date;
            var events = (from a in _context.SupplierAppointments.Where(x => !x.IsDeleted)
                              //join b in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Status equals b.CodeSet
                              //join c in _context.ZoomManages.Where(x => !x.IsDeleted) on a.MeetingId equals c.Id into c1
                              //from c in c1.DefaultIfEmpty()
                          where a.SupplierCode == supplierCode && a.FromDate.HasValue && a.ToDate.HasValue
                          select new
                          {
                              a.Id,
                              a.Title,
                              a.Note,
                              a.FromDate,
                              a.ToDate,
                              a.Location,
                              a.RepeatType,
                              //Color = a.FromDate.Value.Date >= today ? a.BackgroundColor : "#f1f1f1",
                              IsInFuture = a.FromDate.Value.Date >= today,
                              //Status = b.ValueSet,
                              //StatusCode = a.Status,
                              //MeetingId = c != null ? c.ZoomId : "",
                              //a.AccountZoom,
                              //a.JsonData,
                          }).OrderByDescending(x => x.ToDate);

            foreach (var item in events)
            {
                var className = item.IsInFuture ? "fc-event-event-custom" : "fc-black";
                var allowJoin = true;

                var obj = new
                {
                    item.Id,
                    item.Title,
                    item.FromDate.Value.Date,
                    sStartTime = item.FromDate.Value.ToString("HH:mm"),
                    sEndTime = item.ToDate.Value.ToString("HH:mm"),
                    item.Note,
                    item.FromDate,
                    item.ToDate,
                    item.Location,
                    item.RepeatType,
                    IsAllData = session.IsAllData || session.RoleCode.Equals("GIAMDOC"),
                    ClassName = className,
                };

                listData.Add(obj);
            }

            return Json(listData);
        }
        #endregion
        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_stringLocalizerCus.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_cardJobController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerFp.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerPj.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerFile.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_edmsRepositoryController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .DistinctBy(x => x.Name);
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion
    }

    public class JTableModelAppointmentSupp : JTableModel
    {
        //old index
        public string SupplierCode { get; set; }

        //tag
        public string Title { get; set; }
        public string Tags { get; set; }
    }
}