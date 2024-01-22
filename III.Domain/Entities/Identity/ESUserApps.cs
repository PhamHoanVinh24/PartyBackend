using System;
using System.Collections.Generic;

namespace Host.Entities
{
    public partial class ESUserApp
    {
        public string UserId { get; set; }
        public int ApplicationId { get; set; }
        public bool Allow { get; set; }

        public virtual ESApplication Application { get; set; }
        public virtual ApplicationUser User { get; set; }
    }
}
