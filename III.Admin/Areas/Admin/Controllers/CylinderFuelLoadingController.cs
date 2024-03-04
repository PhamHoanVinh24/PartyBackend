using ESEIM.Models;
using ESEIM.Utils;
using ESEIM;
using III.Admin.Controllers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Options;
using Newtonsoft.Json.Linq;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System;
using System.Globalization;
using DocumentFormat.OpenXml.Spreadsheet;
using FTU.Utils.HelperNet;
using static III.Admin.Controllers.ServiceRegistController;
using Aspose.Pdf.Operators;
using DocumentFormat.OpenXml.VariantTypes;
using System.Data;

namespace III.Admin.Areas.Admin.Controllers
{
    [Area("Admin")]
    public class CylinderFuelLoadingController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IActionLogService _actionLog;
        private readonly AppSettings _appSettings;
        private readonly IUploadService _upload;
        private readonly IStringLocalizer<ServiceRegistController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IRepositoryService _repositoryService;

        public CylinderFuelLoadingController(
            EIMDBContext context,
            IUploadService upload,
            IOptions<AppSettings> appSettings,
            IActionLogService actionLog,
            IStringLocalizer<ServiceRegistController> stringLocalizer,
            IStringLocalizer<SharedResources> sharedResources,
            IRepositoryService repositoryService)
        {

            _context = context;
            _actionLog = actionLog;
            _appSettings = appSettings.Value;
            _upload = upload;
            _sharedResources = sharedResources;
            _stringLocalizer = stringLocalizer;
            _repositoryService = repositoryService;
        }

        //public IActionResult Index()
        //{
        //    return View();
        //}

