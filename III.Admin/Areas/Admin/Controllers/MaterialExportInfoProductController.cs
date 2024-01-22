using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using Microsoft.Extensions.Options;
using ESEIM;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;
using III.Domain.Enums;
using Microsoft.AspNetCore.Authorization;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class MaterialExportInfoProductController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly AppSettings _appSettings;


        private readonly IStringLocalizer<MaterialExportInfoProductController> _stringLocalizer;
        private readonly IStringLocalizer<EDMSQRCodeManagerController> _stringLocalizerQrCode;
        private readonly IStringLocalizer<FilePluginController> _stringLocalizerFp;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IStringLocalizer<FileObjectShareController> _fileObjectShareLocalizer;
        private readonly IStringLocalizer<EDMSRepositoryController> _edmsRepositoryController;
        public MaterialExportInfoProductController(EIMDBContext context,
            IStringLocalizer<MaterialExportInfoProductController> stringLocalizer,
            IStringLocalizer<EDMSQRCodeManagerController> stringLocalizerQrCode,
            IStringLocalizer<FilePluginController> stringLocalizerFp,
            IStringLocalizer<FileObjectShareController> fileObjectShareLocalizer,
            IStringLocalizer<EDMSRepositoryController> edmsRepositoryController,
            IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
            _stringLocalizerFp = stringLocalizerFp;
            _stringLocalizerQrCode = stringLocalizerQrCode;
            _fileObjectShareLocalizer = fileObjectShareLocalizer;
            _edmsRepositoryController = edmsRepositoryController;
        }
        //{
        //    _context = context;
        //    _appSettings = appSettings.Value;
        //}
        [Breadcrumb("ViewData.CrumbExpInfoProd", AreaName = "Admin", FromAction = "Index", FromController = typeof(SaleWareHouseHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuStore"] = _sharedResources["COM_CRUMB_MENU_STORE"];
            ViewData["CrumbSaleWHHome"] = _sharedResources["COM_CRUMB_SALE_WH"];
            ViewData["CrumbExpInfoProd"] = _sharedResources["COM_CRUMB_EXPORT_INFO_PROD"];
            return View("Index");
        }
        [HttpGet]
        public JsonResult GetListProductInStore()
        {
            var data = from a in _context.ProductInStocks
                       join b in _context.MaterialProducts on a.ProductCode equals b.ProductCode
                       //join b in _context.EDMSRacks on a.RackCode equals b.RackCode into b1
                       //from b in b1.DefaultIfEmpty()
                       //join c in _context.PAreaMappingsStore.Where(x => !x.IsDeleted) on a.MappingCode equals c.ObjectCode
                       //join e in _context.PAreaCategoriesStore.Where(x => x.IsDeleted == false)
                       //    on new { c.CategoryCode, c.ObjectType } equals new
                       //    { CategoryCode = e.Code, ObjectType = e.PAreaType }
                       where a.IsDeleted == false && b.IsDeleted == false
                       select new
                       {
                           a.Id,
                           a.ProductQrCode,
                           a.Quantity,
                           a.Unit,
                           a.IdImpProduct,
                           Title = $"{b.ProductName} [ {a.ProductQrCode} - {a.Id} ]"
                           //Name = e.PAreaDescription,
                           //Title = a.ProductQrCode + " " + e.PAreaDescription
                       };
            return Json(data);
        }
        [HttpGet]
        public JsonResult GetInfoProductInStore(int id)
        {
            var data = (from a1 in _context.ProductInStocks.Where(x => !x.IsDeleted)
                        join a in _context.ProductLocatedMappings on a1.ProductQrCode equals a.ProductQrCode into a2
                        from a in a2.DefaultIfEmpty()
                        join b in _context.ProductGattrExts.Where(x => !x.IsDeleted)
                        on a.GattrCode equals b.GattrCode into b1
                        from b in b1.DefaultIfEmpty()
                            //join b in _context.ProductInStocks on a.ProductQrCode equals b.ProductQrCode
                        join c in _context.ProductImportDetails on a1.IdImpProduct equals c.Id into c1
                        from c in c1.DefaultIfEmpty()
                        join d in _context.ProductExportDetails on a.Id equals d.MapId into d1
                        from d in d1.DefaultIfEmpty()
                        join e in _context.MaterialProducts on a1.ProductCode equals e.ProductCode into e1
                        from e in e1.DefaultIfEmpty()
                        join f in _context.PAreaMappingsStore.Where(x => !x.IsDeleted) on a.MappingCode equals f.ObjectCode into f1
                        from f in f1.DefaultIfEmpty()
                        join g in _context.PAreaCategoriesStore.Where(x => x.IsDeleted == false)
                            on new { f.CategoryCode, f.ObjectType } equals new
                            { CategoryCode = g.Code, ObjectType = g.PAreaType } into g1
                        from g in g1.DefaultIfEmpty()
                            //from f in f1.DefaultIfEmpty()
                            //join g in _context.EDMSFloors on a.FloorCode equals g.FloorCode into g1
                            //from g in g1.DefaultIfEmpty()
                            //join h in _context.EDMSLines on a.LineCode equals h.LineCode into h1
                            //from h in h1.DefaultIfEmpty()
                            //join i in _context.EDMSRacks on a.RackCode equals i.RackCode into i1
                            //from i in i1.DefaultIfEmpty()
                        where a.IsDeleted == false && a1.Id.Equals(id)
                        select new
                        {
                            a1.Id,
                            a1.ProductQrCode,
                            a1.ProductCode,
                            IdMap = a != null ? a.Id : -1,
                            Quantity = a != null ? a.Quantity : 0,
                            QuantityInStock = a1.Quantity,
                            ProductNo = a != null ? a.ProductNo : "",
                            GattrCode = a != null ? a.GattrCode : "",
                            GattrFlatCode = b != null ? b.GattrFlatCode : "Cơ bản",
                            GattrJson = b != null ? b.GattrJson : "{}",
                            Unit = a1.Unit,
                            Category = e,
                            QrCode = CommonUtil.GenerateQRCode(a1.ProductQrCode),
                            BarCode = CommonUtil.GenerateBarCode(a1.ProductQrCode),
                            ProductType = !string.IsNullOrEmpty(a1.LotProductCode) ? "Sản phẩm theo lô" : "Sản phẩm lẻ",
                            LotProductCode = !string.IsNullOrEmpty(a1.LotProductCode) ? a1.LotProductCode : "Sản phẩm không theo lô",
                            a1.StoreCode,
                            TicketImpCode = c != null ? c.TicketCode : "",
                            TicketExpCode = d.TicketCode != null ? d.TicketCode : "Sản phẩm chưa được xuất kho",
                            ProductName = e != null ? e.ProductName : "",
                            Position = f != null ? f.ObjectCode : ""
                        }).ToList().GroupBy(x => x.Id).Select(g => new
                        {
                            ObjInStock = g.FirstOrDefault(),
                            Category = g.FirstOrDefault().Category,
                            ListMapping = g.Where(x => !string.IsNullOrEmpty(x.Position))
                            .DistinctBy(x => new { x.IdMap, x.Position }).ToList()
                        });
            return Json(data);
        }
        [AllowAnonymous]
        [HttpPost]
        public JsonResult GetHistoryProductInStore(int id)
        {
            var data = (from a in _context.ProductLocatedMappingLogs
                        join a1 in _context.ProductInStocks.Where(x => !x.IsDeleted) on a.ProductQrCode equals a1.ProductQrCode into a2
                        from a1 in a2.DefaultIfEmpty()
                        join b in _context.ProductGattrExts.Where(x => !x.IsDeleted)
                        on a.GattrCode equals b.GattrCode into b1
                        from b in b1.DefaultIfEmpty()
                            //join b in _context.ProductInStocks on a.ProductQrCode equals b.ProductQrCode
                        join c in _context.ProductImportHeaders.Where(x => !x.IsDeleted) on new { a.TicketCode, a.Type } equals new { c.TicketCode, Type = "IMPORT_RETURN" } into c1
                        from c in c1.DefaultIfEmpty() // Return components to product
                        join d in _context.ProductExportHeaders.Where(x => !x.IsDeleted) on new { a.TicketCode, a.Type } equals new { d.TicketCode, Type = "EXPORT_PARTIAL" } into d1
                        from d in d1.DefaultIfEmpty() // Export components of product
                        join e in _context.ProductImportHeaders.Where(x => !x.IsDeleted) on new { a.TicketCode, a.Type } equals new { e.TicketCode, Type = "ARRANGE_IMP" } into e1
                        from e in e1.DefaultIfEmpty() // Arrange product in stock
                        join f in _context.ProductExportHeaders.Where(x => !x.IsDeleted) on new { a.TicketCode, a.Type } equals new { f.TicketCode, Type = "EXPORT_FULL" } into f1
                        from f in f1.DefaultIfEmpty() // Export full product from position
                                                      // type == "REARRANGE" mean move position from old position to another position
                        where a.IsDeleted == false && a1.Id.Equals(id)
                        select new
                        {
                            Quantity = a.Quantity,
                            ProductNo = a.ProductNo,
                            GattrCode = a.GattrCode,
                            GattrFlatCode = b != null ? b.GattrFlatCode : "Cơ bản",
                            GattrJson = b != null ? b.GattrJson : "{}",
                            Unit = a1 != null ? a1.Unit : "",
                            Type = a.Type,
                            TicketCodeImpReturn = c != null ? c.TicketCode : "",
                            TicketNameImpReturn = c != null ? c.Title : "",
                            TicketCodeExportPartial = d != null ? d.TicketCode : "",
                            TicketNameExportPartial = d != null ? d.Title : "",
                            TicketCodeImpArrange = e != null ? e.TicketCode : "",
                            TicketNameImpArrange = e != null ? e.Title : "",
                            TicketCodeExportFull = f != null ? f.TicketCode : "",
                            TicketNameExportFull = f != null ? f.Title : "",
                            MappingCode = a.MappingCode,
                            MappingCodeOld = a.MappingCodeOld,
                            CreatedTime = a.CreatedTime,
                            IsTicketExist = (new List<object> { c, d, e, f }).Any(x => x != null)
                        }).Where(x => x.IsTicketExist);
            return Json(data);
        }

        [HttpPost]
        public object JTableFileMaterialProduct(string productCode)
        {
            var msg = new JMessage();
            try
            {
                msg.Object = ((from a in _context.EDMSRepoCatFiles.Where(x =>
                        x.ObjectCode == productCode && x.ObjectType ==
                        EnumHelper<EnumMaterialProduct>.GetDisplayValue(EnumMaterialProduct.Product))
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
                               }).Union(
                    from a in _context.EDMSObjectShareFiles.Where(x =>
                        x.ObjectCode == productCode && x.ObjectType ==
                        EnumHelper<EnumMaterialProduct>.GetDisplayValue(EnumMaterialProduct.Product))
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
                    })).AsNoTracking();
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi lấy dữ liệu!";
                msg.Object = ex.Message;
            }

            return Json(msg);
        }
        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_fileObjectShareLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerFp.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_edmsRepositoryController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerQrCode.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion

    }

    public class ProductInfo
    {

    }

}
