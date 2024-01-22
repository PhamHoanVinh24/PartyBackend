using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("VC_WORK_CHECK")]
    public class VcWorkCheck
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public DateTime? CheckinTime { get; set; }

        public bool? Checkin { get; set; }

        public bool? Checkout { get; set; }

        public DateTime? CheckoutTime { get; set; }

        [StringLength(50)]
        public string CareCode { get; set; }

        [StringLength(50)]
        public string CreatedBy { get; set; }

        [StringLength(255)]
        public string Review { get; set; }

        [StringLength(255)]
        public string Idea { get; set; }

        [StringLength(255)]
        public string Address { get; set; }

        public string Checkin_gps { get; set; }
        public string Checkout_gps { get; set; }
        [StringLength(50)]
        public string UserName { get; set; }

        [StringLength(255)]
        public string Imei { get; set; }

        [StringLength(255)]
        public string ImagePath { get; set; }
        public int Count { get; set; }
        public bool? CheckoutOutDistance { get; set; }
    }
}