using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using System;
using System.Collections.Generic;

namespace ESEIM.Models
{
    public partial class AspNetRoleClaim: Microsoft.AspNetCore.Identity.EntityFrameworkCore.IdentityRoleClaim<int>
    {
        
        public virtual AspNetRole Role { get; set; }
    }
}
