using System;
using System.Linq;
using ESEIM.Models;
using Microsoft.AspNetCore.Mvc;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class StaffOnlineController : Controller
    {

        private readonly EIMDBContext _context;
        public StaffOnlineController(EIMDBContext context)
        {
            _context = context;
        }
        public IActionResult Index()
        {
            return View();
        }
        [HttpPost]
        public object GetStaffCheckIn([FromBody]VCStaffPositionSearch jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var today = DateTime.Today;
            var query = from a in _context.WorkShiftCheckInOuts
                        where a.ActionTime == today
                        select new
                        {
                           
                        };
            return query;
        }
    }
}