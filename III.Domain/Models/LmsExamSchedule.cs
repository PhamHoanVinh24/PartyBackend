using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;

namespace ESEIM.Models
{
    [Table("EXAM_SCHEDULER")]
    public class LmsExamSchedule
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
		public string Title {get; set;}
		public string ExamCode {get; set; }
		public string LmsTaskCode {get; set; }

        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }
        [NotMapped]
        public List<UserApproved> ListUserObject { get; set; }
        public string ListUserApproved
        {
            get
            {
                return JsonConvert.SerializeObject(ListUserObject);
            }
            set
            {
                ListUserObject = string.IsNullOrEmpty(value)
                ? new List<UserApproved>()
                : JsonConvert.DeserializeObject<List<UserApproved>>(value);
            }
        }
        public string JsonStatus { get; set; }
        public string BackgroundColor { get; set; }
        public string BackgroundImage { get; set; }
        public string JsonRef { get; set; }
		public string Location {get; set; }
		public string Description {get; set;}
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
