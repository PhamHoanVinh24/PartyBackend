using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("LMS_TUTORING_SCHEDULE")]
    public class LmsTutoringSchedule : IPurchasableObject
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public string Title { get; set; }

        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }

        public string Description { get; set; }
        public string JsonStatus { get; set; }
        public string BackgroundColor { get; set; }
        public string BackgroundImage { get; set; }

        public string AccountZoom { get; set; }

        [StringLength(50)]
        public string CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }

        [StringLength(50)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        public bool IsDeleted { get; set; }

        [StringLength(100)]
        public string DeletedBy { get; set; }

        public DateTime? DeletedTime { get; set; }

        public bool? IsPopupAllowed { get; set; }

        public string Teacher { get; set; }

        public string SubjectCode { get; set; }
        public string CourseCode { get; set; }
        public string ClassCode { get; set; }

        [NotMapped]
        public List<UserApprovedTutoring> ListUserObject { get; set; }

        public string ListUserApproved
        {
            get
            {
                return JsonConvert.SerializeObject(ListUserObject);
            }
            set
            {
                ListUserObject = string.IsNullOrEmpty(value)
                ? new List<UserApprovedTutoring>()
                : JsonConvert.DeserializeObject<List<UserApprovedTutoring>>(value);
            }
        }

        [NotMapped]
        public List<Lesson> ListLessons { get; set; }

        public string LessonDoc
        {
            get
            {
                return JsonConvert.SerializeObject(ListLessons);
            }
            set
            {
                ListLessons = string.IsNullOrEmpty(value)
                ? new List<Lesson>()
                : JsonConvert.DeserializeObject<List<Lesson>>(value);
            }
        }
        public int? MeetingId { get; set; }
        public decimal? Price { get; set; }
        public string PathNotepad { get; set; }
        [NotMapped]
        public bool? IsPurchased { get; set; }
    }

    public class LmsTutoringScheduleModel
    {
        public int Id { get; set; }

        public string Title { get; set; }

        public string StartTime { get; set; }
        public DateTime StartDateTime { get; set; }

        public string EndTime { get; set; }
        public string BackgroundColor { get; set; }
        public string BackgroundImage { get; set; }

        public string Description { get; set; }

        public string AccountZoom { get; set; }

        public string ListUserApproved { get; set; }
        public string JsonStatus { get; set; }
        public bool? IsPopupAllowed { get; set; }

        public string Teacher { get; set; }

        public string SubjectCode { get; set; }
        public string CourseCode { get; set; }
        public string ClassCode { get; set; }

        public string LessonDoc { get; set; }

        public string CreatedBy { get; set; }

        public string UpdatedBy { get; set; }
        public int? MeetingId { get; set; }
        public string PathNotepad { get; set; }
    }
    
    public class UserApprovedTutoring
    {
        public string userName { get; set; }
        public string status { get; set; }
        public DateTime? timeStamp { get; set; }
    }
}