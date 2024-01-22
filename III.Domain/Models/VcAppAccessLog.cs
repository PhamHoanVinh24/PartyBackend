using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("VC_APP_ACCESS_LOG")]
    public class VcAppAccessLog
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(maximumLength: 255)]
        public string UserName { get; set; }

        [StringLength(maximumLength: 255)]
        public string Password { get; set; }

        public DateTime? CreatedTime { get; set; }
        public string Token { get; set; }

        [StringLength(maximumLength: 50)]
        public string Status { get; set; }

        public string Imei { get; set; }
    }
}