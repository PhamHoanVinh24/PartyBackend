using System;
using System.Collections.Generic;
using System.Data;
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
using Microsoft.Extensions.Localization;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using static III.Admin.Controllers.CardJobController;

namespace III.Admin.Controllers
{
    public class JtableNotificationCardJob : JTableModel
    {
        public string Name { get; set; }
        public string FromDate { get; set; }
        public string ToDate { get; set; }
    }
    [Area("Admin")]
    public class NotificationCardJobController : BaseController
    {
        private readonly EIMDBContext _context;
        public NotificationCardJobController(EIMDBContext context)
        {
            _context = context;
        }

        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public JsonResult JTable([FromBody]SearchNotification jtablePara)
        {
            var currentUser = ESEIM.AppContext.UserId;
            var uName = ESEIM.AppContext.UserName;
            int intBegin = (jtablePara.CurrentPage - 1) * jtablePara.Length;
            var fromDate = string.IsNullOrEmpty(jtablePara.FromDate) ? (DateTime?)null : DateTime.ParseExact(jtablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var toDate = string.IsNullOrEmpty(jtablePara.ToDate) ? (DateTime?)null : DateTime.ParseExact(jtablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            if (fromDate == null && toDate == null && string.IsNullOrEmpty(jtablePara.Status) && string.IsNullOrEmpty(jtablePara.CardName))
            {
                var query = (from a in _context.WORKOSCards.Where(x => !x.IsDeleted)
                             join b in _context.CardCommentLists on a.CardCode equals b.CardCode
                             join d in _context.JcObjectIdRelatives.Where(x => !x.IsDeleted) on a.CardCode equals d.CardCode into d1
                             from d2 in d1.DefaultIfEmpty()
                             join e in _context.CardMappings on a.CardCode equals e.CardCode into e1
                             from e2 in e1.DefaultIfEmpty()
                             where e2.UserId == currentUser || a.CreatedBy == uName &&
                             (string.IsNullOrEmpty(jtablePara.ObjCode) || d2.ObjID.Equals(jtablePara.ObjCode)) &&
                             (string.IsNullOrEmpty(jtablePara.Department) || e2.GroupUserCode.Equals(jtablePara.Department)) &&
                             (string.IsNullOrEmpty(jtablePara.Group) || e2.TeamCode.Equals(jtablePara.Group))
                             select new GridCardJtable
                             {
                                 CardID = a.CardID,
                                 CardCode = a.CardCode,
                                 CardName = a.CardName,
                                 ListName = _context.WORKOSLists.FirstOrDefault(y => y.ListCode.Equals(a.ListCode)).ListName ?? "",
                                 Deadline = a.Deadline,
                                 Currency = _context.CommonSettings.FirstOrDefault(y => y.CodeSet == a.Currency).ValueSet ?? "",
                                 Cost = a.Cost,
                                 Completed = a.Completed,
                                 BeginTime = a.BeginTime,
                                 EndTime = a.EndTime,
                                 Status = _context.CommonSettings.FirstOrDefault(y => y.CodeSet.Equals(a.Status)).ValueSet,
                                 ObjTypeCode = d2.ObjTypeCode
                             }).OrderByDescending(x => x.CardID).DistinctBy(x => x.CardCode);

                var query1 = query.Select(x => new
                {
                    x.CardID,
                    x.CardCode,
                    x.CardName,
                    x.BeginTime,
                    x.EndTime,
                    x.Status,
                    ListGroup = JsonConvert.SerializeObject((from a in _context.CardMappings.Where(k => k.CardCode == x.CardCode && k.TeamCode != null)
                                                             join b in _context.AdGroupUsers.Where(k => k.IsEnabled && !k.IsDeleted) on a.TeamCode equals b.GroupUserCode
                                                             select new ObjTemp
                                                             {
                                                                 Code = b.GroupUserCode,
                                                                 Name = b.Title
                                                             }).DistinctBy(k => k.Code)),
                    ListDepartment = JsonConvert.SerializeObject((from a in _context.CardMappings.Where(k => k.CardCode == x.CardCode && k.GroupUserCode != null)
                                                                  join b in _context.AdDepartments.Where(k => k.IsEnabled && !k.IsDeleted) on a.GroupUserCode equals b.DepartmentCode
                                                                  select new ObjTemp
                                                                  {
                                                                      Code = b.DepartmentCode,
                                                                      Name = b.Title
                                                                  }).DistinctBy(k => k.Code)),
                    ListObj = JsonConvert.SerializeObject(from a in GetListObjTemp(x.ObjTypeCode)
                              join b in _context.JcObjectIdRelatives.Where(k => k.CardCode == x.CardCode && !k.IsDeleted) on a.Code equals b.ObjID
                              select new ObjTemp
                              {
                                  Code = a.Code,
                                  Name = a.Name
                              })
                });
                var count = query1.Count();
                var data = query1.Skip(intBegin).Take(jtablePara.Length).ToList();
                var jdata = JTableHelper.JObjectTable(data,
                                    jtablePara.Draw,
                                    count,
                                    "CardID", "CardCode", "CardName", "ListName", "Deadline", "Status",
                                    "Completed", "BeginTime", "EndTime", "Cost", "Currency", "ListDepartment", "ListGroup", "ListObj");
                return Json(jdata);
            }
            else
            {
                var query = (from a in _context.WORKOSCards.Where(x => !x.IsDeleted)
                             join b in _context.CardCommentLists on a.CardCode equals b.CardCode into b1
                             from b2 in b1.DefaultIfEmpty()
                             join c in _context.CardItemChecks on a.CardCode equals c.CardCode into c1
                             from c2 in c1.DefaultIfEmpty()
                             join d in _context.JcObjectIdRelatives.Where(x => !x.IsDeleted) on a.CardCode equals d.CardCode into d1
                             from d2 in d1.DefaultIfEmpty()
                             join e in _context.CardMappings on a.CardCode equals e.CardCode into e1
                             from e2 in e1.DefaultIfEmpty()
                             where (fromDate == null || a.BeginTime >= fromDate) &&
                                   (toDate == null || a.EndTime.HasValue && a.EndTime.Value.Date <= toDate)
                                   && e2.UserId == currentUser || a.CreatedBy == uName &&
                                   ((string.IsNullOrEmpty(jtablePara.CardName) || a.CardName.ToLower().Contains(jtablePara.CardName.ToLower())) ||
                                   (string.IsNullOrEmpty(jtablePara.CardName) || a.Description.ToLower().Contains(jtablePara.CardName.ToLower())) ||
                                   (string.IsNullOrEmpty(jtablePara.CardName) || c2.CheckTitle.ToLower().Contains(jtablePara.CardName.ToLower())) ||
                                   (string.IsNullOrEmpty(jtablePara.CardName) || b2.CmtContent.ToLower().Contains(jtablePara.CardName.ToLower()))) &&
                                   (string.IsNullOrEmpty(jtablePara.Status) || a.Status.Equals(jtablePara.Status)) &&
                                   (string.IsNullOrEmpty(jtablePara.ObjCode) || d2.ObjID.Equals(jtablePara.ObjCode)) &&
                                   (string.IsNullOrEmpty(jtablePara.Department) || e2.GroupUserCode.Equals(jtablePara.Department)) &&
                                   (string.IsNullOrEmpty(jtablePara.Group) || e2.TeamCode.Equals(jtablePara.Group))
                             select new GridCardJtable
                             {
                                 CardID = a.CardID,
                                 CardCode = a.CardCode,
                                 CardName = a.CardName,
                                 ListName = _context.WORKOSLists.FirstOrDefault(y => y.ListCode.Equals(a.ListCode)).ListName ?? "",
                                 Deadline = a.Deadline,
                                 Currency = _context.CommonSettings.FirstOrDefault(y => y.CodeSet == a.Currency).ValueSet ?? "",
                                 Cost = a.Cost,
                                 Completed = a.Completed,
                                 BeginTime = a.BeginTime,
                                 EndTime = a.EndTime,
                                 Status = _context.CommonSettings.FirstOrDefault(y => y.CodeSet.Equals(a.Status)).ValueSet,
                                 ObjTypeCode = d2.ObjTypeCode
                             }).DistinctBy(x => x.CardCode).OrderByDescending(x => x.CardID);

                var query1 = query.Select(x => new
                {
                    x.CardID,
                    x.CardCode,
                    x.CardName,
                    x.BeginTime,
                    x.EndTime,
                    x.Status,
                    ListGroup = JsonConvert.SerializeObject((from a in _context.CardMappings.Where(k => k.CardCode == x.CardCode && k.TeamCode != null)
                                                             join b in _context.AdGroupUsers.Where(k => k.IsEnabled && !k.IsDeleted) on a.TeamCode equals b.GroupUserCode
                                                             select new ObjTemp
                                                             {
                                                                 Code = b.GroupUserCode,
                                                                 Name = b.Title
                                                             }).DistinctBy(k => k.Code)),
                    ListDepartment = JsonConvert.SerializeObject((from a in _context.CardMappings.Where(k => k.CardCode == x.CardCode && k.GroupUserCode != null)
                                                                  join b in _context.AdDepartments.Where(k => k.IsEnabled && !k.IsDeleted) on a.GroupUserCode equals b.DepartmentCode
                                                                  select new ObjTemp
                                                                  {
                                                                      Code = b.DepartmentCode,
                                                                      Name = b.Title
                                                                  }).DistinctBy(k => k.Code)),
                    ListObj = JsonConvert.SerializeObject(from a in GetListObjTemp(x.ObjTypeCode)
                                                           join b in _context.JcObjectIdRelatives.Where(k => k.CardCode == x.CardCode && !k.IsDeleted) on a.Code equals b.ObjID
                                                           select new ObjTemp
                                                           {
                                                               Code = a.Code,
                                                               Name = a.Name
                                                           })
                });
                var count = query1.Count();
                var data = query1.Skip(intBegin).Take(jtablePara.Length).ToList();
                var jdata = JTableHelper.JObjectTable(data,
                                    jtablePara.Draw,
                                    count,
                                    "CardID", "CardCode", "CardName", "ListName", "Deadline", "Status",
                                    "Completed", "BeginTime", "EndTime", "Cost", "Currency", "ListDepartment", "ListGroup", "ListObj");
                return Json(jdata);
            }
        }

        [HttpPost]
        public object GetDepartment()
        {
            return _context.AdDepartments.Where(x => x.IsEnabled && !x.IsDeleted).Select(x => new
            {
                Code = x.DepartmentCode,
                Name = x.Title
            });
        }

        [HttpPost]
        public object GetGroupUser()
        {
            var data = _context.AdGroupUsers.Where(x => x.IsEnabled && !x.IsDeleted).Select(x => new { Code = x.GroupUserCode, Name = x.Title });
            return data;
        }

        [NonAction]
        public List<ObjTemp> GetListObjTemp(string code)
        {
            List<ObjTemp> listTemp = new List<ObjTemp>();
            if (code != null)
            {
                var query = _context.JcObjectTypes.FirstOrDefault(x => x.ObjTypeCode.Equals(code) && !x.IsDeleted);
                
                using (var command = _context.Database.GetDbConnection().CreateCommand())
                {
                    command.CommandText = query.ScriptSQL;
                    _context.Database.OpenConnection();
                    using (var result = command.ExecuteReader())
                    {
                        while (result.Read())
                        {
                            if (result != null)
                            {
                                if(!result.IsDBNull(1) && !result.IsDBNull(2))
                                {
                                    var objTemp = new ObjTemp
                                    {
                                        Code = result.GetString(1),
                                        Name = result.GetString(2)
                                    };
                                    if (objTemp != null)
                                    {
                                        listTemp.Add(objTemp);
                                    }
                                }
                            }

                        }
                    }
                    _context.Database.CloseConnection();
                }
                return listTemp;
            }
            else
            {
                return listTemp;
            }
        }
        public class SearchNotification : JTableModel
        {
            public string ListCode { get; set; }
            public string BoardCode { get; set; }
            public string CardName { get; set; }
            public string Member { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string Status { get; set; }
            public string ObjDependency { get; set; }
            public string ObjCode { get; set; }
            public List<Properties> ListObjCode { get; set; }
            public int TabBoard { get; set; }
            public int Page { get; set; }
            public string Description { get; set; }
            public string Comment { get; set; }
            public string SubItem { get; set; }
            public string Object { get; set; }
            public string Department { get; set; }
            public string Group { get; set; }
        }
        public class GridCardJtable
        {
            public int CardID { get; set; }
            public string CardCode { get; set; }
            public string CardName { get; set; }
            public string ListName { get; set; }
            public DateTime Deadline { get; set; }
            public string Currency { get; set; }
            public decimal Cost { get; set; }
            public decimal Completed { get; set; }
            public DateTime BeginTime { get; set; }
            public DateTime? EndTime { get; set; }
            public string Status { get; set; }
            public List<ObjTemp> Departments { get; set; }
            public List<ObjTemp> Groups { get; set; }
            public List<ObjTemp> ListObj { get; set; }
            public string ObjTypeCode { get; set; }
        }
    }
}