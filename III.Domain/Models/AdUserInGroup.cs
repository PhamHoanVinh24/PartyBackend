using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System;
using Newtonsoft.Json;

namespace ESEIM.Models
{
    [Table("AD_USER_IN_GROUP")]
    public class AdUserInGroup
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int UserInGroupId { get; set; }

        [StringLength(50)]
        public string GroupUserCode { get; set; }
        [JsonIgnore]
        public virtual AdGroupUser GroupUser { get; set; }

        [StringLength(50)]
        public string UserId { get; set; }
        [JsonIgnore]
        public virtual AspNetUser User { get; set; }

        [StringLength(50)]
        public string RoleId { get; set; }
        [JsonIgnore]
        public virtual AspNetRole Role { get; set; }

        public bool GrantAll { get; set; }
        public bool IsMain { get; set; }
        public bool IsDeleted { get; set; }

        [StringLength(2000)]
        public string BranchReference { set; get; }

        [StringLength(50)]
        public string ApplicationCode { get; set; }
        [JsonIgnore]
        public virtual AdApplication Application { get; set; }

        public string Branch { get; set; }
    }

    public class UserInGroupModel
    {
        public string GroupUserCode { get; set; }
        public List<AdUserInGroup> UserInGroups { get; set; }
    }

    public class AdUserInGroupCustom
    {
        public int Id { get; set; }
        public string GroupUserCode { get; set; }
        public string Title { get; set; }
        public string CreatedTime { get; set; }
        public bool Responsibility { get; set; }
    }
}