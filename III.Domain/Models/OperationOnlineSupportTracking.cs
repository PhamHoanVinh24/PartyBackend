using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("OPERATION_ONLINE_SUPPORT_TRACKING")]
    public class OperationOnlineSupportTracking
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]

        public int Id { get; set; }
        [StringLength(maximumLength: 255)]
        public string SvrSession { get; set; }
        public string SvrLocation { get; set; }
        public string Caller { get; set; }

        public string Receiver { get; set; }

        public DateTime StartedTime { get; set; }
        public DateTime? EndedTime { get; set; }
    }
}