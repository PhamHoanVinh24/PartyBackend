using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("PO_BUYER_HEADER")]
    public class PoBuyerHeader
    {
        public PoBuyerHeader()
        {
            ListStatusObjectLog = new List<JsonLog>();
        }
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public string BuyerCode { get; set; }

        public string SupCode { get; set; }

        public string PoTitle { get; set; }

        public string PoSupCode { get; set; }

        public DateTime? DateOfOrder { get; set; }
        [NotMapped]
        public string sDateOfOrder { get; set; }
        public string OrderBy { get; set; }

        public string Email { get; set; }
        public string PaymentTerm { get; set; }
        public string ShippingAdd { get; set; }
        public string Consigner { get; set; }
        public string Mobile { get; set; }
        public string Buyer { get; set; }
        public string Noted { get; set; }
        public string CreatedBy { get; set; }
        public DateTime? CreatedTime { get; set; }
        public string UpdatedBy { get; set; }
        public DateTime? UpdatedTime { get; set; }
        public string ApprovedBy { get; set; }
        public DateTime? ApprovedTime { get; set; }
        public string DeletedBy { get; set; }
        public DateTime? DeletedTime { get; set; }
        public bool IsDeleted { get; set; }
        public string Confirm { get; set; }
        public string Type { get; set; }
        [NotMapped]
        public string sEstimateTime { get; set; }
        public DateTime? EstimateTime { get; set; }

        [StringLength(20)]
        public string Currency { get; set; }
        public decimal? ExchangeRate { get; set; }
        public string ContractCode { get; set; }
        public string ProjectCode { get; set; }
        public string ListUserView { get; set; }
        public string WorkflowCat { get; set; }
        public string JsonData { get; set; }
        [NotMapped]
        public string ActRepeat { get; set; }
        [NotMapped]
        public string UserId { get; set; }
        public string Status { get; set; }
        public string StatusObject { get; set; }

        public string StatusObjectLog
        {
            get
            {
                return JsonConvert.SerializeObject(ListStatusObjectLog);
            }
            set
            {
                ListStatusObjectLog = string.IsNullOrEmpty(value)
                ? new List<JsonLog>()
                : JsonConvert.DeserializeObject<List<JsonLog>>(value);
            }
        }

        [NotMapped]
        public List<JsonLog> ListStatusObjectLog { get; set; }
    }

    public class ConfirmText
    {
        public string Id { get; set; }
        public string Body { get; set; }
        public string UserName { get; set; }
        public string CreateTime { get; set; }
    }
}
