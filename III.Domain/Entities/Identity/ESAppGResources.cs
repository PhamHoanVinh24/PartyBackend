using System;
using System.Collections.Generic;

namespace Host.Entities
{
    public partial class ESAppGResource
    {
        public int ApplicationId { get; set; }
        public string GroupResourceId { get; set; }

        public virtual ESApplication Application { get; set; }
        public virtual ESGroupResource GroupResource { get; set; }
    }
}
