using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;
using ESEIM.Utils;

namespace ESEIM.Models
{
    [Table("STAFF_TIME_KEEPING")]
    public class StaffTimeKeeping
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(50)]
        public string EmployeeId { get; set; }

        [StringLength(255)]
        public string DepartmentCode { get; set; }
        public string Name { get; set; }

        public string Month { get; set; }
        public string JsonMonth { get; set; }

        public decimal TotalDay { get; set; }

        [StringLength(50)]
        public string CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }

        [StringLength(50)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        public bool IsDeleted { get; set; }

        public string DeletionToken { get; set; }
    }
}
