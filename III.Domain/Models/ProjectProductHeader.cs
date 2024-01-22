using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Newtonsoft.Json;

namespace ESEIM.Models
{
    [Table("PROJECT_PRODUCT_HEADER")]
    public class ProjectProductHeader
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]

        public int Id { get; set; }

        [StringLength(255)]
        public string TicketCode { get; set; }
        public string Title { get; set; }
        public string ProjectCode { get; set; }

        public DateTime? TicketTime { get; set; }

        public string Note { get; set; }
        public string Sender { get; set; }
        public string Receiver { get; set; }
        public string Supplier { get; set; }
				
        public string PortType { get; set; }
        public string StoreCode { get; set; }

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

        public int? TicketCount { get; set; }
				
        [StringLength(50)]
        public string CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }
        [StringLength(50)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        [StringLength(50)]
        public string DeletedBy { get; set; }

        public DateTime? DeletedTime { get; set; }

        public bool IsDeleted { get; set; }
    }
    public class ProjectProductHeaderCrudModel
    {
        public int? Id { get; set; }
        public string TicketCode { get; set; }
        public string Title { get; set; }
        public int? TicketCount { get; set; }

        public string ProjectCode { get; set; }
        public string StoreCode { get; set; }
        public string TicketTime { get; set; }
        public string Note { get; set; }
        public string Sender { get; set; }
        public string Receiver { get; set; }
        public string Supplier { get; set; }
        public string PortType { get; set; }
    }
}
