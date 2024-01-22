using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("VC_FCM_MESSAGE")]
    public class VcFcmMessage
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(maximumLength: 50)]
        public string UserName { get; set; }

        [StringLength(maximumLength: 500)]

        public string Title { get; set; }

        [StringLength(maximumLength: 1000)]
        public string Message { get; set; }

        public int Type { get; set; }

        public DateTime? CreatedTime { get; set; }
    }
}