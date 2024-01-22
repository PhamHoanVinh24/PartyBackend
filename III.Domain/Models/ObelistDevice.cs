using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{ 
    [Table("OBE_LIST_DEVICE")]
    public class ObeListDevice

    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public string DeviceId { get; set; }

        public string DeviceTitle { get; set; }
        public string Vendor { get; set; }
        public string PositionDevice { get; set; }
        public string Account { get; set; }
        public string Describe { get; set; }
        public string DeviceType { get; set; }
        public int Status { get; set; }
    }
}
