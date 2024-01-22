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

    public class VCChartLastMonthController : BaseController
    {
        private readonly UserManager<AspNetUser> _userManager;
        private readonly RoleManager<AspNetRole> _roleManager;
        private readonly EIMDBContext _context;
        private readonly AppSettings _appSettings;
        private readonly IRepositoryService _repositoryService;
        public VCChartLastMonthController(IOptions<AppSettings> appSettings, EIMDBContext context, UserManager<AspNetUser> userManager, RoleManager<AspNetRole> roleManager, EIMDBContext swContext,
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
        //Lấy list Đại lý/Cửa hàng
        [HttpPost]
        public object GetListCustomer()
        {
            var session = HttpContext.GetSessionUser();
            var rs = GetListCustomerFunc(session).ToList();
            return rs;
        }
        //Lấy list Chủng loại
        [HttpPost]
        public object GetListProduct()
        {
            var list = _context.MaterialProducts.Where(x => !x.IsDeleted).Select(x => new { x.ProductCode, x.ProductName }).AsNoTracking().ToList();
            return list;
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
        /// Consump
        /// </summary>
        /// <param name="productCode"></param>
        /// <param name="brandCode"></param>
        /// <param name="dateSearch"></param>
        /// <returns></returns>
        //Lấy ra tổng sản lượng tháng của vùng (Dữ liệu nhập cuối tháng)
        [HttpGet]
        public JsonResult GetLastConsumpWithArea(string productCode, string brandCode, string dateSearch)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var session = HttpContext.GetSessionUser();
                var date = !string.IsNullOrEmpty(dateSearch) ? DateTime.ParseExact(dateSearch, "MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;
                var yearMonth = date.ToString("yyyy") + date.ToString("MM");

                var query = new List<VCGroupCustomerCareModel>();
                if (session.UserType == 10)
                {
                    string[] param1 = new string[] { "@yearMonth", "@brandCode", "@productCode"};
                    object[] val1 = new object[] { yearMonth, brandCode, productCode};
                    DataTable rs1 = _repositoryService.GetDataTableProcedureSql("P_Get_Last_Consump_Chart_Area_4_Admin", param1, val1);
                    query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs1);
                }
                else
                {
                    if (session.TypeStaff == 10)
                    {
                        string[] param1 = new string[] { "@yearMonth", "@brandCode", "@productCode","@listArea" };
                        object[] val1 = new object[] { yearMonth, brandCode, productCode, session.Area };
                        DataTable rs1 = _repositoryService.GetDataTableProcedureSql("P_Get_Last_Consump_Chart_Area_4_Manager", param1, val1);
                        query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs1);
                    }
                    else if (session.TypeStaff == 0)
                    {
                        string[] param1 = new string[] { "@yearMonth", "@brandCode", "@productCode", "@createBy" };
                        object[] val1 = new object[] { yearMonth, brandCode, productCode, session.UserName };
                        DataTable rs1 = _repositoryService.GetDataTableProcedureSql("P_Get_Last_Consump_Chart_Area_4_User", param1, val1);
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
                msg.Title = "Có lỗi khi lấy dữ liệu";
                msg.Error = true;
            }
            return Json(msg);
        }
        //Lấy ra tổng sản lượng tháng  (Dữ liệu nhập cuối tháng)
        [HttpGet]
        public JsonResult GetLastConsumpWithCustomer(string productCode, string brandCode,string dateSearch ,string areaCode)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var session = HttpContext.GetSessionUser();
                var date = !string.IsNullOrEmpty(dateSearch) ? DateTime.ParseExact(dateSearch, "MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;
                var yearMonth = date.ToString("yyyy") + date.ToString("MM");

                var query = new List<VCGroupCustomerCareModel>();
                if (session.UserType == 10)
                {
                    string[] param1 = new string[] { "@yearMonth", "@brandCode", "@productCode", "@areaCode" };
                    object[] val1 = new object[] { yearMonth, brandCode, productCode , areaCode };
                    DataTable rs1 = _repositoryService.GetDataTableProcedureSql("P_Get_Last_Consump_Chart_Customer_4_Admin", param1, val1);
                    query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs1);
                }
                else
                {
                    if (session.TypeStaff == 10)
                    {
                        string[] param1 = new string[] { "@yearMonth", "@brandCode", "@productCode", "@areaCode", "@listArea" };
                        object[] val1 = new object[] { yearMonth, brandCode, productCode, areaCode, session.Area };
                        DataTable rs1 = _repositoryService.GetDataTableProcedureSql("P_Get_Last_Consump_Chart_Customer_4_Manager", param1, val1);
                        query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs1);
                    }
                    else if (session.TypeStaff == 0)
                    {
                        string[] param1 = new string[] { "@yearMonth", "@brandCode", "@productCode", "@areaCode", "@createBy" };
                        object[] val1 = new object[] { yearMonth, brandCode, productCode, areaCode, session.UserName };
                        DataTable rs1 = _repositoryService.GetDataTableProcedureSql("P_Get_Last_Consump_Chart_Customer_4_User", param1, val1);
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
                msg.Title = "Có lỗi khi lấy dữ liệu";
                msg.Error = true;
            }
            return Json(msg);
        }


        /// <summary>
        /// Proportion
        /// </summary>
        /// <param name="areaCode"></param>
        /// <param name="cusCode"></param>
        /// <param name="dateSearch"></param>
        /// <returns></returns>
        //Lấy ra tỷ trọng trong tháng của vùng (Dữ liệu nhập cuối tháng)
        [HttpGet]
        public JsonResult GetLastProportion(string areaCode, string cusCode, string dateSearch)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var session = HttpContext.GetSessionUser();
                var date = !string.IsNullOrEmpty(dateSearch) ? DateTime.ParseExact(dateSearch, "MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;
                var yearMonth = date.ToString("yyyy") + date.ToString("MM");

                var query = new List<VCGroupCustomerCareModel>();
                if (session.UserType == 10)
                {
                    string[] param1 = new string[] { "@yearMonth", "@areaCode", "@cusCode" };
                    object[] val1 = new object[] { yearMonth, areaCode, cusCode };
                    DataTable rs1 = _repositoryService.GetDataTableProcedureSql("P_Get_Last_Consump_Chart_Round_4_Admin", param1, val1);
                    query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs1);
                }
                else
                {
                    if (session.TypeStaff == 10)
                    {
                        string[] param1 = new string[] { "@yearMonth", "@areaCode", "@cusCode", "@listArea" };
                        object[] val1 = new object[] { yearMonth, areaCode, cusCode, session.Area };
                        DataTable rs1 = _repositoryService.GetDataTableProcedureSql("P_Get_Last_Consump_Chart_Round_4_Manager", param1, val1);
                        query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs1);
                    }
                    else if (session.TypeStaff == 0)
                    {
                        string[] param1 = new string[] { "@yearMonth", "@areaCode", "@cusCode", "@createBy" };
                        object[] val1 = new object[] { yearMonth, areaCode, cusCode, session.UserName };
                        DataTable rs1 = _repositoryService.GetDataTableProcedureSql("P_Get_Last_Consump_Chart_Round_4_User", param1, val1);
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
                msg.Title = "Có lỗi khi lấy dữ liệu";
                msg.Error = true;
            }
            return Json(msg);
        }



        /// <summary>
        /// ProportionGroup
        /// </summary>
        /// <param name="areaCode"></param>
        /// <param name="cusCode"></param>
        /// <param name="dateSearch"></param>
        /// <returns></returns>
        //Lấy ra tỷ trọng trong tháng của vùng (Dữ liệu nhập cuối tháng)
        [HttpGet]
        public JsonResult GetLastProportionGroup(string areaCode, string cusCode, string dateSearch)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var session = HttpContext.GetSessionUser();
                var date = !string.IsNullOrEmpty(dateSearch) ? DateTime.ParseExact(dateSearch, "MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;
                var yearMonth = date.ToString("yyyy") + date.ToString("MM");

                var query = new List<VCGroupCustomerCareModel>();
                if (session.UserType == 10)
                {
                    string[] param1 = new string[] { "@yearMonth", "@areaCode", "@cusCode" };
                    object[] val1 = new object[] { yearMonth, areaCode, cusCode };
                    DataTable rs1 = _repositoryService.GetDataTableProcedureSql("P_Get_Last_Consump_Type_Chart_Round_4_Admin", param1, val1);
                    query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs1);
                }
                else
                {
                    if (session.TypeStaff == 10)
                    {
                        string[] param1 = new string[] { "@yearMonth", "@areaCode", "@cusCode", "@listArea" };
                        object[] val1 = new object[] { yearMonth, areaCode, cusCode, session.Area };
                        DataTable rs1 = _repositoryService.GetDataTableProcedureSql("P_Get_Last_Consump_Type_Chart_Round_4_Manager", param1, val1);
                        query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs1);
                    }
                    else if (session.TypeStaff == 0)
                    {
                        string[] param1 = new string[] { "@yearMonth", "@areaCode", "@cusCode", "@createBy" };
                        object[] val1 = new object[] { yearMonth, areaCode, cusCode, session.UserName };
                        DataTable rs1 = _repositoryService.GetDataTableProcedureSql("P_Get_Last_Consump_Type_Chart_Round_4_User", param1, val1);
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
                msg.Title = "Có lỗi khi lấy dữ liệu";
                msg.Error = true;
            }
            return Json(msg);
        }
    }
}