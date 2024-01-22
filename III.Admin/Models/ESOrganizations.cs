using System;
using System.Collections.Generic;

namespace ESEIM.Models
{
    public partial class ESOrganization
    {
        public ESOrganization()
        {
            ESOrgApps = new HashSet<ESOrgApp>();
            ESOrgPrivileges = new HashSet<ESOrgPrivilege>();
        }

        public int Id { get; set; }
        public string Title { get; set; }
        public string Code { get; set; }
        public string Description { get; set; }
        public int? ParentId { get; set; }
        public int? Ord { get; set; }

        public virtual ICollection<ESOrgApp> ESOrgApps { get; set; }
        public virtual ICollection<ESOrgPrivilege> ESOrgPrivileges { get; set; }
        public virtual ESOrganization Parent { get; set; }
        public virtual ICollection<ESOrganization> InverseParent { get; set; }
    }
}
