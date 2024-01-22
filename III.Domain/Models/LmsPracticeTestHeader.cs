using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using III.Domain.Common;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;

namespace ESEIM.Models
{
    [Table("LMS_PRACTICE_TEST_HEADER")]
    public class LmsPracticeTestHeader : IPurchasableObject, StringExtensions.IEntity<int>
    {
        //		EXAM_CODE nvarchar(255)   Checked
        //EXAM_TITLE  nvarchar(255)   Checked
        //DESCRIPTION nvarchar(1000)  Checked
        //DURATION    int Checked
        //UNIT nvarchar(255)   Checked
        //[LEVEL] nvarchar(255)   Checked
        //MARK_PASS   int Checked
        //VIEW_RESULT bit Checked
        //RE_WORK bit Checked
        //WORK_SEQUENCE bit Checked
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string PracticeTestCode { get; set; }
        public string PracticeTestTitle { get; set; }
        public string Description { get; set; }
        public int? Duration { get; set; }
        public string Unit { get; set; }
        public string Level { get; set; }
        public decimal? Rating { get; set; }
        public string RatingLog { 
            get => JsonConvert.SerializeObject(ListRating);
            set =>
                ListRating = string.IsNullOrEmpty(value)
                    ? new List<LmsPracticeRating>()
                    : JsonConvert.DeserializeObject<List<LmsPracticeRating>>(value);
        }
        [NotMapped]
        public List<LmsPracticeRating> ListRating { get; set; }
        public int? MarkPass { get; set; }
        public int? MarkTotal { get; set; }
        public int? NumQuiz { get; set; }
        public string Status { get; set; }
        public bool? ViewResult { get; set; }
        public bool? IsPublished { get; set; }
        public bool? Rework { get; set; }
        public bool? WorkSequence { get; set; }
        public string CreatedBy { get; set; }
        public DateTime? CreatedTime { get; set; }
        public string UpdatedBy { get; set; }
        public DateTime? UpdatedTime { get; set; }
        public string DeletedBy { get; set; }
        public DateTime? DeletedTime { get; set; }
        public bool IsDeleted { get; set; }
        public string SubjectCode { get; set; }
        public string Share { get; set; }
        public string FilePath { get; set; }
        public decimal? Price { get; set; }
        [NotMapped]
        public bool? IsPurchased { get; set; }
    }
    public class LmsPracticeRating
    {
        public string Id { get; set; }
        public int Rating { get; set; }
        public string UserName {get; set;}
    }
}