using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace III.Admin.Controllers
{
    public class DashBoardCommonController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
