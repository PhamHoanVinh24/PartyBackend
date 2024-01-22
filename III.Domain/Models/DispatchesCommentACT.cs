using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Newtonsoft.Json;

namespace ESEIM.Models
{
    [Table("DISPATCHES_COMMENT_ACT")]
    public class DispatchesCommentACT
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(100)]
        public string ProcessCode { get; set; }

        public string Comment { get; set; }

        [StringLength(50)]
        public string UserId { get; set; }

        [JsonIgnore]
        public virtual AspNetUser User { get; set; }

        public DateTime? CreatedTime { get; set; }
    }
}
