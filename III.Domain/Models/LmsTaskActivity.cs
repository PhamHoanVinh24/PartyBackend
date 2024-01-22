using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("CARD_USER_ACTIVITY")]
    public class LmsTaskActivity
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        
        [StringLength(100)]
        public string UserId { get; set; }

        [StringLength(100)]
        public string LmsTaskCode { get; set; }

        [StringLength(100)]
        public string Action { get; set; }

        public bool IsCheck { get; set; }

        public DateTime CreatedTime { get; set; }

        [StringLength(100)]
        public string FromDevice { get; set;}
        public string IdObject { get; set;}

        [StringLength(1000)]
        public string ChangeDetails { get; set; }

        [NotMapped]
        public List<String> ListLog { get; set; }

        public string Log { get; set; }
    }
}
