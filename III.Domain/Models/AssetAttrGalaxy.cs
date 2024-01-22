using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("ASSET_ATTR_GALAXY")]
    public class AssetAttrGalaxy
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string AssetCode { get; set; }

        [StringLength(255)]
        public string AttrCode { get; set; }

        [StringLength(255)]
        public string AttrValue { get; set; }

        [StringLength(50)]
        public string CreatedBy { get; set; }

        [StringLength(50)]
        public string UpdatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }
        public DateTime? UpdatedTime { get; set; }

        [StringLength(50)]
        public string DeletedBy { get; set; }

        public DateTime? DeletedTime { get; set; }

        public bool IsDeleted { get; set; }
    }

    public class AssetAttrGalaxyEx
    {
        public int Id { get; set; }
        public string AssetCode { get; set; }
        public string AttrCode { get; set; }
        public string AttrValue { get; set; }
    }
}
