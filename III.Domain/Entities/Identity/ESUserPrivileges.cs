using System;
using System.Collections.Generic;

namespace Host.Entities
{
    public partial class ESUserPrivilege
    {
        public string UserId { get; set; }
        public int PrivilegeId { get; set; }

        public virtual ESPrivilege Privilege { get; set; }
        public virtual ApplicationUser User { get; set; }
    }
}
