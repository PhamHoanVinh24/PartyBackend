using System;
using System.Collections.Generic;

namespace Host.Entities
{
    public partial class ESClientConnect
    {
        public int Id { get; set; }
        public string Ipaddress { get; set; }
        public int? UserId { get; set; }
        public DateTime? ConnectDate { get; set; }
        public int? ClientId { get; set; }
        public DateTime? DisconnectDate { get; set; }
    }
}
