using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using ESEIM;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using III.Domain.Enums;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using DocumentFormat.OpenXml.Packaging;
using System.Text.RegularExpressions;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;
using System.Data;
using System.Diagnostics;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class DynamicRegistSurveyController : BaseController
    {
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly EIMDBContext _context;
        private readonly ILogger _logger;
        private readonly IActionLogService _actionLog;
        private readonly AppSettings _appSettings;
        private readonly IUploadService _upload;
        private readonly IRepositoryService _repositoryService;
        private readonly IStringLocalizer<DynamicRegistSurveyController> _stringLocalizer;
        private readonly IStringLocalizer<ActivityController> _activityLocalizer;
        private readonly IStringLocalizer<HrEmployeeController> _hrLocalizer;
        private readonly IStringLocalizer<StaffRegistrationController> _stringLocalizerSTRE;
        private readonly IStringLocalizer<SharedResources> _sharedResources;

        public DynamicRegistSurveyController(EIMDBContext context, IUploadService upload,
            ILogger<HrEmployeeController> logger, IOptions<AppSettings> appSettings,
            IHostingEnvironment hostingEnvironment, IActionLogService actionLog,
            IStringLocalizer<DynamicRegistSurveyController> stringLocalizer,
            IStringLocalizer<ActivityController> activityLocalizer,
            IStringLocalizer<SharedResources> sharedResources, IStringLocalizer<HrEmployeeController> hrLocalizer,
            IStringLocalizer<StaffRegistrationController> stringLocalizerSTRE, IRepositoryService repositoryService)
        {
            _context = context;
            _upload = upload;
            _logger = logger;
            _hostingEnvironment = hostingEnvironment;
            _actionLog = actionLog;
            _appSettings = appSettings.Value;
            _stringLocalizer = stringLocalizer;
            _activityLocalizer = activityLocalizer;
            _stringLocalizerSTRE = stringLocalizerSTRE;
            _sharedResources = sharedResources;
            _hrLocalizer = hrLocalizer;
            _repositoryService = repositoryService;
        }
        [Breadcrumb("ViewData.CrumbDynamicRegistSurvey", AreaName = "Admin", FromAction = "Index", FromController = typeof(EmployeeHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbEmployeeHome"] = _sharedResources["COM_CRUMB_EMPLOYEE_HOME"];
            ViewData["CrumbDynamicRegistSurvey"] = _sharedResources["COM_CRUMB_REGIST"];
            return View("Index");
        }
        #region DynamicCRUD

        // JTable phục vụ cho việc View dữ liệu lên web.
        [HttpPost]
        public object JTableDy([FromBody] JTableDynamic jTablePara)
        {
            try
            {
                // Way 1 using Where
                int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
                var query = from a in _context.EDMSDynamics
                            join b in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "STATUS_DYNAMIC") on a.Status equals b.CodeSet
                            into b1
                            from b in b1.DefaultIfEmpty()
                            join c in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "DYNAMIC_TYPE") on a.Type equals c.CodeSet
                            into c1
                            from c in c1.DefaultIfEmpty()
                            join d in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "REPEAT_DYNAMIC") on a.Repeat equals d.CodeSet
                            into d1
                            from d in d1.DefaultIfEmpty()
                            where a.Flag == true && (string.IsNullOrEmpty(jTablePara.Keyword) ||
                                                     !string.IsNullOrEmpty(a.Title) && a.Title.Contains(jTablePara.Keyword) ||
                                                     !string.IsNullOrEmpty(a.SurveyCode) &&
                                                     a.SurveyCode.Contains(jTablePara.Keyword))
                                                 && (string.IsNullOrEmpty(jTablePara.Type) || a.Type == jTablePara.Type)
                                                 && (string.IsNullOrEmpty(jTablePara.GroupCode) ||
                                                     a.GroupCode == jTablePara.GroupCode)
                            select new
                            {
                                a.Id,
                                a.GroupCode,
                                a.GroupName,
                                a.SurveyCode,
                                a.Title,
                                RepeatCode = a.Repeat,
                                RepeatName = d != null ? d.ValueSet : "",
                                a.Description,
                                TypeCode = a.Type,
                                TypeName = c != null ? c.ValueSet : "",
                                StatusCode = a.Status,
                                StatusName = b != null ? b.ValueSet : "",
                                a.Prioritized,
                                a.Flag
                            };
                var count = query.Count();
                var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
                var jObjectTable = JTableHelper.JObjectTable(data.ToList(), jTablePara.Draw, count, "Id", "SurveyCode", "Title", "RepeatCode", "RepeatName", "Description", "Flag", "TypeCode", "TypeName", "GroupName", "GroupCode", "StatusCode", "StatusName", "Prioritized");
                return Json(jObjectTable);
            }
            catch (Exception ex)
            {
                var jdata = JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "Id", "SurveyCode", "Title", "Repeat", "Description", "Flag", "Type", "GroupName", "GroupCode", "Status", "Prioritized");
                return Json(jdata);
            }
        }
        // Insert tạo bản ghi mới trong database. Chạy oke rồi!
        [HttpPost]
        public JsonResult InsertDynamic([FromBody] EdmsDynamic obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var checkExist = _context.EDMSDynamics.FirstOrDefault(x => x.Id == obj.Id); // assign variable and condition of this
                if (checkExist == null) // check exist of CommimentCode
                {
                    obj.Flag = true; // Set flag of cell = true 
                    obj.GroupCode = _context.CommonSettings?.FirstOrDefault(y => y.ValueSet == obj.GroupName)?.CodeSet;
                    _context.EDMSDynamics.Add(obj); // add to obj
                    _context.SaveChanges(); // save
                    msg.Object = obj.Id;
                    msg.Title = _sharedResources["COM_ADD_SUCCESS"]; // print notice on screen " Thêm thành công" if proviso true
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_MSG_EXIST_RECORD"];// if exist print notice on the screen
                }
            }
            catch
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR_ADD"]; // have error
            }
            return Json(msg);
        }
        // Xóa 1 row trong database : Chạy oke rồi 
        [HttpPost]
        public object DeleteDynamic(int Id)
        {
            var msg = new JMessage { Error = true };
            try
            {
                var data = _context.EDMSDynamics.FirstOrDefault(x => x.Id == Id);

                _context.EDMSDynamics.Remove(data);
                _context.SaveChanges();
                msg.Error = false;
                msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
                return Json(msg);


            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_ERR_DELETE"];//Không tìm thấy dịch vụ. Vui lòng làm mới lại trang
                return Json(msg);
            }
        }
        // Get item
        public JsonResult GetItemDynamic(int Id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var obj = _context.EDMSDynamics.FirstOrDefault(x => x.Id.Equals(Id));
                if (obj != null)
                {
                    msg.Object = new EdmsDynamic
                    {
                        Id = obj.Id,
                        GroupCode = obj.GroupCode,
                        SurveyCode = obj.SurveyCode,
                        Title = obj.Title,
                        Repeat = obj.Repeat,
                        Description = obj.Description,
                        Type = obj.Type,
                        Status = obj.Status,
                        Prioritized = obj.Prioritized,
                        Flag = obj.Flag,
                        GroupName = obj.GroupName,
                        ImageCover = obj.ImageCover,
                    };

                }
                else
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_MSG_NOT_EXIST_RECORD"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }
        // Update
        [HttpPost]
        public object UpdateDynamic([FromBody] EdmsDynamic obj)
        {
            var msg = new JMessage();
            try
            {
                var item = _context.EDMSDynamics.FirstOrDefault(x => x.Id.Equals(obj.Id));
                if (item != null)
                {

                    item.GroupCode = obj.GroupCode;
                    item.GroupName = obj.GroupName;
                    item.SurveyCode = obj.SurveyCode;
                    item.Title = obj.Title;
                    item.Repeat = obj.Repeat;
                    item.Description = obj.Description;
                    item.Type = obj.Type;
                    item.Status = obj.Status;
                    item.Prioritized = obj.Prioritized;
                    item.ImageCover = obj.ImageCover;

                    _context.EDMSDynamics.Update(item);
                    _context.SaveChanges();

                    msg.Error = false;
                    msg.Title = _sharedResources["COM_UPDATE_SUCCESS"]; //"Đã lưu thay đổi";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_MSG_NOT_EXIST_RECORD"]; //"Có lỗi xảy ra!";
                }

                return msg;
            }
            catch
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"]; //"Có lỗi xảy ra!";
                return msg;
            }
        }
        #endregion

        #region Attribute
        public JsonResult GetMealDynamic()
        {
            var data = _context.AttrSetups.Where(x => !x.IsDeleted && x.AttrGroup.Equals("REGIST_MEAL_COMPANY"))
                        .Select(x => new
                        {
                            Group = x.AttrGroup,
                            Code = x.AttrCode,
                            Name = x.AttrName,
                            DataType = x.AttrDataType,
                            x.AttrUnit,

                        });
            var dataRs = (from a in data
                          join b in _context.CommonSettings.Where(x => !x.IsDeleted) on a.AttrUnit equals b.CodeSet into b1
                          from b2 in b1.DefaultIfEmpty()
                          let user = _context.Users.FirstOrDefault(x => x.Active && x.UserName.Equals(User.Identity.Name))
                          select new
                          {
                              a.Group,
                              a.Code,
                              a.Name,
                              a.DataType,
                              Unit = b2 != null ? b2.ValueSet : "",
                          }).ToList();
            return Json(dataRs);
        }
        public JsonResult GetTravelDynamic()
        {
            var data = _context.AttrSetups.Where(x => !x.IsDeleted && x.AttrGroup.Equals("REGIST_TRAVEL_COMPANY"))
                       .Select(x => new
                       {
                           Group = x.AttrGroup,
                           Code = x.AttrCode,
                           Name = x.AttrName,
                           DataType = x.AttrDataType,
                           x.AttrUnit,

                       });
            var dataRs = (from a in data
                          join b in _context.CommonSettings.Where(x => !x.IsDeleted) on a.AttrUnit equals b.CodeSet into b1
                          from b2 in b1.DefaultIfEmpty()
                          let user = _context.Users.FirstOrDefault(x => x.Active && x.UserName.Equals(User.Identity.Name))
                          select new
                          {
                              a.Group,
                              a.Code,
                              a.Name,
                              a.DataType,
                              Unit = b2 != null ? b2.ValueSet : "",
                          }).ToList();
            return Json(dataRs);
        }
        public JsonResult GetSportDynamic()
        {
            var data = _context.AttrSetups.Where(x => !x.IsDeleted && x.AttrGroup.Equals("REGIST_SPORT_COMPANY"))
                       .Select(x => new
                       {
                           Group = x.AttrGroup,
                           Code = x.AttrCode,
                           Name = x.AttrName,
                           DataType = x.AttrDataType,
                           x.AttrUnit,

                       });
            var dataRs = (from a in data
                          join b in _context.CommonSettings.Where(x => !x.IsDeleted) on a.AttrUnit equals b.CodeSet into b1
                          from b2 in b1.DefaultIfEmpty()
                          let user = _context.Users.FirstOrDefault(x => x.Active && x.UserName.Equals(User.Identity.Name))
                          select new
                          {
                              a.Group,
                              a.Code,
                              a.Name,
                              a.DataType,
                              Unit = b2 != null ? b2.ValueSet : "",
                          }).ToList();
            return Json(dataRs);
        }
        public JsonResult GetStudyDynamic()
        {
            var data = _context.AttrSetups.Where(x => !x.IsDeleted && x.AttrGroup.Equals("REGIST_STUDY_COMPANY"))
                       .Select(x => new
                       {
                           Group = x.AttrGroup,
                           Code = x.AttrCode,
                           Name = x.AttrName,
                           DataType = x.AttrDataType,
                           x.AttrUnit,

                       });
            var dataRs = (from a in data
                          join b in _context.CommonSettings.Where(x => !x.IsDeleted) on a.AttrUnit equals b.CodeSet into b1
                          from b2 in b1.DefaultIfEmpty()
                          let user = _context.Users.FirstOrDefault(x => x.Active && x.UserName.Equals(User.Identity.Name))
                          select new
                          {
                              a.Group,
                              a.Code,
                              a.Name,
                              a.DataType,
                              Unit = b2 != null ? b2.ValueSet : "",
                          }).ToList();
            return Json(dataRs);
        }

        public JsonResult GetDynamicAttributes(string groupCode)
        {
            var data = _context.AttrSetups.Where(x => !x.IsDeleted && x.AttrGroup.Equals(groupCode))
                .Select(x => new
                {
                    Group = x.AttrGroup,
                    Code = x.AttrCode,
                    Name = x.AttrName,
                    DataType = x.AttrDataType,
                    x.AttrUnit,

                });
            var dataRs = (from a in data
                          join b in _context.CommonSettings.Where(x => !x.IsDeleted) on a.AttrUnit equals b.CodeSet into b1
                          from b2 in b1.DefaultIfEmpty()
                          let user = _context.Users.FirstOrDefault(x => x.Active && x.UserName.Equals(User.Identity.Name))
                          select new
                          {
                              a.Group,
                              a.Code,
                              a.Name,
                              a.DataType,
                              Unit = b2 != null ? b2.ValueSet : "",
                          }).ToList();
            return Json(dataRs);
        }

        public JsonResult GetlistRegist()
        {
            var data = _context.EDMSDynamics.Where(x => x.Flag == true)
                        .Select(x => new
                        {
                            x.SurveyCode,
                            x.Title,
                            Repeat = x.Repeat,
                            x.Prioritized,
                            x.Type,
                            x.GroupCode,
                            x.GroupName,
                            x.ImageCover
                        }).OrderBy(x => x.Prioritized).ToList();
            return Json(data);
        }

        public JsonResult GetDataAllRegist(string surveyCode)
        {
            var data = _context.EDMSDynamicDatas.FirstOrDefault(x =>
                x.SurveyCode == surveyCode && x.UserName == User.Identity.Name);
            return Json(data?.AttrValue);

        }

        [HttpPost]
        public JsonResult InsertRegist([FromBody] EdmsDynamicData obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var model = _context.EDMSDynamicDatas.FirstOrDefault(x => x.SurveyCode == obj.SurveyCode && x.UserName == User.Identity.Name);
                if (model == null)
                {
                    var data = new EdmsDynamicData
                    {
                        SurveyCode = obj.SurveyCode,
                        AttrValue = obj.AttrValue,
                        UserName = User.Identity.Name
                    };
                    _context.EDMSDynamicDatas.Add(data);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                    //msg.Title = _sharedResources["LMS_PRACTICE_TEST_MSG_SAVE_SUCCESS"];// "Log thành công"; 
                }
                else
                {
                    model.AttrValue = obj.AttrValue;
                    _context.EDMSDynamicDatas.Update(model);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR_ADD"];
            }
            return Json(msg);
        }

        #endregion

        #region Stat Procedure
        [HttpPost]
        public List<EdmsDynamicSearchModel> GetStatProcedure(string input)
        {
            string[] param = { "@Input" };
            object[] val = { input };

            var rs = _repositoryService.GetDataTableProcedureSql("P_SEARCH_DYNAMIC_SURVEY_REGIST_DATA", param, val);
            var query = CommonUtil.ConvertDataTable<EdmsDynamicSearchModel>(rs);
            return query;
        }
        #endregion
       
        #region Model
        public class JTableDynamic : JTableModel
        {
            public string Keyword { get; set; }
            public string Type { get; set; }
            public string GroupCode { get; set; }
        }


        public class JTableAttrModel : JTableModel
        {
            public int ID { get; set; }
            public string AttrCode { get; set; }
            public string AttrType { get; set; }
            public string AttrName { get; set; }

            public string AttrDataType { get; set; }

            public string AttrUnit { get; set; }

            public string AttrGroup { get; set; }

            public string Note { get; set; }
            public string WorkFlowCode { get; set; }
        }
        public class TemplateModel : JTableModel
        {
            public string AttrGroup { get; set; }
        }
        #endregion

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new Newtonsoft.Json.Linq.JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_activityLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_hrLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerSTRE.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .DistinctBy(x => x.Name);
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion

        #region Combobox
        [HttpPost]

        public JsonResult GetTypeDynamic()
        {
            var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals("DYNAMIC_TYPE")) // Kiểu phiếu
                        .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            var rs = data;

            return Json(rs);
        }
        public JsonResult GetStatusDynamic()
        {
            var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals("STATUS_DYNAMIC")) //Trạng thái
                        .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            var rs = data;

            return Json(rs);
        }
        public JsonResult GetRepeatDynamic()
        {
            var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals("REPEAT_DYNAMIC")) //Lặp lại
                        .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            var rs = data;

            return Json(rs);
        }

        #endregion
    }

}