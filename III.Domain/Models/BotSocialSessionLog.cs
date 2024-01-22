using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("BOT_SOCIAL_SESSION_LOG")]
    public class BotSocialSessionLog
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(maximumLength: 50)]
        public string BotSession { get; set; }

        public DateTime? StartTime { get; set; }

        public DateTime? EndTime { get; set; }

        [StringLength(maximumLength: 255)]
        public string Statvs { get; set; }

        [StringLength(maximumLength: 255)]
        public string BotSocialCode { get; set; }


        public string FileResults { get; set; }

        [StringLength(maximumLength: 255)]
        public string RuningType { get; set; }

        public string BotSessionResult { get; set; }

        [StringLength(maximumLength: 50)]
        public string CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }

        [StringLength(maximumLength: 50)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        public bool? IsDeleted { get; set; }


        public DateTime? DeletedTime { get; set; }


        [StringLength(maximumLength: 50)]
        public string DeletedBy { get; set; }

    }
}
