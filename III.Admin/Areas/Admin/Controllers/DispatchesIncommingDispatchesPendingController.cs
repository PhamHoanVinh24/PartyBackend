using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Syncfusion.XlsIO;
using Syncfusion.Drawing;
using System.IO;
using III.Domain.Enums;
using Microsoft.AspNetCore.Hosting;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class DispatchesIncommingDispatchesPendingController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;

        public DispatchesIncommingDispatchesPendingController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment)
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
        public object JTable([FromBody]IncommingDispatchesJtableModel jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var userId = ESEIM.AppContext.UserId;
            var inBoxType = EnumHelper<DocumentTypeEnum>.GetDisplayValue(DocumentTypeEnum.InBoxType);
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var createdFrom = !string.IsNullOrEmpty(jTablePara.CreatedTimeFrom) ? DateTime.ParseExact(jTablePara.CreatedTimeFrom, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var createdTo = !string.IsNullOrEmpty(jTablePara.CreatedTimeTo) ? DateTime.ParseExact(jTablePara.CreatedTimeTo, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            if (!string.IsNullOrEmpty(jTablePara.Number) || !string.IsNullOrEmpty(jTablePara.FromDate) || !string.IsNullOrEmpty(jTablePara.ToDate)
            || !string.IsNullOrEmpty(jTablePara.Origanization) || !string.IsNullOrEmpty(jTablePara.DocumentSymbol)
            || !string.IsNullOrEmpty(jTablePara.CreatedTimeFrom) || !string.IsNullOrEmpty(jTablePara.CreatedTimeTo) || !string.IsNullOrEmpty(jTablePara.Note) || !string.IsNullOrEmpty(jTablePara.Status))
            {
                var query = (from a in _context.DispatchesHeaders
                             from b in _context.DispatchTrackingProcesss.Where(o => o.DispatchCode == a.DispatchCode).Take(1)
                             join c in _context.DispatchesMemberActivitys on b.ProcessCode equals c.ProcessCode
                             where a.Type == inBoxType && c.UserId == userId
                             && ((string.IsNullOrEmpty(jTablePara.Number)) || (a.DocumentNumber.ToString().Contains(jTablePara.Number.ToString())))
                             && (string.IsNullOrEmpty(jTablePara.FromDate) || (a.FromDate.HasValue && a.FromDate.Value.Date >= fromDate.Value.Date))
                             && (string.IsNullOrEmpty(jTablePara.ToDate) || (a.FromDate.HasValue && a.FromDate.Value.Date <= toDate.Value.Date))
                             && (string.IsNullOrEmpty(jTablePara.CreatedTimeFrom) || (a.CreatedTime.HasValue && a.CreatedTime.Value.Date >= createdFrom.Value.Date))
                             && (string.IsNullOrEmpty(jTablePara.CreatedTimeTo) || (a.CreatedTime.HasValue && a.CreatedTime.Value.Date <= createdTo.Value.Date))
                             && ((string.IsNullOrEmpty(jTablePara.Origanization)) || (a.Origanization.ToLower().Contains(jTablePara.Origanization.ToLower())))
                             && ((string.IsNullOrEmpty(jTablePara.DocumentSymbol)) || (a.DocumentSymbol != null && a.DocumentSymbol.ToLower().Contains(jTablePara.DocumentSymbol.ToLower())))
                             && ((string.IsNullOrEmpty(jTablePara.Note)) || (a.Note.ToLower().Contains(jTablePara.Note.ToLower())))
                             && ((string.IsNullOrEmpty(jTablePara.Status)) || (a.Status.ToLower().Contains(jTablePara.Status.ToLower())))
                             && ((jTablePara.Year == null) || (a.Year.Equals(jTablePara.Year)))
                             select a).AsNoTracking().Distinct().OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).ToList();
                var count = (from a in _context.DispatchesHeaders
                             from b in _context.DispatchTrackingProcesss.Where(o => o.DispatchCode == a.DispatchCode).Take(1)
                             join c in _context.DispatchesMemberActivitys on b.ProcessCode equals c.ProcessCode
                             where a.Type == inBoxType && c.UserId == userId
                             && ((string.IsNullOrEmpty(jTablePara.Number)) || (a.DocumentNumber.ToString().Contains(jTablePara.Number.ToString())))
                             && (string.IsNullOrEmpty(jTablePara.FromDate) || (a.FromDate.HasValue && a.FromDate.Value.Date >= fromDate.Value.Date))
                             && (string.IsNullOrEmpty(jTablePara.ToDate) || (a.FromDate.HasValue && a.FromDate.Value.Date <= toDate.Value.Date))
                             && (string.IsNullOrEmpty(jTablePara.CreatedTimeFrom) || (a.CreatedTime.HasValue && a.CreatedTime.Value.Date >= createdFrom.Value.Date))
                             && (string.IsNullOrEmpty(jTablePara.CreatedTimeTo) || (a.CreatedTime.HasValue && a.CreatedTime.Value.Date <= createdTo.Value.Date))
                             && ((string.IsNullOrEmpty(jTablePara.Origanization)) || (a.Origanization.ToLower().Contains(jTablePara.Origanization.ToLower())))
                             && ((string.IsNullOrEmpty(jTablePara.DocumentSymbol)) || (a.DocumentSymbol != null && a.DocumentSymbol.ToLower().Contains(jTablePara.DocumentSymbol.ToLower())))
                             && ((string.IsNullOrEmpty(jTablePara.Note)) || (a.Note.ToLower().Contains(jTablePara.Note.ToLower())))
                             && ((string.IsNullOrEmpty(jTablePara.Status)) || (a.Status.ToLower().Contains(jTablePara.Status.ToLower())))
                             && ((jTablePara.Year == null) || (a.Year.Equals(jTablePara.Year)))
                             select a).AsNoTracking().Distinct().Count();
                var data = query.Select(x => new
                {
                    x.Id,
                    x.DocumentNumber,
                    x.DocumentSymbol,
                    x.FromDate,
                    x.Origanization,
                    x.Status,
                    x.CreatedTime,
                    x.Note
                }).Distinct().ToList();
                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "DocumentNumber", "DocumentSymbol", "FromDate", "DocumentName", "Origanization", "DeadLine", "Status", "CreatedTime", "Note");
                return Json(jdata);
            }
            else
            {
                var query = (from a in _context.DispatchesHeaders
                             from b in _context.DispatchTrackingProcesss.Where(o => o.DispatchCode == a.DispatchCode).Take(1)
                             join c in _context.DispatchesMemberActivitys on b.ProcessCode equals c.ProcessCode
                             where a.Type == inBoxType && c.UserId == userId
                             && ((jTablePara.Year == null) || (a.Year.Equals(jTablePara.Year)))
                             && c.AssigneeConfirm != EnumHelper<DocumentStatusEnum>.GetDisplayValue(DocumentStatusEnum.Done)
                             && c.AssigneeConfirm != EnumHelper<DocumentStatusEnum>.GetDisplayValue(DocumentStatusEnum.Send)
                             && c.AssigneeConfirm != EnumHelper<DocumentStatusEnum>.GetDisplayValue(DocumentStatusEnum.SendCoordinated)
                             && c.AssigneeConfirm != EnumHelper<DocumentStatusEnum>.GetDisplayValue(DocumentStatusEnum.Coordinated)
                             && (c.Role != DocumentRoleEnum.ReView.GetHashCode() || (c.AssigneeConfirm != EnumHelper<DocumentStatusEnum>.GetDisplayValue(DocumentStatusEnum.Review) && c.Role == DocumentRoleEnum.ReView.GetHashCode()))
                             select a).AsNoTracking().Distinct().OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).ToList();
                var count = (from a in _context.DispatchesHeaders
                             from b in _context.DispatchTrackingProcesss.Where(o => o.DispatchCode == a.DispatchCode).Take(1)
                             join c in _context.DispatchesMemberActivitys on b.ProcessCode equals c.ProcessCode
                             where a.Type == inBoxType && c.UserId == userId
                             && ((jTablePara.Year == null) || (a.Year.Equals(jTablePara.Year)))
                             && c.AssigneeConfirm != EnumHelper<DocumentStatusEnum>.GetDisplayValue(DocumentStatusEnum.Done)
                             && c.AssigneeConfirm != EnumHelper<DocumentStatusEnum>.GetDisplayValue(DocumentStatusEnum.Send)
                             && c.AssigneeConfirm != EnumHelper<DocumentStatusEnum>.GetDisplayValue(DocumentStatusEnum.SendCoordinated)
                             && c.AssigneeConfirm != EnumHelper<DocumentStatusEnum>.GetDisplayValue(DocumentStatusEnum.Coordinated)
                             && (c.Role != DocumentRoleEnum.ReView.GetHashCode() || (c.AssigneeConfirm != EnumHelper<DocumentStatusEnum>.GetDisplayValue(DocumentStatusEnum.Review) && c.Role == DocumentRoleEnum.ReView.GetHashCode()))
                             select a).AsNoTracking().Distinct().Count();
                var data = query.Select(x => new
                {
                    x.Id,
                    x.DocumentNumber,
                    x.DocumentSymbol,
                    x.FromDate,
                    x.Origanization,
                    x.Status,
                    x.CreatedTime,
                    x.Note
                }).Distinct().ToList();
                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "DocumentNumber", "DocumentSymbol", "FromDate", "DocumentName", "Origanization", "DeadLine", "Status", "CreatedTime", "Note");
                return Json(jdata);
            }
        }

        #region Get data

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
                    DocumentName = !string.IsNullOrEmpty(data.DocumentCode) ? _context.DispatchesCategorys.FirstOrDefault(x => x.Code == data.DocumentCode)?.Name : null,
                    DocumentNumber = data.DocumentNumber,
                    DocumentSymbol = data.DocumentSymbol,
                    Origanization = data.Origanization,
                    FromDate = data.FromDate.HasValue ? data.FromDate.Value.ToString("dd/MM/yyyy") : null,
                    PromulgateDate = data.PromulgateDate.HasValue ? data.PromulgateDate.Value.ToString("dd/MM/yyyy") : null,
                    Epitome = data.Epitome,
                    //DocumentZone = !string.IsNullOrEmpty(data.DocumentZone) ? _context.DispatchesCategorys.FirstOrDefault(x => x.Code == data.DocumentZone)?.Name : null,
                    //DocumentType = !string.IsNullOrEmpty(data.DocumentType) ? _context.DispatchesCategorys.FirstOrDefault(x => x.Code == data.DocumentType)?.Name : null,
                    SignUser = data.SignUser,
                    //Position = !string.IsNullOrEmpty(data.Position) ? _context.Roles.FirstOrDefault(x => x.Code == data.Position)?.Name : null,
                    //Confidentiality = !string.IsNullOrEmpty(data.Confidentiality) ? _context.DispatchesCategorys.FirstOrDefault(x => x.Code == data.Confidentiality)?.Name : null,
                    GetMothod = !string.IsNullOrEmpty(data.GetMothod) ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet == data.GetMothod)?.ValueSet : null,
                    CreatedUser = !string.IsNullOrEmpty(data.CreatedUserId) ? _context.Users.FirstOrDefault(x => x.Id == data.CreatedUserId)?.GivenName : null,
                    //UnitEditor = !string.IsNullOrEmpty(data.UnitEditor) ? _context.AdGroupUsers.FirstOrDefault(x => x.GroupUserCode == data.UnitEditor)?.Title : null,
                    //IsReply = data.IsReply,
                    //IsProcess = data.IsProcess,
                    //ReplyStatus = data.ReplyStatus,
                    Note = data.Note,
                    Status = data.Status,
                };


                //tracking User
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
                    IsShowDelete = false
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
                    IsShowComment = x.Assigner.Equals(userId) ? true : false,
                    IsShowDelete = false,
                    IsShowAction = x.UserId.Equals(userId) ? true : false,
                    Status = (x.UserId.Equals(userId) && x.Role == 2 && x.AssigneeConfirm == EnumHelper<DocumentStatusEnum>.GetDisplayValue(DocumentStatusEnum.Review)) ? null : x.AssigneeConfirm,
                    Comment = x.Comment
                }).OrderBy(x => x.Id).AsNoTracking();
                model.Detail.ListMember.AddRange(listMember);

                //get role
                var getRole = listDispatchesMember.Where(x => x.ProcessCode == tracking.ProcessCode && x.UserId == userId).MaxBy(x => x.CreatedTime);
                model.Role = getRole.Role;

                //get DeadLine for role
                if (model.Role == DocumentRoleEnum.Main.GetHashCode())
                {
                    //get dead line
                    var getUserAssigner = listDispatchesMember.FirstOrDefault(x => x.Assigner == userId && x.Role == DocumentRoleEnum.Main.GetHashCode());
                    model.Detail.DeadLine = getUserAssigner != null && getUserAssigner.DeadLine != null ? getUserAssigner.DeadLine.Value.ToString("dd/MM/yyyy") : null;

                    var assigner = listDispatchesMember.FirstOrDefault(x => x.ProcessCode == tracking.ProcessCode && x.Assigner == getRole.Assigner && x.Role == DocumentRoleEnum.Main.GetHashCode());
                    model.Detail.DeadLineSendUser = assigner?.DeadLine;
                    var todayDate = DateTime.Now;
                    model.Days = model.Detail.DeadLineSendUser != null ? (double?)(model.Detail.DeadLineSendUser.Value.Date - todayDate.Date).TotalDays + 1 : null;
                    model.RoleStatus = getRole.AssigneeConfirm.Equals(EnumHelper<DocumentStatusEnum>.GetDisplayValue(DocumentStatusEnum.Send)) ? true : false;
                }
                else if (model.Role == DocumentRoleEnum.Support.GetHashCode())
                {
                    var checkCompleteTask = listDispatchesMember.FirstOrDefault(x => x.AssigneeConfirm != (EnumHelper<DocumentStatusEnum>.GetDisplayValue(DocumentStatusEnum.SendCoordinated)) && x.AssigneeConfirm != (EnumHelper<DocumentStatusEnum>.GetDisplayValue(DocumentStatusEnum.Coordinated)) && x.Role == DocumentRoleEnum.Support.GetHashCode());
                    model.RoleStatus = checkCompleteTask != null ? false : true;
                }
                model.DocumentStatus = data.Status != null && data.Status.Equals(EnumHelper<DocumentStatusEnum>.GetDisplayValue(DocumentStatusEnum.Done)) ? true : false;
                msg.Object = model;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("DIDP_MSG_ERROR")) ;
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
                msg.Title = String.Format(CommonUtil.ResourceValue("DIDP_MSG_UPLOADS_ERROR_FILE")) + upload.Title;
            }
            else
            {
                var model = new IncommingDispatchesFile
                {
                    Source = "/uploads/Files/" + upload.Object.ToString(),
                    User = User?.GivenName,
                };
                msg.Object = model;
                msg.Title = String.Format(CommonUtil.ResourceValue("DIDP_MSG_UPLOADS_SUCCESSFULLY"));
            }
            return Json(msg);
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
        [HttpPost]
        public object GetListUser()
        {
            var listMember = _context.Users.Where(x => x.Active == true).Select(x => new { x.Id, x.GivenName }).AsNoTracking();
            return listMember;
        }

        [HttpPost]
        public object GetListUserInGroup(List<string> listGroup)
        {
            var list = listGroup[0] != null ? listGroup[0].Split(',') : new string[0];
            var userPermision = (from a in _context.DispatchesUsers
                                 join b in _context.Users.Where(y => y.Active == true) on a.UserId equals b.Id
                                 where list.Any(z => z == a.GroupUserCode)
                                 select new
                                 {
                                     a.UserId,
                                     Name = b != null ? b.GivenName : null,
                                     a.GroupUserCode,
                                     IsPermision = true,
                                     IsMain = true,
                                 }).AsNoTracking();
            if (userPermision.Any())
            {
                var dateNow = DateTime.Now.Date;
                var checkAuthority = (from a in _context.AdAuthorings
                                      join b in _context.Users.Where(y => y.Active == true) on a.ToUser equals b.Id
                                      where a.FromUser == userPermision.First().UserId && a.FromDate <= dateNow && a.ToDate >= dateNow && a.Confirm == "Y"
                                      select new
                                      {
                                          UserId = a.ToUser,
                                          Name = b != null ? b.GivenName : null,
                                          GroupUserCode = _context.AdUserInGroups.Join(_context.Users.Where(y => y.Id == a.ToUser), post => post.UserId, meta => meta.Id, (post, meta) => post.GroupUserCode).AsNoTracking().FirstOrDefault(),
                                          IsPermision = true,
                                          IsMain = false,
                                      }).AsNoTracking();
                if (checkAuthority != null)
                {
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
                                      }).AsNoTracking();

                    var listUser = userPermision.Concat(checkAuthority.Concat(listMember));
                    return listUser;
                }
                else
                {
                    var listMember = (from a in _context.AdUserInGroups
                                      join b in _context.Users on a.UserId equals b.Id
                                      where list.Any(y => y == a.GroupUserCode) && a.UserId != userPermision.First().UserId
                                      && b.Active == true
                                      select new
                                      {
                                          a.UserId,
                                          Name = b.GivenName,
                                          a.GroupUserCode,
                                          IsPermision = false,
                                          IsMain = false,
                                      }).AsNoTracking();
                    var listUser = userPermision.Concat(listMember);
                    return listUser;
                }
            }
            else
            {
                var listMember = (from a in _context.AdUserInGroups
                                  join b in _context.Users on a.UserId equals b.Id
                                  where list.Any(y => y == a.GroupUserCode)
                                  && b.Active == true
                                  select new
                                  {
                                      a.UserId,
                                      Name = b.GivenName,
                                      a.GroupUserCode,
                                      IsPermision = false,
                                  }).AsNoTracking();
                return listMember;
            }
        }

        [HttpPost]
        public object GetUserAuthority(string userId)
        {
            var dateNow = DateTime.Now.Date;
            var checkAuthority = _context.AdAuthorings.Where(x => x.FromUser == userId && x.FromDate <= dateNow && x.ToDate >= dateNow && x.Confirm == "Y").Select(x => new
            {
                UserId = x.ToUser,
                Name = _context.Users.FirstOrDefault(y => y.Id == x.ToUser).GivenName ?? null,
            });
            return checkAuthority.Any() ? checkAuthority.First() : null;
        }

        [HttpPost]
        public object GetYear()
        {
            var query = _context.DispatchesHeaders.Where(x => x.Type == EnumHelper<DocumentTypeEnum>.GetDisplayValue(DocumentTypeEnum.IBT)).Select(x => x.Year).Distinct().AsParallel();
            return query;
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
        public List<TreeViewResource> GetAllGroupUser()
        {
            var data = _context.AdGroupUsers.Where(x => x.IsEnabled == true).OrderByDescending(x => x.GroupUserId).AsNoTracking();
            var dataOrder = GetSubTreeData(data.ToList(), null, new List<TreeViewResource>(), 0);
            return dataOrder;
        }

        [HttpPost]
        public bool CheckIsSecretary()
        {
            var secretary = false;
            var session = HttpContext.GetSessionUser();

            var query = (from a in _context.UserRoles
                         join b in _context.Roles on a.RoleId equals b.Id
                         where a.UserId == session.UserId && b.Code != EnumHelper<RoleEnum>.GetDisplayValue(RoleEnum.CV)
                         select b).AsNoTracking().FirstOrDefault();
            if (query != null)
            {
                secretary = true;
            }
            return secretary;
        }
        [NonAction]
        private List<TreeViewResource> GetSubTreeData(List<AdGroupUser> data, string parentid, List<TreeViewResource> lstCategories, int tab)
        {
            //tab += "- ";
            var contents = String.IsNullOrEmpty(parentid)
                ? data.Where(x => x.ParentCode == null).OrderByDescending(x => x.GroupUserId).AsParallel()
                : data.Where(x => x.ParentCode == parentid).OrderByDescending(x => x.GroupUserCode).AsParallel();
            var count = contents.Count();
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
        #endregion

        #region Action
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

                //mobile
                //var getDispatchessMobile = _context.MobileConfirms.Where(x => x.Assignee == userId && x.DispatchCode == dispatches.DispatchCode && x.Status == MobileStatus.Default.GetHashCode());
                //if (getDispatchessMobile.Any())
                //{
                //    foreach (var item in getDispatchessMobile)
                //    {
                //        item.Status = MobileStatus.ReViewWeb.GetHashCode();
                //    }
                //    _context.MobileConfirms.UpdateRange(getDispatchessMobile);
                //    _context.SaveChanges();
                //}

                //web
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
                msg.Title = String.Format(CommonUtil.ResourceValue("DIDP_MSG_VIEWED_TEXT"));
            }
            catch (Exception ex)
            {
                msg.Title = String.Format(CommonUtil.ResourceValue("DIDP_MSG_VIEW_ERROR"));
                msg.Error = true;
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Done([FromBody]IncommingDispatchesModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var userId = ESEIM.AppContext.UserId;
                var dispatches = _context.DispatchesHeaders.FirstOrDefault(x => x.Id == obj.Header.Id);
                var document = _context.DispatchTrackingProcesss.FirstOrDefault(x => x.DispatchCode == dispatches.DispatchCode);
                var memberRole = _context.DispatchesMemberActivitys.Where(x => x.ProcessCode == document.ProcessCode && x.UserId == userId).MaxBy(x => x.CreatedTime);
                if (memberRole.Role == DocumentRoleEnum.Main.GetHashCode())
                {
                    memberRole.AssigneeConfirm = EnumHelper<DocumentStatusEnum>.GetDisplayValue(DocumentStatusEnum.Done);
                    memberRole.ConfirmTime = DateTime.Now;
                    _context.DispatchesMemberActivitys.Update(memberRole);

                    var trackingNew = new DispatchTrackingProcess
                    {
                        DispatchCode = dispatches.DispatchCode,
                        ProcessCode = document.ProcessCode,
                        Action = EnumHelper<DocumentStatusEnum>.GetDisplayValue(DocumentStatusEnum.Done),
                        UserId = userId,
                        CreatedTime = DateTime.Now,
                        Reason = document.Reason,
                        DeadLine = document.DeadLine,
                    };
                    _context.DispatchTrackingProcesss.Add(trackingNew);

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
                                ProcessCode = document.ProcessCode,
                                Comment = comment.Comment,
                                UserId = userId,
                                CreatedTime = comment.CreatedTime,
                            };
                            _context.DispatchesCommentACTs.Add(dispatchesComment);
                        }
                    }

                    dispatches.Status = EnumHelper<DocumentStatusEnum>.GetDisplayValue(DocumentStatusEnum.Done);
                    _context.DispatchesHeaders.Update(dispatches);
                    _context.SaveChanges();
                    msg.Title = String.Format(CommonUtil.ResourceValue("DIDP_MSG_TEXT_FINISH"));
                }
                else
                {
                    msg.Title = String.Format(CommonUtil.ResourceValue("DIDP_MSG_DON'T_COMPLETE_TEXT"));
                    msg.Error = true;
                }
            }
            catch (Exception ex)
            {
                msg.Title = String.Format(CommonUtil.ResourceValue("DIDP_MSG_ERROR_COMPLETE_TEXT"));
                msg.Error = true;
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult Send([FromBody]IncommingDispatchesModel obj)
        {
            var msg = new JMessage { Title = "", Error = false };
            try
            {
                var userId = ESEIM.AppContext.UserId;
                var dispatchess = _context.DispatchesHeaders.FirstOrDefault(x => x.Id == obj.Header.Id);
                var tracking = _context.DispatchTrackingProcesss.FirstOrDefault(x => x.DispatchCode == dispatchess.DispatchCode);
                var memberRole = _context.DispatchesMemberActivitys.Where(x => x.ProcessCode == tracking.ProcessCode && x.UserId == userId).MaxBy(x => x.CreatedTime);
                if (memberRole.Role == DocumentRoleEnum.Main.GetHashCode())
                {
                    //send user
                    var listMemberNew = obj.Detail.ListMember.Where(x => x.Id < 0);
                    if (listMemberNew.Any())
                    {
                        //check send deadline to user main
                        if (!string.IsNullOrEmpty(obj.Detail.DeadLine))
                        {
                            var memberMainSend = listMemberNew.FirstOrDefault(x => x.Role == DocumentRoleEnum.Main.GetHashCode());
                            if (memberMainSend != null)
                            {
                                var checkExist = _context.DispatchesMemberActivitys.FirstOrDefault(x => x.ProcessCode == tracking.ProcessCode && x.UserId == memberMainSend.UserId && x.Assigner != userId && x.Role == DocumentRoleEnum.Main.GetHashCode());
                                if (checkExist != null)
                                {
                                    msg.Error = true;
                                    msg.Title = String.Format(CommonUtil.ResourceValue("DIDP_MSG_HANDLING_ERROR"));
                                    return Json(msg);
                                }
                            }
                        }
                        foreach (var member in listMemberNew)
                        {
                            if (member.Role == DocumentRoleEnum.Main.GetHashCode())
                            {
                                var activity = new DispatchesMemberActivity
                                {
                                    Assigner = member.Assigner,
                                    ProcessCode = tracking.ProcessCode,
                                    UserId = member.UserId,
                                    Role = member.Role,
                                    Comment = member.Comment,
                                    CreatedTime = member.CreatedTime,
                                    DeadLine = !string.IsNullOrEmpty(obj.Detail.DeadLine) ? DateTime.ParseExact(obj.Detail.DeadLine, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null,
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
                                //    DeadLine = !string.IsNullOrEmpty(obj.Detail.DeadLine) ? DateTime.ParseExact(obj.Detail.DeadLine, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null,
                                //};
                                //_context.MobileConfirms.Add(mobibleConfirm);
                            }
                            else
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
                                //Insert mobile(send user)
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

                        ////send notification to user
                        //var listToken = _context.MobileFCMTokens.Where(x => listMemberNew.Any(y => y.UserId == x.UserId)).Select(x => x.Token).AsNoTracking().ToList();
                        //var sendNotification = _notification.SendNotificationToUser("Văn bản mới", "Thông báo mới", listToken, new { message = "Có văn bản mới" });
                    }

                    var memberMain = obj.Detail.ListMember.FirstOrDefault(x => x.Id < 0 && x.Role == DocumentRoleEnum.Main.GetHashCode());
                    //update status
                    memberRole.AssigneeConfirm = memberMain != null ? EnumHelper<DocumentStatusEnum>.GetDisplayValue(DocumentStatusEnum.Send) : EnumHelper<DocumentStatusEnum>.GetDisplayValue(DocumentStatusEnum.AddSend);
                    memberRole.ConfirmTime = DateTime.Now;
                    _context.DispatchesMemberActivitys.Update(memberRole);
                    var listMemberStatus = obj.Detail.ListMember.Where(x => x.Id > 0 && x.Status != null && x.Role == DocumentRoleEnum.Support.GetHashCode() && x.UserId == userId);
                    if (listMemberStatus.Any())
                    {
                        foreach (var member in listMemberStatus)
                        {
                            var data = _context.DispatchesMemberActivitys.FirstOrDefault(x => x.Id == member.Id);
                            if (data != null && !data.AssigneeConfirm.Equals(member.Status))
                            {
                                data.AssigneeConfirm = member.Status;
                                _context.DispatchesMemberActivitys.Update(data);
                                var trackingNewMemberSupport = new DispatchTrackingProcess
                                {
                                    DispatchCode = dispatchess.DispatchCode,
                                    ProcessCode = tracking.ProcessCode,
                                    Action = member.Status,
                                    CreatedTime = DateTime.Now,
                                    DeadLine = !string.IsNullOrEmpty(obj.Detail.DeadLine) ? DateTime.ParseExact(obj.Detail.DeadLine, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null,
                                    UserId = userId,
                                };
                                _context.DispatchTrackingProcesss.Add(trackingNewMemberSupport);
                            }
                        }
                    }


                    //update tracking
                    var trackingNew = new DispatchTrackingProcess
                    {
                        DispatchCode = dispatchess.DispatchCode,
                        ProcessCode = tracking.ProcessCode,
                        Action = memberMain != null ? EnumHelper<DocumentStatusEnum>.GetDisplayValue(DocumentStatusEnum.Send) : EnumHelper<DocumentStatusEnum>.GetDisplayValue(DocumentStatusEnum.AddSend),
                        CreatedTime = DateTime.Now,
                        UserId = userId,
                        //DeadLine = !string.IsNullOrEmpty(obj.Detail.DeadLine) ? DateTime.ParseExact(obj.Detail.DeadLine, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null,
                    };
                    _context.DispatchTrackingProcesss.Add(trackingNew);

                    //insert comment
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
                                UserId = userId,
                                CreatedTime = comment.CreatedTime,
                            };
                            _context.DispatchesCommentACTs.Add(dispatchesComment);
                        }
                    }
                }
                else
                {
                    //send user
                    var listMemberNew = obj.Detail.ListMember.Where(x => x.Id < 0);
                    if (listMemberNew.Any())
                    {
                        foreach (var item in listMemberNew)
                        {
                            var activity = new DispatchesMemberActivity
                            {
                                Assigner = item.Assigner,
                                ProcessCode = tracking.ProcessCode,
                                UserId = item.UserId,
                                Role = item.Role,
                                Comment = item.Comment,
                                CreatedTime = item.CreatedTime,
                            };
                            _context.DispatchesMemberActivitys.Add(activity);
                            //Insert mobile (send user)
                            //var mobibleConfirm = new MobileConfirm
                            //{
                            //    DispatchCode = dispatchess.DispatchCode,
                            //    Assigner = item.Assigner,
                            //    Assignee = item.UserId,
                            //    Comment = item.Comment,
                            //    CreatedTime = DateTime.Now,
                            //    Role = item.Role,
                            //    Status = 0,
                            //    Type = 0,
                            //};
                            //_context.MobileConfirms.Add(mobibleConfirm);
                        }

                        ////send notification to user
                        //var listToken = _context.MobileFCMTokens.Where(x => listMemberNew.Any(y => y.UserId == x.UserId)).Select(x => x.Token).AsNoTracking().ToList();
                        //var sendNotification = _notification.SendNotificationToUser("Văn bản mới", "Thông báo mới", listToken, new { message = "Có văn bản mới" });
                    }

                    //update status
                    var memberSupport = obj.Detail.ListMember.FirstOrDefault(x => x.Id < 0 && x.Role == DocumentRoleEnum.Support.GetHashCode());
                    if (memberSupport != null)
                    {
                        var listMemberAssigner = _context.DispatchesMemberActivitys.Where(x => x.ProcessCode == tracking.ProcessCode && x.UserId == userId);
                        foreach (var item in listMemberAssigner)
                        {
                            item.AssigneeConfirm = EnumHelper<DocumentStatusEnum>.GetDisplayValue(DocumentStatusEnum.SendCoordinated);
                        }
                        _context.DispatchesMemberActivitys.UpdateRange(listMemberAssigner);
                    }
                    var listMemberStatus = obj.Detail.ListMember.Where(x => x.Id > 0 && x.Status != null && x.Role == DocumentRoleEnum.Support.GetHashCode() && x.UserId == userId);
                    if (listMemberStatus.Any())
                    {
                        foreach (var member in listMemberStatus)
                        {
                            var data = _context.DispatchesMemberActivitys.FirstOrDefault(x => x.Id == member.Id);
                            if (data != null && !data.AssigneeConfirm.Equals(member.Status))
                            {
                                data.AssigneeConfirm = member.Status;
                                _context.DispatchesMemberActivitys.Update(data);
                                var trackingNewMemberSupport = new DispatchTrackingProcess
                                {
                                    DispatchCode = dispatchess.DispatchCode,
                                    ProcessCode = tracking.ProcessCode,
                                    Action = member.Status,
                                    CreatedTime = DateTime.Now,
                                    DeadLine = !string.IsNullOrEmpty(obj.Detail.DeadLine) ? DateTime.ParseExact(obj.Detail.DeadLine, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null,
                                    UserId = userId,
                                };
                                _context.DispatchTrackingProcesss.Add(trackingNewMemberSupport);
                            }
                        }
                    }

                    //update tracking
                    var trackingNew = new DispatchTrackingProcess
                    {
                        DispatchCode = dispatchess.DispatchCode,
                        ProcessCode = tracking.ProcessCode,
                        Action = memberSupport != null ? EnumHelper<DocumentStatusEnum>.GetDisplayValue(DocumentStatusEnum.SendCoordinated) : EnumHelper<DocumentStatusEnum>.GetDisplayValue(DocumentStatusEnum.AddSend),
                        CreatedTime = DateTime.Now,
                        UserId = userId,
                    };
                    _context.DispatchTrackingProcesss.Add(trackingNew);

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
                                UserId = userId,
                                CreatedTime = comment.CreatedTime,
                            };
                            _context.DispatchesCommentACTs.Add(dispatchesComment);
                        }
                    }
                }
                _context.SaveChanges();
                msg.Title = String.Format(CommonUtil.ResourceValue("DIDP_MSG_FILE_DELIVERED"));
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("DIDP_MSG_TRANSFER_ERROR_RECORDS"));
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Update([FromBody]IncommingDispatchesModel obj)
        {
            var msg = new JMessage { Title = "", Error = false };
            try
            {
                var userId = ESEIM.AppContext.UserId;
                var dispatchess = _context.DispatchesHeaders.FirstOrDefault(x => x.Id == obj.Header.Id);
                var tracking = _context.DispatchTrackingProcesss.FirstOrDefault(x => x.DispatchCode == dispatchess.DispatchCode && x.UserId == userId);
                if (tracking != null)
                {
                    var listMember = _context.DispatchesMemberActivitys.Where(x => x.ProcessCode == tracking.ProcessCode);
                    var memberRole = listMember.Where(x => x.ProcessCode == tracking.ProcessCode && x.UserId == userId).MaxBy(x => x.CreatedTime);
                    if (memberRole.Role == DocumentRoleEnum.Main.GetHashCode())
                    {
                        //check send deadline to user main
                        if (!string.IsNullOrEmpty(obj.Detail.DeadLine))
                        {
                            var memberMainSend = listMember.Where(x => x.Assigner == userId && x.Role == DocumentRoleEnum.Main.GetHashCode()).MaxBy(x => x.CreatedTime);
                            if (memberMainSend != null)
                            {
                                var checkExist = _context.DispatchesMemberActivitys.FirstOrDefault(x => x.ProcessCode == tracking.ProcessCode && x.UserId == memberMainSend.UserId && x.Assigner != userId && x.Role == DocumentRoleEnum.Main.GetHashCode());
                                if (checkExist != null)
                                {
                                    msg.Error = true;
                                    msg.Title = String.Format(CommonUtil.ResourceValue("DIDP_MSG_HANDLING_ERROR"));
                                    return Json(msg);
                                }
                                memberMainSend.DeadLine = !string.IsNullOrEmpty(obj.Detail.DeadLine) ? DateTime.ParseExact(obj.Detail.DeadLine, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                            }
                        }


                        //update member status
                        var listMemberStatus = obj.Detail.ListMember.Where(x => x.Id > 0 && x.Status != null && x.Role == DocumentRoleEnum.Support.GetHashCode() && x.UserId == userId);
                        if (listMemberStatus.Any())
                        {
                            foreach (var member in listMemberStatus)
                            {
                                var data = _context.DispatchesMemberActivitys.FirstOrDefault(x => x.Id == member.Id);
                                if (data != null && !data.AssigneeConfirm.Equals(member.Status))
                                {
                                    data.AssigneeConfirm = member.Status;
                                    _context.DispatchesMemberActivitys.Update(data);
                                    var trackingNew = new DispatchTrackingProcess
                                    {
                                        DispatchCode = dispatchess.DispatchCode,
                                        ProcessCode = tracking.ProcessCode,
                                        Action = member.Status,
                                        CreatedTime = DateTime.Now,
                                        DeadLine = !string.IsNullOrEmpty(obj.Detail.DeadLine) ? DateTime.ParseExact(obj.Detail.DeadLine, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null,
                                        UserId = userId,
                                    };
                                    _context.DispatchTrackingProcesss.Add(trackingNew);
                                }
                            }
                        }

                        //update member comment
                        var listMemberComment = obj.Detail.ListMember.Where(x => x.Id > 0 && x.Assigner == userId);
                        if (listMemberComment.Any())
                        {
                            foreach (var member in listMemberComment)
                            {
                                var data = _context.DispatchesMemberActivitys.FirstOrDefault(x => x.Id == member.Id);
                                if (data != null)
                                {
                                    data.Comment = member.Comment;
                                    _context.DispatchesMemberActivitys.Update(data);
                                }
                            }
                            var trackingNew = new DispatchTrackingProcess
                            {
                                DispatchCode = dispatchess.DispatchCode,
                                ProcessCode = tracking.ProcessCode,
                                Action = EnumHelper<DocumentStatusEnum>.GetDisplayValue(DocumentStatusEnum.Updated),
                                CreatedTime = DateTime.Now,
                                DeadLine = !string.IsNullOrEmpty(obj.Detail.DeadLine) ? DateTime.ParseExact(obj.Detail.DeadLine, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null,
                                UserId = userId,
                            };
                            _context.DispatchTrackingProcesss.Add(trackingNew);
                        }

                        //update comment
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

                    }
                    else
                    {
                        //update member status
                        var listMemberStatus = obj.Detail.ListMember.Where(x => x.Id > 0 && x.Status != null && x.Role == DocumentRoleEnum.Support.GetHashCode() && x.UserId == userId);
                        if (listMemberStatus.Any())
                        {
                            foreach (var member in listMemberStatus)
                            {
                                var data = _context.DispatchesMemberActivitys.FirstOrDefault(x => x.Id == member.Id);
                                if (data != null && !data.AssigneeConfirm.Equals(member.Status))
                                {
                                    data.AssigneeConfirm = member.Status;
                                    _context.DispatchesMemberActivitys.Update(data);
                                    var trackingNew = new DispatchTrackingProcess
                                    {
                                        DispatchCode = dispatchess.DispatchCode,
                                        ProcessCode = tracking.ProcessCode,
                                        Action = member.Status,
                                        CreatedTime = DateTime.Now,
                                        DeadLine = !string.IsNullOrEmpty(obj.Detail.DeadLine) ? DateTime.ParseExact(obj.Detail.DeadLine, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null,
                                        UserId = userId,
                                    };
                                    _context.DispatchTrackingProcesss.Add(trackingNew);
                                }
                            }
                        }

                        //update member comment
                        var listMemberComment = obj.Detail.ListMember.Where(x => x.Id > 0 && x.Assigner == userId);
                        if (listMemberComment.Any())
                        {
                            foreach (var member in listMemberComment)
                            {
                                var data = _context.DispatchesMemberActivitys.FirstOrDefault(x => x.Id == member.Id);
                                if (data != null)
                                {
                                    data.Comment = member.Comment;
                                    _context.DispatchesMemberActivitys.Update(data);
                                }
                            }
                            var trackingNew = new DispatchTrackingProcess
                            {
                                DispatchCode = dispatchess.DispatchCode,
                                ProcessCode = tracking.ProcessCode,
                                Action = EnumHelper<DocumentStatusEnum>.GetDisplayValue(DocumentStatusEnum.Updated),
                                CreatedTime = DateTime.Now,
                                DeadLine = !string.IsNullOrEmpty(obj.Detail.DeadLine) ? DateTime.ParseExact(obj.Detail.DeadLine, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null,
                                UserId = userId,
                            };
                            _context.DispatchTrackingProcesss.Add(trackingNew);
                        }

                        //update comment
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
                    }
                    _context.SaveChanges();
                    msg.Title = String.Format(CommonUtil.ResourceValue("DIDP_MSG_UPDATE_DOCUMENT_SUCCESS"));//"Cập nhật văn bản thành công!";
                }
            }
            catch
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("DIDP_MSG_UPDATE_DOCUMENT_ERROR"));//"Cập nhập văn bản lỗi!";
            }
            return Json(msg);
        }
        #endregion

        #region export
        [HttpGet]
        public ActionResult Export(string from, string to)
        {
            //string from="", to="";
            DateTime? fromDate = !string.IsNullOrEmpty(from) ? DateTime.ParseExact(from, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            DateTime? toDate = !string.IsNullOrEmpty(to) ? DateTime.ParseExact(to, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var isFromDate = (fromDate != null ? true : false);
            var isToDate = (toDate != null ? true : false);


            var userId = ESEIM.AppContext.UserId;
            var inBoxType = EnumHelper<DocumentTypeEnum>.GetDisplayValue(DocumentTypeEnum.InBoxType);
            var now = DateTime.Now;
            var query = (from a in _context.DispatchesHeaders
                         from b in _context.DispatchTrackingProcesss.Where(o => o.DispatchCode == a.DispatchCode).Take(1)
                         join c in _context.DispatchesMemberActivitys on b.ProcessCode equals c.ProcessCode
                         where a.Type == inBoxType && c.UserId == userId
                         && (
                            (isFromDate && isToDate && fromDate.Value.Date <= a.CreatedTime.Value.Date && a.CreatedTime.Value.Date <= toDate.Value.Date) ||
                            (isFromDate && !isToDate && fromDate.Value.Date <= a.CreatedTime.Value.Date) ||
                            (!isFromDate && isToDate && a.CreatedTime.Value.Date <= toDate.Value.Date) ||
                            (!isFromDate && !isToDate && a.CreatedTime.Value.Date == now.Date)
                         )
                         select new ExportModel1
                         {
                             Origanization = a.Origanization,
                             DocumentSymbol = a.DocumentSymbol,
                             PromulgateDate = a.PromulgateDate.Value != null ? a.PromulgateDate.Value.ToString("dd/MM/yyyy") : "",
                             Note = a.Note,
                             NgayDuyet = "",
                             PheDuyetCuaQTGD = "",
                             DocumentNumber = a.DocumentNumber,
                             Status = "",
                             Save = ""

                         }).Distinct();
            var listExport = query.OrderBy(x => x.DocumentNumber).Select(x => new
            {
                x.Origanization,
                x.DocumentSymbol,
                x.PromulgateDate,
                x.Note,
                x.NgayDuyet,
                x.PheDuyetCuaQTGD,
                x.DocumentNumber,
                x.Status,
                x.Save
            }).Distinct().AsNoTracking().ToList();

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
            sheetRequest.Range["D1"].ColumnWidth = 72;
            sheetRequest.Range["E1"].ColumnWidth = 24;
            sheetRequest.Range["F1"].ColumnWidth = 24;
            sheetRequest.Range["G1"].ColumnWidth = 24;
            sheetRequest.Range["H1"].ColumnWidth = 24;
            sheetRequest.Range["I1"].ColumnWidth = 24;

            sheetRequest.Range["A1:I1"].Merge(true);

            sheetRequest.Range["A1"].Text = "Sổ công văn đến";
            sheetRequest.Range["A1"].CellStyle.Font.FontName = "Calibri";
            sheetRequest.Range["A1"].CellStyle.Font.Bold = true;
            sheetRequest.Range["A1"].CellStyle.Font.Size = 24;
            sheetRequest.Range["A1"].CellStyle.Font.RGBColor = Color.FromArgb(0, 0, 176, 240);
            sheetRequest.Range["A1"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.ImportData(listExport, 2, 1, true);

            sheetRequest["A2"].Text = "Cơ quan ban hành";
            sheetRequest["B2"].Text = "Số/ký hiệu";
            sheetRequest["C2"].Text = "Ngày ban hành";
            sheetRequest["D2"].Text = "Trích yếu";
            sheetRequest["E2"].Text = "Ngày duyệt";
            sheetRequest["F2"].Text = "Phê duyệt của Q.TGĐ";
            sheetRequest["G2"].Text = "Số đến";
            sheetRequest["H2"].Text = "Tình trạng văn bản";
            sheetRequest["I2"].Text = "Lưu";


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
            sheetRequest["A2:I2"].CellStyle = tableHeader;
            sheetRequest.Range["A2:I2"].RowHeight = 20;
            //sheetRequest.UsedRange.AutofitColumns();

            string ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            var fileName = "Ngày " + now.ToString("dd/MM/yyyy") + ".xls";
            MemoryStream ms = new MemoryStream();
            workbook.SaveAs(ms);
            workbook.Close();
            excelEngine.Dispose();
            ms.Position = 0;
            return File(ms, ContentType, fileName);
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
        #endregion

    }

    public class IncommingDispatchesJtableModel : JTableModel
    {
        public string Number { get; set; }
        public string FromDate { get; set; }
        public string ToDate { get; set; }
        public string Origanization { get; set; }
        public string DocumentSymbol { get; set; }
        public string CreatedTimeFrom { get; set; }
        public string CreatedTimeTo { get; set; }
        public string Note { get; set; }
        public string Status { get; set; }
        public int? Year { get; set; }
    }
    public class IncommingDispatchesStatus
    {
        public int Id { get; set; }
        public string Status { get; set; }
    }
    public class ExportFlowModel
    {
        public string AssignerName { get; set; }
        public string Name { get; set; }
        public string Comment { get; set; }
        public string CreatedTime { get; set; }
        public string Role { get; set; }
        public string Status { get; set; }
    }
    public class ExportModel1 : ExportModel
    {
        public string Origanization { get; set; }
        public string DocumentSymbol { get; set; }
        public string PromulgateDate { get; set; }
        public string Note { get; set; }
        public string NgayDuyet { get; set; }
        public string PheDuyetCuaQTGD { get; set; }
        public int DocumentNumber { get; set; }
        public string Status { get; set; }
        public string Save { get; set; }
    }
}