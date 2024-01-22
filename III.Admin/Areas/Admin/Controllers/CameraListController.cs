using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using Microsoft.Extensions.Options;
using ESEIM;
using Newtonsoft.Json.Linq;
using Microsoft.Extensions.Localization;
using System.Globalization;
using Microsoft.AspNetCore.Http;
using System.IO;
using Microsoft.AspNetCore.Hosting;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class CameraListController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly AppSettings _appSettings;
        private readonly IUploadService _upload;
        private readonly IStringLocalizer<CameraListController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;

        public CameraListController(EIMDBContext context, IUploadService upload, IOptions<AppSettings> appSettings, IStringLocalizer<CameraListController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _upload = upload;
            _appSettings = appSettings.Value;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }
        [Breadcrumb("Danh sách camera", AreaName = "Admin", FromAction = "Index", FromController = typeof(DashBoardController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            return View("Index");
        }
        public class CameraJtableModel : JTableModel
        {
            public string RoomName { get; set; }
            public string DepartmentCode { get; set; }
            public string DiskStatus { get; set; }
            public string Reason { get; set; }
        }

        [HttpPost]
        public object JTable([FromBody]CameraJtableModel jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            
            var query = from a in _context.CameraRooms
                        from b in _context.AdDepartments 
                        where (string.IsNullOrEmpty(jTablePara.RoomName) || a.RoomName.ToLower().Contains(jTablePara.RoomName.ToLower()))
                            && (string.IsNullOrEmpty(jTablePara.DepartmentCode) || a.DepartmentCode == jTablePara.DepartmentCode)
                            && (string.IsNullOrEmpty(jTablePara.DiskStatus) || a.DiskStatus.ToLower().Contains(jTablePara.DiskStatus.ToLower()))
                            && (string.IsNullOrEmpty(jTablePara.Reason) || a.SignalLossReason.ToLower().Contains(jTablePara.Reason.ToLower()))
                            && (!a.IsDeleted) && b.IsDeleted == false && b.IsEnabled == true 
                        select new
                        {
                            Id=a.Id,
                            Code = a.RoomId,
                            a.RoomName,
                            Department=b.Title,
                            a.LoginInformation,
                            Available = a.CameraAvailable+"/"+ a.CameraQuantity,
                            a.CameraAvailable,
                            a.CameraQuantity,
                            a.DiskStatus,
                            a.Series,
                            a.Capacity,
                            a.DiskSaveable,
                            a.SignalLossReason,
                            a.Note
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id","Code", "RoomName", "Department", "Series", "LoginInformation", "Available", "CameraAvailable", "CameraQuantity", "DiskStatus", "Capacity", "DiskSaveable", "SignalLossReason", "Note");
            return Json(jdata);
        }
        [HttpPost]
        public object GetDepartment()
        {
            var data = _context.AdDepartments.Where(x => !x.IsDeleted && x.IsEnabled).Select(x => new { Code = x.DepartmentCode, Name = x.Title }).ToList();
            return Json(data);
        }
        [HttpPost]
        public object GetItem(int id)
        {
            var getItem = _context.CameraRooms.FirstOrDefault(x => x.Id == id);
            return Json(getItem);
        }
        public class CameraRoommodel
        {
            public int Id { get; set; }
            public string RoomId { get; set; }
            public string RoomName { get; set; }
            public string DepartmentCode { get; set; }
            public int? CameraQuantity { get; set; }
            public string Series { get; set; }
            public string Capacity { get; set; }
            public string DiskStatus { get; set; }
            public string Note { get; set; }
            public int DiskSaveable { get; set; }
            public string LoginInformation { get; set; }
            public string ImageLink { get; set; }
        }
        [HttpPost]
        public object Insert(CameraRoommodel data, IFormFile images)
        {
            var msg = new JMessage { Title = "", Error = false };
            try
            {
                bool status;
                if(data.DiskSaveable==1)
                {
                    status = true;
                }
                else
                {
                    status = false;
                }
                if (images != null)
                {
                    var upload = _upload.UploadImage(images);
                    if (upload.Error)
                    {
                        msg.Error = true;
                        msg.Title = upload.Title;
                        return Json(msg);
                    }
                    else
                    {
                        data.ImageLink = "/uploads/Images/" + upload.Object.ToString();
                        
                    }
                }
                var cameraRoom = new CameraRoom
                {
                    RoomId=data.RoomId,
                    RoomName=data.RoomName,
                    DepartmentCode=data.DepartmentCode,
                    CameraAvailable=data.CameraQuantity,
                    CameraQuantity= data.CameraQuantity,
                    Capacity=data.Capacity ,
                    Note=data.Note,
                    LoginInformation=data.LoginInformation,
                    DiskStatus=data.DiskStatus,
                    DiskSaveable= status,
                    Series=data.Series,
                    ImageLink = data.ImageLink,
                    CreatedBy = User.Identity.Name,
                    CreatedTime = DateTime.Now

                };
                _context.CameraRooms.Add(cameraRoom);
                _context.SaveChanges();
                msg.Title = _stringLocalizer["Thêm thành công"];
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_ERR_ADD"];
            }
            return Json(msg);
        }

        [HttpPost]
        public object Update(CameraRoommodel data, IFormFile images)
        {
            var msg = new JMessage { Title = "", Error = false };
            try
            {
                var model = _context.CameraRooms.FirstOrDefault(x => x.Id == data.Id);
                if(model==null)
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["Hệ thống không tồn tại"];
                }
                else
                {
                    bool status;
                    if (data.DiskSaveable == 1)
                    {
                        status = true;
                    }
                    else
                    {
                        status = false;
                    }
                    if (images != null)
                    {
                        var upload = _upload.UploadImage(images);
                        if (upload.Error)
                        {
                            msg.Error = true;
                            msg.Title = upload.Title;
                            return Json(msg);
                        }
                        else
                        {
                            data.ImageLink = "/uploads/Images/" + upload.Object.ToString();

                        }
                    }
                    else
                    {
                        data.ImageLink = data.ImageLink;
                    }

                    model.RoomId = data.RoomId;
                    model.RoomName = data.RoomName;
                    model.DepartmentCode = data.DepartmentCode;
                    model.CameraAvailable = data.CameraQuantity;
                    model.CameraQuantity = data.CameraQuantity;
                    model.Capacity = data.Capacity;
                    model.Note = data.Note;
                    model.LoginInformation = data.LoginInformation;
                    model.DiskStatus = data.DiskStatus;
                    model.DiskSaveable = status;
                    model.Series = data.Series;
                    model.ImageLink = data.ImageLink;
                    model.CreatedBy = User.Identity.Name;
                    model.CreatedTime = DateTime.Now;


                    _context.CameraRooms.Update(model);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizer["Cập nhật thành công"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_ERR_ADD"];
            }
            return Json(msg);
        }
        [HttpPost]
        public object Delete(int id)
        {
            var mess = new JMessage { Error = false, Title = "" };
            try
            {
                var material = _context.CameraRooms.FirstOrDefault(x => x.Id == id);
                material.DeletedBy = User.Identity.Name;
                material.DeletedTime = DateTime.Now;
                material.IsDeleted = true;
                _context.CameraRooms.Update(material);
                _context.SaveChanges();
                //mess.Title = "Xóa sự cố thành công";
                mess.Title = _stringLocalizer["Xóa thành công"];
            }
            catch (Exception ex)
            {
                //mess.Title = "Xóa sự cố lỗi"+ex;
                mess.Title = _sharedResources["COM_ERR_DELETE"];
                mess.Error = true;
            }
            return Json(mess);
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
    }
}
