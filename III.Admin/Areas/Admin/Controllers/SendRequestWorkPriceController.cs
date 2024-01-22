using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
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
    public class SendRequestWorkPriceController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<SendRequestWorkPriceController> _stringLocalizer;
        private readonly IStringLocalizer<CardJobController> _cardJobController;
        private readonly IStringLocalizer<FilePluginController> _stringLocalizerFp;
        private readonly IStringLocalizer<ContractController> _contractController;
        private readonly IStringLocalizer<EDMSRepositoryController> _edmsRepositoryController;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IStringLocalizer<FileObjectShareController> _fileObjectShareController;

        public SendRequestWorkPriceController(EIMDBContext context, IUploadService upload,
            IHostingEnvironment hostingEnvironment, IStringLocalizer<SendRequestWorkPriceController> stringLocalizer,
            IStringLocalizer<FilePluginController> stringLocalizerFp,
            IStringLocalizer<CardJobController> cardJobController, IStringLocalizer<ContractController> contractController,
            IStringLocalizer<SharedResources> sharedResources, IStringLocalizer<FileObjectShareController> fileObjectShareController,
            IStringLocalizer<EDMSRepositoryController> edmsRepositoryController)
        {
            _context = context;
            _upload = upload;
            _hostingEnvironment = hostingEnvironment;
            _stringLocalizerFp = stringLocalizerFp;
            _stringLocalizer = stringLocalizer;
            _cardJobController = cardJobController;
            _contractController = contractController;
            _sharedResources = sharedResources;
            _fileObjectShareController = fileObjectShareController;
            _edmsRepositoryController = edmsRepositoryController;
        }
        [Breadcrumb("ViewData.CrumbRqWorkPrice", AreaName = "Admin", FromAction = "Index", FromController = typeof(ContractHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbContractHome"] = _sharedResources["COM_CRUMB_CONTRACT_HOME"];
            ViewData["CrumbRqWorkPrice"] = _sharedResources["COM_CRUMB_RQ_PRICE"];
            return View();
        }

        #region ComboboxValue
        [HttpPost]
        public JsonResult GetListCommon()
        {
            var list = _context.CommonSettings.Where(x => !x.IsDeleted).Select(x => new { Code = x.CodeSet, Name = x.ValueSet, x.Group }).AsNoTracking();
            return Json(list);
        }

        [HttpPost]
        public JsonResult GetListStatus()
        {
            var data = _context.CommonSettings.Where(x => x.Group == EnumHelper<WarehouseEnum>.GetDisplayValue(WarehouseEnum.PriceStatus)).OrderBy(x => x.Priority).Select(x => new { Code = x.CodeSet, Name = x.ValueSet, Icon = x.Logo });
            return Json(data);
        }

        [HttpPost]
        public object GetSuppliers()
        {
            var data = (from a in _context.Suppliers.Where(x => !x.IsDeleted)
                        orderby a.SupID descending
                        select new
                        {
                            Id = a.SupID,
                            Code = a.SupCode,
                            Name = a.SupName,
                            Group = a.SupGroup,
                            Address = a.Address,
                            MobilePhone = a.Mobile,
                            Email = a.Email,
                            ListExtend = _context.SupplierExtends.Where(x => x.isdeleted == false && (x.ext_code.ToLower() == "zip_code" || x.ext_code.ToLower() == "person_in_charge") && x.supplier_code == a.SupID).ToList()
                        }).ToList();

            return Json(data);
        }

        [HttpPost]
        public object GetListProduct()
        {
            var rs = from b in _context.SubProducts.Where(x => !x.IsDeleted)
                     join c in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on b.Unit equals c.CodeSet into c1
                     from c2 in c1.DefaultIfEmpty()
                     orderby b.ProductCode
                     select new
                     {
                         Code = b.ProductQrCode,
                         Name = b.AttributeName,
                         Unit = b.Unit,
                         ProductCode = b.ProductCode,
                         UnitName = c2.ValueSet,
                         b.AttributeCode,
                         b.AttributeName,
                         ProductType = "SUB_PRODUCT",
                     };

            var rs1 = from b in _context.MaterialProducts.Where(x => !x.IsDeleted && x.TypeCode == "FINISHED_PRODUCT")
                      join c in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on b.Unit equals c.CodeSet into c1
                      from c2 in c1.DefaultIfEmpty()
                      orderby b.ProductCode
                      select new
                      {
                          Code = b.ProductCode,
                          Name = string.Format("Thành phẩm: {0}", b.ProductName),
                          Unit = b.Unit,
                          ProductCode = b.ProductCode,
                          UnitName = c2.ValueSet,
                          AttributeCode = "",
                          AttributeName = "",
                          ProductType = "FINISHED_PRODUCT",
                      };

            return rs1.Concat(rs);
        }
        #endregion

        #region Request Price Header
        public class JTableModelRequestPrice : JTableModel
        {
            public string Key { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string ReqCode { get; set; }
            public string Status { get; set; }
            public string BranchId { get; set; }
        }

        public class JTableModelDetail : JTableModel
        {
            public string ReqCode { get; set; }
        }
        [HttpPost]
        public object JTable([FromBody] JTableModelRequestPrice jTablePara)
        {
            var session = HttpContext.GetSessionUser();

            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            DateTime? fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            DateTime? toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            string status = jTablePara.Status;

            var query = from a in _context.RequestPriceHeaders.Where(x => !x.IsDeleted)
                        join d in _context.Users.Where(x => x.Active) on a.CreatedBy equals d.UserName into d1
                        from d2 in d1.DefaultIfEmpty()
                        join e in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Status equals e.CodeSet into e1
                        from e2 in e1.DefaultIfEmpty()
                        join f in _context.Users.Where(x => x.Active) on a.CreatedBy equals f.UserName
                        where ((a.IsDeleted == false) &&
                              ((fromDate == null) || (a.CreatedTime.Date >= fromDate)) &&
                              ((toDate == null) || (a.CreatedTime.Date <= toDate)) &&
                              (string.IsNullOrEmpty(jTablePara.BranchId) || f.BranchId.Equals(jTablePara.BranchId)) &&
                              (string.IsNullOrEmpty(jTablePara.Key) || a.ReqCode.ToLower().Contains(jTablePara.Key.ToLower()) || a.Title.ToLower().Contains(jTablePara.Key.ToLower())) &&
                              (string.IsNullOrEmpty(jTablePara.Status) || a.Status.Equals(status)))
                              //Điều kiện phân quyền dữ liệu
                              && (session.IsAllData
                              || (!session.IsAllData && session.IsBranch && session.RoleCode.Equals(EnumHelper<Role>.GetDisplayValue(Role.Giamdoc)) && session.ListUserOfBranch.Any(x => x == a.CreatedBy))
                              || (!session.IsAllData && !session.IsBranch && session.IsUser && session.UserName == a.CreatedBy))
                        select new
                        {
                            a.Id,
                            a.ReqCode,
                            a.Title,
                            CreatedBy = d2.GivenName,
                            a.CreatedTime,
                            Status = e2.ValueSet,
                            Icon = e2.Logo
                        };

            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "ReqCode", "Title", "PoCode", "CusCode", "CusName", "CreatedBy", "CreatedTime", "Status", "Icon");
            return Json(jdata);
        }

        [HttpGet]
        public object GetListPoProduct(string reqCode)
        {
            var today = DateTime.Now.Date;
            var listContractHeader = _context.PoSaleHeaders.Where(x => !x.IsDeleted && (string.IsNullOrEmpty(reqCode) || x.ContractCode.Equals(reqCode))).OrderByDescending(p => p.ContractHeaderID);
            var listLogProductDetail = new List<LogProductDetail>();
            foreach (var item in listContractHeader)
            {
                if (!string.IsNullOrEmpty(item.LogProductDetail))
                    listLogProductDetail.AddRange(JsonConvert.DeserializeObject<List<LogProductDetail>>(item.LogProductDetail));
            }

            var listProductDetail = listLogProductDetail.Where(x => x.ImpQuantity < 0 && x.EstimateDate.Date >= today).GroupBy(x => x.ContractCode).Select(x => new
            {
                Code = x.FirstOrDefault().ContractCode,
                Quantity = x.Sum(y => y.ImpQuantity) * -1
            });
            var listPoCus = (from a in listProductDetail
                             join b in _context.PoSaleHeaders.Where(x => !x.IsDeleted) on a.Code equals b.ContractCode
                             select new
                             {
                                 a.Code,
                                 Name = b.Title,
                                 a.Quantity,
                                 b.CusCode,
                                 listProductDetail = listLogProductDetail.Where(p => p.ContractCode.Equals(b.ContractCode))
                             }).ToList();
            return listPoCus;

        }

        [HttpPost]
        public JsonResult Insert([FromBody] RequestPriceHeaderModel obj)
        {
            JMessage msg = new JMessage() { Error = false };
            try
            {
                var data = _context.RequestPriceHeaders.FirstOrDefault(x => !x.IsDeleted && x.ReqCode.Equals(obj.ReqCode));
                if (data == null)
                {
                    DateTime? expectedDate = !string.IsNullOrEmpty(obj.sExpectedDate) ? DateTime.ParseExact(obj.sExpectedDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                    DateTime? timeTicketCreate = !string.IsNullOrEmpty(obj.STimeTicketCreate) ? DateTime.ParseExact(obj.STimeTicketCreate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

                    var model = new RequestPriceHeader
                    {
                        ReqCode = obj.ReqCode,
                        Title = obj.Title,
                        Status = obj.Status,
                        ListProductDetail = obj.ListProductDetail,
                        ExpectedDate = expectedDate,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now,
                        IsDeleted = false,
                        LogStatus = JsonConvert.SerializeObject(new List<EDMSStatus>
                        {
                                new EDMSStatus
                                {
                                    Type=EnumHelper<TypeLogStatus>.GetDisplayValue(TypeLogStatus.StatusReceipt),
                                    Status = obj.Status,
                                    Reason = "",
                                    CreatedBy = ESEIM.AppContext.UserName,
                                    CreatedTime = DateTime.Now,
                                }
                            }),
                        TimeTicketCreate = timeTicketCreate,
                        UserRequest = obj.UserRequest
                    };

                    _context.RequestPriceHeaders.Add(model);

                    var file = obj.File;
                    if (file != null)
                    {
                        var check = _context.EDMSFiles.FirstOrDefault(x => x.FileCode.Equals(file.FileCode));
                        if (check == null)
                        {
                            var edmsFile = new EDMSFile
                            {
                                FileCode = file.FileCode,
                                FileName = file.FileName,
                                FileSize = file.FileSize,
                                FileTypePhysic = file.FileTypePhysic,
                                Desc = file.Desc,
                                Tags = file.Tags,
                                Url = file.Url,
                                ReposCode = file.ReposCode,
                                NumberDocument = file.NumberDocument,
                                MimeType = file.MimeType,
                                CloudFileId = file.CloudFileId,
                                CreatedTime = DateTime.Now,
                                CreatedBy = User.Identity.Name,
                            };
                            _context.EDMSFiles.Add(edmsFile);
                            var category = _context.EDMSCategorys.FirstOrDefault(x => x.CatCode == "HG");
                            if (category != null)
                            {
                                var getSetting = _context.EDMSCatRepoSettings.FirstOrDefault(x => x.CatCode == category.CatCode);
                                if (getSetting != null)
                                {
                                    var edmsRepoCatFile = new EDMSRepoCatFile
                                    {
                                        FileCode = file.FileCode,
                                        ReposCode = getSetting.ReposCode,
                                        CatCode = getSetting.CatCode,
                                        ObjectCode = obj.ReqCode,
                                        ObjectType = "REQUEST_PRICE_FILE",
                                        Path = getSetting.Path,
                                        FolderId = getSetting.FolderId
                                    };
                                    _context.EDMSRepoCatFiles.Add(edmsRepoCatFile);
                                }
                            }
                        }
                    }

                    _context.SaveChanges();
                    msg.ID = model.Id;
                    msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer[""]);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["SRWP_MSG_ADD_ERR"]; /*"Mã Y/C hoặc số đơn hàng đặt hàng đã tồn tại, không thể thêm mới";*/
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
        public JsonResult Update([FromBody] RequestPriceHeader obj)
        {
            JMessage msg = new JMessage() { Error = false };
            try
            {
                var expectedDate = !string.IsNullOrEmpty(obj.sExpectedDate) ? DateTime.ParseExact(obj.sExpectedDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                DateTime? timeTicketCreate = !string.IsNullOrEmpty(obj.STimeTicketCreate) ? DateTime.ParseExact(obj.STimeTicketCreate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var data = _context.RequestPriceHeaders.FirstOrDefault(x => !x.IsDeleted && x.Id == obj.Id);
                if (data != null)
                {
                    data.Title = obj.Title;
                    data.ExpectedDate = expectedDate;
                    data.UpdatedBy = ESEIM.AppContext.UserName;
                    data.UpdatedTime = DateTime.Now;
                    data.TimeTicketCreate = timeTicketCreate;
                    data.UserRequest = obj.UserRequest;

                    if (data.Status != obj.Status)
                    {
                        data.ListStatus.Add(new EDMSStatus
                        {
                            Type = EnumHelper<TypeLogStatus>.GetDisplayValue(TypeLogStatus.StatusReceipt),
                            Status = obj.Status,
                            Reason = "",
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now,
                        });
                        data.LogStatus = JsonConvert.SerializeObject(data.ListStatus);
                    }

                    data.Status = obj.Status;

                    _context.RequestPriceHeaders.Update(data);
                    var file = obj.File;
                    if (file != null)
                    {
                        var check = _context.EDMSFiles.FirstOrDefault(x => x.FileCode.Equals(file.FileCode));
                        if (check == null)
                        {
                            var edmsFile = new EDMSFile
                            {
                                FileCode = file.FileCode,
                                FileName = file.FileName,
                                FileSize = file.FileSize,
                                FileTypePhysic = file.FileTypePhysic,
                                Desc = file.Desc,
                                Tags = file.Tags,
                                Url = file.Url,
                                ReposCode = file.ReposCode,
                                NumberDocument = file.NumberDocument,
                                MimeType = file.MimeType,
                                CloudFileId = file.CloudFileId,
                                CreatedTime = DateTime.Now,
                                CreatedBy = User.Identity.Name,
                            };
                            _context.EDMSFiles.Add(edmsFile);
                            var category = _context.EDMSCategorys.FirstOrDefault(x => x.CatCode == "HG");
                            if (category != null)
                            {
                                var getSetting = _context.EDMSCatRepoSettings.FirstOrDefault(x => x.CatCode == category.CatCode);
                                if (getSetting != null)
                                {
                                    var edmsRepoCatFile = new EDMSRepoCatFile
                                    {
                                        FileCode = file.FileCode,
                                        ReposCode = getSetting.ReposCode,
                                        CatCode = getSetting.CatCode,
                                        ObjectCode = obj.ReqCode,
                                        ObjectType = "REQUEST_PRICE_FILE",
                                        Path = getSetting.Path,
                                        FolderId = getSetting.FolderId
                                    };
                                    _context.EDMSRepoCatFiles.Add(edmsRepoCatFile);
                                }
                            }
                        }
                    }

                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer[""]);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["SRWP_MSG_ERR_REQ_NOT_EXIST"]); //"Y/C đặt hàng không tồn tại, vui lòng làm mới trang";
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
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.RequestPriceHeaders.FirstOrDefault(x => !x.IsDeleted && x.Id == id);
                var status = data.Status;
                if (data != null)
                {
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    data.IsDeleted = true;
                    _context.RequestPriceHeaders.Update(data);
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer[""]);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["SRWP_MSG_ERR_REQ_NOT_EXIST"]); //" Y/C đặt hàng không tồn tại, vui lòng làm mới trang";
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
        public JsonResult GetItem(int Id)
        {
            var msg = new JMessage();
            var data = _context.RequestPriceHeaders.FirstOrDefault(x => x.Id == Id);
            if (data != null)
                data.sExpectedDate = data.ExpectedDate.HasValue ? data.ExpectedDate.Value.ToString("dd/MM/yyyy") : null;

            var session = HttpContext.Session;
            session.SetInt32("IdObject", Id);

            data.File = (from a in _context.EDMSRepoCatFiles
                         join b in _context.EDMSFiles on a.FileCode equals b.FileCode
                         where a.ObjectCode == data.ReqCode && a.ObjectType == "REQUEST_PRICE_FILE"
                         select new EDMSFile
                         {
                             FileID = b.FileID,
                             FileCode = b.FileCode,
                             FileName = b.FileName,
                             Url = b.Url
                         }).AsNoTracking().LastOrDefault();

            msg.Object = data;
            return Json(msg);
        }
        [HttpGet]
        public JsonResult GetActivityStatus(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.RequestPriceHeaders.FirstOrDefault(x => x.Id == id);
                if (data != null)
                {
                    msg.Object = data.ListStatus.Where(x => x.Type != null && x.Type.Equals(EnumHelper<TypeLogStatus>.GetDisplayValue(TypeLogStatus.StatusReceipt))).Select(x => new
                    {
                        Status = !string.IsNullOrEmpty(x.Status) ? _context.CommonSettings.FirstOrDefault(p => !p.IsDeleted && p.CodeSet.Equals(x.Status))?.ValueSet : "",
                        CreatedBy = _context.Users.FirstOrDefault(y => y.UserName == x.CreatedBy).GivenName ?? "",
                        x.Reason,
                        x.CreatedTime
                    });
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
        public JsonResult GenReqCode()
        {
            var monthNow = DateTime.Now.Month;
            var yearNow = DateTime.Now.Year;
            var reqCode = string.Empty;
            var no = 1;
            var noText = "01";
            var data = _context.RequestPriceHeaders.Where(x => x.CreatedTime.Year == yearNow && x.CreatedTime.Month == monthNow).ToList();
            if (data.Count > 0)
            {
                no = data.Count + 1;
                if (no < 10)
                {
                    noText = "0" + no;
                }
                else
                {
                    noText = no.ToString();
                }
            }

            reqCode = string.Format("{0}{1}{2}{3}", "REQ_", "T" + monthNow + ".", yearNow + "_", noText);

            return Json(reqCode);
        }

        [HttpPost]
        [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
        [RequestSizeLimit(long.MaxValue)]
        public JsonResult UploadFile(EDMSRepoCatFileSendRQ obj, IFormFile fileUpload)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                string urlFile = "";
                var mimeType = fileUpload.ContentType;
                string fileId = "";
                var category = _context.EDMSCategorys.FirstOrDefault(x => x.CatCode == "HG");
                if (category != null)
                {
                    var setting = _context.EDMSCatRepoSettings.FirstOrDefault(x => x.CatCode == category.CatCode);
                    if (setting != null)
                    {
                        var getRepository = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == setting.ReposCode);
                        if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server))
                        {
                            using (var ms = new MemoryStream())
                            {
                                fileUpload.CopyTo(ms);
                                var fileBytes = ms.ToArray();
                                urlFile = setting.Path + Path.Combine("/", fileUpload.FileName);
                                var urlFilePreventive = setting.Path + Path.Combine("/", Guid.NewGuid().ToString().Substring(0, 8) + fileUpload.FileName);
                                var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + getRepository.Server + urlFile);
                                var urlEndPreventive = System.Web.HttpUtility.UrlPathEncode("ftp://" + getRepository.Server + urlFilePreventive);
                                var result = FileExtensions.UploadFileToFtpServer(urlEnd, urlEndPreventive, fileBytes, getRepository.Account, getRepository.PassWord);
                                if (result.Status == WebExceptionStatus.ConnectFailure)
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
                            fileId = FileExtensions.UploadFileToDrive(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", fileUpload.FileName, fileUpload.OpenReadStream(), fileUpload.ContentType, setting.FolderId);
                        }

                        var edmsReposCatFile = new EDMSRepoCatFile
                        {
                            FileCode = obj.FileCode,
                            ReposCode = setting.ReposCode,
                            CatCode = category.CatCode,
                            ObjectCode = obj.RqCode,
                            ObjectType = "REQUEST_PRICE_FILE",
                            Path = setting.Path,
                            FolderId = setting.FolderId
                        };
                        _context.EDMSRepoCatFiles.Add(edmsReposCatFile);
                        /// created Index lucene
                        LuceneExtension.IndexFile(obj.FileCode, fileUpload, string.Concat(_hostingEnvironment.WebRootPath, "\\uploads\\luceneIndex"));
                        msg.Object = new
                        {
                            urlFile,
                            fileId,
                            fileTypePhysic = Path.GetExtension(fileUpload.FileName),
                            fileSize = fileUpload.Length,
                            mimeType = fileUpload.ContentType,
                            obj.FileCode,
                            fileUpload.FileName
                        };
                        //add File
                        var file = new EDMSFile
                        {
                            FileCode = obj.FileCode,
                            FileName = fileUpload.FileName,
                            Desc = obj.Desc,
                            ReposCode = setting.ReposCode,
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
                        msg.Title = _sharedResources["COM_MSG_DOWLOAD_SUCCESS"];
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["SRWP_MSG_NO_FORDER"];
                        return Json(msg);
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["SRWP_MSG_BRANCH_NO_FORDER"];
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

        public class EDMSRepoCatFileSendRQ
        {
            public string FileCode { get; set; }
            public string NumberDocument { get; set; }
            public string Tags { get; set; }
            public string Desc { get; set; }
            public string ContractCode { get; set; }
            public string ProjectCode { get; set; }
            public string CustomerCode { get; set; }
            public string SupplierCode { get; set; }
            public string ProductCode { get; set; }
            public string EmployeeCode { get; set; }
            public string WHS_Code { get; set; }
            public int? CateRepoSettingId { get; set; }
            public string CateRepoSettingCode { get; set; }
            public string Path { get; set; }
            public string FolderId { get; set; }
            public string RqCode { get; set; }
            public bool IsMore { get; set; }
        }
        #endregion

        #region Detail
        [HttpPost]
        public object JTableDetail([FromBody] JTableModelRequestPrice jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;

            var query = (from a in _context.RequestPriceDetails.Where(x => !x.IsDeleted && x.ReqCode.Equals(jTablePara.ReqCode))
                         join b in _context.SubProducts on a.ProductCode equals b.ProductQrCode into b1
                         from b2 in b1.DefaultIfEmpty()
                         join c in _context.MaterialProducts on a.ProductCode equals c.ProductCode into c1
                         from c2 in c1.DefaultIfEmpty()
                         join d in _context.Suppliers.Where(x => !x.IsDeleted) on a.SupCode equals d.SupCode into d1
                         from d2 in d1.DefaultIfEmpty()
                         where a.ReqCode.Equals(jTablePara.ReqCode)
                         select new
                         {
                             a.Id,
                             a.ReqCode,
                             ProductName = b2 != null ? b2.AttributeName : c2.ProductName,
                             UnitName = b2 != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b2.Unit)).ValueSet : _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(c2.Unit)).ValueSet,
                             a.ProductCode,
                             a.Quantity,
                             a.Price,
                             a.Note,
                             d2.SupCode,
                             d2.SupName,
                             ProductTypeName = b2 != null ? "Nguyên liệu" : "Thành phẩm",
                         });

            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "ReqCode", "ProductCode", "ProductName", "UnitName", "Quantity", "Price", "Note", "SupCode", "SupName", "ProductTypeName");
            return Json(jdata);
        }

        [HttpPost]
        public JMessage InsertDetail([FromBody] RequestPriceDetail obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var checkExits = _context.RequestPriceHeaders.FirstOrDefault(x => !x.IsDeleted && x.ReqCode.Equals(obj.ReqCode));
                if (checkExits == null)
                {
                    msg.Error = true;
                    //msg.Title = "Vui lòng bấm lưu trước khi thêm sản phẩm";
                    msg.Title = _stringLocalizer["SRWP_MSG_SAVE_BEFORE_INSERT_PRODUCT"];
                    return msg;
                }

                var data = _context.RequestPriceDetails.FirstOrDefault(x => !x.IsDeleted && x.ReqCode.Equals(obj.ReqCode) && x.ProductCode == obj.ProductCode && x.SupCode == obj.SupCode);
                if (data == null)
                {
                    var model = new RequestPriceDetail
                    {
                        ProductCode = obj.ProductCode,
                        ProductType = obj.ProductType,
                        Quantity = obj.Quantity,
                        Price = obj.Price,
                        ReqCode = obj.ReqCode,
                        Note = obj.Note,
                        SupCode = obj.SupCode,
                        CreatedBy = User.Identity.Name,
                        CreatedTime = DateTime.Now
                    };
                    _context.RequestPriceDetails.Add(model);
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer[""]);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["SRWP_MSG_ADD_PRO_CODE_EXTSTED"]);// "Mã sản phẩm đã tồn tại, không thể thêm mới";
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
        public JsonResult UpdateDetail([FromBody] RequestPriceDetail obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.RequestPriceDetails.FirstOrDefault(x => !x.IsDeleted && x.ReqCode.Equals(obj.ReqCode) && x.ProductCode == obj.ProductCode && x.SupCode == obj.SupCode);
                if (data != null)
                {
                    data.Quantity = obj.Quantity;
                    data.Price = obj.Price;
                    data.Note = obj.Note;
                    data.SupCode = obj.SupCode;
                    data.UpdatedBy = ESEIM.AppContext.UserName;
                    data.UpdatedTime = DateTime.Now;

                    _context.RequestPriceDetails.Update(data);
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer[""]);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["SRWP_MSG_UPDATE_PRO_CODE_NOT_EXIST"]);// "Mã sản phẩm không tồn tại tồn tại, không thể chỉnh sửa";
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
        public JsonResult DeleteDetail(int id)
        {
            JMessage msg = new JMessage() { Error = false };
            try
            {
                var data = _context.RequestPriceDetails.FirstOrDefault(x => !x.IsDeleted && x.Id == id);
                if (data != null)
                {
                    data.IsDeleted = true;
                    _context.RequestPriceDetails.Update(data);
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer[""]);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["SRWP_MSG_DEL_PRO_CODE_NOT_EXIST"]); //"Mã sản phẩm không tồn tại tồn tại, không thể xóa";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }
        #endregion

        #region File
        public class JTableModelFile : JTableModel
        {
            public int? FileID { get; set; }
            public string RequestCode { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string CatCode { get; set; }
        }

        [HttpPost]
        public object JTableFile([FromBody] JTableModelFile jTablePara)
        {
            if (string.IsNullOrEmpty(jTablePara.RequestCode))
            {
                return JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "Id", "FileName", "FileTypePhysic", "Desc", "Url", "CreatedTime", "UpdatedTime", "ReposName", "TypeFile", "FileID");
            }
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var query = ((from a in _context.EDMSRepoCatFiles.Where(x => x.ObjectCode == jTablePara.RequestCode && x.ObjectType == EnumHelper<ContractEnum>.GetDisplayValue(ContractEnum.RequestWorkPrice))
                          join b in _context.EDMSFiles.Where(x => !x.IsDeleted && x.IsFileMaster == null || x.IsFileMaster == true) on a.FileCode equals b.FileCode
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
                              b.IsFileMaster,
                              b.EditedFileBy,
                              b.EditedFileTime,
                              b.FileID,
                          }).Union(
                  from a in _context.EDMSObjectShareFiles.Where(x => x.ObjectCode == jTablePara.RequestCode && x.ObjectType == EnumHelper<ContractEnum>.GetDisplayValue(ContractEnum.RequestWorkPrice))
                  join b in _context.EDMSFiles.Where(x => !x.IsDeleted && (x.IsFileMaster == null || x.IsFileMaster == true)) on a.FileCode equals b.FileCode
                  join f in _context.EDMSRepositorys on b.ReposCode equals f.ReposCode into f1
                  from f in f1.DefaultIfEmpty()
                  select new
                  {
                      Id = b.FileID,
                      b.FileCode,
                      b.FileName,
                      b.FileTypePhysic,
                      Desc = b.Desc != null ? b.Desc : "",
                      b.CreatedTime,
                      b.CloudFileId,
                      TypeFile = "SHARE",
                      ReposName = f != null ? f.ReposName : "",
                      b.IsFileMaster,
                      b.EditedFileBy,
                      b.EditedFileTime,
                      b.FileID,
                  })).AsNoTracking();
            int count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "FileCode", "FileName", "FileTypePhysic", "Desc", "CreatedTime", "CloudFileId", "ReposName", "TypeFile", "IsFileMaster", "EditedFileBy", "EditedFileTime", "FileID");
            return jdata;
        }

        [HttpPost]
        public object JTableFileHistory([FromBody] JTableModelFile jTablePara)
        {
            if (string.IsNullOrEmpty(jTablePara.RequestCode) || jTablePara.FileID == null)
            {
                return JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "Id", "FileName", "FileTypePhysic", "Desc", "Url", "CreatedTime", "UpdatedTime", "ReposName", "TypeFile", "IsFileMaster", "EditedFileBy", "EditedFileTime", "FileID");
            }
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var query = (from a in _context.EDMSRepoCatFiles.Where(x => x.ObjectCode == jTablePara.RequestCode && x.ObjectType == EnumHelper<ContractEnum>.GetDisplayValue(ContractEnum.RequestWorkPrice))
                         join b in _context.EDMSFiles.Where(x => !x.IsDeleted && x.FileParentId.Equals(jTablePara.FileID) && (x.IsFileMaster == null || x.IsFileMaster == false)) on a.FileCode equals b.FileCode
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
                             b.IsFileMaster,
                             EditedFileBy = _context.Users.FirstOrDefault(x => x.UserName.Equals(b.EditedFileBy)) != null ? _context.Users.FirstOrDefault(x => x.UserName.Equals(b.EditedFileBy)).GivenName : "",
                             b.EditedFileTime,
                         }).AsNoTracking();
            int count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "FileCode", "FileName", "FileTypePhysic", "Desc", "CreatedTime", "CloudFileId", "ReposName", "TypeFile", "IsFileMaster", "EditedFileBy", "EditedFileTime");
            return jdata;
        }

        [HttpPost]
        [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
        [RequestSizeLimit(long.MaxValue)]
        public JsonResult InsertContractFile(EDMSRepoCatFileModel obj, IFormFile fileUpload)
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
                        //var suggesstion = GetSuggestionsContractFile(obj.RequestCode);
                        //if (suggesstion != null)
                        //{
                        //    reposCode = suggesstion.ReposCode;
                        //    path = suggesstion.Path;
                        //    folderId = suggesstion.FolderId;
                        //    catCode = suggesstion.CatCode;
                        //}
                        //else
                        //{
                        //    msg.Error = true;
                        //    msg.Title = String.Format(_contractController["CONTRACT_MSG_ADD_MR_NOT_BLANK"]);
                        //    return Json(msg);
                        //}
                        var repoDefault = _context.EDMSRepoDefaultObjects.FirstOrDefault(x => !x.IsDeleted
                               && x.ObjectCode.Equals(obj.RequestCode) && x.ObjectType.Equals(EnumHelper<ObjectType>.GetDisplayValue(ObjectType.RqPrice)));
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
                            msg.Title = String.Format(_contractController["CONTRACT_MSG_ADD_CHOOSE_FILE"]);
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
                        FileCode = string.Concat(EnumHelper<ContractEnum>.GetDisplayValue(ContractEnum.RequestWorkPrice), Guid.NewGuid().ToString()),
                        ReposCode = reposCode,
                        CatCode = catCode,
                        ObjectCode = obj.RequestCode,
                        ObjectType = EnumHelper<ContractEnum>.GetDisplayValue(ContractEnum.RequestWorkPrice),
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
                        Desc = obj.Desc != null ? obj.Desc : "",
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
                        IsFileMaster = true
                    };
                    _context.EDMSFiles.Add(file);
                    _context.SaveChanges();
                    msg.Title = String.Format(_contractController["CONTRACT_MSG_ADD_FILE_SUCCESS"]);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_contractController["CONTRACT_MSG_ADD_FILE_FORMAT"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(_contractController["CONTRACT_MSG_ADD_FAILED"]);
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateContractFile(EDMSRepoCatFileModel obj)
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
                        msg.Title = String.Format(_contractController["CONTRACR_MSG_UPDATE_CUS_CONTRACT_INFO_SUCCESS"]);
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = String.Format(_contractController["CONTRACT_MSG_ADD_CHOOSE_FILE"]);
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_contractController["CONTRACT_MSG_UPDATE_FILE_NOT_EXIST"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_FAILED"], _contractController[""]);// "Có lỗi xảy ra khi cập nhật!";
                msg.Object = ex;
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult DeleteContractFile(int id)
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
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _contractController[""]);// "Xóa thành công";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_FAIL"], _contractController[""]);//"Có lỗi xảy ra khi xóa!";
                msg.Object = ex;
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetContractFile(int id)
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
                    msg.Title = String.Format(_contractController["CONTRACT_MSG_FILE_DOES_NOT_EXIST"]);//"Tệp tin không tồn tại!";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = String.Format(_sharedResources["COM_MSG_ERR"], _contractController[""]);//"Có lỗi xảy ra khi xóa!";         
            }
            return Json(msg);
        }

        [HttpGet]
        public EDMSRepoCatFile GetSuggestionsContractFile(string requestCode)
        {
            var query = _context.EDMSRepoCatFiles.Where(x => x.ObjectCode == requestCode && x.ObjectType == EnumHelper<ContractEnum>.GetDisplayValue(ContractEnum.RequestWorkPrice)).MaxBy(x => x.Id);
            return query;
        }
        #endregion

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_cardJobController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_contractController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerFp.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_fileObjectShareController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_edmsRepositoryController.GetAllStrings().Select(x => new { x.Name, x.Value }))
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