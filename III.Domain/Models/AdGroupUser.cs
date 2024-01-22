using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("AD_GROUP_USER")]
    public class AdGroupUser
    {
        public AdGroupUser()
        {
            AdUserInGroups = new HashSet<AdUserInGroup>();
            AdPermissions = new HashSet<AdPermission>();
            //VIBGroupUserPrivileges = new HashSet<VIBGroupUserPrivilege>();
            //ESGroupApps = new HashSet<ESGroupApp>();
        }

        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int GroupUserId { get; set; }

        [Key]
        [StringLength(50)]
        public string GroupUserCode { get; set; }

        [StringLength(50)]
        public string ParentCode { get; set; }
        [JsonIgnore]
        [ForeignKey("ParentCode")]
        [InverseProperty("InverseParent")]
        public virtual AdGroupUser Parent { get; set; }
        [JsonIgnore]
        public virtual ICollection<AdGroupUser> InverseParent { get; set; }

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

        [JsonIgnore]
        public virtual ICollection<AdUserInGroup> AdUserInGroups { get; set; }
        [JsonIgnore]
        public virtual ICollection<AdPermission> AdPermissions { get; set; }
        public int? Priority { get; set; }
        //public virtual ICollection<VIBGroupUserPrivilege> VIBGroupUserPrivileges { get; set; }
        //public virtual ICollection<ESGroupApp> ESGroupApps { get; set; }
    }
}