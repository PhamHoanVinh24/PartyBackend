using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("HR_CONTRACT")]
    public class HRContract
    {

        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int id { get; set; }
        public double? Insuarance { get; set; }
        public DateTime? Dates_of_pay { get; set; }
        [StringLength(maximumLength: 250)]
        public string Place_Work { get; set; }

        [StringLength(maximumLength: 250)]
        public string Exp_time_work { get; set; }

        public string Salary_Ratio { get; set; }

        [StringLength(maximumLength: 250)]
        public string Payment { get; set; }

        [StringLength(50)]
        public string Contract_Type { get; set; }

        public string Signer { get; set; }

        public int? Employee_Id { get; set; }
        public double? Salary { get; set; }
        public DateTime? Start_Time { get; set; }
        public DateTime? End_Time { get; set; }
        public DateTime? DateOf_LaborBook { get; set; }
        [StringLength(maximumLength: 250)]
        public string Place_LaborBook { get; set; }

        [StringLength(maximumLength: 250)]
        public string Work_Content { get; set; }

        [StringLength(maximumLength: 250)]
        public string Allowance { get; set; }

        [StringLength(maximumLength: 250)]
        public string Contract_Code { get; set; }
        [StringLength(maximumLength: 250)]
        public string LaborBook_Code { get; set; }
        [StringLength(maximumLength: 250)]
        public string File { get; set; }
        [StringLength(maximumLength: 250)]
        public string Other_Agree { get; set; }

        [StringLength(maximumLength: 250)]
        public string Info_Insuarance { get; set; }

        [StringLength(maximumLength: 250)]
        public string Info_Contract { get; set; }


        public double? Bonus { get; set; }
        [StringLength(maximumLength: 250)]
        public string Tools_Work { get; set; }

        public int? Active { get; set; }

        [StringLength(maximumLength: 250)]
        public string Type_Money { get; set; }
        public int? Value_time_work { get; set; }

        [StringLength(maximumLength: 250)]
        public string Updated_By { get; set; }

        [StringLength(maximumLength: 250)]
        public string Created_By { get; set; }

        public DateTime? Created_Time { get; set; }
        public DateTime? Updated_Time { get; set; }
        public int? flag { get; set; }
        public string PayScale { get; set; }
    }
}