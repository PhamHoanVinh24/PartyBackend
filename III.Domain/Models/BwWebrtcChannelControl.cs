using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("BW_WEBRTC_CHANNEL_CONTROL")]
    public class BwWebrtcChannelControl
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public string  ChannelId{ get; set; }
        public bool? Status { get; set; }

        public string CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }


        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }


        public string DeletedBy { get; set; }

        public DateTime? DeletedTime { get; set; }

    }
}
