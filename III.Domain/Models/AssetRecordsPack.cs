using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("ASSET_RECORDS_PACK")]
    public class AssetRecordsPack
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }

        public string PackCode { get; set; }

        public string QrCode { get; set; }

        public string PackName { get; set; }

        public string PackLabel { get; set; }

        public string PackLevel { get; set; }

        public string PackParent { get; set; }

        public string PackHierarchyPath { get; set; }

        public string PackZoneLocation { get; set; }

        public string PackType { get; set; }

        public string PackGroup { get; set; }

        public string PackStatus { get; set; }

        public int PackQuantity { get; set; }


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
