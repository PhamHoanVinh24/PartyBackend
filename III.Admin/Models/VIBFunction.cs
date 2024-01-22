using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("VIBFunction")]
    public class VIBFunction
    {
        public VIBFunction()
        {
            Privileges = new HashSet<VIBPrivilege>();
            AppFunctions = new HashSet<VIBAppFunction>();
            Permissions = new HashSet<VIBPermission>();
        }

        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(20)]
        public string Code { get; set; }

        [StringLength(50)]
        public string Title { get; set; }

        [StringLength(500)]
        public string Description { get; set; }

        public int? Ord { get; set; }

        public int? ParentId { get; set; }
        public virtual VIBFunction Parent { get; set; }

        public DateTime? CreatedDate { get; set; }
        [StringLength(50)]
        public string CreatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        [StringLength(50)]
        public string UpdatedBy { get; set; }

        public virtual ICollection<VIBPrivilege> Privileges { get; set; }
        public virtual ICollection<VIBAppFunction> AppFunctions { get; set; }
        public virtual ICollection<VIBPermission> Permissions { get; set; }
    }
}