using System;
using System.Collections.Generic;

namespace ESEIM.Models
{
    public partial class ESEndpointApp
    {
        public int EndpointId { get; set; }
        public int ApplicationId { get; set; }
        public bool Allow { get; set; }

        public virtual ESApplication Application { get; set; }
        public virtual ESEndpoint Endpoint { get; set; }
    }
}
