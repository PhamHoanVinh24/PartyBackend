using System;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Localization;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class LanguageController : BaseController
    {
        [AllowAnonymous]
        [ResponseCache(Duration = 0, VaryByQueryKeys = new[] { "lang" })]
        public IActionResult SetCulture(string culture, string returnUrl)
        {
            Response.Cookies.Append(
                 CookieRequestCultureProvider.DefaultCookieName,
                CookieRequestCultureProvider.MakeCookieValue(new RequestCulture(culture)),
                new CookieOptions { Expires = DateTimeOffset.UtcNow.AddYears(1) }
            );
            return LocalRedirect(returnUrl);
        }
    }
    /// <summary>
    /// Đối tượng để lấy resoure chung
    /// </summary>
    public class SharedResources
    {

    }
}


