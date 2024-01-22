using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("ASSET_RECALLED_HEADER")]
    public class AssetRecalledHeader
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }

        [StringLength(100)]
        public string TicketCode { get; set; }

        [StringLength(100)]
        public string ObjActCode { get; set; }

        [StringLength(255)]
        public string Title { get; set; }

        public string Status { get; set; }

        [StringLength(255)]
        public string BranchRecalled { get; set; }

        [StringLength(100)]
        public string UserRecalled { get; set; }

        [StringLength(100)]
        public string UserConfirm { get; set; }
        public DateTime? RecalledTime { get; set; }

        [NotMapped]
        public string sRecalledTime { get; set; }

        [StringLength(255)]
        public string LocationRecalled { get; set; }

        [StringLength(1000)]
        public string Description { get; set; }
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

        [NotMapped]
        public List<AssetRecalledStatus> ListStatus { get; set; }

        public string LogStatus
        {
            get
            {
                return JsonConvert.SerializeObject(ListStatus);
            }
            set
            {
                ListStatus = string.IsNullOrEmpty(value)
                ? new List<AssetRecalledStatus>()
                : JsonConvert.DeserializeObject<List<AssetRecalledStatus>>(value);
            }
        }

        public string WorkflowCat { get; set; }

        [NotMapped]
        public string ActRepeat { get; set; }
    }

    public class AssetRecalledStatus
    {
        public string Type { get; set; }
        public string Status { get; set; }
        public string Reason { get; set; }
        public string CreatedBy { get; set; }
        public DateTime? CreatedTime { get; set; }
    }
}
