using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace III.Admin.Controllers
{
    public class HomeController : Controller
    {

        private readonly UserManager<AspNetUser> _userManager;

        public HomeController(UserManager<AspNetUser> userManager)
        {
            _userManager = userManager;
        }

        public async Task<IActionResult> Index()
        {
            return View();
        }
    }
}
