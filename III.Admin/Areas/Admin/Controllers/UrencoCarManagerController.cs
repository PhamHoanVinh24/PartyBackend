using System;
using System.Collections.Generic;
using System.Data;
using System.Drawing;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
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
using QRCoder;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class UrencoCarManagerController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<AssetInventoryController> _inventoryController;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IStringLocalizer<UrencoCarManagerController> _stringLocalizer;
        private readonly IStringLocalizer<CustomerController> _stringLocalizerCus;


        public UrencoCarManagerController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment,
            IStringLocalizer<AssetInventoryController> inventoryController, IStringLocalizer<SharedResources> sharedResources,
            IStringLocalizer<UrencoCarManagerController> stringLocalizer, IStringLocalizer<CustomerController> stringLocalizerCus)
        {
            _context = context;
            _hostingEnvironment = hostingEnvironment;
            _upload = upload;
            _inventoryController = inventoryController;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
            _stringLocalizerCus = stringLocalizerCus;
        }
        public IActionResult Index()
        {
            return View();
        }

        #region combobox
        [HttpPost]
        public object GetListCar()
        {
            return _context.UrencoTrashCars.Where(x => !x.IsDeleted).Select(x => new
            {
                Code = x.CarCode,
                Name = x.CarCode
            });
        }

        [HttpPost]
        public object GetListBranch()
        {
            return _context.AdOrganizations.Where(x => x.IsEnabled).Select(x => new
            {
                Code = x.OrgAddonCode,
                Name = x.OrgName
            });
        }

        [HttpPost]
        public object GetListDriver()
        {
            return _context.HREmployees.Where(x => x.flag.Value == 1).Select(x => new
            {
                Code = x.Id.ToString(),
                Name = x.fullname
            });
        }

        [HttpPost]
        public object GetCatObjActivity()
        {
            var data = _context.CatWorkFlows.Where(x => x.IsDeleted == false).OrderBy(x => x.Name).ThenBy(x => x.WorkFlowCode).Select(x => new { Code = x.WorkFlowCode, CatName = x.Name }).ToList();
            return data;
        }

        [HttpPost]
        public object GetListRoute()
        {
            var data = _context.UrencoRoutes.Where(x => x.IsDeleted == false).Select(x => new { Code = x.RouteCode, Name = x.RouteName });
            return data;
        }
        #endregion

        #region Index
        [HttpPost]
        public object JTable([FromBody]UrencoCarManagerJtableModel jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var fromDate = !string.IsNullOrEmpty(jTablePara.StartTime) ? DateTime.ParseExact(jTablePara.StartTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.EndTime) ? DateTime.ParseExact(jTablePara.EndTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var query = (from a in _context.UrencoCarManagers
                         join b2 in _context.UrencoRoutes.Where(x => !x.IsDeleted) on a.Router equals b2.RouteCode into b1
                         from b in b1.DefaultIfEmpty()
                         join c2 in _context.HREmployees.Where(x => x.flag.Value == 1) on a.Driver equals c2.Id.ToString() into c1
                         from c in c1.DefaultIfEmpty()
                         join d2 in _context.AdOrganizations.Where(x => x.IsEnabled) on a.Branch equals d2.OrgAddonCode into d1
                         from d in d1.DefaultIfEmpty()
                         where (!a.IsDeleted && (string.IsNullOrEmpty(jTablePara.CarPlate) || a.CarPlate.ToLower().Contains(jTablePara.CarPlate.ToLower()))
                         && (string.IsNullOrEmpty(jTablePara.Driver) || a.Driver.ToLower().Contains(jTablePara.Driver.ToLower()))
                         && (string.IsNullOrEmpty(jTablePara.Router) || a.Router.ToLower().Contains(jTablePara.Router.ToLower()))
                         && (string.IsNullOrEmpty(jTablePara.Branch) || a.Branch.ToLower().Contains(jTablePara.Branch.ToLower()))
                         && (fromDate == null || (a.EndTime <= toDate))
                         && (toDate == null || (a.StartTime >= fromDate)))
                         select new
                         {
                             Id = a.ID,
                             a.CarPlate,
                             Driver = c != null ? c.fullname : "",
                             Router = b != null ? b.RouteName : "",
                             a.MachineRunCNT,
                             a.KmRun,
                             a.StartTime,
                             a.EndTime,
                             Branch = d != null ? d.OrgName : "",
                             a.Unit,
                             a.Shift,
                             a.Quantity
                         });
            int count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length);
            var jdata = JTableHelper.JObjectTable(data.ToList(), jTablePara.Draw, count, "Id", "CarPlate", "Driver", "Router", "MachineRunCNT", "KmRun", "StartTime",
                "EndTime", "Branch", "Unit", "Shift", "Quantity");
            return Json(jdata);
        }

        [HttpPost]
        public JsonResult Insert([FromBody]UrencoCarManagerModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            string actCode = EnumHelper<LogActivity>.GetDisplayValue(LogActivity.ActivityCreate);
            try
            {
                if (!_context.UrencoCarManagers.Any(x => x.TicketCode == obj.TicketCode && x.IsDeleted != true))
                {
                    DateTime? startTime = !string.IsNullOrEmpty(obj.StartTime) ? DateTime.ParseExact(obj.StartTime, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture) : (DateTime?)null;
                    DateTime? endTime = !string.IsNullOrEmpty(obj.EndTime) ? DateTime.ParseExact(obj.EndTime, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture) : (DateTime?)null;
                    UrencoCarManager data = new UrencoCarManager()
                    {
                        TicketCode = obj.TicketCode,
                        Title = obj.Title,
                        CarPlate = obj.CarPlate,
                        Branch = obj.Branch,
                        Driver = obj.Driver,
                        Router = obj.Router,
                        StartTime = startTime,
                        EndTime = endTime,
                        MachineRunCNT = obj.MachineRunCNT,
                        KmRun = obj.KmRun,
                        Unit = obj.Unit,
                        Shift = obj.Shift,
                        Quantity = obj.Quantity,
                        ObjActCode = obj.ObjActCode,
                        Caburant = obj.Caburant,
                        CaburantType = obj.CaburantType,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now,
                    };
                    InsertLogDataAuto(actCode, data);
                    _context.UrencoCarManagers.Add(data);
                    _context.SaveChanges();
                    //msg.Title = "Thêm phiếu điều độ xe thành công";
                    msg.Title = _stringLocalizer["UCM_MSG_ADD_SUCCESS"];
                    msg.ID = data.ID;
                    return Json(msg);
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Mã phiếu đã tồn tại";
                    msg.Title = _sharedResources["COM_ERR_ADD"];
                }
                return Json(msg);
            }
            catch (Exception)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi khi thêm phiếu điều độ xe!";
                msg.Title = _sharedResources["COM_ERR_ADD"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GenReqCode()
        {
            var monthNow = DateTime.Now.Month;
            var yearNow = DateTime.Now.Year;
            var reqCode = string.Empty;
            var no = 1;
            var noText = "01";
            var data = _context.UrencoCarManagers.Where(x => x.CreatedTime.Year == yearNow && x.CreatedTime.Month == monthNow).ToList();
            if (data.Count > 0)
            {
                no = data.Count + 1;
                if (no < 10)
                {
                    noText = "0" + no;
                }
                else
                {
                    noText = no.ToString();
                }
            }

            reqCode = string.Format("{0}{1}{2}{3}", "UCM_", "T" + monthNow + ".", yearNow + "_", noText);

            return Json(reqCode);
        }

        [HttpPost]
        public object GetItem(int Id)
        {
            var data = _context.UrencoCarManagers.FirstOrDefault(x => x.ID == Id);
            return Json(data);
        }

        [HttpPost]
        public JsonResult Update([FromBody]UrencoCarManagerModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            string actCode = EnumHelper<LogActivity>.GetDisplayValue(LogActivity.ActivityUpdate);
            try
            {
                var query = _context.UrencoCarManagers.FirstOrDefault(x => x.ID == obj.ID);
                if (query != null)
                {
                    query.CarPlate = obj.CarPlate;
                    query.Title = obj.Title;
                    query.Branch = obj.Branch;
                    query.Driver = obj.Driver;
                    query.Router = obj.Router;
                    query.StartTime = !string.IsNullOrEmpty(obj.StartTime) ? DateTime.ParseExact(obj.StartTime, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture) : (DateTime?)null;
                    query.MachineRunCNT = obj.MachineRunCNT;
                    query.KmRun = obj.KmRun;
                    query.EndTime = !string.IsNullOrEmpty(obj.EndTime) ? DateTime.ParseExact(obj.EndTime, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture) : (DateTime?)null;
                    query.Unit = obj.Unit;
                    query.Shift = obj.Shift;
                    query.Quantity = obj.Quantity;
                    query.Caburant = obj.Caburant;
                    query.CaburantType = obj.CaburantType;
                    query.UpdatedTime = DateTime.Now.Date;
                    query.UpdatedBy = ESEIM.AppContext.UserName;

                    InsertLogDataAuto(actCode, query);
                    _context.UrencoCarManagers.Update(query);
                    _context.SaveChanges();
                    //msg.Title = "Cập nhật phiếu điều độ xe thành công";
                    msg.Title = _stringLocalizer["UCM_MSG_UPDATE_SUCCESS"];

                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Không tồn tại phiếu điều độ xe!";
                    msg.Title = _sharedResources["COM_UPDATE_FAIL"];
                }

            }
            catch (Exception)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi xảy ra!";
                msg.Title = _sharedResources["COM_UPDATE_FAIL"];
            }

            return Json(msg);
        }

        [HttpPost]
        public JsonResult Deleted(int Id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var actCode = EnumHelper<LogActivity>.GetDisplayValue(LogActivity.ActivityDelete);
            try
            {
                var data = _context.UrencoCarManagers.FirstOrDefault(x => x.ID == Id);
                data.DeletedTime = DateTime.Now.Date;
                data.DeletedBy = ESEIM.AppContext.UserName;
                data.IsDeleted = true;

                InsertLogDataAuto(actCode, data);
                _context.UrencoCarManagers.Update(data);
                _context.SaveChanges();
                //msg.Title = "Xóa phiếu điều độ xe thành công";
                msg.Title = _stringLocalizer["UCM_MSG_DELETE_SUCCESS"];
            }
            catch (Exception)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi xảy ra khi xóa!";
                msg.Title = _sharedResources["COM_ERR_DELETE"];
            }
            return Json(msg);
        }
        #endregion

        #region Activity
        public void InsertLogDataAuto(string actCode, UrencoCarManager obj)
        {
            var data = _context.ActivityLogDatas.FirstOrDefault(x => !x.IsDeleted && x.WorkFlowCode.Equals(obj.ObjActCode) && x.ActCode.Equals(actCode) && x.ObjCode.Equals(obj.TicketCode));
            if (data == null)
            {
                data = new ActivityLogData();
                data.ListLog = new List<string>();
                data.ActCode = actCode;
                data.ActType = "ACTIVITY_AUTO_LOG";
                data.WorkFlowCode = obj.ObjActCode;
                data.ObjCode = obj.TicketCode;
                data.ActTime = DateTime.Now;
                data.CreatedBy = ESEIM.AppContext.UserName;
                data.CreatedTime = DateTime.Now;
                string jObj = JsonConvert.SerializeObject(obj);
                data.ListLog.Add(jObj);
                data.Log = JsonConvert.SerializeObject(data.ListLog);
                _context.ActivityLogDatas.Add(data);
            }
            else
            {
                string jObj = JsonConvert.SerializeObject(obj);
                data.ListLog.Add(jObj);
                data.Log = JsonConvert.SerializeObject(data.ListLog);
                _context.ActivityLogDatas.Update(data);
            }
        }

        [HttpPost]
        public object InsertLogData([FromBody]UrencoCarManagerActivityLogDataRes obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            var data = _context.CatActivitys.Where(x => x.ActCode.Equals(obj.ActCode)).Select(y => y.ActType).ToList();
            string actType = "";
            foreach (var item in data)
            {
                actType = item;
            }
            try
            {
                DateTime? actTime = !string.IsNullOrEmpty(obj.ActTime) ? DateTime.ParseExact(obj.ActTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                if (obj.ObjActCode != null && obj.ObjCode != null)
                {
                    var activityLogData = new ActivityLogData
                    {
                        ActCode = obj.ActCode,
                        WorkFlowCode = obj.ObjActCode,
                        ObjCode = obj.ObjCode,
                        ActTime = actTime,
                        ActType = actType,
                        ActLocationGPS = obj.ActLocationGPS, // Chưa biết cách lấy
                        ActFromDevice = obj.ActFromDevice,    // Chưa biết cách lấy
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now
                    };
                    _context.ActivityLogDatas.Add(activityLogData);
                    _context.SaveChanges();
                    //msg.Title = "Hoạt động đã lưu vào log";
                    msg.Title = _stringLocalizer["UCM_MSG_ADD_ACTIVITY_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Vui lòng nhập đầy đủ thông tin";
                    msg.Title = _sharedResources["COM_MSG_ERR"];
                }
            }
            catch (Exception)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi xảy ra";
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpGet]
        public object GetItemAttrSetup(string actCode)
        {
            //var data = _context.ActivityAttrSetups.Where(x => x.ActCode.Equals(actCode)).Select(x => new { Code = x.AttrCode, Name = x.AttrName, Group = x.AttrGroup, Unit = x.AttrUnit, DataType = x.AttrDataType }).ToList();
            var data = (from a in _context.AttrSetups
                        join b in _context.CommonSettings on a.AttrDataType equals b.CodeSet into b1
                        from b2 in b1.DefaultIfEmpty()
                        join c in _context.CommonSettings on a.AttrUnit equals c.CodeSet into c1
                        from c2 in c1.DefaultIfEmpty()
                        where (a.IsDeleted == false && a.ActCode.Equals(actCode))
                        select new
                        {
                            Id = a.ID,
                            Code = a.AttrCode,
                            Name = a.AttrName,
                            UnitCode = a.AttrUnit,
                            Unit = c2.ValueSet,
                            DataTypeCode = a.AttrDataType,
                            DataType = b2.ValueSet,
                            Group = a.AttrGroup,
                        }).ToList();
            return data;
        }

        [HttpPost]
        public object GetListActivityAttrData(string objCode, string actCode, string objActCode)
        {
            var data = from a in _context.ActivityAttrDatas
                       join b in _context.AttrSetups on a.AttrCode equals b.AttrCode
                       join c in _context.CommonSettings on b.AttrUnit equals c.CodeSet
                       join d in _context.CommonSettings on b.AttrDataType equals d.CodeSet
                       where (a.IsDeleted == false && a.ObjCode.Equals(objCode) && a.WorkFlowCode.Equals(objActCode) && a.ActCode.Equals(actCode))
                       select new
                       {
                           Id = a.ID,
                           Name = b.AttrName,
                           sValue = a.Value,
                           Unit = c.ValueSet,
                           DataType = d.ValueSet,
                           Group = b.AttrGroup,
                           sNote = a.Note
                       };
            return data;
        }

        [HttpPost]
        public object InsertAttrData([FromBody]ActivityAttrData obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var check = _context.ActivityAttrDatas.FirstOrDefault(x => x.IsDeleted == false && x.WorkFlowCode.Equals(obj.WorkFlowCode) && x.ObjCode.Equals(obj.ObjCode) && x.ActCode.Equals(obj.ActCode) && x.AttrCode.Equals(obj.AttrCode));

                if (check == null && obj.WorkFlowCode != null && obj.ObjCode != null && obj.ActCode != null)
                {
                    var actAttrData = new ActivityAttrData()
                    {
                        AttrCode = obj.AttrCode,
                        ObjCode = obj.ObjCode,
                        WorkFlowCode = obj.WorkFlowCode,
                        ActCode = obj.ActCode,
                        Value = obj.Value,
                        Note = obj.Note,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now
                    };
                    _context.ActivityAttrDatas.Add(actAttrData);
                    _context.SaveChanges();
                    msg.Title = "Thêm thuộc tính thành công";
                    //msg.Title = _stringLocalizer["ASSETIMPRO_MSG_ADD_PROPERTY_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Có lỗi xảy ra";
                    msg.Title = _sharedResources["COM_MSG_ERR"];
                }
            }
            catch (Exception)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi xảy ra";
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult DeleteAttrData(int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            var data = _context.ActivityAttrDatas.FirstOrDefault(x => x.ID == id && !x.IsDeleted);
            if (data != null)
            {
                data.IsDeleted = true;
                data.DeletedBy = ESEIM.AppContext.UserName;
                data.DeletedTime = DateTime.Now;
                _context.ActivityAttrDatas.Update(data);
                _context.SaveChanges();
                //msg.Title = " Xóa thành công";
                msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
            }
            else
            {
                msg.Error = true;
                //msg.Title = "Không tìm thấy phần tử cần xóa";
                msg.Title = _sharedResources["COM_ERR_DELETE"];
            }
            return Json(msg);
        }

        [HttpPost]
        public object JTableActivity([FromBody]JTableUCMActivityModel jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = (from a in _context.ActivityLogDatas
                         join b in _context.ActivityAttrDatas.Where(x => !x.IsDeleted) on new { a.ActCode, a.WorkFlowCode, a.ObjCode } equals new { b.ActCode, b.WorkFlowCode, b.ObjCode }
                         join c in _context.CatActivitys.Where(x => !x.IsDeleted) on a.ActCode equals c.ActCode
                         join d in _context.AttrSetups.Where(x => !x.IsDeleted) on b.AttrCode equals d.AttrCode
                         join e in _context.CommonSettings.Where(x => !x.IsDeleted) on c.ActType equals e.CodeSet into e1
                         from e2 in e1.DefaultIfEmpty()
                         join f in _context.CommonSettings.Where(x => !x.IsDeleted) on d.AttrUnit equals f.CodeSet into f1
                         from f2 in f1.DefaultIfEmpty()
                         where (a.IsDeleted == false && a.ObjCode.Equals(jTablePara.TicketCode) && a.WorkFlowCode.Equals(jTablePara.ObjActCode))
                         select new
                         {
                             a.ID,
                             ActName = c.ActName,
                             ActCode = c.ActCode,
                             ActType = e2.ValueSet,
                             UserAct = b.CreatedBy,
                             AttrCode = b.AttrCode,
                             Time = b.CreatedTime.HasValue ? b.CreatedTime.Value.ToString("dd/MM/yyyy hh:mm:ss") : "",
                             CreatedTime = b.CreatedTime.Value,
                             Result = "-" + _stringLocalizer["Tên thuộc tính"] + ": " + d.AttrName + " <br />" + "-"
                             + _stringLocalizer["Giá trị"] + ": " + b.Value + "<br/>" + " -"
                             + _stringLocalizer["Đơn vị tính"] + ": " + f2.ValueSet
                         }).DistinctBy(x => new { x.ActCode, x.ActType, x.AttrCode }).OrderByDescending(x => x.UserAct).ThenByDescending(x => x.CreatedTime);
            var count = query.Count();
            var data = query.Skip(intBeginFor).Take(jTablePara.Length).ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "ID", "ActName", "ActType", "UserAct", "Result", "Time");
            return Json(jdata);
        }

        [HttpPost]
        public JsonResult DeleteItemActivity(int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            var data = _context.ActivityLogDatas.FirstOrDefault(x => x.ID == id && !x.IsDeleted);
            if (data != null && ESEIM.AppContext.UserName.Equals(data.CreatedBy))
            {
                data.IsDeleted = true;
                data.DeletedBy = ESEIM.AppContext.UserName;
                data.DeletedTime = DateTime.Now;
                _context.ActivityLogDatas.Update(data);
                _context.SaveChanges();
                msg.Title = " Xóa thành công";
                //msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
            }
            else
            {
                msg.Error = true;
                msg.Title = "Xóa thất bại";
                //msg.Title = _sharedResources["COM_DELETE_FAIL"];
            }
            return Json(msg);
        }
        #endregion

        #region File
        public class JTableModelFile : JTableModel
        {
            public string AssetCode { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string CatCode { get; set; }
            public int? FileID { get; set; }
        }

        [HttpPost]
        public object GetListFile(string code)
        {
            var data = from a in _context.EDMSRepoCatFiles
                       join b in _context.EDMSFiles on a.FileCode equals b.FileCode into b1
                       from c in b1.DefaultIfEmpty()
                       where (!c.IsDeleted && a.ObjectCode.Equals(code))
                       select new
                       {
                           Id = a.Id,
                           Name = c.FileName,
                           Code = c.FileCode,
                           Url = c.Url,
                           Type = c.FileTypePhysic
                       };
            return data;
        }

        [HttpPost]
        public JsonResult CheckTicketCode(string str)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = _context.UrencoCarManagers.FirstOrDefault(x => x.TicketCode.Equals(str) && !x.IsDeleted);
                if (data != null)
                {

                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Lưu phiếu trươc khi tải tệp!";
                    //msg.Title = _stringLocalizer["ASSETIMPRO_MSG_ADD_FILE_SUCCESS"];
                }
            }
            catch (Exception)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi xảy ra tải tệp!"; 
                msg.Title = _sharedResources["COM_MSG_FILE_FAIL"];
            }
            return Json(msg);
        }

        [HttpPost]
        [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
        [RequestSizeLimit(long.MaxValue)]
        public JsonResult InsertAssetFile(EDMSRepoCatFileModel obj, IFormFile fileUpload)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var mimeType = fileUpload.ContentType;
                string extension = Path.GetExtension(fileUpload.FileName);
                string urlFile = "";
                string fileId = "";
                if (Array.IndexOf(LuceneExtension.fileMimetypes, mimeType) >= 0 && (Array.IndexOf(LuceneExtension.fileExt, extension.ToUpper()) >= 0))
                {
                    string reposCode = "";
                    string catCode = "";
                    string path = "";
                    string folderId = "";
                    //Chọn file ngắn gọn
                    if (!obj.IsMore)
                    {
                        var suggesstion = GetSuggestionsAssetFile(obj.AssetCode);
                        if (suggesstion != null)
                        {
                            reposCode = suggesstion.ReposCode;
                            path = suggesstion.Path;
                            folderId = suggesstion.FolderId;
                            catCode = suggesstion.CatCode;
                        }
                        else
                        {
                            msg.Error = true;
                            msg.Title = _stringLocalizerCus["CUS_TITLE_ENTER_EXPEND"];
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
                            msg.Title = _stringLocalizerCus["CUS_ERROR_CHOOSE_FILE"];
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
                        fileId = FileExtensions.UploadFileToDrive(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", fileUpload.FileName, fileUpload.OpenReadStream(), fileUpload.ContentType, folderId);
                    }
                    var edmsReposCatFile = new EDMSRepoCatFile
                    {
                        FileCode = string.Concat("UCM", Guid.NewGuid().ToString()),
                        ReposCode = reposCode,
                        CatCode = catCode,
                        ObjectCode = obj.AssetCode,
                        ObjectType = "URENCO_CAR_MANAGER",
                        Path = path,
                        FolderId = folderId
                    };
                    _context.EDMSRepoCatFiles.Add(edmsReposCatFile);

                    /// created Index lucene
                    LuceneExtension.IndexFile(edmsReposCatFile.FileCode, fileUpload, string.Concat(_hostingEnvironment.WebRootPath, "\\uploads\\luceneIndex"));

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
                    msg.Title = _stringLocalizerCus["CUS_TITLE_ADD_FILE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizerCus["CUS_TITLE_FORMAT_FILE"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = _stringLocalizerCus["CUS_TITLE_ERROR_TRYON"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateAssetFile(EDMSRepoCatFileModel obj)
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
                        msg.Title = _stringLocalizerCus["CUS_TITLE_UPDATE_INFO_SUCCESS"];
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizerCus["CUS_ERROR_CHOOSE_FILE"];
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizerCus["CUS_TITLE_FILE_NOT_EXIST"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_FAILED"], _stringLocalizerCus[""]);// "Có lỗi xảy ra khi cập nhật!";
                msg.Object = ex;
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult DeleteAssetFile(int id)
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
                }
                _context.SaveChanges();
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer[""]);// "Xóa thành công";
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
        public JsonResult GetAssetFile(int id)
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
                msg.Title = _stringLocalizer["CUS_TITLE_ERROR_TRYON"];
            }
            return Json(msg);
        }

        [HttpGet]
        public EDMSRepoCatFile GetSuggestionsAssetFile(string assetCode)
        {
            var query = _context.EDMSRepoCatFiles.Where(x => x.ObjectCode == assetCode && x.ObjectType == EnumHelper<AssetEnum>.GetDisplayValue(AssetEnum.Asset)).MaxBy(x => x.Id);
            return query;
        }
        #endregion

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_inventoryController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerCus.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion
    }

    #region Model
    public class UrencoCarManagerJtableModel : JTableModel
    {
        public string CarPlate { get; set; }
        public string Driver { get; set; }
        public string Router { get; set; }
        public string Branch { get; set; }
        public string StartTime { get; set; }
        public string EndTime { get; set; }
    }

    public class UrencoCarManagerModel
    {
        public int ID { get; set; }
        public string CarPlate { get; set; }
        public string Driver { get; set; }
        public string Router { get; set; }
        public string MachineRunCNT { get; set; }
        public string KmRun { get; set; }
        public string StartTime { get; set; }
        public string EndTime { get; set; }
        public string Branch { get; set; }
        public string Unit { get; set; }
        public string Shift { get; set; }
        public bool IsDeleted { get; set; }
        public int Quantity { get; set; }
        public string ObjActCode { get; set; }
        public string TicketCode { get; set; }
        public string Title { get; set; }
        public int Caburant { get; set; }
        public string CaburantType { get; set; }
    }

    public class UrencoCarManagerActivityLogDataRes
    {
        public int ID { get; set; }
        public string ActCode { get; set; }
        public string ObjActCode { get; set; }
        public string ObjCode { get; set; }
        public string ActTime { get; set; }
        public decimal ActLocationGPS { get; set; }
        public string ActFromDevice { get; set; }
        public string ActType { get; set; }
    }

    public class JTableUCMActivityModel : JTableModel
    {
        public int ID { get; set; }
        public string ActName { get; set; }
        public string ActType { get; set; }
        public string User { get; set; }
        public string LocationGPS { get; set; }
        public string Result { get; set; }
        public string TicketCode { get; set; }
        public string ObjCode { get; set; }
        public string ObjActCode { get; set; }
    }
    #endregion
}