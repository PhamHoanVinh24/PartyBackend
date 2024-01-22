using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("ASSET_INVENTORY_DETAIL")]
    public class AssetInventoryDetail
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int AssetID { get; set; }

        [StringLength(maximumLength: 50)]
        public string TicketCode { get; set; }

        [StringLength(maximumLength: 255)]
        public string AssetName { get; set; }
        
        [StringLength(maximumLength: 255)]
        public string StatusAsset { get; set; }
        
        public int Quantity { get; set; }
        
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
        
    }
}
