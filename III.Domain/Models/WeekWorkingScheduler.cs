using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("WEEK_WORKING_SCHEDULER")]
    public class WeekWorkingScheduler
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public string Content { get; set; }

        public string Chair { get; set; }

        public string Room { get; set; }

        public string Composition { get; set; }

        public string TimeStart { get; set; }

        public string TimeEnd { get; set; }

        public DateTime CreatedTime { get; set; }

        [StringLength(50)]
        public string CreatedBy { get; set; }
    }
}
