using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("URENCO_STREETWORKER_REPORT")]
    public class UrencoStreetworkerReport
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string ReportCode { get; set; }

        [StringLength(255)]
        public string NodeCode { get; set; }

        [StringLength(255)]
        public int? Volume { get; set; }

        [StringLength(255)]
        public string Note { get; set; }

        [StringLength(255)]
        public string CreatedBy { get; set; }

        [StringLength(255)]
        public string Unit { get; set; }

        public DateTime? CreatedTime { get; set; }

        [StringLength(255)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        [StringLength(255)]
        public string DeletedBy { get; set; }

        public DateTime? DeletedTime { get; set; }

        public bool IsDeleted { get; set; }

    }
}
