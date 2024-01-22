using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("DEVICE_MEETING_CONTROL")]
    public class DeviceMeetingControl
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string IdMeeting { get; set; }
        public string PasswordMeeting { get; set; }
        public string DisplayName { get; set; }
        public string Device { get; set; }
        public string DeviceType { get; set; }
        public bool? Online { get; set; }
        public DateTime? JoinTime { get; set; }
        public DateTime? LeaveTime { get; set; }
        public string SdkKey { get; set; }
        public string SdkSecret { get; set; }
        public string Host { get; set; }
    }
}
