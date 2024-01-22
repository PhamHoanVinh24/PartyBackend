using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("ASSET_TRANSFER_DETAILS")]
    public class AssetTransferDetail
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int AssetID { get; set; }

        [StringLength(maximumLength: 50)]
        public string AssetCode { get; set; }

        public int Quantity { get; set; }

        [StringLength(maximumLength: 255)]
        public string CostValue { get; set; }

        [StringLength(maximumLength: 255)]
        public string ListImage { get; set; }

        [StringLength(maximumLength: 255)]
        public string AssetName { get; set; }

        [StringLength(maximumLength: 255)]
        public string StatusAsset { get; set; }

        [StringLength(maximumLength: 255)]
        public string Note { get; set; }

        [StringLength(maximumLength: 50)]
        public string CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }

        [StringLength(maximumLength: 50)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        public Boolean IsDeleted { get; set; }

        [StringLength(maximumLength: 100)]
        public string Ticketcode { get; set; }
        [NotMapped]
        [StringLength(maximumLength: 50)]
        public string sStartTime { get; set; }
        [NotMapped]
        [StringLength(maximumLength: 50)]
        public string sReceivedTime { get; set; }

        public DateTime? DeletedTime { get; set; }


        [StringLength(maximumLength: 50)]
        public string DeletedBy { get; set; }

    }
}
