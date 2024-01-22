using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("WORKFLOW_ACTIVITY_ROLE")]
    public class WorkflowActivityRole
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }

        [StringLength(100)]
        public string WorkFlowCode { get; set; }

        [StringLength(100)]
        public string ActCode { get; set; }

        [StringLength(100)]
        public string BranchCode { get; set; }

        [StringLength(100)]
        public string DepartCode { get; set; }

        [StringLength(100)]
        public string Role { get; set; }
        public string WorkFlowProperty { get; set; }


        [StringLength(255)]
        public string CreatedBy { get; set; }
        public DateTime? CreatedTime { get; set; }

        [StringLength(255)]
        public string UpdatedBy { get; set; }
        public DateTime? UpdatedTime { get; set; }

        [StringLength(255)]
        public string DeletedBy { get; set; }
        public DateTime? DeletedTime { get; set; }
        public bool IsDeleted { get; set; }
    }
}
