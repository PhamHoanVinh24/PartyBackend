using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("CANDIDATE_WORK_EVENT")]
    public class CandidateWorkEvent
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string CandidateCode { get; set; }

        [StringLength(255)]
        public string EventTitle { get; set; }

        public DateTime DatetimeEvent { get; set; }

        [StringLength(255)]
        public string FrameTime { get; set; }

        [StringLength(255)]
        public string FormatSetting { get; set; }

        [StringLength(50)]
        public string CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }

        [StringLength(50)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        public bool FlagDelete { get; set; }
    }
}
