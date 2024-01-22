using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;
namespace ESEIM.Models
{
    [Table("TRANSITION")]
    public class Transition
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(50)]
        public string TrsCode { get; set; }

        [StringLength(250)]
        public string TrsTitle { get; set; }
        [StringLength(250)]
        public string TrsParent { get; set; }
        [StringLength(250)]
        public string TrsType { get; set; }
        [StringLength(1000)]

        public string TrsNoted { get; set; }
        [StringLength(8000)]

        public string TrsAttrGraph { get; set; }

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
