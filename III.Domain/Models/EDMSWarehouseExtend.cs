using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("EDMS_WAREHOUSE_EXTEND")]
    public class EDMSWarehouseExtend
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(100)]
        public string ExtCode { get; set; }
        public string WhsCode { get; set; }
        public DateTime CreatedTime { get; set; }
        public DateTime? UpdatedTime { get; set; }
        public bool? Flag { get; set; }
        [StringLength(maximumLength: 500)]
        public string ExtValue { get; set; }
        [StringLength(maximumLength: 255)]
        public string ExtGroup { get; set; }
        public bool IsDeleted { get; set; }

    }
}
