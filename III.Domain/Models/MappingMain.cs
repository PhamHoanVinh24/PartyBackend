using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("MAPPING_MAIN")]
    public class MappingMain
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(100)]
        public string ObjRootCode { get; set; }

        [StringLength(100)]
        public string ObjRootType { get; set; }

        [StringLength(100)]
        public string ObjType { get; set; }

        [StringLength(100)]
        public string ObjCode { get; set; }

        [StringLength(100)]
        public string ObjRelative { get; set; }

        [StringLength(255)]
        public string ObjNote { get; set; }

        [StringLength(50)]
        public string CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }

        [StringLength(50)]
        public string UpdatedBy { get; set; }
        public DateTime? UpdatedTime { get; set; }
    }
}