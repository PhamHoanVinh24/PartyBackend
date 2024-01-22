using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("WORKFLOW_ACTIVITY")]
    public class WorkflowActivity
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }
        [StringLength(100)]
        public string WorkFlowCode { get; set; }
        [StringLength(100)]
        public string ActCode { get; set; }

        [StringLength(100)]
        public string UnitTime { get; set; }

        [StringLength(100)]
        public string LimitTime { get; set; }

        [StringLength(100)]
        public string Priority { get; set; }
        [StringLength(1000)]
        public string Note { get; set; }
        [StringLength(100)]
        public string CreatedBy { get; set; }
        public DateTime? CreatedTime { get; set; }
        [StringLength(100)]
        public string UpdatedBy { get; set; }
        public DateTime? UpdatedTime { get; set; }
        [StringLength(100)]
        public string DeletedBy { get; set; }
        public DateTime? DeletedTime { get; set; }
        public bool IsDeleted { get; set; }

        [StringLength(255)]
        public string Branch { get; set; }

        [StringLength(255)]
        public string Department { get; set; }
    }



}
