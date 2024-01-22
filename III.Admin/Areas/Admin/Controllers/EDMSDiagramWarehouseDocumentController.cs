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
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Authorization;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class EDMSDiagramWarehouseDocumentController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IGoogleApiService _googleApiService;
        private readonly IStringLocalizer<EDMSDiagramWarehouseDocumentController> _stringLocalizer;
        private readonly IStringLocalizer<EDMSWarehouseManagerDocumentController> _stringLocalizerManagerDoc;
        private readonly IStringLocalizer<EDMSWarehouseManagerController> _stringLocalizerManager;
        private readonly IStringLocalizer<FileObjectShareController> _fileObjectShareController;
        private readonly IStringLocalizer<SharedResources> _sharedResources;

        public EDMSDiagramWarehouseDocumentController(EIMDBContext context,
            IUploadService upload,
            IHostingEnvironment hostingEnvironment,
            IGoogleApiService googleApiService,
            IStringLocalizer<EDMSDiagramWarehouseDocumentController> stringLocalizer,
            IStringLocalizer<EDMSWarehouseManagerController> stringLocalizerManager,
            IStringLocalizer<SharedResources> sharedResources,
            IStringLocalizer<FileObjectShareController> fileObjectShareController,
            IStringLocalizer<EDMSWarehouseManagerDocumentController> stringLocalizerManagerDoc)
        {
            _context = context;
            _upload = upload;
            _hostingEnvironment = hostingEnvironment;
            _googleApiService = googleApiService;
            _stringLocalizer = stringLocalizer;
            _stringLocalizerManagerDoc = stringLocalizerManagerDoc;
            _stringLocalizerManager = stringLocalizerManager;
            _fileObjectShareController = fileObjectShareController;
            _sharedResources = sharedResources;
        }
        public IActionResult Index()
        {
            return View();
        }

        #region Deprecated Function

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
                                                            Name = p.WHS_Name,
                                                            Id = p.Id
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
                var rs = _context.ZoneStructs.Where(x => !x.IsDeleted && x.ZoneLevel != null && x.ZoneLevel == 0)
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
                var rs = _context.EDMSFloorDocuments
                    .Where(x => string.IsNullOrEmpty(wareHouseCode) || x.WHS_Code.Equals(wareHouseCode))
                                                    .Select(p => new
                                                    {
                                                        Code = p.FloorCode,
                                                        Name = p.FloorName,
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

        [HttpGet]
        public object GetListFloorByWareHouseCode(string wareHouseCode)
        {
            try
            {
                var rs = _context.ZoneStructs.Where(x => !x.IsDeleted && x.ZoneLevel != null && x.ZoneLevel == 1 && x.ZoneParent.Equals(wareHouseCode))
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
            //try
            //{
            //    var rs = _context.EDMSLineDocuments
            //        .Where(x => string.IsNullOrEmpty(floorCode) || x.FloorCode.Equals(floorCode)).ToList();
            //    return Json(rs);
            //}
            //catch (Exception ex)
            //{

            //    throw ex;
            //}
            try
            {
                var rs = _context.EDMSLineDocuments
                            .Where(x => string.IsNullOrEmpty(floorCode) || x.FloorCode.Equals(floorCode))
                    .Select(p => new
                    {
                        Code = p.LineCode,
                        Name = p.L_Text,
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

        [HttpGet]
        public object GetListLineByFloorCode(string floorCode)
        {
            try
            {
                var rs = _context.ZoneStructs.Where(x => !x.IsDeleted && x.ZoneType.Equals("LINE") && x.ZoneParent.Equals(floorCode))
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
                         where string.IsNullOrEmpty(floorCode) || c.FloorCode.Equals(floorCode)
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
        public object GetListRackByLineCode(string lineCode)
        {
            try
            {
                var rs = from a in _context.EDMSRackDocuments
                             //join c in _context.EDMSFloorDocuments on b.FloorCode equals c.FloorCode
                             //let fileCount = _context.EDMSFilePackCovers.Count(x => !x.IsDeleted && x.RackCode.Equals(a.RackCode))
                         where string.IsNullOrEmpty(lineCode) || a.LineCode.Equals(lineCode)
                         select new
                         {
                             Code = a.RackCode,
                             Name = a.RackName,
                             Active = false,
                             Id = a.Id
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
                var listFile = from a in _context.RecordsPackFiles.Where(x => !x.IsDeleted)
                               join b in _context.RecordsPacks.Where(x => !x.IsDeleted) on a.PackCode equals b.PackCode
                               select b;

                var rs = from a in _context.ZoneStructs.ToList().Where(x => !x.IsDeleted && (x.ZoneType.Equals("RACK") || x.ZoneType.Equals("LINE") || x.ZoneType.Equals("CABINET")) && x.ZoneHierachy.Split("/", StringSplitOptions.None).Any(p => p.Equals(floorCode)))
                         let fileCount = listFile.Count(x => !x.IsDeleted && x.PackZoneLocation.Equals(a.ZoneCode))
                         select new
                         {
                             a.ZoneCode,
                             a.ZoneName,
                             a.ID,
                             a.ZoneType,
                             a.ZoneGroup,
                             a.ZoneLabel,
                             a.ShapeData,
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
                var listFile = from a in _context.RecordsPackFiles.Where(x => !x.IsDeleted)
                               join b in _context.RecordsPacks.Where(x => !x.IsDeleted && x.PackZoneLocation.Equals(zoneCode)) on a.PackCode equals b.PackCode
                               select b;

                var listPack = _context.RecordsPacks.Where(x => !x.IsDeleted && x.PackZoneLocation.Equals(zoneCode));

                //var zone = _context.ZoneStructs.FirstOrDefault(x => !x.IsDeleted && x.ZoneCode.Equals(zoneCode));
                var obj = new
                {
                    //Zone = zone,
                    TotalPack = listPack.Count(),
                    TotalFile = listFile.Count()
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

        [AllowAnonymous]
        [HttpPost]
        public object GetListUser()
        {
            var data = _context.Users.Where(x => x.Active).Select(p => new { Code = p.UserName, Name = p.GivenName });
            return Json(data);
        }

        [HttpPost]
        public object GetPositionByFileID(int id)
        {
            var data = (from a in _context.ZoneStructs.ToList()
                        join b in _context.RecordsPacks on a.ZoneCode equals b.PackZoneLocation
                        join c in _context.RecordsPackFiles on b.PackCode equals c.PackCode
                        join d in _context.EDMSFiles.Where(x => !x.IsDeleted) on c.FileCode equals d.FileCode
                        let listZone = !string.IsNullOrEmpty(a.ZoneHierachy) ? a.ZoneHierachy.Split("/", StringSplitOptions.None) : null
                        where d.FileID.Equals(id)
                        select new
                        {
                            RackCode = a.ZoneCode,
                            LineCode = listZone != null ? listZone[2] : "",
                            FloorCode = listZone != null ? listZone[1] : "",
                            WhsCode = listZone != null ? listZone[0] : "",
                            Position = GetPositionByRackCode(d.FileCode) != null ? GetPositionByRackCode(d.FileCode).PositionZone : "",
                            PositionPack = GetPositionByRackCode(d.FileCode) != null ? GetPositionByRackCode(d.FileCode).PositionPack : ""
                        }).FirstOrDefault();

            return data;
        }

        [AllowAnonymous]
        [HttpPost]
        public object GetPositionByFileIdNew(int id)
        {
            var data = (from a in _context.PAreaMappings.Where(x => !x.IsDeleted).ToList()
                        join b in _context.RecordsPacks on a.ObjectCode equals b.PackZoneLocation
                        join c in _context.RecordsPackFiles on b.PackCode equals c.PackCode
                        join d in _context.EDMSFiles.Where(x => !x.IsDeleted) on c.FileCode equals d.FileCode
                        where d.FileID.Equals(id)
                        select new
                        {
                            ObjectCode = a.ObjectCode,
                            CategoryCode = a.CategoryCode,
                            Position = GetPositionByRackCode(d.FileCode) != null ? GetPositionByRackCode(d.FileCode).PositionZone : "",
                            PositionPack = GetPositionByRackCode(d.FileCode) != null ? GetPositionByRackCode(d.FileCode).PositionPack : ""
                        }).FirstOrDefault();

            return data;
        }

        [AllowAnonymous]
        [HttpPost]
        public JsonResult JTableFileNew([FromBody] JtableFileExModel jTablePara)
        {
            try
            {
                int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
                var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var query2 = (from a in _context.EDMSFiles.Where(x => !x.IsDeleted && (x.IsFileMaster == null || x.IsFileMaster == true))
                              join b in _context.EDMSRepoCatFiles on a.FileCode equals b.FileCode
                              join d in _context.EDMSRepositorys on a.ReposCode equals d.ReposCode into d2
                              from d in d2.DefaultIfEmpty()
                              join e in _context.EDMSCategorys.Where(x => !x.IsDeleted) on b.CatCode equals e.CatCode into e1
                              from e in e1.DefaultIfEmpty()
                              join f in _context.RecordsPackFiles.Where(x => !x.IsDeleted) on a.FileCode equals f.FileCode into f1
                              from f in f1.DefaultIfEmpty()
                              join g in _context.RecordsPacks.Where(x => !x.IsDeleted) on f.PackCode equals g.PackCode into g1
                              from g in g1.DefaultIfEmpty()
                              where ((fromDate == null) || (a.CreatedTime.HasValue && a.CreatedTime.Value.Date >= fromDate)) &&
                                    ((toDate == null) || (a.CreatedTime.HasValue && a.CreatedTime.Value.Date <= toDate)) &&
                                    (string.IsNullOrEmpty(jTablePara.UserUpload) || (a.CreatedBy == jTablePara.UserUpload)) &&
                                    (string.IsNullOrEmpty(jTablePara.ObjectType) || (jTablePara.ObjectType == EnumHelper<All>.GetDisplayValue(All.All)) || b.ObjectType == jTablePara.ObjectType) &&
                                    (string.IsNullOrEmpty(jTablePara.ObjectCode) || b.ObjectCode == jTablePara.ObjectCode) &&
                                    (string.IsNullOrEmpty(jTablePara.MappingCode) || g != null && g.PackZoneLocation == jTablePara.MappingCode)
                              select new { a, b, d, e, IsLocated = f != null ? true : false });
                var capacity = query2.Sum(x => x.a.FileSize.Value);
                var query = query2.OrderByDescending(x => x.a.FileID).AsNoTracking().Skip(intBeginFor).Take(jTablePara.Length).ToList();


                var count = (from a in _context.EDMSFiles.Where(x => !x.IsDeleted && (x.IsFileMaster == null || x.IsFileMaster == true))
                             join b in _context.EDMSRepoCatFiles on a.FileCode equals b.FileCode
                             join f in _context.RecordsPackFiles.Where(x => !x.IsDeleted) on a.FileCode equals f.FileCode into f1
                             from f in f1.DefaultIfEmpty()
                             join g in _context.RecordsPacks.Where(x => !x.IsDeleted) on f.PackCode equals g.PackCode into g1
                             from g in g1.DefaultIfEmpty()
                             where ((fromDate == null) || (a.CreatedTime.HasValue && a.CreatedTime.Value.Date >= fromDate)) &&
                                   ((toDate == null) || (a.CreatedTime.HasValue && a.CreatedTime.Value.Date <= toDate)) &&
                                   (string.IsNullOrEmpty(jTablePara.UserUpload) || (a.CreatedBy == jTablePara.UserUpload)) &&
                                   (string.IsNullOrEmpty(jTablePara.ObjectType) || (jTablePara.ObjectType == EnumHelper<All>.GetDisplayValue(All.All)) || b.ObjectType == jTablePara.ObjectType) &&
                                   (string.IsNullOrEmpty(jTablePara.ObjectCode) || b.ObjectCode == jTablePara.ObjectCode) &&
                                   (string.IsNullOrEmpty(jTablePara.MappingCode) || g != null && g.PackZoneLocation == jTablePara.MappingCode)
                             select a).AsNoTracking().Count();
                var list = query.Select(x => new
                {
                    Id = x.b != null ? x.b.Id : -1,
                    x.a.FileID,
                    x.a.FileName,
                    x.a.FileTypePhysic,
                    x.a.CreatedBy,
                    x.a.CreatedTime,
                    x.a.Tags,
                    x.a.Url,
                    x.a.MimeType,
                    ReposName = x.d != null ? x.d.ReposName : "",
                    x.a.CloudFileId,
                    ServerAddress = x.d != null ? x.d.Server : "",
                    Category = x.b != null ? x.b.CatCode : "",
                    FileSize = capacity,
                    SizeOfFile = x.a.FileSize.HasValue ? x.a.FileSize.Value : 0,
                    CatName = x.e != null ? x.e.CatName : "",
                    UpdateTime = x.a.EditedFileTime.HasValue ? x.a.EditedFileTime.Value.ToString("dd/MM/yyyy HH:mm:ss") : "",
                    x.IsLocated,
                    Position = x.IsLocated && GetPositionByRackCode(x.a.FileCode) != null ? GetPositionByRackCode(x.a.FileCode).PositionZone : "",
                    PositionPack = x.IsLocated && GetPositionByRackCode(x.a.FileCode) != null ? GetPositionByRackCode(x.a.FileCode).PositionPack : "",
                }).ToList();
                var jdata = JTableHelper.JObjectTable(list, jTablePara.Draw, count, "FileID", "FileName", "FileTypePhysic", "CreatedBy",
                    "CreatedTime", "Tags", "Url", "MimeType", "Id", "ReposName", "CloudFileId", "ServerAddress", "Category", "FolderName",
                    "FileSize", "SizeOfFile", "CatName", "UpdateTime", "IsLocated", "Position", "PositionPack");
                return Json(jdata);
            }
            catch (Exception ex)
            {
                return Json(ex.Message);
            }
        }

        [AllowAnonymous]
        [HttpPost]
        public JsonResult JTableFile([FromBody] JtableFileExModel jTablePara)
        {
            try
            {
                int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
                var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                if (!string.IsNullOrEmpty(jTablePara.Content))
                {
                    var queryLucene = SearchLuceneFile(jTablePara.Content, intBeginFor, jTablePara.Length);
                    var queryDataLucene =
                        (from a in queryLucene.listLucene
                         join c in _context.EDMSFiles.Where(x => !x.IsDeleted && (x.IsFileMaster == null || x.IsFileMaster == true)) on a.FileCode equals c.FileCode
                         join b in _context.EDMSRepoCatFiles on a.FileCode equals b.FileCode
                         join d in _context.EDMSRepositorys on c.ReposCode equals d.ReposCode into d2
                         from d in d2.DefaultIfEmpty()
                         join e in _context.EDMSCategorys.Where(x => !x.IsDeleted) on b.CatCode equals e.CatCode into e1
                         from e2 in e1.DefaultIfEmpty()
                         join f in _context.RecordsPackFiles.Where(x => !x.IsDeleted) on c.FileCode equals f.FileCode into f1
                         from f in f1.DefaultIfEmpty()
                         where ((fromDate == null) || (a.CreatedTime.HasValue && a.CreatedTime.Value.Date >= fromDate)) &&
                               ((toDate == null) || (a.CreatedTime.HasValue && a.CreatedTime.Value.Date <= toDate)) &&
                               (string.IsNullOrEmpty(jTablePara.UserUpload) || (a.CreatedBy == jTablePara.UserUpload)) &&
                               (string.IsNullOrEmpty(jTablePara.ObjectType) || (jTablePara.ObjectType == EnumHelper<All>.GetDisplayValue(All.All)) || b.ObjectType == jTablePara.ObjectType) &&
                               (string.IsNullOrEmpty(jTablePara.ObjectCode) || b.ObjectCode == jTablePara.ObjectCode)
                         select new EDMSJtableFileExModel
                         {
                             Id = b.Id,
                             FileID = c.FileID,
                             FileName = c.FileName,
                             FileTypePhysic = c.FileTypePhysic,
                             CreatedBy = c.CreatedBy,
                             CreatedTime = c.CreatedTime,
                             Tags = c.Tags,
                             Content = a.Content,
                             Url = c.Url,
                             MimeType = c.MimeType,
                             ReposName = d != null ? d.ReposName : "",
                             CloudFileId = c.CloudFileId,
                             ServerAddress = d != null ? d.Server : "",
                             Category = b.CatCode,
                             FileSize = c.FileSize.HasValue ? c.FileSize.Value : 0,
                             SizeOfFile = c.FileSize.HasValue ? c.FileSize.Value : 0,
                             CatName = e2 != null ? e2.CatName : "",
                             IsLocated = f != null ? true : false,
                             Position = f != null && GetPositionByRackCode(a.FileCode) != null ? GetPositionByRackCode(a.FileCode).PositionZone : "",
                             PositionPack = f != null && GetPositionByRackCode(a.FileCode) != null ? GetPositionByRackCode(a.FileCode).PositionPack : ""
                         });
                    var capacity = queryDataLucene.Sum(x => x.FileSize);
                    var paggingLucene = queryDataLucene.Skip(intBeginFor).Take(jTablePara.Length).ToList();
                    foreach (var item in queryDataLucene)
                    {
                        item.FileSize = capacity;
                    }
                    var countLucene = (from a in queryLucene.listLucene
                                       join c in _context.EDMSFiles.Where(x => !x.IsDeleted && (x.IsFileMaster == null || x.IsFileMaster == true)) on a.FileCode equals c.FileCode
                                       join b in _context.EDMSRepoCatFiles on a.FileCode equals b.FileCode
                                       join f in _context.RecordsPackFiles.Where(x => !x.IsDeleted) on c.FileCode equals f.FileCode into f1
                                       from f in f1.DefaultIfEmpty()
                                       where ((fromDate == null) || (a.CreatedTime.HasValue && a.CreatedTime.Value.Date >= fromDate)) &&
                                             ((toDate == null) || (a.CreatedTime.HasValue && a.CreatedTime.Value.Date <= toDate)) &&
                                             (string.IsNullOrEmpty(jTablePara.UserUpload) || (a.CreatedBy == jTablePara.UserUpload)) &&
                                             (string.IsNullOrEmpty(jTablePara.ObjectType) || (jTablePara.ObjectType == EnumHelper<All>.GetDisplayValue(All.All)) || b.ObjectType == jTablePara.ObjectType) &&
                                             (string.IsNullOrEmpty(jTablePara.ObjectCode) || b.ObjectCode == jTablePara.ObjectCode)
                                       select a).Count();
                    var jdata = JTableHelper.JObjectTable(paggingLucene, jTablePara.Draw, countLucene, "FileID", "FileName", "FileTypePhysic",
                        "CreatedBy", "CreatedTime", "Tags", "Url", "Content", "MimeType", "Id", "ReposName", "CloudFileId", "ServerAddress",
                        "Category", "FolderName", "FileSize", "SizeOfFile", "CatName", "IsLocated", "Position", "PositionPack");
                    return Json(jdata);
                }
                else
                {
                    if (!jTablePara.RecentFile)
                    {
                        var query2 = (from a in _context.EDMSFiles.Where(x => !x.IsDeleted && (x.IsFileMaster == null || x.IsFileMaster == true))
                                      join b in _context.EDMSRepoCatFiles on a.FileCode equals b.FileCode
                                      join d in _context.EDMSRepositorys on a.ReposCode equals d.ReposCode into d2
                                      from d in d2.DefaultIfEmpty()
                                      join e in _context.EDMSCategorys.Where(x => !x.IsDeleted) on b.CatCode equals e.CatCode into e1
                                      from e in e1.DefaultIfEmpty()
                                      join f in _context.RecordsPackFiles.Where(x => !x.IsDeleted) on a.FileCode equals f.FileCode into f1
                                      from f in f1.DefaultIfEmpty()
                                      where ((fromDate == null) || (a.CreatedTime.HasValue && a.CreatedTime.Value.Date >= fromDate)) &&
                                            ((toDate == null) || (a.CreatedTime.HasValue && a.CreatedTime.Value.Date <= toDate)) &&
                                            (string.IsNullOrEmpty(jTablePara.UserUpload) || (a.CreatedBy == jTablePara.UserUpload)) &&
                                            (string.IsNullOrEmpty(jTablePara.ObjectType) || (jTablePara.ObjectType == EnumHelper<All>.GetDisplayValue(All.All)) || b.ObjectType == jTablePara.ObjectType) &&
                                            (string.IsNullOrEmpty(jTablePara.ObjectCode) || b.ObjectCode == jTablePara.ObjectCode)
                                      select new { a, b, d, e, IsLocated = f != null ? true : false });
                        var capacity = query2.Sum(x => x.a.FileSize.Value);
                        var query = query2.OrderByDescending(x => x.a.FileID).AsNoTracking().Skip(intBeginFor).Take(jTablePara.Length).ToList();


                        var count = (from a in _context.EDMSFiles.Where(x => !x.IsDeleted && (x.IsFileMaster == null || x.IsFileMaster == true))
                                     join b in _context.EDMSRepoCatFiles on a.FileCode equals b.FileCode
                                     join f in _context.RecordsPackFiles.Where(x => !x.IsDeleted) on a.FileCode equals f.FileCode into f1
                                     from f in f1.DefaultIfEmpty()
                                     where ((fromDate == null) || (a.CreatedTime.HasValue && a.CreatedTime.Value.Date >= fromDate)) &&
                                           ((toDate == null) || (a.CreatedTime.HasValue && a.CreatedTime.Value.Date <= toDate)) &&
                                           (string.IsNullOrEmpty(jTablePara.UserUpload) || (a.CreatedBy == jTablePara.UserUpload)) &&
                                           (string.IsNullOrEmpty(jTablePara.ObjectType) || (jTablePara.ObjectType == EnumHelper<All>.GetDisplayValue(All.All)) || b.ObjectType == jTablePara.ObjectType) &&
                                           (string.IsNullOrEmpty(jTablePara.ObjectCode) || b.ObjectCode == jTablePara.ObjectCode)
                                     select a).AsNoTracking().Count();
                        var list = query.Select(x => new
                        {
                            Id = x.b != null ? x.b.Id : -1,
                            x.a.FileID,
                            x.a.FileName,
                            x.a.FileTypePhysic,
                            x.a.CreatedBy,
                            x.a.CreatedTime,
                            x.a.Tags,
                            x.a.Url,
                            x.a.MimeType,
                            ReposName = x.d != null ? x.d.ReposName : "",
                            x.a.CloudFileId,
                            ServerAddress = x.d != null ? x.d.Server : "",
                            Category = x.b != null ? x.b.CatCode : "",
                            FileSize = capacity,
                            SizeOfFile = x.a.FileSize.HasValue ? x.a.FileSize.Value : 0,
                            CatName = x.e != null ? x.e.CatName : "",
                            UpdateTime = x.a.EditedFileTime.HasValue ? x.a.EditedFileTime.Value.ToString("dd/MM/yyyy HH:mm:ss") : "",
                            x.IsLocated,
                            Position = x.IsLocated && GetPositionByRackCode(x.a.FileCode) != null ? GetPositionByRackCode(x.a.FileCode).PositionZone : "",
                            PositionPack = x.IsLocated && GetPositionByRackCode(x.a.FileCode) != null ? GetPositionByRackCode(x.a.FileCode).PositionPack : "",
                        }).ToList();
                        var jdata = JTableHelper.JObjectTable(list, jTablePara.Draw, count, "FileID", "FileName", "FileTypePhysic", "CreatedBy",
                            "CreatedTime", "Tags", "Url", "MimeType", "Id", "ReposName", "CloudFileId", "ServerAddress", "Category", "FolderName",
                            "FileSize", "SizeOfFile", "CatName", "UpdateTime", "IsLocated", "Position", "PositionPack");
                        return Json(jdata);
                    }
                    else
                    {
                        var query2 = (from a in _context.EDMSFiles.Where(x => !x.IsDeleted && (x.IsFileMaster == null || x.IsFileMaster == true))
                                      join b in _context.EDMSRepoCatFiles on a.FileCode equals b.FileCode
                                      join d in _context.EDMSRepositorys on a.ReposCode equals d.ReposCode into d2
                                      from d in d2.DefaultIfEmpty()
                                      join e in _context.EDMSCategorys.Where(x => !x.IsDeleted) on b.CatCode equals e.CatCode into e1
                                      from e in e1.DefaultIfEmpty()
                                      join f in _context.RecordsPackFiles.Where(x => !x.IsDeleted) on a.FileCode equals f.FileCode into f1
                                      from f in f1.DefaultIfEmpty()
                                      where ((fromDate == null) || (a.CreatedTime.HasValue && a.CreatedTime.Value.Date >= fromDate)) &&
                                            ((toDate == null) || (a.CreatedTime.HasValue && a.CreatedTime.Value.Date <= toDate)) &&
                                            (string.IsNullOrEmpty(jTablePara.UserUpload) || (a.CreatedBy == jTablePara.UserUpload)) &&
                                            (string.IsNullOrEmpty(jTablePara.ObjectType) || (jTablePara.ObjectType == EnumHelper<All>.GetDisplayValue(All.All)) || b.ObjectType == jTablePara.ObjectType) &&
                                            (string.IsNullOrEmpty(jTablePara.ObjectCode) || b.ObjectCode == jTablePara.ObjectCode)
                                      select new { a, b, d, e, f });
                        var capacity = query2.Sum(x => x.a.FileSize.Value);
                        var query = query2.OrderByDescending(x => x.a.FileID).AsNoTracking().Skip(intBeginFor).Take(jTablePara.Length).ToList();
                        var count = (from a in _context.EDMSFiles.Where(x => !x.IsDeleted && (x.IsFileMaster == null || x.IsFileMaster == true))
                                     join b in _context.EDMSRepoCatFiles on a.FileCode equals b.FileCode
                                     join f in _context.RecordsPackFiles.Where(x => !x.IsDeleted) on a.FileCode equals f.FileCode into f1
                                     from f in f1.DefaultIfEmpty()
                                     where ((fromDate == null) || (a.CreatedTime.HasValue && a.CreatedTime.Value.Date >= fromDate)) &&
                                           ((toDate == null) || (a.CreatedTime.HasValue && a.CreatedTime.Value.Date <= toDate)) &&
                                           (string.IsNullOrEmpty(jTablePara.UserUpload) || (a.CreatedBy == jTablePara.UserUpload)) &&
                                           (string.IsNullOrEmpty(jTablePara.ObjectType) || (jTablePara.ObjectType == EnumHelper<All>.GetDisplayValue(All.All)) || b.ObjectType == jTablePara.ObjectType)
                                     select a).AsNoTracking().Count();
                        var list = query.Select(x => new
                        {
                            Id = x.b != null ? x.b.Id : -1,
                            x.a.FileID,
                            x.a.FileName,
                            x.a.FileTypePhysic,
                            x.a.CreatedBy,
                            x.a.CreatedTime,
                            x.a.Tags,
                            x.a.Url,
                            x.a.MimeType,
                            ReposName = x.d != null ? x.d.ReposName : "",
                            x.a.CloudFileId,
                            ServerAddress = x.d != null ? x.d.Server : "",
                            Category = x.b != null ? x.b.CatCode : "",
                            FileSize = capacity,
                            SizeOfFile = x.a.FileSize.HasValue ? x.a.FileSize.Value : 0,
                            CatName = x.e != null ? x.e.CatName : "",
                            UpdateTime = x.a.EditedFileTime.HasValue ? x.a.EditedFileTime.Value.ToString("dd/MM/yyyy HH:mm:ss") : "",
                            IsLocated = x.f != null ? true : false,
                            Position = x.f != null && GetPositionByRackCode(x.a.FileCode) != null ? GetPositionByRackCode(x.a.FileCode).PositionZone : "",
                            PositionRack = x.f != null && GetPositionByRackCode(x.a.FileCode) != null ? GetPositionByRackCode(x.a.FileCode).PositionPack : ""
                        }).ToList();
                        var jdata = JTableHelper.JObjectTable(list, jTablePara.Draw, count, "FileID", "FileName", "FileTypePhysic", "CreatedBy",
                            "CreatedTime", "Tags", "Url", "MimeType", "Id", "ReposName", "CloudFileId", "ServerAddress", "Category", "FolderName",
                            "FileSize", "SizeOfFile", "CatName", "UpdateTime", "IsLocated", "Position", "PositionRack");
                        return Json(jdata);
                    }
                }
            }
            catch (Exception ex)
            {
                return Json(ex.Message);
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
        private PositionInfo GetPositionByRackCode(string fileCode)
        {
            var dataRs = new PositionInfo();

            var listZone = _context.ZoneStructs.ToList();
            var listPack = _context.RecordsPacks.ToList();
            var data = (from a in listZone
                        join b in listPack on a.ZoneCode equals b.PackZoneLocation
                        join c in _context.RecordsPackFiles on b.PackCode equals c.PackCode
                        where c.FileCode.Equals(fileCode)
                        select new PositionInfo
                        {
                            Code = a.ZoneCode,
                            PositionZone = string.Format("[{0}]", GetZoneHierachyFull(a.ZoneHierachy, listZone)),
                            PositionPack = string.Format("[{0}]", GetPackHierachyFull(b.PackHierarchyPath, listPack)),
                        }).ToList();
            if (data.FirstOrDefault() != null)
            {
                dataRs = data.FirstOrDefault();
            }
            return dataRs;
        }

        public string GetZoneHierachyFull(string hierachy, List<ZoneStruct> listData)
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

        public string GetPackHierachyFull(string hierachy, List<RecordsPack> listData)
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
        public object SaveDataOld([FromBody] List<ShapeData> listObj)
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
        public object SaveData([FromBody] List<ShapeData> listObj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                foreach (var obj in listObj)
                {
                    var zone = _context.ZoneStructs.FirstOrDefault(x => x.ZoneCode.Equals(obj.ObjectCode));
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
        #region Category CRUD
        [AllowAnonymous]
        [HttpPost]
        public object InsertCategory([FromBody] PAreaCategory obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var checkExist = _context.PAreaCategories.FirstOrDefault(x => x.IsDeleted == false
                                                && x.PAreaCode.Equals(obj.PAreaCode) && x.PAreaType.Equals(obj.PAreaType));
                if (checkExist == null)
                {
                    obj.CreatedBy = ESEIM.AppContext.UserName;
                    obj.CreatedTime = DateTime.Now;
                    obj.IsDeleted = false;
                    _context.PAreaCategories.Add(obj);
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
        public object UpdateCategory([FromBody] PAreaCategory obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.PAreaCategories.FirstOrDefault(x => x.IsDeleted == false
                                                && x.PAreaCode.Equals(obj.PAreaCode) && x.PAreaType.Equals(obj.PAreaType));
                if (data != null)
                {
                    data.PAreaDescription = obj.PAreaDescription;
                    data.UpdatedBy = ESEIM.AppContext.UserName;
                    data.UpdatedTime = DateTime.Now;
                    _context.PAreaCategories.Update(data);
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
                var data = _context.PAreaCategories.FirstOrDefault(x => x.Id == id);
                if (data != null)
                {
                    data.IsDeleted = true;
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    _context.PAreaCategories.Update(data);
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
                var data = _context.PAreaCategories.FirstOrDefault(x => x.Id == id);
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
                var rs = _context.PAreaCategories
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
        }

        [AllowAnonymous]
        [HttpGet]
        public object GetListMapping(string start)
        {
            try
            {
                var rs = (from a in _context.PAreaMappings
                        .Where(x => x.IsDeleted == false /*&& x.ObjectCode.StartsWith(start)*/)
                          join b in _context.PAreaCategories
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

        public class MapObject
        {
            public string CategoryCode { get; set; }
            public string ObjectCode { get; set; }
            public string ObjectType { get; set; }
        }

        private MapObject GetMapObject(int index, string value, List<MapObject> mapObjects)
        {
            switch (index)
            {
                case 0:
                    {
                        var objectCode = "A_" + value;
                        return new MapObject { CategoryCode = value, ObjectType = "AREA", ObjectCode = objectCode };
                    }
                case 2:
                    {
                        var lastObject = mapObjects.FirstOrDefault(x => x.ObjectType == "AREA");
                        var objectCode = lastObject?.ObjectCode + "_F_" + value;
                        return new MapObject { CategoryCode = value, ObjectType = "FLOOR", ObjectCode = objectCode };
                    }
                case 4:
                    {
                        var lastObject = mapObjects.FirstOrDefault(x => x.ObjectType == "AREA");
                        var objectCode = lastObject?.ObjectCode + "_L_" + value;
                        return new MapObject { CategoryCode = value, ObjectType = "LINE", ObjectCode = objectCode };
                    }
                case 6:
                    {
                        var lastObject = mapObjects.FirstOrDefault(x => x.ObjectType == "AREA");
                        var objectCode = lastObject?.ObjectCode + "_R_" + value;
                        return new MapObject { CategoryCode = value, ObjectType = "RACK", ObjectCode = objectCode };
                    }
                case 8:
                    {
                        var lastObject = mapObjects.FirstOrDefault(x => x.ObjectType == "AREA");
                        var objectCode = lastObject?.ObjectCode + "_P_" + value;
                        return new MapObject { CategoryCode = value, ObjectType = "POSITION", ObjectCode = objectCode };
                    }
                default:
                    return null;
            }
        }

        #endregion
        #region Mapping CRUD
        [AllowAnonymous]
        [HttpPost]
        public object InsertMapping([FromBody] PAreaMapping obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                //string pat = @"A_(\w+)(_F_)?(\w+)?(_L_)?(\w+)?(_R_)?(\w+)?(_P_)?(\w+)?";
                //var listMappings = _context.PAreaMappings
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
                //    var check = _context.PAreaMappings.FirstOrDefault(x => x.IsDeleted == false && x.ObjectCode == item.ObjectCode);
                //    if (check == null)
                //    {
                //        var newObj = new PAreaMapping
                //        {
                //            ObjectCode = item.ObjectCode,
                //            ObjectType = item.ObjectType,
                //            CategoryCode = item.CategoryCode,
                //            CreatedBy = ESEIM.AppContext.UserName,
                //            CreatedTime = DateTime.Now,
                //            IsDeleted = false
                //        };
                //        _context.PAreaMappings.Add(newObj);
                //    }
                //}
                var data = _context.PAreaMappings.FirstOrDefault(x => x.IsDeleted == false && x.ObjectCode == obj.ObjectCode);
                if (data == null)
                {
                    obj.CreatedBy = ESEIM.AppContext.UserName;
                    obj.CreatedTime = DateTime.Now;
                    obj.IsDeleted = false;
                    _context.PAreaMappings.Add(obj);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizerManager["EDMSWM_MSG_MAPPING_SUCCESS"];
                }
                else
                {
                    data.SvgIconData = obj.SvgIconData;
                    data.Image = obj.Image;
                    data.JsonAttr = obj.JsonAttr;
                    data.UpdatedBy = ESEIM.AppContext.UserName;
                    data.UpdatedTime = DateTime.Now;
                    _context.PAreaMappings.Update(data);
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
        public object UpdateMapping([FromBody] PAreaMapping obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.PAreaMappings.FirstOrDefault(x => x.IsDeleted == false && x.ObjectCode == obj.ObjectCode);
                if (data != null)
                {
                    data.SvgIconData = obj.SvgIconData;
                    data.Image = obj.Image;
                    data.JsonAttr = obj.JsonAttr;
                    data.Status = obj.Status;
                    data.UpdatedBy = ESEIM.AppContext.UserName;
                    data.UpdatedTime = DateTime.Now;
                    _context.PAreaMappings.Update(data);
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
        public object UpdateMappingShape([FromBody] PAreaMapping obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.PAreaMappings.FirstOrDefault(x => x.IsDeleted == false && x.ObjectCode == obj.ObjectCode);
                if (data != null)
                {
                    data.ShapeData = obj.ShapeData;
                    data.UpdatedBy = ESEIM.AppContext.UserName;
                    data.UpdatedTime = DateTime.Now;
                    _context.PAreaMappings.Update(data);
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
                var data = _context.PAreaMappings.FirstOrDefault(x => x.Id == id);
                if (data != null)
                {
                    data.IsDeleted = true;
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    _context.PAreaMappings.Update(data);
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
        public object SaveMappingShape([FromBody] List<MappingObject> mappingObjects)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                for (int i = 0; i < mappingObjects.Count; i++)
                {
                    var mappingObject = mappingObjects[i];
                    if (!string.IsNullOrEmpty(mappingObject?.ObjectCode))
                    {
                        var data = _context.PAreaMappings.FirstOrDefault(x => x.IsDeleted == false && x.ObjectCode == mappingObject.ObjectCode);
                        if (data != null)
                        {
                            data.ShapeData = mappingObject.ShapeData;
                            data.UpdatedBy = ESEIM.AppContext.UserName;
                            data.UpdatedTime = DateTime.Now;
                            _context.PAreaMappings.Update(data);
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
        public class MappingObject
        {
            public string Type { get; set; }
            public string ShapeData { get; set; }
            public string ObjectCode { get; set; }
        }
        [AllowAnonymous]
        [HttpPost]
        public object GetMapping(string position)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.PAreaMappings.FirstOrDefault(x => x.ObjectCode == position);
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
        #endregion
        #region Language
        [AllowAnonymous]
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerManager.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerManagerDoc.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_fileObjectShareController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .DistinctBy(x => x.Name);
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion

        #region Model
        public class EDMSJtableFileExModel : EDMSJtableFileModel
        {
            public string Position { get; set; }
            public string PositionPack { get; set; }
            public bool IsLocated { get; set; }
        }

        public class JtableFileExModel : JtableFileModel
        {
            public string RackCode { get; set; }
            public string PackCode { get; set; }
            public string MappingCode { get; set; }
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

        #endregion
    }
}