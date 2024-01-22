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
using System.Text.Json;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.Internal;
using Syncfusion.XlsIO;
using Lucene.Net.Search;
using static Dropbox.Api.TeamLog.DeviceUnlinkPolicy;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class EDMSDiagramWarehouseController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IGoogleApiService _googleAPIService;
        private readonly IStringLocalizer<EDMSWareHouseProfileVouchersController> _stringLocalizer;
        private readonly IStringLocalizer<FileObjectShareController> _fileObjectShareController;
        private readonly IStringLocalizer<MaterialProductController> _stringMaterialLocalizer;
        private readonly IStringLocalizer<EDMSWarehouseManagerController> _stringLocalizerManager;
        private readonly IStringLocalizer<EDMSWarehouseManagerDocumentController> _stringLocalizerManagerDoc;
        private readonly IStringLocalizer<EDMSDiagramWarehouseDocumentController> _stringLocalizerDiagramDoc;
        private readonly IStringLocalizer<SharedResources> _sharedResources;

        public EDMSDiagramWarehouseController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment,
            IGoogleApiService googleAPIService, IStringLocalizer<EDMSWareHouseProfileVouchersController> stringLocalizer,
            IStringLocalizer<SharedResources> sharedResources, IStringLocalizer<FileObjectShareController> fileObjectShareController,
            IStringLocalizer<MaterialProductController> stringMaterialLocalizer,
            IStringLocalizer<EDMSWarehouseManagerController> stringLocalizerManager,
            IStringLocalizer<EDMSDiagramWarehouseDocumentController> stringLocalizerDiagramDoc,
            IStringLocalizer<EDMSWarehouseManagerDocumentController> stringLocalizerManagerDoc)
        {
            _context = context;
            _upload = upload;
            _hostingEnvironment = hostingEnvironment;
            _googleAPIService = googleAPIService;
            _stringLocalizer = stringLocalizer;
            _fileObjectShareController = fileObjectShareController;
            _stringMaterialLocalizer = stringMaterialLocalizer;
            _stringLocalizerManager = stringLocalizerManager;
            _stringLocalizerManagerDoc = stringLocalizerManagerDoc;
            _stringLocalizerDiagramDoc = stringLocalizerDiagramDoc;
            _sharedResources = sharedResources;
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
                return Json(rs);
            }
            catch (Exception ex)
            {

                throw ex;
            }
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
                return Json(rs);
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
                return Json(rs);
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }

        [HttpGet]
        public object GetListRackByFloorCode(string floorCode)
        {
            try
            {
                var rs = from a in _context.EDMSRacks
                         join b in _context.EDMSLines on a.LineCode equals b.LineCode
                         join c in _context.EDMSFloors on b.FloorCode equals c.FloorCode
                         let productCount = _context.ProductLocatedMappings.Count(x => !x.IsDeleted && x.RackCode.Equals(a.RackCode))
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
                return Json(rs);
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

                return Json(null);
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
                          let productCount = _context.ProductLocatedMappings.Count(x => !x.IsDeleted && x.RackCode.Equals(a.RackCode))
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
                return Json(rs);
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
            return Json(data);
        }

        [HttpPost]
        public object GetPositionByProdID(int id)
        {

            var dataRs = (from a in _context.EDMSRacks
                          join b in _context.EDMSLines on a.LineCode equals b.LineCode
                          join c in _context.EDMSFloors on b.FloorCode equals c.FloorCode
                          join d in _context.EDMSWareHouses on c.WHS_Code equals d.WHS_Code
                          join e in _context.ProductLocatedMappings on a.RackCode equals e.RackCode
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

                int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
                var listCommon = _context.CommonSettings.Select(x => new { x.CodeSet, x.ValueSet });

                var query = (from a in _context.MaterialProducts.Where(x => !x.IsDeleted).AsNoTracking()
                             join b in _context.MaterialProductGroups.Where(x => !x.IsDeleted) on a.GroupCode equals b.Code into b1
                             from b in b1.DefaultIfEmpty()
                             join c in _context.MaterialTypes.Where(x => !x.IsDeleted) on a.TypeCode equals c.Code into c1
                             from c in c1.DefaultIfEmpty()
                             join d in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Unit equals d.CodeSet into d2
                             from d1 in d2.DefaultIfEmpty()
                             join e in _context.ProductImportDetails.Where(x => !x.IsDeleted) on a.ProductCode equals e.ProductCode
                             join f in _context.ProductLocatedMappings.Where(x => !x.IsDeleted) on e.ProductQrCode equals f.ProductQrCode into f1
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
                var data1 = data.Skip(intBeginFor).Take(jTablePara.Length).ToList();

                data1.ForEach(x => x.Position = GetPositionByRackCode(x.productqrcode) != null ? GetPositionByRackCode(x.productqrcode).Name : "");

                var jdata = JTableHelper.JObjectTable(data1, jTablePara.Draw, count, "id", "productcode", "productqrcode", "productname", "unit", "pathimg", "material", "pattern", "note", "productgroup", "producttype", "sQrCode", "sBarCode", "IsLocated", "MappingId", "Position");

                return Json(jdata);
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        [HttpPut]
        public object UpdateATTR([FromBody] RequestUpdateATTR request)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var obj = _context.PAreaMappingsStore.First(p => p.ObjectCode == request.ObjectCode);
                if (obj != null)
                {
                    var data = new DataATTR() {
                        Weight = request.Weight,
                        Size = request.Size,
                        Quanity = request.Quanity,
                        Group = request.Group
                    };

                    string json = JsonConvert.SerializeObject(data);
                    obj.JsonAttr = json;
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizerManager["EDMSWM_MSG_CATEGORY"]);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_MSG_NOT_EXITS"], _stringLocalizerManager["EDMSWM_MSG_CATEGORY"]);
                }
            } catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Object = ex;
            }
            return Json(msg);
        }

        public class RequestUpdateATTR
        {
            public string ObjectCode { get; set; }

            public string Weight { get; set; }

            public string Size { get; set; }

            public string Quanity { get; set; }
            public string Group { get; set; }
        }

        public class DataATTR
        {
            public string Weight { get; set; }

            public string Size { get; set; }

            public string Quanity { get; set; }
            public string Group { get; set; }
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
                        join e in _context.ProductLocatedMappings.Where(x => !x.IsDeleted) on a.RackCode equals e.RackCode
                        //join g in _context.ProductImportDetails.Where(x=>!x.IsDeleted) on e.ProductQrCode equals g.ProductQrCode
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
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Object = ex;
            }
            return Json(msg);
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

        #endregion

        #region Category CRUD
        [AllowAnonymous]
        [HttpPost]
        public object InsertCategory([FromBody] PAreaCategoryStore obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var checkExist = _context.PAreaCategoriesStore.FirstOrDefault(x => x.IsDeleted == false
                                                && x.PAreaCode.Equals(obj.PAreaCode) && x.PAreaType.Equals(obj.PAreaType));
                if (checkExist == null)
                {
                    obj.CreatedBy = ESEIM.AppContext.UserName;
                    obj.CreatedTime = DateTime.Now;
                    obj.IsDeleted = false;
                    _context.PAreaCategoriesStore.Add(obj);
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizerManager["EDMSWM_MSG_CATEGORY"]);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_MSG_EXITS"], _stringLocalizerManager["EDMSWM_MSG_CATEGORY"]);
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
        [AllowAnonymous]
        [HttpPost]
        public object UpdateCategory([FromBody] PAreaCategoryStore obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.PAreaCategoriesStore.FirstOrDefault(x => x.IsDeleted == false
                                                && x.PAreaCode.Equals(obj.PAreaCode) && x.PAreaType.Equals(obj.PAreaType));
                if (data != null)
                {
                    data.PAreaDescription = obj.PAreaDescription;
                    data.UpdatedBy = ESEIM.AppContext.UserName;
                    data.UpdatedTime = DateTime.Now;
                    _context.PAreaCategoriesStore.Update(data);
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizerManager["EDMSWM_MSG_CATEGORY"]);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_MSG_NOT_EXITS"], _stringLocalizerManager["EDMSWM_MSG_CATEGORY"]);
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
        [AllowAnonymous]
        [HttpPost]
        public object DeleteCategory(int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.PAreaCategoriesStore.FirstOrDefault(x => x.Id == id);
                if (data != null)
                {
                    data.IsDeleted = true;
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    _context.PAreaCategoriesStore.Update(data);
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizerManager["EDMSWM_MSG_CATEGORY"]);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_MSG_NOT_EXITS"], _stringLocalizerManager["EDMSWM_MSG_CATEGORY"]);
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

        [AllowAnonymous]
        [HttpPost]
        public object GetCategory(int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.PAreaCategoriesStore.FirstOrDefault(x => x.Id == id);
                if (data != null)
                {
                    msg.Object = data;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_MSG_NOT_EXITS"], _stringLocalizerManager["EDMSWM_MSG_CATEGORY"]);
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

        [AllowAnonymous]
        [HttpGet]
        public object GetListAreaCategory(string type, string parentCode)
        {
            try
            {
                var rs = _context.PAreaCategoriesStore
                    .Where(x => x.IsDeleted == false && x.PAreaType == type
                        /*&& (string.IsNullOrEmpty(parentCode) || x.PAreaParent.Equals(parentCode))*/)
                    .Select(p => new
                    {
                        Code = p.PAreaCode,
                        Name = p.PAreaDescription,
                        Active = false,
                        Id = p.Id
                    }).ToList();
                return Json(rs);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public class MappingInfo
        {
            public string Code { get; set; }
            public string Name { get; set; }
            public string Type { get; set; }
            public bool Active { get; set; }
            public int Id { get; set; }
            public string Mapping { get; set; }
            public string JsonAttr { get; set; }
            public string Image { get; set; }
            public string ShapeData { get; set; }
            public string SvgIconData { get; set; }
            public int IdMapping { get; set; }

            public int? Deep { get; set; }
        }

        [AllowAnonymous]
        [HttpGet]
        public object GetListMapping(string start)
        {
            try
            {
                var rs = (from a in _context.PAreaMappingsStore
                        .Where(x => x.IsDeleted == false /*&& x.ObjectCode.StartsWith(start)*/)
                          join b in _context.PAreaCategoriesStore.Where(x => x.IsDeleted == false)
                              on new { a.CategoryCode, a.ObjectType } equals new
                              { CategoryCode = b.Code, ObjectType = b.PAreaType }
                          select new MappingInfo
                          {
                              Code = b.PAreaCode,
                              Name = b.PAreaDescription,
                              Type = a.ObjectType,
                              Active = false,
                              Id = b.Id,
                              IdMapping = a.Id,
                              Mapping = a.ObjectCode,
                              JsonAttr = a.JsonAttr,
                              Image = a.Image,
                              ShapeData = a.ShapeData,
                              SvgIconData = a.SvgIconData
                          }).ToList();
                string[] map = new[] { "AREA", "FLOOR", "LINE", "RACK", "POSITION" };
                var orderedList = from a in rs
                                  join b in map.Select((x, i) => new { Index = i, Value = x }) on a.Type equals b.Value
                                  orderby b.Index
                                  select a;
                return Json(orderedList);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        [AllowAnonymous]
        [HttpGet]
        public object GetListMappingFilter(string start)
        {
            try
            {
                var rs = (from a in _context.PAreaMappingsStore
                        .Where(x => x.IsDeleted == false && x.ObjectCode.StartsWith(start))
                          join b in _context.PAreaCategoriesStore.Where(x => x.IsDeleted == false)
                              on new { a.CategoryCode, a.ObjectType } equals new
                              { CategoryCode = b.Code, ObjectType = b.PAreaType }
                          select new MappingInfo
                          {
                              Code = b.PAreaCode,
                              Name = b.PAreaDescription,
                              Type = a.ObjectType,
                              Active = false,
                              Id = b.Id,
                              Mapping = a.ObjectCode,
                              JsonAttr = a.JsonAttr,
                              Image = a.Image,
                              ShapeData = a.ShapeData,
                              SvgIconData = a.SvgIconData
                          }).ToList();
                string[] map = new[] { "AREA", "FLOOR", "LINE", "RACK", "POSITION" };
                var orderedList = from a in rs
                                  join b in map.Select((x, i) => new { Index = i, Value = x }) on a.Type equals b.Value
                                  orderby b.Index
                                  select a;
                return Json(orderedList);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        [AllowAnonymous]
        [HttpGet]
        public object GetListMappingFilterMisc(string start)
        {
            try
            {
                var rs = (from a in _context.PAreaMappingsStore
                        .Where(x => x.IsDeleted == false && x.ObjectCode.StartsWith(start))
                          join b in _context.PAreaCategoriesStore.Where(x => x.IsDeleted == false)
                              on new { a.CategoryCode, a.ObjectType } equals new
                              { CategoryCode = b.Code, ObjectType = b.PAreaType } into b1
                          from b in b1.DefaultIfEmpty()
                          select new MappingInfo
                          {
                              Code = b != null ? b.PAreaCode : a.ObjectCode,
                              Name = b != null ? b.PAreaDescription : "",
                              Type = a.ObjectType,
                              Active = false,
                              Id = b != null ? b.Id : a.Id,
                              Mapping = a.ObjectCode,
                              JsonAttr = a.JsonAttr,
                              Image = a.Image,
                              ShapeData = a.ShapeData,
                              SvgIconData = a.SvgIconData,
                              Deep = a.Deep
                          }).ToList();
                //string[] map = new[] { "AREA", "FLOOR", "LINE", "RACK", "POSITION" };
                //var orderedList = from a in rs
                //                  join b in map.Select((x, i) => new { Index = i, Value = x }) on a.Type equals b.Value
                //                  orderby b.Index
                //                  select a;
                return Json(rs);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        [AllowAnonymous]
        [HttpGet]
        public object GetListMappingType(string type)
        {
            try
            {
                var rs = (from a in _context.PAreaMappingsStore
                        .Where(x => x.IsDeleted == false && x.ObjectType.Equals(type))
                          join b in _context.PAreaCategoriesStore
                              on new { a.CategoryCode, a.ObjectType } equals new
                              { CategoryCode = b.Code, ObjectType = b.PAreaType }
                          select new MappingInfo
                          {
                              Code = b.PAreaCode,
                              Name = b.PAreaDescription,
                              Type = a.ObjectType,
                              Active = false,
                              Id = b.Id,
                              Mapping = a.ObjectCode,
                              JsonAttr = a.JsonAttr,
                              Image = a.Image,
                              ShapeData = a.ShapeData,
                              SvgIconData = a.SvgIconData
                          }).ToList();
                string[] map = new[] { "AREA", "FLOOR", "LINE", "RACK", "POSITION" };
                var orderedList = from a in rs
                                  join b in map.Select((x, i) => new { Index = i, Value = x }) on a.Type equals b.Value
                                  orderby b.Index
                                  select a;
                return Json(orderedList);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public class MapObject
        {
            public string CategoryCode { get; set; }
            public string ObjectCode { get; set; }
            public string ObjectType { get; set; }
        }

        #endregion

        #region Mapping CRUD
        [AllowAnonymous]
        [HttpPost]
        public object InsertMapping([FromBody] PAreaMappingStore obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                //string pat = @"A_(\w+)(_F_)?(\w+)?(_L_)?(\w+)?(_R_)?(\w+)?(_P_)?(\w+)?";
                //var listMappings = _context.PAreaMappingsStore
                //    .Where(x => x.IsDeleted == false).ToList();
                // Instantiate the regular expression object.
                //Regex r = new Regex(pat, RegexOptions.IgnoreCase);

                // Match the regular expression pattern against a text string.
                //Match m = r.Match(obj.ObjectCode);
                //var listCaptures = new List<MapObject>();
                //while (m.Success)
                //{
                //    for (int i = 1; i <= 2; i++)
                //    {
                //        Group g = m.Groups[i];
                //        CaptureCollection cc = g.Captures;
                //        for (int j = 0; j < cc.Count; j++)
                //        {
                //            Capture c = cc[j];
                //            var mapObject = GetMapObject(j, c.Value, listCaptures);
                //            if (mapObject != null)
                //            {
                //                listCaptures.Add(mapObject);
                //            }
                //        }
                //    }
                //    m = m.NextMatch();
                //}
                //foreach (var item in listCaptures)
                //{
                //    var check = _context.PAreaMappingsStore.FirstOrDefault(x => x.IsDeleted == false && x.ObjectCode == item.ObjectCode);
                //    if (check == null)
                //    {
                //        var newObj = new PAreaMappingStore
                //        {
                //            ObjectCode = item.ObjectCode,
                //            ObjectType = item.ObjectType,
                //            CategoryCode = item.CategoryCode,
                //            CreatedBy = ESEIM.AppContext.UserName,
                //            CreatedTime = DateTime.Now,
                //            IsDeleted = false
                //        };
                //        _context.PAreaMappingsStore.Add(newObj);
                //    }
                //}
                if (!string.IsNullOrEmpty(obj.OldObjectCode))
                {
                    var oldObj = _context.PAreaMappingsStore.FirstOrDefault(x => x.IsDeleted == false && x.ObjectCode == obj.OldObjectCode);
                    _context.PAreaMappingsStore.Remove(oldObj);
                }
                var data = _context.PAreaMappingsStore.FirstOrDefault(x => x.IsDeleted == false && x.ObjectCode == obj.ObjectCode);
                if (data == null)
                {
                    obj.CreatedBy = ESEIM.AppContext.UserName;
                    obj.CreatedTime = DateTime.Now;
                    obj.IsDeleted = false;
                    _context.PAreaMappingsStore.Add(obj);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizerManager["EDMSWM_MSG_MAPPING_SUCCESS"];
                }
                else
                {
                    data.SvgIconData = obj.SvgIconData;
                    data.Image = obj.Image;
                    data.JsonAttr = obj.JsonAttr;
                    data.ShapeData = obj.ShapeData;
                    data.UpdatedBy = ESEIM.AppContext.UserName;
                    data.UpdatedTime = DateTime.Now;
                    data.WhsCode = obj.WhsCode;
                    _context.PAreaMappingsStore.Update(data);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizerManager["EDMSWM_MSG_MAPPING_SUCCESS"];
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
        [AllowAnonymous]
        [HttpPost]
        public object UpdateMapping([FromBody] PAreaMappingStore obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.PAreaMappingsStore.FirstOrDefault(x => x.IsDeleted == false && x.ObjectCode == obj.ObjectCode);
                if (data != null)
                {
                    data.SvgIconData = obj.SvgIconData;
                    data.Image = obj.Image;
                    data.JsonAttr = obj.JsonAttr;
                    data.Status = obj.Status;
                    data.UpdatedBy = ESEIM.AppContext.UserName;
                    data.UpdatedTime = DateTime.Now;
                    _context.PAreaMappingsStore.Update(data);
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizerManager["EDMSWM_MSG_MAPPING"]);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_MSG_NOT_EXITS"], _stringLocalizerManager["EDMSWM_MSG_MAPPING"]);
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
        [AllowAnonymous]
        [HttpPost]
        public object UpdateMappingShape([FromBody] PAreaMappingStore obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.PAreaMappingsStore.FirstOrDefault(x => x.IsDeleted == false && x.ObjectCode == obj.ObjectCode);
                if (data != null)
                {
                    data.ShapeData = obj.ShapeData;
                    data.UpdatedBy = ESEIM.AppContext.UserName;
                    data.UpdatedTime = DateTime.Now;
                    _context.PAreaMappingsStore.Update(data);
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizerManager["EDMSWM_MSG_MAPPING"]);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_MSG_NOT_EXITS"], _stringLocalizerManager["EDMSWM_MSG_MAPPING"]);
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
        [AllowAnonymous]
        [HttpPost]
        public object DeleteMapping(int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.PAreaMappingsStore.FirstOrDefault(x => x.Id == id);
                if (data != null)
                {
                    data.IsDeleted = true;
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    _context.PAreaMappingsStore.Update(data);
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizerManager["EDMSWM_MSG_MAPPING"]);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_MSG_NOT_EXITS"], _stringLocalizerManager["EDMSWM_MSG_MAPPING"]);
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
        [AllowAnonymous]
        [HttpPost]
        public object SaveMappingShape([FromBody] DiagramObject obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var areaCode = obj.AreaCode;
                var mappingObjects = obj.MappingObjects;
                var areaOldObjets = _context.PAreaMappingsStore.Where(x => !x.IsDeleted
                && !string.IsNullOrEmpty(x.ObjectCode)
                && x.ObjectCode.StartsWith(areaCode)).ToList();
                var deletedObjects = areaOldObjets.Where(x => !mappingObjects.Any(y => y.ObjectCode == x.ObjectCode));
                _context.PAreaMappingsStore.RemoveRange(deletedObjects);
                for (int i = 0; i < mappingObjects.Count; i++)
                {
                    var mappingObject = mappingObjects[i];
                    if (!string.IsNullOrEmpty(mappingObject?.ObjectCode))
                    {
                        var data = _context.PAreaMappingsStore.FirstOrDefault(x => x.IsDeleted == false && x.ObjectCode == mappingObject.ObjectCode);
                        if (data == null)
                        {
                            var newObj = new PAreaMappingStore()
                            {
                                ObjectCode = mappingObject.ObjectCode,
                                ObjectType = mappingObject.Type,
                                ShapeData = mappingObject.ShapeData,
                                CreatedBy = ESEIM.AppContext.UserName,
                                CreatedTime = DateTime.Now,
                                IsDeleted = false,
                                Deep = mappingObject.Deep
                            };
                            _context.PAreaMappingsStore.Add(newObj);
                        }
                        else
                        {
                            data.ShapeData = mappingObject.ShapeData;
                            data.UpdatedBy = ESEIM.AppContext.UserName;
                            data.UpdatedTime = DateTime.Now;
                            data.Deep = mappingObject.Deep;
                            _context.PAreaMappingsStore.Update(data);
                        }
                    }
                }
                _context.SaveChanges();
                msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizerManager["EDMSWM_MSG_MAPPING"]);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Object = ex;
            }
            return Json(msg);
        }
        public class DiagramObject
        {
            public string AreaCode { get; set; }
            public List<MappingObject> MappingObjects { get; set; }
        }
        public class MappingObject
        {
            public string Type { get; set; }
            public string ShapeData { get; set; }
            public string ObjectCode { get; set; }
            public int Deep { get; set; }
        }
        [AllowAnonymous]
        [HttpPost]
        public object GetMapping(string position)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.PAreaMappingsStore.FirstOrDefault(x => x.ObjectCode == position);
                if (data != null)
                {
                    msg.Object = data;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_MSG_NOT_EXITS"], _stringLocalizerManager["EDMSWM_MSG_MAPPING"]);
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
        [AllowAnonymous]
        [HttpGet]
        public object GetObjectDetail(string objectCode)
        {
            try
            {
                var mapping = _context.PAreaMappingsStore.FirstOrDefault(x => x.ObjectCode == objectCode);
                var obj = new DataATTR();
                try
                {
                    obj = JsonConvert.DeserializeObject<DataATTR>(mapping.JsonAttr);
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.Message);
                }
                //var products =
                //    _context.ProductLocatedMappings.Where(x => !x.IsDeleted && x.MappingCode.Equals(objectCode)).ToList();
                //var obj = new
                //{
                //    //Zone = zone,
                //    TotalProduct = products.Count,
                //    TotalQuanity = products.Sum(x => x.Quantity)
                //};
                return Json(obj);
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }

        [AllowAnonymous]
        [HttpPost]
        public object JTableProductNew([FromBody] JTableModelProdCustom jTablePara)
        {
            try
            {
                DateTime? fromDate = !string.IsNullOrEmpty(jTablePara.FromTo) ? DateTime.ParseExact(jTablePara.FromTo, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                DateTime? toDate = !string.IsNullOrEmpty(jTablePara.DateTo) ? DateTime.ParseExact(jTablePara.DateTo, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

                int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
                var listCommon = _context.CommonSettings.Select(x => new { x.CodeSet, x.ValueSet });

                var query = (from a in _context.MaterialProducts.Where(x => !x.IsDeleted).AsNoTracking()
                             join b in _context.MaterialProductGroups.Where(x => !x.IsDeleted) on a.GroupCode equals b.Code into b1
                             from b in b1.DefaultIfEmpty()
                             join c in _context.MaterialTypes.Where(x => !x.IsDeleted) on a.TypeCode equals c.Code into c1
                             from c in c1.DefaultIfEmpty()
                             join d in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Unit equals d.CodeSet into d2
                             from d1 in d2.DefaultIfEmpty()
                             join f in _context.ProductLocatedMappings.Where(x => !x.IsDeleted) on a.ProductCode equals f.ProductCode
                             join e in _context.ProductImportDetails.Where(x => !x.IsDeleted) on f.IdImpProduct equals e.Id into e1
                             from e in e1.DefaultIfEmpty()
                             where !a.IsDeleted
                                 && (string.IsNullOrEmpty(jTablePara.Code) || a.ProductCode.ToLower().Contains(jTablePara.Code.ToLower()))
                                 && (string.IsNullOrEmpty(jTablePara.Name) || a.ProductName.ToLower().Contains(jTablePara.Name.ToLower()))
                                 && ((fromDate == null) || (a.CreatedTime.Date >= fromDate))
                                 && ((toDate == null) || (a.CreatedTime.Date <= toDate))
                                 && (string.IsNullOrEmpty(jTablePara.Group) || (a.GroupCode != null && a.GroupCode == jTablePara.Group))
                                 && (string.IsNullOrEmpty(jTablePara.Type) || (a.TypeCode != null && a.TypeCode == jTablePara.Type))
                                 && (string.IsNullOrEmpty(jTablePara.Status) || (a.Status == jTablePara.Status))
                                 && (string.IsNullOrEmpty(jTablePara.Catalogue) || (a.ProductCode == jTablePara.Catalogue))
                                 && (string.IsNullOrEmpty(jTablePara.MappingCode) || (f != null && f.MappingCode == jTablePara.MappingCode))
                             select new MaterialProductRes
                             {
                                 id = a.Id,
                                 productcode = a.ProductCode,
                                 productqrcode = f.ProductQrCode,
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
                                 IsLocated = true,
                                 MappingId = f.Id,
                                 Position = ""// GetPositionByRackCode(e.ProductQrCode) != null ? GetPositionByRackCode(e.ProductQrCode).Name : ""
                             });
                var count = query.Count();
                var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).AsNoTracking().ToList();
                var data1 = data.Skip(intBeginFor).Take(jTablePara.Length).ToList();

                data1.ForEach(x =>
                {
                    x.Position = GetPositionByRackCode(x.productqrcode) != null ? GetPositionByRackCode(x.productqrcode).Name : "";
                    x.sBarCode = CommonUtil.GenerateBarCode(x.sQrCode);
                }
                );

                var jdata = JTableHelper.JObjectTable(data1, jTablePara.Draw, count, "id", "productcode", "productqrcode", "productname", "unit", "pathimg", "material", "pattern", "note", "productgroup", "producttype", "sQrCode", "sBarCode", "IsLocated", "MappingId", "Position");

                return Json(jdata);
            }
            catch (Exception ex)
            {
                throw;
            }
        }
        #endregion

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_stringLocalizerManager.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerManagerDoc.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerDiagramDoc.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringMaterialLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_fileObjectShareController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .DistinctBy(x => x.Name); ;
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion

        [AllowAnonymous]
        [HttpPost]
        public object ExportExcel()
        {
            var msg = new JMessage();
            var listData = (from a in _context.PAreaMappingsStore.Where(x => !x.IsDeleted)
                            join b in _context.PAreaCategoriesStore.Where(x => x.IsDeleted == false)
                                on new { a.CategoryCode, a.ObjectType } equals new
                                { CategoryCode = b.Code, ObjectType = b.PAreaType }
                            select new ExcelDiagramWarehouseModel
                            {
                                Id = a.Id,
                                QrCode = a.ObjectCode,
                                Mapping = b.PAreaDescription,
                            }).ToList();
            var filePath = "/files/Template/temp-diagram-warehouse.xlsx";

            string path = filePath;
            var pathUpload = string.Concat(_hostingEnvironment.WebRootPath, path);
            Stream fileStreamPath = new FileStream(pathUpload, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
            FormFile fileUpload = new FormFile(fileStreamPath, 0, fileStreamPath.Length, "Test", "Test.xlsx");

            // Read content from file
            using (ExcelEngine excelEngine = new ExcelEngine())
            {
                IApplication application = excelEngine.Excel;
                IWorkbook workbook = application.Workbooks.Open(fileUpload.OpenReadStream());
                IWorksheet sheetRequest = workbook.Worksheets[0];
                application.DefaultVersion = ExcelVersion.Excel2013;
                IStyle style = workbook.Styles.Add("NewStyle");
                style.Borders[ExcelBordersIndex.EdgeLeft].LineStyle = ExcelLineStyle.Thin;
                style.Borders[ExcelBordersIndex.EdgeRight].LineStyle = ExcelLineStyle.Thin;
                style.Borders[ExcelBordersIndex.EdgeTop].LineStyle = ExcelLineStyle.Dotted;
                style.Borders[ExcelBordersIndex.EdgeBottom].LineStyle = ExcelLineStyle.Thin;
                style.Font.FontName = "Times New Roman";
                var countAdd = listData.Count;
                if (countAdd > 0)
                    sheetRequest.InsertRow(4, countAdd);
                var row = 3;

                var countAddComponent = listData.Count;
                if (countAddComponent > 0)
                    sheetRequest.InsertRow(row, countAddComponent);

                var id = 1;
                for (int j = 0; j < listData.Count; j++)
                {
                    //sheetRequest.Range["A1"].Value2 = string.Format("{0} {1}", "TỔNG HỢP CHẤM DỨT NĂM", string.IsNullOrEmpty(listData.FirstOrDefault().Year) ? DateTime.Now.Year.ToString() : listData.FirstOrDefault().Year);
                    sheetRequest.Range["A" + row].Value2 = id;
                    sheetRequest.Range["B" + row].Value2 = listData[j].QrCode;
                    sheetRequest.Range["C" + row].Value2 = listData[j].Mapping;
                    //sheetRequest.Range["D" + row].Value2 = listData[j].Unit;
                    //sheetRequest.Range["E" + row].Value2 = listData[j].Group;
                    //sheetRequest.Range["F" + row].Value2 = listData[j].Type;
                    sheetRequest.Range["A" + row + ":V" + row].CellStyle.HorizontalAlignment = ExcelHAlign.HAlignCenter;
                    sheetRequest.Range["B" + row].CellStyle.HorizontalAlignment = ExcelHAlign.HAlignLeft;
                    row++;
                    id++;
                }
                workbook.SetSeparators('.', '.');

                var fileName = "DanhSachViTri-" + DateTime.Now.ToString("ddMMyyy-hhmm") + ".xlsx";
                var pathFile = _hostingEnvironment.WebRootPath + "\\uploads\\tempFile\\" + fileName;
                var pathFileDownLoad = "uploads\\tempFile\\" + fileName;
                FileStream stream = new FileStream(pathFile, FileMode.Create, FileAccess.ReadWrite);
                workbook.SaveAs(stream);
                stream.Dispose();

                var obj = new
                {
                    fileName,
                    pathFile = pathFileDownLoad
                };
                return obj;
            }
        }

        public class ExcelDiagramWarehouseModel
        {
            public int Id { get; set; }
            public string QrCode { get; set; }
            public string Mapping { get; set; }
        }

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
            public string MappingCode { get; set; }
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