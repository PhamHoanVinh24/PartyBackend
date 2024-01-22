using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
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
    public class EDMSWareHouseBillController : BaseController
    {
        private readonly EIMDBContext _context;
        public class JTableModelEDMSWareHouseBill : JTableModel
        {
            public string RcTicketCode { get; set; }
            public string BrCode { get; set; }
            public string WHS_Code { get; set; }
            public string WHS_User { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
        }

        public EDMSWareHouseBillController(EIMDBContext context)
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

                var query = FuncJTable(jTablePara.RcTicketCode, jTablePara.BrCode, jTablePara.WHS_Code, jTablePara.WHS_User, jTablePara.FromDate, jTablePara.ToDate);

                var count = query.Count();
                var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy)
                                .Skip(intBeginFor).Take(jTablePara.Length)
                                .ToList();
                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "QR_Code", "RcTicketCode", "RcSupport", "RcStatus", "OrgName", "DocType", "FromDate", "ToDate", "CreatedTime", "CreatedBy", "Note", "NumBox", "WHS_Code", "WHS_Name", "WHS_User", "GivenName", "Reason");
                return Json(jdata);
            }
            catch (Exception ex)
            {
                var jdata = JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "Id", "QR_Code", "RcTicketCode", "RcSupport", "RcStatus", "OrgName", "DocType", "FromDate", "ToDate", "CreatedTime", "CreatedBy", "Note", "NumBox", "WHS_Code", "WHS_Name", "WHS_User", "GivenName", "Reason");
                return Json(jdata);
            }
        }

        [NonAction]
        public IQueryable<EDMSWareHouseModel> FuncJTable(string RcTicketCode, string BrCode, string WHS_Code, string WHS_User, string FromDate, string ToDate)
        {
            var fromDate = !string.IsNullOrEmpty(FromDate) ? DateTime.ParseExact(FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(ToDate) ? DateTime.ParseExact(ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            var query = (from a in _context.EDMSReceiptExportStores.AsNoTracking()
                         join b in _context.AdOrganizations.Where(x => x.IsEnabled) on a.BrCode equals b.OrgAddonCode
                         join c in _context.EDMSWareHouses.Where(x => x.WHS_Flag != true && x.Type == "RV") on a.WHS_Code equals c.WHS_Code
                         join d in _context.Users.Where(x => x.Active) on a.WHS_User equals d.UserName
                         where
                         (string.IsNullOrEmpty(RcTicketCode) || (!string.IsNullOrEmpty(a.RcTicketCode) && a.RcTicketCode.ToLower().Contains(RcTicketCode.ToLower())))
                         && (string.IsNullOrEmpty(BrCode) || (a.BrCode == BrCode))
                         && (string.IsNullOrEmpty(WHS_Code) || (a.WHS_Code == WHS_Code))
                         && (string.IsNullOrEmpty(WHS_User) || (a.WHS_User == WHS_User))
                         && (string.IsNullOrEmpty(ToDate) || (a.FromDate <= toDate))
                         && (string.IsNullOrEmpty(FromDate) || (a.FromDate >= fromDate))
                         select new EDMSWareHouseModel
                         {
                             Id = a.Id,
                             QR_Code = a.QR_Code != null ? CommonUtil.GenerateQRCode(a.QR_Code) : null,
                             RcTicketCode = a.RcTicketCode,
                             RcSupport = a.RcSupport,
                             RcStatus = a.RcStatus,
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
                                            && x.DepartCode == brCode)
                                .ToList();
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

        //Thêm phiếu xuất kho
        [HttpPost]
        public JsonResult InsertReceiptExportStore([FromBody]EDMSReceiptExportStoreModel obj)
        {
            var msg = new JMessage();
            try
            {
                var dateFrom = !string.IsNullOrEmpty(obj.FromDate) ? DateTime.ParseExact(obj.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var dateTo = !string.IsNullOrEmpty(obj.ToDate) ? DateTime.ParseExact(obj.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

                var recExportStore = _context.EDMSReceiptExportStores.FirstOrDefault(x => x.RcTicketCode.Equals(obj.RcTicketCode));
                if (recExportStore == null)
                {
                    var recExportStoreObj = new EDMSReceiptExportStore
                    {
                        RcTicketCode = obj.RcTicketCode,
                        RqId = obj.RqId,
                        BrCode = obj.BrCode,
                        WHS_Code = obj.WHS_Code,
                        WHS_User = obj.WHS_User,
                        PersonReceiver = obj.PersonReceiver,
                        NumBox = obj.NumBox,
                        DocType = obj.DocType,
                        FromDate = dateFrom,
                        ToDate = dateTo,
                        Note = obj.Note,
                        Reason = obj.Reason,
                        QR_Code = obj.RcTicketCode,
                        RcStatus = obj.RcStatus,
                        RcSupport = obj.RcSupport,
                        CreatedTime = DateTime.Now,
                        RqType = obj.RqType
                    };

                    _context.EDMSReceiptExportStores.Add(recExportStoreObj);
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
                                    var edmsRecExFile = new EDMSRecExportFile
                                    {
                                        FileId = edmsFile.FileID,
                                        RecId = recExportStoreObj.Id
                                    };

                                    _context.EDMSRecExportFiles.Add(edmsRecExFile);
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

                                var edmsRecExFile = new EDMSRecExportFile
                                {
                                    FileId = edmsFile.FileID,
                                    RecId = recExportStoreObj.Id
                                };

                                _context.EDMSRecExportFiles.Add(edmsRecExFile);
                                _context.SaveChanges();
                            }
                        }
                    }
                    foreach (var item in obj.ListBox)
                    {
                        item.RcExCode = obj.RcTicketCode;
                        var box = _context.EDMSBoxs.FirstOrDefault(x => x.BoxCode.Equals(item.BoxCode));
                        if (box != null)
                        {
                            box.RcExCode = item.RcExCode;
                            _context.EDMSBoxs.Update(box);
                            _context.SaveChanges();
                        }
                    }

                    if (!msg.Error)
                        msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_ADD_SUCCESS"), "Phiếu xuất kho");
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_EXITS"), "Phiếu xuất kho");
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_ADD"));
            }
            return Json(msg);
        }

        //Sửa phiếu xuất kho
        [HttpPost]
        public JsonResult UpdateReceiptExportStore([FromBody]EDMSReceiptExportStoreModel obj)
        {
            var msg = new JMessage();
            try
            {
                var dateFrom = !string.IsNullOrEmpty(obj.FromDate) ? DateTime.ParseExact(obj.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var dateTo = !string.IsNullOrEmpty(obj.ToDate) ? DateTime.ParseExact(obj.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

                var recExportStore = _context.EDMSReceiptExportStores.FirstOrDefault(x => x.Id.Equals(obj.Id));
                if (recExportStore != null)
                {
                    recExportStore.RcTicketCode = obj.RcTicketCode;
                    recExportStore.BrCode = obj.BrCode;
                    recExportStore.WHS_Code = obj.WHS_Code;
                    recExportStore.WHS_User = obj.WHS_User;
                    recExportStore.NumBox = obj.NumBox;
                    recExportStore.DocType = obj.DocType;
                    recExportStore.FromDate = dateFrom;
                    recExportStore.ToDate = dateTo;
                    recExportStore.Note = obj.Note;
                    recExportStore.Reason = obj.Reason;
                    recExportStore.PersonReceiver = obj.PersonReceiver;
                    recExportStore.QR_Code = obj.RcTicketCode;
                    recExportStore.RcStatus = obj.RcStatus;
                    recExportStore.RcSupport = obj.RcSupport;
                    recExportStore.UpdatedTime = DateTime.Now;
                    recExportStore.RqId = obj.RqId;
                    recExportStore.RqType = obj.RqType;

                    _context.EDMSReceiptExportStores.Update(recExportStore);
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

                                var edmsRecExFile = new EDMSRecExportFile
                                {
                                    FileId = edmsFile.FileID,
                                    RecId = recExportStore.Id
                                };

                                _context.EDMSRecExportFiles.Add(edmsRecExFile);
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
                            item.RcExCode = obj.RcTicketCode;
                            var box = _context.EDMSBoxs.FirstOrDefault(x => x.BoxCode.Equals(item.BoxCode));
                            if (box != null)
                            {
                                box.RcExCode = item.RcExCode;
                                _context.EDMSBoxs.Update(box);
                                _context.SaveChanges();
                            }
                        }
                    }

                    if (!msg.Error)
                        msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_UPDATE_SUCCESS"), "Phiếu xuất kho");
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_EXITS"), "Phiếu xuất kho");
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_ADD"));
            }
            return Json(msg);
        }

        //Xóa phiếu xuất kho
        [HttpPost]
        public JsonResult DeleteReceiptExportStore(int id)
        {
            var msg = new JMessage();
            try
            {
                var recExportStore = _context.EDMSReceiptExportStores.FirstOrDefault(x => x.Id.Equals(id));
                if (recExportStore != null)
                {
                    _context.EDMSReceiptExportStores.Remove(recExportStore);
                    _context.SaveChanges();

                    //var listBoxs = _context.EDMSBoxs.Where(x => x.RcCode.Equals(recExportStore.RcTicketCode)).ToList();

                    //if (listBoxs.Count > 0)
                    //{
                    //    foreach (var box in listBoxs)
                    //    {
                    //        _context.EDMSBoxs.Remove(box);
                    //        _context.SaveChanges();
                    //    }
                    //}

                    msg.Error = false;
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_SUCCESS"), "Phiếu xuất kho");
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_EXITS"), "Phiếu xuất kho");
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
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_SUCCESS"), "Tệp tin");
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_FAIL"), "Tệp tin");
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_ADD"));
            }
            return msg;
        }

        //Lấy chi tiết 1 phiếu xuất kho
        [HttpPost]
        public object GetReceiptExportStoreDetail(int id)
        {
            try
            {
                var data = new EDMSReceiptExportStoreModel
                {
                    ListBox = new List<EDMSBoxModel>()
                };
                var rec = _context.EDMSReceiptExportStores.FirstOrDefault(x => x.Id == id);
                if (rec != null)
                {
                    var listBoxs = _context.EDMSBoxs.Where(x => x.RcExCode.Equals(rec.RcTicketCode)).ToList();

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
                    //data.RqId = rec.RqId;
                    data.ToDate = rec.ToDate != null ? rec.ToDate.Value.ToString("dd/MM/yyyy") : null;
                    data.WHS_Code = rec.WHS_Code;
                    data.WHS_User = rec.WHS_User;
                    data.Reason = rec.Reason;
                    data.PersonReceiver = rec.PersonReceiver;
                    data.RqId = rec.RqId;
                    data.RqType = rec.RqType;

                    var listFileRecs = (from a in _context.EDMSReceiptExportStores
                                        join b in _context.EDMSRecExportFiles on a.Id equals b.RecId
                                        join c in _context.EDMSFiles on b.FileId equals c.FileID
                                        where b.RecId == rec.Id
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

        [HttpPost]
        public object GetListRequestProfile()
        {
            var listUsed = _context.EDMSReceiptExportStores.Where(x => x.RqId != null).Select(x => (int)x.RqId).ToList();
            var data = _context.EDMSRequestExportStores.Where(x => x.RcStatus.Equals("RECEIPTPROFILE_STATUS_APPROVED") && listUsed.All(y => y != x.Id)).OrderByDescending(x => x.Id).ToList();
            return Json(data);
        }

        //Lấy chi tiết 1 Y/C nhập kho
        [HttpPost]
        public object GetRequestExportStoreDetail(int id)
        {
            try
            {
                var data = new EDMSRequestExportStoreModel
                {
                    ListBox = new List<EDMSBoxModel>()
                };
                var req = _context.EDMSRequestExportStores.FirstOrDefault(x => x.Id == id);
                if (req != null)
                {
                    var listBoxs = _context.EDMSBoxs.Where(x => x.RqExCode.Equals(req.RcTicketCode)).ToList();

                    data.Id = req.Id;
                    data.BrCode = req.BrCode;
                    data.DocType = req.DocType;
                    data.FromDate = req.FromDate != null ? req.FromDate.Value.ToString("dd/MM/yyyy") : null;
                    data.Note = req.Note;
                    data.NumBox = req.NumBox;
                    data.QR_Code = req.QR_Code;
                    data.RcStatus = req.RcStatus;
                    data.RcSupport = req.RcSupport;
                    data.RcTicketCode = req.RcTicketCode;
                    data.ToDate = req.ToDate != null ? req.ToDate.Value.ToString("dd/MM/yyyy") : null;
                    data.WHS_Code = req.WHS_Code;
                    data.WHS_User = req.WHS_User;
                    data.PersonRequest = req.PersonRequest;
                    data.RqType = req.RqType;
                    data.RqId = req.RqId;

                    var listFileReqs = (from a in _context.EDMSRequestExportStores
                                        join b in _context.EDMSReqExportFiles on a.Id equals b.ReqId
                                        join c in _context.EDMSFiles on b.FileId equals c.FileID
                                        where b.ReqId == req.Id
                                        select c
                                        ).ToList();

                    foreach (var file in listFileReqs)
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
                            //TypeProfileName = _context.CommonSettings.FirstOrDefault(x => x.SettingID.ToString() == box.TypeProfile)?.ValueSet,
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
                            RqCode = box.RqCode,
                            StartTime = box.StartTime != null ? box.StartTime.Value.ToString("dd/MM/yyyy") : null,
                            StatusBox = box.StatusBox,
                            StatusSecurity = box.StatusSecurity,
                            StoragePeriod = box.StoragePeriod,
                            StorageTime = box.StorageTime != null ? box.StorageTime.Value.ToString("dd/MM/yyyy") : null,
                            TypeProfile = box.TypeProfile,
                            WHS_Code = box.WHS_Code,
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
                var data = _context.EDMSReceiptExportStores.MaxBy(x => x.Id);
                if (data != null)
                    id = data.Id + 1;
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return id;
        }
    }
    public class EDMSWareHouseModel
    {
        public int Id { get; set; }
        public string QR_Code { get; set; }
        public string RcTicketCode { get; set; }
        public string RcSupport { get; set; }
        public string RcStatus { get; set; }
        public string RcStatusName { get; set; }
        public string OrgName { get; set; }
        public string DocType { get; set; }
        public string FromDate { get; set; }
        public string ToDate { get; set; }
        public DateTime? CreatedTime { get; set; }
        public string CreatedBy { get; set; }
        public string Note { get; set; }
        public string NumBox { get; set; }
        public string WHS_Code { get; set; }
        public string Reason { get; set; }
        public string WHS_Name { get; set; }
        public string WHS_User { get; set; }
        public string GivenName { get; set; }
    }
}