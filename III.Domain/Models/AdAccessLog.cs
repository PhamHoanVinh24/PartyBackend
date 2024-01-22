using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("E_AccessLog")]
    public class AdAccessLog
    {
        public AdAccessLog()
        {
        }
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int AccessLogId { get; set; }

        [StringLength(255)]
        public string AccessLogCode { get; set; }

        [StringLength(50)]
        public string Action { get; set; }

        [StringLength(250)]
        public string UserId { get; set; }

        [StringLength(255)]
        public string AccessLogApplication { get; set; }

        [StringLength(450)]
        public string Description { get; set; }

        [StringLength(50)]
        public string IpAddress { get; set; }

        public DateTime? AccessDate { get; set; }
    }
}