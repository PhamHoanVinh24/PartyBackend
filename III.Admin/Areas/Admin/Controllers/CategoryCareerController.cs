using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using System.Globalization;

using OpenXmlPowerTools;
using Syncfusion.XlsIO;
using System.IO;

using Color = Syncfusion.Drawing.Color;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class CategoryCareerController : BaseController
    {
        private readonly IUploadService _upload;
        private readonly IStringLocalizer<CategoryCareerController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;

        private readonly EIMDBContext _context;
        public CategoryCareerController(EIMDBContext context, IUploadService upload, IStringLocalizer<CategoryCareerController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _upload = upload;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }
        [Breadcrumb("ViewData.Title", AreaName = "Admin", FromAction = "Index", FromController = typeof(EmployeeHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbEmployeeHome"] = _sharedResources["COM_CRUMB_EMPLOYEE_HOME"];
            ViewData["Title"] = _stringLocalizer["CC_CRUMB_LIST_CAREER"];
            return View();
        }

        public class CareerJTableModel : JTableModel
        {
            public int? Id { get; set; }
            public string CareerCode { get; set; }
            public string CareerGroup { get; set; }
            public string CareerName { get; set; }
            public string Note { get; set; }
            public string CareerType { get; set; }
            public string PayGradesCode { get; set; }

        }
        public class CareerInsert
        {
            public int? Id { get; set; }
            public string CareerCode { get; set; }
            public string CareerGroup { get; set; }
            public string CareerName { get; set; }
            public string Note { get; set; }
            public string CareerType { get; set; }
            public string PayGradesCode { get; set; }
        }
        public class CommonInsert
        {
            public int SettingId { get; set; }
            public string CodeSet { get; set; }
            public string ValueSet { get; set; }
        }
        #region combobox

        [HttpPost]
        public object GetGroup()
        {
            //Lấy dữ liệu nhóm nghề
            var data = _context.CommonSettings.Where(x => x.Group.Equals("CAREER_GROUP") && !x.IsDeleted).Select(x => new { Id = x.SettingID, Code = x.CodeSet, Name = x.ValueSet }).AsNoTracking().ToList();
            return data;
        }
        [HttpPost]
        public object GetTypeD()
        {
            //Lấy dữ liệu loại nghề
            var data = _context.CommonSettings.Where(x => x.Group.Equals("CAREER_TYPE") && !x.IsDeleted).Select(x => new { Id = x.SettingID, Code = x.CodeSet, Name = x.ValueSet }).AsNoTracking().ToList();
            return data;
        }
        [HttpPost]
        public object GetPayGradesCode()
        {
            //Lấy dữ liệu ngạch lương
            var data = _context.PaySheets.Where(x => !x.IsDeleted).Select(x => new { Id = x.Id, Code = x.PayGradesCode, Name = x.PayGradesName }).DistinctBy(x => x.Code).ToList();
            return data;
        }


        #endregion

        [HttpPost]
        public object JTable([FromBody] CareerJTableModel jTablePara)
        {
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;

            var query = from a in _context.CategoryCareers
                        let ListScale = (_context.PayScaleDetails.Where(x => !x.IsDeleted && x.ScaleCode.Equals(a.PayGradesCode)).Select(x => new { Coeff = "Hệ số " + x.Coeff + " : " + "<span style='color:#4868aa'>" + x.Ranges + "</span>" })).OrderBy(x => x.Coeff).Select(x => x.Coeff)
                        where a.IsDeleted == false
                        && (string.IsNullOrEmpty(jTablePara.CareerCode) || a.CareerCode.ToLower().Contains(jTablePara.CareerCode.ToLower()))
                        && (string.IsNullOrEmpty(jTablePara.CareerName) || a.CareerName.ToLower().Contains(jTablePara.CareerName.ToLower()))
                        select new
                        {
                            a.Id,
                            a.CareerCode,
                            CareerGroup = a.CareerGroup + " <br/> - " + (_context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(a.CareerGroup)).ValueSet),
                            CareerType = a.CareerType + " <br/> - " + (_context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(a.CareerType)).ValueSet),
                            a.CareerName,
                            a.Note,
                            List = a.PayGradesCode + " ( " + string.Join(" - ", ListScale) + " ) ",
                        };

            int count = query.Count();
            var data = query.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length);
            var jdata = JTableHelper.JObjectTable(data.ToList(), jTablePara.Draw, count, "Id", "CareerCode", "List", "CareerGroup", "CareerName", "CareerType", "PayGradesCode", "Note");
            return Json(jdata);
        }
        [HttpPost]
        public object JTableCareerGroup([FromBody] CareerJTableModel jTablePara)
        {
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;

            var query = from a in _context.CommonSettings
                        where a.IsDeleted == false && a.Group.Equals("CAREER_GROUP")
                        select new
                        {
                            a.SettingID,
                            a.CodeSet,
                            a.ValueSet,
                            a.Group,
                        };
            int count = query.Count();
            var data = query.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length);
            var jdata = JTableHelper.JObjectTable(data.ToList(), jTablePara.Draw, count, "SettingID", "CodeSet", "ValueSet", "Group");
            return Json(jdata);
        }
        [HttpPost]
        public object JTableCareerRange([FromBody] CareerJTableModel jTablePara)
        {
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;

            var query = from a in _context.PayScales

                        where a.IsDeleted == false
                        select new
                        {
                            a.Id,
                            a.PayScaleCode,
                        };
            int count = query.Count();
            var data = query.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length);
            var jdata = JTableHelper.JObjectTable(data.ToList(), jTablePara.Draw, count, "Id", "PayScaleCode");
            return Json(jdata);
        }
        [HttpPost]
        public object JTableCareerType([FromBody] CareerJTableModel jTablePara)
        {
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;

            var query = from a in _context.CommonSettings

                        where a.IsDeleted == false && a.Group.Equals("CAREER_TYPE")
                        select new
                        {
                            a.SettingID,
                            a.CodeSet,
                            a.ValueSet,
                            a.Group,
                        };
            int count = query.Count();
            var data = query.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length);
            var jdata = JTableHelper.JObjectTable(data.ToList(), jTablePara.Draw, count, "SettingID", "CodeSet", "ValueSet", "Group");
            return Json(jdata);
        }

        [HttpPost]
        public JsonResult Insert([FromBody] CareerInsert obj)
        {

            var msg = new JMessage { Title = "", Error = false };
            try
            {
                var data = _context.CategoryCareers.FirstOrDefault(x => !x.IsDeleted && x.CareerCode == obj.CareerCode);
                var data1 = _context.CareerCatScales.FirstOrDefault(x => !x.IsDeleted && x.CareerCode == obj.CareerCode);

                if (data == null && data1 == null)
                {
                    var Career = new CategoryCareer()
                    {
                        CareerCode = obj.CareerCode,
                        CareerName = obj.CareerName,
                        CareerGroup = obj.CareerGroup,
                        CareerType = obj.CareerType,
                        Note = obj.Note,
                        PayGradesCode = obj.PayGradesCode,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now

                    };
                    var CareerCat = new CareerCatScale()
                    {
                        CareerCode = obj.CareerCode,
                        PayScaleCode = obj.PayGradesCode,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now

                    };
                    _context.CareerCatScales.Add(CareerCat);
                    _context.CategoryCareers.Add(Career);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["CC_MSG_RECORD_EXIST"];
                }
            }
            catch (Exception ex)
            {
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Error = true;
            }
            return Json(msg);
        }

        /*[HttpPost]
        public JsonResult InsertCareerCatScale([FromBody] CareerCatScale obj)
        {
            var msg = new JMessage { Title = "", Error = false };
            try
            {
                var data1 = _context.CareerCatScales.FirstOrDefault(x => x.Id == obj.Id);

                if (data1 == null)
                {

                    var CareerCat = new CareerCatScale()
                    {
                        CareerCode = obj.CareerCode,
                        PayScaleCode = obj.PayScaleCode,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now

                    };
                    _context.CareerCatScales.Add(CareerCat);
                    _context.SaveChanges();
                    msg.Title = "Thêm thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Lỗi";
                }
            }
            catch
            {
                msg.Title = "Thêm thất bại";
                msg.Error = true;
            }
            return Json(msg);
        }
*/
        [HttpPost]
        public JsonResult GetListCategory()
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                msg.Object = (from a in _context.CategoryCareers
                              where a.IsDeleted == false
                              select new
                              {
                                  Id = a.Id,
                                  Code = a.CareerCode,
                                  Name = a.CareerName,
                                  fullname = a.CareerCode + " - " + a.CareerName
                              }).ToList();

            }
            catch
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        #region Nhóm nghề
        [HttpPost]
        public JsonResult InsertCareerGroup([FromBody] CommonInsert obj)
        {

            var msg = new JMessage { Title = "", Error = false };
            try
            {
                var data = _context.CommonSettings.FirstOrDefault(x => x.SettingID == obj.SettingId);
                if (data == null)
                {

                    var CareerG = new CommonSetting()
                    {
                        CodeSet = obj.CodeSet,
                        ValueSet = obj.ValueSet,
                        Group = "CAREER_GROUP",
                        IsDeleted = false,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now

                    };
                    _context.CommonSettings.Add(CareerG);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["CC_MSG_ERR"];
                }


            }
            catch
            {
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Error = true;
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult UpdateCareerGroup([FromBody] CommonInsert obj)
        {
            var msg = new JMessage { Title = "", Error = false };
            try
            {
                var model = _context.CommonSettings.FirstOrDefault(x => x.SettingID == obj.SettingId);

                if (model != null)
                {

                    model.CodeSet = obj.CodeSet;
                    model.ValueSet = obj.ValueSet;
                    model.Group = "CAREER_GROUP";
                    model.UpdatedBy = ESEIM.AppContext.UserName;
                    model.UpdatedTime = DateTime.Now;
                    _context.CommonSettings.Update(model);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                }
                else
                {
                    msg.Title = _stringLocalizer["CC_MSG_ERR"];
                    msg.Error = true;
                }
            }
            catch
            {
                msg.Title = _stringLocalizer["CC_MSG_ERR"];
                msg.Error = true;
            }
            return Json(msg);
        }
        [HttpPost]
        public object DeleteCareerGroup([FromBody] int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var obj = _context.CommonSettings.FirstOrDefault(x => x.SettingID == id && !x.IsDeleted);
                if (obj != null)
                {
                    obj.DeletedBy = ESEIM.AppContext.UserName;
                    obj.DeletedTime = DateTime.Now;
                    obj.IsDeleted = true;
                    _context.CommonSettings.Update(obj);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["CC_MSG_GROUP_NO_EXIST"]; //danh mục không tồn tại trong hệ thống

                }
                return Json(msg);

            }
            catch
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"]; // có lỗi khi xóa
                return Json(msg);
            }

        }
        #endregion 
        #region Loại nghề
        [HttpPost]
        public JsonResult InsertCareerType([FromBody] CommonInsert obj)
        {

            var msg = new JMessage { Title = "", Error = false };
            try
            {
                var data = _context.CommonSettings.FirstOrDefault(x => x.SettingID == obj.SettingId);
                if (data == null)
                {

                    var CareerG = new CommonSetting()
                    {
                        CodeSet = obj.CodeSet,
                        ValueSet = obj.ValueSet,
                        Group = "CAREER_TYPE",
                        IsDeleted = false,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now

                    };
                    _context.CommonSettings.Add(CareerG);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["CC_MSG_ERR"];
                }


            }
            catch
            {
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Error = true;
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult UpdateCareerType([FromBody] CommonInsert obj)
        {
            var msg = new JMessage { Title = "", Error = false };
            try
            {
                var model = _context.CommonSettings.FirstOrDefault(x => x.SettingID == obj.SettingId);

                if (model != null)
                {

                    model.CodeSet = obj.CodeSet;
                    model.ValueSet = obj.ValueSet;
                    model.Group = "CAREER_TYPE";
                    model.UpdatedBy = ESEIM.AppContext.UserName;
                    model.UpdatedTime = DateTime.Now;
                    _context.CommonSettings.Update(model);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                }
                else
                {
                    msg.Title = _stringLocalizer["CC_MSG_ERR"];
                    msg.Error = true;
                }
            }
            catch
            {
                msg.Title = _stringLocalizer["CC_MSG_ERR"];
                msg.Error = true;
            }
            return Json(msg);
        }
        [HttpPost]
        public object DeleteCareerType([FromBody] int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var obj = _context.CommonSettings.FirstOrDefault(x => x.SettingID == id && !x.IsDeleted);
                if (obj != null)
                {
                    obj.DeletedBy = ESEIM.AppContext.UserName;
                    obj.DeletedTime = DateTime.Now;
                    obj.IsDeleted = true;
                    _context.CommonSettings.Update(obj);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_DELETE_SUCCESS"]; //Xóa danh mục thành công
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["CC_MSG_GROUP_NO_EXIST"]; //danh mục không tồn tại trong hệ thống

                }
                return Json(msg);

            }
            catch
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"]; // có lỗi khi xóa
                return Json(msg);
            }

        }
        #endregion
        [HttpPost]
        public JsonResult Update([FromBody] CareerInsert obj)
        {
            var msg = new JMessage { Title = "", Error = false };
            try
            {
                var data = _context.CategoryCareers.FirstOrDefault(x => !x.IsDeleted && x.Id == obj.Id);
                var data1 = _context.CareerCatScales.FirstOrDefault(x => !x.IsDeleted && x.CareerCode == obj.CareerCode);

                if (data != null)
                {
                    data.CareerCode = obj.CareerCode;
                    data.CareerName = obj.CareerName;
                    data.CareerGroup = obj.CareerGroup;
                    data.CareerType = obj.CareerType;
                    data.Note = obj.Note;
                    data.PayGradesCode = obj.PayGradesCode;
                    data.UpdatedBy = ESEIM.AppContext.UserName;
                    data.UpdatedTime = DateTime.Now;

                    if (data1 != null)
                    {
                        data1.CareerCode = obj.CareerCode;
                        data1.PayScaleCode = obj.PayGradesCode;
                        data1.UpdatedBy = ESEIM.AppContext.UserName;
                        data1.UpdatedTime = DateTime.Now;

                        _context.CareerCatScales.Update(data1); 
                    }
                    _context.CategoryCareers.Update(data);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];

                }
                else
                {
                    msg.Title = _stringLocalizer["Bản ghi không tồn tại"]; //CC_MSG_RECORD_NOT_EXIST
                    msg.Error = true;
                }
            }
            catch (Exception ex)
            {
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Error = true;
            }
            return Json(msg);
        }
        [HttpPost]
        public object Delete([FromBody] int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var obj = _context.CategoryCareers.FirstOrDefault(x => x.Id.Equals(id) && !x.IsDeleted);
                if (obj != null)
                {
                    obj.DeletedBy = ESEIM.AppContext.UserName;
                    obj.DeletedTime = DateTime.Now;
                    obj.IsDeleted = true;
                    _context.CategoryCareers.Update(obj);

                    var data1 = _context.CareerCatScales.FirstOrDefault(x => !x.IsDeleted && x.CareerCode == obj.CareerCode);
                    if (data1 != null)
                    {
                        data1.DeletedBy = ESEIM.AppContext.UserName;
                        data1.DeletedTime = DateTime.Now;
                        data1.IsDeleted = true;
                        _context.CareerCatScales.Update(data1);
                    }
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_DELETE_SUCCESS"]; //Xóa danh mục thành công
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["CC_CRUMB_LIST_CAREER"]; //danh mục không tồn tại trong hệ thống

                }
                return Json(msg);

            }
            catch
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"]; // có lỗi khi xóa
                return Json(msg);
            }

        }

        [HttpPost]
        public object GetItem([FromBody] int id)
        {
            var data = _context.CategoryCareers.FirstOrDefault(x => x.Id.Equals(id));
            return Json(data);
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
        //xuất Exel


    }
}