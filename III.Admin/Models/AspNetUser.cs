
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
    public class AspNetUserCustom
    {
        public string Id { set; get; }
        public string UserName { set; get; }
        public string Password { set; get; }
        public string Email { set; get; }
        public string PhoneNumber { set; get; }
        public int? OfficeNumber { set; get; }
        public string FamilyName { set; get; }
        public string GivenName { set; get; }
        public string EmployeeCode { set; get; }
        public int? OrgId { set; get; }
        public int? DepartmentId { set; get; }
        public int? BranchId { set; get; }
        public int? ProfitCenterId { set; get; }
        public int? AccountExecutiveId { set; get; }
        public bool Active { get; set; }
        public string Description { get; set; }
        public string Reason { get; set; }
        public string Picture { get; set; }
        public ESEIM.Utils.TempSub TempSub { set; get; }
    }
    // Add profile data for application users by adding properties to the ApplicationUser class
    public class AspNetUser : IdentityUser
    {
        public AspNetUser() : base()
        {
            //AspNetUserClaims = new HashSet<AspNetUserClaim>();
            //AspNetUserLogins = new HashSet<AspNetUserLogin>();
            //AspNetUserRoles = new HashSet<AspNetUserRole>();
            VIBUserInGroups = new HashSet<VIBUserInGroup>();
            VIBPermissions = new HashSet<VIBPermission>();
            ESUserInGroups = new HashSet<ESUserInGroup>();
            ESExtendAccounts = new HashSet<ESExtendAccount>();
            ESUserApps = new HashSet<ESUserApp>();
            ESUserPrivileges = new HashSet<ESUserPrivilege>();
        }
        public virtual int? OfficeNumber { get; set; }
        public virtual string FamilyName { get; set; }
        public virtual string GivenName { get; set; }
        public virtual string MiddleName { get; set; }
        public DateTime? CreatedDate { get; set; }
        [StringLength(50)]
        public string CreatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        [StringLength(50)]
        public string UpdatedBy { get; set; }
        public string Picture { get; set; }
        public bool Active { get; set; }

        [StringLength(300)]
        public string EmployeeCode { get; set; }
        [StringLength(2000)]
        public string Description { get; set; }

        [StringLength(2000)]
        public string Reason { get; set; }

        public int? DepartmentId { set; get; }
        [ForeignKey("DepartmentId")]
        [InverseProperty("DepartmentUsers")]
        public virtual VIBOrganization Department { get; set; }

        public int? BranchId { set; get; }
        [ForeignKey("BranchId")]
        [InverseProperty("BranchUsers")]
        public virtual VIBOrganization Branch { get; set; }

        public int? ProfitCenterId { set; get; }
        [ForeignKey("ProfitCenterId")]
        [InverseProperty("ProfitCenterUsers")]
        public virtual VIBOrganization ProfitCenter { get; set; }

        public int? AccountExecutiveId { set; get; }
        [ForeignKey("AccountExecutiveId")]
        [InverseProperty("AccountExecutiveUsers")]
        public virtual VIBOrganization AccountExecutive { get; set; }

        public virtual ICollection<VIBUserInGroup> VIBUserInGroups { get; set; }
        public virtual ICollection<VIBPermission> VIBPermissions { get; set; }
        public virtual ICollection<ESUserInGroup> ESUserInGroups { get; set; }
        public virtual ICollection<ESExtendAccount> ESExtendAccounts { get; set; }
        public virtual ICollection<ESUserApp> ESUserApps { get; set; }
        public virtual ICollection<ESUserPrivilege> ESUserPrivileges { get; set; }
        [NotMapped]
        public virtual ICollection<IdentityUserRole<string>> AspNetUserRoles { get; set; }

        //public virtual ICollection<AspNetUserClaim> AspNetUserClaims { get; set; }
        // public virtual ICollection<AspNetUserLogin> AspNetUserLogins { get; set; }
    }
}