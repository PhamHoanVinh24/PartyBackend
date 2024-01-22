using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("ASSET_REQ_MAINTAINCE_REPARR_DETAIL")]
    public class AssetRqMaintenanceRepairDetail
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }

        [StringLength(maximumLength: 100)]
        public string TicketCode { get; set; }

        public int Quantity { get; set; }
        public int CostValue { get; set; }
        [StringLength(maximumLength: 255)]
        public string AssetCode { get; set; }

        [StringLength(maximumLength: 255)]
        public string AssetName { get; set; }

        [StringLength(maximumLength: 255)]
        public string Property { get; set; }


        [StringLength(maximumLength: 255)]
        public string AssetType { get; set; }

        [StringLength(maximumLength: 255)]
        public string CreateBy { get; set; }
        
        public DateTime? CreateTime { get; set; }

       
        
        [StringLength(maximumLength: 255)]
        public string TicketType { get; set; }

        [StringLength(maximumLength: 255)]
        public string StatusAsset { get; set; }

        [StringLength(maximumLength: 255)]
        public string Note { get; set; }

       
        [StringLength(maximumLength: 50)]
        public string UpdateBy { get; set; }

        public DateTime? UpdateTime { get; set; }

        public bool IsDeleted { get; set; }

        public DateTime? DeleteTime { get; set; }


        [StringLength(maximumLength: 50)]
        public string DeleteBy { get; set; }

        [NotMapped]
        [StringLength(maximumLength: 50)]
        public string sStartTime { get; set; }
        [NotMapped]
        [StringLength(maximumLength: 50)]
        public string sReceivedTime { get; set; }

        

    }

   

}
