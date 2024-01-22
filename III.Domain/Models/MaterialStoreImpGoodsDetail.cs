using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("MATERIAL_STORE_IMP_GOODS_DETAIL")]
    public class MaterialStoreImpGoodsDetail
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string TicketCode { get; set; }

        [StringLength(255)]
        public string LotProductCode { get; set; }

        [StringLength(100)]
        public string ProductCode { get; set; }

        [StringLength(50)]
        public string ProductType { get; set; }

        [StringLength(255)]
        public string ProductQrCode { get; set; }

        public decimal Quantity { get; set; }

        [StringLength(50)]
        public string Unit { get; set; }

        public decimal? SalePrice { get; set; }

        [StringLength(50)]
        public string Currency { get; set; }

        public int? TaxRate { get; set; }

        public int? Discount { get; set; }

        public int? Commission { get; set; }

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
        public string RackCode { get; set; }
        public decimal QuantityIsSet { get; set; }
        [NotMapped]
        public string ProductCoil { get; set; }
        public string PackType { get; set; }
        public string ProductLot { get; set; }
    }
}
