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
using Newtonsoft.Json.Linq;
using OpenXmlPowerTools;
using SmartBreadcrumbs.Attributes;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class EDMSWareHouseProfileVouchersController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IGoogleApiService _googleAPIService;
        private readonly IStringLocalizer<EDMSWareHouseProfileVouchersController> _stringLocalizer;
        private readonly IStringLocalizer<FileObjectShareController> _fileObjectShareController;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IStringLocalizer<EDMSRepositoryController> _stringLocalizerEdms;
        private readonly IStringLocalizer<FilePluginController> _stringLocalizerFp;

        public EDMSWareHouseProfileVouchersController(EIMDBContext context, IUploadService upload,
            IHostingEnvironment hostingEnvironment, IGoogleApiService googleAPIService,
            IStringLocalizer<EDMSWareHouseProfileVouchersController> stringLocalizer,
            IStringLocalizer<SharedResources> sharedResources,
            IStringLocalizer<FileObjectShareController> fileObjectShareController,
            IStringLocalizer<EDMSRepositoryController> stringLocalizerEdms,
            IStringLocalizer<FilePluginController> stringLocalizerFp)
        {
            _context = context;
            _upload = upload;
            _hostingEnvironment = hostingEnvironment;
            _googleAPIService = googleAPIService;
            _stringLocalizer = stringLocalizer;
            _fileObjectShareController = fileObjectShareController;
            _sharedResources = sharedResources;
            _stringLocalizerEdms = stringLocalizerEdms;
            _stringLocalizerFp = stringLocalizerFp;
        }
        [Breadcrumb("ViewData.CrumbWarehouseManager", AreaName = "Admin", FromAction = "Index", FromController = typeof(NomalListWareHouseHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuStore"] = _sharedResources["COM_CRUMB_MENU_STORE"];
            ViewData["CrumbNormalWHHome"] = _sharedResources["COM_BREAD_CRUMB_COMMON_CATE"];
            ViewData["CrumbWarehouseManager"] = "Quản lý kho";
            return View();
        }

        #region Ware House
        [HttpPost]
        public object JTable([FromBody] EDMSWareHouseJtableSearchModel jTablePara)
        {
            var qu = FunctionCount();
            var total = FunctionTotalCount(jTablePara.Type);
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.EDMSWareHouses
                        join b in qu on a.WHS_Code equals b.StoreCode into b2
                        from b in b2.DefaultIfEmpty()
                        join c in total on a.WHS_Code equals c.StoreCode1 into c2
                        from c in c2.DefaultIfEmpty()

                        where (string.IsNullOrEmpty(jTablePara.WHS_Code) || a.WHS_Code.ToLower().Contains(jTablePara.WHS_Code.ToLower()))
                            && (string.IsNullOrEmpty(jTablePara.WHS_Name) || a.WHS_Name.ToLower().Contains(jTablePara.WHS_Name.ToLower()))
                            && (string.IsNullOrEmpty(jTablePara.WHS_AreaSquare) || a.WHS_AreaSquare == jTablePara.WHS_AreaSquare)
                            && (string.IsNullOrEmpty(jTablePara.WHS_ADDR_Text) || a.WHS_ADDR_Text.ToLower().Contains(jTablePara.WHS_ADDR_Text.ToLower()))
                            && (string.IsNullOrEmpty(jTablePara.WHS_Note) || a.WHS_Note.ToLower().Contains(jTablePara.WHS_Note.ToLower()))
                            && (string.IsNullOrEmpty(jTablePara.WHS_Tags) || a.WHS_Tags.ToLower().Contains(jTablePara.WHS_Tags.ToLower()))
                            && a.WHS_Flag == false
                            //&& a.Type == jTablePara.Type
                        select new WareHouseRes
                        {
                            Id = a.Id,
                            WHS_Code = a.WHS_Code,
                            WHS_Name = a.WHS_Name,
                            WHS_ADDR_Text = a.WHS_ADDR_Text,
                            WHS_CNT_Floor = a.WHS_CNT_Floor,
                            WHS_Note = a.WHS_Note,
                            CurrentTotalQuantity = (b != null ? b.Quantity : 0),
                            c = c,
                            ParentId = a.ManagerId,
                            TotalQuantity = 0
                        };

            var queryNew = GetSubTreeCategoryData(query.OrderByDescending(x => x.Id).ToList(), null, new List<WareHouseResTree>(), 0, 1);
            var count = queryNew.Count();
            var data = jTablePara.QueryOrderBy.Contains("Id") ? queryNew.Skip(intBeginFor).Take(jTablePara.Length).ToList() : queryNew.AsQueryable()
                .OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            foreach (var item in data)
            {
                item.TotalQuantity = (item.c != null ? item.c.Quantity1 : 0);
            }
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "WHS_Code", "WHS_Name", "WHS_ADDR_Text",
                "WHS_CNT_Floor", "WHS_Note", "CurrentTotalQuantity", "TotalQuantity", "Level", "HasChild", "ParentCode");
            return Json(jdata);
        }

        public IEnumerable<StoreCountCurrent> FunctionCount()
        {
            var query = _context.ProductEntityMappings.Where(x => x.IsDeleted == false)
               .GroupBy(l => l.WHS_Code)
               .Select(cl => new StoreCountCurrent
               {
                   StoreCode = cl.Key,
                   Quantity = cl.Sum(c => (c.Quantity.HasValue ? c.Quantity.Value : 0))
               });
            return query;
        }

        public IEnumerable<StoreCountCurrent1> FunctionTotalCount(string type)
        {
            var query = from a in _context.EDMSWareHouses.Where(x => x.Type == type && x.WHS_Flag == false)
                        join b in _context.EDMSFloors on a.WHS_Code equals b.WHS_Code
                        join c in _context.EDMSLines on b.FloorCode equals c.FloorCode
                        join d in _context.EDMSRacks on c.LineCode equals d.LineCode
                        select new
                        {
                            StoreCode1 = a.WHS_Code,
                            d.CNT_Box
                        };
            var group = query.GroupBy(x => x.StoreCode1)
                .Select(y => new StoreCountCurrent1
                {
                    StoreCode1 = y.Key,
                    Quantity1 = y.Sum(c => c.CNT_Box)
                });
            return group;
        }

        public class StoreCountCurrent
        {
            public string StoreCode { get; set; }
            public decimal Quantity { get; set; }
        }

        public class WareHouseRes
        {
            public int Id { get; set; }
            public string WHS_Code { get; set; }
            public string WHS_Name { get; set; }
            public string WHS_ADDR_Text { get; set; }
            public int WHS_CNT_Floor { get; set; }
            public string WHS_Note { get; set; }
            public string ParentId { get; set; }
            public decimal CurrentTotalQuantity { get; set; }
            public StoreCountCurrent1 c { get; set; }
            public int TotalQuantity { get; set; }
        }
        public class WareHouseResTree: TreeView
        {
            public new int Id { get; set; }
            public string WHS_Code { get; set; }
            public string WHS_Name { get; set; }
            public string WHS_ADDR_Text { get; set; }
            public int WHS_CNT_Floor { get; set; }
            public string WHS_Note { get; set; }
            public new string ParentId { get; set; }
            public decimal CurrentTotalQuantity { get; set; }
            public StoreCountCurrent1 c { get; set; }
            public int TotalQuantity { get; set; }
        }
        public class StoreCountCurrent1
        {
            public string StoreCode1 { get; set; }
            public int Quantity1 { get; set; }
        }

        [HttpGet]
        public JsonResult GetQuantityEmpty(string WHS_Code)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var wareHouse = _context.EDMSWareHouses.AsNoTracking().FirstOrDefault(m => m.WHS_Flag != true && m.WHS_Code == WHS_Code);
                if (wareHouse != null)
                {
                    var query = from a in _context.EDMSLines.AsNoTracking()
                                join b in _context.EDMSFloors.AsNoTracking().Where(m => m.WHS_Code == WHS_Code) on a.FloorCode equals b.FloorCode
                                select (a);

                    var QuantityTotal = query.Sum(x => x.CNT_Rack);

                    var prodMapping = _context.ProductEntityMappings.Where(x => !x.IsDeleted && x.WHS_Code.Equals(WHS_Code))
                                        .GroupBy(x => new { x.WHS_Code, x.RackCode });
                    var QuantityHasItem = prodMapping.Count();

                    msg.Object = new { QuantityEmpty = QuantityTotal - QuantityHasItem, QuantityHasItem = QuantityHasItem };
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Kho không tồn tại, vui lòng làm mới trang!";
                    msg.Title = String.Format(_sharedResources["COM_MSG_REFRESH"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                //msg.Title = "Có lỗi khi lấy dữ liệu!";
                msg.Title = String.Format(_sharedResources["COM_MSG_DATA_FAIL"]);

            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Insert(EDMSWareHouse obj, IFormFile imageUpload)
        {
            var msg = new JMessage { Error = false, Title = "" };

            var check = _context.EDMSWareHouses.FirstOrDefault(x => !x.WHS_Flag && x.WHS_Code.Equals(obj.WHS_Code) && x.Type.Equals(obj.Type));
            if (check == null)
            {
                if (imageUpload != null)
                {
                    var upload = _upload.UploadImage(imageUpload);
                    if (upload.Error)
                    {
                        msg.Error = true;
                        msg.Title = upload.Title;
                        return Json(msg);
                    }
                    else
                    {
                        obj.IMG_WHS = "/uploads/Images/" + upload.Object.ToString();
                    }
                }
                _context.EDMSWareHouses.Add(obj);
                if (!string.IsNullOrEmpty(obj.WHS_ADDR_Gps))
                {
                    var gps = new MapDataGps
                    {
                        Title = obj.WHS_Name,
                        PolygonGPS = _googleAPIService.ConvertLatLnToMap(obj.WHS_ADDR_Gps),
                        ObjType = EnumHelper<WarehouseEnum>.GetDisplayValue(WarehouseEnum.Warehouse),
                        ObjCode = obj.WHS_Code,
                        Icon = "/images/map/store.png",
                        IsActive = true,
                        IsDefault = true,
                        MakerGPS = obj.WHS_ADDR_Gps,
                        GisData = obj.WHS_ADDR_Gps,
                        CreatedTime = DateTime.Now,
                        CreatedBy = ESEIM.AppContext.UserName,
                    };
                    _context.MapDataGpss.Add(gps);
                }
                _context.SaveChanges();
                //msg.Title = "Thêm mới kho dữ liệu thành công";
                msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["EDMSWHPV_CURD_LBL_WHS_NAME_DATA"]);
            }
            else
            {
                msg.Error = true;
                msg.Title = "Kho đã tồn tại";
            }

            return Json(msg);
        }

        [HttpPost]
        public JsonResult Update(EDMSWareHouse objModel, IFormFile imageUpload)
        {
            var msg = new JMessage { Error = false, Title = "" };

            var obj = _context.EDMSWareHouses.FirstOrDefault(x => x.WHS_Code == objModel.WHS_Code && !x.WHS_Flag);
            if (obj != null)
            {
                //Check số tầng đã khai báo
                int chkFloor = _context.EDMSFloors.Count(x => x.WHS_Code.Equals(obj.WHS_Code));
                if (objModel.WHS_CNT_Floor < chkFloor)
                {
                    msg.Error = true;
                    msg.Title = "Số tầng nhập vào nhỏ hơn số tầng đã được khai báo trong phần Tầng, dãy, kệ!";
                }
                else
                {
                    if (objModel.ManagerId == obj.Id.ToString())
                    {
                        msg.Error = true;
                        msg.Title = "Không được chọn kho làm cha của kho";
                        return Json(msg);
                    }
                    if (imageUpload != null)
                    {
                        var upload = _upload.UploadImage(imageUpload);
                        if (upload.Error)
                        {
                            msg.Error = true;
                            msg.Title = upload.Title;
                            return Json(msg);
                        }
                        else
                        {
                            obj.IMG_WHS = "/uploads/Images/" + upload.Object.ToString();
                        }
                    }
                    obj.WHS_Name = objModel.WHS_Name;
                    obj.WHS_ADDR_Gps = objModel.WHS_ADDR_Gps;
                    obj.WHS_ADDR_Text = objModel.WHS_ADDR_Text;
                    obj.WHS_AreaSquare = objModel.WHS_AreaSquare;
                    obj.WHS_CNT_Floor = objModel.WHS_CNT_Floor;
                    obj.WHS_Tags = objModel.WHS_Tags;
                    obj.WHS_Note = objModel.WHS_Note;
                    obj.ManagerId = objModel.ManagerId;
                    var mapData = _context.MapDataGpss.FirstOrDefault(x => x.ObjCode == obj.WHS_Code && x.IsDefault == true && x.ObjType == EnumHelper<WarehouseEnum>.GetDisplayValue(WarehouseEnum.Warehouse));
                    if (mapData != null)
                    {
                        mapData.MakerGPS = obj.WHS_ADDR_Gps;
                        mapData.PolygonGPS = mapData.PolygonGPS != obj.WHS_ADDR_Gps ? _googleAPIService.ConvertLatLnToMap(obj.WHS_ADDR_Gps) : mapData.PolygonGPS;
                        mapData.Title = obj.WHS_Name;
                        mapData.UpdatedBy = ESEIM.AppContext.UserName;
                        mapData.UpdatedTime = DateTime.Now;
                        mapData.GisData = obj.WHS_ADDR_Gps;
                        _context.MapDataGpss.Update(mapData);
                    }
                    else
                    {
                        if (!string.IsNullOrEmpty(obj.WHS_ADDR_Gps))
                        {
                            var gps = new MapDataGps
                            {
                                Title = obj.WHS_Name,
                                PolygonGPS = _googleAPIService.ConvertLatLnToMap(obj.WHS_ADDR_Gps),
                                ObjType = EnumHelper<WarehouseEnum>.GetDisplayValue(WarehouseEnum.Warehouse),
                                ObjCode = obj.WHS_Code,
                                Icon = "/images/map/store.png",
                                IsActive = true,
                                IsDefault = true,
                                MakerGPS = obj.WHS_ADDR_Gps,
                                GisData = obj.WHS_ADDR_Gps,
                                CreatedTime = DateTime.Now,
                                CreatedBy = ESEIM.AppContext.UserName,
                            };
                            _context.MapDataGpss.Add(gps);
                        }
                    }

                    _context.Update(obj);
                    _context.SaveChanges();
                    //msg.Title = "Cập nhập kho dữ liệu thành công !";
                    msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["EDMSWHPV_CURD_LBL_WHS_NAME_DATA"]);
                }


            }
            else
            {
                msg.Error = true;
                //msg.Title = "Không tìm thấy kho trong CSDL !";
                msg.Title = String.Format(_sharedResources["COM_MSG_NOT_FOUND_DATA"]);
            }

            return Json(msg);
        }

        [HttpPost]
        public object Delete(int id)
        {
            var msg = new JMessage { Error = true };
            try
            {
                var data = _context.EDMSWareHouses.FirstOrDefault(x => x.Id == id);
                if (data != null)
                {
                    //Check kho chứa sản phẩm ko (ở 2 bảng - kho hồ sơ và kho sản phẩm)
                    var chkUsedProd = _context.ProductEntityMappings.Any(x => !x.IsDeleted && x.WHS_Code == data.WHS_Code && data.Type == "PR");
                    var chkUsedDocument = _context.EDMSEntityMappings.Any(x => x.WHS_Code == data.WHS_Code && data.Type == "RV");
                    if (chkUsedProd || chkUsedDocument)
                    {
                        msg.Error = true;
                        msg.Title = "Kho đã được sử dụng không thể xóa!";
                    }
                    else
                    {
                        var mapData = _context.MapDataGpss.FirstOrDefault(x => x.ObjCode == data.WHS_Code && x.MakerGPS == data.WHS_ADDR_Gps && x.ObjType == EnumHelper<WarehouseEnum>.GetDisplayValue(WarehouseEnum.Warehouse));
                        if (mapData != null)
                        {
                            _context.MapDataGpss.Remove(mapData);
                        }

                        //var edmsFile = _context.EDMSWareHouseMedias.Where(x => x.WHS_Code.Equals(data.WHS_Code)).ToList();
                        //if (edmsFile.Count > 0)
                        //    _context.EDMSWareHouseMedias.RemoveRange(edmsFile);

                        var edmsExtend = _context.EDMSWarehouseExtends.Where(x => x.WhsCode.Equals(data.WHS_Code)).ToList();
                        if (edmsExtend.Count > 0)
                            _context.EDMSWarehouseExtends.RemoveRange(edmsExtend);


                        data.WHS_Flag = true;
                        _context.EDMSWareHouses.Update(data);
                        _context.SaveChanges();
                        msg.Error = false;
                        //msg.Title = "Xóa kho dữ liệu thành công!";
                        msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer["EDMSWHPV_CURD_LBL_WHS_NAME_DATA"]);
                    }
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Kho đã bị xóa!";
                    msg.Title = String.Format(_sharedResources["COM_MSG_NOT_EXITS_FILE"]);

                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi khi xóa!";
                msg.Title = String.Format(_sharedResources["COM_ERR_DELETE"]);

            }
            return Json(msg);
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

        [AllowAnonymous]
        [HttpPost]
        public object GetTreeDataParent()
        {
            var msg = new JMessage { Error = true };

            try
            {
                var data = (from a in _context.EDMSWareHouses
                            select new WareHouseRes
                            {
                                Id = a.Id,
                                WHS_Code = a.WHS_Code,
                                WHS_Name = a.WHS_Name,
                                WHS_ADDR_Text = a.WHS_ADDR_Text,
                                WHS_CNT_Floor = a.WHS_CNT_Floor,
                                WHS_Note = a.WHS_Note,
                                CurrentTotalQuantity = 0,
                                c = null,
                                ParentId = a.ManagerId,
                                TotalQuantity = 0
                            })/*.Where(x => x.IsDeleted == false)*/.OrderBy(x => x.Id).AsNoTracking();
                var dataOrder = GetSubTreeCategoryData(data.ToList(), null, new List<WareHouseResTree>(), 0, 1);
                //return dataOrder;
                //var data = _context.MaterialProductGroups.GroupBy(x => x.Name).Select(x => x.First()).Where(d => d.ParentID == null);
                //var dataa = data.Distinct();
                msg.Object = dataOrder;

                msg.Error = false;
            }
            catch (Exception ex)
            {
                //msg.Title = "Get Parent Group fail ";
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }

            return Json(msg);
        }

        [NonAction]
        private List<WareHouseResTree> GetSubTreeCategoryData(List<WareHouseRes> data, string parentId, List<WareHouseResTree> lstCategories, int tab, int typeOrder)
        {
            //tab += "- ";
            var contents = string.IsNullOrEmpty(parentId)
                ? (typeOrder == 1 ? data.Where(x => x.ParentId == null).OrderBy(x => x.Id).AsParallel() : data.Where(x => x.ParentId == null).OrderByDescending(x => x.Id).AsParallel())
                : data.Where(x => x.ParentId == parentId).OrderByDescending(x => x.Id).AsParallel();
            foreach (var item in contents)
            {
                var category = new WareHouseResTree
                {
                    Id = item.Id,
                    Code = item.WHS_Code,
                    Title = item.WHS_Name,
                    WHS_Code = item.WHS_Code,
                    WHS_Name = item.WHS_Name,
                    WHS_ADDR_Text = item.WHS_ADDR_Text,
                    WHS_CNT_Floor = item.WHS_CNT_Floor,
                    WHS_Note = item.WHS_Note,
                    CurrentTotalQuantity = item.CurrentTotalQuantity,
                    c = item.c,
                    ParentId = item.ParentId,
                    TotalQuantity = 0,
                    Level = tab,
                    HasChild = data.Any(x => x.ParentId == item.Id.ToString()),
                    ParentCode = item.ParentId,
                };
                lstCategories.Add(category);
                if (category.HasChild) GetSubTreeCategoryData(data, item.Id.ToString(), lstCategories, tab + 1, 1);
            }
            return lstCategories;
        }
        #endregion

        #region File
        public class JTableModelFile : JTableModel
        {
            public string WHS_Code { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string CatCode { get; set; }
        }

        [HttpPost]
        public object JTableFile([FromBody] JTableModelFile jTablePara)
        {
            if (string.IsNullOrEmpty(jTablePara.WHS_Code))
            {
                return JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "Id", "FileName", "FileTypePhysic", "Desc", "Url", "CreatedTime", "UpdatedTime", "ReposName", "TypeFile");
            }
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var query = ((from a in _context.EDMSRepoCatFiles.Where(x => x.ObjectCode == jTablePara.WHS_Code && x.ObjectType == EnumHelper<WarehouseEnum>.GetDisplayValue(WarehouseEnum.Warehouse))
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
                              b.FileID
                          }).Union(
                  from a in _context.EDMSObjectShareFiles.Where(x => x.ObjectCode == jTablePara.WHS_Code && x.ObjectType == EnumHelper<WarehouseEnum>.GetDisplayValue(WarehouseEnum.Warehouse))
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
                      b.FileID
                  })).AsNoTracking();
            int count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "FileCode", "FileName", "FileTypePhysic",
                    "Desc", "CreatedTime", "CloudFileId", "ReposName", "TypeFile", "FileID");
            return jdata;
        }

        [HttpPost]
        public JsonResult InsertFile(EDMSRepoCatFileModel obj, IFormFile fileUpload)
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
                    //var suggesstion = GetSuggestionsFile(obj.WHS_Code);
                    //if (suggesstion != null)
                    //{
                    //    reposCode = suggesstion.ReposCode;
                    //    path = suggesstion.Path;
                    //    folderId = suggesstion.FolderId;
                    //    catCode = suggesstion.CatCode;
                    //}

                    var repoDefault = _context.EDMSRepoDefaultObjects.FirstOrDefault(x => !x.IsDeleted
                           && x.ObjectCode.Equals(obj.WHS_Code) && x.ObjectType.Equals(EnumHelper<ObjectType>.GetDisplayValue(ObjectType.MaterialStore)));
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
                        msg.Title = "Vui lòng chọn thư mục lưu trữ!";
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
                    FileCode = string.Concat("WAREHOUSE", Guid.NewGuid().ToString()),
                    ReposCode = reposCode,
                    CatCode = catCode,
                    ObjectCode = obj.WHS_Code,
                    ObjectType = EnumHelper<WarehouseEnum>.GetDisplayValue(WarehouseEnum.Warehouse),
                    Path = path,
                    FolderId = folderId
                };
                _context.EDMSRepoCatFiles.Add(edmsReposCatFile);

                /// created Index lucene
                if (Array.IndexOf(LuceneExtension.fileMimetypes, mimeType) >= 0 && (Array.IndexOf(LuceneExtension.fileExt, extension.ToUpper()) >= 0))
                {
                    LuceneExtension.IndexFile(edmsReposCatFile.FileCode, fileUpload, string.Concat(_hostingEnvironment.WebRootPath, "\\uploads\\luceneIndex"));
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
                msg.Title = "Thêm tệp thành công";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = "Có lỗi xảy ra. Xin thử lại!";
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateFile(EDMSRepoCatFileModel obj)
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
                        msg.Title = "Cập nhật thông tin thành công !";
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = "Vui lòng chọn thư mục lưu trữ !";
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Tệp tin không tồn tại hoặc đã bị xóa !";
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
        public JsonResult DeleteFile(int id)
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
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer[""]);// "Xóa thành công";
                }
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
        public JsonResult GetFile(int id)
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
                msg.Title = "Có lỗi xảy ra. Xin thử lại!";
            }
            return Json(msg);
        }

        [HttpGet]
        public EDMSRepoCatFile GetSuggestionsFile(string whsCode)
        {
            var query = _context.EDMSRepoCatFiles.Where(x => x.ObjectCode == whsCode && x.ObjectType == EnumHelper<WarehouseEnum>.GetDisplayValue(WarehouseEnum.Warehouse)).MaxBy(x => x.Id);
            return query;
        }

        [HttpGet]
        public ActionResult DownloadFile(int id)
        {
            var data = (from a in _context.EDMSRepoCatFiles.Where(x => x.Id == id)
                        join b in _context.EDMSRepositorys on a.ReposCode equals b.ReposCode into b2
                        from b in b2.DefaultIfEmpty()
                        join c in _context.EDMSFiles on a.FileCode equals c.FileCode into c2
                        from c in c2.DefaultIfEmpty()
                        select new
                        {
                            a.Id,
                            Server = (b != null ? b.Server : null),
                            Type = (b != null ? b.Type : null),
                            Url = (c != null ? c.Url : null),
                            FileId = (c != null ? c.CloudFileId : null),
                            FileTypePhysic = c.FileTypePhysic,
                            c.FileName,
                            c.MimeType,
                            b.Account,
                            b.PassWord
                        }
                        ).FirstOrDefault();
            if (data != null)
            {
                if (data.Type == "SERVER")
                {
                    if (!string.IsNullOrEmpty(data.Server))
                    {
                        string ftphost = data.Server;
                        string ftpfilepath = data.Url;
                        var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + ftphost + ftpfilepath);
                        using (WebClient request = new WebClient())
                        {
                            request.Credentials = new NetworkCredential(data.Account, data.PassWord);
                            byte[] fileData = request.DownloadData(urlEnd);
                            return File(fileData, data.MimeType, data.FileName);
                        }
                    }
                }
                else
                {
                    var fileData = FileExtensions.DownloadFileGoogle(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", data.FileId);
                    return File(fileData, data.MimeType, data.FileName);
                }
            }
            return null;
        }
        //[NonAction]
        //public JMessage InsertFileRaw(EDMSRepoCatFileModel obj, IFormFile fileUpload, bool fromServer = true)
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
        //                var suggesstion = GetSuggestionsFile(obj.WHS_Code);
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
        //                FileCode = string.Concat("WAREHOUSE", Guid.NewGuid().ToString()),
        //                ReposCode = reposCode,
        //                CatCode = catCode,
        //                ObjectCode = obj.WHS_Code,
        //                ObjectType = EnumHelper<WarehouseEnum>.GetDisplayValue(WarehouseEnum.Warehouse),
        //                Path = path,
        //                FolderId = folderId
        //            };
        //            _context.EDMSRepoCatFiles.Add(edmsReposCatFile);

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
        //public JMessage InsertFileRaw(EDMSRepoCatFileModel obj, EDMSRepoCatFile item, EDMSRepository oldRes, bool fromServer = true)
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
        //                    FileCode = string.Concat("WAREHOUSE", Guid.NewGuid().ToString()),
        //                    ReposCode = reposCode,
        //                    CatCode = catCode,
        //                    ObjectCode = obj.WHS_Code,
        //                    ObjectType = EnumHelper<WarehouseEnum>.GetDisplayValue(WarehouseEnum.Warehouse),
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
        //                    FileCode = string.Concat("WAREHOUSE", Guid.NewGuid().ToString()),
        //                    ReposCode = reposCode,
        //                    CatCode = catCode,
        //                    ObjectCode = obj.WHS_Code,
        //                    ObjectType = EnumHelper<WarehouseEnum>.GetDisplayValue(WarehouseEnum.Warehouse),
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
        //        DeleteFile(item.Id);
        //        if (fileUpload != null)
        //        {
        //            InsertFileRaw(newItem, fileUpload);
        //        }
        //        else
        //        {
        //            InsertFileRaw(newItem, item, oldRes);
        //        }
        //        _context.SaveChanges();
        //        msg.Title = "Cập nhật thành công";
        //        //try
        //        //{
        //        //    var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + oldRes.Server + file.Url);
        //        //    FileExtensions.DeleteFileFtpServer(urlEnd, oldRes.Account, oldRes.PassWord);
        //        //}
        //        //catch (Exception ex) { }
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
        //        DeleteFile(item.Id);
        //        if (fileUpload != null)
        //        {
        //            InsertFileRaw(newItem, fileUpload, false);
        //        }
        //        else
        //        {
        //            InsertFileRaw(newItem, item, oldRes, false);
        //        }
        //        _context.SaveChanges();
        //        msg.Title = "Cập nhật thành công";
        //        //try
        //        //{
        //        //    FileExtensions.DeleteFileGoogleServer(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", file.CloudFileId);
        //        //}
        //        //catch (Exception ex) { }
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
        //private void DeleteFileRaw(int id)
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
            public string WhsCode { get; set; }
            public string ExtCode { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
        }

        [HttpPost]
        public object JTableExtend([FromBody] JTableModelExtend jTablePara)
        {
            DateTime? fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            DateTime? toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.EDMSWarehouseExtends
                        where (a.IsDeleted == false
                        && (string.IsNullOrEmpty(jTablePara.ExtCode) || a.ExtCode.ToLower().Contains(jTablePara.ExtCode.ToLower()))
                        && a.WhsCode == jTablePara.WhsCode
                        && ((fromDate == null) || (a.CreatedTime >= fromDate))
                        && ((toDate == null) || (a.CreatedTime <= toDate))
                        )
                        select new
                        {
                            Id = a.Id,
                            Code = a.ExtCode,
                            Value = a.ExtValue,
                            CreatedTime = a.CreatedTime.ToString("dd/MM/yyyy")
                        };
            int count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "Code", "Value", "CreatedTime");

            return Json(jdata);
        }

        [HttpPost]
        public object DeleteExtend(int id)
        {
            var msg = new JMessage();
            try
            {
                var data = _context.EDMSWarehouseExtends.FirstOrDefault(x => x.Id == id);
                data.IsDeleted = true;
                _context.EDMSWarehouseExtends.Update(data);
                _context.SaveChanges();
                msg.Error = false;
                msg.Title = "Xóa thành công";
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra!";
                msg.Object = ex;
                return Json(msg);
            }
        }

        [HttpPost]
        public object InsertExtend([FromBody] EDMSWarehouseExtend obj)
        {
            var msg = new JMessage();
            try
            {
                var checkExist = _context.EDMSWarehouseExtends.FirstOrDefault(x => x.WhsCode.Equals(obj.WhsCode) && x.ExtCode.Equals(obj.ExtCode) && x.IsDeleted == false);
                if (checkExist == null)
                {
                    obj.CreatedTime = DateTime.Now;
                    _context.EDMSWarehouseExtends.Add(obj);
                    _context.SaveChanges();
                    msg.Error = false;
                    msg.Title = "Thêm trường mở rộng thành công!";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Mã trường mở rộng đã tồn tại!";
                }
                return Json(msg);
            }
            catch
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra!";

                return Json(msg);
            }
        }

        [HttpGet]
        public object GetExtend(int id)
        {
            var data = _context.EDMSWarehouseExtends.FirstOrDefault(x => x.Id == id);
            return Json(data);
        }

        [HttpPost]
        public object UpdateExtend([FromBody] EDMSWarehouseExtend obj)
        {
            var msg = new JMessage();
            try
            {
                obj.UpdatedTime = DateTime.Now.Date;
                _context.EDMSWarehouseExtends.Update(obj);
                _context.SaveChanges();
                msg.Error = false;
                msg.Title = "Cập nhật thành công";
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra!";
                msg.Object = ex;
                return Json(msg);
            }
        }
        #endregion

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerEdms.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerFp.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_fileObjectShareController.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion
    }
    public class EDMSWareHouseJtableSearchModel : JTableModel
    {
        public string WHS_Code { get; set; }
        public string WHS_Name { get; set; }
        public string WHS_AreaSquare { get; set; }
        public string WHS_ADDR_Text { get; set; }
        public string WHS_CNT_Floor { get; set; }
        public string WHS_Note { get; set; }
        public string WHS_Tags { get; set; }
        public string Type { get; set; }
    }
}