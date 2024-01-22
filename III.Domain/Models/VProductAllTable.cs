using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("V_PRODUCT_ALL_TABLE")]
    public class VProductAllTable
    {
        [Key]
        public Guid Id { get; set; }
        public string ProductCode { get; set; }
        public string ProductName { get; set; }
        public string Unit { get; set; }
        public string ProductType { get; set; }
        public string UnitName { get; set; }
        public decimal? PriceCostCatelogue { get; set; }
        public decimal? PriceCostAirline { get; set; }
        public decimal? PriceCostSea { get; set; }
        public decimal? PriceRetailBuild { get; set; }
        public decimal? PriceRetailBuildAirline { get; set; }
        public decimal? PriceRetailBuildSea { get; set; }
        public decimal? PriceRetailNoBuild { get; set; }
        public decimal? PriceRetailNoBuildAirline { get; set; }
        public decimal? PriceRetailNoBuildSea { get; set; }
    }
}
