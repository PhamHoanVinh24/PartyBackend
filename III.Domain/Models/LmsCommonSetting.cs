
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("lms_common_setting_cat")]
    public class LmsCommonSetting
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string AttrCode { get; set; }

        [StringLength(255)]
        public string AttrName { get; set; }

        [StringLength(255)]
        public string AttrNote { get; set; }

        [StringLength(255)]
        public string Type { get; set; }

        [StringLength(255)]
        public string DataType { get; set; }

        [StringLength(255)]
        public string CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }

        [StringLength(50)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }
        public int? Flag { get; set; }
        public int? Order { get; set; }
        public int? Group { get; set; }

    }

}
