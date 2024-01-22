using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("ACTIVITY_WORKFLOW")]
    public class ActivityWorkFlow
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(50)]
        public string ActCode { get; set; }

        [StringLength(250)]
        public string ActName { get; set; }
        [StringLength(250)]
        public string ActParent { get; set; }
        [StringLength(1000)]

        public string ActNoted { get; set; }
        [StringLength(8000)]

        public string ActAttributeGraph { get; set; }

        [StringLength(100)]
        public string CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }

        [StringLength(50)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        [StringLength(50)]
        public string DeletedBy { get; set; }

        public DateTime? DeletedTime { get; set; }

        public bool? IsDeleted { get; set; }
        [StringLength(255)]
        public string ActStatus { get; set; }

    }
}   
