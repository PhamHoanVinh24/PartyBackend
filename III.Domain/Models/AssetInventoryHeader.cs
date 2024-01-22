using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("ASSET_INVENTORY_HEADER")]
    public class AssetInventoryHeader
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int AssetID { get; set; }
        
        [StringLength(maximumLength: 100)]
        public string TicketCode { get; set; }
        
        [StringLength(maximumLength: 255)]
        public string Title { get; set; }

        [StringLength(maximumLength: 255)]
        public string Branch { get; set; }

        [StringLength(maximumLength: 255)]
        public string Person { get; set; }

        [StringLength(maximumLength: 255)]
        public string Note { get; set; }

        public string Status { get; set; }

        [StringLength(maximumLength: 255)]
        public string CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }

        [StringLength(maximumLength: 255)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        [StringLength(maximumLength: 255)]
        public string DeletedBy { get; set; }
        
        public DateTime? DeletedTime { get; set; }

        public Boolean IsDeleted { get; set; }

        public DateTime? InventoryTime { get; set; }
        
        [StringLength(maximumLength: 255)]
        public string Adress { get; set; }
        
        [StringLength(100)]
        public string ObjActCode { get; set; }
        
        [NotMapped]
        [StringLength(maximumLength: 50)]
        public string sStartTime { get; set; }

        public string WorkflowCat { get; set; }

    }
   
}
