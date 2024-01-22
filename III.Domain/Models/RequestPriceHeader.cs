
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("REQUEST_PRICE_HEADER")]
    public class RequestPriceHeader
    {
        public RequestPriceHeader()
        {
            ListProductDetail = new List<RequestPriceDetail>();
        }

        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string ReqCode { get; set; }
        public string Title { get; set; }
        public string Status { get; set; }
        public DateTime CreatedTime { get; set; }
        public string CreatedBy { get; set; }
        public string UpdatedBy { get; set; }
        public DateTime? UpdatedTime { get; set; }
        public string DeletedBy { get; set; }
        public DateTime? DeletedTime { get; set; }
        public bool IsDeleted { get; set; }
        [NotMapped]
        public List<RequestPriceDetail> ListProductDetail { get; set; }
        public DateTime? ExpectedDate { get; set; }
        [NotMapped]
        public string sExpectedDate { get; set; }
        [NotMapped]
        public EDMSFile File { get; set; }
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

        [StringLength(50)]
        public string UserRequest { get; set; }

        public DateTime? TimeTicketCreate { get; set; }
        [NotMapped]
        public string STimeTicketCreate { get; set; }
    }

    public class RequestPriceHeaderModel
    {
        public RequestPriceHeaderModel()
        {
            ListProductDetail = new List<RequestPriceDetail>();
        }

        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string ReqCode { get; set; }
        public string Title { get; set; }
        public string Status { get; set; }
        public DateTime CreatedTime { get; set; }
        public string CreatedBy { get; set; }
        public string UpdatedBy { get; set; }
        public DateTime? UpdatedTime { get; set; }
        public string DeletedBy { get; set; }
        public DateTime? DeletedTime { get; set; }
        public bool IsDeleted { get; set; }
        [NotMapped]
        public List<RequestPriceDetail> ListProductDetail { get; set; }
        public string sExpectedDate { get; set; }
        public EDMSFile File { get; set; }
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

        public string STimeTicketCreate { get; set; }
        public string UserRequest { get; set; }
    }

    public class EDMSStatus
    {
        public string Type { get; set; }
        public string Status { get; set; }
        public string Reason { get; set; }
        public string CreatedBy { get; set; }
        public DateTime? CreatedTime { get; set; }
    }
}
