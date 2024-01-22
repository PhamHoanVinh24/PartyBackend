using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("WHS_ZONE_ATTR")]
    public class ZoneAttr
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }

        public string ZoneAttrCode { get; set; }

        public string ZoneAttrName { get; set; }

        public string ZoneAttrValue { get; set; }

        public string ZoneAttrUnit { get; set; }

        public string ZoneAttrType { get; set; }

        public string ZoneAttrSize { get; set; }

        public string ZoneType { get; set; }

        public string ZoneGroup { get; set; }

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
    }
}
