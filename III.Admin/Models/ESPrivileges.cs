using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    public partial class ESPrivilege
    {
        public ESPrivilege()
        {
            ESGroupUserPrivileges = new HashSet<ESGroupUserPrivilege>();
            ESOrgPrivileges = new HashSet<ESOrgPrivilege>();
            ESRolePrivileges = new HashSet<ESRolePrivilege>();
            ESUserPrivileges = new HashSet<ESUserPrivilege>();
        }
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string ActionId { get; set; }
        public int ResourceId { get; set; }

        public virtual ICollection<ESGroupUserPrivilege> ESGroupUserPrivileges { get; set; }
        public virtual ICollection<ESOrgPrivilege> ESOrgPrivileges { get; set; }
        public virtual ICollection<ESRolePrivilege> ESRolePrivileges { get; set; }
        public virtual ICollection<ESUserPrivilege> ESUserPrivileges { get; set; }
        public virtual ESAction Action { get; set; }
        public virtual ESResource Resource { get; set; }
    }
}
