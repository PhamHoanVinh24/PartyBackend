using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("PAY_SHEET")]
    public class PaySheet
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string PayGradesName { get; set; }

        public string PayGradesCode { get; set; }

        public string PayGradesGroup { get; set; }

        public string PayScale { get; set; }

        public int? PayRanges { get; set; }

        public decimal? PayCoef { get; set; }
        public decimal? BasicPay { get; set; }

        public string CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }

        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        public string DeletedBy { get; set; }

        public DateTime? DeletedTime { get; set; }

        public bool IsDeleted { get; set; }

    }
}
