using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("ASSET_TYPE")]
    public class AssetType
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(100)]
        public string CatCode { get; set; }
        [StringLength(255)]
        public string CatName { get; set; }

        public int? CatParent { get; set; }
        [StringLength(100)]
        public string CatType { get; set; }
        [MaxLength]
        public string Note { get; set; }
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
