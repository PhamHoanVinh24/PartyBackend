using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("VIBGroupResource")]
    public class VIBGroupResource
    {
        public VIBGroupResource()
        {
            Resources = new HashSet<VIBResource>();
            AppGroupResources = new HashSet<VIBAppGroupResource>();
        }

        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(20)]
        public string Code { get; set; }

        [StringLength(50)]
        public string Title { get; set; }

        public virtual ICollection<VIBResource> Resources { get; set; }
        public virtual ICollection<VIBAppGroupResource> AppGroupResources { get; set; }
    }
}