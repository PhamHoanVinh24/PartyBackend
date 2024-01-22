using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Identity;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using ESEIM;
using System;
using System.Globalization;
using ESEIM.Utils;
using System.Collections.Generic;
using System.Data;
using III.Domain.Enums;

namespace III.Admin.Controllers
{
    [Area("Admin")]

    public class VCChartController : BaseController
    {
        private readonly UserManager<AspNetUser> _userManager;
        private readonly RoleManager<AspNetRole> _roleManager;
        private readonly EIMDBContext _context;
        private readonly AppSettings _appSettings;
        private readonly IRepositoryService _repositoryService;
        public VCChartController(IOptions<AppSettings> appSettings, EIMDBContext context, UserManager<AspNetUser> userManager, RoleManager<AspNetRole> roleManager, EIMDBContext swContext,
            IRepositoryService repositoryService)
        {
            _userManager = userManager;
            _context = context;
            _roleManager = roleManager;
            _appSettings = appSettings.Value;
            _repositoryService = repositoryService;
        }
        public IActionResult Index()
        {
            return View();
        }

        /// <summary>
        /// Combobox
        /// </summary>
        /// <returns></returns>
        [HttpPost]
        public object GetListUser()
        {
            var list = _context.Users.Where(x => x.Active == true && x.UserName != "admin").Select(x => new { x.Id, x.GivenName }).AsNoTracking().ToList();
            return list;
        }

        //Lấy list Chủng loại
        [HttpPost]
        public object GetListProduct()
        {
            var list = _context.MaterialProducts.Where(x => !x.IsDeleted).Select(x => new { x.ProductCode, x.ProductName }).AsNoTracking().ToList();
            return list;
        }
        //Lấy list Đại lý/Cửa hàng
        [HttpPost]
        public object GetListCustomer()
        {
            var session = HttpContext.GetSessionUser();
            var rs = GetListCustomerFunc(session).ToList();
            return rs;
        }
        //Lấy list Thương hiệu
        [HttpPost]
        public object GetListBrand()
        {
            return GetListBrandFunc();
        }
        //Lấy list vùng
        [HttpPost]
        public JsonResult GetListArea()
        {
            var msg = new JMessage() { Error = false };
            var data = from a in _context.CommonSettings
                       where a.Group == EnumHelper<CommonEnum>.GetDisplayValue(CommonEnum.Area) && a.IsDeleted == false
                       select new
                       {
                           Code = a.CodeSet,
                           Name = a.ValueSet,
                       };
            msg.Object = data;
            return Json(msg);
        }


