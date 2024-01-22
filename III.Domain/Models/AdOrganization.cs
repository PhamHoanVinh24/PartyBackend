using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("AD_ORGANIZATION")]
    public  class AdOrganization
    {
        public AdOrganization()
        {
            //ESOrgApps = new HashSet<ESOrgApp>();
            //ESOrgPrivileges = new HashSet<ESOrgPrivilege>();
            BranchUsers = new HashSet<AspNetUser>();
        }
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int OrgId { get; set; }

        [Key]
        [StringLength(50)]
        public string OrgAddonCode { get; set; }

        [StringLength(50)]
        public string OrgCode { get; set; }

        public int? OrgGroup { get; set; }

        [StringLength(500)]
        public string OrgName { get; set; }

        //[StringLength(255)]
        //public string OrgTitle { get; set; }

        //[StringLength(500)]
        //public string OrgDescription { get; set; }

        public int? OrgOrd { get; set; }

        [StringLength(50)]
        public string OrgUpdateTime { get; set; }

        [StringLength(50)]
        public string OrgParentCode { get; set; }
        [JsonIgnore]
        [ForeignKey("OrgParentCode")]
        [InverseProperty("InverseParent")]
        public virtual AdOrganization Parent { get; set; }
        [JsonIgnore]
        public virtual ICollection<AdOrganization> InverseParent { get; set; }

        [StringLength(255)]
        public string Company { get; set; }

        [StringLength(255)]
        public string Country { get; set; }

        [StringLength(255)]
        public string State { get; set; }

        [StringLength(255)]
        public string HierarchyCode { get; set; }

        [StringLength(255)]
        public string Division { get; set; }

        public bool IsEnabled { get; set; }
        public string DepartmentCode { get; set; }

        //[JsonIgnore]
        //public virtual ICollection<AspNetUser> DepartmentUsers { get; set; }
        [JsonIgnore]
        public virtual ICollection<AspNetUser> BranchUsers { get; set; }
        //[JsonIgnore]
        //public virtual ICollection<AspNetUser> ProfitCenterUsers { get; set; }
        //[JsonIgnore]
        //public virtual ICollection<AspNetUser> AccountExecutiveUsers { get; set; }

        //public virtual ICollection<ESOrgApp> ESOrgApps { get; set; }
        //public virtual ICollection<ESOrgPrivilege> ESOrgPrivileges { get; set; }
        //public virtual ICollection<ESOrganization> InverseParent { get; set; }
    }
}