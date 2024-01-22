using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("VIBPrivilege")]
    public class VIBPrivilege
    {
        public VIBPrivilege()
        {
            //ESGroupUserPrivileges = new HashSet<ESGroupUserPrivilege>();
            //ESOrgPrivileges = new HashSet<ESOrgPrivilege>();
            //ESRolePrivileges = new HashSet<ESRolePrivilege>();
            //ESUserPrivileges = new HashSet<ESUserPrivilege>();
        }

        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public int FunctionId { get; set; }
        public virtual VIBFunction Function { get; set; }

        public int ResourceId { get; set; }
        public virtual VIBResource Resource { get; set; }

        //public virtual ICollection<ESGroupUserPrivilege> ESGroupUserPrivileges { get; set; }
        //public virtual ICollection<ESOrgPrivilege> ESOrgPrivileges { get; set; }
        //public virtual ICollection<ESRolePrivilege> ESRolePrivileges { get; set; }
        //public virtual ICollection<ESUserPrivilege> ESUserPrivileges { get; set; }
    }
}