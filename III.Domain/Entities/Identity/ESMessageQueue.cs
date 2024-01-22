using System;
using System.Collections.Generic;

namespace Host.Entities
{
    public partial class ESMessageQueue
    {
        public ESMessageQueue()
        {
            ESMessageAttributes = new HashSet<ESMessageAttribute>();
            ESMessageReceivers = new HashSet<ESMessageReceiver>();
        }

        public int Id { get; set; }
        public string Subject { get; set; }
        public string Body { get; set; }
        public DateTime? CreatedDate { get; set; }

        public virtual ICollection<ESMessageAttribute> ESMessageAttributes { get; set; }
        public virtual ICollection<ESMessageReceiver> ESMessageReceivers { get; set; }
    }
}
