using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Utils;
using ESEIM.Models;
using FTU.Utils.HelperNet;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class EDMSRepositoryReportController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<EDMSRepositoryReportController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public EDMSRepositoryReportController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment, IStringLocalizer<EDMSRepositoryReportController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _hostingEnvironment = hostingEnvironment;
            _upload = upload;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }
        [Breadcrumb("ViewData.CrumbEdmsRptRepo", AreaName = "Admin", FromAction = "Index", FromController = typeof(WarehouseDigitalHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbWHDHome"] = _sharedResources["COM_CRUMB_WH_DIGITAL_HOME"];
            ViewData["CrumbEdmsRptRepo"] = _sharedResources["COM_CRUMB_EDMS_REPO_REPORT"];
            return View();
        }

        [NonAction]
        private List<TreeViewResource> GetSubTreeCategoryData(List<EDMSCategory> data, string parentid, List<TreeViewResource> lstCategories, int tab, int typeOrder)
        {
            //tab += "- ";
            var contents = string.IsNullOrEmpty(parentid)
                ? (typeOrder == 1 ? data.Where(x => x.CatParent == "#").OrderBy(x => x.Id).AsParallel() : data.Where(x => x.CatParent == "#").OrderByDescending(x => x.Id).AsParallel())
                : data.Where(x => x.CatParent == parentid).OrderByDescending(x => x.Id).AsParallel();
            foreach (var item in contents)
            {
                var category = new TreeViewResource
                {
                    Id = item.Id,
                    Code = item.CatCode,
                    Title = item.CatName,
                    Level = tab,
                    HasChild = data.Any(x => x.CatParent == item.CatCode),
                    ParentCode = item.CatParent,
                };
                lstCategories.Add(category);
                if (category.HasChild) GetSubTreeCategoryData(data, item.CatCode, lstCategories, tab + 1, 1);
            }
            return lstCategories;
        }
        [HttpPost]
        public List<TreeViewResource> GetTreeRepository()
        {
            var data = _context.EDMSRepositorys.Where(x => x.IsDeleted == false).OrderByDescending(x => x.ReposID).AsNoTracking();
            var dataOrder = GetSubTreeRepositoryData(data.ToList(), null, new List<TreeViewResource>(), 0, 2);
            return dataOrder;
        }
        [NonAction]
        private List<TreeViewResource> GetSubTreeRepositoryData(List<EDMSRepository> data, string parentid, List<TreeViewResource> lstCategories, int tab, int typeOrder)
        {
            var contents = string.IsNullOrEmpty(parentid)
                ? (typeOrder == 1 ? data.Where(x => x.Parent == "#").OrderBy(x => x.ReposID).AsParallel() : data.Where(x => x.Parent == "#").OrderByDescending(x => x.ReposID).AsParallel())
                : data.Where(x => x.Parent == parentid).OrderByDescending(x => x.ReposID).AsParallel();
            foreach (var item in contents)
            {
                var category = new TreeViewResource
                {
                    Id = item.ReposID,
                    Code = item.ReposCode,
                    Title = item.ReposName,
                    Level = tab,
                    HasChild = data.Any(x => x.Parent == item.ReposCode),
                    ParentCode = item.Parent,
                    TypeRepos = item.Type,
                };
                lstCategories.Add(category);
                if (category.HasChild) GetSubTreeRepositoryData(data, item.ReposCode, lstCategories, tab + 1, 1);
            }
            return lstCategories;
        }
        [HttpPost]
        public object JTableFileNew([FromBody]JtableFileModel para)
        {
            int intBeginFor = (para.CurrentPage - 1) * para.Length;
            var fromDate = !string.IsNullOrEmpty(para.FromDate) ? DateTime.ParseExact(para.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(para.ToDate) ? DateTime.ParseExact(para.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDay = DateTime.Now.Date;
            List<TreeViewResource> tree = GetTreeCategory();
            var queryFileCount = from a in _context.EDMSRepoCatFiles
                                 join b in _context.EDMSFiles.Where(x => x.IsDeleted == false) on a.FileCode equals b.FileCode
                                 select new
                                 {
                                     a.CatCode,
                                     a.FileCode,
                                     b.FileSize,
                                     b.CreatedBy,
                                     a.ObjectType,
                                     CreatedDate = b.CreatedTime.Value.Date
                                 };
            var groupCount = queryFileCount.GroupBy(x => new { x.CatCode, x.CreatedBy }).Select(x => new
            {
                CatCode = x.Key.CatCode,
                CreatedBy = x.Key.CreatedBy,// string.Join(",", x.Select(y=>y.CreatedBy)),
                TotalFile = x.Count(),
                TotalSize = x.Sum(y => y.FileSize),
                CreatedDate = x.Select(i => i.CreatedDate).Distinct().First()
            });
            var groupCount1 = queryFileCount.GroupBy(x => new { x.CreatedBy, x.ObjectType }).Select(x => new
            {
                CreatedBy = x.Key.CreatedBy,
                ObjectType = x.Key.ObjectType,
                TotalFile = x.Count(),
                TotalSize = x.Sum(y => y.FileSize)
            });
            var queryContract = from a in _context.PoSaleHeaders.Where(x => x.IsDeleted == false)
                                join b in _context.EDMSRepoCatFiles on a.ContractCode equals b.ObjectCode
                                where (string.IsNullOrEmpty(para.ContractCode) || a.ContractCode == para.ContractCode)
                                && (string.IsNullOrEmpty(para.ObjectCode) || para.ObjectCode == "FILE_OBJ_CONTRACT")
                                select new
                                {
                                    Code = a.ContractCode,
                                    Name = a.Title,
                                    FileCode = b.FileCode,
                                    Type = "CONTRACT"
                                };

            var queryCustomer = from a in _context.Customerss
                                   .Where(x => x.IsDeleted == false)
                                join b in _context.EDMSRepoCatFiles on a.CusCode equals b.ObjectCode
                                where (string.IsNullOrEmpty(para.CustomerCode) || a.CusCode == para.CustomerCode)
                                && (string.IsNullOrEmpty(para.ObjectCode) || para.ObjectCode == "FILE_OBJ_CUSTOMMER")
                                select new
                                {
                                    Code = a.CusCode,
                                    Name = a.CusName,
                                    b.FileCode,
                                    Type = "CUSTOMER"
                                };
            var querySupplier = from a in _context.Suppliers
                                   .Where(x => x.IsDeleted == false)
                                join b in _context.EDMSRepoCatFiles on a.SupCode equals b.ObjectCode
                                where (string.IsNullOrEmpty(para.SupplierCode) || a.SupCode == para.SupplierCode)
                                && (string.IsNullOrEmpty(para.ObjectCode) || para.ObjectCode == "FILE_OBJ_SUPPLIER")
                                select new
                                {
                                    Code = a.SupCode,
                                    Name = a.SupName,
                                    b.FileCode,
                                    Type = "SUPPLIER"
                                };
            var queryProject = from a in _context.Projects
                               join b in _context.EDMSRepoCatFiles on a.ProjectCode equals b.ObjectCode
                               where (string.IsNullOrEmpty(para.ProjectCode) || a.ProjectCode == para.ProjectCode)
                               && (string.IsNullOrEmpty(para.ObjectCode) || para.ObjectCode == "FILE_OBJ_PROJECT")
                               select new
                               {
                                   Code = a.ProjectCode,
                                   Name = a.ProjectTitle,
                                   b.FileCode,
                                   Type = "PROJECT"
                               };
            var queryOther = from a in _context.EDMSRepoCatFiles.Where(x => x.ObjectType == null && x.ObjectCode == null)
                             where (string.IsNullOrEmpty(para.ObjectCode) || para.ObjectCode == "FILE_OBJ_OTHER")
                             select new
                             {
                                 Code = "",
                                 Name = "Kho dữ liệu",
                                 a.FileCode,
                                 Type = "OTHER"
                             };

            var query1 = queryContract.Union(queryCustomer.Union(querySupplier.Union(queryProject.Union(queryOther))));

            if (!string.IsNullOrEmpty(para.FromDate) || !string.IsNullOrEmpty(para.ToDate)
                //|| !string.IsNullOrEmpty(para.UserUpload) || !string.IsNullOrEmpty(para.ObjectCode) || !string.IsNullOrEmpty(para.ContractCode) || !string.IsNullOrEmpty(para.CustomerCode) || !string.IsNullOrEmpty(para.ProjectCode) || !string.IsNullOrEmpty(para.SupplierCode)
                )
            {
                //tìm theo tiêu chí tìm kiếm, bảng to

                var query2 = from a0 in _context.EDMSRepoCatFiles
                             join a in _context.EDMSFiles.Where(x => x.IsDeleted == false) on a0.FileCode equals a.FileCode
                             join b in query1 on a.FileCode equals b.FileCode
                             where ((fromDate == null) || (a.CreatedTime.HasValue && a.CreatedTime.Value.Date >= fromDate))
                             && ((toDate == null) || (a.CreatedTime.HasValue && a.CreatedTime.Value.Date <= toDate))
                             && (string.IsNullOrEmpty(para.UserUpload) || (a.CreatedBy == para.UserUpload))
                             select new
                             {
                                 Code = b.Code,
                                 Name = b.Name,
                                 Type = b.Type,
                                 CreatedBy = a.CreatedBy,
                                 FileSize = a.FileSize,
                             };
                var group2 = query2.GroupBy(x => new { x.Code, x.Name }).Select(x => new
                {
                    Code = x.Key.Code,
                    Name = x.Key.Name,
                    TotalFile = x.Count(),
                    TotalSize = x.Sum(y => y.FileSize),
                    UploadUser = string.Join(",", x.Select(i => i.CreatedBy).Distinct()),
                    Type = x.Select(i => i.Type).Distinct().First()
                });
                var list = group2.Skip(intBeginFor).Take(para.Length).ToList();
                var count = group2.Count();
                var jdata = JTableHelper.JObjectTable(list, para.Draw, count, "Code", "Name", "TotalFile", "TotalSize", "UploadUser", "Type");
                return Json(jdata);
            }
            else
            {
                fromDate = FirstDateOfWeek(DateTime.Now.Date);
                toDate = fromDate.Value.Date.AddDays(6);
                var queryFileCount2 = from a in _context.EDMSRepoCatFiles
                                      join b in _context.EDMSFiles.Where(x => x.IsDeleted == false) on a.FileCode equals b.FileCode
                                      join c in query1 on b.FileCode equals c.FileCode
                                      where b.CreatedTime.Value.Date >= fromDate.Value.Date && b.CreatedTime.Value.Date <= toDate.Value.Date
                                      && (string.IsNullOrEmpty(para.UserUpload) || (b.CreatedBy == para.UserUpload))
                                      select new
                                      {
                                          a.CatCode,
                                          a.FileCode,
                                          b.FileSize,
                                          b.CreatedBy,
                                          a.ObjectType,
                                          CreatedDate = b.CreatedTime.Value.Date
                                      };
                var groupCount2 = queryFileCount2.Where(x => x.CreatedDate >= fromDate && x.CreatedDate <= toDate).GroupBy(x => new { x.CatCode, x.CreatedBy }).Select(x => new
                {
                    CatCode = x.Key.CatCode,
                    CreatedBy = x.Key.CreatedBy,// string.Join(",", x.Select(y=>y.CreatedBy)),
                    TotalFile = x.Count(),
                    TotalSize = x.Sum(y => y.FileSize),
                });
                // bảng rút gọn
                var query = from a in tree
                            join b in groupCount2 on a.Code equals b.CatCode
                            select new
                            {
                                CategoryName = a.Title,
                                GivenName = (b != null ? b.CreatedBy : ""),
                                TotalFile = (b != null ? b.TotalFile : 0),
                                TotalSize = (b != null ? b.TotalSize : 0)
                            };
                var list = query.Skip(intBeginFor).Take(para.Length).ToList();
                var count = query.Count();
                var jdata = JTableHelper.JObjectTable(list, para.Draw, count, "CategoryName", "GivenName", "TotalFile", "TotalSize");
                return Json(jdata);
            }
        }
        [HttpPost]
        public List<TreeViewResource> GetTreeCategory()
        {
            var data = _context.EDMSCategorys.Where(x => x.IsDeleted == false).OrderByDescending(x => x.Id).AsNoTracking();
            var dataOrder = GetSubTreeCategoryData(data.ToList(), null, new List<TreeViewResource>(), 0, 2);
            return dataOrder;
        }
        [HttpPost]
        public JsonResult GetAllContract()
        {
            JMessage msg = new JMessage() { Error = false };
            try
            {
                var queryCus = from a in _context.PoSaleHeaders.Where(x => x.IsDeleted == false)
                               select new
                               {
                                   Id = a.ContractHeaderID,
                                   ContractCode = a.ContractCode,
                                   Code = a.ContractCode,
                                   Name = a.ContractCode,
                                   Type = "Customer",
                                   a.CreatedTime
                               };
                //var querySup = from a in _context.PoSupHeaders.Where(x => x.IsDeleted == false)
                //               select new
                //               {
                //                   Id = a.Id,
                //                   ContractCode = a.PoSupCode,
                //                   Code = a.PoSupCode,
                //                   Name = a.PoSupCode,
                //                   Type = "Suppiler",
                //                   a.CreatedTime
                //               };
                //var list = queryCus.Union(querySup).OrderByDescending(x => x.CreatedTime).ToList();
                msg.Object = queryCus.ToList();
            }
            catch (Exception ex)
            {
                msg.Object = ex.Message;
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult GetAllCustomer()
        {
            JMessage msg = new JMessage() { Error = false };
            try
            {
                var queryCus = from a in _context.Customerss.Where(x => x.IsDeleted == false)
                               select new
                               {
                                   Id = a.CusID,
                                   CustomerCode = a.CusCode,
                                   Code = a.CusCode,
                                   Name = a.CusName
                               };
                var list = queryCus.OrderByDescending(x => x.Id).ToList();
                msg.Object = list;
            }
            catch (Exception ex)
            {
                msg.Object = ex.Message;
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult GetAllSupplier()
        {
            JMessage msg = new JMessage() { Error = false };
            try
            {
                var queryCus = from a in _context.Suppliers.Where(x => x.IsDeleted == false)
                               select new
                               {
                                   Id = a.SupID,
                                   SupplierCode = a.SupCode,
                                   Code = a.SupCode,
                                   Name = a.SupName
                               };
                var list = queryCus.OrderByDescending(x => x.Id).ToList();
                msg.Object = list;
            }
            catch (Exception ex)
            {
                msg.Object = ex.Message;
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult GetAllProject()
        {
            JMessage msg = new JMessage() { Error = false };
            try
            {
                var queryCus = from a in _context.Projects.Where(x => x.FlagDeleted == false)
                               select new
                               {
                                   Id = a.Id,
                                   ProjectCode = a.ProjectCode,
                                   Code = a.ProjectCode,
                                   Name = a.ProjectCode
                               };
                var list = queryCus.OrderByDescending(x => x.Id).ToList();
                msg.Object = list;
            }
            catch (Exception ex)
            {
                msg.Object = ex.Message;
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }
        [HttpPost]
        public object GetObjects()
        {
            var query = from a in _context.CommonSettings
                        where a.IsDeleted == false && a.Group == "FILE_OBJECT_SHARE"
                        select new
                        {
                            Code = a.CodeSet,
                            Name = a.ValueSet
                        };
            var list = query.ToList();
            return list;
        }
        [HttpPost]
        public object GetUsers()
        {
            var query = from a in _context.Users
                        select new
                        {
                            UserName = a.UserName,
                            Name = a.GivenName
                        };
            var list = query.ToList();
            return list;
        }
        [HttpPost]
        public object ChartByWeek([FromBody] ChartBySeadrch para)
        {
            JMessage msg = new JMessage() { Error = false };
            var fromDate = FirstDateOfWeek(DateTime.Now.Date);
            var listDate = new List<DateTime>();
            listDate.Add(fromDate.Date);
            listDate.Add(fromDate.Date.AddDays(1).Date);
            listDate.Add(fromDate.Date.AddDays(2).Date);
            listDate.Add(fromDate.Date.AddDays(3).Date);
            listDate.Add(fromDate.Date.AddDays(4).Date);
            listDate.Add(fromDate.Date.AddDays(5).Date);
            listDate.Add(fromDate.Date.AddDays(6).Date);

            var toDate = fromDate.Date.AddDays(6);
            var queryContract = from a in _context.PoSaleHeaders.Where(x => x.IsDeleted == false)
                                join b in _context.EDMSRepoCatFiles on a.ContractCode equals b.ObjectCode
                                where (string.IsNullOrEmpty(para.ContractCode) || a.ContractCode == para.ContractCode)
                                && (string.IsNullOrEmpty(para.ObjectCode) || para.ObjectCode == "FILE_OBJ_CONTRACT")
                                select new
                                {
                                    Code = a.ContractCode,
                                    Name = a.Title,
                                    FileCode = b.FileCode,
                                    Type = "CONTRACT"
                                };

            var queryCustomer = from a in _context.Customerss
                                   .Where(x => x.IsDeleted == false)
                                join b in _context.EDMSRepoCatFiles on a.CusCode equals b.ObjectCode
                                where (string.IsNullOrEmpty(para.CustomerCode) || a.CusCode == para.CustomerCode)
                                && (string.IsNullOrEmpty(para.ObjectCode) || para.ObjectCode == "FILE_OBJ_CUSTOMMER")
                                select new
                                {
                                    Code = a.CusCode,
                                    Name = a.CusName,
                                    b.FileCode,
                                    Type = "CUSTOMER"
                                };
            var querySupplier = from a in _context.Suppliers
                                   .Where(x => x.IsDeleted == false)
                                join b in _context.EDMSRepoCatFiles on a.SupCode equals b.ObjectCode
                                where (string.IsNullOrEmpty(para.SupplierCode) || a.SupCode == para.SupplierCode)
                                && (string.IsNullOrEmpty(para.ObjectCode) || para.ObjectCode == "FILE_OBJ_SUPPLIER")
                                select new
                                {
                                    Code = a.SupCode,
                                    Name = a.SupName,
                                    b.FileCode,
                                    Type = "SUPPLIER"
                                };
            var queryProject = from a in _context.Projects
                               join b in _context.EDMSRepoCatFiles on a.ProjectCode equals b.ObjectCode
                               where (string.IsNullOrEmpty(para.ProjectCode) || a.ProjectCode == para.ProjectCode)
                               && (string.IsNullOrEmpty(para.ObjectCode) || para.ObjectCode == "FILE_OBJ_PROJECT")
                               select new
                               {
                                   Code = a.ProjectCode,
                                   Name = a.ProjectTitle,
                                   b.FileCode,
                                   Type = "PROJECT"
                               };
            var queryOther = from a in _context.EDMSRepoCatFiles.Where(x => x.ObjectType == null && x.ObjectCode == null)
                             where (string.IsNullOrEmpty(para.ObjectCode) || para.ObjectCode == "FILE_OBJ_OTHER")
                             select new
                             {
                                 Code = "",
                                 Name = "Kho dữ liệu",
                                 a.FileCode,
                                 Type = "OTHER"
                             };

            var query1 = queryContract.Union(queryCustomer.Union(querySupplier.Union(queryProject.Union(queryOther))));

            var queryFileCount2 = from a in _context.EDMSRepoCatFiles
                                  join b in _context.EDMSFiles.Where(x => x.IsDeleted == false) on a.FileCode equals b.FileCode
                                  join c in query1 on b.FileCode equals c.FileCode
                                  where b.CreatedTime.Value.Date >= fromDate.Date && b.CreatedTime.Value.Date <= toDate.Date
                                  && (string.IsNullOrEmpty(para.UserUpload) || (b.CreatedBy == para.UserUpload))
                                  select new
                                  {
                                      a.CatCode,
                                      a.FileCode,
                                      b.FileSize,
                                      b.CreatedBy,
                                      a.ObjectType,
                                      CreatedDate = b.CreatedTime.Value.Date
                                  };
            var groupCount2 = queryFileCount2.GroupBy(x => new { x.CreatedDate }).Select(x => new
            {
                CreatedDate = x.Key.CreatedDate,
                TotalFile = x.Count(),
                TotalSize = x.Sum(y => y.FileSize),
            }).ToList();
            var group3 = from a in listDate
                         join b in groupCount2 on a equals b.CreatedDate into b2
                         from b in b2.DefaultIfEmpty()
                         select new
                         {
                             CreatedDate = a.ToString("dd/MM/yyyy"),
                             TotalFile = (b != null ? b.TotalFile : 0),
                             TotalSize = (b != null ? b.TotalSize : 0)
                         };

            msg.Object = group3.ToList();
            return Json(msg);
        }

        [HttpPost]
        public object ChartBySearch([FromBody] ChartBySeadrch para)
        {
            var fromDate = !string.IsNullOrEmpty(para.FromDate) ? DateTime.ParseExact(para.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(para.ToDate) ? DateTime.ParseExact(para.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            JMessage2 msg = new JMessage2() { Error = false };

            List<List<ChartModel>> list = new List<List<ChartModel>>();
            var listTimeLable = new List<A>();
            var queryContract = from a in _context.PoSaleHeaders.Where(x => x.IsDeleted == false)
                                join b in _context.EDMSRepoCatFiles on a.ContractCode equals b.ObjectCode
                                join c in _context.EDMSFiles on b.FileCode equals c.FileCode
                                where (string.IsNullOrEmpty(para.ContractCode) || a.ContractCode == para.ContractCode)
                                && (string.IsNullOrEmpty(para.ObjectCode) || para.ObjectCode == "FILE_OBJ_CONTRACT")
                                && ((fromDate == null) || (c.CreatedTime.HasValue && c.CreatedTime.Value.Date >= fromDate.Value.Date))
                                && ((toDate == null) || (c.CreatedTime.HasValue && c.CreatedTime.Value.Date <= toDate.Value.Date))
                                && ((string.IsNullOrEmpty(para.UserUpload)) || (c.CreatedBy == para.UserUpload))
                                select new
                                {
                                    Code = a.ContractCode,
                                    Name = a.Title,
                                    FileCode = b.FileCode,
                                    FileSize = c.FileSize,
                                    Type = "CONTRACT",
                                    CreatedDate = c.CreatedTime.Value.Date
                                };
            var contractGroup = queryContract.GroupBy(x => new { x.CreatedDate }).Select(x => new ChartModel
            {
                CreatedDate = x.Key.CreatedDate,
                CreatedDates = x.Key.CreatedDate.ToString("dd/MM/yyyy"),
                TotalFile = x.Count(),
                TotalSize = x.Sum(y => y.FileSize)
            }).OrderBy(x => x.CreatedDate).ToList();
            //list.Add(contractGroup);
            var queryCustomer = from a in _context.Customerss
                                   .Where(x => x.IsDeleted == false)
                                join b in _context.EDMSRepoCatFiles on a.CusCode equals b.ObjectCode
                                join c in _context.EDMSFiles on b.FileCode equals c.FileCode
                                where (string.IsNullOrEmpty(para.CustomerCode) || a.CusCode == para.CustomerCode)
                                && (string.IsNullOrEmpty(para.ObjectCode) || para.ObjectCode == "FILE_OBJ_CUSTOMMER")
                                && ((fromDate == null) || (c.CreatedTime.HasValue && c.CreatedTime.Value.Date >= fromDate.Value.Date))
                                && ((toDate == null) || (c.CreatedTime.HasValue && c.CreatedTime.Value.Date <= toDate.Value.Date))
                                && ((string.IsNullOrEmpty(para.UserUpload)) || (c.CreatedBy == para.UserUpload))
                                select new
                                {
                                    Code = a.CusCode,
                                    Name = a.CusName,
                                    b.FileCode,
                                    FileSize = c.FileSize,
                                    Type = "CUSTOMER",
                                    CreatedDate = c.CreatedTime.Value.Date
                                };
            var customerGroup = queryCustomer.GroupBy(x => new { x.CreatedDate }).Select(x => new ChartModel
            {
                CreatedDate = x.Key.CreatedDate,
                CreatedDates = x.Key.CreatedDate.ToString("dd/MM/yyyy"),
                TotalFile = x.Count(),
                TotalSize = x.Sum(y => y.FileSize)
            }).OrderBy(x => x.CreatedDate).ToList();
            //list.Add(customerGroup);

            var querySupplier = from a in _context.Suppliers
                                   .Where(x => x.IsDeleted == false)
                                join b in _context.EDMSRepoCatFiles on a.SupCode equals b.ObjectCode
                                join c in _context.EDMSFiles on b.FileCode equals c.FileCode
                                where (string.IsNullOrEmpty(para.SupplierCode) || a.SupCode == para.SupplierCode)
                                && (string.IsNullOrEmpty(para.ObjectCode) || para.ObjectCode == "FILE_OBJ_SUPPLIER")
                                && ((fromDate == null) || (c.CreatedTime.HasValue && c.CreatedTime.Value.Date >= fromDate.Value.Date))
                                && ((toDate == null) || (c.CreatedTime.HasValue && c.CreatedTime.Value.Date <= toDate.Value.Date))
                                && ((string.IsNullOrEmpty(para.UserUpload)) || (c.CreatedBy == para.UserUpload))
                                select new
                                {
                                    Code = a.SupCode,
                                    Name = a.SupName,
                                    b.FileCode,
                                    FileSize = c.FileSize,
                                    Type = "SUPPLIER",
                                    CreatedDate = c.CreatedTime.Value.Date
                                };
            var supplierGroup = querySupplier.GroupBy(x => new { x.CreatedDate }).Select(x => new ChartModel
            {
                CreatedDate = x.Key.CreatedDate,
                CreatedDates = x.Key.CreatedDate.ToString("dd/MM/yyyy"),
                TotalFile = x.Count(),
                TotalSize = x.Sum(y => y.FileSize)
            }).OrderBy(x => x.CreatedDate).ToList();
            //list.Add(supplierGroup);

            var queryProject = from a in _context.Projects
                               join b in _context.EDMSRepoCatFiles on a.ProjectCode equals b.ObjectCode
                               join c in _context.EDMSFiles on b.FileCode equals c.FileCode
                               where (string.IsNullOrEmpty(para.ProjectCode) || a.ProjectCode == para.ProjectCode)
                               && (string.IsNullOrEmpty(para.ObjectCode) || para.ObjectCode == "FILE_OBJ_PROJECT")
                               && ((fromDate == null) || (c.CreatedTime.HasValue && c.CreatedTime.Value.Date >= fromDate.Value.Date))
                                && ((toDate == null) || (c.CreatedTime.HasValue && c.CreatedTime.Value.Date <= toDate.Value.Date))
                                && ((string.IsNullOrEmpty(para.UserUpload)) || (c.CreatedBy == para.UserUpload))
                               select new
                               {
                                   Code = a.ProjectCode,
                                   Name = a.ProjectTitle,
                                   b.FileCode,
                                   FileSize = c.FileSize,
                                   Type = "PROJECT",
                                   CreatedDate = c.CreatedTime.Value.Date
                               };
            var projectGroup = queryProject.GroupBy(x => new { x.CreatedDate }).Select(x => new ChartModel
            {
                CreatedDate = x.Key.CreatedDate,
                CreatedDates = x.Key.CreatedDate.ToString("dd/MM/yyyy"),
                TotalFile = x.Count(),
                TotalSize = x.Sum(y => y.FileSize)
            }).OrderBy(x => x.CreatedDate).ToList();
            //list.Add(projectGroup);


            var queryOther = from a in _context.EDMSRepoCatFiles.Where(x => x.ObjectType == null && x.ObjectCode == null)
                             join b in _context.EDMSFiles on a.FileCode equals b.FileCode
                             where (string.IsNullOrEmpty(para.ObjectCode) || para.ObjectCode == "FILE_OBJ_OTHER")
                                && ((fromDate == null) || (b.CreatedTime.HasValue && b.CreatedTime.Value.Date >= fromDate.Value.Date))
                                && ((toDate == null) || (b.CreatedTime.HasValue && b.CreatedTime.Value.Date <= toDate.Value.Date))
                                && ((string.IsNullOrEmpty(para.UserUpload)) || (b.CreatedBy == para.UserUpload))
                             select new
                             {
                                 Code = "",
                                 Name = "Kho dữ liệu",
                                 a.FileCode,
                                 FileSize = b.FileSize,
                                 Type = "OTHER",
                                 CreatedDate = b.CreatedTime.Value.Date
                             };
            var otherGroup = queryOther.GroupBy(x => new { x.CreatedDate }).Select(x => new ChartModel
            {
                CreatedDate = x.Key.CreatedDate,
                CreatedDates = x.Key.CreatedDate.ToString("dd/MM/yyyy"),
                TotalFile = x.Count(),
                TotalSize = x.Sum(y => y.FileSize)
            }).OrderBy(x => x.CreatedDate).ToList();
            //list.Add(otherGroup);

            var listTime = contractGroup.Union(customerGroup.Union(supplierGroup.Union(projectGroup.Union(otherGroup)))).DistinctBy(x => x.CreatedDate).OrderBy(x => x.CreatedDate).Select(x => new A
            {
                CreatedDate = x.CreatedDate,
                CreatedDates = x.CreatedDate.ToString("dd/MM/yyyy")
            }).ToList();

            if (listTime.Count() > 0)
            {
                var firstTime = fromDate;
                if (listTime.Count > 0)
                {
                    var item = listTime[0].CreatedDate;
                    if (firstTime == null || (firstTime != null && firstTime.Value.Date > item.Date))
                        firstTime = item.Date;
                }
                var lastTime = toDate;
                if (listTime.Count > 0)
                {
                    var item = listTime[listTime.Count() - 1].CreatedDate;
                    if (lastTime == null || (lastTime != null && lastTime.Value.Date < item.Date))
                        lastTime = item.Date;
                }

                var listTimeRange = new List<DateTime>();
                listTimeRange.Add(firstTime.Value.Date);
                var i = 1;
                while (firstTime.Value.Date.AddDays(i).Date <= lastTime.Value.Date)
                {
                    listTimeRange.Add(firstTime.Value.Date.AddDays(i).Date);
                    i = i + 1;
                }


                foreach (var item in listTimeRange)
                {
                    listTimeLable.Add(new A
                    {
                        CreatedDate = item,
                        CreatedDates = item.ToString("dd/MM/yyyy")
                    });
                }
                var contractGroup1 = (from a in listTimeRange
                                      join b in contractGroup on a equals b.CreatedDate into b2
                                      from b in b2.DefaultIfEmpty()
                                      orderby a ascending
                                      select new ChartModel
                                      {
                                          CreatedDate = a,
                                          CreatedDates = a.ToString("dd/MM/yyyy"),
                                          TotalFile = (b != null ? b.TotalFile : 0),
                                          TotalSize = (b != null ? b.TotalSize : 0)
                                      }).ToList();
                var customerGroup1 = (from a in listTimeRange
                                      join b in customerGroup on a equals b.CreatedDate into b2
                                      from b in b2.DefaultIfEmpty()
                                      orderby a ascending
                                      select new ChartModel
                                      {
                                          CreatedDate = a,
                                          CreatedDates = a.ToString("dd/MM/yyyy"),
                                          TotalFile = (b != null ? b.TotalFile : 0),
                                          TotalSize = (b != null ? b.TotalSize : 0)
                                      }).ToList();
                var supplierGroup1 = (from a in listTimeRange
                                      join b in supplierGroup on a equals b.CreatedDate into b2
                                      from b in b2.DefaultIfEmpty()
                                      orderby a ascending
                                      select new ChartModel
                                      {
                                          CreatedDate = a,
                                          CreatedDates = a.ToString("dd/MM/yyyy"),
                                          TotalFile = (b != null ? b.TotalFile : 0),
                                          TotalSize = (b != null ? b.TotalSize : 0)
                                      }).ToList();
                var projectGroup1 = (from a in listTimeRange
                                     join b in projectGroup on a equals b.CreatedDate into b2
                                     from b in b2.DefaultIfEmpty()
                                     orderby a ascending
                                     select new ChartModel
                                     {
                                         CreatedDate = a,
                                         CreatedDates = a.ToString("dd/MM/yyyy"),
                                         TotalFile = (b != null ? b.TotalFile : 0),
                                         TotalSize = (b != null ? b.TotalSize : 0)
                                     }).ToList();
                var otherGroup1 = (from a in listTimeRange
                                   join b in otherGroup on a equals b.CreatedDate into b2
                                   from b in b2.DefaultIfEmpty()
                                   orderby a ascending
                                   select new ChartModel
                                   {
                                       CreatedDate = a,
                                       CreatedDates = a.ToString("dd/MM/yyyy"),
                                       TotalFile = (b != null ? b.TotalFile : 0),
                                       TotalSize = (b != null ? b.TotalSize : 0)
                                   }).ToList();

                list.Add(contractGroup1);
                list.Add(customerGroup1);
                list.Add(supplierGroup1);
                list.Add(projectGroup1);
                list.Add(otherGroup1);

                msg.Object = list;
                msg.Object2 = listTimeLable;
            }
            else
            {
                msg.Object = list;
                msg.Object2 = listTimeLable;
            }
            return Json(msg);
        }

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
        #endregion

        public static DateTime FirstDateOfWeek(DateTime time)
        {
            var dt = time.DayOfWeek;
            var tp = 0;
            switch (dt)
            {

                case DayOfWeek.Monday:
                    tp = 0;
                    break;
                case DayOfWeek.Tuesday:
                    tp = -1;
                    break;
                case DayOfWeek.Wednesday:
                    tp = -2;
                    break;
                case DayOfWeek.Thursday:
                    tp = -3;
                    break;
                case DayOfWeek.Friday:
                    tp = -4;
                    break;
                case DayOfWeek.Saturday:
                    tp = -5;
                    break;
                case DayOfWeek.Sunday:
                    tp = -6;
                    break;
            }
            time = time.AddDays(tp);
            return time;
        }
    }
    public class A
    {
        public DateTime CreatedDate { get; set; }
        public string CreatedDates { get; set; }
    }
    public class JMessage2 : JMessage
    {
        public object Object2 { get; set; }
    }
    public class ChartBySeadrch
    {
        public string FromDate { get; set; }
        public string ToDate { get; set; }
        public string Name { get; set; }
        public int? FileType { get; set; }
        public string Content { get; set; }
        public string Tags { get; set; }
        public string[] ListRepository { get; set; }
        public string TypeTab { get; set; }
        public string ContractCode { get; set; }
        public string CustomerCode { get; set; }
        public string SupplierCode { get; set; }
        public string ProjectCode { get; set; }
        public string ObjectCode { get; set; }
        public string UserUpload { get; set; }
    }
    public class ChartModel
    {
        public DateTime CreatedDate { get; set; }
        public int TotalFile { get; set; }
        public decimal? TotalSize { get; set; }
        public string CreatedDates { get; set; }
    }
}