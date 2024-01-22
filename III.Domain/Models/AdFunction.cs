using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("AD_FUNCTION")]
    public class AdFunction
    {
        public AdFunction()
        {
            Privileges = new HashSet<AdPrivilege>();
            AppFunctions = new HashSet<AdAppFunction>();
            Permissions = new HashSet<AdPermission>();
        }
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int FunctionId { get; set; }

        [Key]
        [StringLength(50)]
        public string FunctionCode { get; set; }

        [StringLength(255)]
        public string Title { get; set; }

        [StringLength(500)]
        public string Description { get; set; }

        public int? Ord { get; set; }

        [StringLength(50)]
        public string ParentCode { get; set; }
        [JsonIgnore]
        [ForeignKey("ParentCode")]
        [InverseProperty("InverseParent")]
        public virtual AdFunction Parent { get; set; }
        [JsonIgnore]
        public virtual ICollection<AdFunction> InverseParent { get; set; }

        public DateTime? CreatedDate { get; set; }
        [StringLength(50)]
        public string CreatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        [StringLength(50)]
        public string UpdatedBy { get; set; }

        [JsonIgnore]
        public virtual ICollection<AdAppFunction> AppFunctions { get; set; }
        [JsonIgnore]
        public virtual ICollection<AdPrivilege> Privileges { get; set; }
        [JsonIgnore]
        public virtual ICollection<AdPermission> Permissions { get; set; }
    }
}