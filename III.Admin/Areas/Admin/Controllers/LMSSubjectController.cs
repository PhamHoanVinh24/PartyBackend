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
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class LMSSubjectController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IGoogleApiService _googleAPIService;
        private readonly IStringLocalizer<LMSSubjectController> _stringLocalizer;
        private readonly IStringLocalizer<FileObjectShareController> _fileObjectShareController;
        private readonly IStringLocalizer<AssetController> _stringMaterialLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;

        public LMSSubjectController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment,
            IGoogleApiService googleAPIService, IStringLocalizer<LMSSubjectController> stringLocalizer,
            IStringLocalizer<SharedResources> sharedResources, IStringLocalizer<FileObjectShareController> fileObjectShareController,
            IStringLocalizer<AssetController> stringMaterialLocalizer)
        {
            _context = context;
            _upload = upload;
            _hostingEnvironment = hostingEnvironment;
            _googleAPIService = googleAPIService;
            _stringLocalizer = stringLocalizer;
            _fileObjectShareController = fileObjectShareController;
            _stringMaterialLocalizer = stringMaterialLocalizer;
            _sharedResources = sharedResources;
        }
        public IActionResult Index()
        {
            return View();
        }
         public class JTableModelCustom:JTableModel
        {
            public string LmsSubjectCode { get; set; }
            public string LmsSubjectName { get; set; }
            public string LmsSubjectGroup { get; set; }
            public string LmsSubjectType { get; set; }
        }
        #region AttributeMain

        [HttpPost]
        public object JTable([FromBody] JTableModelCustom jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.LMSSubjects.Where(x => !x.IsDeleted)
                        where (string.IsNullOrEmpty(jTablePara.LmsSubjectCode) || a.LmsSubjectCode.ToLower().Contains(jTablePara.LmsSubjectCode.ToLower()))
                        && (string.IsNullOrEmpty(jTablePara.LmsSubjectName) || a.LmsSubjectName.ToString().ToLower().Contains(jTablePara.LmsSubjectName.ToLower()))
                        && (string.IsNullOrEmpty(jTablePara.LmsSubjectGroup) || (a.LmsSubjectGroup != null && a.LmsSubjectGroup.Equals(jTablePara.LmsSubjectGroup)))
                        && (string.IsNullOrEmpty(jTablePara.LmsSubjectType) || (a.LmsSubjectType != null && a.LmsSubjectType.Equals(jTablePara.LmsSubjectType)))
                        select new
                        {
                            Id = a.ID,
                            a.LmsSubjectCode,
                            a.LmsSubjectName,
                            LmsSubjectGroup = _context.CommonSettings.FirstOrDefault(x=>!x.IsDeleted && x.CodeSet.Equals(a.LmsSubjectGroup)).ValueSet,
                            LmsSubjectType = _context.CommonSettings.FirstOrDefault(x=>!x.IsDeleted && x.CodeSet.Equals(a.LmsSubjectType)).ValueSet,
                            a.LmsSubjectDesc
                        };
            var count = query.Count();

            var data = query
                .OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "LmsSubjectCode", "LmsSubjectName", "LmsSubjectGroup", "LmsSubjectType", "LmsSubjectDesc");

            return Json(jdata);
        }

        [HttpPost]
        public JsonResult Insert([FromBody] LMSSubject obj)
        {
            var msg = new JMessage { Title = "", Error = false };
            try
            {
                var exist = _context.LMSSubjects.FirstOrDefault(x => x.LmsSubjectCode == obj.LmsSubjectCode);
                if (exist != null)
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["LMS_MSG_ADD_LOOP"]);//Mã danh mục đã tồn tại
                }
                else
                {
                    obj.CreatedBy = ESEIM.AppContext.UserName;
                    obj.CreatedTime = DateTime.Now;
                    _context.LMSSubjects.Add(obj);
                    _context.SaveChanges();
                    msg.Title = String.Format(_stringLocalizer["LMS_MSG_ADD_SUCESS"]);//Thêm thành công
                }
            }
            catch
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["LMS_MSG_ADD_ERROR"]); //Thêm thất bại
            }
            return Json(msg);
        }
        [HttpPost]
        public object Update([FromBody] LMSSubject obj)
        {
            var msg = new JMessage();
            try
            {
                var item = _context.LMSSubjects.FirstOrDefault(x => x.ID.Equals(obj.ID));
                if (item != null)
                {
                    item.UpdatedBy = User.Identity.Name;
                    item.UpdatedTime = DateTime.Now.Date;
                    item.LmsSubjectName = obj.LmsSubjectName;
                    item.LmsSubjectGroup = obj.LmsSubjectGroup;
                    item.LmsSubjectType = obj.LmsSubjectType;
                    item.LmsSubjectDesc = obj.LmsSubjectDesc;

                    _context.LMSSubjects.Update(item);
                    _context.SaveChanges();

                    msg.Error = false;
                    msg.Title = String.Format(_stringLocalizer["LMS_MSG_SAVE_SUCCESS"]); //"Đã lưu thay đổi";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["LMS_MSG_ERROR"]); //"Có lỗi xảy ra!";
                }

                return msg;
            }
            catch
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["LMS_MSG_ERROR"]); //"Có lỗi xảy ra!";
                return msg;
            }
        }
        [HttpPost]
        public object Delete(int id)
        {
            var msg = new JMessage { Error = true };
            try
            {
                var data = _context.LMSSubjects.FirstOrDefault(x => x.ID == id);
                data.IsDeleted = true;
                data.DeletedBy = User.Identity.Name;
                data.DeletedTime = DateTime.Now.Date;
                _context.LMSSubjects.Update(data);
                _context.SaveChanges();
                msg.Error = false;
                msg.Title = String.Format(_stringLocalizer["LMS_MSG_DELETE_SUCCESS"]); //"Xóa thành công!";
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["LMS_MSG_DELETE_ERROR"]); //"Có lỗi khi xóa!";
                return Json(msg);
            }
        }
        public object GetItem(int id)
        {
            var item = _context.LMSSubjects.FirstOrDefault(m => m.ID == id &&!m.IsDeleted );
            return Json(item);
        }

        [HttpPost]
        public object GetListParent()
        {
            var item = _context.CriteriaRecruitmentCats.AsNoTracking().Where(m => string.IsNullOrEmpty(m.Parent)).Select(x => new { x.Id, x.Code, x.Name, x.Unit, x.DataType, x.Note, x.Parent });
            return Json(item);
        }

        #endregion
        #region Combobox
        [HttpPost]
        public object GetAttrUnit()
        {
            var data = _context.CommonSettings.Where(x => x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.AttrUnit)).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return data;
        }

        [HttpPost]
        public object GetLmsGroup()
        {
            var data = _context.CommonSettings.Where(x => x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.LmsSubjectGroup)).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return data;
        }

        [HttpPost]
        public object GetLmsType()
        {
            var data = _context.CommonSettings.Where(x => x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.LmsSubjectType)).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return data;
        }

        #endregion

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion

        #region Model
        public class JTableModelAsset : JTableModel
        {
            public int AssetID { get; set; }
            public string AssetCode { get; set; }
            public string AssetName { get; set; }
            public string AssetType { get; set; }
            public string AssetGroup { get; set; }
            public string Description { get; set; }
            public string PathIMG { get; set; }
            public string Status { get; set; }
            public string BuyedTime { get; set; }
            public string ExpiredDate { get; set; }
            public string Cost { get; set; }
            public string Currency { get; set; }
            public string SupplierCode { get; set; }
            public string LocationText { get; set; }
            public string LocationGps { get; set; }
        }
        public class EDMSJtableFileExModel : EDMSJtableFileModel
        {
            public string Position { get; set; }
            public bool IsLocated { get; set; }
        }

        public class JtableFileExModel : JtableFileModel
        {
            public string RackCode { get; set; }
            public string PackCode { get; set; }
        }

        public class PositionInfo
        {
            public string Code { get; set; }
            public string Name { get; set; }
            public string RackName { get; set; }
            public string L_Text { get; set; }
            public string FloorName { get; set; }
            public string WHS_Name { get; set; }
        }

        public class ShapeData
        {
            public string Type { get; set; }
            public string Json { get; set; }
            public string ObjectCode { get; set; }
        }

        public class JTableModelProdCustom : JTableModel
        {
            public string Code { get; set; }
            public string Name { get; set; }
            public string FromTo { get; set; }
            public string DateTo { get; set; }
            public string Group { get; set; }
            public string Type { get; set; }
            public string Status { get; set; }
            public string Catalogue { get; set; }
            public string RackCode { get; set; }
        }

        public class MaterialProductRes
        {
            public int id { get; set; }
            public string productcode { get; set; }
            public string productqrcode { get; set; }
            public string productname { get; set; }
            public string unit { get; set; }
            public string productgroup { get; set; }
            public string producttype { get; set; }
            public string pathimg { get; set; }
            public string material { get; set; }
            public string pattern { get; set; }
            public string note { get; set; }
            public string sBarCode { get; set; }
            public string sQrCode { get; set; }
            public bool IsLocated { get; set; }
            public string Position { get; set; }
            public int? MappingId { get; set; }
        }

        #endregion
    }
}