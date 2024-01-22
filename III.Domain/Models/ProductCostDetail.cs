using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("PRODUCT_COST_DETAIL")]
    public class ProductCostDetail
    {
        public ProductCostDetail()
        {
            ListProductProcess = new List<ProductProcess>();
        }

        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        [StringLength(255)]
        public string HeaderCode { get; set; }
        [StringLength(255)]
        public string ProductCode { get; set; }
        public decimal PriceCost { get; set; }
        public decimal PriceRetail { get; set; }
        public int Tax { get; set; }
        //public decimal Commission { get; set; }
        //public decimal Discount { get; set; }
        //public decimal CustomFee { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedTime { get; set; }
        [StringLength(50)]
        public string UpdatedBy { get; set; }
        public DateTime? UpdatedTime { get; set; }
        [StringLength(50)]
        public string DeletedBy { get; set; }
        public DateTime? DeletedTime { get; set; }
        public bool IsDeleted { get; set; }
        public string Catelogue { get; set; }
        public decimal? PriceCostDefault { get; set; }
        public decimal? PriceCostCatelogue { get; set; }
        public decimal? PriceCostAirline { get; set; }
        public decimal? PriceCostSea { get; set; }
        public decimal? PriceRetailBuild { get; set; }
        public decimal? PriceRetailBuildAirline { get; set; }
        public decimal? PriceRetailBuildSea { get; set; }
        public decimal? PriceRetailNoBuild { get; set; }
        public decimal? PriceRetailNoBuildAirline { get; set; }
        public decimal? PriceRetailNoBuildSea { get; set; }
        [NotMapped]
        public decimal? RatePriceCostCatelogue { get; set; }
        [NotMapped]
        public decimal? RatePriceCostAirline { get; set; }
        [NotMapped]
        public decimal? RatePriceCostSea { get; set; }
        [NotMapped]
        public decimal? RatePriceRetailBuild { get; set; }
        [NotMapped]
        public decimal? RatePriceRetailBuildAirline { get; set; }
        [NotMapped]
        public decimal? RatePriceRetailBuildSea { get; set; }
        [NotMapped]
        public decimal? RatePriceRetailNoBuild { get; set; }
        [NotMapped]
        public decimal? RatePriceRetailNoBuildAirline { get; set; }
        [NotMapped]
        public decimal? RatePriceRetailNoBuildSea { get; set; }
        [NotMapped]
        public string ProductName { get; set; }
        [NotMapped]
        public string ProductType { get; set; }

        [NotMapped]
        public List<ProductProcess> ListProductProcess { get; set; }
    }

    public class ProductProcess
    {
        public int Id { get; set; }
    }
}
