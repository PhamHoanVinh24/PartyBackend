using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("CARD_COMMENT_LIST")]
    public class CardCommentList
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string CardCode { get; set; }

        [StringLength(255)]
        public string BoardCode { get; set; }

        [StringLength(255)]
        public string CmtId { get; set; }

        public string CmtContent { get; set; }

        [StringLength(255)]
        public string MemberId { get; set; }

        public DateTime? CreatedTime { get; set; }
        public DateTime? UpdatedTime { get; set; }
        public bool? IsGptAnswered { get; set; }
        public string GptAnswer { get; set; }

        [StringLength(255)]
        public string UpdatedBy { get; set; }

        public bool Flag { get; set; }

        public string JsonCanvas { get; set; }

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
    }
}
