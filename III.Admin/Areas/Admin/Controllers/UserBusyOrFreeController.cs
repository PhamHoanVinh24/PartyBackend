using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using System.IO;
using III.Domain.Enums;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class UserBusyOrFreeController : BaseController
    {
        public class UserBusyOrFreeJtableModel : JTableModel
        {
            public int ID { get; set; }
            public string StartTime { get; set; }
            public string EndTime { get; set; }
            public string UserId { get; set; }
            public string Status { get; set; }
            public string Note { get; set; }
        }
        private readonly EIMDBContext _context;
        private readonly IGoogleApiService _googleAPI;
        private readonly IUploadService _upload;
        private readonly IStringLocalizer<UserBusyOrFreeController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IStringLocalizer<CardJobController> _stringLocalizerCardJob;

        private readonly IStringLocalizer<WorkFlowHomeController> _stringLocalizerWfHome;

        private readonly IStringLocalizer<CardWorkHomeController> _stringLocalizerCWH;
        private readonly IStringLocalizer<WarehouseDigitalHomeController> _stringLocalizerWHH;
        private readonly IStringLocalizer<EmployeeHomeController> _stringLocalizerEmpHome;
        private readonly IStringLocalizer<AssetBuyerHomeController> _stringLocalizerAssetBuyerHome;
        private readonly IStringLocalizer<ContentManageHomeController> _stringLocalizerContentManage;
        private readonly IStringLocalizer<ContractHomeController> _stringLocalizerContractHome;
        private readonly IStringLocalizer<CustomerHomeController> _stringLocalizerCusHome;
        private readonly IStringLocalizer<FundsHomeController> _stringLocalizerFundHome;
        private readonly IStringLocalizer<MaintenAssetHomeController> _stringLocalizerMaintenAssetHome;
        private readonly IStringLocalizer<NomalListAssetHomeController> _stringLocalizerNormalListAssetHome;
        private readonly IStringLocalizer<NomalListWareHouseHomeController> _stringLocalizerListWarehouseHome;
        private readonly IStringLocalizer<ProjectHomeController> _stringLocalizerProjHome;
        private readonly IStringLocalizer<ReportWareHouseHomeController> _stringLocalizerRptWareHome;
        private readonly IStringLocalizer<SaleWareHouseHomeController> _stringLocalizerSaleWareHome;
        private readonly IStringLocalizer<ServiceHomeController> _stringLocalizerServiceHome;
        private readonly IStringLocalizer<SupplierHomeController> _stringLocalizerSuppHome;
        private readonly IStringLocalizer<SysTemSettingHomeController> _stringLocalizerSysSetHome;
        private readonly IStringLocalizer<IotHomeSetupController> _stringLocalizerIotHome;
        private readonly IStringLocalizer<UserManageHomeController> _stringLocalizerUserManageHome;
        private readonly IStringLocalizer<WarringFundsHomeController> _stringLocalizerWarningFundHome;
        private readonly IStringLocalizer<MenuStoreController> _stringLocalizerMenuStore;
        private readonly IStringLocalizer<MenuAssetOperationController> _stringLocalizerMenuAsset;
        private readonly IStringLocalizer<MenuFinanceController> _stringLocalizerFinance;
        private readonly IStringLocalizer<MenuWfSystemController> _stringLocalizerWfSystem;
        private readonly IStringLocalizer<MenuSystemSettingController> _stringLocalizerSystemSet;
        private readonly IStringLocalizer<MenuCenterController> _stringLocalizerMenuCenter;

        public UserBusyOrFreeController(EIMDBContext context, IGoogleApiService googleAPI, IUploadService upload,
            IStringLocalizer<CardJobController> stringLocalizerCardJob,
            IStringLocalizer<UserBusyOrFreeController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources,
            IStringLocalizer<WorkFlowHomeController> stringLocalizerWfHome, IStringLocalizer<CardWorkHomeController> stringLocalizerCWH,
            IStringLocalizer<WarehouseDigitalHomeController> stringLocalizerWHH, 
            IStringLocalizer<EmployeeHomeController> stringLocalizerEmpHome, 
            IStringLocalizer<AssetBuyerHomeController> stringLocalizerAssetBuyerHome,
            IStringLocalizer<ContentManageHomeController> stringLocalizerContentManage,
            IStringLocalizer<ContractHomeController> stringLocalizerContractHome,
            IStringLocalizer<CustomerHomeController> stringLocalizerCusHome,
            IStringLocalizer<FundsHomeController> stringLocalizerFundHome,
            IStringLocalizer<MaintenAssetHomeController> stringLocalizerMaintenAssetHome,
            IStringLocalizer<NomalListAssetHomeController> stringLocalizerNormalListAssetHome,
            IStringLocalizer<NomalListWareHouseHomeController> stringLocalizerListWarehouseHome,
            IStringLocalizer<ProjectHomeController> stringLocalizerProjHome,
            IStringLocalizer<ReportWareHouseHomeController> stringLocalizerRptWareHome,
            IStringLocalizer<SaleWareHouseHomeController> stringLocalizerSaleWareHome,
            IStringLocalizer<ServiceHomeController> stringLocalizerServiceHome,
            IStringLocalizer<SupplierHomeController> stringLocalizerSuppHome,
            IStringLocalizer<IotHomeSetupController> stringLocalizerIotHome,
            IStringLocalizer<SysTemSettingHomeController> stringLocalizerSysSetHome,
            IStringLocalizer<UserManageHomeController> stringLocalizerUserManageHome,
            IStringLocalizer<WarringFundsHomeController> stringLocalizerWarningFundHome,
            IStringLocalizer<MenuStoreController> stringLocalizerMenuStore, IStringLocalizer<MenuAssetOperationController> stringLocalizerMenuAsset,
            IStringLocalizer<MenuFinanceController> stringLocalizerFinance, IStringLocalizer<MenuWfSystemController> stringLocalizerWfSystem,
            IStringLocalizer<MenuSystemSettingController> stringLocalizerSystemSet, IStringLocalizer<MenuCenterController> stringLocalizerMenuCenter)
        {
            _context = context;
            _googleAPI = googleAPI;
            _upload = upload;
            _sharedResources = sharedResources;
            _stringLocalizer = stringLocalizer;
            _stringLocalizerCardJob = stringLocalizerCardJob;
            _stringLocalizerWfHome = stringLocalizerWfHome;
            _stringLocalizerCWH = stringLocalizerCWH;
            _stringLocalizerWHH = stringLocalizerWHH;
            _stringLocalizerEmpHome = stringLocalizerEmpHome;
            _stringLocalizerAssetBuyerHome = stringLocalizerAssetBuyerHome;
            _stringLocalizerContentManage = stringLocalizerContentManage;
            _stringLocalizerContractHome = stringLocalizerContractHome;
            _stringLocalizerCusHome = stringLocalizerCusHome;
            _stringLocalizerFundHome = stringLocalizerFundHome;
            _stringLocalizerMaintenAssetHome = stringLocalizerMaintenAssetHome;
            _stringLocalizerNormalListAssetHome = stringLocalizerNormalListAssetHome;
            _stringLocalizerListWarehouseHome = stringLocalizerListWarehouseHome;
            _stringLocalizerProjHome = stringLocalizerProjHome;
            _stringLocalizerRptWareHome = stringLocalizerRptWareHome;
            _stringLocalizerSaleWareHome = stringLocalizerSaleWareHome;
            _stringLocalizerServiceHome = stringLocalizerServiceHome;
            _stringLocalizerSuppHome = stringLocalizerSuppHome;
            _stringLocalizerSysSetHome = stringLocalizerSysSetHome;
            _stringLocalizerUserManageHome = stringLocalizerUserManageHome;
            _stringLocalizerWarningFundHome = stringLocalizerWarningFundHome;
            _stringLocalizerMenuStore = stringLocalizerMenuStore;
            _stringLocalizerMenuAsset = stringLocalizerMenuAsset;
            _stringLocalizerFinance = stringLocalizerFinance;
            _stringLocalizerWfSystem = stringLocalizerWfSystem;
            _stringLocalizerSystemSet = stringLocalizerSystemSet;
            _stringLocalizerMenuCenter = stringLocalizerMenuCenter;
            _stringLocalizerIotHome = stringLocalizerIotHome;
        }
        [Breadcrumb("ViewData.CrumbUserBusyFree", AreaName = "Admin", FromAction = "Index", FromController = typeof(EmployeeHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbEmployeeHome"] = _sharedResources["COM_CRUMB_EMPLOYEE_HOME"];
            ViewData["CrumbUserBusyFree"] = _sharedResources["COM_CRUMB_BUSY_FREE"];
            return View();
        }
        [HttpPost]
        public object JTable([FromBody]UserBusyOrFreeJtableModel jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var today = DateTime.Today;
            var fromDate = !string.IsNullOrEmpty(jTablePara.StartTime) ? DateTime.ParseExact(jTablePara.StartTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.EndTime) ? DateTime.ParseExact(jTablePara.EndTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var query = (from a in _context.UserDeclareBusyOrFrees
                         join b in _context.Users on a.UserId equals b.Id
                         where !a.IsDeleted
                         && (string.IsNullOrEmpty(jTablePara.Status) || (a.IsFree.Equals(jTablePara.Status)))
                         && (string.IsNullOrEmpty(jTablePara.UserId) || (a.UserId.Equals(jTablePara.UserId)))
                         && (fromDate == null || (a.StartTime >= fromDate))
                         && (toDate == null || (a.EndTime <= toDate))
                         select new
                         {
                             a.ID,
                             a.UserId,
                             FullName = b.GivenName,
                             a.Note,
                             a.IsFree,
                             a.StartTime,
                             a.EndTime
                         });
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Select(x => new
            {
                x.ID,
                x.UserId,
                x.FullName,
                Status = x.IsFree == EnumHelper<UserBusyOrFreeEnum>.GetDisplayValue(UserBusyOrFreeEnum.Free) ? "<span class ='text-success'>Rảnh</span>" : "<span class ='text-danger'>Bận</span>",
                x.Note,
                x.StartTime,
                x.EndTime
            }).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "ID", "UserId", "FullName", "Status", "Note", "StartTime", "EndTime");
            return Json(jdata);
        }

        [HttpPost]
        public object GetItem(int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            var data = _context.UserDeclareBusyOrFrees.FirstOrDefault(x => x.ID == id);
            if (data != null)
            {
                var model = new UserBusyOrFreeJtableModel
                {
                    ID = id,
                    UserId = data.UserId,
                    Status = data.IsFree,
                    StartTime = data.StartTime.ToString("dd/MM/yyyy"),
                    EndTime = data.EndTime.ToString("dd/MM/yyyy"),
                    Note = data.Note,
                };
                msg.Object = model;
            }
            else
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                //msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_NOT_EXITS_FILE"));
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetListStatus()
        {
            var list = new List<UserBusyOrFreeStatus>();
            var Busy = new UserBusyOrFreeStatus
            {
                Code = EnumHelper<UserBusyOrFreeEnum>.GetDisplayValue(UserBusyOrFreeEnum.Busy),
                Name = UserBusyOrFreeEnum.Busy.DescriptionAttr()
            };
            list.Add(Busy);

            var Free = new UserBusyOrFreeStatus
            {
                Code = EnumHelper<UserBusyOrFreeEnum>.GetDisplayValue(UserBusyOrFreeEnum.Free),
                Name = UserBusyOrFreeEnum.Free.DescriptionAttr()
            };
            list.Add(Free);

            return Json(list);
        }

        [HttpPost]
        public JsonResult GetListUser()
        {
            var data = _context.Users.Select(x => new { Code = x.Id, Name = x.GivenName });
            return Json(data);
        }


        [HttpPost]
        public JsonResult Insert([FromBody]UserBusyOrFreeJtableModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var startTime = DateTime.ParseExact(obj.StartTime, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                var endTime = DateTime.ParseExact(obj.EndTime, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                var checkExist = _context.UserDeclareBusyOrFrees.FirstOrDefault(x => x.UserId == obj.UserId && (x.StartTime <= endTime && x.EndTime >= startTime) && !x.IsDeleted);
                if (checkExist == null)
                {
                    var model = new UserDeclareBusyOrFree
                    {
                        UserId = obj.UserId,
                        Note = obj.Note,
                        StartTime = startTime,
                        EndTime = endTime,
                        IsFree = obj.Status,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now
                    };
                    _context.UserDeclareBusyOrFrees.Add(model);
                    msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                    _context.SaveChanges();
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["UBOF_MSG_RPT_BUSY_FREE"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Update([FromBody]UserBusyOrFreeJtableModel obj)
        {
            var data = _context.UserDeclareBusyOrFrees.FirstOrDefault(x => x.ID == obj.ID);
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                if (data != null)
                {
                    var startTime = DateTime.ParseExact(obj.StartTime, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                    var endTime = DateTime.ParseExact(obj.EndTime, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                    var checkExist = _context.UserDeclareBusyOrFrees.FirstOrDefault(x => x.UserId == obj.UserId && x.ID != obj.ID && (x.StartTime <= endTime && x.EndTime >= startTime));
                    if (checkExist == null)
                    {
                        data.UserId = obj.UserId;
                        data.Note = obj.Note;
                        data.StartTime = DateTime.ParseExact(obj.StartTime, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                        data.EndTime = DateTime.ParseExact(obj.EndTime, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                        data.IsFree = obj.Status;
                        data.UpdatedBy = ESEIM.AppContext.UserName;
                        data.UpdatedTime = DateTime.Now;
                        _context.UserDeclareBusyOrFrees.Update(data);
                        _context.SaveChanges();
                        msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["UBOF_MSG_RPT_BUSY_FREE"];
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
        [HttpPost]
        public JsonResult Delete(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.UserDeclareBusyOrFrees.FirstOrDefault(x => x.ID == id);
                if (data != null)
                {
                    data.IsDeleted = true;
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    _context.UserDeclareBusyOrFrees.Update(data);
                }
                _context.SaveChanges();
                msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_DELETE_FAIL"];
            }
            return Json(msg);
        }
        public class UserBusyOrFreeStatus
        {
            public string Code { get; set; }
            public string Name { get; set; }
        }

        #region FreeBusy
        public bool GetUserAppointment(string userId, string startTime, string endTime)
        {
            //Busy : true
            // Free: false
            var timeStart = DateTime.ParseExact(startTime, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var timeEnd = DateTime.ParseExact(endTime, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var checkUserBusyOrFree = _context.UserDeclareBusyOrFrees.FirstOrDefault(x => x.UserId == userId && x.IsFree == EnumHelper<UserBusyOrFreeEnum>.GetDisplayValue(UserBusyOrFreeEnum.Busy) && !x.IsDeleted && x.StartTime <= timeStart && x.EndTime >= timeEnd);
            if (checkUserBusyOrFree != null)
            {
                return true;
            }
            //else
            //{

            //    var checkUserLate = _context.WorkShiftCheckInOuts.Where(x => x.UserId == userId && !x.IsDeleted
            //    && (x.Action == EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.NoWork) && x.ActionTime >= timeStart && x.ActionTime <= timeEnd)
            //    && (x.Action == EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.GoLate) && x.ActionTime >= timeStart && x.ActionTime <= timeEnd)
            //    && (x.Action == EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.QuitWork) && x.ActionTime >= timeStart && x.ActionTime <= timeEnd)).ToList();
            //    if (checkUserLate.Count == 0)
            //    {
            //        var uName = _context.Users.FirstOrDefault(x => x.Id == userId);
            //        var ids = _context.WORKItemSessionResults.Where(x => x.CreatedBy.Equals(uName.UserName) && !x.IsDeleted).ToList();
            //        if (ids.Count != 0)
            //        {
            //            var id = ids.Max(x => x.Id);
            //            var progress = _context.WORKItemSessionResults.FirstOrDefault(x => x.Id == id);
            //            if (progress.ProgressFromLeader < 100)
            //            {
            //                return true;
            //            }
            //        }

            //    }
            //}
            return false;
        }
        #endregion
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

        [HttpGet]
        public IActionResult TranslationWf(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizerWfHome.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }

        [HttpGet]
        public IActionResult TranslationCWH(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizerCardJob.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_stringLocalizerEmpHome.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerCWH.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerWfHome.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }

        [HttpGet]
        public IActionResult TranslationDigitalHome(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizerWHH.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }

        [HttpGet]
        public IActionResult TranslationEmpHome(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizerEmpHome.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }

        [HttpGet]
        public IActionResult TranslationAssetBuyerHome(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizerAssetBuyerHome.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }

        [HttpGet]
        public IActionResult TranslationContentManageHome(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizerContentManage.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }

        [HttpGet]
        public IActionResult TranslationContractHome(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizerContractHome.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }

        [HttpGet]
        public IActionResult TranslationCusHome(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizerCusHome.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }

        [HttpGet]
        public IActionResult TranslationFundHome(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizerFundHome.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }

        [HttpGet]
        public IActionResult TranslationMaintenAssetHome(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizerMaintenAssetHome.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }

        [HttpGet]
        public IActionResult TranslationNormalListAssetHome(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizerNormalListAssetHome.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }

        [HttpGet]
        public IActionResult TranslationNormalListWareHouseAssetHome(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizerListWarehouseHome.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }

        [HttpGet]
        public IActionResult TranslationProjHome(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizerProjHome.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }

        [HttpGet]
        public IActionResult TranslationRptWareHome(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizerRptWareHome.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }

        [HttpGet]
        public IActionResult TranslationSaleWareHome(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizerSaleWareHome.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }

        [HttpGet]
        public IActionResult TranslationServicesHome(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizerServiceHome.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }

        [HttpGet]
        public IActionResult TranslationSuppHome(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizerSuppHome.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }

        [HttpGet]
        public IActionResult TranslationIotHome(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizerIotHome.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }

        [HttpGet]
        public IActionResult TranslationSysSetHome(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizerSysSetHome.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }

        [HttpGet]
        public IActionResult TranslationUserManageHome(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizerUserManageHome.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }

        [HttpGet]
        public IActionResult TranslationWarningFundHome(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizerWarningFundHome.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }

        [HttpGet]
        public IActionResult TranslationMenuStore(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizerMenuStore.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }

        [HttpGet]
        public IActionResult TranslationMenuAsset(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizerMenuAsset.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }

        [HttpGet]
        public IActionResult TranslationMenuFinance(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizerFinance.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }

        [HttpGet]
        public IActionResult TranslationMenuWf(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizerWfSystem.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }

        [HttpGet]
        public IActionResult TranslationMenuSystemSet(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizerSystemSet.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }

        [HttpGet]
        public IActionResult TranslationMenuCenter(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizerMenuCenter.GetAllStrings().Select(x => new { x.Name, x.Value })
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