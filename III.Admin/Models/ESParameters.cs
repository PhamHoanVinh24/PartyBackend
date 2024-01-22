using System;
using System.Collections.Generic;

namespace ESEIM.Models
{
    public partial class ESParameter
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Code { get; set; }
        public string Value { get; set; }
        public int? GroupId { get; set; }
        public string Description { get; set; }
        public int? ParentId { get; set; }

        public virtual ESGroupParameter Group { get; set; }
        public virtual ESParameter Parent { get; set; }
        public virtual ICollection<ESParameter> InverseParent { get; set; }
    }
}
