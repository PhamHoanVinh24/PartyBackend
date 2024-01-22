using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("ASSET_BUY_DETAIL")]
    public class AssetBuyDetail
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }
        public string CurrencyAsset { get; set; }

        [StringLength(maximumLength: 100)]
        public string TicketCode { get; set; }

        [StringLength(maximumLength: 100)]
        public string AssetCode { get; set; }

        [StringLength(maximumLength: 255)]
        public string CreatedBy { get; set; }
        [StringLength(maximumLength: 255)]
        public string AssetType { get; set; }
        public DateTime? CreatedTime { get; set; }
        [StringLength(maximumLength: 255)]
        public string StatusAsset { get; set; }
        [StringLength(maximumLength: 255)]
        public string Supplier { get; set; }

        [StringLength(maximumLength: 255)]
        public string Note { get; set; }

        public int CostValue { get; set; }

        [StringLength(maximumLength: 50)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        public bool IsDeleted { get; set; }

        [StringLength(maximumLength: 100)]
        public string DeletedBy { get; set; }
        public DateTime? DeletedTime { get; set; }
        public int Quantity { get; set; }

    }


}
