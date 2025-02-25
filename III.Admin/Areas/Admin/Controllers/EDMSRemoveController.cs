﻿using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Options;
using III.Admin.Controllers;
using System.Collections.Generic;
using System.Globalization;

namespace ESEIM.Controllers
{
    [Area("Admin")]
    public class EDMSRemoveController : BaseController
    {

        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly EIMDBContext _context;
        private readonly ILogger _logger;
        private readonly IActionLogService _actionLog;
        private readonly AppSettings _appSettings;
        private readonly IUploadService _upload;

        public class JTableModelEDMSCmRemove : JTableModel
        {
            public string Name { get; set; }
            public string Business { get; set; }
            public string PersonProcessor { get; set; }
            public string Status { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
        }
        public class JTableModelEDMSBoxRemove : JTableModel
        {
            public string Text { get; set; }
            public string PersonProcessor { get; set; }
            public string Status { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
        }
        public class JTableModelEDMSBoxExpired : JTableModel
        {
            public string Text { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
        }

        public EDMSRemoveController(EIMDBContext context, IUploadService upload, ILogger<EDMSRemoveController> logger, IOptions<AppSettings> appSettings, IHostingEnvironment hostingEnvironment, IActionLogService actionLog)
        {

            _context = context;
            _logger = logger;
            _hostingEnvironment = hostingEnvironment;
            _actionLog = actionLog;
            _appSettings = appSettings.Value;
            _upload = upload;
        }

        public IActionResult Index()
        {
            return View("Index");
        }

        #region Tab lệnh hủy hồ sơ
        [HttpPost]
        public JsonResult JTableCmRemove([FromBody]JTableModelEDMSCmRemove jTablePara)
        {
            try
            {
                int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;

                var query = FuncJTableCmRemove(jTablePara.Name, jTablePara.Business, jTablePara.PersonProcessor, jTablePara.Status, jTablePara.FromDate, jTablePara.ToDate);

                var count = query.Count();
                var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "Code", "Name", "FromDate", "ToDate", "Business", "PersonProcessor", "PersonProcessorName", "Note", "Picture", "Status", "StatusName");
                return Json(jdata);
            }
            catch (Exception ex)
            {
                var data = new List<EDMSCmRemoveModel>();
                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, 0, "Id", "Code", "Name", "FromDate", "ToDate", "Business", "PersonProcessor", "PersonProcessorName", "Note", "Picture", "Status", "StatusName");
                return Json(jdata);
            }
        }

        [NonAction]
        public IQueryable<EDMSCmRemoveModel> FuncJTableCmRemove(string Name, string Business, string PersonProcessor, string Status, string FromDate, string ToDate)
        {
            var fromDate = !string.IsNullOrEmpty(FromDate) ? DateTime.ParseExact(FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(ToDate) ? DateTime.ParseExact(ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            var query = (from a in _context.EDMSRemoves.Where(x => x.IsDeleted != true).AsNoTracking()
                         join b in _context.CommonSettings.Where(x => x.IsDeleted != true && x.Group == "REMOVE_STATUS") on a.Status equals b.CodeSet
                         let listPersonProcessor = a.PersonProcessor.Split(";", StringSplitOptions.None)
                         where
                         (string.IsNullOrEmpty(Name) || (!string.IsNullOrEmpty(a.Name) && a.Name.ToLower().Contains(Name.ToLower())))
                         && (string.IsNullOrEmpty(Business) || (!string.IsNullOrEmpty(a.Business) && a.Business.ToLower().Contains(Business.ToLower())))
                         && (string.IsNullOrEmpty(PersonProcessor) || listPersonProcessor.Any(x => x == PersonProcessor))
                         && (string.IsNullOrEmpty(Status) || (a.Status == Status))
                         && (string.IsNullOrEmpty(ToDate) || (a.FromDate <= toDate))
                         && (string.IsNullOrEmpty(FromDate) || (a.ToDate >= fromDate))
                         select new EDMSCmRemoveModel
                         {
                             Id = a.Id,
                             Code = a.Code,
                             Name = a.Name,
                             FromDate = a.FromDate.HasValue ? a.FromDate.Value.ToString("dd/MM/yyyy") : "",
                             ToDate = a.ToDate.HasValue ? a.ToDate.Value.ToString("dd/MM/yyyy") : "",
                             Business = a.Business,
                             PersonProcessor = a.PersonProcessor,
                             Note = a.Note,
                             Picture = a.Picture,
                             Status = a.Status,
                             StatusName = b.ValueSet,
                         });
            return query;
        }
        #endregion

        #region Tab thùng hồ sơ hủy
        [HttpPost]
        public JsonResult JTableBoxRemove([FromBody]JTableModelEDMSBoxRemove jTablePara)
        {
            try
            {
                int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;

                var query = FuncJTableBoxRemove(jTablePara.Text, jTablePara.PersonProcessor, jTablePara.Status, jTablePara.FromDate, jTablePara.ToDate);

                var count = query.Count();
                var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "WHS_Name", "FloorName", "L_Text", "RackName", "NumBoxth", "FromDate", "ToDate", "PersonProcessor", "Status", "StatusName", "BoxCode", "Placement");
                return Json(jdata);
            }
            catch (Exception ex)
            {
                var data = new List<EDMSBoxRemoveModel>();
                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, 0, "Id", "WHS_Name", "FloorName", "L_Text", "RackName", "NumBoxth", "FromDate", "ToDate", "PersonProcessor", "Status", "StatusName", "BoxCode", "Placement");
                return Json(jdata);
            }
        }

