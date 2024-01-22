using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("ASSET_ATTRIBUTE")]
    public class AssetAttribute
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int AttrID { get; set; }

        [StringLength(255)]
        public string AttrCode { get; set; }

        [StringLength(255)]
        public string AttrName { get; set; }

        [StringLength(255)]
        public string AttrValue { get; set; }

        [StringLength(255)]
        public string AttrGroup { get; set; }

        [StringLength(50)]
        public string AssetCode { get; set; }

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
}
