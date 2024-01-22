using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using System.Collections.Generic;
using Microsoft.AspNetCore.Hosting;
using System.Globalization;
using Newtonsoft.Json;
using III.Domain.Enums;
using Microsoft.AspNetCore.Http;
using System.IO;
using System.Threading.Tasks;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using System.Net;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class AssetImprovementController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IWorkflowService _workflowService;
        private readonly IStringLocalizer<AssetImprovementController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IStringLocalizer<CustomerController> _stringLocalizerCus;
        private readonly IStringLocalizer<FilePluginController> _stringLocalizerFp;
        private readonly IStringLocalizer<ContractController> _contractController;
        private readonly IStringLocalizer<AssetInventoryController> _inventoryController;
        private readonly IStringLocalizer<FileObjectShareController> _stringLocalizerFile;
        private readonly IStringLocalizer<WorkflowActivityController> _workflowActivityController;
        private readonly IStringLocalizer<EDMSRepositoryController> _repoController;

        public AssetImprovementController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment, IStringLocalizer<ContractController> contractController, IStringLocalizer<AssetInventoryController> inventoryController,
            IStringLocalizer<FilePluginController> stringLocalizerFp,
            IStringLocalizer<CustomerController> stringLocalizerCus, IStringLocalizer<FileObjectShareController> stringLocalizerFile, 
            IStringLocalizer<AssetImprovementController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources,
            IWorkflowService workflowService, IStringLocalizer<WorkflowActivityController> workflowActivityController, IStringLocalizer<EDMSRepositoryController> repoController)
        {
            _context = context;
            _upload = upload;
            _hostingEnvironment = hostingEnvironment;
            _stringLocalizer = stringLocalizer;
            _stringLocalizerFp = stringLocalizerFp;
            _sharedResources = sharedResources;
            _stringLocalizerCus = stringLocalizerCus;
            _contractController = contractController;
            _stringLocalizerFile = stringLocalizerFile;
            _inventoryController = inventoryController;
            _workflowService = workflowService;
            _workflowActivityController = workflowActivityController;
            _repoController = repoController;
        }
        [Breadcrumb("ViewData.CrumbAssetImprove", AreaName = "Admin", FromAction = "Index", FromController = typeof(MaintenAssetHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuAsset"] = _sharedResources["COM_CRUMB_ASSET_OPERATION"];
            ViewData["CrumbMaintenHome"] = _sharedResources["COM_CRUMB_MAINTEN_ASSET_HOME"];
            ViewData["CrumbAssetImprove"] = _sharedResources["COM_CRUMB_ASSET_IMPROVE"];
            return View();
        }

        #region Tab Header
        [HttpPost]
        public object JTableHeader([FromBody]JTableModelAct jTablePara)
        {
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var query = (from a in _context.AssetImprovementHeaders
                         
                         join c2 in _context.AdOrganizations.Where(x => x.IsEnabled) on a.Branch equals c2.OrgAddonCode into c1
                         from c in c1.DefaultIfEmpty()
                         join d2 in _context.AdDepartments.Where(x => x.IsEnabled) on a.DepartTransfer equals d2.DepartmentCode into d1
                         from d in d1.DefaultIfEmpty()
                         join e2 in _context.Suppliers.Where(x => !x.IsDeleted) on a.UnitMaintenance equals e2.SupCode into e1
                         from e in e1.DefaultIfEmpty()
                         where (!a.IsDeleted 
                         && ((string.IsNullOrEmpty(jTablePara.Title) || a.Note.ToLower().Contains(jTablePara.Title.ToLower()))
                         || (string.IsNullOrEmpty(jTablePara.Title) || a.Title.ToLower().Contains(jTablePara.Title.ToLower())))
                        && (string.IsNullOrEmpty(jTablePara.TicketCode) || a.TicketCode.ToLower().Contains(jTablePara.TicketCode.ToLower()))
                        && (string.IsNullOrEmpty(jTablePara.Branch) || a.Branch.ToLower().Contains(jTablePara.Branch.ToLower()))
                        && (string.IsNullOrEmpty(jTablePara.UnitMaintenance) || a.UnitMaintenance.ToLower().Contains(jTablePara.UnitMaintenance.ToLower()))
                        && (string.IsNullOrEmpty(jTablePara.Status) || a.Status.ToLower().Contains(jTablePara.Status.ToLower()))
                        && (fromDate == null || (a.ReceivedTime <= toDate))
                        && (toDate == null || (a.StartTime >= fromDate)))
                         select new
                         {
                             a.TicketID,
                             a.TicketCode,
                             a.Title,
                             Branch = c != null ? c.OrgName : "Không xác định",
                             DepartTransfer = d != null ? d.Title : "Không xác định",
                             a.StartTime,
                             UnitMaintenance = e != null ? e.SupName : "Không xác định",
                             a.ReceivedTime,
                             Status = a.Status,
                             a.Note,
                             a.TotalMoney,
                             a.Currency,
                         });
            int count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length);
            var jdata = JTableHelper.JObjectTable(data.ToList(), jTablePara.Draw, count, "TicketID", "TicketCode", "Title", "Branch", "DepartTransfer", "StartTime", "UnitMaintenance", "ReceivedTime", "Status", "Note", "TotalMoney","Currency");
            return Json(jdata);
        }
        #endregion

        #region Tab Details
        [HttpPost]
        public object JTableDetails([FromBody]JTableModelAct jTablePara)
        {
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = (from a in _context.AssetImprovementDetailss
                         join m in _context.AssetImprovementHeaders.Where(x => !x.IsDeleted) on a.TicketCode equals m.TicketCode
                         join b2 in _context.CommonSettings.Where(x => !x.IsDeleted) on a.StatusAsset equals b2.CodeSet into b1
                         from b in b1.DefaultIfEmpty()
                         join c2 in _context.AssetMains.Where(x => !x.IsDeleted) on a.AssetCode equals c2.AssetCode into c1
                         from c in c1.DefaultIfEmpty()
                         where (!a.IsDeleted)
                         select new
                         {
                             a.AssetID,
                             a.TicketCode,
                             a.AssetCode,
                             AssetName = c != null ? c.AssetName : "Không xác định",
                             TotalMoney = a.AssetQuantity * (c.Cost.HasValue ? c.Cost.Value : 0),
                             StatusAsset = b != null ? b.ValueSet : "Không xác định",
                             a.Note,
                             a.AssetQuantity
                         });
            int count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length);
            var jdata = JTableHelper.JObjectTable(data.ToList(), jTablePara.Draw, count, "AssetID", "TicketCode", "AssetCode", "AssetName", "AssetQuantity", "TotalMoney", "StatusAsset", "Note");
            return Json(jdata);
        }

        [HttpPost]
        public JsonResult GetAssetInTicket(string ticketCode)
        {
            var query = (from a in _context.AssetImprovementDetailss
                         join m in _context.AssetImprovementHeaders.Where(x => !x.IsDeleted) on a.TicketCode equals m.TicketCode
                         join b2 in _context.CommonSettings.Where(x => !x.IsDeleted) on a.StatusAsset equals b2.CodeSet into b1
                         from b in b1.DefaultIfEmpty()
                         join c2 in _context.AssetMains.Where(x => !x.IsDeleted) on a.AssetCode equals c2.AssetCode into c1
                         from c in c1.DefaultIfEmpty()
                         where (!a.IsDeleted) && a.TicketCode.Equals(ticketCode)
                         select new
                         {
                             a.AssetID,
                             a.TicketCode,
                             a.AssetCode,
                             AssetName = c != null ? c.AssetName : "Không xác định",
                             TotalMoney = a.AssetQuantity * (c.Cost.HasValue ? c.Cost.Value : 0),
                             StatusAsset = b != null ? b.ValueSet : "Không xác định",
                             a.Note,
                             a.AssetQuantity
                         });
            return Json(query);
        }
        #endregion

        #region Combobox
        [HttpPost]
        public JsonResult GetStatus()
        {
            var data = _context.CommonSettings.Where(x => x.Group == "ASSET_URENCO").OrderBy(x => x.Priority).Select(x => new { Code = x.CodeSet, Name = x.ValueSet, Icon = x.Logo });
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetOrganization()
        {
            var data = _context.AdOrganizations.Where(x => x.IsEnabled).Select(x => new { Code = x.OrgAddonCode, Name = x.OrgName });
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetUnitMaintenance()
        {
            var data = _context.Suppliers.Where(x => !x.IsDeleted).Select(x => new { Code = x.SupCode, Name = x.SupName });
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetDepartTransfer()
        {
            var data = _context.AdDepartments.Where(x => !x.IsDeleted && x.IsEnabled).Select(x => new { Code = x.DepartmentCode, Name = x.Title });
            return Json(data);
        }

        [HttpPost]
        public object GetUserTransfer(string DepartmentCode)
        {
            var data = _context.HREmployees.Where(x => x.flag.Value == 1 && (string.IsNullOrEmpty(DepartmentCode) || x.unit.Equals(DepartmentCode))).Select(x => new { Code = x.Id.ToString(), Name = x.fullname }).ToList();
            return data;
        }

        [HttpPost]
        public object GetItem(int Id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            var data = _context.AssetImprovementHeaders.FirstOrDefault(x => x.TicketID == Id);
            if (data != null)
            {
                var session = HttpContext.Session;
                session.SetInt32("IdObject", Id);
                data.sStartTime = data.StartTime.HasValue ? data.StartTime.Value.ToString("dd/MM/yyyy") : null;
                data.sReceivedTime = data.ReceivedTime.HasValue ? data.ReceivedTime.Value.ToString("dd/MM/yyyy") : null;
                msg.Object = data;
            }
            return Json(msg);
        }

        [HttpPost]
        public object GetItemDetails(int Id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            var dt = _context.AssetImprovementDetailss.FirstOrDefault(x => x.AssetID == Id);
            if (dt != null)
            {
                var data = _context.AssetImprovementHeaders.FirstOrDefault(x => x.TicketCode == dt.TicketCode);
                if (data != null)
                {
                    data.sStartTime = data.StartTime.HasValue ? data.StartTime.Value.ToString("dd/MM/yyyy") : null;
                    data.sReceivedTime = data.ReceivedTime.HasValue ? data.ReceivedTime.Value.ToString("dd/MM/yyyy") : null;
                    msg.Object = data;
                }
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetAsset()
        {
            var data = _context.AssetMains.Where(x => !x.IsDeleted).Select(x => new { Code = x.AssetCode, Name = x.AssetName });
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetAssetCategory()
        {
            var data = _context.ServiceCategorys.Where(x => !x.IsDeleted).Select(x => new { Code = x.ServiceCode, Name = x.ServiceName });
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetStatusAsset()
        {
            var data = _context.CommonSettings.Where(x => x.Group == "SERVICE_STATUS" && !x.IsDeleted).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetTotalMoneyAsset(string str)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var check = _context.AssetImprovementDetailss.Where(x => !x.IsDeleted).FirstOrDefault(x => x.TicketCode.Equals(str));
            if (check != null)
            {
                var data = _context.AssetImprovementCategorys.Where(x => x.TicketCodeCategory.Equals(str) && !x.IsDeleted).Sum(x => x.TotalMoneyCategory);
                msg.Object = data;
            }
            else
            {
                msg.Object = "";
            }
            return Json(msg);
        }

        [HttpGet]
        public object GetCatActivity()
        {
            var data = _context.CatActivitys.Where(x => x.IsDeleted == false).Select(x => new { Code = x.ActCode, Name = x.ActName, Group = x.ActGroup, Type = x.ActType }).ToList();
            return data;
        }

        [HttpPost]
        public object GetObjActCode()
        {
            var check = (from a in _context.AssetImprovementHeaders
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

        #endregion

        #region InsertHeader
        [HttpPost]
        public JsonResult InsertHeader([FromBody]AssetImprovementHeaderModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            string actCode = EnumHelper<LogActivity>.GetDisplayValue(LogActivity.ActivityCreate);
            try
            {
                if (!_context.AssetMaintenanceHeaders.Any(x => x.TicketCode == obj.TicketCode && x.IsDeleted != true))
                {
                    DateTime? startTime = !string.IsNullOrEmpty(obj.StartTime) ? DateTime.ParseExact(obj.StartTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                    DateTime? receivedTime = !string.IsNullOrEmpty(obj.ReceivedTime) ? DateTime.ParseExact(obj.ReceivedTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

                    AssetImprovementHeader data = new AssetImprovementHeader()
                    {
                        TicketCode = obj.TicketCode,
                        Title = obj.Title,
                        Branch = obj.Branch,
                        DepartTransfer = obj.DepartTransfer,
                        UserTransfer = obj.UserTransfer,
                        StartTime = startTime,
                        LocationTransfer = obj.LocationTransfer,
                        UnitMaintenance = obj.UnitMaintenance,
                        ReceivedTime = receivedTime,
                        LocationReceived = obj.LocationReceived,
                        Status = "",
                        Note = obj.Note,
                        TotalMoney = obj.TotalMoney,
                        Currency = obj.Currency,
                        ObjActCode = obj.ObjActCode,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now,
                        WorkflowCat = obj.WorkflowCat
                    };
                    InsertLogDataAuto(actCode, data);
                    _context.AssetImprovementHeaders.Add(data);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizer["ASSETIMPRO_MSG_ADD_ASSET_SUCCESS"];
                    msg.ID = data.TicketID;
                    return Json(msg);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_ERR_ADD"];
                }
                return Json(msg);
            }
            catch (Exception)
            {
                msg.Error = true;
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
            var data = _context.AssetImprovementHeaders.Where(x => x.CreatedTime.Value.Year == yearNow && x.CreatedTime.Value.Month == monthNow).ToList();
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
        #endregion

        #region UpdateHeader
        [HttpPost]
        public JsonResult UpdateHeader([FromBody]AssetImprovementHeaderModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            string actCode = EnumHelper<LogActivity>.GetDisplayValue(LogActivity.ActivityUpdate);
            try
            {
                var query = _context.AssetImprovementHeaders.FirstOrDefault(x => x.TicketID == obj.TicketID);
                if (query != null)
                {
                    var data = _context.AssetImprovementHeaders.FirstOrDefault(x => x.TicketID == obj.TicketID);
                    data.Title = obj.Title;
                    data.Branch = obj.Branch;
                    data.DepartTransfer = obj.DepartTransfer;
                    data.UserTransfer = obj.UserTransfer;
                    data.StartTime = !string.IsNullOrEmpty(obj.StartTime) ? DateTime.ParseExact(obj.StartTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                    data.LocationTransfer = obj.LocationTransfer;
                    data.UnitMaintenance = obj.UnitMaintenance;
                    data.ReceivedTime = !string.IsNullOrEmpty(obj.ReceivedTime) ? DateTime.ParseExact(obj.ReceivedTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                    data.LocationReceived = obj.LocationReceived;
                   
                    data.Note = obj.Note;
                    data.TotalMoney = obj.TotalMoney;
                    data.Currency = obj.Currency;
                    data.UpdatedTime = DateTime.Now.Date;
                    data.UpdatedBy = ESEIM.AppContext.UserName;

                    InsertLogDataAuto(actCode, data);
                    _context.AssetImprovementHeaders.Update(data);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizer["ASSETIMPRO_MSG_UPDATE_ASSET_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_UPDATE_FAIL"];
                }

            }
            catch (Exception)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_UPDATE_FAIL"];
            }
            return Json(msg);
        }
        #endregion

        #region Workflow
        [HttpPost]
        public JsonResult GetLogStatus(string code)
        {
            var project = _context.AssetImprovementHeaders.FirstOrDefault(x => x.TicketCode.Equals(code) && !x.IsDeleted);
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
            var data = _context.AssetImprovementHeaders.FirstOrDefault(x => x.TicketCode.Equals(code) && !x.IsDeleted);
            var check = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value && x.ObjectInst.Equals(data.TicketCode)
                && x.ObjectType.Equals(EnumHelper<ObjectType>.GetDisplayValue(ObjectType.AssetImprove)));
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
            var data = _context.AssetImprovementHeaders.Where(x => !x.IsDeleted && x.TicketCode.Equals(code)).Select(x => new
            {
                x.Status
            });
            return data;
        }

        [HttpPost]
        public object GetItemTemp(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var list = new List<ComboxModel>();
                var data = _context.AssetImprovementHeaders.FirstOrDefault(x => x.TicketID == id && !x.IsDeleted);
                if (data == null)
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["ASSETIMPRO_MSG_TICKET_NO_EXIST"];
                    return Json(msg);
                }

                var wf = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value && x.ObjectInst.Equals(data.TicketCode)
                            && x.ObjectType.Equals(EnumHelper<ObjectType>.GetDisplayValue(ObjectType.AssetImprove)));
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

        #region Deleted Header
        [HttpPost]
        public JsonResult DeleteHeader(int Id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var actCode = EnumHelper<LogActivity>.GetDisplayValue(LogActivity.ActivityDelete);
            try
            {
                var data = _context.AssetImprovementHeaders.FirstOrDefault(x => x.TicketID == Id);
                data.DeletedTime = DateTime.Now.Date;
                data.DeletedBy = ESEIM.AppContext.UserName;
                data.IsDeleted = true;

                InsertLogDataAuto(actCode, data);
                _context.AssetImprovementHeaders.Update(data);
                _context.SaveChanges();
                msg.Title = _stringLocalizer["ASSETIMPRO_MSG_DELETE_ASSET_SUCCESS"];
            }
            catch (Exception)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_ERR_DELETE"];
            }
            return Json(msg);
        }
        #endregion

        #region Insert Asset		
        public JsonResult InsertDetails([FromBody]AssetImprovementDetailsModel obj)
        {
            var msg = new JMessage { Title = "", Error = false };
            try
            {
                var checkexist = _context.AssetImprovementHeaders.FirstOrDefault(x => x.TicketCode.Equals(obj.TicketCode) && !x.IsDeleted);
                if (checkexist == null)
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["ASSETIMPRO_MSG_ERR_ADD_ASSET_SUCCESS"];
                }
                else
                {
                    var data = _context.AssetImprovementDetailss.FirstOrDefault(x => x.TicketCode.Equals(obj.TicketCode) && x.AssetCode == obj.AssetCode && !x.IsDeleted);
                    if (data == null)
                    {
                        var dt = new AssetImprovementDetails()
                        {
                            TicketCode = obj.TicketCode,
                            AssetCode = obj.AssetCode,
                            TotalMoney = obj.TotalMoney,
                            StatusAsset = obj.StatusAsset,
                            AssetQuantity = obj.AssetQuantity,
                            Note = obj.Note,
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now
                        };
                        _context.AssetImprovementDetailss.Add(dt);
                        _context.SaveChanges();
                        msg.Title = _stringLocalizer["ASSETIMPRO_MSG_ADD_SUCCESS"];
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = string.Format(_sharedResources["COM_ERR_EXIST"], _stringLocalizer["ASSETIMPRO_CURD_LBL_ASSET"]);
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;                
                //msg.Title = "Lỗi khi thêm tài sản!";
                msg.Title = _sharedResources["COM_ERR_ADD"];
            }
            return Json(msg);
        }
        #endregion

        #region Deleted Asset
        [HttpPost]
        public JsonResult DeleteAsset(int Id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.AssetImprovementDetailss.FirstOrDefault(x => x.AssetID == Id);
                data.DeletedTime = DateTime.Now.Date;
                data.DeletedBy = ESEIM.AppContext.UserName;
                data.IsDeleted = true;

                _context.AssetImprovementDetailss.Update(data);
                _context.SaveChanges();
                //msg.Title = "Xóa tài sản bảo dưỡng thành công!";
                msg.Title = _stringLocalizer["ASSETIMPRO_MSG_DEL_SUCCESS"];
                msg.Code = data.TicketCode;
            }
            catch (Exception)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi xảy ra khi xóa!";
                msg.Title = _sharedResources["COM_ERR_DELETE"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult DeletedListCategory(string str)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.AssetImprovementCategorys.Where(x => !x.IsDeleted && x.TicketCodeCategory.Equals(str))
                    .Select(x => new { Id = x.CategoryID }).ToArray();
                for(int i=0; i<data.Length; i++)
                {
                    var dt = _context.AssetImprovementCategorys.FirstOrDefault(x => x.CategoryID.Equals(data[i].Id));
                    dt.DeletedTime = DateTime.Now.Date;
                    dt.DeletedBy = ESEIM.AppContext.UserName;
                    dt.IsDeleted = true;

                    _context.AssetImprovementCategorys.Update(dt);
                    _context.SaveChanges();
                }
                msg.Title = _stringLocalizer["ASSETIMPRO_MSG_DEL_CATEGORY_SUCCESS"];
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

        #region Table Asset Details
        [HttpPost]
        public object JTableAssetDetails([FromBody]JTableModelAct jTablePara)
        {
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = (from a in _context.AssetImprovementDetailss
                         join c in _context.AssetImprovementHeaders.Where(x => !x.IsDeleted) on a.TicketCode equals c.TicketCode
                         join b2 in _context.CommonSettings.Where(x => !x.IsDeleted) on a.StatusAsset equals b2.CodeSet into b1
                         from b in b1.DefaultIfEmpty()
                         join d2 in _context.AdGroupUsers.Where(x => !x.IsEnabled) on c.DepartTransfer equals d2.GroupUserCode into d1
                         from d in d1.DefaultIfEmpty()
                         join e2 in _context.AssetMains.Where(x => !x.IsDeleted) on a.AssetCode equals e2.AssetCode into e1
                         from e in e1.DefaultIfEmpty()
                         join f2 in _context.Suppliers.Where(x => !x.IsDeleted) on c.UnitMaintenance equals f2.SupCode into f1
                         from f in f1.DefaultIfEmpty()
                         join h2 in _context.HREmployees on c.UserTransfer equals h2.employee_code into h1
                         from h in h1.DefaultIfEmpty()
                         where (!a.IsDeleted && a.TicketCode.Equals(jTablePara.TicketCode))
                         select new
                         {
                             a.AssetID,
                             AssetName = e != null ? e.AssetName : "Không xác định",
                             DepartTransfer = d != null ? d.Title : "Không xác định",
                             UnitMaintenance = f != null ? f.SupName : "Không xác định",
                             UserTransfer = h != null ? h.fullname : "Không xác định",
                             StatusAsset = b != null ? b.ValueSet : "Không xác định",
                             a.AssetQuantity,
                             a.TotalMoney,
                             a.Note,
                         });
            int count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length);
            var jdata = JTableHelper.JObjectTable(data.ToList(), jTablePara.Draw, count, "AssetID", "AssetName", "DepartTransfer", "UnitMaintenance", "UserTransfer", "StatusAsset", "TotalMoney", "Note", "AssetQuantity");
            return Json(jdata);
        }
        #endregion

        #region Change Status
        [HttpPost]
        public JsonResult EditStatus(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var maintenanceHeader = _context.AssetImprovementHeaders.FirstOrDefault(x => x.TicketID.Equals(id));
                if (maintenanceHeader != null)
                {
                    maintenanceHeader.Status = "AI_EDIT";                 
                    _context.AssetImprovementHeaders.Update(maintenanceHeader);
                    _context.SaveChanges();
                    msg.Title =String.Format(_stringLocalizer["ASSETIMPRO_MSG_SUCCESS_REQUEST"]);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["ASSETIMPRO_MSG_CORRECTED_REQUEST_FAIL"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = String.Format(_stringLocalizer["ASSETIMPRO_MSG_CORRECTED_REQUEST_FAIL"]);
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Pending(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var maintenanceHeader = _context.AssetImprovementHeaders.FirstOrDefault(x => x.TicketID.Equals(id));
                if (maintenanceHeader != null)
                {                    
                    if (maintenanceHeader.Status == "AI_REJECT")
                    {
                        msg.Error = true;
                        msg.Title = String.Format(_stringLocalizer["ASSETIMPRO_MSG_CHANGE_TO_EDIT"]);
                        //msg.Title = _stringLocalizer["EDMSSRPE_MSG_RQ_CANCLE_ONL_UPDATE_STATUS_EDIT"];
                        return Json(msg);
                    }

                    if (maintenanceHeader.Status == "AI_PROCESSING")
                    {
                        msg.Error = false;
                        msg.Title = String.Format(_stringLocalizer["ASSETIMPRO_MSG_PROCESS"]);
                        //msg.Title = _stringLocalizer["EDMSSRPE_MSG_RQ_PENDING"];
                        return Json(msg);
                    }

                    maintenanceHeader.Status = "AI_PROCESSING";                  
                    _context.AssetImprovementHeaders.Update(maintenanceHeader);
                    _context.SaveChanges();
                    msg.Title = String.Format(_stringLocalizer["ASSETIMPRO_MSG_SUCCESS_REQUEST"]);
                    //msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["EDMSSRPE_CURD_TXT_PENDING"]);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["ASSETIMPRO_MSG_CORRECTED_REQUEST_FAIL"]);
                    //msg.Title = _sharedResources["COM_MSG_ERR"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = String.Format(_stringLocalizer["ASSETIMPRO_MSG_REQUEST_FAIL"]);
                //msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Complete(int id, string reason)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var maintenanceHeader = _context.AssetImprovementHeaders.FirstOrDefault(x => x.TicketID.Equals(id));
                if (maintenanceHeader != null)
                {
                    if (maintenanceHeader.Status == "AI_COMPLETED")
                    {
                        msg.Error = false;
                        msg.Title = String.Format(_stringLocalizer["ASSETIMPRO_MSG_REQUEST_APPROVE"]);
                        //msg.Title = _stringLocalizer["EDMSSRPE_MSG_RQ_APPROVE"];
                        return Json(msg);
                    }

                    if (maintenanceHeader.Status == "AI_REJECT")
                    {
                        msg.Error = true;
                        msg.Title = String.Format(_stringLocalizer["ASSETIMPRO_MSG_REQUEST_CANCEL"]);
                        //msg.Title = _stringLocalizer["EDMSSRPE_MSG_RQ_CANCLE_NOT_APPROVE"];
                        return Json(msg);
                    }

                    maintenanceHeader.Status = "AI_COMPLETED";
                    _context.AssetImprovementHeaders.Update(maintenanceHeader);
                    _context.SaveChanges();
                    msg.Title = String.Format(_stringLocalizer["ASSETIMPRO_MSG_SUCCESS_REQUEST"]);
                    //msg.Title = String.Format(_sharedResources["COM_MSG_SUCCES"], _stringLocalizer["EDMSSRPE_MSG_APPROVE_RQ"]);
                    msg.Object = maintenanceHeader.Status;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["ASSETIMPRO_MSG_NOT_FIND_REQUEST"]);
                    //msg.Title = _sharedResources["COM_MSG_ERR"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = String.Format(_stringLocalizer["ASSETIMPRO_MSG_FAIL_REQUEST"]);
                //msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Reject(int id, string reason)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var maintenanceHeader = _context.AssetImprovementHeaders.FirstOrDefault(x => x.TicketID.Equals(id));
                if (maintenanceHeader != null)
                {                   
                    if (maintenanceHeader.Status == "AI_REJECT")
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["ASSETIMPRO_MSG_CHANGE_TO_EDIT"];
                        //msg.Title = _stringLocalizer["EDMSSRPE_MSG_RQ_CANCLE_ONL_UPDATE_STATUS_EDIT"];
                        return Json(msg);
                    }

                    maintenanceHeader.Status = "AI_REJECT";                    
                    _context.AssetImprovementHeaders.Update(maintenanceHeader);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizer["ASSETIMPRO_MSG_REJECT_SUCCESS"];
                    //msg.Title = String.Format(_sharedResources["COM_MSG_SUCCES"], _stringLocalizer["EDMSSRPE_MSG_REJECT_RQ"]);
                    msg.Object = maintenanceHeader.Status;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["ASSETIMPRO_MSG_NOT_FIND_REQUEST"];
                    //msg.Title = _sharedResources["COM_MSG_ERR"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = _stringLocalizer["ASSETIMPRO_MSG_FAIL_REQUEST"];
                //msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }
        #endregion

        #region Table AssetCategory
        [HttpPost]
        public object JTableAssetCategory([FromBody]JTableModelAct jTablePara)
        {
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = (from a in _context.AssetImprovementCategorys
                         join e in _context.AssetImprovementHeaders.Where(x => !x.IsDeleted) on a.TicketCodeCategory equals e.TicketCode
                         //join m in _context.AssetImprovementDetailss.Where(x => !x.IsDeleted) on a.TicketCodeCategory equals m.TicketCode
                         join b2 in _context.CommonSettings.Where(x => !x.IsDeleted) on a.StatusCategory equals b2.CodeSet into b1
                         from b in b1.DefaultIfEmpty()
                         join c2 in _context.AssetMains.Where(x => !x.IsDeleted) on a.AssetCodeCategory equals c2.AssetCode into c1
                         from c in c1.DefaultIfEmpty()
                         join d2 in _context.HREmployees on e.UserTransfer equals d2.employee_code into d1
                         from d in d1.DefaultIfEmpty()
                         join g2 in _context.ServiceCategorys on a.CategoryName equals g2.ServiceCode into g1
                         from g in g1.DefaultIfEmpty()
                         where (!a.IsDeleted && a.TicketCodeCategory.Equals(jTablePara.TicketCode))
                         select new
                         {
                             a.CategoryID,
                             a.CategoryCode,
                             CategoryName = g != null ? g.ServiceName : "Không xác định",
                             AssetName = c != null ? c.AssetName : "Không xác định",
                             a.Quantity,
                             a.Price,
                             a.TotalMoneyCategory,
                             StatusCategory = b != null ? b.ValueSet : "Không xác định",
                             a.NoteCategory,
                             UserCategory = d != null ? d.fullname : "Không xác định",
                             a.Currency,
                         });
            int count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length);
            var jdata = JTableHelper.JObjectTable(data.ToList(), jTablePara.Draw, count, "CategoryID", "CategoryCode", "CategoryName", "AssetName", "Quantity", "Price", "TotalMoneyCategory", "StatusCategory", "NoteCategory", "UserCategory", "Currency");
            return Json(jdata);
        }
        #endregion

        #region Insert Asset Category
        [HttpPost]
        public JsonResult InsertAssetCategory([FromBody]AssetMaintenanceCategoryModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var checkexist = _context.AssetImprovementDetailss.FirstOrDefault(x => x.TicketCode.Equals(obj.TicketCodeCategory) && x.IsDeleted == false);
                if (checkexist == null)
                {
                    msg.Error = true;
                    //msg.Title = "Thêm tài sản trước khi thêm hạng mục!";
                    msg.Title = _stringLocalizer["ASSETIMPRO_MSG_ERR_ADD_CATEGORY_SUCCESS"];
                }
                else
                {
                    if (!_context.AssetImprovementCategorys.Any(x => x.CategoryName == obj.CategoryName && x.TicketCodeCategory.Equals(obj.TicketCodeCategory) && x.IsDeleted != true))
                    {
                        AssetImprovementCategory data = new AssetImprovementCategory()
                        {
                            CategoryCode = obj.CategoryCode,
                            CategoryName = obj.CategoryName,
                            AssetCodeCategory = obj.AssetCodeCategory,
                            Quantity = obj.Quantity,
                            Currency = obj.Currency,
                            Price = obj.Price,
                            TotalMoneyCategory = obj.Quantity * obj.Price,
                            StatusCategory = obj.StatusCategory,
                            NoteCategory = obj.NoteCategory,
                            TicketCodeCategory = obj.TicketCodeCategory,
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now,
                        };

                        _context.AssetImprovementCategorys.Add(data);
                        _context.SaveChanges();
                        //msg.Title = "Thêm hạng mục bảo dưỡng thành công";
                        msg.Title = _stringLocalizer["ASSETIMPRO_MSG_ADD_CATEGORY_SUCCESS"];
                    }
                    else
                    {
                        msg.Error = true;
                        //msg.Title = "Hạng mục bảo dưỡng đã tồn tại!";
                        msg.Title = _sharedResources["COM_ERR_ADD"];
                    }
                    return Json(msg);
                }
            }
            catch (Exception)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi khi thêm hạng mục bảo dưỡng!";
                msg.Title = _sharedResources["COM_ERR_ADD"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GenReqCategoryCode()
        {
            var monthNow = DateTime.Now.Month;
            var yearNow = DateTime.Now.Year;
            var reqCode = string.Empty;
            var no = 1;
            var noText = "01";
            var data = _context.AssetImprovementCategorys.Where(x => x.CreatedTime.Value.Year == yearNow && x.CreatedTime.Value.Month == monthNow).ToList();
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

            reqCode = string.Format("{0}{1}{2}{3}", "AIC_", "T" + monthNow + ".", yearNow + "_", noText);

            return Json(reqCode);
        }
        #endregion

        #region Deleted Asset Category
        [HttpPost]
        public JsonResult DeleteCategory(int Id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.AssetImprovementCategorys.FirstOrDefault(x => x.CategoryID == Id);
                data.DeletedTime = DateTime.Now.Date;
                data.DeletedBy = ESEIM.AppContext.UserName;
                data.IsDeleted = true;

                _context.AssetImprovementCategorys.Update(data);
                _context.SaveChanges();
                //msg.Title = "Xóa hạng mục bảo dưỡng thành công!";
                msg.Title = _stringLocalizer["ASSETIMPRO_MSG_DEL_CATEGORY_SUCCESS"];
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

        #region Update TotalMoney
        [HttpPost]
        public JsonResult UpdateAsset([FromBody]AssetImprovementCategoryModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var getTotal = _context.AssetImprovementCategorys.Where(x => !x.IsDeleted && x.TicketCodeCategory.Equals(obj.TicketCodeCategory)).Sum(x => x.TotalMoneyCategory);
                var data = _context.AssetImprovementDetailss.FirstOrDefault(x => x.TicketCode == obj.TicketCodeCategory && !x.IsDeleted);
                if (data != null)
                {
                    var query = _context.AssetImprovementDetailss.FirstOrDefault(x => x.TicketCode == obj.TicketCodeCategory && !x.IsDeleted);
                    query.TotalMoney = getTotal;
                    query.UpdatedTime = DateTime.Now.Date;
                    query.UpdatedBy = ESEIM.AppContext.UserName;
                    _context.AssetImprovementDetailss.Update(query);
                    _context.SaveChanges();
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Có lỗi khi cập nhật tổng tiền!";
                    msg.Title = _stringLocalizer["ASSETIMPRO_MSG_ERR_UPDATE_TOTAL_SUCCESS"];
                }
            }
            catch (Exception)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi khi cập nhật tổng tiền!";
                msg.Title = _stringLocalizer["ASSETIMPRO_MSG_ERR_UPDATE_TOTAL_SUCCESS"];
            }

            return Json(msg);
        }
        #endregion

        #region File old
        [HttpPost]
        public JsonResult CheckTicketCode(string str)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = _context.AssetImprovementHeaders.FirstOrDefault(x => x.TicketCode.Equals(str) && !x.IsDeleted);
                if (data != null)
                {

                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Lưu phiếu trươc khi tải tệp!";
                    msg.Title = _stringLocalizer["ASSETIMPRO_MSG_ADD_FILE_SUCCESS"];
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
        public JsonResult UploadFile(AssetImprovementFile obj, IFormFile fileUpload)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var upload = _upload.UploadFile(fileUpload, Path.Combine(_hostingEnvironment.WebRootPath, "uploads\\files"));
                if (upload.Error)
                {
                    msg.Error = true;
                    //msg.Title = String.Format(CommonUtil.ResourceValue("MLP_MSG_FILE"), CommonUtil.ResourceValue("MLP_MSG_FILE_SERVER_FAIL"));
                    msg.Title = _sharedResources["COM_ERR_UPLOAD_FILE"];

                }
                else
                {
                    var file = new AssetImprovementFile
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
                    _context.AssetImprovementFiles.Add(file);
                    _context.EDMSFiles.Add(file2);
                    _context.SaveChanges();
                    //msg.Title = String.Format(CommonUtil.ResourceValue("MLP_MSG_FILE"), CommonUtil.ResourceValue("MLP_MSG_FILE_SUCCESS"));
                    msg.Title = _sharedResources["COM_MSG_DOWLOAD_SUCCESS"];
                }
            }
            catch (Exception)
            {
                //msg.Title = String.Format(CommonUtil.ResourceValue("MLP_MSG_FILE"), CommonUtil.ResourceValue("MLP_MSG_FILE_FAIL"));
                msg.Title = _sharedResources["COM_MSG_FILE_FAIL"];
                msg.Error = true;
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GenReqFileCode()
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

            reqCode = string.Format("{0}{1}{2}{3}", "AIF" +
                "_", "T" + monthNow + ".", yearNow + "_", noText);

            return Json(reqCode);
        }

        [HttpPost]
        public object GetListFile(string code)
        {
            var data = from a in _context.AssetImprovementFiles
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
        public async Task<JsonResult> DeleteFile(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var file = await _context.AssetImprovementFiles.FirstOrDefaultAsync(x => x.ID == id);
                var edmsFile = _context.EDMSFiles.FirstOrDefault(x => x.FileCode.Equals(file.FileCode));
                _context.AssetImprovementFiles.Remove(file);
                _context.EDMSFiles.Remove(edmsFile);
                _context.SaveChanges();
                //mess.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_SUCCESS"), CommonUtil.ResourceValue("MLP_FILE"));
                msg.Title = _sharedResources["COM_MSG_DELETE_SUCCESS"];
            }
            catch (Exception)
            {
                //mess.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_FAIL"), CommonUtil.ResourceValue("MLP_FILE"));
                msg.Title = _sharedResources["COM_MSG_DELETE_FAIL"];
                msg.Error = true;
            }
            return Json(msg);
        }
        #endregion

        #region Activity
        [HttpPost]
        public object InsertLogData([FromBody]ImprovementActivityLogDataRes obj)
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
                    msg.Title = _stringLocalizer["ASSETIMPRO_MSG_ADD_ACTIVITY_SUCCESS"];
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
                    //msg.Title = "Thêm thuộc tính thành công";
                    msg.Title = _stringLocalizer["ASSETIMPRO_MSG_ADD_PROPERTY_SUCCESS"];
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
        public object JTableActivity([FromBody]JTableImprovementActivityModel jTablePara)
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

        public void InsertLogDataAuto(string actCode, AssetImprovementHeader obj)
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
            var query = ((from a in _context.EDMSRepoCatFiles.Where(x => x.ObjectCode == jTablePara.AssetCode && x.ObjectType == EnumHelper<ObjectType>.GetDisplayValue(ObjectType.AssetImprove))
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
                               && x.ObjectCode.Equals(obj.AssetCode) && x.ObjectType.Equals(EnumHelper<ObjectType>.GetDisplayValue(ObjectType.AssetImprove)));
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

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_contractController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_inventoryController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerFp.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerCus.GetAllStrings().Select(x => new { x.Name, x.Value }))
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

        public class JTableModelAct : JTableModel
        {
            public int TicketID { get; set; }
            public string TicketCode { get; set; }
            public string Title { get; set; }
            public string Branch { get; set; }
            public string DepartTransfer { get; set; }
            public string LocationTransfer { get; set; }
            public string UnitMaintenance { get; set; }
            public string LocationReceived { get; set; }
            public string UserTransfer { get; set; }
            public string StartTime { get; set; }
            public string ReceivedTime { get; set; }
            public string Status { get; set; }
            public string Note { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
        }
    }

    public class AssetImprovementHeaderModel
    {
        public int TicketID { get; set; }
        public string QRCode { get; set; }
        public string TicketCode { get; set; }
        public string Title { get; set; }
        public string Branch { get; set; }
        public string DepartTransfer { get; set; }
        public string LocationTransfer { get; set; }
        public string UnitMaintenance { get; set; }
        public string LocationReceived { get; set; }
        public string UserTransfer { get; set; }
        public string StartTime { get; set; }
        public string ReceivedTime { get; set; }
        public string Status { get; set; }
        public string Note { get; set; }
        public string ObjActCode { get; set; }
        public int TotalMoney { get; set; }
        public string Currency { get; set; }
        public string WorkflowCat { get; set; }
        public string ActRepeat { get; set; }
    }
    public class AssetImprovementDetailsModel
    {
        public string AssetCode { get; set; }
        public string TicketCode { get; set; }
        public int AssetQuantity { get; set; }
        public long TotalMoney { get; set; }
        public string StatusAsset { get; set; }
        public string Note { get; set; }
    }
    public class AssetImprovementCategoryModel
    {
        public int CategoryID { get; set; }
        public string CategoryName { get; set; }
        public string CategoryCode { get; set; }
        public string AssetCodeCategory { get; set; }
        public int Quantity { get; set; }
        public long Price { get; set; }
        public long TotalMoneyCategory { get; set; }
        public string StatusCategory { get; set; }
        public string NoteCategory { get; set; }
        public string TicketCodeCategory { get; set; }
    }
    public class ImprovementActivityLogDataRes
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
    public class JTableImprovementActivityModel : JTableModel
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
}