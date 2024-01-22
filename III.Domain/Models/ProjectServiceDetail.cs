using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Newtonsoft.Json;

namespace ESEIM.Models
{
    [Table("PROJECT_SERVICE_DETAIL")]
    public class ProjectServiceDetail
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]

        public int Id { get; set; }

        [StringLength(255)]
        public string TicketCode { get; set; }

        [StringLength(100)]
        public string ServiceCode { get; set; }

        [DataType("decimal(18,2)")]
        public decimal? Quantity { get; set; }

        [StringLength(255)]
        public string DurationTime { get; set; }

        [StringLength(255)]
        public string Unit { get; set; }

        public decimal? Cost { get; set; }
				
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
    }
}