        [NonAction]
        public IQueryable<EDMSBoxRemoveModel> FuncJTableBoxRemove(string Text, string PersonProcessor, string Status, string FromDate, string ToDate)
        {
            var fromDate = !string.IsNullOrEmpty(FromDate) ? DateTime.ParseExact(FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(ToDate) ? DateTime.ParseExact(ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            var query = from a in _context.EDMSRemoveBoxs.Where(x => !x.IsDeleted)
                        join g in _context.EDMSRemoves.Where(x => !x.IsDeleted) on a.RemoveId equals g.Id
                        join b in _context.EDMSBoxs on a.BoxId equals b.Id
                        join h1 in _context.CommonSettings.Where(x => x.IsDeleted != true && x.Group == "REMOVE_STATUS") on g.Status equals h1.CodeSet into h2
                        from h in h2.DefaultIfEmpty()
                        join c1 in _context.EDMSRacks on b.RackCode equals c1.RackCode into c2
                        from c in c2.DefaultIfEmpty()
                        join d1 in _context.EDMSLines on b.LineCode equals d1.LineCode into d2
                        from d in d2.DefaultIfEmpty()
                        join e1 in _context.EDMSFloors on b.FloorCode equals e1.FloorCode into e2
                        from e in e2.DefaultIfEmpty()
                        join f1 in _context.EDMSWareHouses.Where(x => x.WHS_Flag != true && x.Type == "RV") on b.WHS_Code equals f1.WHS_Code into f2
                        from f in f2.DefaultIfEmpty()
                        let listPersonProcessor = g.PersonProcessor.Split(";", StringSplitOptions.None)
                        where
                        (string.IsNullOrEmpty(Status) || (g.Status == Status))
                        && (string.IsNullOrEmpty(PersonProcessor) || listPersonProcessor.Any(x => x == PersonProcessor))
                        && (string.IsNullOrEmpty(ToDate) || (g.FromDate <= toDate))
                        && (string.IsNullOrEmpty(FromDate) || (g.ToDate >= fromDate))
                        && (string.IsNullOrEmpty(Text)
                                || (!string.IsNullOrEmpty(b.BoxCode) && b.BoxCode.ToLower().Contains(Text.ToLower()))
                                || (c != null && !string.IsNullOrEmpty(c.RackName) && c.RackName.ToLower().Contains(Text.ToLower()))
                                || (d != null && !string.IsNullOrEmpty(d.L_Text) && d.L_Text.ToLower().Contains(Text.ToLower()))
                                || (e != null && !string.IsNullOrEmpty(e.FloorName) && e.FloorName.ToLower().Contains(Text.ToLower()))
                                || (f != null && !string.IsNullOrEmpty(f.WHS_Name) && f.WHS_Name.ToLower().Contains(Text.ToLower()))
                                )
                        select new EDMSBoxRemoveModel
                        {
                            Id = g.Id,
                            BoxCode = b.BoxCode,
                            Placement = e.FloorName + " - " + d.L_Text + " - " + c.RackName,
                            WHS_Name = f.WHS_Name,
                            FloorName = e.FloorName,
                            L_Text = d.L_Text,
                            RackName = c.RackName,
                            NumBoxth = b.NumBoxth,
                            FromDate = g.FromDate.HasValue ? g.FromDate.Value.ToString("dd/MM/yyyy") : "",
                            ToDate = g.ToDate.HasValue ? g.ToDate.Value.ToString("dd/MM/yyyy") : "",
                            Status = g.Status,
                            StatusName = h.ValueSet,
                            PersonProcessor = g.PersonProcessor,
                        };
            return query;
        }
        #endregion

        #region Tab thùng hồ sơ đến hạn
        [HttpPost]
        public JsonResult JTableBoxExpired([FromBody]JTableModelEDMSBoxExpired jTablePara)
        {
            try
            {
                int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;

                var query = FuncJTableBoxExpired(jTablePara.Text, jTablePara.FromDate, jTablePara.ToDate);

                var count = query.Count();
                var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "BoxCode", "Placement", "NumBoxth", "StorageTime", "StoragePeriod", "ExpiredDate", "StatusSecurity", "RackPosition", "WHS_Name", "FloorName", "L_Text", "RackName", "OrgName", "TypeProfileName", "LevelWarning");
                return Json(jdata);
            }
            catch (Exception ex)
            {
                var data = new List<EDMSBoxExpiredModel>();
                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, 0, "Id", "BoxCode", "Placement", "NumBoxth", "StorageTime", "StoragePeriod", "ExpiredDate", "StatusSecurity", "RackPosition", "WHS_Name", "FloorName", "L_Text", "RackName", "OrgName", "TypeProfileName", "LevelWarning");
                return Json(jdata);
            }
        }

