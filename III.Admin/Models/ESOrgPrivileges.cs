using System;
using System.Collections.Generic;

namespace ESEIM.Models
{
    public partial class ESOrgPrivilege
    {
        public int OrgId { get; set; }
        public int PrivilegeId { get; set; }

        public virtual ESOrganization Org { get; set; }
        public virtual ESPrivilege Privilege { get; set; }
    }
}
