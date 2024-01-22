
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("REQUEST_IMP_PRODUCT_HEADER")]
    public class RequestImpProductHeader
    {
        public RequestImpProductHeader()
        {
            ListProductDetail = new List<RequestImpProductDetail>();
            ListStatusObjectLog = new List<JsonLog>();
        }

        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string ReqCode { get; set; }
        [NotMapped]
        public string PoSupCode { get; set; }
        public string Title { get; set; }
        public string PoCode { get; set; }
        [NotMapped]
        public string PoName { get; set; }
        public string CusCode { get; set; }
        public string Status { get; set; }
        public DateTime CreatedTime { get; set; }
        public string CreatedBy { get; set; }
        public string UpdatedBy { get; set; }
        public DateTime? UpdatedTime { get; set; }
        public string ApprovedBy { get; set; }
        public DateTime? ApprovedTime { get; set; }
        public string DeletedBy { get; set; }
        public DateTime? DeletedTime { get; set; }
        public bool IsDeleted { get; set; }
        [NotMapped]
        public List<RequestImpProductDetail> ListProductDetail { get; set; }
        [NotMapped]
        public List<RequestImpProductDetail> ListDelProduct { get; set; }
        public string ProjectCode { get; set; }
        [NotMapped]
        public string ProjectName { get; set; }

        public string WorkflowCat { get; set; }
        public string JsonData { get; set; }
        [NotMapped]
        public string ActRepeat { get; set; }
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
        public string LogData { get; set; }
        public string LogProductDetail { get; set; }

        [StringLength(50)]
        public string UserRequest { get; set; }

        public DateTime? TimeTicketCreate { get; set; }
        [NotMapped]
        public string STimeTicketCreate { get; set; }
    }
}
