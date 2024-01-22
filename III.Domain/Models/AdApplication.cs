using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("AD_APPLICATION")]
    public class AdApplication
    {
        public AdApplication()
        {
            AppFunctions = new HashSet<AdAppFunction>();
            Permissions = new HashSet<AdPermission>();
            UserInGroups = new HashSet<AdUserInGroup>();
            //AppGroupResources = new HashSet<AdAppGroupResource>();
            //ESEndpointApps = new HashSet<ESEndpointApp>();
            //ESOrgApps = new HashSet<ESOrgApp>();
            //ESRoleApps = new HashSet<ESRoleApp>();
            //ESUserApps = new HashSet<ESUserApp>();
            //ESGroupApps = new HashSet<ESGroupApp>();
        }


        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ApplicationId { get; set; }

        [Key]
        [StringLength(50)]
        public string ApplicationCode { get; set; }

        [StringLength(255)]
        public string Title { get; set; }

        public int Status { get; set; }

        [StringLength(500)]
        public string Description { get; set; }

        [StringLength(300)]
        public string Icon { get; set; }

        [StringLength(300)]
        public string AppUrl { get; set; }

        public int? Ord { get; set; }

        [StringLength(255)]
        public string ClientId { get; set; }

        [StringLength(255)]
        public string ClientSecret { get; set; }

        [StringLength(255)]
        public string Authority { get; set; }

        [StringLength(255)]
        public string Scope { get; set; }

        [StringLength(255)]
        public string ResponseType { get; set; }

        [StringLength(255)]
        public string AuthenticationScheme { get; set; }

        public bool? RequireHttps { get; set; }

        [StringLength(255)]
        public string NameClaimType { get; set; }

        [StringLength(255)]
        public string RoleClaimType { get; set; }

        public DateTime? CreatedDate { get; set; }
        [StringLength(50)]
        public string CreatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        [StringLength(50)]
        public string UpdatedBy { get; set; }

        [JsonIgnore]
        public virtual ICollection<AdAppFunction> AppFunctions { get; set; }
        [JsonIgnore]
        public virtual ICollection<AdPermission> Permissions { get; set; }
        [JsonIgnore]
        public virtual ICollection<AdUserInGroup> UserInGroups { get; set; }
    }
}