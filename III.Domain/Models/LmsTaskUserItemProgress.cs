using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("LMS_TASK_USER_ITEM_PROGRESS")]
    public class LmsTaskUserItemProgress
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public string ItemCode { get; set; }

        [StringLength(255)]
        public string TrainingType { get; set; }

        public string ItemTitle { get; set; }

        [StringLength(255)]
        public string LmsTaskCode { get; set; }

        [StringLength(255)]
        public string User { get; set; }
        public decimal? ProgressAuto { get; set; }

        public decimal? TeacherApproved { get; set; }

        public DateTime CreatedDate { get; set; }

        [StringLength(255)]
        public string CreatedBy { get; set; }

        public bool IsDeleted { get; set; }

        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }
    }
}
