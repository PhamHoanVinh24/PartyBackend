using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("EXCUTER_CONTROL_ROLE")]
    public class ExcuterControlRole
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }

        public string UserId { get; set; }

        public string Role { get; set; }

        public string DepartmentCode { get; set; }

        public string GroupCode { get; set; }

        public string ActivityCode { get; set; }

        [StringLength(100)]
        public string CreatedBy { get; set; }

        public DateTime CreatedTime { get; set; }

        [StringLength(100)]
        public string DeletedBy { get; set; }

        public DateTime? DeletedTime { get; set; }

        public bool IsDeleted { get; set; }

        public bool? Approve { get; set; }

        public DateTime? ApproveTime { get; set; }

        public string Branch { get; set; }
        public string Status { get; set; }

    }
}
