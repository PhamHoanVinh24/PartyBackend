using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("RM_E_COMPANY")]
    public class RmECompany
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(maximumLength: 50)]
        public string CompanyCode { get; set; }

        [StringLength(maximumLength: 255)]
        public string CompanyName { get; set; }

        [StringLength(maximumLength: 50)]
        public string CompanyPhone { get; set; }

        [StringLength(maximumLength: 255)]
        public string Description { get; set; }

        [StringLength(maximumLength: 255)]
        public string CompanyType { get; set; }

        [StringLength(maximumLength: 255)]
        public string CompanyContact { get; set; }

        [StringLength(maximumLength: 255)]
        public string CompanyImage { get; set; }

        [StringLength(maximumLength: 255)]
        public string CompanyWebsite { get; set; }

        [StringLength(maximumLength: 255)]
        public string CompanyOwner { get; set; }
        public DateTime? CreateDate { get; set; }
        public int? CreateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public int? UpdateBy { get; set; }
        public int Flag { get; set; }
    }
}