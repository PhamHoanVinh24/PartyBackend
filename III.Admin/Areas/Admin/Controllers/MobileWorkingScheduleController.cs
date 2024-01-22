using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Syncfusion.EJ2.Linq;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;

namespace III.Admin.Areas.Admin.Controllers
{
    public class MobileWorkingScheduleController : Controller
    {
        private readonly EIMDBContext _context;
        public MobileWorkingScheduleController(EIMDBContext context)
        {
            _context = context;
        }

        public IActionResult Index()
        {
            try
            {
                var data = _context.WorkingScheduleAttrs.FirstOrDefault();
                return Ok(data);
            }
            catch (Exception ex)
            {
                return NoContent();
            }
        }
        public class WorkingScheduleAttrModel
        {
            public int? WorkingSchduleId { get; set; }
            public string AttrCode { get; set; }
            public string AttrGroup { get; set; }
            public string SessionCode { get; set; }
            public string CreatedBy { get; set; }
            public string Value { get; set; }
            public string Unit { get; set; }
            public string Type { get; set; }
        }
        public class JsonItemList
        {
            public string Code { get; set; }
            public string Unit { get; set; }
            public string Value { get; set; }
            public string Name { get; set; }
            public string Type { get; set; }
        }
        public class SessionLogger
        {
            public string Color { get; set; }
            public string SessionId { get; set; }
            public int Index { get; set; }
        }
        public class FileAttr
        {
            public string FileName { get; set; }
            public string FileUrl { get; set; }
            public string CardCode { get; set; }
        }
        public class DataLoggerCardModel
        {
            public string SessionCode { get; set; }
            public string GroupCode { get; set; }
            public string GroupName { get; set; }
            public int Index { get; set; }
            public string Color { get; set; }
            public string CreatedBy { get; set; }
            public string CreatedTime { get; set; }
            public List<JsonItemList> ListDetail { get; set; }
        }
        [HttpPost]
        public JsonResult InsertDataSetsWorkingSchedule([FromBody] List<WorkingScheduleAttrModel> objList)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                foreach (var item in objList)
                {
                    
                    var data = new WorkingScheduleAttr()
                    {
                        WorkingScheduleId = (int)item.WorkingSchduleId,
                        AttrCode = item.AttrCode,
                        AttrGroup = item.AttrGroup,
                        SessionCode = item.SessionCode,
                        CreatedBy = item.CreatedBy,
                        CreatedTime = DateTime.Now,
                        Value = item.Value,
                        Unit = item.Unit,
                        Type = item.Type
                    };
                _context.WorkingScheduleAttrs.Add(data);                
                }
                _context.SaveChanges();
                msg.Title = "Thêm lịch họp thành công !";
            }
            catch (Exception ex)
            {
                msg.Title = "Có lỗi khi thêm lịch họp!";
                msg.Error = true;
            }
            return Json(msg);
        }

        public class GridModelWsUserApproved
        {
            public string userName { get; set; }
            public string status { get; set; }
        }

        public class GridModelWorkingSchedule
        {
            public int Id { get; set; }
            public string Location { get; set; }
            public string Content { get; set; }
            public DateTime StartDate { get; set; }
            public DateTime EndDate { get; set; }
            public string ListUser { get; set; }
            public List<UserConvert> ListUserApproved { get; set; }
            public string WorkContent { get; set; }
            public DateTime StartDateTime { get; set; }
            public string BackgroundColor { get; set; }
            public string BackgroundImage { get; set; }
            public string JsonStatus { get; set; }
            public string JsonRef { get; set; }
            public string Type { get; set; }
            public string CreatedBy { get; set; }
            public string UpdatedBy { get; set; }
            public string Status { get; set; }
        }

        public class UserConvert
        {
            public string GivenName { get; set; }
            public string userName { get; set; }
            public string UserName { get; set; }
            public string UserId { get; set; }
            public string DepartmentId { get; set; }
            public string Picture { get; set; }
            public string Code { get; set; }
            public string Name { get; set; }
            public string Role { get; set; }
            public int Type { get; set; }
            public string status { get; set; }
        }
        public List<UserConvert> CvtObject(string Input)
        {
            var result = JsonConvert.DeserializeObject<List<UserConvert>>(Input);
            return result;
        }

        [HttpPost]
        public object JTableWeekWorkingScheduleWithId(int Id)
        {
            var msg = new JMessage();
            try
            {
                var query =_context.WorkingSchedules.Where(x => !x.IsDeleted);
                if (Id != 0)
                {
                    query = query.Where(a => a.ID == Id);
                }
                var result = query.Select(a => new GridModelWorkingSchedule
                {
                    Id = a.ID,
                    Location = a.Location,
                    Content = a.Content,
                    WorkContent = a.WorkContent,
                    StartDate = a.StartDate,
                    EndDate = a.EndDate,
                    ListUserApproved = CvtObject(a.ListUserApproved),
                    //StartDateTime = a.StartDateTime,
                    BackgroundColor = a.BackgroundColor,
                    BackgroundImage = a.BackgroundImage,
                    JsonRef = a.JsonRef,
                    Type = a.Type,
                    CreatedBy = a.CreatedBy,
                    UpdatedBy = a.UpdatedBy,
                    Status = a.Status
                }).ToList();

                var users = _context.Users.ToList();

                foreach (var item in query)
                {
                    try
                    {
                        var listUser = JsonConvert
                            .DeserializeObject<List<GridModelWsUserApproved>>(item.ListUserApproved)
                            .Select(x => x.userName); /*item.ListUserApproved.Split(",", StringSplitOptions.None);*/
                        var usrs = from a in users
                                   join b in listUser on a.UserName equals b
                                   select new
                                   {
                                       a.GivenName
                                   };
                        item.ListUser = string.Join(", ", usrs.Select(x => x.GivenName));
                    }
                    catch (Exception ex)
                    {
                        item.ListUser = "";
                    }
                }

                var count = query.Count();
                //var data = query.Skip(intBeginFor).Take(jTablePara.Length).ToList();
                msg.Object = new
                {
                    data = result,
                    count = count,
                };
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra";
            }

            return Json(msg);
        }


        [HttpPost]
        public object GetItemMobile(int id)
        {
            var msg = new JMessage();
            try
            {
                var query = _context.WorkingSchedules.Where(x => !x.IsDeleted);
                if (id != 0)
                {
                    query = query.Where(a => a.ID == id);
                }
                var result = query.Select(a => new GridModelWorkingSchedule
                {
                    Id = a.ID,
                    Location = a.Location,
                    Content = a.Content,
                    WorkContent = a.WorkContent,
                    StartDate = a.StartDate,
                    EndDate = a.EndDate,
                    ListUserApproved = CvtObject(a.ListUserApproved),
                    //StartDateTime = a.StartDateTime,
                    BackgroundColor = a.BackgroundColor,
                    BackgroundImage = a.BackgroundImage,
                    JsonRef = a.JsonRef,
                    Type = a.Type,
                    CreatedBy = a.CreatedBy,
                    UpdatedBy = a.UpdatedBy,
                    Status = a.Status
                }).ToList();

                var users = _context.Users.ToList();

                foreach (var item in query)
                {
                    try
                    {
                        var listUser = JsonConvert
                            .DeserializeObject<List<GridModelWsUserApproved>>(item.ListUserApproved)
                            .Select(x => x.userName); /*item.ListUserApproved.Split(",", StringSplitOptions.None);*/
                        var usrs = from a in users
                                   join b in listUser on a.UserName equals b
                                   select new
                                   {
                                       a.GivenName
                                   };
                        item.ListUser = string.Join(", ", usrs.Select(x => x.GivenName));
                    }
                    catch (Exception ex)
                    {
                        item.ListUser = "";
                    }
                }

                //var count = query.Count();
                //var data = query.Skip(intBeginFor).Take(jTablePara.Length).ToList();
                msg.Object = result.FirstOrDefault();
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra";
            }

            return Json(msg);
        }


        [HttpPost]
        public JsonResult GetListWorkStatus()
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                msg.Object = _context.CommonSettings.Where(x => x.Group == "WS_STATUS")
                    .Select(x => new { Code = x.CodeSet, Name = x.ValueSet }).ToList();
            }
            catch (Exception ex)
            {
                msg.Object = ex.Message;
                msg.Error = true;
                msg.Title = "Có lỗi khi lấy dữ liệu!";
            }

            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetDataLoggerCardWorking(int workingScheduleId)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var groupSession = _context.WorkingScheduleAttrs.Where(x => !x.IsDeleted && x.WorkingScheduleId == workingScheduleId)
                    .GroupBy(x => x.SessionCode).Select(p => new
                        SessionLogger
                    {
                        SessionId = p.Key,
                        Color = "",
                        Index = 0
                    }).ToList();

                var index = 1;
                foreach (var item in groupSession)
                {
                    item.Index = index;
                    item.Color = index % 2 == 0 ? "" : "#f1f5f7";
                    index++;
                }

                msg.Object = (from a in _context.WorkingScheduleAttrs.Where(x => !x.IsDeleted && x.WorkingScheduleId == workingScheduleId)
                              //join b in _context.WorkingSchedules on a.WorkingScheduleId equals b.ID
                              join b in _context.AttrSetups.Where(x => !x.IsDeleted) on a.AttrCode equals b.AttrCode
                              //join b in _context.ShiftLogs on a.ShiftCode equals b.ShiftCode into b1
                              //from b in b1.DefaultIfEmpty()
                              join c in _context.Users on a.CreatedBy equals c.UserName
                              join d in groupSession on a.SessionCode equals d.SessionId
                              orderby d.Index
                              group new {a, b, c, d} by a.SessionCode into g
                              select new DataLoggerCardModel
                              {
                                  SessionCode = g.Key,
                                  GroupCode = g.FirstOrDefault().a.AttrCode,
                                  GroupName = g.FirstOrDefault().a.AttrGroup,
                                  Index = g.FirstOrDefault().d.Index,
                                  Color = g.FirstOrDefault().d.Color,
                                  CreatedBy = g.FirstOrDefault().c.GivenName,
                                  CreatedTime = g.FirstOrDefault().a.CreatedTime.ToString("HH:mm dd/MM/yyyy"),
                                  ListDetail = g.Select(x => new JsonItemList
                                  {
                                    Code = x.a.AttrCode,
                                    Name = x.b.AttrName,
                                    Unit = x.a.Unit,
                                    Value = x.a.Value,
                                    Type = x.a.Type,
                                  }).ToList(),

                              }).ToList();
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra!";
            }

            return Json(msg);
        }
        
        [HttpPost]
        public JsonResult DeleteDataLoggerWorking(string sessionCode, string UserName)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var session = _context.Users.FirstOrDefault(x => x.UserName == UserName);
                var dataLoggers = _context.WorkingScheduleAttrs.Where(x => !x.IsDeleted && x.SessionCode.Equals(sessionCode))
                    .ToList();
                if (dataLoggers.Count > 0)
                {
                    if (dataLoggers[0].CreatedBy.Equals(session.UserName) || session.UserType == 10)
                    {
                        //dataLoggers.ForEach(x => x.IsDeleted = true);
                        dataLoggers.ForEach(x =>
                        {
                            x.IsDeleted = true;
                            x.DeletedBy = UserName;
                            x.DeletedTime = DateTime.Now;
                        });
                        _context.WorkingScheduleAttrs.UpdateRange(dataLoggers);                     
                        _context.SaveChanges();
                        msg.Title = "Xóa thành công";
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = "Bạn không có quyền xóa";
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra";
            }

            return Json(msg);
        }
    }
}
