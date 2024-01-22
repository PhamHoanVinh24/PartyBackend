using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("SHIFT_LOG_CAMERA")]
    public class ShiftLogCamera
    {
        public int Id { get; set; }
        public string ShiftCode { get; set; }
        public DateTime? ChkinTime { get; set; }
        public string ChkinLocationTxt { get; set; }
        public string ChkinLocationGps { get; set; }
        public string ChkinPicRealtime { get; set; }
        public bool IsChkinRealTime { get; set; }
        public DateTime? ChkoutTime { get; set; }
        public string ChkoutLocationTxt { get; set; }
        public string ChkoutLocationGps { get; set; }
        public string ChkoutPicRealtime { get; set; }
        public bool IsChkoutRealTime { get; set; }
        public string Note { get; set; }
        public string CreatedBy { get; set; }
        public DateTime? CreatedTime { get; set; }
        public string UpdatedBy { get; set; }
        public DateTime? UpdatedTime { get; set; }
        public string Flag { get; set; }
        public string FromDevice { get; set; }
        public string Ip { get; set; }
        public string Imei { get; set; }
        public string WorkingShiftCode { get; set; }

    }
}
