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
using System.Globalization;
using III.Domain.Enums;
using Newtonsoft.Json;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class VCVendorController : BaseController
    {

        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        public VCVendorController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment)
        {
            _context = context;
            _upload = upload;
            _hostingEnvironment = hostingEnvironment;
        }

        public IActionResult Index()
        {
            return View();
        }

        #region Index
        [HttpPost]
        public object JTable([FromBody]JTableModelCustomer jTablePara)
        {
            var session = HttpContext.GetSessionUser();
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            //listCommon có thể lấy theo role hoặc customer_type, nhưng lúc tạo cho Vicem thì tạo là role, để không ảnh hưởng đến customer_type của swork
            var listCommon = _context.CommonSettings.Select(x => new { x.CodeSet, x.ValueSet, x.Group });

            IQueryable<VcVendorListModel> query = null;

            if (session.UserType == 10)
            {
                query = from a in _context.Customerss
                        join b in listCommon on a.CusGroup equals b.CodeSet into b1
                        from b in b1.DefaultIfEmpty()
                        join c in listCommon on a.ActivityStatus equals c.CodeSet into c1
                        from c in c1.DefaultIfEmpty()
                        join d2 in listCommon on a.Role equals d2.CodeSet into d1
                        from d in d1.DefaultIfEmpty()
                        where
                        (a.IsDeleted == false)
                            &&
                            (string.IsNullOrEmpty(jTablePara.CustomerCode) || a.CusCode == jTablePara.CustomerCode)
                            //&& (string.IsNullOrEmpty(jTablePara.CustomerName) || a.CusName.ToLower().Contains(jTablePara.CustomerName.ToLower()))
                            && (string.IsNullOrEmpty(jTablePara.CustomerEmail) || a.Email.ToLower().Contains(jTablePara.CustomerEmail.ToLower()))
                            && (string.IsNullOrEmpty(jTablePara.CustomerPhone) || a.MobilePhone.ToLower().Contains(jTablePara.CustomerPhone.ToLower()))
                            && (string.IsNullOrEmpty(jTablePara.CustomerActivityStatus) || a.ActivityStatus == jTablePara.CustomerActivityStatus)
                            && (string.IsNullOrEmpty(jTablePara.Area) || a.Area == jTablePara.Area)
                            && (string.IsNullOrEmpty(jTablePara.Address) || a.Address.ToLower().Contains(jTablePara.Address.ToLower()))
                            && (string.IsNullOrEmpty(jTablePara.CustomerRole) || a.Role.ToLower().Contains(jTablePara.CustomerRole.ToLower()))
                        select new VcVendorListModel
                        {
                            id = a.CusID,
                            cusCode = a.CusCode,
                            cusName = a.CusName,
                            cusEmail = a.Email,
                            cusAddress = a.Address,
                            cusMobilePhone = a.MobilePhone,
                            //cusGroup = b != null ? b.ValueSet : "",
                            cusRole = (d != null ? d.ValueSet : ""),
                            cusActivity = c != null ? c.CodeSet == "ACTIVE" ? c.CodeSet : c.CodeSet == "DEACTIVE" ? c.CodeSet : c.ValueSet : "Không xác định",
                        };
            }
            else
            {
                var listArea = GetListAreaFunc(session).Select(x => x.Code).ToList();
                if (session.TypeStaff == 10 || session.TypeStaff == 0)
                {
                    query = from a in _context.Customerss.Where(x => listArea.Any(y => y == x.Area))
                            join b in listCommon on a.CusGroup equals b.CodeSet into b1
                            from b in b1.DefaultIfEmpty()
                            join c in listCommon on a.ActivityStatus equals c.CodeSet into c1
                            from c in c1.DefaultIfEmpty()
                            join d2 in listCommon on a.Role equals d2.CodeSet into d1
                            from d in d1.DefaultIfEmpty()
                            where
                            (a.IsDeleted == false)
                                &&
                                (string.IsNullOrEmpty(jTablePara.CustomerCode) || a.CusCode == jTablePara.CustomerCode)
                                //&& (string.IsNullOrEmpty(jTablePara.CustomerName) || a.CusName.ToLower().Contains(jTablePara.CustomerName.ToLower()))
                                && (string.IsNullOrEmpty(jTablePara.CustomerEmail) || a.Email.ToLower().Contains(jTablePara.CustomerEmail.ToLower()))
                                && (string.IsNullOrEmpty(jTablePara.CustomerPhone) || a.MobilePhone.ToLower().Contains(jTablePara.CustomerPhone.ToLower()))
                                && (string.IsNullOrEmpty(jTablePara.CustomerActivityStatus) || a.ActivityStatus == jTablePara.CustomerActivityStatus)
                                && (string.IsNullOrEmpty(jTablePara.Area) || a.Area == jTablePara.Area)
                                && (string.IsNullOrEmpty(jTablePara.Address) || a.Address.ToLower().Contains(jTablePara.Address.ToLower()))
                                && (string.IsNullOrEmpty(jTablePara.CustomerRole) || a.Role.ToLower().Contains(jTablePara.CustomerRole.ToLower()))
                            select new VcVendorListModel
                            {
                                id = a.CusID,
                                cusCode = a.CusCode,
                                cusName = a.CusName,
                                cusEmail = a.Email,
                                cusAddress = a.Address,
                                cusMobilePhone = a.MobilePhone,
                                //cusGroup = b != null ? b.ValueSet : "",
                                cusRole = (d != null ? d.ValueSet : ""),
                                cusActivity = c != null ? c.CodeSet == "ACTIVE" ? c.CodeSet : c.CodeSet == "DEACTIVE" ? c.CodeSet : c.ValueSet : "Không xác định",
                            };
                }
            }

            var count = query.Count();
            var data1 = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data1, jTablePara.Draw, count, "id", "cusCode", "cusName", "cusEmail", "cusAddress", "cusMobilePhone", "cusGroup", "cusRole", "cusActivity");
            return Json(jdata);
        }


        ////Hàm cũ
        //[HttpPost]
        //public object JTable([FromBody]JTableModelCustomer jTablePara)
        //{
        //    int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
        //    //listCommon có thể lấy theo role hoặc customer_type, nhưng lúc tạo cho Vicem thì tạo là role, để không ảnh hưởng đến customer_type của swork
        //    var listCommon = _context.CommonSettings.Select(x => new { x.CodeSet, x.ValueSet, x.Group });
        //    var query = from a in _context.Customerss
        //                join b in listCommon on a.CusGroup equals b.CodeSet into b1
        //                from b in b1.DefaultIfEmpty()
        //                join c in listCommon on a.ActivityStatus equals c.CodeSet into c1
        //                from c in c1.DefaultIfEmpty()
        //                join d2 in listCommon on a.Role equals d2.CodeSet into d1
        //                from d in d1.DefaultIfEmpty()
        //                where
        //                (a.IsDeleted == false)
        //                    &&
        //                    (string.IsNullOrEmpty(jTablePara.CustomerCode) || a.CusCode == jTablePara.CustomerCode)
        //                    //&& (string.IsNullOrEmpty(jTablePara.CustomerName) || a.CusName.ToLower().Contains(jTablePara.CustomerName.ToLower()))
        //                    && (string.IsNullOrEmpty(jTablePara.CustomerEmail) || a.Email.ToLower().Contains(jTablePara.CustomerEmail.ToLower()))
        //                    && (string.IsNullOrEmpty(jTablePara.CustomerPhone) || a.MobilePhone.ToLower().Contains(jTablePara.CustomerPhone.ToLower()))
        //                    && (string.IsNullOrEmpty(jTablePara.CustomerActivityStatus) || a.ActivityStatus == jTablePara.CustomerActivityStatus)
        //                    && (string.IsNullOrEmpty(jTablePara.Area) || a.Area == jTablePara.Area)
        //                    && (string.IsNullOrEmpty(jTablePara.Address) || a.Address.ToLower().Contains(jTablePara.Address.ToLower()))
        //                    && (string.IsNullOrEmpty(jTablePara.CustomerRole) || a.Role.ToLower().Contains(jTablePara.CustomerRole.ToLower()))
        //                select new
        //                {
        //                    id = a.CusID,
        //                    cusCode = a.CusCode,
        //                    cusName = a.CusName,
        //                    cusEmail = a.Email,
        //                    cusAddress = a.Address,
        //                    cusMobilePhone = a.MobilePhone,
        //                    //cusGroup = b != null ? b.ValueSet : "",
        //                    cusRole = (d != null ? d.ValueSet : ""),
        //                    cusActivity = c != null ? c.CodeSet == "ACTIVE" ? c.CodeSet : c.CodeSet == "DEACTIVE" ? c.CodeSet : c.ValueSet : "Không xác định",
        //                };
        //    var count = query.Count();
        //    var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).AsNoTracking().ToList();
        //    var data1 = data.Skip(intBeginFor).Take(jTablePara.Length).ToList();
        //    var jdata = JTableHelper.JObjectTable(data1, jTablePara.Draw, count, "id", "cusCode", "cusName", "cusEmail", "cusAddress", "cusMobilePhone", "cusGroup", "cusRole", "cusActivity");
        //    return Json(jdata);
        //}

        [HttpPost]
        public object JTableTrade([FromBody]JTableModelTrade jTablePara)
        {
            var Customerss = _context.Customerss.FirstOrDefault(x => x.CusID == jTablePara.Id);
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var listCommon = _context.CommonSettings.Select(x => new { x.CodeSet, x.ValueSet });
            if (Customerss != null)
            {
                var query = from a in _context.VcSupplierTradeRelations
                            join b2 in _context.CommonSettings on a.Brand equals b2.CodeSet into b1
                            from b in b1.DefaultIfEmpty()
                            join c2 in _context.Customerss on a.Seller equals c2.CusCode into c1
                            from c in c1.DefaultIfEmpty()

                            where a.Buyer == Customerss.CusCode && a.IsDeleted == false
                            && (b == null || (b != null && b.Group == "VC_BRAND"))
                            && (string.IsNullOrEmpty(a.Seller) || (c != null && c.IsDeleted == false))
                            select new TradeRes
                            {
                                Id = a.Id,
                                Brand = a.Brand,
                                txtBrand = (b != null ? b.ValueSet : ""),
                                Seller = a.Seller,
                                txtSeller = (c != null ? c.CusName : ""),
                                SellerRole = (c != null ? c.Role : "")
                            };

                var count = query.Count();
                var data = query.OrderUsingSortExpression("Id DESC").AsNoTracking().ToList();
                var data1 = data.Skip(intBeginFor).Take(jTablePara.Length).ToList();
                var jdata = JTableHelper.JObjectTable(data1, jTablePara.Draw, count, "Id", "Brand", "txtBrand", "Seller", "txtSeller", "SellerRole");
                return Json(jdata);
            }
            else
            {
                var list = new List<TradeRes>();
                var jdata = JTableHelper.JObjectTable(list, jTablePara.Draw, 0, "Id", "Brand", "txtBrand", "Seller", "txtSeller", "SellerRole");
                return Json(jdata);
            }
        }

        [HttpPost]
        public object JTableTransporter([FromBody]JTableModelTransporter jTablePara)
        {
            var Customerss = _context.Customerss.FirstOrDefault(x => x.CusID == jTablePara.Id);
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var listCommon = _context.CommonSettings.Select(x => new { x.CodeSet, x.ValueSet });
            if (Customerss != null)
            {
                var query = (from a in _context.VcTransporters
                             join b2 in _context.CommonSettings on a.CustomType equals b2.CodeSet into b1
                             from b in b1.DefaultIfEmpty()
                             where a.OwnerCode == Customerss.CusCode && (b == null || (b != null && b.Group == EnumHelper<GroupUserEnum>.GetDisplayValue(GroupUserEnum.TRANSPOTER_WEIGHT)))
                             && a.IsDeleted == false
                             select new TransporterRes
                             {
                                 Id = a.Id,
                                 LicensePlate = a.LicensePlate,
                                 Owned = a.OwnerCode,
                                 CustomType = a.CustomType,
                                 CustomTypeTxt = (b != null ? b.ValueSet : ""),
                                 InsurranceDuration = a.InsurranceDuration,
                                 RegistryDuration = a.RegistryDuration
                             });
                var count = query.Count();
                var data = query.OrderUsingSortExpression("Id DESC").AsNoTracking().ToList();
                var data1 = data.Skip(intBeginFor).Take(jTablePara.Length).ToList();

                var jdata = JTableHelper.JObjectTable(data1, jTablePara.Draw, count, "Id", "LicensePlate", "Owned", "CustomType", "CustomTypeTxt", "InsurranceDuration", "RegistryDuration");
                return Json(jdata);
            }
            else
            {
                var list = new List<TransporterRes>();
                var jdata = JTableHelper.JObjectTable(list, jTablePara.Draw, 0, "Id", "LicensePlate", "Owned", "CustomType", "CustomTypeTxt", "InsurranceDuration", "RegistryDuration");
                return Json(jdata);
            }
        }

        [HttpPost]
        public JsonResult Insert([FromBody]Customers obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var checkExist = _context.Customerss.FirstOrDefault(x => !x.IsDeleted && x.CusCode.ToLower() == obj.CusCode.ToLower());
                if (checkExist == null)
                {
                    obj.CreatedBy = ESEIM.AppContext.UserName;
                    obj.CreatedTime = DateTime.Now;
                    _context.Customerss.Add(obj);

                    //add mapdata gis
                    InsertGisMap(obj);
                    _context.SaveChanges();
                    msg.Title = "Thêm NPP/Đầu mối/Cửa hàng thành công!";
                    msg.Object = obj;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Mã NPP/Đầu mối/Cửa hàng đã tồn tại!";
                }
                return Json(msg);
            }
            catch
            {
                msg.Error = true;
                //msg.Object = ex;
                msg.Title = "Có lỗi khi thêm NPP/Đầu mối/Cửa hàng!";
                return Json(msg);
            }

        }
        //[HttpPost]
        //public JsonResult CreateDataOld()
        //{
        //    var msg = new JMessage { Error = false, Title = "" };
        //    try
        //    {
        //        var listCus = _context.Customerss.Where(x => !x.IsDeleted).ToList();
        //        if (listCus.Any())
        //        {
        //            foreach(var obj in listCus)
        //            {
        //                InsertGisMap(obj);
        //                _context.SaveChanges();
        //            }
        //        }
        //        else
        //        {
        //            msg.Error = true;
        //            msg.Title = "Không có khách hàng!";
        //        }
        //        return Json(msg);
        //    }
        //    catch
        //    {
        //        msg.Error = true;
        //        msg.Title = "Có lỗi khi thêm dữ liệu cũ!";
        //        return Json(msg);
        //    }

        //}
        [HttpPost]
        public JsonResult InsertTrade([FromBody]VcSupplierTradeRelation obj)
        {
            var msg = new JMessage() { Error = false };

            try
            {
                obj.Seller = ((string.IsNullOrEmpty(obj.Seller)) ? null : obj.Seller);
                var data = _context.VcSupplierTradeRelations.FirstOrDefault(x => x.Buyer == obj.Buyer && x.IsDeleted == false && x.Brand == obj.Brand
                );
                if (data != null)
                {
                    msg.Error = true;
                    msg.Title = "Thương hiệu đã được thêm, không thể thêm lại";
                }
                else
                {
                    if (!string.IsNullOrEmpty(obj.Seller))
                    {//kiểm tra xem NPP/DM có bán thương hiệu này không
                        var isExits = _context.VcSupplierTradeRelations.FirstOrDefault(x => x.IsDeleted == false
                                        && x.Brand == obj.Brand && x.Buyer == obj.Seller);
                        if (isExits == null)
                        {
                            msg.Error = true;
                            msg.Title = "Vui lòng kiểm tra lại, NPP/Đầu mối không bán thương hiệu này";
                            return Json(msg);
                        }
                    }
                    else
                    {
                        obj.Seller = null;
                    }
                    obj.CreatedBy = ESEIM.AppContext.UserName;
                    obj.CreatedTime = DateTime.Now;
                    obj.IsDeleted = false;
                    _context.VcSupplierTradeRelations.Add(obj);
                    _context.SaveChanges();
                    msg.Title = "Thêm thành công";
                    msg.Object = obj;
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
        public JsonResult UpdateTrade([FromBody]VcSupplierTradeRelation obj)
        {
            var msg = new JMessage() { Error = false };

            try
            {
                var data = _context.VcSupplierTradeRelations.FirstOrDefault(x => x.Id == obj.Id);
                if (data == null)
                {
                    msg.Error = true;
                    msg.Title = "Dữ liệu không tồn tại, vui lòng làm mới trang";
                }
                else
                {
                    data.Seller = obj.Seller;
                    data.Brand = obj.Brand;
                    data.UpdatedBy = ESEIM.AppContext.UserName;
                    data.UpdatedTime = DateTime.Now;
                    var data1 = _context.VcSupplierTradeRelations.FirstOrDefault(x => x.Buyer == data.Buyer && x.IsDeleted == false && x.Brand == obj.Brand
                                                                                        && x.Id != data.Id);
                    if (data1 == null)
                    {
                        if (!string.IsNullOrEmpty(obj.Seller))
                        {//kiểm tra xem NPP/DM có bán thương hiệu này không
                            var isExits = _context.VcSupplierTradeRelations.FirstOrDefault(x => x.IsDeleted == false
                                            && x.Brand == obj.Brand && x.Buyer == obj.Seller);
                            if (isExits == null)
                            {
                                msg.Error = true;
                                msg.Title = "Vui lòng kiểm tra lại, NPP/Đầu mối không bán thương hiệu này";
                                return Json(msg);
                            }
                        }
                        else
                        {
                            data.Seller = null;
                        }

                        _context.VcSupplierTradeRelations.Update(data);
                        _context.SaveChanges();
                        msg.Title = "Chỉnh sửa thành công";
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = "Không thể chỉnh sửa, thương hiệu này đã có";
                    }
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
        public JsonResult InsertTransporter([FromBody]VcTransporter obj)
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
        public JsonResult UpdateTransporter([FromBody]VcTransporter obj)
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
        public JsonResult deleteTrade(int Id)
        {
            var msg = new JMessage() { Error = false };

            try
            {
                var data = _context.VcSupplierTradeRelations.FirstOrDefault(x => x.Id == Id);
                if (data != null)
                {
                    data.IsDeleted = true;
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    _context.Update(data);
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
                msg.Title = "Xảy ra lỗi khi xóa";
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
        [HttpPost]
        public JsonResult GetBrands()
        {
            var msg = new JMessage() { Error = false };
            var data = (from a in _context.CommonSettings
                        where a.Group == EnumHelper<GroupUserEnum>.GetDisplayValue(GroupUserEnum.VC_BRAND)
                        && a.IsDeleted == false
                        select new
                        {
                            Code = a.CodeSet,
                            Name = a.ValueSet
                        }).ToList();
            msg.Object = data;
            return Json(msg);
        }

        //[HttpPost]
        //public JsonResult GetProducts()
        //{
        //    var msg = new JMessage() { Error = false };
        //    var data = (from a in _context.VcProductCats
        //                where a.IsDeleted == false
        //                select new
        //                {
        //                    Code = a.ProductCode,
        //                    Name = a.ProductName
        //                }).ToList();
        //    msg.Object = data;
        //    return Json(msg);
        //}
        [HttpPost]
        public JsonResult GetTransportWeight()
        {
            var msg = new JMessage() { Error = false };
            var data = (from a in _context.CommonSettings
                        where a.Group == EnumHelper<GroupUserEnum>.GetDisplayValue(GroupUserEnum.TRANSPOTER_WEIGHT)
                        && a.IsDeleted == false
                        select new
                        {
                            Code = a.CodeSet,
                            Name = a.ValueSet
                        }).ToList();
            msg.Object = data;
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetDistributors()
        {
            var msg = new JMessage() { Error = false };
            msg.Object = GetDistributorsRaw();
            return Json(msg);
        }
        private object GetDistributorsRaw()
        {
            var data = (from a in _context.Customerss
                        where a.Role == EnumHelper<RoleEnum>.GetDisplayValue(RoleEnum.DISTRIBUTOR)
                        && a.IsDeleted == false

                        select new
                        {
                            Seller = a.CusCode,
                            Name = a.CusName,
                            Role = (a.Role == EnumHelper<RoleEnum>.GetDisplayValue(RoleEnum.AGENT) ? "ĐM - " : "NPP - ")
                        }).ToList();
            return data;
        }
        [HttpPost]
        public JsonResult GetDistributorsAgents()
        {
            var msg = new JMessage() { Error = false };
            msg.Object = GetDistributorsAgentsRaw();
            return Json(msg);
        }
        private object GetDistributorsAgentsRaw()
        {
            var data = (from a in _context.Customerss
                        where (a.Role == EnumHelper<RoleEnum>.GetDisplayValue(RoleEnum.DISTRIBUTOR)
                        || a.Role == EnumHelper<RoleEnum>.GetDisplayValue(RoleEnum.AGENT))
                        && a.IsDeleted == false

                        select new
                        {
                            Seller = a.CusCode,
                            Name = a.CusName,
                            Role = (a.Role == EnumHelper<RoleEnum>.GetDisplayValue(RoleEnum.AGENT) ? "ĐM - " : "NPP - ")
                        }).ToList();
            return data;
        }

        public JsonResult GetInfoForEditTradeItem(int Id)
        {
            return Json("");

        }

        [HttpPost]
        public JsonResult GetBrandsBySeller(string SellerCode)
        {
            var msg = new JMessage() { Error = false };
            var data = (from a in _context.VcSupplierTradeRelations
                        join b1 in _context.CommonSettings on a.Brand equals b1.CodeSet into b2
                        from b in b2.DefaultIfEmpty()

                        where a.Buyer == SellerCode && a.IsDeleted == false
                        && (b == null || b.Group == "VC_BRAND")
                        select new
                        {
                            Code = a.Brand,
                            Name = (b != null ? b.ValueSet : "")
                        }).DistinctBy(x => x.Code).ToList();
            msg.Object = data;
            return Json(msg);
        }
        //[HttpPost]
        //public JsonResult GetProductsBySeller(string SellerCode)
        //{
        //    var msg = new JMessage() { Error = false };
        //    var data = (from a in _context.VcSupplierTradeRelations
        //                join b2 in _context.VcProductCats on a.ProductCode equals b2.ProductCode into b1
        //                from b in b1.DefaultIfEmpty()
        //                where a.Buyer == SellerCode && a.IsDeleted == false
        //                select new
        //                {
        //                    Code = a.ProductCode,
        //                    Name = (b != null ? b.ProductName : "")
        //                }).DistinctBy(x => x.Code).ToList();
        //    msg.Object = data;
        //    return Json(msg);
        //}



        [HttpPost]
        public JsonResult Update([FromBody]Customers obj)
        {
            var msg = new JMessage();
            try
            {
                obj.UpdatedTime = DateTime.Now.Date;
                _context.Customerss.Update(obj);
                _context.SaveChanges();
                msg.Error = false;
                msg.Title = "Đã lưu thay đổi";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra!";
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Delete(int id)
        {
            var msg = new JMessage();
            try
            {
                var data = _context.Customerss.FirstOrDefault(x => x.CusID == id);
                var isHasSettingRoute = _context.VcSettingRoutes.Any(x => !x.IsDeleted && x.Node == data.CusCode);
                if (isHasSettingRoute)
                {
                    msg.Error = true;
                    msg.Title = "Không thể xóa cửa hàng đã được sử dụng trong kế hoạch!";
                }
                else
                {
                    data.IsDeleted = true;
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;

                    _context.Customerss.Update(data);
                    _context.SaveChanges();
                    msg.Error = false;
                    msg.Title = "Xóa thành công!";
                }
            }
            catch
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra!";
            }
            return Json(msg);
        }

        [HttpGet]
        public object GetItem(int id)
        {
            var a = _context.Customerss.AsNoTracking().Single(m => m.CusID == id);
            return Json(a);
        }


        #region Combobox
        [HttpPost]
        public object GetCustomerGroup()
        {
            var data = _context.CommonSettings.Where(x => x.Group == EnumHelper<CustomerEnum>.GetDisplayValue(CustomerEnum.CustomerGroup)).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return data;
        }


        [HttpPost]
        public object GetCustomerStatus()
        {
            var data = _context.CommonSettings.Where(x => x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Status)).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return data;
        }

        //Lấy list Đại lý/Cửa hàng
        [HttpPost]
        public JsonResult GetListCustomer()
        {
            var session = HttpContext.GetSessionUser();
            var rs = GetListCustomerFunc(session).ToList();
            return Json(rs);
        }
        [HttpPost]
        public JsonResult GetListArea()
        {
            var msg = new JMessage() { Error = false };
            var data = from a in _context.CommonSettings
                       where a.Group == EnumHelper<CommonEnum>.GetDisplayValue(CommonEnum.Area) && a.IsDeleted == false
                       select new
                       {
                           Code = a.CodeSet,
                           Name = a.ValueSet,
                       };


            //var data = from a in _context.CommonSettings
            //           where a.Group == EnumHelper<CommonEnum>.GetDisplayValue(CommonEnum.Area) && a.IsDeleted == false
            //           select new
            //           {
            //               Code = a.CodeSet,
            //               Name = a.ValueSet,
            //           };
            msg.Object = data;

            return Json(msg);
        }
        [HttpPost]
        public JsonResult GetListCutomerType()
        {
            var msg = new JMessage() { Error = false };

            var data = from a in _context.CommonSettings
                       where a.Group == "TYPE" && a.IsDeleted == false
                       select new
                       {
                           Code = a.CodeSet,
                           Name = a.ValueSet,
                       };
            msg.Object = data;

            return Json(msg);
        }
        [HttpPost]
        public JsonResult GetListCutomerRole()
        {
            var msg = new JMessage() { Error = false };

            var data = from a in _context.CommonSettings
                       where a.Group == EnumHelper<CustomerEnum>.GetDisplayValue(CustomerEnum.CustomerRole) && a.IsDeleted == false
                       select new
                       {
                           Code = a.CodeSet,
                           Name = a.ValueSet,
                       };
            msg.Object = data;

            return Json(msg);
        }
        #endregion


        #endregion

        //#region File
        //public class JTableModelFile : JTableModel
        //{
        //    public int? CustomerId { get; set; }
        //    public string Title { get; set; }
        //    public string Type { get; set; }
        //    public string CreatedTime { get; set; }
        //    public string UpdatedTime { get; set; }
        //}
        //[HttpPost]
        //public object JTableFile([FromBody]JTableModelFile jTablePara)
        //{
        //    int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
        //    int? searchCustomerId = jTablePara.CustomerId;
        //    string searchTitle = jTablePara.Title.ToLower();
        //    string searchType = jTablePara.Type.ToLower();
        //    DateTime? searchCreatedTime = !string.IsNullOrEmpty(jTablePara.CreatedTime) ? DateTime.ParseExact(jTablePara.CreatedTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
        //    DateTime? searchUpdatedTime = !string.IsNullOrEmpty(jTablePara.UpdatedTime) ? DateTime.ParseExact(jTablePara.UpdatedTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

        //    var query = from a in _context.CustomerFiles
        //                where ((a.CustomerID == searchCustomerId) &&
        //                       a.IsDeleted == false &&
        //                       a.Title.ToLower().Contains(searchTitle) &&
        //                       a.FileType.ToLower().Contains(searchType) &&
        //                       (searchCreatedTime == null || a.CreatedTime == searchCreatedTime) &&
        //                       (searchUpdatedTime == null || a.UpdatedTime == searchUpdatedTime))
        //                select new
        //                {
        //                    id = a.Id,
        //                    type = a.FileType,
        //                    title = a.Title,
        //                    description = a.Description,
        //                    createdTime = a.CreatedTime,
        //                    updatedTime = a.UpdatedTime
        //                };

        //    var count = query.Count();
        //    var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
        //    var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "id", "type", "title", "description", "createdTime", "updatedTime");
        //    return Json(jdata);
        //}

        //[HttpPost]
        //public JsonResult InsertFile([FromBody]CustomerFile obj)
        //{
        //    var msg = new JMessage { Error = false, Title = "" };
        //    try
        //    {
        //        obj.FileType = System.IO.Path.GetExtension(obj.FileName);
        //        obj.CreatedTime = DateTime.Now.Date;
        //        _context.CustomerFiles.Add(obj);
        //        _context.SaveChanges();
        //        msg.Title = "Thêm tệp tin thành công!";
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Title = "Có lỗi xảy ra!";
        //    }
        //    return Json(msg);
        //}

        //[HttpPost]
        //public JsonResult UpdateFile([FromBody]CustomerFile obj)
        //{
        //    var msg = new JMessage { Error = false, Title = "" };
        //    try
        //    {
        //        obj.UpdatedTime = DateTime.Now.Date;
        //        _context.CustomerFiles.Update(obj);
        //        _context.SaveChanges();
        //        msg.Title = "Chỉnh sửa tệp tin thành công!";
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Title = "Có lỗi xảy ra!";
        //        msg.Object = ex;
        //    }
        //    return Json(msg);
        //}

        //[HttpPost]
        //public JsonResult DeleteFile(int id)
        //{
        //    var msg = new JMessage { Error = false, Title = "" };
        //    try
        //    {
        //        var data = _context.CustomerFiles.FirstOrDefault(x => x.Id == id);
        //        data.IsDeleted = true;
        //        data.DeletedTime = DateTime.Now.Date;
        //        data.DeletedBy = ESEIM.AppContext.UserName;
        //        _context.CustomerFiles.Update(data);
        //        _context.SaveChanges();
        //        msg.Title = "Xóa tệp tin thành công";
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Title = ex.Message;
        //    }
        //    return Json(msg);
        //}

        //[HttpGet]
        //public object GetFile(int id)
        //{
        //    var a = _context.CustomerFiles.AsNoTracking().Single(m => m.Id == id);
        //    return Json(a);
        //}

        //[HttpPost]
        //public object UploadFile(IFormFile fileUpload)
        //{
        //    var msg = new JMessage { Error = false, Title = "" };
        //    try
        //    {
        //        var upload = _upload.UploadFile(fileUpload, Path.Combine(_hostingEnvironment.WebRootPath, "uploads\\files"));
        //        if (upload.Error)
        //        {
        //            msg.Error = true;
        //            msg.Title = upload.Title;
        //        }
        //        else
        //        {
        //            msg.Object = upload.Object;
        //        }

        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Title = "Có lỗi xảy ra khi upload file!";
        //    }
        //    return Json(msg);
        //}
        //#endregion

        #region Contact
        public class JtableModelContact : JTableModel
        {
            public int? CustomerId { get; set; }
            public string ContactName { get; set; }
            public string ContactEmail { get; set; }
            public string ContactTelephone { get; set; }
            public string ContactMobilePhone { get; set; }
        }

        [HttpPost]
        public object JTableContact([FromBody]JtableModelContact jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            int? customerId = jTablePara.CustomerId;
            string contactName = jTablePara.ContactName.ToLower();
            string contactEmail = jTablePara.ContactEmail.ToLower();
            string contactTelephone = jTablePara.ContactTelephone;
            string contactMobilePhone = jTablePara.ContactMobilePhone;

            var query = from a in _context.Contacts
                        //where (a.ContactType == customerId && a.ContactType != null &&
                        //       a.IsDeleted == false &&
                        //       a.Email.ToLower().Contains(contactEmail) &&
                        //       a.ContactName.ToLower().Contains(contactName) &&
                        //       a.Telephone.Contains(contactTelephone) &&
                        //       a.MobilePhone.Contains(contactMobilePhone))
                        select new
                        {
                            id = a.Id,
                            contactName = a.ContactName,
                            contactEmail = a.Email,
                            contactAddress = a.Address,
                            contactTelephone = a.Telephone,
                            contactMobilePhone = a.MobilePhone,
                        };

            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "id", "contactName", "contactEmail", "contactAddress", "contactTelephone", "contactMobilePhone");

            return Json(jdata);
        }

        [HttpPost]
        public object InsertContact([FromBody]Contact obj)
        {
            var msg = new JMessage();
            try
            {
                obj.CreateTime = DateTime.Now.Date;
                _context.Contacts.Add(obj);
                _context.SaveChanges();
                msg.Error = false;
                msg.Title = "Thêm thành công";
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra!";
                msg.Object = ex;
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
        public object DeleteContact(int id)
        {
            var msg = new JMessage();
            try
            {
                var data = _context.Contacts.FirstOrDefault(x => x.Id == id);
                data.IsDeleted = true;
                _context.Contacts.Update(data);
                _context.SaveChanges();
                msg.Error = false;
                msg.Title = "Xóa thành công";
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra!";
                msg.Object = ex;
                return Json(msg);
            }
        }
        [HttpGet]
        public object GetItemAdd(string code)
        {
            var a = _context.Customerss.FirstOrDefault(m => m.CusCode == code);
            return Json(a);
        }
        [HttpGet]
        public object GetContact(int id)
        {
            var data = _context.Contacts.FirstOrDefault(x => x.Id == id);
            return Json(data);
        }

        [HttpPost]
        public object UpdateContact([FromBody]Contact obj)
        {
            var msg = new JMessage();
            try
            {
                obj.UpdateTime = DateTime.Now.Date;
                _context.Contacts.Update(obj);
                _context.SaveChanges();
                msg.Error = false;
                msg.Title = "Cập nhật thành công";
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra!";
                msg.Object = ex;
                return Json(msg);
            }
        }

        [HttpPost]
        public JsonResult GetAgentForShop()
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = (from a in _context.Customerss
                            where !string.IsNullOrEmpty(a.Role) && a.Role != EnumHelper<RoleEnum>.GetDisplayValue(RoleEnum.SHOP)
                            select new
                            {
                                Code = a.CusCode,
                                Name = a.CusName
                            }).ToList();
                msg.Object = data;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult GetAgentForAgent()
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = (from a in _context.Customerss
                            where a.Role == EnumHelper<RoleEnum>.GetDisplayValue(RoleEnum.DISTRIBUTOR)
                            select new
                            {
                                Code = a.CusCode,
                                Name = a.CusName
                            }).ToList();
                msg.Object = data;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
            }
            return Json(msg);
        }
        #endregion

        #region Extend
        public class JTableModelExtend : JTableModel
        {
            public int? CustomerId { get; set; }
            public string Extvalue { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
        }

        [HttpPost]
        public object JTableExtend([FromBody]JTableModelExtend jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            int? customerId = jTablePara.CustomerId;
            DateTime? fromdate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            DateTime? todate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var query = from a in _context.CustomerExtends
                        where (a.isdeleted == false &&
                               a.customer_id == customerId)
                               && a.isdeleted == false
                               && ((fromdate == null || (a.created_time >= fromdate)) && (todate == null || (a.created_time <= todate)))
                               && (string.IsNullOrEmpty(jTablePara.Extvalue) || a.ext_value.ToLower().Contains(jTablePara.Extvalue.ToLower()))
                        select new
                        {
                            id = a.id,
                            code = a.ext_code,
                            value = a.ext_value,
                            created_time = a.created_time.Value.ToString("dd/MM/yyyy HH:mm:ss")
                        };
            int count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "id", "code", "value", "created_time");

            return Json(jdata);
        }

        [HttpPost]
        public object DeleteExtend(int id)
        {
            var msg = new JMessage();
            try
            {
                var data = _context.CustomerExtends.FirstOrDefault(x => x.id == id);
                data.isdeleted = true;
                _context.CustomerExtends.Update(data);
                _context.SaveChanges();
                msg.Error = false;
                msg.Title = "Xóa thành công";
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra!";
                msg.Object = ex;
                return Json(msg);
            }

        }

        [HttpPost]
        public object InsertExtend([FromBody]CustomerExtend obj)
        {
            var msg = new JMessage();
            try
            {
                var query = from a in _context.CustomerExtends
                            where a.ext_code == obj.ext_code && a.isdeleted == false
                            select a;
                if (query.Count() == 0)
                {
                    obj.created_time = DateTime.Now;
                    obj.isdeleted = false;
                    _context.CustomerExtends.Add(obj);
                    _context.SaveChanges();
                    msg.Error = false;
                    msg.Title = "Thêm trường mở rộng thành công!";

                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Mã trường mở rộng đã tồn tại!";

                }
                return Json(msg);
            }
            catch
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra!";

                return Json(msg);
            }

        }
        [HttpGet]
        public object GetExtend(int id)
        {
            var data = _context.CustomerExtends.FirstOrDefault(x => x.id == id);
            return Json(data);
        }

        [HttpPost]
        public object UpdateExtend([FromBody]CustomerExtend obj)
        {
            var msg = new JMessage();
            try
            {
                obj.updated_time = DateTime.Now.Date;
                _context.CustomerExtends.Update(obj);
                _context.SaveChanges();
                msg.Error = false;
                msg.Title = "Cập nhật thành công";
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra!";
                msg.Object = ex;
                return Json(msg);
            }
        }
        #endregion
        [HttpPost]
        public JsonResult InsertGisMap(Customers obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var googleMapString = obj.GoogleMap;
                if (googleMapString.Length > 0)
                {
                    var gps = googleMapString.Split(",");
                    Map map = new Map();
                    GisObject gisObject = new GisObject();
                    for (var item = 0; item < 3; ++item)
                    {
                        List<double> m = new List<double>();
                        m.Add((Double.Parse(gps[1].Trim())) * 20037508.34 / 180);
                        m.Add((Math.Log(Math.Tan((90 + (Double.Parse(gps[0].Trim()))) * Math.PI / 360)) / (Math.PI / 180)) * 20037508.34 / 180);
                        gisObject.geometry.coordinates[0].Add(m);
                    }

                    map.gis_data = gisObject.geometry.coordinates;
                    map.properties = new MapProperties
                    {
                        fill_color = "#64c936",
                        text = obj.CusName,
                        font_size = "12"
                    };

                    var model = new MapDataGps
                    {
                        Title = obj.CusName,
                        PolygonGPS = JsonConvert.SerializeObject(map),
                        ObjCode = obj.CusCode,
                        Icon = "/images/map/pinmap_start.png",
                        IsActive = true,
                        IsDefault = true,
                        MakerGPS = googleMapString,
                        CreatedTime = DateTime.Now,
                        CreatedBy = ESEIM.AppContext.UserName,
                    };
                    //fix cứng 1 icon nếu icon truyền lên bị null
                    _context.MapDataGpss.Add(model);
                    //_context.SaveChanges();
                    //msg.Title = "Thêm mới địa điểm thành công";
                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Thêm mới địa điểm lỗi";
            }
            return Json(msg);
        }

        public class JTableModelCustomer : JTableModel
        {
            public string CustomerCode { get; set; }
            public string CustomerName { get; set; }
            public string CustomerPhone { get; set; }
            public string CustomerEmail { get; set; }
            public string Area { get; set; }
            public string CustomerActivityStatus { get; set; }
            public string Address { get; set; }
            public string CustomerRole { get; set; }

        }
        public class JTableModelTrade : JTableModel
        {
            public int Id { get; set; }
        }
        public class JTableModelTransporter : JTableModel
        {
            public int Id { get; set; }
        }
        public class TradeRes
        {
            public int Id { get; set; }
            public string ProductCode { get; set; }
            public string ProductName { get; set; }
            public string Brand { get; set; }
            public string txtBrand { get; set; }
            public string Seller { get; set; }
            public string txtSeller { get; set; }
            public double? CostBuy { get; set; }
            public double? CostSell { get; set; }
            public string SellerRole { get; set; }

        }
        public class TransporterRes
        {
            public int Id { get; set; }
            public string LicensePlate { get; set; }
            public string Owned { get; set; }
            public string CustomType { get; set; }
            public string CustomTypeTxt { get; set; }
            public string RegistryDuration { get; set; }
            public string InsurranceDuration { get; set; }

        }
        public class VcTransporterInsertModel
        {
            public int Id { get; set; }
            public string Code { get; set; }
            public int? DriverId { get; set; }

            public string CompanyCode { get; set; }

            public string Name { get; set; }



            public string Group { get; set; }

            public string Image { get; set; }

            public string Origin { get; set; }

            public string Generic { get; set; }

            public string LicensePlate { get; set; }
            public int? Number { get; set; }
            public int? YearManufacture { get; set; }
            public string OwnerCode { get; set; }
            public string Category { get; set; }
            public int? WeightItself { get; set; }
            public int? DesignPayload { get; set; }
            public int? PayloadPulled { get; set; }
            public int? PayloadTotal { get; set; }
            public string SizeRegistry { get; set; }
            public string SizeUse { get; set; }
            public DateTime? RegistryDuration { get; set; }
            public DateTime? InsurranceDuration { get; set; }
            public string Note { get; set; }
            public string PositionGps { get; set; }
            public string PositionText { get; set; }
            public int SumDistance { get; set; }
            public string RomoocCode { get; set; }
            public DateTime CreatedTime { get; set; }
            public string CreatedBy { get; set; }
            public DateTime UpdatedTime { get; set; }
            public string UpdatedBy { get; set; }
            public string CustomType { get; set; }
            public bool IsDeleted { get; set; }
            public string RegistryDurationTxt { get; set; }
            public string InsurranceDurationTxt { get; set; }
        }

    }
    public class VcVendorListModel
    {
        public int id { get; set; }
        public string cusCode { get; set; }
        public string cusName { get; set; }
        public string cusEmail { get; set; }
        public string cusAddress { get; set; }
        public string cusMobilePhone { get; set; }
        public string cusRole { get; set; }
        public string cusActivity { get; set; }
    }
}
