using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("RM_HR_EMPLOYEE")]
    public class RmHrEmployee
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(maximumLength: 50)]
        public string FullName { get; set; }

        [StringLength(maximumLength: 50)]
        public string NickName { get; set; }

        public int? Gender { get; set; }

        [StringLength(maximumLength: 50)]
        public string Nation { get; set; }

        [StringLength(maximumLength: 50)]
        public string Religion { get; set; }
        public DateTime? Birthday { get; set; }

        [StringLength(maximumLength: 200)]
        public string Birthofplace { get; set; }

        [StringLength(maximumLength: 200)]
        public string PermanenTresidence { get; set; }

        [StringLength(maximumLength: 50)]
        public string Phone { get; set; }

        public DateTime? FactionDate { get; set; }



        [StringLength(maximumLength: 50)]
        public string EducationalLevel { get; set; }

        [StringLength(maximumLength: 50)]
        public string LanguageLevel { get; set; }


        [StringLength(maximumLength: 50)]
        public string Health { get; set; }

        [StringLength(maximumLength: 12)]
        public string IdentityCard { get; set; }
        [StringLength(maximumLength: 255)]
        public string CompanyCode { get; set; }
        public DateTime? IdentityCarddate { get; set; }


        [StringLength(maximumLength: 20)]
        public string Identitycardplace { get; set; }

        [StringLength(maximumLength: 12)]
        public string Socialinsurance { get; set; }

        public DateTime? Socialinsurancedate { get; set; }

        [StringLength(maximumLength: 20)]
        public string Socialinsuranceplace { get; set; }

        [StringLength(maximumLength: 100)]
        public string Identification { get; set; }

        public int? Unit { get; set; }


        [StringLength(maximumLength: 20)]
        public string Wage { get; set; }

        [StringLength(maximumLength: 50)]
        public string SalaryType { get; set; }


        [StringLength(maximumLength: 12)]
        public string SalaryGroup { get; set; }

        public double? SalaryFactor { get; set; }

        [StringLength(maximumLength: 250)]
        public string TrainingSchool { get; set; }

        [StringLength(maximumLength: 200)]
        public string TrainingTime { get; set; }

        [StringLength(maximumLength: 50)]
        public string TrainingType { get; set; }


        [StringLength(maximumLength: 50)]
        public string Disciplines { get; set; }



        [StringLength(maximumLength: 50)]
        public string Specialized { get; set; }

        [StringLength(maximumLength: 255)]
        public string Picture { get; set; }
        [StringLength(maximumLength: 50)]
        public string TaxCode { get; set; }
        [StringLength(maximumLength: 255)]
        public string Position { get; set; }
        public int? EmployeeKind { get; set; }

        [StringLength(maximumLength: 100)]
        public string EmailUser { get; set; }

        [StringLength(maximumLength: 100)]
        public string EmailPassword { get; set; }
        [StringLength(maximumLength: 100)]
        public string Nationlaty { get; set; }

        public int? Status { get; set; }

        public int? EmployeeType { get; set; }

        [StringLength(maximumLength: 100)]
        public string Bank { get; set; }

        [StringLength(maximumLength: 50)]
        public string AccountHolder { get; set; }
        [StringLength(maximumLength: 100)]
        public string AccounTopenplace { get; set; }

        [StringLength(maximumLength: 50)]
        public string AccountNumber { get; set; }

        public int? MaritalStatus { get; set; }

        public int? IdDriver { get; set; }


        [StringLength(maximumLength: 250)]
        public string ComputerSkill { get; set; }


        public int? EmployeeGroup { get; set; }

        public DateTime? Createtime { get; set; }
        public DateTime? Updatetime { get; set; }


        [StringLength(maximumLength: 10)]
        public string Language { get; set; }

        public int? Flag { get; set; }

        public int? CreateBy { get; set; }


        public int? UpdatedBy { get; set; }


    }
}
