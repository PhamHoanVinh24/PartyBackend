using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    public partial class ESAction
    {
        public ESAction()
        {
            ESPrivileges = new HashSet<ESPrivilege>();
        }

        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Seq { get; set; }
        public string Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public int? Ord { get; set; }        

        public virtual ICollection<ESPrivilege> ESPrivileges { get; set; }
    }
}
