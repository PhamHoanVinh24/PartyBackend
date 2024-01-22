using System;
using System.Collections.Generic;

namespace Host.Entities
{
    public partial class ESRolePrivilege
    {
        public string RoleId { get; set; }
        public int PrivilegeId { get; set; }

        public virtual ESPrivilege Privilege { get; set; }
        public virtual AspNetRole Role { get; set; }
    }
}
