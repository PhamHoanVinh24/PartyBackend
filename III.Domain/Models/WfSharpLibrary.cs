using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("WF_SHARP_LIBRARY")]
    public class WFSharpLibrary
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }

        [StringLength(50)]
        public string SharpCode { get; set; }

        [StringLength(250)]
        public string SharpName { get; set; }
        [StringLength(8000)]
        public string SharpData { get; set; }
        [StringLength(250)]
        public string SharpType { get; set; }
        [StringLength(250)]
        public string SharpPath { get; set; }
        [StringLength(1000)]

        public string SharpDesc { get; set; }

        [StringLength(100)]
        public string CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }

        [StringLength(50)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        [StringLength(50)]
        public string DeletedBy { get; set; }

        public DateTime? DeletedTime { get; set; }

        public bool IsDeleted { get; set; }
    }
}
