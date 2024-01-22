using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("MOBILE_RESOURCE")]
    public class MobileResource
    {
        public MobileResource()
        {
            Privileges = new HashSet<MobilePrivilege>();
            Permissions = new HashSet<MobilePermission>();
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
        public virtual MobileResource Parent { get; set; }
        [JsonIgnore]
        public virtual ICollection<MobileResource> InverseParent { get; set; }

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
        public string Json { get; set; }

        [JsonIgnore]
        public virtual ICollection<MobilePrivilege> Privileges { get; set; }
        [JsonIgnore]
        public virtual ICollection<MobilePermission> Permissions { get; set; }
        //public virtual ICollection<ESResAttribute> ESResAttributes { get; set; }
        //public virtual ICollection<ESResource> InverseParent { get; set; }
    }

    public class MobileResourcePermission
    {
        public MobileResourcePermission()
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
        public virtual MobileResource Parent { get; set; }

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