using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    public partial class ESGroupResource
    {
        public ESGroupResource()
        {
            ESAppResources = new HashSet<ESAppGResource>();
            ESResources = new HashSet<ESResource>();
        }

        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Seq { get; set; }
        public string Id { get; set; }
        public string Title { get; set; }

        public virtual ICollection<ESAppGResource> ESAppResources { get; set; }
        public virtual ICollection<ESResource> ESResources { get; set; }
    }
}
