using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
	[Table("EDMS_FILE_PERMISSION")]
	public class EDMSFilePermission
    {
		public EDMSFilePermission()
		{
		}
		[Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
		public int PermissionID { get; set; }

		[StringLength(100)]
		public string FileCode { get; set; }
        [StringLength(100)]
        public string Permission { get; set; }

		public string MemberID { get; set; }

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