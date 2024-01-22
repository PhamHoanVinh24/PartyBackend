using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class AssetRepositoryController : BaseController
    {
        private readonly EIMDBContext _context;

        public AssetRepositoryController(EIMDBContext context)
        {
            _context = context;
        }
        public IActionResult Index()
        {
            return View();
        }
    }
}