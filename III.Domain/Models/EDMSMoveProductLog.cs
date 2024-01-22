using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("EDMS_MOVE_PRODUCT_LOG")]
    public class EDMSMoveProductLog
    { 
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string ProductCode { get; set; }

        [StringLength(255)]
        public string RackCodeOld { get; set; }

        [StringLength(255)]
        public string RackCodeNew { get; set; }

        [StringLength(255)]
        public string RackPosition { get; set; }

        [StringLength(255)]
        public string Ordering { get; set; }

        [StringLength(255)]
        public string Note { get; set; }

        [StringLength(50)]
        public string CreatedBy { get; set; }

        public DateTime CreatedTime { get; set; }
        public string LineCodeOld { get; set; }
        public string FloorCodeOld { get; set; }
        public int MappingId { get; set; }
    }
}
