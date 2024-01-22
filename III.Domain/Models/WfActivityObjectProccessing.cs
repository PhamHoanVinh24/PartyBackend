using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("WF_ACTIVITY_OBJECT_PROCESSING")]
    public class WfActivityObjectProccessing
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }

        public string ActInstCode { get; set; }

        public string ObjectType { get; set; }

        public string ObjectInst { get; set; }

        public bool Beshare { get; set; }

        public bool ObjEntry { get; set; }

        [StringLength(100)]
        public string CreatedBy { get; set; }

        public DateTime CreatedTime { get; set; }

        [StringLength(100)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        [StringLength(100)]
        public string DeletedBy { get; set; }

        public DateTime? DeletedTime { get; set; }

        public bool IsDeleted { get; set; }
        public string WfInstCode { get; set; }
        public bool IsLeader { get; set; }
    }
}
