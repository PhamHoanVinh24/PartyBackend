using System;
using System.Collections.Generic;

namespace ESEIM.Models
{
    public partial class ESRoleApp
    {
        public string RoleId { get; set; }
        public int ApplicationId { get; set; }
        //public bool Allow { get; set; }

        public virtual ESApplication Application { get; set; }
        public virtual AspNetRole Role { get; set; }
    }
}
