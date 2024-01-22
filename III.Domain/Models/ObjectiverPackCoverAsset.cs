using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("OBJECTIVER_PACK_COVER_ASSET")]
    public class ObjectiverPackCoverAsset
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(100)]
        public string ObjPackCode { get; set; }

        [StringLength(100)]
        public string Name { get; set; }

        [StringLength(100)]
        public string SpecSize { get; set; }

        [StringLength(100)]
        public string Weight { get; set; }

        [StringLength(100)]
        public string Unit { get; set; }

        [StringLength(100)]
        public string Located { get; set; }

        [StringLength(100)]
        public string ParentCode { get; set; }

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
        public string ShapeData { get; set; }
    }
}
