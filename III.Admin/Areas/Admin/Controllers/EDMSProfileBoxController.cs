using Microsoft.AspNetCore.Mvc;
using III.Admin.Controllers;
using System.Collections.Generic;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using System.Linq;
using ESEIM.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Globalization;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class EDMSProfileBoxController : BaseController
    {
        private readonly EIMDBContext _context;

        public EDMSProfileBoxController(EIMDBContext context)
        {
            _context = context;
        }
        public IActionResult Index()
        {
            return View();
        }
        [HttpPost]
        public object JTable([FromBody]JTableBoxModel jTablePara)
        {
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = (from a in _context.EDMSBoxs
                         where (string.IsNullOrEmpty(jTablePara.BoxCode) || a.BoxCode.ToLower().Contains(jTablePara.BoxCode))
                         && (string.IsNullOrEmpty(jTablePara.BranchCode) || a.DepartCode.Equals(jTablePara.BranchCode))
                          && (string.IsNullOrEmpty(jTablePara.WHS_Code) || a.WHS_Code.Equals(jTablePara.WHS_Code))
                         && (string.IsNullOrEmpty(jTablePara.TypeProfile) || a.TypeProfile.Equals(jTablePara.TypeProfile))
                         && ((fromDate == null) || (a.StorageTime.HasValue && a.StorageTime.Value.Date >= fromDate))
                         && ((toDate == null) || (a.StorageTime.HasValue && a.StorageTime.Value.Date <= toDate))

                         select a).OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var count = (from a in _context.EDMSBoxs
                         where (string.IsNullOrEmpty(jTablePara.BoxCode) || a.BoxCode.ToLower().Contains(jTablePara.BoxCode))
                         && (string.IsNullOrEmpty(jTablePara.BranchCode) || a.DepartCode.Equals(jTablePara.BranchCode))
                          && (string.IsNullOrEmpty(jTablePara.WHS_Code) || a.WHS_Code.Equals(jTablePara.WHS_Code))
                         && (string.IsNullOrEmpty(jTablePara.TypeProfile) || a.TypeProfile.Equals(jTablePara.TypeProfile))
                         && ((fromDate == null) || (a.StorageTime.HasValue && a.StorageTime.Value.Date >= fromDate))
                         && ((toDate == null) || (a.StorageTime.HasValue && a.StorageTime.Value.Date <= toDate))

                         select a).AsNoTracking().Count();
            var data = (from a in query
                        select new
                        {
                            a.Id,
                            QR_Code = a.QR_Code != null ? CommonUtil.GenerateQRCode(a.QR_Code) : null,
                            a.BoxCode,
                            a.BoxSize,
                            a.NumBoxth,
                            a.CNT_Brief,
                            a.CNT_Cell,
                            a.DepartCode,
                            a.RackPosition,
                            a.StoragePeriod,
                            a.StatusSecurity,
                            StorageTime = a.StorageTime != null ? (a.StorageTime.Value).ToString("dd/MM/yyyy") : null,
                            FromDate = a.StartTime != null ? (a.StartTime.Value).ToString("dd/MM/yyyy") : null,
                            ToDate = a.EndTime != null ? (a.EndTime.Value).ToString("dd/MM/yyyy") : null,
                            WareHouseName = a.WHS_Code != null ? _context.EDMSWareHouses.Where(x => x.WHS_Flag != true && x.Type == "RV").FirstOrDefault(x => x.WHS_Code.Equals(a.WHS_Code))?.WHS_Name : null,
                            FloorName = a.FloorCode != null ? _context.EDMSFloors.FirstOrDefault(x => x.FloorCode.Equals(a.FloorCode))?.FloorName : null,
                            LineName = a.LineCode != null ? _context.EDMSLines.FirstOrDefault(x => x.LineCode.Equals(a.LineCode))?.L_Text : null,
                            RackName = a.RackCode != null ? _context.EDMSRacks.FirstOrDefault(x => x.RackCode.Equals(a.RackCode))?.RackName : null,
                            //TypeProfile = a.TypeProfile != null ? _context.CommonSettings.FirstOrDefault(x => x.SettingID == int.Parse(a.TypeProfile))?.ValueSet : null,
                            TypeProfile = a.TypeProfile != null ? _context.EDMSTimeOfDocumentPreservations.FirstOrDefault(x => x.Id == int.Parse(a.TypeProfile))?.TitleFull : null,
                            BranchName = a.DepartCode != null ? _context.AdOrganizations.FirstOrDefault(x => (x.OrgAddonCode.Equals(a.DepartCode)) && x.IsEnabled)?.OrgName : null
                        }

                        ).ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "QR_Code", "BoxCode", "BoxSize", "NumBoxth", "CNT_Brief"
                , "CNT_Cell", "DepartCode", "RackPosition", "StoragePeriod", "StatusSecurity", "StorageTime", "FromDate", "ToDate",
                "WareHousename", "FloorName", "LineName", "RackName", "TypeProfile", "BranchName");
            return Json(jdata);
        }

        //Thêm hộp tài liệu
        [HttpPost]
        public JMessage InsertBox([FromBody]EDMSBoxModel obj)
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
                        DepartCode = obj.BrCode,
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
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_ADD_SUCCESS"), "Thùng");
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_EXITS"), "Thùng");
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
        public JMessage UpdateBox([FromBody]EDMSBoxModel obj)
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
                    box.DepartCode = obj.BrCode;
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
                        msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_UPDATE_SUCCESS"), "Thùng");
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
                        DepartCode = obj.BrCode,
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
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_UPDATE_SUCCESS"), "Thùng");
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_UPDATE"));
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
    }

    public class JTableBoxModel : JTableModel
    {
        public string BoxCode { get; set; }
        public string FromDate { get; set; }
        public string ToDate { get; set; }
        public string TypeProfile { get; set; }
        public string BranchCode { get; set; }
        public string Status { get; set; }
        public string WHS_Code { get; set; }
    }
}