using ESEIM.Models;
using ESEIM.Utils;
using III.Domain.Enums;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class WareHouseQRCodeManagerController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IStringLocalizer<EDMSQRCodeManagerController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;

        public WareHouseQRCodeManagerController(EIMDBContext context, IStringLocalizer<EDMSQRCodeManagerController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }

        [Breadcrumb("ViewData.CrumbEdmsQrCodeManage", AreaName = "Admin", FromAction = "Index", FromController = typeof(NomalListWareHouseHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuStore"] = _sharedResources["COM_CRUMB_MENU_STORE"];
            ViewData["CrumbNormalWHHome"] = _sharedResources["COM_BREAD_CRUMB_COMMON_CATE"];
            ViewData["CrumbEdmsQrCodeManage"] = _sharedResources["COM_CRUMB_EDMS_QRCODE_MANAGER"];
            return View();
        }

        [HttpGet]
        public object GetListWareHouse()
        {
            try
            {
                var rs = _context.EDMSWareHouses.Where(x => x.WHS_Flag != true).Select(x => new
                {
                    Code = x.WHS_Code,
                    Name = x.WHS_Name,
                    TypeName = "Kho",
                    Type = "WAREHOUSE",
                    x.CreatedBy,
                    x.CreatedTime,
                    Parent = "#",
                });
                return Json(rs);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        [HttpGet]
        public object GetListFloorWithListWareHouse(string listWareHouse)
        {
            var listWare = !string.IsNullOrEmpty(listWareHouse) ? listWareHouse.Split(",", StringSplitOptions.None) : new string[0];
            var query = from a in _context.EDMSFloors
                        join b in listWare on a.WHS_Code equals b
                        select new
                        {
                            Code = a.FloorCode,
                            Name = a.FloorName,
                            Type = "FLOOR",
                            TypeName = "Tầng",
                            //a.CreatedBy,
                            //a.CreatedTime,
                            Parent = a.WHS_Code,
                        };
            return query;
        }

        [HttpGet]
        public object GetListLineWithListFloor(string listFloor)
        {
            var listF = !string.IsNullOrEmpty(listFloor) ? listFloor.Split(",", StringSplitOptions.None) : new string[0];
            var query = from a in _context.EDMSLines
                        join b in listF on a.FloorCode equals b
                        select new
                        {
                            Code = a.LineCode,
                            Name = a.L_Text,
                            Type = "LINE",
                            TypeName = "Dãy",
                            //a.CreatedBy,
                            //a.CreatedTime,
                            Parent = a.FloorCode,
                        };
            return query;
        }

        [HttpGet]
        public object GetListRackWithListLine(string listLine)
        {
            var listL = !string.IsNullOrEmpty(listLine) ? listLine.Split(",", StringSplitOptions.None) : new string[0];
            var query = from a in _context.EDMSRacks
                        join b in listL on a.LineCode equals b
                        select new
                        {
                            Code = a.RackCode,
                            Name = a.RackName,
                            Type = "RACK",
                            TypeName = "Kệ",
                            //a.CreatedBy,
                            //a.CreatedTime,
                            Parent = a.LineCode,
                        };
            return query;
        }

        [HttpPost]
        public JsonResult SearchBox([FromBody]JTableBoxModel searchModel)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var fromDate = !string.IsNullOrEmpty(searchModel.FromDate) ? DateTime.ParseExact(searchModel.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var toDate = !string.IsNullOrEmpty(searchModel.ToDate) ? DateTime.ParseExact(searchModel.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var query = from a in _context.ObjectiverPackCovers.Where(x => !x.IsDeleted)
                            let createdBy = _context.Users.FirstOrDefault(x => x.UserName.Equals(a.CreatedBy)) != null ? _context.Users.FirstOrDefault(x => x.UserName.Equals(a.CreatedBy)).GivenName : a.CreatedBy
                            where ((fromDate == null) || (a.CreatedTime >= fromDate))
                            && ((toDate == null) || (a.CreatedTime <= toDate))
                            && (string.IsNullOrEmpty(searchModel.CabinetCode) || (a.ObjPackCode.Equals(searchModel.CabinetCode)))
                            select new
                            {
                                Code = a.ObjPackCode,
                                Name = a.Name,
                                Type = "BOX",
                                TypeName = "Hộp",
                                CreatedBy = createdBy,
                                a.CreatedTime,
                                Parent = "#",
                            };
                msg.Object = query;
            }
            catch (Exception ex)
            {
                msg.Object = ex.Message;
                msg.Error = true;
                //msg.Title = "Có lỗi khi tìm kiếm thùng!";
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

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

        public class JTableBoxModel
        {
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string CabinetCode { get; set; }
        }
    }
}