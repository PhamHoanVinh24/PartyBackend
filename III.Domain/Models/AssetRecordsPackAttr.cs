using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("ASSET_RECORDS_PACK_ATTR")]
    public class AssetRecordsPackAttr
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }

        public string Zone { get; set; }

        public string PackAttrCode { get; set; }

        public string PackAttrName { get; set; }

        public string PackAttrValue { get; set; }

        public string PackAttrUnit { get; set; }

        public string PackAttrType { get; set; }

        public string PackAttrSize { get; set; }

        public string PackAttrGroup { get; set; }

        public string PackAttrDataType { get; set; }

        [StringLength(100)]
        public string CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }

        [StringLength(100)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        [StringLength(100)]
        public string DeletedBy { get; set; }

        public DateTime? DeletedTime { get; set; }

        public bool IsDeleted { get; set; }
    }
}
