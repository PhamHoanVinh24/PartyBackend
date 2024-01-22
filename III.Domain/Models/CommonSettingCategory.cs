using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("COMMON_SETTING_CATEGORY")]
    public class CommonSettingCategory
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int SettingID { get; set; }

        [StringLength(255)]
        public string CodeSet { get; set; }

        [StringLength(255)]
        public string CategoryCode { get; set; }

        public string ValueSet { get; set; }

        [StringLength(255)]
        public string Group { get; set; }

        public int Priority { get; set; }

        [StringLength(255)]
        public string Logo { get; set; }
        [StringLength(255)]
        public string Title { get; set; }
        [StringLength(50)]
        public string CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }

        [StringLength(50)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        [StringLength(50)]
        public string DeletedBy { get; set; }

        public DateTime? DeletedTime { get; set; }

        [StringLength(255)]
        public string AssetCode { get; set; }

        [StringLength(255)]
        public string GroupNote { get; set; }

        public bool IsDeleted { get; set; }
        [StringLength(255)]
        public string Type { get; set; }
    }
}
