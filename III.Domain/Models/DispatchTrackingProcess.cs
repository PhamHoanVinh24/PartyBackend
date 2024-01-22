using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Newtonsoft.Json;

namespace ESEIM.Models
{
    [Table("DISPATCHES_TRACKING_PROCESS")]
    public class DispatchTrackingProcess
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(100)]
        public string DispatchCode { get; set; }

        [StringLength(100)]
        public string FromNode { get; set; }

        [StringLength(100)]
        public string NodeProars { get; set; }
        public bool? IsUp { get; set; }
        public DateTime? DeadLine { get; set; }

        public string MemberList { get; set; }

        [StringLength(255)]
        public string ProcessCode { get; set; }
        public string Comment { get; set; }
        public string FileList { get; set; }

        [StringLength(50)]
        public string Status { get; set; }

        [StringLength(255)]
        public string ToNode { get; set; }

        [StringLength(100)]
        public string Action { get; set; }

        public int? Step { get; set; }

        public DateTime? CreatedTime { get; set; }

        [StringLength(50)]
        public string UserId { get; set; }

        [JsonIgnore]
        public virtual AspNetUser User { get; set; }
        public string Reason { get; set; }
        [StringLength(255)]
        public string Coordinate { get; set; }
        [StringLength(255)]
        public string Received { get; set; }
        public string ViewerList { get; set; }
        
    }
}
