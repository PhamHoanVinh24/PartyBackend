using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace III.Domain.Models
{
    [Table("LINKED_IN_DATA_PROFILE_USER")]
    public class LinkedInDataProfile
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public string  ProfileUrl{ get; set; }

        public DateTime? CreatedTime { get; set; }
        public string ElementSite { get; set; }
    }
}
