using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("ASSET_RECALLED_DETAIL")]
    public class AssetRecalledDetail
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }

        [StringLength(100)]
        public string TicketCode { get; set; }

        [StringLength(100)]
        public string AssetCode { get; set; }
        public int Quantity { get; set; }
        public decimal CostValue { get; set; }
        public decimal TotalMoney { get; set; }

        [StringLength(100)]
        public string Status { get; set; }

        [StringLength(1000)]
        public string Note { get; set; }
        public bool IsDeleted { get; set; }

        [StringLength(100)]
        public string CreatedBy { get; set; }
        public DateTime? CreatedTime { get; set; }

        [StringLength(100)]
        public string UpdatedBy { get; set; }
        public DateTime? UpdatedTime { get; set; }

        [StringLength(100)]
        public string DeletedBy { get; set; }
        public DateTime? DeletedTime { get; set; }
    }
}
