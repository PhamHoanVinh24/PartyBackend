using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Caching.Memory;
using System.IO;
using Syncfusion.EJ2.PdfViewer;
using Newtonsoft.Json;
using System.Drawing;
//using SautinSoft;
using Syncfusion.EJ2.Spreadsheet;
using Syncfusion.XlsIO;
using Microsoft.AspNetCore.Http.Internal;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Cors;
using ESEIM.Models;
using ESEIM.Utils;
using ESEIM;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;

namespace III.Admin.Controllers
{
    public class DashBoardBuyerController : Controller
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
        private object _sharedResources;

        //var session = HttpContext.GetSessionUser();

        public DashBoardBuyerController(IOptions<AppSettings> appSettings, EIMDBContext context, UserManager<AspNetUser> userManager, RoleManager<AspNetRole> roleManager, IActionLogService actionLog, IHostingEnvironment hostingEnvironment, IUploadService uploadService, IFCMPushNotification notification, IGoogleApiService googleAPI)
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
            return View();
        }

        #region combobox
        [HttpGet]
        public JsonResult GetObjTypeJC()
        {
            var data = _context.Transitions.Where(x => !x.IsDeleted)
                .Select(x => new { Code = x.TrsCode, Name = x.TrsTitle });
            return Json(data);
        }
        #endregion

        #region Notification
        [HttpPost]
        public object JTable([FromBody] ProjectManagementJtable jTablePara)
        {
            var session = HttpContext.GetSessionUser();
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = (from a in _context.WORKOSCards.Where(x => !x.IsDeleted && x.Status != "TRASH" && x.Status != "CANCLED")
                         join b in _context.WORKOSLists.Where(x => !x.IsDeleted) on a.ListCode equals b.ListCode
                         join c in _context.WORKOSBoards.Where(x => !x.IsDeleted) on b.BoardCode equals c.BoardCode
                         join d in _context.CardMappings on a.CardCode equals d.CardCode
                         join e in _context.JcObjectIdRelatives.Where(x => !x.IsDeleted) on a.CardCode equals e.CardCode into e1
                         from e2 in e1.DefaultIfEmpty()
                         where (d.UserId == session.UserId) || (a.CreatedBy == session.UserName) &&
                         a.CreatedDate.Date == DateTime.Now.Date
                         select new CardNotifi
                         {
                             CardID = a.CardID,
                             CardCode = a.CardCode,
                             CardName = a.CardName,
                             BeginTime = a.BeginTime,
                             EndTime = a.EndTime,
                             ListUserView = a.ListUserView,
                             ListName = b.ListName,
                             BoardName = c.BoardName,
                             UpdatedTimeTxt = a.UpdatedTime.HasValue ? a.UpdatedTime.Value.ToString("dd/MM/yyyy HH:mm:ss") : "",
                             WorkType = !string.IsNullOrEmpty(a.WorkType) ? _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.WorkType).ValueSet : "",
                             Priority = !string.IsNullOrEmpty(a.CardLevel) ? _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.CardLevel).ValueSet : "",
                             Status = _context.CommonSettings.FirstOrDefault(x => x.CodeSet == a.Status && !x.IsDeleted).ValueSet,
                             ProjectName = e2.ObjTypeCode == "PROJECT" ? _context.Projects.FirstOrDefault(x => !x.FlagDeleted && x.ProjectCode == e2.ObjID).ProjectTitle : "",
                             ContractName = e2.ObjTypeCode == "CONTRACT" ? _context.PoSaleHeaders.FirstOrDefault(x => !x.IsDeleted && x.ContractCode == e2.ObjID).Title : "",
                         }).DistinctBy(x => x.CardCode).OrderByDescending(x => x.CardID);
            var listCard = new List<CardNotifi>();
            foreach (var item in query)
            {
                if (string.IsNullOrEmpty(item.ListUserView) || (!string.IsNullOrEmpty(item.ListUserView) && !item.ListUserView.Contains(session.UserId)))
                {
                    listCard.Add(item);
                }
            }
            var data = listCard.Skip(intBeginFor).Take(jTablePara.Length).ToList();
            var count = listCard.Count();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "CardID", "CardCode", "CardName", "Status",
                "BeginTime", "EndTime", "ListName", "BoardName", "ProjectName", "ContractName", "UpdatedTimeTxt", "WorkType", "Priority");
            return Json(jdata);
        }

        [HttpPost]
        public JsonResult JtableAsset([FromBody] AssetJtable jTablePara)
        {
            var session = HttpContext.GetSessionUser();
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = (from a in _context.AssetAllocateHeaders.Where(x => !x.IsDeleted && x.Status == "ASSET_CREATE")
                         join b in _context.WorkflowActivityRoles.Where(x => !x.IsDeleted && x.Role == session.RoleCode
                         && x.BranchCode == session.BranchId && session.ListDepartment.Any(k => k == x.DepartCode)) on a.ObjActCode equals b.WorkFlowCode
                         select new
                         {
                             ID = a.ID,
                             Code = a.TicketCode,
                             Name = a.Title,
                             Status = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.Status).ValueSet,
                             TypeCode = "ALLOCATE",
                             TypeName = "Phiếu cấp phát tài sản"
                         }).Union(
                from a in _context.AssetLiquidationHeaders.Where(x => !x.IsDeleted && x.Status == "ASSET_CREATE")
                join b in _context.WorkflowActivityRoles.Where(x => !x.IsDeleted && x.Role == session.RoleCode
                && x.BranchCode == session.BranchId && session.ListDepartment.Any(k => k == x.DepartCode)) on a.ObjActCode equals b.WorkFlowCode
                select new
                {
                    ID = a.ID,
                    Code = a.TicketCode,
                    Name = a.Title,
                    Status = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.Status).ValueSet,
                    TypeCode = "LIQUIDATION",
                    TypeName = "Phiếu thu hồi tài sản"
                }).Union(
                from a in _context.AssetBuyHeaders.Where(x => !x.IsDeleted && x.Status == "ASSET_CREATE")
                join b in _context.WorkflowActivityRoles.Where(x => !x.IsDeleted && x.Role == session.RoleCode
                && x.BranchCode == session.BranchId && session.ListDepartment.Any(k => k == x.DepartCode)) on a.ObjActCode equals b.WorkFlowCode
                select new
                {
                    ID = a.ID,
                    Code = a.TicketCode,
                    Name = a.Title,
                    Status = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.Status).ValueSet,
                    TypeCode = "BUY",
                    TypeName = "Phiếu mua sắm tài sản"
                }).Union(
                from a in _context.AssetInventoryHeaders.Where(x => !x.IsDeleted && x.Status == "ASSET_CREATE")
                join b in _context.WorkflowActivityRoles.Where(x => !x.IsDeleted && x.Role == session.RoleCode
                && x.BranchCode == session.BranchId && session.ListDepartment.Any(k => k == x.DepartCode)) on a.ObjActCode equals b.WorkFlowCode
                select new
                {
                    ID = a.AssetID,
                    Code = a.TicketCode,
                    Name = a.Title,
                    Status = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.Status).ValueSet,
                    TypeCode = "INVENTORY",
                    TypeName = "Phiếu kiểm kê tài sản"
                }).Union(
                from a in _context.AssetTransferHeaders.Where(x => !x.IsDeleted && x.Status == "ASSET_CREATE")
                join b in _context.WorkflowActivityRoles.Where(x => !x.IsDeleted && x.Role == session.RoleCode
                && x.BranchCode == session.BranchId && session.ListDepartment.Any(k => k == x.DepartCode)) on a.ObjActCode equals b.WorkFlowCode
                select new
                {
                    ID = a.AssetID,
                    Code = a.Ticketcode,
                    Name = a.Ticket,
                    Status = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.Status).ValueSet,
                    TypeCode = "TRANSFER",
                    TypeName = "Phiếu điều chuyển tài sản"
                }).Union(
                from a in _context.AssetRPTBrokenHeaders.Where(x => !x.IsDeleted && x.AssetStatus == "ASSET_CREATE")
                join b in _context.WorkflowActivityRoles.Where(x => !x.IsDeleted && x.Role == session.RoleCode
                && x.BranchCode == session.BranchId && session.ListDepartment.Any(k => k == x.DepartCode)) on a.ObjActCode equals b.WorkFlowCode
                select new
                {
                    ID = a.AssetID,
                    Code = a.TicketCode,
                    Name = a.Ticket,
                    Status = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.AssetStatus).ValueSet,
                    TypeCode = "RPTBROKEN",
                    TypeName = "Phiếu báo mất/hỏng tài sản"
                }).Union(
                from a in _context.AssetRqMaintenanceRepairHeaders.Where(x => !x.IsDeleted && x.Status == "ASSET_CREATE")
                join b in _context.WorkflowActivityRoles.Where(x => !x.IsDeleted && x.Role == session.RoleCode
                && x.BranchCode == session.BranchId && session.ListDepartment.Any(k => k == x.DepartCode)) on a.ObjActCode equals b.WorkFlowCode
                select new
                {
                    ID = a.ID,
                    Code = a.TicketCode,
                    Name = a.Title,
                    Status = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.Status).ValueSet,
                    TypeCode = "RQMAINTENACE_REPAIR",
                    TypeName = "Phiếu yêu cầu SCBD"
                }).Union(
                from a in _context.AssetRecalledHeaders.Where(x => !x.IsDeleted && x.Status == "ASSET_CREATE")
                join b in _context.WorkflowActivityRoles.Where(x => !x.IsDeleted && x.Role == session.RoleCode
                && x.BranchCode == session.BranchId && session.ListDepartment.Any(k => k == x.DepartCode)) on a.ObjActCode equals b.WorkFlowCode
                select new
                {
                    ID = a.ID,
                    Code = a.TicketCode,
                    Name = a.Title,
                    Status = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.Status).ValueSet,
                    TypeCode = "RECALLED",
                    TypeName = "Phiếu thu hồi tài sản"
                }).Union(
                from a in _context.AssetMaintenanceHeaders.Where(x => !x.IsDeleted && x.Status == "ASSET_CREATE")
                join b in _context.WorkflowActivityRoles.Where(x => !x.IsDeleted && x.Role == session.RoleCode
                && x.BranchCode == session.BranchId && session.ListDepartment.Any(k => k == x.DepartCode)) on a.ObjActCode equals b.WorkFlowCode
                select new
                {
                    ID = a.TicketID,
                    Code = a.TicketCode,
                    Name = a.Title,
                    Status = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.Status).ValueSet,
                    TypeCode = "MAINTENANCE",
                    TypeName = "Phiếu sửa chữa tài sản"
                }).Union(
                from a in _context.AssetCancelHeaders.Where(x => !x.IsDeleted && x.Status == "ASSET_CREATE")
                join b in _context.WorkflowActivityRoles.Where(x => !x.IsDeleted && x.Role == session.RoleCode
                && x.BranchCode == session.BranchId && session.ListDepartment.Any(k => k == x.DepartCode)) on a.ObjActCode equals b.WorkFlowCode
                select new
                {
                    ID = a.AssetID,
                    Code = a.TicketCode,
                    Name = a.Title,
                    Status = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.Status).ValueSet,
                    TypeCode = "CANCLED",
                    TypeName = "Phiếu hủy tài sản"
                }).Union(
                from a in _context.AssetImprovementHeaders.Where(x => !x.IsDeleted && x.Status == "ASSET_CREATE")
                join b in _context.WorkflowActivityRoles.Where(x => !x.IsDeleted && x.Role == session.RoleCode
                && x.BranchCode == session.BranchId && session.ListDepartment.Any(k => k == x.DepartCode)) on a.ObjActCode equals b.WorkFlowCode
                select new
                {
                    ID = a.TicketID,
                    Code = a.TicketCode,
                    Name = a.Title,
                    Status = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.Status).ValueSet,
                    TypeCode = "IMPROVEMENT",
                    TypeName = "Phiếu bảo dưỡng tài sản"
                });

            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).ToList();
            var count = query.Count();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "ID", "Code", "Name", "Status", "TypeCode", "TypeName");
            return Json(jdata);
        }

        [HttpPost]
        public JsonResult JtableInfo([FromBody] CMSItemsJTableModel jTablePara)
        {
            var today = DateTime.Today;
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.cms_items
                        join b in _context.cms_categories on a.cat_id equals b.id
                        where (a.date_post.HasValue && a.date_post.Value.Date == today)
                        select new
                        {
                            id = a.id,
                            title = a.title,
                            alias = a.alias,
                            name = b.name,
                            published = a.published,
                            created = a.created,
                            modified = a.modified,
                            date_post = a.date_post
                        };

            int count = query.Count();
            var data = query.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length);
            var jdata = JTableHelper.JObjectTable(data.ToList(), jTablePara.Draw, count, "id", "title", "alias", "name", "published", "created", "modified", "date_post");
            return Json(jdata);
        }
        [HttpGet]
        public object GetCmsItemLastest()
        {
            var data = (from a in _context.cms_items.Where(x => x.published)
                        join b in _context.cms_attachments on a.id equals b.item_id into b1
                        from b2 in b1.DefaultIfEmpty()
                        select new
                        {
                            Title = a.title,
                            DatePost = a.date_post.HasValue ? a.date_post.Value.ToString("HH:mm dd/MM/yyyy") : "",
                            a.date_post,
                            FileName = b2 != null ? b2.file_name : "",
                            FileUrl = b2 != null ? b2.file_url : ""
                        }).OrderByDescending(x => x.date_post).Take(4);
            return data;
        }
        [HttpPost]
        public void ViewFileCms(int mode, string url)
        {
            var asean = new AseanDocument();
            var extension = Path.GetExtension(url);
            asean.File_Code = "";
            asean.Mode = 1;
            asean.File_Path = "";
            asean.FirstPage = "/Admin/DashBoard";
            if (extension.ToUpper() == ".DOCX" || extension.ToUpper() == ".DOC")
            {
                DocmanController.pathFile = url;
                DocmanController.cardCode = "";
                DocmanController.docmodel = asean;
            }
            if (extension.ToUpper() == ".XLSX" || extension.ToUpper() == ".XLS")
            {
                ExcelController.pathFile = url;
                ExcelController.cardCode = "";
                ExcelController.docmodel = asean;
            }
            if (extension.ToUpper() == ".PDF")
            {
                PDFController.pathFile = url;
            }
        }
        #endregion

        #region table
        [HttpGet]
        public object GetActionFile()
        {
            var data = (from a in _context.EDMSFiles.Where(x => !x.IsDeleted)
                        join b in _context.Users on a.CreatedBy equals b.UserName
                        select new
                        {
                            FileCode = a.FileCode,
                            FileName = a.FileName,
                            FileSize = a.FileSize,
                            CreateBy = b.GivenName,
                            CreateTime = a.CreatedTime
                        }).OrderByDescending(x => x.CreateTime).Take(5);
            return data;
        }
        [HttpGet]
        public object GetCountFile()
        {
            var data = _context.EDMSFiles.Where(x => !x.IsDeleted);
            return new
            {
                SumFile = data.Count()
            };
        }
        [HttpGet]
        public object GetActionFunds()
        {
            var data = ((from a in _context.FundAccEntrys.Where(x => !x.IsDeleted)
                         join b in _context.Users on a.CreatedBy equals b.UserName
                         select new
                         {
                             FundsCode = a.AetCode,
                             FundsName = a.Title,
                             Total = a.Total * _context.FundExchagRates.FirstOrDefault(x => !x.IsDeleted && x.Currency == a.Currency).Rate,
                             Payer = a.Payer,
                             CreateBy = b.GivenName,
                             CreateTime = a.CreatedTime,
                             /* UpdateBy = a.UpdatedBy,
                              UpdateTime = a.UpdatedTime*/
                         }).OrderByDescending(x => x.CreateTime)).Take(5);
            return data;
        }

        [HttpGet]
        public object GetCountFunds()
        {
            var data = _context.FundAccEntrys.Where(x => !x.IsDeleted);
            var sumgive = data.Where(x => x.AetType == "Receipt" && x.Status == "APPROVED").ToList();
            var sumpay = data.Where(x => x.AetType == "Expense" && x.Status == "APPROVED").ToList();
            var needgive = data.Where(x => x.AetType == "Receipt" && x.Status == "CREATED").ToList();
            var needpay = data.Where(x => x.AetType == "Expense" && x.Status == "CREATED").ToList();

            foreach (var item in sumgive)
            {
                item.Total = item.Total * (_context.FundExchagRates.FirstOrDefault(x => !x.IsDeleted && x.Currency == item.Currency)).Rate;
            }

            foreach (var item in sumpay)
            {
                item.Total = item.Total * (_context.FundExchagRates.FirstOrDefault(x => !x.IsDeleted && x.Currency == item.Currency)).Rate;

            }
            foreach (var item in needgive)
            {
                item.Total = item.Total * (_context.FundExchagRates.FirstOrDefault(x => !x.IsDeleted && x.Currency == item.Currency)).Rate;

            }
            foreach (var item in needpay)
            {
                item.Total = item.Total * (_context.FundExchagRates.FirstOrDefault(x => !x.IsDeleted && x.Currency == item.Currency)).Rate;

            }

            return new
            {
                SumMoneyGive = sumgive.Sum(x => x.Total),
                SumMoneyPay = sumpay.Sum(x => x.Total),
                SumMoneyNeedGive = needgive.Sum(x => x.Total),
                SumMoneyNeedPay = needpay.Sum(x => x.Total),
            };
        }


        [HttpGet]
        public object GetActionSupplier()
        {
            var data = ((from a in _context.Suppliers.Where(x => !x.IsDeleted)
                         join b in _context.Users on a.CreatedBy equals b.UserName
                         select new
                         {
                             SupplierCode = a.SupCode,
                             SupplierName = a.SupName,
                             Location = a.Address,
                             CreateBy = b.GivenName,
                             CreateTime = a.CreatedTime,
                             //UpdateBy = a.UpdatedBy,
                             //UpdateTime = a.UpdatedTime
                         }).OrderByDescending(x => x.CreateTime)).Take(5);
            return data;
        }
        [HttpGet]
        public object GetCountSupplier()
        {
            var data = _context.Suppliers.Where(x => !x.IsDeleted);
            var Active = data.Where(x => x.Status == "SUPPLIER_ACTIVE");
            var DeActive = data.Where(x => x.Status == "SUPPLIER_DEACTIVE");
            var Buyer = from a in _context.Suppliers.Where(x => !x.IsDeleted)
                        join b in _context.PoBuyerHeaders.Where(x => !x.IsDeleted) on a.SupCode equals b.SupCode
                        select new
                        {
                            a,
                            b
                        };


            decimal SumMoney = 0;
            foreach (var item in Buyer)
            {
                SumMoney += GetTotalAmount(item.b.PoSupCode) * (_context.FundExchagRates.FirstOrDefault(x => !x.IsDeleted && x.Currency == item.b.Currency)).Rate;
            }

            decimal summoneyOut = 0;
            foreach (var item in Buyer)
            {
                summoneyOut += GetTotalPaymentOut(item.b.ContractCode);
            }


            return new
            {
                NumSupplier = data.Count(),
                NumSupActive = Active.Count(),
                NumSupDeActive = DeActive.Count(),
                SumMoney = SumMoney,
                summoneyOut = summoneyOut,
            };
        }



        [HttpGet]
        public object GetActionCustomer()
        {
            var data = ((from a in _context.Customerss.Where(x => !x.IsDeleted)
                         join b in _context.Users on a.CreatedBy equals b.UserName
                         select new
                         {
                             CustomerCode = a.CusCode,
                             CustomerName = a.CusName,
                             Location = a.Address,
                             CreateBy = b.GivenName,
                             CreateTime = a.CreatedTime,
                             //UpdateBy = a.UpdatedBy,
                             //UpdateTime = a.UpdatedTime
                         }).OrderByDescending(x => x.CreateTime)).Take(5);
            return data;
        }
        [HttpGet]
        public object GetCountCustomer()
        {
            var data = _context.Customerss.Where(x => !x.IsDeleted);
            var Active = data.Where(x => x.ActivityStatus == "CUSTOMER_ACTIVE");
            var DeActive = data.Where(x => x.ActivityStatus == "CUSTOMER_DEACTIVE");


            var Sale = from a in _context.Customerss.Where(x => !x.IsDeleted)
                       join b in _context.PoSaleHeaders.Where(x => !x.IsDeleted) on a.CusCode equals b.CusCode
                       select new
                       {
                           a,
                           b
                       };

            foreach (var item in Sale)
            {
                item.b.LastBudget = item.b.LastBudget * (_context.FundExchagRates.FirstOrDefault(x => !x.IsDeleted && x.Currency == item.b.Currency)).Rate;
            }
            decimal summoneyIn = 0;
            foreach (var item in Sale)
            {
                summoneyIn += GetTotalPayment(item.b.ContractCode);
            }

            return new
            {
                NumCustomer = data.Count(),
                Summoney = Sale.Sum(x => x.b.LastBudget),
                SummoneyIn = summoneyIn,
                NumCusActive = Active.Count(),
                NumCusDeActive = DeActive.Count()
            };
        }

        [HttpGet]
        public object GetCountProject()
        {
            var project = _context.Projects.Where(x => !x.FlagDeleted);


            var numProjectPending = project.Where(x => x.Status == "PROJECT_STATUS_PENDING");
            var numProjectsuccess = project.Where(x => x.Status == "PROJECT_STATUS_SUCCESS");
            var numProjectcancel = project.Where(x => x.Status == "PROJECT_STATUS_CANCLED");
            decimal Summoney = 0;

            double Summoneydepend = 0;
            double Summoneysucess = 0;
            double Summoneycancel = 0;
            /*  foreach (var item in project)*/
            /* {
                 Summoney += item.Budget * (_context.FundExchagRates.FirstOrDefault(x => !x.IsDeleted && x.Currency == item.Currency)).Rate;
             }

             foreach (var item in numBuyerPending)
             {
                 Summoneydepend += GetTotalAmount(item.PoSupCode) * (_context.FundExchagRates.FirstOrDefault(x => !x.IsDeleted && x.Currency == item.Currency)).Rate;
             }
             foreach (var item in numBuyersuccess)
             {
                 Summoneysucess += GetTotalAmount(item.PoSupCode) * (_context.FundExchagRates.FirstOrDefault(x => !x.IsDeleted && x.Currency == item.Currency)).Rate;
             }
             foreach (var item in numBuyercancel)
             {
                 Summoneycancel += GetTotalAmount(item.PoSupCode) * (_context.FundExchagRates.FirstOrDefault(x => !x.IsDeleted && x.Currency == item.Currency)).Rate;
             }
 */

            return new
            {
                Sumproject = project.Count(),
                ProjectPending = numProjectPending.Count(),
                ProjectSuccess = numProjectsuccess.Count(),
                ProjectCancel = numProjectcancel.Count(),
                Summoney = project.Sum(x => x.Budget),
                Summoneydepend = numProjectPending.Sum(x => x.Budget),
                Summoneysucess = numProjectsuccess.Sum(x => x.Budget),

                Summoneycancel = numProjectcancel.Sum(x => x.Budget),

            };
        }

        [HttpGet]
        public object GetCountBuyer()
        {
            var Buyer = _context.PoBuyerHeaders.Where(x => !x.IsDeleted);


            var numBuyerPending = Buyer.Where(x => x.Status == "CONTRACT_STATUS_PO_SUP_DEPENDING");
            var numBuyersuccess = Buyer.Where(x => x.Status == "CONTRACT_STATUS_PO_SUP_SUCCESS");
            var numBuyercancel = Buyer.Where(x => x.Status == "CONTRACT_STATUS_PO_SUP_CANCEL");


            decimal SumMoney = 0;

            decimal Moneypending = 0;
            decimal MoneypSuccess = 0;
            decimal MoneyCancel = 0;
            foreach (var item in Buyer)
            {
                SumMoney += GetTotalAmount(item.PoSupCode) * (_context.FundExchagRates.FirstOrDefault(x => !x.IsDeleted && x.Currency == item.Currency)).Rate;
            }

            foreach (var item in numBuyerPending)
            {
                Moneypending += GetTotalAmount(item.PoSupCode) * (_context.FundExchagRates.FirstOrDefault(x => !x.IsDeleted && x.Currency == item.Currency)).Rate;
            }
            foreach (var item in numBuyersuccess)
            {
                MoneypSuccess += GetTotalAmount(item.PoSupCode) * (_context.FundExchagRates.FirstOrDefault(x => !x.IsDeleted && x.Currency == item.Currency)).Rate;
            }
            foreach (var item in numBuyercancel)
            {
                MoneyCancel += GetTotalAmount(item.PoSupCode) * (_context.FundExchagRates.FirstOrDefault(x => !x.IsDeleted && x.Currency == item.Currency)).Rate;
            }



            decimal summoneyOut = 0;
            decimal SummoneydependOut = 0;
            decimal SummoneysucessOut = 0;
            decimal SummoneycancelOut = 0;
            foreach (var item in Buyer)
            {
                summoneyOut += GetTotalPaymentOut(item.ContractCode);
            }
            foreach (var item in numBuyerPending)
            {
                SummoneydependOut += GetTotalPaymentOut(item.ContractCode);
            }
            foreach (var item in numBuyersuccess)
            {
                SummoneysucessOut += GetTotalPaymentOut(item.ContractCode);
            }
            foreach (var item in numBuyercancel)
            {
                SummoneycancelOut += GetTotalPaymentOut(item.ContractCode);
            }

            return new
            {
                SumBuyer = Buyer.Count(),
                BuyerPending = numBuyerPending.Count(),
                BuyerSuccess = numBuyersuccess.Count(),
                BuyerCancel = numBuyercancel.Count(),
                //Tổng tiền
                SumMoney = SumMoney,
                Moneypeding = Moneypending,
                MoneypSuccess = MoneypSuccess,
                MoneyCancel = MoneyCancel,

                //chi//
                summoneyOut = summoneyOut,
                SummoneydependOut = SummoneydependOut,
                SummoneysucessOut = SummoneysucessOut,
                SummoneycancelOut = SummoneycancelOut,

            };
        }


        [HttpGet]
        public object GetCountCardWork()
        {
            var CardWork = _context.WORKOSCards.Where(x => !x.IsDeleted);
            var CardWorkPending = CardWork.Where(x => x.Status == "START");
            var CardWorkSuccess = CardWork.Where(x => x.Status == "DONE");
            var CardWorkcancel = CardWork.Where(x => x.Status == "CANCLED");
            var CardWorkExpires = CardWork.Where(x => x.Status == "EXPIRES");
            //var progressProject = Math.Round(Convert.ToDouble(numProjectPending) / project.Count() * 100);


            return new
            {
                sumCardWork = CardWork.Count(),
                cardWorkPending = CardWorkPending.Count(),
                cardWorkSuccess = CardWorkSuccess.Count(),
                cardWorkcancel = CardWorkcancel.Count(),
                cardWorkExpires = CardWorkExpires.Count()

            };
        }

        [HttpGet]
        public object GetCountWorkFlow()
        {
            var Workflow = _context.WorkflowInstances.Where(x => !x.IsDeleted.Value);
            var WorkflowPending = Workflow.Where(x => x.Status == "PENDING");
            var WorkflowSuccess = Workflow.Where(x => x.Status == "SUCCESS");
            var Workflowcancel = Workflow.Where(x => x.Status == "CANCEl");
            var WorkflowExpires = Workflow.Where(x => x.Status == "EXPIRES");


            var data = (from a in _context.WorkflowInstances.Where(x => !x.IsDeleted.Value)
                        join b in _context.Users on a.UpdatedBy equals b.UserName
                        select new
                        {
                            WFCode = a.WfInstCode,
                            WFName = a.ObjectInst,
                            Status = a.Status,
                            updateby = b.GivenName,
                            updatetime = a.UpdatedTime.HasValue ? a.UpdatedTime.Value.ToString("HH:mm dd/MM/yyyy") : ""
                        }).OrderByDescending(x => x.updatetime).Take(5);


            return new
            {
                sumWorkflow = Workflow.Count(),
                WorkflowPending = WorkflowPending.Count(),
                WorkflowSuccess = WorkflowSuccess.Count(),
                Workflowcancel = Workflowcancel.Count(),
                WorkflowExpires = WorkflowExpires.Count(),
                list = data

            };
        }


        [HttpGet]
        public object GetActionCardWork()
        {
            var data = (from a in _context.WORKOSCards.Where(x => !x.IsDeleted)
                        join b in _context.Users on a.CreatedBy equals b.UserName
                        select new
                        {
                            cardCode = a.CardCode,
                            cardName = a.CardName,
                            status = _context.CommonSettings.Where(x => !x.IsDeleted && x.CodeSet.Equals(a.Status)).Select(x => x.ValueSet),
                            updateby = b.GivenName,
                            updatetime = a.UpdatedTime
                        }).OrderByDescending(x => x.updatetime).Take(5);


            return data;

        }


        [HttpGet]
        public object GetCountSale()
        {
            var Sale = _context.PoSaleHeaders.Where(x => !x.IsDeleted).ToList();


            var numSalePending = Sale.Where(x => x.Status == "CONTRACT_STATUS_PO_SUP_DEPENDING").ToList();
            var numSaleSuccess = Sale.Where(x => x.Status == "CONTRACT_STATUS_PO_SUP_SUCCESS").ToList();
            var numSalecancel = Sale.Where(x => x.Status == "CONTRACT_STATUS_PO_SUP_CANCEL").ToList();
            foreach (var item in Sale)
            {
                item.LastBudget = item.LastBudget * (_context.FundExchagRates.FirstOrDefault(x => !x.IsDeleted && x.Currency == item.Currency)).Rate;
            }
            foreach (var item in numSalePending)
            {
                item.LastBudget = item.LastBudget * (_context.FundExchagRates.FirstOrDefault(x => !x.IsDeleted && x.Currency == item.Currency)).Rate;
            }
            foreach (var item in numSaleSuccess)
            {
                item.LastBudget = item.LastBudget * (_context.FundExchagRates.FirstOrDefault(x => !x.IsDeleted && x.Currency == item.Currency)).Rate;
            }
            foreach (var item in numSalecancel)
            {
                item.LastBudget = item.LastBudget * (_context.FundExchagRates.FirstOrDefault(x => !x.IsDeleted && x.Currency == item.Currency)).Rate;
            }


            decimal summoneyIn = 0;
            decimal SummoneydependIn = 0;
            decimal SummoneysucessIn = 0;
            decimal SummoneycancelIn = 0;
            foreach (var item in Sale)
            {
                summoneyIn += GetTotalPayment(item.ContractCode);
            }
            foreach (var item in numSalePending)
            {
                SummoneydependIn += GetTotalPayment(item.ContractCode);
            }
            foreach (var item in numSaleSuccess)
            {
                SummoneysucessIn += GetTotalPayment(item.ContractCode);
            }
            foreach (var item in numSalecancel)
            {
                SummoneycancelIn += GetTotalPayment(item.ContractCode);
            }


            return new
            {
                SumSale = Sale.Count(),
                SalePending = numSalePending.Count(),
                SaleSuccess = numSaleSuccess.Count(),
                SaleCancel = numSalecancel.Count(),
                //Tổng tiền//
                Summoney = Sale.Sum(x => x.LastBudget),
                Summoneydepend = numSalePending.Sum(x => x.LastBudget),
                Summoneysucess = numSaleSuccess.Sum(x => x.LastBudget),
                Summoneycancel = numSalecancel.Sum(x => x.LastBudget),

                //Đã thanh toán//
                SummoneyIn = summoneyIn,
                SummoneydependIn = SummoneydependIn,
                SummoneysucessIn = SummoneysucessIn,
                SummoneycancelIn = SummoneycancelIn,
            };
        }


        [HttpGet]
        public decimal GetTotalPayment(string contractCode)
        {
            var fundAccEntry = _context.FundAccEntrys.Where(x => !x.IsDeleted && x.ObjCode == contractCode
                && x.ObjType == "CONTRACT").Select(x => new TotalContractSale { Money = x.Total, Currency = x.Currency }).ToList();
            if (fundAccEntry.Any())
            {
                foreach (var item in fundAccEntry)
                {
                    item.Money = item.Money * (_context.FundExchagRates.FirstOrDefault(x => !x.IsDeleted && x.Currency == item.Currency)).Rate;
                }
            }
            var total = fundAccEntry.Sum(x => x.Money);

            return total;
        }
        public class TotalContractSale
        {
            public decimal Money { get; set; }
            public string Currency { get; set; }
        }
        [NonAction]
        public decimal GetTotalPaymentOut(string contractPOCode)
        {
            var fundAccEntry = _context.FundAccEntrys.Where(x => !x.IsDeleted && x.ObjCode == contractPOCode
            && x.ObjType == "PO_SUPPLIER").Select(x => new TotalContractSale { Money = x.Total, Currency = x.Currency }).ToList();
            if (fundAccEntry.Any())
            {
                foreach (var item in fundAccEntry)
                {
                    item.Money = item.Money * (_context.FundExchagRates.FirstOrDefault(x => !x.IsDeleted && x.Currency == item.Currency)).Rate;
                }
            }
            var total = fundAccEntry.Sum(x => x.Money);

            return total;
        }

        [NonAction]
        public decimal GetTotalAmount(string PoSupCode)
        {
            var data = _context.PoBuyerDetails.Where(x => !x.IsDeleted && x.PoSupCode == PoSupCode).ToList();
            var total = data.Sum(x => x.TotalAmount.Value);

            return total;
        }


        [HttpGet]
        public JsonResult GetActionUser()
        {
            var data = (from a in _context.ShiftLogs
                        join b in _context.Users on a.CreatedBy equals b.UserName
                        join c in _context.UserRoles on b.Id equals c.UserId into c1
                        from c in c1.DefaultIfEmpty()
                        join d in _context.AdDepartments.Where(x => !x.IsDeleted && x.IsEnabled) on b.DepartmentId equals d.DepartmentCode into d1
                        from d in d1.DefaultIfEmpty()
                        select new
                        {
                            UserName = b.GivenName,
                            DepartmentName = d != null ? d.Title : "",
                            RoleName = _context.Roles.FirstOrDefault(x => x.Id == c.RoleId) != null ? _context.Roles.FirstOrDefault(x => x.Id == c.RoleId).Title : "",
                            ActLog = a.ChkoutTime.HasValue ? "CHECKOUT" : "CHECKIN",
                            ActTime = a.ChkoutTime.HasValue ? a.ChkoutTime.Value.ToString("dd/MM/yyyy HH:mm:ss") : a.ChkinTime.Value.ToString("dd/MM/yyyy HH:mm:ss"),
                            Location = a.ChkoutTime.HasValue ? a.ChkoutLocationTxt : a.ChkinLocationTxt,
                            Divice = a.FromDevice

                        }).OrderByDescending(x => x.ActTime).Take(10);
            return Json(data);
        }
        [HttpGet]
        public JsonResult GetCountAsset()
        {
            var data = _context.AssetMains.Where(x => !x.IsDeleted).ToList();
            var active = data.Where(x => x.Status == "ACTIVE").ToList();
            var Mainten = data.Where(x => x.Status == "MAINTEN").ToList();
            var Delete = data.Where(x => x.Status == "DELETE").ToList();

            foreach (var item in data)
            {
                item.Cost = item.Cost * (_context.FundExchagRates.FirstOrDefault(x => !x.IsDeleted && x.Currency == item.Currency)).Rate;
            }
            foreach (var item in active)
            {
                item.Cost = item.Cost * (_context.FundExchagRates.FirstOrDefault(x => !x.IsDeleted && x.Currency == item.Currency)).Rate;
            }
            foreach (var item in Mainten)
            {
                item.Cost = item.Cost * (_context.FundExchagRates.FirstOrDefault(x => !x.IsDeleted && x.Currency == item.Currency)).Rate;
            }
            foreach (var item in Delete)
            {
                item.Cost = item.Cost * (_context.FundExchagRates.FirstOrDefault(x => !x.IsDeleted && x.Currency == item.Currency)).Rate;
            }
            var query = new
            {
                sumasset = data.Count(),
                assetActive = active.Count(),
                assetMainten = Mainten.Count(),
                assetDelete = Delete.Count(),

                SumValueAsset = data.Sum(x => x.Cost),
                ValueAssetActive = active.Sum(x => x.Cost),
                ValueAssetMainten = Mainten.Sum(x => x.Cost),
                ValueAssetDelete = Delete.Sum(x => x.Cost),
            };



            return Json(query);
        }

        #endregion
        #region brand and department
        [HttpGet]
        public object GetBranAndDepartment()
        {
            var orgs = _context.AdOrganizations.Where(x => x.IsEnabled);
            var lstOrg = new List<OrgModel>();
            var lstDpts = new List<DepartmentModel>();
            foreach (var item in orgs)
            {
                var orgModel = new OrgModel
                {
                    Code = item.OrgAddonCode,
                    Name = item.OrgName,
                    Total = 0,

                };
                foreach (var k in lstOrg)
                {
                    var tuple = GetActOrg(k.Code);
                    k.Total = tuple.Item4;
                    k.Late = tuple.Item2;
                    k.CheckIn = tuple.Item1;
                    k.OffWork = tuple.Item3;
                }
                lstOrg.Add(orgModel);

                if (!string.IsNullOrEmpty(item.DepartmentCode))
                {
                    var lstDpt = item.DepartmentCode.Split(",", StringSplitOptions.None);

                    var data = (from a in _context.AdDepartments.Where(x => !x.IsDeleted && x.IsEnabled)
                                join b in lstDpt on a.DepartmentCode equals b
                                select new DepartmentModel
                                {
                                    Code = a.DepartmentCode,
                                    Name = a.Title,
                                    IdSvg = item.OrgAddonCode + "_" + a.DepartmentCode,
                                    OrgCode = item.OrgAddonCode,
                                    Total = 0,
                                    Late = 0,
                                    OffWork = 0,
                                    CheckIn = 0

                                }).ToList();
                    foreach (var k in data)
                    {
                        var tuple = GetActivityEmp(k.Code, item.OrgAddonCode);
                        k.Total = tuple.Item4;
                        k.Late = tuple.Item2;
                        k.CheckIn = tuple.Item1;
                        k.OffWork = tuple.Item3;
                    }
                    lstDpts.AddRange(data);
                }
            }
            return new
            {
                LstOrg = lstOrg,
                LstDepartment = lstDpts
            };
        }

        [NonAction]
        public Tuple<int, int, int, int> GetActivityEmp(string dpt, string branch)
        {
            var countCheckIn = from a in _context.ShiftLogs.Where(x => x.CreatedTime.Value.Date == DateTime.Now.Date && !x.ChkoutTime.HasValue)
                               join b in _context.Users.Where(x => x.DepartmentId == dpt && x.BranchId == branch) on a.CreatedBy equals b.UserName
                               select new
                               {
                                   a.Id,
                                   a.CreatedBy
                               };
            var countLate = from c in _context.WorkShiftCheckInOuts.Where(x => !x.IsDeleted && x.Action == "GOLATE" && x.ActionTime.Date == DateTime.Now.Date)
                            join d in _context.Users.Where(x => x.DepartmentId == dpt && x.BranchId == branch) on c.UserId equals d.Id
                            select new
                            {
                                c.Id,
                                c.CreatedBy
                            };
            var countOff = from e in _context.WorkShiftCheckInOuts.Where(x => !x.IsDeleted && x.Action == "NOT_WORK" && x.ActionTime.Date <= DateTime.Now.Date
                && x.ActionTo.Value.Date >= DateTime.Now.Date)
                           join f in _context.Users.Where(x => x.DepartmentId == dpt && x.BranchId == branch) on e.UserId equals f.Id
                           select new
                           {
                               e.Id,
                               e.CreatedBy
                           };
            var userOfDepartment = _context.Users.Where(x => x.DepartmentId == dpt && x.BranchId == branch);
            return new Tuple<int, int, int, int>(countCheckIn.Count(), countLate.Count(), countOff.Count(), userOfDepartment.Count());
        }


        [NonAction]
        public Tuple<int, int, int, int> GetActOrg(string branch)
        {
            var countCheckIn = from a in _context.ShiftLogs.Where(x => x.CreatedTime.Value.Date == DateTime.Now.Date && !x.ChkoutTime.HasValue)
                               join b in _context.Users.Where(x => x.BranchId == branch) on a.CreatedBy equals b.UserName
                               select new
                               {
                                   a.Id,
                                   a.CreatedBy
                               };
            var countLate = from c in _context.WorkShiftCheckInOuts.Where(x => !x.IsDeleted && x.Action == "GOLATE" && x.ActionTime.Date == DateTime.Now.Date)
                            join d in _context.Users.Where(x => x.BranchId == branch) on c.UserId equals d.Id
                            select new
                            {
                                c.Id,
                                c.CreatedBy
                            };
            var countOff = from e in _context.WorkShiftCheckInOuts.Where(x => !x.IsDeleted && x.Action == "NOT_WORK" && x.ActionTime.Date <= DateTime.Now.Date
                && x.ActionTo.Value.Date >= DateTime.Now.Date)
                           join f in _context.Users.Where(x => x.BranchId == branch) on e.UserId equals f.Id
                           select new
                           {
                               e.Id,
                               e.CreatedBy
                           };
            var userOfOrg = _context.Users.Where(x => x.BranchId == branch);
            return new Tuple<int, int, int, int>(countCheckIn.Count(), countLate.Count(), countOff.Count(), userOfOrg.Count());
        }




        public class OrgModel
        {
            public int Total { get; set; }
            public int Late { get; set; }
            public int OffWork { get; set; }
            public int CheckIn { get; set; }

            public string Code { get; set; }
            public string Name { get; set; }
        }

        public class DepartmentModel
        {
            public int Total { get; set; }
            public int Late { get; set; }
            public int OffWork { get; set; }
            public int CheckIn { get; set; }
            public string IdSvg { get; set; }
            public string OrgCode { get; set; }
            public string Code { get; set; }
            public string Name { get; set; }
        }
        #endregion

        #region GroupUser

        [HttpGet]
        public JsonResult GetActionUserGroup()
        {
            var data = (from a in _context.ShiftLogs
                        join b in _context.Users on a.CreatedBy equals b.UserName
                        join e in _context.AdUserInGroups on b.Id equals e.UserId
                        join c in _context.UserRoles on e.UserId equals c.UserId into c1
                        from c in c1.DefaultIfEmpty()
                        join f in _context.AdGroupUsers on e.GroupUserCode equals f.GroupUserCode

                        select new
                        {
                            UserName = b.GivenName,
                            GroupName = f != null ? f.Title : "",
                            RoleName = _context.Roles.FirstOrDefault(x => x.Id == c.RoleId) != null ? _context.Roles.FirstOrDefault(x => x.Id == c.RoleId).Title : "",
                            ActLog = a.ChkoutTime.HasValue ? "CHECKOUT" : "CHECKIN",
                            ActTime = a.ChkoutTime.HasValue ? a.ChkoutTime.Value.ToString("dd/MM/yyyy HH:mm:ss") : a.ChkinTime.Value.ToString("dd/MM/yyyy HH:mm:ss"),
                            Location = a.ChkoutTime.HasValue ? a.ChkoutLocationTxt : a.ChkinLocationTxt,
                            Divice = a.FromDevice

                        }).OrderByDescending(x => x.ActTime).Take(10);
            return Json(data);
        }



        [HttpGet]
        public object GetGroupUser()
        {
            var Group = _context.AdGroupUsers.Where(x => x.IsEnabled && !x.IsDeleted);
            var lstGroup = new List<GroupModel>();
            foreach (var item in Group)
            {
                var groupModel = new GroupModel
                {
                    Code = item.GroupUserCode,
                    Name = item.Title,
                    Total = 0,
                    Late = 0,
                    OffWork = 0,
                    CheckIn = 0
                };
                foreach (var k in lstGroup)
                {
                    var tuple = GetActGroup(k.Code);
                    k.Total = tuple.Item4;
                    k.Late = tuple.Item2;
                    k.CheckIn = tuple.Item1;
                    k.OffWork = tuple.Item3;

                }
                lstGroup.Add(groupModel);
            }
            return new
            {
                LstGroup = lstGroup,
            };
        }
        [NonAction]
        public Tuple<int, int, int, int> GetActGroup(string GroupCode)
        {
            var countCheckIn = from a in _context.ShiftLogs.Where(x => x.CreatedTime.Value.Date == DateTime.Now.Date && !x.ChkoutTime.HasValue)
                               join b in _context.Users on a.CreatedBy equals b.UserName
                               join c in _context.AdUserInGroups.Where(x => x.GroupUserCode == GroupCode && !x.IsDeleted) on b.Id equals c.UserId
                               select new
                               {
                                   a.Id,
                                   a.CreatedBy
                               };
            var countLate = from d in _context.WorkShiftCheckInOuts.Where(x => !x.IsDeleted && x.Action == "GOLATE" && x.ActionTime.Date == DateTime.Now.Date)
                            join h in _context.Users on d.UserId equals h.Id
                            join e in _context.AdUserInGroups.Where(x => x.GroupUserCode == GroupCode && !x.IsDeleted) on h.Id equals e.UserId
                            select new
                            {
                                d.Id,
                                d.CreatedBy
                            };
            var countOff = from f in _context.WorkShiftCheckInOuts.Where(x => !x.IsDeleted && x.Action == "NOT_WORK" && x.ActionTime.Date <= DateTime.Now.Date
                && x.ActionTo.Value.Date >= DateTime.Now.Date)
                           join h in _context.Users on f.UserId equals h.Id
                           join e in _context.AdUserInGroups.Where(x => x.GroupUserCode == GroupCode && !x.IsDeleted) on h.Id equals e.UserId
                           select new
                           {
                               f.Id,
                               f.CreatedBy
                           };
            var userOfOrg = _context.AdUserInGroups.Where(x => x.GroupUserCode == GroupCode && !x.IsDeleted);
            return new Tuple<int, int, int, int>(countCheckIn.Count(), countLate.Count(), countOff.Count(), userOfOrg.Count());
        }




        public class GroupModel
        {
            public int Total { get; set; }
            public int Late { get; set; }
            public int OffWork { get; set; }
            public int CheckIn { get; set; }

            public string Code { get; set; }
            public string Name { get; set; }
        }



        #endregion

        #region DashBoardJson



        [HttpGet]
        public object GetDataJson()
        {
            var data = _context.DashboardDataJsons.Where(x => !x.IsDeleted);

            return data;
        }

        #endregion
        [HttpGet]
        public object AmchartFile()
        {
            var timeNowYear = DateTime.Now.Year;
            var data = _context.EDMSFiles.Where(a => !a.IsDeleted && a.CreatedTime.Value.Year == timeNowYear)
             .Select(p => new
             {
                 Month = p.CreatedTime.Value.Month,
             }).GroupBy(x => new { x.Month })
             .Select(p => new
             {
                 Month = p.First().Month,
                 sum = p.Count(),
             }).OrderBy(p => p.Month).ToList();


            return data;
        }



        [HttpGet]
        public JsonResult CountAction()
        {
            var nowdate = DateTime.Now.Date.AddDays(-2);

            var data = (from a in _context.ShiftLogs.Where(x => x.CreatedTime.Value.Date == nowdate)
                        join b in _context.Users on a.CreatedBy equals b.UserName
                        join c in _context.WorkShiftCheckInOuts on b.Id equals c.UserId
                        select new
                        {
                            DepartmentName = b.BranchId + "_" + b.DepartmentId,
                            BrandName = b.BranchId,

                            checkin = _context.ShiftLogs.Where(x => x.ChkinTime == x.CreatedTime && x.CreatedTime.Value.Date == nowdate && x.CreatedBy == b.UserName && x.IsChkinRealTime).Count(),
                            checkout = _context.ShiftLogs.Where(x => x.CreatedBy == b.UserName && x.IsChkoutRealTime).Count(),
                            golate = _context.WorkShiftCheckInOuts.Where(x => !x.IsDeleted && x.Approve && x.ActionTime.Date.Equals(nowdate) && x.Action == "GOLATE" && x.UserId == b.Id).Count(),
                            notwork = _context.WorkShiftCheckInOuts.Where(x => !x.IsDeleted && x.Approve && x.ActionTime.Date.Equals(nowdate) && x.Action == "NOT_WORK" && x.UserId == b.Id).Count(),

                        }).DistinctBy(x => x.DepartmentName);

            return Json(data);
        }
        #region Chart

        [HttpGet]
        public object AmchartFunds()
        {
            var timeNowYear = DateTime.Now.Year;
            var data = _context.FundAccEntrys.Where(a => !a.IsDeleted && a.CreatedTime.Value.Year == timeNowYear)
             .Select(p => new
             {
                 Month = p.CreatedTime.Value.Month,
                 AetType = p.AetType,
                 Total = (p.Total) * (_context.FundExchagRates.FirstOrDefault(x => !x.IsDeleted && x.Currency == p.Currency).Rate),
                 Currency = p.Currency,
                 Status = p.Status
             }).GroupBy(x => new { x.Month })
             .Select(p => new
             {
                 Month = p.First().Month,
                 give = p.Where(x => x.AetType == "Receipt" && x.Status == "APPROVED" && x.Month == p.First().Month).Sum(x => x.Total),
                 pay = p.Where(x => x.AetType == "Expense" && x.Status == "APPROVED" && x.Month == p.First().Month).Sum(x => x.Total),
             }).OrderBy(p => p.Month).ToList();
            return data;
        }
        [HttpGet]
        public object AmchartSupplier()
        {
            var timeNowYear = DateTime.Now.Year;
            var data = _context.Suppliers.Where(a => !a.IsDeleted && a.CreatedTime.Value.Year == timeNowYear)
             .Select(p => new
             {
                 Month = p.CreatedTime.Value.Month,
             }).GroupBy(x => new { x.Month })
             .Select(p => new
             {
                 Month = p.First().Month,
                 sum = p.Count(),
                 Active = _context.Suppliers.Where(x => !x.IsDeleted && x.Status == "CUSTOMER_ACTIVE" && x.CreatedTime.Value.Month.Equals(p.First().Month)).Count(),
                 DeActive = _context.Suppliers.Where(x => !x.IsDeleted && x.Status == "CUSTOMER_DEACTIVE" && x.CreatedTime.Value.Month.Equals(p.First().Month)).Count(),
             }).OrderBy(p => p.Month).ToList();


            return data;
        }


        [HttpGet]
        public object AmchartCustomer()
        {
            var timeNowYear = DateTime.Now.Year;
            var data = _context.Customerss.Where(a => !a.IsDeleted && a.CreatedTime.Value.Year == timeNowYear)
             .Select(p => new
             {
                 Month = p.CreatedTime.Value.Month,
             }).GroupBy(x => new { x.Month })
             .Select(p => new
             {
                 Month = p.First().Month,
                 sum = p.Count(),
                 Active = _context.Customerss.Where(x => !x.IsDeleted && x.ActivityStatus == "CUSTOMER_ACTIVE" && x.CreatedTime.Value.Month.Equals(p.First().Month)).Count(),
                 DeActive = _context.Customerss.Where(x => !x.IsDeleted && x.ActivityStatus == "CUSTOMER_DEACTIVE" && x.CreatedTime.Value.Month.Equals(p.First().Month)).Count(),
             }).OrderBy(p => p.Month).ToList();


            return data;
        }

        [HttpGet]
        public object AmchartProject()
        {
            var timeNowYear = DateTime.Now.Year;
            var data = _context.Projects.Where(a => !a.FlagDeleted && a.CreatedTime.Value.Year == timeNowYear)
             .Select(p => new
             {
                 Month = p.CreatedTime.Value.Month,
                 //sum = _context.Projects.Where(x => !x.FlagDeleted && x.CreatedTime.Value.Month.Equals(p.CreatedTime.Value.Month)).Count()
             }).GroupBy(x => new { x.Month })
             .Select(p => new
             {
                 Month = p.First().Month,
                 sum = p.Count(),
                 pending = _context.Projects.Where(x => !x.FlagDeleted && x.Status == "PROJECT_STATUS_PENDING" && x.CreatedTime.Value.Month.Equals(p.First().Month)).Count(),
                 success = _context.Projects.Where(x => !x.FlagDeleted && x.Status == "PROJECT_STATUS_SUCCESS" && x.CreatedTime.Value.Month.Equals(p.First().Month)).Count(),
                 cancel = _context.Projects.Where(x => !x.FlagDeleted && x.Status == "PROJECT_STATUS_CANCLED" && x.CreatedTime.Value.Month.Equals(p.First().Month)).Count(),
             }).OrderBy(p => p.Month).ToList();


            return data;
        }


        [HttpGet]
        public object AmchartCardWork()
        {
            var timeNowYear = DateTime.Now.Year;
            var data = _context.WORKOSCards.Where(a => !a.IsDeleted && a.CreatedDate.Year == timeNowYear)
             .Select(p => new
             {
                 Month = p.CreatedDate.Month,
                 //sum = _context.Projects.Where(x => !x.FlagDeleted && x.CreatedTime.Value.Month.Equals(p.CreatedTime.Value.Month)).Count()
             }).GroupBy(x => new { x.Month })
             .Select(p => new
             {
                 Month = p.First().Month,
                 sum = p.Count(),
                 pending = _context.WORKOSCards.Where(x => !x.IsDeleted && x.Status == "START" && x.CreatedDate.Month.Equals(p.First().Month)).Count(),
                 success = _context.WORKOSCards.Where(x => !x.IsDeleted && x.Status == "DONE" && x.CreatedDate.Month.Equals(p.First().Month)).Count(),
                 cancel = _context.WORKOSCards.Where(x => !x.IsDeleted && x.Status == "CANCLED" && x.CreatedDate.Month.Equals(p.First().Month)).Count(),
                 expires = _context.WORKOSCards.Where(x => !x.IsDeleted && x.Status == "EXPIRES" && x.CreatedDate.Month.Equals(p.First().Month)).Count(),
             }).OrderBy(p => p.Month).ToList();


            return data;
        }

        [HttpGet]
        public object AmchartWorkFlow()
        {
            var timeNowYear = DateTime.Now.Year;
            var data = _context.WorkflowInstances.Where(a => !a.IsDeleted.Value && a.CreatedTime.Value.Year == timeNowYear)
             .Select(p => new
             {
                 Month = p.CreatedTime.Value.Month,
                 //sum = _context.Projects.Where(x => !x.FlagDeleted && x.CreatedTime.Value.Month.Equals(p.CreatedTime.Value.Month)).Count()
             }).GroupBy(x => new { x.Month })
             .Select(p => new
             {
                 Month = p.First().Month,
                 sum = p.Count(),
                 pending = _context.WorkflowInstances.Where(x => !x.IsDeleted.Value && x.Status == "PENDING" && x.CreatedTime.Value.Month.Equals(p.First().Month)).Count(),
                 success = _context.WorkflowInstances.Where(x => !x.IsDeleted.Value && x.Status == "SUCCESS" && x.CreatedTime.Value.Month.Equals(p.First().Month)).Count(),
                 cancel = _context.WorkflowInstances.Where(x => !x.IsDeleted.Value && x.Status == "CANCEL" && x.CreatedTime.Value.Month.Equals(p.First().Month)).Count(),
                 expires = _context.WorkflowInstances.Where(x => !x.IsDeleted.Value && x.Status == "EXPIRES" && x.CreatedTime.Value.Month.Equals(p.First().Month)).Count(),
             }).OrderBy(p => p.Month).ToList();


            return data;
        }


        [HttpGet]
        public object AmchartAsset()
        {
            var timeNowYear = DateTime.Now.Year;
            var data = _context.AssetMains.Where(a => !a.IsDeleted && a.CreatedTime.Value.Year == timeNowYear)
             .Select(p => new
             {
                 Month = p.CreatedTime.Value.Month,
                 //sum = _context.Projects.Where(x => !x.FlagDeleted && x.CreatedTime.Value.Month.Equals(p.CreatedTime.Value.Month)).Count()
             }).GroupBy(x => new { x.Month })
             .Select(p => new
             {
                 Month = p.First().Month,
                 sum = p.Count(),
                 active = _context.AssetMains.Where(x => !x.IsDeleted && x.Status == "ACTIVE" && x.CreatedTime.Value.Month.Equals(p.First().Month)).Count(),
                 mainten = _context.AssetMains.Where(x => !x.IsDeleted && x.Status == "MAINTEN" && x.CreatedTime.Value.Month.Equals(p.First().Month)).Count(),
                 cancel = _context.AssetMains.Where(x => !x.IsDeleted && x.Status == "CANCEL" && x.CreatedTime.Value.Month.Equals(p.First().Month)).Count(),
             }).OrderBy(p => p.Month).ToList();


            return data;
        }

        [HttpGet]
        public object AmchartCountBuy()
        {
            var timeNowYear = DateTime.Now.Year;
            var data = _context.PoBuyerHeaders.Where(a => !a.IsDeleted && a.CreatedTime.Value.Year == timeNowYear)
             .Select(p => new
             {
                 Month = p.CreatedTime.Value.Month,
                 //sum = _context.Projects.Where(x => !x.FlagDeleted && x.CreatedTime.Value.Month.Equals(p.CreatedTime.Value.Month)).Count()
             }).GroupBy(x => new { x.Month })
             .Select(p => new
             {
                 Month = p.First().Month,
                 sum = p.Count(),
                 pending = _context.PoBuyerHeaders.Where(x => !x.IsDeleted && x.Status == "CONTRACT_STATUS_PO_SUP_DEPENDING" && x.CreatedTime.Value.Month.Equals(p.First().Month)).Count(),
                 success = _context.PoBuyerHeaders.Where(x => !x.IsDeleted && x.Status == "CONTRACT_STATUS_PO_SUP_SUCCESS" && x.CreatedTime.Value.Month.Equals(p.First().Month)).Count(),
                 cancel = _context.PoBuyerHeaders.Where(x => !x.IsDeleted && x.Status == "CONTRACT_STATUS_PO_SUP_CANCEL" && x.CreatedTime.Value.Month.Equals(p.First().Month)).Count(),
             }).OrderBy(p => p.Month).ToList();


            return data;
        }
        [HttpGet]
        public object AmchartCountSale()
        {
            var timeNowYear = DateTime.Now.Year;
            var data = _context.PoSaleHeaders.Where(a => !a.IsDeleted && a.CreatedTime.Value.Year == timeNowYear)
             .Select(p => new
             {
                 Month = p.CreatedTime.Value.Month,
                 //sum = _context.Projects.Where(x => !x.FlagDeleted && x.CreatedTime.Value.Month.Equals(p.CreatedTime.Value.Month)).Count()
             }).GroupBy(x => new { x.Month })
             .Select(p => new
             {
                 Month = p.First().Month,
                 sum = p.Count(),
                 pending = _context.PoSaleHeaders.Where(x => !x.IsDeleted && x.Status == "CONTRACT_STATUS_PO_SUP_DEPENDING" && x.CreatedTime.Value.Month.Equals(p.First().Month)).Count(),
                 success = _context.PoSaleHeaders.Where(x => !x.IsDeleted && x.Status == "CONTRACT_STATUS_PO_SUP_SUCCESS" && x.CreatedTime.Value.Month.Equals(p.First().Month)).Count(),
                 cancel = _context.PoSaleHeaders.Where(x => !x.IsDeleted && x.Status == "CONTRACT_STATUS_PO_SUP_CANCEL" && x.CreatedTime.Value.Month.Equals(p.First().Month)).Count(),
             }).OrderBy(p => p.Month).ToList();


            return data;
        }


        [HttpPost]
        public object AmchartCountCustomers()
        {
            //var timeNowYear = DateTime.Now.Year;
            //var data = (from a in _context.Customerss
            //            where a.IsDeleted == false && a.CreatedTime.Value.Year == timeNowYear
            //            group a by a.CreatedTime.Value.Month into grp
            //            select new
            //            {
            //                month = grp.First().CreatedTime.Value.Month,
            //                income = grp.Count()
            //            }).OrderBy(x => x.month);

            var data = _context.VAmchartCountCustomers.Select(p => new
            {
                month = p.Month,
                income = p.Income,
                //Total = p.Total,
            }).OrderBy(p => p.month);

            return data;
        }
        [HttpGet]
        public object AmchartCountSupplier()
        {
            //var timeNowYear = DateTime.Now.Year;
            //var data = (from a in _context.Suppliers
            //            where a.IsDeleted == false && a.CreatedTime.Value.Year == timeNowYear
            //            group a by a.CreatedTime.Value.Month into grp
            //            select new
            //            {
            //                month = grp.First().CreatedTime.Value.Month,
            //                income = grp.Count()
            //            }).OrderBy(x => x.month);

            var data = _context.VAmchartCountSuppliers.Select(p => new
            {
                month = p.Month,
                income = p.Income,
                //Total = p.Total,
            }).OrderBy(p => p.month);

            return data;
        }

        [HttpPost]
        public object AmchartCountProject()
        {
            //var timeNowYear = DateTime.Now.Year;
            //var data = (from a in _context.Projects
            //            where !a.FlagDeleted && a.StartTime.Year == timeNowYear
            //            group a by a.StartTime.Month into grp
            //            select new
            //            {
            //                month = grp.First().StartTime.Month,
            //                income = grp.Count()
            //            }).OrderBy(x => x.month);

            var data = _context.VAmchartCountProjects.Select(p => new
            {
                month = p.Month,
                income = p.Income,
                //Total = p.Total,
            }).OrderBy(p => p.month);

            return data;
        }

        [HttpPost]
        public object AmchartCountEmployees()
        {
            //var timeNowYear = DateTime.Now.Year;
            //var data = (from a in _context.HREmployees
            //            where a.flag == 1 && a.createtime.Value.Year == timeNowYear
            //            group a by a.createtime.Value.Month into grp
            //            select new
            //            {
            //                month = grp.First().createtime.Value.Month,
            //                income = grp.Count()
            //            }).OrderBy(x => x.month);

            var data = _context.VAmchartCountEmployees.Select(p => new
            {
                month = p.Month,
                income = p.Income,
                //Total = p.Total,
            }).OrderBy(p => p.month);

            return data;
        }
        [HttpPost]
        public JsonResult GetWorkFlow()
        {
            var query = (from a in _context.WORKOSBoards
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

        [HttpPost]
        public JsonResult GetCardInBoard(string ObjCode)
        {
            var year = DateTime.Now.Year;
            var listWeight = (from a in _context.ProgressTrackings
                              join b in _context.WORKOSCards on a.CardCode equals b.CardCode
                              where !b.IsDeleted
                              select new
                              {
                                  a.CardCode,
                                  b.WeightNum,
                                  a.UpdatedTime,
                                  a.Progress
                              }).OrderByDescending(x => x.UpdatedTime);

            var query = (from a in _context.WORKOSBoards
                         join b in _context.WfObjects on a.BoardCode equals b.WfObjCode
                         where a.IsDeleted == false && b.WfObjType == "BOARD"
                         group a by new { a.BoardCode } into grp
                         select new
                         {
                             name = grp.First().BoardName,
                             data = (from k in _context.WORKOSLists
                                     join i in _context.WORKOSCards on k.ListCode equals i.ListCode
                                     join o in listWeight on i.CardCode equals o.CardCode
                                     join l in _context.JcObjectIdRelatives on i.CardCode equals l.CardCode into l1
                                     from l2 in l1.DefaultIfEmpty()
                                     where !k.IsDeleted && !i.IsDeleted && k.BoardCode == grp.First().BoardCode && i.CreatedDate.Year == year
                                     && ((string.IsNullOrEmpty(ObjCode)) || l2.ObjID.ToLower().Equals(ObjCode.ToLower()))
                                     group o by new { o.UpdatedTime.Month, o.CardCode } into grpCard
                                     select new
                                     {
                                         Month = grpCard.Key.Month,
                                         Progress = grpCard.First().Progress,
                                         WeighNum = grpCard.First().WeightNum
                                     }).GroupBy(x => x.Month)
                         });

            //var query = _context.VListBoards
            //    .Select(a => new
            //    {
            //        name = a.BoardName,
            //        data = _context.VCardProcesss.Where(p => p.BoardCode == a.BoardCode
            //        && p.Year == year && ((string.IsNullOrEmpty(ObjCode)) || p.ObjId.ToLower().Equals(ObjCode.ToLower()))).GroupBy(y => new { y.Month, y.CardCode })
            //        .Select(z => new
            //        {
            //            Month = z.Key.Month,
            //            Progress = z.First().Progress,
            //            Weight = z.First().WeightNum
            //        }).GroupBy(i => i.Month).ToList()
            //    });

            //var query1 = (from a in _context.VListBoards
            //              select new
            //              {
            //                  name = a.BoardName,
            //                  data = (from b in _context.VCardProcesss
            //                          where b.BoardCode == a.BoardCode
            //                   && b.Year == year && ((string.IsNullOrEmpty(ObjCode)) || b.ObjId.ToLower().Equals(ObjCode.ToLower()))
            //                          group b by new { b.Month, b.CardCode } into grpCard
            //                          select new
            //                          {
            //                              Month = grpCard.Key.Month,
            //                              Progress = grpCard.First().Progress,
            //                              WeighNum = grpCard.First().WeightNum
            //                          }).GroupBy(x => x.Month)
            //              });

            return Json(query);
        }
        [HttpGet]
        public object GetSystemLog(string type)
        {
            var now = DateTime.Now;
            var dateNow = new DateTime(now.Year, now.Month, now.Day, 0, 0, 0); ;
            var weekNow = dateNow.AddDays(-7);
            var monthNow = dateNow.AddDays(-30);
            DateTime? dateSearch = null;
            switch (type)
            {
                case "DATE_NOW":
                    dateSearch = dateNow;
                    break;
                case "WEEK_NOW":
                    dateSearch = weekNow;
                    break;
                case "MONTH_NOW":
                    dateSearch = monthNow;
                    break;
            }

            //THẦU & DỰ ÁN
            var project = _context.Projects;
            var projectInsert = project.Where(x => !x.FlagDeleted && string.IsNullOrEmpty(x.UpdatedBy) && (string.IsNullOrEmpty(type) || (x.CreatedTime >= dateSearch))).Count();
            var projectUpdate = project.Where(x => !x.FlagDeleted && !string.IsNullOrEmpty(x.UpdatedBy) && (string.IsNullOrEmpty(type) || (x.UpdatedTime >= dateSearch))).Count();
            var projectDelete = project.Where(x => x.FlagDeleted && (string.IsNullOrEmpty(type) || (x.UpdatedTime >= dateSearch))).Count();
            var projectPeople = project.Where(x => !x.FlagDeleted && !string.IsNullOrEmpty(x.UpdatedBy) && (string.IsNullOrEmpty(type) || (x.UpdatedTime >= dateSearch))).GroupBy(x => new { UpdatedBy = !string.IsNullOrEmpty(x.UpdatedBy) ? x.UpdatedBy : "" }).Count();

            //HỢP ĐỒNG BÁN
            var poSale = _context.PoSaleHeaders;
            var poSaleInsert = poSale.Where(x => !x.IsDeleted && string.IsNullOrEmpty(x.UpdatedBy) && (string.IsNullOrEmpty(type) || (x.CreatedTime >= dateSearch))).Count();
            var poSaleUpdate = poSale.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.UpdatedBy) && (string.IsNullOrEmpty(type) || (x.UpdatedTime >= dateSearch))).Count();
            var poSaleDelete = poSale.Where(x => x.IsDeleted && (string.IsNullOrEmpty(type) || (x.DeletedTime >= dateSearch))).Count();
            var poSalePeople = poSale.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.UpdatedBy) && (string.IsNullOrEmpty(type) || (x.UpdatedTime >= dateSearch))).GroupBy(x => new { UpdatedBy = !string.IsNullOrEmpty(x.UpdatedBy) ? x.UpdatedBy : "" }).Count();

            //HỢP ĐỒNG MUA
            var poBuyer = _context.PoBuyerHeaders;
            var poBuyerInsert = poBuyer.Where(x => !x.IsDeleted && string.IsNullOrEmpty(x.UpdatedBy) && (string.IsNullOrEmpty(type) || (x.CreatedTime >= dateSearch))).Count();
            var poBuyerUpdate = poBuyer.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.UpdatedBy) && (string.IsNullOrEmpty(type) || (x.UpdatedTime >= dateSearch))).Count();
            var poBuyerDelete = poBuyer.Where(x => x.IsDeleted && (string.IsNullOrEmpty(type) || (x.DeletedTime >= dateSearch))).Count();
            var poBuyerPeople = poBuyer.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.UpdatedBy) && (string.IsNullOrEmpty(type) || (x.UpdatedTime >= dateSearch))).GroupBy(x => new { UpdatedBy = !string.IsNullOrEmpty(x.UpdatedBy) ? x.UpdatedBy : "" }).Count();

            //NHÂN SỰ
            var employee = _context.HREmployees;
            var employeeInsert = employee.Where(x => x.flag.Equals(1) && x.updatetime == null && (string.IsNullOrEmpty(type) || (x.createtime >= dateSearch))).Count();
            var employeeUpdate = employee.Where(x => x.flag.Equals(1) && x.updatetime != null && (string.IsNullOrEmpty(type) || (x.updatetime >= dateSearch))).Count();
            var employeeDelete = employee.Where(x => !x.flag.Equals(1) && (string.IsNullOrEmpty(type) || (x.updatetime >= dateSearch))).Count();
            //var employeePeople = employee.Where(x => x.flag.Equals(1) && !string.IsNullOrEmpty(x.updated_by) && (string.IsNullOrEmpty(type) || (x.updatetime >= dateSearch))).GroupBy(x => new { x.updated_by }).Count();

            //QUỸ TÀI CHÍNH
            var fund = _context.FundAccEntrys.Where(x => _context.FundCatReptExpss.Any(y => !y.IsDeleted && y.CatCode.Equals(x.CatCode)));
            var fundInsert = fund.Where(x => !x.IsDeleted && string.IsNullOrEmpty(x.UpdatedBy) && (string.IsNullOrEmpty(type) || (x.CreatedTime >= dateSearch))).Count();
            var fundUpdate = fund.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.UpdatedBy) && (string.IsNullOrEmpty(type) || (x.UpdatedTime >= dateSearch))).Count();
            var fundDelete = fund.Where(x => x.IsDeleted && (string.IsNullOrEmpty(type) || (x.DeletedTime >= dateSearch))).Count();
            var fundPeople = fund.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.UpdatedBy) && (string.IsNullOrEmpty(type) || (x.UpdatedTime >= dateSearch))).GroupBy(x => new { UpdatedBy = !string.IsNullOrEmpty(x.UpdatedBy) ? x.UpdatedBy : "" }).Count();

            //KHÁCH HÀNG
            var custommer = _context.Customerss;
            var custommerInsert = custommer.Where(x => !x.IsDeleted && string.IsNullOrEmpty(x.UpdatedBy) && (string.IsNullOrEmpty(type) || (x.CreatedTime >= dateSearch))).Count();
            var custommerUpdate = custommer.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.UpdatedBy) && (string.IsNullOrEmpty(type) || (x.UpdatedTime >= dateSearch))).Count();
            var custommerDelete = custommer.Where(x => x.IsDeleted && (string.IsNullOrEmpty(type) || (x.DeletedTime >= dateSearch))).Count();
            var custommerPeople = custommer.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.UpdatedBy) && (string.IsNullOrEmpty(type) || (x.UpdatedTime >= dateSearch))).GroupBy(x => new { UpdatedBy = !string.IsNullOrEmpty(x.UpdatedBy) ? x.UpdatedBy : "" }).Count();

            //NHÀ CUNG CẤP
            var supplier = _context.Suppliers;
            var supplierInsert = supplier.Where(x => !x.IsDeleted && string.IsNullOrEmpty(x.UpdatedBy) && (string.IsNullOrEmpty(type) || (x.CreatedTime >= dateSearch))).Count();
            var supplierUpdate = supplier.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.UpdatedBy) && (string.IsNullOrEmpty(type) || (x.UpdatedTime >= dateSearch))).Count();
            var supplierDelete = supplier.Where(x => x.IsDeleted && (string.IsNullOrEmpty(type) || (x.DeletedTime >= dateSearch))).Count();
            var supplierPeople = supplier.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.UpdatedBy) && (string.IsNullOrEmpty(type) || (x.UpdatedTime >= dateSearch))).GroupBy(x => new { UpdatedBy = !string.IsNullOrEmpty(x.UpdatedBy) ? x.UpdatedBy : "" }).Count();

            //KHO & VẬT TƯ THIẾT BỊ
            var materialProduct = _context.MaterialProducts.Select(x => new { x.Id, x.IsDeleted, x.CreatedBy, x.CreatedTime, x.UpdatedBy, x.UpdatedTime, x.DeletedBy }).ToList();
            //var subProduct = _context.SubProducts.Select(p => new { p.Id, p.IsDeleted, p.CreatedBy, p.CreatedTime, p.UpdatedBy, p.UpdatedTime, p.DeletedBy }).ToList();
            //var product = materialProduct.Union(subProduct);
            var product = materialProduct;
            var productInsert = product.Where(x => !x.IsDeleted && string.IsNullOrEmpty(x.UpdatedBy) && (string.IsNullOrEmpty(type) || (x.CreatedTime >= dateSearch))).Count();
            var productUpdate = product.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.UpdatedBy) && (string.IsNullOrEmpty(type) || (x.UpdatedTime >= dateSearch))).Count();
            var productDelete = product.Where(x => x.IsDeleted && (string.IsNullOrEmpty(type) || (x.CreatedTime >= dateSearch))).Count();
            var productPeople = product.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.UpdatedBy) && (string.IsNullOrEmpty(type) || (x.UpdatedTime >= dateSearch))).GroupBy(x => new { UpdatedBy = !string.IsNullOrEmpty(x.UpdatedBy) ? x.UpdatedBy : "" }).Count();

            //ĐIỀU HÀNH CÔNG VIỆC
            var cardJob = _context.WORKOSCards;
            var cardJobInsert = cardJob.Where(x => !x.IsDeleted && string.IsNullOrEmpty(x.UpdatedBy) && (string.IsNullOrEmpty(type) || (x.CreatedDate >= dateSearch))).Count();
            var cardJobUpdate = cardJob.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.UpdatedBy) && (string.IsNullOrEmpty(type) || (x.UpdatedTime >= dateSearch))).Count();
            var cardJobDelete = cardJob.Where(x => x.IsDeleted && (string.IsNullOrEmpty(type) || (x.CreatedDate >= dateSearch))).Count();
            //var cardJobPeople = cardJob.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.UpdatedBy) && (string.IsNullOrEmpty(type)(); || (x.UpdatedTime >= dateSearch))).GroupBy(x => new { UpdatedBy = !string.IsNullOrEmpty(x.UpdatedBy) ? x.UpdatedBy : "" }).Count

            return new
            {
                projectInsert,
                projectUpdate,
                projectDelete,
                projectPeople,
                poInsert = poSaleInsert + poBuyerInsert,
                poUpdate = poSaleUpdate + poBuyerUpdate,
                poDelete = poSaleDelete + poBuyerDelete,
                poPeople = poSalePeople + poBuyerPeople,
                employeeInsert,
                employeeUpdate,
                employeeDelete,
                fundInsert,
                fundUpdate,
                fundDelete,
                fundPeople,
                custommerInsert,
                custommerUpdate,
                custommerDelete,
                custommerPeople,
                supplierInsert,
                supplierUpdate,
                supplierDelete,
                supplierPeople,
                productInsert,
                productUpdate,
                productDelete,
                productPeople,
                cardJobInsert,
                cardJobUpdate,
                cardJobDelete,
            };
        }

        [HttpGet]
        public JsonResult HighchartFunds()
        {
            //var year = DateTime.Now.Year;
            //var query = _context.FundAccEntrys.Where(x => !x.IsDeleted && x.CreatedTime.Value.Year.Equals(year) && _context.FundCatReptExpss.Any(p => !p.IsDeleted && p.CatCode.Equals(x.CatCode)))
            //    .Select(p => new { p.AetType, p.Total, Month = p.CreatedTime.Value.Month }).OrderBy(p => p.Month).GroupBy(x => new { x.AetType })
            //    .Select(p => new
            //    {
            //        name = p.First().AetType.Equals("Receipt") ? "Thu" : "Chi",
            //        data = p.Where(x => x.AetType.Equals(p.First().AetType)).GroupBy(i => i.Month).Select(z => new { month = z.First().Month, value = z.Sum(i => i.Total) })
            //    }).ToList();

            var query = _context.VHighchartFunds.GroupBy(x => new { x.Name }).Select(p => new
            {
                name = p.First().Name,
                data = p.Where(x => x.Name.Equals(p.First().Name)).GroupBy(i => i.Month).Select(z => new { month = z.First().Month, value = z.Sum(i => i.Total) }),
            });

            return Json(query);
        }

        [HttpPost]
        public JsonResult HighchartProds()
        {
            //var year = DateTime.Now.Year;
            //var queryImport = _context.ProdReceivedDetails.Where(x => !x.IsDeleted && x.CreatedTime.Year.Equals(year))
            //    .Select(p => new { p.Quantity, p.QuantityIsSet, Month = p.CreatedTime.Month }).GroupBy(x => new { x.Month })
            //    .Select(p => new
            //    {
            //        Type = "Import",
            //        Month = p.First().Month,
            //        Total = p.Sum(y => y.Quantity),
            //    }).OrderBy(p => p.Month).ToList();

            //var queryExport = _context.ProdDeliveryDetails.Where(x => !x.IsDeleted && x.CreatedTime.Year.Equals(year))
            //    .Select(p => new { p.Quantity, Month = p.CreatedTime.Month }).GroupBy(x => new { x.Month })
            //    .Select(p => new
            //    {
            //        Type = "Export",
            //        Month = p.First().Month,
            //        Total = p.Sum(y => y.Quantity),
            //    }).OrderBy(p => p.Month).ToList();

            //var query = queryImport.Union(queryExport);
            //var rs = query.GroupBy(x => x.Type).Select(p => new
            //{
            //    name = p.First().Type.Equals("Import") ? "Nhập" : "Xuất",
            //    data = p.Where(x => x.Type.Equals(p.First().Type)).GroupBy(i => i.Month).Select(z => new { month = z.First().Month, value = z.Sum(i => i.Total) })
            //});

            var rs = _context.VHighchartProds.GroupBy(x => new { x.Name }).Select(p => new
            {
                name = p.First().Name,
                data = p.Where(x => x.Name.Equals(p.First().Name)).GroupBy(i => i.Month).Select(z => new { month = z.First().Month, value = z.Sum(i => i.Total) }),
            });

            return Json(rs);
        }


      
        #endregion

        #region Map
        public class SearchMap
        {
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string UserName { get; set; }
        }
        public class WorkSession
        {
            public int Id { get; set; }
            public string CheckTitle { get; set; }
        }
        //[HttpPost]
        //public JsonResult GetRouteInOut([FromBody] SearchMap search)
        //{
        //    var today = DateTime.Now;
        //    var fromDate = !string.IsNullOrEmpty(search.FromDate) ? DateTime.ParseExact(search.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
        //    var toDate = !string.IsNullOrEmpty(search.ToDate) ? DateTime.ParseExact(search.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

        //    List<ResumRouteInOut> resum = new List<ResumRouteInOut>();

        //    var data = from a in _context.ShiftLogs
        //               where ((fromDate == null) || (a.ChkinTime.Value.Date >= fromDate.Value.Date))
        //               //&& ((toDate == null) || ((a.ChkoutTime.HasValue ? a.ChkoutTime.Value.Date : today.Date) <= toDate.Value.Date))
        //               && (string.IsNullOrEmpty(search.UserName) || a.CreatedBy.Equals(search.UserName))
        //               group a by a.CreatedBy into g
        //               select g;
        //    var DataTracking = _context.UserTrackingGpss.FirstOrDefault(x => x.UserName == search.UserName && x.TrackingDate.Value.Date == fromDate.Value.Date);
        //    foreach (var item in data)
        //    {
        //        var shifts = item.ToList();
        //        List<RouteInOut> routes = new List<RouteInOut>();
        //        foreach (var shif in shifts)
        //        {
        //            if (shif.ChkinTime.HasValue)
        //            {
        //                var routeInOut = new RouteInOut
        //                {
        //                    Action = "In",
        //                    Address = shif.ChkinLocationTxt,
        //                    Time = shif.ChkinTime.Value.ToString("HH:mm:ss dd/MM/yyyy"),
        //                    LatLng = shif.ChkinLocationGps,
        //                    listItemActivity = (from c in _context.WORKItemSessionResults
        //                                        join d in _context.SessionItemChkItems on c.WorkSession equals d.Session
        //                                        join e in _context.CardItemChecks on d.Item equals e.ChkListCode
        //                                        join f in _context.ShiftLogs on c.ShiftCode equals f.ShiftCode
        //                                        where f.ShiftCode.Equals(shif.ShiftCode) && c.IsDeleted == false
        //                                        select new WorkSession
        //                                        {
        //                                            Id = e.Id,
        //                                            CheckTitle = e.CheckTitle,
        //                                        }).DistinctBy(x => x.Id).ToList(),

        //                };
        //                routes.Add(routeInOut);
        //            }
        //            if (shif.ChkoutTime.HasValue)
        //            {
        //                var routeInOut = new RouteInOut
        //                {
        //                    Action = "Out",
        //                    Address = shif.ChkoutLocationTxt,
        //                    Time = shif.ChkoutTime.Value.ToString("HH:mm:ss dd/MM/yyyy"),
        //                    LatLng = shif.ChkoutLocationGps,
        //                    listItemActivity = (from c in _context.WORKItemSessionResults
        //                                        join d in _context.SessionItemChkItems on c.WorkSession equals d.Session
        //                                        join e in _context.CardItemChecks on d.Item equals e.ChkListCode
        //                                        join f in _context.ShiftLogs on c.ShiftCode equals f.ShiftCode
        //                                        where c.ShiftCode.Equals(shif.ShiftCode) && c.IsDeleted == false
        //                                        select new WorkSession
        //                                        {
        //                                            Id = e.Id,
        //                                            CheckTitle = e.CheckTitle,
        //                                        }).DistinctBy(x => x.Id).ToList(),
        //                };
        //                routes.Add(routeInOut);
        //            }
        //        }
        //        var resumRoute = new ResumRouteInOut
        //        {
        //            UserName = item.Key,
        //            RouteInOuts = routes,
        //            DataGps = DataTracking != null ? DataTracking.DataGps : ""
        //        };
        //        resum.Add(resumRoute);
        //    }
        //    return Json(resum);
        //}
        public class RouteInOut
        {
            public string Action { get; set; }
            public string Address { get; set; }
            public string Time { get; set; }
            public string LatLng { get; set; }
            public List<WorkSession> listItemActivity { get; set; }

        }
        public class ResumRouteInOut
        {
            public string UserName { get; set; }
            public string DataGps { get; set; }
            public List<RouteInOut> RouteInOuts { get; set; }
        }
        #endregion

        #region Object
        public class JTableModelCustom : JTableModel
        {
            public string DepartmentCode { get; set; }
            public string GroupUserCode { get; set; }
            public string UserName { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string Code { get; set; }
            public string Title { get; set; }
        }
        public class TimePieModel
        {
            public string TimePieBuy { get; set; }
        }

        public class SearchAssetModel
        {
            public string Type { get; set; }
            public string Department { get; set; }
            public string Year { get; set; }
            public string PieYear { get; set; }
        }

        public class SystemLog
        {
            public int Id { get; set; }
            public string Name { get; set; }
            public string Controller { get; set; }
            public string Action { get; set; }
            public string RequestBody { get; set; }
            public string IP { get; set; }
            public string CreatedBy { get; set; }
            public string GivenName { get; set; }
            public string TotalRow { get; set; }
            public string CreatedTime { get; set; }
        }
        public class ProjectManagementJtable : JTableModel
        {
            public string UserId { get; set; }
            public string Code { get; set; }
            public string Name { get; set; }
            public string Status { get; set; }
            public string DueDate { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
        }
        public class AssetJtable : JTableModel
        {
            public string UserId { get; set; }
            public string Code { get; set; }
            public string Name { get; set; }
            public string Status { get; set; }
        }
        public class CMSItemsJTableModel : JTableModel
        {
            public int Id { get; set; }
            public string Title { get; set; }
            public string PostFromDate { get; set; }
            public string PostToDate { get; set; }
            public string CreFromDate { get; set; }
            public string CreToDate { get; set; }
            public int? Category { get; set; }
            public bool? Status { get; set; }
            public int? TypeItem { get; set; }

        }
        public class CardNotifi
        {
            public int CardID { get; set; }
            public string CardCode { get; set; }
            public string CardName { get; set; }
            public DateTime BeginTime { get; set; }
            public DateTime? EndTime { get; set; }
            public string ListUserView { get; set; }
            public string ListName { get; set; }
            public string BoardName { get; set; }
            public string Status { get; set; }
            public string ProjectName { get; set; }
            public string ContractName { get; set; }
            public string UpdatedTimeTxt { get; set; }
            public string WorkType { get; set; }
            public string Priority { get; set; }
        }

        #endregion

        #region Log Message
        [HttpPost]
        public void InsertLogMessage([FromBody] LogMessage message)
        {
            var log = new LogMessage
            {
                Channel = message.Channel,
                TimeChat = DateTime.Now,
                Content = message.Content,
                User = message.User,
                GivenName = message.GivenName,
                Image = message.Image,
                CreatedBy = ESEIM.AppContext.UserName,
                CreatedTime = DateTime.Now
            };
            _context.LogMessages.Add(log);
            _context.SaveChanges();
        }
        [HttpGet]
        public JsonResult GetLogMessage(string channel, int page)
        {
            //mặc định tin nhắn trong 1 ngày
            int intBeginFor = (page - 1) * 20;
            var today = DateTime.Now;
            var messages = _context.LogMessages.Where(x => x.Channel == channel)
                .Select(x => new
                {
                    x.Channel,
                    x.Content,
                    x.GivenName,
                    x.User,
                    x.Image,
                    TimeChat = x.TimeChat.ToString("HH:mm"),
                    Time = x.TimeChat
                }).OrderByDescending(x => x.Time).Skip(intBeginFor).Take(20);
            var data = messages.OrderBy(x => x.Time);
            return Json(data);
        }

        [HttpGet]
        public JsonResult GetMoreLogMessage(string channel, int page)
        {
            //mặc định tin nhắn trong 1 ngày
            int intBeginFor = (page - 1) * 20;
            var today = DateTime.Now;
            var messages = _context.LogMessages.Where(x => x.Channel == channel)
                .Select(x => new
                {
                    x.Channel,
                    x.Content,
                    x.GivenName,
                    x.User,
                    x.Image,
                    TimeChat = x.TimeChat.ToString("HH:mm"),
                    Time = x.TimeChat
                }).OrderByDescending(x => x.Time).Skip(intBeginFor).Take(20);
            return Json(messages);
        }

       

       
        #endregion

        #region Language
       
        #endregion


    }
}



