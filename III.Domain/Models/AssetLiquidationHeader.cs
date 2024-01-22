using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("ASSET_LIQUIDATION_HEADER")]
    public class AssetLiquidationHeader
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }

        [StringLength(100)]
        public string TicketCode { get; set; }

        [StringLength(1000)]
        public string ObjActCode { get; set; }

        [StringLength(255)]
        public string Title { get; set; }

        [StringLength(255)]
        public string BranchLiquidation { get; set; }

        public DateTime? LiquidationTime { get; set; }

        [NotMapped]
        public string sLiquidationTime { get; set; }

        [StringLength(50)]
        public string UserLiquidation { get; set; }

        [StringLength(255)]
        public string LocationLiquidation { get; set; }

        [StringLength(50)]
        public string Status { get; set; }

        [StringLength(1000)]
        public string Description { get; set; }

        [StringLength(50)]
        public string UserBuy { get; set; }

        public bool IsDeleted { get; set; }

        public DateTime? CreatedTime { get; set; }
        public DateTime? UpdatedTime { get; set; }
        public DateTime? DeletedTime { get; set; }

        [StringLength(100)]
        public string CreatedBy { get; set; }

        [StringLength(100)]
        public string UpdatedBy { get; set; }

        [StringLength(100)]
        public string DeletedBy { get; set; }

        [NotMapped]
        public List<AssetLiquidationStatus> ListStatus { get; set; }

        public string LogStatus
        {
            get
            {
                return JsonConvert.SerializeObject(ListStatus);
            }
            set
            {
                ListStatus = string.IsNullOrEmpty(value)
                ? new List<AssetLiquidationStatus>()
                : JsonConvert.DeserializeObject<List<AssetLiquidationStatus>>(value);
            }
        }

        public string WorkflowCat { get; set; }

        [NotMapped]
        public string ActRepeat { get; set; }
    }

    public class AssetLiquidationStatus
    {
        public string Type { get; set; }
        public string Status { get; set; }
        public string Reason { get; set; }
        public string CreatedBy { get; set; }
        public DateTime? CreatedTime { get; set; }
    }
}
