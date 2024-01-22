using System;
using System.Collections.Generic;

namespace Host.Entities
{
    public partial class ESPrivilege
    {
        public ESPrivilege()
        {
            ESOrgPrivileges = new HashSet<ESOrgPrivilege>();
            ESRolePrivileges = new HashSet<ESRolePrivilege>();
            ESUserPrivileges = new HashSet<ESUserPrivilege>();
        }

        public int Id { get; set; }
        public string ActionId { get; set; }
        public int ResourceId { get; set; }

        public virtual ICollection<ESOrgPrivilege> ESOrgPrivileges { get; set; }
        public virtual ICollection<ESRolePrivilege> ESRolePrivileges { get; set; }
        public virtual ICollection<ESUserPrivilege> ESUserPrivileges { get; set; }
        public virtual ESAction Action { get; set; }
        public virtual ESResource Resource { get; set; }
    }
}
