using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Newtonsoft.Json;

namespace ESEIM.Models
{
    [Table("DISPATCHES_FILES_ACT")]
    public class DispatchesFileACT
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(100)]
        public string ProcessCode { get; set; }

        public string FileName { get; set; }

        [StringLength(50)]
        public string UserId { get; set; }
        [JsonIgnore]
        public virtual AspNetUser User { get; set; }

        public string Soure { get; set; }

        [StringLength(100)]
        public string Fomart { get; set; }

        public DateTime? CreatedTime { get; set; }
    }
}
