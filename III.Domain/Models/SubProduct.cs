using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("SUB_PRODUCT")]
    public class SubProduct
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string ProductCode { get;set; }

        [StringLength(255)]
        public string AttributeCode { get; set; }

        [StringLength(50)]
        public string AttributeName { get; set; }
        public string Value { get; set; }
        public string Unit { get; set; }
        public string Note { get; set; }

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
        public string Image { get; set; }
        public string ProductQrCode { get; set; }
        public string Group { get; set; }
        public string Type { get; set; }
        public decimal? InStock { get; set; }
        public decimal? ForecastInStock { get; set; }
        public DateTime? ForecastTime { get; set; }
        [NotMapped]
        public string sForeCastTime { get; set; }

        public decimal? PriceCostCatelogue { get; set; }
        public decimal? PriceCostAirline { get; set; }
        public decimal? PriceCostSea { get; set; }
        public decimal? PriceRetailBuild { get; set; }
        public decimal? PriceRetailBuildAirline { get; set; }
        public decimal? PriceRetailBuildSea { get; set; }
        public decimal? PriceRetailNoBuild { get; set; }
        public decimal? PriceRetailNoBuildAirline { get; set; }
        public decimal? PriceRetailNoBuildSea { get; set; }
        public decimal? PricePerM { get; set; }
        public decimal? PricePerM2 { get; set; }
        public string ImpType { get; set; }
    }
}
