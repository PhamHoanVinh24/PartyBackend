using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("AD_RESOURCE")]
    public class AdResource
    {
        public AdResource()
        {
            Privileges = new HashSet<AdPrivilege>();
            Permissions = new HashSet<AdPermission>();
            //ESResAttributes = new HashSet<ESResAttribute>();
        }

        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ResourceId { get; set; }

        [Key]
        [StringLength(100)]
        public string ResourceCode { get; set; }

        [StringLength(255)]
        public string Title { get; set; }

        [StringLength(2000)]
        public string Description { get; set; }

        [StringLength(255)]
        public string Path { get; set; }

        [StringLength(255)]
        public string Api { get; set; }

        [StringLength(10)]
        public string Style { get; set; }

        public bool Scope { get; set; }

        [StringLength(50)]
        public string ParentCode { get; set; }
        [JsonIgnore]
        [ForeignKey("ParentCode")]
        [InverseProperty("InverseParent")]
        public virtual AdResource Parent { get; set; }
        [JsonIgnore]
        public virtual ICollection<AdResource> InverseParent { get; set; }

        //public int? GroupResourceId { get; set; }
        //public virtual AdGroupResource GroupResource { get; set; }

        public int? Ord { get; set; }
        public bool Status { get; set; }

        public DateTime? CreatedDate { get; set; }
        [StringLength(50)]
        public string CreatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        [StringLength(50)]
        public string UpdatedBy { get; set; }

        [JsonIgnore]
        public virtual ICollection<AdPrivilege> Privileges { get; set; }
        [JsonIgnore]
        public virtual ICollection<AdPermission> Permissions { get; set; }
        //public virtual ICollection<ESResAttribute> ESResAttributes { get; set; }
        //public virtual ICollection<ESResource> InverseParent { get; set; }
    }

    public class AdResourcePermission
    {
        public AdResourcePermission()
        {
        }


        public int Id { get; set; }

        [StringLength(100)]
        public string Code { get; set; }

        [StringLength(255)]
        public string Title { get; set; }

        [StringLength(2000)]
        public string Description { get; set; }

        [StringLength(255)]
        public string Path { get; set; }

        [StringLength(255)]
        public string Api { get; set; }

        public string ParentCode { get; set; }
        public int? ParentId { get; set; }
        public virtual AdResource Parent { get; set; }

        public int? Ord { get; set; }

        [StringLength(10)]
        public string Style { get; set; }

        public bool Scope { get; set; }
        public DateTime? ExpiredDate { get; set; }

        public bool HasPermission { get; set; }
        public bool IsFunction { get; set; }
        public string FunctionCode { get; set; }
        public string FunctionName { get; set; }
        public string Json { get; set; }
    }
}