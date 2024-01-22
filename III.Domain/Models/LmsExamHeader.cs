using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;

namespace ESEIM.Models
{
    [Table("LMS_EXAM_HEADER")]
    public class LmsExamHeader
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string Title { get; set; }
        public string ExamCode { get; set; }

        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }
        public string ListUserJoined
        {
            get;
            //{
            //    return JsonConvert.SerializeObject(ListUserObject);
            //}
            set;
            //{
            //    ListUserObject = string.IsNullOrEmpty(value)
            //    ? new List<UserApproved>()
            //    : JsonConvert.DeserializeObject<List<UserApproved>>(value);
            //}
        }
        public string PracticeTestCode { get; set; }
        public string Status { get; set; }
        public string BackgroundColor { get; set; }
        public string BackgroundImage { get; set; }
        public string Level { get; set; }
        public string Description { get; set; }
        public string SubjectCode { get; set; }
        public decimal? Price { get; set; }
        public DateTime CreatedTime { get; set; }

        [StringLength(50)]
        public string CreatedBy { get; set; }

        [StringLength(50)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        public bool IsDeleted { get; set; }

        [StringLength(100)]
        public string DeletedBy { get; set; }

        public DateTime? DeletedTime { get; set; }
    }
}
