using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;
using System.Globalization;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Http;
using System.IO;
using Microsoft.AspNetCore.Hosting;
using III.Domain.Enums;
using GeoCoordinatePortable;
using DataConnection;
using System.Data;
using III.Admin.Controllers;
using System.Net.Http;
using System.Net.Http.Headers;
using Newtonsoft.Json;
using System.Text;
using static ESEIM.Models.EIMDBContext;
using System.Data.SqlClient;
using Newtonsoft.Json.Linq;

namespace ESEIM.Controllers
{
    //[EnableCors("AllowSpecificOrigin")]
    public class WorkflowActivityController : Controller
    {
        private readonly UserManager<AspNetUser> _userManager;
        private readonly RoleManager<AspNetRole> _roleManager;
        private readonly EIMDBContext _context;
        //private readonly PackageDbContext _packageContext;
        private readonly AppSettings _appSettings;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IUploadService _uploadService;
        private readonly IActionLogService _actionLog;
        private readonly IFCMPushNotification _notification;
        private readonly IGoogleApiService _googleAPI;

        //var session = HttpContext.GetSessionUser();

        public WorkflowActivityController(IOptions<AppSettings> appSettings, EIMDBContext context, UserManager<AspNetUser> userManager, RoleManager<AspNetRole> roleManager, IActionLogService actionLog, IHostingEnvironment hostingEnvironment, IUploadService uploadService, IFCMPushNotification notification, IGoogleApiService googleAPI)
        {
            _userManager = userManager;
            _context = context;
            _roleManager = roleManager;
            _appSettings = appSettings.Value;
            _actionLog = actionLog;
            _hostingEnvironment = hostingEnvironment;
            _uploadService = uploadService;
            _notification = notification;
            _googleAPI = googleAPI;
        }

        public IActionResult Index()
        {
            return View("Index");
        }

        #region Draw workflow Instance
        [HttpGet]
        public JsonResult GetTransitionInstance(string WfInstCode)
        {
            var data = (from c in _context.WorkflowInstanceRunnings.Where(x => !x.IsDeleted && x.WfInstCode.Equals(WfInstCode))
                        join d in _context.Transitions.Where(x => !x.IsDeleted) on c.TransitionCode equals d.TrsCode
                        select new
                        {
                            ID = c.Id,
                            IdAutoGen = Guid.NewGuid().ToString().ToLower(),
                            actintial = c.ActivityInitial,
                            actdes = c.ActivityDestination,
                            tranShapJson = d.TrsAttrGraph
                        });
            return Json(data);
        }

