using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("ASSET_REQ_MAINTAINCE_REPARR_HEADER")]
    public class AssetRqMaintenanceRepairHeader
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }

        [StringLength(maximumLength: 100)]
        public string TicketCode { get; set; }

        [StringLength(maximumLength: 255)]
        public string UserReq { get; set; }

        [StringLength(maximumLength: 255)]
        public string Title { get; set; }

        [StringLength(maximumLength: 255)]
        public string Branch { get; set; }


        [StringLength(maximumLength: 255)]
        public string CreateBy { get; set; }

       

        [StringLength(maximumLength: 255)]
        public string LocationRepair { get; set; }
        public DateTime? ReqTime { get; set; }
        public DateTime? CreateTime { get; set; }

        [StringLength(maximumLength: 255)]
        public string CreateDepart { get; set; }
        
        [StringLength(maximumLength: 255)]
        public string Discription { get; set; }

        [StringLength(maximumLength: 255)]
        public string TicketType { get; set; }

        public string Status { get; set; }

        [StringLength(maximumLength: 255)]
        public string Note { get; set; }

        [StringLength(maximumLength: 255)]
        public string Reason { get; set; }
        
        [StringLength(maximumLength: 50)]
        public string UpdateBy { get; set; }

        public DateTime? UpdateTime { get; set; }

        public bool IsDeleted { get; set; }

        public DateTime? DeleteTime { get; set; }
        [StringLength(maximumLength: 100)]
        public string ObjActCode { get; set; }

        [StringLength(maximumLength: 50)]
        public string DeleteBy { get; set; }

        [NotMapped]
        [StringLength(maximumLength: 50)]
        public string sStartTime { get; set; }
        [NotMapped]
        [StringLength(maximumLength: 50)]
        public string sReceivedTime { get; set; }


        [NotMapped]
        public List<EDMSStatuss> ListStatus { get; set; }

        public string LogStatus
        {
            get
            {
                return JsonConvert.SerializeObject(ListStatus);
            }
            set
            {
                ListStatus = string.IsNullOrEmpty(value)
                ? new List<EDMSStatuss>()
                : JsonConvert.DeserializeObject<List<EDMSStatuss>>(value);
            }
        }

        public string WorkflowCat { get; set; }
        [NotMapped]
        public string ActRepeat { get; set; }

    }

    public class EDMSStatuss
    {
        public string Type { get; set; }
        public string Status { get; set; }
        public string Reason { get; set; }
        public string CreateBy { get; set; }
        public DateTime? CreateTime { get; set; }
    }


}
