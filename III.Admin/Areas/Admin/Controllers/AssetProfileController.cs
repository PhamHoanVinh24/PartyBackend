using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class AssetProfileController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;

        public AssetProfileController(EIMDBContext context, IUploadService upload)
        {
            _context = context;
            _upload = upload;
        }
        public IActionResult Index()
        {
            return View();
        }

        #region Index
        public class JTableModelAsset : JTableModel
        {
            public string AssetCode { get; set; }
            public string AssetName { get; set; }
            public string Status { get; set; }
        }

        [HttpPost]
        public object JTableAssetProfile([FromBody]JTableModelAsset jTablePara)
        {

            Dictionary<string, object> dictionary = new Dictionary<string, object>();
            dictionary.Add("draw", 1);
            dictionary.Add("recordsFiltered", 10);
            dictionary.Add("recordsTotal", 10);
            Dictionary<string, string> data = new Dictionary<string, string>();
            List<object> datas = new List<object>();
            data.Add("Id", "1");
            data.Add("Code", "A_001");
            data.Add("Name", "Cấp ô tô");
            data.Add("Type", "ACB Quang Trung");
            data.Add("Description", "Quận 1, Thành phố HCM");
            data.Add("Status", "02/10/2018");
            data.Add("Cost", "Nguyễn Văn Hiếu");
            data.Add("Currency", "Đã cấp");
            data.Add("Img", "Đã cấp");
            datas.Add(data);

            data = new Dictionary<string, string>();
            data.Add("Id", "2");
            data.Add("Code", "A_002");
            data.Add("Name", "Cấp chứng từ");
            data.Add("Type", "ACB Kho HSCT");
            data.Add("Description", "Quận 2, Thành phố HCM");
            data.Add("Status", "02/11/2018");
            data.Add("Cost", "Nguyễn Văn Cương");
            data.Add("Currency", "Đã cấp");
            data.Add("Img", "Đã cấp");
            datas.Add(data);

            data = new Dictionary<string, string>();
            data.Add("Id", "3");
            data.Add("Code", "A_003");
            data.Add("Name", "Cấp căn hộ");
            data.Add("Type", "ACB Quang Trung");
            data.Add("Description", "Quận 10, Thành phố HCM");
            data.Add("Status", "02/02/2019");
            data.Add("Cost", "Đào Duy Từ");
            data.Add("Currency", "Đã cấp");
            data.Add("Img", "Đã cấp");
            datas.Add(data);

            dictionary.Add("data", datas);
            return Json(dictionary);
        }

        [HttpPost]
        public object DeleteAsset(int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.AssetMains.FirstOrDefault(x => x.AssetID == id);
                data.DeletedBy = ESEIM.AppContext.UserName;
                data.DeletedTime = DateTime.Now;
                data.IsDeleted = true;
                _context.AssetMains.Update(data);
                _context.SaveChanges();

                msg.Title = "Xóa thành công";
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra khi xóa!";
                msg.Object = ex;
                return Json(msg);
            }
        }

        [HttpPost]
        public object GetAsset(int id)
        {
            var data = _context.AssetMains.FirstOrDefault(x => x.AssetID == id);
            return Json(data);
        }

        [HttpPost]
        public object InsertAsset([FromBody]AssetMain data)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                if (_context.AssetMains.FirstOrDefault(x => x.AssetCode == data.AssetCode) == null)
                {
                    data.CreatedBy = ESEIM.AppContext.UserName;
                    data.CreatedTime = DateTime.Now;
                    _context.AssetMains.Add(data);
                    _context.SaveChanges();
                    msg.Title = "Thêm tài sản thành công!";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Mã tài sản đã tồn tại!";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra khi thêm mới tài sản!";
                msg.Object = ex;
            }
            return Json(msg);
        }

        [HttpPost]
        public object UpdateAsset([FromBody]AssetMain data)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                data.UpdatedBy = ESEIM.AppContext.UserName;
                data.UpdatedTime = DateTime.Now;
                _context.AssetMains.Update(data);
                _context.SaveChanges();
                msg.Title = "Cập nhật thông tin thành công";
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra khi cập nhật!";
                return Json(msg);
            }
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
        public object GetAllSupplier()
        {
            var data = _context.Suppliers.Select(x => new { x.SupCode, x.SupName }).AsNoTracking();
            return Json(data);
        }
        [HttpPost]
        public object GetAssetType()
        {
            var data = _context.CommonSettings.Where(x => x.Group == "ASSET_TYPE").Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return data;
        }
        [HttpPost]
        public object GetAssetGroup()
        {
            var data = _context.CommonSettings.Where(x => x.Group == "ASSET_GROUP").Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return data;
        }
        [HttpPost]
        public object GetCurrency()
        {
            return GetCurrencyBase();
        }
        [HttpPost]
        public object GetStatus()
        {
            var data = _context.CommonSettings.Where(x => x.Group == "STATUS").Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return data;
        }
        #endregion

        #region AssetAttribute
        public class JTableModelAttr : JTableModel
        {
            public string AssetCode { get; set; }
            public string AttrCode { get; set; }
            public string AttrValue { get; set; }
        }

        [HttpPost]
        public object JTableAttr([FromBody]JTableModelAttr jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.AssetAttributes
                        where (a.IsDeleted == false && a.AssetCode == jTablePara.AssetCode)
                            && (string.IsNullOrEmpty(jTablePara.AttrCode) || a.AttrCode.ToLower().Contains(jTablePara.AttrCode.ToLower()))
                            && (string.IsNullOrEmpty(jTablePara.AttrValue) || a.AttrValue.ToLower().Contains(jTablePara.AttrValue.ToLower()))
                        select new
                        {
                            id = a.AttrID,
                            code = a.AttrCode,
                            value = a.AttrValue,
                            groupAttr = a.AttrGroup,
                        };
            int count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "id", "code", "value", "groupAttr", "assetCode");
            return Json(jdata);
        }

        [HttpPost]
        public object GetAttr(int id)
        {
            var data = _context.AssetAttributes.FirstOrDefault(x => x.AttrID == id);
            return Json(data);
        }

        [HttpPost]
        public object InsertAttr([FromBody]AssetAttribute data)
        {
            var msg = new JMessage() { Error = false };

            try
            {
                var query = _context.AssetAttributes.FirstOrDefault(x => x.AttrCode == data.AttrCode);
                if (query == null)
                {
                    data.CreatedBy = ESEIM.AppContext.UserName;
                    data.CreatedTime = DateTime.Now;
                    _context.AssetAttributes.Add(data);
                    _context.SaveChanges();
                    msg.Title = "Thêm thuộc tính thành công!";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Mã thuộc tính đã tồn tại!";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra khi xóa thuộc tính!";
            }
            return Json(msg);
        }


        [HttpPost]
        public object UpdateAttr([FromBody]AssetAttribute data)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                data.UpdatedBy = ESEIM.AppContext.UserName;
                data.UpdatedTime = DateTime.Now;
                _context.AssetAttributes.Update(data);
                _context.SaveChanges();

                msg.Title = "Cập nhật thông tin thành công";
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra khi xóa!";
                msg.Object = ex;
                throw;
            }
        }

        [HttpPost]
        public object DeleteAttr(int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.AssetAttributes.FirstOrDefault(x => x.AttrID == id);
                data.DeletedBy = ESEIM.AppContext.UserName;
                data.DeletedTime = DateTime.Now;
                data.IsDeleted = true;
                _context.AssetAttributes.Remove(data);
                _context.SaveChanges();
                msg.Title = "Xóa thuộc tính thành công";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra khi xóa!";
            }
            return Json(msg);
        }
        #endregion

    }

}