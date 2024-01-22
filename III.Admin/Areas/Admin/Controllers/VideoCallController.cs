using System;
using System.Globalization;
using System.Linq;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class VideoCallController : BaseController
    {
        private readonly EIMDBContext _context;
        public VideoCallController(EIMDBContext context)
        {
            _context = context;
        }
        public IActionResult Index()
        {
            return View();
        }
    }
}