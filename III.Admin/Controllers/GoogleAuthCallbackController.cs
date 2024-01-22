using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Localization;

namespace III.Admin.Controllers
{
    public class GoogleAuthCallbackController : Controller
    {
        private readonly EIMDBContext _context;
        private readonly IStringLocalizer<TokenManagerController> _stringLocalizer;
        private readonly IHostingEnvironment _hostingEnvironment;

        public GoogleAuthCallbackController(IStringLocalizer<TokenManagerController> stringLocalizer,
            EIMDBContext context, IHostingEnvironment hostingEnvironment)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _hostingEnvironment = hostingEnvironment;
        }
        public IActionResult Index(string code, string state)
        {
            var data = _context.TokenManagers.FirstOrDefault(x => x.AccountCode == state);
            if (data != null)
            {
                var msg = new JMessage();
                var uri = data.Key;
                msg = FileExtensions.ExchangeCodeForGoogleToken(data.CredentialsJson, _hostingEnvironment.WebRootPath + "\\files\\token.json", data.Email, uri, code).Result;
                if (msg.Object != null)
                {
                    data.RefreshToken = msg.Object.ToString();
                    _context.TokenManagers.Update(data);
                    _context.SaveChanges(); 
                }
            }
            return View();
        }
    }
}
