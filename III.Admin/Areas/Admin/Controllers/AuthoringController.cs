using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Syncfusion.XlsIO;
using System.IO;
using Syncfusion.Drawing;
using III.Domain.Enums;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class AuthoringController : BaseController
    {
        public class SearchModel : JTableModel
        {
            public string UserName { get; set; }
        }
        public class JTableModelDocumentCustom : JTableModel
        {
            public int? Id { set; get; }
        }
        public class IncomingDispatchesJtable : JTableModel
        {
            public string Number { get; set; }
            public string FromDate { get; set; }
        }
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        public AuthoringController(EIMDBContext context, IUploadService upload)
        {
            _context = context;
            _upload = upload;
        }
        public IActionResult Index()
        {
            return View();
        }
        [HttpPost]
        public object JTable([FromBody]SearchModel jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var user = _context.Users.FirstOrDefault(x => x.UserName == ESEIM.AppContext.UserName);
            var query = from a in _context.AdAuthorings
                        join b in _context.Users on a.ToUser equals b.Id into b2
                        from b1 in b2.DefaultIfEmpty()
                        join c in _context.Users on a.FromUser equals c.Id into c2
                        from c1 in c2.DefaultIfEmpty()
                        where (a.FromUser == user.Id
                        || a.ToUser == user.Id)
                        && (string.IsNullOrEmpty(jTablePara.UserName) || (b1 != null && b1.GivenName.ToLower().Contains(jTablePara.UserName.ToLower())))
                        select new AuthoringListResponse
                        {
                            Id = a.Id,
                            GivenName = b1 != null ? b1.GivenName : "",
                            FromDate = a.FromDate.Value != null ? a.FromDate.Value.ToString("dd/MM/yyyy") : "",
                            ToDate = a.ToDate.Value != null ? a.ToDate.Value.ToString("dd/MM/yyyy") : "",
                            FromUser = a.FromUser,
                            ToUser = a.ToUser,
                            Confirm = a.Confirm,
                            SendByMe = false,
                            GivenName1 = c1 != null ? c1.GivenName : "",
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression("Id DESC").Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();

            foreach (var item in data)
            {
                if (item.FromUser == user.Id)
                    item.SendByMe = true;
                item.Status = item.SendByMe + "-" + item.Confirm;
            }
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "ID", "GivenName", "FromDate", "ToDate", "FromUser", "ToUser", "Confirm", "SendByMe", "GivenName1", "Status");
            return Json(jdata);
        }
        [HttpPost]
        public JsonResult Insert([FromBody]AuthoringInsert obj)
        {
            var msg = new JMessage { Title = "", Error = false };
            try
            {
                var user = _context.Users.FirstOrDefault(x => x.UserName == ESEIM.AppContext.UserName);
                var list = _context.AdAuthorings.Where(x => x.FromUser == user.Id);
                if (list.Count() == 0)
                {
                    DateTime? fromDate = !string.IsNullOrEmpty(obj.FromDate) ? DateTime.ParseExact(obj.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                    DateTime? toDate = !string.IsNullOrEmpty(obj.ToDate) ? DateTime.ParseExact(obj.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                    if (fromDate != null && toDate != null)
                    {
                        var Authoring = new AdAuthoring();
                        Authoring.FromUser = user.Id;
                        Authoring.ToUser = obj.ToUser;
                        Authoring.FromDate = fromDate;
                        Authoring.ToDate = toDate;
                        Authoring.CreatedDate = DateTime.Now;
                        Authoring.Confirm = "N";
                        _context.AdAuthorings.Add(Authoring);
                        _context.SaveChanges();
                        msg.Title = String.Format(CommonUtil.ResourceValue("AUTHORING_MSG_AUTHORING_SUCCESS"));//"Ủy quyền thành công";
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = String.Format(CommonUtil.ResourceValue("AUTHORING_MSG_FORMAT_DATE_MONTH")); //"Vui lòng nhập nhập đúng định dạng ngày tháng";
                    }

                }
                else
                {
                    DateTime? fromDate = !string.IsNullOrEmpty(obj.FromDate) ? DateTime.ParseExact(obj.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

                    DateTime? toDate = !string.IsNullOrEmpty(obj.ToDate) ? DateTime.ParseExact(obj.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                    var isIn = false;
                    if (fromDate != null && toDate != null)
                    {
                        foreach (var old in list)
                        {

                            if (
                                (fromDate.Value.Date <= old.FromDate.Value.Date && old.FromDate.Value.Date <= toDate.Value.Date) ||
                                (fromDate.Value.Date <= old.ToDate.Value.Date && old.ToDate.Value.Date <= toDate.Value.Date) ||
                                (
                                    old.FromDate.Value.Date <= fromDate.Value.Date &&
                                    fromDate.Value.Date <= toDate.Value.Date &&
                                    toDate.Value.Date <= old.ToDate.Value.Date
                                )
                              )
                            {
                                isIn = true;
                                break;
                            }
                        }
                        if (!isIn)
                        {
                            var Authoring = new AdAuthoring();
                            Authoring.FromUser = user.Id;
                            Authoring.ToUser = obj.ToUser;
                            Authoring.FromDate = fromDate;
                            Authoring.ToDate = toDate;
                            Authoring.CreatedDate = DateTime.Now;
                            Authoring.Confirm = "N";
                            _context.AdAuthorings.Add(Authoring);
                            _context.SaveChanges();
                            msg.Title = String.Format(CommonUtil.ResourceValue("AUTHORING_MSG_AUTHORING_SUCCESS"));//"Ủy quyền thành công";
                        }
                        else
                        {
                            msg.Error = true;
                            msg.Title = String.Format(CommonUtil.ResourceValue("AUTHORING_MSG_TIME_AUTHORING"));//"Khoảng thời gian lựa chọn đã ủy quyền cho cá nhân khác. Vui lòng chọn lại thời gian";
                        }
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = String.Format(CommonUtil.ResourceValue("AUTHORING_MSG_FORMAT_DATE_MONTH")); //"Vui lòng nhập nhập đúng định dạng ngày tháng";
                    }

                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("AUTHORING_MSG_ERROR_AUTHORING")); //"Có lỗi khi ủy quyền";
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult Update([FromBody]AuthoringInsert obj)
        {
            var msg = new JMessage { Title = "", Error = false };
            try
            {
                var data = _context.AdAuthorings.FirstOrDefault(x => x.Id == obj.Id);
                if (data != null)
                {
                    var user = _context.Users.FirstOrDefault(x => x.UserName == ESEIM.AppContext.UserName);
                    var list = _context.AdAuthorings.Where(x => x.FromUser == user.Id);
                    DateTime? fromDate = !string.IsNullOrEmpty(obj.FromDate) ? DateTime.ParseExact(obj.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

                    DateTime? toDate = !string.IsNullOrEmpty(obj.ToDate) ? DateTime.ParseExact(obj.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                    var isIn = false;
                    if (fromDate != null && toDate != null)
                    {
                        foreach (var old in list)
                        {
                            if (obj.Id != old.Id)
                            {
                                if (
                                (fromDate.Value.Date <= old.FromDate.Value.Date && old.FromDate.Value.Date <= toDate.Value.Date) ||
                                (fromDate.Value.Date <= old.ToDate.Value.Date && old.ToDate.Value.Date <= toDate.Value.Date) ||
                                (
                                    old.FromDate.Value.Date <= fromDate.Value.Date &&
                                    fromDate.Value.Date <= toDate.Value.Date &&
                                    toDate.Value.Date <= old.ToDate.Value.Date
                                )
                              )
                                {
                                    isIn = true;
                                    break;
                                }
                            }

                        }
                        if (!isIn)
                        {
                            if (data.ToUser != obj.ToUser)
                                data.Confirm = "N";
                            data.ToUser = obj.ToUser;
                            data.FromDate = fromDate;
                            data.ToDate = toDate;
                            _context.AdAuthorings.Update(data);
                            _context.SaveChanges();
                            msg.Title = String.Format(CommonUtil.ResourceValue("AUTHORING_MSG_UPDATE_SUCCESS")); // "Cập nhật thành công";
                        }
                        else
                        {
                            msg.Error = true;
                            msg.Title = String.Format(CommonUtil.ResourceValue("AUTHORING_MSG_TIME_AUTHORING"));// "Khoảng thời gian lựa chọn đã ủy quyền cho cá nhân khác. Vui lòng chọn lại thời gian";
                        }
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = String.Format(CommonUtil.ResourceValue("AUTHORING_MSG_FORMAT_DATE_MONTH")); //"Vui lòng nhập nhập đúng định dạng ngày tháng";
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("AUTHORING_MSG_NOT_FIND_AUTHORIZED")); //"Không tìm thấy mục ủy quyền này, vui lòng làm mới trang";
                }
            }
            catch (Exception exx)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("AUTHORING_MSG_UPDATE_ERROR")); //"Cập nhật bị lỗi";
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult CheckIsTP()
        {
            JMessage msg = new JMessage();
            var user = _context.Users.FirstOrDefault(x => x.UserName == ESEIM.AppContext.UserName);
            var deparment = _context.AdUserInGroups.FirstOrDefault(x => x.UserId == user.Id);
            if (deparment != null)
            {
                var data = _context.DispatchesUsers.FirstOrDefault(x => x.GroupUserCode == deparment.GroupUserCode);
                if (data != null)
                {
                    if (data.UserId == user.Id)
                        msg.Object = 1;
                    else
                        msg.Object = 0;
                }
                else
                {
                    msg.Object = 0;
                }

            }
            else
                msg.Object = 0;
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateAuthoring(int Id)
        {
            var msg = new JMessage { Title = "", Error = false };
            try
            {
                var data = _context.AdAuthorings.FirstOrDefault(x => x.Id == Id);
                if (data != null)
                {

                    data.Confirm = "Y";
                    _context.AdAuthorings.Update(data);
                    _context.SaveChanges();
                    msg.Title = String.Format(CommonUtil.ResourceValue("AUTHORING_MS_CONFIRM_AUTHORING")); // "Đã xác nhận nhận ủy quyền";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("AUTHORING_MSG_NOT_FIND_AUTHORIZED")); //"Không tìm thấy mục ủy quyền này, vui lòng làm mới trang";
                }
            }
            catch (Exception exx)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("AUTHORING_MSG_UPDATE_ERROR")); //"Cập nhật bị lỗi";
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetDispatchesUser()
        {
            var user = _context.Users.FirstOrDefault(x => x.UserName == ESEIM.AppContext.UserName);
            var deparment = _context.AdUserInGroups.FirstOrDefault(x => x.UserId == user.Id);
            var query = from a in _context.AdUserInGroups
                        join b in _context.Users on a.UserId equals b.Id into b2
                        from b1 in b2.DefaultIfEmpty()
                        where a.GroupUserCode == deparment.GroupUserCode
                        && a.UserId != user.Id
                        select new
                        {
                            a,
                            b1
                        };

            var list = query.ToList();
            List<DispatchesUser1> list1 = new List<DispatchesUser1>();

            foreach (var item in list)
            {
                if (item.b1 != null)
                {
                    DispatchesUser1 dt = new DispatchesUser1();
                    dt.Id = item.b1.Id;
                    dt.GivenName = item.b1.GivenName;
                    list1.Add(dt);
                }
            }
            return Json(list1);
        }


        [HttpPost]
        public JsonResult Delete(int Id)
        {
            var mess = new JMessage { Error = false, Title = "" };
            try
            {

                var data = _context.AdAuthorings.FirstOrDefault(x => x.Id == Id);
                _context.Remove(data);
                _context.SaveChanges();
                mess.Title = String.Format(CommonUtil.ResourceValue("AUTHORING_MSG_DELETE_SUCCESS")); //"Xóa thành công";
            }
            catch (Exception ex)
            {
                mess.Title = String.Format(CommonUtil.ResourceValue("AUTHORING_MSG_DELETE_ERROR")); //"Xóa bị lỗi";
                mess.Error = true;
            }
            return Json(mess);
        }

        [HttpPost]
        public JsonResult GetItem(int Id)
        {
            var data = (from a in _context.AdAuthorings
                        where a.Id == Id
                        select new AuthoringResponse
                        {
                            id = a.Id,
                            ToUser = a.ToUser,
                            FromDate = a.FromDate,
                            ToDate = a.ToDate
                        }).FirstOrDefault();
            return Json(data);
        }



        [HttpPost]
        public object JTableDocumentByAuthoringId([FromBody]JTableModelDocumentCustom jTablePara)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var getAuthoring = _context.AdAuthorings.FirstOrDefault(x => x.Id == jTablePara.Id);
                if (getAuthoring == null)
                {
                    var list = new List<string>();
                    var jdata = JTableHelper.JObjectTable(list, jTablePara.Draw, 0, "Id", "DocumentNumber", "DocumentSymbol", "FromDate", "DocumentName", "Origanization", "DeadLine", "Status", "CreatedTime", "Note");
                    return Json(jdata);
                }
                else
                {
                    var listProcessCode = _context.DispatchesMemberActivitys.Where(x => x.UserId == getAuthoring.ToUser && (x.CreatedTime.HasValue && getAuthoring.FromDate.HasValue && x.CreatedTime.Value.Date >= getAuthoring.FromDate.Value.Date && x.CreatedTime.Value.Date <= getAuthoring.ToDate.Value.Date)).Select(x => new
                    {
                        x.ProcessCode,
                    }).Distinct();
                    var listDispatchCode = _context.DispatchTrackingProcesss.Where(x => listProcessCode.Any(y => y.ProcessCode == x.ProcessCode)).Select(x => new
                    {
                        x.DispatchCode,
                    }).Distinct();
                    var listDispatchches = _context.DispatchesHeaders.Where(x => listDispatchCode.Any(y => y.DispatchCode == x.DispatchCode) && x.Type != EnumHelper<DocumentTypeEnum>.GetDisplayValue(DocumentTypeEnum.OBT)).Select(x => new
                    {
                        x.Id,
                        x.DocumentNumber,
                        x.DocumentSymbol,
                        x.FromDate,
                        x.Origanization,
                        x.Status,
                        x.CreatedTime,
                        x.Note
                    }).AsNoTracking().ToList();
                    var count = listDispatchches.Count();
                    var jdata = JTableHelper.JObjectTable(listDispatchches, jTablePara.Draw, count, "Id", "DocumentNumber", "DocumentSymbol", "FromDate", "DocumentName", "Origanization", "DeadLine", "Status", "CreatedTime", "Note");
                    return Json(jdata);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("AUTHORING_MSG_VIEW_ACTIVITIES_ERROR")); //"Có lỗi khi xem hoạt động người ủy quyền";
            }
            return Json(msg);
        }

        [HttpPost]
        public object Flow([FromBody]int id)
        {
            var model = new IncommingDispatchesResponseModel();
            var userId = ESEIM.AppContext.UserId;
            var data = _context.DispatchesHeaders.FirstOrDefault(x => x.Id == id);

            //tracking User
            var tracking = _context.DispatchTrackingProcesss.FirstOrDefault(x => x.DispatchCode == data.DispatchCode);

            //File
            var listFile = _context.DispatchesFileACTs.Where(x => x.ProcessCode == tracking.ProcessCode).Select(y => new IncommingDispatchesFile
            {
                Id = y.Id,
                User = y.User.GivenName,
                FileName = y.FileName,
                Fomart = y.Fomart,
                Source = y.Soure,
                CreatedTime = y.CreatedTime,
                IsShowDelete = false
            }).AsNoTracking();
            model.Detail.ListFile.AddRange(listFile);

            //groupUser
            var listDispatchesMember = _context.DispatchesMemberActivitys.Where(x => x.ProcessCode == tracking.ProcessCode);
            var listMember = listDispatchesMember.Where(x => x.ProcessCode == tracking.ProcessCode).Select(x => new IncommingDispatchesMember
            {
                Id = x.Id,
                Assigner = x.Assigner,
                AssignerName = _context.Users.FirstOrDefault(y => y.Id == x.Assigner).GivenName ?? null,
                AssignerGroupUserName = _context.AdGroupUsers.Join(_context.AdUserInGroups.Where(y => y.UserId == x.Assigner), post => post.GroupUserCode, meta => meta.GroupUserCode, (post, meta) => post.Title).AsNoTracking().FirstOrDefault(),
                GroupUserName = _context.AdGroupUsers.Join(_context.AdUserInGroups.Where(y => y.UserId == x.UserId), post => post.GroupUserCode, meta => meta.GroupUserCode, (post, meta) => post.Title).AsNoTracking().FirstOrDefault(),
                Name = x.User.GivenName,
                UserId = x.UserId,
                CreatedTime = x.CreatedTime,
                Role = x.Role,
                Status = (x.UserId.Equals(userId) && x.Role == 2 && x.AssigneeConfirm == EnumHelper<DocumentStatusEnum>.GetDisplayValue(DocumentStatusEnum.Review)) ? null : x.AssigneeConfirm,
                Comment = x.Comment
            }).OrderBy(x => x.Id).AsNoTracking();
            model.Detail.ListMember.AddRange(listMember);
            return model;
        }


        [HttpGet]
        public ActionResult ExportFlow(int id)
        {
            //var logger = LogManager.GetLogger(typeof(Program));
            //logger.Info("1 - Bat dau lay list export");

            var userId = ESEIM.AppContext.UserId;
            var data = _context.DispatchesHeaders.FirstOrDefault(x => x.Id == id);

            //tracking User
            var tracking = _context.DispatchTrackingProcesss.FirstOrDefault(x => x.DispatchCode == data.DispatchCode);

            //groupUser
            var listDispatchesMember = _context.DispatchesMemberActivitys.Where(x => x.ProcessCode == tracking.ProcessCode);
            var listMember = listDispatchesMember.Where(x => x.ProcessCode == tracking.ProcessCode).Select(x => new IncommingDispatchesMember
            {
                Id = x.Id,
                Assigner = x.Assigner,
                AssignerName = _context.Users.FirstOrDefault(y => y.Id == x.Assigner).GivenName ?? null,
                AssignerGroupUserName = _context.AdGroupUsers.Join(_context.AdUserInGroups.Where(y => y.UserId == x.Assigner), post => post.GroupUserCode, meta => meta.GroupUserCode, (post, meta) => post.Title).AsNoTracking().FirstOrDefault(),
                GroupUserName = _context.AdGroupUsers.Join(_context.AdUserInGroups.Where(y => y.UserId == x.UserId), post => post.GroupUserCode, meta => meta.GroupUserCode, (post, meta) => post.Title).AsNoTracking().FirstOrDefault(),
                Name = x.User.GivenName,
                UserId = x.UserId,
                CreatedTime = x.CreatedTime,
                Role = x.Role,
                //IsShowComment = x.Assigner.Equals(userId) ? true : false,
                //IsShowDelete = false,
                //IsShowAction = x.UserId.Equals(userId) ? true : false,
                Status = (x.UserId.Equals(userId) && x.Role == 2 && x.AssigneeConfirm == EnumHelper<DocumentStatusEnum>.GetDisplayValue(DocumentStatusEnum.Review)) ? null : x.AssigneeConfirm,
                Comment = x.Comment
            }).OrderBy(x => x.Id).AsNoTracking();


            var listExport = listMember.ToList().Select(a => new ExportFlowModel
            {
                AssignerName = a.AssignerName + " - " + a.AssignerGroupUserName,
                Name = a.Name + " - " + a.GroupUserName,
                Comment = a.Comment,
                CreatedTime = a.CreatedTime.Value.ToString("dd/MM/yyyy"),
                Role = a.Role == 1 ? "Xử lý chính" : a.Role == 2 ? "Phối hợp" : "Xem để biết",
                Status = a.Status == "DONE" ? "Đã hoàn tất"
                         : a.Status == "SEND" ? "Đã chuyển xử lý chính"
                         : a.Status == "ADD_SEND" ? "Đã chuyển"
                         : a.Status == "SEND_COORDINATED" ? "Đã chuyển phối hợp"
                         : a.Status == "UPDATED" ? "Đã cập nhật"
                         : a.Status == "COORDINATED" ? "Đã phối hợp"
                         : a.Status == "PROCESSING" ? "Đang xử lý"
                         : a.Status == "NOCOORDINATED" ? "Chưa phối hợp"
                         : a.Status == null ? "Chưa xem"
                         : a.Status == "" ? "Chưa chuyển"
                         : "Đã xem"
            }).ToList();

            ExcelEngine excelEngine = new ExcelEngine();
            IApplication application = excelEngine.Excel;
            application.DefaultVersion = ExcelVersion.Excel2010;

            IWorkbook workbook = application.Workbooks.Create(1);
            workbook.Version = ExcelVersion.Excel97to2003;
            IWorksheet sheetRequest = workbook.Worksheets.Create("Sheet2");
            workbook.Worksheets[0].Remove();
            IMigrantRange migrantRange = workbook.Worksheets[0].MigrantRange;
            sheetRequest.Range["A1"].ColumnWidth = 24;
            sheetRequest.Range["B1"].ColumnWidth = 24;
            sheetRequest.Range["C1"].ColumnWidth = 24;
            sheetRequest.Range["D1"].ColumnWidth = 24;
            sheetRequest.Range["E1"].ColumnWidth = 24;
            sheetRequest.Range["F1"].ColumnWidth = 24;

            sheetRequest.Range["A1:F1"].Merge(true);

            sheetRequest.Range["A1"].Text = "Các hoạt động xử lý công văn";
            sheetRequest.Range["A1"].CellStyle.Font.FontName = "Calibri";
            sheetRequest.Range["A1"].CellStyle.Font.Bold = true;
            sheetRequest.Range["A1"].CellStyle.Font.Size = 24;
            sheetRequest.Range["A1"].CellStyle.Font.RGBColor = Color.FromArgb(0, 0, 176, 240);
            sheetRequest.Range["A1"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.ImportData(listExport, 2, 1, true);

            sheetRequest["A2"].Text = "Người chuyển";
            sheetRequest["B2"].Text = "Người nhận";
            sheetRequest["C2"].Text = "Ý kiến";
            sheetRequest["D2"].Text = "Thời gian";
            sheetRequest["E2"].Text = "Vai trò";
            sheetRequest["F2"].Text = "Trạng thái";


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
            sheetRequest["A2:F2"].CellStyle = tableHeader;
            sheetRequest.Range["A2:F2"].RowHeight = 20;
            sheetRequest.UsedRange.AutofitColumns();

            string ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            var fileName = "Luồng xử lý công văn (" + data.DocumentSymbol + " ngày " + data.PromulgateDate.Value.ToString("dd.MM.yyyy") + ") - " + DateTime.Now.ToString("yyyyMMddHHmmss") + ".xls";
            MemoryStream ms = new MemoryStream();
            workbook.SaveAs(ms);
            workbook.Close();
            excelEngine.Dispose();
            ms.Position = 0;
            return File(ms, ContentType, fileName);
        }
    }
    public class AuthoringInsert
    {
        public int Id { get; set; }
        public string FromUser { get; set; }
        public string ToUser { get; set; }
        public string FromDate { get; set; }
        public string ToDate { get; set; }
        public string Confirm { get; set; }
    }
    public class AuthoringResponse
    {
        public int id { get; set; }
        public string ToUser { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public string Confirm { get; set; }
    }
    public class AuthoringListResponse
    {
        public int Id { get; set; }
        public string GivenName { get; set; }
        public string FromDate { get; set; }
        public string ToDate { get; set; }
        public string FromUser { get; set; }
        public string ToUser { get; set; }
        public string Confirm { get; set; }
        public bool SendByMe { get; set; }
        public string GivenName1 { get; set; }
        public string Status { get; set; }
    }
}

