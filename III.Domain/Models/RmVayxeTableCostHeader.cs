using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("RM_VAYXE_TABLE_COST_HEADER")]
    public class RmVayxeTableCostHeader
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        [StringLength(maximumLength: 255)]
        public string TableCode { get; set; }
        [StringLength(maximumLength: 255)]
        public string TableName { get; set; }
        [StringLength(maximumLength: 500)]
        public string Note { get; set; }
        public DateTime? CreatedTime { get; set; }
        public DateTime? UpdatedTime { get; set; }
        public int? Flag { get; set; }
        [StringLength(maximumLength: 255)]
        public string CreatedBy { get; set; }
        [StringLength(maximumLength: 255)]
        public string UpdatedBy { get; set; }
        public int? Status { get; set; }
        public int? CreaterId { get; set; }
        [StringLength(maximumLength: 255)]
        public string AppoverId { get; set; }
        public DateTime? BeginTimeApply { get; set; }
        public DateTime? EndTimeApply { get; set; }
    }
}
