using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QRCoder;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class EDMSApproveRequestProfileController : Controller
    {
        private readonly EIMDBContext _context;
        private readonly IHostingEnvironment _hostingEnvironment;

        public EDMSApproveRequestProfileController(EIMDBContext context, IHostingEnvironment hostingEnvironment)
        {
            _context = context;
            _hostingEnvironment = hostingEnvironment;
        }

        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public object JTable([FromBody]JTableModel jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var session = HttpContext.GetSessionUser();
            var query = new List<EDMSRequestInputStore>();
            int count = 0;

            query = (from a in _context.EDMSRequestInputStores.Where(x => x.RqStatus == "PENDING" || x.RqStatus == "WAITING")
                     select a).OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            count = _context.EDMSRequestInputStores.AsNoTracking().Count();

            var data = (from a in query
                        select new
                        {
                            a.Id,
                            QR_Code = a.QR_Code != null ? CommonUtil.GenerateQRCode(a.QR_Code) : null,
                            a.RqTicketCode,
                            a.RqSupport,
                            a.RqStatus,
                            OrgName = _context.AdOrganizations.FirstOrDefault(x => x.OrgAddonCode.Equals(a.BrCode))?.OrgName,
                            a.DocType,
                            FromDate = a.FromDate != null ? (a.FromDate.Value).ToString("dd/MM/yyyy") : null,
                            ToDate = a.ToDate != null ? (a.ToDate.Value).ToString("dd/MM/yyyy") : null,
                            a.CreatedTime,
                            a.CreatedBy,
                            a.Note,
                            a.NumBox,
                            a.WHS_Code,
                            a.WHS_User,
                            GivenName = _context.Users.FirstOrDefault(x => x.UserName.Equals(a.WHS_User))?.GivenName,
                        }).ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "QR_Code", "RqTicketCode", "RqSupport", "RqStatus", "OrgName", "DocType", "FromDate", "ToDate", "CreatedTime", "CreatedBy", "Note", "NumBox", "WHS_Code", "WHS_User", "GivenName");
            return Json(jdata);
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

        //Lấy Id lớn nhất
        [HttpPost]
        public int GetIdMax()
        {
            var id = 1;
            try
            {
                var data = _context.EDMSRequestInputStores.MaxBy(x => x.Id);
                if (data != null)
                    id = data.Id + 1;
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return id;
        }

        //Thêm Y/C nhập kho
        [HttpPost]
        public JsonResult InsertRequestInputStore([FromBody]EDMSRequestInputStoreModel obj)
        {
            var msg = new JMessage();
            try
            {
                var dateFrom = !string.IsNullOrEmpty(obj.FromDate) ? DateTime.ParseExact(obj.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var dateTo = !string.IsNullOrEmpty(obj.ToDate) ? DateTime.ParseExact(obj.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

                var reqInputStore = _context.EDMSRequestInputStores.FirstOrDefault(x => x.RqTicketCode.Equals(obj.RqTicketCode));
                if (reqInputStore == null)
                {
                    var reqInputStoreObj = new EDMSRequestInputStore
                    {
                        RqTicketCode = obj.RqTicketCode,
                        BrCode = obj.BrCode,
                        WHS_Code = obj.WHS_Code,
                        WHS_User = obj.WHS_User,
                        NumBox = obj.NumBox,
                        DocType = obj.DocType,
                        FromDate = dateFrom,
                        ToDate = dateTo,
                        Note = obj.Note,
                        QR_Code = obj.RqTicketCode,
                        RqStatus = obj.RqStatus,
                        RqSupport = obj.RqSupport,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now
                    };

                    _context.EDMSRequestInputStores.Add(reqInputStoreObj);
                    _context.SaveChanges();

                    if (obj.ListFileRequest != null)
                    {
                        foreach (var file in obj.ListFileRequest)
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

                            var edmsReqFile = new EDMSReqInputFile
                            {
                                FileId = edmsFile.FileID,
                                ReqId = reqInputStoreObj.Id
                            };

                            _context.EDMSReqFiles.Add(edmsReqFile);
                            _context.SaveChanges();
                        }
                    }

                    foreach (var item in obj.ListBox)
                    {
                        item.RqCode = obj.RqTicketCode;

                        msg = InsertBox(item);
                    }

                    if (!msg.Error)
                        msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_ADD_SUCCESS"), "Phiếu Y/C");

                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_EXITS"), "Phiếu Y/C");
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_ADD"));
            }
            return Json(msg);
        }

        //Sửa Y/C nhập kho
        [HttpPost]
        public JsonResult UpdateRequestInputStore([FromBody]EDMSRequestInputStoreModel obj)
        {
            var msg = new JMessage();
            try
            {
                var dateFrom = !string.IsNullOrEmpty(obj.FromDate) ? DateTime.ParseExact(obj.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var dateTo = !string.IsNullOrEmpty(obj.ToDate) ? DateTime.ParseExact(obj.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

                var reqInputStore = _context.EDMSRequestInputStores.FirstOrDefault(x => x.Id.Equals(obj.Id));
                if (reqInputStore != null)
                {
                    reqInputStore.RqTicketCode = obj.RqTicketCode;
                    reqInputStore.BrCode = obj.BrCode;
                    reqInputStore.WHS_Code = obj.WHS_Code;
                    reqInputStore.WHS_User = obj.WHS_User;
                    reqInputStore.NumBox = obj.NumBox;
                    reqInputStore.DocType = obj.DocType;
                    reqInputStore.FromDate = dateFrom;
                    reqInputStore.ToDate = dateTo;
                    reqInputStore.Note = obj.Note;
                    reqInputStore.QR_Code = obj.RqTicketCode;
                    reqInputStore.RqStatus = obj.RqStatus;
                    reqInputStore.RqSupport = obj.RqSupport;
                    reqInputStore.UpdatedTime = DateTime.Now;
                    reqInputStore.UpdatedBy = ESEIM.AppContext.UserName;

                    _context.EDMSRequestInputStores.Update(reqInputStore);
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

                    if (obj.ListFileRequest != null)
                    {
                        foreach (var file in obj.ListFileRequest)
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

                                var edmsReqFile = new EDMSReqInputFile
                                {
                                    FileId = edmsFile.FileID,
                                    ReqId = reqInputStore.Id
                                };

                                _context.EDMSReqFiles.Add(edmsReqFile);
                                _context.SaveChanges();
                            }
                        }
                    }

                    if (obj.ListFileRequestRemove != null)
                    {
                        foreach (var itemRemove in obj.ListFileRequestRemove)
                        {
                            msg = RemoveFileRequest(itemRemove.FileId);
                            if (msg.Error)
                                break;
                        }
                    }

                    if (obj.ListBox != null)
                    {
                        foreach (var item in obj.ListBox)
                        {
                            item.RqCode = obj.RqTicketCode;

                            msg = UpdateBox(item);
                        }
                    }

                    if (!msg.Error)
                        msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_UPDATE_SUCCESS"), "Phiếu Y/C");
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_EXITS"), "Phiếu Y/C");
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_ADD"));
            }
            return Json(msg);
        }


        //Duyệt
        [HttpPost]
        public JsonResult Approve(int id)
        {
            var msg = new JMessage();
            try
            {
                var reqInputStore = _context.EDMSRequestInputStores.FirstOrDefault(x => x.Id.Equals(id));
                if (reqInputStore != null)
                {
                    reqInputStore.RqStatus = "APPROVED";
                    _context.EDMSRequestInputStores.Update(reqInputStore);
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
                var reqInputStore = _context.EDMSRequestInputStores.FirstOrDefault(x => x.Id.Equals(id));
                if (reqInputStore != null)
                {
                    reqInputStore.RqStatus = "WAITING";
                    _context.EDMSRequestInputStores.Update(reqInputStore);
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
                var reqInputStore = _context.EDMSRequestInputStores.FirstOrDefault(x => x.Id.Equals(id));
                if (reqInputStore != null)
                {
                    reqInputStore.RqStatus = "REJECTED";
                    _context.EDMSRequestInputStores.Update(reqInputStore);
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

        //Xóa Y/C nhập kho
        [HttpPost]
        public JsonResult DeleteRequestInputStore(int id)
        {
            var msg = new JMessage();
            try
            {
                var reqInputStore = _context.EDMSRequestInputStores.FirstOrDefault(x => x.Id.Equals(id));
                if (reqInputStore != null)
                {
                    _context.EDMSRequestInputStores.Remove(reqInputStore);
                    _context.SaveChanges();

                    var listBoxs = _context.EDMSBoxs.Where(x => x.RqCode.Equals(reqInputStore.RqTicketCode)).ToList();

                    if (listBoxs.Count > 0)
                    {
                        foreach (var box in listBoxs)
                        {
                            _context.EDMSBoxs.Remove(box);
                            _context.SaveChanges();
                        }
                    }

                    msg.Error = false;
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_SUCCESS"), "Phiếu Y/C");
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_EXITS"), "Phiếu Y/C");
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
                        url = "~/uploads/file/" + fileName;

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
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_ADD_SUCCESS"), "Tệp tin");
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_EXITS"), "Tệp tin");
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
        public JMessage RemoveFileRequest(int? fileId)
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

        //Thêm hộp tài liệu
        [HttpPost]
        public JMessage InsertBox(EDMSBoxModel obj)
        {
            var msg = new JMessage();
            try
            {
                var startTime = !string.IsNullOrEmpty(obj.StartTime) ? DateTime.ParseExact(obj.StartTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var endTime = !string.IsNullOrEmpty(obj.EndTime) ? DateTime.ParseExact(obj.EndTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var storageTime = !string.IsNullOrEmpty(obj.StorageTime) ? DateTime.ParseExact(obj.EndTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

                var box = _context.EDMSBoxs.FirstOrDefault(x => x.BoxCode.Equals(obj.BoxCode));
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
                        StatusBox = obj.StatusBox,
                        LstMemberId = obj.LstMemberId,
                        RqCode = obj.RqCode,
                        LstTypeProfileId = obj.LstTypeProfileId,
                    };

                    _context.EDMSBoxs.Add(boxObj);
                    _context.SaveChanges();


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

        //Cập nhật hộp tài liệu
        [HttpPost]
        public JMessage UpdateBox(EDMSBoxModel obj)
        {
            var msg = new JMessage();
            try
            {
                var startTime = !string.IsNullOrEmpty(obj.StartTime) ? DateTime.ParseExact(obj.StartTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var endTime = !string.IsNullOrEmpty(obj.EndTime) ? DateTime.ParseExact(obj.EndTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var storageTime = !string.IsNullOrEmpty(obj.StorageTime) ? DateTime.ParseExact(obj.EndTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

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
                    box.StatusBox = obj.StatusBox;
                    box.LstMemberId = obj.LstMemberId;
                    box.RqCode = obj.RqCode;
                    box.LstTypeProfileId = obj.LstTypeProfileId;

                    _context.EDMSBoxs.Update(box);
                    _context.SaveChanges();

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
                        StatusBox = obj.StatusBox,
                        LstMemberId = obj.LstMemberId,
                        RqCode = obj.RqCode,
                        LstTypeProfileId = obj.LstTypeProfileId,
                    };

                    _context.EDMSBoxs.Add(boxObj);
                    _context.SaveChanges();

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
    }
}