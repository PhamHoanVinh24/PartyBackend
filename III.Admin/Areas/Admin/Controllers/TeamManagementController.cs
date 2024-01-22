using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using Microsoft.AspNetCore.Http;
using System.Globalization;
using System.IO;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore.Internal;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class TeamManagementController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<TeamManagementController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public TeamManagementController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment, IStringLocalizer<TeamManagementController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _upload = upload;
            _hostingEnvironment = hostingEnvironment;
            _sharedResources = sharedResources;
            _stringLocalizer = stringLocalizer;
        }
        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public JsonResult GetTeamStatuss()
        {
            var data = (from a in _context.CommonSettings
                        where a.IsDeleted == false
                        && a.Group == "TEAM_STATUS"
                        select new
                        {
                            Code = a.CodeSet,
                            Name = a.ValueSet
                        }).ToList();
            return Json(data);
        }
        [HttpPost]
        public JsonResult GetUsers()
        {
            var data = (from a in _context.Users
                        where a.Active == true
                        select new
                        {
                            Id = a.Id,
                            Name = a.GivenName
                        }).ToList();
            return Json(data);
        }
        [HttpPost]
        public JsonResult GetStaff()
        {
            var data = (from a in _context.HREmployees.Where(x => x.flag != 0)
                        select new
                        {
                            Id = a.Id,
                            Name = a.fullname
                        }).ToList();
            return Json(data);
        }
        [HttpGet]
        public JsonResult GetListMember(string listMember)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var listmember = !string.IsNullOrEmpty(listMember) ? listMember.Split(",") : new string[0];
                var data = from a in _context.Users
                           where listmember.Any(b => a.Id == b)
                           select new
                           {
                               a.GivenName,
                               a.Active
                           };
                msg.Object = data;
            }
            catch (Exception ex)
            {
                //msg.Title = "Có lỗi khi lấy dữ liệu";
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_ERR"));
                msg.Object = ex.Message;
                msg.Error = true;
            }
            return Json(msg);
        }
        [HttpPost]
        public object JTable([FromBody]ProjectTeamsSearch jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.Teams
                        where a.IsDeleted == false
                        && (string.IsNullOrEmpty(jTablePara.TeamName) || a.TeamName.ToLower().Contains(jTablePara.TeamName.ToLower()))
                        && (string.IsNullOrEmpty(jTablePara.Leader) || a.Leader == jTablePara.Leader)
                        && (string.IsNullOrEmpty(jTablePara.Member) || a.Members.ToLower().Contains(jTablePara.Member.ToLower()))
                        && (string.IsNullOrEmpty(jTablePara.Status) || a.Status == jTablePara.Status)
                        select new
                        {
                            a.Id,
                            a.TeamCode,
                            a.TeamName,
                            a.Leader,
                            a.Status,
                            a.Members,
                        };
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).Select(x => new
            {
                x.Id,
                x.TeamCode,
                x.TeamName,
                x.Members,
                StatusName = _context.CommonSettings.FirstOrDefault(y => y.CodeSet == x.Status).ValueSet ?? "",
                LeaderName = _context.Users.FirstOrDefault(y => y.Id == x.Leader).GivenName ?? "",
            }).AsNoTracking().ToList();
            var count = query.Count();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "TeamCode", "TeamName", "Members", "LeaderName", "StatusName");
            return Json(jdata);
        }
        [HttpPost]
        public JsonResult Insert([FromBody]InsertModel obj1)
        {
            var msg = new JMessage { Error = false, Title = "" };

            try
            {
                Team obj = obj1.Header;
                obj.TeamCode = Guid.NewGuid().ToString();
                obj.CreatedTime = DateTime.Now;
                obj.CreatedBy = ESEIM.AppContext.UserName;
                _context.Teams.Add(obj);
                _context.SaveChanges();
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_ADD_SUCCESS"), CommonUtil.ResourceValue("TEAM_TITLE_TEAM"));
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi khi thêm!";
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_ADD_FAILED"), CommonUtil.ResourceValue("TEAM_TITLE_TEAM"));
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult Update([FromBody]UpdateModel obj1)
        {
            var msg = new JMessage { Error = false, Title = "" };

            try
            {
                var data = _context.Teams.FirstOrDefault(x => x.TeamCode == obj1.TeamCode);
                if (data != null)
                {
                    var header = obj1.Header;
                    data.TeamName = header.TeamName;
                    data.Leader = header.Leader;
                    data.Status = header.Status;
                    data.Description = header.Description;
                    data.Members = header.Members;
                    data.UpdatedTime = DateTime.Now;
                    data.UpdatedBy = ESEIM.AppContext.UserName;
                    _context.SaveChanges();
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_UPDATE_SUCCESS"), CommonUtil.ResourceValue("TEAM_TITLE_TEAM"));
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Dữ liệu không tồn tại";
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_EMPLOYEE_NOT_EXITS"), CommonUtil.ResourceValue("TEAM_TITLE_TEAM"));
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi khi cập nhập!";
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_UPDATE_FAILED"), CommonUtil.ResourceValue("TEAM_TITLE_TEAM"));
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Delete(int Id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.Teams.FirstOrDefault(x => x.IsDeleted == false && x.Id == Id);
                if (data != null)
                {
                    data.IsDeleted = true;
                    data.DeletedTime = DateTime.Now;
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    _context.SaveChanges();
                    return Json(new JMessage() { Error = false, Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_SUCCESS"), CommonUtil.ResourceValue("TEAM_TITLE_TEAM")) });
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Dữ liệu không tồn tại";
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_NOT_EXITS"), CommonUtil.ResourceValue("TEAM_TITLE_TEAM"));
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi khi xóa";
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_FAIL"), CommonUtil.ResourceValue("TEAM_TITLE_TEAM")) ;
        }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult GetItem(int Id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {

                ResModel resModel = new ResModel();
                var data = _context.Teams.FirstOrDefault(x => x.IsDeleted == false && x.Id == Id);
                resModel.Header = data;
                if (data != null)
                {
                    var listMemberInTeam = !string.IsNullOrEmpty(data.Members) ? data.Members.Split(",") : new string[0];
                    var list = _context.Users.Where(x => x.Active && listMemberInTeam.Any(y => x.Id == y)).Select(x => new mList
                    {
                        Id = x.Id,
                        Name = x.GivenName
                    }).AsNoTracking().ToList();
                    resModel.List = list;
                }
                msg.Object = resModel;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi khi lấy dữ liệu!";
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_ERR"));
            }
            return Json(msg);
        }
        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }).Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion

        public class InsertModel
        {
            public Team Header { get; set; }
            public List<mList> List { get; set; }
        }
        public class UpdateModel
        {
            public string TeamCode { get; set; }
            public Team Header { get; set; }
            public List<mList> List { get; set; }
        }

        public class ResModel
        {
            public ResModel()
            {
                List = new List<mList>();
            }
            public Team Header { get; set; }
            public List<mList> List { get; set; }
        }
        public class mList
        {
            public string Id { get; set; }
            public string Name { get; set; }
            //public string Table { get; set; }
        }
        public class ProjectTeamsSearch : JTableModel
        {
            public string TeamName { get; set; }
            public string Leader { get; set; }
            public string Member { get; set; }

            public string Status { get; set; }
        }
    }
}