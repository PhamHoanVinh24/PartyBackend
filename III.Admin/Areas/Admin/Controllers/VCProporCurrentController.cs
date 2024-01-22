using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Logging;
using System.Globalization;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Identity;
using Syncfusion.XlsIO;
using Syncfusion.Drawing;
using System.IO;
using III.Admin.Controllers;
using ESEIM;
using System.Data;

namespace III.Admin.Controllers
{
    [Area("Admin")]

    public class VCProporCurrentController : BaseController
    {
        private readonly UserManager<AspNetUser> _userManager;
        private readonly RoleManager<AspNetRole> _roleManager;
        private readonly EIMDBContext _context;
        private readonly AppSettings _appSettings;
        private readonly IRepositoryService _repositoryService;

        public class JTableVCProporCurrentModelCustom : JTableModel
        {
            public string CustomerName { get; set; }
            public string Area { get; set; }
            public string Staff { get; set; }
            public string StaffCode { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string DateSearch { get; set; }

        }
        public class VCProporCurrentExportModel
        {
            public int No { get; set; }
            public string CustomerName { get; set; }
            public string AreaName { get; set; }
            public string Proportion { get; set; }
            public string ProportionCal { get; set; }
            //public string TotalCanImp { get; set; }
            //public string Staff { get; set; }
            //public string CreatedTime { get; set; }
            //public string Note { get; set; }
        }
        public VCProporCurrentController(IOptions<AppSettings> appSettings, EIMDBContext context, UserManager<AspNetUser> userManager, RoleManager<AspNetRole> roleManager,
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


        public object JTable([FromBody]JTableVCProporCurrentModelCustom jTablePara)
        {
            var count = 0;
            var intBeginFor = 1;
            try
            {
                var session = HttpContext.GetSessionUser();
                DateTime date = !string.IsNullOrEmpty(jTablePara.DateSearch) ? DateTime.ParseExact(jTablePara.DateSearch, "MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;
                var startDateNow = new DateTime(date.Year, date.Month, 1);
                var startDateNext = new DateTime(date.Year, date.Month, 1);
                startDateNext = startDateNext.AddMonths(1);

                intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;

                var query = new List<VCGroupCustomerCareModel>();
                var querySum = new List<SumReport>();

                if (session.UserType == 10)
                {
                    string[] param = new string[] { "@cusCode", "@areaCode", "@startDateNext", "@startDateNow", "@startRecord", "@endRecord" };
                    object[] val = new object[] { jTablePara.CustomerName, jTablePara.Area, startDateNext, startDateNow, intBeginFor + 1, intBeginFor + jTablePara.Length };
                    DataTable rs = _repositoryService.GetDataTableProcedureSql("P_Get_Proportion_All_Search_Paging_4_Admin", param, val);
                    query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs);


                    string[] param1 = new string[] { "@cusCode", "@areaCode", "@startDateNext", "@startDateNow"};
                    object[] val1 = new object[] { jTablePara.CustomerName, jTablePara.Area, startDateNext, startDateNow };
                    DataTable rs1 = _repositoryService.GetDataTableProcedureSql("P_Get_Proportion_All_Search_Sum_4_Admin", param1, val1);
                    querySum = CommonUtil.ConvertDataTable<SumReport>(rs1);
                }
                else
                {
                    if (session.TypeStaff == 10)
                    {
                        string[] param = new string[] { "@cusCode", "@areaCode", "@startDateNext", "@startDateNow", "@listArea", "@startRecord", "@endRecord" };
                        object[] val = new object[] { jTablePara.CustomerName, jTablePara.Area, startDateNext, startDateNow, session.Area, intBeginFor + 1, intBeginFor + jTablePara.Length };
                        DataTable rs = _repositoryService.GetDataTableProcedureSql("P_Get_Proportion_All_Search_Paging_4_Manager", param, val);
                        query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs);


                        string[] param1 = new string[] { "@cusCode", "@areaCode", "@startDateNext", "@startDateNow", "@listArea" };
                        object[] val1 = new object[] { jTablePara.CustomerName, jTablePara.Area, startDateNext, startDateNow, session.Area };
                        DataTable rs1 = _repositoryService.GetDataTableProcedureSql("P_Get_Proportion_All_Search_Sum_4_Manager", param1, val1);
                        querySum = CommonUtil.ConvertDataTable<SumReport>(rs1);
                    }
                    else if (session.TypeStaff == 0)
                    {
                        string[] param = new string[] { "@cusCode", "@areaCode", "@startDateNext", "@startDateNow", "@userName", "@startRecord", "@endRecord" };
                        object[] val = new object[] { jTablePara.CustomerName, jTablePara.Area, startDateNext, startDateNow, session.UserName, intBeginFor + 1, intBeginFor + jTablePara.Length };
                        DataTable rs = _repositoryService.GetDataTableProcedureSql("P_Get_Proportion_All_Search_Paging_4_User", param, val);
                        query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs);


                        string[] param1 = new string[] { "@cusCode", "@areaCode", "@startDateNext", "@startDateNow",  "@userName" };
                        object[] val1 = new object[] { jTablePara.CustomerName, jTablePara.Area, startDateNext, startDateNow, session.UserName };
                        DataTable rs1 = _repositoryService.GetDataTableProcedureSql("P_Get_Proportion_All_Search_Sum_4_User", param1, val1);
                        querySum = CommonUtil.ConvertDataTable<SumReport>(rs1);
                    }
                }
                count = querySum.Select(x => x.Count).FirstOrDefault();
                var jdata = JTableHelper.JObjectTable(query, jTablePara.Draw, count, "Id", "CusName", "AreaCode", "AreaName", "Proportion", "CreatedTime", "ProportionCal");
                return Json(jdata);
            }
            catch (Exception ex)
            {
                return Json("");
            }
        }

        


