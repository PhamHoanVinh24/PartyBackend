using System;
using System.Collections.Generic;

namespace Host.Entities
{
    public partial class ESMessageReceiver
    {
        public int Id { get; set; }
        public int MessageQueueId { get; set; }
        public string Email { get; set; }
        public string Mobile { get; set; }
        public int S1 { get; set; }
        public int S2 { get; set; }

        public virtual ESMessageQueue MessageQueue { get; set; }
    }
}
