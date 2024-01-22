using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("COMPANY_SCHEDULE_WORK")]
    public class CompanyScheduleWork
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        [StringLength(50)]
        public string UserName { get; set; }
        public TimeSpan? FromMorning { get; set; }
        public TimeSpan? ToMorning { get; set; }
        public TimeSpan? FromAfternoon { get; set; }
        public TimeSpan? ToAfternoon { get; set; }
        public TimeSpan? FromEvening { get; set; }
        public TimeSpan? ToEvening { get; set; }
        [StringLength(50)]
        public string CreatedBy { get; set; }
        public DateTime CreatedTime { get; set; }
        [StringLength(50)]
        public string UpdatedBy { get; set; }
        public DateTime? UpdatedTime { get; set; }
        [StringLength(50)]
        public string DeletedBy { get; set; }
        public DateTime? DeletedTime { get; set; }
        public bool IsDeleted { get; set; }
    }
}
