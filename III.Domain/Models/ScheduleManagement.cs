using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("CRAWLER_JOB_SCHEDULE")]
    public class ScheduleManagement
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string  JobScCode{ get; set; }
        public string  JobScTitle{ get; set; }
        public string  JobScType{ get; set; }
        public string  JobScRunTime{ get; set; }
        public string  JobScDesc{ get; set; }
        public string Status { get; set; }
        public string BotCode { get; set; }
        public string CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }


        public string UpdatedBy { get; set; }

        public DateTime? UpdateTime { get; set; }


        public string DeletedBy { get; set; }

        public DateTime? DeletedTime { get; set; }

        public bool? IsDeleted { get; set; }

    }
}