        [NonAction]
        public IQueryable<EDMSBoxExpiredModel> FuncJTableBoxExpired(string Text, string FromDate, string ToDate)
        {
            var fromDate = !string.IsNullOrEmpty(FromDate) ? DateTime.ParseExact(FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(ToDate) ? DateTime.ParseExact(ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var maxDate = DateTime.Now.AddMonths(3);

            var session = HttpContext.GetSessionUser();
            IQueryable<EDMSBoxExpiredModel> query = null;

            query = from b in _context.EDMSBoxs.Where(x => x.IsStored)
                    join c1 in _context.EDMSRacks on b.RackCode equals c1.RackCode into c2
                    from c in c2.DefaultIfEmpty()
                    join d1 in _context.EDMSLines on b.LineCode equals d1.LineCode into d2
                    from d in d2.DefaultIfEmpty()
                    join e1 in _context.EDMSFloors on b.FloorCode equals e1.FloorCode into e2
                    from e in e2.DefaultIfEmpty()
                    join f1 in _context.EDMSWareHouses.Where(x => x.WHS_Flag != true && x.Type == "RV") on b.WHS_Code equals f1.WHS_Code into f2
                    from f in f2.DefaultIfEmpty()
                    join h1 in _context.AdOrganizations on b.DepartCode equals h1.OrgAddonCode into h2
                    from h in h2.DefaultIfEmpty()
                    join j1 in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "DOC_TYPE") on b.TypeProfile equals j1.SettingID.ToString() into j2
                    from j in j2.DefaultIfEmpty()
                    let expiredDate = b.StorageTime.HasValue ? b.StorageTime.Value.AddYears(b.StoragePeriod) : DateTime.Now.AddYears(1)
                    where
                    (expiredDate <= maxDate)
                    && (string.IsNullOrEmpty(ToDate) || (expiredDate <= toDate))
                    && (string.IsNullOrEmpty(FromDate) || (expiredDate >= fromDate))
                    && (string.IsNullOrEmpty(Text)
                            || (!string.IsNullOrEmpty(b.BoxCode) && b.BoxCode.ToLower().Contains(Text.ToLower()))
                            || (c != null && !string.IsNullOrEmpty(c.RackName) && c.RackName.ToLower().Contains(Text.ToLower()))
                            || (d != null && !string.IsNullOrEmpty(d.L_Text) && d.L_Text.ToLower().Contains(Text.ToLower()))
                            || (e != null && !string.IsNullOrEmpty(e.FloorName) && e.FloorName.ToLower().Contains(Text.ToLower()))
                            || (f != null && !string.IsNullOrEmpty(f.WHS_Name) && f.WHS_Name.ToLower().Contains(Text.ToLower()))
                            )
                    select new EDMSBoxExpiredModel
                    {
                        Id = b.Id,
                        BoxCode = b.BoxCode,
                        Placement = e.FloorName + " - " + d.L_Text + " - " + c.RackName,
                        NumBoxth = b.NumBoxth,
                        StorageTime = b.StorageTime,
                        StoragePeriod = b.StoragePeriod,
                        ExpiredDate = expiredDate.ToString("dd/MM/yyyy"),
                        StatusSecurity = b.StatusSecurity,
                        RackPosition = b.RackPosition,
                        WHS_Name = f.WHS_Name,
                        FloorName = e.FloorName,
                        L_Text = d.L_Text,
                        RackName = c.RackName,
                        OrgName = h.OrgName,
                        TypeProfileName = j.ValueSet,
                        LevelWarning = expiredDate > DateTime.Now.AddDays(7)
                                                ? expiredDate <= DateTime.Now.AddDays(14)
                                                    ? 2
                                                    : expiredDate <= DateTime.Now.AddMonths(1)
                                                        ? 3
                                                        : expiredDate <= DateTime.Now.AddMonths(2)
                                                            ? 4
                                                            : 5
                                                : 1
                    };

            return query;
        }

        #endregion




        //--------------------------------thêm mới---------------------------   
        [HttpPost]
        public JsonResult Insert([FromBody]EDMSRemoveInsert obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.EDMSRemoves.FirstOrDefault(x => !x.IsDeleted && x.Code == obj.Code);
                if (data == null)
                {
                    var fromDate = !string.IsNullOrEmpty(obj.FromDate) ? DateTime.ParseExact(obj.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                    var toDate = !string.IsNullOrEmpty(obj.ToDate) ? DateTime.ParseExact(obj.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

                    EDMSRemove objNew = new EDMSRemove();
                    objNew.Code = obj.Code;
                    objNew.Name = obj.Name;
                    objNew.FromDate = fromDate;
                    objNew.ToDate = toDate;
                    objNew.Business = obj.Business;
                    objNew.PersonProcessor = obj.PersonProcessor;
                    objNew.Note = obj.Note;
                    objNew.Picture = obj.Picture;
                    objNew.Status = obj.Status;
                    objNew.CreatedBy = ESEIM.AppContext.UserName;
                    objNew.CreatedTime = DateTime.Now;

                    _context.EDMSRemoves.Add(objNew);
                    _context.SaveChanges();
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_ADD_SUCCESS"), CommonUtil.ResourceValue("EDMSR_MSG_REMOVE_PROFILE"));
                    msg.Object = objNew.Id;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("Bản ghi đã tồn tại")); //"Không tồn tại dữ liệu!";
                }
            }
            catch
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_ADD"));
            }
            return Json(msg);
        }

