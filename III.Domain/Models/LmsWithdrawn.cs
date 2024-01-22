using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{

    [Table("LMS_WITHDRAWN")]
    public class LmsWithdrawn 
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string WithdrawCode { get; set; }
        public decimal Amount { get; set; }

        [StringLength(255)]
        public string Currency { get; set; }

        [StringLength(255)]
        public string Noted { get; set; }

        [StringLength(50)]
        public string UserRequest { get; set; }
        
        public DateTime? RequestTime { get; set; }

        [StringLength(50)]
        public string FromIp { get; set; }

        [StringLength(50)]
        public string FromDevice { get; set; }
        public string TransactionLog { get; set; }

        [StringLength(255)]
        public string Status { get; set; }

        [StringLength(50)]
        public string UserPay { get; set; }

        [StringLength(50)]
        public string CreateBy { get; set; }

        public DateTime? CreateTime { get; set; }

        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        public string DeletedBy { get; set; }

        public DateTime? DeletedTime { get; set; }

        public bool IsDeleted { get; set; }
    }
}
