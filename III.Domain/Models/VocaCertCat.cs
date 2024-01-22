using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("VOCA_CERTIFICATE_CAT")]
    public class VocaCertCat
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public string CertCode { get; set; }

        public string CertName { get; set; }

        public string CertLevel { get; set; }

        public string CertType { get; set; }
        public int CertTerm { get; set; }
        public string TermUnit { get; set; }
        public string CertNote { get; set; }
        public string CertParent { get; set; }
        public string CreatedBy { get; set; }
        public DateTime? CreatedTime { get; set; }

        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        public string DeletedBy { get; set; }

        public DateTime? DeletedTime { get; set; }

        public bool IsDeleted { get; set; }


    }
}
