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

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class RMJnanaTokenController : BaseController
    {
        public class JTableModelCustom : JTableModel
        {
            public string Name { get; set; }
            public string MaKey { get; set; }
            public int IdTable { get; set; }
        }

        public class ObjActive
        {
            public int Id { get; set; }
            public int Status { get; set; }
        }

        private readonly EIMDBContext _context;
        private readonly IActionLogService _actionLog;
        public RMJnanaTokenController(EIMDBContext context,IActionLogService actionLog)
        {
            _context = context;
            _actionLog = actionLog;
        }

        public IActionResult Index()
        {
            ViewData["Message"] = "GOOGLE TOKEN";
            return View("Index");
        }


        [HttpPost]
        public object JTable([FromBody]JTableModelCustom jTablePara)
        {

            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.RmJnanaApiGoogleServicess
                        where a.Key.ToLower().Contains(jTablePara.Name.ToLower()) 
                        select new GoogleToken
                        {
                            Id = a.Id,
                            Description = a.Description,
                            Key = a.Key,
                            Limit = a.Limit,
                            Service_type = a.ServiceType,
                            Status =1
                        };

            var count = query.Count();
            var data = query
                .OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            DateTime dt = DateTime.Now;
            foreach(var item in data)
            {
               var q1 = _context.RmJnanaCountRequestGoogles.Where(x=>x.Key==item.Key && x.UpdateTime.Date==dt.Date &&x.ServiceType==item.Service_type).Sum(x=>x.NumRequest);
                if (q1 >= item.Limit)
                    item.Status = 0;
            }
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "Description", "Key", "Limit", "Service_type","Status");
            return Json(jdata);
        }


        [HttpPost]
        public object JtableDetail([FromBody]JTableModelCustom jTablePara)
        {

            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.RmJnanaCountRequestGoogles
                        where a.Key.ToLower().Contains(jTablePara.MaKey.ToLower()) || jTablePara.MaKey == null || jTablePara.MaKey ==""
                        select new
                        {
                            Id = a.Id,
                            Create_time = a.CreateTime,
                            Is_limit = a.IsLimit,
                            Key = a.Key,
                            Num_request = a.NumRequest,
                            Service_type = a.ServiceType,
                            device = a.Device         
                        };

            var count = query.Count();
            var data = query
                .OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();


            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "Create_time", "Is_limit", "Key", "Num_request", "Service_type", "device");
            return Json(jdata);
        }    

        [HttpGet]
        public object GetItem(int? id)
        {

            if (id == null || id < 0)
            {
                return Json("");
            }
            var a = _context.RmJnanaApiGoogleServicess.AsNoTracking().Single(m => m.Id == id);
            if(a != null) { return Json(a); }
            else { return Json(1); }
            
        }


        [HttpPost]
        public JsonResult Insert([FromBody]RmJnanaApiGoogleServices obj)
        {
            var msg = new JMessage() { Error = false, ID = 1 };
            try
            {
                _context.RmJnanaApiGoogleServicess.Add(obj);
                var b = _context.SaveChanges();
                msg.Title = String.Format(CommonUtil.ResourceValue("RMJT_MSG_ADD_TOOKEN_SUCCESS"));// "Thêm token thành công";
                msg.Object = obj;

                msg.ID = 1;
                msg.Error = false;

            }
            catch (Exception ex)
            {
                msg.ID = 0;
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(CommonUtil.ResourceValue("RMJT_MSG_ADD_ERROR"));//"Có lỗi khi thêm khoản mục";
            }
            return Json(msg);
        }


        [HttpPost]
        public JsonResult Update([FromBody]RmJnanaApiGoogleServices obj)
        {
            var msg = new JMessage() { Error = false, ID = 1 };
            try
            {
                var c = _context.RmJnanaApiGoogleServicess.SingleOrDefault(x => x.Id == obj.Id);
                c.Description = obj.Description;
                c.Key = obj.Key;
                c.Limit = obj.Limit;
                c.ServiceType = obj.ServiceType;
                _context.RmJnanaApiGoogleServicess.Update(c);
                var b = _context.SaveChanges();
                msg.Title = String.Format(CommonUtil.ResourceValue("RMJT_MSG_EDIT_TOOKEN_SUCCESS"));//""Chỉnh sửa token thành công";
                msg.Object = obj;

                msg.ID = 1;
                msg.Error = false;

            }
            catch (Exception ex)
            {
                msg.ID = 0;
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(CommonUtil.ResourceValue("RMJT_MSG_EDIT_ERROR"));//"Có lỗi khi sửa khoản mục";
            }
            return Json(msg);
        }


        [HttpPost]
        public object DeleteItems([FromBody]List<int> listIdI)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                foreach (var id in listIdI)
                {
                    var obj = _context.RmJnanaApiGoogleServicess.FirstOrDefault(x => x.Id == id);
                    if (obj != null)
                    {
                    
                        _context.Remove(obj);
                        _context.SaveChanges();
                    }
                }
                msg.Title = String.Format(CommonUtil.ResourceValue("RMJT_MSG_DELETE_TOOKEN_SUCCESS"));//"Xóa token thành công";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(CommonUtil.ResourceValue("RMJT_MSG_DELETE_TOOKEN_ERROR"));//"Xóa token thất bại";
            }
            return Json(msg);
        }


        [HttpPost]
        public object DeleteItemsDetail(int Id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                
                    var obj = _context.RmJnanaCountRequestGoogles.FirstOrDefault(x => x.Id == Id);
                    if (obj != null)
                    {                       
                        _context.Remove(obj);
                        _context.SaveChanges();
                    msg.Title = String.Format(CommonUtil.ResourceValue("RMJT_MSG_DELETE_RECORD_SUCCESS"));//"Xóa bản ghi thành công";
                    msg.Error = false;
                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(CommonUtil.ResourceValue("RMJT_MSG_DELETE_RECORD_ERROR"));//"Xóa bản ghi thất bại";
            }
            return Json(msg);
        }


        [HttpPost]
        public async Task<JsonResult> CountRequest(RmJnanaCountRequestGoogle obj)
        {
            var msg = new JMessage() { Error = false };
            var DateTimeNow = DateTime.Now.AddHours(-14).ToString("MM/dd/yyyy");
            try
            {
                var check = await _context.RmJnanaCountRequestGoogles.FirstOrDefaultAsync(x => x.Date == DateTimeNow && x.ServiceType == obj.ServiceType && x.Key == obj.Key);
                if (check == null)
                {
                    obj.Date = DateTimeNow;
                    obj.CreateTime = DateTime.Now;
                    obj.UpdateTime = DateTime.Now;
                    _context.RmJnanaCountRequestGoogles.Add(obj);
                    var a = await _context.SaveChangesAsync();
                    msg.Title = String.Format(CommonUtil.ResourceValue("RMJT_MSG_ADD_SUCCESS"));//"Thêm khoản mục thành công";
                    msg.Object = obj;
                    msg.ID = 1;
                }
                else
                {
                    check.NumRequest = check.NumRequest + obj.NumRequest;
                    check.IsLimit = obj.IsLimit;
                    check.UpdateTime = DateTime.Now;
                    _context.RmJnanaCountRequestGoogles.Update(check);
                    var x = await _context.SaveChangesAsync();
                    if (x > 0)
                    {
                        msg.ID = 1;
                        msg.Title = "Update request success";
                        msg.Object = check;
                    }
                    else
                    {
                        msg.ID = 0;
                        msg.Title = "Update request success";
                        msg.Object = check;
                    }
                }
            }
            catch (Exception e)
            {
                msg.ID = 0;
                msg.Error = true;
                msg.Title = "Update request success";
                msg.Object = e;
            }

            return Json(msg);
        }


        [HttpPost]
        public async Task<JsonResult> GetKey(RmJnanaCountRequestGoogle obj)
        {
            var msg = new JMessage();
            try
            {
                var DateTimeNow = DateTime.Now.AddHours(-14).ToString("MM/dd/yyyy");
                msg.ID = 1;
                msg.Error = false;

                var keyLimit = await _context.RmJnanaApiGoogleServicess.FirstOrDefaultAsync(x => x.ServiceType == obj.ServiceType && x.Key == obj.Key);
               
                if (keyLimit != null)
                {
                    obj.IsLimit = 1;
                    obj.NumRequest = 0;
                    await CountRequest(obj);
                }
                var keys = await _context.RmJnanaApiGoogleServicess.Where(x => x.ServiceType == obj.ServiceType).ToListAsync();
               
                foreach (var key in keys)
                {
                    var check = await _context.RmJnanaCountRequestGoogles.FirstOrDefaultAsync(x => x.Date == DateTimeNow && x.Key == key.Key && x.ServiceType == key.ServiceType);
                    if (check == null)
                    {
                        msg.Object = new
                        {
                            Key = key.Key
                        };
                        break;
                    }
                    else if (check.IsLimit == 0)
                    {
                        msg.Object = new
                        {
                            Key = key.Key
                        };
                        break;
                    }
                }
                if (msg.Object == null)
                {
                    msg.ID = 0;
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("RMJT_MSG_KEY"));//"Hết key";
                }
            }
            catch (Exception e)
            {
                msg.ID = 0;
                msg.Error = true;
                msg.Title = "Update request success";
                msg.Object = e;
            }
            return Json(msg);
        }

    }
    public class  GoogleToken
    {
        public int Id { get; set; }
        public string Description { get; set; }
        public string Key { get; set; }
        public int Limit { get; set; }
        public string Service_type { get; set; }
        public int Status { get; set; }
    }
}