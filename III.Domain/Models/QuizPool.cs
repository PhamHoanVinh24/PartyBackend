using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using III.Domain.Common;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;

namespace ESEIM.Models
{
	[Table("QUIZ_POOL")]
	public class QuizPool : IPurchasableObject, StringExtensions.IEntity<int>
	{
		[Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
		public int Id { get; set; }
		public string Code { get; set; }
        
        public string Title { get; set; }
		public string Content { get; set; }
        public int? Category { get; set; }
		public string JsonData { get; set; }
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
        [NotMapped]
        public string QuestionCode { get; set; }
        [NotMapped]
        public int? Section { get; set; }
        [NotMapped]
        public int? Subject { get; set; }
        [NotMapped]
        public int? Course { get; set; }
        public string LectureRelative { get; set; }
		public string Level { get; set; }
		public string LectureCode { get; set; }
		public int? Duration { get; set; }
		public string Unit { get; set; }
		public string SubjectCode { get; set; }
		public string Type { get; set; }
		public string JsonRef { get; set; }
		public string QuestionMedia { get; set; }
		public string Status { get; set; }
		public string Share { get; set; }
		public decimal? Price { get; set; }
        [NotMapped]
        public bool? IsPurchased { get; set; }

        [NotMapped]
		public string LmsTaskCode { get; set; }

		[NotMapped]
		public bool? IsAlreadyDone { get; set; }
        public string Solve { get; set; }
        public string LatexInQuiz { get; set; }
		public decimal? Rating { get; set; }
        public bool? IsTutor888 { get; set; }
        public string RatingLog { 
            get => JsonConvert.SerializeObject(ListRating);
            set =>
                ListRating = string.IsNullOrEmpty(value)
                    ? new List<LmsPracticeRating>()
                    : JsonConvert.DeserializeObject<List<LmsPracticeRating>>(value);
        }
        [NotMapped]
        public List<LmsPracticeRating> ListRating { get; set; }
    }
}