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
    public class AssetInventoryController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<AssetInventoryController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IStringLocalizer<FilePluginController> _stringLocalizerFp;
        private readonly IStringLocalizer<CustomerController> _stringLocalizerCus;
        private readonly IStringLocalizer<FileObjectShareController> _stringLocalizerFile;
        private readonly IStringLocalizer<ContractController> _contractController;
        private readonly IStringLocalizer<WorkflowActivityController> _workflowActivityController;
        private readonly IStringLocalizer<EDMSRepositoryController> _edmsRepoLocalizer;
        private readonly IWorkflowService _workflowService;

        public AssetInventoryController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment, IStringLocalizer<ContractController> contractController,
            IStringLocalizer<FilePluginController> stringLocalizerFp,
            IStringLocalizer<CustomerController> stringLocalizerCus, IStringLocalizer<FileObjectShareController> stringLocalizerFile,
            IStringLocalizer<AssetInventoryController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources,
            IWorkflowService workflowService, IStringLocalizer<EDMSRepositoryController> edmsRepoLocalizer,
            IStringLocalizer<WorkflowActivityController> workflowActivityController)
        {
            _hostingEnvironment = hostingEnvironment;
            _upload = upload;
            _context = context;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
            _stringLocalizerCus = stringLocalizerCus;
            _stringLocalizerFp = stringLocalizerFp;
            _stringLocalizerFile = stringLocalizerFile;
            _contractController = contractController;
            _workflowService = workflowService;
            _edmsRepoLocalizer = edmsRepoLocalizer;
            _workflowActivityController = workflowActivityController;
        }
        [Breadcrumb("ViewData.CrumbAssetInventory", AreaName = "Admin", FromAction = "Index", FromController = typeof(AssetBuyerHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuAsset"] = _sharedResources["COM_CRUMB_ASSET_OPERATION"];
            ViewData["TitleAssetBuyerHome"] = _sharedResources["COM_CRUMB_ASSET_BUYER_HOME"];
            ViewData["CrumbAssetInventory"] = _sharedResources["COM_CRUMB_ASSET_INVENTORY"];
            return View();
        }

        #region Model
        public class JTableModelAct : JTableModel
        {
            public int AssetID { get; set; }
            public string TicketCode { get; set; }
            public string AssetName { get; set; }
            public string StatusAsset { get; set; }
            public int Quantity { get; set; }
            public string Note { get; set; }
            public string CreatedBy { get; set; }
            public string CreatedTime { get; set; }
            public string UpdatedBy { get; set; }
            public string UpdatedTime { get; set; }
            public string DeletedBy { get; set; }
            public string DeletedTime { get; set; }
            public bool IsDeleted { get; set; }

            public string FromDate { get; set; }
            public string ToDate { get; set; }

            public string Title { get; set; }
            public string Branch { get; set; }
            public string Person { get; set; }
            public string Status { get; set; }
            public string InventoryTime { get; set; }
            public string Adress { get; set; }
            public string ObjActCode { get; set; }

        }
        public class AssetInventoryHeadersJtableModel
        {
            public int AssetID { get; set; }
            public string TicketCode { get; set; }
            public string Title { get; set; }
            public string Branch { get; set; }
            public string Person { get; set; }
            public string Note { get; set; }
            public string Status { get; set; }
            public string CreatedBy { get; set; }
            public string CreatedTime { get; set; }
            public string UpdatedBy { get; set; }
            public string UpdatedTime { get; set; }
            public string DeletedBy { get; set; }
            public string DeletedTime { get; set; }
            public bool IsDeleted { get; set; }
            public string InventoryTime { get; set; }
            public string Adress { get; set; }
            public string ObjActCode { get; set; }
            public string WorkflowCat { get; set; }
            public string ActRepeat { get; set; }
        }
        public class AssetInventoryDetailsModel
        {
            public int AssetID { get; set; }
            public string TicketCode { get; set; }
            public string AssetName { get; set; }
            public string StatusAsset { get; set; }
            public int Quantity { get; set; }
            public string Note { get; set; }
            public string CreatedBy { get; set; }
            public string CreatedTime { get; set; }
            public string UpdatedBy { get; set; }
            public string UpdatedTime { get; set; }
            public string DeletedBy { get; set; }
            public string DeletedTime { get; set; }
            public bool IsDeleted { get; set; }
        }
        public class ActivityLogDataRes
        {
            public int ID { get; set; }
            public string ActCode { get; set; }
            public string ObjActCode { get; set; }
            public string Ticketcode { get; set; }
            public string ObjCode { get; set; }
            public string ActTime { get; set; }
            public decimal ActLocationGPS { get; set; }
            public string ActFromDevice { get; set; }
            public string ActType { get; set; }
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

        public class ObjUnitModel
        {
            public string WorkFlowCode { get; set; }
            public string ActCode { get; set; }
        }
        #endregion

        #region Index
        [HttpPost]
        public object GetStatus()
        {
            var data = _context.CommonSettings.Where(x => x.Group == "ASSET_URENCO").OrderBy(x => x.Priority).Select(x => new { Code = x.CodeSet, Name = x.ValueSet, Logo = x.Logo }).ToList();
            return data;
        }

        public JsonResult GetBranch()
        {
            var data = _context.AdOrganizations.Where(x => x.IsEnabled).Select(x => new { Code = x.OrgAddonCode, Name = x.OrgName });
            return Json(data);
        }

        public object GetPerson()
        {
            var data = _context.HREmployees.Where(x => x.flag.Value == 1).Select(x => new { Code = x.Id.ToString(), Name = x.fullname }).ToList();
            return data;
        }

        [HttpPost]
        public JsonResult GenReqCode()
        {
            var monthNow = DateTime.Now.Month;
            var yearNow = DateTime.Now.Year;
            var reqCode = string.Empty;
            var no = 1;
            var noText = "01";
            var data = _context.AssetInventoryHeaders.Where(x => x.CreatedTime.Value.Year == yearNow && x.CreatedTime.Value.Month == monthNow).ToList();
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
            reqCode = string.Format("{0}{1}{2}{3}", "AI_", "T" + monthNow + ".", yearNow + "_", noText);

            return Json(reqCode);
        }

        [HttpPost]
        public object GetItem(int Id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            var data = _context.AssetInventoryHeaders.FirstOrDefault(x => x.AssetID == Id);
            if (data != null)
            {
                var session = HttpContext.Session;
                session.SetInt32("IdObject", Id);
                data.sStartTime = data.InventoryTime.HasValue ? data.InventoryTime.Value.ToString("dd/MM/yyyy") : null;
                msg.Object = data;
            }
            return Json(msg);
        }

        [HttpPost]
        public object GetItemTemp(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var list = new List<ComboxModel>();
                var data = _context.AssetInventoryHeaders.FirstOrDefault(x => x.AssetID == id && !x.IsDeleted);
                if (data == null)
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["ASSET_INVENTORY_TICKET_NO_EXIST"];
                    return Json(msg);
                }

                var wf = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value && x.ObjectInst.Equals(data.TicketCode)
                            && x.ObjectType.Equals(EnumHelper<ObjectType>.GetDisplayValue(ObjectType.AssetInventory)));
                if (wf != null)
                {
                    var acts = _context.ActivityInstances.Where(x => !x.IsDeleted && x.WorkflowCode.Equals(wf.WfInstCode));

                    var actInitial = acts.FirstOrDefault(x => x.Type.Equals("TYPE_ACTIVITY_INITIAL"));

                    var nextAct = "";

                    if (actInitial != null)
                    {
                        var infoActInitial = new ComboxModel
                        {
                            IntsCode = actInitial.ActivityInstCode,
                            Code = actInitial.ActivityCode,
                            Name = actInitial.Title,
                            Status = actInitial.Status,
                            UpdateBy = !string.IsNullOrEmpty(actInitial.UpdatedBy) ? _context.Users.FirstOrDefault(x => x.UserName.Equals(actInitial.UpdatedBy)).GivenName ?? "" : "",
                            UpdateTime = actInitial.UpdatedTime.HasValue ? actInitial.UpdatedTime.ToString() : ""
                        };
                        list.Add(infoActInitial);
                        var running = _context.WorkflowInstanceRunnings.FirstOrDefault(x => !x.IsDeleted && x.ActivityInitial.Equals(actInitial.ActivityInstCode));
                        if (running != null)
                        {
                            nextAct = running.ActivityDestination;
                        }
                        foreach (var item in acts)
                        {
                            var act = acts.FirstOrDefault(x => x.ActivityInstCode.Equals(nextAct));

                            var info = new ComboxModel
                            {
                                IntsCode = act.ActivityInstCode,
                                Code = act.ActivityCode,
                                Name = act.Title,
                                Status = act.Status,
                                UpdateBy = !string.IsNullOrEmpty(act.UpdatedBy) ? _context.Users.FirstOrDefault(x => x.UserName.Equals(act.UpdatedBy)).GivenName ?? "" : "",
                                UpdateTime = act.UpdatedTime.HasValue ? act.UpdatedTime.ToString() : ""
                            };
                            list.Add(info);

                            var runningNext = _context.WorkflowInstanceRunnings.FirstOrDefault(x => !x.IsDeleted && x.ActivityInitial.Equals(act.ActivityInstCode));
                            if (runningNext != null)
                            {
                                nextAct = !string.IsNullOrEmpty(runningNext.ActivityDestination) ? runningNext.ActivityDestination : "";
                            }
                            else
                            {
                                nextAct = "";
                            }
                            if (string.IsNullOrEmpty(nextAct))
                                break;
                        }
                    }

                    var assign = _context.ExcuterControlRoleInsts.FirstOrDefault(x => !x.IsDeleted && x.ActivityCodeInst.Equals(wf.MarkActCurrent)
                                    && x.UserId.Equals(ESEIM.AppContext.UserId));
                    var actMark = acts.FirstOrDefault(x => x.ActivityInstCode.Equals(wf.MarkActCurrent));
                    var current = wf.MarkActCurrent;
                    if (actMark != null)
                    {
                        var session = HttpContext.GetSessionUser();
                        var permissionEdit = false;
                        if (assign != null || session.IsAllData)
                        {
                            permissionEdit = true;
                        }

                        if (actMark.Type.Equals("TYPE_ACTIVITY_INITIAL"))
                        {
                            var com = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.StatusActWF)))
                           .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                            msg.Object = new { data, com, editrole = permissionEdit, list, current };
                        }
                        else if (actMark.Type.Equals("TYPE_ACTIVITY_REPEAT"))
                        {
                            var com = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.StatusActWFREPEAT)))
                           .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                            msg.Object = new { data, com, editrole = permissionEdit, list, current };
                        }
                        else if (actMark.Type.Equals("TYPE_ACTIVITY_END"))
                        {
                            var com = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.StatusActWFFINAL)))
                           .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                            msg.Object = new { data, com, editrole = permissionEdit, list, current };
                        }
                    }
                }
                else
                {
                    msg.Object = new { data };
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        public object JTable([FromBody]JTableModelAct jTablePara)
        {
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var listCommon = _context.CommonSettings.Select(x => new { x.CodeSet, x.ValueSet });
            var query = (from a in _context.AssetInventoryHeaders
                         join c2 in _context.AdOrganizations.Where(x => x.IsEnabled) on a.Branch equals c2.OrgAddonCode into c1
                         from c in c1.DefaultIfEmpty()
                         join d in _context.HREmployees on a.Person equals d.Id.ToString() into d1
                         from d2 in d1.DefaultIfEmpty()
                         where (!a.IsDeleted)
                         //search
                           && (string.IsNullOrEmpty(jTablePara.Title) || a.Title.ToLower().Contains(jTablePara.Title.ToLower()))
                        && (string.IsNullOrEmpty(jTablePara.Branch) || a.Branch.ToLower().Contains(jTablePara.Branch.ToLower()))
                        && (string.IsNullOrEmpty(jTablePara.Person) || a.Person.ToLower().Equals(jTablePara.Person.ToLower()))
                        && (string.IsNullOrEmpty(jTablePara.TicketCode) || a.TicketCode.ToLower().Contains(jTablePara.TicketCode.ToLower()))
                        && (fromDate == null || (a.InventoryTime <= toDate))
                        && (toDate == null || (a.InventoryTime >= fromDate))
                         select new
                         {
                             a.AssetID,
                             a.TicketCode,
                             a.Title,
                             Branch = c != null ? c.OrgName : "Không xác định",
                             Person = d2.fullname,
                             a.Note,
                             Status = a.Status,
                             a.InventoryTime,
                             a.CreatedTime
                         }).AsParallel().OrderByDescending(x => x.CreatedTime);
            int count = query.Count();
            var data = query.AsQueryable().Skip(intBegin).Take(jTablePara.Length);
            var jdata = JTableHelper.JObjectTable(data.ToList(), jTablePara.Draw, count, "AssetID", "TicketCode", "Title", "Branch", "Person", "Note", "Status", "InventoryTime");
            return Json(jdata);
        }

        public JsonResult Insert([FromBody]AssetInventoryHeadersJtableModel obj)
        {
            var msg = new JMessage { Title = "", Error = false };
            String actCode = EnumHelper<LogActivity>.GetDisplayValue(LogActivity.ActivityCreate);
            try
            {
                DateTime? InventoryTime = !string.IsNullOrEmpty(obj.InventoryTime) ? DateTime.ParseExact(obj.InventoryTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var data = _context.AssetInventoryHeaders.FirstOrDefault(x => x.TicketCode == obj.TicketCode && x.IsDeleted == false);
                if (data == null)
                {
                    var dt = new AssetInventoryHeader();
                    dt.TicketCode = obj.TicketCode;
                    dt.Title = obj.Title;
                    dt.Branch = obj.Branch;
                    dt.Person = obj.Person;
                    dt.Note = obj.Note;
                    dt.Status = "";
                    dt.Adress = obj.Adress;
                    dt.InventoryTime = InventoryTime;
                    dt.WorkflowCat = obj.WorkflowCat;
                    dt.CreatedBy = ESEIM.AppContext.UserName;
                    dt.CreatedTime = DateTime.Now;
                    // logdata auto
                    InsertLogDataAuto(actCode, dt);
                    _context.AssetInventoryHeaders.Add(dt);
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["ASSET_INVENTORY_TICKET"]);

                    msg.ID = dt.AssetID;
                }
                else
                {
                    msg.Error = true;
                    //phiếu kiểm kê tài sản đã tồn tại
                    msg.Title = String.Format(_sharedResources["COM_MSG_EXITS"], _stringLocalizer["ASSET_INVENTORY_TICKET"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Update([FromBody]AssetInventoryHeadersJtableModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            string actCode = EnumHelper<LogActivity>.GetDisplayValue(LogActivity.ActivityUpdate);
            try
            {
                var data = _context.AssetInventoryHeaders.FirstOrDefault(x => x.AssetID == obj.AssetID);
                if(data != null)
                {
                    data.Title = obj.Title;
                    data.Branch = obj.Branch;
                    data.Person = obj.Person;
                    data.Note = obj.Note;
                    data.InventoryTime = !string.IsNullOrEmpty(obj.InventoryTime) ? DateTime.ParseExact(obj.InventoryTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                    data.UpdatedTime = DateTime.Now;
                    data.UpdatedBy = ESEIM.AppContext.UserName;
                    InsertLogDataAuto(actCode, data);
                    _context.AssetInventoryHeaders.Update(data);
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_UPDATE_SUCCESS"], _stringLocalizer["ASSET_INVENTORY_TICKET"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi khi cập nhật";
                msg.Title = _sharedResources["COM_UPDATE_FAIL"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Delete(int Id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var actCode = EnumHelper<LogActivity>.GetDisplayValue(LogActivity.ActivityDelete);

            try
            {
                var data = _context.AssetInventoryHeaders.FirstOrDefault(x => x.AssetID == Id);
                data.DeletedTime = DateTime.Now.Date;
                data.DeletedBy = ESEIM.AppContext.UserName;
                data.IsDeleted = true;

                _context.AssetInventoryHeaders.Update(data);
                InsertLogDataAuto(actCode, data);
                _context.SaveChanges();
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer["ASSET_INVENTORY_TICKET"]);
            }
            catch (Exception)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];

            }
            return Json(msg);
        }
        #endregion

        #region Asset
        [HttpPost]
        public object GetAssset()
        {
            var data = _context.AssetMains.Where(x => !x.IsDeleted).Select(x => new { Code = x.AssetCode, Name = x.AssetName, AssetStatus = x.Status }).ToList();
            return data;
        }

        public object GetStatusAsset()
        {
            var data = _context.CommonSettings.Where(x => x.Group == "SERVICE_STATUS" && !x.IsDeleted).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return data;
        }

        [HttpPost]
        public JsonResult InsertAsset([FromBody]AssetInventoryDetail obj)
        {
            var msg = new JMessage { Title = "", Error = false };
            try
            {
                var checkexist = _context.AssetInventoryHeaders.FirstOrDefault(x => x.TicketCode.Equals(obj.TicketCode) && x.IsDeleted == false);
                if (checkexist == null)
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["ASSET_INVENTORY_MSG_SAVE_INSERT"];

                }
                else
                {
                    var data = _context.AssetInventoryDetails.FirstOrDefault(x => x.TicketCode.Equals(obj.TicketCode) && x.AssetName.Equals(obj.AssetName) && x.IsDeleted == false);
                    if (data == null)
                    {
                        var dt = new AssetInventoryDetail()
                        {
                            AssetName = obj.AssetName,
                            TicketCode = obj.TicketCode,
                            Quantity = obj.Quantity,
                            StatusAsset = obj.StatusAsset,
                            Note = obj.Note,
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now
                        };
                        _context.AssetInventoryDetails.Add(dt);
                        _context.SaveChanges();
                        msg.ID = dt.AssetID;
                        msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["ASSET_INVENTORY_ASSET"]);
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = string.Format(_sharedResources["COM_ERR_EXIST"], _stringLocalizer["ASSET_INVENTORY_ASSET"]);
                        return Json(msg);
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        public JsonResult DeleteAsset(int Id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var datadetail = _context.AssetInventoryDetails.FirstOrDefault(x => x.AssetID == Id);
                datadetail.DeletedTime = DateTime.Now.Date;
                datadetail.DeletedBy = ESEIM.AppContext.UserName;
                datadetail.IsDeleted = true;

                _context.AssetInventoryDetails.Update(datadetail);
                _context.SaveChanges();
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer["ASSET_INVENTORY_ASSET"]);


            }
            catch (Exception)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        public object JTableADD([FromBody]JTableModelAct jTablePara)
        {
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var listCommon = _context.CommonSettings.Select(x => new { x.CodeSet, x.ValueSet });
            var query = (from a in _context.AssetInventoryDetails
                         join b in _context.CommonSettings.Where(x => x.Group == "SERVICE_STATUS") on a.StatusAsset equals b.CodeSet into b1
                         from b2 in b1.DefaultIfEmpty()
                         join c in _context.AssetMains.Where(x => !x.IsDeleted) on a.AssetName equals c.AssetCode into c1
                         from c2 in c1.DefaultIfEmpty()
                         where (!a.IsDeleted && a.TicketCode.Equals(jTablePara.TicketCode))
                         select new
                         {
                             a.AssetID,
                             c2.AssetName,
                             a.Quantity,
                             StatusAsset = b2.ValueSet,
                             a.Note

                         }).AsParallel();
            int count = query.Count();
            var data = query.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length);
            var jdata = JTableHelper.JObjectTable(data.ToList(), jTablePara.Draw, count, "AssetID", "AssetName", "Quantity", "StatusAsset", "Note");
            return Json(jdata);
        }

        [HttpPost]
        public JsonResult GetAsset(string ticketCode)
        {
            var query = from a in _context.AssetInventoryDetails
                         join b in _context.CommonSettings.Where(x => x.Group == "SERVICE_STATUS") on a.StatusAsset equals b.CodeSet into b1
                         from b2 in b1.DefaultIfEmpty()
                         join c in _context.AssetMains.Where(x => !x.IsDeleted) on a.AssetName equals c.AssetCode into c1
                         from c2 in c1.DefaultIfEmpty()
                         where (!a.IsDeleted && a.TicketCode.Equals(ticketCode))
                         select new
                         {
                             a.AssetID,
                             c2.AssetName,
                             a.Quantity,
                             StatusAsset = b2.ValueSet,
                             a.Note

                         };
            return Json(query);
        }
        #endregion

        #region File old

        [HttpPost]
        public object GetListFile(string code)
        {
            var data = from a in _context.AssetInventoryFiles
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

        public class AssetRqFile
        {
            public int ID { get; set; }

            public string FileCode { get; set; }

            public string TicketCode { get; set; }

            public string FileName { get; set; }

        }

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

            reqCode = string.Format("{0}{1}{2}{3}", "TS_", "T" + monthNow + ".", yearNow + "_", noText);

            return Json(reqCode);
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
                    msg.Title = _sharedResources["COM_ERR_UPLOAD_FILE"];

                }
                else
                {
                    var file = new AssetInventoryFile
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
                    _context.AssetInventoryFiles.Add(file);
                    _context.EDMSFiles.Add(file2);
                    _context.SaveChanges();
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
                var file = await _context.AssetInventoryFiles.FirstOrDefaultAsync(x => x.ID == id);
                var edmsFile = _context.EDMSFiles.FirstOrDefault(x => x.FileCode.Equals(file.FileCode));
                _context.AssetInventoryFiles.Remove(file);
                _context.EDMSFiles.Remove(edmsFile);
                _context.SaveChanges();
                //mess.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_SUCCESS"), CommonUtil.ResourceValue("ASSET_INVENTORY_FILE"));
                mess.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _sharedResources["COM_FILE"]);

            }
            catch (Exception ex)
            {
                //mess.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_FAIL"), CommonUtil.ResourceValue("ASSET_INVENTORY_FILE"));
                mess.Title = _sharedResources["COM_DELETE_FAIL"];

                mess.Error = true;
            }
            return Json(mess);
        }

        #endregion

        #region Action
        [HttpPost]
        public object GetCatObjActivity()
        {
            var check = (from a in _context.AssetInventoryHeaders
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

        [HttpGet]
        public object GetCatActivity()
        {
            var data = _context.CatActivitys.Where(x => x.IsDeleted == false).Select(x => new { Code = x.ActCode, Name = x.ActName, Group = x.ActGroup, Type = x.ActType }).ToList();
            return data;
        }

        [HttpPost]
        public object InsertLogData([FromBody]ActivityLogDataRes obj)
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
                    msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["ASSET_INVENTORY_ACT"]);


                }
                else
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_MSG_INFOMATION"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public object InsertAttrData([FromBody]ActivityAttrData obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var checkStatus = _context.ActivityAttrDatas.FirstOrDefault(x => x.IsDeleted == false && x.WorkFlowCode.Equals(obj.WorkFlowCode) && x.ObjCode.Equals(obj.ObjCode) /*&& x.Status == "STATUS_EDIT_ACT"*/);
                if (checkStatus == null)
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
                            //Value = obj.Value,
                            Note = obj.Note,
                            //Status = "STATUS_EDIT_ACT",
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now
                        };
                        _context.ActivityAttrDatas.Add(actAttrData);
                        _context.SaveChanges();
                        msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["ASSET_INVENTORY_ATTR"]);
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = _sharedResources["COM_MSG_ATTR_EXIST"];
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["ASSET_INVENTORY_MSG_ERR_CHANGE_STATUS"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public object GetObjUnit([FromBody]ObjUnitModel obj)
        {
            //var data = _context.ActivityAttrSetups.Where(x => x.ActCode.Equals(actCode)).Select(x => new { Code = x.AttrCode, Name = x.AttrName, Group = x.AttrGroup, Unit = x.AttrUnit, DataType = x.AttrDataType }).ToList();
            //var data = (from a in _context.ActivityAttrSetups
            //            join b in _context.CommonSettings on a.AttrDataType equals b.CodeSet into b1
            //            from b2 in b1.DefaultIfEmpty()
            //            join c in _context.CommonSettings on a.AttrUnit equals c.CodeSet into c1
            //            from c2 in c1.DefaultIfEmpty()
            //            where (a.IsDeleted == false && a.ActCode.Equals(actCode))
            //            select new
            //            {
            //                Id = a.ID,
            //                Code = a.AttrCode,
            //                Name = a.AttrName,
            //                UnitCode = a.AttrUnit,
            //                Unit = c2.ValueSet,
            //                DataTypeCode = a.AttrDataType,
            //                DataType = b2.ValueSet,
            //                Group = a.AttrGroup,
            //            }).ToList();
            var query = from a in _context.ObjectActivitys
                        join b in _context.CatActivitys on a.ActCode equals b.ActCode into b1
                        from b2 in b1.DefaultIfEmpty()
                        join c in _context.CommonSettings on a.UnitTime equals c.CodeSet into c1
                        from c2 in c1.DefaultIfEmpty()
                        where (!a.IsDeleted && a.WorkFlowCode.Equals(obj.WorkFlowCode) && a.ActCode == obj.ActCode)
                        select new
                        {
                            UnitCode = c2.CodeSet,
                            Unit = c2.CodeSet != null ? c2.ValueSet : "",
                        };
            return query;
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
                           ActName = a.ActCode != null ? _context.CatActivitys.FirstOrDefault(x => x.ActCode == a.ActCode).ActName : "",
                           Name = b.AttrName,
                           sValue = a.Value,
                           Unit = c.ValueSet,
                           DataType = d.ValueSet,
                           Group = b.AttrGroup,
                           sNote = a.Note,
                           //StatusName = a.Status != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet == a.Status).ValueSet : "",
                           //a.Status
                       };
            return data;
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
                // msg.Title = " Xóa thành công";
                msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
            }
            else
            {
                msg.Error = true;
                // msg.Title = "Không tìm thấy phần tử cần xóa";
                msg.Title = _sharedResources["COM_MSG_NOT_FOUND_DATA"];

            }
            return Json(msg);
        }

        [NonAction]
        public string GetValueTime(DateTime d1, DateTime d2, string type)
        {
            //var dateNow_s = dateNow.getTime();
            //var date22_s = date22.getTime();
            var offset = d2 - d1;
            var offset_ss = (int)(offset.TotalMilliseconds + 0.5);
            if (offset_ss > 0)
            {
                if (type == "ACTIVITY_GR_PR_MINUTE")
                {
                    var totalMinutes = offset_ss / 1000 / 60;
                    return totalMinutes + "";
                }
                if (type == "ACTIVITY_GR_PR_HOUR")
                {
                    var totalMinutes = offset_ss / 1000 / 60 / 60;
                    return totalMinutes + "";
                }
                if (type == "ACTIVITY_GR_PR_DAY")
                {
                    var totalMinutes = offset_ss / 1000 / 60 / 60 / 24;
                    return totalMinutes + "";
                }
                if (type == "ACTIVITY_GR_PR_WEEK")
                {
                    var totalMinutes = offset_ss / 1000 / 60 / 60 / 24;
                    return totalMinutes + "";
                }
                if (type == "ACTIVITY_GR_PR_MOUNTH")
                {
                    var totalMinutes = offset_ss / 1000 / 60 / 60 / 24;
                    return totalMinutes + "";
                }
                return "";
            }
            else
            {
                return "";
            }
        }

        [HttpPost]
        public JsonResult UpdateAttrData(int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            var data = _context.ActivityAttrDatas.FirstOrDefault(x => x.ID == id && !x.IsDeleted);
            if (data != null)
            {
                //data.Status = "STATUS_SUCCESS_ACT";
                data.UpdatedBy = ESEIM.AppContext.UserName;
                data.UpdatedTime = DateTime.Now;
                var unittime = _context.ObjectActivitys.FirstOrDefault(x => x.ActCode == data.ActCode && x.WorkFlowCode == data.WorkFlowCode).UnitTime;
                //data.Value = GetValueTime(data.CreatedTime, data.UpdatedTime, unittime);
                _context.ActivityAttrDatas.Update(data);
                _context.SaveChanges();
                // msg.Title = " Xóa thành công";
                msg.Title = _stringLocalizer["ASSET_INVENTORY_MSG_CHANGE_STATUS_SUCCES"];
            }
            else
            {
                msg.Error = true;
                // msg.Title = "Không tìm thấy phần tử cần xóa";
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
                             //join f in _context.CommonSettings.Where(x => !x.IsDeleted) on d.AttrUnit equals f.CodeSet into f1
                         join f in _context.CommonSettings.Where(x => !x.IsDeleted) on b.AttrCode equals f.CodeSet into f1
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
                //msg.Title = " Xóa thành công";
                msg.Title = _sharedResources["COM_DELETE_SUCCESS"];

            }
            else
            {
                msg.Error = true;
                //msg.Title = "Xóa thất bại";
                msg.Title = _sharedResources["COM_DELETE_FAIL"];

            }
            return Json(msg);
        }

        public void InsertLogDataAuto(string actCode, AssetInventoryHeader obj)
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

        public class StausObjStreamModel
        {
            public int Id { get; set; }
            public string WorkFlowCode { get; set; }
            public string ActName { get; set; }
            public string Status { get; set; }
            public string StatusName { get; set; }
            public string UpdatedTime { get; set; }
            public string Employe { get; set; }
            public string CreaTime { get; set; }
            public string UnitTime { get; set; }
            public string Unit { get; set; }
            public string Limit { get; set; }
            public string LimitTime { get; set; }
            public string LimitTimePre { get; set; }
            public string Priority { get; set; }
            public string Department { get; set; }
            public DateTime Time { get; set; }

        }

        [NonAction]
        public List<StausObjStreamModel> listStatusObj(List<StausObjStreamModel> list)
        {
            foreach (var item in list)
            {
                if (item.UnitTime == "ACTIVITY_GR_PR_MINUTE" && item.Status == "STATUS_EDIT_ACT")
                {
                    var strTime = item.CreaTime.Split(" ");
                    var b = strTime[1].Split(":");
                    int b2 = Int32.Parse(b[1]) + Int32.Parse(item.Limit);
                    if ((b2 / 60) >= 1)
                    {
                        int h = Int32.Parse(b[0]) + (b2 / 60);
                        int m = (b2 % 60);
                        if (m < 10)
                        {
                            var mm = "0" + m;
                            item.CreaTime = strTime[0] + " " + h + ":" + mm;
                        }
                        else
                        {
                            item.CreaTime = strTime[0] + " " + h + ":" + m;
                        }
                    }
                    else
                    {
                        if (b2 < 10)
                        {
                            var mm = "0" + b2;
                            item.CreaTime = strTime[0] + " " + b[0] + ":" + mm;
                        }
                        else
                        {
                            item.CreaTime = strTime[0] + " " + b[0] + ":" + b2;
                        }
                    }

                    item.Time = DateTime.ParseExact(item.CreaTime, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture);
                }
                if (item.UnitTime == "ACTIVITY_GR_PR_HOUR" && item.Status == "STATUS_EDIT_ACT")
                {
                    var strTime = item.CreaTime.Split(" ");
                    var b = strTime[1].Split(":");
                    int b2 = Int32.Parse(b[0]) + Int32.Parse(item.Limit);
                    if ((b2 / 24) > 1)
                    {
                        var c = strTime[0].Split("/");
                        int d = Int32.Parse(c[0]) + (b2 / 24);
                        if (d < 10)
                        {
                            var mm = "0" + d;
                            var day = mm + "/" + c[1] + "/" + c[2];
                            int h = b2 % 24;
                            item.CreaTime = day + " " + h + ":" + b[1];
                        }
                        else
                        {
                            var mm = d;
                            var day = mm + "/" + c[1] + "/" + c[2];
                            int h = b2 % 24;
                            item.CreaTime = day + " " + h + ":" + b[1];
                        }
                    }
                    else
                    {
                        item.CreaTime = strTime[0] + " " + b2 + ":" + b[1];
                    }
                    item.Time = DateTime.ParseExact(item.CreaTime, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture);
                }
                if (item.UnitTime == "ACTIVITY_GR_PR_DAY" && item.Status == "STATUS_EDIT_ACT")
                {
                    DateTime dt = DateTime.ParseExact(item.CreaTime, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture);
                    item.Time = dt.AddDays(Int32.Parse(item.Limit));
                }
                if (item.UnitTime == "ACTIVITY_GR_PR_WEEK" && item.Status == "STATUS_EDIT_ACT")
                {
                    DateTime dt = DateTime.ParseExact(item.CreaTime, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture);
                    int day = Int32.Parse(item.Limit) * 4;
                    item.Time = dt.AddDays(day);
                }
                if (item.UnitTime == "ACTIVITY_GR_PR_MOUNTH" && item.Status == "STATUS_EDIT_ACT")
                {
                    DateTime dt = DateTime.ParseExact(item.CreaTime, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture);
                    item.Time = dt.AddMonths(Int32.Parse(item.Limit));
                }
            }

            return list;
        }

        public class ObjStreamModel
        {
            public string ObjActCode { get; set; }
            public string ObjCode { get; set; }

        }

        [HttpPost]
        public object GetStausObjStream([FromBody]ObjStreamModel obj)
        {
            var depart = from a in _context.Users
                         join c in _context.AdDepartments on a.DepartmentId equals c.DepartmentCode
                         select new
                         {
                             ID = a.Id,
                             DepartmentTitle = c.Title,
                             a.UserName
                         };
            var data = (from a in _context.ActivityAttrDatas
                        join b in _context.ObjectActivitys.Where(x => !x.IsDeleted) on new { a.ActCode, a.WorkFlowCode } equals new { b.ActCode, b.WorkFlowCode }
                        join c in depart on a.CreatedBy equals c.UserName
                        where (a.IsDeleted == false && a.WorkFlowCode.Equals(obj.ObjActCode) && a.ObjCode.Equals(obj.ObjCode))
                        select new StausObjStreamModel
                        {
                            Id = b.ID,
                            ActName = a.ActCode != null ? _context.CatActivitys.FirstOrDefault(x => x.ActCode == a.ActCode).ActName : "",
                            //StatusName = a.Status != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet == a.Status).ValueSet : "",
                            //Status = a.Status,
                            UpdatedTime = a.UpdatedTime != null ? a.UpdatedTime.Value.ToString("dd/MM/yyyy HH:mm") : "",
                            Employe = a.CreatedBy != null ? _context.Users.FirstOrDefault(x => x.UserName == a.CreatedBy).GivenName : "",
                            CreaTime = a.CreatedTime.Value.ToString("dd/MM/yyyy HH:mm"),
                            UnitTime = b.UnitTime,
                            Limit = b.LimitTime,
                            LimitTime = string.Join(" ", b.LimitTime, _context.CommonSettings.FirstOrDefault(x => x.CodeSet == b.UnitTime).ValueSet),
                            Unit = _context.CommonSettings.FirstOrDefault(x => x.CodeSet == b.UnitTime).ValueSet,
                            Priority = b.Priority,
                            Department = c.DepartmentTitle
                        }).Union(
                        from a in _context.ObjectActivitys
                        where (!a.IsDeleted && a.WorkFlowCode.Equals(obj.ObjActCode))
                        select new StausObjStreamModel
                        {
                            Id = a.ID,
                            ActName = a.ActCode != null ? _context.CatActivitys.FirstOrDefault(x => x.ActCode == a.ActCode).ActName : "",
                            StatusName = "",
                            Status = "",
                            UpdatedTime = a.UpdatedTime != null ? a.UpdatedTime.Value.ToString("dd/MM/yyyy HH:mm") : "",
                            Employe = "",
                            CreaTime = "",
                            UnitTime = a.UnitTime,
                            Limit = a.LimitTime,
                            LimitTime = string.Join(" ", a.LimitTime, _context.CommonSettings.FirstOrDefault(x => x.CodeSet == a.UnitTime).ValueSet),
                            Unit = "",
                            Priority = a.Priority,
                            Department = "",
                        }).DistinctBy(x => x.Id).OrderBy(x => x.Priority).ToList();
            var listconvert = listStatusObj(data);
            return Json(data);
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
        public object JTableFile([FromBody]JTableModelFile jTablePara)
        {
            if (string.IsNullOrEmpty(jTablePara.AssetCode))
            {
                return JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "Id", "FileName", "FileTypePhysic", "Desc", "Url", "CreatedTime", "UpdatedTime", "ReposName", "TypeFile");
            }
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var query = ((from a in _context.EDMSRepoCatFiles.Where(x => x.ObjectCode == jTablePara.AssetCode && x.ObjectType == EnumHelper<ObjectType>.GetDisplayValue(ObjectType.AssetInventory))
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
                               && x.ObjectCode.Equals(obj.AssetCode) && x.ObjectType.Equals(EnumHelper<ObjectType>.GetDisplayValue(ObjectType.AssetInventory)));
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
        #endregion

        #region Workflow
        [HttpPost]
        public JsonResult GetLogStatus(string code)
        {
            var project = _context.AssetInventoryHeaders.FirstOrDefault(x => x.TicketCode.Equals(code) && !x.IsDeleted);
            return Json(project);
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

        [HttpPost]
        public object GetListRepeat(string code)
        {
            List<ComboxModel> list = new List<ComboxModel>();
            var data = _context.AssetInventoryHeaders.FirstOrDefault(x => x.TicketCode.Equals(code) && !x.IsDeleted);
            var check = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value && x.ObjectInst.Equals(data.TicketCode) 
                && x.ObjectType.Equals(EnumHelper<ObjectType>.GetDisplayValue(ObjectType.AssetInventory)));
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

        [HttpGet]
        public object GetActionStatus(string code)
        {
            var data = _context.AssetInventoryHeaders.Where(x => !x.IsDeleted && x.TicketCode.Equals(code)).Select(x => new
            {
                x.Status
            });
            return data;
        }

        public class ComboxModel
        {
            public string IntsCode { get; set; }
            public string Code { get; set; }
            public string Name { get; set; }
            public string Status { get; set; }
            public string StatusValue { get; set; }
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

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_contractController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerFp.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerCus.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerFile.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_edmsRepoLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_workflowActivityController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion
    }
}