        [NonAction]
        public IEnumerable<VCGroupCustomerCareModel> FuncJTable(string cusName, string areaCode, string staff, string fromDate, string toDate, string dateSearch)
        {
            //DateTime? fromDate = !string.IsNullOrEmpty(FromDate) ? DateTime.ParseExact(FromDate, "MM/dd/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            //DateTime? toDate = !string.IsNullOrEmpty(ToDate) ? DateTime.ParseExact(ToDate, "MM/dd/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            DateTime date = !string.IsNullOrEmpty(dateSearch) ? DateTime.ParseExact(dateSearch, "MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;

            var session = HttpContext.GetSessionUser();
            var listArea = GetListAreaFunc(session);

            //Lấy ra list bản ghi hoàn thành MỚI NHẤT (TRONG THÁNG HIỆN TẠI HOẶC NHẬP VÀO) của các cửa hàng => Lấy được trữ lượng trống, tỷ lệ nhập tay mới nhất, SettingRouteCode mới nhất (mỗi khách hàng là 1 BẢN GHI)
            //Join với bảng Customer_Care & group theo khách hàng với Branch = 'BUTSON' => Lấy được tổng tồn kho tất cả các sản phẩm Bút Sơn mới nhất của cửa hàng
            var listSettingRoutesOfCusNewestInMonthFunc = GetListSettingRoutesOfCusNewestInMonthFunc(session, date);

            var query = (from c in listArea
                         join d in DbContext.Customerss.Where(x => x.IsDeleted == false).AsNoTracking()
                                           .Select(x => new { x.CusCode, x.Area, x.CusName }) on c.Code equals d.Area
                         join e in listSettingRoutesOfCusNewestInMonthFunc
                                           on d.CusCode equals e.Node
                         join b in _context.Users
                                           .AsNoTracking()
                                           .Select(x => new { x.UserName, x.GivenName, x.Area }) on e.CreatedBy equals b.UserName
                         group new { c, d, e, b } by new { d.CusCode }
                         into grp
                         select new VCGroupCustomerCareModel
                         {
                             AreaName = grp.FirstOrDefault().c.Name,
                             AreaCode = grp.FirstOrDefault().c.Code,
                             CusCode = grp.Key.CusCode,
                             CusName = grp.FirstOrDefault().d.CusName,

                             Id = grp.FirstOrDefault().e.Id,
                             TotalCanImp = grp.FirstOrDefault().e.TotalCanImp,
                             Proportion = grp.FirstOrDefault().e.Proportion,
                             TimeWork = grp.FirstOrDefault().e.TimeWork,
                             Note = grp.FirstOrDefault().e.Note,
                             CreatedBy = grp.FirstOrDefault().e.CreatedBy,
                             CreatedTime = grp.FirstOrDefault().e.CreatedTime,

                             Staff = grp.FirstOrDefault().b.GivenName,
                         });

            if (query.Any())
            {
                var listCustomerCareInMonthFunc = GetCustomerCareInMonthFunc(session, dateSearch);

                var query1 = (from c in listArea
                              join d in DbContext.Customerss.Where(x => x.IsDeleted == false).AsNoTracking()
                                                .Select(x => new { x.CusCode, x.Area, x.CusName }) on c.Code equals d.Area
                              join e in listCustomerCareInMonthFunc.Where(x => x.BrandCode == "BUTSON")
                                                on d.CusCode equals e.CusCode
                              group new { c, d, e } by new { d.CusCode }
                              into grp
                              //let consumpMonthlyTotal = grp.Sum(y => y.e.ConsumpMonthly)
                              //let consumpMonthlyButSon = grp.Where(x => x.e.BrandCode == "BUTSON").Sum(y => y.e.ConsumpMonthly)
                              select new VCGroupCustomerCareModel
                              {
                                  CusCode = grp.Key.CusCode,
                                  ConsumpMonthly = grp.Sum(y => y.e.ConsumpMonthly)
                                  //ProportionCal = (consumpMonthlyTotal != null && consumpMonthlyTotal != 0) ? consumpMonthlyButSon * 100 / consumpMonthlyTotal : null,
                              });

                var query2 = (from c in listArea
                              join d in DbContext.Customerss.Where(x => x.IsDeleted == false).AsNoTracking()
                                                .Select(x => new { x.CusCode, x.Area, x.CusName }) on c.Code equals d.Area
                              join e in listCustomerCareInMonthFunc
                                                on d.CusCode equals e.CusCode
                              group new { c, d, e } by new { d.CusCode }
                              into grp
                              //let consumpMonthlyTotal = grp.Sum(y => y.e.ConsumpMonthly)
                              //let consumpMonthlyButSon = grp.Where(x => x.e.BrandCode == "BUTSON").Sum(y => y.e.ConsumpMonthly)
                              select new VCGroupCustomerCareModel
                              {
                                  CusCode = grp.Key.CusCode,
                                  ConsumpMonthly = grp.Sum(y => y.e.ConsumpMonthly),
                              });

                var res = (from a in query
                           join b1 in query1 on a.CusCode equals b1.CusCode into b2
                           from b in b2.DefaultIfEmpty()
                           join c1 in query2 on a.CusCode equals c1.CusCode into c2
                           from c in c2.DefaultIfEmpty()
                           select new VCGroupCustomerCareModel
                           {
                               Id = a.Id,
                               CusCode = a.CusCode,
                               CusName = a.CusName,
                               AreaCode = a.AreaCode,
                               AreaName = a.AreaName,
                               Proportion = a.Proportion,
                               ProportionCal = c != null && c.ConsumpMonthly != null && c.ConsumpMonthly != 0 ? (b != null && b.ConsumpMonthly != null ? b.ConsumpMonthly * 100 / c.ConsumpMonthly : 0) : null,
                               TotalCanImp = a.TotalCanImp,
                               Staff = a.Staff,
                               CreatedBy = a.CreatedBy,
                               CreatedTime = a.CreatedTime,
                               Note = a.Note,
                           })
                            .Where(x =>
                            (string.IsNullOrEmpty(cusName) || (!string.IsNullOrEmpty(x.CusCode) && x.CusCode == cusName))
                            && (string.IsNullOrEmpty(areaCode) || (!string.IsNullOrEmpty(x.AreaCode) && x.AreaCode == areaCode))
                            && (string.IsNullOrEmpty(staff) || (!string.IsNullOrEmpty(x.CreatedBy) && x.CreatedBy == staff)))
                           ;
                return res;
            }
            else
            {
                return query.Where(x =>
                            (string.IsNullOrEmpty(cusName) || (!string.IsNullOrEmpty(x.CusCode) && x.CusCode == cusName))
                            && (string.IsNullOrEmpty(areaCode) || (!string.IsNullOrEmpty(x.AreaCode) && x.AreaCode == areaCode))
                            && (string.IsNullOrEmpty(staff) || (!string.IsNullOrEmpty(x.CreatedBy) && x.CreatedBy == staff)))
                           ;
            }

        }

