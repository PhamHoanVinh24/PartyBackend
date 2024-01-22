using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("MOIBLE_PRIVILEGE")]
    public class MobilePrivilege
    {
        public MobilePrivilege()
        {
            //ESGroupUserPrivileges = new HashSet<ESGroupUserPrivilege>();
            //ESOrgPrivileges = new HashSet<ESOrgPrivilege>();
            //ESRolePrivileges = new HashSet<ESRolePrivilege>();
            //ESUserPrivileges = new HashSet<ESUserPrivilege>();
        }

        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int PrivilegeId { get; set; }

        [StringLength(50)]
        public string FunctionCode { get; set; }
        [JsonIgnore]
        public virtual MobileFunction Function { get; set; }

        [StringLength(100)]
        public string ResourceCode { get; set; }
        [JsonIgnore]
        public virtual MobileResource Resource { get; set; }

        //public virtual ICollection<ESGroupUserPrivilege> ESGroupUserPrivileges { get; set; }
        //public virtual ICollection<ESOrgPrivilege> ESOrgPrivileges { get; set; }
        //public virtual ICollection<ESRolePrivilege> ESRolePrivileges { get; set; }
        //public virtual ICollection<ESUserPrivilege> ESUserPrivileges { get; set; }
    }
}