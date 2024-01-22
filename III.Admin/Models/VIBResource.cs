using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("VIBResource")]
    public class VIBResource
    {
        public VIBResource()
        {
            Privileges = new HashSet<VIBPrivilege>();
            Permissions = new HashSet<VIBPermission>();
            //ESResAttributes = new HashSet<ESResAttribute>();
        }

        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(20)]
        public string Code { get; set; }

        [StringLength(50)]
        public string Title { get; set; }

        [StringLength(2000)]
        public string Description { get; set; }

        [StringLength(255)]
        public string Path { get; set; }

        [StringLength(255)]
        public string Api { get; set; }

        public int? ParentId { get; set; }
        public virtual VIBResource Parent { get; set; }

        public int GroupResourceId { get; set; }
        public virtual VIBGroupResource GroupResource { get; set; }

        public int? Ord { get; set; }

        public DateTime? CreatedDate { get; set; }
        [StringLength(50)]
        public string CreatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        [StringLength(50)]
        public string UpdatedBy { get; set; }

        public virtual ICollection<VIBPrivilege> Privileges { get; set; }
        public virtual ICollection<VIBPermission> Permissions { get; set; }
        //public virtual ICollection<ESResAttribute> ESResAttributes { get; set; }
        //public virtual ICollection<ESResource> InverseParent { get; set; }
    }
}