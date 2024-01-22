using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ESEIM.Models
{
    public partial class ESGroupApp
    {
        public int GroupId { get; set; }
        public int ApplicationId { get; set; }

        public virtual ESApplication Applications { get; set; }
        public virtual ESGroupUser Groups { get; set; }
    }
}
