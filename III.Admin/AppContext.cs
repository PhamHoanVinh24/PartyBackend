using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Security.Claims;
//using IdentityModel.Client;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json.Linq;

namespace ESEIM
{
    public static class AppContext
    {
        private static Microsoft.AspNetCore.Http.IHttpContextAccessor m_httpContextAccessor;
        private static IConfigurationSection m_appSettings;
        public static void Configure(Microsoft.AspNetCore.Http.IHttpContextAccessor httpContextAccessor, IConfigurationSection appSettings)
        {
            m_httpContextAccessor = httpContextAccessor; m_appSettings = appSettings;
        }
        public static string GetClaim(string key)
        {
            try
            {
                var result = new List<string>();
                foreach (var claim in Current.User.Claims)
                {
                    if (claim.Type.Equals(key))
                    {
                        result.Add(claim.Value);
                    }
                }
                return string.Join(";", result);
            }
            catch (Exception)
            {

                return "";
            } 
        }
        public static  string UserName => Current.User.Identity.Name;
        public static string UserId => Current.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        public static Microsoft.AspNetCore.Http.HttpContext Current => m_httpContextAccessor.HttpContext;
    }
}