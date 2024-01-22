using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("BOT_SOCIAL_MANAGEMENT")]
    public class BotSocialManagement
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(maximumLength: 50)]
        public string BotSocialCode { get; set; }
        
        public string BotSocialName { get; set; }
        [StringLength(maximumLength: 255)]
        public string BotSocialType { get; set; }

        [StringLength(maximumLength: 255)]
        public string UserName { get; set; }

        [StringLength(maximumLength: 255)]
        public string PassWord { get; set; }

      
        public string Credential { get; set; }


        public string Tocken { get; set; }

        public string ConditionStatement { get; set; }

        [StringLength(maximumLength: 255)]
        public string Description { get; set; }

        [StringLength(maximumLength: 50)]
        public string CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }

        [StringLength(maximumLength: 50)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        public Boolean IsDeleted { get; set; }


        public DateTime? DeletedTime { get; set; }


        [StringLength(maximumLength: 50)]
        public string DeletedBy { get; set; }

    }
}
