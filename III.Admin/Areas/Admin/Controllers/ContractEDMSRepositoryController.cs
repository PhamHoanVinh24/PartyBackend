using Microsoft.AspNetCore.Mvc;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class ContractEDMSRepositoryController : BaseController
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}