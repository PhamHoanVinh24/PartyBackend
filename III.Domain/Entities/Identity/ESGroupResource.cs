using System;
using System.Collections.Generic;

namespace Host.Entities
{
    public partial class ESGroupResource
    {
        public ESGroupResource()
        {
            ESAppResources = new HashSet<ESAppGResource>();
            ESResources = new HashSet<ESResource>();
        }

        public string Id { get; set; }
        public string Title { get; set; }

        public virtual ICollection<ESAppGResource> ESAppResources { get; set; }
        public virtual ICollection<ESResource> ESResources { get; set; }
    }
}
