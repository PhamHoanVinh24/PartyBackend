using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using III.Domain.Enums;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class EDMSSendReceiptProfileController : BaseController
    {
        private readonly EIMDBContext _context;
        public class JTableModelEDMSWareHouseBill : JTableModel
        {
            public string BrCode { get; set; }
            public string DocType { get; set; }
            //public string WHS_Code { get; set; }
            public string WHS_User { get; set; }
            public string RcStatus { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
        }

        public EDMSSendReceiptProfileController(EIMDBContext context)
        {
            _context = context;
        }
        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public JsonResult JTable([FromBody]JTableModelEDMSWareHouseBill jTablePara)
        {
            try
            {
                int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;

                var query = FuncJTable(jTablePara.BrCode, jTablePara.DocType, jTablePara.WHS_User, jTablePara.RcStatus, jTablePara.FromDate, jTablePara.ToDate);

                var count = query.Count();
                var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy)
                                .Skip(intBeginFor).Take(jTablePara.Length)
                                .ToList();
                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "QR_Code", "RcTicketCode", "RcSupport", "RcStatus", "RcStatusName", "OrgName", "DocType", "FromDate", "ToDate", "CreatedTime", "CreatedBy", "Note", "NumBox", "WHS_Code", "WHS_Name", "WHS_User", "GivenName", "Reason");
                return Json(jdata);
            }
            catch (Exception ex)
            {
                var jdata = JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "Id", "QR_Code", "RcTicketCode", "RcSupport", "RcStatus", "RcStatusName", "OrgName", "DocType", "FromDate", "ToDate", "CreatedTime", "CreatedBy", "Note", "NumBox", "WHS_Code", "WHS_Name", "WHS_User", "GivenName", "Reason");
                return Json(jdata);
            }
        }

        [NonAction]
        public IQueryable<EDMSWareHouseModel> FuncJTable(string BrCode, string DocType, string WHS_User, string RcStatus, string FromDate, string ToDate)
        {
            var fromDate = !string.IsNullOrEmpty(FromDate) ? DateTime.ParseExact(FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(ToDate) ? DateTime.ParseExact(ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            var query = (from a in _context.EDMSRequestExportStores.AsNoTracking()
                         join b in _context.AdOrganizations.Where(x => x.IsEnabled) on a.BrCode equals b.OrgAddonCode
                         join c in _context.EDMSWareHouses.Where(x => x.WHS_Flag != true && x.Type == "RV") on a.WHS_Code equals c.WHS_Code
                         join d in _context.Users.Where(x => x.Active) on a.PersonRequest equals d.UserName
                         join e1 in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "RECEIPTPROFILE_STATUS") on a.RcStatus equals e1.CodeSet into e2
                         from e in e2.DefaultIfEmpty()
                         where
                         (string.IsNullOrEmpty(BrCode) || (a.BrCode == BrCode))
                         && (string.IsNullOrEmpty(DocType) || (a.DocType == DocType))
                         && (string.IsNullOrEmpty(WHS_User) || (a.WHS_User == WHS_User))
                         && (string.IsNullOrEmpty(RcStatus) || (a.RcStatus == RcStatus))
                         && (string.IsNullOrEmpty(ToDate) || (a.FromDate <= toDate))
                         && (string.IsNullOrEmpty(FromDate) || (a.FromDate >= fromDate))
                         select new EDMSWareHouseModel
                         {
                             Id = a.Id,
                             QR_Code = a.QR_Code != null ? CommonUtil.GenerateQRCode(a.QR_Code) : null,
                             RcTicketCode = a.RcTicketCode,
                             RcSupport = a.RcSupport,
                             RcStatus = a.RcStatus,
                             RcStatusName = e != null ? e.ValueSet : "",
                             OrgName = b.OrgName,
                             DocType = a.DocType,
                             FromDate = a.FromDate.HasValue ? (a.FromDate.Value).ToString("dd/MM/yyyy") : null,
                             ToDate = a.ToDate.HasValue ? (a.ToDate.Value).ToString("dd/MM/yyyy") : null,
                             CreatedTime = a.CreatedTime,
                             CreatedBy = a.CreatedBy,
                             Note = a.Note,
                             NumBox = a.NumBox,
                             WHS_Code = a.WHS_Code,
                             Reason = a.Reason,
                             WHS_Name = c.WHS_Name,
                             WHS_User = a.WHS_User,
                             GivenName = d.GivenName,
                         });
            return query;
        }

        [HttpPost]
        public JsonResult GetListWareHouseUser()
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = from a in _context.Users.Where(x => x.Active).Select(x => new { Code = x.UserName, Name = x.GivenName, Id = x.Id })
                           join b in _context.AdUserInGroups.Where(x => x.IsMain && x.GroupUserCode == "KETOAN") on a.Id equals b.UserId
                           select a;
                if (data != null)
                {
                    msg.Object = data;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_NOT_EXITS_FILE")); //"Không tồn tại dữ liệu!";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("Có lỗi khi lấy dữ liệu")); //"Có lỗi khi lấy dữ liệu!"; 
            }
            return Json(msg);
        }
        [HttpGet]
        public object GetListBox(string WHS_Code, string brCode)
        {
            try
            {
                var rs = _context.EDMSBoxs
                                .Where(x => x.IsStored
                                            && x.WHS_Code == WHS_Code
                                            && x.DepartCode == brCode).OrderByDescending(x => x.Id);
                return Json(rs);
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }

        [HttpPost]
        public JsonResult GetListStaffBranch()
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.HREmployees.Where(x => x.flag == 1).Select(x => new { Code = x.identitycard, Name = x.fullname });
                if (data != null)
                {
                    msg.Object = data;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_NOT_EXITS_FILE")); //"Không tồn tại dữ liệu!";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("Có lỗi khi lấy dữ liệu")); //"Có lỗi khi lấy dữ liệu!"; 
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetListStatus()
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.CommonSettings.Where(x => x.Group == "RECEIPTPROFILE_STATUS").OrderBy(x => x.Priority).Select(x => new { Code = x.CodeSet, Name = x.ValueSet, Icon = x.Logo });
                if (data != null)
                {
                    msg.Object = data;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_NOT_EXITS_FILE")); //"Không tồn tại dữ liệu!";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("Có lỗi khi lấy dữ liệu")); //"Có lỗi khi lấy dữ liệu!"; 
            }
            return Json(msg);
        }

        //Thêm y/c xuất kho
        [HttpPost]
        public JsonResult InsertReceiptExportStore([FromBody]EDMSRequestExportStoreModel obj)
        {
            var msg = new JMessage();
            try
            {
                var dateFrom = !string.IsNullOrEmpty(obj.FromDate) ? DateTime.ParseExact(obj.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var dateTo = !string.IsNullOrEmpty(obj.ToDate) ? DateTime.ParseExact(obj.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

                var rqExportStore = _context.EDMSRequestExportStores.FirstOrDefault(x => x.RcTicketCode.Equals(obj.RcTicketCode));
                if (rqExportStore == null)
                {
                    var rqExportStoreObj = new EDMSRequestExportStore
                    {
                        RcTicketCode = obj.RcTicketCode,
                        RqId = obj.RqId,
                        RqType = obj.RqType,
                        BrCode = obj.BrCode,
                        WHS_Code = obj.WHS_Code,
                        //WHS_User = User.Identity.Name,
                        NumBox = obj.NumBox,
                        DocType = obj.DocType,
                        FromDate = dateFrom,
                        ToDate = dateTo,
                        Note = obj.Note,
                        Reason = obj.Reason,
                        QR_Code = obj.RcTicketCode,
                        RcStatus = EnumHelper<RequestStatus>.GetDisplayValue(RequestStatus.Pending),
                        RcSupport = obj.RcSupport,
                        CreatedTime = DateTime.Now,
                        PersonRequest = obj.PersonRequest
                    };

                    _context.EDMSRequestExportStores.Add(rqExportStoreObj);
                    _context.SaveChanges();

                    if (obj.ListFileReceipt != null)
                    {
                        foreach (var file in obj.ListFileReceipt)
                        {
                            if (file.FileId != null)
                            {
                                var edmsFile = _context.EDMSFiles.FirstOrDefault(x => x.FileID == file.FileId);
                                if (edmsFile != null)
                                {
                                    var edmsReqExFile = new EDMSReqExportFile
                                    {
                                        FileId = edmsFile.FileID,
                                        ReqId = rqExportStoreObj.Id
                                    };

                                    _context.EDMSReqExportFiles.Add(edmsReqExFile);
                                    _context.SaveChanges();
                                }
                            }
                            else
                            {
                                var edmsFile = new EDMSFile
                                {
                                    FileName = file.FileName,
                                    Url = file.FilePath,
                                    FileTypePhysic = file.FileType,
                                    CreatedTime = DateTime.Now,
                                    CreatedBy = User.Identity.Name,
                                    MimeType = file.ContentType
                                };

                                _context.EDMSFiles.Add(edmsFile);
                                _context.SaveChanges();

                                var edmsReqExFile = new EDMSReqExportFile
                                {
                                    FileId = edmsFile.FileID,
                                    ReqId = rqExportStoreObj.Id
                                };

                                _context.EDMSReqExportFiles.Add(edmsReqExFile);
                                _context.SaveChanges();
                            }
                        }
                    }
                    foreach (var item in obj.ListBox)
                    {
                        item.RqExCode = obj.RcTicketCode;
                        var box = _context.EDMSBoxs.FirstOrDefault(x => x.BoxCode.Equals(item.BoxCode));
                        if (box != null)
                        {
                            box.RqExCode = item.RqExCode;
                            _context.EDMSBoxs.Update(box);
                            _context.SaveChanges();
                        }
                    }

                    if (!msg.Error)
                        msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_ADD_SUCCESS"), CommonUtil.ResourceValue("EDMSSRP_MSG_EDMSSRP"));
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_EXITS"), CommonUtil.ResourceValue("EDMSSRP_MSG_EDMSSRP"));
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_ADD"));
            }
            return Json(msg);
        }

        //Sửa y/c xuất kho
        [HttpPost]
        public JsonResult UpdateReceiptExportStore([FromBody]EDMSRequestExportStoreModel obj)
        {
            var msg = new JMessage();
            try
            {
                var dateFrom = !string.IsNullOrEmpty(obj.FromDate) ? DateTime.ParseExact(obj.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var dateTo = !string.IsNullOrEmpty(obj.ToDate) ? DateTime.ParseExact(obj.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

                var rqExportStore = _context.EDMSRequestExportStores.FirstOrDefault(x => x.Id.Equals(obj.Id));
                if (rqExportStore != null)
                {
                    rqExportStore.RcTicketCode = obj.RcTicketCode;
                    rqExportStore.BrCode = obj.BrCode;
                    rqExportStore.WHS_Code = obj.WHS_Code;
                    rqExportStore.WHS_User = obj.WHS_User;
                    rqExportStore.NumBox = obj.NumBox;
                    rqExportStore.DocType = obj.DocType;
                    rqExportStore.FromDate = dateFrom;
                    rqExportStore.ToDate = dateTo;
                    rqExportStore.Note = obj.Note;
                    rqExportStore.Reason = obj.Reason;
                    rqExportStore.QR_Code = obj.RcTicketCode;
                    rqExportStore.RcStatus = obj.RcStatus;
                    rqExportStore.RcSupport = obj.RcSupport;
                    rqExportStore.RqType = obj.RqType;
                    rqExportStore.UpdatedTime = DateTime.Now;
                    rqExportStore.PersonRequest = obj.PersonRequest;

                    _context.EDMSRequestExportStores.Update(rqExportStore);
                    _context.SaveChanges();

                    if (obj.ListBoxIDDelete != null)
                    {
                        foreach (var id in obj.ListBoxIDDelete)
                        {
                            var boxDeleteObj = _context.EDMSBoxs.FirstOrDefault(x => x.Id == id);
                            _context.EDMSBoxs.Remove(boxDeleteObj);
                            _context.SaveChanges();
                        }
                    }

                    if (obj.ListFileReceipt != null)
                    {
                        foreach (var file in obj.ListFileReceipt)
                        {
                            var exits = _context.EDMSFiles.FirstOrDefault(x => x.FileID == file.FileId);
                            if (exits == null)
                            {
                                var edmsFile = new EDMSFile
                                {
                                    FileName = file.FileName,
                                    Url = file.FilePath,
                                    FileTypePhysic = file.FileType,
                                    CreatedTime = DateTime.Now,
                                    CreatedBy = User.Identity.Name,
                                    MimeType = file.ContentType
                                };

                                _context.EDMSFiles.Add(edmsFile);
                                _context.SaveChanges();

                                var edmsReqExFile = new EDMSReqExportFile
                                {
                                    FileId = edmsFile.FileID,
                                    ReqId = rqExportStore.Id
                                };

                                _context.EDMSReqExportFiles.Add(edmsReqExFile);
                                _context.SaveChanges();
                            }
                        }
                    }

                    //if (obj.ListFileReceiptRemove != null)
                    //{
                    //    foreach (var itemRemove in obj.ListFileReceiptRemove)
                    //    {
                    //        msg = RemoveFileReceipt(itemRemove.FileId);
                    //        if (msg.Error)
                    //            break;
                    //    }
                    //}

                    if (obj.ListBox != null)
                    {
                        foreach (var item in obj.ListBox)
                        {
                            item.RqExCode = obj.RcTicketCode;
                            var box = _context.EDMSBoxs.FirstOrDefault(x => x.BoxCode.Equals(item.BoxCode));
                            if (box != null)
                            {
                                box.RqExCode = item.RqExCode;
                                _context.EDMSBoxs.Update(box);
                                _context.SaveChanges();
                            }
                        }
                    }

                    if (!msg.Error)
                        msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_UPDATE_SUCCESS"), CommonUtil.ResourceValue("EDMSSRP_MSG_EDMSSRP"));
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_EXITS"), CommonUtil.ResourceValue("EDMSSRP_MSG_EDMSSRP"));
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_ADD"));
            }
            return Json(msg);
        }

        //Xóa Y/C xuất kho
        [HttpPost]
        public JsonResult DeleteReceiptExportStore(int id)
        {
            var msg = new JMessage();
            try
            {
                var reqExportStore = _context.EDMSRequestExportStores.FirstOrDefault(x => x.Id.Equals(id));
                if (reqExportStore != null)
                {
                    _context.EDMSRequestExportStores.Remove(reqExportStore);
                    _context.SaveChanges();

                    //var listBoxs = _context.EDMSBoxs.Where(x => x.RqCode.Equals(reqExportStore.RcTicketCode)).ToList();

                    //if (listBoxs.Count > 0)
                    //{
                    //    foreach (var box in listBoxs)
                    //    {
                    //        _context.EDMSBoxs.Remove(box);
                    //        _context.SaveChanges();
                    //    }
                    //}

                    msg.Error = false;
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_SUCCESS"), "Phiếu Y/C xuất kho");
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_EXITS"), "Phiếu Y/C xuất kho");
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_ADD"));
            }
            return Json(msg);
        }

        [HttpPost]
        public JMessage RemoveFileReceipt(int? fileId)
        {
            var msg = new JMessage();
            try
            {
                if (fileId != null)
                {
                    var file = _context.EDMSFiles.FirstOrDefault(x => x.FileID == fileId);
                    _context.EDMSFiles.Remove(file);

                    var fileReq = _context.EDMSReqFiles.FirstOrDefault(x => x.FileId == fileId);
                    _context.EDMSReqFiles.Remove(fileReq);

                    _context.SaveChanges();

                    msg.Error = false;
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_SUCCESS"), CommonUtil.ResourceValue("EDMSSRP_MSG_FILE"));
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_FAIL"), CommonUtil.ResourceValue("EDMSSRP_MSG_FILE"));
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_ADD"));
            }
            return msg;
        }

        //Lấy chi tiết 1 y/c xuất kho
        [HttpPost]
        public object GetReceiptExportStoreDetail(int id)
        {
            try
            {
                var data = new EDMSRequestExportStoreModel
                {
                    ListBox = new List<EDMSBoxModel>()
                };
                var rec = _context.EDMSRequestExportStores.FirstOrDefault(x => x.Id == id);
                if (rec != null)
                {
                    var listBoxs = _context.EDMSBoxs.Where(x => x.RqExCode.Equals(rec.RcTicketCode)).ToList();

                    data.Id = rec.Id;
                    data.BrCode = rec.BrCode;
                    data.DocType = rec.DocType;
                    data.FromDate = rec.FromDate != null ? rec.FromDate.Value.ToString("dd/MM/yyyy") : null;
                    data.Note = rec.Note;
                    data.NumBox = rec.NumBox;
                    data.QR_Code = rec.QR_Code;
                    data.RcStatus = rec.RcStatus;
                    data.RcSupport = rec.RcSupport;
                    data.RcTicketCode = rec.RcTicketCode;
                    data.RqType = rec.RqType;
                    //data.RqId = rec.RqId;
                    data.ToDate = rec.ToDate != null ? rec.ToDate.Value.ToString("dd/MM/yyyy") : null;
                    data.WHS_Code = rec.WHS_Code;
                    data.WHS_User = rec.WHS_User;
                    data.PersonRequest = rec.PersonRequest;
                    data.Reason = rec.Reason;

                    var listFileRecs = (from a in _context.EDMSRequestExportStores
                                        join b in _context.EDMSReqExportFiles on a.Id equals b.ReqId
                                        join c in _context.EDMSFiles on b.FileId equals c.FileID
                                        where b.ReqId == rec.Id
                                        select c
                                        ).ToList();

                    foreach (var file in listFileRecs)
                    {
                        var fileUpload = new FileUpload
                        {
                            FileId = file.FileID,
                            FileName = file.FileName,
                            FilePath = file.Url,
                            FileType = file.FileTypePhysic
                        };

                        data.ListFileReceipt.Add(fileUpload);
                    }

                    foreach (var box in listBoxs)
                    {
                        var boxObj = new EDMSBoxModel
                        {
                            Id = box.Id,
                            BoxCode = box.BoxCode,
                            CNT_Brief = box.CNT_Brief,
                            DepartCode = box.DepartCode,
                            BranchName = _context.AdOrganizations.FirstOrDefault(x => x.OrgAddonCode.Equals(box.DepartCode))?.OrgName,
                            TypeProfileName = _context.EDMSTimeOfDocumentPreservations.FirstOrDefault(x => !x.IsDeleted && x.Id.ToString() == box.TypeProfile)?.TitleFull,
                            BoxSize = box.BoxSize,
                            CNT_Cell = box.CNT_Cell,
                            EndTime = box.EndTime != null ? box.EndTime.Value.ToString("dd/MM/yyyy") : null,
                            FloorCode = box.FloorCode,
                            LineCode = box.LineCode,
                            LstMemberId = box.LstMemberId,
                            LstTypeProfileId = box.LstTypeProfileId,
                            M_CNT_Brief = box.M_CNT_Brief,
                            Note = box.Note,
                            NumBoxth = box.NumBoxth,
                            QR_Code = CommonUtil.GenerateQRCode(box.QR_Code),
                            RackCode = box.RackCode,
                            RcCode = box.RcCode,
                            RcExCode = box.RcExCode,
                            RqExCode = box.RqExCode,
                            StartTime = box.StartTime != null ? box.StartTime.Value.ToString("dd/MM/yyyy") : null,
                            StatusBox = box.StatusBox,
                            StatusSecurity = box.StatusSecurity,
                            StoragePeriod = box.StoragePeriod,
                            StorageTime = box.StorageTime != null ? box.StorageTime.Value.ToString("dd/MM/yyyy") : null,
                            TypeProfile = box.TypeProfile,
                            WHS_Code = box.WHS_Code,
                            Ordering = box.Ordering,
                            RackPosition = box.RackPosition,
                            IsStored = box.IsStored,
                        };

                        var listFileBoxs = (from a in _context.EDMSBoxs
                                            join b in _context.EDMSBoxFiles on a.Id equals b.BoxId
                                            join c in _context.EDMSFiles on b.FileId equals c.FileID
                                            where b.BoxId == boxObj.Id
                                            select c
                                       ).ToList();

                        foreach (var file in listFileBoxs)
                        {
                            var fileUpload = new FileUpload
                            {
                                FileId = file.FileID,
                                FileName = file.FileName,
                                FilePath = file.Url,
                                FileType = file.FileTypePhysic
                            };

                            boxObj.ListFileBox.Add(fileUpload);
                        }

                        data.ListBox.Add(boxObj);
                    }
                }

                return Json(data);
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }

        //Lấy Id lớn nhất
        [HttpPost]
        public int GetIdMax()
        {
            var id = 1;
            try
            {
                var data = _context.EDMSRequestExportStores.MaxBy(x => x.Id);
                if (data != null)
                    id = data.Id + 1;
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return id;
        }

        //Duyệt
        [HttpPost]
        public JsonResult Approve(int id)
        {
            var msg = new JMessage();
            try
            {
                var reqExportStore = _context.EDMSRequestExportStores.FirstOrDefault(x => x.Id.Equals(id));
                if (reqExportStore != null)
                {
                    reqExportStore.RcStatus = "RECEIPTPROFILE_STATUS_APPROVED";
                    _context.EDMSRequestExportStores.Update(reqExportStore);
                    _context.SaveChanges();

                    msg.Error = false;
                    msg.Title = String.Format(CommonUtil.ResourceValue("Duyệt yêu cầu thành công"));
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("Duyệt yêu cầu thất bại"));
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("Duyệt yêu cầu thất bại"));
            }
            return Json(msg);
        }
        //Tạm dừng
        [HttpPost]
        public JsonResult Pause(int id)
        {
            var msg = new JMessage();
            try
            {
                var reqExportStore = _context.EDMSRequestExportStores.FirstOrDefault(x => x.Id.Equals(id));
                if (reqExportStore != null)
                {
                    reqExportStore.RcStatus = "RECEIPTPROFILE_STATUS_WAITING";
                    _context.EDMSRequestExportStores.Update(reqExportStore);
                    _context.SaveChanges();

                    msg.Error = false;
                    msg.Title = String.Format(CommonUtil.ResourceValue("Tạm dừng yêu cầu thành công"));
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("Tạm dừng yêu cầu thất bại"));
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("Tạm dừng yêu cầu thất bại"));
            }
            return Json(msg);
        }
        //Từ chối
        [HttpPost]
        public JsonResult Reject(int id)
        {
            var msg = new JMessage();
            try
            {
                var reqExportStore = _context.EDMSRequestExportStores.FirstOrDefault(x => x.Id.Equals(id));
                if (reqExportStore != null)
                {
                    reqExportStore.RcStatus = "RECEIPTPROFILE_STATUS_REJECTED";
                    _context.EDMSRequestExportStores.Update(reqExportStore);
                    _context.SaveChanges();

                    msg.Error = false;
                    msg.Title = String.Format(CommonUtil.ResourceValue("Từ chối yêu cầu thành công"));
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("Từ chối yêu cầu thất bại"));
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("Từ chối yêu cầu thất bại"));
            }
            return Json(msg);
        }
    }
}