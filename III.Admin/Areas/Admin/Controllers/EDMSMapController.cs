using System.Linq;
using ESEIM.Models;
using ESEIM.Utils;
using III.Domain.Enums;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class EDMSMapController : BaseController
    {
        private readonly EIMDBContext _context;
        public EDMSMapController(EIMDBContext context)
        {
            _context = context;
        }
        public IActionResult Index()
        {
            return View();
        }
        [HttpPost]
        public object GetAll()
        {
            try
            {
                var a = _context.MapDataGpss.Where(x => x.ObjType == EnumHelper<MapType>.GetDisplayValue(MapType.Store)).OrderBy(x => x.Id).AsNoTracking().ToList();
                return Json(a);
            }
            catch (System.Exception ex)
            {
                throw;
            }
        }
    }
}