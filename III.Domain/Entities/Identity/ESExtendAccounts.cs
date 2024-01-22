using System;
using System.Collections.Generic;

namespace Host.Entities
{
    public partial class ESExtendAccount
    {
        public int Id { get; set; }
        public string Account { get; set; }
        public string Type { get; set; }
        public string UserId { get; set; }

        public virtual ApplicationUser User { get; set; }
    }
}
