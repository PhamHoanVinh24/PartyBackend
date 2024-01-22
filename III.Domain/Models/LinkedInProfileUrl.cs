using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace III.Domain.Models
{
    [Table("LINKED_IN_PROFILE_ID")]
    public class LinkedInProfileUrl
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public string  LinkedInUrl{ get; set; }

        public string LinkedInProfileId { get; set; }
        public DateTime? CreatedTime { get; set; }
    }
}
