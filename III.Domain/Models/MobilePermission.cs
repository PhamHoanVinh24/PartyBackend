using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("MOBILE_PERMISSION")]
    public class MobilePermission
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int PermissionId { get; set; }

        [StringLength(50)]
        public string ApplicationCode { get; set; }
        [JsonIgnore]
        public virtual AdApplication Application { get; set; }

        [StringLength(50)]
        public string FunctionCode { get; set; }
        [JsonIgnore]
        public virtual MobileFunction Function { get; set; }

        [StringLength(100)]
        public string ResourceCode { get; set; }
        [JsonIgnore]
        public virtual MobileResource Resource { get; set; }

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

        public DateTime? ExpiredDate { get; set; }

        public string Json { get; set; }
    }

}