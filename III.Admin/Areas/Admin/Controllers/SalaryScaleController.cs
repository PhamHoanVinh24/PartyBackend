using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using III.Domain.Enums;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class SalaryScaleController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IStringLocalizer<ContactSupplierController> _stringLocalizer;
        private readonly IStringLocalizer<SalaryScaleController> _stringLocalizerSS;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public SalaryScaleController(EIMDBContext context, IUploadService upload, IStringLocalizer<ContactSupplierController> stringLocalizer,
            IStringLocalizer<SalaryScaleController> stringLocalizerSS, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _upload = upload;
            _stringLocalizer = stringLocalizer;
            _stringLocalizerSS = stringLocalizerSS;
            _sharedResources = sharedResources;
        }
        [Breadcrumb("ViewData.CrumbSalaryScale", AreaName = "Admin", FromAction = "Index", FromController = typeof(EmployeeHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbEmployeeHome"] = _sharedResources["COM_CRUMB_EMPLOYEE_HOME"];
            ViewData["CrumbSalaryScale"] = _sharedResources["COM_MSG_MANAGER_WAGE"];
            return View();
        }

        public class PayScaleJtable : JTableModel
        {
            public int ID { get; set; }
            public string PayScaleCode { get; set; }
            public decimal? PayBase { get; set; }
            public string Unit { get; set; }
            public string CareerCode { get; set; }
            public string CareerTitle { get; set; }
            public string Certificate { get; set; }
            public string Major { get; set; }


        }
        public class PayScaleDetailJtable : JTableModel
        {
            public int ID { get; set; }
            public string ScaleCode { get; set; }
            public string Ranges { get; set; }
            public decimal? Coeff { get; set; }
            public string CareerCode { get; set; }
        }

        [HttpPost]
        public object JTable([FromBody] PayScaleJtable jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = (from a in _context.PayScales
                         where !a.IsDeleted
                          && (string.IsNullOrEmpty(jTablePara.PayScaleCode) || a.PayScaleCode.Equals(jTablePara.PayScaleCode))
                          && (string.IsNullOrEmpty(jTablePara.CareerCode) || a.CareerCode.Equals(jTablePara.CareerCode))
                          && (string.IsNullOrEmpty(jTablePara.CareerTitle) || a.CareerTitle.Equals(jTablePara.CareerTitle))
                          && (string.IsNullOrEmpty(jTablePara.Certificate) || a.Certificate.Equals(jTablePara.Certificate))
                          && (string.IsNullOrEmpty(jTablePara.Major) || a.Major.Equals(jTablePara.Major))
                         select new
                         {
                             a.Id,
                             a.PayScaleCode,
                             a.PayBase,
                             a.Unit,
                             a.CreatedTime,
                             CareerCode = a.CareerCode,
                             CareerName = _context.CategoryCareers.FirstOrDefault(x => !x.IsDeleted && x.CareerCode.Equals(a.CareerCode)).CareerName,
                             CareerTitle = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.PayTitle) && x.CodeSet.Equals(a.CareerTitle)).ValueSet,

                             Certificate = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.PayCertificate) && x.CodeSet.Equals(a.Certificate)).ValueSet,
                             Major = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.PayMajor) && x.CodeSet.Equals(a.Major)).ValueSet,

                         }).OrderByDescending(x => x.CareerCode).ThenByDescending(x => x.CareerTitle);
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "PayScaleCode", "PayBase", "Unit", "CareerCode", "CareerName", "CareerTitle", "Certificate", "Major");
            return Json(jdata);
        }

        [HttpPost]
        public object JTableDetail([FromBody] PayScaleDetailJtable jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.PayScaleDetails
                        where !a.IsDeleted && a.ScaleCode.Equals(jTablePara.ScaleCode) && a.CareerCode.Equals(jTablePara.CareerCode)
                        select new
                        {
                            a.Id,
                            a.ScaleCode,
                            a.Ranges,
                            a.Coeff,
                            a.Salary
                        };
            var count = query.Count();

            /*var data = query.Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();*/
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).ToList();
            data = data.AsQueryable().Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "ScaleCode", "Ranges", "Coeff", "Salary");
            return Json(jdata);
        }

        [HttpGet]
        public object GetListPayScale()
        {
            var data = (from a in _context.PayScales.Where(x => !x.IsDeleted).DistinctBy(x => x.PayScaleCode)
                        join b in _context.PayScaleDetails.Where(x => !x.IsDeleted) on a.PayScaleCode equals b.ScaleCode
                        select new
                        {
                            ID = a.Id,
                            PayScaleCode = a.PayScaleCode,
                            PayBase = a.PayBase,
                            Ranges = b.Ranges,
                            Coeff = b.Coeff,
                            b.Salary
                        });
            return data;
        }
        [HttpGet]
        public object GetListPayScale2()
        {
            var data = (from a in _context.PayScales.Where(x => !x.IsDeleted)
                        join b in _context.PayScaleDetails.Where(x => !x.IsDeleted) on a.PayScaleCode equals b.ScaleCode
                        select new
                        {
                            ID = a.Id,
                            PayScaleCode = a.PayScaleCode,
                            PayBase = a.PayBase,
                            Ranges = b.Ranges,
                            Coeff = b.Coeff,
                            b.Salary
                        }).DistinctBy(x => new { x.PayScaleCode, x.Ranges }).GroupBy(x => x.PayScaleCode);
            return data;
        }
        [HttpGet]
        public object GetListNameJob()
        {
            var data = (from a in _context.CareerCatScales.Where(x => !x.IsDeleted)
                        select new
                        {
                            ID = a.Id,
                            PayScaleCode = a.PayScaleCode,
                            CareerCode = _context.CategoryCareers.FirstOrDefault(x => !x.IsDeleted && x.CareerCode.Equals(a.CareerCode)).CareerName,
                        });
            return data;
        }

        [HttpGet]
        public object GetListUnit()
        {
            var data = from a in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "CURRENCY_TYPE")
                       select new
                       {
                           Code = a.CodeSet,
                           Value = a.ValueSet
                       };
            return data;
        }
        public class PayScaleModel
        {
            public string PayScaleCode { get; set; }
            public string PayBase { get; set; }
            public string Unit { get; set; }


        }
        public class SearchModel : JTableModel
        {
            public string PayScaleCode { get; set; }
            public string Ranges { get; set; }

        }
        #region Pay_Scale
        [HttpPost]
        public JsonResult InsertPayScale([FromBody] PayScale obj)
        {
            var msg = new JMessage { Title = "", Error = false };
            try
            {
                var check = _context.PayScales.Any(x => (x.PayScaleCode == obj.PayScaleCode) && (x.CareerCode == obj.CareerCode) && !x.IsDeleted);
                if (!check)
                {
                    var dt = new PayScale();
                    dt.PayScaleCode = obj.PayScaleCode;
                    dt.PayBase = (obj.PayBase);
                    dt.Unit = obj.Unit;
                    dt.CareerCode = obj.CareerCode;
                    dt.CareerTitle = obj.CareerTitle;
                    dt.Certificate = obj.Certificate;
                    dt.Major = obj.Major;
                    dt.CreatedBy = ESEIM.AppContext.UserName;
                    dt.CreatedTime = DateTime.Now;
                    _context.PayScales.Add(dt);
                    _context.SaveChanges();
                    msg.Title = "Thêm thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Bản ghi đã tồn tại !";
                }
            }
            catch (Exception e)
            {
                msg.Error = true;
                msg.Title = "Thêm thất bại!";
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult InsertPayScale2([FromBody] PayScale obj)
        {
            var msg = new JMessage { Title = "", Error = false };
            try
            {
                var check = _context.PayScales.Any(x => (x.PayScaleCode == obj.PayScaleCode) && !x.IsDeleted);
                if (!check)
                {
                    var dt = new PayScale();
                    dt.PayScaleCode = obj.PayScaleCode;
                    dt.PayBase = (obj.PayBase);
                    dt.Unit = obj.Unit;
                    dt.CareerCode = obj.CareerCode;
                    dt.CareerTitle = obj.CareerTitle;
                    dt.Certificate = obj.Certificate;
                    dt.Major = obj.Major;
                    dt.CreatedBy = ESEIM.AppContext.UserName;
                    dt.CreatedTime = DateTime.Now;
                    _context.PayScales.Add(dt);
                    _context.SaveChanges();
                    msg.Title = "Thêm thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Bản ghi đã tồn tại !";
                }
            }
            catch (Exception e)
            {
                msg.Error = true;
                msg.Title = "Thêm thất bại!";
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult UpdatePayScale([FromBody] PayScale obj)
        {
            var msg = new JMessage { Title = "", Error = false };
            try
            {
                var data = _context.PayScales.FirstOrDefault(x => x.Id.Equals(obj.Id) && !x.IsDeleted);
                if (data != null)
                {
                    var con = _context.PayScaleDetails.Where(x => x.ScaleCode.Equals(data.PayScaleCode) && !x.IsDeleted);
                    foreach (var x in con)
                    {
                        x.ScaleCode = obj.PayScaleCode;
                        x.UpdatedBy = ESEIM.AppContext.UserName;
                        x.UpdatedTime = DateTime.Now;
                        _context.PayScaleDetails.Update(x);
                    }
                    data.PayScaleCode = obj.PayScaleCode;
                    data.PayBase = (obj.PayBase);
                    data.Unit = obj.Unit;
                    data.CareerCode = obj.CareerCode;
                    data.CareerTitle = obj.CareerTitle;
                    data.Certificate = obj.Certificate;
                    data.Major = obj.Major;
                    data.UpdatedBy = ESEIM.AppContext.UserName;
                    data.UpdatedTime = DateTime.Now;

                    _context.PayScales.Update(data);
                    _context.SaveChanges();
                    msg.Title = "Cập nhật thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Lỗi!";
                }
            }
            catch
            {
                msg.Error = true;
                msg.Title = "Cập nhật thất bại!";
            }
            return Json(msg);
        }

        [HttpGet]
        public JsonResult GetItemPayScale(int id)
        {
            var data = _context.PayScales.FirstOrDefault(x => x.Id.Equals(id) && !x.IsDeleted);
            return Json(data);
        }
        [HttpGet]
        public JsonResult GetItemPayScale2(string code)
        {
            var dataList = _context.PayScales.Where(x => x.PayScaleCode.Equals(code) && !x.IsDeleted).OrderByDescending(x => x.CareerCode).ThenByDescending(x => x.CareerTitle);
            var data = new PayScaleDetail();
            data.ScaleCode = dataList.FirstOrDefault().PayScaleCode;
            data.CareerCode = dataList.FirstOrDefault().CareerCode;
            return Json(data);
        }

        [HttpPost]
        public JsonResult DeletePayScale([FromBody] int id)
        {
            var msg = new JMessage { Title = "", Error = false };
            try
            {
                var data = _context.PayScales.FirstOrDefault(x => x.Id == id && !x.IsDeleted);
                if (data != null)
                {

                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    data.IsDeleted = true;
                    _context.PayScales.Update(data);
                    var con = _context.PayScaleDetails.Where(x => x.ScaleCode.Equals(data.PayScaleCode) && x.CareerCode.Equals(data.CareerCode) && !x.IsDeleted);
                    foreach (var x in con)
                    {
                        x.DeletedBy = ESEIM.AppContext.UserName;
                        x.DeletedTime = DateTime.Now;
                        x.IsDeleted = true;
                        _context.PayScaleDetails.Update(x);
                    }
                    _context.SaveChanges();
                    msg.Title = "Xóa thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Bản ghi không tồn tại";
                }
            }
            catch
            {
                msg.Error = true;
                msg.Title = "Xóa thất bại!";
            }
            return Json(msg);
        }


        [HttpPost]
        public JsonResult DeletePayScaleAll(string Code)
        {
            var msg = new JMessage { Title = "", Error = false };
            try
            {
                var check = _context.PayScales.Any(x => x.PayScaleCode.Equals(Code) && !x.IsDeleted);
                if (check)
                {
                    var listData = _context.PayScales.Where(x => x.PayScaleCode.Equals(Code) && !x.IsDeleted);
                    foreach (var data in listData)
                    {
                        data.DeletedBy = ESEIM.AppContext.UserName;
                        data.DeletedTime = DateTime.Now;
                        data.IsDeleted = true;
                        _context.PayScales.Update(data);
                    }
                    var con = _context.PayScaleDetails.Where(x => x.ScaleCode.Equals(Code) && !x.IsDeleted);
                    foreach (var x in con)
                    {
                        x.DeletedBy = ESEIM.AppContext.UserName;
                        x.DeletedTime = DateTime.Now;
                        x.IsDeleted = true;
                        _context.PayScaleDetails.Update(x);
                    }
                    _context.SaveChanges();

                    msg.Title = "Xóa thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Bản ghi không tồn tại";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Xóa thất bại!";
            }
            return Json(msg);
        }
        #endregion


        [HttpPost]
        public object SearchPayScale([FromBody] SearchModel obj)

        {

            var query = from a in _context.PayScales.Where(x => !x.IsDeleted && (string.IsNullOrEmpty(obj.PayScaleCode) || x.PayScaleCode.Equals(obj.PayScaleCode)))
                        join b in _context.PayScaleDetails.Where(x => !x.IsDeleted && (string.IsNullOrEmpty(obj.Ranges) || x.Ranges.Contains(obj.Ranges))) on a.PayScaleCode equals b.ScaleCode
                        select new
                        {
                            a.Id,
                            a.PayScaleCode,
                            a.PayBase,
                            b.Ranges,
                            b.Coeff,
                            b.Salary
                        };

            return query;


        }

        #region combobox
        [HttpGet]
        public object GetPayScaleCat()
        {
            var data = from a in _context.PayScales.Where(x => !x.IsDeleted).DistinctBy(x => x.PayScaleCode)
                       select new
                       {
                           Code = a.PayScaleCode
                       };
            return data;
        }
        [HttpPost]
        public JsonResult GetRanges(string id)
        {
            var data = from a in _context.PayScaleDetails.Where(x => !x.IsDeleted && x.ScaleCode.Equals(id))
                       select new
                       {
                           Ranges = a.Coeff
                       };
            return Json(data);
        }
        #endregion
        #region thêm sửa xóa pay_scale_detail
        [HttpPost]
        public JsonResult InsertPayScaleDetail([FromBody] PayScaleDetail obj)
        {
            var msg = new JMessage { Title = "", Error = false };
            try
            {
                var check = _context.PayScaleDetails.Any(x => !x.IsDeleted && x.ScaleCode.Equals(obj.ScaleCode) && x.CareerCode.Equals(obj.CareerCode) && x.Ranges == obj.Ranges);
                if (!check)
                {
                    var dt = new PayScaleDetail()
                    {
                        ScaleCode = obj.ScaleCode,
                        CareerCode = obj.CareerCode,
                        Ranges = obj.Ranges,
                        Coeff = obj.Coeff,
                        ScaleDtCode = obj.ScaleDtCode,
                        Salary = obj.Salary,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now,

                    };
                    _context.PayScaleDetails.Add(dt);
                    _context.SaveChanges();
                    msg.Title = "Thêm thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Bản ghi đã tồn tại !";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Thêm thất bại!";
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdatePayScaleDetail([FromBody] PayScaleDetail obj)
        {
            var msg = new JMessage { Title = "", Error = false };
            try
            {
                var data = _context.PayScaleDetails.FirstOrDefault(x => x.Id == obj.Id);
                if (data != null)
                {
                    /*data.ScaleCode = obj.ScaleCode;*/
                    data.Ranges = obj.Ranges;
                    data.CareerCode = obj.CareerCode;
                    data.Coeff = obj.Coeff;
                    data.Salary = obj.Salary;
                    data.UpdatedBy = ESEIM.AppContext.UserName;
                    data.UpdatedTime = DateTime.Now;
                    _context.PayScaleDetails.Update(data);
                    _context.SaveChanges();
                    msg.Title = "Cập nhật thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Lỗi!";
                }
            }
            catch
            {
                msg.Error = true;
                msg.Title = "Cập nhật thất bại!";
            }
            return Json(msg);
        }

        [HttpGet]
        public JsonResult GetItemPayScaleDetail(int id)
        {
            var data = _context.PayScaleDetails.FirstOrDefault(x => x.Id.Equals(id) && !x.IsDeleted);
            return Json(data);
        }

        [HttpPost]
        public JsonResult DeletePayScaleDetail([FromBody] int id)
        {
            var msg = new JMessage { Title = "", Error = false };
            try
            {
                var data = _context.PayScaleDetails.FirstOrDefault(x => x.Id == id && !x.IsDeleted);
                if (data != null)
                {
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    data.IsDeleted = true;
                    _context.PayScaleDetails.Update(data);
                    _context.SaveChanges();
                    msg.Title = "Xóa thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Bản ghi không tồn tại";
                }
            }
            catch
            {
                msg.Error = true;
                msg.Title = "Xóa thất bại!";
            }
            return Json(msg);
        }

        #endregion
        #region Nghề nghiệp, Chức danh, Chuyên môn, Bằng cấp
        [HttpPost]
        public JsonResult GetListPayCareer()
        {
            var data = _context.CategoryCareers.Where(x => !x.IsDeleted)
                                              .Select(x => new { Code = x.CareerCode, Name = x.CareerName }).DistinctBy(x => x.Code);
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetListPayTitle()
        {
            var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.PayTitle))
                                              .Select(x => new { Code = x.CodeSet, Name = x.ValueSet }).DistinctBy(x => x.Code);
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetListPayCertificate()
        {
            var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.PayCertificate))
                                              .Select(x => new { Code = x.CodeSet, Name = x.ValueSet }).DistinctBy(x => x.Code);
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetListPayMajor()
        {
            var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.PayMajor))
                                              .Select(x => new { Code = x.CodeSet, Name = x.ValueSet }).DistinctBy(x => x.Code);
            return Json(data);
        }

        #endregion


        [HttpPost]
        public JsonResult UploadImage(IFormFile fileUpload)
        {
            var msg = new JMessage { Title = "", Error = false };
            try
            {
                var upload = _upload.UploadImage(fileUpload);
                msg.Object = upload.Object;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = CommonUtil.ResourceValue("COM_MSG_FILE_FAIL");//"Có lỗi xảy ra khi upload file!";
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Object = ex;
            }
            return Json(msg);
        }


        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerSS.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion
    }
}