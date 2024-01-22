using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("WORKFLOW_INSTANCE")]
    public class WorkflowInstance
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public string WfInstCode { get; set; }
        public string WfInstName { get; set; }
        public string ObjectType { get; set; }
        public string ObjectInst { get; set; }
        public string Status { get; set; }
        public string WorkflowCode { get; set; }
        public string Desc { get; set; }
        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }

        [StringLength(100)]
        public string CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }

        [StringLength(50)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        [StringLength(50)]
        public string DeletedBy { get; set; }

        public DateTime? DeletedTime { get; set; }

        public bool? IsDeleted { get; set; }

        public string UserManager { get; set; }
        public bool IsLock { get; set; }
        public string MarkActCurrent { get; set; }
        public string WfGroup { get; set; }
        public string ActInstInitial { get; set; }

        [NotMapped]
        public string ObjectName { get; set; }

        [NotMapped]
        public string UserId { get; set; }

        public string DataAttr { get; set; }
        public string WfType { get; set; }
        public string WfDesc { get; set; }
        public string UserList { get; set; }
    }
}
