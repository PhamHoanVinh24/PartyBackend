using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("IOT_SENSOR")]
    public class IotSensor
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public string DeviceName { get; set; }
        public string StripDue { get; set; }
        public string Accuracy { get; set; }
        public string SpleepDue { get; set; }
        public string Screen { get; set; }
        public string Pin { get; set; }
        public string Size { get; set; }
        public string Mass { get; set; }
        public string Accessories { get; set; }
        public string CreatedBy { get; set; }
        public DateTime? CreatedTime { get; set; }
        public DateTime? MeasurementTime { get; set; }
        public string Location { get; set; }
    }
}
