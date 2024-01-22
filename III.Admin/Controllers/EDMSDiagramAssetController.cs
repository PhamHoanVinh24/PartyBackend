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

namespace ESEIM.Controllers
{
    public class EDMSDiagramAssetController : Controller
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IGoogleApiService _googleAPIService;

        public EDMSDiagramAssetController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment,
            IGoogleApiService googleAPIService)

        {
            _context = context;
            _upload = upload;
            _hostingEnvironment = hostingEnvironment;
            _googleAPIService = googleAPIService;
        }
        public IActionResult Index()
        {
            return View("Index");
        }

        #region Combo box
        [HttpPost]
        public List<TreeView> GetAssetType()
        {
            var data = _context.AssetTypes.Where(x => !x.IsDeleted).OrderBy(x => x.CatName).AsNoTracking();
            var dataOrder = GetAssetTypeSubTreeData(data.ToList(), null, new List<TreeView>(), 0);
            return dataOrder;
        }

        private List<TreeView> GetAssetTypeSubTreeData(List<AssetType> data, int? Parent, List<TreeView> lstCategories, int tab)
        {
            var contents = Parent == null
                ? data.Where(x => x.CatParent == null).OrderBy(x => x.CatName).AsParallel()
                : data.Where(x => x.CatParent == Parent).OrderBy(x => x.CatName).AsParallel();
            foreach (var item in contents)
            {
                var category = new TreeView
                {
                    Id = item.Id,
                    Code = item.CatCode,
                    Title = item.CatName,
                    ParentId = item.CatParent,
                    Level = tab,
                    HasChild = data.Any(x => x.CatParent == item.Id)
                };
                lstCategories.Add(category);
                if (category.HasChild) GetAssetTypeSubTreeData(data, item.Id, lstCategories, tab + 1);
            }
            return lstCategories;
        }

        [HttpPost]
        public object GetStatus()
        {
            var data = _context.CommonSettings.Where(x => x.Group == "SERVICE_STATUS").Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return data;
        }

        [HttpPost]
        public List<TreeView> GetAssetGroup()
        {
            var data = _context.AssetGroups.Where(x => !x.IsDeleted).OrderBy(x => x.Name).AsNoTracking();
            var dataOrder = GetAssetGroupSubTreeData(data.ToList(), null, new List<TreeView>(), 0);
            return dataOrder;
        }

        private List<TreeView> GetAssetGroupSubTreeData(List<AssetGroup> data, int? Parent, List<TreeView> lstCategories, int tab)
        {
            var contents = Parent == null
                ? data.Where(x => x.ParentID == null).OrderBy(x => x.Name).AsParallel()
                : data.Where(x => x.ParentID == Parent).OrderBy(x => x.Name).AsParallel();
            foreach (var item in contents)
            {
                var category = new TreeView
                {
                    Id = item.Id,
                    Code = item.Code,
                    Title = item.Name,
                    ParentId = item.ParentID,
                    Level = tab,
                    HasChild = data.Any(x => x.ParentID == item.Id)
                };
                lstCategories.Add(category);
                if (category.HasChild) GetAssetGroupSubTreeData(data, item.Id, lstCategories, tab + 1);
            }
            return lstCategories;
        }

        [HttpPost]
        public object GetPositionByAssetID(int id)
        {
            var data = (from a in _context.AssetEntityMappings.Where(x => !x.IsDeleted && x.Id == id)
                        join b in _context.EDMSWareHouseAssets on a.WHS_Code equals b.WHS_Code
                        join c in _context.EDMSFloorAssets on a.FloorCode equals c.FloorCode
                        join d in _context.EDMSLineAssets on a.LineCode equals d.LineCode
                        join e in _context.EDMSRackAssets on a.RackCode equals e.RackCode into e1
                        from e in e1.DefaultIfEmpty()
                        select new
                        {
                            RackCode = !string.IsNullOrEmpty(a.RackCode) ? a.RackCode : "",
                            CabinetCode = "",
                            a.LineCode,
                            c.FloorCode,
                            WhsCode = a.WHS_Code,
                            a.AssetCode
                        }).FirstOrDefault();

            return data;
        }

        #endregion

        #region Function Process

        //Lấy danh sách tất cả Kho, Tầng, Dãy,Kệ
        [HttpGet]
        public object GetListWareHouse()
        {
            try
            {
                var rs = _context.EDMSWareHouseAssets.Where(x => x.WHS_Flag != true)
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
                var rs = _context.EDMSFloorAssets.Where(x => x.WHS_Code.Equals(wareHouseCode))
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
                var rs = _context.EDMSLineAssets.Where(x => x.FloorCode.Equals(floorCode)).ToList();
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
                var rs = from a in _context.EDMSRackAssets
                         join b in _context.EDMSLineAssets on a.LineCode equals b.LineCode
                         join c in _context.EDMSFloorAssets on b.FloorCode equals c.FloorCode
                         let productCount = _context.AssetEntityMappings.Count(x => !x.IsDeleted && x.RackCode.Equals(a.RackCode))
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
                var rs = (from a in _context.EDMSRackAssets
                          let productCount = _context.AssetEntityMappings.Count(x => !x.IsDeleted && x.RackCode.Equals(a.RackCode))
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

            var dataRs = (from a in _context.EDMSRackAssets
                          join b in _context.EDMSLineAssets on a.LineCode equals b.LineCode
                          join c in _context.EDMSFloorAssets on b.FloorCode equals c.FloorCode
                          join d in _context.EDMSWareHouseAssets on c.WHS_Code equals d.WHS_Code
                          join e in _context.AssetEntityMappings on a.RackCode equals e.RackCode
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
        public object JTableProduct([FromBody]JTableModelProdCustom jTablePara)
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
                             join e in _context.ProdReceivedDetails.Where(x => !x.IsDeleted) on a.ProductCode equals e.ProductCode
                             join f in _context.AssetEntityMappings.Where(x => !x.IsDeleted) on e.ProductQrCode equals f.ProductQrCode into f1
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


        [HttpPost]
        public JsonResult JTableAsset([FromBody]JTableModelAsset jTablePara)
        {
            var msg = new JMessage { Error = false, Title = "" };
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.AssetMains
                        join b in _context.Suppliers on a.SupplierCode equals b.SupCode into b1
                        from b2 in b1.DefaultIfEmpty()
                        join c in _context.AssetTypes.Where(x => !x.IsDeleted) on a.AssetType equals c.CatCode into c1
                        from c2 in c1.DefaultIfEmpty()
                        join d in _context.AssetGroups on a.AssetGroup equals d.Code into d1
                        from d2 in d1.DefaultIfEmpty()
                        join e in _context.CommonSettings on a.Status equals e.CodeSet into e1
                        from e2 in e1.DefaultIfEmpty()
                        join f in _context.AssetEntityMappings.Where(x => !x.IsDeleted) on a.AssetCode equals f.AssetCode into f1
                        from f in f1.DefaultIfEmpty()
                        where a.IsDeleted == false
                        && (string.IsNullOrEmpty(jTablePara.AssetName) || (a.AssetName.ToLower().Contains(jTablePara.AssetName.ToLower()) || a.AssetCode.ToLower().Contains(jTablePara.AssetName.ToLower())))
                        && (string.IsNullOrEmpty(jTablePara.Status) || a.Status.ToLower().Contains(jTablePara.Status.ToLower()))
                        && (string.IsNullOrEmpty(jTablePara.AssetGroup) || a.AssetGroup.ToLower().Equals(jTablePara.AssetGroup.ToLower()))
                        && (string.IsNullOrEmpty(jTablePara.AssetType) || a.AssetType.ToLower().Equals(jTablePara.AssetType.ToLower()))
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
                            MappingId = f != null ? f.Id : 0,
                        };

            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "AssetID", "AssetCode", "AssetName", "AssetGroup", 
                "AssetType", "SupplierName", "BuyedTime", "ExpiredDate", "Cost", "Currency", "PathIMG", "Status", "IsLocated", "MappingId");
            return Json(jdata);
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

            var data = (from a in _context.EDMSRackAssets
                        join b in _context.EDMSLineAssets on a.LineCode equals b.LineCode
                        join c in _context.EDMSFloorAssets on b.FloorCode equals c.FloorCode
                        join d in _context.EDMSWareHouseAssets on c.WHS_Code equals d.WHS_Code
                        join e in _context.AssetEntityMappings.Where(x => !x.IsDeleted) on a.RackCode equals e.RackCode
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
        public object SaveData([FromBody]List<ShapeData> listObj)
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
                            var line = _context.EDMSLineAssets.FirstOrDefault(x => x.LineCode.Equals(obj.ObjectCode));
                            if (line != null)
                            {
                                var listObject = new List<object>();

                                listObject.Add(JsonConvert.DeserializeObject<object>(obj.Json));

                                var listRackByLineCode = listRack.Where(x => _context.EDMSRackAssets.Any(p => p.LineCode.Equals(line.LineCode) && p.RackCode.Equals(x.ObjectCode))).ToList();
                                foreach (var rack in listRackByLineCode)
                                {
                                    var exits = rack.ObjectCode.Contains(JsonConvert.SerializeObject(listObject));
                                    if (!exits)
                                        listObject.Add(JsonConvert.DeserializeObject<object>(rack.Json));
                                }

                                line.ShapeData = JsonConvert.SerializeObject(listObject);
                                _context.EDMSLineAssets.Update(line);
                            }
                            break;

                        case "CABINET":
                            var cabinet = _context.ObjectiverPackCoverAssets.FirstOrDefault(x => x.ObjPackCode.Equals(obj.ObjectCode));
                            if (cabinet != null)
                            {
                                var listObject = new List<object>();
                                listObject.Add(JsonConvert.DeserializeObject<object>(obj.Json));

                                cabinet.ShapeData = JsonConvert.SerializeObject(listObject);
                                _context.ObjectiverPackCoverAssets.Update(cabinet);
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
                msg.Object = ex;
            }
            return Json(msg);
        }

        [HttpPost]
        public List<object> LoadData(string floorCode)
        {
            var listData = new List<object>();

            var dataLine = _context.EDMSLineAssets.Where(x => x.FloorCode.Equals(floorCode) && !string.IsNullOrEmpty(x.ShapeData))
                                                     .Select(x => x.ShapeData);
            foreach (var shapeData in dataLine)
            {
                listData.AddRange(JsonConvert.DeserializeObject<List<object>>(shapeData));
            }

            var dataCabinet = _context.ObjectiverPackCoverAssets.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.ShapeData))
                                                           .Select(p => p.ShapeData);
            foreach (var shapeData in dataCabinet)
            {
                listData.AddRange(JsonConvert.DeserializeObject<List<object>>(shapeData));
            }

            return listData;
        }

        #endregion

        #region Model
        public class JTableModelAsset : JTableModel
        {
            public int AssetID { get; set; }
            public string AssetCode { get; set; }
            public string AssetName { get; set; }
            public string AssetType { get; set; }
            public string AssetGroup { get; set; }
            public string Description { get; set; }
            public string PathIMG { get; set; }
            public string Status { get; set; }
            public string BuyedTime { get; set; }
            public string ExpiredDate { get; set; }
            public string Cost { get; set; }
            public string Currency { get; set; }
            public string SupplierCode { get; set; }
            public string LocationText { get; set; }
            public string LocationGps { get; set; }
        }
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