using System;
using System.Collections.Generic;

namespace ESEIM.Models
{
    public partial class ESOrgApp
    {
        public int OrgId { get; set; }
        public int ApplicationId { get; set; }
        public bool Allow { get; set; }

        public virtual ESApplication Application { get; set; }
        public virtual ESOrganization Org { get; set; }
    }
}
