using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("VIBApplication")]
    public class VIBApplication
    {
        public VIBApplication()
        {
            AppGroupResources = new HashSet<VIBAppGroupResource>();
            AppFunctions = new HashSet<VIBAppFunction>();
            Permissions = new HashSet<VIBPermission>();
            //ESEndpointApps = new HashSet<ESEndpointApp>();
            //ESOrgApps = new HashSet<ESOrgApp>();
            //ESRoleApps = new HashSet<ESRoleApp>();
            //ESUserApps = new HashSet<ESUserApp>();
            //ESGroupApps = new HashSet<ESGroupApp>();
        }

        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(20)]
        public string Code { get; set; }

        [StringLength(50)]
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

        public virtual ICollection<VIBAppGroupResource> AppGroupResources { get; set; }
        public virtual ICollection<VIBAppFunction> AppFunctions { get; set; }
        public virtual ICollection<VIBPermission> Permissions { get; set; }
        //public virtual ICollection<ESEndpointApp> ESEndpointApps { get; set; }
        //public virtual ICollection<ESOrgApp> ESOrgApps { get; set; }
        //public virtual ICollection<ESRoleApp> ESRoleApps { get; set; }
        //public virtual ICollection<ESUserApp> ESUserApps { get; set; }
        //public virtual ICollection<ESGroupApp> ESGroupApps { get; set; }
    }
}