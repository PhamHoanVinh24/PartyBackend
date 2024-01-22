using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("PO_SALE_PRODUCT_DETAIL")]
    public class PoSaleProductDetail
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(100)]
        public string ProductCode { get; set; }

        [StringLength(255)]
        public string ProductName { get; set; }

        [Required]
        [Range(0, double.MaxValue, ErrorMessage = "Please enter input Quantity greater than 0")]
        public decimal Quantity { get; set; }

        [StringLength(50)]
        public string Unit { get; set; }

        [Required]
        [Range(0, double.MaxValue, ErrorMessage = "Please enter input Cost greater than 0")]
        public decimal Cost { get; set; }

        [NotMapped]
        public int? ContractHeaderID { get; set; }

        [StringLength(100)]
        public string ContractCode { get; set; }

        public int? ContractVersion { get; set; }

        [StringLength(500)]
        public string Note { get; set; }

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
        public double Tax { get; set; }
        public double Commission { get; set; }
        public double CustomFee { get; set; }
        public double Discount { get; set; }
        public string PriceType { get; set; }

        [StringLength(50)]
        public string ProductType { get; set; }

        public decimal QuantityNeedExport { get; set; }

        [NotMapped]
        public string PackJson { get; set; }

        [NotMapped]
        public string Pack { get; set; }
    }

    public class ContractDetailExport
    {
        public int No { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public decimal? Quantity { get; set; }
        public string Unit { get; set; }
        public decimal? Price { get; set; }
        public string ValueRequire { get; set; }
        public decimal? TotalAmount { get; set; }
    }
}
