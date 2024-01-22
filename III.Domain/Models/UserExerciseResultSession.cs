using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
	[Table("USER_EXERCISE_RESULT_SESSION")]
	public class UserExerciseResultSession
    {
		[Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
		public int ID { get; set; }
		public string SessionCode { get; set; }
		public DateTime? StartTime { get; set; }
		public DateTime? EndTime { get; set; }
		public string Result { get; set; }
		public string CreatedBy { get; set; }
		public DateTime? CreatedTime { get; set; }
		public string UpdatedBy { get; set; }
		public DateTime? UpdatedTime { get; set; }
		public string DeletedBy { get; set; }
		public DateTime? DeletedTime { get; set; }
		public bool IsDeleted { get; set; }
	}
}