        /// <summary>
        /// Progress
        /// </summary>
        /// <param name="fromDate"></param>
        /// <param name="toDate"></param>
        /// <param name="userId"></param>
        /// <returns></returns>
        //Lấy tiến độ công việc
        [HttpGet]
        public JsonResult GetWorkProgress(string fromDate, string toDate, string userId)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var listProgress = new List<VCChartProgress>();
            var fromD = DateTime.ParseExact(fromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var toD = DateTime.ParseExact(toDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            IQueryable<VCWorkProgress> query = null;
            var session = HttpContext.GetSessionUser();
            try
            {
                if (session.UserType == 10)
                {
                    query = (from a in _context.VcWorkPlans.Where(x => x.IsDeleted != true && x.CurrentStatus != "WP_REJECT")
                             join b in _context.Users.Where(x => x.Id == userId) on a.UserName equals b.UserName
                             where (a.FromDate >= fromD && a.FromDate <= toD) || (a.ToDate >= fromD && a.ToDate <= toD)
                             select new VCWorkProgress
                             {
                                 WpCode = a.WpCode,
                                 FromDate = a.FromDate,
                                 ToDate = a.ToDate,
                                 ListWork = _context.VcSettingRoutes.Where(x => x.WpCode == a.WpCode && !x.IsDeleted).Select(x => new VCDetailProgres { CreatedTime = x.CreatedTime, CurrentStatus = x.CurrentStatus }),
                             });
                }
                else
                {
                    if (session.TypeStaff == 10)
                    {
                        var listArea = GetListAreaFunc(session);
                        query = (from a in _context.VcWorkPlans.Where(x => x.IsDeleted != true && x.CurrentStatus != "WP_REJECT")
                                 join b in _context.Users.Where(x => x.Id == userId) on a.UserName equals b.UserName
                                 join d in listArea.Select(x => x.Code) on b.Area equals d
                                 where (a.FromDate >= fromD && a.FromDate <= toD) || (a.ToDate >= fromD && a.ToDate <= toD)
                                 select new VCWorkProgress
                                 {
                                     WpCode = a.WpCode,
                                     FromDate = a.FromDate,
                                     ToDate = a.ToDate,
                                     ListWork = _context.VcSettingRoutes.Where(x => x.WpCode == a.WpCode && !x.IsDeleted).Select(x => new VCDetailProgres { CreatedTime = x.CreatedTime, CurrentStatus = x.CurrentStatus }),
                                 });
                    }
                    else if (session.TypeStaff == 0)
                    {
                        query = (from a in _context.VcWorkPlans.Where(x => x.IsDeleted != true && x.CreatedBy == session.UserName && x.CurrentStatus != "WP_REJECT")
                                 join b in _context.Users.Where(x => x.Id == userId) on a.UserName equals b.UserName
                                 where (a.FromDate >= fromD && a.FromDate <= toD) || (a.ToDate >= fromD && a.ToDate <= toD)
                                 select new VCWorkProgress
                                 {
                                     WpCode = a.WpCode,
                                     FromDate = a.FromDate,
                                     ToDate = a.ToDate,
                                     ListWork = _context.VcSettingRoutes.Where(x => x.WpCode == a.WpCode && !x.IsDeleted).Select(x => new VCDetailProgres { CreatedTime = x.CreatedTime, CurrentStatus = x.CurrentStatus }),
                                 });
                    }
                }
                if (query.Any())
                {
                    for (DateTime date = fromD; date <= toD; date = date.AddDays(1))
                    {
                        var checkWork = query.FirstOrDefault(x => x.FromDate.Date <= date && x.ToDate >= date);
                        if (checkWork != null)
                        {
                            var worked = query.Where(x => x.WpCode == checkWork.WpCode).Select(x => new { workerd = x.ListWork.Where(y => y.CreatedTime.Date <= date && y.CurrentStatus == "ROUTE_DONE") }).Select(y => new
                            {
                                total = query.Where(p => p.WpCode == checkWork.WpCode).First().ListWork.Count(),
                                worked = y.workerd.Count()
                            });
                            var progres = new VCChartProgress
                            {
                                Date = date.ToString("dd/MM/yyyy"),
                                Percent = ((double)worked.First().worked / (double)worked.First().total) * 100,
                                Worked = worked.First().worked + "/" + worked.First().total + " mục công việc"
                            };
                            listProgress.Add(progres);
                        }
                        else
                        {
                            var progres = new VCChartProgress
                            {
                                Date = date.ToString("dd/MM/yyyy"),
                                Percent = 0
                            };
                            listProgress.Add(progres);
                        }
                    }
                    msg.Object = listProgress;
                }
                else
                {
                    msg.Error = true;
                     msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_NOT_FOUND_DATA"));
                    
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DATA_FAIL"));
            }
            return Json(msg);
        }



        /// <summary>
        /// Consump are
        /// </summary>
        /// <param name="productCode"></param>
        /// <param name="brandCode"></param>
        /// <param name="dateSearch"></param>
        /// <returns></returns>
        //Lấy ra tổng sản lượng tháng của vùng
        [HttpGet]
        public JsonResult GetConsumpWithArea(string productCode, string brandCode, string dateSearch)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var session = HttpContext.GetSessionUser();
                DateTime date = !string.IsNullOrEmpty(dateSearch) ? DateTime.ParseExact(dateSearch, "MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;
                var startDateNow = new DateTime(date.Year, date.Month, 1);
                var startDateNext = new DateTime(date.Year, date.Month, 1);
                startDateNext = startDateNext.AddMonths(1);

                var query = new List<VCGroupCustomerCareModel>();
                if (session.UserType == 10)
                {
                    string[] param1 = new string[] { "@startDateNext", "@startDateNow", "@productCode", "@brandCode" };
                    object[] val1 = new object[] { startDateNext, startDateNow, productCode, brandCode };
                    DataTable rs1 = _repositoryService.GetDataTableProcedureSql("P_Get_Consump_Chart_Area_4_Admin", param1, val1);
                    query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs1);
                }
                else
                {
                    if (session.TypeStaff == 10)
                    {
                        string[] param1 = new string[] { "@startDateNext", "@startDateNow", "@productCode", "@brandCode", "@listArea" };
                        object[] val1 = new object[] { startDateNext, startDateNow, productCode, brandCode, session.Area };
                        DataTable rs1 = _repositoryService.GetDataTableProcedureSql("P_Get_Consump_Chart_Area_4_Manager", param1, val1);
                        query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs1);
                    }
                    else if (session.TypeStaff == 0)
                    {
                        string[] param1 = new string[] { "@startDateNext", "@startDateNow", "@productCode", "@brandCode", "@userName" };
                        object[] val1 = new object[] { startDateNext, startDateNow, productCode, brandCode, session.UserName };
                        DataTable rs1 = _repositoryService.GetDataTableProcedureSql("P_Get_Consump_Chart_Area_4_User", param1, val1);
                        query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs1);
                    }
                }
                msg.Object = (from a in query
                              select new
                              {
                                  Area = a.AreaCode,
                                  AreaName = a.AreaName,
                                  ConsumpMonthly = a.ConsumpMonthly,
                              });
            }
            catch (Exception ex)
            {
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DATA_FAIL"));
                msg.Error = true;
            }
            return Json(msg);
        }
        //Lấy ra tổng sản lượng tháng của khách hàng theo vùng
        [HttpGet]
        public JsonResult GetConsumpWithCustomer(string productCode, string brandCode, string dateSearch, string areaCode)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var session = HttpContext.GetSessionUser();
                DateTime date = !string.IsNullOrEmpty(dateSearch) ? DateTime.ParseExact(dateSearch, "MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;
                var startDateNow = new DateTime(date.Year, date.Month, 1);
                var startDateNext = new DateTime(date.Year, date.Month, 1);
                startDateNext = startDateNext.AddMonths(1);

                var query = new List<VCGroupCustomerCareModel>();
                if (session.UserType == 10)
                {
                    string[] param1 = new string[] { "@startDateNext", "@startDateNow", "@productCode", "@brandCode", "@areaCode" };
                    object[] val1 = new object[] { startDateNext, startDateNow, productCode, brandCode, areaCode };
                    DataTable rs1 = _repositoryService.GetDataTableProcedureSql("P_Get_Consump_Chart_Customer_4_Admin", param1, val1);
                    query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs1);
                }
                else
                {
                    if (session.TypeStaff == 10)
                    {
                        string[] param1 = new string[] { "@startDateNext", "@startDateNow", "@productCode", "@brandCode", "@areaCode", "@listArea" };
                        object[] val1 = new object[] { startDateNext, startDateNow, productCode, brandCode, areaCode, session.Area };
                        DataTable rs1 = _repositoryService.GetDataTableProcedureSql("P_Get_Consump_Chart_Customer_4_Manager", param1, val1);
                        query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs1);
                    }
                    else if (session.TypeStaff == 0)
                    {
                        string[] param1 = new string[] { "@startDateNext", "@startDateNow", "@productCode", "@brandCode", "@areaCode", "@userName" };
                        object[] val1 = new object[] { startDateNext, startDateNow, productCode, brandCode, areaCode, session.UserName };
                        DataTable rs1 = _repositoryService.GetDataTableProcedureSql("P_Get_Consump_Chart_Customer_4_User", param1, val1);
                        query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs1);
                    }
                }
                msg.Object = (from a in query
                              select new
                              {
                                  CusName = a.CusName,
                                  ConsumpMonthly = a.ConsumpMonthly,
                              });
            }
            catch (Exception ex)
            {
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DATA_FAIL"));
                msg.Error = true;
            }
            return Json(msg);
        }



        /// <summary>
        /// Instock area
        /// </summary>
        /// <param name="productCode"></param>
        /// <param name="brandCode"></param>
        /// <param name="dateSearch"></param>
        /// <returns></returns>
        //Lấy ra tồn kho của vùng
        [HttpGet]
        public JsonResult GetInstockWithArea(string productCode, string brandCode, string dateSearch)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var session = HttpContext.GetSessionUser();
                DateTime date = !string.IsNullOrEmpty(dateSearch) ? DateTime.ParseExact(dateSearch, "MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;
                var startDateNow = new DateTime(date.Year, date.Month, 1);
                var startDateNext = new DateTime(date.Year, date.Month, 1);
                startDateNext = startDateNext.AddMonths(1);

                var query = new List<VCGroupCustomerCareModel>();
                if (session.UserType == 10)
                {
                    string[] param1 = new string[] { "@productCode", "@brandCode", "@startDateNext" };
                    object[] val1 = new object[] { productCode, brandCode, startDateNext };
                    DataTable rs1 = _repositoryService.GetDataTableProcedureSql("P_Get_Instock_Newest_Chart_Area_4_Admin", param1, val1);
                    query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs1);
                }
                else
                {
                    if (session.TypeStaff == 10)
                    {
                        string[] param1 = new string[] { "@productCode", "@brandCode", "@listArea", "@startDateNext", };
                        object[] val1 = new object[] { productCode, brandCode, session.Area, startDateNext };
                        DataTable rs1 = _repositoryService.GetDataTableProcedureSql("P_Get_Instock_Newest_Chart_Area_4_Manager", param1, val1);
                        query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs1);
                    }
                    else if (session.TypeStaff == 0)
                    {
                        string[] param1 = new string[] { "@productCode", "@brandCode", "@userName", "@startDateNext" };
                        object[] val1 = new object[] { productCode, brandCode, session.UserName, startDateNext };
                        DataTable rs1 = _repositoryService.GetDataTableProcedureSql("P_Get_Instock_Newest_Chart_Area_4_User", param1, val1);
                        query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs1);
                    }
                }

                msg.Object = (from a in query
                              select new
                              {
                                  Area = a.AreaCode,
                                  AreaName = a.AreaName,
                                  Instock = a.Instock,
                              });
            }
            catch (Exception ex)
            {
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DATA_FAIL"));
                msg.Error = true;
            }
            return Json(msg);
        }
        //Lấy ra tồn kho của khách hàng theo vùng
        [HttpGet]
        public JsonResult GetInstockWithCustomer(string productCode, string brandCode, string dateSearch, string areaCode)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var session = HttpContext.GetSessionUser();
                var date = !string.IsNullOrEmpty(dateSearch) ? DateTime.ParseExact(dateSearch, "MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;
                var startDateNow = new DateTime(date.Year, date.Month, 1);
                var startDateNext = new DateTime(date.Year, date.Month, 1);
                startDateNext = startDateNext.AddMonths(1);

                var query = new List<VCGroupCustomerCareModel>();
                if (session.UserType == 10)
                {
                    string[] param1 = new string[] { "@areaCode", "@brandCode", "@productCode", "@startDateNext" };
                    object[] val1 = new object[] { areaCode, brandCode, productCode, startDateNext };
                    DataTable rs1 = _repositoryService.GetDataTableProcedureSql("P_Get_Instock_Newest_Chart_Customer_4_Admin", param1, val1);
                    query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs1);
                }
                else
                {
                    if (session.TypeStaff == 10)
                    {
                        string[] param1 = new string[] { "@areaCode", "@brandCode", "@productCode", "@startDateNext", "@listArea" };
                        object[] val1 = new object[] { areaCode, brandCode, productCode, startDateNext, session.Area };
                        DataTable rs1 = _repositoryService.GetDataTableProcedureSql("P_Get_Instock_Newest_Chart_Customer_4_Manager", param1, val1);
                        query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs1);
                    }
                    else if (session.TypeStaff == 0)
                    {
                        string[] param1 = new string[] { "@areaCode", "@brandCode", "@productCode", "@startDateNext", "@userName" };
                        object[] val1 = new object[] { areaCode, brandCode, productCode, startDateNext, session.UserName };
                        DataTable rs1 = _repositoryService.GetDataTableProcedureSql("P_Get_Instock_Newest_Chart_Customer_4_User", param1, val1);
                        query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs1);
                    }
                }

                msg.Object = (from a in query
                              select new
                              {
                                  CusName = a.CusName,
                                  Instock = a.Instock,
                              });
            }
            catch (Exception ex)
            {
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DATA_FAIL"));
                msg.Error = true;
            }
            return Json(msg);
        }


        /// <summary>
        /// total
        /// </summary>
        /// <param name="dateSearch"></param>
        /// <returns></returns>
        //Lấy ra trữ lượng trống của vùng
        [HttpGet]
        public JsonResult GetTotalCanImpWithArea(string dateSearch)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var session = HttpContext.GetSessionUser();

                DateTime date = !string.IsNullOrEmpty(dateSearch) ? DateTime.ParseExact(dateSearch, "MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;
                var startDateNow = new DateTime(date.Year, date.Month, 1);
                var startDateNext = new DateTime(date.Year, date.Month, 1);
                startDateNext = startDateNext.AddMonths(1);

                List<VCGroupCustomerCareModel> query = new List<VCGroupCustomerCareModel>();
                if (session.UserType == 10)
                {
                    string[] param1 = new string[] { "@startDateNext" };
                    object[] val1 = new object[] { startDateNext };
                    DataTable rs1 = _repositoryService.GetDataTableProcedureSql("P_Get_Total_Can_Imp_Chart_Area_4_Admin", param1, val1);
                    query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs1);
                }
                else
                {
                    if (session.TypeStaff == 10)
                    {
                        string[] param1 = new string[] { "@startDateNext", "@listArea" };
                        object[] val1 = new object[] { startDateNext, session.Area };
                        DataTable rs1 = _repositoryService.GetDataTableProcedureSql("P_Get_Total_Can_Imp_Chart_Area_4_Manager", param1, val1);
                        query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs1);
                    }
                    else if (session.TypeStaff == 0)
                    {
                        string[] param1 = new string[] { "@startDateNext", "@userName" };
                        object[] val1 = new object[] { startDateNext, session.UserName };
                        DataTable rs1 = _repositoryService.GetDataTableProcedureSql("P_Get_Total_Can_Imp_Chart_Area_4_User", param1, val1);
                        query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs1);
                    }
                }

                msg.Object = (from a in query
                              select new
                              {
                                  Area = a.AreaCode,
                                  AreaName = a.AreaName,
                                  TotalCanImp = a.TotalCanImp,
                                  //Proportion = grp.Average(y => y.Proportion),
                              });
            }
            catch (Exception ex)
            {
               msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DATA_FAIL"));
                msg.Error = true;
            }
            return Json(msg);
        }
        //Lấy ra trữ lượng trống của khách hàng theo vùng
        [HttpGet]
        public JsonResult GetTotalCanImpWithCustomer(string dateSearch, string areaCode)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var session = HttpContext.GetSessionUser();

                DateTime date = !string.IsNullOrEmpty(dateSearch) ? DateTime.ParseExact(dateSearch, "MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;
                var startDateNow = new DateTime(date.Year, date.Month, 1);
                var startDateNext = new DateTime(date.Year, date.Month, 1);
                startDateNext = startDateNext.AddMonths(1);

                List<VCGroupCustomerCareModel> query = new List<VCGroupCustomerCareModel>();
                if (session.UserType == 10)
                {
                    string[] param1 = new string[] { "@startDateNext", "@areaCode" };
                    object[] val1 = new object[] { startDateNext, areaCode };
                    DataTable rs1 = _repositoryService.GetDataTableProcedureSql("P_Get_Total_Can_Imp_Chart_Customer_4_Admin", param1, val1);
                    query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs1);
                }
                else
                {
                    if (session.TypeStaff == 10)
                    {
                        string[] param1 = new string[] { "@startDateNext", "@areaCode", "@listArea" };
                        object[] val1 = new object[] { startDateNext, areaCode, session.Area };
                        DataTable rs1 = _repositoryService.GetDataTableProcedureSql("P_Get_Total_Can_Imp_Chart_Customer_4_Manager", param1, val1);
                        query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs1);
                    }
                    else if (session.TypeStaff == 0)
                    {
                        string[] param1 = new string[] { "@startDateNext", "@areaCode", "@userName" };
                        object[] val1 = new object[] { startDateNext, areaCode, session.UserName };
                        DataTable rs1 = _repositoryService.GetDataTableProcedureSql("P_Get_Total_Can_Imp_Chart_Customer_4_User", param1, val1);
                        query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs1);
                    }
                }

                msg.Object = (from a in query
                              select new
                              {
                                  CusCode = a.CusCode,
                                  CusName = a.CusName,
                                  TotalCanImp = a.TotalCanImp,
                                  //Proportion = grp.Average(y => y.Proportion),
                              });
            }
            catch (Exception ex)
            {
               msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DATA_FAIL"));
                msg.Error = true;
            }
            return Json(msg);
        }



        /// <summary>
        /// Import
        /// </summary>
        /// <param name="productCode"></param>
        /// <param name="brandCode"></param>
        /// <param name="dateSearch"></param>
        /// <returns></returns>
        //Lấy ra lượng nhập trong tháng của vùng
        [HttpGet]
        public JsonResult GetImportConsumpWithArea(string productCode, string brandCode, string dateSearch)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var session = HttpContext.GetSessionUser();

                DateTime date = !string.IsNullOrEmpty(dateSearch) ? DateTime.ParseExact(dateSearch, "MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;
                var startDateNow = new DateTime(date.Year, date.Month, 1);
                var startDateNext = new DateTime(date.Year, date.Month, 1);
                var startDatePre = new DateTime(date.Year, date.Month, 1);
                startDateNext = startDateNext.AddMonths(1);
                startDatePre = startDatePre.AddMonths(-1);

                List<VCGroupCustomerCareModel> query = new List<VCGroupCustomerCareModel>();
                if (session.UserType == 10)
                {
                    string[] param1 = new string[] { "@startDateNext", "@startDateNow", "@startDatePre", "@productCode", "@brandCode" };
                    object[] val1 = new object[] { startDateNext, startDateNow, startDatePre, productCode, brandCode };
                    DataTable rs1 = _repositoryService.GetDataTableProcedureSql("P_Get_Import_Consump_Chart_Area_4_Admin", param1, val1);
                    query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs1);
                }
                else
                {
                    if (session.TypeStaff == 10)
                    {
                        string[] param1 = new string[] { "@startDateNext", "@startDateNow", "@startDatePre", "@productCode", "@brandCode", "@listArea" };
                        object[] val1 = new object[] { startDateNext, startDateNow, startDatePre, productCode, brandCode, session.Area };
                        DataTable rs1 = _repositoryService.GetDataTableProcedureSql("P_Get_Import_Consump_Chart_Area_4_Manager", param1, val1);
                        query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs1);
                    }
                    else if (session.TypeStaff == 0)
                    {
                        string[] param1 = new string[] { "@startDateNext", "@startDateNow", "@startDatePre", "@productCode", "@brandCode", "@userName" };
                        object[] val1 = new object[] { startDateNext, startDateNow, startDatePre, productCode, brandCode, session.UserName };
                        DataTable rs1 = _repositoryService.GetDataTableProcedureSql("P_Get_Import_Consump_Chart_Area_4_User", param1, val1);
                        query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs1);
                    }
                }
                msg.Object = (from a in query
                              select new
                              {
                                  Area = a.AreaCode,
                                  AreaName = a.AreaName,
                                  ImportConsump = a.ImportConsump,
                              });
            }
            catch (Exception ex)
            {
                //msg.Title = "Có lỗi khi lấy dữ liệu";
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DATA_FAIL"));
                msg.Error = true;
            }
            return Json(msg);
        }
        //Lấy ra lượng nhập trong tháng của KHÁCH HÀNG THEO VÙNG
        [HttpGet]
        public JsonResult GetImportConsumpWithCustomer(string productCode, string brandCode, string dateSearch, string areaCode)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                //var session = HttpContext.GetSessionUser();
                //var listArea = GetListAreaFunc(session);
                //var rs = GetImportConsumpFunc(session, listArea, productCode, brandCode, dateSearch, areaCode);

                //msg.Object = rs.Select(x => new
                //{
                //    CusCode = x.CusCode,
                //    CusName = x.CusName,
                //    ImportConsump = x.ImportConsump,
                //});
                var session = HttpContext.GetSessionUser();

                DateTime date = !string.IsNullOrEmpty(dateSearch) ? DateTime.ParseExact(dateSearch, "MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;
                var startDateNow = new DateTime(date.Year, date.Month, 1);
                var startDateNext = new DateTime(date.Year, date.Month, 1);
                var startDatePre = new DateTime(date.Year, date.Month, 1);
                startDateNext = startDateNext.AddMonths(1);
                startDatePre = startDatePre.AddMonths(-1);

                List<VCGroupCustomerCareModel> query = new List<VCGroupCustomerCareModel>();
                if (session.UserType == 10)
                {
                    string[] param1 = new string[] { "@startDateNext", "@startDateNow", "@startDatePre", "@productCode", "@brandCode", "@areaCode" };
                    object[] val1 = new object[] { startDateNext, startDateNow, startDatePre, productCode, brandCode, areaCode };
                    DataTable rs1 = _repositoryService.GetDataTableProcedureSql("P_Get_Import_Consump_Chart_Customer_4_Admin", param1, val1);
                    query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs1);
                }
                else
                {
                    if (session.TypeStaff == 10)
                    {
                        string[] param1 = new string[] { "@startDateNext", "@startDateNow", "@startDatePre", "@productCode", "@brandCode", "@areaCode", "@listArea" };
                        object[] val1 = new object[] { startDateNext, startDateNow, startDatePre, productCode, brandCode, areaCode, session.Area };
                        DataTable rs1 = _repositoryService.GetDataTableProcedureSql("P_Get_Import_Consump_Chart_Customer_4_Manager", param1, val1);
                        query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs1);
                    }
                    else if (session.TypeStaff == 0)
                    {
                        string[] param1 = new string[] { "@startDateNext", "@startDateNow", "@startDatePre", "@productCode", "@brandCode", "@areaCode", "@userName" };
                        object[] val1 = new object[] { startDateNext, startDateNow, startDatePre, productCode, brandCode, areaCode, session.UserName };
                        DataTable rs1 = _repositoryService.GetDataTableProcedureSql("P_Get_Import_Consump_Chart_Customer_4_User", param1, val1);
                        query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs1);
                    }
                }
                msg.Object = (from a in query
                              select new
                              {
                                  CusCode = a.CusCode,
                                  CusName = a.CusName,
                                  ImportConsump = a.ImportConsump,
                              });

            }
            catch (Exception ex)
            {
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DATA_FAIL"));
                msg.Error = true;
            }
            return Json(msg);
        }



        /// <summary>
        /// BuyCost
        /// </summary>
        /// <param name="productCode"></param>
        /// <param name="cusCode"></param>
        /// <param name="dateSearch"></param>
        /// <returns></returns>
        //Lấy ra giá nhập trong tháng
        [HttpGet]
        public JsonResult GetBuyCost(string productCode, string cusCode, string dateSearch)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var session = HttpContext.GetSessionUser();

                DateTime date = !string.IsNullOrEmpty(dateSearch) ? DateTime.ParseExact(dateSearch, "MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;
                var startDateNow = new DateTime(date.Year, date.Month, 1);
                var startDateNext = new DateTime(date.Year, date.Month, 1);
                startDateNext = startDateNext.AddMonths(1);

                List<VCGroupCustomerCareModel> query = new List<VCGroupCustomerCareModel>();
                if (session.UserType == 10)
                {
                    string[] param1 = new string[] { "@startDateNext", "@cusCode", "@productCode" };
                    object[] val1 = new object[] { startDateNext, cusCode, productCode };
                    DataTable rs1 = _repositoryService.GetDataTableProcedureSql("P_Get_Price_Newest_Chart_Area_4_Admin", param1, val1);
                    query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs1);
                }
                else
                {
                    if (session.TypeStaff == 10)
                    {
                        string[] param1 = new string[] { "@startDateNext", "@cusCode", "@productCode", "@listArea" };
                        object[] val1 = new object[] { startDateNext, cusCode, productCode, session.Area };
                        DataTable rs1 = _repositoryService.GetDataTableProcedureSql("P_Get_Price_Newest_Chart_Area_4_Manager", param1, val1);
                        query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs1);
                    }
                    else if (session.TypeStaff == 0)
                    {
                        string[] param1 = new string[] { "@startDateNext", "@cusCode", "@productCode", "@userName" };
                        object[] val1 = new object[] { startDateNext, cusCode, productCode, session.UserName };
                        DataTable rs1 = _repositoryService.GetDataTableProcedureSql("P_Get_Price_Newest_Chart_Area_4_User", param1, val1);
                        query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs1);
                    }
                }

                msg.Object = (from a in query
                              select new
                              {
                                  a.BrandName,
                                  a.BuyCost,
                                  a.SaleCost,
                              });

            }
            catch (Exception ex)
            {
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DATA_FAIL"));
                msg.Error = true;
            }
            return Json(msg);
        }


        /// <summary>
        /// Proportion
        /// </summary>
        /// <param name="cusCode"></param>
        /// <param name="areaCode"></param>
        /// <param name="dateSearch"></param>
        /// <returns></returns>
        //Lấy ra tỷ trọng 
        [HttpGet]
        public JsonResult GetProportion(string cusCode, string areaCode, string dateSearch)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var session = HttpContext.GetSessionUser();

                DateTime date = !string.IsNullOrEmpty(dateSearch) ? DateTime.ParseExact(dateSearch, "MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;
                var startDateNow = new DateTime(date.Year, date.Month, 1);
                var startDateNext = new DateTime(date.Year, date.Month, 1);
                startDateNext = startDateNext.AddMonths(1);

                List<VCGroupCustomerCareModel> query = new List<VCGroupCustomerCareModel>();
                if (session.UserType == 10)
                {
                    string[] param1 = new string[] { "@cusCode", "@areaCode", "@startDateNext", "@startDateNow" };
                    object[] val1 = new object[] { cusCode, areaCode, startDateNext, startDateNow };
                    DataTable rs1 = _repositoryService.GetDataTableProcedureSql("P_Get_Consump_Chart_Round_4_Admin", param1, val1);
                    query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs1);
                }
                else
                {
                    if (session.TypeStaff == 10)
                    {
                        string[] param1 = new string[] { "@cusCode", "@areaCode", "@startDateNext", "@startDateNow", "@listArea" };
                        object[] val1 = new object[] { cusCode, areaCode, startDateNext, startDateNow, session.Area };
                        DataTable rs1 = _repositoryService.GetDataTableProcedureSql("P_Get_Consump_Chart_Round_4_Manager", param1, val1);
                        query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs1);
                    }
                    else if (session.TypeStaff == 0)
                    {
                        string[] param1 = new string[] { "@cusCode", "@areaCode", "@startDateNext", "@startDateNow", "@userName" };
                        object[] val1 = new object[] { cusCode, areaCode, startDateNext, startDateNow, session.UserName };
                        DataTable rs1 = _repositoryService.GetDataTableProcedureSql("P_Get_Consump_Chart_Round_4_User", param1, val1);
                        query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs1);
                    }
                }

                msg.Object = (from a in query
                              select new
                              {
                                  a.BrandName,
                                  a.BrandCode,
                                  a.ConsumpMonthly,
                              });

            }
            catch (Exception ex)
            {
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DATA_FAIL"));
                msg.Error = true;
            }
            return Json(msg);
        }
        //Lấy ra tỷ trọng theo  
        [HttpGet]
        public JsonResult GetProportionProductGroup(string cusCode, string areaCode, string dateSearch)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var session = HttpContext.GetSessionUser();

                DateTime date = !string.IsNullOrEmpty(dateSearch) ? DateTime.ParseExact(dateSearch, "MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;
                var startDateNow = new DateTime(date.Year, date.Month, 1);
                var startDateNext = new DateTime(date.Year, date.Month, 1);
                startDateNext = startDateNext.AddMonths(1);

                List<VCGroupCustomerCareModel> query = new List<VCGroupCustomerCareModel>();
                if (session.UserType == 10)
                {
                    string[] param1 = new string[] { "@cusCode", "@areaCode", "@startDateNext", "@startDateNow" };
                    object[] val1 = new object[] { cusCode, areaCode, startDateNext, startDateNow };
                    DataTable rs1 = _repositoryService.GetDataTableProcedureSql("P_Get_Consump_Type_Chart_Round_4_Admin", param1, val1);
                    query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs1);
                }
                else
                {
                    if (session.TypeStaff == 10)
                    {
                        string[] param1 = new string[] { "@cusCode", "@areaCode", "@startDateNext", "@startDateNow", "@listArea" };
                        object[] val1 = new object[] { cusCode, areaCode, startDateNext, startDateNow, session.Area };
                        DataTable rs1 = _repositoryService.GetDataTableProcedureSql("P_Get_Consump_Type_Chart_Round_4_Manager", param1, val1);
                        query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs1);
                    }
                    else if (session.TypeStaff == 0)
                    {
                        string[] param1 = new string[] { "@cusCode", "@areaCode", "@startDateNext", "@startDateNow", "@userName" };
                        object[] val1 = new object[] { cusCode, areaCode, startDateNext, startDateNow, session.UserName };
                        DataTable rs1 = _repositoryService.GetDataTableProcedureSql("P_Get_Consump_Type_Chart_Round_4_User", param1, val1);
                        query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs1);
                    }
                }

                msg.Object = (from a in query
                              select new
                              {
                                  a.ProductGroup,
                                  a.ProductGroupName,
                                  a.ConsumpMonthly,
                              });

            }
            catch (Exception ex)
            {
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DATA_FAIL"));
                msg.Error = true;
            }
            return Json(msg);
        }
    }
    public class VCWorkProgress
    {
        public string WpCode { get; set; }
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
        public IQueryable<VCDetailProgres> ListWork { get; set; }
    }
    public class VCDetailProgres
    {
        public DateTime CreatedTime { get; set; }
        public string CurrentStatus { get; set; }
    }
    public class VCChartProgress
    {
        public string Date { get; set; }
        public double Percent { get; set; }
        public string Worked { get; set; }
    }
}