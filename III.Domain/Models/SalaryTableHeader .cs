using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("SALARY_TABLE_HEADER")]
    public class SalaryTableHeader
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string CodeTblSalary { get; set; }
        public string Title { get; set; }
        public DateTime? MonthSalary { get; set; }
        public string Note { get; set; }
        public decimal Total { get; set; }
        public string Creator { get; set; }
        public DateTime? CreateTblTime { get; set; }
        public DateTime? Approve { get; set; }
        public string Approver { get; set; }
        public string CreatedBy { get; set; }
        public DateTime? CreatedTime { get; set; }
        public string UpdatedBy { get; set; }
        public DateTime? UpdatedTime { get; set; }
        public string DeletedBy { get; set; }
        public DateTime? DeletedTime { get; set; }
        public bool IsDeleted { get; set; }
    }

    public class SalaryTableHeaderExcelModel
    {
        public string CodeTblSalary { get; set; }
        public string Title { get; set; }
        public string MonthSalary { get; set; }
        public string Note { get; set; }
        public decimal Total { get; set; }
    }
}
