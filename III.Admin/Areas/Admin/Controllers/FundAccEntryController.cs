using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using System.Globalization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;
using System.IO;
using System.Collections.Generic;
using Syncfusion.XlsIO;
using Syncfusion.Drawing;
using ESEIM;
using III.Domain.Enums;
using Newtonsoft.Json;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;
using System.Threading.Tasks;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class FundAccEntryController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IFCMPushNotification _notification;
        private readonly IStringLocalizer<FundAccEntryController> _stringLocalizer;
        private readonly IStringLocalizer<CardJobController> _stringLocalizerCard;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IStringLocalizer<WorkflowActivityController> _workflowActivityController;
        private readonly IStringLocalizer<CommonSettingController> _sharedResourcesCom;
        private readonly IStringLocalizer<EDMSRepositoryController> _repoController;
        private readonly IWorkflowService _workflowService;
        public FundAccEntryController(EIMDBContext context, IHostingEnvironment hostingEnvironment,
            IFCMPushNotification notification, IStringLocalizer<FundAccEntryController> stringLocalizer,
            IStringLocalizer<SharedResources> sharedResources, IStringLocalizer<CommonSettingController> sharedResourcesCom,
            IStringLocalizer<CardJobController> stringLocalizerCard, IWorkflowService workflowService,
            IStringLocalizer<WorkflowActivityController> workflowActivityController, IStringLocalizer<EDMSRepositoryController> repoController)
        {
            _context = context;
            _hostingEnvironment = hostingEnvironment;
            _notification = notification;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
            _sharedResourcesCom = sharedResourcesCom;
            _stringLocalizerCard = stringLocalizerCard;
            _workflowService = workflowService;
            _workflowActivityController = workflowActivityController;
            _repoController = repoController;
        }
        [Breadcrumb("ViewData.CrumbFundAcc", AreaName = "Admin", FromAction = "Index", FromController = typeof(FundsHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuFinance"] = _sharedResources["COM_CRUMB_MENU_FINANCE"];
            ViewData["CrumbFundHome"] = _sharedResources["COM_CRUMB_FUND_HOME"];
            ViewData["CrumbFundAcc"] = _sharedResources["COM_CRUMB_FUND_ACC_ENTRY"];
            return View();
        }

        #region Action 
        [HttpPost]
        public object JTable([FromBody] JTableModelAct jTablePara)
        {
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromTime) ? DateTime.ParseExact(jTablePara.FromTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToTime) ? DateTime.ParseExact(jTablePara.ToTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            string Currency = jTablePara.Currency;
            var session = HttpContext.GetSessionUser();
            var query = (from a in _context.FundAccEntrys
                         join b in _context.FundCatReptExpss.Where(x => !x.IsDeleted) on a.CatCode equals b.CatCode
                         join c in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals("STATUS_FUND")) on a.StatusObject equals c.CodeSet into c1
                         from c in c1.DefaultIfEmpty()
                         where (!a.IsDeleted
                               && ((fromDate == null) || (a.DeadLine.HasValue && a.DeadLine.Value.Date >= fromDate))
                               && ((toDate == null) || (a.DeadLine.HasValue && a.DeadLine.Value.Date <= toDate)))
                               && (string.IsNullOrEmpty(jTablePara.AetType) || (a.AetType.Equals(jTablePara.AetType)))
                               && (string.IsNullOrEmpty(jTablePara.Status) || (a.StatusObject.Equals(jTablePara.Status)))
                               && (string.IsNullOrEmpty(jTablePara.CatCode) || (a.CatCode.Equals(jTablePara.CatCode)))
                               && (string.IsNullOrEmpty(jTablePara.IsPlan) || (a.IsPlan.Equals(Convert.ToBoolean(jTablePara.IsPlan))))
                         orderby a.CreatedTime
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
            foreach (var item in query)
            {
                //var json = JsonConvert.DeserializeObject<List<JsonStatus>>(item.Status);
                //if (json.Count > 0)
                //{
                //    if (json[json.Count - 1].StatusCode == "FINAL_DONE")
                //    {
                //        item.IsApprove = 1;
                //    }
                //}
                //FUND_ACC_ENTRY
                //var wf = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value && x.ObjectInst.Equals(item.AetCode)
                //            && x.ObjectType.Equals("FUND_ACC_ENTRY"));
                //if (wf != null)
                //{
                //    if (!string.IsNullOrEmpty(wf.MarkActCurrent))
                //    {
                //        var data = _context.ActivityInstances.FirstOrDefault(x => !x.IsDeleted && x.ActivityInstCode.Equals(wf.MarkActCurrent));
                //        if (data != null)
                //        {
                //            if (data.Status != "STATUS_ACTIVITY_APPROVED" && data.Status != "STATUS_ACTIVITY_APPROVE_END")
                //            {
                //                if (data.Unit == "Ngày" || data.Unit == "DURATION_UNIT20200904094128")
                //                {
                //                    data.StartTime = data.StartTime.HasValue ? data.StartTime.Value.AddDays(Convert.ToDouble(data.Duration)) : (DateTime?)null;

                //                }
                //                if (data.Unit == "Giờ" || data.Unit == "DURATION_UNIT20200904094132")
                //                {
                //                    data.StartTime = data.StartTime.HasValue ? data.StartTime.Value.AddHours(Convert.ToDouble(data.Duration)) : (DateTime?)null;
                //                }
                //                if (data.Unit == "Phút" || data.Unit == "DURATION_UNIT20200904094135")
                //                {
                //                    data.StartTime = data.StartTime.HasValue ? data.StartTime.Value.AddMinutes(Convert.ToDouble(data.Duration)) : (DateTime?)null;
                //                }
                //                if (data.Unit == "Giây" || data.Unit == "DURATION_UNIT20200904094139")
                //                {
                //                    data.StartTime = data.StartTime.HasValue ? data.StartTime.Value.AddSeconds(Convert.ToDouble(data.Duration)) : (DateTime?)null;
                //                }

                //                var timeSpan = data.StartTime - DateTime.Now;
                //                if (timeSpan.Value.TotalSeconds < 0)
                //                {
                //                    item.IsOutTime = 1;
                //                    item.TimeAlive = "Quá hạn: " + timeSpan.Value.Days * (-1) + "d " + timeSpan.Value.Hours * (-1) + "h " + timeSpan.Value.Minutes * (-1) + "m " + timeSpan.Value.Seconds * (-1) + "s";
                //                }
                //                else
                //                {
                //                    item.TimeAlive = timeSpan.Value.Days * (-1) + "d " + timeSpan.Value.Hours + "h " + timeSpan.Value.Minutes + "m " + timeSpan.Value.Seconds + "s ";
                //                }
                //            }
                //            else
                //            {
                //                item.TimeAlive = data.EndTime.HasValue ? "Đã duyệt: " + data.EndTime.Value.ToString("dd/MM/yyyy HH:mm") : "";
                //            }
                //        }
                //    }
                //}
                //item.LastAct =
                //    JsonConvert.SerializeObject(GetLastActivity(item.AetCode, "FUND_ACC_ENTRY", session.UserId));
            }
            int count = query.Count();
            var dataRs = query.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length);
            var jdata = JTableHelper.JObjectTable(dataRs.ToList(), jTablePara.Draw, count, "Id", "AetCode", "Title",
                "AetType", "AetDescription", "Total", "Payer", "Receiptter", "Currency", "IsPlan", "Status", "CatName",
                "DeadLine", "IsApprove", "TimeAlive", "IsOutTime", "StatusObject", "SLastLog");

            return Json(jdata);
        }

        [HttpPost]
        public object Total(string fromDatePara, string toDatePara, string aetType, string status, string isPlan, string CatCode)
        {
            var fromDate = !string.IsNullOrEmpty(fromDatePara) ? DateTime.ParseExact(fromDatePara, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(toDatePara) ? DateTime.ParseExact(toDatePara, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            if (string.IsNullOrEmpty(isPlan))
            {
                var query = (from a in _context.FundAccEntrys
                             join b in _context.FundCatReptExpss.Where(x => x.IsDeleted == false)
                             on a.CatCode equals b.CatCode
                             where (!a.IsDeleted
                                    && ((fromDate == null) || (a.DeadLine.HasValue && a.DeadLine.Value.Date >= fromDate))
                                    && ((toDate == null) || (a.DeadLine.HasValue && a.DeadLine.Value.Date <= toDate)))
                                    && (string.IsNullOrEmpty(aetType) || (a.AetType.Equals(aetType)))
                                    && ((string.IsNullOrEmpty(CatCode)) || (a.CatCode.Equals(CatCode)))
                                    //&& (string.IsNullOrEmpty(status) || (_context.FundAccEntryTrackings.Where(x => x.AetCode == a.AetCode).MaxBy(x => x.Id).Action.Equals(status)))
                                    //&& ((a.IsPlan == false))
                                    //&& (a.IsCompleted == true)
                                    //&& (a.StatusObject == "FUND_APPROVED")
                             orderby a.CreatedTime
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
                                 Status = a.Status,
                                 AetRelativeType = a.AetRelativeType,
                                 AetDescription = a.AetDescription,
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
                             }).ToList();

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
                    TotalSurplusApproved = totalReceiptApproved - totalExpenseApproved
                };

                return result;
            }
            else
            {
                var query = from a in _context.FundAccEntrys
                            join b in _context.FundCatReptExpss.Where(x => x.IsDeleted == false)
                            on a.CatCode equals b.CatCode
                            where (!a.IsDeleted
                                  && ((fromDate == null) || (a.DeadLine.HasValue && a.DeadLine.Value.Date >= fromDate))
                                  && ((toDate == null) || (a.DeadLine.HasValue && a.DeadLine.Value.Date <= toDate)))
                                  && (string.IsNullOrEmpty(aetType) || (a.AetType.Equals(aetType)))
                                  && (string.IsNullOrEmpty(status) || (_context.FundAccEntryTrackings.Where(x => x.AetCode == a.AetCode).MaxBy(x => x.Id).Action.Equals(status)))
                                  && (string.IsNullOrEmpty(CatCode) || (a.CatCode.Equals(CatCode)))
                                  && ((a.IsPlan.Equals(Convert.ToBoolean(isPlan))))
                                  && (a.IsCompleted == true)
                                  && (a.StatusObject == "FUND_APPROVED")
                            orderby a.CreatedTime
                            select new
                            {
                                CatName = b.CatName,
                                Id = a.Id,
                                AetCode = a.AetCode,
                                Title = a.Title,
                                AetType = a.AetType,
                                AetRelativeType = a.AetRelativeType,
                                AetDescription = a.AetDescription,
                                Total = a.Total,
                                Payer = a.Payer,
                                Currency = a.Currency,
                                Status = a.Status,
                                Receiptter = a.Receiptter
                            };
                decimal totalReceipt = query.Where(x => x.AetType == "Receipt").Sum(x => x.Currency == "VND" ? x.Total : x.Total * (1 / (_context.FundExchagRates.FirstOrDefault(z => z.IsDeleted == false && z.Currency.Equals(x.Currency)).Rate)) * (_context.FundExchagRates.FirstOrDefault(z => z.IsDeleted == false && z.Currency.Equals("VND")).Rate));
                decimal totalExpense = query.Where(x => x.AetType == "Expense").Sum(x => x.Currency == "VND" ? x.Total : x.Total * (1 / (_context.FundExchagRates.FirstOrDefault(z => z.IsDeleted == false && z.Currency.Equals(x.Currency)).Rate)) * (_context.FundExchagRates.FirstOrDefault(z => z.IsDeleted == false && z.Currency.Equals("VND")).Rate));
                return (totalReceipt, totalExpense);
            }

            //int count = query.Count();
            //var data = query.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length);
            //var jdata = JTableHelper.JObjectTable(data.ToList(), jTablePara.Draw, count, "Id", "AetCode", "Title", "AetType", "AetDescription", "Total", "Payer", "Receiptter", "Currency", "IsPlan", "Status", "CatName");

            //return Json(jdata);
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
            else
            {
                return 1;
            }
        }

        [HttpPost]
        public JsonResult Insert([FromBody] FundAccEntryModel data)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var checkExist = _context.FundAccEntrys.FirstOrDefault(x => x.AetCode.ToLower() == data.AetCode.ToLower());
                if (checkExist != null)
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["FAE_MSG_FAE"];//"Đã tồn tại phiếu thu chi !";
                }
                else
                {
                    //var statusObjLog = new JsonLog
                    //{
                    //    Code = data.StatusObject,
                    //    Name = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(data.StatusObject)) != null ? _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(data.StatusObject)).ValueSet : "",
                    //    CreatedBy = _context.Users.FirstOrDefault(x => x.UserName.Equals(ESEIM.AppContext.UserName)).GivenName,
                    //    CreatedTime = DateTime.Now,
                    //};

                    var listStatusObjLog = new List<JsonLog>();
                    //listStatusObjLog.Add(statusObjLog);

                    //So sánh với số tiền phiếu cha (cùng loại thu/chi)
                    if (!string.IsNullOrEmpty(data.AetRelative))
                    {
                        var aetRelativeParent = _context.FundAccEntrys.FirstOrDefault(x => !x.IsDeleted && x.AetCode == data.AetRelative);
                        //nếu cùng loại thu/chi => kiểm tra xem phiếu cha đã có bao nhiêu phiếu con => Tính ra số tiền cho phép còn lại
                        if (aetRelativeParent.AetType == data.AetType)
                        {
                            var aetRelativeChild = _context.FundAccEntrys.Where(x => !x.IsDeleted && x.AetRelative == data.AetRelative && x.AetType == aetRelativeParent.AetType);
                            var totalChild = aetRelativeChild.Sum(x => x.Total);
                            if (data.Total > aetRelativeParent.Total - totalChild)
                            {
                                msg.Error = true;
                                //msg.Title = "Số tiền trên phiếu lớn hơn số tiền được phép thu/chi của phiếu cha";
                                msg.Title = _stringLocalizer["FEA_MSG_MONEY_ON_ORDER"];
                                return Json(msg);
                            }
                        }
                    }

                    //So sánh với số tiền cần phải thu/chi của hợp đồng
                    if (!string.IsNullOrEmpty(data.ObjCode) && data.ObjType == "CONTRACT")
                    {
                        var contractPayment = _context.FundAccEntrys
                                            .Where(x => !x.IsDeleted
                                                        && x.IsPlan == false
                                                        && x.ObjType == "CONTRACT"
                                                        && x.ObjCode == data.ObjCode
                                                        && (x.CatCode == "ADVANCE_CONTRACT" || x.CatCode == "PAY_CONTRACT")
                                                        && x.AetType == "Receipt"
                                                        );
                        var totalPayment = contractPayment.Sum(x => x.Total);
                        var contract = _context.PoSaleHeaders.FirstOrDefault(x => !x.IsDeleted && x.ContractCode == data.ObjCode);
                        var totalContract = contract.RealBudget;
                        if (data.Total > totalContract - totalPayment && data.AetType == "Receipt" && (data.CatCode == "ADVANCE_CONTRACT" || data.CatCode == "PAY_CONTRACT"))
                        {
                            msg.Error = true;
                            msg.Title = _stringLocalizer["FEA_MSG_INSERT_TOTAL"];//"Số tiền trên phiếu thu lớn hơn số tiền cần phải thu của hợp đồng";
                            return Json(msg);
                        }
                    }
                    //So sánh với số tiền của Dự án
                    if (!string.IsNullOrEmpty(data.ObjCode) && data.ObjType == "PROJECT")
                    {
                        var projectPayment = _context.FundAccEntrys
                                            .Where(x => !x.IsDeleted
                                                        && x.IsPlan == false
                                                        && x.ObjType == "PROJECT"
                                                        && x.ObjCode == data.ObjCode
                                                        && (x.CatCode == data.CatCode)
                                                        && x.AetType == data.AetType
                                                        );
                        var totalPayment = projectPayment.Sum(x => x.Total);
                        var project = _context.Projects.FirstOrDefault(x => !x.FlagDeleted && x.ProjectCode == data.ObjCode);
                        var totalProject = Convert.ToDecimal(project.Budget);
                        if (data.Total > totalProject - totalPayment)
                        {
                            msg.Error = true;
                            msg.Title = _stringLocalizer["FEA_MSG_INSERT_NUMBER_MONEY_PROJECT"];//"Số tiền trên phiếu  lớn hơn số tiền của dự án";
                            return Json(msg);
                        }
                    }

                    if (!string.IsNullOrEmpty(data.AetRelative))
                    {
                        var query = _context.FundAccEntrys.FirstOrDefault(x => x.AetCode == data.AetRelative && x.IsDeleted == false);
                        var total = _context.FundAccEntrys.Where(x => x.IsDeleted == false && x.AetRelative == data.AetRelative && x.AetType == query.AetType && x.IsCompleted == true).Sum(x => x.Total) + data.Total;
                        if (query.Total >= total)
                        {
                            var isplan = true;
                            var deadLine = !string.IsNullOrEmpty(data.DeadLine) ? DateTime.ParseExact(data.DeadLine, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                            if (deadLine <= DateTime.Now)
                            {
                                isplan = false;
                            }

                            var obj = new FundAccEntry
                            {
                                AetCode = data.AetCode,
                                AetDescription = data.AetDescription,
                                AetRelative = data.AetRelative,
                                AetRelativeType = data.AetRelativeType,
                                AetType = data.AetType,
                                CatCode = data.CatCode,
                                CreatedTime = DateTime.Now,
                                Currency = data.Currency,
                                DeadLine = deadLine,
                                IsDeleted = false,
                                Payer = data.Payer,
                                Receiptter = data.Receiptter,
                                Title = data.Title,
                                Total = data.Total,
                                Status = "",
                                StatusObject = data.StatusObject,
                                ListStatusObjectLog = listStatusObjLog,
                                GoogleMap = data.GoogleMap,
                                Address = data.Address,
                                IsPlan = isplan,
                                IsCompleted = isplan == true ? false : (data.AetType != "Receipt" ? false : true),
                                ObjType = data.ObjType,
                                ObjCode = data.ObjCode,
                                WorkflowCat = data.WorkflowCat
                            };
                            _context.FundAccEntrys.Add(obj);
                            _context.SaveChanges();
                            var query1 = _context.FundAccEntrys.FirstOrDefault(x => x.AetCode == data.AetRelative && x.IsDeleted == false);
                            var total1 = _context.FundAccEntrys.Where(x => x.IsDeleted == false && x.AetRelative == data.AetRelative && x.AetType == query.AetType && x.IsCompleted == true).Sum(x => x.Total);
                            if (query1.Total <= total1)
                            {
                                query1.IsCompleted = true;

                            }
                            else
                            {
                                query1.IsCompleted = false;
                            }
                            _context.FundAccEntrys.Update(query1);
                            _context.SaveChanges();

                            var entryTracking = new FundAccEntryTracking
                            {
                                AetCode = obj.AetCode,
                                CreatedBy = User.Identity.Name,
                                CreatedTime = DateTime.Now,
                                Action = data.StatusObject,
                                Note = obj.AetDescription
                            };
                            _context.FundAccEntryTrackings.Add(entryTracking);
                            _context.SaveChanges();

                            if (data.ListFileAccEntry.Count > 0)
                            {
                                foreach (var item in data.ListFileAccEntry)
                                {
                                    var fundFile = new FundFiles
                                    {
                                        AetCode = obj.AetCode,
                                        FileName = item.FileName,
                                        FilePath = item.FilePath,
                                        FileType = item.FileType,
                                        CreatedBy = User.Identity.Name,
                                        CreatedTime = DateTime.Now,
                                    };
                                    _context.FundFiless.Add(fundFile);
                                }
                                _context.SaveChanges();
                            }
                            var header = _context.FundAccEntrys.FirstOrDefault(x => !x.IsDeleted && x.AetCode.Equals(obj.AetCode));
                            //var detail = _context.FundAccEntrys.Where(x => !x.IsDeleted && x.AetCode.Equals(obj.AetCode)).ToList();
                            if (header != null)
                            {
                                var logData = new
                                {
                                    Header = header,
                                    //Detail = detail
                                };
                                var listLogData = new List<object>();
                                listLogData.Add(logData);

                                header.LogData = JsonConvert.SerializeObject(listLogData);

                                _context.FundAccEntrys.Update(header);
                                _context.SaveChanges();
                            }
                            msg.ID = header.Id;
                            msg.Title = _stringLocalizer["FAE_MSG_ADD_FAE_SUCCESS"];//"Thêm phiếu thu chi thành công !";
                            SendPushNotificationTracking("FEA_MSG_SEND", EnumHelper<FromSrcSendNotify>.GetDisplayValue(FromSrcSendNotify.FromFund));
                        }
                        else
                        {
                            msg.Error = true;
                            msg.Title = _stringLocalizer["FEA_MSG_TOTAL_COUPON"];//"Tổng phiếu con không được vượt quá phiếu cha";
                        }
                    }
                    else
                    {
                        var isplan = true;
                        var deadLine = !string.IsNullOrEmpty(data.DeadLine) ? DateTime.ParseExact(data.DeadLine, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                        if (deadLine <= DateTime.Now)
                        {
                            isplan = false;
                        }
                        var obj = new FundAccEntry
                        {
                            AetCode = data.AetCode,
                            AetDescription = data.AetDescription,
                            AetRelative = data.AetRelative,
                            AetRelativeType = data.AetRelativeType,
                            AetType = data.AetType,
                            CatCode = data.CatCode,
                            CreatedTime = DateTime.Now,
                            Currency = data.Currency,
                            DeadLine = deadLine,
                            IsDeleted = false,
                            Payer = data.Payer,
                            Receiptter = data.Receiptter,
                            Title = data.Title,
                            Total = data.Total,
                            Status = "",
                            StatusObject = data.StatusObject,
                            ListStatusObjectLog = listStatusObjLog,
                            GoogleMap = data.GoogleMap,
                            Address = data.Address,
                            IsPlan = isplan,
                            IsCompleted = isplan == true ? false : (data.AetType != "Receipt" ? false : true),
                            ObjType = data.ObjType,
                            ObjCode = data.ObjCode,
                            WorkflowCat = data.WorkflowCat
                        };
                        _context.FundAccEntrys.Add(obj);
                        _context.SaveChanges();
                        var entryTracking = new FundAccEntryTracking
                        {
                            AetCode = obj.AetCode,
                            CreatedBy = User.Identity.Name,
                            CreatedTime = DateTime.Now,
                            Action = data.StatusObject,
                            Note = obj.AetDescription
                        };
                        _context.FundAccEntryTrackings.Add(entryTracking);
                        _context.SaveChanges();

                        if (data.ListFileAccEntry.Count > 0)
                        {
                            foreach (var item in data.ListFileAccEntry)
                            {
                                var fundFile = new FundFiles
                                {
                                    AetCode = obj.AetCode,
                                    FileName = item.FileName,
                                    FilePath = item.FilePath,
                                    FileType = item.FileType,
                                    CreatedBy = User.Identity.Name,
                                    CreatedTime = DateTime.Now,
                                };
                                _context.FundFiless.Add(fundFile);
                            }
                            _context.SaveChanges();
                        }
                        var header = _context.FundAccEntrys.FirstOrDefault(x => !x.IsDeleted && x.AetCode.Equals(obj.AetCode));
                        //var detail = _context.FundAccEntrys.Where(x => !x.IsDeleted && x.AetCode.Equals(obj.AetCode)).ToList();
                        if (header != null)
                        {
                            var logData = new
                            {
                                Header = header,
                                //Detail = detail
                            };
                            var listLogData = new List<object>();
                            listLogData.Add(logData);

                            header.LogData = JsonConvert.SerializeObject(listLogData);

                            _context.FundAccEntrys.Update(header);
                            _context.SaveChanges();
                        }
                        msg.ID = header.Id;
                        msg.Title = _stringLocalizer["FAE_MSG_ADD_FAE_SUCCESS"];//"Thêm phiếu thu chi thành công !";
                        //SendPushNotificationTracking("FEA_MSG_SEND", EnumHelper<FromSrcSendNotify>.GetDisplayValue(FromSrcSendNotify.FromFund));
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _stringLocalizer["FAE_MSG_ADD_FAE_ERROR"];//"Có lỗi xảy ra khi thêm !";
            }
            return Json(msg);
        }

        [HttpPost]
        public void SendNotificationAfterAddAccEntry()
        {
            SendPushNotificationTracking("FEA_MSG_SEND",
                EnumHelper<FromSrcSendNotify>.GetDisplayValue(FromSrcSendNotify.FromFund));
        }

        [HttpPost]
        public object Update([FromBody] FundAccEntryModel data)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var userName = User.Identity.Name;

                var checkRole = _context.Users.FirstOrDefault(x => x.UserName.ToLower() == userName.ToLower());
                if (checkRole != null)
                {
                    var type = checkRole.UserType;
                    var role = string.Empty;
                    var userInGroup = _context.AdUserInGroups.FirstOrDefault(x => x.UserId == checkRole.Id && x.IsMain == true);
                    var obj = _context.FundAccEntrys.FirstOrDefault(x => !x.IsDeleted && x.AetCode.ToLower() == data.AetCode.ToLower());
                    if (userInGroup != null)
                    {
                        var roleId = userInGroup.RoleId;
                        var userRole = _context.Roles.FirstOrDefault(x => x.Id == roleId);
                        role = userRole?.Code;
                    }
                    var action = _context.FundAccEntryTrackings.Where(x => x.AetCode == data.AetCode).MaxBy(f => f.Id).Action;
                    if (!string.IsNullOrEmpty(action) && (action.Equals("FUND_APPROVED") || action.Equals("FUND_REFUSE")) && obj.IsDeleted == false && obj.IsPlan == false)
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["FAE_MSG_NOT_EDIT_FAE_APPROVAL"];//"Không được sửa phiếu thu chi đã được xét duyệt !";
                    }
                    else
                    {
                        if (obj != null)
                        {
                            //So sánh với số tiền phiếu cha (cùng loại thu/chi)
                            if (!string.IsNullOrEmpty(data.AetRelative))
                            {
                                var aetRelativeParent = _context.FundAccEntrys.FirstOrDefault(x => !x.IsDeleted && x.AetCode == data.AetRelative);
                                //nếu cùng loại thu/chi => kiểm tra xem phiếu cha đã có bao nhiêu phiếu con khác phiếu con chỉnh sửa => Tính ra số tiền cho phép còn lại
                                if (aetRelativeParent.AetType == data.AetType)
                                {
                                    var aetRelativeChild = _context.FundAccEntrys.Where(x => !x.IsDeleted && x.Id != obj.Id && x.AetRelative == data.AetRelative && x.AetType == aetRelativeParent.AetType);
                                    var totalChild = aetRelativeChild.Sum(x => x.Total);
                                    if (data.Total > aetRelativeParent.Total - totalChild)
                                    {
                                        msg.Error = true;
                                        //msg.Title = "Số tiền trên phiếu lớn hơn số tiền được phép thu/chi của phiếu cha";
                                        msg.Title = _stringLocalizer["FEA_MSG_MONEY_ON_ORDER"];
                                        return Json(msg);
                                    }
                                }
                            }

                            //So sánh với số tiền cần phải thu/chi của hợp đồng
                            if (!string.IsNullOrEmpty(data.ObjCode) && data.ObjType == "CONTRACT")
                            {
                                var contractPayment = _context.FundAccEntrys
                                                    .Where(x => !x.IsDeleted
                                                                && x.IsPlan == false
                                                                && x.ObjType == "CONTRACT"
                                                                && x.ObjCode == data.ObjCode
                                                                && (x.CatCode == "ADVANCE_CONTRACT" || x.CatCode == "PAY_CONTRACT")
                                                                && x.AetType == "Receipt"
                                                                );
                                var totalPayment = contractPayment.Sum(x => x.Total);
                                var contract = _context.PoSaleHeaders.FirstOrDefault(x => !x.IsDeleted && x.ContractCode == data.ObjCode);
                                var totalContract = contract.RealBudget;
                                if (data.Total > totalContract - totalPayment + obj.Total && data.AetType == "Receipt" && (data.CatCode == "ADVANCE_CONTRACT" || data.CatCode == "PAY_CONTRACT"))
                                {
                                    msg.Error = true;
                                    msg.Title = _stringLocalizer["FEA_MSG_UPDATE_MONEY_COUPON"];//"Số tiền trên phiếu thu lớn hơn số tiền cần phải thu của hợp đồng";
                                    return Json(msg);
                                }
                            }
                            //So sánh với số tiền của Dự án
                            if (!string.IsNullOrEmpty(data.ObjCode) && data.ObjType == "PROJECT")
                            {
                                var projectPayment = _context.FundAccEntrys
                                                    .Where(x => !x.IsDeleted
                                                                && x.IsPlan == false
                                                                && x.ObjType == "PROJECT"
                                                                && x.ObjCode == data.ObjCode
                                                                && (x.CatCode == data.CatCode)
                                                                && x.AetType == data.AetType
                                                                );
                                var totalPayment = projectPayment.Sum(x => x.Total);
                                var project = _context.Projects.FirstOrDefault(x => !x.FlagDeleted && x.ProjectCode == data.ObjCode);
                                var totalContract = Convert.ToDecimal(project.Budget);
                                if (data.Total > totalContract - totalPayment)
                                {
                                    msg.Error = true;
                                    msg.Title = _stringLocalizer["FEA_MSG_UPDATE_TOTAL_MONEY"];//"Số tiền trên phiếu lớn hơn số tiền của dự án";
                                    return Json(msg);
                                }
                            }
                            var total = _context.FundAccEntrys.Where(x => x.IsDeleted == false && x.IsPlan == false && x.IsCompleted == true && x.AetRelative == data.AetCode && x.AetType == data.AetType).Sum(x => x.Total);
                            if (total > 0)
                            {
                                if (total > data.Total)
                                {
                                    msg.Error = true;
                                    msg.Title = _stringLocalizer["FEA_MSG_UPDATE_TOTAL_COUPON"];//"Tổng phiếu con không được lớn hơn phiếu cha";
                                    return Json(msg);
                                }
                                if (total == data.Total)
                                {
                                    obj.IsCompleted = true;
                                }
                                else
                                {
                                    obj.IsCompleted = false;
                                }
                            }
                            var deadLine = !string.IsNullOrEmpty(data.DeadLine) ? DateTime.ParseExact(data.DeadLine, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                            if (deadLine <= DateTime.Now)
                            {
                                obj.IsPlan = false;
                            }
                            else
                            {
                                obj.IsPlan = true;
                            }

                            obj.AetCode = data.AetCode;
                            obj.AetDescription = data.AetDescription;
                            obj.AetRelative = data.AetRelative;
                            obj.AetRelativeType = data.AetRelativeType;
                            obj.AetType = data.AetType;
                            obj.CatCode = data.CatCode;
                            obj.UpdatedBy = User.Identity.Name;
                            obj.UpdatedTime = DateTime.Now;
                            obj.Currency = data.Currency;
                            obj.Payer = data.Payer;
                            obj.Receiptter = data.Receiptter;
                            obj.Title = data.Title;
                            obj.Total = data.Total;
                            obj.DeadLine = deadLine;
                            obj.GoogleMap = data.GoogleMap;
                            obj.Address = data.Address;
                            obj.ObjType = data.ObjType;
                            obj.ObjCode = data.ObjCode;
                            obj.StatusObject = data.StatusObject;

                            //var statusObjLog = new JsonLog
                            //{
                            //    Code = data.StatusObject,
                            //    Name = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(data.StatusObject)) != null ? _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(data.StatusObject)).ValueSet : "",
                            //    CreatedBy = _context.Users.FirstOrDefault(x => x.UserName.Equals(ESEIM.AppContext.UserName)).GivenName,
                            //    CreatedTime = DateTime.Now,
                            //};

                            //if (obj.ListStatusObjectLog.Count > 0)
                            //{
                            //    if (obj.ListStatusObjectLog.LastOrDefault()?.Code != data.StatusObject)
                            //        obj.ListStatusObjectLog.Add(statusObjLog);
                            //}
                            //else
                            //{
                            //    obj.ListStatusObjectLog.Add(statusObjLog);
                            //}

                            _context.FundAccEntrys.Update(obj);
                            _context.SaveChanges();

                            var updateTracking = false;
                            var objTracking = _context.FundAccEntryTrackings.LastOrDefault(x => x.AetCode.Equals(obj.AetCode));
                            if (objTracking != null)
                            {
                                if (objTracking.Action != data.StatusObject)
                                    updateTracking = true;
                            }

                            if (updateTracking)
                            {
                                var entryTracking = new FundAccEntryTracking
                                {
                                    AetCode = obj.AetCode,
                                    CreatedBy = User.Identity.Name,
                                    CreatedTime = DateTime.Now,
                                    Action = data.StatusObject,
                                    Note = obj.AetDescription
                                };
                                _context.FundAccEntryTrackings.Add(entryTracking);
                                //_context.SaveChanges();
                            }

                            if (data.ListFileAccEntry.Count > 0)
                            {
                                foreach (var item in data.ListFileAccEntry)
                                {
                                    var fundFileObj = _context.FundFiless.FirstOrDefault(x => x.Id == item.Id);
                                    if (fundFileObj == null)
                                    {
                                        var fundFile = new FundFiles
                                        {
                                            AetCode = obj.AetCode,
                                            FileName = item.FileName,
                                            FilePath = item.FilePath,
                                            FileType = item.FileType,
                                            CreatedBy = User.Identity.Name,
                                            CreatedTime = DateTime.Now,
                                        };

                                        _context.FundFiless.Add(fundFile);
                                    }
                                    //_context.SaveChanges();
                                }
                            }

                            if (data.ListFileAccEntryRemove.Count > 0)
                            {
                                foreach (var item in data.ListFileAccEntryRemove)
                                {
                                    var funFileRemove = _context.FundFiless.FirstOrDefault(x => x.Id == item.Id);
                                    if (funFileRemove != null)
                                        _context.FundFiless.Remove(funFileRemove);
                                }

                                //_context.SaveChanges();
                            }

                            _context.SaveChanges();
                            msg.Object = obj;
                            msg.Title = _stringLocalizer["FAE_MSG_UPDATE_SUCCESS"];//"Cập nhật phiếu thu chi thành công !";
                        }
                    }
                }
                var header = _context.FundAccEntrys.FirstOrDefault(x => !x.IsDeleted && x.AetCode.Equals(data.AetCode));
                if (header != null)
                {
                    var logData = new
                    {
                        Header = header,
                    };

                    var listLogData = new List<object>();

                    if (!string.IsNullOrEmpty(header.LogData))
                    {
                        listLogData = JsonConvert.DeserializeObject<List<object>>(header.LogData);
                        logData.Header.LogData = null;
                        listLogData.Add(logData);
                        header.LogData = JsonConvert.SerializeObject(listLogData);

                        _context.FundAccEntrys.Update(header);
                        _context.SaveChanges();
                    }
                    else
                    {
                        listLogData.Add(logData);

                        header.LogData = JsonConvert.SerializeObject(listLogData);

                        _context.FundAccEntrys.Update(header);
                        _context.SaveChanges();
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _stringLocalizer["FAE_MSG_UPDATE_FAIL"];//"Có lỗi xảy ra khi cập nhật!";
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetUpdateLog(string aetCode)
        {
            var msg = new JMessage();
            var data = _context.FundAccEntrys.FirstOrDefault(x => x.AetCode == aetCode && x.IsDeleted == false);
            if (data != null)
            {
                if (!string.IsNullOrEmpty(data.LogData))
                    msg.Object = data.LogData;
            }

            return Json(msg);
        }

        [HttpPost]
        public object GetAetRelativeChil(string aetCode)
        {
            var query = from a in _context.FundAccEntrys.Where(x => x.IsPlan == true && x.Title != null && x.AetCode == aetCode)
                        join b in _context.FundAccEntrys.Where(x => !x.IsDeleted && x.IsPlan == false && x.AetRelative != null && x.IsCompleted == true)
                        on a.AetCode equals b.AetRelative
                        where (!a.IsDeleted)
                        select new
                        {
                            b.Total,
                        };
            return query;
        }

        [HttpPost]
        public object GetListCurrency()
        {
            var data = _context.FundCurrencys.Where(x => x.IsDeleted == false).Select(a => new { Code = a.CurrencyCode, Name = a.CurrencyCode });
            return data;
        }
        [HttpPost]
        public object UpdatePlan()
        {
            var msg = new JMessage() { Error = false };
            var obj = _context.FundAccEntrys.Where(x => !x.IsDeleted && x.IsPlan == true && x.DeadLine.HasValue && x.DeadLine.Value.Date < DateTime.Now && x.Status == "FUND_APPROVED").ToArray();
            var count = obj.Count();
            if (count > 0)
            {
                foreach (var x in obj)
                {
                    if (x.DeadLine <= DateTime.Now)
                    {
                        x.IsPlan = false;
                        x.UpdatedTime = DateTime.Now;
                    }
                    _context.FundAccEntrys.Update(x);
                    _context.SaveChanges();
                }
                msg.Error = false;
                msg.Title = _stringLocalizer["FEA_MSG_UPDATE_PLAN "];//Có kế hoạch đã được chuyển thành phiếu
            }
            return Json(msg);
        }

        [HttpPost]
        public object Delete(int id)
        {
            var msg = new JMessage { Error = true };
            try
            {
                var data = _context.FundAccEntrys.FirstOrDefault(x => x.Id == id);

                //Nếu là phiếu cha thì thông báo không cho xóa => Xóa phiếu con trước
                var aetRelativeChild = _context.FundAccEntrys.Any(x => !x.IsDeleted && x.AetRelative == data.AetCode);
                if (aetRelativeChild)
                {
                    msg.Error = true;
                    //msg.Title = "Xóa phiếu con trước khi xóa phiếu cha.";
                    msg.Title = _stringLocalizer["FEA_MSG_DELETE_SEQUENCE"];
                    return Json(msg);
                }
                var session = HttpContext.GetSessionUser();
                var instance = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value &&
                                                                              x.ObjectType.Equals("FUND_ACC_ENTRY")
                                                                              && x.ObjectInst.Equals(
                                                                                  data.AetCode));
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

                data.DeletedBy = ESEIM.AppContext.UserName;
                data.DeletedTime = DateTime.Now;
                data.IsDeleted = true;
                _context.FundAccEntrys.Update(data);
                _context.SaveChanges();
                if (!string.IsNullOrEmpty(data.AetRelative))
                {
                    var obj = _context.FundAccEntrys.FirstOrDefault(x => x.IsDeleted == false && x.AetCode == data.AetRelative);
                    if (obj != null)
                    {
                        obj.IsCompleted = false;
                        _context.FundAccEntrys.Update(obj);
                        _context.SaveChanges();
                    }
                }

                msg.Error = false;
                msg.Title = _stringLocalizer["FAE_MSG_DELETE_SUCCESS"];//"Xóa thành công";
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _stringLocalizer["FAE_MSG_DELETE_ERROR"];//"Xóa thất bại";
                return Json(msg);
            }
        }

        [HttpGet]
        public ActionResult ExportExcel(string page, string row, string fromDatePara, string deadLine, string toDatePara, string title, string aetType, string total, string currency, string payer, string receiptter, string status, string isPlan, string orderBy)
        {
            int pageInt = int.Parse(page);
            int length = int.Parse(row);
            //Get data View
            //var listData = _context.FundAccEntrys.Where(x => x.IsPlan == false && x.IsDeleted == false).Select(x => new { x.Title, x.AetType, x.Total, x.Currency, x.Payer, x.Receiptter, x.Status }).OrderUsingSortExpression(orderBy).AsNoTracking().ToList();

            var fromDate = !string.IsNullOrEmpty(fromDatePara) ? DateTime.ParseExact(fromDatePara, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(toDatePara) ? DateTime.ParseExact(toDatePara, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            var listData = (from a in _context.FundAccEntrys
                            join b in _context.FundCatReptExpss.Where(x => x.IsDeleted == false)
                            on a.CatCode equals b.CatCode
                            where (!a.IsDeleted
                                      && ((fromDate == null) || (a.DeadLine.HasValue && a.DeadLine.Value.Date >= fromDate))
                                      && ((toDate == null) || (a.DeadLine.HasValue && a.DeadLine.Value.Date <= toDate)))
                                       && (string.IsNullOrEmpty(aetType) || (a.AetType.Equals(aetType)))
                                        && (string.IsNullOrEmpty(status) || (a.Status.Equals(status)))
                                        && (string.IsNullOrEmpty(isPlan) || (a.IsPlan.Equals(Convert.ToBoolean(isPlan))))
                            select new
                            {

                                CatName = b.CatName,
                                Id = a.Id,
                                DeadLine = a.DeadLine,
                                AetCode = a.AetCode,
                                Title = a.Title,
                                AetType = a.AetType,
                                AetRelativeType = a.AetRelativeType,
                                AetDescription = a.AetDescription,
                                Total = a.Total,
                                Payer = a.Payer,
                                Currency = a.Currency,
                                LastLog = a.ListStatusObjectLog.LastOrDefault(),
                                Receiptter = a.Receiptter
                            }).OrderUsingSortExpression(orderBy).AsNoTracking().ToList();
            var listExport = new List<FundAccEntryExportModel>();
            var no = 1;
            foreach (var item in listData)
            {
                var itemExport = new FundAccEntryExportModel();

                itemExport.No = no;
                itemExport.CatName = item.CatName;
                itemExport.DeadLine = item.DeadLine != null ? item.DeadLine.Value.ToString("dd/MM/yyyy") : "";
                itemExport.Title = item.Title;
                itemExport.AetType = item.AetType;
                itemExport.Total = item.Total;
                itemExport.Currency = item.Currency;
                itemExport.Payer = item.Payer;
                itemExport.Receiptter = item.Receiptter;
                itemExport.Status = item.LastLog != null ? (item.LastLog.ObjectRelative + " - " + item.LastLog.Name + " [ " +
                                                  item.LastLog.CreatedBy + " - " + item.LastLog.SCreatedTime + " ]") : "";


                //if (item.Status == "CREATED")
                //{
                //    itemExport.Status = "Khởi tạo";
                //}
                //else if (item.Status == "PENDING")
                //{
                //    itemExport.Status = "Đang chờ";
                //}
                //else if (item.Status == "FUND_APPROVED")
                //{
                //    itemExport.Status = "Đã duyệt";
                //}
                //else if (item.Status == "FUND_REFUSE")
                //{
                //    itemExport.Status = "Từ chối";
                //}
                //else
                //{
                //    itemExport.Status = "Hủy bỏ";
                //}

                if (item.AetType == "Receipt")
                {
                    itemExport.AetType = "Thu";
                }
                else if (item.AetType == "Expense")
                {
                    itemExport.AetType = "Chi";
                }
                //itemExport.LeaderIdea = item.LeaderIdea == "undefined" ? "Không ý kiến" : item.LeaderIdea;
                //itemExport.Percent = item.Percent.ToString();

                //if (item.Percent == 100)
                //{
                //    itemExport.Percent = "100%";
                //}
                //else if (item.Percent == 0)
                //{
                //    itemExport.Percent = "0%";
                //}
                //else
                //{
                //    itemExport.Percent = String.Format("{0:0.00}", item.Percent) + "%";
                //}
                no = no + 1;
                listExport.Add(itemExport);
            }

            ExcelEngine excelEngine = new ExcelEngine();
            IApplication application = excelEngine.Excel;
            application.DefaultVersion = ExcelVersion.Excel2016;
            IWorkbook workbook = application.Workbooks.Create(1);
            workbook.Version = ExcelVersion.Excel2016;
            IWorksheet sheetRequest = workbook.Worksheets.Create("PhieuThuChi");
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


            sheetRequest.Range["A1:J1"].Merge(true);

            sheetRequest.Range["A1"].Text = "Phiếu Thu/Chi";
            sheetRequest.Range["A1"].CellStyle.Font.FontName = "Calibri";
            sheetRequest.Range["A1"].CellStyle.Font.Bold = true;
            sheetRequest.Range["A1"].CellStyle.Font.Size = 24;
            sheetRequest.Range["A1"].CellStyle.Font.RGBColor = Color.FromArgb(0, 0, 176, 240);
            sheetRequest.Range["A1"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.ImportData(listExport, 2, 1, true);
            sheetRequest["F3:F" + (listExport.Count() + 2)].NumberFormat = "###,##";

            sheetRequest["A2"].Text = "TT";
            sheetRequest["B2"].Text = "Ngày Thu/Chi";
            sheetRequest["C2"].Text = "Tên danh mục";
            sheetRequest["D2"].Text = "Tiêu Đề";
            sheetRequest["E2"].Text = "Loại";
            sheetRequest["F2"].Text = "Số Tiền";
            sheetRequest["G2"].Text = "Loại Tiền";
            sheetRequest["H2"].Text = "Người Trả";
            sheetRequest["I2"].Text = "Người Nhận";
            sheetRequest["J2"].Text = "Trạng Thái";



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
            sheetRequest["A2:J2"].CellStyle = tableHeader;
            sheetRequest.Range["A2:J2"].RowHeight = 20;
            sheetRequest.UsedRange.AutofitColumns();

            string ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            var fileName = "ExportPhieuThuChi" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".xls";
            MemoryStream ms = new MemoryStream();
            workbook.SaveAs(ms);
            workbook.Close();
            excelEngine.Dispose();
            ms.Position = 0;
            return File(ms, ContentType, fileName);
        }

        public class ModelViewFund
        {
            public int Id { get; set; }
            public string CatName { get; set; }
            public string AetCode { get; set; }
            public string Title { get; set; }
            public string AetType { get; set; }
            public string AetRelativeType { get; set; }
            public string AetDescription { get; set; }
            public decimal Total { get; set; }
            public string Payer { get; set; }
            public string Currency { get; set; }
            public string Receiptter { get; set; }
            public DateTime? DeadLine { get; set; }
            public string Status { get; set; }
            public string StatusObject { get; set; }
            public int IsApprove { get; set; }
            public string TimeAlive { get; set; }
            public int IsOutTime { get; set; }
            public string LastAct { get; set; }
        }
        #endregion

        #region Combobox 

        [HttpPost]
        public object GetCurrency()
        {
            var data = _context.FundAccEntrys.Select(x => new { Currency = x.Currency }).AsNoTracking().ToList();
            return data;
        }

        [HttpPost]
        public object GetCatName()
        {
            var data = _context.FundCatReptExpss.Where(x => x.IsDeleted == false).Select(x => new { CatName = x.CatName, CatCode = x.CatCode }).AsNoTracking().ToList();
            //var data = _context.FundCatReptExpss.Where(x => x.IsDeleted == false).Select(x => new { CatCode = x.CatCode }).AsNoTracking().ToList();
            return data;
        }

        [HttpPost]
        public object GetAetRelative()
        {
            var data = _context.FundAccEntrys.Select(x => new { AetRelative = x.AetRelative }).AsNoTracking().ToList();
            return data;
        }
        [HttpPost]
        public object GetCurrencyDefaultPayment()
        {
            var data = _context.FundCurrencys.FirstOrDefault(x => x.IsDeleted == false && x.DefaultPayment == true);
            var obj = data == null ? "" : data.CurrencyCode;
            return obj;

        }
        [HttpPost]
        public object GetUser()
        {
            var query = _context.Users.Where(x => x.Active == true && x.UserType != 10).Select(x => new { x.Id, x.GivenName }).AsNoTracking().ToList();
            return query;
        }

        [HttpPost]
        public string GenAETCode(string type, string catCode)
        {
            var str = string.Empty;
            var idMax = 1;
            var obj = _context.FundAccEntrys.LastOrDefault();
            if (obj != null)
                idMax = obj.Id + 1;
            string userName;
            userName = User.Identity.Name;
            str = FileExtensions.CleanFileName(string.Format("AET.{0}_{1}_{2}_{3}_{4}", idMax, type, catCode, userName, DateTime.Now.ToString("yyyyMMdd")));
            return str;
        }

        [HttpPost]
        public object GetListTitle()
        {
            var data = _context.FundAccEntrys.Where(x => !x.IsDeleted && x.IsPlan == true && _context.FundAccEntryTrackings.Where(a => a.AetCode == x.AetCode).MaxBy(z => z.Id).Action == "FUND_APPROVED")
            .Select(x => new { Title = x.Title, Code = x.AetCode, Id = x.Id }).OrderByDescending(x => x.Id).AsNoTracking().ToList();
            //var data = (from a in _context.FundAccEntrys.Where(x => x.IsDeleted == false && x.IsPlan == true)
            //            join b in _context.FundAccEntryTrackings.Where(x => x.Action == "FUND_APPROVED").MaxBy(z => z.Id) on a.AetCode equals b.AetCode
            //            select new
            //            {
            //                Title = a.Title,
            //                Code = a.AetCode,
            //                Id = a.Id
            //            }).DistinctBy(x => x.Code).OrderByDescending(x => x.Id).ToList();
            return data;
        }

        [HttpPost]
        public object GetStatusObject()
        {
            var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals("STATUS_FUND")).Select(x => new { Code = x.CodeSet, Name = x.ValueSet }).ToList();
            return data;
        }

        [HttpPost]
        public object GetItem([FromBody] int id)
        {
            var isPermission = true;
            var isShow = true;
            var userName = User.Identity.Name;

            var checkRole = _context.Users.FirstOrDefault(x => x.UserName.ToLower() == userName.ToLower());
            if (checkRole != null)
            {
                var type = checkRole.UserType;
                var role = string.Empty;
                var userInGroup = _context.AdUserInGroups.FirstOrDefault(x => x.UserId == checkRole.Id && x.IsMain == true);
                if (userInGroup != null)
                {
                    var roleId = userInGroup.RoleId;
                    var userRole = _context.Roles.FirstOrDefault(x => x.Id == roleId);
                    role = userRole?.Code;
                }
                //if (type == 10 || role == "001")
                if (type == 10)
                {
                    isPermission = true;
                    isShow = false;
                }
            }
            var show = _context.FundAccEntrys.FirstOrDefault(x => x.Id == id);

            if (show.IsPlan == true)
            {
                isShow = false;

            }
            if (show.IsPlan == false && (_context.FundAccEntryTrackings.LastOrDefault(x => x.AetCode.Equals(show.AetCode)).Action == "FUND_APPROVED" || _context.FundAccEntryTrackings.LastOrDefault(x => x.AetCode.Equals(show.AetCode)).Action == "FUND_REFUSE"))
            {
                isShow = true;
            }

            var query = _context.FundAccEntrys.ToList();

            var session = HttpContext.Session;
            session.SetInt32("IdObject", id);

            var data = from a in query
                       where a.Id == id
                       select new
                       {
                           a.Id,
                           a.AetCode,
                           a.AetType,
                           a.Title,
                           a.CatCode,
                           a.AetRelative,
                           a.AetRelativeType,
                           a.AetDescription,
                           a.Total,
                           a.Payer,
                           a.Currency,
                           DeadLine = a.DeadLine != null ? a.DeadLine.Value.ToString("dd/MM/yyyy") : null,
                           a.IsPlan,
                           a.Status,
                           a.GoogleMap,
                           a.Address,
                           a.Receiptter,
                           Action = _context.FundAccEntryTrackings.Any(x => x.AetCode.Equals(a.AetCode))
                                    ? _context.FundAccEntryTrackings.LastOrDefault(x => x.AetCode.Equals(a.AetCode)).Action
                                    : null,
                           IsPermission = isPermission,
                           IsShow = isShow,
                           a.StatusObject,
                           a.ListStatusObjectLog,
                           a.ObjCode,
                           a.ObjType,
                           a.WorkflowCat
                       };
            return data;
        }

        #endregion

        #region Tracking

        [HttpPost]
        public JsonResult InsertAccEntryTracking(string aetCode, string status, string note, string aetRelative)
        {
            var msg = new JMessage { Error = false };
            try
            {
                var userName = User.Identity.Name;
                if (note == "undefined") note = "";

                var checkRole = _context.Users.FirstOrDefault(x => x.UserName.ToLower() == userName.ToLower());
                if (checkRole != null)
                {
                    var type = checkRole.UserType;
                    var userInGroup =
                        _context.AdUserInGroups.FirstOrDefault(x => x.UserId == checkRole.Id && x.IsMain == true);
                    if (userInGroup != null)
                    {
                        var roleId = userInGroup.RoleId;
                        var userRole = _context.Roles.FirstOrDefault(x => x.Id == roleId);
                    }

                    var plan = _context.FundAccEntrys.FirstOrDefault(x => x.AetCode == aetCode);
                    var @is = true;
                    if (plan?.IsPlan == false)
                        if (string.IsNullOrEmpty(aetRelative))
                        {
                            var sum = _context.FundAccEntrys.Where(x =>
                                x.IsPlan == false && x.IsDeleted == false && x.IsCompleted == true &&
                                x.AetRelative == aetRelative).Sum(x => x.Total) + _context.FundAccEntrys
                                .FirstOrDefault(x => x.AetCode == aetCode)?.Total;
                            if (sum > _context.FundAccEntrys.FirstOrDefault(x => x.AetCode == aetRelative)?.Total)
                                @is = false;
                        }

                    if (@is)
                    {
                        if (type == 10)
                        {
                            var entryTracking = new FundAccEntryTracking
                            {
                                AetCode = aetCode,
                                CreatedBy = User.Identity.Name,
                                CreatedTime = DateTime.Now,
                                Action = status,
                                Note = note
                            };
                            _context.FundAccEntryTrackings.Add(entryTracking);
                            _context.SaveChanges();

                            var obj = _context.FundAccEntrys.FirstOrDefault(x => x.AetCode.Equals(aetCode));
                            if (obj != null)
                            {
                                //if (obj.IsPlan == false)
                                //{
                                //    obj.IsCompleted = status == "FUND_APPROVED";
                                //}
                                //else
                                //{
                                //    obj.IsCompleted = false;
                                //}
                                obj.Status = "FUND_APPROVED";

                                _context.FundAccEntrys.Update(obj);
                                _context.SaveChanges();

                                var query = _context.FundAccEntrys.FirstOrDefault(x =>
                                    x.IsDeleted == false && x.AetCode == aetRelative);
                                if (query != null)
                                {
                                    var total = _context.FundAccEntrys.Where(x =>
                                        x.IsDeleted == false && x.IsPlan == false && x.IsCompleted == true &&
                                        x.AetRelative == aetRelative && x.AetType == query.AetType).Sum(x => x.Total);
                                    query.IsCompleted = total >= query.Total;
                                    _context.FundAccEntrys.Update(query);
                                    _context.SaveChanges();
                                }

                                var notify1 = (from a in _context.FundAccEntrys.Where(x =>
                                        x.IsDeleted == false && x.IsPlan == false && x.AetType == obj.AetType)
                                               join b in _context.FundAccEntryTrackings.Where(x =>
                                                       x.IsDeleted == false && x.Action == "FUND_APPROVED")
                                                   on a.AetCode equals b.AetCode
                                               select new
                                               {
                                                   a.CatCode,
                                                   a.AetType,
                                                   a.AetCode,
                                                   a.DeadLine,
                                                   a.Payer,
                                                   a.Receiptter,
                                                   a.Total
                                               }).ToList();
                                var notify2 = (from a in notify1.Where(x => x.CatCode == obj.CatCode)
                                               join b in _context.ParamForWarnings.Where(x =>
                                                       x.isDeleted == false && x.aetType == obj.AetType &&
                                                       x.catCode == obj.CatCode)
                                                   on a.CatCode equals b.catCode
                                               where a.DeadLine >= b.fromTime && a.DeadLine <= b.toTime
                                               group a by new { a.CatCode, a.AetType }
                                    into list
                                               orderby list.Key.CatCode
                                               select new
                                               {
                                                   list,
                                                   total = list.Sum(x => x.Total),
                                                   catCode = list.Key.CatCode,
                                                   aetType = list.Key.AetType,
                                                   maxDate = list.Max(x => x.DeadLine),
                                                   minDate = list.Min(x => x.DeadLine)
                                               }).ToList();
                                var queryNotify = (from a in notify2.Where(x => x.aetType == obj.AetType)
                                                   join b in _context.ParamForWarnings.Where(x =>
                                                           x.isDeleted == false && x.aetType == obj.AetType)
                                                       on a.catCode equals b.catCode
                                                   where a.maxDate <= b.toTime && a.minDate >= b.fromTime && a.total >= b.total
                                                   select new
                                                   {
                                                       b.id,
                                                       maxTotal = b.total,
                                                       fromDate = b.fromTime,
                                                       toDate = b.toTime,
                                                       b.aetType,
                                                       b.catCode,
                                                       b.currency,
                                                       a.total
                                                   }).ToList();
                                var count = queryNotify.Count();
                                if (count > 0)
                                    SendPushNotificationTracking("Có một phiếu thu chi vượt hạn mức",
                                        EnumHelper<FromSrcSendNotify>.GetDisplayValue(FromSrcSendNotify.FromFund));
                            }

                            //msg.Title = "Cập nhật trạng thái thành công !";
                            msg.Title = _stringLocalizer["FEA_MSG_UPDATE_STATUS_SUCCESS"];
                            SendPushNotificationTracking("Có phiếu thu / chi đã được duyệt",
                                EnumHelper<FromSrcSendNotify>.GetDisplayValue(FromSrcSendNotify.FromFund));
                        }
                        else
                        {
                            msg.Error = true;
                            //msg.Title = "Bạn không có quyền để thực hiện nghiệp vụ này !";
                            msg.Title = _stringLocalizer["FAE_MSG_RIGHT_TO_DO_MISSION"];
                        }
                    }
                    //if (type == 10 || role == "001")
                    else
                    {
                        msg.Error = true;
                        //msg.Title = "Tổng phiếu con không được lớn hơn phiếu cha";
                        msg.Title = _stringLocalizer["FAE_MSG_SUM_CHILD_PAPER"];
                    }
                }
                else
                {
                    //msg.Title = "Thêm phiếu thu chi thành công !";
                    msg.Title = _stringLocalizer["FAE_MSG_ADD_FAE_SUCCESS"];
                    SendPushNotificationTracking("Có phiếu thu / chi mới được thêm",
                        EnumHelper<FromSrcSendNotify>.GetDisplayValue(FromSrcSendNotify.FromFund));
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi xảy ra khi thêm !";
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }

            return Json(msg);
        }

        [HttpGet]
        public JsonResult GetAccTrackingDetail(string aetCode)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var obj = (from a in _context.FundAccEntryTrackings
                           where a.IsDeleted == false && a.AetCode.Equals(aetCode)
                           select new
                           {
                               a.Id,
                               a.Action,
                               a.AetCode,
                               a.FromDevice,
                               a.LocationGps,
                               a.LocationText,
                               a.Note,
                               a.IsDeleted,
                               a.CreatedBy,
                               CreatedTime = a.CreatedTime != null ? a.CreatedTime.Value.ToString("dd/MM/yyyy") : null,
                           }).ToList();

                msg.Object = obj;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi xảy ra khi lấy thông tin!";
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }
        #endregion

        #region File
        [HttpPost]
        public object GetListFundFiles(string aetCode)
        {
            try
            {
                var query = _context.FundFiless.Where(x => x.AetCode.Equals(aetCode) && x.IsDeleted == false).ToList();

                return Json(query);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }           //ListFile

        [HttpPost]
        public JsonResult UploadFile(IFormFile file)
        {
            var msg = new JMessage();
            try
            {
                if (file != null)
                {
                    if (file != null && file.Length > 0)
                    {
                        var url = string.Empty;
                        var pathUpload = Path.Combine(_hostingEnvironment.WebRootPath, "uploads\\files");
                        if (!Directory.Exists(pathUpload)) Directory.CreateDirectory(pathUpload);
                        var fileName = Path.GetFileName(file.FileName);
                        fileName = Path.GetFileNameWithoutExtension(fileName)
                         + "_"
                         + Guid.NewGuid().ToString().Substring(0, 8)
                         + Path.GetExtension(fileName);
                        var filePath = Path.Combine(pathUpload, fileName);
                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            file.CopyTo(stream);
                        }
                        url = "/uploads/files/" + fileName;

                        var fileUpload = new FundFile
                        {
                            FileName = fileName,
                            FilePath = url,
                            FileType = string.Concat(".", file.FileName.Split('.')[1]),
                            ContentType = file.ContentType
                        };
                        msg.Object = fileUpload;
                    }

                    msg.Error = false;
                    msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], "Tệp tin");
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_MSG_EXITS"], "Tệp tin");
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = String.Format(_sharedResources["COM_ERR_ADD"));
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }            //Uploadfile

        [HttpPost]
        public JMessage RemoveFundFile(int? Id)
        {
            var msg = new JMessage();
            try
            {
                if (Id != null)
                {
                    var file = _context.FundFiless.FirstOrDefault(x => x.Id == Id);
                    _context.FundFiless.Remove(file);

                    //var fileReq = _context.EDMSReqFiles.FirstOrDefault(x => x.FileId == fileId);
                    //_context.EDMSReqFiles.Remove(fileReq);

                    _context.SaveChanges();

                    msg.Error = false;
                    msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], "Tệp tin");
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_FAIL"], "Tệp tin");
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = String.Format(_sharedResources["COM_ERR_ADD"));
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return msg;
        }             //Remove

        [NonAction]
        public async Task<JsonResult> SendPushNotificationTracking(string message, string fromSrc)
        {
            var msg = new JMessage() { Error = false };

            var query = (from a in _context.FcmTokens
                         join b in _context.Users on a.UserId equals b.Id
                         where a.AppCode == "SMARTWORK"
                         select new DeviceFcm
                         {
                             Token = a.Token,
                             Device = a.Device,
                             UserId = a.UserId
                         }).AsNoTracking().Select(y => new DeviceFcm { Token = y.Token, Device = y.Device, UserId = y.UserId });

            if (query.Any())
            {
                var countToken = query.Count();
                if (countToken > 100000)
                {
                    int countPush = (query.Count() / 100000) + 1;
                    for (int i = 0; i < countPush; i++)
                    {
                        List<DeviceFcm> listDevices = query.Skip(i * 1000).Take(100000).AsNoTracking().ToList();
                        var sendNotication = await _notification.SendNotification("Khẩn cấp", message, listDevices, null, fromSrc, ESEIM.AppContext.UserName);
                    }
                }
                else
                {
                    var sendNotication = await _notification.SendNotification("Khẩn cấp", message, query.ToList(), null, fromSrc, ESEIM.AppContext.UserName);
                }
            }
            else
            {
                msg.Error = true;
                //msg.Title = "Chưa có tài khoản nào đăng nhập!";
                msg.Title = _stringLocalizer["FAE_MSG_NO_ACCOUNT_SIGN_IN"];
            }

            return Json(msg);
        }
        #endregion

        #region Dependency Fun
        [HttpPost]
        public JsonResult SetObjectRelative([FromBody] dynamic data)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                string aetCode = data.AetCode.Value;
                for (int i = 0; i < data.ListDeletedDependency.Count; i++)
                {
                    int idDeleted = data.ListDeletedDependency[i].Value != null ? Convert.ToInt32(data.ListDeletedDependency[i].Value) : 0;
                    if (idDeleted > 0)
                    {
                        var currentData = _context.FundRelativeObjMngs.FirstOrDefault(x => x.Id.Equals(idDeleted));
                        if (currentData != null)
                        {
                            _context.FundRelativeObjMngs.Remove(currentData);
                            _context.SaveChanges();
                        }
                    }
                }
                if (data.ListDependency.Count > 0)
                {
                    for (int i = 0; i < data.ListDependency.Count; i++)
                    {
                        int id = data.ListDependency[i].Id.Value != null ? Convert.ToInt32(data.ListDependency[i].Id.Value) : 0;
                        if (id < 0)
                        {
                            string objCode = data.ListDependency[i].ObjCode.Value;
                            string dependency = data.ListDependency[i].ObjType.Value;
                            string relative = data.ListDependency[i].Relative.Value;
                            var fundForObj = new FundRelativeObjMng()
                            {
                                ObjType = dependency,
                                ObjCode = objCode,
                                Relative = relative,
                                TickRecptPayCode = data.AetCode,


                                //ProjectCode = (dependency == EnumHelper<ProjectEnum>.GetDisplayValue(ProjectEnum.Project)) ? objCode : null,
                                //ContractCode = (dependency == EnumHelper<ContractEnum>.GetDisplayValue(ContractEnum.Contract)) ? objCode : null,
                                //CustomerCode = (dependency == EnumHelper<CustomerEnum>.GetDisplayValue(CustomerEnum.Customer)) ? objCode : null,
                                //SupplierCode = (dependency == EnumHelper<SupplierEnum>.GetDisplayValue(SupplierEnum.Supplier)) ? objCode : null,
                                //Relative = relative,
                                //CreatedBy = ESEIM.AppContext.UserName,
                                //CreatedTime = DateTime.Now,
                            };
                            _context.FundRelativeObjMngs.Add(fundForObj);
                            //_context.CardMappings.Add(cardForObj);
                            _context.SaveChanges();
                        }
                    }
                }
                msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer[""]);//"Cập nhật thành công";
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_FAILED"], _stringLocalizer[""]);//"Có lỗi xảy ra!";
                return Json(msg);
            }
        }

        [HttpPost]
        public object CheckPlan(string aetCode)
        {
            var data = _context.FundAccEntrys.FirstOrDefault(x => x.IsDeleted == false && x.AetCode == aetCode);

            var obj = new
            {
                Currency = data.Currency,
                IsPlan = data.IsPlan,
                AetTye = data.AetType,

            };
            return obj;
        }

        [HttpPost]
        public JsonResult GetObjectRelative(string AetCode)
        {
            var data = _context.FundRelativeObjMngs.Where(x => x.TickRecptPayCode.Equals(AetCode)).Select(x => new
            {
                Id = x.Id,
                CatObjCode = x.ObjType.Equals("PROJECT") ? EnumHelper<ProjectEnum>.GetDisplayValue(ProjectEnum.Project) :
                x.ObjType.Equals("CONTRACT") ? EnumHelper<ContractEnum>.GetDisplayValue(ContractEnum.Contract) :
                x.ObjType.Equals("CUSTOMER") ? EnumHelper<CustomerEnum>.GetDisplayValue(CustomerEnum.Customer) :
                EnumHelper<SupplierEnum>.GetDisplayValue(SupplierEnum.Supplier),
                CatObjName = x.ObjType.Equals("CONTRACT") ? ProjectEnum.Project.DescriptionAttr() :
                x.ObjType.Equals("CONTRACT") ? ContractEnum.Contract.DescriptionAttr() :
                x.ObjType.Equals("CUSTOMER") ? CustomerEnum.Customer.DescriptionAttr() :
                SupplierEnum.Supplier.DescriptionAttr(),
                ObjCode = x.ObjCode,
                Relative = x.Relative,
                ObjName = x.ObjType.Equals("PROJECT") ? _context.Projects.FirstOrDefault(a => a.ProjectCode == x.ObjCode).ProjectTitle :
                x.ObjType.Equals("CONTRACT") ? _context.PoSaleHeaders.FirstOrDefault(a => a.ContractCode == x.ObjCode).Title :
                x.ObjType.Equals("CUSTOMER") ? _context.Customerss.FirstOrDefault(a => a.CusCode == x.ObjCode).CusName :
                 _context.Suppliers.FirstOrDefault(a => a.SupCode == x.ObjCode).SupName,
                RelativeName = _context.CommonSettings.FirstOrDefault(y => y.CodeSet == x.Relative).ValueSet ?? "",
                TickRecptPayCode = x.TickRecptPayCode

            }).AsNoTracking().ToList();
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetObjDependencyFund()
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

            var poSupplier = new Properties
            {
                Code = EnumHelper<PoSupplierEnum>.GetDisplayValue(PoSupplierEnum.PoSupplier),
                Name = PoSupplierEnum.PoSupplier.DescriptionAttr()
            };
            list.Add(poSupplier);

            return Json(list);
        }

        [NonAction]
        public string GetObjectRelativeName(string objCode, string objType)
        {
            var result = "";
            if (objType == EnumHelper<ProjectEnum>.GetDisplayValue(ProjectEnum.Project))
            {
                result = _context.Projects.FirstOrDefault(x => x.ProjectCode == objCode)?.ProjectTitle;
            }
            else if (objType == EnumHelper<ContractEnum>.GetDisplayValue(ContractEnum.Contract))
            {
                result = _context.PoSaleHeaders.FirstOrDefault(x => x.ContractCode == objCode)?.Title;
            }
            else if (objType == EnumHelper<CustomerEnum>.GetDisplayValue(CustomerEnum.Customer))
            {
                result = _context.Customerss.FirstOrDefault(x => x.CusCode == objCode)?.CusName;
            }
            else if (objType == EnumHelper<SupplierEnum>.GetDisplayValue(SupplierEnum.Supplier))
            {
                result = _context.Suppliers.FirstOrDefault(x => x.SupCode == objCode)?.SupName;
            }
            return result;
        }

        [HttpPost]
        public JsonResult GetRelative()
        {
            var data = _context.CommonSettings.Where(x => x.Group.Equals(EnumHelper<FundEnum>.GetDisplayValue(FundEnum.FundRelative)) && x.IsDeleted == false)
                            .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return Json(data);
        }
        #endregion

        #region Workflow
        [HttpPost]
        public JsonResult GetLogStatus(string code)
        {
            var project = _context.FundAccEntrys.FirstOrDefault(x => x.AetCode.Equals(code) && !x.IsDeleted);
            return Json(project);
        }


        [HttpPost]
        public object GetItemHeaderWithCode(string code)
        {
            List<ComboxModel> list = new List<ComboxModel>();
            var data = _context.FundAccEntrys.FirstOrDefault(x => x.AetCode.Equals(code) && !x.IsDeleted);
            var check = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value && x.ObjectInst.Equals(data.AetCode)
                && x.ObjectType.Equals("FUND_ACC_ENTRY"));
            if (check != null)
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
            var data = _context.FundAccEntrys.Where(x => !x.IsDeleted && x.AetCode.Equals(code)).Select(x => new
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
        public object GetItemHeader(int id)
        {
            List<ComboxModel> list = new List<ComboxModel>();
            var data = _context.FundAccEntrys.FirstOrDefault(x => x.Id == id && !x.IsDeleted);
            var check = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value && x.ObjectInst.Equals(data.AetCode)
                        && x.ObjectType.Equals("FUND_ACC_ENTRY"));
            if (check != null)
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
        public object GetItemTemp(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var list = new List<ComboxModel>();
                var data = _context.FundAccEntrys.FirstOrDefault(x => x.Id == id && !x.IsDeleted);
                if (data == null)
                {
                    msg.Error = true;
                    msg.Title = "Phiếu/thu chi không tồn tại";
                    return Json(msg);
                }

                var wf = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value && x.ObjectInst.Equals(data.AetCode)
                            && x.ObjectType.Equals("FUND_ACC_ENTRY"));
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

        [HttpPost]
        public object GetListRepeat(string code)
        {
            List<ComboxModel> list = new List<ComboxModel>();
            var data = _context.FundAccEntrys.FirstOrDefault(x => x.AetCode.Equals(code) && !x.IsDeleted);
            var check = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value && x.ObjectInst.Equals(data.AetCode) && x.ObjectType.Equals("FUND_ACC_ENTRY"));
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

        [HttpPost]
        public JsonResult GetWorkflowByType(string type)
        {
            if (type.Equals("Receipt"))
            {
                var data = _context.WorkFlows.Where(x => !x.IsDeleted.Value && x.WfGroup.Equals(EnumHelper<EnumWfGroup>.GetDisplayValue(EnumWfGroup.Receipt)))
                .Select(x => new { Code = x.WfCode, Name = x.WfName });
                return Json(data);
            }
            else
            {
                var data = _context.WorkFlows.Where(x => !x.IsDeleted.Value && x.WfGroup.Equals(EnumHelper<EnumWfGroup>.GetDisplayValue(EnumWfGroup.Payment)))
                .Select(x => new { Code = x.WfCode, Name = x.WfName });
                return Json(data);
            }
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

        #region Count fund ticket
        [HttpPost]
        public JsonResult GetCountFund()
        {
            var session = HttpContext.GetSessionUser();
            var count = 0;
            var funds = _context.FundAccEntrys.Where(x => !x.IsDeleted);
            //foreach (var fund in funds)
            //{
            //    var lstStatus = JsonConvert.DeserializeObject<List<JsonStatus>>(fund.Status);
            //    if (lstStatus.Count > 0)
            //    {
            //        if (lstStatus[lstStatus.Count - 1].StatusCode == "FINAL_DONE")
            //        {
            //            count = count - 1;
            //        }
            //    }
            //}

            return Json(funds.Count() + count);
        }

        #endregion

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerCard.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_workflowActivityController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_sharedResourcesCom.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_repoController.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion

        public class FundAccEntrysJtableModel
        {
            public int Id { get; set; }
            public string AetCode { get; set; }
            public string Title { get; set; }
            public string AetType { get; set; }
            public string AetDescription { get; set; }
            public bool? IsPlan { get; set; }
            public bool? IsCompleted { get; set; }
            public string CatCode { get; set; }
            public DateTime? DeadLine { get; set; }
            public string AetRelative { get; set; }
            public string AetRelativeType { get; set; }
            public string Payer { get; set; }
            public string Receiptter { get; set; }
            public decimal Total { get; set; }
            public string Currency { get; set; }
            public string Status { get; set; }
            //public int ActivityId { get; set; }
            //public string ActCode { get; set; }
            //public string ActTitle { get; set; }
            //public string ActType { get; set; }
            //public string ActNote { get; set; }
            //public string ActMember { get; set; }
        }
        public class JTableModelAct : JTableModel
        {
            public int Id { get; set; }
            public string AetCode { get; set; }
            public string Title { get; set; }
            public string AetType { get; set; }
            public string AetDescription { get; set; }
            public string IsPlan { get; set; }
            public string IsCompleted { get; set; }
            public string CatCode { get; set; }
            public DateTime? DeadLine { get; set; }
            public string AetRelative { get; set; }
            public string AetRelativeType { get; set; }
            public string Payer { get; set; }
            public string Receiptter { get; set; }
            public decimal Total { get; set; }
            public string Currency { get; set; }
            public string Status { get; set; }
            public string FromTime { get; set; }
            public string ToTime { get; set; }

        }
        public class JTableModelFile : JTableModel
        {
            public int Id { get; set; }
            public string FileCode { get; set; }
            public string FileName { get; set; }
            public string FileType { get; set; }
            public string FileSize { get; set; }
            public string Description { get; set; }
            public string AetCode { get; set; }
        }
    }
}