        //----------------------------------------------Sửa-------------------------------
        [HttpPost]
        public JsonResult Update([FromBody]EDMSRemoveInsert obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.EDMSRemoves.FirstOrDefault(x => !x.IsDeleted && x.Code == obj.Code);
                if (data != null)
                {
                    var fromDate = !string.IsNullOrEmpty(obj.FromDate) ? DateTime.ParseExact(obj.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                    var toDate = !string.IsNullOrEmpty(obj.ToDate) ? DateTime.ParseExact(obj.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

                    data.Code = obj.Code;
                    data.Name = obj.Name;
                    data.FromDate = fromDate;
                    data.ToDate = toDate;
                    data.Business = obj.Business;
                    data.PersonProcessor = obj.PersonProcessor;
                    data.Note = obj.Note;
                    data.Picture = obj.Picture;
                    data.Status = obj.Status;
                    data.UpdatedBy = ESEIM.AppContext.UserName;
                    data.UpdatedTime = DateTime.Now;

                    _context.EDMSRemoves.Update(data);
                    _context.SaveChanges();
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_UPDATE_SUCCESS"), CommonUtil.ResourceValue("EDMSR_MSG_REMOVE_PROFILE"));
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("Bản ghi không tồn tại hoặc đã bị xóa")); //"Không tồn tại dữ liệu!";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_UPDATE_FAILED"), CommonUtil.ResourceValue("EDMSR_MSG_REMOVE_PROFILE"));
            }
            return Json(msg);
        }


        //----------------------------------------------Xóa-------------------------------
        [HttpPost]
        public JsonResult Delete(int Id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.EDMSRemoves.FirstOrDefault(x => !x.IsDeleted && x.Id == Id);
                if (data != null)
                {
                    data.IsDeleted = true;
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;

                    _context.EDMSRemoves.Update(data);

                    var listDetail = _context.EDMSRemoveBoxs.Where(x => !x.IsDeleted && x.RemoveId == Id).ToList();
                    listDetail.ForEach(x => { x.IsDeleted = true; x.DeletedBy = ESEIM.AppContext.UserName; x.DeletedTime = DateTime.Now; });
                    _context.EDMSRemoveBoxs.UpdateRange(listDetail);

                    _context.SaveChanges();
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_SUCCESS"), CommonUtil.ResourceValue(""));
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("Bản ghi không tồn tại hoặc đã bị xóa"));
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("Có lỗi khi xóa dữ liệu")); //"Có lỗi khi lấy dữ liệu!"; 
            }
            return Json(msg);
        }


        ////----------------------------------------------Get info-------------------------------
        //[HttpPost]
        //public List<TreeView> GetTreeData([FromBody]TempSub obj)
        //{
        //    //if (obj.IdI == null && obj.IdS == null)
        //    //{
        //    //    return null;
        //    //}
        //    if (obj.IdI == null)
        //    {
        //        var data = _context.EDMSRemoves.Where(x => !x.IsDeleted && (string.IsNullOrEmpty(obj.Pin) || x.Pin == obj.Pin)).OrderBy(x => x.Priority).AsNoTracking();
        //        var dataOrder = GetSubTreeData(data.ToList(), null, new List<TreeView>(), 0);
        //        return dataOrder;
        //    }
        //    else
        //    {
        //        var item = _context.EDMSRemoves.Where(x => x.Id == obj.IdI[0]).FirstOrDefault();

        //        var data = _context.EDMSRemoves.OrderBy(x => x.Priority).Where(x => !x.IsDeleted && x.Pin == item.Pin && (x.MenuCaption != item.MenuCaption && x.MenuParent != item.MenuCaption)).AsNoTracking();
        //        var dataOrder = GetSubTreeData(data.ToList(), null, new List<TreeView>(), 0);
        //        return dataOrder;
        //    }
        //}

        //private List<TreeView> GetSubTreeData(List<EDMSRemoves> data, string parentCode, List<TreeView> lstCategories, int tab)
        //{
        //    //tab += "- ";
        //    var contents = parentCode == null
        //        ? data.Where(x => string.IsNullOrEmpty(x.MenuParent)).OrderBy(x => x.Priority).ToList()
        //        : data.Where(x => x.MenuParent == parentCode).OrderBy(x => x.Priority).ToList();
        //    foreach (var item in contents)
        //    {
        //        var category = new TreeView
        //        {
        //            Id = item.Id,
        //            Code = item.MenuCaption,
        //            Title = item.Title,
        //            Level = tab,
        //            HasChild = data.Any(x => x.MenuParent == item.MenuCaption)
        //        };
        //        lstCategories.Add(category);
        //        if (category.HasChild) GetSubTreeData(data, item.MenuCaption, lstCategories, tab + 1);
        //    }
        //    return lstCategories;
        //}


