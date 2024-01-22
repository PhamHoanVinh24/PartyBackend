using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("COMMON_SETTING_GROUP")]
    public class CommonSettingGroup
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }

        [StringLength(50)]
        public string GroupCode { get; set; }

        [StringLength(50)]
        public string GroupName { get; set; }
    }
}
