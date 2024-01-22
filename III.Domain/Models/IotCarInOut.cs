using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("IOT_CAR_IN_OUT")]
    public class IotCarInOut
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(100)]
        public string LicensePlate { get; set; }

        public DateTime? DateTime { get; set; }

        [StringLength(50)]
        public string Active { get; set; }

        [StringLength(50)]
        public string Driver { get; set; }

        public string Img1 { get; set; }

        public string Img2 { get; set; }

        public string Img3 { get; set; }

    }
}
