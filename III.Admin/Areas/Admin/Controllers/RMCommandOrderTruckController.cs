using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Http;
using System.IO;
using Microsoft.AspNetCore.Hosting;
using Syncfusion.XlsIO;
using System.Text;
using System.Net.Http;
using System.Net.Http.Headers;
using Newtonsoft.Json;
using System.Globalization;
using Syncfusion.Drawing;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class RMCommandOrderTruckController : BaseController
    {

        CultureInfo culutreInfo = new CultureInfo("vi-VN");

        string[] formats = { "dd/MM/yyyy", "d/MM/yyyy", "dd/M/yyyy", "dd/MM/yy", "d/MM/yy", "dd/M/yy" };

        public class JTableModelCustom : JTableModel
        {
            public string Ma_Remooc { get; set; }
            public string MaTheoDoi { get; set; }
            public string NgayGioDen { get; set; }
            public string NgayGioDi { get; set; }
            public string Container_Code { get; set; }

        }
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly EIMDBContext _context;
        private readonly ILogger _logger;
        private readonly IActionLogService _actionLog;
        public RMCommandOrderTruckController(EIMDBContext context, ILogger<RMCommandOrderTruckController> logger, IHostingEnvironment hostingEnvironment, IActionLogService actionLog)
        {
            _context = context;
            _logger = logger;
            _hostingEnvironment = hostingEnvironment;
            _actionLog = actionLog;
        }

        public IActionResult Index()
        {
            ViewData["Message"] = "QUẢN LÝ LỆNH ĐIỀU ĐỘ";
            return View("Index");
        }
        public class Mess
        {
            public int User_id { get; set; }
            public string MaTheoDoi { get; set; }
            public string Title { get; set; }
            public string Message { get; set; }
        }

        [HttpPost]
        public object JTable([FromBody]JTableModelCustom jTablePara)
        {
            var company_code = HttpContext.GetSessionUser()?.CompanyCode;
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            //var company_code = HttpContext.GetSessionUser()?.CompanyCode;
            var query = from a in _context.RmCommandOrderTrucks
                        where a.Isdeleted == 1 && a.CompanyCode == company_code && (jTablePara.MaTheoDoi == null || jTablePara.MaTheoDoi == "" || a.MaTheoDoi.ToLower().Contains(jTablePara.MaTheoDoi.ToLower()) || a.TenTaiXe.ToLower().Contains(jTablePara.MaTheoDoi.ToLower()))
                                && (jTablePara.Ma_Remooc == null || jTablePara.Ma_Remooc == "" || a.SoMooc.ToLower().Contains(jTablePara.Ma_Remooc.ToLower()) || a.SoXe.ToLower().Contains(jTablePara.Ma_Remooc.ToLower()))
                                && (jTablePara.Container_Code == null || jTablePara.Container_Code == "" || a.SoCont.ToLower().Contains(jTablePara.Container_Code.ToLower()))
                                && (jTablePara.NgayGioDi == null || jTablePara.NgayGioDi == a.NgayGioDi)
                                && (jTablePara.NgayGioDen == null || jTablePara.NgayGioDen == a.NgayGioDen)
                        orderby a.Id descending
                        select new
                        {
                            Id = a.Id,
                            MaTheoDoi = a,
                            Gio_Tao = a.CreatedTime.Value.ToString("dd/MM/yyyy HH:mm"),
                            Ngay_Dieu_Xe = a.NgayDieuXe,
                            TenTaiXe = a.TenTaiXe,
                            SoXe = a.SoXe,
                            So_mooc = a.SoMooc,
                            SoCont = a.SoCont,
                            Noi_lay = a.NoiLay,
                            Noi_ha = a.NoiHa,
                            Khach_hang = a.KhachHang,
                            Tong_cong = a.TongCong,
                            Active = a.Active,
                            Muc_Do_Uu_Tien = a.MucDoUuTien
                        };

            var count = query.Count();
            var data = query
                .Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "Muc_Do_Uu_Tien", "MaTheoDoi", "SoCont", "Gio_Tao", "Ngay_Dieu_Xe", "TenTaiXe", "SoXe", "So_mooc", "Noi_lay", "Noi_ha", "Khach_hang", "Tong_cong", "Active");
            return Json(jdata);
        }

        [HttpPost]
        [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
        [RequestSizeLimit(long.MaxValue)]
        public async Task<IActionResult> Insert(IFormFile FileUpload)
        {
            var msg = new JMessageExtend() { Error = true };
            var company_code = HttpContext.GetSessionUser()?.CompanyCode;
            try
            {
                if (FileUpload != null && FileUpload.Length > 0)
                {
                    // Read content from file
                    ExcelEngine excelEngine = new ExcelEngine();
                    IApplication application = excelEngine.Excel;
                    IWorkbook workbook = application.Workbooks.Create();

                    workbook = application.Workbooks.Open(FileUpload.OpenReadStream());
                    IWorksheet worksheet = workbook.Worksheets[0];

                    //var listUser = new List<UserImportData>();
                    //ListUserFailed.ListUser = new List<UserFailed>();
                    if (worksheet.Rows.Length > 1)
                    {
                        if (true)
                        {
                            var title0 = worksheet.Rows[2].Cells;
                            var ngay_dieu_xe = title0[3].DisplayText;
                            var date = DateTime.ParseExact(ngay_dieu_xe, formats, new CultureInfo("vi-VN"), DateTimeStyles.None);
                            var ma_theodoi = title0[12].DisplayText;
                            var payment = title0[15].DisplayText;

                            var row4 = worksheet.Rows[4].Cells;
                            var so_lenh = row4[2].DisplayText;
                            var row5 = worksheet.Rows[5].Cells;
                            var TenTaiXe = row5[2].DisplayText;
                            var row6 = worksheet.Rows[6].Cells;
                            var bien_so = row6[2].DisplayText;//cells[5].DisplayText;
                            var row7 = worksheet.Rows[7].Cells;
                            var ma_remooc = row7[2].DisplayText;
                            var row8 = worksheet.Rows[8].Cells;
                            var hang = row8[2].DisplayText;
                            var row9 = worksheet.Rows[9].Cells;
                            var noi_lay = row9[2].DisplayText;
                            var row10 = worksheet.Rows[10].Cells;
                            var noi_ha = row10[2].DisplayText;
                            var row12 = worksheet.Rows[12].Cells;
                            var SoCont = row12[2].DisplayText;
                            var row13 = worksheet.Rows[13].Cells;
                            var ngay_den = row13[2].DisplayText;
                            var row14 = worksheet.Rows[14].Cells;
                            var ngay_di = row14[2].DisplayText;
                            var row15 = worksheet.Rows[15].Cells;
                            var neo_mooc = row15[2].DisplayText;
                            var row16 = worksheet.Rows[16].Cells;
                            var cau_duong = row16[2].DisplayText;
                            var row17 = worksheet.Rows[17].Cells;
                            var ve_cong = row17[2].DisplayText;
                            var row18 = worksheet.Rows[18].Cells;
                            var phi_ngoai = row18[2].DisplayText;
                            var row19 = worksheet.Rows[19].Cells;
                            var ghichu_khac = row19[2].DisplayText;

                            var khachhang = row4[14].DisplayText;
                            var diachi = row5[14].DisplayText;
                            var phuong_an = row7[14].DisplayText;//cells[5].DisplayText;                         
                            var ghi_chu = row8[14].DisplayText;
                            var ky_xac_nhan = row10[14].DisplayText;
                            var row11 = worksheet.Rows[11].Cells;
                            var nang_cont = row11[14].DisplayText;
                            var ha_cont = row12[14].DisplayText;
                            var kiem_hoa = row13[14].DisplayText;
                            var ve_sinh = row14[14].DisplayText;
                            var luu_bai = row14[14].DisplayText;
                            var PT_giao_cont = row16[14].DisplayText;
                            var luu_rong = row17[14].DisplayText;
                            var chiphi_khac = row18[14].DisplayText;
                            var tong_cong = row19[14].DisplayText;

                            var driver = _context.RmRomoocDrivers.Where(x => x.Name.ToLower() == TenTaiXe.Trim().ToLower() && x.Active == 1 && x.CompanyCode == company_code).ToList();
                            if (driver == null || driver.Count == 0)
                            {
                                msg.Error = true;
                                msg.Title = "Tài xế không còn tồn tại trong hệ thống, vui lòng kiểm tra lại tên tài xế và trạng thái của tài xế";
                                return Json(msg);
                            }
                            var tractor = _context.RmRemoocTractors.FirstOrDefault(x => x.LicensePlate.ToLower() == bien_so.Trim().ToLower() && x.Flag == 1);
                            if (tractor == null)
                            {
                                msg.Error = true;
                                msg.Title = "Số xe không còn tồn tại trong hệ thống, vui lòng kiểm tra lại biển số xe và trạng thái của đầu kéo";
                                return Json(msg);
                            }
                            if (string.IsNullOrWhiteSpace(ma_remooc))
                            {
                                msg.Error = true;
                                msg.Title = "Mã remooc không được bỏ trống";
                                return Json(msg);
                            }
                            var remooc = _context.RmRemoocRemoocs.FirstOrDefault(x => x.LisencePlate.ToLower() == ma_remooc.Trim().ToLower() && x.FlagDelete == 1);
                            if (remooc == null)
                            {
                                msg.Error = true;
                                msg.Title = "Mooc không còn tồn tại trong hệ thống, vui lòng kiểm tra lại biển số remooc và trạng thái của remooc";
                                return Json(msg);
                            }
                            var driver_id = 0;
                            foreach (var item in driver)
                            {
                                if (tractor.Group != remooc.Group || tractor.Group != item.Group || remooc.Group != item.Group)
                                {
                                    msg.Error = true;
                                    msg.Title = "Mooc, đầu kéo và lái xe không cùng một nhóm. Mời xem lại";
                                    return Json(msg);
                                }
                                else driver_id = item.Id;

                            }
                            var a = _context.RmRemoocTrackings.LastOrDefault(x => x.TractorCode.ToLower() == bien_so.ToLower() && (x.Status == "CREATE" || x.Status == "START") && x.DriveId != driver_id);
                            var b = _context.RmRemoocTrackings.LastOrDefault(x => x.RemoocCode.ToLower() == ma_remooc.ToLower() && (x.Status == "CREATE" || x.Status == "START") && x.DriveId != driver_id);
                            // var a = _context.RmCommandOrderTrucks.FirstOrDefault(x => x.SoXe == bien_so && x.Active == "ON_WAY" && !x.TenTaiXe.Trim().ToLower().Contains(TenTaiXe.Trim().ToLower()));
                            //var b = _context.RmCommandOrderTrucks.FirstOrDefault(x => x.So_mooc == ma_remooc && x.Active == "ON_WAY" && !x.TenTaiXe.Trim().ToLower().Equals(TenTaiXe.Trim().ToLower()));

                            if (_context.RmRemoocTrackings.LastOrDefault(x => x.TractorCode == bien_so && x.RemoocCode == ma_remooc && (x.Status == "CREATE" || x.Status == "START") && x.DriveId != driver_id) != null)
                            {
                                msg.Error = true;
                                msg.Title = " Đầu kéo và Romooc đang trong chuyến đi.";
                                return Json(msg);
                            }
                            else if (a != null)
                            {

                                msg.Error = true;
                                msg.Title = "Đầu kéo đang trong chuyến đi.";
                                return Json(msg);


                            }

                            else if (b != null)
                            {

                                msg.Error = true;
                                msg.Title = "Romooc đang trong chuyến đi.";
                                return Json(msg);

                            }
                            var c = _context.RmCommandOrderTrucks.LastOrDefault(x => x.SoXe.ToLower() == bien_so.ToLower() && (x.Active == "CREATED" || x.Active == "NOTIFY" || x.Active == "BOOK") && !x.TenTaiXe.Trim().ToLower().Contains(TenTaiXe.Trim().ToLower()));
                            var d = _context.RmCommandOrderTrucks.LastOrDefault(x => x.SoMooc.ToLower() == ma_remooc.ToLower() && (x.Active == "CREATED" || x.Active == "NOTIFY" || x.Active == "BOOK") && !x.TenTaiXe.Trim().ToLower().Contains(TenTaiXe.Trim().ToLower()));
                            if (_context.RmCommandOrderTrucks.LastOrDefault(x => x.SoXe.ToLower() == bien_so.ToLower() && x.SoMooc.ToLower() == ma_remooc.ToLower() && (x.Active == "CREATED" || x.Active == "NOTIFY" || x.Active == "BOOK") && !x.TenTaiXe.Trim().ToLower().Contains(TenTaiXe.Trim().ToLower())) != null)
                            {
                                msg.Error = true;
                                msg.Title = " Đầu kéo và Romooc đã được gán điều độ cho tài xế khác";
                                return Json(msg);
                            }
                            else if (c != null)
                            {

                                msg.Error = true;
                                msg.Title = "Đầu kéo đã được gán điều độ cho tài xế khác";
                                return Json(msg);


                            }
                            else if (d != null)
                            {

                                msg.Error = true;
                                msg.Title = "Romooc đã được gán điều độ cho tài xế khác";
                                return Json(msg);

                            }
                            var obj_Command = await _context.RmCommandOrderTrucks.FirstOrDefaultAsync(x => x.MaTheoDoi.ToLower() == ma_theodoi.ToLower());
                            if (obj_Command == null)
                            {
                                if ((date - DateTime.Now.Date).Days >= 0)
                                {
                                    var command = new RmCommandOrderTruck
                                    {
                                        NgayDieuXe = ngay_dieu_xe,
                                        MaTheoDoi = ma_theodoi,
                                        Payment = payment,
                                        SoLenh = so_lenh,
                                        TenTaiXe = TenTaiXe,
                                        SoXe = bien_so,
                                        SoMooc = ma_remooc,
                                        Hang = hang,
                                        NoiLay = noi_lay,
                                        NoiHa = noi_ha,
                                        NoiXuatPhat = noi_lay,
                                        SoCont = SoCont,
                                        NgayGioDen = ngay_den,
                                        NgayGioDi = ngay_di,
                                        NeoMooc = neo_mooc,
                                        CauDuong = cau_duong,
                                        VeCong = ve_cong,
                                        PhiNgoai = phi_ngoai,
                                        Title = ghichu_khac,
                                        KhachHang = khachhang,
                                        DiaChi = diachi,
                                        PhuongAn = phuong_an,
                                        GhiChu = ghi_chu,
                                        KyXacNhan = ky_xac_nhan,
                                        NangCont = nang_cont,
                                        HaCont = ha_cont,
                                        KiemHoa = kiem_hoa,
                                        VeSinh = ve_sinh,
                                        LuuBai = luu_bai,
                                        PTGiaoCont = PT_giao_cont,
                                        LuuRong = luu_rong,
                                        ChiKhac = chiphi_khac,
                                        TongCong = tong_cong,
                                        Isdeleted = 1,
                                        Active = "CREATED", //Đã tạo lệnh điều động
                                        CreatedTime = DateTime.Now,
                                        CompanyCode = company_code,
                                        CreatedBy = ESEIM.AppContext.UserName
                                    };
                                    var MucDoUuTien = _context.RmCommandOrderTrucks.Where(x => x.TenTaiXe.ToLower().Equals(TenTaiXe.ToLower()) && DateTime.ParseExact(x.NgayDieuXe, formats, new CultureInfo("vi-VN"), DateTimeStyles.None).Date == date && x.Active != "ON_WAY" && x.Active != "COMPLETED" && x.Active != "DESTROY" && x.Active != "CANCEL" && (DateTime.Now - x.CreatedTime).Value.TotalMinutes <= 30).ToList();
                                    if (MucDoUuTien != null && MucDoUuTien.Count > 0)
                                    {

                                        MucDoUuTien.Add(command);
                                        msg.Title = "Đang có lệnh điều độ tới tài xế này trong khoảng 30ph trước. Mời nhập thứ tự ưu tiên.";
                                        msg.Error = true;
                                        msg.Object = MucDoUuTien;
                                        msg.Object2 = command;
                                        return Json(msg);
                                    }

                                    _context.RmCommandOrderTrucks.Add(command);
                                    await _context.SaveChangesAsync();
                                    msg.Error = false;
                                    msg.Title = "Import file thành công!";
                                    return Json(msg);
                                }
                                else
                                {
                                    msg.Error = true;
                                    msg.Title = "Ngày điều động không phải ngày hiện tại hoặc tương lai!";
                                    return Json(msg);
                                }
                            }
                            else
                            {
                                msg.Error = true;
                                msg.Title = "Mã theo dõi này đã tồn tại!";
                                return Json(msg);
                            }
                        }
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = "Incorrect format file ";
                        return Json(msg);
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "File upload is required";
                    return Json(msg);
                }
            }
            catch (Exception ex)
            {
                msg.Title = ex.Message;
                if (ex.Message.ToLower().Equals("String was not recognized as a valid DateTime.".ToLower()))
                {
                    msg.Title = "Nhập sai định dạng ngày tháng, vui lòng nhập lại";
                }
                msg.Error = true;
                return Json(msg);
            }

        }

        [HttpPost]
        public async Task<JsonResult> InsertCommand([FromBody]List<RmCommandOrderTruck> obj)
        {
            var msg = new JMessage() { Error = false, ID = 1 };
            try
            {
                foreach (var item in obj)
                {
                    if (item.MucDoUuTien != null && item.MucDoUuTien != 0)
                    {
                        var data = _context.RmCommandOrderTrucks.FirstOrDefault(x => x.Id == item.Id);
                        if (data != null)
                        {
                            data.MucDoUuTien = item.MucDoUuTien;
                            data.UpdatedTime = DateTime.Now;
                            _context.RmCommandOrderTrucks.Update(data);
                        }
                        else
                        {
                            item.CreatedTime = DateTime.Now;
                            _context.RmCommandOrderTrucks.Add(item);
                        }
                    }
                    else
                    {
                        msg.Title = "Không được bỏ trống thứ tự ưu tiên.";
                        msg.Error = true;
                        return Json(msg);
                    }
                }
                await _context.SaveChangesAsync();
                msg.Title = "Tải lệnh thành công";
                msg.Error = false;
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Title = "Tải lệnh lỗi. " + ex.Message;
                msg.Error = true;
                return Json(msg);
            }

        }
        [HttpPost]
        public async Task<JsonResult> Update([FromBody]RmCommandOrderTruck obj)
        {
            var msg = new JMessage() { Error = false, ID = 1 };
            try
            {
                var rs = _context.RmCommandOrderTrucks.FirstOrDefault(x => x.Id == obj.Id);
                if (rs != null)
                {
                    rs.NgayDieuXe = obj.NgayDieuXe;
                    rs.MaTheoDoi = obj.MaTheoDoi;
                    rs.Payment = obj.Payment;
                    rs.SoLenh = obj.SoLenh;
                    rs.TenTaiXe = obj.TenTaiXe;
                    rs.SoXe = obj.SoXe;
                    rs.SoMooc = obj.SoMooc;
                    rs.Hang = obj.Hang;
                    rs.NoiLay = obj.NoiLay;
                    rs.NoiHa = obj.NoiHa;
                    rs.SoCont = obj.SoCont;
                    rs.NgayGioDen = obj.NgayGioDen;
                    rs.NgayGioDi = obj.NgayGioDi;
                    rs.NeoMooc = obj.NeoMooc;
                    rs.CauDuong = obj.CauDuong;
                    rs.VeCong = obj.VeCong;
                    rs.PhiNgoai = obj.PhiNgoai;
                    rs.Title = obj.Title;
                    rs.KhachHang = obj.KhachHang;
                    rs.DiaChi = obj.DiaChi;
                    rs.PhuongAn = obj.PhuongAn;
                    rs.GhiChu = obj.GhiChu;
                    rs.KyXacNhan = obj.KyXacNhan;
                    rs.NangCont = obj.NangCont;
                    rs.HaCont = obj.HaCont;
                    rs.KiemHoa = obj.KiemHoa;
                    rs.VeSinh = obj.VeSinh;
                    rs.LuuBai = obj.LuuBai;
                    rs.PTGiaoCont = obj.PTGiaoCont;
                    rs.LuuRong = obj.LuuRong;
                    rs.ChiKhac = obj.ChiKhac;
                    rs.TongCong = obj.TongCong;
                    rs.NoiXuatPhat = obj.NoiXuatPhat;
                    _context.RmCommandOrderTrucks.Update(rs);
                    await _context.SaveChangesAsync();
                    msg.Title = "Sửa thông tin lệnh điều xe thành công";
                    msg.Error = false;
                    _actionLog.InsertActionLog("command_order_truck", "update tractors successfully", rs, obj, "Update");
                }
                else
                {
                    msg.Title = "Mã theo dõi này không tồn tại. Mời thử lại";
                    msg.Error = true;
                }
            }
            catch (Exception ex)
            {
                msg.ID = 0;
                msg.Error = true;
                msg.Object = ex;
                msg.Title = "Có lỗi khi sửa khoản mục" + ex;
                _actionLog.InsertActionLog("command_order_truck", "update Rtractor fail", null, obj, "Update");
            }
            return Json(msg);
        }
        [HttpGet]
        public ActionResult ExportRomooc(string startTime, string endTime)
        {
            DateTime LastUpdateFrom, LastUpdateTo;
            var start = "";
            var end = "";
            if (!string.IsNullOrEmpty(startTime))
                start = startTime;
            if (!string.IsNullOrEmpty(endTime))
                end = endTime;

            var hasDateFrom = DateTime.TryParseExact(start.Replace("-", "/"), "dd/MM/yyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out LastUpdateFrom);
            var hasDateTo = DateTime.TryParseExact(end.Replace("-", "/"), "dd/MM/yyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out LastUpdateTo);
            try
            {
                var query = from a in _context.RmCommandOrderTrucks
                            where a.CreatedBy == ESEIM.AppContext.UserName
                            && (hasDateFrom == false || (a.CreatedTime != null && a.CreatedTime.Value.Date >= LastUpdateFrom.Date))
                            && (hasDateTo == false || (a.CreatedTime != null && a.CreatedTime.Value.Date <= LastUpdateTo.Date))
                            select new
                            {
                                a.MaTheoDoi,
                                a.SoLenh,
                                a.TenTaiXe,
                                a.SoXe,
                                a.SoMooc,
                                a.SoCont,
                                a.NoiLay,
                                a.NoiHa,
                                a.KhachHang,
                                a.DiaChi,
                                a.CreatedTime
                            };
                var list = query.ToList();
                #region Create Worksheet
                ExcelEngine excelEngine = new ExcelEngine();
                IApplication application = excelEngine.Excel;
                application.DefaultVersion = ExcelVersion.Excel2010;
                IWorkbook workbook = application.Workbooks.Create(1);
                workbook.Version = ExcelVersion.Excel97to2003;
                IWorksheet sheetRequest = workbook.Worksheets.Create("Danh sách lệnh điều động");
                workbook.Worksheets[0].Remove();

                sheetRequest.Range["A1"].ColumnWidth = 24;
                sheetRequest.Range["B1"].ColumnWidth = 24;
                sheetRequest.Range["C1"].ColumnWidth = 24;
                sheetRequest.Range["D1"].ColumnWidth = 24;
                sheetRequest.Range["E1"].ColumnWidth = 24;
                sheetRequest.Range["F1"].ColumnWidth = 24;
                sheetRequest.Range["G1"].ColumnWidth = 24;
                sheetRequest.Range["H1"].ColumnWidth = 24;
                sheetRequest.Range["I1"].ColumnWidth = 24;
                sheetRequest.Range["J1"].ColumnWidth = 24;
                sheetRequest.Range["K1"].ColumnWidth = 24;

                sheetRequest.Range["A1:K1"].Merge(true);

                //Inserting sample text into the first cell of the first sheet.
                sheetRequest.Range["A1"].Text = "THỐNG KẾ LỊCH SỬ ĐIỀU ĐỘNG";
                sheetRequest.Range["A1"].CellStyle.Font.FontName = "Calibri";
                sheetRequest.Range["A1"].CellStyle.Font.Bold = true;
                sheetRequest.Range["A1"].CellStyle.Font.Size = 24;
                sheetRequest.Range["A1"].CellStyle.Font.RGBColor = Color.FromArgb(0, 0, 122, 192);
                sheetRequest.Range["A1"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

                sheetRequest.Range["A2"].ColumnWidth = 24;
                sheetRequest.Range["B2"].ColumnWidth = 24;
                sheetRequest.Range["C2"].ColumnWidth = 24;
                sheetRequest.Range["D2"].ColumnWidth = 24;
                sheetRequest.Range["E2"].ColumnWidth = 24;
                sheetRequest.Range["F2"].ColumnWidth = 24;
                sheetRequest.Range["G2"].ColumnWidth = 24;
                sheetRequest.Range["H2"].ColumnWidth = 24;
                sheetRequest.Range["I2"].ColumnWidth = 24;
                sheetRequest.Range["J2"].ColumnWidth = 24;
                sheetRequest.Range["K2"].ColumnWidth = 24;
                sheetRequest.Range["A2:K2"].Merge(true);

                //Inserting sample text into the first cell of the first sheet.
                sheetRequest.Range["A2"].Text = "Tài khoản tải lên: " + ESEIM.AppContext.UserName;
                sheetRequest.Range["A2"].CellStyle.Font.FontName = "Calibri";
                sheetRequest.Range["A2"].CellStyle.Font.Bold = true;
                sheetRequest.Range["A2"].CellStyle.Font.Size = 18;
                // sheetRequest.Range["A2"].CellStyle.Font.RGBColor = Color.FromArgb(0, 255, 255, 255);
                // sheetRequest.Range["A2"].HorizontalAlignment = ExcelHAlign.HAlignCenter;


                #endregion
                #region Define Styles
                IStyle tableHeader = workbook.Styles.Add("TableHeaderStyle");
                tableHeader.Font.Color = ExcelKnownColors.Black;
                tableHeader.Font.Bold = true;
                tableHeader.Font.Size = 11;
                tableHeader.Font.FontName = "Calibri";
                tableHeader.HorizontalAlignment = ExcelHAlign.HAlignCenter;
                tableHeader.VerticalAlignment = ExcelVAlign.VAlignCenter;
                // tableHeader.Color = Color.FromArgb(0, 0, 122, 192);
                tableHeader.Borders[ExcelBordersIndex.EdgeLeft].LineStyle = ExcelLineStyle.None;
                tableHeader.Borders[ExcelBordersIndex.EdgeRight].LineStyle = ExcelLineStyle.None;
                tableHeader.Borders[ExcelBordersIndex.EdgeTop].LineStyle = ExcelLineStyle.None;
                tableHeader.Borders[ExcelBordersIndex.EdgeBottom].LineStyle = ExcelLineStyle.None;
                tableHeader.Borders[ExcelBordersIndex.EdgeBottom].LineStyle = ExcelLineStyle.None;
                #endregion
                #region Create file name
                var fileName = "Lenh_Dieu_Dong_" + ESEIM.AppContext.UserName + "_" + DateTime.Now.ToString("dd-MM-yyyy_HH-mm-ss") + ".xls";
                #endregion
                sheetRequest.ImportData(list, 3, 1, true);
                #region Apply Styles
                sheetRequest["A3"].Text = "Mã theo dõi";
                sheetRequest["B3"].Text = "Sổ lệnh";
                sheetRequest["C3"].Text = "Tên tài xế";
                sheetRequest["D3"].Text = "Biển số xe";
                sheetRequest["E3"].Text = "Số remooc";
                sheetRequest["F3"].Text = "Số container";
                sheetRequest["G3"].Text = "Nơi lấy";
                sheetRequest["H3"].Text = "Nơi hạ";
                sheetRequest["I3"].Text = "Khách hàng";
                sheetRequest["J3"].Text = "Địa chỉ";
                sheetRequest["K3"].Text = "Ngày tải lên";

                sheetRequest["A3:K3"].CellStyle = tableHeader;
                sheetRequest.Range["H3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;
                #endregion

                #region Cell merging
                sheetRequest.Range["A3:K3"].RowHeight = 20;
                sheetRequest.UsedRange.AutofitColumns();
                string ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                #endregion
                MemoryStream ms = new MemoryStream();
                workbook.SaveAs(ms);
                workbook.Close();
                excelEngine.Dispose();
                ms.Position = 0;
                return File(ms, ContentType, fileName);
            }
            catch (Exception e)
            {
                return null;
            }
        }

        [HttpGet]
        public object GetItem(int? Id)
        {

            if (Id == null || Id < 0)
            {
                return Json("");
            }
            var a = _context.RmCommandOrderTrucks.AsNoTracking().Single(m => m.Id == Id);

            return Json(a);
        }

        [HttpPost]
        public object Delete(int id)
        {
            var msg = new JMessage { Error = true };
            try
            {
                var data = _context.RmCommandOrderTrucks.FirstOrDefault(x => x.Id == id);
                data.Isdeleted = 0;
                _context.RmCommandOrderTrucks.Update(data);
                _context.SaveChanges();
                msg.Error = false;
                msg.Title = "Xóa lệnh điều hướng thành công!";
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi xóa!";
                return Json(msg);
            }
        }


        private object Driver_Book(string MaTheoDoi)
        {
            var msg = new JMessage { Error = false };
            try
            {
                var data = _context.RmCommandOrderTrucks.FirstOrDefault(x => x.MaTheoDoi == MaTheoDoi);
                if (data.Active == "BOOK")
                {
                    msg.Object = data;
                    msg.ID = 0;
                    msg.Title = "Bạn đã nhận lệnh điều động này!";
                }
                else
                {
                    data.Active = "BOOK";
                    data.ConfirmType = "A";
                    data.ConfirmTime = DateTime.Now;
                    _context.RmCommandOrderTrucks.Update(data);
                    _context.SaveChanges();
                    msg.ID = 1;
                    msg.Title = "Lái xe đã nhận lệnh điều động!";
                    msg.Object = data;
                }

            }
            catch (Exception ex)
            {
                msg.Object = ex;
                msg.ID = 0;
                msg.Title = "Có lỗi xảy ra!";

            }
            return Json(msg);
        }

        [HttpPost]
        public object View_Driver_Book(int idUser)
        {
            //var msg = new JMessage() { Error = false };

            var query = from a in _context.RmCommandOrderTrucks
                        join b in _context.RmRomoocDrivers on a.TenTaiXe.Trim() equals b.Name.Trim()
                        where b.Id == idUser && a.Active == "BOOK" && DateTime.ParseExact(a.NgayDieuXe, formats, new CultureInfo("en-US"), DateTimeStyles.None).Date >= DateTime.Now.Date
                        // where (jTablePara.UserName == "" || a.UserName.ToLower().Contains(jTablePara.UserName.ToLower()))
                        select new
                        {
                            id = a.Id,
                            matheodoi = a.MaTheoDoi,
                            ngaydieuxe = a.NgayDieuXe,
                            tentaixe = a.TenTaiXe,
                            sodaukeo = a.SoXe,
                            somooc = a.SoMooc,
                            tenkh = a.KhachHang,
                            diachikh = a.DiaChi,
                            noixuatphat = a.NoiXuatPhat,
                            noilay = a.NoiLay,
                            noiha = a.NoiHa,
                            containercode = a.SoCont,
                            phuong_an = a.PhuongAn,
                            ghi_chu = a.GhiChu,
                            Muc_Do_Uu_Tien = a.MucDoUuTien
                        };
            var result = query.OrderByDescending(x => x.id);
            return Json(result);
        }
        [HttpPost]
        public object rollback(int id)
        {
            var msg = new JMessage() { Error = false };
            var data = _context.RmCommandOrderTrucks.FirstOrDefault(x => x.Id == id);
            if (data != null)
            {
                if (data.Active != "ON_WAY" || data.Active != "COMPLETED")
                {
                    data.Active = "DESTROY";
                    _context.RmCommandOrderTrucks.Update(data);
                    _context.SaveChanges();
                    msg.Error = false;
                    msg.Title = "Thu hồi lệnh điều độ thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Lái xe đang di chuyển hoặc đã hoàn thành, không thể thu hồi!";
                }
            }
            else
            {
                msg.Error = true;
                msg.Title = "Lệnh điều độ này không tồn tại, vui lòng làm mới trang";
            }
            return Json(msg);
        }


        [HttpPost]
        public object Driver_Cancel_Or_Book(string MaTheoDoi, string key)
        {

            return Driver_Cancel(MaTheoDoi, key);

        }
        private object Driver_Cancel(string MaTheoDoi, string key)
        {
            var msg = new JMessage { Error = false };
            try
            {
                var data = _context.RmCommandOrderTrucks.FirstOrDefault(x => x.MaTheoDoi == MaTheoDoi);
                var a = DateTime.ParseExact(data.NgayDieuXe, formats, new CultureInfo("en-US"), DateTimeStyles.None);
                if (DateTime.ParseExact(data.NgayDieuXe, formats, new CultureInfo("en-US"), DateTimeStyles.None).Date >= DateTime.Now.Date)
                {
                    if (key.ToLower().Equals("cancel"))
                    {
                        data.Active = "CANCEL";
                        data.ConfirmType = "D";
                        data.ConfirmTime = DateTime.Now;
                        _context.RmCommandOrderTrucks.Update(data);
                        _context.SaveChanges();
                        msg.ID = 1;
                        msg.Title = "Lái xe đã hủy lệnh điều động!";
                        msg.Object = data;
                    }
                    else
                    {
                        if (data.Active == "BOOK")
                        {

                            msg.Title = "Lái xe đã hủy lệnh điều động!";
                            msg.Object = data;
                        }
                        else
                        {
                            data.Active = "BOOK";
                            data.ConfirmType = "A";
                            data.ConfirmTime = DateTime.Now;
                            _context.RmCommandOrderTrucks.Update(data);
                            _context.SaveChanges();
                            msg.ID = 1;
                            msg.Title = "Lái xe đã nhận lệnh điều động!";
                            msg.Object = data;
                        }
                    }



                }
                else
                {
                    msg.ID = 0;
                    msg.Title = "Lái xe không được hủy lệnh điều động này!";
                    msg.Object = data;
                }
            }
            catch (Exception ex)
            {
                msg.Object = ex;
                msg.ID = 0;
                msg.Title = "Có lỗi!";

            }
            return Json(msg);
        }

        [HttpPost]
        public object DeleteItems([FromBody]List<int> listIdI)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                foreach (var id in listIdI)
                {
                    var obj = _context.RmCommandOrderTrucks.FirstOrDefault(x => x.Id == id);
                    if (obj != null)
                    {

                        obj.Isdeleted = 0;
                        _context.RmCommandOrderTrucks.Update(obj);
                        _context.SaveChanges();
                    }
                }
                msg.Title = "Xóa lệnh điều hướng thành công!";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(CommonUtil.ResourceValue("MSG_DELETE_LIST_FAIL"), CommonUtil.ResourceValue("RESOURCE"));
            }
            return Json(msg);
        }

        [HttpPost]
        public async Task<JsonResult> SendPushNotification([FromBody]Mess obj)
        {
            var msg = new JMessage() { Error = true };
            try
            {
                var obj2 = _context.RmRemoocFcms.Where(x => x.UserId == obj.User_id).ToList();
                var dataa = _context.RmCommandOrderTrucks.FirstOrDefault(x => x.MaTheoDoi == obj.MaTheoDoi);

                if (obj2 != null && obj2.Count > 0)
                {
                    if (dataa.Active.Equals("ON_WAY"))
                    {
                        foreach (var i in obj2)
                        {

                            try
                            {
                                var applicationID = "AAAAQTp7NQ0:APA91bHsBv08eWtw-TsvFRteTcrd9KF8cH5rHKlWuQnvd7_a7UKMbGso4oxctp-Jes28fFmBvkIhUT8ehHw-gkDXH6PxhVbv-m4fvUdZRvpPur57psho9-37FTlrzqZQnf0vESUrj6bT";
                                var senderId = "280154027277";

                                using (var client = new HttpClient())
                                {
                                    //do something with http client
                                    client.BaseAddress = new Uri("https://fcm.googleapis.com");
                                    client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                                    client.DefaultRequestHeaders.TryAddWithoutValidation("Authorization", $"key={applicationID}");
                                    client.DefaultRequestHeaders.TryAddWithoutValidation("Sender", $"id={senderId}");

                                    var data = new
                                    {
                                        to = i.Token,
                                        notification = new
                                        {
                                            body = obj.Message,
                                            icon = "myicon",
                                            sound = "beep.aiff"
                                        },
                                        data = new
                                        {
                                            body = obj.Message,
                                            title = obj.Title,
                                            icon = "myicon",
                                            sound = "beep.aiff"
                                        },
                                        priority = "high",
                                    };

                                    var json = JsonConvert.SerializeObject(data);
                                    var httpContent = new StringContent(json, Encoding.UTF8, "application/json");

                                    var result = await client.PostAsync("/fcm/send", httpContent);
                                }
                            }

                            catch (Exception ex)
                            {
                                msg.Error = true;
                                msg.Title = "Send Fail!";

                            }

                        }
                        dataa.Active = "DESTROY";
                        _context.RmCommandOrderTrucks.Update(dataa);

                        var data_msg = new RmRemoocFcmMesage();
                        data_msg.CreateTime = DateTime.Now;
                        data_msg.UserId = obj.User_id;
                        data_msg.Message = obj.Message;
                        data_msg.Title = obj.Title;
                        _context.RmRemoocFcmMesages.Add(data_msg);
                        await _context.SaveChangesAsync();
                        _context.SaveChanges();


                        msg.Error = false;
                        msg.Title = "Đã gửi thông báo tới tài xế!";
                        return Json(msg);
                    }
                    else
                    {
                        if (DateTime.ParseExact(dataa.NgayDieuXe, formats, new CultureInfo("en-US"), DateTimeStyles.None).Date >= DateTime.Now.Date)
                        {
                            var dt = DateTime.ParseExact(dataa.NgayDieuXe, formats, new CultureInfo("en-US"), DateTimeStyles.None).Date;
                            foreach (var i in obj2)
                            {

                                try
                                {
                                    var applicationID = "AAAAQTp7NQ0:APA91bHsBv08eWtw-TsvFRteTcrd9KF8cH5rHKlWuQnvd7_a7UKMbGso4oxctp-Jes28fFmBvkIhUT8ehHw-gkDXH6PxhVbv-m4fvUdZRvpPur57psho9-37FTlrzqZQnf0vESUrj6bT";
                                    var senderId = "280154027277";

                                    using (var client = new HttpClient())
                                    {
                                        //do something with http client
                                        client.BaseAddress = new Uri("https://fcm.googleapis.com");
                                        client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                                        client.DefaultRequestHeaders.TryAddWithoutValidation("Authorization", $"key={applicationID}");
                                        client.DefaultRequestHeaders.TryAddWithoutValidation("Sender", $"id={senderId}");

                                        var data = new
                                        {
                                            to = i.Token,
                                            notification = new
                                            {
                                                body = obj.Message,
                                                icon = "myicon",
                                                sound = "beep.aiff"
                                            },
                                            data = new
                                            {
                                                body = obj.Message,
                                                title = obj.Title,
                                                icon = "myicon",
                                                sound = "beep.aiff"
                                            },
                                            priority = "high",
                                        };

                                        var json = JsonConvert.SerializeObject(data);
                                        var httpContent = new StringContent(json, Encoding.UTF8, "application/json");

                                        var result = await client.PostAsync("/fcm/send", httpContent);
                                    }
                                }

                                catch (Exception ex)
                                {
                                    msg.Error = true;
                                    msg.Title = "Send Fail!";

                                }

                            }
                        }
                        else
                        {
                            msg.Error = true;
                            msg.Title = "Ngày điều động phải là ngày hiện tại hoặc trong tương lai!";
                            return Json(msg);
                        }
                        dataa.Active = "NOTIFY";
                        _context.RmCommandOrderTrucks.Update(dataa);

                        var data_msg = new RmRemoocFcmMesage();
                        data_msg.CreateTime = DateTime.Now;
                        data_msg.UserId = obj.User_id;
                        data_msg.Message = obj.Message;
                        data_msg.Title = obj.Title;
                        _context.RmRemoocFcmMesages.Add(data_msg);
                        await _context.SaveChangesAsync();
                        _context.SaveChanges();


                        msg.Error = false;
                        msg.Title = "Đã gửi lệnh tới tài xế!";
                        return Json(msg);
                    }

                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Không thể gửi thông báo đến tài xế này, vui lòng đăng nhập vào ứng dụng bằng tài khoản này trước!";
                    return Json(msg);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = ex.Message;
                return Json(msg);
            }


        }

        [HttpPost]
        public object GetDriver(int id)
        {
            var session = HttpContext.GetSessionUser();
            var msg = new JMessage() { Error = true };
            try
            {
                var command = _context.RmCommandOrderTrucks.FirstOrDefault(x => x.Id == id);

                if (command.Active.Contains("BOOK") || command.Active.Contains("COMPLETED") || command.Active.Contains("NOTIFY") || command.Active.Contains("ON_WAY"))
                {
                    msg.Error = true;
                    msg.Title = "Chỉ được gửi notify những lệnh điều độ mới khởi tạo, đã thu hồi hoặc đã bị tài xế từ chối";
                    return Json(msg);
                }

                var Lai_Xe = _context.RmRomoocDrivers.Where(x => x.Active == 1 && x.CompanyCode == session.CompanyCode && x.Name.Trim().ToLower().Equals(command.TenTaiXe.Trim().ToLower())).FirstOrDefault();
                if (Lai_Xe == null)
                {
                    msg.Error = true;
                    msg.Title = "Không tìm thấy thông tin của tài xế để gửi lệnh điều độ. Mời xem lại!";
                    return Json(msg);
                }

                else
                {
                    msg.Error = false;
                    msg.Object = Lai_Xe;
                    msg.Title = command.MaTheoDoi;
                    return Json(msg);
                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = ex.Message;
                return Json(msg);
            }

        }

        [HttpPost]
        public object GetOrderTruck(string MaTheoDoi)
        {
            var msg = new JMessage { Error = false };
            try
            {
                var data = _context.RmCommandOrderTrucks.Where(x => x.MaTheoDoi == MaTheoDoi).OrderByDescending(x => x.Id).ToList();

                return Json(data);

            }
            catch (Exception ex)
            {
                msg.Object = ex;
                msg.ID = 0;
                msg.Title = "Có lỗi!";
                return Json(msg);
            }

        }

        [HttpPost]
        public object GetCommandByUserName(string display_name)
        {
            var msg = new JMessage { Error = false };
            try
            {
                var data = _context.RmCommandOrderTrucks.Where(x => x.TenTaiXe == display_name && x.Active == "NOTIFY").OrderByDescending(x => x.Id).ToList();
                msg.Object = data;
            }
            catch (Exception ex)
            {
                msg.Object = ex;
                msg.ID = 0;
                msg.Title = "Có lỗi!";

            }
            return Json(msg);

        }
    }

    public class JMessageExtend : JMessage
    {
        public object Object2 { get; set; }
    }
}