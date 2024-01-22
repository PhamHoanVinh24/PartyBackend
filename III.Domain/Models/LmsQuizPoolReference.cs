using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;

namespace ESEIM.Models
{
    [Table("LMS_QUIZ_POOL_REFERENCE")]
    public class LmsQuizPoolReference
    {
        public LmsQuizPoolReference()
        {
            ListLogLikes = new List<LogLike>();
        }
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string QuizCode { get; set; }
        public string SubjectCode { get; set; }
        public string RefContent { get; set; }
        public string UserCreateRef { get; set; }
        public int? RefParent { get; set; }
        public int? Like { get; set; }
        public int? Dislike { get; set; }
        public string LikeLog
        {
            get => JsonConvert.SerializeObject(ListLogLikes);
            set =>
                ListLogLikes = string.IsNullOrEmpty(value)
                    ? new List<LogLike>()
                    : JsonConvert.DeserializeObject<List<LogLike>>(value);
        }
        [NotMapped]
        public List<LogLike> ListLogLikes { get; set; }

        public string JsonCanvas { get; set; }
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
    public class LogLike
    {
        public string Id { get; set; }
        public DateTime ActionTime { get; set; }
        public string ActionType { get; set; }
        public bool IsActive { get; set; }
        public string UserName { get; set; }
    }
}