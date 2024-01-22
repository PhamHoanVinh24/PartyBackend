using System;
using System.Collections.Generic;

namespace ESEIM.Models
{
    public partial class ESApplication
    {
        public ESApplication()
        {
            ESAppResources = new HashSet<ESAppGResource>();
            ESEndpointApps = new HashSet<ESEndpointApp>();
            ESOrgApps = new HashSet<ESOrgApp>();
            ESRoleApps = new HashSet<ESRoleApp>();
            ESUserApps = new HashSet<ESUserApp>();
            ESGroupApps = new HashSet<ESGroupApp>();
        }

        public int Id { get; set; }
        public string Title { get; set; }
        public string Code { get; set; }
        public int Status { get; set; }
        public string Description { get; set; }
        public int? Ord { get; set; }
        public string ClientId { get; set; }
        public string ClientSecret { get; set; }
        public string Authority { get; set; }
        public string Scope { get; set; }
        public string ResponseType { get; set; }
        public string AuthenticationScheme { get; set; }
        public bool? RequireHttps { get; set; }
        public string NameClaimType { get; set; }
        public string RoleClaimType { get; set; }

        public virtual ICollection<ESAppGResource> ESAppResources { get; set; }
        public virtual ICollection<ESEndpointApp> ESEndpointApps { get; set; }
        public virtual ICollection<ESOrgApp> ESOrgApps { get; set; }
        public virtual ICollection<ESRoleApp> ESRoleApps { get; set; }
        public virtual ICollection<ESUserApp> ESUserApps { get; set; }
        public virtual ICollection<ESGroupApp> ESGroupApps { get; set; }
    }
}
