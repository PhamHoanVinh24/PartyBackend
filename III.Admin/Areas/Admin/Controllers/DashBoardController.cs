using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Utils;
using III.Admin.Controllers;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using ESEIM.Models;
using System;
using System.Collections.Generic;
using III.Domain.Enums;
using System.Globalization;
using FTU.Utils.HelperNet;
using Microsoft.EntityFrameworkCore;
using System.Data;
using System.IO;
using Syncfusion.EJ2.Linq;
using SmartBreadcrumbs.Attributes;
using Newtonsoft.Json;
using Microsoft.AspNetCore.Authorization;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class DashBoardController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IStringLocalizer<DashBoardController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IRepositoryService _repositoryService;

        public DashBoardController(EIMDBContext context, IStringLocalizer<DashBoardController> stringLocalizer,
            IStringLocalizer<SharedResources> sharedResources, IRepositoryService repositoryService)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
            _repositoryService = repositoryService;
        }

        [DefaultBreadcrumb("ViewData.CrumbDashBoard")]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            return View();
        }
        #region combobox
        [AllowAnonymous]
        [HttpGet]
        public JsonResult GetObjTypeJC()
        {
            var data = _context.Transitions.Where(x => !x.IsDeleted)
                .Select(x => new { Code = x.TrsCode, Name = x.TrsTitle });
            return Json(data);
        }
        #endregion

        #region Notification
        [AllowAnonymous]
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

        [AllowAnonymous]
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

        [AllowAnonymous]
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
        [AllowAnonymous]
        [HttpGet]
        public object GetCmsItemLastest()
        {
            var data = (from a in _context.cms_items.Where(x => x.published && x.featured_ordering == 1)
                            //join b in _context.cms_attachments on a.id equals b.item_id into b1
                            //from b2 in b1.DefaultIfEmpty()
                        join b in _context.EDMSRepoCatFiles.Where(x => x.ObjectType.Equals("CMS_ITEM")) on a.id.ToString() equals b.ObjectCode into b1
                        from b in b1.DefaultIfEmpty()
                        join c in _context.EDMSFiles.Where(x => !x.IsDeleted && (x.IsFileMaster == true || x.IsFileMaster == null)) on b.FileCode equals c.FileCode into c1
                        from c in c1.DefaultIfEmpty()
                        select new
                        {
                            ItemId = a.id,
                            Title = a.title,
                            DatePost = a.date_post.HasValue ? a.date_post.Value.ToString("HH:mm dd/MM/yyyy") : "",
                            a.date_post,
                            FileName = c != null ? c.FileName : "",
                            FileUrl = c != null ? c.Url : "",
                            FileTypePhysic = c != null ? c.FileTypePhysic : "",
                            FileCode = b != null ? b.FileCode : "",
                            Id = b != null ? b.Id : 0,
                            SizeOfFile = c != null ? c.FileSize.HasValue ? c.FileSize.Value : 0 : 0,
                            CloudId = c != null ? c.CloudFileId : ""
                        }).GroupBy(p => new { p.ItemId, p.Title }).Select(z => new
                        {
                            z.Key.ItemId,
                            z.Key.Title,
                            DatePost = z.FirstOrDefault().DatePost,
                            date_post = z.FirstOrDefault().date_post,
                            ListFile = z
                        }).OrderByDescending(x => x.date_post).Take(10);
            return data;
        }

        [AllowAnonymous]
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
        [AllowAnonymous]
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
        [AllowAnonymous]
        [HttpGet]
        public object GetCountFile()
        {
            var listFileByUser = _context.FilesShareObjectUsers.Where(x => !x.IsDeleted && x.UserShares.Any(p => p.Code.Equals(User.Identity.Name)))
                                                      .Select(p => new
                                                      {
                                                          p.FileID,
                                                          p.ListUserShare,
                                                          p.UserShares
                                                      }).ToList();
            var session = HttpContext.GetSessionUser();
            var data = from a in _context.EDMSFiles.Where(x => !x.IsDeleted && (x.IsFileMaster == null || x.IsFileMaster == true))
                       join b in _context.EDMSRepoCatFiles on a.FileCode equals b.FileCode
                       join e in _context.EDMSCategorys.Where(x => !x.IsDeleted) on b.CatCode equals e.CatCode
                       where (listFileByUser.Any(x => x.FileID.Equals(a.FileCode)) || a.CreatedBy.Equals(User.Identity.Name) || session.IsAllData)
                       select new { a };

            return new
            {
                SumFile = data.Count()
            };
        }
        [AllowAnonymous]
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

        [AllowAnonymous]
        [HttpGet]
        public object GetCountFunds()
        {
            var data = _context.FundAccEntrys.Where(x => !x.IsDeleted);
            var sumgive = data.Where(x => x.AetType == "Receipt" && x.StatusObject == "FUND_APPROVED").ToList();
            var sumpay = data.Where(x => x.AetType == "Expense" && x.StatusObject == "FUND_APPROVED").ToList();
            var needgive = data.Where(x => x.AetType == "Receipt" && x.StatusObject == "FUND_CREATED").ToList();
            var needpay = data.Where(x => x.AetType == "Expense" && x.StatusObject == "FUND_CREATED").ToList();

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

        [AllowAnonymous]
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
        [AllowAnonymous]
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

        [AllowAnonymous]
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
        [AllowAnonymous]
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
                item.b.LastBudget = item.b.LastBudget *
                    (_context.FundExchagRates.FirstOrDefault(x => !x.IsDeleted && x.Currency == item.b.Currency) != null ?
                    _context.FundExchagRates.FirstOrDefault(x => !x.IsDeleted && x.Currency == item.b.Currency).Rate : 0);
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

        [AllowAnonymous]
        [HttpGet]
        public object GetCountProject()
        {
            var project = _context.Projects.Where(x => !x.FlagDeleted);
            var numProjectPending = project.Where(x => x.StatusObject == "PROJECT_STATUS_PENDING");
            var numProjectsuccess = project.Where(x => x.StatusObject == "PROJECT_STATUS_SUCCESS");
            var numProjectcancel = project.Where(x => x.StatusObject == "PROJECT_STATUS_CANCLED");
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

        [AllowAnonymous]
        [HttpGet]
        public object GetCountBuyer()
        {
            var session = HttpContext.GetSessionUser();
            var Buyer = _context.PoBuyerHeaders.Where(x => !x.IsDeleted
                        && (session.IsAllData || x.CreatedBy.Equals(session.UserName)));

            var numBuyerPending = Buyer.Where(x => x.StatusObject == "CONTRACT_STATUS_PO_SUP_DEPENDING");
            var numBuyersuccess = Buyer.Where(x => x.StatusObject == "CONTRACT_STATUS_PO_SUP_SUCCESS");
            var numBuyercancel = Buyer.Where(x => x.StatusObject == "CONTRACT_STATUS_PO_SUP_CANCEL");

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

        [AllowAnonymous] 
        [HttpGet]
        public JsonResult GetSalesAndLiabilities()
        {
            List<object> myObjectList = new List<object>();
            for (int i = 1; i <= 12; i++)
            {
                var sales = _context.FundAccEntrys.Where(x => x.ObjType == "CONTRACT" && x.CreatedTime.Value.Month == i);
                var liabilities = _context.FundAccEntrys.Where(x => x.ObjType == "CONTRACT_PO" && x.CreatedTime.Value.Month == i);
                var salseSum = sales.ToList().Count();
                var liabilitiesSum = liabilities.ToList().Count();
                decimal SumSales = 0;
                decimal SumLiabilities = 0;
                foreach (var item in sales)
                {
                    SumSales += GetTotalSaleLiabilities(item.ObjCode);
                }
                foreach (var item in liabilities)
                {
                    SumLiabilities += GetTotalSaleLiabilities(item.ObjCode);
                }

                var newObject = new
                {
                    Sales = SumSales,
                    Liabilities = SumLiabilities
                };

                myObjectList.Add(newObject);
            }

            return Json(myObjectList);
               
        }

        [AllowAnonymous]
        [HttpGet]
        public object GetImportDay()
        {
            var listDayInMonth = Enumerable.Range(1, DateTime.DaysInMonth(DateTime.Now.Year, DateTime.Now.Month))  // Days: 1, 2 ... 31 etc.
                    .Select(day => new DateTime(DateTime.Now.Year, DateTime.Now.Month, day)) // Map each day to a date
                    .ToList(); // Load dates into a list
            return (from a in listDayInMonth
                    join b in _context.ProductImportDetails.Where(x => x.CreatedTime.Day == DateTime.Now.Day).ToList()
                    on a.Date equals b.CreatedTime.Date into b1
                    from b in b1.DefaultIfEmpty()
                    select new
                    {
                        CreatedTime = a,
                        Detail = b
                    })
                .GroupBy(x => x.CreatedTime)
                .Select(g => new
                {
                    IndexDay = g.Key.Day,
                    SumDay = g.Where(x => x.Detail != null).Count()
                });
        }

        [AllowAnonymous]
        [HttpGet]
        public object GetExPortDay()
        {
            var listDayInMonth = Enumerable.Range(1, DateTime.DaysInMonth(DateTime.Now.Year, DateTime.Now.Month))  // Days: 1, 2 ... 31 etc.
                    .Select(day => new DateTime(DateTime.Now.Year, DateTime.Now.Month, day)) // Map each day to a date
                    .ToList(); // Load dates into a list
            return (from a in listDayInMonth
                    join b in _context.ProductExportDetails.Where(x => x.CreatedTime.Day == DateTime.Now.Day).ToList()
                    on a.Date equals b.CreatedTime.Date into b1
                    from b in b1.DefaultIfEmpty()
                    select new
                    {
                        CreatedTime = a,
                        Detail = b
                    })
                .GroupBy(x => x.CreatedTime)
                .Select(g => new
                {
                    IndexDay = g.Key.Day,
                    SumDay = g.Where(x => x.Detail != null).Count()
                });
        }

        [HttpGet]
        public object GetCountCardWork()
        {
            //var CardWork = _context.WORKOSCards.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.Status) && x.Status != "TRASH");
            //var CardWorkPending = CardWork.Where(x => x.Status == "START");
            //var CardWorkSuccess = CardWork.Where(x => x.Status == "DONE");
            //var CardWorkcancel = CardWork.Where(x => x.Status == "CANCLED");
            //var CardWorkExpires = CardWork.Where(x => x.Deadline < DateTime.Now);
            ////var progressProject = Math.Round(Convert.ToDouble(numProjectPending) / project.Count() * 100);
            //return new
            //{
            //    sumCardWork = CardWork.Count(),
            //    cardWorkPending = CardWorkPending.Count(),
            //    cardWorkSuccess = CardWorkSuccess.Count(),
            //    cardWorkcancel = CardWorkcancel.Count(),
            //    cardWorkExpires = CardWorkExpires.Count()

            //};
            var data = _context.VCountCardWorks.Select(x => new
            {
                sumCardWork = x.SumCardWork,
                cardWorkPending = x.CardWorkPending,
                cardWorkSuccess = x.CardWorkSuccess,
                cardWorkcancel = x.CardWorkcancel,
                cardWorkExpires = x.CardWorkExpires
            }).FirstOrDefault();
            return data;
        }

        [AllowAnonymous]
        [HttpGet]
        public object GetCountWorkFlow()
        {
            var data = (from a in _context.WorkflowInstances.Where(x => !x.IsDeleted.Value)
                        join b in _context.WorkFlows.Where(x => !x.IsDeleted.Value) on a.WorkflowCode equals b.WfCode
                        join c in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Status equals c.CodeSet into c1
                        from c in c1.DefaultIfEmpty()
                        select new
                        {
                            a.Status,
                            StatusName = c != null ? c.ValueSet : "",
                            a.WfInstCode,
                            a.WfInstName,
                            a.UserManager,
                            a.CreatedBy,
                            a.UpdatedBy,
                            a.UpdatedTime
                        }).DistinctBy(x => x.WfInstCode);

            var WorkflowPending = data.Where(x => x.Status == "STATUS_WF_PENDING");
            var WorkflowSuccess = data.Where(x => x.Status == "STATUS_WF_SUCCESS");
            var Workflowcancel = data.Where(x => x.Status == "STATUS_WF_CANCEL");
            var WorkflowExpires = data.Where(x => x.Status == "EXPIRES");

            var session = HttpContext.GetSessionUser();
            if (session.IsAllData)
            {
                return new
                {
                    sumWorkflow = data.Count(),
                    WorkflowPending = WorkflowPending.Count(),
                    WorkflowSuccess = WorkflowSuccess.Count(),
                    Workflowcancel = Workflowcancel.Count(),
                    WorkflowExpires = WorkflowExpires.Count(),
                    list = data
                };
            }
            else
            {
                var sumWf = 0;
                var pendingWf = 0;
                var succedWf = 0;
                var cancelWf = 0;
                var expiresWf = 0;
                foreach (var item in data)
                {
                    var acts = _context.ActivityInstances.Where(x => !x.IsDeleted && x.WorkflowCode.Equals(item.WfInstCode));
                    //var assigns = _context.ExcuterControlRoleInsts.Where(x => acts.Any(k => k.ActivityInstCode.Equals(x.ActivityCodeInst))
                    //        && !x.IsDeleted && x.UserId.Equals(ESEIM.AppContext.UserId));

                    var userManager = !string.IsNullOrEmpty(item.UserManager) ? JsonConvert.DeserializeObject<List<UserManagerWF>>(item.UserManager) : new List<UserManagerWF>();

                    if (/*assigns.Any() ||*/ item.CreatedBy.Equals(ESEIM.AppContext.UserName) || userManager.Any(x => x.UserId == ESEIM.AppContext.UserId))
                    {
                        sumWf = sumWf + 1;
                        if (item.Status == "STATUS_WF_PENDING")
                        {
                            pendingWf = pendingWf + 1;
                        }
                        else if (item.Status == "STATUS_WF_SUCCESS")
                        {
                            succedWf = succedWf + 1;
                        }
                        else if (item.Status == "STATUS_WF_CANCEL")
                        {
                            cancelWf = cancelWf + 1;
                        }
                        else if (item.Status == "EXPIRES")
                        {
                            expiresWf = expiresWf + 1;
                        }
                    }
                }
                return new
                {
                    sumWorkflow = sumWf,
                    WorkflowPending = pendingWf,
                    WorkflowSuccess = succedWf,
                    Workflowcancel = cancelWf,
                    WorkflowExpires = expiresWf,
                    list = data
                };
            }
        }

        [AllowAnonymous]
        [HttpGet]
        public object GetActionCardWork()
        {
            //var data = (from a in _context.WORKOSCards.Where(x => !x.IsDeleted)
            //            join b in _context.Users on a.CreatedBy equals b.UserName
            //            select new
            //            {
            //                cardCode = a.CardCode,
            //                cardName = a.CardName,
            //                status = _context.CommonSettings.Where(x => !x.IsDeleted && x.CodeSet.Equals(a.Status)).Select(x => x.ValueSet),
            //                updateby = b.GivenName,
            //                updatetime = a.UpdatedTime
            //            }).OrderByDescending(x => x.updatetime).Take(5);

            var data = _context.VActionCards;
            return data;
        }

        [AllowAnonymous]
        [HttpGet]
        public object GetCountSale()
        {
            var Sale = _context.PoSaleHeaders.Where(x => !x.IsDeleted).ToList();

            var numSalePending = Sale.Where(x => x.StatusObject == "CONTRACT_STATUS_PO_SUP_DEPENDING").ToList();
            var numSaleSuccess = Sale.Where(x => x.StatusObject == "CONTRACT_STATUS_PO_SUP_SUCCESS").ToList();
            var numSalecancel = Sale.Where(x => x.StatusObject == "CONTRACT_STATUS_PO_SUP_CANCEL").ToList();
            foreach (var item in Sale)
            {
                item.LastBudget = item.LastBudget *
                    (_context.FundExchagRates.FirstOrDefault(x => !x.IsDeleted && x.Currency == item.Currency) != null ?
                    _context.FundExchagRates.FirstOrDefault(x => !x.IsDeleted && x.Currency == item.Currency).Rate : 0);
            }
            foreach (var item in numSalePending)
            {
                item.LastBudget = item.LastBudget *
                    (_context.FundExchagRates.FirstOrDefault(x => !x.IsDeleted && x.Currency == item.Currency) != null ?
                    _context.FundExchagRates.FirstOrDefault(x => !x.IsDeleted && x.Currency == item.Currency).Rate : 0);
            }
            foreach (var item in numSaleSuccess)
            {
                item.LastBudget = item.LastBudget *
                    (_context.FundExchagRates.FirstOrDefault(x => !x.IsDeleted && x.Currency == item.Currency) != null ?
                    _context.FundExchagRates.FirstOrDefault(x => !x.IsDeleted && x.Currency == item.Currency).Rate : 0);
            }
            foreach (var item in numSalecancel)
            {
                item.LastBudget = item.LastBudget *
                    (_context.FundExchagRates.FirstOrDefault(x => !x.IsDeleted && x.Currency == item.Currency) != null ?
                    _context.FundExchagRates.FirstOrDefault(x => !x.IsDeleted && x.Currency == item.Currency).Rate : 0);
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

        [AllowAnonymous]
        [HttpGet]
        public object GetCountSaleDay()
        {


            var today = DateTime.Now;
            var startDate = new DateTime(today.Year, today.Month, today.Day, 0, 0, 0);
            var endDate = new DateTime(today.Year, today.Month, today.Day, today.Hour, today.Minute, today.Second);
            /*var today = DateTime.Now;*/
            var Sale = _context.PoSaleHeaders.Where(x => !x.IsDeleted && x.CreatedTime >= startDate && x.CreatedTime <= endDate).ToList();

            var numSalePending = Sale.Where(x => x.StatusObject == "CONTRACT_STATUS_PO_SUP_DEPENDING").ToList();
            var numSaleSuccess = Sale.Where(x => x.StatusObject == "CONTRACT_STATUS_PO_SUP_SUCCESS").ToList();
            var numSalecancel = Sale.Where(x => x.StatusObject == "CONTRACT_STATUS_PO_SUP_CANCEL").ToList();
            foreach (var item in Sale)
            {
                item.LastBudget = item.LastBudget *
                    (_context.FundExchagRates.FirstOrDefault(x => !x.IsDeleted && x.Currency == item.Currency) != null ?
                    _context.FundExchagRates.FirstOrDefault(x => !x.IsDeleted && x.Currency == item.Currency).Rate : 0);
            }
            foreach (var item in numSalePending)
            {
                item.LastBudget = item.LastBudget *
                    (_context.FundExchagRates.FirstOrDefault(x => !x.IsDeleted && x.Currency == item.Currency) != null ?
                    _context.FundExchagRates.FirstOrDefault(x => !x.IsDeleted && x.Currency == item.Currency).Rate : 0);
            }
            foreach (var item in numSaleSuccess)
            {
                item.LastBudget = item.LastBudget *
                    (_context.FundExchagRates.FirstOrDefault(x => !x.IsDeleted && x.Currency == item.Currency) != null ?
                    _context.FundExchagRates.FirstOrDefault(x => !x.IsDeleted && x.Currency == item.Currency).Rate : 0);
            }
            foreach (var item in numSalecancel)
            {
                item.LastBudget = item.LastBudget *
                    (_context.FundExchagRates.FirstOrDefault(x => !x.IsDeleted && x.Currency == item.Currency) != null ?
                    _context.FundExchagRates.FirstOrDefault(x => !x.IsDeleted && x.Currency == item.Currency).Rate : 0);
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

        public class TotalContractSaleLiabilities
        {
            public decimal Money { get; set; }
            public string Currency { get; set; }
            public string Type { get; set; }
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

        public decimal GetTotalSaleLiabilities(string contractPOCode)
        {
            var fundAccEntry = _context.FundAccEntrys.Where(x => !x.IsDeleted && x.ObjCode == contractPOCode).Select(x => new TotalContractSaleLiabilities { Money = x.Total, Type = x.AetType , Currency = x.Currency }).ToList();
            if (fundAccEntry.Any())
            {
                foreach (var item in fundAccEntry)
                {
                    if (item.Type == "Receipt")
                    {
                        item.Money = item.Money * (_context.FundExchagRates.FirstOrDefault(x => !x.IsDeleted && x.Currency == item.Currency)).Rate;

                    }

                    if (item.Type == "Expense")
                    {
                        item.Money = -1 * item.Money * (_context.FundExchagRates.FirstOrDefault(x => !x.IsDeleted && x.Currency == item.Currency)).Rate;
                    }
                }
            }
            var total = fundAccEntry.Sum(x => x.Money);

            return total;
        }

        [NonAction]
        public decimal GetTotalAmount(string PoSupCode)
        {
            var data = _context.PoBuyerDetails.Where(x => !x.IsDeleted && x.PoSupCode == PoSupCode).ToList();
            var total = data.Sum(x => x?.TotalAmount ?? 0);

            return total;
        }

        [AllowAnonymous]
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
        [AllowAnonymous]
        [HttpGet]
        public JsonResult GetCountAsset()
        {
            var data = _context.AssetMains.Where(x => !x.IsDeleted).ToList();
            var active = data.Where(x => x.Status == "ACTIVE").ToList();
            var Mainten = data.Where(x => x.Status == "MAINTEN").ToList();
            var Delete = data.Where(x => x.Status == "DELETE").ToList();

            foreach (var item in data)
            {
                var rate = string.IsNullOrEmpty(item.Currency) ? 1 : (_context.FundExchagRates.FirstOrDefault(x => !x.IsDeleted && x.Currency == item.Currency)).Rate;
                item.Cost = item.Cost * rate;
            }
            foreach (var item in active)
            {
                var rate = string.IsNullOrEmpty(item.Currency) ? 1 : (_context.FundExchagRates.FirstOrDefault(x => !x.IsDeleted && x.Currency == item.Currency)).Rate;
                item.Cost = item.Cost * rate;
            }
            foreach (var item in Mainten)
            {
                var rate = string.IsNullOrEmpty(item.Currency) ? 1 : (_context.FundExchagRates.FirstOrDefault(x => !x.IsDeleted && x.Currency == item.Currency)).Rate;
                item.Cost = item.Cost * rate;
            }
            foreach (var item in Delete)
            {
                var rate = string.IsNullOrEmpty(item.Currency) ? 1 : (_context.FundExchagRates.FirstOrDefault(x => !x.IsDeleted && x.Currency == item.Currency)).Rate;
                item.Cost = item.Cost * rate;
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
        [AllowAnonymous]
        [HttpGet]
        public object GetBranAndDepartment()
        {
            var orgs = _context.AdOrganizations.Where(x => x.IsEnabled).ToList();
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

                lstOrg.Add(orgModel);

                foreach (var k in lstOrg)
                {
                    var tuple = GetActOrg(k.Code);
                    k.Total = tuple.Item4;
                    k.Late = tuple.Item2;
                    k.CheckIn = tuple.Item1;
                    k.OffWork = tuple.Item3;
                }

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

        [AllowAnonymous]
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

        [AllowAnonymous]
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
        [AllowAnonymous]
        [HttpPost]
        public object SaveDashboardDataJson([FromBody] DashboardDataJson obj)

        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var item = _context.DashboardDataJsons.FirstOrDefault(x => x.ObjectType.Equals(obj.ObjectType));
                if (item != null)
                {
                    item.DataJson = obj.DataJson;
                    item.UpdatedBy = User.Identity.Name;
                    item.UpdatedTime = DateTime.Now;
                    _context.DashboardDataJsons.Update(item);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Bản ghi không tồn tại";
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
        public object GetDataJson()
        {
            var data = _context.DashboardDataJsons.Where(x => !x.IsDeleted);

            return data;
        }

        #endregion

        [AllowAnonymous]
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

        [AllowAnonymous]
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

        [AllowAnonymous]
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
                 Status = p.StatusObject
             }).GroupBy(x => new { x.Month })
             .Select(p => new
             {
                 Month = p.First().Month,
                 give = p.Where(x => x.AetType == "Receipt" && x.Status == "FUND_APPROVED" && x.Month == p.First().Month).Sum(x => x.Total),
                 pay = p.Where(x => x.AetType == "Expense" && x.Status == "FUND_APPROVED" && x.Month == p.First().Month).Sum(x => x.Total),
             }).OrderBy(p => p.Month).ToList();
            return data;
        }
        [AllowAnonymous]
        [HttpGet]
        public object AmchartSupplier()
        {
            var data = _context.VAmchartSuppliers.GroupBy(x => x.LstMonth);
            var lst = new List<AmChartCusSuptomerModel>();
            foreach (var item in data)
            {
                var obj = new AmChartCusSuptomerModel
                {
                    Month = item.Key,
                    sum = item.Count(),
                    Active = item.Where(x => x.Status == "CUSTOMER_ACTIVE").FirstOrDefault() != null ? item.Where(x => x.Status == "CUSTOMER_ACTIVE").FirstOrDefault().StatusCount : 0,
                    DeActive = item.Where(x => x.Status == "CUSTOMER_DEACTIVE").FirstOrDefault() != null ? item.Where(x => x.Status == "CUSTOMER_DEACTIVE").FirstOrDefault().StatusCount : 0,
                };
                lst.Add(obj);
            }

            return lst;

            //var timeNowYear = DateTime.Now.Year;
            //var data = _context.Suppliers.Where(a => !a.IsDeleted && a.CreatedTime.Value.Year == timeNowYear)
            // .Select(p => new
            // {
            //     Month = p.CreatedTime.Value.Month,
            // }).GroupBy(x => new { x.Month })
            // .Select(p => new
            // {
            //     Month = p.First().Month,
            //     sum = p.Count(),
            //     Active = _context.Suppliers.Where(x => !x.IsDeleted && x.Status == "CUSTOMER_ACTIVE" && x.CreatedTime.Value.Month.Equals(p.First().Month)).Count(),
            //     DeActive = _context.Suppliers.Where(x => !x.IsDeleted && x.Status == "CUSTOMER_DEACTIVE" && x.CreatedTime.Value.Month.Equals(p.First().Month)).Count(),
            // }).OrderBy(p => p.Month).ToList();
            //return data;
        }


        [AllowAnonymous]
        [HttpGet]
        public object AmchartCustomer()
        {
            var data = _context.VAmchartCardWorks.GroupBy(x => x.LstMonth);
            var lst = new List<AmChartCusSuptomerModel>();
            foreach (var item in data)
            {
                var obj = new AmChartCusSuptomerModel
                {
                    Month = item.Key,
                    sum = item.Count(),
                    Active = item.Where(x => x.Status == "CUSTOMER_ACTIVE").FirstOrDefault() != null ? item.Where(x => x.Status == "CUSTOMER_ACTIVE").FirstOrDefault().StatusCount : 0,
                    DeActive = item.Where(x => x.Status == "CUSTOMER_DEACTIVE").FirstOrDefault() != null ? item.Where(x => x.Status == "CUSTOMER_DEACTIVE").FirstOrDefault().StatusCount : 0,
                };
                lst.Add(obj);
            }

            return lst;

            //var timeNowYear = DateTime.Now.Year;
            //var data = _context.Customerss.Where(a => !a.IsDeleted && a.CreatedTime.Value.Year == timeNowYear)
            // .Select(p => new
            // {
            //   Month = p.CreatedTime.Value.Month,
            // }).GroupBy(x => new { x.Month })
            // .Select(p => new
            // {
            //     Month = p.First().Month,
            //     sum = p.Count(),
            //     Active = _context.Customerss.Where(x => !x.IsDeleted && x.ActivityStatus == "CUSTOMER_ACTIVE" && x.CreatedTime.Value.Month.Equals(p.First().Month)).Count(),
            //     DeActive = _context.Customerss.Where(x => !x.IsDeleted && x.ActivityStatus == "CUSTOMER_DEACTIVE" && x.CreatedTime.Value.Month.Equals(p.First().Month)).Count(),
            // }).OrderBy(p => p.Month).ToList();


            //return data;
        }

        public class AmChartCusSuptomerModel
        {
            public int Month { get; set; }
            public int sum { get; set; }
            public int Active { get; set; }
            public int DeActive { get; set; }
        }

        [AllowAnonymous]
        [HttpGet]
        public object AmchartProject()
        {
            var data = _context.VAmchartProjects.GroupBy(x => x.LstMonth);
            var lst = new List<AmchartProjectModel>();
            foreach (var item in data)
            {
                var obj = new AmchartProjectModel
                {
                    Month = item.Key,
                    sum = item.Count(),
                    cancel = item.Where(x => x.Status == "PROJECT_STATUS_CANCLED").FirstOrDefault() != null ? item.Where(x => x.Status == "PROJECT_STATUS_CANCLED").FirstOrDefault().StatusCount : 0,
                    success = item.Where(x => x.Status == "PROJECT_STATUS_SUCCESS").FirstOrDefault() != null ? item.Where(x => x.Status == "PROJECT_STATUS_SUCCESS").FirstOrDefault().StatusCount : 0,
                    pending = item.Where(x => x.Status == "PROJECT_STATUS_PENDING").FirstOrDefault() != null ? item.Where(x => x.Status == "PROJECT_STATUS_PENDING").FirstOrDefault().StatusCount : 0,
                };
                lst.Add(obj);
            }

            return lst;

            //var timeNowYear = DateTime.Now.Year;
            //var data = _context.Projects.Where(a => !a.FlagDeleted && a.CreatedTime.Value.Year == timeNowYear)
            // .Select(p => new
            // {
            //     Month = p.CreatedTime.Value.Month,
            // }).GroupBy(x => new { x.Month })
            // .Select(p => new
            // {
            //     Month = p.First().Month,
            //     sum = p.Count(),
            //     pending = _context.Projects.Where(x => !x.FlagDeleted && x.Status == "PROJECT_STATUS_PENDING" && x.CreatedTime.Value.Month.Equals(p.First().Month)).Count(),
            //     success = _context.Projects.Where(x => !x.FlagDeleted && x.Status == "PROJECT_STATUS_SUCCESS" && x.CreatedTime.Value.Month.Equals(p.First().Month)).Count(),
            //     cancel = _context.Projects.Where(x => !x.FlagDeleted && x.Status == "PROJECT_STATUS_CANCLED" && x.CreatedTime.Value.Month.Equals(p.First().Month)).Count(),
            // }).OrderBy(p => p.Month).ToList();
            //return data;
        }

        public class AmchartProjectModel
        {
            public int Month { get; set; }
            public int sum { get; set; }
            public int pending { get; set; }
            public int success { get; set; }
            public int cancel { get; set; }
        }

        [AllowAnonymous]
        [HttpGet]
        public object AmchartCardWork()
        {
            var data = _context.VAmchartCardWorks.GroupBy(x => x.LstMonth).ToList();
            var lst = new List<AmChartCardWorkModel>();
            foreach (var item in data)
            {
                var obj = new AmChartCardWorkModel
                {
                    Month = item.Key,
                    cancel = item.Where(x => x.Status == "CANCLED").FirstOrDefault() != null ? item.Where(x => x.Status == "CANCLED").FirstOrDefault().StatusCount : 0,
                    success = item.Where(x => x.Status == "DONE").FirstOrDefault() != null ? item.Where(x => x.Status == "DONE").FirstOrDefault().StatusCount : 0,
                    pending = item.Where(x => x.Status == "START").FirstOrDefault() != null ? item.Where(x => x.Status == "START").FirstOrDefault().StatusCount : 0,
                    expires = 0,
                    sum = item.Where(x => x.Status != "TRASH").Sum(x => x.StatusCount),
                    created = item.Where(x => x.Status == "CREATED").FirstOrDefault() != null ? item.Where(x => x.Status == "CREATED").FirstOrDefault().StatusCount : 0
                };
                lst.Add(obj);
            }

            return lst;
        }
        public class AmChartCardWorkModel
        {
            public int Month { get; set; }
            public int sum { get; set; }
            public int pending { get; set; }
            public int success { get; set; }
            public int cancel { get; set; }
            public int expires { get; set; }
            public int created { get; set; }
        }

        [AllowAnonymous]
        [HttpGet]
        public object AmchartWorkFlow()
        {
            var data = _context.VAmchartWorkflowss.GroupBy(x => x.LstMonth);
            var lst = new List<AmChartCardWorkModel>();
            foreach (var item in data)
            {
                var obj = new AmChartCardWorkModel
                {
                    Month = item.Key,
                    sum = item.Count(),
                    cancel = item.Where(x => x.Status == "CANCLED").FirstOrDefault() != null ? item.Where(x => x.Status == "CANCLED").FirstOrDefault().StatusCount : 0,
                    success = item.Where(x => x.Status == "DONE").FirstOrDefault() != null ? item.Where(x => x.Status == "DONE").FirstOrDefault().StatusCount : 0,
                    pending = item.Where(x => x.Status == "START").FirstOrDefault() != null ? item.Where(x => x.Status == "START").FirstOrDefault().StatusCount : 0,
                    expires = 0,
                };
                lst.Add(obj);
            }

            return lst;
        }


        [AllowAnonymous]
        [HttpGet]
        public object AmchartAsset()
        {
            var data = _context.VAmchartAssets.GroupBy(x => x.LstMonth);
            var lst = new List<AmchartAssetModel>();
            foreach (var item in data)
            {
                var obj = new AmchartAssetModel
                {
                    Month = item.Key,
                    sum = item.Count(),
                    cancel = item.Where(x => x.Status == "CANCEL").FirstOrDefault() != null ? item.Where(x => x.Status == "CANCEL").FirstOrDefault().StatusCount : 0,
                    mainten = item.Where(x => x.Status == "MAINTEN").FirstOrDefault() != null ? item.Where(x => x.Status == "MAINTEN").FirstOrDefault().StatusCount : 0,
                    active = item.Where(x => x.Status == "ACTIVE").FirstOrDefault() != null ? item.Where(x => x.Status == "ACTIVE").FirstOrDefault().StatusCount : 0,
                };
                lst.Add(obj);
            }

            return lst;


            //var timeNowYear = DateTime.Now.Year;
            //var data = _context.AssetMains.Where(a => !a.IsDeleted && a.CreatedTime.Value.Year == timeNowYear)
            // .Select(p => new
            // {
            //     Month = p.CreatedTime.Value.Month,
            // }).GroupBy(x => new { x.Month })
            // .Select(p => new
            // {
            //     Month = p.First().Month,
            //     sum = p.Count(),
            //     active = _context.AssetMains.Where(x => !x.IsDeleted && x.Status == "ACTIVE" && x.CreatedTime.Value.Month.Equals(p.First().Month)).Count(),
            //     mainten = _context.AssetMains.Where(x => !x.IsDeleted && x.Status == "MAINTEN" && x.CreatedTime.Value.Month.Equals(p.First().Month)).Count(),
            //     cancel = _context.AssetMains.Where(x => !x.IsDeleted && x.Status == "CANCEL" && x.CreatedTime.Value.Month.Equals(p.First().Month)).Count(),
            // }).OrderBy(p => p.Month).ToList();
            //return data;
        }

        public JsonResult AmchartAssetDay()
        {
            var today = DateTime.Now;
            var startDate = new DateTime(today.Year, today.Month, today.Day, 0, 0, 0);
            var endDate = new DateTime(today.Year, today.Month, today.Day, today.Hour, today.Minute, today.Second);
            var assetsCreate = _context.Assets.Where(x => !x.IsDeleted && x.CreatedTime >= startDate && x.CreatedTime <= endDate).ToList();
            var assetsUpdate = _context.Assets.Where(x => !x.IsDeleted && x.UpdatedTime >= startDate && x.UpdatedTime <= endDate).ToList();
            var assets = assetsUpdate != null ? assetsUpdate : assetsCreate;

            return Json(assets);
        }

        public class AmchartAssetModel
        {
            public int Month { get; set; }
            public int sum { get; set; }
            public int active { get; set; }
            public int mainten { get; set; }
            public int cancel { get; set; }
        }

        [AllowAnonymous]
        [HttpGet]
        public object AmchartCountBuy()
        {
            var data = _context.VAmchartBuys.GroupBy(x => x.LstMonth);
            var lst = new List<AmchartProjectModel>();
            foreach (var item in data)
            {
                var obj = new AmchartProjectModel
                {
                    Month = item.Key,
                    sum = item.Count(),
                    cancel = item.Where(x => x.Status == "CONTRACT_STATUS_PO_SUP_CANCEL").FirstOrDefault() != null ? item.Where(x => x.Status == "CONTRACT_STATUS_PO_SUP_CANCEL").FirstOrDefault().StatusCount : 0,
                    success = item.Where(x => x.Status == "CONTRACT_STATUS_PO_SUP_SUCCESS").FirstOrDefault() != null ? item.Where(x => x.Status == "CONTRACT_STATUS_PO_SUP_SUCCESS").FirstOrDefault().StatusCount : 0,
                    pending = item.Where(x => x.Status == "CONTRACT_STATUS_PO_SUP_DEPENDING").FirstOrDefault() != null ? item.Where(x => x.Status == "CONTRACT_STATUS_PO_SUP_DEPENDING").FirstOrDefault().StatusCount : 0,
                };
                lst.Add(obj);
            }

            return lst;

            //var timeNowYear = DateTime.Now.Year;
            //var data = _context.PoBuyerHeaders.Where(a => !a.IsDeleted && a.CreatedTime.Value.Year == timeNowYear)
            // .Select(p => new
            // {
            //     Month = p.CreatedTime.Value.Month,
            //     //sum = _context.Projects.Where(x => !x.FlagDeleted && x.CreatedTime.Value.Month.Equals(p.CreatedTime.Value.Month)).Count()
            // }).GroupBy(x => new { x.Month })
            // .Select(p => new
            // {
            //     Month = p.First().Month,
            //     sum = p.Count(),
            //     pending = _context.PoBuyerHeaders.Where(x => !x.IsDeleted && x.Status == "CONTRACT_STATUS_PO_SUP_DEPENDING" && x.CreatedTime.Value.Month.Equals(p.First().Month)).Count(),
            //     success = _context.PoBuyerHeaders.Where(x => !x.IsDeleted && x.Status == "CONTRACT_STATUS_PO_SUP_SUCCESS" && x.CreatedTime.Value.Month.Equals(p.First().Month)).Count(),
            //     cancel = _context.PoBuyerHeaders.Where(x => !x.IsDeleted && x.Status == "CONTRACT_STATUS_PO_SUP_CANCEL" && x.CreatedTime.Value.Month.Equals(p.First().Month)).Count(),
            // }).OrderBy(p => p.Month).ToList();


            //return data;
        }
        [AllowAnonymous]
        [HttpGet]
        public JsonResult AmchartWorkWeek()
        {
            DateTime currentDate = DateTime.Now;
            /*DateTime currentDate = new DateTime(2018, 11, 10, 23, 59, 59);*/
            DateTime oneWeekAgo = currentDate.AddDays(-7);
            var assetsCreate = _context.Assets.Where(x => !x.IsDeleted && x.CreatedTime >= oneWeekAgo && x.CreatedTime <= currentDate).ToList();
            var assetsUpdate = _context.Assets.Where(x => !x.IsDeleted && x.UpdatedTime >= oneWeekAgo && x.UpdatedTime <= currentDate).ToList();
            var assets = assetsUpdate != null ? assetsUpdate : assetsCreate;
            return Json(assets);
        }

        [AllowAnonymous]
        [HttpGet]
        public object AmchartCountSale()
        {
            //var timeNowYear = DateTime.Now.Year;
            //var data = _context.PoSaleHeaders.Where(a => !a.IsDeleted && a.CreatedTime.Value.Year == timeNowYear)
            // .Select(p => new
            // {
            //     Month = p.CreatedTime.Value.Month,
            //     //sum = _context.Projects.Where(x => !x.FlagDeleted && x.CreatedTime.Value.Month.Equals(p.CreatedTime.Value.Month)).Count()
            // }).GroupBy(x => new { x.Month })
            // .Select(p => new
            // {
            //     Month = p.First().Month,
            //     sum = p.Count(),
            //     pending = _context.PoSaleHeaders.Where(x => !x.IsDeleted && x.Status == "CONTRACT_STATUS_PO_SUP_DEPENDING" && x.CreatedTime.Value.Month.Equals(p.First().Month)).Count(),
            //     success = _context.PoSaleHeaders.Where(x => !x.IsDeleted && x.Status == "CONTRACT_STATUS_PO_SUP_SUCCESS" && x.CreatedTime.Value.Month.Equals(p.First().Month)).Count(),
            //     cancel = _context.PoSaleHeaders.Where(x => !x.IsDeleted && x.Status == "CONTRACT_STATUS_PO_SUP_CANCEL" && x.CreatedTime.Value.Month.Equals(p.First().Month)).Count(),
            // }).OrderBy(p => p.Month).ToList();


            //return data;

            var data = _context.VAmchartSales.GroupBy(x => x.LstMonth);
            var lst = new List<AmchartProjectModel>();
            foreach (var item in data)
            {
                var obj = new AmchartProjectModel
                {
                    Month = item.Key,
                    sum = item.Count(),
                    cancel = item.Where(x => x.Status == "CONTRACT_STATUS_PO_SUP_CANCEL").FirstOrDefault() != null ? item.Where(x => x.Status == "CONTRACT_STATUS_PO_SUP_CANCEL").FirstOrDefault().StatusCount : 0,
                    success = item.Where(x => x.Status == "CONTRACT_STATUS_PO_SUP_SUCCESS").FirstOrDefault() != null ? item.Where(x => x.Status == "CONTRACT_STATUS_PO_SUP_SUCCESS").FirstOrDefault().StatusCount : 0,
                    pending = item.Where(x => x.Status == "CONTRACT_STATUS_PO_SUP_DEPENDING").FirstOrDefault() != null ? item.Where(x => x.Status == "CONTRACT_STATUS_PO_SUP_DEPENDING").FirstOrDefault().StatusCount : 0,
                };
                lst.Add(obj);
            }

            return lst;
        }

        [AllowAnonymous]
        [HttpPost]
        public object AmchartPieBuy([FromBody] TimePieModel obj)
        {
            var searchTime = !string.IsNullOrEmpty(obj.TimePieBuy) ? DateTime.ParseExact(obj.TimePieBuy, "MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var month = searchTime.HasValue ? searchTime.Value.Month.ToString() : "";
            var year = searchTime.HasValue ? searchTime.Value.Year.ToString() : "";

            //var data = (from a in _context.PoBuyerHeaders
            //            where !a.IsDeleted
            //               && (searchTime == null || ((a.CreatedTime.Value.Month == searchTime.Value.Month) && (a.CreatedTime.Value.Year == searchTime.Value.Year)))
            //            group a by a.Status into grp
            //            select new
            //            {
            //                status = grp.First().Status,
            //                country = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == grp.First().Status).ValueSet,
            //                litres = grp.Count()
            //            }).OrderBy(x => x.status);

            string[] param = new string[] { "@monthData", "@yearData" };
            object[] val = new object[] { month, year };
            DataTable rs = _repositoryService.GetDataTableProcedureSql("P_AMCHART_PIE_BUY", param, val);
            var data = CommonUtil.ConvertDataTable<PChartModel>(rs).Select(p => new
            {
                status = p.Status,
                country = p.Country,
                litres = p.Litres,
            }).OrderBy(p => p.status);

            return data;
        }
        [AllowAnonymous]
        [HttpPost]
        public object AmchartPieSale([FromBody] TimePieModel obj)
        {
            var searchTime = !string.IsNullOrEmpty(obj.TimePieBuy) ? DateTime.ParseExact(obj.TimePieBuy, "MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var month = searchTime.HasValue ? searchTime.Value.Month.ToString() : "";
            var year = searchTime.HasValue ? searchTime.Value.Year.ToString() : "";

            //var data = (from a in _context.PoSaleHeaders
            //            where !a.IsDeleted
            //               && (searchTime == null || ((a.CreatedTime.Value.Month == searchTime.Value.Month) && (a.CreatedTime.Value.Year == searchTime.Value.Year)))
            //            group a by a.Status into grp
            //            select new
            //            {
            //                status = grp.First().Status,
            //                country = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == grp.First().Status).ValueSet,
            //                litres = grp.Count()
            //            }).OrderBy(x => x.status);

            string[] param = new string[] { "@monthData", "@yearData" };
            object[] val = new object[] { month, year };
            DataTable rs = _repositoryService.GetDataTableProcedureSql("P_AMCHART_PIE_SALE", param, val);
            var data = CommonUtil.ConvertDataTable<PChartModel>(rs).Select(p => new
            {
                status = p.Status,
                country = p.Country,
                litres = p.Litres,
            }).OrderBy(p => p.status);


            return data;
        }
        [AllowAnonymous]
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
        [AllowAnonymous]
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
        [AllowAnonymous]
        [HttpPost]
        public object AmchartPieCustomers([FromBody] TimePieModel obj)
        {
            var searchTime = !string.IsNullOrEmpty(obj.TimePieBuy) ? DateTime.ParseExact(obj.TimePieBuy, "MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var month = searchTime.HasValue ? searchTime.Value.Month.ToString() : "";
            var year = searchTime.HasValue ? searchTime.Value.Year.ToString() : "";

            //var data = (from a in _context.Customerss
            //            where !a.IsDeleted
            //               && (searchTime == null || ((a.CreatedTime.Value.Month == searchTime.Value.Month) && (a.CreatedTime.Value.Year == searchTime.Value.Year)))
            //            group a by a.ActivityStatus into grp
            //            select new
            //            {
            //                ActivityStatus = grp.First().ActivityStatus,
            //                country = _context.CommonSettings.FirstOrDefault(y => y.CodeSet == grp.First().ActivityStatus).ValueSet ?? "Không xác định",
            //                litres = grp.Count()
            //            }).OrderBy(x => x.ActivityStatus);

            string[] param = new string[] { "@monthData", "@yearData" };
            object[] val = new object[] { month, year };
            DataTable rs = _repositoryService.GetDataTableProcedureSql("P_AMCHART_PIE_CUSTOMER", param, val);
            var data = CommonUtil.ConvertDataTable<PChartModel>(rs).Select(p => new
            {
                ActivityStatus = p.Status,
                country = p.Country,
                litres = p.Litres,
            }).OrderBy(p => p.ActivityStatus);

            return data;
        }
        [AllowAnonymous]
        [HttpPost]
        public object AmchartPieSupplier([FromBody] TimePieModel obj)
        {
            var searchTime = !string.IsNullOrEmpty(obj.TimePieBuy) ? DateTime.ParseExact(obj.TimePieBuy, "MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var month = searchTime.HasValue ? searchTime.Value.Month.ToString() : "";
            var year = searchTime.HasValue ? searchTime.Value.Year.ToString() : "";

            //var data = (from a in _context.Suppliers
            //            where !a.IsDeleted
            //               && (searchTime == null || ((a.CreatedTime.Value.Month == searchTime.Value.Month) && (a.CreatedTime.Value.Year == searchTime.Value.Year)))
            //            group a by a.Status into grp
            //            select new
            //            {
            //                status = grp.First().Status,
            //                country = _context.CommonSettings.FirstOrDefault(y => y.CodeSet == grp.First().Status).ValueSet ?? "Không xác định",
            //                litres = grp.Count()
            //            }).OrderBy(x => x.status);


            string[] param = new string[] { "@monthData", "@yearData" };
            object[] val = new object[] { month, year };
            DataTable rs = _repositoryService.GetDataTableProcedureSql("P_AMCHART_PIE_SUPPLIER", param, val);
            var data = CommonUtil.ConvertDataTable<PChartModel>(rs).Select(p => new
            {
                status = p.Status,
                country = p.Country,
                litres = p.Litres,
            }).OrderBy(p => p.status);

            return data;
        }
        [AllowAnonymous]
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
        [AllowAnonymous]
        [HttpPost]
        public object AmchartPieProject([FromBody] TimePieModel obj)
        {
            var searchTime = !string.IsNullOrEmpty(obj.TimePieBuy) ? DateTime.ParseExact(obj.TimePieBuy, "MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var month = searchTime.HasValue ? searchTime.Value.Month.ToString() : "";
            var year = searchTime.HasValue ? searchTime.Value.Year.ToString() : "";

            //var data = (from a in _context.Projects
            //            where !a.FlagDeleted
            //               && (searchTime == null || ((a.StartTime.Month == searchTime.Value.Month) && (a.StartTime.Year == searchTime.Value.Year)))
            //            group a by a.Status into grp
            //            select new
            //            {
            //                Status = grp.First().Status,
            //                country = _context.CommonSettings.FirstOrDefault(y => y.CodeSet == grp.First().Status).ValueSet ?? "Không xác định",
            //                litres = grp.Count()
            //            }).OrderBy(x => x.Status);

            string[] param = new string[] { "@monthData", "@yearData" };
            object[] val = new object[] { month, year };
            DataTable rs = _repositoryService.GetDataTableProcedureSql("P_AMCHART_PIE_PROJECT", param, val);
            var data = CommonUtil.ConvertDataTable<PChartModel>(rs).Select(p => new
            {
                Status = p.Status,
                country = p.Country,
                litres = p.Litres,
            }).OrderBy(p => p.Status);

            return data;
        }
        [AllowAnonymous]
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
        [AllowAnonymous]
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

        [AllowAnonymous]
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
        [AllowAnonymous]
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

        [AllowAnonymous]
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

        [HttpGet]
        public string vatcoweek()
        {

            DateTime startDate = new DateTime(2022, 8, 1); // Ngày đầu tháng
            DateTime endDate = startDate.AddMonths(1).AddDays(-1); // Ngày cuối tháng

            var result = from d in _context.ProductInStocks
                         where d.CreatedTime >= startDate && d.CreatedTime <= endDate
                         group d by new { Year = d.CreatedTime.Year, Month = d.CreatedTime.Month, Week = (d.CreatedTime.Day - 1) / 7 + 1 } into weekGroup
                         orderby weekGroup.Key.Year, weekGroup.Key.Month, weekGroup.Key.Week
                         select new
                         {
                             Year = weekGroup.Key.Year,
                             Month = weekGroup.Key.Month,
                             Week = weekGroup.Key.Week,
                             DataItems = weekGroup.ToList()
                         };

            foreach (var week in result)
            {
                Console.WriteLine($"Year: {week.Year}, Month: {week.Month}, Week: {week.Week}");
                foreach (var dataItem in week.DataItems)
                {
                    Console.WriteLine($"Date: {dataItem.CreatedTime}");
                }
            }
            return "ok";
        }

        [AllowAnonymous]
        [HttpGet]
        public object GetImportWeek()
        {
            Func<DateTime, int> weekProjector =
        d => CultureInfo.CurrentCulture.Calendar.GetWeekOfYear(
             d,
             CalendarWeekRule.FirstFourDayWeek,
         DayOfWeek.Sunday);
            var listDayInMonth = Enumerable.Range(1, DateTime.DaysInMonth(DateTime.Now.Year, DateTime.Now.Month))  // Days: 1, 2 ... 31 etc.
                    .Select(day => new DateTime(DateTime.Now.Year, DateTime.Now.Month, day)) // Map each day to a date
                    .ToList(); // Load dates into a list
            return (from a in listDayInMonth 
                    join b in _context.ProductImportDetails.Where(x => x.CreatedTime.Month == DateTime.Now.Month).ToList()
                    on a.Date equals b.CreatedTime.Date into b1
                    from b in b1.DefaultIfEmpty()
                    select new
                    {
                        CreatedTime = a,
                        Detail = b
                    })
                .GroupBy(x => weekProjector(x.CreatedTime))
                .Select(g => new
                {
                    IndexWeek = g.Key,
                    SumWeek = g.Where(x => x.Detail != null).Sum(x => x.Detail.Quantity)
                });
        }


        [AllowAnonymous]
        [HttpGet]
        public object GetExportWeek()
        {
            Func<DateTime, int> weekProjector =
        d => CultureInfo.CurrentCulture.Calendar.GetWeekOfYear(
             d,
             CalendarWeekRule.FirstFourDayWeek,
         DayOfWeek.Sunday);
            var listDayInMonth = Enumerable.Range(1, DateTime.DaysInMonth(DateTime.Now.Year, DateTime.Now.Month))  // Days: 1, 2 ... 31 etc.
                    .Select(day => new DateTime(DateTime.Now.Year, DateTime.Now.Month, day)) // Map each day to a date
                    .ToList(); // Load dates into a list
            return (from a in listDayInMonth
                    join b in _context.ProductExportDetails.Where(x => x.CreatedTime.Month == DateTime.Now.Month).ToList()
                    on a.Date equals b.CreatedTime.Date into b1
                    from b in b1.DefaultIfEmpty()
                    select new
                    {
                        CreatedTime = a,
                        Detail = b
                    })
                .GroupBy(x => weekProjector(x.CreatedTime))
                .Select(g => new
                {
                    IndexWeek = g.Key,
                    SumWeek = g.Where(x => x.Detail != null).Sum(x => x.Detail.Quantity)
                });
        }

        [AllowAnonymous]
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

        [AllowAnonymous]
        [HttpPost]
        public object GetCountWorkflowHome()
        {
            var session = HttpContext.GetSessionUser();
            var wfs = from a in _context.WorkflowInstances.Where(x => !x.IsDeleted.Value)
                      join b in _context.WorkFlows.Where(x => !x.IsDeleted.Value) on a.WorkflowCode equals b.WfCode
                      select new
                      {
                          a.WfInstCode,
                          b.WfName,
                          a.Status, //Đang làm,
                          a.UserManager
                      };
            if (session.IsAllData)
            {
                var wfDo = wfs.Where(x => x.Status.Equals("STATUS_WF_PENDING"));
                var cards = _context.WORKOSCards.Where(x => !x.IsDeleted && x.Status != "TRASH" && !string.IsNullOrEmpty(x.Status));
                var cardDo = cards.Where(x => x.Status.Equals("START"));
                return new
                {
                    Do = wfDo.Count(),
                    All = wfs.Count(),
                    Card = cards.Count(),
                    CardDo = cardDo.Count()
                };
            }
            else
            {
                var allWf = 0;
                var doWf = 0;

                var cards = (from a in _context.WORKOSCards.Where(x => !x.IsDeleted && x.Status != "TRASH" && !string.IsNullOrEmpty(x.Status))
                             join b in _context.WORKOSLists.Where(x => !x.IsDeleted) on a.ListCode equals b.ListCode
                             join c in _context.WORKOSBoards.Where(x => !x.IsDeleted) on b.BoardCode equals c.BoardCode
                             where a.CreatedBy.Equals(session.UserName) || a.LstUser.Contains(session.UserId)
                             select new
                             {
                                 a.CardCode,
                                 a.Status,
                             }).DistinctBy(x => x.CardCode);
                var cardDo = cards.Where(x => x.Status.Equals("START"));

                foreach (var item in wfs)
                {
                    var acts = _context.ActivityInstances.Where(x => !x.IsDeleted && x.WorkflowCode.Equals(item.WfInstCode));
                    //var assigns = _context.ExcuterControlRoleInsts.Where(x => acts.Any(k => k.ActivityInstCode.Equals(x.ActivityCodeInst))
                    //        && !x.IsDeleted && x.UserId.Equals(ESEIM.AppContext.UserId));

                    var userManager = !string.IsNullOrEmpty(item.UserManager) ? JsonConvert.DeserializeObject<List<UserManagerWF>>(item.UserManager) : new List<UserManagerWF>();

                    if (/*assigns.Any() ||*/ userManager.Any(x => x.UserId.Equals(ESEIM.AppContext.UserId)))
                    {
                        allWf = allWf + 1;
                        if (item.Status.Equals("STATUS_WF_PENDING"))
                        {
                            doWf = doWf + 1;
                        }
                    }
                }
                return new
                {
                    Do = doWf,
                    All = allWf,
                    Card = cards.Count(),
                    CardDo = cardDo.Count()
                };
            }
        }

        [AllowAnonymous]
        [HttpPost]
        public JsonResult HighchartAssets([FromBody] SearchAssetModel search)
        {
            var year = DateTime.Now.Year;
            year = !string.IsNullOrEmpty(search.Year) ? int.Parse(search.Year) : year;
            if (!string.IsNullOrEmpty(search.Department))
            {
                var assetAllow = (from a in _context.AssetAllocateHeaders.Where(x => !x.IsDeleted)
                                  join b in _context.AssetAllocateDetails.Where(x => !x.IsDeleted) on a.TicketCode equals b.TicketCode
                                  join c in _context.AssetMains.Where(x => !x.IsDeleted) on b.AssetCode equals c.AssetCode
                                  join d in _context.AssetTypes.Where(x => !x.IsDeleted) on c.AssetType equals d.CatCode
                                  where (string.IsNullOrEmpty(search.Department) || a.DepartmentReceive.Equals(search.Department))
                                  select new
                                  {
                                      d.CatCode
                                  });
                var query = (from a in _context.AssetTypes.Where(x => !x.IsDeleted)
                             join b in _context.AssetMains.Where(x => !x.IsDeleted && x.BuyedTime.HasValue && x.BuyedTime.Value.Year == year) on a.CatCode equals b.AssetType into b1
                             from b2 in b1.DefaultIfEmpty()
                             join c in assetAllow on a.CatCode equals c.CatCode
                             where (string.IsNullOrEmpty(search.Type) || a.CatCode.Equals(search.Type))
                             select new
                             {
                                 a.CatCode,
                                 a.CatName,
                                 Cost = b2.Cost != null ? b2.Cost : 0,
                                 b2.BuyedTime,
                             }).ToList();

                var rs = query.GroupBy(x => x.CatCode).Select(p => new
                {
                    name = p.First().CatName,
                    data = p.Where(k => k.BuyedTime != null).OrderBy(n => n.BuyedTime).GroupBy(i => i.BuyedTime.Value.Month).Select(y => new { month = y.First().BuyedTime.Value.Month, value = y.Sum(m => m.Cost) }),
                });

                if (rs.Where(x => x.data.Count() == 0).Count() == rs.Count())
                {
                    return Json(new List<object>());
                }
                else
                {
                    return Json(rs);
                }
            }
            else
            {
                string[] param = new string[] { "@yearData", "@type" };
                object[] val = new object[] { year, search.Type };
                DataTable query = _repositoryService.GetDataTableProcedureSql("P_HIGHCHART_ASSET", param, val);
                //var data = CommonUtil.ConvertDataTable<PChartModel>(rs).Select(p => new
                //{
                //    Status = p.Status,
                //    country = p.Country,
                //    litres = p.Litres,
                //}).OrderBy(p => p.Status);
                //var query = (from a in _context.AssetTypes.Where(x => !x.IsDeleted)
                //             join b in _context.AssetMains.Where(x => !x.IsDeleted && x.BuyedTime.HasValue && x.BuyedTime.Value.Year == year) on a.CatCode equals b.AssetType into b1
                //             from b2 in b1.DefaultIfEmpty()
                //             where (string.IsNullOrEmpty(search.Type) || a.CatCode.Equals(search.Type))
                //             select new
                //             {
                //                 a.CatCode,
                //                 a.CatName,
                //                 Cost = b2.Cost != null ? b2.Cost : 0,
                //                 b2.BuyedTime,
                //             }).ToList();

                //var rs = query.GroupBy(x => x.CatCode).Select(p => new
                //{
                //    name = p.First().CatName,
                //    data = p.Where(k => k.BuyedTime != null).OrderBy(n => n.BuyedTime).GroupBy(i => i.BuyedTime.Value.Month).Select(y => new { month = y.First().BuyedTime.Value.Month, value = y.Sum(m => m.Cost) }),
                //});

                var rs = CommonUtil.ConvertDataTable<PChartModel>(query).GroupBy(x => new { x.CatCode }).Select(p => new
                {
                    name = p.First().CatName,
                    data = p.Where(x => x.CatCode.Equals(p.First().CatCode)).GroupBy(i => i.Month).Select(z => new { month = z.First().Month, value = z.Sum(i => i.Value) }),
                });

                if (rs.Where(x => x.data.Count() == 0).Count() == rs.Count())
                {
                    return Json(new List<object>());
                }
                else
                {
                    return Json(rs);
                }
            }
        }

        [AllowAnonymous]
        [HttpPost]
        public JsonResult HighchartPieAssets([FromBody] SearchAssetModel search)
        {
            var year = DateTime.Now.Year;
            year = !string.IsNullOrEmpty(search.PieYear) ? int.Parse(search.PieYear) : year;
            //var assetUsed = (from a in _context.AssetAllocateDetails.Where(x => !x.IsDeleted && x.CreatedTime.Value.Year.Equals(year))
            //                 join b in _context.AssetMains.Where(x => !x.IsDeleted) on a.AssetCode equals b.AssetCode
            //                 select new
            //                 {
            //                     a.Quantity
            //                 }).Sum(x => x.Quantity);

            //var assetCancel = (from a in _context.AssetCancelDetails.Where(x => !x.IsDeleted && x.CreatedTime.Value.Year.Equals(year))
            //                   join b in _context.AssetMains.Where(x => !x.IsDeleted) on a.AssetName equals b.AssetCode
            //                   select new
            //                   {
            //                       a.QuantityAsset
            //                   }).Sum(x => x.QuantityAsset);

            //var assetRepair = (from a in _context.AssetMaintenanceDetailss.Where(x => !x.IsDeleted && x.CreatedTime.Value.Year.Equals(year))
            //                   join b in _context.AssetMains.Where(x => !x.IsDeleted) on a.AssetCode equals b.AssetCode
            //                   select new
            //                   {
            //                       a.AssetQuantity
            //                   }).Sum(x => x.AssetQuantity);

            //var total = assetUsed + assetCancel + assetRepair;
            //double percentAssetUsed = Math.Round(((double)assetUsed / (double)total) * 100, 1);
            //double percentAssetCancel = Math.Round(((double)assetCancel / (double)total) * 100, 1);
            //double percentAssetRepair = Math.Round(((double)assetRepair / (double)total) * 100, 1);

            //var item1 = new
            //{
            //    name = "Tài sản đang sử dụng",
            //    y = percentAssetUsed
            //};
            //var item2 = new
            //{
            //    name = "Tài sản hủy",
            //    y = percentAssetCancel
            //};
            //var item3 = new
            //{
            //    name = "Tài sản sửa chữa",
            //    y = percentAssetRepair
            //};

            //var list = new List<object>()
            //{
            //    item1,
            //    item2,
            //    item3
            //};

            string[] param = new string[] { "@yearData" };
            object[] val = new object[] { year };
            DataTable query = _repositoryService.GetDataTableProcedureSql("P_HIGHCHART_PIE_ASSET", param, val);
            var rs = CommonUtil.ConvertDataTable<PChartModel>(query).Select(x => new { name = x.Name, y = x.PercentData });

            if (rs.Count() == 0)
                return Json(new List<object>());
            else
                return Json(rs);
        }

        [AllowAnonymous]
        [HttpPost]
        public object JTableSystemLog([FromBody] JTableModelCustom jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var count = 0;
            var query = new List<SystemLog>();

            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            //Tìm kiếm theo ngày tạo
            var fromDatePara = fromDate.HasValue ? fromDate.Value.ToString("yyyy-MM-dd") : "";
            var toDatePara = toDate.HasValue ? toDate.Value.ToString("yyyy-MM-dd") : "";


            string[] param = new string[] { "@pageNo", "@pageSize", "@departmentCode", "@groupUserCode", "@userName", "@fromDate", "@toDate" };
            object[] val = new object[] { jTablePara.CurrentPage, jTablePara.Length, jTablePara.DepartmentCode, jTablePara.GroupUserCode, jTablePara.UserName, fromDatePara, toDatePara };
            DataTable rs = _repositoryService.GetDataTableProcedureSql("P_SYSTEM_LOG_VIEW", param, val);
            query = CommonUtil.ConvertDataTable<SystemLog>(rs);
            if (query.Any())
            {
                count = int.Parse(query.FirstOrDefault().TotalRow);
                var jdata = JTableHelper.JObjectTable(query, jTablePara.Draw, count, "Id", "Name", "Controller", "Action", "RequestBody", "IP", "CreatedBy", "GivenName", "TotalRow", "CreatedTime");
                return Json(jdata);
            }
            else
            {
                var jdata = JTableHelper.JObjectTable(query, jTablePara.Draw, 0, "Id", "Name", "Controller", "Action", "RequestBody", "IP", "CreatedBy", "GivenName", "TotalRow", "CreatedTime");
                return Json(jdata);
            }
        }
        #endregion


        [HttpGet]
        public object AmchartWorkFlowByWeek()
        {
            DateTime currentDate = DateTime.Now;
            DateTime oneWeekAgo = currentDate.AddDays(-7);
            var success = _context.WorkflowInstances.Where(x => x.Status == "STATUS_WF_SUCCESS" && x.CreatedTime >= oneWeekAgo && x.CreatedTime < currentDate).ToList().Count();
            var cancel = _context.WorkflowInstances.Where(x => x.Status == "STATUS_WF_STOP" && x.CreatedTime >= oneWeekAgo && x.CreatedTime < currentDate).ToList().Count();
            var pending = _context.WorkflowInstances.Where(x => x.Status == "STATUS_WF_PENDING" && x.CreatedTime >= oneWeekAgo && x.CreatedTime < currentDate).ToList().Count();
            var expires = _context.WorkflowInstances.Where(x => x.Status == "STATUS_WF_EXPIRES" && x.CreatedTime >= oneWeekAgo && x.CreatedTime < currentDate).ToList().Count();
            var obj = new
            {
                cancel = cancel != null ? cancel : 0,
                success = success != null ? success : 0,
                pending = pending != null ? pending : 0,
                expires = expires != null ? expires : 0,
            };
            return obj;
        }

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
        //[AllowAnonymous]
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
        [AllowAnonymous]
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
        [AllowAnonymous]
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

        [AllowAnonymous]
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

        [AllowAnonymous]
        [HttpPost]
        public object GetListUserChat(string userName, string givenName)
        {
            JMessage msg = new JMessage { Error = false };
            try
            {
                var listUser = _context.Users.Where(x => x.Active == true && x.UserName != "admin"
                && x.UserName != userName && ((string.IsNullOrEmpty(givenName) || x.GivenName.ToLower().Contains(givenName.ToLower())))).Select(x => new
                {
                    UserId = x.Id,
                    x.GivenName,
                    x.Picture,
                    x.UserName,
                    Channel = (x.UserName.CompareTo(userName) < 0) ? x.UserName + "_" + userName : userName + "_" + x.UserName,
                }).AsNoTracking();
                msg.Object = listUser.Select(x => new
                {
                    x.UserId,
                    x.GivenName,
                    x.Picture,
                    x.Channel,
                    ContentChat = _context.LogMessages.LastOrDefault(y => y.Channel == x.Channel),
                }).ToList();
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
        public JsonResult GetListZoom(string userName, string roomName)
        {
            JMessage msg = new JMessage { Error = false };
            try
            {
                msg.Object = (from a in _context.ZoomManages.Where(x => !x.IsDeleted)
                              join b in _context.Users.Where(x => x.Active) on a.CreatedBy equals b.UserName
                              where (string.IsNullOrEmpty(roomName) || a.ZoomName.ToLower().Contains(roomName.ToLower()))
                              orderby a.Id
                              select new
                              {
                                  RoomID = a.ZoomId,
                                  RoomName = a.ZoomName,
                                  RoomPassWord = a.ZoomPassword,
                                  GivenName = b.GivenName,
                                  CreatedBy = a.CreatedBy,
                                  CreatedTime = a.CreatedTime,
                                  Role = userName.Equals(a.CreatedBy) ? 10 : 0,
                                  Group = a.Group,
                                  AccountZoom = a.AccountZoom,
                                  ListUserAccess = a.ListUserAccess,
                                  IsEdit = userName.Equals(a.CreatedBy) ? true : false,
                                  ContentChat = _context.LogMessages.LastOrDefault(y => y.Channel == a.ZoomId),

                              });
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        #endregion

        #region Box card repeat
        [AllowAnonymous]
        [HttpPost]
        public JsonResult GetCardRepeat()
        {
            var data = (_context.WORKOSCards.Where(x => !x.IsDeleted && x.Status != "TRASH"
                && x.WorkType == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.CardWorktypeRepeat))
                .Select(x => new ModelCardRepeat
                {
                    CardCode = x.CardCode,
                    CardName = x.CardName,
                    CardStatus = _context.CommonSettings.FirstOrDefault(k => !k.IsDeleted && k.CodeSet == x.Status).ValueSet ?? "",
                    Session = 0,
                    TimeWork = 0
                })).ToList();

            foreach (var item in data)
            {
                var dataLogger = _context.JobcardDataLoggers.Where(x => !x.Flag && x.JobcardCode.Equals(item.CardCode))
                    .GroupBy(x => x.SessionId);

                item.Session = dataLogger.Count();

                foreach (var k in dataLogger)
                {
                    var shifts = k.DistinctBy(x => x.ShiftCode);
                    var shiftLogs = from a in shifts
                                    join b in _context.ShiftLogs on a.ShiftCode equals b.ShiftCode into b1
                                    from b2 in b1.DefaultIfEmpty()
                                    select new
                                    {
                                        b2.ChkinTime,
                                        b2.ChkoutTime
                                    };
                    var timeWork = 0.0;
                    foreach (var shift in shiftLogs)
                    {
                        if (shift.ChkoutTime.HasValue)
                        {
                            timeWork += (shift.ChkoutTime.Value - shift.ChkinTime.Value).TotalHours;
                        }
                    }
                    item.TimeWork = timeWork;
                }

            }

            return Json(data);
        }

        public class ModelCardRepeat
        {
            public string CardCode { get; set; }
            public string CardName { get; set; }
            public string CardStatus { get; set; }
            public int Session { get; set; }
            public double TimeWork { get; set; }
        }
        #endregion

        #region Language
        [AllowAnonymous]
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
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