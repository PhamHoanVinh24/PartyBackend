using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("AdGroupResource")]
    public class AdGroupResource
    {
        public AdGroupResource()
        {
            Resources = new HashSet<AdResource>();
            AppGroupResources = new HashSet<AdAppGroupResource>();
        }

        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(20)]
        public string Code { get; set; }

        [StringLength(50)]
        public string Title { get; set; }

        public virtual ICollection<AdResource> Resources { get; set; }
        public virtual ICollection<AdAppGroupResource> AppGroupResources { get; set; }
    }
}