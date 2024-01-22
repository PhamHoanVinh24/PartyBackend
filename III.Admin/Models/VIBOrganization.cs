using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("VIBOrganization")]
    public  class VIBOrganization
    {
        public VIBOrganization()
        {
            //ESOrgApps = new HashSet<ESOrgApp>();
            //ESOrgPrivileges = new HashSet<ESOrgPrivilege>();
            DepartmentUsers = new HashSet<AspNetUser>();
            BranchUsers = new HashSet<AspNetUser>();
            ProfitCenterUsers = new HashSet<AspNetUser>();
            AccountExecutiveUsers = new HashSet<AspNetUser>();
        }

        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(20)]
        public string Code { get; set; }

        [StringLength(50)]
        public string Title { get; set; }

        [StringLength(500)]
        public string Description { get; set; }

        public int? Ord { get; set; }

        public int? ParentId { get; set; }
        public virtual VIBOrganization Parent { get; set; }

        public virtual ICollection<AspNetUser> DepartmentUsers { get; set; }
        public virtual ICollection<AspNetUser> BranchUsers { get; set; }
        public virtual ICollection<AspNetUser> ProfitCenterUsers { get; set; }
        public virtual ICollection<AspNetUser> AccountExecutiveUsers { get; set; }

        //public virtual ICollection<ESOrgApp> ESOrgApps { get; set; }
        //public virtual ICollection<ESOrgPrivilege> ESOrgPrivileges { get; set; }
        //public virtual ICollection<ESOrganization> InverseParent { get; set; }
    }
}