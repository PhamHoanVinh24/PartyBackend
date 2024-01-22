using Microsoft.AspNetCore.Mvc;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class CustomerEDMSRepositoryController : BaseController
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}