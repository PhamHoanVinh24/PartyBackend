using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class GoogleServiceController : Controller
    {
        private readonly EIMDBContext _context;
        private readonly ILogger _logger;
        public GoogleServiceController(EIMDBContext context, ILogger<GoogleServiceController> logger)
        {
            _context = context;
            _logger = logger;
        }

        public IActionResult Index()
        {
            return View("Index");
        }

        [HttpPost]
        public async Task<JsonResult> CountRequest(CountRequestGoogle obj)
        {
            var msg = new JMessage() { Error = false };
            var DateTimeNow = DateTime.Now.AddHours(-14).ToString("MM/dd/yyyy");
            try
            {
                var check = await _context.CountRequestGoogle.FirstOrDefaultAsync(x => x.Date == DateTimeNow && x.Service_type == obj.Service_type && x.Key == obj.Key);
                if (check == null)
                {
                    obj.Date = DateTimeNow;
                    obj.Create_time = DateTime.Now;
                    obj.Update_time = DateTime.Now;
                    _context.CountRequestGoogle.Add(obj);
                    var a = await _context.SaveChangesAsync();
                    msg.Title = "Thêm khoản mục thành công";
                    msg.Object = obj;
                    msg.ID = 1;
                }
                else
                {
                    check.Num_request = check.Num_request + obj.Num_request;
                    check.Is_limit = obj.Is_limit;
                    check.Update_time = DateTime.Now;
                    _context.CountRequestGoogle.Update(check);
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
        public async Task<JsonResult> GetKey(CountRequestGoogle obj)
        {
            var msg = new JMessage();
            try
            {
                var DateTimeNow = DateTime.Now.AddHours(-14).ToString("MM/dd/yyyy");
                msg.ID = 1;
                msg.Error = false;

                var keyLimit = await _context.ApiGoogleServices.FirstOrDefaultAsync(x => x.Service_type == obj.Service_type && x.Key == obj.Key);

                if (keyLimit != null)
                {
                    obj.Is_limit = 1;
                    obj.Num_request = 0;
                    await CountRequest(obj);
                }
                var keys = await _context.ApiGoogleServices.Where(x => x.Service_type == obj.Service_type).ToListAsync();

                foreach (var key in keys)
                {
                    var check = await _context.CountRequestGoogle.FirstOrDefaultAsync(x => x.Date == DateTimeNow && x.Key == key.Key && x.Service_type == key.Service_type);
                    if (check == null)
                    {
                        msg.Object = new
                        {
                            Key = key.Key
                        };
                        break;
                    }
                    else if (check.Is_limit == 0)
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
                    msg.Title = "Hết key";
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
}