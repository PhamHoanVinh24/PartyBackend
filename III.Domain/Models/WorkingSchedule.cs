using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("WORKING_SCHEDULE")]
    public class WorkingSchedule
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }

        public string Content { get; set; }
        public string Type { get; set; }

        public string WorkContent { get; set; }
        public string ListUserApproved { get; set; }
        public string JsonStatus { get; set; }
        public string Location { get; set; }
        public string BackgroundColor { get; set; }
        public string BackgroundImage { get; set; }
        public string JsonRef { get; set; }

        public DateTime CreatedTime { get; set; }

        [StringLength(50)]
        public string CreatedBy { get; set; }
        [NotMapped]
        public string ListUser { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        [StringLength(100)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        [StringLength(100)]
        public string DeletedBy { get; set; }

        public DateTime? DeletedTime { get; set; }

        public bool IsDeleted { get; set; }
        public string Status { get; set; }

    }
    public class ModelWorkingSchedule
    {
        public int ID { get; set; }
        public string ListUser { get; set; }
        public string StartDate { get; set; }
        public DateTime StartDateTime { get; set; }
        public string EndDate { get; set; }
        public string Location { get; set; }
        public string Content { get; set; }
        public string WorkContent { get; set; }
        public string ListUserApproved { get; set; }
        public string BackgroundColor { get; set; }
        public string BackgroundImage { get; set; }
        public string JsonStatus { get; set; }
        public string JsonRef { get; set; }
        public string Type { get; set; }
        public string CreatedBy { get; set; }
        public string UpdatedBy { get; set; }
        public string Status { get; set; }
        public bool OnlyContent { get; set; }
    }
}
