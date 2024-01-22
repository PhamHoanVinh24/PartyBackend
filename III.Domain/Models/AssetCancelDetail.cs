using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("ASSET_CANCEL_DETAIL")]
    public class AssetCancelDetail
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int AssetID { get; set; }

        [StringLength(maximumLength: 50)]
        public string TicketCode { get; set; }

        [StringLength(maximumLength: 255)]
        public string AssetName { get; set; }

        [StringLength(maximumLength: 255)]
        public string AssetUnit { get; set; }

        [StringLength(maximumLength: 255)]
        public string StatusAsset { get; set; }

        [StringLength(100)]
        public string Title { get; set; }

        public int QuantityAsset { get; set; }

        [StringLength(maximumLength: 255)]
        public string Cost { get; set; }

        [StringLength(maximumLength: 255)]
        public string ListImage { get; set; }

        [StringLength(maximumLength: 255)]
        public string Note { get; set; }
        
        [StringLength(maximumLength: 50)]
        public string CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }

        [StringLength(maximumLength: 50)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }
       
        [StringLength(maximumLength: 50)]
        public string DeletedBy { get; set; }

        [StringLength(maximumLength: 50)]
        public DateTime? DeletedTime { get; set; }

        public Boolean IsDeleted { get; set; }

        [StringLength(maximumLength: 255)]
        public string Adress { get; set; }

        public DateTime? CancelTime { get; set; }
    }
}
