using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("PRODUCT_SETTING_WARNING")]
    public class ProductSettingWarning
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string ProductCode { get; set; }

        public decimal? MinValue { get; set; }

        public decimal? MaxValue { get; set; }

        public decimal? CurrentQuantity { get; set; }

        public DateTime? MinTime { get; set; }
        public DateTime? MaxTime { get; set; }

        public bool Flag { get; set; }
        public string WarningType { get; set; }


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

    public class ProductSettingWarningModel
    {
        public int? Id { get; set; }
        [StringLength(255)]
        public string ProductCode { get; set; }

        public decimal? MinValue { get; set; }

        public decimal? MaxValue { get; set; }

        public bool Flag { get; set; }
        public string WarningType { get; set; }
        public string FromDate { get; set; }
        public string ToDate { get; set; }
        public string UserName { get; set; }
    }
}