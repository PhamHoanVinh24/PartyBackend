using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("WAREHOURSE_COIL_INFO")]
    public class WarehouseCoilInfo
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string CoilCode { get; set; }

        [StringLength(255)]
        public int? Size { get; set; }

        [StringLength(255)]
        public int? Remain { get; set; }

        [StringLength(255)]
        public string PositionInStore { get; set; }

        [StringLength(50)]
        public string CreatedBy { get; set; }

        public DateTime CreatedTime { get; set; }

        [StringLength(50)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        [StringLength(50)]
        public string DeletedBy { get; set; }

        public DateTime? DeletedTime { get; set; }

        public bool IsDeleted { get; set; }

        public string TicketCode { get; set; }
        public string CoilRelative { get; set; }
    }
}
