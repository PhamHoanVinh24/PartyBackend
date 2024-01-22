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
    public class EDMSWareHouseReceiptController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IHostingEnvironment _hostingEnvironment;
        public class JTableModelEDMSWareHouseReceipt : JTableModel
        {
            public string RcTicketCode { get; set; }
            public string BrCode { get; set; }
            public string WHS_Code { get; set; }
            public string WHS_User { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string Staff { get; set; }
        }
        public EDMSWareHouseReceiptController(EIMDBContext context, IHostingEnvironment hostingEnvironment)
        {
            _context = context;
            _hostingEnvironment = hostingEnvironment;
        }
        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public JsonResult JTable([FromBody]JTableModelEDMSWareHouseReceipt jTablePara)
        {
            try
            {
                int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;

                var query = FuncJTable(jTablePara.RcTicketCode, jTablePara.BrCode, jTablePara.WHS_Code, jTablePara.WHS_User, jTablePara.FromDate, jTablePara.ToDate, jTablePara.Staff);

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
        public IQueryable<EDMSWareHouseModel> FuncJTable(string RcTicketCode, string BrCode, string WHS_Code, string WHS_User, string FromDate, string ToDate, string Staff)
        {
            var fromDate = !string.IsNullOrEmpty(FromDate) ? DateTime.ParseExact(FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(ToDate) ? DateTime.ParseExact(ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            var query = (from a in _context.EDMSReceiptInputStores.AsNoTracking()
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
                         && (string.IsNullOrEmpty(Staff) || (a.PersonSender == Staff))
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
                             //Reason = a.Reason,
                             WHS_Name = c.WHS_Name,
                             WHS_User = a.WHS_User,
                             GivenName = d.GivenName,
                         });
            return query;
        }



        [HttpPost]
        public byte[] GeneratorQRCode(string code)
        {
            return CommonUtil.GeneratorQRCode(code);
        }

        [HttpPost]
        public object GetListDocumentType()
        {
            //var data = _context.CommonSettings.Where(x => x.AssetCode.Equals("DOCUMENT_TYPE")).ToList();
            var data = _context.EDMSTimeOfDocumentPreservations.Where(x => !x.IsDeleted).Select(x => new { SettingID = x.Id, ValueSet = x.TitleFull, x.Code, x.GroupLevel1, x.GroupLevel2, x.GroupLevel3, x.StorageTimeLimit, x.TypeLevel1, x.TypeLevel2 }).ToList();
            return Json(data);
        }

        [HttpPost]
        public int GetStorageTimeLimit(int id)
        {
            var data = _context.EDMSTimeOfDocumentPreservations.FirstOrDefault(x => !x.IsDeleted && x.Id == id).StorageTimeLimit;
            return data;
        }

        [HttpPost]
        public int GetNumBoxth(string brCode, string whCode)
        {
            var data = _context.EDMSBoxs.Where(x => x.DepartCode == brCode && x.WHS_Code == whCode).Count();
            return data + 1;
        }

        [HttpPost]
        public object GetListRequestProfile()
        {
            var listUsed = _context.EDMSReceiptInputStores.Where(x => x.RqId != null).Select(x => (int)x.RqId).ToList();
            var data = _context.EDMSRequestInputStores.Where(x => x.RqStatus.Equals("REQUESTPROFILE_STATUS_APPROVED") && listUsed.All(y => y != x.Id)).OrderByDescending(x => x.Id).ToList();
            return Json(data);
        }

        //Lấy Id lớn nhất
        [HttpPost]
        public int GetIdMax()
        {
            var id = 1;
            try
            {
                var data = _context.EDMSReceiptInputStores.MaxBy(x => x.Id);
                if (data != null)
                    id = data.Id + 1;
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return id;
        }

        //Thêm phiếu nhập kho
        [HttpPost]
        public JsonResult InsertReceiptInputStore([FromBody]EDMSReceiptInputStoreModel obj)
        {
            var msg = new JMessage();
            try
            {
                var dateFrom = !string.IsNullOrEmpty(obj.FromDate) ? DateTime.ParseExact(obj.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var dateTo = !string.IsNullOrEmpty(obj.ToDate) ? DateTime.ParseExact(obj.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

                var recInputStore = _context.EDMSReceiptInputStores.FirstOrDefault(x => x.RcTicketCode.Equals(obj.RcTicketCode));
                if (recInputStore == null)
                {
                    var recInputStoreObj = new EDMSReceiptInputStore
                    {
                        RcTicketCode = obj.RcTicketCode,
                        RqId = obj.RqId,
                        BrCode = obj.BrCode,
                        WHS_Code = obj.WHS_Code,
                        WHS_User = obj.WHS_User,
                        NumBox = obj.NumBox,
                        DocType = obj.DocType,
                        FromDate = dateFrom,
                        ToDate = dateTo,
                        Note = obj.Note,
                        QR_Code = obj.RcTicketCode,
                        RcStatus = obj.RcStatus,
                        RcSupport = obj.RcSupport,
                        PersonSender = obj.PersonSender,
                        CreatedTime = DateTime.Now
                    };

                    _context.EDMSReceiptInputStores.Add(recInputStoreObj);
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
                                    var edmsRecFile = new EDMSRecInputFile
                                    {
                                        FileId = edmsFile.FileID,
                                        RecId = recInputStoreObj.Id
                                    };

                                    _context.EDMSRecFiles.Add(edmsRecFile);
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

                                var edmsRecFile = new EDMSRecInputFile
                                {
                                    FileId = edmsFile.FileID,
                                    RecId = recInputStoreObj.Id
                                };

                                _context.EDMSRecFiles.Add(edmsRecFile);
                                _context.SaveChanges();
                            }
                        }
                    }
                    foreach (var item in obj.ListBox)
                    {
                        item.RcCode = obj.RcTicketCode;
                        item.WHS_Code = obj.WHS_Code;

                        msg = UpdateBox(item);
                    }

                    if (!msg.Error)
                        msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_ADD_SUCCESS"), CommonUtil.ResourceValue("EDWHR_TITLE_RECEIPT"));
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_EXITS"), CommonUtil.ResourceValue("EDWHR_TITLE_RECEIPT"));
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_ADD"));
            }
            return Json(msg);
        }

        //Sửa phiếu nhập kho
        [HttpPost]
        public JsonResult UpdateReceiptInputStore([FromBody]EDMSReceiptInputStoreModel obj)
        {
            var msg = new JMessage();
            try
            {
                var dateFrom = !string.IsNullOrEmpty(obj.FromDate) ? DateTime.ParseExact(obj.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var dateTo = !string.IsNullOrEmpty(obj.ToDate) ? DateTime.ParseExact(obj.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

                var recInputStore = _context.EDMSReceiptInputStores.FirstOrDefault(x => x.Id.Equals(obj.Id));
                if (recInputStore != null)
                {
                    recInputStore.RcTicketCode = obj.RcTicketCode;
                    recInputStore.BrCode = obj.BrCode;
                    recInputStore.WHS_Code = obj.WHS_Code;
                    recInputStore.WHS_User = obj.WHS_User;
                    recInputStore.NumBox = obj.NumBox;
                    recInputStore.DocType = obj.DocType;
                    recInputStore.FromDate = dateFrom;
                    recInputStore.ToDate = dateTo;
                    recInputStore.Note = obj.Note;
                    recInputStore.QR_Code = obj.RcTicketCode;
                    recInputStore.RcStatus = obj.RcStatus;
                    recInputStore.RcSupport = obj.RcSupport;
                    recInputStore.PersonSender = obj.PersonSender;
                    recInputStore.UpdatedTime = DateTime.Now;

                    _context.EDMSReceiptInputStores.Update(recInputStore);
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

                                var edmsRecFile = new EDMSRecInputFile
                                {
                                    FileId = edmsFile.FileID,
                                    RecId = recInputStore.Id
                                };

                                _context.EDMSRecFiles.Add(edmsRecFile);
                                _context.SaveChanges();
                            }
                        }
                    }

                    if (obj.ListFileReceiptRemove != null)
                    {
                        foreach (var itemRemove in obj.ListFileReceiptRemove)
                        {
                            msg = RemoveFileReceipt(itemRemove.FileId);
                            if (msg.Error)
                                break;
                        }
                    }

                    if (obj.ListBox != null)
                    {
                        foreach (var item in obj.ListBox)
                        {
                            item.RcCode = obj.RcTicketCode;
                            item.WHS_Code = obj.WHS_Code;

                            msg = UpdateBox(item);
                        }
                    }

                    if (!msg.Error)
                        msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_UPDATE_SUCCESS"), CommonUtil.ResourceValue("EDWHR_TITLE_RECEIPT"));
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_EXITS"), CommonUtil.ResourceValue("EDWHR_TITLE_RECEIPT"));
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_ADD"));
            }
            return Json(msg);
        }

        //Xóa phiếu nhập kho
        [HttpPost]
        public JsonResult DeleteReceiptInputStore(int id)
        {
            var msg = new JMessage();
            try
            {
                var recInputStore = _context.EDMSReceiptInputStores.FirstOrDefault(x => x.Id.Equals(id));
                if (recInputStore != null)
                {
                    _context.EDMSReceiptInputStores.Remove(recInputStore);
                    _context.SaveChanges();

                    //var listBoxs = _context.EDMSBoxs.Where(x => x.RcCode.Equals(recInputStore.RcTicketCode)).ToList();

                    //if (listBoxs.Count > 0)
                    //{
                    //    foreach (var box in listBoxs)
                    //    {
                    //        _context.EDMSBoxs.Remove(box);
                    //        _context.SaveChanges();
                    //    }
                    //}

                    msg.Error = false;
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_SUCCESS"), CommonUtil.ResourceValue("EDWHR_TITLE_RECEIPT"));
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_EXITS"), CommonUtil.ResourceValue("EDWHR_TITLE_RECEIPT"));
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
        public JsonResult UploadFile(IFormFile file)
        {
            var msg = new JMessage();
            try
            {
                if (file != null)
                {
                    if (file != null && file.Length > 0)
                    {
                        var url = string.Empty;
                        var pathUpload = Path.Combine(_hostingEnvironment.WebRootPath, "uploads\\file");
                        if (!Directory.Exists(pathUpload)) Directory.CreateDirectory(pathUpload);
                        var fileName = Path.GetFileName(file.FileName);
                        fileName = Path.GetFileNameWithoutExtension(fileName)
                         + "_"
                         + Guid.NewGuid().ToString().Substring(0, 8)
                         + Path.GetExtension(fileName);
                        var filePath = Path.Combine(pathUpload, fileName);
                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            file.CopyTo(stream);
                        }
                        url = "/uploads/file/" + fileName;

                        var fileUpload = new FileUpload
                        {
                            FileName = fileName,
                            FilePath = url,
                            FileType = string.Concat(".", file.FileName.Split('.')[1]),
                            ContentType = file.ContentType
                        };
                        msg.Object = fileUpload;
                    }

                    msg.Error = false;
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_ADD_SUCCESS"), CommonUtil.ResourceValue("COM_BTN_FILE"));
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_EXITS"), CommonUtil.ResourceValue("COM_BTN_FILE"));
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
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_SUCCESS"), CommonUtil.ResourceValue("COM_BTN_FILE"));
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_FAIL"), CommonUtil.ResourceValue("COM_BTN_FILE"));
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_ADD"));
            }
            return msg;
        }

        [HttpPost]
        public JMessage RemoveFileBox(int? fileId)
        {
            var msg = new JMessage();
            try
            {
                if (fileId != null)
                {
                    var file = _context.EDMSFiles.FirstOrDefault(x => x.FileID == fileId);
                    _context.EDMSFiles.Remove(file);

                    var fileBox = _context.EDMSBoxFiles.FirstOrDefault(x => x.FileId == fileId);
                    _context.EDMSBoxFiles.Remove(fileBox);

                    _context.SaveChanges();

                    msg.Error = false;
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_SUCCESS"), CommonUtil.ResourceValue("COM_BTN_FILE"));
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_FAIL"), CommonUtil.ResourceValue("COM_BTN_FILE"));
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_ADD"));
            }
            return msg;
        }

        //Thêm hộp tài liệu
        [HttpPost]
        public JMessage InsertBox(EDMSBoxModel obj)
        {
            var msg = new JMessage();
            try
            {
                var startTime = !string.IsNullOrEmpty(obj.StartTime) ? DateTime.ParseExact(obj.StartTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var endTime = !string.IsNullOrEmpty(obj.EndTime) ? DateTime.ParseExact(obj.EndTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var storageTime = !string.IsNullOrEmpty(obj.StorageTime) ? DateTime.ParseExact(obj.StorageTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

                //Nhập luôn thùng vào kho
                obj.IsStored = true;

                var box = _context.EDMSBoxs.FirstOrDefault(x => x.Id.Equals(obj.Id));
                if (box == null)
                {
                    var boxObj = new EDMSBox
                    {
                        BoxCode = obj.BoxCode,
                        BoxSize = obj.BoxSize,
                        CNT_Brief = obj.CNT_Brief,
                        CNT_Cell = obj.CNT_Cell,
                        TypeProfile = obj.TypeProfile,
                        DepartCode = obj.DepartCode,
                        M_CNT_Brief = obj.M_CNT_Brief,
                        StartTime = startTime,
                        EndTime = endTime,
                        StorageTime = storageTime,
                        StoragePeriod = obj.StoragePeriod,
                        FloorCode = obj.FloorCode,
                        WHS_Code = obj.WHS_Code,
                        LineCode = obj.LineCode,
                        NumBoxth = obj.NumBoxth,
                        StatusSecurity = obj.StatusSecurity,
                        Note = obj.Note,
                        QR_Code = obj.BoxCode,
                        RackCode = obj.RackCode,
                        RackPosition = obj.RackPosition,
                        StatusBox = obj.StatusBox,
                        LstMemberId = obj.LstMemberId,
                        RqCode = obj.RqCode,
                        RcCode = obj.RcCode,
                        IsStored = obj.IsStored,
                        Ordering = obj.Ordering,
                        LstTypeProfileId = obj.LstTypeProfileId,
                    };

                    _context.EDMSBoxs.Add(boxObj);
                    _context.SaveChanges();

                    if (obj.IsStored)
                    {
                        var em = _context.EDMSEntityMappings.FirstOrDefault(x => x.BoxCode.Equals(obj.BoxCode));
                        if (em == null)
                        {
                            var entityMapping = new EDMSEntityMapping
                            {
                                BoxCode = obj.BoxCode,
                                WHS_Code = obj.WHS_Code,
                                FloorCode = obj.FloorCode,
                                LineCode = obj.LineCode,
                                RackCode = obj.RackCode,
                                RackPosition = obj.RackPosition,
                                Ordering = obj.Ordering,
                            };

                            _context.EDMSEntityMappings.Add(entityMapping);
                        }
                        else
                        {
                            em.BoxCode = obj.BoxCode;
                            em.WHS_Code = obj.WHS_Code;
                            em.FloorCode = obj.FloorCode;
                            em.LineCode = obj.LineCode;
                            em.RackCode = obj.RackCode;
                            em.RackPosition = obj.RackPosition;
                            em.Ordering = obj.Ordering;

                            _context.EDMSEntityMappings.Update(em);
                        }

                        _context.SaveChanges();
                    }

                    if (obj.ListFileBox != null)
                    {
                        foreach (var file in obj.ListFileBox)
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

                                var edmsBoxFile = new EDMSBoxFile
                                {
                                    FileId = edmsFile.FileID,
                                    BoxId = boxObj.Id
                                };

                                _context.EDMSBoxFiles.Add(edmsBoxFile);
                                _context.SaveChanges();
                            }
                        }
                    }
                    msg.Error = false;
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_ADD_SUCCESS"), CommonUtil.ResourceValue("EDWHR_TITLE_BOX"));
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_EXITS"), CommonUtil.ResourceValue("EDWHR_TITLE_BOX"));
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_ADD"));
            }
            return msg;
        }

        //Thêm hộp tài liệu
        [HttpPost]
        public JMessage UpdateBox(EDMSBoxModel obj)
        {
            var msg = new JMessage();
            try
            {
                var startTime = !string.IsNullOrEmpty(obj.StartTime) ? DateTime.ParseExact(obj.StartTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var endTime = !string.IsNullOrEmpty(obj.EndTime) ? DateTime.ParseExact(obj.EndTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var storageTime = !string.IsNullOrEmpty(obj.StorageTime) ? DateTime.ParseExact(obj.StorageTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

                var box = _context.EDMSBoxs.FirstOrDefault(x => x.Id.Equals(obj.Id));
                if (box != null)
                {
                    box.BoxCode = obj.BoxCode;
                    box.BoxSize = obj.BoxSize;
                    box.CNT_Brief = obj.CNT_Brief;
                    box.CNT_Cell = obj.CNT_Cell;
                    box.TypeProfile = obj.TypeProfile;
                    box.DepartCode = obj.DepartCode;
                    box.M_CNT_Brief = obj.M_CNT_Brief;
                    box.StartTime = startTime;
                    box.EndTime = endTime;
                    box.StorageTime = storageTime;
                    box.StoragePeriod = obj.StoragePeriod;
                    box.FloorCode = obj.FloorCode;
                    box.WHS_Code = obj.WHS_Code;
                    box.LineCode = obj.LineCode;
                    box.NumBoxth = obj.NumBoxth;
                    box.StatusSecurity = obj.StatusSecurity;
                    box.Note = obj.Note;
                    box.QR_Code = obj.BoxCode;
                    box.RackCode = obj.RackCode;
                    box.RackPosition = obj.RackPosition;
                    box.StatusBox = obj.StatusBox;
                    box.LstMemberId = obj.LstMemberId;
                    box.RcCode = obj.RcCode;
                    box.IsStored = obj.IsStored;
                    box.Ordering = obj.Ordering;
                    box.LstTypeProfileId = obj.LstTypeProfileId;

                    _context.EDMSBoxs.Update(box);
                    _context.SaveChanges();

                    if (obj.IsStored)
                    {
                        var em = _context.EDMSEntityMappings.FirstOrDefault(x => x.BoxCode.Equals(obj.BoxCode));
                        if (em == null)
                        {
                            var entityMapping = new EDMSEntityMapping
                            {
                                BoxCode = box.BoxCode,
                                WHS_Code = box.WHS_Code,
                                FloorCode = box.FloorCode,
                                LineCode = box.LineCode,
                                RackCode = box.RackCode,
                                RackPosition = box.RackPosition,
                                Ordering = box.Ordering,
                            };

                            _context.EDMSEntityMappings.Add(entityMapping);
                        }
                        else
                        {
                            em.BoxCode = box.BoxCode;
                            em.WHS_Code = box.WHS_Code;
                            em.FloorCode = box.FloorCode;
                            em.LineCode = box.LineCode;
                            em.RackCode = box.RackCode;
                            em.RackPosition = box.RackPosition;
                            em.Ordering = box.Ordering;

                            _context.EDMSEntityMappings.Update(em);
                        }

                        _context.SaveChanges();
                    }

                    if (obj.ListFileBox != null)
                    {
                        foreach (var file in obj.ListFileBox)
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

                                var edmsBoxFile = new EDMSBoxFile
                                {
                                    FileId = edmsFile.FileID,
                                    BoxId = box.Id
                                };

                                _context.EDMSBoxFiles.Add(edmsBoxFile);
                                _context.SaveChanges();
                            }
                        }
                    }

                    if (obj.ListFileBoxRemove != null)
                    {
                        foreach (var itemRemove in obj.ListFileBoxRemove)
                        {
                            msg = RemoveFileBox(itemRemove.FileId);
                            if (msg.Error)
                                break;
                        }
                    }

                    if (!msg.Error)
                        msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_UPDATE_SUCCESS"), CommonUtil.ResourceValue("EDWHR_TITLE_BOX"));
                }
                else
                {
                    var boxObj = new EDMSBox
                    {
                        BoxCode = obj.BoxCode,
                        BoxSize = obj.BoxSize,
                        CNT_Brief = obj.CNT_Brief,
                        CNT_Cell = obj.CNT_Cell,
                        TypeProfile = obj.TypeProfile,
                        DepartCode = obj.DepartCode,
                        M_CNT_Brief = obj.M_CNT_Brief,
                        StartTime = startTime,
                        EndTime = endTime,
                        StorageTime = storageTime,
                        StoragePeriod = obj.StoragePeriod,
                        FloorCode = obj.FloorCode,
                        WHS_Code = obj.WHS_Code,
                        LineCode = obj.LineCode,
                        NumBoxth = obj.NumBoxth,
                        StatusSecurity = obj.StatusSecurity,
                        Note = obj.Note,
                        QR_Code = obj.BoxCode,
                        RackCode = obj.RackCode,
                        RackPosition = obj.RackPosition,
                        StatusBox = obj.StatusBox,
                        LstMemberId = obj.LstMemberId,
                        RcCode = obj.RcCode,
                        IsStored = obj.IsStored,
                        Ordering = obj.Ordering,
                        LstTypeProfileId = obj.LstTypeProfileId,
                    };

                    _context.EDMSBoxs.Add(boxObj);
                    _context.SaveChanges();

                    if (obj.IsStored)
                    {
                        var em = _context.EDMSEntityMappings.FirstOrDefault(x => x.BoxCode.Equals(obj.BoxCode));
                        if (em == null)
                        {
                            var entityMapping = new EDMSEntityMapping
                            {
                                BoxCode = obj.BoxCode,
                                WHS_Code = obj.WHS_Code,
                                FloorCode = obj.FloorCode,
                                LineCode = obj.LineCode,
                                RackCode = obj.RackCode,
                                RackPosition = obj.RackPosition,
                                Ordering = obj.Ordering,
                            };

                            _context.EDMSEntityMappings.Add(entityMapping);
                        }
                        else
                        {
                            em.BoxCode = obj.BoxCode;
                            em.WHS_Code = obj.WHS_Code;
                            em.FloorCode = obj.FloorCode;
                            em.LineCode = obj.LineCode;
                            em.RackCode = obj.RackCode;
                            em.RackPosition = obj.RackPosition;
                            em.Ordering = obj.Ordering;

                            _context.EDMSEntityMappings.Update(em);
                        }

                        _context.SaveChanges();
                    }

                    if (obj.ListFileBox != null)
                    {
                        foreach (var file in obj.ListFileBox)
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

                                var edmsBoxFile = new EDMSBoxFile
                                {
                                    FileId = edmsFile.FileID,
                                    BoxId = boxObj.Id
                                };

                                _context.EDMSBoxFiles.Add(edmsBoxFile);
                                _context.SaveChanges();
                            }
                        }
                    }

                    msg.Error = false;
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_UPDATE_SUCCESS"), CommonUtil.ResourceValue("EDWHR_TITLE_BOX"));
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_UPDATE"));
            }
            return msg;
        }

        //Lấy danh sách nhân viên theo chi nhánh
        [HttpPost]
        public object GetListUserByBranchCode(string branchCode)
        {
            var data = _context.Users.Where(x => x.BranchId.Equals(branchCode)).ToList();
            return Json(data);
        }

        //Lấy chi tiết 1 Y/C nhập kho
        [HttpPost]
        public object GetRequestInputStoreDetail(int id)
        {
            try
            {
                var data = new EDMSRequestInputStoreModel
                {
                    ListBox = new List<EDMSBoxModel>()
                };
                var req = _context.EDMSRequestInputStores.FirstOrDefault(x => x.Id == id);
                if (req != null)
                {
                    var listBoxs = _context.EDMSBoxs.Where(x => x.RqCode.Equals(req.RqTicketCode)).ToList();

                    data.Id = req.Id;
                    data.BrCode = req.BrCode;
                    data.DocType = req.DocType;
                    data.FromDate = req.FromDate != null ? req.FromDate.Value.ToString("dd/MM/yyyy") : null;
                    data.Note = req.Note;
                    data.NumBox = req.NumBox;
                    data.QR_Code = req.QR_Code;
                    data.RqStatus = req.RqStatus;
                    data.RqSupport = req.RqSupport;
                    data.RqTicketCode = req.RqTicketCode;
                    data.ToDate = req.ToDate != null ? req.ToDate.Value.ToString("dd/MM/yyyy") : null;
                    data.WHS_Code = req.WHS_Code;
                    data.WHS_User = req.WHS_User;

                    var listFileReqs = (from a in _context.EDMSRequestInputStores
                                        join b in _context.EDMSReqFiles on a.Id equals b.ReqId
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

                        data.ListFileRequest.Add(fileUpload);
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

        //Lấy chi tiết 1 phiếu nhập kho
        [HttpPost]
        public object GetReceiptInputStoreDetail(int id)
        {
            try
            {
                var data = new EDMSReceiptInputStoreModel
                {
                    ListBox = new List<EDMSBoxModel>()
                };
                var rec = _context.EDMSReceiptInputStores.FirstOrDefault(x => x.Id == id);
                if (rec != null)
                {
                    var listBoxs = _context.EDMSBoxs.Where(x => x.RcCode.Equals(rec.RcTicketCode)).ToList();

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
                    data.RqId = rec.RqId;
                    data.ToDate = rec.ToDate != null ? rec.ToDate.Value.ToString("dd/MM/yyyy") : null;
                    data.WHS_Code = rec.WHS_Code;
                    data.WHS_User = rec.WHS_User;
                    data.PersonSender = rec.PersonSender;

                    var listFileRecs = (from a in _context.EDMSReceiptInputStores
                                        join b in _context.EDMSRecFiles on a.Id equals b.RecId
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
                            RcCode = box.RcCode,
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

        //Lấy thông tin tên kho,tầng,dãy,kệ từ code
        [HttpPost]
        public object GetNameObjectType([FromBody]ObjectTypeWareHouse obj)
        {
            try
            {
                var data = new ObjectTypeWareHouse
                {
                    WareHouseCode = obj.WareHouseCode,
                    FloorCode = obj.FloorCode,
                    LineCode = obj.LineCode,
                    RackCode = obj.RackCode,
                    NumBox = obj.NumBox,
                    CNTBox = obj.CNTBox
                };

                var wareHouse = _context.EDMSWareHouses.Where(x => x.WHS_Flag != true && x.Type == "RV").FirstOrDefault(x => x.WHS_Code.Equals(obj.WareHouseCode));
                if (wareHouse != null)
                    data.WareHouseName = wareHouse.WHS_Name;


                var floor = _context.EDMSFloors.FirstOrDefault(x => x.FloorCode.Equals(obj.FloorCode));
                if (floor != null)
                    data.FloorName = floor.FloorName;

                var line = _context.EDMSLines.FirstOrDefault(x => x.LineCode.Equals(obj.LineCode));
                if (line != null)
                    data.LineName = line.L_Text;

                var rack = _context.EDMSRacks.FirstOrDefault(x => x.RackCode.Equals(obj.RackCode));
                if (rack != null)
                    data.RackName = rack.RackName;

                if (!string.IsNullOrEmpty(data.CNTBox))
                    data.CNTBoxName = string.Concat("Số ", data.CNTBox);

                //if (!string.IsNullOrEmpty(data.NumBox))
                //    data.NumBoxName = string.Concat("Hộp ", data.NumBox);

                data.PositionBox = string.Format("{0}, {1}, {2}, {3}, {4}", data.CNTBoxName, data.RackName, data.LineName, data.FloorName, data.WareHouseName);

                return Json(data);
            }
            catch (Exception ex)
            {

                throw;
            }

        }

        [HttpGet]
        public object GetPosition(string wareHouseCode)
        {
            return _context.EDMSEntityMappings.Where(x => x.WHS_Code == wareHouseCode && !string.IsNullOrEmpty(x.FloorCode) && !string.IsNullOrEmpty(x.LineCode) && !string.IsNullOrEmpty(x.RackCode)).Select(x => new
            {
                x.Id,
                x.WHS_Code,
                x.FloorCode,
                x.LineCode,
                x.RackCode,
                RackName = !string.IsNullOrEmpty(x.RackCode) ? x.RackCode.Replace("_", " ") : ""
            });
        }
    }

    public class JTableRequestModel : JTableModel
    {
        public string RqTicketCode { get; set; }
    }

    public class ObjectTypeWareHouse
    {
        public string WareHouseCode { get; set; }
        public string FloorCode { get; set; }
        public string LineCode { get; set; }
        public string RackCode { get; set; }
        public string CNTBox { get; set; }
        public string NumBox { get; set; }

        public string WareHouseName { get; set; }
        public string FloorName { get; set; }
        public string LineName { get; set; }
        public string RackName { get; set; }
        public string CNTBoxName { get; set; }
        public string NumBoxName { get; set; }
        public string PositionBox { get; set; }

    }
}