using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("EMPLOYEE_CERTIFICATE")]
    public class EmployeeCert
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public string CertCode { get; set; }
        public string CertNum { get; set; }
        public string EmployeeCode { get; set; }

        public DateTime? CertDateLicense { get; set; }
        public DateTime? CertDateEnd { get; set; }


        public string ImgPath { get; set; }
        public string Noted { get; set; }     
        public string CreatedBy { get; set; }
        public DateTime? CreatedTime { get; set; }

        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        public string DeletedBy { get; set; }

        public DateTime? DeletedTime { get; set; }

        public bool IsDeleted { get; set; }


    }
}
