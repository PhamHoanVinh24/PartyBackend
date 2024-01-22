using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("LMS_SUBJECT")]
    public class LMSSubject
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }

        [StringLength(100)]
        public string LmsSubjectCode { get; set; }

        [StringLength(255)]
        public string LmsSubjectName { get; set; }

        public string LmsSubjectDesc { get; set; }

        [StringLength(50)]
        public string LmsSubjectType { get; set; }

        public string LmsSubjectGroup { get; set; }
        
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
