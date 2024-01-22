using Microsoft.AspNetCore.Mvc;

namespace III.Admin.Controllers
{
    public class ErrorController : Controller
    {

        public ErrorController()
        {
        }

        public IActionResult Index(int errorCode)
        {
            var model = new ErrorModel();
            model.ErrorCode = errorCode;
            return View(model);
        }
        public IActionResult Exception()
        {
            return View();
        }
        public class ErrorModel
        {
            public int ErrorCode { get; set; }
        }
    }
}
