using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using System.Globalization;
using Eval.net;
using Microsoft.AspNetCore.Hosting;
using System.IO;
using Microsoft.AspNetCore.Http.Internal;
using Syncfusion.Drawing;
using Syncfusion.XlsIO;
using III.Domain.Enums;
using System.Net;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class AllowanceSettingParamController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IStringLocalizer<AllowanceSettingParamController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IHostingEnvironment _hostingEnvironment;
        public readonly string module_name = "SALARY";
        public string path_upload_file = "";
        public string repos_code = "";
        public string cat_code = "";
        public int host_type = 1;

        public class JTableModelCustom : JTableModel
        {
            public string Code { get; set; }
            public string Name { get; set; }
        }
        public AllowanceSettingParamController(EIMDBContext context, IUploadService upload, IStringLocalizer<AllowanceSettingParamController> stringLocalizer, IHostingEnvironment hostingEnvironment, IStringLocalizer<SharedResources> sharedResources)
        {
            _upload = upload;
            _context = context;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
            _hostingEnvironment = hostingEnvironment;
            var obj = (EDMSCatRepoSetting)_upload.GetPathByModule(module_name).Object;
            repos_code = obj.ReposCode;
            cat_code = obj.CatCode;
            if (obj.Path == "")
            {
                host_type = 1;
                path_upload_file = obj.FolderId;
            }
            else
            {
                host_type = 0;
                path_upload_file = obj.Path;
            }
        }

        #region Combobox
        [HttpPost]
        public object GetListAllowanceGroup()
        {
            var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals("ALLOWANCE_GROUP"))
                .Select(p => new { Code = p.CodeSet, Name = p.ValueSet });
            return Json(data);
        }
        #endregion

        [Breadcrumb("ViewData.CrumbAllowanceSettingParam", AreaName = "Admin", FromAction = "Index", FromController = typeof(EmployeeHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbEmployeeHome"] = _sharedResources["COM_CRUMB_EMPLOYEE_HOME"];
            ViewData["CrumbAllowanceSettingParam"] = _sharedResources["COM_CRUMB_ALLOWANCE_SETTING_PARAM"];
            return View();
        }

        [HttpPost]
        public JsonResult GetEmployeeDetailAllowance(string month, string departmentId)
        {
            DateTime time = !string.IsNullOrEmpty(month) ? DateTime.ParseExact(month, "MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;
            //var listAllowanceEmployee = _context.AllowanceEmployeeMonths.OrderBy(x => x.DepartmentCode).Where(x => !x.IsDeleted && x.Month.Month.Equals(time.Month) && x.Month.Year.Equals(time.Year)).ToList();
            //if (listAllowanceEmployee.Count > 0 && string.IsNullOrEmpty(departmentId))
            //{
            //    var data = listAllowanceEmployee.Select(k => new
            //    {
            //        Month = k.Month.ToString("MM/yyyy"),
            //        EmployeeId = k.EmployeeId,
            //        EmployeeName = k.EmployeeName,
            //        DepartmentCode = k.DepartmentCode,
            //        DepartmentName = k.DepartmentName,
            //        C = k.C,
            //        D = k.D,
            //        E = k.E,
            //        F = k.F,
            //        G = k.G,
            //        H = k.H,
            //        I = k.I,
            //        J = k.J,
            //        K = k.K,
            //        L = k.L,
            //        M = k.M,
            //        N = k.N,
            //        O = k.O,
            //        P = k.P,
            //        Q = k.Q,
            //        R = k.R,
            //        S = k.S,
            //        T = k.T,
            //        U = k.U,
            //        V = k.V,
            //        X = k.X,
            //        Y = k.Y,
            //        W = k.W
            //    });

            //    var rs = new
            //    {
            //        result = data
            //    };

            //    return Json(rs);
            //}


            var listSalaryEmployee = _context.SalaryEmployeeMonths.OrderBy(x => x.DepartmentCode).Where(x => !x.IsDeleted && (x.R != null && x.R > 0) && x.Month.Month.Equals(time.Month) && x.Month.Year.Equals(time.Year)).Select(x => new
            {
                x.EmployeeId,
                x.J,//PC ĐT
                x.Q,//PC Ăn trưa
                x.R,//Tổng thu nhập
                Salary = x.R - x.Q - x.J,
                TotalWork = x.TotalDay
            }).ToList();

            var dataAllowance = (from a in _context.AllowanceParams.Where(x => !x.IsDeleted)
                                 join b in _context.AllowanceEmployeeParams.Where(x => !x.IsDeleted) on a.Code equals b.ParamCode
                                 join c in _context.HREmployees.Where(x => x.flag == 1 && ((string.IsNullOrEmpty(departmentId) && x.unit != "BGD") || x.unit == departmentId)) on b.EmployeeId equals c.Id.ToString()
                                 join d in _context.AdDepartments.Where(x => !x.IsDeleted && x.IsEnabled) on c.unit equals d.DepartmentCode
                                 where b.Month.Month.Equals(time.Month) && b.Month.Year.Equals(time.Year)
                                 select new AllowanceDetail
                                 {
                                     EmployeeId = b.EmployeeId,
                                     EmployeeName = c.fullname,
                                     Code = a.Code,
                                     Name = a.Name,
                                     ExcelColumn = a.ExcelColumn,
                                     Value = b.Value,
                                     DepartmentName = d.Title,
                                     DepartmentCode = d.DepartmentCode
                                 }).ToList();

            var dataCountAllowance = (from a in _context.AllowanceCategorys.Where(x => !x.IsDeleted)
                                      join b in _context.AllowanceEmployeeAccepts.Where(x => !x.IsDeleted && dataAllowance.Any(p => p.EmployeeId.Equals(x.EmployeeId))) on a.Code equals b.AllowanceCatCode
                                      join c in _context.HREmployees.Where(x => x.flag == 1 && ((string.IsNullOrEmpty(departmentId) && x.unit != "BGD") || x.unit == departmentId)) on b.EmployeeId equals c.Id.ToString()
                                      join d in _context.AdDepartments.Where(x => !x.IsDeleted && x.IsEnabled) on c.unit equals d.DepartmentCode
                                      select new AllowanceDetail
                                      {
                                          EmployeeId = b.EmployeeId,
                                          EmployeeName = c.fullname,
                                          Code = a.Code,
                                          Name = a.Name,
                                          ExcelColumn = a.ExcelColumn,
                                          Value = "",
                                          Expresstion = a.Expression,
                                          DepartmentName = d.Title,
                                          DepartmentCode = d.DepartmentCode
                                      }).ToList();

            foreach (var item in dataCountAllowance)
            {
                var salary = listSalaryEmployee.Any(k => k.EmployeeId.Equals(item.EmployeeId)) ? listSalaryEmployee.First(k => k.EmployeeId.Equals(item.EmployeeId)).Salary.ToString() : "";
                var totalWork = listSalaryEmployee.Any(k => k.EmployeeId.Equals(item.EmployeeId)) ? listSalaryEmployee.First(k => k.EmployeeId.Equals(item.EmployeeId)).TotalWork.ToString() : "";

                var countValue = GetExpression(new AssignParam { EmployeeId = item.EmployeeId, Expression = item.Expresstion, Month = month, Salary = salary, TotalWork = totalWork });
                item.Value = countValue.Error ? countValue.Title : countValue.Object.ToString();
            }

            var dataRs = dataAllowance.Concat(dataCountAllowance);
            var listDepartment = _context.AdDepartments.Where(x => !x.IsDeleted && x.IsEnabled);
            var result = dataRs.GroupBy(x => x.EmployeeId).Select(p => new
            {
                EmployeeId = p.First().EmployeeId,
                EmployeeName = p.First().EmployeeName,
                DepartmentCode = p.First().DepartmentCode,
                DepartmentName = p.First().DepartmentName,
                C = listSalaryEmployee.Any(k => k.EmployeeId.Equals(p.Key)) ? listSalaryEmployee.First(k => k.EmployeeId.Equals(p.Key)).Salary.ToString() : p.Any(x => x.ExcelColumn.Equals("C")) ? p.First(x => x.ExcelColumn.Equals("C")).Value : "0",
                D = listSalaryEmployee.Any(k => k.EmployeeId.Equals(p.Key)) ? listSalaryEmployee.First(k => k.EmployeeId.Equals(p.Key)).TotalWork.ToString() : p.Any(x => x.ExcelColumn.Equals("D")) ? p.First(x => x.ExcelColumn.Equals("D")).Value : "0",
                E = p.Any(x => x.ExcelColumn.Equals("E")) ? p.First(x => x.ExcelColumn.Equals("E")).Value : "0",
                F = p.Any(x => x.ExcelColumn.Equals("F")) ? p.First(x => x.ExcelColumn.Equals("F")).Value : "0",
                G = p.Any(x => x.ExcelColumn.Equals("G")) ? p.First(x => x.ExcelColumn.Equals("G")).Value : "0",
                H = p.Any(x => x.ExcelColumn.Equals("H")) ? p.First(x => x.ExcelColumn.Equals("H")).Value : "0",
                I = p.Any(x => x.ExcelColumn.Equals("I")) ? p.First(x => x.ExcelColumn.Equals("I")).Value : "0",
                J = p.Any(x => x.ExcelColumn.Equals("J")) ? p.First(x => x.ExcelColumn.Equals("J")).Value : "0",
                K = p.Any(x => x.ExcelColumn.Equals("K")) ? p.First(x => x.ExcelColumn.Equals("K")).Value : "0",
                L = p.Any(x => x.ExcelColumn.Equals("L")) ? p.First(x => x.ExcelColumn.Equals("L")).Value : "0",
                M = p.Any(x => x.ExcelColumn.Equals("M")) ? p.First(x => x.ExcelColumn.Equals("M")).Value : "0",
                N = p.Any(x => x.ExcelColumn.Equals("N")) ? p.First(x => x.ExcelColumn.Equals("N")).Value : "0",
                O = p.Any(x => x.ExcelColumn.Equals("O")) ? p.First(x => x.ExcelColumn.Equals("O")).Value : "0",
                P = p.Any(x => x.ExcelColumn.Equals("P")) ? p.First(x => x.ExcelColumn.Equals("P")).Value : "0",
                Q = p.Any(x => x.ExcelColumn.Equals("Q")) ? p.First(x => x.ExcelColumn.Equals("Q")).Value : "0",
                R = p.Any(x => x.ExcelColumn.Equals("R")) ? p.First(x => x.ExcelColumn.Equals("R")).Value : "0",
                S = p.Any(x => x.ExcelColumn.Equals("S")) ? p.First(x => x.ExcelColumn.Equals("S")).Value : "0",
                T = p.Any(x => x.ExcelColumn.Equals("T")) ? p.First(x => x.ExcelColumn.Equals("T")).Value : "0",
                U = p.Any(x => x.ExcelColumn.Equals("U")) ? p.First(x => x.ExcelColumn.Equals("U")).Value : "0",
                V = p.Any(x => x.ExcelColumn.Equals("V")) ? p.First(x => x.ExcelColumn.Equals("V")).Value : "0",
                W = listSalaryEmployee.Any(k => k.EmployeeId.Equals(p.Key)) ? listSalaryEmployee.First(k => k.EmployeeId.Equals(p.Key)).R.ToString() : p.Any(x => x.ExcelColumn.Equals("W")) ? p.First(x => x.ExcelColumn.Equals("W")).Value : "0",
                X = listSalaryEmployee.Any(k => k.EmployeeId.Equals(p.Key)) ? listSalaryEmployee.First(k => k.EmployeeId.Equals(p.Key)).Q.ToString() : p.Any(x => x.ExcelColumn.Equals("X")) ? p.First(x => x.ExcelColumn.Equals("X")).Value : "0",
                Y = listSalaryEmployee.Any(k => k.EmployeeId.Equals(p.Key)) ? listSalaryEmployee.First(k => k.EmployeeId.Equals(p.Key)).J.ToString() : p.Any(x => x.ExcelColumn.Equals("Y")) ? p.First(x => x.ExcelColumn.Equals("Y")).Value : "0",
            });

            var objRs = new
            {
                result
            };
            return Json(objRs);
        }

        [NonAction]
        public JMessage GetExpression(AssignParam obj)
        {
            var msg = new JMessage();

            try
            {
                var exp = obj.Expression;
                DateTime month = !string.IsNullOrEmpty(obj.Month) ? DateTime.ParseExact(obj.Month, "MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;

                var check = _context.AllowanceEmployeeParams.Where(x => !x.IsDeleted && exp.Contains(x.ParamCode) && x.Month.Month.Equals(month.Month) && x.Month.Year.Equals(month.Year) && x.EmployeeId.Equals(obj.EmployeeId)).Select(x => new { x.ParamCode, x.Value });
                foreach (var item in check)
                {
                    exp = exp.Replace(item.ParamCode, item.Value, StringComparison.CurrentCulture);
                }

                if (!string.IsNullOrEmpty(obj.Salary))
                    exp = exp.Replace("P01", obj.Salary, StringComparison.CurrentCulture);

                if (!string.IsNullOrEmpty(obj.TotalWork))
                    exp = exp.Replace("P02", obj.TotalWork, StringComparison.CurrentCulture);

                msg.Object = Math.Round((double)Evaluator.Execute(exp, EvalConfiguration.DoubleConfiguration));
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Chưa nhập đủ dữ liệu";
                msg.Title = "0";
            }

            return msg;
        }

        [HttpPost]
        public object ExportExcel([FromBody] ExcelExportAllowanceModel data)
        {
            var msg = new JMessage();
            Stream fileStreamPath = _upload.GetStreamByModule("Phu_cap.xlsx", module_name);
            FormFile fileUpload = new FormFile(fileStreamPath, 0, fileStreamPath.Length, "Test", "Test.xlsx");

            // Read content from file
            using (ExcelEngine excelEngine = new ExcelEngine())
            {
                IApplication application = excelEngine.Excel;
                IWorkbook workbook = application.Workbooks.Open(fileUpload.OpenReadStream());
                IWorksheet sheetRequest = workbook.Worksheets[0];
                application.DefaultVersion = ExcelVersion.Excel2013;

                var listData = data.ListEmployeeDetail;
                var listDepartment = listData.GroupBy(x => x.DepartmentCode).Select(p => new { p.First().DepartmentCode, p.First().DepartmentName }).ToList();

                var countDelete = 30 - listData.Count - listDepartment.Count;
                sheetRequest.DeleteRow(10, countDelete);

                IStyle style = workbook.Styles.Add("NewStyle");
                style.Color = Color.Yellow;
                style.Font.Bold = true;
                style.Font.Size = 12;
                style.Borders[ExcelBordersIndex.EdgeLeft].LineStyle = ExcelLineStyle.Thin;
                style.Borders[ExcelBordersIndex.EdgeRight].LineStyle = ExcelLineStyle.Thin;
                style.Borders[ExcelBordersIndex.EdgeTop].LineStyle = ExcelLineStyle.Thin;
                style.Borders[ExcelBordersIndex.EdgeBottom].LineStyle = ExcelLineStyle.Thin;

                sheetRequest.Range["A4"].Value2 = string.Format("BẢNG THANH TOÁN TIỀN PHỤ CẤP THÁNG {0} NĂM {1}", data.Month, data.Year);
                sheetRequest.Range["A2"].Value2 = "Đơn vị: " + string.Join(",", listDepartment.Select(x => x.DepartmentCode));

                sheetRequest.Name = "Tháng " + data.Month;

                var row = 10;
                var stt = 0;
                for (int k = 0; k < listDepartment.Count; k++)
                {
                    var listDataByDepartment = listData.Where(x => x.DepartmentCode.Equals(listDepartment[k].DepartmentCode)).ToList();
                    sheetRequest.Range["B" + row].Value2 = listDepartment[k].DepartmentName;
                    sheetRequest.Range["A" + row + ":Y" + row].CellStyle = style;

                    sheetRequest.Range["B" + row].VerticalAlignment = ExcelVAlign.VAlignCenter;
                    for (int i = 0; i < listDataByDepartment.Count; i++)
                    {
                        row++;
                        stt++;
                        sheetRequest.Range["A" + row].Value2 = stt;
                        sheetRequest.Range["B" + row].Value2 = listDataByDepartment[i].EmployeeName.ToString();
                        sheetRequest.Range["C" + row].Value2 = (listDataByDepartment[i].C != null && listDataByDepartment[i].C != 0) ? listDataByDepartment[i].C.ToString() : "";
                        sheetRequest.Range["D" + row].Value2 = (listDataByDepartment[i].D != null && listDataByDepartment[i].D != 0) ? listDataByDepartment[i].D.ToString().Replace(".", ",") : "0";
                        sheetRequest.Range["E" + row].Value2 = (listDataByDepartment[i].E != null && listDataByDepartment[i].E != 0) ? listDataByDepartment[i].E.ToString().Replace(".", ",") : "0";
                        sheetRequest.Range["F" + row].Value2 = (listDataByDepartment[i].F != null && listDataByDepartment[i].F != 0) ? listDataByDepartment[i].F.ToString().Replace(".", ",") : "0";
                        sheetRequest.Range["G" + row].Value2 = (listDataByDepartment[i].G != null && listDataByDepartment[i].G != 0) ? listDataByDepartment[i].G.ToString().Replace(".", ",") : "0";
                        sheetRequest.Range["H" + row].Value2 = (listDataByDepartment[i].H != null && listDataByDepartment[i].H != 0) ? listDataByDepartment[i].H.ToString().Replace(".", ",") : "0";
                        sheetRequest.Range["I" + row].Value2 = (listDataByDepartment[i].I != null && listDataByDepartment[i].I != 0) ? listDataByDepartment[i].I.ToString().Replace(".", ",") : "0";
                        sheetRequest.Range["J" + row].Value2 = (listDataByDepartment[i].J != null && listDataByDepartment[i].J != 0) ? listDataByDepartment[i].J.ToString().Replace(".", ",") : "0";
                        sheetRequest.Range["K" + row].Value2 = (listDataByDepartment[i].K != null && listDataByDepartment[i].K != 0) ? listDataByDepartment[i].K.ToString().Replace(".", ",") : "0";
                        sheetRequest.Range["L" + row].Value2 = (listDataByDepartment[i].L != null && listDataByDepartment[i].L != 0) ? listDataByDepartment[i].L.ToString().Replace(".", ",") : "0";
                        sheetRequest.Range["M" + row].Value2 = (listDataByDepartment[i].M != null && listDataByDepartment[i].M != 0) ? listDataByDepartment[i].M.ToString() : "";
                        sheetRequest.Range["N" + row].Value2 = (listDataByDepartment[i].N != null && listDataByDepartment[i].N != 0) ? listDataByDepartment[i].N.ToString() : "";
                        sheetRequest.Range["O" + row].Value2 = (listDataByDepartment[i].O != null && listDataByDepartment[i].O != 0) ? listDataByDepartment[i].O.ToString() : "";
                        sheetRequest.Range["P" + row].Value2 = (listDataByDepartment[i].P != null && listDataByDepartment[i].P != 0) ? listDataByDepartment[i].P.ToString() : "";
                        sheetRequest.Range["Q" + row].Value2 = (listDataByDepartment[i].Q != null && listDataByDepartment[i].Q != 0) ? listDataByDepartment[i].Q.ToString() : "";
                        sheetRequest.Range["R" + row].Value2 = (listDataByDepartment[i].R != null && listDataByDepartment[i].R != 0) ? listDataByDepartment[i].R.ToString() : "";
                        sheetRequest.Range["S" + row].Value2 = (listDataByDepartment[i].S != null && listDataByDepartment[i].S != 0) ? listDataByDepartment[i].S.ToString() : "";
                        sheetRequest.Range["T" + row].Value2 = (listDataByDepartment[i].T != null && listDataByDepartment[i].T != 0) ? listDataByDepartment[i].T.ToString() : "";
                        sheetRequest.Range["U" + row].Value2 = (listDataByDepartment[i].U != null && listDataByDepartment[i].U != 0) ? listDataByDepartment[i].U.ToString() : "";
                        sheetRequest.Range["V" + row].Value2 = (listDataByDepartment[i].V != null && listDataByDepartment[i].V != 0) ? listDataByDepartment[i].V.ToString() : "";
                        sheetRequest.Range["W" + row].Value2 = (listDataByDepartment[i].W != null && listDataByDepartment[i].W != 0) ? listDataByDepartment[i].W.ToString() : "";
                        sheetRequest.Range["X" + row].Value2 = (listDataByDepartment[i].X != null && listDataByDepartment[i].X != 0) ? listDataByDepartment[i].X.ToString() : "";
                        sheetRequest.Range["Y" + row].Value2 = (listDataByDepartment[i].Y != null && listDataByDepartment[i].Y != 0) ? listDataByDepartment[i].Y.ToString() : "";
                    }

                    row++;
                }

                workbook.SetSeparators('.', '.');

                var fileName = "PhuCap_" + DateTime.Now.ToString("ddMMyyy_hhmm") + ".xlsx";
                var pathFile = _hostingEnvironment.WebRootPath + "\\uploads\\tempFile\\" + fileName;
                var pathFileDownLoad = "uploads\\tempFile\\" + fileName;
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
        }

        [HttpPost]
        public object SaveExcel([FromBody] ExcelExportAllowanceModel data)
        {
            var msg = new JMessage();
            Stream fileStreamPath = _upload.GetStreamByModule("Phu_cap.xlsx", module_name);
            FormFile fileUpload = new FormFile(fileStreamPath, 0, fileStreamPath.Length, "Test", "Test.xlsx");

            // Read content from file
            using (ExcelEngine excelEngine = new ExcelEngine())
            {
                IApplication application = excelEngine.Excel;
                IWorkbook workbook = application.Workbooks.Open(fileUpload.OpenReadStream());
                IWorksheet sheetRequest = workbook.Worksheets[0];
                application.DefaultVersion = ExcelVersion.Excel2013;

                DateTime month = string.IsNullOrEmpty(data.Month) ? DateTime.ParseExact(data.Month, "MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;

                var listData = data.ListEmployeeDetail;
                var listDepartment = listData.GroupBy(x => x.DepartmentCode).Select(p => new { p.First().DepartmentCode, p.First().DepartmentName }).ToList();

                var countDelete = 30 - listData.Count - listDepartment.Count;
                sheetRequest.DeleteRow(10, countDelete);

                IStyle style = workbook.Styles.Add("NewStyle");
                style.Color = Color.Yellow;
                style.Font.Bold = true;
                style.Font.Size = 12;
                style.Borders[ExcelBordersIndex.EdgeLeft].LineStyle = ExcelLineStyle.Thin;
                style.Borders[ExcelBordersIndex.EdgeRight].LineStyle = ExcelLineStyle.Thin;
                style.Borders[ExcelBordersIndex.EdgeTop].LineStyle = ExcelLineStyle.Thin;
                style.Borders[ExcelBordersIndex.EdgeBottom].LineStyle = ExcelLineStyle.Thin;

                sheetRequest.Range["A4"].Value2 = string.Format("BẢNG THANH TOÁN TIỀN PHỤ CẤP THÁNG {0} NĂM {1}", data.Month, data.Year);
                sheetRequest.Range["A2"].Value2 = "Đơn vị: " + string.Join(",", listDepartment.Select(x => x.DepartmentCode));

                sheetRequest.Name = "Tháng " + data.Month;

                var row = 10;
                var stt = 0;
                for (int k = 0; k < listDepartment.Count; k++)
                {
                    var listDataByDepartment = listData.Where(x => x.DepartmentCode.Equals(listDepartment[k].DepartmentCode)).ToList();
                    sheetRequest.Range["B" + row].Value2 = listDepartment[k].DepartmentName;
                    sheetRequest.Range["A" + row + ":Y" + row].CellStyle = style;

                    sheetRequest.Range["B" + row].VerticalAlignment = ExcelVAlign.VAlignCenter;

                    for (int i = 0; i < listDataByDepartment.Count; i++)
                    {
                        row++;
                        stt++;
                        sheetRequest.Range["A" + row].Value2 = stt;
                        sheetRequest.Range["B" + row].Value2 = listDataByDepartment[i].EmployeeName.ToString();
                        sheetRequest.Range["C" + row].Value2 = (listDataByDepartment[i].C != null && listDataByDepartment[i].C != 0) ? listDataByDepartment[i].C.ToString() : "";
                        sheetRequest.Range["D" + row].Value2 = (listDataByDepartment[i].D != null && listDataByDepartment[i].D != 0) ? listDataByDepartment[i].D.ToString().Replace(".", ",") : "0";
                        sheetRequest.Range["E" + row].Value2 = (listDataByDepartment[i].E != null && listDataByDepartment[i].E != 0) ? listDataByDepartment[i].E.ToString().Replace(".", ",") : "0";
                        sheetRequest.Range["F" + row].Value2 = (listDataByDepartment[i].F != null && listDataByDepartment[i].F != 0) ? listDataByDepartment[i].F.ToString().Replace(".", ",") : "0";
                        sheetRequest.Range["G" + row].Value2 = (listDataByDepartment[i].G != null && listDataByDepartment[i].G != 0) ? listDataByDepartment[i].G.ToString().Replace(".", ",") : "0";
                        sheetRequest.Range["H" + row].Value2 = (listDataByDepartment[i].H != null && listDataByDepartment[i].H != 0) ? listDataByDepartment[i].H.ToString().Replace(".", ",") : "0";
                        sheetRequest.Range["I" + row].Value2 = (listDataByDepartment[i].I != null && listDataByDepartment[i].I != 0) ? listDataByDepartment[i].I.ToString().Replace(".", ",") : "0";
                        sheetRequest.Range["J" + row].Value2 = (listDataByDepartment[i].J != null && listDataByDepartment[i].J != 0) ? listDataByDepartment[i].J.ToString().Replace(".", ",") : "0";
                        sheetRequest.Range["K" + row].Value2 = (listDataByDepartment[i].K != null && listDataByDepartment[i].K != 0) ? listDataByDepartment[i].K.ToString().Replace(".", ",") : "0";
                        sheetRequest.Range["L" + row].Value2 = (listDataByDepartment[i].L != null && listDataByDepartment[i].L != 0) ? listDataByDepartment[i].L.ToString().Replace(".", ",") : "0";
                        sheetRequest.Range["M" + row].Value2 = (listDataByDepartment[i].M != null && listDataByDepartment[i].M != 0) ? listDataByDepartment[i].M.ToString() : "";
                        sheetRequest.Range["N" + row].Value2 = (listDataByDepartment[i].N != null && listDataByDepartment[i].N != 0) ? listDataByDepartment[i].N.ToString() : "";
                        sheetRequest.Range["O" + row].Value2 = (listDataByDepartment[i].O != null && listDataByDepartment[i].O != 0) ? listDataByDepartment[i].O.ToString() : "";
                        sheetRequest.Range["P" + row].Value2 = (listDataByDepartment[i].P != null && listDataByDepartment[i].P != 0) ? listDataByDepartment[i].P.ToString() : "";
                        sheetRequest.Range["Q" + row].Value2 = (listDataByDepartment[i].Q != null && listDataByDepartment[i].Q != 0) ? listDataByDepartment[i].Q.ToString() : "";
                        sheetRequest.Range["R" + row].Value2 = (listDataByDepartment[i].R != null && listDataByDepartment[i].R != 0) ? listDataByDepartment[i].R.ToString() : "";
                        sheetRequest.Range["S" + row].Value2 = (listDataByDepartment[i].S != null && listDataByDepartment[i].S != 0) ? listDataByDepartment[i].S.ToString() : "";
                        sheetRequest.Range["T" + row].Value2 = (listDataByDepartment[i].T != null && listDataByDepartment[i].T != 0) ? listDataByDepartment[i].T.ToString() : "";
                        sheetRequest.Range["U" + row].Value2 = (listDataByDepartment[i].U != null && listDataByDepartment[i].U != 0) ? listDataByDepartment[i].U.ToString() : "";
                        sheetRequest.Range["V" + row].Value2 = (listDataByDepartment[i].V != null && listDataByDepartment[i].V != 0) ? listDataByDepartment[i].V.ToString() : "";
                        sheetRequest.Range["W" + row].Value2 = (listDataByDepartment[i].W != null && listDataByDepartment[i].W != 0) ? listDataByDepartment[i].W.ToString() : "";
                        sheetRequest.Range["X" + row].Value2 = (listDataByDepartment[i].X != null && listDataByDepartment[i].X != 0) ? listDataByDepartment[i].X.ToString() : "";
                        sheetRequest.Range["Y" + row].Value2 = (listDataByDepartment[i].Y != null && listDataByDepartment[i].Y != 0) ? listDataByDepartment[i].Y.ToString() : "";
                    }

                    row++;
                }

                var listDB = _context.AllowanceEmployeeMonths.Where(x => !x.IsDeleted && x.Month.Month.Equals(month.Month) && x.Month.Year.Equals(month.Year));
                var listInsert = listData.Where(x => !listDB.Any(p => p.EmployeeId.Equals(x.EmployeeId)))
                    .Select(k => new AllowanceEmployeeMonth
                    {
                        Month = month,
                        EmployeeId = k.EmployeeId,
                        EmployeeName = k.EmployeeName,
                        DepartmentCode = k.DepartmentCode,
                        DepartmentName = k.DepartmentName,
                        CreatedBy = User.Identity.Name,
                        CreatedTime = DateTime.Now,
                        C = k.C,
                        D = k.D,
                        E = k.E,
                        F = k.F,
                        G = k.G,
                        H = k.H,
                        I = k.I,
                        J = k.J,
                        K = k.K,
                        L = k.L,
                        M = k.M,
                        N = k.N,
                        O = k.O,
                        P = k.P,
                        Q = k.Q,
                        R = k.R,
                        S = k.S,
                        T = k.T,
                        U = k.U,
                        V = k.V,
                        X = k.X,
                        Y = k.Y,
                        W = k.W
                    });

                _context.AllowanceEmployeeMonths.AddRange(listInsert);

                var listUpdate = (from a in listDB
                                  join b in listData on a.EmployeeId equals b.EmployeeId
                                  select new AllowanceEmployeeMonth
                                  {
                                      ID = a.ID,
                                      EmployeeId = b.EmployeeId,
                                      EmployeeName = b.EmployeeName,
                                      DepartmentCode = b.DepartmentCode,
                                      DepartmentName = b.DepartmentName,
                                      CreatedBy = a.CreatedBy,
                                      CreatedTime = a.CreatedTime,
                                      Month = a.Month,
                                      UpdatedBy = User.Identity.Name,
                                      UpdatedTime = DateTime.Now,
                                      C = b.C,
                                      D = b.D,
                                      E = b.E,
                                      F = b.F,
                                      G = b.G,
                                      H = b.H,
                                      I = b.I,
                                      J = b.J,
                                      K = b.K,
                                      L = b.L,
                                      M = b.M,
                                      N = b.N,
                                      O = b.O,
                                      P = b.P,
                                      Q = b.Q,
                                      R = b.R,
                                      S = b.S,
                                      T = b.T,
                                      U = b.U,
                                      V = b.V,
                                      X = b.X,
                                      Y = b.Y,
                                      W = b.W
                                  });

                _context.AllowanceEmployeeMonths.UpdateRange(listUpdate);

                _context.SaveChanges();

                var fileName = "PhuCap_" + DateTime.Now.ToString("ddMMyyy_hhmm") + ".xlsx";
                MemoryStream ms = new MemoryStream();
                workbook.SaveAs(ms);
                workbook.Close();
                excelEngine.Dispose();
                ms.Position = 0;

                var getRepository = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == repos_code);
                var fileId = "";
                if (host_type == 0)
                {
                    var fileBytes = ms.ToArray();
                    var urlFile = path_upload_file + Path.Combine("/", fileName);
                    var urlFilePreventive = path_upload_file + Path.Combine("/", Guid.NewGuid().ToString().Substring(0, 8) + fileName);
                    var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + getRepository.Server + urlFile);
                    var urlEndPreventive = System.Web.HttpUtility.UrlPathEncode("ftp://" + getRepository.Server + urlFilePreventive);
                    var result = FileExtensions.UploadFileToFtpServer(urlEnd, urlEndPreventive, fileBytes, getRepository.Account, getRepository.PassWord);
                    if (result.Status == WebExceptionStatus.ConnectFailure || result.Status == WebExceptionStatus.ProtocolError)
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["ALSP_MSG_ERR_CONNECTION"];
                    }
                    else if (result.Status == WebExceptionStatus.Success)
                    {
                        msg.Title = _stringLocalizer["ALSP_MSG_SAVE_FILE_SUCCESS"];

                        if (result.IsSaveUrlPreventive)
                        {
                            urlFile = urlFilePreventive;
                        }
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = _sharedResources["COM_MSG_ERR"];
                    }
                }
                else {
                    var apiTokenService = _context.TokenManagers.FirstOrDefault(x => x.AccountCode == getRepository.Token);
                    var json = apiTokenService.CredentialsJson;
                    var user = apiTokenService.Email;
                    var token = apiTokenService.RefreshToken;
                    fileId = FileExtensions.UploadFileToDrive(json, token, fileUpload.FileName, fileUpload.OpenReadStream(), fileUpload.ContentType, path_upload_file, user);
                }

                var edmsReposCatFile = new EDMSRepoCatFile
                {
                    FileCode = string.Concat("REPOSITORY", Guid.NewGuid().ToString()),
                    ReposCode = repos_code,
                    CatCode = cat_code,
                    ObjectCode = null,
                    ObjectType = null,
                    Path = host_type == 0 ? path_upload_file : "",
                    FolderId = host_type == 1 ? path_upload_file : ""
                };

                var moduleObj = (EDMSCatRepoSetting)_upload.GetPathByModule("DB_LUCENE_INDEX").Object;
                var luceneCategory = _context.EDMSCategorys.FirstOrDefault(x => x.CatCode == moduleObj.CatCode);
                LuceneExtension.IndexFile(edmsReposCatFile.FileCode, fileUpload, luceneCategory.PathServerPhysic);
                //LuceneExtension.IndexFile(edmsReposCatFile.FileCode, new FormFile(fileStream, 0, fileStream.Length), string.Concat(_hostingEnvironment.WebRootPath, "\\uploads\\luceneIndex"));

                var file = new EDMSFile
                {
                    FileCode = edmsReposCatFile.FileCode,
                    FileName = fileName,
                    Desc = "",
                    ReposCode = repos_code,
                    Tags = "",
                    FileSize = ms.Length,
                    FileTypePhysic = ".xlsx",
                    NumberDocument = "",
                    CreatedBy = ESEIM.AppContext.UserName,
                    CreatedTime = DateTime.Now,
                    Url = path_upload_file + Path.Combine("/", fileName),
                    MimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    CloudFileId = fileId,
                };

                _context.EDMSFiles.Add(file);
                _context.EDMSRepoCatFiles.Add(edmsReposCatFile);
                _context.SaveChanges();

                return msg;
            }
        }

        #region Allowance
        public class AssignParam
        {
            public string EmployeeId { get; set; }
            public string Expression { get; set; }
            public string Month { get; set; }
            public string Salary { get; set; }
            public string TotalWork { get; set; }
        }
        public class AllowanceDetail
        {
            public string EmployeeId { get; set; }
            public string EmployeeName { get; set; }
            public string ExcelColumn { get; set; }
            public string Code { get; set; }
            public string Name { get; set; }
            public string Value { get; set; }
            public string Expresstion { get; set; }
            public string DepartmentCode { get; set; }
            public string DepartmentName { get; set; }
            public string Salary { get; set; }
            public string TotalWork { get; set; }
        }

        public class ExcelExportAllowanceModel
        {
            public List<ExcelExportAllowance> ListEmployeeDetail { get; set; }
            public string UserManager { get; set; }
            public string UserCreated { get; set; }
            public string Month { get; set; }
            public string Year { get; set; }
        }

        public class ExcelExportAllowance
        {
            public string EmployeeId { get; set; }
            public string EmployeeName { get; set; }
            public string DepartmentCode { get; set; }
            public string DepartmentName { get; set; }
            public decimal? C { get; set; }
            public decimal? D { get; set; }
            public decimal? E { get; set; }
            public decimal? F { get; set; }
            public decimal? G { get; set; }
            public decimal? H { get; set; }
            public decimal? I { get; set; }
            public decimal? J { get; set; }
            public decimal? K { get; set; }
            public decimal? L { get; set; }
            public decimal? M { get; set; }
            public decimal? N { get; set; }
            public decimal? O { get; set; }
            public decimal? P { get; set; }
            public decimal? Q { get; set; }
            public decimal? R { get; set; }
            public decimal? S { get; set; }
            public decimal? T { get; set; }
            public decimal? U { get; set; }
            public decimal? V { get; set; }
            public decimal? W { get; set; }
            public decimal? X { get; set; }
            public decimal? Y { get; set; }
        }

        #endregion

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
    }
}