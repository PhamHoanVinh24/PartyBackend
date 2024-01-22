using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("ASSET_TRANSFER_HEADER")]
    public class AssetTransferHeader
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int AssetID { get; set; }

        [StringLength(maximumLength: 100)]
        public string Ticketcode { get; set; }

        [StringLength(maximumLength: 255)]
        public string QRcode { get; set; }

        [StringLength(100)]
        public string ObjActCode { get; set; }

        [StringLength(maximumLength: 255)]
        public string Ticket { get; set; }

        [StringLength(maximumLength: 255)]
        public string DepartTransf { get; set; }

        [StringLength(maximumLength: 255)]
        public string UserTransf { get; set; }

        [StringLength(maximumLength: 255)]
        public string LocationTransf { get; set; }

        public DateTime? StartTime { get; set; }

        [StringLength(maximumLength: 255)]
        public string DepartReceived { get; set; }

        [StringLength(maximumLength: 255)]
        public string UserReceived { get; set; }

        public DateTime? ReceivedTime { get; set; }

        [StringLength(maximumLength: 255)]
        public string ReceivedLocation { get; set; }

        public string Status { get; set; }

        [StringLength(maximumLength: 255)]
        public string Note { get; set; }

        [StringLength(maximumLength: 50)]
        public string CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }

        [StringLength(maximumLength: 50)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        public bool IsDeleted { get; set; }

        public DateTime? DeletedTime { get; set; }


        [StringLength(maximumLength: 50)]
        public string DeletedBy { get; set; }

        [NotMapped]
        [StringLength(maximumLength: 50)]
        public string sStartTime { get; set; }
        [NotMapped]
        [StringLength(maximumLength: 50)]
        public string sReceivedTime { get; set; }
        public string WorkflowCat { get; set; }

        [NotMapped]
        public List<EDMSStatusAT> ListStatus { get; set; }

        public string LogStatus
        {
            get
            {
                return JsonConvert.SerializeObject(ListStatus);
            }
            set
            {
                ListStatus = string.IsNullOrEmpty(value)
                ? new List<EDMSStatusAT>()
                : JsonConvert.DeserializeObject<List<EDMSStatusAT>>(value);
            }
        }

    }

    public class EDMSStatusAT
    {
        public string Type { get; set; }
        public string Status { get; set; }
        public string Reason { get; set; }
        public string CreatedBy { get; set; }
        public DateTime? CreatedTime { get; set; }
    }


}
