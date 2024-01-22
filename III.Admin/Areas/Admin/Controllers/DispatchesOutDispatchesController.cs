using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using ESEIM;
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
    public class DispatchesOutDispatchesController : BaseController
    {

        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private static AsyncLocker<string> userLock = new AsyncLocker<string>();

        public DispatchesOutDispatchesController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment)
        {
            _context = context;
            _upload = upload;
            _hostingEnvironment = hostingEnvironment;
        }
        public IActionResult Index()
        {
            return View();
        }
        [HttpPost]
        public object JTable([FromBody]OutDispatchesJtable jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var promulgateDate = !string.IsNullOrEmpty(jTablePara.PromulgateDate) ? DateTime.ParseExact(jTablePara.PromulgateDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var query = (from a in _context.DispatchesHeaders
                         where ((jTablePara.Number == null) || (a.DocumentNumber.ToString().Contains(jTablePara.Number.ToString())))
                          && ((string.IsNullOrEmpty(jTablePara.Number)) || (a.DocumentNumber.ToString().Contains(jTablePara.Number.ToString())))
                          && ((string.IsNullOrEmpty(jTablePara.DocumentSymbols)) || (a.DocumentSymbols.ToLower().Contains(jTablePara.DocumentSymbols.ToLower())))
                          && ((string.IsNullOrEmpty(jTablePara.SignUser)) || (a.SignUser.ToLower().Contains(jTablePara.SignUser.ToLower())))
                          && ((string.IsNullOrEmpty(jTablePara.CreatedUser)) || (a.CreatedEditor.ToLower().Contains(jTablePara.CreatedUser.ToLower())))
                          && ((string.IsNullOrEmpty(jTablePara.Note)) || (a.Note != null && a.Note.ToLower().Contains(jTablePara.Note.ToLower())))
                          && ((string.IsNullOrEmpty(jTablePara.PromulgateDate)) || (a.PromulgateDate.HasValue && a.PromulgateDate.Value.Date == promulgateDate.Value.Date))
                          && ((string.IsNullOrEmpty(jTablePara.UnitEditor)) || (a.UnitEditor.ToLower().Contains(jTablePara.UnitEditor.ToLower())))
                          && ((jTablePara.Year == null) || (a.Year.Equals(jTablePara.Year)))
                          && (a.IsDeleted == false)
                          && a.Type == EnumHelper<DocumentTypeEnum>.GetDisplayValue(DocumentTypeEnum.OBT)
                         select a).AsNoTracking().OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).ToList();
            var count = (from a in _context.DispatchesHeaders
                         where ((jTablePara.Number == null) || (a.DocumentNumber.ToString().Contains(jTablePara.Number.ToString())))
                          && ((string.IsNullOrEmpty(jTablePara.Number)) || (a.DocumentNumber.ToString().Contains(jTablePara.Number.ToString())))
                          && ((string.IsNullOrEmpty(jTablePara.DocumentSymbols)) || (a.DocumentSymbols.ToLower().Contains(jTablePara.DocumentSymbols.ToLower())))
                          && ((string.IsNullOrEmpty(jTablePara.SignUser)) || (a.SignUser.ToLower().Contains(jTablePara.SignUser.ToLower())))
                          && ((string.IsNullOrEmpty(jTablePara.CreatedUser)) || (a.CreatedEditor.ToLower().Contains(jTablePara.CreatedUser.ToLower())))
                          && ((string.IsNullOrEmpty(jTablePara.Note)) || (a.Note != null && a.Note.ToLower().Contains(jTablePara.Note.ToLower())))
                          && ((string.IsNullOrEmpty(jTablePara.PromulgateDate)) || (a.PromulgateDate.HasValue && a.PromulgateDate.Value.Date == promulgateDate.Value.Date))
                          && ((string.IsNullOrEmpty(jTablePara.UnitEditor)) || (a.UnitEditor.ToLower().Contains(jTablePara.UnitEditor.ToLower())))
                          && ((jTablePara.Year == null) || (a.Year.Equals(jTablePara.Year)))
                          && (a.IsDeleted == false)
                          && a.Type == EnumHelper<DocumentTypeEnum>.GetDisplayValue(DocumentTypeEnum.OBT)
                         select a).AsNoTracking().Count();
            var data = query.Select(x => new
            {
                x.Id,
                x.DocumentSymbol,
                x.DocumentSymbols,
                x.DocumentNumber,
                DocumentName = _context.DispatchesCategorys.FirstOrDefault(y => y.Code == x.DocumentCode)?.Name,
                SignUser = _context.Users.FirstOrDefault(y => y.Id == x.SignUser)?.GivenName,
                x.PromulgateDate,
                UnitEditor = _context.AdGroupUsers.FirstOrDefault(y => y.GroupUserCode == x.UnitEditor)?.Title,
                x.Note,
                x.Status
            }).ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "DocumentSymbol", "DocumentSymbols", "DocumentNumber", "DocumentName", "Note", "SignUser", "PromulgateDate", "UnitEditor", "Note", "Status");
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
                    var checkNumber = await _context.DispatchesHeaders.FirstOrDefaultAsync(x => x.DocumentNumber == obj.Header.DocumentNumber && x.DocumentCode == obj.Header.DocumentCode && x.Type == EnumHelper<DocumentTypeEnum>.GetDisplayValue(DocumentTypeEnum.OBT));
                    if (checkNumber != null)
                    {
                        msg.Error = true;
                        msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_EXITS"), CommonUtil.ResourceValue("DOD_MSG_DOCUMENT"));
                    }
                    else
                    {
                        var userId = ESEIM.AppContext.UserId;
                        var model = new DispatchesHeader
                        {
                            DispatchCode = Guid.NewGuid().ToString(),
                            DocumentCode = obj.Header.DocumentCode,
                            DocumentSymbol = obj.Header.DocumentSymbol,
                            //FromDate = !string.IsNullOrEmpty(obj.Header.FromDate) ? DateTime.ParseExact(obj.Header.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null,
                            //DocumentZone = obj.Header.DocumentZone,
                            SignUser = obj.Header.SignUser,
                            //Confidentiality = obj.Header.Confidentiality,
                            CreatedEditor = obj.Header.CreatedEditor,
                            //IsReply = obj.Header.IsReply,
                            //ExperiedReply = !string.IsNullOrEmpty(obj.Header.ExperiedReply) ? DateTime.ParseExact(obj.Header.ExperiedReply, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null,
                            DocumentNumber = obj.Header.DocumentNumber,
                            //Origanization = obj.Header.Origanization,
                            PromulgateDate = !string.IsNullOrEmpty(obj.Header.PromulgateDate) ? DateTime.ParseExact(obj.Header.PromulgateDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null,
                            //DocumentType = obj.Header.DocumentType,
                            Position = obj.Header.Position,
                            //GetMothod = obj.Header.GetMothod,
                            UnitEditor = obj.Header.UnitEditor,
                            //IsProcess = obj.Header.IsProcess,
                            //ReplyStatus = obj.Header.ReplyStatus,
                            Note = obj.Header.Note,
                            //ImportantLevel = obj.Header.ImportantLevel,
                            SecurityLevel = obj.Header.SecurityLevel,
                            //IsQppl = obj.Header.IsQppl,
                            DocumentSymbols = obj.Header.DocumentSymbols,
                            //UserEditor = obj.Header.UserEditor,
                            SignDate = !string.IsNullOrEmpty(obj.Header.SignDate) ? DateTime.ParseExact(obj.Header.SignDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null,
                            Type = EnumHelper<DocumentTypeEnum>.GetDisplayValue(DocumentTypeEnum.OBT),
                            CreatedTime = DateTime.Now,
                            Year = DateTime.Now.Year,
                            CreatedUserId = userId,
                        };
                        var category = _context.DispatchesCategorys.FirstOrDefault(x => x.Code == obj.Header.DocumentCode && x.IsDeleted == false);
                        category.NumberCreator = obj.Header.DocumentNumber + 1;
                        _context.DispatchesCategorys.Update(category);
                        _context.DispatchesHeaders.Add(model);

                        string processcode = Guid.NewGuid().ToString();
                        var tracking = new DispatchTrackingProcess
                        {
                            DispatchCode = model.DispatchCode,
                            //FromNode = obj.Header.UnitEditor,
                            ProcessCode = processcode,
                            Action = EnumHelper<DocumentStatusEnum>.GetDisplayValue(DocumentStatusEnum.Created),
                            UserId = userId,
                            CreatedTime = model.CreatedTime,
                            //Reason = obj.Detail.Reason,
                            DeadLine = !string.IsNullOrEmpty(obj.Detail.DeadLine) ? DateTime.ParseExact(obj.Detail.DeadLine, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null,
                        };
                        _context.DispatchTrackingProcesss.Add(tracking);

                        //Group
                        for (var i = 0; i < obj.Detail.ListGroup.Count; i++)
                        {
                            if (obj.Detail.ListGroup[i].GroupUserCode == EnumHelper<GroupUserEnum>.GetDisplayValue(GroupUserEnum.LD))
                            {
                                var listMember = (from a in _context.AdUserInGroups
                                                  join b in _context.Users.Where(x => x.Active == true) on a.UserId equals b.Id
                                                  where a.GroupUserCode == obj.Detail.ListGroup[i].GroupUserCode
                                                  select new DispatchesMemberActivity
                                                  {
                                                      Assigner = userId,
                                                      ProcessCode = processcode,
                                                      UserId = a.UserId,
                                                      CreatedTime = DateTime.Now,
                                                      GroupUserCode = a.GroupUserCode,
                                                      Role = DocumentRoleEnum.Main.GetHashCode()
                                                  });
                                _context.DispatchesMemberActivitys.AddRange(listMember);
                            }
                            else
                            {
                                //var listPermision = _context.DispatchesUsers.Where(x => x.GroupUserCode == obj.Detail.ListGroup[i].GroupUserCode)
                                //  .Select(x => new DispatchesMemberActivity
                                //  {
                                //      Assigner = userId,
                                //      ProcessCode = processcode,
                                //      UserId = x.UserId,
                                //      CreatedTime = DateTime.Now,
                                //      GroupUserCode = x.GroupUserCode,
                                //      Role = DocumentRoleEnum.Main.GetHashCode()
                                //  });
                                //_context.DispatchesMemberActivitys.AddRange(listPermision);
                                var userPermision = (from a in _context.DispatchesUsers
                                                     join b in _context.Users.Where(y => y.Active == true) on a.UserId equals b.Id
                                                     where a.GroupUserCode == obj.Detail.ListGroup[i].GroupUserCode
                                                     select new DispatchesMemberActivity
                                                     {
                                                         Assigner = userId,
                                                         ProcessCode = processcode,
                                                         UserId = a.UserId,
                                                         CreatedTime = DateTime.Now,
                                                         GroupUserCode = a.GroupUserCode,
                                                         Role = DocumentRoleEnum.Main.GetHashCode()
                                                     }).AsNoTracking();
                                _context.DispatchesMemberActivitys.AddRange(userPermision);
                            }
                        }
                        //Member
                        for (var i = 0; i < obj.Detail.ListMember.Count; i++)
                        {
                            var activity = new DispatchesMemberActivity
                            {
                                Assigner = userId,
                                ProcessCode = processcode,
                                UserId = obj.Detail.ListMember[i].UserId,
                                CreatedTime = DateTime.Now,
                                Role = DocumentRoleEnum.Main.GetHashCode()
                            };
                            _context.DispatchesMemberActivitys.Add(activity);
                        }

                        //File
                        foreach (var file in obj.Detail.ListFile)
                        {
                            var dispatchesFile = new DispatchesFileACT
                            {
                                ProcessCode = processcode,
                                FileName = file.FileName,
                                Soure = file.Source,
                                UserId = userId,
                                Fomart = file.Fomart,
                                CreatedTime = file.CreatedTime,
                            };
                            _context.DispatchesFileACTs.Add(dispatchesFile);
                        }
                        _context.SaveChanges();
                        msg.Title = String.Format(CommonUtil.ResourceValue("COM_UPDATE_SUCCESS"));
                    }
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
        public JsonResult Update([FromBody]IncommingDispatchesModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var userId = ESEIM.AppContext.UserId;
                var dispatchess = _context.DispatchesHeaders.FirstOrDefault(x => x.Id == obj.Header.Id);
                if (obj.Header.DocumentNumber != dispatchess.DocumentNumber)
                {
                    var checkNumber = _context.DispatchesHeaders.FirstOrDefault(x => x.DocumentNumber == obj.Header.DocumentNumber && x.DocumentCode == obj.Header.DocumentCode && x.Id != dispatchess.Id && x.Type == EnumHelper<DocumentTypeEnum>.GetDisplayValue(DocumentTypeEnum.OBT));
                    if (checkNumber != null)
                    {
                        msg.Error = true;
                        msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_EXITS"), CommonUtil.ResourceValue("DOD_MSG_DOCUMENT"));
                    }
                    else
                    {
                        dispatchess.DocumentCode = obj.Header.DocumentCode;
                        dispatchess.DocumentSymbol = obj.Header.DocumentSymbol;
                        dispatchess.DocumentSymbols = obj.Header.DocumentSymbols;
                        //dispatchess.FromDate = !string.IsNullOrEmpty(obj.Header.FromDate) ? DateTime.ParseExact(obj.Header.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                        //dispatchess.DocumentZone = obj.Header.DocumentZone;
                        dispatchess.SignUser = obj.Header.SignUser;
                        //dispatchess.Confidentiality = obj.Header.Confidentiality;
                        dispatchess.CreatedEditor = obj.Header.CreatedEditor;
                        //dispatchess.IsReply = obj.Header.IsReply;
                        //dispatchess.ExperiedReply = !string.IsNullOrEmpty(obj.Header.ExperiedReply) ? DateTime.ParseExact(obj.Header.ExperiedReply, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                        dispatchess.DocumentNumber = obj.Header.DocumentNumber;
                        //dispatchess.Origanization = obj.Header.Origanization;
                        dispatchess.PromulgateDate = !string.IsNullOrEmpty(obj.Header.PromulgateDate) ? DateTime.ParseExact(obj.Header.PromulgateDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                        //dispatchess.DocumentType = obj.Header.DocumentType;
                        dispatchess.SignDate = !string.IsNullOrEmpty(obj.Header.SignDate) ? DateTime.ParseExact(obj.Header.SignDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                        dispatchess.Position = obj.Header.Position;
                        //dispatchess.GetMothod = obj.Header.GetMothod;
                        dispatchess.UnitEditor = obj.Header.UnitEditor;
                        dispatchess.SecurityLevel = obj.Header.SecurityLevel;
                        //dispatchess.IsProcess = obj.Header.IsProcess;
                        //dispatchess.ReplyStatus = obj.Header.ReplyStatus;
                        dispatchess.Note = obj.Header.Note;
                        dispatchess.Type = EnumHelper<DocumentTypeEnum>.GetDisplayValue(DocumentTypeEnum.OBT);
                        dispatchess.UpdatedTime = DateTime.Now;
                        _context.DispatchesHeaders.Update(dispatchess);

                        //var category = _context.DispatchesCategorys.FirstOrDefault(x => x.Code == obj.Header.DocumentCode);
                        //category.NumberCreator = obj.Header.DocumentNumber + 1;
                        //_context.DispatchesCategorys.Update(category);


                        var tracking = _context.DispatchTrackingProcesss.FirstOrDefault(x => x.DispatchCode == dispatchess.DispatchCode);
                        var trackingNew = new DispatchTrackingProcess
                        {
                            DispatchCode = tracking.DispatchCode,
                            ProcessCode = tracking.ProcessCode,
                            Action = EnumHelper<DocumentStatusEnum>.GetDisplayValue(DocumentStatusEnum.Updated),
                            CreatedTime = DateTime.Now,
                            Reason = obj.Detail.Reason,
                            UserId = obj.Header.CreatedUserId,
                            //DeadLine = !string.IsNullOrEmpty(obj.Detail.DeadLine) ? DateTime.ParseExact(obj.Detail.DeadLine, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null,
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
                                    UserId = userId,
                                    Fomart = file.Fomart,
                                    CreatedTime = file.CreatedTime,
                                };
                                _context.DispatchesFileACTs.Add(dispatchesFile);
                            }
                        }


                        //Group
                        var listGroupNew = obj.Detail.ListGroup.Where(x => x.IsShow == true);
                        for (var i = 0; i < listGroupNew.Count(); i++)
                        {
                            if (obj.Detail.ListGroup[i].GroupUserCode == EnumHelper<GroupUserEnum>.GetDisplayValue(GroupUserEnum.LD))
                            {
                                var listMember = (from a in _context.AdUserInGroups
                                                  join b in _context.Users on a.UserId equals b.Id
                                                  where a.GroupUserCode == obj.Detail.ListGroup[i].GroupUserCode
                                                  && b.Active == true
                                                  select new DispatchesMemberActivity
                                                  {
                                                      Assigner = userId,
                                                      ProcessCode = tracking.ProcessCode,
                                                      UserId = a.UserId,
                                                      CreatedTime = DateTime.Now,
                                                      GroupUserCode = a.GroupUserCode,
                                                      Role = DocumentRoleEnum.Main.GetHashCode()
                                                  });
                                _context.DispatchesMemberActivitys.AddRange(listMember);
                            }
                            else
                            {
                                //var listPermision = _context.DispatchesUsers.Where(x => x.GroupUserCode == obj.Detail.ListGroup[i].GroupUserCode)
                                //  .Select(x => new DispatchesMemberActivity
                                //  {
                                //      Assigner = userId,
                                //      ProcessCode = tracking.ProcessCode,
                                //      UserId = x.UserId,
                                //      CreatedTime = DateTime.Now,
                                //      GroupUserCode = x.GroupUserCode,
                                //      Role = DocumentRoleEnum.Main.GetHashCode()
                                //  });
                                var userPermision = (from a in _context.DispatchesUsers
                                                     join b in _context.Users.Where(y => y.Active == true) on a.UserId equals b.Id
                                                     where a.GroupUserCode == obj.Detail.ListGroup[i].GroupUserCode
                                                     select new DispatchesMemberActivity
                                                     {
                                                         Assigner = userId,
                                                         ProcessCode = tracking.ProcessCode,
                                                         UserId = a.UserId,
                                                         CreatedTime = DateTime.Now,
                                                         GroupUserCode = a.GroupUserCode,
                                                         Role = DocumentRoleEnum.Main.GetHashCode()
                                                     }).AsNoTracking();
                                _context.DispatchesMemberActivitys.AddRange(userPermision);
                            }
                        }

                        var listMemberNew = obj.Detail.ListMember.Where(x => x.IsShowDelete == true);
                        foreach (var member in listMemberNew)
                        {
                            var activity = new DispatchesMemberActivity
                            {
                                Assigner = userId,
                                ProcessCode = tracking.ProcessCode,
                                UserId = member.UserId,
                                CreatedTime = DateTime.Now,
                                Role = DocumentRoleEnum.Main.GetHashCode()
                            };
                            _context.DispatchesMemberActivitys.Add(activity);
                        }
                        _context.SaveChanges();
                        msg.Title = String.Format(CommonUtil.ResourceValue("COM_UPDATE_SUCCESS"));
                    }
                }
                else
                {
                    dispatchess.DocumentCode = obj.Header.DocumentCode;
                    dispatchess.DocumentSymbol = obj.Header.DocumentSymbol;
                    dispatchess.DocumentSymbols = obj.Header.DocumentSymbols;
                    //dispatchess.FromDate = !string.IsNullOrEmpty(obj.Header.FromDate) ? DateTime.ParseExact(obj.Header.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                    //dispatchess.DocumentZone = obj.Header.DocumentZone;
                    dispatchess.SignUser = obj.Header.SignUser;
                    //dispatchess.Confidentiality = obj.Header.Confidentiality;
                    dispatchess.CreatedEditor = obj.Header.CreatedEditor;
                    //dispatchess.IsReply = obj.Header.IsReply;
                    //dispatchess.ExperiedReply = !string.IsNullOrEmpty(obj.Header.ExperiedReply) ? DateTime.ParseExact(obj.Header.ExperiedReply, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                    dispatchess.DocumentNumber = obj.Header.DocumentNumber;
                    //dispatchess.Origanization = obj.Header.Origanization;
                    dispatchess.PromulgateDate = !string.IsNullOrEmpty(obj.Header.PromulgateDate) ? DateTime.ParseExact(obj.Header.PromulgateDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                    //dispatchess.DocumentType = obj.Header.DocumentType;
                    dispatchess.SignDate = !string.IsNullOrEmpty(obj.Header.SignDate) ? DateTime.ParseExact(obj.Header.SignDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                    dispatchess.Position = obj.Header.Position;
                    //dispatchess.GetMothod = obj.Header.GetMothod;
                    dispatchess.UnitEditor = obj.Header.UnitEditor;
                    dispatchess.SecurityLevel = obj.Header.SecurityLevel;
                    //dispatchess.IsProcess = obj.Header.IsProcess;
                    //dispatchess.ReplyStatus = obj.Header.ReplyStatus;
                    dispatchess.Note = obj.Header.Note;
                    dispatchess.Type = EnumHelper<DocumentTypeEnum>.GetDisplayValue(DocumentTypeEnum.OBT);
                    dispatchess.UpdatedTime = DateTime.Now;
                    _context.DispatchesHeaders.Update(dispatchess);

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
                                UserId = userId,
                                Fomart = file.Fomart,
                                CreatedTime = file.CreatedTime,
                            };
                            _context.DispatchesFileACTs.Add(dispatchesFile);
                        }
                    }


                    //Group
                    var listGroupNew = obj.Detail.ListGroup.Where(x => x.IsShow == true).ToList();
                    for (var i = 0; i < listGroupNew.Count(); i++)
                    {
                        if (listGroupNew[i].GroupUserCode == EnumHelper<GroupUserEnum>.GetDisplayValue(GroupUserEnum.LD))
                        {
                            var listMember = (from a in _context.AdUserInGroups
                                              join b in _context.Users on a.UserId equals b.Id
                                              where a.GroupUserCode == listGroupNew[i].GroupUserCode
                                              && b.Active == true
                                              select new DispatchesMemberActivity
                                              {
                                                  Assigner = userId,
                                                  ProcessCode = tracking.ProcessCode,
                                                  UserId = a.UserId,
                                                  CreatedTime = DateTime.Now,
                                                  GroupUserCode = a.GroupUserCode,
                                                  Role = DocumentRoleEnum.Main.GetHashCode()
                                              });
                            _context.DispatchesMemberActivitys.AddRange(listMember);
                        }
                        else
                        {
                            //var listPermision = _context.DispatchesUsers.Where(x => x.GroupUserCode == listGroupNew[i].GroupUserCode)
                            //  .Select(x => new DispatchesMemberActivity
                            //  {
                            //      Assigner = userId,
                            //      ProcessCode = tracking.ProcessCode,
                            //      UserId = x.UserId,
                            //      CreatedTime = DateTime.Now,
                            //      GroupUserCode = x.GroupUserCode,
                            //      Role = DocumentRoleEnum.Main.GetHashCode()
                            //  });
                            var userPermision = (from a in _context.DispatchesUsers
                                                 join b in _context.Users.Where(y => y.Active == true) on a.UserId equals b.Id
                                                 where a.GroupUserCode == obj.Detail.ListGroup[i].GroupUserCode
                                                 select new DispatchesMemberActivity
                                                 {
                                                     Assigner = userId,
                                                     ProcessCode = tracking.ProcessCode,
                                                     UserId = a.UserId,
                                                     CreatedTime = DateTime.Now,
                                                     GroupUserCode = a.GroupUserCode,
                                                     Role = DocumentRoleEnum.Main.GetHashCode()
                                                 }).AsNoTracking();
                            _context.DispatchesMemberActivitys.AddRange(userPermision);
                        }
                    }

                    var listMemberNew = obj.Detail.ListMember.Where(x => x.IsShowDelete == true);
                    foreach (var member in listMemberNew)
                    {
                        var activity = new DispatchesMemberActivity
                        {
                            Assigner = userId,
                            ProcessCode = tracking.ProcessCode,
                            UserId = member.UserId,
                            CreatedTime = DateTime.Now,
                            Role = DocumentRoleEnum.Main.GetHashCode()
                        };
                        _context.DispatchesMemberActivitys.Add(activity);
                    }
                    _context.SaveChanges();
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_UPDATE_SUCCESS"));
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("CCOM_UPDATE_FAILS"));
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetItem([FromBody]int Id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var userId = ESEIM.AppContext.UserId;
                var data = _context.DispatchesHeaders.FirstOrDefault(x => x.Id == Id);
                var model = new IncommingDispatchesModel();
                //Header
                model.Header = new IncommingDispatchesHeaderModel
                {
                    Id = data.Id,
                    DocumentCode = data.DocumentCode,
                    DocumentSymbols = data.DocumentSymbols,
                    PromulgateDate = data.PromulgateDate.HasValue ? data.PromulgateDate.Value.ToString("dd/MM/yyyy") : null,
                    DocumentType = data.DocumentType,
                    SignUser = data.SignUser,
                    CreatedEditor = data.CreatedEditor,
                    Confidentiality = data.Confidentiality,
                    ImportantLevel = data.ImportantLevel,
                    DocumentSymbol = data.DocumentSymbol,
                    DocumentNumber = data.DocumentNumber,
                    SignDate = data.SignDate.HasValue ? data.SignDate.Value.ToString("dd/MM/yyyy") : null,
                    DocumentZone = data.DocumentZone,
                    Position = data.Position,
                    UnitEditor = data.UnitEditor,
                    SecurityLevel = data.SecurityLevel,
                    GetMothod = data.GetMothod,
                    IsQppl = data.IsQppl,
                    CreatedTime = data.CreatedTime,
                    CreatedUserId = data.CreatedUserId,
                    Note = data.Note
                };

                var tracking = _context.DispatchTrackingProcesss.FirstOrDefault(x => x.DispatchCode == data.DispatchCode);
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
                }).AsNoTracking().ToList();
                model.Detail.ListFile.AddRange(listFile);

                //GroupUser
                var listMember = _context.DispatchesMemberActivitys.Where(x => x.ProcessCode == tracking.ProcessCode).Select(x => new IncommingDispatchesMember
                {
                    Id = x.Id,
                    Name = x.User.GivenName,
                    UserId = x.UserId,
                    CreatedTime = x.CreatedTime,
                    GroupUserCode = x.GroupUserCode,
                    Role = x.Role,
                    IsShowDelete = false,
                }).AsNoTracking();
                var listMain = listMember.Where(x => x.Role == DocumentRoleEnum.Main.GetHashCode()).GroupBy(x => x.GroupUserCode).Select(x => x.Key);

                foreach (var item in listMain)
                {
                    if (item == null)
                    {

                        model.Detail.ListMember.AddRange(listMember.Where(x => x.Role == DocumentRoleEnum.Main.GetHashCode() && x.GroupUserCode == item));
                    }
                    else
                    {
                        if (item == EnumHelper<GroupUserEnum>.GetDisplayValue(GroupUserEnum.LD))
                        {
                            var getListMemberActiveVP = from a in _context.AdUserInGroups
                                                        join b in _context.Users on a.UserId equals b.Id
                                                        where a.GroupUserCode == item
                                                        select new
                                                        {
                                                            a.UserId,
                                                        };
                            var getListMemberVP = listMember.Where(x => x.GroupUserCode == item).Select(x => new IncommingDispatchesMember { UserId = x.UserId, IsShowDelete = false });
                            var listDeferent = getListMemberVP.Where(x => !getListMemberActiveVP.Any(y => y.UserId == x.UserId));
                            if (!listDeferent.Any())
                            {
                                var group = new IncommingDispatchesGroup
                                {
                                    GroupUserCode = item,
                                    Name = _context.AdGroupUsers.FirstOrDefault(x => x.GroupUserCode == item).Title ?? null,
                                    IsShow = false,
                                };
                                model.Detail.ListGroup.Add(group);
                            }
                            else
                            {
                                model.Detail.ListMember.AddRange(getListMemberVP);
                            }
                        }
                        else
                        {

                            var getListUserPermisionActive = _context.DispatchesUsers.Where(x => x.GroupUserCode == item)
                           .Select(x => new
                           {
                               x.UserId,
                           });
                            var getListUser = listMember.Where(x => x.GroupUserCode == item).Select(x => new IncommingDispatchesMember { UserId = x.UserId, IsShowDelete = false });
                            var listDeferent = getListUser.Where(x => !getListUserPermisionActive.Any(y => y.UserId == x.UserId));
                            if (!listDeferent.Any())
                            {
                                var group = new IncommingDispatchesGroup
                                {
                                    GroupUserCode = item,
                                    Name = _context.AdGroupUsers.FirstOrDefault(x => x.GroupUserCode == item).Title ?? null,
                                    IsShow = false,
                                };
                                model.Detail.ListGroup.Add(group);
                            }
                            else
                            {
                                model.Detail.ListMember.AddRange(getListUser);
                            }
                        }
                    }
                }
                //model.Detail.DeadLine = tracking.DeadLine.HasValue ? tracking.DeadLine.Value.ToString("dd/MM/yyyy") : null;
                msg.Object = model;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("DOD_MSG_ERR_DOCUMENT"));
            }
            return Json(msg);
        }

        //[HttpPost]
        //public JsonResult Delete([FromBody]List<int> listId)
        //{
        //    var mess = new JMessage { Error = false, Title = "" };
        //    try
        //    {
        //        foreach (var id in listId)
        //        {
        //            var data = _context.DispatchesHeaders.FirstOrDefault(x => x.Id == id);
        //            if (data != null)
        //            {
        //                data.IsDeleted = true;
        //                _context.Update(data);
        //            }
        //            _context.SaveChanges();
        //        }
        //        mess.Title = "Xóa sổ văn bản thành công";
        //    }
        //    catch (Exception ex)
        //    {
        //        mess.Title = "Xóa sổ văn bản lỗi";
        //        mess.Error = true;
        //    }
        //    return Json(mess);
        //}
        #region Combobox

        public object GetDispatches()
        {
            var query = _context.DispatchesCategorys.Where(x => x.Type == EnumHelper<DocumentTypeEnum>.GetDisplayValue(DocumentTypeEnum.SVB) && x.IsDeleted == false).Select(x => new { x.Code, x.Name, x.NumberCreator, x.IsYearBefore, x.DocumentSymbol, x.TypeM, x.Year }).AsNoTracking();
            var list = query.ToList();
            return list;
        }
        [HttpPost]
        public object GetDocumentType()
        {
            var query = _context.DispatchesCategorys.Where(x => x.Type == EnumHelper<DocumentTypeEnum>.GetDisplayValue(DocumentTypeEnum.LVB) && x.IsDeleted == false).Select(x => new { x.Code, x.Name }).AsNoTracking();
            return query;
        }
        [HttpPost]
        public object GetListUserInUnit(List<string> listGroup)
        {
            var list = listGroup[0] != null ? listGroup[0].Split(',') : new string[0];
            var query = (from a in _context.AdUserInGroups
                         join b in _context.Users on a.UserId equals b.Id
                         where list.Any(y => y == a.GroupUserCode)
                         && b.Active == true
                         select new
                         {
                             b.Id,
                             b.GivenName,
                         }).AsNoTracking();
            return query;
        }

        [HttpPost]
        public object GetRoleForUser(string userId)
        {
            var query = (from a in _context.Users
                         join b in _context.UserRoles on a.Id equals b.UserId into b2
                         from b1 in b2.DefaultIfEmpty()
                         join c in _context.Roles on b1.RoleId equals c.Id into c2
                         from c1 in c2.DefaultIfEmpty()
                         where a.Id == userId
                         select new GetListUserWithRoleResponse
                         {
                             Code = (c1 != null ? c1.Code : null)
                         }).AsParallel().First();
            return query;
        }

        [HttpPost]
        public object GetDocumentUrgency()
        {
            var query = _context.DispatchesCategorys.Where(x => x.Type == EnumHelper<DocumentTypeEnum>.GetDisplayValue(DocumentTypeEnum.DQT) && x.IsDeleted == false).Select(x => new { x.Code, x.Name }).AsNoTracking();
            return query;
        }
        [HttpPost]
        public object GetDocumentConfidentiality()
        {
            var query = _context.DispatchesCategorys.Where(x => x.Type == EnumHelper<DocumentTypeEnum>.GetDisplayValue(DocumentTypeEnum.DQT) && x.IsDeleted == false).Select(x => new { x.Code, x.Name }).AsNoTracking();
            return query;
        }
        [HttpPost]
        public object GetPosition()
        {
            var query = _context.Roles.Where(x => x.Status == true).Select(x => new { x.Code, x.Title }).AsNoTracking();
            return query;
        }
        [HttpPost]
        public object GetDocumentField()
        {
            var query = _context.DispatchesCategorys.Where(x => x.Type == EnumHelper<DocumentTypeEnum>.GetDisplayValue(DocumentTypeEnum.LVVB) && x.IsDeleted == false).Select(x => new { x.Code, x.Name }).AsNoTracking();
            return query;
        }
        [HttpPost]
        public object GetDocumentSecurity()
        {
            var query = _context.DispatchesCategorys.Where(x => x.Type == EnumHelper<DocumentTypeEnum>.GetDisplayValue(DocumentTypeEnum.DM) && x.IsDeleted == false).Select(x => new { x.Code, x.Name }).AsNoTracking();
            return query;
        }
        [HttpPost]
        public object GetGetMethod()
        {
            var query = _context.CommonSettings.Where(x => x.Group == EnumHelper<DocumentTypeEnum>.GetDisplayValue(DocumentTypeEnum.GET_METHOD) && x.IsDeleted == false).Select(x => new { x.CodeSet, x.ValueSet }).AsNoTracking();
            return query;
        }

        [HttpPost]
        public object GetLoadDefaultUnit()
        {
            var userId = ESEIM.AppContext.UserId;
            var data = _context.AdUserInGroups.Where(x => x.UserId == userId).Select(x => new
            {
                x.UserId,
                x.GroupUserCode,
            }).FirstOrDefault();
            return data;
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
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_FAIL_DOWLOAD"), CommonUtil.ResourceValue("COM_FILE")) + upload.Title;
            }
            else
            {
                var model = new IncommingDispatchesFile
                {
                    Source = "/uploads/Files/" + upload.Object.ToString(),
                    User = User?.GivenName,
                };
                msg.Object = model;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_SUCCESS_DOWLOAD"), CommonUtil.ResourceValue("COM_FILE"));
            }
            return Json(msg);
        }
        [HttpPost]
        public object GetUserActive()
        {
            var userId = ESEIM.AppContext.UserId;
            var user = _context.Users.Where(x => x.Id == userId).Select(x => new
            {
                Id = x.Id,
                Name = x.GivenName,
            }).First();
            return user;
        }
        #endregion


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


        //private bool CheckPermision(string userId)
        //{
        //    bool result = false;
        //    var check = _context.AdUserInGroups.FirstOrDefault(x => x.UserId == userId && x.GroupUserCode == "VT");
        //    if (check != null)
        //    {
        //        result = true;
        //    }
        //    return result;
        //}
        [HttpPost]
        public object GetListUserInGroup(List<string> listGroup)
        {
            var listSelectGroup = listGroup[0] != null ? listGroup[0].Split(',') : new string[0];
            var userId = ESEIM.AppContext.UserId;
            var list = new List<GroupMember>();
            var userPermision = (from a in _context.DispatchesUsers
                                 join b in _context.Users.Where(y => y.Active == true) on a.UserId equals b.Id
                                 where listSelectGroup.Any(z => z == a.GroupUserCode)
                                 select new GroupMember
                                 {
                                     UserId = a.UserId,
                                     Name = b != null ? b.GivenName : null,
                                     GroupUserCode = a.GroupUserCode,
                                     GroupName = _context.AdGroupUsers.FirstOrDefault(y => y.GroupUserCode == a.GroupUserCode).Title ?? null,
                                     IsChecked = false,
                                     IsPermision = true,
                                 }).AsNoTracking();
            var listMember = (from a in _context.AdUserInGroups
                              join b in _context.Users on a.UserId equals b.Id
                              where listSelectGroup.Any(y => y == a.GroupUserCode) && !userPermision.Any(y => y.UserId == a.UserId)
                              && b.Active == true
                              select new GroupMember
                              {
                                  UserId = a.UserId,
                                  Name = b.GivenName,
                                  GroupUserCode = a.GroupUserCode,
                                  GroupName = _context.AdGroupUsers.FirstOrDefault(y => y.GroupUserCode == a.GroupUserCode).Title ?? null,
                                  IsChecked = false,
                                  IsPermision = false,
                              }).AsNoTracking().AsParallel();
            list.AddRange(userPermision);
            list.AddRange(listMember);
            return list;
        }
        [HttpPost]
        public object GetListUser()
        {
            ListSignUserResponse list = new ListSignUserResponse();
            var ld = (from a in _context.AdUserInGroups
                      join b in _context.Users on a.UserId equals b.Id
                      where a.GroupUserCode == EnumHelper<GroupUserEnum>.GetDisplayValue(GroupUserEnum.LD)
                      && b.Active == true
                      select new SignUserResponse
                      {
                          Id = b.Id,
                          GivenName = b.GivenName,
                      }).ToList();
            var nv = (from a in _context.Roles
                      join b in _context.UserRoles on a.Id equals b.RoleId into b2
                      from b1 in b2.DefaultIfEmpty()
                      join c in _context.Users on b1.UserId equals c.Id into c2
                      from c1 in c2.DefaultIfEmpty()
                      where a.Code != EnumHelper<GroupUserEnum>.GetDisplayValue(GroupUserEnum.CV) && b1 != null && c1 != null
                      && c1.Active == true
                      select new SignUserResponse
                      {
                          Id = c1.Id,
                          GivenName = c1.GivenName
                      }).ToList();
            var all = (from a in _context.Users
                       select new SignUserResponse
                       {
                           Id = a.Id,
                           GivenName = a.GivenName
                       }).ToList();


            var nv1 = new List<SignUserResponse>();

            foreach (var item in ld)
            {
                nv1.Add(item);
            }
            foreach (var item in nv)
            {
                nv1.Add(item);
            }
            list.LD = ld;
            list.NV = nv1;
            list.All = all;
            return list;
        }



        [HttpPost]
        public object GetActivity(int id)
        {
            var data = _context.DispatchesHeaders.FirstOrDefault(x => x.Id == id);
            var tracking = _context.DispatchTrackingProcesss.FirstOrDefault(x => x.DispatchCode == data.DispatchCode);
            var userId = ESEIM.AppContext.UserId;
            var listUserId = new List<string>();
            var listMember = _context.DispatchesMemberActivitys.Where(x => x.ProcessCode == tracking.ProcessCode).Select(x => new
            {
                x.Assigner,
                x.UserId,
                x.Role
            }).AsNoTracking().AsParallel();
            //tracking main
            var listMemberMain = _context.DispatchesMemberActivitys.Where(x => x.ProcessCode == tracking.ProcessCode && x.Role == DocumentRoleEnum.Main.GetHashCode()).Select(x => new
            {
                x.Assigner,
                x.UserId,
            }).AsNoTracking().AsParallel();
            listUserId.AddRange(listMemberMain.Select(x => x.UserId));
            if (listMemberMain.Any())
            {
                listUserId.Add(listMemberMain.First().Assigner);
            }
            var listTracking = _context.DispatchTrackingProcesss.Where(x => x.DispatchCode == data.DispatchCode && listUserId.Any(y => y == x.UserId)).OrderBy(x => x.CreatedTime).Select(x => new IncommingDispatchesActivity
            {
                ProcessCode = x.ProcessCode,
                User = x.User.GivenName,
                Action = x.Action,
                CreatedTime = x.CreatedTime,
            }).AsNoTracking().AsParallel();
            return listTracking;
        }

        [HttpPost]
        public object GetYear()
        {
            var query = _context.DispatchesHeaders.Where(x => x.Type == EnumHelper<DocumentTypeEnum>.GetDisplayValue(DocumentTypeEnum.OBT)).Select(x => x.Year).Distinct().AsParallel();
            return query;
        }
    }
    public class OutDispatchesJtable : JTableModel
    {
        public string Number { get; set; }
        public string DocumentSymbol { get; set; }
        public string DocumentSymbols { get; set; }
        public string FromDate { get; set; }
        public string ToDate { get; set; }
        public string PromulgateDate { get; set; }
        public string SignUser { get; set; }
        public string CreatedUser { get; set; }
        public string Note { get; set; }
        public string UnitEditor { get; set; }
        public int? Year { get; set; }
    }
    public class OutResponse
    {
        public int Id { get; set; }
        public string DocumentCode { get; set; }
        public string DocumentSymbols { get; set; }
        public string DocumentSymbol { get; set; }
        public int? DocumentNumber { get; set; }
        public string Note { get; set; }
        public string UserEditor { get; set; }
        public string Origanization { get; set; }
        public string SignUser { get; set; }
        public DateTime? CreatedTime { get; set; }
        public string UnitEditor { get; set; }
        public string Status { get; set; }
    }
    public class GetListUserWithRoleResponse
    {
        public string GivenName { get; set; }

        public string Code { get; set; }
    }
    public class SignUserResponse
    {
        public string GivenName { get; set; }

        public string Id { get; set; }
    }
    public class ListSignUserResponse
    {
        public ListSignUserResponse()
        {
            LD = new List<SignUserResponse>();
            NV = new List<SignUserResponse>();
            All = new List<SignUserResponse>();
        }
        public List<SignUserResponse> LD { get; set; }
        public List<SignUserResponse> NV { get; set; }
        public List<SignUserResponse> All { get; set; }
    }

    public class GroupMember
    {
        public string UserId { get; set; }
        public string Name { get; set; }
        public string GroupUserCode { get; set; }
        public string GroupName { get; set; }
        public bool IsChecked { get; set; }
        public bool IsPermision { get; set; }

    }
}