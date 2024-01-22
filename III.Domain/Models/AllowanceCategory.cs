using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
	[Table("ALLOWANCE_CAT")]
	public class AllowanceCategory
	{
		public AllowanceCategory()
		{
		}
		[Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
		public int ID { get; set; }

		[StringLength(100)]
		public string Code { get; set; }

		[StringLength(255)]
		public string Name { get; set; }

		[StringLength(500)]
		public string Note { get; set; }

        [StringLength(50)]
        public string Group { get; set; }

        [StringLength(50)]
        public string ExcelColumn { get; set; }

        [StringLength(255)]
        public string Expression { get; set; }

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

        public bool Base { get; set; }

        [StringLength(50)]
        public string DefaultValue { get; set; }
    }
}