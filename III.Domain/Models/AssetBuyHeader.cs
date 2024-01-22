using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("ASSET_BUY_HEADER")]
    public class AssetBuyHeader
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }

        [StringLength(maximumLength: 100)]
        public string TicketCode { get; set; }

        [StringLength(maximumLength: 255)]
        public string Buyer { get; set; }

        [StringLength(maximumLength: 255)]
        public string Title { get; set; }
        [StringLength(maximumLength: 255)]
        public string Currency { get; set; }
        [StringLength(maximumLength: 100)]
        public string Branch { get; set; }


        [StringLength(maximumLength: 255)]
        public string CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }

        [StringLength(maximumLength: 255)]
        public string Location { get; set; }
        public DateTime? BuyTime { get; set; }

        public int TotalMoney { get; set; }


        [StringLength(maximumLength: 255)]
        public string Status { get; set; }

        [StringLength(maximumLength: 255)]
        public string Note { get; set; }

       [StringLength(maximumLength: 255)]
        public string Depart { get; set; }
        
        [StringLength(maximumLength: 50)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        public bool IsDeleted { get; set; }

        public DateTime? DeletedTime { get; set; }
        [StringLength(maximumLength: 100)]
        public string ObjActCode { get; set; }

        [StringLength(maximumLength: 50)]
        public string DeletedBy { get; set; }

        [NotMapped]
        [StringLength(maximumLength: 50)]
        public string sStartTime { get; set; }

        public string WorkflowCat { get; set; }

        public string JsonData { get; set; }
    }
}
