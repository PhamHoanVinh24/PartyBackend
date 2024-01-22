using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("EXAM_HEADER")]
    public class ExamHeader
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
        public string ExamCode { get; set; }
        public string ExamTitle { get; set; }
        public string Description { get; set; }
        public int? Duration { get; set; }
        public string Unit { get; set; }
        public string Level { get; set; }
        public int? MarkPass { get; set; }
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
    }
}