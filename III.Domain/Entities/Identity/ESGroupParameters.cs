using System;
using System.Collections.Generic;

namespace Host.Entities
{
    public partial class ESGroupParameter
    {
        public ESGroupParameter()
        {
            ESParameters = new HashSet<ESParameter>();
        }

        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }

        public virtual ICollection<ESParameter> ESParameters { get; set; }
    }
}
