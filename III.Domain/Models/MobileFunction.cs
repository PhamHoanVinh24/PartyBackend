using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("MOBILE_FUNCTION")]
    public class MobileFunction
    {
        public MobileFunction()
        {
            Privileges = new HashSet<MobilePrivilege>();
            AppFunctions = new HashSet<MobileAppFunction>();
            Permissions = new HashSet<MobilePermission>();
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
        public virtual MobileFunction Parent { get; set; }
        [JsonIgnore]
        public virtual ICollection<MobileFunction> InverseParent { get; set; }

        public DateTime? CreatedDate { get; set; }
        [StringLength(50)]
        public string CreatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        [StringLength(50)]
        public string UpdatedBy { get; set; }

        [JsonIgnore]
        public virtual ICollection<MobileAppFunction> AppFunctions { get; set; }
        [JsonIgnore]
        public virtual ICollection<MobilePrivilege> Privileges { get; set; }
        [JsonIgnore]
        public virtual ICollection<MobilePermission> Permissions { get; set; }
    }
}