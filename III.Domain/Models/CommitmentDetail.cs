using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("COMMITMENT_DETAIL")]
    public class CommitmentDetail
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        [StringLength(50)]
        public string CommitmentCode { get; set; }
        public string ItemCode { get; set; }
        [StringLength(50)]
        public bool? Flag { get; set; }
    }
}
