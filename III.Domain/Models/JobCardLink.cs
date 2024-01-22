
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("JOBCARD_LINK")]
    public class JobCardLink
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(100)]
        public string CardCode { get; set; }

        [StringLength(100)]
        public string CardLink { get; set; }

        [StringLength(50)]
        public string CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }

        [StringLength(50)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        public Boolean IsDeleted { get; set; }

        [StringLength(50)]
        public DateTime? DeletedTime { get; set; }

        [StringLength(50)]
        public string DeletedBy { get; set; }
    }
}
