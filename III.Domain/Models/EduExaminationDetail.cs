using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
	[Table("EDU_EXAMINATION_DETAIL")]
	public class EduExaminationDetail
    {
		[Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
		public int Id { get; set; }
		public string PracticeTestCode { get; set; }
        public string QuestionCode { get; set; }
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