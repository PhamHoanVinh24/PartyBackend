using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Hosting;
using III.Admin.Controllers;
namespace ESEIM.Controllers
{
    [Area("Admin")]
    public class EDMSReportController : BaseController
	{
		private readonly UserManager<AspNetUser> _userManager;
		private readonly RoleManager<AspNetRole> _roleManager;
		private readonly AppSettings _appSettings;
		private readonly ILogger _logger;
		private readonly IHostingEnvironment _hostingEnvironment;
	
		public EDMSReportController(IOptions<AppSettings> appSettings, EIMDBContext context, UserManager<AspNetUser> userManager, RoleManager<AspNetRole> roleManager, IHostingEnvironment hostingEnvironment)
		{
			_roleManager = roleManager;
			_appSettings = appSettings.Value;
		}
		public IActionResult Index()
        {
			return View();
		}
    }
}