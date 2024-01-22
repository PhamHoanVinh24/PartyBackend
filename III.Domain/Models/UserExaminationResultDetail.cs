using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
	[Table("USER_EXAMINATION_RESULT_DETAIL")]
	public class UserExaminationResultDetail
    {
		[Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
		public int Id { get; set; }
		public string SessionCode { get; set; }
		public string QuestionCode { get; set; }
		public string Answer { get; set; }
		public string Guide { get; set; }
        public bool IsPass { get; set; }
        public string CreatedBy { get; set; }
		public DateTime? CreatedTime { get; set; }
		public string UpdatedBy { get; set; }
		public DateTime? UpdatedTime { get; set; }
		public string DeletedBy { get; set; }
		public DateTime? DeletedTime { get; set; }
		public bool IsDeleted { get; set; }
	}
}