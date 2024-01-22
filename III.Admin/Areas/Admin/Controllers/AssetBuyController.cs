using System;
using System.Collections.Generic;
using System.Data;
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
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class AssetBuyController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<AssetBuyController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IStringLocalizer<CustomerController> _stringLocalizerCus;
        private readonly IStringLocalizer<FileObjectShareController> _stringLocalizerFile;
        private readonly IStringLocalizer<ContractController> _contractController;
        private readonly IStringLocalizer<AssetInventoryController> _inventoryController;
        private readonly IStringLocalizer<WorkflowActivityController> _workflowActivityController;
        private readonly IStringLocalizer<EDMSRepositoryController> _repoController;

        public AssetBuyController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment, IStringLocalizer<ContractController> contractController, IStringLocalizer<AssetInventoryController> inventoryController,
            IStringLocalizer<CustomerController> stringLocalizerCus, IStringLocalizer<FileObjectShareController> stringLocalizerFile, 
            IStringLocalizer<AssetBuyController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources,
            IStringLocalizer<WorkflowActivityController> workflowActivityController, IStringLocalizer<EDMSRepositoryController> repoController)
        {
            _hostingEnvironment = hostingEnvironment;
            _context = context;
            _upload = upload;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
            _stringLocalizerCus = stringLocalizerCus;
            _contractController = contractController;
            _stringLocalizerFile = stringLocalizerFile;
            _inventoryController = inventoryController;
            _workflowActivityController = workflowActivityController;
            _repoController = repoController;
        }
        [Breadcrumb("ViewData.CrumbAssetBuy", AreaName = "Admin", FromAction = "Index", FromController = typeof(AssetBuyerHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuAsset"] = _sharedResources["COM_CRUMB_ASSET_OPERATION"];
            ViewData["TitleAssetBuyerHome"] = _sharedResources["COM_CRUMB_ASSET_BUYER_HOME"];
            ViewData["CrumbAssetBuy"] = _sharedResources["COM_CRUMB_ASSET_BUY"];
            return View();
        }

        #region Index
        [HttpPost]
        public object JTableAssetBuy([FromBody]JTableModelAsset jTablePara)
        {
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = (from a in _context.AssetBuyHeaders.Where(x => !x.IsDeleted)
                         join c in _context.HREmployees on a.Buyer equals c.Id.ToString() into c1
                         from c2 in c1.DefaultIfEmpty()
                         join d in _context.AdDepartments.Where(x => !x.IsDeleted && x.IsEnabled) on a.Depart equals d.DepartmentCode into d1
                         from d2 in d1.DefaultIfEmpty()
                         join f in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Currency equals f.CodeSet into f1
                         from f2 in f1.DefaultIfEmpty()
                         where (!a.IsDeleted)
                        && ((string.IsNullOrEmpty(jTablePara.Title) || a.Note.ToLower().Contains(jTablePara.Title.ToLower()))
                        || (string.IsNullOrEmpty(jTablePara.Title) || a.Title.ToLower().Contains(jTablePara.Title.ToLower())))
                        && (string.IsNullOrEmpty(jTablePara.Depart) || a.Depart.ToLower().Contains(jTablePara.Depart.ToLower()))
                        && (string.IsNullOrEmpty(jTablePara.Buyer) || a.Buyer.ToLower().Equals(jTablePara.Buyer.ToLower()))
                        && (string.IsNullOrEmpty(jTablePara.TicketCode) || a.TicketCode.ToLower().Contains(jTablePara.TicketCode.ToLower()))
                        && (fromDate == null || (a.BuyTime <= toDate))
                        && (toDate == null || (a.BuyTime >= fromDate))
                         select new
                         {
                             a.ID,
                             a.TicketCode,
                             a.Title,
                             Status = a.Status,
                             a.TotalMoney,
                             a.Note,
                             Buyer = c2.fullname,
                             a.Location,
                             a.BuyTime,
                             Depart = d2.Title,
                             Currency = a.Currency != null ? f2.ValueSet : "",
                         }).AsParallel();
            int count = query.Count();
            var data = query.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length);
            var jdata = JTableHelper.JObjectTable(data.ToList(), jTablePara.Draw, count, "ID", "Status", "TicketCode", "TotalMoney", "Title", "Note", "Buyer", "Location", "BuyTime", "Depart", "Currency");
            return Json(jdata);

        }
        //combobox
        public JsonResult GenReqCode()
        {
            var monthNow = DateTime.Now.Month;
            var yearNow = DateTime.Now.Year;
            var reqCode = string.Empty;
            var no = 1;
            var noText = "01";
            var data = _context.AssetBuyHeaders.Where(x => x.CreatedTime.Value.Year == yearNow && x.CreatedTime.Value.Month == monthNow).ToList();
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

            reqCode = string.Format("{0}{1}{2}{3}", "AB_", "T" + monthNow + ".", yearNow + "_", noText);

            return Json(reqCode);
        }
        [HttpPost]
        public object GetStatus()
        {
            var data = _context.CommonSettings.Where(x => x.Group == "ASSET_URENCO").OrderBy(x => x.Priority).Select(x => new { Code = x.CodeSet, Name = x.ValueSet, Icon = x.Logo }).ToList();
            return data;
        }

        public object GetBuyer(string unit)
        {
            if (!string.IsNullOrEmpty(unit))
            {
                var data = _context.HREmployees.Where(x => x.flag.Value == 1 && x.unit == unit).Select(x => new { Code = x.Id.ToString(), Name = x.fullname }).ToList();
                return data;
            }
            else
            {
                var data = _context.HREmployees.Where(x => x.flag.Value == 1).Select(x => new { Code = x.Id.ToString(), Name = x.fullname }).ToList();
                return data;
            }

        }
        public object GetAllBuyer()
        {
            var data = _context.HREmployees.Where(x => x.flag.Value == 1).Select(x => new { Code = x.Id.ToString(), Name = x.fullname }).ToList();
            return data;
        }
        public object GetDepart()
        {
            var data = _context.AdDepartments.Where(x => !x.IsDeleted && x.IsEnabled).Select(x => new { Code = x.DepartmentCode, Name = x.Title }).ToList();
            return data;
        }
        [HttpPost]
        public JsonResult GetBranch()
        {
            var data = _context.AdOrganizations.Where(x => x.IsEnabled).Select(x => new { Code = x.OrgAddonCode, Name = x.OrgName });
            return Json(data);
        }
        [HttpPost]
        public object GetCatObjActivity()
        {
            var check = (from a in _context.AssetBuyHeaders
                         join b in _context.CatWorkFlows on a.ObjActCode equals b.WorkFlowCode
                         select new
                         {
                             Code = a.ObjActCode,
                             CatName = b.Name
                         }).Distinct().ToList();

            if (check.Count > 0)
            {
                return check;
            }
            else
            {
                var data = _context.CatWorkFlows.Where(x => x.IsDeleted == false).OrderBy(x => x.Name).ThenBy(x => x.WorkFlowCode).Select(x => new { Code = x.WorkFlowCode, CatName = x.Name }).ToList();
                return data;
            }
        }
        public object GetCatAct()
        {
            var data = _context.CatActivitys.Where(x => x.IsDeleted == false).Select(x => new { Code = x.ActCode, Name = x.ActName, Group = x.ActGroup, Type = x.ActType }).ToList();
            return data;
        }
        public object GetCurrency()
        {
            var data = _context.CommonSettings.Where(x => x.IsDeleted == false && x.Group == "CURRENCY_TYPE").Select(x => new { Code = x.CodeSet, Name = x.ValueSet }).ToList();
            return data;
        }
        //insert ticket
        [HttpPost]
        public JsonResult Insert([FromBody]INSERTModel obj)
        {
            var msg = new JMessage { Title = "", Error = false };
            try
            {
                DateTime? buytime = !string.IsNullOrEmpty(obj.BuyTime) ? DateTime.ParseExact(obj.BuyTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                String actCode = EnumHelper<LogActivity>.GetDisplayValue(LogActivity.ActivityCreate);
                var data = _context.AssetBuyHeaders.FirstOrDefault(x => x.TicketCode == obj.TicketCode && x.IsDeleted == false);
                if (data == null)
                {
                    var dt = new AssetBuyHeader();
                    dt.ID = obj.ID;
                    dt.ObjActCode = obj.ObjActCode;
                    dt.Buyer = obj.Buyer;
                    dt.TotalMoney = obj.TotalMoney;
                    dt.Branch = obj.Branch;
                    dt.TicketCode = obj.TicketCode;
                    dt.Title = obj.Title;
                    dt.Depart = obj.Depart;
                    dt.Location = obj.Location;
                    dt.Note = obj.Note;
                    dt.BuyTime = buytime;
                    dt.CreatedBy = ESEIM.AppContext.UserName;
                    dt.CreatedTime = DateTime.Now;
                    dt.Currency = obj.Currency;

                    dt.WorkflowCat = obj.WorkflowCat;

                    dt.Status = "";

                    InsertLogDataAuto(actCode, dt);
                    _context.AssetBuyHeaders.Add(dt);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizer["ASSET_BUY_MSG_INSERT_SUCCESS"];
                    msg.ID = dt.ID;

                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_MSG_EXITS"], _stringLocalizer["ASSET_BUY_TICKET_CODE"]);
                }
            }
            catch (Exception)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }
        //edit
        public object GetItem(int Id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            var data = _context.AssetBuyHeaders.FirstOrDefault(x => x.ID == Id);
            if (data != null)
            {
                var session = HttpContext.Session;
                session.SetInt32("IdObject", Id);
                data.sStartTime = data.BuyTime.HasValue ? data.BuyTime.Value.ToString("dd/MM/yyyy") : null;
                // data.sReceivedTime = data.ReceivedTime.HasValue ? data.ReceivedTime.Value.ToString("dd/mm/yyyy") : null;
                msg.Object = data;
            }
            return Json(msg);
        }
        public JsonResult Update([FromBody] INSERTModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                DateTime? buytime = !string.IsNullOrEmpty(obj.BuyTime) ? DateTime.ParseExact(obj.BuyTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                string actCode = EnumHelper<LogActivity>.GetDisplayValue(LogActivity.ActivityUpdate);

                var data = _context.AssetBuyHeaders.FirstOrDefault(x => x.ID == obj.ID);
                data.ObjActCode = obj.ObjActCode;
                data.ID = obj.ID;
                data.Buyer = obj.Buyer;
                data.Branch = obj.Branch;
                data.TotalMoney = obj.TotalMoney;
                data.Title = obj.Title;
                data.Depart = obj.Depart;
                data.Location = obj.Location;
                data.Note = obj.Note;
                data.CreatedBy = ESEIM.AppContext.UserName;
                data.BuyTime = buytime;
                data.Currency = obj.Currency;
                data.Note = obj.Note;
                data.UpdatedTime = DateTime.Now.Date;
                data.UpdatedBy = ESEIM.AppContext.UserName;
                InsertLogDataAuto(actCode, data);

                //Work flow update status
                var session = HttpContext.GetSessionUser();
                data.JsonData = CommonUtil.JsonData(data, obj, data.JsonData, session.FullName);
                _context.AssetBuyHeaders.Update(data);
                _context.SaveChanges();
                msg.Title = String.Format(_sharedResources["COM_UPDATE_SUCCESS"], _stringLocalizer["ASSET_BUY_TICKET_CODE"]);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                // msg.Title = "Có lỗi khi cập nhật phiếu mua tài sản";
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }

            return Json(msg);
        }
        //delete
        public JsonResult Delete(int Id)
        {
            var actCode = EnumHelper<LogActivity>.GetDisplayValue(LogActivity.ActivityDelete);

            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.AssetBuyHeaders.FirstOrDefault(x => x.ID == Id);
                data.DeletedTime = DateTime.Now.Date;
                data.DeletedBy = ESEIM.AppContext.UserName;
                data.IsDeleted = true;
                InsertLogDataAuto(actCode, data);
                _context.AssetBuyHeaders.Update(data);
                _context.SaveChanges();
                //msg.Title = "Xóa phiếu mua tài sản thành công!";
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer["ASSET_BUY_TICKET_CODE"]);
            }
            catch (Exception)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi xảy ra khi xóa!";
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }
        //upfile
        public JsonResult GenReqfile()
        {
            var monthNow = DateTime.Now.Month;
            var yearNow = DateTime.Now.Year;
            var reqCode = string.Empty;
            var no = 1;
            var noText = "01";
            var data = _context.EDMSFiles.Where(x => x.CreatedTime.Value.Year == yearNow && x.CreatedTime.Value.Month == monthNow).ToList();
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

            reqCode = string.Format("{0}{1}{2}{3}", "ABF_", "T" + monthNow + ".", yearNow + "_", noText);

            return Json(reqCode);
        }
        [HttpPost]
        public object GetListFile(string code)
        {
            var data = from a in _context.AssetBuyFiles
                       join b in _context.EDMSFiles on a.FileCode equals b.FileCode into b1
                       from c in b1.DefaultIfEmpty()
                       where (!c.IsDeleted && a.TicketCode.Equals(code))
                       select new
                       {
                           Id = a.ID,
                           Name = c.FileName,
                           Code = c.FileCode
                       };
            return data;
        }
        [HttpPost]
        [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
        [RequestSizeLimit(long.MaxValue)]
        public JsonResult UploadFile(AssetRqFile obj, IFormFile fileUpload)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {


                var upload = _upload.UploadFile(fileUpload, Path.Combine(_hostingEnvironment.WebRootPath, "uploads\\files"));
                if (upload.Error)
                {
                    msg.Error = true;
                    // Tair tep tin looix
                    msg.Title = _sharedResources["COM_ERR_UPLOAD_FILE"];
                }
                else
                {
                    var file = new AssetBuyFile
                    {
                        FileName = obj.FileName,
                        FileCode = obj.FileCode,
                        TicketCode = obj.TicketCode,
                    };
                    var file2 = new EDMSFile()
                    {
                        FileName = obj.FileName,
                        FileCode = obj.FileCode,
                        FileTypePhysic = Path.GetExtension(fileUpload.FileName),
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now,
                        Url = "/uploads/files/" + upload.Object.ToString(),

                    };
                    _context.AssetBuyFiles.Add(file);
                    _context.EDMSFiles.Add(file2);
                    _context.SaveChanges();
                    //Tai tepp thanh cong
                    //msg.Title = String.Format(CommonUtil.ResourceValue("MLP_MSG_FILE"), CommonUtil.ResourceValue("MLP_MSG_FILE_SUCCESS"));
                    msg.Title = String.Format(_sharedResources["COM_MSG_SUCCES"], _sharedResources["COM_UPLOAD"]);
                }
            }

            catch (Exception ex)
            {
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Error = true;
            }
            return Json(msg);
        }
        [HttpPost]
        public async Task<JsonResult> DeleteFile(int id)
        {
            var mess = new JMessage { Error = false, Title = "" };
            try
            {
                var file = await _context.AssetBuyFiles.FirstOrDefaultAsync(x => x.ID == id);
                var edmsFile = _context.EDMSFiles.FirstOrDefault(x => x.FileCode.Equals(file.FileCode));
                _context.EDMSFiles.Remove(edmsFile);
                _context.AssetBuyFiles.Remove(file);
                _context.SaveChanges();
                //mess.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_SUCCESS"), CommonUtil.ResourceValue("MLP_FILE"));
                mess.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _sharedResources["COM_FILE"]);

            }
            catch (Exception ex)
            {
                //mess.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_FAIL"), CommonUtil.ResourceValue("MLP_FILE"));
                mess.Title = _sharedResources["COM_DELETE_FAIL"];

                mess.Error = true;
            }
            return Json(mess);
        }

        //logdata and autologdata
        [HttpPost]
        public JsonResult InsertLog([FromBody]ActivityLogDatamodel obj)
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
                if (obj.ObjActCode != null && obj.TicketCode != null)
                {

                    var dt = new ActivityLogData();
                    dt.WorkFlowCode = obj.ObjActCode;
                    dt.ObjCode = obj.TicketCode;
                    dt.ActCode = obj.ActCode;
                    dt.CreatedBy = ESEIM.AppContext.UserName;
                    dt.CreatedTime = DateTime.Now;
                    dt.ActType = actType;

                    _context.ActivityLogDatas.Add(dt);
                    _context.SaveChanges();
                    // msg.Title = "Chọn hoạt động thành công";
                    //msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_ADD_SUCCESS"), CommonUtil.ResourceValue(_stringLocalizer["ASSET_BUY_ACT"]));
                    msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["ASSET_BUY_ACT"]);
                }
                else
                {
                    msg.Error = true;
                    //  msg.Title = "Vui lòng nhập đầy đủ thông tin";
                    msg.Title = _sharedResources["COM_MSG_INFOMATION"];
                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                // msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_ADD_FAILED")/*, CommonUtil.ResourceValue("DCD_MSG_TITLE_DCD")*/);
                // msg.Title = "Có lỗi xảy ra";
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
        public JsonResult Insertdata([FromBody]ActivityAttrData obj)
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
                    // msg.Title = "Thêm thuộc tính thành công";
                    //msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_ADD_SUCCESS"), CommonUtil.ResourceValue(_stringLocalizer["ASSET_BUY_ATTR"]));
                    msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["ASSET_BUY_ATTR"]);

                }
                else
                {
                    msg.Error = true;
                    // msg.Title = "Có lỗi xảy ra";
                    msg.Title = _sharedResources["COM_MSG_ERR"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                // msg.Title = "Có lỗi xảy ra";
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
                //msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_SUCCESS"), CommonUtil.ResourceValue(_stringLocalizer["ASSET_BUY_ATTR"]));
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer["ASSET_BUY_ATTR"]);
            }
            else
            {
                msg.Error = true;
                // msg.Title = "Không tìm thấy phần tử cần xóa";
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }
        public void InsertLogDataAuto(string actCode, AssetBuyHeader obj)
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
                //msg.Title = " Xóa thành công";
                msg.Title = _sharedResources["COM_MSG_DELETE_SUCCESS"];
            }
            else
            {
                msg.Error = true;
                //msg.Title = "Xóa thất bại";
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public object JTableActivity([FromBody]JTableActivityModel jTablePara)
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
        #endregion

        #region Asset
        //table
        [HttpPost]
        public object JTableADD([FromBody] JTableModelAsset jTablePara)
        {

            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            if (jTablePara.TicketCode == null)
            {
                var list = new List<object>();
                return JTableHelper.JObjectTable(list, jTablePara.Draw, 0, "AssetName", "ID", "Quantity", "StatusAsset", "AssetType", "Property", "Note");
            }

            var query = (from a in _context.AssetBuyDetails.Where(x => !x.IsDeleted)
                         join c in _context.AssetMains.Where(x => !x.IsDeleted) on a.AssetCode equals c.AssetCode
                         join f in _context.Suppliers.Where(x => !x.IsDeleted) on a.Supplier equals f.SupCode into f1
                         from f2 in f1.DefaultIfEmpty()
                         join e in _context.CommonSettings.Where(x => !x.IsDeleted) on a.StatusAsset equals e.CodeSet into e1
                         from e2 in e1.DefaultIfEmpty()
                         join d in _context.AssetTypes.Where(x => !x.IsDeleted) on a.AssetType equals d.CatCode into d1
                         from d2 in d1.DefaultIfEmpty()
                         where (a.TicketCode.Equals(jTablePara.TicketCode))//&& a.Ticketcode.Equals(jTablePara.Ticketcode)
                         select new
                         {
                             a.ID,
                             a.Quantity,
                             StatusAsset = e2.ValueSet,
                             a.Note,
                             c.AssetName,
                             AssetType = d2.CatName,
                             Supplier = f2.SupName,
                             a.CostValue,
                             Currency = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(a.CurrencyAsset)).ValueSet
                         });
            int count = query.Count();
            var data = query.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length);
            var jdata = JTableHelper.JObjectTable(data.ToList(), jTablePara.Draw, count, "AssetName", "ID", "Quantity", "StatusAsset", "Note", "AssetType", "CostValue", "Currency", "Supplier");
            return Json(jdata);
        }

        [HttpPost]
        public JsonResult GetAsset(string ticketCode)
        {
            var query = (from a in _context.AssetBuyDetails.Where(x => !x.IsDeleted)
                     join c in _context.AssetMains.Where(x => !x.IsDeleted) on a.AssetCode equals c.AssetCode
                     join f in _context.Suppliers.Where(x => !x.IsDeleted) on a.Supplier equals f.SupCode into f1
                     from f2 in f1.DefaultIfEmpty()
                     join e in _context.CommonSettings.Where(x => !x.IsDeleted) on a.StatusAsset equals e.CodeSet into e1
                     from e2 in e1.DefaultIfEmpty()
                     join d in _context.AssetTypes.Where(x => !x.IsDeleted) on a.AssetType equals d.CatCode into d1
                     from d2 in d1.DefaultIfEmpty()
                     where (a.TicketCode.Equals(ticketCode))
                     select new
                     {
                         a.ID,
                         a.Quantity,
                         StatusAsset = e2.ValueSet,
                         a.Note,
                         c.AssetName,
                         AssetType = d2.CatName,
                         Supplier = f2.SupName,
                         a.CostValue,
                         Currency = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(a.CurrencyAsset)).ValueSet
                     });
            return Json(query);
        }

        //combobox 
        [HttpPost]
        public object GetAssset()
        {
            var data = _context.AssetMains.Where(x => !x.IsDeleted).Select(x => new { Code = x.AssetCode, Name = x.AssetName, AssetStatus = x.Status }).ToList();
            return data;
        }
        [HttpPost]
        public object GetStatusAsset()
        {
            var data = _context.CommonSettings.Where(x => x.Group == "SERVICE_STATUS").Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return data;
        }
        public object GetAssetType()
        {
            var data = _context.AssetTypes.Where(x => !x.IsDeleted).Select(x => new { Code = x.CatCode, Name = x.CatName }).ToList();
            return data;
        }
        [HttpPost]
        public object GetSupp()
        {
            var data = _context.Suppliers.Where(x => x.IsDeleted == false).Select(x => new { Code = x.SupCode, Name = x.SupName });
            return data;
        }
        //inset
        [HttpPost]
        public JsonResult InsertAsset([FromBody]AssetBuyDetailsModel obj)
        {
            var msg = new JMessage { Title = "", Error = false };
            try
            {

                var checkexist = _context.AssetBuyHeaders.FirstOrDefault(x => x.TicketCode.Equals(obj.TicketCode) && x.IsDeleted == false);
                if (checkexist == null)
                {
                    msg.Error = true;
                    //msg.Title = "lưu trước khi thêm";
                    msg.Title = _stringLocalizer["ASSET_BUY_MSG_SAVE_INSERT"];

                }
                else
                {
                    var data = _context.AssetBuyDetails.FirstOrDefault(x => x.TicketCode.Equals(obj.TicketCode) && x.AssetCode.Equals(obj.AssetCode) && x.IsDeleted == false);

                    if (data == null)
                    {
                        var dt = new AssetBuyDetail()
                        {
                            Supplier = obj.Supplier,
                            AssetType = obj.AssetType,
                            TicketCode = obj.TicketCode,
                            AssetCode = obj.AssetCode,
                            Quantity = obj.Quantity,
                            StatusAsset = obj.StatusAsset,
                            CostValue = obj.CostValue,
                            Note = obj.Note,
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now,
                            CurrencyAsset = obj.CurrencyAsset
                        };
                        _context.AssetBuyDetails.Add(dt);
                        _context.SaveChanges();
                        //msg.Title = "Thêm tài sản thành công";
                        //msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_ADD_SUCCESS"), CommonUtil.ResourceValue(_stringLocalizer["ASSET_BUY_ASSET"]));
                        msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["ASSET_BUY_ASSET"]);
                    }
                    else
                    {
                        msg.Error = true;
                        // msg.Title = "Tài sản đã tồn tại";
                        //msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_EXITS"), CommonUtil.ResourceValue(_stringLocalizer["ASSET_BUY_ASSET"]));
                        msg.Title = String.Format(_sharedResources["COM_MSG_EXITS"], _stringLocalizer["ASSET_BUY_ASSET"]);

                        return Json(msg);

                    }

                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                // msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_ADD_FAILED")/*, CommonUtil.ResourceValue("DCD_MSG_TITLE_DCD")*/);
                // msg.Title = "Có lỗi xảy ra";
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }
        //delete
        public JsonResult Deleteasset(int Id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var datadetail = _context.AssetBuyDetails.FirstOrDefault(x => x.ID == Id);
                datadetail.DeletedTime = DateTime.Now.Date;
                datadetail.DeletedBy = ESEIM.AppContext.UserName;
                datadetail.IsDeleted = true;

                _context.AssetBuyDetails.Update(datadetail);
                _context.SaveChanges();
                // msg.Title = "Xóa tài sản thành công!";
                //msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_SUCCESS"), CommonUtil.ResourceValue(_stringLocalizer["ASSET_BUY_ASSET"]));
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer["ASSET_BUY_ASSET"]);

            }
            catch (Exception)
            {
                msg.Error = true;
                // msg.Title = "Có lỗi xảy ra khi xóa!";
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        #endregion

        #region File

        [HttpPost]
        public object JTableFile([FromBody]JTableModelFile jTablePara)
        {
            if (string.IsNullOrEmpty(jTablePara.AssetCode))
            {
                return JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "Id", "FileName", "FileTypePhysic", "Desc", "Url", "CreatedTime", "UpdatedTime", "ReposName", "TypeFile");
            }
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var query = ((from a in _context.EDMSRepoCatFiles.Where(x => x.ObjectCode == jTablePara.AssetCode && x.ObjectType == EnumHelper<ObjectType>.GetDisplayValue(ObjectType.AssetBuy))
                          join b in _context.EDMSFiles.Where(x => !x.IsDeleted && x.IsFileMaster == null || x.IsFileMaster == true) on a.FileCode equals b.FileCode
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
                              b.IsFileMaster,
                              b.EditedFileBy,
                              b.EditedFileTime,
                              b.FileID,
                          }).Union(
                  from a in _context.EDMSObjectShareFiles.Where(x => x.ObjectCode == jTablePara.AssetCode && x.ObjectType == EnumHelper<AssetEnum>.GetDisplayValue(AssetEnum.Asset))
                  join b in _context.EDMSFiles.Where(x => !x.IsDeleted && x.IsFileMaster == null || x.IsFileMaster == true) on a.FileCode equals b.FileCode
                  join f in _context.EDMSRepositorys on b.ReposCode equals f.ReposCode into f1
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
                      b.IsFileMaster,
                      b.EditedFileBy,
                      b.EditedFileTime,
                      b.FileID,
                  })).AsNoTracking();
            int count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "FileCode", "FileName", "FileTypePhysic", "Desc", "CreatedTime", "CloudFileId", "ReposName", "TypeFile", "IsFileMaster", "EditedFileBy", "EditedFileTime", "FileID");
            return jdata;
        }

        [HttpPost]
        public object JTableFileHistory([FromBody]JTableModelFile jTablePara)
        {
            if (string.IsNullOrEmpty(jTablePara.AssetCode) || jTablePara.FileID == null)
            {
                return JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "Id", "FileName", "FileTypePhysic", "Desc", "Url", "CreatedTime", "UpdatedTime", "ReposName", "TypeFile", "IsFileMaster", "EditedFileBy", "EditedFileTime", "FileID");
            }
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var query = (from a in _context.EDMSRepoCatFiles.Where(x => x.ObjectCode == jTablePara.AssetCode && x.ObjectType == EnumHelper<AssetEnum>.GetDisplayValue(AssetEnum.Asset))
                         join b in _context.EDMSFiles.Where(x => !x.IsDeleted && x.FileParentId.Equals(jTablePara.FileID) && (x.IsFileMaster == null || x.IsFileMaster == false)) on a.FileCode equals b.FileCode
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
                             b.IsFileMaster,
                             EditedFileBy = _context.Users.FirstOrDefault(x => x.UserName.Equals(b.EditedFileBy)) != null ? _context.Users.FirstOrDefault(x => x.UserName.Equals(b.EditedFileBy)).GivenName : "",
                             b.EditedFileTime,
                         }).AsNoTracking();
            int count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "FileCode", "FileName", "FileTypePhysic", "Desc", "CreatedTime", "CloudFileId", "ReposName", "TypeFile", "IsFileMaster", "EditedFileBy", "EditedFileTime");
            return jdata;
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
                        //var suggesstion = GetSuggestionsAssetFile(obj.AssetCode);
                        //if (suggesstion != null)
                        //{
                        //    reposCode = suggesstion.ReposCode;
                        //    path = suggesstion.Path;
                        //    folderId = suggesstion.FolderId;
                        //    catCode = suggesstion.CatCode;
                        //}
                        //else
                        //{
                        //    msg.Error = true;
                        //    msg.Title = _stringLocalizerCus["CUS_TITLE_ENTER_EXPEND"];
                        //    return Json(msg);
                        //}

                        var repoDefault = _context.EDMSRepoDefaultObjects.FirstOrDefault(x => !x.IsDeleted
                               && x.ObjectCode.Equals(obj.AssetCode) && x.ObjectType.Equals(EnumHelper<ObjectType>.GetDisplayValue(ObjectType.AssetBuy)));
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
                        FileCode = string.Concat("ASSET", Guid.NewGuid().ToString()),
                        ReposCode = reposCode,
                        CatCode = catCode,
                        ObjectCode = obj.AssetCode,
                        ObjectType = EnumHelper<AssetEnum>.GetDisplayValue(AssetEnum.Asset),
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

        [HttpGet]
        public JsonResult GetTotalMoney(string ticketCode)
        {
            decimal totalMoney = 0;
            var data = _context.AssetBuyDetails.Where(x => !x.IsDeleted && x.TicketCode.Equals(ticketCode));
            if (data.Any())
            {
                totalMoney = data.Sum(x => Convert.ToDecimal(x.CostValue));
            }
            return Json(totalMoney);
        }

        #endregion

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_stringLocalizerCus.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_inventoryController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_contractController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerFile.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_workflowActivityController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_repoController.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion

        #region Workflow
        [HttpPost]
        public JsonResult GetLogStatus(string code)
        {
            var project = _context.AssetBuyHeaders.FirstOrDefault(x => x.TicketCode.Equals(code) && !x.IsDeleted);
            return Json(project);
        }

        [HttpPost]
        public object GetItemHeaderWithCode(string code)
        {
            List<ComboxModel> list = new List<ComboxModel>();
            var data = _context.AssetBuyHeaders.FirstOrDefault(x => x.TicketCode.Equals(code) && !x.IsDeleted);
            var check = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value && x.ObjectInst.Equals(data.TicketCode)
                && x.ObjectType.Equals("ASSET_BUY"));
            if(check != null)
            {
                var value = _context.ActivityInstances.Where(x => !x.IsDeleted && x.WorkflowCode.Equals(check.WfInstCode));
                var current = check.MarkActCurrent;
                var initial = value.FirstOrDefault(x => !x.IsDeleted && x.Type.Equals("TYPE_ACTIVITY_INITIAL"));
                var name = new ComboxModel
                {
                    IntsCode = initial.ActivityInstCode,
                    Code = initial.ActivityCode,
                    Name = initial.Title,
                    Status = initial.Status,
                    UpdateBy = _context.ActivityInstances.FirstOrDefault(a => !a.IsDeleted && a.WorkflowCode.Equals(check.WfInstCode) && a.ActivityInstCode.Equals(initial.ActivityInstCode)).UpdatedBy != null ?
                               _context.Users.FirstOrDefault(x => x.UserName.Equals(_context.ActivityInstances.FirstOrDefault(a => !a.IsDeleted && a.WorkflowCode.Equals(check.WfInstCode) && a.ActivityInstCode.Equals(initial.ActivityInstCode)).UpdatedBy)).GivenName : null,
                    UpdateTime = _context.ActivityInstances.FirstOrDefault(x => !x.IsDeleted && x.WorkflowCode.Equals(check.WfInstCode) && x.ActivityInstCode.Equals(initial.ActivityInstCode)).UpdatedTime.ToString()
                };
                list.Add(name);
                var location = _context.WorkflowSettings.FirstOrDefault(x => !x.IsDeleted && x.ActivityInitial.Equals(initial.ActivityCode));
                var next = location.ActivityDestination;
                var count = 1;
                foreach (var item in value)
                {
                    var inti = value.FirstOrDefault(x => !x.IsDeleted && x.ActivityCode.Equals(next));
                    if (inti != null && count < value.Count())
                    {
                        var name2 = new ComboxModel
                        {
                            IntsCode = inti.ActivityInstCode,
                            Code = inti.ActivityCode,
                            Name = inti.Title,
                            Status = inti.Status,
                            UpdateBy = _context.ActivityInstances.FirstOrDefault(a => !a.IsDeleted && a.WorkflowCode.Equals(check.WfInstCode) && a.ActivityInstCode.Equals(inti.ActivityInstCode)).UpdatedBy != null ?
                               _context.Users.FirstOrDefault(x => x.UserName.Equals(_context.ActivityInstances.FirstOrDefault(a => !a.IsDeleted && a.WorkflowCode.Equals(check.WfInstCode) && a.ActivityInstCode.Equals(inti.ActivityInstCode)).UpdatedBy)).GivenName : null,
                            UpdateTime = _context.ActivityInstances.FirstOrDefault(x => !x.IsDeleted && x.WorkflowCode.Equals(check.WfInstCode) && x.ActivityInstCode.Equals(inti.ActivityInstCode)).UpdatedTime.ToString()
                        };
                        list.Add(name2);
                        var location2 = _context.WorkflowSettings.FirstOrDefault(x => !x.IsDeleted && x.ActivityInitial.Equals(inti.ActivityCode));
                        if (location2 != null)
                        {
                            next = location2.ActivityDestination;
                        }
                    }
                    count++;
                }
                var role = value.FirstOrDefault(x => x.ActivityInstCode.Equals(check.MarkActCurrent)).ActivityCode;
                var user = _context.ExcuterControlRoles.FirstOrDefault(x => !x.IsDeleted && x.ActivityCode.Equals(role) && x.UserId.Equals(ESEIM.AppContext.UserId));
                var hh = "";
                if (value.FirstOrDefault(x => !x.Status.Equals("STATUS_ACTIVITY_APPROVED") && x.Type.Equals("TYPE_ACTIVITY_INITIAL")) != null)
                {
                    hh = "TYPE_ACTIVITY_INITIAL";
                }
                else if (value.FirstOrDefault(x => !x.Status.Equals("STATUS_ACTIVITY_APPROVED") && x.Type.Equals("TYPE_ACTIVITY_REPEAT")) != null)
                {
                    hh = "TYPE_ACTIVITY_REPEAT";
                }
                else if (value.FirstOrDefault(x => !x.Status.Equals("STATUS_ACTIVITY_APPROVED") && x.Type.Equals("TYPE_ACTIVITY_END")) != null)
                {
                    hh = "TYPE_ACTIVITY_END";
                }
                if (user != null)
                {
                    if (hh.Equals("TYPE_ACTIVITY_INITIAL"))
                    {
                        var com = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.StatusActWF)))
                           .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                        return new { data, com, editrole = true, list, current };

                    }
                    if (hh.Equals("TYPE_ACTIVITY_REPEAT"))
                    {
                        var com = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.StatusActWFREPEAT)))
                           .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                        return new { data, com, editrole = true, list, current };
                    }
                    if (hh.Equals("TYPE_ACTIVITY_END"))
                    {
                        var com = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.StatusActWFFINAL)))
                           .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                        return new { data, com, editrole = true, list, current };
                    }
                    else { return data; }
                }
                else
                {
                    if (hh.Equals("TYPE_ACTIVITY_INITIAL"))
                    {
                        var com = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.StatusActWF)))
                           .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                        return new { data, com, editrole = false, list, current };
                    }
                    if (hh.Equals("TYPE_ACTIVITY_REPEAT"))
                    {
                        var com = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.StatusActWFREPEAT)))
                           .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                        return new { data, com, editrole = false, list, current };
                    }
                    if (hh.Equals("TYPE_ACTIVITY_END"))
                    {
                        var com = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.StatusActWFFINAL)))
                           .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                        return new { data, com, editrole = false, list, current };
                    }
                    else { return data; }
                }
            }
            else
            {
                return data;
            }
        }

        [HttpGet]
        public object GetActionStatus(string code)
        {
            var data = _context.AssetBuyHeaders.Where(x => !x.IsDeleted && x.TicketCode.Equals(code)).Select(x => new
            {
                x.Status
            });
            return data;
        }

        [HttpPost]
        public object GetStepWorkFlow(string code)
        {
            List<ComboxModel> list = new List<ComboxModel>();
            var value = _context.Activitys.Where(x => !x.IsDeleted && x.WorkflowCode.Equals(code));
            var initial = value.FirstOrDefault(x => !x.IsDeleted && x.Type.Equals("TYPE_ACTIVITY_INITIAL"));
            var name = new ComboxModel
            {
                Code = initial.ActivityCode,
                Name = initial.Title,
                Status = initial.Status,
            };
            list.Add(name);
            var location = _context.WorkflowSettings.FirstOrDefault(x => !x.IsDeleted && x.ActivityInitial.Equals(initial.ActivityCode));
            if (location != null)
            {
                var next = location.ActivityDestination;
                var count = 1;
                foreach (var item in value)
                {
                    var inti = value.FirstOrDefault(x => !x.IsDeleted && x.ActivityCode.Equals(next));
                    if (inti != null && count < value.Count())
                    {
                        var name2 = new ComboxModel
                        {
                            Code = inti.ActivityCode,
                            Name = inti.Title,
                            Status = inti.Status,
                        };
                        list.Add(name2);
                        var location2 = _context.WorkflowSettings.FirstOrDefault(x => !x.IsDeleted && x.ActivityInitial.Equals(inti.ActivityCode));
                        if (location2 != null)
                        {
                            next = location2.ActivityDestination;
                        }
                    }
                    count++;
                }
                return new { list };
            }
            else
            {
                return new { list };
            }
        }

        [HttpPost]
        public object GetItemHeader(int id)
        {
            List<ComboxModel> list = new List<ComboxModel>();
            var data = _context.AssetBuyHeaders.FirstOrDefault(x => x.ID == id && !x.IsDeleted);
            var check = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value && x.ObjectInst.Equals(data.TicketCode)
                        && x.ObjectType.Equals("ASSET_BUY"));
            if(check != null)
            {
                var value = _context.ActivityInstances.Where(x => !x.IsDeleted && x.WorkflowCode.Equals(check.WfInstCode));
                var current = check.MarkActCurrent;
                var initial = value.FirstOrDefault(x => !x.IsDeleted && x.Type.Equals("TYPE_ACTIVITY_INITIAL"));
                var name = new ComboxModel
                {
                    IntsCode = initial.ActivityInstCode,
                    Code = initial.ActivityCode,
                    Name = initial.Title,
                    Status = initial.Status,
                    UpdateBy = _context.ActivityInstances.FirstOrDefault(a => !a.IsDeleted && a.WorkflowCode.Equals(check.WfInstCode) && a.ActivityInstCode.Equals(initial.ActivityInstCode)).UpdatedBy != null ?
                               _context.Users.FirstOrDefault(x => x.UserName.Equals(_context.ActivityInstances.FirstOrDefault(a => !a.IsDeleted && a.WorkflowCode.Equals(check.WfInstCode) && a.ActivityInstCode.Equals(initial.ActivityInstCode)).UpdatedBy)).GivenName : null,
                    UpdateTime = _context.ActivityInstances.FirstOrDefault(x => !x.IsDeleted && x.WorkflowCode.Equals(check.WfInstCode) && x.ActivityInstCode.Equals(initial.ActivityInstCode)).UpdatedTime.ToString()
                };
                list.Add(name);
                var location = _context.WorkflowSettings.FirstOrDefault(x => !x.IsDeleted && x.ActivityInitial.Equals(initial.ActivityCode));
                var next = location.ActivityDestination;
                var count = 1;
                foreach (var item in value)
                {
                    var inti = value.FirstOrDefault(x => !x.IsDeleted && x.ActivityCode.Equals(next));
                    if (inti != null && count < value.Count())
                    {
                        var name2 = new ComboxModel
                        {
                            IntsCode = inti.ActivityInstCode,
                            Code = inti.ActivityCode,
                            Name = inti.Title,
                            Status = inti.Status,
                            UpdateBy = _context.ActivityInstances.FirstOrDefault(a => !a.IsDeleted && a.WorkflowCode.Equals(check.WfInstCode) && a.ActivityInstCode.Equals(inti.ActivityInstCode)).UpdatedBy != null ?
                               _context.Users.FirstOrDefault(x => x.UserName.Equals(_context.ActivityInstances.FirstOrDefault(a => !a.IsDeleted && a.WorkflowCode.Equals(check.WfInstCode) && a.ActivityInstCode.Equals(inti.ActivityInstCode)).UpdatedBy)).GivenName : null,
                            UpdateTime = _context.ActivityInstances.FirstOrDefault(x => !x.IsDeleted && x.WorkflowCode.Equals(check.WfInstCode) && x.ActivityInstCode.Equals(inti.ActivityInstCode)).UpdatedTime.ToString()
                        };
                        list.Add(name2);
                        var location2 = _context.WorkflowSettings.FirstOrDefault(x => !x.IsDeleted && x.ActivityInitial.Equals(inti.ActivityCode));
                        if (location2 != null)
                        {
                            next = location2.ActivityDestination;
                        }
                    }
                    count++;
                }
                var role = value.FirstOrDefault(x => x.ActivityInstCode.Equals(check.MarkActCurrent)).ActivityCode;
                var user = _context.ExcuterControlRoles.FirstOrDefault(x => !x.IsDeleted && x.ActivityCode.Equals(role) && x.UserId.Equals(ESEIM.AppContext.UserId));
                var hh = "";
                if (value.FirstOrDefault(x => !x.Status.Equals("STATUS_ACTIVITY_APPROVED") && x.Type.Equals("TYPE_ACTIVITY_INITIAL")) != null)
                {
                    hh = "TYPE_ACTIVITY_INITIAL";
                }
                else if (value.FirstOrDefault(x => !x.Status.Equals("STATUS_ACTIVITY_APPROVED") && x.Type.Equals("TYPE_ACTIVITY_REPEAT")) != null)
                {
                    hh = "TYPE_ACTIVITY_REPEAT";
                }
                else if (value.FirstOrDefault(x => !x.Status.Equals("STATUS_ACTIVITY_APPROVED") && x.Type.Equals("TYPE_ACTIVITY_END")) != null)
                {
                    hh = "TYPE_ACTIVITY_END";
                }
                if (user != null)
                {
                    if (hh.Equals("TYPE_ACTIVITY_INITIAL"))
                    {
                        var com = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.StatusActWF)))
                           .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                        return new { data, com, editrole = true, list, current };

                    }
                    if (hh.Equals("TYPE_ACTIVITY_REPEAT"))
                    {
                        var com = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.StatusActWFREPEAT)))
                           .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                        return new { data, com, editrole = true, list, current };
                    }
                    if (hh.Equals("TYPE_ACTIVITY_END"))
                    {
                        var com = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.StatusActWFFINAL)))
                           .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                        return new { data, com, editrole = true, list, current };
                    }
                    else { return data; }
                }
                else
                {
                    if (hh.Equals("TYPE_ACTIVITY_INITIAL"))
                    {
                        var com = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.StatusActWF)))
                           .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                        return new { data, com, editrole = false, list, current };
                    }
                    if (hh.Equals("TYPE_ACTIVITY_REPEAT"))
                    {
                        var com = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.StatusActWFREPEAT)))
                           .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                        return new { data, com, editrole = false, list, current };
                    }
                    if (hh.Equals("TYPE_ACTIVITY_END"))
                    {
                        var com = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.StatusActWFFINAL)))
                           .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                        return new { data, com, editrole = false, list, current };
                    }
                    else { return data; }
                }
            }
            else
            {
                return data;
            }
        }

        [HttpPost]
        public object GetListRepeat(string code)
        {
            List<ComboxModel> list = new List<ComboxModel>();
            var data = _context.AssetBuyHeaders.FirstOrDefault(x => x.TicketCode.Equals(code) && !x.IsDeleted);
            var check = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value && x.ObjectInst.Equals(data.TicketCode) && x.ObjectType.Equals("ASSET_BUY"));
            var value = _context.ActivityInstances.Where(x => !x.IsDeleted && x.WorkflowCode.Equals(check.WfInstCode));
            var current = check.MarkActCurrent;
            var initial = value.FirstOrDefault(x => !x.IsDeleted && x.Type.Equals("TYPE_ACTIVITY_INITIAL"));
            var name = new ComboxModel
            {
                IntsCode = initial.ActivityInstCode,
                Code = initial.ActivityCode,
                Name = initial.Title,
                Status = initial.Status,
            };
            list.Add(name);
            var location = _context.WorkflowSettings.FirstOrDefault(x => !x.IsDeleted && x.ActivityInitial.Equals(initial.ActivityCode));
            var next = location.ActivityDestination;
            var count = 1;
            foreach (var item in value)
            {
                var inti = value.FirstOrDefault(x => !x.IsDeleted && x.ActivityCode.Equals(next));
                if (inti != null && count < value.Count())
                {
                    var name2 = new ComboxModel
                    {
                        IntsCode = inti.ActivityInstCode,
                        Code = inti.ActivityCode,
                        Name = inti.Title,
                        Status = inti.Status,
                    };
                    list.Add(name2);
                    var location2 = _context.WorkflowSettings.FirstOrDefault(x => !x.IsDeleted && x.ActivityInitial.Equals(inti.ActivityCode));
                    if (location2 != null)
                    {
                        next = location2.ActivityDestination;
                    }
                }
                count++;
            }
            return new { list, current };
        }

        public class ComboxModel
        {
            public string IntsCode { get; set; }
            public string Code { get; set; }
            public string Name { get; set; }
            public string Status { get; set; }
            public string UpdateTime { get; set; }
            public string UpdateBy { get; set; }
        }
        public class JsonCommand
        {
            public int Id { get; set; }
            public string CommandSymbol { get; set; }
            public string ConfirmedBy { get; set; }
            public string Confirmed { get; set; }
            public string ConfirmedTime { get; set; }
            public string Approved { get; set; }
            public string ApprovedBy { get; set; }
            public string ApprovedTime { get; set; }
            public string Message { get; set; }
            public string ActA { get; set; }
            public string ActB { get; set; }
            public bool IsLeader { get; set; }
        }
        #endregion

        public class AssetRqFile
        {
            public int ID { get; set; }

            public string FileCode { get; set; }

            public string TicketCode { get; set; }

            public string FileName { get; set; }

        }
        public class ActivityLogDatamodel
        {
            public int ID { get; set; }

            public string ObjActCode { get; set; }

            public string ObjCode { get; set; }

            public string ActCode { get; set; }
            public string TicketCode { get; set; }

        }
        public class JTableActivityModel : JTableModel
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
        public class AssetBuyDetailsModel
        {
            public int ID { get; set; }
            public string TicketCode { get; set; }

            public int Quantity { get; set; }
            public int CostValue { get; set; }

            public string AssetCode { get; set; }

            public string AssetType { get; set; }

            public string CreateBy { get; set; }

            public string CreateTime { get; set; }

            public string StatusAsset { get; set; }

            public string Supplier { get; set; }
            public string Note { get; set; }

            public bool IsDeleted { get; set; }

            public string DeleteTime { get; set; }

            public string CurrencyAsset { get; set; }

            public string DeleteBy { get; set; }

        }
        public class JTableModelFile : JTableModel
        {
            public string AssetCode { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string CatCode { get; set; }
            public int? FileID { get; set; }
        }
        public class JTableModelAsset : JTableModel
        {
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string TicketCode { get; set; }
            public string AssetCode { get; set; }
            public string AssetName { get; set; }
            public string StatusAsset { get; set; }
            public string CostValue { get; set; }
            public string Quantity { get; set; }
            public string AssetType { get; set; }
            public string Status { get; set; }
            public int ID { get; set; }
            public string Buyer { get; set; }
            public string Title { get; set; }
            public string Currency { get; set; }
            public string Depart { get; set; }
        }
        public class INSERTModel
        {
            public int ID { get; set; }
            public string TicketCode { get; set; }
            public string Buyer { get; set; }
            public string Title { get; set; }
            public string Branch { get; set; }
            public string Location { get; set; }
            public string BuyTime { get; set; }
            public int TotalMoney { get; set; }
            public string Currency { get; set; }
            public string Status { get; set; }
            public string Note { get; set; }
            public string Depart { get; set; }
            public bool IsDeleted { get; set; }
            public string ObjActCode { get; set; }
            public string WorkflowCat { get; set; }
            public string ActRepeat { get; set; }
        }
    }

}