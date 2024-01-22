using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("AD_DEPARTMENT")]
    public class AdDepartment
    {
        //public AdDepartment()
        //{
        //    AdUserInGroups = new HashSet<AdUserInGroup>();
        //    AdPermissions = new HashSet<AdPermission>();
        //}

        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int DepartmentId { get; set; }

        [Key]
        [StringLength(50)]
        public string DepartmentCode { get; set; }

        [StringLength(50)]
        public string ParentCode { get; set; }
        [JsonIgnore]
        [ForeignKey("ParentCode")]
        //[InverseProperty("InverseParent")]
        public virtual AdDepartment Parent { get; set; }
        //[JsonIgnore]
        //public virtual ICollection<AdDepartment> InverseParent { get; set; }

        [StringLength(255)]
        public string Title { get; set; }

        [StringLength(500)]
        public string Description { get; set; }

        public DateTime? CreatedDate { get; set; }
        [StringLength(50)]
        public string CreatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        [StringLength(50)]
        public string UpdatedBy { get; set; }

        public bool IsEnabled { get; set; }
        public bool IsDeleted { get; set; }
        public string DeletedBy { get; set; }
        public DateTime? DeletedTime { get; set; }

        //[JsonIgnore]
        //public virtual ICollection<AdUserInGroup> AdUserInGroups { get; set; }
        //[JsonIgnore]
        //public virtual ICollection<AdPermission> AdPermissions { get; set; }
    }
}