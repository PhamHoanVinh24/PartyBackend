using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
	[Table("SERVICE_CAT")]
	public class ServiceCategory
	{
		public ServiceCategory()
		{
		}
		[Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
		public int ServiceCatID { get; set; }

		[StringLength(100)]
		public string ServiceCode { get; set; }

		[StringLength(255)]
		public string ServiceName { get; set; }

		[StringLength(50)]
		public string Unit { get; set; }

		[StringLength(500)]
		public string Note { get; set; }

		[StringLength(100)]
		public string ServiceGroup { get; set; }

        [StringLength(100)]
        public string ServiceType { get; set; }

        [StringLength(100)]
        public string ServiceParent { get; set; }

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
        public int Visibility { get; set; }
    }
}