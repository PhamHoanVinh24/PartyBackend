
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Caching.Memory;
using System.IO;
using Syncfusion.EJ2.PdfViewer;
using Newtonsoft.Json;
using System.Drawing;
//using SautinSoft;
using Syncfusion.EJ2.Spreadsheet;
using Syncfusion.XlsIO;
using Microsoft.AspNetCore.Http.Internal;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Cors;
using ESEIM.Models;
using ESEIM.Utils;
using ESEIM;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using System.Globalization;
using III.Domain.Enums;

namespace III.Admin.Controllers
{
    public class WareHouseVatTuAppController : Controller
    {
        private readonly UserManager<AspNetUser> _userManager;
        private readonly RoleManager<AspNetRole> _roleManager;
        private readonly EIMDBContext _context;
        //private readonly PackageDbContext _packageContext;
        private readonly AppSettings _appSettings;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IUploadService _uploadService;
        private readonly IActionLogService _actionLog;
        private readonly IFCMPushNotification _notification;
        private readonly IGoogleApiService _googleAPI;
        private object _sharedResources;

        //var session = HttpContext.GetSessionUser();

        public WareHouseVatTuAppController(IOptions<AppSettings> appSettings, EIMDBContext context, UserManager<AspNetUser> userManager, RoleManager<AspNetRole> roleManager, IActionLogService actionLog, IHostingEnvironment hostingEnvironment, IUploadService uploadService, IFCMPushNotification notification, IGoogleApiService googleAPI)
        {
            _userManager = userManager;
            _context = context;
            _roleManager = roleManager;
            _appSettings = appSettings.Value;
            _actionLog = actionLog;
            _hostingEnvironment = hostingEnvironment;
            _uploadService = uploadService;
            _notification = notification;
            _googleAPI = googleAPI;
        }

        public IActionResult Index()
        {
            return View();
        }

        #region Function Process

        //Lấy danh sách tất cả Kho, Tầng, Dãy,Kệ
        [HttpGet]
        public object GetListWareHouse()
        {
            try
            {
                var rs = _context.EDMSWareHouses.Where(x => x.WHS_Flag != true)
                                                        .Select(p => new
                                                        {
                                                            Code = p.WHS_Code,
                                                            Name = p.WHS_Name
                                                        }).ToList();
                return (rs);
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }

        private object Json(List<object> rs)
        {
            throw new NotImplementedException();
        }

