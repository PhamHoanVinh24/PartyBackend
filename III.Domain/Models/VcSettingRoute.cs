using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("VC_SETTING_ROUTE")]
    public class VcSettingRoute
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(100)]
        public string RouteCode { get; set; }

        [StringLength(100)]
        public string WpCode { get; set; }

        [StringLength(1000)]
        public string Node { get; set; }

        public DateTime? TimeWork { get; set; }

        [StringLength(1000)]
        public string Note { get; set; }

        public int Order { get; set; }

        public DateTime? TimePlan { get; set; }

        [StringLength(50)]
        public string CurrentStatus { get; set; }

        public decimal? Proportion { get; set; }
        public decimal? TotalCanImp { get; set; }

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
    }
}