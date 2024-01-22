using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Http;
using System.IO;
using Microsoft.AspNetCore.Hosting;
using MimeKit;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using III.Admin.Controllers;
using ESEIM;
using System.Globalization;
using III.Domain.Enums;
using SmartBreadcrumbs.Attributes;
using Microsoft.Extensions.Localization;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class VCTransporterController : BaseController
    {

        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<SharedResources> _sharedResources;


        public VCTransporterController(
            EIMDBContext context,
            IUploadService upload,
            IHostingEnvironment hostingEnvironment,
            IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _upload = upload;
            _hostingEnvironment = hostingEnvironment;
            _sharedResources = sharedResources;
        }

        [Breadcrumb("ViewData.CrumbCar", AreaName = "Admin", FromAction = "Index", FromController = typeof(SupplierHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbSuppHome"] = _sharedResources["COM_CRUMB_SUPP_HOME"];
            ViewData["CrumbCar"] = "Quản lý xe";
            return View("Index");
        }

        #region Index

        [HttpPost]
        public object JTable([FromBody] JTableModelTransporter jTablePara)
        {
            var isManager = jTablePara.IsOwned;
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var listCommon = _context.CommonSettings.Select(x => new { x.CodeSet, x.ValueSet });
            var query = (from a in _context.VcTransporters
                         join b2 in _context.CommonSettings on a.CustomType equals b2.CodeSet into b1
                         from b in b1.DefaultIfEmpty()
                         join c2 in _context.Customerss on a.OwnerCode equals c2.CusCode into c1
                         from c in c1.DefaultIfEmpty()
                         where (b == null || (b != null && b.IsDeleted == false && b.Group == EnumHelper<GroupUserEnum>.GetDisplayValue(GroupUserEnum.TRANSPOTER_WEIGHT)))
                         && ((string.IsNullOrEmpty(jTablePara.LicensePlate) || a.LicensePlate.ToLower().Contains(jTablePara.LicensePlate)))
                         && ((string.IsNullOrEmpty(jTablePara.Owner) || a.OwnerCode.ToLower().Contains(jTablePara.Owner)) && a.IsDeleted == false)
                         && ((string.IsNullOrEmpty(jTablePara.OwnerName) || (c != null && c.CusName.ToLower().Contains(jTablePara.OwnerName))))
                         && ((string.IsNullOrEmpty(jTablePara.CustomType) || (a.CustomType == jTablePara.CustomType)))
                         && ((string.IsNullOrEmpty(isManager) || !string.IsNullOrEmpty(a.OwnerCode) == bool.Parse(isManager)))

                         && (c == null || (c != null && c.IsDeleted == false))
                         select new TransporterRes
                         {
                             Id = a.Id,
                             LicensePlate = a.LicensePlate,
                             Owner = a.OwnerCode,
                             OwnerName = (c != null ? c.CusName : ""),
                             CustomType = a.CustomType,
                             CustomTypeTxt = (b != null ? b.ValueSet : ""),
                             InsurranceDuration = a.InsurranceDuration,
                             RegistryDuration = a.RegistryDuration,

                         });
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).AsNoTracking().ToList();
            var data1 = data.Skip(intBeginFor).Take(jTablePara.Length).ToList();

            var jdata = JTableHelper.JObjectTable(data1, jTablePara.Draw, count, "Id", "LicensePlate", "Owner", "OwnerName", "CustomType", "CustomTypeTxt", "InsurranceDuration", "RegistryDuration");
            return Json(jdata);
        }

        [HttpPost]
        public JsonResult GetOwnersHeader()
        {
            var msg = new JMessage() { Error = false };
            var data = (from a in _context.Customerss
                        where a.IsDeleted == false
                        select new
                        {
                            OwnerCode = a.CusCode,
                            OwnerName = a.CusName
                        }).ToList();
            msg.Object = data;
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetTransportWeight()
        {
            var msg = new JMessage() { Error = false };
            var data = (from a in _context.CommonSettings
                        where a.Group == EnumHelper<GroupUserEnum>.GetDisplayValue(GroupUserEnum.TRANSPOTER_WEIGHT)
                        select new
                        {
                            Code = a.CodeSet,
                            Name = a.ValueSet
                        }).ToList();
            msg.Object = data;
            return Json(msg);
        }

        [HttpPost]
        public object UploadImage(IFormFile fileUpload)
        {
            var msg = new JMessage();
            try
            {
                var upload = _upload.UploadImage(fileUpload);
                msg.Error = false;
                msg.Title = "";
                msg.Object = upload.Object;
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra khi upload file!";
                msg.Object = ex;
                return Json(msg);
            }
        }

        [HttpPost]
        public JsonResult InsertTransporter([FromBody] VcTransporter obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                if (!string.IsNullOrEmpty(obj.LicensePlate))
                {
                    var data = _context.VcTransporters.FirstOrDefault(x => x.LicensePlate.ToLower() == obj.LicensePlate.ToLower() && x.IsDeleted == false);
                    if (data == null)
                    {
                        obj.CreatedTime = DateTime.Now;
                        obj.CreatedBy = ESEIM.AppContext.UserName;
                        _context.VcTransporters.Add(obj);
                        _context.SaveChanges();
                        msg.Title = "Thêm xe thành công";
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = "Xe này đã thêm rồi, vui lòng chọn biển xe khác";
                    }
                }
                else
                {
                    _context.VcTransporters.Add(obj);
                    _context.SaveChanges();
                    msg.Title = "Thêm xe thành công";

                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Xảy ra lỗi khi thêm";
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateTransporter([FromBody] VcTransporter obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.VcTransporters.AsNoTracking().FirstOrDefault(x => x.Id == obj.Id && x.IsDeleted == false);
                if (data != null)
                {
                    if (!string.IsNullOrEmpty(obj.LicensePlate))
                    {
                        var data1 = _context.VcTransporters.AsNoTracking().FirstOrDefault(x => x.LicensePlate == obj.LicensePlate && x.IsDeleted == false && x.Id != data.Id);
                        if (data1 == null)
                        {
                            obj.UpdatedTime = DateTime.Now;
                            obj.UpdatedBy = ESEIM.AppContext.UserName;
                            _context.VcTransporters.Update(obj);
                            _context.SaveChanges();
                            msg.Title = "Cập nhật thông tin xe thành công";
                        }
                        else
                        {
                            msg.Error = true;
                            msg.Title = "Biển số này đang dùng cho xe khác";
                        }
                    }
                    else
                    {
                        obj.UpdatedTime = DateTime.Now;
                        obj.UpdatedBy = ESEIM.AppContext.UserName;
                        _context.VcTransporters.Update(obj);
                        _context.SaveChanges();
                        msg.Title = "Cập nhật thông tin xe thành công";
                    }

                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Không tồn tại thông tin xe này, vui lòng thử lại";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Xảy ra lỗi khi thêm";
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult DeleteTransporter(int Id)
        {
            var msg = new JMessage() { Error = false };

            try
            {
                var data = _context.VcTransporters.FirstOrDefault(x => x.Id == Id);
                if (data != null)
                {
                    data.IsDeleted = true;
                    data.UpdatedBy = ESEIM.AppContext.UserName;
                    _context.VcTransporters.Update(data);
                    _context.SaveChanges();
                    msg.Title = "Xóa thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Không tìm thấy dữ liệu cần xóa";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Xảy ra lỗi khi thêm";
            }
            return Json(msg);

        }

        [HttpPost]
        public JsonResult GetTransporterInfo(int Id)
        {
            var msg = new JMessage() { Error = false };

            try
            {
                var data = _context.VcTransporters.FirstOrDefault(x => x.Id == Id);
                msg.Object = data;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi lấy thông tin xe";
            }
            return Json(msg);

        }

        #endregion
        public class JTableModelTransporter : JTableModel
        {
            public string LicensePlate { get; set; }
            public string CustomType { get; set; }
            public string Owner { get; set; }
            public string OwnerName { get; set; }
            public string CustomerEmail { get; set; }
            public string CustomerGroup { get; set; }
            public string IsOwned { get; set; }
        }
        public class TransporterRes
        {
            public int Id { get; set; }
            public string LicensePlate { get; set; }
            public string Owner { get; set; }
            public string OwnerName { get; set; }
            public string CustomType { get; set; }
            public string CustomTypeTxt { get; set; }
            public string RegistryDuration { get; set; }
            public string InsurranceDuration { get; set; }

        }
    }
}
