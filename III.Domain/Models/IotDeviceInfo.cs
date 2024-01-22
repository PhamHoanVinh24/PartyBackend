using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("IOT_DEVICE_INFO")]
    public class IotDeviceInfo
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }

        public string DeviceCode { get; set; }

        public string DeviceName { get; set; }

        public string DeviceGroup { get; set; }

        public string DeviceType { get; set; }

        public string DeviceManufacturer { get; set; }

        public string DeviceStatus { get; set; }

        public string DeviceDesc { get; set; }

        public string DeviceImage { get; set; }

        public string DeviceSvg { get; set; }

        [StringLength(100)]
        public string CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }

        [StringLength(100)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        [StringLength(100)]
        public string DeletedBy { get; set; }

        public DateTime? DeletedTime { get; set; }

        public bool IsDeleted { get; set; }
    }
}
