using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using ESEIM;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using III.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Options;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;
using AppContext = ESEIM.AppContext;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class CustomerController : BaseController
    {

        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IGoogleApiService _googleAPIService;
        private readonly IGoogleApiService _googleAPI;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly AppSettings _appSettings;
        private static AsyncLocker<string> userLock = new AsyncLocker<string>();
        private readonly IStringLocalizer<CustomerController> _stringLocalizer;
        private readonly IStringLocalizer<ProjectController> _stringLocalizerPj;
        private readonly IStringLocalizer<CardJobController> _cardJobController;
        private readonly IStringLocalizer<FilePluginController> _stringLocalizerFp;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IStringLocalizer<FileObjectShareController> _fileObjectShareController;
        private readonly IStringLocalizer<EDMSRepositoryController> _edmsRepositoryController;
        public CustomerController(EIMDBContext context, IUploadService upload, IGoogleApiService googleAPIService,
            IHostingEnvironment hostingEnvironment, IOptions<AppSettings> appSettings, IGoogleApiService googleAPI,
            IStringLocalizer<FilePluginController> stringLocalizerFp, IStringLocalizer<ProjectController> stringLocalizerPj, 
            IStringLocalizer<CustomerController> stringLocalizer, IStringLocalizer<CardJobController> cardJobController,
            IStringLocalizer<SharedResources> sharedResources, IStringLocalizer<FileObjectShareController> fileObjectShareController,
            IStringLocalizer<EDMSRepositoryController> edmsRepositoryController)
        {
            _context = context;
            _upload = upload;
            _hostingEnvironment = hostingEnvironment;
            _appSettings = appSettings.Value;
            _googleAPIService = googleAPIService;
            _stringLocalizerFp = stringLocalizerFp;
            _stringLocalizer = stringLocalizer;
            _cardJobController = cardJobController;
            _sharedResources = sharedResources;
            _fileObjectShareController = fileObjectShareController;
            _edmsRepositoryController = edmsRepositoryController;
            _stringLocalizerPj = stringLocalizerPj;
            _googleAPI = googleAPI;
        }
        [Breadcrumb("ViewData.CrumbCus", AreaName = "Admin", FromAction = "Index", FromController = typeof(CustomerHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbCusHome"] = _sharedResources["COM_CRUMB_CUSTOMER"];
            ViewData["CrumbCus"] = _sharedResources["COM_CRUMB_CUSTOMER"];
            return View();
        }

        #region Index

        [HttpPost]
        public object JTable([FromBody] JTableModelCustomer jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.Customerss
                        where (a.IsDeleted == false)
                            && (string.IsNullOrEmpty(jTablePara.CustomerCode) || a.CusCode.ToLower().Contains(jTablePara.CustomerCode.ToLower()))
                            && (string.IsNullOrEmpty(jTablePara.CustomerName) || a.CusName.ToLower().Contains(jTablePara.CustomerName.ToLower()))
                            && (string.IsNullOrEmpty(jTablePara.CustomerEmail) || a.Email.ToLower().Contains(jTablePara.CustomerEmail.ToLower()))
                            && (string.IsNullOrEmpty(jTablePara.CustomerPhone) || a.MobilePhone.ToLower().Contains(jTablePara.CustomerPhone.ToLower()))
                            && (string.IsNullOrEmpty(jTablePara.CustomerActivityStatus) || a.ActivityStatus == jTablePara.CustomerActivityStatus)
                            && (string.IsNullOrEmpty(jTablePara.CustomerGroup) || a.CusGroup.ToLower() == jTablePara.CustomerGroup.ToLower())
                            && (string.IsNullOrEmpty(jTablePara.Address) || a.Address.ToLower().Contains(jTablePara.Address.ToLower()))
                        select a;
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).Select(x => new
            {
                x.CusID,
                Code = x.CusCode,
                Name = x.CusName,
                x.Email,
                x.Address,
                x.MobilePhone,
                CusGroup = _context.CommonSettings.FirstOrDefault(y => y.CodeSet == x.CusGroup).ValueSet ?? "Không xác định",
                CusActivity = _context.CommonSettings.FirstOrDefault(y => y.CodeSet == x.ActivityStatus).ValueSet ?? "Không xác định",
            }).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "CusID", "Code", "Name", "CusEmail", "CusAddress", "MobilePhone", "CusGroup", "CusActivity");
            return Json(jdata);
        }

        [HttpPost]
        public async Task<JsonResult> Insert([FromBody] Customers obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                using (await userLock.LockAsync(obj.CusCode.ToLower()))
                {
                    var checkExist = await _context.Customerss.FirstOrDefaultAsync(x => !x.IsDeleted && x.CusCode.ToLower() == obj.CusCode.ToLower());
                    if (checkExist == null)
                    {
                        obj.CreatedBy = ESEIM.AppContext.UserName;
                        obj.CreatedTime = DateTime.Now;
                        obj.ListUserView = ";" + ESEIM.AppContext.UserId;
                        _context.Customerss.Add(obj);
                        if (!string.IsNullOrEmpty(obj.GoogleMap))
                        {
                            var gps = new MapDataGps
                            {
                                Title = obj.CusName,
                                PolygonGPS = _googleAPIService.ConvertLatLnToMap(obj.GoogleMap),
                                ObjType = EnumHelper<CustomerEnum>.GetDisplayValue(CustomerEnum.Customer),
                                ObjCode = obj.CusCode,
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
                        msg.Object = obj.CusID;
                        msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["CUS_TITLE_CUS"].Value.ToLower());//Thêm khách hàng thành công
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = String.Format(_sharedResources["COM_MSG_EXITS"], _stringLocalizer["CUS_CURD_LBL_CUS_CUSCODE"]);//mã khách hàng đã tồn tai
                    }
                }
            }
            catch
            {
                msg.Error = true;
                //msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];// Có lỗi xảy ra khi thêm khách hàng
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Update([FromBody] Customers obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var customer = _context.Customerss.FirstOrDefault(x => x.CusCode == obj.CusCode && x.IsDeleted == false);
                if (customer != null)
                {
                    var mapData = _context.MapDataGpss.FirstOrDefault(x => x.ObjCode == obj.CusCode && x.IsDefault == true && x.ObjType == EnumHelper<CustomerEnum>.GetDisplayValue(CustomerEnum.Customer));
                    if (mapData != null)
                    {
                        mapData.MakerGPS = obj.GoogleMap;
                        if (!string.IsNullOrEmpty(obj.GoogleMap))
                        {
                            mapData.PolygonGPS = mapData.PolygonGPS != obj.GoogleMap ? _googleAPIService.ConvertLatLnToMap(obj.GoogleMap) : mapData.PolygonGPS; 
                        }
                        mapData.Title = obj.CusName;
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
                                Title = obj.CusName,
                                PolygonGPS = _googleAPIService.ConvertLatLnToMap(obj.GoogleMap),
                                ObjType = EnumHelper<CustomerEnum>.GetDisplayValue(CustomerEnum.Customer),
                                ObjCode = obj.CusCode,
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
                    //update customer
                    customer.CusName = obj.CusName;
                    customer.PersonInCharge = obj.PersonInCharge;
                    customer.GoogleMap = obj.GoogleMap;
                    customer.Address = obj.Address;
                    customer.TaxCode = obj.TaxCode;
                    customer.Identification = obj.Identification;
                    customer.Fax = obj.Fax;
                    customer.IconLevel = obj.IconLevel;
                    customer.Area = obj.Area;
                    customer.CusGroup = obj.CusGroup;
                    customer.Role = obj.Role;
                    customer.CusType = obj.CusType;
                    customer.ActivityStatus = obj.ActivityStatus;
                    customer.Email = obj.Email;
                    customer.MobilePhone = obj.MobilePhone;
                    customer.AccountBank = obj.AccountBank;
                    customer.AddressBank = obj.AddressBank;
                    customer.ZipCode = obj.ZipCode;
                    customer.Description = obj.Description;
                    customer.UpdatedBy = User.Identity.Name;
                    customer.UpdatedTime = DateTime.Now;
                    customer.ListUserView = ";" + ESEIM.AppContext.UserId;
                    _context.Customerss.Update(customer);
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["CUS_TITLE_CUS"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = _sharedResources["COM_MSG_ERR"];// Có lỗi xảy ra khi thêm khách hàng
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Delete(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.Customerss.FirstOrDefault(x => x.CusID == id);
                if (data != null)
                {
                    //Check khách hàng đã được sử dụng trong PO_CUS
                    var chkUsing = _context.PoSaleHeaders.Any(x => !x.IsDeleted && x.CusCode == data.CusCode);
                    if (chkUsing)
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["CUS_TITLE_DELETE_CUS_CONTRACT"];
                        return Json(msg);
                    }
                    //Check khách hàng đã được sử dụng trong bảng giữa với dự án
                    var chkUsingProject = _context.ProjectCusSups.Any(x => !x.IsDeleted && x.ObjType == "CUSTOMER" && x.ObjCode == data.CusCode);
                    if (chkUsingProject)
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["CUS_TITLE_DELETE_CUS_PROJECT"];
                        return Json(msg);
                    }

                    //Check khách hàng đã được sử dụng trong Kế hoạch thị trường
                    var isHasSettingRoute = _context.VcSettingRoutes.Any(x => !x.IsDeleted && x.Node == data.CusCode);
                    if (isHasSettingRoute)
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["CUS_CURD_VALIDATE_DELETE"];
                        return Json(msg);
                    }

                    var mapData = _context.MapDataGpss.FirstOrDefault(x => x.ObjCode == data.CusCode && x.MakerGPS == data.GoogleMap && x.ObjType == EnumHelper<CustomerEnum>.GetDisplayValue(CustomerEnum.Customer));
                    if (mapData != null)
                    {
                        _context.MapDataGpss.Remove(mapData);
                    }
                    data.IsDeleted = true;
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    _context.Customerss.Update(data);
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer["CUS_TITLE_CUS"]);
                }
            }
            catch
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_FAIL"], _stringLocalizer["CUS_CURD_LBL_CUS_CUSCODE"]);
            }
            return Json(msg);
        }

        [HttpGet]
        public object GetItem(int id)
        {
            var session = HttpContext.Session;
            session.SetInt32("IdObject", id);
            var data = _context.Customerss.AsNoTracking().Single(m => m.CusID == id);
            data.ListUserView += ";" + ESEIM.AppContext.UserId;
            _context.SaveChanges();
            return Json(data);
        }

        [HttpGet]
        public async Task<JsonResult> GetInfoWithTaxCode(string taxCode)
        {
            return Json(await EnterpriseExtension.GetDetailCompany(_appSettings.UrlEnterprise, taxCode));
        }

        #region Combobox
        [HttpPost]
        public object GetCustomerGroup()
        {
            var data = _context.CommonSettings.Where(x => x.Group == EnumHelper<CustomerEnum>.GetDisplayValue(CustomerEnum.CustomerGroup)).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return data;
        }

        [HttpPost]
        public object GetCustomerStatus()
        {
            var data = _context.CommonSettings.Where(x => x.Group == EnumHelper<CustomerEnum>.GetDisplayValue(CustomerEnum.CustomerStatus)).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return data;
        }

        [HttpPost]
        public JsonResult GetListArea()
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
        public JsonResult GetListCutomerType()
        {
            var msg = new JMessage() { Error = false };

            var data = from a in _context.CommonSettings
                       where a.Group == EnumHelper<CustomerEnum>.GetDisplayValue(CustomerEnum.CustomerType) && a.IsDeleted == false
                       select new
                       {
                           Code = a.CodeSet,
                           Name = a.ValueSet,
                       };
            msg.Object = data;

            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetListCutomerRole()
        {
            var msg = new JMessage() { Error = false };

            var data = from a in _context.CommonSettings
                       where a.Group == EnumHelper<CustomerEnum>.GetDisplayValue(CustomerEnum.CustomerRole) && a.IsDeleted == false
                       select new
                       {
                           Code = a.CodeSet,
                           Name = a.ValueSet,
                       };
            msg.Object = data;

            return Json(msg);
        }

        [HttpGet]
        public object GetCountCustomer()
        {
            var data = _context.Customerss.Where(x => !x.IsDeleted);
            return new
            {
                All = data.Count(),
                Pending = data.Where(x => x.ActivityStatus.Equals("CUSTOMER_ACTIVE")).Count()
            };
        }
        #endregion

        #endregion

        #region Contact
        public class JtableModelContact : JTableModel
        {
            public int? CustomerId { get; set; }
            public string ContactName { get; set; }
            public string ContactEmail { get; set; }
            public string ContactTelephone { get; set; }
            public string ContactMobilePhone { get; set; }
        }

        [HttpPost]
        public object JTableContact([FromBody] JtableModelContact jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            if (jTablePara.CustomerId == null)
            {
                return JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "id", "contactName", "contactEmail", "contactAddress", "contactTelephone", "contactMobilePhone");
            }
            var cusCode = _context.Customerss.FirstOrDefault(x => x.CusID == jTablePara.CustomerId).CusCode;
            var query = from a in _context.Contacts
                        where a.CusCode == cusCode && a.IsDeleted == false
                        && (string.IsNullOrEmpty(jTablePara.ContactEmail) || (a.Email.ToLower().Contains(jTablePara.ContactEmail)))
                        && (string.IsNullOrEmpty(jTablePara.ContactName) || (a.ContactName.ToLower().Contains(jTablePara.ContactName)))
                        && (string.IsNullOrEmpty(jTablePara.ContactTelephone) || (a.Telephone.ToLower().Contains(jTablePara.ContactTelephone)))
                        && (string.IsNullOrEmpty(jTablePara.ContactMobilePhone) || (a.MobilePhone.ToLower().Contains(jTablePara.ContactMobilePhone)))
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
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "id", "contactName", "contactEmail", "contactAddress", "contactTelephone", "contactMobilePhone");

            return Json(jdata);
        }

        [HttpPost]
        public JsonResult InsertContact([FromBody] Contact obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                if (obj.CusId == null)
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["CUS_CURD_TAB_CONTRACT_CHECK_COMB_CUSTOMER"];
                }
                else
                {
                    var cusCode = _context.Customerss.FirstOrDefault(x => x.CusID == obj.CusId)?.CusCode;
                    obj.CusCode = cusCode;
                    obj.CreateTime = DateTime.Now;
                    _context.Contacts.Add(obj);
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["CUS_CURD_TAB_CONTACT"]);
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
        public JsonResult UpdateContact([FromBody] Contact obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                obj.UpdateTime = DateTime.Now.Date;
                _context.Contacts.Update(obj);
                _context.SaveChanges();
                msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["CUS_CURD_TAB_CONTACT"]);
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
        public JsonResult DeleteContact(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.Contacts.FirstOrDefault(x => x.Id == id);
                data.IsDeleted = true;
                _context.Contacts.Update(data);
                _context.SaveChanges();
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer["CUS_CURD_TAB_CONTACT"]);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Object = ex;
            }
            return Json(msg);
        }

        [HttpGet]
        public JsonResult GetItemAdd(string code)
        {
            var a = _context.Customerss.FirstOrDefault(m => m.CusCode == code);
            return Json(a);
        }

        [HttpGet]
        public object GetContact(int id)
        {
            var data = _context.Contacts.FirstOrDefault(x => x.Id == id);
            return Json(data);
        }

        [HttpPost]
        public JsonResult UploadImage(IFormFile fileUpload)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var upload = _upload.UploadImage(fileUpload);
                msg.Error = false;
                msg.Title = "";
                msg.Object = upload.Object;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_ERR_UPLOAD_IMAGE"];
                msg.Object = ex;
            }
            return Json(msg);
        }
        #endregion

        #region File
        public class JTableModelFile : JTableModel
        {
            public string CustomerCode { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string CatCode { get; set; }
        }

        [HttpPost]
        public object JTableFile([FromBody] JTableModelFile jTablePara)
        {
            if (string.IsNullOrEmpty(jTablePara.CustomerCode))
            {
                return JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "Id", "FileName", "FileTypePhysic", "Desc", "Url", "CreatedTime", "UpdatedTime", "ReposName", "TypeFile", "SizeOfFile", "FileID");
            }
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var query = ((from a in _context.EDMSRepoCatFiles.Where(x => x.ObjectCode == jTablePara.CustomerCode && x.ObjectType == EnumHelper<CustomerEnum>.GetDisplayValue(CustomerEnum.Customer))
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
                  from a in _context.EDMSObjectShareFiles.Where(x => x.ObjectCode == jTablePara.CustomerCode && x.ObjectType == EnumHelper<CustomerEnum>.GetDisplayValue(CustomerEnum.Customer))
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
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "FileCode", "FileName", "FileTypePhysic", "Desc", "CreatedTime", "CloudFileId", "ReposName", "TypeFile", "FileID", "SizeOfFile");
            return jdata;
        }

        [HttpPost]
        [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
        [RequestSizeLimit(long.MaxValue)]
        public JsonResult InsertCustomerFile(EDMSRepoCatFileModel obj, IFormFile fileUpload)
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
                    var repoDefault = _context.EDMSRepoDefaultObjects.FirstOrDefault(x => !x.IsDeleted
                            && x.ObjectCode.Equals(obj.CustomerCode) && x.ObjectType.Equals(EnumHelper<ObjectType>.GetDisplayValue(ObjectType.Customer)));
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
                        msg.Title = _stringLocalizer["CUS_ERROR_CHOOSE_FILE"];
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
                    FileCode = string.Concat("CUSTOMER", Guid.NewGuid().ToString()),
                    ReposCode = reposCode,
                    CatCode = catCode,
                    ObjectCode = obj.CustomerCode,
                    ObjectType = EnumHelper<CustomerEnum>.GetDisplayValue(CustomerEnum.Customer),
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
                msg.Title = _stringLocalizer["CUS_TITLE_ADD_FILE_SUCCESS"];
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = _stringLocalizer["CUS_TITLE_ERROR_TRYON"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateCustomerFile(EDMSRepoCatFileModel obj)
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
                        msg.Title = _stringLocalizer["CUS_TITLE_UPDATE_INFO_SUCCESS"];
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["CUS_ERROR_CHOOSE_FILE"];
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["CUS_TITLE_FILE_NOT_EXIST"];
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
        public JsonResult DeleteCustomerFile(int id)
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
        public JsonResult GetCustomerFile(int id)
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
                msg.Title = _stringLocalizer["CUS_TITLE_ERROR_TRYON"];
            }
            return Json(msg);
        }

        [HttpGet]
        public EDMSRepoCatFile GetSuggestionsCustomerFile(string customerCode)
        {
            var query = _context.EDMSRepoCatFiles.Where(x => x.ObjectCode == customerCode && x.ObjectType == EnumHelper<CustomerEnum>.GetDisplayValue(CustomerEnum.Customer)).MaxBy(x => x.Id);
            return query;
        }

        //public JsonResult UpdateFile(EDMSRepoCatFileModel obj, IFormFile fileUpload)
        //{
        //    var msg = new JMessage { Error = false, Title = "" };
        //    var result = new JMessage();
        //    var item = _context.EDMSRepoCatFiles.FirstOrDefault(x => x.FileCode == obj.FileCode);
        //    if (item != null)
        //    {
        //        if (!string.IsNullOrEmpty(item.Path))
        //        {
        //            var newSetting = _context.EDMSCatRepoSettings.FirstOrDefault(x => x.Id == obj.CateRepoSettingId);
        //            if (newSetting != null)
        //            {
        //                var oldRespo = _context.EDMSRepositorys.FirstOrDefault(x => x.IsDeleted == false && x.ReposCode == item.ReposCode);
        //                var newRespo = _context.EDMSRepositorys.FirstOrDefault(x => x.IsDeleted == false && x.ReposCode == newSetting.ReposCode);
        //                if (oldRespo != null && newRespo != null)
        //                {
        //                    if (oldRespo.ReposName != newRespo.ReposName || item.Path != newSetting.Path || fileUpload != null)
        //                    {
        //                        if (oldRespo.Type == "SERVER")
        //                        {
        //                            result = MoveFileFromServer(item, fileUpload, obj, newSetting, oldRespo, newRespo);
        //                            return Json(result);
        //                        }
        //                        else
        //                        {
        //                            result = MoveFileFromDriver(item, fileUpload, obj, newSetting, oldRespo, newRespo);
        //                            return Json(result);
        //                        }
        //                    }
        //                    else
        //                    {
        //                        var itemFile = _context.EDMSFiles.FirstOrDefault(x => x.FileCode == obj.FileCode);
        //                        itemFile.Desc = obj.Desc;
        //                        itemFile.Tags = obj.Tags;
        //                        itemFile.NumberDocument = obj.NumberDocument;
        //                        _context.EDMSFiles.Update(itemFile);
        //                        _context.SaveChanges();
        //                        msg.Error = false;
        //                        msg.Title = "Cập nhật thông tin thành công!";
        //                    }
        //                }
        //                else
        //                {
        //                    msg.Error = true;
        //                    msg.Title = "Không tìm thấy thông tin server mới, vui lòng kiểm tra lại!";
        //                }
        //            }
        //            else
        //            {
        //                msg.Error = true;
        //                msg.Title = "Vui lòng chọn thư mục lưu trữ!";
        //            }
        //        }
        //        else
        //        {
        //            var newSetting = _context.EDMSCatRepoSettings.FirstOrDefault(x => x.Id == obj.CateRepoSettingId);
        //            if (newSetting != null)
        //            {
        //                var oldRespo = _context.EDMSRepositorys.FirstOrDefault(x => x.IsDeleted == false && x.ReposCode == item.ReposCode);
        //                var newRespo = _context.EDMSRepositorys.FirstOrDefault(x => x.IsDeleted == false && x.ReposCode == newSetting.ReposCode);
        //                if (oldRespo != null && newRespo != null)
        //                {
        //                    if (oldRespo.ReposName != newRespo.ReposName || item.FolderId != newSetting.FolderId || fileUpload != null)
        //                    {
        //                        result = MoveFileFromDriver(item, fileUpload, obj, newSetting, oldRespo, newRespo);
        //                        return Json(result);
        //                    }
        //                    else
        //                    {
        //                        var itemFile = _context.EDMSFiles.FirstOrDefault(x => x.FileCode == obj.FileCode);
        //                        itemFile.Desc = obj.Desc;
        //                        itemFile.Tags = obj.Tags;
        //                        itemFile.NumberDocument = obj.NumberDocument;
        //                        _context.EDMSFiles.Update(itemFile);
        //                        _context.SaveChanges();
        //                        msg.Error = false;
        //                        msg.Title = "Cập nhật thông tin thành công!";
        //                    }
        //                }
        //                else
        //                {
        //                    msg.Error = true;
        //                    msg.Title = "Không tìm thấy thông tin server mới, vui lòng kiểm tra lại!";
        //                }
        //            }
        //            else
        //            {
        //                msg.Error = true;
        //                msg.Title = "Vui lòng chọn thư mục lưu trữ!";
        //            }
        //        }
        //    }
        //    else
        //    {
        //        msg.Error = true;
        //        msg.Title = "Tệp tin không tồn tại hoặc đã bị xóa!";
        //    }
        //    return Json(msg);
        //}
        //[NonAction]
        //public JMessage InsertCustomerFileRaw(EDMSRepoCatFileModel obj, IFormFile fileUpload, bool fromServer = true)
        //{
        //    var msg = new JMessage() { Error = false, Title = "" };
        //    try
        //    {
        //        var mimeType = fileUpload.ContentType;
        //        string extension = Path.GetExtension(fileUpload.FileName);
        //        string urlFile = "";
        //        string fileId = "";
        //        if (Array.IndexOf(LuceneExtension.fileMimetypes, mimeType) >= 0 && (Array.IndexOf(LuceneExtension.fileExt, extension.ToUpper()) >= 0))
        //        {
        //            string reposCode = "";
        //            string catCode = "";
        //            string path = "";
        //            string folderId = "";
        //            if (obj.IsMore)
        //            {
        //                var suggesstion = GetSuggestionsCustomerFile(obj.ContractCode);
        //                if (suggesstion != null)
        //                {
        //                    reposCode = suggesstion.ReposCode;
        //                    path = suggesstion.Path;
        //                    folderId = suggesstion.FolderId;
        //                    catCode = suggesstion.CatCode;
        //                }
        //                else
        //                {
        //                    msg.Error = true;
        //                    msg.Title = "Vui lòng nhập thuộc tính mở rộng!";
        //                    return msg;
        //                }
        //            }
        //            else
        //            {
        //                var setting = _context.EDMSCatRepoSettings.FirstOrDefault(x => x.Id == obj.CateRepoSettingId);
        //                if (setting != null)
        //                {
        //                    reposCode = setting.ReposCode;
        //                    path = setting.Path;
        //                    folderId = setting.FolderId;
        //                    catCode = setting.CatCode;
        //                }
        //                else
        //                {
        //                    msg.Error = true;
        //                    msg.Title = "Vui lòng chọn thư mục lưu trữ!";
        //                    return msg;
        //                }
        //            }
        //            var getRepository = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == reposCode);
        //            if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server))
        //            {
        //                using (var ms = new MemoryStream())
        //                {
        //                    fileUpload.CopyTo(ms);
        //                    var fileBytes = ms.ToArray();
        //                    urlFile = path + Path.Combine("/", fileUpload.FileName);
        //                    var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + getRepository.Server + urlFile);
        //                    FileExtensions.UploadFileToFtpServer(urlEnd, fileBytes, getRepository.Account, getRepository.PassWord);
        //                }
        //            }
        //            else if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.GooglerDriver))
        //            {
        //                fileId = FileExtensions.UploadFileToDrive(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", fileUpload.FileName, fileUpload.OpenReadStream(), fileUpload.ContentType, folderId);
        //            }
        //            var edmsReposCatFile = new EDMSRepoCatFile
        //            {
        //                FileCode = string.Concat("CUSTOMER", Guid.NewGuid().ToString()),
        //                ReposCode = reposCode,
        //                CatCode = catCode,
        //                ObjectCode = obj.CustomerCode,
        //                ObjectType = EnumHelper<CustomerEnum>.GetDisplayValue(CustomerEnum.Customer),
        //                Path = path,
        //                FolderId = folderId
        //            };
        //            _context.EDMSRepoCatFiles.Add(edmsReposCatFile);

        //            /// created Index lucene
        //            LuceneExtension.IndexFile(edmsReposCatFile.FileCode, fileUpload, string.Concat(_hostingEnvironment.WebRootPath, "\\uploads\\luceneIndex"));

        //            //add File
        //            var file = new EDMSFile
        //            {
        //                FileCode = edmsReposCatFile.FileCode,
        //                FileName = fileUpload.FileName,
        //                Desc = obj.Desc,
        //                ReposCode = reposCode,
        //                Tags = obj.Tags,
        //                FileSize = fileUpload.Length,
        //                FileTypePhysic = Path.GetExtension(fileUpload.FileName),
        //                NumberDocument = obj.NumberDocument,
        //                CreatedBy = ESEIM.AppContext.UserName,
        //                CreatedTime = DateTime.Now,
        //                Url = urlFile,
        //                MimeType = mimeType,
        //                CloudFileId = fileId,
        //            };
        //            _context.EDMSFiles.Add(file);
        //        }
        //        else
        //        {
        //            msg.Error = true;
        //            msg.Title = String.Format("CONTRACT_MSG_FORMAT_NOT_ALLOWED");// "Định dạng tệp không cho phép!";
        //        }


        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Object = ex;
        //        msg.Title = "Có lỗi xảy ra. Xin thử lại!";
        //    }
        //    return msg;
        //}

        //[NonAction]
        //public JMessage InsertCustomerFileRaw(EDMSRepoCatFileModel obj, EDMSRepoCatFile item, EDMSRepository oldRes, bool fromServer = true)
        //{
        //    var msg = new JMessage() { Error = false, Title = "" };
        //    try
        //    {
        //        var file1 = _context.EDMSFiles.FirstOrDefault(x => x.FileCode == item.FileCode);
        //        if (fromServer == true)
        //        {
        //            var mimeType = file1.MimeType;
        //            string extension = file1.FileTypePhysic;
        //            string urlFile = "";
        //            string fileId = "";
        //            if (Array.IndexOf(LuceneExtension.fileMimetypes, mimeType) >= 0 && (Array.IndexOf(LuceneExtension.fileExt, extension.ToUpper()) >= 0))
        //            {
        //                string reposCode = "";
        //                string catCode = "";
        //                string path = "";
        //                string folderId = "";

        //                var setting = _context.EDMSCatRepoSettings.FirstOrDefault(x => x.Id == obj.CateRepoSettingId);
        //                if (setting != null)
        //                {
        //                    reposCode = setting.ReposCode;
        //                    path = setting.Path;
        //                    folderId = setting.FolderId;
        //                    catCode = setting.CatCode;
        //                }
        //                else
        //                {
        //                    msg.Error = true;
        //                    msg.Title = "Vui lòng chọn thư mục lưu trữ!";
        //                    return msg;
        //                }
        //                string ftphost = oldRes.Server;
        //                string ftpfilepath = file1.Url;
        //                var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + ftphost + ftpfilepath);
        //                WebClient request = new WebClient();
        //                request.Credentials = new NetworkCredential(oldRes.Account, oldRes.PassWord);
        //                var fileBytes = request.DownloadData(urlEnd);

        //                var getRepository = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == reposCode);
        //                if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server))
        //                {
        //                    urlFile = path + Path.Combine("/", file1.FileName);
        //                    urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + getRepository.Server + urlFile);
        //                    FileExtensions.UploadFileToFtpServer(urlEnd, fileBytes, getRepository.Account, getRepository.PassWord);

        //                }
        //                else if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.GooglerDriver))
        //                {
        //                    var mStream = new MemoryStream(fileBytes);
        //                    fileId = FileExtensions.UploadFileToDrive(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", file1.FileName, mStream, file1.MimeType, folderId);
        //                }
        //                var edmsReposCatFile = new EDMSRepoCatFile
        //                {
        //                    FileCode = string.Concat("CUSTOMER", Guid.NewGuid().ToString()),
        //                    ReposCode = reposCode,
        //                    CatCode = catCode,
        //                    ObjectCode = obj.CustomerCode,
        //                    ObjectType = EnumHelper<CustomerEnum>.GetDisplayValue(CustomerEnum.Customer),
        //                    Path = path,
        //                    FolderId = folderId
        //                };
        //                _context.EDMSRepoCatFiles.Add(edmsReposCatFile);

        //                /// created Index lucene
        //                //LuceneExtension.IndexFile(edmsReposCatFile.FileCode, mimeType, extension, _hostingEnvironment.WebRootPath + Path.Combine(getRepository.PathPhysic, upload.Object.ToString()), _hostingEnvironment.WebRootPath + "\\uploads\\luceneIndex");

        //                //add File
        //                var file = new EDMSFile
        //                {
        //                    FileCode = edmsReposCatFile.FileCode,
        //                    FileName = file1.FileName,
        //                    Desc = obj.Desc,
        //                    ReposCode = reposCode,
        //                    Tags = obj.Tags,
        //                    FileSize = file1.FileSize,
        //                    FileTypePhysic = file1.FileTypePhysic,
        //                    NumberDocument = obj.NumberDocument,
        //                    CreatedBy = ESEIM.AppContext.UserName,
        //                    CreatedTime = DateTime.Now,
        //                    Url = urlFile,
        //                    MimeType = mimeType,
        //                    CloudFileId = fileId,
        //                };
        //                _context.EDMSFiles.Add(file);
        //            }
        //            else
        //            {
        //                msg.Error = true;
        //                msg.Title = String.Format("CONTRACT_MSG_FORMAT_NOT_ALLOWED");// "Định dạng tệp không cho phép!";
        //            }
        //        }
        //        else
        //        {
        //            // move from driver
        //            byte[] arr = FileExtensions.DowloadFileGoogle(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", file1.CloudFileId);
        //            var mimeType = file1.MimeType;
        //            string extension = file1.FileTypePhysic;
        //            string urlFile = "";
        //            string fileId = "";
        //            if (Array.IndexOf(LuceneExtension.fileMimetypes, mimeType) >= 0 && (Array.IndexOf(LuceneExtension.fileExt, extension.ToUpper()) >= 0))
        //            {
        //                string reposCode = "";
        //                string catCode = "";
        //                string path = "";
        //                string folderId = "";

        //                var setting = _context.EDMSCatRepoSettings.FirstOrDefault(x => x.Id == obj.CateRepoSettingId);
        //                if (setting != null)
        //                {
        //                    reposCode = setting.ReposCode;
        //                    path = setting.Path;
        //                    folderId = setting.FolderId;
        //                    catCode = setting.CatCode;
        //                }
        //                else
        //                {
        //                    msg.Error = true;
        //                    msg.Title = "Vui lòng chọn thư mục lưu trữ!";
        //                    return msg;
        //                }
        //                var fileBytes = arr;
        //                var getRepository = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == reposCode);
        //                var urlEnd = "";
        //                if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server))
        //                {
        //                    urlFile = path + Path.Combine("/", file1.FileName);
        //                    urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + getRepository.Server + urlFile);
        //                    FileExtensions.UploadFileToFtpServer(urlEnd, fileBytes, getRepository.Account, getRepository.PassWord);

        //                }
        //                else if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.GooglerDriver))
        //                {
        //                    var mStream = new MemoryStream(fileBytes);
        //                    fileId = FileExtensions.UploadFileToDrive(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", file1.FileName, mStream, file1.MimeType, folderId);
        //                }
        //                var edmsReposCatFile = new EDMSRepoCatFile
        //                {
        //                    FileCode = string.Concat("CUSTOMER", Guid.NewGuid().ToString()),
        //                    ReposCode = reposCode,
        //                    CatCode = catCode,
        //                    ObjectCode = obj.CustomerCode,
        //                    ObjectType = EnumHelper<CustomerEnum>.GetDisplayValue(CustomerEnum.Customer),
        //                    Path = path,
        //                    FolderId = folderId
        //                };
        //                _context.EDMSRepoCatFiles.Add(edmsReposCatFile);

        //                //add File
        //                var file = new EDMSFile
        //                {
        //                    FileCode = edmsReposCatFile.FileCode,
        //                    FileName = file1.FileName,
        //                    Desc = obj.Desc,
        //                    ReposCode = reposCode,
        //                    Tags = obj.Tags,
        //                    FileSize = file1.FileSize,
        //                    FileTypePhysic = file1.FileTypePhysic,
        //                    NumberDocument = obj.NumberDocument,
        //                    CreatedBy = ESEIM.AppContext.UserName,
        //                    CreatedTime = DateTime.Now,
        //                    Url = urlFile,
        //                    MimeType = mimeType,
        //                    CloudFileId = fileId,
        //                };
        //                _context.EDMSFiles.Add(file);
        //            }
        //            else
        //            {
        //                msg.Error = true;
        //                msg.Title = String.Format("CONTRACT_MSG_FORMAT_NOT_ALLOWED");// "Định dạng tệp không cho phép!";
        //            }
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Object = ex;
        //        msg.Title = "Có lỗi xảy ra. Xin thử lại!";
        //    }
        //    return msg;
        //}

        //[NonAction]
        //private JMessage MoveFileFromServer(EDMSRepoCatFile item, IFormFile fileUpload, EDMSRepoCatFileModel newItem, EDMSCatRepoSetting newSetting, EDMSRepository oldRes, EDMSRepository newRes)
        //{
        //    JMessage msg = new JMessage() { Error = false };
        //    try
        //    {
        //        var file = _context.EDMSFiles.FirstOrDefault(x => x.FileCode == item.FileCode);
        //        DeleteCustomerFileRaw(item.Id);
        //        if (fileUpload != null)
        //        {
        //            InsertCustomerFileRaw(newItem, fileUpload);
        //        }
        //        else
        //        {
        //            InsertCustomerFileRaw(newItem, item, oldRes);
        //        }
        //        _context.SaveChanges();
        //        msg.Title = "Cập nhật thành công";
        //        try
        //        {
        //            var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + oldRes.Server + file.Url);
        //            FileExtensions.DeleteFileFtpServer(urlEnd, oldRes.Account, oldRes.PassWord);
        //        }
        //        catch (Exception ex) { }
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Title = "Sảy ra lỗi khi cập nhật";
        //        msg.Object = ex.Message;
        //    }
        //    return msg;
        //}

        //[NonAction]
        //private JMessage MoveFileFromDriver(EDMSRepoCatFile item, IFormFile fileUpload, EDMSRepoCatFileModel newItem, EDMSCatRepoSetting newSetting, EDMSRepository oldRes, EDMSRepository newRes)
        //{
        //    JMessage msg = new JMessage() { Error = false };
        //    try
        //    {
        //        var file = _context.EDMSFiles.FirstOrDefault(x => x.FileCode == item.FileCode);
        //        DeleteCustomerFileRaw(item.Id);
        //        if (fileUpload != null)
        //        {
        //            InsertCustomerFileRaw(newItem, fileUpload, false);
        //        }
        //        else
        //        {
        //            InsertCustomerFileRaw(newItem, item, oldRes, false);
        //        }
        //        _context.SaveChanges();
        //        msg.Title = "Cập nhật thành công";
        //        try
        //        {
        //            FileExtensions.DeleteFileGoogleServer(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", file.CloudFileId);
        //        }
        //        catch (Exception ex) { }
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Title = "Sảy ra lỗi khi cập nhật";
        //        msg.Object = ex.Message;
        //    }
        //    return msg;
        //}

        //[NonAction]
        //private void DeleteCustomerFileRaw(int id)
        //{
        //    var data = _context.EDMSRepoCatFiles.FirstOrDefault(x => x.Id == id);
        //    _context.EDMSRepoCatFiles.Remove(data);

        //    var file = _context.EDMSFiles.FirstOrDefault(x => x.FileCode == data.FileCode);
        //    _context.EDMSFiles.Remove(file);

        //    LuceneExtension.DeleteIndexFile(file.FileCode, _hostingEnvironment.WebRootPath + "\\uploads\\luceneIndex");
        //}
        #endregion

        #region Extend
        public class JTableModelExtend : JTableModel
        {
            public int? CustomerId { get; set; }
            public string Extvalue { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
        }

        [HttpPost]
        public object JTableExtend([FromBody] JTableModelExtend jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            int? customerId = jTablePara.CustomerId;
            DateTime? fromdate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            DateTime? todate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var query = from a in _context.CustomerExtends
                        where (a.isdeleted == false &&
                               a.customer_id == customerId)
                               && a.isdeleted == false
                               && ((fromdate == null || (a.created_time >= fromdate)) && (todate == null || (a.created_time <= todate)))
                               && (string.IsNullOrEmpty(jTablePara.Extvalue) || a.ext_value.ToLower().Contains(jTablePara.Extvalue.ToLower()))
                        select new
                        {
                            id = a.id,
                            code = a.ext_code,
                            value = a.ext_value,
                            created_time = a.created_time.Value.ToString("dd/MM/yyyy HH:mm:ss")
                        };
            int count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "id", "code", "value", "created_time");

            return Json(jdata);
        }

        [HttpPost]
        public object DeleteExtend(int id)
        {
            var msg = new JMessage();
            try
            {
                var data = _context.CustomerExtends.FirstOrDefault(x => x.id == id);
                data.isdeleted = true;
                _context.CustomerExtends.Update(data);
                _context.SaveChanges();
                msg.Error = false;
                msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
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
        public object InsertExtend([FromBody] CustomerExtend obj)
        {
            var msg = new JMessage();
            try
            {
                var query = from a in _context.CustomerExtends
                            where a.ext_code == obj.ext_code && a.isdeleted == false
                            select a;
                if (query.Count() == 0)
                {
                    obj.created_time = DateTime.Now;
                    obj.isdeleted = false;
                    _context.CustomerExtends.Add(obj);
                    _context.SaveChanges();
                    msg.Error = false;
                    msg.Title = _stringLocalizer["CUS_TITLE_ADD_EXPEND"];

                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["CUS_TITLE_CODE_EXPEND_EXISTED"];

                }
                return Json(msg);
            }
            catch
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];

                return Json(msg);
            }

        }
        [HttpGet]
        public object GetExtend(int id)
        {
            var data = _context.CustomerExtends.FirstOrDefault(x => x.id == id);
            return Json(data);
        }

        [HttpPost]
        public object UpdateExtend([FromBody] CustomerExtend obj)
        {
            var msg = new JMessage();
            try
            {
                obj.updated_time = DateTime.Now.Date;
                _context.CustomerExtends.Update(obj);
                _context.SaveChanges();
                msg.Error = false;
                msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
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

        #region Contract
        public class JTableModelContract : JTableModel
        {
            public int? CustomerID { get; set; }
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

            var custommerCode = _context.Customerss.FirstOrDefault(x => x.CusID.Equals(jTablePara.CustomerID))?.CusCode;

            var query = from a in _context.PoSaleHeaders
                        join b in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Currency equals b.CodeSet into b1
                        from b2 in b1.DefaultIfEmpty()
                        where a.IsDeleted == false
                        && a.CusCode.Equals(custommerCode)
                        && (string.IsNullOrEmpty(jTablePara.ContractCode) || (a.ContractCode.ToLower().Contains(jTablePara.ContractCode.ToLower())))
                        && (string.IsNullOrEmpty(jTablePara.ContractNo) || (a.ContractNo.ToLower().Contains(jTablePara.ContractNo.ToLower())))
                        && (string.IsNullOrEmpty(jTablePara.Title) || (a.Title.ToLower().Contains(jTablePara.Title.ToLower())))
                        && ((fromDate == null) || (a.ContractDate.HasValue && a.ContractDate.Value.Date >= fromDate))
                        && ((toDate == null) || (a.ContractDate.HasValue && a.ContractDate.Value.Date <= toDate))
                        select new
                        {
                            id = a.ContractHeaderID,
                            code = a.ContractCode,
                            no = a.ContractNo,
                            contractDate = a.ContractDate,
                            title = a.Title,
                            mainService = a.MainService,
                            //budgetExcludeTax = a.BudgetExcludeTax,
                            budgetExcludeTax = a.RealBudget,
                            exchangeRate = a.ExchangeRate,
                            currency = b2.ValueSet,
                        };

            if (query.FirstOrDefault() != null)
                totalContract = query.Sum(x => x.budgetExcludeTax * x.exchangeRate);

            var queryRs = from a in query
                          select new
                          {
                              a.id,
                              a.code,
                              a.no,
                              a.title,
                              a.mainService,
                              a.contractDate,
                              a.budgetExcludeTax,
                              a.exchangeRate,
                              a.currency,
                              totalContract
                          };

            int count = queryRs.Count();
            var data = queryRs.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "id", "code", "no", "title", "mainService", "contractDate", "budgetExcludeTax", "currency", "exchangeRate", "totalContract");
            return Json(jdata);
        }
        #endregion

        #region Project
        public class JTableModelProject : JTableModel
        {
            public int? CustomerID { get; set; }
            public string ProjectCode { get; set; }
            public string Title { get; set; }
            public string ProjectType { get; set; }
        }

        [HttpPost]
        public object JTableProject([FromBody] JTableModelProject jTablePara)
        {
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            string objCode;
            if (jTablePara.ProjectType == "CUSTOMER")
            {
                objCode = _context.Customerss.FirstOrDefault(x => x.CusID.Equals(jTablePara.CustomerID))?.CusCode;
            }
            else
            {
                objCode = _context.Suppliers.FirstOrDefault(x => x.SupID.Equals(jTablePara.CustomerID))?.SupCode;
            }


            if (jTablePara.ProjectType == "CUSTOMER")
            {
                objCode = _context.Customerss.FirstOrDefault(x => x.CusID.Equals(jTablePara.CustomerID))?.CusCode;

                var query1 = from a in _context.PoSaleHeaders.Where(x => !x.IsDeleted && x.CusCode == objCode)
                             join b in _context.Projects.Where(x => !x.FlagDeleted) on a.PrjCode equals b.ProjectCode
                             join c1 in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "CURRENCY_TYPE") on b.Currency equals c1.CodeSet into c2
                             from c in c2.DefaultIfEmpty()
                             where (string.IsNullOrEmpty(jTablePara.ProjectCode) || (a.PrjCode.ToLower().Contains(jTablePara.ProjectCode.ToLower())))
                             && (string.IsNullOrEmpty(jTablePara.Title) || (b.ProjectTitle.ToLower().Contains(jTablePara.Title.ToLower())))
                             select new
                             {
                                 Id = b.Id,
                                 ProjectCode = a.PrjCode,
                                 b.ProjectTitle,
                                 b.Budget,
                                 Currency = c != null ? c.ValueSet : "",
                                 b.StartTime,
                                 b.EndTime,
                                 SumBudget = 0,
                             };
                var query2 = from a in _context.ProjectCusSups.Where(x => !x.IsDeleted && x.ObjType == jTablePara.ProjectType && x.ObjCode == objCode)
                             join b in _context.Projects.Where(x => !x.FlagDeleted) on a.ProjectCode equals b.ProjectCode
                             join c1 in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "CURRENCY_TYPE") on b.Currency equals c1.CodeSet into c2
                             from c in c2.DefaultIfEmpty()
                             where (string.IsNullOrEmpty(jTablePara.ProjectCode) || (a.ProjectCode.ToLower().Contains(jTablePara.ProjectCode.ToLower())))
                             && (string.IsNullOrEmpty(jTablePara.Title) || (b.ProjectTitle.ToLower().Contains(jTablePara.Title.ToLower())))
                             select new
                             {
                                 b.Id,
                                 a.ProjectCode,
                                 b.ProjectTitle,
                                 b.Budget,
                                 Currency = c != null ? c.ValueSet : "",
                                 b.StartTime,
                                 b.EndTime,
                                 SumBudget = 0,
                             };

                var query = query2.Union(query1);

                int count = query.Count();
                var sumBudget = query.Sum(x => x.Budget);

                var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length).AsNoTracking()
                            .Select(x => new
                            {
                                x.Id,
                                x.ProjectCode,
                                x.ProjectTitle,
                                x.Budget,
                                x.Currency,
                                x.StartTime,
                                x.EndTime,
                                SumBudget = sumBudget,
                            }).ToList();
                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "ProjectCode", "ProjectTitle", "Budget", "Currency", "StartTime", "EndTime", "SumBudget");
                return Json(jdata);
            }
            else
            {
                var query = from a in _context.ProjectCusSups.Where(x => !x.IsDeleted && x.ObjType == jTablePara.ProjectType && x.ObjCode == objCode)
                            join b in _context.Projects.Where(x => !x.FlagDeleted) on a.ProjectCode equals b.ProjectCode
                            join c1 in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "CURRENCY_TYPE") on b.Currency equals c1.CodeSet into c2
                            from c in c2.DefaultIfEmpty()
                            where (string.IsNullOrEmpty(jTablePara.ProjectCode) || (a.ProjectCode.ToLower().Contains(jTablePara.ProjectCode.ToLower())))
                            && (string.IsNullOrEmpty(jTablePara.Title) || (b.ProjectTitle.ToLower().Contains(jTablePara.Title.ToLower())))
                            select new
                            {
                                b.Id,
                                a.ProjectCode,
                                b.ProjectTitle,
                                b.Budget,
                                Currency = c != null ? c.ValueSet : "",
                                b.StartTime,
                                b.EndTime,
                                SumBudget = 0,
                            };
                int count = query.Count();
                var sumBudget = query.Sum(x => x.Budget);

                var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length).AsNoTracking()
                            .Select(x => new
                            {
                                x.Id,
                                x.ProjectCode,
                                x.ProjectTitle,
                                x.Budget,
                                x.Currency,
                                x.StartTime,
                                x.EndTime,
                                SumBudget = sumBudget,
                            }).ToList();
                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "ProjectCode", "ProjectTitle", "Budget", "Currency", "StartTime", "EndTime", "SumBudget");
                return Json(jdata);
            }

        }
        #endregion

        #region CardJob
        public class JTableModelCardJob : JTableModel
        {
            public int? CustomerId { get; set; }
        }
        [HttpPost]
        public object JTableCardJob([FromBody] JTableModelCardJob jtablePara)
        {
            int intBegin = (jtablePara.CurrentPage - 1) * jtablePara.Length;
            if (jtablePara.CustomerId == null)
            {
                var list = new List<object>();
                return JTableHelper.JObjectTable(list, jtablePara.Draw, 0, "Id", "CardCode", "Project", "CardName");
            }
            var customer = _context.Customerss.FirstOrDefault(x => x.CusID == jtablePara.CustomerId);
            var query = from a in _context.CardMappings
                        join b in _context.WORKOSCards on a.CardCode equals b.CardCode
                        where b.IsDeleted == false && a.CustomerCode.Equals(customer.CusCode)
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
            var jdata = JTableHelper.JObjectTable(data, jtablePara.Draw, count, "CardCode", "CardName", "BeginTime", "EndTime", "Status", "Completed", "Cost", "Quantitative", "ListName", "BoardName");
            return Json(jdata);
        }

        //[HttpPost]
        //public JsonResult AddCardRelative([FromBody] dynamic data)
        //{
        //    var msg = new JMessage() { Error = false, Title = "" };
        //    try
        //    {
        //        int customerId = data.CustomerId.Value != null ? Convert.ToInt32(data.CustomerId.Value) : 0;
        //        string cardCode = data.CardCode.Value;
        //        string customerCode = _context.Customerss.FirstOrDefault(x => x.CusID == customerId).CusName;
        //        if (_context.CardForWObjs.Where(x => x.ObjCode.Equals(customerCode) && x.CatObjCode.Equals("PROJECT") && x.CardCode.Equals(cardCode) && x.IsDeleted == false).Count() > 0)
        //        {
        //            msg.Title = "Khách hàng đã tồn tại";
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
        //            CustomerCode = customerCode,
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

        #region Reminder
        public class JTableModelReminder : JTableModel
        {
            public int? CustomerId { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
        }

        [HttpPost]
        public object JTableReminder([FromBody] JTableModelReminder jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            if (jTablePara.CustomerId == null)
            {
                return JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "ContractNoteId", "Title", "ContractCode", "Note", "Tags", "CreatedBy", "CreatedTime");
            }
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var query = from a in _context.CustomerReminders
                        where a.CustomerId == jTablePara.CustomerId
                        && ((fromDate == null) || (a.ReminderTime.HasValue && a.ReminderTime.Value.Date >= fromDate))
                        && ((toDate == null) || (a.ReminderTime.HasValue && a.ReminderTime.Value.Date <= toDate))
                        select new
                        {
                            a.Id,
                            ReminderName = _context.ReminderAttrs.FirstOrDefault(x => x.ReminderCode == a.ReminderCode).ReminderTitle ?? null,
                            a.ReminderTime,
                            a.Note,
                            a.CreatedBy,
                            a.CreatedTime
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "ReminderTime", "ReminderName", "Note", "CreatedBy", "CreatedTime");
            return Json(jdata);
        }

        [HttpPost]
        public object GetReminder()
        {
            var list = _context.ReminderAttrs.Select(x => new
            {
                Code = x.ReminderCode,
                Name = x.ReminderTitle
            });
            return Json(list);
        }

        [HttpGet]
        public JsonResult GetItemReminder(int? id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.CustomerReminders.FirstOrDefault(x => x.Id == id);
                if (data != null)
                {
                    data.ReminderTimeView = data.ReminderTime != null ? data.ReminderTime.Value.ToString("dd/MM/yyyy HH:mm") : "";
                    msg.Object = data;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["CUS_CURD_TAB_REMINDER_VALIDATE"];
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
        public JsonResult InsertReminder([FromBody] CustomerReminder obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                obj.ReminderTime = !string.IsNullOrEmpty(obj.ReminderTimeView) ? DateTime.ParseExact(obj.ReminderTimeView, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture) : (DateTime?)null;
                obj.CreatedBy = ESEIM.AppContext.UserName;
                obj.CreatedTime = DateTime.Now;
                _context.CustomerReminders.Add(obj);
                _context.SaveChanges();
                msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["CUS_CURD_TAB_REMINDER"].Value.ToLower());
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_ADD_FAILED"], _stringLocalizer["CUS_CURD_TAB_REMINDER"].Value.ToLower());
                msg.Object = ex;
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateReminder([FromBody] CustomerReminder obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.CustomerReminders.FirstOrDefault(x => x.Id == obj.Id);
                if (data != null)
                {

                    data.ReminderCode = obj.ReminderCode;
                    data.ReminderTime = obj.ReminderTime = !string.IsNullOrEmpty(obj.ReminderTimeView) ? DateTime.ParseExact(obj.ReminderTimeView, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture) : (DateTime?)null;
                    data.Note = obj.Note;
                    _context.CustomerReminders.Update(data);
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["CUS_CURD_TAB_REMINDER"].Value.ToLower());
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_EDIT_FAILED"], _stringLocalizer["CUS_CURD_TAB_REMINDER"].Value.ToLower());
                msg.Object = ex;
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult DeleteReminder(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.CustomerReminders.FirstOrDefault(x => x.Id == id);
                _context.CustomerReminders.Remove(data);
                _context.SaveChanges();
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer["CUS_CURD_TAB_REMINDER"].Value.ToLower());
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_FAIL"], _stringLocalizer["CUS_CURD_TAB_REMINDER"].Value.ToLower());
                msg.Object = ex;
            }
            return Json(msg);
        }
        #endregion
        
        #region Appointment
        public class EdmsCustomerTabAppointment
        {
            public int? Id { get; set; }
            public string CustomerCode { get; set; }
            public string Title { get; set; }
            public string ToDate { get; set; }
            public string FromDate { get; set; }
            public string Location { get; set; }
            public string RepeatType { get; set; }
            public string Note { get; set; }
        }
        [AllowAnonymous]
        [HttpPost]
        public object JTableCustomerAppointment([FromBody] JTableModelAppointment jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            if (jTablePara.CustomerCode == null)
            {
                var list = new List<object>();
                return JTableHelper.JObjectTable(list, jTablePara.Draw, 0, "Id", "Title", "ToDate", "FromDate", "Location", "RepeatType", "Note");
            }
            var query = from a in _context.CustomerAppointments
                        join b in _context.Users on a.CreatedBy equals b.UserName into b1
                        from b in b1.DefaultIfEmpty()
                        where !a.IsDeleted
                        && (string.IsNullOrEmpty(jTablePara.Tags) || (a.Tags.ToLower().Contains(jTablePara.Tags.ToLower())))
                        && (string.IsNullOrEmpty(jTablePara.Title) || a.Title.ToLower().Contains(jTablePara.Title.ToLower()))
                        && (a.CustomerCode == jTablePara.CustomerCode)
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
        public JsonResult InsertCustomerTabAppointment([FromBody] EdmsCustomerTabAppointment obj)
        {
            var msg = new JMessage { Error = false };
            try
            {
                var Customer = _context.Customerss.FirstOrDefault(x => x.CusCode == obj.CustomerCode);
                var fromDate = !string.IsNullOrEmpty(obj.FromDate) ? DateTime.ParseExact(obj.FromDate, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture) : (DateTime?)null;
                var toDate = !string.IsNullOrEmpty(obj.ToDate) ? DateTime.ParseExact(obj.ToDate, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture) : (DateTime?)null;
                var data = new CustomerAppointment
                {
                    CustomerCode = Customer.CusCode,
                    Title = obj.Title,
                    //Tags = obj.Tags,
                    FromDate = fromDate,
                    ToDate = toDate,
                    Location = obj.Location,
                    RepeatType = obj.RepeatType,
                    Note = obj.Note,
                    //CustomerVersion = Customer.Version,
                    CreatedBy = AppContext.UserName,
                    CreatedTime = DateTime.Now,
                    IsDeleted = false
                };
                _context.CustomerAppointments.Add(data);
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
        public JsonResult UpdateCustomerTabAppointment([FromBody] EdmsCustomerTabAppointment obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.CustomerAppointments.FirstOrDefault(x => x.Id == obj.Id);
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
                    _context.CustomerAppointments.Update(data);
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
        public JsonResult DeleteCustomerTabAppointment(int id)
        {
            var msg = new JMessage();
            try
            {
                var data = _context.CustomerAppointments.FirstOrDefault(x => x.Id == id);
                if (data != null)
                {
                    data.IsDeleted = true;
                    data.DeletedBy = AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    _context.CustomerAppointments.Update(data);
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
            var data = _context.CustomerAppointments.FirstOrDefault(x => x.Id == id);
            return Json(data);
        }
        [AllowAnonymous]
        [HttpGet]
        public JsonResult GetAllEvent(string CustomerCode)
        {
            var session = HttpContext.GetSessionUser();
            var listData = new List<Object>();
            var today = DateTime.Now.Date;
            var events = (from a in _context.CustomerAppointments.Where(x => !x.IsDeleted)
                              //join b in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Status equals b.CodeSet
                              //join c in _context.ZoomManages.Where(x => !x.IsDeleted) on a.MeetingId equals c.Id into c1
                              //from c in c1.DefaultIfEmpty()
                          where a.CustomerCode == CustomerCode && a.FromDate.HasValue && a.ToDate.HasValue
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
        #region Map
        [HttpGet]
        public async Task<JsonResult> GetAddress(string lat, string lon)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                msg.Object = await _googleAPI.GetAddressForCoordinates(Convert.ToDouble(lat), Convert.ToDouble(lon));
                //if (result.status == "OK")
                //{
                //    msg.Object = result.results[0].formatted_address;
                //}
                //else
                //{
                //    msg.Error = true;
                //    // msg.Title = "Key đã vượt mức giới hạn, vui lòng liên hệ administrator!";
                //    msg.Title = _stringLocalizer["CJ_MSG_KEY_EXPIRED_PLS_CONTACT_ADMIN"];
                //    return Json(msg);
                //}
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi khi lấy địa chỉ!";
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
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_cardJobController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerPj.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerFp.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_fileObjectShareController.GetAllStrings().Select(x => new { x.Name, x.Value }))
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
    public class JTableModelCustomer : JTableModel
    {
        public string CustomerCode { get; set; }
        public string CustomerName { get; set; }
        public string CustomerPhone { get; set; }
        public string CustomerEmail { get; set; }
        public string CustomerGroup { get; set; }
        public string CustomerActivityStatus { get; set; }
        public string Address { get; set; }
    }

    public class JTableModelAppointment : JTableModel
    {
        //old index
        public string CustomerCode { get; set; }

        //tag
        public string Title { get; set; }
        public string Tags { get; set; }
    }
}