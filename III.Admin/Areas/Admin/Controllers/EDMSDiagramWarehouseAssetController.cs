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
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class EDMSDiagramWarehouseAssetController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IGoogleApiService _googleAPIService;
        private readonly IStringLocalizer<EDMSWareHouseProfileVouchersController> _stringLocalizer;
        private readonly IStringLocalizer<FileObjectShareController> _fileObjectShareController;
        private readonly IStringLocalizer<AssetController> _stringMaterialLocalizer;
        private readonly IStringLocalizer<EDMSDiagramWarehouseDocumentController> _stringDiagramDoc;
        private readonly IStringLocalizer<SharedResources> _sharedResources;

        public EDMSDiagramWarehouseAssetController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment,
            IGoogleApiService googleAPIService, IStringLocalizer<EDMSWareHouseProfileVouchersController> stringLocalizer,
            IStringLocalizer<SharedResources> sharedResources, IStringLocalizer<FileObjectShareController> fileObjectShareController,
            IStringLocalizer<AssetController> stringMaterialLocalizer, IStringLocalizer<EDMSDiagramWarehouseDocumentController> stringDiagramDoc)
        {
            _context = context;
            _upload = upload;
            _hostingEnvironment = hostingEnvironment;
            _googleAPIService = googleAPIService;
            _stringLocalizer = stringLocalizer;
            _fileObjectShareController = fileObjectShareController;
            _stringMaterialLocalizer = stringMaterialLocalizer;
            _sharedResources = sharedResources;
            _stringDiagramDoc = stringDiagramDoc;
        }
        public IActionResult Index()
        {
            return View();
        }

        #region Function Process

        [HttpPost]
        public JsonResult JTableAsset([FromBody]JTableModelAsset jTablePara)
        {
            var msg = new JMessage { Error = false, Title = "" };
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.AssetMains.Where(x => !x.IsDeleted)
                        join b in _context.Suppliers.Where(x => !x.IsDeleted) on a.SupplierCode equals b.SupCode into b1
                        from b2 in b1.DefaultIfEmpty()
                        join c in _context.AssetTypes.Where(x => !x.IsDeleted) on a.AssetType equals c.CatCode into c1
                        from c2 in c1.DefaultIfEmpty()
                        join d in _context.AssetGroups.Where(x => !x.IsDeleted) on a.AssetGroup equals d.Code into d1
                        from d2 in d1.DefaultIfEmpty()
                        join e in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Status equals e.CodeSet into e1
                        from e2 in e1.DefaultIfEmpty()
                        join f in _context.AssetZoneMappings.Where(x => !x.IsDeleted) on a.AssetCode equals f.AssetCode into f1
                        from f in f1.DefaultIfEmpty()
                        where (string.IsNullOrEmpty(jTablePara.AssetCode) || a.AssetCode.ToLower().Contains(jTablePara.AssetCode.ToLower()))
                        && (string.IsNullOrEmpty(jTablePara.AssetName) || a.AssetName.ToLower().Contains(jTablePara.AssetName.ToLower()))
                        && (string.IsNullOrEmpty(jTablePara.Status) || a.Status.ToLower().Contains(jTablePara.Status.ToLower()))
                        select new
                        {
                            a.AssetID,
                            a.AssetCode,
                            AssetName = string.IsNullOrEmpty(a.OrderNo) ? a.AssetName : string.Format("{0} ({1})", a.AssetName, a.OrderNo),
                            a.Cost,
                            a.BuyedTime,
                            a.ExpiredDate,
                            a.PathIMG,
                            SupplierName = b2.SupName,
                            AssetType = c2.CatName,
                            AssetGroup = d2.Name,
                            Status = e2.ValueSet,
                            IsLocated = f != null ? true : false,
                        };

            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "AssetID", "AssetCode", "AssetName", "AssetGroup",
                "AssetType", "SupplierName", "BuyedTime", "ExpiredDate", "Cost", "Currency", "PathIMG", "Status", "IsLocated", "MappingId");
            return Json(jdata);
        }

        //Lấy danh sách tất cả Kho, Tầng, Dãy,Kệ
        [HttpGet]
        public object GetListWareHouseOld()
        {
            try
            {
                var rs = _context.EDMSWareHouseDocuments.Where(x => x.WHS_Flag != true)
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
        public object GetListWareHouse()
        {
            try
            {
                var rs = _context.AssetZoneStructs.Where(x => !x.IsDeleted && x.ZoneLevel != null && x.ZoneLevel == 0)
                                                        .Select(p => new
                                                        {
                                                            Code = p.ZoneCode,
                                                            Name = p.ZoneName
                                                        }).ToList();
                return Json(rs);
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }

        [HttpGet]
        public object GetListFloorByWareHouseCodeOld(string wareHouseCode)
        {
            try
            {
                var rs = _context.EDMSFloorDocuments.Where(x => x.WHS_Code.Equals(wareHouseCode))
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
        public object GetListFloorByWareHouseCode(string wareHouseCode)
        {
            try
            {
                var rs = _context.AssetZoneStructs.Where(x => !x.IsDeleted && x.ZoneLevel != null && x.ZoneLevel == 1 && x.ZoneParent.Equals(wareHouseCode))
                                                        .Select(p => new
                                                        {
                                                            Code = p.ZoneCode,
                                                            Name = p.ZoneName,
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
        public object GetListLineByFloorCodeOld(string floorCode)
        {
            try
            {
                var rs = _context.EDMSLineDocuments.Where(x => x.FloorCode.Equals(floorCode)).ToList();
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
                var rs = _context.AssetZoneStructs.Where(x => !x.IsDeleted && x.ZoneType.Equals("LINE") && x.ZoneParent.Equals(floorCode))
                                                        .Select(p => new
                                                        {
                                                            Code = p.ZoneCode,
                                                            Name = p.ZoneName
                                                        }).ToList();
                return Json(rs);
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }

        [HttpGet]
        public object GetListRackByFloorCodeOld(string floorCode)
        {
            try
            {
                var rs = from a in _context.EDMSRackDocuments
                         join b in _context.EDMSLineDocuments on a.LineCode equals b.LineCode
                         join c in _context.EDMSFloorDocuments on b.FloorCode equals c.FloorCode
                         let fileCount = _context.EDMSFilePackCovers.Count(x => !x.IsDeleted && x.RackCode.Equals(a.RackCode))
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
                             R_Status = fileCount > 0 ? (a.CNT_Box > fileCount ? "Còn chỗ" : a.CNT_Box == fileCount ? "Đầy" : "Đã vượt quá") : "Trống",
                             FileCount = fileCount
                         };
                return Json(rs);
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }

        [HttpGet]
        public object GetListChildByFloorCode(string floorCode)
        {
            try
            {
                var rs = from a in _context.AssetZoneStructs.ToList().Where(x => !x.IsDeleted && (x.ZoneType.Equals("RACK") || x.ZoneType.Equals("LINE") || x.ZoneType.Equals("CABINET")) && x.ZoneHierachy.Split("/", StringSplitOptions.None).Any(p => p.Equals(floorCode)))
                         select new
                         {
                             a.ZoneCode,
                             a.ZoneName,
                             a.ID,
                             a.ZoneType,
                             a.ZoneGroup,
                             a.ZoneLabel,
                             a.ShapeData,
                             FileCount = _context.AssetZoneMappings.Where(x => x.ZoneCode.Equals(a.ZoneCode) && !x.IsDeleted).Count()
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
                var rs = from a in _context.EDMSRackDocuments
                         join b in _context.EDMSLineDocuments on a.LineCode equals b.LineCode
                         join c in _context.EDMSFloorDocuments on b.FloorCode equals c.FloorCode
                         join d in _context.ObjectiverPackCovers.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.Located)) on a.RackCode equals d.Located
                         where c.FloorCode.Equals(floorCode)
                         select d;

                return Json(rs);
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
                var rs = (from a in _context.EDMSRackDocuments
                          let fileCount = _context.EDMSFilePackCovers.Count(x => !x.IsDeleted && x.RackCode.Equals(a.RackCode))
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
                              Status = fileCount > 0 ? (a.CNT_Box > fileCount ? "Còn chỗ" : a.CNT_Box == fileCount ? "Đầy" : "Đã vượt quá") : "Trống",
                              FileCount = fileCount
                          }).FirstOrDefault();
                return Json(rs);
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }

        [HttpGet]
        public object GetZoneDetail(string zoneCode)
        {
            try
            {
                var listPack = _context.AssetRecordsPacks.Where(x => !x.IsDeleted && x.PackZoneLocation.Equals(zoneCode));

                var zone = _context.AssetZoneStructs.FirstOrDefault(x => !x.IsDeleted && x.ZoneCode.Equals(zoneCode));
                var obj = new
                {
                    Zone = zone,
                    TotalPack = listPack.Count(),
                    TotalFile = _context.AssetZoneMappings.Where(x => !x.IsDeleted && x.ZoneCode.Equals(zone.ZoneCode)).Count()
                };
                return Json(obj);
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }

        [HttpGet]
        public object GetPackDetail(string cabinetCode)
        {
            try
            {
                var rs = (from a in _context.ObjectiverPackCovers.Where(x => !x.IsDeleted)
                          let fileCount = _context.EDMSFilePackCovers.Count(x => !x.IsDeleted && x.ObjPackCode.Equals(a.ObjPackCode))
                          where a.ObjPackCode.Equals(cabinetCode)
                          select new
                          {
                              a.ObjPackCode,
                              a.Name,
                              a.SpecSize,
                              a.Unit,
                              a.Weight,
                              FileCount = fileCount
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
        public object GetPositionByAssetID(int id)
        {
            //var data = (from a in _context.AssetZoneStructs.ToList()
            //            join b in _context.AssetRecordsPacks on a.ZoneCode equals b.PackZoneLocation into b1
            //            from b in b1.DefaultIfEmpty()
            //            join c in _context.AssetZoneMappings on b.PackCode equals c.PackCode into c1
            //            from c in c1.DefaultIfEmpty()
            //            join d in _context.AssetMains.Where(x => !x.IsDeleted) on c.AssetCode equals d.AssetCode
            //            let listZone = !string.IsNullOrEmpty(a.ZoneHierachy) ? a.ZoneHierachy.Split("/", StringSplitOptions.None) : null
            //            where d.AssetID.Equals(id)
            //            select new
            //            {
            //                RackCode = a.ZoneCode,
            //                LineCode = listZone != null ? listZone[2] : "",
            //                FloorCode = listZone != null ? listZone[1] : "",
            //                WhsCode = listZone != null ? listZone[0] : "",
            //                Position = GetPositionByRackCode(d.AssetCode) != null ? GetPositionByRackCode(d.AssetCode).PositionZone : "",
            //                PositionPack = GetPositionByRackCode(d.AssetCode) != null ? GetPositionByRackCode(d.AssetCode).PositionPack : ""
            //            }).FirstOrDefault();

            var listZones = _context.AssetZoneStructs.ToList();
            var listPack = _context.AssetRecordsPacks.ToList();
            var listZoneMapping = _context.AssetZoneMappings.Where(x => !x.IsDeleted).ToList();

            var data = (from a in _context.AssetZoneMappings.Where(x => !x.IsDeleted)
                         join b in _context.AssetMains.Where(x => !x.IsDeleted) on a.AssetCode equals b.AssetCode
                         join c in _context.AssetZoneStructs on a.ZoneCode equals c.ZoneCode
                         join d in _context.AssetRecordsPacks on a.PackCode equals d.PackCode into d1
                         from d in d1.DefaultIfEmpty()
                         let listZone = !string.IsNullOrEmpty(c.ZoneHierachy) ? c.ZoneHierachy.Split("/", StringSplitOptions.None) : null
                         select new
                         {
                             RackCode = a.ZoneCode,
                             LineCode = (listZone != null && listZone.Count() > 2) ? listZone[2] : "",
                             FloorCode = (listZone != null && listZone.Count() > 1) ? listZone[1] : "",
                             WhsCode = (listZone != null && listZone.Count() > 0) ? listZone[0] : "",
                             Position = GetPositionByRackCode(b.AssetCode, listZones, listPack, listZoneMapping) != null ? GetPositionByRackCode(b.AssetCode, listZones, listPack, listZoneMapping).PositionZone : "",
                             PositionPack = GetPositionByRackCode(b.AssetCode, listZones, listPack, listZoneMapping) != null ? GetPositionByRackCode(b.AssetCode, listZones, listPack, listZoneMapping).PositionPack : ""
                         }).FirstOrDefault();

            return data;
        }

        [NonAction]
        private PositionInfo GetPositionByRackCode(string assetCode, List<AssetZoneStruct> listZone, 
            List<AssetRecordsPack> listPack, List<AssetZoneMapping> listMapping)
        {
            var dataRs = new PositionInfo();

            //var listZone = _context.AssetZoneStructs.ToList();
            //var listPack = _context.AssetRecordsPacks.ToList();

            var data = (from a in listMapping
                        join b in listZone on a.ZoneCode equals b.ZoneCode
                       join c in listPack on a.PackCode equals c.PackCode into c1
                       from c in c1.DefaultIfEmpty()
                       select new PositionInfo
                       {
                           Code = b.ZoneCode,
                           PositionZone = string.Format("[{0}]", GetZoneHierachyFull(b.ZoneHierachy, listZone)),
                           PositionPack = c != null ? string.Format("[{0}]", GetPackHierachyFull(c.PackHierarchyPath, listPack)) : "",
                       }).ToList();
            if (data.FirstOrDefault() != null)
            {
                dataRs = data.FirstOrDefault();
            }
            return dataRs;
        }

        public string GetZoneHierachyFull(string hierachy, List<AssetZoneStruct> listData)
        {
            var str = string.Empty;
            var listZoneName = new List<string>();
            var listZone = hierachy.Split("/", StringSplitOptions.None);

            foreach (var item in listZone)
            {
                var obj = listData.FirstOrDefault(x => x.ZoneCode.Equals(item));
                if (obj != null)
                    listZoneName.Add(obj.ZoneName);
            }

            if (listZoneName.Count > 0)
                str = string.Join(" - ", listZoneName);

            return str;
        }

        public string GetPackHierachyFull(string hierachy, List<AssetRecordsPack> listData)
        {
            var str = string.Empty;
            var listPackName = new List<string>();
            var listPack = hierachy.Split("/", StringSplitOptions.None);

            foreach (var item in listPack)
            {
                var obj = listData.FirstOrDefault(x => x.PackCode.Equals(item));
                if (obj != null)
                    listPackName.Add(obj.PackName);
            }

            if (listPackName.Count > 0)
                str = string.Join(" - ", listPackName);

            return str;
        }

        [HttpPost]
        public object SaveDataOld([FromBody]List<ShapeData> listObj)
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
                            var line = _context.EDMSLineDocuments.FirstOrDefault(x => x.LineCode.Equals(obj.ObjectCode));
                            if (line != null)
                            {
                                var listObject = new List<object>();

                                listObject.Add(JsonConvert.DeserializeObject<object>(obj.Json));

                                var listRackByLineCode = listRack.Where(x => _context.EDMSRackDocuments.Any(p => p.LineCode.Equals(line.LineCode) && p.RackCode.Equals(x.ObjectCode))).ToList();
                                foreach (var rack in listRackByLineCode)
                                {
                                    var exits = rack.ObjectCode.Contains(JsonConvert.SerializeObject(listObject));
                                    if (!exits)
                                        listObject.Add(JsonConvert.DeserializeObject<object>(rack.Json));
                                }

                                line.ShapeData = JsonConvert.SerializeObject(listObject);
                                _context.EDMSLineDocuments.Update(line);
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
        public object SaveData([FromBody]List<ShapeData> listObj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                foreach (var obj in listObj)
                {
                    var zone = _context.AssetZoneStructs.FirstOrDefault(x => x.ZoneCode.Equals(obj.ObjectCode));
                    if (zone != null)
                    {
                        zone.ShapeData = obj.Json;
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

            var dataLine = _context.EDMSLineDocuments.Where(x => x.FloorCode.Equals(floorCode) && !string.IsNullOrEmpty(x.ShapeData))
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

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringMaterialLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringDiagramDoc.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_fileObjectShareController.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion

        #region Model
        public class JTableModelAsset : JTableModel
        {
            public string AssetName { get; set; }
            public string AssetGroup { get; set; }
            public string AssetType { get; set; }
            public string Status { get; set; }
            public string AssetCode { get; set; }
        }

        public class JtableFileExModel : JtableFileModel
        {
            public string RackCode { get; set; }
            public string PackCode { get; set; }
        }

        public class PositionInfo
        {
            public string Code { get; set; }
            public string PositionZone { get; set; }
            public string PositionPack { get; set; }
        }

        public class ShapeData
        {
            public string Type { get; set; }
            public string Json { get; set; }
            public string ObjectCode { get; set; }
        }

        public class EDMSJtableFileExModel : EDMSJtableFileModel
        {
            public string Position { get; set; }
            public string PositionPack { get; set; }
            public bool IsLocated { get; set; }
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