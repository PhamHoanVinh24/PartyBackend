using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("HR_WORKING_PROCESS")]
    public class HRWorkingProcess
    {

        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int id { get; set; }

        public int? Employee_Id { get; set; }

        public DateTime? Start_Time { get; set; }
        public DateTime? End_Date { get; set; }

        [StringLength(maximumLength: 250)]
        public string Description { get; set; }

        [StringLength(maximumLength: 250)]
        public string Wage_Level { get; set; }

        public double? Salary_Ratio { get; set; } 
            
        public DateTime? Created_Time { get; set; }
        public DateTime? Updated_Time { get; set; }
        public int? flag { get; set; }
    }
}