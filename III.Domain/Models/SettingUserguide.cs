using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;

namespace ESEIM.Models
{
    [Table("SETTING_USERGUIDE")]
    public class SettingUserguide
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string HelpId { get; set; }

        [StringLength(255)]
        public string ArticleId { get; set; }

        [StringLength(255)]
        public string BookMark { get; set; }

        public string Description { get; set; }

        [StringLength(50)]
        public string CreatedBy { get; set; }


        public DateTime CreatedTime { get; set; }

        [StringLength(50)]
        public string UpdatedBy { get; set; }


        public DateTime? UpdatedTime { get; set; }

        [StringLength(50)]
        public string DeletedBy { get; set; }


        public DateTime? DeletedTime { get; set; }

        public bool IsDeleted { get; set; }
    }
}