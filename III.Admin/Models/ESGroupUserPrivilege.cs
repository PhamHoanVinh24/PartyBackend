using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ESEIM.Models
{
    public class ESGroupUserPrivilege
    {
        public int GroupUserId { get; set; }
        public int PrivilegeId { get; set; }

        public virtual ESGroupUser GroupUsers { get; set; }
        public virtual ESPrivilege Privileges { get; set; }
    }
}
