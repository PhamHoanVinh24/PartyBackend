using System;
using System.Collections.Generic;

namespace ESEIM.Models
{
    public partial class ESUserApp
    {
        public string UserId { get; set; }
        public int ApplicationId { get; set; }
        //public bool Allow { get; set; }

        public virtual ESApplication Application { get; set; }
        public virtual AspNetUser User { get; set; }
    }
}
