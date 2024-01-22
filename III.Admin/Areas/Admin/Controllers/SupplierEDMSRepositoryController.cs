using Microsoft.AspNetCore.Mvc;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class SupplierEDMSRepositoryController : BaseController
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}