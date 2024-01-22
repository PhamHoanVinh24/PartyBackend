using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Host.Entities
{

    public class AspNetRole: IdentityRole
    {
        public AspNetRole():base()
        {

            //ESRoleApps = new HashSet<ESRoleApp>();
            //ESRolePrivileges = new HashSet<ESRolePrivilege>();
        }


        //public virtual ICollection<ESRoleApp> ESRoleApps { get; set; }
        //public virtual ICollection<ESRolePrivilege> ESRolePrivileges { get; set; }
    }
}
