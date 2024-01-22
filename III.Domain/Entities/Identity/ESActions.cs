using System;
using System.Collections.Generic;

namespace Host.Entities
{
    public partial class ESAction
    {
        public ESAction()
        {
            ESPrivileges = new HashSet<ESPrivilege>();
        }

        public string Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public int? Ord { get; set; }

        public virtual ICollection<ESPrivilege> ESPrivileges { get; set; }
    }
}
