using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("CONTRACT_SCHEDULE_PAY_HIS")]
    public class ContractSchedulePayHis
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        [StringLength(100)]
        public string ContractCode { get; set; }
        public int PayTimes { get; set; }
        public int? Percentage { get; set; }
        public double? Money { get; set; }
        public DateTime? EstimateTime { get; set; }
        [StringLength(500)]
        public string Note { get; set; }
        [StringLength(255)]
        public string Condition { get; set; }
        public double? Quantity { get; set; }
        [StringLength(50)]
        public string CreatedBy { get; set; }
        public DateTime? CreatedTime { get; set; }
        [StringLength(50)]
        public string UpdatedBy { get; set; }
        public DateTime? UpdatedTime { get; set; }
        [StringLength(50)]
        public string DeletedBy { get; set; }
        public DateTime? DeletedTime { get; set; }
        public bool IsDeleted { get; set; }
        public int ContractVersion { get; set; }
    }
}
