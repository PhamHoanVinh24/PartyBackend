using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("COMMITMENT_HEADER")]
    public class CommitmentHeader
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string CommitmentCode { get; set; }
        public string Noted { get; set; }
        public string UserID { get; set; }
        public string Surrogate { get; set; }
        public string Status { get; set; }
        public string Signature { get; set; }
        public string FileReference { get; set; }
        public DateTime? CreateTime { get; set; }
        public string CreateBy { get; set; }
        public DateTime? UpdateTime { get; set; }
        public string UpdateBy { get; set; }
        public string Title { get; set; }
        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public bool? Flag { get; set; }
    }
   
}
