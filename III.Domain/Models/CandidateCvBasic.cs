using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("CANDIDATE_CV_STORAGE")]
    public class CandidateCvStorage
    { 
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        
        public string UserName { get; set; }

        public string Password { get; set; }
        
        public string JsonData { get; set; }
        public string MailContent { get; set; }

        public string MailCode { get; set; }
        public string QrCode { get; set; }
        public bool? Status { get; set; }
        public string CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }


        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }


        public string DeletedBy { get; set; }

        public DateTime? DeletedTime { get; set; }

        public bool? IsDeleted { get; set; }
    }
}
