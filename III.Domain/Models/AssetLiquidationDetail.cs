using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
 [Table("ASSET_LIQUIDATION_DETAIL")]
public class AssetLiquidationDetail
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }

        [StringLength(100)]
        public string AssetCode { get; set; }

        [StringLength(100)]
        public string TicketCode { get; set; }

        public int Quantity { get; set; }

        public decimal Price { get; set; }

        [StringLength(100)]
        public string Status { get; set; }

        [StringLength(1000)]
        public string Note { get; set; }

        public decimal TotalMoney { get; set; }

        public bool IsDeleted { get; set; }

        public DateTime? CreatedTime { get; set; }

        public DateTime? UpdatedTime { get; set; }

        public DateTime? DeletedTime { get; set; }

        [StringLength(50)]
        public string CreatedBy { get; set; }

        [StringLength(50)]
        public string UpdatedBy { get; set; }

        [StringLength(50)]
        public string DeletedBy { get; set; }
        [StringLength(50)]
        public string CurrencyAsset { get; set; }
    }
}
