using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class EDMSWarehouseManagerDocumentController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<EDMSWarehouseManagerDocumentController> _stringLocalizer;
        private readonly IStringLocalizer<EDMSDiagramWarehouseDocumentController> _stringLocalizerEDMS;
        private readonly IStringLocalizer<SharedResources> _sharedResources;

        public EDMSWarehouseManagerDocumentController(EIMDBContext context, IHostingEnvironment hostingEnvironment, IStringLocalizer<EDMSDiagramWarehouseDocumentController> stringLocalizerEDMS, IStringLocalizer<EDMSWarehouseManagerDocumentController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _hostingEnvironment = hostingEnvironment;
            _stringLocalizer = stringLocalizer;
            _stringLocalizerEDMS = stringLocalizerEDMS;
            _sharedResources = sharedResources;
        }
        [Breadcrumb("ViewData.CrumbEdmsWHManageDoc", AreaName = "Admin", FromAction = "Index", FromController = typeof(WarehouseDigitalHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbWHDHome"] = _sharedResources["COM_CRUMB_WH_DIGITAL_HOME"];
            ViewData["CrumbEdmsWHManageDoc"] = _sharedResources["COM_CRUMB_EDMS_WAREHOUSE"];
            return View();
        }

        [HttpPost]
        public object JTable([FromBody]JTableModelExtend jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.EDMSWareHouseDocuments
                        where a.Type == jTablePara.Type
                        && a.WHS_Flag != true
                        select new
                        {
                            a.Id,
                            a.WHS_Code,
                            a.WHS_Name,
                            a.WHS_Avatar,
                            a.WHS_AreaSquare,
                            a.WHS_ADDR_Gps,
                            a.WHS_ADDR_Text,
                            a.WHS_CNT_Floor,
                            a.WHS_DesginMap,
                            a.WHS_Flag,
                            a.WHS_Note,
                            a.WHS_Status,
                            a.WHS_Tags,
                            a.IMG_WHS,
                            a.QR_Code,
                        };

            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "WHS_Code", "WHS_Name", "WHS_Avatar", "WHS_AreaSquare", "WHS_ADDR_Gps", "WHS_ADDR_Text", "WHS_CNT_Floor", "WHS_DesginMap", "WHS_Flag", "WHS_Note", "WHS_Status", "WHS_Tags", "IMG_WHS");
            return Json(jdata);
        }

        [HttpPost]
        public object JTableFloor([FromBody]JTableFloorModel jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.EDMSFloorDocuments
                        where (!string.IsNullOrEmpty(jTablePara.WareHouseCode) && a.WHS_Code.ToLower().Equals(jTablePara.WareHouseCode.ToLower()))
                        select new
                        {
                            a.Id,
                            a.WHS_Code,
                            a.AreaSquare,
                            a.FloorCode,
                            a.FloorName,
                            a.Image,
                            a.MapDesgin,
                            a.QR_Code,
                            a.Status,
                            a.CNT_Line,
                            a.Note,
                            a.ManagerId,
                        };

            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "WHS_Code", "AreaSquare", "FloorCode", "FloorName", "Image", "MapDesgin", "QR_Code", "Status", "CNT_Line", "Note", "ManagerId");
            return Json(jdata);
        }

        [HttpPost]
        public object JTableLine([FromBody]JTableLineModel jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            if (string.IsNullOrEmpty(jTablePara.FloorCode))
            {
                return JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "Id", "LineCode", "L_Text", "L_Color", "L_Position", "L_Size", "L_Status", "QR_Code", "Note", "CNT_Rack");
            }
            var query = from a in _context.EDMSLineDocuments
                        where (!string.IsNullOrEmpty(jTablePara.FloorCode) && a.FloorCode.ToLower().Equals(jTablePara.FloorCode.ToLower()))
                        select new
                        {
                            a.Id,
                            a.LineCode,
                            a.L_Text,
                            a.L_Color,
                            a.L_Position,
                            a.L_Size,
                            a.L_Status,
                            a.QR_Code,
                            a.Note,
                            a.CNT_Rack,
                        };

            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "LineCode", "L_Text", "L_Color", "L_Position", "L_Size", "L_Status", "QR_Code", "Note", "CNT_Rack");
            return Json(jdata);
        }

        [HttpPost]
        public object JTableRack([FromBody]JTableRackModel jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            if (string.IsNullOrEmpty(jTablePara.LineCode))
            {
                return JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "Id", "LineCode", "RackCode", "RackName", "R_Position", "R_Size", "R_Status", "QR_Code", "CNT_Box", "CNT_Cell", "Material", "Note", "Ordering", "RackPositionText");
            }
            var query = from a in _context.EDMSRackDocuments
                        where (!string.IsNullOrEmpty(jTablePara.LineCode) && a.LineCode.ToLower().Equals(jTablePara.LineCode.ToLower()))
                        select new
                        {
                            a.Id,
                            a.LineCode,
                            a.RackCode,
                            a.RackName,
                            a.R_Size,
                            a.R_Status,
                            a.QR_Code,
                            a.CNT_Box,
                            a.CNT_Cell,
                            a.Material,
                            a.Note,
                            a.Ordering,
                        };

            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var dataRs = (from a in data
                          select new
                          {
                              a.Id,
                              a.LineCode,
                              a.RackCode,
                              a.RackName,
                              a.R_Size,
                              a.R_Status,
                              a.QR_Code,
                              a.CNT_Box,
                              a.CNT_Cell,
                              a.Material,
                              a.Note,
                              a.Ordering,
                              RackPositionText = GetObjTypePosition(a.RackCode, "OBJ_RACK")
                          }).ToList();

            var jdata = JTableHelper.JObjectTable(dataRs, jTablePara.Draw, count, "Id", "LineCode", "RackCode", "RackName", "R_Position", "R_Size", "R_Status", "QR_Code", "CNT_Box", "CNT_Cell", "Material", "Note", "Ordering", "RackPositionText");
            return Json(jdata);
        }

        //Lấy danh sách tất cả Kho, Tầng, Dãy,Kệ
        [HttpGet]
        public object GetListWareHouse()
        {
            try
            {
                var rs = _context.EDMSWareHouseDocuments.Where(x => x.WHS_Flag != true).ToList();
                return Json(rs);
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }

        [HttpPost]
        public JsonResult GetListStaffBranch()
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                msg.Object = _context.HREmployees.Where(x => x.flag == 1).Select(x => new { Code = x.identitycard, Name = x.fullname });
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
            }
            return Json(msg);
        }

        [HttpGet]
        public object GetListFloor()
        {
            try
            {
                var rs = _context.EDMSFloorDocuments.ToList();
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
                var rs = _context.EDMSFloorDocuments.Where(x => x.WHS_Code.Equals(wareHouseCode)).ToList();
                return Json(rs);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        //lấy thông tin tầng, kho, dãy, kệ
        //[HttpGet]
        //public object GetWareHouseInfor(string WareHouseInfor)
        //{
        //    var rs = _context.EDMSWareHouseDocuments.FirstOrDefault(x => x.WHS_Code == WareHouseInfor);
        //    try
        //    {
        //        var floorCode = 0;
        //        var RackCode = 0;
        //        var lineCode = 0;
        //        var listFloor = _context.EDMSFloorDocuments.Where(x => x.WHS_Code.Equals(rs.WHS_Code)).ToList();
        //        if (listFloor.Count > 0)
        //        {
        //            floorCode = listFloor.Sum(x => x.FloorCode);
        //            foreach (var item in listFloor)
        //            {
        //                var listLine = _context.EDMSFloorDocuments.Where(x => x.FloorCode.Equals(item.WHS_Code)).ToList();
        //                if (listLine.Count > 0)
        //                {
        //                    floorCode = listLine.Sum(x => x.FloorCode);
        //                }
        //            }
        //        }
        //        return Json(rs);
        //    }
        //    catch (Exception ex)
        //    {

        //        throw ex;
        //    }
        //}
        //Lấy danh sách dãy bên sản phẩm
        [HttpGet]
        public object GetListLine(string storeCode)
        {
            try
            {
                if (string.IsNullOrEmpty(storeCode))
                {
                    //var rs = _context.EDMSLineDocuments.Where(x => x.LineCode.IndexOf("_WHP.") > 0).ToList();
                    var rs = _context.EDMSLineDocuments.ToList();
                    return Json(rs);
                }
                else
                {
                    var rs = _context.EDMSLineDocuments.Where(x => x.LineCode.IndexOf(storeCode) > 0).ToList();
                    return Json(rs);
                }
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
                var rs = _context.EDMSLineDocuments.Where(x => x.FloorCode.Equals(floorCode)).ToList();
                return Json(rs);
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }

        [HttpGet]
        public object GetListRack()
        {
            try
            {
                var rs = _context.EDMSRackDocuments.ToList();
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
                var rs = _context.EDMSRackDocuments.Where(x => x.LineCode.Equals(lineCode)).ToList();
                return Json(rs);
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }

        [HttpGet]
        public object GetDetailWareHouse(string wareHouseCode)
        {
            try
            {
                //Sức chứa tầng, dãy, kệ
                var cntLine = 0;
                var cntRack = 0;
                var cntBox = 0;
                var cntBoxEmty = 0;

                //Lấy ra số tầng dãy kệ thùng
                var qtyFloor = 0;
                var qtyLine = 0;
                var qtyRack = 0;
                var qtyBox = 0;//Đã có trong kho

                var rs = _context.EDMSWareHouseDocuments.FirstOrDefault(x => x.WHS_Code == wareHouseCode && !x.WHS_Flag);
                if (rs != null)
                {
                    var listFloor = _context.EDMSFloorDocuments.Where(x => x.WHS_Code.Equals(rs.WHS_Code)).ToList();
                    if (listFloor.Count > 0)
                    {
                        qtyFloor = listFloor.Count;
                        cntLine = listFloor.Sum(x => x.CNT_Line);

                        foreach (var item in listFloor)
                        {
                            var listLine = _context.EDMSLineDocuments.Where(x => x.FloorCode.Equals(item.FloorCode)).ToList();
                            if (listLine.Count > 0)
                            {
                                qtyLine = qtyLine + listLine.Count;
                                cntRack = cntRack + listLine.Sum(x => x.CNT_Rack);
                                foreach (var line in listLine)
                                {
                                    var listRack = _context.EDMSRackDocuments.Where(x => x.LineCode.Equals(line.LineCode)).ToList();
                                    if (listRack.Count > 0)
                                    {
                                        qtyRack = qtyRack + listRack.Count;
                                        cntBox = cntBox + listRack.Sum(x => x.CNT_Box);
                                    }
                                }
                            }
                        }
                    }

                    //Lấy ra số lượng thùng đã có trong kho
                    var listBox = (from a in _context.EDMSBoxs
                                   join b in _context.EDMSEntityMappings on a.BoxCode equals b.BoxCode
                                   where a.WHS_Code == rs.WHS_Code
                                   select a);
                    if (listBox.Count() > 0)
                    {
                        qtyBox = listBox.Count();

                        cntBoxEmty = cntBox - qtyBox;
                    }
                }

                var info = new
                {
                    model = rs,
                    cntLine,
                    cntRack,
                    cntBox,
                    cntBoxEmty,
                    qtyFloor,
                    qtyBox,
                    qtyLine,
                    qtyRack
                };
                return Json(info);
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }

        [HttpGet]
        public object GetListManager()
        {
            try
            {
                var rs = _context.EDMSWareHouseUsers.ToList();
                return Json(rs);
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }

        [HttpGet]
        public object GetListWareHouseUser()
        {
            try
            {
                var rs = _context.EDMSWareHouseUsers.ToList();
                return Json(rs);
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }

        [HttpGet]
        public object GetListBox()
        {
            try
            {
                var rs = _context.EDMSBoxs.ToList();
                return Json(rs);
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }

        [HttpGet]
        public object GetBoxDetail(string boxCode)
        {
            try
            {
                var rs = _context.EDMSBoxs.FirstOrDefault(x => x.BoxCode == boxCode);
                return Json(rs);
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }

        [HttpGet]
        public object GetBoxPosition(string boxCode)
        {
            try
            {
                var boxInfo = new BoxInfo();
                var rs = _context.EDMSBoxs.FirstOrDefault(x => x.BoxCode.ToLower() == boxCode.ToLower());
                if (rs != null)
                {
                    var BoxName = "Thùng " + rs.NumBoxth;
                    var RackName = string.Empty;
                    var LineName = string.Empty;
                    var FloorName = string.Empty;
                    var WareHouseName = string.Empty;
                    if (rs.RackCode != null)
                        RackName = _context.EDMSRackDocuments.FirstOrDefault(x => x.RackCode == rs.RackCode)?.RackName;
                    if (rs.LineCode != null)
                        LineName = _context.EDMSLineDocuments.FirstOrDefault(x => x.LineCode == rs.LineCode)?.L_Text;
                    if (rs.FloorCode != null)
                        FloorName = _context.EDMSFloorDocuments.FirstOrDefault(x => x.FloorCode == rs.FloorCode)?.FloorName;
                    if (rs.WHS_Code != null)
                        WareHouseName = _context.EDMSWareHouseDocuments.Where(x => x.WHS_Flag != true).FirstOrDefault(x => x.WHS_Code == rs.WHS_Code)?.WHS_Name;

                    boxInfo.BoxCode = rs.BoxCode;
                    boxInfo.RackCode = rs.RackCode;
                    boxInfo.LineCode = rs.LineCode;
                    boxInfo.FloorCode = rs.FloorCode;
                    boxInfo.WHS_Code = rs.WHS_Code;
                    boxInfo.BoxPosition = string.Format("{0}, {1}, {2}, {3}, {4}", BoxName, RackName, LineName, FloorName, WareHouseName);
                }

                return Json(boxInfo);
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }

        [HttpGet]
        public string GetObjTypePosition(string objCode, string type)
        {
            try
            {
                var PositionText = string.Empty;
                var RackName = string.Empty;
                var LineName = string.Empty;
                var FloorName = string.Empty;
                var WareHouseName = string.Empty;

                switch (type)
                {
                    case "OBJ_WAREHOUSE":
                        break;

                    case "OBJ_FLOOR":
                        break;

                    case "OBJ_LINE":
                        break;

                    case "OBJ_RACK":
                        var obj = _context.EDMSRackDocuments.FirstOrDefault(x => x.RackCode == objCode);
                        if (obj != null)
                        {
                            RackName = obj.RackName;
                            var objLine = _context.EDMSLineDocuments.FirstOrDefault(x => x.LineCode == obj.LineCode);
                            if (objLine != null)
                            {
                                LineName = objLine.L_Text;
                                var objFloor = _context.EDMSFloorDocuments.FirstOrDefault(x => x.FloorCode == objLine.FloorCode);
                                if (objFloor != null)
                                {
                                    FloorName = objFloor.FloorName;
                                }
                            }

                            PositionText = string.Format("{0}-{1}-{2}", RackName, LineName, FloorName);
                        }
                        break;

                    case "OBJ_BOX":
                        break;
                    default:
                        break;
                }

                return PositionText;
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }
        //Thêm sửa xóa tầng
        [HttpPost]
        public JsonResult InsertFloor(EDMSFloorDocument obj, IFormFile imageFloor, IFormFile mapDesgin)
        {
            var msg = new JMessage();
            try
            {
                var floor = _context.EDMSFloorDocuments.FirstOrDefault(x => x.FloorCode.Equals(obj.FloorCode));
                if (floor == null)
                {
                    var maxFloor = _context.EDMSWareHouseDocuments.FirstOrDefault(x => x.WHS_Flag != true && x.WHS_Code.Equals(obj.WHS_Code)).WHS_CNT_Floor;
                    var countFloor = _context.EDMSFloorDocuments.Where(x => x.WHS_Code.Equals(obj.WHS_Code)).Count();
                    if (countFloor < maxFloor)
                    {
                        var floorObj = new EDMSFloorDocument
                        {
                            FloorCode = obj.FloorCode,
                            AreaSquare = obj.AreaSquare,
                            CNT_Line = obj.CNT_Line,
                            FloorName = obj.FloorName,
                            ManagerId = obj.ManagerId,
                            Note = obj.Note,
                            QR_Code = obj.FloorCode,
                            Status = obj.Status,
                            WHS_Code = obj.WHS_Code,
                            Temperature = obj.Temperature,
                            Humidity = obj.Humidity,
                            CreatedBy = User.Identity.Name,
                            CreatedTime = DateTime.Now
                        };

                        //Thêm ảnh tầng
                        if (imageFloor != null && imageFloor.Length > 0)
                        {
                            var url = string.Empty;
                            var pathUpload = Path.Combine(_hostingEnvironment.WebRootPath, "uploads\\images");
                            if (!Directory.Exists(pathUpload)) Directory.CreateDirectory(pathUpload);
                            var fileName = Path.GetFileName(imageFloor.FileName);
                            fileName = Path.GetFileNameWithoutExtension(fileName)
                             + "_"
                             + Guid.NewGuid().ToString().Substring(0, 8)
                             + Path.GetExtension(fileName);
                            var filePath = Path.Combine(pathUpload, fileName);
                            using (var stream = new FileStream(filePath, FileMode.Create))
                            {
                                imageFloor.CopyTo(stream);
                            }
                            url = "/uploads/images/" + fileName;
                            floorObj.Image = url;
                        }

                        //Thêm ảnh thiết kế
                        if (mapDesgin != null && mapDesgin.Length > 0)
                        {
                            var url = string.Empty;
                            var pathUpload = Path.Combine(_hostingEnvironment.WebRootPath, "uploads\\images");
                            if (!Directory.Exists(pathUpload)) Directory.CreateDirectory(pathUpload);
                            var fileName = Path.GetFileName(mapDesgin.FileName);
                            fileName = Path.GetFileNameWithoutExtension(fileName)
                             + "_"
                             + Guid.NewGuid().ToString().Substring(0, 8)
                             + Path.GetExtension(fileName);
                            var filePath = Path.Combine(pathUpload, fileName);
                            using (var stream = new FileStream(filePath, FileMode.Create))
                            {
                                mapDesgin.CopyTo(stream);
                            }
                            url = "/uploads/images/" + fileName;
                            floorObj.MapDesgin = url;
                        }

                        _context.EDMSFloorDocuments.Add(floorObj);

                        //Thêm vào bảng quản lý QR_CODE
                        var qrCode = new EDMSWhsQrCodeDocument
                        {
                            OBJ_Code = obj.FloorCode,
                            OBJ_Type = "OBJ_FLOOR",
                            QR_Code = obj.FloorCode,
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now,
                            PrintNumber = 0,
                            RackPosition = null
                        };
                        _context.EDMSWhsQrCodeDocuments.Add(qrCode);

                        _context.SaveChanges();
                        msg.Error = false;
                        //msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"), _stringLocalizer["CATEGORY_MSG_PRODUCT"));
                        msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["EDMSWM_CURD_LBL_FLOOR"].Value.ToLower());//tầng
                    }
                    else
                    {
                        msg.Error = true;
                        //msg.Title = "Không được tạo quá số tầng đã khai báo của kho";
                        msg.Title = _stringLocalizer["EDMSWM_MSG_WARE_HOUSE"];
                    }
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"), _stringLocalizer["CATEGORY_MSG_PRODUCT"));
                    msg.Title = String.Format(_sharedResources["COM_MSG_EXITS"], _stringLocalizer["EDMSWHM_CURD_LBL_FLOOR"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_ERR_ADD"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateFloor(EDMSFloor obj, IFormFile imageFloor, IFormFile mapDesgin)
        {
            var msg = new JMessage();
            try
            {
                var floor = _context.EDMSFloorDocuments.FirstOrDefault(x => x.FloorCode.Equals(obj.FloorCode));
                if (floor != null)
                {

                    //check số dãy phải >= số dãy đã khai báo
                    var cnt = _context.EDMSLineDocuments.Where(x => x.FloorCode == floor.FloorCode).Count();
                    if (cnt > obj.CNT_Line)
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["EDMSWM_COL_NUMB"];
                    }
                    else
                    {
                        floor.FloorCode = obj.FloorCode;
                        floor.AreaSquare = obj.AreaSquare;
                        floor.CNT_Line = obj.CNT_Line;
                        floor.FloorName = obj.FloorName;
                        floor.ManagerId = obj.ManagerId;
                        floor.Note = obj.Note;
                        floor.QR_Code = obj.FloorCode;
                        floor.Status = obj.Status;
                        floor.WHS_Code = obj.WHS_Code;
                        floor.Temperature = obj.Temperature;
                        floor.Humidity = obj.Humidity;

                        //Thêm ảnh tầng
                        if (imageFloor != null && imageFloor.Length > 0)
                        {
                            var url = string.Empty;
                            var pathUpload = Path.Combine(_hostingEnvironment.WebRootPath, "uploads\\images");
                            if (!Directory.Exists(pathUpload)) Directory.CreateDirectory(pathUpload);
                            var fileName = Path.GetFileName(imageFloor.FileName);
                            fileName = Path.GetFileNameWithoutExtension(fileName)
                             + "_"
                             + Guid.NewGuid().ToString().Substring(0, 8)
                             + Path.GetExtension(fileName);
                            var filePath = Path.Combine(pathUpload, fileName);
                            using (var stream = new FileStream(filePath, FileMode.Create))
                            {
                                imageFloor.CopyTo(stream);
                            }
                            url = "/uploads/images/" + fileName;
                            floor.Image = url;
                        }
                        //Thêm ảnh thiết kế
                        if (mapDesgin != null && mapDesgin.Length > 0)
                        {
                            var url = string.Empty;
                            var pathUpload = Path.Combine(_hostingEnvironment.WebRootPath, "uploads\\images");
                            if (!Directory.Exists(pathUpload)) Directory.CreateDirectory(pathUpload);
                            var fileName = Path.GetFileName(mapDesgin.FileName);
                            fileName = Path.GetFileNameWithoutExtension(fileName)
                             + "_"
                             + Guid.NewGuid().ToString().Substring(0, 8)
                             + Path.GetExtension(fileName);
                            var filePath = Path.Combine(pathUpload, fileName);
                            using (var stream = new FileStream(filePath, FileMode.Create))
                            {
                                mapDesgin.CopyTo(stream);
                            }
                            url = "/uploads/images/" + fileName;
                            floor.MapDesgin = url;
                        }
                        _context.EDMSFloorDocuments.Update(floor);

                        var checkExits = _context.EDMSWhsQrCodeDocuments.FirstOrDefault(x => x.OBJ_Code == obj.FloorCode && x.OBJ_Type == "OBJ_FLOOR");
                        if (checkExits == null)
                        {
                            //Thêm vào bảng quản lý QR_CODE
                            var qrCode = new EDMSWhsQrCodeDocument
                            {
                                OBJ_Code = obj.FloorCode,
                                OBJ_Type = "OBJ_FLOOR",
                                QR_Code = obj.FloorCode,
                                CreatedBy = ESEIM.AppContext.UserName,
                                CreatedTime = DateTime.Now,
                                PrintNumber = 0,
                                RackPosition = null
                            };
                            _context.EDMSWhsQrCodeDocuments.Add(qrCode);
                        }

                        _context.SaveChanges();
                        msg.Error = false;
                        //msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"), _stringLocalizer["CATEGORY_MSG_PRODUCT"));
                        msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["EDMSWM_CURD_LBL_FLOOR"].Value.ToLower());
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_MSG_NOT_EXITS"], _stringLocalizer["EDMSWM_CURD_LBL_FLOOR"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_ERR_ADD"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult DeleteFloor(int floorId)
        {
            var msg = new JMessage();
            try
            {
                //var count = GetBoxInFloor(floorId);
                var count = 0;
                if (count == 0)
                {
                    var floor = _context.EDMSFloorDocuments.FirstOrDefault(x => x.Id.Equals(floorId));
                    if (floor != null)
                    {
                        //Check xem có tồn tại dãy không
                        var chkExistLine = _context.EDMSLineDocuments.Any(x => x.FloorCode == floor.FloorCode);
                        if (chkExistLine)
                        {
                            msg.Error = true;
                            msg.Title = _stringLocalizer["EDMSWM_VALIDATE_DEL_ROW_BEFORE"];
                            return Json(msg);
                        }

                        _context.EDMSFloorDocuments.Remove(floor);
                        ////Thay lại luồng bắt chặn phải xóa theo thứ tự - nên bỏ đoạn này
                        //var line = _context.EDMSLineDocuments.Where(x => x.FloorCode == floor.FloorCode);
                        //if (line.Any())
                        //{
                        //    var rack = _context.EDMSRackDocuments.Where(x => line.Any(y => y.LineCode == x.LineCode));
                        //    if (rack.Any())
                        //    {
                        //        _context.EDMSRackDocuments.RemoveRange(rack);
                        //    }
                        //    _context.EDMSLineDocuments.RemoveRange(line);
                        //}

                        var listCheck = _context.EDMSWhsQrCodeDocuments.Where(x => x.OBJ_Code == floor.FloorCode && x.OBJ_Type == "OBJ_FLOOR");
                        if (listCheck.Any())
                        {
                            _context.EDMSWhsQrCodeDocuments.RemoveRange(listCheck);
                        }

                        _context.SaveChanges();
                        msg.Error = false;
                        msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer["EDMSWM_CURD_LBL_FLOOR"].Value.ToLower());
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_FAIL"], _stringLocalizer["EDMSWM_CURD_LBL_FLOOR"].Value.ToLower());
                    }
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Tầng đang chưa sản phẩm, không thể xóa";
                    msg.Title = _stringLocalizer["EDMSWM_MSG_DELETE_FLOOR"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi xóa";
                //msg.Title = _sharedResources["COM_ERR_ADD"];
            }
            return Json(msg);
        }

        //[NonAction]
        //private decimal GetBoxInFloor(int floorId)
        //{
        //    decimal count = 0;
        //    var query = from a in _context.EDMSFloorDocuments.Where(x => x.Id == floorId)
        //                join d in _context.EDMSBoxs.Where(x => !x.IsDeleted) on a.FloorCode equals d.FloorCode
        //                select new
        //                {
        //                    d.BoxCode,
        //                };
        //    count = query.Count();
        //    return count;
        //}

        [HttpPost]
        public JsonResult GetFloorInfo(int floorId)
        {
            var msg = new JMessage();
            try
            {
                var floor = _context.EDMSFloorDocuments.FirstOrDefault(x => x.Id.Equals(floorId));
                if (floor != null)
                {
                    msg.Object = floor;
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"), _stringLocalizer["CATEGORY_MSG_PRODUCT"));
                    msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer["EDMSWM_CURD_LBL_FLOOR"].Value.ToLower());
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_ERR_ADD"];
            }
            return Json(msg);
        }

        //Thêm sửa xóa dãy
        [HttpPost]
        public JsonResult InsertLine([FromBody]EDMSLineDocument obj)
        {
            var msg = new JMessage();
            try
            {
                var line = _context.EDMSLineDocuments.FirstOrDefault(x => x.LineCode.Equals(obj.LineCode));

                if (line == null)
                {
                    var floor = _context.EDMSFloorDocuments.FirstOrDefault(x => x.FloorCode == obj.FloorCode);
                    var countLineInFloor = _context.EDMSLineDocuments.Where(x => x.FloorCode == obj.FloorCode).Count();
                    if (floor.CNT_Line > countLineInFloor)
                    {
                        var lineObj = new EDMSLineDocument
                        {
                            FloorCode = obj.FloorCode,
                            LineCode = obj.LineCode,
                            L_Text = obj.L_Text,
                            CNT_Rack = obj.CNT_Rack,
                            L_Color = obj.L_Color,
                            L_Position = obj.L_Position,
                            L_Size = obj.L_Size,
                            L_Status = obj.L_Status,
                            Note = obj.Note,
                            QR_Code = obj.LineCode,
                            CreatedBy = User.Identity.Name,
                            CreatedTime = DateTime.Now
                        };

                        _context.EDMSLineDocuments.Add(lineObj);

                        //Thêm vào bảng quản lý QR_CODE
                        var qrCode = new EDMSWhsQrCodeDocument
                        {
                            OBJ_Code = obj.LineCode,
                            OBJ_Type = "OBJ_LINE",
                            QR_Code = obj.LineCode,
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now,
                            PrintNumber = 0,
                            RackPosition = null
                        };
                        _context.EDMSWhsQrCodeDocuments.Add(qrCode);

                        _context.SaveChanges();
                        msg.Error = false;
                        msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["EDMSWM_CURD_LBL_LINE"].Value.ToLower());
                    }
                    else
                    {
                        msg.Error = true;
                        //msg.Title = "Không được tạo quá số dãy đã khai báo của tầng";
                        msg.Title = _stringLocalizer["EDMSWM_MSG_LINE_FLOOR"];
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_MSG_EXITS"], _stringLocalizer["EDMSWM_CURD_LBL_LINE"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_ERR_ADD"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateLine([FromBody]EDMSLineDocument obj)
        {
            var msg = new JMessage();
            try
            {
                var line = _context.EDMSLineDocuments.FirstOrDefault(x => x.Id.Equals(obj.Id));
                if (line != null)
                {
                    //check số rack phải >= rack đã khai báo
                    var cnt = _context.EDMSRackDocuments.Where(x => x.LineCode == line.LineCode).Count();
                    if (cnt > obj.CNT_Rack)
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["EDMSWM_VALIDATE_NUMB_ROW"];
                    }
                    else
                    {
                        line.FloorCode = obj.FloorCode;
                        line.LineCode = obj.LineCode;
                        line.L_Text = obj.L_Text;
                        line.CNT_Rack = obj.CNT_Rack;
                        line.L_Color = obj.L_Color;
                        line.L_Position = obj.L_Position;
                        line.L_Size = obj.L_Size;
                        line.L_Status = obj.L_Status;
                        line.Note = obj.Note;
                        line.QR_Code = obj.LineCode;
                        line.UpdatedBy = User.Identity.Name;
                        line.UpdatedTime = DateTime.Now;

                        _context.EDMSLineDocuments.Update(line);

                        var checkExits = _context.EDMSWhsQrCodeDocuments.FirstOrDefault(x => x.OBJ_Code == obj.LineCode && x.OBJ_Type == "OBJ_LINE");
                        if (checkExits == null)
                        {
                            //Thêm vào bảng quản lý QR_CODE
                            var qrCode = new EDMSWhsQrCodeDocument
                            {
                                OBJ_Code = obj.LineCode,
                                OBJ_Type = "OBJ_LINE",
                                QR_Code = obj.LineCode,
                                CreatedBy = ESEIM.AppContext.UserName,
                                CreatedTime = DateTime.Now,
                                PrintNumber = 0,
                                RackPosition = null
                            };
                            _context.EDMSWhsQrCodeDocuments.Add(qrCode);
                        }

                        _context.SaveChanges();
                        msg.Error = false;
                        msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["EDMSWM_CURD_LBL_LINE"].Value.ToLower());
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_MSG_NOT_EXITS"], _stringLocalizer["EDMSWM_CURD_LBL_LINE"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_ERR_ADD"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetLineInfo(int lineId)
        {
            var msg = new JMessage();
            try
            {
                var line = _context.EDMSLineDocuments.FirstOrDefault(x => x.Id.Equals(lineId));
                if (line != null)
                {
                    msg.Object = line;
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_ERR_ADD"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult DeleteLine(int lineId)
        {
            var msg = new JMessage();
            try
            {
                var line = _context.EDMSLineDocuments.FirstOrDefault(x => x.Id.Equals(lineId));
                if (line != null)
                {
                    //Check xem có tồn tại kệ không
                    var chkExist = _context.EDMSRackDocuments.Any(x => x.LineCode == line.LineCode);
                    if (chkExist)
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizerEDMS["EDMSWM_VALIDATE_DEL_SHELF_BEFORE"];
                        return Json(msg);
                    }

                    //var rack = _context.EDMSRackDocuments.Where(x => x.LineCode == line.LineCode);
                    //if (rack.Any())
                    //{
                    //    _context.EDMSRackDocuments.RemoveRange(rack);
                    //}

                    var listCheck = _context.EDMSWhsQrCodeDocuments.Where(x => x.OBJ_Code == line.LineCode && x.OBJ_Type == "OBJ_LINE");
                    if (listCheck.Any())
                    {
                        _context.EDMSWhsQrCodeDocuments.RemoveRange(listCheck);
                    }

                    _context.EDMSLineDocuments.Remove(line);
                    _context.SaveChanges();
                    msg.Error = false;
                    msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer["EDMSWM_CURD_LBL_LINE"].Value.ToLower());
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_FAIL"], _stringLocalizer["EDMSWM_CURD_LBL_LINE"].Value.ToLower());
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_DELETE_FAIL"];
            }
            return Json(msg);
        }

        //Thêm sửa xóa kệ
        [HttpPost]
        public JsonResult InsertRack([FromBody]EDMSRackDocument obj)
        {
            var msg = new JMessage();
            try
            {
                var rack = _context.EDMSRackDocuments.FirstOrDefault(x => x.RackCode.Equals(obj.RackCode));
                if (rack == null)
                {

                    var line = _context.EDMSLineDocuments.FirstOrDefault(x => x.LineCode == obj.LineCode);
                    var countRackInLine = _context.EDMSRackDocuments.Where(x => x.LineCode == obj.LineCode).Count();

                    if (line.CNT_Rack > countRackInLine)
                    {
                        //add Rack
                        obj.QR_Code = obj.RackCode;
                        _context.EDMSRackDocuments.Add(obj);

                        var qrCode = new EDMSWhsQrCodeDocument
                        {
                            OBJ_Code = obj.RackCode,
                            OBJ_Type = "OBJ_RACK",
                            QR_Code = obj.RackCode,
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now,
                            PrintNumber = 0,
                        };
                        _context.EDMSWhsQrCodeDocuments.Add(qrCode);

                        ////ad position 
                        //for (var i = 1; i < obj.R_Position; i++)
                        //{
                        //    var position = new EDMSWhsQrCodeDocument
                        //    {
                        //        OBJ_Code = obj.RackCode,
                        //        OBJ_Type = "OBJ_RACK_POSITION",
                        //        QR_Code = obj.RackCode,
                        //        CreatedBy = ESEIM.AppContext.UserName,
                        //        CreatedTime = DateTime.Now,
                        //        PrintNumber = 0,
                        //        RackPosition = i
                        //    };
                        //    _context.EDMSWhsQrCodeDocuments.Add(position);
                        //}

                        _context.SaveChanges();
                        msg.Error = false;
                        msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["EDMSWM_CURD_LBL_RACK"].Value.ToLower());
                    }
                    else
                    {
                        msg.Error = true;
                        //msg.Title = "Không được tạo quá số kệ đã khai báo của dãy";
                        msg.Title = _stringLocalizer["EDMSWM_MSG_ADD_RACK_RACK"];
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_MSG_EXITS"], _stringLocalizer["EDMSWM_CURD_LBL_RACK"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_ERR_ADD"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetRackInfo(int rackId)
        {
            var msg = new JMessage();
            try
            {
                var rack = _context.EDMSRackDocuments.FirstOrDefault(x => x.Id.Equals(rackId));
                if (rack != null)
                {
                    msg.Object = rack;
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_ERR_ADD"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateRack([FromBody]EDMSRackDocument obj)
        {
            var msg = new JMessage();
            try
            {
                var rack = _context.EDMSRackDocuments.FirstOrDefault(x => x.Id.Equals(obj.Id));
                //var productInRackCount = GetProductInRack(obj.Id);

                if (rack != null)
                {
                    //Lấy ra số lượng thùng đã khai báo trong kệ
                    var cntBox = obj.CNT_Box;

                    ////Lấy ra số lượng thùng đã có trong kệ đó
                    //var qtyBox = 0;
                    //qtyBox = _context.EDMSBoxs.Where(x => !x.IsDeleted && x.RackCode.Equals(obj.RackCode)).Count();

                    //if (qtyBox >= cntBox)
                    //{
                    //    msg.Error = true;
                    //    msg.Title = _stringLocalizer["EDMSWM_MSG_UPDATE_RACK"];
                    //    return Json(msg);
                    //}

                    //update Rack
                    rack.LineCode = obj.LineCode;
                    rack.RackCode = obj.RackCode;
                    rack.RackName = obj.RackName;
                    rack.R_Size = obj.R_Size;
                    rack.R_Status = obj.R_Status;
                    rack.CNT_Box = obj.CNT_Box;
                    rack.CNT_Cell = obj.CNT_Cell;
                    rack.Note = obj.Note;
                    rack.QR_Code = obj.RackCode;
                    rack.Ordering = obj.Ordering;
                    rack.Material = obj.Material;
                    _context.EDMSRackDocuments.Update(rack);

                    //remove position old
                    var listRackOld = _context.EDMSWhsQrCodeDocuments.Where(x => x.OBJ_Code == obj.RackCode && x.OBJ_Type == "OBJ_RACK");
                    if (listRackOld.Any())
                    {
                        _context.EDMSWhsQrCodeDocuments.RemoveRange(listRackOld);
                    }

                    var qrCode = new EDMSWhsQrCodeDocument
                    {
                        OBJ_Code = obj.RackCode,
                        OBJ_Type = "OBJ_RACK",
                        QR_Code = obj.RackCode,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now,
                        PrintNumber = 0,
                    };
                    _context.EDMSWhsQrCodeDocuments.Add(qrCode);

                    ////update Position
                    //if (obj.R_Position != rack.R_Position)
                    //{
                    //    //remove position old
                    //    var listPositionOld = _context.EDMSWhsQrCodeDocuments.Where(x => x.OBJ_Code == obj.RackCode && x.OBJ_Type == "OBJ_RACK_POSITION");
                    //    if (listPositionOld.Any())
                    //    {
                    //        _context.EDMSWhsQrCodeDocuments.RemoveRange(listPositionOld);
                    //    }

                    //    //add position new
                    //    for (var i = 1; i < obj.R_Position; i++)
                    //    {
                    //        var position = new EDMSWhsQrCodeDocument
                    //        {
                    //            OBJ_Code = obj.RackCode,
                    //            OBJ_Type = "OBJ_RACK_POSITION",
                    //            QR_Code = obj.RackCode,
                    //            CreatedBy = ESEIM.AppContext.UserName,
                    //            CreatedTime = DateTime.Now,
                    //            PrintNumber = 0,
                    //            RackPosition = i
                    //        };
                    //        _context.EDMSWhsQrCodeDocuments.Add(position);
                    //    }
                    //}

                    _context.SaveChanges();
                    msg.Error = false;
                    msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["EDMSWM_CURD_LBL_RACK"].Value.ToLower());
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_MSG_NOT_EXITS"], _stringLocalizer["EDMSWM_CURD_LBL_RACK"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_ERR_ADD"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult DeleteRack(int rackId)
        {
            var msg = new JMessage();
            try
            {
                var rack = _context.EDMSRackDocuments.FirstOrDefault(x => x.Id.Equals(rackId));
                if (rack != null)
                {
                    ////Check xem kệ có đang được sử dụng không
                    //var chkExist = _context.EDMSBoxs.Any(x => !x.IsDeleted && x.RackCode == rack.RackCode);
                    //if (chkExist)
                    //{
                    //    msg.Error = true;
                    //    msg.Title = _stringLocalizer["EDMSWM_VALIDATE_SHELF_HAVE_BOX"];
                    //    return Json(msg);
                    //}

                    //Nếu là kệ cuối cùng trong 1 kho thì không được xóa nếu kho đó đã có thùng được khai báo đặt vào
                    var whsCode = (from a in _context.EDMSRackDocuments.Where(x => x.Id.Equals(rackId))
                                   join b in _context.EDMSLineDocuments on a.LineCode equals b.LineCode
                                   join c in _context.EDMSFloorDocuments on b.FloorCode equals c.FloorCode
                                   join d in _context.EDMSWareHouseDocuments.Where(x => x.WHS_Flag != true) on c.WHS_Code equals d.WHS_Code
                                   group d.WHS_Code by d.WHS_Code into g
                                   select g.Key).FirstOrDefault();
                    var countRack = (from b in _context.EDMSFloorDocuments.Where(x => x.WHS_Code == whsCode)
                                     join c in _context.EDMSLineDocuments on b.FloorCode equals c.FloorCode
                                     join d in _context.EDMSRackDocuments.Where(x => !x.Id.Equals(rackId)) on c.LineCode equals d.LineCode
                                     select d.Id).Count();
                    //if (countRack == 0)
                    //{
                    //    var chkExistBox = _context.EDMSBoxs.Any(x => !x.IsDeleted && x.WHS_Code == whsCode);
                    //    if (chkExistBox)
                    //    {
                    //        msg.Error = true;
                    //        msg.Title = _stringLocalizer["EDMSWM_VALIDATE_NOT_DEL_LAST_SHELF"];
                    //        return Json(msg);
                    //    }
                    //}

                    //Lấy ra số lượng thùng đã khai báo trong kệ
                    var cntBox = 0;
                    if (rack != null)
                        cntBox = rack.CNT_Box;

                    //Lấy ra số lượng thùng đã có trong kệ đó
                    var qtyBox = 0;
                    //qtyBox = _context.EDMSBoxs.Where(x => !x.IsDeleted && x.RackCode.Equals(rack.RackCode)).Count();

                    if (qtyBox >= cntBox)
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["EDMSWM_MSG_DELETE_RACK"];
                        return Json(msg);
                    }

                    //remove rack
                    _context.EDMSRackDocuments.Remove(rack);

                    var listMappingDelete = _context.EDMSFilePackCovers.Where(x => x.RackCode.Equals(rack.RackCode)).ToList();
                    if (listMappingDelete.Count > 0)
                    {
                        listMappingDelete.ForEach(p =>
                        {
                            p.IsDeleted = true;
                            p.DeletedBy = User.Identity.Name;
                            p.DeletedTime = DateTime.Now;
                        });

                        _context.EDMSFilePackCovers.UpdateRange(listMappingDelete);
                    }

                    //remove position old
                    var listPositionOld = _context.EDMSWhsQrCodeDocuments.Where(x => x.OBJ_Code == rack.RackCode && x.OBJ_Type == "OBJ_RACK_POSITION");
                    if (listPositionOld.Any())
                    {
                        _context.EDMSWhsQrCodeDocuments.RemoveRange(listPositionOld);
                    }
                    _context.SaveChanges();
                    msg.Error = false;
                    msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer["EDMSWM_CURD_LBL_RACK"].Value.ToLower());
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_FAIL"], _stringLocalizer["EDMSWM_CURD_LBL_RACK"].Value.ToLower());
                }
                //var count = GetProductInRack(rackId);
                //if (count == 0)
                //{

                //}
                //else
                //{
                //    msg.Error = true;
                //    //msg.Title = "Kệ đang chứa sản phẩm, không thể xóa";
                //    msg.Title = String.Format(_stringLocalizer["EDMSWM_MSG_DELETE_RACK"));
                //}
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_ERR_ADD"];
            }
            return Json(msg);
        }

        [NonAction]
        private decimal GetProductInRack(int rackId)
        {
            decimal count = 0;
            var query = from a in _context.EDMSRackDocuments.Where(x => x.Id == rackId)
                        join d in _context.ProductEntityMappings.Where(x => x.IsDeleted == false) on a.RackCode equals d.RackCode
                        select new
                        {
                            a.RackCode,
                            d.Quantity
                        };
            count = query.Sum(x => x.Quantity).Value;
            return count;
        }

        [HttpPost]
        public byte[] GenQRCode(string code)
        {
            try
            {
                return CommonUtil.GeneratorQRCode(code);
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }

        [HttpGet]
        public string GenFloorCode(string wareHouseCode, string floorName)
        {
            var floorCode = string.Empty;
            try
            {
                //Quy tắc sinh mã (F.TÊN TẦNG_MÃ KHO)//Cũ bỏ đi thay bằng mới
                //Quy tắc sinh mã (TÊN TẦNG_MÃ KHO)//Mã mới

                floorCode = string.Format("{0}_{1}", floorName, wareHouseCode);
            }
            catch (Exception ex)
            {

                throw ex;
            }

            return floorCode;
        }

        [HttpGet]
        public string GenLineCode(string floorCode, string lineName)
        {
            var lineCode = string.Empty;
            try
            {
                //Quy tắc sinh mã (L.TÊN DÃY_MÃ TẦNG)//Cũ bỏ đi thay bằng mới
                //Quy tắc sinh mã (TÊN DÃY_MÃ TẦNG)//Mã mới

                var guid = Guid.NewGuid().ToString().ToUpper().Substring(0, 4);

                lineCode = string.Format("{0}_{1}", lineName, floorCode);
            }
            catch (Exception ex)
            {

                throw ex;
            }

            return lineCode;
        }

        [HttpGet]
        public string GenRackCode(string lineCode, string rackName)
        {
            var rackCode = string.Empty;
            try
            {
                //Quy tắc sinh mã (R.TÊN KỆ_MÃ DÃY)//Cũ bỏ đi thay bằng mới
                //Quy tắc sinh mã (R.TÊN KỆ_MÃ DÃY)//Mã mới

                rackCode = string.Format("{0}_{1}", rackName, lineCode);
            }
            catch (Exception ex)
            {

                throw ex;
            }

            return rackCode;
        }

        [HttpGet]
        public string GenBoxCode(string boxNumber, string branchCode, string docType, string userId)
        {
            var boxCode = string.Empty;
            try
            {
                branchCode = branchCode.Split("*")[0];
                boxCode = string.Format("BX.{0}_BR.{1}", boxNumber, branchCode);
                boxCode = boxCode.ToUpper();
            }
            catch (Exception ex)
            {

                throw ex;
            }

            return boxCode;
        }
        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }).Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value })).Union(_stringLocalizerEDMS.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion
    }
}