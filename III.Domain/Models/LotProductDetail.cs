using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("LOT_PRODUCT_DETAIL")]
    public class LotProductDetail
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string LotProductCode { get;set; }

        [StringLength(255)]
        public string ProductCode { get; set; }

        [StringLength(50)]
        public string ProductType { get; set; }

        public decimal Quantity { get; set; }

        [StringLength(50)]
        public string Unit { get; set; }

        public decimal Price { get; set; }

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

        public decimal Cost { get; set; }
        public int Tax { get; set; }
        public string Note { get; set; }
        public string BarCode { get; set; }
        public string QrCode { get; set; }

        public int? Discount { get; set; }

        public int? Commission { get; set; }

    }
}
