using System;
using System.Collections.Generic;

namespace ESEIM.Models
{
    public partial class ESAccessLog
    {
        public long Id { get; set; }
        public string Resource { get; set; }
        public string Action { get; set; }
        public string UserId { get; set; }
        public string Application { get; set; }
        public string Description { get; set; }
        public string Ipaddress { get; set; }
        public DateTime AccessDate { get; set; }
    }
}