        [HttpPost]
        public object GetListArea()
        {
            var session = HttpContext.GetSessionUser();
            return GetListAreaFunc(session);
        }
        //Lấy list Đại lý/Cửa hàng
        [HttpPost]
        public JsonResult GetListCustomer()
        {
            var session = HttpContext.GetSessionUser();
            var rs = GetListCustomerFunc(session).ToList();
            return Json(rs);
        }

        //Export Excel
        [HttpGet]
        public ActionResult ExportExcel(string page, string row, string customerName, string areaExport, string StaffCode, string fromDate, string toDate, string dateSearch, string orderBy)
        {
            int pageInt = int.Parse(page);
            int length = int.Parse(row);
            var intBeginFor = 1;
            var session = HttpContext.GetSessionUser();
            intBeginFor = (pageInt - 1) * length;
            var date = !string.IsNullOrEmpty(dateSearch) ? DateTime.ParseExact(dateSearch, "MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;
            var startDateNow = new DateTime(date.Year, date.Month, 1);
            var startDateNext = new DateTime(date.Year, date.Month, 1);
            startDateNext = startDateNext.AddMonths(1);

            var query = new List<VCGroupCustomerCareModel>();

            if (session.UserType == 10)
            {
                string[] param = new string[] { "@cusCode", "@areaCode", "@startDateNext", "@startDateNow", "@startRecord", "@endRecord", "@allData" };
                object[] val = new object[] { customerName, areaExport, startDateNext, startDateNow, intBeginFor + 1, intBeginFor + length, 0 };
                DataTable rs = _repositoryService.GetDataTableProcedureSql("P_Get_Proportion_All_Search_Export_4_Admin", param, val);
                query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs);
            }
            else
            {
                if (session.TypeStaff == 10)
                {
                    string[] param = new string[] { "@cusCode", "@areaCode", "@startDateNext", "@startDateNow", "@listArea", "@startRecord", "@endRecord", "@allData" };
                    object[] val = new object[] { customerName, areaExport, startDateNext, startDateNow, session.Area, intBeginFor + 1, intBeginFor + length, 0 };

                    DataTable rs = _repositoryService.GetDataTableProcedureSql("P_Get_Proportion_All_Search_Export_4_Manager", param, val);
                    query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs);
                }
                else if (session.TypeStaff == 0)
                {
                    string[] param = new string[] { "@cusCode", "@areaCode", "@startDateNext", "@startDateNow", "@userName", "@startRecord", "@endRecord", "@allData" };
                    object[] val = new object[] { customerName, areaExport, startDateNext, startDateNow, session.UserName, intBeginFor + 1, intBeginFor + length, 0 };
                    DataTable rs = _repositoryService.GetDataTableProcedureSql("P_Get_Proportion_All_Search_Export_4_User", param, val);
                    query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs);
                }
            }
            var listExport = new List<VCProporCurrentExportModel>();
            var no = 1;
            foreach (var item in query)
            {
                var itemExport = new VCProporCurrentExportModel();
                itemExport.No = no;
                itemExport.CustomerName = item.CusName;
                itemExport.AreaName = item.AreaName;
                //itemExport.Staff = item.Staff;
                //itemExport.CreatedTime = item.CreatedTime != null ? item.CreatedTime.Value.ToString("dd/MM/yyyy HH:mm") : "";
                itemExport.Proportion = item.Proportion.ToString();
                itemExport.ProportionCal = item.ProportionCal != null ? item.ProportionCal.Value.ToString("0.#") : "";
                //itemExport.TotalCanImp = item.TotalCanImp.ToString();
                //itemExport.Note = item.Note;

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
            application.DefaultVersion = ExcelVersion.Excel2010;

            IWorkbook workbook = application.Workbooks.Create(1);
            workbook.Version = ExcelVersion.Excel97to2003;
            IWorksheet sheetRequest = workbook.Worksheets.Create("TyTrongButSon");
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


            sheetRequest.Range["A1:E1"].Merge(true);

            sheetRequest.Range["A1"].Text = "TỶ TRỌNG BÚT SƠN";
            sheetRequest.Range["A1"].CellStyle.Font.FontName = "Calibri";
            sheetRequest.Range["A1"].CellStyle.Font.Bold = true;
            sheetRequest.Range["A1"].CellStyle.Font.Size = 24;
            sheetRequest.Range["A1"].CellStyle.Font.RGBColor = Color.FromArgb(0, 0, 176, 240);
            sheetRequest.Range["A1"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.ImportData(listExport, 2, 1, true);

            sheetRequest["A2"].Text = "TT";
            sheetRequest["B2"].Text = "NPP/ĐL/CH";
            sheetRequest["C2"].Text = "KHU VỰC";
            sheetRequest["D2"].Text = "TỶ TRỌNG BÚT SƠN NHẬP TAY (%)";
            sheetRequest["E2"].Text = "TỶ TRỌNG BÚT SƠN TÍNH TOÁN (%)";
            //sheetRequest["F2"].Text = "TRỮ LƯỢNG TRỐNG (T)";
            //sheetRequest["G2"].Text = "NHÂN VIÊN";
            //sheetRequest["H2"].Text = "THỜI GIAN";
            //sheetRequest["I2"].Text = "GHI CHÚ";


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
            sheetRequest["A2:E2"].CellStyle = tableHeader;
            sheetRequest.Range["A2:E2"].RowHeight = 20;
            sheetRequest.UsedRange.AutofitColumns();

            string ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            var fileName = "ExportTyTrongButSon" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".xls";
            MemoryStream ms = new MemoryStream();
            workbook.SaveAs(ms);
            workbook.Close();
            excelEngine.Dispose();
            ms.Position = 0;
            return File(ms, ContentType, fileName);
        }
        [HttpPost]
        public JsonResult GetAllStaff()
        {
            var list = (from a in _context.Users
                        where a.UserName.ToLower() != "admin" && a.Active == true
                        select new
                        {
                            a.Id,
                            a.UserName,
                            a.GivenName
                        }).ToList();
            return Json(list);
        }


        //[HttpGet]
        //public object GetItem(int id)
        //{
        //    try
        //    {

        //        var user = _context.Maintain_material_detailss.Single(x => x.Id == id);

        //        var temp = new
        //        {
        //            user.Id,
        //            user.ProductCode,
        //            user.ProductName,
        //            user.Create_time,
        //            user.Description,
        //            user.Image,
        //            user.Quantity,
        //            user.Brand,
        //            user.Status,
        //            user.BarCode,
        //            user.Price,
        //            user.Update_time

        //        };

        //        return Json(temp);
        //    }
        //    catch (Exception ex)
        //    {
        //        return Json(new JMessage() { Error = true, Title = String.Format(CommonUtil.ResourceValue("MSG_LOAD_FAIL"), CommonUtil.ResourceValue("USER_USERNAME").ToLower()), Object = ex });
        //    }
        //}


        //[HttpPost]
        //public JsonResult Update([FromBody]Maintain_material_details obj)
        //{
        //    var company_code = HttpContext.GetSessionUser()?.CompanyCode;
        //    var msg = new JMessage() { Error = false };
        //    try
        //    {

        //        Maintain_material_details obj2 = _context.Maintain_material_detailss.FirstOrDefault(x => x.Id == obj.Id);
        //        if (obj2 != null)
        //        {
        //            obj2.ProductCode = obj.ProductCode;
        //            obj2.ProductName = obj.ProductName;
        //            obj2.Status = obj.Status;
        //            obj2.BarCode = obj.BarCode;
        //            obj2.Brand = obj.Brand;
        //            obj2.Price = obj.Price;
        //            obj2.Quantity = obj.Quantity;
        //            obj2.Description = obj.Description;
        //            obj2.Company_code = company_code;
        //            obj2.Update_time = DateTime.Now;

        //            _context.Maintain_material_detailss.Update(obj2);
        //            _context.Entry(obj2).State = EntityState.Modified;
        //        }

        //        var a = _context.SaveChanges();
        //        msg.Title = "Sửa khoản mục thành công";
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Title = "Có lỗi khi sửa khoản mục";
        //    }
        //    return Json(msg);
        //}

        //[HttpPost]
        //public object DeleteChecked([FromBody]List<int> listIdI)
        //{
        //    var msg = new JMessage() { Error = false };
        //    try
        //    {



        //        foreach (var id in listIdI)
        //        {
        //            Maintain_material_details obj = _context.Maintain_material_detailss.FirstOrDefault(x => x.Id == id);
        //            if (obj != null)
        //            {
        //                obj.Flag = 1;
        //                _context.Maintain_material_detailss.Update(obj);
        //                _context.SaveChanges();
        //            }
        //        }
        //        msg.Title = "Xóa sản phẩm thành công";
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Object = ex;
        //        msg.Title = String.Format(CommonUtil.ResourceValue("MSG_DELETE_LIST_FAIL"), CommonUtil.ResourceValue("RESOURCE"));
        //        //_logger.LogError(LoggingEvents.LogDb, "Delete list Resource fail");
        //        //_actionLog.InsertActionLogDeleteItem("AdResource", "An error occurred while Delete list Resource", null, null, "Error");

        //    }
        //    return Json(msg);
        //}

        //[HttpPost]
        //public object LockProduct([FromBody]int id)
        //{
        //    var msg = new JMessage() { Error = false };
        //    try
        //    {


        //        Maintain_material_details obj = _context.Maintain_material_detailss.FirstOrDefault(x => x.Id == id);
        //        if (obj != null)
        //        {
        //            obj.Status = (obj.Status == 1 ? 2 : 1);

        //            _context.Maintain_material_detailss.Update(obj);
        //            _context.SaveChanges();
        //        }

        //        msg.Title = "Thay đổi trạng thái sản phẩm thành công";
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Object = ex;
        //        msg.Title = String.Format(CommonUtil.ResourceValue("MSG_DELETE_LIST_FAIL"), CommonUtil.ResourceValue("RESOURCE"));
        //        //_logger.LogError(LoggingEvents.LogDb, "Delete list Resource fail");
        //        //_actionLog.InsertActionLogDeleteItem("AdResource", "An error occurred while Delete list Resource", null, null, "Error");

        //    }
        //    return Json(msg);
        //}


        //[HttpPost]
        //public JsonResult Insert([FromBody]Maintain_material_details obj)
        //{
        //    var msg = new JMessage() { Error = false };
        //    var company_code = HttpContext.GetSessionUser()?.CompanyCode;
        //    try
        //    {
        //        Maintain_material_details rm = new Maintain_material_details
        //        {
        //            ProductCode = obj.ProductName,
        //            ProductName = obj.ProductName,
        //            Status = obj.Status,
        //            BarCode = obj.BarCode,
        //            Brand = obj.Brand,
        //            Price = obj.Price,
        //            Quantity = obj.Quantity,
        //            Description = obj.Description,
        //            Company_code = company_code,
        //            Create_time = DateTime.Now

        //        };
        //        _context.Maintain_material_detailss.Add(rm);
        //        var a = _context.SaveChanges();
        //        msg.Title = "Thêm sản phẩm thành công";
        //        msg.Object = obj;
        //        msg.ID = 1;

        //    }
        //    catch (Exception ex)
        //    {
        //        msg.ID = 0;
        //        msg.Error = true;
        //        msg.Object = ex;
        //        msg.Title = "Có lỗi khi thêm khoản mục";
        //    }
        //    return Json(msg);
        //}
        ////Hàm cũ
        //[NonAction]
        //public IEnumerable<VCGroupCustomerCareModel> FuncJTable(string cusName, string areaCode, string staff, string fromDate, string toDate, string dateSearch)
        //{
        //    //DateTime? fromDate = !string.IsNullOrEmpty(FromDate) ? DateTime.ParseExact(FromDate, "MM/dd/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
        //    //DateTime? toDate = !string.IsNullOrEmpty(ToDate) ? DateTime.ParseExact(ToDate, "MM/dd/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
        //    DateTime date = !string.IsNullOrEmpty(dateSearch) ? DateTime.ParseExact(dateSearch, "MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;

        //    var listArea = GetListAreaFunc();

        //    //Lấy ra list bản ghi hoàn thành MỚI NHẤT (TRONG THÁNG HIỆN TẠI HOẶC NHẬP VÀO) của các cửa hàng => Lấy được trữ lượng trống, tỷ lệ nhập tay mới nhất, SettingRouteCode mới nhất (mỗi khách hàng là 1 BẢN GHI)
        //    //Join với bảng Customer_Care & group theo khách hàng với Branch = 'BUTSON' => Lấy được tổng tồn kho tất cả các sản phẩm Bút Sơn mới nhất của cửa hàng
        //    var listSettingRoutesOfCusNewestInMonthFunc = GetListSettingRoutesOfCusNewestInMonthFunc(date);

        //    var query = (from c in listArea
        //                 join d in DbContext.Customers.Where(x => x.IsDeleted == false).AsNoTracking()
        //                                   .Select(x => new { x.CusCode, x.Area, x.CusName }) on c.Code equals d.Area
        //                 join e in listSettingRoutesOfCusNewestInMonthFunc
        //                                   on d.CusCode equals e.Node
        //                 join b1 in _context.Users
        //                                   .AsNoTracking()
        //                                   .Select(x => new { x.UserName, x.GivenName, x.Area }) on e.CreatedBy equals b1.UserName into b2
        //                 from b in b2.DefaultIfEmpty()
        //                 group new { c, d, e, b } by new { d.CusCode }
        //                 into grp
        //                 select new VCGroupCustomerCareModel
        //                 {
        //                     AreaName = grp.FirstOrDefault().c.Name,
        //                     AreaCode = grp.FirstOrDefault().c.Code,
        //                     CusCode = grp.Key.CusCode,
        //                     CusName = grp.FirstOrDefault().d.CusName,

        //                     Id = grp.FirstOrDefault().e.Id,
        //                     TotalCanImp = grp.FirstOrDefault().e.TotalCanImp,
        //                     Proportion = grp.FirstOrDefault().e.Proportion,
        //                     TimeWork = grp.FirstOrDefault().e.TimeWork,
        //                     Note = grp.FirstOrDefault().e.Note,
        //                     CreatedBy = grp.FirstOrDefault().e.CreatedBy,
        //                     CreatedTime = grp.FirstOrDefault().e.CreatedTime,

        //                     Staff = grp.FirstOrDefault().b?.GivenName,
        //                 });

        //    if (query.Any())
        //    {
        //        var listCustomerCareInMonthFunc = GetCustomerCareInMonthFunc(dateSearch);

        //        var query1 = (from c in listArea
        //                      join d in DbContext.Customers.Where(x => x.IsDeleted == false).AsNoTracking()
        //                                        .Select(x => new { x.CusCode, x.Area, x.CusName }) on c.Code equals d.Area
        //                      join e in listCustomerCareInMonthFunc.Where(x => x.BrandCode == "BUTSON")
        //                                        on d.CusCode equals e.CusCode
        //                      group new { c, d, e } by new { d.CusCode }
        //                      into grp
        //                      //let consumpMonthlyTotal = grp.Sum(y => y.e.ConsumpMonthly)
        //                      //let consumpMonthlyButSon = grp.Where(x => x.e.BrandCode == "BUTSON").Sum(y => y.e.ConsumpMonthly)
        //                      select new VCGroupCustomerCareModel
        //                      {
        //                          CusCode = grp.Key.CusCode,
        //                          ConsumpMonthly = grp.Sum(y => y.e.ConsumpMonthly)
        //                          //ProportionCal = (consumpMonthlyTotal != null && consumpMonthlyTotal != 0) ? consumpMonthlyButSon * 100 / consumpMonthlyTotal : null,
        //                      });

        //        var query2 = (from c in listArea
        //                      join d in DbContext.Customers.Where(x => x.IsDeleted == false).AsNoTracking()
        //                                        .Select(x => new { x.CusCode, x.Area, x.CusName }) on c.Code equals d.Area
        //                      join e in listCustomerCareInMonthFunc
        //                                        on d.CusCode equals e.CusCode
        //                      group new { c, d, e } by new { d.CusCode }
        //                      into grp
        //                      //let consumpMonthlyTotal = grp.Sum(y => y.e.ConsumpMonthly)
        //                      //let consumpMonthlyButSon = grp.Where(x => x.e.BrandCode == "BUTSON").Sum(y => y.e.ConsumpMonthly)
        //                      select new VCGroupCustomerCareModel
        //                      {
        //                          CusCode = grp.Key.CusCode,
        //                          ConsumpMonthly = grp.Sum(y => y.e.ConsumpMonthly),
        //                      });

        //        var res = (from a in query
        //                   join b1 in query1 on a.CusCode equals b1.CusCode into b2
        //                   from b in b2.DefaultIfEmpty()
        //                   join c1 in query2 on a.CusCode equals c1.CusCode into c2
        //                   from c in c2.DefaultIfEmpty()
        //                   select new VCGroupCustomerCareModel
        //                   {
        //                       Id = a.Id,
        //                       CusCode = a.CusCode,
        //                       CusName = a.CusName,
        //                       AreaCode = a.AreaCode,
        //                       AreaName = a.AreaName,
        //                       Proportion = a.Proportion,
        //                       ProportionCal = c != null && c.ConsumpMonthly != null && c.ConsumpMonthly != 0 ? (b != null && b.ConsumpMonthly != null ? b.ConsumpMonthly * 100 / c.ConsumpMonthly : 0) : null,
        //                       TotalCanImp = a.TotalCanImp,
        //                       Staff = a.Staff,
        //                       CreatedBy = a.CreatedBy,
        //                       CreatedTime = a.CreatedTime,
        //                       Note = a.Note,
        //                   })
        //                    .Where(x =>
        //                    (string.IsNullOrEmpty(cusName) || (!string.IsNullOrEmpty(x.CusCode) && x.CusCode == cusName))
        //                    && (string.IsNullOrEmpty(areaCode) || (!string.IsNullOrEmpty(x.AreaCode) && x.AreaCode == areaCode))
        //                    && (string.IsNullOrEmpty(staff) || (!string.IsNullOrEmpty(x.CreatedBy) && x.CreatedBy == staff)))
        //                   ;
        //        return res;
        //    }
        //    else
        //    {
        //        return query.Where(x =>
        //                    (string.IsNullOrEmpty(cusName) || (!string.IsNullOrEmpty(x.CusCode) && x.CusCode == cusName))
        //                    && (string.IsNullOrEmpty(areaCode) || (!string.IsNullOrEmpty(x.AreaCode) && x.AreaCode == areaCode))
        //                    && (string.IsNullOrEmpty(staff) || (!string.IsNullOrEmpty(x.CreatedBy) && x.CreatedBy == staff)))
        //                   ;
        //    }

        //}



    }
    public class VCProporCurrentModel
    {
        public int Id { get; set; }
        public string CustomerName { get; set; }
        public string CusCode { get; set; }
        public string Area { get; set; }
        public string AreaName { get; set; }
        public decimal? Proportion { get; set; }
        public decimal? ProportionCal { get; set; }
        public decimal? Instock { get; set; }
        public decimal? TotalCanImp { get; set; }
        public string Staff { get; set; }
        public DateTime? CreatedTime { get; set; }
        public string Note { get; set; }
    }
}