using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("COMMAND_TRACKING")]
    public class CommandTracking
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }

        [StringLength(255)]
        public string ComCode { get; set; }
        [StringLength(255)]
        public string LicensePlate { get; set; }
        public string State { get; set; }
        public string Speed { get; set; }
        //LICENSE_PLATE

        [NotMapped]
        public List<GisDataTracking> ListGPS { get; set; }

        //public string Log { get; set; }

        public string GpsData
        {
            get
            {
                return JsonConvert.SerializeObject(ListGPS);
            }
            set
            {
                ListGPS = string.IsNullOrEmpty(value)
                ? new List<GisDataTracking>()
                : JsonConvert.DeserializeObject<List<GisDataTracking>>(value);
            }
        }

        [StringLength(50)]
        public string CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }

        [StringLength(50)]
        public string UpdatedBy { get; set; }

        public DateTime UpdatedTime { get; set; }

        [StringLength(50)]
        public string DeletedBy { get; set; }

        public DateTime? DeletedTime { get; set; }

        public bool IsDeleted { get; set; }
    }
    public class GisDataTracking
    {
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string State { get; set; }
    }
}