        [HttpPost]
        public JsonResult GetItem(int Id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.EDMSRemoves.AsNoTracking()
                                    .Where(x => !x.IsDeleted && x.Id == Id)
                                    .Select(x => new EDMSRemoveInsert
                                    {
                                        Id = x.Id,
                                        Code = x.Code,
                                        Name = x.Name,
                                        FromDate = x.FromDate.HasValue ? x.FromDate.Value.ToString("dd/MM/yyyy") : "",
                                        ToDate = x.ToDate.HasValue ? x.ToDate.Value.ToString("dd/MM/yyyy") : "",
                                        Business = x.Business,
                                        PersonProcessor = x.PersonProcessor,
                                        Note = x.Note,
                                        Picture = x.Picture,
                                        Status = x.Status,
                                    })
                                    .FirstOrDefault()
                                    ;
                if (data != null)
                {
                    msg.Object = data;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("Bản ghi không tồn tại hoặc đã bị xóa")); //"Không tồn tại dữ liệu!";
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
        public JsonResult GetItemDetail(int Id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.EDMSRemoves.AsNoTracking()
                                    .Where(x => !x.IsDeleted && x.Id == Id)
                                    .Select(x => x.PersonProcessor)
                                    .FirstOrDefault()
                                    ;
                if (data != null)
                {
                    var listUser = data.Split(";");
                    //var listName = _context.Users.Where(x => x.Active && listUser.Any(y => y == x.UserName)).OrderBy(x => x.GivenName);

                    var ab = (from a in _context.Users.Where(x => x.Active && listUser.Any(y => y == x.UserName))
                              join b1 in _context.AdOrganizations.Where(x => x.IsEnabled) on a.BranchId equals b1.OrgAddonCode into b2
                              from b in b2.DefaultIfEmpty()
                              select new
                              {
                                  Name = a.GivenName,
                                  Branch = b != null ? b.OrgName : "Chưa khai báo"
                              }).ToList();
                    var rs = ab.Select((x, index) => new { No = index + 1, Name = x.Name, Branch = x.Branch });
                    //var cd = from c in _context.AdUserInGroups.Where(x => x.IsMain)
                    //         join d in _context.AdGroupUsers.Where(x => x.IsEnabled) on c.GroupUserCode equals d.GroupUserCode
                    //         select new
                    //         {
                    //             c.UserId,
                    //             d.Title
                    //         };
                    //var rs = from e in ab
                    //         join f1 in cd on e.Id equals f1.UserId into f2
                    //         from f in f2.DefaultIfEmpty()
                    //         let No = 0
                    //         select new
                    //         {
                    //             No = +1,
                    //             Name = e.GivenName,
                    //             Branch = e.OrgName,
                    //             Department = f.Title
                    //         };

                    //var cd = from a in _context.Users.Where(x => x.Active && listUser.Any(y => y == x.UserName))
                    //         join b in _context.AdOrganizations.Where(x => x.IsEnabled) on a.BranchId equals b.OrgAddonCode
                    //         join c in _context.AdUserInGroups.Where(x => x.IsMain) on a.Id equals c.UserId
                    //         join d in _context.AdGroupUsers.Where(x => x.IsEnabled) on c.GroupUserCode equals d.GroupUserCode
                    //         let No = 0
                    //         select new
                    //         {
                    //             No = +1,
                    //             Name = a.GivenName,
                    //             Branch = b.OrgName,
                    //             Department = d.Title
                    //         };
                    msg.Object = rs;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("Bản ghi không tồn tại hoặc đã bị xóa")); //"Không tồn tại dữ liệu!";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("Có lỗi khi lấy dữ liệu")); //"Có lỗi khi lấy dữ liệu!"; 
            }
            return Json(msg);
        }

        //[HttpPost]
        //public JsonResult GetItemAdd(string Code)
        //{
        //    var msg = new JMessage { Error = false, Title = "" };
        //    try
        //    {
        //        var data = _context.EDMSRemoves.AsNoTracking()
        //                            .Where(x => !x.IsDeleted && x.Code == Code)
        //                            .Select(x => x.Id)
        //                            .FirstOrDefault()
        //                            ;
        //        msg.Object = data;
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Title = String.Format(CommonUtil.ResourceValue("Có lỗi khi lấy dữ liệu")); //"Có lỗi khi lấy dữ liệu!"; 
        //    }
        //    return Json(msg);
        //}

        //[HttpPost]
        //public JsonResult GetListMenuParent(string menuCaption)
        //{
        //    var msg = new JMessage { Error = false, Title = "" };
        //    try
        //    {
        //        if (string.IsNullOrEmpty(menuCaption))
        //        {
        //            var data = _context.EDMSRemoves.Where(x => !x.IsDeleted)
        //                                            .OrderBy(x => x.Priority)
        //                                            .Select(x => new { Code = x.MenuCaption, Name = x.Title });
        //            if (data != null)
        //            {
        //                msg.Object = data;
        //            }
        //            else
        //            {
        //                msg.Error = true;
        //                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_NOT_EXITS_FILE")); //"Không tồn tại dữ liệu!";
        //            }
        //        }
        //        else
        //        {
        //            List<EDMSRemoves> listExcept = new List<EDMSRemoves>();
        //            var current = _context.EDMSRemoves.AsNoTracking().FirstOrDefault(x => !x.IsDeleted && x.MenuCaption == menuCaption);
        //            listExcept.Add(current);
        //            var listTreeChildrent = FuncGetTreeChildrent(menuCaption);
        //            listExcept.AddRange(listTreeChildrent);

