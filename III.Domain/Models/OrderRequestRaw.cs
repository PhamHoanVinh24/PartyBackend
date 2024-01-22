using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("ORDER_REQUEST_RAW")]
    public class OrderRequestRaw
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(100)]
        public string ReqCode { get; set; }

        [StringLength(255)]
        public string Title { get; set; }

        public string Content { get; set; }

        [StringLength(255)]
        public string Ip { get; set; }

        [StringLength(255)]
        public string Device { get; set; }

        public int? Priority { get; set; }

        [StringLength(255)]
        public string RequestType { get; set; }

        public DateTime? RequestTime { get; set; }

        [StringLength(50)]
        public string Status { get; set; }

        [StringLength(255)]
        public string Keyword { get; set; }

        [StringLength(50)]
        public string Phone { get; set; }

        [StringLength(50)]
        public string Email { get; set; }

        [StringLength(50)]
        public string CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }

        [StringLength(50)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }
    }
    public class CustomerRequestModel
    {
        public CustomerRequestModel()
        {
            ListDeletedFile = new List<int>();
        }
        public int? Id { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public string Phone { get; set; }
        public string Email { get; set; }
        public string Keyword { get; set; }
        public int? Priority { get; set; }
        public string Status { get; set; }
        public string RequestTime { get; set; }
        public string ReqCode { get; set; }
        public bool IsMaster { get; set; }

        public List<OrderRequestRawFiles> ListFile { get; set; }
        public List<int> ListDeletedFile { get; set; }
    }
}
