using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("CANDIDATE_BASIC")]
    public class CandidateBasic
    { 
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string CandidateCode { get; set; }

        [StringLength(255)]
        public string Fullname { get; set; }
        
        public int Sex { get; set; }

        public DateTime? Birthday { get; set; }

        [StringLength(255)]
        public string Address { get; set; }

        [StringLength(50)]
        public string Phone { get; set; }

        [StringLength(100)]
        public string Email { get; set; }

        public bool Married { get; set; }

        [StringLength(255)]
        public string Skype { get; set; }

        [StringLength(255)]
        public string FileCv_1 { get; set; }

        [StringLength(255)]
        public string FileCv_2 { get; set; }

        [StringLength(255)]
        public string FileCv_3 { get; set; }

        [StringLength(255)]
        public string MainSkill { get; set; }

        [StringLength(255)]
        public string MainPracticeTime { get; set; }

        [StringLength(255)]
        public string SubSkill { get; set; }

        [StringLength(255)]
        public string SubPracticeTime { get; set; }

        [StringLength(255)]
        public string LanguageUse { get; set; }

        [StringLength(255)]
        public string Ability { get; set; }

        public decimal? SalaryHope { get; set; }

        [StringLength(50)]
        public string Currency { get; set; }

        [StringLength(255)]
        public string LaptopInfo { get; set; }

        [StringLength(255)]
        public string SmartphoneInfo { get; set; }

        public DateTime? DateQuit { get; set; }

        [StringLength(500)]
        public string Targeting { get; set; }

        public DateTime? CanJoinDate { get; set; }

        [StringLength(255)]
        public string WorkPlace { get; set; }

        public DateTime? WorkFrom { get; set; }

        public DateTime? WorkTo { get; set; }

        public int? WorkType { get; set; }
        public DateTime? AppointmentTime { get; set; }

        [StringLength(50)]
        public string CreatedBy { get; set; }

        public DateTime CreatedTime { get; set; }

        [StringLength(50)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }
    }
}