        //            var data = _context.EDMSRemoves.Where(x => !x.IsDeleted && listExcept.All(y => y.MenuCaption != x.MenuCaption))
        //                                                .OrderBy(x => x.Priority)
        //                                                .Select(x => new { Code = x.MenuCaption, Name = x.Title });
        //            if (data != null)
        //            {
        //                msg.Object = data;
        //            }
        //            else
        //            {
        //                msg.Error = true;
        //                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_NOT_EXITS_FILE")); //"Không tồn tại dữ liệu!";
        //            }
        //        }

        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Title = String.Format(CommonUtil.ResourceValue("Có lỗi khi lấy dữ liệu")); //"Có lỗi khi lấy dữ liệu!"; 
        //    }
        //    return Json(msg);
        //}


        [HttpPost]
        public JsonResult GetListPersonProcessor()
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.Users.Where(x => x.Active).Select(x => new { Code = x.UserName, Name = x.GivenName });
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
                var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "REMOVE_STATUS").Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
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

        //----------------------------------------------------Upload Image--------------------------------
        [HttpPost]
        public object UploadImage(IFormFile fileUpload)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var upload = _upload.UploadImage(fileUpload);
                msg.Object = upload.Object;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("Tải ảnh lỗi"));
            }
            return Json(msg);
        }

        #region Tab Box
        public class JTableModelTabBox : JTableModel
        {
            public int? Id { get; set; }
            public string Text { get; set; }
        }
        public class EDMSRemoveBoxInsert
        {
            public string WHS_Code { get; set; }
            public string FloorCode { get; set; }
            public string LineCode { get; set; }
            public string RackCode { get; set; }
            public int BoxId { get; set; }
            public int RemoveId { get; set; }
            public int? Id { get; set; }
            public string Note { get; set; }
        }
        [HttpPost]
        public object JTableTabBox([FromBody]JTableModelTabBox jTablePara)
        {
            if (jTablePara.Id == null)
            {
                return JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "Id", "WHS_Name", "FloorName", "L_Text", "RackName", "NumBoxth", "Note");
            }
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.EDMSRemoveBoxs.Where(x => !x.IsDeleted && x.RemoveId == jTablePara.Id)
                        join b in _context.EDMSBoxs on a.BoxId equals b.Id
                        join c1 in _context.EDMSRacks on b.RackCode equals c1.RackCode into c2
                        from c in c2.DefaultIfEmpty()
                        join d1 in _context.EDMSLines on b.LineCode equals d1.LineCode into d2
                        from d in d2.DefaultIfEmpty()
                        join e1 in _context.EDMSFloors on b.FloorCode equals e1.FloorCode into e2
                        from e in e2.DefaultIfEmpty()
                        join f1 in _context.EDMSWareHouses.Where(x => x.WHS_Flag != true && x.Type == "RV") on b.WHS_Code equals f1.WHS_Code into f2
                        from f in f2.DefaultIfEmpty()
                        where (string.IsNullOrEmpty(jTablePara.Text)
                                || (!string.IsNullOrEmpty(b.BoxCode) && b.BoxCode.ToLower().Contains(jTablePara.Text.ToLower()))
                                || (c != null && !string.IsNullOrEmpty(c.RackName) && c.RackName.ToLower().Contains(jTablePara.Text.ToLower()))
                                || (d != null && !string.IsNullOrEmpty(d.L_Text) && d.L_Text.ToLower().Contains(jTablePara.Text.ToLower()))
                                || (e != null && !string.IsNullOrEmpty(e.FloorName) && e.FloorName.ToLower().Contains(jTablePara.Text.ToLower()))
                                || (f != null && !string.IsNullOrEmpty(f.WHS_Name) && f.WHS_Name.ToLower().Contains(jTablePara.Text.ToLower()))
                        )
                        select new
                        {
                            Id = a.Id,
                            WHS_Name = f.WHS_Name,
                            FloorName = e.FloorName,
                            L_Text = d.L_Text,
                            RackName = c.RackName,
                            BoxCode = b.BoxCode,
                            NumBoxth = b.NumBoxth,
                            Note = a.Note,
                        };
            int count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "BoxCode", "WHS_Name", "FloorName", "L_Text", "RackName", "NumBoxth", "Note");
            return jdata;
        }

        [HttpPost]
        public JsonResult InsertTabBox([FromBody]EDMSRemoveBoxInsert obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.EDMSRemoveBoxs.FirstOrDefault(x => !x.IsDeleted && x.BoxId == obj.BoxId);
                if (data == null)
                {
                    EDMSRemoveBox objNew = new EDMSRemoveBox();
                    objNew.BoxId = obj.BoxId;
                    objNew.RemoveId = obj.RemoveId;
                    objNew.CreatedBy = ESEIM.AppContext.UserName;
                    objNew.CreatedTime = DateTime.Now;

                    _context.EDMSRemoveBoxs.Add(objNew);
                    _context.SaveChanges();
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_ADD_SUCCESS"), CommonUtil.ResourceValue(""));
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("Thùng này đã tồn tại trong lệnh hủy hồ sơ")); //"Không tồn tại dữ liệu!";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_ADD_FAILED"), CommonUtil.ResourceValue(""));// "Có lỗi xảy ra khi thêm!";
                msg.Object = ex;
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult UpdateTabBox([FromBody]EDMSRemoveBoxInsert obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.EDMSRemoveBoxs.FirstOrDefault(x => !x.IsDeleted && x.Id == obj.Id);
                if (data != null)
                {
                    var chkExist = _context.EDMSRemoveBoxs.Any(x => !x.IsDeleted && x.BoxId == obj.BoxId && x.BoxId != data.BoxId);
                    if (chkExist)
                    {
                        msg.Error = true;
                        msg.Title = String.Format(CommonUtil.ResourceValue("Thùng này đã tồn tại trong lệnh hủy hồ sơ"));
                    }
                    else
                    {
                        //data.RemoveId = obj.RemoveId;
                        data.BoxId = obj.BoxId;

                        data.UpdatedBy = ESEIM.AppContext.UserName;
                        data.UpdatedTime = DateTime.Now;

                        _context.EDMSRemoveBoxs.Update(data);
                        _context.SaveChanges();
                        msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_UPDATE_SUCCESS"), CommonUtil.ResourceValue(""));
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("Bản ghi không tồn tại hoặc đã bị xóa")); //"Không tồn tại dữ liệu!";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_UPDATE_FAILED"), CommonUtil.ResourceValue(""));// "Có lỗi xảy ra khi cập nhật!";
                msg.Object = ex;
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult DeleteTabBox(int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.EDMSRemoveBoxs.FirstOrDefault(x => x.Id == id);

                data.DeletedBy = ESEIM.AppContext.UserName;
                data.DeletedTime = DateTime.Now;
                data.IsDeleted = true;

                _context.EDMSRemoveBoxs.Update(data);
                _context.SaveChanges();

                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_SUCCESS"), CommonUtil.ResourceValue(""));// "Xóa thành công";
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_FAIL"), CommonUtil.ResourceValue(""));//"Có lỗi xảy ra khi xóa!";
                msg.Object = ex;
                return Json(msg);
            }
        }

        [HttpPost]
        public JsonResult GetTabBox(int Id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = (from a in _context.EDMSRemoveBoxs.Where(x => !x.IsDeleted && x.Id == Id)
                            join b in _context.EDMSBoxs on a.BoxId equals b.Id
                            select new
                            {
                                b.WHS_Code,
                                b.FloorCode,
                                b.LineCode,
                                b.RackCode,
                                b.BoxCode,
                                b.NumBoxth,
                                a.BoxId,
                                a.Note,
                                a.RemoveId,
                                a.Id,
                            })
                            .FirstOrDefault();
                if (data != null)
                {
                    msg.Object = data;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("Bản ghi không tồn tại hoặc đã bị xóa")); //"Không tồn tại dữ liệu!";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("Có lỗi khi lấy dữ liệu")); //"Có lỗi khi lấy dữ liệu!"; 
            }
            return Json(msg);
        }

        //[HttpPost]
        //public JsonResult GetListWHS_Code()
        //{
        //    var msg = new JMessage { Error = false, Title = "" };
        //    try
        //    {
        //        var data = _context.EDMSWareHouses.Where(x => x.WHS_Flag != true && x.Type == "RV").Select(x => new { Code = x.WHS_Code, Name = x.WHS_Name });
        //        msg.Object = data;
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Title = String.Format(CommonUtil.ResourceValue("Có lỗi khi lấy dữ liệu")); //"Có lỗi khi lấy dữ liệu!"; 
        //    }
        //    return Json(msg);
        //}
        //[HttpPost]
        //public JsonResult GetListFloorCode(string WHS_Code)
        //{
        //    var msg = new JMessage { Error = false, Title = "" };
        //    try
        //    {
        //        var data = _context.EDMSFloors.Where(x => x.WHS_Code == WHS_Code).Select(x => new { Code = x.FloorCode, Name = x.FloorName });
        //        msg.Object = data;
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Title = String.Format(CommonUtil.ResourceValue("Có lỗi khi lấy dữ liệu")); //"Có lỗi khi lấy dữ liệu!"; 
        //    }
        //    return Json(msg);
        //}
        //[HttpPost]
        //public JsonResult GetListLineCode(string FloorCode)
        //{
        //    var msg = new JMessage { Error = false, Title = "" };
        //    try
        //    {
        //        var data = _context.EDMSLines.Where(x => x.FloorCode == FloorCode).Select(x => new { Code = x.LineCode, Name = x.L_Text });
        //        msg.Object = data;
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Title = String.Format(CommonUtil.ResourceValue("Có lỗi khi lấy dữ liệu")); //"Có lỗi khi lấy dữ liệu!"; 
        //    }
        //    return Json(msg);
        //}
        //[HttpPost]
        //public JsonResult GetListRackCode(string LineCode)
        //{
        //    var msg = new JMessage { Error = false, Title = "" };
        //    try
        //    {
        //        var data = _context.EDMSRacks.Where(x => x.LineCode == LineCode).Select(x => new { Code = x.RackCode, Name = x.RackName });
        //        msg.Object = data;
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Title = String.Format(CommonUtil.ResourceValue("Có lỗi khi lấy dữ liệu")); //"Có lỗi khi lấy dữ liệu!"; 
        //    }
        //    return Json(msg);
        //}
        //[HttpPost]
        //public JsonResult GetListBoxId(string RackCode)
        //{
        //    var msg = new JMessage { Error = false, Title = "" };
        //    try
        //    {
        //        var data = _context.EDMSBoxs.Where(x => x.RackCode == RackCode).Select(x => new { Code = x.Id, Name = x.NumBoxth });
        //        msg.Object = data;
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Title = String.Format(CommonUtil.ResourceValue("Có lỗi khi lấy dữ liệu")); //"Có lỗi khi lấy dữ liệu!"; 
        //    }
        //    return Json(msg);
        //}
        [HttpPost]
        public JsonResult GetListBoxId()
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = (from a in _context.EDMSBoxs.Where(x => x.IsStored && !string.IsNullOrEmpty(x.RackCode))
                            join b1 in _context.EDMSRemoveBoxs.Where(x => x.IsDeleted != true) on a.Id equals b1.BoxId into b2
                            from b in b2.DefaultIfEmpty()
                            where b == null
                            select a).OrderByDescending(x => x.Id);
                msg.Object = data;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("Có lỗi khi lấy dữ liệu")); //"Có lỗi khi lấy dữ liệu!"; 
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetListBoxIdUpdate(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = from a in _context.EDMSBoxs.Where(x => x.IsStored && !string.IsNullOrEmpty(x.RackCode))
                           join b1 in _context.EDMSRemoveBoxs.Where(x => x.IsDeleted != true && x.Id != id) on a.Id equals b1.BoxId into b2
                           from b in b2.DefaultIfEmpty()
                           where b == null
                           select a;
                msg.Object = data;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("Có lỗi khi lấy dữ liệu")); //"Có lỗi khi lấy dữ liệu!"; 
            }
            return Json(msg);
        }
        //Tạo mã QR_Code
        [HttpPost]
        public byte[] GeneratorQRCode(string code)
        {
            return CommonUtil.GeneratorQRCode(code);
        }
        #endregion
    }
    public class EDMSCmRemoveModel
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public string FromDate { get; set; }
        public string ToDate { get; set; }
        public string Business { get; set; }
        public string PersonProcessor { get; set; }
        public string PersonProcessorName { get; set; }
        public string Note { get; set; }
        public string Picture { get; set; }
        public string Status { get; set; }
        public string StatusName { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedTime { get; set; }
        public string UpdatedBy { get; set; }
        public DateTime? UpdatedTime { get; set; }
        public string DeletedBy { get; set; }
        public DateTime? DeletedTime { get; set; }
        public bool IsDeleted { get; set; }
    }
    public class EDMSBoxRemoveModel
    {
        public int Id { get; set; }
        public string FromDate { get; set; }
        public string ToDate { get; set; }
        public string PersonProcessor { get; set; }
        //public string Picture { get; set; }
        public string Status { get; set; }
        public string StatusName { get; set; }
        public string WHS_Name { get; set; }
        public string FloorName { get; set; }
        public string L_Text { get; set; }
        public string RackName { get; set; }
        public string NumBoxth { get; set; }
        public string BoxCode { get; set; }
        public string Placement { get; set; }

    }
    public class EDMSBoxExpiredModel
    {
        public int Id { get; set; }
        public string BoxCode { get; set; }
        public string Placement { get; set; }
        public string NumBoxth { get; set; }
        public DateTime? StorageTime { get; set; }
        public string ExpiredDate { get; set; }
        public int StoragePeriod { get; set; }
        public string StatusSecurity { get; set; }
        public string RackPosition { get; set; }
        public string WHS_Name { get; set; }
        public string FloorName { get; set; }
        public string L_Text { get; set; }
        public string RackName { get; set; }
        public string OrgName { get; set; }
        public string TypeProfileName { get; set; }
        public int LevelWarning { get; set; }
    }
    public class EDMSRemoveInsert
    {
        public int? Id { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public string FromDate { get; set; }
        public string ToDate { get; set; }
        public string Business { get; set; }
        public string PersonProcessor { get; set; }
        public string PersonProcessorName { get; set; }
        public string Note { get; set; }
        public string Picture { get; set; }
        public string Status { get; set; }
        //public string CreatedBy { get; set; }
        //public DateTime CreatedTime { get; set; }
        //public string UpdatedBy { get; set; }
        //public DateTime? UpdatedTime { get; set; }
        //public string DeletedBy { get; set; }
        //public DateTime? DeletedTime { get; set; }
        //public bool IsDeleted { get; set; }
    }
}