        [HttpGet]
        public JsonResult GetActivityInstance(string wfInstCode)
        {
            var data = (from a in _context.WorkflowInstances.Where(x => !x.IsDeleted.Value && x.WfInstCode.Equals(wfInstCode))
                        join b in _context.ActivityInstances.Where(x => !x.IsDeleted) on a.WfInstCode equals b.WorkflowCode
                        join c in _context.WorkflowMilestones.Where(x => !x.IsDeleted) on b.ActivityCode equals c.ActivityCode
                        join d in _context.WorkflowInstanceRunnings.Where(x => !x.IsDeleted) on b.ActivityInstCode equals d.ActivityDestination into d1
                        from d2 in d1.DefaultIfEmpty()
                        select new ModelDrawInstance
                        {
                            ID = b.ID,
                            ActInstCode = b.ActivityInstCode,
                            Title = b.Title,
                            Status = _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b.Status) && !x.IsDeleted).ValueSet ?? "",
                            Timer = b.Duration,
                            Unit = _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b.Unit) && !x.IsDeleted).ValueSet ?? "",
                            shapJson = b.ShapeJson,
                            wf = a.WfInstCode,
                            MilestoneCode = c.MilestoneCode,
                            //IsLock = b.IsLock,
                            MileStone = _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(c.MilestoneCode) && !x.IsDeleted).ValueSet ?? "",
                            StartTime = b.StartTime,
                            CommandSymbol = d2 != null ? d2.Command : "",
                            CommandText = "",
                            ObjCode = a.ObjectInst,
                            StatusCode = b.Status,
                            ConfirmedN = false,
                            EndTimeTxt = b.EndTime.HasValue ? b.EndTime.Value.ToString("HH:mm dd/MM/yyyy") : "",
                            EndTime = b.EndTime,
                            IsValid = true,
                            LogCountDown = !string.IsNullOrEmpty(b.LogCountDown) ? b.LogCountDown : ""
                        }).DistinctBy(x => x.ActInstCode).ToList();
            foreach (var item in data)
            {
                if (!string.IsNullOrEmpty(item.CommandSymbol))
                {
                    var command = JsonConvert.DeserializeObject<List<JsonCommand>>(item.CommandSymbol).LastOrDefault();
                    item.CommandSymbol = command != null ? command.CommandSymbol : "";
                    var cmd = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == item.CommandSymbol);
                    item.CommandText = cmd != null ? cmd.ValueSet : "";
                }

                item.ConfirmedN = RepeatCommandDraw(item.ActInstCode);

                if (item.Unit == "Ngày")
                {
                    item.StartTime = item.StartTime.HasValue ? item.StartTime.Value.AddDays(Convert.ToDouble(item.Timer)) : (DateTime?)null;
                }
                if (item.Unit == "Giờ")
                {
                    item.StartTime = item.StartTime.HasValue ? item.StartTime.Value.AddHours(Convert.ToDouble(item.Timer)) : (DateTime?)null;
                }
                if (item.Unit == "Phút")
                {
                    item.StartTime = item.StartTime.HasValue ? item.StartTime.Value.AddMinutes(Convert.ToDouble(item.Timer)) : (DateTime?)null;
                }
                if (item.Unit == "Giây")
                {
                    item.StartTime = item.StartTime.HasValue ? item.StartTime.Value.AddSeconds(Convert.ToDouble(item.Timer)) : (DateTime?)null;
                }

                if (item.EndTime.HasValue)
                {
                    if (item.EndTime.Value > item.StartTime && (item.StatusCode == "STATUS_ACTIVITY_APPROVED" || item.StatusCode == "STATUS_ACTIVITY_APPROVE_END"))
                    {
                        item.IsValid = false;
                    }
                }
                if (!string.IsNullOrEmpty(item.LogCountDown))
                {
                    var lstLog = JsonConvert.DeserializeObject<List<LogCountDown>>(item.LogCountDown);
                    item.LogCountDown = "lần: " + lstLog.LastOrDefault().Cnt + " , quá hạn: " + Convert.ToInt32(lstLog.LastOrDefault().Total) + " " + item.Unit;
                }
            }
            return Json(data);
        }

        [NonAction]
        public bool RepeatCommandDraw(string actInst)
        {
            var check = false;
            var runningTo = _context.WorkflowInstanceRunnings.Where(x => !x.IsDeleted && x.ActivityInitial == actInst);
            foreach (var to in runningTo)
            {
                var lstCmd = JsonConvert.DeserializeObject<List<JsonCommand>>(to.Command);
                if (lstCmd.Count > 0)
                {
                    if (lstCmd.LastOrDefault().Confirmed == "CONFIRM_COMMAND_N")
                    {
                        check = true;
                        break;
                    }
                }
            }
            return check;
        }


        [HttpGet]
        public object GetItemActInstByCode(string code)
        {
            var check = false;
            var data = _context.ActivityInstances.FirstOrDefault(x => x.ActivityInstCode == code && !x.IsDeleted);
            if (data != null)
            {
                var transtions = _context.WorkflowInstanceRunnings.Where(x => !x.IsDeleted && x.ActivityInitial == data.ActivityInstCode);
                foreach (var item in transtions)
                {
                    var lstCommand = JsonConvert.DeserializeObject<List<JsonCommand>>(item.Command);
                    if (lstCommand.Count > 0)
                    {
                        if (lstCommand[lstCommand.Count - 1].Confirmed == "CONFIRM_COMMAND_N")
                        {
                            check = true;
                            break;
                        }
                    }
                }
            }

            return new
            {
                DataActInst = data,
                IsBack = check
            };
        }
        [HttpGet]
        public JsonResult GetItemActInst(string actInstCode)
        {
            var data = (_context.ActivityInstances.Where(x => x.ActivityInstCode == actInstCode).Select(x => new
            {
                ActivityCode = x.ActivityCode,
                ActivityInstCode = x.ActivityInstCode,
                CreatedBy = x.CreatedBy,
                CreatedTime = x.CreatedTime.HasValue ? x.CreatedTime.Value.ToString("HH:mm dd/MM/yyyy") : "",
                Desc = x.Desc,
                Duration = x.Duration,
                Group = _context.CommonSettings.FirstOrDefault(y => y.CodeSet == x.Group).ValueSet ?? "",
                ID = x.Duration,
                Located = x.Located,
                ShapeJson = x.ShapeJson,
                Status = _context.CommonSettings.FirstOrDefault(y => y.CodeSet == x.Status).ValueSet ?? "",
                Title = x.Title,
                Type = _context.CommonSettings.FirstOrDefault(y => y.CodeSet == x.Type).ValueSet ?? "",
                Unit = _context.CommonSettings.FirstOrDefault(y => y.CodeSet == x.Unit).ValueSet ?? "",
                WorkflowCode = x.WorkflowCode,
            })).FirstOrDefault();
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetMemberAssign(string actInstCode)
        {
            var query = (from a in _context.ExcuterControlRoleInsts.Where(x => !x.IsDeleted)
                         join b in _context.Users on a.UserId equals b.Id
                         join c in _context.AdDepartments.Where(x => !x.IsDeleted && x.IsEnabled) on b.DepartmentId equals c.DepartmentCode into c1
                         from c2 in c1.DefaultIfEmpty()
                         where a.ActivityCodeInst.Equals(actInstCode)
                         select new
                         {
                             Id = a.ID,
                             UserId = b.Id,
                             GivenName = b.GivenName,
                             Role = _context.CommonSettings.FirstOrDefault(y => y.CodeSet == a.Role).ValueSet,
                             Department = !string.IsNullOrEmpty(b.DepartmentId) ? b.DepartmentId : "",
                             DepartmentName = c2 != null ? c2.Title : "",
                             Status = _context.CommonSettings.FirstOrDefault(y => y.CodeSet == a.Status).ValueSet,
                             RoleSys = (from m in _context.UserRoles.Where(x => x.UserId.Equals(b.Id))
                                        join n in _context.Roles on m.RoleId equals n.Id
                                        select n).FirstOrDefault() != null ? (from m in _context.UserRoles.Where(x => x.UserId.Equals(b.Id))
                                                                              join n in _context.Roles on m.RoleId equals n.Id
                                                                              select n).FirstOrDefault().Title : "Nhân viên"
                         }).ToList();
            return Json(query);
        }


        [HttpPost]
        public JsonResult GetLstResultAttrData(string actInstCode)
        {
            var query = (from a in _context.ActivityAttrDatas.Where(x => !x.IsDeleted && x.ActCode == actInstCode)
                         join b in _context.AttrSetups.Where(x => !x.IsDeleted) on a.AttrCode equals b.AttrCode
                         join c in _context.Users on a.CreatedBy equals c.UserName
                         select new
                         {
                             Value = a.Value,
                             a.AttrCode,
                             CreatedBy = c.GivenName,
                             a.CreatedTime,
                             b.AttrName,
                             Unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(b.AttrUnit)).ValueSet,
                             AttrTypeData = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(b.AttrDataType)).ValueSet
                         }).GroupBy(x => x.CreatedBy);

            var lstResult = new List<AttrData>();
            var index = 0;
            foreach (var item in query)
            {
                foreach (var i in item)
                {
                    var attrData = new AttrData();
                    attrData.AttrCode = i.AttrCode;
                    attrData.AttrName = i.AttrName;
                    attrData.Value = i.Value;
                    attrData.CreatedBy = i.CreatedBy;
                    attrData.Unit = i.Unit;
                    attrData.CreatedTime = i.CreatedTime.Value.ToString("HH:mm dd/MM/yyyy");
                    attrData.Background = index % 2 == 0 ? "aliceblue" : "white";
                    lstResult.Add(attrData);
                }
                index++;
            }
            return Json(lstResult);
        }

        [HttpPost]
        public JsonResult GetObjectProcessDiagram(string actInstCode)
        {
            var data = _context.WfActivityObjectProccessings.Where(x => !x.IsDeleted && x.ActInstCode == actInstCode);
            var lst = new List<ObjectProcessModel>();
            if (data.Any())
            {
                foreach (var item in data)
                {
                    switch (item.ObjectType)
                    {
                        case "CONTRACT":
                            var contract = (from a in _context.PoSaleHeaders.Where(x => !x.IsDeleted && x.ContractCode == item.ObjectInst)
                                            join b in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Status equals b.CodeSet into b1
                                            from b in b1.DefaultIfEmpty()
                                            select new ObjectProcessModel
                                            {
                                                Id = item.ID,
                                                Beshare = item.Beshare,
                                                CreatedBy = _context.Users.FirstOrDefault(x => x.UserName == item.CreatedBy).GivenName,
                                                Status = b != null ? b.ValueSet : "",
                                                ObjectCode = item.ObjectInst,
                                                ObjectName = a.Title,
                                                CreatedTime = item.CreatedTime.ToString("HH:mm dd/MM/yyyy"),
                                                ObjEntry = item.ObjEntry,
                                                ObjType = item.ObjectType
                                            }).FirstOrDefault();
                            lst.Add(contract);
                            break;

                        case "PROJECT":
                            var project = (from a in _context.Projects.Where(x => !x.FlagDeleted && x.ProjectCode == item.ObjectInst)
                                           join b in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Status equals b.CodeSet into b1
                                           from b in b1.DefaultIfEmpty()
                                           select new ObjectProcessModel
                                           {
                                               Id = item.ID,
                                               Beshare = item.Beshare,
                                               CreatedBy = _context.Users.FirstOrDefault(x => x.UserName == item.CreatedBy).GivenName,
                                               Status = b != null ? b.ValueSet : "",
                                               ObjectCode = item.ObjectInst,
                                               ObjectName = a.ProjectTitle,
                                               CreatedTime = item.CreatedTime.ToString("HH:mm dd/MM/yyyy"),
                                               ObjEntry = item.ObjEntry,
                                               ObjType = item.ObjectType
                                           }).FirstOrDefault();
                            lst.Add(project);
                            break;
                        case "CONTRACT_PO":
                            var po = (from a in _context.PoBuyerHeaders.Where(x => !x.IsDeleted && x.PoSupCode == item.ObjectInst)
                                      join b in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Status equals b.CodeSet into b1
                                      from b in b1.DefaultIfEmpty()
                                      select new ObjectProcessModel
                                      {
                                          Id = item.ID,
                                          Beshare = item.Beshare,
                                          CreatedBy = _context.Users.FirstOrDefault(x => x.UserName == item.CreatedBy).GivenName,
                                          Status = b != null ? b.ValueSet : "",
                                          ObjectCode = item.ObjectInst,
                                          ObjectName = a.PoTitle,
                                          CreatedTime = item.CreatedTime.ToString("HH:mm dd/MM/yyyy"),
                                          ObjEntry = item.ObjEntry,
                                          ObjType = item.ObjectType
                                      }).FirstOrDefault();
                            lst.Add(po);
                            break;
                        case "SUPPLIER":
                            var supp = (from a in _context.Suppliers.Where(x => !x.IsDeleted && x.SupCode == item.ObjectInst)
                                        join b in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Status equals b.CodeSet into b1
                                        from b in b1.DefaultIfEmpty()
                                        select new ObjectProcessModel
                                        {
                                            Id = item.ID,
                                            Beshare = item.Beshare,
                                            CreatedBy = _context.Users.FirstOrDefault(x => x.UserName == item.CreatedBy).GivenName,
                                            Status = b != null ? b.ValueSet : "",
                                            ObjectCode = item.ObjectInst,
                                            ObjectName = a.SupName,
                                            CreatedTime = item.CreatedTime.ToString("HH:mm dd/MM/yyyy"),
                                            ObjEntry = item.ObjEntry,
                                            ObjType = item.ObjectType
                                        }).FirstOrDefault();
                            lst.Add(supp);
                            break;
                        case "CUSTOMER":
                            var cus = (from a in _context.Customerss.Where(x => !x.IsDeleted && x.CusCode == item.ObjectInst)
                                       join b in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Status equals b.CodeSet into b1
                                       from b in b1.DefaultIfEmpty()
                                       select new ObjectProcessModel
                                       {
                                           Id = item.ID,
                                           Beshare = item.Beshare,
                                           CreatedBy = _context.Users.FirstOrDefault(x => x.UserName == item.CreatedBy).GivenName,
                                           Status = b != null ? b.ValueSet : "",
                                           ObjectCode = item.ObjectInst,
                                           ObjectName = a.CusName,
                                           CreatedTime = item.CreatedTime.ToString("HH:mm dd/MM/yyyy"),
                                           ObjEntry = item.ObjEntry,
                                           ObjType = item.ObjectType
                                       }).FirstOrDefault();
                            lst.Add(cus);
                            break;
                        case "REQUEST_PRICE":
                            var rqPrice = (from a in _context.RequestPriceHeaders.Where(x => !x.IsDeleted && x.ReqCode == item.ObjectInst)
                                           join b in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Status equals b.CodeSet into b1
                                           from b in b1.DefaultIfEmpty()
                                           select new ObjectProcessModel
                                           {
                                               Id = item.ID,
                                               Beshare = item.Beshare,
                                               CreatedBy = _context.Users.FirstOrDefault(x => x.UserName == item.CreatedBy).GivenName,
                                               Status = b != null ? b.ValueSet : "",
                                               ObjectCode = item.ObjectInst,
                                               ObjectName = a.Title,
                                               CreatedTime = item.CreatedTime.ToString("HH:mm dd/MM/yyyy"),
                                               ObjEntry = item.ObjEntry,
                                               ObjType = item.ObjectType
                                           }).FirstOrDefault();
                            lst.Add(rqPrice);
                            break;
                        case "ORDER_REQUEST":
                            var orderRQ = (from a in _context.OrderRequestRaws.Where(x => x.ReqCode == item.ObjectInst)
                                           join b in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Status equals b.CodeSet into b1
                                           from b in b1.DefaultIfEmpty()
                                           select new ObjectProcessModel
                                           {
                                               Id = item.ID,
                                               Beshare = item.Beshare,
                                               CreatedBy = _context.Users.FirstOrDefault(x => x.UserName == item.CreatedBy).GivenName,
                                               Status = b != null ? b.ValueSet : "",
                                               ObjectCode = item.ObjectInst,
                                               ObjectName = a.Title,
                                               CreatedTime = item.CreatedTime.ToString("HH:mm dd/MM/yyyy"),
                                               ObjEntry = item.ObjEntry,
                                               ObjType = item.ObjectType
                                           }).FirstOrDefault();
                            lst.Add(orderRQ);
                            break;
                        case "SERVICECAT":
                            var serCat = (from a in _context.ServiceCategorys.Where(x => x.ServiceCode == item.ObjectInst && !x.IsDeleted)
                                          select new ObjectProcessModel
                                          {
                                              Id = item.ID,
                                              Beshare = item.Beshare,
                                              CreatedBy = _context.Users.FirstOrDefault(x => x.UserName == item.CreatedBy).GivenName,
                                              Status = "",
                                              ObjectCode = item.ObjectInst,
                                              ObjectName = a.ServiceName,
                                              CreatedTime = item.CreatedTime.ToString("HH:mm dd/MM/yyyy"),
                                              ObjEntry = item.ObjEntry,
                                              ObjType = item.ObjectType
                                          }).FirstOrDefault();
                            lst.Add(serCat);
                            break;
                        case "PRODUCT":
                            var prod = (from a in _context.MaterialProducts.Where(x => x.ProductCode == item.ObjectInst && !x.IsDeleted)
                                        join b in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Status equals b.CodeSet into b1
                                        from b in b1.DefaultIfEmpty()
                                        select new ObjectProcessModel
                                        {
                                            Id = item.ID,
                                            Beshare = item.Beshare,
                                            CreatedBy = _context.Users.FirstOrDefault(x => x.UserName == item.CreatedBy).GivenName,
                                            Status = b != null ? b.ValueSet : "",
                                            ObjectCode = item.ObjectInst,
                                            ObjectName = a.ProductName,
                                            CreatedTime = item.CreatedTime.ToString("HH:mm dd/MM/yyyy"),
                                            ObjEntry = item.ObjEntry,
                                            ObjType = item.ObjectType
                                        }).FirstOrDefault();
                            lst.Add(prod);
                            break;
                        case "CARD_JOB":
                            var card = (from a in _context.WORKOSCards.Where(x => x.CardCode == item.ObjectInst && !x.IsDeleted && x.Status != "TRASH")
                                        join b in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Status equals b.CodeSet into b1
                                        from b in b1.DefaultIfEmpty()
                                        select new ObjectProcessModel
                                        {
                                            Id = item.ID,
                                            Beshare = item.Beshare,
                                            CreatedBy = _context.Users.FirstOrDefault(x => x.UserName == item.CreatedBy).GivenName,
                                            Status = b != null ? b.ValueSet : "",
                                            ObjectCode = item.ObjectInst,
                                            ObjectName = a.CardName,
                                            CreatedTime = item.CreatedTime.ToString("HH:mm dd/MM/yyyy"),
                                            ObjEntry = item.ObjEntry,
                                            ObjType = item.ObjectType
                                        }).FirstOrDefault();
                            lst.Add(card);
                            break;
                    }
                }
            }
            return Json(lst);
        }
        public class LogCountDown
        {
            public string User { get; set; }
            public DateTime Time { get; set; }
            public int Cnt { get; set; }
            public decimal Total { get; set; }
            public string UnitTime { get; set; }
            public DateTime StartTimeX { get; set; }
        }
        [HttpPost]
        public object GetStartXLast(string actInst)
        {
            var data = _context.ActivityInstances.FirstOrDefault(x => !x.IsDeleted && x.ActivityInstCode == actInst);
            var startX = (DateTime?)null;
            var cnt = 0;
            decimal total = 0;
            if (data != null)
            {
                if (!string.IsNullOrEmpty(data.LogCountDown))
                {
                    var lstLog = JsonConvert.DeserializeObject<List<LogCountDown>>(data.LogCountDown);
                    startX = lstLog.LastOrDefault().StartTimeX;
                    cnt = lstLog.LastOrDefault().Cnt;
                    total = lstLog.LastOrDefault().Total;
                }
            }
            return new
            {
                StartX = startX,
                Cnt = cnt,
                Total = total
            };
        }
        public class LstActInst
        {
            public int ID { get; set; }
            public string Title { get; set; }
            public string Status { get; set; }
            public string Timer { get; set; }
            public string ObjCode { get; set; }
            public string ActInstCode { get; set; }
            public bool IsRela { get; set; }
            public bool IsLock { get; set; }
            public bool IsSelected { get; set; }
            public string AttachFile { get; set; }
        }
        [HttpPost]
        public JsonResult GetInstanceAct(string wfCode)
        {
            var data = (from a in _context.WorkflowInstances.Where(x => !x.IsDeleted.Value && x.WfInstCode.Equals(wfCode))
                        join b in _context.ActivityInstances.Where(x => !x.IsDeleted) on a.WfInstCode equals b.WorkflowCode
                        select new LstActInst
                        {
                            ID = b.ID,
                            Title = b.Title,
                            Status = _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b.Status) && !x.IsDeleted).ValueSet ?? "",
                            Timer = b.Duration + " " + _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b.Unit) && !x.IsDeleted).ValueSet ?? "",
                            ObjCode = a.ObjectInst,
                            IsRela = false,
                            ActInstCode = b.ActivityInstCode,
                            //IsLock = b.IsLock
                        }).ToList();
            foreach (var item in data)
            {
                if (!item.IsLock)
                {
                    item.IsRela = IsEmpRela(item.ActInstCode);
                }
                var files = from a in _context.EDMSRepoCatFiles.Where(x => x.ObjectCode.Equals(item.ActInstCode) && x.ObjectType.Equals(EnumHelper<ActivityInst>.GetDisplayValue(ActivityInst.ActivityInst)))
                            join b in _context.EDMSFiles.Where(x => !x.IsDeleted) on a.FileCode equals b.FileCode
                            join c in _context.ActivityInstFiles.Where(x => !x.IsDeleted) on a.FileCode equals c.FileID
                            select new
                            {
                                b.FileName
                            };
                item.AttachFile = string.Join(", ", files.Select(x => x.FileName));
            }
            return Json(data);
        }

        [NonAction]
        public bool IsEmpRela(string actInst)
        {
            var data = _context.ExcuterControlRoleInsts.Where(x => !x.IsDeleted && x.ActivityCodeInst == actInst);
            if (data.Any(x => x.UserId == ESEIM.AppContext.UserId))
            {
                return true;
            }
            else
            {
                return false;
            }
        }


        [HttpPost]
        public JsonResult InsertLogCountDown(string actInst, int cnt)
        {
            var msg = new JMessage();
            var data = _context.ActivityInstances.FirstOrDefault(x => !x.IsDeleted && x.ActivityInstCode == actInst);
            if (data != null)
            {
                var logCntDown = new LogCountDown
                {
                    User = "",
                    Time = DateTime.Now,
                    Cnt = 1,
                    Total = data.Duration,
                    UnitTime = data.Unit,
                    StartTimeX = DateTime.Now
                };
                var lstLog = new List<LogCountDown>();
                if (!string.IsNullOrEmpty(data.LogCountDown))
                {
                    lstLog = JsonConvert.DeserializeObject<List<LogCountDown>>(data.LogCountDown);
                    logCntDown.Cnt = lstLog.LastOrDefault().Cnt + (cnt != 0 ? cnt : 1);
                    logCntDown.Total = lstLog.LastOrDefault().Total + (cnt != 0 ? (cnt * data.Duration) : data.Duration);
                }
                lstLog.Add(logCntDown);
                data.LogCountDown = JsonConvert.SerializeObject(lstLog);
                _context.ActivityInstances.Update(data);
                _context.SaveChanges();
                msg.Object = logCntDown;
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetAttachmentDiagram(string actInstCode)
        {
            var data = ((from a in _context.ActivityInstFiles.Where(x => x.ActivityInstCode.Equals(actInstCode) && !x.IsDeleted)
                         select new LstAttachment
                         {
                             Id = a.ID,
                             FileName = a.FileName,
                             FileUrl = a.FilePath,
                             MemberId = a.CreatedBy,
                             FileCode = a.FileID,
                             CreatedTime = a.CreatedTime.Value,
                             Type = 1,
                             Icon = "",
                             Color = ""
                         }).Union(
                from a in _context.FilesShareObjectUsers.Where(x => !x.IsDeleted
                     && JsonConvert.DeserializeObject<ObjRelative>(x.ObjectRelative).ObjectType.Equals("ACT_INST")
                     && JsonConvert.DeserializeObject<ObjRelative>(x.ObjectRelative).ObjectInstance.Equals(actInstCode))
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

        public class ObjRelative
        {
            public string ObjectType { get; set; }
            public string ObjectInstance { get; set; }
        }

        public class AttrData
        {
            public int ID { get; set; }
            public string AttrCode { get; set; }
            public string Value { get; set; }
            public string AttrName { get; set; }
            public string Unit { get; set; }
            public string CreatedBy { get; set; }
            public string CreatedTime { get; set; }
            public string Background { get; set; }
        }

        public class ModelDrawInstance
        {
            public int ID { get; set; }
            public string ActInstCode { get; set; }
            public string Title { get; set; }
            public string Status { get; set; }
            public string Unit { get; set; }
            public string shapJson { get; set; }
            public string wf { get; set; }
            public string MilestoneCode { get; set; }
            public bool IsLock { get; set; }
            public string MileStone { get; set; }
            public string CommandSymbol { get; set; }
            public DateTime? StartTime { get; set; }
            public decimal Timer { get; set; }
            public string CommandText { get; set; }
            public string ObjCode { get; set; }
            public string StatusCode { get; set; }
            public bool ConfirmedN { get; set; }
            public DateTime? EndTime { get; set; }
            public string EndTimeTxt { get; set; }
            public bool IsValid { get; set; }
            public string LogCountDown { get; set; }
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
        }

        public class ObjectProcessModel
        {
            public int Id { get; set; }
            public string ObjectCode { get; set; }
            public string ObjectName { get; set; }
            public bool Beshare { get; set; }
            public string Status { get; set; }
            public string CreatedBy { get; set; }
            public string CreatedTime { get; set; }
            public bool ObjEntry { get; set; }
            public string ObjType { get; set; }
        }
        #endregion

    }
}