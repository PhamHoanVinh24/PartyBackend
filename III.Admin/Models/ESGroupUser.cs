using System;
using System.Collections.Generic;

namespace ESEIM.Models
{
    public class ESGroupUser
    {
        public ESGroupUser()
        {
            ESGroupUserPrivileges = new HashSet<ESGroupUserPrivilege>();
            ESUserInGroups = new HashSet<ESUserInGroup>();
            ESGroupApps = new HashSet<ESGroupApp>();
        }

        public int Id { get; set; }
        public string Code { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime? CreatedDate { get; set; }

        public virtual ICollection<ESGroupUserPrivilege> ESGroupUserPrivileges { get; set; }
        public virtual ICollection<ESUserInGroup> ESUserInGroups { get; set; }
        public virtual ICollection<ESGroupApp> ESGroupApps { get; set; }
    }
}
