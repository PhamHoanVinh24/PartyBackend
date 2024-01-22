using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Globalization;

namespace ESEIM.Models
{
    [Table("LMS_TRACK_DILIGENCE")]
    public class LmsTrackDiligence
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public string ObjectType { get; set; }
        public string ObjectCode { get; set; }
		
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

        [NotMapped]
        public List<ObjectResult> ListPracticeResult { get; set; }

        public string ObjectResult
        {
            get
            {
                return JsonConvert.SerializeObject(ListPracticeResult);
            }
            set
            {
                ListPracticeResult = string.IsNullOrEmpty(value)
                ? new List<ObjectResult>()
                : JsonConvert.DeserializeObject<List<ObjectResult>>(value);
            }
        }
    }

    public class ObjectResult
    {
        public int Id { get; set; }
        [NotMapped]
        public DateTime StartTimeDt { get; set; }
        [NotMapped]
        public DateTime EndTimeDt { get; set; }

        public string StartTime
        {
            get => StartTimeDt.ToString("dd/MM/yyyy HH:mm:ss");
            set => StartTimeDt = DateTime.ParseExact(value, "dd/MM/yyyy HH:mm:ss", CultureInfo.InvariantCulture);
        }
        public string EndTime
        {
            get => EndTimeDt.ToString("dd/MM/yyyy HH:mm:ss");
            set => EndTimeDt = DateTime.ParseExact(value, "dd/MM/yyyy HH:mm:ss", CultureInfo.InvariantCulture);
        }
        public string UserResult { get; set; }
        public string CorrectResult { get; set; }
        public string UserPosition { get; set; }
        public bool? IsCorrect { get; set; }
        public string Device { get; set; }
        public string SessionCode { get; set; }
        public int? NumSuggest { get; set; }
        public string TaskCode { get; set; }
        public string QuizType { get; set; } /*QUIZ, PRACTICE, EXAM*/
        public string QuizObjCode { get; set; } /*"", PRACTICE_TEST_CODE, EXAM_CODE*/
    }

    public class LmsTaskPracticeGroup
    {
        public string UserName { get; set; }
        public string GivenName { get; set; }
        public int Gender { get; set; }
        [NotMapped]
        public bool? CheckFullAct => false;
        public int? CountTotalQuiz { get; set; }
        public int? CountQuizDone { get; set; }
        public int? CountQuizCorrect { get; set; }
        public int? CountQuizWrong { get; set; }
        [NotMapped]
        public string CountTotalTime { get; set; }
        public int? CountTotalSecond { get; set; }
        public int? CountTotalSuggest { get; set; }
        public List<LmsTaskPracticeResult> ListDetail { get; set; }
    }
    public class LmsTaskPracticeResult
    {
        public string UserName { get; set; }
        public string GivenName { get; set; }
        public int Gender { get; set; }
        public string ItemCode { get; set; }
        public string ItemName { get; set; }
        public string ItemType { get; set; }
        public int? CountTotalQuiz { get; set; }
        public int? CountQuizDone { get; set; }
        public int? CountQuizCorrect { get; set; }
        public int? CountQuizWrong { get; set; }

        [NotMapped]
        public string CountTotalTime => new DateTime(
            TimeSpan.FromSeconds(Convert.ToDouble(CountTotalSecond)).Ticks).ToString("HH:mm:ss");
        public int? CountTotalSecond { get; set; }
        public int? CountTotalSuggest { get; set; }
    }
}