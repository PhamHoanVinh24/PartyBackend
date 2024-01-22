using System;
using System.Collections.Generic;
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
using EntityFrameworkCore.MemoryJoin;
using System.Data;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class LmsTaskManagementController : Controller
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly ICardJobService _cardService;
        private readonly IFCMPushNotification _notification;
        private readonly IGoogleApiService _googleAPI;
        private readonly IStringLocalizer<LmsTaskManagementController> _stringLocalizer;
        private readonly IStringLocalizer<CardJobController> _stringLocalizerCJ;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IStringLocalizer<ProjectController> _stringLocalizerProject;
        private readonly IStringLocalizer<CustomerController> _stringLocalizerCustomer;
        private readonly IStringLocalizer<SupplierController> _stringLocalizerSupplier;
        private readonly IStringLocalizer<ContractController> _stringLocalizerContract;
        private readonly IStringLocalizer<LmsTaskManagementController> _stringLocalizerTMC;
        private readonly IStringLocalizer<SendRequestWorkPriceController> _stringLocalizerRQWPrice;
        private readonly IStringLocalizer<ContractPoController> _stringLocalizerContractPO;
        private readonly IStringLocalizer<OrderRequestRawController> _stringLocalizerRQRaw;
        private readonly IStringLocalizer<ServiceCategoryController> _stringLocalizerSVC;
        private readonly IStringLocalizer<MaterialProductController> _stringLocalizerMaterialProd;
        private readonly IStringLocalizer<StaffTimeKeepingController> _staffTimeKeepingController;
        private readonly IStringLocalizer<EDMSRepositoryController> _stringLocalizerEDMSFile;
        private readonly IStringLocalizer<LmsDashBoardController> _stringLocalizerLms;
        private readonly IRepositoryService _repositoryService;
        private static AsyncLocker<string> objLock = new AsyncLocker<string>();
        public readonly string module_name = "LMS_TASK";
        public string path_upload_file = "";
        public string repos_code = "";
        public string cat_code = "";
        public int host_type = 1;
        public IActionResult Index()
        {
            return View();
        }
        public LmsTaskManagementController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment,
            ICardJobService cardService, IFCMPushNotification notification, IGoogleApiService googleAPI,
            IStringLocalizer<LmsTaskManagementController> stringLocalizer, IStringLocalizer<CardJobController> stringLocalizerCJ, IStringLocalizer<SharedResources> sharedResources,
            IStringLocalizer<ProjectController> stringLocalizerProject, IStringLocalizer<CustomerController> stringLocalizerCustomer,
            IStringLocalizer<SupplierController> stringLocalizerSupplier, IStringLocalizer<ContractController> stringLocalizerContract,
            IStringLocalizer<SendRequestWorkPriceController> stringLocalizerRQWPrice, IStringLocalizer<ContractPoController> stringLocalizerContractPO,
            IStringLocalizer<OrderRequestRawController> stringLocalizerRQRaw, IStringLocalizer<ServiceCategoryController> stringLocalizerSVC,
            IStringLocalizer<LmsTaskManagementController> stringLocalizerTMC, IStringLocalizer<LmsDashBoardController> stringLocalizerLms,
            IStringLocalizer<MaterialProductController> stringLocalizerMaterialProd, IStringLocalizer<StaffTimeKeepingController> staffTimeKeepingController,
            IStringLocalizer<EDMSRepositoryController> stringLocalizerEDMSFile, IRepositoryService repositoryService)
        {
            _context = context;
            _upload = upload;
            _hostingEnvironment = hostingEnvironment;
            _cardService = cardService;
            _notification = notification;
            _googleAPI = googleAPI;
            _stringLocalizer = stringLocalizer;
            _stringLocalizerCJ = stringLocalizerCJ;
            _stringLocalizerTMC = stringLocalizerTMC;
            _sharedResources = sharedResources;
            _stringLocalizerProject = stringLocalizerProject;
            _stringLocalizerCustomer = stringLocalizerCustomer;
            _stringLocalizerSupplier = stringLocalizerSupplier;
            _stringLocalizerContract = stringLocalizerContract;
            _stringLocalizerRQWPrice = stringLocalizerRQWPrice;
            _stringLocalizerContractPO = stringLocalizerContractPO;
            _stringLocalizerRQRaw = stringLocalizerRQRaw;
            _stringLocalizerSVC = stringLocalizerSVC;
            _stringLocalizerMaterialProd = stringLocalizerMaterialProd;
            _staffTimeKeepingController = staffTimeKeepingController;
            _stringLocalizerLms = stringLocalizerLms;
            _stringLocalizerEDMSFile = stringLocalizerEDMSFile;
            _repositoryService = repositoryService;
            var obj = (EDMSCatRepoSetting)_upload.GetPathByModule(module_name).Object;
            repos_code = obj.ReposCode;
            cat_code = obj.CatCode;
            if (obj.Path == "")
            {
                host_type = 1;
                path_upload_file = obj.FolderId;
            }
            else
            {
                host_type = 0;
                path_upload_file = obj.Path;
            }
        }
        #region Search
        public class AdvanceSearchObj : JTableModel
        {
            public string ListCode { get; set; }
            public string BoardCode { get; set; }
            public string CardName { get; set; }
            public string Member { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string Status { get; set; }
            public string ObjDependency { get; set; }
            public string ObjCode { get; set; }
            public List<Properties> ListObjCode { get; set; }
            public int TabBoard { get; set; }
            public int Page { get; set; }
            public string Description { get; set; }
            public string Comment { get; set; }
            public string SubItem { get; set; }
            public string Object { get; set; }
            public string BranchId { get; set; }
            public string ObjType { get; set; }
            public string Project { get; set; }
            public string Department { get; set; }
            public string Group { get; set; }
            public string UserId { get; set; }
            public string Supplier { get; set; }
            public string Customer { get; set; }
            public string Contract { get; set; }
            public string UserName { get; set; }
            public string BoardSearch { get; set; }
            public int CurrentPageList { get; set; }
            public string WorkflowInstCode { get; set; }
        }
        #endregion

        #region Board
        [HttpPost]
        public object GetBoardsType()
        {
            var list = _context.CommonSettings
                .Where(x => x.IsDeleted == false && x.Group == "BOARD_TYPE")
                .Select(x => new { Code = x.CodeSet, Name = x.ValueSet })
                .AsNoTracking();
            return Json(list);
        }

        [HttpPost]
        public JsonResult GetBoardsWithGroupBy()
        {
            var query = from a in _context.LmsBoardTasks
                        where a.IsDeleted == false
                        //group a by a.BoardType into grp
                        group a by new { a.BoardType } into grp
                        orderby grp.Key.BoardType descending
                        select new
                        {
                            BoardType = grp.FirstOrDefault().BoardType,
                            BoardTypeText = _context.CommonSettings.FirstOrDefault(x => x.CodeSet == grp.First().BoardType).ValueSet ?? "",
                            ListBoard = grp.Select(x => new
                            {
                                x.BoardID,
                                x.BoardCode,
                                x.BoardName,
                                x.Completed,
                                x.Cost,
                                x.LocationText,
                                x.LocationGps,
                                x.BoardType,
                                x.Visibility,
                                x.BackgroundColor,
                                x.BackgroundImage,
                                x.Avatar,
                                x.BeginTime,
                                x.Deadline,
                                x.DeadLineView,
                                x.Branch,
                                x.Department,
                                BranchText = _context.AdOrganizations.FirstOrDefault(k => k.IsEnabled && k.OrgAddonCode == x.Branch).OrgName ?? "",
                                DepartmentText = _context.AdDepartments.FirstOrDefault(k => k.IsEnabled && k.DepartmentCode == x.Department).Title ?? ""
                            }).GroupBy(x => new { x.Branch, x.Department })
                        };
            return Json(query);
        }

        [HttpPost]
        public JsonResult GetBoardsWithWorkFlow(string objCode)
        {
            if (string.IsNullOrEmpty(objCode))
            {
                var query = (from a in _context.LmsBoardTasks
                             join b in _context.WfObjects on a.BoardCode equals b.WfObjCode
                             where a.IsDeleted == false && b.WfObjType == "BOARD"
                             group a by new { a.BoardType } into grp
                             orderby grp.Key.BoardType descending
                             select new
                             {
                                 BoardType = grp.FirstOrDefault(),
                                 BoardTypeText = _context.CommonSettings.FirstOrDefault(x => x.CodeSet == grp.First().BoardType).ValueSet ?? "",
                                 ListBoard = grp.Select(x => new
                                 {
                                     x.BoardID,
                                     x.BoardCode,
                                     x.BoardName,
                                     x.Completed,
                                     x.Cost,
                                     x.LocationText,
                                     x.LocationGps,
                                     x.BoardType,
                                     x.Visibility,
                                     x.BackgroundColor,
                                     x.BackgroundImage,
                                     x.Avatar,
                                     x.BeginTime,
                                     x.Deadline,
                                     x.DeadLineView,
                                 })
                             });
                return Json(query);
            }
            else
            {
                var query = (from a in _context.LmsBoardTasks
                             join b in _context.WfObjects on a.BoardCode equals b.WfObjCode
                             where a.IsDeleted == false && b.WfObjType == "BOARD"
                             group a by new { a.BoardType } into grp
                             orderby grp.Key.BoardType descending
                             select new
                             {
                                 BoardType = grp.FirstOrDefault(),
                                 BoardTypeText = _context.CommonSettings.FirstOrDefault(x => x.CodeSet == grp.First().BoardType).ValueSet ?? "",
                                 ListBoard = grp.Select(x => new
                                 {
                                     x.BoardID,
                                     x.BoardCode,
                                     x.BoardName,
                                     Completed = _cardService.GetCompletedBoard(x.BoardCode, objCode),
                                     x.Cost,
                                     x.LocationText,
                                     x.LocationGps,
                                     x.BoardType,
                                     x.Visibility,
                                     x.BackgroundColor,
                                     x.BackgroundImage,
                                     x.Avatar,
                                     x.BeginTime,
                                     x.Deadline,
                                     x.DeadLineView,
                                 })
                             });
                return Json(query);
            }

        }

        [HttpPost]
        public JsonResult GetListBoard()
        {
            var data = _context.LmsBoardTasks.Where(x => x.IsDeleted == false).Select(x => new
            {
                x.BoardID,
                x.BoardCode,
                x.BoardName,
                x.BoardType,
                BoardTypeText = _context.CommonSettings.FirstOrDefault(y => y.CodeSet == x.BoardType).ValueSet ?? "",
                OrderBoardType = (x.BoardType == "BOARD_REPEAT") ? 1 : x.BoardType == "BOARD_PROJECT" ? 2 : 3,
                x.Avatar,
                x.BackgroundColor,
                x.BackgroundImage,
                x.BeginTime,
                x.Completed,
                x.Cost,
                x.Deadline,
                x.LocationGps,
                x.LocationText,
            }).OrderBy(x => x.OrderBoardType).AsNoTracking();
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetBoardDetail(string BoardCode, string objCode)
        {
            var data = _context.LmsBoardTasks.FirstOrDefault(x => x.BoardCode.Equals(BoardCode));
            if (data != null && string.IsNullOrEmpty(objCode))
            {
                data.BeginTimeView = data.BeginTime.ToString("dd/MM/yyyy");
                data.DeadLineView = data.Deadline.ToString("dd/MM/yyyy");
                data.TeamName = _context.Teams.FirstOrDefault(x => x.TeamCode == data.TeamCode)?.TeamName;

            }
            else if (data != null && !string.IsNullOrEmpty(objCode))
            {
                data.BeginTimeView = data.BeginTime.ToString("dd/MM/yyyy");
                data.DeadLineView = data.Deadline.ToString("dd/MM/yyyy");
                data.TeamName = _context.Teams.FirstOrDefault(x => x.TeamCode == data.TeamCode)?.TeamName;
                data.Completed = _cardService.GetCompletedBoard(data.BoardCode, objCode);
            }
            return Json(data);
        }

        [HttpPost]
        public JsonResult InsertBoard([FromBody] LmsBoardTask data)
        {
            if (string.IsNullOrEmpty(data.BoardName))
            {
                return Json(new JMessage() { Error = true, Title = String.Format(_stringLocalizerCJ["CJ_CURD_MSG_CONTENT_BLANK"]) });//"Chưa nhập nội dung!"
            }
            var msg = new JMessage() { Error = false };
            try
            {
                data.BoardCode = "BOARD_" + (Guid.NewGuid().ToString());
                if (string.IsNullOrEmpty(data.BackgroundColor) && string.IsNullOrEmpty(data.BackgroundImage))
                {
                    data.BackgroundColor = "#179da7";
                }
                data.BoardType = string.IsNullOrEmpty(data.BoardType) ? "BOARD_OTHER" : data.BoardType;
                data.BeginTime = !string.IsNullOrEmpty(data.BeginTimeView) ? DateTime.ParseExact(data.BeginTimeView, "dd/MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;
                data.Avatar = "/images/logo/trello.png";
                data.Deadline = !string.IsNullOrEmpty(data.DeadLineView) ? DateTime.ParseExact(data.DeadLineView, "dd/MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;
                _context.LmsBoardTasks.Add(data);

                //Insert list default

                var workOSList = new LmsListTask
                {
                    ListCode = "LIST_" + Guid.NewGuid().ToString().ToUpper(),
                    BoardCode = data.BoardCode,
                    Status = 1,
                    Order = _context.LmsListTasks.Count() + 1,
                    Background = "background-color: rgb(68, 190, 199);",
                    BeginTime = DateTime.Now,
                    Deadline = data.Deadline,
                    ListName = data.BoardName,
                };
                _context.LmsListTasks.Add(workOSList);
                _context.SaveChanges();
                msg.Object = data.BoardCode;
                msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizerCJ["CJ_CURD_LBL_BOARD_CODE"]);//"Thêm bảng mới thành công";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                //msg.Title = String.Format(_stringLocalize["COM_MSG_ADD_FAILED"), _stringLocalize["CJ_CURD_LBL_BOARD_CODE"));// "Có lỗi khi thêm bảng mới!";
                msg.Object = ex;
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult CheckExistBoardName([FromBody] LmsBoardTask data)
        {
            bool isExistBoard = false;
            var checkExist = _context.LmsBoardTasks.FirstOrDefault(x => x.IsDeleted == false && x.BoardName.ToLower() == data.BoardName.ToLower());
            if (checkExist != null)
            {
                isExistBoard = true;
            }
            return Json(isExistBoard);
        }

        [HttpPost]
        public JsonResult EditBoard([FromBody] LmsBoardTask data)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var editData = _context.LmsBoardTasks.FirstOrDefault(x => x.BoardID == data.BoardID);
                editData.BoardName = data.BoardName;
                editData.Visibility = data.Visibility;
                editData.BackgroundColor = data.BackgroundColor;
                editData.BackgroundImage = data.BackgroundImage;
                editData.Avatar = data.Avatar;
                editData.TeamCode = data.TeamCode;
                editData.BoardType = data.BoardType;
                editData.Deadline = !string.IsNullOrEmpty(data.DeadLineView) ? DateTime.ParseExact(data.DeadLineView, "dd/MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;
                editData.Branch = data.Branch;
                editData.Department = data.Department;
                _context.LmsBoardTasks.Update(editData);
                _context.SaveChanges();
                msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizerCJ["CJ_CURD_LBL_BOARD_CODE"]);//"Cập nhật thành công!";
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                //msg.Title = String.Format(_stringLocalize["COM_MSG_UPDATE_FAILED"), _stringLocalize["CJ_CURD_LBL_BOARD_CODE"));// "Có lỗi khi cập nhật bảng!";
                return Json(msg);
            }
        }

        [HttpPost]
        public JsonResult DeleteBoard(int id)
        {
            var msg = new JMessage() { Error = true };
            try
            {
                //deleted board
                var data = _context.LmsBoardTasks.FirstOrDefault(x => x.BoardID == id);
                data.IsDeleted = true;
                _context.LmsBoardTasks.Update(data);
                //deleted list
                var list = _context.LmsListTasks.Where(x => x.BoardCode == data.BoardCode).ToList();
                list.ForEach(x => x.IsDeleted = true);

                //deleted card
                var card = _context.LmsTasks.Where(x => list.Any(y => y.ListCode == x.ListCode)).ToList();
                card.ForEach(x => x.IsDeleted = true);

                ////delete relative
                //var relative = _context.CardMappings.Where(x => x.BoardCode == data.BoardCode).AsNoTracking().ToList();
                //_context.CardMappings.RemoveRange(relative);

                _context.SaveChanges();
                msg.Error = false;
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizerCJ["CJ_CURD_LBL_BOARD_CODE"]);//"Xóa bảng thành công";
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                //msg.Title = String.Format(_stringLocalize["COM_MSG_DELETE_FAIL"), _stringLocalize["CJ_CURD_LBL_BOARD_CODE"));//"Có lỗi khi xóa bảng!";
                return Json(msg);
            }
        }

        [NonAction]
        public List<GridLmsTaskJtable> GetGirdCardBoard(AdvanceSearchObj dataSearch)
        {
            var session = HttpContext.GetSessionUser();
            var user = _context.Users.FirstOrDefault(x => x.Active && x.UserName == ESEIM.AppContext.UserName);
            var fromDate = string.IsNullOrEmpty(dataSearch.FromDate) ? (DateTime?)null : DateTime.ParseExact(dataSearch.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var toDate = string.IsNullOrEmpty(dataSearch.ToDate) ? (DateTime?)null : DateTime.ParseExact(dataSearch.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);

            var fromDatePara = fromDate.HasValue ? fromDate.Value.ToString("yyyy-MM-dd") : "";
            var toDatePara = toDate.HasValue ? toDate.Value.ToString("yyyy-MM-dd") : "";
            var listUserOfBranch = "";
            if (session.IsBranch)
            {
                if (session.ListUserOfBranch.Any())
                {
                    listUserOfBranch = string.Join(",", session.ListUserOfBranch);
                }
            }
            if (!string.IsNullOrEmpty(dataSearch.BoardCode))
            {
                if (string.IsNullOrEmpty(dataSearch.CardName) && string.IsNullOrEmpty(dataSearch.Object) && string.IsNullOrEmpty(dataSearch.FromDate)
                    && string.IsNullOrEmpty(dataSearch.ToDate) && string.IsNullOrEmpty(dataSearch.Status) && string.IsNullOrEmpty(dataSearch.WorkflowInstCode))
                {
                    string[] param = new string[] { "@PageNo", "@PageSize", "@IsAllData", "@IsUser", "@IsBranch", "@DepartmentId", "@UserName", "@ListUserOfBranch",
                    "@boardCode", "@UserId", "@BranchId", "@WorkflowInstCode" };
                    object[] val = new object[] { dataSearch.CurrentPage, dataSearch.Length , session.IsAllData, session.IsUser, session.IsBranch,
                 !string.IsNullOrEmpty(user.DepartmentId) ? user.DepartmentId : "", session.UserName, listUserOfBranch, dataSearch.BoardCode,
                 session.UserId, !string.IsNullOrEmpty(dataSearch.BranchId) ? dataSearch.BranchId : "", ""};
                    DataTable rs = _repositoryService.GetDataTableProcedureSql("P_GET_LMS_BOARD_TASK_NO_CONDITION", param, val);
                    var query = CommonUtil.ConvertDataTable<GridLmsTaskJtable>(rs);
                    return query;
                }
                else
                {
                    string[] param = new string[] { "@PageNo", "@PageSize", "@IsAllData", "@IsUser", "@IsBranch", "@DepartmentId", "@UserName", "@ListUserOfBranch",
                        "@boardCode", "@UserId", "@BranchId", "@CardName", "@ObjID", "@FromDate", "@ToDate", "@Status", "@WorkflowInstCode" };
                    object[] val = new object[] { dataSearch.CurrentPage, dataSearch.Length , session.IsAllData, session.IsUser, session.IsBranch,
                        !string.IsNullOrEmpty(user.DepartmentId) ? user.DepartmentId : "", session.UserName, listUserOfBranch, dataSearch.BoardCode,
                        session.UserId, !string.IsNullOrEmpty(dataSearch.BranchId) ? dataSearch.BranchId : "", dataSearch.CardName, dataSearch.Object,
                        fromDatePara, toDatePara, dataSearch.Status, !string.IsNullOrEmpty(dataSearch.WorkflowInstCode) ? dataSearch.WorkflowInstCode : ""};
                    DataTable rs = _repositoryService.GetDataTableProcedureSql("P_GET_LMS_BOARD_TASK_WITH_CONDITION", param, val);
                    var query = CommonUtil.ConvertDataTable<GridLmsTaskJtable>(rs);
                    return query;
                }
            }
            else
            {
                if (string.IsNullOrEmpty(dataSearch.CardName) && string.IsNullOrEmpty(dataSearch.Status) && string.IsNullOrEmpty(dataSearch.BoardSearch)
                    && string.IsNullOrEmpty(dataSearch.Contract) && string.IsNullOrEmpty(dataSearch.Project) && string.IsNullOrEmpty(dataSearch.ToDate)
                    && string.IsNullOrEmpty(dataSearch.Supplier) && string.IsNullOrEmpty(dataSearch.Customer) && string.IsNullOrEmpty(dataSearch.Department)
                    && string.IsNullOrEmpty(dataSearch.ListCode) && string.IsNullOrEmpty(dataSearch.Group) && string.IsNullOrEmpty(dataSearch.UserId)
                    && string.IsNullOrEmpty(dataSearch.FromDate) && string.IsNullOrEmpty(dataSearch.WorkflowInstCode))
                {
                    string[] param = new string[] { "@PageNo", "@PageSize", "@IsAllData", "@IsUser", "@IsBranch", "@DepartmentId", "@UserName",
                        "@ListUserOfBranch", "@UserId", "@Branch", "@WorkflowInstCode" };
                    object[] val = new object[] { dataSearch.CurrentPage, dataSearch.Length , session.IsAllData, session.IsUser, session.IsBranch,
                    !string.IsNullOrEmpty(user.DepartmentId) ? user.DepartmentId : "", session.UserName, listUserOfBranch, session.UserId,
                        !string.IsNullOrEmpty(dataSearch.BranchId) ? dataSearch.BranchId : "", ""};
                    DataTable rs = _repositoryService.GetDataTableProcedureSql("P_GET_ALL_LMS_BOARD_TASK_NO_CONDITION", param, val);
                    var query = CommonUtil.ConvertDataTable<GridLmsTaskJtable>(rs);
                    return query;
                }
                else
                {
                    string[] param = new string[] { "@PageNo", "@PageSize", "@fromDate", "@toDate", "@IsAllData", "@IsUser", "@IsBranch", "@UserName",
                        "@ListUserOfBranch", "@DepartmentId", "@BoardSearch", "@UserId", "@BranchId", "@Status", "@CardName", "@ListCode", "@Group",
                        "@Project", "@Customer", "@Supplier", "@Contract", "@UserIdSearch", "@UserNameSearch", "@DepartmentSearch", "@WorkflowInstCode"};

                    object[] val = new object[] { dataSearch.CurrentPage, dataSearch.Length ,fromDatePara, toDatePara, session.IsAllData, session.IsUser,
                        session.IsBranch, session.UserName, listUserOfBranch, !string.IsNullOrEmpty(user.DepartmentId) ? user.DepartmentId : "",
                        !string.IsNullOrEmpty(dataSearch.BoardSearch) ? dataSearch.BoardSearch : "", session.UserId, !string.IsNullOrEmpty(dataSearch.BranchId) ? dataSearch.BranchId : "",
                        !string.IsNullOrEmpty(dataSearch.Status) ? dataSearch.Status : "", dataSearch.CardName, !string.IsNullOrEmpty(dataSearch.ListCode) ? dataSearch.ListCode : "",
                        !string.IsNullOrEmpty(dataSearch.Group) ? dataSearch.Group : "", !string.IsNullOrEmpty(dataSearch.Project) ? dataSearch.Project : "",
                        !string.IsNullOrEmpty(dataSearch.Customer) ? dataSearch.Customer : "", !string.IsNullOrEmpty(dataSearch.Supplier) ? dataSearch.Supplier: "",
                        !string.IsNullOrEmpty(dataSearch.Contract) ? dataSearch.Contract: "", !string.IsNullOrEmpty(dataSearch.UserId) ? dataSearch.UserId : "",
                        !string.IsNullOrEmpty(dataSearch.UserName) ? dataSearch.UserName : "", !string.IsNullOrEmpty(dataSearch.Department) ? dataSearch.Department: "",
                        !string.IsNullOrEmpty(dataSearch.WorkflowInstCode) ? dataSearch.WorkflowInstCode : ""};
                    DataTable rs = _repositoryService.GetDataTableProcedureSql("P_GET_ALL_LMS_BOARD_TASK_WITH_CONDITION", param, val);
                    var query = CommonUtil.ConvertDataTable<GridLmsTaskJtable>(rs);
                    return query;
                }
            }
        }
        #endregion

        #region List
        [HttpGet]
        public JsonResult GetLists(string BoardCode)
        {
            try
            {
                var data = _context.LmsListTasks.Where(x => x.BoardCode.Equals(BoardCode) && x.IsDeleted == false).OrderBy(x => x.Order);
                return Json(data);
            }
            catch (Exception ex)
            {
                var msg = new JMessage() { Error = true, Title = _sharedResources["COM_MSG_ERR"], Object = ex };//Có lỗi xảy ra!
                return Json(msg);
            }
        }
        [HttpPost]
        public JsonResult InsertList([FromBody] LmsListTask data)
        {
            var msg = new JMessage() { Error = true };
            if (string.IsNullOrEmpty(data.ListName))
            {
                return Json(new JMessage() { Error = true, Title = _stringLocalizerCJ["CJ_CURD_MSG_ADD_CONTENT"] });//"Nhập nội dung"
            }
            if (string.IsNullOrEmpty(data.BoardCode))
            {
                return Json(new JMessage() { Error = true, Title = _stringLocalizerCJ["CJ_MSG_PLS_SELECT_TABLE_WORKING"] });
            }
            try
            {
                var getSumWeightNum = _context.LmsListTasks.Where(x => x.BoardCode == data.BoardCode && x.IsDeleted == false).Sum(x => x.WeightNum);
                if ((getSumWeightNum + data.WeightNum) > 100)
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizerCJ["CJ_MSG_MAXIMUM_WEIGHT"] + " " + (100 - getSumWeightNum) + " % !";
                }
                else
                {
                    data.ListCode = "LIST_" + Guid.NewGuid().ToString();
                    if (data.Status == null)
                    {
                        data.Status = 1;
                    }
                    data.WeightNum = data.WeightNum;
                    data.ListCode = data.ListCode.ToUpper();
                    data.Order = _context.LmsListTasks.Count() + 1;
                    data.Background = "background-color: rgb(68, 190, 199);";
                    data.BeginTime = DateTime.Now;
                    data.Deadline = _context.LmsBoardTasks.FirstOrDefault(x => x.BoardCode == data.BoardCode).Deadline;
                    _context.LmsListTasks.Add(data);
                    _context.SaveChanges();

                    msg.Error = false;
                    msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizerCJ["CJ_CURD_LBL_LIST_CODE"]);//"Thêm danh sách mới thành công";
                    msg.Object = data;
                }
            }
            catch (Exception ex)
            {
                msg.Object = ex;
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                //msg.Title = String.Format(_stringLocalize["COM_MSG_ADD_FAILED"), _stringLocalize["CJ_CURD_LBL_LIST_CODE"));//"Có lỗi khi thêm danh sách mới!";
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult CheckExistListNameInBoard([FromBody] LmsListTask data)
        {
            bool isExistListName = false;
            var checkExist = _context.LmsListTasks.FirstOrDefault(x => x.IsDeleted == false && x.ListName.ToLower() == data.ListName.ToLower() && x.BoardCode == data.BoardCode.ToLower());
            if (checkExist != null)
            {
                isExistListName = true;
            }
            return Json(isExistListName);
        }
        [HttpPost]
        public JsonResult UpdateListName([FromBody] LmsListTask obj)
        {
            var msg = new JMessage() { Error = true };
            try
            {
                var data = _context.LmsListTasks.FirstOrDefault(x => x.ListID == obj.ListID);
                data.ListName = obj.ListName;
                _context.SaveChanges();

                msg.Error = false;
                msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizerCJ["CJ_CURD_LBL_LIST_CODE"]);//"Cập nhật thành công";
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                //msg.Title = String.Format(_stringLocalize["COM_MSG_UPDATE_FAILED"), _stringLocalize["CJ_CURD_LBL_LIST_CODE"));//"Có lỗi xảy ra!";
                return Json(msg);
                throw;
            }
        }
        [HttpPost]
        public JsonResult UpdateOrder(string Orther, string Entry)
        {
            var msg = new JMessage() { Error = true };
            List<string> orther = Orther.Split(',').ToList();
            List<string> entry = Entry.Split(',').ToList();
            List<string> a = new List<string>();
            List<string> b = new List<string>();

            for (int i = 0; i < orther.Count; i++)
            {
                if (orther[i] != entry[i])
                {
                    a.Add(orther[i]);
                    b.Add(entry[i]);
                }
            }

            //List<LmsListTask> data = new List<LmsListTask>();
            for (int i = 0; i < a.Count; i++)
            {
                var data = _context.LmsListTasks.FirstOrDefault(x => x.Order == int.Parse(b[i]));
                data.Order = int.Parse(a[i]);
            }

            _context.SaveChanges();

            return Json("");
        }
        [HttpPost]
        public JsonResult SortListByStatus(string BoardCode, int Orther)
        {
            var msg = new JMessage() { Error = true };
            try
            {
                List<LmsListTask> data = new List<LmsListTask>();
                List<int> orther = new List<int>();

                if (Orther == 0)
                {
                    data = _context.LmsListTasks.Where(x => x.BoardCode.Equals(BoardCode)).OrderBy(x => x.Status).ToList();
                }
                else
                {
                    data = _context.LmsListTasks.Where(x => x.BoardCode.Equals(BoardCode)).OrderByDescending(x => x.Status).ToList();
                }

                for (int i = 0; i < data.Count; i++)
                {
                    orther.Add(data[i].Order);
                }
                orther.Sort();
                for (int i = 0; i < data.Count; i++)
                {
                    data[i].Order = orther[i];
                }

                _context.SaveChanges();

                msg.Error = false;
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizerCJ["CJ_CURD_LBL_LIST_CODE"]);//"Sắp xếp thành công";
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                //msg.Title = String.Format(_stringLocalize["COM_MSG_DELETE_FAIL"), _stringLocalize["CJ_CURD_LBL_LIST_CODE"));//"Có lỗi xảy ra!";
                return Json(msg);
            }
        }
        [HttpPost]
        public JsonResult ChangeListStatus(int ListID, int Status)
        {
            var msg = new JMessage() { Error = true };
            try
            {
                var data = _context.LmsListTasks.FirstOrDefault(x => x.ListID == ListID);
                data.Status = Status;
                _context.SaveChanges();

                msg.Error = false;
                msg.Title = String.Format(_stringLocalizerCJ["COM_MSG_UPDATE_SUCCESS"], _stringLocalizerCJ["CJ_COL_STATUS"]);//"Cập nhật trạng thái thành công";
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                //msg.Title = String.Format(_stringLocalize["COM_MSG_UPDATE_FAILED"), _stringLocalize["CJ_COL_STATUS")); //"Có lỗi xảy ra khi cập nhật trạng thái!";
                return Json(msg);
            }
        }
        [HttpPost]
        public JsonResult ChangeListBackground([FromBody] dynamic obj)
        {
            var msg = new JMessage() { Error = true };
            try
            {
                int id = obj.ListID.Value != null ? Convert.ToInt32(obj.ListID.Value) : 0;
                string backGround = obj.Background.Value;
                var data = _context.LmsListTasks.FirstOrDefault(x => x.ListID == id);
                data.Background = backGround;
                _context.SaveChanges();

                msg.Error = false;
                msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizerCJ["CJ_CURD_BTN_CHANGE_HEADER_BACKGROUND"]);//"Cập nhật trạng thái thành công";
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                //msg.Title = String.Format(_stringLocalize["COM_MSG_UPDATE_FAILED"), _stringLocalize["CJ_CURD_BTN_CHANGE_HEADER_BACKGROUND")); //"Có lỗi xảy ra khi cập nhật trạng thái!";
                return Json(msg);
            }
        }
        [HttpPost]
        public JsonResult ChangeListWeightNum([FromBody] dynamic obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                int id = obj.ListID.Value != null ? Convert.ToInt32(obj.ListID.Value) : 0;
                decimal weightNum = obj.ListID.Value != null ? Convert.ToDecimal(obj.WeightNum.Value) : 0;
                var data = _context.LmsListTasks.FirstOrDefault(x => x.ListID == id);
                var getSumWeightNum = _context.LmsListTasks.Where(x => x.BoardCode == data.BoardCode && x.ListCode != data.ListCode && x.IsDeleted == false).Sum(x => x.WeightNum);
                if ((getSumWeightNum + weightNum) > 100)
                {
                    msg.Error = true;
                    //msg.Title = "Trọng số tối đa cho phép " + (100 - getSumWeightNum) + "%!";
                    msg.Title = _stringLocalizerCJ["CJ_MSG_MAXIMUM_WEIGHT"] + " " + (100 - getSumWeightNum) + "%!";
                }
                else
                {
                    data.WeightNum = weightNum;
                    //msg.Object = _cardService.UpdatePercentParentList(data.ListCode);
                    _context.SaveChanges();
                    //msg.Title = "Cập nhập trọng số thành công!";
                    msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizerCJ["CJ_MSG_WEIGHT"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                //msg.Title = "Có lỗi xảy ra khi cập nhập trọng số!";
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult ChangeListBeginTime([FromBody] dynamic obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                int id = obj.ListID.Value != null ? Convert.ToInt32(obj.ListID.Value) : 0;
                var beginTime = DateTime.ParseExact(obj.BeginTime.Value, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                var data = _context.LmsListTasks.FirstOrDefault(x => x.ListID == id);
                if (data != null)
                {
                    if (beginTime > data.Deadline)
                    {
                        msg.Error = true;
                        //msg.Title = "Ngày bắt đầu nhỏ hơn ngày kết thúc";
                        msg.Title = _stringLocalizerCJ["CJ_MSG_START_DATE_LESS_EQUAL_END_DATE"];
                    }
                    else
                    {
                        data.BeginTime = beginTime;
                        _context.SaveChanges();
                        //msg.Title = "Cập nhập ngày bắt đầu thành công";
                        msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizerCJ["CJ_MSG_DATE_START"]);
                    }
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Không tồn tại danh sách!";
                    msg.Title = _stringLocalizerCJ["CJ_MSG_LIST_NOT_EXISTS"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                //msg.Title = "Có lỗi xảy ra khi cập nhập trọng số!";
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult ChangeListDeadLine([FromBody] dynamic obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                int id = obj.ListID.Value != null ? Convert.ToInt32(obj.ListID.Value) : 0;
                var deadLine = DateTime.ParseExact(obj.DeadLine.Value, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                var data = _context.LmsListTasks.FirstOrDefault(x => x.ListID == id);
                if (data != null)
                {
                    data.Deadline = deadLine;
                    _context.SaveChanges();
                    //msg.Title = "Cập nhập ngày hết hạn thành công";
                    msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizerCJ["CJ_MSG_EXPIRED"]);
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Không tồn tại danh sách!";
                    msg.Title = _stringLocalizerCJ["CJ_MSG_LIST_NOT_EXISTS"];
                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                //msg.Title = "Có lỗi xảy ra khi cập nhập trọng số!";
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        //[HttpPost]
        //public JsonResult ChangeBoard(int ListID, string BoardCode)
        //{
        //    var msg = new JMessage() { Error = true };

        //    try
        //    {
        //        var data = _context.LmsListTasks.FirstOrDefault(x => x.ListID == ListID);
        //        data.BoardCode = BoardCode;
        //        _context.LmsListTasks.Update(data);
        //        _context.SaveChanges();

        //        msg.Title = String.Format(_stringLocalize["CJ_CURD_MSG_CHANGE_BOARD_SUCCESS"));//"Di chuyển danh sách thành công!";
        //        msg.Error = false;
        //        return Json(msg);
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Object = ex;
        //        msg.Title = String.Format(_stringLocalize["CJ_CURD_MSG_CHANGE_BOARD_FAILED"));// "Có lỗi xảy ra khi di chuyển danh sách!";
        //        return Json(msg);
        //    }
        //}
        [HttpPost]
        public JsonResult DeleteList(int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                //deleted List
                var data = _context.LmsListTasks.FirstOrDefault(x => x.ListID == id);
                data.IsDeleted = true;

                //deleted card
                var listCard = _context.LmsTasks.Where(x => x.ListCode == data.ListCode).ToList();
                listCard.ForEach(x => x.IsDeleted = true);

                ////delete relative
                //var relative = _context.CardMappings.Where(x => x.ListCode == data.ListCode).AsNoTracking().ToList();
                //_context.CardMappings.RemoveRange(relative);

                //_cardService.UpdatePercentParentList(data.ListCode);
                _context.SaveChanges();
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizerCJ["CJ_CURD_LBL_LIST_CODE"]);//"Xóa danh sách thành công!";
            }
            catch (Exception ex)
            {
                msg.Object = ex;
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                //msg.Title = String.Format(_stringLocalize["COM_MSG_DELETE_FAIL"), _stringLocalize["CJ_CURD_LBL_LIST_CODE"));//"Có lỗi khi xóa danh sách!";
            }
            return Json(msg);
        }

        #endregion

        #region Card
        public class GridLmsTaskJtable
        {
            public int Id { get; set; }
            public string LmsTaskCode { get; set; }
            public string LmsTaskName { get; set; }
            public string ListName { get; set; }
            public DateTime BeginTime { get; set; }
            public DateTime? EndTime { get; set; }
            public DateTime? UpdateTime { get; set; }
            public string Status { get; set; }
            public string StatusName { get; set; }
            public string CreatedBy { get; set; }
            public string CreatedTime { get; set; }
            public string LmsTaskType { get; set; }
            public string BoardName { get; set; }
            public DateTime CreatedDate { get; set; }
            public string Total { get; set; }
            public string TotalRow { get; set; }
            public string BoardCode { get; set; }
            public string BoardType { get; set; }
        }
        public class DescriptionModel
        {
            public string CardCode { get; set; }
            public string Description { get; set; }
        }
        public class CardRelative
        {
            public string BoardCode { get; set; }
            public string ListCode { get; set; }
            public int TabBoard { get; set; }
            public List<Properties> ListCodeRelative { get; set; }
            public string CardName { get; set; }
        }

        [HttpPost]
        public JsonResult GetStatus()
        {
            var data = _context.CommonSettings.Where(x => x.Group == EnumHelper<CardEnum>.GetDisplayValue(CardEnum.Stautus) && x.IsDeleted == false)
                        .Select(x => new { Code = x.CodeSet, Value = x.ValueSet });
            return Json(data);
        }

        [HttpPost]
        public object GetBoardListSugges()
        {
            var maping = _cardService.GetJobCardSuggest(ESEIM.AppContext.UserName);
            if (maping != null)
            {
                return new { BoadCode = maping.BoardCode, ListCode = maping.ListCode };
            }
            else
            {
                return null;
            }
        }

        [HttpGet]
        public object GetCardActivityByUser(string CardCode)
        {
            var userId = ESEIM.AppContext.UserId;
            var actionView = _context.LmsTaskStudentAssigns.FirstOrDefault(x => x.UserId == userId && x.LmsTaskCode == CardCode && x.Action == EnumHelper<CardAction>.GetDisplayValue(CardAction.Review));
            if (actionView == null)
            {
                var activity = new LmsTaskStudentAssign
                {
                    UserId = userId,
                    LmsTaskCode = CardCode,
                    Action = EnumHelper<CardAction>.GetDisplayValue(CardAction.Review),
                    IsCheck = true,
                    FromDevice = "Mobile",
                    CreatedTime = DateTime.Now
                };
                _context.LmsTaskStudentAssigns.Add(activity);
                _context.SaveChanges();
            }
            var actionReject = _context.LmsTaskStudentAssigns.Where(x => x.UserId == userId && x.LmsTaskCode == CardCode
                && x.Action == EnumHelper<CardAction>.GetDisplayValue(CardAction.Reject)).MaxBy(x => x.CreatedTime);
            var actionAcceipt = _context.LmsTaskStudentAssigns.Where(x => x.UserId == userId && x.LmsTaskCode == CardCode
                && x.Action == EnumHelper<CardAction>.GetDisplayValue(CardAction.Accept)).MaxBy(x => x.CreatedTime);

            var isReject = false;
            var isAccept = false;
            if (actionReject != null && actionAcceipt != null)
            {
                if (actionReject.CreatedTime > actionAcceipt.CreatedTime)
                {
                    if (actionReject.IsCheck)
                    {
                        isReject = true;
                        isAccept = false;
                    }
                }
                else
                {
                    if (actionAcceipt.IsCheck)
                    {
                        isReject = false;
                        isAccept = true;
                    }
                }
            }
            else if (actionReject == null && actionAcceipt != null)

            {
                if (actionAcceipt.IsCheck)
                {
                    isReject = false;
                    isAccept = true;
                }
                else
                {
                    isReject = false;
                    isAccept = false;
                }

            }
            else if (actionReject != null && actionAcceipt == null)
            {
                if (actionReject.IsCheck)
                {
                    isReject = true;
                    isAccept = false;
                }
                else
                {
                    isReject = false;
                    isAccept = false;
                }
            }

            return new[]
            {
                new
                {
                    Name= CardAction.Review.DescriptionAttr(),
                    Value= CardAction.Review.GetHashCode(),
                    Date = actionView != null ? actionView.CreatedTime.ToString("dd/MM/yyyy") : DateTime.Now.ToString("dd/MM/yyyy"),
                    Time = actionView != null ? actionView.CreatedTime.ToString("hh:mm:ssy") : DateTime.Now.ToString("hh:mm:ss"),
                    IsCheck = true,
                },
                 new
                {
                    Name= CardAction.Reject.DescriptionAttr(),
                    Value = CardAction.Reject.GetHashCode(),
                    Date = actionReject != null ? actionReject.CreatedTime.ToString("dd/MM/yyyy") : DateTime.Now.ToString("dd/MM/yyyy"),
                    Time = actionReject != null ? actionReject.CreatedTime.ToString("hh:mm:ss") : DateTime.Now.ToString("hh:mm:ss"),
                    IsCheck = isReject,
                },
                new
                {
                    Name= actionAcceipt != null? CardAction.Accept.DescriptionAttr() : "{{LMS_PLEASE_ACCEPT}} !",
                    Value = CardAction.Accept.GetHashCode(),
                    Date = actionAcceipt != null ? actionAcceipt.CreatedTime.ToString("dd/MM/yyyy") : DateTime.Now.ToString("dd/MM/yyyy"),
                    Time = actionAcceipt != null ? actionAcceipt.CreatedTime.ToString("hh:mm:ss") : DateTime.Now.ToString("hh:mm:ss"),
                    IsCheck = isAccept,
                },
            };
        }

        [HttpGet]
        public JsonResult GetCardDetail(string CardCode)
        {
            var msg = new JMessage { Error = false, Title = "" };
            LmsListTask list = null;
            LmsBoardTask board = null;
            try
            {
                var data = _context.LmsTasks.FirstOrDefault(x => x.LmsTaskCode.Equals(CardCode) && !x.IsDeleted);

                var session = HttpContext.GetSessionUser();
                if (data != null)
                {
                    list = _context.LmsListTasks.FirstOrDefault(x => x.ListCode == data.ListCode && !x.IsDeleted);
                    if (list != null)
                    {
                        board = _context.LmsBoardTasks.FirstOrDefault(x => x.BoardCode == (list.BoardCode) && !x.IsDeleted);
                    }
                }
                var checkNotification = _context.CommonSettings.FirstOrDefault(x => x.CodeSet == "NOTIFICATION_CARD" && !x.IsDeleted).ValueSet;
                msg.Object = new
                {
                    CardDetail = data,
                    BoardCompleted = board?.Completed,
                    ListCompleted = list?.Completed,
                    Notification = checkNotification,
                    CurrenUser = ESEIM.AppContext.UserName,
                    Session = session.IsAllData,
                    TimeStart = DateTime.Now,
                    Board = board.BoardCode,
                    List = list.ListCode,
                    BoardFullData = board
                };
                //AutoAcceptCard(CardCode);
                RemoveUserInNotify(data.LmsTaskCode, EnumHelper<NotificationType>.GetDisplayValue(NotificationType.CardJob), false);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Object = ex.Message;
            }
            return Json(msg);
        }

        [NonAction]
        private void AutoAcceptCard(string cardCode)
        {
            var check = _context.LmsTaskStudentAssigns.FirstOrDefault(x => x.LmsTaskCode.Equals(cardCode)
                    && x.UserId.Equals(ESEIM.AppContext.UserId) && x.Action != EnumHelper<CardAction>.GetDisplayValue(CardAction.Review));
            if (check == null)
            {
                var actionText = EnumHelper<CardAction>.GetDisplayValue(CardAction.Accept);
                var activity = new LmsTaskStudentAssign
                {
                    UserId = ESEIM.AppContext.UserId,
                    LmsTaskCode = cardCode,
                    Action = actionText,
                    IsCheck = true,
                    FromDevice = "Laptop/Desktop",
                    CreatedTime = DateTime.Now
                };
                _context.LmsTaskStudentAssigns.Add(activity);
                _context.SaveChanges();
            }
        }

        [HttpPost]
        public object GetListsAndCard([FromBody] AdvanceSearchObj data)
        {
            var session = HttpContext.GetSessionUser();
            var user = _context.Users.FirstOrDefault(x => x.Active && x.UserName == ESEIM.AppContext.UserName);
            int intBeginFor = (data.Page - 1) * data.Length;
            var fromDate = string.IsNullOrEmpty(data.FromDate) ? (DateTime?)null : DateTime.ParseExact(data.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var toDate = string.IsNullOrEmpty(data.ToDate) ? (DateTime?)null : DateTime.ParseExact(data.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);

            if (!string.IsNullOrEmpty(data.BoardCode))
            {
                var query = (from a in _context.LmsListTasks
                             where a.IsDeleted == false && a.BoardCode == data.BoardCode
                             orderby a.Order
                             select a).AsNoTracking();
                var count = query.Count();
                var list = query.Skip(intBeginFor).Take(data.Length).AsNoTracking()
                    .Select(a => new
                    {
                        a.ListID,
                        a.ListCode,
                        a.ListName,
                        a.Completed,
                        a.WeightNum,
                        a.Status,
                        a.BeginTime,
                        a.Deadline,
                        a.Background,
                        a.Order,
                        ListCard = ListCard(data, a.ListCode, user.BranchId, user.DepartmentId)
                    });
                return new
                {
                    Data = list,
                    Total = count
                };
            }
            else
            {
                var list = (from a in _context.LmsListTasks.Where(x => !x.IsDeleted)
                            join b in _context.LmsTasks.Where(x => !x.IsDeleted
                                && x.Status != "TRASH") on a.ListCode equals b.ListCode
                            select new
                            {
                                a.ListID,
                                a.ListCode,
                                a.ListName,
                                a.Completed,
                                a.WeightNum,
                                a.Status,
                                a.BeginTime,
                                a.Deadline,
                                a.Background,
                                a.Order
                            }).DistinctBy(x => x.ListCode);
                var listPaging = list.Skip(intBeginFor).Take(data.Length)
                    .Select(x => new
                    {
                        x.ListID,
                        x.ListCode,
                        x.ListName,
                        x.Completed,
                        x.WeightNum,
                        x.Status,
                        x.BeginTime,
                        x.Deadline,
                        x.Background,
                        x.Order,
                        ListCard = ListCard(data, x.ListCode, user.BranchId, user.DepartmentId)
                    });
                return new
                {
                    Data = listPaging,
                    Total = list.Count(),
                };
            }
        }

        [NonAction]
        private List<ListAndCard> ListCard(AdvanceSearchObj dataSearch, string listCode,
            string branch, string department)
        {
            var fromDate = string.IsNullOrEmpty(dataSearch.FromDate) ? (DateTime?)null : DateTime.ParseExact(dataSearch.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var toDate = string.IsNullOrEmpty(dataSearch.ToDate) ? (DateTime?)null : DateTime.ParseExact(dataSearch.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var session = HttpContext.GetSessionUser();
            //var user = _context.Users.FirstOrDefault(x => x.Active && x.UserName == ESEIM.AppContext.UserName);

            var fromDatePara = fromDate.HasValue ? fromDate.Value.ToString("yyyy-MM-dd") : "";
            var toDatePara = toDate.HasValue ? toDate.Value.ToString("yyyy-MM-dd") : "";
            var listUserOfBranch = "";
            if (session.IsBranch)
            {
                if (session.ListUserOfBranch.Any())
                {
                    listUserOfBranch = string.Join(",", session.ListUserOfBranch);
                }
            }

            string[] param = new string[] { "@PageNo", "@PageSize", "@fromDate", "@toDate",
                "@IsAllData", "@IsUser", "@IsBranch", "@DepartmentId", "@UserName",
                "@ListUserOfBranch", "@UserId", "@BranchId", "@Status", "@Object",
                "@ListCode", "@CardName" };
            object[] val = new object[] {dataSearch.CurrentPageList, 10,fromDatePara, toDatePara ,
                session.IsAllData, session.IsUser, session.IsBranch,
                !string.IsNullOrEmpty(department) ? department : "", session.UserName,listUserOfBranch,
                session.UserId,  !string.IsNullOrEmpty(branch) ? branch : "",
                !string.IsNullOrEmpty(dataSearch.Status) ? dataSearch.Status : "",
                dataSearch.Object, listCode, dataSearch.CardName};
            DataTable rs = _repositoryService.GetDataTableProcedureSql("P_GET_LIST_AND_CARD", param, val);
            var query = CommonUtil.ConvertDataTable<ListAndCard>(rs);
            return query;
        }
        public class ListAndCard
        {
            public string ListCode { get; set; }
            public int CardID { get; set; }
            public string CardCode { get; set; }
            public string CardName { get; set; }
            public DateTime Deadline { get; set; }
            public string Unit { get; set; }
            public DateTime BeginTime { get; set; }
            public DateTime EndTime { get; set; }
            public string CurrencyValue { get; set; }
            public string Status { get; set; }
            public int CountCheckListDone { get; set; }
            public int CountCheckList { get; set; }
            public decimal Completed { get; set; }
            public string LocationText { get; set; }
            public DateTime CreatedDate { get; set; }
        }

        [HttpPost]
        public JsonResult GetGridCard([FromBody] AdvanceSearchObj jtablePara)
        {
            //TabBoard = 1(Bảng)                  //TabBoard = 5(Dự án)
            //TabBoard = 2(Phòng ban)             //TabBoard = 6(Khách hàng)
            //TabBoard = 3(Nhân viên)             //TabBoard = 7(Hợp đồng)
            //TabBoard = 4(Nhóm)                  //TabBoard = 8(Nhà cung cấp)
            int intBegin = (jtablePara.CurrentPage - 1) * jtablePara.Length;
            int count = 0;

            List<GridLmsTaskJtable> queryTab = new List<GridLmsTaskJtable>();
            if (jtablePara.TabBoard == 1)
            {
                queryTab = GetGirdCardBoard(jtablePara);
            }
            //else if (jtablePara.TabBoard == 3)
            //{
            //    queryTab = GetGirdCardUser(jtablePara);
            //}
            if (queryTab.Count() > 0)
            {
                foreach (var item in queryTab)
                {
                    item.CreatedTime = item.CreatedDate.ToString("dd/MM/yyyy HH:mm");
                }
                count = int.Parse(queryTab.FirstOrDefault().TotalRow);
                var jdata = JTableHelper.JObjectTable(
                                queryTab,
                                jtablePara.Draw,
                                count,
                                "Id", "LmsTaskCode", "LmsTaskName", "ListName", "Deadline", "Status", "StatusName",
                                "Completed", "BeginTime", "EndTime", "Cost", "Currency", "CreatedBy", "CreatedTime",
                                "Priority", "LmsTaskType", "UpdatedTimeTxt", "UpdateTime", "BoardName", "IsShowLabelAssign",
                                "GroupAssign", "DepartmentAssign", "WfName", "ActName", "IsRead", "BoardType"
                                );
                return Json(jdata);
            }
            else
            {
                var jdata = JTableHelper.JObjectTable(
                                queryTab,
                                jtablePara.Draw,
                                count,
                                "Id", "LmsTaskCode", "LmsTaskName", "ListName", "Deadline", "Status", "StatusName",
                                "Completed", "BeginTime", "EndTime", "Cost", "Currency", "CreatedBy", "CreatedTime",
                                "Priority", "LmsTaskType", "UpdatedTimeTxt", "UpdateTime", "BoardName", "IsShowLabelAssign",
                                "GroupAssign", "DepartmentAssign", "WfName", "ActName", "IsRead", "BoardType"
                                );
                return Json(jdata);
            }
        }

        [NonAction]
        public List<GridLmsTaskJtable> GetGirdCardOut(AdvanceSearchObj dataSearch)
        {
            var fromDate = string.IsNullOrEmpty(dataSearch.FromDate) ? (DateTime?)null : DateTime.ParseExact(dataSearch.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var toDate = string.IsNullOrEmpty(dataSearch.ToDate) ? (DateTime?)null : DateTime.ParseExact(dataSearch.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var session = HttpContext.GetSessionUser();
            var user = _context.Users.FirstOrDefault(x => x.Active && x.UserName == ESEIM.AppContext.UserName);

            var fromDatePara = fromDate.HasValue ? fromDate.Value.ToString("yyyy-MM-dd") : "";
            var toDatePara = toDate.HasValue ? toDate.Value.ToString("yyyy-MM-dd") : "";
            var listUserOfBranch = "";
            if (session.IsBranch)
            {
                if (session.ListUserOfBranch.Any())
                {
                    listUserOfBranch = string.Join(",", session.ListUserOfBranch);
                }
            }

            string[] param = new string[] { "@PageNo", "@PageSize", "@fromDate", "@toDate", "@IsAllData", "@IsUser", "@IsBranch",
                "@DepartmentId", "@UserName", "@ListUserOfBranch", "@boardCode", "@UserId", "@BranchId", "@Status", "@Object", "@ObjType", "@CardName" };
            object[] val = new object[] { dataSearch.CurrentPage, dataSearch.Length , fromDatePara, toDatePara , session.IsAllData, session.IsUser,
                session.IsBranch, !string.IsNullOrEmpty(user.DepartmentId) ? user.DepartmentId : "", session.UserName, listUserOfBranch,
                !string.IsNullOrEmpty(dataSearch.BoardCode) ? dataSearch.BoardCode : "",session.UserId,  !string.IsNullOrEmpty(user.BranchId) ? user.BranchId : "",
                dataSearch.Status, !string.IsNullOrEmpty(dataSearch.Object) ? dataSearch.Object : "", !string.IsNullOrEmpty(dataSearch.ObjType) ? dataSearch.ObjType : "", dataSearch.CardName};
            DataTable rs = _repositoryService.GetDataTableProcedureSql("P_GET_CARD", param, val);
            var query = CommonUtil.ConvertDataTable<GridLmsTaskJtable>(rs);
            return query;
            //if (fromDate == null && toDate == null && string.IsNullOrEmpty(dataSearch.Status) && string.IsNullOrEmpty(dataSearch.CardName) && string.IsNullOrEmpty(dataSearch.BranchId))
            //{
            //    var query = (from a in _context.WORKOSCards.Where(x => !x.IsDeleted)
            //                 let lt = a.LstUser.Split(",", StringSplitOptions.None)
            //                 join b in _context.CardCommentLists on a.CardCode equals b.CardCode
            //                 join g in _context.CardMappings on a.CardCode equals g.CardCode into g1
            //                 from g2 in g1.DefaultIfEmpty()
            //                 join h in _context.Users.Where(x => x.Active) on a.CreatedBy equals h.UserName into h1
            //                 from h2 in h1.DefaultIfEmpty()
            //                 join i in _context.LmsListTasks.Where(x => !x.IsDeleted) on a.ListCode equals i.ListCode
            //                 join k in _context.LmsBoardTasks.Where(x => !x.IsDeleted) on i.BoardCode equals k.BoardCode
            //                 where (session.IsAllData
            //                    || (session.IsUser && (g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(a.LstUser) && lt.Any(y => session.UserId == y)) || a.CreatedBy == session.UserName))
            //                    || (session.IsBranch && (!string.IsNullOrEmpty(a.LstUser) && lt.Any(k => k == session.UserId) || a.CreatedBy == session.UserName || session.ListUserOfBranch.Count() > 0
            //                        && session.ListUserOfBranch.Any(k => k == a.CreatedBy))))
            //                 select new GridCardJtable
            //                 {
            //                     CardID = a.CardID,
            //                     CardCode = a.CardCode,
            //                     CardName = a.CardName,
            //                     ListName = _context.LmsListTasks.FirstOrDefault(y => y.ListCode.Equals(a.ListCode)).ListName ?? "",
            //                     BoardName = k.BoardName,
            //                     Deadline = a.Deadline,
            //                     Currency = _context.CommonSettings.FirstOrDefault(y => y.CodeSet == a.Currency).ValueSet ?? "",
            //                     Cost = a.Cost,
            //                     Completed = a.Completed,
            //                     BeginTime = a.BeginTime,
            //                     EndTime = a.EndTime,
            //                     Status = _context.CommonSettings.FirstOrDefault(y => y.CodeSet.Equals(a.Status)).ValueSet,
            //                     UpdateTime = a.UpdatedTime,
            //                     CreatedBy = h2.GivenName,
            //                     CreatedTime = a.CreatedDate.ToString("dd/MM/yyyy"),
            //                     CreatedDate = a.CreatedDate,
            //                     UpdatedTimeTxt = a.UpdatedTime.HasValue ? a.UpdatedTime.Value.ToString("dd/MM/yyyy HH:mm:ss") : "",
            //                     WorkType = !string.IsNullOrEmpty(a.WorkType) ? _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.WorkType).ValueSet : "",
            //                     Priority = !string.IsNullOrEmpty(a.CardLevel) ? _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.CardLevel).ValueSet : "",
            //                 }).DistinctBy(x => x.CardCode).OrderByDescending(x => x.UpdateTime.HasValue ? x.UpdateTime.Value : x.CreatedDate).ThenByDescending(x => x.CardID);
            //    IQueryable<GridCardJtable> data1 = query.AsQueryable<GridCardJtable>();
            //    return data1;
            //}
            //else
            //{
            //    var query = (from a in _context.WORKOSCards.Where(x => !x.IsDeleted)
            //                 let lt = a.LstUser.Split(",", StringSplitOptions.None)
            //                 join b in _context.CardCommentLists on a.CardCode equals b.CardCode into b1
            //                 from b2 in b1.DefaultIfEmpty()
            //                 join c in _context.CardItemChecks on a.CardCode equals c.CardCode into c1
            //                 from c2 in c1.DefaultIfEmpty()
            //                 join g in _context.CardMappings on a.CardCode equals g.CardCode into g1
            //                 from g2 in g1.DefaultIfEmpty()
            //                 join h in _context.Users.Where(x => x.Active) on a.CreatedBy equals h.UserName into h1
            //                 from h2 in h1.DefaultIfEmpty()
            //                 join i in _context.LmsListTasks.Where(x => !x.IsDeleted) on a.ListCode equals i.ListCode
            //                 join k in _context.LmsBoardTasks.Where(x => !x.IsDeleted) on i.BoardCode equals k.BoardCode
            //                 where (fromDate == null || a.BeginTime >= fromDate) &&
            //                       (toDate == null || (a.EndTime.HasValue ? a.EndTime.Value.Date : DateTime.Now.Date) <= toDate) &&
            //                       ((string.IsNullOrEmpty(dataSearch.CardName) || a.CardName.ToLower().Contains(dataSearch.CardName.ToLower())) ||
            //                       (string.IsNullOrEmpty(dataSearch.CardName) || a.CardCode.ToLower().Contains(dataSearch.CardName.ToLower())) ||
            //                       (string.IsNullOrEmpty(dataSearch.CardName) || a.Description.ToLower().Contains(dataSearch.CardName.ToLower())) ||
            //                       (string.IsNullOrEmpty(dataSearch.CardName) || c2.CheckTitle.ToLower().Contains(dataSearch.CardName.ToLower())) ||
            //                       (string.IsNullOrEmpty(dataSearch.CardName) || b2.CmtContent.ToLower().Contains(dataSearch.CardName.ToLower()))) &&
            //                       ((string.IsNullOrEmpty(dataSearch.Status) && a.Status != "TRASH") || a.Status.Equals(dataSearch.Status)) &&
            //                       (string.IsNullOrEmpty(dataSearch.BranchId) || h2.BranchId.Equals(dataSearch.BranchId)) &&
            //                       //(session.IsAllData || g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(a.LstUser) && lt.Any(y => session.UserId == y)) || a.CreatedBy == session.UserName)
            //                       (session.IsAllData
            //                    || (session.IsUser && (g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(a.LstUser) && lt.Any(y => session.UserId == y)) || a.CreatedBy == session.UserName))
            //                    || (session.IsBranch && (!string.IsNullOrEmpty(a.LstUser) && lt.Any(k => k == session.UserId) || a.CreatedBy == session.UserName || session.ListUserOfBranch.Count() > 0
            //                        && session.ListUserOfBranch.Any(k => k == a.CreatedBy))))
            //                 select new GridCardJtable
            //                 {
            //                     CardID = a.CardID,
            //                     CardCode = a.CardCode,
            //                     CardName = a.CardName,
            //                     ListName = _context.LmsListTasks.FirstOrDefault(y => y.ListCode.Equals(a.ListCode)).ListName ?? "",
            //                     BoardName = k.BoardName,
            //                     Deadline = a.Deadline,
            //                     Currency = _context.CommonSettings.FirstOrDefault(y => y.CodeSet == a.Currency).ValueSet ?? "",
            //                     Cost = a.Cost,
            //                     Completed = a.Completed,
            //                     BeginTime = a.BeginTime,
            //                     EndTime = a.EndTime,
            //                     Status = _context.CommonSettings.FirstOrDefault(y => y.CodeSet.Equals(a.Status)).ValueSet,
            //                     UpdateTime = a.UpdatedTime,
            //                     CreatedBy = h2.GivenName,
            //                     CreatedTime = a.CreatedDate.ToString("dd/MM/yyyy"),
            //                     CreatedDate = a.CreatedDate,
            //                     UpdatedTimeTxt = a.UpdatedTime.HasValue ? a.UpdatedTime.Value.ToString("dd/MM/yyyy HH:mm:ss") : "",
            //                     WorkType = !string.IsNullOrEmpty(a.WorkType) ? _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.WorkType).ValueSet : "",
            //                     Priority = !string.IsNullOrEmpty(a.CardLevel) ? _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.CardLevel).ValueSet : "",
            //                 }).DistinctBy(x => x.CardCode).OrderByDescending(x => x.UpdateTime.HasValue ? x.UpdateTime.Value : x.CreatedDate).ThenByDescending(x => x.CardID);
            //    IQueryable<GridCardJtable> data1 = query.AsQueryable<GridCardJtable>();
            //    return data1;
            //}
        }

        [HttpPost]
        public JsonResult InsertCard([FromBody] CardRelative data)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            var session = HttpContext.GetSessionUser();
            IQueryable<CardMemberCustom> lstUser = null;
            try
            {
                //if (string.IsNullOrEmpty(data.CardName))
                //{
                //    return Json(new JMessage() { Error = true, Title = String.Format(_stringLocalizer["CJ_CURD_MSG_ADD_CONTENT"]) });
                //}
                if (string.IsNullOrEmpty(data.ListCode))
                {
                    return Json(new JMessage() { Error = true, Title = "{{LMS_PLEASE_SELECTED_LIST}}" });//"Nhập nội dung"
                }
                var list = _context.LmsListTasks.FirstOrDefault(x => x.ListCode == data.ListCode && x.IsDeleted == false);
                var board = _context.LmsBoardTasks.FirstOrDefault(x => x.BoardCode == list.BoardCode && x.IsDeleted == false);

                var card = new LmsTask
                {
                    LmsTaskName = !string.IsNullOrEmpty(data.CardName) ? data.CardName : "",
                    LmsTaskCode = "" + (_context.LmsTasks.Count() > 0 ? _context.LmsTasks.Max(x => x.Id) + 1 : 1),
                    ListCode = data.ListCode,
                    CreatedBy = ESEIM.AppContext.UserName,
                    CreatedDate = DateTime.Now,
                    Status = "CREATED",
                    BeginTime = DateTime.Now,
                    EndTime = DateTime.Now > list.Deadline ? DateTime.Now : list.Deadline,
                    Description = ""
                };
                //comment
                var comment = new LmsTaskCommentList()
                {
                    LmsTaskCode = card.LmsTaskCode,
                    CmtId = "Comment" + Guid.NewGuid().ToString(),
                    CmtContent = "LMS_CREATED_JOB",
                    MemberId = ESEIM.AppContext.UserName,
                    CreatedTime = DateTime.Now
                };
                _context.LmsTaskCommentLists.Add(comment);

                //Add department of member create card
                var user = _context.Users.FirstOrDefault(x => x.UserName == ESEIM.AppContext.UserName && x.Active);
                var addLeader = new JobCardAssignee
                {
                    CardCode = card.LmsTaskCode,
                    UserId = ESEIM.AppContext.UserId,
                    CreatedBy = ESEIM.AppContext.UserName,
                    CreatedTime = DateTime.Now,
                    Role = "ROLE_LEADER",
                    DepartmentCode = user != null ? !string.IsNullOrEmpty(user.DepartmentId) ? user.DepartmentId : "" : "",
                    GroupCode = "",
                    Item = "",
                    Approve = true,
                    ApproveTime = DateTime.Now,
                    Status = "ASSIGN_STATUS_WORK",
                    Branch = !string.IsNullOrEmpty(session.BranchId) ? session.BranchId : ""
                };
                _context.JobCardAssignees.Add(addLeader);
                var json = new List<JobCardAssignee>();
                json.Add(addLeader);

                msg.Object = card;
                //relative (Board)

                //TabBoard = 1(Bảng)                  //TabBoard = 5(Dự án)
                //TabBoard = 2(Phòng ban)             //TabBoard = 6(Khách hàng)
                //TabBoard = 3(Nhân viên)             //TabBoard = 7(Hợp đồng)
                //TabBoard = 4(Nhóm)                  //TabBoard = 8(Nhà cung cấp)
                //TabBoard = 11(Hợp đồng mua)         //TabBoard = 9(Yêu cầu hỏi giá)
                //TabBoard = 10(Yêu cầu đặt hàng)

                if (data.ListCodeRelative.Any())
                {
                    //foreach (var item in data.ListCodeRelative)
                    //{
                    //    var maping = new CardMapping
                    //    {
                    //        CardCode = card.CardCode,
                    //        BoardCode = list.BoardCode,
                    //        ListCode = card.ListCode,
                    //        ProjectCode = data.TabBoard == 5 ? item.Code : null,
                    //        ContractCode = data.TabBoard == 7 ? item.Code : null,
                    //        CustomerCode = data.TabBoard == 6 ? item.Code : null,
                    //        SupplierCode = data.TabBoard == 8 ? item.Code : null,
                    //        Relative = _context.CommonSettings.FirstOrDefault(x => x.Group == EnumHelper<CardEnum>.GetDisplayValue(CardEnum.ObjRelative))?.CodeSet,
                    //        TeamCode = data.TabBoard == 4 ? item.Code : null,
                    //        GroupUserCode = data.TabBoard == 2 ? item.Code : null,
                    //        UserId = data.TabBoard == 3 ? item.Code : null,
                    //        CreatedBy = ESEIM.AppContext.UserName,
                    //        CreatedTime = DateTime.Now,
                    //    };
                    //    _context.CardMappings.Add(maping);
                    //}
                    if (data.TabBoard == 4)
                    {
                        //get all member in team
                        var listUserInTeam = from a in _context.Teams.Where(x => data.ListCodeRelative.Any(y => x.TeamCode == y.Code))
                                             select new
                                             {
                                                 a.Members,
                                             };
                        foreach (var team in listUserInTeam)
                        {
                            var listUser = team.Members.Split(",").Select(x => new CardMemberCustom
                            {
                                UserId = x
                            });
                            lstUser = lstUser != null && lstUser.Any() ? lstUser.Concat(listUser) : listUser.AsQueryable();
                        }
                    }
                    else if (data.TabBoard == 3)
                    {
                        var listUser = data.ListCodeRelative.Select(x => new CardMemberCustom
                        {
                            UserId = x.Code
                        });
                        lstUser = listUser.AsQueryable();
                    }
                    else if (data.TabBoard == 5)
                    {
                        var JcObject = new JcObjectIdRelative
                        {
                            Weight = 0,
                            CardCode = card.LmsTaskCode,
                            ObjTypeCode = "PROJECT",
                            ObjID = data.ListCodeRelative[0].Code,
                            Relative = "MAIN",
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now,
                        };
                        _context.JcObjectIdRelatives.Add(JcObject);
                    }
                    else if (data.TabBoard == 7)
                    {
                        var JcObject = new JcObjectIdRelative
                        {
                            Weight = 0,
                            CardCode = card.LmsTaskCode,
                            ObjTypeCode = "CONTRACT",
                            ObjID = data.ListCodeRelative[0].Code,
                            Relative = "MAIN",
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now,
                        };
                        _context.JcObjectIdRelatives.Add(JcObject);
                    }
                    else if (data.TabBoard == 11)
                    {
                        var JcObject = new JcObjectIdRelative
                        {
                            Weight = 0,
                            CardCode = card.LmsTaskCode,
                            ObjTypeCode = "CONTRACT_PO",
                            ObjID = data.ListCodeRelative[0].Code,
                            Relative = "MAIN",
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now,
                        };
                        _context.JcObjectIdRelatives.Add(JcObject);
                    }
                    else if (data.TabBoard == 9)
                    {
                        var JcObject = new JcObjectIdRelative
                        {
                            Weight = 0,
                            CardCode = card.LmsTaskCode,
                            ObjTypeCode = "REQUEST_PRICE",
                            ObjID = data.ListCodeRelative[0].Code,
                            Relative = "MAIN",
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now,
                        };
                        _context.JcObjectIdRelatives.Add(JcObject);
                    }
                    else if (data.TabBoard == 10)
                    {
                        var JcObject = new JcObjectIdRelative
                        {
                            Weight = 0,
                            CardCode = card.LmsTaskCode,
                            ObjTypeCode = "REQUEST_PRODUCT",
                            ObjID = data.ListCodeRelative[0].Code,
                            Relative = "MAIN",
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now,
                        };
                        _context.JcObjectIdRelatives.Add(JcObject);
                    }
                    else if (data.TabBoard == 8)
                    {
                        var JcObject = new JcObjectIdRelative
                        {
                            Weight = 0,
                            CardCode = card.LmsTaskCode,
                            ObjTypeCode = "SUPPLIER",
                            ObjID = data.ListCodeRelative[0].Code,
                            Relative = "MAIN",
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now,
                        };
                        _context.JcObjectIdRelatives.Add(JcObject);
                    }
                    else if (data.TabBoard == 6)
                    {
                        var JcObject = new JcObjectIdRelative
                        {
                            Weight = 0,
                            CardCode = card.LmsTaskCode,
                            ObjTypeCode = "CUSTOMER",
                            ObjID = data.ListCodeRelative[0].Code,
                            Relative = "MAIN",
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now,
                        };
                        _context.JcObjectIdRelatives.Add(JcObject);
                    }

                    card.LmsUserList = lstUser != null && lstUser.Any() ? string.Join(",", lstUser.Select(x => x.UserId)) : null;
                }
                _context.LmsTasks.Add(card);
                _context.SaveChanges();
                msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizerCJ[""]);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                //msg.Title = String.Format(_stringLocalize["COM_MSG_ADD_FAILED"), _stringLocalize[""));//"Có lỗi xảy ra!";
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult InsertCardNormal(string listCode)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var card = new LmsTask
                {
                    LmsTaskName = "",
                    LmsTaskCode = "" + (_context.LmsTasks.Count() > 0 ? _context.LmsTasks.Max(x => x.Id) + 1 : 1),
                    ListCode = listCode,
                    CreatedBy = ESEIM.AppContext.UserName,
                    CreatedDate = DateTime.Now,
                    Status = "CREATED",
                    BeginTime = DateTime.Now,
                    EndTime = DateTime.Now,
                    Description = ""
                };
                _context.LmsTasks.Add(card);

                //comment
                var comment = new LmsTaskCommentList()
                {
                    LmsTaskCode = card.LmsTaskCode,
                    CmtId = "Comment" + Guid.NewGuid().ToString(),
                    CmtContent = "LMS_CREATED_JOB",
                    MemberId = ESEIM.AppContext.UserName,
                    CreatedTime = DateTime.Now
                };
                _context.LmsTaskCommentLists.Add(comment);

                //Add department of member create card
                var session = HttpContext.GetSessionUser();
                var addLeader = new JobCardAssignee
                {
                    CardCode = card.LmsTaskCode,
                    UserId = ESEIM.AppContext.UserId,
                    CreatedBy = ESEIM.AppContext.UserName,
                    CreatedTime = DateTime.Now,
                    Role = "ROLE_LEADER",
                    DepartmentCode = session.DepartmentCode,
                    GroupCode = "",
                    Item = "",
                    Approve = true,
                    ApproveTime = DateTime.Now,
                    Status = "ASSIGN_STATUS_WORK",
                    Branch = !string.IsNullOrEmpty(session.BranchId) ? session.BranchId : ""
                };

                _context.JobCardAssignees.Add(addLeader);
                var json = new List<JobCardAssignee>();

                json.Add(addLeader);

                card.LmsUserList = session.UserId;
                _context.SaveChanges();
                msg.Title = "LMS_CREATED_JOBCARD_SUCCESS";
            }
            catch (Exception ex)
            {
                msg.Error = false;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult DeleteCard(string lmsTaskCode)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var userName = ESEIM.AppContext.UserName;
                var admin = "admin";
                //deleted card
                var data = _context.LmsTasks.FirstOrDefault(x => x.LmsTaskCode == lmsTaskCode);

                if (data != null)
                {
                    if (userName.ToLower() == admin.ToLower() || data.CreatedBy == userName)
                    {
                        if (data.Status == "TRASH")
                        {
                            data.IsDeleted = true;
                            var assign = _context.LmsTaskUserItemProgresses.Where(x => !x.IsDeleted && x.LmsTaskCode.Equals(data.LmsTaskCode));
                            foreach (var item in assign)
                            {
                                item.IsDeleted = true;
                                _context.LmsTaskUserItemProgresses.Update(item);
                            }
                        }
                        else
                        {
                            data.Status = "TRASH";
                        }
                        _context.SaveChanges();
                        msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizerCJ[""]);// "Xóa thành công";

                        RemoveUserInNotify(data.LmsTaskCode, EnumHelper<NotificationType>.GetDisplayValue(NotificationType.CardJob), true);
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizerCJ["CJ_MSG_YOU_NOT_CREATED_CARD"];
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "LMS_RECORDS_NOT_FOUND";
                }

                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Object = ex;
                return Json(msg);
            }
        }

        [HttpPost]
        public JsonResult DeleteNewCard(string cardCode)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var card = _context.LmsTasks.FirstOrDefault(x => !x.IsDeleted && x.LmsTaskCode == cardCode);
                if (card != null)
                {
                    card.IsDeleted = true;
                    var listJcObj = _context.JcObjectIdRelatives.Where(x => x.CardCode == card.LmsTaskCode && !x.IsDeleted);
                    foreach (var itemJcObj in listJcObj)
                    {
                        itemJcObj.IsDeleted = true;
                        _context.JcObjectIdRelatives.Update(itemJcObj);
                    }
                    var assign = _context.JobCardAssignees.Where(x => !x.IsDeleted && x.CardCode.Equals(card.LmsTaskCode));
                    foreach (var item in assign)
                    {
                        item.IsDeleted = true;
                        item.DeletedBy = ESEIM.AppContext.UserName;
                        item.DeletedTime = DateTime.Now;
                        _context.JobCardAssignees.Update(item);
                    }
                    _context.SaveChanges();
                    msg.Title = "LMS_CANCEL_CREATE_JOBCARD_SUCCESS";
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
        public JsonResult DelCardNoTitle(string cardCode)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var card = _context.LmsTasks.FirstOrDefault(x => !x.IsDeleted && x.LmsTaskCode == cardCode);
                if (card != null)
                {
                    card.IsDeleted = true;
                    var listJcObj = _context.JcObjectIdRelatives.Where(x => x.CardCode == card.LmsTaskCode && !x.IsDeleted);
                    foreach (var itemJcObj in listJcObj)
                    {
                        itemJcObj.IsDeleted = true;
                        _context.JcObjectIdRelatives.Update(itemJcObj);
                    }
                    var assign = _context.JobCardAssignees.Where(x => !x.IsDeleted && x.CardCode.Equals(card.LmsTaskCode));
                    foreach (var item in assign)
                    {
                        item.IsDeleted = true;
                        item.DeletedBy = ESEIM.AppContext.UserName;
                        item.DeletedTime = DateTime.Now;
                        _context.JobCardAssignees.Update(item);
                    }
                    _context.SaveChanges();
                    msg.Title = "LMS_JOBCARD_DELETE_SUCCESS";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "LMS_JOBCARD_NOT_EXIST";
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
        public JsonResult UpdateCardName([FromBody] LmsTask obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = _context.LmsTasks.FirstOrDefault(x => x.Id == obj.Id);
                if (data.LmsTaskName != obj.LmsTaskName)
                {
                    var activity = new LmsTaskStudentAssign
                    {
                        UserId = ESEIM.AppContext.UserId,
                        Action = "UPDATE",
                        IdObject = "ITEMWORK",
                        IsCheck = true,
                        LmsTaskCode = data.LmsTaskCode,
                        CreatedTime = DateTime.Now,
                        FromDevice = "Laptop/Desktop",
                        ChangeDetails = _stringLocalizer["LMS_JOBCARD_FROM_TITLE"] + " [" + data.LmsTaskName + "] "
                         +_stringLocalizer["LMS_JOBCARD_TO_TITLE"] + " [" + obj.LmsTaskName + "]"
                    };
                    _context.LmsTaskStudentAssigns.Add(activity);

                    data.LmsTaskName = obj.LmsTaskName;
                    data.UpdatedBy = ESEIM.AppContext.UserName;
                    data.UpdatedTime = DateTime.Now;
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizerCJ[""]);//"Thay đổi thành công!";
                }
            }
            catch (Exception ex)
            {
                msg.Object = ex;
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                // msg.Title = String.Format(_stringLocalize["COM_MSG_UPDATE_FAILED"), _stringLocalize[""));// "CÓ lỗi xảy ra!";
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateCardDescription([FromBody] DescriptionModel obj)
        {
            var msg = new JMessage() { Error = true };
            try
            {
                if (string.IsNullOrEmpty(obj.CardCode))
                {
                    return null;
                }
                var data = _context.LmsTasks.FirstOrDefault(x => x.LmsTaskCode.Equals(obj.CardCode));
                if (!string.IsNullOrEmpty(data.Description) && data.Description.Equals(obj.Description))
                {
                    return null;
                }
                //log content
                var activity = new LmsTaskStudentAssign
                {
                    UserId = ESEIM.AppContext.UserId,
                    Action = "UPDATE",
                    IdObject = "DESCRIPTION",
                    IsCheck = true,
                    LmsTaskCode = obj.CardCode,
                    CreatedTime = DateTime.Now,
                    FromDevice = "Laptop/Desktop",
                    ChangeDetails = !string.IsNullOrEmpty(data.Description) ?
                        _stringLocalizer["LMS_JOBCARD_FROM_DESCRIPTION"] + " " + data.Description + " " + _stringLocalizer["LMS_JOBCARD_TO_DESCRIPTION"] + " " + obj.Description :
                        _stringLocalizer["LMS_JOBCARD_AS_DESCRIPTION"] + " " + obj.Description
                };
                _context.LmsTaskStudentAssigns.Add(activity);

                data.Description = obj.Description;
                data.UpdatedTime = DateTime.Now;
                data.UpdatedBy = ESEIM.AppContext.UserName;

                _context.SaveChanges();

                msg.Title = _sharedResources["COM_UPDATE_SUCCESS"]; //"Cập nhật thành công";
                msg.Error = false;
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                //msg.Title = String.Format(_stringLocalize["COM_MSG_UPDATE_FAILED"), _stringLocalize[""));// "Có lỗi xảy ra!"; 
                return Json(msg);
            }
        }

        [HttpGet]
        public JsonResult UpdateActivity(string CardCode, int Value, bool IsCheck)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var actionText = "";
                var userId = ESEIM.AppContext.UserId;
                if (Value == CardAction.Review.GetHashCode())
                {
                    actionText = EnumHelper<CardAction>.GetDisplayValue(CardAction.Review);
                }
                else if (Value == CardAction.Reject.GetHashCode())
                {
                    actionText = EnumHelper<CardAction>.GetDisplayValue(CardAction.Reject);
                }
                else if (Value == CardAction.Accept.GetHashCode())
                {
                    actionText = EnumHelper<CardAction>.GetDisplayValue(CardAction.Accept);
                }
                if (actionText == EnumHelper<CardAction>.GetDisplayValue(CardAction.Review))
                {
                    var existActivity = _context.LmsTaskStudentAssigns.FirstOrDefault(x => x.LmsTaskCode == CardCode && x.UserId == userId && x.Action == EnumHelper<CardAction>.GetDisplayValue(CardAction.Review));
                    if (existActivity != null)
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizerCJ["CJ_MSG_YOU_WATCHED"];
                        return Json(msg);
                    }
                }
                if (IsCheck)
                {
                    var maxActionOther = _context.LmsTaskStudentAssigns.Where(x => x.UserId == userId && x.LmsTaskCode == CardCode && x.Action != EnumHelper<CardAction>.GetDisplayValue(CardAction.Review) && x.Action != actionText).MaxBy(x => x.CreatedTime);
                    if (maxActionOther != null)
                    {
                        maxActionOther.IsCheck = false;
                    }
                }
                var activity = new LmsTaskStudentAssign
                {
                    UserId = ESEIM.AppContext.UserId,
                    LmsTaskCode = CardCode,
                    Action = actionText,
                    IsCheck = IsCheck,
                    FromDevice = "Laptop/Desktop",
                    CreatedTime = DateTime.Now
                };
                _context.LmsTaskStudentAssigns.Add(activity);
                _context.SaveChanges();
                msg.Object = new
                {
                    Date = activity.CreatedTime.ToString("dd/MM/yyyy"),
                    Time = activity.CreatedTime.ToString("hh:mm:ss"),
                    TimeActivity = DateTime.Now
                };
                msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateBeginTime(string CardCode, string BeginTime)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var beginTime = DateTime.ParseExact(BeginTime, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                var data = _context.LmsTasks.FirstOrDefault(x => x.LmsTaskCode == CardCode);
                if (data != null)
                {
                    if (data.EndTime != null)
                    {
                        if (beginTime.Date > data.EndTime.Value.Date)
                        {
                            msg.Error = true;
                            //msg.Title = "Ngày bắt đầu nhỏ hơn hoặc bằng ngày kết thúc!";
                            msg.Title = _stringLocalizerCJ["CJ_MSG_START_DATE_LESS_EQUAL_END_DATE"];
                            return Json(msg);
                        }
                    }
                }
                var activity = new LmsTaskStudentAssign
                {
                    UserId = ESEIM.AppContext.UserId,
                    Action = "UPDATE",
                    IdObject = "ITEMWORK",
                    IsCheck = true,
                    LmsTaskCode = CardCode,
                    CreatedTime = DateTime.Now,
                    FromDevice = "Laptop/Desktop",
                    ChangeDetails = "LMS_DATE_STARTS_FROM " + data.BeginTime.ToString("dd/MM/yyyy") + " LMS_DATE_STARTS_TO " + beginTime.ToString("dd/MM/yyyy")
                };
                _context.LmsTaskStudentAssigns.Add(activity);
                data.BeginTime = beginTime;
                _context.SaveChanges();
                //msg.Title = "Cập nhập thành công!";
                msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                //msg.Title = "Có lỗi khi cập nhập";
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateEndTime(string CardCode, string EndTime)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var endTime = DateTime.ParseExact(EndTime, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                var data = _context.LmsTasks.FirstOrDefault(x => x.LmsTaskCode == CardCode);
                var activity = new LmsTaskStudentAssign
                {
                    UserId = ESEIM.AppContext.UserId,
                    Action = "UPDATE",
                    IdObject = "ITEMWORK",
                    IsCheck = true,
                    LmsTaskCode = CardCode,
                    CreatedTime = DateTime.Now,
                    FromDevice = "Laptop/Desktop",
                    ChangeDetails = data.EndTime.HasValue ? "LMS_DATE_END_FROM " + data.EndTime.Value.ToString("dd/MM/yyyy") + " LMS_DATE_END_TO " + endTime.ToString("dd/MM/yyyy") : "Ngày kết thúc " + endTime.ToString("dd/MM/yyyy")
                };
                _context.LmsTaskStudentAssigns.Add(activity);
                data.EndTime = endTime;
                _context.SaveChanges();
                // msg.Title = "Cập nhập thành công!";
                msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                //msg.Title = "Có lỗi khi cập nhập";
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult ChangeWorkType(string CardCode, string Type)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = _context.LmsTasks.FirstOrDefault(x => x.LmsTaskCode.Equals(CardCode));
                //log content
                var activity = new LmsTaskStudentAssign
                {
                    UserId = ESEIM.AppContext.UserId,
                    Action = "UPDATE",
                    IdObject = "ITEMWORK",
                    IsCheck = true,
                    LmsTaskCode = CardCode,
                    CreatedTime = DateTime.Now,
                    FromDevice = "Laptop/Desktop",
                    ChangeDetails = "LMS_TYPE_WORK_FORM " + (_context.CommonSettings.FirstOrDefault(x => x.CodeSet == data.LmsTaskType && !x.IsDeleted) != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet == data.LmsTaskType && !x.IsDeleted).ValueSet : "")
                    + " LMS_TYPE_WORK_TO " + (_context.CommonSettings.FirstOrDefault(x => x.CodeSet == Type && !x.IsDeleted) != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet == Type && !x.IsDeleted).ValueSet : "")
                };
                _context.LmsTaskStudentAssigns.Add(activity);

                data.LmsTaskType = Type;
                _context.SaveChanges();

                msg.Title = _sharedResources["COM_UPDATE_SUCCESS"]; ;// "Cập nhật thành công";
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                //msg.Title = String.Format(_stringLocalize["COM_MSG_ERR"), _stringLocalize[""));// "Có lỗi xảy ra!";
                msg.Object = ex;
                return Json(msg);
            }
        }

        [HttpPost]
        public JsonResult ChangeListCard(string CardCode, string ListCode)
        {
            var msg = new JMessage() { Error = true };
            try
            {
                var data = _context.LmsTasks.FirstOrDefault(x => x.LmsTaskCode.Equals(CardCode));
                data.ListCode = ListCode;
                _context.SaveChanges();

                msg.Error = false;
                msg.Title = _stringLocalizerCJ["CJ_CURD_MSG_CHANGE_LIST_CARD_SUCCESS"];//"Di chuyển thành công";
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                return Json(msg);
            }
        }

        [HttpPost]
        public JsonResult ChangeCardStatus(string CardCode, string Status)
        {
            var msg = new JMessage() { Error = true };
            try
            {
                var data = _context.LmsTasks.FirstOrDefault(x => x.LmsTaskCode.Equals(CardCode));
                if (!data.Status.Equals(Status))
                {
                    //log content
                    var activity = new LmsTaskStudentAssign
                    {
                        UserId = ESEIM.AppContext.UserId,
                        Action = "UPDATE",
                        IdObject = "ITEMWORK",
                        IsCheck = true,
                        LmsTaskCode = CardCode,
                        CreatedTime = DateTime.Now,
                        FromDevice = "Laptop/Desktop",
                        ChangeDetails = "Trạng thái từ " + _context.CommonSettings.FirstOrDefault(x => x.CodeSet == data.Status && !x.IsDeleted).ValueSet
                        + " sang " + _context.CommonSettings.FirstOrDefault(x => x.CodeSet == Status && !x.IsDeleted).ValueSet
                    };
                    _context.LmsTaskStudentAssigns.Add(activity);
                    data.Status = Status;
                    _context.SaveChanges();
                    msg.Error = false;
                    msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizerCJ["CJ_COL_STATUS"]);
                }
                else if (data.Status == "TRASH" && Status == "TRASH")
                {
                    if (ESEIM.AppContext.UserName.Equals("admin") || data.CreatedBy.Equals(ESEIM.AppContext.UserName))
                    {
                        data.IsDeleted = true;
                        var listJcObj = _context.JcObjectIdRelatives.Where(x => x.CardCode == data.LmsTaskCode && !x.IsDeleted);
                        foreach (var itemJcObj in listJcObj)
                        {
                            itemJcObj.IsDeleted = true;
                            _context.JcObjectIdRelatives.Update(itemJcObj);
                        }
                        var assign = _context.JobCardAssignees.Where(x => !x.IsDeleted && x.CardCode.Equals(data.LmsTaskCode));
                        foreach (var item in assign)
                        {
                            item.IsDeleted = true;
                            item.DeletedBy = ESEIM.AppContext.UserName;
                            item.DeletedTime = DateTime.Now;
                            _context.JobCardAssignees.Update(item);
                        }
                        _context.SaveChanges();
                        msg.Error = false;
                        msg.Title = "Xóa thẻ việc thành công";
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = "Bạn không có quyền xóa thẻ việc này";
                    }
                }
                else
                {
                    msg.Error = false;
                    msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizerCJ["CJ_COL_STATUS"]);
                }

                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Object = ex;
                return Json(msg);
            }
        }

        [HttpPost]
        public JsonResult UpdateCardByBufferData([FromBody] BufferData buffer)
        {
            var timeEnd = DateTime.Now;
            //Update card base
            var msg = new JMessage();
            try
            {
                var card = _context.LmsTasks.FirstOrDefault(x => x.LmsTaskCode == buffer.CardJob.CardCode && !x.IsDeleted);
                var list = _context.LmsListTasks.FirstOrDefault(x => x.ListCode == card.ListCode);
                var board = _context.LmsBoardTasks.FirstOrDefault(x => x.BoardCode == list.BoardCode);
                if (card != null)
                {
                    //Update card base
                    if (string.IsNullOrEmpty(buffer.CardJob.BeginTime))
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizerCJ["CJ_MSG_PLS_ENTER_START_DATE"];
                        return Json(msg);
                    }
                    if (string.IsNullOrEmpty(buffer.CardJob.Deadline))
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizerCJ["CJ_MSG_PLS_ENTER_END_DATE"];
                        return Json(msg);
                    }

                    var beginTime = !string.IsNullOrEmpty(buffer.CardJob.BeginTime) ? DateTime.ParseExact(buffer.CardJob.BeginTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                    var endTime = !string.IsNullOrEmpty(buffer.CardJob.EndTime) ? DateTime.ParseExact(buffer.CardJob.EndTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                    //Log
                    if (card.BeginTime != beginTime)
                    {
                        var activity = new LmsTaskStudentAssign
                        {
                            UserId = ESEIM.AppContext.UserId,
                            Action = "UPDATE",
                            IdObject = "ITEMWORK",
                            IsCheck = true,
                            LmsTaskCode = card.LmsTaskCode,
                            CreatedTime = DateTime.Now,
                            FromDevice = "Laptop/Desktop",
                            ChangeDetails = "Ngày bắt đầu từ " + card.BeginTime != null ? card.BeginTime.ToString("dd/MM/yyyy") : "trống" + " sang " + beginTime != null ? beginTime.Value.ToString("dd/MM/yyyy") : "trống"
                        };
                        _context.LmsTaskStudentAssigns.Add(activity);
                    }
                    if (card.LmsTaskName != buffer.CardJob.CardName)
                    {
                        var activity = new LmsTaskStudentAssign
                        {
                            UserId = ESEIM.AppContext.UserId,
                            Action = "UPDATE",
                            IdObject = "ITEMWORK",
                            IsCheck = true,
                            LmsTaskCode = card.LmsTaskCode,
                            CreatedTime = DateTime.Now,
                            FromDevice = "Laptop/Desktop",
                            ChangeDetails = "Tên thẻ việc từ [" + card.LmsTaskName + "] sang [" + buffer.CardJob.CardName + "]"
                        };
                        _context.LmsTaskStudentAssigns.Add(activity);
                    }
                    if (card.EndTime != endTime)
                    {
                        var activity = new LmsTaskStudentAssign
                        {
                            UserId = ESEIM.AppContext.UserId,
                            Action = "UPDATE",
                            IdObject = "ITEMWORK",
                            IsCheck = true,
                            LmsTaskCode = card.LmsTaskCode,
                            CreatedTime = DateTime.Now,
                            FromDevice = "Laptop/Desktop",
                            ChangeDetails = card.EndTime.HasValue ? "Ngày kết thúc từ " + card.EndTime.Value.ToString("dd/MM/yyyy") + " sang " + (endTime.HasValue ? endTime.Value.ToString("dd/MM/yyyy") : "trống") : "Ngày kết thúc " + (endTime.HasValue ? endTime.Value.ToString("dd/MM/yyyy") : "trống")
                        };
                        _context.LmsTaskStudentAssigns.Add(activity);
                    }
                    if (card.Description != buffer.CardJob.Description)
                    {
                        var activity = new LmsTaskStudentAssign
                        {
                            UserId = ESEIM.AppContext.UserId,
                            Action = "UPDATE",
                            IdObject = "DESCRIPTION",
                            IsCheck = true,
                            LmsTaskCode = card.LmsTaskCode,
                            CreatedTime = DateTime.Now,
                            FromDevice = "Laptop/Desktop",
                            ChangeDetails = !string.IsNullOrEmpty(card.Description) ? "Mô tả từ " + card.Description + " sang " + buffer.CardJob.Description : "Thêm mới mô tả " + buffer.CardJob.Description
                        };
                        _context.LmsTaskStudentAssigns.Add(activity);
                    }
                    if (card.LmsTaskType != buffer.CardJob.WorkType)
                    {
                        var activity = new LmsTaskStudentAssign
                        {
                            UserId = ESEIM.AppContext.UserId,
                            Action = "UPDATE",
                            IdObject = "ITEMWORK",
                            IsCheck = true,
                            LmsTaskCode = card.LmsTaskCode,
                            CreatedTime = DateTime.Now,
                            FromDevice = "Laptop/Desktop",
                            ChangeDetails = !string.IsNullOrEmpty(card.LmsTaskType) ? "Kiểu công việc từ " + (_context.CommonSettings.FirstOrDefault(x => x.CodeSet == card.LmsTaskType && !x.IsDeleted) != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet == card.LmsTaskType && !x.IsDeleted).ValueSet : "")
                    + " sang " + (_context.CommonSettings.FirstOrDefault(x => x.CodeSet == buffer.CardJob.WorkType && !x.IsDeleted) != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet == buffer.CardJob.WorkType && !x.IsDeleted).ValueSet : "") : "Thêm mới kiểu công việc " + _context.CommonSettings.FirstOrDefault(x => x.CodeSet == buffer.CardJob.WorkType && !x.IsDeleted).ValueSet
                        };
                        _context.LmsTaskStudentAssigns.Add(activity);
                    }
                    if (card.Status != buffer.CardJob.Status)
                    {
                        var activity = new LmsTaskStudentAssign
                        {
                            UserId = ESEIM.AppContext.UserId,
                            Action = "UPDATE",
                            IdObject = "ITEMWORK",
                            IsCheck = true,
                            LmsTaskCode = card.LmsTaskCode,
                            CreatedTime = DateTime.Now,
                            FromDevice = "Laptop/Desktop",
                            ChangeDetails = "Trạng thái từ " + (_context.CommonSettings.FirstOrDefault(x => x.CodeSet == card.Status && !x.IsDeleted) != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet == card.Status && !x.IsDeleted).ValueSet : "")
                            + " sang " + _context.CommonSettings.FirstOrDefault(x => x.CodeSet == buffer.CardJob.Status && !x.IsDeleted).ValueSet
                        };
                        _context.LmsTaskStudentAssigns.Add(activity);
                    }

                    card.LmsTaskName = buffer.CardJob.CardName;
                    card.BeginTime = beginTime.Value;
                    card.EndTime = endTime;
                    card.Description = buffer.CardJob.Description;
                    card.LmsTaskType = buffer.CardJob.WorkType;
                    card.Status = buffer.CardJob.Status;
                    card.UpdatedTime = DateTime.Now;
                    card.UpdatedBy = ESEIM.AppContext.UserName;
                    card.ListCode = buffer.CardJob.ListCode;

                    // Update đối tượng liên quan
                    if (buffer.JcRelative.ListDelRelative.Count > 0)
                    {
                        foreach (var item in buffer.JcRelative.ListDelRelative)
                        {
                            int idDeleted = !string.IsNullOrEmpty(item) ? Convert.ToInt32(item) : 0;
                            if (idDeleted > 0)
                            {
                                var currentData = _context.JcObjectIdRelatives.FirstOrDefault(x => x.ID == idDeleted);
                                if (currentData != null)
                                {
                                    currentData.IsDeleted = true;
                                    currentData.DeletedBy = ESEIM.AppContext.UserName;
                                    currentData.DeletedTime = DateTime.Now;
                                    _context.JcObjectIdRelatives.Update(currentData);
                                }
                            }
                        }
                    }
                    if (buffer.JcRelative.ListRelative.Count > 0)
                    {
                        foreach (var item in buffer.JcRelative.ListRelative)
                        {
                            if (item.ID < 0)
                            {
                                var objRelative = new JcObjectIdRelative();
                                decimal weight = !string.IsNullOrEmpty(item.Weight) ? Convert.ToDecimal(item.Weight) : 0;
                                objRelative.Weight = weight;
                                objRelative.CardCode = card.LmsTaskCode;
                                objRelative.ObjTypeCode = item.ObjTypeCode;
                                objRelative.ObjID = item.ObjID;
                                objRelative.Relative = item.RelativeCode;
                                objRelative.CreatedBy = ESEIM.AppContext.UserName;
                                objRelative.CreatedTime = DateTime.Now;
                                _context.JcObjectIdRelatives.Add(objRelative);

                                //if (objRelative.ObjTypeCode == "PROJECT")
                                //{
                                //    var objCardMap = new CardMapping();
                                //    objCardMap.ListCode = card.ListCode;
                                //    objCardMap.BoardCode = list.BoardCode;
                                //    objCardMap.ProjectCode = objRelative.ObjID;
                                //    objCardMap.CardCode = card.CardCode;
                                //    objCardMap.CreatedBy = ESEIM.AppContext.UserName;
                                //    objCardMap.CreatedTime = DateTime.Now;
                                //    _context.CardMappings.Add(objCardMap);
                                //};
                                //if (objRelative.ObjTypeCode == "CONTRACT")
                                //{
                                //    var objCardMap = new CardMapping();
                                //    objCardMap.ListCode = list.ListCode;
                                //    objCardMap.BoardCode = list.BoardCode;
                                //    objCardMap.ContractCode = objRelative.ObjID;
                                //    objCardMap.CardCode = card.CardCode;
                                //    objCardMap.CreatedBy = ESEIM.AppContext.UserName;
                                //    objCardMap.CreatedTime = DateTime.Now;
                                //    _context.CardMappings.Add(objCardMap);
                                //};
                            }
                        }
                    }

                    //Update cardlink
                    if (buffer.CardLink.ListCardLinkDel.Count > 0)
                    {
                        foreach (var item in buffer.CardLink.ListCardLinkDel)
                        {
                            var data = _context.JobCardLinks.FirstOrDefault(x => !x.IsDeleted && x.Id == item);
                            if (data != null)
                            {
                                data.IsDeleted = true;
                                data.DeletedBy = ESEIM.AppContext.UserName;
                                data.DeletedTime = DateTime.Now;
                                _context.JobCardLinks.Update(data);

                                var activity = new LmsTaskStudentAssign
                                {
                                    UserId = ESEIM.AppContext.UserId,
                                    Action = "DELETE",
                                    IdObject = "CARDLINK",
                                    IsCheck = true,
                                    LmsTaskCode = data.CardCode,
                                    CreatedTime = DateTime.Now,
                                    FromDevice = "Laptop/Desktop",
                                    ChangeDetails = "Thẻ việc liên kết " + _context.LmsTasks.FirstOrDefault(x => x.LmsTaskCode == data.CardLink).LmsTaskName
                                };
                                _context.LmsTaskStudentAssigns.Add(activity);
                            }
                        }
                    }
                    if (buffer.CardLink.ListCardLink.Count > 0)
                    {
                        foreach (var item in buffer.CardLink.ListCardLink)
                        {
                            var data = _context.JobCardLinks.FirstOrDefault(x => !x.IsDeleted && x.CardCode == card.LmsTaskCode && x.CardLink == item.Code);
                            if (data == null)
                            {
                                var link = new JobCardLink
                                {
                                    CardCode = card.LmsTaskCode,
                                    CardLink = item.Code,
                                    CreatedBy = ESEIM.AppContext.UserName,
                                    CreatedTime = DateTime.Now
                                };
                                _context.JobCardLinks.Add(link);

                                var activity = new LmsTaskStudentAssign
                                {
                                    UserId = ESEIM.AppContext.UserId,
                                    Action = "ADD",
                                    IdObject = "CARDLINK",
                                    IsCheck = true,
                                    LmsTaskCode = card.LmsTaskCode,
                                    CreatedTime = DateTime.Now,
                                    FromDevice = "Laptop/Desktop",
                                    ChangeDetails = "Thẻ việc liên kết " + _context.LmsTasks.FirstOrDefault(x => x.LmsTaskCode == link.CardLink).LmsTaskName
                                };
                                _context.LmsTaskStudentAssigns.Add(activity);
                            }
                        }
                    }

                    //Update Product
                    if (buffer.ProductBuffer.ListProduct.Count > 0)
                    {
                        foreach (var item in buffer.ProductBuffer.ListProduct)
                        {
                            var checkProduct = _context.JcProducts.FirstOrDefault(x => x.CardCode == card.LmsTaskCode && x.ProductCode == item.ProductCode && !x.IsDeleted);
                            if (checkProduct != null)
                            {
                                checkProduct.Quantity = item.Quantity;
                                checkProduct.UpdatedBy = ESEIM.AppContext.UserName;
                                checkProduct.UpdatedTime = DateTime.Now;
                                _context.JcProducts.Update(checkProduct);
                            }
                            else
                            {
                                var product = new JcProduct
                                {
                                    ProductCode = item.ProductCode,
                                    Quantity = item.Quantity,
                                    JcAct = item.JcAct,
                                    CardCode = card.LmsTaskCode,
                                    CreatedBy = item.CreatedBy,
                                    CreatedTime = DateTime.Now
                                };
                                _context.JcProducts.Add(product);
                                //Log
                                var activity = new LmsTaskStudentAssign
                                {
                                    UserId = ESEIM.AppContext.UserId,
                                    IdObject = "PROD",
                                    Action = "ADD",
                                    IsCheck = true,
                                    LmsTaskCode = product.CardCode,
                                    CreatedTime = DateTime.Now,
                                    FromDevice = "Laptop/Desktop",
                                    ChangeDetails = _context.MaterialProducts.FirstOrDefault(x => x.ProductCode == product.ProductCode).ProductName
                                };
                                _context.LmsTaskStudentAssigns.Add(activity);
                            }
                        }
                    }
                    if (buffer.ProductBuffer.ListDelProduct.Count > 0)
                    {
                        foreach (var item in buffer.ProductBuffer.ListDelProduct)
                        {
                            var cardProduct = _context.JcProducts.FirstOrDefault(x => x.ID == item);
                            if (cardProduct != null)
                            {
                                cardProduct.IsDeleted = true;
                                cardProduct.DeletedBy = ESEIM.AppContext.UserName;
                                cardProduct.DeletedTime = DateTime.Now;
                                _context.JcProducts.Update(cardProduct);

                                //Log
                                var activity = new LmsTaskStudentAssign
                                {
                                    UserId = ESEIM.AppContext.UserId,
                                    IdObject = "PROD",
                                    Action = "DELETE",
                                    IsCheck = true,
                                    LmsTaskCode = card.LmsTaskCode,
                                    CreatedTime = DateTime.Now,
                                    FromDevice = "Laptop/Desktop",
                                    ChangeDetails = _context.MaterialProducts.FirstOrDefault(x => x.ProductCode == cardProduct.ProductCode).ProductName
                                };
                                _context.LmsTaskStudentAssigns.Add(activity);
                            }
                        }
                    }

                    //Update service
                    if (buffer.ServiceBuffer.ListService.Count > 0)
                    {
                        foreach (var item in buffer.ServiceBuffer.ListService)
                        {
                            var checkSer = _context.JcServices.FirstOrDefault(x => x.CardCode == card.LmsTaskCode && x.ServiceCode == item.ServiceCode && !x.IsDeleted);
                            if (checkSer != null)
                            {
                                checkSer.Quantity = item.Quantity;
                                checkSer.UpdatedBy = ESEIM.AppContext.UserName;
                                checkSer.UpdatedTime = DateTime.Now;
                                _context.JcServices.Update(checkSer);
                            }
                            else
                            {
                                var ser = new JcService
                                {
                                    CardCode = card.LmsTaskCode,
                                    ServiceCode = item.ServiceCode,
                                    Quantity = item.Quantity,
                                    JcAct = item.JcAct,
                                    CreatedBy = ESEIM.AppContext.UserName,
                                    CreatedTime = DateTime.Now
                                };
                                _context.JcServices.Add(ser);

                                //Log
                                var activity = new LmsTaskStudentAssign
                                {
                                    UserId = ESEIM.AppContext.UserId,
                                    IdObject = "SER",
                                    Action = "ADD",
                                    IsCheck = true,
                                    LmsTaskCode = ser.CardCode,
                                    CreatedTime = DateTime.Now,
                                    FromDevice = "Laptop/Desktop",
                                    ChangeDetails = _context.ServiceCategorys.FirstOrDefault(x => !x.IsDeleted && x.ServiceCode == ser.ServiceCode).ServiceName
                                };
                                _context.LmsTaskStudentAssigns.Add(activity);
                            }
                        }
                    }
                    if (buffer.ServiceBuffer.ListDelService.Count > 0)
                    {
                        foreach (var item in buffer.ServiceBuffer.ListDelService)
                        {
                            var cardService = _context.JcServices.FirstOrDefault(x => x.ID == item);
                            if (cardService != null)
                            {
                                cardService.IsDeleted = true;
                                cardService.DeletedBy = ESEIM.AppContext.UserName;
                                cardService.DeletedTime = DateTime.Now;
                                _context.JcServices.Update(cardService);

                                var activity = new LmsTaskStudentAssign
                                {
                                    UserId = ESEIM.AppContext.UserId,
                                    IdObject = "SER",
                                    Action = "DELETE",
                                    IsCheck = true,
                                    LmsTaskCode = cardService.CardCode,
                                    CreatedTime = DateTime.Now,
                                    FromDevice = "Laptop/Desktop",
                                    ChangeDetails = _context.ServiceCategorys.FirstOrDefault(x => !x.IsDeleted && x.ServiceCode == cardService.ServiceCode).ServiceName
                                };
                                _context.LmsTaskStudentAssigns.Add(activity);
                            }
                        }
                    }

                    //Update address
                    if (buffer.AddressBuffer.ListAddress.Count > 0)
                    {
                        foreach (var item in buffer.AddressBuffer.ListAddress)
                        {
                            if (item.Id < 0)
                            {
                                var address = new WORKOSAddressCard
                                {
                                    CardCode = card.LmsTaskCode,
                                    LocationGps = item.LocationGps,
                                    LocationText = item.LocationText,
                                    CreatedBy = item.CreatedBy,
                                    CreatedTime = DateTime.Now
                                };
                                _context.WORKOSAddressCards.Add(address);

                                var activity = new LmsTaskStudentAssign
                                {
                                    UserId = ESEIM.AppContext.UserId,
                                    IdObject = "ADDR",
                                    Action = "ADD",
                                    IsCheck = true,
                                    LmsTaskCode = card.LmsTaskCode,
                                    CreatedTime = DateTime.Now,
                                    FromDevice = "Laptop/Desktop",
                                    ChangeDetails = address.LocationText
                                };
                                _context.LmsTaskStudentAssigns.Add(activity);
                            }
                        }
                    }
                    if (buffer.AddressBuffer.ListDelAddress.Count > 0)
                    {
                        foreach (var item in buffer.AddressBuffer.ListDelAddress)
                        {
                            var address = _context.WORKOSAddressCards.FirstOrDefault(x => x.Id == item && !x.IsDeleted);
                            if (address != null)
                            {
                                address.IsDeleted = true;
                                address.DeletedBy = ESEIM.AppContext.UserName;
                                address.DeletedTime = DateTime.Now;
                                _context.WORKOSAddressCards.Update(address);

                                var activity = new LmsTaskStudentAssign
                                {
                                    UserId = ESEIM.AppContext.UserId,
                                    IdObject = "ADDR",
                                    Action = "DELETE",
                                    IsCheck = true,
                                    LmsTaskCode = card.LmsTaskCode,
                                    CreatedTime = DateTime.Now,
                                    FromDevice = "Laptop/Desktop",
                                    ChangeDetails = address.LocationText
                                };
                                _context.LmsTaskStudentAssigns.Add(activity);
                            }
                        }
                    }

                    //Update log activity accept, reject
                    //var logs = _context.CardUserActivities.Where(x => x.CardCode == card.CardCode && x.UserId == ESEIM.AppContext.UserId
                    //&& x.CreatedTime >= buffer.TimeSpanActivity.TimeStart && x.CreatedTime <= timeEnd && x.Action != "REVIEW"
                    //).OrderByDescending(x => x.CreatedTime).ToList();
                    //if (logs.Any())
                    //{
                    //    for (int i = 1; i < logs.Count(); i++)
                    //    {
                    //        _context.CardUserActivities.Remove(logs[i]);
                    //    }
                    //}
                    //msg.Object = //_cardService.UpdatePercentParentCard(card.LmsTaskCode);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_MSG_SUCCES_SAVE"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        /*
        [HttpPost]
        public JsonResult RollbackDataBuffer([FromBody] ItemWorkCheck dataBuffer)
        {
            if (dataBuffer != null)
            {
                var cardCode = "";
                if (dataBuffer.ItemCheck.Any())
                {
                    cardCode = dataBuffer.ItemCheck[0].CardCode;
                }
                var msg = new JMessage();
                try
                {
                    //Clear data item check
                    var data = _context.CardItemChecks.Where(x => !x.Flag && x.CardCode == cardCode)
                      .Select(x => new
                      {
                          x.Id,
                          x.ChkListCode,
                          x.CheckTitle,
                          x.Completed,
                          x.WeightNum,
                          checkItem = false,
                          TitleSubItemChk = "",
                          ListUserItemChk = (from a in _context.WorkItemAssignStaffs
                                             join b in _context.Users on a.UserId equals b.Id
                                             where a.CheckListCode == x.ChkListCode && a.IsDeleted == false && (a.CheckItem == "")
                                             select new
                                             {
                                                 a.ID,
                                             }),
                          ListSubItem = _context.CardSubitemChecks.Where(y => y.ChkListCode == x.ChkListCode && y.Flag == false).Select(y => new
                          {
                              y.Id,
                              y.Title,
                              y.Approve,
                              y.ApprovedTime,
                              y.Completed,
                              y.Approver,
                              y.WeightNum,
                              ListUserSubItem = (from a in _context.WorkItemAssignStaffs
                                                 join b in _context.Users on a.UserId equals b.Id
                                                 where a.CheckItem == y.Id.ToString() && a.IsDeleted == false
                                                 select new
                                                 {
                                                     a.ID,
                                                 }),
                          }),
                      }).ToList();
                    var list = (from a in _context.SessionWorkResults
                                join b in _context.ShiftLogs on a.ShiftCode equals b.ShiftCode
                                where !a.IsDeleted && a.CardCode.Equals(cardCode)
                                select new ViewItem
                                {
                                    Id = a.Id,
                                    WorkSession = a.WorkSession,
                                    ItemWorkList = _context.SessionWorks.Where(x => !x.IsDeleted && x.Session == a.WorkSession).ToList(),
                                    Note = a.Note,
                                    Status = "",
                                    Progress = a.Progress,
                                    UserName = _context.Users.FirstOrDefault(x => x.UserName.Equals(a.CreatedBy)).GivenName,
                                    CheckItem = false,
                                    TimeCheckIn = b.ChkinTime.Value,
                                    Value = "",
                                    listItemActivity = (from c in _context.SessionWorkResults
                                                        join d in _context.SessionWorks on c.WorkSession equals d.Session
                                                        join e in _context.CardItemChecks on d.Item equals e.ChkListCode
                                                        where c.WorkSession.Equals(a.WorkSession) && !c.IsDeleted
                                                        select new WorkSessionResultTemp
                                                        {
                                                            Id = c.Id,
                                                            StartTime = c.StartTime,
                                                            EndTime = c.EndTime,
                                                            ProgressFromLeader = c.ProgressFromLeader,
                                                            ProgressFromStaff = c.ProgressFromStaff,
                                                            CheckTitle = e.CheckTitle
                                                        }).DistinctBy(x => x.Id).ToList(),
                                }).ToList();
                    foreach (var item in list)
                    {
                        string value = "";
                        foreach (var i in item.ItemWorkList)
                        {
                            var CheckTitle = _context.CardItemChecks.FirstOrDefault(x => !x.Flag && x.ChkListCode == i.Item);
                            if (CheckTitle != null)
                            {
                                value += CheckTitle.CheckTitle + ", ";
                            }
                        }
                        item.Value = value;
                    }
                    if (data.Any())
                    {
                        foreach (var item in data)
                        {
                            if (item.ListUserItemChk.Any())
                            {
                                foreach (var user in item.ListUserItemChk)
                                {
                                    var staff = _context.WorkItemAssignStaffs.FirstOrDefault(x => x.ID == user.ID);
                                    if (staff != null)
                                        _context.WorkItemAssignStaffs.Remove(staff);
                                }
                            }
                            if (item.ListSubItem.Any())
                            {
                                foreach (var subItem in item.ListSubItem)
                                {
                                    if (subItem.ListUserSubItem != null && subItem.ListUserSubItem.Any())
                                    {
                                        foreach (var id in subItem.ListUserSubItem)
                                        {
                                            var staff = _context.WorkItemAssignStaffs.FirstOrDefault(x => x.ID == id.ID);
                                            if (staff != null)
                                                _context.WorkItemAssignStaffs.Remove(staff);
                                        }

                                    }
                                }
                                var subs = _context.CardSubitemChecks.Where(y => y.ChkListCode == item.ChkListCode && y.Flag == false);
                                foreach (var sub in subs)
                                {
                                    sub.Flag = true;
                                }
                                _context.CardSubitemChecks.UpdateRange(subs);
                            }
                        }
                        var itemChecks = _context.CardItemChecks.Where(x => x.CardCode == cardCode && !x.Flag);
                        _context.CardItemChecks.RemoveRange(itemChecks);
                    }
                    //Roll back item work
                    if (dataBuffer.ItemCheck.Any())
                    {
                        foreach (var item in dataBuffer.ItemCheck)
                        {
                            var itemCheck = new CardItemCheck()
                            {
                                CardCode = cardCode,
                                CheckTitle = item.CheckTitle,
                                WeightNum = item.WeightNum,
                                ChkListCode = item.ChkListCode,
                                CreatedBy = item.CreatedBy,
                                CreatedTime = item.CreatedTime,
                                Completed = item.Completed,
                                Constraint = item.Constraint
                            };
                            _context.CardItemChecks.Add(itemCheck);

                            if (item.ListUserItemChk.Any())
                            {
                                foreach (var itemU in item.ListUserItemChk)
                                {
                                    var jobCardUser = new WorkItemAssignStaff
                                    {
                                        CardCode = cardCode,
                                        UserId = itemU.UserId,
                                        CheckItem = "",
                                        CheckListCode = item.ChkListCode,
                                        CreatedBy = itemU.CreatedBy,
                                        CreatedTime = itemU.CreatedTime,
                                        EstimateTime = itemU.EstimateTime.ToString(),
                                        Unit = itemU.Unit
                                    };
                                    _context.WorkItemAssignStaffs.Add(jobCardUser);
                                }
                            }
                            if (item.ListSubItem.Any())
                            {
                                foreach (var sI in item.ListSubItem)
                                {
                                    var subItem = new CardSubitemCheck()
                                    {
                                        ChkListCode = item.ChkListCode,
                                        Title = sI.Title,
                                        Approver = sI.Approver,
                                        Approve = sI.Approve,
                                        ApprovedTime = sI.ApprovedTime,
                                        Completed = sI.Completed,
                                        WeightNum = sI.WeightNum,
                                    };
                                    _context.CardSubitemChecks.Add(subItem);

                                    var lastSub = _context.CardSubitemChecks.MaxBy(x => x.Id);
                                    var id = lastSub != null ? lastSub.Id : 0;
                                    if (sI.ListUserSubItem != null)
                                    {
                                        foreach (var itemU in sI.ListUserSubItem)
                                        {
                                            id++;
                                            var jobCardUser = new WorkItemAssignStaff
                                            {
                                                CardCode = cardCode,
                                                UserId = itemU.UserId,
                                                CheckItem = id.ToString(),
                                                CheckListCode = item.ChkListCode,
                                                CreatedBy = itemU.CreatedBy,
                                                CreatedTime = itemU.CreatedTime,
                                                EstimateTime = itemU.EstimateTime.ToString(),
                                                Unit = itemU.Unit
                                            };
                                            _context.WorkItemAssignStaffs.Add(jobCardUser);
                                        }
                                    }
                                }
                            }
                        }
                    }

                    //Update log activity accept, reject
                    var timeEnd = DateTime.Now;
                    var logs = _context.LmsTaskStudentAssigns.Where(x => x.LmsTaskCode == cardCode && x.UserId == ESEIM.AppContext.UserId
                    && x.CreatedTime >= dataBuffer.TimeSpanActivity.TimeStart && x.CreatedTime <= timeEnd && x.Action != "REVIEW"
                    ).OrderByDescending(x => x.CreatedTime).ToList();
                    if (logs.Any())
                    {
                        for (int i = 0; i < logs.Count(); i++)
                        {
                            _context.LmsTaskStudentAssigns.Remove(logs[i]);
                        }
                    }
                    _context.SaveChanges();
                }
                catch (Exception ex)
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_MSG_ERR"];
                }
                return Json(msg);
            }
            else
            {
                return Json("");
            }

        }
        */

        [HttpGet]
        public async Task<JsonResult> GetAddress(string lat, string lon)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                msg.Object = await _googleAPI.GetAddressForCoordinates(Convert.ToDouble(lat), Convert.ToDouble(lon));
                //if (result.status == "OK")
                //{
                //    msg.Object = result.results[0].formatted_address;
                //}
                //else
                //{
                //    msg.Error = true;
                //    // msg.Title = "Key đã vượt mức giới hạn, vui lòng liên hệ administrator!";
                //    msg.Title = _stringLocalizerCJ["CJ_MSG_KEY_EXPIRED_PLS_CONTACT_ADMIN"];
                //    return Json(msg);
                //}
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi khi lấy địa chỉ!";
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetCardInList(string listCode)
        {
            var data = _context.LmsTasks.Where(x => !x.IsDeleted && x.ListCode == listCode);
            return Json(data);
        }

        [HttpGet]
        public bool HideCost()
        {
            var isNotVatco = false;
            var host = HttpContext.Request.Host.Value.ToString();
            if (!host.Contains("dieuhanh.vatco"))
            {
                isNotVatco = true;
            }
            return isNotVatco;
        }

        [NonAction]
        public Tuple<string, string> GetDepartmentGroupAssign(string cardCode)
        {
            var departmentAssign = "";
            var groupAssign = "";
            var data = from a in _context.JobCardAssignees.Where(x => !x.IsDeleted && x.CardCode.Equals(cardCode))
                       join b in _context.AdDepartments.Where(x => !x.IsDeleted && x.IsEnabled) on a.DepartmentCode equals b.DepartmentCode into b1
                       from b2 in b1.DefaultIfEmpty()
                       join c in _context.AdGroupUsers.Where(x => !x.IsDeleted && x.IsEnabled) on a.GroupCode equals c.GroupUserCode into c1
                       from c2 in c1.DefaultIfEmpty()
                       select new
                       {
                           Department = b2 != null ? b2.Title : "",
                           Group = c2 != null ? c2.Title : ""
                       };
            if (data.Any())
            {
                departmentAssign = string.Join(",", data.DistinctBy(x => x.Department).Select(x => x.Department));
                groupAssign = string.Join(",", data.DistinctBy(x => x.Group).Select(x => x.Group));
            }
            return new Tuple<string, string>(departmentAssign, groupAssign);
        }

        [NonAction]
        public Tuple<string, string> GetWfActName(string cardCode)
        {
            var wfName = "";
            var actName = "";
            var wfInst = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value
                && x.ObjectType == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.TypeInstCard) && x.ObjectInst == cardCode);
            if (wfInst != null)
            {
                var wf = _context.WorkFlows.FirstOrDefault(x => !x.IsDeleted.Value && x.WfCode == wfInst.WorkflowCode);
                if (wf != null)
                    wfName = wf.WfName;

                var acts = (from a in _context.WfActivityObjectProccessings.Where(x => !x.IsDeleted && x.ObjectInst == cardCode
                           && x.ObjectType == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.TypeInstCard))
                            join b in _context.ActivityInstances.Where(x => !x.IsDeleted && x.WorkflowCode == wfInst.WfInstCode) on a.ActInstCode equals b.ActivityInstCode
                            select new
                            {
                                a.ObjectType,
                                a.ObjectInst,
                                b.Title
                            });
                actName = string.Join(",", acts.Select(x => x.Title));
            }
            return new Tuple<string, string>(wfName, actName);
        }

        public class JsonStatusCard
        {
            public string Status { get; set; }
            public string CreatedBy { get; set; }
            public bool Lock { get; set; }
            public DateTime CreatedTime { get; set; }
        }
        public class PramSuggest
        {
            public string objectCode { get; set; }
            public string boardCode { get; set; }
            public string ListCode { get; set; }
        }
        public class BufferData
        {
            public CardBuffer CardJob { get; set; }
            public JcRelaCard JcRelative { get; set; }
            public CardLinkBuffer CardLink { get; set; }
            //public CardGroupOrMemberModel Assign { get; set; }
            public ProductBuffer ProductBuffer { get; set; }
            public ServiceBuffer ServiceBuffer { get; set; }
            public AddressBuffer AddressBuffer { get; set; }
            public TimeSpanActivity TimeSpanActivity { get; set; }
        }
        public class CardBuffer
        {
            public string CardCode { get; set; }
            public string CardName { get; set; }
            public string Description { get; set; }
            public string WorkType { get; set; }
            public string Status { get; set; }
            public string CardLevel { get; set; }
            public string Deadline { get; set; }
            public string BeginTime { get; set; }
            public string EndTime { get; set; }
            public string WeightNum { get; set; }
            public decimal Completed { get; set; }
            public string Inherit { get; set; }
            public string ListCode { get; set; }
            public decimal Cost { get; set; }
            public string Currency { get; set; }

        }
        public class JcRelaCard
        {
            public List<string> ListDelRelative { get; set; }
            public List<ObjectRela> ListRelative { get; set; }
        }
        public class CardLinkBuffer
        {
            public CardLinkBuffer()
            {
                ListCardLink = new List<CardLinkBufferData>();
            }
            public List<int> ListCardLinkDel { get; set; }
            public List<CardLinkBufferData> ListCardLink { get; set; }
        }
        public class ObjectRela
        {
            public int ID { get; set; }
            public string ObjName { get; set; }
            public string ObjTypeName { get; set; }
            public string ObjTypeCode { get; set; }
            public string ObjID { get; set; }
            public string RelativeCode { get; set; }
            public string RelativeName { get; set; }
            public string Weight { get; set; }
            public string IdObjTemp { get; set; }
        }
        public class CardLinkBufferData
        {
            public int Id { get; set; }
            public string Code { get; set; }
            public string Name { get; set; }
            public string Status { get; set; }
            public string EndDate { get; set; }
        }
        public class ProductBuffer
        {
            public List<int> ListDelProduct { get; set; }
            public List<ProductBufferData> ListProduct { get; set; }
        }
        public class ServiceBuffer
        {
            public List<int> ListDelService { get; set; }
            public List<ServiceBufferData> ListService { get; set; }
        }
        public class AddressBuffer
        {
            public List<int> ListDelAddress { get; set; }
            public List<AddressBufferData> ListAddress { get; set; }
        }
        public class ProductBufferData
        {
            public int ID { get; set; }
            public int Quantity { get; set; }
            public DateTime CreatedTime { get; set; }
            public string CreatedBy { get; set; }
            public string ProductCode { get; set; }
            public string ProductName { get; set; }
            public string JcAct { get; set; }
        }
        public class ServiceBufferData
        {
            public int ID { get; set; }
            public int Quantity { get; set; }
            public DateTime CreatedTime { get; set; }
            public string CreatedBy { get; set; }
            public string ServiceCode { get; set; }
            public string ServiceName { get; set; }
            public string JcAct { get; set; }
        }
        public class AddressBufferData
        {
            public int Id { get; set; }
            public string LocationGps { get; set; }
            public string LocationText { get; set; }
            public string CreatedBy { get; set; }
            public DateTime CreatedTime { get; set; }
        }
        public class ItemWorkCheck
        {
            public List<CheckListItemBuffer> ItemCheck { get; set; }
            //public List<ViewItem> ItemWork { get; set; }
            public decimal CompleteOld { get; set; }
            public TimeSpanActivity TimeSpanActivity { get; set; }
        }
        public class CheckListItemBuffer
        {
            public int Id { get; set; }
            public string CardCode { get; set; }
            public string ChkListCode { get; set; }
            public string CheckTitle { get; set; }
            public decimal WeightNum { get; set; }
            public decimal Completed { get; set; }
            public string CreatedBy { get; set; }
            public DateTime CreatedTime { get; set; }
            public bool CheckItem { get; set; }
            public string TitleSubItemChk { get; set; }
            public List<UserAssignBufeer> ListUserItemChk { get; set; }
            public List<SubItemBuffer> ListSubItem { get; set; }
            public string Constraint { get; set; }
        }
        public class SubItemBuffer
        {
            public int Id { get; set; }
            public string Title { get; set; }
            public decimal WeightNum { get; set; }
            public decimal Completed { get; set; }
            public bool Approve { get; set; }
            public List<UserAssignBufeer> ListUserSubItem { get; set; }
            public string Approver { get; set; }
            public DateTime? ApprovedTime { get; set; }
        }
        public class UserAssignBufeer
        {
            public int ID { get; set; }
            public string UserId { get; set; }
            public string GivenName { get; set; }
            public decimal EstimateTime { get; set; }
            public string Status { get; set; }
            public string Unit { get; set; }
            public string CreatedBy { get; set; }
            public DateTime CreatedTime { get; set; }
        }
        public class CommentBuffer
        {
            public List<int> ListDelComment { get; set; }
            public List<CommentBufferData> ListComment { get; set; }
        }
        public class CommentBufferData
        {
            public int Id { get; set; }
            public string Picture { get; set; }
            public string MemberId { get; set; }
            public string CmtContent { get; set; }
            public DateTime? CreatedTime { get; set; }
            public DateTime? UpdatedTime { get; set; }
            public string UpdatedBy { get; set; }
        }
        public class TimeSpanActivity
        {
            public DateTime? TimeStart { get; set; }
        }

        [HttpPost]
        public object GetSuggesstion([FromBody] PramSuggest prams)
        {
            var userName = ESEIM.AppContext.UserName;
            var user = _context.Users.FirstOrDefault(x => x.Active && x.UserName == userName);
            if (!string.IsNullOrEmpty(prams.boardCode))
            {
                var listCode = _context.LmsListTasks.FirstOrDefault(x => x.BoardCode == prams.boardCode && !x.IsDeleted);
                if (prams.objectCode == "")
                {
                    var max = _context.LmsTasks.Where(x => x.ListCode == listCode.ListCode && !x.IsDeleted && x.CreatedBy == userName);
                    if (max.Count() > 0)
                    {
                        var maxId = max.Max(x => x.Id);
                        var lastCard = _context.LmsTasks.FirstOrDefault(x => x.Id == maxId);

                        var listRela = _context.JcObjectIdRelatives.Where(x => !x.IsDeleted && x.CardCode == lastCard.LmsTaskCode);
                        var assign = _context.JobCardAssignees.Where(x => x.CardCode == lastCard.LmsTaskCode && !x.IsDeleted).ToList();
                        var listMember = assign.Where(x => x.UserId != null);
                        var listAttach = _context.CardAttachments.Where(x => x.CardCode == lastCard.LmsTaskCode && !x.Flag);
                        //Insert card and attr



                        var card = new LmsTask
                        {
                            LmsTaskName = "",
                            LmsTaskCode = "" + (_context.LmsTasks.Count() > 0 ? _context.LmsTasks.Max(x => x.Id) + 1 : 1),
                            ListCode = listCode.ListCode,
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedDate = DateTime.Now,
                            Status = "CREATED",
                            BeginTime = DateTime.Now,
                            Description = "",
                        };
                        _context.LmsTasks.Add(card);

                        var comment = new LmsTaskCommentList()
                        {
                            LmsTaskCode = card.LmsTaskCode,
                            CmtId = "Comment" + Guid.NewGuid().ToString(),
                            CmtContent = "Đã tạo công việc",
                            MemberId = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now
                        };
                        _context.LmsTaskCommentLists.Add(comment);

                        //Add department of member create card
                        var json = new List<JobCardAssignee>();
                        var addLeader = new JobCardAssignee
                        {
                            CardCode = card.LmsTaskCode,
                            UserId = ESEIM.AppContext.UserId,
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now,
                            Role = "ROLE_LEADER",
                            DepartmentCode = user != null ? !string.IsNullOrEmpty(user.DepartmentId) ? user.DepartmentId : "" : "",
                            GroupCode = "",
                            Item = "",
                            Approve = true,
                            ApproveTime = DateTime.Now,
                            Status = "ASSIGN_STATUS_WORK",
                            Branch = !string.IsNullOrEmpty(user.BranchId) ? user.BranchId : ""
                        };
                        _context.JobCardAssignees.Add(addLeader);
                        json.Add(addLeader);

                        if (listMember.Count() > 0)
                        {
                            foreach (var item in listMember)
                            {
                                if (item.UserId != ESEIM.AppContext.UserId)
                                {
                                    card.LmsUserList += item.UserId + ",";
                                    var assignee = new JobCardAssignee
                                    {
                                        CardCode = card.LmsTaskCode,
                                        UserId = item.UserId,
                                        DepartmentCode = item.DepartmentCode,
                                        GroupCode = item.GroupCode,
                                        Role = item.Role,
                                        CreatedBy = ESEIM.AppContext.UserName,
                                        CreatedTime = DateTime.Now,
                                        Item = item.Item,
                                        Approve = true,
                                        ApproveTime = DateTime.Now,
                                        Status = item.Status,
                                        Branch = item.Branch
                                    };
                                    _context.JobCardAssignees.Add(assignee);
                                    json.Add(assignee);
                                }
                            }
                        }

                        card.LmsUserList += ESEIM.AppContext.UserId + ",";
                        if (listRela.Count() > 0)
                        {
                            foreach (var item in listRela)
                            {
                                var rela = new JcObjectIdRelative
                                {
                                    CardCode = card.LmsTaskCode,
                                    ObjTypeCode = item.ObjTypeCode,
                                    ObjID = item.ObjID,
                                    Relative = item.Relative,
                                    CreatedBy = userName,
                                    CreatedTime = DateTime.Now,
                                    Weight = item.Weight.HasValue ? item.Weight.Value : 0
                                };
                                _context.JcObjectIdRelatives.Add(rela);
                            }
                        }
                        if (listAttach.Count() > 0)
                        {
                            foreach (var item in listAttach)
                            {
                                var attach = new CardAttachment
                                {
                                    CardCode = card.LmsTaskCode,
                                    FileCode = "ATTACHMENT" + DateTime.Now.ToString("ddMMyyyyHHmmss"),
                                    MemberId = userName,
                                    FileName = item.FileName,
                                    FileUrl = item.FileUrl,
                                    CreatedTime = DateTime.Now,
                                    ListPermissionViewFile = item.ListPermissionViewFile,
                                    IsEdms = item.IsEdms,
                                    IdMapping = item.IdMapping
                                };
                                _context.CardAttachments.Add(attach);
                            }

                        }

                        //_cardService.UpdatePercentParentCard(card.LmsTaskCode);
                        _context.SaveChanges();
                        return new
                        {
                            BoardCode = prams.boardCode,
                            Card = card,
                            ListCode = listCode.ListCode,
                        };
                    }
                    else
                    {


                        var card = new LmsTask
                        {
                            LmsTaskName = "",
                            LmsTaskCode = "" + (_context.LmsTasks.Count() > 0 ? _context.LmsTasks.Max(x => x.Id) + 1 : 1),
                            ListCode = listCode.ListCode,
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedDate = DateTime.Now,
                            Status = "CREATED",
                            BeginTime = DateTime.Now,
                            Description = "",
                        };
                        _context.LmsTasks.Add(card);
                        var comment = new LmsTaskCommentList()
                        {
                            LmsTaskCode = card.LmsTaskCode,
                            CmtId = "Comment" + Guid.NewGuid().ToString(),
                            CmtContent = "Đã tạo công việc",
                            MemberId = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now
                        };
                        _context.LmsTaskCommentLists.Add(comment);
                        var json = new List<JobCardAssignee>();
                        var addLeader = new JobCardAssignee
                        {
                            CardCode = card.LmsTaskCode,
                            UserId = ESEIM.AppContext.UserId,
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now,
                            Role = "ROLE_LEADER",
                            DepartmentCode = user != null ? !string.IsNullOrEmpty(user.DepartmentId) ? user.DepartmentId : "" : "",
                            GroupCode = "",
                            Item = "",
                            Approve = true,
                            ApproveTime = DateTime.Now,
                            Status = "ASSIGN_STATUS_WORK",
                            Branch = !string.IsNullOrEmpty(user.BranchId) ? user.BranchId : ""
                        };
                        _context.JobCardAssignees.Add(addLeader);
                        json.Add(addLeader);
                        card.LmsUserList += ESEIM.AppContext.UserId + ",";
                        //_cardService.UpdatePercentParentCard(card.LmsTaskCode);
                        _context.SaveChanges();
                        return new
                        {
                            BoardCode = prams.boardCode,
                            Card = card,
                            ListCode = listCode.ListCode,
                        };
                    }
                }
                else
                {
                    var max = (from a in _context.LmsTasks
                               join b in _context.JcObjectIdRelatives on a.LmsTaskCode equals b.CardCode
                               where !a.IsDeleted && !b.IsDeleted && b.ObjID == prams.objectCode && a.CreatedBy == userName && a.ListCode == listCode.ListCode
                               select a);
                    if (max.Count() > 0)
                    {
                        var maxId = max.Max(x => x.Id);
                        var lastCard = _context.LmsTasks.FirstOrDefault(x => x.Id == maxId);

                        var listRela = _context.JcObjectIdRelatives.Where(x => !x.IsDeleted && x.CardCode == lastCard.LmsTaskCode);
                        var assign = _context.JobCardAssignees.Where(x => x.CardCode == lastCard.LmsTaskCode && !x.IsDeleted);
                        var listMember = assign.Where(x => x.UserId != null);
                        var listAttach = _context.CardAttachments.Where(x => x.CardCode == lastCard.LmsTaskCode && !x.Flag);
                        //Insert card and attr


                        var card = new LmsTask
                        {
                            LmsTaskName = "",
                            LmsTaskCode = "" + (_context.LmsTasks.Count() > 0 ? _context.LmsTasks.Max(x => x.Id) + 1 : 1),
                            ListCode = listCode.ListCode,
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedDate = DateTime.Now,
                            Status = "CREATED",
                            BeginTime = DateTime.Now,
                            Description = "",
                        };
                        _context.LmsTasks.Add(card);
                        var comment = new LmsTaskCommentList()
                        {
                            LmsTaskCode = card.LmsTaskCode,
                            CmtId = "Comment" + Guid.NewGuid().ToString(),
                            CmtContent = "Đã tạo công việc",
                            MemberId = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now
                        };
                        _context.LmsTaskCommentLists.Add(comment);

                        //Add department of member create card
                        var json = new List<JobCardAssignee>();
                        var assignee = new JobCardAssignee
                        {
                            CardCode = card.LmsTaskCode,
                            DepartmentCode = !string.IsNullOrEmpty(user.DepartmentId) ? user.DepartmentId : "",
                            CreatedBy = userName,
                            CreatedTime = DateTime.Now,
                            Role = "ROLE_LEADER",
                            GroupCode = "",
                            Item = "",
                            UserId = ESEIM.AppContext.UserId,
                            Approve = true,
                            ApproveTime = DateTime.Now,
                            Status = "ASSIGN_STATUS_WORK",
                            Branch = !string.IsNullOrEmpty(user.BranchId) ? user.BranchId : ""
                        };
                        _context.JobCardAssignees.Add(assignee);
                        json.Add(assignee);
                        if (listMember.Count() > 0)
                        {
                            foreach (var item in listMember)
                            {
                                if (item.UserId != ESEIM.AppContext.UserId)
                                {
                                    card.LmsUserList += item.UserId + ",";
                                    var jobAssign = new JobCardAssignee
                                    {
                                        CardCode = card.LmsTaskCode,
                                        DepartmentCode = item.DepartmentCode,
                                        CreatedBy = ESEIM.AppContext.UserName,
                                        CreatedTime = DateTime.Now,
                                        Role = "ROLE_LEADER",
                                        GroupCode = item.GroupCode,
                                        Item = item.Item,
                                        UserId = item.UserId,
                                        Approve = true,
                                        ApproveTime = DateTime.Now,
                                        Status = item.Status,
                                        Branch = item.Branch
                                    };
                                    _context.JobCardAssignees.Add(jobAssign);
                                    json.Add(jobAssign);
                                }
                            }
                        }
                        if (listRela.Count() > 0)
                        {
                            foreach (var item in listRela)
                            {
                                var rela = new JcObjectIdRelative
                                {
                                    CardCode = card.LmsTaskCode,
                                    ObjTypeCode = item.ObjTypeCode,
                                    ObjID = item.ObjID,
                                    Relative = item.Relative,
                                    CreatedBy = userName,
                                    CreatedTime = DateTime.Now,
                                    Weight = item.Weight.HasValue ? item.Weight.Value : 0
                                };
                                _context.JcObjectIdRelatives.Add(rela);
                            }
                        }
                        //Auto add project to card
                        var relaAuto = new JcObjectIdRelative
                        {
                            CardCode = card.LmsTaskCode,
                            ObjTypeCode = "PROJECT",
                            ObjID = prams.objectCode,
                            Relative = "MAIN",
                            CreatedBy = userName,
                            CreatedTime = DateTime.Now,
                            Weight = 0
                        };
                        _context.JcObjectIdRelatives.Add(relaAuto);

                        if (listAttach.Count() > 0)
                        {
                            foreach (var item in listAttach)
                            {
                                var attach = new CardAttachment
                                {
                                    CardCode = card.LmsTaskCode,
                                    FileCode = "ATTACHMENT" + DateTime.Now.ToString("ddMMyyyyHHmmss"),
                                    MemberId = userName,
                                    FileName = item.FileName,
                                    FileUrl = item.FileUrl,
                                    CreatedTime = DateTime.Now,
                                    ListPermissionViewFile = item.ListPermissionViewFile,
                                    IsEdms = item.IsEdms,
                                    IdMapping = item.IdMapping
                                };
                                _context.CardAttachments.Add(attach);
                            }

                        }
                        card.LmsUserList += ESEIM.AppContext.UserId + ",";
                        //_cardService.UpdatePercentParentCard(card.LmsTaskCode);
                        _context.SaveChanges();
                        return new
                        {
                            BoardCode = prams.boardCode,
                            Card = card,
                            ListCode = listCode.ListCode,
                        };
                    }
                    else
                    {



                        var card = new LmsTask
                        {
                            LmsTaskName = "",
                            LmsTaskCode = "" + (_context.LmsTasks.Count() > 0 ? _context.LmsTasks.Max(x => x.Id) + 1 : 1),
                            ListCode = listCode.ListCode,
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedDate = DateTime.Now,
                            Status = "CREATED",
                            BeginTime = DateTime.Now,
                            Description = "",
                        };
                        _context.LmsTasks.Add(card);

                        //Auto add project to card
                        var relaAuto = new JcObjectIdRelative
                        {
                            CardCode = card.LmsTaskCode,
                            ObjTypeCode = "PROJECT",
                            ObjID = prams.objectCode,
                            Relative = "MAIN",
                            CreatedBy = userName,
                            CreatedTime = DateTime.Now,
                            Weight = 0
                        };
                        _context.JcObjectIdRelatives.Add(relaAuto);

                        var comment = new LmsTaskCommentList()
                        {
                            LmsTaskCode = card.LmsTaskCode,
                            CmtId = "Comment" + Guid.NewGuid().ToString(),
                            CmtContent = "Đã tạo công việc",
                            MemberId = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now
                        };
                        _context.LmsTaskCommentLists.Add(comment);

                        var json = new List<JobCardAssignee>();
                        var addLeader = new JobCardAssignee
                        {
                            CardCode = card.LmsTaskCode,
                            UserId = ESEIM.AppContext.UserId,
                            CreatedBy = userName,
                            CreatedTime = DateTime.Now,
                            Role = "ROLE_LEADER",
                            GroupCode = "",
                            DepartmentCode = !string.IsNullOrEmpty(user.DepartmentId) ? user.DepartmentId : "",
                            Approve = true,
                            ApproveTime = DateTime.Now,
                            Item = "",
                            Status = "ASSIGN_STATUS_WORK",
                            Branch = !string.IsNullOrEmpty(user.BranchId) ? user.BranchId : ""
                        };
                        _context.JobCardAssignees.Add(addLeader);
                        json.Add(addLeader);
                        card.LmsUserList += ESEIM.AppContext.UserId + ",";
                        //_cardService.UpdatePercentParentCard(card.LmsTaskCode);
                        _context.SaveChanges();
                        return new
                        {
                            BoardCode = prams.boardCode,
                            Card = card,
                            ListCode = listCode.ListCode,
                        };
                    }
                }
            }
            else
            {
                if (prams.objectCode == "")
                {
                    var max = _context.LmsTasks.Where(x => x.IsDeleted == false && x.CreatedBy == userName);
                    if (max.Count() > 0)
                    {
                        var maxId = max.Max(x => x.Id);
                        var lastCard = _context.LmsTasks.FirstOrDefault(x => x.Id == maxId);

                        var listCode = _context.LmsListTasks.FirstOrDefault(x => x.ListCode == lastCard.ListCode && !x.IsDeleted);
                        var board = _context.LmsBoardTasks.FirstOrDefault(x => x.BoardCode == listCode.BoardCode && !x.IsDeleted);
                        var listRela = _context.JcObjectIdRelatives.Where(x => !x.IsDeleted && x.CardCode == lastCard.LmsTaskCode);
                        var assign = _context.JobCardAssignees.Where(x => x.CardCode == lastCard.LmsTaskCode && !x.IsDeleted);
                        var listMember = assign.Where(x => x.UserId != null);
                        var listAttach = _context.CardAttachments.Where(x => x.CardCode == lastCard.LmsTaskCode && !x.Flag);
                        //Insert card and attr


                        var card = new LmsTask
                        {
                            LmsTaskName = "",
                            LmsTaskCode = "" + (_context.LmsTasks.Count() > 0 ? _context.LmsTasks.Max(x => x.Id) + 1 : 1),
                            ListCode = listCode.ListCode,
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedDate = DateTime.Now,
                            Status = "CREATED",
                            BeginTime = DateTime.Now,
                            Description = "",
                        };
                        _context.LmsTasks.Add(card);
                        var comment = new LmsTaskCommentList()
                        {
                            LmsTaskCode = card.LmsTaskCode,
                            CmtId = "Comment" + Guid.NewGuid().ToString(),
                            CmtContent = "Đã tạo công việc",
                            MemberId = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now
                        };
                        _context.LmsTaskCommentLists.Add(comment);

                        var json = new List<JobCardAssignee>();
                        var assignee = new JobCardAssignee
                        {
                            CardCode = card.LmsTaskCode,
                            DepartmentCode = !string.IsNullOrEmpty(user.DepartmentId) ? user.DepartmentId : "",
                            CreatedBy = userName,
                            CreatedTime = DateTime.Now,
                            Role = "ROLE_LEADER",
                            GroupCode = "",
                            Item = "",
                            UserId = ESEIM.AppContext.UserId,
                            Approve = true,
                            ApproveTime = DateTime.Now,
                            Status = "ASSIGN_STATUS_WORK",
                            Branch = !string.IsNullOrEmpty(user.BranchId) ? user.BranchId : ""
                        };
                        _context.JobCardAssignees.Add(assignee);
                        json.Add(assignee);

                        card.LmsUserList += ESEIM.AppContext.UserId + ",";
                        if (listMember.Count() > 0)
                        {
                            foreach (var item in listMember)
                            {
                                card.LmsUserList += item.UserId + ",";
                                if (item.UserId != ESEIM.AppContext.UserId)
                                {
                                    var jobAssign = new JobCardAssignee
                                    {
                                        CardCode = card.LmsTaskCode,
                                        UserId = item.UserId,
                                        CreatedBy = userName,
                                        CreatedTime = DateTime.Now,
                                        Role = item.Role,
                                        DepartmentCode = item.DepartmentCode,
                                        GroupCode = item.GroupCode,
                                        Item = item.Item,
                                        Approve = item.Approve,
                                        ApproveTime = DateTime.Now,
                                        Status = item.Status,
                                        Branch = item.Branch
                                    };
                                    _context.JobCardAssignees.Add(jobAssign);
                                    json.Add(jobAssign);
                                }
                            }
                        }
                        if (listRela.Count() > 0)
                        {
                            foreach (var item in listRela)
                            {
                                var rela = new JcObjectIdRelative
                                {
                                    CardCode = card.LmsTaskCode,
                                    ObjTypeCode = item.ObjTypeCode,
                                    ObjID = item.ObjID,
                                    Relative = item.Relative,
                                    CreatedBy = userName,
                                    CreatedTime = DateTime.Now,
                                    Weight = item.Weight.HasValue ? item.Weight.Value : 0
                                };
                                _context.JcObjectIdRelatives.Add(rela);
                            }
                        }
                        if (listAttach.Count() > 0)
                        {
                            foreach (var item in listAttach)
                            {
                                var attach = new CardAttachment
                                {
                                    CardCode = card.LmsTaskCode,
                                    FileCode = "ATTACHMENT" + DateTime.Now.ToString("ddMMyyyyHHmmss"),
                                    MemberId = userName,
                                    FileName = item.FileName,
                                    FileUrl = item.FileUrl,
                                    CreatedTime = DateTime.Now,
                                    ListPermissionViewFile = item.ListPermissionViewFile,
                                    IsEdms = item.IsEdms,
                                    IdMapping = item.IdMapping
                                };
                                _context.CardAttachments.Add(attach);
                            }

                        }
                        //_cardService.UpdatePercentParentCard(card.LmsTaskCode);
                        _context.SaveChanges();
                        return new
                        {
                            BoardCode = board.BoardCode,
                            Card = card,
                            ListCode = listCode.ListCode,
                        };
                    }
                    else
                    {
                        var boards = _context.LmsBoardTasks.Where(x => !x.IsDeleted);
                        if (boards.Any())
                        {
                            var board = boards.FirstOrDefault();
                            var list = _context.LmsListTasks.FirstOrDefault(x => x.BoardCode == board.BoardCode && !x.IsDeleted);




                            var card = new LmsTask
                            {
                                LmsTaskName = "",
                                LmsTaskCode = "" + (_context.LmsTasks.Count() > 0 ? _context.LmsTasks.Max(x => x.Id) + 1 : 1),
                                ListCode = list.ListCode,
                                CreatedBy = ESEIM.AppContext.UserName,
                                CreatedDate = DateTime.Now,
                                Status = "CREATED",
                                BeginTime = DateTime.Now,
                                Description = "",
                            };
                            _context.LmsTasks.Add(card);
                            var comment = new LmsTaskCommentList()
                            {
                                LmsTaskCode = card.LmsTaskCode,
                                CmtId = "Comment" + Guid.NewGuid().ToString(),
                                CmtContent = "Đã tạo công việc",
                                MemberId = ESEIM.AppContext.UserName,
                                CreatedTime = DateTime.Now
                            };
                            _context.LmsTaskCommentLists.Add(comment);
                            var json = new List<JobCardAssignee>();
                            var assignee = new JobCardAssignee
                            {
                                CardCode = card.LmsTaskCode,
                                DepartmentCode = !string.IsNullOrEmpty(user.DepartmentId) ? user.DepartmentId : "",
                                CreatedBy = userName,
                                CreatedTime = DateTime.Now,
                                Role = "ROLE_LEADER",
                                GroupCode = "",
                                Item = "",
                                UserId = ESEIM.AppContext.UserId,
                                Approve = true,
                                ApproveTime = DateTime.Now,
                                Status = "ASSIGN_STATUS_WORK",
                                Branch = !string.IsNullOrEmpty(user.BranchId) ? user.BranchId : ""
                            };
                            _context.JobCardAssignees.Add(assignee);
                            json.Add(assignee);
                            card.LmsUserList += ESEIM.AppContext.UserId + ",";
                            //_cardService.UpdatePercentParentCard(card.LmsTaskCode);
                            _context.SaveChanges();
                            return new
                            {
                                BoardCode = board.BoardCode,
                                Card = card,
                                ListCode = list.ListCode,
                            };
                        }
                        else
                        {
                            return Json("");
                        }
                    }
                }
                else
                {
                    var max = (from a in _context.LmsTasks
                               join b in _context.JcObjectIdRelatives on a.LmsTaskCode equals b.CardCode
                               where !a.IsDeleted && !b.IsDeleted && b.ObjID == prams.objectCode && a.CreatedBy == userName
                               select a);
                    if (max.Count() > 0)
                    {
                        var maxId = max.Max(x => x.Id);
                        var lastCard = _context.LmsTasks.FirstOrDefault(x => x.Id == maxId);

                        var list = _context.LmsListTasks.FirstOrDefault(x => x.ListCode == lastCard.ListCode && !x.IsDeleted);
                        var board = _context.LmsBoardTasks.FirstOrDefault(x => x.BoardCode == list.BoardCode && !x.IsDeleted);
                        var listRela = _context.JcObjectIdRelatives.Where(x => !x.IsDeleted && x.CardCode == lastCard.LmsTaskCode);
                        var assign = _context.JobCardAssignees.Where(x => x.CardCode == lastCard.LmsTaskCode && !x.IsDeleted);
                        var listMember = assign.Where(x => x.UserId != null);
                        var listAttach = _context.CardAttachments.Where(x => x.CardCode == lastCard.LmsTaskCode && !x.Flag);
                        //Insert card and attr


                        var card = new LmsTask
                        {
                            LmsTaskName = "",
                            LmsTaskCode = "" + (_context.LmsTasks.Count() > 0 ? _context.LmsTasks.Max(x => x.Id) + 1 : 1),
                            ListCode = lastCard.ListCode,
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedDate = DateTime.Now,
                            Status = "CREATED",
                            BeginTime = DateTime.Now,
                            Description = "",
                        };
                        _context.LmsTasks.Add(card);
                        var comment = new LmsTaskCommentList()
                        {
                            LmsTaskCode = card.LmsTaskCode,
                            CmtId = "Comment" + Guid.NewGuid().ToString(),
                            CmtContent = "Đã tạo công việc",
                            MemberId = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now
                        };
                        _context.LmsTaskCommentLists.Add(comment);

                        var json = new List<JobCardAssignee>();

                        var assignee = new JobCardAssignee
                        {
                            CardCode = card.LmsTaskCode,
                            DepartmentCode = !string.IsNullOrEmpty(user.DepartmentId) ? user.DepartmentId : "",
                            CreatedBy = userName,
                            CreatedTime = DateTime.Now,
                            Role = "ROLE_LEADER",
                            GroupCode = "",
                            Item = "",
                            UserId = ESEIM.AppContext.UserId,
                            Approve = true,
                            ApproveTime = DateTime.Now,
                            Status = "ASSIGN_STATUS_WORK",
                            Branch = !string.IsNullOrEmpty(user.BranchId) ? user.BranchId : ""
                        };
                        _context.JobCardAssignees.Add(assignee);
                        json.Add(assignee);

                        card.LmsUserList += ESEIM.AppContext.UserId + ",";
                        if (listMember.Count() > 0)
                        {
                            foreach (var item in listMember)
                            {
                                card.LmsUserList += item.UserId + ",";
                                if (item.UserId != ESEIM.AppContext.UserId)
                                {
                                    var jobAssign = new JobCardAssignee
                                    {
                                        CardCode = card.LmsTaskCode,
                                        UserId = item.UserId,
                                        CreatedBy = userName,
                                        CreatedTime = DateTime.Now,
                                        Role = item.Role,
                                        DepartmentCode = item.DepartmentCode,
                                        GroupCode = item.GroupCode,
                                        Item = item.Item,
                                        Approve = true,
                                        ApproveTime = DateTime.Now,
                                        Status = item.Status,
                                        Branch = item.Branch
                                    };
                                    _context.JobCardAssignees.Add(jobAssign);
                                    json.Add(jobAssign);
                                }
                            }
                        }
                        if (listRela.Count() > 0)
                        {
                            foreach (var item in listRela)
                            {
                                var rela = new JcObjectIdRelative
                                {
                                    CardCode = card.LmsTaskCode,
                                    ObjTypeCode = item.ObjTypeCode,
                                    ObjID = item.ObjID,
                                    Relative = item.Relative,
                                    CreatedBy = userName,
                                    CreatedTime = DateTime.Now,
                                    Weight = item.Weight.HasValue ? item.Weight.Value : 0
                                };
                                _context.JcObjectIdRelatives.Add(rela);
                            }
                        }
                        if (listAttach.Count() > 0)
                        {
                            foreach (var item in listAttach)
                            {
                                var attach = new CardAttachment
                                {
                                    CardCode = card.LmsTaskCode,
                                    FileCode = "ATTACHMENT" + DateTime.Now.ToString("ddMMyyyyHHmmss"),
                                    MemberId = userName,
                                    FileName = item.FileName,
                                    FileUrl = item.FileUrl,
                                    CreatedTime = DateTime.Now,
                                    ListPermissionViewFile = item.ListPermissionViewFile,
                                    IsEdms = item.IsEdms,
                                    IdMapping = item.IdMapping
                                };
                                _context.CardAttachments.Add(attach);
                            }

                        }
                        //_cardService.UpdatePercentParentCard(card.LmsTaskCode);
                        _context.SaveChanges();
                        return new
                        {
                            BoardCode = board.BoardCode,
                            Card = card,
                            ListCode = lastCard.ListCode,
                        };
                    }
                    else
                    {
                        var boards = _context.LmsBoardTasks.Where(x => !x.IsDeleted);
                        if (boards.Any())
                        {
                            var board = boards.FirstOrDefault();
                            var list = _context.LmsListTasks.FirstOrDefault(x => x.BoardCode == board.BoardCode && !x.IsDeleted);


                            var card = new LmsTask
                            {
                                LmsTaskName = "",
                                LmsTaskCode = "" + (_context.LmsTasks.Count() > 0 ? _context.LmsTasks.Max(x => x.Id) + 1 : 1),
                                ListCode = list.ListCode,
                                CreatedBy = ESEIM.AppContext.UserName,
                                CreatedDate = DateTime.Now,
                                Status = "CREATED",
                                BeginTime = DateTime.Now,
                                Description = "",
                            };
                            _context.LmsTasks.Add(card);
                            var comment = new LmsTaskCommentList()
                            {
                                LmsTaskCode = card.LmsTaskCode,
                                CmtId = "Comment" + Guid.NewGuid().ToString(),
                                CmtContent = "Đã tạo công việc",
                                MemberId = ESEIM.AppContext.UserName,
                                CreatedTime = DateTime.Now
                            };
                            _context.LmsTaskCommentLists.Add(comment);
                            var json = new List<JobCardAssignee>();
                            var assignee = new JobCardAssignee
                            {
                                CardCode = card.LmsTaskCode,
                                DepartmentCode = !string.IsNullOrEmpty(user.DepartmentId) ? user.DepartmentId : "",
                                CreatedBy = userName,
                                CreatedTime = DateTime.Now,
                                Role = "ROLE_LEADER",
                                GroupCode = "",
                                Item = "",
                                UserId = ESEIM.AppContext.UserId,
                                Approve = true,
                                ApproveTime = DateTime.Now,
                                Status = "ASSIGN_STATUS_WORK",
                                Branch = !string.IsNullOrEmpty(user.BranchId) ? user.BranchId : ""
                            };
                            _context.JobCardAssignees.Add(assignee);
                            json.Add(assignee);
                            card.LmsUserList += ESEIM.AppContext.UserId + ",";
                            //_cardService.UpdatePercentParentCard(card.LmsTaskCode);
                            _context.SaveChanges();
                            return new
                            {
                                BoardCode = board.BoardCode,
                                Card = card,
                                ListCode = list.ListCode,
                            };
                        }
                        else
                        {
                            return Json("");
                        }
                    }
                }
            }
        }

        [HttpPost]
        public JsonResult GetInherit(string cardCode)
        {
            var data = _context.JcObjectIdRelatives.Where(x => x.CardCode == cardCode && !x.IsDeleted);
            var listCard = new List<ObjTemp>();
            foreach (var item in data)
            {
                var query = (from a in _context.JcObjectIdRelatives.Where(x => !x.IsDeleted && x.ObjID == item.ObjID)
                             join b in _context.LmsTasks.Where(x => !x.IsDeleted) on a.CardCode equals b.LmsTaskCode
                             select new ObjTemp
                             {
                                 Code = b.LmsTaskCode,
                                 Name = b.LmsTaskName
                             }).DistinctBy(x => x.Code).ToList();
                listCard.AddRange(query);
            }
            return Json(listCard);
        }

        [HttpPost]
        public JsonResult ScopeCardProject()
        {
            var data = (from a in _context.LmsTasks.Where(x => !x.IsDeleted && x.Status != "TRASH" && x.Status != "CANCLED")
                        join b in _context.JcObjectIdRelatives.Where(x => !x.IsDeleted && x.ObjTypeCode == "PROJECT") on a.LmsTaskCode equals b.CardCode
                        select new
                        {
                            a.Id,
                            a.LmsTaskCode,
                            a.LmsTaskName
                        }).DistinctBy(x => x.LmsTaskCode);
            return Json(data);
        }

        [HttpPost]
        public JsonResult UpdateListCard(string cardCode, string listCode)
        {
            var msg = new JMessage();
            if (listCode == "")
            {
                msg.Error = true;
                msg.Title = _stringLocalizerCJ["CJ_MSG_PLS_SELECT_LIST"];
            }

            if (listCode != "")
            {
                var data = _context.LmsTasks.FirstOrDefault(x => x.LmsTaskCode == cardCode && !x.IsDeleted);
                data.ListCode = listCode;
                msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                _context.SaveChanges();
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult CopyCard(string cardCode)
        {
            var msg = new JMessage();
            var session = HttpContext.GetSessionUser();
            try
            {
                var cardSrcCopy = _context.LmsTasks.FirstOrDefault(x => x.LmsTaskCode == cardCode && !x.IsDeleted);

                var cardDesCopy = new LmsTask
                {
                    LmsTaskName = "Copy_" + cardSrcCopy.LmsTaskName,
                    LmsTaskCode = "" + (_context.LmsTasks.Count() > 0 ? _context.LmsTasks.Max(x => x.Id) + 1 : 1),
                    ListCode = cardSrcCopy.ListCode,
                    CreatedBy = ESEIM.AppContext.UserName,
                    CreatedDate = DateTime.Now,
                    Status = "CREATED",
                    BeginTime = DateTime.Now,
                    EndTime = cardSrcCopy.EndTime,
                    Description = cardSrcCopy.Description,
                };
                _context.LmsTasks.Add(cardDesCopy);
                var comment = new LmsTaskCommentList()
                {
                    LmsTaskCode = cardDesCopy.LmsTaskCode,
                    CmtId = "Comment" + Guid.NewGuid().ToString(),
                    CmtContent = "Đã tạo công việc",
                    MemberId = ESEIM.AppContext.UserName,
                    CreatedTime = DateTime.Now
                };
                _context.LmsTaskCommentLists.Add(comment);

                var getList = _context.LmsListTasks.FirstOrDefault(x => x.ListCode == cardSrcCopy.ListCode && !x.IsDeleted);
                var getBoard = _context.LmsBoardTasks.FirstOrDefault(x => x.BoardCode == getList.BoardCode && !x.IsDeleted);
                //Member assign
                cardDesCopy.LmsUserList = cardSrcCopy.LmsUserList;
                //Object relative
                var listRela = _context.JcObjectIdRelatives.Where(x => !x.IsDeleted && x.CardCode == cardSrcCopy.LmsTaskCode);
                foreach (var item in listRela)
                {
                    var rela = new JcObjectIdRelative
                    {
                        CardCode = cardDesCopy.LmsTaskCode,
                        ObjTypeCode = item.ObjTypeCode,
                        ObjID = item.ObjID,
                        Relative = item.Relative,
                        Weight = item.Weight.HasValue ? item.Weight.Value : 0,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now,
                    };
                    _context.JcObjectIdRelatives.Add(rela);
                }
                //File attachment in card
                //CopyFileCard(cardSrcCopy, cardDesCopy.LmsTaskCode);
                //Location work
                var location = _context.WORKOSAddressCards.Where(x => x.CardCode == cardSrcCopy.LmsTaskCode && !x.IsDeleted);
                foreach (var item in location)
                {
                    var locationCard = new WORKOSAddressCard
                    {
                        CardCode = cardDesCopy.LmsTaskCode,
                        LocationGps = item.LocationGps,
                        LocationText = item.LocationText,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now
                    };
                    _context.WORKOSAddressCards.Add(locationCard);
                }
                //Product
                var products = _context.JcProducts.Where(x => x.CardCode == cardSrcCopy.LmsTaskCode && !x.IsDeleted);
                foreach (var item in products)
                {
                    var product = new JcProduct
                    {
                        CardCode = cardDesCopy.LmsTaskCode,
                        ProductCode = item.ProductCode,
                        Quantity = item.Quantity,
                        JcAct = item.JcAct,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now
                    };
                    _context.JcProducts.Add(product);
                }
                //Service
                var services = _context.JcServices.Where(x => x.CardCode == cardSrcCopy.LmsTaskCode && !x.IsDeleted);
                foreach (var item in services)
                {
                    var service = new JcService
                    {
                        CardCode = cardDesCopy.LmsTaskCode,
                        ServiceCode = item.ServiceCode,
                        Quantity = item.Quantity,
                        JcAct = item.JcAct,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now
                    };
                    _context.JcServices.Add(service);

                }
                //Card item check
                var cardItemChecks = _context.CardItemChecks.Where(x => x.CardCode == cardSrcCopy.LmsTaskCode && !x.Flag).OrderBy(x => x.CreatedTime);
                foreach (var item in cardItemChecks)
                {
                    var code = "CHECK_LIST_" + (Guid.NewGuid().ToString());
                    var cardItem = new CardItemCheck
                    {
                        CardCode = cardDesCopy.LmsTaskCode,
                        CheckTitle = item.CheckTitle,
                        ChkListCode = code,
                        Percent = item.Percent,
                        Completed = item.Completed,
                        WeightNum = item.WeightNum,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now
                    };
                    _context.CardItemChecks.Add(cardItem);

                    //subitem
                    var subItems = _context.CardSubitemChecks.Where(x => x.ChkListCode == item.ChkListCode && !x.Flag).OrderBy(x => x.Id);
                    var maxId = _context.CardSubitemChecks.Max(x => x.Id);
                    foreach (var i in subItems)
                    {
                        maxId = maxId + 1;
                        var subItem = new CardSubitemCheck()
                        {
                            ChkListCode = code,
                            Title = i.Title,
                            Approver = ESEIM.AppContext.UserName,
                            Approve = false
                        };
                        _context.CardSubitemChecks.Add(subItem);
                        //Work sub item activity
                        var subItemActivitys = _context.WorkItemAssignStaffs.Where(x => x.CardCode.Equals(cardSrcCopy.LmsTaskCode) && !x.IsDeleted && x.CheckListCode.Equals(i.ChkListCode) && x.CheckItem.Equals(i.Id.ToString()));
                        foreach (var subAct in subItemActivitys)
                        {
                            var jobCardUser = new WorkItemAssignStaff
                            {
                                CardCode = cardDesCopy.LmsTaskCode,
                                UserId = subAct.UserId,
                                CheckItem = maxId.ToString(),
                                CheckListCode = subItem.ChkListCode,
                                CreatedBy = ESEIM.AppContext.UserName,
                                CreatedTime = DateTime.Now
                            };
                            _context.WorkItemAssignStaffs.Add(jobCardUser);
                        }
                    }
                    //WorkItem activity
                    var data = _context.WorkItemAssignStaffs.Where(x => x.CardCode.Equals(cardSrcCopy.LmsTaskCode) && !x.IsDeleted && x.CheckListCode.Equals(item.ChkListCode) && x.CheckItem == "");
                    foreach (var k in data)
                    {
                        var jobCardUser = new WorkItemAssignStaff
                        {
                            CardCode = cardDesCopy.LmsTaskCode,
                            UserId = k.UserId,
                            CheckItem = "",
                            CheckListCode = cardItem.ChkListCode,
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now
                        };
                        _context.WorkItemAssignStaffs.Add(jobCardUser);
                    }
                }
                _context.SaveChanges();
                msg.Object = cardDesCopy;
                msg.Title = _stringLocalizerCJ["CJ_MSG_COPY_CARD_SUCCESS"];
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        /*
        [NonAction]
        public void CopyFileCard(LmsTask card, string cardDesCode)
        {
            var listFileByUser = _context.FilesShareObjectUsers.Where(x => !x.IsDeleted && x.UserShares.Any(p => p.Code.Equals(User.Identity.Name)))
                                                              .Select(p => new
                                                              {
                                                                  p.FileID,
                                                                  p.ListUserShare,
                                                                  p.UserShares
                                                              }).ToList();
            var query = (from a in _context.EDMSRepoCatFiles.Where(x => x.ObjectCode == card.LmsTaskCode && x.ObjectType == EnumHelper<CardEnum>.GetDisplayValue(CardEnum.CardJob))
                         join b in _context.EDMSFiles.Where(x => !x.IsDeleted && (x.IsFileMaster == null || x.IsFileMaster == true)) on a.FileCode equals b.FileCode
                         join f in _context.EDMSRepositorys on a.ReposCode equals f.ReposCode into f1
                         from f in f1.DefaultIfEmpty()
                         join g in listFileByUser on b.FileCode equals g.FileID into g1
                         from g in g1.DefaultIfEmpty()
                         select new
                         {
                             Id = a.Id,
                             FileCode = b.FileCode,
                             FileName = b.FileName,
                             a.CatCode,
                             FileTypePhysic = b.FileTypePhysic,
                             Desc = b.Desc,
                             CreatedTime = b.CreatedTime.Value,
                             CloudFileId = b.CloudFileId,
                             ReposName = f != null ? f.ReposName : "",
                             ReposCode = f != null ? f.ReposCode : "",
                             FileID = b.FileID,
                             SizeOfFile = b.FileSize.HasValue ? b.FileSize.Value : 0,
                             Type = "NO_SHARE",
                             ListUserShare = g.ListUserShare,
                             FolderId = a.FolderId,
                             MimeType = b.MimeType,
                             FileSize = b.FileSize,
                             Path = a.Path
                         }).Union(
                        from a in _context.FilesShareObjectUsers.Where(x => !x.IsDeleted)
                        join c in _context.EDMSRepoCatFiles on a.FileID equals c.FileCode
                        join b in _context.EDMSFiles on c.FileCode equals b.FileCode
                        join f in _context.EDMSRepositorys on c.ReposCode equals f.ReposCode into f1
                        from f in f1.DefaultIfEmpty()
                        let rela = JsonConvert.DeserializeObject<ObjRelative>(a.ObjectRelative)
                        where rela.ObjectInstance.Equals(card.LmsTaskCode) && rela.ObjectType.Equals("JOBCARD")
                        select new
                        {
                            Id = c.Id,
                            FileCode = b.FileCode,
                            FileName = b.FileName,
                            c.CatCode,
                            FileTypePhysic = b.FileTypePhysic,
                            Desc = b.Desc,
                            CreatedTime = b.CreatedTime.Value,
                            CloudFileId = b.CloudFileId,
                            ReposName = f != null ? f.ReposName : "",
                            ReposCode = f != null ? f.ReposCode : "",
                            FileID = b.FileID,
                            SizeOfFile = b.FileSize.HasValue ? b.FileSize.Value : 0,
                            Type = "SHARE",
                            ListUserShare = a.ListUserShare,
                            FolderId = c.FolderId,
                            MimeType = b.MimeType,
                            FileSize = b.FileSize,
                            Path = c.Path
                        });
            var files = query.DistinctBy(x => x.FileCode);
            foreach (var item in files)
            {
                var fileNew = string.Concat(Path.GetFileNameWithoutExtension(item.FileName), "_", Guid.NewGuid().ToString().Substring(0, 8), Path.GetExtension(item.FileName));
                var byteData = DownloadFileFromServer(item.Id);
                var urlUpload = UploadFileToServer(byteData, item.ReposCode, item.CatCode, fileNew, item.MimeType);

                var edmsReposCatFile = new EDMSRepoCatFile
                {
                    FileCode = string.Concat("Card_", Guid.NewGuid().ToString()),
                    ReposCode = item.ReposCode,
                    CatCode = item.CatCode,
                    ObjectCode = cardDesCode,
                    ObjectType = EnumHelper<CardEnum>.GetDisplayValue(CardEnum.CardJob),
                    Path = item.Path,
                    FolderId = item.FolderId
                };
                _context.EDMSRepoCatFiles.Add(edmsReposCatFile);

                var edms = new EDMSFile
                {
                    FileCode = edmsReposCatFile.FileCode,
                    FileName = item.FileName,
                    Desc = "",
                    ReposCode = item.ReposCode,
                    Tags = "",
                    FileSize = item.FileSize,
                    FileTypePhysic = item.FileTypePhysic,
                    NumberDocument = "",
                    CreatedBy = ESEIM.AppContext.UserName,
                    CreatedTime = DateTime.Now,
                    Url = urlUpload.Object.ToString(),
                    MimeType = item.MimeType,
                    CloudFileId = item.CloudFileId,
                };
                _context.EDMSFiles.Add(edms);
            }
        }*/

        [HttpGet]
        public object UserCreatedCard(string cardCode)
        {
            var currentUser = ESEIM.AppContext.UserName;
            var data = _context.LmsTasks.FirstOrDefault(x => x.LmsTaskCode == cardCode && !x.IsDeleted);
            var cardMapping = (from a in _context.JobCardAssignees.Where(x => !x.IsDeleted)
                               join b in _context.Users on a.UserId equals b.Id
                               where a.CardCode == data.LmsTaskCode && a.Role == "ROLE_LEADER_ACCEPTED"
                               select new
                               {
                                   b.UserName
                               }).DistinctBy(x => x.UserName);
            var check = false;
            if (currentUser == data.CreatedBy)
            {
                check = true;
            }
            else
            {
                foreach (var item in cardMapping)
                {
                    if (currentUser != item.UserName)
                    {
                        check = false;
                    }
                    else
                    {
                        check = true;
                        break;
                    }
                }
            }

            return check;
        }
        #endregion

        #region Member
        [HttpPost]
        public object GetListUser()
        {
            var query = from a in _context.Users
                        join b in _context.AdDepartments.Where(x => !x.IsDeleted && x.IsEnabled) on a.DepartmentId equals b.DepartmentCode
                        select new
                        {
                            UserId = a.Id,
                            GivenName = a.GivenName,
                            Type = 0,
                            DepartmentId = b.DepartmentId,
                            RoleSys = (from m in _context.UserRoles.Where(x => x.UserId.Equals(a.Id))
                                       join n in _context.Roles on m.RoleId equals n.Id
                                       select n).FirstOrDefault() != null ? (from m in _context.UserRoles.Where(x => x.UserId.Equals(a.Id))
                                                                             join n in _context.Roles on m.RoleId equals n.Id
                                                                             select n).FirstOrDefault().Title : "Nhân viên",
                            Priority = 0,
                            DepartmentName = b.Title,
                            Branch = a.BranchId
                        };
            return query;
        }

        [HttpPost]
        public object GetListUserOfBranch(string branch)
        {
            var query = from a in _context.Users.Where(x => x.BranchId == branch)
                        join b in _context.LmsUserClasses on a.UserName equals b.UserName into b1
                        from b in b1.DefaultIfEmpty()
                        join c in _context.LmsClasses.Where(x => !x.IsDeleted) on b.ClassCode equals c.ClassCode into c1
                        from c in c1.DefaultIfEmpty()
                        select new
                        {
                            UserId = a.Id,
                            a.GivenName,
                            a.UserName,
                            //RoleSys = c.Title,
                            Branch = a.Branch,
                            ClassName = c != null ? c.ClassName : ""
                        };
            return query;
        }

        [HttpPost]
        public object GetListClass()
        {
            var session = HttpContext.GetSessionUser();
            return _context.LmsClasses.Where(x => !x.IsDeleted && x.ManagerTeacher == session.UserName)
                .Select(x => new { Code = x.ClassCode, Name = x.ClassName, Count = _context.LmsUserClasses.Count(y => y.ClassCode == x.ClassCode) });
        }

        [HttpPost]
        public object GetListUserOfClass(string classCode)
        {
            var query = from a in _context.Users
                        join b in _context.LmsUserClasses.Where(x => x.ClassCode == classCode) on a.UserName equals b.UserName
                        join c in _context.LmsClasses.Where(x => !x.IsDeleted) on b.ClassCode equals c.ClassCode
                        select new
                        {
                            UserId = a.Id,
                            a.GivenName,
                            a.UserName,
                            DepartmentCode = "",
                            //RoleSys = c.Title,
                            Branch = a.Branch.OrgAddonCode,
                            ClassName = c.ClassName
                        };
            return query;
        }
        #endregion

        #region CheckList
        [HttpPost]
        public JsonResult DeleteLmsTaskItemProgressAllUser([FromBody] LmsTaskUserItemProgress obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var listLmsTaskItems = _context.LmsTaskUserItemProgresses.Where(x => x.ItemCode.Equals(obj.ItemCode) && x.TrainingType.Equals(obj.TrainingType)
                && x.LmsTaskCode.Equals(obj.LmsTaskCode) && !x.IsDeleted);
                if (listLmsTaskItems.Count() > 0)
                {
                    foreach (var item in listLmsTaskItems)
                    {
                        item.IsDeleted = true;
                        _context.LmsTaskUserItemProgresses.Update(item);
                    }

                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
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
        public JsonResult GetLmsUserProgressGroupByItem(string LmsTaskCode)
        {
            var data = (from a in _context.LmsTaskUserItemProgresses.Where(x => x.LmsTaskCode.Equals(LmsTaskCode) && !x.IsDeleted)
                        join b in _context.Users on a.User equals b.Id
                        select new
                        {
                            a.ItemCode,
                            a.TrainingType,
                            a.ItemTitle,
                            a.ProgressAuto,
                            a.TeacherApproved,
                            a.LmsTaskCode,
                            UserId = b.Id,
                            b.GivenName
                        }
                ).GroupBy(x => new { x.ItemCode, x.TrainingType }).Select(
                g => new
                {
                    g.Key.ItemCode,
                    g.Key.TrainingType,
                    ItemName = g.FirstOrDefault().ItemTitle,
                    ListUsers = g.ToList()
                });
            return Json(data);
        }
        [HttpPost]
        public JsonResult UpdateCheckList([FromBody] CheckData obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var item = _context.LmsTasks.FirstOrDefault(x => x.LmsTaskCode == obj.Code);
                if (item != null)
                {
                    item.LmsItemList = obj.JsonData;
                    item.UpdatedTime = DateTime.Now;
                    item.UpdatedBy = User.Identity.Name;

                    var activity = new LmsTaskStudentAssign()
                    {
                        UserId = ESEIM.AppContext.UserId,
                        Action = "UPDATE",
                        IdObject = "ITEMWORK",
                        IsCheck = true,
                        LmsTaskCode = obj.Code,
                        CreatedTime = DateTime.Now,
                        FromDevice = "Laptop/Desktop",
                        ChangeDetails = ""
                    };
                    _context.LmsTaskStudentAssigns.Add(activity);
                    UpdateChangeCard(obj.Code);
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_UPDATE_SUCCESS"]);
                    return Json(msg);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_UPDATE_FAIL"]);
                    return Json(msg);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_UPDATE_FAIL"]);
                msg.Object = ex;
                return Json(msg);
            }
        }
        [HttpPost]
        public JsonResult GetListSubject()
        {
            var data = _context.LmsSubjectManagements.Select(x => new
            {
                Code = x.SubjectCode,
                Name = x.SubjectName,
            });
            return Json(data);
        }
        [HttpPost]
        public JsonResult GetListLecture(string subjectCode, string search = "", int skip = 0, int take = 100)
        {
            var data = _context.LmsLectureManagements
            .Where(x => x.SubjectCode == subjectCode 
            && (String.IsNullOrEmpty(search) || (!String.IsNullOrEmpty(x.LectName) && x.LectName.Contains(search))))
            .Skip(skip)
            .Take(take)
            .Select(x => new
            {
                Code = x.LectCode,
                Name = x.LectName,
            });
            return Json(data);
        }
        [HttpPost]
        public JsonResult GetListQuiz(string subjectCode, string search = "", int skip = 0, int take = 100)
        {
            var data = _context.QuizPools
            .Where(x => x.SubjectCode == subjectCode
            && (String.IsNullOrEmpty(search) || (!String.IsNullOrEmpty(x.Content) && x.Content.Contains(search))
             || (!String.IsNullOrEmpty(x.Code) && x.Code.Contains(search))))
            .Skip(skip)
            .Take(take)
            .Select(x => new
            {
                Code = x.Code,
                Name = x.Code + '-' + x.Content,
                Type = x.Type
            });
            return Json(data);
        }
        [HttpPost]
        public JsonResult GetListPractices(string search = "", int skip = 0, int take = 100)
        {
            var data = _context.LmsPracticeTestHeaders
            .Where(x => !x.IsDeleted
            && (String.IsNullOrEmpty(search) || (!String.IsNullOrEmpty(x.PracticeTestTitle) && x.PracticeTestTitle.Contains(search))))
            .Skip(skip)
            .Take(take)
            .Select(x => new
            {
                Code = x.PracticeTestCode,
                Name = x.PracticeTestTitle,
            });
            return Json(data);
        }
        public class ListLmsLectureDropdown
        {
            public string Code { get; set; }
            public string Name { get; set; }
        }
        public class CheckData
        {
            public string Code { get; set; }
            public string JsonData { get; set; }
        }
        #endregion

        #region Comment
        [HttpPost]
        public JsonResult AddComment([FromBody] LmsTaskCommentList obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                string code = "COMMENT_" + Guid.NewGuid().ToString();
                LmsTaskCommentList data = new LmsTaskCommentList()
                {
                    LmsTaskCode = obj.LmsTaskCode,
                    CmtId = code,
                    CmtContent = obj.CmtContent,
                    MemberId = ESEIM.AppContext.UserName,
                    CreatedTime = DateTime.Now
                };

                var activity = new LmsTaskStudentAssign
                {
                    UserId = ESEIM.AppContext.UserId,
                    IdObject = "CMT",
                    Action = "ADD",
                    IsCheck = true,
                    LmsTaskCode = data.LmsTaskCode,
                    CreatedTime = DateTime.Now,
                    FromDevice = "Laptop/Desktop",
                    ChangeDetails = obj.CmtContent
                };
                _context.LmsTaskStudentAssigns.Add(activity);

                _context.LmsTaskCommentLists.Add(data);

                var card = _context.LmsTasks.FirstOrDefault(x => !x.IsDeleted && x.LmsTaskCode.Equals(obj.LmsTaskCode));
                if (card != null)
                {
                    var lstSession = new List<CardSessionUser>();
                    if (!string.IsNullOrEmpty(card.LockShare))
                    {
                        lstSession = JsonConvert.DeserializeObject<List<CardSessionUser>>(card.LockShare);
                        var isExist = false;
                        foreach (var item in lstSession)
                        {
                            if (item.User == ESEIM.AppContext.UserName)
                            {
                                item.NewDataUpdate = false;
                                isExist = true;
                            }
                            else
                            {
                                item.NewDataUpdate = true;
                            }

                            item.TimeStamp = DateTime.Now;
                        }
                        if (!isExist)
                        {
                            var cardSession = new CardSessionUser
                            {
                                User = ESEIM.AppContext.UserName,
                                TimeStamp = DateTime.Now,
                                NewDataUpdate = false
                            };
                            lstSession.Add(cardSession);
                        }
                    }
                    else
                    {
                        var cardSession = new CardSessionUser
                        {
                            User = ESEIM.AppContext.UserName,
                            TimeStamp = DateTime.Now,
                            NewDataUpdate = false
                        };
                        lstSession.Add(cardSession);
                    }
                    card.LockShare = JsonConvert.SerializeObject(lstSession);
                }

                _context.SaveChanges();

                msg.Error = false;
                msg.Title = String.Format(_sharedResources["COM_ADD_SUCCESS"], _stringLocalizerCJ["CJ_MSG_COMMENT"]);
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                return Json(msg);
            }
        }
        [HttpPost]
        public JsonResult GetComments(string CardCode)
        {
            var query = (from a in _context.LmsTaskCommentLists.Where(x => !x.Flag)
                         join b in _context.Users on a.MemberId equals b.UserName
                         where a.LmsTaskCode == CardCode
                         select new RollbackComment
                         {
                             Id = a.Id,
                             GivenName = b.GivenName,
                             Picture = b.Picture,
                             MemberId = a.MemberId,
                             CmtContent = a.CmtContent,
                             CreatedTime = a.CreatedTime,
                             UpdatedTime = a.UpdatedTime,
                             CardCode = a.LmsTaskCode,
                             UpdatedBy = a.UpdatedBy != null ? _context.Users.FirstOrDefault(x => x.UserName == a.UpdatedBy).GivenName : ""
                         }).OrderByDescending(x => x.CreatedTime).ToList();
            return Json(query);
        }
        [HttpPost]
        public JsonResult DeleteComment(int id)
        {
            var msg = new JMessage() { Error = true };
            var currentUser = ESEIM.AppContext.UserName;
            try
            {
                var data = _context.LmsTaskCommentLists.FirstOrDefault(x => x.Id.Equals(id));
                if (currentUser == data.MemberId)
                {
                    data.Flag = true;
                    _context.LmsTaskCommentLists.Update(data);
                    var activity = new LmsTaskStudentAssign
                    {
                        UserId = ESEIM.AppContext.UserId,
                        IdObject = "CMT",
                        Action = "DELETE",
                        IsCheck = true,
                        LmsTaskCode = data.LmsTaskCode,
                        CreatedTime = DateTime.Now,
                        FromDevice = "Laptop/Desktop",
                        ChangeDetails = data.CmtContent
                    };
                    _context.LmsTaskStudentAssigns.Add(activity);

                    var card = _context.LmsTasks.FirstOrDefault(x => !x.IsDeleted && x.LmsTaskCode.Equals(data.LmsTaskCode));
                    if (card != null)
                    {
                        var lstSession = new List<CardSessionUser>();
                        if (!string.IsNullOrEmpty(card.LockShare))
                        {
                            lstSession = JsonConvert.DeserializeObject<List<CardSessionUser>>(card.LockShare);
                            var isExist = false;
                            foreach (var item in lstSession)
                            {
                                if (item.User == ESEIM.AppContext.UserName)
                                {
                                    item.NewDataUpdate = false;
                                    isExist = true;
                                }
                                else
                                {
                                    item.NewDataUpdate = true;
                                }

                                item.TimeStamp = DateTime.Now;
                            }
                            if (!isExist)
                            {
                                var cardSession = new CardSessionUser
                                {
                                    User = ESEIM.AppContext.UserName,
                                    TimeStamp = DateTime.Now,
                                    NewDataUpdate = false
                                };
                                lstSession.Add(cardSession);
                            }
                        }
                        else
                        {
                            var cardSession = new CardSessionUser
                            {
                                User = ESEIM.AppContext.UserName,
                                TimeStamp = DateTime.Now,
                                NewDataUpdate = false
                            };
                            lstSession.Add(cardSession);
                        }
                        card.LockShare = JsonConvert.SerializeObject(lstSession);
                    }

                    _context.SaveChanges();

                    msg.Error = false;
                    //msg.Title = String.Format(_stringLocalize["COM_MSG_DELETE_SUCCESS"), _stringLocalize[""));//"Xóa thành công";
                    msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizerCJ["CJ_MSG_CANNOT_DELETE"];
                }

                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                //msg.Title = String.Format(_stringLocalize["COM_MSG_DELETE_FAIL"), _stringLocalize[""));// "Có lỗi khi xóa!";
                return Json(msg);
            }
        }

        [HttpPost]
        public JsonResult UpdateComment([FromBody] LmsTaskCommentList obj)
        {
            var msg = new JMessage() { Error = true };
            if (string.IsNullOrEmpty(obj.CmtContent))
            {
                msg.Title = _stringLocalizerCJ["CJ_CURD_MSG_ADD_CONTENT"];// "Nhập nội dung!";
                return Json(msg);
            }
            //else
            //{
            //    if (obj.CmtContent.Length > 255)
            //    {
            //        //msg.Title = "255 ký tự!";
            //        msg.Title = _stringLocalizer["CJ_MSG_LIMIT_CHARACTER"];
            //        return Json(msg);
            //    }
            //}
            try
            {
                var currentUser = ESEIM.AppContext.UserName;
                var data = _context.LmsTaskCommentLists.First(x => x.Id.Equals(obj.Id));
                if (data.CmtContent.Equals(obj.CmtContent))
                {
                    msg.Error = false;
                    msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                    return Json(msg);
                }
                if (data.MemberId == currentUser)
                {
                    var activity = new LmsTaskStudentAssign
                    {
                        UserId = ESEIM.AppContext.UserId,
                        IdObject = "CMT",
                        Action = "UPDATE",
                        IsCheck = true,
                        LmsTaskCode = data.LmsTaskCode,
                        CreatedTime = DateTime.Now,
                        FromDevice = "Laptop/Desktop",
                        ChangeDetails = "Bình luận từ " + data.CmtContent + " sang " + obj.CmtContent
                    };
                    _context.LmsTaskStudentAssigns.Add(activity);

                    data.CmtContent = obj.CmtContent;
                    data.UpdatedBy = ESEIM.AppContext.UserName;
                    data.UpdatedTime = DateTime.Now;

                    var card = _context.LmsTasks.FirstOrDefault(x => !x.IsDeleted && x.LmsTaskCode.Equals(obj.LmsTaskCode));
                    if (card != null)
                    {
                        var lstSession = new List<CardSessionUser>();
                        if (!string.IsNullOrEmpty(card.LockShare))
                        {
                            lstSession = JsonConvert.DeserializeObject<List<CardSessionUser>>(card.LockShare);
                            var isExist = false;
                            foreach (var item in lstSession)
                            {
                                if (item.User == ESEIM.AppContext.UserName)
                                {
                                    item.NewDataUpdate = false;
                                    isExist = true;
                                }
                                else
                                {
                                    item.NewDataUpdate = true;
                                }
                            }
                            if (!isExist)
                            {
                                var cardSession = new CardSessionUser
                                {
                                    User = ESEIM.AppContext.UserName,
                                    TimeStamp = DateTime.Now,
                                    NewDataUpdate = false
                                };
                                lstSession.Add(cardSession);
                            }
                        }
                        else
                        {
                            var cardSession = new CardSessionUser
                            {
                                User = ESEIM.AppContext.UserName,
                                TimeStamp = DateTime.Now,
                                NewDataUpdate = false
                            };
                            lstSession.Add(cardSession);
                        }
                        card.LockShare = JsonConvert.SerializeObject(lstSession);
                    }

                    _context.SaveChanges();

                    msg.Error = false;
                    //msg.Title = String.Format(_stringLocalize["COM_MSG_UPDATE_SUCCESS"), _stringLocalize[""));// "Cập nhật thành công";
                    msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizerCJ["CJ_MSG_CANNOT_UPDATE_CMT"];
                }
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                //msg.Title = String.Format(_stringLocalize["COM_MSG_UPDATE_FAILED"), _stringLocalize[""));// "Có lỗi khi cập nhật!";
                return Json(msg);
            }
        }
        #endregion

        #region Attachment
        [HttpPost]
        public JsonResult AddAttachment([FromBody] CardAttachment data)
        {
            var msg = new JMessage() { Error = true };
            try
            {
                var card = _context.LmsTasks.FirstOrDefault(x => x.LmsTaskCode == data.CardCode && !x.IsDeleted);
                string code = "ATTACHMENT_" + data.CardCode + (_context.CardAttachments.Count() > 0 ? _context.CardAttachments.Last().Id + 1 : 0);
                data.FileCode = code;
                data.CreatedTime = DateTime.Now;
                data.MemberId = ESEIM.AppContext.UserName;
                data.ListPermissionViewFile = card.LmsUserList;

                var activity = new LmsTaskStudentAssign
                {
                    UserId = ESEIM.AppContext.UserId,
                    IdObject = "FILE",
                    Action = "ADD",
                    IsCheck = true,
                    LmsTaskCode = data.CardCode,
                    CreatedTime = DateTime.Now,
                    FromDevice = "Laptop/Desktop",
                    ChangeDetails = data.FileName
                };

                _context.LmsTaskStudentAssigns.Add(activity);
                _context.CardAttachments.Add(data);
                _context.SaveChanges();

                msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizerCJ["CJ_CURD_TAB_ADD_ATTACHMENT"]); //"Thêm thành công";
                msg.Error = false;
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                //msg.Title = String.Format(_stringLocalize["COM_MSG_ADD_FAILED"), _stringLocalize["CJ_CURD_TAB_ADD_ATTACHMENT"));//"Có lỗi xảy ra!";
                return Json(msg);
            }
        }
        [HttpPost]
        public JsonResult GetAttachment(string CardCode)
        {
            var data = ((from a in _context.CardAttachments.Where(x => x.CardCode.Equals(CardCode) && x.Flag == false)
                         select new LstAttachment
                         {
                             Id = a.Id,
                             FileName = a.FileName,
                             FileUrl = a.FileUrl,
                             MemberId = a.MemberId,
                             FileCode = a.FileCode,
                             CreatedTime = a.CreatedTime.Value,
                             Type = 1,
                             Icon = "",
                             Color = ""
                         }).Union(
                from a in _context.FilesShareObjectUsers.Where(x => !x.IsDeleted
                     && JsonConvert.DeserializeObject<ObjRelative>(x.ObjectRelative).ObjectType.Equals("JOBCARD")
                     && JsonConvert.DeserializeObject<ObjRelative>(x.ObjectRelative).ObjectInstance.Equals(CardCode))
                select new LstAttachment
                {
                    Id = a.ID,
                    FileName = a.FileName,
                    FileUrl = a.FileUrl,
                    MemberId = a.CreatedBy,
                    FileCode = a.FileID,
                    CreatedTime = a.CreatedTime,
                    Type = 2,
                    Icon = "",
                    Color = ""
                })).ToList();
            foreach (var item in data)
            {
                var extension = Path.GetExtension(item.FileUrl);
                if (extension.Equals(".doc") || extension.Equals(".docx"))
                {
                    item.Icon = "fa fa-file-word-o";
                    item.Color = "rgb(13,118,206);font-size: 15px;";
                }
                else if (extension.Equals(".xls") || extension.Equals(".xlsx"))
                {
                    item.Icon = "fa fa-file-excel-o";
                    item.Color = "rgb(106,170,89);font-size: 15px;";
                }
                else if (extension.Equals(".pdf"))
                {
                    item.Icon = "fa fa-file-pdf-o";
                    item.Color = "rgb(226,165,139);font-size: 15px;";
                }
                //'.JPG', '.PNG', '.TIF', '.TIFF'
                else if (extension.ToUpper().Equals(".JPG") || extension.ToUpper().Equals(".PNG")
                    || extension.ToUpper().Equals(".TIF") || extension.ToUpper().Equals(".TIFF"))
                {
                    item.Icon = "fa fa-picture-o";
                    item.Color = "rgb(42,42,42);font-size: 15px;";
                }
                else
                {
                    item.Icon = "fa fa-file-o";
                    item.Color = "rgb(42,42,42);font-size: 15px;";
                }
            }
            return Json(data);
        }
        [HttpPost]
        public object GetFilePath(string filePath, string cardCode)
        {
            var msg = new JMessage();

            var extension = Path.GetExtension(filePath);
            var attachment = _context.CardAttachments.FirstOrDefault(x => x.FileUrl == filePath && x.CardCode == cardCode);
            var session = HttpContext.GetSessionUser();
            var listUserEdit = new List<string>();
            if (string.IsNullOrEmpty(attachment.ListUserView))
            {
                listUserEdit.Add(session.FullName);
                attachment.ListUserView = JsonConvert.SerializeObject(listUserEdit);
            }
            //else
            //{
            //    var checkExits = JsonConvert.DeserializeObject<List<string>>(attachment.ListUserView);
            //    msg.ID = -1;
            //    msg.Error = true;
            //    msg.Title = string.Format("Tệp đang được chỉnh sửa bởi {0}", string.Join(",", checkExits));
            //    if (!checkExits.Any(x => x.Equals(session.FullName)))
            //    {
            //        checkExits.Add(session.FullName);
            //        attachment.ListUserView = JsonConvert.SerializeObject(checkExits);
            //    }
            //}

            var asean = new AseanDocument();
            asean.File_Code = attachment.FileCode;
            asean.Mode = 2;
            asean.File_Path = "";
            asean.FirstPage = "/Admin/CardJob";
            if (extension.ToUpper() == ".DOCX" || extension.ToUpper() == ".DOC")
            {
                DocmanController.pathFile = filePath;
                DocmanController.cardCode = cardCode;
                DocmanController.docmodel = asean;
            }
            if (extension.ToUpper() == ".XLSX" || extension.ToUpper() == ".XLS")
            {
                ExcelController.pathFile = filePath;
                ExcelController.cardCode = cardCode;
                ExcelController.docmodel = asean;
            }
            if (extension.ToUpper() == ".PDF")
            {
                PDFController.pathFile = filePath;
            }
            attachment.IsEdit = true;
            attachment.UpdatedTime = DateTime.Now;
            _context.SaveChanges();

            return msg;
        }
        [HttpPost]
        [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
        [RequestSizeLimit(long.MaxValue)]
        public object UploadFile(IndexCardAttach obj, IFormFile fileUpload)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var moduleObj = (EDMSCatRepoSetting)_upload.GetPathByModule(module_name).Object;
                var cardJobCategory = _context.EDMSCategorys.FirstOrDefault(x => x.CatCode == moduleObj.CatCode);
                var upload = _upload.UploadFile(fileUpload, cardJobCategory.PathServerPhysic);
                if (upload.Error)
                {
                    msg.Error = true;
                    msg.Title = upload.Title;
                }
                else
                {
                    var mimeType = fileUpload.ContentType;
                    var extension = Path.GetExtension(fileUpload.FileName);
                    string code = "ATTACHMENT_" + obj.CardCode + "_" + (_context.CardAttachments.Count() > 0 ? _context.CardAttachments.Last().Id + 1 : 0);
                    msg.Object = upload.Object;
                    if (Array.IndexOf(LuceneExtension.fileMimetypes, mimeType) >= 0 && (Array.IndexOf(LuceneExtension.fileExt, extension.ToUpper()) >= 0))
                    {
                        moduleObj = (EDMSCatRepoSetting)_upload.GetPathByModule("DB_LUCENE_INDEX").Object;
                        var luceneCategory = _context.EDMSCategorys.FirstOrDefault(x => x.CatCode == moduleObj.CatCode);
                        LuceneExtension.IndexFile(code, fileUpload, luceneCategory.PathServerPhysic);
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                //msg.Title = String.Format(_stringLocalize["COM_ERR_UPLOAD_FILE")); //"Có lỗi xảy ra khi upload file!"; 
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult DeleteAttachment([FromBody] DelAttachment obj)
        {
            var msg = new JMessage() { Error = true };
            var currentUser = ESEIM.AppContext.UserName;
            try
            {
                if (obj.Type == 1)
                {
                    var data = _context.CardAttachments.FirstOrDefault(x => x.FileCode.Equals(obj.FileCode));
                    if (data.MemberId == currentUser)
                    {
                        _context.CardAttachments.Remove(data);
                        var activity = new LmsTaskStudentAssign
                        {
                            UserId = ESEIM.AppContext.UserId,
                            IdObject = "FILE",
                            Action = "DELETE",
                            IsCheck = true,
                            LmsTaskCode = data.CardCode,
                            CreatedTime = DateTime.Now,
                            FromDevice = "Laptop/Desktop",
                            ChangeDetails = data.FileName
                        };

                        _context.LmsTaskStudentAssigns.Add(activity);
                        _context.SaveChanges();

                        msg.Error = false;
                        msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizerCJ["CJ_MSG_CANNOT_DELETE"];
                    }
                }
                else if (obj.Type == 2)
                {
                    var data = _context.FilesShareObjectUsers.FirstOrDefault(x => !x.IsDeleted && x.FileID.Equals(obj.FileCode)
                    && JsonConvert.DeserializeObject<ObjRelative>(x.ObjectRelative).ObjectType.Equals("JOBCARD")
                    && JsonConvert.DeserializeObject<ObjRelative>(x.ObjectRelative).ObjectInstance.Equals(obj.CardCode));
                    if (data != null)
                    {
                        if (data.CreatedBy == ESEIM.AppContext.UserName)
                        {
                            data.IsDeleted = true;
                            data.DeletedBy = ESEIM.AppContext.UserName;
                            data.DeletedTime = DateTime.Now;
                            _context.FilesShareObjectUsers.Update(data);

                            var activity = new LmsTaskStudentAssign
                            {
                                UserId = ESEIM.AppContext.UserId,
                                IdObject = "FILE",
                                Action = "DELETE",
                                IsCheck = true,
                                LmsTaskCode = obj.CardCode,
                                CreatedTime = DateTime.Now,
                                FromDevice = "Laptop/Desktop",
                                ChangeDetails = data.FileName
                            };
                            _context.LmsTaskStudentAssigns.Add(activity);
                            _context.SaveChanges();
                            msg.Error = false;
                            msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
                        }
                        else
                        {
                            msg.Error = true;
                            msg.Title = _stringLocalizerCJ["CJ_MSG_CANNOT_DELETE"];
                        }
                    }
                }
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                return Json(msg);
            }
        }

        [HttpPost]
        public JsonResult GetListUserFile(int Id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var query = _context.CardAttachments.FirstOrDefault(x => x.Id == Id && !x.Flag);
                if (query != null)
                {
                    var listPermission = !string.IsNullOrEmpty(query.ListPermissionViewFile) ? query.ListPermissionViewFile.Split(",", StringSplitOptions.None) : new string[0];
                    msg.Object = (from a in _context.Users
                                  join b in listPermission on a.Id equals b
                                  select new
                                  {
                                      a.Id,
                                      a.UserName,
                                      a.GivenName
                                  }).DistinctBy(x => x.UserName);
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
        public JsonResult UpdateListPermissionViewFile(int Id, string ListPermissionViewFile)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.CardAttachments.FirstOrDefault(x => x.Id == Id && !x.Flag);
                if (data != null)
                {
                    data.ListPermissionViewFile = ListPermissionViewFile;
                    _context.CardAttachments.Update(data);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_MSG_ERR"];
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
        public object CheckFileItem(string itemCode)
        {
            var isExist = false;
            var data = _context.CardAttachments.FirstOrDefault(x => x.ChkListCode.Equals(itemCode));
            if (data != null)
            {
                isExist = true;
            }
            else
            {
                isExist = false;
            }
            return isExist;
        }

        [HttpGet]
        public object IsFileEdms(string fileCode, string url)
        {
            var data = (from a in _context.EDMSRepoCatFiles.Where(x => x.FileCode.Equals(fileCode))
                        join b in _context.EDMSRepositorys on a.ReposCode equals b.ReposCode into b2
                        from b in b2.DefaultIfEmpty()
                        join c in _context.EDMSFiles on a.FileCode equals c.FileCode into c2
                        from c in c2.DefaultIfEmpty()
                        where c.Url.Equals(url)
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
                            b.PassWord,
                            c.FileCode,
                            c.IsEdit,
                            c.IsFileMaster,
                            c.FileParentId,
                            c.FileID,
                            c.ListUserView
                        }).FirstOrDefault();
            if (data != null)
            {
                return true;
            }
            else
            {
                return false;
            }
        }

        [HttpGet]
        public IActionResult Download(string fileCode, string url)
        {
            try
            {
                var data = (from a in _context.EDMSRepoCatFiles.Where(x => x.FileCode.Equals(fileCode))
                            join b in _context.EDMSRepositorys on a.ReposCode equals b.ReposCode into b2
                            from b in b2.DefaultIfEmpty()
                            join c in _context.EDMSFiles on a.FileCode equals c.FileCode into c2
                            from c in c2.DefaultIfEmpty()
                            where c.Url.Equals(url)
                            select new
                            {
                                a.Id,
                                Server = (b != null ? b.Server : null),
                                Token = (b != null ? b.Token : null),
                                Type = (b != null ? b.Type : null),
                                Url = (c != null ? c.Url : null),
                                FileId = (c != null ? c.CloudFileId : null),
                                FileTypePhysic = c.FileTypePhysic,
                                c.FileName,
                                c.MimeType,
                                b.Account,
                                b.PassWord,
                                c.FileCode,
                                c.IsEdit,
                                c.IsFileMaster,
                                c.FileParentId,
                                c.FileID,
                                c.ListUserView
                            }).FirstOrDefault();
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
                                return File(fileData, data.MimeType, string.Concat(data.FileName, data.FileTypePhysic));
                            }
                        }
                    }
                    else
                    {
                        var apiTokenService = _context.TokenManagers.FirstOrDefault(x => x.AccountCode == data.Token);
                        var json = apiTokenService.CredentialsJson;
                        var user = apiTokenService.Email;
                        var token = apiTokenService.RefreshToken;
                        var fileData = FileExtensions.DownloadFileGoogle(json, token, data.FileId, user);
                        return File(fileData, data.MimeType, string.Concat(data.FileName, data.FileTypePhysic));
                    }
                }
            }
            catch (Exception ex)
            {

            }
            return null;
        }

        [HttpPost]
        public object JtableFileWithRepository([FromBody] JtableDirectoryModel jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.CardAttachments.Where(x => x.MemberId.Equals(ESEIM.AppContext.UserName) && !x.Flag)
                        select new
                        {
                            Id = a.Id,
                            FileName = a.FileName,
                            FileCode = a.FileCode,
                            FileUrl = a.FileUrl
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "FileName", "FileCode", "FileUrl");
            return Json(jdata);
        }

        [HttpPost]
        public JsonResult GetFileEDMS(string url, string size, string timeModify, string cardCode)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.EDMSFiles.FirstOrDefault(x => !x.IsDeleted && x.Url.Equals(url)
             && (x.EditedFileTime.HasValue ? (x.EditedFileTime.Value.ToString("MM/dd/yyyy HH:mm") + ":00").Equals(timeModify) : (x.CreatedTime.Value.ToString("MM/dd/yyyy HH:mm") + ":00").Equals(timeModify)));

                if (data != null)
                {
                    var card = _context.LmsTasks.FirstOrDefault(x => x.LmsTaskCode.Equals(cardCode) && !x.IsDeleted);
                    string code = "ATTACHMENT_" + cardCode + "_" + (_context.CardAttachments.Count() > 0 ? _context.CardAttachments.Last().Id + 1 : 0);

                    int id = 0;
                    var idMapping = _context.EDMSRepoCatFiles.FirstOrDefault(x => x.FileCode.Equals(data.FileCode));
                    if (idMapping != null)
                    {
                        id = idMapping.Id;
                    }

                    var attachment = new CardAttachment
                    {
                        FileCode = code,
                        CreatedTime = DateTime.Now,
                        MemberId = ESEIM.AppContext.UserName,
                        ListPermissionViewFile = card.LmsUserList,
                        CardCode = cardCode,
                        FileName = data.FileName,
                        FileUrl = data.Url,
                        IsEdms = true,
                        IdMapping = id
                    };
                    _context.CardAttachments.Add(attachment);

                    var activity = new LmsTaskStudentAssign
                    {
                        UserId = ESEIM.AppContext.UserId,
                        IdObject = "FILE",
                        Action = "ADD",
                        IsCheck = true,
                        LmsTaskCode = cardCode,
                        CreatedTime = DateTime.Now,
                        FromDevice = "Laptop/Desktop",
                        ChangeDetails = data.FileName
                    };

                    _context.LmsTaskStudentAssigns.Add(activity);

                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizerCJ["CJ_CURD_TAB_ADD_ATTACHMENT"]);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Không có thông tin tệp tin đã chọn";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpGet]
        public object GetItemFile(int Id, bool? IsEdit, int mode, int idAttachment)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = (from a in _context.EDMSRepoCatFiles.Where(x => x.Id == Id)
                            join b in _context.EDMSRepositorys on a.ReposCode equals b.ReposCode into b2
                            from b in b2.DefaultIfEmpty()
                            join c in _context.EDMSFiles on a.FileCode equals c.FileCode into c2
                            from c in c2.DefaultIfEmpty()
                            select new
                            {
                                a.Id,
                                Server = (b != null ? b.Server : null),
                                Token = (b != null ? b.Token : null),
                                Type = (b != null ? b.Type : null),
                                Url = (c != null ? c.Url : null),
                                FileId = (c != null ? c.CloudFileId : null),
                                FileTypePhysic = c.FileTypePhysic,
                                c.FileName,
                                c.MimeType,
                                b.Account,
                                b.PassWord,
                                c.FileCode,
                                c.IsEdit,
                                c.IsFileMaster,
                                c.FileParentId,
                                c.FileID,
                                c.ListUserView
                            }).FirstOrDefault();

                var aseanDoc = new AseanDocument();
                if (data != null)
                {
                    var attachment = _context.CardAttachments.FirstOrDefault(x => !x.Flag && x.Id == idAttachment);

                    var edmsFile = _context.EDMSFiles.FirstOrDefault(x => x.FileID.Equals(data.FileID));
                    var session = HttpContext.GetSessionUser();
                    var listUserEdit = new List<string>();
                    var fileTempName = data.FileName + Path.GetExtension(data.FileName);

                    if (!string.IsNullOrEmpty(data.Server))
                    {
                        string ftphost = data.Server;
                        string ftpfilepath = data.Url;
                        var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + ftphost + ftpfilepath);
                        using (WebClient request = new WebClient())
                        {
                            request.Credentials = new NetworkCredential(data.Account, data.PassWord);
                            byte[] fileData = request.DownloadData(urlEnd);
                            JMessage msg1 = _upload.UploadFileByBytes(fileData, fileTempName, _hostingEnvironment.WebRootPath, "uploads\\files");
                            string path = msg1.Object.ToString();
                            string pathConvert = "/" + path.Replace("\\", "/");
                            attachment.FileUrl = pathConvert;
                            attachment.UpdatedTime = DateTime.Now;
                            attachment.IsEdms = false;
                            _context.CardAttachments.Update(attachment);

                            var extension = Path.GetExtension(path);
                            aseanDoc.File_Code = attachment.FileCode;
                            aseanDoc.Mode = mode;
                            aseanDoc.FirstPage = "/Admin/EDMSRepository";

                            if (extension.Equals(".doc") || extension.Equals(".docx"))
                            {
                                DocmanController.docmodel = aseanDoc;
                                DocmanController.pathFile = pathConvert;
                                DocmanController.cardCode = attachment.CardCode;
                            }
                            else if (extension.Equals(".xls") || extension.Equals(".xlsx"))
                            {
                                ExcelController.pathFileFTP = "";
                                ExcelController.docmodel = aseanDoc;
                                ExcelController.fileCode = attachment.FileCode;
                                ExcelController.pathFile = pathConvert;
                                ExcelController.cardCode = attachment.CardCode;
                            }
                            else if (extension.Equals(".pdf"))
                            {
                                PDFController.docmodel = aseanDoc;
                                PDFController.pathFile = pathConvert;
                            }
                        }
                    }
                    else
                    {
                        var apiTokenService = _context.TokenManagers.FirstOrDefault(x => x.AccountCode == data.Token);
                        var json = apiTokenService.CredentialsJson;
                        var user = apiTokenService.Email;
                        var token = apiTokenService.RefreshToken;
                        byte[] fileData = FileExtensions.DownloadFileGoogle(json, token, data.FileId, user);
                        JMessage msg1 = _upload.UploadFileByBytes(fileData, fileTempName, _hostingEnvironment.WebRootPath, "uploads\\files");
                        string path = msg1.Object.ToString();

                        attachment.FileUrl = path;
                        attachment.UpdatedTime = DateTime.Now;
                        attachment.IsEdms = false;
                        _context.CardAttachments.Update(attachment);

                        aseanDoc.File_Code = attachment.FileCode;
                        aseanDoc.File_Name = data.FileName;
                        aseanDoc.File_Type = data.FileTypePhysic;
                        aseanDoc.File_Path = path;
                        aseanDoc.IsEdit = data.IsEdit;
                        aseanDoc.IsFileMaster = data.IsFileMaster;
                        aseanDoc.FileParentId = data.FileParentId;
                        aseanDoc.Mode = mode;
                        var extension = Path.GetExtension(path);

                        if (extension.Equals(".doc") || extension.Equals(".docx"))
                        {
                            DocmanController.docmodel = aseanDoc;
                        }
                        else if (extension.Equals(".xls") || extension.Equals(".xlsx"))
                        {
                            ExcelController.docmodel = aseanDoc;
                        }
                        else if (extension.Equals(".pdf"))
                        {
                            PDFController.docmodel = aseanDoc;
                        }
                        //var apiTokenService = _context.TokenManagers.FirstOrDefault(x => x.UserId == data.Token);
                        //var json = apiTokenService.CredentialsJson;
                        //var user = apiTokenService.Description;
                        //var token = apiTokenService.TokenJson;
                        //var link = FileExtensions.OpenFileGoogle(json, token, data.FileId, user);
                        //msg.Object = new
                        //{
                        //    Type = "DRIVER",
                        //    Link = link,
                        //};
                    }
                    _context.SaveChanges();
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _stringLocalizerCJ["EDMSR_MSG_FILE_NOT_EXIST"];
                return Json(msg);
            }
            return Json(msg);
        }

        [HttpPost]
        public void ViewFileOnline([FromBody] ViewFileObj obj)
        {
            try
            {
                DocmanController.pathFile = string.Empty;
                DocmanController.pathFileFTP = string.Empty;

                ExcelController.pathFile = string.Empty;
                ExcelController.pathFileFTP = string.Empty;

                PDFController.pathFile = string.Empty;
                PDFController.pathFileFTP = string.Empty;

                var aseanDoc = new AseanDocument();
                var edms = (from a in _context.EDMSRepoCatFiles.Where(x => x.FileCode.Equals(obj.FileCode))
                            join b in _context.EDMSRepositorys on a.ReposCode equals b.ReposCode into b2
                            from b in b2.DefaultIfEmpty()
                            join c in _context.EDMSFiles on a.FileCode equals c.FileCode into c2
                            from c in c2.DefaultIfEmpty()
                            where c.Url.Equals(obj.Url)
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
                                b.PassWord,
                                c.FileCode,
                                c.IsEdit,
                                c.IsFileMaster,
                                c.FileParentId,
                                c.FileID,
                                c.ListUserView
                            }).FirstOrDefault();
                if (edms == null)
                {
                    var extension = Path.GetExtension(obj.Url);
                    aseanDoc.File_Code = obj.FileCode;
                    aseanDoc.Mode = 2;
                    aseanDoc.FirstPage = "/Admin/CardJob";

                    if (extension.Equals(".doc") || extension.Equals(".docx"))
                    {
                        DocmanController.docmodel = aseanDoc;
                        DocmanController.pathFile = obj.Url;
                        DocmanController.cardCode = obj.CardCode;
                    }
                    else if (extension.Equals(".xls") || extension.Equals(".xlsx"))
                    {
                        ExcelController.pathFileFTP = "";
                        ExcelController.docmodel = aseanDoc;
                        ExcelController.fileCode = obj.FileCode;
                        ExcelController.pathFile = obj.Url;
                        ExcelController.cardCode = obj.CardCode;
                    }
                    else if (extension.Equals(".pdf"))
                    {
                        PDFController.docmodel = aseanDoc;
                        PDFController.pathFile = obj.Url;
                    }
                }
                else
                {
                    if (!string.IsNullOrEmpty(edms.Server))
                    {
                        string ftphost = edms.Server;
                        string ftpfilepath = edms.Url;
                        var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + ftphost + ftpfilepath);
                        var fileTempName = edms.FileName + Path.GetExtension(edms.FileName);
                        using (WebClient request = new WebClient())
                        {
                            request.Credentials = new NetworkCredential(edms.Account, edms.PassWord);
                            byte[] fileData = request.DownloadData(urlEnd);
                            JMessage msg1 = _upload.UploadFileByBytes(fileData, fileTempName, _hostingEnvironment.WebRootPath, "uploads\\files");
                            string path = msg1.Object.ToString();
                            string pathConvert = "/" + path.Replace("\\", "/");

                            var extension = Path.GetExtension(path);
                            aseanDoc.Mode = 2;
                            aseanDoc.FirstPage = "/Admin/CardJob";

                            if (extension.Equals(".doc") || extension.Equals(".docx"))
                            {
                                DocmanController.docmodel = aseanDoc;
                                DocmanController.pathFile = pathConvert;
                                DocmanController.cardCode = obj.CardCode;
                            }
                            else if (extension.Equals(".xls") || extension.Equals(".xlsx"))
                            {
                                ExcelController.pathFileFTP = "";
                                ExcelController.docmodel = aseanDoc;
                                ExcelController.fileCode = obj.FileCode;
                                ExcelController.pathFile = pathConvert;
                                ExcelController.cardCode = obj.CardCode;
                            }
                            else if (extension.Equals(".pdf"))
                            {
                                PDFController.docmodel = aseanDoc;
                                PDFController.pathFile = pathConvert;
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {

            }
        }

        public class JtableDirectoryModel : JTableModel
        {
            public string ReposCode { get; set; }
            public string Folder { get; set; }
            public string ParentId { get; set; }
            public string CatCode { get; set; }
            public string FileName { get; set; }
        }

        public class IndexCardAttach
        {
            public string CardCode { get; set; }
        }

        public class ViewFileObj
        {
            public string FileCode { get; set; }
            public string Url { get; set; }
            public string CardCode { get; set; }
        }
        public class DelAttachment
        {
            public int Type { get; set; }
            public string FileCode { get; set; }
            public string CardCode { get; set; }
        }

        public class LstAttachment
        {
            public int Id { get; set; }
            public string FileName { get; set; }
            public string FileUrl { get; set; }
            public string MemberId { get; set; }
            public string FileCode { get; set; }
            public string Icon { get; set; }
            public string Color { get; set; }
            public DateTime CreatedTime { get; set; }
            public int Type { get; set; }
        }

        #endregion

        #region Obj Dependency
        public class Properties
        {
            public string Code { get; set; }
            public string Name { get; set; }
        }

        [HttpPost]
        public JsonResult GetObjDependency()
        {
            var list = new List<Properties>();
            var project = new Properties
            {
                Code = EnumHelper<ProjectEnum>.GetDisplayValue(ProjectEnum.Project),
                Name = ProjectEnum.Project.DescriptionAttr()
            };
            list.Add(project);

            var contract = new Properties
            {
                Code = EnumHelper<ContractEnum>.GetDisplayValue(ContractEnum.Contract),
                Name = ContractEnum.Contract.DescriptionAttr()
            };
            list.Add(contract);

            var Customer = new Properties
            {
                Code = EnumHelper<CustomerEnum>.GetDisplayValue(CustomerEnum.Customer),
                Name = CustomerEnum.Customer.DescriptionAttr()
            };
            list.Add(Customer);

            var Supplier = new Properties
            {
                Code = EnumHelper<SupplierEnum>.GetDisplayValue(SupplierEnum.Supplier),
                Name = SupplierEnum.Supplier.DescriptionAttr()
            };
            list.Add(Supplier);
            return Json(list);
        }

        [HttpPost]
        public JsonResult GetObjTypeJC()
        {
            var data = _context.JcObjectTypes.Where(x => !x.IsDeleted && x.ObjTypeCode != "CARD_JOB").Select(x => new { Code = x.ObjTypeCode, Name = x.ObjTypeName });
            return Json(data);
        }
        [HttpPost]
        public JsonResult GetObjFromObjType(string code)
        {
            List<ObjTemp> listTemp = new List<ObjTemp>();
            listTemp = GetListObjTemp(code);
            return Json(listTemp);
        }

        [HttpPost]
        public JsonResult InsertJcObjectIdRelative([FromBody] dynamic data)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var session = HttpContext.GetSessionUser();
                string cardCode = data.CardCode.Value;

                var checkCreated = _context.LmsTasks.Any(x => !x.IsDeleted && x.LmsTaskCode.Equals(cardCode) && x.CreatedBy.Equals(session.UserName));
                if (checkCreated || session.IsAllData)
                {
                    if (data.ListDeletedDependency.Count > 0)
                    {
                        for (int i = 0; i < data.ListDeletedDependency.Count; i++)
                        {
                            int idDeleted = data.ListDeletedDependency[i].Value != null ? Convert.ToInt32(data.ListDeletedDependency[i].Value) : 0;
                            if (idDeleted > 0)
                            {
                                var currentData = _context.JcObjectIdRelatives.FirstOrDefault(x => x.ID == idDeleted);
                                if (currentData != null)
                                {
                                    currentData.IsDeleted = true;
                                    currentData.DeletedBy = ESEIM.AppContext.UserName;
                                    currentData.DeletedTime = DateTime.Now;
                                    _context.JcObjectIdRelatives.Update(currentData);
                                }
                            }
                        }
                    }
                    if (data.ListDependency.Count > 0)
                    {
                        for (int i = 0; i < data.ListDependency.Count; i++)
                        {
                            int id = data.ListDependency[i].ID.Value != null ? Convert.ToInt32(data.ListDependency[i].ID.Value) : 0;
                            if (id < 0)
                            {
                                string code = data.ListDependency[i].ObjCode.Value;
                                var check = _context.JcObjectIdRelatives.FirstOrDefault(x => !x.IsDeleted && x.CardCode.Equals(cardCode)
                                            && x.ObjID.Equals(code));
                                if (check == null)
                                {
                                    var objRelative = new JcObjectIdRelative();
                                    decimal Weight = data.ListDependency[i].Weight.Value != null ? Convert.ToDecimal(data.ListDependency[i].Weight.Value) : 0;
                                    objRelative.Weight = Weight;
                                    objRelative.CardCode = cardCode;
                                    objRelative.ObjTypeCode = data.ListDependency[i].ObjTypeCode.Value;
                                    objRelative.ObjID = data.ListDependency[i].ObjCode.Value;
                                    objRelative.Relative = data.ListDependency[i].Relative.Value;
                                    objRelative.ItemCode = data.ListDependency[i].ItemCode.Value;
                                    objRelative.CreatedBy = ESEIM.AppContext.UserName;
                                    objRelative.CreatedTime = DateTime.Now;
                                    _context.JcObjectIdRelatives.Add(objRelative);
                                }
                            }
                        }
                    }

                    UpdateChangeCard(cardCode);

                    _context.SaveChanges();
                    //msg.Title = String.Format(_stringLocalize["COM_MSG_UPDATE_SUCCESS"), _stringLocalize[""));//"Cập nhật thành công";
                    msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Bạn không có quyền thêm mới";
                }

                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                // msg.Title = String.Format(_stringLocalize["COM_MSG_UPDATE_FAILED"), _stringLocalize[""));//"Có lỗi xảy ra!";
                return Json(msg);
            }
        }

        public class CheckWeightNumberModel
        {
            public string ObjTypeCode { get; set; }
            public string ObjID { get; set; }
            public decimal WeightNum { get; set; }
        };
        [HttpPost]
        public JsonResult CheckWeightNumber([FromBody] CheckWeightNumberModel obj)
        {
            var msg = new JMessage();

            var getSumWeightNum = _context.JcObjectIdRelatives.Where(x => x.ObjTypeCode == obj.ObjTypeCode && !x.IsDeleted && x.ObjID == obj.ObjID).Sum(x => x.Weight);
            if ((getSumWeightNum + obj.WeightNum) > 100)
            {
                msg.Error = true;
                msg.Title = _stringLocalizerCJ["CJ_MSG_MAXIMUM_WEIGHT"] + " " + (100 - getSumWeightNum) + " % !";
            }
            else
            {
                msg.Error = false;
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult DeleteJcObjectIdRelative(int ids)
        {
            var msg = new JMessage();

            var data = _context.JcObjectIdRelatives.FirstOrDefault(x => x.ID == ids && !x.IsDeleted);
            if (data != null)
            {
                data.IsDeleted = true;
                data.DeletedBy = ESEIM.AppContext.UserName;
                data.DeletedTime = DateTime.Now;
                _context.JcObjectIdRelatives.Update(data);
                msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
            }
            else
            {
                msg.Error = true;
                msg.Title = _stringLocalizerCJ["CJ_MSG_NOT_FIND_OBJECT_DELETE"];
            }
            _context.SaveChanges();
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetObjectTypeRelative(string CardCode)
        {
            List<ObjTemp> list = new List<ObjTemp>();
            list = GetListObjTemp(CardCode);
            var data = from a in _context.LmsTasks
                       join b in _context.JcObjectIdRelatives on a.LmsTaskCode equals b.CardCode into b1
                       from b2 in b1.DefaultIfEmpty()
                       where !a.IsDeleted && !b2.IsDeleted
                       select new
                       {
                           ID = b2.ID,
                           ObjID = b2.ObjID != null ? b2.ObjID : ""
                       };
            var data1 = from a in data
                        join b in list on a.ObjID equals b.Code
                        select new
                        {
                            a.ObjID,
                            b.Name
                        };
            return Json(data1);
        }

        [NonAction]
        public List<ObjTemp> GetListObjTemp(string code)
        {
            var query = _context.JcObjectTypes.FirstOrDefault(x => x.ObjTypeCode.Equals(code) && !x.IsDeleted);
            List<ObjTemp> listTemp = new List<ObjTemp>();
            using (var command = _context.Database.GetDbConnection().CreateCommand())
            {
                command.CommandText = query.ScriptSQL;
                _context.Database.OpenConnection();
                using (var result = command.ExecuteReader())
                {
                    while (result.Read())
                    {
                        if (result != null)
                        {
                            if (code == "CONTRACT_PO")
                            {
                                if (!result.IsDBNull(3) && !result.IsDBNull(4))
                                {
                                    var objTemp = new ObjTemp
                                    {
                                        Code = result.GetString(4),
                                        Name = result.GetString(3)
                                    };
                                    if (objTemp != null)
                                    {
                                        listTemp.Add(objTemp);
                                    }
                                }
                            }
                            else if (code == "NOT_WORK")
                            {
                                if (!result.IsDBNull(1) && !result.IsDBNull(8))
                                {
                                    var user = _context.Users.FirstOrDefault(x => x.Id.Equals(result.GetString(8)));
                                    var objTemp = new ObjTemp
                                    {
                                        Code = result.GetInt32(0).ToString(),
                                        Name = user != null ? user.GivenName + " báo nghỉ" : ""
                                    };
                                    if (objTemp != null)
                                    {
                                        listTemp.Add(objTemp);
                                    }
                                }
                            }
                            else
                            {
                                if (!result.IsDBNull(1) && !result.IsDBNull(2))
                                {
                                    var objTemp = new ObjTemp
                                    {
                                        Code = result.GetString(1),
                                        Name = result.GetString(2)
                                    };
                                    if (objTemp != null)
                                    {
                                        listTemp.Add(objTemp);
                                    }
                                }
                            }
                        }

                    }
                }
                _context.Database.CloseConnection();
            }
            return listTemp;
        }
        public class ObjTemp
        {
            public string Code { get; set; }
            public string Name { get; set; }
        }
        public class ObjTempRela
        {
            public int ID { get; set; }
            public string Code { get; set; }
            public string Name { get; set; }
        }
        [HttpPost]
        public JsonResult GetObjectRelative(string CardCode)
        {
            var data = (from a in _context.JcObjectTypes
                        join b in _context.JcObjectIdRelatives on a.ObjTypeCode equals b.ObjTypeCode
                        where !a.IsDeleted && !b.IsDeleted && b.CardCode == CardCode
                        select new
                        {
                            Sql = a.ScriptSQL,
                            Code = a.ObjTypeCode
                        }).DistinctBy(x => x.Code).ToList();


            List<ObjTempRela> listTemp = new List<ObjTempRela>();

            using (var command = _context.Database.GetDbConnection().CreateCommand())
            {
                _context.Database.OpenConnection();
                foreach (var item in data)
                {
                    command.CommandText = item.Sql;
                    using (var result = command.ExecuteReader())
                    {
                        while (result.Read())
                        {
                            if (result != null)
                            {
                                if (item.Code == "CONTRACT_PO")
                                {
                                    if (!result.IsDBNull(4) && !result.IsDBNull(3))
                                    {
                                        var objTemp = new ObjTempRela
                                        {
                                            ID = result.GetInt32(0),
                                            Code = result.GetString(4),
                                            Name = result.GetString(3)
                                        };
                                        if (objTemp != null)
                                        {
                                            listTemp.Add(objTemp);
                                        }
                                    }
                                }
                                else if (item.Code == "NOT_WORK")
                                {
                                    if (!result.IsDBNull(1) && !result.IsDBNull(8))
                                    {
                                        var user = _context.Users.FirstOrDefault(x => x.Id.Equals(result.GetString(8)));
                                        var objTemp = new ObjTempRela
                                        {
                                            ID = result.GetInt32(0),
                                            Code = result.GetInt32(0).ToString(),
                                            Name = user != null ? user.GivenName + " báo nghỉ" : ""
                                        };
                                        if (objTemp != null)
                                        {
                                            listTemp.Add(objTemp);
                                        }
                                    }
                                }
                                else
                                {
                                    if (!result.IsDBNull(1) && !result.IsDBNull(2))
                                    {
                                        var objTemp = new ObjTempRela
                                        {
                                            ID = result.GetInt32(0),
                                            Code = result.GetString(1),
                                            Name = result.GetString(2)
                                        };
                                        if (objTemp != null)
                                        {
                                            listTemp.Add(objTemp);
                                        }
                                    }
                                }

                            }

                        }
                    }
                }
                _context.Database.CloseConnection();
            }
            var data2 = (from a in _context.JcObjectIdRelatives
                         join b in listTemp on a.ObjID equals b.Code
                         join c in _context.JcObjectTypes on a.ObjTypeCode equals c.ObjTypeCode
                         join d in _context.CardItemChecks.Where(x => !x.Flag) on a.ItemCode equals d.ChkListCode into d1
                         from d in d1.DefaultIfEmpty()
                         where a.CardCode == CardCode && !a.IsDeleted
                         select new
                         {
                             ID = a.ID,
                             ObjName = b.Name,
                             ObjTypeName = c.ObjTypeName,
                             ObjTypeCode = c.ObjTypeCode,
                             ObjID = b.Code,
                             RelativeCode = a.Relative,
                             RelativeName = _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(a.Relative)).ValueSet,
                             Weight = a.Weight.ToString() != null ? a.Weight.ToString() : "",
                             IdObjTemp = b.ID,
                             ItemCode = d != null ? d.ChkListCode : "",
                             ItemName = d != null ? d.CheckTitle : ""
                         }).DistinctBy(x => new { x.ObjTypeCode, x.RelativeCode, x.ObjID });
            return Json(data2);
        }

        [HttpPost]
        public JsonResult DeleteCardDependency(int Id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var session = HttpContext.GetSessionUser();

                var data = _context.JcObjectIdRelatives.FirstOrDefault(x => x.ID == Id && !x.IsDeleted);
                if (data != null)
                {
                    if (session.IsAllData || data.CreatedBy.Equals(session.UserName))
                    {
                        data.IsDeleted = true;
                        data.DeletedBy = ESEIM.AppContext.UserName;
                        data.DeletedTime = DateTime.Now;
                        _context.JcObjectIdRelatives.Update(data);

                        UpdateChangeCard(data.CardCode);

                        _context.SaveChanges();
                        msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = "Bạn không có quyền xóa";
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Không tìm thấy dữ liệu";
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

        [HttpPost]
        public JsonResult GetRelative()
        {
            var data = _context.CommonSettings.Where(x => x.Group.Equals(EnumHelper<CardEnum>.GetDisplayValue(CardEnum.ObjRelative)) && x.IsDeleted == false)
                            .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return Json(data);
        }

        [NonAction]
        public string GetObjectRelativeName(string objCode, string objType)
        {
            var result = "";
            if (objType == EnumHelper<ProjectEnum>.GetDisplayValue(ProjectEnum.Project))
            {
                result = _context.Projects.FirstOrDefault(x => x.ProjectCode == objCode && !x.FlagDeleted)?.ProjectTitle;
            }
            else if (objType == EnumHelper<ContractEnum>.GetDisplayValue(ContractEnum.Contract))
            {
                result = _context.PoSaleHeaders.FirstOrDefault(x => x.ContractCode == objCode && !x.IsDeleted)?.Title;
            }
            else if (objType == EnumHelper<CustomerEnum>.GetDisplayValue(CustomerEnum.Customer))
            {
                result = _context.Customerss.FirstOrDefault(x => x.CusCode == objCode && !x.IsDeleted)?.CusName;
            }
            else if (objType == EnumHelper<SupplierEnum>.GetDisplayValue(SupplierEnum.Supplier))
            {
                result = _context.Suppliers.FirstOrDefault(x => x.SupCode == objCode && !x.IsDeleted)?.SupName;
            }
            return result;
        }

        [HttpPost]
        public JsonResult GetObjCode(string Dependency)
        {
            if (Dependency == EnumHelper<ProjectEnum>.GetDisplayValue(ProjectEnum.Project))
            {
                var project = _context.Projects.Where(x => x.FlagDeleted == false).Select(x => new { Code = x.ProjectCode, Name = x.ProjectTitle, Id = x.Id }).OrderByDescending(x => x.Id).ToList();
                return Json(project);
            }
            else if (Dependency == EnumHelper<ContractEnum>.GetDisplayValue(ContractEnum.Contract))
            {
                var contract = _context.PoSaleHeaders.Where(x => x.IsDeleted == false).Select(x => new { Code = x.ContractCode, Name = x.Title, Id = x.ContractHeaderID }).OrderByDescending(x => x.Id).ToList();
                return Json(contract);
            }
            else if (Dependency == EnumHelper<PoSupplierEnum>.GetDisplayValue(PoSupplierEnum.PoSupplier))
            {
                var contract = _context.PoBuyerHeaders.Where(x => x.IsDeleted == false).Select(x => new { Code = x.PoSupCode, Name = x.PoTitle, Id = x.Id }).OrderByDescending(x => x.Id).ToList();
                return Json(contract);
            }
            else if (Dependency == EnumHelper<CustomerEnum>.GetDisplayValue(CustomerEnum.Customer))
            {
                var customer = _context.Customerss.Where(x => x.IsDeleted == false).Select(x => new { Code = x.CusCode, Name = x.CusName, Id = x.CusID }).OrderByDescending(x => x.Id).ToList();
                return Json(customer);
            }
            else if (Dependency == EnumHelper<SupplierEnum>.GetDisplayValue(SupplierEnum.Supplier))
            {
                var supplier = _context.Suppliers.Where(x => x.IsDeleted == false).Select(x => new { Code = x.SupCode, Name = x.SupName, Id = x.SupID }).OrderByDescending(x => x.Id).ToList();
                return Json(supplier); ;
            }
            else
            {
                return Json("");
            }
        }

        [HttpPost]
        public JsonResult GetItemChk(string cardCode)
        {
            var cardItemChecks = _context.CardItemChecks
                .Where(x => !x.Flag && x.CardCode.Equals(cardCode))
                .Select(x => new { Code = x.ChkListCode, Name = x.CheckTitle });
            return Json(cardItemChecks);
        }
        #endregion

        #region Notification
        [NonAction]
        public async Task<int> SendPushNotification(IQueryable<CardMemberCustom> listUserId, string message, object data, string fromSrc, string appCode = "SMARTWORK")
        {
            if (listUserId != null && listUserId.Any())
            {
                var query = (from a in listUserId
                             join b in _context.FcmTokens on a.UserId equals b.UserId
                             join c in _context.Users on a.UserId equals c.Id
                             where c.Active == true && b.AppCode == appCode
                             select new DeviceFcm
                             {
                                 Token = b.Token,
                                 Device = b.Device,
                                 UserId = b.UserId
                             }).AsNoTracking().Select(y => new DeviceFcm { Token = y.Token, Device = y.Device, UserId = y.UserId});
                if (query.Any())
                {
                    var countToken = query.Count();
                    if (countToken > 100000)
                    {
                        int countPush = (query.Count() / 100000) + 1;
                        for (int i = 0; i < countPush; i++)
                        {
                            List<DeviceFcm> listDevices = query.Skip(i * 1000).Take(100000).AsNoTracking().ToList();

                            if (appCode == "SMARTWORK")
                            {
                                var sendNotication = await _notification.SendNotification("Thông báo", message, listDevices, data, fromSrc, ESEIM.AppContext.UserName); 
                            }
                            else if (appCode == "METALEARN")
                            {
                                var sendNotication = _notification.SendNotificationMeta("Thông báo", message, listDevices, data, fromSrc); 
                            }
                        }
                    }
                    else
                    {
                        if (appCode == "SMARTWORK")
                        {
                            var sendNotication = await _notification.SendNotification("Thông báo", message, query.ToList(), data, fromSrc, ESEIM.AppContext.UserName); 
                        }
                        else if (appCode == "METALEARN")
                        {
                            var sendNotication = _notification.SendNotificationMeta("Thông báo", message, query.ToList(), data, fromSrc); 
                        }
                    }
                }
            }
            return 1;
        }

        [HttpPost]
        public JsonResult SendNotification([FromBody] CardNotifi notifi)
        {
            var msg = new JMessage();
            try
            {
                var session = HttpContext.GetSessionUser();
                var card = _context.LmsTasks.FirstOrDefault(x => x.LmsTaskCode == notifi.CardCode && !x.IsDeleted);
                var list = _context.LmsListTasks.FirstOrDefault(x => x.ListCode == card.ListCode && !x.IsDeleted);
                var board = _context.LmsBoardTasks.FirstOrDefault(x => x.BoardCode == list.BoardCode && !x.IsDeleted);

                SendPushNotification(notifi.LstUser.AsQueryable(), string.Format("Thẻ #{0} được cập nhật bởi {1}", card.LmsTaskCode, session.FullName), new
                {
                    board.BoardCode,
                    board.BoardName,
                    list.ListCode,
                    card.LmsTaskCode,
                    card.LmsTaskName,
                    card.BeginTime,
                    card.EndTime,
                    card.Id,
                    Type = board.BoardType == "BOARD_REPEAT" ? "REPEAT" : board.BoardType == "BOARD_PROJECT" ? "PROJECT" : "BUILDING",
                    ProjectCode = "",
                    ProjectName = "",
                }, EnumHelper<FromSrcSendNotify>.GetDisplayValue(FromSrcSendNotify.FromCardJob));
                msg.Title = _stringLocalizerCJ["CJ_MSG_SEND_NOTIFI_SUCCESS"];
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }
        public class CardNotifi
        {
            public string CardCode { get; set; }
            public List<CardMemberCustom> LstUser { get; set; }
        }
        [NonAction]
        public string GetNotificationBatch()
        {
            var notifBatch = _context.CommonSettings.FirstOrDefault(x => x.CodeSet == "NOTIFICATION_CARD"
            && x.Group == "NOTIFICATION" && x.AssetCode == "CARDJOB" && !x.IsDeleted).ValueSet;
            return notifBatch;
        }

        [HttpPost]
        public JsonResult GetMemberSendNotification(string cardCode)
        {
            var listUsers = from a in _context.LmsTasks.FirstOrDefault(x => !x.IsDeleted && x.LmsTaskCode.Equals(cardCode)).ListUsers
                            join b in _context.Users.Where(x => x.Active) on a.UserId equals b.Id
                            select new
                            {
                                a.UserId,
                                b.GivenName,
                                IsCheck = true
                            };
            return Json(listUsers);
        }

        public class NotificationBatch
        {
            public string IdObject { get; set; }
            public string Action { get; set; }
            public string UserAction { get; set; }
            public DateTime CreatedTime { get; set; }
        }
        public class NotificationBatchModel
        {
            public string CardCode { get; set; }
            public List<NotificationBatch> List { get; set; }
        }
        #endregion

        #region Assign
        [HttpPost]
        public JsonResult InsertLmsTaskUserItemProgress([FromBody] LmsTaskUserItemProgress obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.LmsTaskUserItemProgresses.FirstOrDefault(x => x.User.Equals(obj.User) && x.TrainingType.Equals(obj.TrainingType)
                && x.LmsTaskCode.Equals(obj.LmsTaskCode) && !x.IsDeleted && x.ItemCode.Equals(obj.ItemCode));
                if (data == null)
                {
                    var userItemProgress = new LmsTaskUserItemProgress
                    {
                        LmsTaskCode = obj.LmsTaskCode,
                        User = obj.User,
                        ItemCode = obj.ItemCode,
                        TrainingType = obj.TrainingType,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedDate = DateTime.Now,
                        ItemTitle = obj.ItemTitle,
                        ProgressAuto = 0,
                        TeacherApproved = 0
                    };

                    _context.LmsTaskUserItemProgresses.Add(userItemProgress);

                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizerCJ["CJ_MSG_MEMBER_ADDED_ITEM"];
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
        public JsonResult DeleteLmsTaskUserProgressAllItem([FromBody] LmsTaskUserItemProgress obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var listLmsTaskItems = _context.LmsTaskUserItemProgresses.Where(x => x.User.Equals(obj.User) && x.LmsTaskCode.Equals(obj.LmsTaskCode) && !x.IsDeleted);
                if (listLmsTaskItems.Any())
                {
                    foreach (var item in listLmsTaskItems)
                    {
                        item.IsDeleted = true;
                        _context.LmsTaskUserItemProgresses.Update(item);
                    }

                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
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
        public JsonResult GetLmsItemProgressGroupByUser(string LmsTaskCode)
        {
            var data = _context.LmsTaskUserItemProgresses.Where(x => x.LmsTaskCode.Equals(LmsTaskCode) && !x.IsDeleted).GroupBy(x => x.User).Select(
                g => new
                {
                    g.Key,
                    ListItems = g.ToList()
                });
            return Json(data);
        }
        [HttpPost]
        public JsonResult UpdateUserList([FromBody] CheckData obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var item = _context.LmsTasks.FirstOrDefault(x => x.LmsTaskCode == obj.Code);
                if (item != null)
                {
                    item.LmsUserList = obj.JsonData;
                    item.UpdatedTime = DateTime.Now;
                    item.UpdatedBy = User.Identity.Name;

                    var activity = new LmsTaskStudentAssign()
                    {
                        UserId = ESEIM.AppContext.UserId,
                        Action = "UPDATE",
                        IdObject = "UPDATE_MEMBER",
                        IsCheck = true,
                        LmsTaskCode = obj.Code,
                        CreatedTime = DateTime.Now,
                        FromDevice = "Laptop/Desktop",
                        ChangeDetails = ""
                    };
                    _context.LmsTaskStudentAssigns.Add(activity);
                    UpdateChangeCard(obj.Code);
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_UPDATE_SUCCESS"]);
                    return Json(msg);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_UPDATE_FAIL"]);
                    return Json(msg);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_UPDATE_FAIL"]);
                msg.Object = ex;
                return Json(msg);
            }
        }
        [HttpPost]
        public object GetListRoleAssign()
        {

            var data = _context.CommonSettings.Where(x => x.Group == EnumHelper<CardEnum>.GetDisplayValue(CardEnum.Role)).OrderBy(x => x.Priority)
                .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return data;
        }

        [HttpPost]
        public JsonResult AssignGroupOrTeam([FromBody] Assignee data)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var session = HttpContext.GetSessionUser();

                var json = new List<JobCardAssignee>();
                var card = _context.LmsTasks.FirstOrDefault(x => !x.IsDeleted && x.LmsTaskCode.Equals(data.CardCode));
                if (card != null)
                {
                    card.LmsUserList = string.Join(",", data.LstAssign.Select(x => x.UserId));
                }
                UpdateChangeCard(card.LmsTaskCode);
                _context.SaveChanges();
                msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizerCJ["CJ_CURD_TAB_ADD_MEMBER"]);//"Thêm thành viên thành công!";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [NonAction]
        public List<UserIdModel> GetMemberInDepartment(string departmentCode)
        {
            var listUserInDepartment = from a in _context.AdDepartments.Where(x => x.DepartmentCode == departmentCode)
                                       join b in _context.Users on a.DepartmentCode equals b.DepartmentId
                                       select new UserIdModel
                                       {
                                           UserId = b.Id,
                                           GivenName = b.GivenName
                                       };
            return listUserInDepartment.ToList();
        }
        [NonAction]
        public List<UserIdModel> GetMemberInGroup(string groupCode)
        {
            var listUserInGroup = from a in _context.AdUserInGroups.Where(x => x.GroupUserCode == groupCode && !x.IsDeleted)
                                  select new UserIdModel
                                  {
                                      UserId = a.UserId,
                                  };
            return listUserInGroup.ToList();
        }

        [HttpPost]
        public JsonResult GetMemberAssign(string CardCode)
        {
            var session = HttpContext.GetSessionUser();
            var query = (from a in _context.JobCardAssignees.Where(x => !x.IsDeleted)
                         join b in _context.Users on a.UserId equals b.Id
                         join c in _context.AdDepartments.Where(x => !x.IsDeleted && x.IsEnabled) on b.DepartmentId equals c.DepartmentCode into c1
                         from c2 in c1.DefaultIfEmpty()
                         let card = _context.LmsTasks.FirstOrDefault(x => !x.IsDeleted && x.LmsTaskCode.Equals(CardCode))
                         where a.CardCode == CardCode
                         select new LstMemberAssign
                         {
                             Id = a.ID,
                             UserId = b.Id,
                             GivenName = b.GivenName,
                             Role = a.Role,
                             IsManager = false,
                             Department = !string.IsNullOrEmpty(b.DepartmentId) ? b.DepartmentId : "",
                             DepartmentName = c2 != null ? c2.Title : "",
                             Status = a.Status,
                             IsSameDepartment = false,
                             IsAccept = a.Approve.HasValue ? a.Approve.Value : false,
                             IsReject = false,
                             Approve = a.Approve.HasValue ? a.Approve.Value : false,
                             CreatedBy = a.CreatedBy,
                             IsInteract = session.IsAllData ? false : card.CreatedBy.Equals(session.UserName) ? false : true,
                             RoleSys = (from m in _context.UserRoles.Where(x => x.UserId.Equals(b.Id))
                                        join n in _context.Roles on m.RoleId equals n.Id
                                        select n).FirstOrDefault() != null ? (from m in _context.UserRoles.Where(x => x.UserId.Equals(b.Id))
                                                                              join n in _context.Roles on m.RoleId equals n.Id
                                                                              select n).FirstOrDefault().Title : "Nhân viên"
                         }).ToList();
            if (query.Any())
            {
                var check = false;
                foreach (var item in query)
                {
                    if (item.UserId.Equals(ESEIM.AppContext.UserId))
                    {
                        if (CheckManager(item.Role, item.UserId))
                        {
                            item.IsManager = true;
                            check = true;
                            break;
                        }
                    }
                }
                foreach (var item in query)
                {
                    if (check && item.UserId != session.UserId && !string.IsNullOrEmpty(session.DepartmentCode)
                        && !string.IsNullOrEmpty(item.Department) && item.Department.Equals(session.DepartmentCode))
                    {
                        item.IsSameDepartment = true;
                    }
                }
            }
            return Json(query);
        }

        [NonAction]
        private bool CheckManager(string role, string userId)
        {
            var isManager = false;
            var roleSys = _context.UserRoles.FirstOrDefault(x => x.UserId.Equals(userId));
            if (role.Equals("ROLE_LEADER_ACCEPTED") || (roleSys != null && roleSys.RoleId.Equals("49b018ad-68af-4625-91fd-2273bb5cf749")))
            {
                isManager = true;
            }
            return isManager;
        }

        [HttpGet]
        public bool CheckShowLabelAssign(string cardCode)
        {
            var isShow = false;
            var session = HttpContext.GetSessionUser();
            var data = from a in _context.JobCardAssignees.Where(x => !x.IsDeleted && x.CardCode.Equals(cardCode))
                       join b in _context.Users on a.UserId equals b.Id
                       select new
                       {
                           a.Role,
                           a.UserId,
                           b.DepartmentId,
                           a.Approve
                       };
            var roleSys = _context.UserRoles.FirstOrDefault(x => x.UserId.Equals(ESEIM.AppContext.UserId) && x.RoleId.Equals("49b018ad-68af-4625-91fd-2273bb5cf749"));
            var roleAccept = data.FirstOrDefault(x => x.UserId.Equals(ESEIM.AppContext.UserId) && x.Role.Equals("ROLE_LEADER_ACCEPTED"));

            if (roleAccept != null || roleSys != null)
            {
                foreach (var item in data)
                {
                    if (!string.IsNullOrEmpty(item.DepartmentId) && item.DepartmentId.Equals(session.DepartmentCode) && item.UserId != session.UserId)
                    {
                        if (!item.Approve.HasValue || !item.Approve.Value)
                        {
                            isShow = true;
                            break;
                        }
                    }
                }
            }
            return isShow;
        }

        [HttpPost]
        public object RoleInCardOfUser(string cardCode)
        {
            var session = HttpContext.GetSessionUser();
            var card = _context.LmsTasks.FirstOrDefault(x => !x.IsDeleted && x.Status != "TRASH" && x.LmsTaskCode == cardCode);
            var role = new RoleInCard();
            if (session.IsAllData || session.UserName == card.CreatedBy)
            {
                role = new RoleInCard
                {
                    Id = 0,
                    DepartmentId = "",
                    Responsibility = "ROLE_LEADER",
                    UserId = session.UserId,
                    Priority = 0
                };
            }
            else
            {
                var data = _context.JobCardAssignees.Where(x => !x.IsDeleted && x.CardCode.Equals(cardCode)).ToList();
                foreach (var item in data)
                {
                    if (item.UserId == session.UserId)
                    {
                        role = new RoleInCard
                        {
                            Id = 0,
                            DepartmentId = item.DepartmentCode,
                            Responsibility = item.Role,
                            UserId = item.UserId,
                            Priority = 0
                        };
                    }
                }
            }
            return role;
        }

        [NonAction]
        public bool CheckRoleCurrenUser(string cardCode, LstAssignee data)
        {
            var session = HttpContext.GetSessionUser();
            var isManager = false;

            //Check current user is Manager
            var assign = _context.JobCardAssignees.FirstOrDefault(x => !x.IsDeleted && x.UserId.Equals(session.UserId)
                && x.CardCode.Equals(cardCode) && x.Role.Equals("ROLE_LEADER_ACCEPTED"));
            if ((!string.IsNullOrEmpty(session.RoleCode) && session.RoleCode.Equals("TRUONGPHONG")) || assign != null)
            {
                var user = _context.Users.FirstOrDefault(x => x.Id.Equals(data.UserId));
                if (user != null)
                {
                    if (!string.IsNullOrEmpty(user.DepartmentId))
                    {
                        if (session.DepartmentCode.Equals(user.DepartmentId))
                        {
                            isManager = true;
                        }
                    }
                }
            }
            return isManager;
        }

        [HttpPost]
        public object GetGroupDepartmentAssign(string cardCode)
        {
            var data = _context.JobCardAssignees.Where(x => !x.IsDeleted && x.CardCode.Equals(cardCode));
            var groups = data.Where(x => !(string.IsNullOrEmpty(x.GroupCode))).DistinctBy(x => x.GroupCode);
            var department = data.Where(x => !(string.IsNullOrEmpty(x.DepartmentCode))).DistinctBy(x => x.DepartmentCode);
            var groupAssign = from a in groups
                              join b in _context.AdGroupUsers.Where(x => !x.IsDeleted && x.IsEnabled) on a.GroupCode equals b.GroupUserCode
                              join c in _context.AdOrganizations.Where(x => x.IsEnabled) on a.Branch equals c.OrgAddonCode
                              select new
                              {
                                  b.Title,
                                  c.OrgName
                              };
            var dpmAssign = from a in department
                            join b in _context.AdDepartments.Where(x => !x.IsDeleted && x.IsEnabled) on a.DepartmentCode equals b.DepartmentCode
                            join c in _context.AdOrganizations.Where(x => x.IsEnabled) on a.Branch equals c.OrgAddonCode
                            select new
                            {
                                b.Title,
                                c.OrgName
                            };
            return new
            {
                Group = groupAssign,
                Dpm = dpmAssign
            };
        }

        [HttpPost]
        public JsonResult AssignStatus(int id, string value)
        {
            var session = HttpContext.GetSessionUser();
            var msg = new JMessage();
            if (session.IsAllData)
            {
                var log = new List<JobCardAssignee>();
                var assign = _context.JobCardAssignees.FirstOrDefault(x => x.ID == id);
                if (assign != null)
                {
                    assign.Status = value;
                    log = JsonConvert.DeserializeObject<List<JobCardAssignee>>(assign.Log);
                    log.Add(assign);
                    assign.Log = JsonConvert.SerializeObject(log);
                    _context.JobCardAssignees.Update(assign);
                    _context.SaveChanges();
                    msg.Title = "Cập nhật trạng thái thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Không tìm thấy nhân viên được giao";
                }
            }
            else
            {
                msg.Error = true;
                msg.Title = _sharedResources["caption.COM_MSG_NO_PERMISSION"];
            }


            return Json(msg);
        }

        [HttpGet]
        public JsonResult GetStatusAssign()
        {
            var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals("ASSIGN_STATUS")).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return Json(data);
        }

        [HttpGet]
        public JsonResult RoleChangeStatusAssign()
        {
            var isChange = false;
            var session = HttpContext.GetSessionUser();
            if (session.IsAllData)
            {
                isChange = true;
            }
            return Json(isChange);
        }

        public class LstMemberAssign
        {
            public int Id { get; set; }
            public string UserId { get; set; }
            public string GivenName { get; set; }
            public string Role { get; set; }
            public string Department { get; set; }
            public bool IsManager { get; set; }
            public bool IsSameDepartment { get; set; }
            public bool IsAccept { get; set; }
            public bool IsReject { get; set; }
            public bool Approve { get; set; }
            public string RoleSys { get; set; }
            public string DepartmentName { get; set; }
            public string CreatedBy { get; set; }
            public bool IsInteract { get; set; }
            public string Status { get; set; }
        }
        public class Assignee
        {
            public Assignee()
            {
                LstAssign = new List<LstAssignee>();
                LstDelAssign = new List<LstDelAssign>();
            }
            public List<LstAssignee> LstAssign { get; set; }
            public List<LstDelAssign> LstDelAssign { get; set; }
            public string CardCode { get; set; }
        }
        public class LstDelAssign
        {
            public int Id { get; set; }
            public string GivenName { get; set; }
        }
        public class LstAssignee
        {
            public int Id { get; set; }
            public string UserId { get; set; }
            public string Role { get; set; }
            public string Group { get; set; }
            public string Depart { get; set; }
            public string GivenName { get; set; }
            public string CardCode { get; set; }
            public bool Approve { get; set; }
            public string Branch { get; set; }
            public string Status { get; set; }

        }
        public class UserIdModel
        {
            public string UserId { get; set; }
            public string GivenName { get; set; }
        }
        public class ModelAssign
        {
            public string UserId { get; set; }
            public string Role { get; set; }
            public string Depart { get; set; }
            public string Group { get; set; }
        }
        public class RoleInCard
        {
            public int Id { get; set; }
            public string UserId { get; set; }
            public string Responsibility { get; set; }
            public string DepartmentId { get; set; }
            public int? Priority { get; set; }
        }

        [HttpGet]
        public object GetActivityAssign(string cardCode)
        {
            var query = (from a in _context.LmsTaskStudentAssigns.Where(x => x.LmsTaskCode == cardCode)
                        .OrderByDescending(x => x.Id).Take(10)
                         join b in _context.Users on a.UserId equals b.Id
                         select new
                         {
                             a.Id,
                             a.UserId,
                             b.GivenName,
                             b.Picture,
                             a.Action,
                             a.IdObject,
                             CreatedTime = a.CreatedTime.ToString("dd/MM/yyyy HH:mm:ss"),
                             a.IsCheck,
                             a.ChangeDetails
                         });
            return Json(query);
        }

        [HttpGet]
        public object LogActivityUser(string cardCode)
        {
            var userId = ESEIM.AppContext.UserId;
            var activityExceptUser = (from a in _context.LmsTaskStudentAssigns
                                      join b in _context.Users on a.UserId equals b.Id
                                      where a.LmsTaskCode == cardCode && (a.Action == "REVIEW" || a.Action == "REJECT" || a.Action == "ACCEPT")
                                      && a.UserId != userId
                                      select new
                                      {
                                          a.Id,
                                          a.UserId,
                                          b.GivenName,
                                          b.Picture,
                                          a.Action,
                                          a.IdObject,
                                          CreatedTime = a.CreatedTime.ToString("dd/MM/yyyy HH:mm:ss"),
                                          a.IsCheck,
                                          a.ChangeDetails
                                      }).OrderByDescending(x => x.Id);
            var activityCurrentUser = (from a in _context.LmsTaskStudentAssigns
                                       join b in _context.Users on a.UserId equals b.Id
                                       where a.LmsTaskCode == cardCode && (a.Action == "REVIEW" || a.Action == "REJECT" || a.Action == "ACCEPT")
                                       && a.UserId == userId
                                       select new
                                       {
                                           a.Id,
                                           a.UserId,
                                           b.GivenName,
                                           b.Picture,
                                           a.Action,
                                           a.IdObject,
                                           CreatedTime = a.CreatedTime.ToString("dd/MM/yyyy HH:mm:ss"),
                                           a.IsCheck,
                                           a.ChangeDetails
                                       }).OrderByDescending(x => x.Id);
            var query = activityCurrentUser.Concat(activityExceptUser);

            var allActivity = (from a in _context.LmsTaskStudentAssigns
                               join b in _context.Users on a.UserId equals b.Id
                               where a.LmsTaskCode == cardCode && (a.Action == "REVIEW" || a.Action == "REJECT" || a.Action == "ACCEPT")
                               select new
                               {
                                   a.Id,
                                   a.UserId,
                                   b.GivenName,
                                   b.Picture,
                                   a.Action,
                                   a.IdObject,
                                   CreatedTime = a.CreatedTime.ToString("dd/MM/yyyy HH:mm:ss"),
                                   a.IsCheck,
                                   a.ChangeDetails
                               }).DistinctBy(x => new { x.Action, x.UserId });


            var countView = allActivity.Where(x => x.Action == "REVIEW");
            var countReject = allActivity.Where(x => x.Action == "REJECT");
            var countAccept = allActivity.Where(x => x.Action == "ACCEPT");
            return new
            {
                Log = query,
                CountView = countView.Count(),
                CountReject = countReject.Count(),
                CountAccept = countAccept.Count(),
            };
        }

        [HttpPost]
        public JsonResult GetMemberInCardJob(string cardCode)
        {
            var listUsers = from a in _context.JobCardAssignees.Where(x => !x.IsDeleted && x.CardCode.Equals(cardCode))
                            join b in _context.Users.Where(x => x.Active) on a.UserId equals b.Id
                            select new
                            {
                                a.UserId,
                                b.GivenName,
                                IsCheck = true
                            };
            return Json(listUsers);
        }


        /*
        [HttpPost]
        public JsonResult GetUserInItemWork([FromBody] JobCardUserItemMember obj)
        {
            var data = from a in _context.WorkItemAssignStaffs
                       join b in _context.Users on a.UserId equals b.Id
                       where !a.IsDeleted && a.CardCode.Equals(obj.CardCode) && a.CheckListCode.Equals(obj.CheckListCode)
                       select new
                       {
                           a.UserId,
                           b.GivenName
                       };
            return Json(data);
        }

        [HttpPost]
        public JsonResult InsertJobCardUser([FromBody] WorkItemAssignStaff obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.WorkItemAssignStaffs.FirstOrDefault(x => x.UserId.Equals(obj.UserId) && x.CardCode.Equals(obj.CardCode) && !x.IsDeleted && x.CheckListCode.Equals(obj.CheckListCode));
                if (data == null)
                {
                    var jobCardUser = new WorkItemAssignStaff
                    {
                        CardCode = obj.CardCode,
                        UserId = obj.UserId,
                        CheckItem = obj.CheckItem,
                        CheckListCode = obj.CheckListCode,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now,
                        EstimateTime = obj.EstimateTime,
                        Unit = obj.Unit
                    };

                    _context.WorkItemAssignStaffs.Add(jobCardUser);

                    UpdateChangeCard(obj.CardCode);

                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizerCJ["CJ_MSG_MEMBER_ADDED_ITEM"];
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
        public JsonResult GetJobCardUser([FromBody] JobCardUserItemMember obj)
        {
            var data = from a in _context.WorkItemAssignStaffs
                       join b in _context.Users on a.UserId equals b.Id
                       where a.CheckListCode.Equals(obj.CheckListCode) && a.CardCode.Equals(obj.CardCode) && !a.IsDeleted && (a.CheckItem == "" || a.CheckItem == null)
                       select new
                       {
                           a.ID,
                           a.UserId,
                           b.GivenName,
                           a.EstimateTime,
                           Status = _context.CommonSettings.FirstOrDefault(x => x.CodeSet == a.Unit && !x.IsDeleted).ValueSet
                       };
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetJobCardSubItemUser([FromBody] JobCardUserSubItemMember obj)
        {
            var data = (from a in _context.WorkItemAssignStaffs
                        join b in _context.Users on a.UserId equals b.Id
                        where a.CheckListCode.Equals(obj.CheckListCode) && a.CardCode.Equals(obj.CardCode) && !a.IsDeleted && a.CheckItem.Equals(obj.CheckItem)
                        select new
                        {
                            a.ID,
                            a.UserId,
                            b.GivenName,
                            a.EstimateTime,
                            Status = _context.CommonSettings.FirstOrDefault(x => x.CodeSet == a.Unit && !x.IsDeleted).ValueSet
                        }).DistinctBy(x => x.UserId);
            return Json(data);
        }
        */

        [HttpPost]
        public JsonResult InsertUserToSubItem([FromBody] WorkItemAssignStaff obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.WorkItemAssignStaffs.FirstOrDefault(x => x.UserId.Equals(obj.UserId) && x.CardCode.Equals(obj.CardCode) && !x.IsDeleted && x.CheckListCode.Equals(obj.CheckListCode) && x.CheckItem.Equals(obj.CheckItem));
                if (data == null)
                {
                    var jobCardUser = new WorkItemAssignStaff
                    {
                        CardCode = obj.CardCode,
                        UserId = obj.UserId,
                        CheckItem = obj.CheckItem,
                        CheckListCode = obj.CheckListCode,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now,
                        EstimateTime = obj.EstimateTime,
                        Unit = obj.Unit
                    };

                    _context.WorkItemAssignStaffs.Add(jobCardUser);
                    UpdateChangeCard(obj.CardCode);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizerCJ["CJ_MSG_MEMBER_EXISTED"];
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
        public JsonResult DeleteJobCardUser(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var data = _context.WorkItemAssignStaffs.FirstOrDefault(x => x.ID == id);
            if (data != null)
            {
                var isEmpInSubItem = _context.WorkItemAssignStaffs.Where(x => x.CardCode == data.CardCode && x.CheckItem != "" && x.CheckListCode == data.CheckListCode && x.UserId == data.UserId && !x.IsDeleted).ToList();
                if (data.CheckItem != "")
                {
                    data.IsDeleted = true;
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    _context.WorkItemAssignStaffs.Update(data);
                    UpdateChangeCard(data.CardCode);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
                }
                else if (data.CheckItem == "" && isEmpInSubItem.Count == 0)
                {
                    data.IsDeleted = true;
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    _context.WorkItemAssignStaffs.Update(data);
                    UpdateChangeCard(data.CardCode);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizerCJ["CJ_MSG_MEMBER_ADDED_ITEM"];
                }

            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetUnitAssignStaff()
        {
            var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "UNIT_ASSIGN_STAFF").Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return Json(data);
        }
        #endregion

        #region Check success
        [HttpPost]
        public bool CheckCardSuccess(string cardCode)
        {
            var listCardItem = _context.CardItemChecks.Where(x => x.CardCode == cardCode && !x.Flag).ToList();
            //var listSession = from a in _context.WORKItemSessions.Where(x => x.CardCode == cardCode && !x.IsDeleted)
            //                  join b in _context.WORKItemSessionResults.Where(x => !x.IsDeleted) on a.WorkSession equals b.WorkSession
            //                  select new
            //                  {
            //                      Progress = b.ProgressFromLeader
            //                  };
            bool check = false;

            if (listCardItem.Count > 0)
            {
                foreach (var cardItem in listCardItem)
                {
                    if (cardItem.Completed == 100)
                    {
                        check = true;
                    }
                    else
                    {
                        check = false;
                        break;
                    }

                }
                //if (listSession.Count > 0 && check == true)
                //{
                //    foreach (var session in listSession)
                //    {
                //        if (session.Progress == 100)
                //        {
                //            check = true;

                //        }
                //        else
                //        {
                //            check = false;
                //            break;
                //        }
                //    }
                //}
                //else
                //{
                //    check = false;
                //}
            }
            else
            {
                check = false;
            }
            return check;
        }

        public class CheckListSuccess
        {
            public string ListCode { get; set; }
            public bool IsSuccess { get; set; }
        }
        #endregion

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            try
            {
                var resourceObject = new JObject();
                var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                    .Union(_stringLocalizerCJ.GetAllStrings().Select(x => new { x.Name, x.Value }))
                    .Union(_stringLocalizerProject.GetAllStrings().Select(x => new { x.Name, x.Value }))
                    .Union(_stringLocalizerTMC.GetAllStrings().Select(x => new { x.Name, x.Value }))
                    .Union(_stringLocalizerCustomer.GetAllStrings().Select(x => new { x.Name, x.Value }))
                    .Union(_stringLocalizerSupplier.GetAllStrings().Select(x => new { x.Name, x.Value }))
                    .Union(_stringLocalizerContract.GetAllStrings().Select(x => new { x.Name, x.Value }))
                    .Union(_stringLocalizerRQWPrice.GetAllStrings().Select(x => new { x.Name, x.Value }))
                    .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }))
                    .Union(_stringLocalizerContractPO.GetAllStrings().Select(x => new { x.Name, x.Value }))
                    .Union(_stringLocalizerRQRaw.GetAllStrings().Select(x => new { x.Name, x.Value }))
                    .Union(_stringLocalizerSVC.GetAllStrings().Select(x => new { x.Name, x.Value }))
                    .Union(_stringLocalizerMaterialProd.GetAllStrings().Select(x => new { x.Name, x.Value }))
                    .Union(_stringLocalizerEDMSFile.GetAllStrings().Select(x => new { x.Name, x.Value }))
                    .Union(_staffTimeKeepingController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                    .Union(_stringLocalizerLms.GetAllStrings().Select(x => new { x.Name, x.Value }))
                    .DistinctBy(x => x.Name)
                    ;
                foreach (var item in query)
                {
                    resourceObject.Add(item.Name, item.Value);
                }
                return Ok(resourceObject);
            }
            catch (Exception ex)
            {
                return Ok("");
            }
        }
        #endregion

        #region Location
        public class AddressJobCarModel
        {
            public string CardCode { get; set; }
            public string LocationText { get; set; }
            public string LocationGps { get; set; }
        }
        [HttpPost]
        public JsonResult InsertAddressJobCard([FromBody] AddressJobCarModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                WORKOSAddressCard insertAddress = new WORKOSAddressCard
                {
                    CardCode = obj.CardCode,
                    LocationText = obj.LocationText,
                    LocationGps = obj.LocationGps,
                    CreatedBy = ESEIM.AppContext.UserName,
                    CreatedTime = DateTime.Now
                };
                var activity = new LmsTaskStudentAssign
                {
                    UserId = ESEIM.AppContext.UserId,
                    IdObject = "ADDR",
                    Action = "ADD",
                    IsCheck = true,
                    LmsTaskCode = obj.CardCode,
                    CreatedTime = DateTime.Now,
                    FromDevice = "Laptop/Desktop",
                    ChangeDetails = obj.LocationText
                };

                _context.LmsTaskStudentAssigns.Add(activity);
                _context.WORKOSAddressCards.Add(insertAddress);

                UpdateChangeCard(obj.CardCode);

                _context.SaveChanges();
                msg.Title = _stringLocalizerCJ["CJ_MSG_ADD_ADDRESS_SUCCESS"];
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Object = ex.Message;
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult DeleteAddressJobCard(int Id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.WORKOSAddressCards.FirstOrDefault(x => x.Id == Id);
                data.IsDeleted = true;
                data.DeletedBy = ESEIM.AppContext.UserName;
                data.DeletedTime = DateTime.Now;

                var activity = new LmsTaskStudentAssign
                {
                    UserId = ESEIM.AppContext.UserId,
                    IdObject = "ADDR",
                    Action = "DELETE",
                    IsCheck = true,
                    LmsTaskCode = data.CardCode,
                    CreatedTime = DateTime.Now,
                    FromDevice = "Laptop/Desktop",
                    ChangeDetails = data.LocationText
                };
                _context.LmsTaskStudentAssigns.Add(activity);
                _context.WORKOSAddressCards.Update(data);
                UpdateChangeCard(data.CardCode);
                _context.SaveChanges();
                msg.Title = _stringLocalizerCJ["CJ_MSG_DELETE_ADDRESS_SUCCESS"];

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Object = ex.Message;
            }
            return Json(msg);
        }
        [HttpPost]
        public object GetLisAddressJobCard(string CardCode)
        {
            var query = _context.WORKOSAddressCards.Where(x => x.CardCode.Equals(CardCode) && x.IsDeleted == false)
                .Select(x => new RollbackAddress
                {
                    Id = x.Id,
                    LocationGps = x.LocationGps,
                    LocationText = x.LocationText,
                    CreatedBy = x.CreatedBy,
                    CreatedTime = x.CreatedTime
                }).ToList();

            return Json(query);
        }
        #endregion

        #region Count card
        //Grid card
        [HttpPost]
        public JsonResult GetCountCard([FromBody] AdvanceSearchObj data)
        {
            var countCard = new CountCard();
            if (data.TabBoard == 1)
            {
                countCard = GetCountBoard(data);
            }
            else if (data.TabBoard == 3)
            {
                countCard = GetCountCardUser(data);
            }
            return Json(countCard);
        }

        [NonAction]
        public CountCard GetCountBoard(AdvanceSearchObj dataSearch)
        {
            var session = HttpContext.GetSessionUser();
            var user = _context.Users.FirstOrDefault(x => x.Active && x.UserName == ESEIM.AppContext.UserName);
            var fromDate = string.IsNullOrEmpty(dataSearch.FromDate) ? (DateTime?)null : DateTime.ParseExact(dataSearch.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var toDate = string.IsNullOrEmpty(dataSearch.ToDate) ? (DateTime?)null : DateTime.ParseExact(dataSearch.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var fromDatePara = fromDate.HasValue ? fromDate.Value.ToString("yyyy-MM-dd") : "";
            var toDatePara = toDate.HasValue ? toDate.Value.ToString("yyyy-MM-dd") : "";
            var listUserOfBranch = "";
            if (session.IsBranch)
            {
                if (session.ListUserOfBranch.Any())
                {
                    listUserOfBranch = string.Join(",", session.ListUserOfBranch);
                }
            }
            if (!string.IsNullOrEmpty(dataSearch.BoardCode))
            {
                string[] param = new string[] { "@PageNo", "@PageSize", "@fromDate", "@toDate", "@IsAllData", "@IsUser", "@IsBranch",
                "@DepartmentId", "@UserName", "@ListUserOfBranch", "@boardCode", "@UserId", "@BranchId", "@Status", "@Object", "@ObjType", "@CardName", "@WorkflowInstCode" };
                object[] val = new object[] { dataSearch.CurrentPage, dataSearch.Length , fromDatePara, toDatePara , session.IsAllData, session.IsUser,
                    session.IsBranch, !string.IsNullOrEmpty(user.DepartmentId) ? user.DepartmentId : "", session.UserName, listUserOfBranch,
                    !string.IsNullOrEmpty(dataSearch.BoardCode) ? dataSearch.BoardCode : "",session.UserId,  !string.IsNullOrEmpty(user.BranchId) ? user.BranchId : "",
                    dataSearch.Status, !string.IsNullOrEmpty(dataSearch.Object) ? dataSearch.Object : "",
                    !string.IsNullOrEmpty(dataSearch.ObjType) ? dataSearch.ObjType : "", dataSearch.CardName, !string.IsNullOrEmpty(dataSearch.WorkflowInstCode) ? dataSearch.WorkflowInstCode : ""};
                DataTable rs = _repositoryService.GetDataTableProcedureSql("P_GET_COUNT_LMS_TASK_BOARD", param, val);
                var query = CommonUtil.ConvertDataTable<CountCard>(rs);
                if (query.Count > 0)
                    return query[0];
                else
                {
                    var data = new CountCard
                    {
                        Cancle = 0,
                        CloseStatus = 0,
                        CountAll = 0,
                        Created = 0,
                        Start = 0,
                        Success = 0,
                        Trash = 0
                    };
                    return data;
                }
            }
            else
            {
                string[] param = new string[] { "@PageNo", "@PageSize", "@fromDate", "@toDate", "@IsAllData", "@IsUser", "@IsBranch","@UserName", "@ListUserOfBranch",
                 "@DepartmentId", "@BoardSearch", "@UserId", "@BranchId", "@Status", "@CardName", "@ListCode", "@Group", "@Project", "@Customer", "@Supplier", "@Contract",
                "@UserIdSearch", "@UserNameSearch", "@DepartmentSearch"};
                object[] val = new object[] { dataSearch.CurrentPage, dataSearch.Length , fromDatePara, toDatePara , session.IsAllData, session.IsUser,
                  session.IsBranch, session.UserName, listUserOfBranch, !string.IsNullOrEmpty(session.DepartmentCode) ? session.DepartmentCode : "",!string.IsNullOrEmpty(dataSearch.BoardSearch) ? dataSearch.BoardSearch : "", session.UserId,
                  dataSearch.BranchId, dataSearch.Status, dataSearch.CardName, !string.IsNullOrEmpty(dataSearch.ListCode) ? dataSearch.ListCode : "",
                    !string.IsNullOrEmpty(dataSearch.Group) ? dataSearch.Group : "", !string.IsNullOrEmpty(dataSearch.Project) ? dataSearch.Project : "",
                    !string.IsNullOrEmpty(dataSearch.Customer)? dataSearch.Customer : "", !string.IsNullOrEmpty(dataSearch.Supplier) ? dataSearch.Supplier : "",
                    !string.IsNullOrEmpty(dataSearch.Contract) ? dataSearch.Contract : "", !string.IsNullOrEmpty(dataSearch.UserId) ? dataSearch.UserId : "",
                    !string.IsNullOrEmpty(dataSearch.UserName) ? dataSearch.UserName : "", !string.IsNullOrEmpty(dataSearch.Department) ? dataSearch.Department: ""};
                DataTable rs = _repositoryService.GetDataTableProcedureSql("P_GET_COUNT_LMS_TASK_ADVANTAGE", param, val);
                var query = CommonUtil.ConvertDataTable<CountCard>(rs);
                if (query.Count > 0)
                    return query[0];
                else
                {
                    var data = new CountCard
                    {
                        Cancle = 0,
                        CloseStatus = 0,
                        CountAll = 0,
                        Created = 0,
                        Start = 0,
                        Success = 0,
                        Trash = 0
                    };
                    return data;
                }
            }
        }

        [NonAction]
        public CountCard GetCountCardUser(AdvanceSearchObj dataSearch)
        {
            var query = new CountCard();
            if (dataSearch.ListObjCode.Any())
            {
                query = GetCountCardInUser(dataSearch);
            }
            else
            {
                query = GetCountCardOutUser(dataSearch);
            }
            return query;
        }

        [NonAction]
        public CountCard GetCountCardInUser(AdvanceSearchObj dataSearch)
        {
            var session = HttpContext.GetSessionUser();
            var user = _context.Users.FirstOrDefault(x => x.Active && x.UserName == ESEIM.AppContext.UserName);
            var fromDate = string.IsNullOrEmpty(dataSearch.FromDate) ? (DateTime?)null : DateTime.ParseExact(dataSearch.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var toDate = string.IsNullOrEmpty(dataSearch.ToDate) ? (DateTime?)null : DateTime.ParseExact(dataSearch.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);

            var fromDatePara = fromDate.HasValue ? fromDate.Value.ToString("yyyy-MM-dd") : "";
            var toDatePara = toDate.HasValue ? toDate.Value.ToString("yyyy-MM-dd") : "";
            var listUserOfBranch = "";
            if (session.IsBranch)
            {
                if (session.ListUserOfBranch.Any())
                {
                    listUserOfBranch = string.Join(",", session.ListUserOfBranch);
                }
            }
            var listObjCode = "";
            if (dataSearch.ListObjCode.Any())
            {
                listObjCode = string.Join(",", dataSearch.ListObjCode.Select(x => x.Code));
            }

            string[] param = new string[] { "@PageNo", "@PageSize", "@fromDate", "@toDate", "@IsAllData", "@IsUser", "@IsBranch",
                "@DepartmentId", "@UserName", "@ListUserOfBranch", "@boardCode", "@UserId", "@BranchId", "@Status", "@Object",
                "@ObjType", "@listObjCode", "@CardName", "@WorkflowInstCode" };
            object[] val = new object[] { dataSearch.CurrentPage, dataSearch.Length , fromDatePara, toDatePara , session.IsAllData, session.IsUser,
                session.IsBranch, !string.IsNullOrEmpty(user.DepartmentId) ? user.DepartmentId : "", session.UserName, listUserOfBranch,
                !string.IsNullOrEmpty(dataSearch.BoardCode) ? dataSearch.BoardCode : "",session.UserId,  !string.IsNullOrEmpty(user.BranchId) ? user.BranchId : "",
                dataSearch.Status, dataSearch.Object, dataSearch.ObjType, listObjCode, dataSearch.CardName, !string.IsNullOrEmpty(dataSearch.WorkflowInstCode) ? dataSearch.WorkflowInstCode : ""};
            DataTable rs = _repositoryService.GetDataTableProcedureSql("P_GET_COUNT_CARD_IN_USER", param, val);
            var query = CommonUtil.ConvertDataTable<CountCard>(rs);
            if (query.Count > 0)
                return query[0];
            else
            {
                var data = new CountCard
                {
                    Cancle = 0,
                    CloseStatus = 0,
                    CountAll = 0,
                    Created = 0,
                    Start = 0,
                    Success = 0,
                    Trash = 0
                };
                return data;
            }
        }

        [NonAction]
        public CountCard GetCountCardOutUser(AdvanceSearchObj dataSearch)
        {
            //var fromDate = string.IsNullOrEmpty(dataSearch.FromDate) ? (DateTime?)null : DateTime.ParseExact(dataSearch.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            //var toDate = string.IsNullOrEmpty(dataSearch.ToDate) ? (DateTime?)null : DateTime.ParseExact(dataSearch.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            //var session = HttpContext.GetSessionUser();
            //var user = _context.Users.FirstOrDefault(x => x.Active && x.UserName == ESEIM.AppContext.UserName);

            //var fromDatePara = fromDate.HasValue ? fromDate.Value.ToString("yyyy-MM-dd") : "";
            //var toDatePara = toDate.HasValue ? toDate.Value.ToString("yyyy-MM-dd") : "";
            //var listUserOfBranch = "";
            //if (session.IsBranch)
            //{
            //    if (session.ListUserOfBranch.Any())
            //    {
            //        listUserOfBranch = string.Join(",", session.ListUserOfBranch);
            //    }
            //}
            //string[] param = new string[] { "@PageNo", "@PageSize", "@fromDate", "@toDate", "@IsAllData", "@IsUser", "@IsBranch",
            //    "@DepartmentId", "@UserName", "@ListUserOfBranch", "@boardCode", "@UserId", "@BranchId", "@Status", "@Object", "@ObjType", "@CardName" };
            //object[] val = new object[] { dataSearch.CurrentPage, dataSearch.Length , fromDatePara, toDatePara , session.IsAllData, session.IsUser,
            //    session.IsBranch, !string.IsNullOrEmpty(user.DepartmentId) ? user.DepartmentId : "", session.UserName, listUserOfBranch,
            //    !string.IsNullOrEmpty(dataSearch.BoardCode) ? dataSearch.BoardCode : "",session.UserId,  !string.IsNullOrEmpty(user.BranchId) ? user.BranchId : "",
            //    dataSearch.Status, !string.IsNullOrEmpty(dataSearch.Object) ? dataSearch.Object : "", !string.IsNullOrEmpty(dataSearch.ObjType) ? dataSearch.ObjType : "", dataSearch.CardName};
            //DataTable rs = _repositoryService.GetDataTableProcedureSql("P_GET_COUNT_CARD_OUT_USER", param, val);
            //var query = CommonUtil.ConvertDataTable<CountCard>(rs);
            //if (query.Count > 0)
            //    return query[0];
            //else
            //{
            //    var data = new CountCard
            //    {
            //        Cancle = 0,
            //        CloseStatus = 0,
            //        CountAll = 0,
            //        Created = 0,
            //        Start = 0,
            //        Success = 0,
            //        Trash = 0
            //    };
            //    return data;
            //}
            var data = new CountCard
            {
                Cancle = 0,
                CloseStatus = 0,
                CountAll = 0,
                Created = 0,
                Start = 0,
                Success = 0,
                Trash = 0
            };
            return data;
        }

        public class CountCard
        {
            public int Created { get; set; }
            public int Start { get; set; }
            public int Success { get; set; }
            public int Cancle { get; set; }
            public int Trash { get; set; }
            public int CloseStatus { get; set; }
            public int CountAll { get; set; }
        }

        #endregion

        #region Jobcard data logger

        [HttpPost]
        public JsonResult InsertDataLogger([FromBody] List<JobcardDataLogger> listData)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                if (listData.Count > 0)
                {
                    var commonSettings = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.CardDataLogger));
                    var date = DateTime.Now.ToString("ddMMyyyy_hhmmss");

                    var cardCode = "";

                    var isAllValueNull = true;
                    foreach (var item in listData)
                    {
                        if (!string.IsNullOrEmpty(item.DtValue))
                        {
                            isAllValueNull = false;
                            break;
                        }
                    }

                    if (isAllValueNull)
                    {
                        msg.Error = true;
                        msg.Title = "Vui lòng nhập giá trị";
                        return Json(msg);
                    }

                    foreach (var item in listData.Where(x => !string.IsNullOrEmpty(x.DtValue)))
                    {
                        var dataLog = new JobcardDataLogger
                        {
                            DtUnit = item.DtUnit,
                            DtValueType = commonSettings.FirstOrDefault(p => p.CodeSet.Equals(item.DtValueType)) != null ? commonSettings.FirstOrDefault(p => p.CodeSet.Equals(item.DtValueType)).ValueSet : null,
                            DtGroup = item.DtGroup,
                            SessionId = string.Format("{0}_{1}", date, User.Identity.Name),
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now,
                            WfInstCode = "",
                            JobcardCode = item.JobcardCode,
                            ItemList = item.ItemList,
                            ActInstCode = "",
                            DtCode = item.DtCode,
                            DtTitle = item.DtTitle,
                            DtValue = item.DtValue,
                            ShiftCode = item.ShiftCode,
                            Flag = false
                        };
                        _context.JobcardDataLoggers.Add(dataLog);
                        cardCode = item.JobcardCode;
                    }
                    //Realtime card
                    UpdateChangeCard(cardCode);

                    _context.SaveChanges();
                    msg.Title = "Thêm thành công";
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
        public JsonResult DeleteDataLogger(string sessionId)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var session = HttpContext.GetSessionUser();
                var dataLoggers = _context.JobcardDataLoggers.Where(x => !x.Flag && x.SessionId.Equals(sessionId)).ToList();
                if (dataLoggers.Count > 0)
                {
                    if (dataLoggers[0].CreatedBy.Equals(session.UserName) || session.IsAllData)
                    {
                        dataLoggers.ForEach(x => x.Flag = true);
                        _context.JobcardDataLoggers.UpdateRange(dataLoggers);
                        //Realtime card
                        UpdateChangeCard(dataLoggers[0].JobcardCode);
                        _context.SaveChanges();
                        msg.Title = "Xóa thành công";
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = "Bạn không có quyền xóa";
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
        public JsonResult GetUnitAttr()
        {
            var data = _context.CommonSettings.Where(x => !x.IsDeleted
            && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.AttrUnit))
            .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetAttrDataType()
        {
            var data = _context.CommonSettings.Where(x => !x.IsDeleted
            && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.AttrDataType))
            .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return Json(data);
        }
        [HttpPost]
        public JsonResult GetAttrGroup(string cardCode)
        {
            var group = _context.CommonSettings.Where(x => !x.IsDeleted
                        && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.CardDataLogger)))
                .Select(x => new AttrGroupModel
                {
                    Code = x.CodeSet,
                    Name = x.ValueSet,
                    Count = 0
                }).ToList();


            var groupSession = _context.JobcardDataLoggers
                .Where(x => !x.Flag && x.JobcardCode == cardCode)
                .GroupBy(x => x.SessionId).Select(p => new SessionLogger
                {
                    SessionId = p.Key,
                    Color = "",
                    Index = 0
                }).ToList();

            foreach (var item in group)
            {
                item.Count = GetCountSession(cardCode, groupSession, item.Code);
            }
            return Json(group);
        }
        [NonAction]
        private int GetCountSession(string cardCode, List<SessionLogger> groupSession, string groupCode)
        {
            var data = (from a in _context.JobcardDataLoggers.Where(x => !x.Flag
                            && x.JobcardCode.Equals(cardCode) && x.DtGroup.Equals(groupCode)
                            && x.CreatedTime.Date == DateTime.Now.Date)
                        join b in _context.ShiftLogs on a.ShiftCode equals b.ShiftCode into b1
                        from b in b1.DefaultIfEmpty()
                        join c in _context.Users on a.CreatedBy equals c.UserName
                        join d in groupSession on a.SessionId equals d.SessionId
                        orderby d.Index
                        select new DataLoggerCardModel
                        {
                            ID = a.ID,
                            SessionId = a.SessionId,
                        }).GroupBy(x => x.SessionId);
            return data.Count();
        }

        public class AttrGroupModel
        {
            public string Code { get; set; }
            public string Name { get; set; }
            public int Count { get; set; }
        }

        [HttpPost]
        public JsonResult GetAttrByGroup(string attrGroup)
        {
            var data = _context.AttrSetups.Where(x => !x.IsDeleted &&
                                                           x.AttrGroup.Equals(attrGroup))
                                              .Select(p => new
                                              {
                                                  Code = p.AttrCode,
                                                  p.AttrGroup,
                                                  p.AttrName,
                                                  p.Note,
                                                  p.AttrDataType,
                                                  p.AttrUnit
                                              });

            var dataRs = (from a in data
                          join b in _context.CommonSettings.Where(x => !x.IsDeleted) on a.AttrUnit equals b.CodeSet into b1
                          from b2 in b1.DefaultIfEmpty()
                          join c in _context.CommonSettings.Where(x => !x.IsDeleted) on a.AttrDataType equals c.CodeSet into c1
                          from c2 in c1.DefaultIfEmpty()
                          join d in _context.CommonSettings.Where(x => !x.IsDeleted) on a.AttrGroup equals d.CodeSet into d1
                          from d2 in d1.DefaultIfEmpty()
                              //join e in _context.ActivityAttrSetups.Where(x => !x.IsDeleted && x.PaperTypeCode.Equals(attrGroup) && x.ProfileCode.Equals(profileCode)) on a.Code equals e.AttrCode into e1
                              //from e in e1.DefaultIfEmpty()
                          let user = _context.Users.FirstOrDefault(x => x.Active && x.UserName.Equals(User.Identity.Name))
                          select new
                          {
                              ID = 0,
                              a.Code,
                              Name = a.AttrName,
                              Unit = b2 != null ? b2.ValueSet : "",
                              Type = c2 != null ? c2.ValueSet : "",
                              Group = d2 != null ? d2.ValueSet : "",
                              DtGroup = d2 != null ? d2.CodeSet : "",
                              //Value = e != null ? e.AttrValue : "",
                              a.Note,
                              CreatedBy = user != null ? user.GivenName : "",
                              CreatedTime = DateTime.Now.ToString("HH:mm dd/MM/yyyy"),
                          }).ToList();

            return Json(dataRs);
        }

        [HttpPost]
        public JsonResult GetDataLoggerCard(string cardCode)
        {
            var groupSession = _context.JobcardDataLoggers.Where(x => !x.Flag && x.JobcardCode == cardCode).GroupBy(x => x.SessionId).Select(p => new
            SessionLogger
            {
                SessionId = p.Key,
                Color = "",
                Index = 0
            }).ToList();

            var index = 1;
            foreach (var item in groupSession)
            {
                item.Index = index;
                item.Color = index % 2 == 0 ? "" : "#f1f5f7";
                index++;
            }

            var data = (from a in _context.JobcardDataLoggers.Where(x => !x.Flag && x.JobcardCode == cardCode)
                        join b in _context.ShiftLogs on a.ShiftCode equals b.ShiftCode into b1
                        from b in b1.DefaultIfEmpty()
                        join c in _context.Users on a.CreatedBy equals c.UserName
                        join d in groupSession on a.SessionId equals d.SessionId
                        orderby d.Index
                        select new DataLoggerCardModel
                        {
                            ID = a.ID,
                            Code = a.DtCode,
                            Title = a.DtTitle,
                            Value = a.DtValue,
                            Unit = !string.IsNullOrEmpty(a.DtUnit) ? a.DtUnit : "",
                            CreatedBy = c.GivenName,
                            CreatedTime = a.CreatedTime.ToString("HH:mm dd/MM/yyyy"),
                            ItemList = new List<JsonItemList>(),
                            Shift = b != null ? ((b.ChkinTime.HasValue ? b.ChkinTime.Value.ToString("HH:mm dd/MM/yyyy") : "") + " - " + (b.ChkoutTime.HasValue ? b.ChkoutTime.Value.ToString("HH:mm dd/MM/yyy") : "")) : "",
                            DataTypeAttr = a.DtValueType,
                            SessionId = a.SessionId,
                            Color = d.Color,
                            ItemListLog = a.ItemList,
                            Group = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(a.DtGroup)).ValueSet ?? ""
                        }).OrderByDescending(x => x.ID).GroupBy(x => x.SessionId).ToList();
            return Json(data);
        }

        public class DataLoggerCardModel
        {
            public int ID { get; set; }
            public string Code { get; set; }
            public string Title { get; set; }
            public string Value { get; set; }
            public string Unit { get; set; }
            public string CreatedBy { get; set; }
            public string CreatedTime { get; set; }
            public List<JsonItemList> ItemList { get; set; }
            public string Shift { get; set; }
            public string DataTypeAttr { get; set; }
            public FileAttr FileAttr { get; set; }
            public string SessionId { get; set; }
            public string Color { get; set; }
            public string ItemListLog { get; set; }
            public string Group { get; set; }
        }
        public class JsonItemList
        {
            public string Code { get; set; }
            public string Title { get; set; }
        }
        public class FileAttr
        {
            public string FileName { get; set; }
            public string FileUrl { get; set; }
            public string CardCode { get; set; }
        }
        public class SessionLogger
        {
            public string Color { get; set; }
            public string SessionId { get; set; }
            public int Index { get; set; }
        }
        #endregion

        #region Create card auto
        [HttpPost]
        public JsonResult InsertCardAuto()
        {
            var msg = new JMessage();
            try
            {
                var maxIdCard = GetMaxIdCard() + 1;
                var user = _context.Users.FirstOrDefault(x => x.Active && x.UserName == ESEIM.AppContext.UserName);
                var rnd = new Random();
                var projects = GetProject();
                var boards = GetBoard();
                for (var i = 0; i < 100000; i++)
                {
                    var idxBoard = rnd.Next(boards.Count() - 1);
                    var boardCode = boards[idxBoard].BoardCode;

                    var lists = GetList(boardCode);
                    var idxList = rnd.Next(lists.Count() - 1);
                    var listCode = lists[idxList].ListCode;

                    //Insert card and attr
                    var card = new LmsTask
                    {
                        LmsTaskName = "" + maxIdCard,
                        LmsTaskCode = "" + maxIdCard,
                        ListCode = listCode,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedDate = DateTime.Now,
                        Status = "CREATED",
                        BeginTime = DateTime.Now,
                        Description = ""
                    };
                    _context.LmsTasks.Add(card);
                    var comment = new LmsTaskCommentList()
                    {
                        LmsTaskCode = card.LmsTaskCode,
                        CmtId = "Comment" + Guid.NewGuid().ToString(),
                        CmtContent = "Đã tạo công việc",
                        MemberId = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now
                    };
                    _context.LmsTaskCommentLists.Add(comment);
                    //Leader
                    var json = new List<JobCardAssignee>();
                    var assignee = new JobCardAssignee
                    {
                        CardCode = card.LmsTaskCode,
                        UserId = ESEIM.AppContext.UserId,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now,
                        Role = "ROLE_LEADER",
                        DepartmentCode = "",
                        GroupCode = "",
                        Item = "",
                        Approve = true,
                        ApproveTime = DateTime.Now
                    };
                    card.LmsUserList += ESEIM.AppContext.UserId + ",";
                    json.Add(assignee);

                    _context.JobCardAssignees.Add(assignee);


                    var idxProj = rnd.Next(projects.Count());
                    var project = projects[idxProj];
                    var rela = new JcObjectIdRelative
                    {
                        CardCode = card.LmsTaskCode,
                        ObjTypeCode = "PROJECT",
                        ObjID = project.ProjectCode,
                        Relative = "MAIN",
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now,
                        Weight = 0
                    };
                    _context.JcObjectIdRelatives.Add(rela);
                    maxIdCard++;
                }
                _context.SaveChanges();
                msg.Title = "Thêm thành công";
            }
            catch (Exception ex)
            {

                throw;
            }
            return Json(msg);
        }
        [NonAction]
        private List<LmsBoardTask> GetBoard()
        {
            var boards = _context.LmsBoardTasks.Where(x => !x.IsDeleted).ToList();
            return boards;
        }
        [NonAction]
        private List<LmsListTask> GetList(string boardCode)
        {
            var lists = _context.LmsListTasks.Where(x => !x.IsDeleted && x.BoardCode.Equals(boardCode)).ToList();
            return lists;
        }
        [NonAction]
        private int GetMaxIdCard()
        {
            int maxID = 0;
            var card = _context.LmsTasks.Where(x => !x.IsDeleted);
            if (card.Any())
            {
                maxID = card.MaxBy(x => x.Id).Id;
            }
            return maxID;
        }

        [NonAction]
        private List<Project> GetProject()
        {
            var projects = _context.Projects.Where(x => !x.FlagDeleted).ToList();
            return projects;
        }
        #endregion

        #region Share file

        [HttpPost]
        public JsonResult GetObjFileShare()
        {
            var data = new List<ObjFileShare>();
            var contract = new ObjFileShare
            {
                Code = "CONTRACT",
                Name = "Hợp đồng bán"
            };
            data.Add(contract);

            var contractPO = new ObjFileShare
            {
                Code = "CONTRACT_PO",
                Name = "Hợp đồng mua"
            };
            data.Add(contractPO);

            var project = new ObjFileShare
            {
                Code = "PROJECT",
                Name = "Dự án/đấu thầu"
            };
            data.Add(project);

            var customer = new ObjFileShare
            {
                Code = "CUSTOMER",
                Name = "Khách hàng"
            };
            data.Add(customer);

            var supp = new ObjFileShare
            {
                Code = "SUPPLIER",
                Name = "Nhà cung cấp"
            };
            data.Add(supp);

            var product = new ObjFileShare
            {
                Code = "PRODUCT",
                Name = "Hàng hóa và vật tư"
            };
            data.Add(product);

            var jobCard = new ObjFileShare
            {
                Code = "JOBCARD",
                Name = "Thẻ việc"
            };
            data.Add(jobCard);

            var asset = new ObjFileShare
            {
                Code = "ASSET",
                Name = "Tài sản"
            };
            data.Add(asset);

            var fund = new ObjFileShare
            {
                Code = "FUND",
                Name = "Quỹ"
            };
            data.Add(fund);

            var user = new ObjFileShare
            {
                Code = "USER",
                Name = "Tệp tin đã tải lên"
            };
            data.Add(user);

            var cms = new ObjFileShare
            {
                Code = "CMS",
                Name = "Bài viết"
            };
            data.Add(cms);

            return Json(data);
        }

        [HttpPost]
        public JsonResult GetFileByObjShare([FromBody] FileShareModel jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            IQueryable<GridFileShare> query = null;

            var listFileShare = _context.FilesShareObjectUsers.Where(x => !x.IsDeleted);

            if (string.IsNullOrEmpty(jTablePara.ObjCode))
            {
                var query2 = (from a in _context.EDMSFiles.Where(x => !x.IsDeleted && (x.IsFileMaster == null || x.IsFileMaster == true))
                              join b in _context.EDMSRepoCatFiles on a.FileCode equals b.FileCode
                              join d in _context.EDMSRepositorys on a.ReposCode equals d.ReposCode into d2
                              from d in d2.DefaultIfEmpty()
                              join e in _context.EDMSCategorys.Where(x => !x.IsDeleted) on b.CatCode equals e.CatCode into e1
                              from e in e1.DefaultIfEmpty()
                              where (jTablePara.LstObjCode.Count() != 0 && jTablePara.LstObjCode.Any(x => x == b.CatCode)) &&
                                    (listFileShare.Any(x => x.FileID.Equals(a.FileCode)) || a.CreatedBy.Equals(User.Identity.Name))
                              select new { a, b, d, e });
                var query3 = query2.AsNoTracking().Skip(intBeginFor).Take(jTablePara.Length);
                var count = (from a in _context.EDMSFiles.Where(x => !x.IsDeleted && (x.IsFileMaster == null || x.IsFileMaster == true))
                             join b in _context.EDMSRepoCatFiles on a.FileCode equals b.FileCode
                             select a).AsNoTracking().Count();

                query = query3.Select(x => new GridFileShare
                {
                    Id = x.b != null ? x.b.Id : -1,
                    FileCode = x.a.FileCode,
                    FileName = x.a.FileName,
                    FileCreated = x.a.CreatedBy,
                    FileUrl = x.a.Url,
                });
            }
            else
            {
                switch (jTablePara.ObjCode)
                {
                    case "CONTRACT":
                        query = GetFileContract(listFileShare);
                        break;

                    case "CONTRACT_PO":
                        query = GetFileContractPO(listFileShare);
                        break;

                    case "PROJECT":
                        query = GetFileProject(listFileShare);
                        break;

                    case "CUSTOMER":
                        query = GetFileCustomer(listFileShare);
                        break;

                    case "SUPPLIER":
                        query = GetFileSupplier(listFileShare);
                        break;

                    case "PRODUCT":
                        query = GetFileProduct(listFileShare);
                        break;

                    case "JOBCARD":
                        query = GetFileCardJob(listFileShare);
                        break;

                    case "ASSET":
                        query = GetFileAsset(listFileShare);
                        break;

                    case "FUND":
                        query = GetFileFund();
                        break;

                    case "CMS":
                        query = GetFileCms();
                        break;

                    case "USER":
                        query = GetFileUser(listFileShare);
                        break;
                }
            }
            if (query.Count() > 0)
            {
                var count = query.Count();
                var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "FileName", "FileCode", "FileUrl", "FileCreated");
                return Json(jdata);
            }
            else
            {
                var jdata = JTableHelper.JObjectTable(new List<GridFileShare>(), jTablePara.Draw, 0, "Id", "FileName", "FileCode", "FileUrl", "FileCreated");
                return Json(jdata);
            }
        }

        [NonAction]
        public IQueryable<GridFileShare> GetFileContract(IQueryable<FilesShareObjectUser> listFileShare)
        {
            var query = from a in _context.EDMSRepoCatFiles.Where(x => x.ObjectType == EnumHelper<ContractEnum>.GetDisplayValue(ContractEnum.Contract))
                        join b in _context.EDMSFiles.Where(x => !x.IsDeleted) on a.FileCode equals b.FileCode
                        join f in _context.EDMSRepositorys on a.ReposCode equals f.ReposCode into f1
                        from f in f1.DefaultIfEmpty()
                        where (listFileShare.Any(x => x.FileID.Equals(a.FileCode)) || b.CreatedBy.Equals(User.Identity.Name))
                        select new GridFileShare
                        {
                            Id = a.Id,
                            FileCode = b.FileCode,
                            FileName = b.FileName,
                            FileUrl = b.Url,
                            FileCreated = b.CreatedBy
                        };
            return query;
        }

        [NonAction]
        public IQueryable<GridFileShare> GetFileContractPO(IQueryable<FilesShareObjectUser> listFileShare)
        {
            var query = from a in _context.EDMSRepoCatFiles.Where(x => x.ObjectType == EnumHelper<PoSupplierEnum>.GetDisplayValue(PoSupplierEnum.PoSupplier))
                        join b in _context.EDMSFiles.Where(x => !x.IsDeleted) on a.FileCode equals b.FileCode
                        join f in _context.EDMSRepositorys on a.ReposCode equals f.ReposCode into f1
                        from f in f1.DefaultIfEmpty()
                        where (listFileShare.Any(x => x.FileID.Equals(a.FileCode)) || b.CreatedBy.Equals(User.Identity.Name))
                        select new GridFileShare
                        {
                            Id = a.Id,
                            FileCode = b.FileCode,
                            FileName = b.FileName,
                            FileUrl = b.Url,
                            FileCreated = b.CreatedBy
                        };
            return query;
        }

        [NonAction]
        public IQueryable<GridFileShare> GetFileProject(IQueryable<FilesShareObjectUser> listFileShare)
        {
            var query = from a in _context.EDMSRepoCatFiles.Where(x => x.ObjectType == EnumHelper<ProjectEnum>.GetDisplayValue(ProjectEnum.Project))
                        join b in _context.EDMSFiles on a.FileCode equals b.FileCode
                        join f in _context.EDMSRepositorys on a.ReposCode equals f.ReposCode into f1
                        from f in f1.DefaultIfEmpty()
                        where (listFileShare.Any(x => x.FileID.Equals(a.FileCode)) || b.CreatedBy.Equals(User.Identity.Name))
                        select new GridFileShare
                        {
                            Id = a.Id,
                            FileCode = b.FileCode,
                            FileName = b.FileName,
                            FileUrl = b.Url,
                            FileCreated = b.CreatedBy
                        };
            return query;
        }

        [NonAction]
        public IQueryable<GridFileShare> GetFileCustomer(IQueryable<FilesShareObjectUser> listFileShare)
        {
            var query = from a in _context.EDMSRepoCatFiles.Where(x => x.ObjectType == EnumHelper<CustomerEnum>.GetDisplayValue(CustomerEnum.Customer))
                        join b in _context.EDMSFiles on a.FileCode equals b.FileCode
                        join f in _context.EDMSRepositorys on a.ReposCode equals f.ReposCode into f1
                        from f in f1.DefaultIfEmpty()
                        where (listFileShare.Any(x => x.FileID.Equals(a.FileCode)) || b.CreatedBy.Equals(User.Identity.Name))
                        select new GridFileShare
                        {
                            Id = a.Id,
                            FileCode = b.FileCode,
                            FileName = b.FileName,
                            FileUrl = b.Url,
                            FileCreated = b.CreatedBy
                        };
            return query;
        }

        [NonAction]
        public IQueryable<GridFileShare> GetFileSupplier(IQueryable<FilesShareObjectUser> listFileShare)
        {
            var query = from a in _context.EDMSRepoCatFiles.Where(x => x.ObjectType == EnumHelper<SupplierEnum>.GetDisplayValue(SupplierEnum.Supplier))
                        join b in _context.EDMSFiles on a.FileCode equals b.FileCode
                        join f in _context.EDMSRepositorys on a.ReposCode equals f.ReposCode into f1
                        from f in f1.DefaultIfEmpty()
                        where (listFileShare.Any(x => x.FileID.Equals(a.FileCode)) || b.CreatedBy.Equals(User.Identity.Name))
                        select new GridFileShare
                        {
                            Id = a.Id,
                            FileCode = b.FileCode,
                            FileName = b.FileName,
                            FileUrl = b.Url,
                            FileCreated = b.CreatedBy
                        };
            return query;
        }

        [NonAction]
        public IQueryable<GridFileShare> GetFileProduct(IQueryable<FilesShareObjectUser> listFileShare)
        {
            var query = ((from a in _context.EDMSRepoCatFiles.Where(x => x.ObjectType == EnumHelper<WarehouseEnum>.GetDisplayValue(WarehouseEnum.Warehouse))
                          join b in _context.EDMSFiles on a.FileCode equals b.FileCode
                          join f in _context.EDMSRepositorys on a.ReposCode equals f.ReposCode into f1
                          from f in f1.DefaultIfEmpty()
                          where (listFileShare.Any(x => x.FileID.Equals(a.FileCode)) || b.CreatedBy.Equals(User.Identity.Name))
                          select new GridFileShare
                          {
                              Id = a.Id,
                              FileCode = b.FileCode,
                              FileName = b.FileName,
                              FileUrl = b.Url,
                              FileCreated = b.CreatedBy
                          }).Union(
                          from a in _context.EDMSRepoCatFiles.Where(x => x.ObjectType == EnumHelper<EnumMaterialProduct>.GetDisplayValue(EnumMaterialProduct.Product))
                          join b in _context.EDMSFiles on a.FileCode equals b.FileCode
                          join f in _context.EDMSRepositorys on a.ReposCode equals f.ReposCode into f1
                          from f in f1.DefaultIfEmpty()
                          select new GridFileShare
                          {
                              Id = a.Id,
                              FileCode = b.FileCode,
                              FileName = b.FileName,
                              FileUrl = b.Url,
                              FileCreated = b.CreatedBy
                          })).AsNoTracking();
            return query;
        }

        [NonAction]
        public IQueryable<GridFileShare> GetFileCardJob(IQueryable<FilesShareObjectUser> listFileShare)
        {
            var query = from a in _context.CardAttachments.Where(x => !x.Flag)
                        where (listFileShare.Any(x => x.FileID.Equals(a.FileCode)) || a.MemberId.Equals(User.Identity.Name))
                        select new GridFileShare
                        {
                            Id = a.Id,
                            FileCode = a.FileCode,
                            FileName = a.FileName,
                            FileUrl = a.FileUrl,
                            FileCreated = a.MemberId
                        };
            return query;
        }

        [NonAction]
        public IQueryable<GridFileShare> GetFileAsset(IQueryable<FilesShareObjectUser> listFileShare)
        {
            var query = from a in _context.EDMSRepoCatFiles.Where(x => x.ObjectType == EnumHelper<AssetEnum>.GetDisplayValue(AssetEnum.Asset))
                        join b in _context.EDMSFiles.Where(x => !x.IsDeleted && x.IsFileMaster == null || x.IsFileMaster == true) on a.FileCode equals b.FileCode
                        join f in _context.EDMSRepositorys on a.ReposCode equals f.ReposCode into f1
                        from f in f1.DefaultIfEmpty()
                        where (listFileShare.Any(x => x.FileID.Equals(a.FileCode)) || b.CreatedBy.Equals(User.Identity.Name))
                        select new GridFileShare
                        {
                            Id = a.Id,
                            FileCode = b.FileCode,
                            FileName = b.FileName,
                            FileUrl = b.Url,
                            FileCreated = b.CreatedBy
                        };
            return query;
        }

        [NonAction]
        public IQueryable<GridFileShare> GetFileFund()
        {
            var query = _context.FundFiless.Where(x => !x.IsDeleted).Select(x => new GridFileShare
            {
                Id = x.Id,
                FileCode = x.FileCode,
                FileName = x.FileName,
                FileUrl = x.FilePath,
                FileCreated = x.CreatedBy
            });
            return query;
        }

        [NonAction]
        public IQueryable<GridFileShare> GetFileCms()
        {
            var query = from a in _context.cms_attachments
                        select new GridFileShare
                        {
                            Id = a.id,
                            FileCode = "",
                            FileName = a.file_name,
                            FileUrl = a.file_url,
                            FileCreated = ""
                        };
            return query;
        }

        [NonAction]
        public IQueryable<GridFileShare> GetFileUser(IQueryable<FilesShareObjectUser> listFileShare)
        {
            var query = (from a in _context.EDMSRepoCatFiles
                         join b in _context.EDMSFiles.Where(x => !x.IsDeleted && x.CreatedBy.Equals(ESEIM.AppContext.UserName) && x.IsFileMaster == null || x.IsFileMaster == true) on a.FileCode equals b.FileCode
                         join f in _context.EDMSRepositorys on a.ReposCode equals f.ReposCode into f1
                         from f in f1.DefaultIfEmpty()
                         where (listFileShare.Any(x => x.FileID.Equals(a.FileCode)) || b.CreatedBy.Equals(User.Identity.Name))
                         select new GridFileShare
                         {
                             Id = a.Id,
                             FileCode = b.FileCode,
                             FileName = b.FileName,
                             FileUrl = b.Url,
                             FileCreated = b.CreatedBy
                         }).Union(
                  from a in _context.FundFiless.Where(x => !x.IsDeleted && x.CreatedBy.Equals(ESEIM.AppContext.UserName))
                  select new GridFileShare
                  {
                      Id = a.Id,
                      FileCode = a.FileCode,
                      FileName = a.FileName,
                      FileUrl = a.FilePath,
                      FileCreated = a.CreatedBy
                  }).Union(
                from a in _context.CardAttachments.Where(x => !x.Flag && x.MemberId.Equals(ESEIM.AppContext.UserName))
                select new GridFileShare
                {
                    Id = a.Id,
                    FileCode = a.FileCode,
                    FileName = a.FileName,
                    FileUrl = a.FileUrl,
                    FileCreated = a.MemberId
                }).Union(
                from a in _context.cms_attachments
                select new GridFileShare
                {
                    Id = a.id,
                    FileCode = "",
                    FileName = a.file_name,
                    FileUrl = a.file_url,
                    FileCreated = ""
                });
            return query;
        }


        [HttpPost]
        public JsonResult InsertFileShare([FromBody] List<FilesShareObjectUserModel> obj)
        {
            var msg = new JMessage { Title = "", Error = false };
            try
            {
                if (obj.Any())
                {
                    var session = HttpContext.GetSessionUser();
                    var lstUserShare = new List<LstUserShare>();
                    var lstId = new List<int>();
                    foreach (var item in obj)
                    {
                        var repoCatFile = (from a in _context.EDMSRepoCatFiles.Where(x => x.FileCode.Equals(item.FileID))
                                           join b in _context.EDMSFiles.Where(x => !x.IsDeleted && (x.IsFileMaster == true || x.IsFileMaster == null)) on a.FileCode equals b.FileCode
                                           select new { a, b }).FirstOrDefault();
                        if (repoCatFile != null)
                        {
                            var fileNew = string.Concat(Path.GetFileNameWithoutExtension(item.FileName), "_", Guid.NewGuid().ToString().Substring(0, 8), Path.GetExtension(item.FileName));
                            var byteData = DownloadFileFromServer(repoCatFile.a.Id);
                            var urlUpload = UploadFileToServer(byteData, repoCatFile.a.ReposCode, repoCatFile.a.CatCode, fileNew, repoCatFile.b.MimeType);

                            var edmsReposCatFile = new EDMSRepoCatFile
                            {
                                FileCode = string.Concat("Card_", Guid.NewGuid().ToString()),
                                ReposCode = repoCatFile.a.ReposCode,
                                CatCode = repoCatFile.a.CatCode,
                                ObjectCode = item.ObjectInstance,
                                ObjectType = "LMS_TASK",
                                Path = repoCatFile.a.Path,
                                FolderId = repoCatFile.a.FolderId
                            };
                            _context.EDMSRepoCatFiles.Add(edmsReposCatFile);

                            var edms = new EDMSFile
                            {
                                FileCode = edmsReposCatFile.FileCode,
                                FileName = item.FileName,
                                Desc = "",
                                ReposCode = repoCatFile.a.ReposCode,
                                Tags = "",
                                FileSize = repoCatFile.b.FileSize,
                                FileTypePhysic = repoCatFile.b.FileTypePhysic,
                                NumberDocument = "",
                                CreatedBy = ESEIM.AppContext.UserName,
                                CreatedTime = DateTime.Now,
                                Url = urlUpload.Object.ToString(),
                                MimeType = repoCatFile.b.MimeType,
                                CloudFileId = repoCatFile.b.CloudFileId,
                            };
                            _context.EDMSFiles.Add(edms);
                            lstId.Add(edmsReposCatFile.Id);

                        }
                    }
                    
                    var activity = new LmsTaskStudentAssign()
                    {
                        UserId = ESEIM.AppContext.UserId,
                        Action = "ADD",
                        IdObject = "FILE",
                        IsCheck = true,
                        LmsTaskCode = obj[0].ObjectInstance,
                        CreatedTime = DateTime.Now,
                        FromDevice = "Laptop/Desktop",
                        ChangeDetails = ""
                    };
                    _context.LmsTaskStudentAssigns.Add(activity);
                    UpdateChangeCard(obj[0].ObjectInstance);
                    _context.SaveChanges();
                    msg.Title = "Chọn tệp tin thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Vui lòng chọn tệp tin";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }


        [NonAction]
        public byte[] DownloadFileFromServer(int idRepoCatFile)
        {
            byte[] fileStream = new byte[0];

            var data = (from a in _context.EDMSRepoCatFiles.Where(x => x.Id == idRepoCatFile)
                        join b in _context.EDMSRepositorys on a.ReposCode equals b.ReposCode into b2
                        from b in b2.DefaultIfEmpty()
                        join c in _context.EDMSFiles on a.FileCode equals c.FileCode into c2
                        from c in c2.DefaultIfEmpty()
                        select new
                        {
                            a.Id,
                            Server = (b != null ? b.Server : null),
                            Token = (b != null ? b.Token : null),
                            Type = (b != null ? b.Type : null),
                            ReposCode = (b != null ? b.ReposCode : null),
                            Url = (c != null ? c.Url : null),
                            FileId = (c != null ? c.CloudFileId : null),
                            FileTypePhysic = c.FileTypePhysic,
                            c.FileName,
                            c.MimeType,
                            b.Account,
                            b.PassWord,
                            c.FileCode,
                            c.IsEdit,
                            c.IsFileMaster,
                            c.FileParentId
                        }).FirstOrDefault();

            var getRepository = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == data.ReposCode);
            if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server))
            {
                using (var ms = new MemoryStream())
                {
                    string ftphost = data.Server;
                    string ftpfilepath = data.Url;
                    var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + ftphost + ftpfilepath);
                    using (WebClient request = new WebClient())
                    {
                        request.Credentials = new NetworkCredential(data.Account, data.PassWord);
                        fileStream = request.DownloadData(urlEnd);
                    }
                }
            }
            else if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.GooglerDriver))
            {
                var apiTokenService = _context.TokenManagers.FirstOrDefault(x => x.AccountCode == data.Token);
                var json = apiTokenService.CredentialsJson;
                var user = apiTokenService.Email;
                var token = apiTokenService.RefreshToken;
                fileStream = FileExtensions.DownloadFileGoogle(json, token, data.FileId, user);
            }

            return fileStream;
        }

        [NonAction]
        public JMessage UploadFileToServer(byte[] fileByteArr, string repoCode, string catCode, string fileName, string contentType)
        {
            var msg = new JMessage() { Error = false, Title = "Tải tệp thành công" };
            try
            {
                var data = (from a in _context.EDMSCatRepoSettings.Where(x => x.ReposCode.Equals(repoCode) && x.CatCode.Equals(catCode))
                            join b in _context.EDMSRepositorys on a.ReposCode equals b.ReposCode into b2
                            from b in b2.DefaultIfEmpty()
                            select new
                            {
                                Server = (b != null ? b.Server : null),
                                Token = (b != null ? b.Token : null),
                                Type = (b != null ? b.Type : null),
                                a.Path,
                                a.FolderId,
                                b.Account,
                                b.PassWord,
                            }).FirstOrDefault();

                var getRepository = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == repoCode);
                if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server))
                {
                    var fileBytes = fileByteArr;
                    var urlFile = string.Concat(data.Path, "/", fileName);
                    var urlFileServer = System.Web.HttpUtility.UrlPathEncode("ftp://" + data.Server + urlFile);
                    var result = FileExtensions.UploadFileToFtpServer(urlFileServer, urlFileServer, fileBytes, data.Account, data.PassWord);
                    if (result.Status == WebExceptionStatus.ConnectFailure || result.Status == WebExceptionStatus.ProtocolError)
                    {
                        msg.Error = true;
                        msg.Title = _sharedResources["COM_CONNECT_FAILURE"];

                        return msg;
                    }
                    else if (result.Status == WebExceptionStatus.Success)
                    {
                        msg.Object = urlFile;
                        if (result.IsSaveUrlPreventive)
                        {
                            //urlFile = urlFilePreventive;
                        }
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Object = "Ex3";
                        msg.Title = _sharedResources["COM_MSG_ERR"];
                        return msg;
                    }
                }
                else if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.GooglerDriver))
                {
                    Stream stream = new MemoryStream(fileByteArr); var apiTokenService = _context.TokenManagers.FirstOrDefault(x => x.AccountCode == data.Token);
                    var json = apiTokenService.CredentialsJson;
                    var user = apiTokenService.Email;
                    var token = apiTokenService.RefreshToken;
                    msg.Object = FileExtensions.UploadFileToDrive(json, token, fileName, stream, contentType, data.FolderId, user);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = "Ex4";
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }

            return msg;
        }
        public class ObjFileShare
        {
            public string Code { get; set; }
            public string Name { get; set; }
        }
        public class FileShareModel : JTableModel
        {
            public string ObjCode { get; set; }
            public List<string> LstObjCode { get; set; }
        }
        public class GridFileShare
        {
            public int Id { get; set; }
            public string FileCode { get; set; }
            public string FileName { get; set; }
            public string FileUrl { get; set; }
            public string FileCreated { get; set; }
        }
        public class FilesShareObjectUserModel
        {
            public string FileID { get; set; }
            public string ObjectType { get; set; }
            public string ObjectInstance { get; set; }
            public string FileCreated { get; set; }
            public string FileUrl { get; set; }
            public string FileName { get; set; }
        }
        public class ObjRelative
        {
            public string ObjectType { get; set; }
            public string ObjectInstance { get; set; }
        }
        public class LstUserShare
        {
            public string Code { get; set; }
            public string Name { get; set; }
            public string DepartmentName { get; set; }
            public PermissionFile Permission { get; set; }
        }

        #endregion

        #region View card by work flow
        public class ViewCardWf : JTableModel
        {
            public string WfCode { get; set; }
            public string WfInstCode { get; set; }
        }
        #endregion

        #region Role system with card
        [HttpGet]
        public object PermissionHeaderCard(string cardCode)
        {
            // check permission of user for interact with header card
            var session = HttpContext.GetSessionUser();
            var hasPermission = false;
            var card = _context.LmsTasks.FirstOrDefault(x => !x.IsDeleted && x.LmsTaskCode == cardCode);
            if (card != null)
            {
                if (card.CreatedBy == session.UserName || session.IsAllData)
                    hasPermission = true;
            }
            return hasPermission;
        }
        #endregion

        #region View Log WF

        [HttpGet]
        public JsonResult ViewLogWF(string cardCode, string wf)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var wfInst = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value && x.ObjectInst.Equals(cardCode)
            && x.WorkflowCode.Equals(wf) && x.ObjectType == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.TypeInstCard));
            if (wfInst != null)
            {
                var common = _context.CommonSettings.Where(k => !k.IsDeleted);

                var acts = _context.ActivityInstances.Where(x => !x.IsDeleted
                    && x.WorkflowCode.Equals(wfInst.WfInstCode))
                    .Select(x => new ActGrid
                    {
                        ActInstCode = x.ActivityInstCode,
                        ActInstName = x.Title,
                        Duration = x.Duration,
                        Status = common.FirstOrDefault(k => k.CodeSet.Equals(x.Status)) != null ?
                                   common.FirstOrDefault(k => k.CodeSet.Equals(x.Status)).ValueSet : "",
                        Unit = common.FirstOrDefault(k => k.CodeSet.Equals(x.Unit)) != null ?
                                   common.FirstOrDefault(k => k.CodeSet.Equals(x.Unit)).ValueSet : "",
                        Type = x.Type,
                        IsLock = (x.Type.Equals("STATUS_ACTIVITY_INACTIVE") || x.Type.Equals("STATUS_ACTIVITY_LOCK")) ? true : false
                    }).ToList();

                var actInitial = acts.FirstOrDefault(x => x.Type.Equals("TYPE_ACTIVITY_INITIAL"));

                acts = ArrangeAct(acts, 1, actInitial, new List<ActInstInfo>());

                msg.Object = acts;
            }
            return Json(msg);
        }

        [NonAction]
        private List<ActGrid> ArrangeAct(List<ActGrid> listInst, int level,
            ActGrid instInitial, List<ActInstInfo> listActInfo)
        {
            try
            {
                if (instInitial != null)
                {
                    instInitial.Level = level;
                    var runnings = _context.WorkflowInstanceRunnings.Where(x => !x.IsDeleted && x.ActivityInitial.Equals(instInitial.ActInstCode));
                    foreach (var item in runnings)
                    {
                        var actRunning = listInst.FirstOrDefault(x => x.ActInstCode.Equals(item.ActivityDestination));
                        if (actRunning != null)
                        {
                            if (!listActInfo.Any(x => x.ActInstCode.Equals(actRunning.ActInstCode)))
                            {
                                actRunning.Level = instInitial.Level + 1;

                                var info = new ActInstInfo
                                {
                                    ActInstCode = actRunning.ActInstCode
                                };

                                listActInfo.Add(info);
                                listInst = ArrangeAct(listInst, actRunning.Level, actRunning, listActInfo);
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {

            }

            return listInst.OrderBy(x => x.Level).ToList();
        }

        public class ActGrid
        {
            public string ActInstCode { get; set; }
            public string ActInstName { get; set; }
            public string Status { get; set; }
            public decimal Duration { get; set; }
            public string Unit { get; set; }
            public int Level { get; set; }
            public string Type { get; set; }
            public bool IsLock { get; set; }
        }
        public class ActInstInfo
        {
            public string ActInstCode { get; set; }
        }
        #endregion

        #region File card to repo

        [HttpPost]
        public object JTableFile([FromBody] JTableModelFile jTablePara)
        {
            if (string.IsNullOrEmpty(jTablePara.CardCode))
            {
                return JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "Id", "FileName", "FileTypePhysic", "Desc", "Url", "CreatedTime", "UpdatedTime", "ReposName", "TypeFile", "FileID", "SizeOfFile");
            }
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            var listFileByUser = _context.FilesShareObjectUsers.Where(x => !x.IsDeleted && x.UserShares.Any(p => p.Code.Equals(User.Identity.Name)))
                                                           .Select(p => new
                                                           {
                                                               p.FileID,
                                                               p.ListUserShare,
                                                               p.UserShares
                                                           }).ToList();
            var session = HttpContext.GetSessionUser();

            var query = (from a in _context.EDMSRepoCatFiles.Where(x => x.ObjectCode == jTablePara.CardCode && x.ObjectType == "LMS_TASK")
                         join b in _context.EDMSFiles.Where(x => !x.IsDeleted && (x.IsFileMaster == null || x.IsFileMaster == true)) on a.FileCode equals b.FileCode
                         join f in _context.EDMSRepositorys on a.ReposCode equals f.ReposCode into f1
                         from f in f1.DefaultIfEmpty()
                         join g in listFileByUser on b.FileCode equals g.FileID into g1
                         from g in g1.DefaultIfEmpty()
                         where (listFileByUser.Any(x => x.FileID.Equals(b.FileCode)) || b.CreatedBy.Equals(User.Identity.Name) || session.IsAllData)
                         select new
                         {
                             Id = a.Id,
                             FileCode = b.FileCode,
                             FileName = b.FileName,
                             FileTypePhysic = b.FileTypePhysic,
                             Desc = b.Desc,
                             CreatedTime = b.CreatedTime.Value,
                             CloudFileId = b.CloudFileId,
                             ReposName = f != null ? f.ReposName : "",
                             FileID = b.FileID,
                             SizeOfFile = b.FileSize.HasValue ? b.FileSize.Value : 0,
                             Type = "NO_SHARE",
                             ListUserShare = g.ListUserShare,
                             b.CreatedBy
                         }).Union(
                        from a in _context.FilesShareObjectUsers.Where(x => !x.IsDeleted)
                        join c in _context.EDMSRepoCatFiles on a.FileID equals c.FileCode
                        join b in _context.EDMSFiles on c.FileCode equals b.FileCode
                        join f in _context.EDMSRepositorys on c.ReposCode equals f.ReposCode into f1
                        from f in f1.DefaultIfEmpty()
                        let rela = JsonConvert.DeserializeObject<ObjRelative>(a.ObjectRelative)
                        where rela.ObjectInstance.Equals(jTablePara.CardCode) && rela.ObjectType.Equals("JOBCARD")
                        select new
                        {
                            Id = c.Id,
                            FileCode = b.FileCode,
                            FileName = b.FileName,
                            FileTypePhysic = b.FileTypePhysic,
                            Desc = b.Desc,
                            CreatedTime = b.CreatedTime.Value,
                            CloudFileId = b.CloudFileId,
                            ReposName = f != null ? f.ReposName : "",
                            FileID = b.FileID,
                            SizeOfFile = b.FileSize.HasValue ? b.FileSize.Value : 0,
                            Type = "SHARE",
                            ListUserShare = a.ListUserShare,
                            b.CreatedBy
                        });
            int count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "FileCode", "FileName", "FileTypePhysic", "Desc",
                "CreatedTime", "CloudFileId", "ReposName", "TypeFile", "FileID", "SizeOfFile", "ListUserShare", "CreatedBy");
            return jdata;
        }

        [HttpPost]
        [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
        [RequestSizeLimit(long.MaxValue)]
        public JsonResult InsertCardJobFile(EDMSRepoCatFileModel obj, IFormFile fileUpload)
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
                    //var suggesstion = GetSuggestionsCardCodeFile(obj.CardCode);
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
                    //    msg.Title = _stringLocalizer["Vui lòng nhập thuộc tính mở rộng"];
                    //    return Json(msg);
                    //}

                    var repoDefault = _context.EDMSRepoDefaultObjects.FirstOrDefault(x => !x.IsDeleted
                            && x.ObjectCode.Equals(obj.CardCode) && x.ObjectType.Equals("LMS_TASK"));
                    if (repoDefault != null)
                    {
                        reposCode = repoDefault.ReposCode;
                        path = repoDefault.Path;
                        folderId = repoDefault.FolderId;
                        catCode = repoDefault.CatCode;
                    }
                    else
                    {
                        var setting = (EDMSCatRepoSetting)_upload.GetPathByModule(module_name).Object;
                        reposCode = setting.ReposCode;
                        catCode = setting.CatCode;
                        if (setting.Path == "")
                        {
                            host_type = 1;
                            path_upload_file = setting.FolderId;
                        }
                        else
                        {
                            host_type = 0;
                            path_upload_file = setting.Path;
                        }
                        path = host_type == 0 ? path_upload_file : "";
                        folderId = host_type == 1 ? path_upload_file : "";
                        //msg.Error = true;
                        //msg.Title = _sharedResources["COM_MSG_PLS_SETUP_FOLDER_DEFAULT"];
                        //return Json(msg);
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
                        var defaultSetting = (EDMSCatRepoSetting)_upload.GetPathByModule(module_name).Object;
                        reposCode = defaultSetting.ReposCode;
                        catCode = defaultSetting.CatCode;
                        if (defaultSetting.Path == "")
                        {
                            host_type = 1;
                            path_upload_file = defaultSetting.FolderId;
                        }
                        else
                        {
                            host_type = 0;
                            path_upload_file = defaultSetting.Path;
                        }
                        path = host_type == 0 ? path_upload_file : "";
                        folderId = host_type == 1 ? path_upload_file : "";
                        //msg.Error = true;
                        //msg.Title = _stringLocalizer["CJ_MSG_PLS_SELECT_FOLDER"];
                        //return Json(msg);
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
                    FileCode = string.Concat("CARDJOB_", Guid.NewGuid().ToString()),
                    ReposCode = reposCode,
                    CatCode = catCode,
                    ObjectCode = obj.CardCode,
                    ObjectType = "LMS_TASK",
                    Path = path,
                    FolderId = folderId
                };
                _context.EDMSRepoCatFiles.Add(edmsReposCatFile);

                /// created Index lucene
                if (Array.IndexOf(LuceneExtension.fileMimetypes, mimeType) >= 0 && (Array.IndexOf(LuceneExtension.fileExt, extension.ToUpper()) >= 0))
                {
                    var moduleObj = (EDMSCatRepoSetting)_upload.GetPathByModule("DB_LUCENE_INDEX").Object;
                    var luceneCategory = _context.EDMSCategorys.FirstOrDefault(x => x.CatCode == moduleObj.CatCode);
                    LuceneExtension.IndexFile(edmsReposCatFile.FileCode, fileUpload, luceneCategory.PathServerPhysic);
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
                    
                var activity = new LmsTaskStudentAssign()
                {
                    UserId = ESEIM.AppContext.UserId,
                    Action = "ADD",
                    IdObject = "FILE",
                    IsCheck = true,
                    LmsTaskCode = obj.CardCode,
                    CreatedTime = DateTime.Now,
                    FromDevice = "Laptop/Desktop",
                    ChangeDetails = fileUpload.FileName
                };
                _context.LmsTaskStudentAssigns.Add(activity);
                UpdateChangeCard(obj.CardCode);

                _context.SaveChanges();
                msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                msg.Object = edmsReposCatFile.Id;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpGet]
        public EDMSRepoCatFile GetSuggestionsCardCodeFile(string cardCode)
        {
            var query = _context.EDMSRepoCatFiles.Where(x => x.ObjectCode == cardCode && x.ObjectType == EnumHelper<CardEnum>.GetDisplayValue(CardEnum.CardJob)).MaxBy(x => x.Id);
            return query;
        }

        [HttpPost]
        public JsonResult GetCardFile(int id)
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
                    msg.Title = String.Format(_stringLocalizerCJ["Tệp tin không tồn tại"]);//"Tệp tin không tồn tại!";
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
        public JsonResult UpdateCardFile(EDMSRepoCatFileModel obj)
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
                                var apiTokenService = _context.TokenManagers.FirstOrDefault(x => x.AccountCode == oldRepo.Token);
                                var json = apiTokenService.CredentialsJson;
                                var user = apiTokenService.Email;
                                var token = apiTokenService.RefreshToken;
                                fileData = FileExtensions.DownloadFileGoogle(json, token, file.CloudFileId, user);
                            }
                            //delete folder old
                            if (oldRepo.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server))
                            {
                                var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + oldRepo.Server + file.Url);
                                FileExtensions.DeleteFileFtpServer(urlEnd, oldRepo.Account, oldRepo.PassWord);
                            }
                            else if (oldRepo.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.GooglerDriver))
                            {
                                var apiTokenService = _context.TokenManagers.FirstOrDefault(x => x.AccountCode == oldRepo.Token);
                                var json = apiTokenService.CredentialsJson;
                                var user = apiTokenService.Email;
                                var token = apiTokenService.RefreshToken;
                                FileExtensions.DeleteFileGoogleServer(json, token, file.CloudFileId, user);
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
                                var apiTokenService = _context.TokenManagers.FirstOrDefault(x => x.AccountCode == newRepo.Token);
                                var json = apiTokenService.CredentialsJson;
                                var user = apiTokenService.Email;
                                var token = apiTokenService.RefreshToken;
                                fileId = FileExtensions.UploadFileToDrive(json, token, file.FileName, new MemoryStream(fileData), file.MimeType, newSetting.FolderId, user);
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
                        msg.Title = _stringLocalizerCJ["HR_HR_MSG_UPDATE_SUCCESS"];
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizerCJ["HR_HR_MAN_MSG_SELECT_FORDER"];
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizerCJ["HR_HR_MSG_FILE_NOT_EXIST"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_FAILED"], _stringLocalizerCJ[""]);// "Có lỗi xảy ra khi cập nhật!";
                msg.Object = ex;
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult DeleteCardFile(int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.EDMSRepoCatFiles.FirstOrDefault(x => x.Id == id);
                _context.EDMSRepoCatFiles.Remove(data);

                var file = _context.EDMSFiles.FirstOrDefault(x => x.FileCode == data.FileCode);
                _context.EDMSFiles.Remove(file);

                var moduleObj = (EDMSCatRepoSetting)_upload.GetPathByModule("DB_LUCENE_INDEX").Object;
                var luceneCategory = _context.EDMSCategorys.FirstOrDefault(x => x.CatCode == moduleObj.CatCode);
                LuceneExtension.DeleteIndexFile(file.FileCode, luceneCategory.PathServerPhysic);
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
                        var apiTokenService = _context.TokenManagers.FirstOrDefault(x => x.AccountCode == getRepository.Token);
                        var json = apiTokenService.CredentialsJson;
                        var user = apiTokenService.Email;
                        var token = apiTokenService.RefreshToken;
                        FileExtensions.DeleteFileGoogleServer(json, token, file.CloudFileId, user);
                    }
                }
                    
                var activity = new LmsTaskStudentAssign()
                {
                    UserId = ESEIM.AppContext.UserId,
                    Action = "DELETE",
                    IdObject = "FILE",
                    IsCheck = true,
                    LmsTaskCode = data.ObjectCode,
                    CreatedTime = DateTime.Now,
                    FromDevice = "Laptop/Desktop",
                    ChangeDetails = file.FileName
                };
                _context.LmsTaskStudentAssigns.Add(activity);
                UpdateChangeCard(data.ObjectCode);
                _context.SaveChanges();
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizerCJ[""]);// "Xóa thành công";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_FAIL"], _stringLocalizerCJ[""]);//"Có lỗi xảy ra khi xóa!";
                msg.Object = ex;
            }
            return Json(msg);
        }

        [HttpPost]
        public List<LstUserShare> GetListUserShare(string cardCode)
        {
            var data = from a in _context.Users.Select(x => new { Code = x.UserName, Name = x.GivenName, x.DepartmentId, UserId = x.Id })
                       join b in _context.AdDepartments.Where(x => !x.IsDeleted && x.IsEnabled) on a.DepartmentId equals b.DepartmentCode into b1
                       from b in b1.DefaultIfEmpty()
                       join c in _context.JobCardAssignees.Where(x => !x.IsDeleted && x.CardCode.Equals(cardCode)) on a.UserId equals c.UserId
                       select new LstUserShare
                       {
                           Code = a.Code,
                           Name = a.Name,
                           DepartmentName = b != null ? b.Title : "",
                           Permission = new PermissionFile()
                       };
            return data.ToList();
        }

        [HttpPost]
        public JsonResult InsertFileShareCard([FromBody] ShareFilePermission obj)
        {
            var msg = new JMessage { Title = "", Error = false };
            try
            {
                var data = (from a in _context.EDMSRepoCatFiles.Where(x => x.Id == obj.Id)
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
                                b.PassWord,
                                c.FileCode,
                                c.IsEdit,
                                c.IsFileMaster,
                                c.FileParentId,
                                a.ObjectCode
                            }).FirstOrDefault();

                if (data != null)
                {
                    var check = _context.FilesShareObjectUsers.FirstOrDefault(x => !x.IsDeleted && x.FileID.Equals(data.FileCode));

                    var share = new UserShare
                    {
                        Code = obj.Code,
                        Name = obj.Name,
                        DepartmentName = obj.DepartmentName,
                        Permission = obj.Permission
                    };
                    var lstUserShare = new List<UserShare>();
                    if (check == null)
                    {
                        lstUserShare.Add(share);
                        var rela = new
                        {
                            ObjectType = EnumHelper<CardEnum>.GetDisplayValue(CardEnum.CardJob),
                            ObjectInstance = data.Id
                        };
                        var files = new FilesShareObjectUser
                        {
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now,
                            FileID = data.FileCode,
                            FileCreated = User.Identity.Name,
                            FileUrl = data.Url,
                            FileName = data.FileName,
                            ObjectRelative = JsonConvert.SerializeObject(rela),
                            ListUserShare = JsonConvert.SerializeObject(lstUserShare)
                        };
                        _context.FilesShareObjectUsers.Add(files);
                        UpdateChangeCard(data.ObjectCode);
                        _context.SaveChanges();
                        msg.Title = "Chia sẻ thành công";
                    }
                    else
                    {
                        if (!string.IsNullOrEmpty(check.ListUserShare))
                        {
                            lstUserShare = JsonConvert.DeserializeObject<List<UserShare>>(check.ListUserShare);
                            var isAdded = false;
                            foreach (var item in lstUserShare)
                            {
                                if (item.Code == obj.Code)
                                {
                                    item.Permission = obj.Permission;
                                    isAdded = true;
                                    break;
                                }
                            }
                            if (isAdded)
                            {
                                check.ListUserShare = JsonConvert.SerializeObject(lstUserShare);
                                check.UpdatedBy = ESEIM.AppContext.UserName;
                                check.UpdatedTime = DateTime.Now;
                                _context.FilesShareObjectUsers.Update(check);
                                UpdateChangeCard(data.ObjectCode);
                                _context.SaveChanges();
                                msg.Title = "Cập nhật thành công";
                            }
                            else
                            {
                                lstUserShare.Add(share);
                                check.ListUserShare = JsonConvert.SerializeObject(lstUserShare);
                                check.UpdatedBy = ESEIM.AppContext.UserName;
                                check.UpdatedTime = DateTime.Now;
                                _context.FilesShareObjectUsers.Update(check);
                                UpdateChangeCard(data.ObjectCode);
                                _context.SaveChanges();
                                msg.Title = "Chia sẻ thành công";
                            }
                        }
                        else
                        {
                            lstUserShare.Add(share);
                            check.ListUserShare = JsonConvert.SerializeObject(lstUserShare);
                            check.UpdatedBy = ESEIM.AppContext.UserName;
                            check.UpdatedTime = DateTime.Now;
                            _context.FilesShareObjectUsers.Update(check);
                            UpdateChangeCard(data.ObjectCode);
                            _context.SaveChanges();
                            msg.Title = "Chia sẻ thành công";
                        }
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
        public JsonResult GetUserShareFilePermission(int id)
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
                            b.PassWord,
                            c.FileCode,
                            c.IsEdit,
                            c.IsFileMaster,
                            c.FileParentId
                        }).FirstOrDefault();
            var lstUserShare = new List<UserShare>();
            if (data != null)
            {
                var check = _context.FilesShareObjectUsers.FirstOrDefault(x => !x.IsDeleted && x.FileID.Equals(data.FileCode));
                if (check != null)
                {
                    if (!string.IsNullOrEmpty(check.ListUserShare))
                    {
                        lstUserShare = JsonConvert.DeserializeObject<List<UserShare>>(check.ListUserShare);
                    }
                }
            }
            return Json(lstUserShare);
        }

        [HttpPost]
        public JsonResult DeleteShareFile(int id, string userName)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
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
                                b.PassWord,
                                c.FileCode,
                                c.IsEdit,
                                c.IsFileMaster,
                                c.FileParentId,
                                a.ObjectCode
                            }).FirstOrDefault();
                var lstUserShare = new List<UserShare>();
                if (data != null)
                {
                    var check = _context.FilesShareObjectUsers.FirstOrDefault(x => !x.IsDeleted && x.FileID.Equals(data.FileCode));
                    if (check != null)
                    {
                        if (!string.IsNullOrEmpty(check.ListUserShare))
                        {
                            lstUserShare = JsonConvert.DeserializeObject<List<UserShare>>(check.ListUserShare);
                            foreach (var item in lstUserShare)
                            {
                                if (item.Code.Equals(userName))
                                {
                                    lstUserShare.Remove(item);
                                    break;
                                }
                            }
                            check.ListUserShare = JsonConvert.SerializeObject(lstUserShare);
                            _context.FilesShareObjectUsers.Update(check);
                            UpdateChangeCard(data.ObjectCode);
                            _context.SaveChanges();
                            msg.Title = "Xóa thành công";
                        }
                        else
                        {
                            msg.Error = true;
                            msg.Title = "Không tìm thấy bản ghi";
                        }
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = "Không tìm thấy bản ghi";
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Không tìm thấy bản ghi";
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
        public void AutoShareFilePermission([FromBody] AutoShareFileModel obj)
        {
            var data = (from a in _context.EDMSRepoCatFiles.Where(x => x.Id == obj.Id)
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
                            b.PassWord,
                            c.FileCode,
                            c.IsEdit,
                            c.IsFileMaster,
                            c.FileParentId
                        }).FirstOrDefault();

            if (data != null)
            {
                var check = _context.FilesShareObjectUsers.FirstOrDefault(x => !x.IsDeleted && x.FileID.Equals(data.FileCode));
                if (check == null)
                {
                    var rela = new
                    {
                        ObjectType = EnumHelper<CardEnum>.GetDisplayValue(CardEnum.CardJob),
                        ObjectInstance = data.Id
                    };
                    var files = new FilesShareObjectUser
                    {
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now,
                        FileID = data.FileCode,
                        FileCreated = User.Identity.Name,
                        FileUrl = data.Url,
                        FileName = data.FileName,
                        ObjectRelative = JsonConvert.SerializeObject(rela),
                        ListUserShare = obj.LstShare
                    };
                    _context.FilesShareObjectUsers.Add(files);
                    _context.SaveChanges();
                }
            }
        }

        #region File Item Request
        [HttpPost]
        [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
        [RequestSizeLimit(long.MaxValue)]
        public JsonResult InsertCardJobFileRequest(EDMSRepoCatFileModel obj, IFormFile fileUpload)
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
                        //var suggesstion = GetSuggestionsCardCodeFile(obj.CardCode);
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
                        //    msg.Title = _stringLocalizer["Vui lòng nhập thuộc tính mở rộng"];
                        //    return Json(msg);
                        //}

                        var repoDefault = _context.EDMSRepoDefaultObjects.FirstOrDefault(x => !x.IsDeleted
                                && x.ObjectCode.Equals(obj.CardCode) && x.ObjectType.Equals(EnumHelper<CardEnum>.GetDisplayValue(CardEnum.ItemRequest)));
                        if (repoDefault != null)
                        {
                            reposCode = repoDefault.ReposCode;
                            path = repoDefault.Path;
                            folderId = repoDefault.FolderId;
                            catCode = repoDefault.CatCode;
                        }
                        else
                        {
                            var setting = (EDMSCatRepoSetting)_upload.GetPathByModule(module_name).Object;
                            reposCode = setting.ReposCode;
                            catCode = setting.CatCode;
                            if (setting.Path == "")
                            {
                                host_type = 1;
                                path_upload_file = setting.FolderId;
                            }
                            else
                            {
                                host_type = 0;
                                path_upload_file = setting.Path;
                            }
                            path = host_type == 0 ? path_upload_file : "";
                            folderId = host_type == 1 ? path_upload_file : "";
                            //msg.Error = true;
                            //msg.Title = _sharedResources["COM_MSG_PLS_SETUP_FOLDER_DEFAULT"];
                            //return Json(msg);
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
                            var defaultSetting = (EDMSCatRepoSetting)_upload.GetPathByModule(module_name).Object;
                            reposCode = defaultSetting.ReposCode;
                            catCode = defaultSetting.CatCode;
                            if (defaultSetting.Path == "")
                            {
                                host_type = 1;
                                path_upload_file = defaultSetting.FolderId;
                            }
                            else
                            {
                                host_type = 0;
                                path_upload_file = defaultSetting.Path;
                            }
                            path = host_type == 0 ? path_upload_file : "";
                            folderId = host_type == 1 ? path_upload_file : "";
                            //msg.Error = true;
                            //msg.Title = _stringLocalizer["CJ_MSG_PLS_SELECT_FOLDER"];
                            //return Json(msg);
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
                        FileCode = string.Concat("WORK_REQUEST_", Guid.NewGuid().ToString()),
                        ReposCode = reposCode,
                        CatCode = catCode,
                        ObjectCode = obj.CardCode,
                        ObjectType = EnumHelper<CardEnum>.GetDisplayValue(CardEnum.ItemRequest),
                        Path = path,
                        FolderId = folderId
                    };
                    _context.EDMSRepoCatFiles.Add(edmsReposCatFile);

                    /// created Index lucene
                    var moduleObj = (EDMSCatRepoSetting)_upload.GetPathByModule("DB_LUCENE_INDEX").Object;
                    var luceneCategory = _context.EDMSCategorys.FirstOrDefault(x => x.CatCode == moduleObj.CatCode);
                    LuceneExtension.IndexFile(edmsReposCatFile.FileCode, fileUpload, luceneCategory.PathServerPhysic);

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
                    UpdateChangeCard(obj.CardCode);

                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                    msg.Object = edmsReposCatFile.Id;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_MSG_INVALID_FORMAT"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpGet]
        public EDMSRepoCatFile GetSuggestionsCardCodeFileRequest(string cardCode)
        {
            var query = _context.EDMSRepoCatFiles.Where(x => x.ObjectCode == cardCode && x.ObjectType == EnumHelper<CardEnum>.GetDisplayValue(CardEnum.ItemRequest)).MaxBy(x => x.Id);
            return query;
        }

        [HttpPost]
        public JsonResult GetCardFileRequest(int id)
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
                    msg.Title = String.Format(_stringLocalizerCJ["Tệp tin không tồn tại"]);//"Tệp tin không tồn tại!";
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
        #endregion

        #region File Item Result
        [HttpPost]
        [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
        [RequestSizeLimit(long.MaxValue)]
        public JsonResult InsertCardJobFileResult(EDMSRepoCatFileModel obj, IFormFile fileUpload)
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
                        var repoDefault = _context.EDMSRepoDefaultObjects.FirstOrDefault(x => !x.IsDeleted
                                && x.ObjectCode.Equals(obj.CardCode) && x.ObjectType.Equals(EnumHelper<CardEnum>.GetDisplayValue(CardEnum.ItemResult)));
                        if (repoDefault != null)
                        {
                            reposCode = repoDefault.ReposCode;
                            path = repoDefault.Path;
                            folderId = repoDefault.FolderId;
                            catCode = repoDefault.CatCode;
                        }
                        else
                        {
                            var setting = (EDMSCatRepoSetting)_upload.GetPathByModule(module_name).Object;
                            reposCode = setting.ReposCode;
                            catCode = setting.CatCode;
                            if (setting.Path == "")
                            {
                                host_type = 1;
                                path_upload_file = setting.FolderId;
                            }
                            else
                            {
                                host_type = 0;
                                path_upload_file = setting.Path;
                            }
                            path = host_type == 0 ? path_upload_file : "";
                            folderId = host_type == 1 ? path_upload_file : "";
                            //msg.Error = true;
                            //msg.Title = _sharedResources["COM_MSG_PLS_SETUP_FOLDER_DEFAULT"];
                            //return Json(msg);
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
                            var defaultSetting = (EDMSCatRepoSetting)_upload.GetPathByModule(module_name).Object;
                            reposCode = defaultSetting.ReposCode;
                            catCode = defaultSetting.CatCode;
                            if (defaultSetting.Path == "")
                            {
                                host_type = 1;
                                path_upload_file = defaultSetting.FolderId;
                            }
                            else
                            {
                                host_type = 0;
                                path_upload_file = defaultSetting.Path;
                            }
                            path = host_type == 0 ? path_upload_file : "";
                            folderId = host_type == 1 ? path_upload_file : "";
                            //msg.Error = true;
                            //msg.Title = _stringLocalizer["CJ_MSG_PLS_SELECT_FOLDER"];
                            //return Json(msg);
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
                        FileCode = string.Concat("WORK_RESULT_", Guid.NewGuid().ToString()),
                        ReposCode = reposCode,
                        CatCode = catCode,
                        ObjectCode = obj.CardCode,
                        ObjectType = EnumHelper<CardEnum>.GetDisplayValue(CardEnum.ItemResult),
                        Path = path,
                        FolderId = folderId
                    };
                    _context.EDMSRepoCatFiles.Add(edmsReposCatFile);

                    /// created Index lucene
                    var moduleObj = (EDMSCatRepoSetting)_upload.GetPathByModule("DB_LUCENE_INDEX").Object;
                    var luceneCategory = _context.EDMSCategorys.FirstOrDefault(x => x.CatCode == moduleObj.CatCode);
                    LuceneExtension.IndexFile(edmsReposCatFile.FileCode, fileUpload, luceneCategory.PathServerPhysic);

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
                    UpdateChangeCard(obj.CardCode);

                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                    msg.Object = edmsReposCatFile.Id;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_MSG_INVALID_FORMAT"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpGet]
        public EDMSRepoCatFile GetSuggestionsCardCodeFileResult(string cardCode)
        {
            var query = _context.EDMSRepoCatFiles.Where(x => x.ObjectCode == cardCode && x.ObjectType == EnumHelper<CardEnum>.GetDisplayValue(CardEnum.ItemResult)).MaxBy(x => x.Id);
            return query;
        }

        [HttpPost]
        public JsonResult GetCardFileResult(int id)
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
                    msg.Title = String.Format(_stringLocalizerCJ["Tệp tin không tồn tại"]);//"Tệp tin không tồn tại!";
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
        #endregion

        public class AutoShareFileModel
        {
            public int Id { get; set; }
            public string LstShare { get; set; }
        }

        public class JTableModelFile : JTableModel
        {
            public string ItemCode { get; set; }
            public string CardCode { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string CatCode { get; set; }
        }
        public class CardFileShareModel
        {
            public int? Id { get; set; }
            public string ListUserShare { get; set; }
        }
        public class ShareFilePermission
        {
            public string Code { get; set; }
            public string Name { get; set; }
            public string DepartmentName { get; set; }
            public PermissionFile Permission { get; set; }
            public int Id { get; set; }
        }
        public class UserShare
        {
            public string Code { get; set; }
            public string Name { get; set; }
            public string DepartmentName { get; set; }
            public PermissionFile Permission { get; set; }
        }

        #endregion

        #region Card new
        [HttpPost]
        public JsonResult InsertCardNew([FromBody] ModelCard obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var beginTime = !string.IsNullOrEmpty(obj.BeginTime) ? DateTime.ParseExact(obj.BeginTime, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture) : (DateTime?)null;
                var endTime = !string.IsNullOrEmpty(obj.EndTime) ? DateTime.ParseExact(obj.EndTime, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture) : (DateTime?)null;

                var cardSession = new CardSessionUser
                {
                    User = ESEIM.AppContext.UserName,
                    TimeStamp = DateTime.Now,
                    NewDataUpdate = false
                };
                var card = new LmsTask
                {
                    ListCode = obj.ListCode,
                    LmsTaskCode = "" + (_context.LmsTasks.Count() > 0 ? _context.LmsTasks.Max(x => x.Id) + 1 : 1),
                    LmsTaskName = obj.LmsTaskName,
                    BackgroundColor = obj.BackgroundColor,
                    BackgroundImage = obj.BackgroundImage,
                    BeginTime = beginTime.Value,
                    EndTime = endTime,
                    LmsTaskType = obj.LmsTaskType,
                    Status = obj.Status,
                    CreatedBy = ESEIM.AppContext.UserName,
                    CreatedDate = DateTime.Now,
                    Description = obj.Description,
                    ListItems = new List<LmsTaskItem>(),
                    ListUsers = new List<LmsTaskUser>(),
                    //ListUserView = ";" + ESEIM.AppContext.UserId,
                };
                _context.LmsTasks.Add(card);

                var comment = new LmsTaskCommentList()
                {
                    LmsTaskCode = card.LmsTaskCode,
                    CmtId = "Comment" + Guid.NewGuid().ToString(),
                    CmtContent = "Đã tạo công việc",
                    MemberId = ESEIM.AppContext.UserName,
                    CreatedTime = DateTime.Now
                };
                _context.LmsTaskCommentLists.Add(comment);

                _context.SaveChanges();
                msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                msg.Object = card.LmsTaskCode;
                //_cardService.UpdatePercentParentCard(card.LmsTaskCode);
                _context.SaveChanges();
            }
            catch (Exception ex)
            {
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Error = true;
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateCardNew([FromBody] ModelCard obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var card = _context.LmsTasks.FirstOrDefault(x => !x.IsDeleted && x.LmsTaskCode.Equals(obj.LmsTaskCode));
                if (card != null)
                {
                    if (obj.IsApprove == true)
                    {
                        var beginTime = !string.IsNullOrEmpty(obj.BeginTime) ? DateTime.ParseExact(obj.BeginTime, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture) : (DateTime?)null;
                        var deadLine = DateTime.Now;
                        var endTime = !string.IsNullOrEmpty(obj.EndTime) ? DateTime.ParseExact(obj.EndTime, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture) : (DateTime?)null;

                        if (card.BeginTime != beginTime)
                        {
                            var activity = new LmsTaskStudentAssign
                            {
                                UserId = ESEIM.AppContext.UserId,
                                Action = "UPDATE",
                                IdObject = "ITEMCHECK",
                                IsCheck = true,
                                LmsTaskCode = card.LmsTaskCode,
                                CreatedTime = DateTime.Now,
                                FromDevice = "Laptop/Desktop",
                                ChangeDetails = "Ngày bắt đầu từ " + card.BeginTime != null ? card.BeginTime.ToString("dd/MM/yyyy") : "trống" + " sang " + beginTime != null ? beginTime.Value.ToString("dd/MM/yyyy") : "trống"
                            };
                            _context.LmsTaskStudentAssigns.Add(activity);
                        }
                        if (card.LmsTaskName != obj.LmsTaskName)
                        {
                            var activity = new LmsTaskStudentAssign
                            {
                                UserId = ESEIM.AppContext.UserId,
                                Action = "UPDATE",
                                IdObject = "ITEMWORK",
                                IsCheck = true,
                                LmsTaskCode = card.LmsTaskCode,
                                CreatedTime = DateTime.Now,
                                FromDevice = "Laptop/Desktop",
                                ChangeDetails = "Tên thẻ việc từ [" + card.LmsTaskName + "] sang [" + obj.LmsTaskName + "]"
                            };
                            _context.LmsTaskStudentAssigns.Add(activity);
                        }
                        if (card.EndTime != endTime)
                        {
                            var activity = new LmsTaskStudentAssign
                            {
                                UserId = ESEIM.AppContext.UserId,
                                Action = "UPDATE",
                                IdObject = "ITEMWORK",
                                IsCheck = true,
                                LmsTaskCode = card.LmsTaskCode,
                                CreatedTime = DateTime.Now,
                                FromDevice = "Laptop/Desktop",
                                ChangeDetails = card.EndTime.HasValue ? "Ngày kết thúc từ " + card.EndTime.Value.ToString("dd/MM/yyyy") + " sang " + (endTime.HasValue ? endTime.Value.ToString("dd/MM/yyyy") : "trống") : "Ngày kết thúc " + (endTime.HasValue ? endTime.Value.ToString("dd/MM/yyyy") : "trống")
                            };
                            _context.LmsTaskStudentAssigns.Add(activity);
                        }
                        if (card.Description != obj.Description)
                        {
                            var activity = new LmsTaskStudentAssign
                            {
                                UserId = ESEIM.AppContext.UserId,
                                Action = "UPDATE",
                                IdObject = "DESCRIPTION",
                                IsCheck = true,
                                LmsTaskCode = card.LmsTaskCode,
                                CreatedTime = DateTime.Now,
                                FromDevice = "Laptop/Desktop",
                                ChangeDetails = !string.IsNullOrEmpty(card.Description) ? "Mô tả từ " + card.Description + " sang " + obj.Description : "Thêm mới mô tả " + obj.Description
                            };
                            _context.LmsTaskStudentAssigns.Add(activity);
                        }
                        if (card.LmsTaskType != obj.LmsTaskType)
                        {
                            var activity = new LmsTaskStudentAssign
                            {
                                UserId = ESEIM.AppContext.UserId,
                                Action = "UPDATE",
                                IdObject = "ITEMWORK",
                                IsCheck = true,
                                LmsTaskCode = card.LmsTaskCode,
                                CreatedTime = DateTime.Now,
                                FromDevice = "Laptop/Desktop",
                                ChangeDetails = !string.IsNullOrEmpty(card.LmsTaskType) ? "Kiểu công việc từ " + (_context.CommonSettings.FirstOrDefault(x => x.CodeSet == card.LmsTaskType && !x.IsDeleted) != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet == card.LmsTaskType && !x.IsDeleted).ValueSet : "")
                        + " sang " + (_context.CommonSettings.FirstOrDefault(x => x.CodeSet == obj.LmsTaskType && !x.IsDeleted) != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet == obj.LmsTaskType && !x.IsDeleted).ValueSet : "") : "Thêm mới kiểu công việc " + _context.CommonSettings.FirstOrDefault(x => x.CodeSet == obj.LmsTaskType && !x.IsDeleted).ValueSet
                            };
                            _context.LmsTaskStudentAssigns.Add(activity);
                        }
                        if (card.Status != obj.Status)
                        {
                            var activity = new LmsTaskStudentAssign
                            {
                                UserId = ESEIM.AppContext.UserId,
                                Action = "UPDATE",
                                IdObject = "ITEMWORK",
                                IsCheck = true,
                                LmsTaskCode = card.LmsTaskCode,
                                CreatedTime = DateTime.Now,
                                FromDevice = "Laptop/Desktop",
                                ChangeDetails = "Trạng thái từ " + (_context.CommonSettings.FirstOrDefault(x => x.CodeSet == card.Status && !x.IsDeleted) != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet == card.Status && !x.IsDeleted).ValueSet : "")
                                + " sang " + _context.CommonSettings.FirstOrDefault(x => x.CodeSet == obj.Status && !x.IsDeleted).ValueSet
                            };
                            _context.LmsTaskStudentAssigns.Add(activity);
                        }

                        card.LmsTaskName = obj.LmsTaskName;
                        card.BeginTime = beginTime.Value;
                        card.EndTime = endTime;
                        card.Status = obj.Status;
                        card.LmsTaskType = obj.LmsTaskType;
                        card.BackgroundColor = obj.BackgroundColor;
                        card.BackgroundImage = obj.BackgroundImage;
                        card.ListCode = obj.ListCode;
                        card.Description = obj.Description;
                        //card.LockShare = "";
                        card.UpdatedBy = ESEIM.AppContext.UserName;
                        card.UpdatedTime = DateTime.Now;
                        //_cardService.UpdatePercentParentCard(card.LmsTaskCode);
                        UpdateChangeCard(card.LmsTaskCode);
                        _context.SaveChanges();
                        msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                    }
                    else
                    {
                        if (card.Description != obj.Description)
                        {
                            var activity = new LmsTaskStudentAssign
                            {
                                UserId = ESEIM.AppContext.UserId,
                                Action = "UPDATE",
                                IdObject = "DESCRIPTION",
                                IsCheck = true,
                                LmsTaskCode = card.LmsTaskCode,
                                CreatedTime = DateTime.Now,
                                FromDevice = "Laptop/Desktop",
                                ChangeDetails = !string.IsNullOrEmpty(card.Description) ? "Mô tả từ " + card.Description + " sang " + obj.Description : "Thêm mới mô tả " + obj.Description
                            };
                            _context.LmsTaskStudentAssigns.Add(activity);
                        }
                        //card.LockShare = "";
                        card.Description = obj.Description;
                        _context.SaveChanges();
                        msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Không tìm thấy thẻ việc";
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
        public object GetListDefault(string boardCode)
        {
            var listCode = "";
            var boardSelect = "";
            var noInfo = false;

            if (!string.IsNullOrEmpty(boardCode))
            {
                var list = _context.LmsListTasks.Where(x => !x.IsDeleted && x.BoardCode.Equals(boardCode));
                if (list.Any())
                {
                    var card = _context.LmsTasks.Where(x => !x.IsDeleted && x.Status != "TRASH"
                                && list.Any(k => k.ListCode.Equals(x.ListCode))).MaxBy(x => x.Id);
                    if (card != null)
                    {
                        listCode = card.ListCode;
                        boardSelect = boardCode;
                    }
                    else
                    {
                        listCode = list.FirstOrDefault().ListCode;
                        boardSelect = boardCode;
                    }
                }
                else
                {
                    noInfo = true;
                }
            }
            else
            {
                var card = _context.LmsTasks.Where(x => !x.IsDeleted && x.Status != "TRASH").MaxBy(x => x.Id);
                if (card != null)
                {
                    var list = _context.LmsListTasks.FirstOrDefault(x => !x.IsDeleted && x.ListCode.Equals(card.ListCode));
                    if (list != null)
                    {
                        var board = _context.LmsBoardTasks.FirstOrDefault(x => !x.IsDeleted && x.BoardCode.Equals(list.BoardCode));
                        if (board != null)
                        {
                            listCode = card.ListCode;
                            boardSelect = board.BoardCode;
                        }
                    }
                }
                else
                {
                    noInfo = true;
                }
            }

            if (noInfo)
            {
                var info = (from a in _context.LmsListTasks.Where(x => !x.IsDeleted)
                            join b in _context.LmsBoardTasks.Where(x => !x.IsDeleted) on a.BoardCode equals b.BoardCode
                            select new
                            {
                                a.BoardCode,
                                a.ListCode
                            }).FirstOrDefault();
                if (info != null)
                {
                    boardSelect = info.BoardCode;
                    listCode = info.ListCode;
                }
            }
            return new
            {
                BoardCode = boardSelect,
                ListCode = listCode
            };
        }

        [HttpPost]
        public void InsertJcRela([FromBody] ModelRela listRela)
        {
            var jcRela = _context.JcObjectIdRelatives.Where(x => !x.IsDeleted && x.CardCode.Equals(listRela.CardCode));
            foreach (var item in jcRela)
            {
                item.IsDeleted = true;
                item.DeletedBy = ESEIM.AppContext.UserName;
                item.DeletedTime = DateTime.Now;
                _context.JcObjectIdRelatives.Update(item);
            }

            if (listRela.ListRela.Count > 0)
            {
                foreach (var item in listRela.ListRela)
                {
                    var check = _context.JcObjectIdRelatives.FirstOrDefault(x => !x.IsDeleted
                        && x.ObjTypeCode.Equals(item.ObjTypeCode) && x.ObjID.Equals(item.ObjID) && x.CardCode.Equals(listRela.CardCode));
                    if (check != null)
                    {
                        check.Weight = item.Weight;
                        _context.JcObjectIdRelatives.Update(check);
                    }
                    else
                    {
                        var jc = new JcObjectIdRelative
                        {
                            CardCode = listRela.CardCode,
                            ObjID = item.ObjID,
                            ObjTypeCode = item.ObjTypeCode,
                            Weight = item.Weight,
                            Relative = item.RelativeCode,
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now,
                        };
                        _context.JcObjectIdRelatives.Add(jc);
                    }
                }
            }
            _context.SaveChanges();
        }

        [HttpPost]
        public void InsertCardSuggestion(string cardCode)
        {
            var card = _context.LmsTasks.FirstOrDefault(x => !x.IsDeleted && x.Status != "TRASH" && x.LmsTaskCode.Equals(cardCode));
            if (card != null)
            {
                var user = _context.Users.FirstOrDefault(x => x.Active && x.UserName.Equals(ESEIM.AppContext.UserName));
                var cards = _context.LmsTasks.Where(x => !x.IsDeleted && x.ListCode.Equals(card.ListCode)
                                && x.CreatedBy.Equals(ESEIM.AppContext.UserName) && x.Status != "TRASH" && x.Id != card.Id)
                                ;
                var cardSuggest = cards.MaxBy(x => x.Id);
                if (cardSuggest != null)
                {
                    var json = new List<JobCardAssignee>();
                    var addLeader = new JobCardAssignee
                    {
                        CardCode = card.LmsTaskCode,
                        UserId = ESEIM.AppContext.UserId,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now,
                        Role = "ROLE_LEADER",
                        DepartmentCode = user != null ? !string.IsNullOrEmpty(user.DepartmentId) ? user.DepartmentId : "" : "",
                        GroupCode = "",
                        Item = "",
                        Approve = true,
                        ApproveTime = DateTime.Now,
                        Status = "ASSIGN_STATUS_WORK",
                        Branch = !string.IsNullOrEmpty(user.BranchId) ? user.BranchId : ""
                    };
                    _context.JobCardAssignees.Add(addLeader);
                    json.Add(addLeader);

                    var suggestAssign = _context.JobCardAssignees.Where(x => !x.IsDeleted && x.CardCode.Equals(cardSuggest.LmsTaskCode));
                    var listUserNotify = new List<UserNotify>();
                    foreach (var item in suggestAssign)
                    {
                        if (item.UserId != ESEIM.AppContext.UserId)
                        {
                            card.LmsUserList += item.UserId + ",";
                            var assignee = new JobCardAssignee
                            {
                                CardCode = card.LmsTaskCode,
                                UserId = item.UserId,
                                DepartmentCode = item.DepartmentCode,
                                GroupCode = item.GroupCode,
                                Role = item.Role,
                                CreatedBy = ESEIM.AppContext.UserName,
                                CreatedTime = DateTime.Now,
                                Item = item.Item,
                                Approve = true,
                                ApproveTime = DateTime.Now,
                                Status = item.Status,
                                Branch = item.Branch
                            };
                            _context.JobCardAssignees.Add(assignee);
                            json.Add(assignee);

                            //Add user to Notification
                            var userNotify = new UserNotify
                            {
                                UserId = item.UserId
                            };

                            if (!listUserNotify.Any(p => p.UserId.Equals(userNotify.UserId)) && !userNotify.UserId.Equals(ESEIM.AppContext.UserId))
                                listUserNotify.Add(userNotify);
                        }
                    }

                    if (listUserNotify.Count > 0)
                    {
                        var notification = new NotificationManager
                        {
                            ListUser = listUserNotify,
                            Title = string.Format("{0} đã tạo 1 thẻ việc mới: #{1} {2}", user.GivenName, card.LmsTaskCode, card.LmsTaskName),
                            ObjCode = card.LmsTaskCode,
                            ObjType = EnumHelper<NotificationType>.GetDisplayValue(NotificationType.CardJob),
                        };

                        InsertNotification(notification);
                    }

                    card.LmsUserList += ESEIM.AppContext.UserId + ",";

                    var jcSuggest = _context.JcObjectIdRelatives.Where(x => !x.IsDeleted && x.CardCode.Equals(cardSuggest.LmsTaskCode));
                    foreach (var item in jcSuggest)
                    {
                        var rela = new JcObjectIdRelative
                        {
                            CardCode = card.LmsTaskCode,
                            ObjTypeCode = item.ObjTypeCode,
                            ObjID = item.ObjID,
                            Relative = item.Relative,
                            CreatedBy = ESEIM.AppContext.UserName
,
                            CreatedTime = DateTime.Now,
                            Weight = 0
                        };
                        _context.JcObjectIdRelatives.Add(rela);
                    }
                    _context.SaveChanges();
                }
            }
        }

        public class ModelCard
        {
            public string LmsTaskCode { get; set; }
            public string LmsTaskName { get; set; }
            public string BackgroundColor { get; set; }
            public string BackgroundImage { get; set; }
            public string BeginTime { get; set; }
            public string Deadline { get; set; }
            public string EndTime { get; set; }
            public string Status { get; set; }
            public string CardLevel { get; set; }
            public string LmsTaskType { get; set; }
            public string WeightNum { get; set; }
            public decimal? Completed { get; set; }
            public string Cost { get; set; }
            public string Currency { get; set; }
            public string ListCode { get; set; }
            public string Description { get; set; }
            public string CreatedBy { get; set; }
            public string ListUserView { get; set; }
            public string Inherit { get; set; }
            public bool? IsApprove { get; set; }
        }
        public class ModelRela
        {
            public ModelRela()
            {
                ListRela = new List<JcObjectRela>();
            }
            public string CardCode { get; set; }
            public List<JcObjectRela> ListRela { get; set; }
        }
        public class JcObjectRela
        {
            public int ID { get; set; }
            public string ObjID { get; set; }
            public string ObjName { get; set; }
            public string ObjTypeCode { get; set; }
            public string ObjTypeName { get; set; }
            public string RelativeCode { get; set; }
            public string RelativeName { get; set; }
            public decimal? Weight { get; set; }
        }
        #endregion

        #region Reason reject in card
        [HttpPost]
        public JsonResult RejectCard([FromBody] RejectCardModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var actionText = EnumHelper<CardAction>.GetDisplayValue(CardAction.Reject);
                var activity = new LmsTaskStudentAssign
                {
                    UserId = ESEIM.AppContext.UserId,
                    LmsTaskCode = obj.CardCode,
                    Action = actionText,
                    IsCheck = true,
                    FromDevice = "Laptop/Desktop",
                    CreatedTime = DateTime.Now,
                    ChangeDetails = obj.ChangeDetails
                };
                _context.LmsTaskStudentAssigns.Add(activity);
                _context.SaveChanges();
                msg.Title = "Thêm lý do thành công";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetReasonRejectUser(string cardCode)
        {
            var reason = "";
            var check = _context.LmsTaskStudentAssigns.Where(x => x.Action.Equals("REJECT")
                    && x.UserId.Equals(ESEIM.AppContext.UserId)).MaxBy(x => x.Id);
            if (check != null)
            {
                reason = !string.IsNullOrEmpty(check.ChangeDetails) ? check.ChangeDetails : "";
            }
            return Json(reason);
        }

        public class RejectCardModel
        {
            public string CardCode { get; set; }
            public string Value { get; set; }
            public string ChangeDetails { get; set; }
        }
        #endregion

        #region Update card realtime
        [HttpPost]
        public JsonResult UpdateCardNameReal(string cardCode, string cardName)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var card = _context.LmsTasks.FirstOrDefault(x => !x.IsDeleted && x.LmsTaskCode.Equals(cardCode));
                if (card != null)
                {
                    var lstSession = new List<CardSessionUser>();
                    if (!string.IsNullOrEmpty(card.LockShare))
                    {
                        lstSession = JsonConvert.DeserializeObject<List<CardSessionUser>>(card.LockShare);
                        var isExist = false;
                        foreach (var item in lstSession)
                        {
                            if (item.User == ESEIM.AppContext.UserName)
                            {
                                item.NewDataUpdate = false;
                                isExist = true;
                            }
                            else
                            {
                                item.NewDataUpdate = true;
                            }

                            item.TimeStamp = DateTime.Now;
                        }
                        if (!isExist)
                        {
                            var cardSession = new CardSessionUser
                            {
                                User = ESEIM.AppContext.UserName,
                                TimeStamp = DateTime.Now,
                                NewDataUpdate = false
                            };
                            lstSession.Add(cardSession);
                        }
                    }
                    else
                    {
                        var cardSession = new CardSessionUser
                        {
                            User = ESEIM.AppContext.UserName,
                            TimeStamp = DateTime.Now,
                            NewDataUpdate = false
                        };
                        lstSession.Add(cardSession);
                    }
                    var activity = new LmsTaskStudentAssign
                    {
                        UserId = ESEIM.AppContext.UserId,
                        Action = "UPDATE",
                        IdObject = "ITEMWORK",
                        IsCheck = true,
                        LmsTaskCode = card.LmsTaskCode,
                        CreatedTime = DateTime.Now,
                        FromDevice = "Laptop/Desktop",
                        ChangeDetails = "Tên thẻ việc từ [" + card.LmsTaskName + "] sang [" + cardName + "]"
                    };
                    _context.LmsTaskStudentAssigns.Add(activity);

                    card.LmsTaskName = cardName;
                    //card.LockShare = JsonConvert.SerializeObject(lstSession);

                    _context.SaveChanges();
                    msg.Title = "Cập nhật tên thẻ việc thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Không tìm thấy bản ghi";
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
        public JsonResult UpdateCardColorReal(string cardCode, string backgroundColor)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var card = _context.LmsTasks.FirstOrDefault(x => !x.IsDeleted && x.LmsTaskCode.Equals(cardCode));
                if (card != null)
                {
                    var lstSession = new List<CardSessionUser>();
                    if (!string.IsNullOrEmpty(card.LockShare))
                    {
                        lstSession = JsonConvert.DeserializeObject<List<CardSessionUser>>(card.LockShare);
                        var isExist = false;
                        foreach (var item in lstSession)
                        {
                            if (item.User == ESEIM.AppContext.UserName)
                            {
                                item.NewDataUpdate = false;
                                isExist = true;
                            }
                            else
                            {
                                item.NewDataUpdate = true;
                            }

                            item.TimeStamp = DateTime.Now;
                        }
                        if (!isExist)
                        {
                            var cardSession = new CardSessionUser
                            {
                                User = ESEIM.AppContext.UserName,
                                TimeStamp = DateTime.Now,
                                NewDataUpdate = false
                            };
                            lstSession.Add(cardSession);
                        }
                    }
                    else
                    {
                        var cardSession = new CardSessionUser
                        {
                            User = ESEIM.AppContext.UserName,
                            TimeStamp = DateTime.Now,
                            NewDataUpdate = false
                        };
                        lstSession.Add(cardSession);
                    }
                    var activity = new LmsTaskStudentAssign
                    {
                        UserId = ESEIM.AppContext.UserId,
                        Action = "UPDATE",
                        IdObject = "ITEMWORK",
                        IsCheck = true,
                        LmsTaskCode = card.LmsTaskCode,
                        CreatedTime = DateTime.Now,
                        FromDevice = "Laptop/Desktop",
                        ChangeDetails = "Màu thẻ việc từ [" + card.BackgroundColor + "] sang [" + backgroundColor + "]"
                    };
                    _context.LmsTaskStudentAssigns.Add(activity);

                    card.BackgroundColor = backgroundColor;
                    //card.LockShare = JsonConvert.SerializeObject(lstSession);

                    _context.SaveChanges();
                    msg.Title = "Cập nhật màu thẻ việc thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Không tìm thấy bản ghi";
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
        public JsonResult UpdateCardBegintimeReal(string cardCode, string beginTime)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                if (string.IsNullOrEmpty(beginTime))
                {
                    msg.Error = true;
                    msg.Title = "Vui lòng chọn ngày bắt đầu";
                    return Json(msg);
                }
                var time = DateTime.ParseExact(beginTime, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture);
                var card = _context.LmsTasks.FirstOrDefault(x => !x.IsDeleted && x.LmsTaskCode.Equals(cardCode));
                if (card != null)
                {
                    var lstSession = new List<CardSessionUser>();
                    if (!string.IsNullOrEmpty(card.LockShare))
                    {
                        lstSession = JsonConvert.DeserializeObject<List<CardSessionUser>>(card.LockShare);
                        var isExist = false;
                        foreach (var item in lstSession)
                        {
                            if (item.User == ESEIM.AppContext.UserName)
                            {
                                item.NewDataUpdate = false;
                                isExist = true;
                            }
                            else
                            {
                                item.NewDataUpdate = true;
                            }

                            item.TimeStamp = DateTime.Now;
                        }
                        if (!isExist)
                        {
                            var cardSession = new CardSessionUser
                            {
                                User = ESEIM.AppContext.UserName,
                                TimeStamp = DateTime.Now,
                                NewDataUpdate = false
                            };
                            lstSession.Add(cardSession);
                        }
                    }
                    else
                    {
                        var cardSession = new CardSessionUser
                        {
                            User = ESEIM.AppContext.UserName,
                            TimeStamp = DateTime.Now,
                            NewDataUpdate = false
                        };
                        lstSession.Add(cardSession);
                    }
                    card.LockShare = JsonConvert.SerializeObject(lstSession);
                    var activity = new LmsTaskStudentAssign
                    {
                        UserId = ESEIM.AppContext.UserId,
                        Action = "UPDATE",
                        IdObject = "ITEMWORK",
                        IsCheck = true,
                        LmsTaskCode = card.LmsTaskCode,
                        CreatedTime = DateTime.Now,
                        FromDevice = "Laptop/Desktop",
                        ChangeDetails = "Ngày bắt đầu từ [" + card.BeginTime.ToString("dd/MM/yyyy HH:mm") + "] sang [" + beginTime + "]"
                    };
                    _context.LmsTaskStudentAssigns.Add(activity);

                    card.BeginTime = time;
                    _context.SaveChanges();
                    msg.Title = "Cập nhật ngày bắt đầu thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Không tìm thấy bản ghi";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Vui lòng nhập đúng định dạng dd/MM/yyyy HH:mm";
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateCardEndtimeReal(string cardCode, string endtime)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var time = !string.IsNullOrEmpty(endtime) ? DateTime.ParseExact(endtime, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture) : (DateTime?)null;
                var card = _context.LmsTasks.FirstOrDefault(x => !x.IsDeleted && x.LmsTaskCode.Equals(cardCode));
                if (card != null)
                {
                    var lstSession = new List<CardSessionUser>();
                    if (!string.IsNullOrEmpty(card.LockShare))
                    {
                        lstSession = JsonConvert.DeserializeObject<List<CardSessionUser>>(card.LockShare);
                        var isExist = false;
                        foreach (var item in lstSession)
                        {
                            if (item.User == ESEIM.AppContext.UserName)
                            {
                                item.NewDataUpdate = false;
                                isExist = true;
                            }
                            else
                            {
                                item.NewDataUpdate = true;
                            }

                            item.TimeStamp = DateTime.Now;
                        }
                        if (!isExist)
                        {
                            var cardSession = new CardSessionUser
                            {
                                User = ESEIM.AppContext.UserName,
                                TimeStamp = DateTime.Now,
                                NewDataUpdate = false
                            };
                            lstSession.Add(cardSession);
                        }
                    }
                    else
                    {
                        var cardSession = new CardSessionUser
                        {
                            User = ESEIM.AppContext.UserName,
                            TimeStamp = DateTime.Now,
                            NewDataUpdate = false
                        };
                        lstSession.Add(cardSession);
                    }
                    var activity = new LmsTaskStudentAssign
                    {
                        UserId = ESEIM.AppContext.UserId,
                        Action = "UPDATE",
                        IdObject = "ITEMWORK",
                        IsCheck = true,
                        LmsTaskCode = card.LmsTaskCode,
                        CreatedTime = DateTime.Now,
                        FromDevice = "Laptop/Desktop",
                        ChangeDetails = "Ngày hoàn thành từ [" + (card.EndTime.HasValue ? card.EndTime.Value.ToString("dd/MM/yyyy HH:mm") : "Trống") + "] sang [" + endtime + "]"
                    };
                    _context.LmsTaskStudentAssigns.Add(activity);

                    card.EndTime = time;
                    //card.LockShare = JsonConvert.SerializeObject(lstSession);
                    _context.SaveChanges();
                    msg.Title = "Cập nhật ngày hoàn thành thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Không tìm thấy bản ghi";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Vui lòng nhập đúng định dạng dd/MM/yyyy HH:mm";
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateCardStatusReal(string cardCode, string status)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var card = _context.LmsTasks.FirstOrDefault(x => !x.IsDeleted && x.LmsTaskCode.Equals(cardCode));
                if (card != null)
                {
                    var lstSession = new List<CardSessionUser>();
                    if (!string.IsNullOrEmpty(card.LockShare))
                    {
                        lstSession = JsonConvert.DeserializeObject<List<CardSessionUser>>(card.LockShare);
                        var isExist = false;
                        foreach (var item in lstSession)
                        {
                            if (item.User == ESEIM.AppContext.UserName)
                            {
                                item.NewDataUpdate = false;
                                isExist = true;
                            }
                            else
                            {
                                item.NewDataUpdate = true;
                            }

                            item.TimeStamp = DateTime.Now;
                        }
                        if (!isExist)
                        {
                            var cardSession = new CardSessionUser
                            {
                                User = ESEIM.AppContext.UserName,
                                TimeStamp = DateTime.Now,
                                NewDataUpdate = false
                            };
                            lstSession.Add(cardSession);
                        }
                    }
                    else
                    {
                        var cardSession = new CardSessionUser
                        {
                            User = ESEIM.AppContext.UserName,
                            TimeStamp = DateTime.Now,
                            NewDataUpdate = false
                        };
                        lstSession.Add(cardSession);
                    }

                    var common = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(card.Status));
                    var commonNew = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(status));

                    var activity = new LmsTaskStudentAssign
                    {
                        UserId = ESEIM.AppContext.UserId,
                        Action = "UPDATE",
                        IdObject = "ITEMWORK",
                        IsCheck = true,
                        LmsTaskCode = card.LmsTaskCode,
                        CreatedTime = DateTime.Now,
                        FromDevice = "Laptop/Desktop",
                        ChangeDetails = "Trạng thái từ [" + (common != null ? common.ValueSet : "Trống")
                            + "] sang [" + (commonNew != null ? commonNew.ValueSet : "") + "]"
                    };
                    _context.LmsTaskStudentAssigns.Add(activity);

                    card.Status = status;
                    //card.LockShare = JsonConvert.SerializeObject(lstSession);
                    _context.SaveChanges();
                    msg.Title = "Cập nhật trạng thái thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Không tìm thấy bản ghi";
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
        public JsonResult UpdateCardWorkTypeReal(string cardCode, string worktype)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var card = _context.LmsTasks.FirstOrDefault(x => !x.IsDeleted && x.LmsTaskCode.Equals(cardCode));
                if (card != null)
                {
                    var lstSession = new List<CardSessionUser>();
                    if (!string.IsNullOrEmpty(card.LockShare))
                    {
                        lstSession = JsonConvert.DeserializeObject<List<CardSessionUser>>(card.LockShare);
                        var isExist = false;
                        foreach (var item in lstSession)
                        {
                            if (item.User == ESEIM.AppContext.UserName)
                            {
                                item.NewDataUpdate = false;
                                isExist = true;
                            }
                            else
                            {
                                item.NewDataUpdate = true;
                            }

                            item.TimeStamp = DateTime.Now;
                        }
                        if (!isExist)
                        {
                            var cardSession = new CardSessionUser
                            {
                                User = ESEIM.AppContext.UserName,
                                TimeStamp = DateTime.Now,
                                NewDataUpdate = false
                            };
                            lstSession.Add(cardSession);
                        }
                    }
                    else
                    {
                        var cardSession = new CardSessionUser
                        {
                            User = ESEIM.AppContext.UserName,
                            TimeStamp = DateTime.Now,
                            NewDataUpdate = false
                        };
                        lstSession.Add(cardSession);
                    }

                    var commonNew = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(worktype));
                    var workType = "";
                    if (!string.IsNullOrEmpty(card.LmsTaskType))
                    {
                        var common = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(card.LmsTaskType));
                        workType = common != null ? common.ValueSet : "";
                    }

                    var activity = new LmsTaskStudentAssign
                    {
                        UserId = ESEIM.AppContext.UserId,
                        Action = "UPDATE",
                        IdObject = "ITEMWORK",
                        IsCheck = true,
                        LmsTaskCode = card.LmsTaskCode,
                        CreatedTime = DateTime.Now,
                        FromDevice = "Laptop/Desktop",
                        ChangeDetails = "Kiểu công việc từ [" + workType
                            + "] sang [" + (commonNew != null ? commonNew.ValueSet : "") + "]"
                    };
                    _context.LmsTaskStudentAssigns.Add(activity);

                    card.LmsTaskType = worktype;
                    //card.LockShare = JsonConvert.SerializeObject(lstSession);
                    _context.SaveChanges();
                    msg.Title = "Cập nhật kiểu công việc thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Không tìm thấy bản ghi";
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
        public JsonResult UpdateDescriptionReal([FromBody] CardDesCription obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var card = _context.LmsTasks.FirstOrDefault(x => !x.IsDeleted && x.LmsTaskCode.Equals(obj.CardCode));
                if (card != null)
                {
                    var lstSession = new List<CardSessionUser>();
                    if (!string.IsNullOrEmpty(card.LockShare))
                    {
                        lstSession = JsonConvert.DeserializeObject<List<CardSessionUser>>(card.LockShare);
                        var isExist = false;
                        foreach (var item in lstSession)
                        {
                            if (item.User == ESEIM.AppContext.UserName)
                            {
                                item.NewDataUpdate = false;
                                isExist = true;
                            }
                            else
                            {
                                item.NewDataUpdate = true;
                            }

                            item.TimeStamp = DateTime.Now;
                        }
                        if (!isExist)
                        {
                            var cardSession = new CardSessionUser
                            {
                                User = ESEIM.AppContext.UserName,
                                TimeStamp = DateTime.Now,
                                NewDataUpdate = false
                            };
                            lstSession.Add(cardSession);
                        }
                    }
                    else
                    {
                        var cardSession = new CardSessionUser
                        {
                            User = ESEIM.AppContext.UserName,
                            TimeStamp = DateTime.Now,
                            NewDataUpdate = false
                        };
                        lstSession.Add(cardSession);
                    }
                    var activity = new LmsTaskStudentAssign
                    {
                        UserId = ESEIM.AppContext.UserId,
                        Action = "UPDATE",
                        IdObject = "DESCRIPTION",
                        IsCheck = true,
                        LmsTaskCode = card.LmsTaskCode,
                        CreatedTime = DateTime.Now,
                        FromDevice = "Laptop/Desktop",
                        ChangeDetails = "Mô tả từ [" + card.Description + "] sang [" + obj.Description + "]"
                    };
                    _context.LmsTaskStudentAssigns.Add(activity);

                    card.Description = obj.Description;
                    //card.LockShare = JsonConvert.SerializeObject(lstSession);
                    _context.SaveChanges();
                    msg.Title = "Cập nhật mô tả thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Không tìm thấy bản ghi";
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
        public JsonResult UpdateListReal(string cardCode, string listCode)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var card = _context.LmsTasks.FirstOrDefault(x => !x.IsDeleted && x.LmsTaskCode.Equals(cardCode));

                if (card != null)
                {
                    var lstSession = new List<CardSessionUser>();
                    if (!string.IsNullOrEmpty(card.LockShare))
                    {
                        lstSession = JsonConvert.DeserializeObject<List<CardSessionUser>>(card.LockShare);
                        var isExist = false;
                        foreach (var item in lstSession)
                        {
                            if (item.User == ESEIM.AppContext.UserName)
                            {
                                item.NewDataUpdate = false;
                                isExist = true;
                            }
                            else
                            {
                                item.NewDataUpdate = true;
                            }

                            item.TimeStamp = DateTime.Now;
                        }
                        if (!isExist)
                        {
                            var cardSession = new CardSessionUser
                            {
                                User = ESEIM.AppContext.UserName,
                                TimeStamp = DateTime.Now,
                                NewDataUpdate = false
                            };
                            lstSession.Add(cardSession);
                        }
                    }
                    else
                    {
                        var cardSession = new CardSessionUser
                        {
                            User = ESEIM.AppContext.UserName,
                            TimeStamp = DateTime.Now,
                            NewDataUpdate = false
                        };
                        lstSession.Add(cardSession);
                    }

                    var activity = new LmsTaskStudentAssign
                    {
                        UserId = ESEIM.AppContext.UserId,
                        Action = "UPDATE",
                        IdObject = "ITEMWORK",
                        IsCheck = true,
                        LmsTaskCode = card.LmsTaskCode,
                        CreatedTime = DateTime.Now,
                        FromDevice = "Laptop/Desktop",
                        ChangeDetails = "Danh mục công việc từ [" + _context.LmsListTasks.FirstOrDefault(x => !x.IsDeleted && x.ListCode.Equals(card.ListCode)).ListName ?? ""
                            + "] sang [" + (_context.LmsListTasks.FirstOrDefault(x => !x.IsDeleted && x.ListCode.Equals(listCode)).ListName ?? "") + "]"
                    };

                    _context.LmsTaskStudentAssigns.Add(activity);

                    card.ListCode = listCode;
                    //card.LockShare = JsonConvert.SerializeObject(lstSession);
                    _context.SaveChanges();
                    msg.Title = "Cập nhật danh mục công việc thành công";
                    //msg.Object = //_cardService.UpdatePercentParentCard(card.LmsTaskCode);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Không tìm thấy bản ghi";
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
        public bool IsUpdateNewData(string cardCode, string timeUpdate)
        {
            DateTime? timeUpdateDt = !string.IsNullOrEmpty(timeUpdate)
                ? DateTime.ParseExact(timeUpdate, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture): (DateTime?)null;
            bool isUpdate = false;
            var card = _context.LmsTasks.FirstOrDefault(x => x.LmsTaskCode.Equals(cardCode) && !x.IsDeleted);
            if (card != null)
            {
                if (!string.IsNullOrEmpty(card.LockShare))
                {
                    var lst = JsonConvert.DeserializeObject<List<CardSessionUser>>(card.LockShare);
                    foreach (var item in lst)
                    {
                        if (!string.IsNullOrEmpty(item.User) && item.User.Equals(ESEIM.AppContext.UserName))
                        {
                            isUpdate = item.NewDataUpdate || (timeUpdateDt.HasValue && item.TimeStamp > timeUpdateDt.Value);
                            if (isUpdate)
                            {
                                item.NewDataUpdate = false;
                                card.LockShare = JsonConvert.SerializeObject(lst);
                                _context.SaveChanges();
                            }
                            break;
                        }
                    }
                }
            }
            return isUpdate;
        }
        [NonAction]
        private void UpdateChangeCard(string cardCode)
        {
            var card = _context.LmsTasks.FirstOrDefault(x => !x.IsDeleted && x.LmsTaskCode.Equals(cardCode));
            if (card != null)
            {
                var lstSession = new List<CardSessionUser>();
                if (!string.IsNullOrEmpty(card.LockShare))
                {
                    lstSession = JsonConvert.DeserializeObject<List<CardSessionUser>>(card.LockShare);
                    var isExist = false;
                    foreach (var item in lstSession)
                    {
                        if (item.User == ESEIM.AppContext.UserName)
                        {
                            item.NewDataUpdate = false;
                            isExist = true;
                        }
                        else
                        {
                            item.NewDataUpdate = true;
                        }

                        item.TimeStamp = DateTime.Now;
                    }
                    if (!isExist)
                    {
                        var cardSession = new CardSessionUser
                        {
                            User = ESEIM.AppContext.UserName,
                            TimeStamp = DateTime.Now,
                            NewDataUpdate = false
                        };
                        lstSession.Add(cardSession);
                    }
                }
                else
                {
                    var cardSession = new CardSessionUser
                    {
                        User = ESEIM.AppContext.UserName,
                        TimeStamp = DateTime.Now,
                        NewDataUpdate = false
                    };
                    lstSession.Add(cardSession);
                }
                card.LockShare = JsonConvert.SerializeObject(lstSession);
            }
        }

        [HttpPost]
        public void AutoUpdateLockShareJson(string cardCode)
        {
            var card = _context.LmsTasks.FirstOrDefault(x => !x.IsDeleted && x.LmsTaskCode.Equals(cardCode));
            if (card != null)
            {
                /*var lstSession = new List<CardSessionUser>();
                if (!string.IsNullOrEmpty(card.LockShare))
                {
                    lstSession = JsonConvert.DeserializeObject<List<CardSessionUser>>(card.LockShare);
                    var isExist = false;
                    foreach (var item in lstSession)
                    {
                        if (item.User == ESEIM.AppContext.UserName)
                        {
                            item.NewDataUpdate = false;
                            isExist = true;
                        }
                    }
                    if (!isExist)
                    {
                        var cardSession = new CardSessionUser
                        {
                            User = ESEIM.AppContext.UserName,
                            TimeStamp = DateTime.Now,
                            NewDataUpdate = false
                        };
                        lstSession.Add(cardSession);
                    }
                }
                else
                {
                    var cardSession = new CardSessionUser
                    {
                        User = ESEIM.AppContext.UserName,
                        TimeStamp = DateTime.Now,
                        NewDataUpdate = false
                    };
                    lstSession.Add(cardSession);
                }
                card.LockShare = JsonConvert.SerializeObject(lstSession);*/
            }
            _context.SaveChanges();
        }

        public class CardSessionUser
        {
            public string User { get; set; }
            public bool NewDataUpdate { get; set; }
            public DateTime TimeStamp { get; set; }
        }

        public class CardDesCription
        {
            public string CardCode { get; set; }
            public string Description { get; set; }
        }
        #endregion

        #region Rollback card realtime
        [HttpPost]
        public JsonResult RollbackCard([FromBody] RollbackInfoCard obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var card = _context.LmsTasks.FirstOrDefault(x => !x.IsDeleted && x.LmsTaskCode.Equals(obj.CardHeader.CardCode));
                if (card != null)
                {
                    //Rollback header card
                    RollbackHeaderCard(card, obj.CardHeader);

                    //Rollback item check of card
                    RollbackItemChkCard(card, obj.ListChkItemRollback);

                    //Rollback comment
                    RollbackCommentCard(card, obj.Comment);

                    //Rollback Object
                    RollbackObjectCard(card, obj.ObjectRela);

                    //Rollback service
                    RollbackServiceCard(card, obj.Services);

                    //Rollback product
                    RollbackProductCard(card, obj.Products);

                    //Rollback address
                    RollbackAddressCard(card, obj.AddressCard);

                    //Rollback card link
                    RollbackCardLinkFunc(card, obj.CardLinks);

                    UpdateChangeCard(card.LmsTaskCode);

                    _context.SaveChanges();
                    msg.Title = "Khôi phục thẻ việc thành công!";
                    //msg.Object = //_cardService.UpdatePercentParentCard(card.LmsTaskCode);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Thẻ việc không tồn tại";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [NonAction]
        private void RollbackHeaderCard(LmsTask card, CardRollback obj)
        {
            var session = HttpContext.GetSessionUser();
            if (session.IsAllData || card.CreatedBy.Equals(ESEIM.AppContext.UserName))
            {
                var endTime = !string.IsNullOrEmpty(obj.EndTime) ? DateTime.ParseExact(obj.EndTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var deadline = !string.IsNullOrEmpty(obj.Deadline) ? DateTime.ParseExact(obj.Deadline, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var beginTime = !string.IsNullOrEmpty(obj.BeginTime) ? DateTime.ParseExact(obj.BeginTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

                card.LmsTaskName = obj.CardName;
                card.BeginTime = beginTime.Value;
                card.EndTime = endTime;
                card.LmsTaskType = obj.WorkType;
                card.ListCode = obj.ListCode;
                card.Status = obj.Status;
            }
            card.Description = obj.Description;
        }

        [NonAction]
        private void RollbackItemChkCard(LmsTask card, List<ItemRollback> listItemChk)
        {
            var currentChkList = _context.CardItemChecks.Where(x => x.CardCode.Equals(card.LmsTaskCode) && !x.Flag);
            foreach (var item in currentChkList)
            {
                if (!listItemChk.Any(x => x.ChkListCode.Equals(item.ChkListCode)))
                {
                    item.Flag = true;
                    item.DeletedBy = ESEIM.AppContext.UserName;
                    item.DeletedTime = DateTime.Now;
                    _context.CardItemChecks.Update(item);
                    var subs = _context.CardSubitemChecks.Where(x => !x.Flag && x.ChkListCode.Equals(item.ChkListCode));
                    foreach (var sub in subs)
                    {
                        sub.Flag = true;
                        _context.CardSubitemChecks.Update(sub);
                    }
                }
            }

            foreach (var item in listItemChk)
            {
                var chkList = _context.CardItemChecks.FirstOrDefault(x => x.ChkListCode.Equals(item.ChkListCode));
                if (chkList != null)
                {
                    chkList.CheckTitle = item.CheckTitle;
                    chkList.Completed = item.Completed;
                    chkList.Constraint = item.Constraint;
                    chkList.WeightNum = item.WeightNum;
                    chkList.Flag = false;
                    _context.CardItemChecks.Update(chkList);

                    var subs = _context.CardSubitemChecks.Where(x => !x.Flag && x.ChkListCode.Equals(item.ChkListCode));
                    foreach (var sub in subs)
                    {
                        if (!item.ListSubItem.Any(x => x.Id == sub.Id))
                        {
                            sub.Flag = true;
                            _context.CardSubitemChecks.Update(sub);
                        }
                    }
                    foreach (var subItem in item.ListSubItem)
                    {
                        var chkSubItem = _context.CardSubitemChecks.FirstOrDefault(x => x.Id.Equals(subItem.Id));
                        if (chkSubItem != null)
                        {
                            chkSubItem.Completed = subItem.Completed;
                            chkSubItem.Title = subItem.Title;
                            chkSubItem.WeightNum = subItem.WeightNum;
                            chkSubItem.Approve = subItem.Approve;
                            chkSubItem.Approver = subItem.Approver;
                            chkSubItem.ApprovedTime = subItem.ApprovedTime;
                            _context.CardSubitemChecks.Update(chkSubItem);
                        }
                    }
                }
            }
        }

        [NonAction]
        private void RollbackCommentCard(LmsTask card, List<RollbackComment> listComment)
        {
            var currentComment = _context.LmsTaskCommentLists.Where(x => x.LmsTaskCode.Equals(card.LmsTaskCode) && !x.Flag
                    && x.MemberId.Equals(ESEIM.AppContext.UserName));
            foreach (var item in currentComment)
            {
                if (!listComment.Any(x => x.Id == item.Id))
                {
                    item.Flag = true;
                    _context.LmsTaskCommentLists.Update(item);
                }
            }

            foreach (var item in listComment)
            {
                if (item.MemberId.Equals(ESEIM.AppContext.UserName))
                {
                    var comment = _context.LmsTaskCommentLists.FirstOrDefault(x => x.Id == item.Id);
                    if (comment != null)
                    {
                        comment.Flag = false;
                        comment.CmtContent = item.CmtContent;
                        comment.UpdatedTime = item.UpdatedTime;
                        _context.LmsTaskCommentLists.Update(comment);
                    }
                }
            }
        }

        [NonAction]
        private void RollbackObjectCard(LmsTask card, List<int> ids)
        {
            var relas = _context.JcObjectIdRelatives.Where(x => !x.IsDeleted && x.CardCode.Equals(card.LmsTaskCode));
            foreach (var item in relas)
            {
                if (!ids.Any(x => x == item.ID))
                {
                    item.IsDeleted = true;
                    item.DeletedBy = ESEIM.AppContext.UserName;
                    item.DeletedTime = DateTime.Now;
                    _context.JcObjectIdRelatives.Update(item);
                }
            }
            foreach (var item in ids)
            {
                var jcId = _context.JcObjectIdRelatives.FirstOrDefault(x => x.ID == item);
                if (jcId != null)
                {
                    jcId.IsDeleted = false;
                    _context.JcObjectIdRelatives.Update(jcId);
                }
            }
        }

        [NonAction]
        private void RollbackProductCard(LmsTask card, List<RollbackProduct> products)
        {
            var currentProducts = _context.JcProducts.Where(x => !x.IsDeleted && x.CardCode.Equals(card.LmsTaskCode));
            foreach (var item in currentProducts)
            {
                if (!products.Any(x => x.ID == item.ID))
                {
                    item.IsDeleted = true;
                    item.DeletedBy = ESEIM.AppContext.UserName;
                    item.DeletedTime = DateTime.Now;
                    _context.JcProducts.Update(item);
                }
            }

            foreach (var item in products)
            {
                var jcProd = _context.JcProducts.FirstOrDefault(x => x.ID == item.ID);
                if (jcProd != null)
                {
                    jcProd.Quantity = item.Quantity;
                    jcProd.IsDeleted = false;
                    _context.JcProducts.Update(jcProd);
                }
            }
        }

        [NonAction]
        private void RollbackServiceCard(LmsTask card, List<RollbackService> services)
        {
            var currentServices = _context.JcServices.Where(x => !x.IsDeleted && x.CardCode.Equals(card.LmsTaskCode));
            foreach (var item in currentServices)
            {
                if (!services.Any(x => x.ID == item.ID))
                {
                    item.IsDeleted = true;
                    item.DeletedBy = ESEIM.AppContext.UserName;
                    item.DeletedTime = DateTime.Now;
                    _context.JcServices.Update(item);
                }
            }

            foreach (var item in services)
            {
                var jcProd = _context.JcServices.FirstOrDefault(x => x.ID == item.ID);
                if (jcProd != null)
                {
                    jcProd.Quantity = item.Quantity;
                    jcProd.IsDeleted = false;
                    _context.JcServices.Update(jcProd);
                }
            }
        }

        [NonAction]
        private void RollbackAddressCard(LmsTask card, List<RollbackAddress> address)
        {
            var currentAddress = _context.WORKOSAddressCards.Where(x => !x.IsDeleted && x.CardCode.Equals(card.LmsTaskCode));
            foreach (var item in currentAddress)
            {
                if (!address.Any(x => x.Id == item.Id))
                {
                    item.IsDeleted = true;
                    item.DeletedBy = ESEIM.AppContext.UserName;
                    item.DeletedTime = DateTime.Now;
                    _context.WORKOSAddressCards.Update(item);
                }
            }

            foreach (var item in address)
            {
                var adss = _context.WORKOSAddressCards.FirstOrDefault(x => x.Id == item.Id);
                if (adss != null)
                {
                    adss.IsDeleted = false;
                    _context.WORKOSAddressCards.Update(adss);
                }
            }
        }

        [NonAction]
        private void RollbackCardLinkFunc(LmsTask card, List<RollbackCardLink> links)
        {
            var currentLinks = _context.JobCardLinks.Where(x => !x.IsDeleted && x.CardCode.Equals(card.LmsTaskCode));
            foreach (var item in currentLinks)
            {
                if (!links.Any(x => x.Id == item.Id))
                {
                    item.IsDeleted = true;
                    item.DeletedBy = ESEIM.AppContext.UserName;
                    item.DeletedTime = DateTime.Now;
                    _context.JobCardLinks.Update(item);
                }
            }

            foreach (var item in links)
            {
                var link = _context.JobCardLinks.FirstOrDefault(x => x.Id == item.Id);
                if (link != null)
                {
                    link.IsDeleted = false;
                    _context.JobCardLinks.Update(link);
                }
            }
        }

        public class RollbackInfoCard
        {
            public RollbackInfoCard()
            {
                ListChkItemRollback = new List<ItemRollback>();
                Comment = new List<RollbackComment>();
                ObjectRela = new List<int>();
                Products = new List<RollbackProduct>();
                Services = new List<RollbackService>();
                AddressCard = new List<RollbackAddress>();
                CardLinks = new List<RollbackCardLink>();
            }
            public CardRollback CardHeader { get; set; }
            public List<RollbackComment> Comment { get; set; }
            public List<ItemRollback> ListChkItemRollback { get; set; }
            public List<int> ObjectRela { get; set; }
            public List<RollbackProduct> Products { get; set; }
            public List<RollbackService> Services { get; set; }
            public List<RollbackAddress> AddressCard { get; set; }
            public List<RollbackCardLink> CardLinks { get; set; }
        }

        public class RollbackComment
        {
            public int Id { get; set; }
            public string GivenName { get; set; }
            public string Picture { get; set; }
            public string MemberId { get; set; }
            public string CmtContent { get; set; }
            public DateTime? CreatedTime { get; set; }
            public DateTime? UpdatedTime { get; set; }
            public string CardCode { get; set; }
            public string UpdatedBy { get; set; }
        }

        public class RollbackProduct
        {
            public int ID { get; set; }
            public DateTime CreatedTime { get; set; }
            public int Quantity { get; set; }
            public string ProductCode { get; set; }
            public string ProductName { get; set; }
        }

        public class RollbackService
        {
            public int ID { get; set; }
            public DateTime CreatedTime { get; set; }
            public int Quantity { get; set; }
            public string ServiceCode { get; set; }
            public string ServiceName { get; set; }
        }

        public class RollbackAddress
        {
            public int Id { get; set; }
            public string LocationGps { get; set; }
            public string LocationText { get; set; }
            public string CreatedBy { get; set; }
            public DateTime CreatedTime { get; set; }
        }

        public class RollbackCardLink
        {
            public int Id { get; set; }
            public string CardCode { get; set; }
            public string CardName { get; set; }
        }

        public class CardRollback
        {
            public string CardCode { get; set; }
            public string CardName { get; set; }
            public string ListCode { get; set; }
            public decimal Completed { get; set; }
            public string BeginTime { get; set; }
            public string Deadline { get; set; }
            public string EndTime { get; set; }
            public string Status { get; set; }
            public string CardLevel { get; set; }
            public string WorkType { get; set; }
            public decimal WeightNum { get; set; }
            public decimal Cost { get; set; }
            public string Currency { get; set; }
            public string Description { get; set; }
            public bool IsLock { get; set; }
        }

        public class UserAssignItemRollBack
        {
            public int ID { get; set; }
            public string UserId { get; set; }
            public string UserName { get; set; }
            public string GivenName { get; set; }
            public string EstimateTime { get; set; }
            public string Status { get; set; }
            public string Unit { get; set; }
            public string CreatedBy { get; set; }
            public DateTime CreatedTime { get; set; }
        }

        public class SubItemRollBack
        {
            public SubItemRollBack()
            {
                ListUserSubItem = new List<UserAssignItemRollBack>();
            }
            public int Id { get; set; }
            public string Title { get; set; }
            public string Approver { get; set; }
            public bool Approve { get; set; }
            public DateTime? ApprovedTime { get; set; }
            public decimal Completed { get; set; }
            public decimal WeightNum { get; set; }
            public List<UserAssignItemRollBack> ListUserSubItem { get; set; }
        }

        public class ItemRollback
        {
            public ItemRollback()
            {
                ListSubItem = new List<SubItemRollBack>();
                ListUserItemChk = new List<UserAssignItemRollBack>();
            }
            public int Id { get; set; }
            public string ChkListCode { get; set; }
            public string CheckTitle { get; set; }
            public decimal Completed { get; set; }
            public decimal WeightNum { get; set; }
            public bool checkItem { get; set; }
            public string TitleSubItemChk { get; set; }
            public string Note { get; set; }
            public string CreatedBy { get; set; }
            public DateTime CreatedTime { get; set; }
            public string Constraint { get; set; }
            public List<UserAssignItemRollBack> ListUserItemChk { get; set; }
            public List<SubItemRollBack> ListSubItem { get; set; }
            public string ListObject { get; set; }
        }
        #endregion

        #region Manager notification
        [NonAction]
        public JsonResult InsertNotification([FromBody] NotificationManager obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var check = _context.NotificationManagers.Any(x => !x.IsDeleted && x.ObjCode.Equals(obj.ObjCode) && x.ObjType.Equals(obj.ObjType));
                if (!check)
                {
                    obj.NotifyCode = string.Format("NOTIFI_{0}", DateTime.Now.ToString("ddMMyyyyHHmmss"));
                    obj.CreatedBy = User.Identity.Name;
                    obj.CreatedTime = DateTime.Now;
                    _context.NotificationManagers.Add(obj);
                    _context.SaveChanges();
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Thông báo đã tồn tại";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [NonAction]
        public JsonResult UpdateNotification([FromBody] NotificationManager obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var notifiManager = _context.NotificationManagers.FirstOrDefault(x => !x.IsDeleted && x.ObjCode.Equals(obj.ObjCode) && x.ObjType.Equals(obj.ObjType));
                if (notifiManager != null)
                {
                    var listDelete = notifiManager.ListUser.Where(x => !obj.ListUser.Any(p => p.UserId.Equals(x.UserId))).ToList();
                    var listInsert = obj.ListUser.Where(x => !notifiManager.ListUser.Any(p => p.UserId.Equals(x.UserId))).ToList();
                    if (listInsert.Count > 0)
                        notifiManager.ListUser.AddRange(listInsert);

                    foreach (var item in listDelete)
                    {
                        notifiManager.ListUser.Remove(item);
                    }

                    notifiManager.UpdatedBy = User.Identity.Name;
                    notifiManager.UpdatedTime = DateTime.Now;
                    _context.NotificationManagers.Update(notifiManager);
                    _context.SaveChanges();
                }
                else
                {
                    InsertNotification(obj);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [NonAction]
        public JsonResult RemoveUserInNotify(string objCode, string objType, bool delete)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var notifiManager = _context.NotificationManagers.FirstOrDefault(x => !x.IsDeleted && x.ObjCode.Equals(objCode) && x.ObjType.Equals(objType));
                if (notifiManager != null)
                {
                    var listDelete = notifiManager.ListUser.Where(x => x.UserId.Equals(ESEIM.AppContext.UserId)).ToList();
                    foreach (var item in listDelete)
                    {
                        notifiManager.ListUser.Remove(item);
                    }

                    if (notifiManager.ListUser.Count == 0 || delete)
                    {
                        notifiManager.IsDeleted = true;
                        notifiManager.DeletedBy = User.Identity.Name;
                        notifiManager.DeletedTime = DateTime.Now;
                    }

                    notifiManager.UpdatedBy = User.Identity.Name;
                    notifiManager.UpdatedTime = DateTime.Now;
                    _context.NotificationManagers.Update(notifiManager);
                    _context.SaveChanges();
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [NonAction]
        public bool GetIsReadNotification(string objCode, string objType)
        {
            var isRead = true;
            try
            {
                var notifiManager = _context.NotificationManagers.FirstOrDefault(x => !x.IsDeleted && x.ObjCode.Equals(objCode) && x.ObjType.Equals(objType));
                if (notifiManager != null)
                {
                    if (notifiManager.ListUser.Any(p => p.UserId.Equals(ESEIM.AppContext.UserId)))
                        isRead = false;
                }
            }
            catch (Exception ex)
            {
            }
            return isRead;
        }
        #endregion

        #region Upgrade item work
        [HttpGet]
        public JsonResult GetItemCheckRpt(string cardCode)
        {
            var data = _context.CardItemChecks
                .Where(x => !x.Flag && x.CardCode.Equals(cardCode))
                .Select(x => new ReportItem
                {
                    Code = x.ChkListCode,
                    Name = x.CheckTitle,
                    Leader = 0,
                    //Staff = 0,
                    Note = "",
                    Desc = ""
                });
            return Json(data);
        }

        [HttpPost]
        public JsonResult InserReportSession([FromBody] ReportSession obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var count = 0;
                foreach (var item in obj.ListReportItem)
                {
                    if (item.Staff > 100 || item.Leader > 100)
                    {
                        msg.Error = true;
                        msg.Title = "Vui lòng kiểm tra lại dữ liệu báo cáo hoặc duyệt tiến độ";
                        return Json(msg);
                    }

                    if (item.Staff > 0 && item.Leader >= 0 && item.Leader <= 100 && item.Staff >= 0 && item.Staff <= 100)
                    {
                        var listSubItem = _context.CardSubitemChecks.Where(x => !x.Flag && x.ChkListCode.Equals(item.Code)).ToList();

                        var sessionItemChkItem = new SessionWork
                        {
                            Session = obj.WorkSession,
                            ItemType = "1",
                            Item = item.Code,
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now,
                            Desc = obj.Desc
                        };
                        _context.SessionWorks.Add(sessionItemChkItem);

                        var itemStaff = new SessionWorkResult
                        {
                            WorkSession = obj.WorkSession,
                            ProgressFromStaff = item.Staff.Value,
                            ProgressFromLeader = item.Leader.Value,
                            NoteFromLeader = item.Note,
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now,
                            ShiftCode = "",
                            CardCode = obj.CardCode,
                            ChkListCode = item.Code,
                            ItemWorkList = item.Code,
                            ListSubItem = JsonConvert.SerializeObject(listSubItem)
                        };
                        _context.SessionWorkResults.Add(itemStaff);

                        var cardItem = _context.CardItemChecks.FirstOrDefault(x => x.ChkListCode.Equals(item.Code) && !x.Flag);
                        var activity = new LmsTaskStudentAssign
                        {
                            UserId = ESEIM.AppContext.UserId,
                            Action = "ADD",
                            IdObject = "ITEMWORK",
                            IsCheck = true,
                            LmsTaskCode = obj.CardCode,
                            CreatedTime = DateTime.Now,
                            FromDevice = "Laptop/Desktop",
                            ChangeDetails = "Cho đầu mục việc " + cardItem.CheckTitle
                        };
                        _context.LmsTaskStudentAssigns.Add(activity);
                    }
                    else
                    {
                        count = count + 1;
                    }
                }

                if (count == obj.ListReportItem.Count())
                {
                    msg.Error = true;
                    msg.Title = "Vui lòng kiểm tra lại dữ liệu báo cáo hoặc duyệt tiến độ";
                }
                else
                {
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                }
            }
            catch (Exception ex)
            {
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpGet]
        public JsonResult GetReportSession(string cardCode)
        {
            var data = (from a in _context.SessionWorkResults.Where(x => !x.IsDeleted && x.CardCode.Equals(cardCode))
                        join b in _context.SessionWorks.Where(x => !x.IsDeleted) on a.WorkSession equals b.Session
                        join c in _context.CardItemChecks.Where(x => !x.Flag) on a.ChkListCode equals c.ChkListCode
                        select new
                        {
                            b.ID,
                            a.ProgressFromStaff,
                            a.ProgressFromLeader,
                            b.Desc,
                            a.WorkSession,
                            a.CreatedTime,
                            a.CreatedBy,
                            c.WeightNum,
                            a.ChkListCode,
                            IdResult = a.Id
                        }).DistinctBy(x => x.IdResult).GroupBy(x => x.WorkSession);

            var listReport = new List<ViewReportBySession>();
            foreach (var item in data)
            {
                var report = new ViewReportBySession();
                var users = _context.Users;
                report.Session = item.Key;

                foreach (var i in item)
                {
                    report.UserReport = users.FirstOrDefault(x => x.UserName.Equals(i.CreatedBy)) != null ?
                        users.FirstOrDefault(x => x.UserName.Equals(i.CreatedBy)).GivenName : "";
                    report.TimeReport = i.CreatedTime.ToString("dd/MM/yyyy HH:mm");
                    report.Id = i.ID;
                    break;
                }
                var reportPercent = item.Count() > 0 ? item.Sum(x => (x.ProgressFromStaff * x.WeightNum) / 100) : 0;
                var approvePercent = item.Count() > 0 ? item.Sum(x => (x.ProgressFromLeader * x.WeightNum) / 100) : 0;
                report.PercentReport = Math.Round(reportPercent, 2);
                report.PercentApprove = Math.Round(approvePercent, 2);
                report.IsApproveAll = item.Any(x => x.ProgressFromLeader == 0) ? true : false;
                listReport.Add(report);
            }
            return Json(listReport);
        }

        [HttpPost]
        public JsonResult DelReportSession(int id, string createdBy)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var sysSession = HttpContext.GetSessionUser();
                var reportSession = _context.SessionWorks.FirstOrDefault(x => x.ID == id);
                if (reportSession != null)
                {
                    if (sysSession.IsAllData || reportSession.CreatedBy.Equals(sysSession.UserName))
                    {
                        reportSession.IsDeleted = true;
                        reportSession.DeletedBy = ESEIM.AppContext.UserName;
                        reportSession.DeletedTime = DateTime.Now;
                        _context.SessionWorks.Update(reportSession);

                        var reportResult = _context.SessionWorkResults.Where(x => !x.IsDeleted
                                && x.WorkSession.Equals(reportSession.Session));
                        foreach (var item in reportResult)
                        {
                            item.IsDeleted = true;
                            item.DeletedBy = ESEIM.AppContext.UserName;
                            item.DeletedTime = DateTime.Now;
                            _context.SessionWorkResults.Update(item);
                        }

                        _context.SaveChanges();
                        msg.Title = "Xóa thành công";
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = "Bạn không có quyền xóa";
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Báo tiến độ không tồn tại";
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
        public JsonResult GetItemSessionWork(string session, string cardCode)
        {
            var data = (from a in _context.SessionWorks.Where(x => !x.IsDeleted && x.Session.Equals(session))
                        join b in _context.SessionWorkResults.Where(x => !x.IsDeleted && x.CardCode.Equals(cardCode)) on a.Session equals b.WorkSession
                        join c in _context.CardItemChecks.Where(x => !x.Flag) on b.ChkListCode equals c.ChkListCode
                        select new ReportItem
                        {
                            Code = c.ChkListCode,
                            Name = c.CheckTitle,
                            Leader = b.ProgressFromLeader,
                            Staff = b.ProgressFromStaff,
                            Note = b.NoteFromLeader,
                            Desc = a.Desc
                        }).DistinctBy(x => x.Code);
            return Json(data);
        }

        [HttpGet]
        public JsonResult GetItemReportResult(int id)
        {
            var reportResult = from a in _context.SessionWorkResults.Where(x => x.Id == id)
                               join b in _context.CardItemChecks.Where(x => !x.Flag) on a.ChkListCode equals b.ChkListCode
                               select new ReportItem
                               {
                                   Code = a.ChkListCode,
                                   Name = b.CheckTitle,
                                   Note = a.NoteFromLeader,
                                   Staff = a.ProgressFromStaff,
                                   Leader = a.ProgressFromLeader
                               };
            return Json(reportResult);
        }

        [HttpPost]
        public JsonResult ApproveSessionWork([FromBody] ReportSession obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var sessionWork = _context.SessionWorks.FirstOrDefault(x => x.Session == obj.WorkSession);
                if (sessionWork != null)
                {
                    sessionWork.Desc = obj.Desc;
                    sessionWork.UpdatedBy = obj.UserName;
                    sessionWork.UpdatedTime = DateTime.Now;
                    _context.SessionWorks.Update(sessionWork);
                }

                foreach (var item in obj.ListReportItem)
                {
                    if (item.Staff > 0 && item.Leader >= 0 && item.Leader <= 100 && item.Staff >= 0 && item.Staff <= 100)
                    {
                        var reportResult = _context.SessionWorkResults
                        .FirstOrDefault(x => !x.IsDeleted && x.WorkSession.Equals(obj.WorkSession)
                                        && x.ChkListCode.Equals(item.Code));
                        if (reportResult != null)
                        {
                            reportResult.NoteFromLeader = item.Note;
                            reportResult.ProgressFromLeader = item.Leader.Value;
                            reportResult.ProgressFromStaff = item.Staff.Value;
                            _context.SessionWorkResults.Update(reportResult);
                        }
                    }
                }
                _context.SaveChanges();
                msg.Title = "Cập nhật thành công";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public void SetupDefaultRepoObject(string objectCode, string objectType, int? cateRepoSettingId)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var setting = _context.EDMSCatRepoSettings.FirstOrDefault(x => x.Id == cateRepoSettingId);
                var repoDefault = _context.EDMSRepoDefaultObjects.FirstOrDefault(x => !x.IsDeleted && x.ObjectCode.Equals(objectCode) && x.ObjectType.Equals(objectType));
                if (repoDefault != null)
                {
                    if (setting != null)
                    {
                        repoDefault.ReposCode = setting.ReposCode;
                        repoDefault.CatRepoSettingId = cateRepoSettingId;
                        repoDefault.CatCode = setting.CatCode;
                        repoDefault.Path = setting.Path;
                        repoDefault.FolderId = setting.FolderId;
                        repoDefault.UpdatedBy = ESEIM.AppContext.UserName;
                        repoDefault.UpdatedTime = DateTime.Now;
                        _context.EDMSRepoDefaultObjects.Update(repoDefault);
                        msg.Title = _stringLocalizerCJ["SUP_MSG_UPDATE_FOLDER_DEFAULT_SUCCESS"];
                        _context.SaveChanges();
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizerCJ["SUP_MSG_PLS_SELECT_FOLDER"];

                    }
                }
                else
                {
                    if (setting != null)
                    {
                        var setUp = new EDMSRepoDefaultObject
                        {
                            CatCode = setting.CatCode,
                            ReposCode = setting.ReposCode,
                            FolderId = setting.FolderId,
                            Path = setting.Path,
                            ObjectCode = objectCode,
                            ObjectType = objectType,
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now,
                            CatRepoSettingId = cateRepoSettingId
                        };
                        _context.EDMSRepoDefaultObjects.Add(setUp);
                        msg.Title = _stringLocalizerCJ["SUP_MSG_SETUP_DEFAULT_FOLDER_SUCCESS"];
                        _context.SaveChanges();
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizerCJ["SUP_PLS_SELECT_FORDER_SAVE"];
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
        }

        public class ReportSession
        {
            public ReportSession()
            {
                ListReportItem = new List<ReportItem>();
            }
            public List<ReportItem> ListReportItem { get; set; }
            public string Desc { get; set; }
            public string WorkSession { get; set; }
            public string CardCode { get; set; }
            public string UserName { get; set; }
        }

        public class ReportItem
        {
            public string Code { get; set; }
            public string Name { get; set; }
            public string Note { get; set; }
            public decimal? Staff { get; set; }
            public decimal? Leader { get; set; }
            public string Desc { get; set; }
        }

        public class ViewReportBySession
        {
            public int Id { get; set; }
            public string Session { get; set; }
            public string UserReport { get; set; }
            public string TimeReport { get; set; }
            public string Desc { get; set; }
            public decimal PercentReport { get; set; }
            public decimal PercentApprove { get; set; }
            public bool IsApproveAll { get; set; }
        }
        #endregion
    }
}
