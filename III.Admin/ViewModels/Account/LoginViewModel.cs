// Copyright (c) Brock Allen & Dominick Baier. All rights reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE in the project root for license information.


using Microsoft.AspNetCore.Mvc.Rendering;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;

namespace Hot.Models.AccountViewModels
{
    public class SendCodeViewModel
    {
        public string SelectedProvider { get; set; }

        public ICollection<SelectListItem> Providers { get; set; }

        public string ReturnUrl { get; set; }

        public bool RememberMe { get; set; }
    }
    public class VerifyCodeViewModel
    {
        [Required]
        public string Provider { get; set; }

        [Required]
        public string Code { get; set; }

        public string ReturnUrl { get; set; }

        [Display(Name = "Remember this browser?")]
        public bool RememberBrowser { get; set; }

        [Display(Name = "Remember me?")]
        public bool RememberMe { get; set; }
    }
    public class LoginViewModel : LoginInputModel
    {
        [Display(Name = "Remember Me")]
        public bool AllowRememberLogin { get; set; }
        public bool EnableLocalLogin { get; set; }
        [Display(Name = "Provider")]
        public bool AuthenProvider { get; set; }
        public IEnumerable<ExternalProvider> ExternalProviders { get; set; }
        //public IEnumerable<ExternalProvider> VisibleExternalProviders => ExternalProviders.Where(x =>x!=null && !String.IsNullOrWhiteSpace(x.DisplayName));
        public string Culture { get; set; }
        public bool IsExternalLoginOnly => EnableLocalLogin == false && ExternalProviders?.Count() == 1;
        public string ExternalLoginScheme => ExternalProviders?.SingleOrDefault()?.AuthenticationScheme;
    }
}