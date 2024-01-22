using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
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
    public class DispatchesOutDispatchesPendingController : BaseController
    {
        public class DocumentUserModel
        {
            public int Id { get; set; }
            public List<string> UserId { get; set; }
        }
        public class OutDispatchesPendingJtable : JTableModel
        {
            public string Number { get; set; }
            public string DocumentSymbol { get; set; }
            public string DocumentSymbols { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string SignUser { get; set; }
            public string CreatedUser { get; set; }

            public string Note { get; set; }
            public string UnitEditor { get; set; }
            public string Status { get; set; }
            public int? Year { get; set; }
        }
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;


        public DispatchesOutDispatchesPendingController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment)
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
        public object JTable([FromBody]OutDispatchesPendingJtable jTablePara)
        {
            var userId = ESEIM.AppContext.UserId;
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var outBoxType = EnumHelper<DocumentTypeEnum>.GetDisplayValue(DocumentTypeEnum.OBT);
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            if (!string.IsNullOrEmpty(jTablePara.Number) || !string.IsNullOrEmpty(jTablePara.DocumentSymbols) || !string.IsNullOrEmpty(jTablePara.SignUser)
            || !string.IsNullOrEmpty(jTablePara.Note) || !string.IsNullOrEmpty(jTablePara.UnitEditor)
            || !string.IsNullOrEmpty(jTablePara.Status))
            {
                var count = (from a in _context.DispatchesHeaders
                             from b in _context.DispatchTrackingProcesss.Where(o => o.DispatchCode == a.DispatchCode).Take(1)
                             join c in _context.DispatchesMemberActivitys on b.ProcessCode equals c.ProcessCode
                             where a.Type == outBoxType && c.UserId == userId
                              && ((jTablePara.Number == null) || (a.DocumentNumber.ToString().Contains(jTablePara.Number.ToString())))
                              && ((string.IsNullOrEmpty(jTablePara.Number)) || (a.DocumentNumber.ToString().Contains(jTablePara.Number.ToString())))
                              && ((string.IsNullOrEmpty(jTablePara.DocumentSymbols)) || (a.DocumentSymbols.ToLower().Contains(jTablePara.DocumentSymbols.ToLower())))
                              && ((string.IsNullOrEmpty(jTablePara.SignUser)) || (a.SignUser.ToLower().Contains(jTablePara.SignUser.ToLower())))
                              && ((string.IsNullOrEmpty(jTablePara.Note)) || (a.Note.ToLower().Contains(jTablePara.Note.ToLower())))
                              && ((string.IsNullOrEmpty(jTablePara.UnitEditor)) || (a.UnitEditor.ToLower().Contains(jTablePara.UnitEditor.ToLower())))
                              && ((string.IsNullOrEmpty(jTablePara.Status)) || (jTablePara.Status == EnumHelper<DocumentStatusEnum>.GetDisplayValue(DocumentStatusEnum.NoReview) && c.AssigneeConfirm == null) || (c.AssigneeConfirm == jTablePara.Status))
                              && ((jTablePara.Year == null) || (a.Year.Equals(jTablePara.Year)))
                             select a).AsNoTracking().Distinct().Count();
                var query = (from a in _context.DispatchesHeaders
                             from b in _context.DispatchTrackingProcesss.Where(o => o.DispatchCode == a.DispatchCode).Take(1)
                             join c in _context.DispatchesMemberActivitys on b.ProcessCode equals c.ProcessCode
                             where a.Type == outBoxType && c.UserId == userId
                              && ((jTablePara.Number == null) || (a.DocumentNumber.ToString().Contains(jTablePara.Number.ToString())))
                              && ((string.IsNullOrEmpty(jTablePara.Number)) || (a.DocumentNumber.ToString().Contains(jTablePara.Number.ToString())))
                              && ((string.IsNullOrEmpty(jTablePara.DocumentSymbols)) || (a.DocumentSymbols.ToLower().Contains(jTablePara.DocumentSymbols.ToLower())))
                              && ((string.IsNullOrEmpty(jTablePara.SignUser)) || (a.SignUser.ToLower().Contains(jTablePara.SignUser.ToLower())))
                              && ((string.IsNullOrEmpty(jTablePara.Note)) || (a.Note.ToLower().Contains(jTablePara.Note.ToLower())))
                              && ((string.IsNullOrEmpty(jTablePara.UnitEditor)) || (a.UnitEditor.ToLower().Contains(jTablePara.UnitEditor.ToLower())))
                              && ((string.IsNullOrEmpty(jTablePara.Status)) || (jTablePara.Status == EnumHelper<DocumentStatusEnum>.GetDisplayValue(DocumentStatusEnum.NoReview) && c.AssigneeConfirm == null) || (c.AssigneeConfirm == jTablePara.Status))
                              && ((jTablePara.Year == null) || (a.Year.Equals(jTablePara.Year)))
                             select new { a, c }).AsNoTracking().OrderByDescending(x => x.a.Id).DistinctBy(x => x.a.Id).Skip(intBeginFor).Take(jTablePara.Length).ToList();
                var data = query.Select(d => new
                {
                    d.a.Id,
                    d.a.DocumentNumber,
                    d.a.DocumentSymbols,
                    SignUser = _context.Users.FirstOrDefault(y => y.Id == d.a.SignUser)?.GivenName,
                    d.a.Note,
                    d.a.DocumentSymbol,
                    UnitEditor = _context.AdGroupUsers.FirstOrDefault(y => y.GroupUserCode == d.a.UnitEditor)?.Title,
                    Status = d.c.AssigneeConfirm
                }).ToList();
                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "PromulgateDate", "DocumentSymbol", "DocumentSymbols", "DocumentNumber", "DeadLine", "Status", "SignUser", "Note", "UnitEditor");
                return Json(jdata);
            }
            else
            {
                var count = (from a in _context.DispatchesHeaders
                             from b in _context.DispatchTrackingProcesss.Where(o => o.DispatchCode == a.DispatchCode).Take(1)
                             join c in _context.DispatchesMemberActivitys on b.ProcessCode equals c.ProcessCode
                             where a.Type == outBoxType && c.UserId == userId
                             && c.AssigneeConfirm != EnumHelper<DocumentStatusEnum>.GetDisplayValue(DocumentStatusEnum.Review)
                             && ((jTablePara.Year == null) || (a.Year.Equals(jTablePara.Year)))
                             select a).AsNoTracking().Distinct().Count();
                var query = (from a in _context.DispatchesHeaders
                             from b in _context.DispatchTrackingProcesss.Where(o => o.DispatchCode == a.DispatchCode).Take(1)
                             join c in _context.DispatchesMemberActivitys on b.ProcessCode equals c.ProcessCode
                             where a.Type == outBoxType && c.UserId == userId
                             && c.AssigneeConfirm != EnumHelper<DocumentStatusEnum>.GetDisplayValue(DocumentStatusEnum.Review)
                             && ((jTablePara.Year == null) || (a.Year.Equals(jTablePara.Year)))
                             select new { a, c }).AsNoTracking().OrderByDescending(x => x.a.Id).DistinctBy(x => x.a.Id).Skip(intBeginFor).Take(jTablePara.Length).ToList();
                var data = query.Where(x => (string.IsNullOrEmpty(jTablePara.Status)) || (jTablePara.Status == EnumHelper<DocumentStatusEnum>.GetDisplayValue(DocumentStatusEnum.NoReview) && x.c.AssigneeConfirm == null) || (x.c.AssigneeConfirm == jTablePara.Status)).Select(d => new
                {
                    d.a.Id,
                    d.a.DocumentNumber,
                    d.a.DocumentSymbols,
                    SignUser = _context.Users.FirstOrDefault(y => y.Id == d.a.SignUser)?.GivenName,
                    d.a.Note,
                    d.a.DocumentSymbol,
                    UnitEditor = _context.AdGroupUsers.FirstOrDefault(y => y.GroupUserCode == d.a.UnitEditor)?.Title,
                    Status = d.c.AssigneeConfirm
                }).ToList();
                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "PromulgateDate", "DocumentSymbol", "DocumentSymbols", "DocumentNumber", "DeadLine", "Status", "SignUser", "Note", "UnitEditor");
                return Json(jdata);
            }





        }

        [HttpPost]
        public JsonResult Send([FromBody]IncommingDispatchesModel obj)
        {
            var msg = new JMessage { Title = "", Error = false };
            try
            {
                string processCode = "";
                var userId = ESEIM.AppContext.UserId;
                var dispatchess = _context.DispatchesHeaders.FirstOrDefault(x => x.Id == obj.Header.Id);
                var tracking = _context.DispatchTrackingProcesss.FirstOrDefault(x => x.DispatchCode == dispatchess.DispatchCode);
                if (tracking != null)
                {
                    var trackingNew = new DispatchTrackingProcess
                    {
                        DispatchCode = dispatchess.DispatchCode,
                        ProcessCode = tracking.ProcessCode,
                        Action = EnumHelper<DocumentStatusEnum>.GetDisplayValue(DocumentStatusEnum.Send),
                        CreatedTime = DateTime.Now,
                        //Reason = obj.Detail.Reason,
                        UserId = userId,
                        //Status = tracking.Status,
                    };
                    _context.DispatchTrackingProcesss.Add(trackingNew);
                    processCode = tracking.ProcessCode;
                }

                var listMemberNew = obj.Detail.ListMember.Where(x => x.IsShowDelete == true);
                foreach (var member in listMemberNew)
                {
                    var activity = new DispatchesMemberActivity
                    {
                        Assigner = userId,
                        ProcessCode = processCode,
                        UserId = member.UserId,
                        CreatedTime = DateTime.Now,
                        Role = DocumentRoleEnum.Support.GetHashCode()
                    };
                    _context.DispatchesMemberActivitys.Add(activity);
                }
                _context.SaveChanges();
                msg.Title = String.Format(CommonUtil.ResourceValue("DODP_MSG_UPDATE_SUCCESS"));
            }
            catch
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("DODP_MSG_UPDATE_FAIL"));
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Watched([FromBody]int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var userId = ESEIM.AppContext.UserId;
                var dispatches = _context.DispatchesHeaders.FirstOrDefault(x => x.Id == id);
                var tracking = _context.DispatchTrackingProcesss.FirstOrDefault(x => x.DispatchCode == dispatches.DispatchCode);
                var dispatchesMember = _context.DispatchesMemberActivitys.Where(x => x.ProcessCode == tracking.ProcessCode && x.UserId == userId && string.IsNullOrEmpty(x.AssigneeConfirm));
                if (dispatchesMember.Any())
                {
                    foreach (var item in dispatchesMember)
                    {
                        //add action
                        var trackingNew = new DispatchTrackingProcess
                        {
                            DispatchCode = dispatches.DispatchCode,
                            ProcessCode = tracking.ProcessCode,
                            Action = EnumHelper<DocumentStatusEnum>.GetDisplayValue(DocumentStatusEnum.Review),
                            UserId = userId,
                            CreatedTime = DateTime.Now,
                        };
                        _context.DispatchTrackingProcesss.Add(trackingNew);
                        //update status
                        item.AssigneeConfirm = EnumHelper<DocumentStatusEnum>.GetDisplayValue(DocumentStatusEnum.Review);
                        _context.DispatchesMemberActivitys.Update(item);
                    }
                    _context.SaveChanges();
                }
                msg.Title = String.Format(CommonUtil.ResourceValue("DODP_MSG_REVIEW"));
            }
            catch (Exception ex)
            {
                msg.Title = String.Format(CommonUtil.ResourceValue("DODP_MSG_FAIL_REVIEW"));
                msg.Error = true;
            }
            return Json(msg);
        }







        #region detail && combobox
        [HttpPost]
        public JsonResult GetItem([FromBody]int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var userId = ESEIM.AppContext.UserId;
                var data = _context.DispatchesHeaders.FirstOrDefault(x => x.Id == id);

                var model = new IncommingDispatchesResponseModel();
                //Header
                model.Header = new IncommingDispatchesResponseHeaderModel
                {
                    Id = data.Id,
                    DocumentName = _context.DispatchesCategorys.FirstOrDefault(x => x.Code == data.DocumentCode)?.Name,
                    DocumentNumber = data.DocumentNumber,
                    DocumentSymbol = data.DocumentSymbol,
                    DocumentSymbols = data.DocumentSymbols,
                    //Origanization = _context.AdOrganizations.FirstOrDefault(x => x.OrgCode == data.Origanization)?.OrgName,
                    //FromDate = data.FromDate.HasValue ? data.FromDate.Value.ToString("dd/MM/yyyy") : null,
                    PromulgateDate = data.PromulgateDate.HasValue ? data.PromulgateDate.Value.ToString("dd/MM/yyyy") : null,
                    //Epitome = data.Epitome,
                    SignDate = data.SignDate.HasValue ? data.SignDate.Value.ToString("dd/MM/yyyy") : null,
                    //DocumentZone = _context.DispatchesCategorys.FirstOrDefault(x => x.Code == data.DocumentZone)?.Name,
                    //DocumentType = _context.DispatchesCategorys.FirstOrDefault(x => x.Code == data.DocumentType)?.Name,
                    SignUser = data.SignUser,
                    Position = _context.Roles.FirstOrDefault(x => x.Code == data.Position)?.Title,
                    //Confidentiality = _context.DispatchesCategorys.FirstOrDefault(x => x.Code == data.Confidentiality)?.Name,
                    //ImportantLevel = _context.DispatchesCategorys.FirstOrDefault(x => x.Code == data.ImportantLevel && x.Type == EnumHelper<DocumentTypeEnum>.GetDisplayValue(DocumentTypeEnum.DM))?.Name,
                    SecurityLevel = _context.DispatchesCategorys.FirstOrDefault(x => x.Code == data.SecurityLevel && x.Type == EnumHelper<DocumentTypeEnum>.GetDisplayValue(DocumentTypeEnum.DM))?.Name,
                    //GetMothod = _context.CommonSettings.FirstOrDefault(x => x.CodeSet == data.GetMothod)?.ValueSet,
                    CreatedEditor = data.CreatedEditor,
                    CreatedUser = !string.IsNullOrEmpty(data.CreatedUserId) ? _context.Users.FirstOrDefault(x => x.Id == data.CreatedUserId)?.GivenName : null,
                    UnitEditor = data.UnitEditor,
                    IsQPPL = data.IsQppl,
                    //ExperiedReply = data.ExperiedReply.HasValue ? data.ExperiedReply.Value.ToString("dd/MM/yyyy") : null,
                    ReplyStatus = data.ReplyStatus,
                    Note = data.Note,
                    Status = data.Status,
                };

                var tracking = _context.DispatchTrackingProcesss.FirstOrDefault(x => x.DispatchCode == data.DispatchCode);
                //file
                var listFile = _context.DispatchesFileACTs.Where(x => x.ProcessCode == tracking.ProcessCode).Select(y => new IncommingDispatchesFile
                {
                    Id = y.Id,
                    CreatedEditor = model.Header.CreatedUser,
                    User = y.User.GivenName,
                    FileName = y.FileName,
                    Fomart = y.Fomart,
                    Source = y.Soure,
                    CreatedTime = y.CreatedTime,
                }).AsNoTracking();
                model.Detail.ListFile.AddRange(listFile);

                //GroupUser
                var listMember = _context.DispatchesMemberActivitys.Where(x => x.ProcessCode == tracking.ProcessCode).Select(x => new IncommingDispatchesMember
                {
                    Id = x.Id,
                    Assigner = x.Assigner,
                    Name = x.User.GivenName,
                    UserId = x.UserId,
                    CreatedTime = x.CreatedTime,
                    GroupUserCode = x.GroupUserCode,
                    IsShowDelete = false,
                    Role = x.Role,
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
                //Người xử lý chính
                var checkUserMain = listMember.FirstOrDefault(x => x.UserId == userId);
                if (checkUserMain.Role == DocumentRoleEnum.Main.GetHashCode())
                {
                    var listAssignerActiveSend = listMember.Where(x => x.Assigner == userId).Distinct().Traverse(y => listMember.Where(child => y.UserId == child.Assigner && y.Role != DocumentRoleEnum.Main.GetHashCode()).DistinctBy(z => z.Assigner)).Select(x => new IncommingDispatchesMember
                    {
                        UserId = x.UserId,
                        Name = x.Name,
                        IsShowDelete = false,
                        IsShowSend = true
                    });
                    model.Detail.ListMember.AddRange(listAssignerActiveSend);
                }
                else
                {
                    var userSend = listMember.Where(x => x.UserId == userId && x.Role != DocumentRoleEnum.Main.GetHashCode()).Flatten(y => listMember.Where(parent => y.Assigner == parent.UserId && parent.Role != DocumentRoleEnum.Main.GetHashCode())).Select(x => x.Assigner).FirstOrDefault();
                    if (userSend != null)
                    {
                        var listAssignerActiveSend = listMember.Where(x => x.Assigner == userSend).Distinct().Traverse(y => listMember.Where(child => y.UserId == child.Assigner && y.Role != DocumentRoleEnum.Main.GetHashCode()).DistinctBy(z => z.Assigner)).Select(x => new IncommingDispatchesMember
                        {
                            UserId = x.UserId,
                            Name = x.Name,
                            IsShowDelete = false,
                            IsShowSend = true
                        });
                        model.Detail.ListMember.AddRange(listAssignerActiveSend);
                    }
                }
                msg.Object = model;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("DODP_MSG_FAIL_DOCUMENT"));
            }
            return Json(msg);
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
                msg.Title = String.Format(CommonUtil.ResourceValue("DODP_MSG_FILE_FAIL")) + upload.Title;
            }
            else
            {
                var model = new IncommingDispatchesFile
                {
                    Source = "/uploads/Files/" + upload.Object.ToString(),
                    User = User?.GivenName,
                };
                msg.Object = model;
                msg.Title = String.Format(CommonUtil.ResourceValue("DODP_MSG_FILE_FAIL_SUCCESS"));
            }
            return Json(msg);
        }
        [HttpPost]
        public object GetActivity(int id)
        {
            var data = _context.DispatchesHeaders.FirstOrDefault(x => x.Id == id);
            var tracking = _context.DispatchTrackingProcesss.FirstOrDefault(x => x.DispatchCode == data.DispatchCode);
            var userId = ESEIM.AppContext.UserId;
            var listUserId = new List<string>();
            var listMember = _context.DispatchesMemberActivitys.Where(x => x.ProcessCode == tracking.ProcessCode).Select(x => new IncommingDispatchesMember
            {
                Assigner = x.Assigner,
                UserId = x.UserId,
                Role = x.Role
            }).AsNoTracking();

            //tracking main
            var listMemberMain = _context.DispatchesMemberActivitys.Where(x => x.ProcessCode == tracking.ProcessCode && x.Role == DocumentRoleEnum.Main.GetHashCode()).Select(x => new IncommingDispatchesMember
            {
                Assigner = x.Assigner,
                UserId = x.UserId,
            });
            listUserId.AddRange(listMemberMain.Select(x => x.UserId));
            if (listMemberMain.Any())
            {
                listUserId.Add(listMemberMain.First().Assigner);
            }
            var checkUserMain = listMember.FirstOrDefault(x => x.UserId == userId);
            if (checkUserMain.Role == DocumentRoleEnum.Main.GetHashCode())
            {
                var listAssignerActiveSend = listMember.Where(x => x.Assigner == userId).Distinct().Traverse(y => listMember.Where(child => y.UserId == child.Assigner && y.Role != DocumentRoleEnum.Main.GetHashCode()).DistinctBy(z => z.Assigner)).Select(x => new IncommingDispatchesMember
                {
                    UserId = x.UserId,
                });
                listUserId.AddRange(listAssignerActiveSend.Select(x => x.UserId));
            }
            else
            {
                var userSend = listMember.Where(x => x.UserId == userId && x.Role != DocumentRoleEnum.Main.GetHashCode()).Flatten(y => listMember.Where(parent => y.Assigner == parent.UserId && parent.Role != DocumentRoleEnum.Main.GetHashCode())).Select(x => x.Assigner).FirstOrDefault();
                if (userSend != null)
                {
                    var listAssignerActiveSend = listMember.Where(x => x.Assigner == userSend).Distinct().Traverse(y => listMember.Where(child => y.UserId == child.Assigner && y.Role != DocumentRoleEnum.Main.GetHashCode()).DistinctBy(z => z.Assigner)).Select(x => new IncommingDispatchesMember
                    {
                        UserId = x.UserId,
                    });
                    listUserId.AddRange(listAssignerActiveSend.Select(x => x.UserId));
                }
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
        public List<TreeViewResource> GetAllGroupUser()
        {
            var data = _context.AdGroupUsers.Where(x => x.IsEnabled == true).OrderByDescending(x => x.GroupUserId);
            var dataOrder = GetSubTreeData(data.AsNoTracking().ToList(), null, new List<TreeViewResource>(), 0);
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
            var userId = ESEIM.AppContext.UserId;
            var listPermision = _context.DispatchesUsers.Where(x => list.Any(y => y == x.GroupUserCode))
             .Select(x => new
             {
                 x.UserId,
                 Name = _context.Users.FirstOrDefault(y => y.Id == x.UserId).GivenName ?? null,
                 x.GroupUserCode,
                 GroupName = _context.AdGroupUsers.FirstOrDefault(y => y.GroupUserCode == x.GroupUserCode).Title ?? null,
                 IsChecked = false,
                 IsPermision = true,
             });
            var listMember = from a in _context.AdUserInGroups
                             join b in _context.Users on a.UserId equals b.Id
                             where list.Any(y => y == a.GroupUserCode) && !listPermision.Any(y => y.UserId == a.UserId)
                             && b.Active == true
                             select new
                             {
                                 a.UserId,
                                 Name = b.GivenName,
                                 a.GroupUserCode,
                                 GroupName = _context.AdGroupUsers.FirstOrDefault(y => y.GroupUserCode == a.GroupUserCode).Title ?? null,
                                 IsChecked = false,
                                 IsPermision = false,
                             };
            var listUser = listPermision.Concat(listMember);
            return listUser;
        }

        [HttpPost]
        public object GetYear()
        {
            var query = _context.DispatchesHeaders.Where(x => x.Type == EnumHelper<DocumentTypeEnum>.GetDisplayValue(DocumentTypeEnum.OBT)).Select(x => x.Year).Distinct().AsParallel();
            return query;
        }

        [HttpPost]
        public object GetListUser()
        {
            var listMember = _context.Users.Where(x => x.Active == true).Select(x => new { x.Id, x.GivenName }).AsNoTracking();
            return listMember;
        }
        [HttpPost]
        public object CheckExist([FromBody]DocumentUserModel obj)
        {
            var msg = new JMessage { Title = "", Error = false };
            var data = _context.DispatchesHeaders.FirstOrDefault(x => x.Id == obj.Id);
            var tracking = _context.DispatchTrackingProcesss.FirstOrDefault(x => x.DispatchCode == data.DispatchCode);
            var listExist = _context.DispatchesMemberActivitys.Where(x => x.ProcessCode == tracking.ProcessCode && obj.UserId.Any(y => y == x.UserId)).Select(x => new
            {
                x.UserId,
            });
            return listExist;
        }
        #endregion
    }
}