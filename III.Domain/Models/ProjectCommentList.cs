using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;

namespace ESEIM.Models
{
    [Table("PROJECT_COMMENT_LIST")]
    public class ProjectCommentList
    {
        public ProjectCommentList()
        {
            ListLogLikes = new List<LogLikeProject>();
        }

        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string ProjectCode { get; set; }
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
                    ? new List<LogLikeProject>()
                    : JsonConvert.DeserializeObject<List<LogLikeProject>>(value);
        }
        [NotMapped]
        public List<LogLikeProject> ListLogLikes { get; set; }

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
    public class LogLikeProject
    {
        public string Id { get; set; }
        public DateTime ActionTime { get; set; }
        public string ActionType { get; set; }
        public bool IsActive { get; set; }
        public string UserName { get; set; }
    }
}