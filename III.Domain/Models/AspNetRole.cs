
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace ESEIM.Models
{

    [Table("ASP_NET_ROLES")]
    public class AspNetRole : IdentityRole
    {
        public AspNetRole() : base()
        {
            // AspNetRoleClaims = new HashSet<AspNetRoleClaim>();
            //AspNetUserRoles = new HashSet<AspNetUserRole>();
            //ESRoleApps = new HashSet<ESRoleApp>();
            //ESRolePrivileges = new HashSet<ESRolePrivilege>();
            AdUserInGroups = new HashSet<AdUserInGroup>();
            AdPermissions = new HashSet<AdPermission>();
        }

        [StringLength(50)]
        public string Code { get; set; }

        [StringLength(255)]
        public string Title { get; set; }

        [StringLength(2000)]
        public string Description { get; set; }

        public int? Ord { get; set; }

        public int? Priority { get; set; }

        public DateTime? CreatedDate { get; set; }
        [StringLength(50)]
        public string CreatedBy { get; set; }
        public bool Status { get; set; }
        public string Color { get; set; }
        public string Type { get; set; }
        public string TypeRole { get; set; }

        //public virtual ICollection<AspNetUserRole> AspNetUserRoles { get; set; }
        //public virtual ICollection<ESRoleApp> ESRoleApps { get; set; }
        //public virtual ICollection<ESRolePrivilege> ESRolePrivileges { get; set; }
        public virtual ICollection<AdUserInGroup> AdUserInGroups { get; set; }
        public virtual ICollection<AdPermission> AdPermissions { get; set; }
        // public virtual ICollection<AspNetRoleClaim> AspNetRoleClaims { get; set; }
    }
}
