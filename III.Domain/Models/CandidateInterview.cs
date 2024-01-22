using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("CANDIDATE_INTERVIEW")]
    public class CandidateInterview
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        
        [StringLength(255)]
        public string CandidateCode { get; set; }

        public DateTime InterviewDate { get; set; }

        [StringLength(255)]
        public string Status { get; set; }

        public bool? IsPresent { get; set; }
    }
}
