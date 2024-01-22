using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("PLAN_RECRUITMENT_DETAIL")]
    public class PlanRecruitmentDetail
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string PlanNumber { get; set; }
        public string Position { get; set; }
        public string Age { get; set; }
        public string Gender { get; set; }
        public string Level { get; set; }
        public string Specialize { get; set; }
        public int? YearOfExperience { get; set; }
        public string Tier { get; set; }
        public string Local { get; set; }
        public int? Quantity { get; set; }

        [StringLength(100)]
        public string CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }

        [StringLength(50)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        [StringLength(50)]
        public string DeletedBy { get; set; }

        public DateTime? DeletedTime { get; set; }

        public bool IsDeleted { get; set; }
    }
}
