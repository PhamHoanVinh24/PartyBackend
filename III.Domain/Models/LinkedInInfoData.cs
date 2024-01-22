using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace III.Domain.Models
{
    [Table("LINKED_IN_INFO_DATA")]
    public class LinkedInInfoData
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public string  ProfileUrl{ get; set; }

        public string  Name{ get; set; }

        public string  Contact{ get; set; }
        public string Location { get; set; }

        public string CurrentJob { get; set; }

        public string About { get; set; }

        public string Experience { get; set; }

        public string Education { get; set; }

        public string Skill { get; set; }
        public string Languages { get; set; }

        public string Interests { get; set; }

        public string Licenses { get; set; }
        public string Recommendation { get; set; }

        public string Award { get; set; }
        public string Organization { get; set; }

        public string Activity { get; set; }
        public DateTime? CreatedTime { get; set; }
        public string ElementSite { get; set; }
    }
}
