using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("PO_BUYER_DETAIL")]
    public class PoBuyerDetail
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string PoSupCode { get; set; }
        public string ProductCode { get; set; }
        public string Quantity { get; set; }
        public string Unit { get; set; }
        public decimal? UnitPrice { get; set; }
        public decimal? TotalAmount { get; set; }
        public string Note { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedTime { get; set; }
        public string UpdatedBy { get; set; }
        public DateTime? UpdatedTime { get; set; }
        public string DeletedBy { get; set; }
        public DateTime? DeletedTime { get; set; }
        public bool IsDeleted { get; set; }

        [StringLength(50)]
        public string ProductType { get; set; }

        [StringLength(50)]
        public string Currency { get; set; }
        public decimal QuantityNeedImport { get; set; }

        [StringLength(255)]
        public string PoCount { get; set; }

        public decimal? RateConversion { get; set; }

        public decimal? RateLoss { get; set; }

        public string SupCode { get; set; }
        public DateTime? ExpectedDate { get; set; }
        [NotMapped]
        public string sExpectedDate { get; set; }

        public string Type { get; set; }
        public string ReqCode { get; set; }
    }
}
