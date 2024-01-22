using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Host.Entities
{
    public class ESApiClient
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Name { get; set; }
        public string Secret { get; set; }
        public string Scopes { get; set; }
        public string Description { get; set; }
    }
}
