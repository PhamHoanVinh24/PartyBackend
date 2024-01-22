using System;
using System.Collections.Generic;

namespace Host.Entities
{
    public partial class ESMessageAttribute
    {
        public int MessageQueueId { get; set; }
        public string Key { get; set; }
        public string Value { get; set; }
        public int Id { get; set; }

        public virtual ESMessageQueue MessageQueue { get; set; }
    }
}
