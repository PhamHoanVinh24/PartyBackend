using System;
using System.Collections.Generic;

namespace ESEIM.Models
{
    public partial class ESEndpoint
    {
        public ESEndpoint()
        {
            ESEndpointApps = new HashSet<ESEndpointApp>();
        }

        public int Id { get; set; }
        public string Title { get; set; }
        public string Ipaddress { get; set; }
        public string Description { get; set; }

        public virtual ICollection<ESEndpointApp> ESEndpointApps { get; set; }
    }
}
