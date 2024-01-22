using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ESEIM.Models
{
    public class ESUserInGroup
    {
        public int GroupUserId { get; set; }
        public string UserId { get; set; }

        public virtual ESGroupUser GroupUser { get; set; }
        public virtual AspNetUser User { get; set; }
    }
}
