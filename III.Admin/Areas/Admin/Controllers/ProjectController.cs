using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using Microsoft.AspNetCore.Http;
using System.Globalization;
using System.IO;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore.Internal;
using III.Domain.Enums;
using System.Net;
using System.Threading.Tasks;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;
using System.Data;
using System.Web;
using Microsoft.AspNetCore.Authorization;
using Newtonsoft.Json;
using Syncfusion.Drawing;
using Syncfusion.XlsIO;
using AppContext = ESEIM.AppContext;
using static III.Admin.Controllers.CardJobController;
using Syncfusion.EJ2.Buttons;
using Dropbox.Api.TeamLog;
using DocumentFormat.OpenXml.Spreadsheet;
using Color = Syncfusion.Drawing.Color;
using OpenXmlPowerTools;
using Syncfusion.EJ2.Navigations;
using Microsoft.VisualStudio.Services.Common;
using Lucene.Net.Support;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class ProjectController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private static AsyncLocker<string> userLock = new AsyncLocker<string>();
        private readonly IStringLocalizer<ProjectController> _stringLocalizer;
        private readonly IStringLocalizer<FilePluginController> _stringLocalizerFp;
        private readonly IStringLocalizer<CustomerController> _customerLocalizer;
        private readonly IStringLocalizer<ContractController> _contractLocalizer;
        private readonly IStringLocalizer<SupplierController> _supplierLocalizer;
        private readonly IStringLocalizer<CardJobController> _cardJobController;
        private readonly IStringLocalizer<FileObjectShareController> _fileObjectShareController;
        private readonly IStringLocalizer<AttributeManagerController> _attributeManagerController;
        private readonly IStringLocalizer<MaterialProductController> _materialProductController;
        private readonly IStringLocalizer<ContractPoController> _contractPoLocalizer;
        private readonly IStringLocalizer<SendRequestImportProductController> _sendRequestImportProductController;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IStringLocalizer<EDMSRepositoryController> _edmsRepositoryController;
        private readonly IStringLocalizer<WorkflowActivityController> _workflowActivityController;
        private readonly IStringLocalizer<FundAccEntryController> _funcAccEntryLocalizer;
        private readonly ICardJobService _cardService;
        private readonly IRepositoryService _repositoryService;
        public ProjectController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment,
            IStringLocalizer<ProjectController> stringLocalizer, IStringLocalizer<CustomerController> customerLocalizer,
            IStringLocalizer<FilePluginController> stringLocalizerFp,
            IStringLocalizer<SupplierController> supplierLocalizer,
            IStringLocalizer<CardJobController> cardJobController,
            IStringLocalizer<AttributeManagerController> attributeManagerController,
            IStringLocalizer<MaterialProductController> materialProductController,
            IStringLocalizer<SharedResources> sharedResources, ICardJobService cardService,
            IStringLocalizer<FileObjectShareController> fileObjectShareController,
            IStringLocalizer<SendRequestImportProductController> sendRequestImportProductController,
            IStringLocalizer<ContractController> contractLocalizer,
            IStringLocalizer<EDMSRepositoryController> edmsRepositoryController, IRepositoryService repositoryService,
            IStringLocalizer<WorkflowActivityController> workflowActivityController,
            IStringLocalizer<ContractPoController> contractPoLocalizer,
            IStringLocalizer<FundAccEntryController> funcAccEntryLocalizer)
        {
            _context = context;
            _upload = upload;
            _hostingEnvironment = hostingEnvironment;
            _stringLocalizer = stringLocalizer;
            _customerLocalizer = customerLocalizer;
            _stringLocalizerFp = stringLocalizerFp;
            _supplierLocalizer = supplierLocalizer;
            _cardJobController = cardJobController;
            _sharedResources = sharedResources;
            _cardService = cardService;
            _fileObjectShareController = fileObjectShareController;
            _attributeManagerController = attributeManagerController;
            _materialProductController = materialProductController;
            _sendRequestImportProductController = sendRequestImportProductController;
            _contractLocalizer = contractLocalizer;
            _edmsRepositoryController = edmsRepositoryController;
            _repositoryService = repositoryService;
            _workflowActivityController = workflowActivityController;
            _contractPoLocalizer = contractPoLocalizer;
            _funcAccEntryLocalizer = funcAccEntryLocalizer;
        }
        [Breadcrumb("ViewData.CrumbProject", AreaName = "Admin", FromAction = "Index", FromController = typeof(ProjectHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbProjectHome"] = _sharedResources["COM_CRUMB_PROJECT_HOME"];
            ViewData["CrumbProject"] = _sharedResources["COM_CRUMB_PROJECT"];
            return View();
        }

        #region Project Card
        // JTable
        [HttpPost]
        public object JTableItemCard([FromBody] ItemPlanJobcard jTablePara)
        {
            try
            {
                var data = from a in _context.ItemPlanJobcards
                           where a.IsDeleted == false
                           && (string.IsNullOrEmpty(jTablePara.ItemCode) || a.ItemCode == jTablePara.ItemCode)
                           select new
                           {
                               a.Id,
                               a.ItemCode,
                               CardJobName = _context.WORKOSCards.FirstOrDefault(x => x.CardCode == a.JobcardCode).CardName,
                               a.Weight,
                           };
                var count = data.Count();
                var jdata = JTableHelper.JObjectTable(data.ToList(), jTablePara.Draw, count, "Id", "ItemCode", "CardJobName", "Weight");
                return Json(jdata);
            }
            catch (Exception)
            {
                var jdata = JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "Id", "ItemCode", "CardJobName", "Weight");
                return Json(jdata);
            }
        }
        [HttpPost]
        public object JTableProjectCard([FromBody] ProjectItemPlan jTablePara)
        {
            // var checkexist = _context.ProjectItemPlans.FirstOrDefault(x => x.JobCar)
            try
            {
                var data = (from a in _context.ProjectItemPlans
                            where (a.IsDeleted == false
                            && (a.ProjectCode == jTablePara.ProjectCode) && (a.ItemParent == null || a.ItemParent == ""))
                            select new Parentclass(
                                a.Id,
                                a.ItemCode,
                                a.ProjectCode,
                                a.ItemName,
                                a.ItemLevel,
                                a.ItemWeight,
                                a.ItemParent,
                                a.DurationTime,
                                a.DurationUnit,
                                a.Cost,
                                a.CostUnit
                            )).ToList();
                var listItem = new List<Parentclass>();
                foreach (var item in data)
                {
                    listItem.Add(item);
                    var listChild = _context.ProjectItemPlans.Where(x => x.ItemParent == item.ItemCode).Select(a => new Parentclass(
                               a.Id,
                               a.ItemCode,
                               a.ProjectCode,
                               a.ItemName,
                               a.ItemLevel,
                               a.ItemWeight,
                               a.ItemParent,
                               a.DurationTime,
                               a.DurationUnit,
                               a.Cost,
                               a.CostUnit
                           )).ToList();
                    listItem.AddRange(listChild);
                };
                var count = listItem.Count();
                var jdata = JTableHelper.JObjectTable(listItem.ToList(), jTablePara.Draw, count, "Id", "ItemCode", "ProjectCode", "ItemName", "ItemLevel", "ItemWeight", "ItemParent", "DurationTime", "DurationUnit", "Cost", "CostUnit");
                return Json(jdata);
            }
            catch (Exception)
            {
                var jdata = JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "Id", "ItemCode", "ProjectCode", "ItemName", "ItemLevel", "ItemWeight", "ItemParent", "DurationTime", " DurationUnit", "Cost", "CostUnit");
                return Json(jdata);
            }
        }
        public class ProjectItems
        {
            // public string ItemCode { get; set; }
            public string ItemName { get; set; }
            public string ItemLevel { get; set; }
            public decimal ItemWeight { get; set; }
            public string ItemParent { get; set; }
            public string ProjectCode { get; set; }
            public string DurationTime { get; set; }
            public string DurationUnit { get; set; }
            public string Cost { get; set; }
            public string CostUnit { get; set; }
        }
        [HttpPost]
        public JsonResult AddProjectCard([FromBody] ProjectItems obj)
        {
            if (obj.ItemParent != null ) { obj.ItemLevel = "1"; } 
           // if (obj.ItemParent == null || obj.ItemParent == "") { obj.ItemParent = null; }
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                if (obj.ProjectCode != null)
                {
                    Random r = new Random();
                    var getSumWeightNum = _context.ProjectItemPlans.Where(x => x.ProjectCode == obj.ProjectCode).Sum(x => x.ItemWeight);
                    if ((getSumWeightNum + obj.ItemWeight) > 100)
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["CJ_MSG_MAXIMUM_WEIGHT"] + " " + (100 - getSumWeightNum) + " % !";
                    }
                    else
                    {
                        var ob = new ProjectItemPlan() { };
                        ob.ItemCode = r.Next().ToString();
                        ob.ItemName = obj.ItemName;
                        ob.ItemLevel = obj.ItemLevel;
                        ob.ItemWeight = obj.ItemWeight;
                        ob.ItemParent = obj.ItemParent;
                        ob.ProjectCode = obj.ProjectCode;
                        ob.DurationTime = obj.DurationTime;
                        ob.DurationUnit = obj.DurationUnit;
                        ob.Cost = obj.Cost;
                        ob.CostUnit = obj.CostUnit;
                        ob.IsDeleted = false;
                        ob.CreatedBy = ESEIM.AppContext.UserName;
                        ob.CreatedTime = DateTime.Now;

                        _context.ProjectItemPlans.Add(ob);
                        _context.SaveChanges();
                        msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_ADD_CARD"]);
                    }
                }
                else
                {
                    msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_ADD_ERR"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_ADD_ERR"]);
                //msg.Title = String.Format(_stringLocalize["COM_MSG_ADD_FAILED"), _stringLocalize["")); //"Có lỗi xảy ra khi thêm!";
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult AddProjectItem([FromBody] ItemPlanJobcard obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var checkExist = _context.ItemPlanJobcards.FirstOrDefault(x => x.JobcardCode.Equals(obj.JobcardCode));
                if (checkExist == null && obj.ItemCode != null && obj.JobcardCode != null)
                {
                    var getSumWeightNum = _context.ItemPlanJobcards.Where(x => x.ItemCode == obj.ItemCode).Sum(x => x.Weight);
                    if ((getSumWeightNum + obj.Weight) > 100)
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["CJ_MSG_MAXIMUM_WEIGHT"] + " " + (100 - getSumWeightNum) + " % !";
                    }
                    else
                    {
                        obj.CreatedTime = DateTime.Now;
                        obj.CreatedBy = ESEIM.AppContext.UserName;
                        obj.IsDeleted = false;

                        _context.ItemPlanJobcards.Add(obj);
                        _context.SaveChanges();
                        msg.Object = obj.Id;
                        msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_ADD_PROJECT"]);
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_VALUDE_CODE_EXIST"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_ADD_ERR"]);
            }
            return Json(msg);
        }
        [HttpGet]
        public JsonResult GetItemProjectCard(int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var obj = _context.ProjectItemPlans.FirstOrDefault(x => x.Id.Equals(id));
                if (obj != null)
                {
                    msg.Object = new ProjectItemPlan
                    {
                        ItemName = obj.ItemName,
                        ItemLevel = obj.ItemLevel,
                        ItemWeight = obj.ItemWeight,
                        ItemParent = obj.ItemParent,
                        ProjectCode = obj.ProjectCode,
                        DurationTime = obj.DurationTime,
                        DurationUnit = obj.DurationUnit,
                        Cost = obj.Cost,
                        CostUnit = obj.CostUnit,
                    };
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Không tìm thấy thông tin ";
                    msg.Title = _stringLocalizer["COMP_RULE_NOT_FOUND"];
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
        [HttpPost]
        public JsonResult UpdateItemCard([FromBody] ItemPlanJobcard obj)
        {
            var msg = new JMessage();
            try
            {
                var item = _context.ItemPlanJobcards.FirstOrDefault(x => x.Id.Equals(obj.Id));
                if (item != null)
                {
                    item.UpdatedBy = User.Identity.Name;
                    item.UpdatedTime = DateTime.Now.Date;
                    item.Weight = obj.Weight;

                    _context.ItemPlanJobcards.Update(item);
                    _context.SaveChanges();

                    msg.Error = false;
                    msg.Title = _stringLocalizer["COMP_RULE_SUCCESS"]; //"Đã lưu thay đổi";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_ADD_ERR"]); //"Có lỗi xảy ra!";
                }
                return Json(msg);
            }
            catch
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_ADD_ERR"]); //"Có lỗi xảy ra!";
                return Json(msg);
            }
        }
        [HttpPost]
        public object DeleteProjectCard(int Id)
        {
            var msg = new JMessage { Error = true };
            try
            {
                var data = _context.ProjectItemPlans.FirstOrDefault(x => x.Id == Id);
                _context.ProjectItemPlans.Remove(data);
                _context.SaveChanges();
                msg.Error = false;
                msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_DELETE_ITEM"]);
                return Json(msg);


            }
            catch (Exception)
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_ADD_ERR"]);//Không tìm thấy dịch vụ. Vui lòng làm mới lại trang
                return Json(msg);
            }
        }
        [HttpPost]
        public object DeleteProjectItem(int Id)
        {
            var msg = new JMessage { Error = true };
            try
            {
                var data = _context.ItemPlanJobcards.FirstOrDefault(x => x.Id == Id);
                _context.ItemPlanJobcards.Remove(data);
                _context.SaveChanges();
                msg.Error = false;
                msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_DELETE_CARDJOB"]);
                return Json(msg);
            }
            catch (Exception)
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_ADD_ERR"]);//Không tìm thấy dịch vụ. Vui lòng làm mới lại trang
                return Json(msg);
            }
        }
        [HttpPost]
        public JsonResult GetListItem()
        {
            var data = _context.ProjectItemPlans.Where(x => !x.IsDeleted && (x.ItemParent == null || x.ItemParent == "")) //Trạng Thái
                        .Select(x => new { Code = x.ItemCode, Name = x.ItemName });
            var rs = data;
            return Json(rs);
        }
        [HttpPost]
        public JsonResult GetListUnitTime()
        {
            var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "UNIT_TIME") //Trạng Thái
                        .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            // var rs = data;
            return Json(data);
        }
        [HttpPost]
        public JsonResult GetListCardJob()
        {
            var data = _context.WORKOSCards.Where(x => !x.IsDeleted) //Trạng Thái
                        .Select(x => new { Code = x.CardCode, Name = x.CardName });
            var rs = data;
            return Json(rs);
        }

        public class DiagramRadial
        {
            public string Id { get; set; }
            public string ItemName { get; set; }
            public string ItemCode { get; set; }
            public string ItemType { get; set; }
            public string Progress { get; set; }
            public decimal WeightNum { get; set; }
            public string ItemParent { get; set; }
            public string ItemLevel { get; set; }
        }
        [HttpPost]
        public JsonResult GetDataDiagram(string projectCode)
        {
            var data = (from a in _context.Projects
                        where (!string.IsNullOrEmpty(projectCode) && a.ProjectCode == projectCode)
                        select new DiagramRadial
                        {
                            Id = "project",
                            ItemCode = a.ProjectCode,
                            ItemName = a.ProjectTitle,
                            ItemType = "Project",
                            Progress = "",
                            WeightNum = 100,
                            ItemParent = ""
                        }).FirstOrDefault();

            var listDataDiagram = new List<DiagramRadial> { data };

            var listChild = _context.ProjectItemPlans.Where(x => x.ProjectCode == projectCode && x.ItemParent == null).Select(a => new DiagramRadial
            {
                Id =  a.ItemCode,
                ItemCode = a.ItemCode,
                ItemName = a.ItemName,
                ItemType = "Item",
                Progress = "",
                WeightNum = a.ItemWeight,
                ItemLevel = a.ItemLevel,
                ItemParent = a.ItemLevel == "0" ? "project" : a.ItemParent,
            }).ToList();
            decimal projectProgress = 0;
            foreach (var child in listChild)
            {
                var progress = GetProgress(child.ItemCode, child.ItemLevel);
                child.Progress = progress.ToString() + "%";
                if (child.ItemLevel == "0")
                {
                    projectProgress += progress * child.WeightNum / 100;
                }
                var listCard = (from a in _context.WORKOSCards.Where(x => !x.IsDeleted)
                              join b in _context.ItemPlanJobCards.Where(x => !x.IsDeleted && x.ItemCode == child.ItemCode)
                                  on a.CardCode equals b.JobcardCode
                              select new DiagramRadial
                              {
                                  Id = a.CardCode,
                                  ItemName = a.CardName,
                                  ItemType = "Card",
                                  Progress = a.Completed.ToString() + "%",
                                  WeightNum = a.WeightNum,
                                  ItemLevel = "3",
                                  ItemParent = child.ItemCode,
                              }
                    ).ToList();
                listDataDiagram.Add(child);
                listDataDiagram.AddRange(listCard);
            }

            data.Progress = projectProgress.ToString() + "%";

            var rs = listDataDiagram;
            return Json(rs);
        }

        private decimal GetProgress(string itemCode, string itemLevel)
        {
            if (itemLevel == "1")
            {
                var query1 = (from a in _context.WORKOSCards.Where(x => !x.IsDeleted)
                              join b in _context.ItemPlanJobCards.Where(x => !x.IsDeleted && x.ItemCode == itemCode)
                                  on a.CardCode equals b.JobcardCode
                              select (a.Completed * b.Weight / 100)
                    ).ToList();
                return query1.Sum();
            }
            else
            {
                var listChild =
                    (from a in _context.ProjectItemPlans.Where(x => !x.IsDeleted && x.ItemParent == itemCode) select a).ToList();
                var listProgress = listChild.Select(x => GetProgress(x.ItemCode, x.ItemLevel) * x.ItemWeight / 100).ToList();
                return listProgress.Sum();
            }
        }
        public class ProjectGanttProgress
        {
            public int ProjectID { get; set; }
            public string ProjectCode { get; set; }
            public string ProjectName { get; set; }
            public string StartTime { get; set; }
            public string EndTime { get; set; }
            public int ItemId { get; set; }
            public string ItemCode { get; set; }
            public string ItemLevel { get; set; }
            public string ItemTitle { get; set; }
            public string BeginTime { get; set; }
            public string Deadline { get; set; }
            public decimal Completed { get; set; }
            public decimal WeightNum { get; set; }
        }
        [HttpPost]
        public JsonResult GetProjectProgres(string projectCode)
        {
            var msg = new JMessage();
            try
            {
                var query = (from a in _context.ProjectItemPlans.Where(x => !x.IsDeleted && x.ProjectCode == projectCode && x.ItemLevel == "0")
                             join b in _context.Projects.Where(x => !x.FlagDeleted && x.ProjectCode == projectCode) on a.ProjectCode
                                 equals b.ProjectCode
                             select new ProjectGanttProgress
                             {
                                 ProjectID = b.Id,
                                 ProjectCode = b.ProjectCode,
                                 ProjectName = b.ProjectTitle,
                                 StartTime = b.StartTime.ToString("MM/dd/yyyy"),
                                 EndTime = b.EndTime.ToString("MM/dd/yyyy"),
                                 ItemId = a.Id,
                                 ItemCode = a.ItemCode,
                                 ItemLevel = a.ItemLevel,
                                 ItemTitle = a.ItemName,
                                 BeginTime = b.StartTime.ToString("MM/dd/yyyy"),
                                 Deadline = b.EndTime.ToString("MM/dd/yyyy"),
                                 WeightNum = a.ItemWeight
                             }).ToList();
                foreach (var item in query)
                {
                    //var query1 = (from a in _context.WORKOSCards.Where(x => !x.IsDeleted)
                    //        join b in _context.ItemPlanJobCards.Where(x => !x.IsDeleted && x.ItemCode == item.ItemCode)
                    //            on a.CardCode equals b.JobcardCode
                    //        select (a.Completed * b.Weight / 100)
                    //    ).ToList();
                    item.Completed = GetProgress(item.ItemCode, item.ItemLevel);
                }
                var result = from a in query
                             group a by a.ProjectID into g2
                             select new
                             {
                                 ListProgress = g2.Select(
                                     x => new
                                     {
                                         x.ItemId,
                                         x.ItemCode,
                                         x.ItemTitle,
                                         BeginTime = x.BeginTime,
                                         Deadline = x.Deadline,
                                         Completed = x.Completed
                                     }),
                                 DetailBoard = new
                                 {
                                     ProjectID = g2.Key,
                                     g2.FirstOrDefault().ProjectName,
                                     g2.FirstOrDefault().StartTime,
                                     g2.FirstOrDefault().EndTime,
                                     //g2.FirstOrDefault().Duration,
                                     Completed = g2.Count() > 0 ? g2.Sum(x => x.Completed * x.WeightNum / 100) / g2.Count() : 0,
                                 }
                             };
                msg.Object = result;
            }
            catch (Exception ex)
            {
                msg.Error = true;
            }

            return Json(msg);
        }
        #endregion

        #region GetComboboxValue


        [HttpPost]
        public object GetItemCustomers(int id)
        {
            var a = _context.Projects.FirstOrDefault(m => m.Id == id);
            return Json(a);
            //var data = _context.Customerss.Where(x=>x.CusID==id).Select(x => new { Code = x.CusCode }).ToList();
            //return Json(data);
        }

        [HttpPost]
        public object GetProjectUnit()
        {
            var data = GetCurrencyBase();
            return Json(data);
        }

        [HttpPost]
        public object GetProjectType()
        {
            return _context.CommonSettings.Where(x => x.Group == EnumHelper<ProjectEnum>.GetDisplayValue(ProjectEnum.ProType)).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
        }

        [HttpPost]
        public object GetBoard()
        {
            return _context.WORKOSBoards.Where(x => !x.IsDeleted).Select(x => new { Code = x.BoardCode, Name = x.BoardName });
        }

        [HttpPost]
        public object GetListUser()
        {
            var query = _context.Users.Where(x => x.Active && x.UserName != "admin").Select(x => new { Code = x.Id, Name = x.GivenName }).AsNoTracking().ToList();
            return query;
        }

        [HttpPost]
        public object GetListProject()
        {
            var query = _context.Projects.Where(x => !x.FlagDeleted).Select(x => new { Code = x.ProjectCode, Name = x.ProjectTitle }).AsNoTracking();
            return query;
        }
        [HttpPost]
        public object GetListCustomers()
        {
            var data = _context.Customerss.Where(x => !x.IsDeleted).OrderByDescending(x => x.CusID).Select(x => new
            {
                Code = x.CusCode,
                Name = x.CusName,
                NameJoin = string.Concat("KH - ", x.CusName),
                Type = EnumHelper<CustomerEnum>.GetDisplayValue(CustomerEnum.Customer)
            });
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetListSupplier()
        {
            var query = _context.Suppliers.Where(x => !x.IsDeleted).Select(x => new
            {
                Code = x.SupCode,
                Name = x.SupName,
                NameJoin = string.Concat("NCC - ", x.SupName),
                Type = EnumHelper<SupplierEnum>.GetDisplayValue(SupplierEnum.Supplier)
            });
            return Json(query);
        }

        [HttpPost]
        public JsonResult GetStatus()
        {
            var data = _context.CommonSettings.Where(x => x.Group == "PROJECT_STATUS" && !x.IsDeleted).OrderBy(x => x.Priority).Select(x => new { Code = x.CodeSet, Name = x.ValueSet, Icon = x.Logo });
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetBranch()
        {
            var data = _context.AdOrganizations.Where(x => x.IsEnabled).Select(x => new { Code = x.OrgAddonCode, Name = x.OrgName });
            return Json(data);
        }
        #endregion

        #region index
        public class Wei
        {
            public decimal WeightNum { get; set; }
            public decimal Completed { get; set; }
        }
        [HttpPost]
        public object JTable([FromBody] JTableModelProject jTablePara)
        {
            var list = new List<JtableViewModel>();
            var count = 0;
            if (jTablePara.SearchTab == "PRODUCT")
            {
                var obj = JTableProductAll(jTablePara);
                list = obj.Item1;
                count = obj.Item2;
            }
            else if (jTablePara.SearchTab == "SERVICE")
            {
                var obj = JTableServiceAll(jTablePara);
                list = obj.Item1;
                count = obj.Item2;
            }
            else if (jTablePara.SearchTab == "PAYMENT")
            {
                var obj = JTablePaymentAll(jTablePara);
                list = obj.Item1;
                count = obj.Item2;
            }
            var jdata = JTableHelper.JObjectTable(list, jTablePara.Draw, count, "Id", "Code", "Name", "Currency",
                "IsShowPercent", "Budget", "StartTime", "EndTime", "Status", "SetPriority", "CustomerCode", "CustomerName", "SupplierCode", "SupplierName", "ExpirationDate",
                "RenewalDate", "PaymentNextDate", "IsViewed", "Progress", "IsRead", "TotalImportCost", "TotalExportCost", "TotalSurplus");
            return Json(jdata);
        }

        [AllowAnonymous]
        [HttpPost]
        public object ExportExcel([FromBody] JTableModelProject jTablePara)
        {
            var listData = new List<JtableViewModel>();
            jTablePara.IsExportExcel = true;
            if (jTablePara.SearchTab == "PRODUCT")
            {
                listData = JTableProductAll(jTablePara).Item1;
            }
            else if (jTablePara.SearchTab == "SERVICE")
            {
                listData = JTableServiceAll(jTablePara).Item1;
            }
            else if (jTablePara.SearchTab == "PAYMENT")
            {
                listData = JTablePaymentAll(jTablePara).Item1;
            }
            var listExport = new List<ExportViewModel>();
            var no = 1;
            foreach (var item in listData)
            {
                var itemExport = new ExportViewModel();

                itemExport.No = no;
                var priority = item.SetPriority == 1 ? "Cao" :
                    item.SetPriority == 2 ? "Trung bình" :
                    item.SetPriority == 3 ? "Thấp" : "";
                itemExport.Code = item.Code + (priority != "" ? $" [ {priority} ]" : "");
                itemExport.Name = item.Name;
                itemExport.Budget = item.Budget;
                itemExport.Progress = item.Progress;
                itemExport.SStartTime = item.StartTime.ToString("dd/MM/yyyy");
                itemExport.SEndTime = item.EndTime.ToString("dd/MM/yyyy");
                itemExport.ExpirationDate = item.ExpirationDate;
                itemExport.RenewalDate = item.RenewalDate;
                itemExport.PaymentNextDate = item.PaymentNextDate;
                itemExport.Status = item.Status;

                no = no + 1;
                listExport.Add(itemExport);
            }

            ExcelEngine excelEngine = new ExcelEngine();
            IApplication application = excelEngine.Excel;
            application.DefaultVersion = ExcelVersion.Excel2016;
            IWorkbook workbook = application.Workbooks.Create(1);
            workbook.Version = ExcelVersion.Excel2016;
            IWorksheet sheetRequest = workbook.Worksheets.Create("DanhMucDuAn");
            workbook.Worksheets[0].Remove();
            IMigrantRange migrantRange = workbook.Worksheets[0].MigrantRange;
            sheetRequest.Range["A1"].ColumnWidth = 24;
            sheetRequest.Range["B1"].ColumnWidth = 24;
            sheetRequest.Range["C1"].ColumnWidth = 24;
            sheetRequest.Range["D1"].ColumnWidth = 24;
            sheetRequest.Range["E1"].ColumnWidth = 24;
            sheetRequest.Range["F1"].ColumnWidth = 24;
            sheetRequest.Range["G1"].ColumnWidth = 24;
            sheetRequest.Range["H1"].ColumnWidth = 24;
            sheetRequest.Range["I1"].ColumnWidth = 24;
            //sheetRequest.Range["I1"].ColumnWidth = 24;
            sheetRequest.Range["J1"].ColumnWidth = 24;
            sheetRequest.Range["K1"].ColumnWidth = 24;


            sheetRequest.Range["A1:K1"].Merge(true);

            sheetRequest.Range["A1"].Text = "Danh mục dự án";
            sheetRequest.Range["A1"].CellStyle.Font.FontName = "Calibri";
            sheetRequest.Range["A1"].CellStyle.Font.Bold = true;
            sheetRequest.Range["A1"].CellStyle.Font.Size = 24;
            sheetRequest.Range["A1"].CellStyle.Font.RGBColor = Color.FromArgb(0, 0, 176, 240);
            sheetRequest.Range["A1"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.ImportData(listExport, 2, 1, true);
            sheetRequest["D3:D" + (listExport.Count() + 2)].NumberFormat = "###,##";

            sheetRequest["A2"].Text = "TT";
            sheetRequest["B2"].Text = "Mã dự án";
            sheetRequest["C2"].Text = "Tên dự án";
            sheetRequest["D2"].Text = "Số tiền";
            sheetRequest["E2"].Text = "Tiến độ";
            sheetRequest["F2"].Text = "Ngày bắt đầu";
            sheetRequest["G2"].Text = "Ngày kết thúc";
            sheetRequest["H2"].Text = "Ngày hết hạn";
            sheetRequest["I2"].Text = "Ngày GH tiếp theo";
            sheetRequest["J2"].Text = "Ngày TT tiếp theo";
            sheetRequest["K2"].Text = "Trạng thái";



            IStyle tableHeader = workbook.Styles.Add("TableHeaderStyle");
            tableHeader.Font.Color = ExcelKnownColors.White;
            tableHeader.Font.Bold = true;
            tableHeader.Font.Size = 11;
            tableHeader.Font.FontName = "Calibri";
            tableHeader.HorizontalAlignment = ExcelHAlign.HAlignCenter;
            tableHeader.VerticalAlignment = ExcelVAlign.VAlignCenter;
            tableHeader.Color = Color.FromArgb(0, 0, 122, 192);
            tableHeader.Borders[ExcelBordersIndex.EdgeLeft].LineStyle = ExcelLineStyle.None;
            tableHeader.Borders[ExcelBordersIndex.EdgeRight].LineStyle = ExcelLineStyle.None;
            tableHeader.Borders[ExcelBordersIndex.EdgeTop].LineStyle = ExcelLineStyle.None;
            tableHeader.Borders[ExcelBordersIndex.EdgeBottom].LineStyle = ExcelLineStyle.None;
            tableHeader.Borders[ExcelBordersIndex.EdgeBottom].LineStyle = ExcelLineStyle.None;
            sheetRequest["A2:K2"].CellStyle = tableHeader;
            sheetRequest.Range["A2:K2"].RowHeight = 20;
            sheetRequest.UsedRange.AutofitColumns();

            //string ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            var fileName = "ExportDanhMucDuAn" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".xls";
            var pathFile = _hostingEnvironment.WebRootPath + "\\uploads\\tempFile\\" + fileName;
            var pathFileDownLoad = "\\uploads\\tempFile\\" + fileName;
            FileStream stream = new FileStream(pathFile, FileMode.Create, FileAccess.ReadWrite);
            workbook.SaveAs(stream);
            stream.Dispose();

            var obj = new
            {
                fileName,
                pathFile = pathFileDownLoad
            };
            return obj;
        }

        [HttpPost]
        public (List<JtableViewModel>, int) JTableProductAll([FromBody] JTableModelProject jTablePara)
        {
            try
            {
                var session = HttpContext.GetSessionUser();
                int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
                var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var query = (
                            from e in _context.Projects /*on b.ProjectCode equals e.ProjectCode*/
                            join f in _context.Users on e.CreatedBy equals f.UserName
                            join b in _context.ProjectProductHeaders.Where(x => !x.IsDeleted) on e.ProjectCode equals b.ProjectCode into b1
                            from b in b1.DefaultIfEmpty()
                            join a in _context.ProjectProductDetails.Where(x => !x.IsDeleted) on b.TicketCode equals a.TicketCode into a1
                            from a in a1.DefaultIfEmpty()
                            join c in _context.MaterialProducts.Where(x => !x.IsDeleted) on a.ProductCode equals c.ProductCode into c1
                            from c in c1.DefaultIfEmpty()
                            join d in _context.CommonSettings on a.Unit equals d.CodeSet into d1
                            from d in d1.DefaultIfEmpty()
                            join g in _context.Customerss.Where(x => !x.IsDeleted) on e.CustomerCode equals g.CusCode into g1
                            from g in g1.DefaultIfEmpty()
                            join h in _context.Suppliers.Where(x => !x.IsDeleted) on e.SupplierCode equals h.SupCode into h1
                            from h in h1.DefaultIfEmpty()
                            join m in _context.ProjectMembers.Where(x => !x.FlagDeleted && x.MemberCode == session.UserId) on e.ProjectCode equals m.ProjectCode into m1
                            from m in m1.DefaultIfEmpty()
                                //let members =
                                //     _context.ProjectMembers.Where(x => !x.FlagDeleted && x.ProjectCode.Equals(e.ProjectCode))
                            where (!e.FlagDeleted)
                                  && (fromDate == null || (e.StartTime >= fromDate))
                                  && (toDate == null || (e.EndTime <= toDate))
                                  && (string.IsNullOrEmpty(jTablePara.ProjectCode) || e.ProjectCode == jTablePara.ProjectCode)
                                  && (string.IsNullOrEmpty(jTablePara.CustomerCode) || (!string.IsNullOrEmpty(e.CustomerCode) &&
                                      e.CustomerCode.Equals(jTablePara.CustomerCode)))
                                  && (string.IsNullOrEmpty(jTablePara.SupplierCode) || (!string.IsNullOrEmpty(e.SupplierCode) &&
                                      e.SupplierCode.Equals(jTablePara.SupplierCode)))
                                  && (string.IsNullOrEmpty(jTablePara.StatusObject) || (!string.IsNullOrEmpty(e.StatusObject) &&
                                      e.StatusObject.Equals(jTablePara.StatusObject)))
                                  && (string.IsNullOrEmpty(jTablePara.PortType) || b != null && b.PortType == jTablePara.PortType)
                                  && (string.IsNullOrEmpty(jTablePara.ProductCode) || a != null && a.ProductCode == jTablePara.ProductCode)
                                    && (session.IsAllData
                                           || (!session.IsAllData && session.IsBranch &&
                                               session.RoleCode.Equals(EnumHelper<Role>.GetDisplayValue(Role.Giamdoc)) &&
                                               session.ListUserOfBranch.Any(x => x == e.CreatedBy))
                                           || (!session.IsAllData && !session.IsBranch && session.IsUser &&
                                               (session.UserName == e.CreatedBy || m != null)))
                            select new
                            {
                                Id = a != null ? a.Id : -1,
                                ProductCode = a != null ? (a.ProductCode + " - " + c.ProductName) : "",
                                Code = a != null ? a.ProductCode : "",
                                Cost = a != null ? (a.Cost ?? 0) : 0,
                                Quantity = a != null ? a.Quantity : 0,
                                Unit = a != null ? a.Unit : "",
                                //PriceType = a.PriceType,
                                //Tax = a.Tax,
                                Note = b != null ? b.Note : "",
                                HeaderId = b != null ? b.Id : -1,
                                PortType = b != null ? b.PortType : "",
                                HeaderName = b != null ? b.Title : "",
                                UnitName = d != null ? d.ValueSet : "",
                                //TaxMoney = Math.Round(Convert.ToDouble(a.Cost) * Convert.ToDouble(a.Tax) * Convert.ToDouble(a.Quantity) / 100),
                                ListStatusObjectLog = b != null ? b.ListStatusObjectLog : new List<JsonLog>(),
                                ProjectItem = e,
                                CustomerName = g != null ? g.CusName : "",
                                SupplierName = h != null ? h.SupName : "",
                            } into a1
                            group a1 by a1.ProjectItem into g
                            //Điều kiện phân quyền dữ liệu
                            select new JtableViewModel
                            {
                                Id = g.Key.Id,
                                Code = g.First().ProjectItem.ProjectCode,
                                Name = g.First().ProjectItem.ProjectTitle,
                                Currency = g.First().ProjectItem.Currency,
                                Budget = g.First().ProjectItem.Budget,
                                StartTime = g.First().ProjectItem.StartTime,
                                EndTime = g.First().ProjectItem.EndTime,
                                SetPriority = g.First().ProjectItem.SetPriority,
                                CustomerCode = g.First().ProjectItem.CustomerCode,
                                CustomerName = g.First().CustomerName,
                                SupplierCode = g.First().ProjectItem.SupplierCode,
                                SupplierName = g.First().SupplierName,
                                IsViewed = !string.IsNullOrEmpty(g.First().ProjectItem.ListUserView) && g.First().ProjectItem.ListUserView.Contains(AppContext.UserId),
                                Status = g.First().ProjectItem.StatusObject,
                                TotalImportCost = g.Any(x => x.PortType == "IMPORT")
                                    ? g.Where(x => x.PortType == "IMPORT")
                                        .Sum(x => x.Quantity * x.Cost)
                                    : 0,
                                TotalExportCost = g.Any(x => x.PortType == "EXPORT")
                                    ? g.Where(x => x.PortType == "EXPORT")
                                        .Sum(x => x.Quantity * x.Cost)
                                    : 0,
                            }).ToList();
                var count = query.Count();
                var length = jTablePara.Length;
                var queryOrderBy = jTablePara.QueryOrderBy;
                if (jTablePara.IsExportExcel == true)
                {
                    intBeginFor = 0;
                    length = count;
                    queryOrderBy = "";
                }
                var query1 = query.AsQueryable().OrderUsingSortExpression(queryOrderBy).Skip(intBeginFor).Take(length).AsNoTracking().ToList();
                var data = query1.Select(x => new JtableViewModel
                {
                    Id = x.Id,
                    Code = x.Code,
                    Name = x.Name,
                    Currency = _context.CommonSettings.FirstOrDefault(y => !y.IsDeleted && y.CodeSet == x.Currency)?.ValueSet,
                    Budget = x.Budget,
                    StartTime = x.StartTime,
                    IsShowPercent = false,
                    EndTime = x.EndTime,
                    SetPriority = x.SetPriority,
                    CustomerCode = x.CustomerCode,
                    CustomerName = x.CustomerName,
                    SupplierCode = x.SupplierCode,
                    SupplierName = x.SupplierName,
                    IsViewed = x.IsViewed,
                    Status = _context.CommonSettings.FirstOrDefault(y => y.CodeSet == x.Status && !y.IsDeleted)?.ValueSet,
                    ExpirationDate = _context.AttributeManagerGalaxys.LastOrDefault(p => p.AttrCode.Equals("NGAY_HET_HAN") && p.ObjCode.Equals(x.Code)) != null ? _context.AttributeManagerGalaxys.LastOrDefault(p => p.AttrCode.Equals("NGAY_HET_HAN") && p.ObjCode.Equals(x.Code))?.AttrValue : "",
                    RenewalDate = _context.AttributeManagerGalaxys.LastOrDefault(p => p.AttrCode.Equals("NGAY_GIA_HAN_TIEP_THEO") && p.ObjCode.Equals(x.Code)) != null ? _context.AttributeManagerGalaxys.LastOrDefault(p => p.AttrCode.Equals("NGAY_GIA_HAN_TIEP_THEO") && p.ObjCode.Equals(x.Code))?.AttrValue : "",
                    PaymentNextDate = _context.AttributeManagerGalaxys.LastOrDefault(p => p.AttrCode.Equals("NGAY_THANH_TOAN_TIEP_THEO") && p.ObjCode.Equals(x.Code)) != null ? _context.AttributeManagerGalaxys.LastOrDefault(p => p.AttrCode.Equals("NGAY_THANH_TOAN_TIEP_THEO") && p.ObjCode.Equals(x.Code))?.AttrValue : "",
                    Progress = 0,
                    IsRead = GetIsReadNotification(x.Code, EnumHelper<NotificationType>.GetDisplayValue(NotificationType.Project)),
                    TotalImportCost = x.TotalImportCost,
                    TotalExportCost = x.TotalExportCost,
                    TotalSurplus = x.TotalExportCost - x.TotalImportCost
                }).ToList();
                //var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "Code", "Name", "Currency",
                //    "IsShowPercent", "Budget", "StartTime", "EndTime", "Status", "SetPriority", "CustomerCode", "CustomerName", "SupplierCode", "SupplierName", "ExpirationDate",
                //    "RenewalDate", "PaymentNextDate", "IsViewed", "Progress", "IsRead", "TotalImportCost", "TotalExportCost", "TotalSurplus");
                return (data, count);
            }
            catch (Exception ex)
            {
                var list = new List<JtableViewModel>();
                //var jdata = JTableHelper.JObjectTable(list, jTablePara.Draw, 0, "Id", "Code", "Name", "Currency",
                //    "IsShowPercent", "Budget", "StartTime", "EndTime", "Status", "SetPriority", "CustomerCode", "CustomerName", "SupplierCode", "SupplierName", "ExpirationDate",
                //    "RenewalDate", "PaymentNextDate", "IsViewed", "Progress", "IsRead", "TotalImportCost", "TotalExportCost", "TotalSurplus");
                //jdata.Add("exceptionMessage", ex.Message);
                return (list, 0);
            }
        }

        [HttpPost]
        public (List<JtableViewModel>, int) JTablePaymentAll([FromBody] JTableModelProject jTablePara)
        {
            try
            {
                var session = HttpContext.GetSessionUser();
                int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
                var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var query = (
                            from e in _context.Projects /*on b.ProjectCode equals e.ProjectCode*/
                            join f in _context.Users on e.CreatedBy equals f.UserName
                            join a in _context.FundAccEntrys
                                .Where(x => !x.IsDeleted
                                            //&& x.IsPlan == false
                                            && x.ObjType == "PROJECT"
                                ) on e.ProjectCode equals a.ObjCode into a1
                            from a in a1.DefaultIfEmpty()
                            join b in _context.FundCatReptExpss.Where(x => x.IsDeleted == false) on a.CatCode equals b.CatCode into b1
                            from b in b1.DefaultIfEmpty()
                            join c in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals("STATUS_FUND")) on a.StatusObject equals c.CodeSet into c1
                            from c in c1.DefaultIfEmpty()
                            join m in _context.ProjectMembers.Where(x => !x.FlagDeleted && x.MemberCode == session.UserId) on e.ProjectCode equals m.ProjectCode into m1
                            from m in m1.DefaultIfEmpty()
                                //let members =
                                //     _context.ProjectMembers.Where(x => !x.FlagDeleted && x.ProjectCode.Equals(e.ProjectCode))
                            where (!e.FlagDeleted)
                                  && (fromDate == null || (e.StartTime >= fromDate))
                                  && (toDate == null || (e.EndTime <= toDate))
                                  && (string.IsNullOrEmpty(jTablePara.ProjectCode) || e.ProjectCode == jTablePara.ProjectCode)
                                  //&& (string.IsNullOrEmpty(jTablePara.CustomerCode) || (!string.IsNullOrEmpty(e.CustomerCode) &&
                                  //    e.CustomerCode.Equals(jTablePara.CustomerCode)))
                                  //&& (string.IsNullOrEmpty(jTablePara.SupplierCode) || (!string.IsNullOrEmpty(e.SupplierCode) &&
                                  //    e.SupplierCode.Equals(jTablePara.SupplierCode)))
                                  && (string.IsNullOrEmpty(jTablePara.StatusObject) || (!string.IsNullOrEmpty(e.StatusObject) &&
                                      e.StatusObject.Equals(jTablePara.StatusObject)))
                                  && (string.IsNullOrEmpty(jTablePara.AetType) || a != null && a.AetType == jTablePara.AetType)
                                  && (string.IsNullOrEmpty(jTablePara.CatCode) || b != null && b.CatCode == jTablePara.CatCode)
                            //Điều kiện phân quyền dữ liệu
                                  && (session.IsAllData
                                      || (!session.IsAllData && session.IsBranch &&
                                          session.RoleCode.Equals(EnumHelper<Role>.GetDisplayValue(Role.Giamdoc)) &&
                                          session.ListUserOfBranch.Any(x => x == e.CreatedBy))
                                      || (!session.IsAllData && !session.IsBranch && session.IsUser &&
                                          (session.UserName == e.CreatedBy || m != null)))
                            select new
                            {
                                Id = a != null ? a.Id : -1,
                                AetCode = a != null ? a.AetCode : "",
                                Title = a != null ? a.Title : "",
                                AetType = a != null ? a.AetType : "",
                                AetTypeName = a != null && a.AetType == "Expense" ? "Chi" : "Thu",
                                CatCode = a != null ? a.CatCode : "",
                                CatName = b != null ? b.CatName : "",
                                DeadLine = a != null ? a.DeadLine : null,
                                Payer = a != null ? a.Payer : "",
                                Receiptter = a != null ? a.Receiptter : "",
                                Total = a != null ? a.Total : 0,
                                Currency = a != null ? a.Currency : "",
                                CreatedBy = a != null ? a.CreatedBy : "",
                                Status = a != null ? a.Status : "",
                                AetRelativeType = a != null ? a.AetRelativeType : "",
                                AetDescription = a != null ? a.AetDescription : "",
                                IsApprove = 0,
                                TimeAlive = "",
                                IsOutTime = 0,
                                IsEndActApproved = a != null ? a.ListStatusObjectLog.GroupBy(x => x.ObjectRelative)
                                    .Select(g => new JsonLog
                                    {
                                        Code = g.OrderByDescending(x => x.CreatedTime).FirstOrDefault().Code,
                                        Name = g.OrderByDescending(x => x.CreatedTime).FirstOrDefault().Name,
                                        ObjectRelative = g.Key,
                                        ObjectType = g.OrderByDescending(x => x.CreatedTime).FirstOrDefault().ObjectType,
                                        CreatedBy = g.OrderByDescending(x => x.CreatedTime).FirstOrDefault().CreatedBy,
                                        CreatedTime = g.OrderByDescending(x => x.CreatedTime).FirstOrDefault().CreatedTime
                                    })
                                    .Any(x =>
                                        x.ObjectType == EnumHelper<TypeActivity>.GetDisplayValue(TypeActivity.EndAct)
                                        && x.Code == "STATUS_ACTIVITY_END") : false,
                                ProjectItem = e
                                //CustomerName = g != null ? g.CusName : "",
                                //SupplierName = h != null ? h.SupName : "",
                            } into a1
                            group a1 by a1.ProjectItem.ProjectCode into g
                            select new JtableViewModel
                            {
                                Id = g.First().ProjectItem.Id,
                                Code = g.First().ProjectItem.ProjectCode,
                                Name = g.First().ProjectItem.ProjectTitle,
                                Currency = g.First().ProjectItem.Currency,
                                Budget = g.First().ProjectItem.Budget,
                                StartTime = g.First().ProjectItem.StartTime,
                                EndTime = g.First().ProjectItem.EndTime,
                                SetPriority = g.First().ProjectItem.SetPriority,
                                CustomerCode = g.First().ProjectItem.CustomerCode,
                                //CustomerName = g.First().CustomerName,
                                SupplierCode = g.First().ProjectItem.SupplierCode,
                                //SupplierName = g.First().SupplierName,
                                IsViewed = !string.IsNullOrEmpty(g.First().ProjectItem.ListUserView) && g.First().ProjectItem.ListUserView.Contains(AppContext.UserId),
                                Status = g.First().ProjectItem.StatusObject,
                                TotalImportCost = g.Any(x => x.AetType == "Expense" && x.IsEndActApproved == true)
                                    ? g.Where(x => x.AetType == "Expense" && x.IsEndActApproved == true)
                                        .Sum(x => x.Total)
                                    : 0,
                                TotalExportCost = g.Any(x => x.AetType == "Receipt" && x.IsEndActApproved == true)
                                    ? g.Where(x => x.AetType == "Receipt" && x.IsEndActApproved == true)
                                        .Sum(x => x.Total)
                                    : 0,
                                TotalSurplus = g.Any() ? g.Where(x => x.AetType == "Receipt" && x.IsEndActApproved == true)
                                    .Sum(x => x.Total) - g.Where(x => x.AetType == "Expense" && x.IsEndActApproved == true)
                                    .Sum(x => x.Total) : 0
                            }).ToList();
                var count = query.Count();
                var length = jTablePara.Length;
                var queryOrderBy = jTablePara.QueryOrderBy;
                if (jTablePara.IsExportExcel == true)
                {
                    intBeginFor = 0;
                    length = count;
                    queryOrderBy = "";
                }
                // Final surplus condition
                var query1 = query.Where(x => (jTablePara.SurplusStart == null || (x.TotalSurplus >= jTablePara.SurplusStart))
                                              && (jTablePara.SurplusEnd == null || (x.TotalSurplus <= jTablePara.SurplusEnd)))
                    .AsQueryable()
                    .OrderUsingSortExpression(queryOrderBy).Skip(intBeginFor).Take(length).AsNoTracking().ToList();
                var data = query1.Select(x => new JtableViewModel
                {
                    Id = x.Id,
                    Code = x.Code,
                    Name = x.Name,
                    Currency = _context.CommonSettings.FirstOrDefault(y => !y.IsDeleted && y.CodeSet == x.Currency)?.ValueSet,
                    Budget = x.Budget,
                    StartTime = x.StartTime,
                    IsShowPercent = false,
                    EndTime = x.EndTime,
                    SetPriority = x.SetPriority,
                    CustomerCode = x.CustomerCode,
                    CustomerName = x.CustomerName,
                    SupplierCode = x.SupplierCode,
                    SupplierName = x.SupplierName,
                    IsViewed = x.IsViewed,
                    Status = _context.CommonSettings.FirstOrDefault(y => y.CodeSet == x.Status && !y.IsDeleted)?.ValueSet,
                    ExpirationDate = _context.AttributeManagerGalaxys.LastOrDefault(p => p.AttrCode.Equals("NGAY_HET_HAN") && p.ObjCode.Equals(x.Code)) != null ? _context.AttributeManagerGalaxys.LastOrDefault(p => p.AttrCode.Equals("NGAY_HET_HAN") && p.ObjCode.Equals(x.Code))?.AttrValue : "",
                    RenewalDate = _context.AttributeManagerGalaxys.LastOrDefault(p => p.AttrCode.Equals("NGAY_GIA_HAN_TIEP_THEO") && p.ObjCode.Equals(x.Code)) != null ? _context.AttributeManagerGalaxys.LastOrDefault(p => p.AttrCode.Equals("NGAY_GIA_HAN_TIEP_THEO") && p.ObjCode.Equals(x.Code))?.AttrValue : "",
                    PaymentNextDate = _context.AttributeManagerGalaxys.LastOrDefault(p => p.AttrCode.Equals("NGAY_THANH_TOAN_TIEP_THEO") && p.ObjCode.Equals(x.Code)) != null ? _context.AttributeManagerGalaxys.LastOrDefault(p => p.AttrCode.Equals("NGAY_THANH_TOAN_TIEP_THEO") && p.ObjCode.Equals(x.Code))?.AttrValue : "",
                    Progress = 0,
                    IsRead = GetIsReadNotification(x.Code, EnumHelper<NotificationType>.GetDisplayValue(NotificationType.Project)),
                    TotalImportCost = x.TotalImportCost,
                    TotalExportCost = x.TotalExportCost,
                    TotalSurplus = x.TotalSurplus
                }).ToList();
                //var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "Code", "Name", "Currency",
                //    "IsShowPercent", "Budget", "StartTime", "EndTime", "Status", "SetPriority", "CustomerCode", "CustomerName", "SupplierCode", "SupplierName", "ExpirationDate",
                //    "RenewalDate", "PaymentNextDate", "IsViewed", "Progress", "IsRead", "TotalImportCost", "TotalExportCost", "TotalSurplus");
                return (data, count);
            }
            catch (Exception ex)
            {
                var list = new List<JtableViewModel>();
                //var jdata = JTableHelper.JObjectTable(list, jTablePara.Draw, 0, "Id", "Code", "Name", "Currency",
                //    "IsShowPercent", "Budget", "StartTime", "EndTime", "Status", "SetPriority", "CustomerCode", "CustomerName", "SupplierCode", "SupplierName", "ExpirationDate",
                //    "RenewalDate", "PaymentNextDate", "IsViewed", "Progress", "IsRead", "TotalImportCost", "TotalExportCost", "TotalSurplus");
                //jdata.Add("exceptionMessage", ex.Message);
                return (list, 0);
            }
        }

        [HttpPost]
        public (List<JtableViewModel>, int) JTableServiceAll([FromBody] JTableModelProject jTablePara)
        {
            try
            {
                var session = HttpContext.GetSessionUser();
                int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
                var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var query = (
                            from e in _context.Projects /*on b.ProjectCode equals e.ProjectCode*/
                            join f in _context.Users on e.CreatedBy equals f.UserName
                            join b in _context.ProjectServiceHeaders.Where(x => !x.IsDeleted) on e.ProjectCode equals b.ProjectCode into b1
                            from b in b1.DefaultIfEmpty()
                            join a in _context.ProjectServiceDetails.Where(x => !x.IsDeleted) on b.TicketCode equals a.TicketCode into a1
                            from a in a1.DefaultIfEmpty()
                            join c in _context.ServiceCategorys.Where(x => !x.IsDeleted) on a.ServiceCode equals c.ServiceCode into c1
                            from c in c1.DefaultIfEmpty()
                            join m in _context.ProjectMembers.Where(x => !x.FlagDeleted && x.MemberCode == session.UserId) on e.ProjectCode equals m.ProjectCode into m1
                            from m in m1.DefaultIfEmpty()
                                //let members =
                                //     _context.ProjectMembers.Where(x => !x.FlagDeleted && x.ProjectCode.Equals(e.ProjectCode))
                            where (!e.FlagDeleted)
                                  && (fromDate == null || (e.StartTime >= fromDate))
                                  && (toDate == null || (e.EndTime <= toDate))
                                  && (string.IsNullOrEmpty(jTablePara.ProjectCode) || e.ProjectCode == jTablePara.ProjectCode)
                                  //&& (string.IsNullOrEmpty(jTablePara.CustomerCode) || (!string.IsNullOrEmpty(e.CustomerCode) &&
                                  //    e.CustomerCode.Equals(jTablePara.CustomerCode)))
                                  //&& (string.IsNullOrEmpty(jTablePara.SupplierCode) || (!string.IsNullOrEmpty(e.SupplierCode) &&
                                  //    e.SupplierCode.Equals(jTablePara.SupplierCode)))
                                  && (string.IsNullOrEmpty(jTablePara.StatusObject) || (!string.IsNullOrEmpty(e.StatusObject) &&
                                      e.StatusObject.Equals(jTablePara.StatusObject)))
                                  && (string.IsNullOrEmpty(jTablePara.ServiceCode) || a != null && a.ServiceCode == jTablePara.ServiceCode)
                            //Điều kiện phân quyền dữ liệu
                                  && (session.IsAllData
                                      || (!session.IsAllData && session.IsBranch &&
                                          session.RoleCode.Equals(EnumHelper<Role>.GetDisplayValue(Role.Giamdoc)) &&
                                          session.ListUserOfBranch.Any(x => x == e.CreatedBy))
                                      || (!session.IsAllData && !session.IsBranch && session.IsUser &&
                                          (session.UserName == e.CreatedBy || m != null)))
                            select new
                            {
                                Id = a != null ? a.Id : -1,
                                ServiceCode = a != null ? (a.ServiceCode + " - " + c.ServiceName) : "",
                                Code = a != null ? a.ServiceCode : "",
                                Cost = a != null ? (a.Cost ?? 0) : 0,
                                Quantity = a != null ? a.Quantity : 0,
                                Unit = a != null ? a.Unit : "",
                                //PriceType = a.PriceType,
                                //Tax = a.Tax,
                                Note = b != null ? b.Note : "",
                                HeaderId = b != null ? b.Id : -1,
                                PortType = b != null ? b.PortType : "",
                                HeaderName = b != null ? b.Title : "",
                                //UnitName = d != null ? d.ValueSet : "",
                                //TaxMoney = Math.Round(Convert.ToDouble(a.Cost) * Convert.ToDouble(a.Tax) * Convert.ToDouble(a.Quantity) / 100),
                                ListStatusObjectLog = b != null ? b.ListStatusObjectLog : new List<JsonLog>(),
                                ProjectItem = e,
                                //CustomerName = g != null ? g.CusName : "",
                                //SupplierName = h != null ? h.SupName : "",
                            } into a1
                            group a1 by a1.ProjectItem.ProjectCode into g
                            select new JtableViewModel
                            {
                                Id = g.First().ProjectItem.Id,
                                Code = g.First().ProjectItem.ProjectCode,
                                Name = g.First().ProjectItem.ProjectTitle,
                                Currency = g.First().ProjectItem.Currency,
                                Budget = g.First().ProjectItem.Budget,
                                StartTime = g.First().ProjectItem.StartTime,
                                EndTime = g.First().ProjectItem.EndTime,
                                SetPriority = g.First().ProjectItem.SetPriority,
                                CustomerCode = g.First().ProjectItem.CustomerCode,
                                //CustomerName = g.First().CustomerName,
                                SupplierCode = g.First().ProjectItem.SupplierCode,
                                //SupplierName = g.First().SupplierName,
                                IsViewed = !string.IsNullOrEmpty(g.First().ProjectItem.ListUserView) && g.First().ProjectItem.ListUserView.Contains(AppContext.UserId),
                                Status = g.First().ProjectItem.StatusObject,
                                TotalImportCost = g.Any(x => x.PortType == "IMPORT")
                                    ? g.Where(x => x.PortType == "IMPORT")
                                        .Sum(x => x.Quantity * x.Cost)
                                    : 0,
                                TotalExportCost = g.Any(x => x.PortType == "EXPORT")
                                    ? g.Where(x => x.PortType == "EXPORT")
                                        .Sum(x => x.Quantity * x.Cost)
                                    : 0,
                                TotalSurplus = g.Any() ? g.Where(x => x.PortType == "EXPORT")
                                    .Sum(x => x.Quantity * x.Cost) - g.Where(x => x.PortType == "IMPORT")
                                    .Sum(x => x.Quantity * x.Cost) : 0
                            }).ToList();
                var count = query.Count();
                var length = jTablePara.Length;
                var queryOrderBy = jTablePara.QueryOrderBy;
                if (jTablePara.IsExportExcel == true)
                {
                    intBeginFor = 0;
                    length = count;
                    queryOrderBy = "";
                }
                // Final surplus condition
                var query1 = query.Where(x => (jTablePara.SurplusStart == null || (x.TotalSurplus >= jTablePara.SurplusStart))
                                              && (jTablePara.SurplusEnd == null || (x.TotalSurplus <= jTablePara.SurplusEnd)))
                    .AsQueryable()
                    .OrderUsingSortExpression(queryOrderBy).Skip(intBeginFor).Take(length).AsNoTracking().ToList();
                var data = query1.Select(x => new JtableViewModel
                {
                    Id = x.Id,
                    Code = x.Code,
                    Name = x.Name,
                    Currency = _context.CommonSettings.FirstOrDefault(y => !y.IsDeleted && y.CodeSet == x.Currency)?.ValueSet,
                    Budget = x.Budget,
                    StartTime = x.StartTime,
                    IsShowPercent = false,
                    EndTime = x.EndTime,
                    SetPriority = x.SetPriority,
                    CustomerCode = x.CustomerCode,
                    CustomerName = x.CustomerName,
                    SupplierCode = x.SupplierCode,
                    SupplierName = x.SupplierName,
                    IsViewed = x.IsViewed,
                    Status = _context.CommonSettings.FirstOrDefault(y => y.CodeSet == x.Status && !y.IsDeleted)?.ValueSet,
                    ExpirationDate = _context.AttributeManagerGalaxys.LastOrDefault(p => p.AttrCode.Equals("NGAY_HET_HAN") && p.ObjCode.Equals(x.Code)) != null ? _context.AttributeManagerGalaxys.LastOrDefault(p => p.AttrCode.Equals("NGAY_HET_HAN") && p.ObjCode.Equals(x.Code))?.AttrValue : "",
                    RenewalDate = _context.AttributeManagerGalaxys.LastOrDefault(p => p.AttrCode.Equals("NGAY_GIA_HAN_TIEP_THEO") && p.ObjCode.Equals(x.Code)) != null ? _context.AttributeManagerGalaxys.LastOrDefault(p => p.AttrCode.Equals("NGAY_GIA_HAN_TIEP_THEO") && p.ObjCode.Equals(x.Code))?.AttrValue : "",
                    PaymentNextDate = _context.AttributeManagerGalaxys.LastOrDefault(p => p.AttrCode.Equals("NGAY_THANH_TOAN_TIEP_THEO") && p.ObjCode.Equals(x.Code)) != null ? _context.AttributeManagerGalaxys.LastOrDefault(p => p.AttrCode.Equals("NGAY_THANH_TOAN_TIEP_THEO") && p.ObjCode.Equals(x.Code))?.AttrValue : "",
                    Progress = 0,
                    IsRead = GetIsReadNotification(x.Code, EnumHelper<NotificationType>.GetDisplayValue(NotificationType.Project)),
                    TotalImportCost = x.TotalImportCost,
                    TotalExportCost = x.TotalExportCost,
                    TotalSurplus = x.TotalExportCost - x.TotalImportCost
                }).ToList();
                //var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "Code", "Name", "Currency",
                //    "IsShowPercent", "Budget", "StartTime", "EndTime", "Status", "SetPriority", "CustomerCode", "CustomerName", "SupplierCode", "SupplierName", "ExpirationDate",
                //    "RenewalDate", "PaymentNextDate", "IsViewed", "Progress", "IsRead", "TotalImportCost", "TotalExportCost", "TotalSurplus");
                return (data, count);
            }
            catch (Exception ex)
            {
                var list = new List<JtableViewModel>();
                //var jdata = JTableHelper.JObjectTable(list, jTablePara.Draw, 0, "Id", "Code", "Name", "Currency",
                //    "IsShowPercent", "Budget", "StartTime", "EndTime", "Status", "SetPriority", "CustomerCode", "CustomerName", "SupplierCode", "SupplierName", "ExpirationDate",
                //    "RenewalDate", "PaymentNextDate", "IsViewed", "Progress", "IsRead", "TotalImportCost", "TotalExportCost", "TotalSurplus");
                //jdata.Add("exceptionMessage", ex.Message);
                return (list, 0);
            }
        }

        [NonAction]
        public List<ResultPercentObj> GetPercentObject(string objType, string lstCode, bool isAllData, bool isBranch, bool isUser,
                string userName, string lstUserBranch, string userId, string departmentCode)
        {
            string[] param = { "@ObjType", "@LstObjCode", "@IsAllData", "@IsBranch", "@IsUser", "@UserName", "@ListUserOfBranch", "@UserId", "@DepartmentId" };
            object[] val = { objType, lstCode, isAllData, isBranch, isUser, userName, lstUserBranch, userId, departmentCode };
            DataTable rs = _repositoryService.GetDataTableProcedureSql("P_CAL_OBJECT_PERCENT", param, val);
            var query = CommonUtil.ConvertDataTable<ModePercentObject>(rs);

            var group = query.GroupBy(x => x.ObjID);
            var lst = new List<ResultPercentObj>();
            foreach (var item in group)
            {
                var success = item.Sum(x => (x.Weight * x.Completed) / 100);
                var result = new ResultPercentObj
                {
                    ObjID = item.Key,
                    Completed = success
                };
                lst.Add(result);
            }
            return lst;
        }

        public class ResultPercentObj
        {
            public string ObjID { get; set; }
            public decimal Completed { get; set; }
        }

        public class ModePercentObject
        {
            public string ObjID { get; set; }
            public string CardCode { get; set; }
            public decimal Weight { get; set; }
            public decimal Completed { get; set; }
        }
        public class JtableViewModel
        {
            public int Id { get; set; }
            public string Code { get; set; }
            public string Name { get; set; }
            public string Currency { get; set; }
            public double? Budget { get; set; }
            public DateTime StartTime { get; set; }
            public DateTime EndTime { get; set; }
            public double? SetPriority { get; set; }
            public string CustomerCode { get; set; }
            public string CustomerName { get; set; }
            public string SupplierCode { get; set; }
            public string SupplierName { get; set; }
            public bool IsViewed { get; set; }
            public string Status { get; set; }
            public string ExpirationDate { get; set; }
            public string RenewalDate { get; set; }
            public string PaymentNextDate { get; set; }
            public bool IsShowPercent { get; set; }
            public double Progress { get; set; }
            public bool IsRead { get; set; }
            public decimal? TotalImportCost { get; set; }
            public decimal? TotalExportCost { get; set; }
            public decimal? TotalSurplus { get; set; }
            //public List<ProjectMember> Members { get; set; }
        }
        public class ExportViewModel
        {
            public int No { get; set; }
            public string Code { get; set; }
            public string Name { get; set; }
            public double? Budget { get; set; }
            public double Progress { get; set; }
            public string SStartTime { get; set; }
            public string SEndTime { get; set; }
            public string ExpirationDate { get; set; }
            public string RenewalDate { get; set; }
            public string PaymentNextDate { get; set; }
            public string Status { get; set; }
        }

        [HttpGet]
        public object GetItem(int id)
        {
            var data = _context.Projects.FirstOrDefault(x => !x.FlagDeleted && x.Id == id);
            if (data != null)
            {
                data.ListUserView += ";" + AppContext.UserId;

                RemoveUserInNotify(data.ProjectCode, EnumHelper<NotificationType>.GetDisplayValue(NotificationType.Project), false);
            }
            var session = HttpContext.Session;
            session.SetInt32("IdObject", id);
            var query = (from a in _context.Projects
                         where a.Id == id
                         select new
                         {
                             a.Id,
                             a.ProjectCode,
                             a.ProjectTitle,
                             a.Currency,
                             a.Budget,
                             a.PrjMode,
                             a.SetPriority,
                             a.CaseWorker,
                             StartTime = a.StartTime.ToString("dd/MM/yyyy"),
                             EndTime = a.EndTime.ToString("dd/MM/yyyy"),
                             a.PrjStatus,
                             a.PrjType,
                             a.GoogleMap,
                             a.Address,
                             a.CustomerCode,
                             a.SupplierCode,
                             a.Status,
                             a.WorkflowCat,
                             a.StatusObject,
                             a.ListStatusObjectLog
                         }).First();
            _context.SaveChanges();
            return query;
        }

        [HttpPost]
        public JsonResult Insert([FromBody] ProjectModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var checkExist = _context.Projects.FirstOrDefault(x => x.ProjectCode == obj.ProjectCode && !x.FlagDeleted);
                if (checkExist == null)
                {
                    var statusObjLog = new JsonLog
                    {
                        Code = obj.StatusObject,
                        Name = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(obj.StatusObject)) != null ? _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(obj.StatusObject)).ValueSet : "",
                        CreatedBy = _context.Users.FirstOrDefault(x => x.UserName.Equals(AppContext.UserName)).GivenName,
                        CreatedTime = DateTime.Now,
                    };

                    var listStatusObjLog = new List<JsonLog>();
                    listStatusObjLog.Add(statusObjLog);

                    //add project
                    var budget = !string.IsNullOrEmpty(obj.Budget) ? double.Parse(obj.Budget) : (double?)null;
                    var set = !string.IsNullOrEmpty(obj.SetPriority) ? double.Parse(obj.SetPriority) : (double?)null;
                    var fromto = DateTime.ParseExact(obj.StartTime, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                    var dateto = DateTime.ParseExact(obj.EndTime, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                    var data = new Project
                    {
                        ProjectCode = obj.ProjectCode,
                        ProjectTitle = obj.ProjectTitle,
                        Budget = budget,
                        Currency = obj.Currency,
                        StartTime = fromto,
                        EndTime = dateto,
                        SetPriority = set,
                        PrjStatus = EnumHelper<ProjectStatusEnum>.GetDisplayValue(ProjectStatusEnum.Active),
                        PrjType = obj.PrjType,
                        GoogleMap = obj.GoogleMap,
                        Address = obj.Address,
                        Status = "",
                        CustomerCode = obj.CustomerCode,
                        SupplierCode = obj.SupplierCode,
                        CreatedBy = AppContext.UserName,
                        CreatedTime = DateTime.Now,
                        ListUserView = AppContext.UserId,
                        WorkflowCat = obj.WorkflowCat,
                        StatusObject = obj.StatusObject,
                        ListStatusObjectLog = listStatusObjLog,
                    };
                    _context.Projects.Add(data);
                    _context.SaveChanges();
                    msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_ADD_PROJECT"]);
                    msg.Object = data.Id;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_VALUDE_CODE_EXIST"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_ADD_ERR"]);
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Update([FromBody] ProjectModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                double? budget = !string.IsNullOrEmpty(obj.Budget) ? double.Parse(obj.Budget) : (double?)null;
                double? setPriority = !string.IsNullOrEmpty(obj.SetPriority) ? double.Parse(obj.SetPriority) : (double?)null;
                var fromto = DateTime.ParseExact(obj.StartTime, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                var dateto = DateTime.ParseExact(obj.EndTime, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                var data = _context.Projects.FirstOrDefault(x => x.ProjectCode == obj.ProjectCode && !x.FlagDeleted);
                if (data != null)
                {
                    data.ProjectCode = obj.ProjectCode;
                    data.ProjectTitle = obj.ProjectTitle;
                    data.Budget = budget;
                    data.Currency = obj.Currency;
                    data.StartTime = fromto;
                    data.EndTime = dateto;
                    data.SetPriority = setPriority;
                    data.PrjType = obj.PrjType;
                    data.GoogleMap = obj.GoogleMap;
                    data.Address = obj.Address;
                    data.CustomerCode = obj.CustomerCode;
                    data.SupplierCode = obj.SupplierCode;
                    data.UpdatedTime = DateTime.Now;
                    data.UpdatedBy = AppContext.UserName;
                    data.ListUserView = AppContext.UserId;
                    data.StatusObject = obj.StatusObject;

                    var statusObjLog = new JsonLog
                    {
                        Code = obj.StatusObject,
                        Name = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(obj.StatusObject)) != null ? _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(obj.StatusObject)).ValueSet : "",
                        CreatedBy = _context.Users.FirstOrDefault(x => x.UserName.Equals(AppContext.UserName)).GivenName,
                        CreatedTime = DateTime.Now,
                    };

                    if (data.ListStatusObjectLog.Count > 0)
                    {
                        if (data.ListStatusObjectLog.LastOrDefault()?.Code != obj.StatusObject)
                            data.ListStatusObjectLog.Add(statusObjLog);
                    }
                    else
                    {
                        data.ListStatusObjectLog.Add(statusObjLog);
                    }

                    _context.Projects.Update(data);
                    _context.SaveChanges();
                    msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_UPDATE_SUCCESS"]);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_ERRO_UPPDATE"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_ERRO_UPPDATE"]);
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Delete(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.Projects.FirstOrDefault(x => x.Id == id);
                if (data != null)
                {
                    //Check dự án đã được đưa vào Hợp đồng
                    var chkUsingInContract = _context.PoSaleHeaders.Any(x => !x.IsDeleted && x.PrjCode == data.ProjectCode);
                    if (chkUsingInContract)
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["PROJECT_MSG_CAN_NOT_DEL_PRO_CONTRACT"];
                        return Json(msg);
                    }

                    //Check dự án đã được đưa vào YCĐH
                    var chkUsingReqImp = _context.RequestImpProductHeaders.Any(x => !x.IsDeleted && x.ProjectCode == data.ProjectCode);
                    if (chkUsingReqImp)
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["PROJECT_MSG_CAN_NOT_DEL_PRO_RQ_IMP"];
                        return Json(msg);
                    }

                    data.FlagDeleted = true;
                    _context.Projects.Update(data);

                    //Xóa các bảng chi tiết
                    var listProjectCusSups = _context.ProjectCusSups.Where(x => !x.IsDeleted && x.ProjectCode == data.ProjectCode).ToList();
                    listProjectCusSups.ForEach(x => { x.IsDeleted = true; x.DeletedBy = AppContext.UserName; x.DeletedTime = DateTime.Now.Date; });
                    _context.ProjectCusSups.UpdateRange(listProjectCusSups);

                    var listProjectMembers = _context.ProjectMembers.Where(x => !x.FlagDeleted && x.ProjectCode == data.ProjectCode).ToList();
                    listProjectMembers.ForEach(x => { x.FlagDeleted = true; });
                    _context.ProjectMembers.UpdateRange(listProjectMembers);

                    var listProjectProducts = _context.ProjectProducts.Where(x => x.ProjectCode == data.ProjectCode).ToList();
                    _context.ProjectProducts.RemoveRange(listProjectProducts);

                    var listProjectAttributes = _context.ProjectAttributes.Where(x => x.ProjectCode == data.ProjectCode).ToList();
                    _context.ProjectAttributes.RemoveRange(listProjectAttributes);

                    var listEDMSRepoCatFiles = _context.EDMSRepoCatFiles.Where(x => x.ObjectType == EnumHelper<ProjectEnum>.GetDisplayValue(ProjectEnum.Project) && x.ObjectCode == data.ProjectCode).ToList();
                    _context.EDMSRepoCatFiles.RemoveRange(listEDMSRepoCatFiles);

                    var listProjectNotes = _context.ProjectNotes.Where(x => !x.IsDeleted && x.ProjectCode == data.ProjectCode).ToList();
                    listProjectNotes.ForEach(x => { x.IsDeleted = true; x.DeletedBy = AppContext.UserName; x.DeletedTime = DateTime.Now.Date; });
                    _context.ProjectNotes.UpdateRange(listProjectNotes);

                    var listProjectTeams = _context.ProjectTeams.Where(x => x.ProjectCode == data.ProjectCode).ToList();
                    _context.ProjectTeams.RemoveRange(listProjectTeams);

                    _context.SaveChanges();

                    RemoveUserInNotify(data.ProjectCode, EnumHelper<NotificationType>.GetDisplayValue(NotificationType.Project), true);

                    msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_DELETE_SUCCESS"]);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["PROJECT_MSG_NOT_FOUND_PRO"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_ERRO_DELETE"]);
            }
            return Json(msg);
        }

        [HttpPost]
        public object GetCountProj()
        {
            var countAll = 0;
            var assignSuccess = 0;
            var assignNotSuccess = 0;
            var session = HttpContext.GetSessionUser();
            var contracts = (from a in _context.Projects
                             join b in _context.Users on a.CreatedBy equals b.UserName
                             let c = _context.ProjectMembers.Where(x => !x.FlagDeleted && a.ProjectCode.Equals(a.ProjectCode))
                             where !a.FlagDeleted
                             select a).AsNoTracking();
            if (session.IsAllData)
            {
                countAll = contracts.Count();
                var success = (from a in contracts.Where(x => x.StatusObject.Equals("PROJECT_STATUS_SUCCESS"))
                                   //join b in _context.ProjectMembers.Where(x => !x.FlagDeleted) on a.ProjectCode equals b.ProjectCode
                                   //where (a.CreatedBy.Equals(session.UserName) || (b != null && b.MemberCode.Equals(session.UserId)))
                               select new
                               {
                                   a.Id
                               }).Distinct();
                assignSuccess = success.Count();

                var notSuccess = (from a in contracts.Where(x => x.StatusObject == "PROJECT_STATUS_PENDING")
                                      //join b in _context.ProjectMembers.Where(x => !x.FlagDeleted) on a.ProjectCode equals b.ProjectCode
                                      //where (a.CreatedBy.Equals(session.UserName) || (b != null && b.MemberCode.Equals(session.UserId)))
                                  select new
                                  {
                                      a.Id
                                  }).Distinct();
                assignNotSuccess = notSuccess.Count();
            }
            else
            {
                var data = (from a in contracts
                            join b in _context.ProjectMembers.Where(x => !x.FlagDeleted) on a.ProjectCode equals b.ProjectCode into b1
                            from b in b1.DefaultIfEmpty()
                            where a.CreatedBy.Equals(session.UserName) || b != null && b.MemberCode.Equals(session.UserId)
                            select new
                            {
                                a.Id,
                                a.StatusObject
                            }).Distinct();
                countAll = data.Count();
                var success = data.Where(x => x.StatusObject == "PROJECT_STATUS_SUCCESS");
                assignSuccess = success.Count();
                var notSuccess = data.Where(x => x.StatusObject == "PROJECT_STATUS_PENDING");
                assignNotSuccess = notSuccess.Count();
            }

            return new
            {
                All = countAll,
                AssignSuccess = assignSuccess,
                AssignNotSuccess = assignNotSuccess
            };
        }

        [HttpGet]
        public object GetCountProjHome()
        {
            var session = HttpContext.GetSessionUser();
            try
            {
                var data = (from a in _context.Projects
                            join b in _context.Users on a.CreatedBy equals b.UserName
                            let c = _context.ProjectMembers.Where(x => !x.FlagDeleted && a.ProjectCode.Equals(a.ProjectCode))
                            where (!a.FlagDeleted)
                                  //Điều kiện phân quyền dữ liệu
                                  && (session.IsAllData
                                      || (!session.IsAllData && session.IsBranch && session.RoleCode.Equals(EnumHelper<Role>.GetDisplayValue(Role.Giamdoc)) && session.ListUserOfBranch.Any(x => x == a.CreatedBy))
                                      || (!session.IsAllData && !session.IsBranch && session.IsUser && (session.UserName == a.CreatedBy || (c != null && c.Any(p => p.Equals(session.UserId))))))

                            select a).AsNoTracking().ToList();
                var pending = data.Where(x => x.StatusObject == "PROJECT_STATUS_PENDING");
                return new
                {
                    All = data.Count(),
                    Pending = pending.Count()
                };
            }
            catch (Exception ex)
            {
                return new
                {
                    All = 0,
                    Pending = 0
                };
            }
        }

        #endregion

        #region Member
        public class EDMSProjectTabMember
        {
            public string Position { get; set; }
            public string ProjectCode { get; set; }
            public string MemberCode { get; set; }
            public string Member { get; set; }
        }
        [AllowAnonymous]
        [HttpPost]
        public object JTableMember([FromBody] JTableModelProject jTablePara)
        {
            try
            {
                int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
                if (jTablePara.ProjectCode == null)
                {
                    var list = new List<object>();
                    return JTableHelper.JObjectTable(list, jTablePara.Draw, 0, "Id", "Name", "Position", "Email", "Active");
                }
                var query = from a in _context.ProjectMembers.ToList()
                            join b in _context.Users.ToList() on a.MemberCode equals b.Id into b1
                            from b in b1.DefaultIfEmpty()
                            where !a.FlagDeleted && !string.IsNullOrEmpty(a.MemberCode)
                            && (string.IsNullOrEmpty(jTablePara.Fullname) || string.Join(" ", b.GivenName ?? "", b.FamilyName ?? "", b.MiddleName ?? "").ToLower().Contains(jTablePara.Fullname.ToLower()))
                            && (string.IsNullOrEmpty(jTablePara.Position) || a.Position.ToLower().Contains(jTablePara.Position.ToLower()))
                            && (a.ProjectCode == jTablePara.ProjectCode)
                            && (!a.FlagDeleted)
                            select new
                            {
                                a.Id,
                                Name = b != null ? string.Join(" ", b.GivenName ?? "", b.FamilyName ?? "", b.MiddleName ?? "") : null,
                                a.Position,
                                Email = b != null ? b.Email : null,
                                Active = b != null ? b.Active : false,
                            };
                int count = query.Count();
                var data = query.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "Name", "Position", "Email", "Active");
                return Json(jdata);
            }
            catch (Exception ex)
            {
                var jdata = JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "Id", "Name", "Position", "Email", "Active");
                return Json(jdata);
            }
        }

        [AllowAnonymous]
        [HttpPost]
        public JsonResult InsertProjectTabMember([FromBody] EDMSProjectTabMember obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var project = _context.Projects.FirstOrDefault(x => x.ProjectCode == obj.ProjectCode);
                if (project != null)
                {
                    var checkExistMember = _context.ProjectMembers.FirstOrDefault(x => x.ProjectCode == project.ProjectCode && x.MemberCode == obj.MemberCode && x.FlagDeleted == false);
                    if (checkExistMember == null)
                    {
                        var data = new ProjectMember
                        {
                            MemberCode = obj.MemberCode,
                            ProjectCode = project.ProjectCode,
                            Position = obj.Position,
                            CreatedBy = AppContext.UserName,
                            CreatedTime = DateTime.Now
                        };
                        _context.ProjectMembers.Add(data);
                        _context.SaveChanges();

                        var listUser = _context.ProjectMembers.Where(x => !x.FlagDeleted && x.ProjectCode.Equals(obj.ProjectCode)).Select(x => x.MemberCode);
                        var listUserNotify = new List<UserNotify>();
                        foreach (var item in listUser)
                        {
                            //Add user to Notification
                            var userNotify = new UserNotify
                            {
                                UserId = item
                            };

                            if (!listUserNotify.Any(p => p.UserId.Equals(userNotify.UserId)) && !userNotify.UserId.Equals(AppContext.UserId))
                                listUserNotify.Add(userNotify);
                        }

                        if (listUserNotify.Count > 0)
                        {
                            var session = HttpContext.GetSessionUser();

                            var notification = new NotificationManager
                            {
                                ListUser = listUserNotify,
                                Title = string.Format("{0} đã tạo 1 dự án mới:{1}", session.FullName, project.ProjectTitle),
                                ObjCode = obj.ProjectCode,
                                ObjType = EnumHelper<NotificationType>.GetDisplayValue(NotificationType.Project),
                            };

                            UpdateNotification(notification);
                        }

                        msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_ADD_MEMBER_SUCCESS"]);
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_VALIDATE_MEMBER_ADD_EXIST"]);
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_VALIDATE_PROJECT_EXIST"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_ERR_ADD_MEMBER_PROJECT"]);
                msg.Object = ex;
            }
            return Json(msg);
        }

        [AllowAnonymous]
        [HttpPost]
        public JsonResult UpdateProjectTabMember([FromBody] EDMSProjectTabMember obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var project = _context.Projects.FirstOrDefault(x => x.ProjectCode == obj.ProjectCode);
                if (project != null)
                {
                    var data = _context.ProjectMembers.FirstOrDefault(x => x.MemberCode == obj.Member && x.ProjectCode == project.ProjectCode);
                    if (data != null)
                    {
                        data.Position = obj.Position;
                        data.MemberCode = obj.MemberCode;
                        data.UpdatedBy = AppContext.UserName;
                        data.UpdatedTime = DateTime.Now;
                        _context.ProjectMembers.Update(data);
                        _context.SaveChanges();
                    }


                    var listUser = _context.ProjectMembers.Where(x => !x.FlagDeleted && x.ProjectCode.Equals(obj.ProjectCode)).Select(x => x.MemberCode);
                    var listUserNotify = new List<UserNotify>();
                    foreach (var item in listUser)
                    {
                        //Add user to Notification
                        var userNotify = new UserNotify
                        {
                            UserId = item
                        };

                        if (!listUserNotify.Any(p => p.UserId.Equals(userNotify.UserId)) && !userNotify.UserId.Equals(AppContext.UserId))
                            listUserNotify.Add(userNotify);
                    }

                    if (listUserNotify.Count > 0)
                    {
                        var session = HttpContext.GetSessionUser();

                        var notification = new NotificationManager
                        {
                            ListUser = listUserNotify,
                            Title = string.Format("{0} đã tạo 1 dự án mới:{1}", session.FullName, project.ProjectTitle),
                            ObjCode = obj.ProjectCode,
                            ObjType = EnumHelper<NotificationType>.GetDisplayValue(NotificationType.Project),
                        };

                        UpdateNotification(notification);
                    }

                    msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_UPPDATE_MEMBER_SUCCESS"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_ERR_UPPDATE_MEMBER"]);
            }
            return Json(msg);
        }

        [AllowAnonymous]
        [HttpPost]
        public JsonResult DeleteProjectTabMember(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.ProjectMembers.FirstOrDefault(x => x.Id == id);
                if (data != null)
                {
                    data.FlagDeleted = true;
                    _context.ProjectMembers.Update(data);
                    _context.SaveChanges();

                    var project = _context.Projects.FirstOrDefault(x => !x.FlagDeleted && x.ProjectCode.Equals(data.ProjectCode));
                    if (project != null)
                    {
                        var listUser = _context.ProjectMembers.Where(x => !x.FlagDeleted && x.ProjectCode.Equals(data.ProjectCode)).Select(x => x.MemberCode);
                        var listUserNotify = new List<UserNotify>();
                        foreach (var item in listUser)
                        {
                            //Add user to Notification
                            var userNotify = new UserNotify
                            {
                                UserId = item
                            };

                            if (!listUserNotify.Any(p => p.UserId.Equals(userNotify.UserId)) && !userNotify.UserId.Equals(AppContext.UserId))
                                listUserNotify.Add(userNotify);
                        }

                        if (listUserNotify.Count > 0)
                        {
                            var session = HttpContext.GetSessionUser();

                            var notification = new NotificationManager
                            {
                                ListUser = listUserNotify,
                                Title = string.Format("{0} đã tạo 1 dự án mới:{1}", session.FullName, project.ProjectTitle),
                                ObjCode = data.ProjectCode,
                                ObjType = EnumHelper<NotificationType>.GetDisplayValue(NotificationType.Project),
                            };

                            UpdateNotification(notification);
                        }
                    }
                }

                msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_DELETE_MEMBER"]);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_ERRO"]);
            }
            return Json(msg);
        }

        [AllowAnonymous]
        [HttpGet]
        public object GetMember(int id)
        {
            var data = _context.ProjectMembers.FirstOrDefault(x => x.Id == id);
            return Json(data);
        }

        #endregion

        #region Product
        public class ProductPrice
        {
            public string HeaderCode { get; set; }
            public string ProductCode { get; set; }
            public decimal? PriceCostCatelogue { get; set; }
            public decimal? PriceCostAirline { get; set; }
            public decimal? PriceCostSea { get; set; }
            public decimal? PriceRetailBuild { get; set; }
            public decimal? PriceRetailBuildAirline { get; set; }
            public decimal? PriceRetailBuildSea { get; set; }
            public decimal? PriceRetailNoBuild { get; set; }
            public decimal? PriceRetailNoBuildAirline { get; set; }
            public decimal? PriceRetailNoBuildSea { get; set; }
            public int? Tax { get; set; }
        }

        public class ProjectProductItem
        {
            public int Id { get; set; }
            public string ProductCode { get; set; }
            public string Code { get; set; }
            public decimal Cost { get; set; }
            public decimal? Quantity { get; set; }
            public string Unit { get; set; }
            public string PriceType { get; set; }
            public double Tax { get; set; }
            public string Note { get; set; }
            public int HeaderId { get; set; }
            public string HeaderName { get; set; }
            public string UnitName { get; set; }
            public double TaxMoney { get; set; }
            public List<JsonLog> ListStatusObjectLog { get; set; }
            public string SLastLog { get; set; }
        }

        [HttpPost]
        public object JTableProduct([FromBody] JTableModelProject jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            if (jTablePara.ProjectCode == null)
            {
                var list = new List<object>();
                return JTableHelper.JObjectTable(list, jTablePara.Draw, 0, "Id", "CustomerCode", "CusName", "Address", "Email");
            }
            var query = from a in _context.ProjectProducts
                        join c in _context.MaterialProducts.Where(x => !x.IsDeleted) on a.ProductCode equals c.ProductCode
                        join b in _context.CommonSettings on a.Unit equals b.CodeSet into b1
                        from b in b1.DefaultIfEmpty()
                        where a.ProjectCode == jTablePara.ProjectCode
                        select new ProjectProductItem
                        {
                            Id = a.Id,
                            ProductCode = a.ProductCode + " - " + c.ProductName,
                            Code = a.ProductCode,
                            Cost = a.Cost,
                            Quantity = a.Quantity,
                            Unit = a.Unit,
                            PriceType = a.PriceType,
                            Tax = a.Tax,
                            Note = a.Note,
                            UnitName = b != null ? b.ValueSet : "",
                            TaxMoney = Math.Round((Convert.ToDouble(a.Cost) * Convert.ToDouble(a.Tax) * Convert.ToDouble(a.Quantity)) / 100),
                            ListStatusObjectLog = a.ListStatusObjectLog
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            foreach (var item in data)
            {
                item.SLastLog = item.ListStatusObjectLog != null && item.ListStatusObjectLog.Any()
                    ? JsonConvert.SerializeObject(item.ListStatusObjectLog.LastOrDefault())
                    : "";
            }
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "ProductCode", "Cost", "Quantity", "Unit", "PriceType", "Tax", "Note", "UnitName", "TaxMoney", "Code", "SLastLog");
            return Json(jdata);
        }

        [HttpPost]
        public object GetProduct()
        {
            try
            {
                var currentTime = DateTime.Now;
                var productCost = (from a in _context.ProductCostHeaders.Where(x => x.IsDeleted == false)
                                   join b in _context.ProductCostDetails.Where(x => x.IsDeleted == false) on a.HeaderCode equals b.HeaderCode
                                   where a.EffectiveDate != null && a.ExpiryDate != null &&
                                   a.EffectiveDate.Date <= currentTime.Date && currentTime.Date <= a.ExpiryDate.Date
                                   select new ProductPrice
                                   {
                                       HeaderCode = a.HeaderCode,
                                       ProductCode = b.ProductCode,
                                       PriceCostCatelogue = b.PriceCostCatelogue,
                                       PriceCostAirline = b.PriceCostAirline,
                                       PriceCostSea = b.PriceCostSea,

                                       PriceRetailBuild = b.PriceRetailBuild,
                                       PriceRetailBuildAirline = b.PriceRetailBuildAirline,
                                       PriceRetailBuildSea = b.PriceRetailBuildSea,

                                       PriceRetailNoBuild = b.PriceRetailNoBuild,
                                       PriceRetailNoBuildAirline = b.PriceRetailNoBuildAirline,
                                       PriceRetailNoBuildSea = b.PriceRetailNoBuildSea,
                                       Tax = b.Tax
                                   });
                var query = from a in _context.VProductAllTables
                            join b in productCost on a.ProductCode equals b.ProductCode into b2
                            from b in b2.DefaultIfEmpty()
                            orderby a.ProductType
                            select new ProductPrices
                            {
                                Code = a.ProductCode,
                                Name = $"{a.ProductCode} - {a.ProductName}",
                                Unit = a.Unit,
                                UnitName = a.UnitName,
                                ProductType = a.ProductType,
                                PriceCostCatelogue = (b != null ? b.PriceCostCatelogue : (a.PriceCostCatelogue)),
                                PriceCostAirline = (b != null ? b.PriceCostAirline : (a.PriceCostAirline)),
                                PriceCostSea = (b != null ? b.PriceCostSea : (a.PriceCostSea)),
                                PriceRetailBuild = (b != null ? b.PriceRetailBuild : (a.PriceRetailBuild)),
                                PriceRetailBuildAirline = (b != null ? b.PriceRetailBuildAirline : (a.PriceRetailBuildAirline)),
                                PriceRetailBuildSea = (b != null ? b.PriceRetailBuildSea : (a.PriceRetailBuildSea)),
                                PriceRetailNoBuild = (b != null ? b.PriceRetailNoBuild : (a.PriceRetailNoBuild)),
                                PriceRetailNoBuildAirline = (b != null ? b.PriceRetailNoBuildAirline : (a.PriceRetailNoBuildAirline)),
                                PriceRetailNoBuildSea = (b != null ? b.PriceRetailNoBuildSea : (a.PriceRetailNoBuildSea)),
                                Tax = (b != null ? b.Tax : (0))
                            };
                return query;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        [HttpGet]
        public List<RequestImpProductDetail> GetListProduct(string projectCode)
        {
            var project = _context.Projects.FirstOrDefault(x => !x.FlagDeleted && x.ProjectCode.Equals(projectCode));

            //var listLogProductDetail = new List<LogProductDetail>();
            var listProductGroup = new List<RequestImpProductDetail>();
            if (project != null)
            {
                //if (!string.IsNullOrEmpty(project.LogProductDetail))
                //    listLogProductDetail.AddRange(JsonConvert.DeserializeObject<List<LogProductDetail>>(project.LogProductDetail));

                //var listProductDetail = listLogProductDetail.Where(x => x.ImpQuantity < 0).GroupBy(p => p.ProductCode).Select(x => new
                //{
                //    x.FirstOrDefault().ProductCode,
                //    x.FirstOrDefault().ContractCode,
                //    Quantity = x.FirstOrDefault().ImpQuantity * -1
                //});
                var listProduct = (from b in _context.ProjectProducts
                                   join e in _context.SubProducts.Where(x => !x.IsDeleted) on b.ProductCode equals e.ProductQrCode into e1
                                   from e2 in e1.DefaultIfEmpty()
                                   join f in _context.MaterialProducts.Where(x => !x.IsDeleted) on b.ProductCode equals f.ProductCode into f1
                                   from f2 in f1.DefaultIfEmpty()
                                   join g in _context.CommonSettings.Where(x => !x.IsDeleted) on b.Unit equals g.CodeSet into g1
                                   from g2 in g1.DefaultIfEmpty()
                                   where b.ProjectCode.Equals(projectCode)
                                   select new RequestImpProductDetail
                                   {
                                       ProductCode = b.ProductCode,
                                       //ProductName = e2 != null ? string.Format("{0}-{1}_{2}", _context.MaterialProducts.FirstOrDefault(p => p.ProductCode.Equals(b.ProductCode)) != null ? _context.MaterialProducts.FirstOrDefault(p => p.ProductCode.Equals(b.ProductCode)).ProductName : null, b.ProductCode, e2.AttributeCode) : f2 != null ? string.Format("Thành phẩm_{0}-{1}", f2.ProductName, f2.ProductCode) : null,
                                       ProductName = e2 != null ? e2.AttributeName : f2 != null ? f2.ProductName : null,
                                       ProductType = b.ProductType,
                                       Quantity = (decimal)b.Quantity,
                                       PoCount = b.Quantity.ToString(),
                                       RateConversion = 1,
                                       RateLoss = 1,
                                       Unit = b.Unit,
                                       UnitName = g2.ValueSet,
                                   }).ToList();

                listProductGroup = listProduct.GroupBy(x => x.ProductCode).Select(p => new RequestImpProductDetail
                {
                    ProductCode = p.LastOrDefault().ProductCode,
                    ProductName = p.LastOrDefault().ProductName,
                    ProductType = p.LastOrDefault().ProductType,
                    Quantity = p.LastOrDefault().Quantity,
                    PoCount = p.LastOrDefault().PoCount,
                    RateConversion = p.LastOrDefault().RateConversion,
                    RateLoss = p.LastOrDefault().RateLoss,
                    Unit = p.LastOrDefault().Unit,
                    UnitName = p.LastOrDefault().UnitName,
                }).ToList();
            }
            return listProductGroup;
        }

        public class ModelProductRemain
        {
            public string Code { get; set; }
            public string Name { get; set; }
            public decimal Quantity { get; set; }
            public string Unit { get; set; }
            public string UnitName { get; set; }
        }

        [HttpGet]
        public List<ModelProductRemain> GetListProductRemain(string projectCode)
        {
            var project = _context.Projects.FirstOrDefault(x => !x.FlagDeleted && x.ProjectCode.Equals(projectCode));

            var listProduct = new List<ModelProductRemain>();
            if (project != null)
            {
                listProduct = (from a in _context.VProjectProductRemains
                               where a.ProjectCode == projectCode
                               select new ModelProductRemain
                               {
                                   Code = a.ProductCode,
                                   Name = a.ProductName,
                                   Quantity = (decimal)a.TotalRemain,
                                   Unit = a.Unit,
                                   UnitName = a.UnitName
                               }).ToList();
            }
            return listProduct;
        }

        [HttpGet]
        public JsonResult GetPriceOption(string customerCode)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var list = new List<Properties>();
            var check = _context.Customerss.FirstOrDefault(x => x.CusCode == customerCode && !x.IsDeleted);
            if (check != null)
            {
                if (check.Role == EnumHelper<CustomerRoleEnum>.GetDisplayValue(CustomerRoleEnum.Agency))
                {
                    var catelogue = new Properties
                    {
                        Code = EnumHelper<PriceAgency>.GetDisplayValue(PriceAgency.Catelogue),
                        Name = PriceAgency.Catelogue.DescriptionAttr(),
                    };
                    list.Add(catelogue);

                    var airline = new Properties
                    {
                        Code = EnumHelper<PriceAgency>.GetDisplayValue(PriceAgency.Airline),
                        Name = PriceAgency.Airline.DescriptionAttr(),
                    };
                    list.Add(airline);

                    var sea = new Properties
                    {
                        Code = EnumHelper<PriceAgency>.GetDisplayValue(PriceAgency.Sea),
                        Name = PriceAgency.Sea.DescriptionAttr(),
                    };
                    list.Add(sea);
                }
                else
                {
                    var airline = new Properties
                    {
                        Code = EnumHelper<PriceRetail>.GetDisplayValue(PriceRetail.Airline),
                        Name = PriceRetail.Airline.DescriptionAttr(),
                    };
                    list.Add(airline);

                    var buid = new Properties
                    {
                        Code = EnumHelper<PriceRetail>.GetDisplayValue(PriceRetail.Buid),
                        Name = PriceRetail.Buid.DescriptionAttr(),
                    };
                    list.Add(buid);

                    var noBuid = new Properties
                    {
                        Code = EnumHelper<PriceRetail>.GetDisplayValue(PriceRetail.NoBuid),
                        Name = PriceRetail.NoBuid.DescriptionAttr(),
                    };
                    list.Add(noBuid);

                    var noBuidAirline = new Properties
                    {
                        Code = EnumHelper<PriceRetail>.GetDisplayValue(PriceRetail.NoBuidAirline),
                        Name = PriceRetail.NoBuidAirline.DescriptionAttr(),
                    };
                    list.Add(noBuidAirline);

                    var noBuidSea = new Properties
                    {
                        Code = EnumHelper<PriceRetail>.GetDisplayValue(PriceRetail.NoBuidSea),
                        Name = PriceRetail.NoBuidSea.DescriptionAttr(),
                    };
                    list.Add(noBuidSea);

                    var sea = new Properties
                    {
                        Code = EnumHelper<PriceRetail>.GetDisplayValue(PriceRetail.Sea),
                        Name = PriceRetail.Sea.DescriptionAttr(),
                    };
                    list.Add(sea);
                }
                msg.Object = list;
            }
            return Json(msg);
        }

        [HttpPost]
        public async Task<object> InsertProduct([FromBody] ProjectProduct obj)
        {
            var msg = new JMessage { Error = false };
            try
            {
                using (await userLock.LockAsync(string.Concat(obj.ProjectCode, obj.ProductCode)))
                {
                    var checkExist = await _context.ProjectProducts.FirstOrDefaultAsync(x => x.ProjectCode == obj.ProjectCode && x.ProductCode == obj.ProductCode);
                    if (checkExist == null)
                    {
                        obj.ListStatusObjectLog = new List<JsonLog>();
                        _context.ProjectProducts.Add(obj);
                        _context.SaveChanges();
                        msg.ID = obj.Id;
                        msg.Title = _stringLocalizer["PROJECT_MSG_ADD_PROD_SUCCESS"];
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["PROJECT_MSG_PROD_EXIST"];
                    }
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
        public object UpdateProduct([FromBody] ProjectProduct obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var product = _context.ProjectProducts.FirstOrDefault(x => x.Id == obj.Id);
                if (product != null)
                {
                    product.Unit = obj.Unit;
                    product.Tax = obj.Tax;
                    product.Cost = obj.Cost;
                    product.Quantity = obj.Quantity;
                    product.PriceType = obj.PriceType;
                    product.Note = obj.Note;
                    _context.ProjectProducts.Update(product);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["PROJECT_MSG_NOT_FOUND_PROD_IN_PRO"];
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
        public JsonResult DeleteProduct(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.ProjectProducts.FirstOrDefault(x => x.Id == id);

                //Check dự án đã được đưa vào YCĐH
                var chkUsingReqImp = (from a in _context.RequestImpProductHeaders.Where(x => !x.IsDeleted && x.ProjectCode == data.ProjectCode)
                                      join b in _context.RequestImpProductDetails.Where(x => !x.IsDeleted && x.ProductCode == data.ProductCode && x.ProductType == data.ProductType) on a.ReqCode equals b.ReqCode
                                      select b.Id).Any();
                if (chkUsingReqImp)
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["PROJECT_MSG_CANNOT_DEL_PROD_IN_RQ_IMP"];
                    return Json(msg);
                }
                var session = HttpContext.GetSessionUser();
                var instance = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value &&
                                                                              x.ObjectType.Equals("PROJECT_PRODUCT")
                                                                              && x.ObjectInst.Equals(
                                                                                  data.Id.ToString()));
                if (instance != null)
                {
                    var listAct =
                        _context.ActivityInstances.Where(x =>
                            !x.IsDeleted && x.WorkflowCode == instance.WfInstCode);
                    var isApproved = listAct.Any(x => x.Status == "STATUS_ACTIVITY_END");
                    if (isApproved)
                    {
                        msg.Error = true;
                        msg.Title = _workflowActivityController["WFAI_MSG_NO_PERMISSION_ALREADY_APPROVED"];
                        msg.Object = "NO_PERMISSION_DELETE_APPROVED";
                        return Json(msg);
                    }
                }
                if (session.UserName != instance?.CreatedBy && session.UserType != 10)
                {
                    msg.Error = true;
                    msg.Title = _workflowActivityController["WFAI_MSG_NO_PERMISSION_DELETE"];
                    msg.Object = "NO_PERMISSION_DELETE_USER";
                    return Json(msg);
                }

                _context.ProjectProducts.Remove(data);
                _context.SaveChanges();
                msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
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
        public object GetProductInProject(string projectCode)
        {
            var data = _context.ProjectProducts.Where(x => x.ProjectCode.Equals(projectCode));
            return data;
        }
        #endregion

        #region Product_Header
        [AllowAnonymous]
        [HttpPost]
        public object JTableProductNew([FromBody] JTableModelProject jTablePara)
        {
            try
            {
                int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
                var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                if (jTablePara.ProjectCode == null)
                {
                    var list = new List<object>();
                    return JTableHelper.JObjectTable(list, jTablePara.Draw, 0, "Id", "ProductCode", "Cost", "Quantity", "Unit", "PriceType", "Tax", "Note", "UnitName", "HeaderId", "HeaderName", "Code", "SLastLog");
                }
                var query = from a in _context.ProjectProductDetails.Where(x => !x.IsDeleted)
                            join b in _context.ProjectProductHeaders.Where(x => !x.IsDeleted) on a.TicketCode equals b.TicketCode
                            join c in _context.MaterialProducts.Where(x => !x.IsDeleted) on a.ProductCode equals c.ProductCode
                            join d in _context.CommonSettings on a.Unit equals d.CodeSet into d1
                            from d in d1.DefaultIfEmpty()
                            where b.ProjectCode == jTablePara.ProjectCode
                                  && (fromDate == null || fromDate != null && b.TicketTime >= fromDate)
                                  && (toDate == null || toDate != null && b.TicketTime <= toDate)
                                  && (string.IsNullOrEmpty(jTablePara.PortType) || b.PortType == jTablePara.PortType)
                                  && (string.IsNullOrEmpty(jTablePara.ProductCode) || a.ProductCode == jTablePara.ProductCode)
                            select new ProjectProductItem
                            {
                                Id = a.Id,
                                ProductCode = a.ProductCode + " - " + c.ProductName,
                                Code = a.ProductCode,
                                Cost = a.Cost ?? 0,
                                Quantity = a.Quantity,
                                Unit = a.Unit,
                                //PriceType = a.PriceType,
                                //Tax = a.Tax,
                                Note = b.Note,
                                HeaderId = b.Id,
                                HeaderName = b.Title,
                                UnitName = d != null ? d.ValueSet : "",
                                //TaxMoney = Math.Round(Convert.ToDouble(a.Cost) * Convert.ToDouble(a.Tax) * Convert.ToDouble(a.Quantity) / 100),
                                ListStatusObjectLog = b.ListStatusObjectLog
                            };
                var count = query.Count();
                var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
                foreach (var item in data)
                {
                    item.SLastLog = item.ListStatusObjectLog != null && item.ListStatusObjectLog.Any()
                        ? JsonConvert.SerializeObject(item.ListStatusObjectLog.LastOrDefault())
                        : "";
                }
                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "ProductCode", "Cost", "Quantity", "Unit", "PriceType", "Tax", "Note", "UnitName", "HeaderId", "HeaderName", "Code", "SLastLog");
                return Json(jdata);
            }
            catch (Exception ex)
            {
                var list = new List<object>();
                var jdata = JTableHelper.JObjectTable(list, jTablePara.Draw, 0, "Id", "ProductCode", "Cost", "Quantity", "Unit", "PriceType", "Tax", "Note", "UnitName", "HeaderId", "HeaderName", "Code", "SLastLog");
                jdata.Add("exceptionMessage", ex.Message);
                return Json(jdata);
            }
        }
        private static int _ticketCounterProduct = 1;
        private static DateTime? _lastTicketTimeProduct;
        [AllowAnonymous]
        [HttpPost]
        public JsonResult CreateTicketCodeProduct(string projectCode)
        {
            var mess = new JMessage { Error = false, Title = "" };
            try
            {
                var monthNow = DateTime.Now.Month;
                var yearNow = DateTime.Now.Year;
                var lastHeader = _context.ProjectProductHeaders.LastOrDefault(x => x.CreatedTime.HasValue && x.CreatedTime.Value.Date == DateTime.Now.Date);
                // if lastTicketTime = null mean a server restart, we must take the count from last record in same month from db, if none exist we take 1 as count
                if (_lastTicketTimeProduct == null)
                {
                    _lastTicketTimeProduct = DateTime.Now;
                    if (lastHeader != null && lastHeader.TicketCount.HasValue)
                    {
                        _ticketCounterProduct = lastHeader.TicketCount.Value + 1;
                    }
                    else
                    {
                        _ticketCounterProduct = 1;
                    }
                }
                // if lastTimeTicket exist and this month is different from last month, we take 1 as count
                else if (_lastTicketTimeProduct.Value.Month != monthNow && _lastTicketTimeProduct.Value.Year != yearNow)
                {
                    _ticketCounterProduct = 1;
                }
                else
                {
                    _ticketCounterProduct++;
                }
                // else it is in same month, we take increase the count by 1

                //var numProject = _context.ProjectProductHeaders.Where(x => x.ProjectCode == projectCode).ToList();
                var numProjectCount = _ticketCounterProduct;
                //if (numProject.Count > 0)
                //    numProjectCount = numProjectCount + numProject.Count;
                var ticketCode = $"{projectCode}_{monthNow}.{yearNow}_{numProjectCount}";

                mess.Object = ticketCode;
                mess.ID = numProjectCount;
            }
            catch (Exception ex)
            {
                mess.Error = true;
                //mess.Title = String.Format(CommonUtil.ResourceValue("MIS_MSG_IMPORT_WARE_HOURE_EXITS"));
                //mess.Title = _stringLocalizer["MIS_MSG_IMPORT_WARE_HOURE_EXITS"];
                mess.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(mess);
        }
        [AllowAnonymous]
        [HttpPost]
        public JsonResult GetProductHeader(int id)
        {
            var mess = new JMessage { Error = false, Title = "" };
            try
            {
                mess.Object = _context.ProjectProductHeaders.FirstOrDefault(x => x.Id == id);
            }
            catch (Exception ex)
            {
                mess.Error = true;
                //mess.Title = String.Format(CommonUtil.ResourceValue("MIS_MSG_IMPORT_WARE_HOURE_EXITS"));
                mess.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(mess);
        }
        [AllowAnonymous]
        [HttpPost]
        public JsonResult InsertProductHeader([FromBody] ProjectProductHeaderCrudModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var ticketTime = !string.IsNullOrEmpty(obj.TicketTime) ? DateTime.ParseExact(obj.TicketTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var chk = _context.ProjectProductHeaders.Any(x => x.TicketCode.Equals(obj.TicketCode) && !x.IsDeleted);
                if (!chk)
                {
                    //Insert bảng header
                    var objNew = new ProjectProductHeader
                    {
                        TicketCode = obj.TicketCode,
                        Title = obj.Title,
                        TicketCount = obj.TicketCount,
                        ProjectCode = obj.ProjectCode,
                        TicketTime = ticketTime,
                        Note = obj.Note,
                        Sender = obj.Sender,
                        Receiver = obj.Receiver,
                        Supplier = obj.Supplier,
                        PortType = obj.PortType,
                        StoreCode = obj.StoreCode,
                        ListStatusObjectLog = new List<JsonLog>(),
                        CreatedBy = AppContext.UserName,
                        CreatedTime = DateTime.Now
                    };
                    _context.ProjectProductHeaders.Add(objNew);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizer["Thêm phiếu thành công"];

                    msg.ID = objNew.Id;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["Đã tồn tại phiếu"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [AllowAnonymous]
        [HttpPost]
        public JsonResult UpdateProductHeader([FromBody] ProjectProductHeaderCrudModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var ticketTime = !string.IsNullOrEmpty(obj.TicketTime) ? DateTime.ParseExact(obj.TicketTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var objUpdate = _context.ProjectProductHeaders.FirstOrDefault(x => x.TicketCode.Equals(obj.TicketCode) && !x.IsDeleted);
                if (objUpdate != null)
                {
                    //var lstStatus = new List<JsonStatus>();

                    ////Check xem sản phẩm đã được đưa vào phiếu xuất kho chưa
                    //var chkUsing = (from a in _context.ProdReceivedDetails.Where(x => !x.IsDeleted && x.TicketCode == obj.TicketCode)
                    //                join b in _context.ProdDeliveryDetails.Where(x => !x.IsDeleted) on a.ProductQrCode equals b.ProductQrCode
                    //                select a.Id).Any();

                    ////Check xem sản phẩm đã được xếp kho thì không cho sửa kho nhập
                    //var chkOrdering = (from a in _context.ProdReceivedDetails.Where(x => !x.IsDeleted && x.TicketCode == obj.TicketCode)
                    //                   join b in _context.ProductEntityMappings.Where(x => !x.IsDeleted) on a.ProductQrCode equals b.ProductQrCode
                    //                   select a.Id).Any();
                    if (false)
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["MIS_MSG_ERRO_ADD_IMPORT_WARE_HOURE_EXPORT"];
                    }
                    //else if (chkOrdering && !objUpdate.StoreCode.Equals(obj.StoreCode))
                    //{
                    //    msg.Error = true;
                    //    msg.Title = _stringLocalizer["MIST_SORT_PRODUCT_CANNOT_EDIT"];
                    //}
                    //var oldTimeTicketCreate = objUpdate.TimeTicketCreate;

                    //Update bảng header
                    objUpdate.Title = obj.Title;
                    objUpdate.ProjectCode = obj.ProjectCode;
                    objUpdate.TicketTime = ticketTime;
                    objUpdate.Note = obj.Note;
                    objUpdate.Sender = obj.Sender;
                    objUpdate.Receiver = obj.Receiver;
                    objUpdate.Supplier = obj.Supplier;
                    objUpdate.StoreCode = obj.StoreCode;
                    objUpdate.PortType = obj.PortType;

                    objUpdate.UpdatedBy = AppContext.UserName;
                    objUpdate.UpdatedTime = DateTime.Now;
                    msg.Title = string.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], "Phiếu nhập xuất hàng hóa");
                    //var header = _context.ProdReceivedHeaders.FirstOrDefault(x => !x.IsDeleted && x.TicketCode.Equals(obj.TicketCode));
                    //var detail = _context.ProdReceivedDetails.Where(x => !x.IsDeleted && x.TicketCode.Equals(obj.TicketCode)).ToList();
                    //if (header != null)
                    //{
                    //    var logData = new
                    //    {
                    //        Header = header,
                    //        Detail = detail
                    //    };

                    //    var listLogData = new List<object>();

                    //    if (!string.IsNullOrEmpty(header.LogData))
                    //    {
                    //        listLogData = JsonConvert.DeserializeObject<List<object>>(header.LogData);
                    //        logData.Header.LogData = null;
                    //        listLogData.Add(logData);
                    //        header.LogData = JsonConvert.SerializeObject(listLogData);

                    //        _context.ProdReceivedHeaders.Update(header);
                    //        _context.SaveChanges();
                    //    }
                    //    else
                    //    {
                    //        listLogData.Add(logData);

                    //        header.LogData = JsonConvert.SerializeObject(listLogData);

                    //        _context.ProdReceivedHeaders.Update(header);

                    //    }
                    //}

                    ////Work flow update status
                    //var session = HttpContext.GetSessionUser();
                    //if (!string.IsNullOrEmpty(objUpdate.Status))
                    //{
                    //    lstStatus = JsonConvert.DeserializeObject<List<JsonStatus>>(objUpdate.Status);
                    //}
                    //objUpdate.JsonData = CommonUtil.JsonData(objUpdate, obj, objUpdate.JsonData, session.FullName);
                    _context.ProjectProductHeaders.Update(objUpdate);
                    _context.SaveChanges();
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["Phiếu không tồn tại"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [AllowAnonymous]
        [HttpPost]
        public JMessage DeleteProductHeader(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.ProjectProductHeaders.FirstOrDefault(x => x.Id == id && !x.IsDeleted);
                if (data == null)
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_MSG_NOT_EXITS"], _stringLocalizer["Phiếu nhập xuất hàng hóa"]);
                }
                else
                {
                    //Check xem sản phẩm đã được đưa vào phiếu xuất kho chưa
                    //var chkUsing = (from a in _context.ProdReceivedDetails.Where(x => !x.IsDeleted && x.TicketCode == data.TicketCode)
                    //                join b in _context.ProdDeliveryDetails.Where(x => !x.IsDeleted) on a.ProductQrCode equals b.ProductQrCode
                    //                select a.Id).Any();
                    //if (chkUsing)
                    //{
                    //    msg.Error = true;
                    //    msg.Title = _stringLocalizer["MIS_MSG_ERRO_DELTE_IMPORT_WARE_HOURE"];
                    //    return Json(msg);
                    //}

                    ////Check xem sản phẩm đã được xếp kho chưa
                    //var chkMapping = (from a in _context.ProdReceivedDetails.Where(x => !x.IsDeleted && x.TicketCode == data.TicketCode)
                    //                  join b in _context.ProductEntityMappings.Where(x => !x.IsDeleted && x.Quantity > 0) on a.ProductQrCode equals b.ProductQrCode
                    //                  join c in _context.MapStockProdIns on b.Id equals c.MapId
                    //                  select a.Id).Any();
                    if (false)
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["MIS_MSG_NOT_DELETE"];
                        return msg;
                    }
                    //xóa header
                    data.IsDeleted = true;
                    data.DeletedBy = AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    _context.ProjectProductHeaders.Update(data);

                    //xóa detail
                    var listDetail = _context.ProjectProductDetails.Where(x => !x.IsDeleted && x.TicketCode == data.TicketCode).ToList();
                    listDetail.ForEach(x =>
                    {
                        x.IsDeleted = true;
                        x.DeletedBy = AppContext.UserName;
                        x.DeletedTime = DateTime.Now;
                    });
                    _context.ProjectProductDetails.UpdateRange(listDetail);

                    //Xóa attr value của phiếu
                    //var lstAttrValue = _context.ProdReceivedAttrValues.Where(x => x.TicketImpCode.Equals(data.TicketCode) && !x.IsDeleted).ToList();
                    //if (lstAttrValue.Any())
                    //{
                    //    lstAttrValue.ForEach(x =>
                    //    {
                    //        x.IsDeleted = true;
                    //        x.DeletedBy = ESEIM.AppContext.UserName;
                    //        x.DeletedTime = DateTime.Now;
                    //    });
                    //    _context.ProdReceivedAttrValues.UpdateRange(lstAttrValue);
                    //    var lstStockAttrValue = _context.ProdInStockAttrValues.Where(x => x.TicketImpCode.Equals(data.TicketCode) && !x.IsDeleted).ToList();
                    //    lstStockAttrValue.ForEach(x =>
                    //    {
                    //        x.IsDeleted = true;
                    //        x.DeletedBy = ESEIM.AppContext.UserName;
                    //        x.DeletedTime = DateTime.Now;
                    //    });
                    //    _context.ProdInStockAttrValues.UpdateRange(lstStockAttrValue);
                    //}

                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Object = ex;
            }
            return msg;
        }

        [AllowAnonymous]
        [HttpPost]
        public object ExportExcelProduct(string projectCode)
        {
            var project = _context.Projects.FirstOrDefault(x => !x.FlagDeleted && x.ProjectCode.Equals(projectCode));

            var listProduct = new List<VProjectProductRemain>();
            if (project != null)
            {
                listProduct = (from a in _context.VProjectProductRemains
                               where a.ProjectCode == projectCode
                               select a).ToList();
            }
            var listExport = new List<ExportViewModelProduct>();
            var no = 1;
            foreach (var item in listProduct)
            {
                var itemExport = new ExportViewModelProduct();

                itemExport.No = no;
                itemExport.ProductCode = item.ProductCode;
                itemExport.ProductName = item.ProductName;
                //itemExport.Unit = item.Unit;
                itemExport.UnitName = item.UnitName;
                //itemExport.ProjectCode = item.ProjectCode;
                //itemExport.ProjectTitle = item.ProjectTitle;
                itemExport.TotalRemain = item.TotalRemain;

                no = no + 1;
                listExport.Add(itemExport);
            }

            ExcelEngine excelEngine = new ExcelEngine();
            IApplication application = excelEngine.Excel;
            application.DefaultVersion = ExcelVersion.Excel2016;
            IWorkbook workbook = application.Workbooks.Create(1);
            workbook.Version = ExcelVersion.Excel2016;
            IWorksheet sheetRequest = workbook.Worksheets.Create("DanhMucDuAn");
            workbook.Worksheets[0].Remove();
            IMigrantRange migrantRange = workbook.Worksheets[0].MigrantRange;
            sheetRequest.Range["A1"].ColumnWidth = 24;
            sheetRequest.Range["B1"].ColumnWidth = 24;
            sheetRequest.Range["C1"].ColumnWidth = 24;
            sheetRequest.Range["D1"].ColumnWidth = 24;
            sheetRequest.Range["E1"].ColumnWidth = 24;
            //sheetRequest.Range["F1"].ColumnWidth = 24;
            //sheetRequest.Range["G1"].ColumnWidth = 24;
            //sheetRequest.Range["H1"].ColumnWidth = 24;
            //sheetRequest.Range["I1"].ColumnWidth = 24;
            ////sheetRequest.Range["I1"].ColumnWidth = 24;
            //sheetRequest.Range["J1"].ColumnWidth = 24;
            //sheetRequest.Range["K1"].ColumnWidth = 24;


            sheetRequest.Range["A1:E1"].Merge(true);

            sheetRequest.Range["A1"].Text = $"Danh mục thiết bị vật tư tồn kho - {project.ProjectTitle} [{project.ProjectCode}]";
            sheetRequest.Range["A1"].CellStyle.Font.FontName = "Calibri";
            sheetRequest.Range["A1"].CellStyle.Font.Bold = true;
            sheetRequest.Range["A1"].CellStyle.Font.Size = 24;
            sheetRequest.Range["A1"].CellStyle.Font.RGBColor = Color.Black;
            sheetRequest.Range["A1"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.ImportData(listExport, 2, 1, true);
            sheetRequest["E1:E" + (listExport.Count() + 2)].NumberFormat = "###,##";

            sheetRequest["A2"].Text = "TT";
            sheetRequest["B2"].Text = "Mã vật tư hàng hóa";
            sheetRequest["C2"].Text = "Tên vật tư hàng hóa";
            sheetRequest["D2"].Text = "Đơn vị";
            sheetRequest["E2"].Text = "Số lượng tồn kho";
            //sheetRequest["F2"].Text = "Ngày bắt đầu";
            //sheetRequest["G2"].Text = "Ngày kết thúc";
            //sheetRequest["H2"].Text = "Ngày hết hạn";
            //sheetRequest["I2"].Text = "Ngày GH tiếp theo";
            //sheetRequest["J2"].Text = "Ngày TT tiếp theo";
            //sheetRequest["K2"].Text = "Trạng thái";



            IStyle tableHeader = workbook.Styles.Add("TableHeaderStyle");
            tableHeader.Font.Color = ExcelKnownColors.White;
            tableHeader.Font.Bold = true;
            tableHeader.Font.Size = 11;
            tableHeader.Font.FontName = "Calibri";
            tableHeader.HorizontalAlignment = ExcelHAlign.HAlignCenter;
            tableHeader.VerticalAlignment = ExcelVAlign.VAlignCenter;
            tableHeader.Color = Color.Gray;
            tableHeader.Borders[ExcelBordersIndex.EdgeLeft].LineStyle = ExcelLineStyle.None;
            tableHeader.Borders[ExcelBordersIndex.EdgeRight].LineStyle = ExcelLineStyle.None;
            tableHeader.Borders[ExcelBordersIndex.EdgeTop].LineStyle = ExcelLineStyle.None;
            tableHeader.Borders[ExcelBordersIndex.EdgeBottom].LineStyle = ExcelLineStyle.None;
            tableHeader.Borders[ExcelBordersIndex.EdgeBottom].LineStyle = ExcelLineStyle.None;
            sheetRequest["A2:E2"].CellStyle = tableHeader;
            sheetRequest.Range["A2:E2"].RowHeight = 20;
            sheetRequest.UsedRange.AutofitColumns();
            sheetRequest["C1:C" + (listExport.Count() + 2)].ColumnWidth = Math.Min(sheetRequest["C1"].ColumnWidth * 3, 200);

            //string ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            var fileName = "ExportTonKho_" + project.ProjectTitle + "_" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".xls";
            var pathFile = _hostingEnvironment.WebRootPath + "\\uploads\\tempFile\\" + fileName;
            var pathFileDownLoad = "\\uploads\\tempFile\\" + fileName;
            FileStream stream = new FileStream(pathFile, FileMode.Create, FileAccess.ReadWrite);
            workbook.SaveAs(stream);
            stream.Dispose();

            var obj = new
            {
                fileName,
                pathFile = pathFileDownLoad
            };
            return obj;
        }

        public class ExportViewModelProduct
        {
            public int No { get; set; }
            public string ProductCode { get; set; }
            public string ProductName { get; set; }
            //public string Unit { get; set; }
            public string UnitName { get; set; }
            //public string ProjectCode { get; set; }
            //public string ProjectTitle { get; set; }
            public decimal? TotalRemain { get; set; }
        }
        #endregion

        #region Product_Detail
        [AllowAnonymous]
        [HttpPost]
        public JMessage InsertProductDetail([FromBody] ProjectProductDetail obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                //Check product is exist in Receive with conditions: ticket, product, unit, packing
                //var mark = _context.ProdReceivedAttrValues.Where(x => !x.IsDeleted && x.TicketImpCode.Equals(obj.TicketCode));

                var check = _context.ProjectProductDetails.FirstOrDefault(x => !x.IsDeleted && x.TicketCode.Equals(obj.TicketCode)
                && x.ProductCode.Equals(obj.ProductCode) && x.SupplierCode.Equals(obj.SupplierCode) && x.Unit.Equals(obj.Unit)/* && x.PackType.Equals(obj.PackType)*/);

                //var maxId = _context.ProdReceivedDetails.MaxBy(x => x.Id) != null ? _context.ProdReceivedDetails.MaxBy(x => x.Id).Id : 1;

                //var packCode = "";
                //var productQrCode = "";
                if (check == null)
                {
                    var receiveDetail = new ProjectProductDetail
                    {
                        TicketCode = obj.TicketCode,
                        ProductCode = obj.ProductCode,
                        //ProductQrCode = obj.ProductCode + "_" + maxId,
                        //ProductType = obj.ProductType,
                        Quantity = obj.Quantity,
                        Unit = obj.Unit,
                        Cost = obj.Cost,
                        SupplierCode = obj.SupplierCode,
                        //SalePrice = obj.SalePrice,
                        //Currency = obj.Currency,
                        CreatedBy = AppContext.UserName,
                        CreatedTime = DateTime.Now,
                        //QuantityIsSet = 0,
                        //PackType = obj.PackType,
                        //MarkWholeProduct = mark.Any() ? true : false,
                        //PackCode = string.Format("PACK_{0}", obj.ProductCode + "_" + maxId)
                    };

                    //productQrCode = receiveDetail.ProductQrCode;

                    //var listPack = new List<WarehouseRecordsPack>();

                    //for (int i = 1; i <= obj.Quantity; i++)
                    //{
                    //    packCode = receiveDetail.PackCode;

                    //    if (obj.Quantity > 1)
                    //        packCode = string.Format("{0}_{1}", receiveDetail.PackCode, i);

                    //    var pack = new WarehouseRecordsPack
                    //    {
                    //        PackCode = packCode,
                    //        QrCode = packCode,
                    //        PackName = packCode,
                    //        PackLevel = "0",
                    //        PackHierarchyPath = packCode,
                    //        PackType = "PACK_TYPE_BOX",
                    //        PackQuantity = 1,
                    //        CreatedBy = User.Identity.Name,
                    //        CreatedTime = DateTime.Now,
                    //        ImportHeaderCode = obj.TicketCode,
                    //        PackParent = GetParent(obj.ProductCode, obj.PackType, obj.TicketCode)
                    //    };

                    //    listPack.Add(pack);
                    //}

                    //foreach (var item in listPack)
                    //{
                    //    var exitPack = _context.WarehouseRecordsPacks.Any(x => !x.IsDeleted && x.PackCode.Equals(item.PackCode));
                    //    if (!exitPack)
                    //        _context.WarehouseRecordsPacks.Add(item);
                    //}

                    //receiveDetail.PackCode = listPack.FirstOrDefault().PackCode;
                    _context.ProjectProductDetails.Add(receiveDetail);
                }
                else
                {
                    //productQrCode = check.ProductQrCode;
                    //packCode = check.PackCode;
                    check.Quantity += obj.Quantity;
                    check.UpdatedBy = AppContext.UserName;
                    check.UpdatedTime = DateTime.Now;
                    //check.SalePrice += obj.SalePrice;
                    _context.ProjectProductDetails.Update(check);
                }
                //var storeInventory = _context.ProductInStocks.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(productQrCode));
                //if (storeInventory != null)
                //{
                //    storeInventory.Quantity = storeInventory.Quantity + obj.Quantity;
                //    storeInventory.PackCode = packCode;
                //    _context.ProductInStocks.Update(storeInventory);
                //}
                //else
                //{
                //    var storeInventoryObj = new ProductInStock
                //    {
                //        LotProductCode = obj.LotProductCode,
                //        StoreCode = obj.StoreCode,

                //        ProductCode = obj.ProductCode,
                //        ProductType = obj.ProductType,
                //        ProductQrCode = obj.ProductCode + "_" + maxId,
                //        Quantity = obj.Quantity,
                //        Unit = obj.Unit,
                //        CreatedBy = User.Identity.Name,
                //        CreatedTime = DateTime.Now,
                //        IsDeleted = false,
                //        MarkWholeProduct = mark.Any() ? true : false,
                //        PackCode = packCode
                //    };
                //    _context.ProductInStocks.Add(storeInventoryObj);
                //}
                _context.SaveChanges();
                msg.Title = _sharedResources["COM_ADD_SUCCESS"];
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return msg;
        }

        [AllowAnonymous]
        [HttpPost]
        public JsonResult UpdateProductDetail([FromBody] ProjectProductDetail obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var detail = _context.ProjectProductDetails.FirstOrDefault(x => !x.IsDeleted && x.TicketCode.Equals(obj.TicketCode)
                && x.ProductCode.Equals(obj.ProductCode) && x.SupplierCode.Equals(obj.SupplierCode) && x.Unit.Equals(obj.Unit) /*&& x.PackType.Equals(obj.PackType)*/);

                //var maxId = _context.ProjectProductDetails.MaxBy(x => x.Id) != null ? _context.ProjectProductDetails.MaxBy(x => x.Id).Id : 1;
                if (detail != null)
                {
                    //detail.Unit = obj.Unit;
                    //detail.Cost = obj.Cost;
                    detail.Quantity = obj.Quantity;
                    //detail.SupplierCode = obj.SupplierCode;
                    detail.UpdatedBy = AppContext.UserName;
                    detail.UpdatedTime = DateTime.Now;
                    //detail.SalePrice = obj.SalePrice;
                    //detail.Currency = obj.Currency;
                    //detail.PackCode = obj.PackCode;
                    _context.ProjectProductDetails.Update(detail);

                    //var storeInventory = _context.ProductInStocks.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(obj.ProductQrCode));
                    //if (storeInventory != null)
                    //{
                    //    storeInventory.PackCode = obj.PackCode;
                    //    _context.ProductInStocks.Update(storeInventory);
                    //}

                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Không tìm thấy chi tiết phiếu";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [AllowAnonymous]
        [HttpGet]
        public JsonResult GetProductDetail(string ticketCode)
        {
            var data = (from a in _context.ProjectProductDetails.Where(x => !x.IsDeleted && x.TicketCode.Equals(ticketCode))
                        join b in _context.MaterialProducts.Where(x => !x.IsDeleted) on a.ProductCode equals b.ProductCode
                        join c in _context.Suppliers.Where(x => !x.IsDeleted) on a.SupplierCode equals c.SupCode into c1
                        from c in c1.DefaultIfEmpty()
                            //join c in _context.WarehouseRecordsPacks.Where(x => !x.IsDeleted) on a.PackCode equals c.PackCode into c1
                            //from c in c1.DefaultIfEmpty()
                        select new
                        {
                            a.Id,
                            a.TicketCode,
                            b.ProductName,
                            b.ProductCode,
                            a.Quantity,
                            a.Cost,
                            //a.QuantityIsSet,
                            Unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.Unit).ValueSet,
                            //a.SalePrice,
                            //CurrencyCode = a.Currency,
                            //Currency = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.Currency).ValueSet,
                            QrCode = CommonUtil.GeneratorQRCode(a.ProductCode),
                            SupplierCode = a.SupplierCode,
                            SupplierName = c.SupName,
                            //ProductQRCode = a.ProductQrCode,
                            //Remain = a.Quantity - a.QuantityIsSet,
                            //PackType = !string.IsNullOrEmpty(a.PackType) ? a.PackType : "",
                            //PackName = c != null ? c.PackName : "Chưa đóng gói",
                            //PackCode = a.PackCode,
                            //sProductQrCode = CommonUtil.GenerateQRCode("SP:" + a.ProductQrCode + "_P:" + a.TicketCode + "_SL:" + a.Quantity),
                            UnitCode = a.Unit
                        });
            return Json(data);
        }

        [AllowAnonymous]
        [HttpPost]
        public JsonResult DeleteProductDetail(int id, int headerId = -1)
        {
            var msg = new JMessage();
            try
            {
                var data = _context.ProjectProductDetails.FirstOrDefault(x => !x.IsDeleted && x.Id == id);
                if (data != null)
                {
                    //var checkExport = _context.ProjectProductDetails.Where(x => !x.IsDeleted && x.ProductQrCode.Equals(data.ProductQrCode));
                    //if (checkExport.Any())
                    //{
                    //    msg.Error = true;
                    //    msg.Title = _stringLocalizer["MIS_MSG_SORT_WARE_HOURE_PRODUCT_NON_DELETED"];
                    //    return Json(msg);
                    //}

                    var listDetail = _context.ProjectProductDetails.Where(x => !x.IsDeleted && x.TicketCode == data.TicketCode).ToList();
                    var header =
                        _context.ProjectProductHeaders.FirstOrDefault(x =>
                            !x.IsDeleted && x.Id == headerId);
                    if (listDetail.Count <= 1 && header != null)
                    {
                        msg = DeleteProductHeader(header.Id);
                    }
                    else
                    {
                        data.IsDeleted = true;
                        data.DeletedBy = AppContext.UserName;
                        data.DeletedTime = DateTime.Now;
                        _context.ProjectProductDetails.Update(data);
                    }

                    //var checkPack = _context.ProdReceivedDetails.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.PackCode) && x.PackCode.Equals(data.PackCode));
                    //if (checkPack.Count() == 1)
                    //{
                    //    var pack = _context.WarehouseRecordsPacks.FirstOrDefault(x => !x.IsDeleted && x.PackCode.Equals(data.PackCode));
                    //    if (pack != null)
                    //    {
                    //        pack.IsDeleted = true;
                    //        _context.WarehouseRecordsPacks.Update(pack);
                    //    }
                    //}

                    //var prodInStock = _context.ProductInStocks.FirstOrDefault(x => x.ProductQrCode.Equals(data.ProductQrCode) && !x.IsDeleted);
                    //prodInStock.Quantity = prodInStock.Quantity - data.Quantity;
                    //_context.ProductInStocks.Update(prodInStock);

                    ////Delete mapping
                    //var mapping = _context.ProductEntityMappings.Where(x => !x.IsDeleted && x.ProductQrCode.Equals(data.ProductQrCode)
                    //&& x.TicketImpCode.Equals(data.TicketCode));
                    //if (mapping.Any())
                    //{
                    //    foreach (var item in mapping)
                    //    {
                    //        item.IsDeleted = true;
                    //        var stockArrangePut = _context.StockArrangePutEntrys.FirstOrDefault(x => x.MapId == item.Id);
                    //        if (stockArrangePut != null)
                    //            _context.StockArrangePutEntrys.Remove(stockArrangePut);
                    //    }
                    //}

                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_MSG_NOT_FOUND_DATA"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }
        #endregion

        #region Upload File
        public class ProductInputModel
        {
            public int Id { get; set; }
            public string TicketCode { get; set; }
            public string ProductCode { get; set; }
            public string ProductName { get; set; }
            public string UnitName { get; set; }
            public string Unit { get; set; }
            public decimal Quantity { get; set; }
            public string SQuantity { get; set; }
            public decimal Cost { get; set; }
            public string SCost { get; set; }
            public string SupplierCode { get; set; }
            public bool? CheckProductCode { get; set; }
            public bool? CheckUnit { get; set; }
            public bool? CheckExportProduct { get; set; }
        }
        public class ModelImportExcel
        {
            public string PortType { get; set; }
            public string ProjectCode { get; set; }
            public List<ProductInputModel> ListEmp { get; set; }
        }
        [AllowAnonymous]
        public JsonResult LogInfomation([FromBody] ProductInputModel data)
        {
            var msg = new JMessage() { Error = false, Title = "", Object = "" };
            try
            {
                //data.DepartmentName = _context.AdDepartments.FirstOrDefault(x => !x.IsDeleted && x.IsEnabled && x.DepartmentCode.Equals(data.DepartmentCode)).Title;
                data.ProductName = _context.MaterialProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductCode.Equals(data.ProductCode)).ProductName;
                //data.NewRoleName = _context.Roles.FirstOrDefault(x => x.Id.Equals(data.NewRole)).Title;
                msg.Object = data;
                msg.Title = "Cập nhật thành công";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Lỗi thêm file" + ex.Message;
            }
            return Json(msg);
        }
        [AllowAnonymous]
        public JsonResult InsertFromExcel([FromBody] ModelImportExcel data)
        {
            var msg = new JMessage() { Error = false, Title = "", Object = "" };
            try
            {
                foreach (var item in data.ListEmp)
                {
                    var materialProduct = _context.MaterialProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductCode.Equals(item.ProductCode));
                    //var checkDetail = _context.StopContractDetails.FirstOrDefault(x => !x.IsDeleted && x.EmployeeCode.Equals(item.EmployeeCode) && x.DecisionNum.Equals(item.DecisionNum));
                    if (materialProduct != null /*&& checkDetail == null*/)
                    {
                        var receiveDetail = new ProjectProductDetail
                        {
                            TicketCode = item.TicketCode,
                            ProductCode = item.ProductCode,
                            Quantity = item.Quantity,
                            Unit = item.Unit,
                            Cost = item.Cost,
                            SupplierCode = item.SupplierCode
                        };
                        msg = InsertProductDetail(receiveDetail);
                        if (msg.Error)
                        {
                            return Json(msg);
                        }
                    }
                    else if (materialProduct == null)
                    {
                        msg.Error = true;
                        msg.Title = "Sản phẩm " + item.ProductCode + " không tồn tại  !";
                        return Json(msg);
                    }
                    //else
                    //{
                    //    msg.Error = true;
                    //    msg.Title = "Mã nhân viên " + item.EmployeeCode + " đã ở trong quyết định  !";
                    //    return Json(msg);
                    //}
                    msg.Title = "Thêm thành công";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Lỗi thêm file" + ex.Message;
            }
            return Json(msg);
        }

        public class UltraData
        {
            public string DecisionNum { get; set; }
        }
        [AllowAnonymous]
        public JsonResult UploadFileExcel(IFormFile fileUpload)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                List<ProductInputModel> list = new List<ProductInputModel>();
                if (fileUpload != null && fileUpload.Length > 0)
                {
                    ExcelEngine excelEngine = new ExcelEngine();
                    IApplication application = excelEngine.Excel;
                    IWorkbook workbook = application.Workbooks.Create();
                    workbook = application.Workbooks.Open(fileUpload.OpenReadStream());
                    if (!string.IsNullOrEmpty(ExcelController.docmodel.File_Path))
                    {
                        var pathTo = _hostingEnvironment.WebRootPath + ExcelController.docmodel.File_Path;
                        var fileStream = new FileStream(pathTo, FileMode.Open);
                        workbook = application.Workbooks.Open(fileStream);
                        fileStream.Close();
                    }
                    IWorksheet worksheet = workbook.Worksheets[0];
                    var user = _context.Users.FirstOrDefault(x => x.UserName.Equals(User.Identity.Name));
                    if (worksheet.Rows.Length > 1)
                    {
                        var title = worksheet.Rows[2].Cells;
                        if (
                            title[0].DisplayText.Trim() == "TT" &&
                            title[1].DisplayText.Trim() == "Mã VTTT" &&
                            title[2].DisplayText.Trim() == "Tên thiết bị" &&
                            title[3].DisplayText.Trim() == "Đơn vị" &&
                            title[4].DisplayText.Trim() == "Số lượng" &&
                            title[5].DisplayText.Trim() == "Đơn giá"
                            )
                        {
                            var length = worksheet.Rows.Where(x => !string.IsNullOrEmpty(x.Cells[1].DisplayText)).Count();
                            var id = 0;

                            var supplierCode = worksheet.GetValueRowCol(2, 4).ToString().Replace("\"", "").Trim();
                            var supplierName = worksheet.GetValueRowCol(2, 5).ToString().Replace("\"", "").Trim();
                            //var date = worksheet.GetValueRowCol(3, 4).ToString().Replace("\"", "").Trim();
                            //if (date.Length == 1)
                            //    date = "0" + date;
                            //var month = worksheet.GetValueRowCol(3, 6).ToString().Replace("\"", "").Trim();
                            //if (month.Length == 1)
                            //    month = "0" + month;
                            //var year = worksheet.GetValueRowCol(3, 8).ToString().Replace("\"", "").Trim();
                            //if (string.IsNullOrEmpty(supplierCode))
                            //{
                            //    msg.Error = true;
                            //    msg.Title = "Vui lòng nhập đầy đủ mã nhà cung cấp!";
                            //    return Json(msg);
                            //}

                            var header = new
                            {
                                SupplierCode = supplierCode,
                                SupplierName = supplierName
                            };

                            for (int i = 4; i <= length + 2; i++)
                            {
                                id++;

                                var validateObj = new ProductInputModel();
                                validateObj.ProductCode = worksheet.GetValueRowCol(i, 2).ToString().Replace("\"", "").Trim();
                                validateObj.ProductName = worksheet.GetValueRowCol(i, 3).ToString().Replace("\"", "").Trim();
                                validateObj.UnitName = worksheet.GetValueRowCol(i, 4).ToString().Replace("\"", "").Trim();
                                validateObj.SQuantity = worksheet.GetValueRowCol(i, 5).ToString().Replace("\"", "").Trim();
                                validateObj.SCost = worksheet.GetValueRowCol(i, 6).ToString().Replace("\"", "").Trim();
                                validateObj.SupplierCode = supplierCode;
                                //msg = ValidateData(validateObj);
                                //if (msg.Error)
                                //{
                                //    return Json(msg);
                                //}

                                var obj = new ProductInputModel();
                                obj.Id = id;
                                //obj.DecisionNum = decisionNumber;
                                obj.ProductCode = validateObj.ProductCode;
                                obj.ProductName = validateObj.ProductName;
                                obj.UnitName = validateObj.UnitName;
                                var objUnit = !string.IsNullOrEmpty(validateObj.UnitName) ? _context.CommonSettings.FirstOrDefault(x =>
                                    !x.IsDeleted &&
                                    x.ValueSet.ToLower().Equals(validateObj.UnitName.ToLower())) : null;
                                obj.Unit = objUnit != null ? objUnit.CodeSet : "";
                                obj.SCost = validateObj.SCost;
                                obj.SQuantity = validateObj.SQuantity;
                                obj.Cost = !string.IsNullOrEmpty(validateObj.SCost) ? decimal.Parse(validateObj.SCost.Replace(",", "")) : 0;
                                obj.Quantity = !string.IsNullOrEmpty(validateObj.SQuantity) ? decimal.Parse(validateObj.SQuantity) : 0;
                                obj.SupplierCode = validateObj.SupplierCode;
                                list.Add(obj);
                            }
                            msg.Object = new
                            {
                                Header = header,
                                Detail = list
                            };
                            msg.Title = "Đọc dữ liệu từ file Excel thành công !";
                        }
                        else
                        {
                            msg.Error = true;
                            msg.Title = "File excel không phù hợp !";
                        }
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = "File excel không có dữ liệu !";
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "File excel không có dữ liệu !";
                }
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Lỗi thêm file" + ex.Message;
            }
            return Json(msg);
        }
        [AllowAnonymous]
        public JMessage ValidateData([FromBody] ModelImportExcel data)
        {
            var msg = new JMessage() { };
            try
            {
                foreach (var validateObj in data.ListEmp)
                {
                    // return true if encounter any error
                    validateObj.CheckProductCode = !_context.MaterialProducts.Any(x => !x.IsDeleted && x.ProductCode.Equals(validateObj.ProductCode));
                    validateObj.CheckUnit = !_context.CommonSettings.Any(x => !x.IsDeleted && x.ValueSet.ToLower().Equals(validateObj.UnitName.ToLower()));
                    if (validateObj.CheckProductCode.Value || validateObj.CheckUnit.Value)
                    {
                        msg.Title = "Một số bản ghi không hợp lệ yêu cầu sửa lại file excel";
                        msg.Error = true;
                    }
                    if (data.PortType == "EXPORT")
                    {
                        var isExistInView = _context.VProjectProductRemains.Any(x =>
                            x.ProductCode == validateObj.ProductCode && x.TotalRemain > 0
                                                                     && x.Unit == validateObj.Unit &&
                                                                     x.ProjectCode == data.ProjectCode);
                        if (!isExistInView)
                        {
                            msg.Title = "Thiết bị và vật tư không hợp lệ";
                            msg.Error = true;
                            validateObj.CheckProductCode = true;
                        }
                        else
                        {
                            var viewObject = _context.VProjectProductRemains.FirstOrDefault(x =>
                                x.ProductCode == validateObj.ProductCode && x.TotalRemain > 0
                                                                         && x.Unit == validateObj.Unit &&
                                                                         x.ProjectCode == data.ProjectCode);
                            var finalRemain = viewObject.TotalRemain - validateObj.Quantity;
                            if (finalRemain < 0)
                            {
                                msg.Title = "Thiết bị và vật tư không hợp lệ";
                                msg.Error = true;
                                validateObj.CheckProductCode = true;
                                validateObj.CheckExportProduct = true;
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }

            msg.Object = data;
            return msg;
        }
        #endregion

        #region Service
        [HttpGet]
        public object GetService()
        {
            var list = (from a in _context.ServiceCategorys
                        where a.IsDeleted == false
                        select new
                        {
                            Code = a.ServiceCode,
                            Name = a.ServiceName,
                            a.Unit,
                            Type = a.ServiceType,
                            a.ServiceGroup,

                        });
            return list;

        }

        [HttpGet]
        public object GetServiceLevel()
        {
            return _context.CommonSettings.Where(x => x.Group == EnumHelper<ServiceEnum>.GetDisplayValue(ServiceEnum.ServiceLevel) && x.IsDeleted == false).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
        }

        [HttpGet]
        public object GetServiceDuration()
        {
            var list = new List<Properties>();
            var date = new Properties
            {
                Code = EnumHelper<UnitDuration>.GetDisplayValue(UnitDuration.Date),
                Name = UnitDuration.Date.DescriptionAttr()
            };
            list.Add(date);

            var month = new Properties
            {
                Code = EnumHelper<UnitDuration>.GetDisplayValue(UnitDuration.Month),
                Name = UnitDuration.Month.DescriptionAttr()
            };
            list.Add(month);

            var year = new Properties
            {
                Code = EnumHelper<UnitDuration>.GetDisplayValue(UnitDuration.Year),
                Name = UnitDuration.Year.DescriptionAttr()
            };
            list.Add(year);
            return Json(list);
        }

        [HttpPost]
        public object JTableService([FromBody] JTableModelProject jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            if (jTablePara.ProjectCode == null)
            {
                var list = new List<object>();
                return JTableHelper.JObjectTable(list, jTablePara.Draw, 0, "Id", "CustomerCode", "CusName", "Address", "Email");
            }
            var query = from a in _context.ProjectServices
                        join b in _context.ServiceCategorys on a.ServiceCode equals b.ServiceCode into b1
                        from b in b1.DefaultIfEmpty()
                        join c in _context.CommonSettings on a.Level equals c.CodeSet into c1
                        from c in c1.DefaultIfEmpty()
                        where b.IsDeleted == false && a.ProjectCode == jTablePara.ProjectCode
                        select new
                        {
                            a.Id,
                            a.ServiceCode,
                            ServiceName = (b != null ? b.ServiceName : ""),
                            a.Level,
                            LevelName = (c != null ? c.ValueSet : ""),
                            a.Quantity,
                            a.DurationTime,
                            a.Unit,
                            UnitName = a.Unit == EnumHelper<UnitDuration>.GetDisplayValue(UnitDuration.Date) ? UnitDuration.Date.DescriptionAttr() :
                            a.Unit == EnumHelper<UnitDuration>.GetDisplayValue(UnitDuration.Month) ? UnitDuration.Month.DescriptionAttr() : UnitDuration.Year.DescriptionAttr(),
                            a.Note
                        };
            int count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "ServiceCode", "ServiceName", "Level", "LevelName", "Quantity", "DurationTime", "Unit", "UnitName", "Note");
            return Json(jdata);
        }
        [HttpPost]
        public async Task<JsonResult> InsertService([FromBody] ProjectService obj)
        {
            var msg = new JMessage { Error = false };
            try
            {
                using (await userLock.LockAsync(string.Concat(obj.ProjectCode, obj.ServiceCode)))
                {
                    var checkExist = await _context.ProjectServices.FirstOrDefaultAsync(x => x.ProjectCode == obj.ProjectCode && x.ServiceCode == obj.ServiceCode);
                    if (checkExist == null)
                    {
                        _context.ProjectServices.Add(obj);
                        _context.SaveChanges();
                        msg.Title = _stringLocalizer["PROJECT_MSG_ADD_SERVICE_SUCCESS"];
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["PROJECT_MSG_SERVICE_EXIST_IN_PRO"];
                    }
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
        public object UpdateService([FromBody] ProjectService obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var service = _context.ProjectServices.FirstOrDefault(x => x.Id == obj.Id);
                if (service != null)
                {
                    service.Unit = obj.Unit;
                    service.Level = obj.Level;
                    service.Quantity = obj.Quantity;
                    service.DurationTime = obj.DurationTime;
                    service.Unit = obj.Unit;
                    service.Note = obj.Note;
                    _context.ProjectServices.Update(service);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["PROJECT_MSG_SERVICE_NOT_EXIST"];
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
        public JsonResult DeleteService(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.ProjectServices.FirstOrDefault(x => x.Id == id);
                _context.ProjectServices.Remove(data);
                _context.SaveChanges();
                msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }
        #endregion

        #region Service_Header
        [AllowAnonymous]
        [HttpPost]
        public object JTableServiceNew([FromBody] JTableModelProject jTablePara)
        {
            try
            {
                int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
                var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                if (jTablePara.ProjectCode == null)
                {
                    var list = new List<object>();
                    return JTableHelper.JObjectTable(list, jTablePara.Draw, 0, "Id", "ServiceCode", "Cost", "Quantity", "Unit", "PriceType", "Tax", "Note", "UnitName", "HeaderId", "HeaderName", "Code", "SLastLog");
                }
                var query = from a in _context.ProjectServiceDetails.Where(x => !x.IsDeleted)
                            join b in _context.ProjectServiceHeaders.Where(x => !x.IsDeleted) on a.TicketCode equals b.TicketCode
                            join c in _context.ServiceCategorys.Where(x => !x.IsDeleted) on a.ServiceCode equals c.ServiceCode
                            //join d in _context.CommonSettings on a.Unit equals d.CodeSet into d1
                            //from d in d1.DefaultIfEmpty()
                            where b.ProjectCode == jTablePara.ProjectCode
                                  && (fromDate == null || fromDate != null && b.TicketTime >= fromDate)
                                  && (toDate == null || toDate != null && b.TicketTime <= toDate)
                                  && (string.IsNullOrEmpty(jTablePara.PortType) || b.PortType == jTablePara.PortType)
                                  && (string.IsNullOrEmpty(jTablePara.ServiceCode) || a.ServiceCode == jTablePara.ServiceCode)
                            select new ProjectServiceItem
                            {
                                Id = a.Id,
                                ServiceCode = a.ServiceCode + " - " + c.ServiceName,
                                Code = a.ServiceCode,
                                Cost = a.Cost ?? 0,
                                Quantity = a.Quantity,
                                //Unit = a.Unit,
                                //PriceType = a.PriceType,
                                //Tax = a.Tax,
                                Note = b.Note,
                                HeaderId = b.Id,
                                HeaderName = b.Title,
                                DurationTime = a.DurationTime,
                                Unit = a.Unit,
                                UnitName = a.Unit == EnumHelper<UnitDuration>.GetDisplayValue(UnitDuration.Date) ? UnitDuration.Date.DescriptionAttr() :
                                    a.Unit == EnumHelper<UnitDuration>.GetDisplayValue(UnitDuration.Month) ? UnitDuration.Month.DescriptionAttr() : UnitDuration.Year.DescriptionAttr(),
                                //TaxMoney = Math.Round(Convert.ToDouble(a.Cost) * Convert.ToDouble(a.Tax) * Convert.ToDouble(a.Quantity) / 100),
                                ListStatusObjectLog = b.ListStatusObjectLog
                            };
                var count = query.Count();
                var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
                foreach (var item in data)
                {
                    item.SLastLog = item.ListStatusObjectLog != null && item.ListStatusObjectLog.Any()
                        ? JsonConvert.SerializeObject(item.ListStatusObjectLog.LastOrDefault())
                        : "";
                }
                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "ServiceCode", "Cost", "Quantity", "DurationTime", "Unit", "PriceType", "Tax", "Note", "UnitName", "HeaderId", "HeaderName", "Code", "SLastLog");
                return Json(jdata);
            }
            catch (Exception ex)
            {
                var list = new List<object>();
                var jdata = JTableHelper.JObjectTable(list, jTablePara.Draw, 0, "Id", "ServiceCode", "Cost", "Quantity", "DurationTime", "Unit", "PriceType", "Tax", "Note", "UnitName", "HeaderId", "HeaderName", "Code", "SLastLog");
                jdata.Add("exceptionMessage", ex.Message);
                return Json(jdata);
            }
        }
        private static int _ticketCounterService = 1;
        private static DateTime? _lastTicketTimeService;
        [AllowAnonymous]
        [HttpPost]
        public JsonResult CreateTicketCodeService(string projectCode)
        {
            var mess = new JMessage { Error = false, Title = "" };
            try
            {
                var monthNow = DateTime.Now.Month;
                var yearNow = DateTime.Now.Year;
                var lastHeader = _context.ProjectServiceHeaders.LastOrDefault(x => x.CreatedTime.HasValue && x.CreatedTime.Value.Date == DateTime.Now.Date);
                // if lastTicketTime = null mean a server restart, we must take the count from last record in same month from db, if none exist we take 1 as count
                if (_lastTicketTimeService == null)
                {
                    _lastTicketTimeService = DateTime.Now;
                    if (lastHeader != null && lastHeader.TicketCount.HasValue)
                    {
                        _ticketCounterService = lastHeader.TicketCount.Value + 1;
                    }
                    else
                    {
                        _ticketCounterService = 1;
                    }
                }
                // if lastTimeTicket exist and this month is different from last month, we take 1 as count
                else if (_lastTicketTimeService.Value.Month != monthNow && _lastTicketTimeService.Value.Year != yearNow)
                {
                    _ticketCounterService = 1;
                }
                else
                {
                    _ticketCounterService++;
                }
                // else it is in same month, we take increase the count by 1

                //var numProject = _context.ProjectServiceHeaders.Where(x => x.ProjectCode == projectCode).ToList();
                var numProjectCount = _ticketCounterService;
                //if (numProject.Count > 0)
                //    numProjectCount = numProjectCount + numProject.Count;
                var ticketCode = $"{projectCode}_{monthNow}.{yearNow}_{numProjectCount}";

                mess.Object = ticketCode;
                mess.ID = numProjectCount;
            }
            catch (Exception ex)
            {
                mess.Error = true;
                //mess.Title = String.Format(CommonUtil.ResourceValue("MIS_MSG_IMPORT_WARE_HOURE_EXITS"));
                //mess.Title = _stringLocalizer["MIS_MSG_IMPORT_WARE_HOURE_EXITS"];
                mess.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(mess);
        }
        [AllowAnonymous]
        [HttpPost]
        public JsonResult GetServiceHeader(int id)
        {
            var mess = new JMessage { Error = false, Title = "" };
            try
            {
                mess.Object = _context.ProjectServiceHeaders.FirstOrDefault(x => x.Id == id);
            }
            catch (Exception ex)
            {
                mess.Error = true;
                //mess.Title = String.Format(CommonUtil.ResourceValue("MIS_MSG_IMPORT_WARE_HOURE_EXITS"));
                mess.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(mess);
        }
        [AllowAnonymous]
        [HttpPost]
        public JsonResult InsertServiceHeader([FromBody] ProjectServiceHeaderCrudModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var ticketTime = !string.IsNullOrEmpty(obj.TicketTime) ? DateTime.ParseExact(obj.TicketTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var chk = _context.ProjectServiceHeaders.Any(x => x.TicketCode.Equals(obj.TicketCode) && !x.IsDeleted);
                if (!chk)
                {
                    //Insert bảng header
                    var objNew = new ProjectServiceHeader
                    {
                        TicketCode = obj.TicketCode,
                        Title = obj.Title,
                        TicketCount = obj.TicketCount,
                        ProjectCode = obj.ProjectCode,
                        TicketTime = ticketTime,
                        Note = obj.Note,
                        Sender = obj.Sender,
                        Receiver = obj.Receiver,
                        Supplier = obj.Supplier,
                        PortType = obj.PortType,
                        ListStatusObjectLog = new List<JsonLog>(),
                        CreatedBy = AppContext.UserName,
                        CreatedTime = DateTime.Now
                    };
                    _context.ProjectServiceHeaders.Add(objNew);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizer["Thêm phiếu thành công"];

                    msg.ID = objNew.Id;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["Đã tồn tại phiếu"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [AllowAnonymous]
        [HttpPost]
        public JsonResult UpdateServiceHeader([FromBody] ProjectServiceHeaderCrudModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var ticketTime = !string.IsNullOrEmpty(obj.TicketTime) ? DateTime.ParseExact(obj.TicketTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var objUpdate = _context.ProjectServiceHeaders.FirstOrDefault(x => x.TicketCode.Equals(obj.TicketCode) && !x.IsDeleted);
                if (objUpdate != null)
                {
                    //var lstStatus = new List<JsonStatus>();

                    ////Check xem sản phẩm đã được đưa vào phiếu xuất kho chưa
                    //var chkUsing = (from a in _context.ProdReceivedDetails.Where(x => !x.IsDeleted && x.TicketCode == obj.TicketCode)
                    //                join b in _context.ProdDeliveryDetails.Where(x => !x.IsDeleted) on a.ServiceQrCode equals b.ServiceQrCode
                    //                select a.Id).Any();

                    ////Check xem sản phẩm đã được xếp kho thì không cho sửa kho nhập
                    //var chkOrdering = (from a in _context.ProdReceivedDetails.Where(x => !x.IsDeleted && x.TicketCode == obj.TicketCode)
                    //                   join b in _context.ServiceEntityMappings.Where(x => !x.IsDeleted) on a.ServiceQrCode equals b.ServiceQrCode
                    //                   select a.Id).Any();
                    if (false)
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["MIS_MSG_ERRO_ADD_IMPORT_WARE_HOURE_EXPORT"];
                    }
                    //else if (chkOrdering && !objUpdate.StoreCode.Equals(obj.StoreCode))
                    //{
                    //    msg.Error = true;
                    //    msg.Title = _stringLocalizer["MIST_SORT_PRODUCT_CANNOT_EDIT"];
                    //}
                    //var oldTimeTicketCreate = objUpdate.TimeTicketCreate;

                    //Update bảng header
                    objUpdate.Title = obj.Title;
                    objUpdate.ProjectCode = obj.ProjectCode;
                    objUpdate.TicketTime = ticketTime;
                    objUpdate.Note = obj.Note;
                    objUpdate.Sender = obj.Sender;
                    objUpdate.Receiver = obj.Receiver;
                    objUpdate.Supplier = obj.Supplier;
                    objUpdate.PortType = obj.PortType;

                    objUpdate.UpdatedBy = AppContext.UserName;
                    objUpdate.UpdatedTime = DateTime.Now;
                    msg.Title = string.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], "Phiếu nhập xuất hàng hóa");
                    //var header = _context.ProdReceivedHeaders.FirstOrDefault(x => !x.IsDeleted && x.TicketCode.Equals(obj.TicketCode));
                    //var detail = _context.ProdReceivedDetails.Where(x => !x.IsDeleted && x.TicketCode.Equals(obj.TicketCode)).ToList();
                    //if (header != null)
                    //{
                    //    var logData = new
                    //    {
                    //        Header = header,
                    //        Detail = detail
                    //    };

                    //    var listLogData = new List<object>();

                    //    if (!string.IsNullOrEmpty(header.LogData))
                    //    {
                    //        listLogData = JsonConvert.DeserializeObject<List<object>>(header.LogData);
                    //        logData.Header.LogData = null;
                    //        listLogData.Add(logData);
                    //        header.LogData = JsonConvert.SerializeObject(listLogData);

                    //        _context.ProdReceivedHeaders.Update(header);
                    //        _context.SaveChanges();
                    //    }
                    //    else
                    //    {
                    //        listLogData.Add(logData);

                    //        header.LogData = JsonConvert.SerializeObject(listLogData);

                    //        _context.ProdReceivedHeaders.Update(header);

                    //    }
                    //}

                    ////Work flow update status
                    //var session = HttpContext.GetSessionUser();
                    //if (!string.IsNullOrEmpty(objUpdate.Status))
                    //{
                    //    lstStatus = JsonConvert.DeserializeObject<List<JsonStatus>>(objUpdate.Status);
                    //}
                    //objUpdate.JsonData = CommonUtil.JsonData(objUpdate, obj, objUpdate.JsonData, session.FullName);
                    _context.ProjectServiceHeaders.Update(objUpdate);
                    _context.SaveChanges();
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["Phiếu không tồn tại"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [AllowAnonymous]
        [HttpPost]
        public JMessage DeleteServiceHeader(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.ProjectServiceHeaders.FirstOrDefault(x => x.Id == id && !x.IsDeleted);
                if (data == null)
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_MSG_NOT_EXITS"], _stringLocalizer["Phiếu nhập xuất hàng hóa"]);
                }
                else
                {
                    //Check xem sản phẩm đã được đưa vào phiếu xuất kho chưa
                    //var chkUsing = (from a in _context.ProdReceivedDetails.Where(x => !x.IsDeleted && x.TicketCode == data.TicketCode)
                    //                join b in _context.ProdDeliveryDetails.Where(x => !x.IsDeleted) on a.ServiceQrCode equals b.ServiceQrCode
                    //                select a.Id).Any();
                    //if (chkUsing)
                    //{
                    //    msg.Error = true;
                    //    msg.Title = _stringLocalizer["MIS_MSG_ERRO_DELTE_IMPORT_WARE_HOURE"];
                    //    return Json(msg);
                    //}

                    ////Check xem sản phẩm đã được xếp kho chưa
                    //var chkMapping = (from a in _context.ProdReceivedDetails.Where(x => !x.IsDeleted && x.TicketCode == data.TicketCode)
                    //                  join b in _context.ServiceEntityMappings.Where(x => !x.IsDeleted && x.Quantity > 0) on a.ServiceQrCode equals b.ServiceQrCode
                    //                  join c in _context.MapStockProdIns on b.Id equals c.MapId
                    //                  select a.Id).Any();
                    if (false)
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["MIS_MSG_NOT_DELETE"];
                        return msg;
                    }
                    //xóa header
                    data.IsDeleted = true;
                    data.DeletedBy = AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    _context.ProjectServiceHeaders.Update(data);

                    //xóa detail
                    var listDetail = _context.ProjectServiceDetails.Where(x => !x.IsDeleted && x.TicketCode == data.TicketCode).ToList();
                    listDetail.ForEach(x =>
                    {
                        x.IsDeleted = true;
                        x.DeletedBy = AppContext.UserName;
                        x.DeletedTime = DateTime.Now;
                    });
                    _context.ProjectServiceDetails.UpdateRange(listDetail);

                    //Xóa attr value của phiếu
                    //var lstAttrValue = _context.ProdReceivedAttrValues.Where(x => x.TicketImpCode.Equals(data.TicketCode) && !x.IsDeleted).ToList();
                    //if (lstAttrValue.Any())
                    //{
                    //    lstAttrValue.ForEach(x =>
                    //    {
                    //        x.IsDeleted = true;
                    //        x.DeletedBy = ESEIM.AppContext.UserName;
                    //        x.DeletedTime = DateTime.Now;
                    //    });
                    //    _context.ProdReceivedAttrValues.UpdateRange(lstAttrValue);
                    //    var lstStockAttrValue = _context.ProdInStockAttrValues.Where(x => x.TicketImpCode.Equals(data.TicketCode) && !x.IsDeleted).ToList();
                    //    lstStockAttrValue.ForEach(x =>
                    //    {
                    //        x.IsDeleted = true;
                    //        x.DeletedBy = ESEIM.AppContext.UserName;
                    //        x.DeletedTime = DateTime.Now;
                    //    });
                    //    _context.ProdInStockAttrValues.UpdateRange(lstStockAttrValue);
                    //}

                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Object = ex;
            }
            return msg;
        }
        #endregion

        #region Service_Detail
        [AllowAnonymous]
        [HttpPost]
        public JsonResult InsertServiceDetail([FromBody] ProjectServiceDetail obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                //Check service is exist in Receive with conditions: ticket, service, unit, packing
                //var mark = _context.ProdReceivedAttrValues.Where(x => !x.IsDeleted && x.TicketImpCode.Equals(obj.TicketCode));

                var check = _context.ProjectServiceDetails.FirstOrDefault(x => !x.IsDeleted && x.TicketCode.Equals(obj.TicketCode)
                && x.ServiceCode.Equals(obj.ServiceCode) && x.Cost.Equals(obj.Cost) && x.Unit.Equals(obj.Unit)/* && x.PackType.Equals(obj.PackType)*/);

                //var maxId = _context.ProdReceivedDetails.MaxBy(x => x.Id) != null ? _context.ProdReceivedDetails.MaxBy(x => x.Id).Id : 1;

                //var packCode = "";
                //var serviceQrCode = "";
                if (check == null)
                {
                    var receiveDetail = new ProjectServiceDetail
                    {
                        TicketCode = obj.TicketCode,
                        ServiceCode = obj.ServiceCode,
                        //ServiceQrCode = obj.ServiceCode + "_" + maxId,
                        //ServiceType = obj.ServiceType,
                        DurationTime = obj.DurationTime,
                        Quantity = obj.Quantity,
                        Unit = obj.Unit,
                        Cost = obj.Cost,
                        //SalePrice = obj.SalePrice,
                        //Currency = obj.Currency,
                        CreatedBy = AppContext.UserName,
                        CreatedTime = DateTime.Now,
                        //QuantityIsSet = 0,
                        //PackType = obj.PackType,
                        //MarkWholeService = mark.Any() ? true : false,
                        //PackCode = string.Format("PACK_{0}", obj.ServiceCode + "_" + maxId)
                    };

                    //serviceQrCode = receiveDetail.ServiceQrCode;

                    //var listPack = new List<WarehouseRecordsPack>();

                    //for (int i = 1; i <= obj.Quantity; i++)
                    //{
                    //    packCode = receiveDetail.PackCode;

                    //    if (obj.Quantity > 1)
                    //        packCode = string.Format("{0}_{1}", receiveDetail.PackCode, i);

                    //    var pack = new WarehouseRecordsPack
                    //    {
                    //        PackCode = packCode,
                    //        QrCode = packCode,
                    //        PackName = packCode,
                    //        PackLevel = "0",
                    //        PackHierarchyPath = packCode,
                    //        PackType = "PACK_TYPE_BOX",
                    //        PackQuantity = 1,
                    //        CreatedBy = User.Identity.Name,
                    //        CreatedTime = DateTime.Now,
                    //        ImportHeaderCode = obj.TicketCode,
                    //        PackParent = GetParent(obj.ServiceCode, obj.PackType, obj.TicketCode)
                    //    };

                    //    listPack.Add(pack);
                    //}

                    //foreach (var item in listPack)
                    //{
                    //    var exitPack = _context.WarehouseRecordsPacks.Any(x => !x.IsDeleted && x.PackCode.Equals(item.PackCode));
                    //    if (!exitPack)
                    //        _context.WarehouseRecordsPacks.Add(item);
                    //}

                    //receiveDetail.PackCode = listPack.FirstOrDefault().PackCode;
                    _context.ProjectServiceDetails.Add(receiveDetail);
                }
                else
                {
                    //serviceQrCode = check.ServiceQrCode;
                    //packCode = check.PackCode;
                    check.Quantity += obj.Quantity;
                    check.UpdatedBy = AppContext.UserName;
                    check.UpdatedTime = DateTime.Now;
                    //check.SalePrice += obj.SalePrice;
                    _context.ProjectServiceDetails.Update(check);
                }
                //var storeInventory = _context.ServiceInStocks.FirstOrDefault(x => !x.IsDeleted && x.ServiceQrCode.Equals(serviceQrCode));
                //if (storeInventory != null)
                //{
                //    storeInventory.Quantity = storeInventory.Quantity + obj.Quantity;
                //    storeInventory.PackCode = packCode;
                //    _context.ServiceInStocks.Update(storeInventory);
                //}
                //else
                //{
                //    var storeInventoryObj = new ServiceInStock
                //    {
                //        LotServiceCode = obj.LotServiceCode,
                //        StoreCode = obj.StoreCode,

                //        ServiceCode = obj.ServiceCode,
                //        ServiceType = obj.ServiceType,
                //        ServiceQrCode = obj.ServiceCode + "_" + maxId,
                //        Quantity = obj.Quantity,
                //        Unit = obj.Unit,
                //        CreatedBy = User.Identity.Name,
                //        CreatedTime = DateTime.Now,
                //        IsDeleted = false,
                //        MarkWholeService = mark.Any() ? true : false,
                //        PackCode = packCode
                //    };
                //    _context.ServiceInStocks.Add(storeInventoryObj);
                //}
                _context.SaveChanges();
                msg.Title = _sharedResources["COM_ADD_SUCCESS"];
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [AllowAnonymous]
        [HttpPost]
        public JsonResult UpdateServiceDetail([FromBody] ProjectServiceDetail obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var detail = _context.ProjectServiceDetails.FirstOrDefault(x => !x.IsDeleted && x.TicketCode.Equals(obj.TicketCode)
                && x.ServiceCode.Equals(obj.ServiceCode) && x.Cost.Equals(obj.Cost) && x.Unit.Equals(obj.Unit) /*&& x.PackType.Equals(obj.PackType)*/);

                //var maxId = _context.ProjectServiceDetails.MaxBy(x => x.Id) != null ? _context.ProjectServiceDetails.MaxBy(x => x.Id).Id : 1;
                if (detail != null)
                {
                    //detail.Unit = obj.Unit;
                    //detail.Cost = obj.Cost;
                    detail.DurationTime = obj.DurationTime;
                    detail.Quantity = obj.Quantity;
                    detail.UpdatedBy = AppContext.UserName;
                    detail.UpdatedTime = DateTime.Now;
                    //detail.SalePrice = obj.SalePrice;
                    //detail.Currency = obj.Currency;
                    //detail.PackCode = obj.PackCode;
                    _context.ProjectServiceDetails.Update(detail);

                    //var storeInventory = _context.ServiceInStocks.FirstOrDefault(x => !x.IsDeleted && x.ServiceQrCode.Equals(obj.ServiceQrCode));
                    //if (storeInventory != null)
                    //{
                    //    storeInventory.PackCode = obj.PackCode;
                    //    _context.ServiceInStocks.Update(storeInventory);
                    //}

                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Không tìm thấy chi tiết phiếu";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [AllowAnonymous]
        [HttpGet]
        public JsonResult GetServiceDetail(string ticketCode)
        {
            var data = (from a in _context.ProjectServiceDetails.Where(x => !x.IsDeleted && x.TicketCode.Equals(ticketCode))
                        join b in _context.ServiceCategorys.Where(x => !x.IsDeleted) on a.ServiceCode equals b.ServiceCode
                        //join c in _context.WarehouseRecordsPacks.Where(x => !x.IsDeleted) on a.PackCode equals c.PackCode into c1
                        //from c in c1.DefaultIfEmpty()
                        select new
                        {
                            a.Id,
                            a.TicketCode,
                            b.ServiceName,
                            b.ServiceCode,
                            a.DurationTime,
                            a.Quantity,
                            a.Cost,
                            //a.QuantityIsSet,
                            Unit = a.Unit == EnumHelper<UnitDuration>.GetDisplayValue(UnitDuration.Date) ? UnitDuration.Date.DescriptionAttr() :
                                a.Unit == EnumHelper<UnitDuration>.GetDisplayValue(UnitDuration.Month) ? UnitDuration.Month.DescriptionAttr() : UnitDuration.Year.DescriptionAttr(),
                            //a.SalePrice,
                            //CurrencyCode = a.Currency,
                            //Currency = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.Currency).ValueSet,
                            QrCode = CommonUtil.GeneratorQRCode(a.ServiceCode),
                            //ServiceQRCode = a.ServiceQrCode,
                            //Remain = a.Quantity - a.QuantityIsSet,
                            //PackType = !string.IsNullOrEmpty(a.PackType) ? a.PackType : "",
                            //PackName = c != null ? c.PackName : "Chưa đóng gói",
                            //PackCode = a.PackCode,
                            //sServiceQrCode = CommonUtil.GenerateQRCode("SP:" + a.ServiceQrCode + "_P:" + a.TicketCode + "_SL:" + a.Quantity),
                            UnitCode = a.Unit
                        });
            return Json(data);
        }

        [AllowAnonymous]
        [HttpPost]
        public JsonResult DeleteServiceDetail(int id, int headerId = -1)
        {
            var msg = new JMessage();
            try
            {
                var data = _context.ProjectServiceDetails.FirstOrDefault(x => !x.IsDeleted && x.Id == id);
                if (data != null)
                {
                    //var checkExport = _context.ProjectServiceDetails.Where(x => !x.IsDeleted && x.ServiceQrCode.Equals(data.ServiceQrCode));
                    //if (checkExport.Any())
                    //{
                    //    msg.Error = true;
                    //    msg.Title = _stringLocalizer["MIS_MSG_SORT_WARE_HOURE_PRODUCT_NON_DELETED"];
                    //    return Json(msg);
                    //}

                    var listDetail = _context.ProjectServiceDetails.Where(x => !x.IsDeleted && x.TicketCode == data.TicketCode).ToList();
                    var header =
                        _context.ProjectServiceHeaders.FirstOrDefault(x =>
                            !x.IsDeleted && x.Id == headerId);
                    if (listDetail.Count <= 1 && header != null)
                    {
                        msg = DeleteServiceHeader(header.Id);
                    }
                    else
                    {
                        data.IsDeleted = true;
                        data.DeletedBy = AppContext.UserName;
                        data.DeletedTime = DateTime.Now;
                        _context.ProjectServiceDetails.Update(data);
                    }

                    //var checkPack = _context.ProdReceivedDetails.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.PackCode) && x.PackCode.Equals(data.PackCode));
                    //if (checkPack.Count() == 1)
                    //{
                    //    var pack = _context.WarehouseRecordsPacks.FirstOrDefault(x => !x.IsDeleted && x.PackCode.Equals(data.PackCode));
                    //    if (pack != null)
                    //    {
                    //        pack.IsDeleted = true;
                    //        _context.WarehouseRecordsPacks.Update(pack);
                    //    }
                    //}

                    //var prodInStock = _context.ServiceInStocks.FirstOrDefault(x => x.ServiceQrCode.Equals(data.ServiceQrCode) && !x.IsDeleted);
                    //prodInStock.Quantity = prodInStock.Quantity - data.Quantity;
                    //_context.ServiceInStocks.Update(prodInStock);

                    ////Delete mapping
                    //var mapping = _context.ServiceEntityMappings.Where(x => !x.IsDeleted && x.ServiceQrCode.Equals(data.ServiceQrCode)
                    //&& x.TicketImpCode.Equals(data.TicketCode));
                    //if (mapping.Any())
                    //{
                    //    foreach (var item in mapping)
                    //    {
                    //        item.IsDeleted = true;
                    //        var stockArrangePut = _context.StockArrangePutEntrys.FirstOrDefault(x => x.MapId == item.Id);
                    //        if (stockArrangePut != null)
                    //            _context.StockArrangePutEntrys.Remove(stockArrangePut);
                    //    }
                    //}

                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_MSG_NOT_FOUND_DATA"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }
        #endregion

        #region Attribute
        [HttpPost]
        public object JTableAttribute([FromBody] JTableModelProject jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            if (jTablePara.ProjectCode == null)
            {
                var list = new List<object>();
                return JTableHelper.JObjectTable(list, jTablePara.Draw, 0, "Id", "CustomerCode", "CusName", "Address", "Email");
            }
            var query = from a in _context.ProjectAttributes
                        where a.ProjectCode == jTablePara.ProjectCode
                        && (string.IsNullOrEmpty(jTablePara.AttrCode) || a.AttrCode.ToLower().Contains(jTablePara.AttrCode.ToLower()))
                        && (string.IsNullOrEmpty(jTablePara.AttrValue) || a.AttrValue.ToLower().Contains(jTablePara.AttrValue.ToLower()))
                        select new
                        {
                            a.Id,
                            a.AttrCode,
                            a.AttrValue,
                            a.CreatedTime
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "AttrCode", "AttrValue", "CreatedTime");
            return Json(jdata);
        }

        [HttpPost]
        public JsonResult GetItemProjectTabAttribute([FromBody] int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.ProjectAttributes.FirstOrDefault(x => x.Id == id);
                if (data != null)
                {
                    msg.Object = data;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_EXIST_ATRIBUTE"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_ERRO_ADD_ATRIBUTE"]);
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult InsertProjectTabAttribute([FromBody] ProjectAttribute obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var checkExist = _context.ProjectAttributes.FirstOrDefault(x => x.ProjectCode == obj.ProjectCode && x.AttrCode.ToLower() == obj.AttrCode.ToLower());
                if (checkExist == null)
                {
                    obj.CreatedBy = AppContext.UserName;
                    obj.CreatedTime = DateTime.Now;
                    _context.ProjectAttributes.Add(obj);
                    _context.SaveChanges();
                    msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_ADD_PROPETIES"]);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_CODE_PROPETIES_EXIST"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_ERRO_ADD_ATRIBUTE"]);
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateProjectTabAttribute([FromBody] ProjectAttribute obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                obj.CreatedBy = AppContext.UserName;
                obj.CreatedTime = DateTime.Now;
                _context.ProjectAttributes.Update(obj);
                _context.SaveChanges();
                msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_UPPDATE_PROPETIES"]);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_ERRO_UPPDATE_PROPETIES"]);
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult DeleteProjectTabAttribute([FromBody] int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.ProjectAttributes.FirstOrDefault(x => x.Id == id);
                if (data != null)
                {
                    _context.ProjectAttributes.Remove(data);
                    _context.SaveChanges();
                    msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_DELETE_PROPETIES_SUCCESS"]);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_PROPETIES_EXIST"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_ERRO_DELETE_PROPETIES_EXIST"]);
            }
            return Json(msg);
        }
        #endregion

        #region File
        public class JTableModelFile : JTableModel
        {
            public string ProjectCode { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string CatCode { get; set; }
        }

        [HttpPost]
        public object JTableFile([FromBody] JTableModelFile jTablePara)
        {
            if (string.IsNullOrEmpty(jTablePara.ProjectCode))
            {
                return JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "Id", "FileName", "FileTypePhysic", "Desc", "Url", "CreatedTime", "UpdatedTime", "ReposName", "TypeFile", "SizeOfFile", "FileID");
            }
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var query = ((from a in _context.EDMSRepoCatFiles.Where(x => x.ObjectCode == jTablePara.ProjectCode && x.ObjectType == EnumHelper<ProjectEnum>.GetDisplayValue(ProjectEnum.Project))
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
                              b.FileID,
                              SizeOfFile = b.FileSize.HasValue ? b.FileSize.Value : 0,
                          }).Union(
                  from a in _context.EDMSObjectShareFiles.Where(x => x.ObjectCode == jTablePara.ProjectCode && x.ObjectType == EnumHelper<ProjectEnum>.GetDisplayValue(ProjectEnum.Project))
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
                      b.FileID,
                      SizeOfFile = b.FileSize.HasValue ? b.FileSize.Value : 0,
                  })).AsNoTracking();
            int count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "FileCode", "FileName", "FileTypePhysic", "Desc", "CreatedTime", "CloudFileId", "ReposName", "TypeFile", "FileID", "SizeOfFile");
            return jdata;
        }

        [HttpPost]
        [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
        [RequestSizeLimit(long.MaxValue)]
        public JsonResult InsertProjectFile(EDMSRepoCatFileModel obj, IFormFile fileUpload)
        {
            var msg = new JMessage { Error = false, Title = "" };
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
                    var repoDefault = _context.EDMSRepoDefaultObjects.FirstOrDefault(x => !x.IsDeleted
                            && x.ObjectCode.Equals(obj.ProjectCode) && x.ObjectType.Equals(EnumHelper<ObjectType>.GetDisplayValue(ObjectType.Project)));
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
                    //var suggesstion = GetSuggestionsProjectFile(obj.ProjectCode);
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
                    //    msg.Title = _stringLocalizer["PROJECT_MSG_ENTER_ATTR_EXP"];
                    //    return Json(msg);
                    //}
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
                        msg.Title = _stringLocalizer["PROJECT_MSG_SELECT_FORDER"];
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
                        var urlEnd = HttpUtility.UrlPathEncode("ftp://" + getRepository.Server + urlFile);
                        var urlEndPreventive = HttpUtility.UrlPathEncode("ftp://" + getRepository.Server + urlFilePreventive);
                        var result = FileExtensions.UploadFileToFtpServer(urlEnd, urlEndPreventive, fileBytes, getRepository.Account, getRepository.PassWord);
                        if (result.Status == WebExceptionStatus.ConnectFailure || result.Status == WebExceptionStatus.ProtocolError)
                        {
                            msg.Error = true;
                            msg.Title = _sharedResources["COM_CONNECT_FAILURE"];
                            return Json(msg);
                        }

                        if (result.Status == WebExceptionStatus.Success)
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
                    FileCode = string.Concat("PROJECT", Guid.NewGuid().ToString()),
                    ReposCode = reposCode,
                    CatCode = catCode,
                    ObjectCode = obj.ProjectCode,
                    ObjectType = EnumHelper<ProjectEnum>.GetDisplayValue(ProjectEnum.Project),
                    Path = path,
                    FolderId = folderId
                };
                _context.EDMSRepoCatFiles.Add(edmsReposCatFile);

                /// created Index lucene
                if (Array.IndexOf(LuceneExtension.fileMimetypes, mimeType) >= 0 && (Array.IndexOf(LuceneExtension.fileExt, extension.ToUpper()) >= 0))
                {
                    if (!extension.ToUpper().Equals(".ZIP") && !extension.ToUpper().Equals(".RAR"))
                    {
                        var moduleObj = (EDMSCatRepoSetting)_upload.GetPathByModule("DB_LUCENE_INDEX").Object;
                        var luceneCategory = _context.EDMSCategorys.FirstOrDefault(x => x.CatCode == moduleObj.CatCode);
                        LuceneExtension.IndexFile(edmsReposCatFile.FileCode, fileUpload, luceneCategory.PathServerPhysic);
                    }
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
                    CreatedBy = AppContext.UserName,
                    CreatedTime = DateTime.Now,
                    Url = urlFile,
                    MimeType = mimeType,
                    CloudFileId = fileId,
                };
                _context.EDMSFiles.Add(file);
                _context.SaveChanges();
                msg.Object = file;
                msg.Title = _sharedResources["COM_ADD_FILE_SUCCESS"];
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
        public JsonResult UpdateProjectFile(EDMSRepoCatFileModel obj)
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
                                var urlEnd = HttpUtility.UrlPathEncode("ftp://" + ftphost + ftpfilepath);
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
                                var urlEnd = HttpUtility.UrlPathEncode("ftp://" + oldRepo.Server + file.Url);
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
                                var urlEnd = HttpUtility.UrlPathEncode("ftp://" + newRepo.Server + path);
                                var urlEndPreventive = HttpUtility.UrlPathEncode("ftp://" + newRepo.Server + pathPreventive);
                                var result = FileExtensions.UploadFileToFtpServer(urlEnd, urlEndPreventive, fileData, newRepo.Account, newRepo.PassWord);
                                if (result.Status == WebExceptionStatus.ConnectFailure || result.Status == WebExceptionStatus.ProtocolError)
                                {
                                    msg.Error = true;
                                    msg.Title = _sharedResources["COM_CONNECT_FAILURE"];
                                    return Json(msg);
                                }

                                if (result.Status == WebExceptionStatus.Success)
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
                        msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["PROJECT_MSG_SELECT_FORDER"];
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["PROJECT_MSG_FILE_NOT_EXITS"];
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
        public JsonResult DeleteProjectFile(int id)
        {
            var msg = new JMessage { Error = false };
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
                        var urlEnd = HttpUtility.UrlPathEncode("ftp://" + getRepository.Server + file.Url);
                        FileExtensions.DeleteFileFtpServer(urlEnd, getRepository.Account, getRepository.PassWord);
                    }
                    else if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.GooglerDriver))
                    {
                        FileExtensions.DeleteFileGoogleServer(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", file.CloudFileId);
                    }
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_DELETE_FILE_SUCCESS"];// "Xóa thành công";
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
        public JsonResult GetProjectFile(int id)
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
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpGet]
        public EDMSRepoCatFile GetSuggestionsProjectFile(string projectCode)
        {
            var query = _context.EDMSRepoCatFiles.Where(x => x.ObjectCode == projectCode && x.ObjectType == EnumHelper<ProjectEnum>.GetDisplayValue(ProjectEnum.Project)).MaxBy(x => x.Id);
            return query;
        }

        //[NonAction]
        //public JMessage InsertProjectFileRaw(EDMSRepoCatFileModel obj, IFormFile fileUpload, bool fromServer = true)
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
        //                var suggesstion = GetSuggestionsProjectFile(obj.ProjectCode);
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
        //                FileCode = string.Concat("PROJECT", Guid.NewGuid().ToString()),
        //                ReposCode = reposCode,
        //                CatCode = catCode,
        //                ObjectCode = obj.ProjectCode,
        //                ObjectType = EnumHelper<ProjectEnum>.GetDisplayValue(ProjectEnum.Project),
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
        //public JMessage InsertProjectFileRaw(EDMSRepoCatFileModel obj, EDMSRepoCatFile item, EDMSRepository oldRes, bool fromServer = true)
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
        //                    FileCode = string.Concat("PROJECT", Guid.NewGuid().ToString()),
        //                    ReposCode = reposCode,
        //                    CatCode = catCode,
        //                    ObjectCode = obj.ProjectCode,
        //                    ObjectType = EnumHelper<ProjectEnum>.GetDisplayValue(ProjectEnum.Project),
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
        //                    FileCode = string.Concat("PROJECT", Guid.NewGuid().ToString()),
        //                    ReposCode = reposCode,
        //                    CatCode = catCode,
        //                    ObjectCode = obj.ProjectCode,
        //                    ObjectType = EnumHelper<ContractEnum>.GetDisplayValue(ContractEnum.Contract),
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
        //        DeleteProjectFileRaw(item.Id);
        //        if (fileUpload != null)
        //        {
        //            InsertProjectFileRaw(newItem, fileUpload);
        //        }
        //        else
        //        {
        //            InsertProjectFileRaw(newItem, item, oldRes);
        //        }
        //        _context.SaveChanges();
        //        msg.Title = "Cập nhật thành công";
        //        try
        //        {
        //            var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + oldRes.Server + file.Url);
        //            FileExtensions.DeleteFileFtpServer(urlEnd, oldRes.Account, oldRes.PassWord);
        //        }
        //        catch (Exception ex) { }
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
        //        DeleteProjectFileRaw(item.Id);
        //        if (fileUpload != null)
        //        {
        //            InsertProjectFileRaw(newItem, fileUpload, false);
        //        }
        //        else
        //        {
        //            InsertProjectFileRaw(newItem, item, oldRes, false);
        //        }
        //        _context.SaveChanges();
        //        msg.Title = "Cập nhật thành công";
        //        try
        //        {
        //            FileExtensions.DeleteFileGoogleServer(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", file.CloudFileId);
        //        }
        //        catch (Exception ex) { }
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
        //private void DeleteProjectFileRaw(int id)
        //{
        //    var data = _context.EDMSRepoCatFiles.FirstOrDefault(x => x.Id == id);
        //    _context.EDMSRepoCatFiles.Remove(data);

        //    var file = _context.EDMSFiles.FirstOrDefault(x => x.FileCode == data.FileCode);
        //    _context.EDMSFiles.Remove(file);

        //    LuceneExtension.DeleteIndexFile(file.FileCode, _hostingEnvironment.WebRootPath + "\\uploads\\luceneIndex");
        //}
        #endregion

        #region  Payment
        [HttpPost]
        public object GetTotalPayment([FromBody] JTableModelProject jTablePara)
        {
            if (string.IsNullOrEmpty(jTablePara.ProjectCode))
            {
                return new { totalReceipts = 0, totalExpense = 0, };
            }
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;

            var query = from a in _context.FundAccEntrys
                                            .Where(x => !x.IsDeleted
                                                        //&& x.IsPlan == false
                                                        && x.ObjType == "PROJECT"
                                                        && x.ObjCode == jTablePara.ProjectCode
                                                        //&& x.IsCompleted == true
                                                        //&& (x.StatusObject == "FUND_APPROVED")
                                                        )
                        join b in _context.FundCatReptExpss.Where(x => x.IsDeleted == false) on a.CatCode equals b.CatCode
                        orderby a.CreatedTime descending
                        where (((fromDate == null) || (fromDate != null && a.DeadLine >= fromDate))
                                && ((toDate == null) || (toDate != null && a.DeadLine <= toDate)))

                        select new
                        {
                            a.Id,
                            a.AetCode,
                            a.Title,
                            a.AetType,
                            AetTypeName = a.AetType == "Expense" ? "Chi" : "Thu",
                            a.CatCode,
                            b.CatName,
                            a.DeadLine,
                            a.Payer,
                            a.Receiptter,
                            a.Total,
                            a.Currency,
                            a.CreatedBy,
                            a.Status,
                            a.AetRelativeType,
                            a.AetDescription,
                            IsApprove = 0,
                            TimeAlive = "",
                            IsOutTime = 0,
                            IsEndActApproved = a.ListStatusObjectLog.GroupBy(x => x.ObjectRelative)
                                     .Select(g => new JsonLog
                                     {
                                         Code = g.OrderByDescending(x => x.CreatedTime).FirstOrDefault().Code,
                                         Name = g.OrderByDescending(x => x.CreatedTime).FirstOrDefault().Name,
                                         ObjectRelative = g.Key,
                                         ObjectType = g.OrderByDescending(x => x.CreatedTime).FirstOrDefault().ObjectType,
                                         CreatedBy = g.OrderByDescending(x => x.CreatedTime).FirstOrDefault().CreatedBy,
                                         CreatedTime = g.OrderByDescending(x => x.CreatedTime).FirstOrDefault().CreatedTime
                                     })
                                     .Any(x =>
                                         x.ObjectType == EnumHelper<TypeActivity>.GetDisplayValue(TypeActivity.EndAct)
                                         && x.Code == "STATUS_ACTIVITY_END")
                        };
            //var isVND = true;
            //foreach (var item in query)
            //{
            //    if (item.Currency != "VND")
            //    {
            //        isVND = false;
            //    }
            //}

            decimal totalReceipt = query.Where(x => x.AetType == "Receipt").Sum(x =>
                x.Currency == "VND"
                    ? x.Total
                    : x.Total * (1 * GetRate(x.Currency)));
            decimal totalExpense = query.Where(x => x.AetType == "Expense").Sum(x =>
                x.Currency == "VND"
                    ? x.Total
                    : x.Total * (1 * GetRate(x.Currency)));
            decimal totalReceiptApproved = query
                .Where(x => x.AetType == "Receipt" && x.IsEndActApproved)
                .Sum(x =>
                    x.Currency == "VND"
                        ? x.Total
                        : x.Total * (1 * GetRate(x.Currency)));
            decimal totalExpenseApproved = query
                .Where(x => x.AetType == "Expense" && x.IsEndActApproved)
                .Sum(x =>
                    x.Currency == "VND"
                        ? x.Total
                        : x.Total * (1 * GetRate(x.Currency)));
            var result = new FuncAccEntryCountModel
            {
                TotalReceipt = totalReceipt,
                TotalExpense = totalExpense,
                TotalSurplus = totalReceipt - totalExpense,
                TotalReceiptApproved = totalReceiptApproved,
                TotalExpenseApproved = totalExpenseApproved,
                TotalSurplusApproved = totalReceiptApproved - totalExpenseApproved,
                IsVnd = true
            };
            return Json(result);
        }

        private decimal GetRate(string currency)
        {
            var rateExist = _context.FundExchagRates.Any(z =>
                z.Currency != null && z.IsDeleted == false && z.Currency.Equals(currency));
            if (rateExist)
            {
                return _context.FundExchagRates.FirstOrDefault(z =>
                    z.Currency != null && z.IsDeleted == false && z.Currency.Equals(currency)).Rate;
            }

            return 1;
        }

        [HttpPost]
        public object JTableProjectTabPayment([FromBody] JTableModelProject jTablePara)
        {
            if (string.IsNullOrEmpty(jTablePara.ProjectCode))
            {
                return JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "Id", "AetCode", "Title", "AetType", "AetDescription", "Total", "Payer", "Receiptter", "Currency", "IsPlan", "Status", "CatName", "DeadLine");
            }
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;

            var query = (from a in _context.FundAccEntrys
                                            .Where(x => !x.IsDeleted
                                            //&& x.IsPlan == false
                                                        && x.ObjType == "PROJECT"
                                                        && x.ObjCode == jTablePara.ProjectCode
                                                        )
                         join b in _context.FundCatReptExpss.Where(x => x.IsDeleted == false) on a.CatCode equals b.CatCode
                         join c in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals("STATUS_FUND")) on a.StatusObject equals c.CodeSet into c1
                         from c in c1.DefaultIfEmpty()
                         orderby a.CreatedTime descending
                         where (((fromDate == null) || (fromDate != null && a.DeadLine >= fromDate))
                         && ((toDate == null) || (toDate != null && a.DeadLine <= toDate)))
                         select new ViewAccEntry
                         {
                             Id = a.Id,
                             AetCode = a.AetCode,
                             Title = a.Title,
                             AetType = a.AetType,
                             AetTypeName = a.AetType == "Expense" ? "Chi" : "Thu",
                             CatCode = a.CatCode,
                             CatName = b.CatName,
                             DeadLine = a.DeadLine,
                             Payer = a.Payer,
                             Receiptter = a.Receiptter,
                             Total = a.Total,
                             Currency = a.Currency,
                             CreatedBy = a.CreatedBy,
                             SCreatedTime = a.CreatedTime.HasValue ? a.CreatedTime.Value.ToString("dd/MM/yyyy") : "",
                             Status = a.StatusObjectLog,
                             AetRelativeType = a.AetRelativeType,
                             AetDescription = a.AetDescription,
                             IsApprove = 0,
                             TimeAlive = "",
                             IsOutTime = 0,
                             SLastLog = JsonConvert.SerializeObject(a.ListStatusObjectLog.LastOrDefault())
                         }).ToList();
            int count = query.Count();
            var data = query.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length);
            var jdata = JTableHelper.JObjectTable(data.ToList(), jTablePara.Draw, count, "Id", "AetCode", "Title",
                "AetType", "AetDescription", "Total", "Payer", "Receiptter", "Currency", "IsPlan", "Status", "CatName",
                "DeadLine", "IsApprove", "TimeAlive", "IsOutTime", "StatusObject", "SLastLog");

            return Json(jdata);

        }


        [HttpPost]
        [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
        [RequestSizeLimit(long.MaxValue)]
        public JsonResult InsertFilePayment(EDMSRepoCatFileModel obj, IFormFile fileUpload)
        {
            var msg = new JMessage { Error = false, Title = "" };
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
                var moduleObj = (EDMSCatRepoSetting)_upload.GetPathByModule("PROJECT_PAYMENT").Object;
                if (moduleObj != null)
                {
                    reposCode = moduleObj.ReposCode;
                    path = moduleObj.Path;
                    folderId = moduleObj.FolderId;
                    catCode = moduleObj.CatCode;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["COM_MSG_PLS_SETUP_FOLDER_DEFAULT"];
                    return Json(msg);
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
                        var urlEnd = HttpUtility.UrlPathEncode("ftp://" + getRepository.Server + urlFile);
                        var urlEndPreventive = HttpUtility.UrlPathEncode("ftp://" + getRepository.Server + urlFilePreventive);
                        var result = FileExtensions.UploadFileToFtpServer(urlEnd, urlEndPreventive, fileBytes, getRepository.Account, getRepository.PassWord);
                        if (result.Status == WebExceptionStatus.ConnectFailure || result.Status == WebExceptionStatus.ProtocolError)
                        {
                            msg.Error = true;
                            msg.Title = _sharedResources["COM_CONNECT_FAILURE"];
                            return Json(msg);
                        }

                        if (result.Status == WebExceptionStatus.Success)
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
                    FileCode = string.Concat("PROJECT", Guid.NewGuid().ToString()),
                    ReposCode = reposCode,
                    CatCode = catCode,
                    //ObjectCode = obj.ProjectCode,
                    //ObjectType = EnumHelper<ProjectEnum>.GetDisplayValue(ProjectEnum.Project),
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
                    CreatedBy = AppContext.UserName,
                    CreatedTime = DateTime.Now,
                    Url = urlFile,
                    MimeType = mimeType,
                    CloudFileId = fileId,
                };
                _context.EDMSFiles.Add(file);
                _context.SaveChanges();
                msg.Object = file;
                msg.Title = _sharedResources["COM_ADD_FILE_SUCCESS"];
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        #endregion

        #region note
        public class EDMSProjectTabNote
        {
            public int? Id { get; set; }
            public string ProjectCode { get; set; }
            public string Title { get; set; }
            public string Note { get; set; }
        }
        [HttpPost]
        public object JTableProjectNote([FromBody] JTableModelProject jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            if (jTablePara.ProjectCode == null)
            {
                var list = new List<object>();
                return JTableHelper.JObjectTable(list, jTablePara.Draw, 0, "Id", "Title", "Note", "Name", "CreatedBy", "CreatedTime");
            }
            var query = from a in _context.ProjectNotes
                        join b in _context.Users on a.CreatedBy equals b.UserName into b1
                        from b in b1.DefaultIfEmpty()
                        where !a.IsDeleted
                        && (string.IsNullOrEmpty(jTablePara.Tags) || (a.Tags.ToLower().Contains(jTablePara.Tags.ToLower())))
                        && (string.IsNullOrEmpty(jTablePara.Title) || a.Title.ToLower().Contains(jTablePara.Title.ToLower()))
                        && (a.ProjectCode == jTablePara.ProjectCode)
                        select new
                        {
                            a.Id,
                            a.Title,
                            a.Note,
                            Name = b != null ? string.Join(" ", b.GivenName) : null,
                            a.CreatedBy,
                            a.CreatedTime
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "Title", "Note", "Name", "CreatedBy", "CreatedTime");
            return Json(jdata);
        }

        [HttpPost]
        public JsonResult InsertProjectTabNote([FromBody] EDMSProjectTabNote obj)
        {
            var msg = new JMessage { Error = false };
            try
            {
                var project = _context.Projects.FirstOrDefault(x => x.ProjectCode == obj.ProjectCode);
                var data = new ProjectNote
                {
                    ProjectCode = project.ProjectCode,
                    Title = obj.Title,
                    Note = obj.Note,
                    ProjectVersion = project.Version,
                    CreatedBy = AppContext.UserName,
                    CreatedTime = DateTime.Now
                };
                _context.ProjectNotes.Add(data);
                _context.SaveChanges();
                msg.Title = String.Format(_stringLocalizer["Thêm sự kiện thành công"]); //PROJECT_MSG_ADD_NOTE_PROJECT
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["Lỗi khi thêm sự kiện"]);
                msg.Object = ex;
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateProjectTabNote([FromBody] EDMSProjectTabNote obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.ProjectNotes.FirstOrDefault(x => x.Id == obj.Id);
                data.Title = obj.Title;
                data.Note = obj.Note;
                _context.ProjectNotes.Update(data);
                _context.SaveChanges();
                msg.Title = String.Format(_stringLocalizer["Cập nhật sự kiện thành công"]);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["Lỗi khi cập nhật sự kiện"]);
                msg.Object = ex;
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult DeleteprojectTabNote(int id)
        {
            var msg = new JMessage();
            try
            {
                var data = _context.ProjectNotes.FirstOrDefault(x => x.Id == id);
                data.IsDeleted = true;
                _context.ProjectNotes.Update(data);
                _context.SaveChanges();
                msg.Error = false;
                msg.Title = String.Format(_stringLocalizer["Xóa sự kiện thành công"]);
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["Lỗi khi xóa sự kiện"]);
                msg.Object = ex;
                return Json(msg);
            }

        }

        [HttpGet]
        public JsonResult GetNote(int id)
        {
            var data = _context.ProjectNotes.FirstOrDefault(x => x.Id == id);
            return Json(data);
        }
        #endregion

        #region Appointment
        public class EdmsProjectTabAppointment
        {
            public int? Id { get; set; }
            public string ProjectCode { get; set; }
            public string Title { get; set; }
            public string ToDate { get; set; }
            public string FromDate { get; set; }
            public string Location { get; set; }
            public string RepeatType { get; set; }
            public string Note { get; set; }
        }
        [AllowAnonymous]
        [HttpPost]
        public object JTableProjectAppointment([FromBody] JTableModelProject jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            if (jTablePara.ProjectCode == null)
            {
                var list = new List<object>();
                return JTableHelper.JObjectTable(list, jTablePara.Draw, 0, "Id", "Title", "ToDate", "FromDate", "Location", "RepeatType", "Note");
            }
            var query = from a in _context.ProjectAppointments
                        join b in _context.Users on a.CreatedBy equals b.UserName into b1
                        from b in b1.DefaultIfEmpty()
                        where !a.IsDeleted
                        && (string.IsNullOrEmpty(jTablePara.Tags) || (a.Tags.ToLower().Contains(jTablePara.Tags.ToLower())))
                        && (string.IsNullOrEmpty(jTablePara.Title) || a.Title.ToLower().Contains(jTablePara.Title.ToLower()))
                        && (a.ProjectCode == jTablePara.ProjectCode)
                        select new
                        {
                            a.Id,
                            a.Title,
                            a.Note,
                            a.FromDate,
                            a.ToDate,
                            a.Location,
                            a.RepeatType,
                            Name = b != null ? string.Join(" ", b.GivenName) : null,
                            a.CreatedBy,
                            a.CreatedTime
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "Title", "ToDate", "FromDate", "Location", "RepeatType", "Note");
            return Json(jdata);
        }

        [AllowAnonymous]
        [HttpPost]
        public JsonResult InsertProjectTabAppointment([FromBody] EdmsProjectTabAppointment obj)
        {
            var msg = new JMessage { Error = false };
            try
            {
                var project = _context.Projects.FirstOrDefault(x => x.ProjectCode == obj.ProjectCode);
                var fromDate = !string.IsNullOrEmpty(obj.FromDate) ? DateTime.ParseExact(obj.FromDate, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture) : (DateTime?)null;
                var toDate = !string.IsNullOrEmpty(obj.ToDate) ? DateTime.ParseExact(obj.ToDate, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture) : (DateTime?)null;
                var data = new ProjectAppointment
                {
                    ProjectCode = project.ProjectCode,
                    Title = obj.Title,
                    //Tags = obj.Tags,
                    FromDate = fromDate,
                    ToDate = toDate,
                    Location = obj.Location,
                    RepeatType = obj.RepeatType,
                    Note = obj.Note,
                    ProjectVersion = project.Version,
                    CreatedBy = AppContext.UserName,
                    CreatedTime = DateTime.Now,
                    IsDeleted = false
                };
                _context.ProjectAppointments.Add(data);
                _context.SaveChanges();
                msg.Title = String.Format(_stringLocalizer["Thêm sự kiện thành công"]);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["Lỗi khi thêm sự kiện"]);
                msg.Object = ex;
            }
            return Json(msg);
        }

        [AllowAnonymous]
        [HttpPost]
        public JsonResult UpdateProjectTabAppointment([FromBody] EdmsProjectTabAppointment obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.ProjectAppointments.FirstOrDefault(x => x.Id == obj.Id);
                var fromDate = !string.IsNullOrEmpty(obj.FromDate) ? DateTime.ParseExact(obj.FromDate, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture) : (DateTime?)null;
                var toDate = !string.IsNullOrEmpty(obj.ToDate) ? DateTime.ParseExact(obj.ToDate, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture) : (DateTime?)null;
                if (data != null)
                {
                    data.Title = obj.Title;
                    data.ToDate = toDate;
                    data.FromDate = fromDate;
                    data.Location = obj.Location;
                    data.RepeatType = obj.RepeatType;
                    data.Note = obj.Note;
                    data.UpdatedBy = AppContext.UserName;
                    data.UpdatedTime = DateTime.Now;
                    _context.ProjectAppointments.Update(data);
                }
                _context.SaveChanges();
                msg.Title = String.Format(_stringLocalizer["Cập nhật sự kiện thành công"]);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["Lỗi khi cập nhật sự kiện"]);
                msg.Object = ex;
            }
            return Json(msg);
        }

        [AllowAnonymous]
        [HttpPost]
        public JsonResult DeleteProjectTabAppointment(int id)
        {
            var msg = new JMessage();
            try
            {
                var data = _context.ProjectAppointments.FirstOrDefault(x => x.Id == id);
                if (data != null)
                {
                    data.IsDeleted = true;
                    data.DeletedBy = AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    _context.ProjectAppointments.Update(data);
                }
                _context.SaveChanges();
                msg.Error = false;
                msg.Title = String.Format(_stringLocalizer["Xóa sự kiện thành công"]);
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["Lỗi khi xóa sự kiện"]);
                msg.Object = ex;
                return Json(msg);
            }

        }

        [AllowAnonymous]
        [HttpGet]
        public JsonResult GetAppointment(int id)
        {
            var data = _context.ProjectAppointments.FirstOrDefault(x => x.Id == id);
            return Json(data);
        }
        [AllowAnonymous]
        [HttpGet]
        public JsonResult GetAllEvent(string projectCode)
        {
            var session = HttpContext.GetSessionUser();
            var listData = new List<Object>();
            var today = DateTime.Now.Date;
            var events = (from a in _context.ProjectAppointments.Where(x => !x.IsDeleted)
                              //join b in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Status equals b.CodeSet
                              //join c in _context.ZoomManages.Where(x => !x.IsDeleted) on a.MeetingId equals c.Id into c1
                              //from c in c1.DefaultIfEmpty()
                          where a.ProjectCode == projectCode && a.FromDate.HasValue && a.ToDate.HasValue
                          select new
                          {
                              a.Id,
                              a.Title,
                              a.Note,
                              a.FromDate,
                              a.ToDate,
                              a.Location,
                              a.RepeatType,
                              //Color = a.FromDate.Value.Date >= today ? a.BackgroundColor : "#f1f1f1",
                              IsInFuture = a.FromDate.Value.Date >= today,
                              //Status = b.ValueSet,
                              //StatusCode = a.Status,
                              //MeetingId = c != null ? c.ZoomId : "",
                              //a.AccountZoom,
                              //a.JsonData,
                          }).OrderByDescending(x => x.ToDate);

            foreach (var item in events)
            {
                var className = item.IsInFuture ? "fc-event-event-custom" : "fc-black";
                var allowJoin = true;

                var obj = new
                {
                    item.Id,
                    item.Title,
                    item.FromDate.Value.Date,
                    sStartTime = item.FromDate.Value.ToString("HH:mm"),
                    sEndTime = item.ToDate.Value.ToString("HH:mm"),
                    item.Note,
                    item.FromDate,
                    item.ToDate,
                    item.Location,
                    item.RepeatType,
                    IsAllData = session.IsAllData || session.RoleCode.Equals("GIAMDOC"),
                    ClassName = className,
                };

                listData.Add(obj);
            }

            return Json(listData);
        }
        #endregion

        #region CardJob
        [HttpPost]
        public object JTableCardJob([FromBody] JTableModelProject jtablePara)
        {
            int intBegin = (jtablePara.CurrentPage - 1) * jtablePara.Length;
            if (jtablePara.ProjectCode == null)
            {
                var list = new List<object>();
                return JTableHelper.JObjectTable(list, jtablePara.Draw, 0, "Id", "CardCode", "Project", "CardName");
            }
            var query = from a in _context.CardMappings
                        join b in _context.WORKOSCards on a.CardCode equals b.CardCode
                        where b.IsDeleted == false && a.ProjectCode.Equals(jtablePara.ProjectCode)
                        select b;
            int count = query.Count();
            var data = query.OrderUsingSortExpression(jtablePara.QueryOrderBy).Skip(intBegin).Take(jtablePara.Length).Select(x => new
            {
                x.CardID,
                x.CardCode,
                x.CardName,
                x.BeginTime,
                x.EndTime,
                Status = _context.CommonSettings.FirstOrDefault(y => y.CodeSet == x.Status).ValueSet ?? "",
                x.Completed,
                x.Cost,
                Quantitative = string.Concat(x.Quantitative, _context.CommonSettings.FirstOrDefault(y => y.CodeSet == x.Unit).ValueSet ?? ""),
                ListName = _context.WORKOSLists.FirstOrDefault(y => y.ListCode == x.ListCode && y.IsDeleted == false).ListName ?? "",
                BoardName = _context.WORKOSBoards.FirstOrDefault(y => y.BoardCode == (_context.WORKOSLists.FirstOrDefault(z => z.ListCode == x.ListCode && z.IsDeleted == false).BoardCode ?? "")).BoardName ?? ""
            }).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jtablePara.Draw, count, "CardID", "CardCode", "CardName", "BeginTime", "EndTime", "Status", "Completed", "Cost", "Quantitative", "ListName", "BoardName");
            return Json(jdata);
        }

        //[HttpPost]
        //public JsonResult AddCardRelative([FromBody] dynamic data)
        //{
        //    var msg = new JMessage() { Error = false, Title = "" };
        //    try
        //    {
        //        int projectId = data.ProjectId.Value != null ? Convert.ToInt32(data.ProjectId.Value) : 0;
        //        string cardCode = data.CardCode.Value;
        //        string projectCode = _context.Projects.FirstOrDefault(x => x.Id == projectId).ProjectCode;
        //        if (_context.CardForWObjs.Where(x => x.ObjCode.Equals(projectCode) && x.CatObjCode.Equals("PROJECT") && x.CardCode.Equals(cardCode) && x.IsDeleted == false).Count() > 0)
        //        {
        //            msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_PROJECT_EXIST_PROJECT"));
        //            msg.Error = true;
        //            return Json(msg);
        //        }
        //        var card = _context.WORKOSCards.FirstOrDefault(x => x.CardCode == cardCode);
        //        var list = _context.WORKOSLists.FirstOrDefault(x => x.ListCode == card.ListCode);
        //        var board = _context.WORKOSBoards.FirstOrDefault(x => x.BoardCode == list.BoardCode);
        //        var obj = new CardMapping
        //        {
        //            BoardCode = board.BoardCode,
        //            ListCode = card.ListCode,
        //            CardCode = cardCode,
        //            ProjectCode = projectCode,
        //            Relative = _context.CommonSettings.FirstOrDefault(x => x.Group == EnumHelper<CardEnum>.GetDisplayValue(CardEnum.ObjRelative))?.CodeSet,
        //            CreatedBy = ESEIM.AppContext.UserName,
        //            CreatedTime = DateTime.Now
        //        };
        //        _context.CardMappings.Add(obj);
        //        _context.SaveChanges();
        //        msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_PROJECT_ADD"));
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Object = ex.Message;
        //        msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_PROJECT_ERRO"));
        //    }
        //    return Json(msg);
        //}

        //[HttpPost]
        //public JsonResult GetTeams()
        //{
        //    var data = _context.WORKOSTeams.Where(x => x.Flag == false).Select(x => new { Code = x.TeamCode, Name = x.TeamCode }).ToList();
        //    return Json(data);
        //}

        //[HttpPost]
        //public JsonResult GetBoards(string TeamCode)
        //{
        //    var data = _context.WORKOSBoards.Where(x => x.TeamCode.Equals(TeamCode)).Select(x => new { Code = x.BoardCode, Name = x.BoardName }).ToList();
        //    return Json(data);
        //}

        //[HttpPost]
        //public JsonResult GetLists(string BoardCode)
        //{
        //    var data = _context.WORKOSLists.Where(x => x.BoardCode.Equals(BoardCode)).Select(x => new { Code = x.ListCode, Name = x.ListName }).ToList();
        //    return Json(data);
        //}

        //[HttpPost]
        //public JsonResult GetCards(string ListCode)
        //{
        //    var data = _context.WORKOSCards.Where(x => x.ListCode.Equals(ListCode)).Select(x => new { Code = x.CardCode, Name = x.CardName }).ToList();
        //    return Json(data);
        //}



        //[HttpPost]
        //public JsonResult GetObjectRelative(string boardCode)
        //{
        //    var data = _context.ProjectBoards.Where(x => x.BoardCode.Equals(boardCode)).AsNoTracking().ToList();
        //    return Json(data);
        //}

        //[HttpPost]
        //public JsonResult SetObjectRelative([FromBody]dynamic data)
        //{
        //    var msg = new JMessage() { Error = true };
        //    try
        //    {
        //        string boardCode = data.boardCode.Value;
        //        var currentData = _context.ProjectBoards.Where(x => x.BoardCode.Equals(boardCode)).ToList();
        //        //for (int i = 0; i < currentData.Count; i++)
        //        //{
        //        //    _context.ProjectBoards.Update(currentData[i]);
        //        //}
        //        _context.ProjectBoards.RemoveRange(currentData);
        //        for (int i = 0; i < data.listDependency.Count; i++)
        //        {
        //            string ObjCode = data.listDependency[i].ObjCode.Value;
        //            //string Dependency = data.listDependency[i].Dependency.Value;
        //            //string Relative = data.listDependency[i].Relative.Value;
        //            var cardForObj = new ProjectBoard()
        //            {
        //                BoardCode = boardCode,
        //                ProjectCode = ObjCode,
        //            };
        //            _context.ProjectBoards.Add(cardForObj);
        //        }

        //        _context.SaveChanges();
        //        msg.Error = false;
        //        msg.Title = String.Format(_stringLocalizer["COM_MSG_UPDATE_SUCCESS"), _stringLocalizer[""));//"Cập nhật thành công";
        //        return Json(msg);
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Object = ex;
        //        msg.Title = String.Format(_stringLocalizer["COM_MSG_UPDATE_FAILED"), _stringLocalizer[""));//"Có lỗi xảy ra!";
        //        return Json(msg);
        //    }
        //}

        //[HttpPost]
        //public JsonResult DeleteCardDependency(int id)
        //{
        //    var msg = new JMessage() { Error = true };
        //    try
        //    {
        //        var data = _context.ProjectBoards.FirstOrDefault(x => x.Id == id);
        //        _context.ProjectBoards.Remove(data);
        //        _context.SaveChanges();

        //        msg.Title = String.Format(_stringLocalizer["COM_MSG_DELETE_SUCCESS"), _stringLocalizer["")); //"Xóa thành công";
        //        msg.Error = false;
        //        return Json(msg);
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Title = String.Format(_stringLocalizer["COM_MSG_DELETE_FAIL"), _stringLocalizer["")); //"Có lỗi xảy ra!";
        //        msg.Object = ex;
        //        return Json(msg);
        //    }

        //}
        #endregion

        #region Team
        public class InsertProjectTeam : Team
        {
            public string ProjectCode { get; set; }
        }

        [HttpPost]
        public JsonResult GetAllTeam()
        {
            var data = _context.Teams.Where(x => x.IsDeleted == false && x.Status == "TEAM_ACTIVE").ToList();
            return Json(data);
        }
        [HttpPost]
        public JsonResult AddTeam([FromBody] InsertProjectTeam obj)
        {
            JMessage msg = new JMessage { Error = false };
            try
            {
                ProjectTeam data = new ProjectTeam
                {
                    ProjectCode = obj.ProjectCode,
                    TeamCode = obj.TeamCode
                };
                _context.ProjectTeams.Add(data);
                _context.SaveChanges();
                msg.Title = _sharedResources["COM_ADD_SUCCESS"];
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
        public JsonResult DeleteTeam([FromBody] InsertProjectTeam obj)
        {
            JMessage msg = new JMessage { Error = false };
            try
            {
                var data = _context.ProjectTeams.FirstOrDefault(x => x.TeamCode == obj.TeamCode && x.ProjectCode == obj.ProjectCode);
                _context.ProjectTeams.Remove(data);
                _context.SaveChanges();
                msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
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
        public JsonResult GetTeamInProject(int projectId)
        {
            var project = _context.Projects.FirstOrDefault(x => x.Id == projectId);
            if (project != null)
            {
                var query = from a in _context.ProjectTeams
                            join b in _context.Teams on a.TeamCode equals b.TeamCode into b1
                            from b2 in b1.DefaultIfEmpty()
                            where a.ProjectCode == project.ProjectCode
                            select new
                            {
                                a.TeamCode,
                                TeamName = (b2 != null ? b2.TeamName : "")
                            };
                var list = query.ToList();
                return Json(list);
            }

            return Json("");
        }
        #endregion

        #region Contract
        [HttpPost]
        public object JTableContract([FromBody] JTableModelProject jTablePara)
        {
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            decimal? totalContract = 0;
            if (!string.IsNullOrEmpty(jTablePara.ProjectCode))
            {
                var query = from a in _context.PoSaleHeaders
                            join c in _context.Customerss.Where(x => !x.IsDeleted) on a.CusCode equals c.CusCode
                            join b in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Currency equals b.CodeSet into b1
                            from b2 in b1.DefaultIfEmpty()
                            where a.IsDeleted == false
                            && a.PrjCode.Equals(jTablePara.ProjectCode)
                            && (string.IsNullOrEmpty(jTablePara.ContractCode) || (a.ContractCode.ToLower().Contains(jTablePara.ContractCode.ToLower())))
                            && (string.IsNullOrEmpty(jTablePara.ContractNo) || (a.ContractNo.ToLower().Contains(jTablePara.ContractNo.ToLower())))
                            && (string.IsNullOrEmpty(jTablePara.Title) || (a.Title.ToLower().Contains(jTablePara.Title.ToLower())))
                            select new
                            {
                                id = a.ContractHeaderID,
                                code = a.ContractCode,
                                no = a.ContractNo,
                                cusName = c.CusName,
                                title = a.Title,
                                effectiveDate = a.EffectiveDate,
                                budgetExcludeTax = a.BudgetExcludeTax,
                                currency = b2 != null ? b2.ValueSet : "",
                                budget = a.BudgetExcludeTax * a.ExchangeRate,
                            };

                if (query.Any())
                    totalContract = query.Sum(x => x.budget);

                var queryRs = from a in query
                              select new
                              {
                                  a.id,
                                  a.code,
                                  a.no,
                                  a.cusName,
                                  a.title,
                                  a.effectiveDate,
                                  a.budgetExcludeTax,
                                  a.budget,
                                  a.currency,
                                  totalContract
                              };

                int count = queryRs.Count();
                var data = queryRs.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length).AsNoTracking().ToList();
                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "id", "code", "no", "cusName", "title", "effectiveDate", "budgetExcludeTax", "budget", "currency", "totalContract");
                return Json(jdata);
            }
            else
            {
                var jdata = JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "id", "code", "no", "cusName", "title", "effectiveDate", "budgetExcludeTax", "budget", "currency", "totalContract");
                return Json(jdata);
            }
        }
        #endregion

        #region YC đặt hàng

        [HttpPost]
        public JsonResult GetContractPoBuyer()
        {
            var query = _context.PoBuyerHeaders.Where(x => !x.IsDeleted).Select(x => new { Code = x.PoSupCode, Name = x.PoTitle });
            return Json(query);
        }

        [HttpPost]
        public JsonResult GetContractSale()
        {
            var data = from a in _context.PoSaleHeaders.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.Title))
                       join b in _context.Customerss.Where(x => !x.IsDeleted) on a.CusCode equals b.CusCode
                       select a;
            var query = data.Select(x => new { Code = x.ContractCode, Name = x.Title });
            return Json(query);
        }

        [HttpGet]
        public object GetObjectRelative()
        {
            var data = _context.CommonSettings.Where(x => x.Group == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.Relative)).OrderBy(x => x.SettingID).Select(x => new { Code = x.CodeSet, Name = x.ValueSet, Icon = x.Logo });
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetRqImpProduct()
        {
            var query = _context.RequestImpProductHeaders.Where(x => !x.IsDeleted).Select(x => new { Code = x.ReqCode, Name = x.Title });
            return Json(query);
        }

        [HttpPost]
        public object JtableRequestImportProduct([FromBody] JTableModelProject jTablePara)
        {
            if (string.IsNullOrEmpty(jTablePara.ProjectCode))
            {
                return JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "id", "Code", "status", "icon", "duration", "Name", "budget", "currency", "signer", "cusCode", "cusName", "contractNo", "budgetExcludeTax", "contractDate", "sEndDate", "ExchangeRate");
            }
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = (from a in _context.MappingMains
                         join b in _context.RequestImpProductHeaders on a.ObjCode equals b.ReqCode
                         join c in _context.Customerss.Where(x => !x.IsDeleted) on b.CusCode equals c.CusCode
                         join d in _context.Users.Where(x => x.Active) on b.CreatedBy equals d.UserName into d1
                         from d2 in d1.DefaultIfEmpty()
                         where a.ObjRootCode == jTablePara.ProjectCode && a.ObjType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.RqPrice)
                         select new
                         {
                             a.Id,
                             a.ObjCode,
                             b.Title,
                             b.CusCode,
                             c.CusName,
                             CreatedBy = d2.GivenName,
                             b.CreatedTime,
                             a.ObjRelative,
                             a.ObjNote
                         }).Union(
                from a in _context.MappingMains.Where(x => x.ObjRootType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.RqPrice))
                join b in _context.RequestImpProductHeaders on a.ObjRootCode equals b.ReqCode
                join c in _context.Customerss.Where(x => !x.IsDeleted) on b.CusCode equals c.CusCode
                join d in _context.Users.Where(x => x.Active) on b.CreatedBy equals d.UserName into d1
                from d2 in d1.DefaultIfEmpty()
                where a.ObjCode == jTablePara.ProjectCode && a.ObjType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.Project)
                select new
                {
                    a.Id,
                    ObjCode = a.ObjRootCode,
                    b.Title,
                    b.CusCode,
                    c.CusName,
                    CreatedBy = d2.GivenName,
                    b.CreatedTime,
                    a.ObjRelative,
                    a.ObjNote
                });
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "ObjCode", "Title", "CusCode", "CusName", "CreatedBy", "CreatedTime", "ObjRelative", "ObjNote");
            return Json(jdata);
        }

        [HttpPost]
        public JsonResult InsertRequestImportProduct([FromBody] MappingMain obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var checkExist = _context.MappingMains.FirstOrDefault(x => x.ObjRootCode == obj.ObjRootCode && x.ObjType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.RqPrice) && x.ObjCode == obj.ObjCode);
                if (checkExist == null)
                {
                    obj.ObjType = EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.RqPrice);
                    obj.ObjRootType = EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.Project);
                    obj.CreatedBy = AppContext.UserName;
                    obj.CreatedTime = DateTime.Now;
                    _context.MappingMains.Add(obj);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["PROJECT_MSG_RQ_IMP_EXIST"];
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
        public JsonResult UpdateRequestImportProduct([FromBody] MappingMain obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var checkExist = _context.MappingMains.FirstOrDefault(x => x.Id == obj.Id);
                if (checkExist != null)
                {
                    checkExist.ObjRelative = obj.ObjRelative;
                    checkExist.ObjNote = obj.ObjNote;
                    checkExist.UpdatedBy = AppContext.UserName;
                    checkExist.UpdatedTime = DateTime.Now;
                    _context.MappingMains.Update(checkExist);
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
        public JsonResult DeleteRequestImportProduct(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.MappingMains.FirstOrDefault(x => x.Id == id);
                if (data != null)
                {
                    _context.MappingMains.Remove(data);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
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
        #endregion

        #region Contract PO Buyer
        [HttpPost]
        public object JtableContractPoBuyer([FromBody] JTableModelProject jTablePara)
        {
            if (string.IsNullOrEmpty(jTablePara.ProjectCode))
            {
                return JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "id", "Code", "status", "icon", "duration", "Name", "budget", "currency", "signer", "cusCode", "cusName", "contractNo", "budgetExcludeTax", "contractDate", "sEndDate", "ExchangeRate");
            }
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = (from a in _context.MappingMains
                         join b in _context.PoBuyerHeaderPayments on a.ObjCode equals b.PoSupCode
                         join c in _context.Suppliers.Where(x => !x.IsDeleted) on b.SupCode equals c.SupCode
                         where a.ObjRootCode == jTablePara.ProjectCode && a.ObjType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.PoBuy)
                         select new
                         {
                             a.Id,
                             a.ObjCode,
                             b.Type,
                             b.OrderBy,
                             b.Consigner,
                             c.SupName,
                             b.CreatedTime,
                             a.ObjRelative,
                             a.ObjNote
                         }).Union(
                from a in _context.MappingMains.Where(x => x.ObjRootType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.PoBuy))
                join b in _context.PoBuyerHeaderPayments on a.ObjRootCode equals b.PoSupCode
                join c in _context.Suppliers.Where(x => !x.IsDeleted) on b.SupCode equals c.SupCode
                where a.ObjCode == jTablePara.ProjectCode && a.ObjType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.Project)
                select new
                {
                    a.Id,
                    ObjCode = a.ObjRootCode,
                    b.Type,
                    b.OrderBy,
                    b.Consigner,
                    c.SupName,
                    b.CreatedTime,
                    a.ObjRelative,
                    a.ObjNote
                });
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "ObjCode", "Type", "OrderBy", "Consigner", "SupName", "CreatedTime", "ObjRelative", "ObjNote");
            return Json(jdata);
        }

        [HttpPost]
        public JsonResult InsertContractPoBuyer([FromBody] MappingMain obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var checkExist = _context.MappingMains.FirstOrDefault(x => x.ObjRootCode == obj.ObjRootCode && x.ObjType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.PoBuy) && x.ObjCode == obj.ObjCode);
                if (checkExist == null)
                {
                    obj.ObjType = EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.PoBuy);
                    obj.ObjRootType = EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.Project);
                    obj.CreatedBy = AppContext.UserName;
                    obj.CreatedTime = DateTime.Now;
                    _context.MappingMains.Add(obj);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["PROJECT_MSG_CONTRACT_EXIST"];
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
        public JsonResult UpdateContractPoBuyer([FromBody] MappingMain obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var checkExist = _context.MappingMains.FirstOrDefault(x => x.Id == obj.Id);
                if (checkExist != null)
                {
                    checkExist.ObjRelative = obj.ObjRelative;
                    checkExist.ObjNote = obj.ObjNote;
                    checkExist.UpdatedBy = AppContext.UserName;
                    checkExist.UpdatedTime = DateTime.Now;
                    _context.MappingMains.Update(checkExist);
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
        public JsonResult DeleteContractPoBuyer(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.MappingMains.FirstOrDefault(x => x.Id == id);
                if (data != null)
                {
                    _context.MappingMains.Remove(data);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
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
        #endregion

        #region Contract Sale
        [HttpPost]
        public object JtableContractSale([FromBody] JTableModelProject jTablePara)
        {
            if (string.IsNullOrEmpty(jTablePara.ProjectCode))
            {
                return JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "id", "Code", "status", "icon", "duration", "Name", "budget", "currency", "signer", "cusCode", "cusName", "contractNo", "budgetExcludeTax", "contractDate", "sEndDate", "ExchangeRate");
            }
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = (from a in _context.MappingMains
                         join b in _context.PoSaleHeaders on a.ObjCode equals b.ContractCode
                         join c in _context.Customerss.Where(x => !x.IsDeleted) on b.CusCode equals c.CusCode
                         where a.ObjRootCode == jTablePara.ProjectCode && a.ObjType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.PoSale)
                         select new
                         {
                             a.Id,
                             a.ObjCode,
                             c.CusName,
                             b.ContractNo,
                             b.EndDate,
                             b.Title,
                             b.Budget,
                             b.BudgetExcludeTax,
                             b.ExchangeRate,
                             a.ObjRelative,
                             a.ObjNote
                         }).Union(
                from a in _context.MappingMains.Where(x => x.ObjRootType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.PoSale))
                join b in _context.PoSaleHeaders on a.ObjRootCode equals b.ContractCode
                join c in _context.Customerss.Where(x => !x.IsDeleted) on b.CusCode equals c.CusCode
                where a.ObjCode == jTablePara.ProjectCode && a.ObjType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.Project)
                select new
                {
                    a.Id,
                    ObjCode = a.ObjRootCode,
                    c.CusName,
                    b.ContractNo,
                    b.EndDate,
                    b.Title,
                    b.Budget,
                    b.BudgetExcludeTax,
                    b.ExchangeRate,
                    a.ObjRelative,
                    a.ObjNote
                });
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "ObjCode", "CusName", "ContractNo", "EndDate", "Title", "Budget", "BudgetExcludeTax", "ExchangeRate", "ObjRelative", "ObjNote");
            return Json(jdata);
        }

        [HttpPost]
        public JsonResult InsertContractSale([FromBody] MappingMain obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var checkExist = _context.MappingMains.FirstOrDefault(x => x.ObjRootCode == obj.ObjRootCode && x.ObjType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.PoSale) && x.ObjCode == obj.ObjCode);
                if (checkExist == null)
                {
                    obj.ObjType = EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.PoSale);
                    obj.ObjRootType = EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.Project);
                    obj.CreatedBy = AppContext.UserName;
                    obj.CreatedTime = DateTime.Now;
                    _context.MappingMains.Add(obj);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["PROJECT_MSG_CONTRACT_PO_EXIST"];
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
        public JsonResult UpdateContractSale([FromBody] MappingMain obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var checkExist = _context.MappingMains.FirstOrDefault(x => x.Id == obj.Id);
                if (checkExist != null)
                {
                    checkExist.ObjRelative = obj.ObjRelative;
                    checkExist.ObjNote = obj.ObjNote;
                    checkExist.UpdatedBy = AppContext.UserName;
                    checkExist.UpdatedTime = DateTime.Now;
                    _context.MappingMains.Update(checkExist);
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
        public JsonResult DeleteContractSale(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.MappingMains.FirstOrDefault(x => x.Id == id);
                if (data != null)
                {
                    _context.MappingMains.Remove(data);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
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
        #endregion

        #region Đặt hàng NCC
        [HttpPost]
        public object JTableTabContractPo([FromBody] JTableModelProject jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.PoBuyerHeaderPayments
                       .Where(x => !x.IsDeleted &&
                               x.ProjectCode.Equals(jTablePara.ProjectCode) &&
                             (string.IsNullOrEmpty(jTablePara.Title) || (x.PoSupCode.ToLower().Contains(jTablePara.Title.ToLower())))
                             )
                        join b in _context.Customerss.Where(x => !x.IsDeleted) on a.BuyerCode equals b.CusCode
                        join c in _context.Suppliers.Where(x => !x.IsDeleted) on a.SupCode equals c.SupCode
                        join d in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Status equals d.CodeSet into d1
                        from d2 in d1.DefaultIfEmpty()
                        select new
                        {
                            a.Id,
                            a.PoSupCode,
                            a.PoTitle,
                            a.OrderBy,
                            a.Consigner,
                            a.Mobile,
                            a.Buyer,
                            BuyerCode = a.BuyerCode + " - " + b.CusName,
                            a.SupCode,
                            c.SupName,
                            a.CreatedBy,
                            a.CreatedTime,
                            Status = d2.ValueSet,
                            Icon = d2.Logo,
                            a.Type,
                            a.TotalAmount,
                            a.TotalPayment,
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "PoSupCode", "PoTitle", "OrderBy", "Consigner", "Mobile", "BuyerCode", "SupCode", "SupName", "CreatedTime", "Status", "Icon", "Type", "TotalAmount", "TotalPayment", "ContractNo", "Title");
            return Json(jdata);
        }
        #endregion

        #region Schedule project
        public JsonResult ScheduleContractProject(int month, int year)
        {
            var session = HttpContext.GetSessionUser();
            var msg = new JMessage();
            var lstCountProject = new List<CalendarProject>();
            var listDateInMonth = DateTimeExtensions.GetDates(year, month);
            var projects = from a in _context.Projects.Where(x => !x.FlagDeleted)
                           where (session.IsAllData
                            || (!session.IsAllData && session.IsBranch && session.RoleCode.Equals(EnumHelper<Role>.GetDisplayValue(Role.Giamdoc)) && session.ListUserOfBranch.Any(x => x == a.CreatedBy))
                            || (!session.IsAllData && !session.IsBranch && session.IsUser && session.UserName == a.CreatedBy))
                           select new
                           {
                               a.Status,
                               a.ProjectCode
                           };
            foreach (var item in listDateInMonth)
            {

                var countExpired = (from a in projects
                                    join b in _context.AttributeManagerGalaxys.Where(x => !x.IsDeleted && x.AttrCode.Equals("NGAY_HET_HAN")) on a.ProjectCode equals b.ObjCode
                                    where (!string.IsNullOrEmpty(b.AttrValue) && DateTime.ParseExact(b.AttrValue, "dd/MM/yyyy", CultureInfo.InvariantCulture).Date == item.Date)
                                    select new
                                    {
                                        a.ProjectCode
                                    }).DistinctBy(x => x.ProjectCode).Count();
                var countNextPay = (from a in projects
                                    join b in _context.AttributeManagerGalaxys.Where(x => !x.IsDeleted && x.AttrCode.Equals("NGAY_THANH_TOAN_TIEP_THEO")) on a.ProjectCode equals b.ObjCode
                                    where (!string.IsNullOrEmpty(b.AttrValue) && DateTime.ParseExact(b.AttrValue, "dd/MM/yyyy", CultureInfo.InvariantCulture).Date == item.Date)
                                    select new
                                    {
                                        a.ProjectCode
                                    }).DistinctBy(x => x.ProjectCode).Count();

                var countRenew = (from a in projects
                                  join b in _context.AttributeManagerGalaxys.Where(x => !x.IsDeleted && x.AttrCode.Equals("NGAY_GIA_HAN_TIEP_THEO")) on a.ProjectCode equals b.ObjCode
                                  where (!string.IsNullOrEmpty(b.AttrValue) && DateTime.ParseExact(b.AttrValue, "dd/MM/yyyy", CultureInfo.InvariantCulture).Date == item.Date)
                                  select new
                                  {
                                      a.ProjectCode
                                  }).DistinctBy(x => x.ProjectCode).Count();

                var calendar = new CalendarProject
                {
                    Date = item,
                    Expried = countExpired,
                    NextPay = countNextPay,
                    Renew = countRenew
                };
                lstCountProject.Add(calendar);
            }
            msg.Object = lstCountProject;
            return Json(msg);
        }

        [HttpPost]
        public JsonResult JTableCalendar([FromBody] CalendaProjecttModel jTablePara)
        {
            var session = HttpContext.GetSessionUser();
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            DateTime? toDate = !string.IsNullOrEmpty(jTablePara.Date) ? DateTime.ParseExact(jTablePara.Date, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            var attrCode = "";
            if (jTablePara.Value == 1)
            {
                attrCode = "NGAY_HET_HAN";
            }
            else if (jTablePara.Value == 2)
            {
                attrCode = "NGAY_THANH_TOAN_TIEP_THEO";
            }
            else
            {
                attrCode = "NGAY_GIA_HAN_TIEP_THEO";
            }

            var query = (from a in _context.Projects
                         join b in _context.Users on a.CreatedBy equals b.UserName
                         join c in _context.AttributeManagerGalaxys.Where(x => !x.IsDeleted && x.AttrCode == attrCode) on a.ProjectCode equals c.ObjCode
                         where (!a.FlagDeleted) && toDate.Value.ToString("dd/MM/yyyy") == c.AttrValue
                         //Điều kiện phân quyền dữ liệu
                         && (session.IsAllData
                         || (!session.IsAllData && session.IsBranch && session.RoleCode.Equals(EnumHelper<Role>.GetDisplayValue(Role.Giamdoc)) && session.ListUserOfBranch.Any(x => x == a.CreatedBy))
                         || (!session.IsAllData && !session.IsBranch && session.IsUser && session.UserName == a.CreatedBy))
                         select a).OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).ToList();

            var count = (from a in _context.Projects
                         join c in _context.AttributeManagerGalaxys.Where(x => !x.IsDeleted && x.AttrCode == attrCode) on a.ProjectCode equals c.ObjCode
                         where (!a.FlagDeleted) && toDate.Value.ToString("dd/MM/yyyy") == c.AttrValue
                         //Điều kiện phân quyền dữ liệu
                         && (session.IsAllData
                         || (!session.IsAllData && session.IsBranch && session.RoleCode.Equals(EnumHelper<Role>.GetDisplayValue(Role.Giamdoc)) && session.ListUserOfBranch.Any(x => x == a.CreatedBy))
                         || (!session.IsAllData && !session.IsBranch && session.IsUser && session.UserName == a.CreatedBy))
                         select a).AsNoTracking().Count();
            var data = query.Select(x => new
            {
                x.Id,
                Code = x.ProjectCode,
                Name = x.ProjectTitle,
                Currency = _context.CommonSettings.FirstOrDefault(y => !y.IsDeleted && y.CodeSet == x.Currency)?.ValueSet,
                x.Budget,
                x.StartTime,
                Progress = _cardService.GetPercentJCObject("PROJECT", x.ProjectCode, session.IsAllData, session.IsBranch, session.IsUser, session.UserName, session.ListUserOfBranch != null ? string.Join(",", session.ListUserOfBranch) : "", session.UserId, !string.IsNullOrEmpty(session.DepartmentCode) ? session.DepartmentCode : "").Item1,
                x.EndTime,
                x.SetPriority,
                x.CustomerCode,
                Status = _context.CommonSettings.FirstOrDefault(y => y.CodeSet == x.Status && !y.IsDeleted)?.ValueSet,
                ExpirationDate = _context.AttributeManagerGalaxys.LastOrDefault(p => p.AttrCode.Equals("NGAY_HET_HAN") && p.ObjCode.Equals(x.ProjectCode)) != null ? _context.AttributeManagerGalaxys.LastOrDefault(p => p.AttrCode.Equals("NGAY_HET_HAN") && p.ObjCode.Equals(x.ProjectCode)).AttrValue : "",
                RenewalDate = _context.AttributeManagerGalaxys.LastOrDefault(p => p.AttrCode.Equals("NGAY_GIA_HAN_TIEP_THEO") && p.ObjCode.Equals(x.ProjectCode)) != null ? _context.AttributeManagerGalaxys.LastOrDefault(p => p.AttrCode.Equals("NGAY_GIA_HAN_TIEP_THEO") && p.ObjCode.Equals(x.ProjectCode)).AttrValue : "",
                PaymentNextDate = _context.AttributeManagerGalaxys.LastOrDefault(p => p.AttrCode.Equals("NGAY_THANH_TOAN_TIEP_THEO") && p.ObjCode.Equals(x.ProjectCode)) != null ? _context.AttributeManagerGalaxys.LastOrDefault(p => p.AttrCode.Equals("NGAY_THANH_TOAN_TIEP_THEO") && p.ObjCode.Equals(x.ProjectCode)).AttrValue : "",
            }).ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "Code", "Name", "Currency", "Progress", "Budget", "StartTime", "EndTime", "Status", "SetPriority", "CustomerCode", "ExpirationDate", "RenewalDate", "PaymentNextDate");
            return Json(jdata);
        }
        public class CalendaProjecttModel : JTableModel
        {
            public string Date { get; set; }
            public int Value { get; set; }
        }

        public class CalendarProject
        {
            public int NextPay { get; set; }
            public int Renew { get; set; }
            public int Expried { get; set; }
            public DateTime Date { get; set; }
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
                    var listDelete = notifiManager.ListUser.Where(x => x.UserId.Equals(AppContext.UserId)).ToList();
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
                    if (notifiManager.ListUser.Any(p => p.UserId.Equals(AppContext.UserId)))
                        isRead = false;
                }
            }
            catch (Exception ex)
            {
            }
            return isRead;
        }
        #endregion

        #region Status
        [HttpPost]
        public JsonResult GetLogStatus(string code)
        {
            var project = _context.Projects.FirstOrDefault(x => x.ProjectCode.Equals(code) && !x.FlagDeleted);
            return Json(project);
        }
        #endregion

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_customerLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_supplierLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_cardJobController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerFp.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_fileObjectShareController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_attributeManagerController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_materialProductController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_sendRequestImportProductController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_contractLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_workflowActivityController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_edmsRepositoryController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_funcAccEntryLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_contractPoLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .DistinctBy(x => x.Name);
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion
    }

    public class ProjectServiceItem
    {
        public int Id { get; set; }
        public string ServiceCode { get; set; }
        public string Code { get; set; }
        public decimal Cost { get; set; }
        public decimal? Quantity { get; set; }
        public string Unit { get; set; }
        public string PriceType { get; set; }
        public double Tax { get; set; }
        public string Note { get; set; }
        public int HeaderId { get; set; }
        public string HeaderName { get; set; }
        public string UnitName { get; set; }
        public double TaxMoney { get; set; }
        public List<JsonLog> ListStatusObjectLog { get; set; }
        public string SLastLog { get; set; }
        public string DurationTime { get; set; }
    }

    public class JTableModelProject : JTableModel
    {
        //export excel
        public bool? IsExportExcel { get; set; }
        //new index
        public string CustomerCode { get; set; }
        public string SupplierCode { get; set; }
        public string StatusObject { get; set; }
        public string AetType { get; set; }
        public string SearchTab { get; set; }
        public decimal? SurplusStart { get; set; }
        public decimal? SurplusEnd { get; set; }
        //old index
        public string ProjectCode { get; set; }
        public string ProjectTitle { get; set; }
        public string ProjectType { get; set; }
        public double? BudgetStart { get; set; }
        public double? BudgetEnd { get; set; }
        public string StartTime { get; set; }
        public string EndTime { get; set; }

        //member
        public string Fullname { get; set; }
        public string Position { get; set; }

        //atribute
        public string AttrCode { get; set; }
        public string AttrValue { get; set; }

        //file
        public string FromDate { get; set; }
        public string ToDate { get; set; }
        public string CatCode { get; set; }

        //tag
        public string Title { get; set; }
        public string Tags { get; set; }

        //contract
        public string ContractCode { get; set; }
        public string ContractNo { get; set; }
        public string BranchId { get; set; }

        //product, already have FromDate, ToDate
        public string PortType { get; set; }
        public string ProductCode { get; set; }

        //service, already have FromDate, ToDate, PortType
        public string ServiceCode { get; set; }
    }

    internal class Parentclass
    {
        public int Id { get; }
        public string ItemCode { get; }
        public string ProjectCode { get; }
        public string ItemName { get; }
        public string ItemLevel { get; }
        public decimal ItemWeight { get; }
        public string ItemParent { get; }
        public string DurationTime { get; }
        public string DurationUnit { get; }
        public string Cost { get; }
        public string CostUnit { get; }

        public Parentclass(int id, string itemCode, string projectCode, string itemName, string itemLevel, decimal itemWeight, string itemParent, string durationTime, string durationUnit, string cost, string costUnit)
        {
            Id = id;
            ItemCode = itemCode;
            ProjectCode = projectCode;
            ItemName = itemName;
            ItemLevel = itemLevel;
            ItemWeight = itemWeight;
            ItemParent = itemParent;
            DurationTime = durationTime;
            DurationUnit = durationUnit;
            Cost = cost;
            CostUnit = costUnit;
        }

        public Parentclass(int id, string itemCode, string projectCode, string itemName, string itemLevel, decimal itemWeight, string itemParent, string durationTime, string durationUnit, string costUnit)
        {
            Id = id;
            ItemCode = itemCode;
            ProjectCode = projectCode;
            ItemName = itemName;
            ItemLevel = itemLevel;
            ItemWeight = itemWeight;
            ItemParent = itemParent;
            DurationTime = durationTime;
            DurationUnit = durationUnit;
            CostUnit = costUnit;
        }

        public override bool Equals(object obj)
        {
            return obj is Parentclass other &&
                   Id == other.Id &&
                   ItemCode == other.ItemCode &&
                   ProjectCode == other.ProjectCode &&
                   ItemName == other.ItemName &&
                   ItemLevel == other.ItemLevel &&
                   ItemWeight == other.ItemWeight &&
                   ItemParent == other.ItemParent &&
                   DurationTime == other.DurationTime &&
                   DurationUnit == other.DurationUnit &&
                   Cost == other.Cost &&
                   CostUnit == other.CostUnit;
        }

        public override int GetHashCode()
        {
            HashCode hash = new HashCode();
            hash.Add(Id);
            hash.Add(ItemCode);
            hash.Add(ProjectCode);
            hash.Add(ItemName);
            hash.Add(ItemLevel);
            hash.Add(ItemWeight);
            hash.Add(ItemParent);
            hash.Add(DurationTime);
            hash.Add(DurationUnit);
            hash.Add(Cost);
            hash.Add(CostUnit);
            return hash.ToHashCode();
        }
    }
}