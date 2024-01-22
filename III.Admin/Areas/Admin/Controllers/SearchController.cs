using System;
using System.Collections.Generic;
using System.Data;
using System.Globalization;
using System.IO;
using System.Linq;
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
using OpenXmlPowerTools;
using Syncfusion.EJ2.DocumentEditor;
using Syncfusion.Pdf.Parsing;
using Syncfusion.Pdf;
using Syncfusion.EJ2.PdfViewer;
using Microsoft.Extensions.Caching.Memory;
using Syncfusion.Presentation;
using Syncfusion.PresentationToPdfConverter;
using static III.Admin.Controllers.CardJobController;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class SearchController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<PDFController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private IMemoryCache _cache;

        public SearchController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment, IStringLocalizer<PDFController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources, IMemoryCache memoryCache)
        {
            _hostingEnvironment = hostingEnvironment;
            _context = context;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
            _cache = memoryCache;
        }

        [HttpPost]
        public IActionResult Index()
        {
            return PartialView();
        }
        [HttpPost]
        public object GetAllEmployee()
        {
            var query = from a in _context.HREmployees
                        join b in _context.Roles on a.position equals b.Id into b1
                        from b2 in b1.DefaultIfEmpty()
                        join c in _context.AdGroupUsers on a.unit equals c.GroupUserCode into c1
                        from c2 in c1.DefaultIfEmpty()
                        where a.flag == 1
                        select new
                        {
                            a.Id,
                            a.fullname,
                            a.gender,
                            a.phone,
                            a.permanentresidence,
                            a.employeetype,
                            a.picture,
                            a.birthofplace,
                            a.unit,
                            a.position,
                            unitName = c2.Title,
                            positionName = b2.Title
                        };
            return query;
        }
        [HttpPost]
        public JsonResult GetObjTypeJC()
        {
            var data = _context.JcObjectTypes.Where(x => !x.IsDeleted).Select(x => new { Code = x.ObjTypeCode, Name = x.ObjTypeName });
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
                _context.Database.CloseConnection();
            }
            return listTemp;
        }
        // trang thai cardJob
        [HttpPost]
        public JsonResult GetStatus()
        {
            var data = _context.CommonSettings.Where(x => x.Group == EnumHelper<CardEnum>.GetDisplayValue(CardEnum.Stautus) && x.IsDeleted == false)
                        .Select(x => new { Code = x.CodeSet, Value = x.ValueSet });
            return Json(data);
        }
        //trang thai san pham
        [HttpPost]
        public JsonResult GetStatusProduct()
        {
            var data = _context.CommonSettings.Where(x => x.Group == "CAT_STATUS" && x.IsDeleted == false)
                        .Select(x => new { Code = x.CodeSet, Value = x.ValueSet });
            return Json(data);
        }
        //trang thai yeu cau hoi gia
        [HttpPost]
        public JsonResult GetStatusRequestPrice()
        {
            var data = _context.CommonSettings.Where(x => x.Group == "PRICE_STATUS" && x.IsDeleted == false)
                        .Select(x => new { Code = x.CodeSet, Value = x.ValueSet });
            return Json(data);
        }
        //trang thai khach hang
        [HttpPost]
        public JsonResult GetStatusCustomer()
        {
            var data = _context.CommonSettings.Where(x => x.Group == "CUSTOMER_STATUS" && x.IsDeleted == false)
                        .Select(x => new { Code = x.CodeSet, Value = x.ValueSet });
            return Json(data);
        }
        //trang thai nha cung cap
        [HttpPost]
        public JsonResult GetStatusSupplier()
        {
            var data = _context.CommonSettings.Where(x => x.Group == "SUPPLIER_STATUS" && x.IsDeleted == false)
                        .Select(x => new { Code = x.CodeSet, Value = x.ValueSet });
            return Json(data);
        }
        //trang thai hop dong mua
        [HttpPost]
        public JsonResult GetStatusContractPo()
        {
            var data = _context.CommonSettings.Where(x => x.Group == "CONTRACT_STATUS_PO_SUP" && x.IsDeleted == false)
                        .Select(x => new { Code = x.CodeSet, Value = x.ValueSet });
            return Json(data);
        }
        //trang thai du an
        [HttpPost]
        public JsonResult GetStatusProJect()
        {
            var data = _context.CommonSettings.Where(x => x.Group == "PROJECT_STATUS" && x.IsDeleted == false)
                        .Select(x => new { Code = x.CodeSet, Value = x.ValueSet });
            return Json(data);
        }
        //trang thai hop dong ban
        [HttpPost]
        public JsonResult GetStatusContract()
        {
            var data = _context.CommonSettings.Where(x => x.Group == "CONTRACT_STATUS_PO_CUS" && x.IsDeleted == false)
                        .Select(x => new { Code = x.CodeSet, Value = x.ValueSet });
            return Json(data);
        }
        #region serchCard
        //[HttpPost]
        //public JsonResult GetGridCard([FromBody]AdvanceSearchObj jtablePara)
        //{
        //    //TabBoard = 1(Bảng)                  //TabBoard = 5(Dự án)
        //    //TabBoard = 2(Phòng ban)             //TabBoard = 6(Khách hàng)
        //    //TabBoard = 3(Nhân viên)             //TabBoard = 7(Hợp đồng)
        //    //TabBoard = 4(Nhóm)                  //TabBoard = 8(Nhà cung cấp)
        //    int intBegin = (jtablePara.CurrentPage - 1) * jtablePara.Length;
        //    IQueryable<GridCardJtable> queryTab = null;
        //    if (jtablePara.TabBoard == 1)
        //    {
        //        queryTab = GetGirdCardBoard(jtablePara);
        //    }
        //    else if (jtablePara.TabBoard == 2)
        //    {
        //        queryTab = GetGirdCardDepartment(jtablePara);
        //    }
        //    else if (jtablePara.TabBoard == 3)
        //    {
        //        queryTab = GetGirdCardUser(jtablePara);
        //    }
        //    else if (jtablePara.TabBoard == 4)
        //    {
        //        queryTab = GetGirdCardGroupUser(jtablePara);
        //    }
        //    else if (jtablePara.TabBoard == 5)
        //    {
        //        queryTab = GetGirdCardProject(jtablePara);
        //    }
        //    else if (jtablePara.TabBoard == 6)
        //    {
        //        queryTab = GetGirdCardCustomer(jtablePara);
        //    }
        //    else if (jtablePara.TabBoard == 7)
        //    {
        //        queryTab = GetGirdCardContract(jtablePara);
        //    }
        //    else if (jtablePara.TabBoard == 8)
        //    {
        //        queryTab = GetGirdCardSupplier(jtablePara);
        //    }
        //    int count = queryTab.Count();
        //    var data = queryTab.Skip(intBegin).Take(jtablePara.Length).AsNoTracking().ToList();
        //    var jdata = JTableHelper.JObjectTable(
        //                        data,
        //                        jtablePara.Draw,
        //                        count,
        //                        "CardID", "CardCode", "CardName", "ListName", "Deadline", "Status",
        //                        "Completed", "BeginTime", "EndTime", "Cost", "Currency"
        //                        );
        //    return Json(jdata);
        //}
        public IQueryable<GridCardJtable> GetGirdCardBoard(AdvanceSearchObj dataSearch)
        {
            var fromDate = string.IsNullOrEmpty(dataSearch.FromDate) ? (DateTime?)null : DateTime.ParseExact(dataSearch.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var toDate = string.IsNullOrEmpty(dataSearch.ToDate) ? (DateTime?)null : DateTime.ParseExact(dataSearch.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var query = (from a in _context.WORKOSCards.Where(x => !x.IsDeleted)
                         join c in _context.CardCommentLists on a.CardCode equals c.CardCode into c1
                         from c2 in c1.DefaultIfEmpty()
                         join d in _context.CardItemChecks on a.CardCode equals d.CardCode into d1
                         from d2 in d1.DefaultIfEmpty()
                         join e in _context.JcObjectIdRelatives on a.CardCode equals e.CardCode into e1
                         from e2 in e1.DefaultIfEmpty()
                         join g in _context.CardMappings on a.CardCode equals g.CardCode into g1
                         from g2 in g1.DefaultIfEmpty()
                         join h in _context.Users on g2.UserId equals h.Id into h1
                         from h2 in h1.DefaultIfEmpty()
                         join j in _context.HREmployees on h2.EmployeeCode equals j.Id.ToString() into j1
                         from j2 in j1.DefaultIfEmpty()
                         join f in dataSearch.ListObject on e2.ObjID equals f.ObjectCode into f1
                         from f2 in f1.DefaultIfEmpty()
                         where
                         ((string.IsNullOrEmpty(dataSearch.KeySearch) || a.CardName.ToUpper().Contains(dataSearch.KeySearch.ToUpper())) ||
                         (string.IsNullOrEmpty(dataSearch.KeySearch) || c2.CmtContent.ToUpper().Contains(dataSearch.KeySearch.ToUpper())) ||
                         (string.IsNullOrEmpty(dataSearch.KeySearch) || d2.CheckTitle.ToUpper().Contains(dataSearch.KeySearch.ToUpper())) ||
                         (string.IsNullOrEmpty(dataSearch.KeySearch) || a.Description.ToLower().Contains(dataSearch.KeySearch.ToLower()))) &&
                          (string.IsNullOrEmpty(dataSearch.IdEmployee) || (dataSearch.IdEmployee == "ALL") || j2.employee_code.Equals(dataSearch.IdEmployee)) &&
                         (fromDate == null || a.BeginTime.Date >= fromDate) &&
                         (toDate == null || a.EndTime.HasValue && a.EndTime.Value.Date <= toDate)
                         select new GridCardJtable
                         {
                             CardID = a.CardID,
                             CardCode = a.CardCode,
                             CardName = a.CardName,
                             Deadline = a.Deadline,
                             Currency = _context.CommonSettings.FirstOrDefault(y => y.CodeSet == a.Currency).ValueSet ?? "",
                             Cost = a.Cost,
                             Completed = a.Completed,
                             BeginTime = a.BeginTime.ToString("dd/MM/yyyy"),
                             Status = _context.CommonSettings.FirstOrDefault(y => y.CodeSet.Equals(a.Status)).ValueSet,
                             EndTime = a.EndTime.HasValue ? a.EndTime.Value.ToString("dd/MM/yyyy") : "",
                         }).DistinctBy(x => x.CardCode).OrderByDescending(x => x.CardID);
            IQueryable<GridCardJtable> data1 = query.AsQueryable<GridCardJtable>();
            return data1;
        }
        public class GridCardJtable
        {
            public int CardID { get; set; }
            public string CardCode { get; set; }
            public string CardName { get; set; }
            public string ListName { get; set; }
            public DateTime Deadline { get; set; }
            public string Currency { get; set; }
            public decimal Cost { get; set; }
            public decimal Completed { get; set; }
            public string BeginTime { get; set; }
            public string EndTime { get; set; }
            public string Status { get; set; }
        }
        public class AdvanceSearchObj : JTableModel
        {
            public string KeySearch { get; set; }
            public string IdEmployee { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public List<ObjectSearch> ListObject { get; set; }
        }
        public class ObjectSearch
        {
            public string ObjectCode { get; set; }
            public string Status { get; set; }
            public string Logic { get; set; }
            public string TypeObjectCode { get; set; }
        }
        #endregion

        public class RequestSearch
        {
            public int Id { get; set; }
            public string Code { get; set; }
            public string Name { get; set; }
        }
        [HttpPost]
        public JsonResult SearchAdvanced([FromBody]AdvanceSearchObj dataSearch)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = new List<RequestSearch>();
                DateTime? FromDate = !string.IsNullOrEmpty(dataSearch.FromDate) ? DateTime.ParseExact(dataSearch.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                DateTime? ToDate = !string.IsNullOrEmpty(dataSearch.ToDate) ? DateTime.ParseExact(dataSearch.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                if (dataSearch.ListObject.Count() != 0)
                {
                   
                    for (var i = 0; i < dataSearch.ListObject.Count(); i++)
                    {
                        var query = new List<RequestSearch>();
                        switch (dataSearch.ListObject[i].TypeObjectCode)
                        {

                            case "PRODUCT"://san pham
                                query = _context.MaterialProducts.Where(x => !x.IsDeleted
                                && ((string.IsNullOrEmpty(dataSearch.KeySearch) || (x.ProductName.ToLower().Contains(dataSearch.KeySearch)) || (x.Note.ToLower().Contains(dataSearch.KeySearch)))
                                && ((dataSearch.ListObject[i].ObjectCode == "ALL") || (x.ProductCode == dataSearch.ListObject[i].ObjectCode)))
                                && ((FromDate == null) || (x.CreatedTime.Date >= FromDate)) && ((ToDate == null) || (x.CreatedTime.Date <= ToDate))
                                && ((dataSearch.ListObject[i].Status == "ALL") || (x.Status == dataSearch.ListObject[i].Status)))
                                    .Select(x => new RequestSearch
                                    {
                                        Id = x.Id,
                                        Code = x.ProductCode,
                                        Name = x.ProductName
                                    }).ToList();
                                break;
                            case "SERVICECAT"://dich vu
                                query = _context.ServiceCategorys.Where(x => !x.IsDeleted
                                && ((string.IsNullOrEmpty(dataSearch.KeySearch) || (x.ServiceName.ToLower().Contains(dataSearch.KeySearch)))
                                && ((dataSearch.ListObject[i].ObjectCode == "ALL") || (x.ServiceCode == dataSearch.ListObject[i].ObjectCode)))).Select(x => new RequestSearch
                                {
                                    Id = x.ServiceCatID,
                                    Code = x.ServiceCode,
                                    Name = x.ServiceName
                                }).ToList();
                                break;
                            case "ORDER_REQUEST"://thong tin co hoi
                                query = _context.OrderRequestRaws.Where(x =>
                                ((string.IsNullOrEmpty(dataSearch.KeySearch) || (x.Title.ToLower().Contains(dataSearch.KeySearch)) || (x.Content.ToLower().Contains(dataSearch.KeySearch)))
                                && ((dataSearch.ListObject[i].ObjectCode == "ALL") || (x.ReqCode == dataSearch.ListObject[i].ObjectCode))
                                && ((FromDate == null) || (x.CreatedTime == null) || (x.CreatedTime.HasValue && x.CreatedTime.Value.Date >= FromDate)) && ((ToDate == null) || (x.CreatedTime == null) || (x.CreatedTime.HasValue && x.CreatedTime.Value.Date >= FromDate))
                                && ((dataSearch.ListObject[i].Status == "ALL") || (x.Status == dataSearch.ListObject[i].Status))))
                                    .Select(x => new RequestSearch
                                    {
                                        Id = x.Id,
                                        Code = x.ReqCode,
                                        Name = x.Title
                                    }).ToList();
                                break;
                            case "REQUEST_PRICE"://yeu cau hoi gia
                                query = _context.RequestPriceHeaders.Where(x => !x.IsDeleted
                                && ((string.IsNullOrEmpty(dataSearch.KeySearch) || (x.Title.ToLower().Contains(dataSearch.KeySearch)))
                                && ((dataSearch.ListObject[i].ObjectCode == "ALL") || (x.ReqCode == dataSearch.ListObject[i].ObjectCode))
                                && ((FromDate == null) || (x.CreatedTime == null) || (x.CreatedTime.Date >= FromDate)) && ((ToDate == null) || (x.CreatedTime == null) || (x.CreatedTime.Date >= FromDate))
                                && ((dataSearch.ListObject[i].Status == "ALL") || (x.Status == dataSearch.ListObject[i].Status))))

                                    .Select(x => new RequestSearch
                                    {
                                        Id = x.Id,
                                        Code = x.ReqCode,
                                        Name = x.Title
                                    }).ToList();
                                break;
                            case "CUSTOMER"://Khach hang
                                query = _context.Customerss.Where(x => !x.IsDeleted
                                && ((string.IsNullOrEmpty(dataSearch.KeySearch) || (x.CusName.ToLower().Contains(dataSearch.KeySearch)) || (x.Description.ToLower().Contains(dataSearch.KeySearch)))
                                && ((dataSearch.ListObject[i].ObjectCode == "ALL") || (x.CusCode == dataSearch.ListObject[i].ObjectCode))
                                && ((FromDate == null) || (x.CreatedTime == null) || (x.CreatedTime.HasValue && x.CreatedTime.Value.Date >= FromDate)) && ((ToDate == null) || (x.CreatedTime == null) || (x.CreatedTime.HasValue && x.CreatedTime.Value.Date >= FromDate))
                                && ((dataSearch.ListObject[i].Status == "ALL") || (x.Status == dataSearch.ListObject[i].Status))))

                                    .Select(x => new RequestSearch
                                    {
                                        Id = x.CusID,
                                        Code = x.CusCode,
                                        Name = x.CusName
                                    }).ToList();
                                break;
                            case "SUPPLIER"://nha cung cap
                                query = _context.Suppliers.Where(x => !x.IsDeleted
                                && ((string.IsNullOrEmpty(dataSearch.KeySearch) || (x.SupName.ToLower().Contains(dataSearch.KeySearch)) || (x.Description.ToLower().Contains(dataSearch.KeySearch)))
                                && ((FromDate == null) || (x.CreatedTime == null) || (x.CreatedTime.HasValue && x.CreatedTime.Value.Date >= FromDate)) && ((ToDate == null) || (x.CreatedTime == null) || (x.CreatedTime.HasValue && x.CreatedTime.Value.Date >= FromDate))
                                && ((dataSearch.ListObject[i].ObjectCode == "ALL") || (x.SupCode == dataSearch.ListObject[i].ObjectCode))
                                && ((dataSearch.ListObject[i].Status == "ALL") || (x.Status == dataSearch.ListObject[i].Status))))
                                    .Select(x => new RequestSearch
                                    {
                                        Id = x.SupID,
                                        Code = x.SupCode,
                                        Name = x.SupName
                                    }).ToList();
                                break;
                            case "CONTRACT_PO"://hop dong mua
                                query = _context.PoBuyerHeaders.Where(x => !x.IsDeleted
                                && ((string.IsNullOrEmpty(dataSearch.KeySearch) || (x.SupCode.ToLower().Contains(dataSearch.KeySearch)))
                                && ((dataSearch.ListObject[i].ObjectCode == "ALL") || (x.BuyerCode == dataSearch.ListObject[i].ObjectCode))
                                && ((FromDate == null) || (x.CreatedTime == null) || (x.CreatedTime.HasValue && x.CreatedTime.Value.Date >= FromDate)) && ((ToDate == null) || (x.CreatedTime == null) || (x.CreatedTime.HasValue && x.CreatedTime.Value.Date >= FromDate))
                                && ((dataSearch.ListObject[i].Status == "ALL") || (x.Status == dataSearch.ListObject[i].Status))))
                                    .Select(x => new RequestSearch
                                    {
                                        Id = x.Id,
                                        Code = x.BuyerCode,
                                        Name = x.SupCode
                                    }).ToList();
                                break;
                            case "PROJECT"://du an
                                query = _context.Projects.Where(x => !x.FlagDeleted
                                && ((string.IsNullOrEmpty(dataSearch.KeySearch) || (x.ProjectTitle.ToLower().Contains(dataSearch.KeySearch)))
                                && ((FromDate == null) || (x.CreatedTime == null) || (x.CreatedTime.HasValue && x.CreatedTime.Value.Date >= FromDate)) && ((ToDate == null) || (x.CreatedTime == null) || (x.CreatedTime.HasValue && x.CreatedTime.Value.Date >= FromDate))
                                && ((dataSearch.ListObject[i].ObjectCode == "ALL") || (x.ProjectCode == dataSearch.ListObject[i].ObjectCode))
                                && ((dataSearch.ListObject[i].Status == "ALL") || (x.Status == dataSearch.ListObject[i].Status))))
                                    .Select(x => new RequestSearch
                                    {
                                        Id = x.Id,
                                        Code = x.ProjectCode,
                                        Name = x.ProjectTitle
                                    }).ToList();
                                break;
                            case "CONTRACT":// hop dong ban
                                query = _context.PoSaleHeaders.Where(x => !x.IsDeleted
                                && ((string.IsNullOrEmpty(dataSearch.KeySearch) || (x.Title.ToLower().Contains(dataSearch.KeySearch)))
                                && ((FromDate == null) || (x.CreatedTime == null) || (x.CreatedTime.HasValue && x.CreatedTime.Value.Date >= FromDate)) && ((ToDate == null) || (x.CreatedTime == null) || (x.CreatedTime.HasValue && x.CreatedTime.Value.Date >= FromDate))
                                && ((dataSearch.ListObject[i].ObjectCode == "ALL") || (x.ContractCode == dataSearch.ListObject[i].ObjectCode))
                                && ((dataSearch.ListObject[i].Status == "ALL") || (x.Status == dataSearch.ListObject[i].Status))))
                                    .Select(x => new RequestSearch
                                    {
                                        Id = x.ContractHeaderID,
                                        Code = x.ContractCode,
                                        Name = x.Title
                                    }).ToList();
                                break;

                        };

                        data.AddRange(query);
                    }
                    var queryTab = GetGirdCardBoard(dataSearch);
                    msg.Object = new
                    {
                        queryTab = queryTab,
                        data = data,
                    };
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Vui lòng chọn đối tượng tìm kiếm!";
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

        public class SearchObjectView
        {

        }
    }
}