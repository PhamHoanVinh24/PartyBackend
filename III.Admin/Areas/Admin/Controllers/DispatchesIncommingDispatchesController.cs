using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using III.Domain.Enums;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class DispatchesIncommingDispatchesController : BaseController
    {
        public class IncomingDispatchesJtable : JTableModel
        {
            public string Number { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string Origanization { get; set; }
            public string DocumentSymbol { get; set; }
            public string DocumentSymbols { get; set; }
            public string CreatedTimeFrom { get; set; }
            public string CreatedTimeTo { get; set; }
            public string Note { get; set; }
            public string Status { get; set; }
            public int? Year { get; set; }

        }
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        //private readonly IFCMPushNotification _notification;
        private readonly IHostingEnvironment _hostingEnvironment;
        private static AsyncLocker<string> userLock = new AsyncLocker<string>();

        public DispatchesIncommingDispatchesController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment)
        {
            _context = context;
            _upload = upload;
            _hostingEnvironment = hostingEnvironment;
        }

        #region Index
        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public object JTable([FromBody]IncomingDispatchesJtable jTablePara)
        {
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var createdFrom = !string.IsNullOrEmpty(jTablePara.CreatedTimeFrom) ? DateTime.ParseExact(jTablePara.CreatedTimeFrom, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var createdTo = !string.IsNullOrEmpty(jTablePara.CreatedTimeTo) ? DateTime.ParseExact(jTablePara.CreatedTimeTo, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = (from a in _context.DispatchesHeaders
                         where ((jTablePara.Number == null) || (a.DocumentNumber.ToString().Contains(jTablePara.Number.ToString())))
                          && (string.IsNullOrEmpty(jTablePara.FromDate) || (a.FromDate.HasValue && a.FromDate.Value.Date >= fromDate.Value.Date))
                          && (string.IsNullOrEmpty(jTablePara.ToDate) || (a.FromDate.HasValue && a.FromDate.Value.Date <= toDate.Value.Date))
                          && (string.IsNullOrEmpty(jTablePara.CreatedTimeFrom) || (a.CreatedTime.HasValue && a.CreatedTime.Value.Date >= createdFrom.Value.Date))
                          && (string.IsNullOrEmpty(jTablePara.CreatedTimeTo) || (a.CreatedTime.HasValue && a.CreatedTime.Value.Date <= createdTo.Value.Date))
                          && ((string.IsNullOrEmpty(jTablePara.Origanization)) || (a.Origanization.ToLower().Contains(jTablePara.Origanization.ToLower())))
                          && ((string.IsNullOrEmpty(jTablePara.DocumentSymbol)) || (a.DocumentSymbol != null && a.DocumentSymbol.ToLower().Contains(jTablePara.DocumentSymbol.ToLower())))
                          && ((string.IsNullOrEmpty(jTablePara.Note)) || (a.Note != null && a.Note.ToLower().Contains(jTablePara.Note.ToLower())))
                          && ((string.IsNullOrEmpty(jTablePara.Status)) || (a.Status.ToLower().Contains(jTablePara.Status.ToLower())))
                          && ((jTablePara.Year == null) || (a.Year.Equals(jTablePara.Year)))
                          && (a.IsDeleted == false)
                          && a.Type == EnumHelper<DocumentTypeEnum>.GetDisplayValue(DocumentTypeEnum.InBoxType)
                         select a).AsNoTracking().OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).ToList();
            var count = (from a in _context.DispatchesHeaders
                         where ((jTablePara.Number == null) || (a.DocumentNumber.ToString().Contains(jTablePara.Number.ToString())))
                          && (string.IsNullOrEmpty(jTablePara.FromDate) || (a.FromDate.HasValue && a.FromDate.Value.Date >= fromDate.Value.Date))
                          && (string.IsNullOrEmpty(jTablePara.ToDate) || (a.FromDate.HasValue && a.FromDate.Value.Date <= toDate.Value.Date))
                          && (string.IsNullOrEmpty(jTablePara.CreatedTimeFrom) || (a.CreatedTime.HasValue && a.CreatedTime.Value.Date >= createdFrom.Value.Date))
                          && (string.IsNullOrEmpty(jTablePara.CreatedTimeTo) || (a.CreatedTime.HasValue && a.CreatedTime.Value.Date <= createdTo.Value.Date))
                          && ((string.IsNullOrEmpty(jTablePara.Origanization)) || (a.Origanization.ToLower().Contains(jTablePara.Origanization.ToLower())))
                          && ((string.IsNullOrEmpty(jTablePara.DocumentSymbol)) || (a.DocumentSymbol != null && a.DocumentSymbol.ToLower().Contains(jTablePara.DocumentSymbol.ToLower())))
                          && ((string.IsNullOrEmpty(jTablePara.Note)) || (a.Note != null && a.Note.ToLower().Contains(jTablePara.Note.ToLower())))
                          && ((string.IsNullOrEmpty(jTablePara.Status)) || (a.Status.ToLower().Contains(jTablePara.Status.ToLower())))
                          && ((jTablePara.Year == null) || (a.Year.Equals(jTablePara.Year)))
                          && (a.IsDeleted == false)
                          && a.Type == EnumHelper<DocumentTypeEnum>.GetDisplayValue(DocumentTypeEnum.InBoxType)
                         select a).AsNoTracking().Count();
            var data = query.Select(x => new
            {
                x.Id,
                x.FromDate,
                x.DocumentSymbol,
                x.DocumentNumber,
                x.DocumentCode,
                x.Origanization,
                x.CreatedTime,
                x.Status,
                x.Note,
                x.DocumentSymbols
            }).ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "FromDate", "DocumentSymbol", "DocumentNumber", "DocumentName", "Origanization", "Note", "SignUser", "CreatedTime", "Status", "Note", "DocumentSymbols");
            return Json(jdata);
        }

        [HttpPost]
        public async Task<JsonResult> InsertAsync([FromBody]IncommingDispatchesModel obj)
        {
            var msg = new JMessage { Title = "", Error = false };
            try
            {
                using (await userLock.LockAsync(obj.Header.DocumentNumber.ToString()))
                {
                    //checkExist documentNumber
                    var checkNumber = await _context.DispatchesHeaders.FirstOrDefaultAsync(x => x.DocumentNumber == obj.Header.DocumentNumber && x.DocumentCode == obj.Header.DocumentCode && x.Type == EnumHelper<DocumentTypeEnum>.GetDisplayValue(DocumentTypeEnum.InBoxType));
                    if (checkNumber != null)
                    {
                        msg.Error = true;
                        msg.Title = String.Format(CommonUtil.ResourceValue("DID_MSG_NUMBER_DISPATCHES_EXIST"));
                    }
                    else
                    {
                        var model = new DispatchesHeader
                        {
                            DispatchCode = Guid.NewGuid().ToString(),
                            DocumentCode = obj.Header.DocumentCode,
                            DocumentSymbol = obj.Header.DocumentSymbol,
                            FromDate = !string.IsNullOrEmpty(obj.Header.FromDate) ? DateTime.ParseExact(obj.Header.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null,
                            DocumentZone = obj.Header.DocumentZone,
                            SignUser = obj.Header.SignUser,
                            Confidentiality = obj.Header.Confidentiality,
                            CreatedUserId = obj.Header.CreatedUserId,
                            IsReply = obj.Header.IsReply,
                            DocumentNumber = obj.Header.DocumentNumber,
                            Origanization = obj.Header.Origanization,
                            PromulgateDate = !string.IsNullOrEmpty(obj.Header.PromulgateDate) ? DateTime.ParseExact(obj.Header.PromulgateDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null,
                            DocumentType = obj.Header.DocumentType,
                            Position = obj.Header.Position,
                            GetMothod = obj.Header.GetMothod,
                            UnitEditor = obj.Header.UnitEditor,
                            IsProcess = obj.Header.IsProcess,
                            ReplyStatus = obj.Header.ReplyStatus,
                            Note = obj.Header.Note,
                            Type = EnumHelper<DocumentTypeEnum>.GetDisplayValue(DocumentTypeEnum.InBoxType),
                            CreatedTime = DateTime.Now,
                            Year = DateTime.Now.Year,
                            Status = EnumHelper<DocumentStatusEnum>.GetDisplayValue(DocumentStatusEnum.Pending),
                        };
                        var category = _context.DispatchesCategorys.FirstOrDefault(x => x.Code == obj.Header.DocumentCode && x.IsDeleted == false);
                        category.NumberCreator = obj.Header.DocumentNumber + 1;
                        _context.DispatchesCategorys.Update(category);
                        _context.DispatchesHeaders.Add(model);
                        string processcode = Guid.NewGuid().ToString();
                        var tracking = new DispatchTrackingProcess
                        {
                            DispatchCode = model.DispatchCode,
                            FromNode = obj.Header.UnitEditor,
                            ProcessCode = processcode,
                            Action = EnumHelper<DocumentStatusEnum>.GetDisplayValue(DocumentStatusEnum.Created),
                            CreatedTime = model.CreatedTime,
                            Reason = obj.Detail.Reason,
                            UserId = obj.Header.CreatedUserId,
                            DeadLine = !string.IsNullOrEmpty(obj.Detail.DeadLine) ? DateTime.ParseExact(obj.Detail.DeadLine, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null,
                        };
                        _context.DispatchTrackingProcesss.Add(tracking);
                        //Member
                        foreach (var member in obj.Detail.ListMember)
                        {
                            var activity = new DispatchesMemberActivity
                            {
                                Assigner = member.Assigner,
                                ProcessCode = processcode,
                                UserId = member.UserId,
                                Role = member.Role,
                                Comment = member.Comment,
                                CreatedTime = member.CreatedTime,
                            };
                            _context.DispatchesMemberActivitys.Add(activity);
                            ////Insert mobile (send user)
                            //var mobibleConfirm = new MobileConfirm
                            //{
                            //    DispatchCode = model.DispatchCode,
                            //    Assigner = member.Assigner,
                            //    Assignee = member.UserId,
                            //    Comment = member.Comment,
                            //    CreatedTime = DateTime.Now,
                            //    Role = member.Role,
                            //    Status = 0,
                            //    Type = 0,
                            //};
                            //_context.MobileConfirms.Add(mobibleConfirm);
                        }

                        //File
                        foreach (var file in obj.Detail.ListFile)
                        {
                            var dispatchesFile = new DispatchesFileACT
                            {
                                ProcessCode = processcode,
                                FileName = file.FileName,
                                Soure = file.Source,
                                UserId = obj.Header.CreatedUserId,
                                Fomart = file.Fomart,
                                CreatedTime = file.CreatedTime,
                            };
                            _context.DispatchesFileACTs.Add(dispatchesFile);
                        }

                        //Comment
                        foreach (var comment in obj.Detail.ListComment)
                        {
                            var dispatchesComment = new DispatchesCommentACT
                            {
                                ProcessCode = processcode,
                                Comment = comment.Comment,
                                UserId = ESEIM.AppContext.UserId,
                                CreatedTime = comment.CreatedTime,
                            };
                            _context.DispatchesCommentACTs.Add(dispatchesComment);
                        }
                        //send notification to user
                        //var listToken = await _context.MobileFCMTokens.Where(x => obj.Detail.ListMember.Any(y => y.UserId == x.UserId)).Select(x => x.Token).AsNoTracking().ToListAsync();
                        //var sendNotification = _notification.SendNotificationToUser("Văn bản mới", "Thông báo mới", listToken, new { message = "Có văn bản mới" });
                        _context.SaveChanges();
                        msg.Title = String.Format(CommonUtil.ResourceValue("DID_MSG_UPDATE_MOVE_SUCCESS"));
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ADD_SUCCESS"));
            }
            return Json(msg);
        }

        [HttpPost]
        public async Task<JsonResult> UpdateAsync([FromBody]IncommingDispatchesModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                using (await userLock.LockAsync(obj.Header.DocumentNumber.ToString()))
                {
                    var dispatchess = await _context.DispatchesHeaders.FirstOrDefaultAsync(x => x.Id == obj.Header.Id);
                    if (obj.Header.DocumentNumber != dispatchess.DocumentNumber)
                    {
                        var checkNumber = _context.DispatchesHeaders.FirstOrDefault(x => x.DocumentNumber == obj.Header.DocumentNumber && x.DocumentCode == obj.Header.DocumentCode && x.Id != dispatchess.Id && x.Type == EnumHelper<DocumentTypeEnum>.GetDisplayValue(DocumentTypeEnum.InBoxType));
                        if (checkNumber != null)
                        {
                            msg.Error = true;
                            msg.Title = String.Format(CommonUtil.ResourceValue("DID_MSG_NUMBER_DISPATCHES_EXIST"));
                        }
                        else
                        {
                            dispatchess.DocumentCode = obj.Header.DocumentCode;
                            dispatchess.DocumentSymbol = obj.Header.DocumentSymbol;
                            dispatchess.FromDate = !string.IsNullOrEmpty(obj.Header.FromDate) ? DateTime.ParseExact(obj.Header.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                            dispatchess.DocumentZone = obj.Header.DocumentZone;
                            dispatchess.SignUser = obj.Header.SignUser;
                            dispatchess.Confidentiality = obj.Header.Confidentiality;
                            //dispatchess.CreatedBy = obj.Header.CreatedBy;
                            dispatchess.IsReply = obj.Header.IsReply;
                            dispatchess.ExperiedReply = !string.IsNullOrEmpty(obj.Header.ExperiedReply) ? DateTime.ParseExact(obj.Header.ExperiedReply, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                            dispatchess.DocumentNumber = obj.Header.DocumentNumber;
                            dispatchess.Origanization = obj.Header.Origanization;
                            dispatchess.PromulgateDate = !string.IsNullOrEmpty(obj.Header.PromulgateDate) ? DateTime.ParseExact(obj.Header.PromulgateDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                            dispatchess.DocumentType = obj.Header.DocumentType;
                            dispatchess.Position = obj.Header.Position;
                            dispatchess.GetMothod = obj.Header.GetMothod;
                            dispatchess.UnitEditor = obj.Header.UnitEditor;
                            dispatchess.IsProcess = obj.Header.IsProcess;
                            dispatchess.ReplyStatus = obj.Header.ReplyStatus;
                            dispatchess.Note = obj.Header.Note;
                            dispatchess.Type = EnumHelper<DocumentTypeEnum>.GetDisplayValue(DocumentTypeEnum.InBoxType);
                            dispatchess.CreatedTime = DateTime.Now;
                            dispatchess.CreatedUserId = obj.Header.CreatedUserId;
                            //_context.DispatchesHeaders.Update(dispatchess);

                            ////update category
                            //var category = _context.Categorys.FirstOrDefault(x => x.Code == obj.Header.DocumentCode);
                            //category.NumberCreator = obj.Header.DocumentNumber + 1;
                            //_context.Categorys.Update(category);

                            var tracking = _context.DispatchTrackingProcesss.FirstOrDefault(x => x.DispatchCode == dispatchess.DispatchCode);
                            var trackingNew = new DispatchTrackingProcess
                            {
                                DispatchCode = tracking.DispatchCode,
                                ProcessCode = tracking.ProcessCode,
                                Action = EnumHelper<DocumentStatusEnum>.GetDisplayValue(DocumentStatusEnum.Updated),
                                CreatedTime = DateTime.Now,
                                Reason = obj.Detail.Reason,
                                UserId = obj.Header.CreatedUserId,
                                DeadLine = !string.IsNullOrEmpty(obj.Detail.DeadLine) ? DateTime.ParseExact(obj.Detail.DeadLine, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null,
                            };
                            _context.DispatchTrackingProcesss.Add(trackingNew);

                            //file
                            if (obj.Detail.ListDeleteFile.Any())
                            {
                                var listFile = _context.DispatchesFileACTs.Where(x => obj.Detail.ListDeleteFile.Any(y => y == x.Id));
                                _context.DispatchesFileACTs.RemoveRange(listFile);
                            }
                            var listFileNew = obj.Detail.ListFile.Where(x => x.Id < 0);
                            if (listFileNew.Any())
                            {
                                foreach (var file in listFileNew)
                                {
                                    var dispatchesFile = new DispatchesFileACT
                                    {
                                        ProcessCode = tracking.ProcessCode,
                                        FileName = file.FileName,
                                        Soure = file.Source,
                                        UserId = obj.Header.CreatedUserId,
                                        Fomart = file.Fomart,
                                        CreatedTime = file.CreatedTime,
                                    };
                                    _context.DispatchesFileACTs.Add(dispatchesFile);
                                }
                            }
                            foreach (var comment in obj.Detail.ListComment)
                            {
                                var data = _context.DispatchesCommentACTs.FirstOrDefault(x => x.Id == comment.Id);
                                if (data != null)
                                {
                                    data.Comment = comment.Comment;
                                    _context.DispatchesCommentACTs.Update(data);
                                }
                            }


                            //comment
                            if (obj.Detail.ListDeleteComment.Any())
                            {
                                var listComment = _context.DispatchesCommentACTs.Where(x => obj.Detail.ListDeleteComment.Any(y => y == x.Id));
                                _context.DispatchesCommentACTs.RemoveRange(listComment);
                            }
                            var listCommentNew = obj.Detail.ListComment.Where(x => x.Id < 0);
                            if (listCommentNew.Any())
                            {
                                foreach (var comment in listCommentNew)
                                {
                                    var dispatchesComment = new DispatchesCommentACT
                                    {
                                        ProcessCode = tracking.ProcessCode,
                                        Comment = comment.Comment,
                                        UserId = ESEIM.AppContext.UserId,
                                        CreatedTime = comment.CreatedTime,
                                    };
                                    _context.DispatchesCommentACTs.Add(dispatchesComment);
                                }
                            }
                            //member
                            var listMemberNew = obj.Detail.ListMember.Where(x => x.Id < 0);
                            if (listMemberNew.Any())
                            {
                                foreach (var member in listMemberNew)
                                {
                                    var activity = new DispatchesMemberActivity
                                    {
                                        Assigner = member.Assigner,
                                        ProcessCode = tracking.ProcessCode,
                                        UserId = member.UserId,
                                        Role = member.Role,
                                        CreatedTime = member.CreatedTime,
                                    };
                                    _context.DispatchesMemberActivitys.Add(activity);

                                    //Insert mobile(send user)
                                    //var mobibleConfirm = new MobileConfirm
                                    //{
                                    //    Assigner = member.Assigner,
                                    //    Assignee = member.UserId,
                                    //    Comment = member.Comment,
                                    //    CreatedTime = DateTime.Now,
                                    //    Role = member.Role,
                                    //    Status = 0,
                                    //    Type = 0,
                                    //};
                                    //_context.MobileConfirms.Add(mobibleConfirm);
                                }
                            }
                            var listMemberUpdate = obj.Detail.ListMember.Where(x => x.Id > 0);
                            if (listMemberUpdate.Any())
                            {
                                foreach (var member in listMemberUpdate)
                                {
                                    var data = _context.DispatchesMemberActivitys.FirstOrDefault(x => x.Id == member.Id);
                                    if (data != null)
                                    {
                                        data.Comment = member.Comment;
                                        _context.DispatchesMemberActivitys.Update(data);
                                    }
                                }
                            }

                            ////send notification to user
                            //var listToken = await _context.MobileFCMTokens.Where(x => obj.Detail.ListMember.Any(y => y.UserId == x.UserId)).Select(x => x.Token).AsNoTracking().ToListAsync();
                            //var sendNotification = _notification.SendNotificationToUser("Văn bản mới", "Thông báo mới", listToken, new { message = "Có văn bản mới" });
                            _context.SaveChanges();
                            msg.Title = String.Format(CommonUtil.ResourceValue("DID_MSG_UPDATE_MOVE_SUCCESS"));
                        }
                    }
                    else
                    {
                        dispatchess.DocumentCode = obj.Header.DocumentCode;
                        dispatchess.DocumentSymbol = obj.Header.DocumentSymbol;
                        dispatchess.FromDate = !string.IsNullOrEmpty(obj.Header.FromDate) ? DateTime.ParseExact(obj.Header.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                        dispatchess.DocumentZone = obj.Header.DocumentZone;
                        dispatchess.SignUser = obj.Header.SignUser;
                        dispatchess.Confidentiality = obj.Header.Confidentiality;
                        //dispatchess.CreatedBy = obj.Header.CreatedBy;
                        dispatchess.IsReply = obj.Header.IsReply;
                        dispatchess.ExperiedReply = !string.IsNullOrEmpty(obj.Header.ExperiedReply) ? DateTime.ParseExact(obj.Header.ExperiedReply, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                        dispatchess.DocumentNumber = obj.Header.DocumentNumber;
                        dispatchess.Origanization = obj.Header.Origanization;
                        dispatchess.PromulgateDate = !string.IsNullOrEmpty(obj.Header.PromulgateDate) ? DateTime.ParseExact(obj.Header.PromulgateDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                        dispatchess.DocumentType = obj.Header.DocumentType;
                        dispatchess.Position = obj.Header.Position;
                        dispatchess.GetMothod = obj.Header.GetMothod;
                        dispatchess.UnitEditor = obj.Header.UnitEditor;
                        dispatchess.IsProcess = obj.Header.IsProcess;
                        dispatchess.ReplyStatus = obj.Header.ReplyStatus;
                        dispatchess.Note = obj.Header.Note;
                        dispatchess.Type = EnumHelper<DocumentTypeEnum>.GetDisplayValue(DocumentTypeEnum.InBoxType);
                        dispatchess.CreatedTime = DateTime.Now;
                        dispatchess.CreatedUserId = obj.Header.CreatedUserId;
                        //_context.DispatchesHeaders.Update(dispatchess);

                        var tracking = _context.DispatchTrackingProcesss.FirstOrDefault(x => x.DispatchCode == dispatchess.DispatchCode);
                        var trackingNew = new DispatchTrackingProcess
                        {
                            DispatchCode = tracking.DispatchCode,
                            ProcessCode = tracking.ProcessCode,
                            Action = EnumHelper<DocumentStatusEnum>.GetDisplayValue(DocumentStatusEnum.Updated),
                            CreatedTime = DateTime.Now,
                            Reason = obj.Detail.Reason,
                            UserId = obj.Header.CreatedUserId,
                            DeadLine = !string.IsNullOrEmpty(obj.Detail.DeadLine) ? DateTime.ParseExact(obj.Detail.DeadLine, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null,
                        };
                        _context.DispatchTrackingProcesss.Add(trackingNew);

                        //file
                        var listFileNew = obj.Detail.ListFile.Where(x => x.Id < 0);
                        if (listFileNew.Any())
                        {
                            foreach (var file in listFileNew)
                            {
                                var dispatchesFile = new DispatchesFileACT
                                {
                                    ProcessCode = tracking.ProcessCode,
                                    FileName = file.FileName,
                                    Soure = file.Source,
                                    UserId = obj.Header.CreatedUserId,
                                    Fomart = file.Fomart,
                                    CreatedTime = file.CreatedTime,
                                };
                                _context.DispatchesFileACTs.Add(dispatchesFile);
                            }
                        }

                        //comment
                        foreach (var comment in obj.Detail.ListComment)
                        {
                            var data = _context.DispatchesCommentACTs.FirstOrDefault(x => x.Id == comment.Id);
                            if (data != null)
                            {
                                data.Comment = comment.Comment;
                                _context.DispatchesCommentACTs.Update(data);
                            }
                        }
                        if (obj.Detail.ListDeleteComment.Any())
                        {
                            var listComment = _context.DispatchesCommentACTs.Where(x => obj.Detail.ListDeleteComment.Any(y => y == x.Id));
                            _context.DispatchesCommentACTs.RemoveRange(listComment);
                        }
                        var listCommentNew = obj.Detail.ListComment.Where(x => x.Id < 0);
                        if (listCommentNew.Any())
                        {
                            foreach (var comment in listCommentNew)
                            {
                                var dispatchesComment = new DispatchesCommentACT
                                {
                                    ProcessCode = tracking.ProcessCode,
                                    Comment = comment.Comment,
                                    UserId = ESEIM.AppContext.UserId,
                                    CreatedTime = comment.CreatedTime,
                                };
                                _context.DispatchesCommentACTs.Add(dispatchesComment);
                            }
                        }
                        //member
                        //file
                        if (obj.Detail.ListDeleteFile.Any())
                        {
                            var listFile = _context.DispatchesFileACTs.Where(x => obj.Detail.ListDeleteFile.Any(y => y == x.Id));
                            _context.DispatchesFileACTs.RemoveRange(listFile);
                        }
                        var listMemberNew = obj.Detail.ListMember.Where(x => x.Id < 0);
                        if (listMemberNew.Any())
                        {
                            foreach (var member in listMemberNew)
                            {
                                var activity = new DispatchesMemberActivity
                                {
                                    Assigner = member.Assigner,
                                    ProcessCode = tracking.ProcessCode,
                                    UserId = member.UserId,
                                    Role = member.Role,
                                    Comment = member.Comment,
                                    CreatedTime = member.CreatedTime,
                                };
                                _context.DispatchesMemberActivitys.Add(activity);
                                //Insert mobile (send user)
                                //var mobibleConfirm = new MobileConfirm
                                //{
                                //    DispatchCode = dispatchess.DispatchCode,
                                //    Assigner = member.Assigner,
                                //    Assignee = member.UserId,
                                //    Comment = member.Comment,
                                //    CreatedTime = DateTime.Now,
                                //    Role = member.Role,
                                //    Status = 0,
                                //    Type = 0,
                                //};
                                //_context.MobileConfirms.Add(mobibleConfirm);
                            }
                        }
                        var listMemberUpdate = obj.Detail.ListMember.Where(x => x.Id > 0);
                        if (listMemberUpdate.Any())
                        {
                            foreach (var member in listMemberUpdate)
                            {
                                var data = _context.DispatchesMemberActivitys.FirstOrDefault(x => x.Id == member.Id);
                                if (data != null)
                                {
                                    data.Comment = member.Comment;
                                    _context.DispatchesMemberActivitys.Update(data);
                                }
                            }
                        }

                        //send notification to user
                        //var listToken = _context.MobileFCMTokens.Where(x => obj.Detail.ListMember.Any(y => y.UserId == x.UserId)).Select(x => x.Token).AsNoTracking().ToList();
                        //var sendNotification = _notification.SendNotificationToUser("Văn bản mới", "Thông báo mới", listToken, new { message = "Có văn bản mới" });
                        _context.SaveChanges();
                        msg.Title = String.Format(CommonUtil.ResourceValue("DID_MSG_UPDATE_MOVE_SUCCESS"));
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("DID_MSG_ERR_UPDATE_MOVE"));
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Recover([FromBody]int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = _context.DispatchesHeaders.FirstOrDefault(x => x.Id == id);
                var listTracking = _context.DispatchTrackingProcesss.Where(x => x.DispatchCode == data.DispatchCode);
                var tracking = listTracking.First();
                var listMember = _context.DispatchesMemberActivitys.Where(x => x.ProcessCode == tracking.ProcessCode);
                var listComment = _context.DispatchesCommentACTs.Where(x => x.ProcessCode == tracking.ProcessCode);
                if (data.Status != EnumHelper<DocumentStatusEnum>.GetDisplayValue(DocumentStatusEnum.Done))
                {
                    if (ESEIM.AppContext.UserName == "hongnt")
                    {
                        _context.DispatchesHeaders.Remove(data);
                        _context.DispatchTrackingProcesss.RemoveRange(listTracking);
                        _context.DispatchesMemberActivitys.RemoveRange(listMember);
                        _context.DispatchesCommentACTs.RemoveRange(listComment);
                        _context.SaveChanges();
                        msg.Title = String.Format(CommonUtil.ResourceValue("DID_MSG_CONFISCATION_SUCCESS"));
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = String.Format(CommonUtil.ResourceValue("DID_MSG_VALIDATE_NON_CONFISCATION"));
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("DID_MSG_DOCUMENT_SUCCESS_NONCONFISCATION"));
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("DID_MSG_ERR_NONCONFISCATION"));
            }
            return Json(msg);
        }


        [HttpPost]
        public JsonResult GetItem([FromBody]int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var userId = ESEIM.AppContext.UserId;
                var data = _context.DispatchesHeaders.FirstOrDefault(x => x.Id == id);
                var model = new IncommingDispatchesModel();
                //header
                model.Header = new IncommingDispatchesHeaderModel
                {
                    Id = data.Id,
                    DocumentCode = data.DocumentCode,
                    DocumentSymbol = data.DocumentSymbol,
                    FromDate = data.FromDate.HasValue ? data.FromDate.Value.ToString("dd/MM/yyyy") : null,
                    DocumentZone = data.DocumentZone,
                    SignUser = data.SignUser,
                    Confidentiality = data.Confidentiality,
                    IsReply = data.IsReply,
                    DispatchCode = data.DispatchCode,
                    DocumentNumber = data.DocumentNumber,
                    Origanization = data.Origanization,
                    PromulgateDate = data.PromulgateDate.HasValue ? data.PromulgateDate.Value.ToString("dd/MM/yyyy") : null,
                    DocumentType = data.DocumentType,
                    Position = data.Position,
                    GetMothod = data.GetMothod,
                    UnitEditor = data.UnitEditor,
                    IsProcess = data.IsProcess,
                    ReplyStatus = data.ReplyStatus,
                    Note = data.Note,
                    Type = data.Type,
                    CreatedTime = data.CreatedTime,
                    CreatedUserId = data.CreatedUserId,
                };

                var tracking = _context.DispatchTrackingProcesss.FirstOrDefault(x => x.DispatchCode == data.DispatchCode);
                //var maxUserCreated = _context.TrackingDispatchProcesss.Where(x => x.DispatchCode == data.DispatchCode && x.UserId == userCreated.UserId).MaxBy(x => x.CreatedTime);
                //file
                var listFile = _context.DispatchesFileACTs.Where(x => x.ProcessCode == tracking.ProcessCode).Select(y => new IncommingDispatchesFile
                {
                    Id = y.Id,
                    User = y.User.GivenName,
                    FileName = y.FileName,
                    Fomart = y.Fomart,
                    Source = y.Soure,
                    CreatedTime = y.CreatedTime,
                    IsShowDelete = true,
                }).AsNoTracking();
                model.Detail.ListFile.AddRange(listFile);

                //comment
                var listComment = _context.DispatchesCommentACTs.Where(x => x.ProcessCode == tracking.ProcessCode).Select(y => new IncommingDispatchesComment
                {
                    Id = y.Id,
                    User = y.User.GivenName,
                    Comment = y.Comment,
                    CreatedTime = y.CreatedTime,
                    IsShowComment = y.UserId.Equals(userId) ? true : false,
                }).OrderByDescending(x => x.Id).AsNoTracking();
                model.Detail.ListComment.AddRange(listComment);

                //groupUser
                var listMember = _context.DispatchesMemberActivitys.Where(x => x.ProcessCode == tracking.ProcessCode).Select(x => new IncommingDispatchesMember
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
                    Status = x.AssigneeConfirm,
                    IsShowDelete = false,
                    IsShowComment = x.Assigner.Equals(userId) ? true : false,
                    Comment = x.Comment
                }).OrderBy(x => x.Id).AsNoTracking();
                model.Detail.ListMember.AddRange(listMember);
                model.Status = data.Status.Equals(EnumHelper<DocumentStatusEnum>.GetDisplayValue(DocumentStatusEnum.Done)) ? true : false;
                msg.Object = model;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("DID_MSG_ERR_DOCUMENT"));
            }
            return Json(msg);
        }

        [HttpPost]
        public object GetActivity(int Id)
        {
            var data = _context.DispatchesHeaders.FirstOrDefault(x => x.Id == Id);
            var listTracking = _context.DispatchTrackingProcesss.Where(x => x.DispatchCode == data.DispatchCode).OrderBy(x => x.CreatedTime).Select(x => new IncommingDispatchesActivity
            {
                User = x.User.GivenName,
                Action = x.Action,
                CreatedTime = x.CreatedTime,
            }).AsNoTracking().AsParallel();
            return listTracking;
        }

        [HttpPost]
        public JsonResult UploadFile(IFormFile file)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var userId = ESEIM.AppContext.UserId;
            var User = _context.Users.FirstOrDefault(x => x.Id == userId);
            var upload = _upload.UploadFile(file, Path.Combine(_hostingEnvironment.WebRootPath, "uploads\\files"));
            if (upload.Error)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DOWLOAD_ERR")) + upload.Title;
            }
            else
            {
                var model = new IncommingDispatchesFile
                {
                    Source = "/uploads/Files/" + upload.Object.ToString(),
                    User = User?.GivenName,
                };
                string Url = model.Source;
                //if (Url != null && Url.Contains("="))
                //{
                //    String Urll = Url.Substring(Url.LastIndexOf("&Signature=") + 1).replace("%2B", "%252B");
                //    if (null != Urll && Urll.Length > 0 && Urll.Contains("%252B"))
                //    {
                //        int endIndex = Url.LastIndexOf("Signature");
                //        if (endIndex != -1)
                //        {
                //            Url = Url.substring(0, endIndex);
                //            Url = Url + Urll;
                //        }
                //    }
                //    Url = Url.replace("?AWSAccessKeyId=", "?AWSAccessKeyId%3D")
                //            .replace("&Expires=", "%26Expires%3D").replace("&Signature=", "%26Signature%3D");
                //}
                msg.Object = model;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DOWLOAD_SUCCESS")) + upload.Title;
            }
            return Json(msg);
        }

        [HttpPost]
        public object GetYear()
        {
            var query = _context.DispatchesHeaders.Where(x => x.Type == EnumHelper<DocumentTypeEnum>.GetDisplayValue(DocumentTypeEnum.IBT)).Select(x => x.Year).Distinct().AsParallel();
            return query;
        }
        #endregion

        #region Combobox
        [HttpPost]
        public object GetDispatches()
        {
            var query = _context.DispatchesCategorys.Where(x => x.Type == EnumHelper<DocumentTypeEnum>.GetDisplayValue(DocumentTypeEnum.SVB) && x.IsDeleted == false).Select(x => new { x.Code, x.Name, x.NumberCreator, x.IsYearBefore, x.DocumentSymbol, x.Year }).AsParallel();
            return query;
        }
        [HttpPost]
        public object GetDocumentType()
        {
            var query = _context.DispatchesCategorys.Where(x => x.Type == EnumHelper<DocumentTypeEnum>.GetDisplayValue(DocumentTypeEnum.LVB) && x.IsDeleted == false).Select(x => new { x.Code, x.Name }).AsParallel();
            return query;
        }
        [HttpPost]
        public object GetDocumentUrgency()
        {
            var query = _context.DispatchesCategorys.Where(x => x.Type == EnumHelper<DocumentTypeEnum>.GetDisplayValue(DocumentTypeEnum.DQT) && x.IsDeleted == false).Select(x => new { x.Code, x.Name }).AsParallel();
            return query;
        }
        [HttpPost]
        public object GetDocumentField()
        {
            var query = _context.DispatchesCategorys.Where(x => x.Type == EnumHelper<DocumentTypeEnum>.GetDisplayValue(DocumentTypeEnum.LVVB) && x.IsDeleted == false).Select(x => new { x.Code, x.Name }).AsParallel();
            return query;
        }
        [HttpPost]
        public object GetPosition()
        {
            var query = _context.Roles.Where(x => x.Status == true).Select(x => new { x.Code, x.Title }).AsParallel();
            return query;
        }
        [HttpPost]
        public object GetDeparment()
        {

            var query = _context.AdGroupUsers.Select(x => new { Code = x.GroupUserCode, Name = x.Description }).AsParallel();
            return query;
        }
        [HttpPost]
        public object GetLoadDefaultUser()
        {
            var userId = ESEIM.AppContext.UserId;
            var data = _context.AdUserInGroups.Where(x => x.UserId == userId).Select(x => new
            {
                x.UserId,
                x.GroupUserCode,
            }).AsParallel().First();
            return data;
        }
        [HttpPost]
        public object GetGetMethod()
        {
            var query = _context.CommonSettings.Where(x => x.Group == EnumHelper<DocumentTypeEnum>.GetDisplayValue(DocumentTypeEnum.GET_METHOD) && x.IsDeleted == false).Select(x => new { x.CodeSet, x.ValueSet }).AsParallel();
            return query;
        }

        [HttpPost]
        public object GetDepartment()
        {
            var list = _context.AdGroupUsers.Where(x => x.IsEnabled == true).Select(x => new { x.GroupUserCode, x.Title }).AsParallel();
            return list;
        }


        //[HttpPost]
        //public object GetListUserInUnit(List<string> listGroup)
        //{
        //    var list = listGroup[0] != null ? listGroup[0].Split(',') : new string[0];
        //    var listMember = _context.AdUserInGroups.Where(x => list.Any(y => y == x.GroupUserCode))
        //    .Select(x => new
        //    {
        //        Id = x.UserId,
        //        x.User.GivenName,
        //    }).AsNoTracking();
        //    return listMember;
        //}

        [HttpPost]
        public object GetAllListUserActive()
        {
            var listMember = _context.Users.Where(x => x.Active == true).Select(x => new { x.Id, Name = x.GivenName }).AsParallel();
            return listMember;
        }
        [HttpPost]
        public object GetListUser()
        {
            var listMember = _context.Users.Where(x => x.Active == true && x.Id != ESEIM.AppContext.UserId).Select(x => new { x.Id, x.GivenName }).AsParallel();
            return listMember;
        }
        [HttpPost]
        public List<TreeViewResource> GetAllGroupUser()
        {
            var data = _context.AdGroupUsers.Where(x => x.IsEnabled == true).OrderByDescending(x => x.GroupUserId).AsNoTracking();
            var dataOrder = GetSubTreeData(data.ToList(), null, new List<TreeViewResource>(), 0);
            return dataOrder;
        }

        [NonAction]
        private List<TreeViewResource> GetSubTreeData(List<AdGroupUser> data, string parentid, List<TreeViewResource> lstCategories, int tab)
        {
            //tab += "- ";
            var contents = String.IsNullOrEmpty(parentid)
                ? data.Where(x => x.ParentCode == null).OrderByDescending(x => x.GroupUserId).AsParallel()
                : data.Where(x => x.ParentCode == parentid).OrderByDescending(x => x.GroupUserCode).AsParallel();
            foreach (var item in contents)
            {
                var category = new TreeViewResource
                {
                    Id = item.GroupUserId,
                    Code = item.GroupUserCode,
                    Title = item.Title,
                    Level = tab,
                    HasChild = data.Any(x => x.ParentCode == item.GroupUserCode),
                    ParentCode = item.ParentCode,
                };
                lstCategories.Add(category);
                if (category.HasChild) GetSubTreeData(data, item.GroupUserCode, lstCategories, tab + 1);
            }
            return lstCategories;
        }

        [HttpPost]
        public object GetListUserInGroup(List<string> listGroup)
        {
            var list = listGroup[0] != null ? listGroup[0].Split(',') : new string[0];
            var userPermision = _context.DispatchesUsers.Where(x => list.Any(y => y == x.GroupUserCode))
               .Select(x => new
               {
                   x.UserId,
                   Name = _context.Users.FirstOrDefault(y => y.Id == x.UserId).GivenName ?? null,
                   x.GroupUserCode,
                   IsPermision = true,
                   IsMain = true,
               });
            if (userPermision.Any())
            {
                var dateNow = DateTime.Now.Date;
                var checkAuthority = _context.AdAuthorings.Where(x => x.FromUser == userPermision.First().UserId && x.FromDate <= dateNow && x.ToDate >= dateNow && x.Confirm == "Y").Select(x => new
                {
                    UserId = x.ToUser,
                    Name = _context.Users.FirstOrDefault(y => y.Id == x.ToUser).GivenName ?? null,
                    GroupUserCode = _context.AdUserInGroups.Join(_context.Users.Where(y => y.Id == x.ToUser), post => post.UserId, meta => meta.Id, (post, meta) => post.GroupUserCode).AsNoTracking().FirstOrDefault(),
                    IsPermision = true,
                    IsMain = false,
                });
                if (checkAuthority.Any())
                {
                    userPermision = userPermision.Select(x => new
                    {
                        x.UserId,
                        x.Name,
                        x.GroupUserCode,
                        IsPermision = false,
                        IsMain = true,
                    });
                    var listMember = (from a in _context.AdUserInGroups
                                      join b in _context.Users on a.UserId equals b.Id
                                      where list.Any(y => y == a.GroupUserCode) && !checkAuthority.Any(y => y.UserId == a.UserId) && a.UserId != userPermision.First().UserId
                                      && b.Active == true
                                      select new
                                      {
                                          a.UserId,
                                          Name = b.GivenName,
                                          a.GroupUserCode,
                                          IsPermision = false,
                                          IsMain = false,
                                      });

                    var listUser = userPermision.Concat(checkAuthority.Concat(listMember));
                    return listUser;
                }
                else
                {
                    var listMember = (from a in _context.AdUserInGroups
                                      join b in _context.Users on a.UserId equals b.Id
                                      where list.Any(y => y == a.GroupUserCode) && !userPermision.Any(y => y.UserId == a.UserId)
                                      && b.Active == true
                                      select new
                                      {
                                          a.UserId,
                                          Name = b.GivenName,
                                          a.GroupUserCode,
                                          IsPermision = false,
                                          IsMain = false,
                                      });
                    var listUser = userPermision.Concat(listMember);
                    return listUser;
                }
            }
            else
            {
                var listMember = (from a in _context.AdUserInGroups
                                  join b in _context.Users on a.UserId equals b.Id
                                  where list.Any(y => y == a.GroupUserCode) && !userPermision.Any(y => y.UserId == a.UserId)
                                  && b.Active == true
                                  select new
                                  {
                                      a.UserId,
                                      Name = b.GivenName,
                                      a.GroupUserCode,
                                      IsPermision = false,
                                  });
                return listMember;
            }
        }

        [HttpPost]
        public object GetUserActive()
        {
            var userId = ESEIM.AppContext.UserId;
            var user = (from a in _context.AdUserInGroups
                        join b in _context.Users on a.UserId equals b.Id
                        where a.UserId == userId
                        select new
                        {
                            a.UserId,
                            Name = b.GivenName,
                            AssignerGroupUserName = _context.AdGroupUsers.FirstOrDefault(x => x.GroupUserCode == a.GroupUserCode).Title ?? null,
                            IsPermision = false,
                        }).AsParallel().FirstOrDefault();
            return user;
        }
        #endregion
    }
    #region request
    public class IncommingDispatchesModel
    {
        public IncommingDispatchesModel()
        {
            Detail = new IncommingDispatchesTrackingModel();
        }
        public IncommingDispatchesHeaderModel Header { get; set; }
        public IncommingDispatchesTrackingModel Detail { get; set; }
        public bool Status { get; set; }
    }
    public class IncommingDispatchesHeaderModel
    {
        public int Id { get; set; }

        public string DocumentCode { get; set; }

        public int DocumentNumber { get; set; }

        public string DocumentSymbol { get; set; }

        public string Origanization { get; set; }

        public string FromDate { get; set; }

        public string PromulgateDate { get; set; }

        public string Epitome { get; set; }

        public string DocumentZone { get; set; }

        public string DispatchCode { get; set; }

        public string DocumentType { get; set; }

        public string SignUser { get; set; }

        public string Position { get; set; }

        public string Confidentiality { get; set; }

        public string GetMothod { get; set; }

        public string CreatedEditor { get; set; }

        public DateTime? CreatedTime { get; set; }

        public string CreatedUserId { get; set; }

        public string UnitEditor { get; set; }

        public bool? IsReply { get; set; }

        public bool? IsProcess { get; set; }

        public string ReplyStatus { get; set; }

        public string Note { get; set; }

        public string Status { get; set; }

        public string ExperiedReply { get; set; }

        public string ImportantLevel { get; set; }
        public string SecurityLevel { get; set; }
        public bool? IsQppl { get; set; }
        public string Type { get; set; }
        public string DocumentSymbols { get; set; }
        //public string CreatedEditor { get; set; }
        public string SignDate { get; set; }
    }
    public class IncommingDispatchesTrackingModel
    {
        public IncommingDispatchesTrackingModel()
        {
            ListFile = new List<IncommingDispatchesFile>();
            ListComment = new List<IncommingDispatchesComment>();
            ListMember = new List<IncommingDispatchesMember>();
            ListGroup = new List<IncommingDispatchesGroup>();
        }
        public List<IncommingDispatchesFile> ListFile { get; set; }
        public int[] ListDeleteFile { get; set; }
        public List<IncommingDispatchesComment> ListComment { get; set; }
        public int[] ListDeleteComment { get; set; }
        public List<IncommingDispatchesMember> ListMember { get; set; }
        public List<IncommingDispatchesGroup> ListGroup { get; set; }
        public int[] ListDeleteMember { get; set; }
        public string Reason { get; set; }
        public string DeadLine { get; set; }
        //thời gian còn lại của người nhận xử lý
        public DateTime? DeadLineSendUser { get; set; }
    }

    public class IncommingDispatchesFile
    {
        public int Id { get; set; }
        public string CreatedEditor { get; set; }
        public string User { get; set; }
        public DateTime? CreatedTime { get; set; }
        public string FileName { get; set; }
        public string Source { get; set; }
        public string Fomart { get; set; }
        public bool IsShowDelete { get; set; }
    }
    public class IncommingDispatchesComment
    {
        public int Id { get; set; }
        public string CreatedEditor { get; set; }
        public string User { get; set; }
        public string Comment { get; set; }
        public string CreatedBy { get; set; }
        public DateTime? CreatedTime { get; set; }
        public bool IsShowComment { get; set; }
    }
    public class IncommingDispatchesGroup
    {
        public string GroupUserCode { get; set; }
        public string Name { get; set; }
        public bool IsShow { get; set; }
    }
    public class IncommingDispatchesMember
    {
        public int Id { get; set; }
        public string Assigner { get; set; }
        public string AssignerName { get; set; }
        public string AssignerGroupUserName { get; set; }
        public string GroupUserName { get; set; }
        public string UserId { get; set; }
        public string Name { get; set; }
        public DateTime? CreatedTime { get; set; }
        public int Role { get; set; }
        public string Status { get; set; }
        public bool IsShowDelete { get; set; }
        public bool IsShowComment { get; set; }
        public bool IsShowAction { get; set; }
        public bool IsShowSend { get; set; }
        public string GroupUserCode { get; set; }
        public string Comment { get; set; }
    }
    public class IncommingDispatchesActivity
    {
        public string ProcessCode { get; set; }
        public string User { get; set; }
        public string Action { get; set; }
        //public string Status { get; set; }
        public DateTime? CreatedTime { get; set; }
    }

    #endregion

    #region response
    public class IncommingDispatchesResponseHeaderModel
    {
        public int Id { get; set; }
        public string DocumentName { get; set; }
        public int? DocumentNumber { get; set; }
        public string DocumentSymbol { get; set; }
        public string DocumentSymbols { get; set; }
        public string Origanization { get; set; }
        public string FromDate { get; set; }

        public string PromulgateDate { get; set; }

        public string Epitome { get; set; }

        public string DocumentZone { get; set; }

        public string DocumentType { get; set; }

        public string SignUser { get; set; }

        public string Position { get; set; }

        public string Confidentiality { get; set; }

        public string ImportantLevel { get; set; }
        public string SecurityLevel { get; set; }

        public string GetMothod { get; set; }

        public DateTime? CreatedTime { get; set; }
        public string ExperiedReply { get; set; }

        public string CreatedUser { get; set; }

        public string CreatedEditor { get; set; }

        public string UnitEditor { get; set; }

        public bool? IsReply { get; set; }

        public bool? IsProcess { get; set; }


        public bool? IsQPPL { get; set; }

        public string ReplyStatus { get; set; }

        public string Note { get; set; }

        public string Status { get; set; }
        public string SignDate { get; set; }
    }
    public class IncommingDispatchesResponseModel
    {
        public IncommingDispatchesResponseModel()
        {
            Header = new IncommingDispatchesResponseHeaderModel();
            Detail = new IncommingDispatchesTrackingModel();
        }
        public IncommingDispatchesResponseHeaderModel Header { get; set; }
        public IncommingDispatchesTrackingModel Detail { get; set; }
        public bool RoleStatus { get; set; }
        public int Role { get; set; }
        public bool DocumentStatus { get; set; }
        public bool DocumentReview { get; set; }
        public double? Days { get; set; }
    }
    #endregion
    public class ExportModel
    {
        public string FromDate { get; set; }
        public string ToDate { get; set; }
    }
}