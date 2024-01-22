using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("PLAN_RECRUITMENT_HEADER")]
    public class PlanRecruitmentHeader
    {
        public PlanRecruitmentHeader()
        {
            ListStatus = new List<JsonStatus>();
        }

        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public string PlanNumber { get; set; }
        public string Title { get; set; }
        public string PlanType { get; set; }
        public string Note { get; set; }
        public string DepartmentCode { get; set; }
        public string UserCreated { get; set; }
        public DateTime? PlanDate { get; set; }
        [NotMapped]
        public string sPlanDate { get; set; }
        public string WorkflowCat { get; set; }
        public string Status { get; set; }

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

        [NotMapped]
        public List<JsonStatus> ListStatus { get; set; }

        public string StatusLog
        {
            get
            {
                return JsonConvert.SerializeObject(ListStatus);
            }
            set
            {
                ListStatus = string.IsNullOrEmpty(value)
                ? new List<JsonStatus>()
                : JsonConvert.DeserializeObject<List<JsonStatus>>(value);
            }
        }

        public string JsonData { get; set; }

        [NotMapped]
        public string ActRepeat { get; set; }
    }
}
