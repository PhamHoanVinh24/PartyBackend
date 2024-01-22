using System;
using System.Collections.Generic;

namespace Host.Entities
{
    public partial class ESEmailInBox
    {
        public int Id { get; set; }
        public string From { get; set; }
        public string To { get; set; }
        public string Subject { get; set; }
        public string Body { get; set; }
        public DateTime? SendDate { get; set; }
        public string IdEmail { get; set; }
    }
}