        [HttpGet]
        public object GetListFloorByWareHouseCode(string wareHouseCode)
        {
            try
            {
                var rs = _context.EDMSFloors.Where(x => x.WHS_Code.Equals(wareHouseCode))
                                                    .Select(p => new
                                                    {
                                                        Code = p.FloorCode,
                                                        Name = p.FloorName,
                                                        Active = false
                                                    }).ToList();
                return rs;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        [HttpGet]
        public object GetListLineByFloorCode(string floorCode)
        {
            try
            {
                var rs = _context.EDMSLines.Where(x => x.FloorCode.Equals(floorCode)).ToList();
                return rs;
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }

        private object Json(List<EDMSLine> rs)
        {
            throw new NotImplementedException();
        }

        [HttpGet]
        public object GetListRackByFloorCode(string floorCode)
        {
            try
            {
                var rs = from a in _context.EDMSRacks
                         join b in _context.EDMSLines on a.LineCode equals b.LineCode
                         join c in _context.EDMSFloors on b.FloorCode equals c.FloorCode
                         let productCount = _context.ProductEntityMappings.Count(x => !x.IsDeleted && x.RackCode.Equals(a.RackCode))
                         where c.FloorCode.Equals(floorCode)
                         select new
                         {
                             a.CNT_Box,
                             a.CNT_Cell,
                             a.Id,
                             a.LineCode,
                             a.Material,
                             a.Note,
                             a.Ordering,
                             a.QR_Code,
                             a.RackCode,
                             a.RackName,
                             a.R_Size,
                             R_Status = productCount > 0 ? (a.CNT_Box > productCount ? "Còn chỗ" : a.CNT_Box == productCount ? "Đầy" : "Đã vượt quá") : "Trống",
                             ProductCount = productCount
                         };
                return rs;
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }

        [HttpGet]
        public object GetListCabinet(string floorCode)
        {
            try
            {
                //var rs = from a in _context.EDMSRacks
                //         join b in _context.EDMSLines on a.LineCode equals b.LineCode
                //         join c in _context.EDMSFloors on b.FloorCode equals c.FloorCode
                //         join d in _context.ObjectiverPackCovers.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.Located)) on a.RackCode equals d.Located
                //         where c.FloorCode.Equals(floorCode)
                //         select d;

                return (null);
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }

        [HttpGet]
        public object GetRackDetail(string rackCode)
        {
            try
            {
                var rs = (from a in _context.EDMSRacks
                          let productCount = _context.ProductEntityMappings.Count(x => !x.IsDeleted && x.RackCode.Equals(a.RackCode))
                          where a.RackCode.Equals(rackCode)
                          select new
                          {
                              a.CNT_Box,
                              a.CNT_Cell,
                              a.Id,
                              a.LineCode,
                              a.Material,
                              a.Note,
                              a.Ordering,
                              a.QR_Code,
                              a.RackCode,
                              a.RackName,
                              a.R_Size,
                              Status = productCount > 0 ? (a.CNT_Box > productCount ? "Còn chỗ" : a.CNT_Box == productCount ? "Đầy" : "Đã vượt quá") : "Trống",
                              ProductCount = productCount
                          }).FirstOrDefault();
                return (rs);
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }

        [HttpPost]
        public object GetListUser()
        {
            var data = _context.Users.Where(x => x.Active).Select(p => new { Code = p.UserName, Name = p.GivenName });
            return (data);
        }

        [HttpPost]
        public object GetPositionByProdID(int id)
        {

            var dataRs = (from a in _context.EDMSRacks
                          join b in _context.EDMSLines on a.LineCode equals b.LineCode
                          join c in _context.EDMSFloors on b.FloorCode equals c.FloorCode
                          join d in _context.EDMSWareHouses on c.WHS_Code equals d.WHS_Code
                          join e in _context.ProductEntityMappings on a.RackCode equals e.RackCode
                          where e.Id.Equals(id)
                          select new
                          {
                              a.RackCode,
                              CabinetCode = "",
                              a.LineCode,
                              c.FloorCode,
                              WhsCode = d.WHS_Code
                          }).First();

            return dataRs;
        }

        [HttpPost]
        public object JTableProduct([FromBody] JTableModelProdCustom jTablePara)
        {
            try
            {
                DateTime? fromDate = !string.IsNullOrEmpty(jTablePara.FromTo) ? DateTime.ParseExact(jTablePara.FromTo, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                DateTime? toDate = !string.IsNullOrEmpty(jTablePara.DateTo) ? DateTime.ParseExact(jTablePara.DateTo, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

                int intBeginFor = (jTablePara.CurrentPage - 1) * 5;
                var listCommon = _context.CommonSettings.Select(x => new { x.CodeSet, x.ValueSet });

                var query = (from a in _context.MaterialProducts.Where(x => !x.IsDeleted).AsNoTracking()
                             join b in _context.MaterialProductGroups.Where(x => !x.IsDeleted) on a.GroupCode equals b.Code into b1
                             from b in b1.DefaultIfEmpty()
                             join c in _context.MaterialTypes.Where(x => !x.IsDeleted) on a.TypeCode equals c.Code into c1
                             from c in c1.DefaultIfEmpty()
                             join d in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Unit equals d.CodeSet into d2
                             from d1 in d2.DefaultIfEmpty()
                             join e in _context.ProdReceivedDetails.Where(x => !x.IsDeleted) on a.ProductCode equals e.ProductCode
                             join f in _context.ProductEntityMappings.Where(x => !x.IsDeleted) on e.ProductQrCode equals f.ProductQrCode into f1
                             from f in f1.DefaultIfEmpty()
                             where !a.IsDeleted
                                 && (string.IsNullOrEmpty(jTablePara.Code) || a.ProductCode.ToLower().Contains(jTablePara.Code.ToLower()))
                                 && (string.IsNullOrEmpty(jTablePara.Name) || a.ProductName.ToLower().Contains(jTablePara.Name.ToLower()))
                                 && ((fromDate == null) || (a.CreatedTime.Date >= fromDate))
                                 && ((toDate == null) || (a.CreatedTime.Date <= toDate))
                                 && (string.IsNullOrEmpty(jTablePara.Group) || (a.GroupCode != null && a.GroupCode == jTablePara.Group))
                                 && (string.IsNullOrEmpty(jTablePara.Type) || (a.TypeCode != null && a.TypeCode == jTablePara.Type))
                                 && (string.IsNullOrEmpty(jTablePara.Status) || (a.Status == jTablePara.Status))
                                 && (string.IsNullOrEmpty(jTablePara.Catalogue) || (a.ProductCode == jTablePara.Catalogue))
                                 && (string.IsNullOrEmpty(jTablePara.RackCode) || (f != null && f.RackCode == jTablePara.RackCode))
                             select new MaterialProductRes
                             {
                                 id = a.Id,
                                 productcode = a.ProductCode,
                                 productqrcode = e.ProductQrCode,
                                 productname = a.ProductName,
                                 unit = d1 != null ? d1.ValueSet : "",
                                 productgroup = b != null ? b.Name : "",
                                 producttype = c != null ? c.Name : "",
                                 pathimg = a.Image,
                                 material = a.Material,
                                 pattern = a.Pattern,
                                 note = a.Note,
                                 sQrCode = a.QrCode,
                                 sBarCode = a.Barcode,
                                 IsLocated = f != null ? true : false,
                                 MappingId = f != null ? f.Id : 0,
                                 Position = ""// GetPositionByRackCode(e.ProductQrCode) != null ? GetPositionByRackCode(e.ProductQrCode).Name : ""
                             });
                var count = query.Count();
                var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).AsNoTracking().ToList();
                var data1 = data.Skip(intBeginFor).Take(5).ToList();

                data1.ForEach(x => x.Position = GetPositionByRackCode(x.productqrcode) != null ? GetPositionByRackCode(x.productqrcode).Name : "");

                var jdata = JTableHelper.JObjectTable(data1, jTablePara.Draw, count, "id", "productcode", "productqrcode", "productname", "unit", "pathimg", "material", "pattern", "note", "productgroup", "producttype", "sQrCode", "sBarCode", "IsLocated", "MappingId", "Position");

                return (jdata);
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        [NonAction]
        private (IEnumerable<EDMSJtableFileModel> listLucene, int total) SearchLuceneFile(string content, int page, int length)
        {
            try
            {
                return LuceneExtension.SearchHighligh(content, _hostingEnvironment.WebRootPath + "\\uploads\\luceneIndex", page, length, "Content");
            }
            catch (Exception ex)
            {
                return (new List<EDMSJtableFileModel>(), 0);
            }
        }

        [NonAction]
        private PositionInfo GetPositionByRackCode(string productQrCode)
        {
            var dataRs = new PositionInfo();

            var data = (from a in _context.EDMSRacks
                        join b in _context.EDMSLines on a.LineCode equals b.LineCode
                        join c in _context.EDMSFloors on b.FloorCode equals c.FloorCode
                        join d in _context.EDMSWareHouses on c.WHS_Code equals d.WHS_Code
                        join e in _context.ProductEntityMappings.Where(x => !x.IsDeleted) on a.RackCode equals e.RackCode
                        //join g in _context.ProdReceivedDetails.Where(x=>!x.IsDeleted) on e.ProductQrCode equals g.ProductQrCode
                        where e.ProductQrCode.Equals(productQrCode)
                        select new PositionInfo
                        {
                            Code = a.RackCode,
                            Name = string.Format("[{0}, {1}, {2}, {3}{4}]", d.WHS_Name,
                                                                            c.FloorName,
                                                                            b.L_Text,
                                                                            a.RackName,
                                                                            !string.IsNullOrEmpty(e.RackPosition) ? string.Format(", {0}", e.RackPosition) : ""),
                            RackName = a.RackName,
                            L_Text = b.L_Text,
                            FloorName = c.FloorName,
                            WHS_Name = d.WHS_Name
                        });
            if (data.FirstOrDefault() != null)
            {
                dataRs = data.FirstOrDefault();
            }
            return dataRs;
        }

        [HttpPost]
        public object SaveData([FromBody] List<ShapeData> listObj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var listRack = listObj.Where(x => x.Type.Equals("RACK")).ToList();
                var listData = listObj.Where(x => !x.Type.Equals("RACK")).ToList();
                foreach (var obj in listData)
                {
                    switch (obj.Type)
                    {
                        case "LINE":
                            var line = _context.EDMSLines.FirstOrDefault(x => x.LineCode.Equals(obj.ObjectCode));
                            if (line != null)
                            {
                                var listObject = new List<object>();

                                listObject.Add(JsonConvert.DeserializeObject<object>(obj.Json));

                                var listRackByLineCode = listRack.Where(x => _context.EDMSRacks.Any(p => p.LineCode.Equals(line.LineCode) && p.RackCode.Equals(x.ObjectCode))).ToList();
                                foreach (var rack in listRackByLineCode)
                                {
                                    var exits = rack.ObjectCode.Contains(JsonConvert.SerializeObject(listObject));
                                    if (!exits)
                                        listObject.Add(JsonConvert.DeserializeObject<object>(rack.Json));
                                }

                                line.ShapeData = JsonConvert.SerializeObject(listObject);
                                _context.EDMSLines.Update(line);
                            }
                            break;

                        case "CABINET":
                            var cabinet = _context.ObjectiverPackCovers.FirstOrDefault(x => x.ObjPackCode.Equals(obj.ObjectCode));
                            if (cabinet != null)
                            {
                                var listObject = new List<object>();
                                listObject.Add(JsonConvert.DeserializeObject<object>(obj.Json));

                                cabinet.ShapeData = JsonConvert.SerializeObject(listObject);
                                _context.ObjectiverPackCovers.Update(cabinet);
                            }
                            break;
                    }
                }

                msg.Title = "Lưu thành công";

                _context.SaveChanges();
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Lưu thất bại";
                msg.Object = ex;
            }
            return msg;
        }

        [HttpPost]
        public List<object> LoadData(string floorCode)
        {
            var listData = new List<object>();

            var dataLine = _context.EDMSLines.Where(x => x.FloorCode.Equals(floorCode) && !string.IsNullOrEmpty(x.ShapeData))
                                                     .Select(x => x.ShapeData);
            foreach (var shapeData in dataLine)
            {
                listData.AddRange(JsonConvert.DeserializeObject<List<object>>(shapeData));
            }

            var dataCabinet = _context.ObjectiverPackCovers.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.ShapeData))
                                                           .Select(p => p.ShapeData);
            foreach (var shapeData in dataCabinet)
            {
                listData.AddRange(JsonConvert.DeserializeObject<List<object>>(shapeData));
            }

            return listData;
        }
    
        [HttpPost]
        public object GetProductUnit()
        {
            var data = _context.CommonSettings.Where(x => x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return data;
        }

        [HttpPost]
        public object GetProductGroup()
        {

            var query = _context.MaterialProductGroups.AsParallel().Select(x => new { x.Code, x.Name });
            return query;
        }

        [HttpPost]
        public object GetProductTypes()
        {
            var query = _context.MaterialTypes.Where(x => x.IsDeleted == false).AsParallel().Select(x => new { x.Code, x.Name });
            return query;
        }

        [HttpGet]
        public object GetListObject(string objectType)
        {
            return (from a in _context.VAllObjects
                    where (string.IsNullOrEmpty(objectType) || (objectType == EnumHelper<All>.GetDisplayValue(All.All)) || a.ObjectType == objectType)
                    select a).AsNoTracking();
        }

        public object GetProductStatus()
        {
            var data = _context.CommonSettings.Where(x => x.Group == EnumHelper<WarehouseEnum>.GetDisplayValue(WarehouseEnum.CatStatus))
                .OrderBy(x => x.Priority).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return data;
        }

        [HttpPost]
        public object GetProductCatelogue()
        {
            //var query = _context.MaterialProducts.Where(x => !x.IsDeleted && x.TypeCode.Equals("SUB_PRODUCT"))
            //                                     .Select(x => new { Code = x.ProductCode, Name = x.ProductName }).ToList();

            //Sửa theo a Hiệp bảo
            var query = _context.MaterialProducts.Where(x => !x.IsDeleted && !x.TypeCode.Equals("SUB_PRODUCT"))
                                                 .Select(x => new { Code = x.ProductCode, Name = x.ProductName }).ToList();
            return query;
        }

        [HttpPost]
        public object GetFloor(string floorCode)
        {
            var rs = _context.EDMSFloors.FirstOrDefault(x => x.FloorCode.Equals(floorCode));
            return rs;
        }
        #endregion


        #region Model
        public class EDMSJtableFileExModel : EDMSJtableFileModel
        {
            public string Position { get; set; }
            public bool IsLocated { get; set; }
        }

        public class JtableFileExModel : JtableFileModel
        {
            public string RackCode { get; set; }
            public string PackCode { get; set; }
        }

        public class PositionInfo
        {
            public string Code { get; set; }
            public string Name { get; set; }
            public string RackName { get; set; }
            public string L_Text { get; set; }
            public string FloorName { get; set; }
            public string WHS_Name { get; set; }
        }

        public class ShapeData
        {
            public string Type { get; set; }
            public string Json { get; set; }
            public string ObjectCode { get; set; }
        }

        public class JTableModelProdCustom : JTableModel
        {
            public string Code { get; set; }
            public string Name { get; set; }
            public string FromTo { get; set; }
            public string DateTo { get; set; }
            public string Group { get; set; }
            public string Type { get; set; }
            public string Status { get; set; }
            public string Catalogue { get; set; }
            public string RackCode { get; set; }
        }

        public class MaterialProductRes
        {
            public int id { get; set; }
            public string productcode { get; set; }
            public string productqrcode { get; set; }
            public string productname { get; set; }
            public string unit { get; set; }
            public string productgroup { get; set; }
            public string producttype { get; set; }
            public string pathimg { get; set; }
            public string material { get; set; }
            public string pattern { get; set; }
            public string note { get; set; }
            public string sBarCode { get; set; }
            public string sQrCode { get; set; }
            public bool IsLocated { get; set; }
            public string Position { get; set; }
            public int? MappingId { get; set; }
        }

        #endregion



    }
}



