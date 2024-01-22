using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("EDMS_REQUEST_TRACKING")]
    public class EDMSRequestTracking
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string Reason { get; set; }

        [StringLength(255)]
        public string BrCode { get; set; }
        public int? RqId { get; set; }

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

        [StringLength(255)]
        public string RqStatus { get; set; }
    }

    public class EDMSRequestTrackingModel
    {
        public int Id { get; set; }

        [StringLength(255)]
        public string Reason { get; set; }

        [StringLength(255)]
        public string BrCode { get; set; }
        public int? RqId { get; set; }
    }
}