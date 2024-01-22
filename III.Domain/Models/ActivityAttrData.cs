using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("ACTIVITY_ATTR_DATA")]
    public class ActivityAttrData
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }

        public string WorkFlowCode { get; set; }

        [NotMapped]
        public string ObjActCode { get; set; }

        [StringLength(100)]
        public string AttrCode { get; set; }

        [StringLength(255)]
        public string Value { get; set; }

        [StringLength(100)]
        public string ActCode { get; set; }

        [StringLength(1000)]
        public string Note { get; set; }

        [StringLength(100)]
        public string ObjCode { get; set; }

        [StringLength(100)]
        public string CreatedBy { get; set; }
        public DateTime? CreatedTime { get; set; }

        [StringLength(100)]
        public string UpdatedBy { get; set; }
        public DateTime? UpdatedTime { get; set; }

        [StringLength(100)]
        public string DeletedBy { get; set; }
        public DateTime? DeletedTime { get; set; }
        public bool IsDeleted { get; set; }
        public string SessionId { get; set; }
        public string FilePath { get; set; }
    }
}
