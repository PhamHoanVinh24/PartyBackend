using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("EDMS_BOX_TRACKING")]
    public class EDMSBoxTracking
    { 
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string BoxCode { get; set; }

        [StringLength(255)]
        public string Action { get; set; }

        [StringLength(255)]
        public string Note { get; set; }

        public DateTime? ActionTime { get; set; }

        [StringLength(255)]
        public string PositionBox { get; set; }

        [StringLength(255)]
        public string CreatedBy { get; set; }

        [StringLength(255)]
        public string UpdatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }
        public DateTime? UpdatedTime { get; set; }
    }
}
