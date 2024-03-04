using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using ESEIM;
using ESEIM.Controllers;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using III.Domain.Enums;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;
using Syncfusion.XlsIO;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class MaterialProductHistorySaleController : BaseController
    {
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly EIMDBContext _context;
        private readonly IActionLogService _actionLog;
        private readonly AppSettings _appSettings;
        private readonly IUploadService _upload;
        public static List<Progress> progress;
        private readonly IStringLocalizer<MaterialProductHistorySaleController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;

        public class JTableModelCustom : JTableModel
        {
            public string Code { get; set; }
            public string Name { get; set; }
            public string FromTo { get; set; }
            public string DateTo { get; set; }
            public string Category { get; set; }
            public string Group { get; set; }
            public string Type { get; set; }
            public string Status { get; set; }
            public string ContractCode { get; set; }
            public string CusCode { get; set; }
            public string SupCode { get; set; }
            public string MappingCode { get; set; }
        }
        public MaterialProductHistorySaleController(EIMDBContext context, IOptions<AppSettings> appSettings, IHostingEnvironment hostingEnvironment, IStringLocalizer<MaterialProductHistorySaleController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _hostingEnvironment = hostingEnvironment;
            _appSettings = appSettings.Value;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }
        //[Breadcrumb("ViewData.CrumbHisSale", AreaName = "Admin", FromAction = "Index", FromController = typeof(ReportWareHouseHomeController))]
        //public IActionResult Index()
        //{
        //    ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
        //    ViewData["CrumbMenuStore"] = _sharedResources["COM_CRUMB_MENU_STORE"];
        //    ViewData["CrumbRptWHHome"] = _sharedResources["COM_CRUMB_RPT_WARE_HOUSE"];
        //    ViewData["CrumbHisSale"] = _sharedResources["COM_CRUMB_PROD_HIS_SALE"];
        //    return View("Index");
        //}

        [HttpPost]
        public object JTable([FromBody] JTableModelCustom jTablePara)
        {
            DateTime? fromDate = !string.IsNullOrEmpty(jTablePara.FromTo) ? DateTime.ParseExact(jTablePara.FromTo, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            DateTime? toDate = !string.IsNullOrEmpty(jTablePara.DateTo) ? DateTime.ParseExact(jTablePara.DateTo, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            try
            {
                int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;

                var queryRs = (from a in _context.ProductLocatedMappingLogs
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
                               where a.IsDeleted == false && a.ProductCode.Equals(jTablePara.Code)
                               && (string.IsNullOrEmpty(jTablePara.Type) || a.Type.Contains(jTablePara.Type))
                               && (string.IsNullOrEmpty(jTablePara.Name)
                               || (c != null && (c.Title.Contains(jTablePara.Name) || c.TicketCode.Contains(jTablePara.Name)))
                               || (d != null && (d.Title.Contains(jTablePara.Name) || d.TicketCode.Contains(jTablePara.Name)))
                               || (e != null && (e.Title.Contains(jTablePara.Name) || e.TicketCode.Contains(jTablePara.Name)))
                               || (f != null && (f.Title.Contains(jTablePara.Name) || f.TicketCode.Contains(jTablePara.Name)))
                               )
                               && (string.IsNullOrEmpty(jTablePara.MappingCode)
                               || a.MappingCode.Contains(jTablePara.MappingCode)
                               || (a.Type == "REARRANGE" && a.MappingCodeOld.Contains(jTablePara.MappingCode))
                               )
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
                                   IsTicketExist = (new List<object> { c, d, e, f }).Any(x => x != null)
                               }).Where(x => x.IsTicketExist);

                var count = queryRs.Count();
                var data = queryRs/*.OrderUsingSortExpression(jTablePara.QueryOrderBy).ThenBy("Type").ThenByDescending("CreatedTime")*/.Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Quantity", "ProductNo", "GattrCode", "GattrFlatCode", "GattrJson", "Unit", "Type",
                    "TicketCodeImpReturn", "TicketNameImpReturn", "TicketCodeExportPartial", "TicketNameExportPartial", "TicketCodeImpArrange", "TicketNameImpArrange",
                    "TicketCodeExportFull", "TicketNameExportFull", "MappingCode", "MappingCodeOld");

                return Json(jdata);
            }
            catch (Exception ex)
            {
                throw ex;
            }
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

        [HttpPost]
        public object GetListContract()
        {
            var listSale = _context.PoSaleHeaders.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.ContractCode)).OrderByDescending(x => x.ContractHeaderID).Select(x => new
            {
                Code = x.ContractCode,
                Name = x.Title
            }).ToList();

            var listSaleRetail = _context.ProdDeliveryHeaders.Where(x => !x.IsDeleted).OrderByDescending(x => x.Id).Select(x => new
            {
                Code = x.TicketCode,
                Name = x.Title
            }).ToList();

            var listBuyPo = _context.PoBuyerHeaders.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.PoSupCode)).OrderByDescending(x => x.Id).Select(x => new
            {
                Code = x.PoSupCode,
                Name = x.PoSupCode//Bỏ trường tiêu đề nên lấy trường code để hiển thị
            }).ToList();

            var listBuyRetail = _context.ProdReceivedHeaders.Where(x => !x.IsDeleted).OrderByDescending(x => x.Id).Select(x => new
            {
                Code = x.TicketCode,
                Name = x.Title
            }).ToList();

            var query = listSale.Concat(listSaleRetail).Concat(listBuyPo).Concat(listBuyRetail);

            return query;
        }

        [HttpPost]
        public object GetListCustommer()
        {
            var query = _context.Customerss.Where(x => !x.IsDeleted).OrderByDescending(x => x.CusID).Select(x => new
            {
                Code = x.CusCode,
                Name = x.CusName
            });
            return query;
        }

        [HttpPost]
        public object GetListSupplier()
        {
            var query = _context.Suppliers.Where(x => !x.IsDeleted).OrderByDescending(x => x.SupID).Select(x => new
            {
                Code = x.SupCode,
                Name = x.SupName
            });
            return query;
        }

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