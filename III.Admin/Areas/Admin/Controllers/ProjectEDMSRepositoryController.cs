using Microsoft.AspNetCore.Mvc;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class ProjectEDMSRepositoryController : BaseController
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}