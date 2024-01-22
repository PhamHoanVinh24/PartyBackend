using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("HR_EMPLOYEE_MOBILIZATION")]
    public class HREmployeeMobilization
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public string DecisionId { get; set; }

        public string EmployeeId { get; set; }

        public string DepartmentIdOld { get; set; }

        public string RoleIdOld { get; set; }

        public string DepartmentIdNew { get; set; }

        public string RoleIdNew { get; set; }

        public string Wage { get; set; }

        public string WageLevel { get; set; }

        public string Reason { get; set; }


        public DateTime? FormDate { get; set; }

        public DateTime? ToDate { get; set; }

        public string CreatedBy { get; set; }


        public DateTime CreatedTime { get; set; }

        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        public string DeletedBy { get; set; }

        public DateTime? DeletedTime { get; set; }

        public bool IsDeleted { get; set; }
    }
}
