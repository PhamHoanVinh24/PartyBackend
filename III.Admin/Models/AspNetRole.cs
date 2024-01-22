
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ESEIM.Models
{

    public class AspNetRole : IdentityRole
    {
        public AspNetRole() : base()
        {
            // AspNetRoleClaims = new HashSet<AspNetRoleClaim>();
            //AspNetUserRoles = new HashSet<AspNetUserRole>();
            ESRoleApps = new HashSet<ESRoleApp>();
            ESRolePrivileges = new HashSet<ESRolePrivilege>();
            VIBUserInGroups = new HashSet<VIBUserInGroup>();
            VIBPermissions = new HashSet<VIBPermission>();
        }

        public string Title { get; set; }
        public string Description { get; set; }
        public int? Ord { get; set; }
        public DateTime? CreatedDate { get; set; }
        public string CreatedBy { get; set; }

        //public virtual ICollection<AspNetUserRole> AspNetUserRoles { get; set; }
        public virtual ICollection<ESRoleApp> ESRoleApps { get; set; }
        public virtual ICollection<ESRolePrivilege> ESRolePrivileges { get; set; }
        public virtual ICollection<VIBUserInGroup> VIBUserInGroups { get; set; }
        public virtual ICollection<VIBPermission> VIBPermissions { get; set; }
        // public virtual ICollection<AspNetRoleClaim> AspNetRoleClaims { get; set; }
    }
}
