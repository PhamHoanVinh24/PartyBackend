using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
	[Table("ALLOWANCE_EMPLOYEE_PARAM")]
	public class AllowanceEmployeeParam
    {
		public AllowanceEmployeeParam()
		{
		}
		[Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
		public int ID { get; set; }

		[StringLength(100)]
		public string EmployeeId { get; set; }

		[StringLength(255)]
		public string ParamCode { get; set; }

		[StringLength(500)]
		public string Value { get; set; }

        [NotMapped]
        public string Months { get; set; }
        public DateTime Month { get; set; }

        [StringLength(50)]
		public string CreatedBy { get; set; }

		public DateTime? CreatedTime { get; set; }
		[StringLength(50)]
		public string UpdatedBy { get; set; }

		public DateTime? UpdatedTime { get; set; }

		[StringLength(50)]
		public string DeletedBy { get; set; }

		public DateTime? DeletedTime { get; set; }

		public bool IsDeleted { get; set; }
	}
}