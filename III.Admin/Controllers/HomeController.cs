using Microsoft.AspNetCore.Mvc;

namespace III.Admin.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
