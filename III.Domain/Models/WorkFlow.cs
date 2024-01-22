using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("WORK_FLOW")]
    public class WorkFlow
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string WfCode { get; set; }

        [StringLength(255)]
        public string WfName { get; set; }

        [StringLength(1000)]
        public string WfNote { get; set; }

        public string WfGroup { get; set; }

        public string WfType { get; set; }

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

        public bool IsPublic { get; set; }

        public string PublicBy { get; set; }

        public DateTime? PublicTime { get; set; }

        public string ObjectType { get; set; }
        public string UserList { get; set; }
    }
}
