using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("ACTIVITY_LOG_DATA")]
    public class ActivityLogData
    {
        public ActivityLogData()
        {
            //ListLog = new List<string>();
        }
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }

        [StringLength(100)]
        public string ActCode { get; set; }

        [StringLength(100)]
        public string WorkFlowCode { get; set; }

        [StringLength(100)]
        public string ObjCode { get; set; }
        public DateTime? ActTime { get; set; }
        public decimal ActLocationGPS { get; set; }

        [StringLength(255)]
        public string ActFromDevice { get; set; }

        [StringLength(255)]
        public string ActType { get; set; }
        [StringLength(100)]
        public string CreatedBy { get; set; }
        public DateTime? CreatedTime { get; set; }

        [StringLength(100)]
        public string UpdatedBy { get; set; }

        [NotMapped]
        public List<String> ListLog { get; set; }

        //public string Log { get; set; }

        public string Log
        {
            get
            {
                return JsonConvert.SerializeObject(ListLog);
            }
            set
            {
                ListLog = string.IsNullOrEmpty(value)
                ? new List<string>()
                : JsonConvert.DeserializeObject<List<string>>(value);
            }
        }

        public DateTime? UpdatedTime { get; set; }

        [StringLength(100)]
        public string DeletedBy { get; set; }
        public DateTime? DeletedTime { get; set; }
        public bool IsDeleted { get; set; }
    }
}