        public JsonResult JTable([FromBody] JTableModelServiceRegist jTablePara)
        {
            try
            {
                int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;

                var query = from a in _context.CylinkerFuelLoadingHds
                            join b in _context.HREmployees on a.TicketCreator equals b.employee_code into ab
                            from creator in ab.DefaultIfEmpty()
                            join c in _context.HREmployees on a.Loader equals c.employee_code into ac
                            from loader in ac.DefaultIfEmpty()
                            join d in _context.CommonSettings on a.Status equals d.CodeSet into ad
                            from status in ad.DefaultIfEmpty()
                            orderby a.Id descending
                            select new
                            {
                                a.Id,
                                a.TicketTitle,
                                TicketCreator = creator.fullname,
                                a.TicketCreatedTime,
                                Loader = loader.fullname,
                                a.LoaderTime,
                                Status = status.ValueSet,
                                a.Note,
                                a.TicketCode
                            };

                var count = query.Count();
                var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "TicketTitle", "TicketCreator", "TicketCreatedTime", "Loader", "LoaderTime", "Status", "Note", "TicketCode");
                return Json(jdata);
            }
            catch (Exception ex)
            {
                var jdata = JTableHelper.JObjectTable(null, jTablePara.Draw, 0, "Id", "TicketTitle", "TicketCreator", "TicketCreatedTime", "Loader", "LoaderTime", "Status", "Note", "TicketCode");
                return Json(jdata);
            }
        }

        public class ModelRequestTicketHeader
        {
            public string TicketCode { get; set; }
            public string TicketTitle { get; set; }
            public string TicketCreator { get; set; }
            public string TicketCreatedTime { get; set; }
            public string Loader { get; set; }
            public string LoaderTime { get; set; }
            public string Status { get; set; }
            public string Note { get; set; }
        }

        [HttpPost]
        public async Task<IActionResult> CreateTicket([FromBody] ModelRequestTicketHeader request)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                if (request.TicketCreator == "" || request.Loader == "")
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_CFL_LACK_DATA"]);
                    return Ok(msg);
                }
                var _ticket = new CylinkerFuelLoadingHd()
                {
                    TicketCode = "FL_TK_" + request.TicketCode,
                    TicketTitle = request.TicketTitle,
                    TicketCreator = request.TicketCreator,
                    TicketCreatedTime = DateTime.ParseExact(request.TicketCreatedTime, "dd/MM/yyyy", CultureInfo.InvariantCulture),
                    Loader = request.Loader,
                    LoaderTime = DateTime.ParseExact(request.LoaderTime, "dd/MM/yyyy", CultureInfo.InvariantCulture),
                    Status = request.Status,
                    Note = request.Note,
                };

                _context.CylinkerFuelLoadingHds.Add(_ticket);
                await _context.SaveChangesAsync();

                msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], "phiếu nạp nhiên liệu");
                return Ok(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = ex.ToString();
                return Ok(msg);
            }
        }

        [HttpPost]
        public object GetWeigth(string product)
        {
            var data = _context.MaterialProducts.Where(x => !x.IsDeleted && x.ProductCode.Equals(product))
                .Select(a => new
                {
                    a.Weight,
                    Unit = _context.CommonSettings.Where(x => x.CodeSet == a.UnitWeight).FirstOrDefault().ValueSet,
                    Total = _context.ProductInStocks.Where(x => x.ProductCode == product).Select(x => x.Weight).FirstOrDefault()
                }).FirstOrDefault();

            return data;
        }
        [HttpPost]
        public async Task<object> GetTicketById(int id)
        {
            var data = await _context.CylinkerFuelLoadingHds.FirstOrDefaultAsync(cf => cf.Id == id);

            return data;
        }

        [HttpPost]
        public async Task<object> UpdateTicket(int id, [FromBody] ModelRequestTicketHeader request)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                if (request.TicketCreator == "" || request.Loader == "")
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_CFL_LACK_DATA"]);
                    return Ok(msg);
                }
                var _ticket = await _context.CylinkerFuelLoadingHds.FirstOrDefaultAsync(cf => cf.Id == id);

                _ticket.TicketTitle = request.TicketTitle;
                _ticket.TicketCreator = request.TicketCreator;
                _ticket.TicketCreatedTime = DateTime.ParseExact(request.TicketCreatedTime, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                _ticket.Loader = request.Loader;
                _ticket.LoaderTime = DateTime.ParseExact(request.LoaderTime, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                _ticket.Status = request.Status;
                _ticket.Note = request.Note;
                _context.CylinkerFuelLoadingHds.Update(_ticket);

                await _context.SaveChangesAsync();
                msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], "phiếu nạp nhiên liệu");
                return msg;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = ex.ToString();
                return msg;
            }
        }

        [HttpPost]
        public async Task<object> DeleteTicket(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var _ticket = await _context.CylinkerFuelLoadingHds.FirstOrDefaultAsync(cf => cf.Id == id);

                _context.CylinkerFuelLoadingHds.Remove(_ticket);

                await _context.SaveChangesAsync();
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], "phiếu nạp nhiên liệu");
                return msg;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = ex.ToString();
                return msg;
            }
        }

        #region Detail
        [HttpPost]
        public object GetListBottle()
        {
            var data = from mp in _context.MaterialProducts.Where(x => x.TypeCode == "CL" && x.IsDeleted == false)
                       join p in _context.ProductInStocks.Where(x => x.IsDeleted == false) on mp.ProductCode equals p.ProductCode
                       select new
                       {
                           Total = p.Weight,
                           Weight = mp.Weight,
                           Code = p.ProductCode,
                           Name = mp.ProductName,
                           Unit = _context.CommonSettings.Where(a => a.CodeSet == p.Unit).FirstOrDefault().ValueSet
                       };
            return data;
        }

        [HttpPost]
        public object GetListStaticTank()
        {
            var data = from mp in _context.MaterialProducts.Where(x => x.TypeCode == "TANK" && x.IsDeleted == false)
                       join p in _context.ProductInStocks.Where(x => x.IsDeleted == false) on mp.ProductCode equals p.ProductCode
                       select new
                       {
                           Total = p.Weight,
                           Weight = mp.Weight,
                           Code = p.ProductCode,
                           Name = mp.ProductName,
                           Unit = _context.CommonSettings.Where(a => a.CodeSet == p.Unit).FirstOrDefault().ValueSet
                       };
            return data;
        }

        // nhap kho
        [HttpPost]
        public object GetListProductInStockCylinker(int pageNo = 1, int pageSize = 10, string content = "", string storeCode = "", string group = "")
        {
            //var data = _context.QuizPools.Where(x => !x.IsDeleted).Select(x => new { Code = x.Code, Content = x.Content }).ToList();
            var search = !string.IsNullOrEmpty(content) ? content : "";
            var searchStore = !string.IsNullOrEmpty(storeCode) ? storeCode : "";
            var searchGroup = !string.IsNullOrEmpty(group) ? group : "";
            string[] param = new string[] { "@pageNo", "@pageSize", "@content", "@storeCode", "@group" };
            object[] val = new object[] { pageNo, pageSize, search, searchStore, searchGroup };
            DataTable rs = _repositoryService.GetDataTableProcedureSql("[P_GET_LIST_PRODUCT_IN_STOCK]", param, val);
            var data = CommonUtil.ConvertDataTable<MaterialProductInStock>(rs)
                .Select(x => new
                {
                    Id = x.StockId,
                    IdImpProduct = x.IdImpProduct,
                    Quantity = x.Quantity,
                    Unit = x.StockUnit,
                    Code = x.ProductCode,
                    Name = x.ProductName,
                    Title = $"{x.Title} [ {x.FuelName ?? ""} {x.WeightInStock ?? 0} / {x.Weight ?? 0} ]",
                    Type = x.TypeCode,
                    //GattrCode = x.GattrCode,
                    StoreCode = x.StoreCode,
                    ProductQrCode = x.ProductQrCode,
                    Max = x.Max,
                    FuelCode = x.FuelCode,
                    FuelName = x.FuelName,
                    MaxWeight = x.Weight,
                    CurrentWeight = x.WeightInStock,
                    UnitWeight = x.UnitWeight
                    //IsMapped = x.IsMapped,
                    //Quantity = x.Quantity,
                    //MappingCode = x.MappingCode,
                    //ProductNo = x.ProductNo,
                }).ToList();
            //return query;
            return data;
        }

        public class ModelRequestTicketDetail
        {
            public string TicketCode { get; set; }
            public string TankCode { get; set; }
            public string CylinkerCode { get; set; }
            public decimal Volume { get; set; }
            public string Unit { get; set; }
        }

        [HttpPost]
        public async Task<IActionResult> CreateTicketDetail([FromBody] ModelRequestTicketDetail request)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                if (request.TankCode == "" || request.CylinkerCode == "")
                {
                    msg.Error = true;
                    msg.Title = "Còn thiếu một số trường dữ liệu";
                    return Ok(msg);
                }
                var cylinker = _context.MaterialProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == request.CylinkerCode);
                var cylinkerInStock = _context.ProductInStocks.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == request.CylinkerCode);
                var cylinkerLocatedMapping = _context.ProductLocatedMappings.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == request.CylinkerCode);
                var tankInStock = _context.ProductInStocks.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == request.TankCode);
                var tankLocatedMapping = _context.ProductLocatedMappings.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == request.TankCode);
                if (cylinker == null || cylinkerInStock == null)
                {
                    msg.Error = true;
                    //msg.Object = ex;
                    msg.Title = "Bình chưa được nhập";
                    return Json(msg);
                }
                if (cylinkerLocatedMapping == null)
                {
                    msg.Error = true;
                    //msg.Object = ex;
                    msg.Title = "Bình chưa được xếp";
                    return Json(msg);
                }
                if (tankInStock == null || tankLocatedMapping == null)
                {
                    msg.Error = true;
                    //msg.Object = ex;
                    msg.Title = "Bồn chưa được nhập";
                    return Json(msg);
                }
                var sumVolume = (cylinkerInStock.Weight ?? 0) + request.Volume;
                if (cylinker != null && sumVolume > cylinker.Weight)
                {
                    msg.Error = true;
                    //msg.Object = ex;
                    msg.Title = "Lượng nhập vượt quá dung tích bình";
                    return Json(msg);
                }
                var _ticketDt = new CylinkerFuelLoadingDt()
                {
                    TicketCode = request.TicketCode,
                    TankCode = request.TankCode,
                    CylinkerCode = request.CylinkerCode,
                    Volume = request.Volume,
                    Unit = request.Unit,
                };

                _context.CylinkerFuelLoadingDts.Add(_ticketDt);
                cylinkerInStock.Weight = sumVolume;
                cylinkerLocatedMapping.Weight = sumVolume;
                tankInStock.Weight -= request.Volume;
                tankLocatedMapping.Weight -= request.Volume;
                await _context.SaveChangesAsync();
                msg.Title = "Thêm nạp nhiên liệu thành công";
                return Ok(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = ex.ToString();
                return Ok(msg);
            }
        }

        public class JTableCylinkerFuelLoadingDetail : JTableModel
        {
            public string TicketCode { get; set; }
        }

        [HttpPost]
        public JsonResult JTableDetail([FromBody] JTableCylinkerFuelLoadingDetail jTablePara)
        {
            try
            {
                int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;

                var query = from a in _context.CylinkerFuelLoadingDts
                            join b in _context.MaterialProducts on a.TankCode equals b.ProductCode
                            join c in _context.MaterialProducts on a.CylinkerCode equals c.ProductCode
                            join d in _context.CommonSettings on a.Unit equals d.CodeSet into ad
                            from unit in ad.DefaultIfEmpty()
                            where a.TicketCode == jTablePara.TicketCode
                            orderby a.Id descending
                            select new
                            {
                                a.Id,
                                TankCode = b.ProductCode,
                                TankName = b.ProductName,
                                CylinkerCode = c.ProductCode,
                                CylinkerName = c.ProductName,
                                a.Volume,
                                Unit = unit.ValueSet,
                            };

                var count = query.Count();
                var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "TankCode", "TankName", "CylinkerCode", "CylinkerName", "Volume", "Unit");
                return Json(jdata);
            }
            catch (Exception ex)
            {
                var jdata = JTableHelper.JObjectTable(null, jTablePara.Draw, 0, "Id", "TankCode", "TankName", "CylinkerCode", "CylinkerName", "Volume", "Unit");
                return Json(jdata);
            }
        }

        [HttpPost]
        public async Task<object> GetTicketDetailById(int id)
        {
            var data = await _context.CylinkerFuelLoadingDts.FirstOrDefaultAsync(cf => cf.Id == id);

            return data;
        }

        [HttpPost]
        public async Task<object> UpdateTicketDetail(int id, [FromBody] ModelRequestTicketDetail request)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                if (request.TankCode == "" || request.CylinkerCode == "")
                {
                    msg.Error = true;
                    msg.Title = "Còn thiếu một số trường dữ liệu";
                    return Ok(msg);
                }
                var cylinker = _context.MaterialProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == request.CylinkerCode);
                var cylinkerInStock = _context.ProductInStocks.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == request.CylinkerCode);
                var cylinkerLocatedMapping = _context.ProductLocatedMappings.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == request.CylinkerCode);
                var tankInStock = _context.ProductInStocks.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == request.TankCode);
                var tankLocatedMapping = _context.ProductLocatedMappings.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == request.TankCode);
                if (cylinker == null || cylinkerInStock == null)
                {
                    msg.Error = true;
                    //msg.Object = ex;
                    msg.Title = "Bình chưa được nhập";
                    return Json(msg);
                }
                if (tankInStock == null || tankLocatedMapping == null)
                {
                    msg.Error = true;
                    //msg.Object = ex;
                    msg.Title = "Bồn chưa được nhập";
                    return Json(msg);
                }
                var _ticket = await _context.CylinkerFuelLoadingDts.FirstOrDefaultAsync(cf => cf.Id == id);
                if (_ticket == null)
                {
                    msg.Error = true;
                    msg.Title = "Chi tiết không tồn tại";
                    return Json(msg);
                }
                var sumVolume = (cylinkerInStock.Weight ?? 0) - _ticket.Volume + request.Volume;
                if (cylinker != null && sumVolume > cylinker.Weight)
                {
                    msg.Error = true;
                    //msg.Object = ex;
                    msg.Title = "Lượng nhập vượt quá dung tích bình";
                    return Json(msg);
                }
                if (sumVolume < 0)
                {
                    msg.Error = true;
                    //msg.Object = ex;
                    msg.Title = "Không thể cập nhật vì dung tích bình bị giảm nhỏ hơn 0";
                    return Json(msg);
                }

                tankInStock.Weight = (tankInStock.Weight ?? 0) + request.Volume - _ticket.Volume;
                tankLocatedMapping.Weight = (tankLocatedMapping.Weight ?? 0) + request.Volume - _ticket.Volume;
                _ticket.TankCode = request.TankCode;
                _ticket.CylinkerCode = request.CylinkerCode;
                _ticket.Volume = request.Volume;
                _ticket.Unit = request.Unit;
                _context.CylinkerFuelLoadingDts.Update(_ticket);
                cylinkerInStock.Weight = sumVolume;
                cylinkerLocatedMapping.Weight = sumVolume;

                await _context.SaveChangesAsync();
                msg.Title = "Cập nhật nạp nhiên liệu thành công";
                return msg;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = ex.ToString();
                return msg;
            }
        }

        [HttpPost]
        public async Task<object> DeleteTicketDetail(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var _ticket = await _context.CylinkerFuelLoadingDts.FirstOrDefaultAsync(cf => cf.Id == id);
                if (_ticket == null)
                {
                    msg.Error = true;
                    msg.Title = "Chi tiết không tồn tại";
                    return Json(msg);
                }
                var cylinkerInStock = _context.ProductInStocks.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == _ticket.CylinkerCode);
                var cylinkerLocatedMapping = _context.ProductLocatedMappings.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == _ticket.CylinkerCode);
                var tankInStock = _context.ProductInStocks.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == _ticket.TankCode);
                var tankLocatedMapping = _context.ProductLocatedMappings.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == _ticket.TankCode);
                var sumVolume = (cylinkerInStock.Weight ?? 0) - _ticket.Volume;
                if (sumVolume < 0)
                {
                    msg.Error = true;
                    //msg.Object = ex;
                    msg.Title = "Không thể xóa vì dung tích bình bị giảm nhỏ hơn 0";
                    return Json(msg);
                }
                cylinkerInStock.Weight = sumVolume;
                cylinkerLocatedMapping.Weight = sumVolume;
                tankInStock.Weight += _ticket.Volume;
                tankLocatedMapping.Weight += _ticket.Volume;

                _context.CylinkerFuelLoadingDts.Remove(_ticket);

                await _context.SaveChangesAsync();
                msg.Title = "Xoá nạp nhiên liệu thành công";
                return msg;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = ex.ToString();
                return msg;
            }
        }
        #endregion

    }
}
