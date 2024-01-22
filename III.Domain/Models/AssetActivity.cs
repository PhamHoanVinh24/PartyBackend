using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("ASSET_ACTIVITY")]
    public class AssetActivity
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ActivityId { get; set; }

        [StringLength(255)]
        public string ActCode { get; set; }

        [StringLength(255)]
        public string ActTitle { get; set; }

        [StringLength(50)]
        public string ActType { get; set; }

        public string ActNote { get; set; }

        public string ActMember { get; set; }

        public int? ParentCode { get; set; }

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

        [StringLength(50)]
        public string AssetCode { get; set; }
    }
}
