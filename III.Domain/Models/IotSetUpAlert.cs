using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("IOT_SET_UP_ALERT")]
    public class IotSetUpAlert
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public DateTime? FromDate { get; set; }

        public DateTime? ToDate { get; set; }

        public string Device { get; set; }

        public string Unit { get; set; }

        public string CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }

    }
}
