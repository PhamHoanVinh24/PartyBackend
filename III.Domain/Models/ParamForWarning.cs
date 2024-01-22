using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("PARAM_4_WARNING")]
    public class ParamForWarning
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int id { get; set; }

        [StringLength(100)]
        public string aetType { get; set; }

        [StringLength(100)]
        public string catCode { get; set; }

        [StringLength(255)]
        public decimal? total { get; set; }

        [StringLength(255)]
        public string currency { get; set; }       

        public DateTime? fromTime { get; set; }
        public DateTime? toTime { get; set; }
        [StringLength(50)]
        public string createdBy { get; set; }
        public DateTime? createdTime { get; set; }
        [StringLength(50)]
        public string updatedBy { get; set; }
        public DateTime? updatedTime { get; set; }
        [StringLength(50)]
        public string deletedBy { get; set; }
        public DateTime? deletedTime { get; set; }
       
        public bool isDeleted { get; set; }
    }

    public class ParamForWarningModel
    {
        public int id { get; set; }

        [StringLength(100)]
        public string AETType { get; set; }

        [StringLength(100)]
        public string CatCode { get; set; }

        [StringLength(255)]
        public string Total { get; set; }

        [StringLength(255)]
        public string Currency { get; set; }

        public string FromTime { get; set; }
        public string ToTime { get; set; }
        [StringLength(50)]
        public string CreatedBy { get; set; }
        public string CreatedTime { get; set; }
        [StringLength(50)]
        public string UpdatedBy { get; set; }
        public string UpdatedTime { get; set; }
        [StringLength(50)]
        public string DeletedBy { get; set; }
        public string DeletedTime { get; set; }

        public bool IsDeleted { get; set; }
    }
}