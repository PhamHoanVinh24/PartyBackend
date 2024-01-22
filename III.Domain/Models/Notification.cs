using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("NOTIFICATION")]
    public class Notification 
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int NotifyID { get; set; }

        public string NotifyCode { get; set; }

        [StringLength(100)]
        public string Title { get; set; }

        [StringLength(255)]
        public string Content { get; set; }

        public DateTime? DateEvent { get; set; }

        public DateTime? DateWarning { get; set; }

        public string IsWarning { get; set; }

        public string Status { get; set; }

        public string LstContractCode { get; set; }

        [StringLength(100)]
        public string Receiver { get; set; }

        [StringLength(255)]
        public string ReceiverConfirm { get; set; }

        public DateTime? ConfirmTime { get; set; }

        [StringLength(50)]
        public string CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }

        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        public string DeletedBy { get; set; }

        public DateTime? DeletedTime { get; set; }

        public bool IsDeleted { get; set; }
    }
}
