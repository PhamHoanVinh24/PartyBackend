using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("V_ACTION_CARD")]
    public class VActionCard
    {
        [Key]
        public Guid ID { get; set; }
        public string CardCode { get; set; }
        public string CardName { get; set; }
        public string Status { get; set; }
        public string UpdatedBy { get; set; }
        public DateTime? UpdatedTime { get; set; }
    }
}
