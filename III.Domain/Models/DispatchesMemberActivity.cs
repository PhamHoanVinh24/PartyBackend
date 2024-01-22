using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Newtonsoft.Json;

namespace ESEIM.Models
{
    [Table("DISPATCHES_MEMBER_ACTIVITY")]
    public class DispatchesMemberActivity
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(100)]
        public string ProcessCode { get; set; }

        [StringLength(255)]
        public string Assigner { get; set; }

        [StringLength(50)]
        public string UserId { get; set; }

        [JsonIgnore]
        public virtual AspNetUser User { get; set; }

        public int Role { get; set; }

        public DateTime? CreatedTime { get; set; }

        [StringLength(255)]
        public string GroupUserCode { get; set; }

        public string Comment { get; set; }

        [StringLength(255)]
        public string AssigneeConfirm { get; set; }

        public DateTime? ConfirmTime { get; set; }

        public DateTime? DeadLine { get; set; }
    }
}
