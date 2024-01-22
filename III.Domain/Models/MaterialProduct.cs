using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("MATERIAL_PRODUCT")]
    public class MaterialProduct
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(100)]
        public string ProductCode { get; set; }

        [StringLength(255)]
        public string ProductName { get; set; }

        [StringLength(50)]
        public string GroupCode { get; set; }

        public MaterialProductGroup Group { get; set; }

        [StringLength(50)]
        public string TypeCode { get; set; }

        [StringLength(50)]
        public string TypeCode2 { get; set; }

        [StringLength(500)]
        public string Note { get; set; }

        public int? Accessory { get; set; }

        [StringLength(255)]
        public string Status { get; set; }

        public int? Flag { get; set; }

        public string Barcode { get; set; }

        public string Image { get; set; }


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

        [StringLength(50)]
        public string Unit { get; set; }
        public string QrCode { get; set; }
        public string Material { get; set; }
        public string Pattern { get; set; }
        public decimal? Wide { get; set; }
        public decimal? High { get; set; }
        public decimal? Long { get; set; }
        public decimal? Weight { get; set; }
        public string UnitWeight { get; set; }
        public string Supplier { get; set; }
        public string Brand { get; set; }

        public string Inheritance { get; set; }
        public string Description { get; set; }
        public decimal? InStock { get; set; }
        public decimal? ForecastInStock { get; set; }
        public DateTime? ForecastTime { get; set; }
        [NotMapped]
        public string sForeCastTime { get; set; }

        public decimal? PricePerM { get; set; }
        public decimal? PricePerM2 { get; set; }

        public decimal? PriceCostCatelogue { get; set; }
        public decimal? PriceCostAirline { get; set; }
        public decimal? PriceCostSea { get; set; }
        public decimal? PriceRetailBuild { get; set; }
        public decimal? PriceRetailBuildAirline { get; set; }
        public decimal? PriceRetailBuildSea { get; set; }
        public decimal? PriceRetailNoBuild { get; set; }
        public decimal? PriceRetailNoBuildAirline { get; set; }
        public decimal? PriceRetailNoBuildSea { get; set; }
        public string Label { get; set; }
        public string ImpType { get; set; }
        public string Packing { get; set; }
        public string Json { get; set; }
        public string DeletionToken { get; set; }
        public string Serial { get; set; }
        public string JsonStatus
        {
            get
            {
                return JsonConvert.SerializeObject(MpStatuses);
            }
            set
            {
                MpStatuses = string.IsNullOrEmpty(value)
                ? new List<MpStatus>()
                : JsonConvert.DeserializeObject<List<MpStatus>>(value);
            }
        }
        [NotMapped]
        public List<MpStatus> MpStatuses { get; set; }
    }
    public class MpStatus
    {
        public DateTime? ActTime { get; set; }
        public string ProductNo { get; set; }
        public string MappingCode { get; set; }
        public string SupCode { get; set; }
        public string CusCode { get; set; }
        public string ActStatus { get; set; }
        public string ActBy { get; set; }
    }
}
