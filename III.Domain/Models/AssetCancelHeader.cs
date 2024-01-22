using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("ASSET_CANCEL_HEADER")]
    public class AssetCancelHeader
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int AssetID { get; set; }
        
        [StringLength(maximumLength: 100)]
        public string TicketCode { get; set; }
        
        [StringLength(maximumLength: 255)]
        public string Title { get; set; }

        [StringLength(100)]
        public string ObjActCode { get; set; }

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

        [StringLength(maximumLength: 255)]
        public string Adress { get; set; }

        public DateTime? CancelTime { get; set; }

        [NotMapped]
        [StringLength(maximumLength: 50)]
        public string sStartTime { get; set; }

        [NotMapped]
        public List<EDMSStatus1> ListStatus { get; set; }

        public string WorkflowCat { get; set; }
        public string LogStatus
        {
            get
            {
                return JsonConvert.SerializeObject(ListStatus);
            }
            set
            {
                ListStatus = string.IsNullOrEmpty(value)
                ? new List<EDMSStatus1>()
                : JsonConvert.DeserializeObject<List<EDMSStatus1>>(value);
            }
        }
    }
    public class EDMSStatus1
    {
        public string Type { get; set; }
        public string Status { get; set; }
        public string Reason { get; set; }
        public string CreatedBy { get; set; }
        public DateTime? CreatedTime { get; set; }
    }
}
