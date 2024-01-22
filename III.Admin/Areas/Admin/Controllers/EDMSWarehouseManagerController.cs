using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class EDMSWarehouseManagerController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<EDMSWarehouseManagerController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;

        public EDMSWarehouseManagerController(EIMDBContext context, IHostingEnvironment hostingEnvironment, IStringLocalizer<EDMSWarehouseManagerController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _hostingEnvironment = hostingEnvironment;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }

        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public object JTable([FromBody]JTableModelExtend jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.EDMSWareHouses
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
            var query = from a in _context.EDMSFloors
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
            var query = from a in _context.EDMSLines
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
            var query = from a in _context.EDMSRacks
                        where (!string.IsNullOrEmpty(jTablePara.LineCode) && a.LineCode.ToLower().Equals(jTablePara.LineCode.ToLower()))
                        select new
                        {
                            a.Id,
                            a.LineCode,
                            a.RackCode,
                            a.RackName,
                            a.R_Position,
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
                              a.R_Position,
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
        public object GetListWareHouse(string type)
        {
            try
            {
                var rs = _context.EDMSWareHouses.Where(x => x.WHS_Flag != true && x.Type == type).ToList();
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
                var rs = _context.EDMSFloors.ToList();
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
                var rs = _context.EDMSFloors.Where(x => x.WHS_Code.Equals(wareHouseCode)).ToList();
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
        //    var rs = _context.EDMSWareHouses.FirstOrDefault(x => x.WHS_Code == WareHouseInfor);
        //    try
        //    {
        //        var floorCode = 0;
        //        var RackCode = 0;
        //        var lineCode = 0;
        //        var listFloor = _context.EDMSFloors.Where(x => x.WHS_Code.Equals(rs.WHS_Code)).ToList();
        //        if (listFloor.Count > 0)
        //        {
        //            floorCode = listFloor.Sum(x => x.FloorCode);
        //            foreach (var item in listFloor)
        //            {
        //                var listLine = _context.EDMSFloors.Where(x => x.FloorCode.Equals(item.WHS_Code)).ToList();
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
                    //var rs = _context.EDMSLines.Where(x => x.LineCode.IndexOf("_WHP.") > 0).ToList();
                    var rs = _context.EDMSLines.ToList();
                    return Json(rs);
                }
                else
                {
                    var rs = _context.EDMSLines.Where(x => x.LineCode.IndexOf(storeCode) > 0).ToList();
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
                var rs = _context.EDMSLines.Where(x => x.FloorCode.Equals(floorCode)).ToList();
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
                var rs = _context.EDMSRacks.ToList();
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
                var rs = _context.EDMSRacks.Where(x => x.LineCode.Equals(lineCode)).ToList();
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

                var rs = _context.EDMSWareHouses.FirstOrDefault(x => x.WHS_Code == wareHouseCode && !x.WHS_Flag);
                if (rs != null)
                {
                    var listFloor = _context.EDMSFloors.Where(x => x.WHS_Code.Equals(rs.WHS_Code)).ToList();
                    if (listFloor.Count > 0)
                    {
                        qtyFloor = listFloor.Count;
                        cntLine = listFloor.Sum(x => x.CNT_Line);

                        foreach (var item in listFloor)
                        {
                            var listLine = _context.EDMSLines.Where(x => x.FloorCode.Equals(item.FloorCode)).ToList();
                            if (listLine.Count > 0)
                            {
                                qtyLine = qtyLine + listLine.Count;
                                cntRack = cntRack + listLine.Sum(x => x.CNT_Rack);
                                foreach (var line in listLine)
                                {
                                    var listRack = _context.EDMSRacks.Where(x => x.LineCode.Equals(line.LineCode)).ToList();
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
                        RackName = _context.EDMSRacks.FirstOrDefault(x => x.RackCode == rs.RackCode)?.RackName;
                    if (rs.LineCode != null)
                        LineName = _context.EDMSLines.FirstOrDefault(x => x.LineCode == rs.LineCode)?.L_Text;
                    if (rs.FloorCode != null)
                        FloorName = _context.EDMSFloors.FirstOrDefault(x => x.FloorCode == rs.FloorCode)?.FloorName;
                    if (rs.WHS_Code != null)
                        WareHouseName = _context.EDMSWareHouses.Where(x => x.WHS_Flag != true).FirstOrDefault(x => x.WHS_Code == rs.WHS_Code)?.WHS_Name;

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
                        var obj = _context.EDMSRacks.FirstOrDefault(x => x.RackCode == objCode);
                        if (obj != null)
                        {
                            RackName = obj.RackName;
                            var objLine = _context.EDMSLines.FirstOrDefault(x => x.LineCode == obj.LineCode);
                            if (objLine != null)
                            {
                                LineName = objLine.L_Text;
                                var objFloor = _context.EDMSFloors.FirstOrDefault(x => x.FloorCode == objLine.FloorCode);
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
        public JsonResult InsertFloor(EDMSFloor obj, IFormFile imageFloor, IFormFile mapDesgin)
        {
            var msg = new JMessage();
            try
            {
                var floor = _context.EDMSFloors.FirstOrDefault(x => x.FloorCode.Equals(obj.FloorCode));
                if (floor == null)
                {
                    var maxFloor = _context.EDMSWareHouses.FirstOrDefault(x => x.WHS_Flag != true && x.WHS_Code.Equals(obj.WHS_Code)).WHS_CNT_Floor;
                    var countFloor = _context.EDMSFloors.Where(x => x.WHS_Code.Equals(obj.WHS_Code)).Count();
                    if (countFloor < maxFloor)
                    {
                        var floorObj = new EDMSFloor
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
                            Humidity = obj.Humidity
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

                        _context.EDMSFloors.Add(floorObj);
                        _context.SaveChanges();
                        msg.Error = false;
                        //msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"), _stringLocalizer["CATEGORY_MSG_PRODUCT"));
                        msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["EDMSWM_CURD_LBL_FLOOR"].Value.ToLower());//tầng
                    }
                    else
                    {
                        msg.Error = true;
                        //msg.Title = "Không được tạo quá số tầng đã khai báo của kho";
                        msg.Title = String.Format(_stringLocalizer["EDMSWM_MSG_WARE_HOUSE"]);
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
                msg.Title = String.Format(_sharedResources["COM_ERR_ADD"]);
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateFloor(EDMSFloor obj, IFormFile imageFloor, IFormFile mapDesgin)
        {
            var msg = new JMessage();
            try
            {
                var floor = _context.EDMSFloors.FirstOrDefault(x => x.FloorCode.Equals(obj.FloorCode));
                if (floor != null)
                {

                    //check số dãy phải >= số dãy đã khai báo
                    var cnt = _context.EDMSLines.Where(x => x.FloorCode == floor.FloorCode).Count();
                    if (cnt > obj.CNT_Line)
                    {
                        msg.Error = true;
                        msg.Title = "Số dãy phải lớn hơn hoặc bằng số dãy đã khai báo";
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
                        _context.EDMSFloors.Update(floor);
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
                msg.Title = String.Format(_sharedResources["COM_ERR_ADD"]);
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult DeleteFloor(int floorId)
        {
            var msg = new JMessage();
            try
            {
                var count = GetProductInFloor(floorId);
                if (count == 0)
                {
                    var floor = _context.EDMSFloors.FirstOrDefault(x => x.Id.Equals(floorId));
                    if (floor != null)
                    {
                        _context.EDMSFloors.Remove(floor);
                        var line = _context.EDMSLines.Where(x => x.FloorCode == floor.FloorCode);
                        if (line.Any())
                        {
                            var rack = _context.EDMSRacks.Where(x => line.Any(y => y.LineCode == x.LineCode));
                            if (rack.Any())
                            {
                                _context.EDMSRacks.RemoveRange(rack);
                            }
                            _context.EDMSLines.RemoveRange(line);
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
                    msg.Title = String.Format(_stringLocalizer["EDMSWM_MSG_DELETE_FLOOR"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_ERR_ADD"]);
            }
            return Json(msg);
        }

        [NonAction]
        private decimal GetProductInFloor(int floorId)
        {
            decimal count = 0;
            var query = from a in _context.EDMSFloors.Where(x => x.Id == floorId)
                        join d in _context.ProductEntityMappings.Where(x => x.IsDeleted == false) on a.FloorCode equals d.FloorCode
                        select new
                        {
                            a.FloorCode,
                            d.Quantity
                        };
            count = query.Sum(x => x.Quantity).Value;
            return count;
        }

        [HttpPost]
        public JsonResult GetFloorInfo(int floorId)
        {
            var msg = new JMessage();
            try
            {
                var floor = _context.EDMSFloors.FirstOrDefault(x => x.Id.Equals(floorId));
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
                msg.Title = String.Format(_sharedResources["COM_ERR_ADD"]);
            }
            return Json(msg);
        }

        //Thêm sửa xóa dãy
        [HttpPost]
        public JsonResult InsertLine([FromBody]EDMSLine obj)
        {
            var msg = new JMessage();
            try
            {
                var line = _context.EDMSLines.FirstOrDefault(x => x.LineCode.Equals(obj.LineCode));

                if (line == null)
                {
                    var floor = _context.EDMSFloors.FirstOrDefault(x => x.FloorCode == obj.FloorCode);
                    var countLineInFloor = _context.EDMSLines.Where(x => x.FloorCode == obj.FloorCode).Count();
                    if (floor.CNT_Line > countLineInFloor)
                    {
                        var lineObj = new EDMSLine
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
                            QR_Code = obj.LineCode
                        };

                        _context.EDMSLines.Add(lineObj);
                        _context.SaveChanges();
                        msg.Error = false;
                        msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"].Value, _stringLocalizer["EDMSWM_CURD_LBL_LINE"].Value.ToLower());
                    }
                    else
                    {
                        msg.Error = true;
                        //msg.Title = "Không được tạo quá số dãy đã khai báo của tầng";
                        msg.Title = String.Format(_stringLocalizer["EDMSWM_MSG_LINE_FLOOR"]);
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
                msg.Title = String.Format(_sharedResources["COM_ERR_ADD"]);
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateLine([FromBody]EDMSLine obj)
        {
            var msg = new JMessage();
            try
            {
                var line = _context.EDMSLines.FirstOrDefault(x => x.Id.Equals(obj.Id));
                if (line != null)
                {
                    //check số rack phải >= rack đã khai báo
                    var cnt = _context.EDMSRacks.Where(x => x.LineCode == line.LineCode).Count();
                    if (cnt > obj.CNT_Rack)
                    {
                        msg.Error = true;
                        msg.Title = "Số kệ phải lớn hơn hoặc bằng số kệ đã khai báo";
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

                        _context.EDMSLines.Update(line);
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
                msg.Title = String.Format(_sharedResources["COM_ERR_ADD"]);
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetLineInfo(int lineId)
        {
            var msg = new JMessage();
            try
            {
                var line = _context.EDMSLines.FirstOrDefault(x => x.Id.Equals(lineId));
                if (line != null)
                {
                    msg.Object = line;
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_ERR_ADD"]);
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult DeleteLine(int lineId)
        {
            var msg = new JMessage();
            try
            {
                var count = GetProductInLine(lineId);
                if (count == 0)
                {
                    var line = _context.EDMSLines.FirstOrDefault(x => x.Id.Equals(lineId));
                    if (line != null)
                    {
                        var rack = _context.EDMSRacks.Where(x => x.LineCode == line.LineCode);
                        if (rack.Any())
                        {
                            _context.EDMSRacks.RemoveRange(rack);
                        }
                        _context.EDMSLines.Remove(line);
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
                else
                {
                    msg.Error = true;
                    msg.Title = "Dãy đang chứa sản phẩm, không thể xóa";
                    //chưa có đa ngôn ngữ cho câu này, vl ông nào chưa add ResourceValue lại đi dùng tạm COM_ERR_ADD
                    msg.Title = String.Format(_stringLocalizer["LINE_HAVE_PRODUCT_CANT_DELETE"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_FAIL"]);
            }
            return Json(msg);
        }

        [NonAction]
        private decimal GetProductInLine(int lineId)
        {
            decimal count = 0;
            var query = from a in _context.EDMSLines.Where(x => x.Id == lineId)
                        join d in _context.ProductEntityMappings.Where(x => x.IsDeleted == false) on a.LineCode equals d.LineCode
                        select new
                        {
                            a.LineCode,
                            d.Quantity
                        };
            count = query.Sum(x => x.Quantity).Value;
            return count;
        }
        //Thêm sửa xóa dãy
        [HttpPost]
        public JsonResult InsertRack([FromBody]EDMSRack obj)
        {
            var msg = new JMessage();
            try
            {
                var rack = _context.EDMSRacks.FirstOrDefault(x => x.RackCode.Equals(obj.RackCode));
                if (rack == null)
                {

                    var line = _context.EDMSLines.FirstOrDefault(x => x.LineCode == obj.LineCode);
                    var countRackInLine = _context.EDMSRacks.Where(x => x.LineCode == obj.LineCode).Count();

                    if (line.CNT_Rack > countRackInLine)
                    {
                        var rackObj = new EDMSRack
                        {
                            LineCode = obj.LineCode,
                            RackCode = obj.RackCode,
                            RackName = obj.RackName,
                            R_Position = obj.R_Position,
                            R_Size = obj.R_Size,
                            R_Status = obj.R_Status,
                            CNT_Box = obj.CNT_Box,
                            CNT_Cell = obj.CNT_Cell,
                            Material = obj.Material,
                            Note = obj.Note,
                            QR_Code = obj.RackCode,
                            Ordering = obj.Ordering
                        };

                        _context.EDMSRacks.Add(rackObj);
                        _context.SaveChanges();
                        msg.Error = false;
                        msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["EDMSWM_CURD_LBL_RACK"].Value.ToLower());
                    }
                    else
                    {
                        msg.Error = true;
                        //msg.Title = "Không được tạo quá số kệ đã khai báo của dãy";
                        msg.Title = String.Format(_stringLocalizer["EDMSWM_MSG_ADD_RACK_RACK"]);
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
                msg.Title = String.Format(_sharedResources["COM_ERR_ADD"]);
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetRackInfo(int rackId)
        {
            var msg = new JMessage();
            try
            {
                var rack = _context.EDMSRacks.FirstOrDefault(x => x.Id.Equals(rackId));
                if (rack != null)
                {
                    msg.Object = rack;
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_ERR_ADD"]);
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateRack([FromBody]EDMSRack obj)
        {
            var msg = new JMessage();
            try
            {
                var rack = _context.EDMSRacks.FirstOrDefault(x => x.Id.Equals(obj.Id));
                var productInRackCount = GetProductInRack(obj.Id);

                if (rack != null)
                {
                    if (obj.CNT_Box >= productInRackCount)
                    {
                        rack.LineCode = obj.LineCode;
                        rack.RackCode = obj.RackCode;
                        rack.RackName = obj.RackName;
                        rack.R_Position = obj.R_Position;
                        rack.R_Size = obj.R_Size;
                        rack.R_Status = obj.R_Status;
                        rack.CNT_Box = obj.CNT_Box;
                        rack.CNT_Cell = obj.CNT_Cell;
                        rack.Note = obj.Note;
                        rack.QR_Code = obj.RackCode;
                        rack.Ordering = obj.Ordering;
                        rack.Material = obj.Material;

                        _context.EDMSRacks.Update(rack);
                        _context.SaveChanges();
                        msg.Error = false;
                        msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["EDMSWM_CURD_LBL_RACK"].Value.ToLower());
                    }
                    else
                    {
                        msg.Error = true;
                        //msg.Title = "Kệ đang xếp số lượng sản phẩm lớn hơn số lượng cập nhật";
                        msg.Title = String.Format(_stringLocalizer["EDMSWM_MSG_UPDATE_RACK"]);
                    }
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
                msg.Title = String.Format(_sharedResources["COM_ERR_ADD"]);
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult DeleteRack(int rackId)
        {
            var msg = new JMessage();
            try
            {
                var count = GetProductInRack(rackId);
                if (count == 0)
                {
                    var rack = _context.EDMSRacks.FirstOrDefault(x => x.Id.Equals(rackId));
                    if (rack != null)
                    {
                        _context.EDMSRacks.Remove(rack);
                        _context.SaveChanges();
                        msg.Error = false;
                        msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer["EDMSWM_CURD_LBL_RACK"].Value.ToLower());
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_FAIL"], _stringLocalizer["EDMSWM_CURD_LBL_RACK"].Value.ToLower());
                    }
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Kệ đang chứa sản phẩm, không thể xóa";
                    msg.Title = String.Format(_stringLocalizer["EDMSWM_MSG_DELETE_RACK"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_ERR_ADD"]);
            }
            return Json(msg);
        }

        [NonAction]
        private decimal GetProductInRack(int rackId)
        {
            decimal count = 0;
            var query = from a in _context.EDMSRacks.Where(x => x.Id == rackId)
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
                //Quy tắc sinh mã (BX.SỐ THÙNG_BR.HN_TYPE.ID_USR.NV_Time_hhmmss)

                boxCode = string.Format("{0}{1}_BR.{2}_TYPE.{3}_USR.{4}_Time_{5}", "BX.", boxNumber, branchCode, docType, userId, DateTime.Now.ToString("hhmmss"));
            }
            catch (Exception ex)
            {

                throw ex;
            }

            return boxCode;
        }

        [HttpGet]
        public string GenBookCode(string wareHouseCode, string floorCode, string lineCode, string rackCode, string boxCode)
        {
            try
            {
                //Quy tắc sinh mã (MÃ KHO_MÃ TẦNG_MÃ DÃY_MÃ KỆ_BOOK_GUID)

                var guid = Guid.NewGuid().ToString().ToUpper().Substring(0, 4);

                floorCode = string.Format("{0}_{1}_{2}_{3}_{4}_{5}_{6}", wareHouseCode, floorCode, lineCode, rackCode, boxCode, "BOOK", guid);
            }
            catch (Exception ex)
            {

                throw ex;
            }

            return floorCode;
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
    public class JTableFloorModel : JTableModel
    {
        public string WareHouseCode { get; set; }
    }

    public class JTableLineModel : JTableModel
    {
        public string FloorCode { get; set; }
    }

    public class JTableRackModel : JTableModel
    {
        public string LineCode { get; set; }
    }

    public class JTableModelExtend : JTableModel
    {
        public string Type { get; set; }
    }
}