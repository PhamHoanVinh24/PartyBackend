using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ESEIM.Models
{
    public class IdentityClaim
    {
        public int Id { get; set; }
        public int? IdentityResourceId { get; set; }
        public string Type { get; set; }

        public virtual IdentityResource IdentityResources { get; set; }
    }
}
