using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("BW_BOT_INSTANT_DATAMINING")]
    public class BwBotInstantDatamining
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public string  MachineId{ get; set; }

        public string ChannelId { get; set; }
        public string Ip { get; set; }
        public bool? Status { get; set; }
		public bool? Flag { get; set; }
		public DateTime? LastSeen { get; set; }
        public DateTime? CreatedTime { get; set; }

        public DateTime? DeletedTime { get; set; }
        public DateTime? UpdatedTime { get; set; }

        public string CreatedBy { get; set; }
        public int? DeletedBy { get; set; }

        public string UpdatedBy { get; set; }
    }
}
