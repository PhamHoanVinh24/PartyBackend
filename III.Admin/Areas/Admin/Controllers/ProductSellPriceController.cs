using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Options;
using System.Collections.Generic;
using System.Globalization;
using System.Threading.Tasks;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using ESEIM;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class ProductSellPriceController : BaseController
    {

        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly EIMDBContext _context;
        private readonly ILogger _logger;
        private readonly IActionLogService _actionLog;
        private readonly AppSettings _appSettings;
        private readonly IUploadService _upload;
        private static AsyncLocker<string> userLock = new AsyncLocker<string>();
        private readonly IStringLocalizer<ProductSellPriceController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public ProductSellPriceController(EIMDBContext context, IUploadService upload, IOptions<AppSettings> appSettings, IHostingEnvironment hostingEnvironment, IActionLogService actionLog, IStringLocalizer<ProductSellPriceController> stringLocalizer, 
            IStringLocalizer<SharedResources> sharedResources)
        {

            _context = context;
            _hostingEnvironment = hostingEnvironment;
            _actionLog = actionLog;
            _appSettings = appSettings.Value;
            _upload = upload;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }
        [Breadcrumb("ViewData.CrumbProdSellPrice", AreaName = "Admin", FromAction = "Index", FromController = typeof(SaleWareHouseHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuStore"] = _sharedResources["COM_CRUMB_MENU_STORE"];
            ViewData["CrumbSaleWHHome"] = _sharedResources["COM_CRUMB_SALE_WH"];
            ViewData["CrumbProdSellPrice"] = _sharedResources["COM_CRUMB_PROD_SELL"];
            return View("Index");
        }

        [HttpPost]
        public object JTable([FromBody]JTableModelCustom jTablePara)
        {
            DateTime now = DateTime.Now;
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.ProductCostHeaders
                        join b in _context.Users.Where(x => x.Active) on a.CreatedBy equals b.UserName
                        where a.IsDeleted == false
                        && (string.IsNullOrEmpty(jTablePara.Title) || (a.Title.ToLower().Contains(jTablePara.Title.ToLower())))
                        && (string.IsNullOrEmpty(jTablePara.Status) || (a.Status.ToLower().Equals(jTablePara.Status.ToLower())))
                        select new JTableHeaderRes
                        {
                            Id = a.Id,
                            Title = a.Title,
                            Note = a.Note,
                            EffectiveDate = a.EffectiveDate,
                            ExpiryDate = a.ExpiryDate,
                            CreatedTime = a.CreatedTime,
                            CreatedBy = b.GivenName,
                            QrCode = a.HeaderCode + "_" + (a.EffectiveDate != null ? a.EffectiveDate.ToString("dd/MM/yyyy") : "") + "_" + (a.ExpiryDate != null ? a.ExpiryDate.ToString("dd/MM/yyyy") : "")
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).AsNoTracking().ToList();
            var data1 = data.Skip(intBeginFor).Take(jTablePara.Length).ToList();
            //foreach (var item in data1)
            //{
            //    item.QrCode = CommonUtil.GenerateQRCode(item.QrCode);
            //}
            var jdata = JTableHelper.JObjectTable(data1, jTablePara.Draw, count, "Id", "Title", "Note", "EffectiveDate", "ExpiryDate", "QrCode", "CreatedTime", "CreatedBy");
            return Json(jdata);
        }

        //--------------------------------thêm mới---------------------------   
        [HttpPost]
        public object Insert([FromBody]ProductCostHeader obj)
        {
            var expiryDate = !string.IsNullOrEmpty(obj.sExpiryDate) ? DateTime.ParseExact(obj.sExpiryDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;
            var effectiveDate = !string.IsNullOrEmpty(obj.sEffectiveDate) ? DateTime.ParseExact(obj.sEffectiveDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;
            var msg = new JMessage();
            try
            {
                var check = ValidateDate(effectiveDate, expiryDate, obj.Id);
                if (!check.Error)
                {
                    obj.CreatedBy = User.Identity.Name;
                    obj.CreatedTime = DateTime.Now;
                    obj.IsDeleted = false;
                    obj.ExpiryDate = expiryDate;
                    obj.EffectiveDate = effectiveDate;
                    obj.EffectiveDate = effectiveDate;
                    obj.GivenName = _context.Users.FirstOrDefault(x => x.UserName.Equals(obj.CreatedBy))?.GivenName;
                    obj.HeaderCode = Guid.NewGuid().ToString();
                    _context.ProductCostHeaders.Add(obj);
                    _context.SaveChanges();
                    msg.Error = false;
                    msg.Title = String.Format(_stringLocalizer["PSP_MSG_ADD_SUCCESS"]); //"Thêm thành công";
                    msg.Object = obj;
                }
                else
                {
                    msg = check;
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Object = ex;
                msg.Title = String.Format(_sharedResources["COM_ERR_ADD"]);
            }
            return msg;
        }
        [HttpPost]
        public object Delete(int Id)
        {
            var msg = new JMessage();
            try
            {
                var data = _context.ProductCostHeaders.FirstOrDefault(x => x.Id == Id && x.IsDeleted == false);
                if (data != null)
                {
                    data.IsDeleted = true;
                    data.DeletedBy = User.Identity.Name;
                    data.DeletedTime = DateTime.Now;
                    _context.ProductCostHeaders.Update(data);
                    _context.SaveChanges();
                    msg.Error = false;
                    msg.Title = String.Format(_stringLocalizer["PSP_MSG_DELETE_SUCCESS"]); //"Xóa thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["PSP_MSG_DELETE_REFRESH"]); //"Bản ghi không tồn tại, vui lòng làm mới trang";
                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_ERR_ADD"]);
            }
            return msg;

        }

        [HttpPost]
        public object GetItem(int Id)
        {
            JMessage msg = new JMessage() { Error = false };
            try
            {
                var data = _context.ProductCostHeaders.FirstOrDefault(x => x.Id == Id && x.IsDeleted == false);
                data.GivenName = _context.Users.FirstOrDefault(x => x.UserName.Equals(data.CreatedBy))?.GivenName;
                msg.Object = data;
                if (data == null)
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["PSP_MSG_REFRESH"]); //"Bản ghi không tòn tại, vui lòng làm mới trang";
                }
            }
            catch (Exception ex) { }
            return msg;
        }

        [HttpPost]
        public object Update([FromBody]ProductCostHeader obj)
        {
            var expiryDate = !string.IsNullOrEmpty(obj.sExpiryDate) ? DateTime.ParseExact(obj.sExpiryDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;
            var effectiveDate = !string.IsNullOrEmpty(obj.sEffectiveDate) ? DateTime.ParseExact(obj.sEffectiveDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;
            var msg = new JMessage();
            try
            {
                var data = _context.ProductCostHeaders.FirstOrDefault(x => x.HeaderCode == obj.HeaderCode && x.IsDeleted == false);
                if (data != null)
                {
                    var check = ValidateDate(effectiveDate, expiryDate, obj.Id);
                    if (!check.Error)
                    {
                        data.UpdatedBy = User.Identity.Name;
                        data.UpdatedTime = DateTime.Now;
                        data.Title = obj.Title;
                        data.Note = obj.Note;
                        data.ExpiryDate = expiryDate;
                        data.EffectiveDate = effectiveDate;
                        data.ResponsibleUser = obj.ResponsibleUser;
                        data.Status = obj.Status;

                        _context.ProductCostHeaders.Update(data);
                        _context.SaveChanges();
                        msg.Error = false;
                        msg.Title = String.Format(_stringLocalizer["PSP_MSG_UPDATE_SUCCESS"]); //"Cập nhật thành công";
                        msg.Object = obj;
                    }
                    else
                    {
                        msg = check;
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["PSP_MSG_REFRESH"]); //"Bản ghi không tồn tại, vui lòng làm mới trang";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_ERR_ADD"]);
            }
            return msg;

        }

        [HttpPost]
        public object InsertProductPriceDetail([FromBody]ProductCostDetail obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.ProductCostDetails.FirstOrDefault(x => x.HeaderCode == obj.HeaderCode && x.ProductCode == obj.ProductCode && !x.IsDeleted);
                if (data == null)
                {
                    obj.CreatedBy = User.Identity.Name;
                    obj.CreatedTime = DateTime.Now;

                    _context.ProductCostDetails.Add(obj);
                    _context.SaveChanges();
                    msg.Error = false;
                    msg.Title = String.Format(_stringLocalizer["PSP_MSG_ADD_SUCCESS"]); //"Thêm mới thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["PSP_MSG_REFRESH"]); //"Sản phẩm đã tồn tại, vui lòng chọn chỉnh sửa";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["PSP_MSG_ERROR"]); //"Có lỗi xảy ra!";
                msg.Object = ex;
            }
            return Json(msg);
        }

        [HttpPost]
        public object UpdateProductPriceDetail([FromBody]ProductCostDetail obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.ProductCostDetails.FirstOrDefault(x => x.Id == obj.Id && x.IsDeleted == false);
                if (data != null)
                {
                    var changeNumber = 1;

                    var costTableLogMax = _context.CostTableLogs.MaxBy(x => x.ChangeNumber);
                    if (costTableLogMax != null)
                        changeNumber = costTableLogMax.ChangeNumber + 1;

                    var prdCostHeader = _context.ProductCostHeaders.FirstOrDefault(x => x.HeaderCode.Equals(data.HeaderCode));
                    if (prdCostHeader != null)
                    {
                        var costTableLog = new CostTableLog
                        {
                            PriceCostDefault = data.PriceCostDefault,
                            PriceCostCatelogue = data.PriceCostCatelogue,
                            PriceCostAirline = data.PriceCostAirline,
                            PriceCostSea = data.PriceCostSea,
                            PriceRetailBuild = data.PriceRetailBuild,
                            PriceRetailBuildAirline = data.PriceRetailBuild,
                            PriceRetailBuildSea = data.PriceRetailBuild,
                            PriceRetailNoBuild = data.PriceRetailBuild,
                            PriceRetailNoBuildAirline = data.PriceRetailBuild,
                            PriceRetailNoBuildSea = data.PriceRetailBuild,
                            HeaderCode = data.HeaderCode,
                            Tax = data.Tax,
                            CreatedBy = data.CreatedBy,
                            CreatedTime = data.CreatedTime,
                            ProductCode = data.ProductCode,
                            IsDeleted = data.IsDeleted,
                            Catelogue = data.Catelogue,
                            RecordStatus = "OLD",
                            ChangeNumber = changeNumber,
                            FromDate = prdCostHeader.EffectiveDate,
                            ToDate = prdCostHeader.ExpiryDate
                        };

                        InsertCostTableLog(costTableLog);
                    }

                    data.Tax = obj.Tax;
                    data.PriceCost = obj.PriceCost;
                    data.PriceCostDefault = obj.PriceCostDefault;
                    data.PriceCostCatelogue = obj.PriceCostCatelogue;
                    data.PriceCostAirline = obj.PriceCostAirline;
                    data.PriceCostSea = obj.PriceCostSea;
                    data.PriceRetailBuild = obj.PriceRetailBuild;
                    data.PriceRetailBuildAirline = obj.PriceRetailBuildAirline;
                    data.PriceRetailBuildSea = obj.PriceRetailBuildSea;
                    data.PriceRetailNoBuild = obj.PriceRetailNoBuild;
                    data.PriceRetailNoBuildAirline = obj.PriceRetailNoBuildAirline;
                    data.PriceRetailNoBuildSea = obj.PriceRetailNoBuildSea;
                    data.UpdatedBy = User.Identity.Name;
                    data.UpdatedTime = DateTime.Now;

                    _context.ProductCostDetails.Update(data);
                    _context.SaveChanges();

                    if (prdCostHeader != null)
                    {
                        var costTableLog = new CostTableLog
                        {
                            PriceCostDefault = data.PriceCostDefault,
                            PriceCostCatelogue = data.PriceCostCatelogue,
                            PriceCostAirline = data.PriceCostAirline,
                            PriceCostSea = data.PriceCostSea,
                            PriceRetailBuild = data.PriceRetailBuild,
                            PriceRetailBuildAirline = data.PriceRetailBuild,
                            PriceRetailBuildSea = data.PriceRetailBuild,
                            PriceRetailNoBuild = data.PriceRetailBuild,
                            PriceRetailNoBuildAirline = data.PriceRetailBuild,
                            PriceRetailNoBuildSea = data.PriceRetailBuild,
                            HeaderCode = data.HeaderCode,
                            Tax = data.Tax,
                            CreatedBy = data.CreatedBy,
                            CreatedTime = data.CreatedTime,
                            ProductCode = data.ProductCode,
                            IsDeleted = data.IsDeleted,
                            Catelogue = data.Catelogue,
                            RecordStatus = "NEW",
                            ChangeNumber = changeNumber,
                            FromDate = prdCostHeader.EffectiveDate,
                            ToDate = prdCostHeader.ExpiryDate
                        };

                        InsertCostTableLog(costTableLog);
                    }
                    msg.Error = false;
                    msg.Title = String.Format(_stringLocalizer["PSP_MSG_UPDATE_SUCCESS"]); //"Cập nhật thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["PSP_MSG_PRODUCT_EDIT"]); //"Sản phẩm không tồn tại";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["PSP_MSG_ERROR"]); //"Có lỗi xảy ra!";
                msg.Object = ex;
            }
            return Json(msg);
        }

        [HttpPost]
        public object UpdateProductPriceChange([FromBody]ProductCostDetail obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                if (obj.ListProductProcess.Count > 0)
                {
                    var changeNumber = 1;

                    var costTableLogMax = _context.CostTableLogs.MaxBy(x => x.ChangeNumber);
                    if (costTableLogMax != null)
                        changeNumber = costTableLogMax.ChangeNumber + 1;

                    foreach (var item in obj.ListProductProcess)
                    {
                        var data = _context.ProductCostDetails.FirstOrDefault(x => x.Id == item.Id && x.IsDeleted == false);
                        if (data != null)
                        {
                            var prdCostHeader = _context.ProductCostHeaders.FirstOrDefault(x => x.HeaderCode.Equals(data.HeaderCode));
                            if (prdCostHeader != null)
                            {
                                var costTableLog = new CostTableLog
                                {
                                    PriceCostCatelogue = data.PriceCostCatelogue,
                                    PriceCostAirline = data.PriceCostAirline,
                                    PriceCostSea = data.PriceCostSea,
                                    PriceRetailBuild = data.PriceRetailBuild,
                                    PriceRetailBuildAirline = data.PriceRetailBuild,
                                    PriceRetailBuildSea = data.PriceRetailBuild,
                                    PriceRetailNoBuild = data.PriceRetailBuild,
                                    PriceRetailNoBuildAirline = data.PriceRetailBuild,
                                    PriceRetailNoBuildSea = data.PriceRetailBuild,
                                    HeaderCode = data.HeaderCode,
                                    Tax = data.Tax,
                                    CreatedBy = data.CreatedBy,
                                    CreatedTime = data.CreatedTime,
                                    ProductCode = data.ProductCode,
                                    IsDeleted = data.IsDeleted,
                                    Catelogue = data.Catelogue,
                                    RecordStatus = "OLD",
                                    ChangeNumber = changeNumber,
                                    FromDate = prdCostHeader.EffectiveDate,
                                    ToDate = prdCostHeader.ExpiryDate
                                };

                                InsertCostTableLog(costTableLog);
                            }

                            if (obj.Tax > 0)
                                data.Tax = obj.Tax;

                            data.PriceCostCatelogue = obj.RatePriceCostCatelogue != null ? data.PriceCostCatelogue * obj.RatePriceCostCatelogue : data.PriceCostCatelogue;
                            data.PriceCostAirline = obj.RatePriceCostAirline != null ? data.PriceCostAirline * obj.RatePriceCostAirline : data.PriceCostAirline;
                            data.PriceCostSea = obj.RatePriceCostSea != null ? data.PriceCostSea * obj.RatePriceCostSea : data.PriceCostSea;
                            data.PriceRetailBuild = obj.RatePriceRetailBuild != null ? data.PriceRetailBuild * obj.RatePriceRetailBuild : data.PriceRetailBuild;
                            data.PriceRetailBuildAirline = obj.RatePriceRetailBuildAirline != null ? data.PriceRetailBuildAirline * obj.RatePriceRetailBuildAirline : data.PriceRetailBuildAirline;
                            data.PriceRetailBuildSea = obj.RatePriceRetailBuildSea != null ? data.PriceRetailBuildSea * obj.RatePriceRetailBuildSea : data.PriceRetailBuildSea;
                            data.PriceRetailNoBuild = obj.RatePriceRetailNoBuild != null ? data.PriceRetailNoBuild * obj.RatePriceRetailNoBuild : data.PriceRetailNoBuild;
                            data.PriceRetailNoBuildAirline = obj.RatePriceRetailNoBuildAirline != null ? data.PriceRetailNoBuildAirline * obj.RatePriceRetailNoBuildAirline : data.PriceRetailNoBuildAirline;
                            data.PriceRetailNoBuildSea = obj.RatePriceRetailNoBuildSea != null ? data.PriceRetailNoBuildSea * obj.RatePriceRetailNoBuildSea : data.PriceRetailNoBuildSea;
                            data.UpdatedBy = User.Identity.Name;
                            data.UpdatedTime = DateTime.Now;

                            _context.ProductCostDetails.Update(data);
                            _context.SaveChanges();

                            if (prdCostHeader != null)
                            {
                                var costTableLog = new CostTableLog
                                {
                                    PriceCostCatelogue = data.PriceCostCatelogue,
                                    PriceCostAirline = data.PriceCostAirline,
                                    PriceCostSea = data.PriceCostSea,
                                    PriceRetailBuild = data.PriceRetailBuild,
                                    PriceRetailBuildAirline = data.PriceRetailBuild,
                                    PriceRetailBuildSea = data.PriceRetailBuild,
                                    PriceRetailNoBuild = data.PriceRetailBuild,
                                    PriceRetailNoBuildAirline = data.PriceRetailBuild,
                                    PriceRetailNoBuildSea = data.PriceRetailBuild,
                                    HeaderCode = data.HeaderCode,
                                    Tax = data.Tax,
                                    CreatedBy = data.CreatedBy,
                                    CreatedTime = data.CreatedTime,
                                    ProductCode = data.ProductCode,
                                    IsDeleted = data.IsDeleted,
                                    Catelogue = data.Catelogue,
                                    RecordStatus = "NEW",
                                    ChangeNumber = changeNumber,
                                    FromDate = prdCostHeader.EffectiveDate,
                                    ToDate = prdCostHeader.ExpiryDate
                                };

                                InsertCostTableLog(costTableLog);
                            }

                            msg.Error = false;
                            msg.Title = String.Format(_stringLocalizer["PSP_MSG_UPDATE_SUCCESS"]); //"Cập nhật thành công";
                        }
                        else
                        {
                            msg.Error = true;
                            msg.Title = String.Format(_stringLocalizer["PSP_MSG_PRODUCT_NO_EXIST"]); //"Sản phẩm không tồn tại";
                        }
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["PSP_MSG_LIST_PRODUCT_NULL"]); //"Danh sách sản phẩm trống";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["PSP_MSG_ERROR"]); //"Có lỗi xảy ra!";
                msg.Object = ex;
            }
            return Json(msg);
        }

        [HttpPost]
        public object InsertCostTableLog(CostTableLog obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                if (obj != null)
                {
                    _context.CostTableLogs.Add(obj);
                    _context.SaveChanges();
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["PSP_MSG_ERROR"]); //"Có lỗi xảy ra!";
                msg.Object = ex;
            }
            return Json(msg);
        }

        [HttpPost]
        public object GetProductInLot()
        {
            var query = (from a in _context.ProdReceivedDetails.Where(x => !x.IsDeleted && x.ProductType == "FINISHED_PRODUCT")
                         join b in _context.LotProducts on a.LotProductCode equals b.LotProductCode into b2
                         from b1 in b2.DefaultIfEmpty()
                         join c in _context.MaterialProducts on a.ProductCode equals c.ProductCode
                         select new
                         {
                             Code = a.ProductQrCode,
                             Name = a.ProductQrCode
                         })
                        .Concat(from a in _context.ProdReceivedDetails.Where(x => !x.IsDeleted && x.ProductType == "SUB_PRODUCT")
                                join b in _context.LotProducts on a.LotProductCode equals b.LotProductCode into b2
                                from b1 in b2.DefaultIfEmpty()
                                join c in _context.SubProducts on a.ProductCode equals c.ProductQrCode
                                select new
                                {
                                    Code = a.ProductQrCode,
                                    Name = a.ProductQrCode
                                });
            return Json(query.ToList());
        }
        [HttpPost]
        public object JTableDetail([FromBody]JTableDetailModel jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = (from a in _context.ProductCostDetails.Where(x => !x.IsDeleted)
                         join c in _context.SubProducts.Where(x => !x.IsDeleted) on a.ProductCode equals c.ProductQrCode into c1
                         from c2 in c1.DefaultIfEmpty()
                         join d in _context.MaterialProducts on a.ProductCode equals d.ProductCode into d1
                         from d2 in d1.DefaultIfEmpty()
                         where a.HeaderCode == jTablePara.HeaderCode
                         && (string.IsNullOrEmpty(jTablePara.ProductCodeSearch) || a.ProductCode.Equals(jTablePara.ProductCodeSearch))
                         && (string.IsNullOrEmpty(jTablePara.ProductCatelogueCodeSearch) || a.Catelogue.Equals(jTablePara.ProductCatelogueCodeSearch))
                         select new ProductCostDetail
                         {
                             Id = a.Id,
                             ProductCode = a.ProductCode,
                             ProductType = (c2 != null ? "SUB_PRODUCT" : "FINISHED_PRODUCT"),
                             ProductName = (c2 != null ? c2.AttributeName : d2 != null ? d2.ProductName : null),
                             PriceCost = a.PriceCost,
                             PriceRetail = a.PriceRetail,
                             Tax = a.Tax,
                             PriceCostDefault = a.PriceCostDefault,
                             PriceCostCatelogue = a.PriceCostCatelogue,
                             PriceCostAirline = a.PriceCostAirline,
                             PriceCostSea = a.PriceCostSea,
                             PriceRetailBuild = a.PriceRetailBuild,
                             PriceRetailBuildAirline = a.PriceRetailBuildAirline,
                             PriceRetailBuildSea = a.PriceRetailBuildSea,
                             PriceRetailNoBuild = a.PriceRetailNoBuild,
                             PriceRetailNoBuildAirline = a.PriceRetailNoBuildAirline,
                             PriceRetailNoBuildSea = a.PriceRetailNoBuildSea,
                             Catelogue = a.Catelogue
                         });

            var count = query.Count();
            var data = query.Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();

            foreach (var item in data)
            {
                if (string.IsNullOrEmpty(item.ProductName))
                {
                    item.ProductName = _context.SubProducts.LastOrDefault(p => p.ProductQrCode.Equals(item.ProductCode)) != null ? _context.SubProducts.LastOrDefault(p => p.ProductQrCode.Equals(item.ProductCode)).AttributeName : item.ProductName;
                    if (string.IsNullOrEmpty(item.ProductName))
                        item.ProductName = _context.MaterialProducts.LastOrDefault(p => p.ProductCode.Equals(item.ProductCode)) != null ? _context.MaterialProducts.LastOrDefault(p => p.ProductCode.Equals(item.ProductCode)).ProductName : item.ProductName;
                }
            };
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "ProductCode", "ProductName", "PriceCost", "PriceRetail", "Tax", "PriceCostDefault", "QrCode", "PriceCostCatelogue", "PriceCostAirline", "PriceCostSea", "PriceRetailBuild", "PriceRetailBuildAirline", "PriceRetailBuildSea", "PriceRetailNoBuild", "PriceRetailNoBuildAirline", "PriceRetailNoBuildSea");
            return Json(jdata);
        }

        [HttpPost]
        public object GetProductDetail(string headerCode, string productCatelogueCodeSearch, string productCodeSearch)
        {
            var query = (from a in _context.ProductCostDetails.Where(x => !x.IsDeleted)
                         join c in _context.SubProducts.Where(x => !x.IsDeleted) on a.ProductCode equals c.ProductQrCode into c1
                         from c2 in c1.DefaultIfEmpty()
                         join d in _context.MaterialProducts.Where(x => !x.IsDeleted) on a.ProductCode equals d.ProductCode into d1
                         from d2 in d1.DefaultIfEmpty()
                         where a.HeaderCode == headerCode
                         && (string.IsNullOrEmpty(productCodeSearch) || a.ProductCode.Equals(productCodeSearch))
                         && (string.IsNullOrEmpty(productCatelogueCodeSearch) || c2.ProductCode.Equals(productCatelogueCodeSearch))
                         select new
                         {
                             a.Id,
                         }).AsNoTracking().ToList();

            return Json(query);
        }

        public object DeleteProduct(int Id)
        {
            JMessage msg = new JMessage();
            var data = _context.ProductCostDetails.FirstOrDefault(x => x.Id == Id && x.IsDeleted == false);
            if (data != null)
            {
                data.IsDeleted = true;
                data.DeletedBy = User.Identity.Name;
                data.DeletedTime = DateTime.Now;
                _context.ProductCostDetails.Update(data);
                _context.SaveChanges();
                msg.Error = false;
                msg.Title = String.Format(_stringLocalizer["PSP_MSG_DELETE_SUCCESS"]); //"Xóa thành công";
            }
            else
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["PSP_MSG_RECORD_NO_EXIST"]); //"Bản ghi không tồn tại";
            }

            return Json(msg);
        }
        public object GetProductitem(int Id)
        {
            JMessage msg = new JMessage();
            var data = _context.ProductCostDetails.FirstOrDefault(x => x.Id == Id && !x.IsDeleted);
            msg.Object = data;
            return Json(msg);
        }
        [HttpPost]
        public object GetProductCatelogue()
        {
            var query = _context.MaterialProducts.Where(x => !x.IsDeleted && x.TypeCode.Equals("SUB_PRODUCT"))
                                                 .Select(x => new { Code = x.ProductCode, Name = x.ProductName }).ToList();
            return query;
        }

        [HttpPost]
        public object GetListProduct(string catelogue)
        {
            try
            {
                var listData = (from a in _context.ProductCostDetails.Where(x => !x.IsDeleted)
                                join b in _context.SubProducts on a.ProductCode equals b.ProductQrCode into b1
                                from b2 in b1.DefaultIfEmpty()
                                join c in _context.MaterialProducts on a.ProductCode equals c.ProductCode into c1
                                from c2 in c1.DefaultIfEmpty()
                                where (string.IsNullOrEmpty(catelogue) || a.Catelogue.Equals(catelogue)) && (c2 != null || b2 != null)
                                select new
                                {
                                    Code = a.ProductCode,
                                    Name = c2 != null ? string.Format("Thành phẩm_{0}-{1}", c2.ProductName, c2.ProductCode) : string.Format("{0}-{1}_{2}", _context.MaterialProducts.FirstOrDefault(p => p.ProductCode.Equals(b2.ProductCode)) != null ? _context.MaterialProducts.FirstOrDefault(p => p.ProductCode.Equals(b2.ProductCode)).ProductName : null, b2.ProductCode, b2.AttributeCode),
                                }).AsNoTracking().ToList();
                var listDataRs = listData.GroupBy(x => x.Code)
                    .Select(x => new
                    {
                        x.First().Code,
                        x.First().Name
                    }).ToList();
                return listDataRs;
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }

        [HttpGet]
        public async Task<object> LoadAll(string headerCode)
        {
            JMessage msg = new JMessage();
            try
            {
                using (await userLock.LockAsync(headerCode))
                {
                    var rs = _context.SubProducts.Where(x => !x.IsDeleted).Select(x => new
                    {
                        Catelogue = x.ProductCode,
                        ProductCode = x.ProductQrCode,
                        ProductType = "SUB_PRODUCT",
                        PriceM = x.PricePerM,
                        PriceM2 = x.PricePerM2,
                        x.PriceCostCatelogue,
                        x.PriceCostAirline,
                        x.PriceCostSea,
                        x.PriceRetailBuild,
                        x.PriceRetailBuildAirline,
                        x.PriceRetailBuildSea,
                        x.PriceRetailNoBuild,
                        x.PriceRetailNoBuildAirline,
                        x.PriceRetailNoBuildSea,
                    });

                    var rs1 = _context.MaterialProducts.Where(x => !x.IsDeleted && x.TypeCode == "FINISHED_PRODUCT").Select(x => new
                    {
                        Catelogue = "",
                        ProductCode = x.ProductCode,
                        ProductType = "FINISHED_PRODUCT",
                        PriceM = x.PricePerM,
                        PriceM2 = x.PricePerM2,
                        x.PriceCostCatelogue,
                        x.PriceCostAirline,
                        x.PriceCostSea,
                        x.PriceRetailBuild,
                        x.PriceRetailBuildAirline,
                        x.PriceRetailBuildSea,
                        x.PriceRetailNoBuild,
                        x.PriceRetailNoBuildAirline,
                        x.PriceRetailNoBuildSea,
                    });

                    var listProduct = rs1.Concat(rs).AsNoTracking().ToList();
                    var listProductPrice = _context.ProductCostDetails.Where(x => x.HeaderCode.Equals(headerCode) && !x.IsDeleted).ToList();
                    var listProductInserNew = listProduct.Where(x => !listProductPrice.Any(y => y.ProductCode.Equals(x.ProductCode))).ToList();

                    foreach (var item in listProduct)
                    {
                        var check = _context.ProductCostDetails.FirstOrDefault(x => x.ProductCode.Equals(item.ProductCode) && x.HeaderCode.Equals(headerCode) && !x.IsDeleted);
                        if (check == null)
                        {
                            var product = new ProductCostDetail
                            {
                                HeaderCode = headerCode,
                                ProductCode = item.ProductCode,
                                Catelogue = item.Catelogue,
                                CreatedBy = User.Identity.Name,
                                CreatedTime = DateTime.Now,
                                PriceCostCatelogue = item.PriceCostCatelogue,
                                PriceCostAirline = item.PriceCostAirline,
                                PriceCostSea = item.PriceCostSea,
                                PriceRetailBuild = item.PriceRetailBuild,
                                PriceRetailBuildAirline = item.PriceRetailBuildAirline,
                                PriceRetailBuildSea = item.PriceRetailBuildSea,
                                PriceRetailNoBuild = item.PriceRetailNoBuild,
                                PriceRetailNoBuildAirline = item.PriceRetailNoBuildAirline,
                                PriceRetailNoBuildSea = item.PriceRetailNoBuildSea,
                            };

                            _context.ProductCostDetails.Add(product);
                            await _context.SaveChangesAsync();
                        }
                    }

                    msg.Error = false;
                    msg.Object = listProduct;
                    msg.Title = String.Format(_stringLocalizer["PSP_MSG_PRICE_DEFAUL_SUCCESS"]); //"Tải giá mặc định thành công";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["PSP_MSG_PRICE_DEFAUL_FAIL"]); //"Tải giá mặc định thất bại";
                throw ex;
            }

            return Json(msg);
        }

        [HttpPost]
        public JMessage ValidateDate(DateTime effectiveDate, DateTime expiryDate, int id)
        {
            JMessage msg = new JMessage() { Error = false };
            try
            {

                var listDates = (_context.ProductCostHeaders.Where(x => !x.IsDeleted && x.Id != id)
                    .OrderBy(x => x.EffectiveDate)
                    .Select(x => new
                    {
                        x.EffectiveDate,
                        x.ExpiryDate
                    })).ToList();

                foreach (var item in listDates)
                {

                    if ((item.EffectiveDate <= effectiveDate && item.ExpiryDate >= effectiveDate))
                    {
                        msg.Error = true;
                        msg.Title = String.Format(_stringLocalizer["PSP_MSG_EFFECTIVE_DATE"]); //"Ngày hiệu lực từ đã tồn tại trong bảng giá khác";
                        break;
                    }
                    else if ((item.EffectiveDate <= expiryDate && item.ExpiryDate >= expiryDate))
                    {
                        msg.Error = true;
                        msg.Title = String.Format(_stringLocalizer["PSP_MSG_EXPIRY_DATE"]); //"Ngày hiệu lực đến đã tồn tại trong bảng giá khác";
                        break;
                    }
                    else if ((item.EffectiveDate <= effectiveDate && item.ExpiryDate >= effectiveDate) && (item.EffectiveDate <= expiryDate && item.ExpiryDate >= expiryDate))
                    {
                        msg.Error = true;
                        msg.Title = String.Format(_stringLocalizer["PSP_MSG_ALREADY_EXIST"]); //"Ngày hiệu lực từ và đến đã tồn tại trong bảng giá khác";
                        break;
                    }
                }
            }
            catch (Exception ex) { }
            return msg;
        }

        public bool CheckDatetime(DateTime befor, DateTime after)
        {
            //befor<=after

            bool x = true;
            if (after.Year > befor.Year)
                x = true;
            else if (after.Year < befor.Year)
                x = false;
            else if (after.Month > befor.Month)
                x = true;
            else if (after.Month < befor.Month)
                x = false;
            else if (after.Day > befor.Day)
                x = true;
            else if (after.Day >= befor.Day)
                x = true;
            return x;
        }

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var a = _stringLocalizer["PSP_BTN_PRICE_DEFAUL"];
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }).Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion

        public class JtableExtendModel : JTableModel
        {
            public string ProductCode { get; set; }
        }

        public class JTableProductFile : JTableModel
        {
            public string ProductCode { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
        }
        public class JTableProductRes
        {
            public int Id { get; set; }
            public string ProductCode { get; set; }
            public string ProductName { get; set; }
            public string Quantity { get; set; }
            public DateTime? CreatedTime { get; set; }
            public string CreatedBy { get; set; }
            public string LotProductCode { get; set; }
            public double Cost { get; set; }
            public double Tax { get; set; }
            public string Note { get; set; }
            public string sQrCode { get; set; }
            public string sBarCode { get; set; }
        }

        public class JTableLotProductRes
        {
            public int Id { get; set; }
            public string QrCode { get; set; }
            public string BarCode { get; set; }
            public string Title { get; set; }
            public string Supplier { get; set; }
            public string SupplierName { get; set; }
            public decimal Cost { get; set; }
            public DateTime? ExpiryDate { get; set; }
            public DateTime CreatedTime { get; set; }
            public string CreatedBy { get; set; }
            public string CreatedByName { get; set; }
            public string PathImg { get; set; }
            public string Packing { get; set; }
            public string Store { get; set; }
            public string LotProductName { get; set; }
            public string sQrCode { get; set; }
            public string sBarCode { get; set; }

        }

        public class JTableModelCustom : JTableModel
        {
            public string Title { get; set; }
            public string Status { get; set; }
        }
        public class JTableDetailModel : JTableModel
        {
            public string ProductCatelogueCodeSearch { get; set; }
            public string ProductCodeSearch { get; set; }
            public string HeaderCode { get; set; }
        }


        public class JTableProductCustom : JTableModel
        {
            public string LotProductCode { get; set; }
        }
        public class JTableHeaderRes
        {
            public int Id { get; set; }
            public string Title { get; set; }
            public string Note { get; set; }
            public DateTime? EffectiveDate { get; set; }
            public DateTime? ExpiryDate { get; set; }
            public DateTime? CreatedTime { get; set; }
            public string CreatedBy { get; set; }
            public string QrCode { get; set; }
        }
    }
}