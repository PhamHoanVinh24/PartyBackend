using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ESEIM.Utils;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("PAY_SCALE")]
    public class PayScale
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(maximumLength: 50)]
        public string PayScaleCode { get; set; }

        public decimal? PayBase { get; set; }

        [StringLength(maximumLength: 50)]
        public string Unit { get; set; }

        
        [StringLength(maximumLength: 50)]
        public string CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }

        [StringLength(maximumLength: 50)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        [StringLength(maximumLength: 50)]
        public string DeletedBy { get; set; }

        public DateTime? DeletedTime { get; set; }

        public bool IsDeleted { get; set; }
        public string CareerCode { get; set; }
        public string CareerTitle { get; set; }
        public string Certificate { get; set; }
        public string Major { get; set; }
    }
}