using ESEIM.Models;
using ESEIM.Utils;

using FTU.Utils.HelperNet;
using III.Admin.Controllers;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;


namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class RMVayxeBookCheckingController : BaseController
    {
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly EIMDBContext _context;
        private readonly ILogger _logger;
        private readonly IActionLogService _actionLog;

        public RMVayxeBookCheckingController(EIMDBContext context, ILogger<RMVayxeBookCheckingController> logger, IHostingEnvironment hostingEnvironment, IActionLogService actionLog)
        {
            _context = context;
            _logger = logger;
            _hostingEnvironment = hostingEnvironment;
            _actionLog = actionLog;

        }
        public IActionResult Index()
        {
            ViewData["Message"] = "SỔ BẢO DƯỠNG";
            return View("Index");
        }
        public class VayxeServiceDetails
        {
            public int id { get; set; }
            public int service_id { get; set; }
            public int status { get; set; }
            public string note { get; set; }

        }
        public class VayxeMaterialDetails
        {
            public int id { get; set; }
            public int material_id { get; set; }
            public int status { get; set; }
            public string note { get; set; }
            public int amount { get; set; }
            public float price { get; set; }

        }
        public class JTableModelCustom : JTableModel
        {            
            public string Key { get; set; }
            public string Key1 { get; set; }
            public string Key2 { get; set; }
            public string Key3 { get; set; }
        }
        [HttpPost]
        public object jtable([FromBody]JTableModelCustom JTablePara)
        {
            int intBeginFor = (JTablePara.CurrentPage - 1) * JTablePara.Length;
            var query = from a in _context.RmVayxeBookCheckings
                            //join b in _context.RemooRemoocs on a.License_plate equals b.LisencePlate
                        where a.IsDeleted == true && (JTablePara.Key == null || JTablePara.Key == "" || a.TitleChk.ToLower().Contains(JTablePara.Key.ToLower()) || a.BookChkCode.ToLower().Contains(JTablePara.Key.ToLower()))
                              // && (JTablePara.Key2 == null || JTablePara.Key2 == "" || b.LisencePlate.ToLower().Contains(JTablePara.Key2.ToLower()))
                              && (JTablePara.Key3 == null || JTablePara.Key3 == "" || JTablePara.Key3 == a.VendorCode)
                        select new
                        {
                            Id = a.Id,
                            name_book = a.TitleChk,
                            book_code = a.BookChkCode,
                            //name_car = b.Name_car,
                            //license_plate = b.LisencePlate,
                            num_chk = a.NumChk,
                            next_chk_time = a.NextChkTime,
                            approver_id = a.ApproverId,
                            status = a.Status,
                            note = a.Note

                        };
            var count = query.Count();
            var data = query
                  .OrderUsingSortExpression(JTablePara.QueryOrderBy).Skip(intBeginFor).Take(JTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, JTablePara.Draw, count, "Id", "name_book", "book_code", "num_chk", "next_chk_time", "approver_id", "status", "note");
            return Json(jdata);
        }

        [HttpPost]
        public object Delete(int id)
        {
            var msg = new JMessage { Error = true };
            try
            {
                var obj2 = _context.RmVayxeBookCheckings.FirstOrDefault(x => x.Id == id);
                obj2.IsDeleted = false;
                _context.RmVayxeBookCheckings.Update(obj2);
                _context.SaveChanges();
                msg.Error = false;
                msg.Title = String.Format(CommonUtil.ResourceValue("RMVBC_MSG_CANCEL_SUCCESS_TRIP"));// "Hủy chuyến thành công";
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("RMVBC_MSG_DELETE_ERROR"));// "Có lỗi khi xóa.";
                return Json(msg);
            }
        }
        [HttpPost]
        public object deleteItems([FromBody]List<int> listId)
        {
            var msg = new JMessage { Error = false };
            try
            {
                foreach (var id in listId)
                {
                    var obj2 = _context.RmVayxeBookCheckings.FirstOrDefault(x => x.Id == id);
                    obj2.IsDeleted = false;
                    _context.RmVayxeBookCheckings.Update(obj2);
                    _context.SaveChanges();

                    msg.Error = false;
                    msg.Title = String.Format(CommonUtil.ResourceValue("RMVBC_MSG_CANCEL_SUCCESS_TRIP"));//"Hủy chuyến thành công";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(CommonUtil.ResourceValue("MSG_DELETE_LIST_FAIL"), CommonUtil.ResourceValue("RESOURCE"));
                //_logger.LogError(LoggingEvents.LogDb, "Delete list Resource fail");
            }
            return Json(msg);
        }
        [HttpGet]
        public object getItem(int id)
        {
            try
            {
                var booking = _context.RmVayxeBookCheckings.SingleOrDefault(x => x.Id == id);
                var query = from a in _context.RmVayxeBookCheckings
                                //join b in _context.Vayxe_Cars on a.License_plate equals b.License_plate
                            select new
                            {
                                Id = a.Id,
                                title_chk = a.TitleChk,
                                book_chk_code = a.BookChkCode,
                                block_id = a.BlockId,
                                //Name_car = b.Name_car,
                                //License_plate = b.License_plate,
                                num_chk = a.NumChk,
                                next_chk_time = a.NextChkTime,
                                approver_id = a.ApproverId,
                                status = a.Status,
                                note = a.Note
                            };
                var data = query.Where(x => x.Id == id);
                return Json(data);
            }
            catch (Exception ex)
            {
                return Json(new JMessage() { Error = true, Title = "Get Item fail!" });
            }
        }
        [HttpPost]
        public async Task<JsonResult> Update([FromBody]RmVayxeBookChecking obj)
        {
            var msg = new JMessage() { Error = true };
            try
            {
                var data = _context.RmVayxeBookCheckings.FirstOrDefault(x => x.Id == obj.Id);
                if (data != null)
                {
                    if (_context.RmVayxeBookCheckings.FirstOrDefault(x => x.BookChkCode == obj.BookChkCode && x.Id != data.Id) != null)
                    {

                        msg.Title = String.Format(CommonUtil.ResourceValue("RMVBC_MSG_ID_ALREADY_EXIST"));//"Đã tồn tại mã này!";
                        msg.Error = true;
                        return Json(msg);

                    }
                    data.TitleChk = obj.TitleChk;
                    data.BookChkCode = obj.BookChkCode;
                    data.NextChkTime = obj.NextChkTime;
                    data.NumChk = obj.NumChk;
                    data.Note = obj.Note;
                    data.Status = obj.Status;
                    data.BlockId = obj.BlockId;
                    data.ApproverId = obj.ApproverId;
                    data.UpdatedTime = DateTime.Now;
                    _context.RmVayxeBookCheckings.Update(data);

                    await _context.SaveChangesAsync();
                    msg.Title = String.Format(CommonUtil.ResourceValue("RMVBC_MSG_UPDATE_SUCCESS"));//"Cập nhật thông tin thành công";
                    msg.Error = false;

                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(CommonUtil.ResourceValue("RMVBC_MSG_UPDATE_ERROR"));//"Có lỗi khi cập nhật";

            }
            return Json(msg);
        }
        [HttpPost]
        public async Task<JsonResult> Insert([FromBody] RmVayxeBookChecking obj)
        {
            var msg = new JMessage()
            {
                Error = true
            };
            try
            {
                if (_context.RmVayxeBookCheckings.FirstOrDefault(x => x.BookChkCode == obj.BookChkCode) != null)
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("RMVBC_MSG_ID_ALREADY_EXIST"));//"Mã này đã tồn tại!";
                }
                obj.IsDeleted = true;
                obj.CreatedTime = DateTime.Now;
                _context.RmVayxeBookCheckings.Add(obj);
                await _context.SaveChangesAsync();
                msg.Title = String.Format(CommonUtil.ResourceValue("RMVBC_MSG_ADD_SUCCESS"));//"Thêm thành công";
                msg.Object = obj;
                msg.Error = false;
            }
            catch (Exception ex)
            {
                msg.ID = 0;
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(CommonUtil.ResourceValue("RMVBC_MSG_ADD_ERROR"));//"Có lỗi khi thêm khoản mục";
            }
            return Json(msg);
        }
        //[HttpPost]
        //public object gettreedata()
        //{
        //    var msg = new JMessage { Error = true };

        //    try
        //    {
        //        var data = _context.RmVayxeCarss.OrderBy(x => x.LicensePlate);
        //        msg.Object = data;
        //        msg.Error = false;
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Title = "Get Parent Group fail ";
        //    }

        //    return Json(msg);
        //}
        [HttpPost]
        public object table_Services([FromBody]JTableModelCustom JTablePara)
        {
            int intBeginFor = (JTablePara.CurrentPage - 1) * JTablePara.Length;
            var query = from a in _context.RmVayxeBookServiceDetailss
                        join b in _context.RmVayxeCatSevicess on a.ServiceId equals b.Id
                        where a.Flag == 1 && a.BookChkId.ToString() == JTablePara.Key
                        //where a.flag == true && (JTablePara.Key == null || JTablePara.Key == "" || a.title_chk.ToLower().Contains(JTablePara.Key.ToLower()) || a.book_chk_code.ToLower().Contains(JTablePara.Key.ToLower()))
                        //      && (JTablePara.Key2 == null || JTablePara.Key2 == "" || b.License_plate.ToLower().Contains(JTablePara.Key2.ToLower()))
                        //      && (JTablePara.Key3 == null || JTablePara.Key3 == a.status.ToString())
                        select new
                        {
                            Id = a.Id,
                            service_name = b.ServiceName,
                            note = a.Note,
                            status = a.Status,
                            created_time = a.CreatedTime

                        };
            var count = query.Count();
            var data = query
                  .OrderUsingSortExpression(JTablePara.QueryOrderBy).Skip(intBeginFor).Take(JTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, JTablePara.Draw, count, "Id", "service_name", "note", "status", "created_time");
            return Json(jdata);
        }
        [HttpPost]
        public object gettreedata_1()
        {
            var msg = new JMessage { Error = true };

            try
            {
                var data = _context.RmVayxeCatSevicess.OrderBy(x => x.Id);
                msg.Object = data;
                msg.Error = false;
            }
            catch (Exception ex)
            {
                msg.Title = "Get Parent Group fail ";
            }

            return Json(msg);
        }
        [HttpPost]
        public JsonResult Insert_1([FromBody]VayxeServiceDetails obj)
        {
            var msg = new JMessage()
            {
                Error = true
            };
            try
            {
                var data = new RmVayxeBookServiceDetails();
                data.BookChkId = obj.id;
                data.ServiceId = obj.service_id;
                data.Note = obj.note;
                data.Status = obj.status;
                data.Flag = 1;
                data.CreatedTime = DateTime.Now;
                _context.RmVayxeBookServiceDetailss.Add(data);
                _context.SaveChanges();
                msg.Title = String.Format(CommonUtil.ResourceValue("RMVBC_MSG_ADD_SUCCESS"));//"Thêm thành công";
                msg.Object = obj;
                msg.Error = false;
            }
            catch (Exception ex)
            {
                msg.ID = 0;
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(CommonUtil.ResourceValue("RMVBC_MSG_ADD_ERROR"));//"Có lỗi khi thêm khoản mục";
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult Insert_Material([FromBody]VayxeMaterialDetails obj)
        {
            var msg = new JMessage()
            {
                Error = true
            };
            try
            {
                var data = new RmVayxeBookMaterialDetails();
                data.BookChkId = obj.id;
                data.MaterialId = obj.material_id;
                data.Note = obj.note;
                data.Status = obj.status;
                data.Price = obj.price;
                data.Amount = obj.amount;
                data.Flag = 1;
                data.CreatedTime = DateTime.Now;
                _context.RmVayxeBookMaterialDetailss.Add(data);
                _context.SaveChanges();
                msg.Title = String.Format(CommonUtil.ResourceValue("RMVBC_MSG_ADD_SUCCESS"));//"Thêm thành công";
                msg.Object = obj;
                msg.Error = false;
            }
            catch (Exception ex)
            {
                msg.ID = 0;
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(CommonUtil.ResourceValue("RMVBC_MSG_ADD_ERROR"));//"Có lỗi khi thêm khoản mục";
            }
            return Json(msg);
        }
        [HttpPost]
        public object Delete_Serevices(int id)
        {
            var msg = new JMessage { Error = true };
            try
            {
                var obj2 = _context.RmVayxeBookServiceDetailss.FirstOrDefault(x => x.Id == id);
                obj2.Flag = 0;
                _context.RmVayxeBookServiceDetailss.Update(obj2);
                _context.SaveChanges();
                msg.Error = false;
                msg.Title = String.Format(CommonUtil.ResourceValue("RMVBC_MSG_CANCEL_SUCCESS_TRIP"));//"Hủy chuyến thành công";
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("RMVBC_MSG_DELETE_ERROR"));// "Có lỗi khi xóa.";
                return Json(msg);
            }
        }
        [HttpGet]
        public object getItem_1(int id)
        {
            try
            {
                var booking = _context.RmVayxeBookServiceDetailss.SingleOrDefault(x => x.Id == id);
                var query = from a in _context.RmVayxeBookServiceDetailss
                            select new
                            {
                                Id = a.Id,
                                service_id = a.ServiceId,
                                note = a.Note,
                                status = a.Status,
                                created_time = a.CreatedTime
                            };
                var data = query.Where(x => x.Id == id);
                return Json(data);
            }
            catch (Exception ex)
            {
                return Json(new JMessage() { Error = true, Title = "Get Item fail!" });
            }
        }
        [HttpGet]
        public object getItem_2(int id)
        {
            try
            {
                var material = _context.RmVayxeBookMaterialDetailss.SingleOrDefault(x => x.Id == id);
                var query = from a in _context.RmVayxeBookMaterialDetailss

                            select new
                            {
                                id = a.Id,
                                material_id = a.MaterialId,
                                note = a.Note,
                                status = a.Status,
                                created_time = a.CreatedTime,
                                amount = a.Amount,
                                price = a.Price

                            };
                var data = query.Where(x => x.id == id);
                return Json(data);
            }
            catch (Exception ex)
            {
                return Json(new JMessage() { Error = true, Title = "Get Item fail!" });
            }
        }
        [HttpPost]
        public async Task<JsonResult> UpdateServices([FromBody]RmVayxeBookServiceDetails obj)
        {
            var msg = new JMessage() { Error = true };
            try
            {
                var data = _context.RmVayxeBookServiceDetailss.SingleOrDefault(x => x.Id == obj.Id);
                if (data != null)
                {

                    data.Note = obj.Note;
                    data.Status = obj.Status;
                    data.ServiceId = obj.ServiceId;
                    data.UpdatedTime = DateTime.Now;
                    _context.RmVayxeBookServiceDetailss.Update(data);

                    await _context.SaveChangesAsync();
                    msg.Title = String.Format(CommonUtil.ResourceValue("RMVBC_MSG_UPDATE_SUCCESS"));//"Cập nhật thông tin thành công";
                    msg.Error = false;

                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(CommonUtil.ResourceValue("RMVBC_MSG_UPDATE_ERROR"));//"Có lỗi khi cập nhật";

            }
            return Json(msg);
        }
        [HttpPost]
        public object tableMaterial([FromBody]JTableModelCustom JTablePara)
        {
            int intBeginFor = (JTablePara.CurrentPage - 1) * JTablePara.Length;
            var query = from a in _context.RmVayxeBookMaterialDetailss
                        join b in _context.RmVayxeMaterialGoodss on a.MaterialId equals b.Id
                        where a.Flag == 1 && a.BookChkId.ToString() == JTablePara.Key
                        //where a.flag == true && (JTablePara.Key == null || JTablePara.Key == "" || a.title_chk.ToLower().Contains(JTablePara.Key.ToLower()) || a.book_chk_code.ToLower().Contains(JTablePara.Key.ToLower()))
                        //      && (JTablePara.Key2 == null || JTablePara.Key2 == "" || b.License_plate.ToLower().Contains(JTablePara.Key2.ToLower()))
                        //      && (JTablePara.Key3 == null || JTablePara.Key3 == a.status.ToString())
                        select new
                        {
                            Id = a.Id,
                            product_name = b.ProductName,
                            amount = a.Amount,
                            price = a.Price,
                            note = a.Note,
                            status = a.Status,
                            created_time = a.CreatedTime
                        };
            var count = query.Count();
            var data = query
                  .OrderUsingSortExpression(JTablePara.QueryOrderBy).Skip(intBeginFor).Take(JTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, JTablePara.Draw, count, "Id", "product_name", "amount", "price", "note", "status", "created_time");
            return Json(jdata);
        }
        [HttpPost]
        public object gettreedata_2()
        {
            var msg = new JMessage { Error = true };

            try
            {
                var data = _context.RmVayxeMaterialGoodss.OrderBy(x => x.Id);
                msg.Object = data;
                msg.Error = false;
            }
            catch (Exception ex)
            {
                msg.Title = "Get Parent Group fail ";
            }

            return Json(msg);
        }
        [HttpPost]
        public object Delete_Material(int id)
        {
            var msg = new JMessage { Error = true };
            try
            {
                var obj2 = _context.RmVayxeBookMaterialDetailss.FirstOrDefault(x => x.Id == id);
                obj2.Flag = 0;
                _context.RmVayxeBookMaterialDetailss.Update(obj2);
                _context.SaveChanges();
                msg.Error = false;
                msg.Title = String.Format(CommonUtil.ResourceValue("RMVBC_MSG_CANCEL_SUCCESS_SUPPLIES"));// "Hủy vật tư thành công";
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("RMVBC_MSG_DELETE_ERROR"));//"Có lỗi khi xóa.";
                return Json(msg);
            }
        }
        [HttpPost]
        public async Task<JsonResult> UpdateMaterial([FromBody]RmVayxeBookMaterialDetails obj)
        {
            var msg = new JMessage() { Error = true };
            try
            {
                var data = _context.RmVayxeBookMaterialDetailss.SingleOrDefault(x => x.Id == obj.Id);
                if (data != null)
                {
                    data.Amount = obj.Amount;
                    data.Price = obj.Price;
                    data.Note = obj.Note;
                    data.Status = obj.Status;
                    data.MaterialId = obj.MaterialId;
                    data.UpdatedTime = DateTime.Now;
                    _context.RmVayxeBookMaterialDetailss.Update(data);

                    await _context.SaveChangesAsync();
                    msg.Title = String.Format(CommonUtil.ResourceValue("RMVBC_MSG_UPDATE_SUCCESS"));//"Cập nhật thông tin thành công";
                    msg.Error = false;

                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(CommonUtil.ResourceValue("RMVBC_MSG_UPDATE_ERROR"));//"Có lỗi khi cập nhật";

            }
            return Json(msg);
        }
        [HttpPost]
        public object gettreedata_Vendor()
        {
            var msg = new JMessage { Error = true };

            try
            {
                var data = _context.RmVayxeVendors.OrderBy(x => x.VendorCode);
                msg.Object = data;
                msg.Error = false;
            }
            catch (Exception ex)
            {
                msg.Title = "Get Parent Group fail ";
            }

            return Json(msg);
        }
    }
}