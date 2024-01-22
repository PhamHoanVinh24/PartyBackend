using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;

namespace Host.Entities
{
    // Add profile data for application users by adding properties to the ApplicationUser class
    public class ApplicationUser : IdentityUser
    {
        public ApplicationUser() : base()
        {
            //ESExtendAccounts = new HashSet<ESExtendAccount>();
            //ESUserApps = new HashSet<ESUserApp>();
            //ESUserPrivileges = new HashSet<ESUserPrivilege>();
        }
        public virtual int? OfficeNumber { get; set; }
        public virtual string FamilyName { get; set; }
        public virtual string GivenName { get; set; }
        public virtual string MiddleName { get; set; }
        public virtual string Picture { get; set; }
        public bool Active { get; set; }
        public int UserType { get; set; }
        public DateTime? CreatedDate { get; set; }
        //public virtual ICollection<ESExtendAccount> ESExtendAccounts { get; set; }
        //public virtual ICollection<ESUserApp> ESUserApps { get; set; }
        //public virtual ICollection<ESUserPrivilege> ESUserPrivileges { get; set; }
    }
}
