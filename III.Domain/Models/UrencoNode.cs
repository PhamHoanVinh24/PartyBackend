using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("URENCO_NODE")]
    public class UrencoNode
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string NodeCode { get; set; }
        public string NodeName { get; set; }
        public string Note { get; set; }
        public string GpsNode { get; set; }
        public string Address { get; set; }
        public int? VolumeLimit { get; set; }
        public string QrCode { get; set; }
        public int Manager { get; set; }
        public int? Volume { get; set; }
        public string Unit { get; set; }
        public string Image { get; set; }
        public string Route { get; set; }
        public string Status { get; set; }
    }
}
