using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("ASSET_ALLOCATE_HEADER")]
    public class AssetAllocateHeader
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }

        [StringLength(100)]
        public string TicketCode { get; set; }

        [StringLength(100)]
        public string ObjActCode { get; set; }

        [StringLength(255)]
        public string Title { get; set; }

        [StringLength(255)]
        public string DepartmentSend { get; set; }

        [StringLength(255)]
        public string UserAllocate { get; set; }

        [StringLength(255)]
        public string LocationSend { get; set; }

        [StringLength(50)]
        public string UserReceiver { get; set; }

        [StringLength(255)]
        public string DepartmentReceive { get; set; }

        [StringLength(1000)]
        public string Note { get; set; }

        public string Status { get; set; }

        public bool IsDeleted { get; set; }

        [StringLength(100)]
        public string CreatedBy { get; set; }

        [StringLength(100)]
        public string UpdateBy { get; set; }

        public DateTime? UpdateTime { get; set; }

        public DateTime? AllocateTime { get; set; }

        [NotMapped]
        [StringLength(50)]
        public string sAllocateTime { get; set; }

        public DateTime? CreatedTime { get; set; }

        [StringLength(100)]
        public string DeletedBy { get; set; }
        public DateTime? DeletedTime { get; set; }

        [NotMapped]
        public List<EDMSStatus> ListStatus { get; set; }

        public string LogStatus
        {
            get
            {
                return JsonConvert.SerializeObject(ListStatus);
            }
            set
            {
                ListStatus = string.IsNullOrEmpty(value)
                ? new List<EDMSStatus>()
                : JsonConvert.DeserializeObject<List<EDMSStatus>>(value);
            }
        }
        public string WorkflowCat { get; set; }
    }

    //public class EDMSStatus
    //{
    //    public string Type { get; set; }
    //    public string Status { get; set; }
    //    public string Reason { get; set; }
    //    public string CreatedBy { get; set; }
    //    public DateTime? CreatedTime { get; set; }
    //}
}