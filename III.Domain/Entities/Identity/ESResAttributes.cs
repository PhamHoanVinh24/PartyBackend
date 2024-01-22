using System;
using System.Collections.Generic;

namespace Host.Entities
{
    public partial class ESResAttribute
    {
        public int Id { get; set; }
        public string Key { get; set; }
        public string Value { get; set; }
        public int ResourceId { get; set; }

        public virtual ESResource Resource { get; set; }
    }
}
