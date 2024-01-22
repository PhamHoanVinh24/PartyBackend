using System;
using System.Collections.Generic;

namespace ESEIM.Models
{
    public class ESApiClient
    {
        public int Id { set; get; }
        public string Title { set; get; }
        public string Name { set; get; }
        public string Secret { set; get; }
        public string Scopes { set; get; }
        public string Description { set; get; }
    }
}
