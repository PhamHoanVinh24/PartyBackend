using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("ASSET_RPT_BROKEN_DETAILS")]
    public class AssetRPTBrokenDetails
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int AssetID { get; set; }

        [StringLength(100)]
        public string AssetCode { get; set; }

        [StringLength(255)]
        public string AssetName { get; set; }

        public int Quantity { get; set; }

        [StringLength(500)]
        public string Note { get; set; }


        [StringLength(255)]
        public string AssetStatus { get; set; }



        [StringLength(255)]
        public string CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }

        [StringLength(255)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        public Boolean IsDeleted { get; set; }

        [StringLength(50)]
        public DateTime? DeletedTime { get; set; }

        [StringLength(50)]
        public string DeletedBy { get; set; }

        [NotMapped]
        [StringLength(50)]
        public string sStartTime { get; set; }
        [NotMapped]
        [StringLength(50)]
        public string sReceivedTime { get; set; }

        [StringLength(100)]
        public string TicketCode { get; set; }
    }
}
