using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
	[Table("LMS_EXAM_DETAIL")]
	public class LmsExamDetail
    {
//		ID int Unchecked
//QUEST_CODE nvarchar(255)   Checked
//MARK    int Checked
//[ORDER] int Checked
//DURATION int Checked
//UNIT nvarchar(255)   Checked
//EXAM_CODE   nvarchar(255)   Checked
   [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
		public int Id { get; set; }
        public string QuestCode { get; set; }
		public string ExamCode { get; set; }
		public int? Mark { get; set; }
		public int? Order { get; set; }
		public int? Duration { get; set; }
		public string Unit { get; set; }
		public string CreatedBy { get; set; }
		public DateTime? CreatedTime { get; set; }
		public string UpdatedBy { get; set; }
		public DateTime? UpdatedTime { get; set; }
		public string DeletedBy { get; set; }
		public DateTime? DeletedTime { get; set; }
		public bool IsDeleted { get; set; }
    }
}